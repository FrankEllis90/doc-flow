/**
 * Performance Optimization Composable
 * 
 * Provides utilities for optimizing Vue component performance including
 * memoization, lazy loading, and performance monitoring.
 */

import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'

// Performance monitoring utilities
export function usePerformanceMonitor() {
  const performanceMetrics = ref<Record<string, number>>({})
  
  const measurePerformance = (label: string, fn: () => void | Promise<void>) => {
    const start = performance.now()
    
    const result = fn()
    
    if (result instanceof Promise) {
      return result.then(() => {
        const end = performance.now()
        performanceMetrics.value[label] = end - start
        
        // Log slow operations (>16ms for 60fps)
        if (end - start > 16) {
          console.warn(`Slow operation detected: ${label} took ${(end - start).toFixed(2)}ms`)
        }
      })
    } else {
      const end = performance.now()
      performanceMetrics.value[label] = end - start
      
      if (end - start > 16) {
        console.warn(`Slow operation detected: ${label} took ${(end - start).toFixed(2)}ms`)
      }
    }
  }
  
  return {
    performanceMetrics: computed(() => performanceMetrics.value),
    measurePerformance
  }
}

// Optimized debounce for performance-critical operations
export function useOptimizedDebounce() {
  const debounceTimeouts = new Map<string, number>()
  
  const debounce = (key: string, fn: Function, delay: number = 300) => {
    const existingTimeout = debounceTimeouts.get(key)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }
    
    const timeout = window.setTimeout(() => {
      fn()
      debounceTimeouts.delete(key)
    }, delay)
    
    debounceTimeouts.set(key, timeout)
  }
  
  const clearDebounce = (key: string) => {
    const timeout = debounceTimeouts.get(key)
    if (timeout) {
      clearTimeout(timeout)
      debounceTimeouts.delete(key)
    }
  }
  
  const clearAllDebounces = () => {
    debounceTimeouts.forEach(timeout => clearTimeout(timeout))
    debounceTimeouts.clear()
  }
  
  // Cleanup on unmount
  onUnmounted(() => {
    clearAllDebounces()
  })
  
  return {
    debounce,
    clearDebounce,
    clearAllDebounces
  }
}

// Virtual scrolling for large lists
export function useVirtualScrolling(itemHeight: number = 50, containerHeight: number = 400) {
  const scrollTop = ref(0)
  const containerRef = ref<HTMLElement>()
  
  const visibleRange = computed(() => {
    const start = Math.floor(scrollTop.value / itemHeight)
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 2 // Buffer items
    return {
      start: Math.max(0, start - 1), // Add buffer above
      end: start + visibleCount
    }
  })
  
  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement
    scrollTop.value = target.scrollTop
  }
  
  const scrollToItem = (index: number) => {
    if (containerRef.value) {
      containerRef.value.scrollTop = index * itemHeight
    }
  }
  
  return {
    containerRef,
    visibleRange,
    handleScroll,
    scrollToItem
  }
}

// Optimized intersection observer for lazy loading
export function useLazyLoading(threshold: number = 0.1) {
  const observedElements = new Map<Element, Function>()
  let observer: IntersectionObserver | null = null
  
  const observe = (element: Element, callback: Function) => {
    if (!observer) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const callback = observedElements.get(entry.target)
              if (callback) {
                callback()
                unobserve(entry.target)
              }
            }
          })
        },
        { threshold }
      )
    }
    
    observedElements.set(element, callback)
    observer.observe(element)
  }
  
  const unobserve = (element: Element) => {
    if (observer) {
      observer.unobserve(element)
      observedElements.delete(element)
    }
  }
  
  const cleanup = () => {
    if (observer) {
      observer.disconnect()
      observedElements.clear()
      observer = null
    }
  }
  
  onUnmounted(() => {
    cleanup()
  })
  
  return {
    observe,
    unobserve,
    cleanup
  }
}

// Memory-efficient computed properties
export function useMemoizedComputed<T>(computeFn: () => T, dependencies: any[] = []) {
  let cachedValue: T
  let cachedDeps: any[] = []
  let isInitialized = false
  
  return computed(() => {
    // Check if dependencies have changed
    const depsChanged = !isInitialized || 
      dependencies.length !== cachedDeps.length ||
      dependencies.some((dep, index) => dep !== cachedDeps[index])
    
    if (depsChanged) {
      cachedValue = computeFn()
      cachedDeps = [...dependencies]
      isInitialized = true
    }
    
    return cachedValue
  })
}

// Request idle callback for non-critical operations
export function useIdleCallback() {
  const scheduleIdleTask = (callback: Function) => {
    if ('requestIdleCallback' in window) {
      return (window as any).requestIdleCallback(callback, { timeout: 5000 })
    } else {
      // Fallback for browsers without requestIdleCallback
      return setTimeout(callback, 1)
    }
  }
  
  const cancelIdleTask = (id: number) => {
    if ('cancelIdleCallback' in window) {
      (window as any).cancelIdleCallback(id)
    } else {
      clearTimeout(id)
    }
  }
  
  return {
    scheduleIdleTask,
    cancelIdleTask
  }
}

// Frame-based animation utilities
export function useFrameBasedAnimation() {
  let animationId: number | null = null
  
  const startAnimation = (callback: (timestamp: number) => void) => {
    const animate = (timestamp: number) => {
      callback(timestamp)
      animationId = requestAnimationFrame(animate)
    }
    animationId = requestAnimationFrame(animate)
  }
  
  const stopAnimation = () => {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
  }
  
  onUnmounted(() => {
    stopAnimation()
  })
  
  return {
    startAnimation,
    stopAnimation
  }
}

// Batch DOM updates
export function useBatchedUpdates() {
  const pendingUpdates = ref<Function[]>([])
  let isScheduled = false
  
  const batchUpdate = (updateFn: Function) => {
    pendingUpdates.value.push(updateFn)
    
    if (!isScheduled) {
      isScheduled = true
      nextTick(() => {
        const updates = [...pendingUpdates.value]
        pendingUpdates.value = []
        isScheduled = false
        
        updates.forEach(update => update())
      })
    }
  }
  
  return {
    batchUpdate
  }
}