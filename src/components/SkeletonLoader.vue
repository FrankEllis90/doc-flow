<template>
  <div
    :class="[
      'animate-pulse',
      roundedClass,
      backgroundClass,
      sizeClass
    ]"
    :style="customStyle"
    role="status"
    aria-label="Loading..."
  >
    <!-- Screen reader text -->
    <span class="sr-only">Loading content...</span>
  </div>
</template>

<script>
export default {
  name: 'SkeletonLoader',
  props: {
    width: {
      type: [String, Number],
      default: 'auto'
    },
    height: {
      type: [String, Number],
      default: '1rem'
    },
    variant: {
      type: String,
      default: 'rectangular',
      validator: (value) => ['rectangular', 'circular', 'rounded'].includes(value)
    },
    animation: {
      type: String,
      default: 'pulse',
      validator: (value) => ['pulse', 'wave', 'none'].includes(value)
    },
    count: {
      type: Number,
      default: 1
    },
    spacing: {
      type: String,
      default: 'mb-2'
    }
  },
  computed: {
    roundedClass() {
      const roundingMap = {
        rectangular: 'rounded',
        rounded: 'rounded-lg',
        circular: 'rounded-full'
      }
      return roundingMap[this.variant]
    },
    
    backgroundClass() {
      return 'bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 bg-[length:200%_100%]'
    },
    
    sizeClass() {
      if (this.variant === 'circular') {
        const size = typeof this.width === 'string' ? this.width : `${this.width}px`
        return ''
      }
      return ''
    },
    
    customStyle() {
      const style = {}
      
      if (this.width !== 'auto') {
        style.width = typeof this.width === 'string' ? this.width : `${this.width}px`
      }
      
      if (this.height) {
        style.height = typeof this.height === 'string' ? this.height : `${this.height}px`
      }
      
      if (this.variant === 'circular') {
        const size = typeof this.width === 'string' ? this.width : `${this.width}px`
        style.width = size
        style.height = size
      }
      
      return style
    }
  }
}
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-shimmer {
  animation: shimmer 2s ease-in-out infinite;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
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
</style>