# vite-plugin-auto-css-modules
same as babel-plugin-auto-css-modules but for vite

## install

```bash
yarn add vite-plugin-auto-css-modules -D
```

## usage

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import autoCSSModulePlugin from 'vite-plugin-auto-css-modules';

export default defineConfig({
  // ... other config
  plugins: [
    autoCSSModulePlugin(),
  ],
});
```

```tsx
// this will be modulized css
import $ from './index.css';

// this will be normal css
import './index.css';

// you do not need to name your style file to xx.module.css
```