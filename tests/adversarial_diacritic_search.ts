/**
 * Adversarial Diacritic Search Normalization & NFD Edge Cases Harness
 * Challenger M1-R3-2
 *
 * Evaluates SearchEngine.search in both:
 * 1. tests/harness/reference-engine.ts
 * 2. tests/test-runner.js
 */

import { SearchEngine as ReferenceSearchEngine } from './harness/reference-engine';
import * as fs from 'fs';
import * as path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load test-runner.js SearchEngine implementation
const testRunnerJsCode = fs.readFileSync(path.resolve(__dirname, 'test-runner.js'), 'utf-8');

// Extract SearchEngine class from test-runner.js
const extractRunnerSearchEngine = () => {
  const match = testRunnerJsCode.match(/class SearchEngine\s*\{[\s\S]*?\n\}/);
  if (!match) {
    throw new Error('Failed to find class SearchEngine in test-runner.js');
  }
  const fn = new Function(`${match[0]}; return SearchEngine;`);
  return fn();
};

const RunnerSearchEngine = extractRunnerSearchEngine();

interface TestCase {
  id: string;
  name: string;
  query: string;
  catalog: { id: string; title: string; description: string; category: string; tags: string[] }[];
  expectedMatchIds: string[];
  description: string;
}

const makeProduct = (id: string, title: string, description = '', category = 'Coffee', tags: string[] = []) => ({
  id,
  handle: id,
  title,
  description,
  price: 20,
  category,
  tags,
  images: [{ id: 'img-1', url: 'https://example.com/img.jpg', altText: title }],
  options: [{ name: 'Size', values: ['Regular'] }],
  variants: [{
    id: `v-${id}`,
    title: 'Default',
    sku: `sku-${id}`,
    price: 20,
    options: { Size: 'Regular' },
    availableForSale: true,
    inventoryQuantity: 10
  }],
  rating: { average: 4.8, count: 12 }
});

