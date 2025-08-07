'use client';

import { Calendar, MarkerPin01, Download01, Eye } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";

interface Booking {
  id: string;
  booking_reference: string;
  quantity: number;
  total_amount: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  created_at: string;
  event: {
    title: string;
    featured_image_url?: string;
    start_date: string;
    venue_name: string;
  };
}

interface BookingCardProps {
  booking: Booking;
  onViewDetails?: () => void;
  onDownloadTicket?: () => void;
  className?: string;
}

const statusColors = {
  confirmed: 'success',
  pending: 'warning',
  cancelled: 'error'
} as const;

export function BookingCard({ 
  booking, 
  onViewDetails, 
  onDownloadTicket,
  className 
}: BookingCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className={cx(
      "bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow",
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          {booking.event.featured_image_url && (
            <img 
              src={booking.event.featured_image_url} 
              alt={booking.event.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              {booking.event.title}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Booking #{booking.booking_reference}
            </p>
            <div className="flex items-center text-sm text-gray-500 space-x-4">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(booking.event.start_date)}
              </div>
              <div className="flex items-center">
                <MarkerPin01 className="w-4 h-4 mr-1" />
                {booking.event.venue_name}
              </div>
            </div>
          </div>
        </div>
        
        <Badge
          type="pill-color"
          color={statusColors[booking.status]}
        >
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{booking.quantity} ticket(s)</span>
          <span className="mx-2">•</span>
          <span className="font-bold text-gray-900">
            {formatPrice(booking.total_amount)}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {onViewDetails && (
            <Button
              size="sm"
              color="secondary"
              iconLeading={Eye}
              onClick={onViewDetails}
            >
              Details
            </Button>
          )}
          {booking.status === 'confirmed' && onDownloadTicket && (
            <Button
              size="sm"
              iconLeading={Download01}
              onClick={onDownloadTicket}
            >
              Download
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}