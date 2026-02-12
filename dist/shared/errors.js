/**
 * Custom error types for Z.ai Vision Suite
 * Provides specific error types for different failure scenarios
 */
/**
 * Base error class for all Z.ai Vision errors
 */
export class ZaiVisionError extends Error {
    code;
    details;
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'ZaiVisionError';
    }
}
/**
 * Authentication failed - invalid or missing API key
 */
export class AuthenticationError extends ZaiVisionError {
    constructor(message = 'Authentication failed. Check your API key.') {
        super(message, 'AUTH_FAILED');
        this.name = 'AuthenticationError';
    }
}
/**
 * Rate limit exceeded - too many requests
 */
export class RateLimitError extends ZaiVisionError {
    retryAfter;
    constructor(message = 'Rate limit exceeded.', retryAfter) {
        super(message, 'RATE_LIMITED');
        this.retryAfter = retryAfter;
        this.name = 'RateLimitError';
    }
}
/**
 * Invalid request - malformed input or parameters
 */
export class InvalidRequestError extends ZaiVisionError {
    constructor(message, details) {
        super(message, 'INVALID_REQUEST', details);
        this.name = 'InvalidRequestError';
    }
}
/**
 * API connection error - network or server issues
 */
export class ApiConnectionError extends ZaiVisionError {
    constructor(message = 'Failed to connect to API server.') {
        super(message, 'CONNECTION_ERROR');
        this.name = 'ApiConnectionError';
    }
}
/**
 * Image processing failed - invalid image or processing error
 */
export class ImageProcessingError extends ZaiVisionError {
    constructor(message, details) {
        super(message, 'PROCESSING_FAILED', details);
        this.name = 'ImageProcessingError';
    }
}
/**
 * File not found or inaccessible
 */
export class FileNotFoundError extends ZaiVisionError {
    constructor(path) {
        super(`File not found: ${path}`, 'FILE_NOT_FOUND');
        this.name = 'FileNotFoundError';
    }
}
/**
 * Helper function to create appropriate error from API response
 */
