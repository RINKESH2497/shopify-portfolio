// Empirical comparison of test-runner.js CatalogFilterEngine vs reference-engine.ts
const fs = require('fs');

const runnerContent = fs.readFileSync('tests/test-runner.js', 'utf8');
const classMatch = runnerContent.match(/class CatalogFilterEngine \{[\s\S]*?\n\}/);
if (!classMatch) {
  console.error('CatalogFilterEngine not found in test-runner.js');
  process.exit(1);
}

// Instantiate test-runner's CatalogFilterEngine
const createRunnerEngine = new Function(`${classMatch[0]}; return CatalogFilterEngine;`);
const RunnerFilterEngine = createRunnerEngine();

console.log('--- TEST RUNNER CatalogFilterEngine EMPIRICAL TESTS ---');

// Test 1: lowercase option key { color: 'Black' }
const pLowerKey = {
  id: 'p-lower-key',
  variants: [{ id: 'v1', options: { color: 'Black' } }]
};
const res1 = RunnerFilterEngine.filter([pLowerKey], { color: 'Black' });
console.log('1. Lowercase key { color: "Black" } with filter { color: "Black" }:', res1.length === 1 ? 'PASS (1 match)' : 'FAIL (0 matches, expected 1)');

// Test 2: uppercase option key { COLOR: 'Black' }
const pUpperKey = {
  id: 'p-upper-key',
  variants: [{ id: 'v2', options: { COLOR: 'Black' } }]
};
const res2 = RunnerFilterEngine.filter([pUpperKey], { color: 'Black' });
console.log('2. Uppercase key { COLOR: "Black" } with filter { color: "Black" }:', res2.length === 1 ? 'PASS (1 match)' : 'FAIL (0 matches, expected 1)');

// Test 3: Title-case key { Color: 'Black' } with lowercase filter query { color: 'black' }
const pStd = {
  id: 'p-std',
  variants: [{ id: 'v3', options: { Color: 'Black' } }]
};
const res3 = RunnerFilterEngine.filter([pStd], { color: 'black' });
console.log('3. Mixed casing { Color: "Black" } with query "black":', res3.length === 1 ? 'PASS (1 match)' : 'FAIL (0 matches, expected 1)');

// Test 4: Mixed casing { Color: "black" } with query "Black"
const pLowerVal = {
  id: 'p-lower-val',
  variants: [{ id: 'v4', options: { Color: 'black' } }]
};
const res4 = RunnerFilterEngine.filter([pLowerVal], { color: 'Black' });
console.log('4. Mixed casing { Color: "black" } with query "Black":', res4.length === 1 ? 'PASS (1 match)' : 'FAIL (0 matches, expected 1)');

// Test 5: Mixed casing { Color: "BLACK" } with query "black"
const pUpperVal = {
  id: 'p-upper-val',
  variants: [{ id: 'v5', options: { Color: 'BLACK' } }]
};
const res5 = RunnerFilterEngine.filter([pUpperVal], { color: 'black' });
console.log('5. Mixed casing { Color: "BLACK" } with query "black":', res5.length === 1 ? 'PASS (1 match)' : 'FAIL (0 matches, expected 1)');

// Test 6: Non-existent color
const res6 = RunnerFilterEngine.filter([pStd], { color: 'NeonTurquoise999' });
console.log('6. Non-existent color query:', res6.length === 0 ? 'PASS (0 matches)' : 'FAIL');

// Test 7: Variant options is null/undefined
const pNullOpts = {
  id: 'p-null',
  variants: [{ id: 'v7', options: null }]
};
let res7Pass = false;
try {
  const res7 = RunnerFilterEngine.filter([pNullOpts], { color: 'Black' });
  res7Pass = res7.length === 0;
} catch (e) {
  res7Pass = false;
}
console.log('7. Variant options null/undefined resilience:', res7Pass ? 'PASS (No crash)' : 'FAIL');
