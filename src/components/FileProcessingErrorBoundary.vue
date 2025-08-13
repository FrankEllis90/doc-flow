<template>
  <div v-if="!hasError">
    <slot />
  </div>
  <div v-else class="file-processing-error-boundary">
    <div class="error-container">
      <!-- Processing Error Icon -->
      <div class="error-icon-wrapper">
        <i :class="getErrorIcon(errorType)" class="error-icon"></i>
      </div>
      
      <!-- Error Content -->
      <div class="error-content">
        <h3 class="error-title">{{ getErrorTitle(errorType) }}</h3>
        <p class="error-message">{{ getErrorMessage(errorType, originalError) }}</p>
        
        <!-- File-specific context -->
        <div v-if="fileContext" class="file-context">
          <div class="file-info">
            <i class="fas fa-file mr-2"></i>
            <span class="file-name">{{ fileContext.name }}</span>
            <span v-if="fileContext.size" class="file-size">({{ formatFileSize(fileContext.size) }})</span>
          </div>
          <div v-if="fileContext.type" class="file-type">
            Type: {{ fileContext.type }}
          </div>
        </div>
        
        <!-- Processing context -->
        <div v-if="processingContext" class="processing-context">
          <div class="processing-stage">
            Stage: {{ processingContext.stage }}
          </div>
          <div v-if="processingContext.progress" class="processing-progress">
            Progress: {{ processingContext.progress }}%
          </div>
        </div>
        
        <!-- Memory warning -->
        <div v-if="errorType === 'memory'" class="memory-warning">
          <i class="fas fa-exclamation-triangle mr-2"></i>
          <span>Large file detected. Consider splitting into smaller files or refreshing the page.</span>
        </div>
        
        <!-- Suggestions -->
        <div v-if="suggestions.length > 0" class="suggestions">
          <h4>Suggestions:</h4>
          <ul>
            <li v-for="suggestion in suggestions" :key="suggestion">
              <i class="fas fa-lightbulb mr-2"></i>
              {{ suggestion }}
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="error-actions">
        <button 
          v-if="canRetryFile"
          @click="retryFile" 
          class="btn btn-primary"
          :disabled="retrying"
        >
          <i :class="retrying ? 'fas fa-spinner fa-spin' : 'fas fa-redo'" class="mr-2"></i>
          {{ retrying ? 'Retrying...' : 'Retry File' }}
        </button>
        
        <button 
          v-if="canSkipFile"
          @click="skipFile" 
          class="btn btn-warning"
        >
          <i class="fas fa-forward mr-2"></i>
          Skip File
        </button>
        
        <button 
          v-if="canRemoveFile"
          @click="removeFile" 
          class="btn btn-destructive"
        >
          <i class="fas fa-trash mr-2"></i>
          Remove from Queue
        </button>
        
        <button 
          @click="refreshPage" 
          class="btn btn-secondary"
        >
          <i class="fas fa-refresh mr-2"></i>
          Refresh Page
        </button>
        
        <button
          v-if="errorDetails"
          @click="toggleDetails"
          class="btn btn-outline"
        >
          <i :class="showErrorDetails ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="mr-2"></i>
          Technical Details
        </button>
      </div>
      
      <!-- Error Details -->
      <transition name="slide-down">
        <div v-if="showErrorDetails && errorDetails" class="error-details">
          <div class="details-header">
            <h4>Technical Information</h4>
            <div class="header-actions">
              <button @click="downloadErrorLog" class="action-btn">
                <i class="fas fa-download"></i>
                Download Log
              </button>
              <button @click="copyErrorDetails" class="action-btn">
                <i class="fas fa-copy"></i>
                Copy
              </button>
            </div>
          </div>
          <div class="details-content">
            <div class="detail-section">
              <h5>Error Information</h5>
              <pre>{{ errorSummary }}</pre>
            </div>
            
            <div v-if="fileContext" class="detail-section">
              <h5>File Information</h5>
              <pre>{{ formatFileDetails() }}</pre>
            </div>
            
            <div v-if="processingContext" class="detail-section">
              <h5>Processing Context</h5>
              <pre>{{ formatProcessingDetails() }}</pre>
            </div>
            
            <div v-if="systemInfo" class="detail-section">
              <h5>System Information</h5>
              <pre>{{ formatSystemInfo() }}</pre>
            </div>
            
            <div class="detail-section">
              <h5>Stack Trace</h5>
              <pre class="stack-trace">{{ errorDetails }}</pre>
            </div>
          </div>
          <div class="details-footer">
            <span class="error-id">Error ID: {{ errorId }}</span>
            <span class="error-timestamp">{{ errorTimestamp }}</span>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { ref, computed, onErrorCaptured } from 'vue'
