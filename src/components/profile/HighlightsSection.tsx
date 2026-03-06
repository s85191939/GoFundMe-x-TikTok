import type { Fundraiser } from '@/data/types';
import FundraiserCard from '@/components/shared/FundraiserCard';

interface HighlightsSectionProps {
  fundraisers: Fundraiser[];
}

export default function HighlightsSection({ fundraisers }: HighlightsSectionProps) {
  if (fundraisers.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Highlights</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fundraisers.map((fundraiser) => (
          <FundraiserCard key={fundraiser.id} fundraiser={fundraiser} />
        ))}
      </div>
    </div>
  );
}
