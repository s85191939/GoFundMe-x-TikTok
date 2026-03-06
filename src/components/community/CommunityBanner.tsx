import Image from 'next/image';
import type { Community } from '@/data/types';

interface CommunityBannerProps {
  community: Community;
}

export default function CommunityBanner({ community }: CommunityBannerProps) {
  return (
    <div className="relative">
      <div className="w-full aspect-[3/1] relative overflow-hidden rounded-none md:rounded-xl bg-gray-100">
        <Image
          src={community.bannerImage}
          alt={community.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end gap-4">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white bg-gfm-green flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0">
          {community.name.charAt(0)}
        </div>
        <div className="text-white mb-1">
          <h1 className="text-2xl md:text-3xl font-bold drop-shadow-md">{community.name}</h1>
          <p className="text-white/80 text-sm">{community.followerCount} followers</p>
        </div>
      </div>
    </div>
  );
}
