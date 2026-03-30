#!/usr/bin/env node

// Guard script to validate architectural rules
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..', '..');

let hasErrors = false;

// Check if domain layer has external dependencies
const checkDomainPurity = () => {
  const domainDir = join(rootDir, 'src', 'domain');

  if (!existsSync(domainDir)) {
    console.log('✓ No domain layer yet');
    return;
  }

  const files = getAllTsFiles(domainDir);

  files.forEach(file => {
    const content = readFileSync(file, 'utf-8');

    // Check for forbidden imports in domain
    const forbiddenPatterns = [
      /from ['"]express['"]/,
      /from ['"].*\/presentation/,
      /from ['"].*\/infrastructure/,
      /require\(['"]express['"]\)/,
    ];

    forbiddenPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        console.error(`✗ Domain violation in ${file}: external dependency detected`);
        hasErrors = true;
      }
    });
  });

  if (!hasErrors) {
    console.log('✓ Domain layer purity check passed');
  }
};

function existsSync(path) {
  try {
    statSync(path);
    return true;
  } catch {
    return false;
  }
}

function getAllTsFiles(dir, files = []) {
  if (!existsSync(dir)) return files;

  const entries = readdirSync(dir);

  entries.forEach(entry => {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      getAllTsFiles(fullPath, files);
    } else if (entry.endsWith('.ts')) {
      files.push(fullPath);
    }
  });

  return files;
}

// Run all guards
checkDomainPurity();

if (hasErrors) {
  console.error('\n✗ Guard checks failed');
  process.exit(1);
} else {
  console.log('\n✓ All guard checks passed');
  process.exit(0);
}
