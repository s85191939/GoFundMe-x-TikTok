/**
 * Mass Content Generator
 *
 * Generates 1000s of fundraisers and 100s of communities with
 * realistic titles, stories, financials, and cross-references.
 */

import type { Fundraiser, FundraiserCategory, Community } from '@/data/types';

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
  return shuffled.slice(0, Math.min(n, arr.length));
}

// ─── Name / Location Pools ──────────────────────────────────

const FIRST_NAMES = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Elijah', 'Sophia', 'James',
  'Isabella', 'Mason', 'Mia', 'Logan', 'Harper', 'Aiden', 'Amelia', 'Lucas',
  'Evelyn', 'Benjamin', 'Abigail', 'Jackson', 'Luna', 'Sebastian', 'Ella',
  'Mateo', 'Elizabeth', 'Henry', 'Camila', 'Alexander', 'Gianna', 'Daniel',
];

const CITIES = [
  'Portland', 'Seattle', 'San Francisco', 'Los Angeles', 'San Diego', 'Phoenix',
  'Denver', 'Austin', 'Dallas', 'Houston', 'Chicago', 'Nashville', 'Atlanta',
  'Miami', 'Charlotte', 'Raleigh', 'New York', 'Philadelphia', 'Boston',
  'Minneapolis', 'Detroit', 'Cleveland', 'Pittsburgh', 'Columbus', 'Indianapolis',
  'St. Louis', 'Kansas City', 'Omaha', 'Salt Lake City', 'Las Vegas',
  'Sacramento', 'Tampa', 'Orlando', 'Jacksonville', 'Memphis', 'Louisville',
  'Richmond', 'Baltimore', 'New Orleans', 'Milwaukee', 'San Jose', 'Oakland',
  'Tucson', 'Albuquerque', 'Boise', 'Spokane', 'Fresno', 'Honolulu',
];

const STATES: Record<string, string> = {
  'Portland': 'OR', 'Seattle': 'WA', 'San Francisco': 'CA', 'Los Angeles': 'CA',
  'San Diego': 'CA', 'Phoenix': 'AZ', 'Denver': 'CO', 'Austin': 'TX',
  'Dallas': 'TX', 'Houston': 'TX', 'Chicago': 'IL', 'Nashville': 'TN',
  'Atlanta': 'GA', 'Miami': 'FL', 'Charlotte': 'NC', 'Raleigh': 'NC',
  'New York': 'NY', 'Philadelphia': 'PA', 'Boston': 'MA', 'Minneapolis': 'MN',
  'Detroit': 'MI', 'Cleveland': 'OH', 'Pittsburgh': 'PA', 'Columbus': 'OH',
  'Indianapolis': 'IN', 'St. Louis': 'MO', 'Kansas City': 'MO', 'Omaha': 'NE',
  'Salt Lake City': 'UT', 'Las Vegas': 'NV', 'Sacramento': 'CA', 'Tampa': 'FL',
  'Orlando': 'FL', 'Jacksonville': 'FL', 'Memphis': 'TN', 'Louisville': 'KY',
  'Richmond': 'VA', 'Baltimore': 'MD', 'New Orleans': 'LA', 'Milwaukee': 'WI',
  'San Jose': 'CA', 'Oakland': 'CA', 'Tucson': 'AZ', 'Albuquerque': 'NM',
  'Boise': 'ID', 'Spokane': 'WA', 'Fresno': 'CA', 'Honolulu': 'HI',
};

function cityState(city: string): string {
  return `${city}, ${STATES[city] || 'CA'}`;
}

// ─── Fundraiser Title Templates ─────────────────────────────

