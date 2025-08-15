<template>
  <div class="export-step container-wide">
    <!-- Brief explanation above results -->
    <div style="margin-bottom: var(--space-6);">
      <p class="text-[color:var(--color-neutral-700)]" style="font-size: var(--fluid-text-base)">
        Your {{ chunks.length }} processed content sections are ready for deployment. 
        Choose your target platform below to download the optimized format and get upload instructions.
      </p>
    </div>

    <!-- Platform Selection -->
    <div class="card" style="margin-bottom: var(--space-6);">
      <div class="card-body">
        <h2 style="font-size: var(--fluid-text-xl); color: var(--color-neutral-900); margin-bottom: var(--space-4);">Select Target Platform</h2>
        <p class="text-[color:var(--color-neutral-500)]" style="font-size: var(--fluid-text-base); margin-bottom: var(--space-4);">Choose where you'll deploy your processed knowledge base content.</p>
        
        <!-- Quick Filter Tabs -->
        <div class="filter-tabs">
          <button
            v-for="category in categories"
            :key="category.id"
            @click="selectedCategory = category.id"
            :class="[
              'filter-tab',
              selectedCategory === category.id ? 'active' : ''
            ]"
          >
            <i :class="category.icon"></i>
            <span>{{ category.label }}</span>
          </button>
        </div>

        <!-- Platform Grid -->
        <div class="platform-grid">
          <div
            v-for="platform in filteredPlatforms"
            :key="platform.id"
            @click="selectPlatform(platform)"
            :class="[
              'platform-option',
              selectedPlatform?.id === platform.id ? 'selected' : '',
              platform.recommended ? 'recommended' : ''
            ]"
          >
            <div v-if="platform.recommended" class="recommended-badge">
              <i class="fas fa-star"></i> Recommended
            </div>
            <div class="platform-icon-wrapper">
              <i :class="platform.icon" class="platform-icon"></i>
            </div>
            <div class="platform-info">
              <h4 class="platform-name">{{ platform.name }}</h4>
              <p class="platform-description">{{ platform.description }}</p>
              <div class="platform-meta">
                <span class="meta-item">
                  <i class="fas fa-file-code"></i> .{{ platform.extension }}
                </span>
                <span v-if="platform.hasDirectUpload" class="meta-item">
                  <i class="fas fa-upload"></i> Direct Upload
                </span>
              </div>
            </div>
            <div class="platform-select-indicator">
              <i class="fas fa-check-circle"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Download Options -->
    <div v-if="selectedPlatform" class="card" style="margin-bottom: var(--space-6);">
      <div class="card-body">
        <h3 style="font-size: var(--fluid-text-xl); color: var(--color-neutral-900); margin-bottom: var(--space-4);">Download Options</h3>
        <p class="text-[color:var(--color-neutral-500)]" style="font-size: var(--fluid-text-base); margin-bottom: var(--space-4);">Choose what to include in your {{ selectedPlatform.name }} download.</p>
        
        <div class="options-grid">
          <!-- Include Source Information -->
          <div class="option-item">
            <label class="option-label">
              <input
                type="checkbox"
                v-model="exportOptions.includeMetadata"
                class="option-checkbox"
              />
              <div class="option-content">
                <span class="option-title">Include Source Information</span>
                <span class="option-description">Add document names, tags, and section details (recommended)</span>
              </div>
            </label>
          </div>

          <!-- Include Performance Data -->
          <div class="option-item">
            <label class="option-label">
              <input
                type="checkbox"
                v-model="exportOptions.includeStats"
                class="option-checkbox"
              />
              <div class="option-content">
                <span class="option-title">Include Performance Data</span>
                <span class="option-description">Add word counts and quality scores for optimization</span>
              </div>
            </label>
          </div>

          <!-- File Name -->
          <div class="option-item">
            <label class="option-label">
              <input
                type="text"
                v-model="exportOptions.fileNaming"
                class="option-input"
                placeholder="content-chunks"
              />
              <div class="option-content">
                <span class="option-title">File Name</span>
                <span class="option-description">Name for your downloaded file (without extension)</span>
              </div>
            </label>
          </div>

          <!-- Advanced Options Toggle -->
          <div class="option-item" style="grid-column: 1 / -1;">
            <details class="advanced-options">
              <summary class="advanced-toggle">
                <i class="fas fa-cog"></i> Advanced Settings
              </summary>
              <div class="advanced-content">
                <label class="option-label">
                  <select v-model="exportOptions.schemaVersion" class="option-select">
                    <option value="v1">Standard Format (Recommended)</option>
                    <option value="v2">Enhanced Format (Beta)</option>
                    <option value="legacy">Legacy Format</option>
                  </select>
                  <div class="option-content">
                    <span class="option-title">Format Version</span>
                    <span class="option-description">Choose the format version - Standard works with most systems</span>
                  </div>
                </label>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>

    <!-- Download Summary -->
    <div v-if="selectedPlatform" class="card" style="margin-bottom: var(--space-6);" :class="{
      'card-success': !isExporting && exportSuccess,
      'card-processing': isExporting
    }">
      <div class="card-body">
        <div class="summary-header">
          <h3 style="font-size: var(--fluid-text-xl); color: var(--color-neutral-900);">📄 Your Download Summary</h3>
          <SkeletonLoader v-if="isExporting" variant="circular" :width="24" :height="24" />
        </div>
        
        <div class="download-summary">
          <div class="summary-stats">
            <div class="summary-stat">
              <div class="stat-value">{{ chunks.length }}</div>
              <div class="stat-label">content sections ready</div>
            </div>
            <div class="summary-stat">
              <div class="stat-value">{{ selectedPlatform.name }}</div>
              <div class="stat-label">format selected</div>
            </div>
            <div class="summary-stat">
              <div class="stat-value">{{ formatFileSize(estimatedSize) }}</div>
              <div class="stat-label">estimated file size</div>
            </div>
            <div class="summary-stat">
              <div class="stat-value">{{ estimatedUploadTime }}</div>
              <div class="stat-label">processing time</div>
            </div>
          </div>
          
          <div class="ready-indicator">
            <i class="fas fa-check-circle" style="color: var(--color-success-600); margin-right: var(--space-2);"></i>
            <span>Your content is processed and ready to download</span>
          </div>
        </div>
        
        <!-- Progressive disclosure for technical details -->
        <details class="technical-details">
          <summary class="details-toggle">
            <i class="fas fa-code"></i> View Technical Details
          </summary>
          <div class="technical-content">
            <div class="preview-actions" style="margin-bottom: var(--space-3);">
              <button @click="copyPreview" class="btn-secondary btn-sm">
                <i class="fas fa-copy"></i> Copy Output
              </button>
              <button @click="togglePreviewExpand" class="btn-secondary btn-sm">
                <i :class="previewExpanded ? 'fas fa-compress' : 'fas fa-expand'"></i>
                {{ previewExpanded ? 'Collapse' : 'Expand' }}
              </button>
            </div>
            <div class="preview-container" :class="{ expanded: previewExpanded }">
              <pre class="preview-code"><code>{{ exportPreview }}</code></pre>
            </div>
          </div>
        </details>
      </div>
    </div>

    <!-- Next Steps -->
    <div v-if="selectedPlatform" class="card" style="margin-bottom: var(--space-6);">
      <div class="card-body">
        <h3 style="font-size: var(--fluid-text-xl); color: var(--color-neutral-900); margin-bottom: var(--space-4);">📋 Next Steps</h3>
        
        <div class="next-steps">
          <div class="step-item">
            <div class="step-number">1</div>
            <div class="step-content">
              <div class="step-title">Download your file</div>
              <div class="step-description">Click the download button below to save your processed content</div>
            </div>
          </div>
          
          <div class="step-item">
            <div class="step-number">2</div>
            <div class="step-content">
              <div class="step-title">Share with your technical team</div>
              <div class="step-description">Send the downloaded file to your IT department or AI team</div>
            </div>
          </div>
          
          <div class="step-item">
            <div class="step-number">3</div>
            <div class="step-content">
              <div class="step-title">Upload to {{ selectedPlatform.name }}</div>
              <div class="step-description">Your team will upload this to your {{ selectedPlatform.name }} system</div>
            </div>
          </div>
          
          <div class="help-contact">
            <i class="fas fa-question-circle" style="color: var(--color-info-600); margin-right: var(--space-2);"></i>
            <span>Need help? Contact your IT team or email: <strong>ai-support@company.com</strong></span>
          </div>
        </div>
        
        <!-- Progressive disclosure for developer resources -->
        <details class="developer-resources">
          <summary class="resources-toggle">
            <i class="fas fa-code"></i> Developer Resources & Upload Scripts
          </summary>
          <div class="resources-content">
            <div class="script-header">
              <h4>Upload Script</h4>
              <div class="script-language-selector">
                <button
                  v-for="lang in scriptLanguages"
                  :key="lang.id"
                  @click="selectedScriptLang = lang.id"
                  :class="[
                    'lang-btn',
                    selectedScriptLang === lang.id ? 'active' : ''
                  ]"
                >
                  {{ lang.label }}
                </button>
              </div>
            </div>
            
            <div class="script-container">
              <div class="script-toolbar">
                <span class="script-lang-label">{{ currentScriptLang.label }}</span>
                <button @click="copyScript" class="btn-secondary btn-sm">
                  <i class="fas fa-copy"></i> Copy Script
                </button>
              </div>
              <pre class="script-code"><code>{{ uploadScript }}</code></pre>
            </div>
            
            <div class="script-instructions">
              <h5>How to use this script:</h5>
              <ol class="instructions-list">
                <li>Export your content using the button below</li>
                <li>Save the exported file to your project directory</li>
                <li>{{ getScriptInstructions() }}</li>
                <li>Monitor the upload progress in your console</li>
              </ol>
            </div>
          </div>
        </details>
      </div>
    </div>

    <!-- Download Actions -->
    <div class="card">
      <div class="card-body">
        <div class="primary-action">
          <LoadingButton
            @click="performExport"
            :loading="isExporting"
            :disabled="!selectedPlatform"
            variant="primary"
            size="lg"
            loading-text="Preparing download..."
            class="btn-primary-large"
          >
            <i class="fas fa-download" style="margin-right: var(--space-2);"></i>
            Download for {{ selectedPlatform?.name || 'Select Platform' }}
          </LoadingButton>
        </div>
        
        <div class="secondary-actions">
          <button @click="copyPreview" class="btn-secondary-small" :disabled="isExporting">
            <i class="fas fa-eye"></i> Preview Summary
          </button>
          <button @click="showUploadModal = true" class="btn-secondary-small" :disabled="!selectedPlatform || isExporting">
            <i class="fas fa-question-circle"></i> Get Upload Help
          </button>
        </div>
        
        <div v-if="exportSuccess" class="success-message">
          <i class="fas fa-check-circle"></i>
          <span>✅ Download successful! Your file has been saved to your Downloads folder.</span>
        </div>

        <!-- Confidence builder -->
        <div class="confidence-row">
          <div class="confidence-icon">
            <i class="fas fa-shield-alt"></i>
          </div>
          <div class="confidence-content">
            <p class="confidence-text">✅ Your work is automatically saved. This download won't affect your original content.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useExportStore } from '@/stores/export'
