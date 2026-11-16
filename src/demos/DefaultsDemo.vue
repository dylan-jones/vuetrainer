<script setup lang="ts">
import { ref } from 'vue'

const scoped = ref(true)
</script>

<template>
  <div>
    <v-switch v-model="scoped" color="primary" hide-details label="Wrap in <v-defaults-provider>" />
    <p class="text-body-2 mb-3">
      The buttons below have no props. When the provider is on, it supplies
      <code>{ VBtn: { color: 'secondary', variant: 'outlined', prependIcon: 'mdi-check' } }</code>
      to everything inside it.
    </p>

    <v-defaults-provider
      :disabled="!scoped"
      :defaults="{ VBtn: { color: 'secondary', variant: 'outlined', prependIcon: 'mdi-check' } }"
    >
      <div class="d-flex ga-2 flex-wrap">
        <v-btn>One</v-btn>
        <v-btn>Two</v-btn>
        <v-btn color="error">Own props still win</v-btn>
      </div>
    </v-defaults-provider>
  </div>
</template>
