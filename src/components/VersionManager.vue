<template>
  <div class="card">
    <div class="card-header">
      <div class="flex justify-between items-center">
        <h3 class="heading-5 mb-0">Version History</h3>
        <button
          @click="toggleExpanded"
          class="btn btn-ghost btn-sm"
        >
          {{ isExpanded ? 'Collapse' : 'Expand' }}
        </button>
      </div>
    </div>
    
    <div class="card-body">
      <!-- Version Stats -->
      <div class="card--flat p-4 mb-4">
        <div class="grid--4 gap-4 text-sm">
          <div class="text-center">
            <div class="font-semibold text-primary">{{ versionStore.versionStats.total }}</div>
            <div class="text-tertiary">Total Versions</div>
          </div>
          <div class="text-center">
            <div class="font-semibold text-primary">{{ versionStore.versionStats.autoSaves }}</div>
            <div class="text-tertiary">Auto-saves</div>
          </div>
          <div class="text-center">
            <div class="font-semibold text-primary">{{ versionStore.versionStats.manualSaves }}</div>
            <div class="text-tertiary">Manual Saves</div>
          </div>
          <div class="text-center">
            <div class="font-semibold text-primary">{{ currentVersionInfo }}</div>
            <div class="text-tertiary">Current</div>
          </div>
        </div>
      </div>
    </div>
    
      <!-- Version List -->
      <div v-if="isExpanded" class="stack--sm max-h-96 overflow-y-auto">
        <div v-if="versionStore.versions.length === 0" class="text-center py-8 text-tertiary">
          <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p>No saved versions yet</p>
          <p class="text-xs">Versions will be automatically saved when you export</p>
          
          <!-- Debug: Add a test button -->
          <button 
            @click="createTestVersion" 
            class="mt-4 px-4 py-2 bg-blue-500 text-white rounded text-sm"
          >
            🐛 Create Test Version (Debug)
          </button>
        </div>
        
        <div
          v-for="version in versionStore.versions"
          :key="version.id"
          class="card--flat p-3 cursor-pointer hover:bg-tertiary transition-colors"
        :class="{ 'ring-2 ring-primary-300 bg-primary-50': currentVersion?.id === version.id }"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2 mb-1 flex-wrap">
              <h4 class="font-medium text-neutral-800 flex-shrink-0">{{ version.name }}</h4>
              <span
                v-if="version.isAutoSave"
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-warning-600 text-white flex-shrink-0"
              >
                Auto
              </span>
              <span
                v-else
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success-100 text-success-800 flex-shrink-0"
              >
                Manual
              </span>
            </div>
            
            <div class="text-sm text-neutral-600 mb-2">
              {{ formatDate(version.timestamp) }}
            </div>
            
            <div class="flex space-x-4 text-xs text-neutral-600">
              <span v-if="version.type === 'categories'">{{ version.categoryCount }} categories</span>
              <span v-if="version.type === 'categories'">{{ version.questionCount }} questions</span>
              <span v-if="version.type === 'chunks' || version.type === 'exported'">{{ version.chunkCount }} chunks</span>
              <span v-if="version.sourceCount">{{ version.sourceCount }} sources</span>
              <span v-if="version.exportedData" class="font-medium text-primary-700">{{ version.exportedData.format.toUpperCase() }} export</span>
            </div>
          </div>
          
          <div class="flex space-x-1 flex-shrink-0">
            <button
              @click="loadVersionData(version.id)"
              class="btn-primary text-xs px-2 py-1 whitespace-nowrap"
              :disabled="currentVersion?.id === version.id"
            >
              {{ currentVersion?.id === version.id ? 'Current' : 'Load' }}
            </button>
            
            <button
              @click="showPreview(version)"
              class="btn-secondary text-xs px-2 py-1 whitespace-nowrap"
            >
              Preview
            </button>
            
            <button
              v-if="version.exportedData"
              @click="downloadExportedFile(version)"
              class="bg-primary-100 text-primary-800 px-2 py-1 rounded text-xs hover:bg-primary-200 transition-colors whitespace-nowrap"
              title="Download the exported file"
            >
              Download
            </button>
            <button
              v-else
              @click="exportVersion(version)"
              class="bg-primary-100 text-primary-800 px-2 py-1 rounded text-xs hover:bg-primary-200 transition-colors whitespace-nowrap"
              title="Export this version as JSON"
            >
              Export
            </button>
            
            <button
              @click="confirmDelete(version)"
              class="bg-error-600 text-white px-2 py-1 rounded text-xs hover:bg-error-700 transition-colors whitespace-nowrap"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Collapsed View -->
    <div v-else-if="versions.length > 0" class="text-center py-4">
      <p class="text-neutral-600 text-sm">
        {{ versions.length }} saved version{{ versions.length === 1 ? '' : 's' }} available
      </p>
      <p class="text-xs text-neutral-600">
        Click "Expand" to view and manage versions
      </p>
    </div>
    
    <!-- Save New Version Modal -->
    <div v-if="showSaveModal" class="modal-overlay">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold text-neutral-800 mb-4">Create New Version</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              Version Name
            </label>
            <input
              v-model="newVersionName"
              type="text"
              class="input-field"
              placeholder="Enter version name"
              @keyup.enter="saveNewVersion"
            />
          </div>
          <div class="flex justify-end space-x-2">
            <button
              @click="showSaveModal = false"
              class="btn-secondary"
            >
              Cancel
            </button>
            <button
              @click="saveNewVersion"
              :disabled="!newVersionName.trim()"
              class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Version
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Preview Modal -->
    <div v-if="previewVersion" class="modal-overlay">
      <div class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-semibold text-neutral-800">{{ previewVersion.name }}</h3>
            <p class="text-sm text-neutral-600">{{ formatDate(previewVersion.timestamp) }}</p>
          </div>
          <button
            @click="previewVersion = null"
            class="text-neutral-400 hover:text-neutral-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Data Content -->
          <div>
            <h4 class="font-medium text-neutral-800 mb-3">Content Preview</h4>
            <div class="space-y-3 max-h-96 overflow-y-auto">
              <!-- Categories if available -->
              <div v-if="previewVersion.categories && previewVersion.categories.length > 0">
                <h5 class="font-medium text-neutral-700 mb-2">Categories & Questions</h5>
                <div
                  v-for="category in previewVersion.categories"
                  :key="category.id"
                  class="border border-neutral-200 rounded p-3 mb-2"
                >
                  <h6 class="font-medium text-neutral-800 mb-2">{{ category.name }}</h6>
                  <div class="space-y-2">
                    <div
                      v-for="question in category.questions"
                      :key="question.id"
                      class="bg-neutral-50 rounded p-2"
                    >
                      <p class="text-sm font-medium text-neutral-800">{{ question.question }}</p>
                      <p class="text-xs text-neutral-600 mt-1">{{ question.answer }}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Chunks if available -->
              <div v-if="previewVersion.chunks && previewVersion.chunks.length > 0">
                <h5 class="font-medium text-neutral-700 mb-2">Document Chunks ({{ previewVersion.chunks.length }})</h5>
                <div
                  v-for="(chunk, index) in previewVersion.chunks.slice(0, 3)"
                  :key="chunk.id || index"
                  class="border border-neutral-200 rounded p-3 mb-2"
                >
                  <p class="text-xs text-neutral-600 mb-1">{{ chunk.source || 'Unknown source' }} - Chunk {{ index + 1 }}</p>
                  <p class="text-sm text-neutral-800">{{ chunk.content.substring(0, 150) }}{{ chunk.content.length > 150 ? '...' : '' }}</p>
                  <div v-if="chunk.tags && chunk.tags.length > 0" class="flex flex-wrap gap-1 mt-2">
                    <span v-for="tag in chunk.tags.slice(0, 3)" :key="tag" class="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded">{{ tag }}</span>
                  </div>
                </div>
                <p v-if="previewVersion.chunks.length > 3" class="text-xs text-neutral-600 mt-2">... and {{ previewVersion.chunks.length - 3 }} more chunks</p>
              </div>
              
              <!-- No data message -->
              <div v-if="(!previewVersion.categories || previewVersion.categories.length === 0) && (!previewVersion.chunks || previewVersion.chunks.length === 0)">
                <p class="text-sm text-neutral-600">No content data available for preview.</p>
              </div>
            </div>
          </div>
          
          <!-- JSON Preview -->
          <div>
            <h4 class="font-medium text-neutral-800 mb-3">JSON Structure</h4>
            <pre class="text-xs text-neutral-800 font-mono bg-neutral-50 p-3 rounded border max-h-96 overflow-auto">{{ formatPreviewJson(previewVersion) }}</pre>
          </div>
        </div>
        
        <div class="flex justify-end space-x-2 mt-6">
          <button
            @click="loadVersionData(previewVersion.id)"
            class="btn-primary"
          >
            Load This Version
          </button>
          <button
            @click="previewVersion = null"
            class="btn-secondary"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div class="flex items-center mb-4">
          <svg class="w-6 h-6 text-error-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <h3 class="text-lg font-semibold text-neutral-800">Delete Version</h3>
        </div>
        
        <p class="text-neutral-600 mb-4">
          Are you sure you want to delete "<strong>{{ versionToDelete?.name }}</strong>"? This action cannot be undone.
        </p>
        
        <div class="flex justify-end space-x-2">
          <button
            @click="handleDeleteCancel"
            class="btn-secondary"
          >
            Cancel
          </button>
          <button
            @click="handleDeleteConfirm"
            class="bg-error-600 text-white px-4 py-2 rounded hover:bg-error-700 transition-colors"
          >
            Delete Version
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useVersionStore } from '../stores/versions.ts'
import { useContentStore } from '../stores/content.ts'
import { useAppStore } from '../stores/app.ts'