const testCases: TestCase[] = [
  // 1. Mandatory pairs from prompt:
  {
    id: 'MANDATORY-1',
    name: 'accented query "crème" matching unaccented title "creme"',
    query: 'crème',
    catalog: [makeProduct('p1', 'French Roast creme blend'), makeProduct('p2', 'Dark Roast espresso')],
    expectedMatchIds: ['p1'],
    description: 'Accented query "crème" must find unaccented title "creme"'
  },
  {
    id: 'MANDATORY-2',
    name: 'unaccented query "creme" matching accented title "crème"',
    query: 'creme',
    catalog: [makeProduct('p1', 'French Roast crème blend'), makeProduct('p2', 'Dark Roast espresso')],
    expectedMatchIds: ['p1'],
    description: 'Unaccented query "creme" must find accented title "crème"'
  },
  {
    id: 'MANDATORY-3',
    name: 'unaccented query "cafe" matching accented title "café"',
    query: 'cafe',
    catalog: [makeProduct('p1', 'Grand Café au Lait'), makeProduct('p2', 'Espresso Single Origin')],
    expectedMatchIds: ['p1'],
    description: 'Unaccented query "cafe" must find accented title "café"'
  },
  {
    id: 'MANDATORY-4',
    name: 'accented query "café" matching unaccented title "cafe"',
    query: 'café',
    catalog: [makeProduct('p1', 'Grand Cafe au Lait'), makeProduct('p2', 'Espresso Single Origin')],
    expectedMatchIds: ['p1'],
    description: 'Accented query "café" must find unaccented title "cafe"'
  },
  {
    id: 'MANDATORY-5',
    name: 'accented query "naïve" matching unaccented title "naive"',
    query: 'naïve',
    catalog: [makeProduct('p1', 'Naive Art Silk Scarf'), makeProduct('p2', 'Linen Blend Trousers')],
    expectedMatchIds: ['p1'],
    description: 'Accented query "naïve" with diaeresis must find unaccented title "naive"'
  },
  {
    id: 'MANDATORY-6',
    name: 'unaccented query "naive" matching accented title "naïve"',
    query: 'naive',
    catalog: [makeProduct('p1', 'Naïve Art Silk Scarf'), makeProduct('p2', 'Linen Blend Trousers')],
    expectedMatchIds: ['p1'],
    description: 'Unaccented query "naive" must find accented title "naïve"'
  },
  {
    id: 'MANDATORY-7',
    name: 'accented query "Zürich" matching unaccented title "Zurich"',
    query: 'Zürich',
    catalog: [makeProduct('p1', 'Zurich Automatic Watch'), makeProduct('p2', 'Geneva Chronograph')],
    expectedMatchIds: ['p1'],
    description: 'Accented query "Zürich" with umlaut must find unaccented title "Zurich"'
  },
  {
    id: 'MANDATORY-8',
    name: 'unaccented query "Zurich" matching accented title "Zürich"',
    query: 'Zurich',
    catalog: [makeProduct('p1', 'Zürich Automatic Watch'), makeProduct('p2', 'Geneva Chronograph')],
    expectedMatchIds: ['p1'],
    description: 'Unaccented query "Zurich" must find accented title "Zürich"'
  },

  // 2. Unicode NFD Decomposition & Precomposed vs Decomposed variations:
  {
    id: 'NFD-01',
    name: 'NFC query vs NFD title equivalence',
    query: 'crème'.normalize('NFC'),
    catalog: [makeProduct('p1', 'crème'.normalize('NFD') + ' coffee'), makeProduct('p2', 'regular coffee')],
    expectedMatchIds: ['p1'],
    description: 'Query in NFC must match product title stored in NFD'
  },
  {
    id: 'NFD-02',
    name: 'NFD query vs NFC title equivalence',
    query: 'crème'.normalize('NFD'),
    catalog: [makeProduct('p1', 'crème'.normalize('NFC') + ' coffee'), makeProduct('p2', 'regular coffee')],
    expectedMatchIds: ['p1'],
    description: 'Query in NFD must match product title stored in NFC'
  },
  {
    id: 'NFD-03',
    name: 'Multiple stacked combining diacritics: Vietnamese tiếng (circumflex + acute)',
    query: 'tieng',
    catalog: [makeProduct('p1', 'Trà Tiếng Vang'), makeProduct('p2', 'Cà Phê Sữa')],
    expectedMatchIds: ['p1'],
    description: 'Stacked diacritics (circumflex + acute) must normalize to base ASCII e'
  },
  {
    id: 'NFD-04',
    name: 'Multiple stacked combining diacritics reverse: query "tiếng" matching "tieng"',
    query: 'tiếng',
    catalog: [makeProduct('p1', 'Tra Tieng Vang'), makeProduct('p2', 'Ca Phe Sua')],
    expectedMatchIds: ['p1'],
    description: 'Accented stacked query "tiếng" must match unaccented title "tieng"'
  },
  {
    id: 'NFD-05',
    name: 'Horn + Hook diacritics: Vietnamese phở (horn + hook)',
    query: 'pho',
    catalog: [makeProduct('p1', 'Phở Gia Truyền Spice Blend'), makeProduct('p2', 'Black Tea')],
    expectedMatchIds: ['p1'],
    description: 'Stacked horn and hook marks must normalize to base ASCII o'
  },
  {
    id: 'NFD-06',
    name: 'Horn + Hook reverse: query "phở" matching "pho"',
    query: 'phở',
    catalog: [makeProduct('p1', 'Pho Spice Blend'), makeProduct('p2', 'Black Tea')],
    expectedMatchIds: ['p1'],
    description: 'Accented query "phở" must match unaccented title "pho"'
  },
  {
    id: 'NFD-07',
    name: 'Breve + Tilde: Vietnamese nẵng',
    query: 'nang',
    catalog: [makeProduct('p1', 'Đà Nẵng Single Origin Coffee'), makeProduct('p2', 'Saigon Blend')],
    expectedMatchIds: ['p1'],
    description: 'Breve and tilde marks must normalize to base ASCII a'
  },
  {
    id: 'NFD-08',
    name: 'Breve + Tilde reverse: query "nẵng" matching "nang"',
    query: 'nẵng',
    catalog: [makeProduct('p1', 'Da Nang Single Origin Coffee'), makeProduct('p2', 'Saigon Blend')],
    expectedMatchIds: ['p1'],
    description: 'Breve + tilde query must match unaccented title'
  },

  // 3. European multi-lingual diacritics (Spanish, Swedish, French, German, Portuguese, Polish, Czech):
  {
    id: 'EURO-01',
    name: 'Spanish ñ / Ñ: "jalapeño" vs "jalapeno"',
    query: 'jalapeno',
    catalog: [makeProduct('p1', 'Spicy Jalapeño Roast'), makeProduct('p2', 'Habanero Honey')],
    expectedMatchIds: ['p1'],
    description: 'Tilde on n (ñ) must fold to n'
  },
  {
    id: 'EURO-02',
    name: 'Spanish ñ / Ñ reverse: query "jalapeño" vs "jalapeno"',
    query: 'jalapeño',
    catalog: [makeProduct('p1', 'Spicy Jalapeno Roast'), makeProduct('p2', 'Habanero Honey')],
    expectedMatchIds: ['p1'],
    description: 'Accented query "jalapeño" must match unaccented "jalapeno"'
  },
  {
    id: 'EURO-03',
    name: 'Swedish Å / å (ring above): "ångström" vs "angstrom"',
    query: 'angstrom',
    catalog: [makeProduct('p1', 'Ångström Precision Dial'), makeProduct('p2', 'Meter Tape')],
    expectedMatchIds: ['p1'],
    description: 'Ring above Å/å must fold to a'
  },
  {
    id: 'EURO-04',
    name: 'Swedish Å / å reverse: query "ångström" vs "angstrom"',
    query: 'ångström',
    catalog: [makeProduct('p1', 'Angstrom Precision Dial'), makeProduct('p2', 'Meter Tape')],
    expectedMatchIds: ['p1'],
    description: 'Ring above query "ångström" must match unaccented "angstrom"'
  },
  {
    id: 'EURO-05',
    name: 'French Ç / ç (cedilla): "façade" vs "facade"',
    query: 'facade',
    catalog: [makeProduct('p1', 'Façade Architectural Jacket'), makeProduct('p2', 'Basic Tee')],
    expectedMatchIds: ['p1'],
    description: 'Cedilla ç must fold to c'
  },
  {
    id: 'EURO-06',
    name: 'French Ç / ç reverse: query "façade" vs "facade"',
    query: 'façade',
    catalog: [makeProduct('p1', 'Facade Architectural Jacket'), makeProduct('p2', 'Basic Tee')],
    expectedMatchIds: ['p1'],
    description: 'Query with ç must match c'
  },
  {
    id: 'EURO-07',
    name: 'Czech Háček / Caron: "dvořák" vs "dvorak"',
    query: 'dvorak',
    catalog: [makeProduct('p1', 'Dvořák Mechanical Keyboard'), makeProduct('p2', 'QWERTY Board')],
    expectedMatchIds: ['p1'],
    description: 'Caron on ř must fold to r'
  },
  {
    id: 'EURO-08',
    name: 'Czech Háček / Caron reverse: query "dvořák" vs "dvorak"',
    query: 'dvořák',
    catalog: [makeProduct('p1', 'Dvorak Mechanical Keyboard'), makeProduct('p2', 'QWERTY Board')],
    expectedMatchIds: ['p1'],
    description: 'Query with caron must match unaccented'
  },

  // 4. Diacritics in description, category, and tags:
  {
    id: 'FIELDS-01',
    name: 'Accented query matches unaccented description',
    query: 'délicieuse',
    catalog: [makeProduct('p1', 'Pastry', 'Une delicieuse surprise', 'Food', ['bakery'])],
    expectedMatchIds: ['p1'],
    description: 'Accented query matches unaccented text in description'
  },
  {
    id: 'FIELDS-02',
    name: 'Unaccented query matches accented category',
    query: 'cafe',
    catalog: [makeProduct('p1', 'Special Roast', 'Good bean', 'Café & Thé', ['dark'])],
    expectedMatchIds: ['p1'],
    description: 'Unaccented query matches accented category'
  },
  {
    id: 'FIELDS-03',
    name: 'Accented query matches unaccented tag',
    query: 'crème',
    catalog: [makeProduct('p1', 'Vanilla Pod', 'Sweet spice', 'Pantry', ['creme', 'organic'])],
    expectedMatchIds: ['p1'],
    description: 'Accented query matches unaccented tag'
  },
  {
    id: 'FIELDS-04',
    name: 'Unaccented query matches accented tag',
    query: 'creme',
    catalog: [makeProduct('p1', 'Vanilla Pod', 'Sweet spice', 'Pantry', ['crème', 'organic'])],
    expectedMatchIds: ['p1'],
    description: 'Unaccented query matches accented tag'
  },

  // 5. Case + Diacritic permutations:
  {
    id: 'CASE-01',
    name: 'Uppercase accented query vs lowercase unaccented title: "CRÈME" -> "creme"',
    query: 'CRÈMe',
    catalog: [makeProduct('p1', 'creme liqueur'), makeProduct('p2', 'vodka')],
    expectedMatchIds: ['p1'],
    description: 'Uppercase accented query matches lowercase title'
  },
  {
    id: 'CASE-02',
    name: 'Lowercase unaccented query vs uppercase accented title: "creme" -> "CRÈME"',
    query: 'creme',
    catalog: [makeProduct('p1', 'CRÈMe LIQUEUR'), makeProduct('p2', 'vodka')],
    expectedMatchIds: ['p1'],
    description: 'Lowercase unaccented query matches uppercase accented title'
  },

  // 6. Partial substring matches with diacritics:
  {
    id: 'PARTIAL-01',
    name: 'Partial prefix with diacritic: "crèm" matches "Crème Brûlée"',
    query: 'crèm',
    catalog: [makeProduct('p1', 'Crème Brûlée Dessert'), makeProduct('p2', 'Croissant')],
    expectedMatchIds: ['p1'],
    description: 'Prefix query with diacritic matches title'
  },
  {
    id: 'PARTIAL-02',
    name: 'Partial prefix without diacritic: "crem" matches "Crème Brûlée"',
    query: 'crem',
    catalog: [makeProduct('p1', 'Crème Brûlée Dessert'), makeProduct('p2', 'Croissant')],
    expectedMatchIds: ['p1'],
    description: 'Prefix query without diacritic matches title'
  },
  {
    id: 'PARTIAL-03',
    name: 'Partial infix: "rûlé" matches "Crème Brûlée"',
    query: 'rule',
    catalog: [makeProduct('p1', 'Crème Brûlée Dessert'), makeProduct('p2', 'Croissant')],
    expectedMatchIds: ['p1'],
    description: 'Unaccented infix query matches accented title'
  },

  // 7. Empty and degenerate query boundaries:
  {
    id: 'BOUND-01',
    name: 'Empty query returns empty array',
    query: '',
    catalog: [makeProduct('p1', 'Coffee'), makeProduct('p2', 'Tea')],
    expectedMatchIds: [],
    description: 'Empty string query should return []'
  },
  {
    id: 'BOUND-02',
    name: 'Whitespace-only query returns empty array',
    query: '   \t\n  ',
    catalog: [makeProduct('p1', 'Coffee'), makeProduct('p2', 'Tea')],
    expectedMatchIds: [],
    description: 'Whitespace query should return []'
  },
  {
    id: 'BOUND-03',
    name: 'Isolated combining mark query "\u0300" behavior',
    query: '\u0300',
    catalog: [makeProduct('p1', 'Coffee'), makeProduct('p2', 'Tea')],
    // Let's test whether it returns empty array or leaks all products!
    expectedMatchIds: [],
    description: 'Isolated combining diacritic mark should return [] (no results), not entire catalog'
  },
  {
    id: 'BOUND-04',
    name: 'Multiple isolated combining marks "\u0300\u0301\u0302" behavior',
    query: '\u0300\u0301\u0302',
    catalog: [makeProduct('p1', 'Coffee'), makeProduct('p2', 'Tea')],
    expectedMatchIds: [],
    description: 'Multiple isolated combining marks should return []'
  }
];

