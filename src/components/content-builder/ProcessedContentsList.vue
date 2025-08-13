<template>
  <div v-if="contents.length > 0" class="space-y-8">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
      <h3 class="text-lg font-semibold text-neutral-900">
        Processed Content ({{ totalChunks }} chunks)
      </h3>
      <button 
        @click="$emit('review-chunks')"
        class="btn btn-primary mobile-full"
      >
        <i class="fas fa-arrow-right mr-2"></i>Review & Export
      </button>
    </div>

    <!-- Content List -->
    <div class="space-y-4 max-h-96 overflow-y-auto scrollbar-thin">
      <div 
        v-for="(content, index) in contents" 
        :key="content.id"
        class="content-card"
      >
        <div class="flex items-start justify-between mb-3">
          <h4 class="font-medium text-neutral-900 truncate flex-1">{{ content.source }}</h4>
          <button 
            @click="$emit('remove-content', index)"
            class="btn btn-ghost btn-sm text-error-600 hover:text-error-700 flex-shrink-0 ml-3"
            :title="`Remove ${content.source}`"
            :aria-label="`Remove processed content: ${content.source}`"
          >
            <i class="fas fa-trash mr-1"></i>
            Remove
          </button>
        </div>
        
        <!-- Statistics Grid -->
        <div class="grid grid-cols-3 gap-4 mb-3 text-center">
          <div>
            <div class="text-lg font-semibold text-primary-600">{{ content.chunks.length }}</div>
            <div class="text-xs text-neutral-600">Chunks</div>
          </div>
          <div>
            <div class="text-lg font-semibold text-primary-600">{{ content.totalWords }}</div>
            <div class="text-xs text-neutral-600">Words</div>
          </div>
          <div>
            <div class="text-lg font-semibold text-primary-600">{{ content.totalTags }}</div>
            <div class="text-xs text-neutral-600">Tags</div>
          </div>
        </div>
        
        <!-- Content Preview -->
        <div class="mb-4">
          <p class="text-sm text-neutral-700 leading-relaxed line-clamp-2">
            {{ content.originalContent.substring(0, 200) }}
            <span v-if="content.originalContent.length > 200">...</span>
          </p>
        </div>
        
        <!-- Tags -->
        <div class="flex flex-wrap gap-2">
          <span 
            v-for="tag in visibleTags(content.allTags)" 
            :key="tag"
            class="badge badge-primary"
          >
            {{ tag }}
          </span>
          <span 
            v-if="content.allTags.length > maxVisibleTags" 
            class="badge badge-outline-secondary"
          >
            +{{ content.allTags.length - maxVisibleTags }} more
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ProcessedContent {
  id: string
  source: string
  chunks: any[]
  totalWords: number
  totalTags: number
  originalContent: string
  allTags: string[]
}

interface Props {
  contents: ProcessedContent[]
  totalChunks: number
  maxVisibleTags?: number
}

interface Emits {
  'remove-content': [index: number]
  'review-chunks': []
}

const props = withDefaults(defineProps<Props>(), {
  maxVisibleTags: 5
})

defineEmits<Emits>()

const visibleTags = (tags: string[]) => {
  return tags.slice(0, props.maxVisibleTags)
}
</script>

<style scoped>
.content-card {
  @apply bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-sm transition-shadow;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: rgb(203 213 225) transparent;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgb(203 213 225);
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background-color: rgb(148 163 184);
}
</style>