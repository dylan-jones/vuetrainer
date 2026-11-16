---
title: Sprintly 3 — Types, fake API and Pinia store
track: project
order: 3
minutes: 75
summary: Model the data in TypeScript, mock an async API, and manage state in a Pinia store.
objectives:
  - Defined Task, Status and Priority types
  - Wrote a fake async API with seed data
  - Built a Pinia setup store with load, add, update, remove
  - Used computed getters to group tasks by status
  - Persisted tasks with a useLocalStorage composable
resources:
  - Pinia core concepts | https://pinia.vuejs.org/core-concepts/
  - Vue composables | https://vuejs.org/guide/reusability/composables.html
  - TypeScript handbook, everyday types | https://www.typescriptlang.org/docs/handbook/2/everyday-types.html
---

## Types first

`src/types.ts`:

```ts
export type Status = 'todo' | 'doing' | 'done'
export type Priority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  description: string
  status: Status
  priority: Priority
  tags: string[]
  assignee: string | null
  createdAt: number
}

export const STATUSES: { value: Status; label: string }[] = [
  { value: 'todo', label: 'To do' },
  { value: 'doing', label: 'In progress' },
  { value: 'done', label: 'Done' },
]

export type NewTask = Omit<Task, 'id' | 'createdAt'>
```

Types written first make the rest easier: the editor tells you what's missing.

## A fake API

`src/api/tasks.ts`. Same shape you'd use with real `fetch` calls, so swapping it later is easy.

```ts
import type { NewTask, Task } from '@/types'

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms))

const seed: Task[] = [
  { id: '1', title: 'Set up project', description: '', status: 'done', priority: 'high', tags: ['setup'], assignee: 'Sam', createdAt: Date.now() - 3e8 },
  { id: '2', title: 'Design the board', description: 'Three columns', status: 'doing', priority: 'medium', tags: ['ui'], assignee: 'Alex', createdAt: Date.now() - 2e8 },
  { id: '3', title: 'Write tests', description: '', status: 'todo', priority: 'low', tags: ['quality'], assignee: null, createdAt: Date.now() - 1e8 },
]

let db: Task[] = structuredClone(seed)

export async function listTasks(): Promise<Task[]> {
  await delay()
  return structuredClone(db)
}

export async function createTask(input: NewTask): Promise<Task> {
  await delay(200)
  const task: Task = { ...input, id: crypto.randomUUID(), createdAt: Date.now() }
  db = [...db, task]
  return structuredClone(task)
}

export async function patchTask(id: string, patch: Partial<NewTask>): Promise<Task> {
  await delay(200)
  const current = db.find((t) => t.id === id)
  if (!current) throw new Error('Task not found')
  const updated = { ...current, ...patch }
  db = db.map((t) => (t.id === id ? updated : t))
  return structuredClone(updated)
}

export async function deleteTask(id: string): Promise<void> {
  await delay(200)
  db = db.filter((t) => t.id !== id)
}
```

## A reusable composable

`src/composables/useLocalStorage.ts`:

```ts
import { ref, watch, type Ref } from 'vue'

export function useLocalStorage<T>(key: string, initial: T): Ref<T> {
  let start = initial
  try {
    const raw = localStorage.getItem(key)
    if (raw !== null) start = JSON.parse(raw) as T
  } catch {
    // ignore corrupt data and fall back to the default
  }
  const value = ref(start) as Ref<T>
  watch(value, (v) => localStorage.setItem(key, JSON.stringify(v)), { deep: true })
  return value
}
```

## The Pinia store

`src/stores/tasks.ts`:

```ts
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as api from '@/api/tasks'
import type { NewTask, Status, Task } from '@/types'

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const byStatus = computed(() => {
    const groups: Record<Status, Task[]> = { todo: [], doing: [], done: [] }
    for (const t of tasks.value) groups[t.status].push(t)
    return groups
  })

  async function load() {
    loading.value = true
    error.value = null
    try {
      tasks.value = await api.listTasks()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function add(input: NewTask) {
    tasks.value.push(await api.createTask(input))
  }

  async function update(id: string, patch: Partial<NewTask>) {
    const updated = await api.patchTask(id, patch)
    tasks.value = tasks.value.map((t) => (t.id === id ? updated : t))
  }

  async function remove(id: string) {
    await api.deleteTask(id)
    tasks.value = tasks.value.filter((t) => t.id !== id)
  }

  return { tasks, loading, error, byStatus, load, add, update, remove }
})
```

Notice how `ref` → state, `computed` → getters, functions → actions. It's the same as a component.

Use `useLocalStorage` for something small that should survive reloads, such as the board's filter settings in lesson 4.

## Checkpoint

In `BoardView.vue`, call `store.load()` in `onMounted` and temporarily print `JSON.stringify(store.byStatus)` in the template. You should see a short delay, then the three seed tasks grouped by status. Vue DevTools → Pinia tab shows the same state.

## Exercise

1. Make `api.listTasks` fail randomly 20% of the time. Show `store.error` in a `v-alert` with a **Retry** button.
2. Add a `counts` computed to the store returning the number of tasks per status.
3. Add an **optimistic update** to `update()`: change the local task first, call the API, and roll back if it throws.
