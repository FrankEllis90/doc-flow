<template>
  <div class="settings-page">
    <!-- Header -->
    <div class="settings-header">
      <h1 class="page-title">Settings</h1>
      <p class="page-subtitle">Configure your Doc Layer preferences and defaults</p>
    </div>

    <!-- Settings Content -->
    <div class="settings-content">
      
      <!-- Processing Preferences -->
      <SettingsCard 
        title="Processing Preferences"
        description="Default settings for document processing and chunking"
        icon="fas fa-cog"
      >
        <div class="settings-grid">
          <div class="setting-item">
            <div class="setting-label">
              <label>Default Chunk Size</label>
              <HelpTooltip
                content="Chunk size determines how many words are grouped together for AI processing. Smaller chunks provide more granular search results, while larger chunks preserve more context. 500 words is optimal for most language models."
                title="Chunk Size Explained"
                position="bottom"
                theme="brand"
                :show-learn-more="true"
                learn-more-url="https://docs.openai.com/guides/text-generation/best-practices"
              />
            </div>
            <DropdownSelect
              v-model="settings.defaultChunkSize"
              :options="chunkSizeOptions"
            />
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              <label>Default Overlap</label>
              <HelpTooltip
                content="Overlap ensures important information isn't split between chunks. When content is divided, overlapping text preserves context and improves AI understanding of relationships between concepts."
                title="Why Overlap Matters"
                position="bottom"
                theme="brand"
              />
            </div>
            <DropdownSelect
              v-model="settings.defaultOverlap"
              :options="overlapOptions"
            />
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              <label>Auto-generate Tags</label>
              <HelpTooltip
                content="Automatically extracts relevant keywords and topics from your content using frequency analysis and semantic understanding. These tags improve searchability and organization in vector databases."
                title="Auto-tagging System"
                position="bottom"
                theme="brand"
              />
            </div>
            <ToggleSwitch
              v-model="settings.autoGenerateTags"
            />
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              <label>Quality Analysis</label>
              <HelpTooltip
                content="Analyzes text readability, coherence, and suitability for AI training. Uses metrics like Flesch-Kincaid score, information density, and semantic consistency to ensure high-quality data preparation."
                title="Quality Metrics"
                position="bottom"
                theme="brand"
                :show-learn-more="true"
                learn-more-url="https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests"
              />
            </div>
            <ToggleSwitch
              v-model="settings.enableQualityAnalysis"
            />
          </div>
        </div>
      </SettingsCard>

      <!-- Export Defaults -->
      <SettingsCard 
        title="Export Defaults"
        description="Default formats and settings for data export"
        icon="fas fa-download"
      >
        <div class="settings-grid">
          <div class="setting-item">
            <div class="setting-label">
              <label>Preferred Export Format</label>
              <HelpTooltip
                content="Different AI platforms use specific data formats. Azure Vector Store uses JSON with metadata, while OpenAI fine-tuning requires JSONL format. Choose based on your target platform for optimal compatibility."
                title="Export Format Guide"
                position="bottom"
                theme="brand"
              />
            </div>
            <DropdownSelect
              v-model="settings.defaultExportFormat"
              :options="exportFormatOptions"
            />
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              <label>Include Metadata</label>
              <HelpTooltip
                content="Metadata includes source document names, chunk IDs, creation timestamps, and processing statistics. This information helps track data lineage and improves retrieval accuracy in vector databases."
                title="Metadata Benefits"
                position="bottom"
                theme="brand"
              />
            </div>
            <ToggleSwitch
              v-model="settings.includeMetadata"
            />
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              <label>Auto-save Versions</label>
              <HelpTooltip
                content="Creates automatic snapshots of your work before each export. This allows you to restore previous versions and maintain a complete audit trail of your document processing workflow."
                title="Version Control"
                position="bottom"
                theme="brand"
              />
            </div>
            <ToggleSwitch
              v-model="settings.autoSaveVersions"
            />
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              <label>Generate Upload Scripts</label>
              <HelpTooltip
                content="Automatically creates platform-specific code snippets for uploading your data. Includes Python scripts for OpenAI, REST API calls for Pinecone, and SDK examples for other platforms."
                title="Upload Automation"
                position="bottom"
                theme="brand"
              />
            </div>
            <ToggleSwitch
              v-model="settings.generateUploadScripts"
            />
          </div>
        </div>
      </SettingsCard>

      <!-- User Interface -->
      <SettingsCard 
        title="User Interface"
        description="Customize the appearance and behavior of the application"
        icon="fas fa-desktop"
      >
        <div class="settings-grid">
          <DropdownSelect
            v-model="settings.sidebarDefaultState"
            label="Sidebar Default State"
            description="How the sidebar appears when the app loads"
            :options="sidebarStateOptions"
          />
          
          <ToggleSwitch
            v-model="settings.showTooltips"
            label="Show Tooltips"
            description="Display helpful text on hover interactions"
          />
          
          <ToggleSwitch
            v-model="settings.enableAnimations"
            label="Enable Animations"
            description="Smooth transitions and visual effects"
          />
          
          <ToggleSwitch
            v-model="settings.autoFocusInput"
            label="Auto-focus Input"
            description="Automatically focus content input on page load"
          />
        </div>
      </SettingsCard>

      <!-- Performance -->
      <SettingsCard 
        title="Performance"
        description="Optimize performance for your hardware and usage"
        icon="fas fa-tachometer-alt"
      >
        <div class="settings-grid">
          <div class="setting-item">
            <div class="setting-label">
              <label>Max Concurrent Files</label>
              <HelpTooltip
                content="Controls how many files are processed simultaneously. Higher values increase speed but use more CPU and memory. Lower values are safer for older computers or when running other applications."
                title="Parallel Processing"
                position="bottom"
                theme="brand"
              />
            </div>
            <DropdownSelect
              v-model="settings.maxConcurrentFiles"
              :options="concurrentFilesOptions"
            />
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              <label>Memory Usage Limit</label>
              <HelpTooltip
                content="Sets the maximum RAM that Doc Layer can use for processing. This prevents browser crashes when handling large files. Modern computers can typically handle 200-500MB safely."
                title="Memory Management"
                position="bottom"
                theme="brand"
              />
            </div>
            <DropdownSelect
              v-model="settings.memoryLimit"
              :options="memoryLimitOptions"
            />
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              <label>Auto-cleanup</label>
              <HelpTooltip
                content="Automatically removes temporary files, cached data, and processing artifacts after operations complete. Helps maintain optimal performance and saves disk space."
                title="Automatic Cleanup"
                position="bottom"
                theme="brand"
              />
            </div>
            <ToggleSwitch
              v-model="settings.autoCleanup"
            />
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              <label>Virtual Scrolling</label>
              <HelpTooltip
                content="Renders only visible items in long lists, dramatically improving performance when viewing thousands of chunks or documents. Essential for handling large datasets efficiently."
                title="Virtual Scrolling Benefits"
                position="bottom"
                theme="brand"
              />
            </div>
            <ToggleSwitch
              v-model="settings.virtualScrolling"
            />
          </div>
        </div>
      </SettingsCard>

      <!-- Data Management -->
      <SettingsCard 
        title="Data Management"
        description="Control data storage and privacy settings"
        icon="fas fa-database"
      >
        <div class="settings-grid">
          <DropdownSelect
            v-model="settings.storageLocation"
            label="Storage Location"
            description="Where your application data is stored locally"
            :options="storageLocationOptions"
          />
          
          <DropdownSelect
            v-model="settings.versionHistoryLimit"
            label="Version History Limit"
            description="Maximum number of saved versions to keep"
            :options="versionHistoryOptions"
          />
          
          <ToggleSwitch
            v-model="settings.autoBackup"
            label="Auto-backup"
            description="Automatically create regular backups of your data"
          />
          
          <ToggleSwitch
            v-model="settings.clearDataOnExit"
            label="Clear Data on Exit"
            description="Automatically clear all data when closing the application"
          />
        </div>
      </SettingsCard>

      <!-- Action Buttons -->
      <div class="settings-actions">
        <button @click="resetToDefaults" class="btn btn-outline">
          <i class="fas fa-undo"></i>
          Reset to Defaults
        </button>
        <button @click="exportSettings" class="btn btn-outline">
          <i class="fas fa-download"></i>
          Export Settings
        </button>
        <button @click="importSettings" class="btn btn-outline">
          <i class="fas fa-upload"></i>
          Import Settings
        </button>
        <button @click="saveSettings" class="btn btn-primary">
          <i class="fas fa-save"></i>
          Save Changes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import SettingsCard from '@/components/ui/SettingsCard.vue'
