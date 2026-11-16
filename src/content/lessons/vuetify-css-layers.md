---
title: Vuetify 4 — custom CSS layers
track: vuetify
order: 2
minutes: 45
summary: Slot your own styles into Vuetify's cascade layers so overrides are predictable.
objectives:
  - Know the names and order of Vuetify's built-in layers
  - Can declare an app layer order that wraps Vuetify's layers
  - Can write app overrides in a layer without raising specificity
  - Know why the layer statement must be loaded first
  - Know how unlayered CSS and !important interact with Vuetify
  - Can debug which layer a rule comes from in DevTools
resources:
  - MDN @layer | https://developer.mozilla.org/en-US/docs/Web/CSS/@layer
  - Vuetify 4 upgrade guide | https://vuetifyjs.com/en/getting-started/upgrade-guide/
---

## Vuetify's layers

Vuetify 4 emits all of its CSS inside layers (you can see them in `node_modules/vuetify/lib/styles/layers.css`):

```css
@layer vuetify-core { @layer reset, base; }
@layer vuetify-components;
@layer vuetify-overrides;
@layer vuetify-utilities {
  @layer theme-base, typography, helpers, theme-background, theme-foreground;
}
@layer vuetify-final { @layer transitions, trumps; }
```

Meaning, from weakest to strongest: core (reset/base) → component styles → overrides → utilities (`.pa-4`, `.text-center`, `.bg-primary`) → final (transitions and "trumps").

Because everything lives in layers, **any unlayered CSS you write already beats all of Vuetify**. No more `!important` or `.v-card.v-card.my-card`.

## Your own layers around Vuetify's

This project's `src/styles/layers.css`:

```css
@layer
  vuetify-core,
  vuetify-components,
  vuetify-overrides,
  vuetify-utilities,
  app.tokens,
  app.base,
  app.components,
  app.overrides,
  vuetify-final;
```

- `app.*` layers sit **above** Vuetify's components/utilities, so `app.components` can restyle `.v-card` with a plain selector.
- `vuetify-final` stays last, so transitions and trumps keep working.
- Put the layer statement in a file imported **before** `vuetify/styles` (see `main.ts`). The first appearance of a layer name fixes its priority.

Then write overrides:

```css
@layer app.overrides {
  .v-card {                       /* plain selector, no specificity tricks */
    border-radius: var(--app-card-radius);
  }
  .v-btn.v-btn--variant-flat:hover {
    filter: brightness(1.05);
  }
}
```

## Deciding where code goes

| Layer | Put here |
| --- | --- |
| `app.tokens` | CSS custom properties (`:root { --app-gap: 1rem }`) |
| `app.base` | Element styles (`a`, `body`, `code`) |
| `app.components` | Your own component and prose styles |
| `app.overrides` | Deliberate overrides of Vuetify components |

If some utility must beat everything (including your layers), put it in `vuetify-final.trumps` or leave it unlayered. Use sparingly.

## Scoped SFC styles and layers

`<style scoped>` blocks are **unlayered** unless you wrap them:

```vue
<style scoped>
@layer app.components {
  .my-card { padding: 1rem; }
}
</style>
```

Unlayered scoped styles beat every layer, which is often fine for component-local styling but can surprise you when you try to override them from a layer. Decide on a convention as a team and stick to it.

## Debugging

In Chrome/Edge DevTools, the Styles pane groups rules under `Layer vuetify-components` and so on. Check the **Layers** panel (in Elements → Styles sidebar) to see the final order.

## Common mistakes

- Importing `main.css` (with layers) before the layer statement, so layer order ends up different from intended.
- Forgetting that third-party unlayered CSS (e.g. an icon font) beats your layers.
- Putting `!important` in a layer expecting it to be "stronger". It reverses layer order.

## Exercise

1. In `src/styles/main.css`, add a rule to `app.overrides` that gives every `.v-card` a `box-shadow`. Confirm it applies with plain `.v-card` specificity.
2. Move the rule to `vuetify-components` (i.e. below Vuetify's utilities in order). Does it still win? Why/why not?
3. Reorder the statement in `layers.css` so `app.overrides` comes *before* `vuetify-components`, and watch it break.
4. Create a new layer `app.themes` that sets different CSS variables for a "high-contrast" `[data-contrast]` attribute on `<html>`.
