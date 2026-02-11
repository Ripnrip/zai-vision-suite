/**
 * Z.ai Vision Client
 * Shared TypeScript client for Z.ai GLM-4.6V vision API
 */
export interface ZaiVisionOptions {
    detail?: 'low' | 'medium' | 'high';
    detectObjects?: boolean;
    preserveFormat?: boolean;
    language?: 'auto' | 'en' | 'zh';
    searchType?: 'web' | 'product' | 'visual_similar';
    maxResults?: number;
}
export interface ZaiAnalysisResult {
    scene: string;
    objects: Array<{
        name: string;
        confidence: number;
        boundingBox?: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    }>;
    text: Array<{
        content: string;
        confidence: number;
        position: {
            x: number;
            y: number;
        };
    }>;
    colors: string[];
    style: string;
    mood: string;
}
export declare class ZaiVisionClient {
    private apiKey;
    private baseURL;
    private model;
    constructor(apiKey?: string, baseURL?: string, model?: string);
    /**
     * Encode image to base64 or return URL
     */
    private encodeImage;
    /**
     * Call Z.ai Vision API
     */
    analyze(imagePath: string, prompt: string, options?: ZaiVisionOptions): Promise<ZaiAnalysisResult>;
    /**
     * Parse API response into structured result
     */
    private parseAnalysis;
    /**
     * Check if client is configured
     */
    isConfigured(): boolean;
}
//# sourceMappingURL=vision-client.d.ts.map