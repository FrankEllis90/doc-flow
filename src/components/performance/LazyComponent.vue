<!--
  Optimized Lazy Component
  
  This component demonstrates performance optimization techniques:
  - Lazy loading with intersection observer
  - Skeleton loading states
  - Error boundaries
  - Performance monitoring
-->

<template>
  <div ref="containerRef" class="lazy-component">
    <!-- Loading skeleton -->
    <div v-if="isLoading" class="animate-pulse">
      <div class="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
      <div class="h-4 bg-neutral-200 rounded w-1/2 mb-2"></div>
      <div class="h-20 bg-neutral-200 rounded"></div>
    </div>
    
    <!-- Error state -->
    <div v-else-if="hasError" class="error-boundary p-4 border border-error-200 bg-error-50 rounded-md">
      <h3 class="text-error-700 font-semibold mb-2">
        <i class="fas fa-exclamation-triangle mr-2"></i>
        Component Error
      </h3>
      <p class="text-error-600 text-sm mb-3">{{ errorMessage }}</p>
      <button 
        @click="retryLoad"
        class="btn-sm bg-error-600 text-white hover:bg-error-700 transition-colors"
      >
        <i class="fas fa-redo mr-1"></i>
        Retry
      </button>
    </div>
    
    <!-- Actual content -->
    <div v-else-if="isLoaded" class="fade-in">
      <slot :data="componentData" />
    </div>
    
    <!-- Performance metrics (dev only) -->
    <div v-if="isDev && performanceMetrics.loadTime" class="mt-2 text-xs text-neutral-500">
      Load time: {{ performanceMetrics.loadTime.toFixed(2) }}ms
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useLazyLoading, usePerformanceMonitor } from '@/composables/usePerformanceOptimization'

export default {
  name: 'LazyComponent',
  props: {
    loadData: {
      type: Function,
      required: true
    },
    threshold: {
      type: Number,
      default: 0.1
    },
    retryAttempts: {
      type: Number,
      default: 3
    }
  },
  setup(props) {
    const containerRef = ref(null)
    const isLoading = ref(false)
    const isLoaded = ref(false)
    const hasError = ref(false)
    const errorMessage = ref('')
    const componentData = ref(null)
    const currentRetryAttempt = ref(0)
    
    const { observe, cleanup } = useLazyLoading(props.threshold)
    const { performanceMetrics, measurePerformance } = usePerformanceMonitor()
    
    const isDev = computed(() => process.env.NODE_ENV === 'development')
    
    const loadComponent = async () => {
      if (isLoading.value || isLoaded.value) return
      
      isLoading.value = true
      hasError.value = false
      
      try {
        await measurePerformance('componentLoad', async () => {
          const data = await props.loadData()
          componentData.value = data
          isLoaded.value = true
        })
      } catch (error) {
        console.error('LazyComponent load error:', error)
        hasError.value = true
        errorMessage.value = error.message || 'Failed to load component'
      } finally {
        isLoading.value = false
      }
    }
    
    const retryLoad = async () => {
      if (currentRetryAttempt.value >= props.retryAttempts) {
        errorMessage.value = 'Maximum retry attempts reached'
        return
      }
      
      currentRetryAttempt.value++
      hasError.value = false
      
      // Exponential backoff
      const delay = Math.pow(2, currentRetryAttempt.value) * 1000
      setTimeout(loadComponent, delay)
    }
    
    onMounted(() => {
      if (containerRef.value) {
        observe(containerRef.value, loadComponent)
      }
    })
    
    onUnmounted(() => {
      cleanup()
    })
    
    return {
      containerRef,
      isLoading,
      isLoaded,
      hasError,
      errorMessage,
      componentData,
      performanceMetrics,
      isDev,
      retryLoad
    }
  }
}
</script>

<style scoped>
.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-boundary {
  border-left: 4px solid var(--color-error-500);
}

/* Skeleton animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>