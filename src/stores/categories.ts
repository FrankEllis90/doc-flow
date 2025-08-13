import { defineStore } from 'pinia'
import { shallowRef, computed, triggerRef, ref } from 'vue'
import type { Category } from '@/types'

/**
 * Focused Categories Store
 * Manages FAQ categories and questions with optimized performance
 */
export const useCategoriesStore = defineStore('categories', () => {
  // ===== STATE =====
  
  // Optimized with shallowRef for performance
  const categories = shallowRef<Category[]>([
    {
      id: 1,
      name: 'General FAQ',
      questions: [
        {
          id: 1,
          question: 'What is AI Knowledge Base Builder?',
          answer: 'AI Knowledge Base Builder is an innovative platform that helps businesses create and manage intelligent knowledge bases for AI applications.'
        }
      ]
    }
  ])
  
  const filteredCategories = shallowRef<Category[]>([])
  const searchQuery = ref('')
  
  // ===== COMPUTED =====
  
  const totalCategories = computed(() => categories.value.length)
  
  const totalQuestions = computed(() => {
    return categories.value.reduce((total, cat) => total + cat.questions.length, 0)
  })
  
  const categoriesStats = computed(() => ({
    total: totalCategories.value,
    questions: totalQuestions.value,
    averageQuestionsPerCategory: totalCategories.value > 0 
      ? Math.round(totalQuestions.value / totalCategories.value)
      : 0,
    largestCategory: categories.value.length > 0
      ? categories.value.reduce((max, cat) => 
          cat.questions.length > max.questions.length ? cat : max
        ).name
      : ''
  }))
  
  const emptyCategoriesCount = computed(() => {
    return categories.value.filter(cat => cat.questions.length === 0).length
  })
  
  const categoriesWithQuestions = computed(() => {
    return categories.value.filter(cat => cat.questions.length > 0)
  })
  
  // ===== ACTIONS =====
  
  /**
   * Add new category
   */
  const addCategory = (name: string): Category => {
    const newCategory: Category = {
      id: Date.now(),
      name,
      questions: []
    }
    categories.value.push(newCategory)
    triggerRef(categories) // Manual reactivity trigger for performance
    
    // Update filtered categories if no search active
    if (!searchQuery.value.trim()) {
      filteredCategories.value.push(newCategory)
      triggerRef(filteredCategories)
    }
    
    return newCategory
  }
  
  /**
   * Update category
   */
  const updateCategory = (categoryId: number, updates: Partial<Category>) => {
    const index = categories.value.findIndex(cat => cat.id === categoryId)
    if (index > -1) {
      categories.value[index] = { ...categories.value[index], ...updates }
      triggerRef(categories) // Manual reactivity trigger for performance
      
      // Update filtered categories if necessary
      const filteredIndex = filteredCategories.value.findIndex(cat => cat.id === categoryId)
      if (filteredIndex > -1) {
        filteredCategories.value[filteredIndex] = categories.value[index]
        triggerRef(filteredCategories)
      }
    }
  }
  
  /**
   * Delete category
   */
  const deleteCategory = (categoryId: number) => {
    const index = categories.value.findIndex(cat => cat.id === categoryId)
    if (index > -1) {
      categories.value.splice(index, 1)
      triggerRef(categories) // Manual reactivity trigger for performance
      
      // Update filtered categories
      const filteredIndex = filteredCategories.value.findIndex(cat => cat.id === categoryId)
      if (filteredIndex > -1) {
        filteredCategories.value.splice(filteredIndex, 1)
        triggerRef(filteredCategories)
      }
    }
  }
  
  /**
   * Add question to category
   */
  const addQuestionToCategory = (categoryId: number, question: string, answer: string) => {
    const category = categories.value.find(cat => cat.id === categoryId)
    if (category) {
      const newQuestion = {
        id: Date.now(),
        question,
        answer
      }
      category.questions.push(newQuestion)
      triggerRef(categories) // Manual reactivity trigger for performance
      
      // Update filtered categories if necessary
      const filteredCategory = filteredCategories.value.find(cat => cat.id === categoryId)
      if (filteredCategory) {
        filteredCategory.questions.push(newQuestion)
        triggerRef(filteredCategories)
      }
      
      return newQuestion
    }
  }
  
  /**
   * Update question in category
   */
  const updateQuestion = (categoryId: number, questionId: number, updates: { question?: string; answer?: string }) => {
    const category = categories.value.find(cat => cat.id === categoryId)
    if (category) {
      const questionIndex = category.questions.findIndex(q => q.id === questionId)
      if (questionIndex > -1) {
        category.questions[questionIndex] = { ...category.questions[questionIndex], ...updates }
        triggerRef(categories)
        
        // Update filtered categories
        const filteredCategory = filteredCategories.value.find(cat => cat.id === categoryId)
        if (filteredCategory) {
          const filteredQuestionIndex = filteredCategory.questions.findIndex(q => q.id === questionId)
          if (filteredQuestionIndex > -1) {
            filteredCategory.questions[filteredQuestionIndex] = category.questions[questionIndex]
            triggerRef(filteredCategories)
          }
        }
      }
    }
  }
  
  /**
   * Delete question from category
   */
  const deleteQuestion = (categoryId: number, questionId: number) => {
    const category = categories.value.find(cat => cat.id === categoryId)
    if (category) {
      const questionIndex = category.questions.findIndex(q => q.id === questionId)
      if (questionIndex > -1) {
        category.questions.splice(questionIndex, 1)
        triggerRef(categories)
        
        // Update filtered categories
        const filteredCategory = filteredCategories.value.find(cat => cat.id === categoryId)
        if (filteredCategory) {
          const filteredQuestionIndex = filteredCategory.questions.findIndex(q => q.id === questionId)
          if (filteredQuestionIndex > -1) {
            filteredCategory.questions.splice(filteredQuestionIndex, 1)
            triggerRef(filteredCategories)
          }
        }
      }
    }
  }
  
  /**
   * Search and filter categories
   */
  const filterCategories = (query: string) => {
    searchQuery.value = query
    
    if (!query.trim()) {
      filteredCategories.value = categories.value
    } else {
      const lowercaseQuery = query.toLowerCase()
      
      filteredCategories.value = categories.value
        .map(category => ({
          ...category,
          questions: category.questions.filter(q => 
            q.question.toLowerCase().includes(lowercaseQuery) ||
            q.answer.toLowerCase().includes(lowercaseQuery)
          )
        }))
        .filter(category => 
          category.name.toLowerCase().includes(lowercaseQuery) ||
          category.questions.length > 0
        )
    }
    
    triggerRef(filteredCategories)
  }
  
  /**
   * Get category by ID
   */
  const getCategoryById = (categoryId: number): Category | undefined => {
    return categories.value.find(cat => cat.id === categoryId)
  }
  
  /**
   * Get question by ID
   */
  const getQuestionById = (categoryId: number, questionId: number) => {
    const category = getCategoryById(categoryId)
    return category?.questions.find(q => q.id === questionId)
  }
  
  /**
   * Bulk add categories
   */
  const addCategories = (newCategories: Omit<Category, 'id'>[]) => {
    const processedCategories = newCategories.map(cat => ({
      ...cat,
      id: Date.now() + Math.random()
    }))
    
    categories.value.push(...processedCategories)
    triggerRef(categories) // Single trigger for batch operation
    
    // Update filtered categories if no search active
    if (!searchQuery.value.trim()) {
      filteredCategories.value.push(...processedCategories)
      triggerRef(filteredCategories)
    }
    
    return processedCategories
  }
  
  /**
   * Bulk add questions to category
   */
  const addQuestionsToCategory = (categoryId: number, questions: Array<{ question: string; answer: string }>) => {
    const category = categories.value.find(cat => cat.id === categoryId)
    if (category) {
      const newQuestions = questions.map(q => ({
        ...q,
        id: Date.now() + Math.random()
      }))
      
      category.questions.push(...newQuestions)
      triggerRef(categories) // Single trigger for batch operation
      
      // Update filtered categories
      const filteredCategory = filteredCategories.value.find(cat => cat.id === categoryId)
      if (filteredCategory) {
        filteredCategory.questions.push(...newQuestions)
        triggerRef(filteredCategories)
      }
      
      return newQuestions
    }
    return []
  }
  
  /**
   * Clear all categories
   */
  const clearCategories = () => {
    categories.value = []
    filteredCategories.value = []
    searchQuery.value = ''
    
    triggerRef(categories)
    triggerRef(filteredCategories)
  }
  
  /**
   * Load categories from external source
   */
  const loadCategories = (initialCategories: Category[]) => {
    categories.value = [...initialCategories]
    filteredCategories.value = [...initialCategories]
    
    triggerRef(categories)
    triggerRef(filteredCategories)
  }
  
  /**
   * Export categories data
   */
  const exportCategories = () => {
    return {
      categories: categories.value,
      exportedAt: new Date().toISOString(),
      stats: categoriesStats.value
    }
  }
  
  /**
   * Get performance metrics
   */
  const getPerformanceMetrics = () => ({
    totalCategories: categories.value.length,
    totalQuestions: totalQuestions.value,
    filteredCategories: filteredCategories.value.length,
    emptyCategories: emptyCategoriesCount.value,
    dataEfficiency: categories.value.length > 0 
      ? `${((totalQuestions.value / categories.value.length)).toFixed(1)} avg questions per category`
      : '0 questions per category',
    searchActive: searchQuery.value.trim().length > 0
  })
  
  return {
    // State
    categories,
    filteredCategories,
    searchQuery,
    
    // Computed
    totalCategories,
    totalQuestions,
    categoriesStats,
    emptyCategoriesCount,
    categoriesWithQuestions,
    
    // Actions
    addCategory,
    updateCategory,
    deleteCategory,
    addQuestionToCategory,
    updateQuestion,
    deleteQuestion,
    filterCategories,
    getCategoryById,
    getQuestionById,
    addCategories,
    addQuestionsToCategory,
    clearCategories,
    loadCategories,
    exportCategories,
    getPerformanceMetrics
  }
})