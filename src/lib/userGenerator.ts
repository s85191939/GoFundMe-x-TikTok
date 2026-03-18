/**
 * Procedural User Generator
 *
 * Generates realistic user profiles with specific interests,
 * bios aligned to vibe clusters (so recommendation reasons work),
 * and community memberships.
 */

import type { User } from '@/data/types';

// ─── Name Pools ─────────────────────────────────────────────

const FIRST_NAMES = [
  'Sophia', 'Liam', 'Olivia', 'Noah', 'Emma', 'Jackson', 'Ava', 'Aiden',
  'Isabella', 'Lucas', 'Mia', 'Ethan', 'Harper', 'Mason', 'Amelia', 'Logan',
  'Evelyn', 'Alexander', 'Abigail', 'Sebastian', 'Ella', 'Mateo', 'Scarlett',
  'Daniel', 'Grace', 'Henry', 'Chloe', 'Owen', 'Victoria', 'Samuel',
  'Riley', 'Jack', 'Aria', 'Benjamin', 'Luna', 'Leo', 'Zoey', 'Jayden',
  'Nora', 'Carter', 'Lily', 'Julian', 'Hannah', 'Gabriel', 'Layla',
  'Isaac', 'Ellie', 'Lincoln', 'Penelope', 'Ryan', 'Camila', 'Nathan',
  'Aurora', 'Caleb', 'Savannah', 'Adrian', 'Audrey', 'Miles', 'Brooklyn',
  'Dominic', 'Bella', 'Jeremiah', 'Claire', 'Josiah', 'Skylar', 'Andrew',
  'Paisley', 'Thomas', 'Naomi', 'Charles', 'Eliana', 'Christopher', 'Elena',
  'Ezra', 'Aaliyah', 'Colton', 'Maya', 'Maverick', 'Madeline', 'Ryder',
  'Stella', 'Cooper', 'Hazel', 'Roman', 'Aurora', 'Kai', 'Violet', 'Axel',
  'Willow', 'Brooks', 'Emilia', 'Jaxon', 'Ivy', 'Asher', 'Kinsley',
  'Derek', 'Priya', 'Tariq', 'Mei', 'Deshawn', 'Fatima',
];

const LAST_NAMES = [
  'Anderson', 'Williams', 'Martinez', 'Thompson', 'Garcia', 'Robinson',
  'Clark', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'King',
  'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green',
  'Adams', 'Nelson', 'Baker', 'Gonzalez', 'Carter', 'Mitchell', 'Perez',
  'Roberts', 'Campbell', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
  'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales',
  'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper',
  'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim',
  'Cox', 'Ward', 'Richardson', 'Watson', 'Brooks', 'Chavez', 'Wood',
  'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes', 'Price',
  'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers', 'Long', 'Ross',
  'Foster', 'Jimenez', 'Powell',
];

const LOCATIONS = [
  'Los Angeles, CA', 'New York, NY', 'Chicago, IL', 'Houston, TX',
  'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA',
  'Dallas, TX', 'San Jose, CA', 'Austin, TX', 'Jacksonville, FL',
  'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC', 'Indianapolis, IN',
  'San Francisco, CA', 'Seattle, WA', 'Denver, CO', 'Nashville, TN',
  'Portland, OR', 'Oklahoma City, OK', 'Las Vegas, NV', 'Memphis, TN',
  'Louisville, KY', 'Baltimore, MD', 'Milwaukee, WI', 'Albuquerque, NM',
  'Tucson, AZ', 'Fresno, CA', 'Mesa, AZ', 'Sacramento, CA',
  'Atlanta, GA', 'Kansas City, MO', 'Omaha, NE', 'Miami, FL',
  'Raleigh, NC', 'Minneapolis, MN', 'Tampa, FL', 'New Orleans, LA',
  'Cleveland, OH', 'Pittsburgh, PA', 'Boise, ID', 'Honolulu, HI',
  'Salt Lake City, UT', 'Richmond, VA', 'St. Louis, MO', 'Birmingham, AL',
  'Spokane, WA', 'Madison, WI',
];

// ─── Interest/Vibe Profiles ─────────────────────────────────
// Each profile has a vibe cluster name, bio templates, and related categories

interface VibeProfile {
  vibe: string;
  bios: string[];
  categories: string[];
  communityAffinities: string[]; // community IDs this vibe maps to
}

