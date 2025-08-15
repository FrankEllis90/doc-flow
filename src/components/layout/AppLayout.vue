<template>
  <div 
    class="min-h-screen app-layout" 
    :class="{ 
      'sidebar-expanded': sidebarExpanded,
      'sidebar-collapsed': !sidebarExpanded,
      'mobile-menu-open': mobileMenuOpen
    }"
    style="background: linear-gradient(135deg, var(--color-neutral-50) 0%, var(--color-primary-50) 100%);"
  >
    <!-- Skip Navigation Links for Accessibility -->
    <a href="#main-content" class="skip-link" @click="focusMainContent">
      Skip to main content
    </a>
    <a href="#primary-navigation" class="skip-link" @click="focusNavigation">
      Skip to navigation
    </a>
    
    <!-- New Sidebar Navigation -->
    <SideNav
      :is-collapsed="sidebarCollapsed"
      :active="activeNavId"
      @toggle="toggleSidebar"
    />
    
    <!-- Mobile Menu Toggle (hidden on desktop) -->
    <button
      v-if="isMobile"
      @click="toggleMobileMenu"
      class="mobile-menu-toggle"
      :class="{ 'menu-open': mobileMenuOpen }"
      :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'"
      type="button"
    >
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>
    
    <!-- Main Content Area -->
    <div class="main-wrapper">
      <!-- Header with proper landmark (optional - can be removed if not needed) -->
      <header v-if="showHeader" role="banner" aria-label="Page header" class="page-header">
        <AppHeader />
      </header>
      
      <!-- Main Content with proper landmark and focus management -->
      <main 
        id="main-content"
        ref="mainContent"
        role="main" 
        aria-label="Main content"
        class="main-content"
        tabindex="-1"
      >
        <!-- Screen reader announcement area -->
        <div 
          id="announcement-region" 
          aria-live="polite" 
          aria-atomic="true" 
          class="sr-only"
          ref="announcementRegion"
        ></div>
        
        <slot />
      </main>
      
      <!-- Footer with proper landmark (optional) -->
      <footer v-if="showFooter" role="contentinfo" aria-label="Site footer" class="page-footer">
        <AppFooter />
      </footer>
    </div>
    
    <!-- Global Modals and Overlays with proper ARIA -->
    <div 
      class="app-overlays" 
      role="region" 
      aria-label="Modal dialogs and notifications"
      aria-live="assertive"
    >
      <slot name="modals" />
      <slot name="notifications" />
    </div>
  </div>
</template>

