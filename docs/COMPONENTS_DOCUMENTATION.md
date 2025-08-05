# Components Documentation

## Overview

This document outlines all components used in the Event Management & Ticket Booking System, building upon the existing Untitled UI Next.js starter kit. Components are organized by category and include usage examples, props interfaces, and best practices.

## Component Architecture

The component system follows a layered architecture:

1. **Base UI Components** - Untitled UI foundation components
2. **Business Logic Components** - Event management specific components
3. **Layout Components** - Page structure and navigation
4. **Feature Components** - Complete user flows and interactions

## Existing Untitled UI Components

### Base Components (Already Available)

These components are already part of your Untitled UI starter kit and can be used directly:

#### Form Components
```typescript
// Available in src/components/base/
import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'
import { Textarea } from '@/components/base/textarea/textarea'
import { Select } from '@/components/base/select/select'
import { Checkbox } from '@/components/base/checkbox/checkbox'
import { RadioButtons } from '@/components/base/radio-buttons/radio-buttons'
import { Toggle } from '@/components/base/toggle/toggle'
import { Slider } from '@/components/base/slider/slider'
import { DatePicker } from '@/components/application/date-picker/date-picker'
```

#### Display Components
```typescript
// Available in src/components/base/
import { Avatar } from '@/components/base/avatar/avatar'
import { Badge } from '@/components/base/badges/badges'
import { Card } from '@/components/ui/card' // If using shadcn/ui integration
import { Table } from '@/components/application/table/table'
import { Pagination } from '@/components/application/pagination/pagination'
import { Tabs } from '@/components/application/tabs/tabs'
import { Modal } from '@/components/application/modals/modal'
import { Tooltip } from '@/components/base/tooltip/tooltip'
```

#### Navigation Components
```typescript
// Available in src/components/application/app-navigation/
import { HeaderNavigation } from '@/components/application/app-navigation/header-navigation'
import { SidebarNavigation } from '@/components/application/app-navigation/sidebar-navigation-base'
```

## Event Management Components to Create

### Authentication Components

#### SignInForm
```typescript
// src/components/auth/signin-form.tsx
import { useState } from 'react'
import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'
import { useAuth } from '@/hooks/auth/use-auth'

interface SignInFormProps {
  onSuccess?: () => void
  redirectTo?: string
}

export function SignInForm({ onSuccess, redirectTo }: SignInFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await signIn({ email, password })
      onSuccess?.()
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
      <Button 
        type="submit" 
        className="w-full"
        loading={isLoading}
      >
        Sign In
      </Button>
    </form>
  )
}
```

#### SignUpForm
```typescript
// src/components/auth/signup-form.tsx
interface SignUpFormProps {
  onSuccess?: () => void
  defaultRole?: 'attendee' | 'organizer'
}

export function SignUpForm({ onSuccess, defaultRole = 'attendee' }: SignUpFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: defaultRole
  })
  
  // Implementation similar to SignInForm
  // Include role selection with RadioButtons component
}
```

#### ProtectedRoute
```typescript
// src/components/auth/protected-route.tsx
import { useAuth } from '@/hooks/auth/use-auth'
import { LoadingIndicator } from '@/components/application/loading-indicator/loading-indicator'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'attendee' | 'organizer' | 'admin'
  fallback?: React.ReactNode
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallback 
}: ProtectedRouteProps) {
  const { user, loading, hasRole } = useAuth()

  if (loading) {
    return <LoadingIndicator />
  }

  if (!user) {
    return fallback || <SignInForm />
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <div>Access denied</div>
  }

  return <>{children}</>
}
```

### Event Components