import { useVersionStore } from '@/stores/versions'
import LoadingButton from '@/components/LoadingButton.vue'
import SkeletonLoader from '@/components/SkeletonLoader.vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  validation: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['validate', 'update:data', 'next'])

// Stores
const exportStore = useExportStore()
const versionsStore = useVersionStore()

// State
const selectedCategory = ref('all')
const selectedPlatform = ref(null)
const selectedScriptLang = ref('python')
const previewExpanded = ref(false)
const isExporting = ref(false)
const exportSuccess = ref(false)
const showUploadModal = ref(false)

// Export options
const exportOptions = ref({
  includeMetadata: true,
  includeStats: false,
  schemaVersion: 'v1',
  fileNaming: 'content-chunks'
})

// Get chunks from wizard data
const chunks = computed(() => {
  const reviewChunks = props.data.review?.chunks || []
  const processingChunks = props.data.processing?.chunks || []
  const result = reviewChunks.length > 0 ? reviewChunks : processingChunks
  
  // Enhanced debug logging
  console.group('🔍 ExportStep Data Flow Debug')
  console.log('Props data structure:', {
    review: {
      exists: !!props.data.review,
      chunks: reviewChunks.length,
      keys: props.data.review ? Object.keys(props.data.review) : []
    },
    processing: {
      exists: !!props.data.processing,
      chunks: processingChunks.length,
      keys: props.data.processing ? Object.keys(props.data.processing) : [],
      status: props.data.processing?.status
    }
  })
  console.log('Chunks selection logic:', {
    reviewChunksLength: reviewChunks.length,
    processingChunksLength: processingChunks.length,
    selectedSource: reviewChunks.length > 0 ? 'review' : 'processing',
    resultLength: result.length
  })
  if (result.length > 0) {
    console.log('First chunk sample:', {
      chunk_id: result[0]?.chunk_id,
      content: result[0]?.content?.substring(0, 100) + '...',
      hasMetadata: !!result[0]?.metadata,
      keys: Object.keys(result[0] || {})
    })
  } else {
    console.warn('⚠️ No chunks found in either review or processing data!')
  }
  console.groupEnd()
  
  return result
})

