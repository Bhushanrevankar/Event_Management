'use client'

import { Ticket02, Calendar, CurrencyRupee, Plus, ArrowRight, Star01 } from "@untitledui/icons"
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCard } from '@/components/dashboard/stats-card'
import { BookingCard } from '@/components/booking/booking-card'
import { Button } from '@/components/base/buttons/button'
import { Avatar } from '@/components/base/avatar/avatar'
import { Badge } from '@/components/base/badges/badges'
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icons'
import type { Tables } from '@/lib/supabase/database.types'
import type { User } from '@supabase/supabase-js'

type Booking = Tables<'bookings'> & {
  events: Tables<'events'> | null
}

interface Props {
  bookings: Booking[]
  stats: {
    totalBookings: number
    upcomingEvents: number
    totalSpent: number
  }
  user: User
}

export function AttendeeDashboardClient({ bookings, stats, user }: Props) {
  const handleViewDetails = (bookingId: string) => {
    alert(`View details for booking ${bookingId} - Feature coming soon!`)
  }

  const handleDownloadTicket = (bookingId: string) => {
    alert(`Download ticket for booking ${bookingId} - Feature coming soon!`)
  }

  // Transform bookings for BookingCard component
  const transformedBookings = bookings.slice(0, 5).map(booking => ({
    id: booking.id,
    booking_reference: booking.booking_reference,
    quantity: booking.quantity,
    total_amount: booking.total_amount,
    status: booking.status as 'confirmed' | 'pending' | 'cancelled',
    created_at: booking.created_at || new Date().toISOString(),
    event: booking.events ? {
      title: booking.events.title,
      featured_image_url: booking.events.featured_image_url,
      start_date: booking.events.start_date,
      venue_name: booking.events.venue_name
    } : null
  }))

  return (
    <DashboardLayout sidebar="attendee">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar 
                src={user.user_metadata?.avatar_url || ''} 
                initials={(user.user_metadata?.full_name || user.email || 'User').charAt(0).toUpperCase()}
                size="lg"
              />
              <div>
                <h1 className="text-display-md font-bold text-gray-900">
                  Welcome back, {user.user_metadata?.full_name?.split(' ')[0] || 'there'}! 🎉
                </h1>
                <p className="text-gray-600">Here's what's happening with your events</p>
              </div>
            </div>
            <Button iconLeading={Plus} href="/events">
              Find Events
            </Button>
          </div>
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
            color="primary"
          />
          <StatsCard
            title="Total Spent"
            value={`₹${stats.totalSpent.toLocaleString()}`}
            icon={CurrencyRupee}
            color="primary"
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

          {transformedBookings.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 text-center py-16">
              <FeaturedIcon color="gray" theme="modern" size="xl" className="mx-auto mb-4">
                <Ticket02 className="w-8 h-8" />
              </FeaturedIcon>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Start your event journey! Discover amazing experiences and book your first event.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" href="/events" iconTrailing={ArrowRight}>
                  Browse Events
                </Button>
                <Button size="lg" color="secondary" href="/events?featured=true">
                  <Star01 className="w-4 h-4 mr-2" />
                  Featured Events
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {transformedBookings.map((booking) => (
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
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-6 rounded-xl border border-primary-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-600">Get started with these popular actions</p>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group">
              <Button
                color="tertiary"
                size="sm"
                href="/events"
                className="w-full flex flex-col items-center py-3 group-hover:text-primary-600"
              >
                <FeaturedIcon color="gray" theme="modern" size="sm" className="mb-2">
                  <Calendar className="w-4 h-4" />
                </FeaturedIcon>
                <span className="text-xs font-medium">Browse Events</span>
              </Button>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group">
              <Button
                color="tertiary"
                size="sm"
                href="/dashboard/attendee/bookings"
                className="w-full flex flex-col items-center py-3 group-hover:text-primary-600"
              >
                <FeaturedIcon color="gray" theme="modern" size="sm" className="mb-2">
                  <Ticket02 className="w-4 h-4" />
                </FeaturedIcon>
                <span className="text-xs font-medium">My Tickets</span>
              </Button>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group">
              <Button
                color="tertiary"
                size="sm"
                href="/dashboard/attendee/profile"
                className="w-full flex flex-col items-center py-3 group-hover:text-primary-600"
              >
                <FeaturedIcon color="gray" theme="modern" size="sm" className="mb-2">
                  <span className="w-4 h-4 text-xs flex items-center justify-center bg-primary-100 rounded text-primary-600 font-medium">👤</span>
                </FeaturedIcon>
                <span className="text-xs font-medium">Edit Profile</span>
              </Button>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group">
              <Button
                color="tertiary"
                size="sm"
onClick={() => alert('Feature coming soon!')}
                className="w-full flex flex-col items-center py-3 group-hover:text-primary-600"
              >
                <FeaturedIcon color="gray" theme="modern" size="sm" className="mb-2">
                  <span className="w-4 h-4 text-xs">🎨</span>
                </FeaturedIcon>
                <span className="text-xs font-medium">Get Help</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}