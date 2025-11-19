import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// get package.json path relative to this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// when built, we need to go up from dist/src/utils to get to package.json
// when running from source, we need to go up from src/utils
const packageJsonPath = __dirname.includes('/dist/')
  ? join(__dirname, '../../../package.json')
  : join(__dirname, '../../package.json');

export function getCliVersion(): string {
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    return packageJson.version || '0.0.0';
  } catch (error) {
    console.warn('failed to read package.json version:', error);
    return '0.0.0';
  }
}