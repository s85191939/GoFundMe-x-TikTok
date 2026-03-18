import type { Community } from './types';

export const communities: Community[] = [
  {
    id: 'community-1',
    name: 'Watch Duty',
    slug: 'watch-duty',
    bannerImage: 'https://picsum.photos/seed/community-1-banner/1200/400',
    avatarImage: 'https://picsum.photos/seed/community-1-avatar/200/200',
    tagline: 'Stay Informed. Stay Safe. Stay Ready.',
    description:
      'Watch Duty is a community dedicated to wildfire safety awareness and disaster preparedness across the western United States. We connect residents, first responders, and technology innovators who share a common goal: ensuring that no community is caught off guard by a wildfire. Our members support fundraisers for early-warning systems, evacuation infrastructure, firebreak maintenance, and post-fire rebuilding efforts. Together, we have helped fund sensor networks, community alert systems, and emergency supply caches in some of the most fire-prone regions of California, Oregon, and Washington.',
    followerCount: 63,
    totalRaised: 38946,
    totalDonations: 11,
    activeFundraiserCount: 2,
    fundraiserIds: ['fundraiser-1', 'fundraiser-2'],
    memberIds: ['user-1', 'user-2', 'user-6', 'user-7', 'user-8'],
    guidelines: [
      'All fundraisers must be directly related to wildfire safety, disaster preparedness, or post-disaster relief and rebuilding.',
      'Organizers must provide regular updates at least once every two weeks on how funds are being used.',
      'No political campaigning or endorsements. This community is focused on safety, not politics.',
      'Be respectful and supportive in all comments and discussions. We are all here to help.',
      'Fundraisers making false or misleading claims about fire risk or fund usage will be removed immediately.',
    ],
    createdDate: '2024-06-15',
  },
  {
    id: 'community-2',
    name: 'Paws & Claws Rescue',
    slug: 'paws-and-claws-rescue',
    bannerImage: 'https://picsum.photos/seed/community-2-banner/1200/400',
    avatarImage: 'https://picsum.photos/seed/community-2-avatar/200/200',
    tagline: 'Every Animal Deserves a Second Chance.',
    description:
      'Paws & Claws Rescue is a grassroots community of animal lovers, veterinary professionals, and rescue volunteers working together to save the lives of abandoned, abused, and neglected animals in the Pacific Northwest. We organize fundraisers for shelter expansions, medical treatments, spay and neuter programs, and foster care supplies. Since our founding, our members have helped fund the rescue and rehoming of over 3,200 animals. Whether you are a seasoned rescuer or someone who simply loves animals, you are welcome here.',
    followerCount: 128,
    totalRaised: 4742,
    totalDonations: 6,
    activeFundraiserCount: 1,
    fundraiserIds: ['fundraiser-3'],
    memberIds: ['user-3', 'user-7', 'user-9'],
    guidelines: [
      'All fundraisers must support animal welfare, rescue, rehabilitation, or adoption efforts.',
      'No fundraisers for breeders or pet stores. This community supports rescue and adoption only.',
      'Treat every member with kindness and respect. We are united by our love for animals.',
      'Organizers must include clear details about how funds will be allocated and provide photo or video updates when possible.',
      'Report any suspected animal abuse or neglect described in fundraiser stories to the community moderators immediately.',
    ],
    createdDate: '2024-09-22',
  },
  {
    id: 'community-3',
    name: 'Neighbors United',
    slug: 'neighbors-united',
    bannerImage: 'https://picsum.photos/seed/community-3-banner/1200/400',
    avatarImage: 'https://picsum.photos/seed/community-3-avatar/200/200',
    tagline: 'Building Stronger Communities Together.',
    description:
      'Neighbors United is a community of residents, local businesses, and civic leaders who believe that strong neighborhoods start with people helping people. We support fundraisers for community gardens, food banks, clean water access, local infrastructure improvements, and grassroots projects that make our neighborhoods safer, healthier, and more connected. From block parties to building projects, our members prove every day that when neighbors come together, anything is possible.',
    followerCount: 245,
    totalRaised: 21470,
    totalDonations: 12,
    activeFundraiserCount: 3,
    fundraiserIds: ['fundraiser-6', 'fundraiser-9', 'fundraiser-11'],
    memberIds: ['user-1', 'user-2', 'user-4', 'user-6', 'user-7', 'user-10'],
    guidelines: [
      'All fundraisers must benefit the local community directly. National or international causes should seek more appropriate communities.',
      'Organizers must be transparent about fund allocation and provide receipts or progress photos when possible.',
      'Respect your neighbors. Constructive feedback is welcome; personal attacks and negativity are not.',
      'Fundraisers must comply with local regulations and obtain necessary permits before requesting funds for construction or events.',
      'Duplicate fundraisers for the same cause will be consolidated. Contact moderators if you see overlap.',
    ],
    createdDate: '2024-04-10',
  },
  {
    id: 'community-4',
    name: 'Honor & Remember',
    slug: 'honor-and-remember',
    bannerImage: 'https://picsum.photos/seed/community-4-banner/1200/400',
    avatarImage: 'https://picsum.photos/seed/community-4-avatar/200/200',
    tagline: 'Honoring Those Who Served and Sacrificed.',
    description:
      'Honor & Remember is a community dedicated to supporting the families of fallen first responders, military service members, and community heroes. We also champion causes that help veterans transition back to civilian life through housing assistance, job placement, mental health support, and peer mentoring programs. Our members include veterans, Gold Star families, active-duty service members, and civilians who believe that those who serve deserve our unwavering support.',
    followerCount: 189,
    totalRaised: 64000,
    totalDonations: 7,
    activeFundraiserCount: 2,
    fundraiserIds: ['fundraiser-8', 'fundraiser-12'],
    memberIds: ['user-8', 'user-10', 'user-2', 'user-6'],
    guidelines: [
      'All fundraisers must support veterans, active-duty military, first responders, or their families.',
      'Memorial fundraisers must be verified by at least one family member or official department representative.',
      'This is a space for support and healing. Political debates about military policy are not permitted.',
      'Organizers must provide clear breakdowns of how funds will be distributed.',
      'All interactions should reflect the honor and respect that our heroes deserve.',
    ],
    createdDate: '2024-07-04',
  },
  {
    id: 'community-5',
    name: 'Youth Sports Alliance',
    slug: 'youth-sports-alliance',
    bannerImage: 'https://picsum.photos/seed/community-5-banner/1200/400',
    avatarImage: 'https://picsum.photos/seed/community-5-avatar/200/200',
    tagline: 'Every Kid Deserves a Chance to Play.',
    description:
      'Youth Sports Alliance connects parents, coaches, and community members who believe that access to organized sports should not depend on family income. We fund equipment drives, league registration fees, facility improvements, and travel expenses for youth teams that cannot afford them. From soccer to swimming, basketball to baseball, our goal is to keep kids active, healthy, and learning the lifelong lessons that sports teach: teamwork, discipline, resilience, and sportsmanship.',
    followerCount: 97,
    totalRaised: 2100,
    totalDonations: 3,
    activeFundraiserCount: 1,
    fundraiserIds: ['fundraiser-7'],
    memberIds: ['user-6', 'user-7', 'user-9'],
    guidelines: [
      'Fundraisers must support youth athletics for children ages 5 through 18.',
      'All fundraisers must be for nonprofit, community-based sports programs. No fundraisers for private clubs or elite travel teams.',
      'Equipment and funds raised must benefit all participants equally, not individual athletes.',
      'Coaches and organizers must have appropriate background checks and certifications.',
      'Maintain a positive, encouraging tone in all discussions. This is about kids having fun and growing.',
    ],
    createdDate: '2025-01-15',
  },
  {
    id: 'community-6',
    name: 'Creative Futures',
    slug: 'creative-futures',
    bannerImage: 'https://picsum.photos/seed/community-6-banner/1200/400',
    avatarImage: 'https://picsum.photos/seed/community-6-avatar/200/200',
    tagline: 'Fueling Creativity, One Project at a Time.',
    description:
      'Creative Futures is a community of artists, musicians, writers, educators, and art enthusiasts who believe in the transformative power of creative expression. We support fundraisers for arts education programs, community art installations, music therapy initiatives, theater productions, and creative workshops that make the arts accessible to everyone. Whether you are a professional artist or someone who simply believes that creativity makes the world a better place, you belong here.',
    followerCount: 72,
    totalRaised: 4500,
    totalDonations: 3,
    activeFundraiserCount: 1,
    fundraiserIds: ['fundraiser-10'],
    memberIds: ['user-4', 'user-3', 'user-9'],
    guidelines: [
      'All fundraisers must be related to the arts, creativity, or creative education.',
      'Projects must be accessible to the community. Private commissions or personal art sales do not qualify.',
      'Respect artistic expression and diverse creative voices. Constructive critique is welcome; dismissiveness is not.',
      'Fundraisers for performances or exhibitions must be open to the public or serve underserved populations.',
      'Organizers should share their creative work and progress updates to keep the community inspired and engaged.',
    ],
    createdDate: '2025-03-20',
  },
  {
    id: 'community-7',
    name: 'Clean Water Now',
    slug: 'clean-water-now',
    bannerImage: 'https://picsum.photos/seed/community-7-banner/1200/400',
    avatarImage: 'https://picsum.photos/seed/community-7-avatar/200/200',
    tagline: 'Safe Water Is a Human Right.',
    description:
      'Clean Water Now mobilizes volunteers, engineers, and concerned citizens to address water contamination and access issues across America. From rural communities with aging infrastructure to urban neighborhoods dealing with lead pipes, we fund water testing kits, filtration systems, emergency bottled water drives, and long-term infrastructure advocacy. Our members have helped deliver clean water to over 15,000 households since our founding.',
    followerCount: 312,
    totalRaised: 87200,
    totalDonations: 42,
    activeFundraiserCount: 3,
    fundraiserIds: [],
    memberIds: ['user-1', 'user-2', 'user-8'],
    guidelines: [
      'All fundraisers must address water quality, access, or infrastructure issues.',
      'Organizers must provide water testing data or official reports to verify the need.',
      'Funds must be used for direct community benefit — no lobbying or political campaigns.',
      'Regular progress updates with photos or documentation are required.',
      'Be respectful and solution-oriented in all discussions.',
    ],
    createdDate: '2024-02-14',
  },
  {
    id: 'community-8',
    name: 'Second Chance Kitchen',
    slug: 'second-chance-kitchen',
    bannerImage: 'https://picsum.photos/seed/community-8-banner/1200/400',
    avatarImage: 'https://picsum.photos/seed/community-8-avatar/200/200',
    tagline: 'Fighting Hunger One Meal at a Time.',
    description:
      'Second Chance Kitchen is a network of food banks, soup kitchens, community gardens, and meal delivery volunteers working to end food insecurity in American neighborhoods. We fund bulk food purchases, kitchen equipment, refrigerated transport, and nutrition education programs. Our community believes that no one should go to bed hungry, and that sharing a meal is one of the most powerful ways to build connection and dignity.',
    followerCount: 456,
    totalRaised: 124500,
    totalDonations: 89,
    activeFundraiserCount: 4,
    fundraiserIds: [],
    memberIds: ['user-3', 'user-5', 'user-7', 'user-10'],
    guidelines: [
      'All fundraisers must directly address food insecurity, hunger relief, or nutrition education.',
      'Food safety standards must be followed for all meal preparation and distribution efforts.',
      'Organizers must detail how funds will be allocated between food, equipment, and operations.',
      'Volunteers must complete basic food handling training before participating in kitchen events.',
      'Treat every person who receives a meal with dignity and respect.',
    ],
    createdDate: '2024-01-08',
  },
  {
    id: 'community-9',
    name: 'Code for Good',
    slug: 'code-for-good',
    bannerImage: 'https://picsum.photos/seed/community-9-banner/1200/400',
    avatarImage: 'https://picsum.photos/seed/community-9-avatar/200/200',
    tagline: 'Technology That Serves Everyone.',
    description:
      'Code for Good brings together software developers, designers, data scientists, and tech enthusiasts who want to use their skills for social impact. We fund coding bootcamps for underserved youth, open-source tools for nonprofits, digital literacy programs for seniors, and accessibility projects that make technology inclusive. Whether you write code or just believe in tech for good, there is a place for you here.',
    followerCount: 184,
    totalRaised: 34800,
    totalDonations: 27,
    activeFundraiserCount: 2,
    fundraiserIds: [],
    memberIds: ['user-4', 'user-6'],
    guidelines: [
      'All fundraisers must involve technology, digital skills, or tech-enabled social impact.',
      'Open-source projects are strongly encouraged. Proprietary solutions must justify the approach.',
      'Code contributions must follow accessibility best practices (WCAG 2.1 AA minimum).',
      'Organizers must share project repositories or documentation with the community.',
      'Mentorship and knowledge-sharing are core values. Help others learn.',
    ],
    createdDate: '2024-08-12',
  },
  {
    id: 'community-10',
    name: 'Healing Together',
    slug: 'healing-together',
    bannerImage: 'https://picsum.photos/seed/community-10-banner/1200/400',
    avatarImage: 'https://picsum.photos/seed/community-10-avatar/200/200',
    tagline: 'Mental Health Matters. You Are Not Alone.',
    description:
      'Healing Together is a supportive community for mental health advocates, therapists, survivors, and anyone who believes that emotional wellbeing deserves the same attention as physical health. We fund therapy scholarships, crisis hotline support, peer counseling training, and community wellness events. Our members create a safe space where it is okay to not be okay, and where asking for help is a sign of strength.',
    followerCount: 278,
    totalRaised: 56300,
    totalDonations: 38,
    activeFundraiserCount: 2,
    fundraiserIds: [],
    memberIds: ['user-5', 'user-7', 'user-9'],
    guidelines: [
      'All fundraisers must support mental health services, awareness, or education.',
      'This is a judgment-free zone. Stigmatizing language about mental illness is not tolerated.',
      'Fundraisers must be led by licensed professionals or supervised by qualified advisors.',
      'Personal stories shared here are confidential. Do not share outside this community.',
      'If someone expresses crisis, direct them to the 988 Suicide & Crisis Lifeline immediately.',
    ],
    createdDate: '2024-05-01',
  },
  {
    id: 'community-11',
    name: 'Green Wheels',
    slug: 'green-wheels',
    bannerImage: 'https://picsum.photos/seed/community-11-banner/1200/400',
    avatarImage: 'https://picsum.photos/seed/community-11-avatar/200/200',
    tagline: 'Sustainable Transportation for All.',
    description:
      'Green Wheels advocates for bike lanes, public transit improvements, electric vehicle charging stations, and pedestrian-friendly infrastructure. We fund community bike-share programs, safe routes to school projects, EV conversion workshops, and transit equity initiatives. Our members believe that how we move through our cities should be clean, safe, and accessible to everyone regardless of income.',
    followerCount: 143,
    totalRaised: 28700,
    totalDonations: 19,
    activeFundraiserCount: 1,
    fundraiserIds: [],
    memberIds: ['user-1', 'user-6', 'user-8'],
    guidelines: [
      'All fundraisers must relate to sustainable transportation, mobility, or transit equity.',
      'Projects must benefit public access — no funding for personal vehicles.',
      'Safety data and community impact assessments are encouraged for infrastructure projects.',
      'Collaborate with local government where possible to maximize impact.',
      'Keep discussions constructive. Advocate for solutions, not against people.',
    ],
    createdDate: '2024-11-20',
  },
  {
    id: 'community-12',
    name: 'Shelter & Hope',
    slug: 'shelter-and-hope',
    bannerImage: 'https://picsum.photos/seed/community-12-banner/1200/400',
    avatarImage: 'https://picsum.photos/seed/community-12-avatar/200/200',
    tagline: 'Everyone Deserves a Safe Place to Call Home.',
    description:
      'Shelter & Hope is a community of housing advocates, social workers, formerly homeless individuals, and concerned citizens working to address the housing crisis in America. We fund emergency shelter operations, transitional housing programs, rental assistance, and advocacy for affordable housing policy. Our members understand that stable housing is the foundation for health, employment, education, and dignity.',
    followerCount: 367,
    totalRaised: 198400,
    totalDonations: 112,
    activeFundraiserCount: 5,
    fundraiserIds: [],
    memberIds: ['user-2', 'user-5', 'user-8', 'user-10'],
    guidelines: [
      'All fundraisers must address housing insecurity, homelessness, or affordable housing.',
      'Use person-first language. Say "people experiencing homelessness" not "the homeless."',
      'Organizers must partner with established shelters or housing organizations.',
      'Funds must go directly to housing services — no administrative overhead above 15%.',
      'Respect the privacy and dignity of individuals receiving housing assistance.',
    ],
    createdDate: '2024-03-01',
  },
];

// ─── Registry (Map-based for dynamic communities) ───────────

const communityRegistry = new Map<string, Community>();

// Seed the registry with static communities
for (const c of communities) {
  communityRegistry.set(c.id, c);
}

export function getCommunityById(id: string): Community | undefined {
  return communityRegistry.get(id);
}

export function getAllCommunities(): Community[] {
  return Array.from(communityRegistry.values());
}

export function registerCommunity(community: Community): void {
  communityRegistry.set(community.id, community);
}

export function registerCommunities(newCommunities: Community[]): void {
  for (const c of newCommunities) {
    communityRegistry.set(c.id, c);
  }
}

export function getCommunityCount(): number {
  return communityRegistry.size;
}
