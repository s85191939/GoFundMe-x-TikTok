/**
 * OpenRouter API Client
 *
 * Provides access to Claude, GPT-4, Llama, and other models through
 * a unified API. Falls back to template-based generation when no key
 * is available.
 */

export type AIModel =
  | 'anthropic/claude-3.5-sonnet'
  | 'openai/gpt-4o-mini'
  | 'meta-llama/llama-3.1-8b-instruct'
  | 'mistralai/mistral-7b-instruct';

const MODEL_LABELS: Record<AIModel, string> = {
  'anthropic/claude-3.5-sonnet': 'Claude 3.5 Sonnet',
  'openai/gpt-4o-mini': 'GPT-4o Mini',
  'meta-llama/llama-3.1-8b-instruct': 'Llama 3.1 8B',
  'mistralai/mistral-7b-instruct': 'Mistral 7B',
};

export const AVAILABLE_MODELS: { id: AIModel; label: string }[] = Object.entries(MODEL_LABELS).map(
  ([id, label]) => ({ id: id as AIModel, label })
);

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

function getApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || null;
}

export function isOpenRouterAvailable(): boolean {
  return !!getApiKey();
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterResponse {
  text: string;
  model: string;
  tokensUsed: number;
}

/**
 * Call OpenRouter API with a given model and messages.
 * Throws on failure — caller should handle fallback.
 */
export async function callOpenRouter(
  model: AIModel,
  messages: ChatMessage[],
  options?: { maxTokens?: number; temperature?: number }
): Promise<OpenRouterResponse> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('No OpenRouter API key configured');
  }

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
      'X-Title': 'GoFundMe AI Enhancement',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: options?.maxTokens ?? 1024,
      temperature: options?.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return {
    text: data.choices?.[0]?.message?.content || '',
    model: data.model || model,
    tokensUsed: data.usage?.total_tokens || 0,
  };
}

// ─── Story Enhancement ──────────────────────────────────────

export async function enhanceStoryWithAI(
  story: string,
  title: string,
  category: string,
  tone: string,
  focus: string[],
  model: AIModel = 'anthropic/claude-3.5-sonnet',
): Promise<{ enhanced: string; model: string }> {
  const systemPrompt = `You are an expert fundraiser copywriter for GoFundMe. Your job is to enhance campaign stories to be more compelling and emotionally resonant while keeping them authentic and truthful. Never fabricate facts — only improve the writing quality, structure, and emotional impact of what's already there.`;

  const userPrompt = `Enhance this GoFundMe campaign story. Keep all facts intact but make it more compelling.

Title: ${title}
Category: ${category}
Tone: ${tone}
Focus areas: ${focus.join(', ')}

Original story:
${story}

Write an enhanced version that:
- Opens with a strong emotional hook
- Uses vivid, specific language
- Includes a clear call to action
- Feels authentic and human (not AI-generated)
- Keeps the same core facts and narrative
- Is 2-3 paragraphs long

Enhanced story:`;

  const result = await callOpenRouter(model, [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], { maxTokens: 800, temperature: 0.7 });

  return { enhanced: result.text.trim(), model: result.model };
}

// ─── Feed Recommendations ───────────────────────────────────

export async function getAIFeedInsight(
  categories: { category: string; dwellMs: number; views: number }[],
  model: AIModel = 'meta-llama/llama-3.1-8b-instruct',
): Promise<string> {
  const topCategories = categories
    .sort((a, b) => b.dwellMs - a.dwellMs)
    .slice(0, 3)
    .map(c => `${c.category} (${Math.round(c.dwellMs / 1000)}s, ${c.views} views)`)
    .join(', ');

  const result = await callOpenRouter(model, [
    {
      role: 'system',
      content: 'You are a concise feed algorithm analyst. Give a one-sentence insight about user engagement patterns. Be specific and actionable. Max 20 words.',
    },
    {
      role: 'user',
      content: `User's top engaged categories: ${topCategories}. What does this tell us about their interests?`,
    },
  ], { maxTokens: 60, temperature: 0.5 });

  return result.text.trim();
}