// Categories for filtering
const categories = [
  { id: 'all', label: 'All Platforms', icon: 'fas fa-th' },
  { id: 'enterprise', label: 'Enterprise', icon: 'fas fa-building' },
  { id: 'ai-assistant', label: 'AI Assistants', icon: 'fas fa-robot' },
  { id: 'vector-db', label: 'Vector DBs', icon: 'fas fa-database' },
  { id: 'search', label: 'Search', icon: 'fas fa-search' },
  { id: 'standard', label: 'Standard', icon: 'fas fa-file' }
]

// Available platforms
const platforms = [
  {
    id: 'azure-vector',
    name: 'Azure AI',
    description: 'Azure OpenAI vector store with cognitive search',
    icon: 'fab fa-microsoft',
    extension: 'json',
    category: 'enterprise',
    hasDirectUpload: true,
    recommended: true
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Fine-tuning and embeddings API',
    icon: 'fas fa-brain',
    extension: 'jsonl',
    category: 'ai-assistant',
    hasDirectUpload: true
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Claude API with context optimization',
    icon: 'fas fa-robot',
    extension: 'json',
    category: 'ai-assistant',
    hasDirectUpload: true
  },
  {
    id: 'pinecone',
    name: 'Pinecone',
    description: 'High-performance vector database',
    icon: 'fas fa-tree',
    extension: 'json',
    category: 'vector-db',
    hasDirectUpload: true
  },
  {
    id: 'chromadb',
    name: 'ChromaDB',
    description: 'Open-source embedding database',
    icon: 'fas fa-palette',
    extension: 'json',
    category: 'vector-db',
    hasDirectUpload: true
  },
  {
    id: 'elasticsearch',
    name: 'Elasticsearch',
    description: 'Enterprise search with vectors',
    icon: 'fas fa-search',
    extension: 'json',
    category: 'search',
    hasDirectUpload: true
  },
  {
    id: 'langchain',
    name: 'LangChain',
    description: 'Document format for LangChain',
    icon: 'fas fa-link',
    extension: 'json',
    category: 'ai-assistant',
    hasDirectUpload: false
  },
  {
    id: 'json',
    name: 'Standard JSON',
    description: 'Universal JSON format',
    icon: 'fas fa-code',
    extension: 'json',
    category: 'standard',
    hasDirectUpload: false
  },
  {
    id: 'csv',
    name: 'CSV',
    description: 'Spreadsheet compatible format',
    icon: 'fas fa-table',
    extension: 'csv',
    category: 'standard',
    hasDirectUpload: false
  },
  {
    id: 'txt',
    name: 'Plain Text',
    description: 'Simple text format',
    icon: 'fas fa-file-alt',
    extension: 'txt',
    category: 'standard',
    hasDirectUpload: false
  },
  {
    id: 'markdown',
    name: 'Markdown',
    description: 'Formatted markdown documents',
    icon: 'fab fa-markdown',
    extension: 'md',
    category: 'standard',
    hasDirectUpload: false
  }
]