#### EventCard
```typescript
// src/components/events/event-card.tsx
import { Avatar } from '@/components/base/avatar/avatar'
import { Badge } from '@/components/base/badges/badges'
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icons'
import { formatDate, formatPrice } from '@/lib/utils'

interface EventCardProps {
  event: {
    id: string
    title: string
    shortDescription: string
    featuredImageUrl: string
    startDate: string
    endDate: string
    venueName: string
    basePrice: number
    currency: string
    availableSeats: number
    totalCapacity: number
    category: {
      name: string
      slug: string
      colorHex: string
    }
    organizer: {
      fullName: string
      avatarUrl?: string
    }
    isFeatured: boolean
    tags: string[]
  }
  variant?: 'default' | 'featured' | 'compact'
  onClick?: () => void
}

export function EventCard({ event, variant = 'default', onClick }: EventCardProps) {
  const isAlmostSoldOut = event.availableSeats / event.totalCapacity < 0.1

  return (
    <div 
      className={cx(
        "bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer",
        variant === 'featured' && "ring-2 ring-primary-500",
        variant === 'compact' && "flex"
      )}
      onClick={onClick}
    >
      {/* Event Image */}
      <div className={cx(
        "relative",
        variant === 'compact' ? "w-48" : "aspect-video"
      )}>
        <img 
          src={event.featuredImageUrl} 
          alt={event.title}
          className="w-full h-full object-cover"
        />
        {event.isFeatured && (
          <Badge 
            variant="solid" 
            color="primary"
            className="absolute top-3 left-3"
          >
            Featured
          </Badge>
        )}
        {isAlmostSoldOut && (
          <Badge 
            variant="solid" 
            color="warning"
            className="absolute top-3 right-3"
          >
            Almost Sold Out
          </Badge>
        )}
      </div>

      {/* Event Content */}
      <div className="p-6 flex-1">
        {/* Category & Date */}
        <div className="flex items-center justify-between mb-3">
          <Badge 
            variant="soft" 
            style={{ backgroundColor: `${event.category.colorHex}20`, color: event.category.colorHex }}
          >
            {event.category.name}
          </Badge>
          <span className="text-sm text-gray-500">
            {formatDate(event.startDate)}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {event.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {event.shortDescription}
        </p>

        {/* Venue & Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <FeaturedIcon name="map-pin" className="w-4 h-4 mr-1" />
            {event.venueName}
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {formatPrice(event.basePrice, event.currency)}
          </div>
        </div>

        {/* Organizer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar 
              src={event.organizer.avatarUrl} 
              name={event.organizer.fullName}
              size="sm"
            />
            <span className="ml-2 text-sm text-gray-600">
              {event.organizer.fullName}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {event.availableSeats} seats left
          </span>
        </div>

        {/* Tags */}
        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {event.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" size="sm">
                {tag}
              </Badge>
            ))}
            {event.tags.length > 3 && (
              <Badge variant="outline" size="sm">
                +{event.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
```

#### EventList
```typescript
// src/components/events/event-list.tsx
import { EventCard } from './event-card'
import { EmptyState } from '@/components/application/empty-state/empty-state'
import { LoadingIndicator } from '@/components/application/loading-indicator/loading-indicator'
import { Pagination } from '@/components/application/pagination/pagination'

interface EventListProps {
  events: Event[]
  loading?: boolean
  error?: string
  pagination?: {
    page: number
    totalPages: number
    onPageChange: (page: number) => void
  }
  variant?: 'grid' | 'list'
  onEventClick?: (event: Event) => void
}

export function EventList({ 
  events, 
  loading, 
  error, 
  pagination, 
  variant = 'grid',
  onEventClick 
}: EventListProps) {
  if (loading) {
    return <LoadingIndicator />
  }

  if (error) {
    return (
      <EmptyState
        title="Error loading events"
        description={error}
        action={
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        }
      />
    )
  }

  if (events.length === 0) {
    return (
      <EmptyState
        title="No events found"
        description="Try adjusting your filters or search criteria"
      />
    )
  }

  return (
    <div>
      <div className={cx(
        variant === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
      )}>
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            variant={variant === 'list' ? 'compact' : 'default'}
            onClick={() => onEventClick?.(event)}
          />
        ))}
      </div>

      {pagination && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </div>
  )
}
```

