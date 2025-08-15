<template>
  <div class="configure-step">
    <form @submit.prevent="handleSubmit" style="display: flex; flex-direction: column; gap: var(--space-6);">
      <!-- Chunking Method Selection -->
      <div class="form-field">
        <label class="form-label">
          <span style="font-size: var(--fluid-text-sm); font-weight: var(--font-weight-medium); color: var(--color-neutral-900);">How should we split your content?</span>
        </label>
        <div class="method-grid">
          <div
            v-for="method in chunkingMethods"
            :key="method.id"
            :class="[
              'method-card',
              formData.chunkingMethod === method.id ? 'method-active' : 'method-inactive'
            ]"
            @click="selectChunkingMethod(method.id)"
          >
            <div class="method-icon">
              <span class="text-xl">{{ method.icon }}</span>
            </div>
            <div class="method-content">
              <h4 style="font-weight: var(--font-weight-semibold); font-size: var(--fluid-text-sm); color: var(--color-neutral-900);">{{ method.title }}</h4>
              <p class="text-xs text-[color:var(--color-neutral-600)]" style="margin-top: var(--space-1);">{{ method.description }}</p>
              <div v-if="method.recommended" class="method-badge">
                <span style="font-size: var(--fluid-text-xs); font-weight: var(--font-weight-medium); color: var(--color-emerald-700);">Recommended</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chunk Size Configuration -->
      <div class="form-field">
        <label class="form-label">
          <span style="font-size: var(--fluid-text-sm); font-weight: var(--font-weight-medium); color: var(--color-neutral-900);">How long should each section be?</span>
        </label>
        <div class="slider-container">
          <div class="slider-header">
            <div class="slider-info">
              <div class="flex items-center" style="gap: var(--space-2);">
                <span style="font-size: var(--fluid-text-sm); color: var(--color-neutral-600);">{{ chunkSizeInfo.label }}</span>
                <div v-if="chunkSizeInfo.label.includes('Recommended')" class="recommended-badge">
                  <span style="font-size: var(--fluid-text-xs); font-weight: var(--font-weight-medium); color: var(--color-emerald-700);">Recommended</span>
                </div>
              </div>
              <span class="slider-value">{{ formData.chunkSize }} {{ chunkSizeUnit }}</span>
            </div>
          </div>
          
          <!-- Range Slider -->
          <div class="slider-wrapper">
            <input
              type="range"
              v-model.number="formData.chunkSize"
              :min="chunkSizeRange.min"
              :max="chunkSizeRange.max"
              :step="chunkSizeRange.step"
              class="slider"
              @input="updateChunkSize"
            />
            <div class="slider-track">
              <div class="slider-fill" :style="{ width: sliderPercentage + '%' }"></div>
            </div>
          </div>
          
          <!-- Slider Labels -->
          <div class="slider-labels">
            <span class="text-xs text-[color:var(--color-neutral-500)]">{{ chunkSizeRange.min }}</span>
            <span class="text-xs text-[color:var(--color-neutral-500)]">{{ chunkSizeRange.max }}</span>
          </div>
          
          <!-- Size Description -->
          <div class="size-description">
            <p style="font-size: var(--fluid-text-sm); color: var(--color-neutral-600);">{{ chunkSizeInfo.description }}</p>
          </div>
        </div>
      </div>

      <!-- Overlap Configuration -->
      <div class="form-field">
        <label class="form-label">
          <span style="font-size: var(--fluid-text-sm); font-weight: var(--font-weight-medium); color: var(--color-neutral-900);">How much should sections share text?</span>
        </label>
        <div class="overlap-container">
          <div class="overlap-buttons">
            <button
              v-for="overlap in overlapOptions"
              :key="overlap.value"
              type="button"
              :class="[
                'overlap-btn',
                formData.overlap === overlap.value ? 'overlap-active' : 'overlap-inactive'
              ]"
              @click="selectOverlap(overlap.value)"
            >
              <span style="font-size: var(--fluid-text-sm); font-weight: var(--font-weight-medium);">{{ overlap.value }}%</span>
              <span class="text-xs">{{ overlap.label }}</span>
            </button>
          </div>
          <div class="overlap-info">
            <p style="font-size: var(--fluid-text-sm); color: var(--color-neutral-600);">{{ overlapDescription }}</p>
          </div>
        </div>
      </div>

      <!-- Auto-tagging Toggle -->
      <div class="form-field">
        <div class="toggle-container">
          <div class="toggle-content">
            <div class="toggle-info">
              <h4 style="font-size: var(--fluid-text-sm); font-weight: var(--font-weight-medium); color: var(--color-neutral-900);">Should we automatically suggest topic tags?</h4>
              <p class="text-xs text-[color:var(--color-neutral-600)]" style="margin-top: var(--space-1);">We'll analyze your content and suggest relevant keywords and topics</p>
            </div>
            <label class="toggle-switch">
              <input
                type="checkbox"
                v-model="formData.autoTagging"
                @change="handleAutoTaggingChange"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div v-if="formData.autoTagging" class="toggle-details">
            <div class="tag-preview">
              <span class="text-xs text-[color:var(--color-neutral-600)]">Sample tags: </span>
              <span
                v-for="tag in sampleTags"
                :key="tag"
                class="sample-tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Advanced Settings (Collapsible) -->
      <div class="form-field">
        <button
          type="button"
          @click="showAdvanced = !showAdvanced"
          class="advanced-toggle"
        >
          <span style="font-size: var(--fluid-text-sm); font-weight: var(--font-weight-medium); color: var(--color-neutral-900);">Need more control? (Optional)</span>
          <svg
            :class="['w-4 h-4 transition-transform', showAdvanced ? 'rotate-180' : '']"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
        
        <div v-show="showAdvanced" class="advanced-content">
          <!-- Stop Words -->
          <div class="advanced-field">
            <label class="form-label">
              <span style="font-size: var(--fluid-text-sm); font-weight: var(--font-weight-medium); color: var(--color-neutral-900);">Custom Stop Words</span>
            </label>
            <textarea
              v-model="stopWordsText"
              class="textarea"
              placeholder="Enter words to exclude, separated by commas (e.g., the, and, or, but)"
              rows="3"
              @blur="updateStopWords"
            ></textarea>
            <p class="form-help">Words that should be ignored during processing</p>
          </div>

          <!-- Section Selectors -->
          <div class="advanced-field">
            <label class="form-label">
              <span style="font-size: var(--fluid-text-sm); font-weight: var(--font-weight-medium); color: var(--color-neutral-900);">Section Selectors</span>
            </label>
            <input
              v-model="sectionSelectorsText"
              type="text"
              class="input"
              placeholder="CSS selectors (e.g., h1, h2, .section)"
              @blur="updateSectionSelectors"
            />
            <p class="form-help">CSS selectors for identifying section boundaries</p>
          </div>

          <!-- Text Grouping -->
          <div class="advanced-field">
            <label class="form-label">
              <span style="font-size: var(--fluid-text-sm); font-weight: var(--font-weight-medium); color: var(--color-neutral-900);">How closely should we keep related text together?</span>
            </label>
            <div class="threshold-slider">
              <input
                type="range"
                v-model.number="formData.advanced.semanticThreshold"
                min="0.1"
                max="1.0"
                step="0.1"
                class="slider small"
              />
              <div class="threshold-labels">
                <span class="text-xs text-[color:var(--color-neutral-500)]">Loose</span>
                <div class="threshold-center">
                  <span class="threshold-value">
                    <span class="text-xs text-[color:var(--color-neutral-400)]">{{ formData.advanced.semanticThreshold }}</span>
                  </span>
                  <div v-if="isRecommendedThreshold" class="recommended-badge">
                    <span class="text-xs font-medium text-[color:var(--color-success-700)]">Recommended</span>
                  </div>
                </div>
                <span class="text-xs text-[color:var(--color-neutral-500)]">Tight</span>
              </div>
            </div>
            <div class="threshold-explanation">
              <p class="text-sm text-[color:var(--color-neutral-600)]" style="margin-bottom: var(--space-2);">
                <strong>Think of your content like a book:</strong> This setting controls whether we cut it into whole chapters (tight) or smaller paragraphs (loose).
              </p>
              <div v-if="thresholdHint" class="threshold-hint">
                <svg class="w-4 h-4 text-[color:var(--color-warning-600)] inline" style="margin-right: var(--space-1);" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-[color:var(--color-warning-700)]">{{ thresholdHint }}</span>
              </div>
              <p v-else class="text-sm text-[color:var(--color-neutral-500)]">
                Most users can leave this at the recommended setting.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview Section -->
      <div class="preview-section">
        <h4 style="font-size: var(--fluid-text-sm); font-weight: var(--font-weight-medium); color: var(--color-neutral-900); margin-bottom: var(--space-3);">📋 Your Settings Summary</h4>
        <div class="preview-grid">
          <div class="preview-item">
            <span class="preview-label">Split by:</span>
            <span class="preview-value">{{ selectedMethodTitle }}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">Section size:</span>
            <span class="preview-value">{{ formData.chunkSize }} {{ chunkSizeUnit }}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">Text sharing:</span>
            <span class="preview-value">{{ formData.overlap }}%</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">Auto-tagging:</span>
            <span class="preview-value">{{ formData.autoTagging ? 'Yes' : 'No' }}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">Expected sections:</span>
            <span class="preview-value">{{ estimatedChunks }}</span>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

