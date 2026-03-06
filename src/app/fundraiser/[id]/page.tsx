'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getFundraiserById } from '@/data/fundraisers';
import { getUserById } from '@/data/users';
import { getDonationsForFundraiser } from '@/data/donations';
import { getCommunityById } from '@/data/communities';
import { findSimilarCauses } from '@/lib/ai';
import { getAllFundraisers } from '@/data/fundraisers';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useScrollDepth } from '@/hooks/useScrollDepth';
import { useTimeOnPage } from '@/hooks/useTimeOnPage';
import { usePerformance } from '@/hooks/usePerformance';
import HeroBanner from '@/components/fundraiser/HeroBanner';
import CampaignHeader from '@/components/fundraiser/CampaignHeader';
import DonationProgressBar from '@/components/fundraiser/DonationProgressBar';
import DonateButton from '@/components/fundraiser/DonateButton';
import DonateModal from '@/components/fundraiser/DonateModal';
import DonorAvatars from '@/components/fundraiser/DonorAvatars';
import StorySection from '@/components/fundraiser/StorySection';
import OrganizerCard from '@/components/fundraiser/OrganizerCard';
import CommunityBadge from '@/components/fundraiser/CommunityBadge';
import DonationsList from '@/components/fundraiser/DonationsList';
import ShareButtons from '@/components/fundraiser/ShareButtons';
import AIStoryGenerator from '@/components/fundraiser/AIStoryGenerator';
import CampaignHealthCard from '@/components/fundraiser/CampaignHealthCard';
import FundraiserCard from '@/components/shared/FundraiserCard';
import LiveViewers from '@/components/shared/LiveViewers';
import SocialProofToast from '@/components/shared/SocialProofToast';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

export default function FundraiserPage() {
  const params = useParams();
  const id = params.id as string;
  const { track } = useAnalytics(`/fundraiser/${id}`);
  useScrollDepth(`/fundraiser/${id}`);
  useTimeOnPage(`/fundraiser/${id}`);
  usePerformance(`/fundraiser/${id}`);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [story, setStory] = useState('');

  const fundraiser = getFundraiserById(id);
  const organizer = fundraiser ? getUserById(fundraiser.organizerId) : undefined;
  const donations = fundraiser ? getDonationsForFundraiser(fundraiser.id) : [];
  const community = fundraiser?.communityId ? getCommunityById(fundraiser.communityId) : undefined;
  const similarCauses = fundraiser
    ? findSimilarCauses(fundraiser.id, fundraiser.category, getAllFundraisers())
    : [];

  useEffect(() => {
    if (fundraiser) {
      setStory(fundraiser.story);
      track('page_view', { fundraiserId: id, title: fundraiser.title });
    }
  }, [fundraiser, id, track]);

  if (!fundraiser || !organizer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Fundraiser not found</h1>
          <p className="text-gfm-gray">The fundraiser you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  const avgDonation = donations.length > 0
    ? donations.reduce((sum, d) => sum + d.amount, 0) / donations.length
    : 50;

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Hero Banner */}
        <HeroBanner imageUrl={fundraiser.heroImage} alt={fundraiser.title} />

        {/* Two-column layout */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* Main content - left */}
          <div className="space-y-8">
            <CampaignHeader
              title={fundraiser.title}
              organizer={organizer}
              beneficiaryName={fundraiser.beneficiaryName}
            />

            {/* Mobile-only progress + donate */}
            <div className="lg:hidden space-y-4">
              <DonationProgressBar
                raised={fundraiser.raisedAmount}
                goal={fundraiser.goalAmount}
                donationCount={fundraiser.donationCount}
              />
              <DonateButton onClick={() => {
                track('donate_button_click');
                track('donate_modal_open');
                setIsModalOpen(true);
              }} />
              <DonorAvatars donations={donations} />
            </div>

            <StorySection
              story={story}
              onExpand={() => track('story_expand')}
            />

            <AIStoryGenerator
              currentStory={story}
              category={fundraiser.category}
              title={fundraiser.title}
              onGenerate={(newStory) => setStory(newStory)}
              onTrack={() => track('ai_story_generate')}
            />

            <CampaignHealthCard fundraiser={fundraiser} />

            <DonationsList donations={donations} />

            {/* Similar Causes */}
            {similarCauses.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900">Similar Causes</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {similarCauses.map((f) => (
                    <FundraiserCard key={f.id} fundraiser={f} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - right (desktop only) */}
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-5">
              <LiveViewers baseCount={4} fundraiserId={fundraiser.id} />
              <DonationProgressBar
                raised={fundraiser.raisedAmount}
                goal={fundraiser.goalAmount}
                donationCount={fundraiser.donationCount}
              />
              <DonateButton onClick={() => {
                track('donate_button_click');
                track('donate_modal_open');
                setIsModalOpen(true);
              }} />
              <DonorAvatars donations={donations} />
              <ShareButtons
                url={`/fundraiser/${fundraiser.id}`}
                title={fundraiser.title}
                onShare={(platform) => track('share_click', { platform })}
              />
              <OrganizerCard
                organizer={organizer}
                createdDate={fundraiser.createdDate}
                category={fundraiser.category}
                tags={fundraiser.tags}
              />
              {community && <CommunityBadge community={community} />}
            </div>
          </div>
        </div>
      </div>

      {/* Donate Modal */}
      <DonateModal
        isOpen={isModalOpen}
        onClose={() => {
          track('donate_modal_close');
          setIsModalOpen(false);
        }}
        fundraiser={fundraiser}
        avgDonation={avgDonation}
        onTrack={(event, data) => track(event as never, data)}
      />

      <SocialProofToast donations={donations} fundraiserTitle={fundraiser.title} />
      <AnalyticsDashboard />
    </>
  );
}
