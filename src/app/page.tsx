import Link from 'next/link';
import { getAllFundraisers } from '@/data/fundraisers';
import { getAllCommunities } from '@/data/communities';
import FundraiserCard from '@/components/shared/FundraiserCard';

export default function HomePage() {
  const fundraisers = getAllFundraisers();
  const communities = getAllCommunities();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
      {/* Hero */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          The most trusted way to give
        </h1>
        <p className="text-lg text-gfm-gray max-w-2xl mx-auto">
          Join millions of people who raise money for personal needs, schools, charities, and more.
        </p>
        <div className="flex justify-center gap-3 pt-4">
          <Link
            href="/fundraiser/fundraiser-1"
            className="bg-gfm-green hover:bg-gfm-green-dark text-white font-semibold rounded-full px-8 py-3 transition-colors"
          >
            Explore Fundraisers
          </Link>
        </div>
      </div>

      {/* Featured Fundraisers */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Featured Fundraisers</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fundraisers.map((fundraiser) => (
            <FundraiserCard key={fundraiser.id} fundraiser={fundraiser} />
          ))}
        </div>
      </div>

      {/* Communities */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Communities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {communities.map((community) => (
            <Link
              key={community.id}
              href={`/community/${community.id}`}
              className="flex items-center gap-4 p-6 rounded-xl border border-gray-200 hover:border-gfm-green/30 hover:shadow-md transition-all card-hover"
            >
              <div className="w-16 h-16 rounded-full bg-gfm-green flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                {community.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{community.name}</h3>
                <p className="text-sm text-gfm-gray">{community.tagline}</p>
                <p className="text-xs text-gfm-gray mt-1">
                  {community.followerCount} followers &bull; {community.activeFundraiserCount} fundraisers
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Metrics & Instrumentation */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">📊 Instrumentation & Metrics</h2>
          <p className="text-gfm-gray mt-2 max-w-2xl mx-auto">
            Click the 📊 button in the bottom-right corner on any page to see the live business metrics dashboard.
          </p>
        </div>

        {/* Business Metrics */}
        <div className="bg-gfm-green-light/50 rounded-2xl p-8 space-y-4">
          <h3 className="text-xl font-bold text-gray-900">Business & Operational Metrics</h3>
          <p className="text-sm text-gray-600">Metrics a product team would track to measure platform health, growth, and revenue.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { metric: 'DAU / MAU', why: 'Daily and monthly active users measure platform growth. DAU/MAU ratio (stickiness) shows how often users return.' },
              { metric: 'Session Analytics', why: 'Session duration, pages per session, and bounce rate reveal engagement quality and content effectiveness.' },
              { metric: 'Conversion Funnel', why: 'Track visitor → donate click → modal → amount select → submit. Identifies exactly where donors drop off.' },
              { metric: 'Revenue Metrics', why: 'Total revenue, avg donation, revenue per visitor, donation velocity ($/hr) — core business health indicators.' },
              { metric: 'Retention (D1/D7/D30)', why: 'Cohort retention rates show if users come back. Critical for sustainable growth vs one-time traffic.' },
              { metric: 'Fundraiser Performance', why: 'Avg completion rate, success rate, time to fund — measures platform effectiveness at helping campaigns succeed.' },
            ].map((item) => (
              <div key={item.metric} className="bg-white rounded-lg p-4 border border-gray-100">
                <p className="font-semibold text-sm text-gray-900">{item.metric}</p>
                <p className="text-xs text-gfm-gray mt-1">{item.why}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="bg-blue-50/50 rounded-2xl p-8 space-y-4">
          <h3 className="text-xl font-bold text-gray-900">Engagement & Feature Adoption</h3>
          <p className="text-sm text-gray-600">Understand how users interact with content and which features drive value.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { metric: 'Scroll Depth', why: 'How far users read campaign stories. Optimizes story length and CTA placement for maximum conversion.' },
              { metric: 'Time on Page', why: 'Longer time = more engaged. Short time on fundraiser pages may indicate poor story quality.' },
              { metric: 'AI Feature Adoption', why: 'What % of sessions use AI story generator or smart suggestions? Validates ROI of AI investment.' },
              { metric: 'Share Adoption', why: 'What % of visitors share campaigns? Each share = ~$13-15 avg in donations (GoFundMe data).' },
              { metric: 'Social Proof Engagement', why: 'Live viewer counts and donation toasts create urgency. Track if they correlate with higher conversion.' },
              { metric: 'Impact Calculator Usage', why: 'Does showing "Your $25 provides X" in the donate modal increase avg donation amount?' },
            ].map((item) => (
              <div key={item.metric} className="bg-white rounded-lg p-4 border border-gray-100">
                <p className="font-semibold text-sm text-gray-900">{item.metric}</p>
                <p className="text-xs text-gfm-gray mt-1">{item.why}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-amber-50/50 rounded-2xl p-8 space-y-4">
          <h3 className="text-xl font-bold text-gray-900">Performance & Core Web Vitals</h3>
          <p className="text-sm text-gray-600">Page speed directly impacts donation rates. Slower pages = fewer donors.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { metric: 'LCP (Largest Contentful Paint)', why: 'Time until the main content loads. Target: &lt;2.5s. Slow LCP means donors leave before seeing the campaign.' },
              { metric: 'FID (First Input Delay)', why: 'Time until the page responds to first click. Target: &lt;100ms. Slow FID = frustrated users abandoning donations.' },
              { metric: 'CLS (Cumulative Layout Shift)', why: 'Visual stability score. Target: &lt;0.1. Layout shifts cause users to click wrong buttons mid-donation.' },
              { metric: 'TTFB (Time to First Byte)', why: 'Server response time. High TTFB indicates backend/CDN issues that affect all users.' },
              { metric: 'Page Load Time', why: 'Full page load. Each second of delay reduces conversions by ~7% (industry benchmark).' },
              { metric: 'API Latency', why: 'Donation submission and data fetch speeds. Slow API = abandoned donation forms.' },
            ].map((item) => (
              <div key={item.metric} className="bg-white rounded-lg p-4 border border-gray-100">
                <p className="font-semibold text-sm text-gray-900">{item.metric}</p>
                <p className="text-xs text-gfm-gray mt-1">{item.why}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Features */}
        <div className="bg-purple-50/50 rounded-2xl p-8 space-y-4">
          <h3 className="text-xl font-bold text-gray-900">AI-Powered Features</h3>
          <p className="text-sm text-gray-600">AI features that enhance the fundraising experience and drive better outcomes.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { metric: 'AI Story Enhancement', why: 'Generates more compelling campaign stories. Better stories = more donations and shares.' },
              { metric: 'Smart Donation Suggestions', why: 'AI-computed suggested amounts based on goal, avg donation, and remaining need. Increases avg donation.' },
              { metric: 'Campaign Health Score', why: 'AI scores campaigns 0-100 with actionable recommendations. Helps organizers optimize their campaigns.' },
              { metric: 'Trending Detection', why: 'Identifies viral campaigns using donation velocity, clustering, and goal proximity signals.' },
              { metric: 'Impact Calculator', why: 'Shows "Your $X provides Y" context based on category. Makes donations feel tangible and meaningful.' },
              { metric: 'Similar Causes', why: 'AI matches fundraisers by category to keep donors engaged and increase platform-wide donations.' },
            ].map((item) => (
              <div key={item.metric} className="bg-white rounded-lg p-4 border border-gray-100">
                <p className="font-semibold text-sm text-gray-900">{item.metric}</p>
                <p className="text-xs text-gfm-gray mt-1">{item.why}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