<script>
import { ref, computed, getCurrentInstance, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import SideNav from '../nav/SideNav.vue'
import AppHeader from '../AppHeader.vue'
import AppFooter from '../AppFooter.vue'

export default {
  name: 'AppLayout',
  components: {
    SideNav,
    AppHeader,
    AppFooter
  },
  props: {
    title: {
      type: String,
      default: 'Doc Layer'
    },
    description: {
      type: String,
      default: 'Enterprise AI Document Processing Platform'
    },
    showHeader: {
      type: Boolean,
      default: false
    },
    showFooter: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const mainContent = ref(null)
    const announcementRegion = ref(null)
    const isMobile = ref(false)
    const sidebarCollapsed = ref(false)
    
    // Store
    const appStore = useAppStore()
    
    // Computed
    const sidebarExpanded = computed(() => !sidebarCollapsed.value)
    const mobileMenuOpen = computed(() => appStore.mobileMenuOpen)
    
    // Map current navigation to active nav ID
    const activeNavId = computed(() => {
      const nav = appStore.currentNavigation
      if (nav === 'manual-builder') return 'manual'
      if (nav === 'document-processing') return 'process'
      if (nav === 'versions') return 'versions'
      if (nav === 'settings') return 'settings'
      if (nav === 'home') return 'home'
      // Default to home if no match
      return 'home'
    })
    
    // Set document title if provided
    if (props.title) {
      document.title = props.title
    }
    
    // Set meta description if provided
    if (props.description) {
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content', props.description)
      } else {
        const meta = document.createElement('meta')
        meta.name = 'description'
        meta.content = props.description
        document.head.appendChild(meta)
      }
    }
    
    // Mobile responsiveness
    const checkMobile = () => {
      isMobile.value = window.innerWidth < 768
    }
    
    const handleResize = () => {
      checkMobile()
      if (!isMobile.value && mobileMenuOpen.value) {
        appStore.closeMobileMenu()
      }
    }
    
    // Methods
    const toggleMobileMenu = () => {
      appStore.toggleMobileMenu()
    }
    
    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }
    
    // Accessibility functions
    const focusMainContent = (event) => {
      event.preventDefault()
      if (mainContent.value) {
        mainContent.value.focus()
        announceToScreenReader('Navigated to main content')
      }
    }
    
    const focusNavigation = (event) => {
      event.preventDefault()
      const navigation = document.querySelector('#primary-navigation') || 
                        document.querySelector('[role="navigation"]') ||
                        document.querySelector('nav')
      if (navigation) {
        // Find first focusable element in navigation
        const focusable = navigation.querySelector('a, button, [tabindex]:not([tabindex="-1"])')
        if (focusable) {
          focusable.focus()
          announceToScreenReader('Navigated to main navigation')
        }
      }
    }
    
    const announceToScreenReader = (message) => {
      if (announcementRegion.value) {
        announcementRegion.value.textContent = message
        // Clear the message after a short delay to allow for re-announcements
        setTimeout(() => {
          if (announcementRegion.value) {
            announcementRegion.value.textContent = ''
          }
        }, 1000)
      }
    }
    
    // Expose announcement function globally for other components
    const instance = getCurrentInstance()
    if (instance) {
      instance.appContext.config.globalProperties.$announceToScreenReader = announceToScreenReader
    }
    
    // Lifecycle
    onMounted(() => {
      checkMobile()
      window.addEventListener('resize', handleResize)
    })
    
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })
    
    return {
      // Refs
      mainContent,
      announcementRegion,
      isMobile,
      sidebarCollapsed,
      
      // Computed
      sidebarExpanded,
      mobileMenuOpen,
      activeNavId,
      
      // Methods
      focusMainContent,
      focusNavigation,
      announceToScreenReader,
      toggleMobileMenu,
      toggleSidebar
    }
  }
}
</script>

<style scoped>
/* ===== APP LAYOUT WITH VERTICAL SIDEBAR ===== */

.app-layout {
  min-height: 100vh;
  position: relative;
  display: flex;
}

/* ===== MAIN WRAPPER ===== */

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left var(--transition-base);
}

/* Desktop - Sidebar Expanded */
.sidebar-expanded .main-wrapper {
  margin-left: 224px;
}

/* Desktop - Sidebar Collapsed */
.sidebar-collapsed .main-wrapper {
  margin-left: 84px;
}

/* ===== MAIN CONTENT ===== */

.main-content {
  flex: 1;
  padding: var(--space-6) var(--space-4);
  max-width: 100%;
  overflow-x: hidden;
}

/* ===== OPTIONAL HEADER AND FOOTER ===== */

.page-header {
  background: var(--color-neutral-0);
  border-bottom: 1px solid var(--border-primary);
  padding: var(--space-4) var(--space-6);
  box-shadow: var(--shadow-sm);
}

.page-footer {
  background: var(--color-neutral-50);
  border-top: 1px solid var(--border-primary);
  padding: var(--space-4) var(--space-6);
  margin-top: auto;
}

/* ===== MOBILE MENU TOGGLE ===== */

.mobile-menu-toggle {
  /* Button Reset */
  appearance: none;
  border: none;
  background: none;
  
  /* Position */
  position: fixed;
  top: var(--space-4);
  left: var(--space-4);
  z-index: calc(var(--z-modal) + 1);
  
  /* Layout */
  width: 48px;
  height: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  
  /* Design */
  background: var(--color-neutral-0);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-primary);
  
  /* Interactions */
  cursor: pointer;
  transition: all var(--transition-fast);
}

