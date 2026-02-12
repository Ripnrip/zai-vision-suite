#!/usr/bin/env node
/**
 * CLI tool: vision-search
 * Search the web using images as queries
 */

import { ZaiVisionClient } from '../src/shared/client.js';
import { ZAI_API_KEY } from '../src/shared/env.js';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: vision-search <image-path> [options]');
    console.error('');
    console.error('Options:');
    console.error('  --type <type>       Search type: web, products, similar (default: web)');
    console.error('  --max-results <n>   Maximum number of results (default: 5)');
    console.error('');
    console.error('Example:');
    console.error('  vision-search product.jpg --type products');
    process.exit(1);
  }

  const imagePath = args[0];
  const searchType = args[args.indexOf('--type') + 1] || 'web';
  const maxResults = parseInt(args[args.indexOf('--max-results') + 1] || '5');

  try {
    const client = new ZaiVisionClient(ZAI_API_KEY || process.env.ZAI_API_KEY);
    const result = await client.visionSearch(imagePath, { searchType, maxResults });

    console.log(`Search Query:\n${result.query}\n`);
    console.log('Results:');
    result.results.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.title}`);
      if (r.description) console.log(`     ${r.description}`);
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
    throw error;
  }
}

main();
