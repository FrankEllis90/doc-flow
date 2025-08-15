<template>
  <transition
    enter-active-class="transition-all duration-500 ease-out"
    enter-from-class="opacity-0 translate-y-4 translate-x-4 scale-95"
    enter-to-class="opacity-100 translate-y-0 translate-x-0 scale-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100 translate-y-0 translate-x-0 scale-100"
    leave-to-class="opacity-0 translate-y-2 translate-x-4 scale-95"
  >
    <div
      v-if="visible"
      :class="toastClass"
      class="fixed top-4 right-4 z-50 max-w-sm rounded-xl shadow-xl border p-4 font-work backdrop-blur-sm"
      role="alert"
      :aria-live="type === 'error' ? 'assertive' : 'polite'"
      :aria-labelledby="`toast-title-${toastId}`"
      :aria-describedby="`toast-message-${toastId}`"
    >
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <!-- Success Icon -->
          <svg
            v-if="type === 'success'"
            class="w-6 h-6 text-success-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          
          <!-- Error Icon -->
          <svg
            v-else-if="type === 'error'"
            class="w-6 h-6 text-error-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          
          <!-- Warning Icon -->
          <svg
            v-else-if="type === 'warning'"
            class="w-6 h-6 text-warning-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          
          <!-- Info Icon -->
          <svg
            v-else
            class="w-6 h-6 text-primary-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        
        <div class="flex-1 min-w-0">
          <h4 :id="`toast-title-${toastId}`" class="text-sm font-semibold" :class="titleClass">{{ title }}</h4>
          <p :id="`toast-message-${toastId}`" class="text-sm mt-1 leading-relaxed" :class="messageClass">{{ message }}</p>
        </div>
        
        <button
          @click="close"
          class="flex-shrink-0 p-1 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
          :aria-label="`Close ${title} notification`"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'Toast',
  props: {
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      default: 5000
    },
    autoClose: {
      type: Boolean,
      default: true
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const visible = ref(false)
    const toastId = ref(Math.random().toString(36).substr(2, 9))
    
    const toastClass = computed(() => {
      const baseClasses = 'bg-white/95'
      
      switch (props.type) {
        case 'success':
          return `${baseClasses} border-success-300 bg-success-50/90 shadow-success-500/10`
        case 'error':
          return `${baseClasses} border-error-300 bg-error-50/90 shadow-error-500/10`
        case 'warning':
          return `${baseClasses} border-warning-300 bg-warning-50/90 shadow-warning-500/10`
        default:
          return `${baseClasses} border-primary-300 bg-primary-50/90 shadow-primary-500/10`
      }
    })
    
    const titleClass = computed(() => {
      switch (props.type) {
        case 'success':
          return 'text-success-800'
        case 'error':
          return 'text-error-800'
        case 'warning':
          return 'text-warning-800'
        default:
          return 'text-primary-800'
      }
    })
    
    const messageClass = computed(() => {
      return 'text-neutral-600'
    })
    
    const close = () => {
      visible.value = false
      setTimeout(() => {
        emit('close')
      }, 200)
    }
    
    onMounted(() => {
      visible.value = true
      
      if (props.autoClose && props.duration > 0) {
        setTimeout(() => {
          close()
        }, props.duration)
      }
    })
    
    return {
      visible,
      toastId,
      toastClass,
      titleClass,
      messageClass,
      close
    }
  }
}
</script>