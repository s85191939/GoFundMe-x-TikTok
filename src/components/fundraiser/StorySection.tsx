'use client';

import { useState } from 'react';

interface StorySectionProps {
  story: string;
  onExpand?: () => void;
}

export default function StorySection({ story, onExpand }: StorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = story.length > 400;

  const handleToggle = () => {
    if (!isExpanded && onExpand) onExpand();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-gray-900">Story</h2>
      <div className="relative">
        <div
          className={`text-gray-700 leading-relaxed whitespace-pre-line ${
            !isExpanded && shouldTruncate ? 'max-h-40 overflow-hidden' : ''
          }`}
        >
          {story}
        </div>
        {!isExpanded && shouldTruncate && (
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>
      {shouldTruncate && (
        <button
          onClick={handleToggle}
          className="text-gfm-green font-semibold hover:underline text-sm"
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}
