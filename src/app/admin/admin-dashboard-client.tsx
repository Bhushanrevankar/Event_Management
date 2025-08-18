'use client'

import { Users01, Calendar, Ticket02, CurrencyRupee, Shield01, TrendUp01 } from "@untitledui/icons"
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Button } from '@/components/base/buttons/button'
import { Badge } from '@/components/base/badges/badges'
import type { Tables } from '@/lib/supabase/database.types'
import type { User } from '@supabase/supabase-js'

type Event = Tables<'events'> & {
  profiles: Tables<'profiles'> | null
  bookings?: Tables<'bookings'>[]
}

interface Props {
  events: Event[]
  stats: {
    totalUsers: number
    totalEvents: number
    totalBookings: number
    platformRevenue: number
  }
  user: User
}

export function AdminDashboardClient({ events, stats, user }: Props) {
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

  const getStatusColor = (published: boolean) => {
    return published ? 'success' : 'warning'
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️'
      case 'error': return '❌'
      case 'info': return 'ℹ️'
      default: return '📝'
    }
  }

  // Mock system alerts for now - could be enhanced to fetch real alerts
  const systemAlerts = [
    {
      id: '1',
      type: 'info',
      title: 'System running normally',
      description: 'All services are operational',
      timestamp: new Date().toISOString()
    }
  ]

  // Get recent events (last 5)
  const recentEvents = events.slice(0, 5)

  return (
    <DashboardLayout sidebar="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-display-md font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">System overview and management tools.</p>
          </div>
          <Button
            iconLeading={Shield01}
            color="secondary"
            href="/admin/settings"
          >
            System Settings
          </Button>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={Users01}
            color="primary"
            change={{
              value: 8,
              type: 'increase',
              period: 'vs last month'
            }}
          />
          <StatsCard
            title="Total Events"
            value={stats.totalEvents}
            icon={Calendar}
            color="primary"
          />
          <StatsCard
            title="Total Bookings"
            value={stats.totalBookings.toLocaleString()}
            icon={Ticket02}
            color="primary"
          />
          <StatsCard
            title="Platform Revenue"
            value={`₹${stats.platformRevenue.toLocaleString()}`}
            icon={CurrencyRupee}
            color="primary"
          />
        </div>

        {/* System Alerts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
            <Button color="link-color" size="sm" href="/admin/alerts">
              View All
            </Button>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {systemAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-4 rounded-lg bg-gray-50">
                  <span className="text-lg">{getAlertIcon(alert.type)}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {alert.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {alert.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(alert.timestamp)}
                    </p>
                  </div>
                  <Button size="sm" color="secondary">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Events for Review */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Recent Events</h3>
            <Button color="secondary" size="sm" href="/admin/events">
              Manage All Events
            </Button>
          </div>
          <div className="p-6">
            {recentEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">No events to review</p>
                <p className="text-xs text-gray-500">New events will appear here for moderation</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">{event.title}</p>
                        <Badge
                          type="pill-color"
                          color={getStatusColor(event.is_published ?? false)}
                        >
                          {event.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        by {event.profiles?.full_name || 'Unknown Organizer'}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span>{event.bookings?.length || 0} bookings</span>
                        <span>Created {formatDate(event.created_at || '')}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button size="sm" color="secondary" href={`/admin/events/${event.id}`}>
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              color="secondary"
              size="lg"
              href="/admin/users"
              className="flex flex-col h-20 justify-center"
            >
              <Users01 className="w-5 h-5 mb-1" />
              Manage Users
            </Button>
            <Button
              color="secondary"
              size="lg"
              href="/admin/events"
              className="flex flex-col h-20 justify-center"
            >
              <Calendar className="w-5 h-5 mb-1" />
              Moderate Events
            </Button>
            <Button
              color="secondary"
              size="lg"
              href="/admin/analytics"
              className="flex flex-col h-20 justify-center"
            >
              <TrendUp01 className="w-5 h-5 mb-1" />
              View Analytics
            </Button>
            <Button
              color="secondary"
              size="lg"
              href="/admin/settings"
              className="flex flex-col h-20 justify-center"
            >
              <Shield01 className="w-5 h-5 mb-1" />
              System Settings
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}