/**
 * Error Handling
 * Standardized error types for Z.ai Vision Suite
 */
export class ZaiVisionError extends Error {
    code;
    constructor(message, code, details) {
        super(message, { cause: 'ZAI_VISION_ERROR' });
        this.code = code;
        this.name = 'ZaiVisionError';
        this.code = code;
    }
}
export class RateLimitError extends ZaiVisionError {
    constructor(message) {
        super(message, { cause: 'RATE_LIMIT' });
        this.code = '1302';
    }
}
export class ImageNotFoundError extends ZaiVisionError {
    constructor(imagePath) {
        super(`Image not found: ${imagePath}`, { cause: 'FILE_NOT_FOUND' });
        this.code = '404';
    }
}
export function isZaiError(error) {
    return error instanceof ZaiVisionError;
}
/**
 * Format error messages for user display
 */
export function formatError(error) {
    if (error instanceof RateLimitError) {
        return `🚫 Rate limit reached. Wait 60s and try again.`;
    }
    if (error instanceof ImageNotFoundError) {
        return `📁 File not found: ${error.message}`;
    }
    if (error.message.includes('1302')) {
        return `⚠️ Rate limit: ${error.message}`;
    }
    return `❌ Z.ai Error: ${error.message}`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NoYXJlZC9lcnJvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUgsTUFBTSxPQUFPLGNBQWUsU0FBUSxLQUFLO0lBRzlCO0lBRlQsWUFDRSxPQUFlLEVBQ1IsSUFBWSxFQUNuQixPQUFhO1FBRWIsS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFFLEtBQUssRUFBRSxrQkFBa0IsRUFBRSxDQUFDLENBQUM7UUFIdkMsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUluQixJQUFJLENBQUMsSUFBSSxHQUFHLGdCQUFnQixDQUFDO1FBQzdCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ25CLENBQUM7Q0FFQTtBQUVILE1BQU0sT0FBTyxjQUFlLFNBQVEsY0FBYztJQUNoRCxZQUFZLE9BQWU7UUFDekIsS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDO0lBQ3JCLENBQUM7Q0FDRjtBQUVELE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxjQUFjO0lBQ3BELFlBQVksU0FBaUI7UUFDM0IsS0FBSyxDQUFDLG9CQUFvQixTQUFTLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7UUFDcEUsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7SUFDcEIsQ0FBQztDQUNGO0FBRUQsTUFBTSxVQUFVLFVBQVUsQ0FBQyxLQUFjO0lBQ3ZDLE9BQU8sS0FBSyxZQUFZLGNBQWMsQ0FBQztBQUN6QyxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLFVBQVUsV0FBVyxDQUFDLEtBQVk7SUFDdEMsSUFBSSxLQUFLLFlBQVksY0FBYyxFQUFFLENBQUM7UUFDcEMsT0FBTyxnREFBZ0QsQ0FBQztJQUMxRCxDQUFDO0lBRUQsSUFBSSxLQUFLLFlBQVksa0JBQWtCLEVBQUUsQ0FBQztRQUN4QyxPQUFPLHNCQUFzQixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDL0MsQ0FBQztJQUVELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNuQyxPQUFPLGtCQUFrQixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDM0MsQ0FBQztJQUVELE9BQU8saUJBQWlCLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUMxQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBFcnJvciBIYW5kbGluZ1xuICogU3RhbmRhcmRpemVkIGVycm9yIHR5cGVzIGZvciBaLmFpIFZpc2lvbiBTdWl0ZVxuICovXG5cbmV4cG9ydCBjbGFzcyBaYWlWaXNpb25FcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZTogc3RyaW5nLFxuICAgIHB1YmxpYyBjb2RlOiBzdHJpbmcsXG4gICAgZGV0YWlscz86IGFueVxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlLCB7IGNhdXNlOiAnWkFJX1ZJU0lPTl9FUlJPUicgfSk7XG4gICAgdGhpcy5uYW1lID0gJ1phaVZpc2lvbkVycm9yJztcbiAgICB0aGlzLmNvZGUgPSBjb2RlO1xuICB9XG5cbiAgfVxuXG5leHBvcnQgY2xhc3MgUmF0ZUxpbWl0RXJyb3IgZXh0ZW5kcyBaYWlWaXNpb25FcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UsIHsgY2F1c2U6ICdSQVRFX0xJTUlUJyB9KTtcbiAgICB0aGlzLmNvZGUgPSAnMTMwMic7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEltYWdlTm90Rm91bmRFcnJvciBleHRlbmRzIFphaVZpc2lvbkVycm9yIHtcbiAgY29uc3RydWN0b3IoaW1hZ2VQYXRoOiBzdHJpbmcpIHtcbiAgICBzdXBlcihgSW1hZ2Ugbm90IGZvdW5kOiAke2ltYWdlUGF0aH1gLCB7IGNhdXNlOiAnRklMRV9OT1RfRk9VTkQnIH0pO1xuICAgIHRoaXMuY29kZSA9ICc0MDQnO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1phaUVycm9yKGVycm9yOiB1bmtub3duKTogZXJyb3IgaXMgWmFpVmlzaW9uRXJyb3Ige1xuICByZXR1cm4gZXJyb3IgaW5zdGFuY2VvZiBaYWlWaXNpb25FcnJvcjtcbn1cblxuLyoqXG4gKiBGb3JtYXQgZXJyb3IgbWVzc2FnZXMgZm9yIHVzZXIgZGlzcGxheVxuICovXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0RXJyb3IoZXJyb3I6IEVycm9yKTogc3RyaW5nIHtcbiAgaWYgKGVycm9yIGluc3RhbmNlb2YgUmF0ZUxpbWl0RXJyb3IpIHtcbiAgICByZXR1cm4gYPCfmqsgUmF0ZSBsaW1pdCByZWFjaGVkLiBXYWl0IDYwcyBhbmQgdHJ5IGFnYWluLmA7XG4gIH1cblxuICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBJbWFnZU5vdEZvdW5kRXJyb3IpIHtcbiAgICByZXR1cm4gYPCfk4EgRmlsZSBub3QgZm91bmQ6ICR7ZXJyb3IubWVzc2FnZX1gO1xuICB9XG5cbiAgaWYgKGVycm9yLm1lc3NhZ2UuaW5jbHVkZXMoJzEzMDInKSkge1xuICAgIHJldHVybiBg4pqg77iPIFJhdGUgbGltaXQ6ICR7ZXJyb3IubWVzc2FnZX1gO1xuICB9XG5cbiAgcmV0dXJuIGDinYwgWi5haSBFcnJvcjogJHtlcnJvci5tZXNzYWdlfWA7XG59XG4iXX0=