// Props & Emits
const props = defineProps<{
  data: {
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
    source: {
      title: string
      content: string
      file: File | null
    }
  }
  validation: any
}>()

const emit = defineEmits<{
  validate: [validation: any]
  next: []
  'update:data': [data: any]
}>()

// Component State
const formData = ref({
  chunkingMethod: props.data.configure.chunkingMethod || 'word-based',
  chunkSize: props.data.configure.chunkSize || 500,
  overlap: props.data.configure.overlap || 15,
  autoTagging: props.data.configure.autoTagging !== false, // Default to true
  advanced: {
    stopWords: props.data.configure.advanced?.stopWords || [],
    sectionSelectors: props.data.configure.advanced?.sectionSelectors || [],
    semanticThreshold: props.data.configure.advanced?.semanticThreshold || 0.8
  }
})

const showAdvanced = ref(false)
const stopWordsText = ref(formData.value.advanced.stopWords.join(', '))
const sectionSelectorsText = ref(formData.value.advanced.sectionSelectors.join(', '))

// Chunking Methods
const chunkingMethods = [
  {
    id: 'word-based',
    title: 'By Word Count',
    description: 'Split your content based on number of words (works best for most content)',
    icon: '📝',
    recommended: true
  },
  {
    id: 'character-based',
    title: 'By Character Count',
    description: 'Split based on number of characters (useful for precise size limits)',
    icon: '🔤',
    recommended: false
  },
  {
    id: 'section-based',
    title: 'By Natural Sections',
    description: 'Split at headings and natural breaks (best for structured documents)',
    icon: '📑',
    recommended: false
  }
]

