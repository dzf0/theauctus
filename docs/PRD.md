# TheAuctus — Product Requirements Document

**Version:** 1.0  
**Date:** August 24, 2026  
**Author:** Product Team  
**Status:** Draft

---

## 1. Problem Statement

**Who hurts:** Solo content creators, small businesses, and marketing agencies managing social media presence.

**Why they hurt:**
- Creating consistent, high-quality content across 3-5 platforms takes 15-20 hours/week
- Most creators lack design skills, copywriting expertise, or trend awareness
- Manual posting leads to inconsistent schedules, missed optimal posting times
- Tracking analytics across platforms requires juggling multiple dashboards
- Hiring social media managers costs $3,000-$10,000/month — unaffordable for 90% of creators

**Current alternatives:**
- Hootsuite/Buffer: Scheduling only, no content generation ($49-$99/mo)
- Jasper/Copy.ai: Content generation only, no analytics or scheduling ($49-$99/mo)
- Hiring freelancers: Expensive, inconsistent quality, management overhead

**TheAuctus solves this** by combining AI content generation, performance analytics, and a credits-based pricing model that scales with usage.

---

## 2. Target User + Personas

### Primary: All Creator Types

| Attribute | Solo Creator | Small Business | Marketing Agency |
|-----------|--------------|----------------|------------------|
| Team size | 1 person | 1-3 people | 5-20 people |
| Platforms | Instagram, TikTok | Instagram, LinkedIn, Facebook | Multiple clients × multiple platforms |
| Budget | $0-$50/mo | $50-$200/mo | $500-$2,000/mo |
| Pain point | "I can't keep up with content creation" | "I need professional content without hiring" | "I need to scale content production for clients" |
| Success metric | 10K followers in 6 months | 2x engagement rate | 3x client capacity |

### Persona 1: Aisha, 24 — Solo Content Creator

**Bio:** Fashion influencer with 15K Instagram followers. Posts 3x/week but struggles with captions and hashtag research. Spends 2 hours per post. Wants to grow to 50K followers.

**Goals:**
- Post consistently without burnout
- Increase engagement rate from 2.1% to 5%+
- Discover trending content formats in fashion niche

**Frustrations:**
- "I run out of caption ideas after 3 posts"
- "I don't know which hashtags are actually working"
- "I can't afford a social media manager"

### Persona 2: Marcus, 38 — Small Business Owner

**Bio:** Runs a local coffee shop chain (3 locations). Manages Instagram and Facebook personally. Posts sporadically (1-2x/week). Wants to drive foot traffic and online orders.

**Goals:**
- Increase local awareness and foot traffic
- Professional content without hiring agency
- Track which posts drive actual sales

**Frustrations:**
- "I don't have time to create content between managing the business"
- "My posts look amateur compared to big chains"
- "I can't tell if social media is actually helping sales"

---

## 3. Goals and Non-Goals

### Goals (MVP)

| Goal | Metric | Target |
|------|--------|--------|
| Validate product-market fit | Paying users | 10 users within 60 days |
| Content generation quality | User satisfaction (survey) | 4.0/5.0 average rating |
| Platform usability | Onboarding completion rate | 70% complete signup → first generation |
| Revenue sustainability | Credits purchased/month | $500 MRR by Day 60 |

### Non-Goals (MVP)

| Non-Goal | Why Not |
|----------|---------|
| Direct platform publishing | Requires OAuth integrations with each platform — complex, risky, defer to v2 |
| Team collaboration features | Solo creators are primary target; agencies are v2 |
| Mobile app | Web-first validates core value; mobile is v2 |
| Multi-language support | English-only for MVP; i18n is v2 |
| Advanced analytics (attribution) | Basic metrics first; attribution modeling is v2 |

---

## 4. User Stories

### Content Generation

| ID | User Story | Priority |
|----|------------|----------|
| US-01 | As a creator, I want to describe my niche and brand voice so that AI generates content matching my style | P0 |
| US-02 | As a creator, I want to generate 30 days of content in one click so that I can plan ahead | P0 |
| US-03 | As a creator, I want to generate individual posts with specific topics so that I can create timely content | P0 |
| US-04 | As a creator, I want to see trending content in my niche so that I can stay relevant | P1 |
| US-05 | As a creator, I want to regenerate content with different tones so that I can find the best fit | P1 |

### Analytics

