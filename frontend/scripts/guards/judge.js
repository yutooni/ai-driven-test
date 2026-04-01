#!/usr/bin/env node

import { readFileSync, readdirSync, statSync, mkdirSync, appendFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..', '..');
const srcDir = join(rootDir, 'src');
const logsDir = join(rootDir, 'logs');
const guardLogPath = join(logsDir, 'guards.ndjson');

function existsSync(path) {
  try {
    statSync(path);
    return true;
  } catch {
    return false;
  }
}

function getAllTsxFiles(dir, files = []) {
  if (!existsSync(dir)) return files;

  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      getAllTsxFiles(fullPath, files);
    } else if (entry.endsWith('.tsx') || entry.endsWith('.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Extracts JSDoc metadata from source code before the function definition
 */
function extractJSDocMetadata(guardName) {
  const sourceCode = readFileSync(__filename, 'utf-8');

  // Find all JSDoc comments followed by functions
  const pattern = /\/\*\*([\s\S]*?)\*\/\s*function\s+(\w+)\s*\(/g;
  let match;

  while ((match = pattern.exec(sourceCode)) !== null) {
    const [, jsdocContent, functionName] = match;

    if (functionName === guardName) {
      const whatMatch = jsdocContent.match(/@what\s+(.+?)(?=\n|$)/);
      const whyMatch = jsdocContent.match(/@why\s+(.+?)(?=\n|$)/);
      const failureMatch = jsdocContent.match(/@failure\s+(.+?)(?=\n|$)/);

      return {
        what: whatMatch ? whatMatch[1].trim() : '',
        why: whyMatch ? whyMatch[1].trim() : '',
        failure: failureMatch ? failureMatch[1].trim() : '',
      };
    }
  }

  return { what: '', why: '', failure: '' };
}

/**
 * Runs a guard function with timing and logging
 */
function runGuard(guardFn) {
  const metadata = extractJSDocMetadata(guardFn.name);
  const startedAt = new Date().toISOString();
  const startTime = Date.now();

  const result = guardFn();

  const finishedAt = new Date().toISOString();
  const durationMs = Date.now() - startTime;

  const enrichedResult = {
    name: result.name,
    what: metadata.what,
    why: metadata.why,
    failure: metadata.failure,
    ok: result.ok,
    errors: result.errors,
    startedAt,
    finishedAt,
    durationMs,
  };

  // Ensure logs directory exists
  if (!existsSync(logsDir)) {
    mkdirSync(logsDir, { recursive: true });
  }

  // Append to NDJSON log
  appendFileSync(guardLogPath, JSON.stringify(enrichedResult) + '\n', 'utf-8');

  return result;
}

/**
 * @what Checks all components have corresponding story files
 * @why Storybook is SSOT for UI components - story-less components are not documented
 * @failure Component file exists without .stories.tsx (e.g., Button.tsx without Button.stories.tsx)
 */
function checkStoryRequired() {
  const componentsDir = join(srcDir, 'components');
  if (!existsSync(componentsDir)) {
    return { name: 'story-required', ok: true, errors: [] };
  }

  const files = getAllTsxFiles(componentsDir);
  const errors = [];

  // Filter to component files (exclude .stories.tsx, .test.tsx, page.tsx, layout.tsx)
  const componentFiles = files.filter(file => {
    const fileName = file.split('/').pop();
    return (
      fileName.endsWith('.tsx') &&
      !fileName.endsWith('.stories.tsx') &&
      !fileName.endsWith('.test.tsx') &&
      fileName !== 'page.tsx' &&
      fileName !== 'layout.tsx'
    );
  });

  for (const file of componentFiles) {
    const storyFile = file.replace('.tsx', '.stories.tsx');
    if (!existsSync(storyFile)) {
      errors.push(`${file.replace(rootDir + '/', '')}: missing story file`);
    }
  }

  return {
    name: 'story-required',
    ok: errors.length === 0,
    errors,
  };
}

/**
 * @what Checks presentational components have no data fetching logic
 * @why Presentational components should receive data via props, not fetch directly
 * @failure Component contains fetch, axios, useSWR, or useQuery
 */
function checkNoDataFetchInPresentational() {
  const componentsDir = join(srcDir, 'components');
  if (!existsSync(componentsDir)) {
    return { name: 'no-data-fetch-in-presentational', ok: true, errors: [] };
  }

  const files = getAllTsxFiles(componentsDir);
  const errors = [];

  // Filter to component files (exclude .stories.tsx, .test.tsx)
  const componentFiles = files.filter(file => {
    const fileName = file.split('/').pop();
    return (
      (fileName.endsWith('.tsx') || fileName.endsWith('.ts')) &&
      !fileName.endsWith('.stories.tsx') &&
      !fileName.endsWith('.test.tsx')
    );
  });

  const forbiddenPatterns = [
    { pattern: /\bfetch\(/, description: 'fetch(' },
    { pattern: /from ['"]axios['"]/, description: 'axios' },
    { pattern: /require\(['"]axios['"]\)/, description: 'axios' },
    { pattern: /\buseSWR\b/, description: 'useSWR' },
    { pattern: /\buseQuery\b/, description: 'useQuery (react-query)' },
  ];

  for (const file of componentFiles) {
    const content = readFileSync(file, 'utf-8');

    for (const { pattern, description } of forbiddenPatterns) {
      if (pattern.test(content)) {
        errors.push(`${file.replace(rootDir + '/', '')}: data fetching detected (${description})`);
      }
    }
  }

  return {
    name: 'no-data-fetch-in-presentational',
    ok: errors.length === 0,
    errors,
  };
}

/**
 * @what Checks UI code has no temporary workarounds or shortcuts
 * @why Prevents technical debt in frontend codebase
 * @failure Code contains 'any', @ts-ignore, @ts-expect-error, .skip(), .only(), or TODO/FIXME temporary
 */
function checkUIAntiShortcut() {
  const files = getAllTsxFiles(srcDir);
  const errors = [];

  const shortcutPatterns = [
    { pattern: /:\s*any\b/, description: 'any' },
    { pattern: /@ts-ignore/, description: '@ts-ignore' },
    { pattern: /@ts-expect-error/, description: '@ts-expect-error' },
    { pattern: /\.skip\(/, description: '.skip(' },
    { pattern: /\.only\(/, description: '.only(' },
    { pattern: /TODO temporary/, description: 'TODO temporary' },
    { pattern: /FIXME temporary/, description: 'FIXME temporary' },
  ];

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');

    for (const { pattern, description } of shortcutPatterns) {
      if (pattern.test(content)) {
        errors.push(`${file.replace(rootDir + '/', '')}: shortcut detected (${description})`);
      }
    }
  }

  return {
    name: 'ui-anti-shortcut',
    ok: errors.length === 0,
    errors,
  };
}

/**
 * @what Checks page.tsx files are composition-focused with minimal UI implementation
 * @why Pages should compose components, not implement UI directly
 * @failure page.tsx has too many JSX lines or className usages (>15 lines or >5 classNames)
 */
function checkComponentLayering() {
  const appDir = join(srcDir, 'app');
  if (!existsSync(appDir)) {
    return { name: 'component-layering', ok: true, errors: [] };
  }

  const files = getAllTsxFiles(appDir);
  const errors = [];

  // Filter to page.tsx files only
  const pageFiles = files.filter(file => file.endsWith('page.tsx'));

  const MAX_JSX_LINES = 15;
  const MAX_CLASSNAME_COUNT = 5;

  for (const file of pageFiles) {
    const content = readFileSync(file, 'utf-8');

    // Count JSX lines (lines containing < or > but not import/export)
    const lines = content.split('\n');
    const jsxLines = lines.filter(line => {
      const trimmed = line.trim();
      return (
        (trimmed.includes('<') || trimmed.includes('>')) &&
        !trimmed.startsWith('import') &&
        !trimmed.startsWith('export') &&
        !trimmed.startsWith('//') &&
        !trimmed.startsWith('*')
      );
    });

    // Count className usages
    const classNameMatches = content.match(/className=/g);
    const classNameCount = classNameMatches ? classNameMatches.length : 0;

    if (jsxLines.length > MAX_JSX_LINES) {
      errors.push(
        `${file.replace(rootDir + '/', '')}: too many JSX lines (${jsxLines.length} > ${MAX_JSX_LINES}). Extract UI to components.`
      );
    }

    if (classNameCount > MAX_CLASSNAME_COUNT) {
      errors.push(
        `${file.replace(rootDir + '/', '')}: too many className usages (${classNameCount} > ${MAX_CLASSNAME_COUNT}). Extract UI to components.`
      );
    }
  }

  return {
    name: 'component-layering',
    ok: errors.length === 0,
    errors,
  };
}

const results = [
  runGuard(checkStoryRequired),
  runGuard(checkNoDataFetchInPresentational),
  runGuard(checkUIAntiShortcut),
  runGuard(checkComponentLayering),
];

const failed = results.filter(r => !r.ok);

for (const result of results) {
  if (result.ok) {
    console.log(`✓ guard:${result.name} passed`);
  } else {
    console.error(`✗ guard:${result.name} failed`);
    for (const error of result.errors) {
      console.error(`  - ${error}`);
    }
  }
}

if (failed.length > 0) {
  console.error('\n✗ Frontend guard checks failed');
  process.exit(1);
} else {
  console.log('\n✓ All frontend guard checks passed');
  process.exit(0);
}
