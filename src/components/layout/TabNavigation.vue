<template>
  <div class="bg-white border border-neutral-200 rounded-t-xl shadow-sm">
    <nav class="nav-tabs" role="tablist" aria-label="Main navigation">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="handleTabClick(tab.id)"
        @keydown="handleKeyDown($event, tab.id)"
        class="nav-tab flex-1 px-4 sm:px-6 py-3 text-sm sm:text-base font-medium focus-visible-primary"
        :class="{ 'nav-tab-active': activeTab === tab.id }"
        :aria-selected="activeTab === tab.id"
        :aria-controls="`tab-panel-${tab.id}`"
        role="tab"
        :tabindex="activeTab === tab.id ? 0 : -1"
        :disabled="tab.disabled"
      >
        <div class="flex items-center justify-center space-x-2">
          <!-- Icon -->
          <component 
            v-if="tab.iconComponent" 
            :is="tab.iconComponent" 
            class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" 
            :aria-hidden="true"
          />
          <i 
            v-else-if="tab.icon" 
            :class="`${tab.icon} w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0`"
            :aria-hidden="true"
          ></i>
          
          <!-- Label -->
          <span class="hidden sm:inline truncate">{{ tab.label }}</span>
          <span class="sm:hidden truncate">{{ tab.shortLabel || tab.label }}</span>
          
          <!-- Badge -->
          <span 
            v-if="tab.badge && tab.badge > 0" 
            class="badge badge-primary flex-shrink-0"
            :aria-label="`${tab.badge} items`"
          >
            {{ tab.badge > 99 ? '99+' : tab.badge }}
          </span>
        </div>
      </button>
    </nav>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'TabNavigation',
  props: {
    activeTab: {
      type: String,
      required: true
    },
    tabs: {
      type: Array,
      required: true,
      validator: (tabs) => {
        return tabs.every(tab => 
          tab.id && 
          tab.label && 
          typeof tab.id === 'string' && 
          typeof tab.label === 'string'
        )
      }
    }
  },
  emits: ['tab-change'],
  setup(props, { emit }) {
    const handleTabClick = (tabId) => {
      if (tabId !== props.activeTab) {
        emit('tab-change', tabId)
      }
    }
    
    // Keyboard navigation support
    const handleKeyDown = (event, tabId) => {
      const tabIndex = props.tabs.findIndex(tab => tab.id === tabId)
      let nextIndex = tabIndex
      
      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault()
          nextIndex = tabIndex > 0 ? tabIndex - 1 : props.tabs.length - 1
          break
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault()
          nextIndex = tabIndex < props.tabs.length - 1 ? tabIndex + 1 : 0
          break
        case 'Home':
          event.preventDefault()
          nextIndex = 0
          break
        case 'End':
          event.preventDefault()
          nextIndex = props.tabs.length - 1
          break
        default:
          return
      }
      
      const nextTab = props.tabs[nextIndex]
      if (nextTab && !nextTab.disabled) {
        emit('tab-change', nextTab.id)
        // Focus the newly selected tab
        setTimeout(() => {
          const nextButton = document.querySelector(`[aria-controls="tab-panel-${nextTab.id}"]`)
          if (nextButton) nextButton.focus()
        })
      }
    }
    
    // Computed property to get current tab info
    const currentTab = computed(() => {
      return props.tabs.find(tab => tab.id === props.activeTab)
    })
    
    return {
      handleTabClick,
      handleKeyDown,
      currentTab
    }
  }
}
</script>

<style scoped>
/* Tab navigation uses design system classes */
/* Additional custom styles for enhanced UX */

/* Smooth focus transitions */
.nav-tab {
  border-radius: 0.75rem 0.75rem 0 0;
  position: relative;
  overflow: hidden;
}

/* Enhanced focus states for better accessibility */
.nav-tab:focus-visible {
  z-index: 10;
  box-shadow: 0 0 0 2px theme('colors.white'), 0 0 0 4px theme('colors.primary.500');
}

/* Active tab indicator animation */
.nav-tab-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, theme('colors.primary.500'), theme('colors.primary.600'));
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: scaleX(0);
    opacity: 0;
  }
  to {
    transform: scaleX(1);
    opacity: 1;
  }
}

/* Badge pulse animation for attention */
.badge {
  animation: badgePulse 2s infinite;
}

@keyframes badgePulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

/* Mobile responsiveness improvements */
@media (max-width: 640px) {
  .nav-tab {
    min-height: 44px; /* Better touch targets */
    padding: 0.75rem 0.5rem;
  }
  
  /* Ensure text doesn't get too small */
  .nav-tab {
    font-size: 0.875rem;
  }
}

/* Tablet breakpoint */
@media (min-width: 641px) and (max-width: 1024px) {
  .nav-tab {
    padding: 1rem 1rem;
  }
}

/* High contrast mode enhancements */
@media (prefers-contrast: high) {
  .nav-tab-active {
    background-color: var(--color-primary-700);
    color: var(--color-neutral-0);
  }
  
  .nav-tab-active::after {
    height: 4px;
    background: var(--color-neutral-0);
  }
  
  .nav-tab:not(.nav-tab-active) {
    border: 1px solid var(--color-neutral-600);
  }
}

/* Reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .nav-tab-active::after,
  .badge {
    animation: none;
  }
  
  .nav-tab {
    transition: none;
  }
}

/* Print styles */
@media print {
  .nav-tabs {
    border-bottom: 2px solid var(--color-neutral-900);
  }
  
  .nav-tab-active {
    background: none;
    font-weight: bold;
    text-decoration: underline;
  }
  
  .badge {
    display: none;
  }
}

</style>