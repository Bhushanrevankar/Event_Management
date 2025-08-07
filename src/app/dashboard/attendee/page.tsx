'use client';

import { useState } from 'react';
import { Ticket02, Calendar, CurrencyRupee } from "@untitledui/icons";
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatsCard } from '@/components/dashboard/stats-card';
import { BookingCard } from '@/components/booking/booking-card';
import { Button } from '@/components/base/buttons/button';

export default function AttendeeDashboard() {
  // Mock data - in production, this would come from Supabase
  const [stats] = useState({
    totalBookings: 12,
    upcomingEvents: 3,
    totalSpent: 15750
  });

  const [recentBookings] = useState([
    {
      id: '1',
      booking_reference: 'BK123456789',
      quantity: 2,
      total_amount: 5000,
      status: 'confirmed' as const,
      created_at: '2024-02-15T10:30:00Z',
      event: {
        title: 'Tech Conference 2024',
        featured_image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&h=200&fit=crop',
        start_date: '2024-03-15T10:00:00Z',
        venue_name: 'Convention Center, Mumbai'
      }
    },
    {
      id: '2',
      booking_reference: 'BK123456790',
      quantity: 1,
      total_amount: 800,
      status: 'confirmed' as const,
      created_at: '2024-02-10T14:20:00Z',
      event: {
        title: 'Classical Music Evening',
        featured_image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop',
        start_date: '2024-03-20T19:00:00Z',
        venue_name: 'Music Hall, Delhi'
      }
    },
    {
      id: '3',
      booking_reference: 'BK123456791',
      quantity: 1,
      total_amount: 0,
      status: 'pending' as const,
      created_at: '2024-02-08T09:15:00Z',
      event: {
        title: 'Startup Pitch Competition',
        featured_image_url: 'https://images.unsplash.com/photo-1559223607-b4d0555ae227?w=200&h=200&fit=crop',
        start_date: '2024-03-25T14:00:00Z',
        venue_name: 'Innovation Hub, Bangalore'
      }
    }
  ]);

  const handleViewDetails = (bookingId: string) => {
    alert(`View details for booking ${bookingId} - Feature coming soon!`);
  };

  const handleDownloadTicket = (bookingId: string) => {
    alert(`Download ticket for booking ${bookingId} - Feature coming soon!`);
  };

  return (
    <DashboardLayout sidebar="attendee">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-display-md font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your event activity.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={Ticket02}
            color="primary"
          />
          <StatsCard
            title="Upcoming Events"
            value={stats.upcomingEvents}
            icon={Calendar}
            color="success"
          />
          <StatsCard
            title="Total Spent"
            value={`₹${stats.totalSpent.toLocaleString()}`}
            icon={CurrencyRupee}
            color="warning"
          />
        </div>

        {/* Recent Bookings */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
            <Button color="secondary" href="/dashboard/attendee/bookings">
              View All Bookings
            </Button>
          </div>

          {recentBookings.length === 0 ? (
            <div className="text-center py-12">
              <Ticket02 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start by exploring events and making your first booking.
              </p>
              <div className="mt-6">
                <Button href="/events">
                  Browse Events
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onViewDetails={() => handleViewDetails(booking.id)}
                  onDownloadTicket={() => handleDownloadTicket(booking.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              color="secondary"
              size="lg"
              href="/events"
              className="flex flex-col h-20 justify-center"
            >
              <Calendar className="w-5 h-5 mb-1" />
              Browse Events
            </Button>
            <Button
              color="secondary"
              size="lg"
              href="/dashboard/attendee/bookings"
              className="flex flex-col h-20 justify-center"
            >
              <Ticket02 className="w-5 h-5 mb-1" />
              My Tickets
            </Button>
            <Button
              color="secondary"
              size="lg"
              href="/dashboard/attendee/profile"
              className="flex flex-col h-20 justify-center"
            >
              <Ticket02 className="w-5 h-5 mb-1" />
              Edit Profile
            </Button>
            <Button
              color="secondary"
              size="lg"
              onClick={() => alert('Feature coming soon!')}
              className="flex flex-col h-20 justify-center"
            >
              <Ticket02 className="w-5 h-5 mb-1" />
              Help & Support
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}