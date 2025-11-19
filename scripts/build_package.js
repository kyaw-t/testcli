import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

if (!process.cwd().includes('packages')) {
  console.error('must be invoked from a package directory');
  process.exit(1);
}

console.log('building typescript files...');

// ensure dist directory exists
mkdirSync('dist', { recursive: true });

// build typescript files
execSync('tsc --build', { stdio: 'inherit' });

// touch dist/.last_build
writeFileSync(join(process.cwd(), 'dist', '.last_build'), '');

console.log('✅ package build complete');
process.exit(0);