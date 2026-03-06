import Link from 'next/link';
import Image from 'next/image';
import { Fundraiser } from '@/data/types';
import { formatCurrency } from '@/lib/formatters';
import { getPercentage } from '@/lib/utils';
import ProgressBar from './ProgressBar';

interface FundraiserCardProps {
  fundraiser: Fundraiser;
}

export default function FundraiserCard({ fundraiser }: FundraiserCardProps) {
  const percentage = getPercentage(fundraiser.raisedAmount, fundraiser.goalAmount);

  return (
    <Link href={`/fundraiser/${fundraiser.id}`} className="block">
      <div className="bg-white rounded-xl overflow-hidden border border-gray-100 card-hover">
        {/* Thumbnail 16:9 */}
        <div className="relative w-full aspect-video">
          <Image
            src={fundraiser.heroImage}
            alt={fundraiser.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-2">
            {fundraiser.title}
          </h3>

          <p className="text-xs text-gray-500 mb-3">
            by {fundraiser.beneficiaryName}
          </p>

          <ProgressBar percentage={percentage} />

          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(fundraiser.raisedAmount)} raised
            </span>
            <span className="text-xs text-gray-500">
              of {formatCurrency(fundraiser.goalAmount)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
