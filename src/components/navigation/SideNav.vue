<template>
  <aside
    :class="[
      'bg-white/90 backdrop-blur sticky top-0 h-screen border-r border-neutral-100',
      isCollapsed ? 'w-[84px]' : 'w-[264px]',
      'transition-[width] duration-200 ease-out'
    ]"
    role="navigation"
    aria-label="Primary navigation"
  >
    <!-- Brand Header & Collapse Toggle -->
    <div class="px-3 pt-3 pb-2 flex items-center justify-between border-b border-neutral-50">
      <div class="flex items-center gap-3">
        <div class="h-9 w-9 rounded-xl bg-brand-sage-700 text-white grid place-items-center text-sm font-bold">
          DL
        </div>
        <transition
          name="label-fade"
          mode="out-in"
        >
          <span v-if="!isCollapsed" class="font-semibold text-neutral-900 text-base">Doc Layer</span>
        </transition>
      </div>
      <button
        class="btn-icon"
        @click="$emit('toggle')"
        :aria-expanded="!isCollapsed"
        :aria-label="isCollapsed ? 'Expand navigation' : 'Collapse navigation'"
      >
        <i :class="isCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'" class="text-sm"></i>
      </button>
    </div>

    <!-- Scrollable Navigation Area -->
    <div class="h-full flex flex-col">
      <div class="flex-1 px-2 py-2 overflow-y-auto custom-scroll">
        <!-- Main Navigation -->
        <NavSection
          label="MAIN"
          :collapsed="isCollapsed"
          :items="primaryItems"
          :active="active"
          @navigate="handleNavigate"
        />

        <!-- Knowledge Base Section -->
        <NavSection
          label="KNOWLEDGE BASE"
          :collapsed="isCollapsed"
          :items="kbItems"
          :active="active"
          @navigate="handleNavigate"
        />

        <!-- Spacer for bottom utilities -->
        <div class="flex-1 min-h-6"></div>
      </div>

      <!-- Bottom Utilities Dock -->
      <div class="px-2 pb-3 border-t border-neutral-50">
        <NavSection
          label="UTILITIES"
          :collapsed="isCollapsed"
          :items="utilityItems"
          :active="active"
          @navigate="handleNavigate"
          :is-bottom-dock="true"
        />
        
        <!-- License Card (only when expanded) -->
        <transition name="license-fade">
          <LicenseCard v-if="!isCollapsed" class="mt-3" />
        </transition>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import NavSection from './NavSection.vue'
import LicenseCard from './LicenseCard.vue'

interface NavItem {
  id: string
  label: string
  icon: string
  to?: string
  badge?: number
  children?: NavItem[]
}

const props = defineProps<{
  isCollapsed: boolean
  active: string
}>()

const emit = defineEmits<{
  toggle: []
  navigate: [id: string]
}>()

// Navigation data with proper hierarchy
const primaryItems = computed<NavItem[]>(() => [
  { 
    id: 'home', 
    label: 'Home', 
    icon: 'fas fa-home', 
    to: '/' 
  }
])

const kbItems = computed<NavItem[]>(() => [
  { 
    id: 'manual-builder', 
    label: 'Manual Builder', 
    icon: 'fas fa-edit', 
    to: '/manual-builder' 
  },
  { 
    id: 'document-processing', 
    label: 'Document Processing', 
    icon: 'fas fa-file-import', 
    to: '/document-processing' 
  },
  { 
    id: 'versions', 
    label: 'Version Control', 
    icon: 'fas fa-code-branch', 
    to: '/versions', 
    badge: 1 
  }
])

const utilityItems = computed<NavItem[]>(() => [
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: 'fas fa-cog', 
    to: '/settings' 
  }
])

const handleNavigate = (id: string) => {
  emit('navigate', id)
}
</script>

<style scoped>
/* CSS tokens for consistent measurements */
:root {
  --nav-h: 46px;
  --nav-r: 12px;
}

/* Button styling for toggle */
.btn-icon {
  @apply h-8 w-8 grid place-items-center rounded-lg text-neutral-600;
  @apply hover:bg-neutral-50 ring-1 ring-transparent hover:ring-neutral-200;
  @apply transition-all duration-150 ease-out;
  @apply focus:outline-none focus:ring-2 focus:ring-brand-gold-600 focus:ring-offset-2;
}

/* Custom scrollbar */
.custom-scroll::-webkit-scrollbar {
  width: 8px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: #e7e7e7;
  border-radius: 8px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: #d1d1d1;
}

/* Label transitions */
.label-fade-enter-active,
.label-fade-leave-active {
  transition: all 0.15s ease-out;
}

.label-fade-enter-from {
  opacity: 0;
  transform: translateX(-8px);
}

.label-fade-leave-to {
  opacity: 0;
  transform: translateX(8px);
}

/* License card transition */
.license-fade-enter-active,
.license-fade-leave-active {
  transition: all 0.2s ease-out;
}

.license-fade-enter-from,
.license-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Font Awesome icon pseudo-elements */
.fas::before { font-style: normal; }
.fa-home::before { content: '🏠'; }
.fa-edit::before { content: '✏️'; }
.fa-file-import::before { content: '📁'; }
.fa-code-branch::before { content: '🌿'; }
.fa-cog::before { content: '⚙️'; }
.fa-chevron-right::before { content: '›'; }
.fa-chevron-left::before { content: '‹'; }
</style>