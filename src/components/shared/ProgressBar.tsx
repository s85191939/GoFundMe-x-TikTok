'use client';

import { useEffect, useState } from 'react';

interface ProgressBarProps {
  percentage: number;
  animated?: boolean;
}

export default function ProgressBar({ percentage, animated = true }: ProgressBarProps) {
  const [width, setWidth] = useState(animated ? 0 : percentage);

  useEffect(() => {
    if (animated) {
      // Small delay to trigger CSS transition from 0 to target
      const timer = setTimeout(() => {
        setWidth(percentage);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setWidth(percentage);
    }
  }, [percentage, animated]);

  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full progress-bar-fill"
        style={{
          width: `${Math.min(width, 100)}%`,
          backgroundColor: '#00b964',
        }}
      />
    </div>
  );
}
