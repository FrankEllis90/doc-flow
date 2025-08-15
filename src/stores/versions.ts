import { defineStore } from 'pinia'
import { ref, computed, type ComputedRef } from 'vue'
import type { Version, Category, ContentChunk, ExportedData, VersionStats } from '@/types'
import storage from '@/services/indexedDBStorage'

/**
 * Version Store - Migrated to Pinia
 * Manages version control, saving, and loading of knowledge base states
 */
export const useVersionStore = defineStore('versions', () => {
  const versions = ref<Version[]>([])
  const currentVersion = ref<Version | null>(null)
  
  // Load versions from IndexedDB on initialization
  const loadVersionsFromStorage = async () => {
    try {
      const saved = await storage.getItem('peppercorn-kb-versions')
      if (saved) {
        versions.value = Array.isArray(saved) ? saved : []
        console.log('Versions loaded from IndexedDB:', versions.value.length)
      } else {
        console.log('No versions found in IndexedDB')
      }
    } catch (error) {
      console.warn('Failed to load versions from storage:', error)
      versions.value = []
      
      // Try to migrate from localStorage if IndexedDB fails
      try {
        const localStorage = window.localStorage.getItem('peppercorn-kb-versions')
        if (localStorage) {
          const parsed = JSON.parse(localStorage)
          versions.value = Array.isArray(parsed) ? parsed : []
          // Save to IndexedDB and remove from localStorage
          await saveVersionsToStorage()
          window.localStorage.removeItem('peppercorn-kb-versions')
        }
      } catch (migrationError) {
        console.warn('Failed to migrate from localStorage:', migrationError)
      }
    }
  }
  
  // Save versions to IndexedDB
  const saveVersionsToStorage = async () => {
    try {
      await storage.setItem('peppercorn-kb-versions', versions.value, 'version')
      console.log('Versions saved to IndexedDB successfully:', versions.value.length)
    } catch (error) {
      console.warn('Failed to save versions to storage:', error)
      
      // Fallback to localStorage if IndexedDB fails
      try {
        localStorage.setItem('peppercorn-kb-versions', JSON.stringify(versions.value))
        console.log('Versions saved to localStorage as fallback')
      } catch (fallbackError) {
        console.error('Both IndexedDB and localStorage failed:', fallbackError)
        throw new Error('Failed to save versions: Storage quota exceeded or unavailable')
      }
    }
  }
  
  // Create a new version
  const saveVersion = async (data: { categories?: Category[], chunks?: ContentChunk[], exportedData?: ExportedData }, name = null, isAutoSave = false) => {
    const timestamp = new Date()
    const versionName = name || (isAutoSave ? 
      `Auto-save ${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString()}` :
      `Manual save ${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString()}`
    )
    
    // Determine version type and calculate counts
    let versionType: 'categories' | 'chunks' | 'exported' = 'categories'
    let questionCount = 0
    let categoryCount = 0
    let chunkCount = 0
    let sourceCount = 0
    
    if (data.exportedData) {
      // This is an exported file version
      versionType = 'exported'
      chunkCount = data.exportedData.chunkCount
      // Try to extract source count from exported data if available
      if (data.chunks) {
        sourceCount = new Set(data.chunks.map(chunk => chunk.source)).size
      }
    } else if (data.categories && data.chunks) {
      versionType = 'chunks' // Simplified - mixed content becomes chunks
      questionCount = data.categories.reduce((total, cat) => total + cat.questions.length, 0)
      categoryCount = data.categories.length
      chunkCount = data.chunks.length
      sourceCount = new Set(data.chunks.map(chunk => chunk.source)).size
    } else if (data.chunks) {
      versionType = 'chunks'
      chunkCount = data.chunks.length
      sourceCount = new Set(data.chunks.map(chunk => chunk.source)).size
    } else if (data.categories) {
      versionType = 'categories'
      questionCount = data.categories.reduce((total, cat) => total + cat.questions.length, 0)
      categoryCount = data.categories.length
    }
    
    const newVersion: Version = {
      id: `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: versionName,
      type: versionType,
      categories: data.categories ? JSON.parse(JSON.stringify(data.categories)) : undefined,
      chunks: data.chunks ? JSON.parse(JSON.stringify(data.chunks)) : undefined,
      exportedData: data.exportedData ? JSON.parse(JSON.stringify(data.exportedData)) : undefined,
      timestamp: timestamp.toISOString(),
      isAutoSave,
      questionCount: questionCount > 0 ? questionCount : undefined,
      categoryCount: categoryCount > 0 ? categoryCount : undefined,
      chunkCount: chunkCount > 0 ? chunkCount : undefined,
      sourceCount: sourceCount > 0 ? sourceCount : undefined
    }
    
    // Add to beginning of array (newest first)
    versions.value.unshift(newVersion)
    
    // Keep only last 50 versions to prevent storage bloat
    if (versions.value.length > 50) {
      versions.value = versions.value.slice(0, 50)
    }
    
    await saveVersionsToStorage()
    
    console.log('New version created:', newVersion.name, 'Total versions:', versions.value.length)
    
    return newVersion
  }
  
  // Update an existing version
  const updateVersion = async (versionId: string, data: { categories?: Category[], chunks?: ContentChunk[], exportedData?: ExportedData }, name = null) => {
    const versionIndex = versions.value.findIndex(v => v.id === versionId)
    if (versionIndex > -1) {
      const existingVersion = versions.value[versionIndex]
      const timestamp = new Date()
      
      // Determine version type and calculate counts
      let versionType: 'categories' | 'chunks' | 'exported' = 'categories'
      let questionCount = 0
      let categoryCount = 0
      let chunkCount = 0
      let sourceCount = 0
      
      if (data.exportedData) {
        versionType = 'exported'
        chunkCount = data.exportedData.chunkCount
        if (data.chunks) {
          sourceCount = new Set(data.chunks.map(chunk => chunk.source)).size
        }
      } else if (data.categories && data.chunks) {
        versionType = 'chunks'
        questionCount = data.categories.reduce((total, cat) => total + cat.questions.length, 0)
        categoryCount = data.categories.length
        chunkCount = data.chunks.length
        sourceCount = new Set(data.chunks.map(chunk => chunk.source)).size
      } else if (data.chunks) {
        versionType = 'chunks'
        chunkCount = data.chunks.length
        sourceCount = new Set(data.chunks.map(chunk => chunk.source)).size
      } else if (data.categories) {
        versionType = 'categories'
        questionCount = data.categories.reduce((total, cat) => total + cat.questions.length, 0)
        categoryCount = data.categories.length
      }
      
      // Update the existing version
      const updatedVersion: Version = {
        ...existingVersion,
        name: name || existingVersion.name,
        type: versionType,
        categories: data.categories ? JSON.parse(JSON.stringify(data.categories)) : undefined,
        chunks: data.chunks ? JSON.parse(JSON.stringify(data.chunks)) : undefined,
        exportedData: data.exportedData ? JSON.parse(JSON.stringify(data.exportedData)) : undefined,
        timestamp: timestamp.toISOString(),
        questionCount: questionCount > 0 ? questionCount : undefined,
        categoryCount: categoryCount > 0 ? categoryCount : undefined,
        chunkCount: chunkCount > 0 ? chunkCount : undefined,
        sourceCount: sourceCount > 0 ? sourceCount : undefined
      }
      
      versions.value[versionIndex] = updatedVersion
      await saveVersionsToStorage()
      
      // Update current version reference
      if (currentVersion.value?.id === versionId) {
        currentVersion.value = updatedVersion
      }
      
      return updatedVersion
    }
    return null
  }
  
  // Load a specific version
  const loadVersion = (versionId: string) => {
    const version = versions.value.find(v => v.id === versionId)
    if (version) {
      currentVersion.value = version
      return {
        categories: version.categories ? JSON.parse(JSON.stringify(version.categories)) : undefined,
        chunks: version.chunks ? JSON.parse(JSON.stringify(version.chunks)) : undefined,
        exportedData: version.exportedData ? JSON.parse(JSON.stringify(version.exportedData)) : undefined
      }
    }
    return null
  }
  
  // Delete a version
  const deleteVersion = async (versionId) => {
    const index = versions.value.findIndex(v => v.id === versionId)
    if (index > -1) {
      versions.value.splice(index, 1)
      await saveVersionsToStorage()
      return true
    }
    return false
  }
  
  // Get version statistics
  const versionStats: ComputedRef<VersionStats> = computed(() => {
    return {
      total: versions.value.length,
      autoSaves: versions.value.filter(v => v.isAutoSave).length,
      manualSaves: versions.value.filter(v => !v.isAutoSave).length,
      oldestDate: versions.value.length > 0 ? 
        new Date(Math.min(...versions.value.map(v => new Date(v.timestamp).getTime()))).toLocaleDateString() : null,
      newestDate: versions.value.length > 0 ? 
        new Date(Math.max(...versions.value.map(v => new Date(v.timestamp).getTime()))).toLocaleDateString() : null
    }
  })
  
  // Initialize on first use
  loadVersionsFromStorage().catch(console.error)
  
  return {
    // State
    versions,
    currentVersion,
    
    // Computed
    versionStats,
    
    // Actions
    saveVersion,
    updateVersion,
    loadVersion,
    deleteVersion,
    saveVersionsToStorage,
    loadVersionsFromStorage
  }
})