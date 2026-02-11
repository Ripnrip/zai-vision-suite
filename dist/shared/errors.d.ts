/**
 * Error Handling
 * Standardized error types for Z.ai Vision Suite
 */
export declare class ZaiVisionError extends Error {
    code: string;
    constructor(message: string, code: string, details?: any);
}
export declare class RateLimitError extends ZaiVisionError {
    constructor(message: string);
}
export declare class ImageNotFoundError extends ZaiVisionError {
    constructor(imagePath: string);
}
export declare function isZaiError(error: unknown): error is ZaiVisionError;
/**
 * Format error messages for user display
 */
export declare function formatError(error: Error): string;
//# sourceMappingURL=errors.d.ts.map