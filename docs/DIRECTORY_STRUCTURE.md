# Directory & Page Structure

## Overview

This document outlines the recommended directory structure for the Event Management & Ticket Booking System built with Next.js 15 App Router, organized for scalability, maintainability, and developer experience.

## Project Root Structure

```
reservation_system/
├── .env.local                      # Environment variables (not committed)
├── .env.example                    # Environment template
├── .gitignore                      # Git ignore rules
├── next.config.mjs                 # Next.js configuration
├── package.json                    # Dependencies and scripts
├── tailwind.config.js              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
├── components.json                 # shadcn/ui components configuration
├── middleware.ts                   # Next.js middleware (auth, redirects)
├── CLAUDE.md                       # Claude Code instructions
├── README.md                       # Project documentation
│
├── docs/                           # Project documentation
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_SCHEMA.md
│   ├── SECURITY_POLICIES.md
│   ├── DIRECTORY_STRUCTURE.md
│   └── ENVIRONMENT_SETUP.md
│
├── public/                         # Static assets
│   ├── favicon.ico
│   ├── logo.svg
│   ├── images/
│   │   ├── hero/
│   │   ├── events/
│   │   └── placeholders/
│   └── icons/
│       ├── categories/
│       └── payments/
│
├── src/                           # Source code
│   ├── app/                       # Next.js App Router pages
│   ├── components/                # React components
│   ├── lib/                       # Utilities and configurations
│   ├── hooks/                     # Custom React hooks
│   ├── types/                     # TypeScript type definitions
│   ├── store/                     # State management (Zustand/Redux)
│   ├── styles/                    # Global styles and themes
│   └── utils/                     # Helper functions
│
├── supabase/                      # Supabase configuration
│   ├── migrations/                # Database migrations
│   ├── seed.sql                   # Database seed data
│   └── config.toml                # Supabase configuration
│
└── tests/                         # Test files
    ├── __mocks__/
    ├── components/
    ├── pages/
    └── utils/
```

## App Router Structure (`src/app/`)

### Page Hierarchy

