<template>
  <div class="source-step">
    <form @submit.prevent="handleSubmit" style="display: flex; flex-direction: column; gap: var(--space-6);">
      <!-- Title Input -->
      <div class="form-field">
        <label for="content-title" class="form-label form-label--required">
          <span style="font-size: var(--fluid-text-sm); font-weight: var(--font-weight-medium); color: var(--color-neutral-900);">Content Title</span>
          <span class="text-[color:var(--color-warning-600)]" style="margin-left: var(--space-1);">*</span>
        </label>
        <div class="relative">
          <input
            id="content-title"
            v-model="formData.title"
            type="text"
            class="input"
            :class="{
              'input--error': titleError && titleTouched,
              'input--success': titleValid && formData.title.length > 0
            }"
            placeholder="Enter a clear, descriptive title (e.g., API Documentation, Product Manual, Research Paper)"
            @blur="validateTitle; titleTouched = true"
            @input="handleTitleInput"
            maxlength="200"
          />
          
          <!-- Title validation indicators -->
          <div class="absolute top-1/2 transform -translate-y-1/2 flex items-center" style="right: var(--space-3); gap: var(--space-2);">
            <div v-if="titleValid && formData.title.length > 0" class="w-5 h-5 text-[color:var(--color-success-600)]">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
            <span v-if="formData.title" :class="[
              'text-xs transition-colors',
              formData.title.length > 180 ? 'text-[color:var(--color-warning-600)]' : 'text-[color:var(--color-neutral-400)]'
            ]">
              {{ formData.title.length }}/200
            </span>
          </div>
        </div>
        
        <!-- Title error message -->
        <div v-if="titleError && titleTouched" class="form-error">
          <svg class="w-4 h-4 text-[color:var(--color-error-600)] inline" style="margin-right: var(--space-1);" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          {{ titleError }}
        </div>
        
        <!-- Title help text -->
        <div v-else class="form-help">
          A descriptive title helps organize and find your content later
        </div>
      </div>

      <!-- Content Input Area -->
      <div class="form-field">
        <label for="content-text" class="form-label form-label--required">
          <span style="font-size: var(--fluid-text-sm); font-weight: var(--font-weight-medium); color: var(--color-neutral-900);">Content</span>
          <span class="text-[color:var(--color-warning-600)]" style="margin-left: var(--space-1);">*</span>
        </label>
        
        <!-- Content Input Tabs -->
        <div class="tabs-container" style="margin-bottom: var(--space-3);">
          <div class="tabs-list" role="tablist" aria-label="Content input methods">
            <button
              type="button"
              role="tab"
              :aria-selected="activeTab === 'type'"
              :class="['tab-button', activeTab === 'type' ? 'tab-active' : 'tab-inactive']"
              @click="setActiveTab('type')"
            >
              <svg class="w-4 h-4" style="margin-right: var(--space-2);" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Type or Paste
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="activeTab === 'upload'"
              :class="['tab-button', activeTab === 'upload' ? 'tab-active' : 'tab-inactive']"
              @click="setActiveTab('upload')"
            >
              <svg class="w-4 h-4" style="margin-right: var(--space-2);" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
              Upload File
            </button>
          </div>
        </div>

        <!-- Type/Paste Tab Content -->
        <div v-show="activeTab === 'type'" role="tabpanel" class="tab-content">
          <div class="relative">
            <textarea
              id="content-text"
              v-model="formData.content"
              class="textarea"
              :class="{
                'input-warning': contentError && !contentTouched,
                'input-error': contentError && contentTouched,
                'input-success': contentValid && formData.content.length > 0
              }"
              placeholder="Paste or type your content here...
