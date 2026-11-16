<script setup lang="ts">
// The default model: parent uses v-model="x"
const rating = defineModel<number>({ default: 0 })

// A named model with modifier support: parent uses v-model:label.capitalize="y"
const [label, modifiers] = defineModel<string, 'capitalize'>('label', {
  default: '',
  set(value) {
    if (modifiers.capitalize && value) return value.charAt(0).toUpperCase() + value.slice(1)
    return value
  },
})
</script>

<template>
  <div class="d-flex align-center ga-2 flex-wrap">
    <v-text-field v-model="label" label="Label" hide-details style="max-inline-size: 14rem" />
    <v-btn
      v-for="n in 5"
      :key="n"
      :icon="n <= rating ? 'mdi-star' : 'mdi-star-outline'"
      variant="text"
      :color="n <= rating ? 'warning' : undefined"
      :aria-label="`${n} stars`"
      @click="rating = n"
    />
  </div>
</template>
