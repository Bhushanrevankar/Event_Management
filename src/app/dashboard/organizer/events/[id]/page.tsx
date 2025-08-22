import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EventDetailClient } from './event-detail-client'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params
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

  const { data: event, error } = await supabase
    .from('events')
    .select(`
      *,
      bookings (
        id,
        booking_reference,
        quantity,
        total_amount,
        status,
        payment_status,
        created_at,
        user_id,
        profiles!bookings_user_id_fkey (
          full_name,
          email
        )
      )
    `)
    .eq('id', id)
    .eq('organizer_id', session.user.id)
    .single()

  if (error || !event) {
    notFound()
  }

  const { data: categories } = await supabase
    .from('event_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  return (
    <EventDetailClient 
      event={event}
      categories={categories || []}
      user={session.user}
    />
  )
}