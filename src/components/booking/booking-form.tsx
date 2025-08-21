'use client';

import { useState } from 'react';
import { Minus, Plus, User01, Mail01, Phone01 } from "@untitledui/icons";
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { cx } from "@/utils/cx";

interface Event {
  id: string;
  title: string;
  base_price: number | null;
  currency: string | null;
  max_tickets_per_user: number | null;
}

interface BookingFormProps {
  event: Event;
  onSubmit: (data: BookingData) => void;
  maxTickets?: number;
  className?: string;
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

export function BookingForm({ 
  event, 
  onSubmit, 
  maxTickets, 
  className 
}: BookingFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [attendeeInfo, setAttendeeInfo] = useState({
    names: [''],
    emails: [''],
    phones: ['']
  });
  const [specialRequests, setSpecialRequests] = useState('');
  const [promotionalCode, setPromotionalCode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const maxAllowed = Math.min(
    event.max_tickets_per_user || 10,
    maxTickets || event.max_tickets_per_user || 10
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: event.currency || 'INR',
    }).format(price);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > maxAllowed) return;
    
    setQuantity(newQuantity);
    
    // Adjust attendee info arrays
    const newAttendeeInfo = {
      names: Array(newQuantity).fill('').map((_, i) => attendeeInfo.names[i] || ''),
      emails: Array(newQuantity).fill('').map((_, i) => attendeeInfo.emails[i] || ''),
      phones: Array(newQuantity).fill('').map((_, i) => attendeeInfo.phones[i] || '')
    };
    
    setAttendeeInfo(newAttendeeInfo);
  };

  const handleAttendeeInfoChange = (
    index: number, 
    field: keyof typeof attendeeInfo, 
    value: string
  ) => {
    setAttendeeInfo(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate attendee information
    for (let i = 0; i < quantity; i++) {
      if (!attendeeInfo.names[i]?.trim()) {
        newErrors[`name_${i}`] = 'Name is required';
      }
      if (!attendeeInfo.emails[i]?.trim()) {
        newErrors[`email_${i}`] = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(attendeeInfo.emails[i])) {
        newErrors[`email_${i}`] = 'Invalid email format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const bookingData: BookingData = {
      quantity,
      attendeeInfo: {
        names: attendeeInfo.names.slice(0, quantity),
        emails: attendeeInfo.emails.slice(0, quantity),
        phones: attendeeInfo.phones.slice(0, quantity)
      },
      specialRequests,
      promotionalCode
    };

    onSubmit(bookingData);
  };

  const subtotal = (event.base_price || 0) * quantity;
  const fees = Math.round(subtotal * 0.03); // 3% platform fee
  const total = subtotal + fees;

  return (
    <div className={cx("max-w-2xl mx-auto", className)}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quantity Selection */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Tickets</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{event.title}</p>
              <p className="text-sm text-gray-600">
                {formatPrice(event.base_price || 0)} per ticket
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                type="button"
                color="secondary"
                size="sm"
                iconLeading={Minus}
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              />
              <span className="font-medium text-lg w-8 text-center">{quantity}</span>
              <Button
                type="button"
                color="secondary"
                size="sm"
                iconLeading={Plus}
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= maxAllowed}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Maximum {maxAllowed} tickets per booking
          </p>
        </div>

        {/* Attendee Information */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendee Information</h3>
          <div className="space-y-6">
            {Array.from({ length: quantity }, (_, index) => (
              <div key={index} className="space-y-4">
                <h4 className="font-medium text-gray-800">
                  Attendee {index + 1} {index === 0 && "(Primary)"}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Full Name"
                      placeholder="Enter full name"
                      value={attendeeInfo.names[index] || ''}
                      onChange={(value) => handleAttendeeInfoChange(index, 'names', value)}
                      isRequired
                      icon={User01}
                    />
                  </div>
                  
                  <div>
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="Enter email address"
                      value={attendeeInfo.emails[index] || ''}
                      onChange={(value) => handleAttendeeInfoChange(index, 'emails', value)}
                      isRequired
                      icon={Mail01}
                    />
                  </div>
                </div>
                
                <div>
                  <Input
                    label="Phone Number (Optional)"
                    placeholder="Enter phone number"
                    value={attendeeInfo.phones[index] || ''}
                    onChange={(value) => handleAttendeeInfoChange(index, 'phones', value)}
                    icon={Phone01}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
          
          <div className="space-y-4">
            <div>
              <Input
                label="Promotional Code (Optional)"
                placeholder="Enter promotional code"
                value={promotionalCode}
                onChange={(value) => setPromotionalCode(value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests (Optional)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={3}
                placeholder="Any special requirements or requests..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tickets ({quantity}x)</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Platform fees</span>
              <span>{formatPrice(fees)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-primary-600">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center space-x-4">
          <Button
            type="submit"
            size="lg"
            className="flex-1"
          >
            Proceed to Payment
          </Button>
          <Button
            type="button"
            color="secondary"
            size="lg"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}