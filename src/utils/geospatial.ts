/**
 * Calculate the distance between two geographic points using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Filter events within a specified radius from a given location
 * @param events Array of events with latitude and longitude
 * @param centerLat Center latitude
 * @param centerLng Center longitude
 * @param radiusKm Radius in kilometers
 * @returns Filtered events within the radius
 */
export function filterEventsByRadius<T extends { latitude?: number | null; longitude?: number | null }>(
  events: T[],
  centerLat: number,
  centerLng: number,
  radiusKm: number = 50
): T[] {
  return events.filter(event => {
    if (!event.latitude || !event.longitude) return false
    
    const distance = calculateDistance(
      centerLat,
      centerLng,
      Number(event.latitude),
      Number(event.longitude)
    )
    
    return distance <= radiusKm
  })
}

/**
 * Sort events by distance from a given location
 * @param events Array of events with latitude and longitude
 * @param centerLat Center latitude
 * @param centerLng Center longitude
 * @returns Events sorted by distance (closest first)
 */
export function sortEventsByDistance<T extends { latitude?: number | null; longitude?: number | null }>(
  events: T[],
  centerLat: number,
  centerLng: number
): (T & { distance?: number })[] {
  return events
    .map(event => ({
      ...event,
      distance: event.latitude && event.longitude
        ? calculateDistance(centerLat, centerLng, Number(event.latitude), Number(event.longitude))
        : Infinity
    }))
    .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))
}

/**
 * Get user's current location using the browser's geolocation API
 * @returns Promise that resolves to user's coordinates
 */
export function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  })
}

/**
 * Format distance for display
 * @param distanceKm Distance in kilometers
 * @returns Formatted distance string
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`
  } else if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km`
  } else {
    return `${Math.round(distanceKm)} km`
  }
}