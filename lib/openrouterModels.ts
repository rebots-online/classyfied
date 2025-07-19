/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/* tslint:disable */

export interface OpenRouterModel {
  id: string;
  name?: string;
  context_length?: number;
  pricing?: {
    prompt: string;
    completion: string;
  };
  top_provider?: {
    context_length?: number;
    max_completion_tokens?: number;
    is_moderated?: boolean;
  };
  per_request_limits?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  };
}

export interface OpenRouterModelResponse {
  data: OpenRouterModel[];
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

/**
 * Fetch available models from OpenRouter API
 * @returns Promise<OpenRouterModel[]> - Array of available models
 */
export async function fetchOpenRouterModels(): Promise<OpenRouterModel[]> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key is missing or empty');
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.href,
        'X-Title': 'Classified App',
      },
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data: OpenRouterModelResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error('Failed to fetch OpenRouter models:', error);
    throw error;
  }
}

/**
 * Filter models to get only specific ones for hidden selection
 * @param models Array of OpenRouter models
 * @returns Filtered models
 */
export function getHiddenModelOptions(models: OpenRouterModel[]): OpenRouterModel[] {
  const targetModels = [
    'moonshotai/kimi-k2',
    'google/gemini-2.5-pro-exp-03-25',
    'google/gemini-2.5-flash-lite-preview-02-05'
  ];

  return models.filter(model => targetModels.includes(model.id))
    .sort((a, b) => {
      // Ensure moonshotai/kimi-k2 comes first as default
      if (a.id === 'moonshotai/kimi-k2') return -1;
      if (b.id === 'moonshotai/kimi-k2') return 1;
      return a.id.localeCompare(b.id);
    });
}