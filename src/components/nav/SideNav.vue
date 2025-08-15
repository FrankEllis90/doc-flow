<template>
  <aside
    role="navigation"
    aria-label="Primary"
    :class="[
      'bg-white/90 backdrop-blur sticky top-0 h-screen border-r border-neutral-100',
      isCollapsed ? 'w-[84px]' : 'w-[224px]',
      'transition-[width] duration-200 ease-out'
    ]"
  >
    <!-- Brand / Collapse -->
    <div class="px-3 pt-6 pb-2 flex items-center justify-between">
      <button @click="navigateToHome" class="flex items-center gap-3 cursor-pointer">
        <div class="h-9 w-9 rounded-xl bg-brand-sage-700 text-white grid place-items-center text-sm font-bold">DL</div>
        <span v-if="!isCollapsed" class="font-semibold text-neutral-900">Doc Layer</span>
      </button>

      <button
        class="btn-icon"
        @click="$emit('toggle')"
        :aria-expanded="!isCollapsed"
        :aria-label="isCollapsed ? 'Expand navigation' : 'Collapse navigation'"
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path :d="isCollapsed ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'" />
        </svg>
      </button>
    </div>

    <!-- Scrollable list -->
    <div class="px-2 pb-2 overflow-y-auto custom-scroll">
      <!-- MAIN Section -->
      <div class="mt-2">
        <p v-if="!isCollapsed" class="px-3 py-1 text-[11px] font-medium tracking-wide text-neutral-500">MAIN</p>
        <ul role="list" class="space-y-1">
          <li>
            <button 
              @click="handleItemClick('home')" 
              :class="['nav-row group w-full text-left', active === 'home' ? 'nav-active' : 'hover:nav-hover focus:nav-focus']"
            >
              <svg class="nav-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5Z" />
              </svg>
              <span v-if="!isCollapsed" class="nav-label">Home</span>
              <span v-if="isCollapsed" class="tooltip">Home</span>
            </button>
          </li>
        </ul>
      </div>

      <!-- KNOWLEDGE BASE Section -->
      <div class="mt-2">
        <p v-if="!isCollapsed" class="px-3 py-1 text-[11px] font-medium tracking-wide text-neutral-500">KNOWLEDGE BASE</p>
        <ul role="list" class="space-y-1">
          <li>
            <button 
              @click="handleItemClick('manual')" 
              :class="['nav-row group w-full text-left', active === 'manual' ? 'nav-active' : 'hover:nav-hover focus:nav-focus']"
            >
              <svg class="nav-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 20l6-1.5L20 8l-3-3L7 15l-1.5 6Z M14 6l3 3" />
              </svg>
              <span v-if="!isCollapsed" class="nav-label">Manual Content Builder</span>
              <span v-if="isCollapsed" class="tooltip">Manual Content Builder</span>
            </button>
          </li>
          <li>
            <button 
              @click="handleItemClick('process')" 
              :class="['nav-row group w-full text-left', active === 'process' ? 'nav-active' : 'hover:nav-hover focus:nav-focus']"
            >
              <svg class="nav-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5Zm1 14a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-3-2v2" />
              </svg>
              <span v-if="!isCollapsed" class="nav-label">Document Processing</span>
              <span v-if="isCollapsed" class="tooltip">Document Processing</span>
            </button>
          </li>
          <li>
            <button 
              @click="handleItemClick('versions')" 
              :class="['nav-row group w-full text-left', active === 'versions' ? 'nav-active' : 'hover:nav-hover focus:nav-focus']"
            >
              <svg class="nav-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 3v12a3 3 0 1 0 2 2h4a4 4 0 0 0 4-4V7 M6 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
              </svg>
              <span v-if="!isCollapsed" class="nav-label">Version Control</span>
              <span v-if="!isCollapsed" class="badge">1</span>
              <span v-if="isCollapsed" class="dot" aria-label="Notifications"></span>
              <span v-if="isCollapsed" class="tooltip">Version Control</span>
            </button>
          </li>
        </ul>
      </div>

      <div class="h-4"></div>

      <!-- UTILITIES Section -->
      <div class="mt-2">
        <p v-if="!isCollapsed" class="px-3 py-1 text-[11px] font-medium tracking-wide text-neutral-500">UTILITIES</p>
        <ul role="list" class="space-y-1">
          <li>
            <button 
              @click="handleItemClick('settings')" 
              :class="['nav-row group w-full text-left', active === 'settings' ? 'nav-active' : 'hover:nav-hover focus:nav-focus']"
            >
              <svg class="nav-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm7 4l1.8-.6-1-3-1.9.6a6.8 6.8 0 0 0-1.6-1l.3-2h-3l-.3 2a7 7 0 0 0-1.6 1l-1.9-.6-1 3 1.8.6a6.9 6.9 0 0 0 0 2l-1.8.6 1 3 1.9-.6a7 7 0 0 0 1.6 1l.3 2h3l.3-2a6.8 6.8 0 0 0 1.6-1l1.9.6 1-3-1.8-.6a6.9 6.9 0 0 0 0-2Z" />
              </svg>
              <span v-if="!isCollapsed" class="nav-label">Settings</span>
              <span v-if="isCollapsed" class="tooltip">Settings</span>
            </button>
          </li>
        </ul>
      </div>

      <!-- License Card (only when expanded) -->
      <div v-if="!isCollapsed" class="rounded-xl border border-neutral-100 bg-neutral-50/60 p-3 mt-2">
        <div class="flex items-center gap-2">
          <div class="h-7 w-7 rounded-lg bg-brand-sage-700 text-white grid place-items-center text-[11px]">E</div>
          <div>
            <p class="text-[13px] font-medium text-neutral-800">Enterprise License</p>
            <p class="text-[12px] text-neutral-500">Professional</p>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app'

