# GoFundMe Clone — AI-Accelerated Fundraising Platform

A full-stack GoFundMe-style web app built with **Next.js 14**, **Tailwind CSS**, and **TypeScript**. Features 3 interconnected pages (Fundraiser, Community, Profile) with AI-powered features and comprehensive business metrics instrumentation.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

Open `.env.local` and add your [OpenRouter API key](https://openrouter.ai/keys) (free tier available):

```
NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

Then start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

> **Note:** The app works without an API key — AI features (persuasion engine, story enhancement) will just be disabled.

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

## Feed Algorithm Walkthrough

This is a **TikTok-style persuasion engine** that learns what you like as you scroll and progressively narrows your feed. Here's how it works step by step:

### 1. Session State

Every time you open the discover feed, a fresh session starts tracking:

- **Items viewed** — how many cards you've seen
- **Scroll intervals** — time between each swipe (are you speed-swiping or reading?)
- **Category hits** — how many times you've seen each category
- **Action counts** — likes, saves, shares, donate clicks per category
- **Shown IDs** — what you've already seen (so it doesn't repeat)

### 2. Momentum (how "hot" are you?)

Every time you scroll, it calculates a momentum score (0-1) using an **exponential moving average** of three signals:

- **Scroll speed** (40%) — swiping fast = 0.2 (bored), 1-3 seconds per card = 0.85 (reading), 3-8 seconds = 1.0 (deeply engaged), 8+ seconds = 0.3 (probably went to get coffee)
- **Action density** (40%) — (likes + saves + shares + donates) / items viewed. More actions = more engaged
- **Dwell bonus** (20%) — how long you stayed on the last card

The EMA smooths it: `momentum = old * 0.7 + new * 0.3`. So it doesn't spike from one long pause — it builds gradually.

### 3. Exploit Ratio (explore vs rabbit hole)

A **sigmoid curve** that transitions from "show variety" to "show more of what they like":

- ~5 interactions → 0.08 (exploring, diverse feed)
- ~15 interactions → 0.50 (balanced)
- ~25 interactions → 0.92 (deep rabbit hole — mostly their favorite category)

Each action type has a weight: views = 0.2, likes = 1.5, saves = 2.0, donate clicks = 4.0. So one donate click moves the ratio more than 20 views.

**Key twist**: if momentum drops below 0.3 (user is cooling off), the ratio gets damped by 40% — the feed re-diversifies to try to re-hook you.

### 4. Engagement Compounding

If you **like + save + share** the same category, the weight compounds exponentially:

```
1 action type → 1x weight
2 types → 1.3x
3 types → 1.69x
4 types → 2.2x
```

So just viewing animals = 1x. Viewing + liking + saving animals = 1.69x. This is how the feed detects strong interest vs passive browsing.

### 5. Category Adjacency (spillover)

Engagement in one category spills into related ones:

- **Medical → Emergency** (70% spillover) + Community (30%)
- **Animals → Environment** (70%) + Community (30%)
- **Education → Community** (70%) + Sports (30%)

So if you spend a lot of time on animal rescue fundraisers, you'll start seeing more environment campaigns too — even if you never explicitly engaged with them.

### 6. Adaptive Weights

The "For You" tab has 5 scoring signals. Their weights shift based on your session state:

| Signal | Base Weight | High Exploit | Low Momentum |
|--------|-----------|-------------|-------------|
| Interest | 35% | +20% | -12% |
| Social | 20% | same | same |
| Trending | 20% | same | +10% |
| Diversity | 10% | -8% | +8% |
| Freshness | 15% | -5% | same |

So when you're deep in a rabbit hole (high exploit), interest weight dominates and diversity shrinks. When you're bored (low momentum), trending and diversity increase to try new hooks.

### 7. Adaptive Diversity

Prevents the feed from becoming 100% one category. Each time a category repeats in the batch, it gets a penalty:

- **Exploring** (exploit=0): 12pt penalty per repeat (aggressive variety)
- **Balanced** (exploit=0.5): 8pt penalty
- **Rabbit hole** (exploit=1.0): 4pt penalty (let it happen)

First appearance of a category gets a +10pt bonus.

### 8. getNextBatch (the main loop)

When the feed needs more cards:

1. Get your historical engagement + compound it with session actions
2. Compute adaptive weights based on momentum/exploit state
3. Get base scored feed from the recommendation engine
4. Add adjacency boosts (environment gets a bump because you liked animals)
5. Re-score everything with the adaptive weights
6. Apply diversity penalties
7. Filter out already-shown items (if pool is exhausted, allow reshows at 70% score)
8. Return the top N items and mark them as shown

The entire thing runs in <1ms client-side. No API calls, no server, no latency.

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