```
src/app/
├── layout.tsx                     # Root layout (auth, theme providers)
├── page.tsx                       # Homepage
├── loading.tsx                    # Global loading UI
├── error.tsx                      # Global error UI
├── not-found.tsx                  # 404 page
├── globals.css                    # Global styles
│
├── auth/                          # Authentication pages
│   ├── signin/
│   │   └── page.tsx              # Sign in page
│   ├── signup/
│   │   └── page.tsx              # Sign up page
│   ├── forgot-password/
│   │   └── page.tsx              # Password reset
│   └── verify-email/
│       └── page.tsx              # Email verification
│
├── events/                        # Event-related pages
│   ├── page.tsx                  # Events listing page
│   ├── [slug]/                   # Dynamic event detail page
│   │   ├── page.tsx              # Event details
│   │   ├── book/                 # Booking flow
│   │   │   ├── page.tsx          # Booking form
│   │   │   ├── payment/
│   │   │   │   └── page.tsx      # Payment page
│   │   │   └── confirmation/
│   │   │       └── page.tsx      # Booking confirmation
│   │   └── loading.tsx           # Event loading state
│   ├── category/
│   │   └── [slug]/
│   │       └── page.tsx          # Category-filtered events
│   └── search/
│       └── page.tsx              # Search results page
│
├── dashboard/                     # User dashboards
│   ├── layout.tsx                # Dashboard layout with navigation
│   ├── page.tsx                  # Dashboard home (redirect to role-based)
│   │
│   ├── attendee/                 # Attendee dashboard
│   │   ├── page.tsx              # Dashboard overview
│   │   ├── bookings/
│   │   │   ├── page.tsx          # All bookings
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Booking details
│   │   ├── tickets/
│   │   │   ├── page.tsx          # All tickets
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Ticket details (QR code)
│   │   ├── profile/
│   │   │   └── page.tsx          # Profile settings
│   │   └── favorites/
│   │       └── page.tsx          # Saved events
│   │
│   └── organizer/                # Organizer dashboard
│       ├── page.tsx              # Dashboard overview
│       ├── events/
│       │   ├── page.tsx          # My events list
│       │   ├── create/
│       │   │   └── page.tsx      # Create new event
│       │   └── [id]/
│       │       ├── page.tsx      # Event management
│       │       ├── edit/
│       │       │   └── page.tsx  # Edit event
│       │       ├── bookings/
│       │       │   └── page.tsx  # Event bookings
│       │       ├── analytics/
│       │       │   └── page.tsx  # Event analytics
│       │       └── checkin/
│       │           └── page.tsx  # QR code scanner
│       ├── analytics/
│       │   └── page.tsx          # Overall analytics
│       └── profile/
│           └── page.tsx          # Organizer profile
│
├── admin/                         # Admin panel (protected)
│   ├── layout.tsx                # Admin layout
│   ├── page.tsx                  # Admin dashboard
│   ├── users/
│   │   ├── page.tsx              # User management
│   │   └── [id]/
│   │       └── page.tsx          # User details
│   ├── events/
│   │   ├── page.tsx              # All events management
│   │   └── [id]/
│   │       └── page.tsx          # Event moderation
│   ├── categories/
│   │   └── page.tsx              # Category management
│   ├── payments/
│   │   └── page.tsx              # Payment monitoring
│   ├── analytics/
│   │   └── page.tsx              # System analytics
│   └── settings/
│       └── page.tsx              # System settings
│
├── api/                          # API routes
│   └── v1/                       # API version 1
│       ├── auth/                 # Authentication endpoints
│       │   ├── signin/
│       │   │   └── route.ts
│       │   ├── signup/
│       │   │   └── route.ts
│       │   ├── signout/
│       │   │   └── route.ts
│       │   └── refresh/
│       │       └── route.ts
│       ├── users/                # User management
│       │   ├── profile/
│       │   │   └── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── events/               # Event management
│       │   ├── route.ts          # GET /api/v1/events, POST /api/v1/events
│       │   ├── [id]/
│       │   │   └── route.ts      # GET, PUT, DELETE /api/v1/events/[id]
│       │   └── search/
│       │       └── route.ts      # Event search
│       ├── categories/
│       │   └── route.ts          # Event categories
│       ├── bookings/             # Booking management
│       │   ├── route.ts          # GET, POST /api/v1/bookings
│       │   └── [id]/
│       │       ├── route.ts      # GET /api/v1/bookings/[id]
│       │       └── cancel/
│       │           └── route.ts  # PUT /api/v1/bookings/[id]/cancel
│       ├── payments/             # Payment processing
│       │   ├── create-order/
│       │   │   └── route.ts      # Create payment order
│       │   ├── verify/
│       │   │   └── route.ts      # Verify payment
│       │   └── webhook/
│       │       └── route.ts      # Payment webhooks
│       ├── qr-codes/             # QR code management
│       │   ├── [bookingId]/
│       │   │   └── route.ts      # Generate QR code
│       │   ├── verify/
│       │   │   └── route.ts      # Verify QR code
│       │   └── checkin/
│       │       └── route.ts      # Check-in ticket
│       ├── dashboard/            # Dashboard data
│       │   ├── organizer/
│       │   │   └── route.ts      # Organizer dashboard
│       │   └── attendee/
│       │       └── route.ts      # Attendee dashboard
│       ├── upload/               # File upload
│       │   └── route.ts          # Image upload endpoint
│       └── search/               # Search functionality
│           ├── route.ts          # Global search
│           └── suggestions/
│               └── route.ts      # Search suggestions
│
├── profile/                      # Public profile pages
│   └── [username]/
│       └── page.tsx              # Public organizer profile
│
├── legal/                        # Legal pages
│   ├── privacy/
│   │   └── page.tsx              # Privacy policy
│   ├── terms/
│   │   └── page.tsx              # Terms of service
│   └── refund/
│       └── page.tsx              # Refund policy
│
└── help/                         # Help and support
    ├── page.tsx                  # Help center
    ├── faq/
    │   └── page.tsx              # FAQ
    └── contact/
        └── page.tsx              # Contact support
```

## Components Structure (`src/components/`)

### Component Organization

