'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { formatCurrency } from '@/lib/formatters';
import { getPersonalizedToastDonation } from '@/lib/socialProof';
import type { Donation } from '@/data/types';

interface SocialProofToastProps {
  donations: Donation[];
  fundraiserTitle: string;
}

interface ToastState {
  donation: Donation;
  personalizedMessage?: string;
  visible: boolean;
}

export default function SocialProofToast({ donations, fundraiserTitle }: SocialProofToastProps) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [toastsShown, setToastsShown] = useState(0);

  // Try to get a personalized toast based on user similarity
  const personalizedToast = useMemo(
    () => getPersonalizedToastDonation(donations),
    [donations]
  );

  const showToast = useCallback(
    (donation: Donation, personalizedMessage?: string) => {
      // Slide in
      setToast({ donation, personalizedMessage, visible: true });

      // Slide out after 4 seconds
      const hideTimeout = setTimeout(() => {
        setToast((prev) => (prev ? { ...prev, visible: false } : null));
        // Remove from DOM after animation completes
        const removeTimeout = setTimeout(() => {
          setToast(null);
        }, 300);
        return () => clearTimeout(removeTimeout);
      }, 4000);

      return () => clearTimeout(hideTimeout);
    },
    []
  );

  const dismiss = useCallback(() => {
    setToast((prev) => (prev ? { ...prev, visible: false } : null));
    setTimeout(() => {
      setToast(null);
    }, 300);
  }, []);

  useEffect(() => {
    if (donations.length === 0 || toastsShown >= 3) return;

    const getRandomDonation = () => {
      const index = Math.floor(Math.random() * donations.length);
      return donations[index];
    };

    // Initial delay: random 3-8 seconds
    const initialDelay = 3000 + Math.random() * 5000;
    let currentTimeout: NodeJS.Timeout;
    let usedPersonalized = false;

    const scheduleToast = (delay: number) => {
      currentTimeout = setTimeout(() => {
        if (toastsShown >= 3) return;

        // Use personalized toast for the first one if available
        if (!usedPersonalized && personalizedToast) {
          usedPersonalized = true;
          showToast(personalizedToast.donation, personalizedToast.personalizedMessage);
        } else {
          const donation = getRandomDonation();
          showToast(donation);
        }
        setToastsShown((prev) => prev + 1);

        // Schedule next toast after 15-30 seconds (toast display time + gap)
        const nextDelay = 4300 + 15000 + Math.random() * 15000;
        scheduleToast(nextDelay);
      }, delay);
    };

    scheduleToast(initialDelay);

    return () => clearTimeout(currentTimeout);
  }, [donations, toastsShown, showToast, personalizedToast]);

  if (!toast) return null;

  const initial = toast.donation.donorName.charAt(0).toUpperCase();

  return (
    <div className="fixed bottom-6 left-6 z-50" role="status" aria-live="polite">
      <div
        className={`flex items-center gap-3 bg-white rounded-xl shadow-xl border-l-4 border-green-500 px-4 py-3 max-w-sm transition-all duration-300 ease-out ${
          toast.visible
            ? 'translate-y-0 opacity-100'
            : 'translate-y-4 opacity-0'
        }`}
      >
        {/* Avatar initial */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <span className="text-green-700 font-bold text-sm">{initial}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {toast.personalizedMessage ? (
            <p className="text-sm text-gray-800">
              <span className="font-semibold text-green-600">{toast.personalizedMessage}</span>
              <span className="block text-xs text-gray-500 mt-0.5">
                to {fundraiserTitle}
              </span>
            </p>
          ) : (
            <p className="text-sm text-gray-800">
              <span className="font-semibold">{toast.donation.donorName}</span>{' '}
              donated{' '}
              <span className="font-semibold text-green-600">
                {formatCurrency(toast.donation.amount)}
              </span>{' '}
              to{' '}
              <span className="font-medium truncate">{fundraiserTitle}</span>
            </p>
          )}
        </div>

        {/* Dismiss button */}
        <button
          onClick={dismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1"
          aria-label="Dismiss notification"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