// Script languages
const scriptLanguages = [
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'curl', label: 'cURL' },
  { id: 'powershell', label: 'PowerShell' }
]

// Computed
const filteredPlatforms = computed(() => {
  if (selectedCategory.value === 'all') {
    return platforms
  }
  return platforms.filter(p => p.category === selectedCategory.value)
})

const currentScriptLang = computed(() => {
  return scriptLanguages.find(l => l.id === selectedScriptLang.value) || scriptLanguages[0]
})

const estimatedSize = computed(() => {
  // Rough estimation of file size
  const chunkSize = JSON.stringify(chunks.value).length
  return chunkSize + (exportOptions.value.includeMetadata ? chunkSize * 0.3 : 0)
})

const estimatedUploadTime = computed(() => {
  // Rough estimation based on size
  const sizeMB = estimatedSize.value / (1024 * 1024)
  if (sizeMB < 1) return '< 1 min'
  if (sizeMB < 5) return '1-2 min'
  if (sizeMB < 10) return '2-5 min'
  return '5-10 min'
})

// Export preview
const exportPreview = computed(() => {
  console.log('ExportPreview computed:', {
    selectedPlatform: selectedPlatform.value?.id,
    chunksLength: chunks.value.length,
    hasChunks: chunks.value.length > 0,
    firstChunk: chunks.value[0]
  })
  
  if (!selectedPlatform.value || chunks.value.length === 0) {
    return `Select a platform to see export preview... (${chunks.value.length} chunks available)`
  }
  
  const sampleChunks = chunks.value.slice(0, 2)
  
  switch (selectedPlatform.value.id) {
    case 'azure-vector':
      return JSON.stringify([
        ...sampleChunks.map((chunk, idx) => ({
          id: `chunk_${idx + 1}`,
          content: chunk.content,
          metadata: exportOptions.value.includeMetadata ? {
            source: props.data.source?.title || 'Document',
            chunk_id: chunk.id,
            tags: chunk.tags || [],
            word_count: chunk.content.split(/\s+/).length,
            ...(exportOptions.value.includeStats && {
              readability_score: 75,
              semantic_density: 0.8
            })
          } : {}
        })),
        chunks.value.length > 2 ? '...' : null
      ].filter(Boolean), null, 2)
      
    case 'openai':
      return sampleChunks.map(chunk => 
        JSON.stringify({
          prompt: chunk.content.substring(0, 100) + '...',
          completion: chunk.content
        })
      ).join('\n') + (chunks.value.length > 2 ? '\n...' : '')
      
    case 'csv':
      const headers = ['ID', 'Content', ...(exportOptions.value.includeMetadata ? ['Tags', 'Word Count'] : [])]
      const rows = sampleChunks.map(chunk => [
        chunk.id,
        `"${chunk.content.substring(0, 100)}..."`,
        ...(exportOptions.value.includeMetadata ? [
          (chunk.tags || []).join(';'),
          chunk.content.split(/\s+/).length
        ] : [])
      ])
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n') + 
        (chunks.value.length > 2 ? '\n...' : '')
      
    case 'markdown':
      return sampleChunks.map(chunk => 
        `## Chunk ${chunk.id}\n\n${chunk.content.substring(0, 200)}...\n\n` +
        (exportOptions.value.includeMetadata ? `**Tags:** ${(chunk.tags || []).join(', ')}\n\n---\n\n` : '')
      ).join('') + (chunks.value.length > 2 ? '...' : '')
      
    default:
      return JSON.stringify(sampleChunks.slice(0, 2), null, 2) + 
        (chunks.value.length > 2 ? '\n...' : '')
  }
})

// Upload script generation
const uploadScript = computed(() => {
  if (!selectedPlatform.value || !selectedPlatform.value.hasDirectUpload) {
    return '# Select a platform with direct upload support'
  }
  
  const fileName = `${exportOptions.value.fileNaming}.${selectedPlatform.value.extension}`
  
  switch (selectedScriptLang.value) {
    case 'python':
      return generatePythonScript(selectedPlatform.value, fileName)
    case 'javascript':
      return generateJavaScriptScript(selectedPlatform.value, fileName)
    case 'curl':
      return generateCurlScript(selectedPlatform.value, fileName)
    case 'powershell':
      return generatePowerShellScript(selectedPlatform.value, fileName)
    default:
      return '# Script generation not available'
  }
})

