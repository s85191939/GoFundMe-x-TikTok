import type { Fundraiser } from './types';

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
];

export function getFundraiserById(id: string): Fundraiser | undefined {
  return fundraisers.find((f) => f.id === id);
}

export function getFundraisersByOrganizer(userId: string): Fundraiser[] {
  return fundraisers.filter((f) => f.organizerId === userId);
}

export function getAllFundraisers(): Fundraiser[] {
  return fundraisers;
}
