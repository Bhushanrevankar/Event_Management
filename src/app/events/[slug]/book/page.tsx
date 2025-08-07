import { notFound, redirect } from 'next/navigation';
import { BookingFlowClient } from './booking-flow-client';

interface Props {
  params: { slug: string };
}

// Mock event data - same as event detail page
const getEventBySlug = async (slug: string) => {
  const mockEvents = {
    'tech-conference-2024': {
      id: '1',
      title: 'Tech Conference 2024',
      description: 'Join industry leaders for the biggest tech event of the year.',
      featured_image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
      start_date: '2024-03-15T10:00:00Z',
      end_date: '2024-03-15T18:00:00Z',
      venue_name: 'Grand Convention Center',
      venue_address: '123 Business District, Mumbai, Maharashtra 400001',
      base_price: 2500,
      currency: 'INR',
      is_featured: true,
      slug: 'tech-conference-2024',
      total_capacity: 500,
      max_tickets_per_user: 5,
      age_restriction: 18,
      category: {
        name: 'Technology',
        color_hex: '#3B82F6'
      },
      organizer: {
        full_name: 'TechEvents India',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        email: 'info@techevents.in'
      }
    },
    'classical-music-evening': {
      id: '2',
      title: 'Classical Music Evening',
      description: 'An enchanting evening of classical music featuring renowned artists from around the world.',
      featured_image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
      start_date: '2024-03-20T19:00:00Z',
      end_date: '2024-03-20T22:00:00Z',
      venue_name: 'Delhi Music Hall',
      venue_address: '456 Cultural Center, New Delhi, Delhi 110001',
      base_price: 800,
      currency: 'INR',
      is_featured: false,
      slug: 'classical-music-evening',
      total_capacity: 300,
      max_tickets_per_user: 8,
      age_restriction: null,
      category: {
        name: 'Music',
        color_hex: '#F59E0B'
      },
      organizer: {
        full_name: 'Delhi Music Society',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        email: 'contact@delhimusic.org'
      }
    }
  };

  return mockEvents[slug as keyof typeof mockEvents] || null;
};

export default async function BookingPage({ params }: Props) {
  const event = await getEventBySlug(params.slug);

  if (!event) {
    notFound();
  }

  // Mock available seats calculation
  const bookedSeats = Math.floor(Math.random() * 100);
  const availableSeats = event.total_capacity - bookedSeats;

  // For demo purposes, we'll simulate that authentication is required
  // In production, this would check for actual user session
  const mockUser = {
    id: 'user_123',
    email: 'demo@example.com',
    user_metadata: {
      full_name: 'Demo User'
    }
  };

  return (
    <BookingFlowClient 
      event={event} 
      user={mockUser}
      availableSeats={availableSeats}
    />
  );
}