import esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const pkg = require(path.resolve(__dirname, 'package.json'));

console.log('📦 bundling ruby cli...');

esbuild
  .build({
    entryPoints: ['packages/cli/index.ts'],
    bundle: true,
    outfile: 'bundle/ruby.js',
    platform: 'node',
    format: 'esm',
    target: 'node20',
    external: [
      // keep these external since they might have native dependencies
    ],
    define: {
      'process.env.CLI_VERSION': JSON.stringify(pkg.version),
    },
    banner: {
      js: `import { createRequire } from 'module'; 
const require = createRequire(import.meta.url); 
globalThis.__filename = require('url').fileURLToPath(import.meta.url); 
globalThis.__dirname = require('path').dirname(globalThis.__filename);`,
    },
    loader: { 
      '.node': 'file' 
    },
    minify: false, // keep readable for debugging
    sourcemap: false,
  })
  .then(() => {
    console.log('✅ bundle complete: bundle/ruby.js');
  })
  .catch((error) => {
    console.error('❌ bundle failed:', error);
    process.exit(1);
  });