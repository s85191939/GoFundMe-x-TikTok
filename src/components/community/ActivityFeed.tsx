'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ActivityItem } from '@/data/types';
import { formatRelativeTime } from '@/lib/formatters';
import { getUserById } from '@/data/users';

interface ActivityFeedProps {
  items: ActivityItem[];
  pageSize?: number;
}

export default function ActivityFeed({ items, pageSize = 5 }: ActivityFeedProps) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const visible = items.slice(0, visibleCount);

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

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-gray-900">Recent Activity</h3>
      <div className="space-y-1">
        {visible.map((item) => {
          const user = getUserById(item.userId);
          return (
            <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-lg mt-0.5 flex-shrink-0">{getIcon(item.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">
                  {user && (
                    <Link href={`/profile/${user.id}`} className="font-semibold text-gray-900 hover:text-gfm-green">
                      {user.name}
                    </Link>
                  )}{' '}
                  {item.description}
                  {item.metadata?.amount && (
                    <span className="font-bold text-gfm-green"> ${item.metadata.amount}</span>
                  )}
                </p>
                <p className="text-xs text-gfm-gray mt-0.5">{formatRelativeTime(item.timestamp)}</p>
              </div>
            </div>
          );
        })}
      </div>
      {visibleCount < items.length && (
        <button
          onClick={() => setVisibleCount((c) => c + pageSize)}
          className="text-sm text-gfm-green font-semibold hover:underline"
        >
          Load more
        </button>
      )}
    </div>
  );
}
