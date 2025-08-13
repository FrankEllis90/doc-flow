<template>
  <div class="border rounded-lg">
    <button 
      @click="$emit('update:expanded', !expanded)"
      class="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-25 transition-colors"
    >
      <div class="flex items-center space-x-3">
        <div class="text-sm font-medium text-neutral-800">Content Statistics</div>
        <div v-if="stats.wordCount > 0" class="flex items-center space-x-4 text-xs text-neutral-600">
          <span>{{ stats.wordCount }} words</span>
          <span>{{ stats.estimatedChunks }} chunks</span>
        </div>
      </div>
      <svg 
        class="w-5 h-5 text-neutral-600 transition-transform duration-200"
        :class="{ 'rotate-180': expanded }"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>
    
    <div v-show="expanded" class="px-4 pb-4 border-t bg-neutral-25">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 mb-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-primary-600">{{ stats.wordCount }}</div>
          <div class="text-sm text-neutral-600">Words</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-primary-600">{{ stats.charCount }}</div>
          <div class="text-sm text-neutral-600">Characters</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-primary-600">{{ stats.estimatedChunks }}</div>
          <div class="text-sm text-neutral-600">Est. Chunks</div>
        </div>
      </div>
      
      <!-- Content quality indicator -->
      <div v-if="stats.wordCount > 0" class="flex justify-center">
        <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" 
             :class="qualityIndicatorClass">
          <i class="mr-2" :class="qualityIconClass"></i>
          <span>{{ qualityText }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ContentStats {
  wordCount: number
  charCount: number
  estimatedChunks: number
}

interface Props {
  stats: ContentStats
  expanded?: boolean
}

interface Emits {
  'update:expanded': [expanded: boolean]
}

const props = withDefaults(defineProps<Props>(), {
  expanded: false
})

defineEmits<Emits>()

const qualityIndicatorClass = computed(() => {
  const { wordCount } = props.stats
  if (wordCount < 50) return 'bg-error-100 text-error-800'
  if (wordCount < 100) return 'bg-warning-100 text-warning-800'
  if (wordCount < 500) return 'bg-primary-100 text-primary-800'
  return 'bg-success-100 text-success-800'
})

const qualityIconClass = computed(() => {
  const { wordCount } = props.stats
  if (wordCount < 50) return 'fas fa-exclamation-triangle'
  if (wordCount < 100) return 'fas fa-exclamation-circle'
  if (wordCount < 500) return 'fas fa-info-circle'
  return 'fas fa-check-circle'
})

const qualityText = computed(() => {
  const { wordCount } = props.stats
  if (wordCount < 50) return 'Too short'
  if (wordCount < 100) return 'Very short'
  if (wordCount < 500) return 'Good length'
  return 'Excellent'
})
</script>