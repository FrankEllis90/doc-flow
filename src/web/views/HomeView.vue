<template>
  <AppLayout title="Doc Layer">
    <!-- Dynamic Content Based on Navigation -->
    <component 
      :is="currentComponent" 
      v-bind="currentComponentProps"
      @export-success="handleDocumentExportSuccess"
      @load-version="handleLoadVersion"
      @show-notification="showNotification"
    />
    
    
    <!-- Global Modals and Notifications -->
    <template #modals>
      <!-- Save New Version Modal -->
      <SaveVersionModal
        :show="appStore.showSaveNewVersionModal"
        :initial-name="appStore.newVersionName"
        version-type="manual"
        :item-count="contentStore.totalQuestions"
        @close="appStore.closeSaveVersionModal"
        @save="handleSaveVersionModalSave"
      />
      
      <!-- Shortcuts Help Modal -->
      <ShortcutsHelp 
        :show="appStore.showShortcutsHelp"
        @close="appStore.toggleShortcutsHelp"
      />
    </template>
    
    <!-- Notifications -->
    <template #notifications>
      <ToastContainer :toasts="toasts" @remove-toast="removeToast" />
    </template>
  </AppLayout>
</template>

<script>
import { ref, reactive, computed, watch, onMounted, onUnmounted, provide, nextTick } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import ContentChunkBuilder from '../../components/ContentChunkBuilder.vue'
import ToastContainer from '../../components/ToastContainer.vue'
import VersionWrapper from '../../components/VersionWrapper.vue'
import ShortcutsHelp from '../../components/ShortcutsHelp.vue'
import DocumentProcessorWizard from '../components/DocumentProcessorWizard.vue'
import SaveVersionModal from '../../components/modals/SaveVersionModal.vue'
import Home from '../../pages/Home.vue'
import Settings from '../../pages/Settings.vue'
import { useVersionStore } from '../../stores/versions.ts'
import { useAppStore } from '../../stores/app.ts'
import { useContentStore } from '../../stores/content.ts'
import { useKeyboardShortcuts, SHORTCUTS } from '@/composables/useKeyboardShortcuts.ts'
import { useErrorHandler } from '@/composables/useErrorHandler.ts'
import { useNotifications, createSafeGlobalNotification } from '@/composables/useNotifications.ts'

