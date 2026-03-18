import { AIDonationSuggestion, Fundraiser, FundraiserCategory } from '@/data/types';

// ─── Enhancement Configuration ──────────────────────────────

export interface StoryEnhancementConfig {
  /** Tone of the enhanced story */
  tone: 'heartfelt' | 'urgent' | 'hopeful' | 'professional';
  /** What to emphasize in the story */
  focus: ('emotional_hook' | 'specific_impact' | 'urgency' | 'social_proof' | 'transparency')[];
  /** How much to transform (light touch vs full rewrite) */
  intensity: 'light' | 'moderate' | 'full';
}

export const DEFAULT_ENHANCEMENT_CONFIG: StoryEnhancementConfig = {
  tone: 'heartfelt',
  focus: ['emotional_hook', 'specific_impact', 'urgency'],
  intensity: 'moderate',
};

// ─── Tone-specific intros ───────────────────────────────────

const TONE_INTROS: Record<string, Record<FundraiserCategory, string>> = {
  heartfelt: {
    emergency: 'When disaster tore through our community, it did not just destroy buildings — it shattered the sense of safety that every family deserves. But in the rubble, we found something powerful: each other.',
    medical: 'There are moments that change everything. One phone call. One diagnosis. One sentence that splits your life into "before" and "after." This is one of those stories — and it needs your heart.',
    education: 'Imagine a child sitting at a desk, eyes wide with curiosity, ready to learn everything the world has to offer — but the tools just are not there. That is the gap we are determined to close.',
    nonprofit: 'Some problems are too big for any one person to solve alone. But when a community decides to act together, there is no limit to the good we can accomplish.',
    community: 'A neighborhood is more than streets and buildings. It is the connections between people, the shared spaces where life happens, and the collective dream of something better.',
    animals: 'They cannot speak for themselves. They cannot ask for help. But their eyes tell a story that words never could — a story of hope waiting for someone to answer.',
    environment: 'The earth does not send invoices, but the cost of inaction grows every day. This is our chance to invest in the only planet we will ever call home.',
    memorial: 'Some people leave footprints so deep that their absence reshapes the landscape of every life they touched. This is a story about one of those rare, irreplaceable souls.',
    sports: 'Every champion started somewhere. Every gold medal began with a kid who just wanted to play. The only thing standing between these young athletes and their dreams is opportunity.',
    other: 'Sometimes the most extraordinary things grow from the simplest ideas. This is one of those ideas — and it needs people who believe in its potential.',
  },
  urgent: {
    emergency: 'TIME IS CRITICAL. Families are sleeping in their cars tonight. Children are going without meals. The window to help is closing, and every hour that passes makes recovery harder.',
    medical: 'Every day without treatment is a day lost. The clock is ticking, the bills are mounting, and a family is counting on the compassion of strangers to help save someone they love.',
    education: 'Right now, hundreds of students are falling behind — not because they lack ability, but because they lack resources. The achievement gap widens with every passing semester.',
    nonprofit: 'The need has never been greater, and the resources have never been thinner. Without immediate support, vital services that thousands of families depend on will be forced to shut down.',
    community: 'This is not something that can wait. The longer we delay, the more our neighborhood loses. The opportunity is now, and it will not come again.',
    animals: 'Right now, animals are suffering in overcrowded shelters where space has run out and time is up. Without immediate help, the outcome for many of them is devastating.',
    environment: 'The damage is happening now. Not in ten years. Not in five. Every day we wait is a day we cannot get back. This is the moment to act.',
    memorial: 'A family is grieving, bills are piling up, and children need to know their community will not let them fall. There is no time to wait — they need us now.',
    sports: 'Registration deadlines are approaching, equipment is broken, and kids who have been counting the days until the season starts may not get to play. We cannot let that happen.',
    other: 'This project has a deadline and a community counting on it. The support we raise in the next few weeks will determine whether this dream becomes reality or fades away.',
  },
  hopeful: {
    emergency: 'Even in the darkest moments, hope has a way of breaking through. Our community has been knocked down before, and every single time, we have risen stronger. This time will be no different.',
    medical: 'The doctors are optimistic. The family is fighting with everything they have. And with the support of this incredible community, we believe that the best days are still ahead.',
    education: 'Every investment in education is a seed planted for a future we cannot yet imagine. The students we support today will become the leaders, innovators, and changemakers of tomorrow.',
    nonprofit: 'We have already seen the difference this work makes — in the families lifted up, the lives transformed, and the community strengthened. Now imagine what we could do with your help.',
    community: 'Picture a neighborhood where everyone has a place to gather, grow, and belong. That is not just a dream — it is what we are building, one step at a time.',
    animals: 'Every rescue story starts with someone who decided to care. The wagging tails, the purring on a warm lap, the second chance at life — your generosity makes all of it possible.',
    environment: 'A healthier planet starts with local action. Every tree planted, every river cleaned, every solar panel installed is proof that we can build a brighter, cleaner future.',
    memorial: 'Though they are gone, their impact lives on in every life they touched. This fund is not just about remembering — it is about carrying forward the love and purpose they embodied.',
    sports: 'When a kid scores their first goal, finishes their first race, or makes the team for the first time — that moment of joy changes everything. Let us create more of those moments.',
    other: 'The best projects are born from passion and powered by community. Together, we are turning a vision into something real, something lasting, something that will make us all proud.',
  },
  professional: {
    emergency: 'This fundraiser addresses an urgent community need created by recent natural disaster events. Below you will find a detailed breakdown of how funds will be allocated and the measurable impact of each dollar raised.',
    medical: 'This campaign supports comprehensive medical treatment with clearly defined cost structures. We are committed to full transparency in how donations are used and will provide regular progress updates.',
    education: 'This educational initiative targets specific, measurable outcomes for student achievement. The program has been designed with evidence-based methodologies and clear success metrics.',
    nonprofit: 'This nonprofit campaign has a proven track record of effective fund allocation. We operate with full financial transparency and our impact metrics demonstrate consistent results.',
    community: 'This community improvement project has completed all necessary planning, permitting, and feasibility assessments. Every dollar is accounted for in the detailed budget below.',
    animals: 'This animal welfare initiative operates under veterinary oversight with established protocols for care, rehabilitation, and rehoming. Our success rates and cost-per-animal metrics are industry-leading.',
    environment: 'This environmental project is grounded in peer-reviewed science and measurable environmental outcomes. We track and report key metrics including water quality, air quality, and biodiversity indicators.',
    memorial: 'This memorial fund has been established with clearly defined allocation guidelines. All distributions are managed through a trust structure with full accountability to donors.',
    sports: 'This youth athletics program serves a documented need in our community. Registration data, participation metrics, and outcome tracking ensure that every dollar maximizes youth engagement.',
    other: 'This initiative addresses a validated community need with a structured implementation plan. Below you will find our timeline, budget breakdown, and accountability framework.',
  },
};