export default {
  name: 'VersionManager',
  emits: ['load-version', 'show-notification'],
  setup(props, { emit }) {
    const versionStore = useVersionStore()
    const contentStore = useContentStore()
    const appStore = useAppStore()
    
    const isExpanded = ref(true)
    const showSaveModal = ref(false)
    const newVersionName = ref('')
    const previewVersion = ref(null)
    const showDeleteModal = ref(false)
    const versionToDelete = ref(null)
    const isDeleting = ref(false) // Prevent multiple delete operations
    
    // Ensure versions are reactive
    const versions = computed(() => versionStore.versions)
    const currentVersion = computed(() => versionStore.currentVersion)
    
    const currentVersionInfo = computed(() => {
      if (versionStore.currentVersion) {
        if (versionStore.currentVersion.isAutoSave) {
          return 'Auto-saved'
        } else {
          return 'Manual save'
        }
      }
      return 'Unsaved work'
    })
    
    const canSaveCurrent = computed(() => {
      return versionStore.currentVersion && !versionStore.currentVersion.isAutoSave
    })
    
    // Load versions on component mount
    onMounted(async () => {
      await versionStore.loadVersionsFromStorage()
      console.log('VersionManager loaded versions:', versionStore.versions.length)
    })
    
    const toggleExpanded = () => {
      isExpanded.value = !isExpanded.value
    }
    
    const saveCurrentVersion = async () => {
      if (versionStore.currentVersion && !versionStore.currentVersion.isAutoSave) {
        const updatedVersion = await versionStore.updateVersion(
          versionStore.currentVersion.id, 
          { categories: contentStore.categories, chunks: contentStore.chunks }
        )
        
        if (updatedVersion) {
          emit('show-notification', {
            type: 'success',
            title: 'Version Updated',
            message: `"${updatedVersion.name}" has been updated with your changes`
          })
        }
      }
    }
    
    const saveNewVersion = async () => {
      if (newVersionName.value.trim()) {
        const version = await versionStore.saveVersion(
          { categories: contentStore.categories, chunks: contentStore.chunks }, 
          newVersionName.value.trim(), 
          false
        )
        
        emit('show-notification', {
          type: 'success',
          title: 'New Version Created',
          message: `Version "${version.name}" created successfully`
        })
        
        showSaveModal.value = false
        newVersionName.value = ''
      }
    }
    
    const loadVersionData = (versionId) => {
      const versionData = versionStore.loadVersion(versionId)
      if (versionData) {
        emit('load-version', versionId)
        
        emit('show-notification', {
          type: 'success',
          title: 'Version Loaded',
          message: `Version loaded successfully`
        })
      }
    }
    
    const showPreview = (version) => {
      previewVersion.value = version
    }
    
    const exportVersion = (version) => {
      try {
        // Create the JSON structure
        const jsonStructure = {}
        version.categories.forEach(category => {
          jsonStructure[category.name] = category.questions.map(q => ({
            question: q.question,
            answer: q.answer
          }))
        })
        
        // Create and download the file
        const dataStr = JSON.stringify(jsonStructure, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        
        // Create download link
        const link = document.createElement('a')
        link.href = URL.createObjectURL(dataBlob)
        
        // Format filename with version name and date
        const timestamp = new Date(version.timestamp)
        const dateStr = timestamp.toISOString().split('T')[0] // YYYY-MM-DD format
        const safeName = version.name.replace(/[^a-zA-Z0-9-_]/g, '_')
        link.download = `${safeName}_${dateStr}.json`
        
        // Trigger download
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // Clean up blob URL
        URL.revokeObjectURL(link.href)
        
        emit('show-notification', {
          type: 'success',
          title: 'Version Exported',
          message: `"${version.name}" exported successfully`
        })
      } catch (error) {
        emit('show-notification', {
          type: 'error',
          title: 'Export Failed',
          message: 'Failed to export version. Please try again.'
        })
      }
    }
    
    const downloadExportedFile = (version) => {
      try {
        if (!version.exportedData) {
          emit('show-notification', {
            type: 'error',
            title: 'Download Failed',
            message: 'No exported data found for this version'
          })
          return
        }
        
        // Create and download the exported file
        const dataStr = JSON.stringify(version.exportedData.data, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        
        // Create download link
        const link = document.createElement('a')
        link.href = URL.createObjectURL(dataBlob)
        
        // Use the original filename if available, otherwise create one
        const filename = version.exportedData.filename || 
          `${version.name.replace(/[^a-zA-Z0-9-_]/g, '_')}_${version.exportedData.format}_export.json`
        link.download = filename
        
        // Trigger download
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // Clean up blob URL
        URL.revokeObjectURL(link.href)
        
        emit('show-notification', {
          type: 'success',
          title: 'Export Downloaded',
          message: `${version.exportedData.format.toUpperCase()} export file downloaded successfully`
        })
      } catch (error) {
        emit('show-notification', {
          type: 'error',
          title: 'Download Failed',
          message: 'Failed to download export file. Please try again.'
        })
      }
    }
    
    const confirmDelete = (version) => {
      versionToDelete.value = version
      showDeleteModal.value = true
    }
    
    const handleDeleteConfirm = async () => {
      if (versionToDelete.value && !isDeleting.value) {
        isDeleting.value = true
        try {
          const success = await versionStore.deleteVersion(versionToDelete.value.id)
          
          if (success) {
            emit('show-notification', {
              type: 'success',
              title: 'Version Deleted',
              message: `Version "${versionToDelete.value.name}" deleted successfully`
            })
            
            // Clear current version if it was deleted
            if (currentVersion.value?.id === versionToDelete.value.id) {
              versionStore.currentVersion = null
            }
          } else {
            emit('show-notification', {
              type: 'error',
              title: 'Delete Failed',
              message: 'Failed to delete version. Please try again.'
            })
          }
        } catch (error) {
          console.error('Error deleting version:', error)
          emit('show-notification', {
            type: 'error',
            title: 'Delete Failed',
            message: 'An error occurred while deleting the version.'
          })
        } finally {
          isDeleting.value = false
        }
      }
      
      showDeleteModal.value = false
      versionToDelete.value = null
    }
    
    const handleDeleteCancel = () => {
      showDeleteModal.value = false
      versionToDelete.value = null
    }
    
    const formatDate = (timestamp) => {
      const date = new Date(timestamp)
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
    }
    
    // Debug function to test version creation
    const createTestVersion = async () => {
      try {
        console.log('Creating test version...')
        const testChunks = [{
          chunk_id: `test_${Date.now()}`,
          content: 'This is a test draft created for debugging purposes.',
          tags: ['test', 'debug'],
          source: 'Debug Test',
          word_count: 10,
          metadata: {
            is_draft: true,
            created_at: new Date().toISOString()
          }
        }]
        
        const savedVersion = await versionStore.saveVersion(
          { chunks: testChunks },
          `Debug Test - ${new Date().toLocaleString()}`,
          false
        )
        
        console.log('Test version created:', savedVersion)
        console.log('Total versions now:', versionStore.versions.length)
        
        emit('show-notification', {
          type: 'success',
          title: 'Debug Test',
          message: `Test version created: ${savedVersion.name}`
        })
      } catch (error) {
        console.error('Error creating test version:', error)
        emit('show-notification', {
          type: 'error',
          title: 'Debug Error',
          message: `Failed to create test version: ${error.message}`
        })
      }
    }
    
    const formatPreviewJson = (version) => {
      if (!version) {
        return JSON.stringify({ error: 'No version data available' }, null, 2)
      }
      
      const jsonStructure = {}
      
      // Handle categories data
      if (version.categories && Array.isArray(version.categories) && version.categories.length > 0) {
        jsonStructure.categories = {}
        version.categories.forEach(category => {
          if (category && category.name && category.questions) {
            jsonStructure.categories[category.name] = category.questions.map(q => ({
              question: q.question,
              answer: q.answer
            }))
          }
        })
      }
      
      // Handle chunks data
      if (version.chunks && Array.isArray(version.chunks) && version.chunks.length > 0) {
        jsonStructure.chunks = version.chunks.slice(0, 5).map((chunk, index) => ({
          id: chunk.id || `chunk_${index}`,
          source: chunk.source || 'Unknown source',
          content: chunk.content ? chunk.content.substring(0, 200) + (chunk.content.length > 200 ? '...' : '') : '',
          wordCount: chunk.wordCount || 0,
          tags: chunk.tags || []
        }))
        
        if (version.chunks.length > 5) {
          jsonStructure.chunks.push({
            note: `... and ${version.chunks.length - 5} more chunks`
          })
        }
      }
      
      // If no data available
      if (Object.keys(jsonStructure).length === 0) {
        jsonStructure.message = 'No content data available'
      }
      
      return JSON.stringify(jsonStructure, null, 2)
    }
    
    // Expose method for auto-saving
    const autoSaveVersion = () => {
      const version = saveVersion(props.categories, null, true)
      currentVersion.value = version
      return version
    }
    
    return {
      // Stores
      versionStore,
      contentStore,
      appStore,
      
      // Store proxy properties
      versions: computed(() => versionStore?.versions || []),
      currentVersion: computed(() => versionStore?.currentVersion),
      versionStats: computed(() => versionStore?.versionStats || { total: 0, totalChunks: 0, lastSaved: null }),
      
      // Local computed
      currentVersionInfo,
      canSaveCurrent,
      
      // Local refs
      isExpanded,
      showSaveModal,
      newVersionName,
      previewVersion,
      showDeleteModal,
      versionToDelete,
      
      // Methods
      toggleExpanded,
      saveCurrentVersion,
      saveNewVersion,
      loadVersionData,
      showPreview,
      exportVersion,
      downloadExportedFile,
      confirmDelete,
      handleDeleteConfirm,
      handleDeleteCancel,
      formatDate,
      createTestVersion,
      formatPreviewJson,
      autoSaveVersion
    }
  }
}
</script>