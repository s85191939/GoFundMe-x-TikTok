import type { Fundraiser, FundraiserCategory } from './types';

export const fundraisers: Fundraiser[] = [
  {
    id: 'fundraiser-1',
    title: 'Real-Time Alerts for Wildfire Safety',
    slug: 'real-time-alerts-for-wildfire-safety',
    heroImage: 'https://picsum.photos/seed/fundraiser-1/1200/600',
    organizerId: 'user-1',
    beneficiaryName: 'Watch Duty Community',
    beneficiaryType: 'nonprofit',
    communityId: 'community-1',
    category: 'environment',
    tags: ['wildfire', 'safety', 'technology', 'alerts', 'community-safety', 'california'],
    story: `Wildfires are becoming more frequent and more destructive every year. In 2025 alone, over 2 million acres burned across the western United States, displacing thousands of families and devastating entire communities. The need for early, reliable warning systems has never been more urgent.

Our project aims to build and deploy a network of real-time wildfire detection sensors across vulnerable communities in Northern California. These sensors use a combination of infrared imaging, air quality monitoring, and wind pattern analysis to detect fires in their earliest stages, often before they are visible to the naked eye.

When a potential fire is detected, our system sends instant push notifications to every registered user within a 30-mile radius. The alerts include evacuation route suggestions based on real-time traffic data and fire progression modeling. During the Sonoma County fires last fall, our prototype system gave residents an average of 22 extra minutes of warning time compared to official channels.

We are raising $3,000 to fund the next phase of sensor deployment, covering the cost of 15 additional monitoring stations across Lake County and Mendocino County. Each station costs approximately $180 for hardware, plus ongoing cellular data costs for the first year.

Every dollar brings us closer to a future where no family is caught off guard by a wildfire. Join us in making our communities safer, one sensor at a time. Your support could literally save lives.`,
    goalAmount: 3000,
    raisedAmount: 2102,
    donationCount: 5,
    createdDate: '2025-09-10',
    lastDonationDate: '2026-02-28',
    isActive: true,
    donationIds: ['donation-1', 'donation-2', 'donation-3', 'donation-4', 'donation-5'],
  },
  {
    id: 'fundraiser-2',
    title: 'Help Rebuild After the Storm',
    slug: 'help-rebuild-after-the-storm',
    heroImage: 'https://picsum.photos/seed/fundraiser-2/1200/600',
    organizerId: 'user-2',
    beneficiaryName: 'Gulf Coast Storm Relief Fund',
    beneficiaryType: 'charity',
    communityId: 'community-1',
    category: 'emergency',
    tags: ['hurricane', 'disaster-relief', 'rebuilding', 'houston', 'emergency', 'housing'],
    story: `On January 14th, Hurricane Mara made landfall along the Gulf Coast with sustained winds of 145 mph. The storm surge reached 18 feet in some areas, flooding neighborhoods that had never seen water damage before. In the aftermath, over 12,000 homes were damaged or destroyed, and entire blocks were left without power for weeks.

I have been on the ground since day one coordinating relief efforts with local churches, shelters, and volunteer groups. What I have witnessed is both heartbreaking and inspiring. Families who lost everything are helping their neighbors clear debris. Strangers are opening their homes to displaced families. The spirit of this community is unbreakable, but the scale of the destruction is overwhelming.

The funds raised here will go directly to purchasing building materials, temporary housing supplies, and essential household items for the hardest-hit families. We are working with licensed contractors who have volunteered their labor, so every dollar goes toward materials. A $500 donation can provide enough drywall and insulation to restore one room. A $2,000 donation can replace a destroyed roof.

We have already helped 34 families begin rebuilding, but there are hundreds more on our waiting list. The need is urgent because many of these families are still living in cars, shelters, or with relatives in overcrowded homes. Winter may be mild here compared to the north, but temperatures still drop into the 30s at night.

This is not just about rebuilding houses. It is about rebuilding lives and restoring hope. Please share this fundraiser even if you cannot donate. Every bit of visibility helps us reach the people who can make a difference.

Thank you from the bottom of my heart for caring about our community.`,
    goalAmount: 50000,
    raisedAmount: 16344,
    donationCount: 6,
    createdDate: '2026-01-18',
    lastDonationDate: '2026-03-02',
    isActive: true,
    donationIds: ['donation-6', 'donation-7', 'donation-8', 'donation-9', 'donation-10', 'donation-11'],
  },
  {
    id: 'fundraiser-3',
    title: 'Support Local Animal Shelter Expansion',
    slug: 'support-local-animal-shelter-expansion',
    heroImage: 'https://picsum.photos/seed/fundraiser-3/1200/600',
    organizerId: 'user-3',
    beneficiaryName: 'Paws & Claws Rescue',
    beneficiaryType: 'nonprofit',
    communityId: 'community-2',
    category: 'animals',
    tags: ['animal-rescue', 'shelter', 'dogs', 'cats', 'adoption', 'portland', 'expansion'],
    story: `Paws & Claws Rescue has been serving the Portland metro area for over eight years, and in that time we have found loving homes for more than 3,200 animals. But right now, we are facing a crisis that we cannot solve alone. Our current facility can hold 45 animals at maximum capacity, and we have been at or above capacity for the past six months straight.

Every week, we receive an average of 15 intake requests from local animal control, owner surrenders, and strays found by Good Samaritans. We are turning away more animals than we can accept, and that means many of them end up in overcrowded municipal shelters where euthanasia rates remain tragically high.

We have secured a lease on an adjacent property that would allow us to nearly triple our capacity to 120 animals. The space needs significant renovation including new kennels, a medical examination room, improved ventilation, a dedicated cat wing with floor-to-ceiling climbing structures, and an outdoor exercise area. We have obtained all necessary permits and have a construction timeline of just 10 weeks once funding is secured.

The total renovation cost is estimated at $10,000, which covers materials, contractor fees for specialized work like plumbing and electrical, and new veterinary equipment for the medical room. We already have a team of 20 regular volunteers ready to help with painting, assembly, and general labor to keep costs down.

Beyond the physical expansion, the funds will also help us hire one additional part-time veterinary technician to handle the increased medical needs. Many of the animals we take in require vaccinations, spay or neuter surgery, dental work, or treatment for injuries and illnesses.

Your donation is not just funding a building. It is giving an abandoned animal a warm bed, a full belly, and the chance to find a family that will love them forever. Every animal deserves that chance.`,
    goalAmount: 10000,
    raisedAmount: 4742,
    donationCount: 6,
    createdDate: '2025-11-05',
    lastDonationDate: '2026-03-01',
    isActive: true,
    donationIds: ['donation-12', 'donation-13', 'donation-14', 'donation-15', 'donation-16', 'donation-17'],
  },
  {
    id: 'fundraiser-4',
    title: 'Education Fund for Underprivileged Kids',
    slug: 'education-fund-for-underprivileged-kids',
    heroImage: 'https://picsum.photos/seed/fundraiser-4/1200/600',
    organizerId: 'user-4',
    beneficiaryName: 'Bright Futures Initiative',
    beneficiaryType: 'charity',
    category: 'education',
    tags: ['education', 'children', 'scholarships', 'tutoring', 'school-supplies', 'chicago', 'youth'],
    story: `After 32 years of teaching in Chicago public schools, I retired last year. But I did not retire from caring about kids. During my career, I watched hundreds of bright, motivated students fall behind or drop out simply because their families could not afford basic school supplies, tutoring, or the fees for extracurricular activities that look so important on college applications.

The Bright Futures Initiative is my answer to that problem. We provide comprehensive educational support to students from low-income families on the South Side and West Side of Chicago. Our program currently serves 85 students in grades 6 through 12, and every one of them is showing measurable academic improvement.

Here is what your donation funds: For $100, we can provide a full year of school supplies for one student, including a backpack, notebooks, calculators, and art supplies. For $250, we can fund 20 hours of one-on-one tutoring with a qualified tutor in math, science, or English. For $500, we can cover the registration fees for SAT prep courses and three college application fees. For $1,000, we can provide a refurbished laptop that a student keeps through graduation.

Last year, 14 of our seniors graduated high school with a 3.0 GPA or higher, and 11 of them were accepted into four-year universities. Three received full scholarships. These are kids who, without support, might have become statistics. Instead, they are becoming engineers, nurses, teachers, and entrepreneurs.

We are raising $25,000 to expand the program to three additional schools and to hire two more part-time tutors. The demand is enormous. We have a waiting list of over 200 students whose families have reached out for help.

Education is the most powerful tool we have to break the cycle of poverty. Please help us put that tool in the hands of the kids who need it most.`,
    goalAmount: 25000,
    raisedAmount: 18500,
    donationCount: 5,
    createdDate: '2025-08-22',
    lastDonationDate: '2026-02-25',
    isActive: true,
    donationIds: ['donation-18', 'donation-19', 'donation-20', 'donation-21', 'donation-22'],
  },
  {
    id: 'fundraiser-5',
    title: "Medical Bills for Andy's Treatment",
    slug: 'medical-bills-for-andys-treatment',
    heroImage: 'https://picsum.photos/seed/fundraiser-5/1200/600',
    organizerId: 'user-5',
    beneficiaryName: 'Andy Torres',
    beneficiaryType: 'individual',
    category: 'medical',
    tags: ['medical', 'cancer', 'treatment', 'family', 'pediatric', 'chemotherapy', 'hospital-bills'],
    story: `No parent should ever have to hear the words "your child has cancer." But on September 3rd, 2025, that is exactly what my husband Miguel and I were told. Our son Andy, who is seven years old and the bravest kid I have ever known, was diagnosed with acute lymphoblastic leukemia.

Since that day, our lives have been consumed by hospital visits, chemotherapy sessions, blood transfusions, and an endless stream of medical bills. Andy has completed four rounds of chemotherapy so far, and his doctors are cautiously optimistic about his prognosis. He is responding well to treatment, but the road ahead is long. His oncologist has outlined a treatment plan that extends through at least December 2026, with the possibility of a bone marrow transplant if the leukemia does not go into full remission.

The financial burden has been crushing. Even with insurance, our out-of-pocket costs have already exceeded $68,000 for copays, deductibles, medications not covered by our plan, and the specialized nutrition supplements Andy needs to maintain his weight during chemo. I had to leave my job as a dental hygienist to be with Andy full-time at the hospital, which means we are now surviving on Miguel's salary alone.

On top of the direct medical costs, there are expenses most people do not think about. We drive 90 minutes each way to the Children's Hospital three times a week. We have had to pay for temporary housing near the hospital during Andy's inpatient stays. We need specialized cleaning supplies to keep our home safe for Andy's compromised immune system.

Andy is the strongest person I know. Even on his worst days, he tries to make the nurses laugh. He tells me he is going to beat this so he can go back to playing soccer with his friends. I believe him. But I need help making sure he gets every chance to fight.

Every donation, no matter how small, takes weight off our shoulders and lets us focus on what matters most, getting Andy healthy. Thank you for reading our story. Thank you for caring.`,
    goalAmount: 150000,
    raisedAmount: 102442,
    donationCount: 6,
    createdDate: '2025-09-15',
    lastDonationDate: '2026-03-03',
    isActive: true,
    donationIds: ['donation-23', 'donation-24', 'donation-25', 'donation-26', 'donation-27', 'donation-28'],
  },
  // ===== New Fundraisers (6–12) =====
  {
    id: 'fundraiser-6',
    title: 'Community Garden Revival',
    slug: 'community-garden-revival',
    heroImage: 'https://picsum.photos/seed/fundraiser-6/1200/600',
    organizerId: 'user-1',
    beneficiaryName: 'Neighbors United Community Garden',
    beneficiaryType: 'nonprofit',
    communityId: 'community-3',
    category: 'community',
    tags: ['garden', 'community', 'sustainability', 'food', 'neighborhood', 'green-space'],
    story: `Our neighborhood lost its beloved community garden when the lot was sold to developers three years ago. For over a decade, that garden was more than just a place to grow vegetables. It was where retirees taught kids how to plant seeds, where immigrant families grew herbs from their home countries, and where neighbors who barely knew each other became lifelong friends.

We have secured a new 0.4-acre lot just two blocks from the original site. The landowner has agreed to a 15-year lease at a nominal rate, but the lot needs significant work. The soil requires remediation and amendment, we need raised beds, a tool shed, a drip irrigation system, fencing, and accessible pathways for elderly and disabled gardeners.

We are raising $8,000 to cover the full buildout. Every $200 funds one raised bed including soil, compost, and starter plants. A $500 donation covers the entire irrigation system. We already have 40 families signed up for plots and a waiting list of 25 more.

This garden will also serve as an outdoor classroom for Jefferson Elementary, where our after-school program teaches kids about nutrition, sustainability, and where their food comes from. Let us bring this garden back to life together.`,
    goalAmount: 8000,
    raisedAmount: 3420,
    donationCount: 4,
    createdDate: '2025-10-15',
    lastDonationDate: '2026-02-20',
    isActive: true,
    donationIds: ['donation-29', 'donation-30', 'donation-31', 'donation-32'],
  },
  {
    id: 'fundraiser-7',
    title: 'Youth Soccer League Equipment Fund',
    slug: 'youth-soccer-league-equipment',
    heroImage: 'https://picsum.photos/seed/fundraiser-7/1200/600',
    organizerId: 'user-6',
    beneficiaryName: 'Eastside Youth Soccer League',
    beneficiaryType: 'nonprofit',
    communityId: 'community-5',
    category: 'sports',
    tags: ['soccer', 'youth', 'sports', 'equipment', 'kids', 'recreation', 'league'],
    story: `The Eastside Youth Soccer League has been giving kids ages 6 through 14 a place to play, learn teamwork, and stay active for the past five years. We serve over 120 kids across 8 teams, and we have never turned a child away for inability to pay registration fees.

But our equipment is falling apart. We are down to 12 usable soccer balls for 120 kids. Our goals have bent poles and torn nets. Half our pinnies have holes in them. We practice on a field with no corner flags, no proper markings, and we have been borrowing cones from the local traffic department.

We are raising $5,000 to properly outfit our league. This covers 40 match-quality soccer balls, 8 sets of goals with nets, training pinnies, corner flags, coaching equipment, a portable first aid station, and new uniforms for all 8 teams. We also want to fund referee training for four parent volunteers so our games can be properly officiated.

Every kid deserves the chance to play sports regardless of their family income. Your donation keeps our fields full and our kids active.`,
    goalAmount: 5000,
    raisedAmount: 2100,
    donationCount: 3,
    createdDate: '2025-12-01',
    lastDonationDate: '2026-02-15',
    isActive: true,
    donationIds: ['donation-33', 'donation-34', 'donation-35'],
  },
  {
    id: 'fundraiser-8',
    title: 'Memorial Fund for Officer Davis',
    slug: 'memorial-fund-officer-davis',
    heroImage: 'https://picsum.photos/seed/fundraiser-8/1200/600',
    organizerId: 'user-8',
    beneficiaryName: 'The Davis Family',
    beneficiaryType: 'individual',
    communityId: 'community-4',
    category: 'memorial',
    tags: ['memorial', 'police', 'family', 'support', 'community', 'first-responder'],
    story: `On November 12th, 2025, our community lost one of its finest. Officer Michael Davis, a 14-year veteran of the Sacramento Police Department, passed away unexpectedly from a cardiac event while on duty. He was 42 years old.

Mike was not just a cop. He was the guy who organized the annual block party, who coached Little League every spring, who stopped by the senior center every Friday to check on residents. He knew every shopkeeper by name. He once spent his own money to replace a kid's stolen bicycle. That was Mike.

He leaves behind his wife Jennifer and their three children: Emma (14), Lucas (11), and baby Sophia (2). Jennifer has been a stay-at-home mom since Sophia was born, and the family is now facing the loss of their sole income during the most difficult time of their lives.

This fund will help cover immediate expenses including funeral costs, mortgage payments for the next six months, and the children's school and activity fees. We are also setting aside a portion for a college fund for all three kids.

The Sacramento PD family is contributing separately, but the community Mike served and loved deserves a chance to give back too. Let us take care of the family of a man who spent his career taking care of us.`,
    goalAmount: 75000,
    raisedAmount: 48200,
    donationCount: 4,
    createdDate: '2025-11-18',
    lastDonationDate: '2026-03-01',
    isActive: true,
    donationIds: ['donation-36', 'donation-37', 'donation-38', 'donation-39'],
  },
  {
    id: 'fundraiser-9',
    title: 'Clean Water Initiative Expansion',
    slug: 'clean-water-initiative-expansion',
    heroImage: 'https://picsum.photos/seed/fundraiser-9/1200/600',
    organizerId: 'user-1',
    beneficiaryName: 'PureFlow Water Foundation',
    beneficiaryType: 'nonprofit',
    communityId: 'community-3',
    category: 'nonprofit',
    tags: ['water', 'nonprofit', 'clean-water', 'health', 'infrastructure', 'community'],
    story: `Access to clean drinking water should not be a privilege. Yet in 2025, there are still communities right here in the United States where tap water is unsafe to drink. Our organization, PureFlow Water Foundation, has been installing point-of-use filtration systems in underserved communities since 2022.

So far, we have installed 340 filtration units across 12 communities in rural Appalachia and the Mississippi Delta, providing clean water access to over 2,000 people. Each unit costs approximately $85 for hardware plus $30 per year for filter replacements, and they last 10 years with proper maintenance.

We are raising funds to expand into three new communities that have reached out to us for help. Water testing in these areas has shown concerning levels of lead, PFAS compounds, and agricultural runoff contaminants. Families have been buying bottled water for years, spending up to $150 per month just to have safe drinking water.

A $115 donation provides one family with a filtration unit plus the first year of filters. A $500 donation covers an entire block. The $15,000 goal will allow us to serve approximately 130 new households.

Clean water changes everything. It means healthier kids, fewer medical bills, and the peace of mind that comes from knowing the water from your tap is safe.`,
    goalAmount: 15000,
    raisedAmount: 6800,
    donationCount: 4,
    createdDate: '2025-09-28',
    lastDonationDate: '2026-02-28',
    isActive: true,
    donationIds: ['donation-40', 'donation-41', 'donation-42', 'donation-43'],
  },
  {
    id: 'fundraiser-10',
    title: 'Creative Arts After-School Program',
    slug: 'creative-arts-after-school-program',
    heroImage: 'https://picsum.photos/seed/fundraiser-10/1200/600',
    organizerId: 'user-4',
    beneficiaryName: 'Creative Futures Studio',
    beneficiaryType: 'nonprofit',
    communityId: 'community-6',
    category: 'other',
    tags: ['arts', 'after-school', 'music', 'painting', 'theater', 'youth', 'creative'],
    story: `When budget cuts eliminated arts programs at three Chicago public schools last year, we saw the light go out of kids' eyes. The music room went silent. The art supplies gathered dust. The stage sat empty.

Creative Futures Studio was born from a simple idea: every child deserves access to the arts regardless of whether their school can afford it. We run free after-school programs in music, visual arts, theater, and creative writing for students in grades 3 through 8.

In our first year, we served 65 students across two locations using donated instruments and supplies. The results have been remarkable. Teachers report that our students show improved focus, higher attendance rates, and better emotional regulation. Parents tell us their kids are happier and more confident.

We are raising $12,000 to expand to a third location and purchase proper equipment: 15 acoustic guitars, a classroom set of watercolor and acrylic supplies, a portable stage and lighting kit for theater productions, and 20 tablets loaded with music composition software.

We also need to fund stipends for our teaching artists, many of whom are working professionals who volunteer their time but cannot sustain it without some compensation.

Art is not a luxury. It is how kids learn to express themselves, process emotions, and discover who they are. Help us keep the lights on in the creative room.`,
    goalAmount: 12000,
    raisedAmount: 4500,
    donationCount: 3,
    createdDate: '2026-01-05',
    lastDonationDate: '2026-03-02',
    isActive: true,
    donationIds: ['donation-44', 'donation-45', 'donation-46'],
  },
  {
    id: 'fundraiser-11',
    title: 'Neighborhood Food Bank Drive',
    slug: 'neighborhood-food-bank-drive',
    heroImage: 'https://picsum.photos/seed/fundraiser-11/1200/600',
    organizerId: 'user-2',
    beneficiaryName: 'Helping Hands Food Pantry',
    beneficiaryType: 'charity',
    communityId: 'community-3',
    category: 'community',
    tags: ['food-bank', 'hunger', 'community', 'pantry', 'meals', 'families'],
    story: `Helping Hands Food Pantry has been serving the greater Houston area since 2019, but the demand has never been higher than it is right now. Post-hurricane, many families who were already food-insecure are now in crisis. Our weekly distribution numbers have tripled from 120 families to over 360.

We operate out of a converted warehouse that a local business lets us use rent-free. Our team of 45 volunteers sorts, packs, and distributes food every Tuesday, Thursday, and Saturday. We partner with local grocery stores, restaurants, and farms to rescue food that would otherwise go to waste.

But rescued food alone is not enough. We need to purchase staples like rice, beans, canned proteins, cooking oil, baby formula, and fresh produce to fill the gaps. We also need to replace our aging refrigeration unit, which broke down twice last month.

Every $25 provides a week of groceries for one family. Every $100 feeds four families. The $20,000 goal covers three months of food purchasing plus the new refrigeration unit.

No one in our community should go to bed hungry. Not while we have the power to change that.`,
    goalAmount: 20000,
    raisedAmount: 11250,
    donationCount: 4,
    createdDate: '2026-02-01',
    lastDonationDate: '2026-03-04',
    isActive: true,
    donationIds: ['donation-47', 'donation-48', 'donation-49', 'donation-50'],
  },
  {
    id: 'fundraiser-12',
    title: 'Veterans Support & Transition Aid',
    slug: 'veterans-support-transition-aid',
    heroImage: 'https://picsum.photos/seed/fundraiser-12/1200/600',
    organizerId: 'user-10',
    beneficiaryName: 'Vets Forward Initiative',
    beneficiaryType: 'nonprofit',
    communityId: 'community-4',
    category: 'nonprofit',
    tags: ['veterans', 'military', 'transition', 'support', 'housing', 'employment', 'mental-health'],
    story: `After 20 years in the Army, I thought the hardest part was over when I came home. I was wrong. The transition from military to civilian life nearly broke me. I struggled with PTSD, could not find a job that matched my skills, and felt completely disconnected from the world I had served to protect.

Vets Forward was created because no veteran should have to navigate that transition alone. We provide three core services: job placement assistance with resume workshops and interview coaching, temporary housing support for veterans facing homelessness, and peer mentoring that connects newly transitioned vets with those who have successfully made the adjustment.

In two years, we have helped 89 veterans find stable employment, provided transitional housing to 34 individuals, and our peer mentoring program has 60 active pairings. Our success rate for job placement within 90 days is 78 percent.

We are raising $30,000 to hire a full-time case manager, expand our transitional housing from 8 to 14 units, and launch a new mental health support group facilitated by licensed therapists who specialize in veteran issues.

These men and women put their lives on the line for us. The least we can do is make sure they have a soft landing when they come home.`,
    goalAmount: 30000,
    raisedAmount: 15800,
    donationCount: 3,
    createdDate: '2025-10-20',
    lastDonationDate: '2026-02-22',
    isActive: true,
    donationIds: ['donation-51', 'donation-52', 'donation-53'],
  },
];

export function getFundraiserById(id: string): Fundraiser | undefined {
  return fundraisers.find((f) => f.id === id);
}

export function getFundraisersByOrganizer(userId: string): Fundraiser[] {
  return fundraisers.filter((f) => f.organizerId === userId);
}

export function getFundraisersByCategory(category: FundraiserCategory): Fundraiser[] {
  return fundraisers.filter((f) => f.category === category);
}

export function getAllFundraisers(): Fundraiser[] {
  return fundraisers;
}
