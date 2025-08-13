<template>
  <div v-if="show" class="fixed inset-0 bg-neutral-800 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-neutral-200">
        <div>
          <h2 class="text-xl font-bold text-neutral-900">Keyboard Shortcuts</h2>
          <p class="text-sm text-neutral-600 mt-1">Speed up your workflow with these shortcuts</p>
        </div>
        <button 
          @click="$emit('close')"
          class="text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <!-- Content -->
      <div class="p-6 overflow-y-auto max-h-[60vh]">
        <div v-for="(shortcuts, category) in groupedShortcuts" :key="category" class="mb-6">
          <h3 class="text-lg font-semibold text-neutral-800 mb-3 flex items-center">
            <i :class="getCategoryIcon(category)" class="mr-2 text-primary-600"></i>
            {{ category }}
          </h3>
          <div class="space-y-2">
            <div 
              v-for="shortcut in shortcuts" 
              :key="shortcut.key"
              class="flex items-center justify-between p-2 hover:bg-neutral-50 rounded"
            >
              <span class="text-sm text-neutral-700">{{ shortcut.description }}</span>
              <kbd class="px-2 py-1 bg-neutral-100 border border-neutral-300 rounded text-xs font-mono">
                {{ formatShortcut(shortcut.key) }}
              </kbd>
            </div>
          </div>
        </div>
        
        <!-- Global shortcuts info -->
        <div class="mt-8 p-4 bg-sage-light border border-sage-200 rounded-lg">
          <div class="flex items-start">
            <i class="fas fa-info-circle text-sage mt-0.5 mr-2"></i>
            <div>
              <h4 class="text-sm font-semibold text-sage-dark mb-1">Tips</h4>
              <ul class="text-xs text-sage-dark space-y-1">
                <li>• Most shortcuts work globally, even when not focused on input fields</li>
                <li>• Press <kbd class="px-1 py-0.5 bg-sage-light border border-sage-200 rounded text-xs">?</kbd> anytime to toggle this help</li>
                <li>• Press <kbd class="px-1 py-0.5 bg-sage-light border border-sage-200 rounded text-xs">Esc</kbd> to close modals and dialogs</li>
                <li>• Use <kbd class="px-1 py-0.5 bg-sage-light border border-sage-200 rounded text-xs">Ctrl + K</kbd> to quickly focus search fields</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex justify-end">
        <button 
          @click="$emit('close')"
          class="btn-primary px-4 py-2"
        >
          Got it
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ShortcutDefinition } from '@/composables/useKeyboardShortcuts'

interface Props {
  show: boolean
  shortcuts: Record<string, ShortcutDefinition>
  formatShortcut: (key: string) => string
}

const props = defineProps<Props>()

defineEmits<{
  close: []
}>()

const groupedShortcuts = computed(() => {
  const groups: Record<string, ShortcutDefinition[]> = {}
  
  Object.entries(props.shortcuts).forEach(([key, shortcut]) => {
    const category = shortcut.category || 'General'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push({ ...shortcut, key })
  })
  
  // Sort categories by importance
  const sortedGroups: Record<string, ShortcutDefinition[]> = {}
  const categoryOrder = ['Navigation', 'Actions', 'Edit', 'View', 'Quick Actions', 'General']
  
  categoryOrder.forEach(category => {
    if (groups[category]) {
      sortedGroups[category] = groups[category]
    }
  })
  
  // Add any remaining categories
  Object.keys(groups).forEach(category => {
    if (!sortedGroups[category]) {
      sortedGroups[category] = groups[category]
    }
  })
  
  return sortedGroups
})

const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    'Navigation': 'fas fa-compass',
    'Actions': 'fas fa-bolt',
    'Edit': 'fas fa-edit',
    'View': 'fas fa-eye',
    'Quick Actions': 'fas fa-zap',
    'General': 'fas fa-keyboard'
  }
  return icons[category] || 'fas fa-keyboard'
}
</script>

<style scoped>
kbd {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
</style>