import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ManualContentWizard from '@/components/ManualContentWizard.vue'
import { useContentStore } from '@/stores/content'
import { useVersionStore } from '@/stores/versions'

describe('Wizard Integration Flow', () => {
  let wrapper: any
  let pinia: any
  let contentStore: any
  let versionStore: any

  beforeEach(async () => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    contentStore = useContentStore()
    versionStore = useVersionStore()
    
    // Clear localStorage
    localStorage.clear()
    
    wrapper = mount(ManualContentWizard, {
      global: {
        plugins: [pinia]
      }
    })
    
    await wrapper.vm.$nextTick()
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  describe('Complete Wizard Flow', () => {
    it('should complete full wizard workflow from source to export', async () => {
      // Step 1: Source Step - Add title and content
      expect(wrapper.vm.currentStep).toBe(0)
      expect(wrapper.vm.currentStepData.id).toBe('source')
      
      const sourceData = {
        source: {
          title: 'Integration Test Document',
          content: 'This is a comprehensive test document for the integration test. '.repeat(50), // ~400 words
          file: null
        }
      }
      
      wrapper.vm.handleDataUpdate(sourceData)
      await wrapper.vm.$nextTick()
      
      // Verify source step is valid
      expect(wrapper.vm.canProceed).toBe(true)
      
      // Proceed to configure step
      await wrapper.vm.nextStep()
      expect(wrapper.vm.currentStep).toBe(1)
      expect(wrapper.vm.currentStepData.id).toBe('configure')
      
      // Step 2: Configure Step - Set chunking parameters
      const configureData = {
        configure: {
          chunkingMethod: 'word-based',
          chunkSize: 300,
          overlap: 15,
          autoTagging: true
        }
      }
      
      wrapper.vm.handleDataUpdate(configureData)
      await wrapper.vm.$nextTick()
      
      // Proceed to process step
      await wrapper.vm.nextStep()
      expect(wrapper.vm.currentStep).toBe(2)
      expect(wrapper.vm.currentStepData.id).toBe('process')
      
      // Step 3: Process Step - Generate chunks
      const processData = {
        processing: {
          status: 'completed',
          chunks: [
            {
              chunk_id: 'test_chunk_1',
              content: 'First chunk content with sufficient length for testing.',
              word_count: 10,
              tags: ['test', 'integration'],
              metadata: { processing_method: 'word-based' }
            },
            {
              chunk_id: 'test_chunk_2', 
              content: 'Second chunk content with different content for validation.',
              word_count: 9,
              tags: ['test', 'validation'],
              metadata: { processing_method: 'word-based' }
            }
          ],
          stats: { created: 2, failed: 0, warnings: 0 }
        }
      }
      
      wrapper.vm.handleDataUpdate(processData)
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.canProceed).toBe(true)
      
      // Proceed to review step
      await wrapper.vm.nextStep()
      expect(wrapper.vm.currentStep).toBe(3)
      expect(wrapper.vm.currentStepData.id).toBe('review')
      
      // Step 4: Review Step - Review and potentially edit chunks
      const reviewData = {
        review: {
          chunks: processData.processing.chunks,
          filters: { search: '', tags: [], quality: 'all' }
        }
      }
      
      wrapper.vm.handleDataUpdate(reviewData)
      await wrapper.vm.$nextTick()
      
      // Proceed to insights step
      await wrapper.vm.nextStep()
      expect(wrapper.vm.currentStep).toBe(4)
      expect(wrapper.vm.currentStepData.id).toBe('insights')
      
      // Step 5: Insights Step - Quality analysis
      const insightsData = {
        insights: {
          analyzed: true,
          scores: {
            overall: 85,
            vectorReadiness: 90,
            platformCompatibility: 88
          },
          recommendations: ['Good chunk sizes', 'Well-structured content']
        }
      }
      
      wrapper.vm.handleDataUpdate(insightsData)
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.canProceed).toBe(true)
      
      // Proceed to export step
      await wrapper.vm.nextStep()
      expect(wrapper.vm.currentStep).toBe(5)
      expect(wrapper.vm.currentStepData.id).toBe('export')
      
      // Step 6: Export Step - Final export configuration
      const exportData = {
        export: {
          target: 'azure-vector-store',
          options: {
            includeMetadata: true,
            schemaVersion: 'v1',
            fileNaming: 'integration-test-chunks'
          },
          preview: JSON.stringify(processData.processing.chunks, null, 2)
        }
      }
      
      wrapper.vm.handleDataUpdate(exportData)
      await wrapper.vm.$nextTick()
      
      // Verify final state
      expect(wrapper.vm.wizardData.source.title).toBe('Integration Test Document')
      expect(wrapper.vm.wizardData.configure.chunkSize).toBe(300)
      expect(wrapper.vm.wizardData.processing.chunks).toHaveLength(2)
      expect(wrapper.vm.wizardData.insights.analyzed).toBe(true)
      expect(wrapper.vm.wizardData.export.target).toBe('azure-vector-store')
    })

    it('should handle step skipping for optional steps', async () => {
      // Set up valid source data
      const sourceData = {
        source: {
          title: 'Skip Test Document',
          content: 'Content for testing skip functionality. '.repeat(40),
          file: null
        }
      }
      
      wrapper.vm.handleDataUpdate(sourceData)
      await wrapper.vm.nextStep() // Go to configure step
      
      expect(wrapper.vm.currentStep).toBe(1)
      expect(wrapper.vm.currentStepData.canSkip).toBe(true)
      
      // Skip configure step
      await wrapper.vm.skipStep()
      
      expect(wrapper.vm.currentStep).toBe(2) // Should be on process step
      expect(wrapper.vm.stepValidation.configure?.skipped).toBe(true)
      expect(wrapper.vm.stepValidation.configure?.completed).toBe(true)
    })

    it('should maintain data consistency across step navigation', async () => {
      // Add initial data
      const initialData = {
        source: {
          title: 'Consistency Test',
          content: 'Test content for navigation consistency checks. '.repeat(30),
          file: null
        }
      }
      
      wrapper.vm.handleDataUpdate(initialData)
      await wrapper.vm.nextStep() // Go to step 2
      
      // Add configuration data
      const configData = {
        configure: {
          chunkingMethod: 'character-based',
          chunkSize: 1000,
          overlap: 20
        }
      }
      
      wrapper.vm.handleDataUpdate(configData)
      
      // Navigate back to step 1
      await wrapper.vm.previousStep()
      expect(wrapper.vm.currentStep).toBe(0)
      
      // Verify data is still there
      expect(wrapper.vm.wizardData.source.title).toBe('Consistency Test')
      
      // Navigate forward again
      await wrapper.vm.nextStep()
      expect(wrapper.vm.currentStep).toBe(1)
      
      // Verify configuration data is preserved
      expect(wrapper.vm.wizardData.configure.chunkingMethod).toBe('character-based')
      expect(wrapper.vm.wizardData.configure.chunkSize).toBe(1000)
    })
  })

  describe('Draft Management Integration', () => {
    it('should save and restore complete wizard state', async () => {
      // Create a complete wizard state
      const completeState = {
        source: {
          title: 'Draft Test Document',
          content: 'Content for draft testing functionality. '.repeat(35),
          file: null
        },
        configure: {
          chunkingMethod: 'word-based',
          chunkSize: 400,
          overlap: 10,
          autoTagging: true
        },
        processing: {
          status: 'completed',
          chunks: [
            {
              chunk_id: 'draft_chunk_1',
              content: 'Draft chunk content for testing.',
              word_count: 6,
              tags: ['draft', 'test']
            }
          ]
        }
      }
      
      wrapper.vm.handleDataUpdate(completeState)
      wrapper.vm.currentStep = 2 // On process step
      
      // Save draft
      await wrapper.vm.saveDraft()
      
      expect(wrapper.vm.showSaveSuccess).toBe(true)
      
      // Verify localStorage was updated
      const savedData = localStorage.getItem('manualContentWizard')
      expect(savedData).toBeTruthy()
      
      const parsed = JSON.parse(savedData || '{}')
      expect(parsed.currentStep).toBe(2)
      expect(parsed.data.source.title).toBe('Draft Test Document')
      expect(parsed.data.configure.chunkSize).toBe(400)
    })

    it('should integrate with version control system', async () => {
      const versionSpy = vi.spyOn(versionStore, 'saveVersion')
      
      // Set up content for version saving
      const contentWithChunks = {
        source: {
          title: 'Version Test Document',
          content: 'Content for version control testing. '.repeat(40),
          file: null
        },
        processing: {
          status: 'completed',
          chunks: [
            {
              chunk_id: 'version_chunk_1',
              content: 'Version test chunk content.',
              word_count: 5,
              tags: ['version', 'test'],
              metadata: { created_at: new Date().toISOString() }
            }
          ]
        }
      }
      
      wrapper.vm.handleDataUpdate(contentWithChunks)
      
      // Save draft (which should also save to version control)
      await wrapper.vm.saveDraft()
      
      // Verify version was saved
      expect(versionSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          chunks: expect.arrayContaining([
            expect.objectContaining({
              chunk_id: expect.stringContaining('version_chunk_1'),
              content: 'Version test chunk content.'
            })
          ])
        }),
        expect.stringContaining('Version Test Document'),
        false // Not an auto-save
      )
    })
  })

  describe('Error Handling and Recovery', () => {
    it('should handle validation errors gracefully', async () => {
      // Try to proceed without valid data
      expect(wrapper.vm.canProceed).toBe(false)
      
      // Attempt to proceed anyway
      await wrapper.vm.nextStep()
      
      // Should still be on first step
      expect(wrapper.vm.currentStep).toBe(0)
    })

    it('should recover from processing errors', async () => {
      // Set up valid source data
      const sourceData = {
        source: {
          title: 'Error Recovery Test',
          content: 'Content for error recovery testing. '.repeat(50),
          file: null
        }
      }
      
      wrapper.vm.handleDataUpdate(sourceData)
      await wrapper.vm.nextStep() // Go to configure
      await wrapper.vm.nextStep() // Go to process
      
      // Simulate processing error
      const errorData = {
        processing: {
          status: 'error',
          error: 'Mock processing error',
          chunks: [],
          stats: { created: 0, failed: 1, warnings: 0 }
        }
      }
      
      wrapper.vm.handleDataUpdate(errorData)
      await wrapper.vm.$nextTick()
      
      // Should not be able to proceed with error
      expect(wrapper.vm.canProceed).toBe(false)
      
      // Fix the error by updating to completed status
      const fixedData = {
        processing: {
          status: 'completed',
          chunks: [
            {
              chunk_id: 'recovered_chunk',
              content: 'Recovered chunk after error.',
              word_count: 5,
              tags: ['recovered']
            }
          ],
          stats: { created: 1, failed: 0, warnings: 0 }
        }
      }
      
      wrapper.vm.handleDataUpdate(fixedData)
      await wrapper.vm.$nextTick()
      
      // Should now be able to proceed
      expect(wrapper.vm.canProceed).toBe(true)
    })

    it('should handle localStorage corruption gracefully', async () => {
      // Set invalid JSON in localStorage
      localStorage.setItem('manualContentWizard', 'invalid json data')
      
      // Create new wizard instance
      const newWrapper = mount(ManualContentWizard, {
        global: {
          plugins: [pinia]
        }
      })
      
      await newWrapper.vm.$nextTick()
      
      // Should initialize with defaults despite corrupted localStorage
      expect(newWrapper.vm.currentStep).toBe(0)
      expect(newWrapper.vm.wizardData.source.title).toBe('')
      
      newWrapper.unmount()
    })
  })

  describe('Step Validation Integration', () => {
    it('should validate step completion requirements', async () => {
      // Verify source step validation
      expect(wrapper.vm.isStepCompleted(0)).toBe(false)
      
      // Complete source step
      const sourceData = {
        source: {
          title: 'Validation Test',
          content: 'Content for step validation testing. '.repeat(30),
          file: null
        }
      }
      
      wrapper.vm.handleDataUpdate(sourceData)
      wrapper.vm.stepValidation.source = { completed: true }
      
      expect(wrapper.vm.isStepCompleted(0)).toBe(true)
    })

    it('should update progress calculation correctly', async () => {
      expect(wrapper.vm.completedSteps).toBe(0)
      expect(wrapper.vm.progressPercentage).toBe(0)
      
      // Complete first step
      wrapper.vm.stepValidation.source = { completed: true }
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.completedSteps).toBe(1)
      expect(wrapper.vm.progressPercentage).toBeCloseTo(16.67, 1) // 1/6 * 100
      
      // Complete second step
      wrapper.vm.stepValidation.configure = { completed: true }
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.completedSteps).toBe(2)
      expect(wrapper.vm.progressPercentage).toBeCloseTo(33.33, 1) // 2/6 * 100
    })

    it('should enforce step dependencies', async () => {
      // Try to navigate to step 3 without completing prerequisites
      wrapper.vm.navigateToStep(2)
      
      // Should not allow navigation
      expect(wrapper.vm.currentStep).toBe(0)
      
      // Complete and mark steps as completed
      wrapper.vm.stepValidation.source = { completed: true }
      wrapper.vm.stepValidation.configure = { completed: true }
      wrapper.vm.currentStep = 2
      
      // Now navigation should work
      wrapper.vm.navigateToStep(1)
      expect(wrapper.vm.currentStep).toBe(1)
    })
  })

  describe('Data Persistence Integration', () => {
    it('should auto-save wizard state during use', async () => {
      const autoSaveSpy = vi.spyOn(wrapper.vm, 'autoSave')
      
      // Make a data change
      const dataChange = {
        source: {
          title: 'Auto-save Test',
          content: 'Testing auto-save functionality',
          file: null
        }
      }
      
      wrapper.vm.handleDataUpdate(dataChange)
      
      // Wait for debounced auto-save
      await new Promise(resolve => setTimeout(resolve, 600))
      
      expect(autoSaveSpy).toHaveBeenCalled()
    })

    it('should maintain state across component remounts', async () => {
      // Set up initial state
      const initialData = {
        source: {
          title: 'Persistence Test',
          content: 'Testing state persistence across remounts. '.repeat(25),
          file: null
        },
        configure: {
          chunkingMethod: 'word-based',
          chunkSize: 350,
          overlap: 12
        }
      }
      
      wrapper.vm.handleDataUpdate(initialData)
      wrapper.vm.currentStep = 1
      await wrapper.vm.saveDraft() // Save to localStorage
      
      // Unmount and remount component
      wrapper.unmount()
      
      const newWrapper = mount(ManualContentWizard, {
        global: {
          plugins: [pinia]
        }
      })
      
      await newWrapper.vm.$nextTick()
      
      // Verify state was restored
      expect(newWrapper.vm.currentStep).toBe(1)
      expect(newWrapper.vm.wizardData.source.title).toBe('Persistence Test')
      expect(newWrapper.vm.wizardData.configure.chunkSize).toBe(350)
      expect(newWrapper.vm.draftLoaded).toBe(true)
      
      newWrapper.unmount()
    })
  })
})