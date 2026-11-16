<script setup lang="ts">
import { reactive } from 'vue'
import FlexibleCard from './FlexibleCard.vue'

const show = reactive({ header: true, aside: true, footer: true, customItem: true })
const items = reactive([
  { id: 1, label: 'Read the slots guide', done: true },
  { id: 2, label: 'Build a scoped slot', done: false },
  { id: 3, label: 'Combine slots with grid', done: false },
])
</script>

<template>
  <div>
    <div class="d-flex flex-wrap ga-4 mb-3">
      <v-checkbox v-model="show.header" label="header slot" hide-details density="compact" />
      <v-checkbox v-model="show.aside" label="aside slot" hide-details density="compact" />
      <v-checkbox v-model="show.footer" label="footer slot" hide-details density="compact" />
      <v-checkbox v-model="show.customItem" label="scoped item slot" hide-details density="compact" />
    </div>

    <FlexibleCard :items="items">
      <template v-if="show.header" #header>Today's tasks</template>

      <template v-if="show.customItem" #item="{ item, index }">
        <v-checkbox-btn v-model="item.done" :label="`${index + 1}. ${item.label}`" density="compact" />
      </template>

      <template v-if="show.aside" #aside>Aside content changes the grid to two columns.</template>

      <template v-if="show.footer" #footer="{ count }">{{ count }} tasks</template>
    </FlexibleCard>
  </div>
</template>
