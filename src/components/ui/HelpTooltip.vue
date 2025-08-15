<template>
  <div class="help-tooltip" :class="{ 'help-tooltip--active': isVisible }">
    <button
      @mouseenter="showTooltip"
      @mouseleave="hideTooltip"
      @focus="showTooltip"
      @blur="hideTooltip"
      @click.prevent="toggleTooltip"
      class="help-tooltip__trigger"
      :aria-describedby="tooltipId"
      :aria-expanded="isVisible"
      type="button"
    >
      <i :class="icon"></i>
    </button>
    
    <Transition name="tooltip">
      <div
        v-if="isVisible"
        :id="tooltipId"
        class="help-tooltip__content"
        :class="[
          `help-tooltip__content--${position}`,
          `help-tooltip__content--${theme}`
        ]"
        role="tooltip"
        :aria-live="polite ? 'polite' : 'off'"
      >
        <div class="help-tooltip__header" v-if="title">
          <h4 class="help-tooltip__title">{{ title }}</h4>
        </div>
        
        <div class="help-tooltip__body">
          <div v-if="$slots.default" class="help-tooltip__custom">
            <slot></slot>
          </div>
          <p v-else class="help-tooltip__text">{{ content }}</p>
        </div>
        
        <div v-if="showLearnMore && learnMoreUrl" class="help-tooltip__footer">
          <a 
            :href="learnMoreUrl" 
            target="_blank" 
            rel="noopener noreferrer"
            class="help-tooltip__learn-more"
          >
            Learn more
            <i class="fas fa-external-link-alt"></i>
          </a>
        </div>
        
        <div class="help-tooltip__arrow"></div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  content?: string
  title?: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'
  theme?: 'default' | 'dark' | 'brand'
  icon?: string
  trigger?: 'hover' | 'click' | 'both'
  delay?: number
  showLearnMore?: boolean
  learnMoreUrl?: string
  polite?: boolean
  maxWidth?: string
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top',
  theme: 'default',
  icon: 'fas fa-question-circle',
  trigger: 'hover',
  delay: 300,
  showLearnMore: false,
  polite: true,
  maxWidth: '280px'
})

const isVisible = ref(false)
let showTimeout: number | null = null
let hideTimeout: number | null = null

const tooltipId = computed(() => `tooltip-${Math.random().toString(36).substr(2, 9)}`)

const showTooltip = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
  
  if (props.trigger === 'hover' || props.trigger === 'both') {
    showTimeout = window.setTimeout(() => {
      isVisible.value = true
    }, props.delay)
  }
}

const hideTooltip = () => {
  if (showTimeout) {
    clearTimeout(showTimeout)
    showTimeout = null
  }
  
  if (props.trigger === 'hover' || props.trigger === 'both') {
    hideTimeout = window.setTimeout(() => {
      isVisible.value = false
    }, 100)
  }
}

const toggleTooltip = () => {
  if (props.trigger === 'click' || props.trigger === 'both') {
    isVisible.value = !isVisible.value
  }
}

// Clean up timeouts
const cleanup = () => {
  if (showTimeout) clearTimeout(showTimeout)
  if (hideTimeout) clearTimeout(hideTimeout)
}

// Cleanup on component unmount
import { onUnmounted } from 'vue'
onUnmounted(cleanup)
</script>

