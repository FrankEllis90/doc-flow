<template>
  <Teleport to="body">
    <Transition name="modal" appear>
      <div 
        v-if="show"
        class="fixed inset-0 flex items-center justify-center z-50 modal-overlay"
        @click="handleOverlayClick"
        role="dialog"
        :aria-labelledby="titleId"
        :aria-describedby="contentId"
        aria-modal="true"
      >
        <div 
          class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 modal-content"
          :class="contentClasses"
          @click.stop
          ref="modalContent"
        >
          <!-- Header -->
          <div v-if="$slots.header || title" class="modal-header">
            <slot name="header">
              <div class="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-200">
                <h3 :id="titleId" class="text-base sm:text-lg font-semibold text-neutral-900">
                  {{ title }}
                </h3>
                <button
                  v-if="showCloseButton"
                  @click="handleClose"
                  class="text-neutral-400 hover:text-neutral-600 transition-colors close-button"
                  aria-label="Close modal"
                >
                  <i class="fas fa-times text-lg"></i>
                </button>
              </div>
            </slot>
          </div>
          
          <!-- Content -->
          <div :id="contentId" class="modal-body" :class="bodyClasses">
            <slot />
          </div>
          
          <!-- Footer -->
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'

export default {
  name: 'BaseModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    closeOnOverlay: {
      type: Boolean,
      default: true
    },
    closeOnEscape: {
      type: Boolean,
      default: true
    },
    showCloseButton: {
      type: Boolean,
      default: true
    },
    contentClasses: {
      type: String,
      default: ''
    },
    bodyClasses: {
      type: String,
      default: 'p-4 sm:p-6'
    },
    preventBodyScroll: {
      type: Boolean,
      default: true
    }
  },
  emits: ['close', 'opened', 'closed'],
  setup(props, { emit }) {
    const modalContent = ref(null)
    const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`
    const contentId = `modal-content-${Math.random().toString(36).substr(2, 9)}`
    const previousActiveElement = ref(null)
    
    const handleClose = () => {
      emit('close')
    }
    
    const handleOverlayClick = () => {
      if (props.closeOnOverlay) {
        handleClose()
      }
    }
    
    const handleEscape = (event) => {
      if (event.key === 'Escape' && props.closeOnEscape && props.show) {
        handleClose()
      }
    }
    
    const focusModal = async () => {
      await nextTick()
      if (modalContent.value) {
        // Store the previously focused element
        previousActiveElement.value = document.activeElement
        
        // Focus the modal content
        const focusableElement = modalContent.value.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
        if (focusableElement) {
          focusableElement.focus()
        } else {
          modalContent.value.focus()
        }
      }
    }
    
    const restoreFocus = () => {
      if (previousActiveElement.value && typeof previousActiveElement.value.focus === 'function') {
        previousActiveElement.value.focus()
      }
    }
    
    const trapFocus = (event) => {
      if (!modalContent.value || !props.show) return
      
      const focusableElements = modalContent.value.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      
      const firstFocusable = focusableElements[0]
      const lastFocusable = focusableElements[focusableElements.length - 1]
      
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstFocusable) {
            lastFocusable.focus()
            event.preventDefault()
          }
        } else {
          if (document.activeElement === lastFocusable) {
            firstFocusable.focus()
            event.preventDefault()
          }
        }
      }
    }
    
    const toggleBodyScroll = (disable) => {
      if (!props.preventBodyScroll) return
      
      if (disable) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
    
    // Watch for show/hide changes
    watch(() => props.show, (newShow) => {
      if (newShow) {
        focusModal()
        toggleBodyScroll(true)
        emit('opened')
      } else {
        restoreFocus()
        toggleBodyScroll(false)
        emit('closed')
      }
    })
    
    // Set up event listeners
    onMounted(() => {
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('keydown', trapFocus)
    })
    
    onUnmounted(() => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', trapFocus)
      toggleBodyScroll(false) // Ensure body scroll is restored
    })
    
    return {
      modalContent,
      titleId,
      contentId,
      handleClose,
      handleOverlayClick
    }
  }
}
</script>

<style scoped>
/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9) translateY(-20px);
}

.modal-overlay {
  background-color: var(--overlay-backdrop);
  backdrop-filter: blur(2px);
}

.modal-content {
  transition: all 0.3s ease;
  max-height: 90vh;
  overflow-y: auto;
  transform: scale(1) translateY(0);
}

.modal-header {
  flex-shrink: 0;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
}

.modal-footer {
  flex-shrink: 0;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.close-button {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
}

.close-button:hover {
  background-color: #f3f4f6;
}

.close-button:focus {
  outline: 2px solid var(--brand-sage);
  outline-offset: 2px;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .modal-content {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-body {
    padding: 1rem;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .modal-overlay {
    background-color: var(--overlay-backdrop);
  }
  
  .modal-content {
    border: 2px solid var(--neutral-text);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active {
    transition: none;
  }
  
  .modal-content {
    transition: none;
  }
}
</style>