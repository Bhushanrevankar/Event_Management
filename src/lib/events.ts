import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/lib/supabase/database.types'

export type Event = Tables<'events'>

export interface PublishEventResponse {
  success: boolean
  error?: string
  data?: Event
}

/**
 * Publishes a draft event by updating its status and is_published fields
 */
export async function publishEvent(eventId: string): Promise<PublishEventResponse> {
  try {
    const supabase = createClient()

    // Update the event to published status
    const { data, error } = await supabase
      .from('events')
      .update({
        is_published: true,
        status: 'published' as const,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId)
      .eq('is_published', false) // Only allow publishing draft events
      .select()
      .single()

    if (error) {
      console.error('Error publishing event:', error)

      // Handle specific error cases
      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: 'Event not found or already published'
        }
      }

      return {
        success: false,
        error: error.message || 'Failed to publish event'
      }
    }

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Unexpected error publishing event:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}

/**
 * Unpublishes a published event by updating its status back to draft
 */
export async function unpublishEvent(eventId: string): Promise<PublishEventResponse> {
  try {
    const supabase = createClient()

    // Update the event to draft status
    const { data, error } = await supabase
      .from('events')
      .update({
        is_published: false,
        status: 'draft' as const,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId)
      .eq('is_published', true) // Only allow unpublishing published events
      .select()
      .single()

    if (error) {
      console.error('Error unpublishing event:', error)

      // Handle specific error cases
      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: 'Event not found or already unpublished'
        }
      }

      return {
        success: false,
        error: error.message || 'Failed to unpublish event'
      }
    }

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Unexpected error unpublishing event:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}

/**
 * Checks if an event can be published
 * - Event must be a draft (is_published: false)
 * - Event must have all required fields filled
 */
export function canEventBePublished(event: Event): { canPublish: boolean; reasons: string[] } {
  const reasons: string[] = []

  // Check if already published
  if (event.is_published) {
    reasons.push('Event is already published')
  }

  // Check required fields
  if (!event.title?.trim()) {
    reasons.push('Event title is required')
  }

  if (!event.short_description?.trim()) {
    reasons.push('Short description is required')
  }

  if (!event.description?.trim()) {
    reasons.push('Event description is required')
  }

  if (!event.venue_name?.trim()) {
    reasons.push('Venue name is required')
  }

  if (!event.venue_address?.trim()) {
    reasons.push('Venue address is required')
  }

  if (!event.start_date) {
    reasons.push('Start date is required')
  }

  if (!event.end_date) {
    reasons.push('End date is required')
  }

  // Check if dates are valid
  if (event.start_date && event.end_date) {
    const startDate = new Date(event.start_date)
    const endDate = new Date(event.end_date)

    if (startDate >= endDate) {
      reasons.push('End date must be after start date')
    }
  }

  // Check capacity
  if (!event.total_capacity || event.total_capacity <= 0) {
    reasons.push('Total capacity must be greater than 0')
  }

  return {
    canPublish: reasons.length === 0,
    reasons
  }
}