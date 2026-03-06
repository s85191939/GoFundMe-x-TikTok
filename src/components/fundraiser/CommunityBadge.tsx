import Link from 'next/link';
import type { Community } from '@/data/types';

interface CommunityBadgeProps {
  community: Community;
}

export default function CommunityBadge({ community }: CommunityBadgeProps) {
  return (
    <Link
      href={`/community/${community.id}`}
      className="flex items-center gap-3 border border-gfm-green/20 bg-gfm-green-light/50 rounded-lg p-3 hover:bg-gfm-green-light transition-colors group"
    >
      <div className="w-10 h-10 rounded-full bg-gfm-green flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        {community.name.charAt(0)}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-gray-900 text-sm group-hover:text-gfm-green transition-colors truncate">
          {community.name}
        </p>
        <p className="text-xs text-gfm-gray">{community.followerCount} followers</p>
      </div>
    </Link>
  );
}
