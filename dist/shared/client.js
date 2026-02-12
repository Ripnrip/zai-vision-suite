/**
 * Z.ai Vision Suite Client
 * Main client class for all vision operations using Zhipu AI's GLM-4V API
 */
import { ZAI_API_KEY, ZAI_BASE_URL, ZAI_MODEL_VISION, ZAI_MAX_RETRIES, ZAI_TIMEOUT_MS, ZAI_DEBUG } from './env.js';
import { encodeImageAsBase64 } from './encoder.js';
import { AuthenticationError, RateLimitError, ApiConnectionError, ImageProcessingError, createErrorFromResponse, } from './errors.js';
export class ZaiVisionClient {
    apiKey;
    baseUrl;
    model;
    constructor(apiKey, baseUrl) {
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
    async makeRequest(messages, maxTokens = 1024) {
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
        let lastError = null;
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
                const data = await response.json();
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
                return data;
            }
            catch (error) {
                lastError = error;
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
    async buildVisionMessage(imagePath, prompt) {
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
    async analyze(imagePath, options = {}) {
        const { detail = 'high', detectObjects = true } = options;
        let prompt = `Analyze this image in ${detail} detail.`;
        if (detectObjects) {
            prompt += ' List all visible objects with confidence scores. Identify dominant colors and overall mood.';
        }
        else {
            prompt += ' Describe the scene, mood, and key elements.';
        }
        const message = await this.buildVisionMessage(imagePath, prompt);
        const response = await this.makeRequest([message], 2048);
        const content = response.choices[0]?.message?.content || '';
        const result = {
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
                        .filter(Boolean);
                }
            }
            catch {
                // Keep empty objects array if parsing fails
                result.objects = [];
            }
        }
        return result;
    }
    /**
     * Process a video and extract frames
     */
    async processVideo(videoPath, options = {}) {
        const { frames = 5, summarize = true } = options;
        // Note: This is a simplified implementation
        // Real video processing would require FFmpeg or similar to extract frames
        throw new ImageProcessingError('Video processing requires FFmpeg. For now, please extract frames manually and use analyze() on each frame.', { videoPath, frames });
    }
    /**
     * Extract text from an image using OCR
     */
    async extractText(imagePath, options = {}) {
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
    async visionSearch(imagePath, options = {}) {
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
    async visionWebSearch(imagePath, options = {}) {
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
    async visionChat(imagePath, prompt, options = {}) {
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
        const data = await response.json();
        if (!response.ok) {
            throw createErrorFromResponse(data);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NoYXJlZC9jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUgsT0FBTyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsZUFBZSxFQUFFLGNBQWMsRUFBRSxTQUFTLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDbkgsT0FBTyxFQUFFLG1CQUFtQixFQUFvQixNQUFNLGNBQWMsQ0FBQztBQUNyRSxPQUFPLEVBQ0wsbUJBQW1CLEVBQ25CLGNBQWMsRUFFZCxrQkFBa0IsRUFDbEIsb0JBQW9CLEVBQ3BCLHVCQUF1QixHQUN4QixNQUFNLGFBQWEsQ0FBQztBQThCckIsTUFBTSxPQUFPLGVBQWU7SUFDaEIsTUFBTSxDQUFTO0lBQ2YsT0FBTyxDQUFTO0lBQ2hCLEtBQUssQ0FBUztJQUV4QixZQUFZLE1BQWUsRUFBRSxPQUFnQjtRQUMzQyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sSUFBSSxXQUFXLENBQUM7UUFDcEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLElBQUksWUFBWSxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxLQUFLLEdBQUcsZ0JBQWdCLENBQUM7UUFFOUIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNqQixNQUFNLElBQUksbUJBQW1CLENBQUMsNERBQTRELENBQUMsQ0FBQztRQUM5RixDQUFDO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBQ08sS0FBSyxDQUFDLFdBQVcsQ0FBQyxRQUF5QixFQUFFLFlBQW9CLElBQUk7UUFDN0UsTUFBTSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxtQkFBbUIsQ0FBQztRQUUvQyxNQUFNLFdBQVcsR0FBRztZQUNsQixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7WUFDakIsUUFBUTtZQUNSLFVBQVUsRUFBRSxTQUFTO1lBQ3JCLFdBQVcsRUFBRSxHQUFH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Q2xDLENBQUM7UUFFRixNQUFNLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLG1CQUFtQixDQUFDO1FBQy9DLE1BQU0sUUFBUSxHQUFHLE1BQU0sS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNoQyxNQUFNLEVBQUUsTUFBTTtZQUNkLE9BQU8sRUFBRTtnQkFDUCxjQUFjLEVBQUUsa0JBQWtCO2dCQUNsQyxlQUFlLEVBQUUsVUFBVSxJQUFJLENBQUMsTUFBTSxFQUFFO2FBQ3pDO1lBQ0QsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDO1lBQ2pDLE1BQU0sRUFBRSxXQUFXLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQztTQUM1QyxDQUFDLENBQUM7UUFFSCxNQUFNLElBQUksR0FBaUIsTUFBTSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFakQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNqQixNQUFNLHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFFRCxPQUFPO1lBQ0wsUUFBUSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLE9BQU8sSUFBSSxFQUFFO1lBQ2pELEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDbEIsWUFBWSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYTtnQkFDdEMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUI7Z0JBQzlDLFdBQVcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVk7YUFDckMsQ0FBQyxDQUFDLENBQUMsU0FBUztTQUNkLENBQUM7SUFDSixDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFouYWkgVmlzaW9uIFN1aXRlIENsaWVudFxuICogTWFpbiBjbGllbnQgY2xhc3MgZm9yIGFsbCB2aXNpb24gb3BlcmF0aW9ucyB1c2luZyBaaGlwdSBBSSdzIEdMTS00ViBBUElcbiAqL1xuXG5pbXBvcnQgeyBaQUlfQVBJX0tFWSwgWkFJX0JBU0VfVVJMLCBaQUlfTU9ERUxfVklTSU9OLCBaQUlfTUFYX1JFVFJJRVMsIFpBSV9USU1FT1VUX01TLCBaQUlfREVCVUcgfSBmcm9tICcuL2Vudi5qcyc7XG5pbXBvcnQgeyBlbmNvZGVJbWFnZUFzQmFzZTY0LCBnZXRJbWFnZU1pbWVUeXBlIH0gZnJvbSAnLi9lbmNvZGVyLmpzJztcbmltcG9ydCB7XG4gIEF1dGhlbnRpY2F0aW9uRXJyb3IsXG4gIFJhdGVMaW1pdEVycm9yLFxuICBJbnZhbGlkUmVxdWVzdEVycm9yLFxuICBBcGlDb25uZWN0aW9uRXJyb3IsXG4gIEltYWdlUHJvY2Vzc2luZ0Vycm9yLFxuICBjcmVhdGVFcnJvckZyb21SZXNwb25zZSxcbn0gZnJvbSAnLi9lcnJvcnMuanMnO1xuXG5pbnRlcmZhY2UgVmlzaW9uTWVzc2FnZSB7XG4gIHJvbGU6ICd1c2VyJyB8ICdhc3Npc3RhbnQnO1xuICBjb250ZW50OiBBcnJheTx7XG4gICAgdHlwZTogJ3RleHQnIHwgJ2ltYWdlX3VybCc7XG4gICAgdGV4dD86IHN0cmluZztcbiAgICBpbWFnZV91cmw/OiB7IHVybDogc3RyaW5nIH07XG4gIH0+O1xufVxuXG5pbnRlcmZhY2UgQ2hhdFJlc3BvbnNlIHtcbiAgaWQ6IHN0cmluZztcbiAgY3JlYXRlZDogbnVtYmVyO1xuICBtb2RlbDogc3RyaW5nO1xuICBjaG9pY2VzOiBBcnJheTx7XG4gICAgaW5kZXg6IG51bWJlcjtcbiAgICBtZXNzYWdlOiB7XG4gICAgICByb2xlOiBzdHJpbmc7XG4gICAgICBjb250ZW50OiBzdHJpbmc7XG4gICAgfTtcbiAgICBmaW5pc2hfcmVhc29uOiBzdHJpbmc7XG4gIH0+O1xuICB1c2FnZT86IHtcbiAgICBwcm9tcHRfdG9rZW5zOiBudW1iZXI7XG4gICAgY29tcGxldGlvbl90b2tlbnM6IG51bWJlcjtcbiAgICB0b3RhbF90b2tlbnM6IG51bWJlcjtcbiAgfTtcbn1cblxuZXhwb3J0IGNsYXNzIFphaVZpc2lvbkNsaWVudCB7XG4gIHByb3RlY3RlZCBhcGlLZXk6IHN0cmluZztcbiAgcHJvdGVjdGVkIGJhc2VVcmw6IHN0cmluZztcbiAgcHJvdGVjdGVkIG1vZGVsOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoYXBpS2V5Pzogc3RyaW5nLCBiYXNlVXJsPzogc3RyaW5nKSB7XG4gICAgdGhpcy5hcGlLZXkgPSBhcGlLZXkgfHwgWkFJX0FQSV9LRVk7XG4gICAgdGhpcy5iYXNlVXJsID0gYmFzZVVybCB8fCBaQUlfQkFTRV9VUkw7XG4gICAgdGhpcy5tb2RlbCA9IFpBSV9NT0RFTF9WSVNJT047XG5cbiAgICBpZiAoIXRoaXMuYXBpS2V5KSB7XG4gICAgICB0aHJvdyBuZXcgQXV0aGVudGljYXRpb25FcnJvcignQVBJIGtleSBpcyByZXF1aXJlZC4gU2V0IFpBSV9BUElfS0VZIGVudmlyb25tZW50IHZhcmlhYmxlLicpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNYWtlIGEgcmVxdWVzdCB0byB0aGUgWmhpcHUgQUkgQVBJIHdpdGggcmV0cnkgbG9naWNcbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBtYWtlUmVxdWVzdChtZXNzYWdlczogVmlzaW9uTWVzc2FnZVtdLCBtYXhUb2tlbnM6IG51bWJlciA9IDEwMjQpOiBQcm9taXNlPENoYXRSZXNwb25zZT4ge1xuICAgIGNvbnN0IHVybCA9IGAke3RoaXMuYmFzZVVybH0vY2hhdC9jb21wbGV0aW9uc2A7XG5cbiAgICBjb25zdCByZXF1ZXN0Qm9keSA9IHtcbiAgICAgIG1vZGVsOiB0aGlzLm1vZGVsLFxuICAgICAgbWVzc2FnZXMsXG4gICAgICBtYXhfdG9rZW5zOiBtYXhUb2tlbnMsXG4gICAgICB0ZW1wZXJhdHVyZTogMC43LFxuICAgIH07XG5cbiAgICBpZiAoWkFJX0RFQlVHKSB7XG4gICAgICBjb25zb2xlLmxvZygnW1phaVZpc2lvbl0gUmVxdWVzdDonLCBKU09OLnN0cmluZ2lmeShyZXF1ZXN0Qm9keSwgbnVsbCwgMikpO1xuICAgIH1cblxuICAgIGxldCBsYXN0RXJyb3I6IEVycm9yIHwgbnVsbCA9IG51bGw7XG4gICAgbGV0IHJldHJpZXMgPSAwO1xuXG4gICAgd2hpbGUgKHJldHJpZXMgPD0gWkFJX01BWF9SRVRSSUVTKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge1xuICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAnQXV0aG9yaXphdGlvbic6IGBCZWFyZXIgJHt0aGlzLmFwaUtleX1gLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkocmVxdWVzdEJvZHkpLFxuICAgICAgICAgIHNpZ25hbDogQWJvcnRTaWduYWwudGltZW91dChaQUlfVElNRU9VVF9NUyksXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG5cbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICAgIC8vIEhhbmRsZSByYXRlIGxpbWl0aW5nXG4gICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDI5IHx8IGRhdGEuZXJyb3I/LmNvZGUgPT09IDEzMDIpIHtcbiAgICAgICAgICAgIGNvbnN0IHJldHJ5QWZ0ZXIgPSA2MDsgLy8gRGVmYXVsdCA2MCBzZWNvbmRzXG4gICAgICAgICAgICBpZiAocmV0cmllcyA8IFpBSV9NQVhfUkVUUklFUykge1xuICAgICAgICAgICAgICBpZiAoWkFJX0RFQlVHKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtaYWlWaXNpb25dIFJhdGUgbGltaXRlZCwgd2FpdGluZyAke3JldHJ5QWZ0ZXJ9cy4uLmApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCByZXRyeUFmdGVyICogMTAwMCkpO1xuICAgICAgICAgICAgICByZXRyaWVzKys7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgbmV3IFJhdGVMaW1pdEVycm9yKCdSYXRlIGxpbWl0IGV4Y2VlZGVkLiBQbGVhc2UgdHJ5IGFnYWluIGxhdGVyLicsIHJldHJ5QWZ0ZXIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEhhbmRsZSBhdXRoZW50aWNhdGlvbiBlcnJvcnNcbiAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSA0MDEgfHwgZGF0YS5lcnJvcj8uY29kZSA9PT0gMTMwMSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEF1dGhlbnRpY2F0aW9uRXJyb3IoZGF0YS5lcnJvcj8ubWVzc2FnZSB8fCAnSW52YWxpZCBBUEkga2V5Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ3JlYXRlIGVycm9yIGZyb20gcmVzcG9uc2VcbiAgICAgICAgICB0aHJvdyBjcmVhdGVFcnJvckZyb21SZXNwb25zZShkYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChaQUlfREVCVUcpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnW1phaVZpc2lvbl0gUmVzcG9uc2U6JywgSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMikpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBsYXN0RXJyb3IgPSBlcnJvciBhcyBFcnJvcjtcblxuICAgICAgICAvLyBEb24ndCByZXRyeSBvbiBhdXRoZW50aWNhdGlvbiBlcnJvcnNcbiAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgQXV0aGVudGljYXRpb25FcnJvcikge1xuICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmV0cnkgb24gY29ubmVjdGlvbiBlcnJvcnNcbiAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgVHlwZUVycm9yICYmIGVycm9yLm1lc3NhZ2UuaW5jbHVkZXMoJ2ZldGNoJykpIHtcbiAgICAgICAgICBpZiAocmV0cmllcyA8IFpBSV9NQVhfUkVUUklFUykge1xuICAgICAgICAgICAgcmV0cmllcysrO1xuICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDEwMDAgKiByZXRyaWVzKSk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhyb3cgbmV3IEFwaUNvbm5lY3Rpb25FcnJvcignRmFpbGVkIHRvIGNvbm5lY3QgdG8gQVBJIHNlcnZlciBhZnRlciBtdWx0aXBsZSBhdHRlbXB0cy4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlLXRocm93IG90aGVyIGVycm9yc1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aHJvdyBsYXN0RXJyb3IgfHwgbmV3IEFwaUNvbm5lY3Rpb25FcnJvcignVW5rbm93biBlcnJvciBvY2N1cnJlZCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkIHZpc2lvbiBtZXNzYWdlIGZyb20gaW1hZ2UgcGF0aFxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGJ1aWxkVmlzaW9uTWVzc2FnZShcbiAgICBpbWFnZVBhdGg6IHN0cmluZyxcbiAgICBwcm9tcHQ6IHN0cmluZ1xuICApOiBQcm9taXNlPFZpc2lvbk1lc3NhZ2U+IHtcbiAgICBjb25zdCBiYXNlNjRJbWFnZSA9IGF3YWl0IGVuY29kZUltYWdlQXNCYXNlNjQoaW1hZ2VQYXRoKTtcblxuICAgIHJldHVybiB7XG4gICAgICByb2xlOiAndXNlcicsXG4gICAgICBjb250ZW50OiBbXG4gICAgICAgIHsgdHlwZTogJ2ltYWdlX3VybCcsIGltYWdlX3VybDogeyB1cmw6IGJhc2U2NEltYWdlIH0gfSxcbiAgICAgICAgeyB0eXBlOiAndGV4dCcsIHRleHQ6IHByb21wdCB9LFxuICAgICAgXSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEFuYWx5emUgYW4gaW1hZ2UgYW5kIGV4dHJhY3Qgc2NlbmUgaW5mb3JtYXRpb25cbiAgICovXG4gIGFzeW5jIGFuYWx5emUoXG4gICAgaW1hZ2VQYXRoOiBzdHJpbmcsXG4gICAgb3B0aW9uczogeyBkZXRhaWw/OiAnbG93JyB8ICdoaWdoJyB8ICdhdXRvJzsgZGV0ZWN0T2JqZWN0cz86IGJvb2xlYW4gfSA9IHt9XG4gICk6IFByb21pc2U8e1xuICAgIHNjZW5lOiBzdHJpbmc7XG4gICAgb2JqZWN0cz86IEFycmF5PHsgbGFiZWw6IHN0cmluZzsgY29uZmlkZW5jZTogbnVtYmVyIH0+O1xuICAgIGNvbG9ycz86IHN0cmluZ1tdO1xuICAgIG1vb2Q/OiBzdHJpbmc7XG4gIH0+IHtcbiAgICBjb25zdCB7IGRldGFpbCA9ICdoaWdoJywgZGV0ZWN0T2JqZWN0cyA9IHRydWUgfSA9IG9wdGlvbnM7XG5cbiAgICBsZXQgcHJvbXB0ID0gYEFuYWx5emUgdGhpcyBpbWFnZSBpbiAke2RldGFpbH0gZGV0YWlsLmA7XG4gICAgaWYgKGRldGVjdE9iamVjdHMpIHtcbiAgICAgIHByb21wdCArPSAnIExpc3QgYWxsIHZpc2libGUgb2JqZWN0cyB3aXRoIGNvbmZpZGVuY2Ugc2NvcmVzLiBJZGVudGlmeSBkb21pbmFudCBjb2xvcnMgYW5kIG92ZXJhbGwgbW9vZC4nO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcm9tcHQgKz0gJyBEZXNjcmliZSB0aGUgc2NlbmUsIG1vb2QsIGFuZCBrZXkgZWxlbWVudHMuJztcbiAgICB9XG5cbiAgICBjb25zdCBtZXNzYWdlID0gYXdhaXQgdGhpcy5idWlsZFZpc2lvbk1lc3NhZ2UoaW1hZ2VQYXRoLCBwcm9tcHQpO1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5tYWtlUmVxdWVzdChbbWVzc2FnZV0sIDIwNDgpO1xuXG4gICAgY29uc3QgY29udGVudCA9IHJlc3BvbnNlLmNob2ljZXNbMF0/Lm1lc3NhZ2U/LmNvbnRlbnQgfHwgJyc7XG5cbiAgICBjb25zdCByZXN1bHQ6IHsgc2NlbmU6IHN0cmluZzsgb2JqZWN0cz86IEFycmF5PHsgbGFiZWw6IHN0cmluZzsgY29uZmlkZW5jZTogbnVtYmVyIH0+OyBjb2xvcnM/OiBzdHJpbmdbXTsgbW9vZD86IHN0cmluZyB9ID0ge1xuICAgICAgc2NlbmU6IGNvbnRlbnQsXG4gICAgfTtcblxuICAgIC8vIFRyeSB0byBwYXJzZSBzdHJ1Y3R1cmVkIGRhdGEgZnJvbSByZXNwb25zZVxuICAgIGlmIChkZXRlY3RPYmplY3RzICYmIGNvbnRlbnQuaW5jbHVkZXMoJ09iamVjdHM6JykpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG9iamVjdHNNYXRjaCA9IGNvbnRlbnQubWF0Y2goL09iamVjdHM6P1xccypcXG4oKD86Wy3igKJdXFxzKlxcdysoPzpcXHMqXFwoXFxkKyU/XFwpKT9cXHMqXFxuPykrKS9pKTtcbiAgICAgICAgaWYgKG9iamVjdHNNYXRjaCkge1xuICAgICAgICAgIHJlc3VsdC5vYmplY3RzID0gb2JqZWN0c01hdGNoWzFdLnNwbGl0KCdcXG4nKVxuICAgICAgICAgICAgLmZpbHRlcihsaW5lID0+IGxpbmUudHJpbSgpKVxuICAgICAgICAgICAgLm1hcChsaW5lID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSBsaW5lLm1hdGNoKC9bLeKAol1cXHMqKFxcdyspKD86XFxzKlxcKChcXGQrKSU/XFwpKT8vKTtcbiAgICAgICAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgbGFiZWw6IG1hdGNoWzFdLCBjb25maWRlbmNlOiBwYXJzZUZsb2F0KG1hdGNoWzJdKSB8fCAwLjkgfTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuZmlsdGVyKEJvb2xlYW4pIGFzIEFycmF5PHsgbGFiZWw6IHN0cmluZzsgY29uZmlkZW5jZTogbnVtYmVyIH0+O1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgLy8gS2VlcCBlbXB0eSBvYmplY3RzIGFycmF5IGlmIHBhcnNpbmcgZmFpbHNcbiAgICAgICAgcmVzdWx0Lm9iamVjdHMgPSBbXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIFByb2Nlc3MgYSB2aWRlbyBhbmQgZXh0cmFjdCBmcmFtZXNcbiAgICovXG4gIGFzeW5jIHByb2Nlc3NWaWRlbyhcbiAgICB2aWRlb1BhdGg6IHN0cmluZyxcbiAgICBvcHRpb25zOiB7IGZyYW1lcz86IG51bWJlcjsgc3VtbWFyaXplPzogYm9vbGVhbiB9ID0ge31cbiAgKTogUHJvbWlzZTx7XG4gICAgc3VtbWFyeTogc3RyaW5nO1xuICAgIGZyYW1lczogQXJyYXk8eyBudW1iZXI6IG51bWJlcjsgZGVzY3JpcHRpb246IHN0cmluZzsgdGltZXN0YW1wPzogbnVtYmVyIH0+O1xuICAgIHNjZW5lcz86IEFycmF5PHsgc3RhcnQ6IG51bWJlcjsgZW5kOiBudW1iZXI7IGRlc2NyaXB0aW9uOiBzdHJpbmcgfT47XG4gIH0+IHtcbiAgICBjb25zdCB7IGZyYW1lcyA9IDUsIHN1bW1hcml6ZSA9IHRydWUgfSA9IG9wdGlvbnM7XG5cbiAgICAvLyBOb3RlOiBUaGlzIGlzIGEgc2ltcGxpZmllZCBpbXBsZW1lbnRhdGlvblxuICAgIC8vIFJlYWwgdmlkZW8gcHJvY2Vzc2luZyB3b3VsZCByZXF1aXJlIEZGbXBlZyBvciBzaW1pbGFyIHRvIGV4dHJhY3QgZnJhbWVzXG4gICAgdGhyb3cgbmV3IEltYWdlUHJvY2Vzc2luZ0Vycm9yKFxuICAgICAgJ1ZpZGVvIHByb2Nlc3NpbmcgcmVxdWlyZXMgRkZtcGVnLiBGb3Igbm93LCBwbGVhc2UgZXh0cmFjdCBmcmFtZXMgbWFudWFsbHkgYW5kIHVzZSBhbmFseXplKCkgb24gZWFjaCBmcmFtZS4nLFxuICAgICAgeyB2aWRlb1BhdGgsIGZyYW1lcyB9XG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHRyYWN0IHRleHQgZnJvbSBhbiBpbWFnZSB1c2luZyBPQ1JcbiAgICovXG4gIGFzeW5jIGV4dHJhY3RUZXh0KFxuICAgIGltYWdlUGF0aDogc3RyaW5nLFxuICAgIG9wdGlvbnM6IHsgbGFuZ3VhZ2U/OiBzdHJpbmc7IHByZXNlcnZlRm9ybWF0dGluZz86IGJvb2xlYW4gfSA9IHt9XG4gICk6IFByb21pc2U8e1xuICAgIHRleHQ6IHN0cmluZztcbiAgICBsYW5ndWFnZT86IHN0cmluZztcbiAgICBjb25maWRlbmNlPzogbnVtYmVyO1xuICB9PiB7XG4gICAgY29uc3QgeyBsYW5ndWFnZSA9ICdhdXRvJywgcHJlc2VydmVGb3JtYXR0aW5nID0gdHJ1ZSB9ID0gb3B0aW9ucztcblxuICAgIGxldCBwcm9tcHQgPSAnRXh0cmFjdCBhbGwgdGV4dCBmcm9tIHRoaXMgaW1hZ2UuJztcbiAgICBpZiAobGFuZ3VhZ2UgIT09ICdhdXRvJykge1xuICAgICAgcHJvbXB0ICs9IGAgVGhlIHRleHQgaXMgaW4gJHtsYW5ndWFnZX0uYDtcbiAgICB9XG4gICAgaWYgKHByZXNlcnZlRm9ybWF0dGluZykge1xuICAgICAgcHJvbXB0ICs9ICcgUHJlc2VydmUgdGhlIG9yaWdpbmFsIGZvcm1hdHRpbmcsIGxpbmUgYnJlYWtzLCBhbmQgc3RydWN0dXJlLic7XG4gICAgfVxuICAgIHByb21wdCArPSAnIFJldHVybiBvbmx5IHRoZSBleHRyYWN0ZWQgdGV4dCwgbm90aGluZyBlbHNlLic7XG5cbiAgICBjb25zdCBtZXNzYWdlID0gYXdhaXQgdGhpcy5idWlsZFZpc2lvbk1lc3NhZ2UoaW1hZ2VQYXRoLCBwcm9tcHQpO1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5tYWtlUmVxdWVzdChbbWVzc2FnZV0sIDQwOTYpO1xuXG4gICAgY29uc3QgdGV4dCA9IHJlc3BvbnNlLmNob2ljZXNbMF0/Lm1lc3NhZ2U/LmNvbnRlbnQgfHwgJyc7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdGV4dDogdGV4dC50cmltKCksXG4gICAgICBsYW5ndWFnZTogbGFuZ3VhZ2UgPT09ICdhdXRvJyA/IHVuZGVmaW5lZCA6IGxhbmd1YWdlLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogU2VhcmNoIHRoZSB3ZWIgdXNpbmcgYW4gaW1hZ2VcbiAgICovXG4gIGFzeW5jIHZpc2lvblNlYXJjaChcbiAgICBpbWFnZVBhdGg6IHN0cmluZyxcbiAgICBvcHRpb25zOiB7IHNlYXJjaFR5cGU/OiAnd2ViJyB8ICdwcm9kdWN0cycgfCAnc2ltaWxhcic7IG1heFJlc3VsdHM/OiBudW1iZXIgfSA9IHt9XG4gICk6IFByb21pc2U8e1xuICAgIHF1ZXJ5OiBzdHJpbmc7XG4gICAgcmVzdWx0czogQXJyYXk8e1xuICAgICAgdGl0bGU6IHN0cmluZztcbiAgICAgIHVybD86IHN0cmluZztcbiAgICAgIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xuICAgICAgc2ltaWxhcml0eT86IG51bWJlcjtcbiAgICB9PjtcbiAgfT4ge1xuICAgIGNvbnN0IHsgc2VhcmNoVHlwZSA9ICd3ZWInLCBtYXhSZXN1bHRzID0gNSB9ID0gb3B0aW9ucztcblxuICAgIGNvbnN0IHByb21wdHMgPSB7XG4gICAgICB3ZWI6ICdEZXNjcmliZSB0aGlzIGltYWdlIGluIGRldGFpbC4gV2hhdCB3b3VsZCB5b3Ugc2VhcmNoIGZvciB0byBmaW5kIHRoaXMgb24gdGhlIHdlYj8nLFxuICAgICAgcHJvZHVjdHM6ICdJZGVudGlmeSBhbnkgcHJvZHVjdHMgaW4gdGhpcyBpbWFnZS4gV2hhdCBhcmUgdGhleSBhbmQgd2hlcmUgbWlnaHQgc29tZW9uZSBidXkgdGhlbT8nLFxuICAgICAgc2ltaWxhcjogJ0Rlc2NyaWJlIHRoaXMgaW1hZ2UuIFdoYXQgc2VhcmNoIHRlcm1zIHdvdWxkIGZpbmQgc2ltaWxhciBpbWFnZXM/JyxcbiAgICB9O1xuXG4gICAgY29uc3QgbWVzc2FnZSA9IGF3YWl0IHRoaXMuYnVpbGRWaXNpb25NZXNzYWdlKGltYWdlUGF0aCwgcHJvbXB0c1tzZWFyY2hUeXBlXSk7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLm1ha2VSZXF1ZXN0KFttZXNzYWdlXSwgMTAyNCk7XG5cbiAgICBjb25zdCBxdWVyeSA9IHJlc3BvbnNlLmNob2ljZXNbMF0/Lm1lc3NhZ2U/LmNvbnRlbnQgfHwgJyc7XG5cbiAgICByZXR1cm4ge1xuICAgICAgcXVlcnksXG4gICAgICByZXN1bHRzOiBbXG4gICAgICAgIHsgdGl0bGU6ICdTZWFyY2ggUXVlcnkgR2VuZXJhdGVkJywgZGVzY3JpcHRpb246IHF1ZXJ5IH0sXG4gICAgICBdLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybSBlbmhhbmNlZCB3ZWIgc2VhcmNoIHdpdGggdmlzaW9uXG4gICAqL1xuICBhc3luYyB2aXNpb25XZWJTZWFyY2goXG4gICAgaW1hZ2VQYXRoOiBzdHJpbmcsXG4gICAgb3B0aW9uczogeyBxdWVyeVR5cGU/OiAnaW5mb3JtYXRpb24nIHwgJ3Nob3BwaW5nJyB8ICdlbnRlcnRhaW5tZW50JzsgbWF4UmVzdWx0cz86IG51bWJlciB9ID0ge31cbiAgKTogUHJvbWlzZTx7XG4gICAgYW5hbHlzaXM6IHN0cmluZztcbiAgICBzdWdnZXN0aW9uczogc3RyaW5nW107XG4gICAgcmVsYXRlZFRvcGljcz86IHN0cmluZ1tdO1xuICB9PiB7XG4gICAgY29uc3QgeyBxdWVyeVR5cGUgPSAnaW5mb3JtYXRpb24nLCBtYXhSZXN1bHRzID0gNSB9ID0gb3B0aW9ucztcblxuICAgIGNvbnN0IHByb21wdHMgPSB7XG4gICAgICBpbmZvcm1hdGlvbjogJ0FuYWx5emUgdGhpcyBpbWFnZSBjb21wcmVoZW5zaXZlbHkuIFdoYXQgaW5mb3JtYXRpb24gZG9lcyBpdCBjb250YWluPyBQcm92aWRlIGRldGFpbGVkIGNvbnRleHQuJyxcbiAgICAgIHNob3BwaW5nOiAnV2hhdCBpdGVtcyBhcmUgdmlzaWJsZSBpbiB0aGlzIGltYWdlPyBEZXNjcmliZSB0aGVtIGFzIGlmIGxpc3RpbmcgcHJvZHVjdHMgZm9yIHNhbGUuJyxcbiAgICAgIGVudGVydGFpbm1lbnQ6ICdEZXNjcmliZSB0aGlzIGltYWdlIGFzIGlmIHJlY29tbWVuZGluZyBpdCBmb3IgZW50ZXJ0YWlubWVudCBwdXJwb3Nlcy4nLFxuICAgIH07XG5cbiAgICBjb25zdCBtZXNzYWdlID0gYXdhaXQgdGhpcy5idWlsZFZpc2lvbk1lc3NhZ2UoaW1hZ2VQYXRoLCBwcm9tcHRzW3F1ZXJ5VHlwZV0pO1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5tYWtlUmVxdWVzdChbbWVzc2FnZV0sIDIwNDgpO1xuXG4gICAgY29uc3QgYW5hbHlzaXMgPSByZXNwb25zZS5jaG9pY2VzWzBdPy5tZXNzYWdlPy5jb250ZW50IHx8ICcnO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGFuYWx5c2lzLFxuICAgICAgc3VnZ2VzdGlvbnM6IFsnU2VhcmNoIGJhc2VkIG9uIHZpc3VhbCBjb250ZW50JywgJ0ZpbmQgc2ltaWxhciBpdGVtcycsICdHZXQgbW9yZSBpbmZvcm1hdGlvbiddLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ2hhdCB3aXRoIHZpc2lvbiBjYXBhYmlsaXRpZXNcbiAgICovXG4gIGFzeW5jIHZpc2lvbkNoYXQoXG4gICAgaW1hZ2VQYXRoOiBzdHJpbmcsXG4gICAgcHJvbXB0OiBzdHJpbmcsXG4gICAgb3B0aW9uczogeyBtb2RlbD86IHN0cmluZzsgdGVtcGVyYXR1cmU/OiBudW1iZXIgfSA9IHt9XG4gICk6IFByb21pc2U8e1xuICAgIHJlc3BvbnNlOiBzdHJpbmc7XG4gICAgdXNhZ2U/OiB7IHByb21wdFRva2VuczogbnVtYmVyOyBjb21wbGV0aW9uVG9rZW5zOiBudW1iZXI7IHRvdGFsVG9rZW5zOiBudW1iZXIgfTtcbiAgfT4ge1xuICAgIGNvbnN0IHsgbW9kZWwsIHRlbXBlcmF0dXJlIH0gPSBvcHRpb25zO1xuICAgIGNvbnN0IGVmZmVjdGl2ZU1vZGVsID0gbW9kZWwgfHwgdGhpcy5tb2RlbDtcbiAgICBjb25zdCBlZmZlY3RpdmVUZW1wZXJhdHVyZSA9IHRlbXBlcmF0dXJlID8/IDAuNztcblxuICAgIGNvbnN0IG1lc3NhZ2UgPSBhd2FpdCB0aGlzLmJ1aWxkVmlzaW9uTWVzc2FnZShpbWFnZVBhdGgsIHByb21wdCk7XG5cbiAgICBjb25zdCByZXF1ZXN0Qm9keSA9IHtcbiAgICAgIG1vZGVsOiBlZmZlY3RpdmVNb2RlbCxcbiAgICAgIG1lc3NhZ2VzOiBbbWVzc2FnZV0sXG4gICAgICBtYXhfdG9rZW5zOiAyMDQ4LFxuICAgICAgdGVtcGVyYXR1cmU6IGVmZmVjdGl2ZVRlbXBlcmF0dXJlLFxuICAgIH07XG5cbiAgICBjb25zdCB1cmwgPSBgJHt0aGlzLmJhc2VVcmx9L2NoYXQvY29tcGxldGlvbnNgO1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7dGhpcy5hcGlLZXl9YCxcbiAgICAgIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShyZXF1ZXN0Qm9keSksXG4gICAgICBzaWduYWw6IEFib3J0U2lnbmFsLnRpbWVvdXQoWkFJX1RJTUVPVVRfTVMpLFxuICAgIH0pO1xuXG4gICAgY29uc3QgZGF0YTogQ2hhdFJlc3BvbnNlID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuXG4gICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgdGhyb3cgY3JlYXRlRXJyb3JGcm9tUmVzcG9uc2UoZGF0YSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3BvbnNlOiBkYXRhLmNob2ljZXNbMF0/Lm1lc3NhZ2U/LmNvbnRlbnQgfHwgJycsXG4gICAgICB1c2FnZTogZGF0YS51c2FnZSA/IHtcbiAgICAgICAgcHJvbXB0VG9rZW5zOiBkYXRhLnVzYWdlLnByb21wdF90b2tlbnMsXG4gICAgICAgIGNvbXBsZXRpb25Ub2tlbnM6IGRhdGEudXNhZ2UuY29tcGxldGlvbl90b2tlbnMsXG4gICAgICAgIHRvdGFsVG9rZW5zOiBkYXRhLnVzYWdlLnRvdGFsX3Rva2VucyxcbiAgICAgIH0gOiB1bmRlZmluZWQsXG4gICAgfTtcbiAgfVxufVxuIl19