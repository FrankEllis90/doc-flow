<template>
  <div 
    :class="[
      'base-card',
      `base-card--${variant}`,
      `base-card--${size}`,
      {
        'base-card--elevated': elevated,
        'base-card--interactive': interactive,
        'base-card--selected': selected
      }
    ]"
    @click="handleClick"
  >
    <!-- Header Section -->
    <header v-if="$slots.header || title || subtitle" class="base-card__header">
      <slot name="header">
        <div v-if="title || subtitle" class="base-card__title-section">
          <h3 v-if="title" class="base-card__title">{{ title }}</h3>
          <p v-if="subtitle" class="base-card__subtitle">{{ subtitle }}</p>
        </div>
      </slot>
      <div v-if="$slots.actions" class="base-card__actions">
        <slot name="actions"></slot>
      </div>
    </header>

    <!-- Main Content -->
    <main class="base-card__content">
      <slot></slot>
    </main>

    <!-- Footer Section -->
    <footer v-if="$slots.footer" class="base-card__footer">
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'default' | 'elevated' | 'outlined' | 'minimal'
  size?: 'sm' | 'md' | 'lg'
  title?: string
  subtitle?: string
  elevated?: boolean
  interactive?: boolean
  selected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  elevated: false,
  interactive: false,
  selected: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (props.interactive) {
    emit('click', event)
  }
}
</script>

<style scoped>
/* Base Card Design System - Enterprise Standard */
.base-card {
  background: var(--surface-primary, #FFFFFF);
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

/* Variants */
.base-card--default {
  border: 1px solid var(--border-color, #E5E7EB);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.base-card--elevated {
  background: linear-gradient(135deg, var(--surface-primary, #FFFFFF) 0%, var(--brand-sage-light, #F5F7F4) 100%);
  border: 1px solid rgba(168, 183, 157, 0.15);
  box-shadow: 0 8px 24px rgba(168, 183, 157, 0.12);
}

.base-card--outlined {
  border: 2px solid var(--border-color, #E5E7EB);
  box-shadow: none;
}

.base-card--minimal {
  border: none;
  box-shadow: none;
  background: transparent;
}

/* Sizes */
.base-card--sm {
  padding: 16px;
}

.base-card--md {
  padding: 24px;
}

.base-card--lg {
  padding: 32px;
}

/* Interactive States */
.base-card--interactive {
  cursor: pointer;
}

.base-card--interactive:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(168, 183, 157, 0.16);
  border-color: var(--brand-sage, #A8B79D);
}

.base-card--interactive:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.base-card--selected {
  border-color: var(--brand-sage, #A8B79D);
  box-shadow: 0 0 0 2px rgba(168, 183, 157, 0.2);
  background: var(--brand-sage-light, #F5F7F4);
}

/* Focus States */
.base-card--interactive:focus-visible {
  outline: 2px solid var(--brand-sage, #A8B79D);
  outline-offset: 2px;
}

/* Header */
.base-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 16px;
}

.base-card__title-section {
  flex: 1;
  min-width: 0;
}

.base-card__title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #1F2937);
  margin: 0 0 4px 0;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.base-card__subtitle {
  font-size: 14px;
  color: var(--text-secondary, #6B7280);
  margin: 0;
  line-height: 1.4;
}

.base-card__actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Content */
.base-card__content {
  color: var(--text-primary, #1F2937);
  line-height: 1.5;
}

/* Footer */
.base-card__footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color, #E5E7EB);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

/* Specialized Card Types */

/* Settings Card */
.base-card--settings {
  background: var(--surface-primary, #FFFFFF);
  border: 1px solid var(--border-color, #E5E7EB);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.base-card--settings:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-color: rgba(168, 183, 157, 0.3);
}

/* Feature Card */
.base-card--feature {
  background: linear-gradient(135deg, var(--surface-primary, #FFFFFF) 0%, var(--brand-sage-light, #F5F7F4) 100%);
  border: 1px solid var(--border-color, #E5E7EB);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.base-card--feature:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(168, 183, 157, 0.15);
  border-color: var(--brand-sage, #A8B79D);
}

/* Stats Card */
.base-card--stats {
  background: var(--surface-primary, #FFFFFF);
  border: 1px solid var(--border-color, #E5E7EB);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  text-align: center;
}

.base-card--stats .base-card__title {
  font-size: 24px;
  font-weight: 700;
  color: var(--brand-sage-dark, #8CA085);
  margin-bottom: 4px;
}

.base-card--stats .base-card__subtitle {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
  color: var(--text-secondary, #6B7280);
}

/* Alert Cards */
.base-card--success {
  border-left: 4px solid var(--color-success-600, #059669);
  background: var(--color-success-50, #E8F5E8);
}

.base-card--warning {
  border-left: 4px solid var(--color-warning-600, #D97706);
  background: var(--color-warning-50, #FFF3E0);
}

.base-card--error {
  border-left: 4px solid var(--color-error-600, #DC2626);
  background: var(--color-error-50, #FFEBEE);
}

.base-card--info {
  border-left: 4px solid var(--color-info-600, #2563EB);
  background: var(--color-info-50, #EFF6FF);
}

/* Responsive */
@media (max-width: 768px) {
  .base-card--lg {
    padding: 24px;
  }
  
  .base-card--md {
    padding: 20px;
  }
  
  .base-card__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .base-card__actions {
    width: 100%;
    justify-content: flex-end;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .base-card {
    border-width: 2px;
  }
  
  .base-card--outlined {
    border-width: 3px;
  }
  
  .base-card__title {
    font-weight: 700;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .base-card {
    transition: none;
  }
  
  .base-card--interactive:hover {
    transform: none;
  }
}
</style>