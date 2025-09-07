import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EventsListClient } from './events-list-client'
import type { Tables } from '@/lib/supabase/database.types'

type Event = Tables<'events'> & {
  _count?: {
    bookings: number
  }
  total_bookings?: number
  total_revenue?: number
}

async function getOrganizerEvents(userId: string): Promise<Event[]> {
  const supabase = await createClient()
  
  const { data: events, error } = await supabase
    .from('events')
    .select(`
      *,
      bookings (
        id,
        status,
        total_amount
      )
    `)
    .eq('organizer_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching organizer events:', error)
    return []
  }

  // Calculate stats for each event
  const eventsWithStats = events?.map(event => {
    const confirmedBookings = (event.bookings as any[])?.filter(booking => booking.status === 'confirmed') || []
    const totalBookings = confirmedBookings.length
    const totalRevenue = confirmedBookings.reduce((sum: number, booking: any) => sum + booking.total_amount, 0)

    return {
      ...event,
      bookings: undefined, // Remove the nested bookings to avoid type issues
      total_bookings: totalBookings,
      total_revenue: totalRevenue
    }
  }) || []

  return eventsWithStats
}

export default async function EventsListPage() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/signin?redirectTo=/dashboard/organizer/events')
  }

  // Check if user is an organizer
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'organizer') {
    redirect('/dashboard/attendee')
  }

  // Get organizer's events
  const events = await getOrganizerEvents(session.user.id)

  return <EventsListClient events={events} user={session.user} />
}