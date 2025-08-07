# Complete Page Implementation Guide

## Overview

This comprehensive guide provides step-by-step implementation instructions for every page in the Event Management & Ticket Booking System. It combines all our existing documentation into actionable implementation steps, showing exactly how to use Untitled UI components, Supabase MCP integration, database schema, security policies, and API configurations.

## System Architecture Quick Reference

### Tech Stack
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **UI Components**: Untitled UI React (existing in your starter kit)
- **Database**: Supabase with Row Level Security
- **Authentication**: Supabase Auth with JWT
- **Payments**: Razorpay integration
- **Maps**: Google Maps API

### User Roles
- **Attendee**: Books tickets, manages own bookings
- **Organizer**: Creates events, manages attendees  
- **Admin**: System-wide management

## Page Implementation Matrix

| Page | Auth Required | Role | Database Tables | API Endpoints | Key Components |
|------|---------------|------|-----------------|---------------|----------------|
| Landing | No | Public | events, event_categories | GET /api/v1/events | EventCard, EventList |
| Events Listing | No | Public | events, event_categories | GET /api/v1/events | EventFilters, EventList |
| Event Detail | No | Public | events, profiles, bookings | GET /api/v1/events/[id] | EventDetail, BookingForm |
| Auth Pages | No | Public | profiles | POST /api/v1/auth/* | SignInForm, SignUpForm |
| Booking Flow | Yes | Any | bookings, payments, tickets | POST /api/v1/bookings | BookingForm, PaymentForm |
| Attendee Dashboard | Yes | Attendee | bookings, tickets | GET /api/v1/dashboard/attendee | StatsCard, BookingCard |
| Organizer Dashboard | Yes | Organizer | events, bookings, payments | GET /api/v1/dashboard/organizer | StatsCard, RecentActivity |
| Admin Dashboard | Yes | Admin | All tables | GET /api/v1/admin/* | Analytics, UserTable |

---

# Public Pages

## 1. Landing Page (`/`)

### Purpose
Event discovery homepage with featured events and search functionality.

### Components Used (Untitled UI)
```typescript
// From your existing starter kit
import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'
import { Badge } from '@/components/base/badges/badges'
import { Avatar } from '@/components/base/avatar/avatar'
```

### Database Tables
- `events` (featured events)
- `event_categories` (category filters)
- `profiles` (organizer info)

### Implementation

```typescript
// src/app/page.tsx
import { createClient } from '@/utils/supabase/server'
import { EventCard } from '@/components/events/event-card'
import { Button } from '@/components/base/buttons/button'

export default async function HomePage() {
  const supabase = await createClient()
  
  // Get featured events (public access)
  const { data: featuredEvents } = await supabase
    .from('events')
    .select(`
      *,
      category:event_categories(name, slug, color_hex),
      organizer:profiles(full_name, avatar_url)
    `)
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('start_date', { ascending: true })
    .limit(6)

  // Get event categories
  const { data: categories } = await supabase
    .from('event_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <h1 className="text-display-lg font-bold mb-6">
            Discover Amazing Events
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Find concerts, workshops, conferences and more happening near you
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <Input
              placeholder="Search events..."
              className="bg-white text-gray-900"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-display-sm font-bold mb-8 text-center">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories?.map((category) => (
              <Button
                key={category.id}
                variant="outline"
                size="lg"
                href={`/events?category=${category.slug}`}
                className="h-20 flex-col"
              >
                <div 
                  className="w-6 h-6 rounded mb-2"
                  style={{ backgroundColor: category.color_hex }}
                />
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-display-sm font-bold">Featured Events</h2>
            <Button variant="outline" href="/events">
              View All Events
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents?.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                variant="featured"
                onClick={() => window.location.href = `/events/${event.slug}`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
```

### Supabase MCP Integration
```sql
-- Query featured events with MCP
SELECT 
  e.*,
  c.name as category_name,
  p.full_name as organizer_name
FROM events e
JOIN event_categories c ON e.category_id = c.id
JOIN profiles p ON e.organizer_id = p.id
WHERE e.is_published = true 
  AND e.is_featured = true
ORDER BY e.start_date ASC
LIMIT 6;
```

---

## 2. Events Listing Page (`/events`)

### Purpose
Comprehensive event browsing with advanced filtering and search.

### Components Used
```typescript
import { EventList } from '@/components/events/event-list'
import { EventFilters } from '@/components/events/event-filters'
import { Select } from '@/components/base/select/select'
import { Input } from '@/components/base/input/input'
import { DatePicker } from '@/components/application/date-picker/date-picker'
import { Slider } from '@/components/base/slider/slider'
import { Pagination } from '@/components/application/pagination/pagination'
```

### Database Tables
- `events` (main event data)
- `event_categories` (filtering)
- `profiles` (organizer info)

### Implementation

```typescript
// src/app/events/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { EventList } from '@/components/events/event-list'
import { EventFilters } from '@/components/events/event-filters'
import { useEvents } from '@/hooks/events/use-events'
import { useCategories } from '@/hooks/events/use-categories'

export default function EventsPage() {
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    location: '',
    dateFrom: '',
    dateTo: '',
    priceMin: 0,
    priceMax: 10000
  })

  const { data: events, loading, error, pagination } = useEvents(filters)
  const { data: categories } = useCategories()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-display-md font-bold mb-4">
          Discover Events
        </h1>
        <p className="text-lg text-gray-600">
          Find the perfect event for you
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <EventFilters
            filters={filters}
            categories={categories || []}
            onFiltersChange={setFilters}
            onClearFilters={() => setFilters({
              search: '',
              category: '',
              location: '',
              dateFrom: '',
              dateTo: '',
              priceMin: 0,
              priceMax: 10000
            })}
          />
        </div>

        {/* Events Grid */}
        <div className="lg:col-span-3">
          <div className="mb-6 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {pagination?.total || 0} events found
            </p>
            
            <Select defaultValue="date_asc">
              <SelectItem value="date_asc">Date (Earliest first)</SelectItem>
              <SelectItem value="date_desc">Date (Latest first)</SelectItem>
              <SelectItem value="price_asc">Price (Low to high)</SelectItem>
              <SelectItem value="price_desc">Price (High to low)</SelectItem>
            </Select>
          </div>

          <EventList
            events={events || []}
            loading={loading}
            error={error}
            pagination={pagination}
            onEventClick={(event) => {
              window.location.href = `/events/${event.slug}`
            }}
          />
        </div>
      </div>
    </div>
  )
}
```

### Custom Hook for Events
```typescript
// src/hooks/events/use-events.ts
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export function useEvents(filters: EventFilters) {
  const [data, setData] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState(null)

  useEffect(() => {
    fetchEvents()
  }, [filters])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      let query = supabase
        .from('events')
        .select(`
          *,
          category:event_categories(name, slug, color_hex),
          organizer:profiles(full_name, avatar_url)
        `)
        .eq('is_published', true)

      // Apply filters
      if (filters.search) {
        query = query.textSearch('title', filters.search)
      }
      
      if (filters.category) {
        query = query.eq('event_categories.slug', filters.category)
      }

      if (filters.dateFrom) {
        query = query.gte('start_date', filters.dateFrom)
      }

      if (filters.dateTo) {
        query = query.lte('start_date', filters.dateTo)
      }

      if (filters.priceMin > 0) {
        query = query.gte('base_price', filters.priceMin)
      }

      if (filters.priceMax < 10000) {
        query = query.lte('base_price', filters.priceMax)
      }

      const { data: events, error, count } = await query
        .order('start_date', { ascending: true })
        .range(0, 19) // 20 items per page

      if (error) throw error

      setData(events || [])
      setPagination({
        page: 1,
        total: count,
        totalPages: Math.ceil((count || 0) / 20),
        hasNext: (count || 0) > 20,
        hasPrev: false
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, pagination }
}
```

---

## 3. Event Detail Page (`/events/[slug]`)

### Purpose
Detailed event information with booking capability.

### Components Used
```typescript
import { EventDetail } from '@/components/events/event-detail'
import { BookingForm } from '@/components/booking/booking-form'
import { Badge } from '@/components/base/badges/badges'
import { Button } from '@/components/base/buttons/button'
import { Avatar } from '@/components/base/avatar/avatar'
import { Modal } from '@/components/application/modals/modal'
```

### Database Tables
- `events` (event details)
- `profiles` (organizer info)
- `bookings` (availability check)

### Implementation

```typescript
// src/app/events/[slug]/page.tsx
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { EventDetailClient } from './event-detail-client'

interface Props {
  params: { slug: string }
}

export default async function EventDetailPage({ params }: Props) {
  const supabase = await createClient()
  
  // Get event details
  const { data: event, error } = await supabase
    .from('events')
    .select(`
      *,
      category:event_categories(*),
      organizer:profiles(*)
    `)
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single()

  if (error || !event) {
    notFound()
  }

  // Get booking statistics
  const { count: totalBookings } = await supabase
    .from('bookings')
    .select('quantity', { count: 'exact' })
    .eq('event_id', event.id)
    .eq('status', 'confirmed')

  const bookedSeats = totalBookings || 0
  const availableSeats = event.total_capacity - bookedSeats

  return (
    <EventDetailClient 
      event={event} 
      availableSeats={availableSeats}
    />
  )
}
```

```typescript
// src/app/events/[slug]/event-detail-client.tsx
'use client'

import { useState } from 'react'
import { Badge } from '@/components/base/badges/badges'
import { Button } from '@/components/base/buttons/button'
import { Avatar } from '@/components/base/avatar/avatar'
import { Modal } from '@/components/application/modals/modal'
import { BookingForm } from '@/components/booking/booking-form'
import { formatDate, formatPrice } from '@/lib/utils'

interface Props {
  event: Event
  availableSeats: number
}

export function EventDetailClient({ event, availableSeats }: Props) {
  const [showBookingModal, setShowBookingModal] = useState(false)

  const handleBooking = async (bookingData: BookingData) => {
    try {
      const response = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) throw new Error('Booking failed')

      const booking = await response.json()
      // Redirect to payment
      window.location.href = `/booking/${booking.id}/payment`
    } catch (error) {
      console.error('Booking error:', error)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Event Details */}
        <div className="lg:col-span-2">
          {/* Hero Image */}
          <div className="relative aspect-video rounded-lg overflow-hidden mb-6">
            <img 
              src={event.featured_image_url} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
            {event.is_featured && (
              <Badge 
                variant="solid" 
                color="primary"
                className="absolute top-4 left-4"
              >
                Featured
              </Badge>
            )}
          </div>

          {/* Event Info */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Badge 
                variant="soft"
                style={{ 
                  backgroundColor: `${event.category.color_hex}20`,
                  color: event.category.color_hex 
                }}
              >
                {event.category.name}
              </Badge>
              <span className="text-sm text-gray-500">
                {formatDate(event.start_date)}
              </span>
            </div>

            <h1 className="text-display-lg font-bold mb-4">
              {event.title}
            </h1>

            <div className="flex items-center mb-6">
              <Avatar 
                src={event.organizer.avatar_url}
                name={event.organizer.full_name}
                size="md"
              />
              <div className="ml-3">
                <p className="font-medium">{event.organizer.full_name}</p>
                <p className="text-sm text-gray-600">Event Organizer</p>
              </div>
            </div>

            <div className="prose max-w-none">
              <p>{event.description}</p>
            </div>
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="font-semibold mb-2">📅 Date & Time</h3>
              <p>{formatDate(event.start_date, 'full')}</p>
              <p className="text-sm text-gray-600">
                {formatDate(event.start_date, 'time')} - {formatDate(event.end_date, 'time')}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">📍 Location</h3>
              <p>{event.venue_name}</p>
              <p className="text-sm text-gray-600">{event.venue_address}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">🎟️ Tickets</h3>
              <p className="text-lg font-bold text-primary-600">
                {formatPrice(event.base_price, event.currency)}
              </p>
              <p className="text-sm text-gray-600">
                {availableSeats} of {event.total_capacity} available
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">ℹ️ Additional Info</h3>
              {event.age_restriction && (
                <p className="text-sm">Age restriction: {event.age_restriction}+</p>
              )}
              <p className="text-sm">Max {event.max_tickets_per_user} tickets per person</p>
            </div>
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-center mb-6">
              <p className="text-2xl font-bold text-primary-600">
                {formatPrice(event.base_price, event.currency)}
              </p>
              <p className="text-sm text-gray-600">per ticket</p>
            </div>

            <Button
              size="lg"
              className="w-full mb-4"
              onClick={() => setShowBookingModal(true)}
              disabled={availableSeats === 0}
            >
              {availableSeats === 0 ? 'Sold Out' : 'Book Now'}
            </Button>

            <div className="space-y-2 text-sm text-gray-600">
              <p>✅ Instant confirmation</p>
              <p>✅ Mobile tickets</p>
              <p>✅ Free cancellation until 24h before</p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal
        open={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Book Your Tickets"
        size="lg"
      >
        <BookingForm
          event={event}
          maxTickets={Math.min(event.max_tickets_per_user, availableSeats)}
          onSubmit={handleBooking}
        />
      </Modal>
    </div>
  )
}
```

---

# Authentication Pages

## 4. Sign In Page (`/auth/signin`)

### Purpose
User authentication with email/password.

### Components Used
```typescript
import { SignInForm } from '@/components/auth/signin-form'
import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'
```

### Database Tables
- `profiles` (user data after auth)

### Implementation

```typescript
// src/app/auth/signin/page.tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push(redirectTo)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-6">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={loading}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Button variant="link" href="/auth/signup">
              Sign up
            </Button>
          </p>
        </div>
      </div>
    </div>
  )
}
```

---

# Dashboard Pages (Attendee)

## 5. Attendee Dashboard (`/dashboard/attendee`)

### Purpose
Overview of user's bookings and account activity.

### Components Used
```typescript
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCard } from '@/components/dashboard/stats-card'
import { BookingCard } from '@/components/booking/booking-card'
import { RecentActivity } from '@/components/dashboard/recent-activity'
```

### Database Tables
- `bookings` (user bookings)
- `tickets` (user tickets)
- `events` (booked events)

### Implementation

```typescript
// src/app/dashboard/attendee/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCard } from '@/components/dashboard/stats-card'
import { BookingCard } from '@/components/booking/booking-card'