// Helper functions
const selectPlatform = (platform) => {
  selectedPlatform.value = platform
  emit('update:data', {
    export: {
      target: platform.id,
      options: exportOptions.value
    }
  })
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const copyPreview = async () => {
  try {
    await navigator.clipboard.writeText(exportPreview.value)
    // Could show toast notification here
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const copyScript = async () => {
  try {
    await navigator.clipboard.writeText(uploadScript.value)
    // Could show toast notification here
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const togglePreviewExpand = () => {
  previewExpanded.value = !previewExpanded.value
}

const getScriptInstructions = () => {
  switch (selectedScriptLang.value) {
    case 'python':
      return 'Run: python upload_script.py'
    case 'javascript':
      return 'Run: node upload_script.js'
    case 'curl':
      return 'Run the curl command in your terminal'
    case 'powershell':
      return 'Run the script in PowerShell'
    default:
      return 'Execute the script according to your environment'
  }
}

// Script generators (abbreviated for space)
const generatePythonScript = (platform, fileName) => {
  return `import json
import requests

# Configuration
API_ENDPOINT = "YOUR_API_ENDPOINT"
API_KEY = "YOUR_API_KEY"

# Load the exported data
with open('${fileName}', 'r') as f:
    chunks = json.load(f)

print(f"Uploading {len(chunks)} chunks to ${platform.name}...")
# Add your upload logic here`
}

const generateJavaScriptScript = (platform, fileName) => {
  return `const fs = require('fs');
const axios = require('axios');

// Load the exported data
const data = JSON.parse(fs.readFileSync('${fileName}', 'utf8'));

console.log(\`Uploading \${data.length} chunks...\`);
// Add your upload logic here`
}

const generateCurlScript = (platform, fileName) => {
  return `# Upload to ${platform.name}
curl -X POST \\
  YOUR_API_ENDPOINT \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json' \\
  -d @${fileName}`
}

const generatePowerShellScript = (platform, fileName) => {
  return `# Load the exported data
$data = Get-Content -Path "${fileName}" -Raw | ConvertFrom-Json

# Upload to ${platform.name}
Write-Host "Uploading $($data.Count) chunks..."
# Add your upload logic here`
}

// Export function
const performExport = async () => {
  if (!selectedPlatform.value) return
  
  isExporting.value = true
  exportSuccess.value = false
  
  try {
    // Format the data based on platform
    const exportData = formatExportData()
    
    // Create blob and download
    const blob = new Blob([exportData], { type: selectedPlatform.value.mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${exportOptions.value.fileNaming}.${selectedPlatform.value.extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    // Save to version history
    await versionsStore.saveVersion({
      chunks: chunks.value
    }, `Export - ${selectedPlatform.value.name}`, false)
    
    exportSuccess.value = true
    
    // Update wizard data
    emit('update:data', {
      export: {
        completed: true,
        platform: selectedPlatform.value.id,
        fileName: a.download,
        timestamp: new Date().toISOString()
      }
    })
    
    // Mark step as complete
    emit('validate', { isValid: true, hasErrors: false })
    
  } catch (error) {
    console.error('Export failed:', error)
  } finally {
    isExporting.value = false
  }
}

const formatExportData = () => {
  const platform = selectedPlatform.value
  
  switch (platform.id) {
    case 'csv':
      return formatCSV()
    case 'txt':
      return formatPlainText()
    case 'markdown':
      return formatMarkdown()
    default:
      return formatJSON()
  }
}

const formatJSON = () => {
  const data = chunks.value.map((chunk, idx) => ({
    id: chunk.id || `chunk_${idx + 1}`,
    content: chunk.content,
    ...(exportOptions.value.includeMetadata && {
      metadata: {
        source: props.data.source?.title || 'Document',
        tags: chunk.tags || [],
        word_count: chunk.content.split(/\s+/).length,
        ...(exportOptions.value.includeStats && {
          created_at: new Date().toISOString(),
          quality_score: chunk.qualityScore || 0
        })
      }
    })
  }))
  
  return JSON.stringify(data, null, 2)
}

const formatCSV = () => {
  const headers = ['ID', 'Content']
  if (exportOptions.value.includeMetadata) {
    headers.push('Tags', 'Word Count')
  }
  
  const rows = chunks.value.map(chunk => {
    const row = [
      chunk.id,
      `"${chunk.content.replace(/"/g, '""')}"`
    ]
    if (exportOptions.value.includeMetadata) {
      row.push(
        (chunk.tags || []).join(';'),
        chunk.content.split(/\s+/).length
      )
    }
    return row
  })
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
}

const formatPlainText = () => {
  return chunks.value.map(chunk => {
    let text = chunk.content
    if (exportOptions.value.includeMetadata) {
      text += `\n\n[Tags: ${(chunk.tags || []).join(', ')}]\n`
      text += '---\n\n'
    }
    return text
  }).join('\n')
}

const formatMarkdown = () => {
  return chunks.value.map((chunk, idx) => {
    let md = `## Chunk ${idx + 1}\n\n`
    md += chunk.content + '\n\n'
    if (exportOptions.value.includeMetadata) {
      md += `**Tags:** ${(chunk.tags || []).join(', ')}\n`
      md += `**Word Count:** ${chunk.content.split(/\s+/).length}\n\n`
    }
    md += '---\n\n'
    return md
  }).join('')
}

// Initialize
onMounted(() => {
  console.group('📦 ExportStep Initialization')
  
  // Check data availability
  const hasProcessingChunks = props.data.processing?.chunks?.length > 0
  const hasReviewChunks = props.data.review?.chunks?.length > 0
  
  console.log('Initial data check:', {
    hasProcessingChunks,
    hasReviewChunks,
    processingLength: props.data.processing?.chunks?.length || 0,
    reviewLength: props.data.review?.chunks?.length || 0,
    dataKeys: Object.keys(props.data || {})
  })
  
  // If we have processing chunks but no review chunks, ensure review data is populated
  if (hasProcessingChunks && !hasReviewChunks) {
    console.log('🔄 Auto-populating review data from processing chunks')
    
    // Copy processing chunks to review data to ensure ExportStep can access them
    emit('update:data', {
      ...props.data,
      review: {
        chunks: props.data.processing.chunks,
        filters: {
          search: '',
          tags: [],
          quality: 'all'
        }
      }
    })
  }
  
  // Set default platform if specified in data
  if (props.data.export?.target) {
    const platform = platforms.find(p => p.id === props.data.export.target)
    if (platform) {
      selectedPlatform.value = platform
      console.log('✅ Restored selected platform:', platform.name)
    }
  }
  
  // Set default options
  if (props.data.export?.options) {
    Object.assign(exportOptions.value, props.data.export.options)
    console.log('✅ Restored export options')
  }
  
  // Emit validation status
  const chunksAvailable = chunks.value.length > 0
  emit('validate', {
    isValid: chunksAvailable,
    hasErrors: false,
    completed: chunksAvailable,
    errors: chunksAvailable ? {} : { chunks: 'No chunks available for export' }
  })
  
  console.log('ExportStep initialization complete:', {
    chunksAvailable,
    selectedPlatform: selectedPlatform.value?.name || 'none',
    exportOptions: exportOptions.value
  })
  console.groupEnd()
})

// Watch for changes
watch(selectedPlatform, (newPlatform) => {
  if (newPlatform) {
    emit('update:data', {
      export: {
        target: newPlatform.id,
        options: exportOptions.value
      }
    })
  }
})

// Watch chunks for validation
watch(() => chunks.value, (newChunks) => {
  const chunksAvailable = newChunks.length > 0
  emit('validate', {
    isValid: chunksAvailable,
    hasErrors: false,
    completed: chunksAvailable,
    errors: chunksAvailable ? {} : { chunks: 'No chunks available for export' }
  })
  
  console.log('📊 Chunks updated, validation emitted:', {
    chunkCount: newChunks.length,
    isValid: chunksAvailable
  })
}, { immediate: true })
</script>

<style scoped>
.export-step {
  max-width: 100%;
}

/* Use design system grid */
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-4);
}

/* Filter tabs */
.filter-tabs {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
  overflow-x: auto;
  padding-bottom: var(--space-2);
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  font-size: var(--fluid-text-sm);
  font-weight: 500;
  color: var(--color-neutral-700);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.filter-tab:hover {
  background: var(--color-neutral-100);
  border-color: var(--color-neutral-300);
}

.filter-tab.active {
  background: var(--brand-sage-100);
  border-color: var(--brand-sage-400);
  color: var(--brand-sage-800);
}

/* Platform grid */
.platform-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
}

.platform-option {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: var(--space-4);
  background: var(--color-neutral-50);
  border: 2px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.platform-option:hover {
  background: white;
  border-color: var(--brand-sage-300);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--color-neutral-800-rgb), 0.08);
}

.platform-option.selected {
  background: var(--brand-sage-50);
  border-color: var(--brand-sage-500);
}

.platform-option.recommended {
  border-color: var(--brand-gold-400);
}

.recommended-badge {
  position: absolute;
  top: calc(-1 * var(--space-2));
  right: var(--space-2);
  padding: var(--space-1) var(--space-2);
  background: var(--brand-gold);
  color: white;
  font-size: var(--fluid-text-xs);
  font-weight: 600;
  border-radius: var(--radius-sm);
}

.platform-icon-wrapper {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: var(--radius-md);
  margin-bottom: var(--space-3);
}

.platform-icon {
  font-size: var(--fluid-text-xl);
  color: var(--brand-sage-600);
}

.platform-info {
  flex: 1;
}

.platform-name {
  font-weight: 600;
  color: var(--color-neutral-900);
  margin-bottom: var(--space-1);
}

.platform-description {
  font-size: var(--fluid-text-sm);
  color: var(--color-neutral-600);
  margin-bottom: var(--space-2);
  line-height: 1.4;
}

.platform-meta {
  display: flex;
  gap: var(--space-4);
  font-size: var(--fluid-text-xs);
  color: var(--color-neutral-500);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.platform-select-indicator {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  color: var(--brand-sage-600);
  opacity: 0;
  transition: opacity 0.2s;
}

.platform-option.selected .platform-select-indicator {
  opacity: 1;
}

/* Options grid */
.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-4);
}

.option-item {
  padding: var(--space-4);
  background: var(--color-neutral-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-200);
}

.option-label {
  display: flex;
  align-items: start;
  gap: var(--space-3);
  cursor: pointer;
}

.option-checkbox {
  margin-top: calc(var(--space-1) / 2);
  width: 1.25rem;
  height: 1.25rem;
  accent-color: var(--brand-sage-600);
}

.option-select,
.option-input {
  width: 100%;
  padding: var(--space-2);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-sm);
  font-size: var(--fluid-text-sm);
  background: white;
}

.option-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.option-title {
  font-weight: 600;
  color: var(--color-neutral-900);
  font-size: var(--fluid-text-sm);
}

.option-description {
  font-size: var(--fluid-text-xs);
  color: var(--color-neutral-600);
  line-height: 1.4;
}

/* Preview */
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.preview-actions {
  display: flex;
  gap: var(--space-2);
}

.preview-container {
  background: var(--color-neutral-900);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  max-height: 300px;
  overflow-y: auto;
  transition: max-height 0.3s;
}

.preview-container.expanded {
  max-height: 600px;
}

.preview-code {
  color: var(--color-neutral-100);
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: var(--fluid-text-sm);
  line-height: 1.6;
  margin: 0;
}

.preview-stats {
  display: flex;
  gap: var(--space-6);
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-neutral-200);
}

.preview-stats .stat {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--fluid-text-sm);
  color: var(--color-neutral-600);
}

/* Script section */
.script-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.script-language-selector {
  display: flex;
  gap: var(--space-1);
  background: var(--color-neutral-100);
  padding: var(--space-1);
  border-radius: var(--radius-sm);
}

.lang-btn {
  padding: var(--space-1) var(--space-3);
  background: transparent;
  border: none;
  border-radius: var(--radius-xs);
  font-size: var(--fluid-text-sm);
  font-weight: 500;
  color: var(--color-neutral-700);
  cursor: pointer;
  transition: all 0.2s;
}

.lang-btn:hover {
  background: var(--color-neutral-200);
}

.lang-btn.active {
  background: white;
  color: var(--brand-sage-700);
  box-shadow: 0 1px 3px rgba(var(--color-neutral-800-rgb), 0.1);
}

.script-container {
  background: var(--color-neutral-900);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.script-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  background: var(--color-neutral-800);
  border-bottom: 1px solid var(--color-neutral-700);
}

.script-lang-label {
  font-size: var(--fluid-text-xs);
  font-weight: 600;
  color: var(--color-neutral-400);
  text-transform: uppercase;
}

.script-code {
  padding: var(--space-4);
  color: var(--color-neutral-100);
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: var(--fluid-text-sm);
  line-height: 1.6;
  margin: 0;
  max-height: 400px;
  overflow-y: auto;
}

/* Collapsible instructions */
.script-instructions {
  margin-top: var(--space-4);
  padding: var(--space-4);
  background: var(--color-info-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-info-200);
}

.script-instructions summary.instructions-title {
  font-size: var(--fluid-text-sm);
  font-weight: 600;
  color: var(--color-info-800);
  margin-bottom: var(--space-2);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  list-style: none;
}

.script-instructions summary.instructions-title::-webkit-details-marker {
  display: none;
}

.script-instructions summary.instructions-title::before {
  content: '▶';
  font-size: 0.8em;
  transition: transform 0.2s;
}

.script-instructions[open] summary.instructions-title::before {
  transform: rotate(90deg);
}

.instructions-list {
  margin: 0;
  padding-left: var(--space-6);
  font-size: var(--fluid-text-sm);
  color: var(--color-info-700);
  line-height: 1.6;
}

/* Action group */
.action-group {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
  align-items: center;
  justify-content: flex-end;
}

.btn-lg {
  padding: var(--space-3) var(--space-8);
  font-size: var(--fluid-text-base);
}

.success-message {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--color-success-50);
  border: 1px solid var(--color-success-200);
  border-radius: var(--radius-md);
  color: var(--color-success-700);
  font-size: var(--fluid-text-sm);
}