// ─── Focus-specific enhancements ────────────────────────────

const FOCUS_SECTIONS: Record<string, (story: string, category: FundraiserCategory) => string> = {
  emotional_hook: (story) => {
    return story + '\n\nClose your eyes and imagine being in their shoes. The uncertainty. The fear. The desperate hope that someone, somewhere, will extend a hand. That someone is you.';
  },
  specific_impact: (story, category) => {
    const impacts: Record<FundraiserCategory, string> = {
      emergency: '\n\nHere is exactly what your donation provides:\n• $25 — Emergency supplies for one family for a week\n• $100 — Temporary shelter materials for one household\n• $500 — Full rebuilding materials for one room\n• $1,000 — Complete roof repair for one family',
      medical: '\n\nEvery dollar has a direct impact:\n• $50 — One day of medication costs\n• $200 — One round of diagnostic testing\n• $500 — One week of specialized treatment\n• $1,000 — Critical medical equipment or procedure co-pay',
      education: '\n\nYour investment in education creates measurable change:\n• $25 — School supplies for one student for a semester\n• $100 — One month of tutoring sessions\n• $250 — Technology access for one student for a year\n• $500 — Full scholarship for one semester',
      nonprofit: '\n\nTransparent impact per dollar:\n• $25 — Serves one client for a week\n• $100 — Covers one month of program supplies\n• $500 — Funds one staff training session\n• $1,000 — Expands services to reach 20 additional families',
      community: '\n\nWhat your donation builds:\n• $50 — Plants and soil for one garden bed\n• $200 — Materials for one community project component\n• $500 — Equipment for shared community spaces\n• $1,000 — Infrastructure improvement for the whole neighborhood',
      animals: '\n\nDirect animal impact per dollar:\n• $25 — Food and supplies for one animal for two weeks\n• $75 — Vaccinations and basic medical care\n• $200 — Spay/neuter surgery plus recovery care\n• $500 — Full rehabilitation for one rescued animal',
      environment: '\n\nMeasurable environmental returns:\n• $25 — Plants five native trees\n• $100 — Removes 200 lbs of waste from waterways\n• $500 — Installs one water quality monitoring station\n• $1,000 — Restores one acre of natural habitat',
      memorial: '\n\nHow your contribution honors their memory:\n• $50 — Contributes to the memorial project\n• $200 — Supports the family for one week of expenses\n• $500 — Funds one scholarship in their name\n• $1,000 — Creates a lasting tribute in the community',
      sports: '\n\nEvery dollar keeps kids playing:\n• $25 — Equipment for one young athlete\n• $100 — Registration fees for one child for a full season\n• $250 — New uniforms for an entire team\n• $500 — Facility improvement that benefits all players',
      other: '\n\nYour support creates tangible results:\n• $25 — Supplies for one participant\n• $100 — Materials for one workshop session\n• $500 — Equipment for the entire program\n• $1,000 — Funds expansion to reach more people',
    };
    return story + (impacts[category] || '');
  },
  urgency: (story) => {
    return story + '\n\nTime is of the essence. Every day that passes without full funding means another day that people who are counting on us have to wait. We are so close to making this happen — but we cannot do it without you. Please donate today and share this campaign with everyone you know.';
  },
  social_proof: (story) => {
    return story + '\n\nHundreds of generous donors have already stepped up to support this cause. Join a growing community of people who believe in making a difference. When you donate, you are not just giving money — you are joining a movement of compassion and collective action.';
  },
  transparency: (story) => {
    return story + '\n\nFull Transparency Commitment: We provide detailed updates every two weeks on how funds are being used. Every dollar is tracked and accounted for. Donors receive email updates with photos, receipts, and progress reports. You will always know exactly where your money went and the impact it created.';
  },
};

