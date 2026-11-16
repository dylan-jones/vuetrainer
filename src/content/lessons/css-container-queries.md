---
title: CSS @container queries
track: css
order: 3
minutes: 45
summary: Make components respond to their container, not the viewport.
demo: ContainerDemo
objectives:
  - Can explain how container queries differ from media queries
  - Can set container-type and container-name
  - Can write a @container size query
  - Can use container query units such as cqi
  - Know that the container itself cannot be styled by its own query
  - Can combine container queries with Grid for reusable components
resources:
  - MDN container queries | https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries
  - web.dev container queries guide | https://web.dev/articles/cq-stable
---

## Why

A media query asks "how wide is the **viewport**?". But a reusable component can be dropped in a full-width page, a narrow sidebar or a modal. Its layout should depend on **the space it has been given**. Container queries do exactly that.

## Usage

```css
.card-wrapper {
  container-type: inline-size;   /* track the inline (width) size */
  container-name: card;          /* optional but recommended */
}

.card {
  display: grid;
  gap: 1rem;
}

@container card (min-width: 28rem) {
  .card {
    grid-template-columns: 8rem 1fr;
  }
}
```

Shorthand: `container: card / inline-size;`.

### Important rules

- The element with `container-type` is the **query container**. It is **not** affected by its own `@container` rules, only descendants are. That's why there's a wrapper in the demo.
- `container-type: inline-size` applies **layout, style and inline-size containment**, so the container can't size itself from its children's width. Give it a width from the parent (grid cell, flex item, `width: 100%`).
- Without a name, a query uses the nearest ancestor container. With a name, it picks that one.
- Range syntax works: `@container (400px <= width < 700px)`.

## Container query units

| Unit | Meaning |
| --- | --- |
| `cqw` / `cqh` | 1% of container width / height |
| `cqi` / `cqb` | 1% of container inline / block size |
| `cqmin` / `cqmax` | smaller / larger of the two |

```css
h2 { font-size: clamp(1rem, 6cqi, 2rem); }
```

## Style queries (bonus)

`@container style(--variant: compact) { … }` queries custom property values on a container. Support is growing; check browser support before using in production.

## Patterns that work well

- Card components that switch between stacked and horizontal.
- Sidebar widgets that must be reusable in main and aside columns.
- Combine with Grid: the grid decides how wide the cell is, and the component adapts inside it.
- In Vue, a container-aware component works without knowing where it will be used. No `useWindowSize` hacks.

## Exercise

1. Build a product card: stacked under 24rem, image-left layout from 24rem, and three columns of meta information from 40rem.
2. Place it three times: in a full-width section, a 20rem sidebar and a 3-column grid. Confirm each adapts differently on the same viewport.
3. Use `cqi` units for the title size.
4. Make the same component a Vue SFC so you can reuse it (you'll publish something like it in the Vue track).
