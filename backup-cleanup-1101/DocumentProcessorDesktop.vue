<template>
  <div class="desktop-document-processor">
    <!-- Fixed Header with Progress Steps -->
    <div class="desktop-processor-header">
      <div class="header-content">
        <div class="title-section">
          <div class="title-icon">
            <svg viewBox="0 0 24 24" fill="none" class="section-icon">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="title-text">
            <h1 class="desktop-title">Document Processing</h1>
            <p class="desktop-subtitle">Transform documents into AI-ready chunks</p>
          </div>
        </div>
        
        <!-- Progress Indicator -->
        <div class="desktop-progress-bar">
          <div v-for="(stepItem, index) in steps" :key="index" 
               class="progress-step" 
               :class="{ 
                 'active': currentStep === index + 1,
                 'completed': currentStep > index + 1 
               }"
               @click="goToStep(index + 1)">
            <div class="step-indicator">
              <i v-if="currentStep > index + 1" class="fas fa-check"></i>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <span class="step-label">{{ stepItem.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area with Horizontal Transitions -->
    <div class="desktop-processor-body">
      <div class="step-panels-container">
        <transition-group name="slide" tag="div" class="step-panels">
          <!-- Step 1: Upload -->
          <div v-show="currentStep === 1" key="step1" class="step-panel">
            <div class="panel-content">
              <div class="panel-header">
                <h2 class="panel-title">Upload Your Documents</h2>
                <p class="panel-subtitle">Select PDF or Markdown files to process</p>
              </div>
              
              <div class="upload-area">
                <div 
                  class="drop-zone"
                  :class="{ 'drag-active': dragActive }"
                  @drop="handleDrop"
                  @dragover.prevent="dragActive = true"
                  @dragleave="dragActive = false">
                  
                  <div class="drop-zone-content">
                    <i class="fas fa-cloud-upload-alt upload-icon"></i>
                    <h3>Drag & Drop Files Here</h3>
                    <p>or</p>
                    <button class="browse-button" @click="$refs.fileInput.click()">
                      <i class="fas fa-folder-open"></i>
                      Browse Files
                    </button>
                    <input 
                      ref="fileInput"
                      type="file" 
                      accept=".md,.markdown,.pdf,.docx" 
                      @change="handleFileUpload"
                      multiple
                      class="hidden">
                  </div>
                </div>
                
                <!-- File List -->
                <div v-if="uploadedFiles.length > 0" class="file-list">
                  <h3 class="file-list-title">Uploaded Files ({{ uploadedFiles.length }})</h3>
                  <div class="file-items">
                    <div v-for="file in uploadedFiles" :key="file.name" class="file-item">
                      <i :class="getFileIcon(file.name)"></i>
                      <span class="file-name">{{ file.name }}</span>
                      <span class="file-size">{{ formatFileSize(file.size) }}</span>
                      <button @click="removeFile(file)" class="remove-file">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="panel-actions">
                <button 
                  @click="nextStep" 
                  :disabled="uploadedFiles.length === 0"
                  class="action-button primary">
                  Continue
                  <i class="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Step 2: Configure -->
          <div v-show="currentStep === 2" key="step2" class="step-panel">
            <div class="panel-content">
              <div class="panel-header">
                <h2 class="panel-title">Configure Processing</h2>
                <p class="panel-subtitle">Choose how to chunk your documents</p>
              </div>
              
              <div class="config-grid">
                <div class="config-section">
                  <h3 class="config-title">Chunking Method</h3>
                  <div class="config-options">
                    <label class="option-card" :class="{ selected: chunkingMethod === 'words' }">
                      <input type="radio" v-model="chunkingMethod" value="words" class="hidden">
                      <div class="option-content">
                        <i class="fas fa-font"></i>
                        <span>By Words</span>
                        <small>Best for most AI models</small>
                      </div>
                    </label>
                    <label class="option-card" :class="{ selected: chunkingMethod === 'characters' }">
                      <input type="radio" v-model="chunkingMethod" value="characters" class="hidden">
                      <div class="option-content">
                        <i class="fas fa-text-width"></i>
                        <span>By Characters</span>
                        <small>Precise control</small>
                      </div>
                    </label>
                    <label class="option-card" :class="{ selected: chunkingMethod === 'sections' }">
                      <input type="radio" v-model="chunkingMethod" value="sections" class="hidden">
                      <div class="option-content">
                        <i class="fas fa-list-alt"></i>
                        <span>By Sections</span>
                        <small>Natural boundaries</small>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div v-if="chunkingMethod !== 'sections'" class="config-section">
                  <h3 class="config-title">Chunk Size</h3>
                  <div class="slider-control">
                    <input 
                      type="range" 
                      v-model="chunkSize" 
                      :min="chunkingMethod === 'words' ? 100 : 500"
                      :max="chunkingMethod === 'words' ? 2000 : 8000"
                      :step="chunkingMethod === 'words' ? 50 : 100"
                      class="chunk-slider">
                    <div class="slider-value">
                      {{ chunkSize }} {{ chunkingMethod }}
                    </div>
                  </div>
                  
                  <h3 class="config-title mt-4">Overlap</h3>
                  <div class="slider-control">
                    <input 
                      type="range" 
                      v-model="overlapPercentage" 
                      min="0"
                      max="50"
                      step="5"
                      class="chunk-slider">
                    <div class="slider-value">
                      {{ overlapPercentage }}%
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="panel-actions">
                <button @click="previousStep" class="action-button secondary">
                  <i class="fas fa-arrow-left"></i>
                  Back
                </button>
                <button @click="startProcessing" class="action-button primary">
                  Start Processing
                  <i class="fas fa-play"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Step 3: Process -->
          <div v-show="currentStep === 3" key="step3" class="step-panel">
            <div class="panel-content">
              <div class="panel-header">
                <h2 class="panel-title">Processing Documents</h2>
                <p class="panel-subtitle">Please wait while we process your files</p>
              </div>
              
              <div class="processing-view">
                <div class="processing-stats">
                  <div class="stat-card">
                    <div class="stat-value">{{ processedFiles }}</div>
                    <div class="stat-label">Files Processed</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-value">{{ totalChunks }}</div>
                    <div class="stat-label">Chunks Created</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-value">{{ Math.round(processingProgress) }}%</div>
                    <div class="stat-label">Complete</div>
                  </div>
                </div>
                
                <div class="progress-bar-large">
                  <div class="progress-fill" :style="{ width: processingProgress + '%' }"></div>
                </div>
                
                <div class="processing-list">
                  <div v-for="file in processingFiles" :key="file.name" class="processing-item">
                    <i :class="getProcessingIcon(file.status)"></i>
                    <span class="file-name">{{ file.name }}</span>
                    <span class="status" :class="file.status">{{ file.status }}</span>
                  </div>
                </div>
              </div>
              
              <div class="panel-actions">
                <button 
                  v-if="processingComplete" 
                  @click="nextStep" 
                  class="action-button primary">
                  Review Results
                  <i class="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Step 4: Review -->
          <div v-show="currentStep === 4" key="step4" class="step-panel">
            <div class="panel-content">
              <div class="panel-header">
                <h2 class="panel-title">Review Chunks</h2>
                <p class="panel-subtitle">Review and edit your processed chunks</p>
              </div>
              
              <div class="review-container">
                <div class="review-sidebar">
                  <h3>Chunks ({{ chunks.length }})</h3>
                  <div class="chunk-list">
                    <div 
                      v-for="(chunk, index) in chunks" 
                      :key="chunk.id"
                      class="chunk-item"
                      :class="{ active: selectedChunk === index }"
                      @click="selectChunk(index)">
                      <span class="chunk-number">Chunk {{ index + 1 }}</span>
                      <span class="chunk-words">{{ chunk.wordCount }} words</span>
                    </div>
                  </div>
                </div>
                
                <div class="review-content">
                  <div v-if="selectedChunk !== null" class="chunk-preview">
                    <div class="chunk-header">
                      <h3>Chunk {{ selectedChunk + 1 }}</h3>
                      <div class="chunk-actions">
                        <button class="icon-button" title="Edit">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button class="icon-button" title="Delete">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    <div class="chunk-text">
                      {{ chunks[selectedChunk].content }}
                    </div>
                    <div class="chunk-meta">
                      <span><i class="fas fa-file"></i> {{ chunks[selectedChunk].source }}</span>
                      <span><i class="fas fa-font"></i> {{ chunks[selectedChunk].wordCount }} words</span>
                      <span><i class="fas fa-text-width"></i> {{ chunks[selectedChunk].charCount }} characters</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="panel-actions">
                <button @click="previousStep" class="action-button secondary">
                  <i class="fas fa-arrow-left"></i>
                  Back
                </button>
                <button @click="nextStep" class="action-button primary">
                  Export Options
                  <i class="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Step 5: Export -->
          <div v-show="currentStep === 5" key="step5" class="step-panel">
            <div class="panel-content">
              <div class="panel-header">
                <h2 class="panel-title">Export Knowledge Base</h2>
                <p class="panel-subtitle">Choose your export format</p>
              </div>
              
              <div class="export-options">
                <div class="export-grid">
                  <div 
                    v-for="format in exportFormats" 
                    :key="format.id"
                    class="export-card"
                    :class="{ selected: selectedFormat === format.id }"
                    @click="selectedFormat = format.id">
                    <i :class="format.icon"></i>
                    <h3>{{ format.name }}</h3>
                    <p>{{ format.description }}</p>
                  </div>
                </div>
                
                <div class="export-summary">
                  <h3>Export Summary</h3>
                  <div class="summary-stats">
                    <div class="summary-item">
                      <span>Total Chunks:</span>
                      <strong>{{ chunks.length }}</strong>
                    </div>
                    <div class="summary-item">
                      <span>Total Words:</span>
                      <strong>{{ totalWords }}</strong>
                    </div>
                    <div class="summary-item">
                      <span>Format:</span>
                      <strong>{{ getFormatName(selectedFormat) }}</strong>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="panel-actions">
                <button @click="previousStep" class="action-button secondary">
                  <i class="fas fa-arrow-left"></i>
                  Back
                </button>
                <button @click="exportChunks" class="action-button primary success">
                  <i class="fas fa-download"></i>
                  Download Export
                </button>
                <button @click="resetProcessor" class="action-button tertiary">
                  <i class="fas fa-redo"></i>
                  Start Over
                </button>
              </div>
            </div>
          </div>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useProcessingStore } from '@/stores/processing';
import { useChunksStore } from '@/stores/chunks';
import { useExportStore } from '@/stores/export';

export default {
  name: 'DocumentProcessorDesktop',
  setup() {
    const processingStore = useProcessingStore();
    const chunksStore = useChunksStore();
    const exportStore = useExportStore();

    const currentStep = ref(1);
    const dragActive = ref(false);
    const uploadedFiles = ref([]);
    const chunkingMethod = ref('words');
    const chunkSize = ref(500);
    const overlapPercentage = ref(20);
    const processingProgress = ref(0);
    const processingComplete = ref(false);
    const processedFiles = ref(0);
    const totalChunks = ref(0);
    const processingFiles = ref([]);
    const chunks = ref([]);
    const selectedChunk = ref(null);
    const selectedFormat = ref('json');
    
    const steps = [
      { label: 'Upload', icon: 'fas fa-upload' },
      { label: 'Configure', icon: 'fas fa-cog' },
      { label: 'Process', icon: 'fas fa-spinner' },
      { label: 'Review', icon: 'fas fa-eye' },
      { label: 'Export', icon: 'fas fa-download' }
    ];

    const exportFormats = [
      { id: 'json', name: 'JSON', icon: 'fas fa-code', description: 'Universal format for AI/ML' },
      { id: 'csv', name: 'CSV', icon: 'fas fa-table', description: 'Spreadsheet compatible' },
      { id: 'azure', name: 'Azure Vector', icon: 'fas fa-cloud', description: 'Azure Cognitive Search' },
      { id: 'openai', name: 'OpenAI', icon: 'fas fa-robot', description: 'OpenAI fine-tuning format' }
    ];

    const goToStep = (step) => {
      if (step <= currentStep.value || step === currentStep.value + 1) {
        currentStep.value = step;
      }
    };

    const nextStep = () => {
      if (currentStep.value < 5) {
        currentStep.value++;
      }
    };

    const previousStep = () => {
      if (currentStep.value > 1) {
        currentStep.value--;
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      dragActive.value = false;
      const files = Array.from(e.dataTransfer.files);
      uploadedFiles.value = [...uploadedFiles.value, ...files];
    };

    const handleFileUpload = (e) => {
      const files = Array.from(e.target.files);
      uploadedFiles.value = [...uploadedFiles.value, ...files];
    };

    const removeFile = (file) => {
      uploadedFiles.value = uploadedFiles.value.filter(f => f !== file);
    };

    const getFileIcon = (filename) => {
      const ext = filename.split('.').pop().toLowerCase();
      if (ext === 'pdf') return 'fas fa-file-pdf text-red-500';
      if (['md', 'markdown'].includes(ext)) return 'fas fa-file-alt text-sage';
      if (ext === 'docx') return 'fas fa-file-word text-blue-500';
      return 'fas fa-file text-gray-500';
    };

    const formatFileSize = (bytes) => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const startProcessing = async () => {
      currentStep.value = 3;
      processingComplete.value = false;
      
      // Simulate processing
      for (let i = 0; i < uploadedFiles.value.length; i++) {
        processingFiles.value.push({
          name: uploadedFiles.value[i].name,
          status: 'processing'
        });
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        processingFiles.value[i].status = 'completed';
        processedFiles.value++;
        processingProgress.value = ((i + 1) / uploadedFiles.value.length) * 100;
        totalChunks.value += Math.floor(Math.random() * 10) + 5;
      }
      
      processingComplete.value = true;
      
      // Generate dummy chunks for demo
      chunks.value = Array.from({ length: totalChunks.value }, (_, i) => ({
        id: `chunk-${i}`,
        content: `This is chunk ${i + 1} content...`,
        wordCount: Math.floor(Math.random() * 200) + 300,
        charCount: Math.floor(Math.random() * 1000) + 1500,
        source: uploadedFiles.value[Math.floor(Math.random() * uploadedFiles.value.length)]?.name || 'document.pdf'
      }));
    };

    const selectChunk = (index) => {
      selectedChunk.value = index;
    };

    const getProcessingIcon = (status) => {
      if (status === 'processing') return 'fas fa-spinner fa-spin text-sage';
      if (status === 'completed') return 'fas fa-check-circle text-green-500';
      if (status === 'error') return 'fas fa-exclamation-circle text-red-500';
      return 'fas fa-clock text-gray-500';
    };

    const totalWords = computed(() => {
      return chunks.value.reduce((sum, chunk) => sum + chunk.wordCount, 0);
    });

    const getFormatName = (formatId) => {
      return exportFormats.find(f => f.id === formatId)?.name || 'JSON';
    };

    const exportChunks = () => {
      // Implement export logic
      console.log('Exporting chunks in format:', selectedFormat.value);
    };

    const resetProcessor = () => {
      currentStep.value = 1;
      uploadedFiles.value = [];
      chunks.value = [];
      processingFiles.value = [];
      processedFiles.value = 0;
      totalChunks.value = 0;
      processingProgress.value = 0;
      processingComplete.value = false;
      selectedChunk.value = null;
    };

    return {
      currentStep,
      steps,
      dragActive,
      uploadedFiles,
      chunkingMethod,
      chunkSize,
      overlapPercentage,
      processingProgress,
      processingComplete,
      processedFiles,
      totalChunks,
      processingFiles,
      chunks,
      selectedChunk,
      selectedFormat,
      exportFormats,
      goToStep,
      nextStep,
      previousStep,
      handleDrop,
      handleFileUpload,
      removeFile,
      getFileIcon,
      formatFileSize,
      startProcessing,
      selectChunk,
      getProcessingIcon,
      totalWords,
      getFormatName,
      exportChunks,
      resetProcessor
    };
  }
};
</script>

<style scoped>
/* Desktop Document Processor Styles */
.desktop-document-processor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f8fafb 0%, #f5f7f4 100%);
  overflow: hidden;
}

/* Fixed Header */
.desktop-processor-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(168, 183, 157, 0.2);
  padding: 1.5rem 2rem;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
}