const TITLE_TEMPLATES: Record<FundraiserCategory, string[]> = {
  emergency: [
    'Hurricane Relief for {city} Families',
    '{city} Wildfire Evacuation Fund',
    'Flood Recovery — {city} Neighborhood',
    'Tornado Damage Repair in {city}',
    'Emergency Housing After {city} Fire',
    'Storm Damage Relief for {city}',
    '{city} Earthquake Recovery Fund',
    'Disaster Preparedness Kit Drive — {city}',
    'Emergency Medical Aid for {city} Victims',
    '{city} Community Emergency Response Fund',
    'Winter Storm Relief for {city} Residents',
    'Power Outage Recovery Aid — {city}',
    '{city} Mudslide Relief and Rebuilding',
    'Help {city} Families After Devastating Flood',
    'Emergency Shelter for {city} Displaced Families',
    'Rebuild {city} After Category 4 Hurricane',
    'Flash Flood Emergency Aid — {city} County',
    '{city} Heatwave Emergency Cooling Centers',
    'Search and Rescue Support — {city} Disaster',
    'Emergency Water Supply for {city} After Pipe Burst',
  ],
  medical: [
    "Help {name} Beat Cancer",
    "{name}'s Fight Against Leukemia",
    "Surgery Fund for {name}",
    "Help {name} Cover Medical Bills",
    "{name} Needs a Life-Saving Transplant",
    "Chemotherapy Fund for {name}",
    "{name}'s Recovery After Car Accident",
    "Help {name} Get a Wheelchair",
    "Mental Health Treatment for {name}",
    "{name}'s Dialysis Treatment Fund",
    "Prosthetic Leg for {name}",
    "Heart Surgery for Baby {name}",
    "{name}'s Autism Therapy Fund",
    "Rare Disease Treatment for {name}",
    "Help {name} Access Insulin",
    "{name} Needs Emergency Brain Surgery",
    "Burn Recovery Treatment for {name}",
    "Physical Therapy Fund for {name}",
    "{name}'s NICU Medical Bills",
    "Spinal Cord Injury Recovery — {name}",
  ],
  education: [
    'Send {name} to College',
    'STEM Lab for {city} Elementary',
    'Scholarship Fund for {city} Students',
    'Books and Supplies for {city} Kids',
    'After-School Tutoring in {city}',
    '{city} School Technology Upgrade',
    'Music Instruments for {city} School',
    'Special Education Resources — {city}',
    'Coding Bootcamp Scholarships — {city}',
    'ESL Classes for {city} Immigrant Families',
    'Free GED Prep Program — {city}',
    '{city} Literacy Drive for Adults',
    'STEM Robotics Club — {city} Middle School',
    'College Prep Program for {city} Youth',
    'Library Renovation for {city} High School',
    'Art Supplies for {city} Elementary',
    'Teacher Appreciation Fund — {city}',
    'Summer School Program for {city} Kids',
    '{city} Student Laptop Drive',
    'Montessori Scholarships for {city}',
  ],
  nonprofit: [
    '{city} Clean Water Project',
    'Homeless Shelter Expansion — {city}',
    '{city} Youth Mentorship Program',
    'Free Legal Aid — {city}',
    'Senior Care Program for {city}',
    '{city} Nonprofit Annual Drive',
    'Meals on Wheels — {city} Chapter',
    '{city} Job Training Center',
    'Mental Health Hotline — {city}',
    'Immigrant Services in {city}',
    '{city} Domestic Violence Safe House',
    'Free Clinic Expansion — {city}',
    'Substance Abuse Recovery — {city}',
    'Housing First Program — {city}',
    'Disability Services Center — {city}',
    '{city} Prison Reentry Support',
    'Financial Literacy Workshop — {city}',
    'Free Dental Clinic — {city}',
    '{city} Hunger Relief Network',
    'Refugee Resettlement in {city}',
  ],
  community: [
    '{city} Community Garden Project',
    'Build a Playground in {city}',
    '{city} Neighborhood Beautification',
    'Food Pantry for {city} Families',
    '{city} Block Party Fund',
    'Farmers Market Stand for {city}',
    '{city} Dog Park Construction',
    'Community Center Renovation — {city}',
    '{city} Public Mural Project',
    'Sidewalk Repair Drive — {city}',
    '{city} Neighborhood Watch Program',
    'Community Kitchen — {city}',
    'Street Light Campaign — {city}',
    '{city} Free WiFi Zones',
    'Tool Library for {city}',
    '{city} Little Free Library Network',
    'Bike Repair Station — {city}',
    '{city} Community Fridge Project',
    'Baby Supplies Exchange — {city}',
    'Neighbor-to-Neighbor Aid — {city}',
  ],
  animals: [
    'Save {city} Animal Shelter',
    'Rescue Dogs of {city}',
    '{city} Cat TNR Program',
    'Wildlife Rehabilitation — {city}',
    '{city} Horse Rescue Fund',
    'Spay/Neuter Drive — {city}',
    '{city} Foster Care for Puppies',
    'Emergency Vet Bills for Strays — {city}',
    'Senior Pet Sanctuary — {city}',
    '{city} Exotic Animal Rescue',
    'Barn Cat Rescue — {city} County',
    '{city} Marine Animal Rehab',
    'Service Dog Training Fund — {city}',
    '{city} Animal Cruelty Prevention',
    'Therapy Animals for {city} Hospitals',
    'Feral Cat Colony Care — {city}',
    '{city} Pet Food Bank',
    'Emergency Animal Evacuation Kit — {city}',
    '{city} Parrot Rescue Network',
    'Rabbit Rescue and Rehoming — {city}',
  ],
  environment: [
    '{city} River Cleanup Project',
    'Solar Panels for {city} Schools',
    '{city} Urban Tree Planting',
    'Beach Cleanup — {city} Coast',
    'Community Composting in {city}',
    '{city} Air Quality Monitors',
    'Wetland Restoration — {city}',
    '{city} Recycling Education Drive',
    'Rain Garden Installation — {city}',
    'EV Charging Stations for {city}',
    'Pollinator Garden — {city} Park',
    '{city} Watershed Protection Fund',
    'Ocean Plastic Removal — {city}',
    '{city} Green Roof Initiative',
    'Native Plant Restoration — {city}',
    'Microplastic Research — {city} Harbor',
    '{city} Community Solar Farm',
    'Trail Restoration — {city} Mountains',
    'Noise Pollution Study — {city}',
    'Lead Pipe Replacement — {city}',
  ],
  memorial: [
    'In Memory of {name}',
    "Memorial Fund for {name}'s Family",
    '{name} Memorial Scholarship',
    'Honoring {name} — Family Support',
    '{name} Memorial Playground',
    'Celebration of Life — {name}',
    '{name} Memorial Bench at {city} Park',
    'Legacy Fund in Honor of {name}',
    '{name} Memorial Garden',
    'Tribute to {name} — Community Fund',
    'Officer {name} Memorial Fund',
    'Firefighter {name} Family Support',
    '{name} Memorial Music Scholarship',
    'Coach {name} Youth Fund',
    'Teacher {name} Memorial Library',
    'Nurse {name} Healthcare Fund',
    '{name} Memorial Art Installation',
    'In Loving Memory of {name}',
    '{name} Memorial 5K Run Fund',
    'Veteran {name} Family Aid',
  ],
  sports: [
    '{city} Youth Soccer League Fund',
    'Basketball Courts for {city}',
    '{city} Little League Equipment',
    'Swimming Lessons for {city} Kids',
    'Track and Field — {city} Youth',
    '{city} Girls Volleyball Team',
    'Adaptive Sports Program — {city}',
    '{city} Youth Wrestling Club',
    'Tennis Courts Renovation — {city}',
    '{city} Community Pool Repair',
    'Martial Arts Program — {city}',
    '{city} Running Club for Teens',
    'Lacrosse Equipment — {city}',
    '{city} Figure Skating Fund',
    'Gymnastics Scholarships — {city}',
    '{city} Youth Hockey League',
    'Rowing Club Equipment — {city}',
    '{city} Youth Flag Football',
    'Skateboard Park — {city}',
    '{city} Youth Cycling Team',
  ],
  other: [
    '{city} Arts Festival Fund',
    'Music Instruments for {city} Band',
    'Community Theater in {city}',
    '{city} Film Festival Support',
    'Podcast Studio for {city} Youth',
    '{city} Street Art Festival',
    'Photography Workshop — {city}',
    'Dance Recital Fund — {city}',
    '{city} Writers Workshop',
    'Pottery Studio for {city}',
    'Comedy Night Fundraiser — {city}',
    '{city} Jazz Festival Fund',
    'Documentary Film — {city} Stories',
    'Maker Space for {city} Teens',
    'Fashion Design Program — {city}',
    '{city} Craft Fair Organization',
    'Animation Workshop — {city}',
    'Culinary Arts Camp — {city}',
    '{city} Open Mic Night Series',
    'Digital Art Lab — {city}',
  ],
};

