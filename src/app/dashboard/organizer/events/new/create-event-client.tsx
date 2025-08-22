'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, MarkerPin01, Clock, Users01, CurrencyRupee } from '@untitledui/icons'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'
import { TextArea } from '@/components/base/textarea/textarea'
import { Select } from '@/components/base/select/select'
import { Toggle } from '@/components/base/toggle/toggle'
import { Form } from '@/components/base/form/form'
import { createClient } from '@/lib/supabase/client'
import type { Tables, TablesInsert } from '@/lib/supabase/database.types'
import type { User } from '@supabase/supabase-js'

interface Props {
  user: User
  categories: Tables<'event_categories'>[]
}

interface EventFormData {
  title: string
  short_description: string
  description: string
  start_date: string
  end_date: string
  timezone: string
  venue_name: string
  venue_address: string
  base_price: number
  currency: string
  total_capacity: number
  max_tickets_per_user: number
  category_id: string
  is_featured: boolean
  requires_approval: boolean
  age_restriction?: number
  booking_start_date?: string
  booking_end_date?: string
  tags: string[]
}

export function CreateEventClient({ user, categories }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    short_description: '',
    description: '',
    start_date: '',
    end_date: '',
    timezone: 'UTC',
    venue_name: '',
    venue_address: '',
    base_price: 0,
    currency: 'INR',
    total_capacity: 100,
    max_tickets_per_user: 10,
    category_id: '',
    is_featured: false,
    requires_approval: false,
    tags: []
  })

  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      
      const slug = generateSlug(formData.title)
      
      const eventData: TablesInsert<'events'> = {
        title: formData.title,
        slug,
        short_description: formData.short_description,
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.end_date,
        timezone: formData.timezone,
        venue_name: formData.venue_name,
        venue_address: formData.venue_address,
        base_price: formData.base_price,
        currency: formData.currency,
        total_capacity: formData.total_capacity,
        available_seats: formData.total_capacity,
        max_tickets_per_user: formData.max_tickets_per_user,
        category_id: formData.category_id || null,
        is_featured: formData.is_featured,
        requires_approval: formData.requires_approval,
        age_restriction: formData.age_restriction || null,
        booking_start_date: formData.booking_start_date || null,
        booking_end_date: formData.booking_end_date || null,
        tags: formData.tags.length > 0 ? formData.tags : null,
        organizer_id: user.id,
        status: 'draft',
        is_published: false
      }

      const { data, error } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single()

      if (error) {
        console.error('Error creating event:', error)
        alert('Failed to create event. Please try again.')
        return
      }

      router.push(`/dashboard/organizer/events/${data.id}`)
    } catch (error) {
      console.error('Error creating event:', error)
      alert('Failed to create event. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(Boolean)
    setFormData(prev => ({ ...prev, tags }))
  }

  return (
    <DashboardLayout sidebar="organizer">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display-md font-bold text-gray-900">Create New Event</h1>
            <p className="text-gray-600">Fill in the details to create your event.</p>
          </div>
          <Button
            color="secondary"
            href="/dashboard/organizer"
          >
            Cancel
          </Button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <Form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Input
                  label="Event Title"
                  placeholder="Enter event title"
                  value={formData.title}
                  onChange={(value) => handleInputChange('title', value)}
                  isRequired
                />
                
                <Select
                  label="Category"
                  placeholder="Select category"
                  selectedKey={formData.category_id}
                  onSelectionChange={(key) => handleInputChange('category_id', key as string)}
                >
                  {categories.map((category) => (
                    <Select.Item key={category.id} id={category.id}>
                      {category.name}
                    </Select.Item>
                  ))}
                </Select>
              </div>

              <Input
                label="Short Description"
                placeholder="Brief description for event cards"
                value={formData.short_description}
                onChange={(value) => handleInputChange('short_description', value)}
                hint="This will appear on event cards and search results"
              />

              <TextArea
                label="Full Description"
                placeholder="Detailed event description"
                value={formData.description}
                onChange={(value) => handleInputChange('description', value)}
                rows={6}
                hint="Provide comprehensive details about your event"
              />

              <Input
                label="Tags"
                placeholder="music, concert, outdoor (comma-separated)"
                value={formData.tags.join(', ')}
                onChange={(value) => handleTagsChange(value)}
                hint="Add relevant tags to help people discover your event"
              />
            </div>

            {/* Date & Time */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Date & Time</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Input
                  label="Start Date & Time"
                  type="datetime-local"
                  icon={Calendar}
                  value={formData.start_date}
                  onChange={(value) => handleInputChange('start_date', value)}
                  isRequired
                />
                
                <Input
                  label="End Date & Time"
                  type="datetime-local"
                  icon={Calendar}
                  value={formData.end_date}
                  onChange={(value) => handleInputChange('end_date', value)}
                  isRequired
                />

                <Select
                  label="Timezone"
                  selectedKey={formData.timezone}
                  onSelectionChange={(key) => handleInputChange('timezone', key as string)}
                >
                  <Select.Item id="UTC">UTC</Select.Item>
                  <Select.Item id="Asia/Kolkata">Asia/Kolkata (IST)</Select.Item>
                  <Select.Item id="America/New_York">America/New_York (EST)</Select.Item>
                  <Select.Item id="America/Los_Angeles">America/Los_Angeles (PST)</Select.Item>
                  <Select.Item id="Europe/London">Europe/London (GMT)</Select.Item>
                </Select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Input
                  label="Booking Start Date"
                  type="datetime-local"
                  icon={Clock}
                  value={formData.booking_start_date || ''}
                  onChange={(value) => handleInputChange('booking_start_date', value)}
                  hint="When bookings open (defaults to now)"
                />
                
                <Input
                  label="Booking End Date"
                  type="datetime-local"
                  icon={Clock}
                  value={formData.booking_end_date || ''}
                  onChange={(value) => handleInputChange('booking_end_date', value)}
                  hint="When bookings close (defaults to event start)"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Location</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Input
                  label="Venue Name"
                  placeholder="Enter venue name"
                  icon={MarkerPin01}
                  value={formData.venue_name}
                  onChange={(value) => handleInputChange('venue_name', value)}
                  isRequired
                />
                
                <Input
                  label="Venue Address"
                  placeholder="Full address"
                  icon={MarkerPin01}
                  value={formData.venue_address}
                  onChange={(value) => handleInputChange('venue_address', value)}
                  isRequired
                />
              </div>
            </div>

            {/* Pricing & Capacity */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Pricing & Capacity</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Input
                  label="Base Price"
                  type="number"
                  placeholder="0"
                  icon={CurrencyRupee}
                  value={formData.base_price.toString()}
                  onChange={(value) => handleInputChange('base_price', parseFloat(value) || 0)}
                  hint="Set to 0 for free events"
                />
                
                <Input
                  label="Total Capacity"
                  type="number"
                  placeholder="100"
                  icon={Users01}
                  value={formData.total_capacity.toString()}
                  onChange={(value) => handleInputChange('total_capacity', parseInt(value) || 100)}
                  isRequired
                />

                <Input
                  label="Max Tickets Per User"
                  type="number"
                  placeholder="10"
                  icon={Users01}
                  value={formData.max_tickets_per_user.toString()}
                  onChange={(value) => handleInputChange('max_tickets_per_user', parseInt(value) || 10)}
                />
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Event Settings</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Input
                  label="Age Restriction"
                  type="number"
                  placeholder="18"
                  value={formData.age_restriction?.toString() || ''}
                  onChange={(value) => handleInputChange('age_restriction', value ? parseInt(value) : undefined)}
                  hint="Minimum age required (optional)"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900">Featured Event</label>
                    <p className="text-sm text-gray-600">Mark this event as featured for better visibility</p>
                  </div>
                  <Toggle
                    isSelected={formData.is_featured}
                    onChange={(isSelected) => handleInputChange('is_featured', isSelected)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900">Requires Approval</label>
                    <p className="text-sm text-gray-600">Manually approve each booking before confirmation</p>
                  </div>
                  <Toggle
                    isSelected={formData.requires_approval}
                    onChange={(isSelected) => handleInputChange('requires_approval', isSelected)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                color="secondary"
                type="button"
                onClick={() => router.push('/dashboard/organizer')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isLoading}
              >
                Create Event
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </DashboardLayout>
  )
}