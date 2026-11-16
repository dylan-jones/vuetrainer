---
title: Sprintly 7 — Theming with Sass, layers and defaults
track: project
order: 7
minutes: 60
summary: Give Sprintly a brand, dark mode and consistent component styling, using all four Vuetify tools.
objectives:
  - Added brand colours to light and dark themes
  - Dark mode toggle that remembers the choice
  - Tuned Sass variables for font and radius
  - Wrote overrides in the app.overrides layer
  - Used nested component defaults for buttons inside cards
  - Checked every screen in both themes
resources:
  - Vuetify theme configuration | https://vuetifyjs.com/en/features/theme/
  - Vuetify global configuration | https://vuetifyjs.com/en/features/global-configuration/
---

## The four tools, one job each

| Tool | Where | Use it for |
| --- | --- | --- |
| Sass variables | `settings.scss` | Font, base radius, disabling unused features |
| Theme | `plugins/vuetify.ts` | Colours, light/dark |
| Layers | `layers.css`, `main.css` | Your own overrides, predictably ordered |
| Defaults | `plugins/vuetify.ts` | Consistent props on every instance |

Pick a brand for Sprintly. Example: indigo primary, warm accent, soft grey background.

## Theme with two modes

```ts
export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: { primary: '#4f46e5', secondary: '#0ea5e9', background: '#f8fafc', surface: '#ffffff' },
      },
      dark: {
        colors: { primary: '#818cf8', secondary: '#38bdf8', background: '#0f172a', surface: '#1e293b' },
      },
    },
  },
})
```

Toggle and persist (reuse the composable from lesson 3):

```vue
<script setup lang="ts">
import { watchEffect } from 'vue'
import { useTheme } from 'vuetify'
import { useLocalStorage } from '@/composables/useLocalStorage'

const theme = useTheme()
const mode = useLocalStorage<'light' | 'dark'>('sprintly:theme', 'light')
watchEffect(() => theme.change(mode.value))
</script>

<template>
  <v-btn
    :icon="mode === 'dark' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
    variant="text"
    aria-label="Toggle theme"
    @click="mode = mode === 'dark' ? 'light' : 'dark'"
  />
</template>
```

In Vuetify 4 you could instead set `defaultTheme: 'system'`. Choose per taste: a toggle gives the user control.

## Defaults for consistency

```ts
defaults: {
  VBtn: { variant: 'flat', rounded: 'lg' },
  VCard: {
    variant: 'flat',
    rounded: 'lg',
    border: true,
    VBtn: { variant: 'text' },       // buttons *inside* cards are quiet
  },
  VChip: { size: 'small', rounded: 'md' },
  VTextField: { variant: 'outlined', density: 'comfortable' },
  VSelect: { variant: 'outlined', density: 'comfortable' },
  VTextarea: { variant: 'outlined', density: 'comfortable' },
  VDialog: { maxWidth: '36rem' },
}
```

Note: `VBtn` nested inside `VCard` is how the card's arrow and delete buttons become text buttons, but your **New task** button (outside a card) stays flat.

## Layers for the stragglers

Some things have no prop, such as focus rings or column background. Put them in a layer above Vuetify:

```css
@layer app.tokens {
  :root { --app-gap: 1rem; --app-column-bg: rgba(var(--v-theme-on-surface), 0.04); }
}

@layer app.components {
  .column {
    background: var(--app-column-bg);
    border-radius: 12px;
    padding: 0.75rem;
  }
}

@layer app.overrides {
  .v-btn:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
  }
}
```

No `!important` and no specificity tricks are needed. Layer order does the job.

## Sass settings

```scss
@forward 'vuetify/settings' with (
  $body-font-family: ('Inter', system-ui, sans-serif),
  $border-radius-root: 10px,
  $button-height: 40px,
);
```

Remember that Sass is compile-time. You'd never use it for the dark-mode toggle.

## Checkpoint

- Both themes look intentional, with readable text everywhere (check contrast in DevTools' colour picker).
- The theme choice survives a reload.
- Find three rules in DevTools and name the layer each comes from.

## Exercise

1. Add a third theme, `highContrast`, and a three-way switch.
2. Add a custom colour `accent-warm` to the theme and use it with `color="accent-warm"` on the high-priority chip. (Look up how to declare custom theme colours.)
3. Take before/after screenshots of the board and save them in your notes.
