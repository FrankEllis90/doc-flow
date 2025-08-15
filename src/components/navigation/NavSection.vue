<template>
  <section class="nav-section" :class="{ 'nav-section--collapsed': collapsed }">
    <!-- Section Label -->
    <div v-if="label && !isBottomDock" class="nav-section__label">
      <transition name="label-fade" mode="out-in">
        <span v-if="!collapsed" class="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-3 py-2 block">
          {{ label }}
        </span>
      </transition>
    </div>

    <!-- Navigation Items -->
    <div class="nav-section__items space-y-1">
      <NavItem
        v-for="item in items"
        :key="item.id"
        :item="item"
        :collapsed="collapsed"
        :active="active === item.id"
        @navigate="$emit('navigate', item.id)"
      />
    </div>

    <!-- Bottom dock spacing -->
    <div v-if="isBottomDock" class="pt-2"></div>
  </section>
</template>

<script setup lang="ts">
import NavItem from './NavItem.vue'

interface NavItem {
  id: string
  label: string
  icon: string
  to?: string
  badge?: number
  children?: NavItem[]
}

const props = defineProps<{
  label?: string
  collapsed: boolean
  items: NavItem[]
  active: string
  isBottomDock?: boolean
}>()

const emit = defineEmits<{
  navigate: [id: string]
}>()
</script>

<style scoped>
.nav-section {
  @apply mb-6;
}

.nav-section--collapsed {
  @apply mb-4;
}

.nav-section__label {
  @apply mb-2;
}

/* Label fade transitions */
.label-fade-enter-active,
.label-fade-leave-active {
  transition: all 0.15s ease-out;
}

.label-fade-enter-from {
  opacity: 0;
  transform: translateX(-8px);
}

.label-fade-leave-to {
  opacity: 0;
  transform: translateX(8px);
}

/* Bottom dock styling */
.nav-section:last-child {
  @apply mb-0;
}
</style>