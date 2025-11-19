#!/usr/bin/env node

import './src/ruby.js';
import { main } from './src/ruby.js';

// --- global entry point ---
main().catch((error) => {
  console.error('an unexpected critical error occurred:');
  if (error instanceof Error) {
    console.error(error.stack);
  } else {
    console.error(String(error));
  }
  process.exit(1);
});
