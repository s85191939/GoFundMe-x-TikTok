'use client';

import type { AIDonationSuggestion } from '@/data/types';
import { formatCurrency } from '@/lib/formatters';

interface SmartDonationSuggestionsProps {
  suggestions: AIDonationSuggestion[];
  selectedAmount: number | null;
  onSelect: (amount: number) => void;
}

export default function SmartDonationSuggestions({ suggestions, selectedAmount, onSelect }: SmartDonationSuggestionsProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <span className="text-sm">✨</span>
        <p className="text-xs font-semibold text-gfm-gray uppercase tracking-wide">AI Suggested Amounts</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.amount}
            onClick={() => onSelect(suggestion.amount)}
            className={`relative p-3 rounded-lg border-2 text-left transition-all duration-200 ${
              selectedAmount === suggestion.amount
                ? 'border-gfm-green bg-gfm-green-light'
                : 'border-gray-200 hover:border-gfm-green/50'
            }`}
          >
            {suggestion.label === 'Most Popular' && (
              <span className="absolute -top-2.5 left-2 bg-gfm-green text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                Most Popular
              </span>
            )}
            <p className="font-bold text-gray-900">{formatCurrency(suggestion.amount)}</p>
            <p className="text-xs text-gfm-gray mt-0.5">{suggestion.reasoning}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
