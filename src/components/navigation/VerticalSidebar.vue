<template>
  <aside 
    :class="[
      'vertical-sidebar',
      { 
        'expanded': sidebarExpanded,
        'collapsed': !sidebarExpanded,
        'mobile-open': mobileMenuOpen 
      }
    ]"
  >
    <!-- Logo/Brand Section -->
    <div class="sidebar-header">
      <div class="brand-section">
        <div class="logo-container">
          <svg viewBox="0 0 40 40" class="logo">
            <path 
              d="M20 5 L35 15 L35 35 L20 35 L5 35 L5 15 Z" 
              fill="url(#sageGradient)" 
              stroke="#8CA085" 
              stroke-width="1.5"
            />
            <text x="20" y="25" text-anchor="middle" class="logo-text">DL</text>
            <defs>
              <linearGradient id="sageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#A8B79D;stop-opacity:0.3" />
                <stop offset="100%" style="stop-color:#8CA085;stop-opacity:0.3" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <transition name="fade">
          <div v-if="sidebarExpanded" class="brand-text">
            <h1 class="brand-name">Doc Layer</h1>
            <p class="brand-tagline">AI Knowledge Base</p>
          </div>
        </transition>
      </div>
      
      <!-- Collapse Toggle Button -->
      <button 
        @click="toggleSidebar"
        class="sidebar-toggle desktop-only"
        :title="sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'"
      >
        <i :class="sidebarExpanded ? 'fas fa-chevron-left' : 'fas fa-chevron-right'"></i>
      </button>
    </div>

    <!-- Navigation Items -->
    <nav class="sidebar-nav">
      <!-- Home -->
      <NavigationItem
        id="home"
        icon="fas fa-home"
        label="Home"
        description="Dashboard & Overview"
        :active="currentRoute === 'home'"
        :expanded="sidebarExpanded"
        @click="navigateTo('home')"
      />

      <!-- Knowledge Base Builder Section -->
      <NavigationSection
        id="kb-builder"
        icon="fas fa-book"
        label="Knowledge Base Builder"
        :expanded="sidebarExpanded"
        :defaultOpen="true"
        @toggle="toggleSection('kb-builder')"
      >
        <NavigationItem
          id="manual-builder"
          icon="fas fa-pencil-alt"
          label="Manual Content Builder"
          description="Create content manually"
          :active="currentRoute === 'manual-builder'"
          :expanded="sidebarExpanded"
          :nested="true"
          @click="navigateTo('manual-builder')"
        />
        <NavigationItem
          id="document-processing"
          icon="fas fa-file-alt"
          label="Document Processing"
          description="Process PDF & Markdown"
          :active="currentRoute === 'document-processing'"
          :expanded="sidebarExpanded"
          :nested="true"
          @click="navigateTo('document-processing')"
        />
      </NavigationSection>

      <!-- Version Control -->
      <NavigationItem
        id="versions"
        icon="fas fa-code-branch"
        label="Version Control"
        description="Manage versions"
        :active="currentRoute === 'versions'"
        :expanded="sidebarExpanded"
        :badge="versionCount"
      />

      <!-- Divider -->
      <div class="nav-divider"></div>

      <!-- Settings (at bottom) -->
      <NavigationItem
        id="settings"
        icon="fas fa-cog"
        label="Settings"
        description="Configure preferences"
        :active="currentRoute === 'settings'"
        :expanded="sidebarExpanded"
        @click="navigateTo('settings')"
      />
    </nav>

    <!-- User Section (Bottom) -->
    <div class="sidebar-footer">
      <transition name="fade">
        <div v-if="sidebarExpanded" class="user-info">
          <div class="user-avatar">
            <i class="fas fa-user-circle"></i>
          </div>
          <div class="user-details">
            <p class="user-name">Enterprise License</p>
            <p class="user-role">Professional</p>
          </div>
        </div>
      </transition>
    </div>

    <!-- Mobile Close Button -->
    <button 
      v-if="mobileMenuOpen"
      @click="closeMobileMenu"
      class="mobile-close-btn"
    >
      <i class="fas fa-times"></i>
    </button>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useVersionStore } from '@/stores/versions'
import NavigationItem from './NavigationItem.vue'
import NavigationSection from './NavigationSection.vue'

const appStore = useAppStore()
const versionStore = useVersionStore()

const sidebarExpanded = computed(() => appStore.sidebarExpanded)
const mobileMenuOpen = computed(() => appStore.mobileMenuOpen)
const currentRoute = computed(() => appStore.currentNavigation)
const versionCount = computed(() => versionStore.versionStats.total)

const toggleSidebar = () => {
  appStore.toggleSidebar()
}

const closeMobileMenu = () => {
  appStore.setMobileMenu(false)
}

