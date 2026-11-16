<script setup lang="ts">
import { computed } from 'vue'
import { getTrack, lessonsForTrack } from '@/content/lessons'
import { useProgressStore } from '@/stores/progress'

const props = defineProps<{ trackId: string }>()
const progress = useProgressStore()

const track = computed(() => getTrack(props.trackId))
const list = computed(() => lessonsForTrack(props.trackId))
</script>

<template>
  <v-container style="max-inline-size: var(--app-content-width)">
    <v-breadcrumbs :items="[{ title: 'Dashboard', to: '/' }, { title: track?.title ?? 'Unknown track' }]" class="px-0" />
    <template v-if="track">
      <h1 class="text-h4 mb-1"><v-icon :icon="track.icon" color="primary" /> {{ track.title }}</h1>
      <p class="text-medium-emphasis mb-6">{{ track.description }}</p>

      <v-list lines="two" border rounded="lg">
        <v-list-item
          v-for="lesson in list"
          :key="lesson.id"
          :to="{ name: 'lesson', params: { lessonId: lesson.id } }"
          :title="lesson.title"
          :subtitle="lesson.summary"
        >
          <template #prepend>
            <v-icon
              :icon="progress.lessonPercent(lesson.id) === 100 ? 'mdi-check-circle' : 'mdi-circle-outline'"
              :color="progress.lessonPercent(lesson.id) === 100 ? 'primary' : undefined"
            />
          </template>
          <template #append>
            <span class="text-caption mr-3">~{{ lesson.minutes }} min</span>
            <v-chip>{{ progress.lessonPercent(lesson.id) }}%</v-chip>
          </template>
        </v-list-item>
      </v-list>
    </template>
  </v-container>
</template>
