import Link from 'next/link';
import type { User } from '@/data/types';

interface CampaignHeaderProps {
  title: string;
  organizer: User;
  beneficiaryName: string;
}

export default function CampaignHeader({ title, organizer, beneficiaryName }: CampaignHeaderProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{title}</h1>
      <p className="text-gfm-gray text-sm">
        <Link href={`/profile/${organizer.id}`} className="text-gfm-green hover:underline font-medium">
          {organizer.name}
        </Link>
        {' '}is organizing this fundraiser{beneficiaryName ? ` for ${beneficiaryName}` : ''}.
      </p>
    </div>
  );
}