// Execute tests on both engines
console.log('======================================================================');
console.log('       ADVERSARIAL DIACRITIC & NFD NORMALIZATION SEARCH HARNESS       ');
console.log('======================================================================\n');

interface EngineResult {
  engineName: string;
  passed: number;
  failed: number;
  failures: { id: string; name: string; query: string; expected: string[]; actual: string[]; reason: string }[];
}

function runEngineTests(engineName: string, EngineClass: any): EngineResult {
  const result: EngineResult = {
    engineName,
    passed: 0,
    failed: 0,
    failures: []
  };

  const engine = new EngineClass('test-store');

  for (const tc of testCases) {
    let matches: any[];
    try {
      matches = engine.search(tc.query, tc.catalog);
    } catch (err: any) {
      result.failed++;
      result.failures.push({
        id: tc.id,
        name: tc.name,
        query: tc.query,
        expected: tc.expectedMatchIds,
        actual: [],
        reason: `Threw error: ${err.message}`
      });
      continue;
    }

    const matchIds = (matches || []).map((m: any) => m.id);
    const passed =
      matchIds.length === tc.expectedMatchIds.length &&
      tc.expectedMatchIds.every(id => matchIds.includes(id));

    if (passed) {
      result.passed++;
    } else {
      result.failed++;
      result.failures.push({
        id: tc.id,
        name: tc.name,
        query: tc.query,
        expected: tc.expectedMatchIds,
        actual: matchIds,
        reason: `Expected [${tc.expectedMatchIds.join(', ')}] but got [${matchIds.join(', ')}]`
      });
    }
  }

  return result;
}

