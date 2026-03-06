'use client';

import FollowButton from '@/components/community/FollowButton';

interface FollowerStatsProps {
  followerCount: number;
  followingCount: number;
  onFollow?: (isFollowing: boolean) => void;
}

export default function FollowerStats({ followerCount, followingCount, onFollow }: FollowerStatsProps) {
  return (
    <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
      <div className="flex items-center gap-4 text-sm">
        <span>
          <strong className="text-gray-900">{followerCount}</strong>{' '}
          <span className="text-gfm-gray">followers</span>
        </span>
        <span>
          <strong className="text-gray-900">{followingCount}</strong>{' '}
          <span className="text-gfm-gray">following</span>
        </span>
      </div>
      <FollowButton onToggle={onFollow} />
    </div>
  );
}
