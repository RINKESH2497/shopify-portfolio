/**
 * Test Framework & Assertion Library for Shopify Portfolio E2E Testing
 * Fully self-contained, requirement-driven, zero external dependencies required.
 */

export interface TestResult {
  suite: string;
  name: string;
  tier: 'tier1' | 'tier2' | 'tier3' | 'tier4';
  passed: boolean;
  durationMs: number;
  error?: Error;
}

export interface SuiteSummary {
  suiteName: string;
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
}

export interface RunSummary {
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  tierCounts: {
    tier1: { total: number; passed: number; failed: number };
    tier2: { total: number; passed: number; failed: number };
    tier3: { total: number; passed: number; failed: number };
    tier4: { total: number; passed: number; failed: number };
  };
  suites: SuiteSummary[];
  failures: TestResult[];
}

type TestFn = () => void | Promise<void>;
type HookFn = () => void | Promise<void>;

interface TestCase {
  name: string;
  fn: TestFn;
}

interface TestSuiteDef {
  name: string;
  tier: 'tier1' | 'tier2' | 'tier3' | 'tier4';
  tests: TestCase[];
  beforeEachHooks: HookFn[];
  afterEachHooks: HookFn[];
  beforeAllHooks: HookFn[];
  afterAllHooks: HookFn[];
}

const registeredSuites: TestSuiteDef[] = [];
let currentSuiteDef: TestSuiteDef | null = null;

export function describe(name: string, fn: () => void, tierOverride?: 'tier1' | 'tier2' | 'tier3' | 'tier4') {
  let tier: 'tier1' | 'tier2' | 'tier3' | 'tier4' = tierOverride || 'tier1';
  if (!tierOverride) {
    if (name.includes('Tier 1') || name.includes('tier1')) tier = 'tier1';
    else if (name.includes('Tier 2') || name.includes('tier2')) tier = 'tier2';
    else if (name.includes('Tier 3') || name.includes('tier3')) tier = 'tier3';
    else if (name.includes('Tier 4') || name.includes('tier4')) tier = 'tier4';
  }

  const suite: TestSuiteDef = {
    name,
    tier,
    tests: [],
    beforeEachHooks: [],
    afterEachHooks: [],
    beforeAllHooks: [],
    afterAllHooks: []
  };

  const prevSuite = currentSuiteDef;
  currentSuiteDef = suite;
  registeredSuites.push(suite);

  try {
    fn();
  } finally {
    currentSuiteDef = prevSuite;
  }
}

export function it(name: string, fn: TestFn) {
  if (!currentSuiteDef) {
    throw new Error(`Test "${name}" must be placed inside a describe block.`);
  }
  currentSuiteDef.tests.push({ name, fn });
}

export const test = it;

export function beforeEach(fn: HookFn) {
  if (!currentSuiteDef) throw new Error('beforeEach must be inside describe block.');
  currentSuiteDef.beforeEachHooks.push(fn);
}

export function afterEach(fn: HookFn) {
  if (!currentSuiteDef) throw new Error('afterEach must be inside describe block.');
  currentSuiteDef.afterEachHooks.push(fn);
}

export function beforeAll(fn: HookFn) {
  if (!currentSuiteDef) throw new Error('beforeAll must be inside describe block.');
  currentSuiteDef.beforeAllHooks.push(fn);
}

export function afterAll(fn: HookFn) {
  if (!currentSuiteDef) throw new Error('afterAll must be inside describe block.');
  currentSuiteDef.afterAllHooks.push(fn);
}

// Custom Deep Equality Check
export function deepEqual(a: any, b: any): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}

export class MatcherError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MatcherError';
  }
}

class Expectation<T = any> {
  private isNot: boolean;

  constructor(private actual: T, isNot: boolean = false) {
    this.isNot = isNot;
  }

  get not(): Expectation<T> {
    return new Expectation(this.actual, !this.isNot);
  }

  toBe(expected: any): void {
    const pass = Object.is(this.actual, expected);
    if (this.isNot ? pass : !pass) {
      throw new MatcherError(
        `Expected ${JSON.stringify(this.actual)} ${this.isNot ? 'NOT to be' : 'to be'} ${JSON.stringify(expected)}`
      );
    }
  }

  toEqual(expected: any): void {
    const pass = deepEqual(this.actual, expected);
    if (this.isNot ? pass : !pass) {
      throw new MatcherError(
        `Expected ${JSON.stringify(this.actual)} ${this.isNot ? 'NOT to equal' : 'to equal'} ${JSON.stringify(expected)}`
      );
    }
  }

