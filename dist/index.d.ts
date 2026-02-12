/**
 * Z.ai Vision Suite
 * Main entry point for the library
 */
export { ZaiVisionClient } from './shared/client.js';
export { ZaiVisionError, AuthenticationError, RateLimitError, InvalidRequestError, ApiConnectionError, ImageProcessingError, FileNotFoundError, createErrorFromResponse, } from './shared/errors.js';
export { getEnv, ZAI_API_KEY, ZAI_BASE_URL, ZAI_MODEL_VISION, ZAI_MAX_RETRIES, ZAI_TIMEOUT_MS, ZAI_DEBUG, } from './shared/env.js';
export { getImageMimeType, validateImagePath, encodeImageAsBase64, encodeImageAsMultipart, extractBase64FromDataUrl, } from './shared/encoder.js';
export { ZaiVisionClient as default } from './shared/client.js';
//# sourceMappingURL=index.d.ts.map