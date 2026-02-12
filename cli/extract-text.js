#!/usr/bin/env node
/**
 * CLI tool: extract-text
 * Perform OCR on images with multi-language support
 */

import { ZaiVisionClient } from '../src/shared/client.js';
import { ZAI_API_KEY } from '../src/shared/env.js';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: extract-text <image-path> [options]');
    console.error('');
    console.error('Options:');
    console.error('  --language <lang>   Target language (default: auto)');
    console.error('  --no-preserve-format Don\'t preserve formatting');
    console.error('');
    console.error('Example:');
    console.error('  extract-text document.jpg --language english');
    process.exit(1);
  }

  const imagePath = args[0];
  const language = args.indexOf('--language') !== -1 ? args[args.indexOf('--language') + 1] : 'auto';
  const preserveFormatting = args.indexOf('--no-preserve-format') === -1;

  try {
    const client = new ZaiVisionClient(ZAI_API_KEY || process.env.ZAI_API_KEY);
    const result = await client.extractText(imagePath, {
      language,
      preserveFormatting,
    });

    console.log('Extracted text:');
    console.log('---');
    console.log(result.text);
    console.log('---');
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
    throw error;
  }
}

main();
