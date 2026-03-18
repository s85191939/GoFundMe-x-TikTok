'use client';

import { useState } from 'react';
import type { FundraiserCategory } from '@/data/types';
import {
  generateEnhancedStory,
  type StoryEnhancementConfig,
  DEFAULT_ENHANCEMENT_CONFIG,
} from '@/lib/ai';
import { isOpenRouterAvailable, AVAILABLE_MODELS, type AIModel } from '@/lib/openrouter';

interface AIStoryGeneratorProps {
  currentStory: string;
  category: FundraiserCategory;
  title: string;
  onGenerate?: (newStory: string) => void;
  onTrack?: () => void;
}

const TONE_OPTIONS: { value: StoryEnhancementConfig['tone']; label: string; emoji: string }[] = [
  { value: 'heartfelt', label: 'Heartfelt', emoji: '💛' },
  { value: 'urgent', label: 'Urgent', emoji: '⚡' },
  { value: 'hopeful', label: 'Hopeful', emoji: '🌟' },
  { value: 'professional', label: 'Professional', emoji: '📊' },
];

const FOCUS_OPTIONS: { value: StoryEnhancementConfig['focus'][number]; label: string; emoji: string }[] = [
  { value: 'emotional_hook', label: 'Emotional Hook', emoji: '❤️' },
  { value: 'specific_impact', label: 'Impact Details', emoji: '📋' },
  { value: 'urgency', label: 'Urgency', emoji: '⏰' },
  { value: 'social_proof', label: 'Social Proof', emoji: '👥' },
  { value: 'transparency', label: 'Transparency', emoji: '🔍' },
];

export default function AIStoryGenerator({ currentStory, category, title, onGenerate, onTrack }: AIStoryGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<StoryEnhancementConfig>(DEFAULT_ENHANCEMENT_CONFIG);
  const [selectedModel, setSelectedModel] = useState<AIModel | 'template'>('anthropic/claude-3.5-sonnet');
  const [usedModel, setUsedModel] = useState<string | null>(null);

  const aiAvailable = isOpenRouterAvailable();

  const handleGenerate = async () => {
    setIsGenerating(true);
    onTrack?.();
    try {
      const configWithModel: StoryEnhancementConfig = {
        ...config,
        model: selectedModel !== 'template' ? selectedModel as AIModel : undefined,
      };
      const result = await generateEnhancedStory(currentStory, category, title, configWithModel);
      setGenerated(true);
      setUsedModel(result.usedAI ? (result.model || selectedModel) : 'Template');
      onGenerate?.(result.text);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleFocus = (focus: StoryEnhancementConfig['focus'][number]) => {
    setConfig(prev => ({
      ...prev,
      focus: prev.focus.includes(focus)
        ? prev.focus.filter(f => f !== focus)
        : [...prev.focus, focus],
    }));
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">✨</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">AI Story Enhancement</h3>
            <p className="text-xs text-gray-500">Make your campaign story more compelling</p>
          </div>
        </div>
        {!generated && (
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1 bg-white/60 px-3 py-1.5 rounded-full"
          >
            <svg className={`w-3.5 h-3.5 transition-transform ${showConfig ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {showConfig ? 'Less' : 'Options'}
          </button>
        )}
      </div>

      {/* What AI will improve — vibes only, no scores */}
      {!generated && !showConfig && (
        <div className="flex flex-wrap gap-2">
          {['Stronger opening hook', 'Clearer call to action', 'More emotional resonance'].map(tip => (
            <span key={tip} className="text-xs bg-white/70 text-gray-600 px-3 py-1.5 rounded-full border border-emerald-100">
              ✓ {tip}
            </span>
          ))}
        </div>
      )}

      {/* Customization Panel */}
      {showConfig && !generated && (
        <div className="space-y-4 pt-3 border-t border-emerald-200/50">
          {/* Model Selection */}
          {aiAvailable && (
            <div>
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
                AI Model
              </label>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_MODELS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                      selectedModel === m.id
                        ? 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-300'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{m.label}</div>
                  </button>
                ))}
                <button
                  onClick={() => setSelectedModel('template')}
                  className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                    selectedModel === 'template'
                      ? 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-300'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="font-semibold text-gray-900">Template</div>
                  <div className="text-[10px] text-gray-400">No API needed</div>
                </button>
              </div>
            </div>
          )}

          {/* Tone */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
              Tone
            </label>
            <div className="flex flex-wrap gap-2">
              {TONE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setConfig(prev => ({ ...prev, tone: opt.value }))}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    config.tone === opt.value
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <span>{opt.emoji}</span>
                  {opt.label}
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
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || generated}
        className={`w-full py-3.5 px-4 rounded-2xl text-sm font-bold transition-all duration-200 ${
          generated
            ? 'bg-emerald-100 text-emerald-700 cursor-default'
            : isGenerating
            ? 'bg-emerald-400 text-white cursor-wait'
            : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300'
        }`}
      >
        {generated ? (
          <span className="flex items-center justify-center gap-2">
            ✓ Story Enhanced
            {usedModel && (
              <span className="text-xs font-normal opacity-70">
                via {usedModel}
              </span>
            )}
          </span>
        ) : isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Enhancing your story...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-1.5">
            ✨ Enhance with AI
          </span>
        )}
      </button>
    </div>
  );
}
