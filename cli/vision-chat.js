#!/usr/bin/env node
/**
 * CLI tool: vision-chat
 * Interactive conversational vision mode
 */

import { ZaiVisionClient } from '../src/shared/client.js';
import { ZAI_API_KEY } from '../src/shared/env.js';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: vision-chat <image-path> <prompt>');
    console.error('');
    console.error('Example:');
    console.error('  vision-chat photo.jpg "What objects are in this image?"');
    console.error('  vision-chat screenshot.jpg "Describe the colors and mood"');
    process.exit(1);
  }

  const imagePath = args[0];
  const prompt = args.slice(1).join(' ') || 'What do you see in this image?';

  try {
    const client = new ZaiVisionClient(ZAI_API_KEY || process.env.ZAI_API_KEY);
    const result = await client.visionChat(imagePath, prompt);

    console.log(`Response:\n${result.response}`);

    if (result.usage) {
      console.log(`\nTokens used: ${result.usage.totalTokens} (${result.usage.promptTokens} prompt + ${result.usage.completionTokens} completion)`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
    throw error;
  }
}

main();
