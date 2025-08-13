<template>
  <div class="document-processor min-h-screen" :class="{ 'desktop-mode': isDesktopModeComputed }" style="background: linear-gradient(135deg, #fafafa 0%, #f5f7f4 100%);">
    <!-- Debug banner removed for clean UX -->
    
    <div :class="isDesktopModeComputed ? 'desktop-content-container' : 'container mx-auto px-4 py-8'">
      <!-- Header Section -->
      <div :class="isDesktopModeComputed ? 'desktop-header' : 'bg-white rounded-lg shadow-sm p-6 mb-6'">
        <div class="header-content">
          <div class="title-section">
            <div class="title-icon">
              <svg viewBox="0 0 24 24" fill="none" class="section-icon">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="title-text">
              <h1 :class="isDesktopModeComputed ? 'desktop-title' : 'text-2xl font-bold text-gray-800'">Document Processing</h1>
              <p :class="isDesktopModeComputed ? 'desktop-subtitle' : 'text-gray-600 mt-2'">Transform documents into AI-ready chunks with professional batch processing</p>
            </div>
          </div>
          <div class="flex space-x-2">
            <button 
              @click="showBatchHelp = true"
              :class="isDesktopModeComputed ? 'desktop-action-button secondary' : 'btn btn-secondary'"
              title="View batch processing tips"
            >
              <i class="fas fa-info-circle"></i>
              <span>Tips</span>
            </button>
            <button 
              @click="showDebugPanel = !showDebugPanel"
              class="px-4 py-2 font-bold text-white rounded-md shadow-lg hover:shadow-xl transition-all"
              style="background-color: #ff6600; border: 2px solid #ff4400; font-size: 14px;"
              title="Toggle Debug Panel"
            >
              <i class="fas fa-bug mr-2"></i>
              <span>{{ showDebugPanel ? 'Hide Debug' : 'Show Debug' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- DEBUG PANEL - TEMPORARY -->
      <div v-if="showDebugPanel" class="desktop-card mb-6 border-2 border-orange-400 bg-orange-50">
        <div class="desktop-card-header bg-orange-100">
          <h3 class="text-lg font-bold text-orange-800">🔍 Document Processing Debug Panel</h3>
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
              <h4 class="font-semibold text-orange-700 mb-2">File Queue Status:</h4>
              <div class="bg-white p-3 rounded border border-orange-300">
                <p class="text-sm"><strong>Total Files:</strong> {{ fileQueue.length }}</p>
                <p class="text-sm"><strong>Processed:</strong> {{ completedFiles.length }}</p>
                <p class="text-sm"><strong>Failed:</strong> {{ failedFiles.length }}</p>
                <p class="text-sm"><strong>Current Step:</strong> {{ step }}</p>
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
            <h4 class="font-semibold text-orange-700 mb-2">Last Processed File:</h4>
            <div class="bg-white p-3 rounded border border-orange-300">
              <p class="text-sm" v-if="debugLastFile.name">
                <strong>File:</strong> {{ debugLastFile.name }}
              </p>
              <p class="text-sm" v-if="debugLastFile.extractedText">
                <strong>Extracted Text Length:</strong> {{ debugLastFile.extractedText.length }} chars
              </p>
              <p class="text-sm" v-if="debugLastFile.extractedText">
                <strong>Text Preview:</strong>
              </p>
              <div v-if="debugLastFile.extractedText" class="bg-gray-100 p-2 rounded mt-1 text-xs font-mono overflow-x-auto" style="max-height: 100px; overflow-y: auto;">
                {{ debugLastFile.extractedText.substring(0, 500) + '...' }}
              </div>
              <p class="text-sm" v-if="debugLastFile.chunksCreated !== undefined">
                <strong>Chunks Created:</strong> {{ debugLastFile.chunksCreated }}
              </p>
              <p class="text-sm" v-if="debugLastFile.firstChunk">
                <strong>First Chunk Content:</strong>
              </p>
              <div v-if="debugLastFile.firstChunk" class="bg-gray-100 p-2 rounded mt-1 text-xs font-mono overflow-x-auto" style="max-height: 100px; overflow-y: auto;">
                {{ debugLastFile.firstChunk }}
              </div>
              <p class="text-sm text-gray-500" v-if="!debugLastFile.name">No file processed yet</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button 
              @click="inspectChunks" 
              class="btn btn-sm bg-blue-600 text-white hover:bg-blue-700"
            >
              <i class="fas fa-search mr-1"></i> Inspect All Chunks
            </button>
            <button 
              @click="testPdfExtraction" 
              class="btn btn-sm bg-green-600 text-white hover:bg-green-700"
            >
              <i class="fas fa-vial mr-1"></i> Test PDF Extraction
            </button>
            <button 
              @click="clearAutosaveData" 
              class="btn btn-sm bg-red-600 text-white hover:bg-red-700"
            >
              <i class="fas fa-trash mr-1"></i> Clear Autosave Data
            </button>
            <button 
              @click="clearDebugData" 
              class="btn btn-sm bg-red-600 text-white hover:bg-red-700"
            >
              <i class="fas fa-trash mr-1"></i> Clear Debug Data
            </button>
          </div>
        </div>
      </div>

      <!-- Progress Steps -->
      <div :class="isDesktopModeComputed ? 'desktop-progress-container' : 'mb-8'">
        <div :class="isDesktopModeComputed ? 'desktop-progress-steps' : 'flex justify-between items-center'">
          <div class="progress-step">
            <div 
              :class="[
                'desktop-step-indicator',
                step >= 1 
                  ? (step === 1 ? 'desktop-step-active' : 'desktop-step-completed') 
                  : 'desktop-step-inactive'
              ]"
            >
              <i v-if="step > 1" class="fas fa-check"></i>
              <span v-else>1</span>
            </div>
            <span :class="isDesktopModeComputed ? 'desktop-step-label' : 'text-sm text-gray-600'">Upload</span>
          </div>
          <div :class="[isDesktopMode ? 'desktop-step-line' : 'step-line', { 'desktop-step-line-completed': step >= 2 }]"></div>
          <div class="progress-step">
            <div 
              :class="[
                'desktop-step-indicator',
                step >= 2 
                  ? (step === 2 ? 'desktop-step-active' : 'desktop-step-completed') 
                  : 'desktop-step-inactive'
              ]"
            >
              <i v-if="step > 2" class="fas fa-check"></i>
              <span v-else>2</span>
            </div>
            <span :class="isDesktopModeComputed ? 'desktop-step-label' : 'text-sm text-gray-600'">Configure</span>
          </div>
          <div :class="[isDesktopMode ? 'desktop-step-line' : 'step-line', { 'desktop-step-line-completed': step >= 3 }]"></div>
          <div class="progress-step">
            <div 
              :class="[
                'desktop-step-indicator',
                step >= 3 
                  ? (step === 3 ? 'desktop-step-active' : 'desktop-step-completed') 
                  : 'desktop-step-inactive'
              ]"
            >
              <i v-if="step > 3" class="fas fa-check"></i>
              <span v-else>3</span>
            </div>
            <span :class="isDesktopModeComputed ? 'desktop-step-label' : 'text-sm text-gray-600'">Process</span>
          </div>
          <div :class="[isDesktopMode ? 'desktop-step-line' : 'step-line', { 'desktop-step-line-completed': step >= 4 }]"></div>
          <div class="progress-step">
            <div 
              :class="[
                'desktop-step-indicator',
                step >= 4 
                  ? (step === 4 ? 'desktop-step-active' : 'desktop-step-completed') 
                  : 'desktop-step-inactive'
              ]"
            >
              <i v-if="step > 4" class="fas fa-check"></i>
              <span v-else>4</span>
            </div>
            <span :class="isDesktopModeComputed ? 'desktop-step-label' : 'text-sm text-gray-600'">Review</span>
          </div>
          <div :class="[isDesktopMode ? 'desktop-step-line' : 'step-line', { 'desktop-step-line-completed': step >= 5 }]"></div>
          <div class="progress-step">
            <div 
              :class="[
                'desktop-step-indicator',
                step >= 5 
                  ? 'desktop-step-completed' 
                  : (step === 5 ? 'desktop-step-active' : 'desktop-step-inactive')
              ]"
            >
              <i v-if="step >= 5" class="fas fa-check"></i>
              <span v-else>5</span>
            </div>
            <span :class="isDesktopModeComputed ? 'desktop-step-label' : 'text-sm text-gray-600'">Export</span>
          </div>
        </div>
      </div>

      <!-- Step 1: File Upload -->
      <div :class="[isDesktopMode ? 'desktop-card' : 'bg-white rounded-lg shadow-sm mb-6', { 'step-active': step === 1, 'step-completed': step > 1 }]">
        <div :class="isDesktopModeComputed ? 'desktop-card-header' : 'p-6 border-b'">
          <div class="flex items-center">
            <div :class="[isDesktopMode ? 'desktop-step-badge' : 'step-badge', 'mr-4']">
              <i v-if="step > 1" class="fas fa-check text-white"></i>
              <span v-else class="text-white font-semibold">1</span>
            </div>
            <div>
              <h2 :class="isDesktopModeComputed ? 'desktop-card-title' : 'text-xl font-semibold'">Upload Your Documents</h2>
              <p :class="isDesktopModeComputed ? 'desktop-card-subtitle' : 'text-gray-600 text-sm mt-1'">Select your PDF or Markdown files to process</p>
            </div>
          </div>
        </div>
        <div :class="isDesktopModeComputed ? 'desktop-card-content' : 'p-6'">
          <!-- Chunking Guide -->
          <ChunkingGuide :is-desktop-mode="isDesktopMode" />
          
          <!-- File Upload -->
        <div 
          :class="[
            isDesktopMode ? 'desktop-drag-zone' : 'drag-zone',
            'p-8 text-center transition-all duration-300 relative overflow-hidden',
            {
              'drag-zone-active': dragActive,
              'opacity-50 cursor-not-allowed': processing
            }
          ]"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @dragenter="handleDragEnter"
          @dragleave="handleDragLeave"
        >
          <div class="mb-4">
            <i 
              class="text-6xl transition-all duration-300"
              :class="{
                'fas fa-cloud-upload-alt text-sage': !dragActive && !processing,
                'fas fa-download text-sage-dark animate-bounce': dragActive,
                'fas fa-cog fa-spin': processing
              }"
              :style="processing ? 'color: var(--neutral-muted);' : ''"
            ></i>
          </div>
          <input 
            ref="fileInput"
            type="file" 
            accept=".md,.markdown,.pdf,.docx" 
            @change="handleFileUpload"
            class="hidden"
            multiple
            :disabled="processing"
          />
          <button 
            @click="$refs.fileInput.click()"
            :disabled="processing"
            class="btn-primary px-8 py-4 rounded-brand font-semibold transition-all transform hover:scale-105 soft-shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <i class="fas fa-file-alt mr-2"></i>Choose Documents
          </button>
          <p class="mt-3 text-lg transition-all duration-300" :style="dragActive ? 'color: var(--brand-gold); font-weight: 600;' : 'color: var(--text-secondary);'">
            <span v-if="dragActive">
              <i class="fas fa-hand-point-down mr-2 animate-bounce"></i>
              Drop files here to upload!
            </span>
            <span v-else-if="processing" style="color: var(--text-secondary);">Processing files...</span>
            <span v-else>Drag & drop files here or click to browse</span>
          </p>
          <p class="mt-2 text-sm text-neutral-600">
            Supports .md, .markdown, .pdf, and .docx files • Maximum 50MB per file • Up to 20 files
          </p>
        </div>
        </div>
      </div>

      <!-- Step 2: Processing Configuration -->
      <div v-if="uploadedFiles.length > 0 && step >= 2" :class="[isDesktopMode ? 'desktop-card' : 'bg-white rounded-lg shadow-sm mb-6', { 'step-active': step === 2, 'step-completed': step > 2 }]">
        <div :class="isDesktopModeComputed ? 'desktop-card-header' : 'p-6 border-b'">
          <div class="flex items-center">
            <div :class="[isDesktopMode ? 'desktop-step-badge' : 'step-badge', 'mr-4']">
              <i v-if="step > 2" class="fas fa-check text-white"></i>
              <span v-else class="text-white font-semibold">2</span>
            </div>
            <div>
              <h2 :class="isDesktopModeComputed ? 'desktop-card-title' : 'text-xl font-semibold'">Configure Processing</h2>
              <p :class="isDesktopModeComputed ? 'desktop-card-subtitle' : 'text-gray-600 text-sm mt-1'">Choose how to break your documents into AI-friendly chunks</p>
            </div>
          </div>
        </div>
        <div :class="isDesktopModeComputed ? 'desktop-card-content' : 'p-6'">
        <!-- Document Analysis Status -->
        <div v-if="isAnalyzing || documentAnalyses.length > 0" class="mb-4 p-4 rounded-brand" style="background: linear-gradient(135deg, var(--brand-sage-light) 0%, var(--neutral-bg) 100%);">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-semibold text-sage-dark">📊 Document Analysis</h3>
            <button 
              v-if="documentAnalyses.length > 0" 
              @click="toggleRecommendations"
              class="text-xs px-2 py-1 rounded border border-sage-dark text-sage-dark hover:bg-sage-dark hover:text-white transition-colors"
            >
              {{ showRecommendations ? 'Hide' : 'Show' }} Recommendations
            </button>
          </div>
          
          <div v-if="isAnalyzing" class="mb-3">
            <div class="flex items-center mb-1">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-sage-dark mr-2"></div>
              <span class="text-sm">Analyzing document structure...</span>
            </div>
            <div :class="isDesktopModeComputed ? 'desktop-analysis-progress-bg' : 'w-full rounded-full h-2'" :style="!isDesktopMode ? 'background-color: rgba(168, 183, 157, 0.2);' : ''">
              <div :class="isDesktopModeComputed ? 'desktop-analysis-progress-fill' : 'bg-sage-dark h-2 rounded-full transition-all duration-300'" :style="`width: ${analysisProgress}%`"></div>
            </div>
            <span class="text-xs" style="color: #64748b;">{{ analysisProgress }}% complete</span>
          </div>
          
          <div v-if="documentAnalyses.length > 0" class="text-sm">
            <p class="text-sage-dark">
              Analyzed {{ documentAnalyses.length }} document{{ documentAnalyses.length !== 1 ? 's' : '' }}
              <span v-if="recommendationsApplied" class="ml-2 text-xs px-2 py-1 rounded" style="background-color: rgba(212, 175, 55, 0.1); color: #8B7355;">
                Recommendations Applied
              </span>
            </p>
            
            <!-- Enhanced recommendations summary -->
            <div v-if="showRecommendations && currentAnalysis && currentAnalysis.recommendations" class="mt-4">
              <div class="bg-gradient-to-r from-sage-50 to-neutral-50 border-l-4 border-sage-400 rounded-lg p-4 shadow-sm" style="background: linear-gradient(to right, rgba(168, 183, 157, 0.1), rgba(248, 250, 252, 0.9)); border-left-color: #A8B79D;">
                <div class="flex items-start justify-between">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <svg class="w-5 h-5" style="color: #A8B79D;" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                      </svg>
                    </div>
                    <div class="ml-3 flex-1">
                      <h4 class="text-sm font-semibold mb-2" style="color: #A8B79D;">
                        AI-Powered Chunking Recommendations
                      </h4>
                      
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <!-- Method Recommendation -->
                        <div class="bg-white/60 rounded-lg p-3 border" style="border-color: rgba(168, 183, 157, 0.3);">
                          <div class="flex items-center mb-1">
                            <svg class="w-4 h-4 mr-1" style="color: #A8B79D;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                            </svg>
                            <span class="text-xs font-medium uppercase tracking-wide" style="color: #A8B79D;">Method</span>
                          </div>
                          <p class="text-sm font-semibold capitalize" style="color: #2D3748;">
                            {{ currentAnalysis.recommendations?.recommendedMethod || 'N/A' }}
                          </p>
                        </div>
                        
                        <!-- Size Recommendation -->
                        <div class="bg-white/60 rounded-lg p-3 border" style="border-color: rgba(168, 183, 157, 0.3);">
                          <div class="flex items-center mb-1">
                            <svg class="w-4 h-4 mr-1" style="color: #A8B79D;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"></path>
                            </svg>
                            <span class="text-xs font-medium uppercase tracking-wide" style="color: #8CA085;">Chunk Size</span>
                          </div>
                          <p class="text-sm font-semibold" style="color: #2D3748;">
                            {{ currentAnalysis.recommendations?.recommendedChunkSize || 'N/A' }}
                            <span class="text-xs ml-1" style="color: #64748b;">
                              {{ currentAnalysis.recommendations?.recommendedMethod === 'characters' ? 'chars' : 'words' }}
                            </span>
                          </p>
                        </div>
                        
                        <!-- Overlap Recommendation -->
                        <div class="bg-white/60 rounded-lg p-3 border" style="border-color: rgba(168, 183, 157, 0.3);">
                          <div class="flex items-center mb-1">
                            <svg class="w-4 h-4 mr-1" style="color: #D4AF37;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                            </svg>
                            <span class="text-xs font-medium uppercase tracking-wide" style="color: #B8941F;">Overlap</span>
                          </div>
                          <p class="text-sm font-semibold" style="color: #2D3748;">
                            <span v-if="currentAnalysis.recommendations?.recommendedMethod === 'sections'">N/A</span>
                            <span v-else>{{ Math.round((currentAnalysis.recommendations?.recommendedOverlap / currentAnalysis.recommendations?.recommendedChunkSize) * 100) || 20 }}%</span>
                          </p>
                        </div>
                      </div>
                      
                      <!-- Reasoning -->
                      <div v-if="currentAnalysis.recommendations?.reasoning" class="bg-white/40 rounded-lg p-3 border mb-3" style="border-color: rgba(168, 183, 157, 0.2);">
                        <p class="text-xs leading-relaxed" style="color: #64748b;">
                          <span class="font-medium">💡 Why these settings:</span> {{ currentAnalysis.recommendations.reasoning }}
                        </p>
                      </div>
                      
                      <!-- Document Stats -->
                      <div v-if="currentAnalysis.documentStats && currentAnalysis.contentComplexity" class="flex flex-wrap gap-2 text-xs mb-3" style="color: #64748b;">
                        <span class="bg-white/60 px-2 py-1 rounded border" style="border-color: rgba(168, 183, 157, 0.3);">
                          {{ currentAnalysis.documentStats.totalWords?.toLocaleString() || 'N/A' }} words
                        </span>
                        <span class="bg-white/60 px-2 py-1 rounded border" style="border-color: rgba(168, 183, 157, 0.3);">
                          {{ currentAnalysis.contentComplexity.readabilityScore || 'N/A' }}/100 readability
                        </span>
                        <span class="bg-white/60 px-2 py-1 rounded border" style="border-color: rgba(168, 183, 157, 0.3);">
                          ~{{ currentAnalysis.recommendations.expectedChunkCount || 'N/A' }} chunks expected
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex items-center justify-between mt-4 pt-3 border-t" style="border-color: rgba(168, 183, 157, 0.2);">
                  <button @click="applyRecommendations(currentAnalysis)" 
                          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition-colors" style="background: linear-gradient(135deg, #A8B79D 0%, #8CA085 100);">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Apply These Settings
                  </button>
                  
                  <div class="flex items-center space-x-2 text-xs">
                    <button @click="toggleRecommendations()" 
                            class="transition-colors" style="color: #A8B79D;" onmouseover="this.style.color='#8CA085'" onmouseout="this.style.color='#A8B79D'">
                      Hide Recommendations
                    </button>
                    <span style="color: #A8B79D;">•</span>
                    <button @click="resetRecommendations()" 
                            class="transition-colors" style="color: #A8B79D;" onmouseover="this.style.color='#8CA085'" onmouseout="this.style.color='#A8B79D'">
                      Reset Analysis
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium mb-3">
              Chunking Method
              <span class="ml-2 text-xs accent">{{ recommendationsApplied ? 'Recommended' : 'Important' }}</span>
            </label>
            <div class="grid grid-cols-1 gap-3">
              <div class="chunk-method" :class="{ 'selected': chunkingOptions.chunkBy === 'words' }" @click="chunkingOptions.chunkBy = 'words'">
                <h4 class="font-semibold mb-1">By Words</h4>
                <p class="text-sm" style="color: var(--text-secondary);">Recommended for most content. Splits every X words.</p>
              </div>
              <div class="chunk-method" :class="{ 'selected': chunkingOptions.chunkBy === 'characters' }" @click="chunkingOptions.chunkBy = 'characters'">
                <h4 class="font-semibold mb-1">By Characters</h4>
                <p class="text-sm" style="color: var(--text-secondary);">Precise control over chunk size using character count.</p>
              </div>
              <div class="chunk-method" :class="{ 'selected': chunkingOptions.chunkBy === 'sections' }" @click="chunkingOptions.chunkBy = 'sections'">
                <h4 class="font-semibold mb-1">By Sections</h4>
                <p class="text-sm" style="color: var(--text-secondary);">Preserves document structure using headers.</p>
              </div>
            </div>
            <p class="text-xs mt-1" style="color: var(--text-secondary);">{{ getChunkingDescription() }}</p>
          </div>
          <div v-if="chunkingOptions.chunkBy !== 'sections'">
            <label class="block text-sm font-medium mb-3" title="Optimal size for most AI applications">
              Chunk Size
              <span class="ml-2 text-xs accent">{{ getOptimalRange() }}</span>
            </label>
            <input 
              v-model.number="chunkingOptions.chunkSize" 
              type="range"
              :min="chunkingOptions.chunkBy === 'words' ? 200 : 800"
              :max="chunkingOptions.chunkBy === 'words' ? 1000 : 4000"
              class="w-full mb-2"
            />
            <div class="flex justify-between text-sm" style="color: var(--text-secondary);">
              <span>Small ({{ chunkingOptions.chunkBy === 'words' ? '200' : '800' }})</span>
              <span class="font-medium text-sage-dark">{{ chunkingOptions.chunkSize }}</span>
              <span>Large ({{ chunkingOptions.chunkBy === 'words' ? '1000' : '4000' }})</span>
            </div>
          </div>
        </div>
        
        <div v-if="chunkingOptions.chunkBy !== 'sections'" class="mt-4">
          <label class="block text-sm font-medium mb-3" title="This helps prevent content loss across splits">
            Overlap: {{ chunkingOptions.overlap }} {{ chunkingOptions.chunkBy }} ({{ Math.round((chunkingOptions.overlap / chunkingOptions.chunkSize) * 100) }}%)
            <span class="ml-2 text-xs accent">Prevents info loss</span>
          </label>
          <input 
            v-model.number="chunkingOptions.overlap" 
            type="range"
            min="0" 
            :max="Math.floor(chunkingOptions.chunkSize * 0.3)"
            class="w-full mb-2"
          />
          <div class="flex justify-between text-sm" style="color: var(--text-secondary);">
            <span>None (0%)</span>
            <span class="font-medium text-sage-dark">{{ chunkingOptions.overlap }} {{ chunkingOptions.chunkBy === 'words' ? 'words' : 'chars' }} ({{ Math.round((chunkingOptions.overlap / chunkingOptions.chunkSize) * 100) }}%)</span>
            <span>Max (30%)</span>
          </div>
        </div>
        
        <div class="mt-6 p-4 rounded-brand" style="background: linear-gradient(135deg, var(--brand-sage-light) 0%, var(--brand-gold-soft) 100%);">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input 
                v-model="chunkingOptions.autoTag" 
                type="checkbox" 
                id="autoTag"
                class="mr-3 w-5 h-5" style="color: #A8B79D;"
              />
              <label for="autoTag" class="text-sm font-medium">
                Auto-suggest tags (Highly recommended)
                <span class="ml-2 text-xs accent">Improves AI accuracy</span>
              </label>
            </div>
            <div class="space-y-4">
              <button 
                @click="processFiles"
                class="btn-primary px-8 py-3 rounded-brand font-semibold transition-all transform hover:scale-105 soft-shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                :disabled="processing"
              >
                <span v-if="processing"><i class="fas fa-cog fa-spin mr-2"></i>Processing...</span>
                <span v-else><i class="fas fa-rocket mr-2"></i>Process Files</span>
              </button>
              
              <!-- Progress Indicator -->
              <div v-if="processing" class="rounded-brand p-4 border-sage-light" style="background-color: var(--neutral-bg); border-width: 1px; border-style: solid;">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium" style="color: var(--neutral-text);">{{ processingStatus }}</span>
                  <span class="text-sm" style="color: var(--text-secondary);">{{ processingProgress }}%</span>
                </div>
                <div class="w-full rounded-full h-2" style="background-color: var(--brand-sage-light);">
                  <div 
                    class="progress-sage h-2 rounded-full transition-all duration-300" 
                    :style="{ width: processingProgress + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Step Navigation -->
        <div v-if="uploadedFiles.length > 0" class="wizard-navigation mt-6 pt-4 border-t-2" style="border-color: var(--brand-sage-light);">
          <!-- Help message for Step 2 -->
          <div v-if="step === 2 && !hasProcessedFiles" class="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <div class="flex items-center text-amber-800">
              <i class="fas fa-info-circle mr-2"></i>
              <span class="text-sm">Click "Process Files" above to chunk your documents before proceeding to the next step.</span>
            </div>
          </div>
          
          <!-- Success message when processing is complete -->
          <div v-if="step === 2 && hasProcessedFiles" class="mb-4 p-3 rounded-lg" style="background-color: rgba(168, 183, 157, 0.1); border: 1px solid rgba(168, 183, 157, 0.3);">
            <div class="flex items-center" style="color: #8CA085;">
              <i class="fas fa-check-circle mr-2"></i>
              <span class="text-sm">Processing complete! You can now proceed to the next step to review your chunks.</span>
            </div>
          </div>
          
          <div class="flex justify-between items-center">
            <button 
              @click="previousStep" 
              :disabled="step === 1"
              class="nav-button nav-button-secondary"
              :class="{ 'opacity-50 cursor-not-allowed': step === 1 }"
            >
              <i class="fas fa-chevron-left mr-2"></i>
              Previous
            </button>
            
            <div class="flex items-center space-x-3">
              <span class="text-sm font-medium" style="color: var(--text-secondary);">
                Step {{ step }} of 5
              </span>
              <!-- Progress dots -->
              <div class="flex items-center space-x-1">
                <div 
                  v-for="stepNumber in 5" 
                  :key="stepNumber"
                  class="progress-dot transition-all duration-200"
                  :class="{
                    'progress-dot-active': stepNumber <= step,
                    'progress-dot-inactive': stepNumber > step
                  }"
                ></div>
              </div>
            </div>
            
            <button 
              @click="nextStep" 
              :disabled="!canAdvanceToNextStep"
              class="nav-button nav-button-primary"
              :class="{ 
                'opacity-50 cursor-not-allowed': !canAdvanceToNextStep,
                'hover-effect-ready': canAdvanceToNextStep && step === 2
              }"
              :title="!canAdvanceToNextStep && step === 2 ? 'Process files first to continue' : ''"
            >
              {{ step === 5 ? 'Finish' : 'Next' }}
              <i v-if="step < 5" class="fas fa-chevron-right ml-2"></i>
              <i v-else class="fas fa-check ml-2"></i>
            </button>
          </div>
        </div>
        </div>
      </div>

    <!-- Step 3: Process Documents -->
    <div v-if="step === 3" :class="isDesktopModeComputed ? 'desktop-card' : 'bg-white rounded-lg shadow-sm mb-6'">
      <div :class="isDesktopModeComputed ? 'desktop-card-header' : 'p-6 border-b'">
        <div class="flex items-center">
          <div class="desktop-step-badge mr-4">
            <i v-if="step > 3" class="fas fa-check text-white"></i>
            <span v-else class="text-white font-semibold">3</span>
          </div>
          <div>
            <h2 class="desktop-card-title">Processing Results</h2>
            <p class="desktop-card-subtitle">Review your processing results and file queue status below.</p>
          </div>
        </div>
      </div>
      <div class="desktop-card-content">
      </div>
      
    <!-- Enhanced File Queue Management -->
    <div v-if="fileQueue.length > 0" class="mb-6">
      <!-- Processing Overview -->
      <div v-if="hasProcessingFiles || completedFiles.length > 0" class="mb-4 p-4 rounded-brand" style="background-color: var(--brand-sage-light);">
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-lg font-semibold" style="color: var(--neutral-text);">Processing Progress</h3>
          <span class="text-sm font-medium" style="color: var(--text-secondary);">{{ overallProgress }}% Complete</span>
        </div>
        
        <div class="w-full rounded-full h-3 mb-3" style="background-color: var(--neutral-200);">
          <div 
            class="h-3 rounded-full transition-all duration-300" 
            style="background-color: var(--brand-sage);"
            :style="{ width: overallProgress + '%' }"
          ></div>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
          <div>
            <div class="font-semibold text-lg" style="color: var(--neutral-text);">{{ queuedFiles.length }}</div>
            <div style="color: var(--text-secondary);">Queued</div>
          </div>
          <div>
            <div class="font-semibold text-lg" style="color: #D4AF37;">{{ processingFiles.length }}</div>
            <div style="color: var(--text-secondary);">Processing</div>
          </div>
          <div>
            <div class="font-semibold text-lg" style="color: #A8B79D;">{{ completedFiles.length }}</div>
            <div style="color: var(--text-secondary);">Completed</div>
          </div>
          <div>
            <div class="font-semibold text-lg" style="color: #DC2626;">{{ failedFiles.length }}</div>
            <div style="color: var(--text-secondary);">Failed</div>
          </div>
        </div>
        
        <!-- Time Estimates -->
        <div v-if="processingStats.estimatedTimeRemaining" class="mt-3 text-center text-sm" style="color: var(--text-secondary);">
          Estimated time remaining: {{ Math.ceil(processingStats.estimatedTimeRemaining) }} minutes
          <span v-if="processingStats.processingRate > 0">
            ({{ processingStats.processingRate.toFixed(1) }} files/min)
          </span>
        </div>
      </div>

      <!-- File Queue List -->
      <div class="space-y-2 max-h-80 overflow-y-auto">
        <h3 class="text-lg font-semibold mb-3" style="color: var(--neutral-text);">
          File Queue ({{ fileQueue.length }})
        </h3>
        
        <!-- Wrap each file in error boundary for individual error handling -->
        <FileProcessingErrorBoundary
          v-for="queueFile in fileQueue" 
          :key="queueFile.id"
          :file-context="{ 
            name: queueFile.name, 
            size: queueFile.size, 
            type: queueFile.type,
            lastModified: queueFile.lastModified 
          }"
          :processing-context="{ 
            stage: getProcessingStage(queueFile.status),
            progress: queueFile.progress,
            operation: 'document-processing'
          }"
          :can-retry-file="queueFile.status === 'failed'"
          :can-skip-file="queueFile.status === 'queued' || queueFile.status === 'processing'"
          :can-remove-file="true"
          :on-retry="() => retryFile(queueFile.id)"
          :on-skip="() => skipFile(queueFile.id)"
          :on-remove="() => removeFromQueue(queueFile.id)"
          @error-occurred="handleFileProcessingError"
        >
        
        <div 
             :class="[
               isDesktopMode ? 'desktop-queue-item' : 'flex items-center justify-between p-3 rounded-brand border-l-4 transition-all',
               {
                 'border-gray-300': !isDesktopMode && queueFile.status === 'queued',
                 'border-yellow-500': !isDesktopMode && queueFile.status === 'processing',
                 'border-green-500': !isDesktopMode && queueFile.status === 'completed',
                 'border-red-500': !isDesktopMode && queueFile.status === 'failed',
                 'desktop-queue-item-queued': isDesktopMode && queueFile.status === 'queued',
                 'desktop-queue-item-processing': isDesktopMode && queueFile.status === 'processing',
                 'desktop-queue-item-completed': isDesktopMode && queueFile.status === 'completed',
                 'desktop-queue-item-failed': isDesktopMode && queueFile.status === 'failed'
               }
             ]"
             style="background-color: var(--brand-sage-light);">
          
          <div class="flex items-center space-x-3 flex-1">
            <!-- File Icon -->
            <div class="flex-shrink-0">
              <i v-if="queueFile.type === 'application/pdf'" class="fas fa-file-pdf text-gold text-lg"></i>
              <i v-else class="fas fa-file-alt text-sage text-lg"></i>
            </div>
            
            <!-- File Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2">
                <span class="font-medium truncate" style="color: var(--neutral-text);">{{ queueFile.name }}</span>
                <span class="text-xs px-2 py-1 rounded text-white flex-shrink-0"
                      :class="{
                        'bg-gray-400': queueFile.status === 'queued',
                        'bg-sage-dark': queueFile.status === 'processing',
                        'bg-sage': queueFile.status === 'completed',
                        'bg-red-500': queueFile.status === 'failed'
                      }">
                  {{ queueFile.status.toUpperCase() }}
                </span>
              </div>
              
              <div class="flex items-center space-x-4 mt-1">
                <span class="text-sm" style="color: var(--text-secondary);">{{ formatFileSize(queueFile.size) }}</span>
                
                <!-- Processing Progress -->
                <div v-if="queueFile.status === 'processing'" class="flex-1 max-w-32">
                  <div :class="isDesktopModeComputed ? 'desktop-progress-bar-bg' : 'w-full rounded-full h-2'" :style="!isDesktopMode ? 'background-color: var(--neutral-300);' : ''">
                    <div :class="isDesktopModeComputed ? 'desktop-progress-bar-fill' : 'h-2 rounded-full transition-all'" :style="isDesktopMode ? `width: ${queueFile.progress}%` : `width: ${queueFile.progress}%; backgroundColor: #D4AF37`"></div>
                  </div>
                </div>
                
                <!-- Processing Time -->
                <span v-if="queueFile.processingTime > 0" class="text-xs" style="color: var(--text-secondary);">
                  {{ (queueFile.processingTime / 1000).toFixed(1) }}s
                </span>
                
                <!-- Chunks Generated -->
                <span v-if="queueFile.chunks.length > 0" class="text-xs" style="color: var(--text-secondary);">
                  {{ queueFile.chunks.length }} chunks
                </span>
              </div>
              
              <!-- Error Message -->
              <div v-if="queueFile.error" class="text-xs mt-1" style="color: #DC2626;">
                {{ queueFile.error }}
              </div>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex items-center space-x-2 flex-shrink-0">
            <button 
              v-if="queueFile.status === 'failed'"
              @click="retryFile(queueFile.id)"
              class="px-3 py-1 text-xs text-white rounded transition-colors" style="background: linear-gradient(135deg, #A8B79D 0%, #8CA085 100);"
            >
              <i class="fas fa-redo mr-1"></i>Retry
            </button>
            
            <button 
              @click="removeFileFromQueue(queueFile.id)"
              class="px-3 py-1 text-xs text-white rounded transition-colors" style="background-color: #DC2626;" @mouseover="$event.target.style.backgroundColor='#B91C1C'" @mouseout="$event.target.style.backgroundColor='#DC2626'"
            >
              <i class="fas fa-times mr-1"></i>Remove
            </button>
          </div>
        </div>
        
        </FileProcessingErrorBoundary>
      </div>
    </div>
    
    <!-- Step 3 Navigation -->
    <div class="wizard-navigation mt-6 pt-4 border-t-2" style="border-color: var(--brand-sage-light);">
      <div class="flex justify-between items-center">
        <button 
          @click="previousStep" 
          :disabled="step === 1"
          class="nav-button nav-button-secondary"
          :class="{ 'opacity-50 cursor-not-allowed': step === 1 }"
        >
          <i class="fas fa-chevron-left mr-2"></i>
          Previous
        </button>
        
        <div class="flex items-center space-x-3">
          <span class="text-sm font-medium" style="color: var(--text-secondary);">
            Step {{ step }} of 5
          </span>
          <!-- Progress dots -->
          <div class="flex items-center space-x-1">
            <div 
              v-for="stepNumber in 5" 
              :key="stepNumber"
              class="progress-dot transition-all duration-200"
              :class="{
                'progress-dot-active': stepNumber <= step,
                'progress-dot-inactive': stepNumber > step
              }"
            ></div>
          </div>
        </div>
        
        <button 
          @click="nextStep" 
          :disabled="!canAdvanceToNextStep"
          class="nav-button nav-button-primary"
          :class="{ 'opacity-50 cursor-not-allowed': !canAdvanceToNextStep }"
        >
          {{ step === 5 ? 'Finish' : 'Next' }}
          <i v-if="step < 5" class="fas fa-chevron-right ml-2"></i>
          <i v-else class="fas fa-check ml-2"></i>
        </button>
      </div>
    </div>
        </div>
    </div> <!-- End of Step 3 -->

      <!-- Quality Analysis (shown when chunks exist) -->
      <QualityAnalyzer v-if="chunks.length > 0 && step >= 3" :chunks="chunks" />

      <!-- Step 4: Review & Edit Chunks -->
      <div v-if="chunks.length > 0 && step >= 4" class="desktop-card" :class="{ 'step-active': step === 4, 'step-completed': step > 4 }">
        <div :class="isDesktopModeComputed ? 'desktop-card-header' : 'p-6 border-b'">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div :class="[isDesktopMode ? 'desktop-step-badge' : 'step-badge', 'mr-4']">
                <i v-if="step > 4" class="fas fa-check text-white"></i>
                <span v-else class="text-white font-semibold">4</span>
              </div>
              <div>
                <h2 :class="isDesktopModeComputed ? 'desktop-card-title' : 'text-xl font-semibold'">
                  Review & Edit Chunks ({{ chunks.length }})
                </h2>
                <p :class="isDesktopModeComputed ? 'desktop-card-subtitle' : 'text-gray-600 text-sm mt-1'">
                  Fine-tune your chunks for optimal AI performance
                </p>
              </div>
            </div>
            <div class="flex space-x-3">
              <button 
                @click="clearChunks"
                class="px-4 py-2 rounded-brand font-medium transition-colors"
                style="background-color: var(--text-secondary); color: white;"
                @mouseover="$event.target.style.backgroundColor = 'var(--neutral-text)'"
                @mouseout="$event.target.style.backgroundColor = 'var(--text-secondary)'"
              >
                <i class="fas fa-trash mr-2"></i>Clear All
              </button>
            </div>
          </div>
        </div>
        <div :class="isDesktopModeComputed ? 'desktop-card-content' : 'p-6'">

        <!-- Chunk Statistics -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 rounded-brand" style="background-color: var(--brand-sage-light);">
          <div class="text-center">
            <div class="text-2xl font-bold text-sage-dark">{{ chunks.length }}</div>
            <div class="text-sm" style="color: var(--text-secondary);">Total Chunks</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-sage-dark">{{ avgWordsPerChunk }}</div>
            <div class="text-sm" style="color: var(--text-secondary);">Avg Words/Chunk</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-sage-dark">{{ totalWords }}</div>
            <div class="text-sm" style="color: var(--text-secondary);">Total Words</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-sage-dark">{{ uniqueTags }}</div>
            <div class="text-sm" style="color: var(--text-secondary);">Unique Tags</div>
          </div>
        </div>

        <!-- Search and Filter -->
        <div class="mb-6">
          <div class="relative">
            <input 
              v-model="searchQuery"
              type="text"
              placeholder="Search chunks by content, tags, or ID..."
              class="w-full p-4 pl-12 border-2 rounded-brand text-lg transition-all"
              style="border-color: var(--brand-sage-light); background-color: var(--neutral-bg);"
              @focus="$event.target.style.borderColor = 'var(--brand-sage)'; $event.target.style.boxShadow = '0 0 0 3px rgba(168, 183, 157, 0.1)'"
            />
            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2" style="color: var(--text-secondary);"></i>
          </div>
        </div>

        <!-- Chunks List -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          <div 
            v-for="(chunk, index) in filteredChunks" 
            :key="chunk.chunk_id"
            class="chunk-card hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="chunk-number">
                Chunk {{ index + 1 }}
              </div>
              <button 
                @click="toggleChunkExpanded(index)"
                class="text-sm transition-colors text-sage hover-sage-dark"
              >
                {{ expandedChunks.has(index) ? 'Collapse' : 'Expand' }}
              </button>
            </div>
            
            <div class="chunk-source mb-2">
              {{ chunk.chunk_id }} 
              <span v-if="chunk.metadata.section">({{ chunk.metadata.section }})</span>
            </div>
            
            <div class="mb-4">
              <div :class="{ 'line-clamp-3': !expandedChunks.has(index) }" class="leading-relaxed text-sm">
                {{ chunk.content }}
              </div>
            </div>
            
            <div class="chunk-stats mb-3">
              {{ chunk.metadata.wordCount }} words • {{ chunk.tags.length }} tags
            </div>
            
            <div class="flex flex-wrap gap-2 mb-3">
              <span 
                v-for="tag in chunk.tags" 
                :key="tag"
                class="tag-pill"
              >
                {{ tag }}
              </span>
            </div>
            
            <div class="flex space-x-2">
              <input 
                v-model="chunk.tagsString"
                @input="updateChunkTags(chunk)"
                type="text"
                placeholder="Add tags..."
                class="flex-1 p-2 border rounded text-sm transition-all"
                style="border-color: var(--brand-sage-light); background-color: var(--neutral-bg);"
                @focus="$event.target.style.borderColor = 'var(--brand-sage)'"
              />
              <button 
                class="btn-primary px-3 py-2 text-xs"
                @click="suggestTagsForChunk(chunk)"
                :disabled="!chunk.content || chunk.content.trim().length === 0"
                title="Generate tag suggestions based on chunk content"
              >
                <i class="fas fa-lightbulb mr-1"></i>
                Suggest
              </button>
            </div>
          </div>
        </div>
        
        <!-- Step 4 Navigation -->
        <div class="wizard-navigation mt-6 pt-4 border-t-2" style="border-color: var(--brand-sage-light);">
          <div class="flex justify-between items-center">
            <button 
              @click="previousStep" 
              :disabled="step === 1"
              class="nav-button nav-button-secondary"
              :class="{ 'opacity-50 cursor-not-allowed': step === 1 }"
            >
              <i class="fas fa-chevron-left mr-2"></i>
              Previous
            </button>
            
            <div class="flex items-center space-x-3">
              <span class="text-sm font-medium" style="color: var(--text-secondary);">
                Step {{ step }} of 5
              </span>
              <!-- Progress dots -->
              <div class="flex items-center space-x-1">
                <div 
                  v-for="stepNumber in 5" 
                  :key="stepNumber"
                  class="progress-dot transition-all duration-200"
                  :class="{
                    'progress-dot-active': stepNumber <= step,
                    'progress-dot-inactive': stepNumber > step
                  }"
                ></div>
              </div>
            </div>
            
            <button 
              @click="nextStep" 
              :disabled="!canAdvanceToNextStep"
              class="nav-button nav-button-primary"
              :class="{ 'opacity-50 cursor-not-allowed': !canAdvanceToNextStep }"
            >
              {{ step === 5 ? 'Finish' : 'Next' }}
              <i v-if="step < 5" class="fas fa-chevron-right ml-2"></i>
              <i v-else class="fas fa-check ml-2"></i>
            </button>
          </div>
        </div>
        </div>
      </div>

      <!-- Step 5: Export for AI Systems -->
      <div v-if="chunks.length > 0 && step >= 5" id="exportPanel" class="desktop-card" :class="{ 'step-active': step === 5 }">
        <div :class="isDesktopModeComputed ? 'desktop-card-header' : 'p-6 border-b'">
          <div class="flex items-center">
            <div :class="[isDesktopMode ? 'desktop-step-badge' : 'step-badge', 'mr-4']">
              <span class="text-white font-semibold">5</span>
            </div>
            <div>
              <h2 :class="isDesktopModeComputed ? 'desktop-card-title' : 'text-xl font-semibold'">
                Export for AI Systems
              </h2>
              <p :class="isDesktopModeComputed ? 'desktop-card-subtitle' : 'text-gray-600 text-sm mt-1'">
                Choose your export format and download your processed chunks
              </p>
            </div>
          </div>
        </div>
        <div :class="isDesktopModeComputed ? 'desktop-card-content' : 'p-6'">
        
        <VectorStoreExporter 
          :chunks="chunks" 
          @export-success="handleExportSuccess"
        />
        </div>
      </div>

      <!-- Notification System -->
      <div class="fixed top-4 right-4 z-50 space-y-2 max-w-md">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="rounded-brand soft-shadow p-4 transition-all duration-300"
          :class="{
            'notification-error': notification.type === 'error',
            'notification-success': notification.type === 'success',
            'notification-warning': notification.type === 'warning'
          }"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center">
                <i
                  class="mr-2"
                  :class="{
                    'fas fa-exclamation-circle': notification.type === 'error',
                    'fas fa-check-circle': notification.type === 'success',
                    'fas fa-exclamation-triangle': notification.type === 'warning'
                  }"
                ></i>
                <p class="text-sm font-medium">{{ notification.message }}</p>
              </div>
              <div v-if="notification.details" class="mt-2 text-xs whitespace-pre-line" style="opacity: 0.8;">
                {{ notification.details }}
              </div>
            </div>
            <button
              @click="removeNotification(notification.id)"
              class="ml-2 transition-colors"
              style="color: var(--text-secondary);"
              @mouseover="$event.target.style.color = 'var(--neutral-text)'"
              @mouseout="$event.target.style.color = 'var(--text-secondary)'"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import { parseMarkdown, extractMetadata } from '../../utils/markdownParser.js';
