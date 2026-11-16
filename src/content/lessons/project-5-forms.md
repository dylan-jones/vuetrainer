---
title: Sprintly 5 — Task form with component v-model
track: project
order: 5
minutes: 75
summary: Build custom v-model inputs and a create/edit dialog with validation.
objectives:
  - Built a TagInput using defineModel with an array
  - Built a PrioritySelect using defineModel
  - TaskDialog opens and closes via v-model
  - Dialog supports both create and edit
  - Form validation blocks empty titles
  - The new or edited task appears on the board
resources:
  - Vue component v-model | https://vuejs.org/guide/components/v-model.html
  - Vuetify form validation | https://vuetifyjs.com/en/components/forms/
---

## Custom inputs with `defineModel`

`src/components/TagInput.vue`. Emits **new arrays**, never mutates:

```vue
<script setup lang="ts">
import { ref } from 'vue'

const tags = defineModel<string[]>({ default: () => [] })
const draft = ref('')

function add() {
  const value = draft.value.trim().toLowerCase()
  if (value && !tags.value.includes(value)) tags.value = [...tags.value, value]
  draft.value = ''
}
function remove(tag: string) {
  tags.value = tags.value.filter((t) => t !== tag)
}
</script>

<template>
  <div>
    <v-text-field v-model="draft" label="Add tag" hide-details @keydown.enter.prevent="add" />
    <div class="d-flex flex-wrap ga-2 mt-2">
      <v-chip v-for="tag in tags" :key="tag" closable @click:close="remove(tag)">{{ tag }}</v-chip>
    </div>
  </div>
</template>
```

`src/components/PrioritySelect.vue`:

```vue
<script setup lang="ts">
import type { Priority } from '@/types'

const model = defineModel<Priority>({ required: true })
const items: Priority[] = ['low', 'medium', 'high']
</script>

<template>
  <v-select v-model="model" :items="items" label="Priority" />
</template>
```

Using them is just `<TagInput v-model="form.tags" />`. The parent doesn't care how they work inside.

## The dialog

The dialog has **two** models: whether it is open (`v-model`) and, via a prop, which task is being edited.

`src/components/TaskDialog.vue`:

```vue
<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { NewTask, Task } from '@/types'
import PrioritySelect from './PrioritySelect.vue'
import TagInput from './TagInput.vue'

const props = defineProps<{ task?: Task }>()
const open = defineModel<boolean>({ default: false })
const emit = defineEmits<{ save: [value: NewTask] }>()

const blank = (): NewTask => ({
  title: '', description: '', status: 'todo', priority: 'medium', tags: [], assignee: null,
})
const form = reactive<NewTask>(blank())

function fromTask(task: Task): NewTask {
  return {
    title: task.title, description: task.description, status: task.status,
    priority: task.priority, tags: [...task.tags], assignee: task.assignee,
  }
}

// Reset the form each time the dialog opens, from the task being edited or a blank one.
watch(open, (isOpen) => {
  if (isOpen) Object.assign(form, props.task ? fromTask(props.task) : blank())
})

const rules = { title: [(v: string) => !!v?.trim() || 'Title is required'] }

async function submit(event: Promise<{ valid: boolean }>) {
  if (!(await event).valid) return
  emit('save', { ...form, title: form.title.trim(), tags: [...form.tags] })
  open.value = false
}
</script>

<template>
  <v-dialog v-model="open" max-width="32rem">
    <v-card :title="task ? 'Edit task' : 'New task'">
      <v-form @submit.prevent="submit">
        <v-card-text class="d-grid ga-3">
          <v-text-field v-model="form.title" label="Title" :rules="rules.title" autofocus />
          <v-textarea v-model="form.description" label="Description" rows="2" auto-grow />
          <PrioritySelect v-model="form.priority" />
          <TagInput v-model="form.tags" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="open = false">Cancel</v-btn>
          <v-btn type="submit" color="primary">Save</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
```

Vuetify's `v-form` passes a promise-like submit event with a `valid` flag, so awaiting it keeps validation in one place.

Copying the tags array (`[...task.tags]`) matters: otherwise editing the form would mutate the store's task before you press Save.

## Hooking it up

In `BoardView.vue` add state and a **New task** button:

```ts
const dialog = ref(false)
const editing = ref<Task | undefined>()

function openNew() { editing.value = undefined; dialog.value = true }
function openEdit(t: Task) { editing.value = t; dialog.value = true }
async function save(value: NewTask) {
  if (editing.value) await store.update(editing.value.id, value)
  else await store.add(value)
}
```

```vue
<v-btn color="primary" prepend-icon="mdi-plus" @click="openNew">New task</v-btn>
<TaskDialog v-model="dialog" :task="editing" @save="save" />
```

Add an `edit` event to `TaskCard` and `BoardColumn` (same forwarding pattern as `move`) and call `openEdit`.

## Checkpoint

- **New task** opens a blank dialog; an empty title shows an error and doesn't save.
- Editing a card pre-fills the form. Cancelling and reopening shows fresh values, not stale edits.
- Tags can be added with Enter and removed with the chip's close button.

## Exercise

1. Add an `assignee` `v-autocomplete` fed by a `TEAM` constant, and show it on the card.
2. Give `TagInput` a `.unique` or `max` behaviour (a `max` prop limiting the number of tags).
3. Add a second named model to `TaskDialog`, e.g. `v-model:status`, so the parent can pre-select a column when the "+" is pressed inside one.
