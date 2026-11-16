import type { Component } from 'vue'

type Loader = () => Promise<{ default: Component }>

/** Lesson frontmatter `demo: Name` is looked up here. Demos are code-split. */
export const demos: Record<string, Loader> = {
  LayerDemo: () => import('./LayerDemo.vue'),
  GridDemo: () => import('./GridDemo.vue'),
  ContainerDemo: () => import('./ContainerDemo.vue'),
  ReactivityDemo: () => import('./ReactivityDemo.vue'),
  SlotsDemo: () => import('./SlotsDemo.vue'),
  VModelDemo: () => import('./VModelDemo.vue'),
  DefaultsDemo: () => import('./DefaultsDemo.vue'),
}
