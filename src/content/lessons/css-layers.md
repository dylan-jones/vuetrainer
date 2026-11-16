---
title: CSS @layer
track: css
order: 1
minutes: 45
summary: Control the cascade explicitly with cascade layers, instead of fighting specificity.
demo: LayerDemo
objectives:
  - Can explain how layers change the order of the cascade
  - Can declare a layer order with a single @layer statement
  - Know that unlayered styles beat layered styles
  - Know how !important reverses layer order
  - Can use nested layers and import a stylesheet into a layer
resources:
  - MDN @layer | https://developer.mozilla.org/en-US/docs/Web/CSS/@layer
  - CSS-Tricks guide to cascade layers | https://css-tricks.com/css-cascade-layers/
  - Can I use cascade layers | https://caniuse.com/css-cascade-layers
---

## The problem

Normally the cascade resolves conflicts by **importance → specificity → source order**. Third‑party CSS (a component library, a reset) forces you into specificity wars: `.my-card .title` vs `.v-card .v-card-title`, then `!important`, then `#app .my-card .title`.

**Cascade layers** add a step *before* specificity: **layer order wins first**. A one-class selector in a later layer beats an id selector in an earlier layer.

## Declaring layers

```css
/* 1. Declare the order once, up front. Later = higher priority. */
@layer reset, vendor, base, components, utilities;

/* 2. Put rules in layers (any number of times, any file). */
@layer components {
  .button { padding: 0.5rem 1rem; }
}

/* 3. Import third-party CSS straight into a layer. */
@import url('library.css') layer(vendor);
```

The **first time** a layer name is seen fixes its position. That's why the order statement goes at the very top, before anything else mentions those layers. (This project does it in `src/styles/layers.css`, imported first from `main.ts`.)

## The rules to remember

| Situation | Winner |
| --- | --- |
| Two layered rules | The one in the **later** layer, regardless of specificity |
| Layered vs **unlayered** | **Unlayered** always wins |
| Same layer | Normal specificity, then source order |
| `!important` | Order **reverses**: earlier layers win; unlayered `!important` is weakest of the important ones |

Unlayered beating layered is the single biggest gotcha. If you put your CSS in a layer but the library's isn't, the library wins.

## Nested layers

```css
@layer framework {
  @layer reset, base;   /* framework.reset, framework.base */
}

@layer framework.base {
  body { margin: 0; }
}
```

Nested layers are ordered inside their parent, and the parent is ordered among its siblings.

## Anonymous layers and `revert-layer`

`@layer { … }` without a name creates a one-off layer. `revert-layer` rolls a property back to what it would be from the previous layer, handy for opting out of an override.

## Why it matters for Vuetify

Vuetify 4 ships its CSS inside layers named `vuetify-core`, `vuetify-components`, `vuetify-overrides`, `vuetify-utilities` and `vuetify-final`. That means *your* app's layers can be placed above or below any of them. You'll do exactly that in the Vuetify lessons.

## Exercise

1. Create `layers.html` with `@layer reset, base, components, utilities;`.
2. Put a `.btn` rule with an **id-based** selector in `components` and a plain `.btn` rule in `utilities`. Confirm utilities wins.
3. Add an unlayered `.btn` rule and confirm it beats both.
4. Add `!important` to the `components` rule and observe the reversal.
5. Import a small CSS file into a layer with `@import … layer(vendor)` and override it from `components` without raising specificity.
