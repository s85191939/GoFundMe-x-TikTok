'use client';

import { useState } from 'react';

interface CommunityGuidelinesProps {
  guidelines: string[];
}

export default function CommunityGuidelines({ guidelines }: CommunityGuidelinesProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <h3 className="font-bold text-gray-900 text-sm">Community Guidelines</h3>
        <span className={`text-gfm-gray transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 space-y-2 animate-fade-in">
          {guidelines.map((guideline, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-gfm-green font-bold text-sm mt-0.5">{index + 1}.</span>
              <p className="text-sm text-gray-600">{guideline}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
