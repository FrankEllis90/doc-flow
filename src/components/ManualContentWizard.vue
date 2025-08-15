<template>
  <div class="manual-content-wizard min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50">
    <!-- Save Success Toast -->
    <transition name="toast">
      <div 
        v-if="showSaveSuccess" 
        class="fixed top-4 right-4 z-50 bg-success-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2"
      >
        <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        <span class="font-medium">Draft saved successfully!</span>
      </div>
    </transition>
    
    <!-- Draft Loaded Toast -->
    <transition name="toast">
      <div 
        v-if="draftLoaded" 
        class="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2"
        style="background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); color: white;"
      >
        <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clip-rule="evenodd" />
        </svg>
        <span class="font-medium">Previous draft restored</span>
      </div>
    </transition>
    
    <!-- Step Rail & Main Content -->
    <div class="flex">
      <!-- Left Step Rail -->
      <aside class="w-64 bg-white/90 backdrop-blur border-r border-neutral-200 sticky top-0 h-screen">
        <div class="p-5">
          <h1 class="text-lg font-semibold text-neutral-900 mb-5">Manual Content Builder</h1>
          
          <!-- Step Navigation -->
          <nav class="space-y-2" aria-label="Wizard steps">
            <div
              v-for="(step, index) in steps"
              :key="step.id"
              :class="[
                'flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer',
                currentStep === index ? 'bg-brand-sage/15 text-brand-sage-900 ring-1 ring-brand-sage/30' :
                isStepCompleted(index) ? 'text-neutral-700 hover:bg-neutral-50' :
                index < currentStep ? 'text-neutral-600 hover:bg-neutral-50' :
                'text-neutral-400 cursor-not-allowed'
              ]"
              @click="navigateToStep(index)"
              :aria-current="currentStep === index ? 'step' : undefined"
              role="button"
              :tabindex="currentStep === index || isStepCompleted(index) ? 0 : -1"
            >
              <!-- Step Icon/Number -->
              <div :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                currentStep === index ? 'bg-brand-sage-600 text-white' :
                isStepCompleted(index) ? 'bg-success-500 text-white' :
                index < currentStep ? 'bg-neutral-200 text-neutral-600' :
                'bg-neutral-100 text-neutral-400'
              ]">
                <svg v-if="isStepCompleted(index)" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span v-else>{{ index + 1 }}</span>
              </div>
              
              <!-- Step Info -->
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm truncate">{{ step.title }}</p>
                <p class="text-xs opacity-75 truncate">{{ step.subtitle }}</p>
              </div>
            </div>
          </nav>

          <!-- Progress Summary -->
          <div class="mt-6 p-4 bg-neutral-50 rounded-xl">
            <h3 class="text-sm font-medium text-neutral-900 mb-2">Progress</h3>
            <div class="flex items-center gap-2">
              <div class="flex-1 bg-neutral-200 rounded-full h-2">
                <div 
                  class="bg-brand-sage-500 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${progressPercentage}%` }"
                ></div>
              </div>
              <span class="text-xs text-neutral-600 font-medium">{{ completedSteps }}/{{ steps.length }}</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 max-w-none flex flex-col">
        <div class="flex-1 overflow-y-auto">
          <!-- Step Header -->
          <header class="px-6 pt-6 pb-4 border-b border-neutral-100">
            <div class="flex items-center gap-4 mb-2">
              <h2 class="text-2xl font-semibold text-neutral-900">{{ currentStepData.title }}</h2>
              <div v-if="currentStepData.optional" class="badge bg-neutral-100 text-neutral-600">Optional</div>
            </div>
            <p class="text-neutral-600">{{ currentStepData.description }}</p>
          </header>

          <!-- Grid Layout: Main Content (9/12) + Right Panel (3/12) - Tighter Gap -->
          <div class="grid grid-cols-12 gap-5 p-6">
            <!-- Main Content Column -->
            <div class="col-span-9">
              <!-- Dynamic Step Component -->
              <component 
                v-if="currentStepComponent"
                :is="currentStepComponent" 
                :data="wizardData"
                :validation="currentStepValidation"
                @validate="handleStepValidation"
                @update:data="handleDataUpdate"
                @next="nextStep"
                @back="previousStep"
              />
              <!-- Fallback for unimplemented steps -->
              <div v-else class="flex items-center justify-center h-64 bg-neutral-50 rounded-xl">
                <div class="text-center">
                  <svg class="w-12 h-12 text-neutral-400 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                  <h3 class="text-lg font-medium text-neutral-900 mb-2">{{ currentStepData.title }}</h3>
                  <p class="text-neutral-600">This step is coming soon!</p>
                </div>
              </div>
            </div>

            <!-- Right Panel - Closer to main content -->
            <aside class="col-span-3">
              <div class="sticky top-8 space-y-4">
                <!-- Pro Tips -->
                <div class="bg-white rounded-xl p-4 border border-neutral-200 shadow-sm">
                  <h3 class="text-base font-medium text-neutral-900 mb-3 flex items-center gap-2">
                    <span class="text-lg">💡</span>
                    Pro Tips
                  </h3>
                  <div class="space-y-3">
                    <div v-for="tip in currentStepData.tips" :key="tip.title" class="tip-card">
                      <div class="flex items-start gap-2">
                        <span class="text-sm mt-0.5">{{ tip.icon }}</span>
                        <div>
                          <h4 class="font-medium text-sm text-neutral-900 mb-1">{{ tip.title }}</h4>
                          <p class="text-xs text-neutral-600 leading-relaxed">{{ tip.content }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Quality Checklist (dynamic based on step) -->
                <div v-if="currentStepData.checklist" class="bg-white rounded-xl p-4 border border-neutral-200 shadow-sm">
                  <h3 class="text-base font-medium text-neutral-900 mb-3">Quality Checklist</h3>
                  <div class="space-y-2">
                    <div 
                      v-for="item in dynamicChecklist" 
                      :key="item.id"
                      class="flex items-center gap-3"
                    >
                      <div :class="[
                        'w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200',
                        item.completed ? 'bg-success-500 text-white scale-110 shadow-sm' : 'bg-neutral-200'
                      ]">
                        <svg v-if="item.completed" class="w-2.5 h-2.5 animate-fade-in" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                      </div>
                      <span :class="[
                        'text-xs transition-colors',
                        item.completed ? 'text-neutral-900 font-medium' : 'text-neutral-500'
                      ]">{{ item.text }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <!-- Sticky Footer -->
        <footer class="sticky bottom-0 bg-white/98 backdrop-blur border-t border-neutral-200 px-6 py-4 shadow-lg z-10">
          <div class="flex items-center justify-between">
            <!-- Left: Progress & Autosave -->
            <div class="flex items-center gap-6">
              <div class="flex items-center gap-2 text-sm text-neutral-500">
                <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span>{{ lastSaved ? 'Saved ' + formatTimeAgo(lastSaved) : 'Not saved' }}</span>
              </div>
              <div class="text-sm font-medium text-neutral-600">
                Step {{ currentStep + 1 }} of {{ steps.length }}
              </div>
            </div>

            <!-- Right: Navigation Actions -->
            <div class="flex items-center gap-3">
              <!-- Back Button -->
              <button 
                v-if="currentStep > 0"
                @click="previousStep"
                class="btn btn-ghost"
              >
                <svg class="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                Back
              </button>
              
              <!-- Skip Button -->
              <button 
                v-if="currentStepData.canSkip"
                @click="skipStep"
                class="btn btn-ghost text-neutral-500"
              >
                Skip
              </button>

              <!-- Save Draft Button -->
              <button 
                @click="saveDraft"
                class="btn btn-ghost"
                :disabled="!canSaveDraft"
                :title="canSaveDraft ? 'Save your current progress' : 'Add some content to save'"
              >
                <svg v-if="showSaveSuccess" class="w-4 h-4 mr-2 text-success-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <svg v-else class="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM2 7a2 2 0 012-2h12a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V7zm2 0v7h12V7H4z" />
                </svg>
                Save Draft
              </button>

              <!-- Primary Next Button -->
              <button 
                @click="nextStep"
                class="btn btn-primary-green"
                :disabled="!canProceed"
              >
                {{ currentStepData.primaryAction }}
                <svg class="w-4 h-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useContentStore } from '@/stores/content'
