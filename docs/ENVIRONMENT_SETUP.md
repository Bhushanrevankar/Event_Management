# Environment & Configuration Guide

## Overview

This guide provides comprehensive setup instructions for the Event Management & Ticket Booking System across development, staging, and production environments.

## Required Services & Accounts

Before starting, ensure you have accounts for:

- **Supabase** - Database and authentication
- **Razorpay** - Payment processing
- **Google Cloud** - Maps API
- **Cloudinary** (optional) - Image hosting
- **Vercel/Netlify** - Deployment (or your preferred host)

## Environment Variables

### Complete Environment Variables List

Create these environment files in your project root:

#### `.env.local` (Development)
```bash
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="EventBooking"
NODE_ENV=development

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret

# Database (optional - for direct connections)
DATABASE_URL=postgresql://postgres:[password]@db.your-project-ref.supabase.co:5432/postgres

# Authentication
NEXTAUTH_SECRET=your-nextauth-secret-key-32-characters-long
NEXTAUTH_URL=http://localhost:3000

# Payment Gateway - Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Google Services
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GOOGLE_PLACES_API_KEY=your_google_places_api_key

# Email Service (Choose one)
# SendGrid
SENDGRID_API_KEY=SG.your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Resend (Alternative)
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# File Upload - Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Rate Limiting (Optional)
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
POSTHOG_KEY=phc_your_posthog_key
POSTHOG_HOST=https://app.posthog.com

# Monitoring (Optional)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# Development Tools
NEXT_PUBLIC_VERCEL_URL=${VERCEL_URL}
ANALYZE=false # Set to true for bundle analysis
```

#### `.env.production` (Production)
```bash
# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_APP_NAME="EventBooking"
NODE_ENV=production

# Supabase Configuration (Production Project)
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Authentication
NEXTAUTH_SECRET=your-production-secret-key-different-from-dev
NEXTAUTH_URL=https://yourdomain.com

# Payment Gateway - Razorpay (Live keys)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_live_key_id
RAZORPAY_KEY_SECRET=your_live_razorpay_secret_key
RAZORPAY_WEBHOOK_SECRET=your_live_webhook_secret

# Other services (production configurations)
# ... (same structure as development but with production values)
```

#### `.env.example` (Template for new developers)
```bash
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="EventBooking"
NODE_ENV=development

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret

# Authentication
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=http://localhost:3000

# Payment Gateway - Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Google Services
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GOOGLE_PLACES_API_KEY=your_google_places_api_key

# Email Service
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# File Upload - Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional Services
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_id
SENTRY_DSN=your_sentry_dsn
```

## Service Setup Instructions

### 1. Supabase Setup

#### Create Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note your project URL and anon key
4. Get service role key from Settings > API

#### Database Setup
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Or apply the schema manually in SQL Editor
```

#### Apply Database Schema
1. Copy the SQL from `docs/DATABASE_SCHEMA.md`
2. Run in Supabase SQL Editor
3. Enable Row Level Security policies

#### Configure Authentication
```sql
-- Enable email auth
UPDATE auth.config SET enable_signup = true;

-- Set up custom claims for roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'attendee');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. Razorpay Setup

