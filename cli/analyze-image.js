#!/usr/bin/env node
/**
 * CLI tool: analyze-image
 * Analyze images with scene descriptions and object detection
 */

import { ZaiVisionClient } from '../src/shared/client.js';
import { ZAI_API_KEY } from '../src/shared/env.js';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: analyze-image <image-path> [options]');
    console.error('');
    console.error('Options:');
    console.error('  --detail <level>    Analysis detail: low, high, auto (default: high)');
    console.error('  --no-detect-objects Skip object detection');
    console.error('');
    console.error('Example:');
    console.error('  analyze-image photo.jpg --detail high');
    process.exit(1);
  }

  const imagePath = args[0];
  const detail = args.indexOf('--detail') !== -1 ? args[args.indexOf('--detail') + 1] : 'high';
  const detectObjects = args.indexOf('--no-detect-objects') === -1;

  try {
    const client = new ZaiVisionClient(ZAI_API_KEY || process.env.ZAI_API_KEY);
    const result = await client.analyze(imagePath, { detail, detectObjects });

    console.log(`Scene Analysis:\n${result.scene}\n`);

    if (result.objects && result.objects.length > 0) {
      console.log('Objects detected:');
      result.objects.forEach(obj => {
        console.log(`  - ${obj.label} (${Math.round(obj.confidence * 100)}% confidence)`);
      });
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
