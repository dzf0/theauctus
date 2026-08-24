# TheAuctus — Design Brief

**Version:** 1.0  
**Date:** August 24, 2026  
**Author:** Product Design  
**Status:** Final

---

## 1. Design Principles

### Principle 1: Clarity Over Cleverness

**Rule:** Every interface element must communicate its purpose within 2 seconds.

**Justification:** Creators are busy. They're switching between managing their business and creating content. If they can't find what they need instantly, they'll abandon the tool.

**Implementation:**
- Labels always visible (no icon-only buttons)
- Primary actions always highlighted (one clear CTA per screen)
- No ambiguous icons — every icon has a text label nearby
- Error messages explain what went wrong AND how to fix it

**Examples:**
- ✅ "Generate 30 posts" button with sparkle icon + text
- ❌ Floating action button with unclear icon

---

### Principle 2: Progressive Disclosure

**Rule:** Show only what's needed at each step. Hide advanced options until requested.

**Justification:** AI content generation has many variables (niche, tone, platform, format, timing). Showing all options at once overwhelms users. Reveal complexity as users become proficient.

**Implementation:**
- Start with minimal input (niche + platform)
- Advanced options (tone, hashtags, posting time) available via "Advanced" toggle
- Onboarding collects only essential info (5 fields max)
- Dashboard shows summary first, details on click

**Examples:**
- ✅ Basic mode: "Generate posts about [topic]" → Done
- ✅ Advanced mode: Add tone, platform, format, hashtags, CTA
- ❌ Showing all 15 generation options on first use

---

### Principle 3: Confidence Through Feedback

**Rule:** Users must always know what's happening and what happened.

**Justification:** AI generation feels like a black box. Users need reassurance that the system is working and that their inputs produced the expected output.

**Implementation:**
- Loading states for every async operation (progress bars, not spinners)
- Success confirmations with undo options
- Clear error recovery paths
- Visual diff when content is regenerated

**Examples:**
- ✅ "Generating 30 posts... 12/30 complete" with progress bar
- ✅ "5 posts generated! Review them in your calendar."
- ❌ Spinner that disappears without explanation

---

## 2. Visual Direction

### Mood

**Editorial Luxury meets Tech Utility**

Think: A high-end magazine's digital presence + the precision of a premium SaaS tool. TheAuctus should feel like a tool for professionals who value quality — not a playful consumer app.

**Keywords:** Sophisticated, Authoritative, Calm, Precise, Premium

### References

| Reference | What to Take | What to Avoid |
|-----------|--------------|---------------|
| **Stripe Dashboard** | Clean data presentation, subtle gradients, precise spacing | Overly technical jargon |
| **Linear** | Minimal chrome, keyboard-first, fast interactions | Cold/impersonal feel |
| **Notion** | Progressive disclosure, contextual menus | Overwhelming feature density |
| **Apple Developer** | Typography hierarchy, generous whitespace | Sterile/clinical aesthetic |
| **Condé Nast Digital** | Editorial typography, confident headlines | Slow/artsy pacing |

### What to Avoid

| Anti-Pattern | Why | Alternative |
|--------------|-----|-------------|
| Gradient overload | Looks dated, reduces readability | Subtle gradients on key elements only |
| Neon colors | Signals "crypto/scam" to creators | Muted copper/earth tones |
| Rounded everything | Looks juvenile, reduces trust | Strategic rounding (cards only) |
| Dark mode only | Excludes users who prefer light | Offer both, default to system preference |
| Animated everything | Distracts from content | Purposeful animation only (transitions, progress) |

---

## 3. Design Tokens

### Color Palette

#### Primary Colors

| Token | Hex | Usage | Justification |
|-------|-----|-------|---------------|
| `--color-primary` | `#C9A87C` | CTAs, accents, active states | Copper/gold signals premium quality without being gaudy. Works on both light and dark backgrounds. |
| `--color-primary-hover` | `#B8956A` | Hover states | 10% darker for clear feedback |
| `--color-primary-light` | `#C9A87C15` | Backgrounds, subtle highlights | 10% opacity for tinted backgrounds |

#### Neutral Colors

| Token | Hex | Usage | Justification |
|-------|-----|-------|---------------|
| `--color-bg-primary` | `#0F0F0F` | App background (dark mode) | Near-black reduces eye strain for long sessions |
| `--color-bg-secondary` | `#1A1A1A` | Cards, sidebars | Subtle elevation without harsh contrast |
| `--color-bg-tertiary` | `#252525` | Hover states, inputs | Interactive surface feedback |
| `--color-border` | `#2A2A2A` | Dividers, borders | Visible but not distracting |
| `--color-border-subtle` | `#1F1F1F` | Subtle dividers | For less important separations |

