import type { FirebaseApp } from 'firebase/app'

const env = import.meta.env

const config = {
  apiKey: env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: env.VITE_FIREBASE_APP_ID as string | undefined,
}

/** When false the app runs in local-only mode and Firebase is never downloaded. */
export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId)

let app: FirebaseApp | undefined

// Firebase is imported dynamically so local-only mode doesn't ship it.
export async function getFirebase() {
  const [{ initializeApp }, auth] = await Promise.all([import('firebase/app'), import('firebase/auth')])
  app ??= initializeApp(config)
  return { auth: auth.getAuth(app), authApi: auth }
}
