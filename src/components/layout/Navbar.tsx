'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { getCurrentUser, CURRENT_USER_ID } from '@/lib/auth';
import dynamic from 'next/dynamic';

const NotificationBell = dynamic(() => import('./NotificationBell'), { ssr: false });

export default function Navbar() {
  const user = getCurrentUser();
  const pathname = usePathname();

  const navLinks = [
    { href: '/discover', label: 'Discover' },
    { href: '/explore', label: 'Explore' },
    { href: '/communities', label: 'Communities' },
  ];

  return (
    <nav className="sticky top-0 z-[1100] bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-[#00b964] tracking-tight">
              GoFundMe
            </Link>

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'text-[#00b964] bg-[#00b964]/5'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: Notifications + CTA + Profile */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <NotificationBell />

            {/* User Profile */}
            {user && (
              <Link href={`/profile/${CURRENT_USER_ID}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                  <Image src={user.avatar} alt={user.name} width={36} height={36} className="object-cover w-full h-full" />
                </div>
                <span className="hidden md:inline text-sm font-medium text-gray-700">{user.name.split(' ')[0]}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
