import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { getCliVersion } from '../utils/version.js';

export interface CliArgs {
  prompt?: string;
  version?: boolean;
  help?: boolean;
  debug?: boolean;
  nonInteractive?: boolean;
}

export interface Config {
  args: CliArgs;
  version: string;
  debug: boolean;
}

export function parseArguments(): CliArgs {
  const argv = yargs(hideBin(process.argv))
    .scriptName('ruby')
    .usage('$0 [prompt]')
    .version(false) // disable built-in version handling
    .option('version', {
      alias: 'v',
      type: 'boolean',
      description: 'show version information',
    })
    .option('debug', {
      alias: 'd',
      type: 'boolean',
      description: 'enable debug output',
    })
    .option('non-interactive', {
      alias: 'n',
      type: 'boolean',
      description: 'run in non-interactive mode',
    })
    .help()
    .parseSync();

  return {
    prompt: argv._[0] as string | undefined,
    version: Boolean(argv.version),
    help: Boolean(argv.help),
    debug: Boolean(argv.debug),
    nonInteractive: Boolean(argv['non-interactive']),
  };
}

export function loadCliConfig(): Config {
  const args = parseArguments();
  const version = getCliVersion();
  
  return {
    args,
    version,
    debug: args.debug || false,
  };
}