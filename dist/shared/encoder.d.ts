/**
 * Image encoding utilities for Z.ai Vision Suite
 * Handles conversion of images to formats suitable for API requests
 */
/**
 * Get MIME type from file extension
 */
export declare function getImageMimeType(path: string): string;
/**
 * Validate that an image file exists and is readable
 */
export declare function validateImagePath(path: string): boolean;
/**
 * Encode an image file as a base64 data URL
 */
export declare function encodeImageAsBase64(imagePath: string): Promise<string>;
/**
 * Encode an image file for multipart upload
 */
export declare function encodeImageAsMultipart(imagePath: string): Promise<{
    data: Buffer;
    mimeType: string;
    size: number;
}>;
/**
 * Extract base64 data from a data URL
 */
export declare function extractBase64FromDataUrl(dataUrl: string): string;
//# sourceMappingURL=encoder.d.ts.map