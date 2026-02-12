/**
 * Z.ai Vision Suite Client
 * Main client class for all vision operations using Zhipu AI's GLM-4V API
 */

import { ZAI_API_KEY, ZAI_BASE_URL, ZAI_MODEL_VISION, ZAI_MAX_RETRIES, ZAI_TIMEOUT_MS, ZAI_DEBUG } from './env.js';
import { encodeImageAsBase64, getImageMimeType } from './encoder.js';
import {
  AuthenticationError,
  RateLimitError,
  InvalidRequestError,
  ApiConnectionError,
  ImageProcessingError,
  createErrorFromResponse,
} from './errors.js';

interface VisionMessage {
  role: 'user' | 'assistant';
  content: Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: { url: string };
  }>;
}

interface ChatResponse {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface ApiResponse {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: {
    code?: number;
    message?: string;
  };
}

export class ZaiVisionClient {
  protected apiKey: string;
  protected baseUrl: string;
  protected model: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || ZAI_API_KEY;
    this.baseUrl = baseUrl || ZAI_BASE_URL;
    this.model = ZAI_MODEL_VISION;

    if (!this.apiKey) {
      throw new AuthenticationError('API key is required. Set ZAI_API_KEY environment variable.');
    }
  }

  /**
   * Make a request to the Zhipu AI API with retry logic
   */
  protected async makeRequest(messages: VisionMessage[], maxTokens: number = 1024): Promise<ChatResponse> {
    const url = `${this.baseUrl}/chat/completions`;

    const requestBody = {
      model: this.model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    };

    if (ZAI_DEBUG) {
      console.log('[ZaiVision] Request:', JSON.stringify(requestBody, null, 2));
    }

    let lastError: Error | null = null;
    let retries = 0;

    while (retries <= ZAI_MAX_RETRIES) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(ZAI_TIMEOUT_MS),
        });

        const data = await response.json() as ApiResponse;

        if (!response.ok) {
          // Handle rate limiting
          if (response.status === 429 || data.error?.code === 1302) {
            const retryAfter = 60; // Default 60 seconds
            if (retries < ZAI_MAX_RETRIES) {
              if (ZAI_DEBUG) {
                console.log(`[ZaiVision] Rate limited, waiting ${retryAfter}s...`);
              }
              await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
              retries++;
              continue;
            }
            throw new RateLimitError('Rate limit exceeded. Please try again later.', retryAfter);
          }

          // Handle authentication errors
          if (response.status === 401 || data.error?.code === 1301) {
            throw new AuthenticationError(data.error?.message || 'Invalid API key');
          }

          // Create error from response
          throw createErrorFromResponse(data);
        }

        if (ZAI_DEBUG) {
          console.log('[ZaiVision] Response:', JSON.stringify(data, null, 2));
        }

        return data as ChatResponse;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on authentication errors
        if (error instanceof AuthenticationError) {
          throw error;
        }

        // Retry on connection errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
          if (retries < ZAI_MAX_RETRIES) {
            retries++;
            await new Promise(resolve => setTimeout(resolve, 1000 * retries));
            continue;
          }
          throw new ApiConnectionError('Failed to connect to API server after multiple attempts.');
        }

        // Re-throw other errors
        throw error;
      }
    }

    throw lastError || new ApiConnectionError('Unknown error occurred');
  }

  /**
   * Build vision message from image path
   */
  protected async buildVisionMessage(
    imagePath: string,
    prompt: string
  ): Promise<VisionMessage> {
    const base64Image = await encodeImageAsBase64(imagePath);

    return {
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: base64Image } },
        { type: 'text', text: prompt },
      ],
    };
  }

  /**
   * Analyze an image and extract scene information
   */
  async analyze(
    imagePath: string,
    options: { detail?: 'low' | 'high' | 'auto'; detectObjects?: boolean } = {}
  ): Promise<{
    scene: string;
    objects?: Array<{ label: string; confidence: number }>;
    colors?: string[];
    mood?: string;
  }> {
    const { detail = 'high', detectObjects = true } = options;

    let prompt = `Analyze this image in ${detail} detail.`;
    if (detectObjects) {
      prompt += ' List all visible objects with confidence scores. Identify dominant colors and overall mood.';
    } else {
      prompt += ' Describe the scene, mood, and key elements.';
    }

    const message = await this.buildVisionMessage(imagePath, prompt);
    const response = await this.makeRequest([message], 2048);

    const content = response.choices[0]?.message?.content || '';

    const result: { scene: string; objects?: Array<{ label: string; confidence: number }>; colors?: string[]; mood?: string } = {
      scene: content,
    };

    // Try to parse structured data from response
    if (detectObjects && content.includes('Objects:')) {
      try {
        const objectsMatch = content.match(/Objects:?\s*\n((?:[-•]\s*\w+(?:\s*\(\d+%?\))?\s*\n?)+)/i);
        if (objectsMatch) {
          result.objects = objectsMatch[1].split('\n')
            .filter(line => line.trim())
            .map(line => {
              const match = line.match(/[-•]\s*(\w+)(?:\s*\((\d+)%?\))?/);
              if (match) {
                return { label: match[1], confidence: parseFloat(match[2]) || 0.9 };
              }
              return null;
            })
            .filter(Boolean) as Array<{ label: string; confidence: number }>;
        }
      } catch {
        // Keep empty objects array if parsing fails
        result.objects = [];
      }
    }

    return result;
  }

  /**
   * Process a video and extract frames
   */
  async processVideo(
    videoPath: string,
    options: { frames?: number; summarize?: boolean } = {}
  ): Promise<{
    summary: string;
    frames: Array<{ number: number; description: string; timestamp?: number }>;
    scenes?: Array<{ start: number; end: number; description: string }>;
  }> {
    const { frames = 5, summarize = true } = options;

    // Note: This is a simplified implementation
    // Real video processing would require FFmpeg or similar to extract frames
    throw new ImageProcessingError(
      'Video processing requires FFmpeg. For now, please extract frames manually and use analyze() on each frame.',
      { videoPath, frames }
    );
  }

  /**
   * Extract text from an image using OCR
   */
  async extractText(
    imagePath: string,
    options: { language?: string; preserveFormatting?: boolean } = {}
  ): Promise<{
    text: string;
    language?: string;
    confidence?: number;
  }> {
    const { language = 'auto', preserveFormatting = true } = options;

    let prompt = 'Extract all text from this image.';
    if (language !== 'auto') {
      prompt += ` The text is in ${language}.`;
    }
    if (preserveFormatting) {
      prompt += ' Preserve the original formatting, line breaks, and structure.';
    }
    prompt += ' Return only the extracted text, nothing else.';

    const message = await this.buildVisionMessage(imagePath, prompt);
    const response = await this.makeRequest([message], 4096);

    const text = response.choices[0]?.message?.content || '';

    return {
      text: text.trim(),
      language: language === 'auto' ? undefined : language,
    };
  }

  /**
   * Search the web using an image
   */
  async visionSearch(
    imagePath: string,
    options: { searchType?: 'web' | 'products' | 'similar'; maxResults?: number } = {}
  ): Promise<{
    query: string;
    results: Array<{
      title: string;
      url?: string;
      description?: string;
      similarity?: number;
    }>;
  }> {
    const { searchType = 'web', maxResults = 5 } = options;

    const prompts = {
      web: 'Describe this image in detail. What would you search for to find this on the web?',
      products: 'Identify any products in this image. What are they and where might someone buy them?',
      similar: 'Describe this image. What search terms would find similar images?',
    };

    const message = await this.buildVisionMessage(imagePath, prompts[searchType]);
    const response = await this.makeRequest([message], 1024);

    const query = response.choices[0]?.message?.content || '';

    return {
      query,
      results: [
        { title: 'Search Query Generated', description: query },
      ],
    };
  }

  /**
   * Perform enhanced web search with vision
   */
  async visionWebSearch(
    imagePath: string,
    options: { queryType?: 'information' | 'shopping' | 'entertainment'; maxResults?: number } = {}
  ): Promise<{
    analysis: string;
    suggestions: string[];
    relatedTopics?: string[];
  }> {
    const { queryType = 'information', maxResults = 5 } = options;

    const prompts = {
      information: 'Analyze this image comprehensively. What information does it contain? Provide detailed context.',
      shopping: 'What items are visible in this image? Describe them as if listing products for sale.',
      entertainment: 'Describe this image as if recommending it for entertainment purposes.',
    };

    const message = await this.buildVisionMessage(imagePath, prompts[queryType]);
    const response = await this.makeRequest([message], 2048);

    const analysis = response.choices[0]?.message?.content || '';

    return {
      analysis,
      suggestions: ['Search based on visual content', 'Find similar items', 'Get more information'],
    };
  }

  /**
   * Chat with vision capabilities
   */
  async visionChat(
    imagePath: string,
    prompt: string,
    options: { model?: string; temperature?: number } = {}
  ): Promise<{
    response: string;
    usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  }> {
    const { model, temperature } = options;
    const effectiveModel = model || this.model;
    const effectiveTemperature = temperature ?? 0.7;

    const message = await this.buildVisionMessage(imagePath, prompt);

    const requestBody = {
      model: effectiveModel,
      messages: [message],
      max_tokens: 2048,
      temperature: effectiveTemperature,
    };

    const url = `${this.baseUrl}/chat/completions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(ZAI_TIMEOUT_MS),
    });

    const data = await response.json() as ApiResponse;

    if (!response.ok) {
      throw createErrorFromResponse(data as ApiResponse);
    }

    return {
      response: data.choices[0]?.message?.content || '',
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined,
    };
  }
}
