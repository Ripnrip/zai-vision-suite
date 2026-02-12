/**
 * Custom error types for Z.ai Vision Suite
 * Provides specific error types for different failure scenarios
 */

/**
 * Base error class for all Z.ai Vision errors
 */
export class ZaiVisionError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ZaiVisionError';
  }
}

/**
 * Authentication failed - invalid or missing API key
 */
export class AuthenticationError extends ZaiVisionError {
  constructor(message: string = 'Authentication failed. Check your API key.') {
    super(message, 'AUTH_FAILED');
    this.name = 'AuthenticationError';
  }
}

/**
 * Rate limit exceeded - too many requests
 */
export class RateLimitError extends ZaiVisionError {
  constructor(
    message: string = 'Rate limit exceeded.',
    public retryAfter?: number
  ) {
    super(message, 'RATE_LIMITED');
    this.name = 'RateLimitError';
  }
}

/**
 * Invalid request - malformed input or parameters
 */
export class InvalidRequestError extends ZaiVisionError {
  constructor(message: string, details?: unknown) {
    super(message, 'INVALID_REQUEST', details);
    this.name = 'InvalidRequestError';
  }
}

/**
 * API connection error - network or server issues
 */
export class ApiConnectionError extends ZaiVisionError {
  constructor(message: string = 'Failed to connect to API server.') {
    super(message, 'CONNECTION_ERROR');
    this.name = 'ApiConnectionError';
  }
}

/**
 * Image processing failed - invalid image or processing error
 */
export class ImageProcessingError extends ZaiVisionError {
  constructor(message: string, details?: unknown) {
    super(message, 'PROCESSING_FAILED', details);
    this.name = 'ImageProcessingError';
  }
}

/**
 * File not found or inaccessible
 */
export class FileNotFoundError extends ZaiVisionError {
  constructor(path: string) {
    super(`File not found: ${path}`, 'FILE_NOT_FOUND');
    this.name = 'FileNotFoundError';
  }
}

/**
 * Helper function to create appropriate error from API response
 */
export function createErrorFromResponse(response: {
  error?: { code?: number; message?: string };
}): ZaiVisionError {
  const code = response.error?.code;
  const message = response.error?.message || 'Unknown error';

  switch (code) {
    case 1301:
    case 1302:
      return new AuthenticationError(message);
    case 1303:
      return new RateLimitError(message);
    default:
      return new ZaiVisionError(message, code?.toString() || 'UNKNOWN');
  }
}
