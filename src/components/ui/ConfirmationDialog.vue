<template>
  <div 
    v-if="show" 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    role="dialog"
    aria-labelledby="dialog-title"
    aria-describedby="dialog-message"
    @click.self="$emit('cancel')"
  >
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
      <div class="flex items-center mb-4">
        <div 
          class="w-6 h-6 mr-3 flex-shrink-0"
          :class="iconClass"
        >
          <i :class="iconName"></i>
        </div>
        <h3 id="dialog-title" class="text-lg font-semibold text-neutral-900">
          {{ title }}
        </h3>
      </div>
      
      <p id="dialog-message" class="text-neutral-600 mb-6" v-html="message"></p>
      
      <div class="flex justify-end space-x-3">
        <button
          @click="$emit('cancel')"
          class="btn btn-secondary"
          ref="cancelButton"
        >
          {{ cancelText }}
        </button>
        <button
          @click="$emit('confirm')"
          :class="confirmButtonClass"
          ref="confirmButton"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

type ConfirmVariant = 'primary' | 'danger' | 'warning'

interface Props {
  show: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: ConfirmVariant
  item?: any
}

interface Emits {
  confirm: []
  cancel: []
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  confirmVariant: 'primary'
})

const emit = defineEmits<Emits>()

const cancelButton = ref<HTMLButtonElement>()
const confirmButton = ref<HTMLButtonElement>()

const iconClass = computed(() => {
  switch (props.confirmVariant) {
    case 'danger':
      return 'text-error-600'
    case 'warning':
      return 'text-warning-600'
    case 'primary':
    default:
      return 'text-primary-600'
  }
})

const iconName = computed(() => {
  switch (props.confirmVariant) {
    case 'danger':
      return 'fas fa-exclamation-triangle'
    case 'warning':
      return 'fas fa-exclamation-circle'
    case 'primary':
    default:
      return 'fas fa-question-circle'
  }
})

const confirmButtonClass = computed(() => {
  const baseClasses = 'px-4 py-2 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  switch (props.confirmVariant) {
    case 'danger':
      return `${baseClasses} bg-error-600 text-white hover:bg-error-700 focus:ring-error-500`
    case 'warning':
      return `${baseClasses} bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500`
    case 'primary':
    default:
      return `${baseClasses} bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500`
  }
})

// Focus management
watch(() => props.show, (isShown) => {
  if (isShown) {
    nextTick(() => {
      // Focus the cancel button by default for safety
      cancelButton.value?.focus()
    })
  }
})

// Handle keyboard events
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    emit('cancel')
  } else if (event.key === 'Enter' && event.target === confirmButton.value) {
    emit('confirm')
  }
}

// Add global event listener when dialog is shown
watch(() => props.show, (isShown) => {
  if (isShown) {
    document.addEventListener('keydown', handleKeydown)
  } else {
    document.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<style scoped>
/* Ensure dialog appears above other content */
.z-50 {
  z-index: 50;
}

/* Smooth fade-in animation */
.fixed {
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.bg-white {
  animation: slideIn 0.15s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-16px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>