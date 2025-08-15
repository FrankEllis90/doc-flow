import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ContentChunk, ExportedData } from '@/types'

export interface ExportFormat {
  id: string
  name: string
  description: string
  extension: string
  mimeType: string
  icon: string
  supported: boolean
}

export interface ExportOptions {
  includeMetadata: boolean
  includeStats: boolean
  includeSourceInfo: boolean
  chunkSeparator: string
  encoding: string
  compression: boolean
}

/**
 * Export Store
 * Manages document processing, export formats, and export history
 */
export const useExportStore = defineStore('export', () => {
  
  // ===== STATE =====
  
  // Export formats configuration
  const exportFormats = ref<ExportFormat[]>([
    {
      id: 'azure-vector',
      name: 'Azure Vector Store',
      description: 'JSON format optimized for Azure OpenAI vector store ingestion',
      extension: 'json',
      mimeType: 'application/json',
      icon: 'fas fa-cloud',
      supported: true,
      category: 'enterprise',
      hasDirectUpload: true
    },
    {
      id: 'anthropic-claude',
      name: 'Anthropic Claude',
      description: 'Optimized format for Claude API with conversation context support',
      extension: 'json',
      mimeType: 'application/json',
      icon: 'fas fa-brain',
      supported: true,
      category: 'ai-assistant',
      hasDirectUpload: true
    },
    {
      id: 'google-vertex',
      name: 'Google Vertex AI',
      description: 'Format for Google Cloud Vertex AI and PaLM integration',
      extension: 'json',
      mimeType: 'application/json',
      icon: 'fab fa-google',
      supported: true,
      category: 'enterprise',
      hasDirectUpload: true
    },
    {
      id: 'aws-bedrock',
      name: 'AWS Bedrock',
      description: 'Amazon Bedrock knowledge base format with S3 integration',
      extension: 'json',
      mimeType: 'application/json',
      icon: 'fab fa-aws',
      supported: true,
      category: 'enterprise',
      hasDirectUpload: true
    },
    {
      id: 'cohere',
      name: 'Cohere',
      description: 'Enterprise-grade embedding and search optimization',
      extension: 'json',
      mimeType: 'application/json',
      icon: 'fas fa-search',
      supported: true,
      category: 'enterprise',
      hasDirectUpload: true
    },
    {
      id: 'elasticsearch',
      name: 'Elasticsearch',
      description: 'Enterprise search with vector similarity support',
      extension: 'json',
      mimeType: 'application/json',
      icon: 'fas fa-search-plus',
      supported: true,
      category: 'enterprise',
      hasDirectUpload: true
    },
    {
      id: 'mongodb-atlas',
      name: 'MongoDB Atlas',
      description: 'Vector search in MongoDB Atlas with document storage',
      extension: 'json',
      mimeType: 'application/json',
      icon: 'fas fa-database',
      supported: true,
      category: 'database',
      hasDirectUpload: true
    },
    {
      id: 'ollama',
      name: 'Ollama',
      description: 'Local model deployment with efficient chunking',
      extension: 'json',
      mimeType: 'application/json',
      icon: 'fas fa-home',
      supported: true,
      category: 'local',
      hasDirectUpload: false
    },
    {
      id: 'json',
      name: 'JSON',
      description: 'Structured data format for AI training',
      extension: 'json',
      mimeType: 'application/json',
      icon: 'fas fa-code',
      supported: true
    },
    {
      id: 'csv',
      name: 'CSV',
      description: 'Comma-separated values for spreadsheet applications',
      extension: 'csv',
      mimeType: 'text/csv',
      icon: 'fas fa-table',
      supported: true
    },
    {
      id: 'txt',
      name: 'Plain Text',
      description: 'Simple text format with optional separators',
      extension: 'txt',
      mimeType: 'text/plain',
      icon: 'fas fa-file-alt',
      supported: true
    },
    {
      id: 'markdown',
      name: 'Markdown',
      description: 'Formatted text with markdown syntax',
      extension: 'md',
      mimeType: 'text/markdown',
      icon: 'fab fa-markdown',
      supported: true
    },
    {
      id: 'xml',
      name: 'XML',
      description: 'Structured markup format',
      extension: 'xml',
      mimeType: 'application/xml',
      icon: 'fas fa-code',
      supported: true
    },
    {
      id: 'pdf',
      name: 'PDF',
      description: 'Portable document format',
      extension: 'pdf',
      mimeType: 'application/pdf',
      icon: 'fas fa-file-pdf',
      supported: false
    },
    {
      id: 'docx',
      name: 'Word Document',
      description: 'Microsoft Word format',
      extension: 'docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      icon: 'fas fa-file-word',
      supported: false
    }
  ])
  
  // Current export state
  const selectedFormat = ref<string>('azure-vector')
  const exportOptions = ref<ExportOptions>({
    includeMetadata: true,
    includeStats: true,
    includeSourceInfo: true,
    chunkSeparator: '\n---\n',
    encoding: 'utf-8',
    compression: false
  })
  
  // Export progress
  const isExporting = ref(false)
  const exportProgress = ref(0)
  const exportStatus = ref('')
  const exportError = ref<string | null>(null)
  
  // Export history
  const exportHistory = ref<ExportedData[]>([])
  const lastExport = ref<ExportedData | null>(null)
  
  // Document processing state
  const isProcessingDocuments = ref(false)
  const processingProgress = ref(0)
  const processingStatus = ref('')
  const uploadedFiles = ref<File[]>([])
  const processedDocuments = ref<any[]>([])
  
  // ===== COMPUTED =====
  
  const availableFormats = computed(() => {
    return exportFormats.value.filter(format => format.supported)
  })
  
  const currentFormat = computed(() => {
    return exportFormats.value.find(format => format.id === selectedFormat.value)
  })
  
  const canExport = computed(() => {
    return !isExporting.value && selectedFormat.value && currentFormat.value?.supported
  })
  
  const exportStats = computed(() => ({
    totalExports: exportHistory.value.length,
    lastExportDate: lastExport.value?.exportDate || lastExport.value?.exportedAt,
    mostUsedFormat: getMostUsedFormat(),
    totalChunksExported: exportHistory.value.reduce((sum, exp) => sum + (exp.chunkCount || 0), 0)
  }))
  
  const hasUploadedFiles = computed(() => {
    return uploadedFiles.value.length > 0
  })
  
  const processingComplete = computed(() => {
    return processedDocuments.value.length > 0 && !isProcessingDocuments.value
  })
  
  // ===== ACTIONS =====
  
  /**
   * Export format management
   */
  const setExportFormat = (formatId: string) => {
    const format = exportFormats.value.find(f => f.id === formatId)
    if (format && format.supported) {
      selectedFormat.value = formatId
    }
  }
  
  const updateExportOptions = (updates: Partial<ExportOptions>) => {
    exportOptions.value = { ...exportOptions.value, ...updates }
  }
  
  const resetExportOptions = () => {
    exportOptions.value = {
      includeMetadata: true,
      includeStats: true,
      includeSourceInfo: true,
      chunkSeparator: '\n---\n',
      encoding: 'utf-8',
      compression: false
    }
  }
  
  /**
   * Export processing
   */
  const startExport = async (chunks: ContentChunk[], filename?: string) => {
    if (!canExport.value || chunks.length === 0) return null
    
    isExporting.value = true
    exportProgress.value = 0
    exportStatus.value = 'Preparing export...'
    exportError.value = null
    
    try {
      const format = currentFormat.value!
      const exportData = await processExport(chunks, format)
      
      exportProgress.value = 100
      exportStatus.value = 'Export complete'
      
      // Add to history
      const exportRecord: ExportedData = {
        id: `export_${Date.now()}`,
        exportDate: new Date().toISOString(),
        exportedAt: new Date().toISOString(),
        format: format.id,
        chunkCount: chunks.length,
        filename: filename || `knowledge-base-${Date.now()}.${format.extension}`,
        size: estimateSize(exportData),
        data: exportData,
        exportOptions: { ...exportOptions.value }
      }
      
      exportHistory.value.unshift(exportRecord)
      lastExport.value = exportRecord
      
      // Keep only last 20 exports in history
      if (exportHistory.value.length > 20) {
        exportHistory.value = exportHistory.value.slice(0, 20)
      }
      
      return exportRecord
      
    } catch (error) {
      exportError.value = error instanceof Error ? error.message : 'Export failed'
      throw error
    } finally {
      isExporting.value = false
    }
  }
  
  const processExport = async (chunks: ContentChunk[], format: ExportFormat): Promise<string | object> => {
    exportStatus.value = `Processing ${chunks.length} chunks...`
    
    const processedChunks = chunks.map((chunk, index) => {
      exportProgress.value = Math.round((index / chunks.length) * 80) // 80% for processing
      
      const baseChunk: any = {
        id: chunk.id,
        content: chunk.content
      }
      
      if (exportOptions.value.includeSourceInfo) {
        baseChunk.source = chunk.source
      }
      
      if (exportOptions.value.includeMetadata && chunk.metadata) {
        baseChunk.metadata = chunk.metadata
      }
      
      if (exportOptions.value.includeStats && chunk.stats) {
        baseChunk.stats = chunk.stats
      }
      
      return baseChunk
    })
    
    exportProgress.value = 85
    exportStatus.value = `Formatting as ${format.name}...`
    
    let result: string | object
    
    switch (format.id) {
      case 'azure-vector':
        result = convertToAzureVector(processedChunks)
        break
        
      case 'json':
        result = JSON.stringify(processedChunks, null, 2)
        break
        
      case 'csv':
        result = convertToCSV(processedChunks)
        break
        
      case 'txt':
        result = convertToText(processedChunks)
        break
        
      case 'markdown':
        result = convertToMarkdown(processedChunks)
        break
        
      case 'xml':
        result = convertToXML(processedChunks)
        break
        
      default:
        throw new Error(`Unsupported export format: ${format.id}`)
    }
    
    exportProgress.value = 100
    return result
  }
  
  /**
   * Document processing
   */
  const addUploadedFiles = (files: File[]) => {
    uploadedFiles.value.push(...files)
  }
  
  const removeUploadedFile = (index: number) => {
    uploadedFiles.value.splice(index, 1)
  }
  
  const clearUploadedFiles = () => {
    uploadedFiles.value = []
  }
  
  const startDocumentProcessing = async () => {
    if (uploadedFiles.value.length === 0) return
    
    isProcessingDocuments.value = true
    processingProgress.value = 0
    processingStatus.value = 'Starting document processing...'
    processedDocuments.value = []
    
    try {
      for (let i = 0; i < uploadedFiles.value.length; i++) {
        const file = uploadedFiles.value[i]
        processingStatus.value = `Processing ${file.name}...`
        
        const result = await processDocument(file)
        processedDocuments.value.push(result)
        
        processingProgress.value = Math.round(((i + 1) / uploadedFiles.value.length) * 100)
      }
      
      processingStatus.value = 'Document processing complete'
      
    } catch (error) {
      processingStatus.value = `Error: ${error instanceof Error ? error.message : 'Processing failed'}`
      throw error
    } finally {
      isProcessingDocuments.value = false
    }
  }
  
  const processDocument = async (file: File): Promise<any> => {
    // This would be implemented based on the file type
    // For now, return a mock result
    return {
      filename: file.name,
      size: file.size,
      type: file.type,
      processedAt: Date.now(),
      chunks: [] // Would contain extracted chunks
    }
  }
  
  /**
   * Export history management
   */
  const deleteExportFromHistory = (exportId: string) => {
    const index = exportHistory.value.findIndex(exp => exp.id === exportId)
    if (index > -1) {
      exportHistory.value.splice(index, 1)
      if (lastExport.value?.id === exportId) {
        lastExport.value = exportHistory.value[0] || null
      }
    }
  }
  
  const clearExportHistory = () => {
    exportHistory.value = []
    lastExport.value = null
  }
  
  const downloadExport = (exportRecord: ExportedData) => {
    const blob = new Blob([
      typeof exportRecord.data === 'string' ? exportRecord.data : JSON.stringify(exportRecord.data)
    ], { 
      type: currentFormat.value?.mimeType || 'text/plain' 
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = exportRecord.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  /**
   * Utility functions
   */
  const getMostUsedFormat = (): string | null => {
    const formatCounts = exportHistory.value.reduce((counts, exp) => {
      counts[exp.format] = (counts[exp.format] || 0) + 1
      return counts
    }, {} as Record<string, number>)
    
    return Object.keys(formatCounts).reduce((a, b) => 
      formatCounts[a] > formatCounts[b] ? a : b
    ) || null
  }
  
  const estimateSize = (data: any): number => {
    return new Blob([typeof data === 'string' ? data : JSON.stringify(data)]).size
  }
  
  // Format conversion functions
  const convertToAzureVector = (chunks: any[]): string => {
    const azureVectorChunks = chunks.map((chunk, index) => {
      // Generate chunk_id based on existing id or create sequential one
      const chunkId = chunk.chunk_id || chunk.id || `chunk_${String(index + 1).padStart(3, '0')}`
      
      // Calculate word count if not available in stats
      const wordCount = chunk.stats?.words || chunk.content.split(/\s+/).filter(word => word.length > 0).length
      
      // Extract tags from metadata or chunk
      const tags = chunk.tags || chunk.metadata?.tags || []
      
      return {
        content: chunk.content,
        metadata: {
          source: chunk.source || 'unknown',
          chunk_id: chunkId,
          tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
          word_count: wordCount
        }
      }
    })
    
    return JSON.stringify(azureVectorChunks, null, 2)
  }
  
  const convertToCSV = (chunks: any[]): string => {
    if (chunks.length === 0) return ''
    
    const headers = Object.keys(chunks[0])
    const csvContent = [
      headers.join(','),
      ...chunks.map(chunk => 
        headers.map(header => {
          const value = chunk[header]
          if (typeof value === 'object') return JSON.stringify(value)
          return `"${String(value).replace(/"/g, '""')}"`
        }).join(',')
      )
    ]
    
    return csvContent.join('\n')
  }
  
  const convertToText = (chunks: any[]): string => {
    return chunks.map(chunk => {
      let text = chunk.content
      if (exportOptions.value.includeSourceInfo && chunk.source) {
        text = `Source: ${chunk.source}\n\n${text}`
      }
      return text
    }).join(exportOptions.value.chunkSeparator)
  }
  
  const convertToMarkdown = (chunks: any[]): string => {
    return chunks.map((chunk, index) => {
      let md = `## Chunk ${index + 1}\n\n`
      
      if (exportOptions.value.includeSourceInfo && chunk.source) {
        md += `**Source:** ${chunk.source}\n\n`
      }
      
      md += chunk.content
      
      if (exportOptions.value.includeStats && chunk.stats) {
        md += `\n\n*Words: ${chunk.stats.words} | Characters: ${chunk.stats.characters}*`
      }
      
      return md
    }).join('\n\n---\n\n')
  }
  
  const convertToXML = (chunks: any[]): string => {
    const xmlChunks = chunks.map(chunk => {
      let xml = `  <chunk id="${chunk.id}">\n`
      xml += `    <content><![CDATA[${chunk.content}]]></content>\n`
      
      if (exportOptions.value.includeSourceInfo && chunk.source) {
        xml += `    <source>${chunk.source}</source>\n`
      }
      
      if (exportOptions.value.includeMetadata && chunk.metadata) {
        xml += `    <metadata>${JSON.stringify(chunk.metadata)}</metadata>\n`
      }
      
      if (exportOptions.value.includeStats && chunk.stats) {
        xml += `    <stats>\n`
        xml += `      <words>${chunk.stats.words}</words>\n`
        xml += `      <characters>${chunk.stats.characters}</characters>\n`
        xml += `    </stats>\n`
      }
      
      xml += `  </chunk>`
      return xml
    }).join('\n')
    
    return `<?xml version="1.0" encoding="UTF-8"?>\n<knowledge-base>\n${xmlChunks}\n</knowledge-base>`
  }
  
  /**
   * Document processing control methods
   */
  const setProcessingDocuments = (processing: boolean, status = '', progress = 0) => {
    isProcessingDocuments.value = processing
    processingStatus.value = status
    processingProgress.value = progress
  }
  
  const updateProcessingProgress = (progress: number, status?: string) => {
    processingProgress.value = progress
    if (status) {
      processingStatus.value = status
    }
  }

  /**
   * Reset export state
   */
  const resetExportState = () => {
    selectedFormat.value = 'azure-vector'
    resetExportOptions()
    isExporting.value = false
    exportProgress.value = 0
    exportStatus.value = ''
    exportError.value = null
    isProcessingDocuments.value = false
    processingProgress.value = 0
    processingStatus.value = ''
    uploadedFiles.value = []
    processedDocuments.value = []
  }
  
  return {
    // State
    exportFormats,
    selectedFormat,
    exportOptions,
    isExporting,
    exportProgress,
    exportStatus,
    exportError,
    exportHistory,
    lastExport,
    isProcessingDocuments,
    processingProgress,
    processingStatus,
    uploadedFiles,
    processedDocuments,
    
    // Computed
    availableFormats,
    currentFormat,
    canExport,
    exportStats,
    hasUploadedFiles,
    processingComplete,
    
    // Actions
    setExportFormat,
    updateExportOptions,
    resetExportOptions,
    startExport,
    addUploadedFiles,
    removeUploadedFile,
    clearUploadedFiles,
    startDocumentProcessing,
    setProcessingDocuments,
    updateProcessingProgress,
    deleteExportFromHistory,
    clearExportHistory,
    downloadExport,
    resetExportState
  }
})