'use client'

import { Badge } from '@/components/base/badges/badges'
import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icons'
import { SearchMd, ArrowRight, Calendar, MarkerPin01 as MapPin, Star01 } from '@untitledui/icons'
import Link from 'next/link'
import type { Tables } from '@/lib/supabase/database.types'

type Event = Tables<'events'>

type Category = {
  id: string
  name: string
  slug: string
  description: string
}

interface Props {
  featuredEvents: Event[]
  categories: Category[]
}

export function LandingPageClient({ featuredEvents, categories }: Props) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 py-24">
        <div className="absolute inset-0 bg-black/50"></div>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 text-center">
              <div>
                <div className="text-3xl font-bold mb-1">{featuredEvents.length}+</div>
                <div className="text-primary-200 text-sm uppercase tracking-wide">Active Events</div>
              </div>
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
            <h2 className="text-display-sm font-bold mb-4">
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

      {/* Featured Events Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-display-sm font-bold mb-4">Featured Events</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Don't miss these amazing events happening soon
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredEvents.map((event) => (
              <div key={event.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-primary-300">
                <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
                  {event.featured_image_url ? (
                    <img 
                      src={event.featured_image_url} 
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Calendar className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  {event.is_featured && (
                    <div className="absolute top-4 left-4">
                      <Badge type="pill-color" color="brand">
                        <Star01 className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-xl text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {event.title}
                    </h3>
                    {event.tags && event.tags.length > 0 && (
                      <Badge 
                        type="pill-color" 
                        color="gray"
                        className="text-xs"
                      >
                        {event.tags[0]}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {new Date(event.start_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {event.venue_name}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                    {event.short_description || 'Join us for an amazing event experience!'}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold text-primary-600">
                        {event.base_price === 0 ? 'Free' : `${event.currency === 'INR' ? '₹' : '$'}${event.base_price}`}
                      </span>
                      {event.base_price > 0 && (
                        <span className="text-sm text-gray-500 ml-1">per ticket</span>
                      )}
                    </div>
                    <Button 
                      color="secondary" 
                      size="md"
                      href={`/events/${event.slug}`}
                      iconTrailing={ArrowRight}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {featuredEvents.length === 0 && (
            <div className="text-center py-16">
              <FeaturedIcon color="gray" theme="modern" size="lg" className="mx-auto mb-4">
                <Calendar className="w-8 h-8" />
              </FeaturedIcon>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No featured events yet</h3>
              <p className="text-gray-500 mb-6">Check back soon for amazing events in your area!</p>
              <Button size="md" href="/events" iconTrailing={ArrowRight}>
                Browse All Events
              </Button>
            </div>
          )}
          
          {featuredEvents.length > 0 && (
            <div className="text-center mt-12">
              <Button size="md" color="secondary" href="/events" iconTrailing={ArrowRight}>
                Explore All Events
              </Button>
            </div>
          )}
        </div>
      </section>
      
      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-display-md font-bold mb-4">
            Ready to Host Your Own Event?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of organizers who trust our platform to create and manage successful events
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" color="secondary" href="/auth/signup" iconTrailing={ArrowRight}>
              Start Organizing
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