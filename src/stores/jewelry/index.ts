import { StoreRegistryEntry } from '../../types/store';
import { jewelryThemeConfig } from './theme';
import { jewelryProducts } from './products';

export { jewelryThemeConfig } from './theme';
export { jewelryProducts } from './products';

export const jewelryStore: StoreRegistryEntry = {
  config: jewelryThemeConfig,
  products: jewelryProducts,
};

export default jewelryStore;
