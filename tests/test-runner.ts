/**
 * Central Automated Test Runner for Shopify Portfolio Platform
 * Discovers and executes all Tier 1, Tier 2, Tier 3, and Tier 4 E2E test suites.
 * Executable via: `npx tsx tests/test-runner.ts` or `node tests/test-runner.js`
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { runAllTests, formatReport, RunSummary } from './harness/test-framework';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// TIER 1: CORE FEATURE COVERAGE (14 Suites, 84 Tests)
// ============================================================================
import './e2e/tier1_features/t1_01_product_browsing.test';
import './e2e/tier1_features/t1_02_variant_selection.test';
import './e2e/tier1_features/t1_03_collection_filtering.test';
import './e2e/tier1_features/t1_04_collection_sorting.test';
import './e2e/tier1_features/t1_05_cart_operations.test';
import './e2e/tier1_features/t1_06_free_shipping_threshold.test';
import './e2e/tier1_features/t1_07_storage_persistence.test';
import './e2e/tier1_features/t1_08_wishlist_workflow.test';
import './e2e/tier1_features/t1_09_instant_search.test';
import './e2e/tier1_features/t1_10_simulated_checkout.test';
import './e2e/tier1_features/t1_11_demo_account.test';
import './e2e/tier1_features/t1_12_visual_differentiation.test';
import './e2e/tier1_features/t1_13_responsive_breakpoints.test';
import './e2e/tier1_features/t1_14_store_extensibility.test';

// ============================================================================
// TIER 2: BOUNDARY & CORNER CASES (13 Suites, 78 Tests)
// ============================================================================
import './e2e/tier2_boundaries/t2_01_cart_boundaries.test';
import './e2e/tier2_boundaries/t2_02_shipping_threshold_boundaries.test';
import './e2e/tier2_boundaries/t2_03_corrupted_storage_boundaries.test';
import './e2e/tier2_boundaries/t2_04_search_boundaries.test';
import './e2e/tier2_boundaries/t2_05_filter_boundaries.test';
import './e2e/tier2_boundaries/t2_06_sorting_boundaries.test';
import './e2e/tier2_boundaries/t2_07_variant_boundaries.test';
import './e2e/tier2_boundaries/t2_08_checkout_validation_boundaries.test';
import './e2e/tier2_boundaries/t2_09_account_data_boundaries.test';
import './e2e/tier2_boundaries/t2_10_unicode_internationalization_boundaries.test';
import './e2e/tier2_boundaries/t2_11_cross_store_isolation_boundaries.test';
import './e2e/tier2_boundaries/t2_12_responsive_viewport_boundaries.test';
import './e2e/tier2_boundaries/t2_13_theme_token_boundaries.test';

// ============================================================================
// TIER 3: PAIRWISE CROSS-FEATURE INTERACTIONS (10 Suites, 20 Tests)
// ============================================================================
import './e2e/tier3_interactions/t3_01_variant_price_cart_interaction.test';
import './e2e/tier3_interactions/t3_02_cart_shipping_threshold_interaction.test';
import './e2e/tier3_interactions/t3_03_search_navigation_cart_interaction.test';
import './e2e/tier3_interactions/t3_04_wishlist_filter_move_to_cart_interaction.test';
import './e2e/tier3_interactions/t3_05_multi_store_isolation_interaction.test';
import './e2e/tier3_interactions/t3_06_multi_tab_sync_interaction.test';
import './e2e/tier3_interactions/t3_07_multi_faceted_filter_and_sort_interaction.test';
import './e2e/tier3_interactions/t3_08_pdp_gallery_variant_interaction.test';
import './e2e/tier3_interactions/t3_09_full_checkout_order_history_interaction.test';
import './e2e/tier3_interactions/t3_10_theme_switching_css_variables_interaction.test';

// ============================================================================
// TIER 4: REAL-WORLD SHOPPER SCENARIOS (6 Suites, 6 Tests)
// ============================================================================
import './e2e/tier4_scenarios/t4_01_s1_coffee_connoisseur.test';
import './e2e/tier4_scenarios/t4_02_s2_fashion_minimalist.test';
import './e2e/tier4_scenarios/t4_03_s3_jewelry_luxury_gift.test';
import './e2e/tier4_scenarios/t4_04_s4_electronics_tech_comparison.test';
import './e2e/tier4_scenarios/t4_05_s5_multi_store_isolation.test';
import './e2e/tier4_scenarios/t4_06_s6_mobile_shopper_375px.test';

export async function main() {
  const filterArg = process.argv[2];
  console.log('Starting Shopify Portfolio E2E Test Runner...');
  if (filterArg) {
    console.log(`Filtering suites matching: "${filterArg}"`);
  }

  const summary: RunSummary = await runAllTests(filterArg);
  const report = formatReport(summary);

  console.log(report);

  // Write machine-readable summary
  try {
    const outputPath = path.resolve(__dirname, '../test-results.json');
    fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2), 'utf-8');
    console.log(`Saved structured results to: ${outputPath}`);
  } catch (err: any) {
    console.warn(`Could not save test-results.json: ${err.message}`);
  }

  if (summary.failed > 0) {
    process.exitCode = 1;
  } else {
    process.exitCode = 0;
  }

  return summary;
}

const isDirectRun = Boolean(
  process.argv[1] &&
    (process.argv[1] === fileURLToPath(import.meta.url) ||
      process.argv[1].endsWith('test-runner.ts') ||
      process.argv[1].endsWith('test-runner.js'))
);

if (isDirectRun || !process.env.TEST_HARNESS_NO_AUTO_RUN) {
  main().catch((err) => {
    console.error('Fatal Test Runner Error:', err);
    process.exit(1);
  });
}