• Aim for 300–2000 words
• Markdown formatting supported
• Use multiple paragraphs"
              rows="10"
              @input="handleContentInput"
              @blur="validateContent; contentTouched = true"
            ></textarea>
            
            <!-- Content stats overlay -->
            <div class="absolute flex items-center" style="bottom: var(--space-2); right: var(--space-3); gap: var(--space-2);">
              <div :class="[
                'text-xs px-2 py-1 rounded transition-all duration-200',
                contentStats.chars > 0 ? 'text-[color:var(--color-neutral-500)]' : 'text-[color:var(--color-neutral-400)]'
              ]">
                {{ contentStats.chars }} chars
              </div>
              <div :class="[
                'text-xs px-2 py-1 rounded transition-all duration-200 flex items-center gap-1',
                wordCountStatus.textClass
              ]">
                <svg v-if="wordCountStatus.icon" class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span>{{ contentStats.words }} words</span>
                <span v-if="wordCountStatus.label" style="font-weight: var(--font-weight-medium);">{{ wordCountStatus.label }}</span>
              </div>
            </div>
          </div>
          
          <!-- Content error message -->
          <div v-if="contentError && contentTouched" class="form-error" style="margin-top: var(--space-2);">
            <svg class="w-4 h-4 text-[color:var(--color-error-600)] inline" style="margin-right: var(--space-1);" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            {{ contentError }}
          </div>
          
          <!-- Content help text -->
          <div v-else class="form-help" style="margin-top: var(--space-2);">
            {{ contentHelpText }}
          </div>
        </div>

        <!-- Upload File Tab Content -->
        <div v-show="activeTab === 'upload'" role="tabpanel" class="tab-content">
          <div
            class="upload-zone"
            :class="{
              'upload-zone-dragover': isDragOver,
              'upload-zone-error': uploadError,
              'upload-zone-success': uploadedFile
            }"
            @drop="handleDrop"
            @dragover="handleDragOver"
            @dragenter="handleDragEnter"
            @dragleave="handleDragLeave"
            @click="triggerFileInput"
          >
            <input
              ref="fileInput"
              type="file"
              class="hidden"
              accept=".pdf,.txt,.md,.docx"
              @change="handleFileSelect"
            />
            
            <div v-if="!uploadedFile" class="upload-zone-content">
              <div class="upload-icon">
                <svg class="w-12 h-12 text-[color:var(--color-neutral-400)]" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </div>
              <p style="font-size: var(--fluid-text-lg); font-weight: var(--font-weight-medium); color: var(--color-neutral-900); margin-bottom: var(--space-2);">
                Drop files here or click to browse
              </p>
              <p style="font-size: var(--fluid-text-sm); color: var(--color-neutral-600); margin-bottom: var(--space-4);">
                Supports PDF, TXT, MD, and DOCX files up to 50MB
              </p>
              <div class="flex items-center text-xs text-[color:var(--color-neutral-500)]" style="gap: var(--space-2);">
                <span class="flex items-center" style="gap: var(--space-1);">
                  <svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                  </svg>
                  Files processed locally
                </span>
              </div>
            </div>
            
            <div v-else class="uploaded-file-preview">
              <div class="flex items-center rounded-lg border border-[color:var(--color-success-200)] bg-[color:var(--color-success-50)]" style="gap: var(--space-3); padding: var(--space-4);">
                <div class="file-icon">
                  <svg class="w-8 h-8 text-[color:var(--color-success-600)]" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="flex-1">
                  <p style="font-weight: var(--font-weight-medium); color: var(--color-success-900);">{{ uploadedFile.name }}</p>
                  <p style="font-size: var(--fluid-text-sm); color: var(--color-success-700);">{{ formatFileSize(uploadedFile.size) }} • Ready to process</p>
                </div>
                <button
                  type="button"
                  @click="clearUploadedFile"
                  class="text-[color:var(--color-success-600)] hover:text-success-800" style="padding: var(--space-1);"
                  aria-label="Remove file"
                >
                  <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Upload error message -->
          <div v-if="uploadError" class="form-error" style="margin-top: var(--space-2);">
            <svg class="w-4 h-4 text-[color:var(--color-error-600)] inline" style="margin-right: var(--space-1);" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            {{ uploadError }}
          </div>
          
          <!-- Upload help text -->
          <div v-else class="form-help" style="margin-top: var(--space-2);">
            All files are processed securely in your browser - nothing is uploaded to external servers
          </div>
        </div>
      </div>

      <!-- Quick Start Templates (Optional Enhancement) -->
      <div v-if="!formData.content && !uploadedFile" class="quick-start-section">
        <h4 style="font-size: var(--fluid-text-sm); font-weight: var(--font-weight-medium); color: var(--color-neutral-900); margin-bottom: var(--space-2);">Quick Start Templates</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2" style="gap: var(--space-2);">
          <button
            v-for="template in quickStartTemplates"
            :key="template.id"
            type="button"
            @click="applyTemplate(template)"
            class="card template-item"
          >
            <div class="flex items-center" style="gap: var(--space-2);">
              <span class="text-lg">{{ template.icon }}</span>
              <div class="text-left" style="flex: 1;">
                <p style="font-weight: var(--font-weight-medium); font-size: var(--fluid-text-sm); color: var(--color-neutral-900);">{{ template.title }}</p>
                <p class="text-xs text-[color:var(--color-neutral-600)]">{{ template.description }}</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'