export default async function AttendeeDashboard() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/signin')

  // Get user statistics
  const { count: totalBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact' })
    .eq('user_id', session.user.id)

  const { count: upcomingEvents } = await supabase
    .from('bookings')
    .select(`
      events!inner(start_date)
    `, { count: 'exact' })
    .eq('user_id', session.user.id)
    .eq('status', 'confirmed')
    .gte('events.start_date', new Date().toISOString())

  const { data: totalSpentResult } = await supabase
    .from('bookings')
    .select('total_amount')
    .eq('user_id', session.user.id)
    .eq('status', 'confirmed')

  const totalSpent = totalSpentResult?.reduce((sum, booking) => 
    sum + (booking.total_amount || 0), 0) || 0

  // Get recent bookings
  const { data: recentBookings } = await supabase
    .from('bookings')
    .select(`
      *,
      event:events(title, featured_image_url, start_date, venue_name)
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <DashboardLayout sidebar="attendee">
      <div className="space-y-6">
        <div>
          <h1 className="text-display-md font-bold">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your event activity.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Bookings"
            value={totalBookings || 0}
            icon="ticket"
            color="primary"
          />
          <StatsCard
            title="Upcoming Events"
            value={upcomingEvents || 0}
            icon="calendar"
            color="success"
          />
          <StatsCard
            title="Total Spent"
            value={`₹${totalSpent.toLocaleString()}`}
            icon="currency-rupee"
            color="warning"
          />
        </div>

        {/* Recent Bookings */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Recent Bookings</h2>
            <Button variant="outline" href="/dashboard/attendee/bookings">
              View All
            </Button>
          </div>

          <div className="space-y-4">
            {recentBookings?.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onViewDetails={() => {
                  window.location.href = `/dashboard/attendee/bookings/${booking.id}`
                }}
                onDownloadTicket={() => {
                  window.location.href = `/dashboard/attendee/tickets/${booking.id}`
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
```

---

# Dashboard Pages (Organizer)

## 6. Organizer Dashboard (`/dashboard/organizer`)

### Purpose
Event management overview with analytics and recent activity.

### Components Used
```typescript
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCard } from '@/components/dashboard/stats-card'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { EventList } from '@/components/events/event-list'
```

### Database Tables
- `events` (organizer's events)
- `bookings` (event bookings)
- `payments` (revenue data)

### Implementation

```typescript
// src/app/dashboard/organizer/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCard } from '@/components/dashboard/stats-card'
import { RecentActivity } from '@/components/dashboard/recent-activity'

export default async function OrganizerDashboard() {
  const supabase = await createClient()
  
  // Check authentication and role
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/signin')

  // Get user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'organizer' && profile?.role !== 'admin') {
    redirect('/dashboard/attendee')
  }

  // Get organizer statistics
  const { count: totalEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact' })
    .eq('organizer_id', session.user.id)

  const { count: totalBookings } = await supabase
    .from('bookings')
    .select(`
      events!inner(organizer_id)
    `, { count: 'exact' })
    .eq('events.organizer_id', session.user.id)
    .eq('status', 'confirmed')

  // Get total revenue
  const { data: revenueData } = await supabase
    .from('payments')
    .select(`
      amount,
      bookings!inner(
        events!inner(organizer_id)
      )
    `)
    .eq('bookings.events.organizer_id', session.user.id)
    .eq('status', 'completed')

  const totalRevenue = revenueData?.reduce((sum, payment) => 
    sum + (payment.amount || 0), 0) || 0

  // Get recent events
  const { data: recentEvents } = await supabase
    .from('events')
    .select(`
      *,
      category:event_categories(name, color_hex),
      _count:bookings(count)
    `)
    .eq('organizer_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get recent activity
  const { data: recentBookings } = await supabase
    .from('bookings')
    .select(`
      *,
      event:events!inner(title, organizer_id),
      user:profiles(full_name, avatar_url)
    `)
    .eq('events.organizer_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const recentActivity = recentBookings?.map(booking => ({
    id: booking.id,
    type: 'booking',
    title: 'New booking received',
    description: `${booking.user.full_name} booked ${booking.quantity} ticket(s) for ${booking.event.title}`,
    timestamp: booking.created_at,
    user: booking.user,
    amount: booking.total_amount
  })) || []

  return (
    <DashboardLayout sidebar="organizer">
      <div className="space-y-6">
        <div>
          <h1 className="text-display-md font-bold">Organizer Dashboard</h1>
          <p className="text-gray-600">Manage your events and track performance.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Events"
            value={totalEvents || 0}
            icon="calendar"
            color="primary"
          />
          <StatsCard
            title="Total Bookings"
            value={totalBookings || 0}
            icon="ticket"
            color="success"
          />
          <StatsCard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            icon="currency-rupee"
            color="warning"
          />
          <StatsCard
            title="This Month"
            value="₹45,230"
            change={{
              value: 12,
              type: 'increase',
              period: 'vs last month'
            }}
            icon="trending-up"
            color="success"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <RecentActivity 
            activities={recentActivity}
            maxItems={8}
          />

          {/* Recent Events */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Recent Events</h3>
              <Button variant="outline" size="sm" href="/dashboard/organizer/events">
                View All
              </Button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentEvents?.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <img 
                        src={event.featured_image_url} 
                        alt={event.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="ml-3">
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(event.start_date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{event._count} bookings</p>
                      <p className="text-sm text-gray-600">
                        {event.available_seats} seats left
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
```

---

# Admin Pages

## 7. Admin Dashboard (`/admin`)

### Purpose
System-wide administration and analytics.

### Components Used
```typescript
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCard } from '@/components/dashboard/stats-card'
import { UserTable } from '@/components/admin/user-table'
import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard'
```

### Database Tables
- All tables (system-wide access)

### Implementation

```typescript
// src/app/admin/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCard } from '@/components/dashboard/stats-card'

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  // Check authentication and admin role
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/signin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Get system-wide statistics using service role
  const supabaseAdmin = createClient() // This would use service role in production

  const [
    { count: totalUsers },
    { count: totalEvents },
    { count: totalBookings },
    { data: revenueData }
  ] = await Promise.all([
    supabaseAdmin.from('profiles').select('*', { count: 'exact' }),
    supabaseAdmin.from('events').select('*', { count: 'exact' }),
    supabaseAdmin.from('bookings').select('*', { count: 'exact' }).eq('status', 'confirmed'),
    supabaseAdmin.from('payments').select('amount').eq('status', 'completed')
  ])

  const totalRevenue = revenueData?.reduce((sum, payment) => 
    sum + (payment.amount || 0), 0) || 0

  // Get recent system activity
  const { data: recentEvents } = await supabaseAdmin
    .from('events')
    .select(`
      *,
      organizer:profiles(full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <DashboardLayout sidebar="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-display-md font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">System overview and management.</p>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Users"
            value={totalUsers || 0}
            icon="users"
            color="primary"
          />
          <StatsCard
            title="Total Events"
            value={totalEvents || 0}
            icon="calendar"
            color="success"
          />
          <StatsCard
            title="Total Bookings"
            value={totalBookings || 0}
            icon="ticket"
            color="warning"
          />
          <StatsCard
            title="Platform Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            icon="currency-rupee"
            color="success"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Button
            size="lg"
            variant="outline"
            href="/admin/users"
            className="h-20 flex-col"
          >
            <UserIcon className="w-6 h-6 mb-2" />
            Manage Users
          </Button>
          <Button
            size="lg"
            variant="outline"
            href="/admin/events"
            className="h-20 flex-col"
          >
            <CalendarIcon className="w-6 h-6 mb-2" />
            Moderate Events
          </Button>
          <Button
            size="lg"
            variant="outline"
            href="/admin/analytics"
            className="h-20 flex-col"
          >
            <ChartBarIcon className="w-6 h-6 mb-2" />
            View Analytics
          </Button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Recent Events Submitted</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentEvents?.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-gray-600">
                      by {event.organizer.full_name}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="soft"
                      color={event.is_published ? 'success' : 'warning'}
                    >
                      {event.is_published ? 'Published' : 'Pending Review'}
                    </Badge>
                    <Button size="sm" href={`/admin/events/${event.id}`}>
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
```

---

# Booking Flow Pages

## 8. Booking Flow (`/events/[slug]/book`)

### Purpose
Complete ticket booking process with payment integration.

### Components Used
```typescript
import { BookingForm } from '@/components/booking/booking-form'
import { RazorpayCheckout } from '@/components/payment/razorpay-checkout'
import { QRCodeDisplay } from '@/components/tickets/qr-code-display'
```

### Database Tables
- `bookings` (create booking record)
- `payments` (payment tracking)
- `tickets` (generate individual tickets)

### Implementation

```typescript
// src/app/events/[slug]/book/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { BookingFlowClient } from './booking-flow-client'

export default async function BookingPage({ params }) {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/signin?redirectTo=/events/' + params.slug + '/book')

  // Get event details
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', params.slug)
    .single()

  return <BookingFlowClient event={event} user={session.user} />
}
```

```typescript
// src/app/events/[slug]/book/booking-flow-client.tsx
'use client'

import { useState } from 'react'
import { BookingForm } from '@/components/booking/booking-form'
import { RazorpayCheckout } from '@/components/payment/razorpay-checkout'
import { LoadingIndicator } from '@/components/application/loading-indicator/loading-indicator'

export function BookingFlowClient({ event, user }) {
  const [step, setStep] = useState<'booking' | 'payment' | 'confirmation'>('booking')
  const [bookingData, setBookingData] = useState(null)
  const [paymentOrder, setPaymentOrder] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleBookingSubmit = async (data) => {
    try {
      setLoading(true)
      
      // Create booking
      const response = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          event_id: event.id
        }),
      })

      const booking = await response.json()
      
      if (!response.ok) throw new Error(booking.error)

      setBookingData(booking.data)
      
      // Create payment order
      const paymentResponse = await fetch('/api/v1/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: booking.data.id
        }),
      })

      const paymentOrder = await paymentResponse.json()
      setPaymentOrder(paymentOrder.data)
      setStep('payment')

    } catch (error) {
      console.error('Booking error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async (paymentId, signature) => {
    try {
      setLoading(true)
      
      // Verify payment
      await fetch('/api/v1/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_id: paymentOrder.payment_id,
          gateway_payment_id: paymentId,
          gateway_signature: signature
        }),
      })

      setStep('confirmation')
    } catch (error) {
      console.error('Payment verification error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingIndicator />
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {step === 'booking' && (
        <div>
          <h1 className="text-display-md font-bold mb-8">Book Your Tickets</h1>
          <BookingForm
            event={event}
            onSubmit={handleBookingSubmit}
          />
        </div>
      )}

      {step === 'payment' && paymentOrder && (
        <div>
          <h1 className="text-display-md font-bold mb-8">Complete Payment</h1>
          <RazorpayCheckout
            order={paymentOrder}
            keyId={process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID}
            userDetails={{
              name: user.user_metadata?.full_name || user.email,
              email: user.email,
              contact: user.phone || ''
            }}
            onSuccess={handlePaymentSuccess}
            onError={(error) => {
              console.error('Payment error:', error)
              setStep('booking')
            }}
          />
        </div>
      )}

      {step === 'confirmation' && bookingData && (
        <div className="text-center">
          <h1 className="text-display-md font-bold mb-8 text-green-600">
            Booking Confirmed!
          </h1>
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-md mx-auto">
            <QRCodeDisplay
              data={bookingData.qr_code_data}
              downloadable={true}
              filename={`ticket-${bookingData.booking_reference}`}
            />
            <div className="mt-6">
              <p className="font-medium">Booking Reference</p>
              <p className="text-lg font-mono">{bookingData.booking_reference}</p>
            </div>
            <Button
              className="mt-6"
              href="/dashboard/attendee/bookings"
            >
              View My Bookings
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

# API Implementation Examples

## 9. Booking API (`/api/v1/bookings/route.ts`)

### Database Operations
- Create booking record
- Update event availability
- Generate tickets
- Trigger email notifications

### Implementation

```typescript
// src/app/api/v1/bookings/route.ts
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const bookingData = await request.json()
    const { event_id, quantity, attendee_info, special_requests, promotional_code } = bookingData

    // Validate event availability
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', event_id)
      .eq('is_published', true)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      )
    }

    if (event.available_seats < quantity) {
      return NextResponse.json(
        { success: false, error: 'Not enough seats available' },
        { status: 400 }
      )
    }

    // Calculate pricing
    const unit_price = event.base_price
    let total_amount = unit_price * quantity
    let discount_amount = 0

    // Apply promotional code if provided
    if (promotional_code) {
      // Implement promo code logic here
    }

    // Create booking record
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: session.user.id,
        event_id: event_id,
        quantity: quantity,
        unit_price: unit_price,
        total_amount: total_amount,
        discount_amount: discount_amount,
        attendee_info: attendee_info,
        special_requests: special_requests,
        promotional_code: promotional_code,
        status: 'pending',
        payment_status: 'pending',
        booking_reference: generateBookingReference(),
        expires_at: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      })
      .select()
      .single()

    if (bookingError) {
      return NextResponse.json(
        { success: false, error: 'Failed to create booking' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: booking
    })

  } catch (error) {
    console.error('Booking API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user's bookings
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        event:events(title, featured_image_url, start_date, venue_name),
        tickets(*)
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch bookings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: bookings
    })

  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateBookingReference(): string {
  const prefix = 'BK'
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${prefix}${timestamp}${random}`
}
```

---

# Supabase MCP Integration Examples

## Real-Time Database Operations

### Using MCP for Development

```typescript
// Example: Testing database queries with MCP
// You can run these directly in Claude Code with MCP enabled

// 1. Check event availability
const checkAvailability = async (eventId: string) => {
  const result = await supabase
    .from('events')
    .select(`
      id,
      title,
      total_capacity,
      available_seats,
      base_price,
      start_date
    `)
    .eq('id', eventId)
    .single()
  
  return result
}

// 2. Get user booking history
const getUserBookings = async (userId: string) => {
  const result = await supabase
    .from('bookings')
    .select(`
      id,
      booking_reference,
      quantity,
      total_amount,
      status,
      created_at,
      event:events(title, start_date, venue_name)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  return result
}

// 3. Generate analytics data
const getOrganizerStats = async (organizerId: string) => {
  const events = await supabase
    .from('events')
    .select('id')
    .eq('organizer_id', organizerId)
  
  const eventIds = events.data?.map(e => e.id) || []
  
  const bookings = await supabase
    .from('bookings')
    .select('total_amount, status')
    .in('event_id', eventIds)
  
  return {
    totalEvents: events.data?.length || 0,
    totalBookings: bookings.data?.length || 0,
    totalRevenue: bookings.data
      ?.filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + b.total_amount, 0) || 0
  }
}
```

### Database Triggers and Functions

```sql
-- Create function to automatically generate QR codes
CREATE OR REPLACE FUNCTION generate_qr_code_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate QR code data when booking is confirmed
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    NEW.qr_code_data = NEW.booking_reference || '|' || NEW.event_id || '|' || NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for QR code generation
CREATE TRIGGER trigger_generate_qr_code
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION generate_qr_code_data();

-- Function to create individual tickets when booking is confirmed
CREATE OR REPLACE FUNCTION create_tickets_for_booking()
RETURNS TRIGGER AS $$
DECLARE
  i INTEGER;
  attendee_name TEXT;
  attendee_email TEXT;
BEGIN
  -- Create individual tickets when booking is confirmed
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    FOR i IN 1..NEW.quantity LOOP
      -- Extract attendee info for this ticket
      attendee_name = (NEW.attendee_info->'names'->>(i-1))::TEXT;
      attendee_email = (NEW.attendee_info->'emails'->>(i-1))::TEXT;
      
      INSERT INTO tickets (
        booking_id,
        event_id,
        user_id,
        ticket_number,
        attendee_name,
        attendee_email,
        qr_code_data,
        status
      ) VALUES (
        NEW.id,
        NEW.event_id,
        NEW.user_id,
        generate_ticket_number(),
        attendee_name,
        attendee_email,
        NEW.booking_reference || '|' || NEW.event_id || '|' || i,
        'valid'
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for ticket generation
CREATE TRIGGER trigger_create_tickets
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION create_tickets_for_booking();
```

---

# Security Implementation

## Row Level Security Policies

### Applied to All Tables

```sql
-- Example: Events table RLS policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Anyone can view published events
CREATE POLICY "Anyone can view published events" ON events
  FOR SELECT USING (is_published = true);

-- Organizers can view their own events (including unpublished)
CREATE POLICY "Organizers can view own events" ON events
  FOR SELECT USING (auth.uid() = organizer_id);

-- Organizers can create events
CREATE POLICY "Organizers can create events" ON events
  FOR INSERT WITH CHECK (
    auth.uid() = organizer_id AND
    auth.jwt() ->> 'role' IN ('organizer', 'admin')
  );

-- Organizers can update their own events
CREATE POLICY "Organizers can update own events" ON events
  FOR UPDATE USING (
    auth.uid() = organizer_id AND
    auth.jwt() ->> 'role' IN ('organizer', 'admin')
  );

-- Admins can manage all events
CREATE POLICY "Admins can manage all events" ON events
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

### Authentication Middleware

```typescript
// middleware.ts - Enhanced with role checking
export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)
  
  // Refresh session
  await supabase.auth.getSession()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  // Protect authenticated routes
  const protectedRoutes = ['/dashboard', '/admin', '/api/v1/bookings']
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/auth/signin', request.url)
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return Response.redirect(redirectUrl)
  }
  
  // Role-based access control
  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    const userRole = profile?.role || 'attendee'
    
    // Admin routes
    if (request.nextUrl.pathname.startsWith('/admin') && userRole !== 'admin') {
      return Response.redirect(new URL('/dashboard', request.url))
    }
    
    // Organizer routes
    if (request.nextUrl.pathname.startsWith('/dashboard/organizer') && 
        !['organizer', 'admin'].includes(userRole)) {
      return Response.redirect(new URL('/dashboard/attendee', request.url))
    }
  }
  
  return response
}
```

---

# Development Workflow

## Using MCP for Rapid Development

### 1. Schema Development
```bash
# Use MCP to create and test tables
CREATE TABLE test_events AS SELECT * FROM events LIMIT 0;
INSERT INTO test_events (title, organizer_id, start_date, ...) VALUES (...);
SELECT * FROM test_events;
DROP TABLE test_events;
```

### 2. Query Testing
```bash
# Test complex joins
SELECT 
  e.title,
  c.name as category,
  o.full_name as organizer,
  COUNT(b.id) as booking_count,
  SUM(b.total_amount) as revenue
FROM events e
LEFT JOIN event_categories c ON e.category_id = c.id
LEFT JOIN profiles o ON e.organizer_id = o.id
LEFT JOIN bookings b ON e.id = b.event_id AND b.status = 'confirmed'
GROUP BY e.id, e.title, c.name, o.full_name
ORDER BY revenue DESC;
```

### 3. Performance Testing
```bash
# Test query performance
EXPLAIN ANALYZE SELECT * FROM events WHERE start_date > NOW();
```

### 4. Data Seeding
```bash
# Create sample data for testing
INSERT INTO profiles (id, email, full_name, role) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'organizer@test.com', 'John Organizer', 'organizer'),
('123e4567-e89b-12d3-a456-426614174001', 'attendee@test.com', 'Jane Attendee', 'attendee');
```

## Component Development Checklist

### For Each New Page:

1. **✅ Design Review**
   - [ ] Identify required Untitled UI components
   - [ ] Plan responsive layout
   - [ ] Define user interactions

2. **✅ Database Integration**
   - [ ] Map required database tables
   - [ ] Test queries with MCP
   - [ ] Implement RLS policies

3. **✅ API Development**
   - [ ] Create API endpoints
   - [ ] Add input validation
   - [ ] Implement error handling
   - [ ] Test with different user roles

4. **✅ Component Implementation**
   - [ ] Build React components
   - [ ] Add TypeScript interfaces
   - [ ] Implement loading states
   - [ ] Add error boundaries

5. **✅ Security Testing**
   - [ ] Test RLS policies
   - [ ] Verify role-based access
   - [ ] Test authentication flows
   - [ ] Validate input sanitization

6. **✅ Integration Testing**
   - [ ] Test complete user flows
   - [ ] Verify payment integration
   - [ ] Test email notifications
   - [ ] Validate QR code generation

---

This comprehensive guide provides everything needed to implement each page of your Event Management & Ticket Booking System using the existing Untitled UI components, Supabase backend, and security framework. Each section includes practical code examples, database queries, and integration patterns that you can directly apply to your project.

The guide is designed to be used alongside the Supabase MCP integration for rapid development and testing of database operations, making it easy to iterate and refine your implementation.