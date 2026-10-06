import { StoreRegistryEntry } from '../../types/store';
import { coffeeThemeConfig } from './theme';
import { coffeeProducts } from './products';

export { coffeeThemeConfig } from './theme';
export { coffeeProducts } from './products';

export const coffeeStore: StoreRegistryEntry = {
  config: coffeeThemeConfig,
  products: coffeeProducts,
};

export default coffeeStore;
