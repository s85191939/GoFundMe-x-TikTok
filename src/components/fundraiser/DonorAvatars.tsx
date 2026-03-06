import type { Donation } from '@/data/types';

interface DonorAvatarsProps {
  donations: Donation[];
}

export default function DonorAvatars({ donations }: DonorAvatarsProps) {
  const visibleDonors = donations.filter(d => !d.isAnonymous).slice(0, 6);
  const remaining = donations.length - visibleDonors.length;

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {visibleDonors.map((donation) => (
          <div
            key={donation.id}
            className="w-8 h-8 rounded-full border-2 border-white bg-gfm-green-light flex items-center justify-center text-xs font-bold text-gfm-green overflow-hidden"
            title={donation.donorName}
          >
            {donation.donorAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={donation.donorAvatar} alt={donation.donorName} className="w-full h-full object-cover" />
            ) : (
              donation.donorName.charAt(0).toUpperCase()
            )}
          </div>
        ))}
      </div>
      {remaining > 0 && (
        <span className="text-xs text-gfm-gray">+{remaining} more</span>
      )}
    </div>
  );
}