// Chunk Size Configuration
const chunkSizeRange = computed(() => {
  switch (formData.value.chunkingMethod) {
    case 'character-based':
      return { min: 1000, max: 4000, step: 100 }
    case 'section-based':
      return { min: 1, max: 10, step: 1 }
    default: // word-based
      return { min: 100, max: 1200, step: 50 }
  }
})

const chunkSizeUnit = computed(() => {
  switch (formData.value.chunkingMethod) {
    case 'character-based':
      return 'chars'
    case 'section-based':
      return 'sections'
    default:
      return 'words'
  }
})

const chunkSizeInfo = computed(() => {
  const size = formData.value.chunkSize
  const method = formData.value.chunkingMethod
  
  if (method === 'word-based') {
    if (size < 200) return { label: 'Very Small', description: 'Great for finding specific details, but might miss the bigger picture' }
    if (size < 400) return { label: 'Small', description: 'Good for precise answers to specific questions' }
    if (size < 600) return { label: 'Balanced (Recommended)', description: 'Perfect size for most AI applications and search' }
    if (size < 800) return { label: 'Large', description: 'Includes more context, good for complex topics' }
    return { label: 'Very Large', description: 'Maximum context, but search might be less precise' }
  }
  
  if (method === 'character-based') {
    if (size < 1500) return { label: 'Small', description: 'Short, focused sections of text' }
    if (size < 2500) return { label: 'Balanced', description: 'Medium-length sections with good context' }
    return { label: 'Large', description: 'Long sections with lots of context' }
  }
  
  // section-based
  if (size <= 2) return { label: 'Single Sections', description: 'Each natural section becomes one chunk' }
  if (size <= 5) return { label: 'Multiple Sections', description: 'Groups several related sections together' }
  return { label: 'Large Sections', description: 'Combines many sections into fewer, larger chunks' }
})

