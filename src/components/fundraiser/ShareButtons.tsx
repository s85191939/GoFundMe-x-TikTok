'use client';

import { useState } from 'react';

interface ShareButtonsProps {
  url: string;
  title: string;
  onShare?: (platform: string) => void;
}

export default function ShareButtons({ url, title, onShare }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    onShare?.('copy');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    { name: 'Facebook', icon: 'f', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { name: 'X', icon: '𝕏', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}` },
    { name: 'Email', icon: '✉', href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}` },
  ];

  return (
    <div className="space-y-3">
      <button
        onClick={handleCopy}
        className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-full py-2.5 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
      >
        {copied ? (
          <><span className="text-gfm-green">✓</span> Copied!</>
        ) : (
          <><span>🔗</span> Copy link</>
        )}
      </button>
      <div className="flex gap-2">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onShare?.(link.name.toLowerCase())}
            className="flex-1 flex items-center justify-center gap-1.5 border border-gray-300 rounded-full py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <span>{link.icon}</span>
            <span className="hidden sm:inline">{link.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