export default {
  name: 'HomeView',
  components: {
    AppLayout,
    ContentChunkBuilder,
    ToastContainer,
    VersionWrapper,
    ShortcutsHelp,
    DocumentProcessorWizard,
    SaveVersionModal,
    Home,
    Settings
  },
  setup() {
    // Initialize stores
    const appStore = useAppStore()
    const contentStore = useContentStore()
    const versionStore = useVersionStore()
    
    // Initialize error handling
    const { addError, setGlobalErrorHandler, handleAsyncError } = useErrorHandler()
    
    // Initialize notifications
    const { 
      notifications: notificationList, 
      addNotification, 
      removeNotification: removeNotificationById,
      registerHandler 
    } = useNotifications()
    
    // Template refs
    const versionManager = ref(null)
    const searchFilterRef = ref(null)
    
    // Navigation mapping
    const navigationComponents = {
      'home': 'Home',
      'manual-builder': 'ContentChunkBuilder',
      'document-processing': 'DocumentProcessorWizard',
      'versions': 'VersionWrapper',
      'settings': 'Settings'
    }
    
    // Current component based on navigation
    const currentComponent = computed(() => {
      const nav = appStore.currentNavigation
      return navigationComponents[nav] || 'Home'
    })
    
    // Props for current component
    const currentComponentProps = computed(() => {
      const nav = appStore.currentNavigation
      
      if (nav === 'versions') {
        return {
          ref: versionManager
        }
      }
      
      return {}
    })
    
    // Toast notification system (legacy support)
    const toasts = ref([])
    
    const showNotification = (notification) => {
      // Use new notification system
      const newNotification = addNotification(notification)
      
      // Also add to legacy toast system for backward compatibility
      const toast = {
        id: newNotification.id,
        type: newNotification.type,
        title: newNotification.title,
        message: newNotification.message,
        duration: newNotification.duration,
        autoClose: newNotification.autoClose
      }
      toasts.value.push(toast)
      
      // Auto-remove from legacy toasts
      if (toast.autoClose && toast.duration > 0) {
        setTimeout(() => {
          const index = toasts.value.findIndex(t => t.id === toast.id)
          if (index > -1) {
            toasts.value.splice(index, 1)
          }
        }, toast.duration)
      }
    }
    
    // Set up global error handler to show notifications
    setGlobalErrorHandler((error) => {
      showNotification({
        type: 'error',
        title: 'Error Occurred',
        message: error.message,
        duration: error.severity === 'critical' ? 10000 : 5000
      })
    })
    
    // Create safe global notification function
    const safeGlobalNotify = createSafeGlobalNotification()
    
    // Provide notification context to child components via provide/inject
    // instead of polluting global window object
    provide('showNotification', safeGlobalNotify)
    
    // Register handler for new notifications to update toasts
    const unregisterHandler = registerHandler((notification) => {
      // This ensures any direct calls to the notification system also update toasts
      const existingToast = toasts.value.find(t => t.id === notification.id)
      if (!existingToast) {
        const toast = {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          duration: notification.duration,
          autoClose: notification.autoClose
        }
        toasts.value.push(toast)
        
        if (toast.autoClose && toast.duration > 0) {
          setTimeout(() => {
            const index = toasts.value.findIndex(t => t.id === toast.id)
            if (index > -1) {
              toasts.value.splice(index, 1)
            }
          }, toast.duration)
        }
      }
    })
    
    // Cleanup function to prevent memory leaks
    onUnmounted(() => {
      // Unregister notification handler
      unregisterHandler()
    })
    
    const removeToast = (toastId) => {
      // Remove from both systems
      removeNotificationById(toastId)
      const index = toasts.value.findIndex(toast => toast.id === toastId)
      if (index > -1) {
        toasts.value.splice(index, 1)
      }
    }
    
    // Version management
    const handleLoadVersion = (versionId) => {
      const versionData = versionStore.loadVersion(versionId)
      if (versionData) {
        // Find the version to get its type
        const version = versionStore.versions.find(v => v.id === versionId)
        
        if (version?.type === 'exported') {
          // For exported versions, show information but don't try to load UI state
          showNotification({
            type: 'info',
            title: 'Exported Version',
            message: `This version contains a ${version.exportedData?.format.toUpperCase()} export file with ${version.chunkCount} chunks. Use the Download button to get the file.`
          })
          return
        }
        
        if (versionData.categories) {
          contentStore.categories = versionData.categories
          appStore.setActiveTab('builder')
        }
        
        if (versionData.chunks) {
          contentStore.loadInitialChunks(versionData.chunks)
          appStore.setActiveTab('builder')
        }
        
        // Note: For exported versions, the exported data is available for download
        
        // Show success notification for loadable versions
        showNotification({
          type: 'success',
          title: 'Version Loaded',
          message: `Successfully loaded version "${version?.name || 'Unknown'}" with ${versionData.chunks ? versionData.chunks.length + ' chunks' : versionData.categories ? versionData.categories.reduce((sum, cat) => sum + cat.questions.length, 0) + ' questions' : 'content'}.`
        })
      }
    }
    
    // Handle export success from document processing - auto-save version  
    const handleDocumentExportSuccess = (data) => {
      // For document processing, we need to get the chunks from the component
      // This is a bit tricky since we don't have direct access to the chunks
      // For now, we'll just show the notification and the document processor
      // will handle its own version saving
      showNotification({
        type: 'success',
        title: 'Export Successful',
        message: 'Document processing export completed successfully.'
      })
    }

    // Handle export success - auto-save version (legacy for old Q&A system)
    const handleExportSuccess = (filename) => {
      if (versionManager.value) {
        versionManager.value.autoSaveVersion()
        showNotification({
          type: 'info',
          title: 'Auto-saved',
          message: 'Version automatically saved on export. Check Version Control tab to view.'
        })
      }
    }
    
    // Save edits to current version
    const saveEditsToCurrentVersion = async () => {
      if (versionStore.currentVersion && !versionStore.currentVersion.isAutoSave) {
        const updatedVersion = await versionStore.updateVersion(
          versionStore.currentVersion.id, 
          { categories: contentStore.categories, chunks: contentStore.chunks }
        )
        
        if (updatedVersion) {
          showNotification({
            type: 'success',
            title: 'Edits Saved',
            message: `Your changes have been saved to "${updatedVersion.name}"`
          })
        }
      }
    }
    
    // Save version modal handlers
    const handleSaveVersionModalClose = () => {
      appStore.showSaveNewVersionModal = false
      appStore.newVersionName = ''
    }
    
    const handleSaveVersionModalSave = async ({ name, type, itemCount }) => {
      const version = await versionStore.saveVersion(
        { categories: contentStore.categories, chunks: contentStore.chunks }, 
        name, 
        false
      )
      
      showNotification({
        type: 'success',
        title: 'New Version Created',
        message: `Version "${version.name}" created successfully with ${itemCount} items`
      })
      
      appStore.showSaveNewVersionModal = false
      appStore.newVersionName = ''
    }
    
    // Tab event handlers
    const handleTabChange = (tabId) => {
      appStore.activeTab = tabId
    }
    
    const handleTabError = ({ tabId, tabLabel, error, errorInfo, retryCount }) => {
      console.error(`Tab error in ${tabLabel}:`, error, errorInfo)
      
      showNotification({
        type: 'error',
        title: `${tabLabel} Error (Attempt ${retryCount})`,
        message: 'A component encountered an error. It will attempt to recover automatically.',
        duration: 8000
      })
    }
    
    const handleTabRetry = ({ tabId, tabLabel, retryCount }) => {
      console.log(`Retrying ${tabLabel} (attempt ${retryCount})`)
      
      showNotification({
        type: 'info',
        title: `Retrying ${tabLabel}`,
        message: 'Attempting to recover from the error...',
        duration: 3000
      })
    }
    
    // Keyboard shortcuts
    const keyboardShortcuts = {
      [SHORTCUTS.HELP]: () => appStore.showShortcutsHelp = true,
      [SHORTCUTS.SHORTCUTS_HELP]: () => appStore.showShortcutsHelp = true,
      [SHORTCUTS.ESCAPE]: () => {
        // Close any open modals
        appStore.showShortcutsHelp = false
        appStore.showSaveNewVersionModal = false
        appStore.showExportModal = false
      },
      [SHORTCUTS.SAVE]: () => {
        if (versionStore.currentVersion && !versionStore.currentVersion.isAutoSave) {
          saveEditsToCurrentVersion()
        } else {
          appStore.showSaveNewVersionModal = true
        }
      },
      [SHORTCUTS.EXPORT]: () => {
        // Open export modal
        if (contentStore.chunks.length > 0) {
          appStore.showExportModal = true
        } else {
          showNotification({
            type: 'warning',
            title: 'No Content to Export',
            message: 'Please add some content chunks before exporting.',
            duration: 3000
          })
        }
      },
      [SHORTCUTS.NEW_CONTENT]: () => {
        // Navigate to Builder tab and focus on content input
        appStore.activeTab = 'builder'
        nextTick(() => {
          const contentInput = document.querySelector('textarea[placeholder*="Paste your full content"]')
          if (contentInput) {
            contentInput.focus()
          }
        })
      },
      [SHORTCUTS.UPLOAD]: () => {
        // Navigate to Documents tab and trigger file upload
        appStore.activeTab = 'documents'
        nextTick(() => {
          const fileInput = document.querySelector('input[type="file"]')
          if (fileInput) {
            fileInput.click()
          }
        })
      },
      [SHORTCUTS.NEXT_TAB]: () => {
        const currentIndex = appStore.tabConfig.findIndex(tab => tab.id === appStore.activeTab)
        const nextIndex = (currentIndex + 1) % appStore.tabConfig.length
        appStore.activeTab = appStore.tabConfig[nextIndex].id
      },
      [SHORTCUTS.PREV_TAB]: () => {
        const currentIndex = appStore.tabConfig.findIndex(tab => tab.id === appStore.activeTab)
        const prevIndex = currentIndex === 0 ? appStore.tabConfig.length - 1 : currentIndex - 1
        appStore.activeTab = appStore.tabConfig[prevIndex].id
      }
    }
    
    // Initialize keyboard shortcuts
    useKeyboardShortcuts(keyboardShortcuts)
    
    return {
      // Stores
      appStore,
      contentStore,
      versionStore,
      
      // Template refs
      versionManager,
      searchFilterRef,
      
      // Computed
      currentComponent,
      currentComponentProps,
      
      // Legacy support
      toasts,
      
      // Event handlers
      showNotification,
      removeToast,
      handleTabError,
      handleTabRetry,
      handleLoadVersion,
      handleDocumentExportSuccess,
      handleExportSuccess,
      handleSaveVersionModalClose,
      handleSaveVersionModalSave,
      saveEditsToCurrentVersion
    }
  }
}
</script>

<style scoped>
/* Component-specific styles can go here if needed */
</style>