'use client';

import { useState } from 'react';
import type { FundraiserCategory } from '@/data/types';
import { generateEnhancedStory } from '@/lib/ai';

interface AIStoryGeneratorProps {
  currentStory: string;
  category: FundraiserCategory;
  title: string;
  onGenerate?: (newStory: string) => void;
  onTrack?: () => void;
}

export default function AIStoryGenerator({ currentStory, category, title, onGenerate, onTrack }: AIStoryGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    onTrack?.();
    try {
      const result = await generateEnhancedStory(currentStory, category, title);
      setGenerated(true);
      onGenerate?.(result);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="border border-dashed border-gfm-green/40 bg-gfm-green-light/30 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">✨</span>
        <h3 className="font-semibold text-sm text-gray-900">AI Story Enhancement</h3>
      </div>
      <p className="text-xs text-gfm-gray">
        Use AI to make this campaign story more compelling and engaging.
      </p>
      <button
        onClick={handleGenerate}
        disabled={isGenerating || generated}
        className={`w-full py-2.5 px-4 rounded-full text-sm font-semibold transition-all duration-200 ${
          generated
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
            : isGenerating
            ? 'bg-gfm-green/70 text-white cursor-wait'
            : 'bg-gfm-green hover:bg-gfm-green-dark text-white'
        }`}
      >
        {generated ? '✓ Story Enhanced' : isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating...
          </span>
        ) : '✨ Enhance with AI'}
      </button>
    </div>
  );
}