import { useAppStore } from '@/stores/app'
import { useVersionStore } from '@/stores/versions'
import SourceStep from './steps/SourceStep.vue'
import ConfigureStep from './steps/ConfigureStep.vue'
import ProcessStep from './steps/ProcessStep.vue'
import ReviewStep from './steps/ReviewStep.vue'
import InsightsStep from './steps/InsightsStep.vue'
import ExportStep from './steps/ExportStep.vue'

// Wizard State
const currentStep = ref(0)
const showSaveSuccess = ref(false)
const draftLoaded = ref(false)
const wizardData = ref({
  source: {
    title: '',
    content: '',
    file: null
  },
  configure: {
    chunkingMethod: 'word-based',
    chunkSize: 500,
    overlap: 15,
    autoTagging: true,
    advanced: {
      stopWords: [],
      sectionSelectors: [],
      semanticThreshold: 0.8
    }
  },
  processing: {
    status: 'idle', // idle, processing, completed, error
    chunks: [],
    stats: {
      created: 0,
      failed: 0,
      warnings: 0
    },
    logs: []
  },
  review: {
    chunks: [],
    filters: {
      search: '',
      tags: [],
      quality: 'all'
    }
  },
  insights: {
    scores: {},
    recommendations: []
  },
  export: {
    target: 'azure-vector-store',
    options: {
      includeMetadata: true,
      schemaVersion: 'v1',
      fileNaming: 'content-chunks'
    },
    preview: ''
  }
})

