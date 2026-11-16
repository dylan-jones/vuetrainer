<script setup lang="ts">
defineProps<{ value: number; size?: number }>()
</script>

<template>
  <v-progress-circular :model-value="value" :size="size ?? 56" :width="6" color="primary">
    <span class="text-caption font-weight-bold">{{ value }}%</span>
  </v-progress-circular>
</template>