const navigateTo = (route: string) => {
  appStore.setCurrentNavigation(route)
  appStore.addToNavigationHistory(route)
  
  // Close mobile menu after navigation
  if (window.innerWidth < 768) {
    appStore.setMobileMenu(false)
  }
}

const toggleSection = (sectionId: string) => {
  appStore.toggleNavigationSection(sectionId)
}
</script>

<style scoped>
/* Enterprise Design System Variables */
:root {
  --sidebar-width-expanded: 320px;
  --sidebar-width-collapsed: 72px;
  --brand-sage: #A8B79D;
  --brand-sage-dark: #8CA085;
  --brand-sage-light: #F5F7F4;
  --brand-gold: #D4AF37;
  --text-primary: #1F2937;
  --text-secondary: #52525B;
  --text-tertiary: #9CA3AF;
  --border-color: #E5E7EB;
  --surface-primary: #FFFFFF;
  --surface-secondary: #F9FAFB;
}

.vertical-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  background: var(--surface-primary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

/* Width States */
.vertical-sidebar.expanded {
  width: var(--sidebar-width-expanded);
}

.vertical-sidebar.collapsed {
  width: var(--sidebar-width-collapsed);
}

/* Mobile Styles */
@media (max-width: 767px) {
  .vertical-sidebar {
    transform: translateX(-100%);
    width: 280px !important;
  }
  
  .vertical-sidebar.mobile-open {
    transform: translateX(0);
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
  }
  
  .desktop-only {
    display: none !important;
  }
}

/* Sidebar Header - Enterprise Design */
.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid var(--border-color);
  position: relative;
  background: linear-gradient(135deg, var(--brand-sage-light, #F5F7F4) 0%, #FFFFFF 100%);
  box-shadow: 0 2px 4px rgba(168, 183, 157, 0.08);
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-container {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--brand-sage, #A8B79D) 0%, var(--brand-sage-dark, #8CA085) 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(168, 183, 157, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  width: 20px;
  height: 20px;
}

.logo-text {
  fill: white;
  font-weight: 700;
  font-size: 10px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.brand-text {
  overflow: hidden;
  line-height: 1.2;
}

.brand-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary, #1F2937);
  margin: 0;
  white-space: nowrap;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #1F2937 0%, var(--brand-sage-dark, #8CA085) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-tagline {
  font-size: 13px;
  color: var(--text-secondary, #6B7280);
  margin: 2px 0 0 0;
  white-space: nowrap;
  font-weight: 500;
  opacity: 0.8;
}

/* Sidebar Toggle - Enhanced Enterprise Style */
.sidebar-toggle {
  position: absolute;
  right: -16px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--surface-primary);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.sidebar-toggle:hover {
  background: var(--brand-sage-light);
  border-color: var(--brand-sage);
  box-shadow: 0 6px 20px rgba(168, 183, 157, 0.15);
  transform: translateY(-50%) scale(1.05);
}

.sidebar-toggle:focus {
  outline: 2px solid var(--brand-sage);
  outline-offset: 2px;
}

.sidebar-toggle i {
  font-size: 12px;
  color: var(--text-secondary);
  transition: color 0.2s;
}

.sidebar-toggle:hover i {
  color: var(--brand-sage-dark);
}

/* Navigation - Professional Styling */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px 0;
}

.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: var(--text-tertiary);
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

.nav-divider {
  height: 1px;
  background: var(--border-color);
  margin: 16px 20px;
  opacity: 0.8;
}

/* Footer - Enterprise Professional */
.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
  background: var(--surface-secondary);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.user-info:hover {
  background: var(--surface-primary);
}

.user-avatar {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--brand-sage) 0%, var(--brand-sage-dark) 100%);
  border-radius: 8px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(168, 183, 157, 0.2);
}

.user-avatar i {
  font-size: 16px;
  color: white;
}

.user-details {
  overflow: hidden;
  line-height: 1.3;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
  white-space: nowrap;
  font-weight: 500;
}

/* Mobile Close Button */
.mobile-close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  border: 1px solid #E5E7EB;
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

@media (max-width: 767px) {
  .mobile-close-btn {
    display: flex;
  }
}

.mobile-close-btn:hover {
  background: #F9FAFB;
}

.mobile-close-btn i {
  font-size: 14px;
  color: #6B7280;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Collapsed State - Professional Spacing */
.collapsed .brand-text,
.collapsed .user-details {
  display: none;
}

.collapsed .sidebar-header {
  padding: 20px 16px;
}

.collapsed .brand-section {
  justify-content: center;
}

.collapsed .nav-divider {
  margin: 16px 12px;
}

.collapsed .sidebar-footer {
  padding: 16px 12px;
}

.collapsed .user-info {
  justify-content: center;
  padding: 8px 4px;
}
</style>