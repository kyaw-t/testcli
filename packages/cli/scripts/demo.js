#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { App } from '../dist/app.js';

console.log('🎬 starting chat interface demo...\n');

// force demo mode with a timeout to show progression
render(React.createElement(App, { demoMode: true }));

// auto-exit after demo
setTimeout(() => {
  console.log('\n✅ demo complete! this shows:');
  console.log('  - real-time todo updates');
  console.log('  - agent message progression');
  console.log('  - status tracking');
  console.log('  - command execution flow');
  console.log('\nrun in a proper terminal for interactive mode.');
  process.exit(0);
}, 8000);