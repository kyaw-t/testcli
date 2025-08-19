#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { App } from '../dist/app.js';

console.log('🎯 starting autocomplete demo...\n');

// force interactive input by mocking TTY
const originalIsTTY = process.stdin.isTTY;
const originalSetRawMode = process.stdin.setRawMode;
process.stdin.isTTY = true;
process.stdin.setRawMode = () => true;

console.log('type "/" to see autocomplete appear underneath input!');
console.log('use ↑↓ to navigate, tab to select, escape to cancel\n');

render(React.createElement(App, { demoMode: false }));

// cleanup when done
process.on('SIGINT', () => {
  process.stdin.isTTY = originalIsTTY;
  process.stdin.setRawMode = originalSetRawMode;
  process.exit(0);
});