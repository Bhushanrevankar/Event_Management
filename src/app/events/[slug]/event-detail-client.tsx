'use client';

import { Calendar, MarkerPin01, Clock, Users01, Ticket02 } from "@untitledui/icons";
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { Avatar } from '@/components/base/avatar/avatar';

interface Event {
  id: string;
  title: string;
  description: string | null;
  featured_image_url: string | null;
  start_date: string;
  end_date: string;
  venue_name: string;
  venue_address: string;
  base_price: number | null;
  currency: string | null;
  is_featured: boolean | null;
  slug: string | null;
  total_capacity: number;
  max_tickets_per_user: number | null;
  age_restriction?: number | null;
  category: {
    name: string;
    color_hex: string;
  } | null;
  organizer: {
    full_name: string | null;
    avatar_url: string | null;
    email: string;
  } | null;
}

interface Props {
  event: Event;
  availableSeats: number;
}

export function EventDetailClient({ event, availableSeats }: Props) {

  const formatDate = (dateString: string, format: 'full' | 'date' | 'time' = 'date') => {
    const date = new Date(dateString);
    if (format === 'full') {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      });
    }
    if (format === 'time') {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
    }).format(price);
  };

  const handleBooking = () => {
    // Navigate to the booking page
    window.location.href = `/events/${event.slug}/book`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Event Details */}
        <div className="lg:col-span-2">
          {/* Hero Image */}
          <div className="relative aspect-video rounded-lg overflow-hidden mb-6">
            {event.featured_image_url ? (
              <img 
                src={event.featured_image_url} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
          </div>

          {/* Event Info */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              {event.category && (
                <Badge 
                  type="pill-color"
                  color="brand"
                >
                  {event.category.name}
                </Badge>
              )}
              <span className="text-sm text-gray-500">
                {formatDate(event.start_date)}
              </span>
            </div>

            <h1 className="text-display-lg font-bold mb-4">
              {event.title}
            </h1>

            {event.organizer && (
              <div className="flex items-center mb-6">
                <Avatar 
                  src={event.organizer.avatar_url}
                  initials={event.organizer.full_name?.charAt(0) || 'O'}
                  size="md"
                />
                <div className="ml-3">
                  <p className="font-medium">{event.organizer.full_name}</p>
                  <p className="text-sm text-gray-600">Event Organizer</p>
                </div>
              </div>
            )}

            <div className="prose max-w-none text-gray-700">
              <p>{event.description || 'No description available'}</p>
            </div>
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Calendar className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="font-semibold">Date & Time</h3>
              </div>
              <p className="text-sm">{formatDate(event.start_date, 'full')}</p>
              <p className="text-sm text-gray-600">
                {formatDate(event.start_date, 'time')} - {formatDate(event.end_date, 'time')}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <MarkerPin01 className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="font-semibold">Location</h3>
              </div>
              <p className="text-sm font-medium">{event.venue_name}</p>
              <p className="text-sm text-gray-600">{event.venue_address}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Ticket02 className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="font-semibold">Tickets</h3>
              </div>
              <p className="text-lg font-bold text-primary-600">
                {formatPrice(event.base_price || 0, event.currency || 'INR')}
              </p>
              <p className="text-sm text-gray-600">
                {availableSeats} of {event.total_capacity} available
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Users01 className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="font-semibold">Additional Info</h3>
              </div>
              {event.age_restriction && (
                <p className="text-sm">Age restriction: {event.age_restriction}+</p>
              )}
              <p className="text-sm">Max {event.max_tickets_per_user} tickets per person</p>
            </div>
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-center mb-6">
              <p className="text-3xl font-bold text-primary-600">
                {formatPrice(event.base_price || 0, event.currency || 'INR')}
              </p>
              {event.base_price && event.base_price > 0 && (
                <p className="text-sm text-gray-600">per ticket</p>
              )}
            </div>

            <Button
              size="lg"
              className="w-full mb-6"
              onClick={handleBooking}
              disabled={availableSeats === 0}
            >
              {availableSeats === 0 ? 'Sold Out' : 'Book Now'}
            </Button>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-500 mr-3 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <span>Instant confirmation</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-500 mr-3 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <span>Mobile tickets</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-500 mr-3 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <span>Free cancellation until 24h before</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Available seats:</span>
                <span className="font-medium">{availableSeats}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-gray-600">Total capacity:</span>
                <span className="font-medium">{event.total_capacity}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}