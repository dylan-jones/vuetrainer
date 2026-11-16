import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { isFirebaseConfigured } from '@/lib/firebase'
import { fetchProgress, saveProgress } from '@/lib/api'
import { lessons } from '@/content/lessons'
import {
  emptyProgress, itemKey, lessonCounts, mergeProgress, percent, sumCounts, type ProgressData,
} from '@/lib/progress'
import { useAuthStore } from './auth'

const storageKey = (uid: string) => `vuetrainer:progress:${uid}`

function readLocal(uid: string): ProgressData {
  try {
    const raw = localStorage.getItem(storageKey(uid))
    return raw ? { ...emptyProgress(), ...JSON.parse(raw) } : emptyProgress()
  } catch {
    return emptyProgress()
  }
}

export const useProgressStore = defineStore('progress', () => {
  const auth = useAuthStore()
  const data = ref<ProgressData>(emptyProgress())
  const syncState = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const loaded = ref(false)

  const done = computed(() => data.value.done)
  const overall = computed(() => sumCounts(lessons, done.value))
  const overallPercent = computed(() => percent(overall.value))

  const isChecked = (lessonId: string, index: number) => Boolean(done.value[itemKey(lessonId, index)])
  const lessonPercent = (lessonId: string) => {
    const lesson = lessons.find((l) => l.id === lessonId)
    return lesson ? percent(lessonCounts(lesson, done.value)) : 0
  }
  const notesFor = (lessonId: string) => data.value.notes[lessonId] ?? ''

  function toggle(lessonId: string, index: number, value: boolean) {
    const key = itemKey(lessonId, index)
    const next = { ...data.value.done }
    if (value) next[key] = true
    else delete next[key]
    data.value = { ...data.value, done: next, updatedAt: Date.now() }
  }

  function setNotes(lessonId: string, text: string) {
    data.value = { ...data.value, notes: { ...data.value.notes, [lessonId]: text }, updatedAt: Date.now() }
  }

  async function load() {
    const uid = auth.user?.uid
    loaded.value = false
    if (!uid) {
      data.value = emptyProgress()
      return
    }
    let current = readLocal(uid)
    if (isFirebaseConfigured && !auth.isLocal) {
      try {
        const remote = await fetchProgress()
        if (remote) current = mergeProgress(current, { ...emptyProgress(), ...remote })
        syncState.value = 'saved'
      } catch {
        syncState.value = 'error'
      }
    }
    data.value = current
    loaded.value = true
  }

  let timer: ReturnType<typeof setTimeout> | undefined
  async function persist() {
    const uid = auth.user?.uid
    if (!uid) return
    localStorage.setItem(storageKey(uid), JSON.stringify(data.value))
    if (!isFirebaseConfigured || auth.isLocal) return
    syncState.value = 'saving'
    try {
      await saveProgress(data.value)
      syncState.value = 'saved'
    } catch {
      syncState.value = 'error'
    }
  }

  // Debounced so typing notes doesn't write on every keystroke.
  watch(data, () => {
    if (!loaded.value) return
    clearTimeout(timer)
    timer = setTimeout(persist, 600)
  })

  watch(() => auth.user?.uid, load, { immediate: true })

  return { data, syncState, overall, overallPercent, isChecked, lessonPercent, notesFor, toggle, setNotes, load }
})
