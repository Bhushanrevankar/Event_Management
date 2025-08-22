'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, MarkerPin01, Users01, CurrencyRupee, Edit3, Trash2, Eye, BarChart4 } from '@untitledui/icons'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/base/buttons/button'
import { Badge } from '@/components/base/badges/badges'
import { StatsCard } from '@/components/dashboard/stats-card'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/lib/supabase/database.types'
import type { User } from '@supabase/supabase-js'

type EventWithBookings = Tables<'events'> & {
  bookings?: Array<{
    id: string
    booking_reference: string
    quantity: number
    total_amount: number
    status: string
    payment_status: string
    created_at: string
    user_id: string
    profiles: {
      full_name: string | null
      email: string
    }
  }>
}

interface Props {
  event: EventWithBookings
  categories: Tables<'event_categories'>[]
  user: User
}

export function EventDetailClient({ event, categories, user }: Props) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const confirmedBookings = event.bookings?.filter(booking => booking.status === 'confirmed') || []
  const totalBookings = confirmedBookings.reduce((sum, booking) => sum + booking.quantity, 0)
  const totalRevenue = confirmedBookings.reduce((sum, booking) => sum + booking.total_amount, 0)
  const occupancyRate = Math.round((totalBookings / event.total_capacity) * 100)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id)

      if (error) {
        console.error('Error deleting event:', error)
        alert('Failed to delete event. Please try again.')
        return
      }

      router.push('/dashboard/organizer/events')
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Failed to delete event. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleTogglePublish = async () => {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('events')
        .update({ 
          is_published: !event.is_published,
          status: !event.is_published ? 'published' : 'draft'
        })
        .eq('id', event.id)

      if (error) {
        console.error('Error updating event:', error)
        alert('Failed to update event. Please try again.')
        return
      }

      router.refresh()
    } catch (error) {
      console.error('Error updating event:', error)
      alert('Failed to update event. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'success'
      case 'draft':
        return 'warning'
      case 'cancelled':
        return 'error'
      case 'completed':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  return (
    <DashboardLayout sidebar="organizer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-display-md font-bold text-gray-900">{event.title}</h1>
              <Badge
                type="pill-color"
                color={getStatusColor(event.status || 'draft')}
              >
                {event.status || 'draft'}
              </Badge>
              {event.is_featured && (
                <Badge type="pill-color" color="brand">
                  Featured
                </Badge>
              )}
            </div>
            <p className="text-gray-600 mt-1">{event.short_description}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              color="secondary"
              iconLeading={Eye}
              href={`/events/${event.slug}`}
            >
              View Public
            </Button>
            <Button
              color="secondary"
              iconLeading={Edit3}
              href={`/dashboard/organizer/events/${event.id}/edit`}
            >
              Edit
            </Button>
            <Button
              color={event.is_published ? 'warning' : 'primary'}
              onClick={handleTogglePublish}
            >
              {event.is_published ? 'Unpublish' : 'Publish'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Bookings"
            value={totalBookings}
            icon={Ticket02}
            color="primary"
          />
          <StatsCard
            title="Capacity Used"
            value={`${occupancyRate}%`}
            icon={Users01}
            color="primary"
          />
          <StatsCard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            icon={CurrencyRupee}
            color="primary"
          />
          <StatsCard
            title="Available Seats"
            value={event.available_seats}
            icon={Users01}
            color="primary"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Event Details */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Start Date</label>
                <p className="text-sm text-gray-900">{formatDate(event.start_date)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">End Date</label>
                <p className="text-sm text-gray-900">{formatDate(event.end_date)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Venue</label>
                <p className="text-sm text-gray-900">{event.venue_name}</p>
                <p className="text-xs text-gray-600">{event.venue_address}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Price</label>
                <p className="text-sm text-gray-900">
                  {event.base_price === 0 ? 'Free' : `₹${event.base_price?.toLocaleString()}`}
                </p>
              </div>
              {event.tags && event.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {event.tags.map((tag, index) => (
                      <Badge key={index} type="pill-color" color="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
              <Button color="link-color" size="sm" href={`/dashboard/organizer/events/${event.id}/bookings`}>
                View All
              </Button>
            </div>
            <div className="p-6">
              {confirmedBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Ticket02 className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">No bookings yet</p>
                  <p className="text-xs text-gray-500">Bookings will appear here once people register</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {confirmedBookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {booking.profiles?.full_name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {booking.quantity} ticket{booking.quantity > 1 ? 's' : ''} • {new Date(booking.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ₹{booking.total_amount.toLocaleString()}
                        </p>
                        <Badge
                          type="pill-color"
                          color={booking.payment_status === 'completed' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {booking.payment_status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Event Description */}
        {event.description && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Description</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="bg-white rounded-lg border border-red-200 shadow-sm">
          <div className="p-6 border-b border-red-200">
            <h3 className="text-lg font-semibold text-red-900">Danger Zone</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Delete Event</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Permanently delete this event and all its bookings. This action cannot be undone.
                </p>
              </div>
              <Button
                color="error"
                iconLeading={Trash2}
                onClick={handleDelete}
                isLoading={isDeleting}
                loadingText="Deleting..."
              >
                Delete Event
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}