'use client';

import { useState, useEffect } from 'react';
import type { FundraiserCategory } from '@/data/types';
import { getPreferences, completeOnboarding, CATEGORY_OPTIONS } from '@/lib/preferences';

export default function InterestsOnboarding() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<FundraiserCategory[]>([]);
  const [step, setStep] = useState<'interests' | 'done'>('interests');

  useEffect(() => {
    // Check if user has completed onboarding
    const prefs = getPreferences();
    if (!prefs.hasCompletedOnboarding) {
      // Small delay for smooth page load
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const toggleCategory = (cat: FundraiserCategory) => {
    setSelected(prev =>
      prev.includes(cat)
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    );
  };

  const handleComplete = () => {
    completeOnboarding(selected);
    setStep('done');
    setTimeout(() => setIsOpen(false), 1500);
  };

  const handleSkip = () => {
    completeOnboarding([]);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleSkip} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-slide-up">
        {step === 'interests' ? (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-[#00b964] to-[#009e54] px-6 py-8 text-center">
              <div className="text-4xl mb-3">👋</div>
              <h2 className="text-2xl font-bold text-white">Welcome to GoFundMe</h2>
              <p className="text-white/80 text-sm mt-2">
                What causes do you care about? We&apos;ll personalize your feed.
              </p>
            </div>

            {/* Category grid */}
            <div className="px-6 py-6">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-4 font-medium">
                Select your interests (pick at least 2)
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {CATEGORY_OPTIONS.map(cat => {
                  const isSelected = selected.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-[#00b964] bg-[#e6f9f0] shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xl">{cat.emoji}</span>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold ${isSelected ? 'text-[#00b964]' : 'text-gray-900'}`}>
                          {cat.label}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">{cat.description}</p>
                      </div>
                      {isSelected && (
                        <svg className="w-5 h-5 text-[#00b964] ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex items-center justify-between">
              <button
                onClick={handleSkip}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Skip for now
              </button>
              <button
                onClick={handleComplete}
                disabled={selected.length < 2}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  selected.length >= 2
                    ? 'bg-[#00b964] text-white hover:bg-[#009e54] shadow-md'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue ({selected.length} selected)
              </button>
            </div>
          </>
        ) : (
          /* Success state */
          <div className="px-6 py-12 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-900">You&apos;re all set!</h3>
            <p className="text-sm text-gray-500 mt-2">
              Your feed is now personalized. You can update your interests anytime in your profile.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
