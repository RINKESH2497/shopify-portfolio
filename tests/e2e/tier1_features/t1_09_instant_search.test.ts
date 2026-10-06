import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';
import { SearchEngine } from '../../harness/reference-engine';

describe('Tier 1: Feature 09 - Instant Search Overlay & Empty States (R1, AC-EC-07)', () => {
  const store = STORE_FIXTURES.electronics;
  const products = store.products;

  it('searching product title returns matching products instantly', () => {
    const searcher = new SearchEngine(store.config.id);
    const results = searcher.search('Monitor', products);

    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.title.toLowerCase()).toContain('monitor');
    }
  });

  it('searching product description returns matching products', () => {
    const searcher = new SearchEngine(store.config.id);
    const results = searcher.search('enthusiasts', products);

    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.description.toLowerCase()).toContain('enthusiasts');
    }
  });

  it('searching product tag returns matching products', () => {
    const searcher = new SearchEngine(store.config.id);
    const results = searcher.search('wireless', products);

    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.tags.map(t => t.toLowerCase())).toContain('wireless');
    }
  });

  it('case-insensitive search query matching works reliably', () => {
    const searcher = new SearchEngine(store.config.id);
    const upperResults = searcher.search('KEYBOARD', products);
    const lowerResults = searcher.search('keyboard', products);

    expect(upperResults.length).toBe(lowerResults.length);
    expect(upperResults[0].id).toBe(lowerResults[0].id);
  });

  it('gibberish search query returns empty array (no-results state)', () => {
    const searcher = new SearchEngine(store.config.id);
    const results = searcher.search('xyz987quantumunicornnonexistent', products);

    expect(results).toHaveLength(0);
  });

  it('search query history records recent searches in FIFO/LIFO order with max limit', () => {
    const searcher = new SearchEngine(store.config.id, undefined, 3);
    searcher.recordQuery('oled');
    searcher.recordQuery('headphones');
    searcher.recordQuery('dac');
    searcher.recordQuery('mouse');

    const recent = searcher.getRecentQueries();
    expect(recent).toHaveLength(3);
    expect(recent[0]).toBe('mouse');
    expect(recent[1]).toBe('dac');
    expect(recent[2]).toBe('headphones');
  });
});
