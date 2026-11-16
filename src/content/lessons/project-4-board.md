---
title: Sprintly 4 — Board, columns and cards
track: project
order: 4
minutes: 75
summary: Build the Kanban board with props, emits, filtering and loading states.
objectives:
  - Built TaskCard with typed props and emits
  - Built BoardColumn that renders a list of cards
  - Board shows three columns from the store
  - Search and priority filters work using computed values
  - Loading, error and empty states are handled
  - Moving a card between columns updates the store
resources:
  - Vue props | https://vuejs.org/guide/components/props.html
  - Vue events | https://vuejs.org/guide/components/events.html
  - Vue list rendering | https://vuejs.org/guide/essentials/list.html
---

## The data flow

```text
BoardView (owns filters, talks to store)
  └─ BoardColumn (one per status)
       └─ TaskCard (one per task)
```

Props flow **down**, events flow **up**. Only `BoardView` touches the store; the child components are plain and easy to test.

## TaskCard

`src/components/TaskCard.vue`:

```vue
<script setup lang="ts">
import type { Status, Task } from '@/types'

defineProps<{ task: Task }>()
const emit = defineEmits<{
  move: [id: string, status: Status]
  remove: [id: string]
}>()

const priorityColor = { low: 'success', medium: 'warning', high: 'error' } as const
</script>

<template>
  <v-card class="task-card">
    <v-card-item>
      <v-card-title>{{ task.title }}</v-card-title>
      <template #append>
        <v-chip :color="priorityColor[task.priority]">{{ task.priority }}</v-chip>
      </template>
    </v-card-item>
    <v-card-text v-if="task.description">{{ task.description }}</v-card-text>
    <v-card-actions>
      <v-chip v-for="tag in task.tags" :key="tag" variant="tonal">{{ tag }}</v-chip>
      <v-spacer />
      <v-btn
        v-if="task.status !== 'todo'"
        icon="mdi-arrow-left"
        variant="text"
        aria-label="Move back"
        @click="emit('move', task.id, task.status === 'done' ? 'doing' : 'todo')"
      />
      <v-btn
        v-if="task.status !== 'done'"
        icon="mdi-arrow-right"
        variant="text"
        aria-label="Move forward"
        @click="emit('move', task.id, task.status === 'todo' ? 'doing' : 'done')"
      />
      <v-btn icon="mdi-delete" variant="text" aria-label="Delete" @click="emit('remove', task.id)" />
    </v-card-actions>
  </v-card>
</template>
```

## BoardColumn

```vue
<script setup lang="ts">
import type { Status, Task } from '@/types'
import TaskCard from './TaskCard.vue'

defineProps<{ title: string; tasks: Task[] }>()
defineEmits<{ move: [id: string, status: Status]; remove: [id: string] }>()
</script>

<template>
  <section class="column">
    <h2 class="text-subtitle-1 font-weight-bold">{{ title }} <v-chip>{{ tasks.length }}</v-chip></h2>
    <div class="cards">
      <TaskCard
        v-for="t in tasks"
        :key="t.id"
        :task="t"
        @move="(id, s) => $emit('move', id, s)"
        @remove="(id) => $emit('remove', id)"
      />
      <p v-if="!tasks.length" class="text-medium-emphasis">Nothing here</p>
    </div>
  </section>
</template>

<style scoped>
.cards { display: grid; gap: 0.75rem; }
</style>
```

Always use a **stable `:key`** (the id, never the index) so Vue keeps the right DOM per task.

## Filters in BoardView

```ts
import { computed, onMounted, ref } from 'vue'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { useTaskStore } from '@/stores/tasks'
import { STATUSES, type Priority } from '@/types'

const store = useTaskStore()
onMounted(store.load)

const search = ref('')
// persisted between reloads
const priority = useLocalStorage<Priority | 'all'>('sprintly:priority', 'all')

const visible = computed(() => {
  const q = search.value.trim().toLowerCase()
  const groups = { todo: [], doing: [], done: [] } as typeof store.byStatus
  for (const status of STATUSES) {
    groups[status.value] = store.byStatus[status.value].filter(
      (t) =>
        (priority.value === 'all' || t.priority === priority.value) &&
        (!q || t.title.toLowerCase().includes(q) || t.tags.some((tag) => tag.includes(q))),
    )
  }
  return groups
})
```

Template pieces inside the grid areas from lesson 2:

```vue
<header class="toolbar d-flex ga-3 flex-wrap">
  <v-text-field v-model="search" label="Search" prepend-inner-icon="mdi-magnify" hide-details clearable />
  <v-btn-toggle v-model="priority" mandatory density="comfortable">
    <v-btn value="all">All</v-btn>
    <v-btn value="high">High</v-btn>
    <v-btn value="medium">Medium</v-btn>
    <v-btn value="low">Low</v-btn>
  </v-btn-toggle>
</header>

<section class="columns">
  <v-progress-linear v-if="store.loading" indeterminate />
  <v-alert v-else-if="store.error" type="error" :text="store.error" />
  <div v-else class="column-grid">
    <BoardColumn
      v-for="s in STATUSES"
      :key="s.value"
      :title="s.label"
      :tasks="visible[s.value]"
      @move="(id, status) => store.update(id, { status })"
      @remove="store.remove"
    />
  </div>
</section>
```

```css
.column-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
}
```

## Checkpoint

- Three columns, each with the right cards. They wrap on narrow screens.
- Arrow buttons move cards after a short delay. Delete removes them.
- Typing in search filters live; the priority filter survives a reload.
- You see the progress bar while loading.

## Exercise

1. Add a "Clear filters" button visible only when a filter is active.
2. Show "No tasks match your filters" instead of "Nothing here" when filters hide everything.
3. Add keyboard support: pressing `Delete` on a focused card asks for confirmation using a `v-dialog`.
4. Disable the move buttons on a card while its update is in flight (hint: a `pending` Set in the store).