import { useErrorHandler } from '../composables/useErrorHandler.ts'

export default {
  name: 'FileProcessingErrorBoundary',
  props: {
    fileContext: {
      type: Object,
      default: null // { name, size, type, lastModified }
    },
    processingContext: {
      type: Object,
      default: null // { stage, progress, operation }
    },
    canRetryFile: {
      type: Boolean,
      default: true
    },
    canSkipFile: {
      type: Boolean,
      default: true
    },
    canRemoveFile: {
      type: Boolean,
      default: true
    },
    onRetry: {
      type: Function,
      default: null
    },
    onSkip: {
      type: Function,
      default: null
    },
    onRemove: {
      type: Function,
      default: null
    }
  },
  emits: ['error-occurred', 'retry-file', 'skip-file', 'remove-file', 'refresh-page'],
  setup(props, { emit }) {
    const { addError } = useErrorHandler()
    
    // State
    const hasError = ref(false)
    const errorType = ref('generic')
    const originalError = ref(null)
    const errorDetails = ref('')
    const errorId = ref('')
    const errorTimestamp = ref('')
    const showErrorDetails = ref(false)
    const retrying = ref(false)
    const systemInfo = ref(null)
    
    // Computed
    const suggestions = computed(() => getSuggestions(errorType.value, props.fileContext))
    const errorSummary = computed(() => formatErrorSummary())
    
    // Methods
    const handleError = (error, instance, info) => {
      hasError.value = true
      originalError.value = error
      errorType.value = determineFileErrorType(error, props.fileContext)
      
      // Collect system information
      systemInfo.value = collectSystemInfo()
      
      // Create error info
      const errorInfo = addError({
        message: error.message || 'File processing error',
        details: formatDetailedError(error, instance, info),
        component: instance?.$options?.name || 'FileProcessor',
        action: props.processingContext?.operation || 'file-processing',
        severity: determineSeverity(errorType.value)
      })
      
      errorId.value = errorInfo.id
      errorDetails.value = errorInfo.details || ''
      errorTimestamp.value = new Date(errorInfo.timestamp).toLocaleString()
      
      emit('error-occurred', {
        error,
        errorInfo,
        errorType: errorType.value,
        fileContext: props.fileContext,
        processingContext: props.processingContext
      })
    }
    
    const determineFileErrorType = (error, fileContext) => {
      const message = error.message?.toLowerCase() || ''
      const name = error.name?.toLowerCase() || ''
      
      // Memory errors
      if (message.includes('memory') || message.includes('heap') || name === 'rangeerror') {
        return 'memory'
      }
      
      // File format errors
      if (message.includes('format') || message.includes('invalid') || message.includes('corrupt')) {
        return 'format'
      }
      
      // File size errors
      if (message.includes('too large') || message.includes('size limit')) {
        return 'filesize'
      }
      
      // PDF.js specific errors
      if (message.includes('pdf') || message.includes('pdfjs')) {
        return 'pdf'
      }
      
      // Network/loading errors
      if (message.includes('network') || message.includes('fetch') || message.includes('load')) {
        return 'network'
      }
      
      // Permission errors
      if (message.includes('permission') || message.includes('access')) {
        return 'permission'
      }
      
      // Worker errors
      if (message.includes('worker') || message.includes('thread')) {
        return 'worker'
      }
      
      // Timeout errors
      if (message.includes('timeout') || name === 'timeouterror') {
        return 'timeout'
      }
      
      return 'generic'
    }
    
    const determineSeverity = (errorType) => {
      switch (errorType) {
        case 'memory':
        case 'worker':
          return 'high'
        case 'permission':
        case 'network':
          return 'critical'
        default:
          return 'medium'
      }
    }
    
    const getErrorIcon = (type) => {
      const icons = {
        memory: 'fas fa-memory',
        format: 'fas fa-file-excel',
        filesize: 'fas fa-weight-hanging',
        pdf: 'fas fa-file-pdf',
        network: 'fas fa-wifi',
        permission: 'fas fa-lock',
        worker: 'fas fa-cogs',
        timeout: 'fas fa-clock',
        generic: 'fas fa-exclamation-triangle'
      }
      return icons[type] || icons.generic
    }
    
    const getErrorTitle = (type) => {
      const titles = {
        memory: 'Memory Error',
        format: 'File Format Error',
        filesize: 'File Size Error',
        pdf: 'PDF Processing Error',
        network: 'Network Error',
        permission: 'Permission Error',
        worker: 'Processing Error',
        timeout: 'Timeout Error',
        generic: 'File Processing Error'
      }
      return titles[type] || titles.generic
    }
    
    const getErrorMessage = (type, error) => {
      const messages = {
        memory: 'The file is too large for your device\'s available memory. Try closing other applications or split the file into smaller parts.',
        format: 'The file format is not supported or the file may be corrupted. Please check the file and try again.',
        filesize: 'The file exceeds the maximum allowed size limit. Please use a smaller file.',
        pdf: 'There was an error processing the PDF file. The file may be password-protected or corrupted.',
        network: 'Unable to load the file due to network issues. Please check your connection and try again.',
        permission: 'Access to the file was denied. Please check file permissions and try again.',
        worker: 'The background processing task encountered an error. This may be due to browser limitations.',
        timeout: 'File processing took too long and was cancelled. Try with a smaller file or refresh the page.',
        generic: error?.message || 'An unexpected error occurred while processing the file.'
      }
      return messages[type] || messages.generic
    }
    
    const getSuggestions = (type, fileContext) => {
      const suggestions = {
        memory: [
          'Close other browser tabs to free up memory',
          'Try processing smaller files',
          'Refresh the page to clear memory',
          'Use a device with more RAM if available'
        ],
        format: [
          'Verify the file is not corrupted',
          'Try exporting the file in a different format',
          'Check if the file requires specific software to open'
        ],
        filesize: [
          'Split large files into smaller parts',
          'Compress the file before uploading',
          'Use cloud-based processing for large files'
        ],
        pdf: [
          'Remove password protection if present',
          'Try re-saving the PDF from its original application',
          'Use a PDF repair tool if the file is corrupted'
        ],
        network: [
          'Check your internet connection',
          'Try uploading from a different network',
          'Disable VPN if active'
        ],
        permission: [
          'Check file permissions',
          'Try copying the file to a different location',
          'Run the browser as administrator (Windows)'
        ],
        worker: [
          'Refresh the page to restart processing',
          'Try using a different browser',
          'Disable browser extensions that might interfere'
        ],
        timeout: [
          'Try processing smaller files',
          'Refresh the page and try again',
          'Check your internet connection speed'
        ],
        generic: [
          'Refresh the page and try again',
          'Try using a different file',
          'Check browser console for additional details'
        ]
      }
      
      let typeSuggestions = suggestions[type] || suggestions.generic
      
      // Add file-specific suggestions
      if (fileContext) {
        const fileSize = fileContext.size || 0
        const fileName = fileContext.name || ''
        
        if (fileSize > 50 * 1024 * 1024) { // > 50MB
          typeSuggestions.push('Consider using files smaller than 50MB for better performance')
        }
        
        if (fileName.includes(' ')) {
          typeSuggestions.push('Try renaming the file without spaces')
        }
        
        if (fileName.length > 100) {
          typeSuggestions.push('Try shortening the filename')
        }
      }
      
      return typeSuggestions.slice(0, 4) // Limit to 4 suggestions
    }
    
    const collectSystemInfo = () => {
      try {
        const info = {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          cookieEnabled: navigator.cookieEnabled,
          onLine: navigator.onLine,
          hardwareConcurrency: navigator.hardwareConcurrency,
          maxTouchPoints: navigator.maxTouchPoints,
          screen: {
            width: screen.width,
            height: screen.height,
            colorDepth: screen.colorDepth
          },
          window: {
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio
          },
          timestamp: new Date().toISOString()
        }
        
        // Add memory info if available
        if (performance.memory) {
          info.memory = {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
          }
        }
        
        return info
      } catch (err) {
        return { error: 'Could not collect system info', message: err.message }
      }
    }
    
    const formatDetailedError = (error, instance, info) => {
      const details = []
      
      details.push(`Error: ${error.message || 'Unknown error'}`)
      details.push(`Type: ${error.name || 'Error'}`)
      details.push(`Error Type: ${errorType.value}`)
      
      if (props.fileContext) {
        details.push('\nFile Context:')
        details.push(`  Name: ${props.fileContext.name || 'Unknown'}`)
        details.push(`  Size: ${formatFileSize(props.fileContext.size || 0)}`)
        details.push(`  Type: ${props.fileContext.type || 'Unknown'}`)
        if (props.fileContext.lastModified) {
          details.push(`  Modified: ${new Date(props.fileContext.lastModified).toLocaleString()}`)
        }
      }
      
      if (props.processingContext) {
        details.push('\nProcessing Context:')
        details.push(`  Stage: ${props.processingContext.stage || 'Unknown'}`)
        details.push(`  Operation: ${props.processingContext.operation || 'Unknown'}`)
        if (props.processingContext.progress) {
          details.push(`  Progress: ${props.processingContext.progress}%`)
        }
      }
      
      if (instance) {
        details.push(`\nComponent: ${instance.$options?.name || instance.type?.name || 'Unknown'}`)
      }
      
      if (info) {
        details.push(`Vue Info: ${info}`)
      }
      
      if (error.stack) {
        details.push('\nStack Trace:')
        details.push(error.stack)
      }
      
      return details.join('\n')
    }
    
    const formatErrorSummary = () => {
      const summary = []
      summary.push(`Type: ${errorType.value}`)
      summary.push(`Message: ${originalError.value?.message || 'Unknown error'}`)
      summary.push(`Timestamp: ${errorTimestamp.value}`)
      return summary.join('\n')
    }
    
    const formatFileDetails = () => {
      if (!props.fileContext) return 'No file context available'
      
      const details = []
      details.push(`Name: ${props.fileContext.name || 'Unknown'}`)
      details.push(`Size: ${formatFileSize(props.fileContext.size || 0)}`)
      details.push(`Type: ${props.fileContext.type || 'Unknown'}`)
      if (props.fileContext.lastModified) {
        details.push(`Modified: ${new Date(props.fileContext.lastModified).toLocaleString()}`)
      }
      return details.join('\n')
    }
    
    const formatProcessingDetails = () => {
      if (!props.processingContext) return 'No processing context available'
      
      const details = []
      details.push(`Stage: ${props.processingContext.stage || 'Unknown'}`)
      details.push(`Operation: ${props.processingContext.operation || 'Unknown'}`)
      if (props.processingContext.progress !== undefined) {
        details.push(`Progress: ${props.processingContext.progress}%`)
      }
      return details.join('\n')
    }
    
    const formatSystemInfo = () => {
      if (!systemInfo.value) return 'No system info available'
      
      try {
        return JSON.stringify(systemInfo.value, null, 2)
      } catch (err) {
        return 'Error formatting system info'
      }
    }
    
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
    
    // Actions
    const retryFile = async () => {
      retrying.value = true
      try {
        if (props.onRetry) {
          await props.onRetry(props.fileContext)
        }
        emit('retry-file', props.fileContext)
        hasError.value = false
      } catch (err) {
        console.error('Retry failed:', err)
      } finally {
        retrying.value = false
      }
    }
    
    const skipFile = () => {
      if (props.onSkip) {
        props.onSkip(props.fileContext)
      }
      emit('skip-file', props.fileContext)
      hasError.value = false
    }
    
    const removeFile = () => {
      if (props.onRemove) {
        props.onRemove(props.fileContext)
      }
      emit('remove-file', props.fileContext)
      hasError.value = false
    }
    
    const refreshPage = () => {
      emit('refresh-page')
      window.location.reload()
    }
    
    const toggleDetails = () => {
      showErrorDetails.value = !showErrorDetails.value
    }
    
    const copyErrorDetails = async () => {
      const details = [
        `Error Report - ${errorTimestamp.value}`,
        `Error ID: ${errorId.value}`,
        '',
        errorSummary.value,
        '',
        'File Details:',
        formatFileDetails(),
        '',
        'Processing Details:',
        formatProcessingDetails(),
        '',
        'Technical Details:',
        errorDetails.value
      ].join('\n')
      
      try {
        await navigator.clipboard.writeText(details)
        if (window.showNotification) {
          window.showNotification({
            type: 'success',
            title: 'Copied',
            message: 'Error report copied to clipboard',
            duration: 2000
          })
        }
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
    
    const downloadErrorLog = () => {
      const details = [
        `Error Report - ${errorTimestamp.value}`,
        `Error ID: ${errorId.value}`,
        '',
        errorSummary.value,
        '',
        'File Details:',
        formatFileDetails(),
        '',
        'Processing Details:',
        formatProcessingDetails(),
        '',
        'System Information:',
        formatSystemInfo(),
        '',
        'Technical Details:',
        errorDetails.value
      ].join('\n')
      
      const blob = new Blob([details], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `error-log-${errorId.value}.txt`
      a.click()
      URL.revokeObjectURL(url)
    }
    
    // Error capture
    onErrorCaptured((error, instance, info) => {
      handleError(error, instance, info)
      return false
    })
    
    return {
      hasError,
      errorType,
      originalError,
      errorDetails,
      errorId,
      errorTimestamp,
      showErrorDetails,
      retrying,
      systemInfo,
      suggestions,
      errorSummary,
      getErrorIcon,
      getErrorTitle,
      getErrorMessage,
      formatFileSize,
      retryFile,
      skipFile,
      removeFile,
      refreshPage,
      toggleDetails,
      copyErrorDetails,
      downloadErrorLog
    }
  }
}
</script>

<style scoped>
.file-processing-error-boundary {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.error-container {
  max-width: 700px;
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
  margin-bottom: 1rem;
}

.file-context,
.processing-context {
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: 6px;
  padding: 0.75rem;
  margin: 1rem 0;
  text-align: left;
  font-size: 0.875rem;
}

.file-info {
  display: flex;
  align-items: center;
  margin-bottom: 0.25rem;
}

.file-name {
  font-weight: 500;
  margin-right: 0.5rem;
}

.file-size {
  color: var(--color-neutral-500);
  font-size: 0.8em;
}

.file-type,
.processing-stage,
.processing-progress {
  color: var(--color-neutral-600);
  font-size: 0.8em;
}

.memory-warning {
  background: var(--color-warning-50);
  border: 1px solid var(--color-warning-200);
  border-radius: 6px;
  padding: 0.75rem;
  margin: 1rem 0;
  color: var(--color-warning-700);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
}

.suggestions {
  background: var(--color-info-50);
  border: 1px solid var(--color-info-200);
  border-radius: 6px;
  padding: 1rem;
  margin: 1rem 0;
  text-align: left;
}

.suggestions h4 {
  margin: 0 0 0.5rem;
  color: var(--color-info-700);
  font-size: 0.875rem;
  font-weight: 600;
}

.suggestions ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.suggestions li {
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.25rem;
  font-size: 0.8rem;
  color: var(--color-info-600);
  line-height: 1.4;
}

.suggestions li:last-child {
  margin-bottom: 0;
}

.error-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1rem;
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

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.25rem 0.5rem;
  background: white;
  border: 1px solid var(--color-neutral-300);
  border-radius: 4px;
  color: var(--color-neutral-600);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.action-btn:hover {
  background: var(--color-neutral-50);
  color: var(--color-neutral-700);
}

.details-content {
  padding: 1rem;
  max-height: 400px;
  overflow: auto;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h5 {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-neutral-700);
  margin: 0 0 0.5rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid var(--color-neutral-200);
}

.detail-section pre {
  font-size: 0.75rem;
  color: var(--color-neutral-600);
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  padding: 0.5rem;
  background: white;
  border: 1px solid var(--color-neutral-200);
  border-radius: 4px;
  line-height: 1.4;
}

.stack-trace {
  max-height: 150px;
  overflow: auto;
  font-family: monospace;
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

/* Transitions */
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

/* Responsive adjustments */
@media (max-width: 640px) {
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .error-actions .btn {
    width: 100%;
    max-width: 200px;
  }
  
  .details-header {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: center;
  }
}
</style>