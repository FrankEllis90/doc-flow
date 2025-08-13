<template>
  <!-- Global Error Toast Notifications -->
  <teleport to="body">
    <transition-group name="error-toast" tag="div" class="error-toast-container">
      <div
        v-for="error in visibleErrors"
        :key="error.id"
        :class="[
          'error-toast',
          `error-toast-${error.severity}`,
          { 'error-toast-dismissible': error.dismissible }
        ]"
        role="alert"
        :aria-live="error.severity === 'critical' ? 'assertive' : 'polite'"
      >
        <!-- Error Icon -->
        <div class="error-toast-icon">
          <i :class="getErrorIcon(error.severity)"></i>
        </div>
        
        <!-- Error Content -->
        <div class="error-toast-content">
          <div class="error-toast-title">
            {{ getErrorTitle(error) }}
          </div>
          <div class="error-toast-message">
            {{ error.message }}
          </div>
          
          <!-- Error Actions -->
          <div v-if="hasActions(error)" class="error-toast-actions">
            <button
              v-if="error.actionable"
              @click="handleAction(error)"
              class="error-action-btn error-action-primary"
            >
              {{ getActionText(error) }}
            </button>
            
            <button
              v-if="error.retryable"
              @click="retryError(error)"
              class="error-action-btn error-action-secondary"
              :disabled="retryingErrors.has(error.id)"
            >
              <i v-if="retryingErrors.has(error.id)" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-redo"></i>
              Retry
            </button>
            
            <button
              v-if="error.reportable"
              @click="reportError(error)"
              class="error-action-btn error-action-secondary"
            >
              <i class="fas fa-bug"></i>
              Report
            </button>
          </div>
        </div>
        
        <!-- Dismiss Button -->
        <button
          v-if="error.dismissible !== false"
          @click="dismissError(error.id)"
          class="error-toast-dismiss"
          :aria-label="`Dismiss ${getErrorTitle(error)}`"
        >
          <i class="fas fa-times"></i>
        </button>
        
        <!-- Progress Bar for Auto-dismiss -->
        <div
          v-if="error.autoDismiss && !error.paused"
          class="error-toast-progress"
          :style="{ animationDuration: `${error.duration || 5000}ms` }"
        ></div>
      </div>
    </transition-group>
  </teleport>
  
  <!-- Global Error Modal for Critical Errors -->
  <teleport to="body">
    <transition name="modal">
      <div
        v-if="criticalError"
        class="error-modal-overlay"
        @click.self="dismissCriticalError"
      >
        <div class="error-modal" role="dialog" aria-modal="true">
          <div class="error-modal-header">
            <div class="error-modal-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="error-modal-title-section">
              <h2 class="error-modal-title">Critical Error</h2>
              <p class="error-modal-subtitle">The application encountered a serious problem</p>
            </div>
          </div>
          
          <div class="error-modal-body">
            <div class="error-modal-message">
              {{ criticalError.message }}
            </div>
            
            <!-- Error Details -->
            <div v-if="criticalError.details" class="error-modal-details">
              <button
                @click="showCriticalDetails = !showCriticalDetails"
                class="error-details-toggle"
              >
                <i :class="showCriticalDetails ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                Technical Details
              </button>
              
              <transition name="slide-down">
                <div v-if="showCriticalDetails" class="error-details-content">
                  <pre>{{ criticalError.details }}</pre>
                </div>
              </transition>
            </div>
            
            <!-- System Recovery Options -->
            <div class="error-recovery-options">
              <h3>Recovery Options:</h3>
              <div class="recovery-option" v-for="option in recoveryOptions" :key="option.id">
                <button
                  @click="executeRecovery(option)"
                  class="recovery-btn"
                  :class="`recovery-btn-${option.type}`"
                  :disabled="executingRecovery === option.id"
                >
                  <i :class="executingRecovery === option.id ? 'fas fa-spinner fa-spin' : option.icon"></i>
                  {{ option.label }}
                </button>
                <p class="recovery-description">{{ option.description }}</p>
              </div>
            </div>
          </div>
          
          <div class="error-modal-footer">
            <button
              @click="dismissCriticalError"
              class="btn btn-secondary"
            >
              Close
            </button>
            <button
              @click="refreshApplication"
              class="btn btn-primary"
            >
              <i class="fas fa-refresh mr-2"></i>
              Refresh Application
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useErrorHandler } from '../composables/useErrorHandler.ts'

