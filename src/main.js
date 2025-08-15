import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './styles/index.css'
import './styles/typography.css'
import './styles/color-contrast-fixes.css'
import './style.css'
import './brand.css'
// Icon Loading Strategy - Use minimal set with fallback
try {
  // Try minimal icon set first (only ~15KB)
  import('./styles/icons-minimal.css')
} catch (error) {
  console.warn('Minimal icons failed to load, falling back to full FontAwesome')
  // Fallback to full FontAwesome if minimal fails (~240KB)
  import('@fortawesome/fontawesome-free/css/all.css')
}

// Also import full CSS as backup for development
import '@fortawesome/fontawesome-free/css/all.css'
import { initializeGlobalErrorHandlers } from './composables/useErrorHandler.ts'

const app = createApp(App)
const pinia = createPinia()

// Initialize global error handlers to prevent memory leaks
initializeGlobalErrorHandlers()

// Initialize web app theme detection
const initializeWebStyling = () => {
  // Initialize theme detection
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  document.documentElement.classList.toggle('dark', prefersDark)
  
  // Listen for theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    document.documentElement.classList.toggle('dark', e.matches)
  })
}

initializeWebStyling()

app.use(pinia)
app.mount('#app')