const stepValidation = ref({})
const lastSaved = ref<Date | null>(null)

// Step Definitions
const steps = [
  {
    id: 'source',
    title: 'Add Your Content Source',
    subtitle: 'Title, text, or file upload',
    component: 'SourceStep',
    description: 'Give your content a clear title, paste your text, or upload a file to start processing.',
    primaryAction: 'Continue',
    canSkip: false,
    optional: false,
    tips: [
      { icon: '📝', title: 'Good titles help', content: 'Clear, descriptive titles make it easier to find content later.' },
      { icon: '📏', title: 'Optimal length', content: 'Content between 300-2000 words works best for chunking.' },
      { icon: '📄', title: 'Multiple formats', content: 'Upload PDF, Markdown, or plain text files for processing.' }
    ],
    checklist: [
      { id: 'title', text: 'Title is present', completed: false },
      { id: 'content', text: 'Content is at least 200 characters', completed: false },
      { id: 'quality', text: 'No obvious formatting issues', completed: false }
    ]
  },
  {
    id: 'configure',
    title: 'Configure Processing',
    subtitle: 'Chunk & tagging settings',
    component: 'ConfigureStep',
    description: 'Choose how your content will be split and organized. The default settings work great for most content.',
    primaryAction: 'Process Content',
    canSkip: true,
    optional: true,
    tips: [
      { icon: '🎯', title: 'Start with defaults', content: 'The recommended settings (500 words, 15% overlap) work perfectly for most content. Only change if you have specific needs.' },
      { icon: '📖', title: 'Think like a reader', content: 'Smaller chunks (300-400 words) are great for quick answers. Larger chunks (600-800 words) preserve more context for complex topics.' },
      { icon: '🔗', title: 'Overlap is your friend', content: 'That 15% overlap ensures important ideas don\'t get cut in half when we split your content into sections.' }
    ]
  },
  {
    id: 'process',
    title: 'Process Content',
    subtitle: 'Generate sections',
    component: 'ProcessStep',
    description: 'Transform your content into searchable sections using your chosen settings.',
    primaryAction: 'Continue to Review',
    canSkip: false,
    optional: false,
    tips: [
      { icon: '🚀', title: 'One-click magic', content: 'Hit the "Start Processing" button and watch your content transform into perfectly sized sections.' },
      { icon: '👀', title: 'Live preview', content: 'See your sections being created in real-time with automatic quality checks.' },
      { icon: '🏷️', title: 'Smart tagging', content: 'If you enabled auto-tagging, we\'ll analyze your content and suggest relevant keywords for each section.' }
    ]
  },
  {
    id: 'review',
    title: 'Review & Edit',
    subtitle: 'Perfect your sections',
    component: 'ReviewStep',
    description: 'Review your generated sections, make edits, and use powerful bulk operations to fine-tune your content.',
    primaryAction: 'Continue to Insights',
    canSkip: true,
    optional: true,
    tips: [
      { icon: '⚡', title: 'Bulk superpowers', content: 'Select multiple sections to merge them, apply tags, or delete them all at once - massive time saver!' },
      { icon: '✨', title: 'Smart suggestions', content: 'Yellow warning chips show sections that need attention - click the suggestions to auto-fix common issues.' },
      { icon: '🔍', title: 'Find anything fast', content: 'Search through all your content, filter by quality issues, or sort by length to find exactly what you need.' }
    ]
  },
  {
    id: 'insights',
    title: 'Quality Insights',
    subtitle: 'Vector readiness scores',
    component: 'InsightsStep',
    description: 'Quality scores and compatibility analysis for your processed content.',
    primaryAction: 'Continue to Export',
    canSkip: false,
    optional: false,
    tips: [
      { icon: '📈', title: 'Vector readiness', content: 'Higher scores mean better performance in AI applications.' },
      { icon: '🎯', title: 'Platform compatibility', content: 'Green indicates optimal format for your target platform.' }
    ]
  },
  {
    id: 'export',
    title: 'Export & Deploy',
    subtitle: 'Download formats & scripts',
    component: 'ExportStep',
    description: 'Choose your target platform and export format. Get upload scripts for easy deployment.',
    primaryAction: 'Export Content',
    canSkip: false,
    optional: false,
    tips: [
      { icon: '🚀', title: 'Platform-specific', content: 'Each export format is optimized for your target AI platform.' },
      { icon: '📜', title: 'Upload scripts', content: 'Get ready-to-use code for uploading to your vector database.' },
      { icon: '💾', title: 'Version control', content: 'Exports are automatically saved to your version history.' }
    ]
  }
]

