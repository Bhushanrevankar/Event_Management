import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminDashboardClient } from './admin-dashboard-client'
import type { Tables } from '@/lib/supabase/database.types'

type Event = Tables<'events'> & {
  profiles: Tables<'profiles'> | null
  bookings?: Tables<'bookings'>[]
}

async function getAdminData(): Promise<{
  events: Event[]
  stats: {
    totalUsers: number
    totalEvents: number
    totalBookings: number
    platformRevenue: number
  }
}> {
  const supabase = await createClient()
  
  // Get platform statistics
  const [
    { count: totalUsers },
    { count: totalEvents },
    { count: totalBookings },
    { data: payments }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('payments').select('amount').eq('status', 'completed')
  ])

  const platformRevenue = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0

  // Get recent events with organizer info
  const { data: events, error } = await supabase
    .from('events')
    .select(`
      *,
      profiles (
        full_name,
        email
      ),
      bookings (
        id,
        status,
        total_amount
      )
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching admin data:', error)
  }

  return {
    events: events || [],
    stats: {
      totalUsers: totalUsers || 0,
      totalEvents: totalEvents || 0,
      totalBookings: totalBookings || 0,
      platformRevenue
    }
  }
}

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/signin?redirectTo=/admin')
  }

  // Check if user is an admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard/attendee')
  }

  // Get admin dashboard data
  const { events, stats } = await getAdminData()

  return (
    <AdminDashboardClient 
      events={events}
      stats={stats}
      user={session.user}
    />
  )
}