---
title: Vue fundamentals refresher
track: vue
order: 1
minutes: 60
summary: The core ideas you'll use daily at work: SFCs, reactivity, props/emits, composables.
demo: ReactivityDemo
objectives:
  - Can write a component with <script setup lang="ts">
  - Can type props and emits with TypeScript
  - Understand ref vs reactive vs computed vs watch
  - Can extract logic into a composable
  - Know the main lifecycle hooks
  - Can use provide/inject and know when not to
  - Know what Pinia and Vue Router are used for
resources:
  - Vue guide: Essentials | https://vuejs.org/guide/essentials/application.html
  - Vue guide: Reusability (composables) | https://vuejs.org/guide/reusability/composables.html
  - Pinia | https://pinia.vuejs.org/
  - Vue Router | https://router.vuejs.org/
---

## Single-file component shape

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{ title: string; items: string[] }>()
const emit = defineEmits<{ select: [item: string] }>()

const query = ref('')
const filtered = computed(() => props.items.filter((i) => i.includes(query.value)))
</script>

<template>
  <h2>{{ title }}</h2>
  <input v-model="query" />
  <ul>
    <li v-for="item in filtered" :key="item" @click="emit('select', item)">{{ item }}</li>
  </ul>
</template>

<style scoped>
h2 { margin-block-end: 0.5rem; }
</style>
```

Top-level bindings in `<script setup>` are available in the template automatically.

## Reactivity cheat sheet

| API | Use for |
| --- | --- |
| `ref(x)` | Any single value. Access with `.value` in script; unwrapped in templates |
| `reactive({})` | Objects you never reassign. Don't destructure (loses reactivity). Use `toRefs` |
| `computed(() => …)` | Derived values. Cached; don't mutate in them |
| `watch(source, cb)` | Side effects when something changes (API call, storage) |
| `watchEffect(cb)` | Like watch but auto-tracks dependencies |
| `shallowRef` | Big objects/class instances you replace wholesale |

Rules of thumb: derive with `computed`, not `watch`. Prefer `ref` everywhere for consistency.

## Props down, events up

- Props are read-only. Never mutate them. Emit an event or use `defineModel` (next lessons).
- Use `:key` with `v-for` using a stable id, not the index when the list can reorder.
- Use `v-if` to add/remove from the DOM, `v-show` to toggle display.

## Composables

A composable is a function that uses reactivity APIs and returns reactive state and methods, named `useSomething`.

```ts
// composables/useLocalStorage.ts
import { ref, watch } from 'vue'

export function useLocalStorage<T>(key: string, initial: T) {
  const value = ref<T>(JSON.parse(localStorage.getItem(key) ?? 'null') ?? initial)
  watch(value, (v) => localStorage.setItem(key, JSON.stringify(v)), { deep: true })
  return value
}
```

Call composables synchronously inside `setup`, and clean up side effects with `onScopeDispose` / `onUnmounted`.

## Lifecycle hooks

`onMounted` (DOM exists: fetch, measure, third-party libs), `onUnmounted` (clean up listeners/timers), `onBeforeUpdate`/`onUpdated` (rare). Setup itself replaces `created`.

## provide / inject

Passes data to deeply nested descendants without prop drilling. Good for component-family context (tabs, form groups). For app-wide state use Pinia instead.

## Pinia and Router in one paragraph

**Pinia** is the official store: `defineStore('id', () => { … })` with the same setup style as components, used for state shared across pages (auth, progress). **Vue Router** maps URLs to components, with `beforeEach` guards for auth, lazy-loaded routes via `() => import(...)`, and `useRoute()`/`useRouter()` inside components. Read `src/stores/auth.ts` and `src/router/index.ts` in this very project.

## Exercise

1. Create a `useFetch<T>(url)` composable returning `{ data, error, loading }` and a `refresh()` function. It must cancel the previous request when `url` changes (`AbortController`).
2. Use it in a component with typed props and a typed emit.
3. Read this app's `src/stores/progress.ts` and explain in the notes how the debounced save works.
