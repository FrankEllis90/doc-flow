<template>
  <div v-if="show" class="fixed inset-0 bg-neutral-800 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg sm:text-xl font-semibold text-neutral-800">Keyboard Shortcuts</h2>
        <button
          @click="$emit('close')"
          class="text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <!-- General Actions -->
        <div>
          <h3 class="text-base sm:text-lg font-medium text-neutral-800 mb-3 border-b border-primary-200 pb-1">
            General Actions
          </h3>
          <div class="space-y-2">
            <ShortcutItem shortcut="ctrl+s" description="Save current version" />
            <ShortcutItem shortcut="ctrl+e" description="Export knowledge base" />
            <ShortcutItem shortcut="ctrl+n" description="Add new category" />
            <ShortcutItem shortcut="ctrl+shift+n" description="Add new question" />
            <ShortcutItem shortcut="ctrl+/" description="Show this help" />
            <ShortcutItem shortcut="escape" description="Cancel/Close dialogs" />
          </div>
        </div>

        <!-- Navigation -->
        <div>
          <h3 class="text-lg font-medium text-neutral-800 mb-3 border-b border-primary-200 pb-1">
            Navigation
          </h3>
          <div class="space-y-2">
            <ShortcutItem shortcut="ctrl+f" description="Search in current view" />
            <ShortcutItem shortcut="ctrl+shift+f" description="Global search" />
            <ShortcutItem shortcut="ctrl+tab" description="Next tab" />
            <ShortcutItem shortcut="ctrl+shift+tab" description="Previous tab" />
            <ShortcutItem shortcut="ctrl+p" description="Toggle JSON preview" />
            <ShortcutItem shortcut="ctrl+\\" description="Toggle sidebar" />
          </div>
        </div>

        <!-- Edit Actions -->
        <div>
          <h3 class="text-lg font-medium text-neutral-800 mb-3 border-b border-primary-200 pb-1">
            Edit Actions
          </h3>
          <div class="space-y-2">
            <ShortcutItem shortcut="ctrl+z" description="Undo last action" />
            <ShortcutItem shortcut="ctrl+y" description="Redo last action" />
            <ShortcutItem shortcut="ctrl+c" description="Copy selected" />
            <ShortcutItem shortcut="ctrl+v" description="Paste copied" />
            <ShortcutItem shortcut="ctrl+x" description="Cut selected" />
            <ShortcutItem shortcut="ctrl+d" description="Duplicate selected" />
            <ShortcutItem shortcut="delete" description="Delete selected" />
          </div>
        </div>

        <!-- Selection & Bulk -->
        <div>
          <h3 class="text-lg font-medium text-neutral-800 mb-3 border-b border-primary-200 pb-1">
            Selection & Bulk
          </h3>
          <div class="space-y-2">
            <ShortcutItem shortcut="ctrl+a" description="Select all items" />
            <ShortcutItem shortcut="ctrl+b" description="Toggle bulk mode" />
            <ShortcutItem shortcut="ctrl+shift+a" description="Clear selection" />
            <ShortcutItem shortcut="ctrl+shift+e" description="Export selected" />
            <ShortcutItem shortcut="ctrl+shift+d" description="Duplicate selected" />
            <ShortcutItem shortcut="ctrl+shift+del" description="Delete selected" />
          </div>
        </div>

        <!-- Advanced -->
        <div>
          <h3 class="text-lg font-medium text-neutral-800 mb-3 border-b border-primary-200 pb-1">
            Advanced
          </h3>
          <div class="space-y-2">
            <ShortcutItem shortcut="ctrl+shift+v" description="Open version manager" />
            <ShortcutItem shortcut="ctrl+shift+s" description="Save new version" />
            <ShortcutItem shortcut="ctrl+shift+o" description="Open search filters" />
            <ShortcutItem shortcut="ctrl+shift+b" description="Bulk edit selected" />
            <ShortcutItem shortcut="f1" description="Show help" />
            <ShortcutItem shortcut="alt+enter" description="Quick add question" />
          </div>
        </div>

        <!-- Context Specific -->
        <div>
          <h3 class="text-lg font-medium text-neutral-800 mb-3 border-b border-primary-200 pb-1">
            Context Specific
          </h3>
          <div class="space-y-2">
            <ShortcutItem shortcut="enter" description="Confirm/Submit in forms" />
            <ShortcutItem shortcut="tab" description="Navigate form fields" />
            <ShortcutItem shortcut="shift+tab" description="Navigate backwards" />
            <ShortcutItem shortcut="space" description="Toggle checkboxes" />
            <ShortcutItem shortcut="arrow keys" description="Navigate lists" />
            <ShortcutItem shortcut="home/end" description="Go to start/end" />
          </div>
        </div>
      </div>

      <div class="mt-4 sm:mt-6 p-3 sm:p-4 bg-primary-100-5 rounded-lg border border-primary-200-25">
        <h4 class="font-medium text-neutral-800 mb-2">Tips:</h4>
        <ul class="text-xs sm:text-sm text-neutral-600 space-y-1">
          <li>• Most shortcuts work globally, but some are context-specific</li>
          <li>• Shortcuts are disabled when typing in input fields (except Escape)</li>
          <li>• Use <kbd class="px-1 py-0.5 bg-neutral-200 rounded text-xs">Ctrl</kbd> (or <kbd class="px-1 py-0.5 bg-neutral-200 rounded text-xs">⌘</kbd> on Mac) + <kbd class="px-1 py-0.5 bg-neutral-200 rounded text-xs">/</kbd> anytime to see this help</li>
          <li>• Hold <kbd class="px-1 py-0.5 bg-neutral-200 rounded text-xs">Shift</kbd> to modify shortcut behavior</li>
        </ul>
      </div>

      <div class="flex justify-end mt-4 sm:mt-6">
        <button
          @click="$emit('close')"
          class="btn-primary w-full sm:w-auto"
        >
          Got it!
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useKeyboardShortcuts } from '../composables/useKeyboardShortcuts.ts'

// Helper component for displaying shortcut items
const ShortcutItem = {
  props: {
    shortcut: String,
    description: String
  },
  setup(props) {
    const { formatShortcut } = useKeyboardShortcuts()
    
    return {
      formatShortcut
    }
  },
  template: `
    <div class="flex justify-between items-center py-1">
      <span class="text-sm text-neutral-600">{{ description }}</span>
      <kbd class="px-2 py-1 bg-neutral-100 text-neutral-800 text-xs rounded border border-neutral-200 font-mono">
        {{ formatShortcut(shortcut) }}
      </kbd>
    </div>
  `
}

export default {
  name: 'ShortcutsHelp',
  components: {
    ShortcutItem
  },
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  setup() {
    const { formatShortcut } = useKeyboardShortcuts()
    
    return {
      formatShortcut
    }
  }
}
</script>

<style scoped>
kbd {
  font-family: monospace;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}
</style>