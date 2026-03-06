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

      {/* Metrics explanation */}
      <div className="bg-gfm-green-light/50 rounded-2xl p-8 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">📊 Instrumentation & Metrics</h2>
        <p className="text-gray-700">
          This app tracks the following metrics (click the 📊 button in the bottom-right corner to see the live dashboard):
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { metric: 'Page Views', why: 'Track which pages get the most traffic to optimize layout and content' },
            { metric: 'Scroll Depth', why: 'Understand how far users read — optimize story placement and length' },
            { metric: 'Time on Page', why: 'Measure engagement — longer time indicates compelling content' },
            { metric: 'Donation Funnel', why: 'Track button click → modal open → amount select → submit to find dropoff points' },
            { metric: 'Share Clicks', why: 'Measure virality — which platforms drive the most organic growth' },
            { metric: 'AI Feature Usage', why: 'Track AI story generator and smart suggestions to validate AI investment' },
          ].map((item) => (
            <div key={item.metric} className="bg-white rounded-lg p-4 border border-gray-100">
              <p className="font-semibold text-sm text-gray-900">{item.metric}</p>
              <p className="text-xs text-gfm-gray mt-1">{item.why}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
