'use client'

import Link from 'next/link'
import { ArrowRight, Calendar } from '@untitledui/icons'
import { Button } from '@/components/base/buttons/button'
import { EventCard } from '@/components/events/event-card'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/lib/supabase/database.types'

type Event = Tables<'events'> & {
  profiles: Tables<'profiles'> | null
}

export function RecentEventsSection() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecentEvents() {
      try {
        const supabase = createClient()

        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            profiles (*)
          `)
          .eq('is_published', true)
          .gte('start_date', new Date().toISOString()) // Only future events
          .order('created_at', { ascending: false }) // Most recently created first
          .limit(6)

        if (error) {
          console.error('Error fetching recent events:', error)
          return
        }

        setEvents(data || [])
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentEvents()
  }, [])

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-display-sm font-bold mb-4 text-gray-900">
              Latest Events
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover the newest events added to our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-gray-100 rounded-lg h-96 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (events.length === 0) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-display-sm font-bold mb-4 text-gray-900">
              Latest Events
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              No events available at the moment. Check back soon!
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-display-sm font-bold mb-4 text-gray-900">
            Latest Events
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the newest events added to our platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {events.map((event) => {
            const transformedEvent = {
              ...event,
              category: event.tags && event.tags.length > 0 ? {
                name: event.tags[0],
                color_hex: '#6366f1'
              } : null,
              organizer: event.profiles ? {
                full_name: event.profiles.full_name,
                avatar_url: event.profiles.avatar_url
              } : null
            }

            return (
              <Link key={event.id} href={`/events/${event.slug}`}>
                <EventCard
                  event={transformedEvent}
                  className="h-full hover:scale-[1.02] transition-transform duration-200"
                />
              </Link>
            )
          })}
        </div>

        <div className="text-center">
          <Button
            size="lg"
            color="secondary"
            href="/events"
            iconTrailing={ArrowRight}
          >
            View All Events
          </Button>
        </div>
      </div>
    </section>
  )
}