/**
 * Comprehensive Repository-Wide Assertion Auditor
 * Challenger M1-R3-2
 *
 * Scans all test files for:
 * 1. Literal tautologies: expect(true).toBe(true), expect(1).toBe(1), expect('x').toBe('x')
 * 2. Unused return values / facade assertions
 * 3. Self-referential or constant assertions
 * 4. expect(true) or expect(false) patterns
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

interface Finding {
  file: string;
  line: number;
  code: string;
  pattern: string;
  risk: 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  description: string;
}

const findings: Finding[] = [];

function scanFile(filePath: string) {
  const relPath = path.relative(projectRoot, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    // 1. Tautology: expect(X).toBe(X) or expect(X).toEqual(X)
    const tautologyMatch = trimmed.match(/expect\(([^)]+)\)\.(toBe|toEqual)\(\1\)/);
    if (tautologyMatch) {
      findings.push({
        file: relPath,
        line: lineNum,
        code: trimmed,
        pattern: 'Tautology expect(X).toBe(X)',
        risk: 'HIGH',
        description: `Assertion compares identical expression: ${tautologyMatch[0]}`
      });
    }

    // 2. Literal boolean or number: expect(true).toBe(true)
    if (trimmed.includes('expect(true).toBe(true)') || trimmed.includes('expect(false).toBe(false)')) {
      findings.push({
        file: relPath,
        line: lineNum,
        code: trimmed,
        pattern: 'Hardcoded Boolean Tautology',
        risk: 'HIGH',
        description: 'Hardcoded boolean tautology'
      });
    }

    // 3. expect(true) or expect(false)
    const boolExpect = trimmed.match(/expect\((true|false)\)/);
    if (boolExpect) {
      findings.push({
        file: relPath,
        line: lineNum,
        code: trimmed,
        pattern: 'Boolean literal in expect()',
        risk: 'HIGH',
        description: `Passing boolean literal to expect(): ${boolExpect[0]}`
      });
    }

    // 4. Constant literal string/number expect
    const literalExpect = trimmed.match(/expect\((['"`\d]+)\)\.(toBe|toEqual|toContain)\((['"`\d]+)\)/);
    if (literalExpect) {
      findings.push({
        file: relPath,
        line: lineNum,
        code: trimmed,
        pattern: 'Literal-to-literal comparison',
        risk: 'MEDIUM',
        description: `Comparing two literal values directly: ${literalExpect[0]}`
      });
    }

    // 5. Look for discard-and-facade pattern:
    // e.g. search(...) or filter(...) where return value is not captured or assigned, followed by expect([mock])
    if (trimmed.includes('.search(') && !trimmed.includes('const ') && !trimmed.includes('let ') && !trimmed.includes('expect(')) {
      findings.push({
        file: relPath,
        line: lineNum,
        code: trimmed,
        pattern: 'Potential Uncaptured Method Call',
        risk: 'MEDIUM',
        description: 'Method call return value is not assigned or asserted'
      });
    }

    // 6. Inline dummy object checks:
    // e.g. const x = { ... }; expect(x.title).toContain('...');
    if (trimmed.includes('expect(p.title).toContain(') && trimmed.includes("const p = {")) {
      findings.push({
        file: relPath,
        line: lineNum,
        code: trimmed,
        pattern: 'Self-Testing Inline Mock Object',
        risk: 'MEDIUM',
        description: 'Mock object created inline and immediately asserted without engine interaction'
      });
    }

    // 7. Dummy repeat string length checks:
    if (trimmed.includes("expect(street.length).toBe(500)") && trimmed.includes("'A'.repeat(500)")) {
      findings.push({
        file: relPath,
        line: lineNum,
        code: trimmed,
        pattern: 'Tautological String Repeat Assertion',
        risk: 'MEDIUM',
        description: 'Asserting string length of newly created dummy string: "A".repeat(500)'
      });
    }
  });
}

function walkDir(dir: string, fileList: string[] = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== '.agents') {
        walkDir(fullPath, fileList);
      }
    } else {
      if (
        (entry.name.endsWith('.test.ts') ||
          entry.name.endsWith('.test.tsx') ||
          entry.name.endsWith('.test.js') ||
          entry.name === 'test-runner.js' ||
          entry.name === 'test-runner.ts') &&
        !entry.name.startsWith('adversarial_') &&
        !entry.name.startsWith('audit_')
      ) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

const testFiles = walkDir(path.resolve(projectRoot, 'tests')).concat(
  walkDir(path.resolve(projectRoot, 'src'))
);

console.log(`Found ${testFiles.length} test files to scan.\n`);

for (const file of testFiles) {
  scanFile(file);
}

console.log('======================================================================');
console.log('              REPOSITORY-WIDE ASSERTION AUDIT REPORT                  ');
console.log('======================================================================\n');

console.log(`Total Findings: ${findings.length}`);
const high = findings.filter(f => f.risk === 'HIGH');
const medium = findings.filter(f => f.risk === 'MEDIUM');
const low = findings.filter(f => f.risk === 'LOW');

console.log(`- HIGH risk:   ${high.length}`);
console.log(`- MEDIUM risk: ${medium.length}`);
console.log(`- LOW risk:    ${low.length}\n`);

for (const f of findings) {
  console.log(`[${f.risk}] ${f.file}:${f.line}`);
  console.log(`  Pattern: ${f.pattern}`);
  console.log(`  Code:    ${f.code.slice(0, 100)}`);
  console.log(`  Reason:  ${f.description}\n`);
}
