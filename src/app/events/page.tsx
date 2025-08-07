'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { EventList } from '@/components/events/event-list';
import { Input } from '@/components/base/input/input';
import { Select } from '@/components/base/select/select';
import { Button } from '@/components/base/buttons/button';

export default function EventsPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    location: '',
    dateFrom: '',
    dateTo: '',
    priceMin: 0,
    priceMax: 10000
  });

  // Placeholder data - this would come from Supabase in production
  const [events] = useState([
    {
      id: '1',
      title: 'Tech Conference 2024',
      description: 'Join industry leaders for the biggest tech event of the year. Learn about AI, blockchain, and the future of technology.',
      featured_image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop',
      start_date: '2024-03-15T10:00:00Z',
      venue_name: 'Convention Center, Mumbai',
      base_price: 2500,
      currency: 'INR',
      is_featured: true,
      slug: 'tech-conference-2024',
      category: {
        name: 'Technology',
        color_hex: '#3B82F6'
      },
      organizer: {
        full_name: 'TechEvents India',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
      }
    },
    {
      id: '2',
      title: 'Classical Music Evening',
      description: 'An enchanting evening of classical music featuring renowned artists from around the world.',
      featured_image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop',
      start_date: '2024-03-20T19:00:00Z',
      venue_name: 'Music Hall, Delhi',
      base_price: 800,
      currency: 'INR',
      is_featured: false,
      slug: 'classical-music-evening',
      category: {
        name: 'Music',
        color_hex: '#F59E0B'
      },
      organizer: {
        full_name: 'Delhi Music Society',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
      }
    },
    {
      id: '3',
      title: 'Startup Pitch Competition',
      description: 'Watch innovative startups pitch their ideas to top investors. Network with entrepreneurs and VCs.',
      featured_image_url: 'https://images.unsplash.com/photo-1559223607-b4d0555ae227?w=600&h=400&fit=crop',
      start_date: '2024-03-25T14:00:00Z',
      venue_name: 'Innovation Hub, Bangalore',
      base_price: 0,
      currency: 'INR',
      is_featured: false,
      slug: 'startup-pitch-competition',
      category: {
        name: 'Business',
        color_hex: '#10B981'
      },
      organizer: {
        full_name: 'Startup Bangalore',
        avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face'
      }
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error] = useState(null);
  const [pagination] = useState({
    page: 1,
    total: 3,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });

  const handleEventClick = (event: any) => {
    window.location.href = `/events/${event.slug}`;
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      location: '',
      dateFrom: '',
      dateTo: '',
      priceMin: 0,
      priceMax: 10000
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-display-md font-bold mb-4">
          Discover Events
        </h1>
        <p className="text-lg text-gray-600">
          Find the perfect event for you
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Filters</h3>
              <Button
                variant="link"
                size="sm"
                onClick={clearFilters}
              >
                Clear All
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Events
                </label>
                <Input
                  placeholder="Event name, organizer..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <Select 
                  selectedKey={filters.category || null} 
                  onSelectionChange={(value) => handleFilterChange('category', value || '')}
                  placeholder="All Categories"
                  items={[
                    { id: '', label: 'All Categories' },
                    { id: 'technology', label: 'Technology' },
                    { id: 'music', label: 'Music' },
                    { id: 'business', label: 'Business' },
                    { id: 'sports', label: 'Sports' }
                  ]}
                >
                  {(item) => (
                    <Select.Item key={item.id} id={item.id} value={item.id}>
                      {item.label}
                    </Select.Item>
                  )}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <Input
                  placeholder="City or venue..."
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Min price"
                    value={filters.priceMin.toString()}
                    onChange={(e) => handleFilterChange('priceMin', parseInt(e.target.value) || 0)}
                  />
                  <Input
                    type="number"
                    placeholder="Max price"
                    value={filters.priceMax.toString()}
                    onChange={(e) => handleFilterChange('priceMax', parseInt(e.target.value) || 10000)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="lg:col-span-3">
          <div className="mb-6 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {pagination?.total || 0} events found
            </p>
            
            <Select 
              defaultSelectedKey="date_asc" 
              placeholder="Sort by"
              items={[
                { id: 'date_asc', label: 'Date (Earliest first)' },
                { id: 'date_desc', label: 'Date (Latest first)' },
                { id: 'price_asc', label: 'Price (Low to high)' },
                { id: 'price_desc', label: 'Price (High to low)' }
              ]}
            >
              {(item) => (
                <Select.Item key={item.id} id={item.id} value={item.id}>
                  {item.label}
                </Select.Item>
              )}
            </Select>
          </div>

          <EventList
            events={events || []}
            loading={loading}
            error={error}
            pagination={pagination}
            onEventClick={handleEventClick}
          />
        </div>
      </div>
    </div>
  );
}