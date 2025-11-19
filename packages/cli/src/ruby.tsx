import React from 'react';
import { render } from 'ink';
import { App } from './ui/App.js';
import { loadCliConfig } from './config/config.js';

export const main = async () => {
  try {
    const config = loadCliConfig();
    
    // debug: check what args we got
    if (config.debug) {
      console.error('debug: config.args =', config.args);
    }
    
    // handle version flag
    if (config.args.version) {
      // eslint-disable-next-line no-console
      console.log(`ruby cli v${config.version}`);
      return; // return instead of process.exit for cleaner shutdown
    }
    
    // handle help flag
    if (config.args.help) {
      // yargs already handles help output
      process.exit(0);
    }
    
    // handle non-interactive mode
    if (config.args.nonInteractive && config.args.prompt) {
      // eslint-disable-next-line no-console
      console.log(`non-interactive mode: "${config.args.prompt}"`);
      // todo: implement actual ai call here
      process.exit(0);
    }
    
    // start interactive mode
    render(<App config={config} />);
  } catch (error) {
    console.error('failed to start ruby cli:', error);
    process.exit(1);
  }
};

// auto-run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}