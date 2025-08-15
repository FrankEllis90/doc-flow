import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ManualContentWizard from '@/components/ManualContentWizard.vue'
import { useContentStore } from '@/stores/content'
import { useAppStore } from '@/stores/app'
import { useVersionStore } from '@/stores/versions'

describe('ManualContentWizard', () => {
  let wrapper: any
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    // Clear localStorage
    localStorage.clear()
    
    wrapper = mount(ManualContentWizard, {
      global: {
        plugins: [pinia]
      }
    })
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  describe('Wizard Initialization', () => {
    it('should render with default state', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.manual-content-wizard').exists()).toBe(true)
    })

    it('should initialize with source step', () => {
      expect(wrapper.vm.currentStep).toBe(0)
      expect(wrapper.vm.currentStepData.id).toBe('source')
    })

    it('should have all 6 steps defined', () => {
      expect(wrapper.vm.steps).toHaveLength(6)
      const stepIds = wrapper.vm.steps.map((step: any) => step.id)
      expect(stepIds).toEqual(['source', 'configure', 'process', 'review', 'insights', 'export'])
    })

    it('should display step navigation sidebar', () => {
      const sidebar = wrapper.find('aside.w-64')
      expect(sidebar.exists()).toBe(true)
      expect(sidebar.find('h1').text()).toBe('Manual Content Builder')
    })

    it('should display progress summary', () => {
      const progressSection = wrapper.find('.bg-neutral-50.rounded-xl')
      expect(progressSection.exists()).toBe(true)
      expect(progressSection.text()).toContain('Progress')
      expect(progressSection.text()).toContain('0/6')
    })
  })

  describe('Step Navigation', () => {
    it('should not allow navigation to future steps initially', async () => {
      const stepButtons = wrapper.findAll('[role="button"]')
      
      // Try to click on step 2 (configure)
      await stepButtons[1].trigger('click')
      expect(wrapper.vm.currentStep).toBe(0) // Should still be on step 1
    })

    it('should allow navigation to completed steps', async () => {
      // Mark first step as completed
      wrapper.vm.stepValidation.source = { completed: true }
      wrapper.vm.currentStep = 1
      
      await wrapper.vm.$nextTick()
      
      // Should be able to go back to first step
      const firstStepButton = wrapper.findAll('[role="button"]')[0]
      await firstStepButton.trigger('click')
      expect(wrapper.vm.currentStep).toBe(0)
    })

    it('should show correct step indicators', () => {
      const stepNumbers = wrapper.findAll('.w-8.h-8.rounded-full')
      expect(stepNumbers).toHaveLength(6)
      
      // First step should be current (highlighted)
      expect(stepNumbers[0].classes()).toContain('bg-brand-sage-600')
    })
  })

  describe('Data Management', () => {
    it('should initialize with default wizard data structure', () => {
      expect(wrapper.vm.wizardData).toHaveProperty('source')
      expect(wrapper.vm.wizardData).toHaveProperty('configure')
      expect(wrapper.vm.wizardData).toHaveProperty('processing')
      expect(wrapper.vm.wizardData).toHaveProperty('review')
      expect(wrapper.vm.wizardData).toHaveProperty('insights')
      expect(wrapper.vm.wizardData).toHaveProperty('export')
    })

    it('should update data when handleDataUpdate is called', async () => {
      const testData = {
        source: {
          title: 'Test Title',
          content: 'Test content for validation'
        }
      }
      
      wrapper.vm.handleDataUpdate(testData)
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.wizardData.source.title).toBe('Test Title')
      expect(wrapper.vm.wizardData.source.content).toBe('Test content for validation')
    })

    it('should validate can proceed logic for source step', async () => {
      // Initially should not be able to proceed
      expect(wrapper.vm.canProceed).toBe(false)
      
      // Add valid title and content
      wrapper.vm.wizardData.source.title = 'Valid Title'
      wrapper.vm.wizardData.source.content = 'This is a valid content with more than 200 characters. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.'
      
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.canProceed).toBe(true)
    })
  })

  describe('Draft Management', () => {
    it('should determine when draft can be saved', async () => {
      // Initially no content, cannot save
      expect(wrapper.vm.canSaveDraft).toBe(false)
      
      // Add title only
      wrapper.vm.wizardData.source.title = 'Test Title'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.canSaveDraft).toBe(true)
      
      // Add content
      wrapper.vm.wizardData.source.content = 'Test content'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.canSaveDraft).toBe(true)
    })

    it('should save draft to localStorage', async () => {
      const spy = vi.spyOn(Storage.prototype, 'setItem')
      
      wrapper.vm.wizardData.source.title = 'Test Draft'
      wrapper.vm.wizardData.source.content = 'Draft content'
      
      await wrapper.vm.saveDraft()
      
      expect(spy).toHaveBeenCalledWith(
        'manualContentWizard',
        expect.stringContaining('Test Draft')
      )
    })

    it('should show save success feedback', async () => {
      wrapper.vm.wizardData.source.title = 'Test'
      wrapper.vm.wizardData.source.content = 'Content for testing save feedback'
      
      await wrapper.vm.saveDraft()
      
      expect(wrapper.vm.showSaveSuccess).toBe(true)
      
      // Should hide after timeout
      await new Promise(resolve => setTimeout(resolve, 2100))
      expect(wrapper.vm.showSaveSuccess).toBe(false)
    })
  })

  describe('Step Progression', () => {
    beforeEach(async () => {
      // Set up valid source data
      wrapper.vm.wizardData.source.title = 'Test Document'
      wrapper.vm.wizardData.source.content = 'This is test content with sufficient length to pass validation requirements. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
      await wrapper.vm.$nextTick()
    })

    it('should proceed to next step when conditions are met', async () => {
      expect(wrapper.vm.canProceed).toBe(true)
      
      await wrapper.vm.nextStep()
      
      expect(wrapper.vm.currentStep).toBe(1)
      expect(wrapper.vm.currentStepData.id).toBe('configure')
    })

    it('should mark previous step as completed when proceeding', async () => {
      await wrapper.vm.nextStep()
      
      expect(wrapper.vm.stepValidation.source?.completed).toBe(true)
    })

    it('should allow going back to previous steps', async () => {
      // Go to second step
      await wrapper.vm.nextStep()
      expect(wrapper.vm.currentStep).toBe(1)
      
      // Go back
      await wrapper.vm.previousStep()
      expect(wrapper.vm.currentStep).toBe(0)
    })

    it('should not go back from first step', async () => {
      expect(wrapper.vm.currentStep).toBe(0)
      
      await wrapper.vm.previousStep()
      expect(wrapper.vm.currentStep).toBe(0)
    })

    it('should allow skipping optional steps', async () => {
      // Go to configure step (which is optional)
      await wrapper.vm.nextStep()
      expect(wrapper.vm.currentStep).toBe(1)
      expect(wrapper.vm.currentStepData.canSkip).toBe(true)
      
      await wrapper.vm.skipStep()
      expect(wrapper.vm.currentStep).toBe(2)
      expect(wrapper.vm.stepValidation.configure?.skipped).toBe(true)
    })
  })

  describe('Dynamic Checklist', () => {
    it('should update checklist based on source step data', async () => {
      const checklist = wrapper.vm.dynamicChecklist
      expect(checklist).toHaveLength(3)
      
      // Initially all should be incomplete
      expect(checklist.every((item: any) => !item.completed)).toBe(true)
      
      // Add title
      wrapper.vm.wizardData.source.title = 'Valid Title'
      await wrapper.vm.$nextTick()
      
      const updatedChecklist = wrapper.vm.dynamicChecklist
      expect(updatedChecklist[0].completed).toBe(true) // Title check
      
      // Add content
      wrapper.vm.wizardData.source.content = 'This is sufficient content with more than 200 characters to pass the validation check. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
      await wrapper.vm.$nextTick()
      
      const finalChecklist = wrapper.vm.dynamicChecklist
      expect(finalChecklist[1].completed).toBe(true) // Content check
      expect(finalChecklist[2].completed).toBe(true) // Quality check
    })
  })

  describe('Component Props and Events', () => {
    it('should pass correct props to step components', () => {
      const stepComponent = wrapper.findComponent({ name: 'SourceStep' })
      if (stepComponent.exists()) {
        expect(stepComponent.props('data')).toEqual(wrapper.vm.wizardData)
        expect(stepComponent.props('validation')).toEqual(wrapper.vm.currentStepValidation)
      }
    })

    it('should handle step validation events', async () => {
      const mockValidation = { isValid: true, errors: [] }
      
      wrapper.vm.handleStepValidation(mockValidation)
      
      expect(wrapper.vm.stepValidation.source).toEqual(mockValidation)
    })
  })

  describe('State Restoration', () => {
    it('should restore state from localStorage on mount', async () => {
      const savedState = {
        currentStep: 1,
        data: {
          source: {
            title: 'Restored Title',
            content: 'Restored content with sufficient length to pass validation'
          }
        },
        validation: {
          source: { completed: true }
        },
        timestamp: new Date().toISOString()
      }
      
      localStorage.setItem('manualContentWizard', JSON.stringify(savedState))
      
      // Mount new component to trigger restoration
      const newWrapper = mount(ManualContentWizard, {
        global: {
          plugins: [pinia]
        }
      })
      
      await newWrapper.vm.$nextTick()
      
      expect(newWrapper.vm.currentStep).toBe(1)
      expect(newWrapper.vm.wizardData.source.title).toBe('Restored Title')
      expect(newWrapper.vm.draftLoaded).toBe(true)
      
      newWrapper.unmount()
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid JSON in localStorage gracefully', async () => {
      localStorage.setItem('manualContentWizard', 'invalid json')
      
      // Should not throw error
      expect(() => {
        mount(ManualContentWizard, {
          global: {
            plugins: [pinia]
          }
        })
      }).not.toThrow()
    })

    it('should handle save draft errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Mock localStorage.setItem to throw
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage error')
      })
      
      wrapper.vm.wizardData.source.title = 'Test'
      wrapper.vm.wizardData.source.content = 'Test content'
      
      await wrapper.vm.saveDraft()
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save draft:', expect.any(Error))
      consoleSpy.mockRestore()
    })
  })
})