#### Text Colors

| Token | Hex | Usage | Justification |
|-------|-----|-------|---------------|
| `--color-text-primary` | `#F5F0EB` | Headlines, primary content | Warm white (not pure white) reduces eye strain |
| `--color-text-secondary` | `#9A9590` | Descriptions, labels | Muted for hierarchy, still readable |
| `--color-text-tertiary` | `#6B6560` | Timestamps, meta | Low emphasis, still accessible |
| `--color-text-inverse` | `#0F0F0F` | Text on primary color buttons | Ensures readability on copper buttons |

#### Semantic Colors

| Token | Hex | Usage | Justification |
|-------|-----|-------|---------------|
| `--color-success` | `#7CB87C` | Success states, active indicators | Green signals positive without being neon |
| `--color-warning` | `#E5C07B` | Warnings, pending states | Amber for caution without alarm |
| `--color-error` | `#E06C75` | Errors, destructive actions | Muted red, not aggressive |
| `--color-info` | `#61AFEF` | Information, links | Blue for neutral information |

#### Light Mode Overrides

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg-primary` | `#FAFAF8` | Warm off-white background |
| `--color-bg-secondary` | `#FFFFFF` | Cards, surfaces |
| `--color-text-primary` | `#1A1A1A` | Near-black text |
| `--color-text-secondary` | `#6B6560` | Muted text |

### Type Scale

| Token | Size | Weight | Line Height | Usage | Justification |
|-------|------|--------|-------------|-------|---------------|
| `--text-display` | 48px | 700 | 1.1 | Hero headlines | Command attention, editorial feel |
| `--text-h1` | 36px | 700 | 1.2 | Page titles | Clear hierarchy |
| `--text-h2` | 28px | 600 | 1.3 | Section headers | Group content logically |
| `--text-h3` | 20px | 600 | 1.4 | Card titles | Scannable headings |
| `--text-body` | 14px | 400 | 1.6 | Body text | Optimized for reading |
| `--text-body-sm` | 13px | 400 | 1.5 | Secondary text | Compact information |
| `--text-caption` | 11px | 500 | 1.4 | Labels, metadata | Uppercase, tracking +0.1em |
| `--text-micro` | 10px | 500 | 1.3 | Badges, timestamps | Minimum readable size |

**Font Family:**
- **Headlines:** `Playfair Display` (serif) — Editorial authority, premium feel
- **Body:** `Inter` (sans-serif) — Maximum readability, neutral tone
- **Code/Data:** `JetBrains Mono` (monospace) — Technical precision

