import { onMounted, onUnmounted, ref } from 'vue'
import type { KeyboardShortcuts } from '@/types'

export interface ShortcutDefinition {
  key: string
  description: string
  action: () => void
  category?: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts = {}) {
  let keyHandler: ((event: KeyboardEvent) => void) | null = null
  const showShortcutsHelp = ref(false)
  const shortcutDefinitions = ref<Record<string, ShortcutDefinition>>({})

  const handleKeyDown = (event: KeyboardEvent) => {
    // Skip if user is typing in an input field
    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      // Allow some shortcuts even in input fields
      const allowedInInputs = ['Escape', 'Tab', 'ctrl+s', 'ctrl+z', 'ctrl+y', 'ctrl+a', 'ctrl+c', 'ctrl+v', 'ctrl+x']
      const combination = getCombinationString(event)
      if (!allowedInInputs.includes(combination)) {
        return
      }
    }

    const combination = getCombinationString(event)

    // Special handling for help shortcut
    if (event.key === '?' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const target = event.target as HTMLElement
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && target.contentEditable !== 'true') {
        event.preventDefault()
        showShortcutsHelp.value = !showShortcutsHelp.value
        return
      }
    }

    // Check if we have a handler for this combination
    if (shortcuts[combination]) {
      event.preventDefault()
      shortcuts[combination](event)
    }
  }

  const getCombinationString = (event: KeyboardEvent): string => {
    const modifiers: string[] = []
    if (event.ctrlKey || event.metaKey) modifiers.push('ctrl')
    if (event.shiftKey) modifiers.push('shift')
    if (event.altKey) modifiers.push('alt')
    
    const key = event.key.toLowerCase()
    return modifiers.length > 0 ? `${modifiers.join('+')}+${key}` : key
  }

  const addShortcut = (key: string, definition: ShortcutDefinition) => {
    shortcutDefinitions.value[key] = definition
    shortcuts[key] = definition.action
  }

  const removeShortcut = (key: string) => {
    delete shortcutDefinitions.value[key]
    delete shortcuts[key]
  }

  onMounted(() => {
    keyHandler = handleKeyDown
    document.addEventListener('keydown', keyHandler)
  })

  onUnmounted(() => {
    if (keyHandler) {
      document.removeEventListener('keydown', keyHandler)
    }
  })

  return {
    showShortcutsHelp,
    shortcutDefinitions,
    addShortcut,
    removeShortcut,
    
    // Helper function to format shortcut display
    formatShortcut: (shortcut: string): string => {
      return shortcut
        .replace('ctrl', navigator.platform.includes('Mac') ? '⌘' : 'Ctrl')
        .replace('shift', '⇧')
        .replace('alt', '⌥')
        .replace(/\+/g, ' + ')
        .replace(/\b\w/g, l => l.toUpperCase())
    }
  }
}

// Common shortcut patterns
export const SHORTCUTS = {
  // Navigation
  SEARCH: 'ctrl+f',
  SEARCH_GLOBAL: 'ctrl+k',
  ESCAPE: 'escape',
  FOCUS_SEARCH: 'ctrl+k',
  
  // Actions
  SAVE: 'ctrl+s',
  EXPORT: 'ctrl+e',
  UPLOAD: 'ctrl+u',
  PROCESS_CONTENT: 'ctrl+enter',
  NEW_CONTENT: 'ctrl+n',
  CLEAR_FORM: 'ctrl+shift+c',
  
  // Edit
  COPY: 'ctrl+c',
  PASTE: 'ctrl+v',
  CUT: 'ctrl+x',
  UNDO: 'ctrl+z',
  REDO: 'ctrl+y',
  
  // Selection
  SELECT_ALL: 'ctrl+a',
  
  // Tab navigation
  NEXT_TAB: 'ctrl+tab',
  PREV_TAB: 'ctrl+shift+tab',
  GO_TO_STEP_1: '1',
  GO_TO_STEP_2: '2',
  GO_TO_STEP_3: '3',
  
  // Quick actions
  DELETE_CHUNK: 'delete',
  CLEAR_ALL: 'ctrl+shift+delete',
  
  // View
  TOGGLE_PREVIEW: 'ctrl+p',
  TOGGLE_ADVANCED: 'ctrl+shift+a',
  EXPAND_ALL: 'ctrl+shift+e',
  COLLAPSE_ALL: 'ctrl+shift+c',
  
  // Help
  HELP: '?',
  SHORTCUTS_HELP: 'ctrl+/'
}