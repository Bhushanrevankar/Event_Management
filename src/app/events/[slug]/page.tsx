import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EventDetailClient } from './event-detail-client'
import type { Tables } from '@/lib/supabase/database.types'

interface Props {
  params: { slug: string }
}

type Event = Tables<'events'> & {
  profiles: Tables<'profiles'> | null
}

async function getEventBySlug(slug: string): Promise<Event | null> {
  const supabase = await createClient()
  
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
    console.error('Error fetching event:', error)
    return null
  }

  return data
}

export default async function EventDetailPage({ params }: Props) {
  const event = await getEventBySlug(params.slug)

  if (!event) {
    notFound()
  }

  // Transform event for client component
  const transformedEvent = {
    ...event,
    category: event.tags && event.tags.length > 0 ? {
      name: event.tags[0],
      color_hex: '#6366f1'
    } : null,
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