import { chunkText, chunkBySections, suggestTags } from '../../utils/chunker.js';
import { saveAs } from 'file-saver';
import ChunkingGuide from '../../components/ChunkingGuide.vue';
import QualityAnalyzer from '../../components/QualityAnalyzer.vue';
import VectorStoreExporter from '../../components/VectorStoreExporter.vue';
import FileProcessingErrorBoundary from '../../components/FileProcessingErrorBoundary.vue';
import { useVersionStore } from '../../stores/versions.ts';
import { useExportStore } from '../../stores/export.ts';
import { useContentStore } from '../../stores/content.ts';
import { useProcessingStore } from '../../stores/processing.ts';
import { useErrorHandler } from '../../composables/useErrorHandler.ts';
import { useTimeoutManager } from '../../composables/useTimeoutManager.ts';
import { useFileValidator } from '../../composables/useFileValidator.ts';
import { useDocumentAnalyzer } from '../../composables/useDocumentAnalyzer.ts';

export default {
  name: 'DocumentProcessor',
  components: {
    ChunkingGuide,
    QualityAnalyzer,
    VectorStoreExporter,
    FileProcessingErrorBoundary
  },
  setup() {
    const { addError, handleAsyncError, handleSyncError, validateInput } = useErrorHandler();
    const versionStore = useVersionStore();
    const exportStore = useExportStore();
    const processingStore = useProcessingStore();
    const { withTimeout, getRecommendedTimeouts, cancelAllTimeouts } = useTimeoutManager();
    const { validateFiles, validateFile, updateConfig: updateValidationConfig, config: validationConfig } = useFileValidator();
    const { analyzeDocument, analyzeBatch, isAnalyzing, analysisProgress, currentAnalysis } = useDocumentAnalyzer();
    const contentStore = useContentStore();
    
    return { 
      addError, 
      handleAsyncError, 
      handleSyncError, 
      validateInput,
      versionStore,
      exportStore,
      contentStore,
      processingStore,
      withTimeout,
      getRecommendedTimeouts,
      cancelAllTimeouts,
      validateFiles,
      validateFile,
      updateValidationConfig,
      validationConfig,
      analyzeDocument,
      analyzeBatch,
      isAnalyzing,
      analysisProgress,
      currentAnalysis
    };
  },
  mounted() {
    // ULTRA DEBUG - Component loading verification
    console.log('🚨🚨🚨 DocumentProcessor.vue MOUNTED SUCCESSFULLY! 🚨🚨🚨');
    console.log('🖥️ DocumentProcessor Desktop Mode:', this.isDesktopMode);
    console.log('🖥️ showDebugPanel value:', this.showDebugPanel);
    console.log('🖥️ Location:', window.location.href);
    console.log('🖥️ User Agent:', navigator.userAgent);
    
    // Debug panel visibility controlled by user interaction
  },
  beforeUnmount() {
    // Clean up any active timeouts when component is destroyed
    this.cancelAllTimeouts();
  },
  data() {
    return {
      // Desktop mode detection (will be updated in mounted)
      isDesktopMode: false,
      // Track if files have been processed in this session
      hasProcessedFiles: false,
      // Local UI state only - upload/processing state moved to export store
      searchQuery: '',
      expandedChunks: new Set(),
      step: 1,
      dragActive: false,
      
      // Debug Panel State (TEMPORARY)
      showDebugPanel: true, // Start visible for debugging
      debugLastFile: {
        name: '',
        extractedText: '',
        chunksCreated: 0,
        firstChunk: ''
      },
      showBatchHelp: false,
      notifications: [],
      // Enhanced file tracking for multi-document processing
      fileQueue: [], // Array of file objects with enhanced status tracking
      processingStats: {
        startTime: null,
        processedFiles: 0,
        totalFiles: 0,
        estimatedTimeRemaining: null,
        processingRate: 0
      },
      chunkingOptions: {
        chunkBy: 'words',
        chunkSize: 500,
        overlap: 50,
        autoTag: true
      },
      // Memory monitoring thresholds (kept for backward compatibility)
      MEMORY_WARNING_THRESHOLD: 100 * 1024 * 1024, // 100MB
      MEMORY_CRITICAL_THRESHOLD: 500 * 1024 * 1024, // 500MB
      
      // Document analysis state
      documentAnalyses: [], // Store analyses for each uploaded file
      showRecommendations: true, // Whether to show chunking recommendations
      recommendationsApplied: false // Track if user has applied recommendations
    };
  },
  
  computed: {
    // Web mode only - no desktop detection needed
    isDesktopModeComputed() {
      return false;
    },
    // Access store data through computed properties
    uploadedFiles() {
      return this.exportStore.uploadedFiles;
    },
    chunks() {
      return this.contentStore.chunks;
    },
    processing() {
      return this.exportStore.isProcessingDocuments;
    },
    processingProgress() {
      return this.exportStore.processingProgress;
    },
    processingStatus() {
      return this.exportStore.processingStatus;
    },
    
    filteredChunks() {
      if (!this.searchQuery) return this.chunks;
      
      // Sanitize search query before using it
      const sanitizedQuery = this.sanitizeSearchQuery(this.searchQuery).toLowerCase();
      if (!sanitizedQuery) return this.chunks;
      
      return this.chunks.filter(chunk => 
        chunk.content.toLowerCase().includes(sanitizedQuery) ||
        (chunk.tags && chunk.tags.some(tag => tag.toLowerCase().includes(sanitizedQuery))) ||
        (chunk.chunk_id && chunk.chunk_id.toLowerCase().includes(sanitizedQuery))
      );
    },
    avgWordsPerChunk() {
      if (this.chunks.length === 0) return 0;
      return Math.round(this.totalWords / this.chunks.length);
    },
    totalWords() {
      return this.chunks.reduce((sum, chunk) => sum + (chunk.metadata?.wordCount || 0), 0);
    },
    uniqueTags() {
      const allTags = this.chunks.flatMap(chunk => chunk.tags);
      return new Set(allTags).size;
    },
    
    // Enhanced file tracking computed properties
    queuedFiles() {
      return this.fileQueue.filter(file => file.status === 'queued');
    },
    processingFiles() {
      return this.fileQueue.filter(file => file.status === 'processing');
    },
    completedFiles() {
      return this.fileQueue.filter(file => file.status === 'completed');
    },
    failedFiles() {
      return this.fileQueue.filter(file => file.status === 'failed');
    },
    hasProcessingFiles() {
      return this.processingFiles.length > 0;
    },
    
    // Step validation for wizard navigation
    canAdvanceToNextStep() {
      switch (this.step) {
        case 1: // Upload step - must have files uploaded
          return this.uploadedFiles.length > 0;
        case 2: // Configure & Process step - MUST process files before advancing
          // Next button disabled until "Process Files" is clicked and completes
          return this.hasProcessedFiles && this.chunks.length > 0;
        case 3: // Process monitoring step - already processed, can advance
          return this.hasProcessedFiles && this.chunks.length > 0;
        case 4: // Review step - must have chunks from processing
          return this.hasProcessedFiles && this.chunks.length > 0;
        case 5: // Export step - can't advance beyond final step
          return false;
        default:
          return false;
      }
    },
    overallProgress() {
      if (this.fileQueue.length === 0) return 0;
      const completed = this.completedFiles.length;
      const failed = this.failedFiles.length;
      return Math.round(((completed + failed) / this.fileQueue.length) * 100);
    }
  },
  watch: {
    // Sanitize search query in real-time
    searchQuery: {
      handler(newValue) {
        if (newValue && typeof newValue === 'string') {
          const sanitized = this.sanitizeSearchQuery(newValue);
          if (sanitized !== newValue) {
            this.$nextTick(() => {
              this.searchQuery = sanitized;
            });
          }
        }
      },
      immediate: false
    },
    
    // Validate chunking options when they change
    'chunkingOptions.chunkSize': {
      handler(newValue) {
        if (typeof newValue !== 'number' || newValue < 0) {
          this.$nextTick(() => {
            this.chunkingOptions.chunkSize = 500; // Reset to default
          });
        }
      }
    },
    
    'chunkingOptions.overlap': {
      handler(newValue) {
        if (typeof newValue !== 'number' || newValue < 0) {
          this.$nextTick(() => {
            this.chunkingOptions.overlap = 50; // Reset to default
          });
        }
      }
    }
  },
  methods: {
    // Debug Panel Methods (TEMPORARY)
    inspectChunks() {
      console.log('🔍 DEBUG: Inspecting All Chunks in Store:');
      console.log('Total chunks:', this.chunks.length);
      this.chunks.forEach((chunk, index) => {
        console.log(`Chunk ${index}:`, {
          id: chunk.id || chunk.chunk_id,
          content: chunk.content?.substring(0, 100) + '...' || '(empty content)',
          source: chunk.source,
          wordCount: chunk.metadata?.wordCount,
          tags: chunk.tags,
          fullChunk: chunk
        });
      });
      
      // Also show in alert for immediate visibility
      const summary = `Chunks Inspection:
- Total chunks: ${this.chunks.length}
- First chunk content: ${this.chunks[0]?.content?.substring(0, 50) || '(no content)'}...
- Last chunk content: ${this.chunks[this.chunks.length - 1]?.content?.substring(0, 50) || '(no content)'}...
Check browser console for full details.`;
      
      alert(summary);
    },
    
    async testPdfExtraction() {
      console.log('🔍 DEBUG: Testing PDF extraction...');
      
      // Create a simple test to verify PDF extraction works
      const testResult = `PDF Extraction Test:
- PDF.js loaded: ${typeof pdfjsLib !== 'undefined' ? 'YES' : 'NO'}
- Worker configured: Check console for details
- Chunks in store: ${this.chunks.length}
- Content store available: ${!!this.contentStore}`;
      
      console.log('PDF.js status:', {
        loaded: typeof pdfjsLib !== 'undefined',
        workerSrc: typeof pdfjsLib !== 'undefined' ? pdfjsLib.GlobalWorkerOptions.workerSrc : 'N/A'
      });
      
      alert(testResult);
    },
    
    clearDebugData() {
      this.debugLastFile = {
        name: '',
        extractedText: '',
        chunksCreated: 0,
        firstChunk: ''
      };
      console.log('🔍 DEBUG: Debug data cleared');
    },
    
    async clearAutosaveData() {
      console.log('🔍 DEBUG: Clearing autosave data...');
      try {
        await this.contentStore.clearAutosave();
        this.contentStore.clearChunks();
        console.log('🔍 DEBUG: Autosave data cleared successfully');
        this.showSuccess('Autosave data cleared successfully');
      } catch (error) {
        console.error('🔍 DEBUG: Failed to clear autosave data:', error);
        this.showError('Failed to clear autosave data');
      }
    },
    
    // Wizard navigation methods
    previousStep() {
      if (this.step > 1) {
        this.step--;
        this.scrollToStep();
      }
    },
    
    nextStep() {
      if (this.canAdvanceToNextStep && this.step < 5) {
        this.step++;
        this.scrollToStep();
      }
    },
    
    scrollToStep() {
      // Smooth scroll to the navigation bar at the bottom of the current step
      this.$nextTick(() => {
        // Small delay to ensure content has rendered, especially for Step 3 with dynamic content
        setTimeout(() => {
          const stepElement = document.querySelector(`.step-content-${this.step}`);
          
          if (stepElement) {
            // Find the navigation bar within this step
            const navElement = stepElement.querySelector('.wizard-navigation');
            
            if (navElement) {
              // Scroll to the navigation bar for better UX
              navElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
              });
            } else {
              // Fallback: scroll to the bottom of the step content for better navigation visibility
              stepElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'end' 
              });
            }
          } else {
            // Fallback: scroll to top of component
            window.scrollTo({ 
              top: 0, 
              behavior: 'smooth' 
            });
          }
        }, 200); // Slightly longer delay for Step 3 content rendering
      });
    },
    
    // Enhanced file queue management methods
    createFileObject(file) {
      return {
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'queued', // queued | processing | completed | failed | paused
        progress: 0,
        chunks: [],
        error: null,
        processingTime: 0,
        startTime: null,
        endTime: null,
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    },
    
    updateFileStatus(fileId, status, progress = null, error = null) {
      const file = this.fileQueue.find(f => f.id === fileId);
      if (file) {
        file.status = status;
        if (progress !== null) file.progress = progress;
        if (error) file.error = error;
        
        if (status === 'processing' && !file.startTime) {
          file.startTime = Date.now();
        } else if ((status === 'completed' || status === 'failed') && !file.endTime) {
          file.endTime = Date.now();
          if (file.startTime) {
            file.processingTime = file.endTime - file.startTime;
          }
        }
        
        this.updateProcessingStats();
      }
    },
    
    updateProcessingStats() {
      const completed = this.completedFiles.length;
      const failed = this.failedFiles.length;
      const total = this.fileQueue.length;
      
      this.processingStats.processedFiles = completed + failed;
      this.processingStats.totalFiles = total;
      
      if (this.processingStats.startTime && completed > 0) {
        const elapsed = (Date.now() - this.processingStats.startTime) / 1000 / 60; // minutes
        this.processingStats.processingRate = completed / elapsed;
        
        const remaining = total - (completed + failed);
        if (this.processingStats.processingRate > 0) {
          this.processingStats.estimatedTimeRemaining = remaining / this.processingStats.processingRate;
        }
      }
    },
    
    retryFile(fileId) {
      const file = this.fileQueue.find(f => f.id === fileId);
      if (file) {
        file.status = 'queued';
        file.progress = 0;
        file.error = null;
        file.startTime = null;
        file.endTime = null;
        file.processingTime = 0;
        
        // Process the file immediately
        this.processFileInQueue(file);
      }
    },
    
    removeFileFromQueue(fileId) {
      const index = this.fileQueue.findIndex(f => f.id === fileId);
      if (index > -1) {
        const file = this.fileQueue[index];
        this.fileQueue.splice(index, 1);
        // Also remove from uploadedFiles to prevent "already uploaded" errors
        this.uploadedFiles = this.uploadedFiles.filter(f => f.name !== file.name);
        this.updateProcessingStats();
      }
    },
    


    checkMemoryUsage() {
      if (!performance.memory) {
        return { status: 'unknown', usage: 0 };
      }
      
      const currentMemory = performance.memory.usedJSHeapSize;
      
      if (currentMemory > this.MEMORY_CRITICAL_THRESHOLD) {
        return { 
          status: 'critical', 
          usage: currentMemory,
          message: 'Critical memory usage detected. Please refresh the page before processing more files.'
        };
      } else if (currentMemory > this.MEMORY_WARNING_THRESHOLD) {
        return { 
          status: 'warning', 
          usage: currentMemory,
          message: `High memory usage detected (${Math.round(currentMemory / (1024 * 1024))}MB). Consider processing fewer files at once.`
        };
      }
      
      return { status: 'normal', usage: currentMemory };
    },

    async readFileAsText(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (event) => {
          const error = event.target.error;
          let errorMessage = 'Failed to read file as text';
          
          if (error) {
            switch (error.code) {
              case error.NOT_FOUND_ERR:
                errorMessage = 'File not found';
                break;
              case error.SECURITY_ERR:
                errorMessage = 'Security error - file access denied';
                break;
              case error.ABORT_ERR:
                errorMessage = 'File read operation was aborted';
                break;
              case error.NOT_READABLE_ERR:
                errorMessage = 'File is not readable';
                break;
              case error.ENCODING_ERR:
                errorMessage = 'File encoding error';
                break;
              default:
                errorMessage = `File read error: ${error.message || 'Unknown error'}`;
            }
          }
          
          reject(new Error(errorMessage));
        };
        reader.readAsText(file);
      });
    },

    goToExport() {
      this.step = 4;
      this.$nextTick(() => {
        const exportPanel = document.querySelector('#exportPanel');
        if (exportPanel) {
          exportPanel.scrollIntoView({ behavior: 'smooth' });
        }
      });
    },
    
    async handleFileUpload(event) {
      const files = Array.from(event.target.files);
      await this.processUploadedFiles(files);
      // Clear file input to allow re-uploading the same file
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },

    async processUploadedFiles(files) {
      // Check memory usage first
      const memoryStatus = this.checkMemoryUsage();
      if (memoryStatus.status === 'critical') {
        this.showError(memoryStatus.message);
        return;
      } else if (memoryStatus.status === 'warning') {
        this.showWarning(memoryStatus.message);
      }
      
      // Use enhanced validation system
      const validationResult = await this.validateFiles(files, this.uploadedFiles);
      
      // Handle count and size limit exceedances
      if (validationResult.countExceeded) {
        this.showError(`Cannot upload more than ${this.validationConfig.maxFileCount} files at once. Currently have ${this.uploadedFiles.length} files.`);
        return;
      }
      
      if (validationResult.totalSizeExceeded) {
        const maxSizeMB = Math.round(this.validationConfig.maxTotalSize / 1024 / 1024);
        const currentSize = this.uploadedFiles.reduce((sum, file) => sum + file.size, 0);
        const availableMB = Math.round((this.validationConfig.maxTotalSize - currentSize) / 1024 / 1024);
        
        this.showError(`Cannot add files: Total size would exceed ${maxSizeMB}MB limit. Available space: ${availableMB}MB`);
        return;
      }
      
      // Check for duplicate files and filter them out
      const duplicates = [];
      const uniqueValid = validationResult.valid.filter(({ file }) => {
        if (this.uploadedFiles.find(f => f.name === file.name)) {
          duplicates.push(file.name);
          return false;
        }
        return true;
      });
      
      // Add valid files to both store and queue, and perform analysis
      for (const { file, validation } of uniqueValid) {
        this.exportStore.uploadedFiles.push(file);
        this.fileQueue.push(this.createFileObject(file));
        
        // Perform document analysis for chunking recommendations (quietly)
        try {
          const analysis = await this.analyzeDocument(file);
          this.documentAnalyses.push(analysis);
        } catch (error) {
          console.warn(`Document analysis failed for ${file.name}:`, error);
        }
      }
      
      // Show batch recommendations if multiple files were analyzed
      if (this.documentAnalyses.length > 1) {
        setTimeout(() => this.showBatchRecommendations(), 1000); // Small delay to let individual analyses complete
      }
      
      // Show results summary
      if (uniqueValid.length > 0) {
        this.step = 2;
        this.showSuccess(`Successfully added ${uniqueValid.length} file${uniqueValid.length !== 1 ? 's' : ''}`);
      }
      
      // Show rejection details with enhanced error information
      if (validationResult.invalid.length > 0) {
        const rejectedFiles = validationResult.invalid.map(({ file, validation }) => ({
          name: file.name,
          reason: validation.error || 'Validation failed'
        }));
        this.showFileErrors(rejectedFiles);
      }
      
      // Show duplicate warnings
      if (duplicates.length > 0) {
        this.showInfo(`📁 ${duplicates.length} file${duplicates.length !== 1 ? 's were' : ' was'} already uploaded: ${duplicates.join(', ')}`);
      }
    },
    
    getChunkingDescription() {
      switch (this.chunkingOptions.chunkBy) {
        case 'words':
          return 'Splits content every X words. Best for most documents.';
        case 'characters':
          return 'Splits by character count. More precise control over size.';
        case 'sections':
          return 'Splits at markdown headers. Preserves document structure.';
        default:
          return '';
      }
    },
    
    getOptimalRange() {
      return this.chunkingOptions.chunkBy === 'words' ? 'Optimal: 300-800' : 'Optimal: 1500-3000';
    },

    validateChunkingOptions() {
      const errors = [];
      
      // Validate chunk method
      const validMethods = ['words', 'characters', 'sections'];
      if (!validMethods.includes(this.chunkingOptions.chunkBy)) {
        errors.push('Invalid chunking method');
      }
      
      // Validate chunk size
      if (this.chunkingOptions.chunkBy !== 'sections') {
        const isWords = this.chunkingOptions.chunkBy === 'words';
        const minSize = isWords ? 50 : 200;
        const maxSize = isWords ? 2000 : 8000;
        
        if (this.chunkingOptions.chunkSize < minSize || this.chunkingOptions.chunkSize > maxSize) {
          errors.push(`Chunk size must be between ${minSize} and ${maxSize} ${this.chunkingOptions.chunkBy}`);
        }
        
        // Validate overlap
        const maxOverlap = Math.floor(this.chunkingOptions.chunkSize * 0.5);
        if (this.chunkingOptions.overlap < 0 || this.chunkingOptions.overlap > maxOverlap) {
          errors.push(`Overlap must be between 0 and ${maxOverlap} (50% of chunk size)`);
        }
      }
      
      return {
        isValid: errors.length === 0,
        errors
      };
    },
    
    removeFile(filename) {
      this.uploadedFiles = this.uploadedFiles.filter(f => f.name !== filename);
      // Also remove from fileQueue to prevent "already uploaded" errors
      this.fileQueue = this.fileQueue.filter(f => f.name !== filename);
    },
    
    formatFileSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
      return Math.round(bytes / (1024 * 1024)) + ' MB';
    },
    
    // Enhanced file queue processing method
    async processFileInQueue(fileObj) {
      this.updateFileStatus(fileObj.id, 'processing', 0);
      
      try {
        let content;
        let metadata;
        
        if (fileObj.file.type === 'application/pdf') {
          this.updateFileStatus(fileObj.id, 'processing', 20);
          
          // Handle PDF files with intelligent timeout management
          const buffer = await this.withTimeout(
            this.readFileAsArrayBuffer(fileObj.file),
            {
              fileSize: fileObj.size,
              fileName: fileObj.name,
              fileType: fileObj.file.type,
              operationType: 'fileRead',
              contextId: `read_${fileObj.id}`,
              onTimeout: (error) => {
                this.updateFileStatus(fileObj.id, 'failed', fileObj.progress, `File read timeout: ${error.message}`);
                this.showWarning(`${fileObj.name}: File reading took too long. Try a smaller file.`);
              }
            }
          );
          
          this.updateFileStatus(fileObj.id, 'processing', 40);
          
          const { parsePdf, extractPdfMetadata } = await import('../../utils/pdfParser.js');
          
          const pdfData = await this.withTimeout(
            parsePdf(buffer),
            {
              fileSize: fileObj.size,
              fileName: fileObj.name,
              fileType: fileObj.file.type,
              operationType: 'pdfParsing',
              contextId: `parse_${fileObj.id}`,
              onTimeout: (error) => {
                this.updateFileStatus(fileObj.id, 'failed', fileObj.progress, `PDF parsing timeout: ${error.message}`);
                this.showWarning(`${fileObj.name}: PDF parsing took too long. File may be complex or corrupted.`);
              }
            }
          );
          
          content = pdfData.text;
          metadata = extractPdfMetadata(pdfData);
          
          // Capture debug info for PDF extraction
          this.debugLastFile.name = fileObj.name;
          this.debugLastFile.extractedText = content;
          console.log('🔍 DEBUG: PDF Text Extracted:', {
            fileName: fileObj.name,
            textLength: content.length,
            textPreview: content.substring(0, 200) + '...'
          });
          
          // Validate PDF content
          if (!content || content.trim().length < 10) {
            throw new Error('PDF appears to be empty or contains mostly images');
          }
          
        } else if (fileObj.file.name.toLowerCase().endsWith('.docx')) {
          this.updateFileStatus(fileObj.id, 'processing', 20);
          
          const { parseDocx } = await import('../../utils/docxParser.js');
          
          // Handle DOCX files with intelligent timeout management
          const docxText = await this.withTimeout(
            parseDocx(fileObj.file),
            {
              fileSize: fileObj.size,
              fileName: fileObj.name,
              fileType: fileObj.file.type,
              operationType: 'docxParsing',
              contextId: `docx_parse_${fileObj.id}`,
              onTimeout: (error) => {
                this.updateFileStatus(fileObj.id, 'failed', fileObj.progress, `DOCX parsing timeout: ${error.message}`);
                this.showWarning(`${fileObj.name}: DOCX parsing took too long. File may be complex or corrupted.`);
              }
            }
          );
          
          this.updateFileStatus(fileObj.id, 'processing', 40);
          
          // Extract metadata with timeout
          const { extractDocxMetadata } = await import('../../utils/docxParser.js');
          metadata = await this.withTimeout(
            extractDocxMetadata(fileObj.file),
            {
              fileSize: fileObj.size,
              fileName: fileObj.name,
              fileType: fileObj.file.type,
              operationType: 'textProcessing',
              contextId: `docx_meta_${fileObj.id}`,
              onTimeout: (error) => {
                // Don't fail the entire process for metadata timeout, just log warning
                this.showInfo(`${fileObj.name}: Metadata extraction timed out, continuing without metadata.`);
                return { title: fileObj.name, pages: null, wordCount: null }; // Return basic metadata
              }
            }
          ).catch(() => {
            // If metadata extraction fails completely, provide default metadata
            return { title: fileObj.name, pages: null, wordCount: null };
          });
          
          // Convert to markdown-like format for better chunking
          content = docxText;
          
          // Validate DOCX content
          if (!content || content.trim().length < 10) {
            throw new Error('DOCX appears to be empty or contains no readable text');
          }
          
        } else {
          this.updateFileStatus(fileObj.id, 'processing', 20);
          
          // Handle Markdown files with intelligent timeout management
          const rawContent = await this.withTimeout(
            this.readFileContent(fileObj.file),
            {
              fileSize: fileObj.size,
              fileName: fileObj.name,
              fileType: fileObj.file.type,
              operationType: 'fileRead',
              contextId: `md_read_${fileObj.id}`,
              onTimeout: (error) => {
                this.updateFileStatus(fileObj.id, 'failed', fileObj.progress, `Markdown file read timeout: ${error.message}`);
                this.showWarning(`${fileObj.name}: File reading took too long. Try a smaller file.`);
              }
            }
          );
          
          // Additional content validation for markdown
          if (!rawContent || rawContent.trim().length === 0) {
            throw new Error('File appears to be empty');
          }
          
          content = parseMarkdown(rawContent);
          metadata = extractMetadata(rawContent);
          
          // Capture debug info for Markdown extraction
          this.debugLastFile.name = fileObj.name;
          this.debugLastFile.extractedText = content;
          console.log('🔍 DEBUG: Markdown Text Extracted:', {
            fileName: fileObj.name,
            rawContentLength: rawContent.length,
            parsedContentLength: content.length,
            rawPreview: rawContent.substring(0, 200) + '...',
            parsedPreview: content.substring(0, 200) + '...'
          });
        }
        
        this.updateFileStatus(fileObj.id, 'processing', 60);
        
        // Final content validation
        if (!content || content.trim().length === 0) {
          throw new Error('No readable content found in file');
        }
        
        if (content.length > 5000000) { // 5MB of text
          throw new Error('File content is too large to process safely');
        }
        
        this.updateFileStatus(fileObj.id, 'processing', 80);
        
        let fileChunks;
        if (this.chunkingOptions.chunkBy === 'sections' && fileObj.file.type !== 'application/pdf') {
          // Section-based chunking for markdown and DOCX files with timeout
          let originalContent;
          if (fileObj.file.name.toLowerCase().endsWith('.docx')) {
            // For DOCX, convert to markdown-like format for better section detection
            const { parseDocxToHtml } = await import('../../utils/docxParser.js');
            const docxHtml = await this.withTimeout(
              parseDocxToHtml(fileObj.file),
              {
                fileSize: fileObj.size,
                fileName: fileObj.name,
                fileType: fileObj.file.type,
                operationType: 'textProcessing',
                contextId: `docx_html_${fileObj.id}`,
                onTimeout: (error) => {
                  this.showWarning(`${fileObj.name}: HTML conversion timed out, using previously parsed content.`);
                }
              }
            ).catch(() => content); // Fallback to already parsed content
            
            originalContent = convertDocxHtmlToMarkdown(docxHtml);
          } else {
            // For markdown files, content is already loaded with timeout
            originalContent = content;
          }
          
          fileChunks = await this.withTimeout(
            Promise.resolve(chunkBySections(originalContent, fileObj.file.name)),
            {
              fileSize: fileObj.size,
              fileName: fileObj.name,
              fileType: fileObj.file.type,
              operationType: 'chunkGeneration',
              contextId: `chunk_sections_${fileObj.id}`,
              onTimeout: (error) => {
                this.showWarning(`${fileObj.name}: Section-based chunking timed out, falling back to word-based chunking.`);
              }
            }
          ).catch(() => chunkText(originalContent, fileObj.file.name, { ...this.chunkingOptions, chunkBy: 'words' }));
        } else {
          fileChunks = await this.withTimeout(
            Promise.resolve(chunkText(content, fileObj.file.name, this.chunkingOptions)),
            {
              fileSize: fileObj.size,
              fileName: fileObj.name,
              fileType: fileObj.file.type,
              operationType: 'chunkGeneration',
              contextId: `chunk_text_${fileObj.id}`,
              onTimeout: (error) => {
                this.updateFileStatus(fileObj.id, 'failed', fileObj.progress, `Text chunking timeout: ${error.message}`);
                this.showError(`${fileObj.name}: Text processing took too long. File may be too large or complex.`);
              }
            }
          );
        }
        
        // Validate chunks
        if (!fileChunks || fileChunks.length === 0) {
          throw new Error('No chunks could be created from this file');
        }
        
        // Debug chunk creation
        console.log('🔍 DEBUG: Chunks Created:', {
          fileName: fileObj.name,
          chunkCount: fileChunks.length,
          firstChunkContent: fileChunks[0]?.content?.substring(0, 200) + '...',
          chunkingOptions: this.chunkingOptions
        });
        
        this.debugLastFile.chunksCreated = fileChunks.length;
        this.debugLastFile.firstChunk = fileChunks[0]?.content?.substring(0, 500) + '...';
        
        if (fileChunks.length > 1000) {
          throw new Error('File produces too many chunks (>1000). Try larger chunk sizes.');
        }
        
        // Add auto-suggested tags if enabled
        if (this.chunkingOptions.autoTag) {
          this.updateFileStatus(fileObj.id, 'processing', 90);
          
          fileChunks.forEach(chunk => {
            try {
              const suggestions = suggestTags(chunk.content);
              chunk.tags = [...chunk.tags, ...suggestions];
              chunk.tagsString = chunk.tags.join(', ');
            } catch (error) {
              console.warn('Error generating tags for chunk:', error);
              // Continue without tags rather than failing
            }
          });
        }
        
        // Store chunks in file object and add to content store
        fileObj.chunks = fileChunks;
        
        // Capture debug info for chunks
        this.debugLastFile.chunksCreated = fileChunks.length;
        this.debugLastFile.firstChunk = fileChunks[0]?.content || '(no chunks)';
        console.log('🔍 DEBUG: Chunks Created:', {
          fileName: fileObj.name,
          chunksCount: fileChunks.length,
          firstChunkContent: fileChunks[0]?.content?.substring(0, 200) + '...' || 'No content',
          firstChunkFull: fileChunks[0]
        });
        
        // Debug: Check chunks before adding to store
        console.log('🔍 DEBUG: Adding chunks to content store:', {
          fileName: fileObj.name,
          chunksToAdd: fileChunks.length,
          firstChunkBeforeStore: fileChunks[0],
          chunksPreview: fileChunks.slice(0, 2).map(chunk => ({
            id: chunk.id,
            content_preview: chunk.content?.substring(0, 100) + '...',
            wordCount: chunk.wordCount,
            source: chunk.source
          }))
        });
        
        this.contentStore.addChunks(fileChunks);
        
        // Debug: Check what's in the store after adding
        console.log('🔍 DEBUG: Chunks in store after adding:', {
          totalChunksInStore: this.contentStore.chunks.length,
          lastAddedChunks: this.contentStore.chunks.slice(-fileChunks.length).map(chunk => ({
            id: chunk.id,
            content_preview: chunk.content?.substring(0, 100) + '...'
          }))
        });
        
        this.updateFileStatus(fileObj.id, 'completed', 100);
        
        return fileChunks;
        
      } catch (error) {
        this.updateFileStatus(fileObj.id, 'failed', fileObj.progress, error.message);
        
        // Log detailed error for debugging
        this.addError({
          message: `Failed to process ${fileObj.name}`,
          details: error.message,
          component: 'DocumentProcessor',
          action: 'processFileInQueue',
          severity: 'medium'
        });
        
        throw error;
      }
    },
    
    async processFiles() {
      // Validate chunking options before processing
      const chunkingValidation = this.validateChunkingOptions();
      if (!chunkingValidation.isValid) {
        this.showError('Invalid chunking configuration', chunkingValidation.errors.join('\n'));
        return;
      }
      
      // Check if files are uploaded
      if (this.fileQueue.length === 0) {
        this.showError('No files to process. Please upload some files first.');
        return;
      }
      
      // IMPORTANT: Reset step state when processing starts
      // This fixes the bug where reprocessing from Step 5 leaves user stuck
      this.hasProcessedFiles = false;
      this.step = 2; // Reset to Step 2 (Configure & Process)
      this.contentStore.clearChunks(); // Clear any existing chunks
      
      // Reset file queue statuses for reprocessing
      this.fileQueue.forEach(file => {
        file.status = 'queued';
        file.progress = 0;
        file.chunks = [];
        file.error = null;
        file.startTime = null;
        file.endTime = null;
        file.processingTime = 0;
      });
      
      // Check memory before starting
      const memoryStatus = this.checkMemoryUsage();
      if (memoryStatus.status === 'critical') {
        this.showError(memoryStatus.message);
        return;
      }
      
      // Initialize processing stats
      this.processingStats.startTime = Date.now();
      this.processingStats.processedFiles = 0;
      this.processingStats.totalFiles = this.fileQueue.length;
      this.processingStats.estimatedTimeRemaining = null;
      this.processingStats.processingRate = 0;
      
      // Clear existing chunks
      this.contentStore.clearChunks();
      
      // Set all files to queued status
      this.fileQueue.forEach(file => {
        if (file.status === 'failed') {
          file.status = 'queued';
          file.progress = 0;
          file.error = null;
        }
      });
      
      this.exportStore.setProcessingDocuments(true, 'Starting batch processing...', 0);
      
      // Process files concurrently with a limit
      const CONCURRENT_LIMIT = 3; // Process max 3 files at once
      const queuedFiles = this.fileQueue.filter(f => f.status === 'queued');
      
      try {
        // Process files in batches
        for (let i = 0; i < queuedFiles.length; i += CONCURRENT_LIMIT) {
          const batch = queuedFiles.slice(i, i + CONCURRENT_LIMIT);
          
          // Process batch concurrently
          const batchPromises = batch.map(fileObj => 
            this.processFileInQueue(fileObj).catch(error => {
              // Individual file errors are already handled in processFileInQueue
              console.warn(`File ${fileObj.name} failed:`, error.message);
              return null;
            })
          );
          
          await Promise.all(batchPromises);
          
          // Update overall progress
          const processed = this.completedFiles.length + this.failedFiles.length;
          const progress = Math.round((processed / this.fileQueue.length) * 100);
          this.exportStore.setProcessingDocuments(true, `Processed ${processed}/${this.fileQueue.length} files`, progress);
          
          // Check memory between batches
          const memCheck = this.checkMemoryUsage();
          if (memCheck.status === 'critical') {
            this.showWarning('Memory usage is high. Pausing processing to prevent issues.');
            break;
          }
        }
        
        // Processing complete
        const successCount = this.completedFiles.length;
        const failedCount = this.failedFiles.length;
        
        if (successCount > 0) {
          // Mark that processing has been completed
          this.hasProcessedFiles = true;
          // Stay on Step 2, let user click Next to proceed
          this.exportStore.setProcessingDocuments(false, '', 100);
          
          if (failedCount === 0) {
            this.showSuccess(`Successfully processed all ${successCount} files`);
          } else {
            this.showWarning(`Processed ${successCount} files successfully, ${failedCount} failed`);
          }
        } else {
          this.exportStore.setProcessingDocuments(false, '', 0);
          this.showError('No files could be processed successfully');
        }
        
      } catch (error) {
        this.exportStore.setProcessingDocuments(false, '', 0);
        this.addError({
          message: 'Batch processing failed',
          details: error.message,
          component: 'DocumentProcessor',
          action: 'processFiles',
          severity: 'high'
        });
        this.showError('Processing failed', error.message);
      }
    },
    
    // Legacy method for backward compatibility
    async processDocuments() {
      return this.processFiles();
    },
    
    async legacyProcessFiles() {
      // Keep the original processing logic for reference
      const result = await this.handleAsyncError(async () => {
        for (const file of this.uploadedFiles) {
          const fileResult = await this.handleAsyncError(async () => {
            let content;
            let metadata;
            
            if (file.type === 'application/pdf') {
              // Handle PDF files with timeout
              const buffer = await Promise.race([
                this.readFileAsArrayBuffer(file),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('File read timeout')), 30000)
                )
              ]);
              
              const { parsePdf, extractPdfMetadata } = await import('../../utils/pdfParser.js');
              
              const pdfData = await Promise.race([
                parsePdf(buffer),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('PDF parsing timeout')), 60000)
                )
              ]);
              
              content = pdfData.text;
              metadata = extractPdfMetadata(pdfData);
              
              // Validate PDF content
              if (!content || content.trim().length < 10) {
                throw new Error('PDF appears to be empty or contains mostly images');
              }
              
            } else if (file.name.toLowerCase().endsWith('.docx')) {
              // Handle DOCX files with timeout
              const { parseDocx, extractDocxMetadata } = await import('../../utils/docxParser.js');
              
              const docxText = await Promise.race([
                parseDocx(file),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('DOCX parsing timeout')), 60000)
                )
              ]);
              
              metadata = await Promise.race([
                extractDocxMetadata(file),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('DOCX metadata extraction timeout')), 30000)
                )
              ]);
              
              content = docxText;
              
              // Validate DOCX content
              if (!content || content.trim().length < 10) {
                throw new Error('DOCX appears to be empty or contains no readable text');
              }
              
            } else {
              // Handle Markdown files with timeout
              const rawContent = await Promise.race([
                this.readFileContent(file),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('File read timeout')), 30000)
                )
              ]);
              
              // Additional content validation for markdown
              if (!rawContent || rawContent.trim().length === 0) {
                throw new Error('File appears to be empty');
              }
              
              content = parseMarkdown(rawContent);
              metadata = extractMetadata(rawContent);
            }
            
            // Final content validation
            if (!content || content.trim().length === 0) {
              throw new Error('No readable content found in file');
            }
            
            if (content.length > 5000000) { // 5MB of text
              throw new Error('File content is too large to process safely');
            }
            
            let fileChunks;
            if (this.chunkingOptions.chunkBy === 'sections' && file.type !== 'application/pdf') {
              // Section-based chunking for markdown and DOCX files
              let originalContent;
              if (file.name.toLowerCase().endsWith('.docx')) {
                // For DOCX, convert to markdown-like format for better section detection
                const { parseDocxToHtml, convertDocxHtmlToMarkdown } = await import('../../utils/docxParser.js');
                const docxHtml = await parseDocxToHtml(file);
                originalContent = convertDocxHtmlToMarkdown(docxHtml);
              } else {
                // For markdown files
                originalContent = await this.readFileContent(file);
              }
              fileChunks = chunkBySections(originalContent, file.name);
            } else {
              fileChunks = chunkText(content, file.name, this.chunkingOptions);
            }
            
            // Validate chunks
            if (!fileChunks || fileChunks.length === 0) {
              throw new Error('No chunks could be created from this file');
            }
            
            if (fileChunks.length > 1000) {
              throw new Error('File produces too many chunks (>1000). Try larger chunk sizes.');
            }
            
            // Add auto-suggested tags if enabled
            if (this.chunkingOptions.autoTag) {
              fileChunks.forEach(chunk => {
                const tagResult = this.handleSyncError(() => {
                  const suggestions = suggestTags(chunk.content);
                  chunk.tags = [...chunk.tags, ...suggestions];
                  chunk.tagsString = chunk.tags.join(', ');
                }, { component: 'DocumentProcessor', action: 'tagGeneration' });
                
                if (tagResult.error) {
                  console.warn('Error generating tags for chunk:', tagResult.error);
                  // Continue without tags rather than failing
                }
              });
            }
            
            return fileChunks;
            
          }, { component: 'DocumentProcessor', action: 'processFile' });
          
          if (fileResult.error) {
            // Handle specific file processing errors
            const error = fileResult.error;
            if (error.message.includes('password') || error.message.includes('encrypted')) {
              this.showError(`${file.name}: This PDF is password protected or encrypted and cannot be processed`);
            } else if (error.message.includes('timeout')) {
              this.showError(`${file.name}: Processing timeout - file may be too large or complex`);
            } else if (error.message.includes('Invalid PDF')) {
              this.showError(`${file.name}: Invalid or corrupted PDF file`);
            } else if (error.message.includes('too large')) {
              this.showError(`${file.name}: File is too large to process safely`);
            } else if (error.message.includes('too many chunks')) {
              this.showError(`${file.name}: File produces too many chunks. Try using larger chunk sizes.`);
            } else {
              this.showError(`${file.name}: ${error.message}`);
            }
          } else if (fileResult.data) {
            // Successfully processed file
            const fileChunks = fileResult.data;
            this.contentStore.addChunks(fileChunks);
            this.showSuccess(`Successfully processed ${file.name} (${fileChunks.length} chunks)`);
            
            // Memory usage check after each file
            const memoryCheck = this.checkMemoryUsage();
            if (memoryCheck.status === 'warning') {
              this.showWarning(memoryCheck.message);
            }
          }
          
          processedFiles++;
          this.processingProgress = Math.round((processedFiles / totalFiles) * 100);
        }
        
        // Final validation
        if (this.chunks.length === 0) {
          throw new Error('No chunks were created from any of the uploaded files. Please check your files and try again.');
        }
        
        return {
          chunksCreated: this.chunks.length,
          filesProcessed: processedFiles
        };
        
      }, { component: 'DocumentProcessor', action: 'processFiles' });
      
      if (result.error) {
        // Handle global processing errors
        const error = result.error;
        if (error.message.includes('timeout')) {
          this.showError('Processing timeout: The operation took too long to complete. Try processing fewer or smaller files.');
        } else if (error.message.includes('memory') || error.message.includes('Memory')) {
          this.showError('Out of memory: Files are too large to process. Try smaller files or process them individually.');
        } else if (error.message.includes('Critical memory')) {
          this.showError('Critical memory usage reached. Please refresh the page and try processing fewer files.');
        } else {
          this.showError(`Processing failed: ${error.message}`);
        }
        
        // Clear chunks to free memory on error
        this.contentStore.clearChunks();
        
      } else if (result.data) {
        // Success - mark as processed, stay on Step 2 for user to click Next
        this.hasProcessedFiles = true;
        this.showSuccess(`Processing complete! Created ${result.data.chunksCreated} chunks from ${result.data.filesProcessed} files`);
      }
      
      // Cleanup
      this.processing = false;
      this.processingProgress = 0;
      this.processingStatus = '';
      
      // Final memory cleanup suggestion
      const finalMemoryStatus = this.checkMemoryUsage();
      if (finalMemoryStatus.status !== 'normal') {
        console.warn('High memory usage detected after processing. Consider refreshing page.');
      }
    },
    
    readFileContent(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (event) => {
          const error = event.target.error;
          let errorMessage = 'Failed to read file content';
          
          if (error) {
            switch (error.code) {
              case error.NOT_FOUND_ERR:
                errorMessage = 'File not found';
                break;
              case error.SECURITY_ERR:
                errorMessage = 'Security error - file access denied';
                break;
              case error.ABORT_ERR:
                errorMessage = 'File read operation was aborted';
                break;
              case error.NOT_READABLE_ERR:
                errorMessage = 'File is not readable';
                break;
              case error.ENCODING_ERR:
                errorMessage = 'File encoding error';
                break;
              default:
                errorMessage = `File read error: ${error.message || 'Unknown error'}`;
            }
          }
          
          reject(new Error(errorMessage));
        };
        reader.readAsText(file);
      });
    },
    
    readFileAsArrayBuffer(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (event) => {
          const error = event.target.error;
          let errorMessage = 'Failed to read file as binary data';
          
          if (error) {
            switch (error.code) {
              case error.NOT_FOUND_ERR:
                errorMessage = 'File not found';
                break;
              case error.SECURITY_ERR:
                errorMessage = 'Security error - file access denied';
                break;
              case error.ABORT_ERR:
                errorMessage = 'File read operation was aborted';
                break;
              case error.NOT_READABLE_ERR:
                errorMessage = 'File is not readable';
                break;
              case error.ENCODING_ERR:
                errorMessage = 'File encoding error';
                break;
              default:
                errorMessage = `File read error: ${error.message || 'Unknown error'}`;
            }
          }
          
          reject(new Error(errorMessage));
        };
        reader.readAsArrayBuffer(file);
      });
    },
    
    // Input sanitization methods
    sanitizeSearchQuery(query) {
      if (!query || typeof query !== 'string') return '';
      
      // Remove HTML tags and dangerous characters
      return query
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/[<>'"&]/g, '') // Remove potentially dangerous chars
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
        .substring(0, 200); // Limit length
    },

    sanitizeTagInput(tagString) {
      if (!tagString || typeof tagString !== 'string') return '';
      
      return tagString
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/[<>'"&]/g, '') // Remove potentially dangerous chars
        .replace(/[,;]+/g, ',') // Normalize separators
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
        .substring(0, 500); // Limit length
    },

    validateTagInput(tagString) {
      const sanitized = this.sanitizeTagInput(tagString);
      const tags = sanitized.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      // Validate individual tags
      const validTags = tags.filter(tag => {
        // Check tag length
        if (tag.length < 1 || tag.length > 50) return false;
        
        // Check for valid characters (letters, numbers, spaces, hyphens, underscores)
        if (!/^[a-zA-Z0-9\s\-_]+$/.test(tag)) return false;
        
        return true;
      });
      
      if (validTags.length !== tags.length) {
        const invalidCount = tags.length - validTags.length;
        this.showWarning(`${invalidCount} invalid tag(s) were removed. Tags must be 1-50 characters and contain only letters, numbers, spaces, hyphens, and underscores.`);
      }
      
      return validTags.join(', ');
    },

    updateChunkTags(chunk) {
      const validatedTags = this.validateTagInput(chunk.tagsString);
      chunk.tagsString = validatedTags;
      
      chunk.tags = chunk.tagsString
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    },

    suggestTagsForChunk(chunk) {
      if (!chunk.content || chunk.content.trim().length === 0) {
        this.showWarning('Cannot suggest tags for empty content. Please ensure the chunk has content.');
        return;
      }

      try {
        // Generate tag suggestions using the existing suggestTags function
        const suggestions = suggestTags(chunk.content);
        
        if (suggestions.length === 0) {
          this.showInfo('Unable to find meaningful tag suggestions for this content. Try adding some manually.');
          return;
        }

        // Get existing tags to avoid duplicates
        const existingTags = chunk.tags || [];
        const newSuggestions = suggestions.filter(tag => !existingTags.includes(tag));
        
        if (newSuggestions.length === 0) {
          this.showInfo('All suggested tags are already present for this chunk.');
          return;
        }

        // Combine existing tags with new suggestions
        const combinedTags = [...existingTags, ...newSuggestions];
        
        // Update the chunk with new tags
        chunk.tags = combinedTags;
        chunk.tagsString = combinedTags.join(', ');
        
        this.showSuccess(`Added ${newSuggestions.length} tag suggestion${newSuggestions.length === 1 ? '' : 's'}: ${newSuggestions.join(', ')}`);
        
      } catch (error) {
        console.error('Error generating tag suggestions:', error);
        this.showError('Failed to generate tag suggestions. Please try again or add tags manually.');
      }
    },
    
    toggleChunkExpanded(index) {
      if (this.expandedChunks.has(index)) {
        this.expandedChunks.delete(index);
      } else {
        this.expandedChunks.add(index);
      }
    },
    
    
    clearChunks() {
      this.contentStore.clearChunks();
      this.uploadedFiles = [];
      this.fileQueue = [];  // Clear the file queue to fully reset
      this.expandedChunks.clear();
      this.hasProcessedFiles = false;  // Reset processing flag
      this.step = 1;
      // Clear file input to allow re-uploading the same file
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },
    
    handleExportSuccess(data) {
      // Handle successful export
      console.log('Export successful:', data);
      
      // Auto-save version on export with the actual exported data
      if (this.chunks.length > 0 && this.versionStore) {
        // Generate version name from uploaded files
        const uniqueFiles = [...new Set(this.uploadedFiles.map(file => file.name.replace(/\.[^/.]+$/, '')))]
        const versionName = uniqueFiles.length === 1 
          ? uniqueFiles[0] 
          : `${uniqueFiles[0]} + ${uniqueFiles.length - 1} more files`
        
        // Create exported data structure
        const exportedData = {
          format: data.format,
          filename: data.filename,
          data: data.exportedData,
          exportOptions: data.exportOptions,
          chunkCount: data.chunkCount,
          exportedAt: new Date().toISOString()
        }
        
        const savedVersion = this.versionStore.saveVersion(
          { 
            chunks: this.chunks,        // Keep chunks as backup
            exportedData: exportedData  // Store the actual exported file
          },
          versionName,
          true  // isAutoSave = true
        );
        
        this.showSuccess(`Export Complete & Saved! Successfully exported ${data.chunkCount} chunks in ${data.format} format. Version "${savedVersion.name}" saved to history.`);
      } else {
        this.showSuccess(`Successfully exported ${data.chunkCount} chunks in ${data.format} format`);
      }
      
      // Emit to parent if needed
      this.$emit('export-success', data);
    },
    
    showError(message, details = null) {
      const notification = {
        id: Date.now(),
        type: 'error',
        message,
        details,
        timestamp: new Date()
      };
      this.notifications.push(notification);
      
      // Auto-remove after 10 seconds for errors
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, 10000);
    },
    
    showSuccess(message) {
      const notification = {
        id: Date.now(),
        type: 'success',
        message,
        timestamp: new Date()
      };
      this.notifications.push(notification);
      
      // Auto-remove after 5 seconds for success
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, 5000);
    },
    
    showWarning(message) {
      const notification = {
        id: Date.now(),
        type: 'warning',
        message,
        timestamp: new Date()
      };
      this.notifications.push(notification);
      
      // Auto-remove after 7 seconds for warnings
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, 7000);
    },
    
    showInfo(message) {
      const notification = {
        id: Date.now(),
        type: 'info',
        message,
        timestamp: new Date()
      };
      this.notifications.push(notification);
      
      // Auto-remove after 5 seconds for info
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, 5000);
    },
    
    removeNotification(notificationId) {
      const index = this.notifications.findIndex(n => n.id === notificationId);
      if (index > -1) {
        this.notifications.splice(index, 1);
      }
    },
    
    showFileErrors(rejectedFiles) {
      const errorDetails = rejectedFiles.map(f => `${f.name}: ${f.reason}`).join('\n');
      this.showError(
        `${rejectedFiles.length} file(s) could not be uploaded`,
        errorDetails
      );
    },
    
    handleDrop(event) {
      event.preventDefault();
      this.dragActive = false;
      
      if (this.processing) return;
      
      const files = Array.from(event.dataTransfer.files);
      this.processDroppedFiles(files);
    },
    
    handleDragOver(event) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
      
      // Show file count indicator
      if (event.dataTransfer.items && event.dataTransfer.items.length > 0) {
        const fileCount = event.dataTransfer.items.length;
        event.dataTransfer.effectAllowed = 'copy';
      }
    },
    
    handleDragEnter(event) {
      event.preventDefault();
      if (!this.processing) {
        this.dragActive = true;
      }
    },
    
    handleDragLeave(event) {
      event.preventDefault();
      // Only hide drag state if leaving the drop zone itself
      if (!event.relatedTarget || !event.currentTarget.contains(event.relatedTarget)) {
        this.dragActive = false;
      }
    },
    
    async processDroppedFiles(files) {
      // Use the same comprehensive validation as handleFileUpload
      await this.processUploadedFiles(files);
    },
    
    // Error boundary helper methods
    getProcessingStage(status) {
      const stages = {
        'queued': 'Waiting in queue',
        'processing': 'Active processing',
        'completed': 'Processing complete',
        'failed': 'Processing failed'
      };
      return stages[status] || 'Unknown stage';
    },
    
    skipFile(fileId) {
      const file = this.fileQueue.find(f => f.id === fileId);
      if (file && (file.status === 'queued' || file.status === 'processing')) {
        file.status = 'skipped';
        file.error = 'Skipped by user';
        
        // Show notification
        this.showNotification('File skipped', `${file.name} was skipped`, 'info');
      }
    },
    
    // Show timeout information for a file
    showTimeoutInfo(file) {
      const recommendations = this.getRecommendedTimeouts(file.size, file.type);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      
      this.showInfo(`Processing timeouts for ${file.name} (${sizeMB}MB):
        • File reading: ${Math.round(recommendations.timeouts.fileRead / 1000)}s
        • Content parsing: ${Math.round(recommendations.timeouts.pdfParsing / 1000)}s  
        • Text processing: ${Math.round(recommendations.timeouts.textProcessing / 1000)}s
        • Estimated total: ${recommendations.estimatedProcessingTime}
        
        Size category: ${recommendations.sizeCategory}`);
    },
    
    // Show chunking recommendations based on document analysis
    showChunkingRecommendations(analysis) {
      const rec = analysis.recommendations;
      const complexity = analysis.contentComplexity.complexity;
      const sizeMB = (analysis.fileSize / (1024 * 1024)).toFixed(1);
      
      // Create detailed recommendation message
      let message = `📊 Analysis Results for ${analysis.fileName} (${sizeMB}MB):
      
📈 Document Stats:
• ${analysis.wordCount.toLocaleString()} words, ${analysis.characterCount.toLocaleString()} characters
• ${analysis.structure.headerCount} headers, ${analysis.structure.paragraphCount} paragraphs
• Content complexity: ${complexity}
• Readability score: ${analysis.contentComplexity.readabilityScore}/100

🎯 Recommended Chunking:
• Method: ${rec.recommendedMethod}
• Chunk size: ${rec.recommendedChunkSize} ${rec.recommendedMethod === 'characters' ? 'characters' : 'words'}
• Overlap: ${rec.recommendedMethod === 'sections' ? 'N/A for sections' : Math.round((rec.recommendedOverlap / rec.recommendedChunkSize) * 100) + '%'}
• Expected chunks: ~${rec.expectedChunkCount}

💡 Reasoning: ${rec.reasoning}`;
      
      if (rec.alternativeOptions.length > 0) {
        message += `\n\n🔄 Alternative Options:`;
        rec.alternativeOptions.forEach((alt, index) => {
          message += `\n${index + 1}. ${alt.method} (${alt.chunkSize} ${alt.method === 'characters' ? 'chars' : 'words'}) - ${alt.reason}`;
        });
      }
      
      this.showInfo(message);
    },
    
    // Apply recommendations from document analysis
    applyRecommendations(analysis) {
      const rec = analysis.recommendations;
      
      // Replace the entire chunkingOptions object to ensure Vue reactivity
      this.chunkingOptions = {
        ...this.chunkingOptions,
        chunkBy: rec.recommendedMethod,
        chunkSize: rec.recommendedChunkSize,
        overlap: rec.recommendedOverlap
      };
      
      this.recommendationsApplied = true;
      
      const overlapPercent = rec.recommendedMethod === 'sections' ? 0 : Math.round((rec.recommendedOverlap / rec.recommendedChunkSize) * 100);
      this.showSuccess(`Applied recommendations: ${rec.recommendedMethod}-based chunking with ${rec.recommendedChunkSize} ${rec.recommendedMethod === 'characters' ? 'characters' : 'words'} and ${overlapPercent}% overlap`);
    },
    
    // Show batch recommendations when multiple files are uploaded
    async showBatchRecommendations() {
      if (this.documentAnalyses.length <= 1) return;
      
      try {
        const files = this.uploadedFiles.slice(-this.documentAnalyses.length);
        const batchResult = await this.analyzeBatch(files);
        
        const batch = batchResult.batchRecommendations;
        const estimate = batchResult.overallEstimate;
        
        const message = `📊 Batch Analysis (${files.length} files):
        
🎯 Recommended Batch Settings:
• Method: ${batch.recommendedMethod}
• Chunk size: ${batch.recommendedChunkSize} ${batch.recommendedMethod === 'characters' ? 'characters' : 'words'}
• Overlap: ${batch.recommendedMethod === 'sections' ? 'N/A for sections' : Math.round((batch.recommendedOverlap / batch.recommendedChunkSize) * 100) + '%'}
• Total expected chunks: ~${batch.expectedChunkCount}

⏱️ Processing Estimate:
• Time: ${estimate.estimatedProcessingTime}
• Memory: ${estimate.memoryUsage}
• Complexity: ${estimate.complexity}

💡 Reasoning: ${batch.reasoning}`;
        
        this.showInfo(message);
        
      } catch (error) {
        console.warn('Batch analysis failed:', error);
      }
    },
    
    // Reset recommendations state
    resetRecommendations() {
      this.documentAnalyses = [];
      this.recommendationsApplied = false;
      this.showRecommendations = true;
    },
    
    // Toggle recommendations visibility
    toggleRecommendations() {
      this.showRecommendations = !this.showRecommendations;
      this.showInfo(`Chunking recommendations ${this.showRecommendations ? 'enabled' : 'disabled'}`);
    },
    
    removeFromQueue(fileId) {
      const fileIndex = this.fileQueue.findIndex(f => f.id === fileId);
      if (fileIndex > -1) {
        const file = this.fileQueue[fileIndex];
        this.fileQueue.splice(fileIndex, 1);
        
        // Also remove from uploadedFiles if present
        const uploadIndex = this.uploadedFiles.findIndex(f => f.name === file.name);
        if (uploadIndex > -1) {
          this.uploadedFiles.splice(uploadIndex, 1);
        }
        
        // Show notification
        this.showNotification('File removed', `${file.name} was removed from queue`, 'info');
      }
    },
    
    handleFileProcessingError(errorData) {
      const { error, errorInfo, errorType, fileContext } = errorData;
      
      // Log the error for debugging
      console.error('File processing error:', errorData);
      
      // Find and update the file in queue
      if (fileContext) {
        const file = this.fileQueue.find(f => f.name === fileContext.name);
        if (file) {
          file.status = 'failed';
          file.error = errorInfo.message;
          file.errorDetails = errorInfo.details;
        }
      }
      
      // Show error notification
      this.showError(
        `File Processing Error: ${fileContext?.name || 'Unknown file'}`,
        errorInfo.message
      );
      
      // Add to global error tracking
      this.addError({
        message: `File processing failed: ${errorInfo.message}`,
        details: errorInfo.details,
        component: 'DocumentProcessor',
        action: 'file-processing',
        severity: 'high'
      });
    }
  }
};
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Enhanced Progress Steps Styling */
.progress-step-container {
  position: relative;
  z-index: 1;
}