defineProps<{
  isCollapsed: boolean
  active: string // active item id (e.g., 'home', 'manual', etc.)
}>()
defineEmits<{(e:'toggle'): void}>()

// Store for navigation
const appStore = useAppStore()

// Navigation handlers
const navigateToHome = () => {
  appStore.setCurrentNavigation('home')
}

const handleItemClick = (itemId: string) => {
  // Map item IDs to navigation routes
  const navMap: Record<string, string> = {
    'home': 'home',
    'manual': 'manual-builder',
    'process': 'document-processing', 
    'versions': 'versions',
    'settings': 'settings'
  }
  
  const nav = navMap[itemId] || 'home'
  appStore.setCurrentNavigation(nav)
}
</script>

<style scoped>
/* Tokens */
:root {
  --nav-h: 46px;
}

/* Anatomy */
.nav-row {
  @apply relative flex items-center gap-3 h-[var(--nav-h)]
  rounded-xl px-3 text-[15px] text-neutral-800
  transition-all duration-150 ease-out;
}
.nav-ico    { @apply w-5 h-5 text-neutral-600; }
.nav-label  { @apply truncate; }
.badge      { @apply ml-auto inline-flex items-center justify-center rounded-full bg-brand-gold-600 text-white text-[11px] h-5 min-w-[20px] px-1; }
.dot        { @apply ml-auto h-2 w-2 rounded-full bg-brand-gold-600; }

/* States */
.nav-active {
  @apply bg-brand-sage/15 ring-1 ring-brand-sage/40 text-brand-ink;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.02);
}
.nav-active .nav-ico { @apply text-brand-ink; }

.nav-hover  { @apply bg-neutral-50 ring-1 ring-neutral-200; }
.nav-focus  { @apply outline-none ring-2 ring-offset-2 ring-brand-gold-600; }

/* Collapsed tooltips */
.tooltip {
  @apply pointer-events-none absolute left-[74px] z-50 rounded-md bg-neutral-900 text-white
  text-[12px] px-2 py-[3px] opacity-0 translate-x-[-6px]
  transition-all duration-150;
}
.nav-row:hover .tooltip,
.nav-row:focus .tooltip { @apply opacity-100 translate-x-0; }

/* Buttons */
.btn-icon { @apply h-8 w-8 grid place-items-center rounded-lg hover:bg-neutral-50 ring-1 ring-transparent hover:ring-neutral-200; }

/* Scrollbar */
.custom-scroll::-webkit-scrollbar { width: 8px; }
.custom-scroll::-webkit-scrollbar-thumb { background: #e7e7e7; border-radius: 8px; }
</style>