<template>
  <div v-if="!hasError">
    <slot />
  </div>
  <div v-else class="error-boundary min-h-[200px] flex items-center justify-center p-8">
    <div class="max-w-md mx-auto text-center">
      <div class="mb-4">
        <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
        <h3 class="text-lg font-semibold text-red-700 mb-2">
          {{ errorTitle }}
        </h3>
        <p class="text-sm text-neutral-600 mb-4">
          {{ errorMessage }}
        </p>
      </div>
      
      <div class="space-y-2">
        <button
          @click="retry"
          class="btn-primary px-4 py-2 mr-2"
        >
          <i class="fas fa-redo mr-2"></i>Try Again
        </button>
        
        <button
          v-if="showDetails"
          @click="toggleDetails"
          class="btn-secondary px-4 py-2"
        >
          {{ showErrorDetails ? 'Hide' : 'Show' }} Details
        </button>
      </div>
      
      <div v-if="showErrorDetails && errorDetails" class="mt-4 p-3 bg-neutral-100 rounded text-left">
        <h4 class="font-medium text-sm mb-2">Error Details:</h4>
        <pre class="text-xs text-neutral-700 overflow-auto max-h-32">{{ errorDetails }}</pre>
        <div class="mt-2 text-xs text-neutral-500">
          Error ID: {{ errorId }}
        </div>
      </div>
      
      <div class="mt-4 text-xs text-neutral-500">
        If this problem persists, please refresh the page or contact support.
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onErrorCaptured, onMounted } from 'vue'
import { useErrorHandler } from '../composables/useErrorHandler.ts'

export default {
  name: 'ErrorBoundary',
  props: {
    fallbackTitle: {
      type: String,
      default: 'Something went wrong'
    },
    fallbackMessage: {
      type: String,
      default: 'An unexpected error occurred while rendering this component.'
    },
    showDetails: {
      type: Boolean,
      default: true
    },
    onError: {
      type: Function,
      default: null
    }
  },
  emits: ['error-occurred', 'error-retry'],
  setup(props, { emit }) {
    const { addError } = useErrorHandler()
    
    const hasError = ref(false)
    const errorTitle = ref(props.fallbackTitle)
    const errorMessage = ref(props.fallbackMessage)
    const errorDetails = ref('')
    const errorId = ref('')
    const showErrorDetails = ref(false)
    const retryCount = ref(0)
    
    const handleError = (error, instance, info) => {
      hasError.value = true
      retryCount.value++
      
      // Create error info
      const errorInfo = addError({
        message: error.message || 'Component error',
        details: `${error.stack}\n\nComponent Info: ${info}`,
        component: instance?.$options.name || 'Unknown',
        action: 'component-render',
        severity: 'high'
      })
      
      errorId.value = errorInfo.id
      errorDetails.value = errorInfo.details || ''
      
      // Update display messages
      if (error.message) {
        errorMessage.value = error.message
      }
      
      // Call custom error handler if provided
      if (props.onError) {
        props.onError(error, instance, info)
      }
      
      // Emit error event
      emit('error-occurred', { error, errorInfo, retryCount: retryCount.value })
      
      // Auto-retry once for network errors
      if (retryCount.value === 1 && isNetworkError(error)) {
        setTimeout(() => {
          retry()
        }, 2000)
      }
    }
    
    const isNetworkError = (error) => {
      return error.message.includes('network') || 
             error.message.includes('fetch') ||
             error.message.includes('timeout')
    }
    
    const retry = () => {
      hasError.value = false
      showErrorDetails.value = false
      emit('error-retry', { retryCount: retryCount.value })
      
      // Force re-render of child components
      setTimeout(() => {
        if (hasError.value) {
          // If error persists, show more helpful message
          if (retryCount.value >= 3) {
            errorTitle.value = 'Persistent Error'
            errorMessage.value = 'This error keeps occurring. Please refresh the page or contact support.'
          }
        }
      }, 100)
    }
    
    const toggleDetails = () => {
      showErrorDetails.value = !showErrorDetails.value
    }
    
    // Capture Vue errors
    onErrorCaptured((error, instance, info) => {
      handleError(error, instance, info)
      return false // Prevent error from propagating
    })
    
    return {
      hasError,
      errorTitle,
      errorMessage,
      errorDetails,
      errorId,
      showErrorDetails,
      retry,
      toggleDetails
    }
  }
}
</script>

<style scoped>
.error-boundary {
  border: 1px solid #fecaca;
  background-color: #fef2f2;
  border-radius: 8px;
}

.btn-primary {
  background-color: var(--brand-sage);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary:hover {
  background-color: var(--brand-sage-dark);
}

.btn-secondary {
  background-color: transparent;
  color: var(--neutral-text);
  border: 1px solid var(--neutral-muted);
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: var(--neutral-bg);
}
</style>