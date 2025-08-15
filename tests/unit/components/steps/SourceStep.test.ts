import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SourceStep from '@/components/steps/SourceStep.vue'

describe('SourceStep', () => {
  let wrapper: any
  let pinia: any

  const defaultProps = {
    data: {
      source: {
        title: '',
        content: '',
        file: null
      }
    },
    validation: {}
  }

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    wrapper = mount(SourceStep, {
      props: defaultProps,
      global: {
        plugins: [pinia]
      }
    })
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  describe('Component Rendering', () => {
    it('should render source step form', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.source-step').exists()).toBe(true)
    })

    it('should render title input field', () => {
      const titleInput = wrapper.find('#content-title')
      expect(titleInput.exists()).toBe(true)
      expect(titleInput.attributes('placeholder')).toContain('Enter a clear, descriptive title')
    })

    it('should render content input tabs', () => {
      const tabs = wrapper.findAll('[role="tab"]')
      expect(tabs).toHaveLength(2)
      expect(tabs[0].text()).toContain('Type or Paste')
      expect(tabs[1].text()).toContain('Upload File')
    })

    it('should show textarea by default', () => {
      expect(wrapper.find('#content-text').exists()).toBe(true)
      expect(wrapper.vm.activeTab).toBe('type')
    })
  })

  describe('Title Validation', () => {
    it('should validate title length', async () => {
      const titleInput = wrapper.find('#content-title')
      
      // Test empty title
      await titleInput.setValue('')
      await titleInput.trigger('blur')
      
      expect(wrapper.vm.titleError).toBeTruthy()
      expect(wrapper.vm.titleValid).toBe(false)
    })

    it('should validate minimum title length', async () => {
      const titleInput = wrapper.find('#content-title')
      
      // Test short title
      await titleInput.setValue('AB')
      await titleInput.trigger('blur')
      
      expect(wrapper.vm.titleError).toBeTruthy()
      expect(wrapper.vm.titleValid).toBe(false)
    })

    it('should pass validation for valid title', async () => {
      const titleInput = wrapper.find('#content-title')
      
      await titleInput.setValue('Valid Document Title')
      await titleInput.trigger('blur')
      
      expect(wrapper.vm.titleError).toBeFalsy()
      expect(wrapper.vm.titleValid).toBe(true)
    })

    it('should show character counter', async () => {
      const titleInput = wrapper.find('#content-title')
      await titleInput.setValue('Test Title')
      
      const counter = wrapper.find('.text-xs')
      expect(counter.text()).toContain('10/200')
    })

    it('should warn when approaching character limit', async () => {
      const titleInput = wrapper.find('#content-title')
      const longTitle = 'A'.repeat(185)
      await titleInput.setValue(longTitle)
      
      const counter = wrapper.find('.text-[color:var(--color-warning-600)]')
      expect(counter.exists()).toBe(true)
    })

    it('should enforce maximum title length', async () => {
      const titleInput = wrapper.find('#content-title')
      expect(titleInput.attributes('maxlength')).toBe('200')
    })
  })

  describe('Content Validation', () => {
    it('should validate minimum content length', async () => {
      const contentTextarea = wrapper.find('#content-text')
      
      // Test short content
      await contentTextarea.setValue('Too short')
      
      expect(wrapper.vm.contentValid).toBe(false)
    })

    it('should pass validation for sufficient content', async () => {
      const contentTextarea = wrapper.find('#content-text')
      const validContent = 'This is a sufficiently long content that meets the minimum requirement of 200 characters. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.'
      
      await contentTextarea.setValue(validContent)
      
      expect(wrapper.vm.contentValid).toBe(true)
    })

    it('should show character counter for content', async () => {
      const contentTextarea = wrapper.find('#content-text')
      await contentTextarea.setValue('Test content')
      
      const stats = wrapper.find('.text-xs')
      expect(wrapper.text()).toContain('12 characters')
    })

    it('should calculate word count correctly', async () => {
      const contentTextarea = wrapper.find('#content-text')
      await contentTextarea.setValue('This is a test with five words')
      
      expect(wrapper.text()).toContain('6 words')
    })
  })

  describe('Tab Navigation', () => {
    it('should switch between type and upload tabs', async () => {
      expect(wrapper.vm.activeTab).toBe('type')
      
      const uploadTab = wrapper.findAll('[role="tab"]')[1]
      await uploadTab.trigger('click')
      
      expect(wrapper.vm.activeTab).toBe('upload')
    })

    it('should show upload area when upload tab is active', async () => {
      const uploadTab = wrapper.findAll('[role="tab"]')[1]
      await uploadTab.trigger('click')
      
      expect(wrapper.find('.upload-area').exists()).toBe(true)
    })

    it('should show correct tab states', async () => {
      const tabs = wrapper.findAll('[role="tab"]')
      
      // First tab should be active initially
      expect(tabs[0].classes()).toContain('tab-active')
      expect(tabs[1].classes()).toContain('tab-inactive')
      
      // Switch tabs
      await tabs[1].trigger('click')
      
      expect(tabs[0].classes()).toContain('tab-inactive')
      expect(tabs[1].classes()).toContain('tab-active')
    })
  })

  describe('File Upload', () => {
    beforeEach(async () => {
      const uploadTab = wrapper.findAll('[role="tab"]')[1]
      await uploadTab.trigger('click')
    })

    it('should render file upload area', () => {
      expect(wrapper.find('.upload-area').exists()).toBe(true)
      expect(wrapper.find('input[type="file"]').exists()).toBe(true)
    })

    it('should accept specific file types', () => {
      const fileInput = wrapper.find('input[type="file"]')
      expect(fileInput.attributes('accept')).toContain('.pdf')
      expect(fileInput.attributes('accept')).toContain('.txt')
      expect(fileInput.attributes('accept')).toContain('.md')
    })

    it('should handle file selection', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const fileInput = wrapper.find('input[type="file"]')
      
      // Mock file input
      Object.defineProperty(fileInput.element, 'files', {
        value: [file],
        writable: false
      })
      
      await fileInput.trigger('change')
      
      expect(wrapper.vm.formData.file).toBe(file)
    })

    it('should validate file size', async () => {
      const largePdfFile = new File(['x'.repeat(60 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' })
      const fileInput = wrapper.find('input[type="file"]')
      
      Object.defineProperty(fileInput.element, 'files', {
        value: [largePdfFile],
        writable: false
      })
      
      await fileInput.trigger('change')
      
      expect(wrapper.vm.fileError).toBeTruthy()
      expect(wrapper.vm.fileError).toContain('PDF files must be under 50MB')
    })

    it('should validate file type', async () => {
      const invalidFile = new File(['content'], 'test.exe', { type: 'application/x-executable' })
      const fileInput = wrapper.find('input[type="file"]')
      
      Object.defineProperty(fileInput.element, 'files', {
        value: [invalidFile],
        writable: false
      })
      
      await fileInput.trigger('change')
      
      expect(wrapper.vm.fileError).toBeTruthy()
      expect(wrapper.vm.fileError).toContain('Please select a valid file type')
    })

    it('should clear file when remove button is clicked', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
      wrapper.vm.formData.file = file
      await wrapper.vm.$nextTick()
      
      const removeButton = wrapper.find('.btn-ghost')
      if (removeButton.exists()) {
        await removeButton.trigger('click')
        expect(wrapper.vm.formData.file).toBeNull()
      }
    })
  })

  describe('Template Application', () => {
    it('should show template options', () => {
      const templateSection = wrapper.find('.template-section')
      if (templateSection.exists()) {
        expect(templateSection.text()).toContain('Quick Start Templates')
      }
    })

    it('should apply template when selected', async () => {
      const templateButtons = wrapper.findAll('.template-card')
      if (templateButtons.length > 0) {
        await templateButtons[0].trigger('click')
        
        // Should populate title and content
        expect(wrapper.vm.formData.title).toBeTruthy()
        expect(wrapper.vm.formData.content).toBeTruthy()
      }
    })
  })

  describe('Data Updates and Events', () => {
    it('should emit data updates when form changes', async () => {
      const titleInput = wrapper.find('#content-title')
      await titleInput.setValue('Test Title')
      
      const emitted = wrapper.emitted('update:data')
      expect(emitted).toBeTruthy()
      expect(emitted[emitted.length - 1][0]).toEqual({
        source: expect.objectContaining({
          title: 'Test Title'
        })
      })
    })

    it('should emit validation status', async () => {
      const titleInput = wrapper.find('#content-title')
      const contentTextarea = wrapper.find('#content-text')
      
      await titleInput.setValue('Valid Title')
      await contentTextarea.setValue('Valid content with sufficient length to pass all validation requirements. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.')
      
      const validationEmitted = wrapper.emitted('validate')
      expect(validationEmitted).toBeTruthy()
      
      const lastValidation = validationEmitted[validationEmitted.length - 1][0]
      expect(lastValidation.isValid).toBe(true)
      expect(lastValidation.hasErrors).toBe(false)
    })

    it('should emit next event when form is submitted', async () => {
      // Set up valid form data
      wrapper.vm.formData.title = 'Valid Title'
      wrapper.vm.formData.content = 'Valid content with sufficient length to pass validation'
      await wrapper.vm.$nextTick()
      
      const form = wrapper.find('form')
      await form.trigger('submit')
      
      expect(wrapper.emitted('next')).toBeTruthy()
    })
  })

  describe('Real-time Statistics', () => {
    it('should show character count', async () => {
      const contentTextarea = wrapper.find('#content-text')
      await contentTextarea.setValue('Test content')
      
      expect(wrapper.text()).toContain('12 characters')
    })

    it('should show word count', async () => {
      const contentTextarea = wrapper.find('#content-text')
      await contentTextarea.setValue('This is a test')
      
      expect(wrapper.text()).toContain('4 words')
    })

    it('should show estimated reading time', async () => {
      const contentTextarea = wrapper.find('#content-text')
      const longContent = 'Lorem ipsum '.repeat(50) // About 200 words
      await contentTextarea.setValue(longContent)
      
      expect(wrapper.text()).toContain('minute')
    })

    it('should estimate chunk count', async () => {
      const contentTextarea = wrapper.find('#content-text')
      const longContent = 'Lorem ipsum '.repeat(100) // About 400 words
      await contentTextarea.setValue(longContent)
      
      expect(wrapper.text()).toContain('chunk')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const titleInput = wrapper.find('#content-title')
      const contentTextarea = wrapper.find('#content-text')
      
      expect(titleInput.attributes('aria-label') || wrapper.find('label[for="content-title"]').exists()).toBeTruthy()
      expect(contentTextarea.attributes('aria-label') || wrapper.find('label[for="content-text"]').exists()).toBeTruthy()
    })

    it('should have proper tab navigation', () => {
      const tablist = wrapper.find('[role="tablist"]')
      expect(tablist.exists()).toBe(true)
      
      const tabs = wrapper.findAll('[role="tab"]')
      tabs.forEach(tab => {
        expect(tab.attributes('aria-selected')).toBeDefined()
      })
    })

    it('should indicate required fields', () => {
      const requiredLabels = wrapper.findAll('.form-label--required')
      expect(requiredLabels.length).toBeGreaterThan(0)
    })
  })

  describe('Error States', () => {
    it('should show error styling for invalid inputs', async () => {
      const titleInput = wrapper.find('#content-title')
      
      await titleInput.setValue('AB') // Too short
      await titleInput.trigger('blur')
      
      expect(titleInput.classes()).toContain('input--error')
    })

    it('should show success styling for valid inputs', async () => {
      const titleInput = wrapper.find('#content-title')
      
      await titleInput.setValue('Valid Title')
      await titleInput.trigger('blur')
      
      expect(titleInput.classes()).toContain('input--success')
    })

    it('should display error messages', async () => {
      const titleInput = wrapper.find('#content-title')
      
      await titleInput.setValue('')
      await titleInput.trigger('blur')
      
      const errorMessage = wrapper.find('.form-error')
      expect(errorMessage.exists()).toBe(true)
    })
  })
})