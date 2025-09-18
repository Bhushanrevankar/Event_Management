'use client'

import { Badge } from '@/components/base/badges/badges'
import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icons'
import { SearchMd, ArrowRight, Calendar } from '@untitledui/icons'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useProfile } from '@/hooks/use-profile'
// Dynamically import map component to avoid SSR issues
const NearbyEventsMap = dynamic(
  () => import('@/components/events/nearby-events-map').then(mod => ({ default: mod.NearbyEventsMap })),
  {
    ssr: false,
    loading: () => <div className="h-96 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">Loading map...</div>
  }
)

type Category = {
  id: string
  name: string
  slug: string
  description: string
}

interface Props {
  categories: Category[]
}

export function LandingPageClient({ categories }: Props) {
  const { profile, loading, isOrganizer } = useProfile();

  // Determine the correct URL for "Start Organizing" button
  const getStartOrganizerUrl = () => {
    if (loading) return '#'; // Show loading state
    if (isOrganizer) return '/dashboard/organizer'; // Redirect to organizer dashboard
    if (profile) return '/dashboard'; // User is signed in but not an organizer
    return '/auth/signup'; // User not signed in
  };

  const getStartOrganizerText = () => {
    if (loading) return 'Loading...';
    if (isOrganizer) return 'Go to Dashboard';
    if (profile) return 'Become Organizer';
    return 'Start Organizing';
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-400 to-gray-200"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-display-xl font-bold mb-6 leading-tight">
              Discover & Book Amazing Events
              <span className="block text-primary-200">Near You</span>
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed opacity-90">
              From intimate workshops to grand concerts, find the perfect events that match your interests. Join thousands of others creating unforgettable memories.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Search events, venues, organizers..."
                    icon={SearchMd}
                    size="md"
                    className="bg-white/95 text-gray-900 border-0 shadow-xl backdrop-blur-sm"
                    aria-label="Search events"
                  />
                </div>
                <Button size="lg" iconTrailing={ArrowRight} className="sm:px-8">
                  Search Events
                </Button>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-16 text-center">
              <div>
                <div className="text-3xl font-bold mb-1">{categories.length}</div>
                <div className="text-primary-200 text-sm uppercase tracking-wide">Categories</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">1000+</div>
                <div className="text-primary-200 text-sm uppercase tracking-wide">Happy Attendees</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-display-sm font-bold mb-4 text-gray-900">
              Explore Event Categories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover events that match your interests and passions
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/events?category=${category.slug}`}
                className="group p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary-300"
              >
                <div className="text-center">
                  <div className="mx-auto mb-3">
                    <FeaturedIcon 
                      color="gray" 
                      theme="modern" 
                      size="md" 
                      className="mx-auto"
                    >
                      <Calendar className="w-6 h-6" />
                    </FeaturedIcon>
                  </div>
                  <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Nearby Events Map Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-display-sm font-bold mb-4 text-gray-900">
              Events Near You
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover exciting events happening around your location on our interactive map
            </p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
            <NearbyEventsMap
              initialEvents={[]}
              className="h-96 md:h-[500px]"
            />
          </div>
          
          <div className="text-center mt-8">
            <Button size="md" color="secondary" href="/events" iconTrailing={ArrowRight}>
              View All Events
            </Button>
          </div>
        </div>
      </section>

      
      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-gray-400 to-gray-300">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-display-md font-bold mb-4">
            Ready to Host Your Own Event?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of organizers who trust our platform to create and manage successful events
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              color="secondary"
              href={getStartOrganizerUrl()}
              iconTrailing={ArrowRight}
              disabled={loading}
            >
              {getStartOrganizerText()}
            </Button>
            <Button size="lg" color="tertiary" href="/events" className="text-white border-white hover:bg-white hover:text-primary-600">
              Browse More Events
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}