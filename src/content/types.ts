export interface Resource {
  title: string
  url: string
}

export interface Track {
  id: string
  title: string
  icon: string
  description: string
}

export interface Lesson {
  id: string
  track: string
  order: number
  title: string
  summary: string
  minutes: number
  demo?: string
  objectives: string[]
  resources: Resource[]
  body: string
  exercise: string
}
