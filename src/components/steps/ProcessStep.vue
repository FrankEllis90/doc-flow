<template>
  <div class="process-step">

        <!-- Ready to Process Card -->
        <section class="card">
          <header class="card-header">
            <h3>Ready to Process</h3>
          </header>
          <div class="card-body">
            <p class="text-neutral-600">Click Start Processing to transform your content into searchable sections.</p>
            
            <div class="flex" style="margin-top: var(--space-4); gap: var(--space-3);">
              <LoadingButton 
                @click="startProcessing"
                :loading="isProcessing"
                :disabled="!canProcess"
                variant="primary"
                size="md"
                loading-text="Processing..."
                id="startProcessing"
              >
                Start Processing
              </LoadingButton>
              
              <LoadingButton 
                @click="goBack"
                :disabled="isProcessing"
                variant="secondary"
                size="md"
                id="backToConfigure"
              >
                Back to Configure
              </LoadingButton>
            </div>
            
            <p style="font-size: var(--fluid-text-sm); color: var(--color-neutral-500); margin-top: var(--space-2);">Typically takes 10–30 seconds.</p>
          </div>
        </section>

        <!-- Processing Progress (only shown during processing) -->
        <section v-if="isProcessing" class="card">
          <div class="card-body">
            <div class="flex items-center" style="gap: var(--space-3);">
              <SkeletonLoader variant="circular" :width="20" :height="20" />
              <div class="flex-1">
                <p style="font-weight: var(--font-weight-medium); color: var(--color-neutral-900);">{{ currentStep }}</p>
                <div style="margin-top: var(--space-2);">
                  <ProgressBar 
                    :value="processingProgress"
                    :max="100"
                    size="sm"
                    variant="primary"
                    :animated="true"
                    :show-label="false"
                  />
                  <p class="text-xs text-neutral-500" style="margin-top: var(--space-1);">{{ processingProgress }}% complete</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Processing Configuration Card -->
        <section class="card">
          <header class="card-header">
            <h3>Processing Configuration</h3>
          </header>
          <div class="card-body">
            <div class="grid grid-cols-1 md:grid-cols-2" style="gap: var(--space-4);">
              <!-- Chunking Method -->
              <div class="form-field">
                <label class="form-label">Chunking Method</label>
                <input 
                  type="text" 
                  class="form-input" 
                  :value="getChunkingMethodLabel(config.chunkingMethod)"
                  readonly
                >
                <p class="text-xs text-neutral-500" style="margin-top: var(--space-1);">
                  {{ getChunkingMethodHelper(config.chunkingMethod) }}
                </p>
              </div>

              <!-- Chunk Size -->
              <div class="form-field">
                <label class="form-label">Chunk Size</label>
                <input 
                  type="text" 
                  class="form-input" 
                  :value="`${config.chunkSize} ${getChunkUnit()}`"
                  readonly
                >
                <p class="text-xs text-neutral-500" style="margin-top: var(--space-1);">Target size for each section</p>
              </div>

              <!-- Overlap Percentage -->
              <div class="form-field">
                <label class="form-label">Overlap Percentage</label>
                <input 
                  type="text" 
                  class="form-input" 
                  :value="`${config.overlap}%`"
                  readonly
                >
                <p class="text-xs text-neutral-500" style="margin-top: var(--space-1);">Prevents information loss at chunk boundaries</p>
              </div>

              <!-- Source Content -->
              <div class="form-field">
                <label class="form-label">Source Content</label>
                <input 
                  type="text" 
                  class="form-input" 
                  :value="`${sourceInfo.title} (${sourceInfo.wordCount} words)`"
                  readonly
                >
                <p class="text-xs text-neutral-500" style="margin-top: var(--space-1);">Content to be processed</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Results Card (shown after processing) -->
        <section v-if="processingStatus === 'completed' && generatedChunks.length > 0" class="card">
          <header class="card-header">
            <h3>Processing Results</h3>
          </header>
          <div class="card-body">
            <div class="results-summary">
              <div class="flex" style="gap: var(--space-4); margin-bottom: var(--space-4);">
                <div class="stat-badge">
                  <strong>{{ generatedChunks.length }}</strong> sections created
                </div>
                <div class="stat-badge">
                  <strong>{{ totalWords }}</strong> words processed
                </div>
                <div class="stat-badge">
                  <strong>{{ averageWordsPerChunk }}</strong> avg words/section
                </div>
              </div>
              
              <p class="text-neutral-600">
                Your content has been successfully transformed. Click "Continue to Review" to proceed to the next step.
              </p>
              
              <div class="flex" style="margin-top: var(--space-4); gap: var(--space-3);">
                <button 
                  @click="proceedToNext"
                  class="btn btn-primary"
                  id="continueToReview"
                >
                  Continue to Review
                </button>
                
                <button 
                  @click="reprocessContent"
                  class="btn btn-secondary"
                  id="processAgain"
                >
                  Process Again
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Error Card (shown on error) -->
        <section v-if="processingStatus === 'error'" class="card card-error">
          <div class="card-body">
            <div class="flex items-start" style="gap: var(--space-3);">
              <svg class="w-5 h-5 text-error-600" style="margin-top: 0.125rem;" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <div class="flex-1">
                <h4 style="font-weight: var(--font-weight-medium); color: var(--color-error-900);">Processing Failed</h4>
                <p style="color: var(--color-error-700); font-size: var(--fluid-text-sm); margin-top: var(--space-1);">{{ errorMessage }}</p>
                
                <div class="flex" style="margin-top: var(--space-3); gap: var(--space-3);">
                  <button 
                    @click="retryProcessing"
                    class="btn btn-primary"
                  >
                    Retry Processing
                  </button>
                  
                  <button 
                    @click="goBack"
                    class="btn btn-secondary"
                  >
                    Back to Configure
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
  </div>

  <!-- Notification Container (positioned absolutely) -->
  <div 
    v-if="showNotification" 
    :class="['notification', notificationType === 'success' ? 'notification-success' : 'notification-error']"
    role="alert"
    aria-live="assertive"
  >
    <div class="notification-content">
      <svg v-if="notificationType === 'success'" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
      <svg v-else class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      <span>{{ notificationMessage }}</span>
    </div>
  </div>

  <!-- ARIA Live Region for Screen Readers -->
  <div class="live-region-polite" aria-live="polite" aria-atomic="true">
    {{ screenReaderMessage }}
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { chunkText, chunkBySections, suggestTags } from '@/utils/chunker.js'
import LoadingButton from '@/components/LoadingButton.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import SkeletonLoader from '@/components/SkeletonLoader.vue'

