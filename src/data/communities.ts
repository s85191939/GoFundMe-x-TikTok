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
];

export function getCommunityById(id: string): Community | undefined {
  return communities.find((c) => c.id === id);
}

export function getAllCommunities(): Community[] {
  return communities;
}
