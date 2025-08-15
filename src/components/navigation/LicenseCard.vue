<template>
  <div class="license-card">
    <div class="license-card__header">
      <div class="license-card__icon">
        <i class="fas fa-crown text-amber-500"></i>
      </div>
      <div class="license-card__info">
        <h4 class="license-card__title">Pro License</h4>
        <p class="license-card__status">{{ statusText }}</p>
      </div>
    </div>
    
    <div class="license-card__actions">
      <button 
        class="license-card__cta"
        @click="handleUpgrade"
        :disabled="isLicensed"
      >
        {{ ctaText }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Mock license status - replace with real license check
const isLicensed = computed(() => false) // TODO: Replace with actual license check

const statusText = computed(() => {
  return isLicensed.value ? 'Active' : 'Free Version'
})

const ctaText = computed(() => {
  return isLicensed.value ? 'Manage' : 'Upgrade'
})

const handleUpgrade = () => {
  if (isLicensed.value) {
    console.log('Open license management')
  } else {
    console.log('Open upgrade flow')
  }
}
</script>

<style scoped>
.license-card {
  @apply bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4;
  @apply ring-1 ring-amber-200/50 shadow-sm;
  @apply transition-all duration-200 hover:shadow-md;
}

.license-card__header {
  @apply flex items-center gap-3 mb-3;
}

.license-card__icon {
  @apply w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0;
}

.license-card__info {
  @apply flex-1 min-w-0;
}

.license-card__title {
  @apply text-sm font-semibold text-gray-900 mb-0.5;
}

.license-card__status {
  @apply text-xs text-gray-600;
}

.license-card__actions {
  @apply pt-2 border-t border-amber-200/50;
}

.license-card__cta {
  @apply w-full px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200;
  @apply bg-amber-500 text-white hover:bg-amber-600;
  @apply focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2;
  @apply disabled:bg-emerald-500 disabled:hover:bg-emerald-500;
}

.license-card__cta:disabled {
  @apply cursor-default;
}

/* Icons */
.fa-crown::before { content: '👑'; }
</style>