/* Tip row */
.tip-row {
  display: flex;
  align-items: start;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--brand-sage-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--brand-sage-200);
  margin-top: var(--space-4);
}

.tip-icon {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--brand-sage-100);
  border-radius: var(--radius-md);
  color: var(--brand-sage-600);
  flex-shrink: 0;
}

.tip-content {
  flex: 1;
}

.tip-title {
  font-weight: 600;
  color: var(--brand-sage-900);
  font-size: var(--fluid-text-sm);
  margin-bottom: var(--space-1);
}

.tip-description {
  font-size: var(--fluid-text-sm);
  color: var(--brand-sage-700);
  line-height: 1.5;
  margin: 0;
}

/* Loading states are now handled by design system components */

/* Card states */
.card-success {
  border-color: var(--color-success-300);
  background: var(--color-success-50);
}

.card-processing {
  border-color: var(--brand-sage-300);
  background: var(--brand-sage-50);
}

.card-error {
  border-color: var(--color-error-300);
  background: var(--color-error-50);
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .platform-grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: var(--space-3);
  }
  
  .filter-tabs {
    @apply flex-wrap gap-2;
  }
  
  .filter-tab {
    @apply flex-1;
    min-height: 44px;
    justify-content: center;
  }
  
  .options-grid {
    @apply grid-cols-1 gap-3;
  }
  
  .option-item {
    padding: var(--space-3);
  }
  
  .export-actions {
    @apply flex-col gap-3;
  }
  
  .export-actions .btn {
    @apply w-full;
    min-height: 44px;
  }
  
  .preview-actions {
    @apply flex-col gap-2;
  }
  
  .preview-actions .btn {
    @apply w-full;
    min-height: 44px;
  }
  
  .preview-stats {
    @apply flex-col gap-2;
  }
  
  .script-language-selector {
    @apply flex-wrap gap-2;
  }
  
  .script-language-selector .btn {
    @apply flex-1;
    min-height: 44px;
  }
}

