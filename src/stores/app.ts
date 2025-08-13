import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Main Application Store
 * Manages global UI state, navigation, and cross-component communication
 */
export const useAppStore = defineStore('app', () => {
  // ===== NAVIGATION STATE =====
  const activeTab = ref('builder')
  const currentNavigation = ref('home') // Current active navigation item
  
  // Vertical Sidebar Navigation State
  const sidebarExpanded = ref(true)
  const expandedSections = ref(['kb-builder']) // Default expanded sections
  const navigationHistory = ref<string[]>([])
  const mobileMenuOpen = ref(false)
  
  const tabConfig = computed(() => [
    {
      id: 'home',
      label: 'Home',
      shortLabel: 'Home',
      icon: 'fas fa-home',
      contentClasses: 'p-0',
      errorTitle: 'Home Error',
      errorMessage: 'There was an issue with the home view.'
    },
    {
      id: 'builder',
      label: 'Manual Content Builder',
      shortLabel: 'Builder',
      icon: 'fas fa-edit',
      contentClasses: 'p-0',
      errorTitle: 'Content Builder Error',
      errorMessage: 'There was an issue with the manual content builder.'
    },
    {
      id: 'documents',
      label: 'Document Processing',
      shortLabel: 'Documents',
      icon: 'fas fa-file-alt',
      contentClasses: 'p-3 sm:p-6',
      errorTitle: 'Document Processing Error',
      errorMessage: 'There was an issue processing your documents.'
    },
    {
      id: 'versions',
      label: 'Version Control',
      shortLabel: 'Versions',
      icon: 'fas fa-history',
      badge: 0, // Will be updated by version store
      contentClasses: 'p-3 sm:p-6',
      errorTitle: 'Version Control Error',
      errorMessage: 'There was an issue with version management.'
    },
    {
      id: 'settings',
      label: 'Settings',
      shortLabel: 'Settings',
      icon: 'fas fa-cog',
      contentClasses: 'p-3 sm:p-6',
      errorTitle: 'Settings Error',
      errorMessage: 'There was an issue with the settings view.'
    }
  ])
  
  // ===== MODAL STATE =====
  const showSaveNewVersionModal = ref(false)
  const newVersionName = ref('')
  const showShortcutsHelp = ref(false)
  
  // ===== SEARCH STATE =====
  const searchQuery = ref('')
  const searchResults = ref([])
  const showSearchResults = ref(false)
  const searchInputFocused = ref(false)
  
  // ===== BULK OPERATIONS STATE =====
  const bulkSelectMode = ref(false)
  const selectedItems = ref([])
  const allSelectableItems = ref([])
  
  // ===== UI STATE =====
  const jsonPreviewVisible = ref(true)
  const sidebarCollapsed = ref(false)
  const loading = ref(false)
  const lastActivity = ref(Date.now())
  
  // ===== ACTIONS =====
  
  /**
   * Change active tab
   */
  const setActiveTab = (tabId: string) => {
    if (tabConfig.value.find(tab => tab.id === tabId)) {
      activeTab.value = tabId
      addToNavigationHistory(tabId)
      updateLastActivity()
    }
  }
  
  /**
   * Modal management
   */
  const openSaveVersionModal = (initialName = '') => {
    newVersionName.value = initialName
    showSaveNewVersionModal.value = true
  }
  
  const closeSaveVersionModal = () => {
    showSaveNewVersionModal.value = false
    newVersionName.value = ''
  }
  
  const toggleShortcutsHelp = () => {
    showShortcutsHelp.value = !showShortcutsHelp.value
  }
  
  /**
   * Search functionality
   */
  const updateSearch = (query: string) => {
    searchQuery.value = query
    updateLastActivity()
  }
  
  const clearSearch = () => {
    searchQuery.value = ''
    searchResults.value = []
    showSearchResults.value = false
  }
  
  const setSearchResults = (results: any[]) => {
    searchResults.value = results
    showSearchResults.value = results.length > 0
  }
  
  /**
   * Bulk operations
   */
  const toggleBulkSelectMode = () => {
    bulkSelectMode.value = !bulkSelectMode.value
    if (!bulkSelectMode.value) {
      selectedItems.value = []
    }
  }
  
  const selectItem = (itemId: string) => {
    if (!selectedItems.value.includes(itemId)) {
      selectedItems.value.push(itemId)
    }
  }
  
  const deselectItem = (itemId: string) => {
    const index = selectedItems.value.indexOf(itemId)
    if (index > -1) {
      selectedItems.value.splice(index, 1)
    }
  }
  
  const selectAllItems = () => {
    selectedItems.value = [...allSelectableItems.value]
  }
  
  const deselectAllItems = () => {
    selectedItems.value = []
  }
  
  const setSelectableItems = (items: string[]) => {
    allSelectableItems.value = items
  }
  
  /**
   * UI state management
   */
  const toggleJsonPreview = () => {
    jsonPreviewVisible.value = !jsonPreviewVisible.value
  }
  
  const toggleSidebar = () => {
    sidebarExpanded.value = !sidebarExpanded.value
  }

  /**
   * Navigation section management
   */
  const toggleNavigationSection = (sectionId: string) => {
    const index = expandedSections.value.indexOf(sectionId)
    if (index > -1) {
      expandedSections.value.splice(index, 1)
    } else {
      expandedSections.value.push(sectionId)
    }
  }

  const expandNavigationSection = (sectionId: string) => {
    if (!expandedSections.value.includes(sectionId)) {
      expandedSections.value.push(sectionId)
    }
  }

  const collapseNavigationSection = (sectionId: string) => {
    const index = expandedSections.value.indexOf(sectionId)
    if (index > -1) {
      expandedSections.value.splice(index, 1)
    }
  }

  const addToNavigationHistory = (tabId: string) => {
    // Remove if already exists to avoid duplicates
    const existingIndex = navigationHistory.value.indexOf(tabId)
    if (existingIndex > -1) {
      navigationHistory.value.splice(existingIndex, 1)
    }
    
    // Add to beginning of array
    navigationHistory.value.unshift(tabId)
    
    // Keep only last 10 items
    if (navigationHistory.value.length > 10) {
      navigationHistory.value = navigationHistory.value.slice(0, 10)
    }
  }

  const toggleMobileMenu = () => {
    mobileMenuOpen.value = !mobileMenuOpen.value
  }

  const closeMobileMenu = () => {
    mobileMenuOpen.value = false
  }
  
  const setMobileMenu = (value: boolean) => {
    mobileMenuOpen.value = value
  }
  
  /**
   * Set the current navigation item
   */
  const setCurrentNavigation = (navId: string) => {
    currentNavigation.value = navId
    updateLastActivity()
    
    // Map navigation to tab if needed for backward compatibility
    if (navId === 'manual-builder') {
      activeTab.value = 'builder'
    } else if (navId === 'document-processing') {
      activeTab.value = 'documents'
    } else if (navId === 'versions') {
      activeTab.value = 'versions'
    } else if (navId === 'home' || navId === 'settings') {
      activeTab.value = navId
    }
  }
  
  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }
  
  const updateLastActivity = () => {
    lastActivity.value = Date.now()
  }
  
  /**
   * Reset application state
   */
  const resetAppState = () => {
    // Reset to defaults but preserve user preferences
    activeTab.value = 'builder'
    clearSearch()
    bulkSelectMode.value = false
    selectedItems.value = []
    showSaveNewVersionModal.value = false
    newVersionName.value = ''
    loading.value = false
    updateLastActivity()
  }
  
  // ===== GETTERS =====
  
  const currentTabConfig = computed(() => {
    return tabConfig.value.find(tab => tab.id === activeTab.value)
  })
  
  const hasSelectedItems = computed(() => {
    return selectedItems.value.length > 0
  })
  
  const allItemsSelected = computed(() => {
    return selectedItems.value.length === allSelectableItems.value.length && allSelectableItems.value.length > 0
  })
  
  const isSearchActive = computed(() => {
    return searchQuery.value.length > 0 || showSearchResults.value
  })
  
  const activityStatus = computed(() => {
    const timeSinceActivity = Date.now() - lastActivity.value
    if (timeSinceActivity < 30000) return 'active' // 30 seconds
    if (timeSinceActivity < 300000) return 'idle' // 5 minutes
    return 'inactive'
  })
  
  return {
    // State
    activeTab,
    currentNavigation,
    tabConfig,
    showSaveNewVersionModal,
    newVersionName,
    showShortcutsHelp,
    searchQuery,
    searchResults,
    showSearchResults,
    searchInputFocused,
    bulkSelectMode,
    selectedItems,
    allSelectableItems,
    jsonPreviewVisible,
    sidebarCollapsed,
    loading,
    lastActivity,
    
    // Navigation State
    sidebarExpanded,
    expandedSections,
    navigationHistory,
    mobileMenuOpen,
    
    // Actions
    setActiveTab,
    openSaveVersionModal,
    closeSaveVersionModal,
    toggleShortcutsHelp,
    updateSearch,
    clearSearch,
    setSearchResults,
    toggleBulkSelectMode,
    selectItem,
    deselectItem,
    selectAllItems,
    deselectAllItems,
    setSelectableItems,
    toggleJsonPreview,
    toggleSidebar,
    toggleNavigationSection,
    expandNavigationSection,
    collapseNavigationSection,
    addToNavigationHistory,
    toggleMobileMenu,
    closeMobileMenu,
    setMobileMenu,
    setCurrentNavigation,
    setLoading,
    updateLastActivity,
    resetAppState,
    
    // Getters
    currentTabConfig,
    hasSelectedItems,
    allItemsSelected,
    isSearchActive,
    activityStatus
  }
})