import HelpTooltip from '@/components/ui/HelpTooltip.vue'
import { DropdownSelect, ToggleSwitch } from '@/components/forms'

// Default settings
const defaultSettings = {
  // Processing
  defaultChunkSize: 500,
  defaultOverlap: 50,
  autoGenerateTags: true,
  enableQualityAnalysis: true,
  
  // Export
  defaultExportFormat: 'azure-vector',
  includeMetadata: true,
  autoSaveVersions: true,
  generateUploadScripts: true,
  
  // UI
  sidebarDefaultState: 'expanded',
  showTooltips: true,
  enableAnimations: true,
  autoFocusInput: true,
  
  // Performance
  maxConcurrentFiles: 10,
  memoryLimit: 200,
  autoCleanup: true,
  virtualScrolling: true,
  
  // Data
  storageLocation: 'browser',
  autoBackup: true,
  versionHistoryLimit: 25,
  clearDataOnExit: false
}

const settings = reactive({ ...defaultSettings })

// Dropdown options
const chunkSizeOptions = [
  { value: 300, label: 'Small (300 words)', description: 'Best for detailed analysis' },
  { value: 500, label: 'Medium (500 words)', description: 'Recommended for most use cases' },
  { value: 800, label: 'Large (800 words)', description: 'Best for comprehensive context' },
  { value: 'custom', label: 'Custom', description: 'Define your own chunk size' }
]

