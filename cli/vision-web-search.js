#!/usr/bin/env node
/**
 * CLI tool: vision-web-search
 * Enhanced web search with visual context
 */

import { ZaiVisionClient } from '../src/shared/client.js';
import { ZAI_API_KEY } from '../src/shared/env.js';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: vision-web-search <image-path> [options]');
    console.error('');
    console.error('Options:');
    console.error('  --query-type <type> Query type: information, shopping, entertainment');
    console.error('  --max-results <n>   Maximum number of results (default: 5)');
    console.error('');
    console.error('Example:');
    console.error('  vision-web-search scene.jpg --query-type information');
    process.exit(1);
  }

  const imagePath = args[0];
  const queryType = args[args.indexOf('--query-type') + 1] || 'information';
  const maxResults = parseInt(args[args.indexOf('--max-results') + 1] || '5');

  try {
    const client = new ZaiVisionClient(ZAI_API_KEY || process.env.ZAI_API_KEY);
    const result = await client.visionWebSearch(imagePath, { queryType, maxResults });

    console.log(`Analysis:\n${result.analysis}\n`);
    console.log('Suggestions:');
    result.suggestions.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s}`);
    });
    if (result.relatedTopics && result.relatedTopics.length > 0) {
      console.log('\nRelated Topics:');
      result.relatedTopics.forEach(t => console.log(`  - ${t}`));
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
