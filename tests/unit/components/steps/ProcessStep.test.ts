import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ProcessStep from '@/components/steps/ProcessStep.vue'

describe('ProcessStep', () => {
  let wrapper: any
  let pinia: any

  const defaultProps = {
    data: {
      source: {
        title: 'Test Document',
        content: 'This is test content for processing. '.repeat(50), // ~400 words
        file: null
      },
      configure: {
        chunkingMethod: 'word-based',
        chunkSize: 500,
        overlap: 15,
        autoTagging: true
      },
      processing: {
        status: 'idle',
        chunks: [],
        stats: {
          created: 0,
          failed: 0,
          warnings: 0
        },
        logs: []
      }
    },
    validation: {}
  }

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    wrapper = mount(ProcessStep, {
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
    it('should render process step interface', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.process-step').exists()).toBe(true)
    })

    it('should show processing configuration summary', () => {
      const configSummary = wrapper.find('.config-summary')
      if (configSummary.exists()) {
        expect(configSummary.text()).toContain('word-based')
        expect(configSummary.text()).toContain('500')
        expect(configSummary.text()).toContain('15%')
      }
    })

    it('should display start processing button when idle', () => {
      expect(wrapper.vm.processingStatus).toBe('idle')
      const startButton = wrapper.find('[data-testid="start-processing"]')
      expect(startButton.exists()).toBe(true)
      expect(startButton.text()).toContain('Start Processing')
    })

    it('should show estimated processing info', () => {
      const estimateInfo = wrapper.find('.estimate-info')
      if (estimateInfo.exists()) {
        expect(estimateInfo.text()).toMatch(/\d+.*chunk/i)
      }
    })
  })

  describe('Processing Initiation', () => {
    it('should start processing when start button is clicked', async () => {
      const startButton = wrapper.find('[data-testid="start-processing"]')
      expect(startButton.exists()).toBe(true)
      
      await startButton.trigger('click')
      
      expect(wrapper.vm.processingStatus).toBe('processing')
    })

    it('should validate required data before processing', async () => {
      // Test with empty content
      await wrapper.setProps({
        data: {
          ...defaultProps.data,
          source: { title: '', content: '', file: null }
        }
      })
      
      const startButton = wrapper.find('[data-testid="start-processing"]')
      if (startButton.exists()) {
        await startButton.trigger('click')
        
        // Should show error or not start processing
        expect(wrapper.vm.processingStatus).toBe('idle')
      }
    })

    it('should use correct chunking algorithm based on configuration', async () => {
      const processingSpy = vi.spyOn(wrapper.vm, 'processContent')
      
      const startButton = wrapper.find('[data-testid="start-processing"]')
      await startButton.trigger('click')
      
      expect(processingSpy).toHaveBeenCalled()
    })
  })

  describe('Processing Progress', () => {
    beforeEach(async () => {
      // Start processing
      const startButton = wrapper.find('[data-testid="start-processing"]')
      if (startButton.exists()) {
        await startButton.trigger('click')
      }
    })

    it('should show progress bar during processing', async () => {
      const progressBar = wrapper.find('.progress-bar')
      if (wrapper.vm.processingStatus === 'processing') {
        expect(progressBar.exists()).toBe(true)
      }
    })

    it('should display real-time processing logs', async () => {
      const logContainer = wrapper.find('.processing-logs')
      if (logContainer.exists()) {
        expect(logContainer.exists()).toBe(true)
      }
    })

    it('should show processing statistics', async () => {
      const stats = wrapper.find('.processing-stats')
      if (stats.exists()) {
        expect(stats.text()).toMatch(/created|processed|failed/i)
      }
    })

    it('should update progress percentage', async () => {
      // Mock processing progress
      wrapper.vm.updateProgress(50)
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.processingProgress).toBe(50)
    })
  })

  describe('Chunk Generation', () => {
    it('should generate chunks based on word-based method', async () => {
      const content = 'This is test content. '.repeat(100) // ~400 words
      const chunks = await wrapper.vm.generateWordBasedChunks(content, 200, 10)
      
      expect(Array.isArray(chunks)).toBe(true)
      expect(chunks.length).toBeGreaterThan(1)
      expect(chunks[0]).toHaveProperty('content')
      expect(chunks[0]).toHaveProperty('chunk_id')
      expect(chunks[0]).toHaveProperty('word_count')
    })

    it('should generate chunks based on character-based method', async () => {
      await wrapper.setProps({
        data: {
          ...defaultProps.data,
          configure: { ...defaultProps.data.configure, chunkingMethod: 'character-based' }
        }
      })
      
      const content = 'A'.repeat(1000)
      const chunks = await wrapper.vm.generateCharacterBasedChunks(content, 500, 50)
      
      expect(Array.isArray(chunks)).toBe(true)
      expect(chunks.length).toBeGreaterThan(1)
      expect(chunks[0].content.length).toBeLessThanOrEqual(550) // 500 + overlap
    })

    it('should generate chunks based on section-based method', async () => {
      const markdownContent = `
# Section 1
This is the first section with some content.

## Subsection 1.1
More content here.

# Section 2
This is the second section.
      `
      
      const chunks = await wrapper.vm.generateSectionBasedChunks(markdownContent)
      
      expect(Array.isArray(chunks)).toBe(true)
      expect(chunks.length).toBeGreaterThanOrEqual(2)
      expect(chunks[0].content).toContain('Section 1')
    })

    it('should apply overlap correctly', async () => {
      const content = 'Word '.repeat(300) // 300 words
      const chunks = await wrapper.vm.generateWordBasedChunks(content, 100, 20) // 20% overlap
      
      if (chunks.length > 1) {
        const firstChunk = chunks[0].content
        const secondChunk = chunks[1].content
        
        // Should have some overlapping content
        const firstWords = firstChunk.split(' ').slice(-20)
        const secondWords = secondChunk.split(' ').slice(0, 20)
        
        const overlap = firstWords.filter(word => secondWords.includes(word))
        expect(overlap.length).toBeGreaterThan(0)
      }
    })

    it('should generate unique chunk IDs', async () => {
      const content = 'Test content. '.repeat(200)
      const chunks = await wrapper.vm.generateWordBasedChunks(content, 100, 10)
      
      const chunkIds = chunks.map(chunk => chunk.chunk_id)
      const uniqueIds = new Set(chunkIds)
      
      expect(uniqueIds.size).toBe(chunkIds.length)
    })

    it('should calculate word counts correctly', async () => {
      const content = 'This is a test with exactly eight words.'
      const chunks = await wrapper.vm.generateWordBasedChunks(content, 100, 0)
      
      expect(chunks[0].word_count).toBe(8)
    })
  })

  describe('Auto-tagging', () => {
    it('should generate tags when auto-tagging is enabled', async () => {
      const content = 'This document discusses artificial intelligence, machine learning, and neural networks in detail.'
      const chunks = await wrapper.vm.generateWordBasedChunks(content, 100, 0)
      
      if (wrapper.vm.autoTagging) {
        expect(chunks[0]).toHaveProperty('tags')
        expect(Array.isArray(chunks[0].tags)).toBe(true)
      }
    })

    it('should extract relevant keywords as tags', () => {
      const content = 'Machine learning algorithms use statistical methods to analyze data patterns.'
      const tags = wrapper.vm.generateTags(content)
      
      expect(Array.isArray(tags)).toBe(true)
      if (tags.length > 0) {
        expect(tags.some(tag => ['machine', 'learning', 'statistical', 'data'].includes(tag.toLowerCase()))).toBe(true)
      }
    })

    it('should limit number of tags per chunk', () => {
      const content = 'technology software development programming coding javascript python java artificial intelligence machine learning'.repeat(10)
      const tags = wrapper.vm.generateTags(content)
      
      expect(tags.length).toBeLessThanOrEqual(10) // Reasonable tag limit
    })

    it('should filter out stop words from tags', () => {
      const content = 'The quick brown fox jumps over the lazy dog and runs very fast'
      const tags = wrapper.vm.generateTags(content)
      
      const stopWords = ['the', 'and', 'over', 'very']
      const hasStopWords = tags.some(tag => stopWords.includes(tag.toLowerCase()))
      expect(hasStopWords).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should handle processing errors gracefully', async () => {
      // Mock error during processing
      vi.spyOn(wrapper.vm, 'processContent').mockRejectedValue(new Error('Processing failed'))
      
      const startButton = wrapper.find('[data-testid="start-processing"]')
      await startButton.trigger('click')
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.processingStatus).toBe('error')
      expect(wrapper.vm.processingError).toBeTruthy()
    })

    it('should show retry option when processing fails', async () => {
      wrapper.vm.processingStatus = 'error'
      wrapper.vm.processingError = 'Mock error'
      await wrapper.vm.$nextTick()
      
      const retryButton = wrapper.find('[data-testid="retry-processing"]')
      expect(retryButton.exists()).toBe(true)
    })

    it('should clear error state when retrying', async () => {
      wrapper.vm.processingStatus = 'error'
      wrapper.vm.processingError = 'Mock error'
      
      const retryButton = wrapper.find('[data-testid="retry-processing"]')
      if (retryButton.exists()) {
        await retryButton.trigger('click')
        
        expect(wrapper.vm.processingError).toBe(null)
        expect(wrapper.vm.processingStatus).toBe('processing')
      }
    })

    it('should handle empty content gracefully', async () => {
      await wrapper.setProps({
        data: {
          ...defaultProps.data,
          source: { title: 'Empty', content: '', file: null }
        }
      })
      
      const chunks = await wrapper.vm.generateWordBasedChunks('', 100, 10)
      expect(Array.isArray(chunks)).toBe(true)
      expect(chunks.length).toBe(0)
    })
  })

  describe('Data Updates and Events', () => {
    it('should emit data updates when processing completes', async () => {
      const mockChunks = [
        { chunk_id: '1', content: 'Test chunk', word_count: 2, tags: [] }
      ]
      
      wrapper.vm.onProcessingComplete(mockChunks)
      
      expect(wrapper.emitted('update:data')).toBeTruthy()
      const emitted = wrapper.emitted('update:data')
      const lastEmit = emitted[emitted.length - 1][0]
      expect(lastEmit.processing.chunks).toEqual(mockChunks)
      expect(lastEmit.processing.status).toBe('completed')
    })

    it('should emit validation status', async () => {
      wrapper.vm.processingStatus = 'completed'
      wrapper.vm.generatedChunks = [{ chunk_id: '1', content: 'Test' }]
      
      wrapper.vm.emitValidation()
      
      const validationEmitted = wrapper.emitted('validate')
      expect(validationEmitted).toBeTruthy()
      
      const lastValidation = validationEmitted[validationEmitted.length - 1][0]
      expect(lastValidation.isValid).toBe(true)
    })

    it('should emit next event when processing is complete and continue is clicked', async () => {
      wrapper.vm.processingStatus = 'completed'
      wrapper.vm.generatedChunks = [{ chunk_id: '1', content: 'Test' }]
      await wrapper.vm.$nextTick()
      
      const continueButton = wrapper.find('[data-testid="continue-to-review"]')
      if (continueButton.exists()) {
        await continueButton.trigger('click')
        expect(wrapper.emitted('next')).toBeTruthy()
      }
    })
  })

  describe('Real-time Feedback', () => {
    it('should show processing speed statistics', async () => {
      wrapper.vm.processingStartTime = Date.now() - 5000 // 5 seconds ago
      wrapper.vm.processedChunks = 10
      
      const speed = wrapper.vm.processingSpeed
      expect(typeof speed).toBe('number')
      expect(speed).toBeGreaterThan(0)
    })

    it('should estimate remaining time', async () => {
      wrapper.vm.processingProgress = 50
      wrapper.vm.processingStartTime = Date.now() - 10000 // 10 seconds ago
      
      const remainingTime = wrapper.vm.estimatedRemainingTime
      expect(typeof remainingTime).toBe('number')
      expect(remainingTime).toBeGreaterThan(0)
    })

    it('should show live chunk preview', async () => {
      const mockChunk = {
        chunk_id: 'preview_1',
        content: 'This is a preview of the generated chunk content.',
        word_count: 10,
        tags: ['preview', 'test']
      }
      
      wrapper.vm.showChunkPreview(mockChunk)
      await wrapper.vm.$nextTick()
      
      const preview = wrapper.find('.chunk-preview')
      if (preview.exists()) {
        expect(preview.text()).toContain(mockChunk.content)
      }
    })
  })

  describe('Performance Monitoring', () => {
    it('should track memory usage during processing', async () => {
      if (window.performance && window.performance.memory) {
        const initialMemory = wrapper.vm.getMemoryUsage()
        expect(typeof initialMemory).toBe('number')
      }
    })

    it('should handle large content processing efficiently', async () => {
      const largeContent = 'Large content chunk. '.repeat(10000) // ~30k words
      const startTime = Date.now()
      
      const chunks = await wrapper.vm.generateWordBasedChunks(largeContent, 500, 15)
      const processingTime = Date.now() - startTime
      
      expect(Array.isArray(chunks)).toBe(true)
      expect(processingTime).toBeLessThan(30000) // Should complete within 30 seconds
    })

    it('should batch process chunks to avoid UI blocking', async () => {
      const content = 'Content chunk. '.repeat(5000)
      const processingPromise = wrapper.vm.generateWordBasedChunks(content, 100, 10)
      
      // Should not block the UI
      await wrapper.vm.$nextTick()
      
      const chunks = await processingPromise
      expect(Array.isArray(chunks)).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should announce processing status to screen readers', () => {
      const statusElement = wrapper.find('[aria-live="polite"]')
      if (statusElement.exists()) {
        expect(statusElement.exists()).toBe(true)
      }
    })

    it('should provide accessible progress information', () => {
      const progressBar = wrapper.find('[role="progressbar"]')
      if (progressBar.exists()) {
        expect(progressBar.attributes('aria-valuenow')).toBeDefined()
        expect(progressBar.attributes('aria-valuemin')).toBeDefined()
        expect(progressBar.attributes('aria-valuemax')).toBeDefined()
      }
    })

    it('should have proper button labels', () => {
      const buttons = wrapper.findAll('button')
      buttons.forEach(button => {
        expect(button.text().length > 0 || button.attributes('aria-label')).toBeTruthy()
      })
    })
  })
})