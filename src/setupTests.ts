import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';

expect.extend(matchers);

// Mock scroll functions for jsdom
Element.prototype.scrollTo = () => {};
Element.prototype.scrollBy = () => {};
