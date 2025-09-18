'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'
import { TextArea } from '@/components/base/textarea/textarea'
import { NativeSelect } from '@/components/base/select/select-native'
import { Toggle } from '@/components/base/toggle/toggle'
import { AlertCircle, ArrowLeft, Calendar } from '@untitledui/icons'
import { cx } from '@/utils/cx'
import type { User } from '@supabase/supabase-js'
import { LocationPickerMap } from '@/components/maps/location-picker-map'

interface CreateEventClientProps {
  user: User
}

interface EventFormData {
  title: string
  slug: string
  short_description: string
  description: string
  start_date: string
  end_date: string
  timezone: string
  venue_name: string
  venue_address: string
  latitude?: string
  longitude?: string
  base_price: string
  currency: string
  total_capacity: string
  max_tickets_per_user: string
  age_restriction?: string
  is_published: boolean
  
  booking_start_date?: string
  booking_end_date?: string
  tags: string
  meta_description?: string
}

const initialFormData: EventFormData = {
  title: '',
  slug: '',
  short_description: '',
  description: '',
  start_date: '',
  end_date: '',
  timezone: 'Asia/Kolkata',
  venue_name: '',
  venue_address: '',
  latitude: '',
  longitude: '',
  base_price: '0',
  currency: 'INR',
  total_capacity: '100',
  max_tickets_per_user: '10',
  age_restriction: '',
  is_published: false,
  
  booking_start_date: '',
  booking_end_date: '',
  tags: '',
  meta_description: ''
}