// ─── Story Templates ────────────────────────────────────────

const STORY_TEMPLATES: Record<FundraiserCategory, string[]> = {
  emergency: [
    'Our community was devastated by a recent natural disaster. Hundreds of families have been displaced and need immediate assistance with housing, food, and essential supplies. Every dollar goes directly to relief efforts on the ground.',
    'When disaster struck our neighborhood, we lost so much. But the spirit of this community is unbreakable. We are coming together to rebuild homes, restore infrastructure, and support the families hardest hit by the devastation.',
    'The recent storm left a path of destruction across our area. Many families are without power, clean water, or safe shelter. This fund provides emergency resources to those who need it most while long-term recovery efforts get underway.',
    'In the aftermath of this emergency, our volunteers have been working around the clock to distribute supplies, coordinate shelter, and provide hot meals. Your donation keeps these efforts running and helps us reach more people.',
  ],
  medical: [
    'Our family is facing the biggest challenge of our lives. The medical bills are mounting, and insurance only covers a fraction of the treatment costs. Every donation helps us focus on healing instead of worrying about finances.',
    'After a sudden diagnosis, everything changed. The treatment plan is long and expensive, but the doctors are optimistic. We just need help covering the costs so we can focus on getting better.',
    'The unexpected medical emergency has turned our world upside down. Between hospital stays, medications, and rehabilitation, the costs have become overwhelming. We are grateful for any support our community can provide.',
    'Fighting this illness requires the best care available, and that comes with a price tag our family simply cannot bear alone. Your generosity gives us hope and the resources to keep fighting.',
  ],
  education: [
    'Every child deserves access to quality education regardless of their family background. This program provides essential resources, tutoring, and mentorship to students who otherwise would fall through the cracks.',
    'When schools face budget cuts, it is the students who suffer most. This fund bridges the gap, providing supplies, technology, and enrichment programs that keep kids engaged and learning.',
    'Education is the great equalizer. With your support, we can give more students the tools they need to succeed academically, gain admission to college, and build the future they deserve.',
    'Our community has brilliant young minds that just need a chance. This program provides scholarships, mentoring, and hands-on learning experiences that transform potential into achievement.',
  ],
  nonprofit: [
    'For years, our organization has been serving the most vulnerable members of our community. As demand for our services grows, we need your help to expand our programs and reach more people in need.',
    'Our nonprofit has a proven track record of making a real difference. With additional funding, we can scale our impact, hire dedicated staff, and serve hundreds more families each year.',
    'This initiative addresses a critical need in our community that no one else is filling. Your support helps us maintain essential services and develop new programs that create lasting positive change.',
    'We believe that no one should be left behind. Our organization provides vital support services to those facing hardship, and every donation directly funds the people and programs that make it possible.',
  ],
  community: [
    'Strong communities are built by neighbors helping neighbors. This project brings people together to create something lasting that benefits everyone who lives here.',
    'Our neighborhood has been dreaming about this project for years. Now we finally have the opportunity to make it happen. With community support, we can build something we will all be proud of.',
    'When communities invest in shared spaces and resources, everyone benefits. This project creates opportunities for connection, recreation, and mutual support that will serve our neighborhood for generations.',
    'This is more than just a project. It is a statement that our community cares about each other. Every contribution brings us closer to creating a space where all neighbors feel welcome and supported.',
  ],
  animals: [
    'Every animal deserves a chance at a happy, healthy life. Our rescue takes in abandoned, abused, and neglected animals and gives them the medical care, love, and forever homes they deserve.',
    'The number of animals in need far exceeds our current capacity. With your help, we can expand our facility, provide more medical care, and save more lives. No animal should be turned away.',
    'Our shelter operates on a shoestring budget and the generosity of volunteers. To continue our mission of rescuing and rehoming animals, we need community support for food, medical supplies, and facility maintenance.',
    'These animals have been through so much already. Your donation provides them with safe shelter, nutritious food, veterinary care, and the chance to find a loving family who will never let them down.',
  ],
  environment: [
    'Protecting our environment is not just about the future. It is about the health and wellbeing of our community right now. This project addresses urgent environmental issues in our area with practical, measurable solutions.',
    'Our local ecosystem needs our help. Through conservation, restoration, and community education, we can reverse the damage and create a healthier, more sustainable environment for everyone.',
    'Climate change is affecting our community in real and visible ways. This initiative takes direct action to reduce our environmental impact and build resilience for the challenges ahead.',
    'A cleaner, greener community starts with projects like this one. Your support funds the tools, materials, and expertise needed to make a measurable difference in our local environment.',
  ],
  memorial: [
    'We lost someone who meant the world to this community. This fund honors their memory by supporting the causes they cared about most and helping their family through an incredibly difficult time.',
    'Their life was a gift to everyone who knew them. This memorial fund ensures their legacy lives on through programs, scholarships, and community projects that reflect who they were and what they stood for.',
    'No amount of money can replace what we have lost. But this fund can provide comfort to the family, support the community, and create something beautiful in memory of someone truly extraordinary.',
    'They touched so many lives in so many ways. This fund is our way of giving back, of honoring their memory, and of making sure their family knows they are not alone.',
  ],
  sports: [
    'Every kid deserves the chance to play sports, regardless of their family income. This program removes financial barriers so that all children in our community can experience the joy, teamwork, and discipline that athletics provide.',
    'Our youth sports program has been building character and keeping kids active for years. With new equipment, better facilities, and expanded access, we can serve even more young athletes.',
    'Sports teach kids lessons they carry for a lifetime: perseverance, teamwork, and the confidence that comes from pushing past their limits. Your donation helps us give more kids that opportunity.',
    'The fields are worn out and the equipment is falling apart, but the kids keep showing up because they love to play. Help us give them the facilities and gear they deserve.',
  ],
  other: [
    'Creativity enriches our community in ways that are hard to measure but impossible to miss. This project brings the arts to people who might not otherwise have access, sparking imagination and connection.',
    'Art, music, and creative expression are not luxuries. They are essential to a thriving community. This program makes the arts accessible to everyone, regardless of age, background, or ability.',
    'When people come together to create, amazing things happen. This project provides the space, materials, and instruction needed to unlock the creative potential in our community.',
    'Our community is full of talented people who just need a platform. This initiative creates opportunities for artists, musicians, writers, and makers to share their gifts with the world.',
  ],
};

