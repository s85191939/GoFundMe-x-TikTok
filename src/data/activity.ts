import type { ActivityItem } from './types';

export const activities: ActivityItem[] = [
  // ===== Fundraiser Creations =====
  {
    id: 'activity-1',
    type: 'fundraiser_created',
    userId: 'user-1',
    targetId: 'fundraiser-1',
    targetType: 'fundraiser',
    description: 'Marissa Chen created a fundraiser "Real-Time Alerts for Wildfire Safety"',
    timestamp: '2025-09-10T09:00:00Z',
    metadata: {
      fundraiserTitle: 'Real-Time Alerts for Wildfire Safety',
    },
  },
  {
    id: 'activity-2',
    type: 'fundraiser_created',
    userId: 'user-4',
    targetId: 'fundraiser-4',
    targetType: 'fundraiser',
    description: 'James Nguyen created a fundraiser "Education Fund for Underprivileged Kids"',
    timestamp: '2025-08-22T14:30:00Z',
    metadata: {
      fundraiserTitle: 'Education Fund for Underprivileged Kids',
    },
  },
  {
    id: 'activity-3',
    type: 'fundraiser_created',
    userId: 'user-5',
    targetId: 'fundraiser-5',
    targetType: 'fundraiser',
    description: "Rachel Torres created a fundraiser \"Medical Bills for Andy's Treatment\"",
    timestamp: '2025-09-15T11:15:00Z',
    metadata: {
      fundraiserTitle: "Medical Bills for Andy's Treatment",
    },
  },
  {
    id: 'activity-4',
    type: 'fundraiser_created',
    userId: 'user-3',
    targetId: 'fundraiser-3',
    targetType: 'fundraiser',
    description: 'Sarah Mitchell created a fundraiser "Support Local Animal Shelter Expansion"',
    timestamp: '2025-11-05T10:00:00Z',
    metadata: {
      fundraiserTitle: 'Support Local Animal Shelter Expansion',
    },
  },
  {
    id: 'activity-5',
    type: 'fundraiser_created',
    userId: 'user-2',
    targetId: 'fundraiser-2',
    targetType: 'fundraiser',
    description: 'David Okonkwo created a fundraiser "Help Rebuild After the Storm"',
    timestamp: '2026-01-18T08:45:00Z',
    metadata: {
      fundraiserTitle: 'Help Rebuild After the Storm',
    },
  },

  // ===== Donations =====
  {
    id: 'activity-6',
    type: 'donation',
    userId: 'user-6',
    targetId: 'fundraiser-1',
    targetType: 'fundraiser',
    description: 'Kevin Park donated $250 to "Real-Time Alerts for Wildfire Safety"',
    timestamp: '2025-10-02T16:20:00Z',
    metadata: {
      amount: 250,
      fundraiserTitle: 'Real-Time Alerts for Wildfire Safety',
    },
  },
  {
    id: 'activity-7',
    type: 'donation',
    userId: 'user-8',
    targetId: 'fundraiser-5',
    targetType: 'fundraiser',
    description: "Marcus Johnson donated $2,000 to \"Medical Bills for Andy's Treatment\"",
    timestamp: '2025-09-20T13:10:00Z',
    metadata: {
      amount: 2000,
      fundraiserTitle: "Medical Bills for Andy's Treatment",
    },
  },
  {
    id: 'activity-8',
    type: 'donation',
    userId: 'user-7',
    targetId: 'fundraiser-4',
    targetType: 'fundraiser',
    description: 'Emily Rodriguez donated $500 to "Education Fund for Underprivileged Kids"',
    timestamp: '2025-09-05T09:45:00Z',
    metadata: {
      amount: 500,
      fundraiserTitle: 'Education Fund for Underprivileged Kids',
    },
  },
  {
    id: 'activity-9',
    type: 'donation',
    userId: 'user-9',
    targetId: 'fundraiser-3',
    targetType: 'fundraiser',
    description: 'Aisha Patel donated $1,500 to "Support Local Animal Shelter Expansion"',
    timestamp: '2025-11-20T11:30:00Z',
    metadata: {
      amount: 1500,
      fundraiserTitle: 'Support Local Animal Shelter Expansion',
    },
  },
  {
    id: 'activity-10',
    type: 'donation',
    userId: 'user-10',
    targetId: 'fundraiser-2',
    targetType: 'fundraiser',
    description: 'Thomas Wright donated $6,894 to "Help Rebuild After the Storm"',
    timestamp: '2026-03-02T14:00:00Z',
    metadata: {
      amount: 6894,
      fundraiserTitle: 'Help Rebuild After the Storm',
    },
  },

  // ===== Fundraiser Updates =====
  {
    id: 'activity-11',
    type: 'fundraiser_update',
    userId: 'user-1',
    targetId: 'fundraiser-1',
    targetType: 'fundraiser',
    description:
      'Marissa Chen posted an update: "We have installed 8 of the 15 planned sensors! Early detection tests are showing 94% accuracy."',
    timestamp: '2025-12-01T10:00:00Z',
    metadata: {
      fundraiserTitle: 'Real-Time Alerts for Wildfire Safety',
    },
  },
  {
    id: 'activity-12',
    type: 'fundraiser_update',
    userId: 'user-2',
    targetId: 'fundraiser-2',
    targetType: 'fundraiser',
    description:
      'David Okonkwo posted an update: "34 families have begun rebuilding. Materials are being delivered daily. Thank you all for your incredible generosity."',
    timestamp: '2026-02-15T08:30:00Z',
    metadata: {
      fundraiserTitle: 'Help Rebuild After the Storm',
    },
  },
  {
    id: 'activity-13',
    type: 'fundraiser_update',
    userId: 'user-5',
    targetId: 'fundraiser-5',
    targetType: 'fundraiser',
    description:
      'Rachel Torres posted an update: "Andy finished his fourth round of chemo! Doctors say he is responding well. He drew a picture for all of you."',
    timestamp: '2026-02-20T19:00:00Z',
    metadata: {
      fundraiserTitle: "Medical Bills for Andy's Treatment",
    },
  },
  {
    id: 'activity-14',
    type: 'fundraiser_update',
    userId: 'user-3',
    targetId: 'fundraiser-3',
    targetType: 'fundraiser',
    description:
      'Sarah Mitchell posted an update: "Construction permits approved! We break ground on the new wing next Monday. Here are the architectural plans."',
    timestamp: '2026-01-28T15:45:00Z',
    metadata: {
      fundraiserTitle: 'Support Local Animal Shelter Expansion',
    },
  },
  {
    id: 'activity-15',
    type: 'fundraiser_update',
    userId: 'user-4',
    targetId: 'fundraiser-4',
    targetType: 'fundraiser',
    description:
      'James Nguyen posted an update: "14 seniors graduated with 3.0+ GPAs and 11 were accepted to four-year universities! Three received full scholarships."',
    timestamp: '2026-01-10T12:00:00Z',
    metadata: {
      fundraiserTitle: 'Education Fund for Underprivileged Kids',
    },
  },

  // ===== Follows =====
  {
    id: 'activity-16',
    type: 'follow',
    userId: 'user-7',
    targetId: 'community-1',
    targetType: 'community',
    description: 'Emily Rodriguez started following Watch Duty',
    timestamp: '2025-10-01T08:15:00Z',
    metadata: {
      communityName: 'Watch Duty',
    },
  },
  {
    id: 'activity-17',
    type: 'follow',
    userId: 'user-9',
    targetId: 'community-2',
    targetType: 'community',
    description: 'Aisha Patel started following Paws & Claws Rescue',
    timestamp: '2025-11-18T17:30:00Z',
    metadata: {
      communityName: 'Paws & Claws Rescue',
    },
  },
  {
    id: 'activity-18',
    type: 'follow',
    userId: 'user-8',
    targetId: 'community-1',
    targetType: 'community',
    description: 'Marcus Johnson started following Watch Duty',
    timestamp: '2025-09-25T14:00:00Z',
    metadata: {
      communityName: 'Watch Duty',
    },
  },
  {
    id: 'activity-19',
    type: 'donation',
    userId: 'user-6',
    targetId: 'fundraiser-4',
    targetType: 'fundraiser',
    description: 'Kevin Park donated $10,000 to "Education Fund for Underprivileged Kids"',
    timestamp: '2026-02-25T10:30:00Z',
    metadata: {
      amount: 10000,
      fundraiserTitle: 'Education Fund for Underprivileged Kids',
    },
  },
  {
    id: 'activity-20',
    type: 'donation',
    userId: 'user-7',
    targetId: 'fundraiser-2',
    targetType: 'fundraiser',
    description: 'Emily Rodriguez donated $1,000 to "Help Rebuild After the Storm"',
    timestamp: '2026-01-20T11:00:00Z',
    metadata: {
      amount: 1000,
      fundraiserTitle: 'Help Rebuild After the Storm',
    },
  },
  // ===== New Fundraiser Creations =====
  {
    id: 'activity-21',
    type: 'fundraiser_created',
    userId: 'user-1',
    targetId: 'fundraiser-6',
    targetType: 'fundraiser',
    description: 'Marissa Chen created a fundraiser "Community Garden Revival"',
    timestamp: '2025-10-15T09:00:00Z',
    metadata: {
      fundraiserTitle: 'Community Garden Revival',
    },
  },
  {
    id: 'activity-22',
    type: 'fundraiser_created',
    userId: 'user-6',
    targetId: 'fundraiser-7',
    targetType: 'fundraiser',
    description: 'Kevin Park created a fundraiser "Youth Soccer League Equipment Fund"',
    timestamp: '2025-12-01T10:00:00Z',
    metadata: {
      fundraiserTitle: 'Youth Soccer League Equipment Fund',
    },
  },
  {
    id: 'activity-23',
    type: 'fundraiser_created',
    userId: 'user-8',
    targetId: 'fundraiser-8',
    targetType: 'fundraiser',
    description: 'Marcus Johnson created a fundraiser "Memorial Fund for Officer Davis"',
    timestamp: '2025-11-18T14:00:00Z',
    metadata: {
      fundraiserTitle: 'Memorial Fund for Officer Davis',
    },
  },
  {
    id: 'activity-24',
    type: 'fundraiser_created',
    userId: 'user-1',
    targetId: 'fundraiser-9',
    targetType: 'fundraiser',
    description: 'Marissa Chen created a fundraiser "Clean Water Initiative Expansion"',
    timestamp: '2025-09-28T11:30:00Z',
    metadata: {
      fundraiserTitle: 'Clean Water Initiative Expansion',
    },
  },
  {
    id: 'activity-25',
    type: 'fundraiser_created',
    userId: 'user-4',
    targetId: 'fundraiser-10',
    targetType: 'fundraiser',
    description: 'James Nguyen created a fundraiser "Creative Arts After-School Program"',
    timestamp: '2026-01-05T09:15:00Z',
    metadata: {
      fundraiserTitle: 'Creative Arts After-School Program',
    },
  },
  {
    id: 'activity-26',
    type: 'fundraiser_created',
    userId: 'user-2',
    targetId: 'fundraiser-11',
    targetType: 'fundraiser',
    description: 'David Okonkwo created a fundraiser "Neighborhood Food Bank Drive"',
    timestamp: '2026-02-01T08:00:00Z',
    metadata: {
      fundraiserTitle: 'Neighborhood Food Bank Drive',
    },
  },
  {
    id: 'activity-27',
    type: 'fundraiser_created',
    userId: 'user-10',
    targetId: 'fundraiser-12',
    targetType: 'fundraiser',
    description: 'Thomas Wright created a fundraiser "Veterans Support & Transition Aid"',
    timestamp: '2025-10-20T13:00:00Z',
    metadata: {
      fundraiserTitle: 'Veterans Support & Transition Aid',
    },
  },

  // ===== New Donations =====
  {
    id: 'activity-28',
    type: 'donation',
    userId: 'user-9',
    targetId: 'fundraiser-6',
    targetType: 'fundraiser',
    description: 'Aisha Patel donated $1,200 to "Community Garden Revival"',
    timestamp: '2025-12-15T10:00:00Z',
    metadata: {
      amount: 1200,
      fundraiserTitle: 'Community Garden Revival',
    },
  },
  {
    id: 'activity-29',
    type: 'donation',
    userId: 'user-9',
    targetId: 'fundraiser-8',
    targetType: 'fundraiser',
    description: 'Aisha Patel donated $20,000 to "Memorial Fund for Officer Davis"',
    timestamp: '2026-03-01T15:00:00Z',
    metadata: {
      amount: 20000,
      fundraiserTitle: 'Memorial Fund for Officer Davis',
    },
  },
  {
    id: 'activity-30',
    type: 'donation',
    userId: 'user-8',
    targetId: 'fundraiser-9',
    targetType: 'fundraiser',
    description: 'Marcus Johnson donated $2,000 to "Clean Water Initiative Expansion"',
    timestamp: '2025-10-15T14:30:00Z',
    metadata: {
      amount: 2000,
      fundraiserTitle: 'Clean Water Initiative Expansion',
    },
  },
  {
    id: 'activity-31',
    type: 'donation',
    userId: 'user-8',
    targetId: 'fundraiser-11',
    targetType: 'fundraiser',
    description: 'Marcus Johnson donated $3,000 to "Neighborhood Food Bank Drive"',
    timestamp: '2026-02-05T09:00:00Z',
    metadata: {
      amount: 3000,
      fundraiserTitle: 'Neighborhood Food Bank Drive',
    },
  },

  // ===== New Community Follows =====
  {
    id: 'activity-32',
    type: 'follow',
    userId: 'user-1',
    targetId: 'community-3',
    targetType: 'community',
    description: 'Marissa Chen started following Neighbors United',
    timestamp: '2025-10-10T08:00:00Z',
    metadata: {
      communityName: 'Neighbors United',
    },
  },
  {
    id: 'activity-33',
    type: 'follow',
    userId: 'user-8',
    targetId: 'community-4',
    targetType: 'community',
    description: 'Marcus Johnson started following Honor & Remember',
    timestamp: '2025-11-15T12:00:00Z',
    metadata: {
      communityName: 'Honor & Remember',
    },
  },
  {
    id: 'activity-34',
    type: 'follow',
    userId: 'user-6',
    targetId: 'community-5',
    targetType: 'community',
    description: 'Kevin Park started following Youth Sports Alliance',
    timestamp: '2025-12-01T09:00:00Z',
    metadata: {
      communityName: 'Youth Sports Alliance',
    },
  },
  {
    id: 'activity-35',
    type: 'follow',
    userId: 'user-4',
    targetId: 'community-6',
    targetType: 'community',
    description: 'James Nguyen started following Creative Futures',
    timestamp: '2026-01-03T10:00:00Z',
    metadata: {
      communityName: 'Creative Futures',
    },
  },
];

export function getActivitiesForUser(userId: string): ActivityItem[] {
  return activities.filter((a) => a.userId === userId);
}

export function getActivitiesForCommunity(communityId: string): ActivityItem[] {
  return activities.filter(
    (a) => a.targetType === 'community' && a.targetId === communityId
  );
}
