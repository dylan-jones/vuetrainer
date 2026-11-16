---
title: Sprintly 1 — Scaffold and style foundation
track: project
order: 1
minutes: 60
summary: Create the project and wire up Vuetify 4, Sass settings, CSS layers and component defaults.
objectives:
  - Scaffolded a Vue 3 + TypeScript + Router + Pinia + Vitest project
  - Installed Vuetify 4 with vite-plugin-vuetify and Sass
  - Created settings.scss, layers.css and the Vuetify plugin file
  - The app shows a Vuetify button styled by your defaults
resources:
  - Vue quick start | https://vuejs.org/guide/quick-start.html
  - Vuetify installation | https://vuetifyjs.com/en/getting-started/installation/
---

## What you're building

**Sprintly**, a small team task board. It's a mock, so there's no real backend (a fake async API with `setTimeout` stands in). Over eight lessons you will build:

| Lesson | You build | Skills practised |
| --- | --- | --- |
| 1 | Project + style foundation | Vuetify 4 set-up, Sass, layers, defaults |
| 2 | App shell | Router, Grid areas, Vuetify layout |
| 3 | Data layer | TypeScript types, Pinia, composables |
| 4 | Board and cards | Props/emits, computed, `v-for` |
| 5 | Task form | Component `v-model`, validation |
| 6 | Reusable card | Slots, container queries |
| 7 | Theming | Dark mode, brand tokens |
| 8 | Tests and deploy | Vitest, Cloudflare |

**Rule: type everything yourself.** Peek at this VueTrainer project when stuck. It uses the same techniques.

## 1. Scaffold

Outside this repo, in your usual dev folder:

```bash
npm create vue@latest sprintly
```

Answer the prompts: **TypeScript** yes, **Router** yes, **Pinia** yes, **Vitest** yes, **ESLint** yes, **Prettier** yes, everything else no. Then:

```bash
cd sprintly
npm install
npm run dev
```

Delete the sample content: `src/components/*`, `src/views/*`, `src/assets/*` (and remove the `assets/main.css` import from `main.ts`). Keep the router and store folders.

## 2. Add Vuetify 4

```bash
npm i vuetify @mdi/font
npm i -D vite-plugin-vuetify sass-embedded
```

`vite.config.ts`:

```ts
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ styles: { configFile: 'src/styles/settings.scss' } }),
  ],
  // ...keep the alias block from the scaffold
})
```

## 3. The three style files

Recreate these from the Vuetify lessons, using your own values.

`src/styles/settings.scss`: Sass variables (compile-time):

```scss
@forward 'vuetify/settings' with (
  $body-font-family: ('Inter', system-ui, sans-serif),
  $border-radius-root: 8px,
);
```

`src/styles/layers.css`: declares the layer order. **Must be imported first**:

```css
@layer
  vuetify-core, vuetify-components, vuetify-overrides, vuetify-utilities,
  app.tokens, app.base, app.components, app.overrides,
  vuetify-final;
```

`src/plugins/vuetify.ts`: theme and component defaults:

```ts
import 'vuetify/styles'
import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: { defaultTheme: 'light' },
  defaults: {
    VBtn: { variant: 'flat', rounded: 'lg' },
    VCard: { variant: 'outlined' },
    VTextField: { variant: 'outlined', density: 'comfortable' },
  },
})
```

## 4. Wire it into `main.ts`

```ts
import '@/styles/layers.css'          // 1st: fixes layer order
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@mdi/font/css/materialdesignicons.css'
import vuetify from '@/plugins/vuetify'
import router from '@/router'
import App from './App.vue'

createApp(App).use(createPinia()).use(vuetify).use(router).mount('#app')
```

And a minimal `App.vue`:

```vue
<template>
  <v-app>
    <v-main>
      <v-container>
        <v-btn color="primary">It works</v-btn>
      </v-container>
    </v-main>
  </v-app>
</template>
```

## Checkpoint

- The button is rounded and flat **without** you passing those props. That's your component defaults.
- Open DevTools → Elements → Styles and find the rules grouped under `Layer vuetify-components`.
- `npm run build` and `npm run type-check` pass.

If you want version control from the start: `git init`, commit, and create a GitHub repo `sprintly`.

## Exercise

1. Change `$border-radius-root` and restart the dev server. Note what changes.
2. Add a `app.tokens` rule defining `--app-gap: 1rem` on `:root` and use it in a style block.
3. Write two sentences in your notes: when would you use a Sass variable, a default, or a layered CSS override?