@media (max-width: 480px) {
  .platform-option {
    padding: var(--space-3);
  }
  
  .platform-name {
    font-size: var(--fluid-text-sm);
  }
  
  .platform-description {
    font-size: var(--fluid-text-xs);
  }
  
  .filter-tab {
    font-size: var(--fluid-text-sm);
    padding: var(--space-2) var(--space-3);
  }
  
  .preview-container {
    font-size: var(--fluid-text-xs);
  }
  
  .tip-icon {
    width: 1.5rem;
    height: 1.5rem;
  }
}

/* New UX-Friendly Styles */

/* Download Summary */
.download-summary {
  padding: var(--space-4);
  background: var(--color-success-50);
  border: 1px solid var(--color-success-200);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-4);
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.summary-stat {
  text-align: center;
}

.summary-stat .stat-value {
  font-size: var(--fluid-text-lg);
  font-weight: 600;
  color: var(--color-success-700);
  margin-bottom: var(--space-1);
}

.summary-stat .stat-label {
  font-size: var(--fluid-text-sm);
  color: var(--color-neutral-600);
}

.ready-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3);
  background: white;
  border-radius: var(--radius-md);
  font-weight: 500;
  color: var(--color-success-700);
}

/* Progressive Disclosure */
.technical-details,
.developer-resources,
.advanced-options {
  margin-top: var(--space-4);
}