  toBeTruthy(): void {
    const pass = Boolean(this.actual);
    if (this.isNot ? pass : !pass) {
      throw new MatcherError(`Expected ${JSON.stringify(this.actual)} ${this.isNot ? 'NOT to be truthy' : 'to be truthy'}`);
    }
  }

  toBeFalsy(): void {
    const pass = !Boolean(this.actual);
    if (this.isNot ? pass : !pass) {
      throw new MatcherError(`Expected ${JSON.stringify(this.actual)} ${this.isNot ? 'NOT to be falsy' : 'to be falsy'}`);
    }
  }

  toBeNull(): void {
    this.toBe(null);
  }

  toBeUndefined(): void {
    this.toBe(undefined);
  }

  toBeDefined(): void {
    const pass = this.actual !== undefined;
    if (this.isNot ? pass : !pass) {
      throw new MatcherError(`Expected value ${this.isNot ? 'to be undefined' : 'to be defined'}`);
    }
  }

  toBeGreaterThan(expected: number): void {
    const pass = typeof this.actual === 'number' && this.actual > expected;
    if (this.isNot ? pass : !pass) {
      throw new MatcherError(`Expected ${this.actual} ${this.isNot ? 'NOT >' : '>'} ${expected}`);
    }
  }

  toBeGreaterThanOrEqual(expected: number): void {
    const pass = typeof this.actual === 'number' && this.actual >= expected;
    if (this.isNot ? pass : !pass) {
      throw new MatcherError(`Expected ${this.actual} ${this.isNot ? 'NOT >=' : '>='} ${expected}`);
    }
  }

  toBeLessThan(expected: number): void {
    const pass = typeof this.actual === 'number' && this.actual < expected;
    if (this.isNot ? pass : !pass) {
      throw new MatcherError(`Expected ${this.actual} ${this.isNot ? 'NOT <' : '<'} ${expected}`);
    }
  }

  toBeLessThanOrEqual(expected: number): void {
    const pass = typeof this.actual === 'number' && this.actual <= expected;
    if (this.isNot ? pass : !pass) {
      throw new MatcherError(`Expected ${this.actual} ${this.isNot ? 'NOT <=' : '<='} ${expected}`);
    }
  }

  toBeCloseTo(expected: number, precision: number = 2): void {
    const diff = Math.abs((this.actual as number) - expected);
    const pass = diff < Math.pow(10, -precision) / 2;
    if (this.isNot ? pass : !pass) {
      throw new MatcherError(
        `Expected ${this.actual} ${this.isNot ? 'NOT to be close to' : 'to be close to'} ${expected} with precision ${precision}`
      );
    }
  }

  toContain(expected: any): void {
    let pass = false;
    if (typeof this.actual === 'string') {
      pass = this.actual.includes(String(expected));
    } else if (Array.isArray(this.actual)) {
      pass = this.actual.some(item => deepEqual(item, expected));
    } else if (this.actual instanceof Set) {
      pass = this.actual.has(expected);
    }
    if (this.isNot ? pass : !pass) {
      throw new MatcherError(`Expected ${JSON.stringify(this.actual)} ${this.isNot ? 'NOT to contain' : 'to contain'} ${JSON.stringify(expected)}`);
    }
  }

  toHaveLength(expected: number): void {
    const length = (this.actual as any)?.length;
    const pass = length === expected;
    if (this.isNot ? pass : !pass) {
      throw new MatcherError(`Expected length ${expected}, received ${length}`);
    }
  }

  toMatch(pattern: RegExp | string): void {
    const reg = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    const pass = reg.test(String(this.actual));
    if (this.isNot ? pass : !pass) {
      throw new MatcherError(`Expected ${JSON.stringify(this.actual)} ${this.isNot ? 'NOT to match' : 'to match'} ${pattern}`);
    }
  }

  toThrow(expectedMessageOrRegex?: string | RegExp): void {
    let thrownError: any = null;
    try {
      if (typeof this.actual !== 'function') {
        throw new Error('Actual value must be a function to test toThrow.');
      }
      (this.actual as Function)();
    } catch (err) {
      thrownError = err;
    }

    const didThrow = thrownError !== null;
    let messageMatches = true;

    if (didThrow && expectedMessageOrRegex) {
      const msg = thrownError?.message || String(thrownError);
      if (typeof expectedMessageOrRegex === 'string') {
        messageMatches = msg.includes(expectedMessageOrRegex);
      } else {
        messageMatches = expectedMessageOrRegex.test(msg);
      }
    }

    const pass = didThrow && messageMatches;
    if (this.isNot ? pass : !pass) {
      throw new MatcherError(
        `Expected function ${this.isNot ? 'NOT to throw' : 'to throw'} ${expectedMessageOrRegex ? `matching ${expectedMessageOrRegex}` : ''}, but ${didThrow ? `threw: ${thrownError?.message}` : 'did not throw'}`
      );
    }
  }
}