**Justification:** Serif headlines signal authority and editorial quality (like Vogue, Harper's Bazaar). Sans-serif body ensures readability for long-form content generation. This contrast creates visual interest while maintaining professionalism.

### Spacing Scale

| Token | Value | Usage | Justification |
|-------|-------|-------|---------------|
| `--space-1` | 4px | Tight spacing (icon gaps) | Minimum touch target padding |
| `--space-2` | 8px | Compact groups | Related items proximity |
| `--space-3` | 12px | Default spacing | Balanced breathing room |
| `--space-4` | 16px | Standard padding | Comfortable touch targets |
| `--space-5` | 20px | Section padding | Clear visual separation |
| `--space-6` | 24px | Card padding | Internal card spacing |
| `--space-8` | 32px | Section gaps | Major content blocks |
| `--space-10` | 40px | Page padding | Desktop margins |
| `--space-12` | 48px | Hero spacing | Dramatic breathing room |
| `--space-16` | 64px | Section dividers | Maximum whitespace |

### Border Radius

| Token | Value | Usage | Justification |
|-------|-------|-------|---------------|
| `--radius-sm` | 4px | Buttons, inputs | Subtle rounding, professional |
| `--radius-md` | 8px | Cards, modals | Friendly but not childish |
| `--radius-lg` | 12px | Large cards, panels | Container distinction |
| `--radius-xl` | 16px | Feature highlights | Attention-grabbing elements |
| `--radius-full` | 9999px | Avatars, badges | Perfect circles |

### Shadows

| Token | Value | Usage | Justification |
|-------|-------|-------|---------------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.3)` | Subtle elevation | Minimal lift for cards |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.4)` | Dropdowns, popovers | Clear separation from background |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.5)` | Modals, dialogs | Strong focal point |
| `--shadow-glow` | `0 0 20px rgba(201,168,124,0.2)` | Primary CTAs | Subtle copper glow for emphasis |

---

## 4. Screen Inventory

### Public Screens

| Screen | Purpose | Priority |
|--------|---------|----------|
| Landing Page | Convert visitors to signups | P0 |
| Sign Up | Create new account | P0 |
| Sign In | Authenticate existing users | P0 |
| Verify OTP | Email verification | P0 |
| Forgot Password | Password reset | P1 |
| Pricing | Show plans and pricing | P1 |
| About | Company information | P2 |

### Onboarding Screens

| Screen | Purpose | Priority |
|--------|---------|----------|
| Onboarding Step 1 | Collect niche/industry | P0 |
| Onboarding Step 2 | Collect brand voice + tone | P0 |
| Onboarding Step 3 | Collect target audience | P0 |
| Onboarding Step 4 | Collect content goals | P0 |
| Onboarding Step 5 | Collect posting frequency | P0 |

### Dashboard Screens

| Screen | Purpose | Priority |
|--------|---------|----------|
| Dashboard Overview | Summary of activity and metrics | P0 |
| Content Planner | Generate and manage content calendar | P0 |
| Content Queue | View scheduled/published posts | P0 |
| Analytics | Track performance metrics | P1 |
| Billing | Manage credits and purchases | P1 |
| Settings | Account and profile settings | P1 |

### Modal/Overlay Screens

| Screen | Purpose | Priority |
|--------|---------|----------|
| Generate Content | AI content generation interface | P0 |
| Edit Post | Modify generated content | P0 |
| View Post | Preview post details | P0 |
| Purchase Credits | Stripe checkout flow | P1 |
| Confirm Delete | Destructive action confirmation | P1 |

---

## 5. User Flows

### Flow 1: New User Onboarding

```
1. User lands on homepage
2. Clicks "Get Started — It's Free →"
3. Redirected to /auth/signup
4. Fills email, username, full name, password
5. Clicks "Create Account"
6. Redirected to /auth/verify-otp
7. Enters 6-digit code from email
8. Redirected to /onboarding
9. Completes 5-step brand profile setup
10. Redirected to /dashboard
11. Sees empty state with CTA to generate first content
```

**Decision Points:**
- Step 9: User can click "Skip for now" → goes to dashboard with empty profile
- Step 7: User can click "Resend code" after 60s cooldown

### Flow 2: Generate Content

```
1. User clicks "Generate Content" on dashboard
2. Modal opens with generation form
3. User enters:
   - Topic (required)
   - Platform (required, multi-select)
   - Number of posts (1-30)
   - Tone (optional, from brand profile)