const VIBE_PROFILES: VibeProfile[] = [
  {
    vibe: 'environmentalist',
    bios: [
      'Environmental scientist passionate about wildfire safety and clean air.',
      'Climate activist working to build resilient communities against natural disasters.',
      'Conservation biologist dedicated to protecting western forests and waterways.',
      'Sustainability consultant helping communities reduce their carbon footprint.',
      'Former park ranger now advocating for fire prevention and forest restoration.',
      'Renewable energy engineer building a cleaner future one solar panel at a time.',
      'Marine biologist working on ocean conservation and plastic pollution cleanup.',
      'Environmental educator teaching kids about nature, sustainability, and climate action.',
    ],
    categories: ['environment', 'emergency', 'community'],
    communityAffinities: ['community-1', 'community-3'],
  },
  {
    vibe: 'animal_lover',
    bios: [
      'Veterinary technician and lifelong animal lover. Every pet deserves a home.',
      'Dog rescue volunteer with three adopted pups and a soft spot for strays.',
      'Cat lover and TNR advocate. Helped rehome over 200 cats in the last two years.',
      'Wildlife rehabilitator caring for injured birds and small mammals.',
      'Animal shelter coordinator working to achieve no-kill status in our county.',
      'Passionate about animal welfare and fostering dogs awaiting adoption.',
      'Equine therapist using horses to help children with emotional challenges.',
      'Pet nutritionist committed to helping shelter animals thrive in foster care.',
    ],
    categories: ['animals', 'community'],
    communityAffinities: ['community-2'],
  },
  {
    vibe: 'educator',
    bios: [
      'Retired teacher turned education advocate. Every child deserves quality learning.',
      'STEM tutor helping underserved students discover their potential in math and science.',
      'School counselor fighting for mental health resources in public schools.',
      'Literacy volunteer teaching adults to read. Education has no age limit.',
      'After-school program director keeping kids engaged through music and art.',
      'Former principal now running scholarship programs for first-generation students.',
      'ESL teacher helping immigrant families navigate the education system.',
      'Special education advocate ensuring every child gets the support they need.',
    ],
    categories: ['education', 'community', 'other'],
    communityAffinities: ['community-6', 'community-3'],
  },
  {
    vibe: 'community_builder',
    bios: [
      'Community organizer building stronger neighborhoods one project at a time.',
      'Food bank volunteer and local garden enthusiast. Growing food, growing community.',
      'Block captain passionate about neighborhood safety and community events.',
      'Small business owner who believes strong communities build strong economies.',
      'Habitat for Humanity volunteer helping families achieve the dream of homeownership.',
      'Community center director creating safe spaces for families and youth.',
      'Neighborhood association president focused on park improvements and public safety.',
      'Local food activist running a weekly farmers market in an underserved area.',
    ],
    categories: ['community', 'nonprofit', 'emergency'],
    communityAffinities: ['community-3', 'community-4'],
  },
  {
    vibe: 'humanitarian',
    bios: [
      'Disaster relief coordinator responding to hurricanes, floods, and wildfires.',
      'Former Red Cross volunteer with 10+ years of emergency response experience.',
      'Crisis counselor helping families rebuild after catastrophic events.',
      'Emergency preparedness specialist training communities for natural disasters.',
      'Humanitarian aid worker focused on post-disaster housing and infrastructure.',
      'Search and rescue volunteer dedicated to saving lives when disaster strikes.',
      'Emergency medical technician who has seen firsthand the impact of community support.',
      'Flood relief organizer working to protect vulnerable coastal communities.',
    ],
    categories: ['emergency', 'community', 'nonprofit'],
    communityAffinities: ['community-1', 'community-3'],
  },
  {
    vibe: 'health_advocate',
    bios: [
      'Nurse practitioner advocating for affordable healthcare access for all.',
      'Cancer survivor turned fundraiser. Helping others navigate the fight of their lives.',
      'Pediatric nurse who has seen the power of community support for sick children.',
      'Mental health therapist working to destigmatize seeking help in rural communities.',
      'Physical therapist helping injured veterans regain mobility and independence.',
      'Public health researcher focused on reducing health disparities in low-income areas.',
      'Hospital social worker connecting families with financial resources during medical crises.',
      'Midwife and maternal health advocate working for safer births in underserved communities.',
    ],
    categories: ['medical', 'nonprofit', 'community'],
    communityAffinities: ['community-3', 'community-4'],
  },
  {
    vibe: 'veteran_supporter',
    bios: [
      'Army veteran supporting fellow service members through their civilian transition.',
      'Gold Star wife raising awareness for military family support programs.',
      'Former firefighter and first responder advocate for PTSD resources.',
      'Marine Corps veteran mentoring young vets through job placement and life skills.',
      'Military spouse network leader connecting families for mutual support.',
      'Police officer dedicated to community policing and youth mentorship programs.',
      'National Guard member volunteering with veteran housing assistance programs.',
      'Retired Navy chief running a nonprofit for veteran mental health services.',
    ],
    categories: ['memorial', 'nonprofit', 'community'],
    communityAffinities: ['community-4'],
  },
  {
    vibe: 'philanthropist',
    bios: [
      'Tech professional who believes in giving back. Small donations change lives.',
      'Serial donor supporting causes from education to emergency relief.',
      'Philanthropy advisor helping individuals maximize their charitable impact.',
      'Corporate giving coordinator matching employee donations to local causes.',
      'Monthly donor to six different nonprofits. Every dollar counts.',
      'Estate planning attorney helping clients build charitable legacies.',
      'Social impact investor putting money where it matters most.',
      'Crowdfunding enthusiast who has backed over 50 campaigns in the last year.',
    ],
    categories: ['nonprofit', 'education', 'medical'],
    communityAffinities: ['community-3', 'community-6'],
  },
  {
    vibe: 'arts_culture',
    bios: [
      'Muralist and community art instructor bringing color to public spaces.',
      'Music teacher keeping arts education alive in underfunded schools.',
      'Theater director running free community productions for families.',
      'Photographer documenting local communities and the people who make them special.',
      'Dance teacher providing free classes to underserved youth in our city.',
      'Poet and creative writing workshop leader helping kids find their voice.',
      'Gallery owner curating shows that spotlight emerging local artists.',
      'Art therapist using creative expression to help trauma survivors heal.',
    ],
    categories: ['other', 'education', 'community'],
    communityAffinities: ['community-6'],
  },
  {
    vibe: 'sports_fitness',
    bios: [
      'Youth soccer coach building character through sports. Every kid deserves to play.',
      'Former college athlete running free basketball clinics in the community.',
      'Swim instructor providing free water safety lessons to underserved children.',
      'High school wrestling coach and mentor. Sports teach discipline and resilience.',
      'Marathon runner raising money for charity with every mile.',
      'Little League organizer ensuring no child is turned away due to cost.',
      'Adaptive sports coach helping athletes with disabilities compete and thrive.',
      'Personal trainer offering free fitness classes at the community center.',
    ],
    categories: ['sports', 'community', 'education'],
    communityAffinities: ['community-5'],
  },
];

