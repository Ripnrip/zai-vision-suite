/**
 * Z.ai Vision Suite
 * Main entry point for the library
 */

// Export core client
export { ZaiVisionClient } from './shared/client.js';

// Export error types
export {
  ZaiVisionError,
  AuthenticationError,
  RateLimitError,
  InvalidRequestError,
  ApiConnectionError,
  ImageProcessingError,
  FileNotFoundError,
  createErrorFromResponse,
} from './shared/errors.js';

// Export environment configuration
export {
  getEnv,
  ZAI_API_KEY,
  ZAI_BASE_URL,
  ZAI_MODEL_VISION,
  ZAI_MAX_RETRIES,
  ZAI_TIMEOUT_MS,
  ZAI_DEBUG,
} from './shared/env.js';

// Export encoder utilities
export {
  getImageMimeType,
  validateImagePath,
  encodeImageAsBase64,
  encodeImageAsMultipart,
  extractBase64FromDataUrl,
} from './shared/encoder.js';

// Default export
export { ZaiVisionClient as default } from './shared/client.js';