const sliderPercentage = computed(() => {
  const range = chunkSizeRange.value
  return ((formData.value.chunkSize - range.min) / (range.max - range.min)) * 100
})

// Overlap Options
const overlapOptions = [
  { value: 0, label: 'None' },
  { value: 10, label: 'Light' },
  { value: 15, label: 'Optimal' },
  { value: 20, label: 'Heavy' },
  { value: 25, label: 'Maximum' }
]

const overlapDescription = computed(() => {
  const overlap = formData.value.overlap
  if (overlap === 0) return 'Clean cuts with no shared text - fastest, but might lose connections between chunks'
  if (overlap <= 10) return 'Small amount of shared text - good balance of speed and continuity'
  if (overlap <= 15) return 'Optimal sharing - ensures important ideas aren\'t split between chunks (recommended)'
  if (overlap <= 20) return 'Generous sharing - maximum protection against losing context'
  return 'Maximum sharing - ensures seamless connections, but creates more content to process'
})

// Sample Tags
const sampleTags = computed(() => {
  const sourceTitle = props.data.source?.title || ''
  const baseTitle = sourceTitle.toLowerCase()
  
  if (baseTitle.includes('api') || baseTitle.includes('documentation')) {
    return ['documentation', 'api', 'technical', 'reference']
  }
  if (baseTitle.includes('manual') || baseTitle.includes('guide')) {
    return ['manual', 'guide', 'instructions', 'tutorial']
  }
  return ['content', 'information', 'knowledge', 'data']
})

// Computed Properties
const selectedMethodTitle = computed(() => {
  const method = chunkingMethods.find(m => m.id === formData.value.chunkingMethod)
  return method?.title || 'Word-based'
})

const estimatedChunks = computed(() => {
  const sourceContent = props.data.source?.content || ''
  const fileSize = props.data.source?.file?.size || 0
  
  let contentLength = sourceContent.length
  if (fileSize > 0 && !sourceContent) {
    // Estimate content length from file size (rough approximation)
    contentLength = fileSize * 0.8 // Assume 80% is actual content
  }
  
  if (contentLength === 0) return '0-1'
  
  const method = formData.value.chunkingMethod
  const size = formData.value.chunkSize
  const overlap = formData.value.overlap / 100
  
  let estimatedSize = size
  if (method === 'word-based') {
    estimatedSize = size * 5 // Average 5 chars per word
  } else if (method === 'section-based') {
    estimatedSize = contentLength / 10 // Assume 10 sections on average
  }
  
  const effectiveSize = estimatedSize * (1 - overlap)
  const chunks = Math.ceil(contentLength / effectiveSize)
  
  return Math.max(1, Math.min(chunks, 999)).toString()
})

// Threshold recommendations and hints
const isRecommendedThreshold = computed(() => {
  return formData.value.advanced.semanticThreshold === 0.8
})

const thresholdHint = computed(() => {
  const threshold = formData.value.advanced.semanticThreshold
  
  if (threshold <= 0.3) {
    return "This may create very small sections that lose important context"
  } else if (threshold <= 0.5) {
    return "This may make sections too short to answer complex questions"
  } else if (threshold >= 0.9) {
    return "This may group unrelated topics together in large sections"
  } else if (threshold >= 0.8 && threshold < 0.9) {
    return "" // No hint for recommended range
  } else {
    return "" // No hint for other values in normal range
  }
})

const isValid = computed(() => {
  return formData.value.chunkSize >= chunkSizeRange.value.min &&
         formData.value.chunkSize <= chunkSizeRange.value.max
})

// Methods
const selectChunkingMethod = (methodId: string) => {
  formData.value.chunkingMethod = methodId
  
  // Adjust chunk size to reasonable default for new method
  const range = chunkSizeRange.value
  if (formData.value.chunkSize < range.min || formData.value.chunkSize > range.max) {
    const midpoint = Math.floor((range.min + range.max) / 2)
    const step = range.step
    formData.value.chunkSize = Math.round(midpoint / step) * step
  }
}

const updateChunkSize = () => {
  // Ensure value is within bounds and step-aligned
  const range = chunkSizeRange.value
  let value = Math.max(range.min, Math.min(range.max, formData.value.chunkSize))
  value = Math.round(value / range.step) * range.step
  formData.value.chunkSize = value
}

