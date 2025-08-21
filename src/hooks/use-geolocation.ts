import { useState, useEffect, useRef } from 'react'

interface CustomGeolocationPosition {
  lat: number
  lng: number
  accuracy?: number
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  distanceThreshold?: number // Minimum distance in meters to trigger location update
}

interface UseGeolocationReturn {
  position: CustomGeolocationPosition | null
  error: string | null
  loading: boolean
  getCurrentPosition: () => void
}

export function useGeolocation(options: UseGeolocationOptions = {}): UseGeolocationReturn {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 60000,
    distanceThreshold = 100
  } = options

  const [position, setPosition] = useState<CustomGeolocationPosition | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const lastPositionRef = useRef<CustomGeolocationPosition | null>(null)
  const watchIdRef = useRef<number | null>(null)

  // Calculate distance between two points in meters
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000 // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const handleSuccess = (geoPosition: GeolocationPosition) => {
    const newPosition: CustomGeolocationPosition = {
      lat: geoPosition.coords.latitude,
      lng: geoPosition.coords.longitude,
      accuracy: geoPosition.coords.accuracy
    }

    // Check if the new position is significantly different from the last one
    if (lastPositionRef.current) {
      const distance = calculateDistance(
        lastPositionRef.current.lat,
        lastPositionRef.current.lng,
        newPosition.lat,
        newPosition.lng
      )

      // Only update if the distance exceeds the threshold
      if (distance < distanceThreshold) {
        return
      }
    }

    lastPositionRef.current = newPosition
    setPosition(newPosition)
    setError(null)
    setLoading(false)
  }

  const handleError = (geoError: GeolocationPositionError) => {
    let errorMessage = 'An unknown error occurred'

    switch (geoError.code) {
      case geoError.PERMISSION_DENIED:
        errorMessage = 'Location access denied by user'
        break
      case geoError.POSITION_UNAVAILABLE:
        errorMessage = 'Location information is unavailable'
        break
      case geoError.TIMEOUT:
        errorMessage = 'Location request timed out'
        break
    }

    setError(errorMessage)
    setLoading(false)
  }

  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy,
        timeout,
        maximumAge
      }
    )
  }

  const startWatching = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      return
    }

    if (watchIdRef.current !== null) {
      return // Already watching
    }

    setLoading(true)
    setError(null)

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy,
        timeout,
        maximumAge
      }
    )
  }

  const stopWatching = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }

  useEffect(() => {
    // Get initial position and start watching for changes
    getCurrentPosition()
    startWatching()

    // Cleanup on unmount
    return () => {
      stopWatching()
    }
  }, [])

  return {
    position,
    error,
    loading,
    getCurrentPosition
  }
}