// Props & Emits
const props = defineProps<{
  data: {
    source: {
      title: string
      content: string
      file: File | null
    }
    configure: {
      chunkingMethod: string
      chunkSize: number
      overlap: number
      autoTagging: boolean
      advanced: {
        stopWords: string[]
        sectionSelectors: string[]
        semanticThreshold: number
      }
    }
    processing: {
      status: string
      chunks: any[]
      stats: {
        created: number
        failed: number
        warnings: number
      }
      logs: any[]
    }
  }
  validation: any
}>()

const emit = defineEmits<{
  validate: [validation: any]
  next: []
  back: []
  'update:data': [data: any]
}>()

// Processing State
const processingStatus = ref<'idle' | 'processing' | 'completed' | 'error'>('idle')
const isProcessing = ref(false)
const processingProgress = ref(0)
const currentStep = ref('Initializing...')
const generatedChunks = ref<any[]>([])
const errorMessage = ref('')

// Notification State
const showNotification = ref(false)
const notificationType = ref<'success' | 'error'>('success')
const notificationMessage = ref('')

// Screen Reader Message
const screenReaderMessage = ref('')

// Computed Properties
const config = computed(() => props.data?.configure || {
  chunkingMethod: 'word-based',
  chunkSize: 500,
  overlap: 15,
  autoTagging: true
})

const sourceInfo = computed(() => {
  const source = props.data?.source || {}
  const content = source.content || ''
  const wordCount = content ? 
    content.split(/\s+/).filter(w => w.length > 0).length : 0
  
  return {
    title: source.title || source.file?.name || 'Untitled Content',
    wordCount: wordCount
  }
})

const canProcess = computed(() => {
  const source = props.data?.source || {}
  return (source.content || source.file) && 
         config.value?.chunkSize > 0
})

const totalWords = computed(() => {
  return generatedChunks.value.reduce((sum, chunk) => 
    sum + (chunk.metadata?.wordCount || 0), 0)
})

const averageWordsPerChunk = computed(() => {
  return generatedChunks.value.length > 0 ? 
    Math.round(totalWords.value / generatedChunks.value.length) : 0
})

