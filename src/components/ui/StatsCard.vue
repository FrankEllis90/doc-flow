<template>
  <BaseCard 
    variant="default"
    size="md"
    class="stats-card"
    :class="{
      'stats-card--trend-up': trend === 'up',
      'stats-card--trend-down': trend === 'down',
      'stats-card--interactive': interactive
    }"
    :interactive="interactive"
    @click="$emit('click', $event)"
  >
    <div class="stats-card__content">
      <!-- Icon -->
      <div v-if="icon" class="stats-card__icon">
        <i :class="icon"></i>
      </div>

      <!-- Main Stats -->
      <div class="stats-card__main">
        <div v-if="!isEmptyState" class="stats-card__value">{{ formattedValue }}</div>
        <div v-else class="stats-card__empty-state">
          <div class="stats-card__empty-icon">
            <i class="fas fa-plus-circle"></i>
          </div>
          <div class="stats-card__empty-message">{{ emptyStateMessage || 'No data yet' }}</div>
          <button 
            v-if="emptyStateAction" 
            @click="$emit('empty-action')"
            class="stats-card__empty-action"
          >
            {{ emptyStateAction }}
          </button>
        </div>
        <div class="stats-card__label">{{ label }}</div>
      </div>

      <!-- Trend Indicator -->
      <div v-if="trend && change !== undefined" class="stats-card__trend">
        <div class="stats-card__trend-icon">
          <i :class="trendIcon"></i>
        </div>
        <span class="stats-card__change">{{ formattedChange }}</span>
      </div>
    </div>

    <!-- Secondary Stats -->
    <div v-if="secondaryStats?.length" class="stats-card__secondary">
      <div 
        v-for="stat in secondaryStats" 
        :key="stat.label"
        class="stats-card__secondary-item"
      >
        <span class="stats-card__secondary-label">{{ stat.label }}</span>
        <span class="stats-card__secondary-value">{{ stat.value }}</span>
      </div>
    </div>

    <template #footer v-if="$slots.footer">
      <slot name="footer"></slot>
    </template>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseCard from './BaseCard.vue'

interface SecondaryStats {
  label: string
  value: string | number
}

interface Props {
  value: string | number
  label: string
  icon?: string
  trend?: 'up' | 'down' | 'neutral'
  change?: number
  changeLabel?: string
  secondaryStats?: SecondaryStats[]
  interactive?: boolean
  format?: 'number' | 'percentage' | 'currency' | 'bytes'
  emptyStateMessage?: string
  emptyStateAction?: string
}