#### EventFilters
```typescript
// src/components/events/event-filters.tsx
import { Select } from '@/components/base/select/select'
import { Input } from '@/components/base/input/input'
import { DatePicker } from '@/components/application/date-picker/date-picker'
import { Button } from '@/components/base/buttons/button'
import { Slider } from '@/components/base/slider/slider'

interface EventFiltersProps {
  filters: {
    search: string
    category: string
    location: string
    dateFrom: string
    dateTo: string
    priceMin: number
    priceMax: number
  }
  categories: Array<{ id: string; name: string; slug: string }>
  onFiltersChange: (filters: any) => void
  onClearFilters: () => void
}

export function EventFilters({ 
  filters, 
  categories, 
  onFiltersChange, 
  onClearFilters 
}: EventFiltersProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          Clear All
        </Button>
      </div>

      <div className="space-y-6">
        {/* Search */}
        <Input
          label="Search events"
          placeholder="Event name, description..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
        />

        {/* Category */}
        <Select
          label="Category"
          value={filters.category}
          onValueChange={(value) => onFiltersChange({ ...filters, category: value })}
        >
          <SelectItem value="">All Categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.slug}>
              {category.name}
            </SelectItem>
          ))}
        </Select>

        {/* Location */}
        <Input
          label="Location"
          placeholder="City, venue..."
          value={filters.location}
          onChange={(e) => onFiltersChange({ ...filters, location: e.target.value })}
        />

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <DatePicker
            label="From Date"
            value={filters.dateFrom}
            onChange={(date) => onFiltersChange({ ...filters, dateFrom: date })}
          />
          <DatePicker
            label="To Date"
            value={filters.dateTo}
            onChange={(date) => onFiltersChange({ ...filters, dateTo: date })}
          />
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Price Range: ₹{filters.priceMin} - ₹{filters.priceMax}
          </label>
          <Slider
            value={[filters.priceMin, filters.priceMax]}
            onValueChange={([min, max]) => 
              onFiltersChange({ ...filters, priceMin: min, priceMax: max })
            }
            max={10000}
            step={100}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}
```

### Booking Components

#### BookingForm
```typescript
// src/components/booking/booking-form.tsx
import { useState } from 'react'
import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'
import { Textarea } from '@/components/base/textarea/textarea'
import { Card } from '@/components/ui/card'

interface BookingFormProps {
  event: Event
  onSubmit: (bookingData: BookingData) => Promise<void>
  maxTickets?: number
}

export function BookingForm({ event, onSubmit, maxTickets = 10 }: BookingFormProps) {
  const [quantity, setQuantity] = useState(1)
  const [attendeeInfo, setAttendeeInfo] = useState({
    names: [''],
    emails: [''],
    phones: ['']
  })
  const [specialRequests, setSpecialRequests] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalAmount = quantity * event.basePrice

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity)
    // Adjust attendee info arrays
    const newAttendeeInfo = {
      names: Array(newQuantity).fill('').map((_, i) => attendeeInfo.names[i] || ''),
      emails: Array(newQuantity).fill('').map((_, i) => attendeeInfo.emails[i] || ''),
      phones: Array(newQuantity).fill('').map((_, i) => attendeeInfo.phones[i] || '')
    }
    setAttendeeInfo(newAttendeeInfo)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit({
        eventId: event.id,
        quantity,
        attendeeInfo,
        specialRequests,
        promoCode: promoCode || undefined
      })
    } catch (error) {
      // Handle error
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Quantity Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Select Tickets</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{event.title}</p>
            <p className="text-sm text-gray-600">₹{event.basePrice} per ticket</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              -
            </Button>
            <span className="text-lg font-semibold px-4">{quantity}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(Math.min(maxTickets, quantity + 1))}
              disabled={quantity >= maxTickets}
            >
              +
            </Button>
          </div>
        </div>
      </Card>

      {/* Attendee Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Attendee Information</h3>
        <div className="space-y-4">
          {Array.from({ length: quantity }).map((_, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium mb-3">Attendee {index + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Full Name"
                  value={attendeeInfo.names[index]}
                  onChange={(e) => {
                    const newNames = [...attendeeInfo.names]
                    newNames[index] = e.target.value
                    setAttendeeInfo({ ...attendeeInfo, names: newNames })
                  }}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={attendeeInfo.emails[index]}
                  onChange={(e) => {
                    const newEmails = [...attendeeInfo.emails]
                    newEmails[index] = e.target.value
                    setAttendeeInfo({ ...attendeeInfo, emails: newEmails })
                  }}
                  required
                />
                <Input
                  label="Phone (Optional)"
                  type="tel"
                  value={attendeeInfo.phones[index]}
                  onChange={(e) => {
                    const newPhones = [...attendeeInfo.phones]
                    newPhones[index] = e.target.value
                    setAttendeeInfo({ ...attendeeInfo, phones: newPhones })
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Special Requests */}
      <Card className="p-6">
        <Textarea
          label="Special Requests (Optional)"
          placeholder="Any special requirements or requests..."
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          rows={3}
        />
      </Card>

      {/* Promo Code */}
      <Card className="p-6">
        <Input
          label="Promo Code (Optional)"
          placeholder="Enter promo code"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
        />
      </Card>

      {/* Summary */}
      <Card className="p-6 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-2xl font-bold">₹{totalAmount.toFixed(2)}</span>
        </div>
        <Button 
          type="submit" 
          className="w-full" 
          size="lg"
          loading={isSubmitting}
        >
          Proceed to Payment
        </Button>
      </Card>
    </form>
  )
}
```

