/**
 * Security and Regression Test Suite for ToolNest
 * 
 * Verifies:
 * 1. Safe Mathematical Expression Evaluator (no eval/Function, accurate results, division by zero)
 * 2. File and PDF validation helpers (0-byte rejection, size bounds, mime types)
 * 3. Spreadsheet formula injection sanitization logic
 * 4. AST / Codebase scan: zero eval() or new Function() in executable code of src/
 */

import { safeEvaluateMath } from '../src/utils/safeMathEvaluator.js';
import { validateImageFile, validatePdfFile } from '../src/utils/fileHelpers.js';
import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

console.log('--- 1. Testing Safe Math Evaluator ---');
try {
  assert(safeEvaluateMath('2 + 3 * 4') === 14, 'Operator precedence (2 + 3 * 4 = 14)');
  assert(safeEvaluateMath('(2 + 3) * 4') === 20, 'Parentheses ((2 + 3) * 4 = 20)');
  assert(safeEvaluateMath('2 ^ 3') === 8, 'Power operator (2 ^ 3 = 8)');
  assert(Math.abs(safeEvaluateMath('sin(30)', { angleUnit: 'deg' }) - 0.5) < 1e-6, 'sin(30 deg) = 0.5');
  assert(Math.abs(safeEvaluateMath('cos(0)', { angleUnit: 'deg' }) - 1) < 1e-6, 'cos(0 deg) = 1');
  assert(safeEvaluateMath('sqrt(144)') === 12, 'sqrt(144) = 12');
  assert(Math.abs(safeEvaluateMath('ln(e)') - 1) < 1e-6, 'ln(e) = 1');
  assert(safeEvaluateMath('log(1000)') === 3, 'log(1000) = 3');
  assert(safeEvaluateMath('10 ÷ 2') === 5, 'Unicode division operator normalization (10 ÷ 2 = 5)');
  assert(safeEvaluateMath('5 × 6') === 30, 'Unicode multiplication operator normalization (5 × 6 = 30)');
  assert(Math.abs(safeEvaluateMath('π') - Math.PI) < 1e-6, 'Pi symbol evaluation');

  // Test error handling
  let divZeroThrown = false;
  try {
    safeEvaluateMath('10 / 0');
  } catch {
    divZeroThrown = true;
  }
  assert(divZeroThrown, 'Division by zero throws error cleanly');

  let syntaxErrThrown = false;
  try {
    safeEvaluateMath('window.alert(1)');
  } catch {
    syntaxErrThrown = true;
  }
  assert(syntaxErrThrown, 'Malicious/unknown identifier rejected cleanly');
} catch (e: any) {
  console.error('Math evaluator test error:', e);
  failed++;
}

console.log('\n--- 2. Testing File and PDF Validation Helpers ---');
try {
  // Mock File-like object
  const createMockFile = (name: string, size: number, type: string): any => ({
    name,
    size,
    type,
  });

  const emptyImg = createMockFile('test.jpg', 0, 'image/jpeg');
  assert(!validateImageFile(emptyImg).valid, 'validateImageFile rejects 0-byte image file');

  const oversizeImg = createMockFile('huge.png', 55 * 1024 * 1024, 'image/png');
  assert(!validateImageFile(oversizeImg, 50).valid, 'validateImageFile rejects oversized image (>50MB)');

  const validImg = createMockFile('photo.webp', 1024 * 100, 'image/webp');
  assert(validateImageFile(validImg).valid, 'validateImageFile accepts valid WebP');

  const emptyPdf = createMockFile('empty.pdf', 0, 'application/pdf');
  assert(!validatePdfFile(emptyPdf).valid, 'validatePdfFile rejects 0-byte PDF');

  const oversizePdf = createMockFile('giant.pdf', 150 * 1024 * 1024, 'application/pdf');
  assert(!validatePdfFile(oversizePdf, 100).valid, 'validatePdfFile rejects oversized PDF (>100MB)');

  const fakePdf = createMockFile('document.exe', 1024, 'application/x-msdownload');
  assert(!validatePdfFile(fakePdf).valid, 'validatePdfFile rejects non-PDF file');

  const validPdf = createMockFile('invoice.pdf', 1024 * 50, 'application/pdf');
  assert(validatePdfFile(validPdf).valid, 'validatePdfFile accepts valid PDF');
} catch (e: any) {
  console.error('File validation test error:', e);
  failed++;
}

console.log('\n--- 3. Testing Spreadsheet Formula Injection Sanitization ---');
function sanitizeSpreadsheetValue(value: string): string {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (trimmed.length === 0) return '';
  if (/^[=+\-@\t\r%|]/.test(value) || /^[=+\-@\t\r%|]/.test(trimmed)) {
    return "'" + trimmed;
  }
  return trimmed;
}

assert(sanitizeSpreadsheetValue('=cmd|calc.exe') === "'=cmd|calc.exe", 'Neutralizes = prefix');
assert(sanitizeSpreadsheetValue('+123') === "'+123", 'Neutralizes + prefix');
assert(sanitizeSpreadsheetValue('-123') === "'-123", 'Neutralizes - prefix');
assert(sanitizeSpreadsheetValue('@SUM(A1:A5)') === "'@SUM(A1:A5)", 'Neutralizes @ prefix');
assert(sanitizeSpreadsheetValue('\tcmd') === "'cmd", 'Neutralizes tab prefix');
assert(sanitizeSpreadsheetValue('%cmd') === "'%cmd", 'Neutralizes % prefix');
assert(sanitizeSpreadsheetValue('|cmd') === "'|cmd", 'Neutralizes | prefix');
assert(sanitizeSpreadsheetValue('Normal message text') === 'Normal message text', 'Preserves benign text unchanged');

console.log('\n--- 4. Codebase Scan: Check for Dangerous Sinks in src/ ---');
function scanDir(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(scanDir(fullPath));
    } else if (/\.(tsx?|jsx?)$/.test(file)) {
      results.push(fullPath);
    }
  }
  return results;
}

// Helper to strip comments
function stripComments(code: string): string {
  return code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
}

const srcFiles = scanDir(path.resolve(process.cwd(), 'src'));
let evalFound = false;
let funcFound = false;
let innerHtmlFound = false;

for (const file of srcFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const codeOnly = stripComments(content);
  if (/\beval\s*\(/.test(codeOnly)) {
    console.error(`  Found eval() in ${file}`);
    evalFound = true;
  }
  if (/\bFunction\s*\(/.test(codeOnly)) {
    console.error(`  Found Function() in ${file}`);
    funcFound = true;
  }
  if (/dangerouslySetInnerHTML/.test(codeOnly)) {
    console.error(`  Found dangerouslySetInnerHTML in ${file}`);
    innerHtmlFound = true;
  }
}

assert(!evalFound, 'Zero eval() calls in executable code of src/');
assert(!funcFound, 'Zero Function() constructor calls in executable code of src/');
assert(!innerHtmlFound, 'Zero dangerouslySetInnerHTML in executable code of src/');

console.log('\n====================================');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('====================================');

if (failed > 0) {
  process.exit(1);
}
