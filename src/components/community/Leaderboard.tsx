import Link from 'next/link';
import type { Fundraiser, User } from '@/data/types';
import { formatCurrency } from '@/lib/formatters';

interface LeaderboardEntry {
  user: User;
  fundraiser: Fundraiser;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export default function Leaderboard({ entries }: LeaderboardProps) {
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-gray-900">Top Fundraisers</h3>
      <div className="space-y-2">
        {entries.map((entry, index) => (
          <Link
            key={entry.fundraiser.id}
            href={`/fundraiser/${entry.fundraiser.id}`}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <span className="text-lg w-8 text-center flex-shrink-0">
              {index < 3 ? medals[index] : <span className="text-sm text-gfm-gray font-medium">#{index + 1}</span>}
            </span>
            <div className="w-10 h-10 rounded-full bg-gfm-green-light flex items-center justify-center text-gfm-green font-bold text-sm flex-shrink-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={entry.user.avatar} alt={entry.user.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate group-hover:text-gfm-green transition-colors">
                {entry.user.name}
              </p>
              <p className="text-xs text-gfm-gray truncate">{entry.fundraiser.title}</p>
            </div>
            <span className="font-bold text-sm text-gfm-green">{formatCurrency(entry.fundraiser.raisedAmount)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
