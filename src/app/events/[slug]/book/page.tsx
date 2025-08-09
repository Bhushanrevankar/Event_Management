import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BookingFlowClient } from './booking-flow-client'
import type { Tables } from '@/lib/supabase/database.types'

interface Props {
  params: Promise<{ slug: string }>
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

export default async function BookingPage({ params }: Props) {
  const resolvedParams = await params
  const supabase = await createClient()
  const event = await getEventBySlug(resolvedParams.slug)

  if (!event) {
    notFound()
  }

  // Check authentication
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect(`/auth/signin?redirectTo=/events/${resolvedParams.slug}/book`)
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
    <BookingFlowClient 
      event={transformedEvent} 
      user={session.user}
      availableSeats={event.available_seats}
    />
  )
}