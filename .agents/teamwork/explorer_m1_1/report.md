# Technical Blueprint: Project Scaffolding & Configuration (Milestone 1)

**Author:** Explorer M1-1  
**Scope:** Milestone 1 Core Foundation — Scaffolding & Configuration  
**Target Project:** Shopify Multi-Store Portfolio Platform  
**Target Workspace:** `C:/Users/Arham/.gemini/antigravity/scratch/shopify_portfolio`  

---

## 1. Executive Summary

This document defines the complete, concrete technical blueprint for initializing the **Shopify Multi-Store Portfolio Platform**. It provides exact, production-ready file specifications for `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `index.html`, and `src/index.css`.

### Key Design Pillars:
1. **Dynamic Theme Engine Support:** Tailwind CSS is mapped directly to CSS custom properties (`var(--color-primary)`, `var(--font-heading)`, `var(--theme-radius)`, etc.), enabling the 4 stores (Coffee, Fashion, Jewelry, Electronics) to dynamically switch colors, typography, border-radii, and animation timing without CSS rebuilds or class clashes.
2. **Robust Multi-Store Typography:** `index.html` pre-loads the 8 Google Fonts required by the 4 brand identities (Fraunces, Plus Jakarta Sans, Syne, Inter, Cormorant Garamond, Montserrat, Space Grotesk, JetBrains Mono) with `font-display: swap` for instant zero-layout-shift rendering.
3. **Full Test & Execution Harmony:** Integrated Vitest, JSDOM, `@testing-library/react`, and `tsx` script runner to power both component unit testing and the standalone E2E test runner (`tests/test-runner.ts`) designed by `test_writer_e2e_1`.
4. **Strict TypeScript & Path Resolution:** Seamless `@/*` path mapping across both `tsconfig.json` and `vite.config.ts` for clean imports across `types/`, `utils/`, `components/`, `engine/`, `sections/`, and `stores/`.

---

## 2. File Specifications

### 2.1. `package.json`

```json
{
  "name": "shopify-portfolio",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "tsc --noEmit",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "tsx tests/test-runner.ts"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "lucide-react": "^0.378.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.23.1",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.5",
    "@testing-library/react": "^15.0.7",
    "@types/node": "^20.12.12",
    "@types/react": "^18.3.2",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "jsdom": "^24.0.0",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "tsx": "^4.10.2",
    "typescript": "^5.4.5",
    "vite": "^5.2.11",
    "vitest": "^1.6.0"
  }
}
```

#### Dependency Rationale:
- **`react` & `react-dom` (`^18.3.1`)**: Stable, battle-tested version avoiding experimental breaking changes with test libraries.
- **`react-router-dom` (`^6.23.1`)**: Provides client-side SPA routing (`/`, `/:storeId`, `/:storeId/collections/:handle`, `/:storeId/products/:handle`, `/:storeId/cart`, `/:storeId/checkout`, `/:storeId/account`), URL parameter extraction, and browser back/forward history navigation.
- **`lucide-react` (`^0.378.0`)**: Comprehensive e-commerce iconography (cart, heart, search, menu, star, check, sliders, filter, truck, credit-card, user, chevron, etc.).
- **`clsx` & `tailwind-merge`**: Core engine for `src/utils/cn.ts` to merge dynamic conditional Tailwind classes without specificity collision.
- **`tailwindcss` (`^3.4.3`) & `autoprefixer` (`^10.4.19`) & `postcss` (`^8.4.38`)**: Standard Tailwind CSS v3 pipeline with full CSS custom property support.
- **`vitest` (`^1.6.0`) & `jsdom` (`^24.0.0`)**: Blazing fast in-memory DOM test runner sharing the exact same Vite configuration.
- **`tsx` (`^4.10.2`)**: TypeScript runtime to execute `tests/test-runner.ts` directly in Node without compilation overhead.

---

### 2.2. `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting / Strictness */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Paths */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src", "tests"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

### 2.3. `tsconfig.node.json`

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

---

