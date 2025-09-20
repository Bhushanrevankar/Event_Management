'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/lib/supabase/database.types'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in react-leaflet
import L from 'leaflet'
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

type Event = Tables<'events'>

interface EventsMapProps {
  initialEvents?: Event[]
  className?: string
}


export function EventsMap({ initialEvents = [], className }: EventsMapProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Function to fetch all events
  const fetchAllEvents = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_published', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .gte('end_date', new Date().toISOString())
        .order('start_date', { ascending: true })

      if (error) throw error

      setEvents(data || [])
    } catch (err) {
      console.error('Error fetching events:', err)
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }



  // Fetch all events on component mount
  useEffect(() => {
    if (initialEvents.length > 0) {
      setEvents(initialEvents)
    } else {
      fetchAllEvents()
    }
  }, [initialEvents])

  // Default center (Mumbai, India)
  const defaultCenter: [number, number] = [19.0760, 72.8777]
  const mapCenter: [number, number] = defaultCenter

  return (
    <div className={`relative ${className || ''}`}>
      {loading && (
        <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-700 font-medium">Loading events...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute top-4 left-4 z-[1000] backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg max-w-sm bg-amber-50/95 border border-amber-200">
          <div className="flex items-start space-x-2">
            <svg className="h-5 w-5 mt-0.5 flex-shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.97-.833-2.74 0L4.074 16.5C3.304 18.333 4.266 20 5.806 20z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm mb-2 text-amber-800">{error}</p>

              <button
                onClick={fetchAllEvents}
                className="inline-flex items-center px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-md transition-colors"
                disabled={loading}
              >
                <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? 'Retrying...' : 'Retry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event count */}
      {!loading && (
        <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-700">
            {events.length} {events.length === 1 ? 'event' : 'events'} found
          </p>
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={12}
        scrollWheelZoom={true}
        className="h-full w-full rounded-lg"
        style={{ minHeight: '400px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />



        {/* No events found overlay */}
        {events.length === 0 && !loading && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center pointer-events-none">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-2xl max-w-sm mx-4 pointer-events-auto">
              <div className="text-center">
                <svg className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Found</h3>
                <p className="text-sm text-gray-600 mb-4">
                  No events found at the moment. Check back later for new events.
                </p>
                <button
                  onClick={fetchAllEvents}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Refresh Events
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Event markers */}
        {events.map((event) => {
          if (!event.latitude || !event.longitude) return null
          
          return (
            <Marker 
              key={event.id} 
              position={[Number(event.latitude), Number(event.longitude)]}
            >
              <Popup>
                <EventMarkerPopup event={event} />
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

function EventMarkerPopup({ event }: { event: Event }) {
  const eventDate = new Date(event.start_date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })

  return (
    <div className="w-72 p-0 overflow-hidden">
      {event.featured_image_url && (
        <div className="relative">
          <img 
            src={event.featured_image_url} 
            alt={event.title}
            className="w-full h-36 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}
      
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 leading-tight mb-1">
            {event.title}
          </h3>
          {event.short_description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {event.short_description}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
              <span className="font-medium">{eventDate}</span>
            </div>
            
          </div>

          <div className="flex items-start space-x-2 text-sm text-gray-600">
            <svg className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
              />
            </svg>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 truncate">{event.venue_name}</p>
              <p className="text-xs text-gray-500 truncate">{event.venue_address}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-baseline space-x-1">
            {event.base_price && event.base_price > 0 ? (
              <>
                <span className="text-lg font-bold text-gray-900">
                  {event.currency === 'INR' ? '₹' : '$'}{event.base_price}
                </span>
                <span className="text-xs text-gray-500">per ticket</span>
              </>
            ) : (
              <span className="text-lg font-bold text-green-600">Free</span>
            )}
          </div>
          
          <a 
            href={`/events/${event.slug || event.id}`}
            className="inline-flex items-center px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            View Event
            <svg className="ml-1.5 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}