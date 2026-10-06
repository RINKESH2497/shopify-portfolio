import { StoreRegistryEntry } from '../../types/store';
import { fashionThemeConfig } from './theme';
import { fashionProducts } from './products';

export { fashionThemeConfig } from './theme';
export { fashionProducts } from './products';

export const fashionStore: StoreRegistryEntry = {
  config: fashionThemeConfig,
  products: fashionProducts,
};

export default fashionStore;
