# API Documentation

## Overview

This document outlines the complete API structure for the Event Management & Ticket Booking System. The API is built using Next.js API routes with Supabase for database operations and authentication.

## Base Configuration

- **Base URL**: `/api/v1`
- **Authentication**: JWT tokens via Supabase Auth
- **Content-Type**: `application/json`
- **Rate Limiting**: 100 requests per minute per IP

## Authentication

### JWT Token Structure

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "attendee|organizer|admin",
  "aud": "authenticated",
  "exp": 1234567890
}
```

### Authentication Headers

```
Authorization: Bearer <jwt_token>
```

## API Endpoints

### 1. Authentication

#### POST `/api/v1/auth/signup`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "role": "attendee"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "attendee"
    },
    "session": {
      "access_token": "jwt_token",
      "refresh_token": "refresh_token",
      "expires_at": 1234567890
    }
  }
}
```

**Error Responses:**
- `400`: Invalid input data
- `409`: Email already exists

#### POST `/api/v1/auth/signin`

Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "attendee"
    },
    "session": {
      "access_token": "jwt_token",
      "refresh_token": "refresh_token",
      "expires_at": 1234567890
    }
  }
}
```

#### POST `/api/v1/auth/signout`

Sign out user and invalidate token.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully signed out"
}
```

#### POST `/api/v1/auth/refresh`

Refresh expired JWT token.

**Request Body:**
```json
{
  "refresh_token": "refresh_token_here"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "access_token": "new_jwt_token",
    "refresh_token": "new_refresh_token",
    "expires_at": 1234567890
  }
}
```

### 2. User Profile Management

#### GET `/api/v1/users/profile`

Get current user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "avatar_url": "https://...",
    "phone_number": "+1234567890",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postal_code": "10001",
      "country": "US"
    },
    "role": "attendee",
    "is_verified": true,
    "preferences": {
      "notifications": true,
      "marketing_emails": false,
      "preferred_categories": ["concerts", "workshops"]
    },
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### PUT `/api/v1/users/profile`

Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "full_name": "John Smith",
  "phone_number": "+1234567890",
  "address": {
    "street": "456 Oak Ave",
    "city": "Los Angeles",
    "state": "CA",
    "postal_code": "90210",
    "country": "US"
  },
  "preferences": {
    "notifications": true,
    "marketing_emails": true,
    "preferred_categories": ["concerts", "sports"]
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "full_name": "John Smith",
    // ... updated profile data
  }
}
```

### 3. Events Management

#### GET `/api/v1/events`

Get paginated list of events with filtering and search.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `search`: Search query for title/description
- `category`: Category slug filter
- `location`: Location-based search (lat,lng,radius_km)
- `date_from`: Start date filter (ISO 8601)
- `date_to`: End date filter (ISO 8601)
- `price_min`: Minimum price filter
- `price_max`: Maximum price filter
- `sort`: Sort order (`date_asc`, `date_desc`, `price_asc`, `price_desc`, `popularity`)

**Example Request:**
```
GET /api/v1/events?page=1&limit=10&category=concerts&location=40.7128,-74.0060,50&sort=date_asc
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "uuid",
        "title": "Summer Music Festival",
        "short_description": "A day of great music and fun",
        "featured_image_url": "https://...",
        "start_date": "2024-07-15T18:00:00Z",
        "end_date": "2024-07-15T23:00:00Z",
        "venue_name": "Central Park",
        "venue_address": "New York, NY",
        "base_price": 50.00,
        "currency": "USD",
        "available_seats": 150,
        "total_capacity": 200,
        "category": {
          "id": "uuid",
          "name": "Concerts",
          "slug": "concerts"
        },
        "organizer": {
          "id": "uuid",
          "full_name": "Event Corp",
          "avatar_url": "https://..."
        },
        "is_featured": true,
        "tags": ["music", "outdoor", "festival"]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "total_pages": 5,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

#### GET `/api/v1/events/{id}`

Get detailed event information.

