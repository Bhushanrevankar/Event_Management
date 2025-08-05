# Security Policies & Row Level Security (RLS)

## Overview

This document outlines the comprehensive security strategy for the Event Management & Ticket Booking System, including Supabase Row Level Security (RLS) policies, authentication mechanisms, and security best practices.

## Authentication Strategy

### JWT-Based Authentication

The system uses Supabase Auth with JWT tokens containing:

```json
{
  "sub": "user-uuid",
  "email": "user@example.com", 
  "role": "attendee|organizer|admin",
  "aud": "authenticated",
  "exp": 1234567890,
  "iat": 1234567890,
  "app_metadata": {
    "role": "attendee",
    "verified": true
  },
  "user_metadata": {
    "full_name": "John Doe"
  }
}
```

### Role-Based Access Control (RBAC)

#### User Roles

1. **Attendee** (`attendee`)
   - Book tickets for events
   - View own bookings and tickets
   - Update own profile
   - Access attendee dashboard

2. **Organizer** (`organizer`)
   - All attendee permissions
   - Create, update, delete own events
   - View bookings for own events
   - Access organizer dashboard
   - Generate and verify QR codes for own events

3. **Admin** (`admin`)
   - All organizer permissions
   - Manage all events and users
   - Access admin panel
   - View system analytics
   - Manage categories and system settings

## Row Level Security (RLS) Policies

### 1. Profiles Table Policies

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (signup)
CREATE POLICY "Users can create own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Organizers can view other organizer profiles (for event collaboration)
CREATE POLICY "Organizers can view other organizers" ON profiles
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'organizer' AND role = 'organizer'
  );

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Public profiles for event organizers (limited info)
CREATE POLICY "Public organizer info" ON profiles
  FOR SELECT USING (
    role = 'organizer' AND 
    id IN (SELECT organizer_id FROM events WHERE is_published = true)
  );
```

### 2. Events Table Policies

```sql
-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Anyone can view published events
CREATE POLICY "Anyone can view published events" ON events
  FOR SELECT USING (is_published = true);

-- Organizers can view their own events (including unpublished)
CREATE POLICY "Organizers can view own events" ON events
  FOR SELECT USING (auth.uid() = organizer_id);

-- Organizers can create events
CREATE POLICY "Organizers can create events" ON events
  FOR INSERT WITH CHECK (
    auth.uid() = organizer_id AND
    auth.jwt() ->> 'role' IN ('organizer', 'admin')
  );

-- Organizers can update their own events
CREATE POLICY "Organizers can update own events" ON events
  FOR UPDATE USING (
    auth.uid() = organizer_id AND
    auth.jwt() ->> 'role' IN ('organizer', 'admin')
  );

-- Organizers can delete their own events (with restrictions)
CREATE POLICY "Organizers can delete own events" ON events
  FOR DELETE USING (
    auth.uid() = organizer_id AND
    auth.jwt() ->> 'role' IN ('organizer', 'admin') AND
    -- Can only delete if no confirmed bookings exist
    NOT EXISTS (
      SELECT 1 FROM bookings 
      WHERE event_id = events.id AND status = 'confirmed'
    )
  );

-- Admins can manage all events
CREATE POLICY "Admins can manage all events" ON events
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

### 3. Bookings Table Policies

```sql
-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create bookings for themselves
CREATE POLICY "Users can create own bookings" ON bookings
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    -- Event must be published and booking period active
    EXISTS (
      SELECT 1 FROM events 
      WHERE id = event_id 
      AND is_published = true 
      AND NOW() BETWEEN COALESCE(booking_start_date, created_at) 
      AND COALESCE(booking_end_date, start_date)
      AND available_seats >= quantity
    )
  );

-- Users can update their own bookings (limited scenarios)
CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE USING (
    auth.uid() = user_id AND
    -- Only allow updates to cancel bookings or update attendee info
    (OLD.status = NEW.status OR NEW.status = 'cancelled')
  );

-- Organizers can view bookings for their events
CREATE POLICY "Organizers can view event bookings" ON bookings
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('organizer', 'admin') AND
    EXISTS (
      SELECT 1 FROM events 
      WHERE id = event_id AND organizer_id = auth.uid()
    )
  );

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings" ON bookings
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
```

### 4. Tickets Table Policies

```sql
-- Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets" ON tickets
  FOR SELECT USING (auth.uid() = user_id);

-- System can create tickets (via booking process)
CREATE POLICY "System can create tickets" ON tickets
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE id = booking_id AND user_id = auth.uid()
    )
  );

-- Organizers can view tickets for their events
CREATE POLICY "Organizers can view event tickets" ON tickets
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('organizer', 'admin') AND
    EXISTS (
      SELECT 1 FROM events 
      WHERE id = event_id AND organizer_id = auth.uid()
    )
  );

-- Organizers can update ticket status (check-in)
CREATE POLICY "Organizers can update event tickets" ON tickets
  FOR UPDATE USING (
    auth.jwt() ->> 'role' IN ('organizer', 'admin') AND
    EXISTS (
      SELECT 1 FROM events 
      WHERE id = event_id AND organizer_id = auth.uid()
    )
  );

-- Admins can manage all tickets
CREATE POLICY "Admins can manage all tickets" ON tickets
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

### 5. Payments Table Policies

```sql
-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