.mobile-menu-toggle:hover {
  background: var(--color-primary-50);
  transform: scale(1.05);
  box-shadow: var(--shadow-xl);
}

.mobile-menu-toggle:active {
  transform: scale(0.95);
}

/* Hamburger Lines */
.hamburger-line {
  width: 20px;
  height: 2px;
  background: var(--text-primary);
  border-radius: 1px;
  transition: all var(--transition-fast);
  transform-origin: center;
}

/* Hamburger Animation - Menu Open */
.mobile-menu-toggle.menu-open .hamburger-line:nth-child(1) {
  transform: rotate(45deg) translateY(6px);
}

.mobile-menu-toggle.menu-open .hamburger-line:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}

.mobile-menu-toggle.menu-open .hamburger-line:nth-child(3) {
  transform: rotate(-45deg) translateY(-6px);
}

/* ===== SKIP LINKS ===== */

.skip-link {
  position: absolute;
  top: -100px;
  left: var(--space-4);
  z-index: 9999;
  
  /* Design */
  background: var(--color-neutral-800);
  color: var(--color-neutral-0);
  padding: var(--space-2) var(--space-4);
  text-decoration: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  
  /* Transitions */
  transition: top var(--transition-fast);
}

.skip-link:focus {
  top: var(--space-4);
  outline: 2px solid var(--focus-ring-primary);
  outline-offset: 2px;
}

/* ===== OVERLAYS ===== */

.app-overlays {
  position: relative;
  z-index: var(--z-toast);
}

/* ===== RESPONSIVE BEHAVIOR ===== */

/* Tablet - Collapsed Sidebar Only */
@media (min-width: 768px) and (max-width: 1023px) {
  .sidebar-expanded .main-wrapper,
  .sidebar-collapsed .main-wrapper {
    margin-left: 84px;
  }
  
  .main-content {
    padding: var(--space-6) var(--space-4);
  }
  
  .mobile-menu-toggle {
    display: none;
  }
}

/* Mobile - No Sidebar Margin, Overlay Only */
@media (max-width: 767px) {
  .sidebar-expanded .main-wrapper,
  .sidebar-collapsed .main-wrapper {
    margin-left: 0;
  }
  
  .main-content {
    padding: var(--space-16) var(--space-4) var(--space-4) var(--space-4);
  }
  
  .mobile-menu-open {
    overflow: hidden;
  }
  
  .page-header,
  .page-footer {
    padding: var(--space-4);
  }
}

/* Large Desktop - Enhanced Spacing */
@media (min-width: 1440px) {
  .main-content {
    padding: var(--space-10) var(--space-8);
    max-width: 1400px;
    margin: 0 auto;
  }
}

/* Ultra-wide Desktop */
@media (min-width: 1920px) {
  .main-content {
    padding: var(--space-12) var(--space-10);
    max-width: 1600px;
  }
}

/* ===== ACCESSIBILITY ENHANCEMENTS ===== */

/* High contrast mode */
@media (prefers-contrast: high) {
  .mobile-menu-toggle {
    border: 2px solid var(--text-primary);
    background: var(--color-neutral-0);
  }
  
  .page-header,
  .page-footer {
    border-width: 2px;
  }
  
  .skip-link {
    background: var(--color-neutral-900);
    border: 2px solid var(--color-neutral-0);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .main-wrapper,
  .mobile-menu-toggle,
  .hamburger-line,
  .skip-link {
    transition: none;
  }
}

/* Print styles */
@media print {
  .mobile-menu-toggle,
  .skip-link {
    display: none;
  }
  
  .main-wrapper {
    margin-left: 0 !important;
  }
  
  .main-content {
    padding: var(--space-4);
  }
}

/* Focus management for better accessibility */
.main-content:focus {
  outline: none;
}

.main-content:focus-visible {
  outline: 2px solid var(--focus-ring-primary);
  outline-offset: -2px;
}
</style>