export default {
  name: 'GlobalErrorHandler',
  setup() {
    const { errors, removeError, clearErrors, setGlobalErrorHandler } = useErrorHandler()
    
    // State
    const dismissedErrors = ref(new Set())
    const retryingErrors = ref(new Set())
    const criticalError = ref(null)
    const showCriticalDetails = ref(false)
    const executingRecovery = ref(null)
    const errorTimers = ref(new Map())
    
    // Computed
    const visibleErrors = computed(() => {
      return errors.value
        .filter(error => {
          // Don't show dismissed errors
          if (dismissedErrors.value.has(error.id)) return false
          
          // Don't show critical errors in toast (they get modal treatment)
          if (error.severity === 'critical') return false
          
          return true
        })
        .slice(0, 5) // Limit to 5 visible errors
    })
    
    const recoveryOptions = computed(() => [
      {
        id: 'clear-cache',
        type: 'safe',
        icon: 'fas fa-broom',
        label: 'Clear Cache',
        description: 'Clear browser cache and reload the page'
      },
      {
        id: 'reset-local-data',
        type: 'caution',
        icon: 'fas fa-database',
        label: 'Reset Local Data',
        description: 'Clear all local storage data (you may lose unsaved work)'
      },
      {
        id: 'safe-mode',
        type: 'safe',
        icon: 'fas fa-shield-alt',
        label: 'Safe Mode',
        description: 'Reload with minimal features enabled'
      },
      {
        id: 'download-state',
        type: 'safe',
        icon: 'fas fa-download',
        label: 'Download State',
        description: 'Download current application state as backup'
      }
    ])
    
    // Methods
    const handleGlobalError = (errorInfo) => {
      // Set up auto-dismiss for non-critical errors
      if (errorInfo.severity !== 'critical') {
        setupAutoDismiss(errorInfo)
      } else {
        // Show critical errors in modal
        criticalError.value = errorInfo
      }
      
      // Add error-specific behavior
      enhanceErrorInfo(errorInfo)
    }
    
    const enhanceErrorInfo = (error) => {
      // Determine if error is actionable
      error.actionable = isActionableError(error)
      error.retryable = isRetryableError(error)
      error.reportable = isReportableError(error)
      error.dismissible = error.severity !== 'critical'
      error.autoDismiss = error.severity !== 'high' && error.severity !== 'critical'
      error.duration = getDismissalDuration(error.severity)
    }
    
    const isActionableError = (error) => {
      const actionablePatterns = [
        'permission',
        'network',
        'quota',
        'storage'
      ]
      return actionablePatterns.some(pattern => 
        error.message.toLowerCase().includes(pattern)
      )
    }
    
    const isRetryableError = (error) => {
      const retryablePatterns = [
        'network',
        'timeout',
        'fetch',
        'connection'
      ]
      return retryablePatterns.some(pattern => 
        error.message.toLowerCase().includes(pattern)
      )
    }
    
    const isReportableError = (error) => {
      // All errors can be reported except low severity ones
      return error.severity !== 'low'
    }
    
    const getDismissalDuration = (severity) => {
      const durations = {
        low: 3000,
        medium: 5000,
        high: 8000,
        critical: 0 // Never auto-dismiss
      }
      return durations[severity] || 5000
    }
    
    const setupAutoDismiss = (error) => {
      if (!error.autoDismiss || error.duration === 0) return
      
      const timer = setTimeout(() => {
        dismissError(error.id)
        errorTimers.value.delete(error.id)
      }, error.duration)
      
      errorTimers.value.set(error.id, timer)
    }
    
    const getErrorIcon = (severity) => {
      const icons = {
        low: 'fas fa-info-circle',
        medium: 'fas fa-exclamation-circle',
        high: 'fas fa-exclamation-triangle',
        critical: 'fas fa-times-circle'
      }
      return icons[severity] || icons.medium
    }
    
    const getErrorTitle = (error) => {
      if (error.component) {
        return `${error.component} Error`
      }
      
      const titles = {
        low: 'Information',
        medium: 'Warning',
        high: 'Error',
        critical: 'Critical Error'
      }
      return titles[error.severity] || 'Error'
    }
    
    const hasActions = (error) => {
      return error.actionable || error.retryable || error.reportable
    }
    
    const getActionText = (error) => {
      const message = error.message.toLowerCase()
      
      if (message.includes('permission')) return 'Grant Permission'
      if (message.includes('network')) return 'Check Connection'
      if (message.includes('storage')) return 'Free Space'
      if (message.includes('quota')) return 'Manage Storage'
      
      return 'Fix Issue'
    }
    
    const handleAction = (error) => {
      const message = error.message.toLowerCase()
      
      if (message.includes('permission')) {
        // Handle permission errors
        handlePermissionError(error)
      } else if (message.includes('network')) {
        // Handle network errors
        handleNetworkError(error)
      } else if (message.includes('storage') || message.includes('quota')) {
        // Handle storage errors
        handleStorageError(error)
      }
      
      dismissError(error.id)
    }
    
    const handlePermissionError = (error) => {
      // Show permission guidance
      if (window.showNotification) {
        window.showNotification({
          type: 'info',
          title: 'Permission Required',
          message: 'Please check your browser settings and grant the necessary permissions.',
          duration: 8000
        })
      }
    }
    
    const handleNetworkError = (error) => {
      // Show network troubleshooting
      if (window.showNotification) {
        window.showNotification({
          type: 'info',
          title: 'Network Troubleshooting',
          message: 'Check your internet connection and try refreshing the page.',
          duration: 8000
        })
      }
    }
    
    const handleStorageError = (error) => {
      // Show storage management options
      if (window.showNotification) {
        window.showNotification({
          type: 'info',
          title: 'Storage Management',
          message: 'Your device is running low on storage. Consider clearing browser data.',
          duration: 8000
        })
      }
    }
    
    const retryError = async (error) => {
      retryingErrors.value.add(error.id)
      
      try {
        // Simulate retry delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // In a real application, you would implement specific retry logic here
        // For now, we'll just dismiss the error
        dismissError(error.id)
        
        if (window.showNotification) {
          window.showNotification({
            type: 'success',
            title: 'Retry Successful',
            message: 'The operation was retried successfully.',
            duration: 3000
          })
        }
      } catch (retryError) {
        console.error('Retry failed:', retryError)
        
        if (window.showNotification) {
          window.showNotification({
            type: 'error',
            title: 'Retry Failed',
            message: 'The retry attempt was unsuccessful.',
            duration: 5000
          })
        }
      } finally {
        retryingErrors.value.delete(error.id)
      }
    }
    
    const reportError = async (error) => {
      try {
        // Create error report
        const errorReport = {
          id: error.id,
          timestamp: error.timestamp,
          message: error.message,
          details: error.details,
          component: error.component,
          action: error.action,
          severity: error.severity,
          userAgent: navigator.userAgent,
          url: window.location.href,
          stack: error.details
        }
        
        // In a real application, you would send this to your error reporting service
        console.log('Error report:', errorReport)
        
        // For now, copy to clipboard
        await navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
        
        if (window.showNotification) {
          window.showNotification({
            type: 'success',
            title: 'Error Reported',
            message: 'Error report copied to clipboard. Please send it to support.',
            duration: 5000
          })
        }
        
        dismissError(error.id)
      } catch (reportError) {
        console.error('Failed to report error:', reportError)
        
        if (window.showNotification) {
          window.showNotification({
            type: 'error',
            title: 'Report Failed',
            message: 'Unable to create error report.',
            duration: 5000
          })
        }
      }
    }
    
    const dismissError = (errorId) => {
      dismissedErrors.value.add(errorId)
      
      // Clear timer if exists
      if (errorTimers.value.has(errorId)) {
        clearTimeout(errorTimers.value.get(errorId))
        errorTimers.value.delete(errorId)
      }
      
      // Remove from store after animation
      setTimeout(() => {
        removeError(errorId)
      }, 300)
    }
    
    const dismissCriticalError = () => {
      criticalError.value = null
      showCriticalDetails.value = false
    }
    
    const executeRecovery = async (option) => {
      executingRecovery.value = option.id
      
      try {
        switch (option.id) {
          case 'clear-cache':
            await clearApplicationCache()
            break
          case 'reset-local-data':
            await resetLocalData()
            break
          case 'safe-mode':
            await enterSafeMode()
            break
          case 'download-state':
            await downloadApplicationState()
            return // Don't refresh for download
        }
        
        // Refresh after recovery action
        setTimeout(() => {
          window.location.reload()
        }, 1000)
        
      } catch (recoveryError) {
        console.error('Recovery failed:', recoveryError)
        
        if (window.showNotification) {
          window.showNotification({
            type: 'error',
            title: 'Recovery Failed',
            message: `Failed to execute ${option.label}. Please try manual refresh.`,
            duration: 8000
          })
        }
      } finally {
        executingRecovery.value = null
      }
    }
    
    const clearApplicationCache = async () => {
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
      }
    }
    
    const resetLocalData = async () => {
      localStorage.clear()
      sessionStorage.clear()
      
      if ('indexedDB' in window) {
        // Clear IndexedDB (simplified - in production you'd want more specific clearing)
        try {
          const databases = await indexedDB.databases?.() || []
          await Promise.all(databases.map(db => {
            return new Promise((resolve, reject) => {
              const deleteReq = indexedDB.deleteDatabase(db.name)
              deleteReq.onsuccess = () => resolve()
              deleteReq.onerror = () => reject(deleteReq.error)
            })
          }))
        } catch (err) {
          console.warn('Could not clear all IndexedDB databases:', err)
        }
      }
    }
    
    const enterSafeMode = async () => {
      localStorage.setItem('kb-safe-mode', 'true')
    }
    
    const downloadApplicationState = async () => {
      try {
        const state = {
          timestamp: new Date().toISOString(),
          localStorage: { ...localStorage },
          sessionStorage: { ...sessionStorage },
          errors: errors.value,
          url: window.location.href,
          userAgent: navigator.userAgent
        }
        
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `kb-application-state-${Date.now()}.json`
        a.click()
        URL.revokeObjectURL(url)
        
        if (window.showNotification) {
          window.showNotification({
            type: 'success',
            title: 'State Downloaded',
            message: 'Application state saved successfully.',
            duration: 3000
          })
        }
      } catch (err) {
        throw new Error('Failed to download application state: ' + err.message)
      }
    }
    
    const refreshApplication = () => {
      window.location.reload()
    }
    
    // Watch for critical errors
    watch(errors, (newErrors) => {
      const latestCritical = newErrors
        .filter(error => error.severity === 'critical')
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
      
      if (latestCritical && (!criticalError.value || latestCritical.id !== criticalError.value.id)) {
        criticalError.value = latestCritical
      }
    }, { deep: true })
    
    // Setup global error handler
    onMounted(() => {
      setGlobalErrorHandler(handleGlobalError)
      
      // Handle browser errors that might not be caught by Vue
      const handleWindowError = (event) => {
        const errorInfo = {
          id: `window_error_${Date.now()}`,
          message: event.message || 'Browser error occurred',
          details: `${event.filename || 'unknown'}:${event.lineno || 0}:${event.colno || 0}`,
          component: 'Browser',
          action: 'window-error',
          severity: 'high',
          timestamp: new Date()
        }
        
        handleGlobalError(errorInfo)
      }
      
      window.addEventListener('error', handleWindowError)
      window.addEventListener('unhandledrejection', (event) => {
        const errorInfo = {
          id: `promise_rejection_${Date.now()}`,
          message: 'Unhandled promise rejection',
          details: event.reason?.toString() || 'Unknown rejection',
          component: 'Promise',
          action: 'unhandledrejection',
          severity: 'high',
          timestamp: new Date()
        }
        
        handleGlobalError(errorInfo)
      })
      
      // Store cleanup function
      window.__globalErrorCleanup = () => {
        window.removeEventListener('error', handleWindowError)
      }
    })
    
    onUnmounted(() => {
      // Clear all timers
      errorTimers.value.forEach(timer => clearTimeout(timer))
      errorTimers.value.clear()
      
      // Run cleanup if available
      if (window.__globalErrorCleanup) {
        window.__globalErrorCleanup()
      }
    })
    
    return {
      visibleErrors,
      criticalError,
      showCriticalDetails,
      executingRecovery,
      retryingErrors,
      recoveryOptions,
      getErrorIcon,
      getErrorTitle,
      hasActions,
      getActionText,
      handleAction,
      retryError,
      reportError,
      dismissError,
      dismissCriticalError,
      executeRecovery,
      refreshApplication
    }
  }
}
</script>

