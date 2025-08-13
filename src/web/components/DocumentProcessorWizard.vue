<template>
  <div class="document-processor-wizard">
    <!-- Fixed Header with Progress -->
    <div class="wizard-header">
      <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="wizard-icon">
              <svg viewBox="0 0 24 24" fill="none" class="w-8 h-8 text-brand-sage">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-800">Document Processing</h1>
              <p class="text-gray-600">{{ currentStepData.title }}</p>
            </div>
          </div>
          
          <!-- Step Progress Indicators -->
          <div class="flex justify-center mb-8 px-4">
            <div class="flex items-center space-x-2 sm:space-x-4">
            <div 
              v-for="(stepData, index) in steps" 
              :key="index"
              class="flex flex-col items-center"
            >
              <div 
                :class="[
                  'step-indicator',
                  index < currentStep - 1 ? 'step-indicator-completed' :
                  index === currentStep - 1 ? 'step-indicator-active' : 
                  'step-indicator-inactive'
                ]"
                @click="navigateToStep(index + 1)"
              >
                {{ index + 1 }}
              </div>
              <span class="mt-2 text-xs sm:text-sm font-medium text-neutral-700">{{ stepData.shortTitle }}</span>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dynamic Step Content -->
    <div class="wizard-content">
      <div class="container mx-auto px-6 py-8">
        <div class="step-container">
          <transition name="step-slide" mode="out-in">
            <div 
              :key="currentStep"
              class="step-content active"
            >
              <!-- Step 1: Upload -->
              <div v-if="currentStep === 1" class="step-card">
                <div class="step-header">
                  <h2 class="text-3xl font-bold text-gray-800 mb-2">Upload Documents</h2>
                  <p class="text-lg text-gray-600">Select or drag files to begin processing</p>
                </div>
                
                <div class="step-body">
                  <!-- File Drop Zone -->
                  <div 
                    class="drop-zone"
                    :class="{ 'drag-active': isDragActive }"
                    @drop.prevent="handleFileDrop"
                    @dragover.prevent="isDragActive = true"
                    @dragleave="isDragActive = false"
                  >
                    <div class="drop-zone-content">
                      <div class="drop-icon">
                        <i class="fas fa-cloud-upload-alt text-4xl text-brand-sage mb-4"></i>
                      </div>
                      <h3 class="text-xl font-semibold mb-2">Drop files here</h3>
                      <p class="text-gray-600 mb-4">or</p>
                      <div class="button-container">
                        <button 
                          @click="selectFiles"
                          class="desktop-action-button primary"
                        >
                          <i class="fas fa-folder-open"></i>
                          <span>Browse Files</span>
                        </button>
                      </div>
                      <p class="text-sm text-gray-500 mt-4">
                        Supported: PDF, Markdown, TXT, DOCX • Max 20 files, 200MB total
                      </p>
                    </div>
                  </div>

                  <!-- File Queue Display -->
                  <div v-if="fileQueue.length > 0" class="file-queue mt-6">
                    <h3 class="text-lg font-semibold mb-4">Selected Files ({{ fileQueue.length }})</h3>
                    <div class="file-list">
                      <div 
                        v-for="(file, index) in fileQueue" 
                        :key="index"
                        class="file-item"
                      >
                        <div class="file-info">
                          <i :class="getFileIcon(file)" class="text-brand-sage mr-3"></i>
                          <div>
                            <div class="font-medium">{{ file.name }}</div>
                            <div class="text-sm text-gray-500">{{ formatFileSize(file.size) }}</div>
                          </div>
                        </div>
                        <button 
                          @click="removeFile(index)"
                          class="remove-btn"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Step 2: Configure -->
              <div v-else-if="currentStep === 2" class="step-card">
                <div class="step-header">
                  <h2 class="text-3xl font-bold text-gray-800 mb-2">Configure Processing</h2>
                  <p class="text-lg text-gray-600">Set up chunking and processing options</p>
                </div>
                
                <div class="step-body">
                  <div class="config-grid">
                    <!-- Chunking Method -->
                    <div class="config-section">
                      <h3 class="config-title">Chunking Method</h3>
                      <div class="method-options">
                        <div 
                          v-for="method in chunkingMethods" 
                          :key="method.id"
                          class="method-card"
                          :class="{ 'selected': chunkingMethod === method.id }"
                          @click="chunkingMethod = method.id"
                        >
                          <i :class="method.icon" class="method-icon"></i>
                          <div class="method-info">
                            <div class="method-name">{{ method.name }}</div>
                            <div class="method-desc">{{ method.description }}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Chunk Size Settings -->
                    <div class="config-section">
                      <h3 class="config-title">Chunk Size</h3>
                      <div class="size-controls">
                        <label class="form-label">
                          <span>Words per chunk</span>
                          <input 
                            v-model.number="chunkSize" 
                            type="range" 
                            min="100" 
                            max="1000" 
                            step="50"
                            class="range-input"
                          >
                          <span class="size-display">{{ chunkSize }} words</span>
                        </label>
                        
                        <label class="form-label mt-4">
                          <span>Overlap percentage</span>
                          <input 
                            v-model.number="chunkOverlap" 
                            type="range" 
                            min="0" 
                            max="30" 
                            step="5"
                            class="range-input"
                          >
                          <span class="size-display">{{ chunkOverlap }}%</span>
                        </label>
                      </div>
                    </div>

                    <!-- Processing Options -->
                    <div class="config-section">
                      <h3 class="config-title">Options</h3>
                      <div class="option-toggles">
                        <label class="toggle-option">
                          <input 
                            v-model="enableAutoTagging" 
                            type="checkbox"
                            class="toggle-checkbox"
                          >
                          <span class="toggle-label">
                            <i class="fas fa-tags mr-2"></i>
                            Auto-generate tags
                          </span>
                        </label>
                        
                        <label class="toggle-option">
                          <input 
                            v-model="enableQualityAnalysis" 
                            type="checkbox"
                            class="toggle-checkbox"
                          >
                          <span class="toggle-label">
                            <i class="fas fa-analytics mr-2"></i>
                            Run quality analysis
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Step 3: Process -->
              <div v-else-if="currentStep === 3" class="step-card">
                <div class="step-header">
                  <h2 class="text-3xl font-bold text-gray-800 mb-2">Processing Documents</h2>
                  <p class="text-lg text-gray-600">Extracting text and creating chunks</p>
                </div>
                
                <div class="step-body">
                  <div class="processing-display">
                    <!-- Overall Progress -->
                    <div class="progress-section">
                      <div class="progress-header">
                        <span class="progress-label">Overall Progress</span>
                        <span class="progress-stats">{{ completedFiles.length }} of {{ fileQueue.length }} files</span>
                      </div>
                      <div class="progress-bar">
                        <div 
                          class="progress-fill" 
                          :style="{ width: overallProgress + '%' }"
                        ></div>
                      </div>
                    </div>

                    <!-- Current File Processing -->
                    <div v-if="processingFile" class="current-file">
                      <div class="file-processing-card">
                        <div class="processing-icon">
                          <i class="fas fa-cog fa-spin text-brand-sage"></i>
                        </div>
                        <div class="processing-info">
                          <div class="file-name">{{ processingFile.name }}</div>
                          <div class="processing-stage">{{ processingStage }}</div>
                        </div>
                      </div>
                    </div>

                    <!-- Processing Results -->
                    <div class="results-summary">
                      <div class="result-card">
                        <div class="result-icon">
                          <i class="fas fa-cubes text-brand-sage"></i>
                        </div>
                        <div class="result-stats">
                          <div class="result-number">{{ chunks.length }}</div>
                          <div class="result-label">Chunks Created</div>
                        </div>
                      </div>
                      
                      <div class="result-card">
                        <div class="result-icon">
                          <i class="fas fa-file-alt text-blue-500"></i>
                        </div>
                        <div class="result-stats">
                          <div class="result-number">{{ completedFiles.length }}</div>
                          <div class="result-label">Files Processed</div>
                        </div>
                      </div>

                      <div class="result-card">
                        <div class="result-icon">
                          <i class="fas fa-exclamation-triangle text-amber-500"></i>
                        </div>
                        <div class="result-stats">
                          <div class="result-number">{{ failedFiles.length }}</div>
                          <div class="result-label">Failed Files</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Step 4: Review -->
              <div v-else-if="currentStep === 4" class="step-card">
                <div class="step-header">
                  <h2 class="text-3xl font-bold text-gray-800 mb-2">Review & Edit</h2>
                  <p class="text-lg text-gray-600">Review generated chunks and make adjustments</p>
                </div>
                
                <div class="step-body">
                  <!-- Chunk Statistics -->
                  <div class="chunk-stats">
                    <div class="stat-item">
                      <span class="stat-value">{{ chunks.length }}</span>
                      <span class="stat-label">Total Chunks</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-value">{{ averageChunkSize }}</span>
                      <span class="stat-label">Avg Size (words)</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-value">{{ uniqueTags }}</span>
                      <span class="stat-label">Unique Tags</span>
                    </div>
                  </div>

                  <!-- Chunk List -->
                  <div class="chunk-list">
                    <div 
                      v-for="(chunk, index) in chunks.slice(0, 10)" 
                      :key="index"
                      class="chunk-item"
                    >
                      <div class="chunk-header">
                        <span class="chunk-number">{{ index + 1 }}</span>
                        <span class="chunk-source">{{ chunk.source }}</span>
                        <span class="chunk-size">{{ chunk.content.split(' ').length }} words</span>
                      </div>
                      <div class="chunk-content">
                        {{ chunk.content.substring(0, 200) }}{{ chunk.content.length > 200 ? '...' : '' }}
                      </div>
                      <div class="chunk-tags" v-if="chunk.tags">
                        <span 
                          v-for="tag in chunk.tags.slice(0, 3)" 
                          :key="tag"
                          class="tag-pill"
                        >
                          {{ tag }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div v-if="chunks.length > 10" class="show-more">
                    <p class="text-gray-600">Showing first 10 of {{ chunks.length }} chunks</p>
                  </div>
                </div>
              </div>

              <!-- Step 5: Export -->
              <div v-else-if="currentStep === 5" class="step-card">
                <div class="step-header">
                  <h2 class="text-3xl font-bold text-gray-800 mb-2">Export Results</h2>
                  <p class="text-lg text-gray-600">Choose your export format and download</p>
                </div>
                
                <div class="step-body">
                  <!-- Export Options -->
                  <div class="export-options">
                    <div 
                      v-for="format in exportFormats" 
                      :key="format.id"
                      class="export-card"
                      :class="{ 'selected': selectedFormat === format.id }"
                      @click="selectedFormat = format.id"
                    >
                      <i :class="format.icon" class="export-icon"></i>
                      <div class="export-info">
                        <div class="export-name">{{ format.name }}</div>
                        <div class="export-desc">{{ format.description }}</div>
                      </div>
                    </div>
                  </div>

                  <!-- Export Button -->
                  <div class="export-actions">
                    <button 
                      @click="exportData"
                      class="desktop-action-button primary"
                      :disabled="!selectedFormat || chunks.length === 0"
                    >
                      <i class="fas fa-download"></i>
                      <span>Download {{ selectedFormatData?.name || 'Export' }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- Fixed Bottom Navigation -->
    <div class="wizard-navigation">
      <div class="container mx-auto px-6 py-4">
        <div class="nav-container">
          <!-- Progress Section -->
          <div class="nav-progress">
            <span class="step-counter">Step {{ currentStep }} of {{ totalSteps }}</span>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
            </div>
          </div>
          
          <!-- Navigation Controls -->
          <div class="nav-controls">
            <button 
              class="desktop-action-button secondary" 
              @click="previousStep"
              :disabled="currentStep === 1"
            >
              <i class="fas fa-chevron-left"></i>
              <span>Previous</span>
            </button>
            
            <button 
              class="desktop-action-button primary" 
              @click="nextStep"
              :disabled="!canProceed"
            >
              <span>{{ currentStep === totalSteps ? 'Complete' : 'Continue' }}</span>
              <i v-if="currentStep < totalSteps" class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Hidden file input -->
    <input 
      ref="fileInput"
      type="file" 
      multiple 
      accept=".pdf,.md,.txt,.docx"
      style="display: none"
      @change="handleFileSelect"
    >

    <!-- Notification Toast -->
    <transition name="notification">
      <div 
        v-if="notification.show" 
        class="notification-toast"
        :class="`notification-${notification.type}`"
      >
        <div class="notification-content">
          <i :class="getNotificationIcon(notification.type)" class="notification-icon"></i>
          <div class="notification-text">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>
          </div>
          <button @click="hideNotification" class="notification-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { saveAs } from 'file-saver';

export default {
  name: 'DocumentProcessorWizard',
  data() {
    return {
      currentStep: 1,
      totalSteps: 5,
      isDragActive: false,
      fileQueue: [],
      completedFiles: [],
      failedFiles: [],
      chunks: [],
      processingFile: null,
      processingStage: '',
      
      // Configuration
      chunkingMethod: 'word',
      chunkSize: 400,
      chunkOverlap: 15,
      enableAutoTagging: true,
      enableQualityAnalysis: true,
      selectedFormat: 'azure-vector',

      // Notification system
      notification: {
        show: false,
        type: 'success', // success, warning, error, info
        title: '',
        message: ''
      },

      steps: [
        { title: 'Upload Documents', shortTitle: 'Upload', description: 'Select files to process' },
        { title: 'Configure Processing', shortTitle: 'Configure', description: 'Set chunking options' },
        { title: 'Process Documents', shortTitle: 'Process', description: 'Extract and chunk text' },
        { title: 'Review & Edit', shortTitle: 'Review', description: 'Review generated chunks' },
        { title: 'Export Results', shortTitle: 'Export', description: 'Download processed data' }
      ],

      chunkingMethods: [
        {
          id: 'word',
          name: 'Word-based',
          description: 'Split by word count with overlap',
          icon: 'fas fa-align-left'
        },
        {
          id: 'semantic',
          name: 'Semantic',
          description: 'Split by meaning and context',
          icon: 'fas fa-brain'
        },
        {
          id: 'section',
          name: 'Section-based',
          description: 'Split by headers and sections',
          icon: 'fas fa-list'
        }
      ],

      exportFormats: [
        {
          id: 'azure-vector',
          name: 'Azure Vector Store',
          description: 'Optimized for Azure OpenAI',
          icon: 'fab fa-microsoft'
        },
        {
          id: 'json',
          name: 'JSON',
          description: 'Standard JSON format',
          icon: 'fas fa-code'
        },
        {
          id: 'csv',
          name: 'CSV',
          description: 'Comma-separated values',
          icon: 'fas fa-table'
        }
      ]
    }
  },

  computed: {
    currentStepData() {
      return this.steps[this.currentStep - 1];
    },

    progressPercentage() {
      return (this.currentStep / this.totalSteps) * 100;
    },

    canProceed() {
      switch (this.currentStep) {
        case 1: return this.fileQueue.length > 0;
        case 2: return true; // Configuration is always valid
        case 3: return this.completedFiles.length > 0; // At least one file processed
        case 4: return this.chunks.length > 0; // Chunks available for review
        case 5: return this.selectedFormat; // Format selected
        default: return false;
      }
    },

    overallProgress() {
      if (this.fileQueue.length === 0) return 0;
      return (this.completedFiles.length / this.fileQueue.length) * 100;
    },

    averageChunkSize() {
      if (this.chunks.length === 0) return 0;
      const totalWords = this.chunks.reduce((sum, chunk) => sum + chunk.content.split(' ').length, 0);
      return Math.round(totalWords / this.chunks.length);
    },

    uniqueTags() {
      const allTags = this.chunks.flatMap(chunk => chunk.tags || []);
      return new Set(allTags).size;
    },

    selectedFormatData() {
      return this.exportFormats.find(f => f.id === this.selectedFormat);
    }
  },

  methods: {
    selectFiles() {
      this.$refs.fileInput.click();
    },

    handleFileSelect(event) {
      const files = Array.from(event.target.files);
      this.addFiles(files);
    },

    handleFileDrop(event) {
      this.isDragActive = false;
      const files = Array.from(event.dataTransfer.files);
      this.addFiles(files);
    },

    addFiles(files) {
      // Filter valid files
      const validFiles = files.filter(file => {
        const ext = file.name.toLowerCase().split('.').pop();
        return ['pdf', 'md', 'txt', 'docx'].includes(ext);
      });

      // Check for invalid files
      const invalidFiles = files.length - validFiles.length;
      
      // Add to queue (limit 20 files)
      const remainingSlots = 20 - this.fileQueue.length;
      const filesToAdd = validFiles.slice(0, remainingSlots);
      
      this.fileQueue.push(...filesToAdd);
      
      // Show notification
      if (filesToAdd.length > 0) {
        this.showNotification(
          'success', 
          'Files Added Successfully!', 
          `${filesToAdd.length} file(s) added to processing queue`
        );
      }
      
      if (invalidFiles > 0) {
        this.showNotification(
          'warning', 
          'Some Files Skipped', 
          `${invalidFiles} file(s) were unsupported format`
        );
      }
      
      if (validFiles.length > remainingSlots) {
        this.showNotification(
          'warning', 
          'File Limit Reached', 
          `Maximum 20 files allowed. ${validFiles.length - remainingSlots} files were not added.`
        );
      }
    },

    removeFile(index) {
      this.fileQueue.splice(index, 1);
    },

    getFileIcon(file) {
      const ext = file.name.toLowerCase().split('.').pop();
      switch (ext) {
        case 'pdf': return 'fas fa-file-pdf text-red-500';
        case 'md': return 'fab fa-markdown text-blue-500';
        case 'txt': return 'fas fa-file-alt text-gray-500';
        case 'docx': return 'fas fa-file-word text-blue-600';
        default: return 'fas fa-file text-gray-400';
      }
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    navigateToStep(step) {
      if (step >= 1 && step <= this.totalSteps) {
        this.currentStep = step;
      }
    },

    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },

    nextStep() {
      if (this.currentStep < this.totalSteps && this.canProceed) {
        // Show completion notification for current step
        this.showStepCompletionNotification(this.currentStep);
        
        if (this.currentStep === 2) {
          // Start processing when moving to step 3
          this.startProcessing();
        }
        this.currentStep++;
      } else if (this.currentStep === this.totalSteps) {
        // Complete the workflow
        this.completeWorkflow();
      }
    },

    async startProcessing() {
      this.showNotification(
        'info',
        'Processing Started',
        `Beginning to process ${this.fileQueue.length} file(s)`
      );
      
      // Simulate processing for demo
      for (const file of this.fileQueue) {
        this.processingFile = file;
        this.processingStage = 'Extracting text...';
        
        await this.delay(1000);
        
        this.processingStage = 'Creating chunks...';
        await this.delay(1000);
        
        // Create mock chunks
        const mockChunks = this.createMockChunks(file);
        this.chunks.push(...mockChunks);
        
        this.completedFiles.push(file);
        this.processingFile = null;
      }
    },

    createMockChunks(file) {
      // Create mock chunks for demo
      const numChunks = Math.floor(Math.random() * 5) + 3;
      const chunks = [];
      
      for (let i = 0; i < numChunks; i++) {
        chunks.push({
          id: `${file.name}-chunk-${i}`,
          content: `This is a sample chunk from ${file.name}. It contains processed text that would normally be extracted from the actual document. This chunk demonstrates how the content would be structured for AI processing.`,
          source: file.name,
          tags: this.enableAutoTagging ? ['document', 'processed', 'sample'] : [],
          wordCount: Math.floor(Math.random() * 200) + 200,
          timestamp: new Date().toISOString()
        });
      }
      
      return chunks;
    },

    exportData() {
      if (!this.selectedFormat || this.chunks.length === 0) return;
      
      const exportData = {
        format: this.selectedFormat,
        chunks: this.chunks,
        metadata: {
          exportDate: new Date().toISOString(),
          totalChunks: this.chunks.length,
          chunkingMethod: this.chunkingMethod,
          chunkSize: this.chunkSize,
          overlap: this.chunkOverlap
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const filename = `document-chunks-${this.selectedFormat}-${Date.now()}.json`;
      saveAs(blob, filename);
      
      this.showNotification(
        'success',
        'Export Complete!',
        `Downloaded ${this.chunks.length} chunks in ${this.selectedFormatData?.name} format`
      );
    },

    completeWorkflow() {
      // Handle workflow completion
      console.log('Workflow completed successfully!');
    },

    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    // Notification methods
    showNotification(type, title, message) {
      this.notification = {
        show: true,
        type,
        title,
        message
      };
      
      // Auto-hide after 4 seconds
      setTimeout(() => {
        this.hideNotification();
      }, 4000);
    },

    hideNotification() {
      this.notification.show = false;
    },

    showStepCompletionNotification(step) {
      const stepData = this.steps[step - 1];
      const notifications = {
        1: {
          title: 'Files Uploaded Successfully!',
          message: `${this.fileQueue.length} file(s) ready for processing`
        },
        2: {
          title: 'Configuration Complete!',
          message: `Chunking method: ${this.chunkingMethod}, Size: ${this.chunkSize} words`
        },
        3: {
          title: 'Processing Complete!',
          message: `${this.chunks.length} chunks created from ${this.completedFiles.length} files`
        },
        4: {
          title: 'Review Complete!',
          message: `${this.chunks.length} chunks ready for export`
        },
        5: {
          title: 'Export Successful!',
          message: `Data exported in ${this.selectedFormatData?.name} format`
        }
      };

      const notificationData = notifications[step];
      if (notificationData) {
        this.showNotification('success', notificationData.title, notificationData.message);
      }
    },

    getNotificationIcon(type) {
      switch (type) {
        case 'success': return 'fas fa-check-circle';
        case 'warning': return 'fas fa-exclamation-triangle';
        case 'error': return 'fas fa-times-circle';
        case 'info': return 'fas fa-info-circle';
        default: return 'fas fa-bell';
      }
    }
  }
}
</script>

<style scoped>
.document-processor-wizard {
  min-height: 100vh;
  background: linear-gradient(135deg, #fafafa 0%, #f5f7f4 100%);
  display: flex;
  flex-direction: column;
}

/* Header */
.wizard-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(168, 183, 157, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}


/* Step Indicators - Matching Manual Content Builder exactly */
.step-indicator {
  @apply w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 cursor-pointer;
}

.step-indicator-inactive {
  @apply bg-neutral-200 text-neutral-500;
}

.step-indicator-active {
  @apply bg-primary-600 text-white shadow-lg scale-110;
}

.step-indicator-completed {
  @apply bg-success-600 text-white;
}

/* Content */
.wizard-content {
  flex: 1;
  padding-bottom: 120px; /* Space for fixed navigation */
}

.step-container {
  position: relative;
  min-height: 600px;
}

.step-content {
  width: 100%;
}

/* Step Transitions */
.step-slide-enter-active,
.step-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.step-slide-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.step-slide-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}

/* Step Card */
.step-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(24px);
  border-radius: 20px;
  border: 1px solid rgba(168, 183, 157, 0.12);
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 20px 60px rgba(168, 183, 157, 0.08);
  padding: 3rem;
  max-width: 900px;
  margin: 0 auto;
}

.step-header {
  text-align: center;
  margin-bottom: 3rem;
}

/* Drop Zone */
.drop-zone {
  border: 2px dashed #d1d5db;
  border-radius: 16px;
  padding: 3rem;
  text-align: center;
  transition: all 0.3s ease;
  background: rgba(249, 250, 251, 0.5);
}

.drop-zone:hover,
.drop-zone.drag-active {
  border-color: var(--brand-sage);
  background: rgba(168, 183, 157, 0.05);
  transform: translateY(-2px);
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.drop-zone-content h3 {
  color: #374151;
}

.button-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

/* File Queue */
.file-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.file-item:hover {
  border-color: var(--brand-sage);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.file-info {
  display: flex;
  align-items: center;
}

.remove-btn {
  padding: 0.5rem;
  border-radius: 8px;
  border: none;
  background: #fee2e2;
  color: #dc2626;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: #fecaca;
}

/* Configuration Grid */
.config-grid {
  display: grid;
  gap: 2rem;
}

.config-section {
  background: rgba(249, 250, 251, 0.5);
  border-radius: 16px;
  padding: 2rem;
}

.config-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1.5rem;
}

/* Method Options */
.method-options {
  display: grid;
  gap: 1rem;
}

.method-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.method-card:hover {
  border-color: var(--brand-sage);
  background: rgba(168, 183, 157, 0.05);
}

.method-card.selected {
  border-color: var(--brand-sage);
  background: rgba(168, 183, 157, 0.1);
}

.method-icon {
  font-size: 1.5rem;
  color: var(--brand-sage);
  margin-right: 1rem;
}

.method-name {
  font-weight: 600;
  color: #374151;
}

.method-desc {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Range Inputs */
.range-input {
  width: 100%;
  margin: 0.5rem 0;
}

.size-display {
  font-weight: 600;
  color: var(--brand-sage);
}

/* Processing Display */
.processing-display {
  space: 2rem;
}

.progress-section {
  margin-bottom: 2rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--brand-sage), var(--brand-gold));
  transition: width 0.3s ease;
}

/* Results Summary */
.results-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.result-card {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.result-icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.result-number {
  font-size: 2rem;
  font-weight: bold;
  color: #374151;
}

.result-label {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Chunk List */
.chunk-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(249, 250, 251, 0.5);
  border-radius: 16px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: var(--brand-sage);
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.chunk-list {
  space: 1rem;
}

.chunk-item {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.chunk-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.chunk-number {
  background: var(--brand-sage);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.chunk-source {
  font-weight: 600;
  color: #374151;
}

.chunk-size {
  font-size: 0.875rem;
  color: #6b7280;
  margin-left: auto;
}

.chunk-content {
  color: #374151;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.chunk-tags {
  display: flex;
  gap: 0.5rem;
}

.tag-pill {
  background: rgba(168, 183, 157, 0.1);
  color: var(--brand-sage);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Export Options */
.export-options {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.export-card {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.export-card:hover {
  border-color: var(--brand-sage);
  background: rgba(168, 183, 157, 0.05);
}

.export-card.selected {
  border-color: var(--brand-sage);
  background: rgba(168, 183, 157, 0.1);
}

.export-icon {
  font-size: 2rem;
  color: var(--brand-sage);
  margin-right: 1rem;
}

.export-name {
  font-weight: 600;
  color: #374151;
}

.export-desc {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Export Actions */
.export-actions {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

/* Navigation */
.wizard-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(168, 183, 157, 0.1);
  z-index: 100;
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-progress {
  display: flex;
  flex-direction: column;
  min-width: 200px;
}

.step-counter {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.nav-controls {
  display: flex;
  gap: 1rem;
}

/* Desktop Action Button Styling - Matching Manual Content Builder */
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

.desktop-action-button.secondary:hover:not(:disabled) {
  background: rgba(168, 183, 157, 0.1);
  border-color: #A8B79D;
}

.desktop-action-button.secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 768px) {
  .step-card {
    padding: 1.5rem;
    margin: 1rem;
  }
  
  .step-indicators {
    display: none;
  }
  
  .nav-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .config-grid {
    grid-template-columns: 1fr;
  }
  
  .results-summary {
    grid-template-columns: 1fr;
  }
}

/* Notification System */
.notification-toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 1000;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border-left: 4px solid #10b981;
  min-width: 350px;
  max-width: 450px;
}

.notification-success {
  border-left-color: #10b981;
}

.notification-warning {
  border-left-color: #f59e0b;
}

.notification-error {
  border-left-color: #ef4444;
}

.notification-info {
  border-left-color: #3b82f6;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  padding: 1.5rem;
  gap: 1rem;
}

.notification-icon {
  font-size: 1.25rem;
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.notification-success .notification-icon {
  color: #10b981;
}

.notification-warning .notification-icon {
  color: #f59e0b;
}

.notification-error .notification-icon {
  color: #ef4444;
}

.notification-info .notification-icon {
  color: #3b82f6;
}

.notification-text {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}

.notification-message {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.4;
}

.notification-close {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.notification-close:hover {
  background: #f3f4f6;
  color: #6b7280;
}

/* Notification Animations */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

/* Custom Variables */
:root {
  --brand-sage: #A8B79D;
  --brand-sage-dark: #8CA085;
  --brand-gold: #D4AF37;
}
</style>