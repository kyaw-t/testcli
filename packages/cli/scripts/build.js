#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { glob } from 'glob';

// comprehensive regex patterns for different import/export styles
const STATIC_IMPORT_EXPORT = /(?:(?:import|export)\s+(?:type\s+)?(?:\*\s+as\s+\w+|{[^}]+}|\w+)?\s*(?:,\s*(?:\*\s+as\s+\w+|{[^}]+}|\w+))?\s+from\s+|(?:import|export)\s*\(?\s*)(['"`])((?:\.{1,2}\/)+[^'"`]+?)\1/gm;

const DYNAMIC_IMPORT = /import\s*\(\s*(['"`])((?:\.{1,2}\/)+[^'"`]+?)\1\s*\)/gm;

async function resolveImportPath(currentFile, importPath) {
  const dir = path.dirname(currentFile);
  const resolvedPath = path.join(dir, importPath);
  
  // check if it's a directory with index.js
  try {
    const stats = await fs.stat(resolvedPath);
    if (stats.isDirectory()) {
      if (existsSync(path.join(resolvedPath, 'index.js'))) {
        return `${importPath}/index.js`;
      }
    }
  } catch {
    // not a directory, treat as file
  }
  
  // remove any ts extension and add .js
  const cleanPath = importPath.replace(/\.(ts|tsx|mts|cts)$/, '');
  
  // don't add .js if it already has an extension
  if (path.extname(cleanPath) && !cleanPath.endsWith('.ts') && !cleanPath.endsWith('.tsx')) {
    return cleanPath;
  }
  
  return cleanPath + '.js';
}

async function transformFile(filePath) {
  let content = await fs.readFile(filePath, 'utf8');
  let modified = false;

  // transform static imports/exports
  const staticMatches = [...content.matchAll(STATIC_IMPORT_EXPORT)];
  for (const match of staticMatches) {
    const [fullMatch, quote, importPath] = match;
    
    // only process relative imports that don't already end with .js/.mjs/.cjs
    if (importPath.startsWith('.') && !importPath.match(/\.(js|mjs|cjs)$/)) {
      const newPath = await resolveImportPath(filePath, importPath);
      const newMatch = fullMatch.replace(importPath, newPath);
      content = content.replace(fullMatch, newMatch);
      modified = true;
    }
  }

  // transform dynamic imports
  const dynamicMatches = [...content.matchAll(DYNAMIC_IMPORT)];
  for (const match of dynamicMatches) {
    const [fullMatch, quote, importPath] = match;
    
    if (importPath.startsWith('.') && !importPath.match(/\.(js|mjs|cjs)$/)) {
      const newPath = await resolveImportPath(filePath, importPath);
      const newMatch = fullMatch.replace(importPath, newPath);
      content = content.replace(fullMatch, newMatch);
      modified = true;
    }
  }

  if (modified) {
    await fs.writeFile(filePath, content);
    console.log(`✓ ${path.relative(process.cwd(), filePath)}`);
  }
}

// main build process
async function build() {
  console.log('🔨 building with swc...');
  execSync('swc src -d dist --strip-leading-paths', { stdio: 'inherit' });

  console.log('\n🔧 transforming imports...');
  const files = await glob('dist/**/*.js');
  
  if (files.length === 0) {
    console.log('no .js files found in dist/');
    return;
  }
  
  await Promise.all(files.map(transformFile));
  console.log(`\n✅ build complete! transformed ${files.length} files`);
}

// run build
build().catch(error => {
  console.error('❌ build failed:', error);
  process.exit(1);
});
