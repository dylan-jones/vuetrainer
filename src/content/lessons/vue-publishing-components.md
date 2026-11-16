---
title: Building and publishing reusable components
track: vue
order: 4
minutes: 90
summary: Vite library mode, TypeScript types, peer dependencies, and publishing to npm or a private registry.
objectives:
  - Can set up a Vite library-mode project for Vue components
  - Know why vue is a peerDependency and externalised
  - Can generate type declarations with vue-tsc
  - Can configure package.json exports, types, files and sideEffects
  - Can ship CSS (and know the options)
  - Can version and publish with npm (and know about scoped/private packages)
  - Can test the package locally before publishing
resources:
  - Vite library mode | https://vite.dev/guide/build.html#library-mode
  - npm publishing docs | https://docs.npmjs.com/creating-and-publishing-scoped-public-packages
  - Vue docs: Component libraries | https://vuejs.org/guide/scaling-up/tooling.html
  - Vue SFC tooling for libraries (vite-plugin-dts) | https://github.com/qmhc/vite-plugin-dts
---

## Overview

1. A normal Vite + Vue project containing a `src/components` folder and a `src/index.ts` that exports them.
2. `vite build` in **library mode** produces ESM (and optionally CJS) bundles.
3. Type declarations are produced from your `.vue` and `.ts` files.
4. `package.json` tells consumers what to load.
5. `npm publish`.

## Project layout

```text
my-ui/
  src/
    components/MyButton.vue
    index.ts
  vite.config.ts
  tsconfig.build.json
  package.json
```

```ts
// src/index.ts
export { default as MyButton } from './components/MyButton.vue'
export type { MyButtonProps } from './components/types'
```

## vite.config.ts

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue(), dts({ tsconfigPath: './tsconfig.build.json' })],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'my-ui',
    },
    rollupOptions: {
      // Never bundle Vue into your library, or consumers get two copies of Vue.
      external: ['vue', 'vuetify'],
      output: { globals: { vue: 'Vue' } },
    },
    cssCodeSplit: false,
  },
})
```

## package.json

```json
{
  "name": "@your-scope/my-ui",
  "version": "0.1.0",
  "type": "module",
  "files": ["dist"],
  "sideEffects": ["**/*.css"],
  "main": "./dist/my-ui.js",
  "module": "./dist/my-ui.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/my-ui.js" },
    "./style.css": "./dist/my-ui.css"
  },
  "peerDependencies": { "vue": "^3.5.0" },
  "devDependencies": { "vue": "^3.5.0" },
  "scripts": {
    "build": "vite build",
    "prepublishOnly": "npm run build"
  }
}
```

Key points:

- **`peerDependencies`** for Vue (and Vuetify if you build on it). The consuming app provides them.
- **`files`** limits what's published. Check with `npm pack --dry-run`.
- **`exports`** is the modern entry map; put `types` first.
- **`sideEffects`** lets bundlers tree-shake your components, but keep CSS listed so it isn't dropped.

## Styling choices

- **Scoped CSS** extracted to `dist/my-ui.css`; consumers `import '@your-scope/my-ui/style.css'`. Simplest.
- **CSS custom properties** for theming (`--my-ui-radius`). Consumers override variables rather than selectors.
- Put library CSS in a **named cascade layer** (`@layer my-ui { … }`) so apps can always override without specificity wars. This ties straight back to the CSS `@layer` lesson.
- Using container queries inside components makes them layout-agnostic.

## Plugin vs per-component export

For a few components just export them and let consumers import by name. For many, also export a plugin:

```ts
import type { App } from 'vue'
export default { install(app: App) { app.component('MyButton', MyButton) } }
```

## Test before you publish

```bash
npm run build
npm pack                 # creates my-ui-0.1.0.tgz
# in a consumer app:
npm install ../my-ui/my-ui-0.1.0.tgz
```

`npm link` works too, but symlinks can cause duplicate-Vue problems, so prefer `npm pack`.

## Publish

```bash
npm login
npm version patch          # 0.1.0 -> 0.1.1 (semver)
npm publish --access public   # scoped packages are private by default
```

For internal company use you'll probably publish to a **private registry** (GitHub Packages, Verdaccio, Artifactory). Ask your new team which one. Config is usually an `.npmrc` with `@your-scope:registry=https://…`.

Add a **README with a usage example**, a **CHANGELOG**, and automate releases in CI (e.g. Changesets). Never commit npm tokens.

## Exercise

1. Extract two components from earlier lessons (e.g. a container-query `<ProductCard>` and `<TagInput>`) into a new `my-ui` package.
2. Externalise Vue, emit types, ship a CSS file with a named `@layer`.
3. Run `npm pack` and install the tarball into this VueTrainer project (or a fresh app). Import and use both components.
4. Publish `0.1.0` to npm under your scope (or do `npm publish --dry-run` if you prefer not to publish publicly).
