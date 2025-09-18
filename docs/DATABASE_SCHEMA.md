# Database Schema Design

## Overview

This document outlines the complete Supabase database schema for the Event Management & Ticket Booking System. The schema supports user authentication, event management, ticket booking, payments, and administrative functions.

## Schema Diagram

```
Users (profiles) ──┐
                   ├─── Events ──┬─── Bookings ──┬─── Tickets
                   │              │               │
                   │              │               └─── Payments
                   │              │
                   │              └─── Event_Categories
                   │
                   └─── User_Roles
```

## Table Definitions

### 1. Users (profiles)

Extends Supabase's built-in `auth.users` table with additional profile information.

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone_number TEXT,
  date_of_birth DATE,
  address JSONB, -- {street, city, state, postal_code, country}
  role user_role DEFAULT 'attendee',
  is_verified BOOLEAN DEFAULT FALSE,
  preferences JSONB, -- {notifications, marketing_emails, preferred_categories}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom enum for user roles
CREATE TYPE user_role AS ENUM ('attendee', 'organizer', 'admin');

-- Indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);

-- RLS Policy
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### 2. Events

Core table for event information and management.

```sql
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  short_description TEXT, -- For cards/previews
  category_id UUID REFERENCES event_categories(id),
  
  -- Event timing
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  
  -- Location
  venue_name TEXT NOT NULL,
  venue_address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Pricing and capacity
  base_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  total_capacity INTEGER NOT NULL,
  available_seats INTEGER NOT NULL,
  
  -- Media and metadata
  featured_image_url TEXT,
  gallery_urls TEXT[], -- Array of image URLs
  tags TEXT[], -- Array of tags for filtering
  
  -- Event settings
  is_published BOOLEAN DEFAULT FALSE,


  age_restriction INTEGER, -- Minimum age
  
  -- Booking settings
  booking_start_date TIMESTAMPTZ,
  booking_end_date TIMESTAMPTZ,
  max_tickets_per_user INTEGER DEFAULT 10,
  
  -- SEO and social
  slug TEXT UNIQUE,
  meta_description TEXT,
  social_share_image_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_category ON events(category_id);
CREATE INDEX idx_events_published ON events(is_published);
CREATE INDEX idx_events_featured ON events(is_featured);
CREATE INDEX idx_events_dates ON events(start_date, end_date);
CREATE INDEX idx_events_location ON events USING GIST(ll_to_earth(latitude, longitude));
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_tags ON events USING GIN(tags);

-- Full text search index
CREATE INDEX idx_events_search ON events USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- RLS Policy
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
```

### 3. Event Categories

Categorization system for events.

```sql
CREATE TABLE event_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT, -- Icon identifier for UI
  color_hex TEXT DEFAULT '#6366f1', -- Brand color for category
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default categories
INSERT INTO event_categories (name, slug, description, icon_name) VALUES
('Concerts', 'concerts', 'Music concerts and live performances', 'music'),
('Workshops', 'workshops', 'Educational and skill-building workshops', 'academic-cap'),
('Sports', 'sports', 'Sports events and competitions', 'trophy'),
('Conferences', 'conferences', 'Professional conferences and seminars', 'presentation-chart-bar'),
('Theater', 'theater', 'Theater shows and dramatic performances', 'mask-happy'),
('Food & Drink', 'food-drink', 'Culinary events and tastings', 'cake'),
('Art & Culture', 'art-culture', 'Art exhibitions and cultural events', 'color-swatch'),
('Technology', 'technology', 'Tech meetups and product launches', 'cpu-chip');

-- Indexes
CREATE INDEX idx_categories_active ON event_categories(is_active);
CREATE INDEX idx_categories_sort ON event_categories(sort_order);
```

### 4. Bookings

Main booking records linking users to events.

```sql
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  
  -- Booking details
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  
  -- Status and metadata
  status booking_status DEFAULT 'pending',
  booking_reference TEXT UNIQUE NOT NULL, -- Human-readable reference
  
  -- Payment info
  payment_id UUID REFERENCES payments(id),
  payment_status payment_status DEFAULT 'pending',
  
  -- Additional info
  attendee_info JSONB, -- {names: [], emails: [], phones: []} for multiple tickets
  special_requests TEXT,
  promotional_code TEXT,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  
  -- QR Code
  qr_code_data TEXT, -- QR code string for verification
  qr_code_url TEXT, -- URL to QR code image
  
  -- Timestamps
  booked_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- For pending bookings
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom enums
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'refunded', 'expired');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');

-- Indexes
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_event ON bookings(event_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);

-- Unique constraint to prevent double booking
CREATE UNIQUE INDEX idx_bookings_user_event_active ON bookings(user_id, event_id) 
WHERE status IN ('pending', 'confirmed');

-- RLS Policy
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
```

### 5. Tickets

Individual ticket records generated from bookings.

