import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EventDetailClient } from './event-detail-client'
import type { Tables } from '@/lib/supabase/database.types'

interface Props {
  params: Promise<{ slug: string }>
}

type Event = Tables<'events'> & {
  profiles: Tables<'profiles'> | null
}

async function getEventBySlug(slug: string): Promise<Event | null> {
  const supabase = await createClient()
  
  // First check if event exists at all
  const { data: eventCheck, error: checkError } = await supabase
    .from('events')
    .select('id, title, is_published, status')
    .eq('slug', slug)
    .single()

  if (checkError) {
    if (checkError.code === 'PGRST116') {
      console.error(`Event with slug '${slug}' does not exist`)
      return null
    }
    console.error('Error checking event existence:', checkError)
    return null
  }

  if (!eventCheck.is_published) {
    // Event exists but is not published - this is expected behavior for draft events
    return null
  }

  // Now fetch the full event data
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      profiles (*)
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !data) {
    console.error('Error fetching published event:', error)
    return null
  }

  return data
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params
  const event = await getEventBySlug(slug)

  if (!event) {
    notFound()
  }

  // Transform event for client component
  const transformedEvent = {
    ...event,
    organizer: event.profiles ? {
      full_name: event.profiles.full_name,
      avatar_url: event.profiles.avatar_url,
      email: event.profiles.email
    } : null
  }

  return (
    <EventDetailClient 
      event={transformedEvent} 
      availableSeats={event.available_seats}
    />
  )
}