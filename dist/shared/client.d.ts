/**
 * Z.ai Vision Suite Client
 * Main client class for all vision operations using Zhipu AI's GLM-4V API
 */
interface VisionMessage {
    role: 'user' | 'assistant';
    content: Array<{
        type: 'text' | 'image_url';
        text?: string;
        image_url?: {
            url: string;
        };
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
export declare class ZaiVisionClient {
    protected apiKey: string;
    protected baseUrl: string;
    protected model: string;
    constructor(apiKey?: string, baseUrl?: string);
    /**
     * Make a request to the Zhipu AI API with retry logic
     */
    protected makeRequest(messages: VisionMessage[], maxTokens?: number): Promise<ChatResponse>;
    /**
     * Build vision message from image path
     */
    protected buildVisionMessage(imagePath: string, prompt: string): Promise<VisionMessage>;
    /**
     * Analyze an image and extract scene information
     */
    analyze(imagePath: string, options?: {
        detail?: 'low' | 'high' | 'auto';
        detectObjects?: boolean;
    }): Promise<{
        scene: string;
        objects?: Array<{
            label: string;
            confidence: number;
        }>;
        colors?: string[];
        mood?: string;
    }>;
    /**
     * Process a video and extract frames
     */
    processVideo(videoPath: string, options?: {
        frames?: number;
        summarize?: boolean;
    }): Promise<{
        summary: string;
        frames: Array<{
            number: number;
            description: string;
            timestamp?: number;
        }>;
        scenes?: Array<{
            start: number;
            end: number;
            description: string;
        }>;
    }>;
    /**
     * Extract text from an image using OCR
     */
    extractText(imagePath: string, options?: {
        language?: string;
        preserveFormatting?: boolean;
    }): Promise<{
        text: string;
        language?: string;
        confidence?: number;
    }>;
    /**
     * Search the web using an image
     */
    visionSearch(imagePath: string, options?: {
        searchType?: 'web' | 'products' | 'similar';
        maxResults?: number;
    }): Promise<{
        query: string;
        results: Array<{
            title: string;
            url?: string;
            description?: string;
            similarity?: number;
        }>;
    }>;
    /**
     * Perform enhanced web search with vision
     */
    visionWebSearch(imagePath: string, options?: {
        queryType?: 'information' | 'shopping' | 'entertainment';
        maxResults?: number;
    }): Promise<{
        analysis: string;
        suggestions: string[];
        relatedTopics?: string[];
    }>;
    /**
     * Chat with vision capabilities
     */
    visionChat(imagePath: string, prompt: string, options?: {
        model?: string;
        temperature?: number;
    }): Promise<{
        response: string;
        usage?: {
            promptTokens: number;
            completionTokens: number;
            totalTokens: number;
        };
    }>;
}
export {};
//# sourceMappingURL=client.d.ts.map