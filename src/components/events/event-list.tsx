'use client';

import { EventCard } from "./event-card";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { PaginationPageDefault } from "@/components/application/pagination/pagination";

interface Event {
  id: string;
  title: string;
  description: string;
  featured_image_url: string;
  start_date: string;
  venue_name: string;
  base_price: number;
  currency: string;
  is_featured?: boolean;
  slug: string;
  category?: {
    name: string;
    color_hex: string;
  };
  organizer?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface PaginationInfo {
  page: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface EventListProps {
  events: Event[];
  loading?: boolean;
  error?: string | null;
  pagination?: PaginationInfo | null;
  onEventClick?: (event: Event) => void;
  onPageChange?: (page: number) => void;
}

export function EventList({ 
  events, 
  loading = false, 
  error = null, 
  pagination = null,
  onEventClick,
  onPageChange 
}: EventListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingIndicator />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">Error loading events</div>
        <div className="text-sm text-gray-600">{error}</div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <EmptyState>
        <EmptyState.Header>
          <EmptyState.FeaturedIcon color="gray" />
        </EmptyState.Header>
        <EmptyState.Content>
          <EmptyState.Title>No events found</EmptyState.Title>
          <EmptyState.Description>
            Try adjusting your search criteria or check back later for new events.
          </EmptyState.Description>
        </EmptyState.Content>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-6">
      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onClick={() => onEventClick?.(event)}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <PaginationPageDefault
            page={pagination.page}
            total={pagination.totalPages}
            onPageChange={onPageChange}
            className="justify-center"
          />
        </div>
      )}
    </div>
  );
}