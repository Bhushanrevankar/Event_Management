'use client'

import { Calendar, Ticket02, CurrencyRupee, TrendUp01, Plus } from "@untitledui/icons"
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Button } from '@/components/base/buttons/button'
import { Badge } from '@/components/base/badges/badges'
import type { Tables } from '@/lib/supabase/database.types'
import type { User } from '@supabase/supabase-js'

type Event = Tables<'events'> & {
  total_bookings?: number
  total_revenue?: number
  bookings?: number
}

interface Props {
  events: Event[]
  stats: {
    totalEvents: number
    totalBookings: number
    totalRevenue: number
    thisMonthRevenue: number
  }
  user: User
}

export function OrganizerDashboardClient({ events, stats, user }: Props) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`
    }
  }

  // Get recent events (last 5)
  const recentEvents = events.slice(0, 5)

  // Mock recent activity for now - could be enhanced to fetch real activity
  const recentActivity = [
    {
      id: '1',
      type: 'booking',
      title: 'New booking received',
      description: 'Recent booking activity will show here',
      timestamp: new Date().toISOString(),
      amount: null
    }
  ]

  return (
    <DashboardLayout sidebar="organizer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-display-md font-bold text-gray-900">Organizer Dashboard</h1>
            <p className="text-gray-600">Manage your events and track performance.</p>
          </div>
          <Button
            iconLeading={Plus}
            href="/dashboard/organizer/events/new"
          >
            Create Event
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Events"
            value={stats.totalEvents}
            icon={Calendar}
            color="primary"
          />
          <StatsCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={Ticket02}
            color="primary"
          />
          <StatsCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon={CurrencyRupee}
            color="primary"
          />
          <StatsCard
            title="This Month"
            value={`₹${stats.thisMonthRevenue.toLocaleString()}`}
            change={{
              value: 12,
              type: 'increase',
              period: 'vs last month'
            }}
            icon={TrendUp01}
            color="primary"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <Button color="link-color" size="sm" href="/dashboard/organizer/activity">
                View All
              </Button>
            </div>
            <div className="p-6">
              {stats.totalEvents === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">No activity yet</p>
                  <p className="text-xs text-gray-500">Create your first event to see activity here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(activity.timestamp)}
                        </p>
                      </div>
                      {activity.amount && (
                        <div className="text-sm font-medium text-green-600">
                          +₹{activity.amount.toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Events */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Recent Events</h3>
              <Button color="secondary" size="sm" href="/dashboard/organizer/events">
                View All
              </Button>
            </div>
            <div className="p-6">
              {recentEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">No events created yet</p>
                  <div className="mt-4">
                    <Button href="/dashboard/organizer/events/new" size="sm">
                      Create Your First Event
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {event.featured_image_url ? (
                          <img 
                            src={event.featured_image_url} 
                            alt={event.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{event.title}</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(event.start_date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge
                          type="pill-color"
                          color={event.is_published ? 'success' : 'warning'}
                        >
                          {event.is_published ? 'Published' : 'Draft'}
                        </Badge>
                        <div className="text-xs text-gray-600">
                          {event.bookings || 0} bookings
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              color="secondary"
              size="lg"
              href="/dashboard/organizer/events/new"
              className="flex flex-col h-20 justify-center"
            >
              <Plus className="w-5 h-5 mb-1" />
              Create Event
            </Button>
            <Button
              color="secondary"
              size="lg"
              href="/dashboard/organizer/events"
              className="flex flex-col h-20 justify-center"
            >
              <Calendar className="w-5 h-5 mb-1" />
              Manage Events
            </Button>
            <Button
              color="secondary"
              size="lg"
              href="/dashboard/organizer/bookings"
              className="flex flex-col h-20 justify-center"
            >
              <Ticket02 className="w-5 h-5 mb-1" />
              View Bookings
            </Button>
            <Button
              color="secondary"
              size="lg"
              href="/dashboard/organizer/analytics"
              className="flex flex-col h-20 justify-center"
            >
              <TrendUp01 className="w-5 h-5 mb-1" />
              Analytics
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}