export function expect<T = any>(actual: T): Expectation<T> {
  return new Expectation(actual);
}

export async function runAllTests(filter?: string): Promise<RunSummary> {
  const startTime = Date.now();
  const summary: RunSummary = {
    total: 0,
    passed: 0,
    failed: 0,
    durationMs: 0,
    tierCounts: {
      tier1: { total: 0, passed: 0, failed: 0 },
      tier2: { total: 0, passed: 0, failed: 0 },
      tier3: { total: 0, passed: 0, failed: 0 },
      tier4: { total: 0, passed: 0, failed: 0 }
    },
    suites: [],
    failures: []
  };

  for (const suite of registeredSuites) {
    if (filter && !suite.name.toLowerCase().includes(filter.toLowerCase())) {
      continue;
    }

    const suiteStart = Date.now();
    let suitePassed = 0;
    let suiteFailed = 0;

    for (const hook of suite.beforeAllHooks) {
      await hook();
    }

    for (const testCase of suite.tests) {
      summary.total++;
      summary.tierCounts[suite.tier].total++;

      const testStart = Date.now();
      let passed = true;
      let error: Error | undefined;

      try {
        for (const hook of suite.beforeEachHooks) {
          await hook();
        }
        await testCase.fn();
        for (const hook of suite.afterEachHooks) {
          await hook();
        }
      } catch (err: any) {
        passed = false;
        error = err;
      }

      const durationMs = Date.now() - testStart;

      if (passed) {
        summary.passed++;
        summary.tierCounts[suite.tier].passed++;
        suitePassed++;
      } else {
        summary.failed++;
        summary.tierCounts[suite.tier].failed++;
        suiteFailed++;
        summary.failures.push({
          suite: suite.name,
          name: testCase.name,
          tier: suite.tier,
          passed: false,
          durationMs,
          error
        });
      }
    }

    for (const hook of suite.afterAllHooks) {
      await hook();
    }

    summary.suites.push({
      suiteName: suite.name,
      total: suite.tests.length,
      passed: suitePassed,
      failed: suiteFailed,
      durationMs: Date.now() - suiteStart
    });
  }

  summary.durationMs = Date.now() - startTime;
  return summary;
}

export function formatReport(summary: RunSummary): string {
  const lines: string[] = [];
  lines.push('======================================================================');
  lines.push('        SHOPIFY PORTFOLIO PLATFORM - E2E TEST RUNNER REPORT          ');
  lines.push('======================================================================');
  lines.push('');

  for (const suite of summary.suites) {
    const status = suite.failed === 0 ? '✓ PASS' : '✗ FAIL';
    lines.push(` [${status}] ${suite.suiteName} (${suite.passed}/${suite.total} passed, ${suite.durationMs}ms)`);
  }

  lines.push('');
  lines.push('----------------------------------------------------------------------');
  lines.push(' SUMMARY BY TIER:');
  lines.push('----------------------------------------------------------------------');
  const t1 = summary.tierCounts.tier1;
  const t2 = summary.tierCounts.tier2;
  const t3 = summary.tierCounts.tier3;
  const t4 = summary.tierCounts.tier4;

  lines.push(` Tier 1 (Feature Coverage):   ${t1.passed}/${t1.total} passed ${t1.failed > 0 ? `(${t1.failed} FAILED)` : '✓'}`);
  lines.push(` Tier 2 (Boundary & Corner):  ${t2.passed}/${t2.total} passed ${t2.failed > 0 ? `(${t2.failed} FAILED)` : '✓'}`);
  lines.push(` Tier 3 (Cross Interactions): ${t3.passed}/${t3.total} passed ${t3.failed > 0 ? `(${t3.failed} FAILED)` : '✓'}`);
  lines.push(` Tier 4 (Customer Scenarios): ${t4.passed}/${t4.total} passed ${t4.failed > 0 ? `(${t4.failed} FAILED)` : '✓'}`);
  lines.push('----------------------------------------------------------------------');
  lines.push(` TOTAL: ${summary.passed}/${summary.total} passed (${summary.failed} failed) in ${summary.durationMs}ms`);
  lines.push('======================================================================');

  if (summary.failures.length > 0) {
    lines.push('');
    lines.push('FAILURES:');
    for (const fail of summary.failures) {
      lines.push(`\n- [${fail.suite}] > ${fail.name}:`);
      lines.push(`  ${fail.error?.stack || fail.error?.message || String(fail.error)}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function clearSuites() {
  registeredSuites.length = 0;
  currentSuiteDef = null;
}