**Path Parameters:**
- `id`: Event UUID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Summer Music Festival",
    "description": "Full event description...",
    "short_description": "A day of great music and fun",
    "featured_image_url": "https://...",
    "gallery_urls": ["https://...", "https://..."],
    "start_date": "2024-07-15T18:00:00Z",
    "end_date": "2024-07-15T23:00:00Z",
    "timezone": "America/New_York",
    "venue_name": "Central Park",
    "venue_address": "Central Park, New York, NY 10024",
    "latitude": 40.7851,
    "longitude": -73.9683,
    "base_price": 50.00,
    "currency": "USD",
    "total_capacity": 200,
    "available_seats": 150,
    "category": {
      "id": "uuid",
      "name": "Concerts",
      "slug": "concerts",
      "color_hex": "#ff6b6b"
    },
    "organizer": {
      "id": "uuid",
      "full_name": "Event Corp",
      "email": "contact@eventcorp.com",
      "avatar_url": "https://..."
    },
    "booking_start_date": "2024-06-01T00:00:00Z",
    "booking_end_date": "2024-07-15T16:00:00Z",
    "max_tickets_per_user": 4,
    "age_restriction": 18,
    "tags": ["music", "outdoor", "festival"],
    "is_featured": true,
    "meta_description": "Join us for an unforgettable music experience...",
    "created_at": "2024-05-01T10:00:00Z"
  }
}
```

#### POST `/api/v1/events`

Create a new event (Organizer only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Tech Conference 2024",
  "description": "A comprehensive tech conference...",
  "short_description": "Learn from industry experts",
  "category_id": "uuid",
  "start_date": "2024-09-15T09:00:00Z",
  "end_date": "2024-09-15T17:00:00Z",
  "timezone": "America/New_York",
  "venue_name": "Convention Center",
  "venue_address": "123 Convention Ave, New York, NY",
  "latitude": 40.7589,
  "longitude": -73.9851,
  "base_price": 99.99,
  "currency": "USD",
  "total_capacity": 500,
  "featured_image_url": "https://...",
  "gallery_urls": ["https://...", "https://..."],
  "tags": ["technology", "conference", "networking"],
  "booking_start_date": "2024-08-01T00:00:00Z",
  "booking_end_date": "2024-09-14T23:59:59Z",
  "max_tickets_per_user": 2,
  "age_restriction": null,
  "requires_approval": false
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Tech Conference 2024",
    "slug": "tech-conference-2024",
    // ... full event data
  }
}
```

#### PUT `/api/v1/events/{id}`

Update event (Organizer only - own events).

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `id`: Event UUID

**Request Body:** Same as POST request

**Response (200):**
```json
{
  "success": true,
  "data": {
    // ... updated event data
  }
}
```

#### DELETE `/api/v1/events/{id}`

Delete event (Organizer only - own events).

**Headers:** `Authorization: Bearer <token>`

**Response (204):** No content

### 4. Event Categories

#### GET `/api/v1/categories`

Get all active event categories.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Concerts",
      "slug": "concerts",
      "description": "Music concerts and live performances",
      "icon_name": "music",
      "color_hex": "#ff6b6b",
      "sort_order": 0
    }
  ]
}
```

### 5. Bookings Management

#### POST `/api/v1/bookings`

Create a new booking.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "event_id": "uuid",
  "quantity": 2,
  "attendee_info": {
    "names": ["John Doe", "Jane Doe"],
    "emails": ["john@example.com", "jane@example.com"],
    "phones": ["+1234567890", "+1234567891"]
  },
  "special_requests": "Wheelchair accessible seats",
  "promotional_code": "SUMMER2024"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "booking_reference": "BK20240715001",
    "event": {
      "id": "uuid",
      "title": "Summer Music Festival",
      "start_date": "2024-07-15T18:00:00Z",
      "venue_name": "Central Park"
    },
    "quantity": 2,
    "unit_price": 50.00,
    "discount_amount": 5.00,
    "total_amount": 95.00,
    "currency": "USD",
    "status": "pending",
    "payment_status": "pending",
    "expires_at": "2024-07-10T12:00:00Z",
    "created_at": "2024-07-10T11:45:00Z"
  }
}
```

#### GET `/api/v1/bookings`

Get user's bookings.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: Filter by booking status
- `page`: Page number
- `limit`: Items per page

