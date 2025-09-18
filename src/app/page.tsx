import { LandingPageClient } from './landing-page-client'
import { MainLayout } from '@/components/layout/main-layout'

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


export default function LandingPage() {
  return (
    <MainLayout>
      <LandingPageClient
        categories={categories}
      />
    </MainLayout>
  )
}