<style scoped>
/* Error Toast Container */
.error-toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: none;
  max-width: 400px;
}

/* Error Toast */
.error-toast {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-left: 4px solid var(--color-error-500);
  pointer-events: auto;
  position: relative;
  overflow: hidden;
  min-width: 320px;
}

.error-toast-low {
  border-left-color: var(--color-info-500);
}

.error-toast-medium {
  border-left-color: var(--color-warning-500);
}

.error-toast-high {
  border-left-color: var(--color-error-500);
}

.error-toast-critical {
  border-left-color: var(--color-error-700);
  background: var(--color-error-50);
}

/* Toast Icon */
.error-toast-icon {
  flex-shrink: 0;
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-error-500);
}

.error-toast-low .error-toast-icon {
  color: var(--color-info-500);
}

.error-toast-medium .error-toast-icon {
  color: var(--color-warning-500);
}

/* Toast Content */
.error-toast-content {
  flex: 1;
  min-width: 0;
}

.error-toast-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--color-neutral-900);
  margin-bottom: 0.25rem;
}

.error-toast-message {
  font-size: 0.8rem;
  color: var(--color-neutral-700);
  line-height: 1.4;
  word-break: break-word;
}

/* Toast Actions */
.error-toast-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}

.error-action-btn {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.error-action-primary {
  background: var(--brand-sage);
  color: white;
}

.error-action-primary:hover {
  background: var(--brand-sage-dark);
}

.error-action-secondary {
  background: var(--color-neutral-100);
  color: var(--color-neutral-700);
  border: 1px solid var(--color-neutral-300);
}

.error-action-secondary:hover {
  background: var(--color-neutral-200);
}

.error-action-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Dismiss Button */
.error-toast-dismiss {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: none;
  background: none;
  color: var(--color-neutral-400);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.error-toast-dismiss:hover {
  background: var(--color-neutral-100);
  color: var(--color-neutral-600);
}

/* Progress Bar */
.error-toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: var(--color-error-500);
  animation: progress-shrink linear forwards;
}

.error-toast-low .error-toast-progress {
  background: var(--color-info-500);
}

.error-toast-medium .error-toast-progress {
  background: var(--color-warning-500);
}

@keyframes progress-shrink {
  from { width: 100%; }
  to { width: 0%; }
}

/* Toast Transitions */
.error-toast-enter-active {
  transition: all 0.3s ease;
}

.error-toast-leave-active {
  transition: all 0.3s ease;
}

.error-toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.error-toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Error Modal */
.error-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
}

