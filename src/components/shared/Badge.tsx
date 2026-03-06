import { ReactNode } from 'react';

type BadgeVariant = 'green' | 'gray' | 'blue';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  green: 'bg-green-100 text-green-800',
  gray: 'bg-gray-100 text-gray-700',
  blue: 'bg-blue-100 text-blue-800',
};

export default function Badge({ label, variant = 'gray', icon }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {label}
    </span>
  );
}
