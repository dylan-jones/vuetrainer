<script setup lang="ts">
import { ref } from 'vue'
import RatingInput from './RatingInput.vue'

const stars = ref(3)
const title = ref('vue')
</script>

<template>
  <div>
    <RatingInput v-model="stars" v-model:label.capitalize="title" />
    <v-sheet border rounded class="pa-3 mt-3 text-body-2">
      Parent state: <code>stars = {{ stars }}</code>, <code>title = "{{ title }}"</code>
      <div class="text-caption mt-1">Type lowercase text: the <code>.capitalize</code> modifier is applied by the child's setter.</div>
    </v-sheet>
  </div>
</template>
