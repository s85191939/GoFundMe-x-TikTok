'use client';

import { useState, useEffect } from 'react';

interface LiveViewersProps {
  baseCount?: number;
  fundraiserId?: string;
}

export default function LiveViewers({ baseCount = 3, fundraiserId }: LiveViewersProps) {
  const [viewerCount, setViewerCount] = useState(() => {
    // Seed initial variation from fundraiserId if provided
    let seed = 0;
    if (fundraiserId) {
      for (let i = 0; i < fundraiserId.length; i++) {
        seed += fundraiserId.charCodeAt(i);
      }
    }
    const initialVariation = (seed % 3) - 1; // -1, 0, or 1
    return Math.max(1, baseCount + initialVariation);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount((prev) => {
        // Fluctuate ±1-2 from current count, but keep near baseCount
        const change = Math.random() < 0.5 ? -1 : 1;
        const magnitude = Math.random() < 0.7 ? 1 : 2;
        const next = prev + change * magnitude;
        // Clamp so it stays reasonable: at least 1 and within ±3 of base
        return Math.max(1, Math.min(baseCount + 4, next));
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [baseCount]);

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
      </span>
      <p className="text-sm text-gray-500">
        <span className="font-medium">{viewerCount}</span>{' '}
        {viewerCount === 1 ? 'person is' : 'people are'} viewing this right now
      </p>
    </div>
  );
}
