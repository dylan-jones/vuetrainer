---
title: Advanced slots with Grid/Flex
track: vue
order: 2
minutes: 60
summary: Named, scoped and dynamic slots, and slot-aware layouts that reflow with CSS Grid.
demo: SlotsDemo
objectives:
  - Can use named slots and fallback content
  - Can pass data to the parent with scoped slots
  - Can detect which slots were provided with useSlots / $slots
  - Can use dynamic slot names
  - Can forward slots through a wrapper component
  - Can switch Grid/Flex layouts depending on which slots exist
  - Can type slots with defineSlots
resources:
  - Vue guide: Slots | https://vuejs.org/guide/components/slots.html
  - defineSlots | https://vuejs.org/api/sfc-script-setup.html#defineslots
---

## Recap

```vue
<!-- Child: Panel.vue -->
<template>
  <section>
    <header><slot name="header">Default title</slot></header>
    <slot />                                    <!-- default slot -->
    <footer><slot name="footer" :count="3" /></footer>
  </section>
</template>

<!-- Parent -->
<Panel>
  <template #header>My title</template>
  Body goes to the default slot.
  <template #footer="{ count }">{{ count }} items</template>
</Panel>
```

## Scoped slots: the child provides data, the parent renders

The child owns the data and logic; the parent controls markup. This is the "renderless / headless component" idea. Think of how `v-data-table` lets you customise each cell.

```vue
<slot name="item" :item="item" :index="index">{{ item.label }}</slot>
```

```vue
<template #item="{ item, index }">…</template>
```

Content inside the slot tag is the **fallback**, rendered when the parent supplies nothing.

## Type your slots

```ts
defineSlots<{
  default(): any
  item(props: { item: Todo; index: number }): any
  footer?(props: { count: number }): any
}>()
```

## Dynamic slot names and forwarding

```vue
<template v-for="name in ['header', 'footer']" #[name]="slotProps">…</template>

<!-- Forward every slot from a wrapper to an inner component -->
<Inner>
  <template v-for="(_, name) in $slots" #[name]="slotProps">
    <slot :name="name" v-bind="slotProps ?? {}" />
  </template>
</Inner>
```

## Slot-aware layouts with Grid

The pattern in the demo: render a region only if its slot was provided and let the container's grid adapt.

```vue
<script setup lang="ts">
const slots = useSlots()
const layout = computed(() => ({ 'has-aside': !!slots.aside, 'has-header': !!slots.header }))
</script>

<template>
  <section class="card" :class="layout">
    <header v-if="$slots.header" class="card-header"><slot name="header" /></header>
    <div class="card-main"><slot /></div>
    <aside v-if="$slots.aside" class="card-aside"><slot name="aside" /></aside>
  </section>
</template>

<style scoped>
.card { display: grid; grid-template-areas: 'main'; }
.card.has-aside { grid-template-columns: 1fr 12rem; grid-template-areas: 'main aside'; }
.card.has-header { grid-template-areas: 'header' 'main'; }
.card.has-header.has-aside { grid-template-areas: 'header header' 'main aside'; }
</style>
```

Grid areas mean the DOM order can stay semantic while the visual order is controlled by CSS. For many optional regions, generate `grid-template-areas` as a computed string and bind it with `v-bind()` in CSS or a style binding:

```ts
const areas = computed(() => [header && '"header header"', '"main aside"', footer && '"footer footer"'].filter(Boolean).join(' '))
```

Combine with **container queries** (previous track) so the slots reflow based on the component's own width.

Flex is the better fit when the slot count is dynamic and linear, such as toolbars with `gap` and `flex-wrap`; use Grid when regions have two-dimensional relationships.

## Pitfalls

- `$slots.foo` is checked at render time. Slots are functions, so the check is cheap but not reactive on its own. It re-runs when the component re-renders.
- Slot content is compiled in the **parent's** scope. It can't see the child's variables unless passed as slot props.
- Don't call `<slot />` inside a `v-for` unless you intend to render it repeatedly.

## Exercise

Build `<AppCard>` with `header`, `media`, `default`, `actions` and `footer` slots:

1. Only render regions whose slots exist.
2. Use `grid-template-areas` that adapts to the slots present. Under a container width of 30rem, stack `media` above the content.
3. Add a typed scoped slot on `actions` exposing `{ close }`.
4. Write a second component that wraps `AppCard` and forwards all slots.
