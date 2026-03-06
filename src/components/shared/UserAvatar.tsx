import Image from 'next/image';
import { getInitials } from '@/lib/utils';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface UserAvatarProps {
  src?: string;
  name: string;
  size?: AvatarSize;
}

const sizeMap: Record<AvatarSize, number> = {
  sm: 32,
  md: 48,
  lg: 80,
  xl: 120,
};

const textSizeMap: Record<AvatarSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-xl',
  xl: 'text-3xl',
};

/**
 * Generate a consistent background color from a name string.
 */
function getColorFromName(name: string): string {
  const colors = [
    'bg-emerald-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function UserAvatar({ src, name, size = 'md' }: UserAvatarProps) {
  const dimension = sizeMap[size];
  const initials = getInitials(name);
  const bgColor = getColorFromName(name);
  const textSize = textSizeMap[size];

  if (src) {
    return (
      <div
        className="relative rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0"
        style={{ width: dimension, height: dimension }}
      >
        <Image
          src={src}
          alt={name}
          width={dimension}
          height={dimension}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <div
      className={`rounded-full border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0 ${bgColor}`}
      style={{ width: dimension, height: dimension }}
    >
      <span className={`font-semibold text-white ${textSize}`}>{initials}</span>
    </div>
  );
}