<style scoped>
.help-tooltip {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.help-tooltip__trigger {
  background: none;
  border: none;
  padding: 4px;
  cursor: help;
  border-radius: 50%;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: var(--text-secondary, #6B7280);
}

.help-tooltip__trigger:hover {
  background: rgba(168, 183, 157, 0.1);
  color: var(--brand-sage-dark, #8CA085);
  transform: scale(1.1);
}

.help-tooltip__trigger:focus {
  outline: 2px solid var(--brand-sage, #A8B79D);
  outline-offset: 2px;
  background: rgba(168, 183, 157, 0.1);
}

.help-tooltip__trigger i {
  font-size: 14px;
  line-height: 1;
}

.help-tooltip__content {
  position: absolute;
  z-index: 1000;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.4;
  max-width: v-bind(maxWidth);
  word-wrap: break-word;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Theme Variants */
.help-tooltip__content--default {
  background: var(--surface-primary, #FFFFFF);
  color: var(--text-primary, #1F2937);
  border-color: var(--border-color, #E5E7EB);
}

.help-tooltip__content--dark {
  background: #1F2937;
  color: #FFFFFF;
  border-color: #374151;
}

.help-tooltip__content--brand {
  background: linear-gradient(135deg, var(--brand-sage-light, #F5F7F4) 0%, var(--surface-primary, #FFFFFF) 100%);
  color: var(--text-primary, #1F2937);
  border-color: rgba(168, 183, 157, 0.2);
}

/* Position Variants */
.help-tooltip__content--top {
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}

.help-tooltip__content--bottom {
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}

.help-tooltip__content--left {
  right: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
}

.help-tooltip__content--right {
  left: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
}

.help-tooltip__content--top-start {
  bottom: calc(100% + 8px);
  left: 0;
}

.help-tooltip__content--top-end {
  bottom: calc(100% + 8px);
  right: 0;
}

.help-tooltip__content--bottom-start {
  top: calc(100% + 8px);
  left: 0;
}

.help-tooltip__content--bottom-end {
  top: calc(100% + 8px);
  right: 0;
}

/* Arrow */
.help-tooltip__arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  background: inherit;
  border: inherit;
  border-width: 1px;
  transform: rotate(45deg);
}

.help-tooltip__content--top .help-tooltip__arrow {
  top: 100%;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  border-top: none;
  border-left: none;
}

.help-tooltip__content--bottom .help-tooltip__arrow {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  border-bottom: none;
  border-right: none;
}

.help-tooltip__content--left .help-tooltip__arrow {
  left: 100%;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  border-left: none;
  border-bottom: none;
}

.help-tooltip__content--right .help-tooltip__arrow {
  right: 100%;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  border-right: none;
  border-top: none;
}

.help-tooltip__content--top-start .help-tooltip__arrow,
.help-tooltip__content--top-end .help-tooltip__arrow {
  top: 100%;
  left: 16px;
  transform: rotate(45deg);
  border-top: none;
  border-left: none;
}

.help-tooltip__content--bottom-start .help-tooltip__arrow,
.help-tooltip__content--bottom-end .help-tooltip__arrow {
  bottom: 100%;
  left: 16px;
  transform: rotate(45deg);
  border-bottom: none;
  border-right: none;
}

.help-tooltip__header {
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.help-tooltip__content--dark .help-tooltip__header {
  border-bottom-color: rgba(255, 255, 255, 0.2);
}

.help-tooltip__title {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: inherit;
  line-height: 1.3;
}

.help-tooltip__body {
  color: inherit;
}

.help-tooltip__text {
  margin: 0;
  color: inherit;
}

.help-tooltip__custom {
  color: inherit;
}

.help-tooltip__footer {
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.help-tooltip__content--dark .help-tooltip__footer {
  border-top-color: rgba(255, 255, 255, 0.2);
}

.help-tooltip__learn-more {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--brand-sage-dark, #8CA085);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.help-tooltip__learn-more:hover {
  color: var(--brand-sage, #A8B79D);
  text-decoration: underline;
}

.help-tooltip__learn-more i {
  font-size: 10px;
}

/* Transitions */
.tooltip-enter-active,
.tooltip-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.tooltip-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-4px) scale(0.95);
}

.tooltip-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-4px) scale(0.95);
}

.tooltip-enter-from.help-tooltip__content--bottom,
.tooltip-leave-to.help-tooltip__content--bottom {
  transform: translateX(-50%) translateY(4px) scale(0.95);
}

.tooltip-enter-from.help-tooltip__content--left,
.tooltip-leave-to.help-tooltip__content--left {
  transform: translateY(-50%) translateX(-4px) scale(0.95);
}

.tooltip-enter-from.help-tooltip__content--right,
.tooltip-leave-to.help-tooltip__content--right {
  transform: translateY(-50%) translateX(4px) scale(0.95);
}

/* Responsive */
@media (max-width: 768px) {
  .help-tooltip__content {
    max-width: 240px;
    font-size: 12px;
    padding: 10px 12px;
  }
  
  .help-tooltip__title {
    font-size: 13px;
  }
  
  .help-tooltip__learn-more {
    font-size: 11px;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .help-tooltip__content {
    border-width: 2px;
  }
  
  .help-tooltip__trigger {
    border: 1px solid transparent;
  }
  
  .help-tooltip__trigger:hover {
    border-color: var(--brand-sage, #A8B79D);
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .help-tooltip__trigger {
    transition: none;
  }
  
  .help-tooltip__trigger:hover {
    transform: none;
  }
  
  .tooltip-enter-active,
  .tooltip-leave-active {
    transition: opacity 0.1s;
  }
  
  .tooltip-enter-from,
  .tooltip-leave-to {
    transform: none;
  }
}
</style>