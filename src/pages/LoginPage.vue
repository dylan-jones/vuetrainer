<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const mode = ref<'signin' | 'register'>('signin')
const form = reactive({ email: '', password: '' })
const info = ref('')

const required = (v: string) => !!v || 'Required'

async function afterLogin() {
  await router.push((route.query.redirect as string) || '/')
}

async function submit() {
  info.value = ''
  try {
    if (mode.value === 'signin') await auth.signInWithEmail(form.email, form.password)
    else await auth.registerWithEmail(form.email, form.password)
    await afterLogin()
  } catch {
    // message is shown via auth.error
  }
}

async function google() {
  info.value = ''
  try {
    await auth.signInWithGoogle()
    await afterLogin()
  } catch {
    // message is shown via auth.error
  }
}

async function reset() {
  if (!form.email) {
    auth.error = 'Enter your email first, then press "Forgot password".'
    return
  }
  try {
    await auth.resetPassword(form.email)
    info.value = 'Password reset email sent.'
  } catch {
    // message is shown via auth.error
  }
}

async function local() {
  auth.continueLocally()
  await afterLogin()
}
</script>

<template>
  <v-container class="fill-height" style="max-inline-size: 28rem">
    <v-card class="pa-6 w-100">
      <div class="text-center mb-4">
        <v-icon icon="mdi-vuejs" color="primary" size="48" />
        <h1 class="text-h5 mt-2">VueTrainer</h1>
        <p class="text-medium-emphasis">Track your Vue.js learning</p>
      </div>

      <v-btn block size="large" color="primary" prepend-icon="mdi-google" :loading="auth.busy" @click="google">
        Continue with Google
      </v-btn>

      <v-divider class="my-4" />

      <v-tabs v-model="mode" grow class="mb-4">
        <v-tab value="signin">Sign in</v-tab>
        <v-tab value="register">Create account</v-tab>
      </v-tabs>

      <v-form @submit.prevent="submit">
        <v-text-field v-model="form.email" label="Email" type="email" autocomplete="email" :rules="[required]" />
        <v-text-field
          v-model="form.password"
          label="Password"
          type="password"
          :autocomplete="mode === 'signin' ? 'current-password' : 'new-password'"
          :rules="[required]"
        />
        <v-alert v-if="auth.error" type="error" variant="tonal" class="mb-3" :text="auth.error" />
        <v-alert v-if="info" type="success" variant="tonal" class="mb-3" :text="info" />
        <v-btn block type="submit" color="secondary" :loading="auth.busy">
          {{ mode === 'signin' ? 'Sign in' : 'Create account' }}
        </v-btn>
        <v-btn v-if="mode === 'signin'" block variant="text" class="mt-1" @click="reset">Forgot password</v-btn>
      </v-form>

      <v-divider class="my-4" />
      <v-btn block variant="tonal" prepend-icon="mdi-content-save-outline" @click="local">
        Continue without an account (this browser only)
      </v-btn>
    </v-card>
  </v-container>
</template>
