# GoFundMe Clone — AI-Accelerated Fundraising Platform

A full-stack GoFundMe-style web app built with **Next.js 14**, **Tailwind CSS**, and **TypeScript**. Features 3 interconnected pages (Fundraiser, Community, Profile) with AI-powered features and comprehensive business metrics instrumentation.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000)

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Featured fundraisers, communities, metrics explanation |
| Fundraiser | `/fundraiser/fundraiser-1` | Campaign page with donate flow, AI features |
| Community | `/community/community-1` | Community hub with leaderboard, activity feed |
| Profile | `/profile/user-1` | User profile with highlights, activity |

All pages are interconnected — click any organizer name, community badge, or fundraiser card to navigate between them.

## AI Features

| Feature | Location | What It Does |
|---------|----------|--------------|
| **AI Story Enhancement** | Fundraiser page | Generates more compelling campaign descriptions with simulated AI |
| **Smart Donation Suggestions** | Donate modal | AI-computed suggested amounts based on goal, average donation, and remaining need |
| **Campaign Health Score** | Fundraiser page | Scores campaigns 0-100 with letter grade and actionable improvement recommendations |
| **Trending Detection** | Fundraiser page | Identifies viral campaigns using donation velocity, clustering, and goal proximity |
| **Impact Calculator** | Donate modal | Shows "Your $25 provides X" context based on fundraiser category |
| **Similar Causes** | Fundraiser page | Recommends related fundraisers by category matching |

## Metrics & Instrumentation

Click the **📊 button** in the bottom-right corner on any page to open the live business metrics dashboard.

### Business Metrics (why they matter)

- **DAU / MAU** — Daily/monthly active users and stickiness ratio. Measures platform growth and user retention.
- **Session Analytics** — Duration, pages/session, bounce rate. Reveals engagement quality.
- **Conversion Funnel** — Visitor → Donate Click → Modal → Amount Select → Submit. Identifies exactly where donors drop off.
- **Revenue Metrics** — Total revenue, avg donation, revenue per visitor, donation velocity ($/hr).
- **Retention (D1/D7/D30)** — Cohort retention rates. Critical for sustainable growth.
- **Fundraiser Performance** — Avg completion rate, success rate, time to fund.

### Engagement Metrics

- **Scroll Depth** — How far users read. Optimizes story length and CTA placement.
- **Time on Page** — Measures content engagement.
- **Feature Adoption** — % of sessions using AI features, sharing, or following.
- **Social Proof** — Live viewer counts and donation toast notifications.

### Performance (Core Web Vitals)

- **LCP** — Largest Contentful Paint (target: <2.5s)
- **FID** — First Input Delay (target: <100ms)
- **CLS** — Cumulative Layout Shift (target: <0.1)
- **TTFB** — Time to First Byte
- **Page Load** — Full page load time

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Data**: Rich mock data (10 users, 5 fundraisers, 2 communities, 28 donations, 20 activity items)
- **Images**: picsum.photos with seeded URLs

## Project Structure

```
src/
├── app/                    # Next.js pages
│   ├── fundraiser/[id]/    # Fundraiser page
│   ├── community/[id]/     # Community page
│   └── profile/[id]/       # Profile page
├── components/
│   ├── analytics/          # Business metrics dashboard
│   ├── fundraiser/         # Fundraiser page components
│   ├── community/          # Community page components
│   ├── profile/            # Profile page components
│   ├── shared/             # Reusable components
│   └── layout/             # Navbar, Footer
├── data/                   # Mock data + TypeScript types
├── lib/                    # Analytics, AI, metrics, utilities
└── hooks/                  # Custom React hooks
```

## Build

```bash
npm run build    # Production build (zero TypeScript errors)
npm start        # Start production server
```
