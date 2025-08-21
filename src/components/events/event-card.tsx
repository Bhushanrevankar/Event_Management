'use client';

import { Calendar, MarkerPin01, User01 } from "@untitledui/icons";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Avatar } from "@/components/base/avatar/avatar";
import { cx } from "@/utils/cx";

interface Event {
  id: string;
  title: string;
  description: string | null;
  featured_image_url: string | null;
  start_date: string;
  venue_name: string;
  base_price: number | null;
  currency: string | null;
  is_featured?: boolean | null;
  slug: string | null;
  category?: {
    name: string;
    color_hex: string;
  } | null;
  organizer?: {
    full_name: string | null;
    avatar_url?: string | null;
  } | null;
}

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'featured';
  onClick?: () => void;
  className?: string;
}

export function EventCard({ event, variant = 'default', onClick, className }: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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

  return (
    <div 
      className={cx(
        "bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden",
        variant === 'featured' && "ring-2 ring-primary-500",
        className
      )}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-video w-full">
        {event.featured_image_url ? (
          <img 
            src={event.featured_image_url} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">No image</span>
          </div>
        )}
        {event.is_featured && (
          <Badge 
            type="pill-color" 
            color="brand"
            className="absolute top-3 left-3"
          >
            Featured
          </Badge>
        )}
        {event.category && (
          <Badge 
            type="pill-color"
            color="gray"
            className="absolute top-3 right-3"
          >
            {event.category.name}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {event.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {event.description || 'No description available'}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            {formatDate(event.start_date)}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MarkerPin01 className="w-4 h-4 mr-2" />
            {event.venue_name}
          </div>
          {event.organizer && event.organizer.full_name && (
            <div className="flex items-center text-sm text-gray-600">
              <User01 className="w-4 h-4 mr-2" />
              {event.organizer.full_name}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-primary-600">
              {formatPrice(event.base_price || 0, event.currency || 'INR')}
            </span>
            {event.base_price && event.base_price > 0 && (
              <span className="text-sm text-gray-500 ml-1">per ticket</span>
            )}
          </div>
          
          <Button size="sm" color="secondary">
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}