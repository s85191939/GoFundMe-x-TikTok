'use client';

import { useState } from 'react';

interface FollowButtonProps {
  onToggle?: (isFollowing: boolean) => void;
}

export default function FollowButton({ onToggle }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleClick = () => {
    const newState = !isFollowing;
    setIsFollowing(newState);
    onToggle?.(newState);
  };

  return (
    <button
      onClick={handleClick}
      className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
        isFollowing
          ? 'bg-gfm-green text-white hover:bg-gfm-green-dark'
          : 'border-2 border-gfm-green text-gfm-green hover:bg-gfm-green-light'
      }`}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}
