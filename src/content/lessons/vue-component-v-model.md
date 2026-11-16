---
title: Component v-model
track: vue
order: 3
minutes: 45
summary: Two-way binding between parent and child with defineModel, multiple models and modifiers.
demo: VModelDemo
objectives:
  - Know that v-model on a component is a prop plus an update event
  - Can use defineModel for the default model
  - Can create named models and use several on one component
  - Can write modifiers handling with a set() transform
  - Can implement a local-copy pattern for form components
  - Know the manual modelValue / update:modelValue form
resources:
  - Vue guide: Component v-model | https://vuejs.org/guide/components/v-model.html
  - defineModel API | https://vuejs.org/api/sfc-script-setup.html#definemodel
---

## What it expands to

```vue
<Child v-model="count" />
<!-- is sugar for: -->
<Child :modelValue="count" @update:modelValue="(v) => (count = v)" />
```

## `defineModel` (Vue 3.4+)

```vue
<!-- Child.vue -->
<script setup lang="ts">
const model = defineModel<number>({ default: 0 })
</script>

<template>
  <button @click="model++">{{ model }}</button>
</template>
```

`model` behaves like a `ref`. Writing to it emits `update:modelValue`. If the parent doesn't use `v-model`, it still works as local state.

Options: `required`, `default`, `type`, `get(value)`, `set(value)`, `local: true` (always keep a local copy).

## Multiple models

```vue
<UserForm v-model:first-name="first" v-model:last-name="last" />
```

```ts
const firstName = defineModel<string>('firstName')
const lastName = defineModel<string>('lastName')
```

## Modifiers

```vue
<RatingInput v-model:label.capitalize="title" />
```

```ts
const [label, modifiers] = defineModel<string, 'capitalize'>('label', {
  set(value) {
    return modifiers.capitalize ? value.charAt(0).toUpperCase() + value.slice(1) : value
  },
})
```

Built-in modifiers on native inputs are `.trim`, `.number` and `.lazy`. Custom ones are up to you, and the demo above uses one.

## Objects and arrays

`defineModel` doesn't make mutation of an object **inside** the model emit an event. Emit a new object instead:

```ts
const form = defineModel<{ name: string; age: number }>({ required: true })
const update = (patch: Partial<typeof form.value>) => (form.value = { ...form.value, ...patch })
```

## The manual form (still seen at work, and needed for older Vue)

```ts
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const proxy = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})
```

## Where you'll see this with Vuetify

Every Vuetify input uses `v-model`; `v-dialog`, `v-navigation-drawer`, `v-expansion-panels` and `v-tabs` too. When wrapping them, forward the model with `defineModel` so the wrapper stays a drop-in replacement.

## Exercise

1. Build `<TagInput v-model="tags" />` (array of strings) with add/remove, emitting new arrays.
2. Add a `.unique` modifier that rejects duplicates.
3. Build `<DateRange v-model:start v-model:end />` with two named models. Prevent `end < start`.
4. Wrap `<v-text-field>` in your own component and forward `v-model` plus all other attributes (`v-bind="$attrs"`).