**Response (200):**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "uuid",
        "booking_reference": "BK20240715001",
        "event": {
          "id": "uuid",
          "title": "Summer Music Festival",
          "featured_image_url": "https://...",
          "start_date": "2024-07-15T18:00:00Z",
          "venue_name": "Central Park"
        },
        "quantity": 2,
        "total_amount": 95.00,
        "currency": "USD",
        "status": "confirmed",
        "payment_status": "completed",
        "qr_code_url": "https://...",
        "created_at": "2024-07-10T11:45:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "total_pages": 1
    }
  }
}
```

#### GET `/api/v1/bookings/{id}`

Get specific booking details.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "booking_reference": "BK20240715001",
    "event": {
      // ... full event details
    },
    "quantity": 2,
    "unit_price": 50.00,
    "discount_amount": 5.00,
    "total_amount": 95.00,
    "currency": "USD",
    "status": "confirmed",
    "payment_status": "completed",
    "attendee_info": {
      "names": ["John Doe", "Jane Doe"],
      "emails": ["john@example.com", "jane@example.com"]
    },
    "tickets": [
      {
        "id": "uuid",
        "ticket_number": "TK2024071500001",
        "attendee_name": "John Doe",
        "qr_code_url": "https://...",
        "status": "valid"
      },
      {
        "id": "uuid",
        "ticket_number": "TK2024071500002",
        "attendee_name": "Jane Doe",
        "qr_code_url": "https://...",
        "status": "valid"
      }
    ],
    "payment": {
      "id": "uuid",
      "amount": 95.00,
      "status": "completed",
      "payment_method": "razorpay",
      "completed_at": "2024-07-10T11:50:00Z"
    },
    "qr_code_data": "BK20240715001|uuid|2024-07-15",
    "qr_code_url": "https://...",
    "created_at": "2024-07-10T11:45:00Z"
  }
}
```

#### PUT `/api/v1/bookings/{id}/cancel`

Cancel a booking.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reason": "Can't attend due to scheduling conflict"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "cancelled",
    "cancelled_at": "2024-07-10T15:30:00Z",
    "refund_amount": 95.00,
    "refund_status": "pending"
  }
}
```

### 6. Payment Processing

#### POST `/api/v1/payments/create-order`

Create payment order for booking.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "booking_id": "uuid",
  "payment_method": "razorpay"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "payment_id": "uuid",
    "gateway_order_id": "order_razorpay_id",
    "amount": 9500, // Amount in paise
    "currency": "INR",
    "receipt": "BK20240715001",
    "key": "rzp_live_key", // Razorpay key for frontend
    "prefill": {
      "name": "John Doe",
      "email": "john@example.com",
      "contact": "+1234567890"
    }
  }
}
```

#### POST `/api/v1/payments/verify`

Verify payment after completion.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "payment_id": "uuid",
  "gateway_payment_id": "pay_razorpay_id",
  "gateway_signature": "signature_hash"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "payment_id": "uuid",
    "status": "completed",
    "booking": {
      "id": "uuid",
      "status": "confirmed",
      "payment_status": "completed"
    }
  }
}
```

#### POST `/api/v1/payments/webhook`

Handle payment gateway webhooks.

**Headers:** 
- `X-Razorpay-Signature`: Webhook signature
- `Content-Type`: application/json

**Request Body:** Razorpay webhook payload

**Response (200):**
```json
{
  "success": true,
  "message": "Webhook processed"
}
```

### 7. QR Code Management

#### GET `/api/v1/qr-codes/{booking_id}`

Generate QR code for booking.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "qr_code_data": "BK20240715001|uuid|2024-07-15",
    "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?data=...",
    "expires_at": "2024-07-15T23:59:59Z"
  }
}
```

#### POST `/api/v1/qr-codes/verify`

