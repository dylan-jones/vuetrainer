---
title: Vuetify 4 — component defaults
track: vuetify
order: 3
minutes: 45
summary: Set props once for every instance, globally, nested per parent, or in a subtree.
demo: DefaultsDemo
objectives:
  - Can configure global defaults in createVuetify
  - Can nest defaults per parent component
  - Can scope defaults to a subtree with v-defaults-provider
  - Can use the global key and aliases for custom component flavours
  - Know the precedence between defaults and explicit props
  - Can combine defaults with Sass variables, layers and theme to style an entire app
resources:
  - Vuetify global configuration | https://vuetifyjs.com/en/features/global-configuration/
  - Vuetify aliasing | https://vuetifyjs.com/en/features/aliasing/
---

## The idea

Instead of writing `<v-btn variant="flat" rounded="lg" color="primary">` hundreds of times, set it once:

```ts
// src/plugins/vuetify.ts
export default createVuetify({
  defaults: {
    VBtn: { variant: 'flat', rounded: 'lg' },
    VCard: { variant: 'outlined', rounded: 'lg' },
    VTextField: { variant: 'outlined', density: 'comfortable' },
    VProgressLinear: { rounded: true, height: 8 },
  },
})
```

Any prop on that component can be defaulted. Explicit props on an instance **always win**.

## Nested defaults

Key by parent to change what a child gets *inside* that parent:

```ts
defaults: {
  VCard: {
    VCardTitle: { class: 'text-wrap' },
    VBtn: { variant: 'text' },       // buttons inside cards are text buttons
  },
}
```

`VBtn` inside `VCard` now differs from `VBtn` elsewhere. This is how you build a consistent design system without wrapper components.

## Global key

`global` applies to **every** component that has the prop:

```ts
defaults: {
  global: { density: 'comfortable' },
}
```

Use it carefully, because it affects components you'll forget exist.

## Scoped defaults in templates

```vue
<v-defaults-provider :defaults="{ VBtn: { color: 'secondary', variant: 'outlined' } }">
  <v-btn>Inherits the above</v-btn>
</v-defaults-provider>
```

Good for a dialog, a toolbar, a table's actions column. Try it in the demo above.

Inside your own components `useDefaults(props, 'MyComponent')` (from `vuetify`) lets them take part in the same defaults system.

## Aliases

Give a customised flavour of a component its own name:

```ts
import { VBtn } from 'vuetify/components'

createVuetify({
  aliases: { VBtnPrimary: VBtn },
  defaults: { VBtnPrimary: { color: 'primary', variant: 'flat', size: 'large' } },
})
```

Then `<v-btn-primary>` is a real component. (See the aliasing docs for typing details.)

## Precedence (high → low)

1. Props set directly on the component instance.
2. `v-defaults-provider` closer to the component.
3. Nested/parent-keyed defaults in `createVuetify`.
4. Top-level per-component defaults in `createVuetify`.
5. `global` defaults.
6. The component's built-in defaults.

(Always verify in a quick experiment when something surprising happens.)

## The full app-wide styling recipe

1. **Sass variables** → tokens that need compile-time access (font family, base radius).
2. **Theme** → colours, light/dark.
3. **Layers** → where your CSS overrides sit relative to Vuetify.
4. **Component defaults** → consistent variants/density/behaviour for every instance.

Open `src/plugins/vuetify.ts`, `src/styles/settings.scss` and `src/styles/layers.css` side by side. They are the four steps above.

## Exercise

1. Add `VSelect`, `VAutocomplete` and `VTextarea` defaults that match `VTextField` so forms look uniform.
2. Add nested defaults so `VBtn` inside `VCard` uses `variant: 'text'`.
3. Create an alias `VBtnDanger` with `color: 'error'` and use it.
4. **Capstone:** pick a fictional brand. Change its font, radius (Sass), colours (theme), a layer-based override for focus rings, and defaults for buttons, inputs and cards. Take before/after screenshots.
