<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { useAuthStore } from '@/stores/auth'
import { useProgressStore } from '@/stores/progress'

const auth = useAuthStore()
const progress = useProgressStore()
const router = useRouter()
const theme = useTheme()

const syncIcon = computed(() => {
  if (auth.isLocal) return { icon: 'mdi-content-save-outline', tip: 'Saved in this browser only' }
  return {
    idle: { icon: 'mdi-cloud-outline', tip: 'Cloud sync' },
    saving: { icon: 'mdi-cloud-sync-outline', tip: 'Saving…' },
    saved: { icon: 'mdi-cloud-check-outline', tip: 'Saved to the cloud' },
    error: { icon: 'mdi-cloud-alert-outline', tip: 'Could not sync — saved locally' },
  }[progress.syncState]
})

function toggleTheme() {
  theme.change(theme.current.value.dark ? 'light' : 'dark')
}

async function logout() {
  await auth.signOut()
  router.push({ name: 'login' })
}
</script>

<template>
  <v-app>
    <v-app-bar v-if="auth.isLoggedIn" flat border>
      <v-app-bar-title>
        <router-link to="/" class="text-decoration-none d-inline-flex align-center ga-2 text-high-emphasis">
          <v-icon icon="mdi-vuejs" color="primary" /> VueTrainer
        </router-link>
      </v-app-bar-title>
      <v-tooltip :text="syncIcon.tip" location="bottom">
        <template #activator="{ props }">
          <v-icon v-bind="props" :icon="syncIcon.icon" class="mr-2" />
        </template>
      </v-tooltip>
      <v-btn icon="mdi-theme-light-dark" variant="text" aria-label="Toggle theme" @click="toggleTheme" />
      <v-menu>
        <template #activator="{ props }">
          <v-btn v-bind="props" variant="text" prepend-icon="mdi-account-circle">{{ auth.user?.name }}</v-btn>
        </template>
        <v-list>
          <v-list-item prepend-icon="mdi-logout" :title="auth.isLocal ? 'Exit local mode' : 'Sign out'" @click="logout" />
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
