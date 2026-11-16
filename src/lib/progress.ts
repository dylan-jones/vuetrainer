import type { Lesson } from '@/content/types'

export type DoneMap = Record<string, true>

export interface ProgressData {
  done: DoneMap
  notes: Record<string, string>
  updatedAt: number
}

export const emptyProgress = (): ProgressData => ({ done: {}, notes: {}, updatedAt: 0 })

export const EXERCISE_LABEL = 'I completed the exercise'

/** Checklist for a lesson: its objectives, plus the exercise when it has one. */
export function checklistFor(lesson: Pick<Lesson, 'objectives' | 'exercise'>): string[] {
  return lesson.exercise ? [...lesson.objectives, EXERCISE_LABEL] : [...lesson.objectives]
}

export const itemKey = (lessonId: string, index: number) => `${lessonId}#${index}`

export interface Counts {
  done: number
  total: number
}

export function lessonCounts(lesson: Lesson, done: DoneMap): Counts {
  const items = checklistFor(lesson)
  return {
    total: items.length,
    done: items.filter((_, i) => done[itemKey(lesson.id, i)]).length,
  }
}

export function sumCounts(lessons: Lesson[], done: DoneMap): Counts {
  return lessons.reduce<Counts>(
    (acc, l) => {
      const c = lessonCounts(l, done)
      return { done: acc.done + c.done, total: acc.total + c.total }
    },
    { done: 0, total: 0 },
  )
}

export const percent = ({ done, total }: Counts) => (total === 0 ? 0 : Math.round((done / total) * 100))

/** Merge two progress snapshots: checkmarks are unioned, notes come from the newer snapshot. */
export function mergeProgress(a: ProgressData, b: ProgressData): ProgressData {
  const [older, newer] = a.updatedAt <= b.updatedAt ? [a, b] : [b, a]
  return {
    done: { ...older.done, ...newer.done },
    notes: { ...older.notes, ...newer.notes },
    updatedAt: Math.max(a.updatedAt, b.updatedAt),
  }
}

/** Days until the target date (never negative). */
export function daysUntil(target: Date, now = new Date()): number {
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86_400_000))
}
