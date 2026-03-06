import type { Donation } from './types';

export const donations: Donation[] = [
  // ===== Fundraiser 1: Real-Time Alerts for Wildfire Safety =====
  {
    id: 'donation-1',
    fundraiserId: 'fundraiser-1',
    donorId: 'user-6',
    donorName: 'Kevin Park',
    donorAvatar: 'https://picsum.photos/seed/user-6/200/200',
    amount: 250,
    message:
      'As a tech worker in the Bay Area, I know how critical early warning systems are. My coworker lost his home in the 2020 fires. This project could save lives.',
    createdDate: '2025-10-02',
    isAnonymous: false,
  },
  {
    id: 'donation-2',
    fundraiserId: 'fundraiser-1',
    donorId: 'user-8',
    donorName: 'Marcus Johnson',
    donorAvatar: 'https://picsum.photos/seed/user-8/200/200',
    amount: 500,
    message:
      'Spent 15 years as a firefighter and I can tell you that extra warning time is the difference between life and death. Keep up the incredible work, Marissa.',
    createdDate: '2025-11-14',
    isAnonymous: false,
  },
  {
    id: 'donation-3',
    fundraiserId: 'fundraiser-1',
    donorId: 'user-7',
    donorName: 'Emily Rodriguez',
    donorAvatar: 'https://picsum.photos/seed/user-7/200/200',
    amount: 100,
    message: 'Every community deserves this kind of protection. Sharing with all my friends!',
    createdDate: '2025-12-20',
    isAnonymous: false,
  },
  {
    id: 'donation-4',
    fundraiserId: 'fundraiser-1',
    donorName: 'Anonymous',
    amount: 1000,
    message: 'Lost my home in a wildfire three years ago. Wish this existed then. Glad it will exist now.',
    createdDate: '2026-01-30',
    isAnonymous: true,
  },
  {
    id: 'donation-5',
    fundraiserId: 'fundraiser-1',
    donorId: 'user-10',
    donorName: 'Thomas Wright',
    donorAvatar: 'https://picsum.photos/seed/user-10/200/200',
    amount: 252,
    message: 'Saw this on the news. Technology like this should be everywhere. Happy to help.',
    createdDate: '2026-02-28',
    isAnonymous: false,
  },

  // ===== Fundraiser 2: Help Rebuild After the Storm =====
  {
    id: 'donation-6',
    fundraiserId: 'fundraiser-2',
    donorId: 'user-7',
    donorName: 'Emily Rodriguez',
    donorAvatar: 'https://picsum.photos/seed/user-7/200/200',
    amount: 1000,
    message:
      'My heart breaks for everyone affected by Hurricane Mara. I grew up in Houston and still have family there. Praying for a quick recovery.',
    createdDate: '2026-01-20',
    isAnonymous: false,
  },
  {
    id: 'donation-7',
    fundraiserId: 'fundraiser-2',
    donorId: 'user-8',
    donorName: 'Marcus Johnson',
    donorAvatar: 'https://picsum.photos/seed/user-8/200/200',
    amount: 750,
    message:
      'David, thank you for everything you are doing on the ground. First responders like you are the backbone of recovery. Stay strong.',
    createdDate: '2026-01-25',
    isAnonymous: false,
  },
  {
    id: 'donation-8',
    fundraiserId: 'fundraiser-2',
    donorName: 'Anonymous',
    amount: 5000,
    message: 'Please use this where it is needed most.',
    createdDate: '2026-02-01',
    isAnonymous: true,
  },
  {
    id: 'donation-9',
    fundraiserId: 'fundraiser-2',
    donorId: 'user-6',
    donorName: 'Kevin Park',
    donorAvatar: 'https://picsum.photos/seed/user-6/200/200',
    amount: 200,
    message: 'Wish I could do more. Will be sharing this widely.',
    createdDate: '2026-02-10',
    isAnonymous: false,
  },
  {
    id: 'donation-10',
    fundraiserId: 'fundraiser-2',
    donorId: 'user-9',
    donorName: 'Aisha Patel',
    donorAvatar: 'https://picsum.photos/seed/user-9/200/200',
    amount: 2500,
    message:
      'Natural disasters do not discriminate and neither should our compassion. Sending love and support from Seattle.',
    createdDate: '2026-02-18',
    isAnonymous: false,
  },
  {
    id: 'donation-11',
    fundraiserId: 'fundraiser-2',
    donorId: 'user-10',
    donorName: 'Thomas Wright',
    donorAvatar: 'https://picsum.photos/seed/user-10/200/200',
    amount: 6894,
    message:
      'I know what it is like to lose everything. After the Nashville tornado, strangers helped me rebuild. Paying it forward.',
    createdDate: '2026-03-02',
    isAnonymous: false,
  },

  // ===== Fundraiser 3: Support Local Animal Shelter Expansion =====
  {
    id: 'donation-12',
    fundraiserId: 'fundraiser-3',
    donorId: 'user-9',
    donorName: 'Aisha Patel',
    donorAvatar: 'https://picsum.photos/seed/user-9/200/200',
    amount: 1500,
    message:
      'My three rescue babies are the light of my life. Every animal deserves a safe place to land. Paws & Claws is doing amazing work!',
    createdDate: '2025-11-20',
    isAnonymous: false,
  },
  {
    id: 'donation-13',
    fundraiserId: 'fundraiser-3',
    donorId: 'user-7',
    donorName: 'Emily Rodriguez',
    donorAvatar: 'https://picsum.photos/seed/user-7/200/200',
    amount: 300,
    message:
      'Adopted our family cat from Paws & Claws two years ago. She is the best thing that ever happened to us. Thank you for all you do!',
    createdDate: '2025-12-05',
    isAnonymous: false,
  },
  {
    id: 'donation-14',
    fundraiserId: 'fundraiser-3',
    donorName: 'Anonymous',
    amount: 500,
    message: 'For the animals who cannot speak for themselves.',
    createdDate: '2026-01-08',
    isAnonymous: true,
  },
  {
    id: 'donation-15',
    fundraiserId: 'fundraiser-3',
    donorId: 'user-6',
    donorName: 'Kevin Park',
    donorAvatar: 'https://picsum.photos/seed/user-6/200/200',
    amount: 150,
    message: 'My dog Biscuit was a rescue. Supporting this cause is personal for me.',
    createdDate: '2026-01-22',
    isAnonymous: false,
  },
  {
    id: 'donation-16',
    fundraiserId: 'fundraiser-3',
    donorId: 'user-10',
    donorName: 'Thomas Wright',
    donorAvatar: 'https://picsum.photos/seed/user-10/200/200',
    amount: 742,
    message:
      'Just visited the shelter last month and saw how packed it was. This expansion is desperately needed. Great job Sarah!',
    createdDate: '2026-02-14',
    isAnonymous: false,
  },
  {
    id: 'donation-17',
    fundraiserId: 'fundraiser-3',
    donorId: 'user-8',
    donorName: 'Marcus Johnson',
    donorAvatar: 'https://picsum.photos/seed/user-8/200/200',
    amount: 1550,
    message: 'Tripling our capacity means tripling the number of lives saved. Count me in.',
    createdDate: '2026-03-01',
    isAnonymous: false,
  },

  // ===== Fundraiser 4: Education Fund for Underprivileged Kids =====
  {
    id: 'donation-18',
    fundraiserId: 'fundraiser-4',
    donorId: 'user-7',
    donorName: 'Emily Rodriguez',
    donorAvatar: 'https://picsum.photos/seed/user-7/200/200',
    amount: 500,
    message:
      'Education changed my life. I was the first in my family to go to college and it opened doors I never knew existed. Every kid deserves that chance.',
    createdDate: '2025-09-05',
    isAnonymous: false,
  },
  {
    id: 'donation-19',
    fundraiserId: 'fundraiser-4',
    donorName: 'Anonymous',
    amount: 5000,
    message:
      'Mr. Nguyen was my teacher in 2008. He is the reason I went to college. Now I want to help him give that same gift to others.',
    createdDate: '2025-10-18',
    isAnonymous: true,
  },
  {
    id: 'donation-20',
    fundraiserId: 'fundraiser-4',
    donorId: 'user-9',
    donorName: 'Aisha Patel',
    donorAvatar: 'https://picsum.photos/seed/user-9/200/200',
    amount: 2000,
    message: 'Investing in children is investing in the future. Thank you for your decades of dedication, James.',
    createdDate: '2025-12-30',
    isAnonymous: false,
  },
  {
    id: 'donation-21',
    fundraiserId: 'fundraiser-4',
    donorId: 'user-10',
    donorName: 'Thomas Wright',
    donorAvatar: 'https://picsum.photos/seed/user-10/200/200',
    amount: 1000,
    message:
      'I grew up without much and teachers like you made all the difference. Happy to support this incredible program.',
    createdDate: '2026-01-15',
    isAnonymous: false,
  },
  {
    id: 'donation-22',
    fundraiserId: 'fundraiser-4',
    donorId: 'user-6',
    donorName: 'Kevin Park',
    donorAvatar: 'https://picsum.photos/seed/user-6/200/200',
    amount: 10000,
    message:
      'Just got a bonus at work and cannot think of a better way to spend it. These kids are the future. Let us make sure they have every opportunity.',
    createdDate: '2026-02-25',
    isAnonymous: false,
  },

  // ===== Fundraiser 5: Medical Bills for Andy's Treatment =====
  {
    id: 'donation-23',
    fundraiserId: 'fundraiser-5',
    donorId: 'user-8',
    donorName: 'Marcus Johnson',
    donorAvatar: 'https://picsum.photos/seed/user-8/200/200',
    amount: 2000,
    message:
      'Andy, you are a warrior. My family is rooting for you every single day. Rachel and Miguel, stay strong. You are not alone in this fight.',
    createdDate: '2025-09-20',
    isAnonymous: false,
  },
  {
    id: 'donation-24',
    fundraiserId: 'fundraiser-5',
    donorId: 'user-9',
    donorName: 'Aisha Patel',
    donorAvatar: 'https://picsum.photos/seed/user-9/200/200',
    amount: 3000,
    message:
      'No family should face this alone. Sending all my love and prayers to Andy and the Torres family. You will get through this.',
    createdDate: '2025-10-30',
    isAnonymous: false,
  },
  {
    id: 'donation-25',
    fundraiserId: 'fundraiser-5',
    donorName: 'Anonymous',
    amount: 5000,
    message: 'For Andy. Beat this thing, little buddy.',
    createdDate: '2025-12-15',
    isAnonymous: true,
  },
  {
    id: 'donation-26',
    fundraiserId: 'fundraiser-5',
    donorId: 'user-6',
    donorName: 'Kevin Park',
    donorAvatar: 'https://picsum.photos/seed/user-6/200/200',
    amount: 500,
    message:
      'Shared this with my entire company Slack channel. Andy is an inspiration. Hoping more people will pitch in.',
    createdDate: '2026-01-08',
    isAnonymous: false,
  },
  {
    id: 'donation-27',
    fundraiserId: 'fundraiser-5',
    donorId: 'user-7',
    donorName: 'Emily Rodriguez',
    donorAvatar: 'https://picsum.photos/seed/user-7/200/200',
    amount: 1500,
    message:
      'As a nurse, I see families go through this every day. It never gets easier to watch. Rachel, you are doing an amazing job. Andy is lucky to have you.',
    createdDate: '2026-02-05',
    isAnonymous: false,
  },
  {
    id: 'donation-28',
    fundraiserId: 'fundraiser-5',
    donorId: 'user-10',
    donorName: 'Thomas Wright',
    donorAvatar: 'https://picsum.photos/seed/user-10/200/200',
    amount: 90442,
    message:
      'My company is matching employee donations this quarter. This is from me and my team. Andy, you have got a whole army behind you.',
    createdDate: '2026-03-03',
    isAnonymous: false,
  },
];

export function getDonationsForFundraiser(fundraiserId: string): Donation[] {
  return donations.filter((d) => d.fundraiserId === fundraiserId);
}

export function getDonationsByUser(userId: string): Donation[] {
  return donations.filter((d) => d.donorId === userId);
}
