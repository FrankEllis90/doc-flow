<template>
  <div v-if="!hasError">
    <slot />
  </div>
  <div v-else class="async-error-boundary">
    <div class="error-container">
      <!-- Error Icon -->
      <div class="error-icon-wrapper">
        <i :class="errorIcon" class="error-icon"></i>
      </div>
      
      <!-- Error Content -->
      <div class="error-content">
        <h3 class="error-title">{{ errorTitle }}</h3>
        <p class="error-message">{{ errorMessage }}</p>
        
        <!-- Contextual Help -->
        <div v-if="contextualHelp" class="contextual-help">
          <i class="fas fa-info-circle mr-2"></i>
          <span>{{ contextualHelp }}</span>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="error-actions">
        <button @click="retry" class="btn btn-primary">
          <i class="fas fa-redo mr-2"></i>
          Try Again
        </button>
        
        <button 
          v-if="allowSkip"
          @click="skip"
          class="btn btn-secondary"
        >
          Skip & Continue
        </button>
        
        <button
          v-if="showDetails && errorDetails"
          @click="toggleDetails"
          class="btn btn-outline"
        >
          <i :class="showErrorDetails ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="mr-2"></i>
          {{ showErrorDetails ? 'Hide' : 'Show' }} Details
        </button>
      </div>
      
      <!-- Error Details -->
      <transition name="slide-down">
        <div v-if="showErrorDetails && errorDetails" class="error-details">
          <div class="details-header">
            <h4>Technical Details</h4>
            <button @click="copyErrorDetails" class="copy-btn">
              <i class="fas fa-copy"></i>
              Copy
            </button>
          </div>
          <pre class="details-content">{{ errorDetails }}</pre>
          <div class="details-footer">
            <span class="error-id">Error ID: {{ errorId }}</span>
            <span class="error-timestamp">{{ errorTimestamp }}</span>
          </div>
        </div>
      </transition>
      
      <!-- Auto-retry indicator -->
      <div v-if="autoRetrying" class="auto-retry-indicator">
        <div class="spinner"></div>
        <span>Automatically retrying in {{ autoRetryCountdown }}s...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onErrorCaptured, watch } from 'vue'
import { useErrorHandler } from '../composables/useErrorHandler.ts'

