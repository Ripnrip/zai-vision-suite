/**
 * Environment configuration for Z.ai Vision Suite
 * Reads configuration from environment variables with sensible defaults
 */

/**
 * Get an environment variable value with optional default
 */
export function getEnv(key: string, defaultValue?: string): string {
  return process.env[key] || defaultValue || '';
}

/**
 * Zhipu AI API key - required for all requests
 * Get your key at: https://open.bigmodel.cn/
 */
export const ZAI_API_KEY = getEnv('ZAI_API_KEY');

/**
 * Zhipu AI API base URL
 */
export const ZAI_BASE_URL = getEnv('ZAI_BASE_URL', 'https://open.bigmodel.cn/api/paas/v4');

/**
 * Vision model to use for image analysis
 */
export const ZAI_MODEL_VISION = getEnv('ZAI_MODEL_VISION', 'glm-4v');

/**
 * Maximum retry attempts for failed requests
 */
export const ZAI_MAX_RETRIES = parseInt(getEnv('ZAI_MAX_RETRIES', '3')) || 3;

/**
 * Request timeout in milliseconds
 */
export const ZAI_TIMEOUT_MS = parseInt(getEnv('ZAI_TIMEOUT_MS', '30000')) || 30000;

/**
 * Enable debug logging
 */
export const ZAI_DEBUG = getEnv('ZAI_DEBUG', 'false') === 'true';
