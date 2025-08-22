import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OrganizerEventsClient } from './organizer-events-client'

export default async function OrganizerEventsPage() {
  const supabase = await createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/signin?redirectTo=/dashboard/organizer/events')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'organizer') {
    redirect('/dashboard/attendee')
  }

  const { data: events, error } = await supabase
    .from('events')
    .select(`
      *,
      bookings (
        quantity,
        total_amount,
        status
      )
    `)
    .eq('organizer_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching events:', error)
  }

  return (
    <OrganizerEventsClient 
      events={events || []}
      user={session.user}
    />
  )
}