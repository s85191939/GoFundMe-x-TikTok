'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/formatters';

type Category =
  | 'emergency'
  | 'medical'
  | 'education'
  | 'nonprofit'
  | 'community'
  | 'animals'
  | 'environment'
  | 'memorial'
  | 'sports'
  | 'other';

interface ImpactCalculatorProps {
  amount: number;
  category: Category;
}

interface ImpactLine {
  emoji: string;
  text: string;
}

const impactData: Record<Category, Array<{ threshold: number; emoji: string; template: string }>> = {
  medical: [
    { threshold: 10, emoji: '💊', template: '{amount} covers basic medical supplies' },
    { threshold: 25, emoji: '💊', template: '{amount} covers one day of medication' },
    { threshold: 50, emoji: '🩺', template: '{amount} covers a doctor consultation' },
    { threshold: 100, emoji: '🧑‍⚕️', template: '{amount} covers a therapy session' },
    { threshold: 250, emoji: '🏥', template: '{amount} covers a day of hospital care' },
    { threshold: 500, emoji: '🏥', template: '{amount} covers a specialist consultation' },
  ],
  education: [
    { threshold: 10, emoji: '✏️', template: '{amount} buys notebooks and pens for a student' },
    { threshold: 25, emoji: '📚', template: '{amount} provides a textbook for a student' },
    { threshold: 50, emoji: '🎒', template: '{amount} buys school supplies for a student' },
    { threshold: 100, emoji: '💻', template: '{amount} funds educational software access' },
    { threshold: 200, emoji: '📖', template: '{amount} funds a semester of books' },
    { threshold: 500, emoji: '🎓', template: '{amount} provides a scholarship contribution' },
  ],
  animals: [
    { threshold: 10, emoji: '🐾', template: '{amount} provides treats for shelter animals' },
    { threshold: 25, emoji: '🐕', template: '{amount} provides food for a shelter animal for a week' },
    { threshold: 50, emoji: '💉', template: '{amount} covers a veterinary checkup' },
    { threshold: 100, emoji: '🏠', template: '{amount} sponsors an animal shelter stay for a month' },
    { threshold: 250, emoji: '🐈', template: '{amount} covers spay or neuter surgery' },
  ],
  emergency: [
    { threshold: 10, emoji: '🧴', template: '{amount} provides hygiene essentials' },
    { threshold: 25, emoji: '🥫', template: '{amount} provides meals for a family for a day' },
    { threshold: 50, emoji: '📦', template: '{amount} provides emergency supplies for a family' },
    { threshold: 100, emoji: '🏨', template: '{amount} covers temporary shelter for a night' },
    { threshold: 250, emoji: '🏗️', template: '{amount} helps rebuild after a disaster' },
    { threshold: 500, emoji: '🏠', template: '{amount} provides significant rebuilding support' },
  ],
  nonprofit: [
    { threshold: 10, emoji: '📋', template: '{amount} supports program materials' },
    { threshold: 25, emoji: '🤝', template: '{amount} helps support community outreach' },
    { threshold: 50, emoji: '🌟', template: '{amount} funds a volunteer training session' },
    { threshold: 100, emoji: '📣', template: '{amount} supports an awareness campaign' },
    { threshold: 250, emoji: '🏢', template: '{amount} covers a day of program operations' },
  ],
  community: [
    { threshold: 10, emoji: '🌱', template: '{amount} plants a tree in the neighborhood' },
    { threshold: 25, emoji: '🎨', template: '{amount} funds art supplies for a community project' },
    { threshold: 50, emoji: '🏘️', template: '{amount} supports a neighborhood improvement' },
    { threshold: 100, emoji: '🎉', template: '{amount} helps fund a community event' },
    { threshold: 250, emoji: '🛝', template: '{amount} contributes to playground equipment' },
  ],
  environment: [
    { threshold: 10, emoji: '🌿', template: '{amount} helps plant native seedlings' },
    { threshold: 25, emoji: '🌊', template: '{amount} supports a beach cleanup effort' },
    { threshold: 50, emoji: '🌳', template: '{amount} protects an acre of forest for a month' },
    { threshold: 100, emoji: '♻️', template: '{amount} funds a local recycling initiative' },
    { threshold: 250, emoji: '🌍', template: '{amount} supports climate research efforts' },
  ],
  memorial: [
    { threshold: 10, emoji: '🕯️', template: '{amount} contributes to memorial flowers' },
    { threshold: 25, emoji: '💐', template: '{amount} helps with memorial arrangements' },
    { threshold: 50, emoji: '🪦', template: '{amount} contributes to memorial expenses' },
    { threshold: 100, emoji: '🙏', template: '{amount} supports the family during this time' },
    { threshold: 250, emoji: '💝', template: '{amount} provides meaningful family support' },
  ],
  sports: [
    { threshold: 10, emoji: '⚽', template: '{amount} buys sports equipment basics' },
    { threshold: 25, emoji: '🏅', template: '{amount} covers a youth sports registration fee' },
    { threshold: 50, emoji: '👟', template: '{amount} provides athletic gear for a player' },
    { threshold: 100, emoji: '🏆', template: '{amount} sponsors a team tournament entry' },
    { threshold: 250, emoji: '🏟️', template: '{amount} funds facility rental for practice' },
  ],
  other: [
    { threshold: 10, emoji: '💛', template: '{amount} makes a meaningful difference' },
    { threshold: 25, emoji: '🌟', template: '{amount} brings us closer to the goal' },
    { threshold: 50, emoji: '✨', template: '{amount} provides significant support' },
    { threshold: 100, emoji: '💪', template: '{amount} creates a real impact' },
    { threshold: 250, emoji: '🎯', template: '{amount} moves us much closer to the goal' },
  ],
};

function getImpactLines(amount: number, category: Category): ImpactLine[] {
  const items = impactData[category];
  const lines: ImpactLine[] = [];

  // Find up to 2 impact lines: the best match at or below the amount,
  // and optionally a second one at a lower threshold
  const eligible = items.filter((item) => amount >= item.threshold);

  if (eligible.length === 0) {
    // Amount is below the lowest threshold -- show the lowest anyway
    const lowest = items[0];
    lines.push({
      emoji: lowest.emoji,
      text: lowest.template.replace('{amount}', formatCurrency(amount)),
    });
    return lines;
  }

  // Take the highest matching threshold
  const primary = eligible[eligible.length - 1];
  lines.push({
    emoji: primary.emoji,
    text: primary.template.replace('{amount}', formatCurrency(amount)),
  });

  // If there is a lower threshold item, add it as a second line for variety
  if (eligible.length >= 2) {
    const secondary = eligible[eligible.length - 2];
    lines.push({
      emoji: secondary.emoji,
      text: secondary.template.replace('{amount}', formatCurrency(amount)),
    });
  }

  return lines;
}

export default function ImpactCalculator({ amount, category }: ImpactCalculatorProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger fade-in on mount or when amount/category changes
    setVisible(false);
    const timeout = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timeout);
  }, [amount, category]);

  if (amount <= 0) return null;

  const impactLines = getImpactLines(amount, category);

  return (
    <div
      className={`bg-green-50 rounded-xl p-4 transition-opacity duration-500 ease-out ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <p className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-2">
        Your impact
      </p>
      <div className="space-y-2">
        {impactLines.map((line, index) => (
          <div key={index} className="flex items-start gap-2">
            <span className="text-base leading-5 flex-shrink-0">{line.emoji}</span>
            <p className="text-sm text-green-700">{line.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
