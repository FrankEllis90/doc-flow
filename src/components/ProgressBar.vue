<template>
  <div class="progress-container">
    <!-- Progress Label -->
    <div v-if="showLabel" class="flex justify-between items-center mb-2">
      <span class="text-sm font-medium text-neutral-900">{{ label }}</span>
      <span class="text-sm text-neutral-600">{{ Math.round(percentage) }}%</span>
    </div>
    
    <!-- Progress Bar -->
    <div
      :class="[
        'progress-track',
        sizeClass,
        variantClass
      ]"
      role="progressbar"
      :aria-valuenow="percentage"
      :aria-valuemin="0"
      :aria-valuemax="100"
      :aria-label="ariaLabel"
    >
      <!-- Background Track -->
      <div class="absolute inset-0 bg-neutral-200 rounded-full overflow-hidden">
        <!-- Progress Fill -->
        <div
          class="progress-fill h-full transition-all duration-500 ease-out rounded-full"
          :style="{
            width: `${clampedPercentage}%`,
            background: gradient
          }"
        >
          <!-- Animated Shine Effect -->
          <div
            v-if="animated && percentage > 0 && percentage < 100"
            class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
          />
        </div>
      </div>
      
      <!-- Indeterminate Animation -->
      <div
        v-if="indeterminate"
        class="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full opacity-70 animate-indeterminate"
      />
    </div>
    
    <!-- Status Text -->
    <div v-if="status" class="mt-2 text-xs text-neutral-600">
      {{ status }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProgressBar',
  props: {
    value: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100
    },
    label: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: ''
    },
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'success', 'warning', 'error', 'info'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg'].includes(value)
    },
    animated: {
      type: Boolean,
      default: true
    },
    indeterminate: {
      type: Boolean,
      default: false
    },
    showLabel: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    percentage() {
      return Math.max(0, Math.min(100, (this.value / this.max) * 100))
    },
    
    clampedPercentage() {
      return Math.round(this.percentage * 100) / 100
    },
    
    sizeClass() {
      const sizeMap = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3'
      }
      return sizeMap[this.size]
    },
    
    variantClass() {
      return `progress-${this.variant}`
    },
    
    gradient() {
      const gradients = {
        primary: 'linear-gradient(90deg, #4f6bf5 0%, #667eea 100%)',
        success: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
        warning: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
        error: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
        info: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)'
      }
      return gradients[this.variant]
    },
    
    ariaLabel() {
      return this.label || `Progress: ${Math.round(this.percentage)}%`
    }
  }
}
</script>

<style scoped>
.progress-container {
  @apply w-full;
}

.progress-track {
  @apply relative w-full rounded-full overflow-hidden;
}

.progress-fill {
  position: relative;
  overflow: hidden;
}

.animate-shimmer {
  animation: shimmer 1.5s ease-in-out infinite;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%);
  background-size: 200% 100%;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.animate-indeterminate {
  animation: indeterminate 2s ease-in-out infinite;
  width: 40%;
}

@keyframes indeterminate {
  0% {
    left: -40%;
  }
  100% {
    left: 100%;
  }
}

/* Variant-specific styling */
.progress-primary {
  @apply shadow-sm;
}

.progress-success {
  @apply shadow-sm shadow-success-500/10;
}

.progress-warning {
  @apply shadow-sm shadow-warning-500/10;
}

.progress-error {
  @apply shadow-sm shadow-error-500/10;
}

.progress-info {
  @apply shadow-sm shadow-primary-500/10;
}
</style>