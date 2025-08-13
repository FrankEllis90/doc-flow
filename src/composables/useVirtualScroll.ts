import { ref, computed, watch, onMounted, onUnmounted, type Ref, type ComputedRef } from 'vue'

export interface VirtualScrollOptions {
  itemHeight: number
  containerHeight: number
  buffer?: number
  overscan?: number
}

export interface VirtualScrollReturn<T> {
  containerRef: Ref<HTMLElement | undefined>
  scrollTop: Ref<number>
  startIndex: ComputedRef<number>
  endIndex: ComputedRef<number>
  visibleItems: ComputedRef<T[]>
  totalHeight: ComputedRef<number>
  offsetY: ComputedRef<number>
  handleScroll: (event: Event) => void
  scrollToItem: (index: number, behavior?: ScrollBehavior) => void
  scrollToTop: (behavior?: ScrollBehavior) => void
  getVisibleRange: () => { start: number; end: number; total: number }
}

/**
 * Virtual scrolling composable for performance optimization with large lists
 * Reduces DOM nodes and improves rendering performance by only rendering visible items
 */
export function useVirtualScroll<T>(
  items: Ref<T[]> | ComputedRef<T[]>,
  options: VirtualScrollOptions
): VirtualScrollReturn<T> {
  const {
    itemHeight,
    containerHeight,
    buffer = 5,
    overscan = 3
  } = options

  // State
  const containerRef = ref<HTMLElement>()
  const scrollTop = ref(0)
  const isScrolling = ref(false)
  let scrollTimeout: number | null = null

  // Computed values
  const totalHeight = computed(() => {
    const itemsValue = typeof items.value !== 'undefined' ? items.value : items.value
    return itemsValue.length * itemHeight
  })

  const visibleCount = computed(() => Math.ceil(containerHeight / itemHeight))

  const startIndex = computed(() => {
    const calculated = Math.floor(scrollTop.value / itemHeight) - buffer
    return Math.max(0, calculated)
  })

  const endIndex = computed(() => {
    const itemsValue = typeof items.value !== 'undefined' ? items.value : items.value
    const calculated = startIndex.value + visibleCount.value + buffer * 2 + overscan
    return Math.min(itemsValue.length, calculated)
  })

  const visibleItems = computed(() => {
    const itemsValue = typeof items.value !== 'undefined' ? items.value : items.value
    return itemsValue.slice(startIndex.value, endIndex.value)
  })

  const offsetY = computed(() => startIndex.value * itemHeight)

  // Methods
  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement
    scrollTop.value = target.scrollTop
    
    // Track scrolling state for performance optimizations
    isScrolling.value = true
    if (scrollTimeout) clearTimeout(scrollTimeout)
    scrollTimeout = window.setTimeout(() => {
      isScrolling.value = false
    }, 150)
  }

  const scrollToItem = (index: number, behavior: ScrollBehavior = 'smooth') => {
    if (!containerRef.value) return
    
    const targetScrollTop = Math.max(0, index * itemHeight)
    containerRef.value.scrollTo({
      top: targetScrollTop,
      behavior
    })
  }

  const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
    scrollToItem(0, behavior)
  }

  const getVisibleRange = () => ({
    start: startIndex.value,
    end: endIndex.value,
    total: visibleItems.value.length
  })

  // Performance optimizations
  let rafId: number | null = null
  let lastScrollTime = 0
  const throttleDelay = 16 // ~60fps

  const throttledHandleScroll = (event: Event) => {
    const now = performance.now()
    
    if (now - lastScrollTime >= throttleDelay) {
      handleScroll(event)
      lastScrollTime = now
    } else if (!rafId) {
      rafId = requestAnimationFrame(() => {
        handleScroll(event)
        rafId = null
        lastScrollTime = performance.now()
      })
    }
  }

  // Memory management
  const cleanup = () => {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
      scrollTimeout = null
    }
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  onUnmounted(cleanup)

  // Development performance monitoring
  if (import.meta.env.DEV) {
    let renderCount = 0
    watch([startIndex, endIndex], () => {
      renderCount++
      if (renderCount % 50 === 0) {
        console.debug(`VirtualScroll: ${renderCount} renders, visible items: ${visibleItems.value.length}`)
      }
    })
  }

  return {
    containerRef,
    scrollTop,
    startIndex,
    endIndex,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll: throttledHandleScroll,
    scrollToItem,
    scrollToTop,
    getVisibleRange
  }
}

/**
 * Virtual scrolling manager for complex scenarios
 */
export class VirtualScrollManager {
  private scrollTop = 0
  private containerHeight: number
  private itemHeight: number
  private buffer: number
  private itemCount = 0

  constructor(
    containerHeight: number,
    itemHeight: number,
    buffer = 5
  ) {
    this.containerHeight = containerHeight
    this.itemHeight = itemHeight
    this.buffer = buffer
  }

  updateScrollTop(scrollTop: number): void {
    this.scrollTop = scrollTop
  }

  updateItemCount(count: number): void {
    this.itemCount = count
  }

  getVisibleRange(): { start: number; end: number; offset: number } {
    const visibleCount = Math.ceil(this.containerHeight / this.itemHeight)
    const start = Math.max(0, Math.floor(this.scrollTop / this.itemHeight) - this.buffer)
    const end = Math.min(this.itemCount, start + visibleCount + this.buffer * 2)
    const offset = start * this.itemHeight

    return { start, end, offset }
  }

  getTotalHeight(): number {
    return this.itemCount * this.itemHeight
  }

  scrollToIndex(index: number): number {
    return Math.max(0, index * this.itemHeight)
  }

  isIndexVisible(index: number): boolean {
    const range = this.getVisibleRange()
    return index >= range.start && index < range.end
  }

  // Performance metrics
  getPerformanceMetrics(): {
    visibleRatio: number
    memoryReduction: number
    renderOptimization: string
  } {
    const range = this.getVisibleRange()
    const visibleCount = range.end - range.start
    const visibleRatio = this.itemCount > 0 ? visibleCount / this.itemCount : 0
    const memoryReduction = this.itemCount > 0 ? (1 - visibleRatio) * 100 : 0

    return {
      visibleRatio,
      memoryReduction,
      renderOptimization: `${Math.round(memoryReduction)}% DOM nodes saved`
    }
  }
}