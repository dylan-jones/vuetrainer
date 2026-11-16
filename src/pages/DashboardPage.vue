<script setup lang="ts">
import { computed } from 'vue'
import { START_DATE } from '@/config'
import { lessons, lessonsForTrack } from '@/content/lessons'
import { tracks } from '@/content/tracks'
import { daysUntil, lessonCounts, percent, sumCounts } from '@/lib/progress'
import { useAuthStore } from '@/stores/auth'
import { useProgressStore } from '@/stores/progress'
import ProgressRing from '@/components/ProgressRing.vue'

const auth = useAuthStore()
const progress = useProgressStore()

const greeting = computed(() => (auth.isLocal ? 'Welcome back' : `Hi ${auth.user?.name?.split(' ')[0]}`))

const days = computed(() => daysUntil(START_DATE))

const trackStats = computed(() =>
  tracks.map((t) => {
    const list = lessonsForTrack(t.id)
    const counts = sumCounts(list, progress.data.done)
    return { track: t, lessons: list.length, counts, pct: percent(counts) }
  }),
)

const nextLesson = computed(() =>
  lessons.find((l) => {
    const c = lessonCounts(l, progress.data.done)
    return c.done < c.total
  }),
)

const remainingMinutes = computed(() =>
  lessons.reduce((sum, l) => {
    const c = lessonCounts(l, progress.data.done)
    return sum + (c.total ? l.minutes * (1 - c.done / c.total) : 0)
  }, 0),
)

const minutesPerDay = computed(() => (days.value > 0 ? Math.ceil(remainingMinutes.value / days.value) : 0))
</script>

<template>
  <v-container style="max-inline-size: var(--app-content-width)">
    <h1 class="text-h4 mb-1">{{ greeting }} 👋</h1>
    <p class="text-medium-emphasis mb-6">Your Vue.js learning plan for the new job.</p>

    <!-- Auto-fit grid: cards wrap by available width, no media queries needed -->
    <div class="stats">
      <v-card class="pa-4 d-flex align-center ga-4">
        <ProgressRing :value="progress.overallPercent" :size="72" />
        <div>
          <div class="text-subtitle-1 font-weight-medium">Overall progress</div>
          <div class="text-medium-emphasis">{{ progress.overall.done }} / {{ progress.overall.total }} checklist items</div>
        </div>
      </v-card>
      <v-card class="pa-4">
        <div class="text-h4">{{ days }}</div>
        <div class="text-medium-emphasis">days until you start</div>
      </v-card>
      <v-card class="pa-4">
        <div class="text-h4">{{ minutesPerDay }} min</div>
        <div class="text-medium-emphasis">per day to finish in time</div>
      </v-card>
    </div>

    <v-card v-if="nextLesson" class="mt-6 pa-4 d-flex flex-wrap align-center ga-4" color="primary" variant="tonal">
      <div class="flex-grow-1">
        <div class="text-overline">Up next</div>
        <div class="text-h6">{{ nextLesson.title }}</div>
        <div>{{ nextLesson.summary }}</div>
      </div>
      <v-btn color="primary" :to="{ name: 'lesson', params: { lessonId: nextLesson.id } }" append-icon="mdi-arrow-right">
        {{ progress.lessonPercent(nextLesson.id) > 0 ? 'Continue' : 'Start' }}
      </v-btn>
    </v-card>
    <v-alert v-else type="success" class="mt-6" text="Everything is complete. You're ready for January! 🎉" />

    <h2 class="text-h5 mt-8 mb-3">Tracks</h2>
    <div class="tracks">
      <v-card v-for="s in trackStats" :key="s.track.id" :to="{ name: 'track', params: { trackId: s.track.id } }">
        <v-card-item :prepend-icon="s.track.icon" :title="s.track.title" :subtitle="`${s.lessons} lesson${s.lessons === 1 ? '' : 's'}`" />
        <v-card-text>
          <p class="mb-3">{{ s.track.description }}</p>
          <v-progress-linear :model-value="s.pct" color="primary" />
          <div class="text-caption mt-1">{{ s.counts.done }} / {{ s.counts.total }} · {{ s.pct }}%</div>
        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: var(--app-gap);
}
.tracks {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
  gap: var(--app-gap);
}
</style>
