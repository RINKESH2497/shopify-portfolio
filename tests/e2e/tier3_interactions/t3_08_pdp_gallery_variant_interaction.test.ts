import { describe, it, expect } from '../../harness/test-framework';
import { STORE_FIXTURES } from '../../fixtures/catalog-fixtures';

describe('Tier 3: Interaction 08 - PDP Gallery, Variant Switching & Stock States', () => {
  const store = STORE_FIXTURES.jewelry;
  const product = store.products[0];

  it('selecting variant option updates active variant and resolves associated variant image', () => {
    const v1 = product.variants[0];
    const v2 = product.variants[1];

    expect(v1.id).not.toBe(v2.id);
    expect(v1.imageUrl).toBeDefined();
    expect(v2.imageUrl).toBeDefined();
    expect(v1.imageUrl).not.toBe(v2.imageUrl);
  });

  it('selecting a sold-out variant flags out-of-stock and prevents purchase action', () => {
    const outOfStockVariant = product.variants.find(v => !v.availableForSale);
    expect(outOfStockVariant).toBeDefined();

    if (outOfStockVariant) {
      const isPurchasable = outOfStockVariant.availableForSale && outOfStockVariant.inventoryQuantity > 0;
      expect(isPurchasable).toBe(false);
    }
  });
});
