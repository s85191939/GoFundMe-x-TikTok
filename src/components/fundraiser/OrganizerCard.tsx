import Link from 'next/link';
import Image from 'next/image';
import type { User } from '@/data/types';
import { formatDate } from '@/lib/formatters';

interface OrganizerCardProps {
  organizer: User;
  createdDate: string;
  category: string;
  tags: string[];
}

export default function OrganizerCard({ organizer, createdDate, category, tags }: OrganizerCardProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Organizer</h3>
      <Link href={`/profile/${organizer.id}`} className="flex items-center gap-3 group">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
          <Image src={organizer.avatar} alt={organizer.name} width={48} height={48} className="object-cover w-full h-full" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 group-hover:text-gfm-green transition-colors">
            {organizer.name}
            {organizer.isVerified && (
              <span className="inline-block ml-1 text-gfm-green">✓</span>
            )}
          </p>
          <p className="text-sm text-gfm-gray">{organizer.location}</p>
        </div>
      </Link>
      <div className="space-y-2 text-sm text-gfm-gray">
        <p>Created {formatDate(createdDate)}</p>
        <p className="capitalize">{category.replace(/-/g, ' ')}</p>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span key={tag} className="inline-block bg-gfm-green-light text-gfm-green text-xs px-2.5 py-1 rounded-full font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