### 2.4. `vite.config.ts`

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: false,
    host: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}', 'src/**/*.{test,spec}.{ts,tsx}'],
  },
});
```

---

### 2.5. `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          hover: 'var(--color-secondary-hover)',
          light: 'var(--color-secondary-light)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
        },
        background: {
          DEFAULT: 'var(--color-background)',
          alt: 'var(--color-background-alt)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          hover: 'var(--color-surface-hover)',
          alt: 'var(--color-surface-alt)',
        },
        text: {
          DEFAULT: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
          inverse: 'var(--color-text-inverse)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          focus: 'var(--color-border-focus)',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        theme: 'var(--theme-radius, 0.5rem)',
      },
      transitionDuration: {
        theme: 'var(--animation-duration, 300ms)',
      },
      transitionTimingFunction: {
        theme: 'var(--animation-easing, cubic-bezier(0.4, 0, 0.2, 1))',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fade-in var(--animation-duration, 300ms) var(--animation-easing, ease-out) forwards',
        'slide-in': 'slide-in-right var(--animation-duration, 300ms) var(--animation-easing, ease-out) forwards',
      },
    },
  },
  plugins: [],
};
```

---

### 2.6. `postcss.config.js`

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

---

### 2.7. `index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Shopify Portfolio — Multi-Store E-Commerce Platform</title>
    <meta
      name="description"
      content="A premier Shopify-focused e-commerce showcase featuring 4 distinct brand stores (Coffee, Fashion, Jewelry, Electronics) powered by a unified headless engine."
    />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2322c55e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z'/><path d='M3 6h18'/><path d='M16 10a4 4 0 0 1-8 0'/></svg>" />

    <!-- Google Fonts Preconnect -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

    <!-- Google Fonts: Fraunces, Plus Jakarta Sans, Syne, Inter, Cormorant Garamond, Montserrat, Space Grotesk, JetBrains Mono -->
    <link
      href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Montserrat:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Syne:wght@400;600;700;800&display=swap"
      rel="stylesheet"
    />
  </head>
  <body class="bg-background text-text antialiased selection:bg-primary selection:text-text-inverse">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

### 2.8. `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Default Fallback / Hub Theme */
  --color-primary: #111827;
  --color-primary-hover: #1f2937;
  --color-primary-light: #f3f4f6;
  --color-primary-dark: #030712;
  --color-secondary: #4b5563;
  --color-secondary-hover: #374151;
  --color-secondary-light: #e5e7eb;
  --color-accent: #3b82f6;
  --color-accent-hover: #2563eb;
  --color-background: #ffffff;
  --color-background-alt: #f9fafb;
  --color-surface: #ffffff;
  --color-surface-hover: #f3f4f6;
  --color-surface-alt: #f9fafb;
  --color-text: #111827;
  --color-text-muted: #6b7280;
  --color-text-inverse: #ffffff;
  --color-border: #e5e7eb;
  --color-border-focus: #3b82f6;

  --font-heading: 'Inter', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --theme-radius: 0.5rem;
  --animation-duration: 300ms;
  --animation-easing: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Base resets & smooth scrolling */