.title-section {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.title-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #A8B79D 0%, #8CA085 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
}

.section-icon {
  width: 24px;
  height: 24px;
  color: white;
}

.desktop-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.desktop-subtitle {
  color: #64748b;
  margin: 0;
  font-size: 0.95rem;
}

/* Progress Bar */
.desktop-progress-bar {
  display: flex;
  align-items: center;
  gap: 2rem;
  position: relative;
}

.progress-step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

.progress-step::after {
  content: '';
  position: absolute;
  right: -2rem;
  top: 50%;
  transform: translateY(-50%);
  width: 2rem;
  height: 2px;
  background: #e5e7eb;
  z-index: -1;
}

.progress-step:last-child::after {
  display: none;
}

.progress-step.completed::after {
  background: #A8B79D;
}

.step-indicator {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  color: #9ca3af;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.progress-step.active .step-indicator {
  background: #A8B79D;
  color: white;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(168, 183, 157, 0.3);
}

.progress-step.completed .step-indicator {
  background: #8CA085;
  color: white;
}

.step-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.progress-step.active .step-label {
  color: #A8B79D;
  font-weight: 600;
}

.progress-step.completed .step-label {
  color: #8CA085;
}

/* Main Body */
.desktop-processor-body {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.step-panels-container {
  height: 100%;
  position: relative;
  overflow: hidden;
}

.step-panels {
  height: 100%;
  position: relative;
}

/* Step Panel */
.step-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.panel-content {
  width: 100%;
  max-width: 1200px;
  height: 100%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
}

.panel-header {
  margin-bottom: 2rem;
  text-align: center;
}

.panel-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.panel-subtitle {
  color: #64748b;
  font-size: 1rem;
}

/* Upload Area */
.upload-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.drop-zone {
  background: rgba(255, 255, 255, 0.9);
  border: 2px dashed rgba(168, 183, 157, 0.4);
  border-radius: 16px;
  padding: 3rem;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.drop-zone.drag-active {
  border-color: #A8B79D;
  background: rgba(168, 183, 157, 0.05);
  transform: scale(1.02);
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  font-size: 4rem;
  color: #A8B79D;
}

.browse-button {
  background: #A8B79D;
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.browse-button:hover {
  background: #8CA085;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(168, 183, 157, 0.3);
}

/* File List */
.file-list {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.file-list-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1a1a1a;
}

.file-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8fafb;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.file-item:hover {
  background: #f3f4f6;
}

.file-name {
  flex: 1;
  font-weight: 500;
  color: #374151;
}

.file-size {
  color: #9ca3af;
  font-size: 0.875rem;
}

.remove-file {
  background: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0.25rem;
  transition: all 0.2s ease;
}

.remove-file:hover {
  transform: scale(1.1);
}

/* Config Grid */
.config-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.config-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.config-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1a1a1a;
}

.config-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.option-card {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-card.selected {
  border-color: #A8B79D;
  background: rgba(168, 183, 157, 0.05);
}

.option-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.option-content i {
  font-size: 1.5rem;
  color: #A8B79D;
}

.option-content span {
  font-weight: 600;
  color: #374151;
}

.option-content small {
  display: block;
  color: #9ca3af;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

/* Slider Controls */
.slider-control {
  margin-bottom: 1.5rem;
}

.chunk-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;
  -webkit-appearance: none;
}

.chunk-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #A8B79D;
  cursor: pointer;
  transition: all 0.3s ease;
}

.chunk-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 2px 8px rgba(168, 183, 157, 0.4);
}

.slider-value {
  text-align: center;
  margin-top: 0.5rem;
  font-weight: 600;
  color: #374151;
}

/* Processing View */
.processing-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.processing-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #A8B79D;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #64748b;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.progress-bar-large {
  height: 24px;
  background: #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #A8B79D 0%, #8CA085 100%);
  transition: width 0.5s ease;
  border-radius: 12px;
}

