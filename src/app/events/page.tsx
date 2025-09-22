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


interface EventsPageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const resolvedSearchParams = await searchParams
  
  const eventsData = await getEvents(resolvedSearchParams)

  return (
    <MainLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <EventsPageClient
          initialEvents={eventsData.events}
          initialTotal={eventsData.total}
          searchParams={resolvedSearchParams}
        />
      </Suspense>
    </MainLayout>
  )
}