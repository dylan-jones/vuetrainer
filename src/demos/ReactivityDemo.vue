<script setup lang="ts">
import { computed, ref, watch } from 'vue'

// A composable: reusable stateful logic, the Vue 3 alternative to mixins.
function useCounter(initial = 0, step = 1) {
  const count = ref(initial)
  const double = computed(() => count.value * 2)
  const inc = () => (count.value += step)
  const reset = () => (count.value = initial)
  return { count, double, inc, reset }
}

const { count, double, inc, reset } = useCounter(0, 2)
const log = ref<string[]>([])

watch(count, (now, before) => log.value.unshift(`count: ${before} → ${now}`))
</script>

<template>
  <div>
    <div class="d-flex align-center ga-3 flex-wrap mb-3">
      <v-btn color="primary" @click="inc">+2</v-btn>
      <v-btn variant="outlined" @click="reset">Reset</v-btn>
      <span>count = <strong>{{ count }}</strong>, double (computed) = <strong>{{ double }}</strong></span>
    </div>
    <v-sheet border rounded class="pa-2 text-caption" min-height="64">
      <div v-if="!log.length" class="text-medium-emphasis">watch() log appears here</div>
      <div v-for="(line, i) in log.slice(0, 5)" :key="i">{{ line }}</div>
    </v-sheet>
  </div>
</template>