const refResult = runEngineTests('ReferenceEngine (tests/harness/reference-engine.ts)', ReferenceSearchEngine);
const runnerResult = runEngineTests('TestRunner (tests/test-runner.js)', RunnerSearchEngine);

console.log(`1. ${refResult.engineName}:`);
console.log(`   Passed: ${refResult.passed}/${testCases.length}, Failed: ${refResult.failed}`);
if (refResult.failures.length > 0) {
  console.log('   Failures:');
  for (const f of refResult.failures) {
    console.log(`   - [${f.id}] ${f.name} (query: "${f.query}"): ${f.reason}`);
  }
}

console.log(`\n2. ${runnerResult.engineName}:`);
console.log(`   Passed: ${runnerResult.passed}/${testCases.length}, Failed: ${runnerResult.failed}`);
if (runnerResult.failures.length > 0) {
  console.log('   Failures:');
  for (const f of runnerResult.failures) {
    console.log(`   - [${f.id}] ${f.name} (query: "${f.query}"): ${f.reason}`);
  }
}

// Additional Tokenization / Word order challenge:
console.log('\n----------------------------------------------------------------------');
console.log(' TOKENIZATION & WORD ORDER ADVERSARIAL CHALLENGE:');
console.log('----------------------------------------------------------------------');

const multiWordCatalog = [
  makeProduct('p1', 'Café Crème Roast Special'),
  makeProduct('p2', 'Dark Roast Espresso')
];

const refEngine = new ReferenceSearchEngine('test');
const runEngine = new RunnerSearchEngine('test');

const queryReordered = 'crème café'; // Out of word order
const refReordered = refEngine.search(queryReordered, multiWordCatalog).map((p: any) => p.id);
const runReordered = runEngine.search(queryReordered, multiWordCatalog).map((p: any) => p.id);

console.log(`Query: "${queryReordered}" matching title: "Café Crème Roast Special"`);
console.log(`- ReferenceEngine matches: [${refReordered.join(', ')}]`);
console.log(`- TestRunner matches:      [${runReordered.join(', ')}]`);

const queryExtraSpaces = '  crème    café   ';
const refSpaces = refEngine.search(queryExtraSpaces, multiWordCatalog).map((p: any) => p.id);
const runSpaces = runEngine.search(queryExtraSpaces, multiWordCatalog).map((p: any) => p.id);
console.log(`Query with multiple spaces: "${queryExtraSpaces}"`);
console.log(`- ReferenceEngine matches: [${refSpaces.join(', ')}]`);
console.log(`- TestRunner matches:      [${runSpaces.join(', ')}]`);