.processing-list {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.processing-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
}

.processing-item:last-child {
  border-bottom: none;
}

.status {
  margin-left: auto;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status.processing {
  color: #A8B79D;
}

.status.completed {
  color: #10b981;
}

.status.error {
  color: #ef4444;
}

/* Review Container */
.review-container {
  flex: 1;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1.5rem;
  height: 100%;
  overflow: hidden;
}

.review-sidebar {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.review-sidebar h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1a1a1a;
}

.chunk-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chunk-item {
  padding: 0.75rem;
  background: #f8fafb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chunk-item.active {
  background: #A8B79D;
  color: white;
}

.chunk-item:hover:not(.active) {
  background: #f3f4f6;
}

.chunk-number {
  font-weight: 500;
}

.chunk-words {
  font-size: 0.75rem;
  opacity: 0.8;
}

.review-content {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chunk-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chunk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;
}

.chunk-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
}

.chunk-actions {
  display: flex;
  gap: 0.5rem;
}

.icon-button {
  background: transparent;
  border: 1px solid #e5e7eb;
  color: #64748b;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.chunk-text {
  flex: 1;
  padding: 1rem;
  background: #f8fafb;
  border-radius: 8px;
  line-height: 1.6;
  color: #374151;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.chunk-meta {
  display: flex;
  gap: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
  font-size: 0.875rem;
  color: #64748b;
}

