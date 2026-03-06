'use client';

import { useState, useEffect } from 'react';
import type { FundraiserCategory } from '@/data/types';
import { getPreferences, savePreferences, CATEGORY_OPTIONS } from '@/lib/preferences';

export default function InterestsEditor() {
  const [interests, setInterests] = useState<FundraiserCategory[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const prefs = getPreferences();
    setInterests(prefs.interests);
  }, []);

  const toggleCategory = (cat: FundraiserCategory) => {
    setInterests(prev =>
      prev.includes(cat)
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    );
  };

  const handleSave = () => {
    savePreferences({ interests });
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const selectedOptions = CATEGORY_OPTIONS.filter(c => interests.includes(c.id));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <span>🎯</span> My Interests
        </h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs text-[#00b964] hover:text-[#009e54] font-medium transition-colors"
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {saved && (
        <div className="bg-green-50 text-green-700 text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Interests updated! Your feed will reflect these changes.
        </div>
      )}

      {isEditing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {CATEGORY_OPTIONS.map(cat => {
              const isSelected = interests.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 text-left transition-all text-sm ${
                    isSelected
                      ? 'border-[#00b964] bg-[#e6f9f0]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span className={`font-medium ${isSelected ? 'text-[#00b964]' : 'text-gray-700'}`}>
                    {cat.label}
                  </span>
                  {isSelected && (
                    <svg className="w-4 h-4 text-[#00b964] ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
          <button
            onClick={handleSave}
            className="w-full bg-[#00b964] hover:bg-[#009e54] text-white text-sm font-semibold py-2.5 rounded-full transition-colors"
          >
            Save Interests ({interests.length} selected)
          </button>
        </div>
      ) : (
        <div>
          {selectedOptions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedOptions.map(cat => (
                <span
                  key={cat.id}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#e6f9f0] text-[#00b964] text-xs font-medium rounded-full"
                >
                  <span>{cat.emoji}</span>
                  {cat.label}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">
              No interests set yet. Click &quot;Edit&quot; to personalize your feed.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
