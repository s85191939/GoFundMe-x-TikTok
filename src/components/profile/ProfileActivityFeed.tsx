'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ActivityItem } from '@/data/types';
import { formatRelativeTime, formatCurrency } from '@/lib/formatters';

interface ProfileActivityFeedProps {
  activities: ActivityItem[];
}

export default function ProfileActivityFeed({ activities }: ProfileActivityFeedProps) {
  const [visibleCount, setVisibleCount] = useState(5);
  const visible = activities.slice(0, visibleCount);

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'donation': return '💚';
      case 'fundraiser_created': return '🎉';
      case 'fundraiser_update': return '📝';
      case 'comment': return '💬';
      case 'follow': return '👤';
      default: return '•';
    }
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gfm-gray">
        <p>No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-gray-900">Activity</h2>
      <div className="space-y-1">
        {visible.map((item) => (
          <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-lg mt-0.5 flex-shrink-0">{getIcon(item.type)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700">
                {item.description}
                {item.metadata?.amount && (
                  <span className="font-bold text-gfm-green"> {formatCurrency(item.metadata.amount)}</span>
                )}
                {item.metadata?.fundraiserTitle && (
                  <Link
                    href={`/fundraiser/${item.targetId}`}
                    className="font-semibold text-gray-900 hover:text-gfm-green ml-1"
                  >
                    {item.metadata.fundraiserTitle}
                  </Link>
                )}
              </p>
              <p className="text-xs text-gfm-gray mt-0.5">{formatRelativeTime(item.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
      {visibleCount < activities.length && (
        <button
          onClick={() => setVisibleCount((c) => c + 5)}
          className="text-sm text-gfm-green font-semibold hover:underline"
        >
          Load more
        </button>
      )}
    </div>
  );
}
