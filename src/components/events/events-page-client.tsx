'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EventList } from '@/components/events/event-list'
import { Input } from '@/components/base/input/input'
import { Select } from '@/components/base/select/select'
import { Button } from '@/components/base/buttons/button'
import type { Tables } from '@/lib/supabase/database.types'

type Event = Tables<'events'> & {
  profiles: Tables<'profiles'> | null
}

type Category = {
  id: string
  name: string
  slug: string
  description: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

interface EventsPageClientProps {
  initialEvents: Event[]
  initialTotal: number
  categories: Category[]
  searchParams: Record<string, string>
}

export function EventsPageClient({
  initialEvents,
  initialTotal,
  categories,
  searchParams
}: EventsPageClientProps) {
  const router = useRouter()
  const [filters, setFilters] = useState({
    search: searchParams.search || '',
    category: searchParams.category || '',
    location: searchParams.location || '',
    priceMin: searchParams.priceMin ? parseInt(searchParams.priceMin) : 0,
    priceMax: searchParams.priceMax ? parseInt(searchParams.priceMax) : 10000
  })

  const handleEventClick = (event: Event) => {
    router.push(`/events/${event.slug}`)
  }

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // Update URL with new filters
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== '' && v !== 0) {
        params.set(k, v.toString())
      }
    })
    
    const newUrl = params.toString() ? `/events?${params.toString()}` : '/events'
    router.push(newUrl)
  }

  const handleSortChange = (sortBy: string) => {
    const params = new URLSearchParams(window.location.search)
    params.set('sortBy', sortBy)
    router.push(`/events?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      location: '',
      priceMin: 0,
      priceMax: 10000
    })
    router.push('/events')
  }

  // Transform events for EventList component
  const transformedEvents = initialEvents.map(event => ({
    ...event,
    category: event.tags && event.tags.length > 0 ? {
      name: event.tags[0],
      color_hex: '#6366f1'
    } : null,
    organizer: event.profiles ? {
      full_name: event.profiles.full_name,
      avatar_url: event.profiles.avatar_url
    } : null
  }))

  const pagination = {
    page: 1,
    total: initialTotal,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  }

  const categoryOptions = [
    { id: '', label: 'All Categories' },
    ...categories.map(cat => ({ id: cat.slug, label: cat.name }))
  ]

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
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Filters</h3>
              <Button
                color="link-color"
                size="sm"
                onClick={clearFilters}
              >
                Clear All
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Events
                </label>
                <Input
                  placeholder="Event name, organizer..."
                  value={filters.search}
                  onChange={(value) => handleFilterChange('search', value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <Select 
                  selectedKey={filters.category || null} 
                  onSelectionChange={(value) => handleFilterChange('category', value || '')}
                  placeholder="All Categories"
                  items={categoryOptions}
                >
                  {(item) => (
                    <Select.Item key={item.id} id={item.id}>
                      {item.label}
                    </Select.Item>
                  )}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <Input
                  placeholder="City or venue..."
                  value={filters.location}
                  onChange={(value) => handleFilterChange('location', value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Min price"
                    value={filters.priceMin.toString()}
                    onChange={(value) => handleFilterChange('priceMin', parseInt(value) || 0)}
                  />
                  <Input
                    type="number"
                    placeholder="Max price"
                    value={filters.priceMax.toString()}
                    onChange={(value) => handleFilterChange('priceMax', parseInt(value) || 10000)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="lg:col-span-3">
          <div className="mb-6 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {initialTotal} events found
            </p>
            
            <Select 
              defaultSelectedKey={searchParams.sortBy || "date_asc"} 
              placeholder="Sort by"
              onSelectionChange={(value) => handleSortChange(value as string)}
              items={[
                { id: 'date_asc', label: 'Date (Earliest first)' },
                { id: 'date_desc', label: 'Date (Latest first)' },
                { id: 'price_asc', label: 'Price (Low to high)' },
                { id: 'price_desc', label: 'Price (High to low)' }
              ]}
            >
              {(item) => (
                <Select.Item key={item.id} id={item.id}>
                  {item.label}
                </Select.Item>
              )}
            </Select>
          </div>

          <EventList
            events={transformedEvents}
            loading={false}
            error={null}
            pagination={pagination}
            onEventClick={handleEventClick}
          />
        </div>
      </div>
    </div>
  )
}