// ─── Story Enhancement ──────────────────────────────────────

/**
 * Generate a significantly enhanced story with customizable parameters.
 * The enhanced story is longer, better structured, more compelling,
 * and will score higher on the Story Quality metric.
 */
export async function generateEnhancedStory(
  story: string,
  category: FundraiserCategory,
  title: string,
  config: StoryEnhancementConfig = DEFAULT_ENHANCEMENT_CONFIG,
): Promise<string> {
  // Simulate AI processing time (scales with intensity)
  const delay = config.intensity === 'light' ? 1000 : config.intensity === 'moderate' ? 2000 : 3000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  const intro = TONE_INTROS[config.tone]?.[category] || TONE_INTROS['heartfelt'][category];

  let enhanced = '';

  if (config.intensity === 'light') {
    enhanced = `${intro}\n\n${story}\n\nEvery donation, no matter the size, brings us one step closer to our goal. Thank you for being part of this journey.`;
  } else if (config.intensity === 'moderate') {
    enhanced = `${intro}\n\n---\n\n${story}`;

    for (const focus of config.focus) {
      const enhancer = FOCUS_SECTIONS[focus];
      if (enhancer) {
        enhanced = enhancer(enhanced, category);
      }
    }

    enhanced += '\n\n---\n\nThank you for reading our story and for considering a donation. Whether you give $5 or $5,000, you are making a real difference. And if you cannot donate right now, sharing this campaign is just as valuable. Together, we can reach our goal and change lives.';
  } else {
    enhanced = `${intro}\n\n---\n\n${story}`;

    for (const focus of Object.keys(FOCUS_SECTIONS)) {
      const enhancer = FOCUS_SECTIONS[focus];
      if (enhancer) {
        enhanced = enhancer(enhanced, category);
      }
    }

    enhanced += `\n\n---\n\nHow You Can Help\n\nDonate: Every dollar counts. Choose an amount that feels right for you — there is no gift too small.\n\nShare: Share this page on social media, text it to friends, or email it to family. Visibility is one of the most powerful ways to help.\n\nFollow: Follow this campaign for updates and to see the direct impact of your generosity.\n\nThank you for being the kind of person who cares enough to read this far. That already tells us something beautiful about who you are. Now let us turn that compassion into action.`;
  }

  return enhanced;
}

/**
 * Calculate the estimated score improvement from AI enhancement.
 * Returns the estimated new Story Quality score (out of 20).
 */
export function estimateEnhancedScore(
  originalStory: string,
  config: StoryEnhancementConfig = DEFAULT_ENHANCEMENT_CONFIG,
): { originalScore: number; enhancedScore: number; improvement: number } {
  const origWords = originalStory.trim().split(/\s+/).filter(Boolean).length;
  const origParagraphs = originalStory.trim().split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
  const origWordScore = Math.min(Math.round((origWords / 200) * 10), 10);
  const origParaScore = Math.min(Math.round((origParagraphs / 3) * 10), 10);
  const originalScore = origWordScore + origParaScore;

  let estimatedWords = origWords;
  let estimatedParagraphs = origParagraphs;

  // Intro adds ~40-60 words + 1 paragraph
  estimatedWords += 50;
  estimatedParagraphs += 1;

  // Each focus section adds ~30-60 words + 1 paragraph
  const focusCount = config.intensity === 'full' ? 5 : config.focus.length;
  estimatedWords += focusCount * 45;
  estimatedParagraphs += focusCount;

  // Intensity multiplier
  if (config.intensity === 'full') {
    estimatedWords += 150;
    estimatedParagraphs += 3;
  } else if (config.intensity === 'moderate') {
    estimatedWords += 60;
    estimatedParagraphs += 1;
  }

  const enhWordScore = Math.min(Math.round((estimatedWords / 200) * 10), 10);
  const enhParaScore = Math.min(Math.round((estimatedParagraphs / 3) * 10), 10);
  const enhancedScore = enhWordScore + enhParaScore;

  return {
    originalScore,
    enhancedScore: Math.min(enhancedScore, 20),
    improvement: Math.min(enhancedScore, 20) - originalScore,
  };
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