.chunk-meta span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Export Options */
.export-options {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.export-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.export-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.export-card.selected {
  border-color: #A8B79D;
  background: rgba(168, 183, 157, 0.05);
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(168, 183, 157, 0.2);
}

.export-card i {
  font-size: 2.5rem;
  color: #A8B79D;
  margin-bottom: 1rem;
}

.export-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1a1a1a;
}

.export-card p {
  font-size: 0.875rem;
  color: #64748b;
}

.export-summary {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.export-summary h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1a1a1a;
}

.summary-stats {
  display: flex;
  gap: 2rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.summary-item span {
  font-size: 0.875rem;
  color: #64748b;
}

.summary-item strong {
  font-size: 1.25rem;
  color: #A8B79D;
}

/* Panel Actions */
.panel-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
  margin-top: auto;
}

.action-button {
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.action-button.primary {
  background: #A8B79D;
  color: white;
}

.action-button.primary:hover {
  background: #8CA085;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(168, 183, 157, 0.3);
}

.action-button.primary:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  transform: none;
}

.action-button.secondary {
  background: transparent;
  color: #64748b;
  border: 2px solid #e5e7eb;
}

.action-button.secondary:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.action-button.success {
  background: #D4AF37;
  color: white;
}

.action-button.success:hover {
  background: #B8941F;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.action-button.tertiary {
  background: #f3f4f6;
  color: #374151;
}

.action-button.tertiary:hover {
  background: #e5e7eb;
}

/* Slide Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* Hide scrollbars for cleaner look */
.review-sidebar::-webkit-scrollbar,
.review-content::-webkit-scrollbar,
.chunk-text::-webkit-scrollbar {
  width: 6px;
}

.review-sidebar::-webkit-scrollbar-track,
.review-content::-webkit-scrollbar-track,
.chunk-text::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.review-sidebar::-webkit-scrollbar-thumb,
.review-content::-webkit-scrollbar-thumb,
.chunk-text::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.review-sidebar::-webkit-scrollbar-thumb:hover,
.review-content::-webkit-scrollbar-thumb:hover,
.chunk-text::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.hidden {
  display: none;
}
</style>