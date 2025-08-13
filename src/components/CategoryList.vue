<template>
  <div class="space-y-3 sm:space-y-4">
    <!-- Add Category Section -->
    <div class="bg-primary-50 border border-primary-200 rounded-lg p-3 sm:p-4">
      <h3 class="text-base sm:text-lg font-semibold text-primary-700 mb-3">Add New Category</h3>
      <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <input
          v-model="newCategoryName"
          @keyup.enter="handleAddCategory"
          type="text"
          placeholder="Category name"
          class="input-field flex-1"
        />
        <button
          @click="handleAddCategory"
          :disabled="!newCategoryName.trim()"
          class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          Add Category
        </button>
      </div>
    </div>

    <!-- Categories List -->
    <div class="space-y-3 sm:space-y-4">
      <div
        v-for="category in categories"
        :key="`category-${category.id}-${category.questions?.length || 0}`"
        :data-category-id="category.id"
        class="bg-white border border-neutral-200 rounded-lg p-3 sm:p-4 shadow-sm"
      >
        <!-- Category Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <div class="flex items-center space-x-3 flex-1">
            <!-- Bulk Selection Checkbox -->
            <label v-if="bulkSelectMode" class="flex items-center">
              <input
                type="checkbox"
                :checked="isCategorySelected(category)"
                @change="toggleCategorySelection(category)"
                class="rounded border-neutral-300 focus:ring-primary-500"
              />
            </label>
            <input
              v-if="editingCategory === category.id"
              v-model="editCategoryName"
              @keyup.enter="saveCategory(category.id)"
              @blur="saveCategory(category.id)"
              type="text"
              class="input-field flex-1"
              ref="categoryInput"
            />
            <h3
              v-else
              class="text-base sm:text-lg font-semibold text-neutral-800 flex-1"
            >
              {{ category.name }}
            </h3>
          </div>
          <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              v-if="editingCategory === category.id"
              @click="saveCategory(category.id)"
              class="btn-primary text-sm w-full sm:w-auto"
            >
              Save
            </button>
            <button
              v-else
              @click="startEditCategory(category)"
              class="btn-secondary text-sm w-full sm:w-auto"
            >
              Edit
            </button>
            <button
              @click="handleDeleteCategory(category.id)"
              class="bg-error-600 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors w-full sm:w-auto"
            >
              Delete
            </button>
          </div>
        </div>

        <!-- Questions Section -->
        <div class="space-y-3">
          <!-- Add Question -->
          <div class="bg-primary-500-5 border border-primary-200 rounded p-3">
            <h4 class="text-sm font-medium text-neutral-800 mb-2">Add New Question</h4>
            <div class="space-y-2">
              <input
                :value="newQuestions[category.id]?.question || ''"
                @input="updateNewQuestion(category.id, 'question', $event.target.value)"
                type="text"
                placeholder="Question"
                class="input-field"
              />
              <textarea
                :value="newQuestions[category.id]?.answer || ''"
                @input="updateNewQuestion(category.id, 'answer', $event.target.value)"
                placeholder="Answer"
                rows="3"
                class="textarea-field"
              ></textarea>
              <button
                @click="handleAddQuestion(category.id)"
                :disabled="!canAddQuestion(category.id)"
                class="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                Add Question
              </button>
            </div>
          </div>

          <!-- Questions List -->
          <div class="space-y-3">
            <div v-if="category.questions.length > 0" class="text-xs text-neutral-600 mb-2">
              💡 Drag questions to reorder them ({{ category.questions.length }} questions)
            </div>
            <div v-else class="text-xs text-neutral-600 mb-2">
              No questions yet. Add your first question above.
            </div>
            
            <!-- Simple div to test rendering -->
            <div class="space-y-3">
              <div
                v-for="question in category.questions"
                :key="question.id"
                :data-question-id="question.id"
                class="bg-neutral-50 border border-neutral-200 rounded p-3"
              >
                <div v-if="editingQuestion === question.id" class="space-y-2">
                  <input
                    v-model="editQuestionData.question"
                    type="text"
                    class="input-field"
                    placeholder="Question"
                  />
                  <textarea
                    v-model="editQuestionData.answer"
                    rows="3"
                    class="textarea-field"
                    placeholder="Answer"
                  ></textarea>
                  <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                      @click="saveQuestion(category.id, question.id)"
                      class="btn-primary text-sm w-full sm:w-auto"
                    >
                      Save
                    </button>
                    <button
                      @click="cancelEditQuestion()"
                      class="btn-secondary text-sm w-full sm:w-auto"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                <div v-else>
                  <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                    <div class="flex items-center space-x-2 flex-1">
                      <!-- Bulk Selection Checkbox -->
                      <label v-if="bulkSelectMode" class="flex items-center">
                        <input
                          type="checkbox"
                          :checked="isQuestionSelected(category, question)"
                          @change="toggleQuestionSelection(category, question)"
                          class="rounded border-neutral-300 focus:ring-primary-500"
                        />
                      </label>
                      <h5 class="font-medium text-neutral-800 flex-1">{{ question.question }}</h5>
                    </div>
                    <div class="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                      <button
                        @click="startEditQuestion(question)"
                        class="btn-secondary text-xs w-full sm:w-auto"
                      >
                        Edit
                      </button>
                      <button
                        @click="handleDeleteQuestion(category.id, question.id)"
                        class="bg-error-600 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors w-full sm:w-auto"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p class="text-neutral-600 text-sm">{{ question.answer }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Delete Category Modal -->
    <div v-if="showDeleteCategoryModal" class="fixed inset-0 bg-neutral-800 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div class="flex items-center mb-4">
          <svg class="w-6 h-6 text-error-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <h3 class="text-lg font-semibold text-neutral-800">Delete Category</h3>
        </div>
        
        <p class="text-neutral-600 mb-4">
          Are you sure you want to delete "<strong>{{ categoryToDelete?.name }}</strong>" and all its questions? This action cannot be undone.
        </p>
        
        <div class="flex justify-end space-x-2">
          <button
            @click="cancelDeleteCategory"
            class="btn-secondary"
          >
            Cancel
          </button>
          <button
            @click="confirmDeleteCategory"
            class="bg-error-600 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Delete Category
          </button>
        </div>
      </div>
    </div>
    
    <!-- Delete Question Modal -->
    <div v-if="showDeleteQuestionModal" class="fixed inset-0 bg-neutral-800 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div class="flex items-center mb-4">
          <svg class="w-6 h-6 text-error-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <h3 class="text-lg font-semibold text-neutral-800">Delete Question</h3>
        </div>
        
        <p class="text-neutral-600 mb-4">
          Are you sure you want to delete this question: "<strong>{{ questionToDelete?.question }}</strong>"? This action cannot be undone.
        </p>
        
        <div class="flex justify-end space-x-2">
          <button
            @click="cancelDeleteQuestion"
            class="btn-secondary"
          >
            Cancel
          </button>
          <button
            @click="confirmDeleteQuestion"
            class="bg-error-600 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Delete Question
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, nextTick, watch } from 'vue'
import { VueDraggableNext } from 'vue-draggable-next'