| ID | User Story | Priority |
|----|------------|----------|
| US-06 | As a creator, I want to see engagement metrics for my generated posts so that I can measure performance | P0 |
| US-07 | As a creator, I want to compare performance across platforms so that I can focus efforts | P1 |
| US-08 | As a creator, I want to see which content types perform best so that I can optimize strategy | P1 |
| US-09 | As a creator, I want to receive AI-powered recommendations so that I can improve future content | P2 |

### Credits & Billing

| ID | User Story | Priority |
|----|------------|----------|
| US-10 | As a creator, I want to purchase credits so that I can generate content | P0 |
| US-11 | As a creator, I want to see my credit balance so that I know when to refill | P0 |
| US-12 | As a creator, I want different credit packages so that I can choose based on my budget | P0 |
| US-13 | As a creator, I want to see credit history so that I can track spending | P1 |

### Account & Onboarding

| ID | User Story | Priority |
|----|------------|----------|
| US-14 | As a creator, I want to sign up with email or Google so that I can start quickly | P0 |
| US-15 | As a creator, I want to set up my brand profile so that content matches my style | P0 |
| US-16 | As a creator, I want to see a guided tour so that I understand how to use the platform | P1 |

---

## 5. Feature List

### MVP (Launch)

| Feature | Description | Effort |
|---------|-------------|--------|
| **User Authentication** | Email/password + Google OAuth via Supabase | ✅ Done |
| **Brand Profile Setup** | Niche, target audience, brand voice, tone preferences | 2 days |
| **AI Content Generation** | Template-based, conversational, research-driven modes | 5 days |
| **Content Calendar** | 30-day calendar view with generated posts | 3 days |
| **Credits System** | Purchase credits, track balance, spending history | 3 days |
| **Analytics Dashboard** | Basic engagement metrics (likes, comments, shares, reach) | 4 days |
| **Post Editor** | Edit generated content before saving/exporting | 2 days |
| **Export Functionality** | Download posts as CSV/text for manual publishing | 1 day |

**Total MVP Effort:** ~20 days

### v2 (Post-Launch)

| Feature | Description |
|---------|-------------|
| Direct Publishing | OAuth integrations with Instagram, TikTok, Twitter, LinkedIn |
| Scheduling | Auto-publish at optimal times based on analytics |
| Team Collaboration | Multi-user workspaces, approval workflows |
| Advanced Analytics | Attribution modeling, ROI tracking, competitor analysis |
| Content Repurposing | Transform one post into multiple formats (carousel, story, reel) |
| A/B Testing | Test different content variations with audience segments |

### Later (v3+)

| Feature | Description |
|---------|-------------|
| Mobile App | iOS/Android native apps |
| Multi-language | Support for 10+ languages |
| White-label | Agency branding for client-facing dashboards |
| API Access | Programmatic content generation for enterprise |
| AI Video Generation | Create short-form video content |

---

## 6. Detailed Functional Requirements (MVP)

### 6.1 Brand Profile Setup

**User Flow:**
1. New user completes signup
2. Redirected to onboarding wizard (5 steps)
3. Each step saves progress (can return later)

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Niche/Industry | Select + text | Yes | Must select or enter custom |
| Target Audience | Text (100 chars) | Yes | "18-24 year old fashion enthusiasts" |
| Brand Voice | Select (professional, casual, humorous, inspirational, educational) | Yes | Single selection |
| Tone Preferences | Multi-select (formal, friendly, urgent, playful, authoritative) | Yes | 1-3 selections |
| Content Goals | Multi-select (engagement, sales, awareness, education, entertainment) | Yes | 1-3 selections |
| Posting Frequency | Select (daily, 3-5x/week, 1-2x/week, weekly) | Yes | Single selection |

**AI Training:**
- User inputs 3-5 example posts they've written (optional)
- AI analyzes style, vocabulary, structure
- Stores "brand fingerprint" for future generations

### 6.2 AI Content Generation

#### 6.2.1 Template-Based Generation

**Input:**
- Post type (single image, carousel, story, reel caption)
- Topic/theme (free text or from trending topics)
- Platform (Instagram, TikTok, Twitter, LinkedIn, Facebook)
- Quantity (1-30 posts)

**Output per post:**
- Caption (2,200 chars max for Instagram)
- Hashtags (30 max for Instagram)
- Best posting time recommendation
- Content type suggestion (image, video, carousel)
- Call-to-action recommendation

