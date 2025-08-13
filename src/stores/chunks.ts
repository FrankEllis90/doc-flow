import { defineStore } from 'pinia'
import { shallowRef, computed, triggerRef, ref } from 'vue'
import type { ContentChunk } from '@/types'

/**
 * Focused Chunks Store
 * Manages only chunk-related state and operations for better performance
 */
export const useChunksStore = defineStore('chunks', () => {
  // ===== STATE =====
  
  // Optimized with shallowRef for performance
  const chunks = shallowRef<ContentChunk[]>([])
  const filteredChunks = shallowRef<ContentChunk[]>([])
  
  // Search and filter state
  const searchQuery = ref('')
  const expandedChunks = ref(new Set<string>())
  
  // ===== COMPUTED =====
  
  const totalChunks = computed(() => chunks.value.length)
  
  const uniqueSources = computed(() => {
    return new Set(chunks.value.map(chunk => chunk.source)).size
  })
  
  const chunkStats = computed(() => ({
    total: totalChunks.value,
    sources: uniqueSources.value,
    totalWords: chunks.value.reduce((total, chunk) => total + (chunk.stats?.words || 0), 0),
    totalCharacters: chunks.value.reduce((total, chunk) => total + (chunk.stats?.characters || 0), 0),
    averageChunkSize: totalChunks.value > 0 
      ? Math.round(chunks.value.reduce((total, chunk) => total + (chunk.content?.length || 0), 0) / totalChunks.value)
      : 0
  }))
  
  const chunksWithTags = computed(() => {
    return chunks.value.filter(chunk => chunk.tags && chunk.tags.length > 0)
  })
  
  // ===== ACTIONS =====
  
  /**
   * Add a new chunk with performance optimizations
   */
  const addChunk = (chunk: Omit<ContentChunk, 'id' | 'lastModified'>) => {
    const newChunk: ContentChunk = {
      ...chunk,
      id: `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lastModified: Date.now()
    }
    chunks.value.push(newChunk)
    triggerRef(chunks) // Manual reactivity trigger for performance
    
    // Update filtered chunks if no search active
    if (!searchQuery.value.trim()) {
      filteredChunks.value.push(newChunk)
      triggerRef(filteredChunks)
    }
    
    return newChunk
  }
  
  /**
   * Add multiple chunks efficiently
   */
  const addChunks = (newChunks: Omit<ContentChunk, 'id' | 'lastModified'>[]) => {
    const processedChunks = newChunks.map(chunk => ({
      ...chunk,
      id: `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lastModified: Date.now()
    }))
    
    chunks.value.push(...processedChunks)
    triggerRef(chunks) // Single trigger for batch operation
    
    // Update filtered chunks if no search active
    if (!searchQuery.value.trim()) {
      filteredChunks.value.push(...processedChunks)
      triggerRef(filteredChunks)
    }
    
    return processedChunks
  }
  
  /**
   * Update chunk with performance optimizations
   */
  const updateChunk = (chunkId: string, updates: Partial<ContentChunk>) => {
    const index = chunks.value.findIndex(chunk => chunk.id === chunkId)
    if (index > -1) {
      chunks.value[index] = { 
        ...chunks.value[index], 
        ...updates, 
        lastModified: Date.now() 
      }
      triggerRef(chunks) // Manual reactivity trigger for performance
      
      // Update filtered chunks if necessary
      const filteredIndex = filteredChunks.value.findIndex(chunk => chunk.id === chunkId)
      if (filteredIndex > -1) {
        filteredChunks.value[filteredIndex] = chunks.value[index]
        triggerRef(filteredChunks)
      }
    }
  }
  
  /**
   * Delete chunk with cleanup
   */
  const deleteChunk = (chunkId: string) => {
    const index = chunks.value.findIndex(chunk => chunk.id === chunkId)
    if (index > -1) {
      chunks.value.splice(index, 1)
      triggerRef(chunks) // Manual reactivity trigger for performance
      
      // Update filtered chunks
      const filteredIndex = filteredChunks.value.findIndex(chunk => chunk.id === chunkId)
      if (filteredIndex > -1) {
        filteredChunks.value.splice(filteredIndex, 1)
        triggerRef(filteredChunks)
      }
      
      // Clean up expanded state
      expandedChunks.value.delete(chunkId)
    }
  }
  
  /**
   * Delete multiple chunks efficiently
   */
  const deleteChunks = (chunkIds: string[]) => {
    const idsSet = new Set(chunkIds)
    chunks.value = chunks.value.filter(chunk => !idsSet.has(chunk.id))
    filteredChunks.value = filteredChunks.value.filter(chunk => !idsSet.has(chunk.id))
    
    triggerRef(chunks) // Single trigger for batch operation
    triggerRef(filteredChunks)
    
    // Clean up expanded state
    chunkIds.forEach(id => expandedChunks.value.delete(id))
  }
  
  /**
   * Clear all chunks
   */
  const clearChunks = () => {
    chunks.value = []
    filteredChunks.value = []
    expandedChunks.value.clear()
    searchQuery.value = ''
    
    triggerRef(chunks)
    triggerRef(filteredChunks)
  }
  
  /**
   * Load chunks from external source
   */
  const loadChunks = (initialChunks: ContentChunk[]) => {
    chunks.value = [...initialChunks]
    filteredChunks.value = [...initialChunks]
    
    triggerRef(chunks)
    triggerRef(filteredChunks)
  }
  
  /**
   * Search and filter chunks
   */
  const filterChunks = (query: string) => {
    searchQuery.value = query
    
    if (!query.trim()) {
      filteredChunks.value = chunks.value
    } else {
      const lowercaseQuery = query.toLowerCase()
      filteredChunks.value = chunks.value.filter(chunk => 
        chunk.content.toLowerCase().includes(lowercaseQuery) ||
        chunk.source.toLowerCase().includes(lowercaseQuery) ||
        (chunk.metadata?.title && chunk.metadata.title.toLowerCase().includes(lowercaseQuery)) ||
        (chunk.tags && chunk.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
      )
    }
    
    triggerRef(filteredChunks)
  }
  
  /**
   * Toggle chunk expanded state
   */
  const toggleChunkExpanded = (chunkId: string) => {
    if (expandedChunks.value.has(chunkId)) {
      expandedChunks.value.delete(chunkId)
    } else {
      expandedChunks.value.add(chunkId)
    }
  }
  
  /**
   * Get chunk by ID
   */
  const getChunkById = (chunkId: string): ContentChunk | undefined => {
    return chunks.value.find(chunk => chunk.id === chunkId)
  }
  
  /**
   * Get chunks by source
   */
  const getChunksBySource = (source: string): ContentChunk[] => {
    return chunks.value.filter(chunk => chunk.source === source)
  }
  
  /**
   * Update chunk tags efficiently
   */
  const updateChunkTags = (chunkId: string, tags: string[]) => {
    const index = chunks.value.findIndex(chunk => chunk.id === chunkId)
    if (index > -1) {
      chunks.value[index] = {
        ...chunks.value[index],
        tags,
        lastModified: Date.now()
      }
      triggerRef(chunks)
      
      // Update filtered chunks if necessary
      const filteredIndex = filteredChunks.value.findIndex(chunk => chunk.id === chunkId)
      if (filteredIndex > -1) {
        filteredChunks.value[filteredIndex] = chunks.value[index]
        triggerRef(filteredChunks)
      }
    }
  }
  
  /**
   * Bulk update operation for performance
   */
  const bulkUpdateChunks = (updates: Array<{ id: string; changes: Partial<ContentChunk> }>) => {
    const updateMap = new Map(updates.map(u => [u.id, u.changes]))
    
    chunks.value = chunks.value.map(chunk => {
      const changes = updateMap.get(chunk.id)
      return changes ? { ...chunk, ...changes, lastModified: Date.now() } : chunk
    })
    
    // Update filtered chunks
    filteredChunks.value = filteredChunks.value.map(chunk => {
      const changes = updateMap.get(chunk.id)
      return changes ? { ...chunk, ...changes, lastModified: Date.now() } : chunk
    })
    
    triggerRef(chunks)
    triggerRef(filteredChunks)
  }
  
  /**
   * Get chunks by tags
   */
  const getChunksByTags = (tags: string[]): ContentChunk[] => {
    const tagSet = new Set(tags.map(tag => tag.toLowerCase()))
    return chunks.value.filter(chunk => 
      chunk.tags && chunk.tags.some(tag => tagSet.has(tag.toLowerCase()))
    )
  }
  
  /**
   * Get performance metrics
   */
  const getPerformanceMetrics = () => ({
    totalChunks: chunks.value.length,
    filteredChunks: filteredChunks.value.length,
    expandedChunks: expandedChunks.value.size,
    memoryEfficiency: `${((chunks.value.length - expandedChunks.value.size) / chunks.value.length * 100).toFixed(1)}% collapsed`,
    averageContentLength: chunks.value.length > 0 
      ? Math.round(chunks.value.reduce((sum, chunk) => sum + chunk.content.length, 0) / chunks.value.length)
      : 0
  })
  
  return {
    // State
    chunks,
    filteredChunks,
    searchQuery,
    expandedChunks,
    
    // Computed
    totalChunks,
    uniqueSources,
    chunkStats,
    chunksWithTags,
    
    // Actions
    addChunk,
    addChunks,
    updateChunk,
    deleteChunk,
    deleteChunks,
    clearChunks,
    loadChunks,
    filterChunks,
    toggleChunkExpanded,
    getChunkById,
    getChunksBySource,
    updateChunkTags,
    bulkUpdateChunks,
    getChunksByTags,
    getPerformanceMetrics
  }
})