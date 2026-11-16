---
title: Sprintly 8 — Tests, build and deploy
track: project
order: 8
minutes: 90
summary: Test the store and a component, share your components as a package, and deploy to Cloudflare.
objectives:
  - Wrote Vitest tests for the Pinia store
  - Wrote a component test for TaskCard events
  - npm run build and type-check pass cleanly
  - Extracted BaseCard and TagInput into a reusable package (or ran a dry-run publish)
  - Deployed Sprintly to Cloudflare
  - Pushed the project to GitHub
resources:
  - Vitest | https://vitest.dev/guide/
  - Vue Test Utils | https://test-utils.vuejs.org/guide/
  - Testing Pinia | https://pinia.vuejs.org/cookbook/testing.html
  - Cloudflare Workers static assets | https://developers.cloudflare.com/workers/static-assets/
---

## 1. Test the store

The fake API has a built-in delay, so tests would be slow. Mock the module:

`src/stores/__tests__/tasks.spec.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTaskStore } from '../tasks'
import type { Task } from '@/types'

const task = (over: Partial<Task>): Task => ({
  id: 'x', title: 't', description: '', status: 'todo', priority: 'low',
  tags: [], assignee: null, createdAt: 0, ...over,
})

vi.mock('@/api/tasks', () => ({
  listTasks: vi.fn(async () => [task({ id: '1' }), task({ id: '2', status: 'done' })]),
  createTask: vi.fn(),
  patchTask: vi.fn(),
  deleteTask: vi.fn(async () => {}),
}))

describe('task store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('groups tasks by status after load', async () => {
    const store = useTaskStore()
    await store.load()
    expect(store.byStatus.todo.map((t) => t.id)).toEqual(['1'])
    expect(store.byStatus.done.map((t) => t.id)).toEqual(['2'])
  })

  it('removes a task', async () => {
    const store = useTaskStore()
    await store.load()
    await store.remove('1')
    expect(store.tasks.map((t) => t.id)).toEqual(['2'])
  })
})
```

Run with `npm run test:unit`.

## 2. Test a component

Wrap in Vuetify for component tests. A tiny helper in `src/test-utils.ts`:

```ts
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import type { Component } from 'vue'

export const mountWithVuetify = (component: Component, props: Record<string, unknown>) =>
  mount(component, {
    props,
    global: { plugins: [createVuetify({ components, directives })] },
  })
```

(You may also need `global.stubs` or a `ResizeObserver` stub in `vitest.setup.ts` depending on which components render. Add them only when an error tells you to.)

```ts
import { describe, expect, it } from 'vitest'
import TaskCard from '../TaskCard.vue'
import { mountWithVuetify } from '@/test-utils'

describe('TaskCard', () => {
  it('emits remove with the task id', async () => {
    const wrapper = mountWithVuetify(TaskCard, {
      task: { id: 'a', title: 'Hi', description: '', status: 'todo', priority: 'low', tags: [], assignee: null, createdAt: 0 },
    })
    await wrapper.find('[aria-label="Delete"]').trigger('click')
    expect(wrapper.emitted('remove')?.[0]).toEqual(['a'])
  })
})
```

That's why the buttons have `aria-label`s: accessible *and* testable.

## 3. Quality gates

```bash
npm run type-check
npm run lint
npm run test:unit -- --run
npm run build
```

All four should pass before you deploy.

## 4. Share your components

You built `BaseCard` and `TagInput` without any Sprintly-specific code. That's a good sign. Follow the lesson **Building and publishing reusable components** to move them into a `sprintly-ui` package:

1. Move both SFCs plus a `src/index.ts` exporting them.
2. Externalise `vue` and `vuetify`, emit types, ship a CSS file wrapped in `@layer sprintly-ui`.
3. `npm pack` and install the tarball back into Sprintly. Replace the local imports with the package ones.

If you don't want to publish publicly, `npm publish --dry-run` is a fine stopping point.

## 5. Deploy to Cloudflare

A static Vue app needs very little. In the project root, `wrangler.jsonc`:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "sprintly",
  "compatibility_date": "2026-11-13",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application"
  }
}
```

```bash
npm i -D wrangler
npm run build
npx wrangler deploy
```

`single-page-application` makes `/backlog` or `/team` serve `index.html` on refresh so Vue Router can take over. **Don't** add a `_redirects` catch-all as well; that causes an "infinite loop" error.

Push to GitHub and connect the repo in Cloudflare (Workers & Pages → Create → Import a repository) for deploys on every push, exactly as VueTrainer does.

## Checkpoint

- The live URL loads, deep links survive a refresh, and the dark-mode choice persists.
- Tests and build pass locally and in Cloudflare's build log.

## Exercise

1. Add a GitHub Actions workflow that runs type-check, tests and build on every pull request (see `.github/workflows/ci.yml` in VueTrainer).
2. Replace the fake API with real persistence: a Worker + D1 table like VueTrainer's `/api/progress`, or any public JSON API. Only `src/api/tasks.ts` and the store's error handling should need to change. If more changes, your layering needs work.
3. Write a short README for Sprintly: what it is, how to run it, what you learned. Future-you in January will thank you.