// Helper Methods
const getChunkingMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    'word-based': 'By Word Count',
    'character-based': 'By Character Count',
    'section-based': 'By Natural Sections'
  }
  return labels[method] || method
}

const getChunkingMethodHelper = (method: string) => {
  const helpers: Record<string, string> = {
    'word-based': 'Optimal for most AI applications',
    'character-based': 'Precise character control',
    'section-based': 'Maintains document structure'
  }
  return helpers[method] || ''
}

const getChunkUnit = () => {
  return config.value.chunkingMethod === 'character-based' ? 'characters' :
         config.value.chunkingMethod === 'section-based' ? 'sections' : 'words'
}

// Processing Methods
const startProcessing = async () => {
  if (!canProcess.value || isProcessing.value) return

  isProcessing.value = true
  processingStatus.value = 'processing'
  processingProgress.value = 0
  generatedChunks.value = []
  errorMessage.value = ''
  
  // Announce to screen readers
  screenReaderMessage.value = 'Processing started'

  try {
    // Simulate processing steps
    const steps = [
      { progress: 20, message: 'Reading content...' },
      { progress: 40, message: 'Analyzing structure...' },
      { progress: 60, message: 'Generating sections...' },
      { progress: 80, message: 'Adding metadata...' },
      { progress: 100, message: 'Finalizing...' }
    ]

    for (const step of steps) {
      currentStep.value = step.message
      processingProgress.value = step.progress
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Get source content with defensive checks
    const source = props.data?.source || {}
    const content = source.content || ''
    const filename = source.file?.name || source.title || 'content'

    if (!content || content.trim().length === 0) {
      throw new Error('No content to process')
    }

    // Generate chunks based on method
    let chunks: any[] = []
    
    if (config.value?.chunkingMethod === 'section-based') {
      chunks = chunkBySections(content, filename)
    } else {
      const chunkBy = config.value?.chunkingMethod === 'character-based' ? 'characters' : 'words'
      chunks = chunkText(content, filename, {
        chunkSize: config.value?.chunkSize || 500,
        overlap: Math.round((config.value?.chunkSize || 500) * (config.value?.overlap || 15) / 100),
        chunkBy: chunkBy
      })
    }

    // Auto-generate tags if enabled
    if (config.value?.autoTagging) {
      for (const chunk of chunks) {
        const suggestedTags = suggestTags(chunk.content)
        chunk.tags = [...(chunk.tags || []), ...suggestedTags]
        chunk.tagsString = chunk.tags.join(', ')
      }
    }

    generatedChunks.value = chunks
    processingStatus.value = 'completed'
    
    // Show success notification
    showSuccessNotification('Processing complete — sections generated.')
    
    // Update parent data
    emit('update:data', {
      ...props.data,
      processing: {
        status: 'completed',
        chunks: chunks,
        stats: {
          created: chunks.length,
          failed: 0,
          warnings: 0
        },
        logs: []
      }
    })

  } catch (error: any) {
    processingStatus.value = 'error'
    errorMessage.value = error.message || 'An unexpected error occurred'
    showErrorNotification('Processing failed. Please try again.')
    
    emit('update:data', {
      ...props.data,
      processing: {
        status: 'error',
        chunks: [],
        stats: { created: 0, failed: 1, warnings: 0 },
        logs: []
      }
    })
  } finally {
    isProcessing.value = false
  }
}

const retryProcessing = () => {
  startProcessing()
}

const goBack = () => {
  // Emit back navigation signal - parent wizard will handle step change
  emit('back')
}

const proceedToNext = () => {
  emit('next')
}

const reprocessContent = () => {
  processingStatus.value = 'idle'
  processingProgress.value = 0
  generatedChunks.value = []
  errorMessage.value = ''
}

// Notification Methods
const showSuccessNotification = (message: string) => {
  notificationType.value = 'success'
  notificationMessage.value = message
  showNotification.value = true
  screenReaderMessage.value = message
  
  setTimeout(() => {
    showNotification.value = false
  }, 5000)
}

const showErrorNotification = (message: string) => {
  notificationType.value = 'error'
  notificationMessage.value = message
  showNotification.value = true
  screenReaderMessage.value = message
  
  setTimeout(() => {
    showNotification.value = false
  }, 5000)
}

// Validation
watch(processingStatus, () => {
  const isValid = processingStatus.value === 'completed'
  const canContinue = generatedChunks.value.length > 0
  
  emit('validate', {
    isValid: canContinue,
    hasErrors: processingStatus.value === 'error',
    completed: isValid,
    errors: errorMessage.value ? { processing: errorMessage.value } : {}
  })
}, { immediate: true })

// Initialize
onMounted(() => {
  const processing = props.data?.processing || {}
  if (processing.status === 'completed' && processing.chunks?.length > 0) {
    processingStatus.value = 'completed'
    generatedChunks.value = processing.chunks
  }
})
</script>

<style scoped>
/* Import design system tokens */
@import '@/styles/design-tokens.css';
@import '@/styles/components.css';

/* Process Step Container */
.process-step {
  width: 100%;
}

/* Progress Bar */
.progress {
  height: 8px;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-primary {
  background-color: var(--bg-secondary);
}

.progress-bar {
  height: 100%;
  background-color: var(--color-primary-600);
  transition: width 0.3s ease;
}

.progress-sm {
  height: 4px;
}

/* Card Components */
.card {
  background: var(--surface-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  width: 100%;
  margin-bottom: var(--space-4);
}

.card-header {
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-color);
}

.card-header h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.card-body {
  padding: var(--space-4);
}

.card-footer {
  padding: var(--space-4);
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.card-error {
  border-color: var(--color-error-200);
  background-color: var(--color-error-50);
}

/* Form Fields */
.form-field {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  margin-bottom: var(--space-1);
}

.form-input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  min-height: 44px;
}

.form-input:read-only {
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: not-allowed;
}

/* Button overrides for this component */
.btn-primary {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: white;
  border: 1px solid transparent;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
  min-height: 44px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Loading states are now handled by design system components */

/* Badge */
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-full);
}

.badge-soft {
  background-color: var(--bg-brand-subtle);
  color: var(--text-brand);
}

/* Stats */
.stat-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.stat-badge strong {
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
}

/* Results Summary */
.results-summary {
  padding: var(--space-4);
  background-color: var(--bg-success-subtle);
  border: 1px solid var(--border-success);
  border-radius: var(--radius-md);
}

/* Removed Pro Tips styles - handled by parent wizard */

/* Notifications */
.notification {
  position: fixed;
  top: var(--space-4);
  right: var(--space-4);
  max-width: 400px;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  animation: slide-in 0.3s ease;
}

.notification-success {
  background-color: var(--color-success-600);
  color: white;
}

.notification-error {
  background-color: var(--color-error-600);
  color: white;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Screen Reader Only */
.live-region-polite {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Focus States */
button:focus,
input:focus {
  outline: 2px solid var(--focus-ring-primary);
  outline-offset: var(--focus-ring-offset);
}

/* Utility Classes */
.text-neutral-500 { color: var(--text-tertiary); }
.text-neutral-600 { color: var(--text-secondary); }
.text-neutral-700 { color: var(--text-secondary); }
.text-neutral-900 { color: var(--text-primary); }
.text-error-600 { color: var(--color-error-600); }
.text-error-700 { color: var(--color-error-700); }
.text-error-900 { color: var(--color-error-900); }

.text-xs { font-size: var(--font-size-xs); }
.text-sm { font-size: var(--font-size-sm); }

.mt-1 { margin-top: var(--space-1); }
.mt-2 { margin-top: var(--space-2); }
.mt-3 { margin-top: var(--space-3); }
.mt-4 { margin-top: var(--space-4); }
.mt-6 { margin-top: var(--space-6); }
.mb-4 { margin-bottom: var(--space-4); }

.gap-3 { gap: var(--space-3); }
.gap-4 { gap: var(--space-4); }

.flex { display: flex; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.justify-between { justify-content: space-between; }

.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }

@media (min-width: 768px) {
  .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 768px) {
  .btn-primary,
  .btn-secondary {
    @apply w-full;
    min-height: 44px;
  }
  
  .flex {
    @apply flex-col;
  }
  
  .flex[style*="gap"] {
    gap: var(--space-2) !important;
  }
  
  .stat-badge {
    @apply text-center;
    padding: var(--space-3);
  }
  
  .results-summary {
    padding: var(--space-3);
  }
}

@media (max-width: 480px) {
  .card-body {
    padding: var(--space-3);
  }
  
  .card-header {
    padding: var(--space-3);
  }
  
  .form-input {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}

.font-medium { font-weight: var(--font-weight-medium); }
.font-semibold { font-weight: var(--font-weight-semibold); }

.w-5 { width: 1.25rem; }
.h-5 { height: 1.25rem; }
</style>