4. User clicks "Generate"
5. Loading state shows progress
6. Posts appear in calendar view
7. User can edit, regenerate, or export each post
```

**Decision Points:**
- Step 3: User can toggle "Advanced options" for more control
- Step 6: User can click "Regenerate" to get new variations

### Flow 3: Purchase Credits

```
1. User clicks "Buy Credits" or hits credit limit
2. Modal shows credit packages
3. User selects package
4. Redirected to Stripe Checkout
5. Enters payment info
6. Completes purchase
7. Redirected back to app
8. Credits added to balance
9. Success notification shown
```

**Decision Points:**
- Step 2: User can compare packages before selecting
- Step 4: User can cancel and return to app

### Flow 4: View Analytics

```
1. User clicks "Analytics" in sidebar
2. Dashboard loads with date range selector
3. Shows summary metrics (top cards)
4. Shows engagement chart (line graph)
5. Shows top performing posts (list)
6. User can filter by platform, date range
7. User can click post to see details
```

**Decision Points:**
- Step 2: User can change date range (7d, 30d, 90d, custom)
- Step 6: User can toggle between platforms

---

## 6. Per-Screen Layout

### Dashboard Overview

```
┌─────────────────────────────────────────────────────────────┐
│ [Sidebar]  │  [Main Content]                                │
│            │                                                │
│ Logo       │  [Header]                                      │
│            │  Page Title          [Search] [Notifications]   │
│ Nav Items  │                                                │
│ - Dashboard│  [Summary Cards Row]                           │
│ - Planner  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐         │
│ - Queue    │  │Credit│ │Posts │ │Engage│ │Follwr│         │
│ - Analytics│  │Balance│ │This │ │Rate  │ │Growth│         │
│ - Billing  │  │  42  │ │Week │ │ 4.2% │ │ +127 │         │
│ - Settings │  └──────┘ └──────┘ └──────┘ └──────┘         │
│            │                                                │
│            │  [Two Column Layout]                           │
│            │  ┌─────────────────┐ ┌─────────────────┐      │
│            │  │ Content Calendar│ │ Recent Posts    │      │
│            │  │ [Mini Calendar] │ │ [Post List]     │      │
│            │  │                 │ │                 │      │
│            │  │                 │ │                 │      │
│            │  └─────────────────┘ └─────────────────┘      │
│            │                                                │
│ Plan Badge │  [Quick Actions Bar]                           │
│ Sign Out   │  [Generate Content] [View Calendar] [Export]  │
└─────────────────────────────────────────────────────────────┘
```

**Hierarchy:**
1. Summary cards (immediate insight)
2. Content calendar (what's coming)
3. Recent posts (what just happened)
4. Quick actions (what to do next)

**Primary Action:** "Generate Content" button (copper, prominent)

### Content Planner

```
┌─────────────────────────────────────────────────────────────┐
│ [Sidebar]  │  [Main Content]                                │
│            │                                                │
│            │  [Header]                                      │
│            │  Content Planner    [Generate] [Export] [Filter]│
│            │                                                │
│            │  [Calendar View Toggle]                        │
│            │  [Calendar | List]                             │
│            │                                                │
│            │  [Calendar Grid]                               │
│            │  ┌────┬────┬────┬────┬────┬────┬────┐         │
│            │  │Mon │Tue │Wed │Thu │Fri │Sat │Sun │         │
│            │  ├────┼────┼────┼────┼────┼────┼────┤         │
│            │  │    │ 📝 │    │ 📝 │    │    │    │         │
│            │  │    │Post│    │Post│    │    │    │         │
│            │  └────┴────┴────┴────┴────┴────┴────┘         │
│            │                                                │
│            │  [Selected Post Panel]                         │
│            │  ┌─────────────────────────────────────────┐   │
│            │  │ Post Content Preview                    │   │
│            │  │ [Caption] [Hashtags] [Platform]         │   │
│            │  │                                         │   │
│            │  │ [Edit] [Regenerate] [Delete] [Export]  │   │
│            │  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Primary Action:** "Generate" button (opens generation modal)

### Generate Content Modal