// Computed Properties
const currentStepData = computed(() => steps[currentStep.value])
const currentStepComponent = computed(() => {
  const componentName = currentStepData.value.component
  switch (componentName) {
    case 'SourceStep':
      return SourceStep
    case 'ConfigureStep':
      return ConfigureStep
    case 'ProcessStep':
      return ProcessStep
    case 'ReviewStep':
      return ReviewStep
    case 'InsightsStep':
      return InsightsStep
    case 'ExportStep':
      return ExportStep
    default:
      return null
  }
})
const currentStepValidation = computed(() => stepValidation.value[currentStepData.value.id] || {})

const completedSteps = computed(() => {
  return steps.filter((_, index) => isStepCompleted(index)).length
})

const progressPercentage = computed(() => {
  return (completedSteps.value / steps.length) * 100
})

const canProceed = computed(() => {
  const currentStepId = currentStepData.value.id
  
  // For source step, check the actual data directly
  if (currentStepId === 'source') {
    const title = wizardData.value.source?.title || ''
    const content = wizardData.value.source?.content || ''
    const file = wizardData.value.source?.file
    
    const hasValidTitle = title.trim().length >= 3
    const hasValidContent = content.length >= 200 || file !== null
    
    console.log('Validation check:', { 
      title: title, 
      titleLength: title.length,
      hasValidTitle,
      content: content.substring(0, 50) + '...',
      contentLength: content.length, 
      hasValidContent,
      canProceed: hasValidTitle && hasValidContent
    })
    
    return hasValidTitle && hasValidContent
  }
  
  // For configure step, always allow proceeding (has defaults)
  if (currentStepId === 'configure') {
    return true
  }
  
  // For process step, check if processing is completed
  if (currentStepId === 'process') {
    return wizardData.value.processing?.status === 'completed' && 
           wizardData.value.processing?.chunks?.length > 0
  }
  
  // For review step, always allow proceeding (review is optional)
  if (currentStepId === 'review') {
    return wizardData.value.review?.chunks?.length > 0 || 
           wizardData.value.processing?.chunks?.length > 0
  }
  
  // For insights step, allow proceeding once analysis is complete
  if (currentStepId === 'insights') {
    return wizardData.value.insights?.analyzed === true || 
           currentStepValidation.value.isValid === true
  }
  
  // Default validation for other steps
  const validation = currentStepValidation.value
  return !validation.hasErrors && validation.isValid !== false
})

