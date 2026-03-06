import Image from 'next/image';
import type { User } from '@/data/types';
import { formatDate } from '@/lib/formatters';

interface ProfileHeaderProps {
  user: User;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
      <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg flex-shrink-0">
        <Image src={user.avatar} alt={user.name} width={128} height={128} className="object-cover w-full h-full" priority />
      </div>
      <div className="text-center md:text-left space-y-2 flex-1">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {user.name}
          {user.isVerified && (
            <span className="inline-block ml-2 text-gfm-green text-xl">✓</span>
          )}
        </h1>
        {user.bio && <p className="text-gray-600 leading-relaxed max-w-xl">{user.bio}</p>}
        <div className="flex items-center gap-4 text-sm text-gfm-gray justify-center md:justify-start">
          <span>📍 {user.location}</span>
          <span>Joined {formatDate(user.joinedDate)}</span>
        </div>
      </div>
    </div>
  );
}
