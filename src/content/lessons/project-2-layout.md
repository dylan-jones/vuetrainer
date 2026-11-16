---
title: Sprintly 2 — App shell and routing
track: project
order: 2
minutes: 60
summary: Build the navigation, layout and routes, with a CSS Grid page layout.
objectives:
  - Created Board, Backlog, Team and Settings views and routes
  - Built a v-app-bar and v-navigation-drawer layout
  - Navigation items use router links and highlight the active route
  - The board page uses a named-area CSS Grid
  - Unknown URLs redirect to the board
resources:
  - Vue Router guide | https://router.vuejs.org/guide/
  - Vuetify app layout | https://vuetifyjs.com/en/components/application/
  - MDN grid-template-areas | https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-areas
---

## Routes

Create four views in `src/views/`: `BoardView.vue`, `BacklogView.vue`, `TeamView.vue`, `SettingsView.vue`. Each can start as a heading.

`src/router/index.ts`:

```ts
import { createRouter, createWebHistory } from 'vue-router'

export const navItems = [
  { title: 'Board', icon: 'mdi-view-column', to: '/board' },
  { title: 'Backlog', icon: 'mdi-format-list-bulleted', to: '/backlog' },
  { title: 'Team', icon: 'mdi-account-group', to: '/team' },
  { title: 'Settings', icon: 'mdi-cog', to: '/settings' },
]

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/board' },
    { path: '/board', component: () => import('@/views/BoardView.vue') },
    { path: '/backlog', component: () => import('@/views/BacklogView.vue') },
    { path: '/team', component: () => import('@/views/TeamView.vue') },
    { path: '/settings', component: () => import('@/views/SettingsView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/board' },
  ],
})
```

Defining `navItems` next to the routes keeps one source of truth. The `() => import()` form lazy-loads each view.

## The shell

`App.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useDisplay } from 'vuetify'
import { navItems } from '@/router'

const { mdAndUp } = useDisplay()
const drawer = ref(true)
</script>

<template>
  <v-app>
    <v-app-bar flat border>
      <v-app-bar-nav-icon v-if="!mdAndUp" @click="drawer = !drawer" />
      <v-app-bar-title>Sprintly</v-app-bar-title>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" :permanent="mdAndUp">
      <v-list nav>
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
        />
      </v-list>
    </v-navigation-drawer>

    <v-main><router-view /></v-main>
  </v-app>
</template>
```

Things to notice:

- `v-list-item` with `:to` renders a router link and gets the active style automatically.
- `useDisplay()` is Vuetify's reactive breakpoints. `mdAndUp` is a boolean ref.
- `v-app`, `v-app-bar`, `v-navigation-drawer` and `v-main` cooperate: `v-main` pads itself for the bars. You don't write any layout CSS for the shell.

## A grid page layout

The board page will have a toolbar, a stats strip, the columns and a side panel. Use named areas in `BoardView.vue`:

```vue
<template>
  <div class="board-page pa-4">
    <header class="toolbar">Toolbar (search + filters)</header>
    <section class="stats">Stats</section>
    <section class="columns">Columns</section>
    <aside class="activity">Activity</aside>
  </div>
</template>

<style scoped>
.board-page {
  display: grid;
  gap: var(--app-gap, 1rem);
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas: 'toolbar' 'stats' 'columns' 'activity';
}
.toolbar { grid-area: toolbar; }
.stats { grid-area: stats; }
.columns { grid-area: columns; }
.activity { grid-area: activity; }

@media (min-width: 70rem) {
  .board-page {
    grid-template-columns: minmax(0, 1fr) 18rem;
    grid-template-areas:
      'toolbar toolbar'
      'stats   stats'
      'columns activity';
  }
}
</style>
```

`minmax(0, 1fr)` stops wide content (like the board) from stretching the grid.

## Checkpoint

- Clicking nav items changes the URL and the page, and highlights the active item.
- Resize the window: under `md` the drawer becomes a hamburger menu; above 70rem the activity panel moves beside the columns.
- Visiting `/nonsense` lands on `/board`.

## Exercise

1. Add a `meta: { title: 'Board' }` to each route and show the current title in the app bar using `useRoute()`.
2. Add a `v-navigation-drawer` `rail` mode toggled by a button.
3. Make the activity panel sticky on wide screens (`position: sticky; top: ...`).
