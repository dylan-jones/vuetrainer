<script setup lang="ts">
import { computed, defineAsyncComponent, type Component } from 'vue'
import { getLesson, getTrack, lessonsForTrack } from '@/content/lessons'
import { checklistFor } from '@/lib/progress'
import { useProgressStore } from '@/stores/progress'
import MarkdownView from '@/components/MarkdownView.vue'
import { demos } from '@/demos'

const props = defineProps<{ lessonId: string }>()
const progress = useProgressStore()

const lesson = computed(() => getLesson(props.lessonId))
const track = computed(() => (lesson.value ? getTrack(lesson.value.track) : undefined))
const items = computed(() => (lesson.value ? checklistFor(lesson.value) : []))

const siblings = computed(() => (lesson.value ? lessonsForTrack(lesson.value.track) : []))
const index = computed(() => siblings.value.findIndex((l) => l.id === props.lessonId))
const prev = computed(() => siblings.value[index.value - 1])
const next = computed(() => siblings.value[index.value + 1])

const demo = computed<Component | undefined>(() => {
  const loader = lesson.value?.demo && demos[lesson.value.demo]
  return loader ? defineAsyncComponent(loader) : undefined
})

const notes = computed({
  get: () => progress.notesFor(props.lessonId),
  set: (v: string) => progress.setNotes(props.lessonId, v),
})
</script>

<template>
  <v-container v-if="lesson" style="max-inline-size: var(--app-content-width)">
    <v-breadcrumbs
      class="px-0"
      :items="[
        { title: 'Dashboard', to: '/' },
        { title: track?.title ?? '', to: { name: 'track', params: { trackId: lesson.track } } },
        { title: lesson.title },
      ]"
    />

    <div class="layout">
      <article>
        <h1 class="text-h4 mb-1">{{ lesson.title }}</h1>
        <p class="text-medium-emphasis mb-6">~{{ lesson.minutes }} min · {{ lesson.summary }}</p>

        <MarkdownView :source="lesson.body" />

        <section v-if="demo" class="mt-8">
          <h2 class="text-h5 mb-3">Live demo</h2>
          <v-card class="pa-4"><component :is="demo" /></v-card>
        </section>

        <section v-if="lesson.exercise" class="mt-8">
          <h2 class="text-h5 mb-3">Exercise</h2>
          <v-card class="pa-4" color="primary" variant="tonal"><MarkdownView :source="lesson.exercise" /></v-card>
        </section>
      </article>

      <aside class="sidebar">
        <v-card class="pa-4">
          <div class="d-flex align-center justify-space-between mb-2">
            <h2 class="text-subtitle-1 font-weight-bold">Checklist</h2>
            <v-chip>{{ progress.lessonPercent(lesson.id) }}%</v-chip>
          </div>
          <v-progress-linear :model-value="progress.lessonPercent(lesson.id)" color="primary" class="mb-2" />
          <v-checkbox
            v-for="(label, i) in items"
            :key="i"
            :model-value="progress.isChecked(lesson.id, i)"
            :label="label"
            density="compact"
            hide-details
            color="primary"
            @update:model-value="progress.toggle(lesson.id, i, !!$event)"
          />
        </v-card>

        <v-card class="pa-4">
          <h2 class="text-subtitle-1 font-weight-bold mb-2">My notes</h2>
          <v-textarea v-model="notes" rows="5" auto-grow hide-details placeholder="What clicked? What's still fuzzy?" />
        </v-card>

        <v-card v-if="lesson.resources.length" class="pa-4">
          <h2 class="text-subtitle-1 font-weight-bold mb-2">Resources</h2>
          <v-list density="compact" class="pa-0">
            <v-list-item
              v-for="r in lesson.resources"
              :key="r.url"
              :href="r.url"
              target="_blank"
              rel="noopener noreferrer"
              :title="r.title"
              prepend-icon="mdi-open-in-new"
            />
          </v-list>
        </v-card>

        <div class="d-flex justify-space-between ga-2">
          <v-btn v-if="prev" variant="tonal" prepend-icon="mdi-arrow-left" :to="{ name: 'lesson', params: { lessonId: prev.id } }">Prev</v-btn>
          <v-spacer />
          <v-btn v-if="next" variant="tonal" append-icon="mdi-arrow-right" :to="{ name: 'lesson', params: { lessonId: next.id } }">Next</v-btn>
        </div>
      </aside>
    </div>
  </v-container>
  <v-container v-else>
    <v-alert type="warning" text="Lesson not found." />
  </v-container>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2rem;
}
.sidebar {
  display: grid;
  gap: var(--app-gap);
  align-content: start;
}
@media (min-width: 64rem) {
  .layout {
    grid-template-columns: minmax(0, 1fr) 20rem;
  }
  .sidebar {
    position: sticky;
    top: 5rem;
  }
}
</style>
