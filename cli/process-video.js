#!/usr/bin/env node
/**
 * CLI tool: process-video
 * Extract frames, segment scenes, and summarize videos
 */

import { ZaiVisionClient } from '../src/shared/client.js';
import { ZAI_API_KEY } from '../src/shared/env.js';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: process-video <video-path> [options]');
    console.error('');
    console.error('Options:');
    console.error('  --frames <n>        Number of frames to extract (default: 5)');
    console.error('  --no-summarize      Don\'t generate summary');
    console.error('');
    console.error('Example:');
    console.error('  process-video clip.mp4 --frames 10');
    process.exit(1);
  }

  const videoPath = args[0];
  const frames = parseInt(args[args.indexOf('--frames') + 1] || '5');
  const summarize = args.indexOf('--no-summarize') === -1;

  try {
    const client = new ZaiVisionClient(ZAI_API_KEY || process.env.ZAI_API_KEY);
    const result = await client.processVideo(videoPath, { frames, summarize });

    console.log(result.summary || result);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
    throw error;
  }
}

main();
