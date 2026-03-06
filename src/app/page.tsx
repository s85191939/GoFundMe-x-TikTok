import Link from 'next/link';
import { getAllFundraisers } from '@/data/fundraisers';
import { getAllCommunities } from '@/data/communities';
import { donations } from '@/data/donations';
import { users } from '@/data/users';
import { formatCurrency } from '@/lib/formatters';
import FundraiserCard from '@/components/shared/FundraiserCard';

export default function HomePage() {
  const fundraisers = getAllFundraisers();
  const communities = getAllCommunities();

  const totalDonations = donations.length;
  const totalRaised = donations.reduce((sum, d) => sum + d.amount, 0);
  const totalVisitors = users.length * 47; // simulated visitor count
  const totalCommunityMembers = communities.reduce((sum, c) => sum + c.followerCount, 0);

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

      {/* Platform Stats */}
      <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
        <div className="text-center">
          <p className="text-3xl md:text-4xl font-bold text-gfm-green">{totalVisitors.toLocaleString()}</p>
          <p className="text-sm text-gfm-gray mt-1">Visitors</p>
        </div>
        <div className="text-center">
          <p className="text-3xl md:text-4xl font-bold text-gfm-green">{totalDonations.toLocaleString()}</p>
          <p className="text-sm text-gfm-gray mt-1">Donations</p>
        </div>
        <div className="text-center">
          <p className="text-3xl md:text-4xl font-bold text-gfm-green">{totalCommunityMembers.toLocaleString()}</p>
          <p className="text-sm text-gfm-gray mt-1">Community Members</p>
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
    </div>
  );
}