// Props & Emits
const props = defineProps<{
  data: {
    source: {
      title: string
      content: string
      file: File | null
    }
  }
  validation: any
}>()

const emit = defineEmits<{
  validate: [validation: any]
  next: []
  'update:data': [data: any]
}>()

// Component State
const activeTab = ref<'type' | 'upload'>('type')
const formData = ref({
  title: props.data.source.title || '',
  content: props.data.source.content || ''
})

const uploadedFile = ref<File | null>(props.data.source.file)
const fileInput = ref<HTMLInputElement>()

// Drag and Drop State
const isDragOver = ref(false)

// Validation State
const titleError = ref('')
const contentError = ref('')
const uploadError = ref('')
const titleTouched = ref(false)
const contentTouched = ref(false)

// Quick Start Templates
const quickStartTemplates = [
  {
    id: 'documentation',
    title: 'API Documentation',
    description: 'Technical documentation template',
    icon: '📚',
    content: `# API Documentation

## Overview
This API provides comprehensive access to our platform's core features, designed for developers to integrate our services into their applications.

## Authentication
To authenticate requests, include your API key in the Authorization header:
\`Authorization: Bearer your-api-key\`

## Base URL
All API requests should be made to: \`https://api.example.com/v1\`

## Core Endpoints

### GET /api/users
Retrieves user information and profile data.

**Parameters:**
- \`id\` (required): User ID
- \`include\` (optional): Additional data to include

**Response:**
\`\`\`json
{
  "id": "user123",
  "name": "John Doe",
  "email": "john@example.com"
}
\`\`\`

### POST /api/users
Creates a new user account.

**Body Parameters:**
- \`name\` (required): User's full name
- \`email\` (required): Valid email address
- \`password\` (required): Minimum 8 characters

## Error Handling
The API returns standard HTTP status codes and structured error responses.`
  },
  {
    id: 'manual',
    title: 'User Manual',
    description: 'Product manual template',
    icon: '📖',
    content: `# User Manual

## Getting Started
Welcome to our comprehensive software solution. This manual will guide you through installation, setup, and daily usage of all features.

## System Requirements
- Operating System: Windows 10+ / macOS 10.15+ / Linux Ubuntu 18+
- RAM: 4GB minimum, 8GB recommended
- Storage: 2GB free disk space
- Internet connection for initial setup and updates

## Installation
1. Download the installer from our official website
2. Run the installer with administrator privileges
3. Follow the setup wizard instructions
4. Enter your license key when prompted
5. Complete the initial configuration

## Basic Usage
After installation, you can access the main features through the dashboard:

### Dashboard Overview
The main dashboard provides quick access to:
- Recent projects and files
- System status and notifications
- Quick action buttons for common tasks

### Creating Your First Project
1. Click "New Project" from the dashboard
2. Choose your project template
3. Configure basic settings
4. Start adding your content

## Advanced Features
Our software includes powerful automation tools, custom integrations, and reporting capabilities.

## Troubleshooting
Common issues and their solutions:
- **Connection Problems**: Check your internet connection and firewall settings
- **Performance Issues**: Ensure system requirements are met and close unnecessary applications`
  }
]

// Computed Properties
const contentStats = computed(() => {
  const content = formData.value.content
  return {
    chars: content.length,
    words: content.trim() ? content.trim().split(/\s+/).length : 0,
    lines: content.split('\n').length
  }
})

const titleValid = computed(() => {
  return formData.value.title.length >= 3 && formData.value.title.length <= 200
})

const contentValid = computed(() => {
  const hasContent = formData.value.content.length >= 200 || uploadedFile.value !== null
  return hasContent
})

const contentHelpText = computed(() => {
  const words = contentStats.value.words
  if (words === 0) return 'Start typing or paste your content here'
  if (words < 50) return `${words} words - add more content for better results`
  if (words < 200) return `${words} words - getting there! Aim for 200+ words`
  if (words < 500) return `${words} words - good length for processing`
  return `${words} words - excellent! This will chunk very well`
})