html {
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  background-color: var(--color-background);
  color: var(--color-text);
  font-family: var(--font-body);
  min-height: 100vh;
  margin: 0;
  overflow-x: hidden;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: var(--color-background-alt);
}
::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-muted);
}
```

---

## 3. Dynamic Theme Mapping Matrix

The CSS custom properties defined in `src/index.css` and `tailwind.config.js` map 1:1 to the 4 store theme specifications in `PROJECT.md`:

| Token | Coffee ("Terroir & Roast") | Fashion ("Atelier Noir") | Jewelry ("L'Étoile Joaillerie") | Electronics ("Nexus Tech") |
|---|---|---|---|---|
| `--color-primary` | `#2C1810` (Espresso) | `#0A0A0A` (Jet Black) | `#C5A059` (Champagne Gold) | `#00E5FF` (Cyber Cyan) |
| `--color-secondary`| `#D4A373` (Caramel) | `#333333` (Charcoal) | `#2A2A2A` (Obsidian) | `#7928CA` (Neon Violet) |
| `--color-accent` | `#6F4E37` (Roast) | `#E5E5E5` (Off-White) | `#E8D5B5` (Pale Gold) | `#FF0080` (Hot Pink) |
| `--color-background`| `#FDFBF7` (Warm Cream) | `#FFFFFF` (Pure White) | `#0D0D0D` (Velvet Black) | `#0A0E17` (Deep Space) |
| `--color-surface` | `#F5EBE0` (Soft Linen) | `#F8F8F8` (Light Grey) | `#171717` (Charcoal Surface) | `#121826` (Navy Surface) |
| `--color-text` | `#2C1810` (Dark Brown) | `#0A0A0A` (Deep Black) | `#F5F5F5` (Bright Off-White) | `#F1F5F9` (Ice White) |
| `--color-text-muted`| `#7F5539` (Medium Roast) | `#737373` (Mid Grey) | `#A3A3A3` (Muted Silver) | `#94A3B8` (Slate Blue) |
| `--color-border` | `#E6D5C3` (Cream Border) | `#E5E5E5` (Crisp Border) | `#333333` (Dark Subtle Border)| `#1E293B` (Tech Border) |
| `--font-heading` | `'Fraunces', serif` | `'Syne', sans-serif` | `'Cormorant Garamond', serif`| `'Space Grotesk', sans-serif` |
| `--font-body` | `'Plus Jakarta Sans', sans-serif` | `'Inter', sans-serif` | `'Montserrat', sans-serif` | `'Inter', sans-serif` |
| `--theme-radius` | `1rem` (`rounded-2xl`) | `0px` (`rounded-none`) | `0.375rem` (`rounded-md`) | `0.125rem` (`rounded-sm`) |
| `--animation-duration`| `400ms` (Smooth) | `500ms` (Cinematic) | `600ms` (Luxury Slow) | `200ms` (Snappy HUD) |

---

## 4. Execution & Implementation Strategy for Worker

The implementing Worker should follow this strict execution sequence:

1. **Step 1: Write Root Config Files**:
   - Write `package.json`
   - Write `postcss.config.js`
   - Write `tailwind.config.js`
   - Write `tsconfig.json`
   - Write `tsconfig.node.json`
   - Write `vite.config.ts`
   - Write `index.html`
2. **Step 2: Install Dependencies**:
   - Run `npm install`
3. **Step 3: Create Entry Points**:
   - Write `src/index.css`
   - Create minimal stub `src/main.tsx` and `src/App.tsx` (renders basic container)
   - Create `tests/setup.ts` (imports `@testing-library/jest-dom`)
4. **Step 4: Verify Scaffolding Build**:
   - Run `npm run build` — must compile with zero errors
   - Run `npm run lint` — must pass type checking with zero errors
5. **Step 5: Hand off to Types & Utils Implementers**:
   - The type system (`src/types/`) and base primitives (`src/utils/`, `src/components/common/`) can now be implemented on this verified scaffold.

---

## 5. Potential Pitfalls & Safeguards

| Potential Issue | Root Cause | Preventive Safeguard in Blueprint |
|---|---|---|
| ESM vs CJS collision | `package.json` has `"type": "module"`, but config files use `module.exports` | Blueprint specifies `export default` in all `.js` and `.ts` config files. |
| Path alias `@/*` resolution failure | `@/*` declared in `tsconfig.json` but missing in `vite.config.ts` | Blueprint defines `@/*` in both `tsconfig.json` paths and `vite.config.ts` resolve aliases. |
| Vitest DOM missing APIs | Vitest runs in Node without DOM globals | Blueprint sets `test.environment: 'jsdom'` and includes `jsdom` dependency. |
| Missing fonts on initial load | Fonts loaded lazily or missing font definitions | All 8 required fonts are preconnected and linked in `index.html` with `display=swap`. |
| Tailwind purge missing files | `content` array missing test files or subdirectories | `content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}']` covers all React components. |
