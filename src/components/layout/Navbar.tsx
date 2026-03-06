import Link from 'next/link';

export default function Navbar() {
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
                href="#"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Discover
              </Link>
              <Link
                href="#"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Fundraise
              </Link>
              <Link
                href="#"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                About
              </Link>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Sign in
            </button>
            <button className="bg-[#00b964] hover:bg-[#009e54] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors">
              Start a GoFundMe
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
