import type { User } from './types';

// ─── Seed Users (static) ────────────────────────────────────

export const users: User[] = [
  {
    id: 'user-1',
    name: 'Marissa Chen',
    avatar: 'https://randomuser.me/api/portraits/women/34.jpg',
    bio: 'Environmental scientist and wildfire safety advocate. Passionate about leveraging technology to protect communities from natural disasters.',
    location: 'Santa Rosa, CA',
    joinedDate: '2024-03-15',
    followerCount: 214,
    followingCount: 87,
    isVerified: true,
    fundraiserIds: ['fundraiser-1', 'fundraiser-6', 'fundraiser-9'],
    communityIds: ['community-1', 'community-3'],
  },
  {
    id: 'user-2',
    name: 'David Okonkwo',
    avatar: 'https://randomuser.me/api/portraits/men/81.jpg',
    bio: 'Community organizer and disaster relief coordinator. I believe in the power of people coming together in times of crisis.',
    location: 'Houston, TX',
    joinedDate: '2023-11-02',
    followerCount: 389,
    followingCount: 152,
    isVerified: true,
    fundraiserIds: ['fundraiser-2', 'fundraiser-11'],
    communityIds: ['community-1', 'community-3'],
  },
  {
    id: 'user-3',
    name: 'Sarah Mitchell',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    bio: 'Veterinary technician and lifelong animal lover. Dedicated to giving every animal a second chance at a happy life.',
    location: 'Portland, OR',
    joinedDate: '2024-01-20',
    followerCount: 156,
    followingCount: 203,
    isVerified: false,
    fundraiserIds: ['fundraiser-3'],
    communityIds: ['community-2'],
  },
  {
    id: 'user-4',
    name: 'James Nguyen',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    bio: 'Retired teacher turned education advocate. Every child deserves access to quality education regardless of their background.',
    location: 'Chicago, IL',
    joinedDate: '2024-06-08',
    followerCount: 278,
    followingCount: 64,
    isVerified: true,
    fundraiserIds: ['fundraiser-4', 'fundraiser-10'],
    communityIds: ['community-6'],
  },
  {
    id: 'user-5',
    name: 'Rachel Torres',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    bio: 'Andy\'s mom. Fighting every day to make sure he gets the treatment he needs. Grateful for every bit of support from our community.',
    location: 'Denver, CO',
    joinedDate: '2025-01-12',
    followerCount: 512,
    followingCount: 31,
    isVerified: true,
    fundraiserIds: ['fundraiser-5'],
    communityIds: [],
  },
  {
    id: 'user-6',
    name: 'Kevin Park',
    avatar: 'https://randomuser.me/api/portraits/men/58.jpg',
    bio: 'Software engineer who believes in giving back. Small donations add up to big changes.',
    location: 'San Francisco, CA',
    joinedDate: '2024-05-19',
    followerCount: 42,
    followingCount: 118,
    isVerified: false,
    fundraiserIds: ['fundraiser-7'],
    communityIds: ['community-1', 'community-5'],
  },
  {
    id: 'user-7',
    name: 'Emily Rodriguez',
    avatar: 'https://randomuser.me/api/portraits/women/21.jpg',
    bio: 'Nurse practitioner and mother of two. I donate because I know how much a helping hand can mean during tough times.',
    location: 'Austin, TX',
    joinedDate: '2024-08-03',
    followerCount: 88,
    followingCount: 95,
    isVerified: false,
    fundraiserIds: [],
    communityIds: ['community-1', 'community-2'],
  },
  {
    id: 'user-8',
    name: 'Marcus Johnson',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    bio: 'Former firefighter, now a full-time dad. I know firsthand how devastating wildfires can be and support every effort to help.',
    location: 'Sacramento, CA',
    joinedDate: '2023-09-14',
    followerCount: 134,
    followingCount: 67,
    isVerified: true,
    fundraiserIds: ['fundraiser-8'],
    communityIds: ['community-1', 'community-4'],
  },
  {
    id: 'user-9',
    name: 'Aisha Patel',
    avatar: 'https://randomuser.me/api/portraits/women/76.jpg',
    bio: 'Philanthropist and animal rescue volunteer. My three rescue dogs are proof that every animal deserves love.',
    location: 'Seattle, WA',
    joinedDate: '2024-02-28',
    followerCount: 203,
    followingCount: 144,
    isVerified: false,
    fundraiserIds: [],
    communityIds: ['community-2'],
  },
  {
    id: 'user-10',
    name: 'Thomas Wright',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: 'Small business owner passionate about community support. When neighbors help neighbors, amazing things happen.',
    location: 'Nashville, TN',
    joinedDate: '2024-04-11',
    followerCount: 76,
    followingCount: 53,
    isVerified: false,
    fundraiserIds: ['fundraiser-12'],
    communityIds: ['community-4'],
  },
];

// ─── Registry (Map-based for dynamic users) ─────────────────

const userRegistry = new Map<string, User>();

// Seed the registry with static users
for (const u of users) {
  userRegistry.set(u.id, u);
}

export function getUserById(id: string): User | undefined {
  return userRegistry.get(id);
}

export function getAllUsers(): User[] {
  return Array.from(userRegistry.values());
}

export function registerUser(user: User): void {
  userRegistry.set(user.id, user);
}

export function registerUsers(newUsers: User[]): void {
  for (const u of newUsers) {
    userRegistry.set(u.id, u);
  }
}

export function getUserCount(): number {
  return userRegistry.size;
}
