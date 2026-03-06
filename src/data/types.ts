export interface User {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  location: string;
  joinedDate: string;
  followerCount: number;
  followingCount: number;
  isVerified: boolean;
  fundraiserIds: string[];
  communityIds: string[];
}

export interface Fundraiser {
  id: string;
  title: string;
  slug: string;
  heroImage: string;
  organizerId: string;
  beneficiaryName: string;
  beneficiaryType: 'individual' | 'charity' | 'nonprofit';
  communityId?: string;
  category: FundraiserCategory;
  tags: string[];
  story: string;
  goalAmount: number;
  raisedAmount: number;
  donationCount: number;
  createdDate: string;
  lastDonationDate: string;
  isActive: boolean;
  donationIds: string[];
}

export type FundraiserCategory =
  | 'emergency'
  | 'medical'
  | 'education'
  | 'nonprofit'
  | 'community'
  | 'animals'
  | 'environment'
  | 'memorial'
  | 'sports'
  | 'other';

export interface Community {
  id: string;
  name: string;
  slug: string;
  bannerImage: string;
  avatarImage: string;
  tagline: string;
  description: string;
  followerCount: number;
  totalRaised: number;
  totalDonations: number;
  activeFundraiserCount: number;
  fundraiserIds: string[];
  memberIds: string[];
  guidelines: string[];
  createdDate: string;
}

export interface Donation {
  id: string;
  fundraiserId: string;
  donorId?: string;
  donorName: string;
  donorAvatar?: string;
  amount: number;
  message?: string;
  createdDate: string;
  isAnonymous: boolean;
}

export interface ActivityItem {
  id: string;
  type: 'donation' | 'fundraiser_created' | 'fundraiser_update' | 'comment' | 'follow';
  userId: string;
  targetId: string;
  targetType: 'fundraiser' | 'community' | 'user';
  description: string;
  timestamp: string;
  metadata?: {
    amount?: number;
    fundraiserTitle?: string;
    communityName?: string;
  };
}

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  page: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

export type AnalyticsEventType =
  | 'page_view'
  | 'time_on_page'
  | 'scroll_depth'
  | 'cta_click'
  | 'donate_button_click'
  | 'donate_modal_open'
  | 'donate_modal_close'
  | 'donate_amount_select'
  | 'donate_submit'
  | 'share_click'
  | 'follow_click'
  | 'tab_switch'
  | 'story_expand'
  | 'ai_story_generate'
  | 'ai_suggestion_click'
  | 'fundraiser_card_click';

export interface AIDonationSuggestion {
  amount: number;
  label: string;
  reasoning: string;
}
