<template>
  <button
    :disabled="loading || disabled"
    :class="buttonClass"
    class="relative overflow-hidden transition-all duration-200"
    v-bind="$attrs"
    @click="$emit('click')"
  >
    <span :class="{ 'opacity-0': loading }" class="flex items-center justify-center transition-opacity duration-200">
      <slot />
    </span>
    
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center"
    >
      <div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      <span v-if="loadingText" class="ml-2 text-sm">{{ loadingText }}</span>
    </div>
  </button>
</template>

<script>
export default {
  name: 'LoadingButton',
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'success', 'warning', 'danger'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg'].includes(value)
    },
    loadingText: {
      type: String,
      default: ''
    }
  },
  emits: ['click'],
  computed: {
    buttonClass() {
      const baseClasses = 'font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
      
      // Size classes
      const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
      }
      
      // Variant classes
      const variantClasses = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
        secondary: 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 focus:ring-neutral-500',
        success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500',
        warning: 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500',
        danger: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500'
      }
      
      return [
        baseClasses,
        sizeClasses[this.size],
        variantClasses[this.variant]
      ].join(' ')
    }
  }
}
</script>