const canSaveDraft = computed(() => {
  // Allow saving if there's any data at all
  const hasTitle = wizardData.value.source?.title?.trim().length > 0
  const hasContent = wizardData.value.source?.content?.trim().length > 0
  const hasFile = wizardData.value.source?.file !== null && wizardData.value.source?.file !== undefined
  const hasProcessedChunks = wizardData.value.processing?.chunks?.length > 0
  
  return hasTitle || hasContent || hasFile || hasProcessedChunks
})

// Dynamic checklist that updates based on actual validation state
const dynamicChecklist = computed(() => {
  if (!currentStepData.value.checklist) return []
  
  const currentStepId = currentStepData.value.id
  
  if (currentStepId === 'source') {
    const title = wizardData.value.source?.title || ''
    const content = wizardData.value.source?.content || ''
    const file = wizardData.value.source?.file
    
    const titleCompleted = title.trim().length >= 3
    const contentCompleted = content.length >= 200 || file !== null
    const qualityCompleted = (title.length > 0 || content.length > 0 || file !== null)
    
    console.log('Checklist update:', {
      title: title.substring(0, 20),
      titleCompleted,
      contentLength: content.length,
      contentCompleted,
      qualityCompleted
    })
    
    return [
      {
        id: 'title',
        text: 'Title is present',
        completed: titleCompleted
      },
      {
        id: 'content',
        text: 'Content is at least 200 characters',
        completed: contentCompleted
      },
      {
        id: 'quality',
        text: 'No obvious formatting issues',
        completed: qualityCompleted
      }
    ]
  }
  
  // For other steps, return the static checklist (can be expanded later)
  return currentStepData.value.checklist || []
})

// Step Management
const isStepCompleted = (stepIndex: number) => {
  const stepId = steps[stepIndex].id
  const validation = stepValidation.value[stepId]
  return validation?.completed === true
}

const navigateToStep = (stepIndex: number) => {
  // Allow navigation to completed steps or current step
  if (stepIndex <= currentStep.value || isStepCompleted(stepIndex)) {
    currentStep.value = stepIndex
  }
}