const selectOverlap = (overlapValue: number) => {
  formData.value.overlap = overlapValue
}

const handleAutoTaggingChange = () => {
  // Auto-tagging state changed
  console.log('Auto-tagging:', formData.value.autoTagging ? 'enabled' : 'disabled')
}

const updateStopWords = () => {
  const words = stopWordsText.value
    .split(',')
    .map(word => word.trim())
    .filter(word => word.length > 0)
  
  formData.value.advanced.stopWords = words
}

const updateSectionSelectors = () => {
  const selectors = sectionSelectorsText.value
    .split(',')
    .map(selector => selector.trim())
    .filter(selector => selector.length > 0)
  
  formData.value.advanced.sectionSelectors = selectors
}

const handleSubmit = () => {
  if (isValid.value) {
    emit('next')
  }
}

// Watchers
watch(
  () => formData.value,
  () => {
    // Update parent data
    emit('update:data', {
      ...props.data,
      configure: {
        chunkingMethod: formData.value.chunkingMethod,
        chunkSize: formData.value.chunkSize,
        overlap: formData.value.overlap,
        autoTagging: formData.value.autoTagging,
        advanced: {
          stopWords: formData.value.advanced.stopWords,
          sectionSelectors: formData.value.advanced.sectionSelectors,
          semanticThreshold: formData.value.advanced.semanticThreshold
        }
      }
    })
    
    // Emit validation
    emit('validate', {
      isValid: isValid.value,
      hasErrors: false,
      completed: isValid.value,
      errors: {}
    })
  },
  { deep: true, immediate: true }
)

// Initialize on mount
onMounted(() => {
  // Ensure chunk size is valid for current method
  updateChunkSize()
})
</script>

<style scoped>
/* Form Components */
/* Form groups now use design system .form-field class */
.form-field {
  margin-bottom: var(--space-6);
}

/* Form labels now use design system .form-label class */

/* Form inputs now use design system .input class */

/* Form textareas now use design system .textarea class */
.textarea {
  min-height: 80px;
}

/* Form help now uses design system .form-help class */

/* Chunking Method Cards */
.method-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: var(--space-3);
}

@media (min-width: 640px) {
  .method-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.method-card {
  padding: var(--space-4);
  border-radius: var(--radius-xl);
  border: 2px solid;
  cursor: pointer;
  transition: all 0.2s;
  @apply hover:shadow-md;
}

.method-active {
  @apply border-brand-sage-500 bg-brand-sage-50 shadow-sm;
}

.method-inactive {
  @apply border-neutral-200 bg-white hover:border-neutral-300;
}

.method-icon {
  text-align: center;
  margin-bottom: var(--space-2);
}

.method-content {
  @apply text-center;
}

.method-badge {
  margin-top: var(--space-2);
}

.method-badge span {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  background: var(--color-emerald-100);
  color: var(--color-emerald-700);
  font-size: var(--fluid-text-xs);
  font-weight: var(--font-weight-medium);
}

/* Slider Styles */
.slider-container {
  @apply space-y-3;
}

.slider-header {
  @apply flex justify-between items-center;
}

.slider-value {
  font-weight: var(--font-weight-semibold);
  color: var(--brand-sage-700);
  font-size: var(--fluid-text-sm);
}

.slider-wrapper {
  @apply relative;
}

.slider {
  @apply w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer;
}

.slider::-webkit-slider-thumb {
  @apply appearance-none w-5 h-5 rounded-full bg-brand-sage-600 cursor-pointer;
  @apply hover:bg-brand-sage-700 transition-colors;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.slider::-moz-range-thumb {
  @apply w-5 h-5 rounded-full bg-brand-sage-600 cursor-pointer border-0;
}

.slider-track {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: var(--space-2);
  background-color: var(--color-neutral-200);
  border-radius: var(--radius-lg);
  pointer-events: none;
}

.slider-fill {
  @apply h-full bg-gradient-to-r from-brand-sage-400 to-brand-sage-600 rounded-lg transition-all duration-200;
}

.slider-labels {
  @apply flex justify-between;
}

.size-description {
  margin-top: var(--space-2);
  padding: var(--space-3);
  background-color: var(--color-info-50);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-info-200);
}

/* Overlap Buttons */
.overlap-container {
  @apply space-y-3;
}

.overlap-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.overlap-btn {
  @apply px-4 py-2 rounded-lg border-2 transition-all duration-200 cursor-pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.overlap-active {
  @apply border-brand-sage-500 bg-brand-sage-50 text-brand-sage-700;
}

.overlap-inactive {
  @apply border-neutral-200 bg-white hover:border-neutral-300;
}

.overlap-info {
  padding: var(--space-3);
  background-color: var(--color-warning-50);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-warning-200);
}

/* Toggle Switch */
.toggle-container {
  @apply space-y-3;
}

.toggle-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
}

