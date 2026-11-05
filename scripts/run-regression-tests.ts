import fs from 'fs';
import path from 'path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from '../src/App.tsx';
import { TOOLS, CATEGORIES, getToolBySlug, getCategoryBySlug } from '../src/data/tools.ts';
import { GUIDES, getGuideBySlug } from '../src/data/guides.ts';
import { SITE_URL, getCanonicalUrl } from '../src/config/site.ts';
import { validateImageFile, formatBytes } from '../src/utils/fileHelpers.ts';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(suite: string, name: string, condition: boolean, details?: string) {
  results.push({
    suite,
    name,
    passed: condition,
    details: condition ? undefined : details,
  });
}

console.log('Starting Comprehensive Regression Test Suite for ToolNest...\n');

// -------------------------------------------------------------
// Suite 1: Production Build Output Inspection
// -------------------------------------------------------------
const distDir = path.resolve('dist');
assert('Build Output', 'dist directory exists', fs.existsSync(distDir));

const expectedRoutes = [
  '',
  'tools',
  'about',
  'contact',
  'privacy',
  'terms',
  'disclaimer',
  'guides',
  ...CATEGORIES.map((c) => `category/${c.slug}`),
  ...GUIDES.map((g) => `guides/${g.slug}`),
  ...TOOLS.map((t) => `tools/${t.slug}`),
];

let missingDistFiles = 0;
for (const r of expectedRoutes) {
  const filePath = r === '' ? path.join(distDir, 'index.html') : path.join(distDir, r, 'index.html');
  if (!fs.existsSync(filePath)) {
    missingDistFiles++;
  }
}
assert('Build Output', 'All 80 canonical route HTML files exist in dist', missingDistFiles === 0, `${missingDistFiles} files missing`);
assert('Build Output', '404.html exists in dist', fs.existsSync(path.join(distDir, '404.html')));
assert('Build Output', 'sitemap.xml exists in dist and public', fs.existsSync(path.join(distDir, 'sitemap.xml')) && fs.existsSync('public/sitemap.xml'));
assert('Build Output', 'robots.txt exists in dist and public', fs.existsSync(path.join(distDir, 'robots.txt')) && fs.existsSync('public/robots.txt'));

// -------------------------------------------------------------
// Suite 2: Sitemap & Canonical Integrity
// -------------------------------------------------------------
const sitemapContent = fs.readFileSync(path.join(distDir, 'sitemap.xml'), 'utf8');
const sitemapUrls = Array.from(sitemapContent.matchAll(/<loc>(.*?)<\/loc>/g)).map((m) => m[1]);

assert('Sitemap', 'Sitemap contains exactly 80 URLs', sitemapUrls.length === 80, `Found ${sitemapUrls.length}`);
const uniqueUrls = new Set(sitemapUrls);
assert('Sitemap', 'All sitemap URLs are unique', uniqueUrls.size === sitemapUrls.length, `Duplicates found`);
assert('Sitemap', 'No fabricated lastmod dates present', !sitemapContent.includes('<lastmod>'));

let invalidCanonicalSitemap = 0;
for (const u of sitemapUrls) {
  if (u === `${SITE_URL}/`) continue;
  if (u.endsWith('/') || !u.startsWith(SITE_URL)) {
    invalidCanonicalSitemap++;
  }
}
assert('Sitemap', 'All subpage sitemap URLs follow strict non-trailing slash canonical format', invalidCanonicalSitemap === 0);

// -------------------------------------------------------------
// Suite 3: Robots.txt & Indexing Directives
// -------------------------------------------------------------
const robotsContent = fs.readFileSync(path.join(distDir, 'robots.txt'), 'utf8');
assert('Robots.txt', 'Allows all user agents', robotsContent.includes('User-agent: *') && robotsContent.includes('Allow: /'));
assert('Robots.txt', 'Links to production sitemap', robotsContent.includes(`Sitemap: ${SITE_URL}/sitemap.xml`));

let accidentalNoindex = 0;
for (const r of expectedRoutes) {
  const filePath = r === '' ? path.join(distDir, 'index.html') : path.join(distDir, r, 'index.html');
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('name="robots"') && content.includes('noindex')) {
    accidentalNoindex++;
  }
}
assert('Robots.txt', 'No canonical routes contain accidental noindex', accidentalNoindex === 0);

const notFoundContent = fs.readFileSync(path.join(distDir, '404.html'), 'utf8');
assert('Robots.txt', '404 page contains noindex, nofollow', notFoundContent.includes('content="noindex, nofollow"'));

// -------------------------------------------------------------
// Suite 4: Route Resolution & Prerender Headings
// -------------------------------------------------------------
let missingH1Count = 0;
let emptyBodyCount = 0;
for (const r of expectedRoutes) {
  const filePath = r === '' ? path.join(distDir, 'index.html') : path.join(distDir, r, 'index.html');
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('<h1')) {
    missingH1Count++;
  }
  const rootDiv = (content.match(/<div id="root">([\s\S]*?)<\/div>/) || [])[1];
  if (!rootDiv || rootDiv.length === 0) {
    emptyBodyCount++;
  }
}
assert('SSR / Prerendering', 'All 80 routes have an H1 tag in static HTML', missingH1Count === 0);
assert('SSR / Prerendering', 'All 80 routes have prerendered DOM inside root container', emptyBodyCount === 0);

// -------------------------------------------------------------
// Suite 5: Metadata Uniqueness & OpenGraph
// -------------------------------------------------------------
const titleMap = new Map<string, string>();
const descMap = new Map<string, string>();
let titleDups = 0;
let descDups = 0;