const nextStep = () => {
  if (canProceed.value && currentStep.value < steps.length - 1) {
    // Mark current step as completed
    const currentStepId = currentStepData.value.id
    stepValidation.value[currentStepId] = {
      ...stepValidation.value[currentStepId],
      completed: true
    }
    
    currentStep.value++
    // Removed autoSave() - users should explicitly save drafts
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const skipStep = () => {
  if (currentStepData.value.canSkip) {
    // Mark as completed with default values
    const currentStepId = currentStepData.value.id
    stepValidation.value[currentStepId] = {
      completed: true,
      skipped: true
    }
    nextStep()
  }
}

// Data Management
const handleStepValidation = (validation: any) => {
  const currentStepId = currentStepData.value.id
  stepValidation.value[currentStepId] = validation
}

const handleDataUpdate = (updatedData: any) => {
  // Only update the specific sections that changed to avoid unnecessary reactivity
  if (!updatedData) return
  
  console.group('🔄 Wizard Data Update Debug')
  console.log('Update received for:', Object.keys(updatedData))
  
  // Update only the sections that are present in updatedData
  if (updatedData.source !== undefined) {
    wizardData.value.source = { ...wizardData.value.source, ...updatedData.source }
    console.log('✅ Updated source data')
  }
  if (updatedData.configure !== undefined) {
    wizardData.value.configure = { ...wizardData.value.configure, ...updatedData.configure }
    console.log('✅ Updated configure data')
  }
  if (updatedData.processing !== undefined) {
    wizardData.value.processing = { ...wizardData.value.processing, ...updatedData.processing }
    console.log('✅ Updated processing data:', {
      status: updatedData.processing.status,
      chunks: updatedData.processing.chunks?.length || 0
    })
  }
  if (updatedData.review !== undefined) {
    wizardData.value.review = { ...wizardData.value.review, ...updatedData.review }
    console.log('✅ Updated review data:', {
      chunks: updatedData.review.chunks?.length || 0,
      filters: updatedData.review.filters
    })
  }
  if (updatedData.insights !== undefined) {
    // Use Object.assign to avoid triggering unnecessary reactivity
    Object.assign(wizardData.value.insights, updatedData.insights)
    console.log('✅ Updated insights data')
  }
  if (updatedData.export !== undefined) {
    wizardData.value.export = { ...wizardData.value.export, ...updatedData.export }
    console.log('✅ Updated export data')
  }
  
  console.log('Current wizard data state:', {
    processing: {
      exists: !!wizardData.value.processing,
      chunks: wizardData.value.processing?.chunks?.length || 0,
      status: wizardData.value.processing?.status
    },
    review: {
      exists: !!wizardData.value.review,
      chunks: wizardData.value.review?.chunks?.length || 0
    }
  })
  console.groupEnd()
}

const saveDraft = async () => {
  try {
    // Manual Save Draft: Save to BOTH localStorage AND version control
    console.log('Manual Save Draft triggered - saving to localStorage + version control')
    
    // Save current wizard state to localStorage for quick restoration
    localStorage.setItem('manualContentWizard', JSON.stringify({
      currentStep: currentStep.value,
      data: wizardData.value,
      validation: stepValidation.value,
      timestamp: new Date().toISOString()
    }))
    lastSaved.value = new Date()
    
    // Also save to version control if we have any content
    const versionStore = useVersionStore()
    const hasProcessedChunks = wizardData.value.processing?.chunks?.length > 0 || 
                              wizardData.value.review?.chunks?.length > 0
    const hasContent = wizardData.value.source?.content?.trim().length > 0 || 
                      wizardData.value.source?.title?.trim().length > 0
    
    console.log('Save Draft Debug:', {
      hasProcessedChunks,
      hasContent,
      processingChunks: wizardData.value.processing?.chunks?.length || 0,
      reviewChunks: wizardData.value.review?.chunks?.length || 0,
      sourceContent: wizardData.value.source?.content?.length || 0,
      sourceTitle: wizardData.value.source?.title || '',
      versionStore: !!versionStore,
      wizardDataKeys: Object.keys(wizardData.value),
      allData: wizardData.value
    })
    
    if (hasProcessedChunks || hasContent) {
      // Create a descriptive version name using the document title
      const documentTitle = wizardData.value.source?.title?.trim() || 'Untitled Document'
      const timestamp = new Date()
      const versionName = `Draft: ${documentTitle} - ${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString()}`
      
      let formattedChunks = []
      
      if (hasProcessedChunks) {
        // Use processed chunks if available
        const chunks = wizardData.value.review?.chunks || wizardData.value.processing?.chunks || []
        console.log('Raw chunks found:', chunks)
        console.log('Chunks type:', typeof chunks, Array.isArray(chunks))
        
        formattedChunks = chunks.map((chunk: any) => ({
          chunk_id: chunk.chunk_id || chunk.id || `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content: chunk.content || '',
          tags: chunk.tags || [],
          source: documentTitle,
          word_count: chunk.word_count || (chunk.content ? chunk.content.split(/\s+/).length : 0),
          metadata: {
            ...chunk.metadata,
            processing_method: wizardData.value.configure?.chunkingMethod || 'manual',
            chunk_size: wizardData.value.configure?.chunkSize,
            overlap: wizardData.value.configure?.overlap,
            created_at: chunk.created_at || new Date().toISOString(),
            is_draft: true
          }
        }))
        
        console.log('Formatted chunks:', formattedChunks)
        console.log('Formatted chunks length:', formattedChunks.length)
      } else if (hasContent) {
        // Create a single chunk from the unprocessed content
        const content = wizardData.value.source?.content || ''
        formattedChunks = [{
          chunk_id: `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content: content,
          tags: [],
          source: documentTitle,
          word_count: content.split(/\s+/).filter(w => w.length > 0).length,
          metadata: {
            processing_method: 'unprocessed',
            created_at: new Date().toISOString(),
            is_draft: true,
            step: steps[currentStep.value].id,
            step_name: steps[currentStep.value].title
          }
        }]
      }
      
      // Save to version control (force save if we have any content)
      if (formattedChunks.length > 0 || (hasContent && formattedChunks.length === 0)) {
        // If we have processed chunks but they didn't format correctly, create from source
        if (formattedChunks.length === 0 && hasContent) {
          console.log('No formatted chunks but we have content, creating from source')
          const content = wizardData.value.source?.content || ''
          formattedChunks = [{
            chunk_id: `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            content: content,
            tags: [],
            source: documentTitle,
            word_count: content.split(/\s+/).filter(w => w.length > 0).length,
            metadata: {
              processing_method: 'source_content',
              created_at: new Date().toISOString(),
              is_draft: true,
              step: steps[currentStep.value].id,
              step_name: steps[currentStep.value].title
            }
          }]
        }
        try {
          console.log('Attempting to save version:', versionName)
          console.log('Formatted chunks:', formattedChunks)
          
          const savedVersion = await versionStore.saveVersion(
            { chunks: formattedChunks },
            versionName,
            false // Not an auto-save, this is a manual draft save
          )
          
          console.log('Draft saved to version control:', versionName, savedVersion)
          console.log('Current versions count:', versionStore.versions.length)
          console.log('All versions:', versionStore.versions.map(v => v.name))
        } catch (error) {
          console.error('Error saving version:', error)
        }
      } else {
        console.log('No content available for version control - this should not happen')
      }
    }
    
    // Show success feedback
    showSaveSuccess.value = true
    setTimeout(() => {
      showSaveSuccess.value = false
    }, 2000)
    
    console.log('Draft saved successfully')
  } catch (error) {
    console.error('Failed to save draft:', error)
    // Could show an error message here
  }
}

const autoSave = () => {
  // Only save to localStorage for session restoration - NO version control
  try {
    localStorage.setItem('manualContentWizard', JSON.stringify({
      currentStep: currentStep.value,
      data: wizardData.value,
      validation: stepValidation.value,
      timestamp: new Date().toISOString()
    }))
    lastSaved.value = new Date()
    console.log('Auto-saved to localStorage only (no version control)')
  } catch (error) {
    console.error('Failed to auto-save:', error)
  }
}

const formatTimeAgo = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return 'just now'
  if (minutes === 1) return '1 minute ago'
  if (minutes < 60) return `${minutes} minutes ago`
  
  const hours = Math.floor(minutes / 60)
  if (hours === 1) return '1 hour ago'
  if (hours < 24) return `${hours} hours ago`
  
  return 'over a day ago'
}

// Lifecycle
onMounted(async () => {
  // Initialize version store
  const versionStore = useVersionStore()
  await versionStore.loadVersionsFromStorage()
  
  // Check if we should auto-restore or start fresh
  // Use sessionStorage to track if this is the same session
  const isNewSession = !sessionStorage.getItem('wizardSessionActive')
  sessionStorage.setItem('wizardSessionActive', 'true')
  
  // Check for saved draft
  const saved = localStorage.getItem('manualContentWizard')
  
  if (saved && !isNewSession) {
    // Only auto-restore if it's the same session (not a page refresh)
    try {
      const parsed = JSON.parse(saved)
      
      // Check if there's actual content in the saved data
      const hasContent = parsed.data?.source?.title?.trim() || 
                        parsed.data?.source?.content?.trim() || 
                        parsed.data?.processing?.chunks?.length > 0
      
      if (hasContent) {
        currentStep.value = parsed.currentStep || 0
        // Safely merge saved data with default structure
        wizardData.value = {
          source: { ...wizardData.value.source, ...(parsed.data?.source || {}) },
          configure: { ...wizardData.value.configure, ...(parsed.data?.configure || {}) },
          processing: { ...wizardData.value.processing, ...(parsed.data?.processing || {}) },
          review: { ...wizardData.value.review, ...(parsed.data?.review || {}) },
          insights: { ...wizardData.value.insights, ...(parsed.data?.insights || {}) },
          export: { ...wizardData.value.export, ...(parsed.data?.export || {}) }
        }
        stepValidation.value = parsed.validation || {}
        lastSaved.value = parsed.timestamp ? new Date(parsed.timestamp) : null
        
        // Show notification that draft was loaded
        draftLoaded.value = true
        setTimeout(() => {
          draftLoaded.value = false
        }, 3000)
        
        console.log('Draft loaded from', parsed.timestamp)
      }
    } catch (error) {
      console.warn('Failed to restore wizard state:', error)
    }
  } else if (saved && isNewSession) {
    // New session but has a saved draft - offer to load it
    console.log('Found saved draft from previous session. User can load it manually using "Load Draft" if needed.')
  }
  
  // Always start at step 1 on page refresh (new session)
  if (isNewSession) {
    currentStep.value = 0
    console.log('Starting fresh wizard session')
  }
})

// Auto-save to localStorage only (for session restoration) - NOT version control
let saveTimeout = null
watch(wizardData, () => {
  // Clear existing timeout if any
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
  // Debounce the save to prevent excessive saves during rapid updates
  saveTimeout = setTimeout(() => {
    autoSave() // Only saves to localStorage, not version control
  }, 500) // Save after 500ms of no changes
}, { deep: true })

// Debug watcher to see if data is updating
watch(() => wizardData.value.source, (newSource, oldSource) => {
  console.log('Source data changed:', {
    title: newSource?.title || '',
    contentLength: newSource?.content?.length || 0,
    file: newSource?.file?.name || null
  })
}, { deep: true })
</script>

<style scoped>
.manual-content-wizard {
  min-height: 100vh;
}

.tip-card {
  @apply p-3 bg-amber-50/50 rounded-lg border border-amber-100;
}

.badge {
  @apply inline-flex items-center px-2 py-1 rounded-md text-xs font-medium;
}

/* Animations */
@keyframes fade-in {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

/* Button styles - extend existing design tokens */
.btn {
  @apply inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98];
  height: 44px;
}

.btn-primary {
  @apply bg-brand-sage-600 text-white hover:bg-brand-sage-700 focus:ring-brand-sage-500;
}

.btn-primary-green {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  @apply text-white font-semibold shadow-lg;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
}

.btn-primary-green:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.btn-primary-green:disabled {
  background: #9CA3AF;
  box-shadow: none;
  transform: none;
  cursor: not-allowed;
}

.btn-ghost {
  @apply bg-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50;
  @apply border border-neutral-200 focus:ring-neutral-400;
}

.btn-ghost:disabled {
  @apply opacity-50 cursor-not-allowed hover:bg-transparent hover:text-neutral-600;
}

/* Toast animation */
.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>