// ─── Seeded PRNG ────────────────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function pickN<T>(arr: T[], n: number, rand: () => number): T[] {
  const shuffled = [...arr].sort(() => rand() - 0.5);
  return shuffled.slice(0, n);
}

// ─── Generator ──────────────────────────────────────────────

let generatedCount = 0;

/**
 * Generate `count` unique user profiles with specific interests
 * aligned to vibe clusters for recommendation scoring.
 */
export function generateUsers(count: number, seed?: number): User[] {
  const rand = seededRandom(seed ?? Date.now() + generatedCount);
  const users: User[] = [];

  for (let i = 0; i < count; i++) {
    generatedCount++;
    const id = `gen-user-${generatedCount}`;

    const firstName = pick(FIRST_NAMES, rand);
    const lastName = pick(LAST_NAMES, rand);
    const name = `${firstName} ${lastName}`;
    const location = pick(LOCATIONS, rand);

    // Pick a primary vibe profile (determines bio + interests)
    const profile = pick(VIBE_PROFILES, rand);
    const bio = pick(profile.bios, rand);

    // Assign 0-2 community memberships aligned to vibe
    const numCommunities = Math.floor(rand() * 3); // 0, 1, or 2
    const communityIds = pickN(profile.communityAffinities, numCommunities, rand);

    // ~25% chance of being verified
    const isVerified = rand() < 0.25;

    // Realistic follower/following counts
    const followerCount = Math.floor(rand() * 800) + 10;
    const followingCount = Math.floor(rand() * 300) + 5;

    // Join date in 2024-2025 range
    const year = rand() < 0.4 ? 2024 : 2025;
    const month = Math.floor(rand() * 12) + 1;
    const day = Math.floor(rand() * 28) + 1;
    const joinedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    users.push({
      id,
      name,
      avatar: `https://picsum.photos/seed/${id}/200/200`,
      bio,
      location,
      joinedDate,
      followerCount,
      followingCount,
      isVerified,
      fundraiserIds: [],
      communityIds,
    });
  }

  return users;
}

/**
 * Reset the generation counter (useful for testing).
 */
export function resetGeneratorCount(): void {
  generatedCount = 0;
}
