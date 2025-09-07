import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CreateEventClient } from './create-event-client'

export default async function CreateEventPage() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/signin?redirectTo=/dashboard/organizer/events/new')
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

  return <CreateEventClient user={session.user} />
}