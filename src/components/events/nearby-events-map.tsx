'use client'

import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import { LatLng } from 'leaflet'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/lib/supabase/database.types'
import { calculateDistance } from '@/utils/geospatial'
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

interface NearbyEventsMapProps {
  initialEvents?: Event[]
  className?: string
}

interface UserLocation {
  lat: number
  lng: number
}

function LocationUpdater({ 
  onLocationChange, 
  userLocation 
}: { 
  onLocationChange: (lat: number, lng: number) => void
  userLocation: UserLocation | null 
}) {
  const map = useMapEvents({
    locationfound: (e) => {
      const { lat, lng } = e.latlng
      onLocationChange(lat, lng)
    },
  })

  useEffect(() => {
    map.locate()
  }, [map])

  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 12)
    }
  }, [map, userLocation])

  return null
}

export function NearbyEventsMap({ initialEvents = [], className }: NearbyEventsMapProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [searchRadius, setSearchRadius] = useState(50) // km
  const [hasSearched, setHasSearched] = useState(false)
  const lastLocationRef = useRef<UserLocation | null>(null)
  const supabase = createClient()

  // Use centralized distance calculation from utils

  // Function to fetch nearby events
  const fetchNearbyEvents = async (lat: number, lng: number, radiusKm: number = searchRadius) => {
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

      if (error) throw error

      // Filter events within radius and add distance
      const eventsWithDistance = data
        .map(event => {
          if (!event.latitude || !event.longitude) return null
          const distance = calculateDistance(lat, lng, Number(event.latitude), Number(event.longitude))
          return {
            ...event,
            distance: distance
          }
        })
        .filter(event => event && event.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance) // Sort by distance, closest first

      setEvents(eventsWithDistance)
      setHasSearched(true)
    } catch (err) {
      console.error('Error fetching events:', err)
      setError('Failed to load nearby events')
    } finally {
      setLoading(false)
    }
  }

  // Handle location change
  const handleLocationChange = (lat: number, lng: number) => {
    const newLocation = { lat, lng }
    
    // Check if location has changed significantly (more than 1km)
    if (lastLocationRef.current) {
      const distance = calculateDistance(
        lastLocationRef.current.lat,
        lastLocationRef.current.lng,
        lat,
        lng
      )
      if (distance < 1) return // Don't refetch if change is less than 1km
    }

    setUserLocation(newLocation)
    lastLocationRef.current = newLocation
    fetchNearbyEvents(lat, lng)
  }

  // Try IP-based location as fallback
  const tryIPLocation = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      
      if (data.latitude && data.longitude) {
        const location = { lat: data.latitude, lng: data.longitude }
        setUserLocation(location)
        lastLocationRef.current = location
        await fetchNearbyEvents(data.latitude, data.longitude)
        setError(`Using approximate location: ${data.city}, ${data.region}`)
        return true
      }
    } catch (error) {
      console.log('IP location failed:', error)
    }
    return false
  }

  // Retry location with different options
  const tryGetLocation = async (attempt = 1) => {
    if (attempt > 3) {
      // Try IP-based location as final fallback
      const ipLocationSuccess = await tryIPLocation()
      
      if (!ipLocationSuccess) {
        setError('Unable to determine your location. Showing all events.')
        setEvents(initialEvents)
      }
      setLoading(false)
      return
    }

    const options = attempt === 1 
      ? { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
      : attempt === 2
      ? { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      : { enableHighAccuracy: false, timeout: 8000, maximumAge: 0 }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        handleLocationChange(latitude, longitude)
      },
      (geoError) => {
        console.log(`Location attempt ${attempt} failed:`, geoError)
        
        if (attempt < 3) {
          // Try again with different settings
          setTimeout(() => tryGetLocation(attempt + 1), 1000)
        } else {
          // All GPS attempts failed, try IP location
          tryGetLocation(4)
        }
      },
      options
    )
  }

  // Manual retry function
  const retryLocation = () => {
    setLoading(true)
    setError(null)
    tryGetLocation(1)
  }

  // Extended Indian cities and towns
  const indianCities = [
    // Major Cities
    { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
    { name: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090 },
    { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
    { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
    { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
    { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
    { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
    { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
    
    // Karnataka Cities/Towns (including smaller ones)
    { name: 'Mysuru', state: 'Karnataka', lat: 12.2958, lng: 76.6394 },
    { name: 'Mangaluru', state: 'Karnataka', lat: 12.9141, lng: 74.8560 },
    { name: 'Hubli', state: 'Karnataka', lat: 15.3647, lng: 75.1240 },
    { name: 'Belagavi', state: 'Karnataka', lat: 15.8497, lng: 74.4977 },
    { name: 'Udupi', state: 'Karnataka', lat: 13.3409, lng: 74.7421 },
    { name: 'Ankola', state: 'Karnataka', lat: 14.6667, lng: 74.3167 },
    { name: 'Karwar', state: 'Karnataka', lat: 14.8142, lng: 74.1297 },
    { name: 'Gokarna', state: 'Karnataka', lat: 14.5492, lng: 74.3200 },
    { name: 'Kumta', state: 'Karnataka', lat: 14.4306, lng: 74.4161 },
    { name: 'Bhatkal', state: 'Karnataka', lat: 13.9854, lng: 74.5560 },
    
    // More cities across India
    { name: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673 },
    { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
    { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
    { name: 'Chandigarh', state: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
    { name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126 },
    { name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577 },
    { name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882 },
    { name: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311 },
    { name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185 },
    { name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558 },
  ]
  
  const [citySearchTerm, setCitySearchTerm] = useState('')
  
  const filteredCities = indianCities.filter(city => 
    city.name.toLowerCase().includes(citySearchTerm.toLowerCase()) ||
    city.state.toLowerCase().includes(citySearchTerm.toLowerCase())
  )

  // Set manual location
  const setManualLocation = (city: { name: string; state: string; lat: number; lng: number }) => {
    const location = { lat: city.lat, lng: city.lng }
    setUserLocation(location)
    lastLocationRef.current = location
    fetchNearbyEvents(city.lat, city.lng)
    setError(`Using selected location: ${city.name}, ${city.state}`)
    setShowLocationPicker(false)
    setCitySearchTerm('')
  }

  // Get user's current location on component mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      setLoading(true)
      tryGetLocation(1)
    } else {
      setError('Geolocation is not supported by this browser.')
      setEvents(initialEvents)
      setLoading(false)
    }
  }, [initialEvents])

  // Default center (Mumbai, India) if no user location
  const defaultCenter: [number, number] = [19.0760, 72.8777]
  const mapCenter: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : defaultCenter

  return (
    <div className={`relative ${className || ''}`}>
      {loading && (
        <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-700 font-medium">Finding nearby events...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className={`absolute top-4 left-4 z-[1000] backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg max-w-sm ${
          error.includes('approximate location') 
            ? 'bg-blue-50/95 border border-blue-200' 
            : 'bg-amber-50/95 border border-amber-200'
        }`}>
          <div className="flex items-start space-x-2">
            <svg className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
              error.includes('approximate location') ? 'text-blue-600' : 'text-amber-600'
            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {error.includes('approximate location') ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.97-.833-2.74 0L4.074 16.5C3.304 18.333 4.266 20 5.806 20z" />
              )}
            </svg>
            <div className="flex-1">
              <p className={`text-sm mb-2 ${
                error.includes('approximate location') ? 'text-blue-800' : 'text-amber-800'
              }`}>{error}</p>
              
              <div className="flex gap-2">
                {!error.includes('approximate location') && (
                  <button
                    onClick={retryLocation}
                    className="inline-flex items-center px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-md transition-colors"
                    disabled={loading}
                  >
                    <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {loading ? 'Retrying...' : 'Retry GPS'}
                  </button>
                )}
                
                <button
                  onClick={() => setShowLocationPicker(true)}
                  className={`inline-flex items-center px-3 py-1.5 text-white text-xs font-medium rounded-md transition-colors ${
                    error.includes('approximate location') 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Choose City
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event count and radius selector */}
      {!loading && (
        <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg border border-gray-200 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              {events.length} {events.length === 1 ? 'event' : 'events'} found
            </p>
          </div>
          
          {userLocation && (
            <div className="flex items-center space-x-2">
              <label className="text-xs text-gray-500">Radius:</label>
              <select 
                value={searchRadius}
                onChange={(e) => {
                  const newRadius = parseInt(e.target.value)
                  setSearchRadius(newRadius)
                  fetchNearbyEvents(userLocation.lat, userLocation.lng, newRadius)
                }}
                className="text-xs bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km</option>
                <option value={200}>200 km</option>
              </select>
            </div>
          )}
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
        
        <LocationUpdater 
          onLocationChange={handleLocationChange}
          userLocation={userLocation}
        />

        {/* User location marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>
              <div className="p-2">
                <p className="font-medium text-sm">Your Location</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Location picker modal */}
        {showLocationPicker && (
          <div className="absolute inset-0 bg-black/50 z-[2000] flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 m-4 max-w-lg w-full shadow-2xl max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Choose Your City</h3>
                <button
                  onClick={() => {
                    setShowLocationPicker(false)
                    setCitySearchTerm('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Search and select your city to find nearby events accurately:
              </p>
              
              {/* Search Input */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search cities (e.g., Ankola, Mumbai, Karnataka...)"
                    value={citySearchTerm}
                    onChange={(e) => setCitySearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              {/* Cities List */}
              <div className="flex-1 overflow-y-auto">
                {filteredCities.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {filteredCities.slice(0, 20).map((city) => (
                      <button
                        key={`${city.name}-${city.state}`}
                        onClick={() => setManualLocation(city)}
                        className="p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <div className="font-medium text-gray-900">{city.name}</div>
                        <div className="text-sm text-gray-500">{city.state}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="h-12 w-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-sm">No cities found matching "{citySearchTerm}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* No events found overlay */}
        {hasSearched && events.length === 0 && userLocation && !loading && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center pointer-events-none">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-2xl max-w-sm mx-4 pointer-events-auto">
              <div className="text-center">
                <svg className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Found</h3>
                <p className="text-sm text-gray-600 mb-4">
                  No events found within {searchRadius} km of your location. Try increasing the search radius or check back later.
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      const newRadius = Math.min(searchRadius * 2, 200)
                      setSearchRadius(newRadius)
                      fetchNearbyEvents(userLocation.lat, userLocation.lng, newRadius)
                    }}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Search within {Math.min(searchRadius * 2, 200)} km
                  </button>
                  <button
                    onClick={() => setShowLocationPicker(true)}
                    className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    Try Different Location
                  </button>
                </div>
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
                <EventMarkerPopup event={event} userLocation={userLocation} />
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

function EventMarkerPopup({ event, userLocation }: { event: Event & { distance?: number }, userLocation: UserLocation | null }) {
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
            
            {/* Distance indicator */}
            {userLocation && event.distance !== undefined && (
              <div className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">
                  {event.distance < 1 
                    ? `${Math.round(event.distance * 1000)}m` 
                    : `${event.distance.toFixed(1)}km`
                  }
                </span>
              </div>
            )}
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