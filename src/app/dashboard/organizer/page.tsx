'use client';

import { useState } from 'react';
import { Calendar, Ticket02, CurrencyRupee, TrendUp01, Plus } from "@untitledui/icons";
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Button } from '@/components/base/buttons/button';
import { Badge } from '@/components/base/badges/badges';

export default function OrganizerDashboard() {
  // Mock data - in production, this would come from Supabase
  const [stats] = useState({
    totalEvents: 8,
    totalBookings: 156,
    totalRevenue: 425000,
    thisMonthRevenue: 45230
  });

  const [recentEvents] = useState([
    {
      id: '1',
      title: 'Tech Conference 2024',
      featured_image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=80&h=80&fit=crop',
      start_date: '2024-03-15T10:00:00Z',
      status: 'published' as const,
      bookings: 45,
      available_seats: 455,
      total_capacity: 500
    },
    {
      id: '2',
      title: 'Web Development Workshop',
      featured_image_url: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=80&h=80&fit=crop',
      start_date: '2024-03-22T14:00:00Z',
      status: 'draft' as const,
      bookings: 0,
      available_seats: 50,
      total_capacity: 50
    },
    {
      id: '3',
      title: 'AI Innovation Summit',
      featured_image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=80&h=80&fit=crop',
      start_date: '2024-04-10T09:00:00Z',
      status: 'published' as const,
      bookings: 89,
      available_seats: 111,
      total_capacity: 200
    }
  ]);

  const [recentActivity] = useState([
    {
      id: '1',
      type: 'booking',
      title: 'New booking received',
      description: 'Sarah Johnson booked 2 tickets for Tech Conference 2024',
      timestamp: '2024-02-15T10:30:00Z',
      amount: 5000
    },
    {
      id: '2',
      type: 'booking',
      title: 'New booking received',
      description: 'Mike Chen booked 1 ticket for AI Innovation Summit',
      timestamp: '2024-02-15T09:45:00Z',
      amount: 2500
    },
    {
      id: '3',
      type: 'event',
      title: 'Event published',
      description: 'Web Development Workshop was published successfully',
      timestamp: '2024-02-14T16:20:00Z',
      amount: null
    }
  ]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

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
            color="success"
          />
          <StatsCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon={CurrencyRupee}
            color="warning"
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
            color="success"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <Button color="link" size="sm" href="/dashboard/organizer/activity">
                View All
              </Button>
            </div>
            <div className="p-6">
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
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={event.featured_image_url} 
                        alt={event.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
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
                        color={event.status === 'published' ? 'success' : 'warning'}
                      >
                        {event.status}
                      </Badge>
                      <div className="text-xs text-gray-600">
                        {event.bookings} bookings
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
  );
}