export default {
  name: 'AsyncErrorBoundary',
  props: {
    // Basic props
    fallbackTitle: {
      type: String,
      default: 'Something went wrong'
    },
    fallbackMessage: {
      type: String,
      default: 'An unexpected error occurred. Please try again.'
    },
    
    // Behavior props
    autoRetry: {
      type: Boolean,
      default: false
    },
    maxRetries: {
      type: Number,
      default: 3
    },
    retryDelay: {
      type: Number,
      default: 3000
    },
    allowSkip: {
      type: Boolean,
      default: false
    },
    
    // Display props
    showDetails: {
      type: Boolean,
      default: true
    },
    errorIcon: {
      type: String,
      default: 'fas fa-exclamation-triangle'
    },
    contextualHelp: {
      type: String,
      default: null
    },
    
    // Error types to catch
    catchNetworkErrors: {
      type: Boolean,
      default: true
    },
    catchAsyncErrors: {
      type: Boolean,
      default: true
    },
    
    // Callbacks
    onError: {
      type: Function,
      default: null
    },
    onRetry: {
      type: Function,
      default: null
    },
    onSkip: {
      type: Function,
      default: null
    }
  },
  emits: ['error-occurred', 'error-retry', 'error-skip', 'error-resolved'],
  setup(props, { emit }) {
    const { addError } = useErrorHandler()
    
    // State
    const hasError = ref(false)
    const errorTitle = ref(props.fallbackTitle)
    const errorMessage = ref(props.fallbackMessage)
    const errorDetails = ref('')
    const errorId = ref('')
    const errorTimestamp = ref('')
    const showErrorDetails = ref(false)
    const retryCount = ref(0)
    const autoRetrying = ref(false)
    const autoRetryCountdown = ref(0)
    const autoRetryTimer = ref(null)
    const countdownTimer = ref(null)
    
    // Computed
    const canRetry = computed(() => retryCount.value < props.maxRetries)
    
    // Methods
    const handleError = (error, instance, info) => {
      // Don't handle if already handling an error
      if (hasError.value && autoRetrying.value) return
      
      hasError.value = true
      
      // Determine error type and severity
      const errorType = determineErrorType(error)
      const severity = determineSeverity(error, errorType)
      
      // Create error info
      const errorInfo = addError({
        message: error.message || 'Unknown error occurred',
        details: formatErrorDetails(error, instance, info),
        component: instance?.$options?.name || instance?.type?.name || 'Unknown',
        action: info || 'component-operation',
        severity
      })
      
      // Update display
      errorId.value = errorInfo.id
      errorDetails.value = errorInfo.details || ''
      errorTimestamp.value = new Date(errorInfo.timestamp).toLocaleString()
      
      // Update messages based on error type
      updateErrorMessages(error, errorType)
      
      // Call custom error handler
      if (props.onError) {
        props.onError(error, errorInfo)
      }
      
      // Emit error event
      emit('error-occurred', { 
        error, 
        errorInfo, 
        errorType,
        retryCount: retryCount.value 
      })
      
      // Auto-retry for certain errors
      if (props.autoRetry && canRetry.value && shouldAutoRetry(errorType)) {
        startAutoRetry()
      }
    }
    
    const determineErrorType = (error) => {
      const message = error.message?.toLowerCase() || ''
      const name = error.name?.toLowerCase() || ''
      
      if (message.includes('network') || message.includes('fetch') || name === 'networkerror') {
        return 'network'
      }
      if (message.includes('timeout') || name === 'timeouterror') {
        return 'timeout'
      }
      if (message.includes('memory') || name === 'rangeerror') {
        return 'memory'
      }
      if (message.includes('permission') || message.includes('denied')) {
        return 'permission'
      }
      if (message.includes('not found') || message.includes('404')) {
        return 'notfound'
      }
      if (error.isAxiosError || error.response) {
        return 'api'
      }
      return 'generic'
    }
    
    const determineSeverity = (error, errorType) => {
      if (errorType === 'network' || errorType === 'timeout') return 'medium'
      if (errorType === 'memory' || errorType === 'permission') return 'high'
      if (error.critical || error.severity === 'critical') return 'critical'
      return 'medium'
    }
    
    const formatErrorDetails = (error, instance, info) => {
      const details = []
      
      details.push(`Error: ${error.message || 'Unknown error'}`)
      details.push(`Type: ${error.name || 'Error'}`)
      
      if (instance) {
        details.push(`Component: ${instance.$options?.name || instance.type?.name || 'Unknown'}`)
      }
      
      if (info) {
        details.push(`Info: ${info}`)
      }
      
      if (error.stack) {
        details.push('\nStack Trace:')
        details.push(error.stack)
      }
      
      if (error.response) {
        details.push('\nAPI Response:')
        details.push(JSON.stringify(error.response, null, 2))
      }
      
      return details.join('\n')
    }
    
    const updateErrorMessages = (error, errorType) => {
      const messages = {
        network: {
          title: 'Connection Problem',
          message: 'Unable to connect to the server. Please check your internet connection.'
        },
        timeout: {
          title: 'Request Timeout',
          message: 'The operation took too long to complete. Please try again.'
        },
        memory: {
          title: 'Memory Issue',
          message: 'The application is running low on memory. Please refresh the page.'
        },
        permission: {
          title: 'Permission Denied',
          message: 'You don\'t have permission to perform this action.'
        },
        notfound: {
          title: 'Not Found',
          message: 'The requested resource could not be found.'
        },
        api: {
          title: 'Server Error',
          message: error.response?.data?.message || 'The server encountered an error processing your request.'
        },
        generic: {
          title: props.fallbackTitle,
          message: error.message || props.fallbackMessage
        }
      }
      
      const config = messages[errorType] || messages.generic
      errorTitle.value = config.title
      errorMessage.value = config.message
    }
    
    const shouldAutoRetry = (errorType) => {
      return ['network', 'timeout', 'api'].includes(errorType)
    }
    
    const startAutoRetry = () => {
      autoRetrying.value = true
      autoRetryCountdown.value = Math.ceil(props.retryDelay / 1000)
      
      // Countdown timer
      countdownTimer.value = setInterval(() => {
        autoRetryCountdown.value--
        if (autoRetryCountdown.value <= 0) {
          clearInterval(countdownTimer.value)
        }
      }, 1000)
      
      // Retry timer
      autoRetryTimer.value = setTimeout(() => {
        autoRetrying.value = false
        retry()
      }, props.retryDelay)
    }
    
    const cancelAutoRetry = () => {
      if (autoRetryTimer.value) {
        clearTimeout(autoRetryTimer.value)
        autoRetryTimer.value = null
      }
      if (countdownTimer.value) {
        clearInterval(countdownTimer.value)
        countdownTimer.value = null
      }
      autoRetrying.value = false
      autoRetryCountdown.value = 0
    }
    
    const retry = () => {
      cancelAutoRetry()
      retryCount.value++
      hasError.value = false
      showErrorDetails.value = false
      
      if (props.onRetry) {
        props.onRetry(retryCount.value)
      }
      
      emit('error-retry', { retryCount: retryCount.value })
      
      // Force re-render
      setTimeout(() => {
        if (!hasError.value) {
          emit('error-resolved')
        }
      }, 100)
    }
    
    const skip = () => {
      cancelAutoRetry()
      hasError.value = false
      
      if (props.onSkip) {
        props.onSkip()
      }
      
      emit('error-skip')
    }
    
    const toggleDetails = () => {
      showErrorDetails.value = !showErrorDetails.value
    }
    
    const copyErrorDetails = async () => {
      const text = `Error ID: ${errorId.value}\n${errorDetails.value}`
      
      try {
        await navigator.clipboard.writeText(text)
        
        // Show success feedback
        if (window.showNotification) {
          window.showNotification({
            type: 'success',
            title: 'Copied',
            message: 'Error details copied to clipboard',
            duration: 2000
          })
        }
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
    
    // Error capture
    onErrorCaptured((error, instance, info) => {
      handleError(error, instance, info)
      return false // Prevent propagation
    })
    
    // Watch for async errors in child components
    if (props.catchAsyncErrors) {
      // This will be handled by the global error handler
      // but we can add specific handling here if needed
    }
    
    // Cleanup
    const cleanup = () => {
      cancelAutoRetry()
    }
    
    return {
      hasError,
      errorTitle,
      errorMessage,
      errorDetails,
      errorId,
      errorTimestamp,
      showErrorDetails,
      autoRetrying,
      autoRetryCountdown,
      canRetry,
      retry,
      skip,
      toggleDetails,
      copyErrorDetails,
      cleanup
    }
  },
  beforeUnmount() {
    this.cleanup()
  }
}
</script>

<style scoped>
.async-error-boundary {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.error-container {
  max-width: 600px;
  width: 100%;
  background: white;
  border: 1px solid var(--color-error-200);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.error-icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.error-icon {
  font-size: 3rem;
  color: var(--color-error-500);
}

.error-content {
  text-align: center;
  margin-bottom: 1.5rem;
}

.error-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-error-700);
  margin-bottom: 0.5rem;
}

.error-message {
  color: var(--color-neutral-600);
  line-height: 1.5;
}

.contextual-help {
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--color-info-50);
  border: 1px solid var(--color-info-200);
  border-radius: 6px;
  color: var(--color-info-700);
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
}

.error-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.error-details {
  margin-top: 1.5rem;
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: 8px;
  overflow: hidden;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--color-neutral-100);
  border-bottom: 1px solid var(--color-neutral-200);
}

.details-header h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-neutral-700);
  margin: 0;
}

.copy-btn {
  padding: 0.25rem 0.5rem;
  background: white;
  border: 1px solid var(--color-neutral-300);
  border-radius: 4px;
  color: var(--color-neutral-600);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: var(--color-neutral-50);
  color: var(--color-neutral-700);
}

.details-content {
  padding: 1rem;
  font-size: 0.75rem;
  font-family: monospace;
  color: var(--color-neutral-700);
  max-height: 200px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}

.details-footer {
  padding: 0.75rem 1rem;
  background: var(--color-neutral-100);
  border-top: 1px solid var(--color-neutral-200);
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--color-neutral-500);
}

.auto-retry-indicator {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--color-neutral-600);
  font-size: 0.875rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-neutral-300);
  border-top-color: var(--brand-sage);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Transition */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>