// ─── Tags per Category ──────────────────────────────────────

const TAGS: Record<FundraiserCategory, string[]> = {
  emergency: ['disaster-relief', 'emergency', 'rebuilding', 'hurricane', 'wildfire', 'flood', 'tornado', 'evacuation', 'housing', 'shelter', 'recovery', 'storm-damage'],
  medical: ['medical', 'cancer', 'surgery', 'treatment', 'hospital-bills', 'chemotherapy', 'transplant', 'rehabilitation', 'therapy', 'mental-health', 'recovery', 'healthcare'],
  education: ['education', 'scholarships', 'tutoring', 'school-supplies', 'STEM', 'literacy', 'coding', 'college-prep', 'after-school', 'youth', 'technology', 'teachers'],
  nonprofit: ['nonprofit', 'charity', 'social-services', 'community-aid', 'volunteer', 'outreach', 'advocacy', 'fundraising', 'support-services', 'annual-drive'],
  community: ['community', 'neighborhood', 'garden', 'playground', 'food-bank', 'beautification', 'local', 'families', 'public-space', 'volunteer', 'infrastructure'],
  animals: ['animal-rescue', 'shelter', 'dogs', 'cats', 'adoption', 'spay-neuter', 'wildlife', 'veterinary', 'foster-care', 'pet-food', 'sanctuary'],
  environment: ['environment', 'conservation', 'clean-water', 'sustainability', 'solar', 'tree-planting', 'cleanup', 'pollution', 'green-energy', 'recycling', 'restoration'],
  memorial: ['memorial', 'tribute', 'family-support', 'legacy', 'scholarship', 'honor', 'remembrance', 'funeral', 'celebration-of-life'],
  sports: ['sports', 'youth', 'equipment', 'league', 'coaching', 'fitness', 'recreation', 'athletics', 'team-sports', 'scholarships', 'accessibility'],
  other: ['arts', 'music', 'theater', 'creative', 'workshop', 'festival', 'culture', 'photography', 'dance', 'film', 'maker-space'],
};

