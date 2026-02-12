/**
 * Custom error types for Z.ai Vision Suite
 * Provides specific error types for different failure scenarios
 */
/**
 * Base error class for all Z.ai Vision errors
 */
export declare class ZaiVisionError extends Error {
    code: string;
    details?: unknown | undefined;
    constructor(message: string, code: string, details?: unknown | undefined);
}
/**
 * Authentication failed - invalid or missing API key
 */
export declare class AuthenticationError extends ZaiVisionError {
    constructor(message?: string);
}
/**
 * Rate limit exceeded - too many requests
 */
export declare class RateLimitError extends ZaiVisionError {
    retryAfter?: number | undefined;
    constructor(message?: string, retryAfter?: number | undefined);
}
/**
 * Invalid request - malformed input or parameters
 */
export declare class InvalidRequestError extends ZaiVisionError {
    constructor(message: string, details?: unknown);
}
/**
 * API connection error - network or server issues
 */
export declare class ApiConnectionError extends ZaiVisionError {
    constructor(message?: string);
}
/**
 * Image processing failed - invalid image or processing error
 */
export declare class ImageProcessingError extends ZaiVisionError {
    constructor(message: string, details?: unknown);
}
/**
 * File not found or inaccessible
 */
export declare class FileNotFoundError extends ZaiVisionError {
    constructor(path: string);
}
/**
 * Helper function to create appropriate error from API response
 */
export declare function createErrorFromResponse(response: {
    error?: {
        code?: number;
        message?: string;
    };
}): ZaiVisionError;
//# sourceMappingURL=errors.d.ts.map