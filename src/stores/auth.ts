import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getFirebase, isFirebaseConfigured } from '@/lib/firebase'

export interface AppUser {
  uid: string
  name: string
  email: string | null
  photoURL: string | null
}

const LOCAL_USER: AppUser = { uid: 'local', name: 'Local learner', email: null, photoURL: null }
const LOCAL_FLAG = 'vuetrainer:local-mode'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AppUser | null>(null)
  const ready = ref(false)
  const error = ref<string | null>(null)
  const busy = ref(false)

  const isLoggedIn = computed(() => user.value !== null)
  const isLocal = computed(() => user.value?.uid === LOCAL_USER.uid)
  const cloudEnabled = isFirebaseConfigured

  let initPromise: Promise<void> | undefined

  /** Resolves once we know whether someone is signed in. Safe to call repeatedly. */
  function init() {
    initPromise ??= (async () => {
      if (!isFirebaseConfigured) {
        // Without Firebase there is nothing to sign in to, so go straight to local mode.
        user.value = LOCAL_USER
        ready.value = true
        return
      }
      if (localStorage.getItem(LOCAL_FLAG)) user.value = LOCAL_USER
      const { auth, authApi } = await getFirebase()
      await new Promise<void>((resolve) => {
        authApi.onAuthStateChanged(auth, (u) => {
          if (u) {
            user.value = { uid: u.uid, name: u.displayName ?? u.email ?? 'Learner', email: u.email, photoURL: u.photoURL }
          } else if (!localStorage.getItem(LOCAL_FLAG)) {
            user.value = null
          }
          ready.value = true
          resolve()
        })
      })
    })()
    return initPromise
  }

  async function run(action: () => Promise<unknown>) {
    busy.value = true
    error.value = null
    try {
      await action()
    } catch (e) {
      error.value = friendlyError(e)
      throw e
    } finally {
      busy.value = false
    }
  }

  const signInWithGoogle = () =>
    run(async () => {
      const { auth, authApi } = await getFirebase()
      await authApi.signInWithPopup(auth, new authApi.GoogleAuthProvider())
    })

  const signInWithEmail = (email: string, password: string) =>
    run(async () => {
      const { auth, authApi } = await getFirebase()
      await authApi.signInWithEmailAndPassword(auth, email, password)
    })

  const registerWithEmail = (email: string, password: string) =>
    run(async () => {
      const { auth, authApi } = await getFirebase()
      await authApi.createUserWithEmailAndPassword(auth, email, password)
    })

  const resetPassword = (email: string) =>
    run(async () => {
      const { auth, authApi } = await getFirebase()
      await authApi.sendPasswordResetEmail(auth, email)
    })

  function continueLocally() {
    localStorage.setItem(LOCAL_FLAG, '1')
    user.value = LOCAL_USER
  }

  async function signOut() {
    localStorage.removeItem(LOCAL_FLAG)
    if (isFirebaseConfigured) {
      const { auth, authApi } = await getFirebase()
      await authApi.signOut(auth)
    }
    user.value = null
  }

  return {
    user, ready, error, busy, isLoggedIn, isLocal, cloudEnabled,
    init, signInWithGoogle, signInWithEmail, registerWithEmail, resetPassword, continueLocally, signOut,
  }
})

const MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/email-already-in-use': 'An account with that email already exists.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/invalid-email': 'That email address is not valid.',
  'auth/popup-closed-by-user': 'The Google sign-in window was closed.',
  'auth/unauthorized-domain': 'This domain is not authorised in Firebase Auth settings.',
  'auth/too-many-requests': 'Too many attempts. Try again later.',
}

function friendlyError(e: unknown): string {
  const code = (e as { code?: string })?.code
  return (code && MESSAGES[code]) || (e as Error)?.message || 'Something went wrong.'
}
