import { describe, expect, it } from 'vitest'
import {
  checklistFor, daysUntil, emptyProgress, itemKey, lessonCounts, mergeProgress, percent, sumCounts,
} from '@/lib/progress'
import type { Lesson } from '@/content/types'

const lesson = (id: string, objectives: string[], exercise = 'x'): Lesson => ({
  id, track: 't', order: 1, title: id, summary: '', minutes: 10, objectives, resources: [], body: '', exercise,
})

describe('progress', () => {
  it('adds an exercise item only when the lesson has an exercise', () => {
    expect(checklistFor(lesson('a', ['one']))).toHaveLength(2)
    expect(checklistFor(lesson('a', ['one'], ''))).toHaveLength(1)
  })

  it('counts and sums checked items', () => {
    const a = lesson('a', ['1', '2'])
    const b = lesson('b', ['1'], '')
    const done = { [itemKey('a', 0)]: true as const, [itemKey('b', 0)]: true as const }
    expect(lessonCounts(a, done)).toEqual({ done: 1, total: 3 })
    expect(sumCounts([a, b], done)).toEqual({ done: 2, total: 4 })
    expect(percent({ done: 2, total: 4 })).toBe(50)
    expect(percent({ done: 0, total: 0 })).toBe(0)
  })

  it('merges by unioning checkmarks and preferring newer notes', () => {
    const older = { ...emptyProgress(), done: { 'a#0': true as const }, notes: { a: 'old', b: 'keep' }, updatedAt: 1 }
    const newer = { ...emptyProgress(), done: { 'a#1': true as const }, notes: { a: 'new' }, updatedAt: 2 }
    const merged = mergeProgress(newer, older)
    expect(merged.done).toEqual({ 'a#0': true, 'a#1': true })
    expect(merged.notes).toEqual({ a: 'new', b: 'keep' })
    expect(merged.updatedAt).toBe(2)
  })

  it('never reports negative days until start', () => {
    const now = new Date('2026-12-01T00:00:00')
    expect(daysUntil(new Date('2026-12-11T00:00:00'), now)).toBe(10)
    expect(daysUntil(new Date('2026-11-01T00:00:00'), now)).toBe(0)
  })
})