```
src/components/
├── ui/                           # Base UI components (shadcn/ui)
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── form.tsx
│   ├── table.tsx
│   ├── toast.tsx
│   ├── calendar.tsx
│   ├── select.tsx
│   ├── tabs.tsx
│   ├── badge.tsx
│   ├── avatar.tsx
│   ├── skeleton.tsx
│   └── ...
│
├── layout/                       # Layout components
│   ├── header/
│   │   ├── header.tsx           # Main header
│   │   ├── navigation.tsx       # Navigation menu
│   │   ├── user-menu.tsx        # User dropdown menu
│   │   └── mobile-menu.tsx      # Mobile navigation
│   ├── footer/
│   │   ├── footer.tsx           # Main footer
│   │   └── footer-links.tsx     # Footer navigation
│   ├── sidebar/
│   │   ├── dashboard-sidebar.tsx # Dashboard navigation
│   │   └── admin-sidebar.tsx    # Admin navigation
│   └── providers/
│       ├── auth-provider.tsx    # Authentication context
│       ├── theme-provider.tsx   # Theme context
│       └── query-provider.tsx   # React Query provider
│
├── auth/                        # Authentication components
│   ├── signin-form.tsx
│   ├── signup-form.tsx
│   ├── forgot-password-form.tsx
│   ├── protected-route.tsx
│   └── role-guard.tsx
│
├── events/                      # Event-related components
│   ├── event-card.tsx           # Event card for listings
│   ├── event-detail.tsx         # Event detail view
│   ├── event-form.tsx           # Create/edit event form
│   ├── event-list.tsx           # Event listing with filters
│   ├── event-search.tsx         # Search component
│   ├── event-filters.tsx        # Filter sidebar
│   ├── event-gallery.tsx        # Image gallery
│   ├── event-map.tsx            # Google Maps integration
│   ├── category-selector.tsx    # Category selection
│   └── featured-events.tsx      # Featured events carousel
│
├── booking/                     # Booking-related components
│   ├── booking-form.tsx         # Booking form
│   ├── booking-summary.tsx      # Booking summary
│   ├── ticket-selector.tsx      # Quantity selection
│   ├── attendee-info-form.tsx   # Attendee information
│   ├── booking-confirmation.tsx # Confirmation page
│   ├── booking-card.tsx         # Booking item display
│   └── booking-status.tsx       # Status indicator
│
├── payment/                     # Payment components
│   ├── payment-form.tsx         # Payment form
│   ├── payment-methods.tsx      # Payment method selection
│   ├── razorpay-checkout.tsx    # Razorpay integration
│   ├── payment-status.tsx       # Payment status display
│   └── invoice.tsx              # Invoice generation
│
├── tickets/                     # Ticket components
│   ├── ticket-card.tsx          # Ticket display
│   ├── qr-code-display.tsx      # QR code component
│   ├── qr-code-scanner.tsx      # QR scanner for check-in
│   ├── ticket-download.tsx      # Download ticket button
│   └── ticket-email.tsx         # Email template
│
├── dashboard/                   # Dashboard components
│   ├── stats-card.tsx           # Statistics card
│   ├── chart.tsx                # Chart components
│   ├── recent-activity.tsx      # Activity feed
│   ├── quick-actions.tsx        # Action buttons
│   └── dashboard-layout.tsx     # Dashboard wrapper
│
├── admin/                       # Admin components
│   ├── user-table.tsx           # User management table
│   ├── event-moderation.tsx     # Event approval
│   ├── analytics-dashboard.tsx  # Admin analytics
│   ├── system-settings.tsx      # Settings panel
│   └── audit-log.tsx            # Activity logging
│
├── forms/                       # Form components
│   ├── controlled-input.tsx     # Controlled form input
│   ├── file-upload.tsx          # File upload component
│   ├── date-picker.tsx          # Date selection
│   ├── location-picker.tsx      # Location/map picker
│   ├── image-upload.tsx         # Image upload with preview
│   └── form-wrapper.tsx         # Form wrapper with validation
│
├── common/                      # Common/shared components
│   ├── loading-spinner.tsx      # Loading indicator
│   ├── error-boundary.tsx       # Error handling
│   ├── empty-state.tsx          # Empty state display
│   ├── pagination.tsx           # Pagination component
│   ├── search-bar.tsx           # Search input
│   ├── filter-chip.tsx          # Filter tags
│   ├── confirmation-dialog.tsx  # Confirmation modal
│   ├── image-gallery.tsx        # Image gallery
│   ├── social-share.tsx         # Social sharing buttons
│   └── breadcrumb.tsx           # Breadcrumb navigation
│
└── email/                       # Email templates
    ├── booking-confirmation.tsx # Booking confirmation email
    ├── event-reminder.tsx       # Event reminder email
    ├── payment-receipt.tsx      # Payment receipt email
    └── welcome-email.tsx        # Welcome email
```

## Library Configuration (`src/lib/`)

```
src/lib/
├── supabase/
│   ├── client.ts               # Supabase client setup
│   ├── server.ts               # Server-side Supabase client
│   ├── middleware.ts           # Supabase middleware
│   └── types.ts                # Database types
├── auth/
│   ├── config.ts               # Auth configuration
│   ├── permissions.ts          # Role-based permissions
│   └── helpers.ts              # Auth helper functions
├── payment/
│   ├── razorpay.ts             # Razorpay integration
│   ├── stripe.ts               # Stripe integration (optional)
│   └── webhook-handlers.ts     # Payment webhook handlers
├── maps/
│   ├── google-maps.ts          # Google Maps configuration
│   └── location-utils.ts       # Location helper functions
├── email/
│   ├── config.ts               # Email service config
│   ├── templates.ts            # Email templates
│   └── sender.ts               # Email sending logic
├── upload/
│   ├── cloudinary.ts           # Image upload service
│   └── file-utils.ts           # File handling utilities
├── analytics/
│   ├── config.ts               # Analytics configuration
│   └── tracking.ts             # Event tracking
├── validations/
│   ├── auth.ts                 # Auth validation schemas
│   ├── events.ts               # Event validation schemas
│   ├── bookings.ts             # Booking validation schemas
│   └── common.ts               # Common validation schemas
└── constants/
    ├── routes.ts               # Route constants
    ├── api-endpoints.ts        # API endpoint constants
    ├── event-categories.ts     # Event category definitions
    └── app-config.ts           # App configuration
```