-- System can create payments (secure API endpoints only)
CREATE POLICY "System can create payments" ON payments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE id = booking_id AND user_id = auth.uid()
    )
  );

-- Payment updates only through secure API
CREATE POLICY "Restrict payment updates" ON payments
  FOR UPDATE USING (
    -- Only allow status updates through API
    auth.jwt() ->> 'role' = 'admin' OR
    (auth.uid() = user_id AND OLD.status = 'pending')
  );

-- Organizers can view payments for their events
CREATE POLICY "Organizers can view event payments" ON payments
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('organizer', 'admin') AND
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN events e ON b.event_id = e.id
      WHERE b.id = booking_id AND e.organizer_id = auth.uid()
    )
  );

-- Admins can view all payments
CREATE POLICY "Admins can view all payments" ON payments
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
```

### 6. Event Categories Policies

```sql
-- Enable RLS
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view active categories
CREATE POLICY "Anyone can view active categories" ON event_categories
  FOR SELECT USING (is_active = true);

-- Only admins can manage categories
CREATE POLICY "Admins can manage categories" ON event_categories
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

## API Security Middleware

### Authentication Middleware

```typescript
// middleware/auth.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function authMiddleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect API routes
  if (request.nextUrl.pathname.startsWith('/api/v1/')) {
    // Public endpoints
    const publicEndpoints = [
      '/api/v1/auth/signin',
      '/api/v1/auth/signup',
      '/api/v1/events',
      '/api/v1/categories',
      '/api/v1/search'
    ]

    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      request.nextUrl.pathname.startsWith(endpoint)
    )

    if (!isPublicEndpoint && !session) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTHENTICATION_ERROR', message: 'Authentication required' } },
        { status: 401 }
      )
    }
  }

  return res
}
```

### Role-Based Authorization

```typescript
// utils/auth.ts
export function hasRole(session: Session | null, requiredRole: string): boolean {
  if (!session?.user) return false
  
  const userRole = session.user.app_metadata?.role || 'attendee'
  
  const roleHierarchy = {
    'attendee': 0,
    'organizer': 1,
    'admin': 2
  }
  
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
  
  return userLevel >= requiredLevel
}

export function requireRole(requiredRole: string) {
  return (handler: NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse) => {
    const supabase = createServerSupabaseClient({ req, res })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!hasRole(session, requiredRole)) {
      return res.status(403).json({
        success: false,
        error: { code: 'AUTHORIZATION_ERROR', message: 'Insufficient permissions' }
      })
    }
    
    return handler(req, res)
  }
}
```

### Rate Limiting

```typescript
// utils/rate-limit.ts
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export async function rateLimit(
  identifier: string,
  limit: number = 100,
  window: number = 60000 // 1 minute
): Promise<{ success: boolean; remaining: number }> {
  const key = `rate_limit:${identifier}`
  const current = await redis.incr(key)
  
  if (current === 1) {
    await redis.expire(key, Math.ceil(window / 1000))
  }
  
  const remaining = Math.max(0, limit - current)
  
  return {
    success: current <= limit,
    remaining
  }
}

// Usage in API routes
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const identifier = req.ip || 'anonymous'
  const { success, remaining } = await rateLimit(identifier)
  
  res.setHeader('X-RateLimit-Remaining', remaining.toString())
  
  if (!success) {
    return res.status(429).json({
      success: false,
      error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' }
    })
  }
  
  // Continue with request handling...
}
```

## Input Validation & Sanitization

### Validation Schemas

```typescript
// schemas/validation.ts
import { z } from 'zod'

export const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  category_id: z.string().uuid(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  venue_name: z.string().min(1).max(200),
  venue_address: z.string().min(1).max(500),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  base_price: z.number().min(0).max(999999.99),
  total_capacity: z.number().int().min(1).max(100000),
  tags: z.array(z.string()).max(10).optional()
})

export const createBookingSchema = z.object({
  event_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(10),
  attendee_info: z.object({
    names: z.array(z.string().min(1)).min(1),
    emails: z.array(z.string().email()).min(1),
    phones: z.array(z.string().regex(/^\+?[1-9]\d{1,14}$/)).optional()
  }),
  special_requests: z.string().max(1000).optional(),
  promotional_code: z.string().max(50).optional()
})
```

### SQL Injection Prevention

- **Parameterized Queries**: Always use Supabase client methods which automatically sanitize inputs
- **Input Validation**: Validate all inputs against schemas before database operations
- **Escape User Content**: Sanitize any user-generated content displayed in UI