const props = withDefaults(defineProps<Props>(), {
  format: 'number',
  interactive: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
  'empty-action': []
}>()

const isEmptyState = computed(() => {
  const val = props.value
  return val === 0 || val === '' || val === null || val === undefined
})

const formattedValue = computed(() => {
  const val = props.value
  
  if (typeof val === 'string') {
    return val
  }
  
  switch (props.format) {
    case 'percentage':
      return `${val}%`
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(val)
    case 'bytes':
      return formatBytes(val)
    case 'number':
    default:
      return new Intl.NumberFormat('en-US').format(val)
  }
})

const formattedChange = computed(() => {
  if (props.change === undefined) return ''
  
  const prefix = props.change > 0 ? '+' : ''
  const suffix = props.changeLabel || '%'
  
  return `${prefix}${props.change}${suffix}`
})

const trendIcon = computed(() => {
  switch (props.trend) {
    case 'up':
      return 'fas fa-arrow-up'
    case 'down':
      return 'fas fa-arrow-down'
    default:
      return 'fas fa-minus'
  }
})

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.stats-card {
  background: linear-gradient(135deg, var(--surface-primary, #FFFFFF) 0%, var(--brand-sage-light, #F5F7F4) 100%);
  border: 1px solid var(--border-color, #E5E7EB);
  border-radius: 16px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
}

.stats-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--brand-sage, #A8B79D) 0%, rgba(168, 183, 157, 0.2) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stats-card:hover {
  box-shadow: 0 8px 24px rgba(168, 183, 157, 0.15);
  border-color: rgba(168, 183, 157, 0.3);
  transform: translateY(-2px);
}

.stats-card:hover::before {
  opacity: 1;
}

.stats-card--interactive {
  cursor: pointer;
}

.stats-card--interactive:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: var(--brand-sage, #A8B79D);
}

.stats-card--trend-up {
  border-left: 4px solid var(--color-success-600, #059669);
}

.stats-card--trend-down {
  border-left: 4px solid var(--color-error-600, #DC2626);
}

.stats-card__content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.stats-card__icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--brand-sage, #A8B79D) 0%, var(--brand-sage-dark, #8CA085) 100%);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(168, 183, 157, 0.3);
}

.stats-card__icon i {
  font-size: 24px;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stats-card__main {
  flex: 1;
  min-width: 0;
}

.stats-card__value {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-primary, #1F2937);
  line-height: 1.2;
  margin-bottom: 4px;
  letter-spacing: -0.02em;
}

.stats-card__label {
  font-size: 14px;
  color: var(--text-secondary, #6B7280);
  font-weight: 500;
  line-height: 1.3;
}

.stats-card__empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  text-align: center;
}

.stats-card__empty-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(168, 183, 157, 0.1);
  border-radius: 50%;
  color: var(--brand-sage, #A8B79D);
  margin-bottom: 4px;
}

.stats-card__empty-icon i {
  font-size: 16px;
}

.stats-card__empty-message {
  font-size: 14px;
  color: var(--text-secondary, #6B7280);
  font-weight: 500;
  line-height: 1.3;
  max-width: 160px;
}

.stats-card__empty-action {
  background: var(--brand-sage, #A8B79D);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 4px;
}

.stats-card__empty-action:hover {
  background: var(--brand-sage-dark, #8CA085);
  transform: translateY(-1px);
}

.stats-card__trend {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.stats-card__trend-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 12px;
}

.stats-card--trend-up .stats-card__trend-icon {
  background: var(--color-success-100, #C8E6C8);
  color: var(--color-success-700, #388E3C);
}

.stats-card--trend-down .stats-card__trend-icon {
  background: var(--color-error-100, #FFCDD2);
  color: var(--color-error-700, #D32F2F);
}

.stats-card__change {
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
}

.stats-card--trend-up .stats-card__change {
  color: var(--color-success-700, #388E3C);
}

.stats-card--trend-down .stats-card__change {
  color: var(--color-error-700, #D32F2F);
}

.stats-card__secondary {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color, #E5E7EB);
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.stats-card__secondary-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 80px;
}

.stats-card__secondary-label {
  font-size: 12px;
  color: var(--text-secondary, #6B7280);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stats-card__secondary-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #1F2937);
  line-height: 1.2;
}

/* Compact Variant */
.stats-card--compact .stats-card__content {
  gap: 12px;
}

.stats-card--compact .stats-card__icon {
  width: 40px;
  height: 40px;
}

.stats-card--compact .stats-card__icon i {
  font-size: 18px;
}

.stats-card--compact .stats-card__value {
  font-size: 24px;
}

.stats-card--compact .stats-card__label {
  font-size: 13px;
}

/* Loading State */
.stats-card--loading {
  opacity: 0.6;
  pointer-events: none;
}

.stats-card--loading .stats-card__value {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  color: transparent;
  border-radius: 4px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .stats-card__content {
    gap: 12px;
  }
  
  .stats-card__icon {
    width: 40px;
    height: 40px;
  }
  
  .stats-card__icon i {
    font-size: 18px;
  }
  
  .stats-card__value {
    font-size: 24px;
  }
  
  .stats-card__secondary {
    gap: 12px;
  }
  
  .stats-card__secondary-item {
    min-width: 60px;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .stats-card {
    border-width: 2px;
  }
  
  .stats-card__value {
    font-weight: 800;
  }
  
  .stats-card__label {
    font-weight: 600;
  }
}
</style>