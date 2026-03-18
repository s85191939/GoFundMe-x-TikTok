'use client';

import { useState, useMemo } from 'react';
import type { FundraiserCategory } from '@/data/types';
import {
  generateEnhancedStory,
  estimateEnhancedScore,
  type StoryEnhancementConfig,
  DEFAULT_ENHANCEMENT_CONFIG,
} from '@/lib/ai';

interface AIStoryGeneratorProps {
  currentStory: string;
  category: FundraiserCategory;
  title: string;
  onGenerate?: (newStory: string) => void;
  onTrack?: () => void;
}

const TONE_OPTIONS: { value: StoryEnhancementConfig['tone']; label: string; emoji: string; desc: string }[] = [
  { value: 'heartfelt', label: 'Heartfelt', emoji: '💛', desc: 'Warm, personal, emotionally resonant' },
  { value: 'urgent', label: 'Urgent', emoji: '⚡', desc: 'Time-sensitive, compelling action' },
  { value: 'hopeful', label: 'Hopeful', emoji: '🌟', desc: 'Optimistic, forward-looking' },
  { value: 'professional', label: 'Professional', emoji: '📊', desc: 'Data-driven, transparent' },
];

const FOCUS_OPTIONS: { value: StoryEnhancementConfig['focus'][number]; label: string; emoji: string }[] = [
  { value: 'emotional_hook', label: 'Emotional Hook', emoji: '❤️' },
  { value: 'specific_impact', label: 'Impact Breakdown', emoji: '📋' },
  { value: 'urgency', label: 'Urgency', emoji: '⏰' },
  { value: 'social_proof', label: 'Social Proof', emoji: '👥' },
  { value: 'transparency', label: 'Transparency', emoji: '🔍' },
];

const INTENSITY_OPTIONS: { value: StoryEnhancementConfig['intensity']; label: string; desc: string }[] = [
  { value: 'light', label: 'Light Touch', desc: 'Add intro hook + closing' },
  { value: 'moderate', label: 'Moderate', desc: 'Restructure + add sections' },
  { value: 'full', label: 'Full Rewrite', desc: 'Complete transformation' },
];

