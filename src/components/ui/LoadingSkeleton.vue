<template>
  <div 
    class="animate-pulse"
    :class="containerClass"
    role="status"
    aria-label="Loading content"
  >
    <!-- Card Loading Skeleton -->
    <template v-if="variant === 'card'">
      <div class="bg-white rounded-xl border border-neutral-200 p-6">
        <div class="skeleton-heading mb-4"></div>
        <div class="space-y-3">
          <div class="skeleton-text"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text w-3/4"></div>
        </div>
        <div class="flex justify-between items-center mt-6">
          <div class="skeleton-button"></div>
          <div class="skeleton-avatar"></div>
        </div>
      </div>
    </template>

    <!-- List Loading Skeleton -->
    <template v-else-if="variant === 'list'">
      <div class="space-y-4">
        <div 
          v-for="n in count" 
          :key="n"
          class="flex items-center space-x-4 p-4 bg-white rounded-lg border border-neutral-200"
        >
          <div class="skeleton-avatar"></div>
          <div class="flex-1 space-y-2">
            <div class="skeleton-text w-1/2"></div>
            <div class="skeleton-text w-3/4"></div>
          </div>
          <div class="skeleton-button"></div>
        </div>
      </div>
    </template>

    <!-- Table Loading Skeleton -->
    <template v-else-if="variant === 'table'">
      <div class="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <!-- Table Header -->
        <div class="border-b border-neutral-200 p-4">
          <div class="grid grid-cols-4 gap-4">
            <div class="skeleton-text w-20"></div>
            <div class="skeleton-text w-24"></div>
            <div class="skeleton-text w-16"></div>
            <div class="skeleton-text w-20"></div>
          </div>
        </div>
        <!-- Table Rows -->
        <div class="divide-y divide-neutral-200">
          <div 
            v-for="n in count" 
            :key="n"
            class="p-4"
          >
            <div class="grid grid-cols-4 gap-4 items-center">
              <div class="skeleton-text w-32"></div>
              <div class="skeleton-text w-28"></div>
              <div class="skeleton-text w-20"></div>
              <div class="skeleton-button w-16"></div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Form Loading Skeleton -->
    <template v-else-if="variant === 'form'">
      <div class="bg-white rounded-xl border border-neutral-200 p-6">
        <div class="skeleton-heading mb-6"></div>
        <div class="space-y-6">
          <div v-for="n in count" :key="n" class="space-y-2">
            <div class="skeleton-text w-20 h-4"></div>
            <div class="skeleton h-10 rounded-lg"></div>
          </div>
        </div>
        <div class="flex justify-end space-x-3 mt-8">
          <div class="skeleton-button w-20"></div>
          <div class="skeleton-button w-24"></div>
        </div>
      </div>
    </template>

    <!-- Text Loading Skeleton -->
    <template v-else-if="variant === 'text'">
      <div class="space-y-3">
        <div v-for="n in count" :key="n" class="skeleton-text"></div>
        <div class="skeleton-text w-2/3"></div>
      </div>
    </template>

    <!-- Avatar Loading Skeleton -->
    <template v-else-if="variant === 'avatar'">
      <div class="flex items-center space-x-3">
        <div class="skeleton-avatar"></div>
        <div class="flex-1 space-y-2">
          <div class="skeleton-text w-32"></div>
          <div class="skeleton-text w-24"></div>
        </div>
      </div>
    </template>

    <!-- Stats Loading Skeleton -->
    <template v-else-if="variant === 'stats'">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div 
          v-for="n in count" 
          :key="n"
          class="bg-white rounded-xl border border-neutral-200 p-6 text-center"
        >
          <div class="skeleton h-8 w-16 mx-auto mb-2"></div>
          <div class="skeleton-text w-20 mx-auto"></div>
        </div>
      </div>
    </template>

    <!-- Process Steps Loading Skeleton -->
    <template v-else-if="variant === 'process'">
      <div class="flex justify-center mb-8">
        <div class="flex items-center space-x-4">
          <div 
            v-for="n in count" 
            :key="n"
            class="flex flex-col items-center"
          >
            <div class="skeleton w-12 h-12 rounded-full"></div>
            <div class="skeleton-text w-16 mt-2"></div>
            <div v-if="n < count" class="skeleton h-0.5 w-16 mt-4"></div>
          </div>
        </div>
      </div>
    </template>

    <!-- Chunk Cards Loading Skeleton -->
    <template v-else-if="variant === 'chunks'">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div 
          v-for="n in count" 
          :key="n"
          class="bg-white rounded-xl border border-neutral-200 border-l-4 border-l-neutral-200 p-4"
        >
          <div class="flex justify-between items-start mb-3">
            <div class="skeleton-text w-20"></div>
            <div class="skeleton-button w-16"></div>
          </div>
          <div class="skeleton-text w-24 mb-3"></div>
          <div class="space-y-2 mb-4">
            <div class="skeleton-text"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-text w-3/4"></div>
          </div>
          <div class="skeleton-text w-32 mb-3"></div>
          <div class="flex flex-wrap gap-2 mb-3">
            <div class="skeleton h-6 w-16 rounded-full"></div>
            <div class="skeleton h-6 w-20 rounded-full"></div>
            <div class="skeleton h-6 w-14 rounded-full"></div>
          </div>
          <div class="skeleton h-8 rounded-lg"></div>
        </div>
      </div>
    </template>

    <!-- Upload Zone Loading Skeleton -->
    <template v-else-if="variant === 'upload'">
      <div class="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center">
        <div class="skeleton w-16 h-16 rounded-full mx-auto mb-4"></div>
        <div class="skeleton-button mx-auto mb-3"></div>
        <div class="skeleton-text w-64 mx-auto mb-2"></div>
        <div class="skeleton-text w-48 mx-auto"></div>
      </div>
    </template>

    <!-- Default/Custom Loading Skeleton -->
    <template v-else>
      <div 
        class="skeleton"
        :style="{
          width: width || '100%',
          height: height || '1rem',
          borderRadius: rounded ? '0.5rem' : '0.25rem'
        }"
      ></div>
    </template>

    <!-- Screen reader text -->
    <span class="sr-only">Loading...</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'table' | 'form' | 'text' | 'avatar' | 'stats' | 'process' | 'chunks' | 'upload' | 'custom'
  count?: number
  width?: string
  height?: string
  rounded?: boolean
  className?: string
}

const props = withDefaults(defineProps<LoadingSkeletonProps>(), {
  variant: 'custom',
  count: 3,
  rounded: true
})

const containerClass = computed(() => {
  const classes = []
  
  if (props.className) {
    classes.push(props.className)
  }
  
  return classes
})
</script>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  .animate-pulse {
    animation: none;
  }
  
  .skeleton,
  .skeleton-text,
  .skeleton-heading,
  .skeleton-avatar,
  .skeleton-button {
    background-color: theme('colors.neutral.200');
  }
}

/* Ensure skeletons are visible in high contrast mode */
@media (prefers-contrast: high) {
  .skeleton,
  .skeleton-text,
  .skeleton-heading,
  .skeleton-avatar,
  .skeleton-button {
    background-color: theme('colors.neutral.300');
    border: 1px solid theme('colors.neutral.500');
  }
}
</style>