**Generation Logic:**
```
1. Load user's brand profile
2. Load trending topics in user's niche
3. Construct prompt: "Generate {quantity} {post_type} posts for {platform} about {topic} in {brand_voice} tone for {target_audience}"
4. Call AI API (Groq/Gemini)
5. Parse response into structured format
6. Store in database
7. Deduct credits (1 credit per post)
```

#### 6.2.2 Conversational Generation

**Chat Interface:**
- Real-time streaming responses
- Context window: last 10 messages
- Regenerate button per message
- Edit button to modify AI suggestions

**Commands:**
- "Generate 10 Instagram posts about sustainable fashion"
- "Make this more humorous"
- "Add a call-to-action for my website"
- "Create a carousel version of this post"

#### 6.2.3 Research-Driven Generation

**Process:**
1. AI scrapes trending content in user's niche (via web search API)
2. Analyzes top-performing posts (engagement rates, formats, topics)
3. Identifies content gaps and opportunities
4. Generates posts based on data insights

**Output includes:**
- Trend analysis summary
- Content recommendations
- Competitive positioning suggestions
- Performance predictions

### 6.3 Content Calendar

**View:**
- Monthly calendar grid
- List view option
- Filter by platform, status, content type

**Features:**
- Drag-and-drop to reschedule
- Bulk actions (delete, export, regenerate)
- Color-coded by platform
- Status indicators (draft, scheduled, published, failed)

**Post Statuses:**
| Status | Description |
|--------|-------------|
| Draft | Generated but not edited |
| Ready | Edited and approved |
| Scheduled | Set for future publishing |
| Published | Exported/published |
| Failed | Publishing failed (v2) |

### 6.4 Credits System

**Credit Packages:**

| Package | Credits | Price | Cost per Credit |
|---------|---------|-------|-----------------|
| Starter | 50 | $9.99 | $0.20 |
| Growth | 200 | $29.99 | $0.15 |
| Pro | 500 | $59.99 | $0.12 |
| Enterprise | 2000 | $149.99 | $0.075 |

**Credit Usage:**
| Action | Credits |
|--------|---------|
| Generate 1 post | 1 |
| Generate 30-day calendar | 15 |
| Regenerate post | 0.5 |
| Research-driven generation (per post) | 2 |
| Analytics report | 0.5 |

**Credit Rules:**
- Credits expire after 12 months
- Unused credits from lower tier roll up to higher tier
- Refund policy: Full refund within 24h of purchase if <10% used

### 6.5 Analytics Dashboard

**Metrics Displayed:**

| Metric | Source | Update Frequency |
|--------|--------|------------------|
| Likes | Platform API | Daily |
| Comments | Platform API | Daily |
| Shares | Platform API | Daily |
| Saves | Platform API | Daily |
| Reach | Platform API | Daily |
| Impressions | Platform API | Daily |
| Engagement Rate | Calculated | Daily |
| Best Performing Post | Calculated | Weekly |
| Audience Growth | Platform API | Weekly |

**Dashboard Views:**
1. **Overview**: Total metrics, trend lines, top posts
2. **By Platform**: Compare Instagram vs TikTok vs Twitter
3. **By Content Type**: Carousel vs single image vs video
4. **By Topic**: Which topics drive most engagement
5. **Recommendations**: AI-powered suggestions based on data

**Note (MVP):** Analytics will be manually input by user (paste screenshot or enter numbers) until direct integrations are built in v2.

### 6.6 Post Editor

**Features:**
- Rich text editor for captions
- Hashtag suggestions (AI-powered)
- Emoji picker
- Character count per platform
- Preview mode (shows how post will look)
- Version history (last 5 edits)

**Platform-Specific Rules:**
| Platform | Caption Limit | Hashtag Limit | Line Breaks |
|----------|---------------|---------------|-------------|
| Instagram | 2,200 | 30 | Yes |
| TikTok | 2,200 | 100 | Yes |
| Twitter | 280 | N/A | Yes |
| LinkedIn | 3,000 | 5 | Yes |
| Facebook | 63,206 | No limit | Yes |

### 6.7 Export Functionality

**Export Formats:**
- CSV (all posts in calendar)
- Text file (one post per block)
- Copy to clipboard (individual posts)
- JSON (for API integration, v2)

**Export Includes:**
- Caption
- Hashtags
- Platform
- Scheduled date/time
- Content type
- Notes (if added by user)

---

## 7. Data Model Sketch