```sql
CREATE TABLE tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Ticket details
  ticket_number TEXT UNIQUE NOT NULL, -- Sequential ticket number
  attendee_name TEXT NOT NULL,
  attendee_email TEXT,
  seat_number TEXT, -- Optional seat assignment
  
  -- Status
  status ticket_status DEFAULT 'valid',
  
  -- Check-in info
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES profiles(id), -- Staff member who checked in
  
  -- QR Code (individual ticket QR)
  qr_code_data TEXT UNIQUE NOT NULL,
  qr_code_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom enum
CREATE TYPE ticket_status AS ENUM ('valid', 'used', 'cancelled', 'refunded');

-- Indexes
CREATE INDEX idx_tickets_booking ON tickets(booking_id);
CREATE INDEX idx_tickets_event ON tickets(event_id);
CREATE INDEX idx_tickets_user ON tickets(user_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_qr_code ON tickets(qr_code_data);
CREATE INDEX idx_tickets_number ON tickets(ticket_number);

-- RLS Policy
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
```

### 6. Payments

Payment transaction records.

```sql
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Payment details
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  payment_method TEXT, -- 'razorpay', 'stripe', 'wallet', etc.
  
  -- External payment info
  payment_gateway TEXT NOT NULL, -- 'razorpay', 'stripe'
  gateway_payment_id TEXT, -- External payment ID
  gateway_order_id TEXT, -- External order ID
  
  -- Status and timing
  status payment_status DEFAULT 'pending',
  initiated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  
  -- Additional data
  gateway_response JSONB, -- Full response from payment gateway
  failure_reason TEXT,
  refund_amount DECIMAL(10, 2) DEFAULT 0,
  refunded_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_gateway ON payments(payment_gateway);
CREATE INDEX idx_payments_gateway_id ON payments(gateway_payment_id);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- RLS Policy
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
```

### 7. Event Analytics (Optional)

Track event performance and user engagement.

```sql
CREATE TABLE event_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  
  -- Metrics
  views_count INTEGER DEFAULT 0,
  unique_views_count INTEGER DEFAULT 0,
  bookings_count INTEGER DEFAULT 0,
  revenue DECIMAL(12, 2) DEFAULT 0,
  
  -- Conversion rates
  view_to_booking_rate DECIMAL(5, 2) DEFAULT 0,
  completion_rate DECIMAL(5, 2) DEFAULT 0,
  
  -- Time-based metrics
  date DATE NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint for daily analytics
CREATE UNIQUE INDEX idx_event_analytics_unique ON event_analytics(event_id, date);

-- Indexes
CREATE INDEX idx_analytics_event ON event_analytics(event_id);
CREATE INDEX idx_analytics_date ON event_analytics(date);
```

## Database Functions

### 1. Generate Booking Reference

```sql
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
BEGIN
  RETURN 'BK' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;
```

### 2. Generate Ticket Number

```sql
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'TK' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;
```

### 3. Update Available Seats

```sql
CREATE OR REPLACE FUNCTION update_available_seats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Decrease available seats on new booking
    UPDATE events 
    SET available_seats = available_seats - NEW.quantity
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle status changes
    IF OLD.status != NEW.status THEN
      IF NEW.status = 'cancelled' AND OLD.status IN ('pending', 'confirmed') THEN
        -- Increase available seats on cancellation
        UPDATE events 
        SET available_seats = available_seats + NEW.quantity
        WHERE id = NEW.event_id;
      ELSIF NEW.status IN ('confirmed', 'pending') AND OLD.status = 'cancelled' THEN
        -- Decrease available seats on reactivation
        UPDATE events 
        SET available_seats = available_seats - NEW.quantity
        WHERE id = NEW.event_id;
      END IF;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Increase available seats on deletion
    UPDATE events 
    SET available_seats = available_seats + OLD.quantity
    WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_available_seats
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_available_seats();
```

## Indexes for Performance

```sql
-- Composite indexes for common queries
CREATE INDEX idx_events_search_filter ON events(is_published, start_date, category_id);
CREATE INDEX idx_bookings_user_status ON bookings(user_id, status, created_at);
CREATE INDEX idx_events_location_date ON events(latitude, longitude, start_date) WHERE is_published = true;

-- Partial indexes for active records
CREATE INDEX idx_events_active ON events(start_date, created_at) WHERE is_published = true;
CREATE INDEX idx_bookings_active ON bookings(event_id, created_at) WHERE status IN ('confirmed', 'pending');
```

## Data Migration Scripts

### Initial Setup Script

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For location-based queries

-- Create custom types first
CREATE TYPE user_role AS ENUM ('attendee', 'organizer', 'admin');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'refunded', 'expired');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE ticket_status AS ENUM ('valid', 'used', 'cancelled', 'refunded');

-- Create tables in dependency order
-- (Execute table creation scripts from above in order)

-- Insert default data
INSERT INTO event_categories (name, slug, description, icon_name) VALUES
-- (Categories as listed above)

-- Create database functions
-- (Functions as listed above)

-- Create triggers
-- (Triggers as listed above)
```

This schema provides a solid foundation for your Event Management & Ticket Booking System with proper relationships, indexes, and constraints for optimal performance and data integrity.