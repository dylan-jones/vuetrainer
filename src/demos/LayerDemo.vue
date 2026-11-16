<script setup lang="ts">
import { ref } from 'vue'

const unlayered = ref(false)
const important = ref(false)
</script>

<template>
  <div>
    <p class="mb-3">
      Both rules below target the same element. The layer-order statement is
      <code>@layer demo-low, demo-high;</code>. The low layer uses a very specific selector (an id plus a
      class), the high layer a plain class.
    </p>
    <v-switch v-model="unlayered" label="Add an UNLAYERED rule (always beats layered rules)" hide-details color="primary" />
    <v-switch v-model="important" label="Add !important in the low layer (reverses the order!)" hide-details color="primary" />

    <div id="layer-demo" class="mt-4">
      <div
        class="layer-box"
        :class="{ 'is-unlayered': unlayered, 'is-important': important }"
      >
        <template v-if="important">Low layer wins: !important flips layer priority</template>
        <template v-else-if="unlayered">Unlayered wins over every layer</template>
        <template v-else>High layer wins despite lower specificity</template>
      </div>
    </div>
  </div>
</template>

<style>
@layer demo-low, demo-high;

@layer demo-low {
  #layer-demo .layer-box {
    background: #c62828; /* high specificity, but low layer */
    color: white;
  }
  #layer-demo .layer-box.is-important {
    background: #6a1b9a !important;
  }
}

@layer demo-high {
  .layer-box {
    background: #2e7d32; /* low specificity, but later layer */
    color: white;
    padding: 1.5rem;
    border-radius: 8px;
    text-align: center;
    font-weight: 600;
  }
}

/* No @layer: beats every layered rule (without !important) */
.layer-box.is-unlayered {
  background: #1565c0;
}
</style>
