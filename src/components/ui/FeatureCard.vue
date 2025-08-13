<template>
  <BaseCard 
    variant="elevated"
    size="lg"
    class="feature-card"
    :class="{
      'feature-card--highlighted': highlighted,
      'feature-card--interactive': interactive
    }"
    :interactive="interactive"
    @click="$emit('click', $event)"
  >
    <div class="feature-card__content">
      <!-- Icon -->
      <div class="feature-card__icon">
        <i :class="icon"></i>
      </div>

      <!-- Content -->
      <div class="feature-card__body">
        <h3 class="feature-card__title">{{ title }}</h3>
        <p class="feature-card__description">{{ description }}</p>
        
        <!-- Features List -->
        <ul v-if="features?.length" class="feature-card__features">
          <li v-for="feature in features" :key="feature" class="feature-card__feature">
            <i class="fas fa-check"></i>
            <span>{{ feature }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Action Button -->
    <template #footer v-if="actionText || $slots.action">
      <div class="feature-card__footer">
        <slot name="action">
          <button 
            v-if="actionText"
            class="feature-card__action"
            @click="$emit('action', $event)"
          >
            {{ actionText }}
            <i class="fas fa-arrow-right"></i>
          </button>
        </slot>
      </div>
    </template>
  </BaseCard>
</template>

<script setup lang="ts">
import BaseCard from './BaseCard.vue'

interface Props {
  title: string
  description: string
  icon: string
  features?: string[]
  actionText?: string
  interactive?: boolean
  highlighted?: boolean
}

defineProps<Props>()

defineEmits<{
  click: [event: MouseEvent]
  action: [event: MouseEvent]
}>()
</script>

<style scoped>
.feature-card {
  background: linear-gradient(135deg, var(--surface-primary, #FFFFFF) 0%, var(--brand-sage-light, #F5F7F4) 100%);
  border: 1px solid var(--border-color, #E5E7EB);
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--brand-sage, #A8B79D) 0%, var(--brand-gold, #D4AF37) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover::before {
  opacity: 1;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(168, 183, 157, 0.15);
  border-color: var(--brand-sage, #A8B79D);
}

.feature-card--highlighted {
  border-color: var(--brand-sage, #A8B79D);
  box-shadow: 0 8px 32px rgba(168, 183, 157, 0.2);
}

.feature-card--highlighted::before {
  opacity: 1;
}

.feature-card--interactive {
  cursor: pointer;
}

.feature-card--interactive:active {
  transform: translateY(-2px);
}

.feature-card__content {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.feature-card__icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--brand-sage, #A8B79D) 0%, var(--brand-sage-dark, #8CA085) 100%);
  border-radius: 16px;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(168, 183, 157, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.feature-card__icon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
  pointer-events: none;
}

.feature-card__icon i {
  font-size: 28px;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1;
  position: relative;
}

.feature-card__body {
  flex: 1;
  min-width: 0;
}

.feature-card__title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary, #1F2937);
  margin: 0 0 8px 0;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.feature-card__description {
  font-size: 15px;
  color: var(--text-secondary, #6B7280);
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.feature-card__features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-card__feature {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-primary, #1F2937);
  line-height: 1.4;
}

.feature-card__feature i {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-success-100, #C8E6C8);
  color: var(--color-success-700, #388E3C);
  border-radius: 50%;
  font-size: 10px;
  flex-shrink: 0;
}

.feature-card__footer {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.feature-card__action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--bg-cta-primary, #E6B800);
  color: var(--text-cta-primary, #FFFFFF);
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(230, 184, 0, 0.3);
}

.feature-card__action:hover {
  background: var(--bg-cta-primary-hover, #CC9F00);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(230, 184, 0, 0.4);
}

.feature-card__action:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(230, 184, 0, 0.3);
}

.feature-card__action i {
  font-size: 12px;
  transition: transform 0.2s ease;
}

.feature-card__action:hover i {
  transform: translateX(2px);
}

/* Compact Variant */
.feature-card--compact .feature-card__content {
  gap: 16px;
}

.feature-card--compact .feature-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
}

.feature-card--compact .feature-card__icon i {
  font-size: 20px;
}

.feature-card--compact .feature-card__title {
  font-size: 18px;
}

.feature-card--compact .feature-card__description {
  font-size: 14px;
}

/* Status Variants */
.feature-card--success {
  border-left: 4px solid var(--color-success-600, #059669);
}

.feature-card--warning {
  border-left: 4px solid var(--color-warning-600, #D97706);
}

.feature-card--error {
  border-left: 4px solid var(--color-error-600, #DC2626);
}

.feature-card--info {
  border-left: 4px solid var(--color-info-600, #2563EB);
}

/* Coming Soon State */
.feature-card--coming-soon {
  opacity: 0.7;
  pointer-events: none;
  position: relative;
}

.feature-card--coming-soon::after {
  content: 'Coming Soon';
  position: absolute;
  top: 16px;
  right: 16px;
  background: var(--brand-gold, #D4AF37);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Responsive */
@media (max-width: 768px) {
  .feature-card__content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .feature-card__icon {
    align-self: center;
  }
  
  .feature-card__title {
    font-size: 18px;
  }
  
  .feature-card__description {
    font-size: 14px;
  }
  
  .feature-card__features {
    align-items: center;
  }
  
  .feature-card__action {
    width: 100%;
    justify-content: center;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .feature-card {
    border-width: 2px;
  }
  
  .feature-card__title {
    font-weight: 700;
  }
  
  .feature-card__action {
    border: 2px solid currentColor;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .feature-card {
    transition: none;
  }
  
  .feature-card:hover {
    transform: none;
  }
  
  .feature-card__action {
    transition: none;
  }
  
  .feature-card__action:hover {
    transform: none;
  }
}
</style>