import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import storage from '@/services/indexedDBStorage'
import { useErrorHandler } from '@/composables/useErrorHandler'

export interface PersistenceOptions {
  enabled: boolean
  debounceMs: number
  retryAttempts: number
  retryDelay: number
}

/**
 * Focused Persistence Store
 * Manages autosave, data persistence, and recovery operations
 */
export const usePersistenceStore = defineStore('persistence', () => {
  const { addError } = useErrorHandler()
  
  // ===== STATE =====
  
  const autosaveEnabled = ref(true)
  const lastSaved = ref<Date | null>(null)
  const autosaveInProgress = ref(false)
  const autosaveQueue = ref<Promise<void> | null>(null)
  
  // Configuration
  const config = ref<PersistenceOptions>({
    enabled: true,
    debounceMs: 1000,
    retryAttempts: 3,
    retryDelay: 500
  })
  
  // Performance tracking
  const persistenceStats = ref({
    saveCount: 0,
    failureCount: 0,
    totalSaveTime: 0,
    lastSaveTime: 0,
    averageSaveTime: 0,
    dataSize: 0
  })
  
  // Debounce timer
  let debounceTimer: number | null = null
  
  // ===== COMPUTED =====
  
  const hasUnsavedChanges = computed(() => {
    // This will be implemented by consuming stores
    return false
  })
  
  const isAutosaving = computed(() => autosaveInProgress.value)
  
  const saveSuccessRate = computed(() => {
    const total = persistenceStats.value.saveCount + persistenceStats.value.failureCount
    return total > 0 ? (persistenceStats.value.saveCount / total) * 100 : 100
  })
  
  const averageSaveTime = computed(() => {
    return persistenceStats.value.saveCount > 0 
      ? persistenceStats.value.totalSaveTime / persistenceStats.value.saveCount
      : 0
  })
  
  // ===== ACTIONS =====
  
  /**
   * Configure persistence options
   */
  const configure = (options: Partial<PersistenceOptions>) => {
    config.value = { ...config.value, ...options }
  }
  
  /**
   * Trigger autosave with debouncing
   */
  const triggerAutosave = (data: any, key = 'contentbuilder_autosave') => {
    if (!autosaveEnabled.value || !config.value.enabled) return
    
    // Debounce rapid autosave calls
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    
    debounceTimer = window.setTimeout(() => {
      performAutosave(data, key)
    }, config.value.debounceMs)
  }
  
  /**
   * Perform autosave operation with race condition protection
   */
  const performAutosave = async (data: any, key = 'contentbuilder_autosave'): Promise<void> => {
    if (autosaveInProgress.value) return
    
    // If there's already a queued autosave, wait for it
    if (autosaveQueue.value) {
      try {
        await autosaveQueue.value
      } catch (error) {
        console.warn('Previous autosave failed:', error)
      }
    }
    
    // Create new autosave operation
    const autosaveOperation = executeAutosave(data, key)
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
  
  /**
   * Execute autosave with retry logic
   */
  const executeAutosave = async (data: any, key: string, attempt = 1): Promise<void> => {
    if (autosaveInProgress.value) {
      throw new Error('Autosave already in progress')
    }
    
    autosaveInProgress.value = true
    const startTime = performance.now()
    
    try {
      // Create optimized data structure for saving
      const saveData = {
        ...data,
        timestamp: Date.now(),
        version: '1.0'
      }
      
      // Use structured cloning instead of JSON.stringify for better performance
      const clonedData = structuredClone ? structuredClone(saveData) : JSON.parse(JSON.stringify(saveData))
      
      await storage.setItem(key, clonedData, 'autosave')
      
      // Update stats
      const saveTime = performance.now() - startTime
      persistenceStats.value.saveCount++
      persistenceStats.value.totalSaveTime += saveTime
      persistenceStats.value.lastSaveTime = saveTime
      persistenceStats.value.averageSaveTime = persistenceStats.value.totalSaveTime / persistenceStats.value.saveCount
      persistenceStats.value.dataSize = JSON.stringify(clonedData).length
      
      lastSaved.value = new Date()
      
    } catch (error) {
      console.warn(`Autosave attempt ${attempt} failed:`, error)
      persistenceStats.value.failureCount++
      
      // Retry logic for transient failures
      if (attempt < config.value.retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, config.value.retryDelay * attempt))
        return executeAutosave(data, key, attempt + 1)
      } else {
        // Final attempt failed - try localStorage fallback
        await fallbackSave(data, key)
      }
    } finally {
      autosaveInProgress.value = false
    }
  }
  
  /**
   * Fallback save to localStorage
   */
  const fallbackSave = async (data: any, key: string) => {
    try {
      const fallbackKey = `${key}_fallback`
      const fallbackData = {
        ...data,
        timestamp: Date.now(),
        isFallback: true
      }
      
      const jsonData = JSON.stringify(fallbackData)
      
      // Check localStorage capacity
      if (jsonData.length > 5 * 1024 * 1024) { // 5MB limit
        console.warn('Data too large for localStorage fallback')
        addError('Autosave failed - data too large for backup storage')
        return
      }
      
      localStorage.setItem(fallbackKey, jsonData)
      console.warn('Autosave failed, data saved to localStorage fallback')
      
      // Update stats
      persistenceStats.value.saveCount++
      lastSaved.value = new Date()
      
    } catch (fallbackError) {
      console.error('Critical: Both IndexedDB and localStorage autosave failed:', fallbackError)
      addError('Critical autosave failure - your changes may not be saved automatically')
    }
  }
  
  /**
   * Load data with fallback support
   */
  const loadData = async <T>(key = 'contentbuilder_autosave'): Promise<T | null> => {
    // Prevent loading while autosave is in progress
    if (autosaveInProgress.value) {
      console.warn('Cannot load data while save is in progress')
      return null
    }
    
    try {
      // Try primary storage first
      const saved = await storage.getItem(key)
      if (saved) {
        return saved as T
      }
      
      // Try fallback if primary not found
      const fallbackKey = `${key}_fallback`
      const fallback = localStorage.getItem(fallbackKey)
      if (fallback) {
        const fallbackData = JSON.parse(fallback)
        
        // Clean up fallback after successful load
        localStorage.removeItem(fallbackKey)
        console.info('Loaded from localStorage fallback')
        return fallbackData as T
      }
      
    } catch (error) {
      console.warn('Failed to load data:', error)
    }
    
    return null
  }
  
  /**
   * Clear persisted data
   */
  const clearData = async (key = 'contentbuilder_autosave'): Promise<void> => {
    // Wait for any ongoing autosave to complete
    if (autosaveQueue.value) {
      try {
        await autosaveQueue.value
      } catch (error) {
        console.warn('Error waiting for autosave to complete:', error)
      }
    }
    
    // Clear debounce timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    
    try {
      await storage.removeItem(key)
      localStorage.removeItem(`${key}_fallback`)
      localStorage.removeItem('contentbuilder_emergency_save')
      lastSaved.value = null
    } catch (error) {
      console.warn('Failed to clear data:', error)
    }
  }
  
  /**
   * Emergency save on page unload
   */
  const emergencySave = (data: any, key = 'contentbuilder_emergency_save') => {
    try {
      const emergencyData = {
        ...data,
        timestamp: Date.now(),
        isEmergency: true
      }
      localStorage.setItem(key, JSON.stringify(emergencyData))
    } catch (error) {
      console.error('Emergency save failed:', error)
    }
  }
  
  /**
   * Load emergency save data
   */
  const loadEmergencyData = <T>(key = 'contentbuilder_emergency_save'): T | null => {
    try {
      const data = localStorage.getItem(key)
      if (data) {
        localStorage.removeItem(key) // Clean up after load
        return JSON.parse(data) as T
      }
    } catch (error) {
      console.warn('Failed to load emergency data:', error)
    }
    return null
  }
  
  /**
   * Toggle autosave
   */
  const toggleAutosave = () => {
    autosaveEnabled.value = !autosaveEnabled.value
  }
  
  /**
   * Force save data immediately
   */
  const forceSave = async (data: any, key = 'contentbuilder_autosave') => {
    // Clear any pending debounced save
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    
    return performAutosave(data, key)
  }
  
  /**
   * Get performance metrics
   */
  const getPerformanceMetrics = () => ({
    ...persistenceStats.value,
    successRate: saveSuccessRate.value,
    averageSaveTime: averageSaveTime.value,
    autosaveEnabled: autosaveEnabled.value,
    lastSaved: lastSaved.value?.toISOString(),
    isAutosaving: autosaveInProgress.value,
    configuredDebounce: config.value.debounceMs,
    dataSizeMB: (persistenceStats.value.dataSize / 1024 / 1024).toFixed(2)
  })
  
  /**
   * Reset persistence stats
   */
  const resetStats = () => {
    persistenceStats.value = {
      saveCount: 0,
      failureCount: 0,
      totalSaveTime: 0,
      lastSaveTime: 0,
      averageSaveTime: 0,
      dataSize: 0
    }
  }
  
  // Emergency cleanup on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      // Cancel any pending debounced autosave
      if (debounceTimer) {
        clearTimeout(debounceTimer)
        debounceTimer = null
      }
    })
  }
  
  return {
    // State
    autosaveEnabled,
    lastSaved,
    autosaveInProgress,
    config,
    persistenceStats,
    
    // Computed
    hasUnsavedChanges,
    isAutosaving,
    saveSuccessRate,
    averageSaveTime,
    
    // Actions
    configure,
    triggerAutosave,
    performAutosave,
    loadData,
    clearData,
    emergencySave,
    loadEmergencyData,
    toggleAutosave,
    forceSave,
    getPerformanceMetrics,
    resetStats
  }
})