.toggle-switch {
  @apply relative inline-block w-11 h-6 flex-shrink-0;
}

.toggle-switch input {
  @apply opacity-0 w-0 h-0;
}

.toggle-slider {
  @apply absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-neutral-300 rounded-full transition-all duration-200;
}

.toggle-slider:before {
  @apply absolute content-[''] h-5 w-5 left-0.5 bottom-0.5 bg-white rounded-full transition-all duration-200;
}

input:checked + .toggle-slider {
  @apply bg-brand-sage-600;
}

input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.toggle-details {
  @apply mt-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200;
}

.tag-preview {
  @apply flex items-center gap-2 flex-wrap;
}

.sample-tag {
  @apply inline-flex items-center px-2 py-1 rounded-md bg-brand-sage-100 text-brand-sage-700 text-xs;
}

/* Advanced Settings */
.advanced-toggle {
  @apply w-full flex justify-between items-center p-3 bg-neutral-50 rounded-lg border border-neutral-200;
  @apply hover:bg-neutral-100 transition-colors duration-200;
}

.advanced-content {
  @apply mt-4 space-y-4 p-4 bg-white rounded-lg border border-neutral-200;
}

.advanced-field {
  @apply space-y-2;
}

.threshold-slider {
  @apply space-y-2;
}

.threshold-labels {
  @apply flex justify-between items-center;
}

.threshold-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.threshold-value {
  font-size: var(--fluid-text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--brand-sage-700);
}

.recommended-badge {
  @apply inline-flex items-center px-2 py-1 rounded-full bg-[color:var(--color-success-100)] text-[color:var(--color-success-700)];
}

.threshold-explanation {
  @apply mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200;
}

.threshold-hint {
  @apply flex items-start gap-1 p-2 bg-amber-50 rounded-md border border-amber-200 mt-2;
}

.slider.small {
  @apply h-1.5;
}

/* Preview Section */
.preview-section {
  @apply p-4 bg-gradient-to-r from-neutral-50 to-blue-50 rounded-xl border border-neutral-200;
}

.preview-grid {
  @apply grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3;
}

.preview-item {
  @apply flex flex-col gap-1;
}

.preview-label {
  font-size: var(--fluid-text-xs);
  color: var(--color-neutral-500);
  font-weight: var(--font-weight-medium);
}

.preview-value {
  font-size: var(--fluid-text-sm);
  color: var(--color-neutral-900);
  font-weight: var(--font-weight-semibold);
}

/* Responsive Design */
@media (max-width: 768px) {
  .method-grid {
    @apply grid-cols-1;
  }
  
  .overlap-buttons {
    @apply grid grid-cols-2 gap-2;
  }
  
  .overlap-btn {
    @apply text-center py-3;
    min-height: 44px;
  }
  
  .preview-grid {
    @apply grid-cols-2;
  }
  
  .slider {
    height: 44px; /* Better touch target */
  }
  
  .advanced-toggle {
    @apply text-left;
    min-height: 44px;
  }
  
  .toggle-content {
    @apply flex-col items-start gap-3;
  }
  
  .toggle-switch {
    @apply self-start;
  }
}

@media (max-width: 480px) {
  .method-card {
    padding: var(--space-3);
    text-align: center;
  }
  
  .overlap-buttons {
    @apply grid-cols-1 gap-2;
  }
  
  .overlap-btn {
    @apply w-full;
  }
  
  .preview-grid {
    @apply grid-cols-1;
  }
  
  .slider-container {
    @apply space-y-4;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .method-card,
  .overlap-btn,
  .toggle-slider,
  .slider-fill {
    @apply transition-none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .method-card,
  .overlap-btn {
    @apply border-2;
  }
  
  .method-active,
  .overlap-active {
    @apply border-2 border-brand-sage-700;
  }
}
</style>