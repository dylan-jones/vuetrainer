---
title: Fancy use of CSS Grid
track: css
order: 2
minutes: 60
summary: Named areas, auto-fit/auto-fill, minmax, subgrid and alignment tricks.
demo: GridDemo
objectives:
  - Can build a page layout with grid-template-areas
  - Understand the difference between auto-fit and auto-fill
  - Can write responsive grids with repeat(auto-fit, minmax())
  - Can use subgrid to align content across sibling cards
  - Can place items by line number, span and named lines
  - Know when to choose Grid vs Flexbox
resources:
  - MDN CSS Grid guide | https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout
  - Subgrid on MDN | https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Subgrid
  - CSS Grid by Josh Comeau | https://www.joshwcomeau.com/css/interactive-guide-to-grid/
  - Grid Garden (game) | https://cssgridgarden.com/
---

## Mental model

Flexbox lays out in **one dimension** (a row *or* a column) and is content-driven. Grid lays out in **two dimensions** and is layout-driven. Use Grid for the page/section structure and Flexbox for aligning stuff inside a single row or column. They combine well.

## Named areas

```css
.page {
  display: grid;
  gap: 1rem;
  grid-template-columns: 16rem 1fr;
  grid-template-areas:
    'header header'
    'nav    main'
    'footer footer';
}
.page > header { grid-area: header; }
```

Changing the layout for small screens means redefining `grid-template-areas` once.

## Responsive without media queries

```css
.cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr));
}
```

- `minmax(16rem, 1fr)`: each column is at least 16rem and shares leftover space.
- `min(16rem, 100%)` stops overflow on screens narrower than 16rem.
- **`auto-fit`** collapses empty tracks, so items stretch to fill the row. **`auto-fill`** keeps empty tracks, so items keep their size and leave blank space. Try both in the demo code.

## Subgrid

Cards with a title, body and button usually misalign because each card sizes its own rows. Subgrid lets the child **reuse the parent's row tracks**:

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 0 1rem;
}
.card {
  display: grid;
  grid-row: span 3;            /* take 3 of the parent's rows */
  grid-template-rows: subgrid; /* ...and use them for my children */
}
```

Now every card's title, body and button line up across the row. Subgrid works for columns too (`grid-template-columns: subgrid`).

## Placement tools

```css
.hero { grid-column: 1 / -1; }            /* full width */
.sidebar { grid-row: span 2; }
.wide { grid-column: span 2; }

/* Named lines */
.layout {
  grid-template-columns:
    [full-start] minmax(1rem, 1fr)
    [content-start] minmax(0, 70ch)
    [content-end] minmax(1rem, 1fr)
    [full-end];
}
.layout > * { grid-column: content; }
.layout > .bleed { grid-column: full; }
```

That "full-bleed" pattern is one of the most useful real-world grids.

## Handy alignment

- `place-items: center` centres items in their cells.
- `grid-auto-flow: dense` back-fills holes (watch out for visual order vs DOM order and accessibility).
- `grid-auto-rows: minmax(8rem, auto)` for implicit rows.
- `min-width: 0` on grid children stops long content from blowing out `1fr` columns.

## Exercise

Build one page that contains:

1. A named-area app shell (header, nav, main, aside, footer) that reflows to a single column under 40rem.
2. A card gallery using `repeat(auto-fit, minmax(...))`.
3. A set of three cards with different amounts of text whose headings, bodies and buttons align using **subgrid**.
4. A full-bleed hero inside a centred content column using named lines.