.progress-step {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-step-inactive {
  background: linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%);
  color: white;
  opacity: 0.6;
}

.progress-step-active {
  background: linear-gradient(135deg, var(--brand-sage) 0%, var(--brand-sage-dark) 100%);
  color: white;
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(168, 183, 157, 0.4);
  animation: pulse-sage 2s infinite;
}

.progress-step-completed {
  background: linear-gradient(135deg, var(--brand-sage-dark) 0%, #22C55E 100%);
  color: white;
  transform: scale(1.05);
  box-shadow: 0 3px 12px rgba(34, 197, 94, 0.3);
}

.progress-line {
  width: 2rem;
  height: 2px;
  background: linear-gradient(90deg, #E5E7EB 0%, #D1D5DB 100%);
  transition: all 0.3s ease;
  margin: 0 0.25rem;
}

@media (min-width: 640px) {
  .progress-line {
    width: 3rem;
    margin: 0 0.5rem;
  }
}

.progress-line-completed {
  background: linear-gradient(90deg, var(--brand-sage) 0%, var(--brand-sage-dark) 100%);
  box-shadow: 0 1px 4px rgba(168, 183, 157, 0.3);
}

@keyframes pulse-sage {
  0%, 100% {
    box-shadow: 0 4px 16px rgba(168, 183, 157, 0.4);
  }
  50% {
    box-shadow: 0 6px 20px rgba(168, 183, 157, 0.6);
  }
}

/* Scrollbar styling for mobile */
.scrollbar-thin::-webkit-scrollbar {
  height: 4px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: rgba(168, 183, 157, 0.1);
  border-radius: 2px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: var(--brand-sage);
  border-radius: 2px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: var(--brand-sage-dark);
}

/* Mobile responsive adjustments */
@media (max-width: 640px) {
  .progress-step {
    width: 2rem;
    height: 2rem;
    font-size: 0.75rem;
  }
  
  .progress-step-active {
    transform: scale(1.05);
  }
  
  .progress-step-completed {
    transform: scale(1.02);
  }
}

/* Enhanced Drag and Drop Styling */
.drag-zone {
  border: 2px dashed var(--brand-sage);
  border-radius: 1rem;
  background: linear-gradient(135deg, var(--brand-sage-light) 0%, var(--neutral-bg) 100%);
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.drag-zone:hover:not(.drag-zone-active) {
  border-color: var(--brand-sage-dark);
  background: linear-gradient(135deg, var(--brand-sage-light) 0%, var(--brand-gold-soft) 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(168, 183, 157, 0.15);
}

.drag-zone-active {
  border-color: var(--brand-gold);
  border-width: 3px;
  background: linear-gradient(135deg, var(--brand-gold-soft) 0%, var(--brand-sage-light) 100%);
  transform: scale(1.02);
  box-shadow: 0 12px 30px rgba(212, 175, 55, 0.25);
}

.drag-zone-active::before {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  background: linear-gradient(45deg, var(--brand-gold), var(--brand-sage), var(--brand-gold));
  border-radius: 1rem;
  opacity: 0.3;
  z-index: -1;
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.01);
  }
}

/* File preview indication */
.drag-zone-active .fas.fa-download {
  animation: bounce-enhanced 1s ease-in-out infinite;
}

@keyframes bounce-enhanced {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  25% {
    transform: translateY(-10px) scale(1.1);
  }
  75% {
    transform: translateY(5px) scale(0.95);
  }
}

/* Wizard Navigation Styling */
.wizard-navigation {
  background: rgba(249, 250, 251, 0.8);
  backdrop-filter: blur(8px);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-top: 1.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.nav-button {
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.5rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  min-width: 100px;
  justify-content: center;
}

.nav-button-primary {
  background: linear-gradient(135deg, #A8B79D 0%, #8CA085 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(168, 183, 157, 0.3);
}

.nav-button-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(168, 183, 157, 0.4);
}

/* Special hover effect when Next becomes available after processing */
.nav-button-primary.hover-effect-ready {
  animation: pulse-glow 2s ease-in-out;
}

@keyframes pulse-glow {
  0% {
    box-shadow: 0 2px 8px rgba(168, 183, 157, 0.3);
  }
  50% {
    box-shadow: 0 4px 16px rgba(168, 183, 157, 0.6);
  }
  100% {
    box-shadow: 0 2px 8px rgba(168, 183, 157, 0.3);
  }
}

.nav-button-secondary {
  background: rgba(255, 255, 255, 0.8);
  color: #334155;
  border: 2px solid rgba(168, 183, 157, 0.3);
}

.nav-button-secondary:hover:not(:disabled) {
  background: rgba(168, 183, 157, 0.1);
  border-color: #A8B79D;
  transform: translateY(-1px);
}

.progress-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.progress-dot-active {
  background: #A8B79D;
  box-shadow: 0 0 4px rgba(168, 183, 157, 0.5);
}

.progress-dot-inactive {
  background: rgba(168, 183, 157, 0.3);
}

/* Additional styling for consistency with ContentChunkBuilder */
.btn-primary {
  background: linear-gradient(135deg, #A8B79D 0%, #8CA085 100%);
  color: white;
  border: 2px solid #A8B79D;
  box-shadow: 0 2px 4px rgba(168, 183, 157, 0.3);
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(168, 183, 157, 0.4);
}

.btn-secondary {
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid #e2e8f0;
  color: #334155;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(168, 183, 157, 0.1);
  border-color: #A8B79D;
  transform: translateY(-1px);
}

/* Status indicators */
.status-success {
  color: #22C55E;
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.2);
}

.status-warning {
  color: #D4AF37;
  background: rgba(212, 175, 55, 0.1);
  border-color: rgba(212, 175, 55, 0.2);
}

.status-error {
  color: #DC2626;
  background: rgba(220, 38, 38, 0.1);
  border-color: rgba(220, 38, 38, 0.2);
}

.status-processing {
  color: #A8B79D;
  background: rgba(168, 183, 157, 0.1);
  border-color: rgba(168, 183, 157, 0.2);
}

/* Mobile responsive navigation */
@media (max-width: 640px) {
  .wizard-navigation {
    padding: 1rem;
  }
  
  .wizard-navigation .flex {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-button {
    width: 100%;
    min-width: unset;
  }
  
  .wizard-navigation .flex:first-child {
    order: 2;
  }
  
  .wizard-navigation .flex:nth-child(2) {
    order: 1;
    flex-direction: row;
    justify-content: center;
  }
  
  .wizard-navigation .flex:last-child {
    order: 3;
    flex-direction: row;
    gap: 0.5rem;
  }
}

/* Enhanced Step Content Styling */
.step-content {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 1rem;
  position: relative;
  overflow: hidden;
}

.step-content.step-active {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(168, 183, 157, 0.15);
  border: 2px solid var(--brand-sage);
}

.step-content.step-completed {
  opacity: 0.9;
  border: 2px solid var(--brand-sage-light);
}

.step-content.step-completed::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, var(--brand-sage) 0%, #22C55E 100%);
}

.step-header {
  position: relative;
  z-index: 1;
}

.step-number {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--brand-sage) 0%, var(--brand-sage-dark) 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(168, 183, 157, 0.3);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.step-content.step-completed .step-number {
  background: linear-gradient(135deg, var(--brand-sage-dark) 0%, #22C55E 100%);
}

.step-content.step-active .step-number {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(168, 183, 157, 0.4);
  animation: pulse-step 2s infinite;
}

@keyframes pulse-step {
  0%, 100% {
    box-shadow: 0 6px 16px rgba(168, 183, 157, 0.4);
  }
  50% {
    box-shadow: 0 8px 20px rgba(168, 183, 157, 0.6);
  }
}

/* Step content responsive adjustments */
@media (max-width: 768px) {
  .step-number {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1rem;
  }
  
  .step-content.step-active .step-number {
    transform: scale(1.05);
  }
}

/* Desktop Layout Styling */
.desktop-content-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
}

.desktop-header {
  margin-bottom: 2rem;
  padding: 2rem;
  background: rgba(168, 183, 157, 0.1);
  border-radius: 16px;
  border: 1px solid rgba(168, 183, 157, 0.2);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #A8B79D 0%, #D4AF37 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(168, 183, 157, 0.3);
  flex-shrink: 0;
}

.section-icon {
  width: 32px;
  height: 32px;
  color: white;
}

.title-text {
  flex: 1;
}

.desktop-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  background: linear-gradient(135deg, #A8B79D 0%, #D4AF37 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 0.25rem 0;
  line-height: 1.2;
}

.desktop-subtitle {
  font-size: 1.125rem;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
}

.desktop-action-button {
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
  text-decoration: none;
}

.desktop-action-button.secondary {
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid #e2e8f0;
  color: #334155;
}

.desktop-action-button.primary {
  background: linear-gradient(135deg, #A8B79D 0%, #8CA085 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(168, 183, 157, 0.3);
  border: 2px solid #A8B79D;
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

.desktop-action-button.secondary:hover {
  background: rgba(168, 183, 157, 0.1);
  border-color: #A8B79D;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(168, 183, 157, 0.2);
}

.desktop-progress-container {
  margin: 2rem 0;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(168, 183, 157, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.desktop-progress-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  overflow-x: auto;
  padding: 0.5rem;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.desktop-step-indicator {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  margin-bottom: 0.5rem;
}

.desktop-step-inactive {
  background: linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%);
  color: white;
  opacity: 0.6;
}

.desktop-step-active {
  background: linear-gradient(135deg, #A8B79D 0%, #8CA085 100%);
  color: white;
  transform: scale(1.1);
  box-shadow: 0 8px 24px rgba(168, 183, 157, 0.4);
}

.desktop-step-completed {
  background: linear-gradient(135deg, #8CA085 0%, #22C55E 100%);
  color: white;
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.3);
}

.desktop-step-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-align: center;
}

.desktop-step-line {
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, #E5E7EB 0%, #D1D5DB 100%);
  transition: all 0.3s ease;
}

.desktop-step-line-completed {
  background: linear-gradient(90deg, #A8B79D 0%, #8CA085 100%);
}

.desktop-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(168, 183, 157, 0.2);
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.12),
    0 1px 2px rgba(0, 0, 0, 0.24),
    0 20px 60px rgba(168, 183, 157, 0.1);
  margin-bottom: 2rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.desktop-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.3),
    0 24px 80px rgba(168, 183, 157, 0.15);
}

.desktop-card-header {
  padding: 2rem 2rem 1rem 2rem;
  background: linear-gradient(135deg, rgba(245, 247, 244, 0.8) 0%, rgba(255, 255, 255, 0.9) 100%);
  border-bottom: 1px solid rgba(168, 183, 157, 0.1);
}

.desktop-card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
}

.desktop-card-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.desktop-card-content {
  padding: 2rem;
}

.desktop-step-badge {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #A8B79D 0%, #8CA085 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(168, 183, 157, 0.3);
}

@media (max-width: 768px) {
  .desktop-content-container {
    padding: 1rem;
  }
  
  .title-section {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .desktop-title {
    font-size: 2rem;
  }
  
  .desktop-subtitle {
    font-size: 1rem;
  }
  
  .desktop-card-header {
    padding: 1.5rem;
  }
  
  .desktop-card-content {
    padding: 1.5rem;
  }
  
  .desktop-progress-steps {
    justify-content: flex-start;
    gap: 0.5rem;
  }
  
  .progress-step {
    min-width: 60px;
  }
  
  .desktop-step-indicator {
    width: 36px;
    height: 36px;
  }
  
  .desktop-step-line {
    width: 20px;
  }
}

/* Desktop-specific upload zone styling */
.desktop-drag-zone {
  border: 2px dashed rgba(168, 183, 157, 0.4);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 32px rgba(168, 183, 157, 0.15);
}

.desktop-drag-zone:hover:not(.drag-zone-active) {
  border-color: rgba(168, 183, 157, 0.8);
  background: rgba(255, 255, 255, 0.98);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(168, 183, 157, 0.2);
}

.desktop-drag-zone.drag-zone-active {
  border-color: #D4AF37;
  border-width: 3px;
  background: rgba(255, 255, 255, 0.98);
  transform: scale(1.01);
  box-shadow: 0 16px 48px rgba(212, 175, 55, 0.25);
}

.desktop-drag-zone.drag-zone-active::before {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(168, 183, 157, 0.1) 100%);
  z-index: -1;
}

/* Desktop-specific file queue styling */
.desktop-queue-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(168, 183, 157, 0.2);
  margin-bottom: 12px;
  box-shadow: 0 4px 16px rgba(168, 183, 157, 0.1);
}

.desktop-queue-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(168, 183, 157, 0.15);
  background: rgba(255, 255, 255, 0.98);
}

.desktop-queue-item-queued {
  border-left: 4px solid rgba(168, 183, 157, 0.4);
}

.desktop-queue-item-processing {
  border-left: 4px solid #D4AF37;
  box-shadow: 0 4px 16px rgba(212, 175, 55, 0.2);
}

.desktop-queue-item-completed {
  border-left: 4px solid #A8B79D;
  box-shadow: 0 4px 16px rgba(168, 183, 157, 0.2);
}

.desktop-queue-item-failed {
  border-left: 4px solid #DC2626;
  box-shadow: 0 4px 16px rgba(220, 38, 38, 0.1);
}

/* Desktop-specific progress bars */
.desktop-progress-bar-bg {
  width: 100%;
  height: 6px;
  border-radius: 8px;
  background: rgba(168, 183, 157, 0.15);
  overflow: hidden;
  position: relative;
}

.desktop-progress-bar-fill {
  height: 100%;
  border-radius: 8px;
  background: linear-gradient(90deg, #D4AF37 0%, #B8941F 100%);
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
  position: relative;
}

.desktop-progress-bar-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Desktop analysis progress bar */
.desktop-analysis-progress-bg {
  width: 100%;
  height: 8px;
  border-radius: 12px;
  background: rgba(168, 183, 157, 0.15);
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.desktop-analysis-progress-fill {
  height: 100%;
  border-radius: 12px;
  background: linear-gradient(90deg, #A8B79D 0%, #8CA085 100%);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(168, 183, 157, 0.4);
  position: relative;
}

.desktop-analysis-progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
  animation: shimmer 2.5s infinite;
}
</style>