export default {
  name: 'CategoryList',
  components: {
    draggable: VueDraggableNext
  },
  props: {
    categories: {
      type: Array,
      required: true
    },
    bulkSelectMode: {
      type: Boolean,
      default: false
    },
    selectedItems: {
      type: Array,
      default: () => []
    }
  },
  emits: [
    'add-category',
    'update-category',
    'delete-category',
    'add-question',
    'update-question',
    'delete-question',
    'reorder-questions',
    'toggle-selection'
  ],
  setup(props, { emit }) {
    const newCategoryName = ref('')
    const newQuestions = reactive({})
    const editingCategory = ref(null)
    const editCategoryName = ref('')
    const editingQuestion = ref(null)
    const editQuestionData = reactive({
      question: '',
      answer: ''
    })
    const updateKey = ref(Date.now())
    
    const handleAddCategory = () => {
      if (newCategoryName.value.trim()) {
        emit('add-category', newCategoryName.value.trim())
        newCategoryName.value = ''
      }
    }
    
    const startEditCategory = (category) => {
      editingCategory.value = category.id
      editCategoryName.value = category.name
      nextTick(() => {
        // Focus on the input field
        const inputs = document.querySelectorAll('input[type="text"]')
        inputs.forEach(input => {
          if (input.value === category.name) {
            input.focus()
          }
        })
      })
    }
    
    const saveCategory = (categoryId) => {
      if (editCategoryName.value.trim()) {
        emit('update-category', categoryId, editCategoryName.value.trim())
      }
      editingCategory.value = null
      editCategoryName.value = ''
    }
    
    const showDeleteCategoryModal = ref(false)
    const categoryToDelete = ref(null)
    
    const handleDeleteCategory = (categoryId) => {
      const category = props.categories.find(c => c.id === categoryId)
      categoryToDelete.value = category
      showDeleteCategoryModal.value = true
    }
    
    const confirmDeleteCategory = () => {
      if (categoryToDelete.value) {
        emit('delete-category', categoryToDelete.value.id)
      }
      showDeleteCategoryModal.value = false
      categoryToDelete.value = null
    }
    
    const cancelDeleteCategory = () => {
      showDeleteCategoryModal.value = false
      categoryToDelete.value = null
    }
    
    const canAddQuestion = (categoryId) => {
      const newQ = newQuestions[categoryId]
      return newQ && newQ.question && newQ.question.trim() && newQ.answer && newQ.answer.trim()
    }
    
    const handleAddQuestion = (categoryId) => {
      if (canAddQuestion(categoryId)) {
        const newQ = newQuestions[categoryId]
        emit('add-question', categoryId, newQ.question.trim(), newQ.answer.trim())
        // Clear the inputs after adding
        nextTick(() => {
          if (newQuestions[categoryId]) {
            newQuestions[categoryId].question = ''
            newQuestions[categoryId].answer = ''
          }
        })
      }
    }
    
    const startEditQuestion = (question) => {
      editingQuestion.value = question.id
      editQuestionData.question = question.question
      editQuestionData.answer = question.answer
    }
    
    const saveQuestion = (categoryId, questionId) => {
      if (editQuestionData.question.trim() && editQuestionData.answer.trim()) {
        emit('update-question', categoryId, questionId, editQuestionData.question.trim(), editQuestionData.answer.trim())
      }
      cancelEditQuestion()
    }
    
    const cancelEditQuestion = () => {
      editingQuestion.value = null
      editQuestionData.question = ''
      editQuestionData.answer = ''
    }
    
    const showDeleteQuestionModal = ref(false)
    const questionToDelete = ref(null)
    
    const handleDeleteQuestion = (categoryId, questionId) => {
      const category = props.categories.find(c => c.id === categoryId)
      const question = category?.questions.find(q => q.id === questionId)
      questionToDelete.value = { categoryId, questionId, question: question?.question }
      showDeleteQuestionModal.value = true
    }
    
    const confirmDeleteQuestion = () => {
      if (questionToDelete.value) {
        emit('delete-question', questionToDelete.value.categoryId, questionToDelete.value.questionId)
      }
      showDeleteQuestionModal.value = false
      questionToDelete.value = null
    }
    
    const cancelDeleteQuestion = () => {
      showDeleteQuestionModal.value = false
      questionToDelete.value = null
    }
    
    const handleReorder = (categoryId) => {
      const category = props.categories.find(c => c.id === categoryId)
      if (category) {
        emit('reorder-questions', categoryId, category.questions)
      }
    }
    
    const updateNewQuestion = (categoryId, field, value) => {
      if (!newQuestions[categoryId]) {
        newQuestions[categoryId] = { question: '', answer: '' }
      }
      newQuestions[categoryId][field] = value
    }
    
    // Bulk selection functions
    const isCategorySelected = (category) => {
      return props.selectedItems.some(item => 
        item.type === 'category' && item.id === category.id
      )
    }
    
    const isQuestionSelected = (category, question) => {
      return props.selectedItems.some(item => 
        item.type === 'question' && 
        item.categoryId === category.id && 
        item.questionId === question.id
      )
    }
    
    const toggleCategorySelection = (category) => {
      const item = {
        type: 'category',
        id: category.id,
        name: category.name,
        categoryId: category.id,
        categoryName: category.name
      }
      emit('toggle-selection', item)
    }
    
    const toggleQuestionSelection = (category, question) => {
      const item = {
        type: 'question',
        id: question.id,
        categoryId: category.id,
        questionId: question.id,
        categoryName: category.name,
        question: question.question,
        answer: question.answer
      }
      emit('toggle-selection', item)
    }
    
    // Initialize newQuestions for each category
    const initializeNewQuestions = () => {
      props.categories.forEach(category => {
        if (!newQuestions[category.id]) {
          newQuestions[category.id] = { question: '', answer: '' }
        }
      })
    }
    
    // Initialize on mount
    initializeNewQuestions()
    
    // Watch for new categories and initialize their newQuestions
    watch(
      () => props.categories,
      (newCategories, oldCategories) => {
        // Clear existing newQuestions when categories change completely
        if (newCategories !== oldCategories) {
          Object.keys(newQuestions).forEach(key => {
            delete newQuestions[key]
          })
          // Force update the draggable components
          updateKey.value = Date.now()
        }
        initializeNewQuestions()
      },
      { deep: true, immediate: true }
    )
    
    return {
      newCategoryName,
      newQuestions,
      editingCategory,
      editCategoryName,
      editingQuestion,
      editQuestionData,
      updateKey,
      showDeleteCategoryModal,
      categoryToDelete,
      showDeleteQuestionModal,
      questionToDelete,
      handleAddCategory,
      startEditCategory,
      saveCategory,
      handleDeleteCategory,
      confirmDeleteCategory,
      cancelDeleteCategory,
      canAddQuestion,
      handleAddQuestion,
      startEditQuestion,
      saveQuestion,
      cancelEditQuestion,
      handleDeleteQuestion,
      confirmDeleteQuestion,
      cancelDeleteQuestion,
      handleReorder,
      updateNewQuestion,
      isCategorySelected,
      isQuestionSelected,
      toggleCategorySelection,
      toggleQuestionSelection
    }
  }
}
</script>