```
┌─────────────────────────────────────────────────────────────┐
│  Generate Content                                    [X]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  What do you want to create content about?                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ e.g., "Sustainable fashion tips for Gen Z"         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Platforms                                                  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐           │
│  │Insta │ │TikTok│ │Twitter│ │Linked│ │Facebook│         │
│  │  ✓   │ │      │ │      │ │  ✓   │ │       │          │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘           │
│                                                             │
│  Number of posts                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 10 posts                                   [slider] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Advanced Options ▼]                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Tone: [Professional ▼]  Format: [Post ▼]           │   │
│  │ Include hashtags: [✓]   Best time: [✓]             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Credits needed: 10  │  Your balance: 42                   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Generate 10 Posts                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Primary Action:** "Generate X Posts" button (disabled until valid input)

---

## 7. Component Library

### Buttons

| Variant | Usage | States |
|---------|-------|--------|
| `btn-primary` | Main CTAs | Default, Hover, Active, Disabled, Loading |
| `btn-secondary` | Secondary actions | Default, Hover, Active, Disabled |
| `btn-ghost` | Tertiary actions | Default, Hover, Active, Disabled |
| `btn-danger` | Destructive actions | Default, Hover, Active, Disabled |
| `btn-icon` | Icon-only buttons | Default, Hover, Active, Disabled |

**Specifications:**
- Height: 40px (default), 36px (compact), 48px (large)
- Padding: 0 16px (default), 0 12px (compact), 0 24px (large)
- Border radius: 4px
- Font: 13px, 500 weight
- Transition: 150ms ease

### Inputs

| Variant | Usage | States |
|---------|-------|--------|
| `input-text` | Single line text | Default, Focus, Error, Disabled |
| `input-textarea` | Multi-line text | Default, Focus, Error, Disabled |
| `input-select` | Dropdown selection | Default, Focus, Open, Disabled |
| `input-search` | Search with icon | Default, Focus, Loading |

**Specifications:**
- Height: 40px
- Padding: 0 12px
- Border: 1px solid `--color-border`
- Border radius: 4px
- Font: 13px, 400 weight
- Focus ring: 2px solid `--color-primary` with 2px offset

### Cards

| Variant | Usage | States |
|---------|-------|--------|
| `card-default` | General content | Default, Hover |
| `card-interactive` | Clickable content | Default, Hover, Active |
| `card-selected` | Selected items | Default, Selected |
| `card-stat` | Metric display | Default |

**Specifications:**
- Background: `--color-bg-secondary`
- Border: 1px solid `--color-border`
- Border radius: 8px
- Padding: 16px
- Shadow: `--shadow-sm`

### Navigation

| Component | Usage | States |
|-----------|-------|--------|
| `nav-sidebar` | Main navigation | Default, Active, Hover |
| `nav-topbar` | Top navigation | Default |
| `nav-breadcrumb` | Path navigation | Default |

**Specifications:**
- Sidebar width: 224px
- Item height: 36px
- Icon size: 16px
- Font: 12px, 400 weight
- Active indicator: Left border + background tint

### Modals

| Variant | Usage | States |
|---------|-------|--------|
| `modal-default` | Standard dialogs | Closed, Open |
| `modal-fullscreen` | Full-page actions | Closed, Open |
| `modal-drawer` | Side panels | Closed, Open (left/right) |

**Specifications:**
- Overlay: Black 70% opacity
- Border radius: 12px
- Max width: 480px (default), 640px (large), 100% (fullscreen)
- Animation: 200ms ease-out
- Focus trap: First interactive element

### Badges

| Variant | Usage | States |
|---------|-------|--------|
| `badge-default` | Neutral labels | Default |
| `badge-primary` | Accent labels | Default |
| `badge-success` | Positive states | Default |
| `badge-warning` | Caution states | Default |
| `badge-error` | Negative states | Default |

**Specifications:**
- Height: 20px
- Padding: 0 8px
- Border radius: 9999px
- Font: 10px, 500 weight, uppercase

### Toast Notifications

| Variant | Usage | States |
|---------|-------|--------|
| `toast-success` | Success messages | Visible, Dismissing |
| `toast-error` | Error messages | Visible, Dismissing |
| `toast-info` | Information | Visible, Dismissing |

**Specifications:**
- Position: Bottom-right
- Width: 320px
- Auto-dismiss: 5 seconds (success), 8 seconds (error)
- Animation: Slide in from right

---

## 8. States

### Empty States

| Screen | Empty State | CTA |
|--------|-------------|-----|
| Dashboard | "Welcome! Generate your first content." | "Generate Content" |
| Content Planner | "No posts scheduled yet." | "Create Your First Post" |
| Content Queue | "Queue is empty." | "Add Posts" |
| Analytics | "No data yet. Start posting to see analytics." | "View Planner" |
| Credits | "You have 10 free credits." | "Start Generating" |

**Design:**
- Centered illustration (simple line art)
- Headline: 20px, 600 weight
- Description: 14px, 400 weight, `--color-text-secondary`
- CTA: Primary button

### Loading States

| Screen | Loading State |
|--------|---------------|
| Dashboard | Skeleton cards with pulsing animation |
| Content Planner | Skeleton calendar grid |
| Generate Content | Progress bar with percentage |
| Analytics | Skeleton charts and cards |
| Credits | Skeleton balance display |

**Design:**
- Skeleton color: `--color-bg-tertiary`
- Animation: 1.5s ease-in-out infinite pulse
- Opacity: 50% → 100% → 50%

### Error States

| Screen | Error State | Recovery |
|--------|-------------|----------|
| Dashboard | "Failed to load data." | [Retry] |
| Content Planner | "Could not load calendar." | [Retry] |
| Generate Content | "Generation failed. Please try again." | [Retry] [Cancel] |
| Analytics | "Could not fetch analytics." | [Retry] |
| Credits | "Payment failed." | [Try Again] [Contact Support] |

**Design:**
- Icon: Alert circle (16px, `--color-error`)
- Headline: 14px, 500 weight
- Description: 13px, `--color-text-secondary`
- Actions: Ghost buttons

### Success States

| Screen | Success State |
|--------|---------------|
| Generate Content | "10 posts generated successfully!" |
| Purchase Credits | "50 credits added to your balance." |
| Save Settings | "Settings saved." |
| Export | "Content exported to clipboard." |

**Design:**
- Icon: Check circle (16px, `--color-success`)
- Toast notification (auto-dismiss)
- Optional: Confetti animation for major milestones

### Offline State

| Screen | Offline State |
|--------|---------------|
| All screens | "You're offline. Some features may be limited." |

**Design:**
- Banner at top: `--color-warning` background
- Icon: Wifi off (16px)
- Auto-dismiss when online

---

## 9. Responsive Behaviour

### Mobile (< 640px)

| Element | Behavior |
|---------|----------|
| Sidebar | Hidden, hamburger menu toggle |
| Navigation | Bottom tab bar |
| Cards | Full width, stacked vertically |
| Modals | Fullscreen |
| Tables | Card layout |
| Calendar | List view (no grid) |

**Layout:**
- Single column
- 16px padding
- Touch targets: 44px minimum

### Tablet (640px - 1024px)

| Element | Behavior |
|---------|----------|
| Sidebar | Collapsible, icons only |
| Navigation | Top bar + sidebar |
| Cards | 2-column grid |
| Modals | Centered, 90% width |
| Tables | Responsive table |
| Calendar | Compact grid |

**Layout:**
- Two columns
- 24px padding
- Sidebar: 64px collapsed

### Desktop (> 1024px)

| Element | Behavior |
|---------|----------|
| Sidebar | Fixed, full width (224px) |
| Navigation | Top bar + sidebar |
| Cards | 3-4 column grid |
| Modals | Centered, 480px max |
| Tables | Full table |
| Calendar | Full grid |

**Layout:**
- Multi-column
- 32px padding
- Max content width: 1200px

---

## 10. Accessibility

### Contrast Ratios

| Element | Foreground | Background | Ratio | WCAG |
|---------|------------|------------|-------|------|
| Primary text | `#F5F0EB` | `#0F0F0F` | 15.8:1 | AAA ✅ |
| Secondary text | `#9A9590` | `#0F0F0F` | 6.2:1 | AA ✅ |
| Tertiary text | `#6B6560` | `#0F0F0F` | 3.8:1 | AA (large) ✅ |
| Primary button | `#0F0F0F` | `#C9A87C` | 7.4:1 | AAA ✅ |
| Error text | `#E06C75` | `#0F0F0F` | 5.1:1 | AA ✅ |
| Success text | `#7CB87C` | `#0F0F0F` | 6.8:1 | AA ✅ |

