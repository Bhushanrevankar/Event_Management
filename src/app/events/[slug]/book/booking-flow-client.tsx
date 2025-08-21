'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowLeft } from "@untitledui/icons";
import { createClient } from '@/lib/supabase/client';
import { BookingForm } from '@/components/booking/booking-form';
import { Button } from '@/components/base/buttons/button';
import { LoadingIndicator } from '@/components/application/loading-indicator/loading-indicator';

interface Event {
  id: string;
  title: string;
  description: string | null;
  featured_image_url: string | null;
  start_date: string;
  end_date: string;
  venue_name: string;
  venue_address: string;
  base_price: number;
  currency: string;
  max_tickets_per_user: number;
  category: {
    name: string;
    color_hex: string;
  };
  organizer: {
    full_name: string;
    avatar_url: string;
    email: string;
  };
}

interface User {
  id: string;
  email: string | undefined;
  user_metadata?: {
    full_name?: string;
  };
}

interface BookingData {
  quantity: number;
  attendeeInfo: {
    names: string[];
    emails: string[];
    phones: string[];
  };
  specialRequests: string;
  promotionalCode: string;
}

interface Props {
  event: Event;
  user: User;
  availableSeats: number;
}

type BookingStep = 'booking' | 'payment' | 'confirmation';

export function BookingFlowClient({ event, user, availableSeats }: Props) {
  const [step, setStep] = useState<BookingStep>('booking');
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingReference, setBookingReference] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: event.currency || 'INR',
    }).format(price);
  };

  const handleBookingSubmit = async (data: BookingData) => {
    setLoading(true);
    setBookingData(data);
    setError('');

    try {
      const supabase = createClient();
      const subtotal = event.base_price * data.quantity;
      const fees = Math.round(subtotal * 0.03);
      const total = subtotal + fees;

      // Create booking in database
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert([
          {
            event_id: event.id,
            user_id: user.id,
            quantity: data.quantity,
            total_amount: total,
            status: 'pending',
            special_requests: data.specialRequests || null,
            promotional_code: data.promotionalCode || null,
            attendee_names: data.attendeeInfo.names,
            attendee_emails: data.attendeeInfo.emails,
            attendee_phones: data.attendeeInfo.phones
          }
        ])
        .select()
        .single();

      if (bookingError) {
        throw new Error(bookingError.message);
      }

      setBookingReference(booking.booking_reference);
      setStep('payment');
    } catch (error: any) {
      console.error('Booking error:', error);
      setError(error.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setLoading(true);
    setError('');
    
    try {
      const supabase = createClient();

      // Update booking status to confirmed
      const { error: bookingUpdateError } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('booking_reference', bookingReference);

      if (bookingUpdateError) {
        throw new Error(bookingUpdateError.message);
      }

      // Create individual tickets for each attendee
      if (bookingData) {
        const ticketInserts = [];
        for (let i = 0; i < bookingData.quantity; i++) {
          ticketInserts.push({
            booking_id: bookingReference, // This should be the actual booking ID
            event_id: event.id,
            attendee_name: bookingData.attendeeInfo.names[i] || 'Guest',
            attendee_email: bookingData.attendeeInfo.emails[i] || user.email || '',
            status: 'active'
          });
        }

        const { error: ticketsError } = await supabase
          .from('tickets')
          .insert(ticketInserts);

        if (ticketsError) {
          console.error('Error creating tickets:', ticketsError);
          // Don't throw error as booking is already confirmed
        }
      }

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([
          {
            booking_reference: bookingReference,
            amount: calculateTotal(),
            currency: event.currency || 'INR',
            status: 'completed',
            payment_method: 'mock_payment', // In production, use actual payment method
            transaction_id: 'TXN_' + Date.now()
          }
        ]);

      if (paymentError) {
        console.error('Error creating payment record:', paymentError);
        // Don't throw error as booking is already confirmed
      }
      
      setStep('confirmation');
    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment processing failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!bookingData) return 0;
    const subtotal = event.base_price * bookingData.quantity;
    const fees = Math.round(subtotal * 0.03);
    return subtotal + fees;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingIndicator />
          <p className="mt-4 text-gray-600">
            {step === 'booking' && 'Creating your booking...'}
            {step === 'payment' && 'Processing payment...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <div className="flex items-center space-x-4 mb-4">
            <Button
              color="tertiary"
              iconLeading={ArrowLeft}
              onClick={() => {
                if (step === 'booking') {
                  window.history.back();
                } else {
                  setStep('booking');
                }
              }}
            >
              Back
            </Button>
            <div className="flex-1">
              <div className="flex items-center space-x-8">
                <div className={`flex items-center space-x-2 ${step === 'booking' ? 'text-primary-600' : 'text-green-600'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === 'booking' ? 'bg-primary-600 text-white' : 'bg-green-600 text-white'
                  }`}>
                    {step === 'booking' ? '1' : <CheckCircle className="w-5 h-5" />}
                  </div>
                  <span className="font-medium">Booking Details</span>
                </div>
                
                <div className={`flex items-center space-x-2 ${
                  step === 'payment' ? 'text-primary-600' : 
                  step === 'confirmation' ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === 'payment' ? 'bg-primary-600 text-white' :
                    step === 'confirmation' ? 'bg-green-600 text-white' :
                    'bg-gray-300 text-gray-600'
                  }`}>
                    {step === 'confirmation' ? <CheckCircle className="w-5 h-5" /> : '2'}
                  </div>
                  <span className="font-medium">Payment</span>
                </div>
                
                <div className={`flex items-center space-x-2 ${
                  step === 'confirmation' ? 'text-primary-600' : 'text-gray-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === 'confirmation' ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    3
                  </div>
                  <span className="font-medium">Confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {step === 'booking' && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Tickets</h1>
              <p className="text-gray-600">Complete your booking for {event.title}</p>
            </div>

            <BookingForm
              event={event}
              maxTickets={Math.min(event.max_tickets_per_user, availableSeats)}
              onSubmit={handleBookingSubmit}
            />
          </div>
        )}

        {step === 'payment' && bookingData && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Payment</h1>
              <p className="text-gray-600">Review your booking and proceed with payment</p>
            </div>

            {/* Booking Summary */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  {event.featured_image_url ? (
                    <img 
                      src={event.featured_image_url} 
                      alt={event.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No image</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <p className="text-sm text-gray-600">{formatDate(event.start_date)}</p>
                    <p className="text-sm text-gray-600">{event.venue_name}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Tickets ({bookingData.quantity}x)</span>
                    <span>{formatPrice(event.base_price * bookingData.quantity)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Platform fees</span>
                    <span>{formatPrice(Math.round(event.base_price * bookingData.quantity * 0.03))}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2">
                    <span>Total</span>
                    <span className="text-primary-600">{formatPrice(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mock Payment Interface */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <input type="radio" name="payment" defaultChecked className="text-primary-600" />
                    <div className="flex-1">
                      <p className="font-medium">Credit/Debit Card</p>
                      <p className="text-sm text-gray-600">Secure payment via Razorpay</p>
                    </div>
                    <div className="flex space-x-2">
                      <img src="https://via.placeholder.com/40x25/4285f4/ffffff?text=VISA" alt="Visa" className="h-6" />
                      <img src="https://via.placeholder.com/40x25/eb001b/ffffff?text=MC" alt="Mastercard" className="h-6" />
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <input type="radio" name="payment" className="text-primary-600" />
                    <div className="flex-1">
                      <p className="font-medium">UPI</p>
                      <p className="text-sm text-gray-600">Pay using Google Pay, PhonePe, Paytm</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                color="secondary"
                size="lg"
                className="flex-1"
                onClick={() => setStep('booking')}
              >
                Back to Booking
              </Button>
              <Button
                size="lg"
                className="flex-1"
                onClick={handlePaymentSuccess}
              >
                Pay {formatPrice(calculateTotal())}
              </Button>
            </div>
          </div>
        )}

        {step === 'confirmation' && bookingData && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-green-600 mb-2">Booking Confirmed!</h1>
              <p className="text-gray-600">Your tickets have been booked successfully</p>
            </div>

            {/* Booking Details */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Booking Reference</p>
                  <p className="text-2xl font-mono font-bold text-gray-900">{bookingReference}</p>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Event</p>
                      <p className="font-medium">{event.title}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Date & Time</p>
                      <p className="font-medium">{formatDate(event.start_date)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tickets</p>
                      <p className="font-medium">{bookingData.quantity} ticket(s)</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Paid</p>
                      <p className="font-medium">{formatPrice(calculateTotal())}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>You will receive a confirmation email with your tickets</li>
                <li>Your tickets will include QR codes for easy entry</li>
                <li>Please arrive 30 minutes before the event starts</li>
                <li>Bring a valid ID that matches your booking details</li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <Button
                color="secondary"
                className="flex-1"
                href="/dashboard/attendee/bookings"
              >
                View My Bookings
              </Button>
              <Button
                className="flex-1"
                onClick={() => alert('Download tickets feature coming soon!')}
              >
                Download Tickets
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}