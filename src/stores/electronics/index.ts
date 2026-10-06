import { StoreRegistryEntry } from '../../types/store';
import { electronicsThemeConfig } from './theme';
import { electronicsProducts } from './products';

export { electronicsThemeConfig } from './theme';
export { electronicsProducts } from './products';

export const electronicsStore: StoreRegistryEntry = {
  config: electronicsThemeConfig,
  products: electronicsProducts,
};

export default electronicsStore;
