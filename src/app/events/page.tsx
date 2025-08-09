import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { EventsPageClient } from '@/components/events/events-page-client'
import { MainLayout } from '@/components/layout/main-layout'
import type { Tables } from '@/lib/supabase/database.types'

type Event = Tables<'events'> & {
  profiles: Tables<'profiles'> | null
}

async function getEvents(searchParams: Record<string, string>): Promise<{
  events: Event[]
  total: number
}> {
  const supabase = await createClient()
  
  let query = supabase
    .from('events')
    .select(`
      *,
      profiles (*)
    `)
    .eq('is_published', true)

  // Apply filters
  if (searchParams.search) {
    query = query.or(`title.ilike.%${searchParams.search}%,short_description.ilike.%${searchParams.search}%`)
  }

  if (searchParams.category) {
    // Filter by tags instead of categories
    query = query.contains('tags', [searchParams.category])
  }

  if (searchParams.location) {
    query = query.or(`venue_name.ilike.%${searchParams.location}%,venue_address.ilike.%${searchParams.location}%`)
  }

  if (searchParams.priceMin) {
    query = query.gte('base_price', parseInt(searchParams.priceMin))
  }

  if (searchParams.priceMax) {
    query = query.lte('base_price', parseInt(searchParams.priceMax))
  }

  // Apply sorting
  const sortBy = searchParams.sortBy || 'date_asc'
  switch (sortBy) {
    case 'date_desc':
      query = query.order('start_date', { ascending: false })
      break
    case 'price_asc':
      query = query.order('base_price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('base_price', { ascending: false })
      break
    default:
      query = query.order('start_date', { ascending: true })
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching events:', error)
    return { events: [], total: 0 }
  }

  return {
    events: data || [],
    total: count || 0
  }
}

// Use hardcoded categories since event_categories table was removed
function getCategories() {
  return [
    { id: '1', name: 'Technology', slug: 'technology', description: 'Tech conferences, workshops, and meetups', is_active: true, sort_order: 1, created_at: '', updated_at: '' },
    { id: '2', name: 'Music', slug: 'music', description: 'Concerts, festivals, and live music events', is_active: true, sort_order: 2, created_at: '', updated_at: '' },
    { id: '3', name: 'Sports', slug: 'sports', description: 'Sports events, tournaments, and fitness activities', is_active: true, sort_order: 3, created_at: '', updated_at: '' },
    { id: '4', name: 'Arts & Culture', slug: 'arts-culture', description: 'Art exhibitions, theater shows, and cultural events', is_active: true, sort_order: 4, created_at: '', updated_at: '' },
    { id: '5', name: 'Food & Drink', slug: 'food-drink', description: 'Food festivals, wine tastings, and culinary events', is_active: true, sort_order: 5, created_at: '', updated_at: '' },
    { id: '6', name: 'Business', slug: 'business', description: 'Professional conferences, networking, and seminars', is_active: true, sort_order: 6, created_at: '', updated_at: '' },
    { id: '7', name: 'Health & Wellness', slug: 'health-wellness', description: 'Yoga, meditation, and wellness workshops', is_active: true, sort_order: 7, created_at: '', updated_at: '' },
    { id: '8', name: 'Education', slug: 'education', description: 'Workshops, classes, and educational seminars', is_active: true, sort_order: 8, created_at: '', updated_at: '' }
  ]
}

interface EventsPageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const resolvedSearchParams = await searchParams
  
  const eventsData = await getEvents(resolvedSearchParams)
  const categories = getCategories()

  return (
    <MainLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <EventsPageClient 
          initialEvents={eventsData.events}
          initialTotal={eventsData.total}
          categories={categories}
          searchParams={resolvedSearchParams}
        />
      </Suspense>
    </MainLayout>
  )
}