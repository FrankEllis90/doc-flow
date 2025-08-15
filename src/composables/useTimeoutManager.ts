import { ref, computed } from 'vue'
import { useErrorHandler } from './useErrorHandler'

interface TimeoutConfig {
  fileRead: number
  pdfParsing: number
  docxParsing: number
  markdownParsing: number
  textProcessing: number
  chunkGeneration: number
  overallProcessing: number
}

interface TimeoutSettings {
  small: TimeoutConfig    // < 5MB
  medium: TimeoutConfig   // 5-20MB  
  large: TimeoutConfig    // 20-50MB
  extraLarge: TimeoutConfig // > 50MB
}

interface ProcessingContext {
  fileSize: number
  fileName: string
  fileType: string
  operation: string
  startTime: number
}

export const useTimeoutManager = () => {
  const { handleAsyncError } = useErrorHandler()
  
  // Active timeout references for cleanup
  const activeTimeouts = ref(new Map<string, number>())
  const processingContexts = ref(new Map<string, ProcessingContext>())
  
  // Default timeout configurations (in milliseconds)
  const defaultTimeouts: TimeoutSettings = {
    small: {
      fileRead: 15000,      // 15 seconds
      pdfParsing: 30000,    // 30 seconds  
      docxParsing: 25000,   // 25 seconds
      markdownParsing: 10000, // 10 seconds
      textProcessing: 15000,  // 15 seconds
      chunkGeneration: 20000, // 20 seconds
      overallProcessing: 120000 // 2 minutes
    },
    medium: {
      fileRead: 30000,      // 30 seconds
      pdfParsing: 60000,    // 1 minute
      docxParsing: 45000,   // 45 seconds
      markdownParsing: 20000, // 20 seconds
      textProcessing: 30000,  // 30 seconds
      chunkGeneration: 40000, // 40 seconds
      overallProcessing: 300000 // 5 minutes
    },
    large: {
      fileRead: 60000,      // 1 minute
      pdfParsing: 120000,   // 2 minutes
      docxParsing: 90000,   // 1.5 minutes
      markdownParsing: 45000, // 45 seconds
      textProcessing: 60000,  // 1 minute
      chunkGeneration: 80000, // 80 seconds
      overallProcessing: 600000 // 10 minutes
    },
    extraLarge: {
      fileRead: 120000,     // 2 minutes
      pdfParsing: 300000,   // 5 minutes
      docxParsing: 180000,  // 3 minutes
      markdownParsing: 90000, // 1.5 minutes
      textProcessing: 120000, // 2 minutes
      chunkGeneration: 150000, // 2.5 minutes
      overallProcessing: 900000 // 15 minutes
    }
  }
  
  // User-configurable timeout multiplier
  const timeoutMultiplier = ref(1.0)
  
  const timeouts = computed(() => {
    const multiplier = timeoutMultiplier.value
    const result: TimeoutSettings = {} as TimeoutSettings
    
    for (const [size, config] of Object.entries(defaultTimeouts)) {
      result[size as keyof TimeoutSettings] = {} as TimeoutConfig
      for (const [operation, timeout] of Object.entries(config)) {
        result[size as keyof TimeoutSettings][operation as keyof TimeoutConfig] = Math.round((timeout as number) * multiplier)
      }
    }
    
    return result
  })
  
  /**
   * Get timeout configuration based on file size
   */
  const getTimeoutConfig = (fileSize: number): TimeoutConfig => {
    const sizeMB = fileSize / (1024 * 1024)
    
    if (sizeMB < 5) return timeouts.value.small
    if (sizeMB < 20) return timeouts.value.medium
    if (sizeMB < 50) return timeouts.value.large
    return timeouts.value.extraLarge
  }
  
  /**
   * Get specific timeout for operation based on file size and type
   */
  const getTimeout = (
    fileSize: number, 
    operation: keyof TimeoutConfig, 
    fileType?: string
  ): number => {
    const config = getTimeoutConfig(fileSize)
    
    // Apply file type specific adjustments
    let timeout = config[operation]
    
    if (fileType === 'application/pdf') {
      // PDFs generally take longer to process
      timeout *= 1.2
    } else if (fileType?.includes('docx')) {
      // DOCX files can be complex
      timeout *= 1.1
    }
    
    return Math.round(timeout)
  }
  
  /**
   * Create a timeout promise that rejects after specified time
   */
  const createTimeoutPromise = (
    timeout: number,
    operation: string,
    fileName: string,
    contextId?: string
  ): Promise<never> => {
    return new Promise((_, reject) => {
      const timeoutId = window.setTimeout(() => {
        // Clean up context if provided
        if (contextId) {
          processingContexts.value.delete(contextId)
          activeTimeouts.value.delete(contextId)
        }
        
        const error = new Error(`${operation} timeout after ${Math.round(timeout / 1000)}s for file: ${fileName}`)
        error.name = 'TimeoutError'
        reject(error)
      }, timeout)
      
      // Store timeout reference for cleanup
      if (contextId) {
        activeTimeouts.value.set(contextId, timeoutId)
      }
    })
  }
  
  /**
   * Execute operation with timeout based on file characteristics
   */
  const withTimeout = async <T>(
    operation: Promise<T>,
    config: {
      fileSize: number
      fileName: string
      fileType?: string
      operationType: keyof TimeoutConfig
      contextId?: string
      onTimeout?: (error: Error) => void
    }
  ): Promise<T> => {
    const timeout = getTimeout(config.fileSize, config.operationType, config.fileType)
    const contextId = config.contextId || `timeout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Store processing context
    processingContexts.value.set(contextId, {
      fileSize: config.fileSize,
      fileName: config.fileName,
      fileType: config.fileType || 'unknown',
      operation: config.operationType,
      startTime: Date.now()
    })
    
    const timeoutPromise = createTimeoutPromise(
      timeout, 
      config.operationType, 
      config.fileName,
      contextId
    )
    
    try {
      const result = await Promise.race([operation, timeoutPromise])
      
      // Clean up successful operation
      const timeoutId = activeTimeouts.value.get(contextId)
      if (timeoutId) {
        clearTimeout(timeoutId)
        activeTimeouts.value.delete(contextId)
      }
      processingContexts.value.delete(contextId)
      
      return result
    } catch (error) {
      // Clean up failed operation
      const timeoutId = activeTimeouts.value.get(contextId)
      if (timeoutId) {
        clearTimeout(timeoutId)
        activeTimeouts.value.delete(contextId)
      }
      processingContexts.value.delete(contextId)
      
      // Handle timeout-specific errors
      if (error instanceof Error && error.name === 'TimeoutError') {
        if (config.onTimeout) {
          config.onTimeout(error)
        }
        
        // Log timeout with context
        const context = processingContexts.value.get(contextId)
        handleAsyncError(() => {
          throw new Error(`Processing timeout: ${error.message}${context ? ` (Size: ${(context.fileSize / 1024 / 1024).toFixed(1)}MB, Duration: ${timeout/1000}s)` : ''}`)
        }, { 
          component: 'TimeoutManager', 
          action: config.operationType
        })
      }
      
      throw error
    }
  }
  
  /**
   * Cancel all active timeouts (useful for cleanup on component unmount)
   */
  const cancelAllTimeouts = () => {
    for (const [contextId, timeoutId] of activeTimeouts.value) {
      clearTimeout(timeoutId)
    }
    activeTimeouts.value.clear()
    processingContexts.value.clear()
  }
  
  /**
   * Cancel specific timeout by context ID
   */
  const cancelTimeout = (contextId: string) => {
    const timeoutId = activeTimeouts.value.get(contextId)
    if (timeoutId) {
      clearTimeout(timeoutId)
      activeTimeouts.value.delete(contextId)
    }
    processingContexts.value.delete(contextId)
  }
  
  /**
   * Get active processing contexts (for debugging/monitoring)
   */
  const getActiveContexts = () => {
    return Array.from(processingContexts.value.entries()).map(([id, context]) => ({
      id,
      ...context,
      duration: Date.now() - context.startTime
    }))
  }
  
  /**
   * Update timeout multiplier (for user preferences)
   */
  const setTimeoutMultiplier = (multiplier: number) => {
    if (multiplier >= 0.5 && multiplier <= 3.0) {
      timeoutMultiplier.value = multiplier
    } else {
      console.warn('Timeout multiplier should be between 0.5 and 3.0')
    }
  }
  
  /**
   * Get recommended timeout settings for file
   */
  const getRecommendedTimeouts = (fileSize: number, fileType?: string) => {
    const config = getTimeoutConfig(fileSize)
    const sizeMB = fileSize / (1024 * 1024)
    
    return {
      sizeCategory: sizeMB < 5 ? 'small' : sizeMB < 20 ? 'medium' : sizeMB < 50 ? 'large' : 'extraLarge',
      sizeMB: sizeMB.toFixed(1),
      fileType,
      timeouts: config,
      estimatedProcessingTime: `${Math.round(config.overallProcessing / 1000 / 60)} minutes`
    }
  }
  
  return {
    // Methods
    withTimeout,
    getTimeout,
    getTimeoutConfig,
    cancelAllTimeouts,
    cancelTimeout,
    getActiveContexts,
    setTimeoutMultiplier,
    getRecommendedTimeouts,
    
    // State
    timeouts: computed(() => timeouts.value),
    timeoutMultiplier: computed(() => timeoutMultiplier.value),
    activeProcessingCount: computed(() => processingContexts.value.size)
  }
}