/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/* tslint:disable */

export interface TextGenerationInteraction {
  type: 'PROMPT' | 'RESPONSE' | 'ERROR' | 'TOKEN';
  data: any; // Raw request for PROMPT, OpenRouter API response for RESPONSE, Error for ERROR, or string token for TOKEN
  modelName?: string;
}

export interface GenerateTextOptions {
  modelName: string;
  basePrompt: string;
  videoUrl?: string;
  additionalUserText?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  onInteraction?: (interaction: TextGenerationInteraction) => void;
  onToken?: (token: string) => void;
}

export interface TextGenerationResponse {
  text: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

/**
 * Generate text content using the OpenRouter API.
 *
 * @param options - Configuration options for the generation request.
 * @returns The response text from the OpenRouter API.
 */
export async function generateText(
  options: GenerateTextOptions,
): Promise<TextGenerationResponse> {
  const {
    modelName,
    basePrompt,
    additionalUserText,
    temperature = 0.75,
    maxTokens,
    stream = false,
    onInteraction,
    onToken,
  } = options;

  if (!OPENROUTER_API_KEY) {
    const error = new Error('OpenRouter API key is missing or empty');
    if (onInteraction) {
      onInteraction({type: 'ERROR', data: error, modelName});
    }
    throw error;
  }

  const prompt = additionalUserText ? `${basePrompt}\n\n${additionalUserText}` : basePrompt;

  const requestBody = {
    model: modelName,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature,
    ...(maxTokens && { max_tokens: maxTokens }),
    stream,
  };

  if (onInteraction) {
    onInteraction({type: 'PROMPT', data: requestBody, modelName});
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.href,
        'X-Title': 'Classified App',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    let result: TextGenerationResponse;

    if (stream && onToken) {
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader for streaming');
      }

      let fullText = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const token = parsed.choices?.[0]?.delta?.content || '';
              if (token) {
                fullText += token;
                onToken(token);
                if (onInteraction) {
                  onInteraction({type: 'TOKEN', data: token, modelName});
                }
              }
            } catch (e) {
              console.error('Error parsing stream chunk:', e);
            }
          }
        }
      }
      
      result = { text: fullText };
    } else {
      const responseData = await response.json();
      
      result = {
        text: responseData.choices?.[0]?.message?.content || '',
        usage: responseData.usage,
      };
    }

    if (onInteraction) {
      onInteraction({type: 'RESPONSE', data: result, modelName});
    }

    if (!result.text) {
      throw new Error('Content generation failed: No text returned from OpenRouter');
    }

    return result;

  } catch (error) {
    console.error(
      'An error occurred during OpenRouter API call or response processing:',
      error,
    );
    if (onInteraction) {
      onInteraction({type: 'ERROR', data: error, modelName});
    }
    throw error;
  }
}