// ─── Beneficiary Types per Category ─────────────────────────

const BENEFICIARY_TYPES: Record<FundraiserCategory, Array<'individual' | 'charity' | 'nonprofit'>> = {
  emergency: ['charity', 'nonprofit', 'individual'],
  medical: ['individual', 'individual', 'individual', 'charity'],
  education: ['nonprofit', 'charity', 'nonprofit'],
  nonprofit: ['nonprofit', 'charity'],
  community: ['nonprofit', 'charity', 'nonprofit'],
  animals: ['nonprofit', 'charity'],
  environment: ['nonprofit', 'charity', 'nonprofit'],
  memorial: ['individual', 'individual', 'nonprofit'],
  sports: ['nonprofit', 'charity', 'nonprofit'],
  other: ['nonprofit', 'charity', 'nonprofit'],
};

// ─── Community Name Templates ───────────────────────────────

interface CommunityTheme {
  nameTemplates: string[];
  taglines: string[];
  descriptions: string[];
  relatedCategories: FundraiserCategory[];
  guidelines: string[];
}

const COMMUNITY_THEMES: CommunityTheme[] = [
  {
    nameTemplates: ['{city} Fire Safety Network', '{city} Disaster Preparedness Alliance', '{city} Emergency Response Coalition', 'Wildfire Watch — {city}', '{city} Storm Ready Initiative'],
    taglines: ['Prepared Today, Protected Tomorrow.', 'Community Safety Is Everyone\'s Job.', 'When Disaster Strikes, We Strike Back.', 'Ready. Resilient. Together.'],
    descriptions: [
      'A community dedicated to disaster preparedness, emergency response, and post-disaster recovery in the {city} metropolitan area. We organize fundraisers, coordinate volunteer efforts, and provide resources to keep our neighbors safe.',
    ],
    relatedCategories: ['emergency', 'environment', 'community'],
    guidelines: ['All fundraisers must relate to disaster preparedness or relief.', 'Organizers must provide regular updates on fund usage.', 'Be respectful and supportive in all interactions.'],
  },
  {
    nameTemplates: ['{city} Animal Rescue Network', 'Furry Friends of {city}', '{city} Pet Guardians', 'Second Chance Animals — {city}', '{city} Humane Alliance'],
    taglines: ['Every Animal Deserves Love.', 'Rescue. Rehabilitate. Rehome.', 'Giving Paws a Second Chance.', 'Until Every Cage Is Empty.'],
    descriptions: [
      'A community of animal lovers, rescue volunteers, and veterinary professionals working together to save animals in the {city} area. We support shelters, foster programs, and wildlife rehabilitation efforts.',
    ],
    relatedCategories: ['animals', 'community'],
    guidelines: ['All fundraisers must support animal welfare.', 'No breeders or pet store promotions.', 'Treat all members with kindness and respect.'],
  },
  {
    nameTemplates: ['{city} Education Foundation', 'Bright Minds of {city}', '{city} Learning Network', 'Future Leaders — {city}', '{city} Scholars Alliance'],
    taglines: ['Knowledge Changes Everything.', 'Every Child Can Succeed.', 'Investing in Tomorrow\'s Leaders.', 'Education Without Barriers.'],
    descriptions: [
      'A community committed to educational equity in {city}. We fund scholarships, tutoring programs, school supplies, and technology access for students who need it most.',
    ],
    relatedCategories: ['education', 'nonprofit', 'other'],
    guidelines: ['All fundraisers must support education.', 'Resources must be accessible to all students.', 'Maintain a positive and encouraging environment.'],
  },
  {
    nameTemplates: ['{city} Neighbors Network', '{city} Community Builders', 'United {city}', '{city} Together Foundation', 'Stronger {city}'],
    taglines: ['Neighbors Helping Neighbors.', 'Together We Build.', 'Stronger Communities Start Here.', 'Local Action, Lasting Impact.'],
    descriptions: [
      'A community of residents, businesses, and civic leaders in {city} working together to improve our neighborhoods through gardens, food banks, public spaces, and grassroots projects.',
    ],
    relatedCategories: ['community', 'nonprofit', 'environment'],
    guidelines: ['All fundraisers must benefit the local community.', 'Be transparent about fund allocation.', 'Respect your neighbors and their perspectives.'],
  },
  {
    nameTemplates: ['{city} Health & Healing', '{city} Medical Aid Network', 'Healing Hearts — {city}', '{city} Patient Support Alliance', '{city} Healthcare Heroes'],
    taglines: ['Health Is a Human Right.', 'Healing Together, One Family at a Time.', 'No One Fights Alone.', 'Compassion in Action.'],
    descriptions: [
      'A community supporting families facing medical crises in the {city} area. We help fund treatments, provide emotional support, and connect patients with resources they need to heal.',
    ],
    relatedCategories: ['medical', 'nonprofit'],
    guidelines: ['All fundraisers must support health or medical needs.', 'Patient privacy must be respected.', 'Be compassionate and supportive in all interactions.'],
  },
  {
    nameTemplates: ['{city} Veterans Alliance', 'Heroes of {city}', '{city} Service Members Network', 'Honor & Serve — {city}', '{city} First Responder Fund'],
    taglines: ['Supporting Those Who Served.', 'Honor. Remember. Serve.', 'A Grateful Community.', 'Service Above Self.'],
    descriptions: [
      'A community honoring and supporting veterans, active-duty service members, and first responders in the {city} area. We fund transition programs, memorial projects, and family support services.',
    ],
    relatedCategories: ['memorial', 'nonprofit', 'community'],
    guidelines: ['All fundraisers must support veterans or first responders.', 'This is a space for support, not politics.', 'All interactions should reflect honor and respect.'],
  },
  {
    nameTemplates: ['{city} Arts Collective', 'Creative {city}', '{city} Culture Hub', 'Artisans of {city}', '{city} Arts Alliance'],
    taglines: ['Create. Inspire. Transform.', 'Art for Everyone.', 'Where Creativity Thrives.', 'Building Culture Together.'],
    descriptions: [
      'A community of artists, musicians, writers, and creatives in {city} dedicated to making the arts accessible to everyone. We fund workshops, performances, exhibitions, and art education programs.',
    ],
    relatedCategories: ['other', 'education', 'community'],
    guidelines: ['All fundraisers must relate to arts or creative expression.', 'Projects should be accessible to the community.', 'Respect diverse artistic voices.'],
  },
  {
    nameTemplates: ['{city} Youth Sports Foundation', 'Play {city}', '{city} Athletic Alliance', 'Game On — {city}', '{city} Rec League Network'],
    taglines: ['Every Kid Deserves to Play.', 'Building Champions On and Off the Field.', 'Sports for All.', 'Play Hard, Dream Big.'],
    descriptions: [
      'A community connecting coaches, parents, and athletes in {city} to ensure every kid can participate in sports regardless of family income. We fund equipment, leagues, and facility improvements.',
    ],
    relatedCategories: ['sports', 'community', 'education'],
    guidelines: ['Fundraisers must support youth athletics.', 'No private clubs or elite programs.', 'Keep discussions positive and kid-focused.'],
  },
  {
    nameTemplates: ['{city} Green Initiative', 'Eco {city}', '{city} Conservation Corps', 'Clean {city} Alliance', '{city} Earth Guardians'],
    taglines: ['For a Greener Tomorrow.', 'Protect What Matters.', 'Clean Air. Clean Water. Clean Future.', 'Local Action for Global Impact.'],
    descriptions: [
      'A community of environmentalists, scientists, and concerned citizens in {city} working together on conservation, clean energy, pollution reduction, and environmental education projects.',
    ],
    relatedCategories: ['environment', 'community', 'education'],
    guidelines: ['All fundraisers must address environmental issues.', 'Use evidence-based approaches.', 'Engage the community in sustainable practices.'],
  },
  {
    nameTemplates: ['{city} Gives Back', '{city} Philanthropy Network', 'Compassion {city}', '{city} Aid Foundation', 'Heart of {city}'],
    taglines: ['Generosity Without Limits.', 'Every Dollar Makes a Difference.', 'Community Compassion in Action.', 'Give. Grow. Together.'],
    descriptions: [
      'A broad-based philanthropic community in {city} supporting a wide range of causes from hunger relief to housing, from healthcare to education. We believe that everyone can make a difference.',
    ],
    relatedCategories: ['nonprofit', 'community', 'medical', 'education'],
    guidelines: ['Fundraisers should serve the local community.', 'Transparency and accountability are essential.', 'Treat all members with dignity and respect.'],
  },
];

