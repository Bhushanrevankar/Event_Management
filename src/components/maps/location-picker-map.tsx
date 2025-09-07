'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { MarkerPin06 as MapPin } from '@untitledui/icons'

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })
const useMapEvents = dynamic(() => import('react-leaflet').then(mod => mod.useMapEvents), { ssr: false })

interface LocationPickerMapProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void
  initialLat?: number
  initialLng?: number
  height?: string
}

interface MapClickHandlerProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void
}

function MapClickHandler({ onLocationSelect }: MapClickHandlerProps) {
  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng
      
      // Try to get address from coordinates using reverse geocoding
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
        )
        const data = await response.json()
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        
        onLocationSelect(lat, lng, address)
      } catch (error) {
        console.error('Error fetching address:', error)
        onLocationSelect(lat, lng)
      }
    },
  })
  
  return null
}

export function LocationPickerMap({ 
  onLocationSelect, 
  initialLat = 19.0760, 
  initialLng = 72.8777, 
  height = '400px' 
}: LocationPickerMapProps) {
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  )
  const [isClient, setIsClient] = useState(false)

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

  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    setSelectedPosition([lat, lng])
    onLocationSelect(lat, lng, address)
  }

  if (!isClient) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200"
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <MapPin className="w-8 h-8 mx-auto mb-2" />
          <p>Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600">
        Click on the map to select the event location
      </div>
      
      <div 
        className="rounded-lg border border-gray-200 overflow-hidden"
        style={{ height }}
      >
        <MapContainer
          center={[initialLat, initialLng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          
          {selectedPosition && (
            <Marker position={selectedPosition}>
              <Popup>
                Event Location<br />
                <small>{selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}</small>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      
      {selectedPosition && (
        <div className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-800">Location Selected:</span>
          </div>
          <div className="mt-1 text-green-700">
            Coordinates: {selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}
          </div>
        </div>
      )}
    </div>
  )
}