#### BookingCard
```typescript
// src/components/booking/booking-card.tsx
import { Badge } from '@/components/base/badges/badges'
import { Button } from '@/components/base/buttons/button'
import { formatDate, formatPrice } from '@/lib/utils'

interface BookingCardProps {
  booking: {
    id: string
    bookingReference: string
    event: {
      title: string
      featuredImageUrl: string
      startDate: string
      venueName: string
    }
    quantity: number
    totalAmount: number
    currency: string
    status: 'pending' | 'confirmed' | 'cancelled'
    paymentStatus: 'pending' | 'completed' | 'failed'
    qrCodeUrl?: string
    createdAt: string
  }
  onViewDetails?: () => void
  onDownloadTicket?: () => void
  onCancel?: () => void
}

export function BookingCard({ 
  booking, 
  onViewDetails, 
  onDownloadTicket, 
  onCancel 
}: BookingCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success'
      case 'pending': return 'warning'
      case 'cancelled': return 'error'
      default: return 'secondary'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex">
        {/* Event Image */}
        <div className="w-32 h-32 flex-shrink-0">
          <img 
            src={booking.event.featuredImageUrl} 
            alt={booking.event.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Booking Details */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {booking.event.title}
              </h3>
              <p className="text-sm text-gray-600">
                {formatDate(booking.event.startDate)} • {booking.event.venueName}
              </p>
            </div>
            <div className="flex space-x-2">
              <Badge variant="solid" color={getStatusColor(booking.status)}>
                {booking.status}
              </Badge>
              <Badge variant="outline" color={getStatusColor(booking.paymentStatus)}>
                {booking.paymentStatus}
              </Badge>
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-gray-600">
                Booking: {booking.bookingReference}
              </p>
              <p className="text-sm text-gray-600">
                {booking.quantity} ticket{booking.quantity > 1 ? 's' : ''} • {formatPrice(booking.totalAmount, booking.currency)}
              </p>
            </div>

            <div className="flex space-x-2">
              {booking.status === 'confirmed' && booking.qrCodeUrl && (
                <Button variant="outline" size="sm" onClick={onDownloadTicket}>
                  Download Ticket
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onViewDetails}>
                View Details
              </Button>
              {booking.status === 'confirmed' && (
                <Button variant="outline" size="sm" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Dashboard Components

#### StatsCard
```typescript
// src/components/dashboard/stats-card.tsx
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icons'

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
    period: string
  }
  icon: string
  color?: 'primary' | 'success' | 'warning' | 'error'
}