const wordCountStatus = computed(() => {
  const words = contentStats.value.words
  
  if (words === 0) {
    return {
      textClass: 'text-[color:var(--color-neutral-400)]',
      icon: false,
      label: ''
    }
  } else if (words < 100) {
    return {
      textClass: 'text-[color:var(--color-neutral-500)]',
      icon: false,
      label: '• Keep going'
    }
  } else if (words < 300) {
    return {
      textClass: 'text-[color:var(--color-info-600)]',
      icon: false,
      label: '• Getting there'
    }
  } else if (words >= 300 && words <= 2000) {
    return {
      textClass: 'text-[color:var(--color-success-600)]',
      icon: true,
      label: '• Perfect!'
    }
  } else {
    return {
      textClass: 'text-[color:var(--color-warning-600)]',
      icon: false,
      label: '• Very long'
    }
  }
})

const isValid = computed(() => {
  return titleValid.value && contentValid.value && !titleError.value && !contentError.value && !uploadError.value
})

// Methods
const setActiveTab = (tab: 'type' | 'upload') => {
  activeTab.value = tab
  if (tab === 'upload' && uploadedFile.value) {
    // Clear typed content when switching to upload with file
    formData.value.content = ''
  } else if (tab === 'type' && formData.value.content) {
    // Clear uploaded file when switching to type with content
    uploadedFile.value = null
  }
}

const handleTitleInput = () => {
  titleError.value = ''
  if (titleTouched.value) {
    validateTitle()
  }
}

const validateTitle = () => {
  const title = formData.value.title.trim()
  
  if (!title) {
    titleError.value = 'Title is required'
    return false
  }
  
  if (title.length < 3) {
    titleError.value = 'Title must be at least 3 characters'
    return false
  }
  
  if (title.length > 200) {
    titleError.value = 'Title must be less than 200 characters'
    return false
  }
  
  titleError.value = ''
  return true
}

const handleContentInput = () => {
  contentError.value = ''
  if (contentTouched.value) {
    validateContent()
  }
}

const validateContent = () => {
  const content = formData.value.content.trim()
  
  if (!content && !uploadedFile.value) {
    contentError.value = 'Content is required - type content or upload a file'
    return false
  }
  
  // Note: checking original content length, not trimmed
  if (formData.value.content && formData.value.content.length < 200 && !uploadedFile.value) {
    contentError.value = 'Content should be at least 200 characters for optimal results'
    return false
  }
  
  contentError.value = ''
  return true
}

