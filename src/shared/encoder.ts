/**
 * Image encoding utilities for Z.ai Vision Suite
 * Handles conversion of images to formats suitable for API requests
 */

import { readFile, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { extname } from 'path';

/**
 * Supported image mime types
 */
const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
};

/**
 * Get MIME type from file extension
 */
export function getImageMimeType(path: string): string {
  const ext = extname(path).toLowerCase();
  return MIME_TYPES[ext] || 'image/jpeg';
}

/**
 * Validate that an image file exists and is readable
 */
export function validateImagePath(path: string): boolean {
  return existsSync(path);
}

/**
 * Encode an image file as a base64 data URL
 */
export async function encodeImageAsBase64(imagePath: string): Promise<string> {
  if (!validateImagePath(imagePath)) {
    throw new Error(`Image file not found: ${imagePath}`);
  }

  const buffer = await readFile(imagePath);
  const mimeType = getImageMimeType(imagePath);
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Encode an image file for multipart upload
 */
export async function encodeImageAsMultipart(imagePath: string): Promise<{
  data: Buffer;
  mimeType: string;
  size: number;
}> {
  if (!validateImagePath(imagePath)) {
    throw new Error(`Image file not found: ${imagePath}`);
  }

  const data = await readFile(imagePath);
  const mimeType = getImageMimeType(imagePath);
  const stats = await stat(imagePath);

  return { data, mimeType, size: stats.size };
}

/**
 * Extract base64 data from a data URL
 */
export function extractBase64FromDataUrl(dataUrl: string): string {
  const matches = dataUrl.match(/^data:image\/[a-z]+;base64,(.+)$/);
  return matches ? matches[1] : dataUrl;
}