const overlapOptions = [
  { value: 25, label: 'Low (25 words)', description: 'Minimal overlap' },
  { value: 50, label: 'Medium (50 words)', description: 'Balanced approach' },
  { value: 100, label: 'High (100 words)', description: 'Maximum context preservation' }
]

const exportFormatOptions = [
  { value: 'azure-vector', label: 'Azure Vector Store (JSON)', description: 'Optimized for Azure OpenAI' },
  { value: 'openai', label: 'OpenAI Fine-tuning (JSONL)', description: 'For custom model training' },
  { value: 'pinecone', label: 'Pinecone (JSON)', description: 'Vector database format' },
  { value: 'chromadb', label: 'ChromaDB (JSON)', description: 'Open-source vector store' },
  { value: 'csv', label: 'CSV', description: 'Universal spreadsheet format' }
]

const sidebarStateOptions = [
  { value: 'expanded', label: 'Expanded', description: 'Always show full sidebar' },
  { value: 'collapsed', label: 'Collapsed', description: 'Show icons only' },
  { value: 'remember', label: 'Remember Last State', description: 'Restore previous state' }
]

const concurrentFilesOptions = [
  { value: 5, label: 'Conservative (5 files)', description: 'Lower CPU usage' },
  { value: 10, label: 'Balanced (10 files)', description: 'Recommended setting' },
  { value: 20, label: 'Aggressive (20 files)', description: 'Maximum performance' }
]

const memoryLimitOptions = [
  { value: 100, label: 'Low (100 MB)', description: 'Minimal memory usage' },
  { value: 200, label: 'Medium (200 MB)', description: 'Balanced performance' },
  { value: 500, label: 'High (500 MB)', description: 'Maximum processing capacity' }
]

const storageLocationOptions = [
  { value: 'browser', label: 'Browser (IndexedDB)', description: 'Persistent browser storage' },
  { value: 'local', label: 'Local Storage', description: 'Simple browser storage' }
]

const versionHistoryOptions = [
  { value: 10, label: '10 versions', description: 'Minimal history' },
  { value: 25, label: '25 versions', description: 'Balanced storage' },
  { value: 50, label: '50 versions', description: 'Extended history' },
  { value: 'unlimited', label: 'Unlimited', description: 'Keep all versions' }
]

const saveSettings = () => {
  // Save settings to local storage
  localStorage.setItem('docLayerSettings', JSON.stringify(settings))
  
  // Show success message
  console.log('Settings saved successfully')
}

const resetToDefaults = () => {
  if (confirm('Are you sure you want to reset all settings to defaults?')) {
    Object.assign(settings, defaultSettings)
  }
}

const exportSettings = () => {
  const settingsJson = JSON.stringify(settings, null, 2)
  const blob = new Blob([settingsJson], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = 'doc-layer-settings.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const importSettings = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  
  input.onchange = (event: any) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e: any) => {
        try {
          const importedSettings = JSON.parse(e.target.result)
          Object.assign(settings, importedSettings)
          console.log('Settings imported successfully')
        } catch (error) {
          alert('Invalid settings file')
        }
      }
      reader.readAsText(file)
    }
  }
  
  input.click()
}

// Load settings on mount
onMounted(() => {
  const saved = localStorage.getItem('docLayerSettings')
  if (saved) {
    try {
      const parsedSettings = JSON.parse(saved)
      Object.assign(settings, parsedSettings)
    } catch (error) {
      console.warn('Failed to load saved settings')
    }
  }
})
</script>

<style scoped>
.settings-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.settings-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 36px;
  font-weight: 600;
  color: var(--text-primary, #1F2937);
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 18px;
  color: var(--text-secondary, #6B7280);
  margin: 0;
  line-height: 1.5;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.setting-label label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #1F2937);
  line-height: 1.4;
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color, #E5E7EB);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  border: 1px solid transparent;
}

.btn-outline {
  background: var(--surface-primary, #FFFFFF);
  color: var(--text-primary, #1F2937);
  border-color: var(--border-color, #E5E7EB);
}

.btn-outline:hover {
  background: var(--surface-secondary, #F9FAFB);
  border-color: var(--brand-sage, #A8B79D);
}

.btn-primary {
  background: linear-gradient(135deg, var(--brand-sage, #A8B79D) 0%, var(--brand-sage-dark, #8CA085) 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(168, 183, 157, 0.3);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(168, 183, 157, 0.4);
}

@media (max-width: 768px) {
  .settings-page {
    padding: 16px;
  }
  
  .page-title {
    font-size: 28px;
  }
  
  .page-subtitle {
    font-size: 16px;
  }
  
  
  .settings-actions {
    flex-direction: column;
  }
  
  .btn {
    justify-content: center;
  }
}
</style>