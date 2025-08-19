#!/usr/bin/env node
import type { RenderOptions } from 'ink';
import { render } from 'ink';
import React from 'react';
import { App } from './app.tsx';

async function run() {
  // const enterAltSCreenCommand = '\x1b[?1049h';
  // const leaveAltScreenComannd = '\x1b[?1049l';

  // process.stdout.write(enterAltSCreenCommand);
  // process.on('exit', () => process.stdout.write(leaveAltScreenComannd));

  const options: RenderOptions = {
    exitOnCtrlC: true,
  };

  render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    options
  );
}

run();
