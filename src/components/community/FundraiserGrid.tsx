'use client';

import { useState } from 'react';
import type { Fundraiser } from '@/data/types';
import FundraiserCard from '@/components/shared/FundraiserCard';

interface FundraiserGridProps {
  fundraisers: Fundraiser[];
  pageSize?: number;
}

export default function FundraiserGrid({ fundraisers, pageSize = 6 }: FundraiserGridProps) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const visible = fundraisers.slice(0, visibleCount);

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-900">Fundraisers ({fundraisers.length})</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((fundraiser) => (
          <FundraiserCard key={fundraiser.id} fundraiser={fundraiser} />
        ))}
      </div>
      {visibleCount < fundraisers.length && (
        <div className="text-center">
          <button
            onClick={() => setVisibleCount((c) => c + pageSize)}
            className="text-sm text-gfm-green font-semibold hover:underline"
          >
            Show more
          </button>
        </div>
      )}
    </div>
  );
}
