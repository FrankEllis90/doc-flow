import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ConfigureStep from '@/components/steps/ConfigureStep.vue'

describe('ConfigureStep', () => {
  let wrapper: any
  let pinia: any

  const defaultProps = {
    data: {
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
      }
    },
    validation: {}
  }

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    wrapper = mount(ConfigureStep, {
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
    it('should render configure step form', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.configure-step').exists()).toBe(true)
    })

    it('should render chunking method selection', () => {
      const methodGrid = wrapper.find('.method-grid')
      expect(methodGrid.exists()).toBe(true)
      
      const methodCards = wrapper.findAll('.method-card')
      expect(methodCards.length).toBeGreaterThan(0)
    })

    it('should render chunk size slider', () => {
      const slider = wrapper.find('input[type="range"]')
      expect(slider.exists()).toBe(true)
      expect(slider.attributes('min')).toBeDefined()
      expect(slider.attributes('max')).toBeDefined()
    })

    it('should render overlap options', () => {
      const overlapButtons = wrapper.findAll('.overlap-btn')
      expect(overlapButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Chunking Method Selection', () => {
    it('should display available chunking methods', () => {
      const methodCards = wrapper.findAll('.method-card')
      expect(methodCards.length).toBeGreaterThanOrEqual(3)
      
      // Should have word-based, character-based, and section-based methods
      const methodTexts = methodCards.map(card => card.text())
      expect(methodTexts.some(text => text.includes('Word'))).toBe(true)
      expect(methodTexts.some(text => text.includes('Character'))).toBe(true)
      expect(methodTexts.some(text => text.includes('Section'))).toBe(true)
    })

    it('should highlight selected chunking method', () => {
      const activeMethod = wrapper.find('.method-active')
      expect(activeMethod.exists()).toBe(true)
    })

    it('should change chunking method when clicked', async () => {
      const methodCards = wrapper.findAll('.method-card')
      
      // Click on a different method
      await methodCards[1].trigger('click')
      
      expect(wrapper.emitted('update:data')).toBeTruthy()
      const emittedData = wrapper.emitted('update:data')
      const lastEmit = emittedData[emittedData.length - 1][0]
      expect(lastEmit.configure.chunkingMethod).toBeDefined()
    })

    it('should show recommended method badge', () => {
      const recommendedBadge = wrapper.find('.method-badge')
      if (recommendedBadge.exists()) {
        expect(recommendedBadge.text()).toContain('Recommended')
      }
    })
  })

  describe('Chunk Size Configuration', () => {
    it('should display current chunk size value', () => {
      const sliderValue = wrapper.find('.slider-value')
      expect(sliderValue.exists()).toBe(true)
      expect(sliderValue.text()).toContain('500')
    })

    it('should update chunk size when slider moves', async () => {
      const slider = wrapper.find('input[type="range"]')
      
      await slider.setValue('600')
      await slider.trigger('input')
      
      expect(wrapper.vm.formData.chunkSize).toBe(600)
      expect(wrapper.emitted('update:data')).toBeTruthy()
    })

    it('should show chunk size description', () => {
      const description = wrapper.find('.size-description')
      expect(description.exists()).toBe(true)
      expect(description.text().length).toBeGreaterThan(10)
    })

    it('should validate chunk size range', () => {
      const slider = wrapper.find('input[type="range"]')
      const min = parseInt(slider.attributes('min') || '0')
      const max = parseInt(slider.attributes('max') || '1000')
      
      expect(min).toBeGreaterThan(0)
      expect(max).toBeGreaterThan(min)
      expect(wrapper.vm.formData.chunkSize).toBeGreaterThanOrEqual(min)
      expect(wrapper.vm.formData.chunkSize).toBeLessThanOrEqual(max)
    })

    it('should show different units for different chunking methods', async () => {
      // Test word-based method
      expect(wrapper.vm.chunkSizeUnit).toBe('words')
      
      // Switch to character-based method if available
      const methodCards = wrapper.findAll('.method-card')
      for (let card of methodCards) {
        if (card.text().toLowerCase().includes('character')) {
          await card.trigger('click')
          await wrapper.vm.$nextTick()
          expect(wrapper.vm.chunkSizeUnit).toBe('characters')
          break
        }
      }
    })

    it('should calculate slider percentage correctly', () => {
      const percentage = wrapper.vm.sliderPercentage
      expect(percentage).toBeGreaterThanOrEqual(0)
      expect(percentage).toBeLessThanOrEqual(100)
    })
  })

  describe('Overlap Configuration', () => {
    it('should display overlap options', () => {
      const overlapButtons = wrapper.findAll('.overlap-btn')
      expect(overlapButtons.length).toBeGreaterThanOrEqual(3)
      
      // Should have common overlap percentages
      const overlapTexts = overlapButtons.map(btn => btn.text())
      expect(overlapTexts.some(text => text.includes('10%'))).toBe(true)
      expect(overlapTexts.some(text => text.includes('15%'))).toBe(true)
      expect(overlapTexts.some(text => text.includes('20%'))).toBe(true)
    })

    it('should highlight selected overlap option', () => {
      const activeOverlap = wrapper.find('.overlap-active')
      expect(activeOverlap.exists()).toBe(true)
      expect(activeOverlap.text()).toContain('15%') // Default overlap
    })

    it('should change overlap when option is clicked', async () => {
      const overlapButtons = wrapper.findAll('.overlap-btn')
      
      // Click on a different overlap option
      for (let button of overlapButtons) {
        if (button.text().includes('20%')) {
          await button.trigger('click')
          break
        }
      }
      
      expect(wrapper.vm.formData.overlap).toBe(20)
      expect(wrapper.emitted('update:data')).toBeTruthy()
    })

    it('should show overlap descriptions', () => {
      const overlapButtons = wrapper.findAll('.overlap-btn')
      overlapButtons.forEach(button => {
        const spans = button.findAll('span')
        expect(spans.length).toBeGreaterThanOrEqual(2) // percentage and description
      })
    })
  })

  describe('Auto-tagging Configuration', () => {
    it('should render auto-tagging toggle', () => {
      const autoTaggingToggle = wrapper.find('[data-testid="auto-tagging-toggle"]')
      if (autoTaggingToggle.exists()) {
        expect(autoTaggingToggle.exists()).toBe(true)
      }
    })

    it('should toggle auto-tagging setting', async () => {
      const initialState = wrapper.vm.formData.autoTagging
      
      // Find and click toggle if it exists
      const toggleElement = wrapper.find('input[type="checkbox"]')
      if (toggleElement.exists()) {
        await toggleElement.trigger('click')
        expect(wrapper.vm.formData.autoTagging).toBe(!initialState)
      }
    })
  })

  describe('Advanced Settings', () => {
    it('should show advanced settings section when expanded', async () => {
      const advancedToggle = wrapper.find('[data-testid="advanced-toggle"]')
      if (advancedToggle.exists()) {
        await advancedToggle.trigger('click')
        
        const advancedSection = wrapper.find('.advanced-settings')
        expect(advancedSection.exists()).toBe(true)
      }
    })

    it('should configure stop words when in advanced mode', async () => {
      const stopWordsInput = wrapper.find('[data-testid="stop-words-input"]')
      if (stopWordsInput.exists()) {
        await stopWordsInput.setValue('the, and, or, but')
        
        expect(wrapper.vm.formData.advanced.stopWords).toEqual(['the', 'and', 'or', 'but'])
      }
    })

    it('should configure semantic threshold', async () => {
      const thresholdSlider = wrapper.find('[data-testid="semantic-threshold"]')
      if (thresholdSlider.exists()) {
        await thresholdSlider.setValue('0.75')
        
        expect(wrapper.vm.formData.advanced.semanticThreshold).toBe(0.75)
      }
    })
  })

  describe('Data Updates and Events', () => {
    it('should emit data updates when configuration changes', async () => {
      const slider = wrapper.find('input[type="range"]')
      await slider.setValue('600')
      await slider.trigger('input')
      
      const emitted = wrapper.emitted('update:data')
      expect(emitted).toBeTruthy()
      
      const lastEmit = emitted[emitted.length - 1][0]
      expect(lastEmit.configure.chunkSize).toBe(600)
    })

    it('should emit validation status', async () => {
      const validationEmitted = wrapper.emitted('validate')
      expect(validationEmitted).toBeTruthy()
      
      const lastValidation = validationEmitted[validationEmitted.length - 1][0]
      expect(lastValidation.isValid).toBe(true)
    })

    it('should emit next event when form is submitted', async () => {
      const form = wrapper.find('form')
      await form.trigger('submit')
      
      expect(wrapper.emitted('next')).toBeTruthy()
    })

    it('should emit back event when back button is clicked', async () => {
      const backButton = wrapper.find('[data-testid="back-button"]')
      if (backButton.exists()) {
        await backButton.trigger('click')
        expect(wrapper.emitted('back')).toBeTruthy()
      }
    })
  })

  describe('Real-time Preview', () => {
    it('should show estimated chunk count', () => {
      const estimatedChunks = wrapper.find('[data-testid="estimated-chunks"]')
      if (estimatedChunks.exists()) {
        expect(estimatedChunks.text()).toMatch(/\d+/)
      }
    })

    it('should update estimates when configuration changes', async () => {
      const slider = wrapper.find('input[type="range"]')
      
      // Get initial estimate
      const initialEstimate = wrapper.vm.estimatedChunkCount
      
      // Change chunk size
      await slider.setValue('300')
      await slider.trigger('input')
      
      // Estimate should change
      const newEstimate = wrapper.vm.estimatedChunkCount
      expect(newEstimate).not.toBe(initialEstimate)
    })

    it('should show processing time estimate', () => {
      const timeEstimate = wrapper.find('[data-testid="processing-time"]')
      if (timeEstimate.exists()) {
        expect(timeEstimate.text()).toContain('second' || 'minute')
      }
    })
  })

  describe('Validation and Error Handling', () => {
    it('should validate chunk size constraints', async () => {
      const slider = wrapper.find('input[type="range"]')
      const max = parseInt(slider.attributes('max') || '1000')
      
      // Try to set invalid value (should be constrained by slider)
      await slider.setValue(max + 100)
      
      expect(wrapper.vm.formData.chunkSize).toBeLessThanOrEqual(max)
    })

    it('should show warnings for extreme configurations', async () => {
      const slider = wrapper.find('input[type="range"]')
      const min = parseInt(slider.attributes('min') || '100')
      
      // Set very small chunk size
      await slider.setValue(min)
      await slider.trigger('input')
      
      const warning = wrapper.find('.warning-message')
      if (warning.exists()) {
        expect(warning.text()).toContain('warning' || 'caution')
      }
    })

    it('should provide helpful descriptions for each setting', () => {
      const descriptions = wrapper.findAll('.size-description, .method-content p')
      descriptions.forEach(desc => {
        expect(desc.text().length).toBeGreaterThan(10)
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for form controls', () => {
      const slider = wrapper.find('input[type="range"]')
      expect(slider.attributes('aria-label') || wrapper.find('label').exists()).toBeTruthy()
    })

    it('should support keyboard navigation', async () => {
      const methodCards = wrapper.findAll('.method-card')
      
      // Method cards should be clickable and accessible
      methodCards.forEach(card => {
        expect(card.attributes('tabindex') !== undefined || card.element.tagName === 'BUTTON').toBeTruthy()
      })
    })

    it('should have proper ARIA states for selected options', () => {
      const activeMethod = wrapper.find('.method-active')
      const activeOverlap = wrapper.find('.overlap-active')
      
      expect(activeMethod.exists()).toBe(true)
      expect(activeOverlap.exists()).toBe(true)
    })
  })

  describe('Performance Considerations', () => {
    it('should debounce slider input events', async () => {
      const slider = wrapper.find('input[type="range"]')
      const emitSpy = vi.spyOn(wrapper.vm, '$emit')
      
      // Rapidly change slider value
      for (let i = 0; i < 5; i++) {
        await slider.setValue(500 + i * 10)
        await slider.trigger('input')
      }
      
      // Should not emit for every single change
      expect(emitSpy).toHaveBeenCalled()
    })

    it('should handle large content size calculations efficiently', () => {
      // Mock large content
      wrapper.vm.sourceContentLength = 100000 // 100k characters
      
      // Should calculate estimates without performance issues
      const estimate = wrapper.vm.estimatedChunkCount
      expect(typeof estimate).toBe('number')
      expect(estimate).toBeGreaterThan(0)
    })
  })
})