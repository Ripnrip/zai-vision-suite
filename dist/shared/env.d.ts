/**
 * Environment configuration for Z.ai Vision Suite
 * Reads configuration from environment variables with sensible defaults
 */
/**
 * Get an environment variable value with optional default
 */
export declare function getEnv(key: string, defaultValue?: string): string;
/**
 * Zhipu AI API key - required for all requests
 * Get your key at: https://open.bigmodel.cn/
 */
export declare const ZAI_API_KEY: string;
/**
 * Zhipu AI API base URL
 */
export declare const ZAI_BASE_URL: string;
/**
 * Vision model to use for image analysis
 */
export declare const ZAI_MODEL_VISION: string;
/**
 * Maximum retry attempts for failed requests
 */
export declare const ZAI_MAX_RETRIES: number;
/**
 * Request timeout in milliseconds
 */
export declare const ZAI_TIMEOUT_MS: number;
/**
 * Enable debug logging
 */
export declare const ZAI_DEBUG: boolean;
//# sourceMappingURL=env.d.ts.map