### Entity Relationship Diagram

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│     users       │     │  brand_profiles  │     │    credits      │
├─────────────────┤     ├──────────────────┤     ├─────────────────┤
│ id (PK)         │────▶│ user_id (FK)     │     │ id (PK)         │
│ email           │     │ niche            │     │ user_id (FK)    │
│ username        │     │ target_audience  │     │ amount          │
│ full_name       │     │ brand_voice      │     │ type            │
│ avatar_url      │     │ tone_preferences │     │ description     │
│ created_at      │     │ content_goals    │     │ created_at      │
│ updated_at      │     │ posting_frequency│     └─────────────────┘
└─────────────────┘     │ example_posts    │
        │               │ created_at       │     ┌─────────────────┐
        │               └──────────────────┘     │ credit_balances │
        │                                        ├─────────────────┤
        │               ┌──────────────────┐     │ user_id (FK)    │
        │               │     posts        │     │ balance         │
        │               ├──────────────────┤     │ expires_at      │
        │               │ id (PK)          │     │ created_at      │
        │               │ user_id (FK)     │     └─────────────────┘
        │               │ calendar_id (FK) │
        │               │ title            │     ┌─────────────────┐
        │               │ content          │     │ credit_history  │
        │               │ platform         │     ├─────────────────┤
        │               │ content_type     │     │ id (PK)         │
        │               │ status           │     │ user_id (FK)    │
        │               │ hashtags         │     │ amount          │
        │               │ scheduled_at     │     │ type            │
        │               │ published_at     │     │ reference_id    │
        │               │ ai_generated     │     │ created_at      │
        │               │ brand_fingerprint│     └─────────────────┘
        │               │ created_at       │
        │               │ updated_at       │     ┌─────────────────┐
        │               └──────────────────┘     │ analytics       │
        │                                        ├─────────────────┤
        │               ┌──────────────────┐     │ id (PK)         │
        │               │content_calendars │     │ post_id (FK)    │
        │               ├──────────────────┤     │ platform        │
        └──────────────▶│ user_id (FK)     │     │ likes           │
                        │ month            │     │ comments        │
                        │ year             │     │ shares          │
                        │ generated_at     │     │ saves           │
                        └──────────────────┘     │ reach           │
                                                 │ impressions     │
                                                 │ fetched_at      │
                                                 │ created_at      │
                                                 └─────────────────┘
```

### Table Definitions

#### users (Supabase Auth)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### brand_profiles
```sql
CREATE TABLE brand_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  niche TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  brand_voice TEXT NOT NULL CHECK (brand_voice IN ('professional', 'casual', 'humorous', 'inspirational', 'educational')),
  tone_preferences TEXT[] NOT NULL,
  content_goals TEXT[] NOT NULL,
  posting_frequency TEXT NOT NULL,
  example_posts TEXT[],
  brand_fingerprint JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### content_calendars
```sql
CREATE TABLE content_calendars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);
```

#### posts
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  calendar_id UUID REFERENCES content_calendars(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'twitter', 'linkedin', 'facebook')),
  content_type TEXT NOT NULL DEFAULT 'post',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'scheduled', 'published', 'failed')),
  hashtags TEXT[],
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  ai_generated BOOLEAN DEFAULT TRUE,
  brand_fingerprint JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### credits
