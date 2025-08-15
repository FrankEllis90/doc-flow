<template>
  <div 
    id="app" 
    :class="{ 
      'drag-active': isDragActive,
      'dark-theme': isDarkTheme 
    }"
    @drop.prevent="handleFileDrop"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
  >
    <!-- Drag and Drop Overlay -->
    <div v-if="isDragActive" class="drag-overlay">
      <div class="drag-content">
        <div class="drag-icon">
          <i class="fas fa-cloud-upload-alt text-6xl text-brand-sage mb-4"></i>
        </div>
        <h3 class="drag-title">{{ dragMessage }}</h3>
        <p class="drag-subtitle">Supported formats: PDF, Markdown, Text, Word</p>
      </div>
    </div>

    <!-- Global Error Handler for system-wide error handling -->
    <GlobalErrorHandler />
    
    <!-- Main Application with Error Boundary -->
    <AsyncErrorBoundary
      fallback-title="Application Error"
      fallback-message="The application encountered an unexpected error. Please try refreshing the page."
      :auto-retry="true"
      :max-retries="2"
      contextual-help="If this problem persists, try clearing your browser cache or contact support."
    >
      <!-- Web Application with Tabs -->
      <HomeView />
    </AsyncErrorBoundary>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import GlobalErrorHandler from './components/GlobalErrorHandler.vue'
import AsyncErrorBoundary from './components/AsyncErrorBoundary.vue'
import HomeView from './web/views/HomeView.vue'
import { useNotifications } from './composables/useNotifications'

const { showInfo: showNotification } = useNotifications()

// Drag and drop state
const isDragActive = ref(false)
const isDarkTheme = ref(false)

// Computed properties
const dragMessage = computed(() => {
  return 'Drop PDF or Markdown files here to import them'
})

// Drag and drop handlers
const handleDragOver = (event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
    isDragActive.value = true
  }
}

const handleDragLeave = (event: DragEvent) => {
  // Only remove drag state if actually leaving the app
  const rect = document.documentElement.getBoundingClientRect()
  if (
    event.clientX <= rect.left ||
    event.clientX >= rect.right ||
    event.clientY <= rect.top ||
    event.clientY >= rect.bottom
  ) {
    isDragActive.value = false
  }
}

const handleFileDrop = async (event: DragEvent) => {
  isDragActive.value = false
  
  if (!event.dataTransfer?.files) return
  
  const files = Array.from(event.dataTransfer.files)
  const supportedFiles = files.filter(file => {
    const ext = file.name.toLowerCase().split('.').pop()
    return ['pdf', 'md', 'txt', 'docx'].includes(ext || '')
  })
  
  if (supportedFiles.length === 0) {
    showNotification('Invalid Files', 'Please drop PDF, Markdown, or text files only.')
    return
  }
  
  // Trigger file processing for web app
  window.dispatchEvent(new CustomEvent('files-dropped', { 
    detail: { 
      files: supportedFiles.map(f => f.name),
      fileObjects: supportedFiles 
    } 
  }))
  
  showNotification('Files Added', `${supportedFiles.length} file(s) ready for processing.`)
}

onMounted(() => {
  // Initialize web app theme detection
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  isDarkTheme.value = prefersDark
  document.documentElement.classList.toggle('dark', isDarkTheme.value)
  
  // Listen for theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    isDarkTheme.value = e.matches
    document.documentElement.classList.toggle('dark', e.matches)
  })
})
</script>

<style>
/* Base App Styles */
#app {
  min-height: 100vh;
  position: relative;
  background-color: var(--color-background);
  transition: background-color 0.2s ease;
}

/* Dark Theme Support */
.dark-theme {
  --color-background: #1a1a1a;
  --color-surface: #2d2d2d;
  --color-text: #f5f5f5;
}

/* Drag and Drop Styles */
.drag-active {
  position: relative;
}

.drag-active::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(168, 183, 157, 0.1);
  border: 3px dashed var(--brand-sage);
  z-index: 9998;
  pointer-events: none;
}

.drag-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(245, 247, 244, 0.95);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  pointer-events: none;
}

.dark-theme .drag-overlay {
  background-color: rgba(26, 26, 26, 0.95);
}

.drag-content {
  @apply text-center p-8 rounded-2xl;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(16px);
  border: 2px solid var(--brand-sage);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 400px;
}

.dark-theme .drag-content {
  background: rgba(45, 45, 45, 0.9);
  border-color: var(--brand-sage);
  color: var(--color-text);
}

.drag-title {
  @apply text-xl font-semibold mb-2 text-gray-800;
}

.dark-theme .drag-title {
  @apply text-gray-100;
}

.drag-subtitle {
  @apply text-sm text-gray-600;
}

.dark-theme .drag-subtitle {
  @apply text-gray-300;
}

/* Web App Scrollbars */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(168, 183, 157, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(168, 183, 157, 0.5);
}

/* Focus management for accessibility */
*:focus {
  outline: 2px solid var(--brand-gold);
  outline-offset: 2px;
}

button:focus:not(:focus-visible) {
  outline: none;
}

button:focus-visible {
  outline: 2px solid var(--brand-gold);
  outline-offset: 2px;
}

/* Animation improvements */
* {
  transition-duration: 0.15s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Responsive design for web */
@media (max-width: 768px) {
  .drag-content {
    @apply mx-4 p-6;
    max-width: none;
  }
  
  .drag-title {
    @apply text-lg;
  }
}
</style>