export function StatsCard({ title, value, change, icon, color = 'primary' }: StatsCardProps) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-yellow-50 text-yellow-600',
    error: 'bg-red-50 text-red-600'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              <FeaturedIcon 
                name={change.type === 'increase' ? 'trending-up' : 'trending-down'}
                className={`w-4 h-4 mr-1 ${
                  change.type === 'increase' ? 'text-green-500' : 'text-red-500'
                }`}
              />
              <span className={`text-sm ${
                change.type === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(change.value)}% {change.period}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <FeaturedIcon name={icon} className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}
```

#### RecentActivity
```typescript
// src/components/dashboard/recent-activity.tsx
import { Avatar } from '@/components/base/avatar/avatar'
import { formatDate } from '@/lib/utils'

interface Activity {
  id: string
  type: 'booking' | 'event_created' | 'payment' | 'cancellation'
  title: string
  description: string
  timestamp: string
  user?: {
    name: string
    avatarUrl?: string
  }
  amount?: number
}

interface RecentActivityProps {
  activities: Activity[]
  maxItems?: number
}

export function RecentActivity({ activities, maxItems = 10 }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return 'ticket'
      case 'event_created': return 'calendar-plus'
      case 'payment': return 'credit-card'
      case 'cancellation': return 'x-circle'
      default: return 'bell'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'booking': return 'text-blue-600'
      case 'event_created': return 'text-green-600'
      case 'payment': return 'text-green-600'
      case 'cancellation': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {activities.slice(0, maxItems).map((activity) => (
          <div key={activity.id} className="p-6 flex items-start space-x-4">
            <div className={`p-2 rounded-lg bg-gray-50 ${getActivityColor(activity.type)}`}>
              <FeaturedIcon name={getActivityIcon(activity.type)} className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(activity.timestamp)}
                </p>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {activity.description}
              </p>
              {activity.user && (
                <div className="flex items-center mt-2">
                  <Avatar 
                    src={activity.user.avatarUrl} 
                    name={activity.user.name}
                    size="xs"
                  />
                  <span className="ml-2 text-xs text-gray-500">
                    {activity.user.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Payment Components

#### PaymentForm (Razorpay Integration)
```typescript
// src/components/payment/razorpay-checkout.tsx
import { useEffect } from 'react'
import { Button } from '@/components/base/buttons/button'
import { Card } from '@/components/ui/card'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface RazorpayCheckoutProps {
  order: {
    id: string
    amount: number
    currency: string
    receipt: string
  }
  keyId: string
  userDetails: {
    name: string
    email: string
    contact: string
  }
  onSuccess: (paymentId: string, signature: string) => void
  onError: (error: any) => void
  loading?: boolean
}

export function RazorpayCheckout({
  order,
  keyId,
  userDetails,
  onSuccess,
  onError,
  loading = false
}: RazorpayCheckoutProps) {
  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handlePayment = () => {
    const options = {
      key: keyId,
      amount: order.amount,
      currency: order.currency,
      name: 'EventBooking',
      description: 'Event Ticket Booking',
      order_id: order.id,
      prefill: {
        name: userDetails.name,
        email: userDetails.email,
        contact: userDetails.contact,
      },
      theme: {
        color: '#7c3aed',
      },
      handler: function (response: any) {
        onSuccess(response.razorpay_payment_id, response.razorpay_signature)
      },
      modal: {
        ondismiss: function () {
          onError(new Error('Payment cancelled by user'))
        },
      },
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
  }

  return (
    <Card className="p-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">Complete Payment</h3>
        <p className="text-gray-600 mb-6">
          Amount: ₹{(order.amount / 100).toFixed(2)}
        </p>
        <Button 
          onClick={handlePayment} 
          size="lg" 
          className="w-full"
          loading={loading}
        >
          Pay Now
        </Button>
      </div>
    </Card>
  )
}
```

### QR Code Components

#### QRCodeDisplay
```typescript
// src/components/tickets/qr-code-display.tsx
import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { Button } from '@/components/base/buttons/button'

interface QRCodeDisplayProps {
  data: string
  size?: number
  downloadable?: boolean
  filename?: string
}

export function QRCodeDisplay({ 
  data, 
  size = 256, 
  downloadable = false, 
  filename = 'ticket-qr' 
}: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, data, { width: size }, (error) => {
        if (error) console.error('QR Code generation error:', error)
      })
    }
  }, [data, size])

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a')
      link.download = `${filename}.png`
      link.href = canvasRef.current.toDataURL()
      link.click()
    }
  }

  return (
    <div className="text-center">
      <canvas ref={canvasRef} className="mx-auto" />
      {downloadable && (
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4"
          onClick={handleDownload}
        >
          Download QR Code
        </Button>
      )}
    </div>
  )
}
```

## Layout Components

### DashboardLayout
```typescript
// src/components/layout/dashboard-layout.tsx
import { useState } from 'react'
import { SidebarNavigation } from '@/components/application/app-navigation/sidebar-navigation-base'
import { HeaderNavigation } from '@/components/application/app-navigation/header-navigation'
import { useAuth } from '@/hooks/auth/use-auth'

