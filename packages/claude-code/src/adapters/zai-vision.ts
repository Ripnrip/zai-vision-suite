/**
 * Claude Code Adapter
 * Provides Z.ai vision commands to Claude Code CLI
 */

import { zaiVisionClient, zaiVisionOptions } from 'zai-vision-suite';

export interface ClaudeCommandHandler {
  canHandle(command: string): boolean;
  execute(command: string, args: Record<string, any>): Promise<string>;
}

export class ZaiVisionAdapter implements ClaudeCommandHandler {
  canHandle(command: string): boolean {
    return [
      'analyze-image',
      'process-video',
      'extract-text',
      'vision-search',
      'vision-web-search',
      'vision-chat'
    ].includes(command);
  }

  async execute(command: string, args: Record<string, any>): Promise<string> {
    const client = new zaiVisionClient();

    switch (command) {
      case 'analyze-image': {
        const imagePath = args.get(0)?.value as string;
        const detail = (args.get('detail')?.value as string) || 'medium';
        const detectObjects = args.get('detect-objects')?.value !== false;

        if (!imagePath) {
          throw new Error('Image path is required');
        }

        const result = await client.analyze(imagePath, { detail, detectObjects });
        return result.scene || result;
      }

      case 'process-video': {
        const videoPath = args.get(0)?.value as string;
        const frames = parseInt(args.get('frames')?.value as string) || '5';
        const segmentScenes = args.get('segment-scenes')?.value !== false;
        const summarize = args.get('summarize')?.value !== false;

        if (!videoPath) {
          throw new Error('Video path is required');
        }

        const result = await client.processVideo(videoPath, { frames, segmentScenes, summarize });
        return result.summary || result;
      }

      case 'extract-text': {
        const imagePath = args.get(0)?.value as string;
        const preserveFormat = args.get('preserve-format')?.value !== false;
        const language = (args.get('language')?.value as string) || 'auto';

        if (!imagePath) {
          throw new Error('Image path is required');
        }

        const result = await client.extractText(imagePath, { preserveFormat, language });
        return result;
      }

      case 'vision-search': {
        const imagePath = args.get(0)?.value as string;
        const searchType = (args.get('type')?.value as string) || 'web';
        const maxResults = parseInt(args.get('max-results')?.value as string) || '5';

        if (!imagePath) {
          throw new Error('Image path is required');
        }

        const result = await client.visionSearch(imagePath, { searchType, maxResults });
        return result;
      }

      case 'vision-web-search': {
        const imagePath = args.get(0)?.value as string;
        const queryType = (args.get('query-type')?.value as string) || 'information';
        const maxResults = parseInt(args.get('max-results')?.value as string) || '5';

        if (!imagePath) {
          throw new Error('Image path is required');
        }

        const result = await client.visionWebSearch(imagePath, { queryType, maxResults });
        return result;
      }

      case 'vision-chat': {
        // Interactive conversational mode
        return 'Interactive vision chat mode. Upload images and ask follow-up questions.';
      }

      default:
        throw new Error(`Unknown command: ${command}`);
    }
  }
}
