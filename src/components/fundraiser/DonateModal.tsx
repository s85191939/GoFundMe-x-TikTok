'use client';

import { useState } from 'react';
import type { Fundraiser, AIDonationSuggestion } from '@/data/types';
import { formatCurrency } from '@/lib/formatters';
import { calculateDonationSuggestions } from '@/lib/ai';
import SmartDonationSuggestions from '@/components/shared/SmartDonationSuggestions';
import ImpactCalculator from '@/components/shared/ImpactCalculator';
import PeerDonationNudge from '@/components/fundraiser/PeerDonationNudge';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
  fundraiser: Fundraiser;
  avgDonation: number;
  onTrack?: (event: string, data?: Record<string, unknown>) => void;
}

export default function DonateModal({ isOpen, onClose, fundraiser, avgDonation, onTrack }: DonateModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const suggestions: AIDonationSuggestion[] = calculateDonationSuggestions(
    fundraiser.goalAmount,
    fundraiser.raisedAmount,
    avgDonation
  );

  const currentAmount = selectedAmount || (customAmount ? parseFloat(customAmount) : 0);

  const handleSubmit = () => {
    if (currentAmount > 0) {
      onTrack?.('donate_submit', { amount: currentAmount });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSelectedAmount(null);
        setCustomAmount('');
        onClose();
      }, 2000);
    }
  };

  const handleSelectSuggestion = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
    onTrack?.('donate_amount_select', { amount, source: 'ai_suggestion' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5 modal-content max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <div className="text-5xl">🎉</div>
            <h2 className="text-xl font-bold text-gray-900">Thank you!</h2>
            <p className="text-gfm-gray">Your donation of {formatCurrency(currentAmount)} has been received.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Donate</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>

            <p className="text-sm text-gfm-gray">You&apos;re supporting <strong>{fundraiser.title}</strong></p>

            <SmartDonationSuggestions
              suggestions={suggestions}
              selectedAmount={selectedAmount}
              onSelect={handleSelectSuggestion}
            />

            <PeerDonationNudge fundraiserId={fundraiser.id} />

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Or enter custom amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                  placeholder="0"
                  min="1"
                  className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gfm-green focus:outline-none text-lg font-medium"
                />
              </div>
            </div>

            {currentAmount > 0 && (
              <ImpactCalculator amount={currentAmount} category={fundraiser.category} />
            )}

            <button
              onClick={handleSubmit}
              disabled={currentAmount <= 0}
              className={`w-full py-3.5 rounded-full font-semibold text-lg transition-all duration-200 ${
                currentAmount > 0
                  ? 'bg-gfm-green hover:bg-gfm-green-dark text-white shadow-sm hover:shadow-md'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {currentAmount > 0 ? `Donate ${formatCurrency(currentAmount)}` : 'Enter an amount'}
            </button>

            <p className="text-xs text-center text-gfm-gray">
              This is a demo. No real payment will be processed.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
