# TheAuctus Architecture

## Overview

TheAuctus is an automated creator growth engine built with Next.js 16, Supabase, and AI-powered content planning.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── calendar/      # AI content generation
│   │   ├── posts/         # Post management
│   │   ├── profile/       # User profile
│   │   └── user/          # User data
│   ├── auth/              # Auth pages (signin, signup, etc.)
│   ├── dashboard/         # Dashboard pages
│   ├── onboarding/        # User onboarding flow
│   └── privacy/           # Privacy policy
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (Button, Card, Modal, etc.)
│   ├── auth-buttons.tsx   # Auth button components
│   ├── hero-visual.tsx    # Landing page hero
│   ├── theme-toggle.tsx   # Dark/light mode toggle
│   ├── theme-provider.tsx # Theme context
│   ├── three-d-card.tsx   # 3D tilt card component
│   └── user-provider.tsx  # User context
├── hooks/                 # Custom React hooks
│   └── use-in-view.ts    # Intersection observer
└── lib/                   # Utilities and services
    ├── index.ts           # Barrel exports
    ├── constants.ts       # App constants (pricing, platforms, etc.)
    ├── types.ts           # TypeScript types
    ├── api-types.ts       # API request/response types
    ├── env.ts             # Environment validation
    ├── errors.ts          # Error handling utilities
    ├── feature-flags.ts   # Feature flag system
    ├── validate.ts        # Input validation
    ├── rate-limit.ts      # Rate limiting
    ├── supabase.ts        # Supabase client (browser)
    ├── supabase-server.ts # Supabase client (server)
    ├── webhooks.ts        # Webhook handlers
    └── store.ts           # Client-side state
```

## Key Concepts

### 1. Authentication Flow

```
Signup → OTP Verification → Onboarding → Dashboard
   ↓
Google/Facebook OAuth → Onboarding → Dashboard
```

- **Supabase Auth**: Handles all authentication
- **Middleware**: Protects routes, refreshes sessions
- **Cookies**: Session stored in httpOnly cookies

### 2. API Routes

All API routes follow this pattern:

```typescript
// src/app/api/example/route.ts
import { withErrorHandling, apiSuccess, apiError } from "@/lib/errors";

export const POST = withErrorHandling(async (request: Request) => {
  const body = await request.json();
  
  // Validate input
  if (!body.email) {
    return apiValidationError("Email is required", "email");
  }
  
  // Process...
  
  return apiSuccess({ id: "123" });
});
```

### 3. Component Architecture

- **UI Components** (`src/components/ui/`): Base building blocks
- **Feature Components** (`src/components/`): Feature-specific components
- **Page Components** (`src/app/*/page.tsx`): Route pages

### 4. State Management

- **React Context**: Theme, User state
- **URL State**: Search params, filters
- **Server State**: Supabase real-time subscriptions

## Environment Variables

### Required (Server)
```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-anthropic-key
```

### Required (Client)
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Optional
```env
STRIPE_SECRET_KEY=your-stripe-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-pk
NEXT_PUBLIC_APP_URL=https://www.theauctus.in
```

## Adding New Features

### 1. New API Route

1. Create route in `src/app/api/your-feature/route.ts`
2. Add types in `src/lib/api-types.ts`
3. Add validation in `src/lib/validate.ts`
4. Use `withErrorHandling` wrapper

### 2. New Page

1. Create page in `src/app/your-page/page.tsx`
2. Add to navigation if needed
3. Create loading state in `loading.tsx`

### 3. New Component

1. Create in `src/components/`
2. Export from barrel file if reusable
3. Follow naming: `ComponentName.tsx`

### 4. New Feature Flag

1. Add to `DEFAULT_FEATURE_FLAGS` in `constants.ts`
2. Use in code:
```typescript
import { isFeatureEnabled } from "@/lib/feature-flags";

if (isFeatureEnabled("enableStripe")) {
  // Show Stripe UI
}
```

## Database Schema

### profiles
```sql
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- username (text, unique)
- full_name (text)
- niche (text)
- brand_voice (text)
- tone_preferences (text[])
- target_audience (text)
- content_goals (text[])
- posting_frequency (text)
- onboarded (boolean)
- plan (text)
- credits (integer)
- created_at (timestamptz)
- updated_at (timestamptz)
```

### posts
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- content (text)
- platform (text)
- status (text)
- scheduled_at (timestamptz)
- published_at (timestamptz)
- media_url (text)
- hashtags (text[])
- content_type (text)
- ai_generated (boolean)
- created_at (timestamptz)
```

## Security

- All API routes validate input
- Rate limiting on auth endpoints
- CSRF protection on state-changing routes
- No secrets in client bundle
- RLS policies on all tables
- Webhook signature verification

## Performance

- Static pages pre-rendered
- Dynamic routes server-rendered
- Image optimization with next/image
- Font optimization with next/font
- Code splitting automatic with App Router

## Testing

```bash
# Run all tests
npm test

# Run specific test
npm test -- --grep "auth"

# Run with coverage
npm test -- --coverage
```

## Deployment

1. Push to GitHub
2. Vercel auto-deploys from `main` branch
3. Set environment variables in Vercel dashboard
4. Configure Supabase production project
5. Set up Stripe webhook endpoint (when ready)

## Future Roadmap

- [ ] Stripe billing integration
- [ ] Platform OAuth connections
- [ ] Real-time analytics
- [ ] Content repurposing engine
- [ ] Team collaboration
- [ ] White-label reporting
- [ ] API access for integrations
