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
    <span className="inline-block w-[130px] flex-shrink-0">
      <button
        onClick={handleClick}
        className={`w-full py-2.5 rounded-full text-sm font-bold transition-colors duration-200 text-center ${
          isFollowing
            ? 'bg-gfm-green text-white hover:bg-gfm-green-dark'
            : 'border-2 border-gfm-green text-gfm-green hover:bg-gfm-green-light'
        }`}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    </span>
  );
}