```typescript
// Safe database operations
const { data, error } = await supabase
  .from('events')
  .select('*')
  .eq('id', eventId) // Automatically sanitized
  .single()

// Avoid raw SQL with user input
// NEVER: .rpc('custom_function', { unsafe_param: userInput })
```

## Payment Security

### Razorpay Integration Security

```typescript
// utils/payment-security.ts
import crypto from 'crypto'

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  const body = orderId + '|' + paymentId
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body.toString())
    .digest('hex')
  
  return expectedSignature === signature
}

export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  
  return expectedSignature === signature
}
```

### PCI DSS Compliance

- **No Card Data Storage**: Never store credit card information
- **Secure Transmission**: All payment data transmitted over HTTPS
- **Third-Party Processing**: Use certified payment processors (Razorpay/Stripe)
- **Audit Logging**: Log all payment-related activities

## Data Protection & Privacy

### Personal Data Handling

```sql
-- Data retention policy
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void AS $$
BEGIN
  -- Delete expired bookings (30 days old)
  DELETE FROM bookings 
  WHERE status = 'expired' 
  AND expires_at < NOW() - INTERVAL '30 days';
  
  -- Anonymize old user data (GDPR compliance)
  UPDATE profiles 
  SET 
    email = 'deleted-' || id || '@example.com',
    full_name = 'Deleted User',
    phone_number = NULL,
    address = NULL
  WHERE 
    updated_at < NOW() - INTERVAL '3 years'
    AND id NOT IN (
      SELECT DISTINCT user_id FROM bookings 
      WHERE created_at > NOW() - INTERVAL '1 year'
    );
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (run daily)
SELECT cron.schedule('cleanup-expired-data', '0 2 * * *', 'SELECT cleanup_expired_data();');
```

### GDPR Compliance

- **Right to Access**: Users can export their data
- **Right to Deletion**: Users can request account deletion
- **Right to Rectification**: Users can update their information
- **Data Portability**: Provide data in machine-readable format

```typescript
// api/v1/users/export-data.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const supabase = createServerSupabaseClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Export user data
  const userData = await exportUserData(session.user.id)
  
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Content-Disposition', 'attachment; filename=user-data.json')
  res.json(userData)
}
```

## Security Headers & HTTPS

### Next.js Security Headers

```typescript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com https://checkout.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co;",
          },
        ],
      },
    ]
  },
}

export default nextConfig
```

## Monitoring & Logging

### Security Event Logging

```typescript
// utils/security-logger.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface SecurityEvent {
  event_type: string
  user_id?: string
  ip_address?: string
  user_agent?: string
  details: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export async function logSecurityEvent(event: SecurityEvent) {
  await supabase.from('security_logs').insert({
    ...event,
    timestamp: new Date().toISOString()
  })
  
  // Alert on high/critical events
  if (event.severity === 'high' || event.severity === 'critical') {
    // Send alert to monitoring system
    await sendSecurityAlert(event)
  }
}

// Usage examples
await logSecurityEvent({
  event_type: 'FAILED_LOGIN_ATTEMPT',
  ip_address: req.ip,
  user_agent: req.headers['user-agent'],
  details: { email: 'user@example.com', reason: 'invalid_password' },
  severity: 'medium'
})

await logSecurityEvent({
  event_type: 'SUSPICIOUS_BOOKING_PATTERN',
  user_id: session.user.id,
  details: { booking_count: 10, time_window: '5 minutes' },
  severity: 'high'
})
```

## Environment Security

### Environment Variables

```bash
# .env.local (never commit)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Payment
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=your_secret_key

# Security
NEXTAUTH_SECRET=your-nextauth-secret
ENCRYPTION_KEY=your-32-character-encryption-key

# External APIs
GOOGLE_MAPS_API_KEY=your-google-maps-key
```

### Production Security Checklist

- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure firewall rules
- [ ] Set up DDoS protection
- [ ] Enable database SSL connections
- [ ] Configure secure session management
- [ ] Implement comprehensive logging
- [ ] Set up monitoring and alerting
- [ ] Regular security audits
- [ ] Dependency vulnerability scanning
- [ ] Backup and disaster recovery plan

## Incident Response Plan

### Security Breach Response

1. **Immediate Actions**
   - Isolate affected systems
   - Preserve evidence
   - Assess scope of breach

2. **Investigation**
   - Analyze security logs
   - Identify attack vectors
   - Document findings

3. **Containment**
   - Patch vulnerabilities
   - Update security measures
   - Reset compromised credentials

4. **Recovery**
   - Restore services
   - Implement additional safeguards
   - Monitor for further issues

5. **Communication**
   - Notify affected users
   - Report to authorities if required
   - Update security documentation

This comprehensive security framework ensures the Event Management system maintains the highest standards of data protection and user privacy while providing a secure booking experience.