export default function AIStoryGenerator({ currentStory, category, title, onGenerate, onTrack }: AIStoryGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<StoryEnhancementConfig>(DEFAULT_ENHANCEMENT_CONFIG);

  // Estimate score improvement
  const scoreEstimate = useMemo(
    () => estimateEnhancedScore(currentStory, config),
    [currentStory, config]
  );

  // Calculate overall grade improvement estimate
  const gradeFromScore = (storyScore: number, baseOtherScore: number) => {
    const total = storyScore + baseOtherScore;
    if (total >= 80) return 'A';
    if (total >= 65) return 'B';
    if (total >= 50) return 'C';
    if (total >= 35) return 'D';
    return 'F';
  };

  // Estimate: other factors typically contribute ~40-60 pts
  // Use 45 as a reasonable baseline for other factors
  const baseOtherScore = 45;
  const currentGrade = gradeFromScore(scoreEstimate.originalScore, baseOtherScore);
  const enhancedGrade = gradeFromScore(scoreEstimate.enhancedScore, baseOtherScore);
  const gradeImproved = enhancedGrade < currentGrade; // Letter comparison (A < B)

  const handleGenerate = async () => {
    setIsGenerating(true);
    onTrack?.();
    try {
      const result = await generateEnhancedStory(currentStory, category, title, config);
      setGenerated(true);
      onGenerate?.(result);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleFocus = (focus: StoryEnhancementConfig['focus'][number]) => {
    setConfig(prev => {
      const has = prev.focus.includes(focus);
      return {
        ...prev,
        focus: has
          ? prev.focus.filter(f => f !== focus)
          : [...prev.focus, focus],
      };
    });
  };

  return (
    <div className="border border-dashed border-gfm-green/40 bg-gfm-green-light/30 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">✨</span>
          <h3 className="font-semibold text-sm text-gray-900">AI Story Enhancement</h3>
        </div>
        {!generated && (
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="text-xs font-medium text-gfm-green hover:text-gfm-green-dark transition-colors flex items-center gap-1"
          >
            <svg className={`w-3.5 h-3.5 transition-transform ${showConfig ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {showConfig ? 'Hide options' : 'Customize'}
          </button>
        )}
      </div>

      <p className="text-xs text-gfm-gray">
        Use AI to make this campaign story more compelling and engaging. Customization options let you control tone, focus areas, and transformation intensity.
      </p>

      {/* Score Improvement Preview */}
      {!generated && (
        <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Story Quality:</span>
            <span className="font-mono text-sm font-bold text-gray-400">{scoreEstimate.originalScore}/20</span>
          </div>
          <svg className="w-4 h-4 text-gfm-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-gfm-green">{scoreEstimate.enhancedScore}/20</span>
            {scoreEstimate.improvement > 0 && (
              <span className="text-[10px] font-bold text-gfm-green bg-gfm-green/10 px-1.5 py-0.5 rounded-full">
                +{scoreEstimate.improvement}
              </span>
            )}
          </div>
          {gradeImproved && (
            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-xs text-gray-400">{currentGrade}</span>
              <span className="text-gfm-green">→</span>
              <span className="text-sm font-bold text-gfm-green">{enhancedGrade}</span>
            </div>
          )}
        </div>
      )}

      {/* Customization Panel */}
      {showConfig && !generated && (
        <div className="space-y-4 pt-2 border-t border-gfm-green/20">
          {/* Tone Selection */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
              Tone
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TONE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setConfig(prev => ({ ...prev, tone: opt.value }))}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all text-xs ${
                    config.tone === opt.value
                      ? 'border-gfm-green bg-gfm-green/5 ring-1 ring-gfm-green/20'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <span className="text-base">{opt.emoji}</span>
                  <div>
                    <div className="font-semibold text-gray-900">{opt.label}</div>
                    <div className="text-[10px] text-gray-400">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Focus Areas */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
              Focus Areas
            </label>
            <div className="flex flex-wrap gap-2">
              {FOCUS_OPTIONS.map(opt => {
                const isSelected = config.focus.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleFocus(opt.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-gfm-green text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Intensity */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
              Transformation Intensity
            </label>
            <div className="flex gap-2">
              {INTENSITY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setConfig(prev => ({ ...prev, intensity: opt.value }))}
                  className={`flex-1 p-2.5 rounded-lg border text-center transition-all ${
                    config.intensity === opt.value
                      ? 'border-gfm-green bg-gfm-green/5 ring-1 ring-gfm-green/20'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-xs font-semibold text-gray-900">{opt.label}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || generated}
        className={`w-full py-2.5 px-4 rounded-full text-sm font-semibold transition-all duration-200 ${
          generated
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
            : isGenerating
            ? 'bg-gfm-green/70 text-white cursor-wait'
            : 'bg-gfm-green hover:bg-gfm-green-dark text-white shadow-sm hover:shadow'
        }`}
      >
        {generated ? (
          <span className="flex items-center justify-center gap-2">
            ✓ Story Enhanced
            <span className="text-xs opacity-70">
              (+{scoreEstimate.improvement} story quality)
            </span>
          </span>
        ) : isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Enhancing with {config.tone} tone...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-1.5">
            ✨ Enhance with AI
            {scoreEstimate.improvement > 0 && (
              <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs">
                +{scoreEstimate.improvement} pts
              </span>
            )}
          </span>
        )}
      </button>

      {/* Post-enhancement score summary */}
      {generated && gradeImproved && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-gray-400">Campaign grade:</span>
          <span className="font-bold text-gray-400 line-through">{currentGrade}</span>
          <svg className="w-4 h-4 text-gfm-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <span className="font-bold text-gfm-green text-base">{enhancedGrade}</span>
          <span className="text-xs text-gfm-green">🎉</span>
        </div>
      )}
    </div>
  );
}