interface DashboardLayoutProps {
  children: React.ReactNode
  sidebar?: 'attendee' | 'organizer' | 'admin'
}

export function DashboardLayout({ children, sidebar = 'attendee' }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()

  const navigationConfig = {
    attendee: [
      { label: 'Dashboard', href: '/dashboard/attendee', icon: 'home' },
      { label: 'My Bookings', href: '/dashboard/attendee/bookings', icon: 'ticket' },
      { label: 'My Tickets', href: '/dashboard/attendee/tickets', icon: 'qr-code' },
      { label: 'Favorites', href: '/dashboard/attendee/favorites', icon: 'heart' },
      { label: 'Profile', href: '/dashboard/attendee/profile', icon: 'user' },
    ],
    organizer: [
      { label: 'Dashboard', href: '/dashboard/organizer', icon: 'home' },
      { label: 'My Events', href: '/dashboard/organizer/events', icon: 'calendar' },
      { label: 'Create Event', href: '/dashboard/organizer/events/create', icon: 'plus' },
      { label: 'Analytics', href: '/dashboard/organizer/analytics', icon: 'chart-bar' },
      { label: 'Profile', href: '/dashboard/organizer/profile', icon: 'user' },
    ],
    admin: [
      { label: 'Dashboard', href: '/admin', icon: 'home' },
      { label: 'Users', href: '/admin/users', icon: 'users' },
      { label: 'Events', href: '/admin/events', icon: 'calendar' },
      { label: 'Categories', href: '/admin/categories', icon: 'folder' },
      { label: 'Analytics', href: '/admin/analytics', icon: 'chart-bar' },
      { label: 'Settings', href: '/admin/settings', icon: 'cog' },
    ]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <SidebarNavigation
          items={navigationConfig[sidebar]}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <SidebarNavigation
          items={navigationConfig[sidebar]}
          variant="simple"
        />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <HeaderNavigation 
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
        />
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
```

## Usage Examples

### Complete Event Listing Page
```typescript
// src/app/events/page.tsx
'use client'

import { useState } from 'react'
import { EventList } from '@/components/events/event-list'
import { EventFilters } from '@/components/events/event-filters'
import { useEvents } from '@/hooks/events/use-events'
import { useCategories } from '@/hooks/events/use-categories'

export default function EventsPage() {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
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

        {/* Events List */}
        <div className="lg:col-span-3">
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

### Organizer Dashboard
```typescript
// src/app/dashboard/organizer/page.tsx
'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCard } from '@/components/dashboard/stats-card'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { EventList } from '@/components/events/event-list'
import { useDashboardStats } from '@/hooks/dashboard/use-dashboard-stats'

export default function OrganizerDashboard() {
  const { stats, recentActivity, upcomingEvents, loading } = useDashboardStats('organizer')

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <DashboardLayout sidebar="organizer">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Events"
            value={stats.totalEvents}
            icon="calendar"
            color="primary"
          />
          <StatsCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon="ticket"
            color="success"
          />
          <StatsCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon="currency-rupee"
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
            icon="trending-up"
            color="success"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <RecentActivity activities={recentActivity} />

          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Upcoming Events</h3>
            </div>
            <div className="p-6">
              <EventList
                events={upcomingEvents}
                variant="list"
                onEventClick={(event) => {
                  window.location.href = `/dashboard/organizer/events/${event.id}`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
```

## Component Development Guidelines

### 1. Component Structure
- Use functional components with TypeScript
- Define props interfaces clearly
- Include JSDoc comments for complex components
- Export both component and props interface

### 2. Styling Guidelines
- Use existing Untitled UI components as base
- Extend with Tailwind CSS classes
- Use the `cx()` utility for conditional classes
- Follow the design system color palette

### 3. State Management
- Use local state for component-specific data
- Use custom hooks for complex state logic
- Integrate with global state management for shared data

### 4. Accessibility
- Include proper ARIA labels
- Ensure keyboard navigation
- Use semantic HTML elements
- Test with screen readers

### 5. Performance
- Implement proper memoization with `React.memo`
- Use `useMemo` and `useCallback` for expensive operations
- Lazy load components when appropriate
- Optimize images and assets

This components documentation provides a comprehensive foundation for building your event management system while leveraging the existing Untitled UI starter kit components.