export function CreateEventClient({ user }: CreateEventClientProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<EventFormData>(initialFormData)
  const [featuredImage, setFeaturedImage] = useState<File | null>(null)
  const [galleryImages, setGalleryImages] = useState<File[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<string>('')

  const handleInputChange = (field: keyof EventFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-generate slug from title
    if (field === 'title' && typeof value === 'string') {
      const baseSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
        .trim()

      // Add timestamp to make slug unique
      const timestamp = Date.now().toString().slice(-6) // Last 6 digits
      const slug = baseSlug ? `${baseSlug}-${timestamp}` : `event-${timestamp}`

      setFormData(prev => ({
        ...prev,
        slug
      }))
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString()
    }))
    
    if (address) {
      setSelectedAddress(address)
      
      // Auto-fill venue address if it's empty or if user wants to replace it
      if (!formData.venue_address.trim()) {
        setFormData(prev => ({
          ...prev,
          venue_address: address
        }))
      }
      
      // Optional: Ask user if they want to update the venue address
      if (formData.venue_address.trim() && formData.venue_address !== address) {
        const shouldUpdate = window.confirm(
          'Do you want to update the venue address with the selected location?'
        )
        if (shouldUpdate) {
          setFormData(prev => ({
            ...prev,
            venue_address: address
          }))
        }
      }
    }

    // Clear any location-related errors
    if (errors.latitude || errors.longitude) {
      setErrors(prev => ({
        ...prev,
        latitude: '',
        longitude: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required'
    if (!formData.short_description.trim()) newErrors.short_description = 'Short description is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.start_date) newErrors.start_date = 'Start date is required'
    if (!formData.end_date) newErrors.end_date = 'End date is required'
    if (!formData.venue_name.trim()) newErrors.venue_name = 'Venue name is required'
    if (!formData.venue_address.trim()) newErrors.venue_address = 'Venue address is required'

    // Location validation
    if (!formData.latitude || !formData.longitude) {
      newErrors.latitude = 'Please select a location on the map'
      newErrors.longitude = 'Please select a location on the map'
    }

    // Date validation
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      
      if (startDate >= endDate) {
        newErrors.end_date = 'End date must be after start date'
      }
    }

    // Number validation
    if (parseInt(formData.total_capacity) <= 0) {
      newErrors.total_capacity = 'Total capacity must be greater than 0'
    }

    if (parseInt(formData.max_tickets_per_user) <= 0) {
      newErrors.max_tickets_per_user = 'Max tickets per user must be greater than 0'
    }

    if (parseFloat(formData.base_price) < 0) {
      newErrors.base_price = 'Base price cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const checkSlugUniqueness = async (slug: string): Promise<boolean> => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('events')
        .select('id')
        .eq('slug', slug)
        .single()

      if (error && error.code === 'PGRST116') {
        // No rows found - slug is unique
        return true
      }

      // Slug already exists
      return false
    } catch (error) {
      console.error('Error checking slug uniqueness:', error)
      return true // Assume unique on error to allow form submission
    }
  }

  const uploadImages = async () => {
    const supabase = createClient()
    let featuredImageUrl: string | null = null
    const galleryUrls: string[] = []

    // Upload featured image
    if (featuredImage) {
      try {
        const fileExt = featuredImage.name.split('.').pop()
        const fileName = `${Date.now()}-featured.${fileExt}`
        const { data, error } = await supabase.storage
          .from('event-images')
          .upload(fileName, featuredImage)

        if (error) throw error
        
        const { data: { publicUrl } } = supabase.storage
          .from('event-images')
          .getPublicUrl(data.path)
        
        featuredImageUrl = publicUrl
      } catch (error) {
        console.error('Error uploading featured image:', error)
        throw new Error('Failed to upload featured image')
      }
    }

    // Upload gallery images
    if (galleryImages.length > 0) {
      try {
        const galleryPromises = galleryImages.map(async (image, index) => {
          const fileExt = image.name.split('.').pop()
          const fileName = `${Date.now()}-gallery-${index}.${fileExt}`
          const { data, error } = await supabase.storage
            .from('event-images')
            .upload(fileName, image)

          if (error) throw error
          
          const { data: { publicUrl } } = supabase.storage
            .from('event-images')
            .getPublicUrl(data.path)
          
          return publicUrl
        })

        const results = await Promise.all(galleryPromises)
        galleryUrls.push(...results)
      } catch (error) {
        console.error('Error uploading gallery images:', error)
        throw new Error('Failed to upload gallery images')
      }
    }

    return { featuredImageUrl, galleryUrls }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Check slug uniqueness before proceeding
    const isSlugUnique = await checkSlugUniqueness(formData.slug.trim())
    if (!isSlugUnique) {
      // Generate a new unique slug by adding random suffix
      const randomSuffix = Math.random().toString(36).substring(2, 8)
      const newSlug = `${formData.slug}-${randomSuffix}`
      setFormData(prev => ({ ...prev, slug: newSlug }))

      // Update formData for current submission
      formData.slug = newSlug
    }

    try {
      const supabase = createClient()

      // Check Supabase configuration
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set')
      console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set')

      // Upload images
      const { featuredImageUrl, galleryUrls } = await uploadImages()
      console.log('Images uploaded successfully:', { featuredImageUrl, galleryUrls })

      // Prepare event data
      const eventData = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        short_description: formData.short_description.trim(),
        description: formData.description.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
        timezone: formData.timezone,
        venue_name: formData.venue_name.trim(),
        venue_address: formData.venue_address.trim(),
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        base_price: parseFloat(formData.base_price),
        currency: formData.currency,
        total_capacity: parseInt(formData.total_capacity),
        available_seats: parseInt(formData.total_capacity),
        max_tickets_per_user: parseInt(formData.max_tickets_per_user),
        age_restriction: formData.age_restriction ? parseInt(formData.age_restriction) : null,
        is_published: formData.is_published,
       
        booking_start_date: formData.booking_start_date || null,
        booking_end_date: formData.booking_end_date || null,
        featured_image_url: featuredImageUrl,
        gallery_urls: galleryUrls,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        meta_description: formData.meta_description?.trim() || null,
        organizer_id: user.id,
        status: formData.is_published ? 'published' : 'draft'
      }

      console.log('Attempting to insert event data:', eventData)

      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single()

      console.log('Supabase response:', { data, error })

      if (error) {
        console.error('Error creating event:', error)
        let errorMessage = error.message || 'Failed to create event. Please try again.'

        // Handle specific error cases
        if (error.code === '23505' && error.message.includes('events_slug_key')) {
          errorMessage = 'This event title generates a slug that already exists. Please modify the title or slug.'
        }

        setErrors({ submit: errorMessage })
        return
      }

      // Redirect to event management or event detail
      router.push(`/dashboard/organizer/events`)
    } catch (error) {
      console.error('Error creating event:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
      setErrors({ submit: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout sidebar="organizer">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              color="tertiary"
              iconLeading={ArrowLeft}
              onClick={() => router.back()}
            >
              Back
            </Button>
            <div>
              <h1 className="text-display-md font-bold text-gray-900">Create New Event</h1>
              <p className="text-gray-600">Fill in the details to create your event</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Event Title"
                  value={formData.title}
                  onChange={(value) => handleInputChange('title', value)}
                  isInvalid={!!errors.title}
                  hint={errors.title}
                  placeholder="Enter event title"
                  isRequired
                />
              </div>

              <Input
                label="Event Slug"
                value={formData.slug}
                onChange={(value) => handleInputChange('slug', value)}
                isInvalid={!!errors.slug}
                hint={errors.slug || "URL-friendly version of the title"}
                placeholder="event-slug"
                isRequired
              />

              <NativeSelect
                label="Currency"
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                options={[
                  { value: 'INR', label: 'Indian Rupee (₹)' },
                  { value: 'USD', label: 'US Dollar ($)' },
                  { value: 'EUR', label: 'Euro (€)' }
                ]}
              />

              <div className="md:col-span-2">
                <TextArea
                  label="Short Description"
                  value={formData.short_description}
                  onChange={(value) => handleInputChange('short_description', value)}
                  isInvalid={!!errors.short_description}
                  hint={errors.short_description}
                  placeholder="Brief description of your event (1-2 sentences)"
                  rows={2}
                  isRequired
                />
              </div>

              <div className="md:col-span-2">
                <TextArea
                  label="Full Description"
                  value={formData.description}
                  onChange={(value) => handleInputChange('description', value)}
                  isInvalid={!!errors.description}
                  hint={errors.description}
                  placeholder="Detailed description of your event, including schedule, speakers, activities, etc."
                  rows={6}
                  isRequired
                />
              </div>

              <Input
                label="Tags"
                value={formData.tags}
                onChange={(value) => handleInputChange('tags', value)}
                placeholder="music, concert, outdoor (comma-separated)"
                hint="Add tags to help people find your event"
              />

              <Input
                label="Meta Description"
                value={formData.meta_description || ''}
                onChange={(value) => handleInputChange('meta_description', value)}
                placeholder="SEO description for search engines"
                hint="Optional: Description for search engines"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Date & Time</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                type="datetime-local"
                label="Start Date & Time"
                value={formData.start_date}
                onChange={(value) => handleInputChange('start_date', value)}
                isInvalid={!!errors.start_date}
                hint={errors.start_date}
                isRequired
              />

              <Input
                type="datetime-local"
                label="End Date & Time"
                value={formData.end_date}
                onChange={(value) => handleInputChange('end_date', value)}
                isInvalid={!!errors.end_date}
                hint={errors.end_date}
                isRequired
              />

              <NativeSelect
                label="Timezone"
                value={formData.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                options={[
                  { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
                  { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
                  { value: 'America/New_York', label: 'Eastern Time (ET)' },
                  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' }
                ]}
              />

              <div className="md:col-span-1" />

              <Input
                type="datetime-local"
                label="Booking Start Date"
                value={formData.booking_start_date || ''}
                onChange={(value) => handleInputChange('booking_start_date', value)}
                hint="When can people start booking? (Optional - defaults to now)"
              />

              <Input
                type="datetime-local"
                label="Booking End Date"
                value={formData.booking_end_date || ''}
                onChange={(value) => handleInputChange('booking_end_date', value)}
                hint="When should booking close? (Optional - defaults to event start)"
              />
            </div>
          </div>

          {/* Venue Information */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Venue Information</h2>
            
            <div className="space-y-6">
              {/* Venue Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Venue Name"
                  value={formData.venue_name}
                  onChange={(value) => handleInputChange('venue_name', value)}
                  isInvalid={!!errors.venue_name}
                  hint={errors.venue_name}
                  placeholder="Convention Center, Hotel Name, etc."
                  isRequired
                />

                <Input
                  label="Venue Address (Manual Entry)"
                  value={formData.venue_address}
                  onChange={(value) => handleInputChange('venue_address', value)}
                  isInvalid={!!errors.venue_address}
                  hint={errors.venue_address || "This will be auto-filled when you select a location on the map"}
                  placeholder="Complete address with city, state, and postal code"
                  isRequired
                />
              </div>

              {/* Location Picker */}
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Location *
                  </label>
                  <p className="text-sm text-gray-600">
                    Search for your venue or click on the map to pinpoint the exact location
                  </p>
                </div>

                <LocationPickerMap
                  onLocationSelect={handleLocationSelect}
                  initialLat={formData.latitude ? parseFloat(formData.latitude) : 19.0760}
                  initialLng={formData.longitude ? parseFloat(formData.longitude) : 72.8777}
                  height="400px"
                  searchPlaceholder="Search for venue address..."
                  showSearchBox={true}
                  showCurrentLocationButton={true}
                />

                {/* Location validation error */}
                {(errors.latitude || errors.longitude) && (
                  <div className="mt-2 flex items-center space-x-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>Please select a location on the map</span>
                  </div>
                )}
              </div>

              {/* Hidden coordinate inputs for form submission */}
              <input
                type="hidden"
                name="latitude"
                value={formData.latitude || ''}
              />
              <input
                type="hidden"
                name="longitude"
                value={formData.longitude || ''}
              />

              {/* Optional: Display coordinates for debugging */}
              {formData.latitude && formData.longitude && (
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  Debug: Coordinates - {formData.latitude}, {formData.longitude}
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Capacity */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Pricing & Capacity</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                type="number"
                label="Base Price"
                value={formData.base_price}
                onChange={(value) => handleInputChange('base_price', value)}
                isInvalid={!!errors.base_price}
                hint={errors.base_price || "Set to 0 for free events"}
                placeholder="0.00"
              />

              <Input
                type="number"
                label="Total Capacity"
                value={formData.total_capacity}
                onChange={(value) => handleInputChange('total_capacity', value)}
                isInvalid={!!errors.total_capacity}
                hint={errors.total_capacity}
                placeholder="100"
                isRequired
              />

              <Input
                type="number"
                label="Max Tickets Per User"
                value={formData.max_tickets_per_user}
                onChange={(value) => handleInputChange('max_tickets_per_user', value)}
                isInvalid={!!errors.max_tickets_per_user}
                hint={errors.max_tickets_per_user}
                placeholder="10"
              />

              <Input
                type="number"
                label="Age Restriction"
                value={formData.age_restriction || ''}
                onChange={(value) => handleInputChange('age_restriction', value)}
                placeholder="18"
                hint="Minimum age required (leave empty for no restriction)"
              />
            </div>
          </div>

          {/* Images */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Event Images</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  This image will be the main representation of your event (recommended: 1200x630px)
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setFeaturedImage(file)
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gallery Images (Optional)
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  Additional images to showcase your event (up to 5 images)
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    setGalleryImages(files.slice(0, 5))
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Event Settings</h2>
            
            <div className="space-y-4">

              <Toggle
                label="Publish Immediately"
                hint="Make this event visible to the public right away"
                isSelected={formData.is_published}
                onChange={(checked) => handleInputChange('is_published', checked)}
              />

              
            </div>
          </div>

          {/* Submit Section */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{errors.submit}</span>
            </div>
          )}

          <div className="flex items-center justify-end space-x-4 pt-6">
            <Button
              type="button"
              color="secondary"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={isSubmitting}
              iconLeading={Calendar}
            >
              {isSubmitting ? 'Creating Event...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}