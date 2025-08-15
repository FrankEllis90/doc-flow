import { ref } from 'vue'

export interface ErrorInfo {
  id: string
  message: string
  code?: string
  details?: string
  timestamp: Date
  component?: string
  action?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

const errors = ref<ErrorInfo[]>([])
const globalErrorHandler = ref<((error: ErrorInfo) => void) | null>(null)

export function useErrorHandler() {
  const addError = (error: Partial<ErrorInfo>) => {
    const errorInfo: ErrorInfo = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: error.message || 'An unexpected error occurred',
      code: error.code,
      details: error.details,
      timestamp: new Date(),
      component: error.component,
      action: error.action,
      severity: error.severity || 'medium'
    }
    
    errors.value.unshift(errorInfo)
    
    // Keep only last 50 errors to prevent memory bloat
    if (errors.value.length > 50) {
      errors.value = errors.value.slice(0, 50)
    }
    
    // Call global error handler if set
    if (globalErrorHandler.value) {
      globalErrorHandler.value(errorInfo)
    }
    
    // Log to console for debugging
    console.error('Application Error:', errorInfo)
    
    return errorInfo
  }
  
  const handleAsyncError = async <T>(
    operation: () => Promise<T>,
    context: { component?: string; action?: string } = {}
  ): Promise<{ data?: T; error?: ErrorInfo }> => {
    try {
      const data = await operation()
      return { data }
    } catch (error) {
      const errorInfo = addError({
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : String(error),
        component: context.component,
        action: context.action,
        severity: 'high'
      })
      return { error: errorInfo }
    }
  }
  
  const handleSyncError = <T>(
    operation: () => T,
    context: { component?: string; action?: string } = {}
  ): { data?: T; error?: ErrorInfo } => {
    try {
      const data = operation()
      return { data }
    } catch (error) {
      const errorInfo = addError({
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : String(error),
        component: context.component,
        action: context.action,
        severity: 'high'
      })
      return { error: errorInfo }
    }
  }
  
  const clearErrors = () => {
    errors.value = []
  }
  
  const removeError = (id: string) => {
    const index = errors.value.findIndex((e: ErrorInfo) => e.id === id)
    if (index > -1) {
      errors.value.splice(index, 1)
    }
  }
  
  const setGlobalErrorHandler = (handler: (error: ErrorInfo) => void) => {
    globalErrorHandler.value = handler
  }
  
  // Validation helpers with security enhancements
  const validateInput = (value: any, rules: ValidationRule[]): ValidationResult => {
    const errors: string[] = []
    const warnings: string[] = []
    
    // Convert to string and apply basic sanitization
    let sanitizedValue = ''
    if (value !== null && value !== undefined) {
      sanitizedValue = value.toString().trim()
      
      // Security check for dangerous patterns
      const dangerousPatterns = [
        /<script[^>]*>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /(union|select|insert|update|delete|drop)\s+/gi
      ]
      
      const originalLength = sanitizedValue.length
      dangerousPatterns.forEach(pattern => {
        sanitizedValue = sanitizedValue.replace(pattern, '')
      })
      
      if (sanitizedValue.length !== originalLength) {
        warnings.push('Potentially unsafe content was removed')
      }
    }
    
    for (const rule of rules) {
      if (rule.required && (!sanitizedValue || sanitizedValue === '')) {
        errors.push(rule.message || 'This field is required')
        continue
      }
      
      if (sanitizedValue && rule.minLength && sanitizedValue.length < rule.minLength) {
        errors.push(rule.message || `Minimum length is ${rule.minLength}`)
      }
      
      if (sanitizedValue && rule.maxLength && sanitizedValue.length > rule.maxLength) {
        errors.push(rule.message || `Maximum length is ${rule.maxLength}`)
      }
      
      if (sanitizedValue && rule.pattern && !rule.pattern.test(sanitizedValue)) {
        errors.push(rule.message || 'Invalid format')
      }
      
      if (sanitizedValue && rule.custom && !rule.custom(sanitizedValue)) {
        errors.push(rule.message || 'Validation failed')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: [...errors, ...warnings],
      sanitizedValue
    }
  }
  
  return {
    errors,
    addError,
    handleAsyncError,
    handleSyncError,
    clearErrors,
    removeError,
    setGlobalErrorHandler,
    validateInput
  }
}

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => boolean
  message?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  sanitizedValue?: string
}

// Global error handling setup - prevent memory leaks by using singleton pattern
let globalErrorHandlerInitialized = false

export function initializeGlobalErrorHandlers() {
  if (globalErrorHandlerInitialized) return
  
  // Create a single error handler instance for global use
  const globalErrorHandler = useErrorHandler()
  
  // Global error handler for uncaught errors
  const handleGlobalError = (event: ErrorEvent) => {
    globalErrorHandler.addError({
      message: event.message || 'Unknown error',
      details: `${event.filename || 'unknown'}:${event.lineno || 0}:${event.colno || 0}`,
      severity: 'critical',
      action: 'window.error'
    })
  }

  // Global handler for unhandled promise rejections
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    globalErrorHandler.addError({
      message: 'Unhandled promise rejection',
      details: event.reason?.toString() || 'Unknown rejection',
      severity: 'critical',
      action: 'unhandledrejection'
    })
    
    // Prevent default browser behavior
    event.preventDefault()
  }
  
  // Add event listeners
  window.addEventListener('error', handleGlobalError)
  window.addEventListener('unhandledrejection', handleUnhandledRejection)
  
  // Cleanup function for proper removal
  const cleanup = () => {
    window.removeEventListener('error', handleGlobalError)
    window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    globalErrorHandlerInitialized = false
  }
  
  // Store cleanup function for later use if needed
  if (typeof window !== 'undefined') {
    (window as any).__errorHandlerCleanup = cleanup
  }
  
  globalErrorHandlerInitialized = true
}