export function createErrorFromResponse(response) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NoYXJlZC9lcnJvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUg7O0dBRUc7QUFDSCxNQUFNLE9BQU8sY0FBZSxTQUFRLEtBQUs7SUFHOUI7SUFDQTtJQUhULFlBQ0UsT0FBZSxFQUNSLElBQVksRUFDWixPQUFpQjtRQUV4QixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFIUixTQUFJLEdBQUosSUFBSSxDQUFRO1FBQ1osWUFBTyxHQUFQLE9BQU8sQ0FBVTtRQUd4QixJQUFJLENBQUMsSUFBSSxHQUFHLGdCQUFnQixDQUFDO0lBQy9CLENBQUM7Q0FDRjtBQUVEOztHQUVHO0FBQ0gsTUFBTSxPQUFPLG1CQUFvQixTQUFRLGNBQWM7SUFDckQsWUFBWSxVQUFrQiw0Q0FBNEM7UUFDeEUsS0FBSyxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsSUFBSSxHQUFHLHFCQUFxQixDQUFDO0lBQ3BDLENBQUM7Q0FDRjtBQUVEOztHQUVHO0FBQ0gsTUFBTSxPQUFPLGNBQWUsU0FBUSxjQUFjO0lBR3ZDO0lBRlQsWUFDRSxVQUFrQixzQkFBc0IsRUFDakMsVUFBbUI7UUFFMUIsS0FBSyxDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQztRQUZ4QixlQUFVLEdBQVYsVUFBVSxDQUFTO1FBRzFCLElBQUksQ0FBQyxJQUFJLEdBQUcsZ0JBQWdCLENBQUM7SUFDL0IsQ0FBQztDQUNGO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLE9BQU8sbUJBQW9CLFNBQVEsY0FBYztJQUNyRCxZQUFZLE9BQWUsRUFBRSxPQUFpQjtRQUM1QyxLQUFLLENBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxJQUFJLEdBQUcscUJBQXFCLENBQUM7SUFDcEMsQ0FBQztDQUNGO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLE9BQU8sa0JBQW1CLFNBQVEsY0FBYztJQUNwRCxZQUFZLFVBQWtCLGtDQUFrQztRQUM5RCxLQUFLLENBQUMsT0FBTyxFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLElBQUksR0FBRyxvQkFBb0IsQ0FBQztJQUNuQyxDQUFDO0NBQ0Y7QUFFRDs7R0FFRztBQUNILE1BQU0sT0FBTyxvQkFBcUIsU0FBUSxjQUFjO0lBQ3RELFlBQVksT0FBZSxFQUFFLE9BQWlCO1FBQzVDLEtBQUssQ0FBQyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLElBQUksR0FBRyxzQkFBc0IsQ0FBQztJQUNyQyxDQUFDO0NBQ0Y7QUFFRDs7R0FFRztBQUNILE1BQU0sT0FBTyxpQkFBa0IsU0FBUSxjQUFjO0lBQ25ELFlBQVksSUFBWTtRQUN0QixLQUFLLENBQUMsbUJBQW1CLElBQUksRUFBRSxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDbkQsSUFBSSxDQUFDLElBQUksR0FBRyxtQkFBbUIsQ0FBQztJQUNsQyxDQUFDO0NBQ0Y7QUFFRDs7R0FFRztBQUNILE1BQU0sVUFBVSx1QkFBdUIsQ0FBQyxRQUV2QztJQUNDLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDO0lBQ2xDLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxJQUFJLGVBQWUsQ0FBQztJQUUzRCxRQUFRLElBQUksRUFBRSxDQUFDO1FBQ2IsS0FBSyxJQUFJLENBQUM7UUFDVixLQUFLLElBQUk7WUFDUCxPQUFPLElBQUksbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUMsS0FBSyxJQUFJO1lBQ1AsT0FBTyxJQUFJLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNyQztZQUNFLE9BQU8sSUFBSSxjQUFjLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxTQUFTLENBQUMsQ0FBQztJQUN0RSxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3VzdG9tIGVycm9yIHR5cGVzIGZvciBaLmFpIFZpc2lvbiBTdWl0ZVxuICogUHJvdmlkZXMgc3BlY2lmaWMgZXJyb3IgdHlwZXMgZm9yIGRpZmZlcmVudCBmYWlsdXJlIHNjZW5hcmlvc1xuICovXG5cbi8qKlxuICogQmFzZSBlcnJvciBjbGFzcyBmb3IgYWxsIFouYWkgVmlzaW9uIGVycm9yc1xuICovXG5leHBvcnQgY2xhc3MgWmFpVmlzaW9uRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICBwdWJsaWMgY29kZTogc3RyaW5nLFxuICAgIHB1YmxpYyBkZXRhaWxzPzogdW5rbm93blxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSAnWmFpVmlzaW9uRXJyb3InO1xuICB9XG59XG5cbi8qKlxuICogQXV0aGVudGljYXRpb24gZmFpbGVkIC0gaW52YWxpZCBvciBtaXNzaW5nIEFQSSBrZXlcbiAqL1xuZXhwb3J0IGNsYXNzIEF1dGhlbnRpY2F0aW9uRXJyb3IgZXh0ZW5kcyBaYWlWaXNpb25FcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZyA9ICdBdXRoZW50aWNhdGlvbiBmYWlsZWQuIENoZWNrIHlvdXIgQVBJIGtleS4nKSB7XG4gICAgc3VwZXIobWVzc2FnZSwgJ0FVVEhfRkFJTEVEJyk7XG4gICAgdGhpcy5uYW1lID0gJ0F1dGhlbnRpY2F0aW9uRXJyb3InO1xuICB9XG59XG5cbi8qKlxuICogUmF0ZSBsaW1pdCBleGNlZWRlZCAtIHRvbyBtYW55IHJlcXVlc3RzXG4gKi9cbmV4cG9ydCBjbGFzcyBSYXRlTGltaXRFcnJvciBleHRlbmRzIFphaVZpc2lvbkVycm9yIHtcbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZTogc3RyaW5nID0gJ1JhdGUgbGltaXQgZXhjZWVkZWQuJyxcbiAgICBwdWJsaWMgcmV0cnlBZnRlcj86IG51bWJlclxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlLCAnUkFURV9MSU1JVEVEJyk7XG4gICAgdGhpcy5uYW1lID0gJ1JhdGVMaW1pdEVycm9yJztcbiAgfVxufVxuXG4vKipcbiAqIEludmFsaWQgcmVxdWVzdCAtIG1hbGZvcm1lZCBpbnB1dCBvciBwYXJhbWV0ZXJzXG4gKi9cbmV4cG9ydCBjbGFzcyBJbnZhbGlkUmVxdWVzdEVycm9yIGV4dGVuZHMgWmFpVmlzaW9uRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcsIGRldGFpbHM/OiB1bmtub3duKSB7XG4gICAgc3VwZXIobWVzc2FnZSwgJ0lOVkFMSURfUkVRVUVTVCcsIGRldGFpbHMpO1xuICAgIHRoaXMubmFtZSA9ICdJbnZhbGlkUmVxdWVzdEVycm9yJztcbiAgfVxufVxuXG4vKipcbiAqIEFQSSBjb25uZWN0aW9uIGVycm9yIC0gbmV0d29yayBvciBzZXJ2ZXIgaXNzdWVzXG4gKi9cbmV4cG9ydCBjbGFzcyBBcGlDb25uZWN0aW9uRXJyb3IgZXh0ZW5kcyBaYWlWaXNpb25FcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZyA9ICdGYWlsZWQgdG8gY29ubmVjdCB0byBBUEkgc2VydmVyLicpIHtcbiAgICBzdXBlcihtZXNzYWdlLCAnQ09OTkVDVElPTl9FUlJPUicpO1xuICAgIHRoaXMubmFtZSA9ICdBcGlDb25uZWN0aW9uRXJyb3InO1xuICB9XG59XG5cbi8qKlxuICogSW1hZ2UgcHJvY2Vzc2luZyBmYWlsZWQgLSBpbnZhbGlkIGltYWdlIG9yIHByb2Nlc3NpbmcgZXJyb3JcbiAqL1xuZXhwb3J0IGNsYXNzIEltYWdlUHJvY2Vzc2luZ0Vycm9yIGV4dGVuZHMgWmFpVmlzaW9uRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcsIGRldGFpbHM/OiB1bmtub3duKSB7XG4gICAgc3VwZXIobWVzc2FnZSwgJ1BST0NFU1NJTkdfRkFJTEVEJywgZGV0YWlscyk7XG4gICAgdGhpcy5uYW1lID0gJ0ltYWdlUHJvY2Vzc2luZ0Vycm9yJztcbiAgfVxufVxuXG4vKipcbiAqIEZpbGUgbm90IGZvdW5kIG9yIGluYWNjZXNzaWJsZVxuICovXG5leHBvcnQgY2xhc3MgRmlsZU5vdEZvdW5kRXJyb3IgZXh0ZW5kcyBaYWlWaXNpb25FcnJvciB7XG4gIGNvbnN0cnVjdG9yKHBhdGg6IHN0cmluZykge1xuICAgIHN1cGVyKGBGaWxlIG5vdCBmb3VuZDogJHtwYXRofWAsICdGSUxFX05PVF9GT1VORCcpO1xuICAgIHRoaXMubmFtZSA9ICdGaWxlTm90Rm91bmRFcnJvcic7XG4gIH1cbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gY3JlYXRlIGFwcHJvcHJpYXRlIGVycm9yIGZyb20gQVBJIHJlc3BvbnNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFcnJvckZyb21SZXNwb25zZShyZXNwb25zZToge1xuICBlcnJvcj86IHsgY29kZT86IG51bWJlcjsgbWVzc2FnZT86IHN0cmluZyB9O1xufSk6IFphaVZpc2lvbkVycm9yIHtcbiAgY29uc3QgY29kZSA9IHJlc3BvbnNlLmVycm9yPy5jb2RlO1xuICBjb25zdCBtZXNzYWdlID0gcmVzcG9uc2UuZXJyb3I/Lm1lc3NhZ2UgfHwgJ1Vua25vd24gZXJyb3InO1xuXG4gIHN3aXRjaCAoY29kZSkge1xuICAgIGNhc2UgMTMwMTpcbiAgICBjYXNlIDEzMDI6XG4gICAgICByZXR1cm4gbmV3IEF1dGhlbnRpY2F0aW9uRXJyb3IobWVzc2FnZSk7XG4gICAgY2FzZSAxMzAzOlxuICAgICAgcmV0dXJuIG5ldyBSYXRlTGltaXRFcnJvcihtZXNzYWdlKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIG5ldyBaYWlWaXNpb25FcnJvcihtZXNzYWdlLCBjb2RlPy50b1N0cmluZygpIHx8ICdVTktOT1dOJyk7XG4gIH1cbn1cbiJdfQ==