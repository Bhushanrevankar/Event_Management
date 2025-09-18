'use client'

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { MarkerPin06 as MapPin, SearchLg as Search, X, NavigationPointer01 as Navigation, AlertCircle } from '@untitledui/icons'
import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'

// Import useMapEvents hook conditionally
const useMapEventsHook = typeof window !== 'undefined' ?
  require('react-leaflet').useMapEvents :
  () => null

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.MapContainer })), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.TileLayer })), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.Marker })), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.Popup })), { ssr: false })

interface LocationPickerMapProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void
  initialLat?: number
  initialLng?: number
  height?: string
  searchPlaceholder?: string
  showSearchBox?: boolean
  showCurrentLocationButton?: boolean
}

interface MapClickHandlerProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void
  setIsLoading: (loading: boolean) => void
}

interface SearchResult {
  display_name: string
  lat: string
  lon: string
  importance: number
}

// Debounce function for search
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

function MapClickHandler({ onLocationSelect, setIsLoading }: MapClickHandlerProps) {
  const map = useMapEventsHook({
    click: async (e: any) => {
      const { lat, lng } = e.latlng
      setIsLoading(true)
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18&extratags=1`,
          {
            headers: {
              'User-Agent': 'LocationPicker/1.0'
            }
          }
        )
        
        if (!response.ok) throw new Error('Failed to fetch address')
        
        const data = await response.json()
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        
        onLocationSelect(lat, lng, address)
      } catch (error) {
        console.error('Error fetching address:', error)
        onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      } finally {
        setIsLoading(false)
      }
    },
  })
  
  return null
}

export function LocationPickerMap({ 
  onLocationSelect, 
  initialLat = 19.0760, 
  initialLng = 72.8777, 
  height = '400px',
  searchPlaceholder = 'Search for a location...',
  showSearchBox = true,
  showCurrentLocationButton = true
}: LocationPickerMapProps) {
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  )
  const [isClient, setIsClient] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState('')
  const [mapCenter, setMapCenter] = useState<[number, number]>([initialLat, initialLng])
  const [mapZoom, setMapZoom] = useState(13)
  const mapRef = useRef<any>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  useEffect(() => {
    setIsClient(true)
    
    // Load Leaflet CSS
    if (typeof window !== 'undefined') {
      import('leaflet/dist/leaflet.css')
      
      // Fix for default markers in react-leaflet
      import('leaflet').then((L) => {
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })
      })
    }
  }, [])

  // Search functionality
  useEffect(() => {
    if (debouncedSearchQuery.length > 2) {
      searchLocations(debouncedSearchQuery)
    } else {
      setSearchResults([])
      setShowResults(false)
    }
  }, [debouncedSearchQuery])

  const searchLocations = async (query: string) => {
    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&extratags=1&namedetails=1`,
        {
          headers: {
            'User-Agent': 'LocationPicker/1.0'
          }
        }
      )
      
      if (!response.ok) throw new Error('Search failed')
      
      const data = await response.json()
      setSearchResults(data)
      setShowResults(true)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    setSelectedPosition([lat, lng])
    setSelectedAddress(address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
    onLocationSelect(lat, lng, address)
    
    // Pan map to selected location
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 16, { animate: true })
    }
  }

  const handleSearchResultSelect = (result: SearchResult) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    
    handleLocationSelect(lat, lng, result.display_name)
    setSearchQuery('')
    setShowResults(false)
    setMapCenter([lat, lng])
    setMapZoom(16)
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          
          handleLocationSelect(lat, lng)
          setMapCenter([lat, lng])
          setMapZoom(16)
          setIsLoading(false)
        },
        (error) => {
          console.error('Geolocation error:', error)
          alert('Unable to get your current location. Please select manually on the map.')
          setIsLoading(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    } else {
      alert('Geolocation is not supported by this browser.')
    }
  }

  const clearSelection = () => {
    setSelectedPosition(null)
    setSelectedAddress('')
    setSearchQuery('')
    setShowResults(false)
  }

  if (!isClient) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200"
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <MapPin className="w-8 h-8 mx-auto mb-2 animate-pulse" />
          <p>Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="flex items-start space-x-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium text-blue-800">How to select location:</p>
          <ul className="mt-1 text-blue-700 space-y-1">
            <li>• Search for an address or place name</li>
            <li>• Click anywhere on the map</li>
            {showCurrentLocationButton && <li>• Use your current location</li>}
          </ul>
        </div>
      </div>

      {/* Search Box and Controls */}
      {showSearchBox && (
        <div className="relative">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Input
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={searchPlaceholder}
                icon={Search}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setShowResults(false)
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              
              {/* Loading indicator for search */}
              {isSearching && (
                <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                </div>
              )}
            </div>

            {/* Current Location Button */}
            {showCurrentLocationButton && (
              <Button
                color="secondary"
                iconLeading={Navigation}
                onClick={getCurrentLocation}
                isDisabled={isLoading}
                aria-label="Use current location"
                className="flex-shrink-0"
              />
            )}

            {/* Clear Selection Button */}
            {selectedPosition && (
              <Button
                color="tertiary"
                iconLeading={X}
                onClick={clearSelection}
                aria-label="Clear selection"
                className="flex-shrink-0"
              />
            )}
          </div>

          {/* Search Results */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-gray-50 focus:outline-none"
                  onClick={() => handleSearchResultSelect(result)}
                >
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {result.display_name.split(',')[0]}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {result.display_name}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results message */}
          {showResults && searchResults.length === 0 && !isSearching && debouncedSearchQuery.length > 2 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="px-4 py-3 text-center text-gray-500">
                <AlertCircle className="w-4 h-4 mx-auto mb-1" />
                <p className="text-sm">No locations found</p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Map Container */}
      <div 
        className="rounded-lg border border-gray-200 overflow-hidden relative"
        style={{ height }}
      >
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
              <span className="text-sm">Getting location...</span>
            </div>
          </div>
        )}

        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <MapClickHandler 
            onLocationSelect={handleLocationSelect} 
            setIsLoading={setIsLoading}
          />
          
          {selectedPosition && (
            <Marker position={selectedPosition}>
              <Popup>
                <div className="text-center">
                  <div className="font-medium text-gray-900">Selected Location</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}
                  </div>
                  {selectedAddress && (
                    <div className="text-xs text-gray-500 mt-2 max-w-xs">
                      {selectedAddress}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      
      {/* Selected Location Display */}
      {selectedPosition && (
        <div className="text-sm text-gray-600 bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium text-green-800">Location Selected</span>
                <Button
                  color="tertiary"
                  size="sm"
                  iconLeading={X}
                  onClick={clearSelection}
                  className="text-green-600 hover:text-green-700"
                  aria-label="Remove selection"
                />
              </div>
              
              <div className="space-y-1">
                <div className="text-green-700">
                  <span className="font-medium">Coordinates:</span> {selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}
                </div>
                
                {selectedAddress && (
                  <div className="text-green-700">
                    <span className="font-medium">Address:</span> 
                    <div className="mt-1 text-sm break-words">{selectedAddress}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}