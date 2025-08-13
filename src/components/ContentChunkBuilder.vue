<template>
  <div class="content-chunk-builder min-h-screen" style="background: linear-gradient(135deg, #fafafa 0%, #f5f7f4 100%);">
    <div class="desktop-content-container">
      <!-- Header Section -->
      <div class="desktop-header">
        <div class="header-content">
          <div class="title-section">
            <div class="title-icon">
              <svg viewBox="0 0 24 24" fill="none" class="section-icon">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" fill="currentColor"/>
              </svg>
            </div>
            <div class="title-text">
              <h1 class="desktop-title">Manual Content Builder</h1>
              <p class="desktop-subtitle">Create AI-ready content chunks manually with professional precision</p>
            </div>
          </div>
          <button 
            @click="showShortcutsHelp = true"
            class="desktop-action-button secondary"
            title="View keyboard shortcuts (?)"
          >
            <i class="fas fa-keyboard"></i>
            <span>Shortcuts</span>
            <span class="opacity-70">?</span>
          </button>
        </div>
      </div>

      <!-- Progress Steps -->
      <div class="desktop-progress-container">
        <div class="desktop-progress-steps">
          <div class="progress-step">
            <div 
              :class="[
                'desktop-step-indicator',
                currentStep >= 1 
                  ? (currentStep === 1 ? 'desktop-step-active' : 'desktop-step-completed') 
                  : 'desktop-step-inactive'
              ]"
            >
              1
            </div>
            <span class="desktop-step-label">Create</span>
          </div>
          <div class="desktop-step-line" :class="{ 'desktop-step-line-completed': currentStep >= 2 }"></div>
          <div class="progress-step">
            <div 
              :class="[
                'desktop-step-indicator',
                currentStep >= 2 
                  ? (currentStep === 2 ? 'desktop-step-active' : 'desktop-step-completed') 
                  : 'desktop-step-inactive'
              ]"
            >
              2
            </div>
            <span class="desktop-step-label">Review</span>
          </div>
          <div class="desktop-step-line" :class="{ 'desktop-step-line-completed': currentStep >= 3 }"></div>
          <div class="progress-step">
            <div 
              :class="[
                'desktop-step-indicator',
                currentStep >= 3 
                  ? (currentStep === 3 ? 'desktop-step-active' : 'desktop-step-completed') 
                  : 'desktop-step-inactive'
              ]"
            >
              3
            </div>
            <span class="desktop-step-label">Export</span>
          </div>
        </div>
      </div>

      <!-- Step 1: Add Content -->
      <div class="desktop-card">
        <div class="desktop-card-header">
          <h2 class="desktop-card-title">
            Add Your Content
          </h2>
        </div>
        
        <!-- Content Input Form -->
        <div class="desktop-form-section">
          <div class="desktop-form-body">
              <h3 class="desktop-form-title">Enter Complete Content</h3>
              <p class="desktop-form-subtitle">
                Paste or type your full content below. The system will automatically break it into optimal chunks and suggest tags.
              </p>
          
              <div class="space-y-8">
                <!-- Source/Title using FormField component -->
                <FormField
                  v-model="contentForm.source"
                  label="Source/Title"
                  placeholder="e.g., User Manual, Product Guide, FAQ Section, Documentation"
                  :validation-state="sourceInteracted && sourceValidation?.isValid === false ? 'error' : (sourceInteracted && sourceValidation?.isValid === true ? 'success' : null)"
                  :error-message="sourceInteracted ? sourceValidation?.errors?.[0] : null"
                  success-message="Source title looks good"
                  show-char-count
                  @blur="validateSource"
                  @input="clearSourceValidation"
                />
                
                <!-- Content Input using FormField component -->
                <FormField
                  v-model="contentForm.content"
                  type="textarea"
                  label="Content"
                  placeholder="Paste your full content here. This can be a complete article, documentation section, FAQ, or any other text content. The system will automatically break it into optimal chunks for AI processing..."
                  :rows="12"
                  :validation-state="contentInteracted && contentValidation?.isValid === false ? 'error' : (contentInteracted && contentValidation?.isValid === true ? 'success' : null)"
                  :error-message="contentInteracted ? contentValidation?.errors?.[0] : null"
                  success-message="Content is ready for processing"
                  show-char-count
                  @input="updateContentStats"
                  @blur="validateContent"
                />
              
                <!-- Collapsible Content Statistics -->
                <div class="border rounded-lg">
                  <button 
                    @click="showContentStats = !showContentStats"
                    class="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-25 transition-colors"
                  >
                    <div class="flex items-center space-x-3">
                      <div class="text-sm font-medium text-neutral-800">Content Statistics</div>
                      <div v-if="contentForm.stats.wordCount > 0" class="flex items-center space-x-4 text-xs text-neutral-600">
                        <span>{{ contentForm.stats.wordCount }} words</span>
                        <span>{{ contentForm.stats.estimatedChunks }} chunks</span>
                      </div>
                    </div>
                    <svg 
                      class="w-5 h-5 text-neutral-600 transition-transform duration-200"
                      :class="{ 'rotate-180': showContentStats }"
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  
                  <div v-show="showContentStats" class="px-4 pb-4 border-t bg-neutral-25">
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 mb-4">
                      <div class="text-center">
                        <div class="text-2xl font-bold text-primary-600">{{ contentForm.stats.wordCount }}</div>
                        <div class="text-sm text-neutral-600">Words</div>
                      </div>
                      <div class="text-center">
                        <div class="text-2xl font-bold text-primary-600">{{ contentForm.stats.charCount }}</div>
                        <div class="text-sm text-neutral-600">Characters</div>
                      </div>
                      <div class="text-center">
                        <div class="text-2xl font-bold text-primary-600">{{ contentForm.stats.estimatedChunks }}</div>
                        <div class="text-sm text-neutral-600">Est. Chunks</div>
                      </div>
                    </div>
                    
                    <!-- Content quality indicator -->
                    <div v-if="contentForm.stats.wordCount > 0" class="flex justify-center">
                      <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" 
                           :class="{
                             'bg-error-100 text-error-800': contentForm.stats.wordCount < 50,
                             'bg-warning-100 text-warning-800': contentForm.stats.wordCount >= 50 && contentForm.stats.wordCount < 100,
                             'bg-primary-100 text-primary-800': contentForm.stats.wordCount >= 100 && contentForm.stats.wordCount < 500,
                             'bg-success-100 text-success-800': contentForm.stats.wordCount >= 500
                           }">
                        <i class="mr-2" :class="{
                          'fas fa-exclamation-triangle': contentForm.stats.wordCount < 50,
                          'fas fa-exclamation-circle': contentForm.stats.wordCount >= 50 && contentForm.stats.wordCount < 100,
                          'fas fa-info-circle': contentForm.stats.wordCount >= 100 && contentForm.stats.wordCount < 500,
                          'fas fa-check-circle': contentForm.stats.wordCount >= 500
                        }"></i>
                        <span v-if="contentForm.stats.wordCount < 50">Too short</span>
                        <span v-else-if="contentForm.stats.wordCount < 100">Very short</span>
                        <span v-else-if="contentForm.stats.wordCount < 500">Good length</span>
                        <span v-else>Excellent</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Chunking Options (Progressive Disclosure) -->
                <div class="bg-neutral-50 border border-neutral-200 p-4 rounded-lg">
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="text-sm font-semibold text-neutral-900">Chunking Settings</h4>
                    <button 
                      @click="showAdvancedChunking = !showAdvancedChunking"
                      class="btn btn-ghost btn-sm"
                      :aria-expanded="showAdvancedChunking"
                      aria-controls="advanced-chunking"
                    >
                      <i :class="showAdvancedChunking ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="mr-1"></i>
                      {{ showAdvancedChunking ? 'Hide Advanced' : 'Show Advanced' }}
                    </button>
                  </div>
              
                  <!-- Always visible basic setting -->
                  <div class="mb-4">
                    <label class="flex items-center space-x-3 cursor-pointer">
                      <input 
                        v-model="chunkingOptions.autoTag"
                        type="checkbox" 
                        class="form-checkbox"
                      />
                      <span class="text-sm text-neutral-700 font-medium">Generate tags automatically</span>
                      <span class="badge badge-primary text-xs">Recommended</span>
                    </label>
                  </div>
              
                  <!-- Advanced settings (collapsed by default) -->
                  <div 
                    v-show="showAdvancedChunking" 
                    id="advanced-chunking"
                    class="space-y-4 animate-fade-in"
                  >
                    <div class="bg-primary-50 border border-primary-200 rounded-lg p-3">
                      <div class="flex items-start space-x-2">
                        <i class="fas fa-info-circle text-primary-600 mt-0.5 flex-shrink-0"></i>
                        <div class="text-xs text-primary-800">
                          <strong>Advanced settings</strong> for fine-tuning chunk size and overlap. Default settings work well for most content.
                        </div>
                      </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        v-model="chunkingOptions.chunkSize"
                        type="select"
                        label="Chunk Size"
                        :options="[
                          { value: 300, label: 'Small (300 words)' },
                          { value: 500, label: 'Medium (500 words) - Recommended' },
                          { value: 800, label: 'Large (800 words)' }
                        ]"
                        size="sm"
                      />
                      <FormField
                        v-model="chunkingOptions.overlap"
                        type="select"
                        label="Overlap"
                        :options="[
                          { value: 25, label: 'Low (25 words)' },
                          { value: 50, label: 'Medium (50 words) - Recommended' },
                          { value: 100, label: 'High (100 words)' }
                        ]"
                        size="sm"
                      />
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 pt-4 border-t border-neutral-200">
                  <div class="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <div class="text-sm text-neutral-600">
                      {{ processedContents.length }} content pieces processed
                    </div>
                    <div v-if="lastSaved" class="flex items-center text-xs text-neutral-500">
                      <i class="fas fa-save mr-1"></i>
                      Saved {{ formatTimeAgo(lastSaved) }}
                    </div>
                  </div>
                  <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                    <button 
                      @click="clearForm"
                      class="desktop-action-button secondary"
                      :title="`Clear Form (${formatShortcut(SHORTCUTS.CLEAR_FORM)})`"
                    >
                      <span>Clear Form</span>
                      <span class="desktop-shortcut">{{ formatShortcut(SHORTCUTS.CLEAR_FORM) }}</span>
                    </button>
                    <button 
                      @click="processContent"
                      :disabled="!canProcessContent || processing"
                      class="desktop-action-button primary"
                      :title="`Process Content (${formatShortcut(SHORTCUTS.PROCESS_CONTENT)})`"
                    >
                      <i :class="processing ? 'fas fa-cog fa-spin' : 'fas fa-magic'"></i>
                      <span>{{ processing ? 'Processing...' : 'Process Content' }}</span>
                      <span v-if="!processing" class="desktop-shortcut">{{ formatShortcut(SHORTCUTS.PROCESS_CONTENT) }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        <!-- DEBUG PANEL - TEMPORARY -->
        <div v-if="showDebugPanel" class="desktop-card mb-6 border-2 border-yellow-400 bg-yellow-50">
          <div class="desktop-card-header bg-yellow-100">
            <h3 class="text-lg font-bold text-yellow-800">🔍 Debug Panel (Temporary)</h3>
            <button 
              @click="showDebugPanel = false" 
              class="text-yellow-600 hover:text-yellow-800"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="p-4 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <h4 class="font-semibold text-yellow-700 mb-2">Content Form:</h4>
                <div class="bg-white p-3 rounded border border-yellow-300">
                  <p class="text-sm"><strong>Source:</strong> {{ contentForm.source || '(empty)' }}</p>
                  <p class="text-sm"><strong>Content Length:</strong> {{ contentForm.content?.length || 0 }} chars</p>
                  <p class="text-sm"><strong>Content Preview:</strong></p>
                  <div class="bg-gray-100 p-2 rounded mt-1 text-xs font-mono overflow-x-auto">
                    {{ contentForm.content ? contentForm.content.substring(0, 200) + '...' : '(no content)' }}
                  </div>
                </div>
              </div>
              <div>
                <h4 class="font-semibold text-yellow-700 mb-2">Chunks in Store:</h4>
                <div class="bg-white p-3 rounded border border-yellow-300">
                  <p class="text-sm"><strong>Total Chunks:</strong> {{ chunks.length }}</p>
                  <p class="text-sm"><strong>First Chunk Content:</strong></p>
                  <div class="bg-gray-100 p-2 rounded mt-1 text-xs font-mono overflow-x-auto">
                    {{ chunks[0]?.content ? chunks[0].content.substring(0, 200) + '...' : '(no chunks)' }}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 class="font-semibold text-yellow-700 mb-2">Last Processing Result:</h4>
              <div class="bg-white p-3 rounded border border-yellow-300">
                <p class="text-sm" v-if="debugLastProcessing.timestamp">
                  <strong>Time:</strong> {{ new Date(debugLastProcessing.timestamp).toLocaleTimeString() }}
                </p>
                <p class="text-sm" v-if="debugLastProcessing.input">
                  <strong>Input Preview:</strong> {{ debugLastProcessing.input }}
                </p>
                <p class="text-sm" v-if="debugLastProcessing.output">
                  <strong>Output Preview:</strong> {{ debugLastProcessing.output }}
                </p>
                <p class="text-sm" v-if="debugLastProcessing.chunksCreated !== undefined">
                  <strong>Chunks Created:</strong> {{ debugLastProcessing.chunksCreated }}
                </p>
                <p class="text-sm text-gray-500" v-else>No processing done yet</p>
              </div>
            </div>
            <div class="flex gap-2">
              <button 
                @click="clearAllStorage" 
                class="btn btn-sm bg-red-600 text-white hover:bg-red-700"
              >
                <i class="fas fa-trash mr-1"></i> Clear All Storage
              </button>
              <button 
                @click="testChunker" 
                class="btn btn-sm bg-blue-600 text-white hover:bg-blue-700"
              >
                <i class="fas fa-vial mr-1"></i> Test Chunker
              </button>
            </div>
          </div>
        </div>

        <!-- Processing Status -->
        <div v-if="processing" class="desktop-processing-card">
          <div class="desktop-processing-body">
            <div class="flex items-center space-x-3 mb-4">
              <div class="loading-spinner w-6 h-6 text-primary-600"></div>
              <div>
                <div class="font-medium text-neutral-900">{{ processingStatus }}</div>
                <div class="text-sm text-neutral-600">This may take a few moments...</div>
              </div>
            </div>
            <div class="progress">
              <div 
                class="progress-bar"
                :style="{ width: processingProgress + '%' }"
                role="progressbar"
                :aria-valuenow="processingProgress"
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
            <div class="text-right text-sm text-neutral-600 mt-2">
              {{ processingProgress }}% complete
            </div>
          </div>
        </div>

        <!-- Processed Content Preview -->
        <div v-if="processedContents.length > 0" class="space-y-8">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
            <h3 class="text-lg font-semibold text-neutral-900">Processed Content ({{ totalChunks }} chunks)</h3>
            <button 
              @click="contentStore?.setCurrentStep(2)"
              class="desktop-action-button primary"
            >
              <i class="fas fa-arrow-right"></i>
              <span>Review & Export</span>
            </button>
          </div>

          <!-- Content List -->
          <div class="space-y-4 max-h-96 overflow-y-auto scrollbar-thin">
            <div 
              v-for="(content, index) in processedContents" 
              :key="content.id"
              class="content-card"
            >
              <div class="flex items-start justify-between mb-3">
                <h4 class="font-medium text-neutral-900 truncate flex-1">{{ content.source }}</h4>
                <button 
                  @click="removeProcessedContent(index)"
                  class="btn btn-ghost btn-sm text-error-600 hover:text-error-700 flex-shrink-0 ml-3"
                >
                  <i class="fas fa-trash mr-1"></i>
                  Remove
                </button>
              </div>
              
              <div class="grid grid-cols-3 gap-4 mb-3 text-center">
                <div>
                  <div class="text-lg font-semibold text-primary-600">{{ content.chunks.length }}</div>
                  <div class="text-xs text-neutral-600">Chunks</div>
                </div>
                <div>
                  <div class="text-lg font-semibold text-primary-600">{{ content.totalWords }}</div>
                  <div class="text-xs text-neutral-600">Words</div>
                </div>
                <div>
                  <div class="text-lg font-semibold text-primary-600">{{ content.totalTags }}</div>
                  <div class="text-xs text-neutral-600">Tags</div>
                </div>
              </div>
              
              <div class="mb-4">
                <p class="text-sm text-neutral-700 leading-relaxed line-clamp-2">
                  {{ content.originalContent.substring(0, 200) }}<span v-if="content.originalContent.length > 200">...</span>
                </p>
              </div>
              
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="tag in content.allTags.slice(0, 5)" 
                  :key="tag"
                  class="badge badge-primary"
                >
                  {{ tag }}
                </span>
                <span v-if="content.allTags.length > 5" class="badge badge-outline-secondary">
                  +{{ content.allTags.length - 5 }} more
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Review & Quality Analysis -->
      <div v-if="chunks.length > 0 && currentStep >= 2">
        <!-- Quality Analysis -->
        <QualityAnalyzer :chunks="chunks" />

        <!-- Detailed Chunk Review -->
        <div class="card mb-6">
          <div class="card-body">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
              <div>
                <h2 class="text-2xl font-bold flex items-center text-neutral-900">
                  <span class="step-indicator-active mr-3">2</span>
                  Review & Edit Chunks ({{ chunks.length }})
                </h2>
                <p class="mt-1 text-neutral-600">Fine-tune your chunks for optimal AI performance</p>
              </div>
              <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full lg:w-auto">
                <button 
                  @click="goToExport"
                  class="btn btn-primary mobile-full"
                >
                  <i class="fas fa-download mr-2"></i>Ready to Export
                </button>
                <button 
                  @click="confirmClearAll"
                  class="btn btn-destructive mobile-full"
                >
                  <i class="fas fa-trash mr-2"></i>Clear All
                </button>
              </div>
            </div>

            <!-- Search Chunks -->
            <div class="mb-6">
              <FormField
                v-model="searchQuery"
                type="search"
                placeholder="Search chunks by content, tags, or source..."
                prefix-icon="fas fa-search"
                size="lg"
                hint="Search across all chunk content, tags, and source information"
              />
            </div>

            <!-- Detailed Chunks List -->
            <div v-if="filteredChunks.length === 0" class="text-center py-12">
              <div class="text-neutral-400 mb-4">
                <i class="fas fa-search text-4xl"></i>
              </div>
              <h3 class="text-lg font-medium text-neutral-600 mb-2">No chunks found</h3>
              <p class="text-neutral-500">
                {{ searchQuery ? 'Try adjusting your search terms' : 'No chunks have been created yet' }}
              </p>
            </div>
            
            <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-min">
              <div 
                v-for="(chunk, index) in filteredChunks" 
                :key="chunk.id"
                class="chunk-card group"
              >
                <div class="flex items-start justify-between mb-3">
                  <div class="badge badge-outline-primary">Chunk {{ index + 1 }}</div>
                  <div class="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      @click="toggleChunkExpanded(chunk.id)"
                      class="btn btn-ghost btn-sm"
                      :title="expandedChunks.has(chunk.id) ? 'Collapse' : 'Expand'"
                    >
                      <i :class="expandedChunks.has(chunk.id) ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                    </button>
                    <button 
                      @click="editChunkInline(index)"
                      class="btn btn-ghost btn-sm"
                      :title="editingChunk === index ? 'Save' : 'Edit'"
                    >
                      <i :class="editingChunk === index ? 'fas fa-save' : 'fas fa-edit'"></i>
                    </button>
                    <button 
                      @click="confirmDeleteChunk(chunk, index)"
                      class="btn btn-ghost btn-sm text-error-600 hover:text-error-700"
                      title="Delete chunk"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              
                <div v-if="chunk.source" class="text-sm text-neutral-600 mb-3 flex items-center">
                  <i class="fas fa-file-text mr-2 text-neutral-400"></i>
                  <span class="truncate">{{ chunk.source }}</span>
                </div>
              
                <div class="mb-4">
                  <FormField
                    v-if="editingChunk === index"
                    v-model="chunk.content"
                    type="textarea"
                    :rows="4"
                    @blur="updateChunkMetadata(chunk)"
                  />
                  <div v-else-if="expandedChunks.has(chunk.id)" class="prose prose-sm max-w-none">
                    <p class="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{{ chunk.content }}</p>
                  </div>
                  <div v-else class="prose prose-sm max-w-none">
                    <p class="text-sm text-neutral-700 leading-relaxed line-clamp-3">{{ chunk.content }}</p>
                  </div>
                </div>
              
                <div class="flex items-center space-x-4 text-xs text-neutral-500 mb-3">
                  <span class="flex items-center">
                    <i class="fas fa-font mr-1"></i>
                    {{ chunk.metadata.wordCount }} words
                  </span>
                  <span class="flex items-center">
                    <i class="fas fa-tags mr-1"></i>
                    {{ chunk.tags.length }} tags
                  </span>
                  <span v-if="chunk.metadata.createdAt" class="flex items-center">
                    <i class="fas fa-clock mr-1"></i>
                    {{ new Date(chunk.metadata.createdAt).toLocaleDateString() }}
                  </span>
                </div>
              
                <div class="flex flex-wrap gap-2 mb-3">
                  <span 
                    v-for="tag in chunk.tags" 
                    :key="tag"
                    class="badge badge-secondary"
                  >
                    {{ tag }}
                  </span>
                  <span v-if="chunk.tags.length === 0" class="text-xs text-neutral-400 italic">
                    No tags
                  </span>
                </div>
              
                <div class="flex space-x-2">
                  <FormField
                    v-model="chunk.tagsString"
                    type="text"
                    placeholder="Add tags (comma-separated)..."
                    size="sm"
                    class="flex-1"
                    suffix-icon="fas fa-plus"
                    @input="updateChunkTags(chunk)"
                    @suffix-click="() => {}"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Export -->
      <div v-if="chunks.length > 0 && currentStep >= 3" id="exportPanel">
        <VectorStoreExporter 
          :chunks="chunks" 
          @export-success="handleExportSuccess"
        />
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div v-if="showDeleteConfirmation" class="modal-overlay" @click="cancelDelete">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-full bg-error-100 flex items-center justify-center flex-shrink-0">
            <i class="fas fa-exclamation-triangle text-error-600"></i>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-neutral-900">Delete Chunk</h3>
            <p class="text-sm text-neutral-600">This action cannot be undone</p>
          </div>
        </div>
      </div>
      
      <div class="modal-body">
        <p class="mb-4 text-neutral-700">Are you sure you want to delete this chunk?</p>
        <div class="card-error">
          <div class="card-body">
            <p class="text-sm font-medium mb-2 text-neutral-900">
              <i class="fas fa-file-text mr-2 text-neutral-500"></i>
              Source: {{ chunkToDelete?.source || 'Unknown' }}
            </p>
            <p class="text-sm text-neutral-700 line-clamp-3">{{ chunkToDelete?.content }}</p>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <div class="flex justify-end space-x-3">
          <button 
            @click="cancelDelete"
            class="btn btn-secondary"
          >
            Cancel
          </button>
          <button 
            @click="confirmDelete"
            class="btn btn-destructive"
          >
            <i class="fas fa-trash mr-2"></i>Delete Chunk
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Clear All Confirmation Modal -->
  <div v-if="showClearAllConfirmation" class="modal-overlay" @click="cancelClearAll">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-full bg-error-100 flex items-center justify-center flex-shrink-0">
            <i class="fas fa-exclamation-triangle text-error-600"></i>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-neutral-900">Clear All Chunks</h3>
            <p class="text-sm text-neutral-600">This action cannot be undone</p>
          </div>
        </div>
      </div>
      
      <div class="modal-body">
        <p class="mb-4 text-neutral-700">Are you sure you want to delete all {{ totalChunks }} chunks?</p>
        <div class="card-warning">
          <div class="card-body">
            <p class="text-sm font-medium mb-3 text-neutral-900">This will permanently remove:</p>
            <ul class="text-sm space-y-1 text-neutral-700">
              <li class="flex items-center">
                <i class="fas fa-circle text-xs mr-2 text-neutral-400"></i>
                All {{ totalChunks }} processed chunks
              </li>
              <li class="flex items-center">
                <i class="fas fa-circle text-xs mr-2 text-neutral-400"></i>
                All chunk content and metadata
              </li>
              <li class="flex items-center">
                <i class="fas fa-circle text-xs mr-2 text-neutral-400"></i>
                Progress will reset to step 1
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <div class="flex justify-end space-x-3">
          <button 
            @click="cancelClearAll"
            class="btn btn-secondary"
          >
            Cancel
          </button>
          <button 
            @click="clearAllChunks"
            class="btn btn-destructive"
          >
            <i class="fas fa-trash mr-2"></i>Clear All Chunks
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Keyboard Shortcuts Help Modal -->
  <KeyboardShortcutsHelp 
    :show="showShortcutsHelp"
    :shortcuts="shortcutDefinitions"
    :format-shortcut="formatShortcut"
    @close="showShortcutsHelp = false"
  />
</template>

<script>
import { ref, computed, reactive, watch, onUnmounted } from 'vue'
import QualityAnalyzer from './QualityAnalyzer.vue'
import VectorStoreExporter from './VectorStoreExporter.vue'
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp.vue'
import FormField from './ui/FormField.vue'
import LoadingSkeleton from './ui/LoadingSkeleton.vue'
import { chunkText, suggestTags } from '../utils/chunker.js'
import { useVersionStore } from '../stores/versions.ts'
import { useContentStore } from '../stores/content.ts'
import storage from '../services/indexedDBStorage.ts'
import { useErrorHandler } from '../composables/useErrorHandler.ts'
import { useKeyboardShortcuts, SHORTCUTS } from '../composables/useKeyboardShortcuts.ts'
import { MemoryMonitor, processBatches } from '../utils/performanceOptimizer.ts'

export default {
  name: 'ContentChunkBuilder',
  components: {
    QualityAnalyzer,
    VectorStoreExporter,
    KeyboardShortcutsHelp,
    FormField,
    LoadingSkeleton
  },
  setup() {
    // Initialize stores
    const contentStore = useContentStore()
    const versionStore = useVersionStore()
    
    // Ensure stores are properly initialized
    if (!contentStore) {
      console.error('ContentStore failed to initialize')
      throw new Error('ContentStore is not available')
    }
    
    // Error handling
    const { validateInput, handleAsyncError } = useErrorHandler()
    
    // Keyboard shortcuts
    const { showShortcutsHelp, shortcutDefinitions, addShortcut, formatShortcut } = useKeyboardShortcuts()
    
    // Performance monitoring for large operations
    const memoryMonitor = new MemoryMonitor(5000, 100 * 1024 * 1024, () => {
      if (window.showNotification) {
        window.showNotification({
          type: 'warning',
          title: 'High Memory Usage',
          message: 'Consider processing smaller content or refreshing the page'
        })
      }
    })
    
    // Local UI state only
    const searchQuery = ref('')
    
    // Progressive disclosure state
    const showAdvancedChunking = ref(false)
    const showContentStats = ref(false)
    
    // Form validation state
    const sourceValidation = ref(null)
    const contentValidation = ref(null)
    // Track user interaction to prevent premature validation
    const sourceInteracted = ref(false)
    const contentInteracted = ref(false)
    
    // Delete confirmation state
    const showDeleteConfirmation = ref(false)
    const chunkToDelete = ref(null)
    const chunkIndexToDelete = ref(null)
    
    // Clear all confirmation state
    const showClearAllConfirmation = ref(false)
    
    // Load autosaved data on component mount
    const mounted = async () => {
      // Load autosave if no chunks are already present
      if (contentStore?.chunks.length === 0) {
        await contentStore?.loadFromAutosave()
      }
    }
    
    // Call mounted function
    mounted().catch(console.error)
    
    // Start memory monitoring
    memoryMonitor.start()
    
    // Cleanup on component unmount
    onUnmounted(() => {
      memoryMonitor.stop()
    })
    
    // Setup keyboard shortcuts
    const setupKeyboardShortcuts = () => {
      // Content actions
      addShortcut(SHORTCUTS.PROCESS_CONTENT, {
        key: SHORTCUTS.PROCESS_CONTENT,
        description: 'Process content into chunks',
        action: () => {
          if (canProcessContent.value && !processing.value) {
            processContent()
          }
        },
        category: 'Actions'
      })
      
      addShortcut(SHORTCUTS.CLEAR_FORM, {
        key: SHORTCUTS.CLEAR_FORM,
        description: 'Clear the content form',
        action: () => {
          clearForm()
        },
        category: 'Actions'
      })
      
      // Navigation
      addShortcut(SHORTCUTS.GO_TO_STEP_1, {
        key: SHORTCUTS.GO_TO_STEP_1,
        description: 'Go to step 1 (Create)',
        action: () => {
          if (contentStore) contentStore.setCurrentStep(1)
        },
        category: 'Navigation'
      })
      
      addShortcut(SHORTCUTS.GO_TO_STEP_2, {
        key: SHORTCUTS.GO_TO_STEP_2,
        description: 'Go to step 2 (Review)',
        action: () => {
          if (contentStore && chunks.value.length > 0) {
            contentStore.setCurrentStep(2)
          }
        },
        category: 'Navigation'
      })
      
      addShortcut(SHORTCUTS.GO_TO_STEP_3, {
        key: SHORTCUTS.GO_TO_STEP_3,
        description: 'Go to step 3 (Export)',
        action: () => {
          if (contentStore && chunks.value.length > 0) {
            goToExport()
          }
        },
        category: 'Navigation'
      })
      
      // Search
      addShortcut(SHORTCUTS.FOCUS_SEARCH, {
        key: SHORTCUTS.FOCUS_SEARCH,
        description: 'Focus search field',
        action: () => {
          const searchInput = document.querySelector('input[type="text"][placeholder*="search" i]')
          if (searchInput instanceof HTMLInputElement) {
            searchInput.focus()
            searchInput.select()
          }
        },
        category: 'Navigation'
      })
      
      // View toggles
      addShortcut(SHORTCUTS.TOGGLE_ADVANCED, {
        key: SHORTCUTS.TOGGLE_ADVANCED,
        description: 'Toggle advanced chunking options',
        action: () => {
          showAdvancedChunking.value = !showAdvancedChunking.value
        },
        category: 'View'
      })
      
      // Quick actions
      addShortcut(SHORTCUTS.CLEAR_ALL, {
        key: SHORTCUTS.CLEAR_ALL,
        description: 'Clear all chunks (with confirmation)',
        action: () => {
          if (chunks.value.length > 0) {
            confirmClearAll()
          }
        },
        category: 'Quick Actions'
      })
    }
    
    // Call setup function
    setupKeyboardShortcuts()
    
    const contentForm = reactive({
      source: '',
      content: '',
      stats: {
        wordCount: 0,
        charCount: 0,
        estimatedChunks: 0
      }
    })

    const chunkingOptions = reactive({
      chunkSize: 500,
      overlap: 50,
      autoTag: true
    })

    // Debug Panel State (TEMPORARY)
    const showDebugPanel = ref(true) // Start visible for debugging
    const debugLastProcessing = reactive({
      timestamp: null,
      input: '',
      output: '',
      chunksCreated: 0
    })

    // Computed
    const currentStep = computed(() => {
      try {
        return contentStore?.currentStep || 1
      } catch (error) {
        console.warn('ContentStore not yet initialized:', error)
        return 1
      }
    })
    
    const canProcessContent = computed(() => {
      return contentForm.source.trim().length > 0 && contentForm.content.trim().length > 0
    })

    const totalChunks = computed(() => {
      const currentProcessedContents = contentStore?.processedContents || []
      return currentProcessedContents.reduce((total, content) => total + content.chunks.length, 0)
    })

    // Removed duplicate filteredChunks - using the one in return statement

    // Methods
    const updateContentStats = () => {
      const content = contentForm.content.trim();
      const words = content.split(/\s+/).filter(word => word.length > 0);
      
      contentForm.stats.wordCount = words.length;
      contentForm.stats.charCount = content.length;
      contentForm.stats.estimatedChunks = Math.ceil(words.length / chunkingOptions.chunkSize);
      
      // Clear content validation on input to provide fresh feedback
      contentValidation.value = null;
      
      // Trigger autosave after content changes
      if (contentStore?.autosaveEnabled) {
        debouncedAutosave();
      }
    };
    
    // Enhanced validation methods
    const validateSource = () => {
      // Mark that user has interacted with this field
      sourceInteracted.value = true;
      
      // Simplified validation - just check if field has content
      const value = contentForm.source?.trim() || '';
      
      if (value.length === 0) {
        sourceValidation.value = { isValid: false, errors: ['Source/Title is required'], warnings: [] };
      } else if (value.length < 2) {
        sourceValidation.value = { isValid: false, errors: ['Source must be at least 2 characters'], warnings: [] };
      } else if (value.length > 200) {
        sourceValidation.value = { isValid: false, errors: ['Source must be less than 200 characters'], warnings: [] };
      } else {
        sourceValidation.value = { isValid: true, errors: [], warnings: [] };
      }
    };
    
    const validateContent = () => {
      // Mark that user has interacted with this field
      contentInteracted.value = true;
      
      // Simplified validation - just check if field has content
      const value = contentForm.content?.trim() || '';
      
      if (value.length === 0) {
        contentValidation.value = { isValid: false, errors: ['Content is required'], warnings: [] };
      } else if (value.length < 10) {
        contentValidation.value = { isValid: false, errors: ['Content must be at least 10 characters'], warnings: [] };
      } else {
        contentValidation.value = { isValid: true, errors: [], warnings: [] };
      }
    };
    
    const clearSourceValidation = () => {
      sourceValidation.value = null;
      // Don't reset interaction flag - once user interacts, keep validation active
    };
    
    const clearContentValidation = () => {
      contentValidation.value = null;
      // Don't reset interaction flag - once user interacts, keep validation active
    };
    
    // Autosave functionality using IndexedDB
    const saveToLocalStorage = async () => {
      // Prepare autosave data once
      const autosaveData = {
        contentForm: {
          source: contentForm.source,
          content: contentForm.content,
          stats: contentForm.stats
        },
        chunkingOptions: { ...chunkingOptions },
        processedContents: contentStore?.processedContents || [],
        chunks: contentStore?.chunks || [],
        step: contentStore?.currentStep || 1,
        timestamp: new Date().toISOString()
      }
      
      try {
        await storage.setItem('contentbuilder_autosave', autosaveData, 'autosave')
        // Note: lastSaved is handled by content store
        
        // Show subtle save indicator
        if (window.showNotification) {
          window.showNotification({
            type: 'info',
            title: 'Draft Saved',
            message: 'Your work has been automatically saved',
            duration: 2000
          })
        }
      } catch (error) {
        console.warn('Failed to autosave:', error)
        
        // Fallback to localStorage
        try {
          localStorage.setItem('contentbuilder_autosave', JSON.stringify(autosaveData))
          console.log('Successfully saved to localStorage fallback')
          // Note: lastSaved is handled by content store
        } catch (fallbackError) {
          console.error('Both IndexedDB and localStorage autosave failed:', fallbackError)
          if (window.showNotification) {
            window.showNotification({
              type: 'error',
              title: 'Autosave Failed',
              message: 'Unable to save your work automatically. Please export manually.',
              duration: 5000
            })
          }
        }
      }
    }
    
    const loadFromLocalStorage = async () => {
      try {
        const saved = await storage.getItem('contentbuilder_autosave')
        if (saved) {
          // Check if data is recent (within 24 hours)
          const saveTime = new Date(saved.timestamp)
          const now = new Date()
          const hoursDiff = (now - saveTime) / (1000 * 60 * 60)
          
          if (hoursDiff < 24) {
            contentForm.source = saved.contentForm.source || ''
            contentForm.content = saved.contentForm.content || ''
            contentForm.stats = saved.contentForm.stats || { wordCount: 0, charCount: 0, estimatedChunks: 0 }
            
            Object.assign(chunkingOptions, saved.chunkingOptions || {})
            // Load processed contents and chunks through store methods
            if (saved.processedContents) {
              contentStore.clearProcessedContents()
              saved.processedContents.forEach(content => {
                contentStore.addProcessedContent(content)
              })
            }
            if (saved.chunks) {
              contentStore.resetContentState()
              saved.chunks.forEach(chunk => {
                contentStore.addChunk(chunk)
              })
            }
            contentStore.setCurrentStep(saved.step || 1)
            // Note: lastSaved is handled by content store
            
            if (window.showNotification) {
              window.showNotification({
                type: 'success',
                title: 'Draft Restored',
                message: `Restored your work from ${saveTime.toLocaleString()}`,
                duration: 5000
              })
            }
            
            return true
          }
        }
      } catch (error) {
        console.warn('Failed to load autosave data:', error)
        
        // Fallback to localStorage
        try {
          const saved = localStorage.getItem('contentbuilder_autosave')
          if (saved) {
            const autosaveData = JSON.parse(saved)
            const saveTime = new Date(autosaveData.timestamp)
            const now = new Date()
            const hoursDiff = (now - saveTime) / (1000 * 60 * 60)
            
            if (hoursDiff < 24) {
              contentForm.source = autosaveData.contentForm.source || ''
              contentForm.content = autosaveData.contentForm.content || ''
              contentForm.stats = autosaveData.contentForm.stats || { wordCount: 0, charCount: 0, estimatedChunks: 0 }
              
              Object.assign(chunkingOptions, autosaveData.chunkingOptions || {})
              // Load processed contents and chunks through store methods
              if (autosaveData.processedContents) {
                contentStore.clearProcessedContents()
                autosaveData.processedContents.forEach(content => {
                  contentStore.addProcessedContent(content)
                })
              }
              if (autosaveData.chunks) {
                contentStore.resetContentState()
                autosaveData.chunks.forEach(chunk => {
                  contentStore.addChunk(chunk)
                })
              }
              contentStore.setCurrentStep(autosaveData.step || 1)
              // Note: lastSaved is handled by content store
              
              // Migrate to IndexedDB
              await saveToLocalStorage()
              localStorage.removeItem('contentbuilder_autosave')
              
              return true
            }
          }
        } catch (fallbackError) {
          console.warn('Failed to load from localStorage fallback:', fallbackError)
        }
      }
      return false
    }
    
    const clearAutosave = async () => {
      try {
        await storage.removeItem('contentbuilder_autosave')
        localStorage.removeItem('contentbuilder_autosave') // Clear fallback too
        // Note: lastSaved is handled by content store
      } catch (error) {
        console.warn('Failed to clear autosave:', error)
      }
    }
    
    // Debounced autosave to avoid excessive saves and prevent race conditions
    let autosaveTimeout = null
    let isSaving = false
    const debouncedAutosave = () => {
      if (autosaveTimeout) {
        clearTimeout(autosaveTimeout)
      }
      autosaveTimeout = setTimeout(async () => {
        if (isSaving) {
          // If already saving, schedule another attempt
          setTimeout(() => debouncedAutosave(), 1000)
          return
        }
        
        if (contentForm.source.trim() || contentForm.content.trim()) {
          isSaving = true
          try {
            await saveToLocalStorage()
          } catch (error) {
            console.warn('Autosave failed:', error)
          } finally {
            isSaving = false
          }
        }
      }, 2000) // Save 2 seconds after user stops typing
    }

    const generateContentId = () => {
      return `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    const generateChunkId = () => {
      return `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    const processContent = async () => {
      if (!canProcessContent.value) return
      
      // Run validation and update reactive state
      validateSource()
      validateContent()
      
      // Check if validation passed
      if (!sourceValidation.value?.isValid) {
        if (window.showNotification) {
          window.showNotification({
            type: 'error',
            title: 'Invalid Source',
            message: sourceValidation.value.errors[0]
          })
        }
        return
      }
      
      if (!contentValidation.value?.isValid) {
        if (window.showNotification) {
          window.showNotification({
            type: 'error',
            title: 'Invalid Content',
            message: contentValidation.value.errors[0]
          })
        }
        return
      }
      
      // Check memory usage before processing
      if (performance.memory) {
        const memoryUsage = performance.memory.usedJSHeapSize
        const memoryLimit = 100 * 1024 * 1024 // 100MB warning threshold
        
        if (memoryUsage > memoryLimit) {
          if (window.showNotification) {
            window.showNotification({
              type: 'warning',
              title: 'High Memory Usage',
              message: 'Consider refreshing the page before processing large content'
            })
          }
        }
      }

      contentStore.setProcessing(true, 'Analyzing content...', 20)

      try {
        // Simulate processing delay for UX
        await new Promise(resolve => setTimeout(resolve, 500))

        contentStore.setProcessing(true, 'Creating chunks...', 40)

        // Create chunks using existing chunker utility with error handling
        
        // Capture debug info BEFORE processing
        debugLastProcessing.timestamp = Date.now()
        debugLastProcessing.input = contentForm.content.substring(0, 200) + '...'
        
        console.log('🔧 DEBUG: About to chunk content:', {
          contentLength: contentForm.content.length,
          contentPreview: contentForm.content.substring(0, 100) + '...',
          source: contentForm.source,
          options: {
            chunkSize: Math.max(50, Math.min(2000, chunkingOptions.chunkSize)),
            overlap: Math.max(0, Math.min(500, chunkingOptions.overlap)),
            chunkBy: 'words'
          }
        })

        const { data: chunkedContent, error: chunkError } = await handleAsyncError(
          () => Promise.resolve(chunkText(
            contentForm.content,
            contentForm.source || 'Manual Content',
            {
              chunkSize: Math.max(50, Math.min(2000, chunkingOptions.chunkSize)), // Clamp chunk size
              overlap: Math.max(0, Math.min(500, chunkingOptions.overlap)), // Clamp overlap
              chunkBy: 'words'
            }
          )),
          { component: 'ContentChunkBuilder', action: 'chunkText' }
        )
        
        // Capture debug info AFTER processing
        debugLastProcessing.output = chunkedContent?.[0]?.content?.substring(0, 200) + '...' || 'No content'
        debugLastProcessing.chunksCreated = chunkedContent?.length || 0
        
        console.log('🔧 DEBUG: Chunked content result:', {
          success: !chunkError,
          error: chunkError,
          chunksCount: chunkedContent?.length || 0,
          firstChunkPreview: chunkedContent?.[0]?.content?.substring(0, 100) || 'No content'
        })
        
        if (chunkError || !chunkedContent) {
          throw new Error('Failed to create chunks: ' + (chunkError?.message || 'Unknown error'))
        }

        contentStore.setProcessing(true, 'Generating tags...', 70)

        // Process each chunk and add metadata with performance optimization
        const processedChunks = await processBatches(
          chunkedContent,
          async (chunkData, index) => {
          const chunk = {
            id: generateChunkId(),
            content: chunkData.content,
            source: contentForm.source.trim(),
            tags: [],
            tagsString: '',
            metadata: {
              wordCount: chunkData.metadata.wordCount,
              createdAt: new Date().toISOString(),
              type: 'manual',
              position: chunkData.metadata.position || index,
              section: chunkData.metadata.section || `Chunk ${index + 1}`
            }
          }

          // Auto-generate tags if enabled with error handling
          if (chunkingOptions.autoTag) {
            try {
              const autoTags = suggestTags(chunk.content, contentForm.source)
              // Validate and sanitize tags
              chunk.tags = autoTags
                .filter(tag => typeof tag === 'string' && tag.trim().length > 0)
                .map(tag => tag.trim().substring(0, 50)) // Limit tag length
                .slice(0, 20) // Limit number of tags
              chunk.tagsString = chunk.tags.join(', ')
            } catch (tagError) {
              console.warn('Failed to generate tags:', tagError)
              chunk.tags = []
              chunk.tagsString = ''
            }
          }

          return chunk
          },
          { batchSize: 50, delayBetweenBatches: 5 }, // Process 50 chunks at a time
          (completed, total) => {
            // Update progress during batch processing
            const batchProgress = 70 + Math.round((completed / total) * 15) // 70-85% range
            contentStore.setProcessing(true, `Processing chunk ${completed}/${total}...`, batchProgress)
          }
        )

        contentStore.setProcessing(true, 'Finalizing...', 90)

        // Create processed content record
        const allTags = [...new Set(processedChunks.flatMap(chunk => chunk.tags))]
        const totalWords = processedChunks.reduce((sum, chunk) => sum + chunk.metadata.wordCount, 0)

        const processedContent = {
          id: generateContentId(),
          source: contentForm.source.trim(),
          originalContent: contentForm.content.trim(),
          chunks: processedChunks,
          totalWords,
          totalTags: allTags.length,
          allTags,
          createdAt: new Date().toISOString()
        };

        contentStore.addProcessedContent(processedContent)

        // Add chunks to main chunks array
        console.log('🔧 DEBUG: Final processed chunks before adding to store:', {
          count: processedChunks.length,
          chunks: processedChunks.map(chunk => ({
            id: chunk.id,
            contentPreview: chunk.content.substring(0, 50) + '...',
            contentLength: chunk.content.length,
            source: chunk.source,
            tags: chunk.tags
          }))
        })
        
        processedChunks.forEach(chunk => contentStore.addChunk(chunk))

        contentStore.setProcessing(true, 'Complete!', 100)
        
        // Clear form and advance
        clearForm()
        
        setTimeout(() => {
          contentStore.setCurrentStep(2)
        }, 1000)

      } catch (error) {
        console.error('Processing error:', error)
        contentStore.setProcessing(false, 'Error processing content', 0)
      } finally {
        setTimeout(() => {
          contentStore.setProcessing(false, '', 0)
        }, 1000)
      }
    }

    const clearForm = () => {
      contentForm.source = '';
      contentForm.content = '';
      contentForm.stats.wordCount = 0;
      contentForm.stats.charCount = 0;
      contentForm.stats.estimatedChunks = 0;
      
      // Clear validation state and interaction flags
      sourceValidation.value = null;
      contentValidation.value = null;
      sourceInteracted.value = false;
      contentInteracted.value = false;
    }

    const removeProcessedContent = (index) => {
      const currentProcessedContents = contentStore?.processedContents || [];
      const content = currentProcessedContents[index];
      
      if (content && content.chunks) {
        // Remove chunks from main chunks array
        const chunkIdsToRemove = content.chunks.map(chunk => chunk.id);
        chunkIdsToRemove.forEach(chunkId => {
          // deleteChunk method expects the chunk ID directly
          contentStore.deleteChunk(chunkId);
        });
      }
      
      // Remove from processed contents using proper array manipulation
      if (contentStore?.processedContents) {
        contentStore.processedContents.splice(index, 1);
      }
    }

    const editChunk = (index) => {
      contentStore.setCurrentStep(2);
      setTimeout(() => {
        editingChunk.value = index;
      }, 100);
    };

    const editChunkInline = (index) => {
      const currentEditingChunk = contentStore?.editingChunk;
      const currentChunks = contentStore?.chunks || [];
      
      if (currentEditingChunk === index) {
        contentStore.setEditingChunk(null);
        if (currentChunks[index]) {
          updateChunkMetadata(currentChunks[index]);
        }
      } else {
        contentStore.setEditingChunk(index);
      }
    };

    const confirmDeleteChunk = (chunk, index) => {
      chunkToDelete.value = chunk;
      chunkIndexToDelete.value = index;
      showDeleteConfirmation.value = true;
    };
    
    const cancelDelete = () => {
      showDeleteConfirmation.value = false;
      chunkToDelete.value = null;
      chunkIndexToDelete.value = null;
    };
    
    const confirmDelete = () => {
      if (chunkIndexToDelete.value !== null) {
        const currentChunks = contentStore?.chunks || []
        const chunkToDeleteData = currentChunks[chunkIndexToDelete.value]
        
        if (chunkToDeleteData) {
          // Use the chunk ID directly
          const chunkId = chunkToDeleteData.id
          if (chunkId) {
            contentStore.deleteChunk(chunkId);
            
            // Show success notification
            if (window.showNotification) {
              window.showNotification({
                type: 'success',
                title: 'Chunk Deleted',
                message: `Successfully deleted chunk from "${chunkToDelete.value?.source || 'Unknown source'}"`,
                duration: 3000
              });
            }
          }
        }
      }
      cancelDelete();
    }
    
    const removeChunk = (index) => {
      // This method is kept for backward compatibility but now just calls confirmDeleteChunk
      const currentChunks = contentStore?.chunks || []
      if (currentChunks[index]) {
        confirmDeleteChunk(currentChunks[index], index)
      }
    }

    const confirmClearAll = () => {
      showClearAllConfirmation.value = true;
    };
    
    const cancelClearAll = () => {
      showClearAllConfirmation.value = false;
    };
    
    const clearAllChunks = () => {
      contentStore.resetContentState();
      contentStore.setCurrentStep(1);
      showClearAllConfirmation.value = false;
      
      // Show success notification
      if (window.showNotification) {
        window.showNotification({
          type: 'success',
          title: 'All Chunks Cleared',
          message: 'Successfully cleared all chunks and reset to step 1',
          duration: 3000
        });
      }
    };

    const updateChunkMetadata = (chunk) => {
      const words = chunk.content.trim().split(/\s+/).filter(word => word.length > 0);
      chunk.metadata.wordCount = words.length;
    };

    const updateChunkTags = (chunk) => {
      chunk.tags = chunk.tagsString
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    };

    // Debug Panel Methods (TEMPORARY)
    const clearAllStorage = async () => {
      try {
        // Clear all storage
        localStorage.clear()
        sessionStorage.clear()
        
        // Clear IndexedDB
        if (window.indexedDB) {
          const databases = await indexedDB.databases()
          for (const db of databases) {
            await indexedDB.deleteDatabase(db.name)
          }
        }
        
        // Reset store
        contentStore?.resetContentState()
        
        // Reset form
        contentForm.source = ''
        contentForm.content = ''
        
        // Show notification
        if (window.showNotification) {
          window.showNotification({
            type: 'success',
            title: 'Storage Cleared',
            message: 'All storage has been cleared. Please refresh the page.',
            duration: 5000
          })
        }
        
        // Reload page after a moment
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } catch (error) {
        console.error('Failed to clear storage:', error)
      }
    }
    
    const testChunker = () => {
      // Test the chunker directly with known content
      const testContent = 'This is a test content for verifying the chunker. It should create proper chunks with actual content, not placeholder text. This test will help us verify that the chunking algorithm works correctly.'
      
      const testChunks = chunkText(testContent, 'test-source.txt', {
        chunkSize: 50,
        overlap: 10,
        chunkBy: 'words'
      })
      
      console.log('Test Chunker Results:', testChunks)
      
      // Show results in an alert for immediate visibility
      const result = `Test Chunker Results:
- Input: "${testContent.substring(0, 50)}..."
- Chunks Created: ${testChunks.length}
- First Chunk: "${testChunks[0]?.content?.substring(0, 50) || 'No content'}..."
- Has Placeholder: ${testChunks.some(c => c.content.includes('placeholder')) ? 'YES ❌' : 'NO ✅'}`
      
      alert(result)
    }

    const goToExport = () => {
      contentStore.setCurrentStep(3);
      setTimeout(() => {
        const exportPanel = document.querySelector('#exportPanel');
        if (exportPanel) {
          exportPanel.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    };

    const toggleChunkExpanded = (chunkId) => {
      contentStore.toggleChunkExpanded(chunkId);
    };

    const reconstructProcessedContents = (loadedChunks) => {
      if (!loadedChunks || loadedChunks.length === 0) {
        contentStore.clearProcessedContents();
        return;
      }
      
      // Simple reconstruction from chunks grouped by source
      const chunksBySource = {};
      loadedChunks.forEach(chunk => {
        const source = chunk.source || 'Unknown Source';
        if (!chunksBySource[source]) {
          chunksBySource[source] = [];
        }
        chunksBySource[source].push(chunk);
      });
      
      // Create basic processedContents for display
      const reconstructedContents = Object.keys(chunksBySource).map(source => {
        const sourceChunks = chunksBySource[source];
        const allTags = [...new Set(sourceChunks.flatMap(chunk => chunk.tags))];
        const totalWords = sourceChunks.reduce((sum, chunk) => sum + (chunk.metadata.wordCount || 0), 0);
        
        return {
          id: `loaded_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          source: source,
          originalContent: `Loaded from saved version with ${sourceChunks.length} chunks`,
          chunks: sourceChunks,
          totalWords,
          totalTags: allTags.length,
          allTags,
          createdAt: sourceChunks[0]?.metadata.createdAt || new Date().toISOString()
        };
      });
      
      // Add the reconstructed contents to the store
      contentStore.clearProcessedContents();
      reconstructedContents.forEach(content => {
        contentStore.addProcessedContent(content);
      });
    }

    const handleExportSuccess = (data) => {
      console.log('Export successful:', data)
      
      // Auto-save version on export with the actual exported data
      const currentChunks = contentStore?.chunks || []
      if (currentChunks.length > 0) {
        // Generate version name from sources
        const uniqueSources = [...new Set(currentChunks.map(chunk => chunk.source))]
        const versionName = uniqueSources.length === 1 
          ? uniqueSources[0] 
          : `${uniqueSources[0]} + ${uniqueSources.length - 1} more sources`
        
        // Create exported data structure
        const exportedData = {
          format: data.format,
          filename: data.filename,
          data: data.exportedData,
          exportOptions: data.exportOptions,
          chunkCount: data.chunkCount,
          exportedAt: new Date().toISOString()
        }
        
        const savedVersion = versionStore.saveVersion(
          { 
            chunks: currentChunks,      // Keep chunks as backup
            exportedData: exportedData  // Store the actual exported file
          },
          versionName,
          true  // isAutoSave = true
        )
        
        // Show success notification
        const notification = {
          type: 'success',
          title: 'Export Complete & Saved!',
          message: `Successfully exported ${data.chunkCount} chunks in ${data.format} format. Version "${savedVersion.name}" saved to history.`
        }
        
        // Show notification using global function
        if (window.showNotification) {
          window.showNotification(notification)
        }
        
        // Clear autosave on successful export
        clearAutosave()
      }
    }
    
    const formatTimeAgo = (date) => {
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      
      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString();
    }

    return {
      // Stores
      contentStore,
      versionStore,
      
      // Refs
      searchQuery,
      showAdvancedChunking,
      showContentStats,
      sourceValidation,
      contentValidation,
      sourceInteracted,
      contentInteracted,
      showShortcutsHelp,
      shortcutDefinitions,
      formatShortcut,
      SHORTCUTS,
      showDeleteConfirmation,
      chunkToDelete,
      chunkIndexToDelete,
      showClearAllConfirmation,
      
      // Reactive objects
      contentForm,
      chunkingOptions,
      
      // Computed
      currentStep,
      canProcessContent,
      totalChunks: computed(() => contentStore?.chunks?.length || 0),
      filteredChunks: computed(() => {
        if (!searchQuery.value || !contentStore?.chunks) return contentStore?.chunks || []
        const query = searchQuery.value.toLowerCase()
        return contentStore.chunks.filter(chunk => 
          chunk.content?.toLowerCase().includes(query) ||
          chunk.tags?.some(tag => tag.toLowerCase().includes(query)) ||
          (chunk.source && chunk.source.toLowerCase().includes(query))
        )
      }),
      
      // Store proxy properties
      chunks: computed(() => contentStore?.chunks || []),
      editingChunk: computed(() => contentStore?.editingChunk),
      expandedChunks: computed(() => contentStore?.expandedChunks || new Set()),
      processing: computed(() => contentStore?.processing || false),
      processingStatus: computed(() => contentStore?.processingStatus || ''),
      processingProgress: computed(() => contentStore?.processingProgress || 0),
      processedContents: computed(() => contentStore?.processedContents || []),
      autosaveEnabled: computed(() => contentStore?.autosaveEnabled || true),
      lastSaved: computed(() => contentStore?.lastSaved),
      
      // Methods
      updateContentStats,
      validateSource,
      validateContent,
      clearSourceValidation,
      clearContentValidation,
      processContent,
      clearForm,
      removeProcessedContent,
      editChunk,
      editChunkInline,
      removeChunk,
      confirmDeleteChunk,
      cancelDelete,
      confirmDelete,
      confirmClearAll,
      cancelClearAll,
      clearAllChunks,
      updateChunkMetadata,
      updateChunkTags,
      goToExport,
      toggleChunkExpanded,
      reconstructProcessedContents,
      saveToLocalStorage,
      loadFromLocalStorage,
      clearAutosave,
      formatTimeAgo,
      handleExportSuccess,
      
      // Debug Panel (TEMPORARY)
      showDebugPanel,
      debugLastProcessing,
      clearAllStorage,
      testChunker
    }
  }
}
</script>

<style scoped>
/* Utility classes for text truncation */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Prose styling for chunk content */
.prose {
  max-width: none;
}

.prose p {
  margin-bottom: 0;
}

/* Chunk card base styles */
.chunk-card {
  @apply bg-white border border-neutral-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200;
  min-height: 200px; /* Ensure cards have minimum height */
  display: block; /* Ensure proper display */
}

/* Improved focus styles for better accessibility */
.chunk-card:focus-within {
  @apply ring-2 ring-primary-500 ring-offset-2;
}

/* Group hover effects */
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}

/* Ensure mobile touch targets are large enough */
@media (max-width: 640px) {
  .btn {
    min-height: 44px;
    min-width: 44px;
  }
  
  .step-indicator {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 0.875rem;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .chunk-card,
  .content-card,
  .card {
    border-width: 2px;
  }
  
  .badge,
  .btn {
    border-width: 2px;
  }
}

/* Animation for progressive disclosure */
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Ensure text balance works on supported browsers */
.text-balance {
  text-wrap: balance;
}

.text-pretty {
  text-wrap: pretty;
}

/* Fallback for browsers that don't support text-wrap */
@supports not (text-wrap: balance) {
  .text-balance {
    text-align: center;
  }
}

/* Print styles */
@media print {
  .btn,
  .modal-overlay,
  .loading-spinner {
    display: none !important;
  }
  
  .card {
    break-inside: avoid;
  }
}

/* Desktop Norton-Style Styling */
.desktop-content-container {
  max-width: none;
  padding: 40px;
}

/* Header Styling */
.desktop-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.title-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(168, 183, 157, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(168, 183, 157, 0.2);
}

.section-icon {
  width: 32px;
  height: 32px;
  color: #A8B79D;
}

.desktop-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #1e293b;
  background: linear-gradient(135deg, #A8B79D 0%, #D4AF37 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.desktop-subtitle {
  font-size: 16px;
  color: #64748b;
  margin: 0;
  font-weight: 400;
}

/* Progress Steps Styling */
.desktop-progress-container {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
}

.desktop-progress-steps {
  display: flex;
  align-items: center;
  gap: 32px;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.desktop-step-indicator {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.desktop-step-indicator.desktop-step-inactive {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  color: #94a3b8;
}

.desktop-step-indicator.desktop-step-active {
  background: linear-gradient(135deg, #A8B79D 0%, #8CA085 100%);
  border: 2px solid #A8B79D;
  color: white;
  box-shadow: 0 4px 12px rgba(168, 183, 157, 0.4);
}

.desktop-step-indicator.desktop-step-completed {
  background: #22c55e;
  border: 2px solid #16a34a;
  color: white;
}

.desktop-step-label {
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
}

.desktop-step-line {
  width: 64px;
  height: 2px;
  background: #e2e8f0;
  transition: all 0.3s ease;
}

.desktop-step-line.desktop-step-line-completed {
  background: linear-gradient(to right, #A8B79D, #22c55e);
}

/* Card Styling */
.desktop-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(168, 183, 157, 0.2);
  border-radius: 16px;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.05),
    0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  margin-bottom: 32px;
}

.desktop-card:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.1),
    0 4px 8px rgba(0, 0, 0, 0.15);
}

.desktop-card-header {
  padding: 32px 32px 0 32px;
  margin-bottom: 24px;
}

.desktop-card-title {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

/* Form Section Styling */
.desktop-form-section {
  padding: 0 32px 32px 32px;
}

.desktop-form-body {
  /* Inherits parent padding */
}

.desktop-form-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.desktop-form-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

/* Action Button Styling */
.desktop-action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.desktop-action-button.primary {
  background: linear-gradient(135deg, #A8B79D 0%, #8CA085 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(168, 183, 157, 0.3);
}

.desktop-action-button.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(168, 183, 157, 0.4);
}

.desktop-action-button.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.desktop-action-button.secondary {
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid #e2e8f0;
  color: #334155;
}

.desktop-action-button.secondary:hover {
  background: rgba(168, 183, 157, 0.1);
  border-color: #A8B79D;
}

.desktop-shortcut {
  font-size: 12px;
  opacity: 0.7;
  font-weight: 400;
}

/* Processing Card Styling */
.desktop-processing-card {
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 16px;
  margin-bottom: 32px;
}

.desktop-processing-body {
  padding: 32px;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .desktop-content-container {
    padding: 24px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .title-section {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .desktop-progress-steps {
    gap: 16px;
  }
  
  .desktop-step-line {
    width: 32px;
  }
}

@media (max-width: 640px) {
  .desktop-content-container {
    padding: 16px;
  }
  
  .desktop-card {
    border-radius: 12px;
  }
  
  .desktop-card-header {
    padding: 24px 24px 0 24px;
  }
  
  .desktop-form-section {
    padding: 0 24px 24px 24px;
  }
  
  .desktop-title {
    font-size: 24px;
  }
  
  .desktop-action-button {
    width: 100%;
    justify-content: center;
  }
}
</style>