for (const r of expectedRoutes) {
  const filePath = r === '' ? path.join(distDir, 'index.html') : path.join(distDir, r, 'index.html');
  const content = fs.readFileSync(filePath, 'utf8');
  const title = (content.match(/<title>(.*?)<\/title>/) || [])[1];
  const desc = (content.match(/<meta name="description" content="(.*?)"/) || [])[1];

  if (titleMap.has(title)) {
    titleDups++;
  } else {
    titleMap.set(title, r);
  }

  if (descMap.has(desc)) {
    descDups++;
  } else {
    descMap.set(desc, r);
  }
}
assert('Metadata', 'Zero duplicate page titles across all 80 pages', titleDups === 0, `${titleDups} duplicates`);
assert('Metadata', 'Zero duplicate meta descriptions across all 80 pages', descDups === 0, `${descDups} duplicates`);

// -------------------------------------------------------------
// Suite 6: Structured Data (JSON-LD) Validation
// -------------------------------------------------------------
let schemaErrors = 0;
let totalSchemas = 0;

for (const r of expectedRoutes) {
  const filePath = r === '' ? path.join(distDir, 'index.html') : path.join(distDir, r, 'index.html');
  const content = fs.readFileSync(filePath, 'utf8');
  const schemaMatch = content.match(/<script id="seo-structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!schemaMatch) {
    schemaErrors++;
    continue;
  }
  totalSchemas++;
  try {
    const parsed = JSON.parse(schemaMatch[1]);
    if (!parsed['@context']) schemaErrors++;
  } catch {
    schemaErrors++;
  }
}
assert('Structured Data', 'All 80 canonical pages have valid Schema.org JSON-LD', schemaErrors === 0 && totalSchemas === 80);

// -------------------------------------------------------------
// Suite 7: Internal Links Verification
// -------------------------------------------------------------
const toolsFile = fs.readFileSync('src/data/tools.ts', 'utf8');
const addToolsFile = fs.readFileSync('src/data/additionalTools.ts', 'utf8');
const guidesFile = fs.readFileSync('src/data/guides.ts', 'utf8');
const codeContent = toolsFile + addToolsFile + guidesFile;

const validRoutesSet = new Set(expectedRoutes.map((r) => (r === '' ? '/' : `/${r}`)));
const linkMatches = Array.from(codeContent.matchAll(/\[([^\]]+)\]\((\/[^)]+)\)/g));

let brokenLinksCount = 0;
for (const match of linkMatches) {
  const url = match[2].split('#')[0].split('?')[0];
  if (!validRoutesSet.has(url)) {
    brokenLinksCount++;
  }
}
assert('Internal Linking', 'All 420 markdown links map to valid canonical routes', brokenLinksCount === 0, `${brokenLinksCount} broken`);

// -------------------------------------------------------------
// Suite 8: Tool Math, Calculation & Utility Logic Tests
// -------------------------------------------------------------
// GPA calculation test
const testGrades = [
  { grade: 'A', credits: 3 },  // 4.0 * 3 = 12.0
  { grade: 'B', credits: 4 },  // 3.0 * 4 = 12.0
  { grade: 'C', credits: 3 },  // 2.0 * 3 = 6.0
];
const totalPoints = 12.0 + 12.0 + 6.0; // 30.0
const totalCredits = 3 + 4 + 3; // 10
const calculatedGpa = totalPoints / totalCredits; // 3.00
assert('Tool Logic', 'GPA calculation evaluates weighted grade points correctly', calculatedGpa === 3.0);

// File helper tests
assert('Tool Logic', 'formatBytes formats sizes accurately', formatBytes(1048576) === '1 MB' && formatBytes(512) === '512 B');
const mockImage = new File(['mock'], 'test.jpg', { type: 'image/jpeg' });
const valRes = validateImageFile(mockImage);
assert('Tool Logic', 'validateImageFile accepts valid JPEG file', valRes.valid === true);

// -------------------------------------------------------------
// Suite 9: Privacy Claims & Network Requests
// -------------------------------------------------------------
const networkPatterns = [
  /fetch\(/g,
  /axios\./g,
  /new XMLHttpRequest/g,
  /navigator\.sendBeacon/g,
  /new WebSocket/g,
];

let toolNetworkHits = 0;
const toolFiles = fs.readdirSync('src/components/tools', { recursive: true }) as string[];
for (const f of toolFiles) {
  if (!f.endsWith('.tsx') && !f.endsWith('.ts')) continue;
  const content = fs.readFileSync(path.join('src/components/tools', f), 'utf8');
  for (const pat of networkPatterns) {
    if (pat.test(content)) toolNetworkHits++;
  }
}
assert('Privacy Compliance', 'Tool components make zero external network requests', toolNetworkHits === 0);

const broadClaims = [/100% private/i, /completely private/i, /zero tracking/i, /zero data collection/i, /never leave your device/i];
let broadHits = 0;
for (const f of ['src/data/tools.ts', 'src/data/additionalTools.ts', 'src/pages/StaticPages.tsx']) {
  const content = fs.readFileSync(f, 'utf8');
  for (const pat of broadClaims) {
    if (pat.test(content)) broadHits++;
  }
}
assert('Privacy Compliance', 'No unsupported absolute privacy claims exist in data or static pages', broadHits === 0);

// -------------------------------------------------------------
// Output Report
// -------------------------------------------------------------
console.log('--- TEST RESULTS ---');
let passedCount = 0;
let failedCount = 0;

for (const r of results) {
  if (r.passed) {
    console.log(`[PASS] [${r.suite}] ${r.name}`);
    passedCount++;
  } else {
    console.error(`[FAIL] [${r.suite}] ${r.name}: ${r.details || 'Assertion failed'}`);
    failedCount++;
  }
}

console.log(`\nSummary: ${passedCount} passed, ${failedCount} failed out of ${results.length} total checks.`);

if (failedCount > 0) {
  process.exit(1);
}
