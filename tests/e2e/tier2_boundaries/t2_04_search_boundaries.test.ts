import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';
import { SearchEngine } from '../../harness/reference-engine';

describe('Tier 2: Boundary 04 - Search Query Edge Cases & Adversarial Input', () => {
  const store = STORE_FIXTURES.electronics;
  const products = store.products;
  const searcher = new SearchEngine(store.config.id);

  it('empty string query returns empty array', () => {
    const results = searcher.search('', products);
    expect(results).toHaveLength(0);
  });

  it('whitespace-only query returns empty array without error', () => {
    const results = searcher.search('   \t \n   ', products);
    expect(results).toHaveLength(0);
  });

  it('1000-character long query executes safely without hang or crash', () => {
    const longQuery = 'a'.repeat(1000);
    const results = searcher.search(longQuery, products);
    expect(results).toHaveLength(0);
  });

  it('regex special characters in query do not trigger syntax error', () => {
    const specialChars = '.*+?^${}()|[]\\';
    expect(() => {
      const results = searcher.search(specialChars, products);
      expect(Array.isArray(results)).toBe(true);
    }).not.toThrow();
  });

  it('HTML / script injection query treats query as literal string', () => {
    const injectionQuery = '<script>alert(1)</script>';
    const results = searcher.search(injectionQuery, products);
    expect(results).toHaveLength(0);
  });

  it('query containing emojis executes safely', () => {
    const emojiQuery = '⚡ 💻 🎧';
    const results = searcher.search(emojiQuery, products);
    expect(Array.isArray(results)).toBe(true);
  });
});
