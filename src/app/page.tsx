import { createClient } from '@/lib/supabase/server'
import { LandingPageClient } from './landing-page-client'
import type { Tables } from '@/lib/supabase/database.types'

type Event = Tables<'events'>

// Hardcoded categories for landing page
const categories = [
  { id: '1', name: 'Technology', slug: 'technology', description: 'Tech conferences, workshops, and meetups' },
  { id: '2', name: 'Music', slug: 'music', description: 'Concerts, festivals, and live music events' },
  { id: '3', name: 'Sports', slug: 'sports', description: 'Sports events, tournaments, and fitness activities' },
  { id: '4', name: 'Arts & Culture', slug: 'arts-culture', description: 'Art exhibitions, theater shows, and cultural events' },
  { id: '5', name: 'Food & Drink', slug: 'food-drink', description: 'Food festivals, wine tastings, and culinary events' },
  { id: '6', name: 'Business', slug: 'business', description: 'Professional conferences, networking, and seminars' },
  { id: '7', name: 'Health & Wellness', slug: 'health-wellness', description: 'Yoga, meditation, and wellness workshops' },
  { id: '8', name: 'Education', slug: 'education', description: 'Workshops, classes, and educational seminars' }
]

async function getFeaturedEvents(): Promise<Event[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(6)

  if (error) {
    console.error('Error fetching featured events:', error)
    return []
  }

  return data || []
}

export default async function LandingPage() {
  const featuredEvents = await getFeaturedEvents()
  
  return (
    <LandingPageClient 
      featuredEvents={featuredEvents}
      categories={categories}
    />
  )
}
