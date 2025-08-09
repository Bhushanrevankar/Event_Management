import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OrganizerDashboardClient } from './organizer-dashboard-client'
import type { Tables } from '@/lib/supabase/database.types'

type Event = Tables<'events'> & {
  _count?: {
    bookings: number
  }
  total_bookings?: number
  total_revenue?: number
}

async function getOrganizerData(userId: string): Promise<{
  events: Event[]
  stats: {
    totalEvents: number
    totalBookings: number
    totalRevenue: number
    thisMonthRevenue: number
  }
}> {
  const supabase = await createClient()
  
  // Fetch organizer's events
  const { data: events, error } = await supabase
    .from('events')
    .select(`
      *,
      bookings (
        quantity,
        total_amount,
        status,
        created_at
      )
    `)
    .eq('organizer_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching organizer events:', error)
    return {
      events: [],
      stats: { totalEvents: 0, totalBookings: 0, totalRevenue: 0, thisMonthRevenue: 0 }
    }
  }

  // Calculate statistics
  let totalBookings = 0
  let totalRevenue = 0
  let thisMonthRevenue = 0
  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const processedEvents = events?.map(event => {
    const confirmedBookings = event.bookings?.filter(booking => booking.status === 'confirmed') || []
    const eventBookings = confirmedBookings.reduce((sum, booking) => sum + booking.quantity, 0)
    const eventRevenue = confirmedBookings.reduce((sum, booking) => sum + booking.total_amount, 0)
    
    totalBookings += eventBookings
    totalRevenue += eventRevenue
    
    // Calculate this month's revenue
    const thisMonthBookings = confirmedBookings.filter(booking => 
      new Date(booking.created_at) >= thisMonth
    )
    thisMonthRevenue += thisMonthBookings.reduce((sum, booking) => sum + booking.total_amount, 0)

    return {
      ...event,
      total_bookings: eventBookings,
      total_revenue: eventRevenue,
      bookings: confirmedBookings.length
    }
  }) || []

  return {
    events: processedEvents,
    stats: {
      totalEvents: events?.length || 0,
      totalBookings,
      totalRevenue,
      thisMonthRevenue
    }
  }
}

export default async function OrganizerDashboard() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/signin?redirectTo=/dashboard/organizer')
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

  // Get organizer's events and stats
  const { events, stats } = await getOrganizerData(session.user.id)

  return (
    <OrganizerDashboardClient 
      events={events}
      stats={stats}
      user={session.user}
    />
  )
}