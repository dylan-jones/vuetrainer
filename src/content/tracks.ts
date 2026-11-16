import type { Track } from './types'

export const tracks: Track[] = [
  {
    id: 'udemy',
    title: 'Udemy: Vue.js Course',
    icon: 'mdi-school',
    description: 'The course you are working through right now. Finish it first.',
  },
  {
    id: 'css',
    title: 'Modern CSS',
    icon: 'mdi-language-css3',
    description: '@layer, advanced Grid and @container queries.',
  },
  {
    id: 'vue',
    title: 'Vue in depth',
    icon: 'mdi-vuejs',
    description: 'Fundamentals refresher, slots, component v-model and publishing components.',
  },
  {
    id: 'vuetify',
    title: 'Vuetify 4 styling',
    icon: 'mdi-palette',
    description: 'App-wide styling with Sass variables, custom CSS layers and component defaults.',
  },
  {
    id: 'project',
    title: 'Build: Sprintly mock app',
    icon: 'mdi-hammer-wrench',
    description: 'Put it all together: build a team task board from scratch, lesson by lesson.',
  },
]
