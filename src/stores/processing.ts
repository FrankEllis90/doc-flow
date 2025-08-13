import { defineStore } from 'pinia'
import { ref, computed, shallowRef, triggerRef } from 'vue'

export interface ProcessingTask {
  id: string
  type: 'pdf' | 'markdown' | 'docx' | 'text' | 'chunk'
  status: 'pending' | 'processing' | 'completed' | 'error' | 'timeout'
  progress: number
  fileName?: string
  fileSize?: number
  startTime?: number
  endTime?: number
  error?: string
  result?: any
  timeoutDuration?: number
  timeoutReason?: string
}

/**
 * Focused Processing Store
 * Manages document processing state, queue, and operations
 */
export const useProcessingStore = defineStore('processing', () => {
  // ===== STATE =====
  
  const processing = ref(false)
  const processingStatus = ref('')
  const processingProgress = ref(0)
  const currentStep = ref(1)
  
  // Processing queue for batch operations
  const processingQueue = shallowRef<ProcessingTask[]>([])
  const completedTasks = shallowRef<ProcessingTask[]>([])
  const errorTasks = shallowRef<ProcessingTask[]>([])
  const timeoutTasks = shallowRef<ProcessingTask[]>([])
  
  // File upload state
  const fileQueue = shallowRef<File[]>([])
  const processedFiles = shallowRef<any[]>([])
  
  // Performance monitoring
  const processingStats = ref({
    startTime: null as number | null,
    endTime: null as number | null,
    totalFiles: 0,
    processedFiles: 0,
    totalChunks: 0,
    errors: 0,
    timeouts: 0,
    averageProcessingTime: 0
  })
  
  // Timeout configuration
  const timeoutSettings = ref({
    enabled: true,
    multiplier: 1.0,
    maxRetries: 2,
    retryWithIncreasedTimeout: true
  })
  
  // ===== COMPUTED =====
  
  const isProcessing = computed(() => processing.value)
  
  const queueLength = computed(() => processingQueue.value.length)
  
  const completedTasksCount = computed(() => completedTasks.value.length)
  
  const errorTasksCount = computed(() => errorTasks.value.length)
  
  const timeoutTasksCount = computed(() => timeoutTasks.value.length)
  
  const processingProgressTotal = computed(() => {
    if (processingQueue.value.length === 0) return 100
    
    const totalProgress = processingQueue.value.reduce((sum, task) => sum + task.progress, 0)
    return Math.round(totalProgress / processingQueue.value.length)
  })
  
  const canProceedToNextStep = computed(() => {
    switch (currentStep.value) {
      case 1: return processedFiles.value.length > 0 || completedTasksCount.value > 0
      case 2: return completedTasksCount.value > 0
      case 3: return true
      default: return false
    }
  })
  
  const estimatedTimeRemaining = computed(() => {
    if (!processing.value || processingStats.value.averageProcessingTime === 0) return 0
    
    const remainingTasks = processingQueue.value.filter(task => task.status === 'pending').length
    return remainingTasks * processingStats.value.averageProcessingTime
  })
  
  // ===== ACTIONS =====
  
  /**
   * Set processing state
   */
  const setProcessing = (isProcessing: boolean, status = '', progress = 0) => {
    processing.value = isProcessing
    processingStatus.value = status
    processingProgress.value = progress
    
    if (isProcessing && !processingStats.value.startTime) {
      processingStats.value.startTime = Date.now()
    } else if (!isProcessing && processingStats.value.startTime) {
      processingStats.value.endTime = Date.now()
      updateAverageProcessingTime()
    }
  }
  
  /**
   * Update processing progress
   */
  const updateProgress = (progress: number, status?: string) => {
    processingProgress.value = Math.min(100, Math.max(0, progress))
    if (status) processingStatus.value = status
  }
  
  /**
   * Add task to processing queue
   */
  const addTask = (taskData: Omit<ProcessingTask, 'id' | 'progress' | 'status'>): ProcessingTask => {
    const task: ProcessingTask = {
      ...taskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      progress: 0
    }
    
    processingQueue.value.push(task)
    triggerRef(processingQueue)
    
    return task
  }
  
  /**
   * Update task status and progress
   */
  const updateTask = (taskId: string, updates: Partial<ProcessingTask>) => {
    const index = processingQueue.value.findIndex(task => task.id === taskId)
    if (index > -1) {
      processingQueue.value[index] = { ...processingQueue.value[index], ...updates }
      triggerRef(processingQueue)
      
      // Move to appropriate list based on status
      const task = processingQueue.value[index]
      if (task.status === 'completed') {
        moveTaskToCompleted(taskId)
      } else if (task.status === 'error') {
        moveTaskToError(taskId)
      } else if (task.status === 'timeout') {
        moveTaskToTimeout(taskId)
      }
    }
  }
  
  /**
   * Move task to completed list
   */
  const moveTaskToCompleted = (taskId: string) => {
    const taskIndex = processingQueue.value.findIndex(task => task.id === taskId)
    if (taskIndex > -1) {
      const task = { ...processingQueue.value[taskIndex], endTime: Date.now() }
      completedTasks.value.push(task)
      processingQueue.value.splice(taskIndex, 1)
      
      triggerRef(completedTasks)
      triggerRef(processingQueue)
      
      // Update stats
      processingStats.value.processedFiles++
    }
  }
  
  /**
   * Move task to error list
   */
  const moveTaskToError = (taskId: string) => {
    const taskIndex = processingQueue.value.findIndex(task => task.id === taskId)
    if (taskIndex > -1) {
      const task = { ...processingQueue.value[taskIndex], endTime: Date.now() }
      errorTasks.value.push(task)
      processingQueue.value.splice(taskIndex, 1)
      
      triggerRef(errorTasks)
      triggerRef(processingQueue)
      
      // Update stats
      processingStats.value.errors++
    }
  }
  
  /**
   * Move task to timeout list
   */
  const moveTaskToTimeout = (taskId: string) => {
    const taskIndex = processingQueue.value.findIndex(task => task.id === taskId)
    if (taskIndex > -1) {
      const task = { ...processingQueue.value[taskIndex], endTime: Date.now() }
      timeoutTasks.value.push(task)
      processingQueue.value.splice(taskIndex, 1)
      
      triggerRef(timeoutTasks)
      triggerRef(processingQueue)
      
      // Update stats
      processingStats.value.timeouts++
    }
  }
  
  /**
   * Clear completed tasks
   */
  const clearCompletedTasks = () => {
    completedTasks.value = []
    triggerRef(completedTasks)
  }
  
  /**
   * Clear error tasks
   */
  const clearErrorTasks = () => {
    errorTasks.value = []
    triggerRef(errorTasks)
  }
  
  /**
   * Clear timeout tasks
   */
  const clearTimeoutTasks = () => {
    timeoutTasks.value = []
    triggerRef(timeoutTasks)
  }
  
  /**
   * Retry failed task
   */
  const retryTask = (taskId: string) => {
    const errorIndex = errorTasks.value.findIndex(task => task.id === taskId)
    if (errorIndex > -1) {
      const task = {
        ...errorTasks.value[errorIndex],
        status: 'pending' as const,
        progress: 0,
        error: undefined,
        startTime: undefined,
        endTime: undefined
      }
      
      processingQueue.value.push(task)
      errorTasks.value.splice(errorIndex, 1)
      
      triggerRef(processingQueue)
      triggerRef(errorTasks)
    }
  }
  
  /**
   * Retry timeout task with increased timeout
   */
  const retryTimeoutTask = (taskId: string, increaseTimeout = true) => {
    const timeoutIndex = timeoutTasks.value.findIndex(task => task.id === taskId)
    if (timeoutIndex > -1) {
      const task = {
        ...timeoutTasks.value[timeoutIndex],
        status: 'pending' as const,
        progress: 0,
        error: undefined,
        timeoutReason: undefined,
        startTime: undefined,
        endTime: undefined
      }
      
      // Increase timeout duration if requested
      if (increaseTimeout && task.timeoutDuration) {
        task.timeoutDuration = Math.round(task.timeoutDuration * 1.5)
      }
      
      processingQueue.value.push(task)
      timeoutTasks.value.splice(timeoutIndex, 1)
      
      triggerRef(processingQueue)
      triggerRef(timeoutTasks)
    }
  }
  
  /**
   * Add files to queue
   */
  const addFilesToQueue = (files: File[]) => {
    fileQueue.value.push(...files)
    processingStats.value.totalFiles += files.length
    triggerRef(fileQueue)
  }
  
  /**
   * Remove file from queue
   */
  const removeFileFromQueue = (fileIndex: number) => {
    if (fileIndex >= 0 && fileIndex < fileQueue.value.length) {
      fileQueue.value.splice(fileIndex, 1)
      triggerRef(fileQueue)
    }
  }
  
  /**
   * Clear file queue
   */
  const clearFileQueue = () => {
    fileQueue.value = []
    triggerRef(fileQueue)
  }
  
  /**
   * Add processed content
   */
  const addProcessedContent = (content: any) => {
    processedFiles.value.push(content)
    triggerRef(processedFiles)
  }
  
  /**
   * Clear processed content
   */
  const clearProcessedContent = () => {
    processedFiles.value = []
    triggerRef(processedFiles)
  }
  
  /**
   * Step management
   */
  const setCurrentStep = (step: number) => {
    if (step >= 1 && step <= 4) {
      currentStep.value = step
    }
  }
  
  const nextStep = () => {
    if (canProceedToNextStep.value && currentStep.value < 4) {
      currentStep.value++
    }
  }
  
  const previousStep = () => {
    if (currentStep.value > 1) {
      currentStep.value--
    }
  }
  
  /**
   * Update timeout settings
   */
  const updateTimeoutSettings = (settings: Partial<typeof timeoutSettings.value>) => {
    timeoutSettings.value = { ...timeoutSettings.value, ...settings }
  }
  
  /**
   * Reset all processing state
   */
  const resetProcessingState = () => {
    processing.value = false
    processingStatus.value = ''
    processingProgress.value = 0
    currentStep.value = 1
    
    processingQueue.value = []
    completedTasks.value = []
    errorTasks.value = []
    timeoutTasks.value = []
    fileQueue.value = []
    processedFiles.value = []
    
    processingStats.value = {
      startTime: null,
      endTime: null,
      totalFiles: 0,
      processedFiles: 0,
      totalChunks: 0,
      errors: 0,
      timeouts: 0,
      averageProcessingTime: 0
    }
    
    triggerRef(processingQueue)
    triggerRef(completedTasks)
    triggerRef(errorTasks)
    triggerRef(timeoutTasks)
    triggerRef(fileQueue)
    triggerRef(processedFiles)
  }
  
  /**
   * Update average processing time
   */
  const updateAverageProcessingTime = () => {
    const completedWithTimes = completedTasks.value.filter(task => task.startTime && task.endTime)
    if (completedWithTimes.length > 0) {
      const totalTime = completedWithTimes.reduce((sum, task) => {
        return sum + (task.endTime! - task.startTime!)
      }, 0)
      processingStats.value.averageProcessingTime = totalTime / completedWithTimes.length
    }
  }
  
  /**
   * Get performance metrics
   */
  const getPerformanceMetrics = () => {
    const totalTime = processingStats.value.endTime && processingStats.value.startTime
      ? processingStats.value.endTime - processingStats.value.startTime
      : 0
      
    return {
      totalProcessingTime: totalTime,
      averageProcessingTime: processingStats.value.averageProcessingTime,
      successRate: processingStats.value.totalFiles > 0 
        ? ((processingStats.value.processedFiles / processingStats.value.totalFiles) * 100).toFixed(1) + '%'
        : '0%',
      errorRate: processingStats.value.totalFiles > 0
        ? ((processingStats.value.errors / processingStats.value.totalFiles) * 100).toFixed(1) + '%'
        : '0%',
      throughput: totalTime > 0 
        ? ((processingStats.value.processedFiles / (totalTime / 1000)) * 60).toFixed(1) + ' files/min'
        : '0 files/min'
    }
  }
  
  return {
    // State
    processing,
    processingStatus,
    processingProgress,
    currentStep,
    processingQueue,
    completedTasks,
    errorTasks,
    timeoutTasks,
    fileQueue,
    processedFiles,
    processingStats,
    timeoutSettings,
    
    // Computed
    isProcessing,
    queueLength,
    completedTasksCount,
    errorTasksCount,
    timeoutTasksCount,
    processingProgressTotal,
    canProceedToNextStep,
    estimatedTimeRemaining,
    
    // Actions
    setProcessing,
    updateProgress,
    addTask,
    updateTask,
    moveTaskToCompleted,
    moveTaskToError,
    moveTaskToTimeout,
    clearCompletedTasks,
    clearErrorTasks,
    clearTimeoutTasks,
    retryTask,
    retryTimeoutTask,
    addFilesToQueue,
    removeFileFromQueue,
    clearFileQueue,
    addProcessedContent,
    clearProcessedContent,
    setCurrentStep,
    nextStep,
    previousStep,
    updateTimeoutSettings,
    resetProcessingState,
    updateAverageProcessingTime,
    getPerformanceMetrics
  }
})