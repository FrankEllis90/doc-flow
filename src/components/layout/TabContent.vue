<template>
  <div class="bg-white border-x border-b border-sage-light rounded-b-lg tab-content-container">
    <div 
      v-for="tab in tabs"
      :key="tab.id"
      v-show="activeTab === tab.id"
      :id="`tab-panel-${tab.id}`"
      :class="tab.contentClasses || 'p-3 sm:p-6'"
      role="tabpanel"
      :aria-labelledby="`tab-${tab.id}`"
      class="tab-panel"
    >
      <!-- Error Boundary for each tab -->
      <ErrorBoundary 
        :fallback-title="tab.errorTitle || `${tab.label} Error`"
        :fallback-message="tab.errorMessage || `There was an issue with the ${tab.label.toLowerCase()}.`"
        @error-occurred="handleTabError"
        @error-retry="handleTabRetry"
      >
        <!-- Tab Content Slot -->
        <slot 
          :name="tab.id" 
          :tab="tab"
          :is-active="activeTab === tab.id"
        >
          <!-- Fallback content if slot not provided -->
          <div class="flex items-center justify-center h-64 text-neutral-500">
            <div class="text-center">
              <i :class="tab.icon || 'fas fa-file-alt'" class="text-4xl mb-4 opacity-50"></i>
              <p>{{ tab.label }} content not available</p>
            </div>
          </div>
        </slot>
      </ErrorBoundary>
    </div>
  </div>
</template>

<script>
import ErrorBoundary from '../ErrorBoundary.vue'

export default {
  name: 'TabContent',
  components: {
    ErrorBoundary
  },
  props: {
    activeTab: {
      type: String,
      required: true
    },
    tabs: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['tab-error', 'tab-retry'],
  setup(props, { emit }) {
    const handleTabError = ({ error, errorInfo, retryCount }) => {
      const currentTab = props.tabs.find(tab => tab.id === props.activeTab)
      
      emit('tab-error', {
        tabId: props.activeTab,
        tabLabel: currentTab?.label || 'Unknown Tab',
        error,
        errorInfo,
        retryCount
      })
    }
    
    const handleTabRetry = ({ retryCount }) => {
      const currentTab = props.tabs.find(tab => tab.id === props.activeTab)
      
      emit('tab-retry', {
        tabId: props.activeTab,
        tabLabel: currentTab?.label || 'Unknown Tab',
        retryCount
      })
    }
    
    return {
      handleTabError,
      handleTabRetry
    }
  }
}
</script>

<style scoped>
.tab-content-container {
  min-height: 400px;
  position: relative;
}

.tab-panel {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Loading state */
.tab-panel.loading {
  opacity: 0.6;
  pointer-events: none;
}

.tab-panel.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid var(--brand-sage-light);
  border-top-color: var(--brand-sage);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .tab-content-container {
    min-height: 300px;
  }
}

/* Focus management for accessibility */
.tab-panel:focus {
  outline: 2px solid var(--brand-sage);
  outline-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .tab-content-container {
    border-color: var(--neutral-text);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .tab-panel {
    animation: none;
  }
  
  .tab-panel.loading::after {
    animation: none;
  }
}
</style>