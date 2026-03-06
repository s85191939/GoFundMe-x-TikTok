import Link from 'next/link';

const footerColumns = [
  {
    title: 'Donate',
    links: ['How It Works', 'Discover Fundraisers', 'Pricing', 'GoFundMe Guarantee'],
  },
  {
    title: 'Fundraise',
    links: ['Start a GoFundMe', 'Fundraising Tips', 'Fundraiser Stories', 'Help Center'],
  },
  {
    title: 'About',
    links: ['About Us', 'Newsroom', 'Careers', 'Partners'],
  },
  {
    title: 'Resources',
    links: ['Blog', 'Press Center', 'Safety & Trust', 'Contact Us'],
  },
];

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Logo */}
        <div className="mb-8">
          <span className="text-2xl font-bold text-[#00b964] tracking-tight">GoFundMe</span>
        </div>

        {/* 4-column grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} GoFundMe Clone. This is a demo project and not
            affiliated with GoFundMe, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
