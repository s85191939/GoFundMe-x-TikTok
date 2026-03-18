import Link from 'next/link';

const footerLinks = [
  { label: 'Discover Fundraisers', href: '/discover' },
  { label: 'Explore', href: '/explore' },
  { label: 'Communities', href: '/communities' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top row: Logo + Nav */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
          <Link href="/" className="text-2xl font-bold text-[#00b964] tracking-tight">
            GoFundMe
          </Link>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} GoFundMe Clone.
          </p>
        </div>
      </div>
    </footer>
  );
}
