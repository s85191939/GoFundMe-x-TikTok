'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Community } from '@/data/types';
import { formatCurrency } from '@/lib/formatters';

interface UserCommunitiesProps {
  communities: Community[];
}

export default function UserCommunities({ communities }: UserCommunitiesProps) {
  if (communities.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-gray-900">Communities</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {communities.map((community) => (
          <Link
            key={community.id}
            href={`/community/${community.id}`}
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-[#00b964]/30 hover:bg-[#e6f9f0]/30 transition-all group"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
              <Image
                src={community.avatarImage}
                alt={community.name}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#00b964] transition-colors">
                {community.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{community.tagline}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[10px] text-gray-400">
                  {community.followerCount} members
                </span>
                <span className="text-[10px] text-[#00b964] font-medium">
                  {formatCurrency(community.totalRaised)} raised
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
