'use client'

import { Calendar, Ticket02, Users01, Plus, Edit3, Eye, Trash2 } from '@untitledui/icons'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/base/buttons/button'
import { Badge } from '@/components/base/badges/badges'
import type { Tables } from '@/lib/supabase/database.types'
import type { User } from '@supabase/supabase-js'

type EventWithBookings = Tables<'events'> & {
  bookings?: Array<{
    quantity: number
    total_amount: number
    status: string
  }>
}

interface Props {
  events: EventWithBookings[]
  user: User
}

export function OrganizerEventsClient({ events, user }: Props) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEventStats = (event: EventWithBookings) => {
    const confirmedBookings = event.bookings?.filter(booking => booking.status === 'confirmed') || []
    const totalBookings = confirmedBookings.reduce((sum, booking) => sum + booking.quantity, 0)
    const totalRevenue = confirmedBookings.reduce((sum, booking) => sum + booking.total_amount, 0)
    
    return {
      totalBookings,
      totalRevenue,
      occupancyRate: Math.round((totalBookings / event.total_capacity) * 100)
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-display-md font-bold text-gray-900">My Events</h1>
            <p className="text-gray-600">Manage and track your events.</p>
          </div>
          <Button
            iconLeading={Plus}
            href="/dashboard/organizer/events/new"
          >
            Create Event
          </Button>
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No events yet</h3>
            <p className="mt-2 text-gray-600">Get started by creating your first event.</p>
            <div className="mt-6">
              <Button href="/dashboard/organizer/events/new">
                Create Your First Event
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">All Events ({events.length})</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {events.map((event) => {
                const stats = getEventStats(event)
                
                return (
                  <div key={event.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {event.featured_image_url ? (
                          <img 
                            src={event.featured_image_url} 
                            alt={event.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Calendar className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {event.title}
                              </h3>
                              {event.short_description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {event.short_description}
                                </p>
                              )}
                            </div>
                            <div className="ml-4 flex items-center space-x-2">
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
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Date</p>
                              <p className="text-sm font-medium text-gray-900">
                                {formatDate(event.start_date)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Venue</p>
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {event.venue_name}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Bookings</p>
                              <p className="text-sm font-medium text-gray-900">
                                {stats.totalBookings} / {event.total_capacity}
                                <span className="text-xs text-gray-500 ml-1">
                                  ({stats.occupancyRate}%)
                                </span>
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Revenue</p>
                              <p className="text-sm font-medium text-gray-900">
                                ₹{stats.totalRevenue.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 flex items-center space-x-2">
                        <Button
                          color="secondary"
                          size="sm"
                          iconLeading={Eye}
                          href={`/events/${event.slug}`}
                        >
                          View
                        </Button>
                        <Button
                          color="secondary"
                          size="sm"
                          iconLeading={Edit3}
                          href={`/dashboard/organizer/events/${event.id}/edit`}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}