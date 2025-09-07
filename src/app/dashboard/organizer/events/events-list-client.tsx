'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'
import { NativeSelect } from '@/components/base/select/select-native'
import { Badge } from '@/components/base/badges/badges'
import { 
  Plus, 
  SearchMd,
  Calendar,
  Ticket02,
  CurrencyRupee,
  Eye,
  Edit03,
  DotsHorizontal
} from '@untitledui/icons'
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icons'
import type { Tables } from '@/lib/supabase/database.types'
import type { User } from '@supabase/supabase-js'

type Event = Tables<'events'> & {
  total_bookings?: number
  total_revenue?: number
}

interface EventsListClientProps {
  events: Event[]
  user: User
}

export function EventsListClient({ events, user }: EventsListClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  // Filter and sort events
  const filteredEvents = events
    .filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue_name.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'published' && event.is_published) ||
        (statusFilter === 'draft' && !event.is_published) ||
        (statusFilter === 'featured' && event.is_featured)
      
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'start_date':
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        case 'bookings':
          return (b.total_bookings || 0) - (a.total_bookings || 0)
        case 'revenue':
          return (b.total_revenue || 0) - (a.total_revenue || 0)
        default: // created_at
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      }
    })

  const getStatusBadge = (event: Event) => {
    if (event.is_published) {
      return <Badge type="pill-color" color="success">Published</Badge>
    } else {
      return <Badge type="pill-color" color="warning">Draft</Badge>
    }
  }

  const getEventStatus = (event: Event) => {
    const now = new Date()
    const startDate = new Date(event.start_date)
    const endDate = new Date(event.end_date)

    if (now < startDate) {
      return { status: 'upcoming', color: 'blue' as const }    } else if (now >= startDate && now <= endDate) {
      return { status: 'ongoing', color: 'success' as const }
    } else {
      return { status: 'completed', color: 'gray' as const }
    }
  }

  return (
    <DashboardLayout sidebar="organizer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-display-md font-bold text-gray-900">My Events</h1>
            <p className="text-gray-600">Manage all your events in one place.</p>
          </div>
          <Button
            iconLeading={Plus}
            href="/dashboard/organizer/events/new"
          >
            Create Event
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <SearchMd className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={setSearchTerm}
                className="pl-10"
              />
            </div>
            
            <NativeSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Events' },
                { value: 'published', label: 'Published' },
                { value: 'draft', label: 'Drafts' },
                { value: 'featured', label: 'Featured' }
              ]}
            />

            <NativeSelect
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: 'created_at', label: 'Recently Created' },
                { value: 'start_date', label: 'Event Date' },
                { value: 'title', label: 'Event Title' },
                { value: 'bookings', label: 'Most Bookings' },
                { value: 'revenue', label: 'Highest Revenue' }
              ]}
            />

            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium">{filteredEvents.length}</span>
              <span className="ml-1">
                {filteredEvents.length === 1 ? 'event' : 'events'}
              </span>
            </div>
          </div>
        </div>

        {/* Events List */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 text-center py-16">
            <FeaturedIcon color="gray" theme="modern" size="xl" className="mx-auto mb-4">
              <Calendar className="w-8 h-8" />
            </FeaturedIcon>
            {events.length === 0 ? (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events created yet</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  Start your event management journey! Create your first event to engage with your audience.
                </p>
                <Button size="lg" href="/dashboard/organizer/events/new" iconLeading={Plus}>
                  Create Your First Event
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events match your filters</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  Try adjusting your search terms or filters to find the events you're looking for.
                </p>
                <Button 
                  size="lg" 
                  color="secondary" 
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                  }}
                >
                  Clear Filters
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => {
              const eventStatus = getEventStatus(event)
              
              return (
                <div key={event.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {event.featured_image_url ? (
                        <img 
                          src={event.featured_image_url} 
                          alt={event.title}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{event.short_description}</p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {event.is_featured && (
                              <Badge type="pill-color" color="brand">Featured</Badge>
                            )}
                            {getStatusBadge(event)}
                            <Badge type="pill-color" color={eventStatus.color}>
                              {eventStatus.status.charAt(0).toUpperCase() + eventStatus.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 space-x-6 mt-3">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(event.start_date)} - {formatDate(event.end_date)}
                          </div>
                          <div className="flex items-center">
                            <Ticket02 className="w-4 h-4 mr-1" />
                            {event.total_bookings || 0} bookings
                          </div>
                          <div className="flex items-center">
                            <CurrencyRupee className="w-4 h-4 mr-1" />
                            Revenue: {formatPrice(event.total_revenue || 0)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {event.available_seats} / {event.total_capacity} seats available
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        size="sm"
                        color="secondary"
                        iconLeading={Eye}
                        href={`/events/${event.slug}`}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        color="secondary"
                        iconLeading={Edit03}
                        href={`/dashboard/organizer/events/${event.id}/edit`}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        color="tertiary"
                        iconLeading={DotsHorizontal}
                        onClick={() => alert('More options coming soon!')}
                      >
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}