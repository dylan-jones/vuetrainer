import { parseFrontmatter, splitExercise } from './frontmatter'
import { tracks } from './tracks'
import type { Lesson, Resource } from './types'

const files = import.meta.glob('./lessons/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function toResource(entry: string): Resource {
  const [title, url] = entry.split('|').map((s) => s.trim())
  return { title: title!, url: url! }
}

export function parseLesson(path: string, raw: string): Lesson {
  const { data, content } = parseFrontmatter(raw)
  const { body, exercise } = splitExercise(content)
  const asList = (v: string | string[] | undefined) => (Array.isArray(v) ? v : [])
  return {
    id: path.replace(/^.*\//, '').replace(/\.md$/, ''),
    track: String(data.track),
    order: Number(data.order ?? 0),
    title: String(data.title),
    summary: String(data.summary ?? ''),
    minutes: Number(data.minutes ?? 30),
    demo: data.demo ? String(data.demo) : undefined,
    objectives: asList(data.objectives),
    resources: asList(data.resources).map(toResource),
    body,
    exercise,
  }
}

const trackOrder = new Map(tracks.map((t, i) => [t.id, i]))

export const lessons: Lesson[] = Object.entries(files)
  .map(([path, raw]) => parseLesson(path, raw))
  .sort((a, b) => (trackOrder.get(a.track)! - trackOrder.get(b.track)!) || a.order - b.order)

export const getLesson = (id: string) => lessons.find((l) => l.id === id)
export const lessonsForTrack = (trackId: string) => lessons.filter((l) => l.track === trackId)
export const getTrack = (id: string) => tracks.find((t) => t.id === id)
