<template>
  <div class="nav-section">
    <button
      @click="toggle"
      class="nav-section-header"
      :class="{ 'active': isOpen }"
    >
      <div class="nav-section-content">
        <div class="nav-icon-wrapper">
          <i :class="icon"></i>
        </div>
        <transition name="fade">
          <span v-if="expanded" class="nav-label">{{ label }}</span>
        </transition>
      </div>
      <transition name="fade">
        <i 
          v-if="expanded"
          :class="['fas fa-chevron-down', 'nav-chevron', { 'rotated': isOpen }]"
        ></i>
      </transition>
    </button>
    
    <transition name="expand">
      <div v-show="isOpen" class="nav-section-items">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  id: string
  icon: string
  label: string
  expanded: boolean
  defaultOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaultOpen: false
})

const emit = defineEmits<{
  toggle: [sectionId: string]
}>()

const isOpen = ref(props.defaultOpen)

const toggle = () => {
  isOpen.value = !isOpen.value
  emit('toggle', props.id)
}

onMounted(() => {
  if (props.defaultOpen) {
    isOpen.value = true
  }
})
</script>

<style scoped>
.nav-section {
  margin-bottom: 4px;
}

.nav-section-header {
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
  border-radius: 12px;
  margin: 3px 8px;
  min-height: 52px;
  border: 1px solid transparent;
}

.nav-section-header:hover {
  background: linear-gradient(135deg, rgba(168, 183, 157, 0.08) 0%, rgba(168, 183, 157, 0.04) 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(168, 183, 157, 0.12);
  border-color: rgba(168, 183, 157, 0.15);
}

.nav-section-header.active {
  background: linear-gradient(135deg, rgba(168, 183, 157, 0.12) 0%, rgba(168, 183, 157, 0.08) 100%);
  box-shadow: 0 2px 8px rgba(168, 183, 157, 0.15);
  border-color: rgba(168, 183, 157, 0.2);
}

.nav-section-content {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.nav-icon-wrapper {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 6px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-icon-wrapper i {
  font-size: 18px;
  color: var(--text-secondary, #6B7280);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 400;
  line-height: 1;
  text-align: center;
  width: 1em;
}

.nav-section-header:hover .nav-icon-wrapper {
  background: rgba(168, 183, 157, 0.1);
  transform: scale(1.05);
}

.nav-section-header:hover .nav-icon-wrapper i {
  color: var(--brand-sage-dark, #8CA085);
  transform: scale(1.1);
}

.nav-section-header.active .nav-icon-wrapper {
  background: rgba(168, 183, 157, 0.15);
}

.nav-section-header.active .nav-icon-wrapper i {
  color: var(--brand-sage-dark, #8CA085);
  font-weight: 600;
}

.nav-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #1F2937);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.nav-chevron {
  font-size: 12px;
  color: var(--text-secondary, #6B7280);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  margin-left: auto;
  padding: 4px;
  border-radius: 4px;
}

.nav-section-header:hover .nav-chevron {
  color: var(--brand-sage-dark, #8CA085);
  background: rgba(168, 183, 157, 0.1);
}

.nav-chevron.rotated {
  transform: rotate(180deg);
}

.nav-section-header.active .nav-chevron {
  color: var(--brand-sage-dark, #8CA085);
  background: rgba(168, 183, 157, 0.15);
}

.nav-section-items {
  overflow: hidden;
  margin-left: 8px;
  padding-left: 8px;
  border-left: 2px solid rgba(168, 183, 157, 0.15);
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

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 500px;
  opacity: 1;
}

/* Collapsed State */
.collapsed .nav-section-header {
  padding: 0.75rem;
}

.collapsed .nav-chevron {
  display: none;
}
</style>