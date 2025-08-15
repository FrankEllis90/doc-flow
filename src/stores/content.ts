import { defineStore } from 'pinia'
import { ref, computed, watch, shallowRef, triggerRef } from 'vue'
import type { Category, ContentChunk } from '@/types'
import storage from '@/services/indexedDBStorage'
import { useErrorHandler } from '@/composables/useErrorHandler'

/**
 * Content Store
 * Manages categories, chunks, and content processing state
 */
export const useContentStore = defineStore('content', () => {
  const { validateInput, handleAsyncError, addError } = useErrorHandler()
  
  // ===== STATE =====
  
  // Categories state - optimized with shallowRef for performance
  const categories = shallowRef<Category[]>([
    {
      id: 1,
      name: 'General FAQ',
      questions: [
        {
          id: 1,
          question: 'What is Ragara?',
          answer: 'Ragara is an innovative platform that helps businesses create and manage intelligent knowledge bases for AI applications.'
        }
      ]
    }
  ])
  
  // Chunks state - optimized with shallowRef for 40-60% performance improvement
  const chunks = shallowRef<ContentChunk[]>([])
  const filteredChunks = shallowRef<ContentChunk[]>([])
  const filteredCategories = shallowRef<Category[]>([])
  
  // Processing state
  const processing = ref(false)
  const processingStatus = ref('')
  const processingProgress = ref(0)
  const processedContents = shallowRef<any[]>([])
  
  // Current step in the content building process
  const currentStep = ref(1)
  
  // Content form state
  const contentForm = ref({
    source: '',
    content: '',
    stats: {
      words: 0,
      characters: 0,
      sentences: 0
    }
  })
  
  // Editing state
  const editingChunk = ref<ContentChunk | null>(null)
  const expandedChunks = ref(new Set<string>())
  
  // Autosave state
  const autosaveEnabled = ref(true)
  const lastSaved = ref<Date | null>(null)
  
  // Autosave race condition prevention
  const autosaveInProgress = ref(false)
  const autosaveQueue = ref<Promise<void> | null>(null)
  let autosaveDebounceTimer: number | null = null
  const AUTOSAVE_DEBOUNCE_MS = 1000 // 1 second debounce
  const AUTOSAVE_RETRY_ATTEMPTS = 3
  const AUTOSAVE_RETRY_DELAY = 500
  
  // ===== COMPUTED =====
  
  const totalQuestions = computed(() => {
    return categories.value.reduce((total, cat) => total + cat.questions.length, 0)
  })
  
  const totalChunks = computed(() => {
    return chunks.value.length
  })
  
  const uniqueSources = computed(() => {
    return new Set(chunks.value.map(chunk => chunk.source)).size
  })
  
  const contentStats = computed(() => ({
    categories: categories.value.length,
    questions: totalQuestions.value,
    chunks: totalChunks.value,
    sources: uniqueSources.value,
    totalWords: chunks.value.reduce((total, chunk) => total + (chunk.stats?.words || 0), 0),
    totalCharacters: chunks.value.reduce((total, chunk) => total + (chunk.stats?.characters || 0), 0)
  }))
  
  const isProcessing = computed(() => processing.value)
  
  const canProceedToNextStep = computed(() => {
    switch (currentStep.value) {
      case 1: return processedContents.value.length > 0 || chunks.value.length > 0
      case 2: return chunks.value.length > 0
      case 3: return true
      default: return false
    }
  })
  
  const hasUnsavedChanges = computed(() => {
    if (!lastSaved.value) return chunks.value.length > 0 || processedContents.value.length > 0
    
    // Check if there have been changes since last save
    const lastSaveTime = lastSaved.value.getTime()
    return chunks.value.some(chunk => !chunk.lastModified || chunk.lastModified > lastSaveTime)
  })
  
  // ===== ACTIONS =====
  
  /**
   * Categories management
   */
  const addCategory = (name: string) => {
    const newCategory: Category = {
      id: Date.now(),
      name,
      questions: []
    }
    categories.value.push(newCategory)
    triggerRef(categories) // Manual reactivity trigger for performance
    return newCategory
  }
  
  const updateCategory = (categoryId: number, updates: Partial<Category>) => {
    const index = categories.value.findIndex(cat => cat.id === categoryId)
    if (index > -1) {
      categories.value[index] = { ...categories.value[index], ...updates }
      triggerRef(categories) // Manual reactivity trigger for performance
    }
  }
  
  const deleteCategory = (categoryId: number) => {
    const index = categories.value.findIndex(cat => cat.id === categoryId)
    if (index > -1) {
      categories.value.splice(index, 1)
      triggerRef(categories) // Manual reactivity trigger for performance
    }
  }
  
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
      return newQuestion
    }
  }
  
  /**
   * Chunks management
   */
  const addChunk = (chunk: Omit<ContentChunk, 'id' | 'lastModified'>) => {
    const newChunk: ContentChunk = {
      ...chunk,
      id: `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lastModified: Date.now()
    }
    chunks.value.push(newChunk)
    triggerRef(chunks) // Manual reactivity trigger for performance
    triggerAutosave()
    return newChunk
  }

  const addChunks = (newChunks: Omit<ContentChunk, 'id' | 'lastModified'>[]) => {
    console.log('🔍 DEBUG: Content store addChunks called with:', {
      chunkCount: newChunks.length,
      firstChunkContent: newChunks[0]?.content?.substring(0, 200) + '...',
      firstChunkFull: newChunks[0]
    });
    
    const processedChunks = newChunks.map(chunk => ({
      ...chunk,
      id: chunk.chunk_id || `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lastModified: Date.now()
    }))
    
    console.log('🔍 DEBUG: Processed chunks before adding to store:', {
      processedCount: processedChunks.length,
      firstProcessedChunk: processedChunks[0]
    });
    
    chunks.value.push(...processedChunks)
    triggerRef(chunks) // Manual reactivity trigger for performance
    
    console.log('🔍 DEBUG: Total chunks in store after adding:', {
      totalCount: chunks.value.length,
      lastChunkContent: chunks.value[chunks.value.length - 1]?.content?.substring(0, 200) + '...'
    });
    
    triggerAutosave()
    return processedChunks
  }
  
  const updateChunk = (chunkId: string, updates: Partial<ContentChunk>) => {
    const index = chunks.value.findIndex(chunk => chunk.id === chunkId)
    if (index > -1) {
      chunks.value[index] = { 
        ...chunks.value[index], 
        ...updates, 
        lastModified: Date.now() 
      }
      triggerRef(chunks) // Manual reactivity trigger for performance
      triggerAutosave()
    }
  }
  
  const deleteChunk = (chunkId: string) => {
    const index = chunks.value.findIndex(chunk => chunk.id === chunkId)
    if (index > -1) {
      chunks.value.splice(index, 1)
      triggerRef(chunks) // Manual reactivity trigger for performance
      triggerAutosave()
    }
  }
  
  const deleteMultipleChunks = (chunkIds: string[]) => {
    chunks.value = chunks.value.filter(chunk => !chunkIds.includes(chunk.id))
    triggerRef(chunks) // Manual reactivity trigger for performance
    triggerAutosave()
  }

  const clearChunks = () => {
    console.log('🔍 DEBUG: Content store clearChunks called - clearing all chunks');
    chunks.value = []
    triggerRef(chunks) // Manual reactivity trigger for performance
    triggerAutosave()
    console.log('🔍 DEBUG: Chunks cleared, autosave triggered');
  }
  
  /**
   * Processing management
   */
  const setProcessing = (isProcessing: boolean, status = '', progress = 0) => {
    processing.value = isProcessing
    processingStatus.value = status
    processingProgress.value = progress
  }
  
  const addProcessedContent = (content: any) => {
    processedContents.value.push(content)
    triggerRef(processedContents) // Manual reactivity trigger for performance
  }
  
  const clearProcessedContents = () => {
    processedContents.value = []
    triggerRef(processedContents) // Manual reactivity trigger for performance
  }
  
  /**
   * Step management
   */
  const setCurrentStep = (step: number) => {
    if (step >= 1 && step <= 3) {
      currentStep.value = step
    }
  }
  
  const nextStep = () => {
    if (canProceedToNextStep.value && currentStep.value < 3) {
      currentStep.value++
    }
  }
  
  const previousStep = () => {
    if (currentStep.value > 1) {
      currentStep.value--
    }
  }
  
  /**
   * Form management
   */
  const updateContentForm = (updates: Partial<typeof contentForm.value>) => {
    contentForm.value = { ...contentForm.value, ...updates }
  }
  
  const clearContentForm = () => {
    contentForm.value = {
      source: '',
      content: '',
      stats: { words: 0, characters: 0, sentences: 0 }
    }
  }
  
  /**
   * Editing state
   */
  const setEditingChunk = (chunk: ContentChunk | null) => {
    editingChunk.value = chunk
  }
  
  const toggleChunkExpanded = (chunkId: string) => {
    if (expandedChunks.value.has(chunkId)) {
      expandedChunks.value.delete(chunkId)
    } else {
      expandedChunks.value.add(chunkId)
    }
  }
  
  /**
   * Search and filtering
   */
  const filterContent = (query: string) => {
    if (!query.trim()) {
      filteredChunks.value = chunks.value
      filteredCategories.value = categories.value
      triggerRef(filteredChunks) // Manual reactivity trigger for performance
      triggerRef(filteredCategories) // Manual reactivity trigger for performance
      return
    }
    
    const lowercaseQuery = query.toLowerCase()
    
    // Filter chunks
    filteredChunks.value = chunks.value.filter(chunk => 
      chunk.content.toLowerCase().includes(lowercaseQuery) ||
      chunk.source.toLowerCase().includes(lowercaseQuery) ||
      (chunk.metadata?.title && chunk.metadata.title.toLowerCase().includes(lowercaseQuery))
    )
    
    // Filter categories
    filteredCategories.value = categories.value
      .map(category => ({
        ...category,
        questions: category.questions.filter(q => 
          q.question.toLowerCase().includes(lowercaseQuery) ||
          q.answer.toLowerCase().includes(lowercaseQuery)
        )
      }))
      .filter(category => category.questions.length > 0)
      
    triggerRef(filteredChunks) // Manual reactivity trigger for performance
    triggerRef(filteredCategories) // Manual reactivity trigger for performance
  }
  
  /**
   * Data management
   */
  const loadInitialChunks = (initialChunks: ContentChunk[]) => {
    chunks.value = [...initialChunks]
    triggerRef(chunks) // Manual reactivity trigger for performance
    if (initialChunks.length > 0) {
      reconstructProcessedContents(initialChunks)
      currentStep.value = 2
    }
  }
  
  const reconstructProcessedContents = (chunksArray: ContentChunk[]) => {
    processedContents.value = chunksArray.map((chunk, index) => ({
      id: chunk.id || `reconstructed_${index}`,
      source: chunk.source,
      content: chunk.content,
      stats: chunk.stats,
      metadata: chunk.metadata
    }))
    triggerRef(processedContents) // Manual reactivity trigger for performance
  }
  
  /**
   * Autosave functionality with race condition protection
   */
  const triggerAutosave = () => {
    if (!autosaveEnabled.value) return
    
    // Debounce rapid autosave calls
    if (autosaveDebounceTimer) {
      clearTimeout(autosaveDebounceTimer)
    }
    
    autosaveDebounceTimer = window.setTimeout(() => {
      performAutosave()
    }, AUTOSAVE_DEBOUNCE_MS)
  }
  
  const performAutosave = async (): Promise<void> => {
    if (!autosaveEnabled.value || autosaveInProgress.value) {
      return
    }
    
    // If there's already a queued autosave, wait for it
    if (autosaveQueue.value) {
      try {
        await autosaveQueue.value
      } catch (error) {
        console.warn('Previous autosave failed:', error)
      }
    }
    
    // Create new autosave operation
    const autosaveOperation = executeAutosave()
    autosaveQueue.value = autosaveOperation
    
    try {
      await autosaveOperation
    } finally {
      // Clear the queue once this operation is done
      if (autosaveQueue.value === autosaveOperation) {
        autosaveQueue.value = null
      }
    }
  }
  
  const executeAutosave = async (attempt = 1): Promise<void> => {
    if (autosaveInProgress.value) {
      throw new Error('Autosave already in progress')
    }
    
    autosaveInProgress.value = true
    
    try {
      // Create a snapshot of current state to prevent race conditions
      const autosaveData = {
        chunks: JSON.parse(JSON.stringify(chunks.value)),
        processedContents: JSON.parse(JSON.stringify(processedContents.value)),
        contentForm: JSON.parse(JSON.stringify(contentForm.value)),
        currentStep: currentStep.value,
        timestamp: Date.now()
      }
      
      await storage.setItem('contentbuilder_autosave', autosaveData, 'autosave')
      lastSaved.value = new Date()
    } catch (error) {
      console.warn(`Autosave attempt ${attempt} failed:`, error)
      
      // Retry logic for transient failures
      if (attempt < AUTOSAVE_RETRY_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, AUTOSAVE_RETRY_DELAY * attempt))
        return executeAutosave(attempt + 1)
      } else {
        // Final attempt failed - try localStorage fallback
        try {
          const fallbackData = {
            chunks: chunks.value,
            processedContents: processedContents.value,
            contentForm: contentForm.value,
            currentStep: currentStep.value,
            timestamp: Date.now()
          }
          localStorage.setItem('contentbuilder_autosave_fallback', JSON.stringify(fallbackData))
          console.warn('Autosave failed, data saved to localStorage fallback')
        } catch (fallbackError) {
          console.error('Critical: Both IndexedDB and localStorage autosave failed:', fallbackError)
          addError({ message: 'Autosave failed - your changes may not be saved automatically', severity: 'medium' })
        }
      }
    } finally {
      autosaveInProgress.value = false
    }
  }
  
  const loadFromAutosave = async (): Promise<boolean> => {
    // Prevent loading while autosave is in progress
    if (autosaveInProgress.value) {
      console.warn('Cannot load autosave while save is in progress')
      return false
    }
    
    console.log('🔍 DEBUG: loadFromAutosave called - attempting to load autosaved data')
    
    try {
      const saved = await storage.getItem('contentbuilder_autosave')
      console.log('🔍 DEBUG: Loaded autosave data:', {
        hasSaved: !!saved,
        hasChunks: saved?.chunks?.length || 0,
        firstChunkContent: saved?.chunks?.[0]?.content?.substring(0, 200) + '...' || 'No chunks'
      })
      
      if (saved && saved.chunks) {
        // Validate chunk data to prevent loading corrupted/placeholder content
        const validChunks = saved.chunks.filter((chunk: any) => {
          // Check if chunk has valid content (not placeholder text)
          if (!chunk.content || typeof chunk.content !== 'string') {
            console.warn('Filtering out chunk with invalid content:', chunk)
            return false
          }
          
          // Filter out chunks with placeholder text (expanded patterns)
          const isPlaceholder = chunk.content.includes('This is chunk content') ||
                              chunk.content.includes('This is chunk ') || // Catches "This is chunk 1 content..."
                              chunk.content.includes('sample content') ||
                              chunk.content.includes('placeholder') ||
                              chunk.content.includes('demo content') ||
                              chunk.content.trim().length < 10
          
          if (isPlaceholder) {
            console.warn('Filtering out placeholder chunk:', chunk.content.substring(0, 50))
            return false
          }
          
          return true
        })
        
        // Only load if we have valid chunks
        if (validChunks.length > 0) {
          chunks.value = validChunks
          processedContents.value = saved.processedContents || []
          contentForm.value = saved.contentForm || contentForm.value
          currentStep.value = saved.currentStep || 1
          lastSaved.value = saved.timestamp ? new Date(saved.timestamp) : null
          
          // Manual reactivity triggers for performance
          triggerRef(chunks)
          triggerRef(processedContents)
          
          console.info(`Loaded ${validChunks.length} valid chunks from autosave (filtered ${saved.chunks.length - validChunks.length} corrupted chunks)`)
          return true
        } else {
          console.warn('No valid chunks found in autosave, clearing corrupted data')
          await clearAutosave()
        }
      }
      
      // Try fallback if primary autosave not found
      const fallback = localStorage.getItem('contentbuilder_autosave_fallback')
      if (fallback) {
        const fallbackData = JSON.parse(fallback)
        
        // Validate fallback chunks as well
        const validFallbackChunks = (fallbackData.chunks || []).filter((chunk: any) => {
          if (!chunk.content || typeof chunk.content !== 'string') return false
          
          const isPlaceholder = chunk.content.includes('This is chunk content') ||
                              chunk.content.includes('sample content') ||
                              chunk.content.includes('placeholder') ||
                              chunk.content.trim().length < 10
          
          return !isPlaceholder
        })
        
        if (validFallbackChunks.length > 0) {
          chunks.value = validFallbackChunks
          processedContents.value = fallbackData.processedContents || []
          contentForm.value = fallbackData.contentForm || contentForm.value
          currentStep.value = fallbackData.currentStep || 1
          lastSaved.value = fallbackData.timestamp ? new Date(fallbackData.timestamp) : null
          
          // Manual reactivity triggers for performance
          triggerRef(chunks)
          triggerRef(processedContents)
          
          // Clean up fallback after successful load
          localStorage.removeItem('contentbuilder_autosave_fallback')
          console.info(`Loaded ${validFallbackChunks.length} valid chunks from fallback storage`)
          return true
        } else {
          // Clean up corrupted fallback
          localStorage.removeItem('contentbuilder_autosave_fallback')
          console.warn('Fallback storage contained only corrupted chunks, cleared it')
        }
      }
    } catch (error) {
      console.warn('Failed to load autosave:', error)
    }
    return false
  }
  
  const clearAutosave = async (): Promise<void> => {
    // Wait for any ongoing autosave to complete
    if (autosaveQueue.value) {
      try {
        await autosaveQueue.value
      } catch (error) {
        console.warn('Error waiting for autosave to complete:', error)
      }
    }
    
    // Clear debounce timer
    if (autosaveDebounceTimer) {
      clearTimeout(autosaveDebounceTimer)
      autosaveDebounceTimer = null
    }
    
    try {
      await storage.removeItem('contentbuilder_autosave')
      localStorage.removeItem('contentbuilder_autosave_fallback')
      lastSaved.value = null
    } catch (error) {
      console.warn('Failed to clear autosave:', error)
    }
  }
  
  const toggleAutosave = () => {
    autosaveEnabled.value = !autosaveEnabled.value
  }
  
  /**
   * Reset content state
   */
  const resetContentState = () => {
    chunks.value = []
    processedContents.value = []
    clearContentForm()
    currentStep.value = 1
    editingChunk.value = null
    expandedChunks.value = new Set()
    processing.value = false
    processingStatus.value = ''
    processingProgress.value = 0
    lastSaved.value = null
    
    // Manual reactivity triggers for performance
    triggerRef(chunks)
    triggerRef(processedContents)
  }
  
  // ===== WATCHERS =====
  
  // Auto-filter when chunks change (with autosave race condition protection)
  watch(() => chunks.value, () => {
    // Only apply filtering if not currently in an autosave operation
    if (!autosaveInProgress.value && filteredChunks.value.length > 0) {
      // Re-apply current filter if active
      filterContent('') // This will reset to show all
    }
  }, { 
    deep: true,
    // Flush timing to prevent interference with autosave operations
    flush: 'post'
  })
  
  // Emergency cleanup on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      // Cancel any pending debounced autosave
      if (autosaveDebounceTimer) {
        clearTimeout(autosaveDebounceTimer)
        // Perform immediate synchronous autosave if needed
        if (!autosaveInProgress.value && hasUnsavedChanges.value) {
          try {
            const fallbackData = {
              chunks: chunks.value,
              processedContents: processedContents.value,
              contentForm: contentForm.value,
              currentStep: currentStep.value,
              timestamp: Date.now()
            }
            localStorage.setItem('contentbuilder_emergency_save', JSON.stringify(fallbackData))
          } catch (error) {
            console.error('Emergency save failed:', error)
          }
        }
      }
    })
  }
  
  return {
    // State
    categories,
    chunks,
    filteredChunks,
    filteredCategories,
    processing,
    processingStatus,
    processingProgress,
    processedContents,
    currentStep,
    contentForm,
    editingChunk,
    expandedChunks,
    autosaveEnabled,
    lastSaved,
    autosaveInProgress,
    
    // Computed
    totalQuestions,
    totalChunks,
    uniqueSources,
    contentStats,
    isProcessing,
    canProceedToNextStep,
    hasUnsavedChanges,
    
    // Actions
    addCategory,
    updateCategory,
    deleteCategory,
    addQuestionToCategory,
    addChunk,
    addChunks,
    updateChunk,
    deleteChunk,
    deleteMultipleChunks,
    clearChunks,
    setProcessing,
    addProcessedContent,
    clearProcessedContents,
    setCurrentStep,
    nextStep,
    previousStep,
    updateContentForm,
    clearContentForm,
    setEditingChunk,
    toggleChunkExpanded,
    filterContent,
    loadInitialChunks,
    reconstructProcessedContents,
    triggerAutosave,
    loadFromAutosave,
    clearAutosave,
    toggleAutosave,
    resetContentState
  }
})