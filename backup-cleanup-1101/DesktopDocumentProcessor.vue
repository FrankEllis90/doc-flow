<template>
  <div class="desktop-document-processor">
    <!-- Desktop Header with Breadcrumbs -->
    <div class="desktop-header">
      <div class="desktop-header-content">
        <div class="desktop-header-left">
          <div class="desktop-icon">
            <svg viewBox="0 0 24 24" fill="none" class="w-8 h-8">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="desktop-header-info">
            <h1 class="desktop-title">Document Processing</h1>
            <div class="desktop-breadcrumbs">
              <span class="breadcrumb-item">Ragara</span>
              <i class="fas fa-chevron-right breadcrumb-separator"></i>
              <span class="breadcrumb-item">Documents</span>
              <i class="fas fa-chevron-right breadcrumb-separator"></i>
              <span class="breadcrumb-item active">Processing</span>
            </div>
          </div>
        </div>
        
        <div class="desktop-header-actions">
          <button 
            @click="showKeyboardShortcuts = true"
            class="desktop-action-btn secondary"
            title="Keyboard Shortcuts (Ctrl+?)"
          >
            <i class="fas fa-keyboard"></i>
          </button>
          <button 
            @click="showBatchHelp = true"
            class="desktop-action-btn secondary"
            title="Processing Tips"
          >
            <i class="fas fa-info-circle"></i>
          </button>
          <button 
            @click="clearAll"
            :disabled="chunks.length === 0"
            class="desktop-action-btn danger"
            title="Clear All (Ctrl+Shift+C)"
          >
            <i class="fas fa-trash-alt"></i>
            Clear All
          </button>
        </div>
      </div>
    </div>

    <!-- DEBUG PANEL - TEMPORARY -->
    <div v-if="showDebugPanel" class="desktop-card mb-6 border-2 border-orange-400 bg-orange-50">
      <div class="desktop-card-header bg-orange-100">
        <h3 class="text-lg font-bold text-orange-800">🔍 Desktop Document Processing Debug Panel</h3>
        <button 
          @click="showDebugPanel = false" 
          class="text-orange-600 hover:text-orange-800"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="p-4 space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <h4 class="font-semibold text-orange-700 mb-2">Processing Status:</h4>
            <div class="bg-white p-3 rounded border border-orange-300">
              <p class="text-sm"><strong>Current Step:</strong> {{ step }}</p>
              <p class="text-sm"><strong>Uploaded Files:</strong> {{ uploadedFiles.length }}</p>
              <p class="text-sm"><strong>Processing:</strong> {{ isProcessing ? 'YES' : 'NO' }}</p>
              <p class="text-sm"><strong>Has Processed:</strong> {{ hasProcessedFiles ? 'YES' : 'NO' }}</p>
            </div>
          </div>
          <div>
            <h4 class="font-semibold text-orange-700 mb-2">Chunks in Store:</h4>
            <div class="bg-white p-3 rounded border border-orange-300">
              <p class="text-sm"><strong>Total Chunks:</strong> {{ chunks.length }}</p>
              <p class="text-sm"><strong>First Chunk Content:</strong></p>
              <div class="bg-gray-100 p-2 rounded mt-1 text-xs font-mono overflow-x-auto" style="max-height: 100px; overflow-y: auto;">
                {{ chunks[0]?.content ? chunks[0].content.substring(0, 500) + '...' : '(no chunks)' }}
              </div>
            </div>
          </div>
        </div>
        <div>
          <h4 class="font-semibold text-orange-700 mb-2">Last Debug Info:</h4>
          <div class="bg-white p-3 rounded border border-orange-300">
            <p class="text-sm" v-if="debugInfo.lastFileName">
              <strong>Last File:</strong> {{ debugInfo.lastFileName }}
            </p>
            <p class="text-sm" v-if="debugInfo.lastExtractedLength">
              <strong>Extracted Text Length:</strong> {{ debugInfo.lastExtractedLength }} chars
            </p>
            <p class="text-sm" v-if="debugInfo.lastChunksCreated">
              <strong>Chunks Created:</strong> {{ debugInfo.lastChunksCreated }}
            </p>
            <p class="text-sm text-gray-500" v-else>No processing debug info yet</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button 
            @click="inspectAllChunks" 
            class="btn btn-sm bg-blue-600 text-white hover:bg-blue-700"
          >
            <i class="fas fa-search mr-1"></i> Inspect All Chunks
          </button>
          <button 
            @click="testProcessingSystem" 
            class="btn btn-sm bg-green-600 text-white hover:bg-green-700"
          >
            <i class="fas fa-vial mr-1"></i> Test Processing System
          </button>
        </div>
      </div>
    </div>

    <!-- Desktop Step Navigation -->
    <div class="desktop-step-nav">
      <div class="step-nav-container">
        <div 
          v-for="(stepInfo, index) in steps" 
          :key="index"
          class="step-nav-item"
          :class="{
            'active': currentStep === index + 1,
            'completed': currentStep > index + 1,
            'disabled': !canAccessStep(index + 1)
          }"
          @click="navigateToStep(index + 1)"
        >
          <div class="step-nav-indicator">
            <i v-if="currentStep > index + 1" class="fas fa-check"></i>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <div class="step-nav-content">
            <div class="step-nav-title">{{ stepInfo.title }}</div>
            <div class="step-nav-subtitle">{{ stepInfo.subtitle }}</div>
          </div>
          <div class="step-nav-status">
            <i v-if="getStepStatus(index + 1) === 'processing'" class="fas fa-spinner fa-spin text-gold"></i>
            <i v-else-if="getStepStatus(index + 1) === 'completed'" class="fas fa-check-circle text-sage"></i>
            <i v-else-if="getStepStatus(index + 1) === 'error'" class="fas fa-exclamation-circle text-red-500"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop Step Content -->
    <div class="desktop-step-content">
      <div class="step-content-container">
        <!-- Step 1: Upload -->
        <div v-show="currentStep === 1" class="step-panel">
          <div class="step-panel-header">
            <h2>Upload Documents</h2>
            <p>Select PDF or Markdown files to process into AI-ready chunks</p>
          </div>
          
          <div class="step-panel-content">
            <div 
              class="desktop-drag-zone"
              :class="{ 'drag-active': isDragging }"
              @drop="handleFileDrop"
              @dragover.prevent
              @dragenter="isDragging = true"
              @dragleave="isDragging = false"
            >
              <div class="drag-zone-content">
                <div class="drag-zone-icon">
                  <i class="fas fa-cloud-upload-alt"></i>
                </div>
                <div class="drag-zone-text">
                  <h3>Drop files here or click to upload</h3>
                  <p>Supports PDF and Markdown files up to 50MB each</p>
                </div>
                <button 
                  @click="$refs.fileInput.click()"
                  class="btn-sage"
                >
                  <i class="fas fa-folder-open mr-2"></i>
                  Choose Files
                </button>
              </div>
            </div>
            
            <input 
              ref="fileInput"
              type="file"
              multiple
              accept=".pdf,.md,.markdown"
              @change="handleFileUpload"
              class="hidden"
            >
            
            <!-- File Queue -->
            <div v-if="uploadedFiles.length > 0" class="file-queue">
              <h4 class="queue-title">Uploaded Files ({{ uploadedFiles.length }})</h4>
              <div class="queue-items">
                <div 
                  v-for="file in uploadedFiles" 
                  :key="file.name"
                  class="queue-item"
                >
                  <div class="queue-item-info">
                    <div class="queue-item-name">{{ file.name }}</div>
                    <div class="queue-item-size">{{ formatFileSize(file.size) }}</div>
                  </div>
                  <div class="queue-item-actions">
                    <button 
                      @click="removeFile(file.name)"
                      class="queue-remove-btn"
                      title="Remove file"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="step-panel-footer">
            <div class="step-progress-info">
              {{ uploadedFiles.length }} file{{ uploadedFiles.length !== 1 ? 's' : '' }} uploaded
            </div>
            <button 
              @click="nextStep"
              :disabled="uploadedFiles.length === 0"
              class="btn-sage"
            >
              Configure Processing
              <i class="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>

        <!-- Step 2: Configure -->
        <div v-show="currentStep === 2" class="step-panel">
          <div class="step-panel-header">
            <h2>Configure Processing</h2>
            <p>Set chunking parameters for optimal AI performance</p>
          </div>
          
          <div class="step-panel-content">
            <div class="config-grid">
              <!-- Chunking Method -->
              <div class="config-section">
                <h4>Chunking Method</h4>
                <div class="method-options">
                  <label 
                    v-for="method in chunkingMethods" 
                    :key="method.value"
                    class="method-option"
                    :class="{ active: chunkingOptions.chunkBy === method.value }"
                  >
                    <input 
                      type="radio" 
                      :value="method.value"
                      v-model="chunkingOptions.chunkBy"
                      class="method-radio"
                    >
                    <div class="method-content">
                      <div class="method-title">{{ method.title }}</div>
                      <div class="method-description">{{ method.description }}</div>
                    </div>
                    <div class="method-indicator">
                      <i class="fas fa-check"></i>
                    </div>
                  </label>
                </div>
              </div>
              
              <!-- Chunk Size -->
              <div v-if="chunkingOptions.chunkBy !== 'sections'" class="config-section">
                <h4>Chunk Size</h4>
                <div class="size-controls">
                  <div class="size-slider-container">
                    <input 
                      type="range"
                      :min="getSizeRange().min"
                      :max="getSizeRange().max"
                      :step="getSizeRange().step"
                      v-model.number="chunkingOptions.chunkSize"
                      class="size-slider"
                    >
                    <div class="size-display">
                      <span class="size-value">{{ chunkingOptions.chunkSize }}</span>
                      <span class="size-unit">{{ chunkingOptions.chunkBy }}</span>
                    </div>
                  </div>
                  <div class="size-recommendations">
                    <div class="rec-label">Recommendations:</div>
                    <div class="rec-item optimal">300-800 words optimal</div>
                    <div class="rec-item current" :class="getSizeQuality()">
                      Current: {{ getSizeQuality() }}
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Overlap -->
              <div v-if="chunkingOptions.chunkBy !== 'sections'" class="config-section">
                <h4>Overlap</h4>
                <div class="overlap-controls">
                  <input 
                    type="range"
                    min="0"
                    :max="getMaxOverlap()"
                    :step="getOverlapStep()"
                    v-model.number="chunkingOptions.overlap"
                    class="overlap-slider"
                  >
                  <div class="overlap-display">
                    <span class="overlap-value">{{ chunkingOptions.overlap }}</span>
                    <span class="overlap-percent">({{ getOverlapPercent() }}%)</span>
                  </div>
                </div>
              </div>
              
              <!-- Auto-tagging -->
              <div class="config-section">
                <label class="config-toggle">
                  <input 
                    type="checkbox"
                    v-model="chunkingOptions.autoTag"
                    class="toggle-input"
                  >
                  <div class="toggle-slider"></div>
                  <div class="toggle-content">
                    <div class="toggle-title">Auto-generate Tags</div>
                    <div class="toggle-description">Automatically suggest relevant tags for chunks</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
          
          <div class="step-panel-footer">
            <button 
              @click="previousStep"
              class="btn-sage-outline"
            >
              <i class="fas fa-arrow-left mr-2"></i>
              Back to Upload
            </button>
            <div class="step-progress-info">
              Configuration ready for {{ uploadedFiles.length }} files
            </div>
            <button 
              @click="nextStep"
              class="btn-sage"
            >
              Start Processing
              <i class="fas fa-play ml-2"></i>
            </button>
          </div>
        </div>

        <!-- Step 3: Process -->
        <div v-show="currentStep === 3" class="step-panel">
          <div class="step-panel-header">
            <h2>Processing Documents</h2>
            <p>Converting your files into AI-ready chunks</p>
          </div>
          
          <div class="step-panel-content">
            <div v-if="processing" class="processing-status">
              <div class="processing-overview">
                <div class="processing-stats">
                  <div class="stat-item">
                    <span class="stat-value">{{ processingProgress }}%</span>
                    <span class="stat-label">Complete</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ chunks.length }}</span>
                    <span class="stat-label">Chunks Created</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ processedFileCount }}/{{ uploadedFiles.length }}</span>
                    <span class="stat-label">Files Processed</span>
                  </div>
                </div>
                <div class="processing-bar">
                  <div class="progress-bg">
                    <div 
                      class="progress-fill progress-gold"
                      :style="{ width: processingProgress + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Processing Results -->
            <div v-else-if="hasProcessedFiles" class="processing-results">
              <div class="results-summary">
                <div class="results-icon">
                  <i class="fas fa-check-circle text-sage"></i>
                </div>
                <div class="results-content">
                  <h3>Processing Complete!</h3>
                  <p>Successfully created {{ chunks.length }} chunks from {{ uploadedFiles.length }} files</p>
                </div>
              </div>
              
              <div class="results-stats">
                <div class="stat-card">
                  <div class="stat-number">{{ chunks.length }}</div>
                  <div class="stat-title">Total Chunks</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">{{ avgWordsPerChunk }}</div>
                  <div class="stat-title">Avg Words/Chunk</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">{{ totalWords.toLocaleString() }}</div>
                  <div class="stat-title">Total Words</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">{{ uniqueTags }}</div>
                  <div class="stat-title">Unique Tags</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="step-panel-footer">
            <button 
              @click="previousStep"
              :disabled="processing"
              class="btn-sage-outline"
            >
              <i class="fas fa-arrow-left mr-2"></i>
              Back to Config
            </button>
            <div class="step-progress-info">
              <span v-if="processing">{{ processingStatus }}</span>
              <span v-else-if="hasProcessedFiles">Processing complete</span>
            </div>
            <button 
              v-if="!processing && !hasProcessedFiles"
              @click="processFiles"
              class="btn-sage"
            >
              <i class="fas fa-cog mr-2"></i>
              Process Files
            </button>
            <button 
              v-else-if="hasProcessedFiles"
              @click="nextStep"
              class="btn-sage"
            >
              Review & Export
              <i class="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>

        <!-- Step 4: Review -->
        <div v-show="currentStep === 4" class="step-panel">
          <div class="step-panel-header">
            <h2>Review Chunks</h2>
            <p>Review and edit your processed chunks before export</p>
          </div>
          
          <div class="step-panel-content">
            <!-- Chunk Review Interface -->
            <div class="chunk-review">
              <div class="review-toolbar">
                <div class="review-search">
                  <input 
                    v-model="chunkSearchQuery"
                    type="text"
                    placeholder="Search chunks..."
                    class="search-input focus-sage"
                  >
                  <i class="fas fa-search search-icon"></i>
                </div>
                <div class="review-filters">
                  <button 
                    @click="expandAllChunks"
                    class="filter-btn"
                    title="Expand All (Ctrl+E)"
                  >
                    <i class="fas fa-expand-arrows-alt"></i>
                    Expand All
                  </button>
                  <button 
                    @click="collapseAllChunks"
                    class="filter-btn"
                    title="Collapse All (Ctrl+Shift+E)"
                  >
                    <i class="fas fa-compress-arrows-alt"></i>
                    Collapse All
                  </button>
                </div>
              </div>
              
              <div class="chunk-grid">
                <div 
                  v-for="(chunk, index) in filteredChunks" 
                  :key="chunk.chunk_id"
                  class="chunk-card-desktop"
                >
                  <div class="chunk-header">
                    <div class="chunk-title">
                      <span class="chunk-number">{{ index + 1 }}</span>
                      <span class="chunk-source">{{ chunk.metadata.source }}</span>
                    </div>
                    <div class="chunk-actions">
                      <button 
                        @click="toggleChunkExpanded(index)"
                        class="chunk-expand-btn"
                      >
                        <i :class="expandedChunks.has(index) ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div class="chunk-preview" :class="{ expanded: expandedChunks.has(index) }">
                    {{ chunk.content }}
                  </div>
                  
                  <div class="chunk-meta">
                    <div class="chunk-stats">
                      {{ chunk.metadata.wordCount }} words • {{ chunk.tags.length }} tags
                    </div>
                    <div class="chunk-tags">
                      <span 
                        v-for="tag in chunk.tags.slice(0, 3)" 
                        :key="tag"
                        class="tag-pill-sage"
                      >
                        {{ tag }}
                      </span>
                      <span 
                        v-if="chunk.tags.length > 3" 
                        class="tag-more"
                      >
                        +{{ chunk.tags.length - 3 }} more
                      </span>
                    </div>
                  </div>
                  
                  <div class="chunk-edit">
                    <div class="tag-input-group">
                      <input 
                        v-model="chunk.tagsString"
                        @input="updateChunkTags(chunk)"
                        type="text"
                        placeholder="Add tags..."
                        class="tag-input focus-sage"
                      >
                      <button 
                        @click="suggestTagsForChunk(chunk)"
                        :disabled="!chunk.content"
                        class="tag-suggest-btn btn-sage"
                        title="AI Suggest Tags"
                      >
                        <i class="fas fa-magic"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="step-panel-footer">
            <button 
              @click="previousStep"
              class="btn-sage-outline"
            >
              <i class="fas fa-arrow-left mr-2"></i>
              Back to Processing
            </button>
            <div class="step-progress-info">
              {{ filteredChunks.length }} chunks ready for export
            </div>
            <button 
              @click="nextStep"
              class="btn-sage"
            >
              Export Chunks
              <i class="fas fa-download ml-2"></i>
            </button>
          </div>
        </div>

        <!-- Step 5: Export -->
        <div v-show="currentStep === 5" class="step-panel">
          <div class="step-panel-header">
            <h2>Export for AI Systems</h2>
            <p>Choose your export format and download your processed chunks</p>
          </div>
          
          <div class="step-panel-content">
            <VectorStoreExporter 
              :chunks="chunks" 
              @export-success="handleExportSuccess"
            />
          </div>
          
          <div class="step-panel-footer">
            <button 
              @click="previousStep"
              class="btn-sage-outline"
            >
              <i class="fas fa-arrow-left mr-2"></i>
              Back to Review
            </button>
            <div class="step-progress-info">
              Ready to export {{ chunks.length }} chunks
            </div>
            <button 
              @click="startNewSession"
              class="btn-gold"
            >
              <i class="fas fa-plus mr-2"></i>
              Process More Files
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Command Palette (Ctrl+K) -->
    <div v-if="showCommandPalette" class="command-palette-overlay" @click="showCommandPalette = false">
      <div class="command-palette" @click.stop>
        <div class="command-search">
          <input 
            ref="commandInput"
            v-model="commandQuery"
            type="text"
            placeholder="Type a command..."
            class="command-input"
            @keydown.esc="showCommandPalette = false"
          >
        </div>
        <div class="command-results">
          <div 
            v-for="command in filteredCommands" 
            :key="command.id"
            class="command-item"
            @click="executeCommand(command)"
          >
            <div class="command-icon">
              <i :class="command.icon"></i>
            </div>
            <div class="command-content">
              <div class="command-title">{{ command.title }}</div>
              <div class="command-description">{{ command.description }}</div>
            </div>
            <div class="command-shortcut">{{ command.shortcut }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Keyboard Shortcuts Modal -->
    <KeyboardShortcutsModal 
      :show="showKeyboardShortcuts"
      @close="showKeyboardShortcuts = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import VectorStoreExporter from './VectorStoreExporter.vue'
import KeyboardShortcutsModal from './desktop/KeyboardShortcutsModal.vue'
import { parseMarkdown } from '../utils/markdownParser.js'
import { chunkText, suggestTags } from '../utils/chunker.js'

// Props and Emits
const emit = defineEmits(['export-success'])

// Reactive State
const currentStep = ref(1)
const uploadedFiles = ref([])
const chunks = ref([])
const processing = ref(false)
const processingProgress = ref(0)
const processingStatus = ref('')
const hasProcessedFiles = ref(false)
const processedFileCount = ref(0)
const isDragging = ref(false)
const expandedChunks = ref(new Set())
const chunkSearchQuery = ref('')
const showKeyboardShortcuts = ref(false)
const showBatchHelp = ref(false)
const showCommandPalette = ref(false)
const commandQuery = ref('')

// Debug Panel State (TEMPORARY)
const showDebugPanel = ref(true) // Start visible for debugging
const debugInfo = reactive({
  lastFileName: '',
  lastExtractedLength: 0,
  lastChunksCreated: 0
})

// Debug Methods (TEMPORARY)
const inspectAllChunks = () => {
  console.log('🔍 DEBUG: Desktop - Inspecting All Chunks:', chunks.value)
  chunks.value.forEach((chunk, index) => {
    console.log(`Desktop Chunk ${index}:`, {
      id: chunk.id || chunk.chunk_id,
      content: chunk.content?.substring(0, 100) + '...' || '(empty)',
      source: chunk.source,
      tags: chunk.tags,
      fullChunk: chunk
    })
  })
  
  alert(`Desktop Chunks Inspection:\n- Total: ${chunks.value.length}\n- First chunk: ${chunks.value[0]?.content?.substring(0, 50) || '(none)'}...\nCheck console for details.`)
}

const testProcessingSystem = () => {
  console.log('🔍 DEBUG: Desktop - Testing Processing System:', {
    uploadedFilesCount: uploadedFiles.value.length,
    chunksCount: chunks.value.length,
    currentStep: currentStep.value,
    isProcessing: processing.value,
    hasProcessedFiles: hasProcessedFiles.value
  })
  
  alert(`Desktop Processing System Test:\n- Files: ${uploadedFiles.value.length}\n- Chunks: ${chunks.value.length}\n- Step: ${currentStep.value}\n- Processing: ${processing.value}\nCheck console for details.`)
}

// Chunking Options
const chunkingOptions = ref({
  chunkBy: 'words',
  chunkSize: 500,
  overlap: 50,
  autoTag: true
})

// Step Configuration
const steps = [
  { title: 'Upload', subtitle: 'Select documents' },
  { title: 'Configure', subtitle: 'Set parameters' },
  { title: 'Process', subtitle: 'Generate chunks' },
  { title: 'Review', subtitle: 'Edit & validate' },
  { title: 'Export', subtitle: 'Download results' }
]

const chunkingMethods = [
  { 
    value: 'words', 
    title: 'Word-based', 
    description: 'Split by word count (recommended)' 
  },
  { 
    value: 'characters', 
    title: 'Character-based', 
    description: 'Split by character count (precise)' 
  },
  { 
    value: 'sections', 
    title: 'Section-based', 
    description: 'Split by markdown headers (semantic)' 
  }
]

// Command Palette Commands
const commands = ref([
  { id: 'upload', title: 'Upload Files', description: 'Add new files to process', icon: 'fas fa-upload', shortcut: 'Ctrl+U' },
  { id: 'process', title: 'Process Files', description: 'Start processing uploaded files', icon: 'fas fa-cog', shortcut: 'Ctrl+P' },
  { id: 'clear', title: 'Clear All', description: 'Remove all files and chunks', icon: 'fas fa-trash', shortcut: 'Ctrl+Shift+C' },
  { id: 'expand-all', title: 'Expand All Chunks', description: 'Show full content of all chunks', icon: 'fas fa-expand', shortcut: 'Ctrl+E' },
  { id: 'collapse-all', title: 'Collapse All Chunks', description: 'Hide content of all chunks', icon: 'fas fa-compress', shortcut: 'Ctrl+Shift+E' },
  { id: 'help', title: 'Show Help', description: 'Display keyboard shortcuts', icon: 'fas fa-question', shortcut: '?' }
])

// Computed Properties
const filteredChunks = computed(() => {
  if (!chunkSearchQuery.value) return chunks.value
  const query = chunkSearchQuery.value.toLowerCase()
  return chunks.value.filter(chunk => 
    chunk.content.toLowerCase().includes(query) ||
    chunk.tags.some(tag => tag.toLowerCase().includes(query))
  )
})

const filteredCommands = computed(() => {
  if (!commandQuery.value) return commands.value
  const query = commandQuery.value.toLowerCase()
  return commands.value.filter(cmd => 
    cmd.title.toLowerCase().includes(query) ||
    cmd.description.toLowerCase().includes(query)
  )
})

const avgWordsPerChunk = computed(() => {
  if (chunks.value.length === 0) return 0
  const totalWords = chunks.value.reduce((sum, chunk) => sum + (chunk.metadata.wordCount || 0), 0)
  return Math.round(totalWords / chunks.value.length)
})

const totalWords = computed(() => {
  return chunks.value.reduce((sum, chunk) => sum + (chunk.metadata.wordCount || 0), 0)
})

const uniqueTags = computed(() => {
  const allTags = chunks.value.flatMap(chunk => chunk.tags || [])
  return new Set(allTags).size
})

// Methods
const canAccessStep = (step: number) => {
  if (step === 1) return true
  if (step === 2) return uploadedFiles.value.length > 0
  if (step === 3) return uploadedFiles.value.length > 0
  if (step === 4) return hasProcessedFiles.value
  if (step === 5) return chunks.value.length > 0
  return false
}

const navigateToStep = (step: number) => {
  if (canAccessStep(step)) {
    currentStep.value = step
  }
}

const nextStep = () => {
  if (currentStep.value < 5) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const getStepStatus = (step: number) => {
  if (step === 3 && processing.value) return 'processing'
  if (step <= currentStep.value - 1 || hasProcessedFiles.value) return 'completed'
  return 'pending'
}

const handleFileDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
  const files = Array.from(event.dataTransfer?.files || [])
  processUploadedFiles(files)
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  processUploadedFiles(files)
}

const processUploadedFiles = (files: File[]) => {
  uploadedFiles.value = [...uploadedFiles.value, ...files]
}

const removeFile = (filename: string) => {
  uploadedFiles.value = uploadedFiles.value.filter(f => f.name !== filename)
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB'
  return Math.round(bytes / (1024 * 1024)) + ' MB'
}

const getSizeRange = () => {
  if (chunkingOptions.value.chunkBy === 'words') {
    return { min: 50, max: 2000, step: 50 }
  }
  return { min: 200, max: 8000, step: 200 }
}

const getSizeQuality = () => {
  const size = chunkingOptions.value.chunkSize
  const isWords = chunkingOptions.value.chunkBy === 'words'
  
  if (isWords) {
    if (size >= 300 && size <= 800) return 'optimal'
    if (size >= 200 && size <= 1200) return 'good'
    return 'needs-adjustment'
  } else {
    if (size >= 1500 && size <= 3000) return 'optimal'
    if (size >= 1000 && size <= 4000) return 'good'
    return 'needs-adjustment'
  }
}

const getMaxOverlap = () => {
  return Math.floor(chunkingOptions.value.chunkSize * 0.5)
}

const getOverlapStep = () => {
  return chunkingOptions.value.chunkBy === 'words' ? 10 : 50
}

const getOverlapPercent = () => {
  return Math.round((chunkingOptions.value.overlap / chunkingOptions.value.chunkSize) * 100)
}

const processFiles = async () => {
  processing.value = true
  processingProgress.value = 0
  processedFileCount.value = 0
  chunks.value = []

  for (let i = 0; i < uploadedFiles.value.length; i++) {
    const file = uploadedFiles.value[i]
    processingStatus.value = `Processing ${file.name}...`
    
    try {
      let content = ''
      
      // Capture debug info
      debugInfo.lastFileName = file.name
      console.log('🔍 DEBUG: Desktop - Starting to process file:', file.name)
      
      // Real file processing (not demo!)
      if (file.type === 'application/pdf') {
        // Process PDF files
        const { parsePdf } = await import('../utils/pdfParser.js')
        const buffer = await file.arrayBuffer()
        const pdfData = await parsePdf(buffer)
        content = pdfData.text
        debugInfo.lastExtractedLength = content.length
        console.log('🔍 DEBUG: Desktop - PDF text extracted:', {
          fileName: file.name,
          textLength: content.length,
          textPreview: content.substring(0, 200) + '...'
        })
      } else if (file.name.toLowerCase().endsWith('.md') || file.name.toLowerCase().endsWith('.markdown')) {
        // Process Markdown files
        const text = await file.text()
        const parsedData = parseMarkdown(text)
        content = parsedData.content
        debugInfo.lastExtractedLength = content.length
        console.log('🔍 DEBUG: Desktop - Markdown parsed:', {
          fileName: file.name,
          textLength: content.length,
          textPreview: content.substring(0, 200) + '...'
        })
      } else {
        // Handle other text files
        content = await file.text()
        debugInfo.lastExtractedLength = content.length
        console.log('🔍 DEBUG: Desktop - Text file read:', {
          fileName: file.name,
          textLength: content.length,
          textPreview: content.substring(0, 200) + '...'
        })
      }
      
      // Validate content
      if (!content || content.trim().length < 10) {
        throw new Error(`File appears to be empty or contains very little text: ${file.name}`)
      }
      
      // Create chunks from real content
      const fileChunks = chunkText(content, file.name, chunkingOptions.value)
      
      // Capture debug info for chunks
      debugInfo.lastChunksCreated = fileChunks.length
      console.log('🔍 DEBUG: Desktop - Chunks created:', {
        fileName: file.name,
        chunksCount: fileChunks.length,
        firstChunkContent: fileChunks[0]?.content?.substring(0, 200) + '...' || 'No content',
        firstChunkFull: fileChunks[0]
      })
      
      chunks.value.push(...fileChunks)
      
      processedFileCount.value++
      processingProgress.value = Math.round((processedFileCount.value / uploadedFiles.value.length) * 100)
      
    } catch (error) {
      console.error(`🔍 DEBUG: Desktop - Error processing ${file.name}:`, error)
      // Continue with next file instead of failing completely
    }
  }

  processing.value = false
  hasProcessedFiles.value = true
  processingStatus.value = 'Processing complete'
  
  console.log('🔍 DEBUG: Desktop - Final processing complete:', {
    totalFiles: uploadedFiles.value.length,
    totalChunks: chunks.value.length,
    allChunks: chunks.value
  })
}

const toggleChunkExpanded = (index: number) => {
  if (expandedChunks.value.has(index)) {
    expandedChunks.value.delete(index)
  } else {
    expandedChunks.value.add(index)
  }
}

const expandAllChunks = () => {
  expandedChunks.value = new Set(Array.from({ length: chunks.value.length }, (_, i) => i))
}

const collapseAllChunks = () => {
  expandedChunks.value.clear()
}

const updateChunkTags = (chunk: any) => {
  chunk.tags = chunk.tagsString
    .split(',')
    .map((tag: string) => tag.trim())
    .filter((tag: string) => tag.length > 0)
}

const suggestTagsForChunk = (chunk: any) => {
  const suggestions = suggestTags(chunk.content)
  const existingTags = chunk.tags || []
  const newTags = suggestions.filter(tag => !existingTags.includes(tag))
  chunk.tags = [...existingTags, ...newTags.slice(0, 3)]
  chunk.tagsString = chunk.tags.join(', ')
}

const clearAll = () => {
  uploadedFiles.value = []
  chunks.value = []
  currentStep.value = 1
  hasProcessedFiles.value = false
  expandedChunks.value.clear()
}

const startNewSession = () => {
  clearAll()
}

const handleExportSuccess = (data: any) => {
  emit('export-success', data)
}

const executeCommand = (command: any) => {
  showCommandPalette.value = false
  commandQuery.value = ''
  
  switch (command.id) {
    case 'upload':
      if (currentStep.value === 1) {
        document.querySelector('input[type="file"]')?.click()
      }
      break
    case 'process':
      if (currentStep.value === 3 && !processing.value) {
        processFiles()
      }
      break
    case 'clear':
      clearAll()
      break
    case 'expand-all':
      expandAllChunks()
      break
    case 'collapse-all':
      collapseAllChunks()
      break
    case 'help':
      showKeyboardShortcuts.value = true
      break
  }
}

// Keyboard Shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  // Command Palette
  if (event.ctrlKey && event.key === 'k') {
    event.preventDefault()
    showCommandPalette.value = true
    nextTick(() => {
      const input = document.querySelector('.command-input') as HTMLInputElement
      input?.focus()
    })
    return
  }

  // Help
  if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
    if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
      event.preventDefault()
      showKeyboardShortcuts.value = true
    }
    return
  }

  // Other shortcuts
  if (event.ctrlKey) {
    switch (event.key) {
      case 'u':
        event.preventDefault()
        if (currentStep.value === 1) {
          document.querySelector('input[type="file"]')?.click()
        }
        break
      case 'p':
        event.preventDefault()
        if (currentStep.value === 3 && !processing.value) {
          processFiles()
        }
        break
      case 'e':
        event.preventDefault()
        if (event.shiftKey) {
          collapseAllChunks()
        } else {
          expandAllChunks()
        }
        break
    }
  }

  if (event.ctrlKey && event.shiftKey && event.key === 'C') {
    event.preventDefault()
    clearAll()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.desktop-document-processor {
  min-height: 100vh;
  background: linear-gradient(135deg, #fafafa 0%, #f5f7f4 100%);
  padding: 2rem;
  font-family: 'Inter', sans-serif;
}

.desktop-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(168, 183, 157, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  margin-bottom: 2rem;
}

.desktop-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.desktop-header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.desktop-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #A8B79D 0%, #D4AF37 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 32px rgba(168, 183, 157, 0.3);
}

.desktop-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  background: linear-gradient(135deg, #A8B79D 0%, #D4AF37 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.desktop-breadcrumbs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
}

.breadcrumb-item.active {
  color: #A8B79D;
  font-weight: 600;
}

.breadcrumb-separator {
  color: #cbd5e1;
  font-size: 0.75rem;
}

.desktop-header-actions {
  display: flex;
  gap: 1rem;
}

.desktop-action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.desktop-action-btn.secondary {
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid #e2e8f0;
  color: #334155;
}

.desktop-action-btn.secondary:hover {
  background: rgba(168, 183, 157, 0.1);
  border-color: #A8B79D;
  transform: translateY(-1px);
}

.desktop-action-btn.danger {
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #dc2626;
}

.desktop-action-btn.danger:hover:not(:disabled) {
  background: rgba(248, 113, 113, 0.2);
  border-color: #dc2626;
  transform: translateY(-1px);
}

.desktop-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Desktop Step Navigation */
.desktop-step-nav {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(168, 183, 157, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.step-nav-container {
  display: flex;
  justify-content: space-between;
  max-width: 1000px;
  margin: 0 auto;
}

.step-nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
  min-width: 180px;
}

.step-nav-item:hover:not(.disabled) {
  background: rgba(168, 183, 157, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(168, 183, 157, 0.2);
}

.step-nav-item.active {
  background: linear-gradient(135deg, rgba(168, 183, 157, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(168, 183, 157, 0.3);
}

.step-nav-item.completed {
  background: rgba(34, 197, 94, 0.1);
}

.step-nav-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.step-nav-indicator {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  background: linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%);
  color: white;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.step-nav-item.active .step-nav-indicator {
  background: linear-gradient(135deg, #A8B79D 0%, #8CA085 100%);
  transform: scale(1.1);
  box-shadow: 0 8px 24px rgba(168, 183, 157, 0.4);
}

.step-nav-item.completed .step-nav-indicator {
  background: linear-gradient(135deg, #8CA085 0%, #22C55E 100%);
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.3);
}

.step-nav-content {
  flex: 1;
}

.step-nav-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.step-nav-subtitle {
  font-size: 0.875rem;
  color: #64748b;
}

.step-nav-status {
  width: 24px;
  display: flex;
  justify-content: center;
}

/* Step Content */
.desktop-step-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(168, 183, 157, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.step-content-container {
  min-height: 600px;
}

.step-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.step-panel-header {
  padding: 2rem 2rem 1rem 2rem;
  background: linear-gradient(135deg, rgba(245, 247, 244, 0.8) 0%, rgba(255, 255, 255, 0.9) 100%);
  border-bottom: 1px solid rgba(168, 183, 157, 0.1);
}

.step-panel-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.step-panel-header p {
  font-size: 1rem;
  color: #64748b;
  margin: 0;
}

.step-panel-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.step-panel-footer {
  padding: 1.5rem 2rem;
  background: rgba(248, 250, 252, 0.8);
  border-top: 1px solid rgba(168, 183, 157, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-progress-info {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

/* Drag Zone */
.desktop-drag-zone {
  border: 3px dashed rgba(168, 183, 157, 0.4);
  border-radius: 20px;
  padding: 4rem 2rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  margin-bottom: 2rem;
}

.desktop-drag-zone:hover,
.desktop-drag-zone.drag-active {
  border-color: #D4AF37;
  border-width: 3px;
  background: rgba(255, 255, 255, 0.95);
  transform: scale(1.01);
  box-shadow: 0 16px 48px rgba(212, 175, 55, 0.2);
}

.drag-zone-icon {
  font-size: 4rem;
  color: #A8B79D;
  margin-bottom: 1.5rem;
}

.drag-zone-text h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.drag-zone-text p {
  color: #64748b;
  margin-bottom: 2rem;
}

/* File Queue */
.file-queue {
  margin-top: 2rem;
}

.queue-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
}

.queue-items {
  display: grid;
  gap: 0.75rem;
}

.queue-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid rgba(168, 183, 157, 0.2);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.queue-item:hover {
  background: rgba(168, 183, 157, 0.1);
  border-color: #A8B79D;
  transform: translateY(-1px);
}

.queue-item-name {
  font-weight: 600;
  color: #1e293b;
}

.queue-item-size {
  font-size: 0.875rem;
  color: #64748b;
}

.queue-remove-btn {
  padding: 0.5rem;
  border: none;
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.queue-remove-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: scale(1.05);
}

/* Configuration Grid */
.config-grid {
  display: grid;
  gap: 2rem;
}

.config-section {
  background: rgba(248, 250, 252, 0.6);
  border: 1px solid rgba(168, 183, 157, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
}

.config-section h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
}

/* Method Options */
.method-options {
  display: grid;
  gap: 1rem;
}

.method-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid rgba(168, 183, 157, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.method-option:hover {
  border-color: #A8B79D;
  background: rgba(168, 183, 157, 0.05);
}

.method-option.active {
  border-color: #A8B79D;
  background: rgba(168, 183, 157, 0.1);
}

.method-radio {
  width: 20px;
  height: 20px;
}

.method-content {
  flex: 1;
}

.method-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.method-description {
  font-size: 0.875rem;
  color: #64748b;
}

.method-indicator {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #A8B79D;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.method-option.active .method-indicator {
  opacity: 1;
}

/* Size Controls */
.size-controls {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.size-slider-container {
  flex: 1;
}

.size-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: rgba(168, 183, 157, 0.2);
  outline: none;
  margin-bottom: 1rem;
  -webkit-appearance: none;
}

.size-slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #A8B79D;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(168, 183, 157, 0.4);
}

.size-display {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.size-value {
  color: #A8B79D;
}

.size-unit {
  color: #64748b;
  font-size: 0.875rem;
}

.size-recommendations {
  min-width: 200px;
}

.rec-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.rec-item {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  margin-bottom: 0.25rem;
}

.rec-item.optimal {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.rec-item.current.optimal {
  background: rgba(34, 197, 94, 0.2);
  color: #16a34a;
  font-weight: 600;
}

.rec-item.current.good {
  background: rgba(168, 183, 157, 0.2);
  color: #A8B79D;
  font-weight: 600;
}

.rec-item.current.needs-adjustment {
  background: rgba(249, 115, 22, 0.2);
  color: #ea580c;
  font-weight: 600;
}

/* Toggle */
.config-toggle {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
}

.toggle-input {
  display: none;
}

.toggle-slider {
  width: 48px;
  height: 24px;
  background: rgba(168, 183, 157, 0.3);
  border-radius: 12px;
  position: relative;
  transition: all 0.3s ease;
}

.toggle-slider::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-input:checked + .toggle-slider {
  background: #A8B79D;
}

.toggle-input:checked + .toggle-slider::after {
  transform: translateX(24px);
}

.toggle-content {
  flex: 1;
}

.toggle-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.toggle-description {
  font-size: 0.875rem;
  color: #64748b;
}

/* Processing Status */
.processing-status {
  text-align: center;
  padding: 3rem 0;
}

.processing-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #A8B79D;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
}

.processing-bar {
  max-width: 400px;
  margin: 0 auto;
}

.progress-bg {
  width: 100%;
  height: 8px;
  background: rgba(168, 183, 157, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;
}

.processing-results {
  text-align: center;
  padding: 2rem 0;
}

.results-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.results-icon {
  font-size: 3rem;
}

.results-content h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.results-content p {
  color: #64748b;
}

.results-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.stat-card {
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid rgba(168, 183, 157, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(168, 183, 157, 0.2);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #A8B79D;
  margin-bottom: 0.5rem;
}

.stat-title {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 600;
}

/* Chunk Review */
.chunk-review {
  max-height: 600px;
  overflow-y: auto;
}

.review-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(168, 183, 157, 0.2);
}

.review-search {
  position: relative;
  flex: 1;
  max-width: 300px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 2px solid rgba(168, 183, 157, 0.2);
  border-radius: 12px;
  background: white;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #A8B79D;
  box-shadow: 0 0 0 3px rgba(168, 183, 157, 0.1);
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.review-filters {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid rgba(168, 183, 157, 0.2);
  border-radius: 8px;
  font-size: 0.875rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: rgba(168, 183, 157, 0.1);
  border-color: #A8B79D;
  color: #A8B79D;
}

/* Chunk Grid */
.chunk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1rem;
}

.chunk-card-desktop {
  background: white;
  border: 1px solid rgba(168, 183, 157, 0.2);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.chunk-card-desktop:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(168, 183, 157, 0.2);
  border-color: #A8B79D;
}

.chunk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(248, 250, 252, 0.8);
  border-bottom: 1px solid rgba(168, 183, 157, 0.1);
}

.chunk-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.chunk-number {
  background: #A8B79D;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  min-width: 24px;
  text-align: center;
}

.chunk-source {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
}

.chunk-expand-btn {
  padding: 0.5rem;
  background: transparent;
  border: 1px solid rgba(168, 183, 157, 0.3);
  border-radius: 8px;
  color: #A8B79D;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chunk-expand-btn:hover {
  background: rgba(168, 183, 157, 0.1);
  border-color: #A8B79D;
}

.chunk-preview {
  padding: 1rem;
  font-size: 0.875rem;
  line-height: 1.6;
  color: #374151;
  max-height: 120px;
  overflow: hidden;
  position: relative;
}

.chunk-preview.expanded {
  max-height: none;
}

.chunk-preview:not(.expanded)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(transparent, white);
}

.chunk-meta {
  padding: 1rem;
  background: rgba(248, 250, 252, 0.5);
  border-top: 1px solid rgba(168, 183, 157, 0.1);
}

.chunk-stats {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-bottom: 0.75rem;
}

.chunk-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-pill-sage {
  background: rgba(168, 183, 157, 0.2);
  color: #5A7354;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}

.tag-more {
  font-size: 0.75rem;
  color: #9ca3af;
  font-style: italic;
}

.chunk-edit {
  padding: 1rem;
}

.tag-input-group {
  display: flex;
  gap: 0.5rem;
}

.tag-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 2px solid rgba(168, 183, 157, 0.2);
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.tag-input:focus {
  outline: none;
  border-color: #A8B79D;
  box-shadow: 0 0 0 3px rgba(168, 183, 157, 0.1);
}

.tag-suggest-btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  white-space: nowrap;
}

/* Command Palette */
.command-palette-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 20vh;
  z-index: 1000;
}

.command-palette {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 500px;
  max-height: 400px;
  overflow: hidden;
}

.command-search {
  padding: 1rem;
  border-bottom: 1px solid rgba(168, 183, 157, 0.2);
}

.command-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid rgba(168, 183, 157, 0.2);
  border-radius: 12px;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s ease;
}

.command-input:focus {
  border-color: #A8B79D;
  box-shadow: 0 0 0 3px rgba(168, 183, 157, 0.1);
}

.command-results {
  max-height: 300px;
  overflow-y: auto;
}

.command-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(168, 183, 157, 0.1);
}

.command-item:hover {
  background: rgba(168, 183, 157, 0.1);
}

.command-item:last-child {
  border-bottom: none;
}

.command-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(168, 183, 157, 0.1);
  color: #A8B79D;
  display: flex;
  align-items: center;
  justify-content: center;
}

.command-content {
  flex: 1;
}

.command-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.command-description {
  font-size: 0.875rem;
  color: #64748b;
}

.command-shortcut {
  font-size: 0.75rem;
  color: #9ca3af;
  background: rgba(248, 250, 252, 0.8);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
}

.hidden {
  display: none;
}

@media (max-width: 1200px) {
  .step-nav-container {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .step-nav-item {
    min-width: auto;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .desktop-document-processor {
    padding: 1rem;
  }
  
  .desktop-header-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .desktop-title {
    font-size: 2rem;
  }
  
  .config-grid {
    gap: 1rem;
  }
  
  .chunk-grid {
    grid-template-columns: 1fr;
  }
  
  .size-controls {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>