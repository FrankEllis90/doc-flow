<template>
  <div class="review-step">
    <div style="display: flex; flex-direction: column; gap: var(--space-6);">

      <!-- Summary Stats & Quick Actions -->
      <div class="summary-header">
        <div class="section-header">
          <div>
            <h3 class="section-title">📊 Content Overview</h3>
            <p class="section-subtitle">{{ sections.length }} sections ready for review</p>
          </div>
        </div>
        
        <div class="summary-stats">
          <div class="stat-grid">
            <div class="stat-item">
              <div class="stat-value">{{ sections.length }}</div>
              <div class="stat-label">Total Sections</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ totalWords }}</div>
              <div class="stat-label">Total Words</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ totalTags }}</div>
              <div class="stat-label">Unique Tags</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ sectionsWithWarnings }}</div>
              <div class="stat-label">Need Review</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Search & Filter Controls -->
      <div class="controls-panel">
        <div class="section-header">
          <h3 class="section-title">🔍 Find & Filter Sections</h3>
        </div>
        
        <div class="controls-grid">
          <!-- Search -->
          <div class="control-group">
            <label for="section-search" class="control-label">Search content</label>
            <div class="search-input-container">
              <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
              <input
                id="section-search"
                v-model="searchQuery"
                type="text"
                class="search-input"
                placeholder="Search sections..."
                @keydown.escape="searchQuery = ''"
              />
              <button
                v-if="searchQuery"
                @click="searchQuery = ''"
                class="search-clear"
                aria-label="Clear search"
              >
                <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Filter by Quality -->
          <div class="control-group">
            <label for="quality-filter" class="control-label">Filter by quality</label>
            <select
              id="quality-filter"
              v-model="qualityFilter"
              class="control-select"
            >
              <option value="all">All sections</option>
              <option value="good">Good quality</option>
              <option value="warnings">Needs review</option>
              <option value="short">Too short</option>
              <option value="long">Too long</option>
            </select>
          </div>

          <!-- Filter by Tags -->
          <div class="control-group">
            <label for="tag-filter" class="control-label">Filter by tags</label>
            <select
              id="tag-filter"
              v-model="tagFilter"
              class="control-select"
            >
              <option value="">All tags</option>
              <option v-for="tag in availableTags" :key="tag" :value="tag">
                {{ tag }}
              </option>
            </select>
          </div>

          <!-- Sort Options -->
          <div class="control-group">
            <label for="sort-option" class="control-label">Sort by</label>
            <select
              id="sort-option"
              v-model="sortBy"
              class="control-select"
            >
              <option value="order">Original order</option>
              <option value="length">Length (words)</option>
              <option value="quality">Quality score</option>
              <option value="tags">Number of tags</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Bulk Operations -->
      <div v-if="selectedSections.length > 0" class="bulk-operations">
        <div class="section-header">
          <h3 class="section-title">⚡ Bulk Actions</h3>
          <p class="section-subtitle">{{ selectedSections.length }} sections selected</p>
        </div>
        
        <div class="bulk-actions">
          <LoadingButton
            @click="mergeSelectedSections"
            :loading="isMerging"
            :disabled="selectedSections.length < 2"
            variant="primary"
            size="sm"
            loading-text="Merging..."
          >
            <svg class="w-4 h-4" style="margin-right: var(--space-2);" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
            Merge ({{ selectedSections.length }})
          </LoadingButton>
          
          <LoadingButton
            @click="deleteSelectedSections"
            :loading="isDeleting"
            variant="danger"
            size="sm"
            loading-text="Deleting..."
          >
            <svg class="w-4 h-4" style="margin-right: var(--space-2);" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd" />
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414L7.586 12l-1.293 1.293a1 1 0 101.414 1.414L9 13.414l1.293 1.293a1 1 0 001.414-1.414L10.414 12l1.293-1.293z" clip-rule="evenodd" />
            </svg>
            Delete ({{ selectedSections.length }})
          </LoadingButton>
          
          <button
            @click="showBulkTagEditor = true"
            class="btn btn-secondary btn-sm"
          >
            <svg class="w-4 h-4" style="margin-right: var(--space-2);" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
            </svg>
            Edit Tags
          </button>
          
          <button
            @click="clearSelection"
            class="btn btn-ghost btn-sm"
          >
            Clear Selection
          </button>
        </div>
      </div>

      <!-- Sections List -->
      <div class="sections-container">
        <div class="section-header" style="margin-bottom: var(--space-4);">
          <div>
            <h3 class="section-title-large">📝 Your Content Sections</h3>
            <p class="section-subtitle">
              {{ filteredSections.length }} of {{ sections.length }} sections
              <span v-if="searchQuery"> matching "{{ searchQuery }}"</span>
            </p>
            <div class="keyboard-shortcuts-hint">
              <p class="text-xs text-[color:var(--color-neutral-500)]">
                <strong>Shortcuts:</strong> Ctrl+K to search • Ctrl+A to select all • M to merge • Delete to remove
              </p>
            </div>
          </div>
          <div class="view-controls">
            <button
              @click="selectAllFiltered"
              class="btn btn-outline btn-sm"
              :disabled="filteredSections.length === 0"
            >
              Select All Visible
            </button>
          </div>
        </div>

        <!-- No Results -->
        <div v-if="filteredSections.length === 0" class="no-results">
          <div class="no-results-content">
            <svg class="no-results-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
            <h4 class="no-results-title">No sections found</h4>
            <p class="no-results-text">
              Try adjusting your search terms or filters to see more sections.
            </p>
            <button @click="clearAllFilters" class="btn btn-primary">
              Clear All Filters
            </button>
          </div>
        </div>

        <!-- Section Cards -->
        <div v-else class="sections-list">
          <div
            v-for="(section, index) in filteredSections"
            :key="section.chunk_id"
            :class="[
              'card', 'section-item',
              selectedSections.includes(section.chunk_id) ? 'section-selected' : '',
              section.isEditing ? 'section-editing' : ''
            ]"
          >
            <!-- Section Header -->
            <div class="card-header section-header">
              <div class="section-left">
                <!-- Selection Checkbox -->
                <label class="section-checkbox">
                  <input
                    type="checkbox"
                    :value="section.chunk_id"
                    v-model="selectedSections"
                    class="checkbox-input"
                  />
                  <span class="checkbox-custom"></span>
                </label>

                <!-- Section Info -->
                <div class="section-info">
                  <div class="section-id">{{ section.chunk_id }}</div>
                  <div class="section-meta">
                    <span class="meta-item">{{ section.metadata.wordCount }} words</span>
                    <span v-if="section.tags.length > 0" class="meta-item">
                      {{ section.tags.length }} tags
                    </span>
                    <span v-if="getSectionQuality(section) !== 'good'" class="meta-warning">
                      {{ getSectionQuality(section) }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="section-right">
                <!-- Quality Indicator -->
                <div class="quality-indicator" :class="`quality-${getSectionQuality(section)}`">
                  <svg v-if="getSectionQuality(section) === 'good'" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </div>

                <!-- Action Buttons -->
                <div class="section-actions">
                  <button
                    @click="toggleEdit(section)"
                    class="btn btn-ghost btn-sm"
                    :class="section.isEditing ? 'btn-primary' : 'btn-ghost'"
                    :aria-label="section.isEditing ? 'Stop editing' : 'Edit section'"
                  >
                    <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  
                  <button
                    @click="splitSection(section)"
                    class="btn btn-ghost btn-sm"
                    :disabled="section.metadata.wordCount < 50"
                    aria-label="Split section"
                  >
                    <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  
                  <button
                    @click="deleteSection(section)"
                    class="btn btn-destructive btn-sm"
                    aria-label="Delete section"
                  >
                    <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd" />
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414L7.586 12l-1.293 1.293a1 1 0 101.414 1.414L9 13.414l1.293 1.293a1 1 0 001.414-1.414L10.414 12l1.293-1.293z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Section Content -->
            <div class="card-body section-content">
              <!-- Editing Mode -->
              <div v-if="section.isEditing" class="edit-mode">
                <div class="edit-form">
                  <div class="edit-field">
                    <label class="edit-label">Content</label>
                    <textarea
                      v-model="section.content"
                      class="edit-textarea"
                      rows="6"
                      @blur="updateWordCount(section)"
                    ></textarea>
                    <div class="edit-help">
                      {{ section.metadata.wordCount }} words
                      <span v-if="section.metadata.wordCount < 50" class="text-[color:var(--color-warning-600)]">
                        • Very short
                      </span>
                      <span v-else-if="section.metadata.wordCount > 1000" class="text-[color:var(--color-warning-600)]">
                        • Very long - consider splitting
                      </span>
                    </div>
                  </div>
                  
                  <div class="edit-field">
                    <label class="edit-label">Tags</label>
                    <input
                      v-model="section.tagsString"
                      type="text"
                      class="edit-input"
                      placeholder="Enter tags separated by commas..."
                      @blur="updateTags(section)"
                    />
                    <div class="edit-help">Separate multiple tags with commas</div>
                  </div>

                  <div class="edit-actions">
                    <button
                      @click="saveEdit(section)"
                      class="btn btn-primary btn-sm"
                    >
                      <svg class="w-4 h-4" style="margin-right: var(--space-2);" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                      Save Changes
                    </button>
                    <button
                      @click="cancelEdit(section)"
                      class="btn btn-secondary btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              <!-- View Mode -->
              <div v-else class="view-mode">
                <div class="section-text">{{ section.content }}</div>
                
                <!-- Tags Display -->
                <div v-if="section.tags.length > 0" class="section-tags">
                  <span
                    v-for="tag in section.tags"
                    :key="tag"
                    class="section-tag"
                  >
                    {{ tag }}
                  </span>
                </div>
                
                <!-- Quality Suggestions -->
                <div v-if="getSectionSuggestions(section).length > 0" class="quality-suggestions">
                  <div class="suggestions-header">
                    <svg class="w-4 h-4 text-[color:var(--color-warning-600)]" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span style="font-size: var(--fluid-text-sm); font-weight: var(--font-weight-medium); color: var(--color-amber-800);">Suggestions</span>
                  </div>
                  <div class="suggestions-list">
                    <button
                      v-for="suggestion in getSectionSuggestions(section)"
                      :key="suggestion.id"
                      @click="applySuggestion(section, suggestion)"
                      class="btn btn-outline btn-sm"
                    >
                      {{ suggestion.text }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import LoadingButton from '@/components/LoadingButton.vue'

// Props & Emits
const props = defineProps<{
  data: {
    source: {
      title: string
      content: string
      file: File | null
    }
    configure: any
    processing: {
      status: string
      chunks: any[]
      stats: any
      logs: any[]
    }
    review: {
      chunks: any[]
      filters: {
        search: string
        tags: string[]
        quality: string
      }
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
const sections = ref<any[]>([])
const selectedSections = ref<string[]>([])
const searchQuery = ref('')
const qualityFilter = ref('all')
const tagFilter = ref('')
const sortBy = ref('order')

// Bulk operations
const showBulkTagEditor = ref(false)

// Loading states
const isDeleting = ref(false)
const isMerging = ref(false)
const isSplitting = ref(false)
const isProcessing = ref(false)

// Backup data for edit cancellation
const editBackups = ref<Map<string, any>>(new Map())

// Computed Properties
const filteredSections = computed(() => {
  let filtered = [...sections.value]
  
  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(section =>
      section.content.toLowerCase().includes(query) ||
      section.chunk_id.toLowerCase().includes(query) ||
      section.tags.some((tag: string) => tag.toLowerCase().includes(query))
    )
  }
  
  // Apply quality filter
  if (qualityFilter.value !== 'all') {
    filtered = filtered.filter(section => {
      const quality = getSectionQuality(section)
      if (qualityFilter.value === 'good') return quality === 'good'
      if (qualityFilter.value === 'warnings') return quality !== 'good'
      if (qualityFilter.value === 'short') return quality === 'short'
      if (qualityFilter.value === 'long') return quality === 'long'
      return true
    })
  }
  
  // Apply tag filter
  if (tagFilter.value) {
    filtered = filtered.filter(section =>
      section.tags.includes(tagFilter.value)
    )
  }
  
  // Apply sorting
  switch (sortBy.value) {
    case 'length':
      filtered.sort((a, b) => b.metadata.wordCount - a.metadata.wordCount)
      break
    case 'quality':
      filtered.sort((a, b) => {
        const qualityA = getSectionQuality(a) === 'good' ? 1 : 0
        const qualityB = getSectionQuality(b) === 'good' ? 1 : 0
        return qualityB - qualityA
      })
      break
    case 'tags':
      filtered.sort((a, b) => b.tags.length - a.tags.length)
      break
    default:
      // Keep original order
      break
  }
  
  return filtered
})

const availableTags = computed(() => {
  const tagSet = new Set<string>()
  sections.value.forEach(section => {
    section.tags.forEach((tag: string) => tagSet.add(tag))
  })
  return Array.from(tagSet).sort()
})

const totalWords = computed(() => {
  return sections.value.reduce((sum, section) => sum + section.metadata.wordCount, 0)
})

const totalTags = computed(() => {
  return availableTags.value.length
})

const sectionsWithWarnings = computed(() => {
  return sections.value.filter(section => getSectionQuality(section) !== 'good').length
})

// Methods
const getSectionQuality = (section: any): 'good' | 'short' | 'long' | 'empty' => {
  if (!section.content || section.content.trim().length === 0) return 'empty'
  if (section.metadata.wordCount < 50) return 'short'
  if (section.metadata.wordCount > 1000) return 'long'
  return 'good'
}

const getSectionSuggestions = (section: any) => {
  const suggestions = []
  const quality = getSectionQuality(section)
  
  if (quality === 'short') {
    suggestions.push({
      id: 'merge',
      text: 'Consider merging with adjacent sections',
      action: 'merge'
    })
  }
  
  if (quality === 'long') {
    suggestions.push({
      id: 'split',
      text: 'Split into smaller sections',
      action: 'split'
    })
  }
  
  if (section.tags.length === 0) {
    suggestions.push({
      id: 'add-tags',
      text: 'Add relevant tags',
      action: 'add-tags'
    })
  }
  
  return suggestions
}

const applySuggestion = (section: any, suggestion: any) => {
  switch (suggestion.action) {
    case 'split':
      splitSection(section)
      break
    case 'add-tags':
      toggleEdit(section)
      break
    case 'merge':
      // Select this section and suggest adjacent ones for merging
      selectedSections.value = [section.chunk_id]
      break
  }
}

const toggleEdit = (section: any) => {
  if (section.isEditing) {
    cancelEdit(section)
  } else {
    // Store backup
    editBackups.value.set(section.chunk_id, {
      content: section.content,
      tagsString: section.tagsString,
      tags: [...section.tags]
    })
    section.isEditing = true
  }
}

const saveEdit = (section: any) => {
  updateWordCount(section)
  updateTags(section)
  section.isEditing = false
  editBackups.value.delete(section.chunk_id)
  updateParentData()
}

const cancelEdit = (section: any) => {
  const backup = editBackups.value.get(section.chunk_id)
  if (backup) {
    section.content = backup.content
    section.tagsString = backup.tagsString
    section.tags = backup.tags
  }
  section.isEditing = false
  editBackups.value.delete(section.chunk_id)
}

const updateWordCount = (section: any) => {
  const words = section.content.trim().split(/\s+/).filter((word: string) => word.length > 0)
  section.metadata.wordCount = words.length
}

const updateTags = (section: any) => {
  section.tags = section.tagsString
    .split(',')
    .map((tag: string) => tag.trim())
    .filter((tag: string) => tag.length > 0)
}

const splitSection = (section: any) => {
  const words = section.content.split(' ')
  if (words.length < 50) return // Too small to split
  
  const midPoint = Math.floor(words.length / 2)
  const firstPart = words.slice(0, midPoint).join(' ')
  const secondPart = words.slice(midPoint).join(' ')
  
  // Update current section with first part
  section.content = firstPart
  updateWordCount(section)
  
  // Create new section with second part
  const newSection = {
    content: secondPart,
    chunk_id: section.chunk_id + '_split',
    metadata: {
      wordCount: secondPart.split(' ').length,
      createdAt: new Date().toISOString()
    },
    tags: [...section.tags],
    tagsString: section.tagsString,
    isEditing: false
  }
  
  // Insert after current section
  const currentIndex = sections.value.findIndex(s => s.chunk_id === section.chunk_id)
  sections.value.splice(currentIndex + 1, 0, newSection)
  
  updateParentData()
}

const deleteSection = (section: any) => {
  if (confirm(`Delete section "${section.chunk_id}"? This cannot be undone.`)) {
    const index = sections.value.findIndex(s => s.chunk_id === section.chunk_id)
    sections.value.splice(index, 1)
    
    // Remove from selection if selected
    const selectionIndex = selectedSections.value.indexOf(section.chunk_id)
    if (selectionIndex > -1) {
      selectedSections.value.splice(selectionIndex, 1)
    }
    
    updateParentData()
  }
}

const mergeSelectedSections = async () => {
  if (selectedSections.value.length < 2 || isMerging.value) return
  
  isMerging.value = true
  
  try {
    // Add small delay for UX feedback
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const sectionsToMerge = sections.value.filter(s => selectedSections.value.includes(s.chunk_id))
    sectionsToMerge.sort((a, b) => sections.value.indexOf(a) - sections.value.indexOf(b))
    
    const mergedContent = sectionsToMerge.map(s => s.content).join('\n\n')
    const mergedTags = [...new Set(sectionsToMerge.flatMap(s => s.tags))]
    
    // Update first selected section
    const primarySection = sectionsToMerge[0]
    primarySection.content = mergedContent
    primarySection.tags = mergedTags
    primarySection.tagsString = mergedTags.join(', ')
    updateWordCount(primarySection)
    
    // Remove other sections
    const idsToRemove = selectedSections.value.slice(1)
    sections.value = sections.value.filter(s => !idsToRemove.includes(s.chunk_id))
    
    // Clear selection
    selectedSections.value = []
    
    updateParentData()
  } finally {
    isMerging.value = false
  }
}

const deleteSelectedSections = async () => {
  if (isDeleting.value) return
  
  if (confirm(`Delete ${selectedSections.value.length} sections? This cannot be undone.`)) {
    isDeleting.value = true
    
    try {
      // Add small delay for UX feedback
      await new Promise(resolve => setTimeout(resolve, 200))
      
      sections.value = sections.value.filter(s => !selectedSections.value.includes(s.chunk_id))
      selectedSections.value = []
      updateParentData()
    } finally {
      isDeleting.value = false
    }
  }
}

const selectAllFiltered = () => {
  selectedSections.value = filteredSections.value.map(s => s.chunk_id)
}

const clearSelection = () => {
  selectedSections.value = []
}

const clearAllFilters = () => {
  searchQuery.value = ''
  qualityFilter.value = 'all'
  tagFilter.value = ''
  sortBy.value = 'order'
}

const updateParentData = () => {
  emit('update:data', {
    ...props.data,
    review: {
      chunks: sections.value,
      filters: {
        search: searchQuery.value,
        tags: tagFilter.value ? [tagFilter.value] : [],
        quality: qualityFilter.value
      }
    }
  })
}

// Keyboard Shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  // Only handle shortcuts when not in an input field
  const isInputFocused = event.target instanceof HTMLInputElement || 
                        event.target instanceof HTMLTextAreaElement ||
                        event.target instanceof HTMLSelectElement

  if (isInputFocused) return

  // Ctrl/Cmd + A: Select all visible sections
  if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
    event.preventDefault()
    selectAllFiltered()
    return
  }

  // Escape: Clear search and selection
  if (event.key === 'Escape') {
    if (selectedSections.value.length > 0) {
      clearSelection()
    } else if (searchQuery.value) {
      clearAllFilters()
    }
    return
  }

  // Delete: Delete selected sections
  if (event.key === 'Delete' && selectedSections.value.length > 0) {
    deleteSelectedSections()
    return
  }

  // Ctrl/Cmd + K: Focus search
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault()
    const searchInput = document.getElementById('section-search')
    if (searchInput) {
      searchInput.focus()
    }
    return
  }

  // M: Merge selected sections
  if (event.key.toLowerCase() === 'm' && selectedSections.value.length >= 2) {
    mergeSelectedSections()
    return
  }
}

// Validation
watch(sections, () => {
  const hasValidSections = sections.value.length > 0
  const hasContent = sections.value.some(s => s.content && s.content.trim().length > 0)
  
  emit('validate', {
    isValid: hasValidSections && hasContent,
    hasErrors: false,
    completed: true,
    errors: {}
  })
}, { deep: true, immediate: true })

// Initialize
onMounted(() => {
  console.group('📋 ReviewStep Initialization Debug')
  console.log('ReviewStep mounted with full data structure:', {
    hasProcessing: !!props.data?.processing,
    processingStatus: props.data?.processing?.status,
    processingChunks: props.data?.processing?.chunks?.length || 0,
    hasReview: !!props.data?.review,
    reviewChunks: props.data?.review?.chunks?.length || 0,
    dataKeys: Object.keys(props.data || {})
  })
  
  // Load sections from processing step
  if (props.data?.processing?.chunks && props.data.processing.chunks.length > 0) {
    console.log('✅ Loading sections from processing data:', props.data.processing.chunks.length)
    console.log('First chunk sample:', {
      chunk_id: props.data.processing.chunks[0]?.chunk_id,
      content: props.data.processing.chunks[0]?.content?.substring(0, 100) + '...',
      keys: Object.keys(props.data.processing.chunks[0] || {})
    })
    
    sections.value = props.data.processing.chunks.map(chunk => ({
      ...chunk,
      isEditing: false
    }))
    
    // Immediately update parent data
    updateParentData()
    console.log('📤 Updated parent data with review chunks')
  } else {
    console.warn('⚠️ No processing chunks found to load into review')
  }
  console.groupEnd()
  
  // Load existing review data if available
  if (props.data?.review?.chunks && props.data.review.chunks.length > 0) {
    console.log('Loading sections from review data:', props.data.review.chunks.length)
    sections.value = props.data.review.chunks.map(chunk => ({
      ...chunk,
      isEditing: false
    }))
  }
  
  // If no data available, provide empty state
  if (!sections.value.length) {
    console.log('No sections found, initializing empty state')
  }
  
  // Restore filters
  if (props.data?.review?.filters) {
    searchQuery.value = props.data.review.filters.search || ''
    qualityFilter.value = props.data.review.filters.quality || 'all'
    if (props.data.review.filters.tags && props.data.review.filters.tags.length > 0) {
      tagFilter.value = props.data.review.filters.tags[0]
    }
  }

  // Add keyboard shortcuts
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  // Clean up keyboard shortcuts
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>

.step-requirements {
  background-color: var(--color-warning-50);
  border: 1px solid var(--color-warning-200);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
}

/* Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
  margin-bottom: var(--space-3);
}

.section-title {
  @apply text-base font-bold text-[color:var(--color-neutral-900)];
}

.section-title-large {
  font-size: var(--fluid-text-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-neutral-900);
}

.section-subtitle {
  font-size: var(--fluid-text-sm);
  color: var(--color-neutral-600);
  margin-top: var(--space-1);
}

/* Summary Stats */
.summary-header {
  padding: var(--space-5);
  background-color: var(--surface-primary);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.summary-stats {
  margin-top: var(--space-4);
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}

@media (min-width: 640px) {
  .stat-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.stat-item {
  text-align: center;
  padding: var(--space-3);
  background-color: var(--color-neutral-50);
  border-radius: var(--radius-lg);
}

.stat-value {
  @apply text-2xl font-bold text-[color:var(--color-neutral-900)];
}

.stat-label {
  font-size: var(--fluid-text-sm);
  color: var(--color-neutral-600);
  margin-top: var(--space-1);
}

/* Controls Panel */
.controls-panel {
  padding: var(--space-5);
  background-color: var(--surface-primary);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: var(--space-4);
  margin-top: var(--space-4);
}

@media (min-width: 768px) {
  .controls-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .controls-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.control-label {
  display: block;
  font-size: var(--fluid-text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-900);
}

.search-input-container {
  @apply relative;
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: var(--color-neutral-400);
}

.search-input {
  width: 100%;
  padding-left: 2.5rem;
  padding-right: 2.5rem;
  padding-top: var(--space-3);
  padding-bottom: var(--space-3);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-lg);
  color: var(--color-neutral-900);
  @apply focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200;
  min-height: 44px;
  line-height: 1.5;
}

.search-clear {
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-neutral-400);
  transition: color 0.2s;
}

.search-clear:hover {
  color: var(--color-neutral-600);
}

.control-select {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-lg);
  color: var(--color-neutral-900);
  @apply focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
}

/* Bulk Operations */
.bulk-operations {
  padding: var(--space-4);
  background: linear-gradient(to right, var(--color-info-50), var(--color-info-100));
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-info-200);
}

.bulk-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

/* Bulk buttons now use design system .btn classes */

/* Sections Container */
.sections-container {
  @apply space-y-4;
}

.view-controls {
  display: flex;
  gap: var(--space-2);
}

/* View buttons now use design system .btn classes */

.tab-button:hover {
  color: var(--color-neutral-900);
  background: var(--color-neutral-100);
}

/* No Results */
.no-results {
  display: flex;
  justify-content: center;
  padding: var(--space-12) 0;
}

.no-results-content {
  @apply text-center max-w-sm;
}

.no-results-icon {
  width: var(--space-12);
  height: var(--space-12);
  color: var(--color-neutral-400);
  margin: 0 auto var(--space-4) auto;
}

.no-results-title {
  font-size: var(--fluid-text-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-900);
  margin-bottom: var(--space-2);
}

.no-results-text {
  color: var(--color-neutral-600);
  margin-bottom: var(--space-4);
}

/* No results button now uses design system .btn classes */

/* Section Cards */
.sections-list {
  @apply space-y-4;
}

/* Section cards now use design system .card class */
.section-item {
  transition: all var(--transition-standard);
}

.section-item:hover {
  box-shadow: var(--shadow-md);
}

.section-selected {
  @apply ring-2 ring-blue-500 border-blue-500;
}

.section-editing {
  @apply ring-2 ring-purple-500 border-purple-500;
}

/* Section headers now use .card-header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.section-left {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
}

.section-checkbox {
  @apply relative flex items-center cursor-pointer;
}

.checkbox-input {
  @apply sr-only;
}

.checkbox-custom {
  @apply w-5 h-5 border-2 border-neutral-300 rounded transition-all duration-200;
}

.checkbox-input:checked + .checkbox-custom {
  @apply bg-blue-600 border-blue-600;
}

.checkbox-input:checked + .checkbox-custom:after {
  content: '✓';
  @apply absolute inset-0 flex items-center justify-center text-white text-xs font-bold;
}

.section-info {
  @apply space-y-1;
}

.section-id {
  font-size: var(--fluid-text-sm);
  font-family: var(--font-family-mono);
  color: var(--color-neutral-600);
  background: var(--color-neutral-100);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

.section-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--font-size-xs);
  color: var(--color-neutral-500);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.meta-warning {
  color: var(--color-amber-600);
  font-weight: var(--font-weight-medium);
}

.section-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.quality-indicator {
  @apply flex items-center justify-center w-8 h-8 rounded-full;
}

.quality-good {
  @apply bg-[color:var(--color-success-100)] text-[color:var(--color-success-600)];
}

.quality-short,
.quality-long,
.quality-empty {
  @apply bg-[color:var(--color-warning-100)] text-[color:var(--color-warning-600)];
}

.section-actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

/* Action buttons now use design system .btn classes */

/* Section Content */
.section-content {
  padding: var(--space-5);
}

/* Edit Mode */
.edit-mode {
  @apply space-y-4;
}

.edit-form {
  @apply space-y-4;
}

.edit-field {
  @apply space-y-2;
}

.edit-label {
  display: block;
  font-size: var(--fluid-text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-900);
}

.edit-textarea {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-lg);
  color: var(--color-neutral-900);
  @apply focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200;
  @apply resize-y min-h-[120px];
}

.edit-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-lg);
  color: var(--color-neutral-900);
  @apply focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200;
}

