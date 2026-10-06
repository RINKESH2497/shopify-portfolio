// Verification script running inside explorer folder
import * as fs from 'fs';
import * as path from 'path';

const testRunnerPath = 'C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/tests/test-runner.js';
let content = fs.readFileSync(testRunnerPath, 'utf8');

// Apply the proposed modifications in memory
const oldVariantSnippet = `    const variants = [
      { id: \`var-\${storeId}-\${i}-1\`, title: 'Standard', price, options: { Size: 'M', Grind: 'Whole Bean', Metal: '14K Gold', Storage: '256GB' }, availableForSale: true, inventoryQuantity: 20, imageUrl: \`https://images.unsplash.com/v-\${i}-1\` },
      { id: \`var-\${storeId}-\${i}-2\`, title: 'Premium', price: price + 15, options: { Size: 'L', Grind: '1kg', Metal: '18K White Gold', Storage: '1TB' }, availableForSale: true, inventoryQuantity: 10, imageUrl: \`https://images.unsplash.com/v-\${i}-2\` },
      { id: \`var-\${storeId}-\${i}-3\`, title: 'Out of Stock', price: price + 5, options: { Size: 'XS', Grind: 'Decaf', Metal: 'Platinum', Storage: '128GB' }, availableForSale: false, inventoryQuantity: 0, imageUrl: \`https://images.unsplash.com/v-\${i}-3\` }
    ];`;

const newVariantSnippet = `    const compareAtPrice = Math.round((price * 1.25) * 100) / 100;
    const variants = [
      { id: \`var-\${storeId}-\${i}-1\`, title: 'Standard', price, compareAtPrice, options: { Size: 'M', Color: 'Black', Grind: 'Whole Bean', Metal: '14K Gold', Storage: '256GB' }, availableForSale: true, inventoryQuantity: 20, imageUrl: \`https://images.unsplash.com/v-\${i}-1\` },
      { id: \`var-\${storeId}-\${i}-2\`, title: 'Premium', price: price + 15, compareAtPrice: Math.round(((price + 15) * 1.25) * 100) / 100, options: { Size: 'L', Color: 'Charcoal', Grind: '1kg', Metal: '18K White Gold', Storage: '1TB' }, availableForSale: true, inventoryQuantity: 10, imageUrl: \`https://images.unsplash.com/v-\${i}-2\` },
      { id: \`var-\${storeId}-\${i}-3\`, title: 'Out of Stock', price: price + 5, compareAtPrice: Math.round(((price + 5) * 1.25) * 100) / 100, options: { Size: 'XS', Color: 'White', Grind: 'Decaf', Metal: 'Platinum', Storage: '128GB' }, availableForSale: false, inventoryQuantity: 0, imageUrl: \`https://images.unsplash.com/v-\${i}-3\` }
    ];`;

content = content.replace(oldVariantSnippet, newVariantSnippet);

// Replace products.push price
content = content.replace(
  `      category: ['Outerwear', 'Rings', 'Displays', 'Single Origin'][i % 4],\n      price,`,
  `      category: ['Outerwear', 'Rings', 'Displays', 'Single Origin'][i % 4],\n      price,\n      compareAtPrice,`
);

// Replace CatalogFilterEngine
const oldFilter = `      if (filters.size) {\n        if (!p.variants.some(v => v.options?.Size === filters.size)) return false;\n      }`;
const newFilter = `      if (filters.color) {\n        if (!p.variants.some(v => v.options?.Color === filters.color || (v.options?.Color && v.options.Color.toLowerCase() === filters.color.toLowerCase()))) return false;\n      }\n      if (filters.size) {\n        if (!p.variants.some(v => v.options?.Size === filters.size || (v.options?.Size && v.options.Size.toLowerCase() === filters.size.toLowerCase()))) return false;\n      }`;

content = content.replace(oldFilter, newFilter);

// Replace line 526
const old526 = `  it('handles compareAtPrice correctly', () => { expect(true).toBe(true); });`;
const new526 = `  it('handles compareAtPrice correctly', () => {
    const v = fashionProducts[0].variants[0];
    expect(v.compareAtPrice).toBeDefined();
    expect(v.compareAtPrice).toBeGreaterThan(v.price);
    const discount = Math.round(((v.compareAtPrice - v.price) / v.compareAtPrice) * 100);
    expect(discount).toBeGreaterThan(0);
    expect(discount).toBeLessThan(100);
  });`;

content = content.replace(old526, new526);

// Replace line 535
const old535 = `  it('color filter narrows products', () => { expect(true).toBe(true); });`;
const new535 = `  it('color filter narrows products', () => {
    const f = CatalogFilterEngine.filter(fashionProducts, { color: 'Black' });
    expect(f.length).toBeGreaterThan(0);
    for (const p of f) {
      expect(p.variants.some(v => v.options?.Color === 'Black')).toBe(true);
    }
  });`;

content = content.replace(old535, new535);

// Check if any expect(true).toBe(true) remains
const remainingDummy = content.match(/expect\(true\)\.toBe\(true\)/g);
console.log('Remaining expect(true).toBe(true) count:', remainingDummy ? remainingDummy.length : 0);

// Execute the modified content by creating a temp runner in our folder
fs.writeFileSync('C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio/.agents/teamwork/explorer_m1_r3_1/simulated_runner.js', content, 'utf8');
console.log('Wrote simulated_runner.js in agent directory');
