import 'vuetify/styles'
import { createVuetify } from 'vuetify'

// Global component defaults: every instance of these components inherits the props below
// unless it sets its own. See lesson "Vuetify 4: Component defaults".
export default createVuetify({
  theme: {
    defaultTheme: 'system',
    themes: {
      light: {
        colors: { primary: '#2e7d5b', secondary: '#35495e', background: '#f6f8fa' },
      },
      dark: {
        colors: { primary: '#42b883', secondary: '#8fb3d9' },
      },
    },
  },
  defaults: {
    VBtn: { variant: 'flat', rounded: 'lg' },
    VTextField: { variant: 'outlined', density: 'comfortable' },
    VTextarea: { variant: 'outlined' },
    VProgressLinear: { rounded: true, height: 8 },
    VChip: { size: 'small' },
    // Per-component overrides nested inside another component:
    VCard: { rounded: 'lg', variant: 'outlined', VCardTitle: { class: 'text-wrap' } },
  },
})
