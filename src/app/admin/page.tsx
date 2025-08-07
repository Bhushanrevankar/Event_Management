'use client';

import { useState } from 'react';
import { Users01, Calendar, Ticket02, CurrencyRupee, Shield01, TrendUp01 } from "@untitledui/icons";
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Button } from '@/components/base/buttons/button';
import { Badge } from '@/components/base/badges/badges';

export default function AdminDashboard() {
  // Mock data - in production, this would come from Supabase with admin access
  const [stats] = useState({
    totalUsers: 2847,
    totalEvents: 156,
    totalBookings: 4892,
    platformRevenue: 1250000
  });

  const [recentEvents] = useState([
    {
      id: '1',
      title: 'Tech Conference 2024',
      organizer: 'TechEvents India',
      status: 'published' as const,
      bookings: 245,
      created_at: '2024-02-10T08:00:00Z'
    },
    {
      id: '2',
      title: 'Music Festival Summer 2024',
      organizer: 'Mumbai Music Society',
      status: 'pending_review' as const,
      bookings: 0,
      created_at: '2024-02-14T14:30:00Z'
    },
    {
      id: '3',
      title: 'Startup Networking Event',
      organizer: 'Business Hub Delhi',
      status: 'published' as const,
      bookings: 89,
      created_at: '2024-02-12T11:15:00Z'
    },
    {
      id: '4',
      title: 'Digital Marketing Workshop',
      organizer: 'Learning Academy',
      status: 'rejected' as const,
      bookings: 0,
      created_at: '2024-02-13T16:45:00Z'
    }
  ]);

  const [systemAlerts] = useState([
    {
      id: '1',
      type: 'warning',
      title: 'High booking volume detected',
      description: 'Tech Conference 2024 is experiencing unusually high booking activity',
      timestamp: '2024-02-15T10:30:00Z'
    },
    {
      id: '2',
      type: 'info',
      title: 'New organizer registration',
      description: '5 new organizers have registered in the last 24 hours',
      timestamp: '2024-02-15T08:15:00Z'
    },
    {
      id: '3',
      type: 'error',
      title: 'Payment processing issues',
      description: '3 payment failures reported for booking ID #BK789012',
      timestamp: '2024-02-14T22:30:00Z'
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'pending_review': return 'warning';
      case 'rejected': return 'error';
      default: return 'primary';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

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
            variant="outline"
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
            color="success"
          />
          <StatsCard
            title="Total Bookings"
            value={stats.totalBookings.toLocaleString()}
            icon={Ticket02}
            color="warning"
          />
          <StatsCard
            title="Platform Revenue"
            value={`₹${stats.platformRevenue.toLocaleString()}`}
            icon={CurrencyRupee}
            color="success"
          />
        </div>

        {/* System Alerts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
            <Button color="link" size="sm" href="/admin/alerts">
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
            <div className="space-y-4">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">{event.title}</p>
                      <Badge
                        type="pill-color"
                        color={getStatusColor(event.status)}
                      >
                        {event.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      by {event.organizer}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      <span>{event.bookings} bookings</span>
                      <span>Created {formatDate(event.created_at)}</span>
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
  );
}