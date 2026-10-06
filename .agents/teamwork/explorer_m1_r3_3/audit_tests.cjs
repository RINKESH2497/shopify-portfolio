const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');
const testsDir = path.join(repoRoot, 'tests');

function getAllFiles(dir, exts = ['.js', '.ts']) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, exts));
    } else if (exts.some(ext => file.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

const allTestFiles = getAllFiles(testsDir);
console.log(`Found ${allTestFiles.length} test files to inspect.\n`);

const suspiciousPatterns = [];

for (const filePath of allTestFiles) {
  const relPath = path.relative(repoRoot, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    // 1. Literal expect checks
    if (/expect\s*\(\s*(true|false|\d+|'[^']*'|"[^"]*")\s*\)/.test(line)) {
      suspiciousPatterns.push({
        file: relPath,
        line: lineNum,
        type: 'LITERAL_EXPECT_ARG',
        code: trimmed
      });
    }

    // 2. Trivial comparisons
    if (/expect\s*\([^)]*(===|==|!==|!=)[^)]*\)\s*\.\s*toBe\s*\(\s*true\s*\)/.test(line)) {
      suspiciousPatterns.push({
        file: relPath,
        line: lineNum,
        type: 'BOOLEAN_EQUALITY_TO_BE_TRUE',
        code: trimmed
      });
    }

    // 3. expect(anything).toBe(true) when asserting simple constant or identity
    if (/expect\s*\(\s*(true|1)\s*\)\s*\.\s*toBe\s*\(\s*(true|1)\s*\)/.test(line)) {
      suspiciousPatterns.push({
        file: relPath,
        line: lineNum,
        type: 'IDENTITY_DUMMY_ASSERTION',
        code: trimmed
      });
    }
  });

  // Check for it blocks
  const itRegex = /it\s*\(\s*(['"`][\s\S]*?['"`])\s*,\s*(?:async\s*)?(?:\([^)]*\)|function\s*\([^)]*\))\s*=>?\s*\{([\s\S]*?)\n\s*(?:}\);|}(?=\s*it|\s*describe|\s*$))/g;
  let match;
  while ((match = itRegex.exec(content)) !== null) {
    const testName = match[1];
    const body = match[2].trim();
    if (body.length === 0 || body.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').trim().length === 0) {
      suspiciousPatterns.push({
        file: relPath,
        line: 0,
        type: 'EMPTY_TEST_BODY',
        code: `it(${testName}, () => { /* empty */ })`
      });
    } else if (!body.includes('expect(')) {
      suspiciousPatterns.push({
        file: relPath,
        line: 0,
        type: 'TEST_WITHOUT_EXPECT',
        code: `it(${testName}) body has no expect()`
      });
    }
  }
}

console.log('--- SUSPICIOUS / DUMMY ASSERTIONS FOUND ---');
console.log(JSON.stringify(suspiciousPatterns, null, 2));
