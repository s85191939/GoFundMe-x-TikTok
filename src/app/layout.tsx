import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import InterestsOnboarding from '@/components/onboarding/InterestsOnboarding';

export const metadata: Metadata = {
  title: 'GoFundMe Clone',
  description:
    'A GoFundMe clone built with Next.js, demonstrating fundraiser pages, donation flows, and community features.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <InterestsOnboarding />
      </body>
    </html>
  );
}