Verify QR code at event (Organizer/Staff only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "qr_code_data": "BK20240715001|uuid|2024-07-15",
  "event_id": "uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "booking": {
      "id": "uuid",
      "booking_reference": "BK20240715001",
      "attendee_names": ["John Doe", "Jane Doe"],
      "quantity": 2,
      "status": "confirmed"
    },
    "tickets": [
      {
        "id": "uuid",
        "ticket_number": "TK2024071500001",
        "attendee_name": "John Doe",
        "status": "valid",
        "checked_in": false
      }
    ]
  }
}
```

#### POST `/api/v1/qr-codes/checkin`

Check in ticket using QR code.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "ticket_id": "uuid",
  "event_id": "uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "ticket_id": "uuid",
    "status": "used",
    "checked_in_at": "2024-07-15T18:15:00Z",
    "attendee_name": "John Doe"
  }
}
```

### 8. Dashboard & Analytics

#### GET `/api/v1/dashboard/organizer`

Get organizer dashboard data.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_events": 15,
      "upcoming_events": 8,
      "total_bookings": 342,
      "total_revenue": 25670.50,
      "this_month_revenue": 5240.00
    },
    "recent_bookings": [
      {
        "id": "uuid",
        "booking_reference": "BK20240715001",
        "event_title": "Summer Music Festival",
        "attendee_name": "John Doe",
        "amount": 95.00,
        "status": "confirmed",
        "created_at": "2024-07-10T11:45:00Z"
      }
    ],
    "upcoming_events": [
      {
        "id": "uuid",
        "title": "Summer Music Festival",
        "start_date": "2024-07-15T18:00:00Z",
        "total_bookings": 45,
        "total_revenue": 2250.00,
        "available_seats": 155
      }
    ]
  }
}
```

#### GET `/api/v1/dashboard/attendee`

Get attendee dashboard data.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_bookings": 8,
      "upcoming_events": 3,
      "past_events": 5,
      "total_spent": 420.00
    },
    "upcoming_bookings": [
      {
        "id": "uuid",
        "booking_reference": "BK20240715001",
        "event": {
          "id": "uuid",
          "title": "Summer Music Festival",
          "start_date": "2024-07-15T18:00:00Z",
          "venue_name": "Central Park",
          "featured_image_url": "https://..."
        },
        "quantity": 2,
        "status": "confirmed"
      }
    ],
    "recommended_events": [
      // ... personalized event recommendations
    ]
  }
}
```

### 9. Search & Filtering

#### GET `/api/v1/search`

Advanced search across events.

**Query Parameters:**
- `q`: Search query
- `category`: Category filter
- `location`: Location (lat,lng,radius)
- `date_range`: Date range filter
- `price_range`: Price range filter
- `sort`: Sort options
- `filters`: Advanced filters (JSON)

#### GET `/api/v1/search/suggestions`

Get search suggestions.

**Query Parameters:**
- `q`: Partial search query

**Response (200):**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      "Summer Music Festival",
      "Tech Conference 2024",
      "Art Exhibition"
    ],
    "categories": [
      "concerts",
      "workshops"
    ],
    "locations": [
      "New York, NY",
      "Los Angeles, CA"
    ]
  }
}
```

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Invalid email format"
    }
  }
}
```

### Error Codes

- `AUTHENTICATION_ERROR`: Invalid or expired token
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `VALIDATION_ERROR`: Invalid request data
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource conflict (e.g., double booking)
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `PAYMENT_ERROR`: Payment processing failed
- `SERVER_ERROR`: Internal server error

## Rate Limiting

- **Default**: 100 requests per minute per IP
- **Authentication endpoints**: 10 requests per minute per IP
- **Payment endpoints**: 20 requests per minute per user
- **Upload endpoints**: 5 requests per minute per user

## Webhook Events

### Razorpay Webhooks

- `payment.captured`: Payment successful
- `payment.failed`: Payment failed
- `refund.created`: Refund initiated
- `order.paid`: Order completed

## API Testing

### Postman Collection

A complete Postman collection is available with:
- Pre-configured environments (dev, staging, prod)
- Authentication setup
- Sample requests for all endpoints
- Test scripts for automated testing

### Testing Checklist

- [ ] User registration and authentication
- [ ] Event CRUD operations
- [ ] Booking flow (create, payment, confirmation)
- [ ] QR code generation and verification
- [ ] Dashboard data retrieval
- [ ] Error handling scenarios
- [ ] Rate limiting behavior
- [ ] Webhook processing