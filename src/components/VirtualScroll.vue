<template>
  <div 
    ref="containerRef"
    class="virtual-scroll-container overflow-auto"
    :style="{ height: containerHeight + 'px' }"
    @scroll="handleScroll"
  >
    <!-- Virtual spacer to maintain scroll height -->
    <div :style="{ height: totalHeight + 'px', position: 'relative' }">
      <!-- Visible items container -->
      <div :style="{ transform: `translateY(${offsetY}px)` }">
        <div
          v-for="(item, index) in visibleItems"
          :key="getItemKey(item, startIndex + index)"
          :style="{ height: itemHeight + 'px' }"
          class="virtual-scroll-item"
        >
          <slot
            :item="item"
            :index="startIndex + index"
            :isVisible="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

interface Props {
  items: T[]
  itemHeight: number
  containerHeight: number
  buffer?: number
  keyField?: keyof T
}

const props = withDefaults(defineProps<Props>(), {
  buffer: 5,
  keyField: 'id' as keyof T
})

const emit = defineEmits<{
  'scroll': [scrollTop: number]
  'visible-range-change': [start: number, end: number]
}>()

// Refs
const containerRef = ref<HTMLElement>()
const scrollTop = ref(0)

// Computed properties
const totalHeight = computed(() => props.items.length * props.itemHeight)

const visibleCount = computed(() => Math.ceil(props.containerHeight / props.itemHeight))

const startIndex = computed(() => {
  const start = Math.floor(scrollTop.value / props.itemHeight) - props.buffer
  return Math.max(0, start)
})

const endIndex = computed(() => {
  const end = startIndex.value + visibleCount.value + props.buffer * 2
  return Math.min(props.items.length, end)
})

const visibleItems = computed(() => {
  return props.items.slice(startIndex.value, endIndex.value)
})

const offsetY = computed(() => startIndex.value * props.itemHeight)

// Methods
const getItemKey = (item: T, index: number): string | number => {
  if (props.keyField && item && typeof item === 'object' && props.keyField in item) {
    const key = item[props.keyField]
    return typeof key === 'string' || typeof key === 'number' ? key : index
  }
  return index
}

const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement
  scrollTop.value = target.scrollTop
  emit('scroll', target.scrollTop)
}

// Watchers
watch([startIndex, endIndex], ([newStart, newEnd], [oldStart, oldEnd]) => {
  if (newStart !== oldStart || newEnd !== oldEnd) {
    emit('visible-range-change', newStart, newEnd)
  }
})

// Scroll to specific item
const scrollToItem = (index: number, behavior: ScrollBehavior = 'smooth') => {
  if (!containerRef.value) return
  
  const targetScrollTop = index * props.itemHeight
  containerRef.value.scrollTo({
    top: targetScrollTop,
    behavior
  })
}

// Scroll to top
const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
  scrollToItem(0, behavior)
}

// Get current visible range
const getVisibleRange = () => ({
  start: startIndex.value,
  end: endIndex.value,
  visibleCount: visibleItems.value.length
})

// Expose methods
defineExpose({
  scrollToItem,
  scrollToTop,
  getVisibleRange,
  containerRef
})

// Performance monitoring
let lastFrameTime = 0
let frameCount = 0
const performanceThreshold = 16.67 // ~60fps

const monitorPerformance = () => {
  const now = performance.now()
  const deltaTime = now - lastFrameTime
  lastFrameTime = now
  frameCount++
  
  if (frameCount % 60 === 0 && deltaTime > performanceThreshold) {
    console.warn(`VirtualScroll performance: ${(1000 / deltaTime).toFixed(1)}fps`)
  }
}

onMounted(() => {
  // Initial scroll position
  nextTick(() => {
    if (containerRef.value) {
      scrollTop.value = containerRef.value.scrollTop
    }
  })
  
  // Performance monitoring in development
  if (import.meta.env.DEV) {
    const interval = setInterval(monitorPerformance, 1000)
    onUnmounted(() => clearInterval(interval))
  }
})
</script>

<style scoped>
.virtual-scroll-container {
  overflow-y: auto;
  overflow-x: hidden;
}

.virtual-scroll-item {
  box-sizing: border-box;
}

/* Smooth scrolling performance optimizations */
.virtual-scroll-container {
  /* Enable hardware acceleration */
  transform: translateZ(0);
  /* Optimize scrolling performance */
  -webkit-overflow-scrolling: touch;
  /* Contain layout to prevent reflows */
  contain: layout style paint;
}

/* Hide scrollbar in webkit browsers while maintaining functionality */
.virtual-scroll-container::-webkit-scrollbar {
  width: 8px;
}

.virtual-scroll-container::-webkit-scrollbar-track {
  background: var(--neutral-bg, #f5f5f5);
  border-radius: 4px;
}

.virtual-scroll-container::-webkit-scrollbar-thumb {
  background: var(--neutral-muted, #d1d5db);
  border-radius: 4px;
  transition: background-color 0.2s;
}

.virtual-scroll-container::-webkit-scrollbar-thumb:hover {
  background: var(--neutral-text, #6b7280);
}
</style>