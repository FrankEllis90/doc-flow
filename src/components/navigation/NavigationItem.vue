<template>
  <button
    @click="handleClick"
    class="nav-item"
    :class="{ 
      'active': active,
      'nested': nested,
      'collapsed': !expanded
    }"
    :title="!expanded ? label : undefined"
  >
    <div class="nav-item-content">
      <div class="nav-icon-wrapper">
        <i :class="icon"></i>
      </div>
      <transition name="fade">
        <div v-if="expanded" class="nav-text">
          <span class="nav-label">{{ label }}</span>
          <span v-if="description && !nested" class="nav-description">{{ description }}</span>
        </div>
      </transition>
    </div>
    
    <!-- Badge -->
    <transition name="fade">
      <span 
        v-if="badge && badge > 0 && expanded" 
        class="nav-badge"
        :class="{ 'pulse': badge > previousBadge }"
      >
        {{ badge }}
      </span>
    </transition>
    
    <!-- Tooltip for collapsed state -->
    <div v-if="!expanded" class="nav-tooltip">
      <span>{{ label }}</span>
    </div>
  </button>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  id: string
  icon: string
  label: string
  description?: string
  active?: boolean
  expanded?: boolean
  nested?: boolean
  badge?: number
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  expanded: true,
  nested: false,
  badge: 0
})

const emit = defineEmits<{
  click: [id: string]
}>()

const previousBadge = ref(props.badge)

watch(() => props.badge, (newVal, oldVal) => {
  if (newVal && oldVal) {
    previousBadge.value = oldVal
  }
})

const handleClick = () => {
  emit('click', props.id)
}
</script>

<style scoped>
/* Use CSS Variables for consistency with VerticalSidebar */
.nav-item {
  width: calc(100% - 16px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  margin: 3px 8px;
  min-height: 52px;
  border: 1px solid transparent;
}

.nav-item.nested {
  padding-left: 52px;
  margin-left: 16px;
  margin-right: 8px;
}

.nav-item.collapsed {
  padding: 12px;
  margin: 4px 8px;
  justify-content: center;
}

.nav-item.collapsed.nested {
  padding-left: 12px;
  margin-left: 8px;
}

.nav-item:hover {
  background: linear-gradient(135deg, rgba(168, 183, 157, 0.1) 0%, rgba(168, 183, 157, 0.05) 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(168, 183, 157, 0.15);
  border-color: rgba(168, 183, 157, 0.2);
}

.nav-item:focus {
  outline: 2px solid var(--brand-sage, #A8B79D);
  outline-offset: 2px;
  background: rgba(168, 183, 157, 0.05);
}

.nav-item.active {
  background: linear-gradient(90deg, #F5F7F4 0%, rgba(168, 183, 157, 0.25) 100%);
  box-shadow: 0 8px 32px rgba(168, 183, 157, 0.4);
  transform: translateX(4px);
  border-left: 6px solid #E6B800;
  border-color: rgba(168, 183, 157, 0.4);
  position: relative;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 32px;
  background: linear-gradient(180deg, #E6B800 0%, #CC9F00 100%);
  border-radius: 0 6px 6px 0;
  box-shadow: 0 4px 16px rgba(230, 184, 0, 0.6);
}


.nav-item-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.nav-icon-wrapper {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  border-radius: 6px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-icon-wrapper i {
  font-size: 18px;
  color: var(--text-secondary, #52525B);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 400;
  line-height: 1;
  text-align: center;
  width: 1em;
}

.nav-item:hover .nav-icon-wrapper {
  background: rgba(168, 183, 157, 0.1);
  transform: scale(1.05);
}

.nav-item:hover .nav-icon-wrapper i {
  color: var(--brand-sage-dark, #8CA085);
  transform: scale(1.1);
}

.nav-item.active .nav-icon-wrapper {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.nav-item.active .nav-icon-wrapper i {
  color: var(--brand-sage-dark, #8CA085);
  font-weight: 600;
}

.nav-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  overflow: hidden;
  flex: 1;
  line-height: 1.3;
}

.nav-label {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary, #1F2937);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
  transition: all 0.2s;
  line-height: 1.3;
}

.nav-item:hover .nav-label {
  color: #0F172A;
}

.nav-item.active .nav-label {
  color: var(--brand-sage-dark, #8CA085);
  font-weight: 600;
}

.nav-description {
  font-size: 12px;
  color: var(--text-secondary, #52525B);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
  font-weight: 400;
  transition: color 0.2s;
  opacity: 0.8;
  line-height: 1.2;
}

.nav-item:hover .nav-description {
  color: #4B5563;
}

.nav-item.active .nav-description {
  color: rgba(140, 160, 133, 0.8);
}

/* Badge - Enhanced Enterprise Style */
.nav-badge {
  background: var(--brand-gold, #D4AF37);
  color: var(--color-neutral-900, #1F2937);
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 10px;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  animation: none;
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
  border: 2px solid var(--surface-primary, #FFFFFF);
}

.nav-badge.pulse {
  animation: pulse 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
    box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
  }
  100% {
    transform: scale(1);
  }
}

/* Tooltip - Professional Style */
.nav-tooltip {
  position: absolute;
  left: calc(100% + 12px);
  top: 50%;
  transform: translateY(-50%);
  background: #1F2937;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(8px);
}

.nav-tooltip::before {
  content: '';
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-right-color: #1F2937;
}

.nav-item.collapsed:hover .nav-tooltip {
  opacity: 1;
  transform: translateY(-50%) translateX(4px);
}

/* Animations - Smooth Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

/* Focus and Accessibility */
.nav-item:focus-visible {
  outline: 2px solid #A8B79D;
  outline-offset: 2px;
  background: rgba(168, 183, 157, 0.05);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .nav-item {
    border: 1px solid transparent;
  }
  
  .nav-item:hover {
    border-color: #8CA085;
  }
  
  .nav-item.active {
    border-color: #A8B79D;
  }
}

/* Nested Item Specific Styles - Enhanced */
.nav-item.nested .nav-label {
  font-size: 13px;
  font-weight: 500;
}

.nav-item.nested::after {
  content: '';
  position: absolute;
  left: 32px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 2px;
  background: #D1D5DB;
  border-radius: 1px;
  transition: all 0.2s;
}

.nav-item.nested:hover::after {
  background: #8CA085;
  width: 8px;
}

.nav-item.nested.active::after {
  background: #D4AF37;
  width: 10px;
  height: 3px;
  box-shadow: 0 1px 3px rgba(212, 175, 55, 0.3);
}

.nav-item.nested.active::before {
  left: 0;
  width: 3px;
  height: 20px;
  background: #D4AF37;
  border-radius: 0 2px 2px 0;
}
</style>