### Focus Order

1. Skip to main content link
2. Logo → Home
3. Primary navigation items
4. Main content area
5. Primary action buttons
6. Secondary actions
7. Footer links

**Focus Indicator:**
- 2px solid `--color-primary`
- 2px offset
- Visible on all interactive elements

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move to next interactive element |
| `Shift+Tab` | Move to previous element |
| `Enter` | Activate button/link |
| `Space` | Toggle checkbox/button |
| `Escape` | Close modal/dropdown |
| `Arrow keys` | Navigate within groups |
| `Home/End` | Jump to first/last item |

### ARIA Requirements

| Component | ARIA Role | Properties |
|-----------|-----------|------------|
| Sidebar | `navigation` | `aria-label="Main navigation"` |
| Modal | `dialog` | `aria-modal="true"`, `aria-labelledby` |
| Button | `button` | `aria-label` if icon-only |
| Input | `textbox` | `aria-describedby` for errors |
| Toast | `alert` | `aria-live="polite"` |
| Progress | `progressbar` | `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| Tab | `tab` | `aria-selected`, `aria-controls` |
| Calendar | `grid` | `aria-label` for dates |

### Screen Reader Announcements

| Action | Announcement |
|--------|--------------|
| Page load | "Page title loaded" |
| Modal open | "Dialog opened: [title]" |
| Form error | "Error: [message]" |
| Success action | "Success: [message]" |
| Loading start | "Loading [content]" |
| Loading complete | "[Content] loaded" |

---

## Appendix: Design Decisions Log

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Copper primary color | Signals premium quality, warmth, creativity | Blue (too corporate), Purple (too playful) |
| Serif headlines | Editorial authority, magazine feel | Sans-serif (too generic), Slab serif (too heavy) |
| Dark mode default | Reduces eye strain for creators working late | Light mode (less modern), Both (complexity) |
| 4px border radius | Professional, not childish | 0px (too sharp), 8px (too soft), 16px (too playful) |
| 14px body text | Optimal readability for long sessions | 12px (too small), 16px (too large) |
| Progressive disclosure | Reduces cognitive load | All options visible (overwhelming) |
| Single CTA per screen | Clear user direction | Multiple CTAs (confusing) |

---

*Design Brief completed. Ready for implementation.*