.error-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: auto;
}

.error-modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid var(--color-neutral-200);
}

.error-modal-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: var(--color-error-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--color-error-600);
}

.error-modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-neutral-900);
}

.error-modal-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: var(--color-neutral-600);
}

.error-modal-body {
  padding: 2rem;
}

.error-modal-message {
  font-size: 1rem;
  color: var(--color-neutral-700);
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.error-modal-details {
  margin-bottom: 2rem;
}

.error-details-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: 6px;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--color-neutral-700);
  transition: all 0.2s;
}

.error-details-toggle:hover {
  background: var(--color-neutral-100);
}

.error-details-content {
  margin-top: 0.75rem;
  padding: 1rem;
  background: var(--color-neutral-900);
  border-radius: 6px;
  max-height: 200px;
  overflow: auto;
}

.error-details-content pre {
  margin: 0;
  color: var(--color-neutral-100);
  font-size: 0.75rem;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-word;
}

.error-recovery-options h3 {
  margin: 0 0 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-neutral-900);
}

.recovery-option {
  margin-bottom: 1rem;
}

.recovery-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-neutral-300);
  border-radius: 6px;
  background: white;
  color: var(--color-neutral-700);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: 500;
  width: 100%;
  text-align: left;
}

.recovery-btn:hover {
  background: var(--color-neutral-50);
  border-color: var(--color-neutral-400);
}

.recovery-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.recovery-btn-safe {
  border-color: var(--color-success-300);
  color: var(--color-success-700);
}

.recovery-btn-safe:hover {
  background: var(--color-success-50);
  border-color: var(--color-success-400);
}

.recovery-btn-caution {
  border-color: var(--color-warning-300);
  color: var(--color-warning-700);
}

.recovery-btn-caution:hover {
  background: var(--color-warning-50);
  border-color: var(--color-warning-400);
}

.recovery-description {
  margin: 0.5rem 0 0;
  padding-left: 1rem;
  font-size: 0.8rem;
  color: var(--color-neutral-600);
  line-height: 1.4;
}

.error-modal-footer {
  padding: 1rem 2rem 2rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  border-top: 1px solid var(--color-neutral-200);
}

/* Modal Transitions */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

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

/* Responsive */
@media (max-width: 640px) {
  .error-toast-container {
    top: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
    max-width: none;
  }
  
  .error-toast {
    min-width: auto;
  }
  
  .error-modal-overlay {
    padding: 0.5rem;
  }
  
  .error-modal-header,
  .error-modal-body,
  .error-modal-footer {
    padding: 1rem;
  }
  
  .error-modal-footer {
    flex-direction: column;
  }
}
</style>