import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CreateEventClient } from './create-event-client'

export default async function CreateEventPage() {
  const supabase = await createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/signin?redirectTo=/dashboard/organizer/events/new')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'organizer') {
    redirect('/dashboard/attendee')
  }

  const { data: categories } = await supabase
    .from('event_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  return (
    <CreateEventClient 
      user={session.user}
      categories={categories || []}
    />
  )
}