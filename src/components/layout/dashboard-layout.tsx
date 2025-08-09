'use client';

import { useState } from 'react';
import { 
  Home01, 
  Calendar, 
  Ticket02, 
  User01, 
  Settings01,
  Menu01,
  X,
  Users01,
  BarChart03,
  LogOut01
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Avatar } from "@/components/base/avatar/avatar";
import { UntitledLogoMinimal } from "@/components/foundations/logo/untitledui-logo-minimal";
import { cx } from "@/utils/cx";

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar?: 'attendee' | 'organizer' | 'admin';
}

const sidebarConfig = {
  attendee: {
    title: 'Attendee Dashboard',
    navigation: [
      { name: 'Dashboard', href: '/dashboard/attendee', icon: Home01 },
      { name: 'My Bookings', href: '/dashboard/attendee/bookings', icon: Ticket02 },
      { name: 'Profile', href: '/dashboard/attendee/profile', icon: User01 },
      { name: 'Settings', href: '/dashboard/attendee/settings', icon: Settings01 },
    ]
  },
  organizer: {
    title: 'Organizer Dashboard',
    navigation: [
      { name: 'Dashboard', href: '/dashboard/organizer', icon: Home01 },
      { name: 'My Events', href: '/dashboard/organizer/events', icon: Calendar },
      { name: 'Bookings', href: '/dashboard/organizer/bookings', icon: Ticket02 },
      { name: 'Analytics', href: '/dashboard/organizer/analytics', icon: BarChart03 },
      { name: 'Profile', href: '/dashboard/organizer/profile', icon: User01 },
      { name: 'Settings', href: '/dashboard/organizer/settings', icon: Settings01 },
    ]
  },
  admin: {
    title: 'Admin Dashboard',
    navigation: [
      { name: 'Dashboard', href: '/admin', icon: Home01 },
      { name: 'Users', href: '/admin/users', icon: Users01 },
      { name: 'Events', href: '/admin/events', icon: Calendar },
      { name: 'Analytics', href: '/admin/analytics', icon: BarChart03 },
      { name: 'Settings', href: '/admin/settings', icon: Settings01 },
    ]
  }
};

export function DashboardLayout({ children, sidebar = 'attendee' }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const config = sidebarConfig[sidebar];

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile menu */}
      <div className={cx(
        "fixed inset-0 flex z-40 md:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        
        <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-shrink-0 flex items-center px-4">
            <UntitledLogoMinimal className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-lg font-semibold text-gray-900">EventHub</span>
          </div>
          <div className="mt-5 flex-1 h-0 overflow-y-auto">
            <nav className="px-2 space-y-1">
              {config.navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                >
                  <item.icon className="text-gray-400 mr-4 flex-shrink-0 h-6 w-6" />
                  {item.name}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-white border-b border-gray-200">
              <UntitledLogoMinimal className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-lg font-semibold text-gray-900">EventHub</span>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto bg-white border-r border-gray-200">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {config.navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                  >
                    <item.icon className="text-gray-400 mr-3 flex-shrink-0 h-5 w-5" />
                    {item.name}
                  </a>
                ))}
              </nav>
              
              {/* User menu at bottom */}
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <div className="flex items-center w-full">
                  <Avatar
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                    initials="DU"
                    size="sm"
                  />
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-700">Demo User</p>
                    <p className="text-xs text-gray-500">demo@example.com</p>
                  </div>
                  <Button
                    color="tertiary"
                    size="sm"
                    iconLeading={LogOut01}
                    onClick={() => alert('Logout functionality coming soon')}
                  >
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white border-b border-gray-200">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu01 className="h-6 w-6" />
          </button>
        </div>

        {/* Main content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}