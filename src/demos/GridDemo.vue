<script setup lang="ts">
import { ref } from 'vue'

const mode = ref<'areas' | 'autofit' | 'subgrid'>('areas')
const cards = [
  { title: 'Short', text: 'One line.' },
  { title: 'Medium card', text: 'A little more text here so the card is taller than its neighbours.' },
  { title: 'Long', text: 'Much more text. '.repeat(8) },
]
</script>

<template>
  <div>
    <v-btn-toggle v-model="mode" mandatory color="primary" variant="outlined" divided class="mb-4">
      <v-btn value="areas">Named areas</v-btn>
      <v-btn value="autofit">auto-fit + minmax</v-btn>
      <v-btn value="subgrid">Subgrid</v-btn>
    </v-btn-toggle>

    <div v-if="mode === 'areas'" class="g-areas">
      <div class="g-header">header</div>
      <div class="g-nav">nav</div>
      <div class="g-main">main</div>
      <div class="g-aside">aside</div>
      <div class="g-footer">footer</div>
    </div>

    <div v-else-if="mode === 'autofit'" class="g-autofit">
      <div v-for="n in 7" :key="n" class="g-cell">{{ n }}</div>
    </div>

    <div v-else class="g-subgrid">
      <article v-for="c in cards" :key="c.title" class="g-card">
        <h4>{{ c.title }}</h4>
        <p>{{ c.text }}</p>
        <button>Action</button>
      </article>
    </div>
    <p class="text-caption mt-2">Resize the window to see how each layout responds.</p>
  </div>
</template>

<style scoped>
div[class^='g-'] > *, .g-card, .g-cell {
  padding: 0.75rem;
  border-radius: 6px;
  background: rgba(var(--v-theme-primary), 0.15);
  border: 1px solid rgba(var(--v-theme-primary), 0.4);
}

.g-areas {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: 8rem 1fr 8rem;
  grid-template-rows: auto minmax(8rem, auto) auto;
  grid-template-areas:
    'header header header'
    'nav    main   aside'
    'footer footer footer';
}
.g-header { grid-area: header; }
.g-nav { grid-area: nav; }
.g-main { grid-area: main; }
.g-aside { grid-area: aside; }
.g-footer { grid-area: footer; }
@media (max-width: 40rem) {
  .g-areas {
    grid-template-columns: 1fr;
    grid-template-areas: 'header' 'main' 'nav' 'aside' 'footer';
  }
}

.g-autofit {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(auto-fit, minmax(min(8rem, 100%), 1fr));
}

/* Each card spans 3 rows of the parent grid so titles, bodies and buttons line up across cards. */
.g-subgrid {
  display: grid;
  gap: 0.5rem 1rem;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
}
.g-card {
  display: grid;
  grid-row: span 3;
  grid-template-rows: subgrid;
  gap: 0.5rem;
}
.g-card h4, .g-card p { margin: 0; }
.g-card button {
  align-self: end;
  justify-self: start;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}
</style>
