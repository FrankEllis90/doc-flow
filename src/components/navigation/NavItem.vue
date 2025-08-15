<template>
  <div class="nav-item-wrapper">
    <button
      :class="[
        'nav-item',
        {
          'nav-item--active': active,
          'nav-item--collapsed': collapsed,
          'nav-item--has-badge': item.badge
        }
      ]"
      @click="handleClick"
      :aria-label="collapsed ? item.label : undefined"
      :title="collapsed ? item.label : undefined"
    >
      <!-- Icon -->
      <div class="nav-item__icon">
        <i :class="item.icon" class="text-lg"></i>
      </div>

      <!-- Label & Badge (when expanded) -->
      <transition name="content-fade" mode="out-in">
        <div v-if="!collapsed" class="nav-item__content">
          <span class="nav-item__label">{{ item.label }}</span>
          <span v-if="item.badge" class="nav-item__badge">{{ item.badge }}</span>
        </div>
      </transition>

      <!-- Hover indicator -->
      <div class="nav-item__indicator"></div>
    </button>

    <!-- Tooltip for collapsed state -->
    <transition name="tooltip-fade">
      <div
        v-if="collapsed && showTooltip"
        class="nav-tooltip"
        role="tooltip"
      >
        {{ item.label }}
        <span v-if="item.badge" class="nav-tooltip__badge">{{ item.badge }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface NavItem {
  id: string
  label: string
  icon: string
  to?: string
  badge?: number
  children?: NavItem[]
}

const props = defineProps<{
  item: NavItem
  collapsed: boolean
  active: boolean
}>()

const emit = defineEmits<{
  navigate: [id: string]
}>()

const showTooltip = ref(false)

const handleClick = () => {
  emit('navigate', props.item.id)
}

const handleMouseEnter = () => {
  if (props.collapsed) {
    showTooltip.value = true
  }
}

const handleMouseLeave = () => {
  showTooltip.value = false
}
</script>

<style scoped>
/* CSS tokens for consistent measurements */
:root {
  --nav-item-height: 46px;
  --nav-item-radius: 12px;
  --nav-icon-size: 20px;
}

.nav-item-wrapper {
  @apply relative;
}

.nav-item {
  @apply w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ease-out;
  @apply text-neutral-600 hover:text-neutral-900 hover:bg-white/80;
  @apply focus:outline-none focus:ring-2 focus:ring-brand-gold-600 focus:ring-offset-2;
  @apply relative overflow-hidden;
  height: var(--nav-item-height);
  border-radius: var(--nav-item-radius);
  
  /* Subtle ring for elevated feeling */
  @apply ring-1 ring-transparent hover:ring-neutral-200/50;
}

/* Active state - Strong visual hierarchy */
.nav-item--active {
  @apply bg-gradient-to-r from-brand-sage-700 to-brand-sage-600 text-white;
  @apply shadow-lg;
  box-shadow: 0 4px 12px rgba(115, 138, 108, 0.3);
}

.nav-item--active:hover {
  @apply from-brand-sage-800 to-brand-sage-700;
  transform: none; /* Prevent hover animation on active items */
}

/* Collapsed state adjustments */
.nav-item--collapsed {
  @apply justify-center px-2;
  min-width: 52px; /* Consistent width when collapsed */
}

/* Icon styling */
.nav-item__icon {
  @apply flex items-center justify-center flex-shrink-0;
  width: var(--nav-icon-size);
  height: var(--nav-icon-size);
}

/* Content area (label + badge) */
.nav-item__content {
  @apply flex items-center justify-between flex-1 min-w-0;
}

.nav-item__label {
  @apply font-medium text-sm truncate;
}

/* Badge styling */
.nav-item__badge {
  @apply inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full;
  @apply bg-brand-gold-600 text-white text-xs font-bold;
  @apply flex-shrink-0 ml-2;
}

.nav-item--active .nav-item__badge {
  @apply bg-white text-brand-sage-700;
}

/* Hover indicator */
.nav-item__indicator {
  @apply absolute inset-y-1 left-1 w-1 bg-brand-sage-600 rounded-full;
  @apply transform scale-y-0 origin-center transition-transform duration-200;
}

.nav-item:hover .nav-item__indicator {
  @apply scale-y-100;
}

.nav-item--active .nav-item__indicator {
  @apply scale-y-100 bg-white;
}

/* Hover effects */
.nav-item:hover {
  transform: translateX(2px);
}

.nav-item--collapsed:hover {
  transform: scale(1.05);
}

/* Tooltip for collapsed state */
.nav-tooltip {
  @apply absolute left-full top-1/2 transform -translate-y-1/2 ml-3;
  @apply bg-neutral-800 text-white text-sm font-medium px-3 py-2 rounded-lg;
  @apply shadow-lg z-50 whitespace-nowrap flex items-center gap-2;
  @apply pointer-events-none;
}

.nav-tooltip::before {
  content: '';
  @apply absolute right-full top-1/2 transform -translate-y-1/2;
  @apply border-4 border-transparent border-r-neutral-800;
}

.nav-tooltip__badge {
  @apply inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full;
  @apply bg-brand-gold-600 text-white text-xs font-bold;
}

/* Content fade transitions */
.content-fade-enter-active,
.content-fade-leave-active {
  transition: all 0.15s ease-out;
}

.content-fade-enter-from {
  opacity: 0;
  transform: translateX(-8px);
}

.content-fade-leave-to {
  opacity: 0;
  transform: translateX(8px);
}

/* Tooltip transitions */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: all 0.2s ease-out;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateX(-4px) translateY(-50%);
}

/* Focus states */
.nav-item:focus {
  @apply ring-brand-gold-600;
}

.nav-item--active:focus {
  @apply ring-white ring-offset-brand-sage-700;
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .nav-item,
  .nav-item__indicator,
  .content-fade-enter-active,
  .content-fade-leave-active,
  .tooltip-fade-enter-active,
  .tooltip-fade-leave-active {
    transition: none;
  }
  
  .nav-item:hover {
    transform: none;
  }
}

/* Font Awesome icon pseudo-elements */
.fas::before { font-style: normal; }
.fa-home::before { content: '🏠'; }
.fa-edit::before { content: '✏️'; }
.fa-file-import::before { content: '📁'; }
.fa-code-branch::before { content: '🌿'; }
.fa-cog::before { content: '⚙️'; }
</style>