// File Upload Methods
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  // Only set to false if we're leaving the drop zone entirely
  if (!(event.currentTarget as Element)?.contains(event.relatedTarget as Node)) {
    isDragOver.value = false
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

const processFile = (file: File) => {
  uploadError.value = ''
  
  // Validate file type
  const allowedTypes = ['.pdf', '.txt', '.md', '.docx']
  const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()
  
  if (!allowedTypes.includes(fileExt)) {
    uploadError.value = 'File type not supported. Use PDF, TXT, MD, or DOCX files.'
    return
  }
  
  // Validate file size (50MB limit)
  const maxSize = 50 * 1024 * 1024 // 50MB in bytes
  if (file.size > maxSize) {
    uploadError.value = 'File is too large. Maximum size is 50MB.'
    return
  }
  
  // Set uploaded file and clear typed content
  uploadedFile.value = file
  formData.value.content = ''
  
  // Switch to upload tab if not already
  activeTab.value = 'upload'
  
  validateContent()
}

const clearUploadedFile = () => {
  uploadedFile.value = null
  uploadError.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  validateContent()
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const applyTemplate = (template: any) => {
  formData.value.title = template.title
  formData.value.content = template.content
  activeTab.value = 'type'
  
  nextTick(() => {
    validateTitle()
    validateContent()
  })
}

const handleSubmit = () => {
  const titleIsValid = validateTitle()
  const contentIsValid = validateContent()
  
  if (titleIsValid && contentIsValid) {
    emit('next')
  }
}

// Watchers
watch([() => formData.value.title, () => formData.value.content, uploadedFile], () => {
  // Update parent data - this is key for the wizard to see the changes
  emit('update:data', {
    ...props.data,
    source: {
      title: formData.value.title,
      content: formData.value.content,
      file: uploadedFile.value
    }
  })
  
  // Emit validation
  emit('validate', {
    isValid: isValid.value,
    hasErrors: titleError.value || contentError.value || uploadError.value,
    completed: isValid.value,
    errors: {
      title: titleError.value,
      content: contentError.value,
      upload: uploadError.value
    }
  })
}, { immediate: true })

// Initialize validation on mount
onMounted(() => {
  validateTitle()
  validateContent()
  
  // Emit initial data to parent
  emit('update:data', {
    ...props.data,
    source: {
      title: formData.value.title,
      content: formData.value.content,
      file: uploadedFile.value
    }
  })
})
</script>

<style scoped>
/* Form Components */
.form-group {
  @apply space-y-1.5;
}

.form-label {
  display: block;
  font-size: var(--fluid-text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-900);
  margin-bottom: var(--space-3);
}

.form-input {
  @apply w-full px-4 py-3 border border-neutral-300 rounded-xl text-neutral-900 placeholder-neutral-400;
  @apply focus:ring-2 focus:ring-brand-sage-500 focus:border-brand-sage-500 transition-all duration-200;
  @apply bg-white/80 backdrop-blur-sm;
}

.form-textarea {
  @apply w-full px-4 py-4 border border-neutral-300 rounded-xl text-neutral-900 placeholder-neutral-400;
  @apply focus:ring-2 focus:ring-brand-sage-500 focus:border-brand-sage-500 transition-all duration-200;
  @apply bg-white/80 backdrop-blur-sm resize-y;
  min-height: 240px;
}

/* Input states now use design system .input--error and .input--success classes */

/* Form error and help now use design system .form-error and .form-help classes */

/* Tabs */
.tabs-container {
  @apply border-b border-neutral-200;
}

.tabs-list {
  @apply flex space-x-0;
}

.tab-button {
  display: flex;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  font-size: var(--fluid-text-sm);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  border-bottom: 2px solid;
  transition: all var(--transition-standard);
  @apply focus:outline-none focus:ring-2 focus:ring-brand-sage-500 focus:ring-offset-2;
}

.tab-active {
  @apply text-brand-sage-700 border-brand-sage-500 bg-brand-sage-50;
}

.tab-inactive {
  @apply text-[color:var(--color-neutral-500)] border-transparent hover:text-neutral-700 hover:border-neutral-300;
}

.tab-content {
  @apply mt-4;
}

/* Upload Zone */
.upload-zone {
  @apply w-full p-8 border-2 border-dashed border-neutral-300 rounded-xl text-center cursor-pointer;
  @apply hover:border-brand-sage-400 hover:bg-brand-sage-50/50 transition-all duration-200;
}

.upload-zone-dragover {
  @apply border-brand-sage-500 bg-brand-sage-50;
}

.upload-zone-error {
  @apply border-error-500 bg-error-50;
}

.upload-zone-success {
  @apply border-success-500 bg-[color:var(--color-success-50)] cursor-default;
}

.upload-zone-content {
  @apply space-y-4;
}

.upload-icon {
  @apply mx-auto;
}

.uploaded-file-preview {
  @apply text-left;
}

.file-icon {
  @apply flex-shrink-0;
}

/* Quick Start Templates */
.quick-start-section {
  @apply p-4 bg-neutral-50/50 rounded-xl border border-neutral-200;
}

/* Template cards now use design system .card class */
.template-item {
  padding: var(--space-3);
  text-align: left;
  cursor: pointer;
  transition: all var(--transition-standard);
}

.template-item:hover {
  border-color: var(--brand-sage-300);
  background: var(--brand-sage-50);
}

.template-item:focus {
  outline: var(--focus-ring-width) solid var(--focus-ring-primary);
  outline-offset: var(--focus-ring-offset);
}

/* Responsive Design */
@media (max-width: 768px) {
  .form-input,
  .form-textarea {
    @apply px-3 py-2.5;
    font-size: 16px; /* Prevents zoom on iOS */
  }
  
  .upload-zone {
    @apply p-4;
    min-height: 160px;
  }
  
  .template-item {
    padding: var(--space-3);
  }
  
  .tabs-list {
    @apply flex-col space-x-0 space-y-1;
  }
  
  .tab-button {
    @apply w-full justify-center rounded-lg;
    border-radius: var(--radius-md);
    border-bottom: none;
    border: 1px solid var(--border-color);
  }
  
  .tab-active {
    border-color: var(--brand-sage-500);
  }
}

@media (max-width: 480px) {
  .upload-zone {
    @apply p-3;
    min-height: 140px;
  }
  
  .upload-zone-content p {
    font-size: var(--fluid-text-sm);
  }
  
  .quick-start-section {
    @apply p-3;
  }
  
  .template-item {
    padding: var(--space-2);
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .form-input,
  .form-textarea,
  .tab-button,
  .upload-zone,
  .template-item {
    transition: none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .form-input,
  .form-textarea {
    @apply border-2;
  }
  
  .input-error {
    @apply border-2 border-error-700;
  }
  
  .input-success {
    @apply border-2 border-success-700;
  }
}
</style>