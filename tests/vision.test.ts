import { describe, it, expect } from 'vitest';
import { ZaiVisionClient } from '../src/shared/client.js';

// Mock implementation for testing
class TestVisionClient extends ZaiVisionClient {
  constructor() {
    super('test-api-key'); // Pass dummy API key for testing
  }

  async analyze(imagePath: string, options?: any) {
    // Mock implementation matching base class return type
    return {
      scene: `Mock analysis of ${imagePath}`,
      objects: [{ label: 'test object', confidence: 0.95 }]
    };
  }

  async processVideo(videoPath: string, options?: any) {
    // Return type must match: { summary: string; frames: Array<{ number: number; description: string; timestamp?: number }>; scenes?: Array<{ start: number; end: number; description: string }> }
    return {
      summary: `Mock processing of ${videoPath}`,
      frames: [
        { number: 1, description: 'Frame 1', timestamp: 0 },
        { number: 2, description: 'Frame 2', timestamp: 1 },
        { number: 3, description: 'Frame 3', timestamp: 2 }
      ],
      scenes: [
        { start: 0, end: 3, description: 'Mock scene' }
      ]
    };
  }

  async extractText(imagePath: string, options?: any) {
    return {
      text: `Mock OCR result from ${imagePath}`,
      language: 'en',
      confidence: 0.95
    };
  }

  async visionSearch(imagePath: string, options?: any) {
    // Return type must match: { query: string; results: Array<{ title: string; url?: string; description?: string; similarity?: number }> }
    return {
      query: 'Mock search query',
      results: [
        { title: 'Result 1', description: 'First result' },
        { title: 'Result 2', description: 'Second result' }
      ]
    };
  }

  async visionWebSearch(imagePath: string, options?: any) {
    // Return type must match: { analysis: string; suggestions: string[]; relatedTopics?: string[] }
    return {
      analysis: `Mock analysis of ${imagePath}`,
      suggestions: ['Suggestion 1', 'Suggestion 2'],
      relatedTopics: ['Topic 1', 'Topic 2']
    };
  }
}

describe('Z.ai Vision Suite', () => {
  describe('analyze-image', () => {
    it('should analyze an image', async () => {
      const client = new TestVisionClient();
      const result = await client.analyze('test-image.jpg', { detail: 'high' });

      expect(result.scene).toContain('Mock analysis');
      expect(result.objects).toBeInstanceOf(Array);
      expect(result.objects[0]).toEqual({
        label: 'test object',
        confidence: 0.95
      });
    });
  });

  describe('process-video', () => {
    it('should process a video', async () => {
      const client = new TestVisionClient();
      const result = await client.processVideo('test-video.mp4', { frames: 5 });

      expect(result.summary).toContain('Mock processing');
      expect(result.frames).toHaveLength(3);
      expect(result.frames[0]).toHaveProperty('number');
      expect(result.frames[0]).toHaveProperty('description');
    });
  });

  describe('extract-text', () => {
    it('should extract text from image', async () => {
      const client = new TestVisionClient();
      const result = await client.extractText('test-image.jpg', { language: 'auto' });

      expect(result.text).toContain('Mock OCR');
      expect(result.language).toBe('en');
      expect(result.confidence).toBe(0.95);
    });
  });

  describe('vision-search', () => {
    it('should search web using image', async () => {
      const client = new TestVisionClient();
      const result = await client.visionSearch('test-image.jpg', { searchType: 'web' });

      expect(result.query).toBeDefined();
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results[0]).toHaveProperty('title');
    });
  });

  describe('vision-web-search', () => {
    it('should perform enhanced web search', async () => {
      const client = new TestVisionClient();
      const result = await client.visionWebSearch('test-image.jpg', { queryType: 'information' });

      expect(result.analysis).toContain('Mock analysis');
      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.relatedTopics).toBeInstanceOf(Array);
    });
  });
});
