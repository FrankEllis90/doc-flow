<template>
  <div v-if="selectedItems.length > 0" class="bg-primary-50/70 border border-primary-200 rounded-xl p-5 mb-6 backdrop-blur-sm shadow-sm">
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
      <!-- Selection Summary -->
      <div class="flex items-center space-x-3">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="font-medium text-primary-700">
            {{ selectedItems.length }} item{{ selectedItems.length === 1 ? '' : 's' }} selected
          </span>
        </div>
        <div class="text-sm text-neutral-600">
          {{ selectionSummary }}
        </div>
      </div>

      <!-- Bulk Actions -->
      <div class="flex flex-wrap gap-3">
        <!-- Select All / Deselect All -->
        <button
          @click="toggleSelectAll"
          class="btn-secondary text-sm"
        >
          {{ allSelected ? 'Deselect All' : 'Select All' }}
        </button>

        <!-- Export Selected -->
        <button
          @click="exportSelected"
          class="btn-primary text-sm"
        >
          Export Selected
        </button>

        <!-- Duplicate Selected -->
        <button
          v-if="canDuplicate"
          @click="duplicateSelected"
          class="bg-warning-600 text-white px-3 py-1 rounded text-sm hover:bg-warning-700 transition-colors"
        >
          Duplicate
        </button>

        <!-- Move to Category -->
        <div class="relative" v-if="canMove">
          <button
            @click="showMoveMenu = !showMoveMenu"
            class="bg-secondary-600 text-white px-3 py-1 rounded text-sm hover:bg-secondary-700 transition-colors flex items-center space-x-1"
          >
            <span>Move to Category</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          
          <!-- Move Menu -->
          <div v-if="showMoveMenu" class="absolute top-full left-0 mt-1 bg-white border border-neutral-200 rounded shadow-lg z-10 min-w-48">
            <div class="py-1 max-h-48 overflow-y-auto">
              <button
                v-for="category in availableCategories"
                :key="category.id"
                @click="moveToCategory(category.id)"
                class="block w-full text-left px-4 py-2 text-sm text-neutral-800 hover:bg-primary-50 transition-colors"
              >
                {{ category.name }} ({{ category.questions.length }} questions)
              </button>
            </div>
          </div>
        </div>

        <!-- Bulk Edit -->
        <button
          v-if="canEdit"
          @click="showBulkEdit = true"
          class="bg-neutral-800 text-white px-3 py-1 rounded text-sm hover:bg-neutral-700 transition-colors"
        >
          Bulk Edit
        </button>

        <!-- Delete Selected -->
        <button
          @click="deleteSelected"
          class="bg-error-600 text-white px-3 py-1 rounded text-sm hover:bg-error-700 transition-colors"
        >
          Delete Selected
        </button>

        <!-- Clear Selection -->
        <button
          @click="clearSelection"
          class="text-neutral-600 hover:text-neutral-800 transition-colors px-3 py-1 rounded text-sm border border-neutral-200"
        >
          Clear Selection
        </button>
      </div>
    </div>
  </div>

  <!-- Bulk Edit Modal -->
  <div v-if="showBulkEdit" class="fixed inset-0 bg-neutral-800 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-neutral-800">Bulk Edit {{ selectedItems.length }} Items</h3>
        <button
          @click="showBulkEdit = false"
          class="text-neutral-400 hover:text-neutral-600"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <!-- Edit Options -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 class="text-sm font-medium text-neutral-800 mb-2">Edit Options</h4>
            <div class="space-y-2">
              <label class="flex items-center space-x-2">
                <input v-model="bulkEditOptions.questions" type="checkbox" class="rounded border-neutral-200 focus:ring-primary-500">
                <span class="text-sm text-neutral-800">Edit questions</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="bulkEditOptions.answers" type="checkbox" class="rounded border-neutral-200 focus:ring-primary-500">
                <span class="text-sm text-neutral-800">Edit answers</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="bulkEditOptions.categories" type="checkbox" class="rounded border-neutral-200 focus:ring-primary-500">
                <span class="text-sm text-neutral-800">Edit categories</span>
              </label>
            </div>
          </div>

          <div>
            <h4 class="text-sm font-medium text-neutral-800 mb-2">Edit Type</h4>
            <div class="space-y-2">
              <label class="flex items-center space-x-2">
                <input v-model="bulkEditType" value="replace" type="radio" class="border-neutral-200 focus:ring-primary-500">
                <span class="text-sm text-neutral-800">Replace text</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="bulkEditType" value="prepend" type="radio" class="border-neutral-200 focus:ring-primary-500">
                <span class="text-sm text-neutral-800">Prepend text</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="bulkEditType" value="append" type="radio" class="border-neutral-200 focus:ring-primary-500">
                <span class="text-sm text-neutral-800">Append text</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Find and Replace -->
        <div v-if="bulkEditType === 'replace'" class="space-y-2">
          <div>
            <label class="block text-sm font-medium text-neutral-800 mb-1">Find</label>
            <input v-model="bulkEditFind" type="text" class="input-field" placeholder="Text to find">
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-800 mb-1">Replace with</label>
            <input v-model="bulkEditReplace" type="text" class="input-field" placeholder="Replacement text">
          </div>
        </div>

        <!-- Prepend/Append Text -->
        <div v-if="bulkEditType === 'prepend' || bulkEditType === 'append'" class="space-y-2">
          <div>
            <label class="block text-sm font-medium text-neutral-800 mb-1">
              Text to {{ bulkEditType }}
            </label>
            <textarea v-model="bulkEditText" rows="3" class="textarea-field" :placeholder="`Text to ${bulkEditType}`"></textarea>
          </div>
        </div>

        <!-- Preview -->
        <div class="bg-primary-500-5 border border-primary-200 rounded p-3">
          <h4 class="text-sm font-medium text-neutral-800 mb-2">Preview (first 3 items)</h4>
          <div class="space-y-2 text-sm">
            <div v-for="(item, index) in previewItems" :key="index" class="bg-white rounded p-2">
              <div class="font-medium text-neutral-800">{{ item.category }}</div>
              <div class="text-neutral-600">{{ item.question }}</div>
              <div class="text-neutral-600">{{ item.answer }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-2 mt-6">
        <button
          @click="showBulkEdit = false"
          class="btn-secondary"
        >
          Cancel
        </button>
        <button
          @click="applyBulkEdit"
          :disabled="!canApplyBulkEdit"
          class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Apply Changes
        </button>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div v-if="showDeleteConfirm" class="fixed inset-0 bg-neutral-800 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <div class="flex items-center mb-4">
        <svg class="w-6 h-6 text-error-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
        <h3 class="text-lg font-semibold text-neutral-800">Confirm Bulk Delete</h3>
      </div>
      
      <p class="text-neutral-600 mb-4">
        Are you sure you want to delete <strong>{{ selectedItems.length }}</strong> selected item{{ selectedItems.length === 1 ? '' : 's' }}? This action cannot be undone.
      </p>
      
      <div class="flex justify-end space-x-2">
        <button
          @click="showDeleteConfirm = false"
          class="btn-secondary"
        >
          Cancel
        </button>
        <button
          @click="confirmDelete"
          class="bg-error-600 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          Delete {{ selectedItems.length }} Item{{ selectedItems.length === 1 ? '' : 's' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'BulkOperations',
  props: {
    selectedItems: {
      type: Array,
      default: () => []
    },
    categories: {
      type: Array,
      required: true
    },
    allItems: {
      type: Array,
      default: () => []
    }
  },
  emits: [
    'select-all',
    'clear-selection',
    'export-selected',
    'duplicate-selected',
    'move-selected',
    'bulk-edit',
    'delete-selected',
    'show-notification'
  ],
  setup(props, { emit }) {
    const showMoveMenu = ref(false)
    const showBulkEdit = ref(false)
    const showDeleteConfirm = ref(false)
    
    const bulkEditOptions = ref({
      questions: true,
      answers: true,
      categories: false
    })
    
    const bulkEditType = ref('replace')
    const bulkEditFind = ref('')
    const bulkEditReplace = ref('')
    const bulkEditText = ref('')

    const allSelected = computed(() => {
      return props.allItems.length > 0 && props.selectedItems.length === props.allItems.length
    })

    const selectionSummary = computed(() => {
      const categories = props.selectedItems.filter(item => item.type === 'category').length
      const questions = props.selectedItems.filter(item => item.type === 'question').length
      
      const parts = []
      if (categories > 0) parts.push(`${categories} categor${categories === 1 ? 'y' : 'ies'}`)
      if (questions > 0) parts.push(`${questions} question${questions === 1 ? '' : 's'}`)
      
      return parts.join(', ')
    })

    const canDuplicate = computed(() => {
      return props.selectedItems.some(item => item.type === 'question')
    })

    const canMove = computed(() => {
      return props.selectedItems.some(item => item.type === 'question')
    })

    const canEdit = computed(() => {
      return props.selectedItems.length > 0
    })

    const availableCategories = computed(() => {
      return props.categories.filter(category => {
        // Don't show categories that are selected for deletion
        return !props.selectedItems.some(item => item.type === 'category' && item.id === category.id)
      })
    })

    const previewItems = computed(() => {
      const items = props.selectedItems.slice(0, 3)
      return items.map(item => {
        let question = item.question || ''
        let answer = item.answer || ''
        let category = item.categoryName || ''

        if (bulkEditOptions.value.questions) {
          question = applyEditToText(question)
        }
        if (bulkEditOptions.value.answers) {
          answer = applyEditToText(answer)
        }
        if (bulkEditOptions.value.categories) {
          category = applyEditToText(category)
        }

        return { category, question, answer }
      })
    })

    const canApplyBulkEdit = computed(() => {
      if (bulkEditType.value === 'replace') {
        return bulkEditFind.value.trim() !== ''
      }
      return bulkEditText.value.trim() !== ''
    })

    const applyEditToText = (text) => {
      if (!text) return text

      switch (bulkEditType.value) {
        case 'replace':
          return text.replace(new RegExp(bulkEditFind.value, 'g'), bulkEditReplace.value)
        case 'prepend':
          return bulkEditText.value + text
        case 'append':
          return text + bulkEditText.value
        default:
          return text
      }
    }

    const toggleSelectAll = () => {
      if (allSelected.value) {
        emit('clear-selection')
      } else {
        emit('select-all')
      }
    }

    const clearSelection = () => {
      emit('clear-selection')
    }

    const exportSelected = () => {
      const exportData = {
        timestamp: new Date().toISOString(),
        selectedItems: props.selectedItems,
        summary: selectionSummary.value
      }
      
      emit('export-selected', exportData)
    }

    const duplicateSelected = () => {
      const questionsTodup = props.selectedItems.filter(item => item.type === 'question')
      emit('duplicate-selected', questionsTodup)
    }

    const moveToCategory = (categoryId) => {
      const questionsToMove = props.selectedItems.filter(item => item.type === 'question')
      emit('move-selected', { items: questionsToMove, targetCategoryId: categoryId })
      showMoveMenu.value = false
    }

    const deleteSelected = () => {
      showDeleteConfirm.value = true
    }

    const confirmDelete = () => {
      emit('delete-selected', props.selectedItems)
      showDeleteConfirm.value = false
    }

    const applyBulkEdit = () => {
      const editConfig = {
        options: bulkEditOptions.value,
        type: bulkEditType.value,
        find: bulkEditFind.value,
        replace: bulkEditReplace.value,
        text: bulkEditText.value
      }
      
      emit('bulk-edit', {
        items: props.selectedItems,
        config: editConfig
      })
      
      showBulkEdit.value = false
    }

    // Close menus when clicking outside
    const handleClickOutside = (event) => {
      if (showMoveMenu.value && !event.target.closest('.relative')) {
        showMoveMenu.value = false
      }
    }

    // Watch for outside clicks
    watch(showMoveMenu, (newValue) => {
      if (newValue) {
        document.addEventListener('click', handleClickOutside)
      } else {
        document.removeEventListener('click', handleClickOutside)
      }
    })

    return {
      showMoveMenu,
      showBulkEdit,
      showDeleteConfirm,
      bulkEditOptions,
      bulkEditType,
      bulkEditFind,
      bulkEditReplace,
      bulkEditText,
      allSelected,
      selectionSummary,
      canDuplicate,
      canMove,
      canEdit,
      availableCategories,
      previewItems,
      canApplyBulkEdit,
      toggleSelectAll,
      clearSelection,
      exportSelected,
      duplicateSelected,
      moveToCategory,
      deleteSelected,
      confirmDelete,
      applyBulkEdit
    }
  }
}
</script>