```sql
CREATE TABLE credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'refund', 'bonus')),
  description TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### credit_balances
```sql
CREATE TABLE credit_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  balance INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### analytics
```sql
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  shares INT DEFAULT 0,
  saves INT DEFAULT 0,
  reach INT DEFAULT 0,
  impressions INT DEFAULT 0,
  fetched_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. Edge Cases and Failure States

### Authentication

| Edge Case | Handling |
|-----------|----------|
| User signs up with email already in Supabase | Show "Email already registered" with sign-in link |
| Google OAuth fails mid-flow | Redirect to error page with retry button |
| Session expires while editing | Show modal: "Session expired, please sign in again" |
| User tries to access dashboard without auth | Redirect to /auth/signin |

### Content Generation

| Edge Case | Handling |
|-----------|----------|
| AI API timeout (>30s) | Show "Generation timed out, please try again" |
| AI returns inappropriate content | Filter output, show "Content couldn't be generated" |
| User has 0 credits | Show "Out of credits" with purchase prompt |
| User generates 30 posts but only has 15 credits | Block generation, show "Need X more credits" |
| AI generates duplicate content | Warn user, offer to regenerate |
| Platform character limit exceeded | Auto-truncate with warning, suggest edits |

### Credits

| Edge Case | Handling |
|-----------|----------|
| Payment fails (card declined) | Show "Payment failed, try another method" |
| Credit expiration approaching | Email reminder 7 days before expiry |
| User requests refund after 24h | Deny with policy explanation |
| Credits used > purchased (race condition) | Lock credit deduction, use database transaction |

### Analytics

| Edge Case | Handling |
|-----------|----------|
| Platform API rate limited | Queue fetch, retry after delay |
| User manually enters wrong data | Validate numbers are positive integers |
| Analytics for deleted post | Show "Post no longer exists" |

### Data

| Edge Case | Handling |
|-----------|----------|
| Database connection lost | Show "Service temporarily unavailable" |
| User deletes account | Soft delete for 30 days, then hard delete |
| Concurrent edits to same post | Last-write-wins with conflict warning |

---

## 9. Success Metrics

### Primary Metrics (North Star)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Paying Users** | 10 within 60 days | Credit purchases |
| **MRR** | $500 by Day 60 | Revenue dashboard |
| **Credits Consumed** | 1,000 total by Day 60 | Credit usage logs |

### Secondary Metrics

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Sign-up → First Generation | 70% | Onboarding effectiveness |
| Credits Consumed / User / Month | >20 | Product stickiness |
| DAU/MAU Ratio | >30% | Engagement depth |
| NPS Score | >50 | Word-of-mouth potential |
| Support Tickets / User | <0.1 | Product quality |

### Guardrail Metrics

| Metric | Threshold | Action if Exceeded |
|--------|-----------|-------------------|
| Churn Rate | >15%/mo | Investigate onboarding, survey churned users |
| Support Tickets | >50/week | Pause new features, fix stability |
| AI Generation Errors | >5% | Check API limits, add fallbacks |
| Credit Refund Rate | >10% | Review pricing, quality issues |

---

## 10. Open Questions

### Technical

| Question | Options | Impact |
|----------|---------|--------|
| Which AI API for generation? | Groq (free), Gemini (free tier), Claude Haiku ($$) | Cost, quality, speed tradeoffs |
| How to handle analytics without direct integrations? | Manual input, browser extension, screenshot OCR | User experience, accuracy |
| Should we support video content generation? | Yes (v2), No (simplify MVP) | Scope creep risk |

### Business

| Question | Options | Impact |
|----------|---------|--------|
| Should we offer a free tier? | Yes (10 credits/mo), No (paid only) | Acquisition funnel, unit economics |
| How to handle credit expiration fairness? | 12mo, 6mo, no expiry | Revenue recognition, user trust |
| Should agencies get volume discounts? | Yes, No | Market segment capture |

### Product

| Question | Options | Impact |
|----------|---------|--------|
| How many example posts needed for brand fingerprint? | 3, 5, 10 | Onboarding friction vs quality |
| Should we show AI confidence scores? | Yes, No | User trust, perceived quality |
| How to handle platform algorithm changes? | Dynamic prompts, manual updates | Maintenance burden |

---

## Appendix: Technical Stack (Current)

| Layer | Technology | Status |
|-------|------------|--------|
| Frontend | Next.js 16 + Tailwind | ✅ Built |
| Backend | Next.js API Routes | ✅ Built |
| Database | Supabase (PostgreSQL) | ✅ Connected |
| Auth | Supabase Auth + Google OAuth | ✅ Working |
| Hosting | Vercel | ✅ Deployed |
| Domain | theauctus.in | ✅ Active |
| AI API | TBD | ❌ Not integrated |
| Payments | TBD | ❌ Not integrated |

---

## Appendix: Competitive Analysis

| Competitor | Strength | Weakness | Our Advantage |
|------------|----------|----------|---------------|
| Hootsuite | Scheduling, analytics | No AI generation | AI + analytics combined |
| Jasper | AI generation quality | No analytics, expensive ($49+) | Credits-based pricing |
| Buffer | Simple UX | Limited features | All-in-one solution |
| Later | Visual planning | No AI generation | AI-powered content creation |
| Canva | Design templates | No content strategy | Strategic content planning |

---

**Next Steps:**
1. Review PRD with stakeholders
2. Finalize open questions
3. Create technical specification
4. Build MVP feature by feature
5. Launch beta with 10 test users
6. Iterate based on feedback

---

*Document generated by TheAuctus Product Team*
*Last updated: August 24, 2026*