## Types (`src/types/`)

```
src/types/
├── auth.ts                     # Authentication types
├── events.ts                   # Event-related types
├── bookings.ts                 # Booking types
├── payments.ts                 # Payment types
├── users.ts                    # User types
├── api.ts                      # API response types
├── database.ts                 # Database types (auto-generated)
└── common.ts                   # Common/shared types
```

## Custom Hooks (`src/hooks/`)

```
src/hooks/
├── auth/
│   ├── use-auth.ts             # Authentication hook
│   ├── use-role.ts             # Role-based access hook
│   └── use-session.ts          # Session management
├── events/
│   ├── use-events.ts           # Event fetching
│   ├── use-event-detail.ts     # Single event hook
│   ├── use-event-search.ts     # Event search hook
│   └── use-create-event.ts     # Event creation
├── bookings/
│   ├── use-bookings.ts         # Booking management
│   ├── use-create-booking.ts   # Booking creation
│   └── use-booking-status.ts   # Booking status updates
├── payments/
│   ├── use-payment.ts          # Payment processing
│   └── use-payment-status.ts   # Payment status tracking
├── common/
│   ├── use-debounce.ts         # Debounced values
│   ├── use-local-storage.ts    # Local storage hook
│   ├── use-pagination.ts       # Pagination logic
│   ├── use-filters.ts          # Filter management
│   └── use-infinite-scroll.ts  # Infinite scrolling
└── dashboard/
    ├── use-dashboard-stats.ts  # Dashboard statistics
    └── use-analytics.ts        # Analytics data
```

## State Management (`src/store/`)

```
src/store/
├── index.ts                    # Store configuration
├── auth-store.ts               # Authentication state
├── events-store.ts             # Events state
├── bookings-store.ts           # Bookings state
├── ui-store.ts                 # UI state (modals, themes)
└── cart-store.ts               # Shopping cart state
```

## Naming Conventions

### Files and Directories
- **Pages**: `kebab-case` for routes (`/events/create-event`)
- **Components**: `PascalCase` for component files (`EventCard.tsx`)
- **Hooks**: `camelCase` starting with `use` (`useEventSearch.ts`)
- **Utilities**: `kebab-case` (`format-date.ts`)
- **Types**: `kebab-case` (`event-types.ts`)

### Components
- **Component Names**: `PascalCase` (`EventCard`, `UserProfile`)
- **Props Interface**: `ComponentNameProps` (`EventCardProps`)
- **File Structure**: One component per file with same name

### API Routes
- **REST Pattern**: `/api/v1/resource` or `/api/v1/resource/[id]`
- **Actions**: Use HTTP methods (GET, POST, PUT, DELETE)
- **Nested Resources**: `/api/v1/events/[id]/bookings`

## Mobile Responsiveness Strategy

### Breakpoint Strategy
```typescript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',   // Mobile landscape
      'md': '768px',   // Tablet
      'lg': '1024px',  // Desktop
      'xl': '1280px',  # Large desktop
      '2xl': '1536px', # Extra large
    }
  }
}
```

### Component Responsiveness
- **Mobile-First Design**: Start with mobile layouts
- **Progressive Enhancement**: Add desktop features
- **Touch-Friendly**: Minimum 44px touch targets
- **Performance**: Lazy load non-critical components

## Performance Optimizations

### Code Splitting
- **Route-Based**: Automatic with App Router
- **Component-Based**: `lazy()` for heavy components
- **Third-Party**: Dynamic imports for external libraries

### Image Optimization
- **Next.js Image**: Use `next/image` component
- **Formats**: WebP with fallbacks
- **Responsive**: Multiple sizes for different screens
- **CDN**: Cloudinary or similar for event images

### Bundle Optimization
- **Tree Shaking**: Import only used functions
- **Bundle Analysis**: `@next/bundle-analyzer`
- **Dynamic Imports**: Load payment scripts on-demand

This directory structure provides a scalable foundation for the Event Management system while maintaining clear separation of concerns and following Next.js best practices.