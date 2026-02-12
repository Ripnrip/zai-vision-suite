/**
 * Claude Code Adapter
 * Provides Z.ai vision commands to Claude Code CLI
 */

import { ZaiVisionClient } from '../../src/shared/client.js';

export interface ClaudeCommandHandler {
  canHandle(command: string): boolean;
  execute(command: string, args: Record<string, any>): Promise<string>;
}

export class ZaiVisionAdapter implements ClaudeCommandHandler {
  private client: ZaiVisionClient;

  constructor(apiKey?: string) {
    this.client = new ZaiVisionClient(apiKey);
  }

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

    switch (command) {
      case 'analyze-image': {
        const imagePath = args.get(0)?.value as string;
        const detail = (args.get('detail')?.value as string) || 'medium';
        const detectObjects = args.get('detect-objects')?.value !== false;

        if (!imagePath) {
          throw new Error('Image path is required');
        }

        const result = await this.client.analyze(imagePath, { detail, detectObjects });
        let output = `Scene Analysis:\n${result.scene}`;
        if (result.objects && result.objects.length > 0) {
          output += `\n\nObjects:\n${result.objects.map(o => `- ${o.label} (${Math.round(o.confidence * 100)}%)`).join('\n')}`;
        }
        return output;
      }

      case 'process-video': {
        const videoPath = args.get(0)?.value as string;
        const frames = parseInt(args.get('frames')?.value as string) || '5';
        const segmentScenes = args.get('segment-scenes')?.value !== false;
        const summarize = args.get('summarize')?.value !== false;

        if (!videoPath) {
          throw new Error('Video path is required');
        }

        const result = await this.client.processVideo(videoPath, { frames, segmentScenes, summarize });
        return result.summary || result;
      }

      case 'extract-text': {
        const imagePath = args.get(0)?.value as string;
        const preserveFormat = args.get('preserve-format')?.value !== false;
        const language = (args.get('language')?.value as string) || 'auto';

        if (!imagePath) {
          throw new Error('Image path is required');
        }

        const result = await this.client.extractText(imagePath, { preserveFormat, language });
        return result;
      }

      case 'vision-search': {
        const imagePath = args.get(0)?.value as string;
        const searchType = (args.get('type')?.value as string) || 'web';
        const maxResults = parseInt(args.get('max-results')?.value as string) || '5';

        if (!imagePath) {
          throw new Error('Image path is required');
        }

        const result = await this.client.visionSearch(imagePath, { searchType, maxResults });
        return `Search Query:\n${result.query}\n\nResults:\n${result.results.map(r => `- ${r.title}${r.description ? ': ' + r.description : ''}`).join('\n')}`;
      }

      case 'vision-web-search': {
        const imagePath = args.get(0)?.value as string;
        const queryType = (args.get('query-type')?.value as string) || 'information';
        const maxResults = parseInt(args.get('max-results')?.value as string) || '5';

        if (!imagePath) {
          throw new Error('Image path is required');
        }

        const result = await this.client.visionWebSearch(imagePath, { queryType, maxResults });
        return `Analysis:\n${result.analysis}\n\nSuggestions:\n${result.suggestions.map(s => `- ${s}`).join('\n')}`;
      }

      case 'vision-chat': {
        const imagePath = args.get(0)?.value as string;
        const prompt = args.get(1)?.value as string || 'What do you see in this image?';

        if (!imagePath) {
          throw new Error('Image path is required');
        }

        const result = await this.client.visionChat(imagePath, prompt);
        return result.response;
      }

      default:
        throw new Error(`Unknown command: ${command}`);
    }
  }
}
