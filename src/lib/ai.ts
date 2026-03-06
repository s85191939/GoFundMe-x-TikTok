import { AIDonationSuggestion, Fundraiser, FundraiserCategory } from '@/data/types';

/**
 * Simulate an AI-enhanced story generation.
 * Returns a more compelling version of the story after a 1.5s simulated delay.
 */
export async function generateEnhancedStory(
  story: string,
  category: FundraiserCategory,
  title: string,
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const categoryHooks: Record<FundraiserCategory, string> = {
    emergency:
      'Every second counts in moments of crisis, and your support can be the lifeline someone desperately needs.',
    medical:
      'Behind every medical battle is a person fighting with courage, and your generosity can ease the burden of that fight.',
    education:
      'Education has the power to transform lives and break cycles. Your contribution helps unlock that potential.',
    nonprofit:
      'Together, we can amplify the impact of organizations working tirelessly to make the world a better place.',
    community:
      'Strong communities are built by people who care. Your support strengthens the bonds that hold us together.',
    animals:
      'Every creature deserves compassion and care. Your kindness can give voiceless animals a second chance.',
    environment:
      'Our planet needs champions now more than ever. Your support helps protect the environment for future generations.',
    memorial:
      'Honoring a life well-lived is one of the most meaningful things we can do. Your contribution keeps their legacy alive.',
    sports:
      'Sports teach discipline, teamwork, and resilience. Your support helps athletes chase their dreams.',
    other:
      'Every act of generosity, no matter the size, creates ripples of positive change in the world.',
  };

  const hook = categoryHooks[category];
  const enhancedStory = `${hook}\n\n${title}\n\n${story}\n\nEvery donation, no matter the size, brings us one step closer to our goal. Thank you for being part of this journey.`;

  return enhancedStory;
}

/**
 * Calculate AI-powered donation suggestions based on fundraiser data.
 * Returns 4 suggestion tiers.
 */
export function calculateDonationSuggestions(
  goalAmount: number,
  raisedAmount: number,
  avgDonation: number,
): AIDonationSuggestion[] {
  const remaining = Math.max(goalAmount - raisedAmount, 0);
  const fivePercent = Math.round(remaining * 0.05);
  const roundedAvg = Math.round(avgDonation / 5) * 5 || 25;

  const mostPopular = Math.max(roundedAvg, 10);
  const coverFive = Math.max(fivePercent, 25);
  const makeImpact = Math.max(Math.round(remaining * 0.1), 50);
  const quickSupport = Math.max(Math.round(mostPopular * 0.5), 5);

  return [
    {
      amount: mostPopular,
      label: 'Most Popular',
      reasoning: `This is the average donation amount others have given to this fundraiser.`,
    },
    {
      amount: coverFive,
      label: 'Cover 5%',
      reasoning: `This covers 5% of the remaining $${remaining.toLocaleString()} needed to reach the goal.`,
    },
    {
      amount: makeImpact,
      label: 'Make an Impact',
      reasoning: `This covers 10% of the remaining amount and makes a significant impact toward the goal.`,
    },
    {
      amount: quickSupport,
      label: 'Quick Support',
      reasoning: `A smaller contribution that still makes a meaningful difference.`,
    },
  ];
}

/**
 * Find similar fundraisers based on category matching.
 * Returns up to 3 fundraisers excluding the current one.
 */
export function findSimilarCauses(
  currentId: string,
  category: FundraiserCategory,
  allFundraisers: Fundraiser[],
): Fundraiser[] {
  return allFundraisers
    .filter((f) => f.id !== currentId && f.category === category && f.isActive)
    .sort((a, b) => b.raisedAmount - a.raisedAmount)
    .slice(0, 3);
}
