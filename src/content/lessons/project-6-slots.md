---
title: Sprintly 6 — Reusable BaseCard with slots and container queries
track: project
order: 6
minutes: 75
summary: Extract a slot-driven card whose layout adapts to its own width, and add a stats strip.
objectives:
  - Built BaseCard with header, default, actions and footer slots
  - BaseCard only renders regions whose slots are provided
  - BaseCard lays out with CSS Grid areas
  - BaseCard adapts using a container query
  - TaskCard is rebuilt on top of BaseCard
  - Built a stats strip using a scoped slot
resources:
  - Vue slots | https://vuejs.org/guide/components/slots.html
  - MDN container queries | https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries
---

## Goal

`TaskCard` currently mixes layout and task logic. Pull the **layout** into a generic `BaseCard` that any part of the app (and later a shared library) can reuse.

## BaseCard

`src/components/BaseCard.vue`:

```vue
<script setup lang="ts">
import { computed, useSlots } from 'vue'

const slots = useSlots()
const layout = computed(() => ({
  'has-header': !!slots.header,
  'has-actions': !!slots.actions,
  'has-footer': !!slots.footer,
}))
</script>

<template>
  <div class="base-card">
    <article class="inner" :class="layout">
      <header v-if="$slots.header" class="header"><slot name="header" /></header>
      <div class="body"><slot /></div>
      <div v-if="$slots.actions" class="actions"><slot name="actions" /></div>
      <footer v-if="$slots.footer" class="footer"><slot name="footer" /></footer>
    </article>
  </div>
</template>

<style scoped>
.base-card {
  container-type: inline-size;   /* children can query this element's width */
  container-name: base-card;
}
.inner {
  display: grid;
  gap: 0.5rem 1rem;
  padding: 0.75rem;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: var(--v-border-radius, 8px);
  grid-template-areas: 'header' 'body' 'actions' 'footer';
}
.header { grid-area: header; font-weight: 600; }
.body { grid-area: body; min-width: 0; }
.actions { grid-area: actions; display: flex; gap: 0.25rem; justify-content: flex-end; }
.footer { grid-area: footer; font-size: 0.85rem; opacity: 0.8; }

/* Wide containers: actions sit beside the body instead of underneath */
@container base-card (min-width: 26rem) {
  .inner {
    grid-template-columns: 1fr auto;
    grid-template-areas:
      'header  header'
      'body    actions'
      'footer  footer';
  }
  .actions { flex-direction: column; justify-content: flex-start; }
}
</style>
```

Why the extra `.base-card` wrapper? A container can't be styled by its own `@container` query, so the grid lives on a **child** of the container.

Empty grid areas simply collapse. Unused names in `grid-template-areas` create empty tracks that have no height (`gap` aside), which is fine for this card. If it bothers you, build the `grid-template-areas` string dynamically from `layout`, as in the Slots lesson.

## Rebuild TaskCard on top of it

```vue
<template>
  <BaseCard>
    <template #header>
      {{ task.title }}
      <v-chip :color="priorityColor[task.priority]" class="ml-2">{{ task.priority }}</v-chip>
    </template>

    <p v-if="task.description">{{ task.description }}</p>
    <div class="d-flex flex-wrap ga-1 mt-2">
      <v-chip v-for="tag in task.tags" :key="tag" variant="tonal">{{ tag }}</v-chip>
    </div>

    <template #actions>
      <!-- the same move / edit / delete buttons as before -->
    </template>

    <template #footer>Created {{ new Date(task.createdAt).toLocaleDateString() }}</template>
  </BaseCard>
</template>
```

Resize the browser: in narrow columns the actions are stacked below the body, and when the card has room (e.g. in a single-column mobile view) they sit to the side. The *same* component adapts to wherever it is placed.

## A scoped slot: StatsStrip

The stats component owns the data, and the parent chooses how to render each stat.

`src/components/StatsStrip.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { STATUSES } from '@/types'
import { useTaskStore } from '@/stores/tasks'

const store = useTaskStore()
const stats = computed(() =>
  STATUSES.map((s) => ({ ...s, count: store.byStatus[s.value].length })),
)
</script>

<template>
  <div class="strip">
    <template v-for="stat in stats" :key="stat.value">
      <!-- fallback content when the parent provides no slot -->
      <slot :stat="stat">
        <v-card class="pa-3">{{ stat.label }}: {{ stat.count }}</v-card>
      </slot>
    </template>
  </div>
</template>

<style scoped>
.strip {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
}
</style>
```

Use it in `BoardView`:

```vue
<StatsStrip class="stats">
  <template #default="{ stat }">
    <BaseCard>
      <template #header>{{ stat.label }}</template>
      <span class="text-h4">{{ stat.count }}</span>
    </BaseCard>
  </template>
</StatsStrip>
```

## Checkpoint

- `TaskCard` has no layout CSS of its own; it fills `BaseCard` slots.
- A `BaseCard` with only a default slot renders with no empty header/footer boxes (inspect the DOM).
- Dragging the browser narrower makes the card actions move below the body. Prove it's the *container* and not the viewport by putting a card inside a narrow fixed-width div on a wide screen.

## Exercise

1. Add a `media` slot to `BaseCard` (an avatar or icon area) that appears to the left when the container is wide.
2. Type the slots with `defineSlots<{ ... }>()`.
3. Make the footer slot scoped, exposing `{ collapsed: boolean }`, and use `cqi` units for the header font size.
4. Use a Grid **subgrid** so headers, bodies and actions line up across cards in the same row.