.edit-help {
  @apply text-xs text-[color:var(--color-neutral-500)];
}

.edit-actions {
  @apply flex gap-3 pt-4 border-t border-neutral-200;
}

/* Edit buttons now use design system .btn classes */

/* View Mode */
.view-mode {
  @apply space-y-4;
}

.section-text {
  @apply text-[color:var(--color-neutral-800)] leading-relaxed;
}

.section-tags {
  @apply flex flex-wrap gap-2;
}

.section-tag {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  background: var(--color-purple-100);
  color: var(--color-purple-700);
  font-size: var(--fluid-text-sm);
  font-weight: var(--font-weight-medium);
}

/* Quality Suggestions */
.quality-suggestions {
  @apply mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200;
}

.suggestions-header {
  @apply flex items-center gap-2 mb-2;
}

.suggestions-list {
  @apply flex flex-wrap gap-2;
}

/* Suggestion buttons now use design system .btn classes */

/* Screen reader only */
.sr-only {
  @apply absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .controls-grid {
    @apply grid-cols-1;
  }
  
  .stat-grid {
    @apply grid-cols-2;
  }
  
  .bulk-actions {
    @apply flex-col gap-2;
  }
  
  .bulk-actions .btn {
    @apply w-full;
    min-height: 44px;
  }
  
  .section-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
  
  .section-right {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    width: 100%;
  }
  
  .section-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  
  .section-actions .btn {
    flex: 1;
    min-width: 120px;
    min-height: 44px;
  }
  
  .search-input {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}

@media (max-width: 480px) {
  .stat-grid {
    @apply grid-cols-1;
  }
  
  .section-actions .btn {
    @apply w-full;
    min-width: auto;
  }
  
  .section-content {
    padding: var(--space-3);
  }
  
  .section-preview {
    max-height: 100px;
    font-size: var(--fluid-text-sm);
  }
}

/* Animations */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-item {
  animation: fade-in 0.3s ease-out;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .section-item,
  .btn {
    transition: none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .section-item,
  .btn {
    border-width: 2px;
  }
  
  .section-selected {
    @apply border-4 border-blue-700;
  }
}
</style>