#### Account Creation
1. Sign up at [razorpay.com](https://razorpay.com)
2. Complete KYC verification
3. Generate API keys from Dashboard > Settings > API Keys

#### Webhook Configuration
1. Go to Dashboard > Settings > Webhooks
2. Add webhook URL: `https://yourdomain.com/api/v1/payments/webhook`
3. Select events:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
   - `refund.created`
4. Save webhook secret

#### Test Integration
```typescript
// Test Razorpay integration
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// Test order creation
const order = await razorpay.orders.create({
  amount: 50000, // Amount in paise
  currency: 'INR',
  receipt: 'test_receipt_1'
})
```

### 3. Google Maps Setup

#### Enable APIs
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create API key with restrictions

#### API Key Restrictions
```
Application restrictions:
- HTTP referrers: yourdomain.com/*, localhost:3000/*

API restrictions:
- Maps JavaScript API
- Places API
- Geocoding API
```

### 4. Email Service Setup (SendGrid)

#### Account Setup
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Verify sender identity
3. Create API key with full access

#### Email Templates
```bash
# Create email templates in SendGrid dashboard
1. Booking Confirmation
2. Event Reminder
3. Payment Receipt
4. Welcome Email
```

### 5. Cloudinary Setup (Optional)

#### Account Creation
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get cloud name, API key, and secret from dashboard
3. Configure upload presets

#### Upload Configuration
```javascript
// Cloudinary upload preset
{
  "upload_preset": "event_images",
  "folder": "events",
  "transformation": [
    {"width": 1200, "height": 630, "crop": "fill"},
    {"quality": "auto", "fetch_format": "auto"}
  ]
}
```

## Development Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- Git

### Installation Steps
```bash
# Clone repository
git clone <repository-url>
cd reservation_system

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Configure environment variables
# Edit .env.local with your service credentials

# Setup database
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

### Development Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "db:migrate": "supabase db push",
    "db:seed": "supabase db seed",
    "db:reset": "supabase db reset",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "analyze": "ANALYZE=true npm run build"
  }
}
```

## Staging Environment

### Setup Checklist
- [ ] Create staging Supabase project
- [ ] Use Razorpay test keys
- [ ] Setup staging domain
- [ ] Configure staging environment variables
- [ ] Test payment flows
- [ ] Verify email delivery
- [ ] Test authentication flows

### Staging Configuration
```bash
# .env.staging
NEXT_PUBLIC_APP_URL=https://staging.yourdomain.com
NODE_ENV=staging

# Use staging/test services
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
SUPABASE_URL=https://staging-project.supabase.co
```

## Production Deployment

### Pre-Deployment Checklist
- [ ] Database schema applied
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Domain configured
- [ ] CDN setup (optional)
- [ ] Monitoring configured
- [ ] Backup strategy implemented

### Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Configure environment variables in Vercel dashboard
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
# ... add all production environment variables

# Deploy production
vercel --prod
```

### Environment Variables in Vercel
1. Go to Vercel Dashboard > Project > Settings > Environment Variables
2. Add all production environment variables
3. Set appropriate environments (Production, Preview, Development)

### Custom Domain Setup
1. Add domain in Vercel dashboard
2. Configure DNS records
3. Enable SSL (automatic with Vercel)

## Security Configuration

### Production Security
```bash
# Enable security headers in next.config.mjs
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]
```

### CORS Configuration
```typescript
// Configure CORS for API routes
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  runtime: 'nodejs',
  headers: {
    'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
      ? 'https://yourdomain.com' 
      : 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}
```

## Monitoring & Analytics

### Error Monitoring (Sentry)
```bash
# Install Sentry
npm install @sentry/nextjs

# Configure sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

### Performance Monitoring
```typescript
// pages/_app.tsx
import { Analytics } from '@vercel/analytics/react'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
```

## Backup & Recovery

### Database Backups
```bash
# Automated backups with Supabase
# Enable point-in-time recovery in Supabase dashboard

# Manual backup
supabase db dump --local > backup.sql

# Restore from backup
supabase db reset
psql -h localhost -p 54322 -d postgres -U postgres < backup.sql
```

### Environment Backup
```bash
# Store environment variables securely
# Use password managers or secure vaults for team access
# Document all service accounts and access credentials
```

## Troubleshooting

### Common Issues

#### Supabase Connection Issues
```bash
# Check connection
supabase status

# Reset local database
supabase db reset

# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
```

#### Payment Integration Issues
```typescript
// Test Razorpay connection
const testRazorpay = async () => {
  try {
    const order = await razorpay.orders.create({
      amount: 100,
      currency: 'INR',
      receipt: 'test'
    })
    console.log('Razorpay connected:', order.id)
  } catch (error) {
    console.error('Razorpay error:', error)
  }
}
```

#### Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Type check
npm run type-check

# Check for unused dependencies
npx depcheck
```

### Performance Optimization

#### Bundle Analysis
```bash
# Analyze bundle size
npm run analyze

# Check for large dependencies
npx bundlephobia

# Optimize images
# Use next/image for automatic optimization
```

#### Database Performance
```sql
-- Add indexes for common queries
CREATE INDEX CONCURRENTLY idx_events_search ON events USING GIN(to_tsvector('english', title || ' ' || description));
CREATE INDEX CONCURRENTLY idx_events_location ON events (latitude, longitude);
CREATE INDEX CONCURRENTLY idx_bookings_user_event ON bookings (user_id, event_id);
```

This comprehensive environment setup guide ensures consistent configuration across all environments and provides troubleshooting resources for common deployment issues.