<template>
  <BaseCard 
    variant="default" 
    size="md" 
    class="settings-card"
    :class="{ 'settings-card--compact': compact }"
  >
    <template #header>
      <div class="settings-card__header">
        <div class="settings-card__icon" v-if="icon">
          <i :class="icon"></i>
        </div>
        <div class="settings-card__title-section">
          <h3 class="settings-card__title">{{ title }}</h3>
          <p v-if="description" class="settings-card__description">{{ description }}</p>
        </div>
      </div>
    </template>

    <div class="settings-card__content">
      <slot></slot>
    </div>

    <template #footer v-if="$slots.footer">
      <slot name="footer"></slot>
    </template>
  </BaseCard>
</template>

<script setup lang="ts">
import BaseCard from './BaseCard.vue'

interface Props {
  title: string
  description?: string
  icon?: string
  compact?: boolean
}

defineProps<Props>()
</script>

<style scoped>
.settings-card {
  background: var(--surface-primary, #FFFFFF);
  border: 1px solid var(--border-color, #E5E7EB);
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.settings-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border-color: rgba(168, 183, 157, 0.2);
}

.settings-card--compact {
  padding: 16px !important;
}

.settings-card__header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 0;
}

.settings-card__icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--brand-sage-light, #F5F7F4);
  border-radius: 10px;
  flex-shrink: 0;
  border: 1px solid rgba(168, 183, 157, 0.2);
}

.settings-card__icon i {
  font-size: 18px;
  color: var(--brand-sage-dark, #8CA085);
}

.settings-card__title-section {
  flex: 1;
  min-width: 0;
}

.settings-card__title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #1F2937);
  margin: 0 0 4px 0;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.settings-card__description {
  font-size: 14px;
  color: var(--text-secondary, #6B7280);
  margin: 0;
  line-height: 1.4;
}

.settings-card__content {
  margin-top: 16px;
}

/* Settings Grid Layout */
.settings-card__grid {
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .settings-card__grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 1024px) {
  .settings-card__grid--three-col {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

/* Settings Item */
.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color, #E5E7EB);
}

.settings-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.settings-item__label {
  flex: 1;
  min-width: 0;
}

.settings-item__title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary, #1F2937);
  margin: 0 0 2px 0;
}

.settings-item__description {
  font-size: 13px;
  color: var(--text-secondary, #6B7280);
  margin: 0;
  line-height: 1.3;
}

.settings-item__control {
  flex-shrink: 0;
  margin-left: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .settings-card__header {
    gap: 12px;
  }
  
  .settings-card__icon {
    width: 36px;
    height: 36px;
  }
  
  .settings-card__icon i {
    font-size: 16px;
  }
  
  .settings-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .settings-item__control {
    margin-left: 0;
    width: 100%;
  }
}
</style>