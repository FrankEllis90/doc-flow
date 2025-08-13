<template>
  <div 
    v-if="show" 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    role="dialog" 
    aria-labelledby="processing-title"
    aria-describedby="processing-status"
  >
    <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
      <div class="mb-6">
        <div class="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
      </div>
      
      <h3 id="processing-title" class="text-xl font-semibold text-neutral-900 mb-3">
        Processing Content
      </h3>
      
      <p id="processing-status" class="text-neutral-600 mb-4">
        {{ status }}
      </p>
      
      <!-- Progress bar -->
      <div v-if="showProgress" class="w-full bg-neutral-200 rounded-full h-2 mb-4">
        <div 
          class="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-out"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
      
      <div class="text-sm text-neutral-500">
        Please wait while we process your content...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  show: boolean
  status: string
  progress?: number
}

const props = withDefaults(defineProps<Props>(), {
  progress: 0
})

const showProgress = computed(() => props.progress > 0 && props.progress <= 100)
</script>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>