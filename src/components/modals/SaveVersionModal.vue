<template>
  <BaseModal
    :show="show"
    title="Create New Version"
    @close="handleClose"
    body-classes="space-y-4"
  >
    <div class="space-y-4">
      <div>
        <label 
          for="version-name-input"
          class="block text-sm font-medium text-neutral-700 mb-1"
        >
          Version Name *
        </label>
        <input
          id="version-name-input"
          ref="nameInput"
          v-model="versionName"
          type="text"
          class="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage transition-colors"
          :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': hasError }"
          placeholder="Enter version name"
          maxlength="100"
          @keyup.enter="handleSave"
          @input="clearError"
          :aria-describedby="hasError ? 'version-name-error' : 'version-name-help'"
        />
        
        <!-- Error message -->
        <div 
          v-if="hasError" 
          id="version-name-error"
          class="mt-1 text-sm text-red-600"
          role="alert"
        >
          {{ errorMessage }}
        </div>
        
        <!-- Help text -->
        <div 
          v-else
          id="version-name-help" 
          class="mt-1 text-xs text-neutral-500"
        >
          Choose a descriptive name for this version ({{ versionName.length }}/100)
        </div>
      </div>
      
      <!-- Version type indicator -->
      <div v-if="versionType" class="p-3 bg-neutral-50 rounded-md">
        <div class="text-sm">
          <span class="font-medium text-neutral-700">Version Type:</span>
          <span class="ml-2 capitalize">{{ versionType }}</span>
        </div>
        <div v-if="itemCount" class="text-xs text-neutral-500 mt-1">
          Contains {{ itemCount }} {{ itemCount === 1 ? 'item' : 'items' }}
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <template #footer>
      <div class="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
        <button
          @click="handleClose"
          class="w-full sm:w-auto px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage transition-colors order-2 sm:order-1"
        >
          Cancel
        </button>
        <button
          @click="handleSave"
          :disabled="!canSave || saving"
          class="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-sage border border-transparent rounded-md hover:bg-sage-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage disabled:opacity-50 disabled:cursor-not-allowed transition-colors order-1 sm:order-2"
        >
          <span v-if="saving" class="flex items-center justify-center">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            Creating...
          </span>
          <span v-else>
            Create Version
          </span>
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script>
import { ref, computed, watch, nextTick } from 'vue'
import BaseModal from '../layout/BaseModal.vue'
import { useErrorHandler } from '../../composables/useErrorHandler.ts'

export default {
  name: 'SaveVersionModal',
  components: {
    BaseModal
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    initialName: {
      type: String,
      default: ''
    },
    versionType: {
      type: String,
      default: ''
    },
    itemCount: {
      type: Number,
      default: 0
    }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const { validateInput } = useErrorHandler()
    
    const nameInput = ref(null)
    const versionName = ref('')
    const saving = ref(false)
    const hasError = ref(false)
    const errorMessage = ref('')
    
    const canSave = computed(() => {
      return versionName.value.trim().length > 0 && !hasError.value && !saving.value
    })
    
    const clearError = () => {
      hasError.value = false
      errorMessage.value = ''
    }
    
    const validateName = () => {
      const validation = validateInput(versionName.value, [
        { required: true, message: 'Version name is required' },
        { minLength: 2, message: 'Version name must be at least 2 characters' },
        { maxLength: 100, message: 'Version name must be less than 100 characters' },
        { pattern: /^[a-zA-Z0-9\s\-_.()]+$/, message: 'Version name contains invalid characters' }
      ])
      
      if (!validation.isValid) {
        hasError.value = true
        errorMessage.value = validation.errors[0]
        return false
      }
      
      clearError()
      return true
    }
    
    const handleSave = async () => {
      if (!validateName()) {
        return
      }
      
      saving.value = true
      
      try {
        await new Promise(resolve => setTimeout(resolve, 300)) // Brief delay for UX
        emit('save', {
          name: versionName.value.trim(),
          type: props.versionType,
          itemCount: props.itemCount
        })
      } catch (error) {
        hasError.value = true
        errorMessage.value = 'Failed to create version. Please try again.'
      } finally {
        saving.value = false
      }
    }
    
    const handleClose = () => {
      if (!saving.value) {
        emit('close')
      }
    }
    
    const resetForm = () => {
      versionName.value = props.initialName || ''
      clearError()
      saving.value = false
    }
    
    // Watch for show changes to reset form and focus input
    watch(() => props.show, async (newShow) => {
      if (newShow) {
        resetForm()
        await nextTick()
        if (nameInput.value) {
          nameInput.value.focus()
          nameInput.value.select()
        }
      }
    })
    
    // Watch for initial name changes
    watch(() => props.initialName, (newName) => {
      versionName.value = newName || ''
    }, { immediate: true })
    
    return {
      nameInput,
      versionName,
      saving,
      hasError,
      errorMessage,
      canSave,
      clearError,
      handleSave,
      handleClose
    }
  }
}
</script>

<style scoped>
/* Custom styles for form elements */
input:focus {
  box-shadow: 0 0 0 3px rgba(var(--brand-sage-rgb), 0.1);
}

.bg-sage {
  background-color: var(--brand-sage);
}

.hover\:bg-sage-dark:hover {
  background-color: var(--brand-sage-dark);
}

.focus\:ring-sage:focus {
  --tw-ring-color: var(--brand-sage);
}

.border-sage {
  border-color: var(--brand-sage);
}

/* Loading state */
.fas.fa-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>