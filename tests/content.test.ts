import { describe, expect, it } from 'vitest'
import { demos } from '@/demos'
import { parseFrontmatter, splitExercise } from '@/content/frontmatter'
import { lessons } from '@/content/lessons'
import { tracks } from '@/content/tracks'

describe('frontmatter', () => {
  it('parses scalars and lists, keeping colons in values', () => {
    const { data, content } = parseFrontmatter('---\ntitle: A: B\nitems:\n  - one\n  - two\n---\nbody')
    expect(data).toEqual({ title: 'A: B', items: ['one', 'two'] })
    expect(content).toBe('body')
  })

  it('splits the exercise section off the body', () => {
    const { body, exercise } = splitExercise('intro\n\n## Exercise\n\n1. do it')
    expect(body).toBe('intro')
    expect(exercise).toBe('1. do it')
  })
})

describe('lesson content', () => {
  it('has unique ids and a valid track for every lesson', () => {
    const ids = lessons.map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const l of lessons) expect(tracks.some((t) => t.id === l.track), l.id).toBe(true)
  })

  it('has every required field and checklist', () => {
    for (const l of lessons) {
      expect(l.title, l.id).toBeTruthy()
      expect(l.objectives.length, l.id).toBeGreaterThan(0)
      expect(l.exercise, l.id).toBeTruthy()
      for (const r of l.resources) expect(r.url, l.id).toMatch(/^https:\/\//)
    }
  })

  it('references only registered demos', () => {
    for (const l of lessons) if (l.demo) expect(Object.keys(demos), l.id).toContain(l.demo)
  })

  it('gives every track at least one lesson', () => {
    for (const t of tracks) expect(lessons.some((l) => l.track === t.id), t.id).toBe(true)
  })
})
