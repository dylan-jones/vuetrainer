<script setup lang="ts">
import { computed, useSlots } from 'vue'

defineProps<{ items: { id: number; label: string; done: boolean }[] }>()

const slots = useSlots()
// The grid layout adapts to whichever slots the parent actually provided.
const layout = computed(() => ({
  'has-aside': !!slots.aside,
  'has-header': !!slots.header,
  'has-footer': !!slots.footer,
}))
</script>

<template>
  <section class="fc" :class="layout">
    <header v-if="$slots.header" class="fc-header"><slot name="header" /></header>

    <div class="fc-main">
      <!-- Scoped slot with fallback content: parent decides how each item renders -->
      <ul class="fc-list">
        <li v-for="(item, index) in items" :key="item.id">
          <slot name="item" :item="item" :index="index">{{ item.label }}</slot>
        </li>
      </ul>
      <slot />
    </div>

    <aside v-if="$slots.aside" class="fc-aside"><slot name="aside" /></aside>
    <footer v-if="$slots.footer" class="fc-footer"><slot name="footer" :count="items.length" /></footer>
  </section>
</template>

<style scoped>
.fc {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: 1fr;
  grid-template-areas: 'main';
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  padding: 1rem;
}
.fc.has-header { grid-template-areas: 'header' 'main'; }
.fc.has-footer { grid-template-areas: 'main' 'footer'; }
.fc.has-header.has-footer { grid-template-areas: 'header' 'main' 'footer'; }
.fc.has-aside { grid-template-columns: 1fr 10rem; grid-template-areas: 'main aside'; }
.fc.has-aside.has-header { grid-template-areas: 'header header' 'main aside'; }
.fc.has-aside.has-footer { grid-template-areas: 'main aside' 'footer footer'; }
.fc.has-aside.has-header.has-footer { grid-template-areas: 'header header' 'main aside' 'footer footer'; }

.fc-header { grid-area: header; font-weight: 600; }
.fc-main { grid-area: main; }
.fc-aside { grid-area: aside; background: rgba(var(--v-theme-primary), 0.1); padding: 0.5rem; border-radius: 6px; }
.fc-footer { grid-area: footer; font-size: 0.85rem; opacity: 0.8; }
.fc-list { list-style: none; padding: 0; margin: 0 0 0.5rem; }
</style>
