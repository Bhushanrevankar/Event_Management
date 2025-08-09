import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AttendeeDashboardClient } from './attendee-dashboard-client'
import type { Tables } from '@/lib/supabase/database.types'

type Booking = Tables<'bookings'> & {
  events: Tables<'events'> | null
}

async function getUserBookings(userId: string): Promise<{
  bookings: Booking[]
  stats: {
    totalBookings: number
    upcomingEvents: number
    totalSpent: number
  }
}> {
  const supabase = await createClient()
  
  // Fetch user's bookings with event details
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      events (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching bookings:', error)
    return {
      bookings: [],
      stats: { totalBookings: 0, upcomingEvents: 0, totalSpent: 0 }
    }
  }

  const now = new Date()
  const upcomingEvents = bookings?.filter(booking => 
    booking.events && new Date(booking.events.start_date) > now
  ).length || 0

  const totalSpent = bookings?.reduce((sum, booking) => sum + booking.total_amount, 0) || 0

  return {
    bookings: bookings || [],
    stats: {
      totalBookings: bookings?.length || 0,
      upcomingEvents,
      totalSpent
    }
  }
}

export default async function AttendeeDashboard() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/signin?redirectTo=/dashboard/attendee')
  }

  // Get user's bookings and stats
  const { bookings, stats } = await getUserBookings(session.user.id)

  return (
    <AttendeeDashboardClient 
      bookings={bookings}
      stats={stats}
      user={session.user}
    />
  )
}