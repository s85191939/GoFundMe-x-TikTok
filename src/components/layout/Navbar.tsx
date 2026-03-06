import Link from 'next/link';
import Image from 'next/image';
import { getCurrentUser, CURRENT_USER_ID } from '@/lib/auth';

export default function Navbar() {
  const user = getCurrentUser();

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-[#00b964] tracking-tight">
              GoFundMe
            </Link>

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Discover
              </Link>
              <Link
                href="/community/community-1"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Communities
              </Link>
            </div>
          </div>

          {/* Right: Logged-in user */}
          <div className="flex items-center gap-4">
            <Link
              href="/fundraiser/fundraiser-1"
              className="bg-[#00b964] hover:bg-[#009e54] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
            >
              Start a GoFundMe
            </Link>
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
