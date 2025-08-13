<template>
  <div class="card-primary">
    <div class="card-body">
      <h3 class="text-lg font-semibold mb-4 text-neutral-900">Enter Complete Content</h3>
      <p class="text-sm mb-4 text-neutral-600">
        Paste or type your full content below. The system will automatically break it into optimal chunks and suggest tags.
      </p>
  
      <div class="space-y-8">
        <!-- Source/Title using FormField component -->
        <FormField
          :model-value="formData.source"
          @update:model-value="updateForm({ source: $event })"
          label="Source/Title"
          placeholder="e.g., User Manual, Product Guide, FAQ Section, Documentation"
          required
          :validation-state="sourceValidation?.isValid === false ? 'error' : (sourceValidation?.isValid && formData.source.length > 0 ? 'success' : null)"
          :error-message="sourceValidation?.errors?.[0]"
          success-message="Source title looks good"
          :min-length="2"
          :max-length="200"
          show-char-count
          @blur="$emit('validate-source')"
          @input="$emit('clear-source-validation')"
        />
        
        <!-- Content Input using FormField component -->
        <FormField
          :model-value="formData.content"
          @update:model-value="updateForm({ content: $event })"
          type="textarea"
          label="Content"
          placeholder="Paste your full content here. This can be a complete article, documentation section, FAQ, or any other text content. The system will automatically break it into optimal chunks for AI processing..."
          :rows="12"
          required
          :validation-state="contentValidation?.isValid === false ? 'error' : (contentValidation?.isValid && formData.content.length > 0 ? 'success' : null)"
          :error-message="contentValidation?.errors?.[0]"
          success-message="Content is ready for processing"
          :min-length="10"
          :max-length="1000000"
          show-char-count
          @input="handleContentInput"
          @blur="$emit('validate-content')"
        />
      
        <!-- Content Statistics Display -->
        <ContentStatsDisplay
          :stats="formData.stats"
          :expanded="showContentStats"
          @update:expanded="showContentStats = $event"
        />

        <!-- Chunking Options Panel -->
        <ChunkingOptionsPanel
          :model-value="chunkingOptions"
          @update:model-value="$emit('update:chunkingOptions', $event)"
          :show-advanced="showAdvancedChunking"
          @update:show-advanced="showAdvancedChunking = $event"
        />

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 pt-4 border-t border-neutral-200">
          <div class="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div class="text-sm text-neutral-600">
              {{ processedContentsCount }} content pieces processed
            </div>
            <div v-if="lastSaved" class="flex items-center text-xs text-neutral-500">
              <i class="fas fa-save mr-1"></i>
              Saved {{ formatTimeAgo(lastSaved) }}
            </div>
          </div>
          <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <button 
              @click="$emit('clear-form')"
              class="btn btn-secondary mobile-full"
              :title="`Clear Form (${formatShortcut('Ctrl+K')})`"
            >
              Clear Form
              <span class="ml-2 text-xs opacity-70 hidden sm:inline">Ctrl+K</span>
            </button>
            <button 
              @click="handleProcessContent"
              :disabled="!canProcess || processing"
              class="btn btn-primary mobile-full disabled:opacity-50 disabled:cursor-not-allowed"
              :title="`Process Content (${formatShortcut('Ctrl+Enter')})`"
            >
              <i v-if="!processing" class="fas fa-cogs mr-2"></i>
              <i v-else class="fas fa-spinner fa-spin mr-2"></i>
              {{ processing ? 'Processing...' : 'Process Content' }}
              <span class="ml-2 text-xs opacity-70 hidden sm:inline">Ctrl+↵</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import FormField from '../FormField.vue'
import ContentStatsDisplay from './ContentStatsDisplay.vue'
import ChunkingOptionsPanel from './ChunkingOptionsPanel.vue'

interface ContentStats {
  wordCount: number
  charCount: number
  estimatedChunks: number
}

interface ContentFormData {
  source: string
  content: string
  stats: ContentStats
}

interface ChunkingOptions {
  chunkSize: number
  overlap: number
  autoTag: boolean
}

interface ValidationResult {
  isValid: boolean
  errors?: string[]
}

interface Props {
  formData: ContentFormData
  chunkingOptions: ChunkingOptions
  processing?: boolean
  lastSaved?: Date
  processedContentsCount?: number
  sourceValidation?: ValidationResult
  contentValidation?: ValidationResult
}

interface Emits {
  'update:formData': [data: ContentFormData]
  'update:chunkingOptions': [options: ChunkingOptions]
  'process-content': [formData: ContentFormData, options: ChunkingOptions]
  'clear-form': []
  'validate-source': []
  'validate-content': []
  'clear-source-validation': []
  'update-content-stats': [content: string]
}

const props = withDefaults(defineProps<Props>(), {
  processing: false,
  processedContentsCount: 0
})

const emit = defineEmits<Emits>()

// Local reactive state
const showContentStats = ref(false)
const showAdvancedChunking = ref(false)

const canProcess = computed(() => 
  props.formData.source.trim().length > 0 && 
  props.formData.content.trim().length >= 10 &&
  !props.processing
)

const updateForm = (updates: Partial<ContentFormData>) => {
  emit('update:formData', { ...props.formData, ...updates })
}

const handleContentInput = (content: string) => {
  updateForm({ content })
  emit('update-content-stats', content)
}

const handleProcessContent = () => {
  if (canProcess.value) {
    emit('process-content', props.formData, props.chunkingOptions)
  }
}

const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

const formatShortcut = (shortcut: string): string => shortcut
</script>