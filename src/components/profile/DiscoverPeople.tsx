import Link from 'next/link';
import Image from 'next/image';
import type { User } from '@/data/types';

interface DiscoverPeopleProps {
  users: User[];
}

export default function DiscoverPeople({ users }: DiscoverPeopleProps) {
  if (users.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-gray-900">Discover People</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/profile/${user.id}`}
            className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-gfm-green/30 hover:bg-gfm-green-light/30 transition-colors min-w-[100px] flex-shrink-0"
          >
            <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100">
              <Image src={user.avatar} alt={user.name} width={56} height={56} className="object-cover w-full h-full" />
            </div>
            <p className="text-xs font-medium text-gray-900 text-center truncate w-full">{user.name.split(' ')[0]}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