.details-toggle,
.resources-toggle,
.advanced-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
  color: var(--color-neutral-700);
  transition: all 0.2s;
}

.details-toggle:hover,
.resources-toggle:hover,
.advanced-toggle:hover {
  background: var(--color-neutral-100);
  border-color: var(--color-neutral-300);
}

.technical-content,
.resources-content,
.advanced-content {
  padding: var(--space-4);
  margin-top: var(--space-2);
  background: var(--color-neutral-25);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
}

/* Next Steps */
.next-steps {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.step-number {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--brand-sage-600);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: var(--fluid-text-sm);
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-title {
  font-weight: 600;
  color: var(--color-neutral-900);
  margin-bottom: var(--space-1);
}

.step-description {
  color: var(--color-neutral-600);
  line-height: 1.5;
}

.help-contact {
  display: flex;
  align-items: center;
  padding: var(--space-3);
  background: var(--color-info-50);
  border: 1px solid var(--color-info-200);
  border-radius: var(--radius-md);
  margin-top: var(--space-4);
  font-size: var(--fluid-text-sm);
  color: var(--color-info-700);
}

/* Export Actions */
.primary-action {
  text-align: center;
  margin-bottom: var(--space-4);
}

.btn-primary-large {
  width: 100%;
  max-width: 400px;
  padding: var(--space-4) var(--space-6);
  font-size: var(--fluid-text-lg);
  font-weight: 600;
  background: linear-gradient(135deg, var(--brand-sage-600) 0%, var(--brand-sage-700) 100%);
  border: none;
  border-radius: var(--radius-lg);
  color: white;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-primary-large:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.secondary-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.btn-secondary-small {
  padding: var(--space-2) var(--space-4);
  background: var(--color-neutral-100);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-md);
  color: var(--color-neutral-700);
  font-size: var(--fluid-text-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary-small:hover:not(:disabled) {
  background: var(--color-neutral-200);
  border-color: var(--color-neutral-400);
}

.success-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--color-success-50);
  border: 1px solid var(--color-success-200);
  border-radius: var(--radius-md);
  color: var(--color-success-700);
  font-weight: 500;
  margin-bottom: var(--space-4);
}

.confidence-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--brand-sage-50);
  border: 1px solid var(--brand-sage-200);
  border-radius: var(--radius-md);
}

.confidence-icon {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--brand-sage-100);
  border-radius: var(--radius-md);
  color: var(--brand-sage-600);
  flex-shrink: 0;
}

.confidence-text {
  color: var(--brand-sage-700);
  font-size: var(--fluid-text-sm);
  margin: 0;
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .summary-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-3);
  }
  
  .secondary-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn-secondary-small {
    width: 100%;
    max-width: 300px;
  }
  
  .step-item {
    flex-direction: column;
    text-align: center;
  }
  
  .step-number {
    align-self: center;
  }
}
</style>