// ─── Fundraiser Generator ───────────────────────────────────

let fundraiserCount = 0;

function slugify(text: string): string {
  return text.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

export function generateFundraisers(
  count: number,
  userIds: string[],
  communityIds: string[],
  seed?: number
): Fundraiser[] {
  const rand = seededRandom(seed ?? 42);
  const categories: FundraiserCategory[] = [
    'emergency', 'medical', 'education', 'nonprofit', 'community',
    'animals', 'environment', 'memorial', 'sports', 'other',
  ];
  const result: Fundraiser[] = [];

  for (let i = 0; i < count; i++) {
    fundraiserCount++;
    const id = `gen-fundraiser-${fundraiserCount}`;
    const category = pick(categories, rand);
    const city = pick(CITIES, rand);
    const name = pick(FIRST_NAMES, rand);

    // Generate title from template
    const template = pick(TITLE_TEMPLATES[category], rand);
    const title = template.replace('{city}', city).replace('{name}', name);
    const slug = slugify(title) + `-${fundraiserCount}`;

    // Story
    const story = pick(STORY_TEMPLATES[category], rand).replace('{city}', city).replace('{name}', name);

    // Financials
    const goalRanges: Record<FundraiserCategory, [number, number]> = {
      emergency: [5000, 100000],
      medical: [10000, 200000],
      education: [2000, 50000],
      nonprofit: [5000, 75000],
      community: [1000, 25000],
      animals: [2000, 30000],
      environment: [3000, 40000],
      memorial: [5000, 100000],
      sports: [1000, 15000],
      other: [1000, 20000],
    };
    const [minGoal, maxGoal] = goalRanges[category];
    const goalAmount = Math.round((rand() * (maxGoal - minGoal) + minGoal) / 100) * 100;

    // Raised: 10-95% of goal
    const completion = rand() * 0.85 + 0.10;
    const raisedAmount = Math.round(goalAmount * completion);

    // Donation count proportional to raised
    const donationCount = Math.max(1, Math.round(raisedAmount / (500 + rand() * 2000)));

    // Beneficiary
    const beneficiaryType = pick(BENEFICIARY_TYPES[category], rand);
    const beneficiaryName = category === 'medical'
      ? `${name}'s Medical Fund`
      : `${city} ${category.charAt(0).toUpperCase() + category.slice(1)} Fund`;

    // Community link (~60% of fundraisers)
    const communityId = rand() < 0.6 && communityIds.length > 0
      ? pick(communityIds, rand)
      : undefined;

    // Organizer
    const organizerId = userIds.length > 0 ? pick(userIds, rand) : 'user-1';

    // Tags: 3-5 from category
    const tags = pickN(TAGS[category], 3 + Math.floor(rand() * 3), rand);

    // Dates: staggered across last 180 days
    const daysAgo = Math.floor(rand() * 180) + 1;
    const created = new Date(Date.now() - daysAgo * 86400000);
    const lastDonationDaysAgo = Math.floor(rand() * Math.min(daysAgo, 14));
    const lastDonation = new Date(Date.now() - lastDonationDaysAgo * 86400000);

    result.push({
      id,
      title,
      slug,
      heroImage: `https://picsum.photos/seed/${id}/1200/600`,
      organizerId,
      beneficiaryName,
      beneficiaryType,
      communityId,
      category,
      tags,
      story,
      goalAmount,
      raisedAmount,
      donationCount,
      createdDate: created.toISOString().split('T')[0],
      lastDonationDate: lastDonation.toISOString().split('T')[0],
      isActive: true,
      donationIds: [],
    });
  }

  return result;
}

// ─── Community Generator ────────────────────────────────────

let communityCount = 0;

export function generateCommunities(
  count: number,
  fundraiserIds: string[],
  userIds: string[],
  seed?: number
): Community[] {
  const rand = seededRandom(seed ?? 99);
  const result: Community[] = [];

  for (let i = 0; i < count; i++) {
    communityCount++;
    const id = `gen-community-${communityCount}`;
    const city = pick(CITIES, rand);
    const theme = pick(COMMUNITY_THEMES, rand);

    // Generate name
    const nameTemplate = pick(theme.nameTemplates, rand);
    const name = nameTemplate.replace('{city}', city);
    const slug = slugify(name) + `-${communityCount}`;

    // Description
    const description = pick(theme.descriptions, rand).replace(/\{city\}/g, city);
    const tagline = pick(theme.taglines, rand);

    // Stats
    const followerCount = Math.floor(rand() * 5000) + 50;
    const totalDonations = Math.floor(rand() * 200) + 3;
    const totalRaised = totalDonations * (200 + Math.floor(rand() * 2000));
    const activeFundraiserCount = Math.floor(rand() * 8) + 1;

    // Link some fundraisers
    const numLinked = Math.min(activeFundraiserCount, Math.floor(rand() * 5) + 1);
    const linkedFundraisers = fundraiserIds.length > 0
      ? pickN(fundraiserIds, numLinked, rand)
      : [];

    // Link some members
    const numMembers = Math.floor(rand() * 15) + 3;
    const memberList = userIds.length > 0
      ? pickN(userIds, numMembers, rand)
      : [];

    // Created date in 2024-2025
    const daysAgo = Math.floor(rand() * 400) + 30;
    const created = new Date(Date.now() - daysAgo * 86400000);

    result.push({
      id,
      name,
      slug,
      bannerImage: `https://picsum.photos/seed/${id}-banner/1200/400`,
      avatarImage: `https://picsum.photos/seed/${id}-avatar/200/200`,
      tagline,
      description,
      followerCount,
      totalRaised,
      totalDonations,
      activeFundraiserCount,
      fundraiserIds: linkedFundraisers,
      memberIds: memberList,
      guidelines: theme.guidelines,
      createdDate: created.toISOString().split('T')[0],
    });
  }

  return result;
}
