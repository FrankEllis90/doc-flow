<template>
  <div v-if="!showAll && results.length > 0" class="bg-white border border-neutral-200 rounded-lg p-4 mb-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-neutral-800">Search Results</h3>
      <div class="flex items-center space-x-2 text-sm text-neutral-600">
        <span>{{ results.length }} result{{ results.length === 1 ? '' : 's' }}</span>
        <button
          @click="$emit('clear-search')"
          class="text-neutral-800 hover:text-neutral-600 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>

    <div class="space-y-3 max-h-96 overflow-y-auto">
      <div
        v-for="result in results"
        :key="getResultKey(result)"
        class="border border-neutral-200 rounded-lg p-3 hover:bg-primary-500-5 transition-colors cursor-pointer"
        @click="navigateToResult(result)"
      >
        <!-- Category Result -->
        <div v-if="result.type === 'category'" class="flex items-center space-x-3">
          <div class="flex-shrink-0">
            <svg class="w-5 h-5 text-neutral-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2">
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-500 text-neutral-800">
                Category
              </span>
              <span class="text-sm text-neutral-600">{{ result.categoryName }}</span>
            </div>
            <h4 class="font-medium text-neutral-800 mt-1" v-html="highlightText(result.content, searchQuery)"></h4>
          </div>
          <div class="flex-shrink-0 text-xs text-neutral-600">
            {{ getCategoryQuestionCount(result.categoryId) }} questions
          </div>
        </div>

        <!-- Question Result -->
        <div v-else-if="result.type === 'question'" class="space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-warning-600 text-white">
                {{ result.matchType === 'question' ? 'Question' : result.matchType === 'answer' ? 'Answer' : 'Both' }}
              </span>
              <span class="text-sm text-neutral-600">{{ result.categoryName }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="text-xs text-neutral-600">
                Relevance: {{ result.relevance }}%
              </div>
              <button
                @click.stop="editQuestion(result)"
                class="text-neutral-800 hover:text-neutral-600 transition-colors"
                title="Edit this question"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="space-y-1">
            <div class="font-medium text-neutral-800">
              <span class="text-xs text-neutral-600 mr-2">Q:</span>
              <span v-html="highlightText(result.question, searchQuery)"></span>
            </div>
            <div class="text-neutral-600">
              <span class="text-xs text-neutral-600 mr-2">A:</span>
              <span v-html="highlightText(result.answer, searchQuery)"></span>
            </div>
          </div>
        </div>

        <!-- Relevance Bar -->
        <div v-if="result.relevance > 0" class="mt-2">
          <div class="w-full bg-neutral-100 rounded-full h-1">
            <div 
              class="bg-primary-500 h-1 rounded-full transition-all duration-300"
              :style="{ width: result.relevance + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-if="results.length === 0" class="text-center py-8 text-neutral-600">
      <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
      </svg>
      <p class="text-lg font-medium">No results found</p>
      <p class="text-sm mt-1">Try adjusting your search terms or filters</p>
    </div>
  </div>

  <!-- Quick Actions -->
  <div v-if="!showAll && results.length > 0" class="mb-6">
    <div class="flex flex-wrap gap-2">
      <button
        @click="selectAllResults"
        class="btn-secondary text-sm"
      >
        Select All Results
      </button>
      <button
        @click="exportResults"
        class="btn-primary text-sm"
      >
        Export Results
      </button>
      <button
        v-if="selectedResults.length > 0"
        @click="bulkDeleteResults"
        class="bg-error-600 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
      >
        Delete Selected ({{ selectedResults.length }})
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'SearchResults',
  props: {
    results: {
      type: Array,
      default: () => []
    },
    searchQuery: {
      type: String,
      default: ''
    },
    showAll: {
      type: Boolean,
      default: false
    },
    categories: {
      type: Array,
      required: true
    }
  },
  emits: ['clear-search', 'navigate-to-result', 'edit-question', 'bulk-delete', 'export-results'],
  setup(props, { emit }) {
    const selectedResults = ref([])

    const getResultKey = (result) => {
      if (result.type === 'category') {
        return `category-${result.categoryId}`
      } else if (result.type === 'question') {
        return `question-${result.categoryId}-${result.questionId}`
      }
      return Math.random().toString(36).substr(2, 9)
    }

    const getCategoryQuestionCount = (categoryId) => {
      const category = props.categories.find(c => c.id === categoryId)
      return category ? category.questions.length : 0
    }

    const highlightText = (text, query) => {
      if (!query || !text) return text
      
      // Escape special regex characters in query
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      
      try {
        const regex = new RegExp(`(${escapedQuery})`, 'gi')
        return text.replace(regex, '<mark class="bg-warning-200 bg-opacity-50 px-1 rounded">$1</mark>')
      } catch (e) {
        return text
      }
    }

    const navigateToResult = (result) => {
      emit('navigate-to-result', result)
    }

    const editQuestion = (result) => {
      emit('edit-question', result)
    }

    const selectAllResults = () => {
      selectedResults.value = [...props.results]
    }

    const exportResults = () => {
      const exportData = {
        searchQuery: props.searchQuery,
        timestamp: new Date().toISOString(),
        results: props.results.map(result => ({
          type: result.type,
          categoryName: result.categoryName,
          content: result.content,
          question: result.question,
          answer: result.answer,
          relevance: result.relevance
        }))
      }
      
      emit('export-results', exportData)
    }

    const bulkDeleteResults = () => {
      emit('bulk-delete', selectedResults.value)
    }

    return {
      selectedResults,
      getResultKey,
      getCategoryQuestionCount,
      highlightText,
      navigateToResult,
      editQuestion,
      selectAllResults,
      exportResults,
      bulkDeleteResults
    }
  }
}
</script>

<style scoped>
:deep(mark) {
  background-color: rgba(255, 255, 50, 0.3);
  padding: 0 2px;
  border-radius: 2px;
}
</style>