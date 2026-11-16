---
title: Vuetify 4 — Sass variables
track: vuetify
order: 1
minutes: 60
summary: Change Vuetify's design tokens at build time with a Sass settings file.
objectives:
  - Know when to use Sass variables vs theme, defaults or CSS variables
  - Can create a settings.scss and wire it up with vite-plugin-vuetify
  - Can override global variables such as $body-font-family and $border-radius-root
  - Can find a component's overridable variables in node_modules
  - Know how to turn off parts of the framework you don't use (utilities, reset, color pack)
  - Understand that Sass variables are compile-time, so no runtime theming
resources:
  - Vuetify SASS variables | https://vuetifyjs.com/en/features/sass-variables/
  - Vuetify 4 upgrade guide | https://vuetifyjs.com/en/getting-started/upgrade-guide/
  - vite-plugin-vuetify | https://github.com/vuetifyjs/vuetify-loader
---

## Choosing the right tool

| Need | Use |
| --- | --- |
| Brand colours, light/dark | **Theme** (`createVuetify({ theme })`), runtime |
| Same props on every `v-btn` | **Component defaults** (next lessons) |
| Fonts, border radius, spacing scale, breakpoints, disable features | **Sass variables**, compile-time |
| Tweak one place on one page | A CSS rule in your own layer |

Sass variables change how Vuetify's stylesheets are *compiled*. They can't change at runtime, so don't use them for user-switchable theming.

## Set-up

1. A Sass compiler: `npm i -D sass-embedded` (already in this project).
2. A settings file, e.g. `src/styles/settings.scss`:

```scss
@use 'vuetify/settings' with (
  $body-font-family: ('Inter', system-ui, sans-serif),
  $border-radius-root: 8px,
  $color-pack: false,   // drop the Material colour pack classes (bg-red-lighten-2…)
);
```

3. Tell the Vite plugin about it (see `vite.config.ts`):

```ts
vuetify({ styles: { configFile: 'src/styles/settings.scss' } })
```

4. Import Vuetify's styles as usual (`import 'vuetify/styles'`). The plugin prepends your settings to every Vuetify stylesheet.

Restart the dev server after changing the config file.

> This project's `src/styles/settings.scss` does the above with `@forward`, which is equivalent for this purpose. Change `$border-radius-root` and watch every card and button change.

## Finding variables

Every global variable is declared with `!default` in:

```text
node_modules/vuetify/lib/styles/settings/_variables.scss
```

and each component has its own, e.g.:

```text
node_modules/vuetify/lib/components/VBtn/_variables.scss
```

Only variables marked `!default` can be overridden. Component variables go in the **same** `with (...)` block, for example `$button-height: 50px` makes the default `v-btn` 50px tall. Global ones you've seen: `$body-font-family`, `$font-size-root`, `$line-height-root`, `$border-radius-root`, `$border-color-root`, `$transition-duration-root`, `$reset`, `$color-pack`, and maps such as `$grid-breakpoints`, `$rounded`, `$elevations`, `$typography`.

Maps are **merged** with Vuetify's defaults (`map-deep-merge`), so you override only the keys you want:

```scss
@use 'vuetify/settings' with (
  $grid-breakpoints: ('md': 900px, 'lg': 1300px),
  $utilities: ('float': false, 'overflow': false),
);
```

Turning off utility groups you never use shrinks the CSS.

## Pitfalls

- **Load order.** A variable can only be configured *once*, the first time the module is loaded. Don't `@use 'vuetify/settings'` elsewhere before your config file.
- **Variables are per version.** Names changed between Vuetify 3 and 4 (Material Design 3 typography, etc.). Always check the installed `_variables.scss`, and the upgrade guide.
- **Don't over-customise.** If a runtime theme colour or a component default does the job, prefer it. Fewer Sass overrides mean easier upgrades.
- The configured file also forces the Sass pipeline for all Vuetify styles. Dev start-up can be slower than precompiled CSS.

## Exercise

1. In `src/styles/settings.scss` change `$border-radius-root` to `0px`, then to `16px`. Observe cards, buttons and chips on the dashboard.
2. Set `$font-size-root: 1.125rem` and look at the effect on spacing (spacing uses rem).
3. Disable at least two utility groups you don't use and compare the built CSS size (`npm run build`).
4. Open `VBtn/_variables.scss` and list 5 variables you might want to change. Write down in your notes how you'd decide between a Sass variable, a default prop and a CSS override for each.
