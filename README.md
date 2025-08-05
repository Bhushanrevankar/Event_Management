# Event Management & Ticket Booking System

A comprehensive, responsive web platform for event discovery, ticket booking, and event management. Built with Next.js 15, Supabase, and modern web technologies.

## 🌟 Features

### For Attendees
- **Event Discovery**: Browse and search events by category, location, and date
- **Smart Filtering**: Location-based search with Google Maps integration
- **Secure Booking**: Streamlined ticket booking with seat selection
- **Payment Integration**: Secure payments via Razorpay with QR code tickets
- **Mobile-First**: Fully responsive design for all devices
- **Digital Tickets**: QR code tickets with offline access

### For Organizers
- **Event Management**: Complete CRUD operations for events
- **Analytics Dashboard**: Real-time insights on bookings and revenue
- **Attendee Management**: View and manage event attendees
- **QR Code Scanner**: Check-in attendees at events
- **Revenue Tracking**: Comprehensive financial reporting

### For Administrators
- **User Management**: Oversee all users and their permissions
- **Event Moderation**: Approve and manage all events
- **System Analytics**: Platform-wide statistics and insights
- **Category Management**: Manage event categories and settings

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript 5.8
- **UI Framework**: Tailwind CSS v4.1, Untitled UI Components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with JWT
- **Payments**: Razorpay integration
- **Maps**: Google Maps API
- **Email**: SendGrid/Resend for notifications
- **File Upload**: Cloudinary for image management
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ and npm
- Git
- Accounts for required services:
  - [Supabase](https://supabase.com) - Database & Auth
  - [Razorpay](https://razorpay.com) - Payment processing
  - [Google Cloud](https://console.cloud.google.com) - Maps API
  - [Cloudinary](https://cloudinary.com) - Image hosting (optional)

## ⚡ Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd reservation_system
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Configure your environment variables
# See docs/ENVIRONMENT_SETUP.md for detailed instructions
```

### 3. Database Setup
```bash
# Setup Supabase project and apply schema
# Follow instructions in docs/DATABASE_SCHEMA.md

# Run database migrations
npm run db:migrate
npm run db:seed
```

### 4. Start Development
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[Database Schema](docs/DATABASE_SCHEMA.md)** - Complete database design and relationships
- **[API Documentation](docs/API_DOCUMENTATION.md)** - RESTful API endpoints and usage
- **[Security Policies](docs/SECURITY_POLICIES.md)** - Authentication, authorization, and RLS policies  
- **[Directory Structure](docs/DIRECTORY_STRUCTURE.md)** - Project organization and naming conventions
- **[Environment Setup](docs/ENVIRONMENT_SETUP.md)** - Detailed setup for all environments

## 🔧 Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:migrate      # Apply database migrations
npm run db:seed         # Seed database with sample data
npm run db:reset        # Reset database

# Quality Assurance
npm run lint            # Run ESLint
npm run type-check      # TypeScript type checking
npm run test            # Run tests
npm run test:coverage   # Test coverage report

# Analysis
npm run analyze         # Bundle size analysis
```

## 🏗️ Architecture Overview

```
src/
├── app/                 # Next.js App Router pages
│   ├── auth/           # Authentication pages
│   ├── events/         # Event browsing and details
│   ├── dashboard/      # User dashboards (attendee/organizer)
│   ├── admin/          # Admin panel
│   └── api/            # API routes
├── components/         # React components
│   ├── ui/             # Base UI components
│   ├── auth/           # Authentication components
│   ├── events/         # Event-related components
│   ├── booking/        # Booking flow components
│   └── dashboard/      # Dashboard components
├── lib/                # Utilities and configurations
├── hooks/              # Custom React hooks
├── types/              # TypeScript definitions
└── store/              # State management
```

## 🔐 Security Features

- **Row Level Security (RLS)** - Database-level access control
- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - Granular permission system
- **Input Validation** - Comprehensive data validation with Zod
- **Rate Limiting** - API protection against abuse
- **Payment Security** - PCI DSS compliant payment processing
- **HTTPS Enforcement** - SSL/TLS encryption for all communications

## 🌐 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Configure environment variables in Vercel dashboard
# Deploy to production
vercel --prod
```

### Other Platforms
The application is compatible with:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

See [Environment Setup Guide](docs/ENVIRONMENT_SETUP.md) for detailed deployment instructions.

## 🧪 Testing

```bash
# Run all tests
npm run test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📱 Mobile Support

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Touch Optimized**: Touch-friendly interfaces for mobile devices
- **PWA Ready**: Progressive Web App capabilities
- **Offline Support**: Service worker for offline functionality
- **App-like Experience**: Native app feel on mobile devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Environment Variables

Key environment variables needed:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_key

# Email
SENDGRID_API_KEY=your_sendgrid_key
```

See `.env.example` for the complete list.

## 🐛 Troubleshooting

Common issues and solutions:

**Database Connection Issues**
```bash
# Check Supabase connection
supabase status
supabase db reset
```

**Build Failures**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**Payment Integration Issues**
- Verify Razorpay keys are correct
- Check webhook URL configuration
- Ensure HTTPS for production webhooks

For more troubleshooting, see [Environment Setup Guide](docs/ENVIRONMENT_SETUP.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- **Documentation**: Check the `/docs` directory
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join our GitHub Discussions

## 🗺️ Roadmap

- [ ] Mobile App (React Native)
- [ ] Advanced Analytics Dashboard
- [ ] Multi-language Support
- [ ] Social Media Integration
- [ ] Advanced Seat Selection
- [ ] Recurring Events
- [ ] Event Collaboration Tools
- [ ] Advanced Marketing Tools

---

Built with ❤️ using [Untitled UI](https://www.untitledui.com) components and modern web technologies.
