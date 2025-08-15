<template>
  <div class="bg-white/90 backdrop-blur-sm border border-neutral-200 rounded-xl p-4 sm:p-5 mb-4 sm:mb-6 shadow-sm">
    <div class="flex flex-col lg:flex-row gap-3 sm:gap-4">
      <!-- Search Input -->
      <div class="flex-1">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search questions, answers, or categories..."
            class="input-field pl-10 pr-10 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            @input="onSearchInput"
            @keydown.escape="clearSearch"
            @focus="$emit('search-focused', true)"
            @blur="$emit('search-focused', false)"
            ref="searchInput"
          />
          <div v-if="searchQuery" class="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              @click="clearSearch"
              class="text-neutral-600 hover:text-neutral-800 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:items-center">
        <!-- Category Filter -->
        <select
          v-model="selectedCategory"
          class="text-sm border border-neutral-200 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full sm:w-auto"
        >
          <option value="">All Categories</option>
          <option v-for="category in allCategories" :key="category.id" :value="category.id">
            {{ category.name }} ({{ category.questions.length }})
          </option>
        </select>

        <!-- Content Type Filter -->
        <select
          v-model="contentType"
          class="text-sm border border-neutral-200 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full sm:w-auto"
        >
          <option value="all">All Content</option>
          <option value="questions">Questions Only</option>
          <option value="answers">Answers Only</option>
          <option value="categories">Categories Only</option>
        </select>

        <!-- Sort Order -->
        <select
          v-model="sortOrder"
          class="text-sm border border-neutral-200 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full sm:w-auto"
        >
          <option value="relevance">Sort by Relevance</option>
          <option value="alphabetical">Sort A-Z</option>
          <option value="category">Sort by Category</option>
          <option value="length">Sort by Length</option>
        </select>

        <!-- Clear Filters -->
        <button
          v-if="hasActiveFilters"
          @click="clearFilters"
          class="text-sm bg-neutral-100 text-neutral-800 px-3 py-2 rounded hover:bg-neutral-200 transition-colors w-full sm:w-auto"
        >
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Search Results Summary -->
    <div v-if="searchQuery || hasActiveFilters" class="mt-4 pt-4 border-t border-neutral-100">
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm gap-2">
        <div class="text-neutral-600">
          <span v-if="searchQuery">
            Found {{ totalResults }} result{{ totalResults === 1 ? '' : 's' }} for "{{ searchQuery }}"
          </span>
          <span v-else>
            Showing {{ totalResults }} filtered result{{ totalResults === 1 ? '' : 's' }}
          </span>
        </div>
        <div class="flex items-center space-x-2">
          <!-- Quick Filter Tags -->
          <div class="flex flex-wrap gap-1">
            <span v-if="selectedCategory" class="inline-flex items-center px-2 py-1 rounded text-xs bg-primary-100 text-neutral-800">
              Category: {{ getCategoryName(selectedCategory) }}
              <button @click="selectedCategory = ''" class="ml-1 hover:text-neutral-600">×</button>
            </span>
            <span v-if="contentType !== 'all'" class="inline-flex items-center px-2 py-1 rounded text-xs bg-primary-100 text-neutral-800">
              {{ contentTypeLabel }}
              <button @click="contentType = 'all'" class="ml-1 hover:text-neutral-600">×</button>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Advanced Search Toggle -->
    <div class="mt-4">
      <button
        @click="showAdvanced = !showAdvanced"
        class="text-sm text-neutral-600 hover:text-neutral-800 transition-colors flex items-center space-x-1"
      >
        <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-90': showAdvanced }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
        <span>Advanced Search</span>
      </button>
    </div>

    <!-- Advanced Search Options -->
    <div v-if="showAdvanced" class="mt-4 p-4 sm:p-5 bg-primary-50/50 rounded-xl border border-primary-200/60 backdrop-blur-sm">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <!-- Search Options -->
        <div>
          <h4 class="text-sm font-medium text-neutral-800 mb-2">Search Options</h4>
          <div class="space-y-2">
            <label class="flex items-center space-x-2">
              <input v-model="searchOptions.caseSensitive" type="checkbox" class="rounded border-neutral-200 focus:ring-primary-500">
              <span class="text-sm text-neutral-800">Case sensitive</span>
            </label>
            <label class="flex items-center space-x-2">
              <input v-model="searchOptions.wholeWords" type="checkbox" class="rounded border-neutral-200 focus:ring-primary-500">
              <span class="text-sm text-neutral-800">Whole words only</span>
            </label>
            <label class="flex items-center space-x-2">
              <input v-model="searchOptions.regex" type="checkbox" class="rounded border-neutral-200 focus:ring-primary-500">
              <span class="text-sm text-neutral-800">Regular expressions</span>
            </label>
          </div>
        </div>

        <!-- Content Filters -->
        <div>
          <h4 class="text-sm font-medium text-neutral-800 mb-2">Content Filters</h4>
          <div class="space-y-2">
            <div class="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
              <label class="text-sm text-neutral-800 whitespace-nowrap">Min length:</label>
              <input v-model.number="contentFilters.minLength" type="number" min="0" class="w-full sm:w-20 text-sm border border-neutral-200 rounded px-2 py-1">
            </div>
            <div class="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
              <label class="text-sm text-neutral-800 whitespace-nowrap">Max length:</label>
              <input v-model.number="contentFilters.maxLength" type="number" min="0" class="w-full sm:w-20 text-sm border border-neutral-200 rounded px-2 py-1">
            </div>
            <label class="flex items-center space-x-2">
              <input v-model="contentFilters.emptyContent" type="checkbox" class="rounded border-neutral-200 focus:ring-primary-500">
              <span class="text-sm text-neutral-800">Show empty content</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'SearchFilter',
  props: {
    categories: {
      type: Array,
      required: true
    }
  },
  emits: ['search-results', 'search-focused'],
  setup(props, { emit }) {
    const searchQuery = ref('')
    const selectedCategory = ref('')
    const contentType = ref('all')
    const sortOrder = ref('relevance')
    const showAdvanced = ref(false)
    const searchOptions = ref({
      caseSensitive: false,
      wholeWords: false,
      regex: false
    })
    const contentFilters = ref({
      minLength: 0,
      maxLength: 0,
      emptyContent: false
    })
    
    // Template refs
    const searchInput = ref(null)

    const allCategories = computed(() => props.categories || [])

    const hasActiveFilters = computed(() => {
      return selectedCategory.value || 
             contentType.value !== 'all' || 
             sortOrder.value !== 'relevance' ||
             searchOptions.value.caseSensitive ||
             searchOptions.value.wholeWords ||
             searchOptions.value.regex ||
             contentFilters.value.minLength > 0 ||
             contentFilters.value.maxLength > 0 ||
             contentFilters.value.emptyContent
    })

    const contentTypeLabel = computed(() => {
      const labels = {
        'questions': 'Questions',
        'answers': 'Answers',
        'categories': 'Categories'
      }
      return labels[contentType.value] || 'All Content'
    })

    const getCategoryName = (categoryId) => {
      const category = allCategories.value.find(c => c.id === categoryId)
      return category ? category.name : 'Unknown'
    }

    const performSearch = () => {
      const results = []
      const query = searchQuery.value.trim()
      
      // If no search query and no filters, return all
      if (!query && !hasActiveFilters.value) {
        emit('search-results', {
          results: [],
          query: '',
          total: 0,
          showAll: true
        })
        return
      }

      allCategories.value.forEach(category => {
        // Filter by selected category
        if (selectedCategory.value && category.id !== selectedCategory.value) {
          return
        }

        // Search in category name
        if (contentType.value === 'all' || contentType.value === 'categories') {
          if (matchesSearch(category.name, query)) {
            results.push({
              type: 'category',
              categoryId: category.id,
              categoryName: category.name,
              content: category.name,
              relevance: calculateRelevance(category.name, query)
            })
          }
        }

        // Search in questions and answers
        if (contentType.value === 'all' || contentType.value === 'questions' || contentType.value === 'answers') {
          category.questions.forEach(question => {
            let matches = false
            let matchType = ''
            let content = ''
            let relevance = 0

            if (contentType.value === 'all' || contentType.value === 'questions') {
              if (matchesSearch(question.question, query)) {
                matches = true
                matchType = 'question'
                content = question.question
                relevance = calculateRelevance(question.question, query)
              }
            }

            if (contentType.value === 'all' || contentType.value === 'answers') {
              if (matchesSearch(question.answer, query)) {
                matches = true
                matchType = matchType ? 'both' : 'answer'
                content = matchType === 'both' ? `${question.question} | ${question.answer}` : question.answer
                relevance = Math.max(relevance, calculateRelevance(question.answer, query))
              }
            }

            // Apply content filters
            if (matches && passesContentFilters(question)) {
              results.push({
                type: 'question',
                categoryId: category.id,
                categoryName: category.name,
                questionId: question.id,
                question: question.question,
                answer: question.answer,
                content,
                matchType,
                relevance
              })
            }
          })
        }
      })

      // Sort results
      const sortedResults = sortResults(results)

      emit('search-results', {
        results: sortedResults,
        query: searchQuery.value,
        total: sortedResults.length,
        showAll: false
      })
    }

    const matchesSearch = (text, query) => {
      if (!query) return true
      
      let searchText = text
      let searchQuery = query

      if (!searchOptions.value.caseSensitive) {
        searchText = searchText.toLowerCase()
        searchQuery = searchQuery.toLowerCase()
      }

      if (searchOptions.value.regex) {
        try {
          const regex = new RegExp(searchQuery, searchOptions.value.caseSensitive ? 'g' : 'gi')
          return regex.test(searchText)
        } catch (e) {
          // Invalid regex, fall back to simple search
          return searchText.includes(searchQuery)
        }
      }

      if (searchOptions.value.wholeWords) {
        const regex = new RegExp(`\\b${searchQuery}\\b`, searchOptions.value.caseSensitive ? 'g' : 'gi')
        return regex.test(searchText)
      }

      return searchText.includes(searchQuery)
    }

    const calculateRelevance = (text, query) => {
      if (!query) return 0
      
      const searchText = searchOptions.value.caseSensitive ? text : text.toLowerCase()
      const searchQuery = searchOptions.value.caseSensitive ? query : query.toLowerCase()
      
      // Exact match gets highest score
      if (searchText === searchQuery) return 100
      
      // Starts with query gets high score
      if (searchText.startsWith(searchQuery)) return 80
      
      // Contains query gets medium score
      if (searchText.includes(searchQuery)) return 60
      
      // Fuzzy match gets lower score
      const words = searchQuery.split(' ')
      let score = 0
      words.forEach(word => {
        if (searchText.includes(word)) score += 20
      })
      
      return score
    }

    const passesContentFilters = (question) => {
      if (contentFilters.value.minLength > 0) {
        const totalLength = question.question.length + question.answer.length
        if (totalLength < contentFilters.value.minLength) return false
      }

      if (contentFilters.value.maxLength > 0) {
        const totalLength = question.question.length + question.answer.length
        if (totalLength > contentFilters.value.maxLength) return false
      }

      if (!contentFilters.value.emptyContent) {
        if (!question.question.trim() || !question.answer.trim()) return false
      }

      return true
    }

    const sortResults = (results) => {
      switch (sortOrder.value) {
        case 'relevance':
          return results.sort((a, b) => b.relevance - a.relevance)
        case 'alphabetical':
          return results.sort((a, b) => a.content.localeCompare(b.content))
        case 'category':
          return results.sort((a, b) => {
            const categoryCompare = a.categoryName.localeCompare(b.categoryName)
            return categoryCompare === 0 ? a.content.localeCompare(b.content) : categoryCompare
          })
        case 'length':
          return results.sort((a, b) => b.content.length - a.content.length)
        default:
          return results
      }
    }

    const totalResults = computed(() => {
      // This will be updated by the search results
      return 0
    })

    const clearSearch = () => {
      searchQuery.value = ''
      performSearch()
    }

    const clearFilters = () => {
      selectedCategory.value = ''
      contentType.value = 'all'
      sortOrder.value = 'relevance'
      searchOptions.value = {
        caseSensitive: false,
        wholeWords: false,
        regex: false
      }
      contentFilters.value = {
        minLength: 0,
        maxLength: 0,
        emptyContent: false
      }
      performSearch()
    }

    const onSearchInput = () => {
      // Debounce search to avoid too many calls
      clearTimeout(onSearchInput.timeout)
      onSearchInput.timeout = setTimeout(performSearch, 300)
    }

    // Watch for changes in filters
    watch([selectedCategory, contentType, sortOrder, searchOptions, contentFilters], performSearch, { deep: true })

    // Watch for changes in categories
    watch(() => props.categories, performSearch, { deep: true })

    // Initial search
    performSearch()
    
    // Expose methods for parent component
    const focusSearch = () => {
      if (searchInput.value) {
        searchInput.value.focus()
        searchInput.value.select()
      }
    }

    return {
      searchQuery,
      selectedCategory,
      contentType,
      sortOrder,
      showAdvanced,
      searchOptions,
      contentFilters,
      allCategories,
      hasActiveFilters,
      contentTypeLabel,
      totalResults,
      searchInput,
      getCategoryName,
      clearSearch,
      clearFilters,
      onSearchInput,
      focusSearch
    }
  }
}
</script>