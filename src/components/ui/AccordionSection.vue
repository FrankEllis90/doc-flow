<template>
  <div class="accordion-section">
    <div 
      class="accordion-header"
      :class="{ 'expanded': expanded }"
      @click="toggle"
      role="button"
      :aria-expanded="expanded.toString()"
      :aria-controls="contentId"
      tabindex="0"
      @keydown.enter="toggle"
      @keydown.space.prevent="toggle"
    >
      <div class="flex items-center space-x-3 flex-1">
        <!-- Step indicator (optional) -->
        <div 
          v-if="stepNumber"
          class="step-indicator-small"
          :class="{
            'step-active': status === 'active',
            'step-completed': status === 'completed',
            'step-inactive': status === 'inactive'
          }"
        >
          <i v-if="status === 'completed'" class="fas fa-check text-xs"></i>
          <span v-else class="text-sm font-semibold">{{ stepNumber }}</span>
        </div>
        
        <!-- Title and description -->
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-neutral-900">
            {{ title }}
          </h3>
          <p v-if="description" class="text-sm text-neutral-600 mt-1">
            {{ description }}
          </p>
          
          <!-- Summary when collapsed -->
          <div v-if="!expanded && summary" class="text-xs text-neutral-500 mt-1">
            {{ summary }}
          </div>
        </div>
        
        <!-- Status indicator -->
        <div v-if="statusText" class="flex items-center space-x-2">
          <span class="text-sm font-medium" :class="statusTextClass">{{ statusText }}</span>
          <div v-if="statusIcon" class="w-5 h-5 flex items-center justify-center">
            <i :class="statusIcon"></i>
          </div>
        </div>
      </div>
      
      <!-- Expand/collapse icon -->
      <div class="accordion-toggle">
        <i 
          class="fas transition-transform duration-200"
          :class="expanded ? 'fa-chevron-up' : 'fa-chevron-down'"
        ></i>
      </div>
    </div>
    
    <!-- Accordion content -->
    <div 
      :id="contentId"
      class="accordion-content"
      :class="{ 
        'expanded': expanded, 
        'collapsed': !expanded,
        'no-padding': noPadding
      }"
    >
      <div v-if="expanded || !lazy" class="accordion-inner">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

type AccordionStatus = 'active' | 'completed' | 'inactive'

interface Props {
  title: string
  description?: string
  summary?: string
  stepNumber?: number
  status?: AccordionStatus
  statusText?: string
  statusIcon?: string
  expanded?: boolean
  lazy?: boolean
  noPadding?: boolean
}

interface Emits {
  'update:expanded': [expanded: boolean]
  'toggle': [expanded: boolean]
}

const props = withDefaults(defineProps<Props>(), {
  status: 'inactive',
  expanded: false,
  lazy: false,
  noPadding: false
})

const emit = defineEmits<Emits>()

const contentId = `accordion-${Math.random().toString(36).substr(2, 9)}`

const expanded = ref(props.expanded)

const statusTextClass = computed(() => {
  switch (props.status) {
    case 'completed':
      return 'text-success-600'
    case 'active':
      return 'text-primary-600'
    case 'inactive':
    default:
      return 'text-neutral-600'
  }
})

const toggle = () => {
  expanded.value = !expanded.value
  emit('update:expanded', expanded.value)
  emit('toggle', expanded.value)
}

// Watch for external changes
watch(() => props.expanded, (newValue) => {
  expanded.value = newValue
})
</script>

<style scoped>
.accordion-section {
  @apply bg-white border border-neutral-200 rounded-lg mb-4 shadow-sm;
}

.accordion-header {
  @apply p-4 sm:p-6 cursor-pointer transition-colors duration-200;
  @apply flex items-center justify-between;
  @apply hover:bg-neutral-25;
}

.accordion-header:focus {
  @apply outline-none ring-2 ring-primary-500 ring-inset;
}

.accordion-header.expanded {
  @apply border-b border-neutral-200 bg-neutral-25;
}

.accordion-toggle {
  @apply w-8 h-8 flex items-center justify-center text-neutral-600 ml-4;
}

.accordion-content {
  @apply overflow-hidden transition-all duration-300 ease-in-out;
}

.accordion-content.expanded {
  @apply max-h-screen opacity-100;
}

.accordion-content.collapsed {
  @apply max-h-0 opacity-0;
}

.accordion-inner {
  @apply p-6;
}

.accordion-content.no-padding .accordion-inner {
  @apply p-0;
}

.step-indicator-small {
  @apply w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200;
}

.step-inactive {
  @apply bg-neutral-200 text-neutral-500;
}

.step-active {
  @apply bg-primary-600 text-white shadow-md;
}

.step-completed {
  @apply bg-success-600 text-white;
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .accordion-header {
    @apply p-4;
  }
  
  .accordion-inner {
    @apply p-4;
  }
  
  .accordion-toggle {
    @apply min-w-[44px] min-h-[44px];
  }
}
</style>