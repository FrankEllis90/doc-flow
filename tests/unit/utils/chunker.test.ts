import { describe, it, expect, beforeEach, vi } from 'vitest'
import { chunkText } from '@/utils/chunker.js'

describe('Chunker Utility', () => {
  describe('Word-based Chunking', () => {
    it('should split text by word count', () => {
      const text = 'This is a test document with many words that should be split into chunks based on word count limits.'
      const options = {
        method: 'word-based',
        size: 5,
        overlap: 0
      }
      
      const chunks = chunkText(text, options)
      
      expect(Array.isArray(chunks)).toBe(true)
      expect(chunks.length).toBeGreaterThan(1)
      
      // First chunk should have roughly 5 words
      const firstChunkWords = chunks[0].content.trim().split(/\s+/)
      expect(firstChunkWords.length).toBeLessThanOrEqual(6) // Allow some flexibility
    })

    it('should apply word-based overlap correctly', () => {
      const text = 'One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen'
      const options = {
        method: 'word-based',
        size: 5,
        overlap: 20 // 20% overlap = 1 word
      }
      
      const chunks = chunkText(text, options)
      
      if (chunks.length > 1) {
        // Check for overlap between consecutive chunks
        const firstChunkWords = chunks[0].content.trim().split(/\s+/)
        const secondChunkWords = chunks[1].content.trim().split(/\s+/)
        
        const lastWordFirst = firstChunkWords[firstChunkWords.length - 1]
        const hasOverlap = secondChunkWords.includes(lastWordFirst)
        
        expect(hasOverlap).toBe(true)
      }
    })

    it('should handle text shorter than chunk size', () => {
      const text = 'Short text'
      const options = {
        method: 'word-based',
        size: 100,
        overlap: 10
      }
      
      const chunks = chunkText(text, options)
      
      expect(chunks).toHaveLength(1)
      expect(chunks[0].content).toBe(text)
    })

    it('should preserve word boundaries', () => {
      const text = 'Supercalifragilisticexpialidocious is a very long word that should not be split'
      const options = {
        method: 'word-based',
        size: 3,
        overlap: 0
      }
      
      const chunks = chunkText(text, options)
      
      // Long words should not be split in word-based chunking
      expect(chunks[0].content).toContain('Supercalifragilisticexpialidocious')
    })
  })

  describe('Character-based Chunking', () => {
    it('should split text by character count', () => {
      const text = 'A'.repeat(1000)
      const options = {
        method: 'character-based',
        size: 100,
        overlap: 0
      }
      
      const chunks = chunkText(text, options)
      
      expect(chunks.length).toBe(10) // 1000 / 100
      expect(chunks[0].content.length).toBe(100)
    })

    it('should apply character-based overlap correctly', () => {
      const text = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      const options = {
        method: 'character-based',
        size: 10,
        overlap: 20 // 20% overlap = 2 characters
      }
      
      const chunks = chunkText(text, options)
      
      if (chunks.length > 1) {
        const firstChunk = chunks[0].content
        const secondChunk = chunks[1].content
        
        // Should have overlapping characters
        const overlap = firstChunk.slice(-2)
        expect(secondChunk.startsWith(overlap)).toBe(true)
      }
    })

    it('should respect word boundaries when possible', () => {
      const text = 'Hello world this is a test of character chunking with word boundaries'
      const options = {
        method: 'character-based',
        size: 20,
        overlap: 0,
        respectWordBoundaries: true
      }
      
      const chunks = chunkText(text, options)
      
      // Chunks should not break words unless necessary
      chunks.forEach(chunk => {
        const trimmed = chunk.content.trim()
        if (trimmed.length > 0) {
          // Should not start or end with partial words (spaces indicate word boundaries)
          expect(trimmed).not.toMatch(/^\S*\s/) // Should not start mid-word
          expect(trimmed).not.toMatch(/\s\S*$/) // Should not end mid-word
        }
      })
    })
  })

  describe('Section-based Chunking', () => {
    it('should split by markdown headers', () => {
      const text = `
# Introduction
This is the introduction section.

## Background
Some background information here.

# Main Content
This is the main content section.

## Details
More detailed information.

# Conclusion
Final thoughts and conclusions.
      `
      
      const options = {
        method: 'section-based',
        headerLevel: 1
      }
      
      const chunks = chunkText(text, options)
      
      expect(chunks.length).toBe(3) // 3 H1 sections
      expect(chunks[0].content).toContain('Introduction')
      expect(chunks[1].content).toContain('Main Content')
      expect(chunks[2].content).toContain('Conclusion')
    })

    it('should handle nested headers correctly', () => {
      const text = `
# Chapter 1
Introduction to the chapter.

## Section 1.1
First subsection.

### Subsection 1.1.1
Nested content.

## Section 1.2
Second subsection.

# Chapter 2
Second chapter content.
      `
      
      const options = {
        method: 'section-based',
        headerLevel: 2,
        includeSubsections: true
      }
      
      const chunks = chunkText(text, options)
      
      // Should split at H2 level and include subsections
      expect(chunks.length).toBeGreaterThanOrEqual(2)
      expect(chunks.some(chunk => chunk.content.includes('Section 1.1'))).toBe(true)
      expect(chunks.some(chunk => chunk.content.includes('Section 1.2'))).toBe(true)
    })

    it('should fall back to paragraph chunking for non-markdown text', () => {
      const text = `
This is paragraph one.

This is paragraph two with more content.

This is paragraph three.
      `
      
      const options = {
        method: 'section-based',
        fallbackToParagraphs: true
      }
      
      const chunks = chunkText(text, options)
      
      expect(chunks.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Chunk Metadata', () => {
    it('should generate unique chunk IDs', () => {
      const text = 'Test content '.repeat(100)
      const options = {
        method: 'word-based',
        size: 20,
        overlap: 0
      }
      
      const chunks = chunkText(text, options)
      const ids = chunks.map(chunk => chunk.chunk_id)
      const uniqueIds = new Set(ids)
      
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should calculate word counts correctly', () => {
      const text = 'This is exactly five words'
      const options = {
        method: 'word-based',
        size: 10,
        overlap: 0
      }
      
      const chunks = chunkText(text, options)
      
      expect(chunks[0].word_count).toBe(5)
    })

    it('should include character counts', () => {
      const text = 'Test'
      const options = {
        method: 'character-based',
        size: 10,
        overlap: 0
      }
      
      const chunks = chunkText(text, options)
      
      expect(chunks[0].char_count).toBe(4)
    })

    it('should add source information when provided', () => {
      const text = 'Sample content'
      const options = {
        method: 'word-based',
        size: 10,
        overlap: 0,
        source: 'test-document.pdf'
      }
      
      const chunks = chunkText(text, options)
      
      expect(chunks[0].source).toBe('test-document.pdf')
    })

    it('should include position information', () => {
      const text = 'Word '.repeat(100)
      const options = {
        method: 'word-based',
        size: 20,
        overlap: 0
      }
      
      const chunks = chunkText(text, options)
      
      chunks.forEach((chunk, index) => {
        expect(chunk.position).toBe(index)
        expect(typeof chunk.start_index).toBe('number')
        expect(typeof chunk.end_index).toBe('number')
      })
    })
  })

  describe('Tag Generation', () => {
    it('should extract keywords as tags when enabled', () => {
      const text = 'This document discusses machine learning algorithms and artificial intelligence techniques'
      const options = {
        method: 'word-based',
        size: 50,
        overlap: 0,
        generateTags: true
      }
      
      const chunks = chunkText(text, options)
      
      expect(chunks[0]).toHaveProperty('tags')
      expect(Array.isArray(chunks[0].tags)).toBe(true)
      
      if (chunks[0].tags.length > 0) {
        const tags = chunks[0].tags.map(tag => tag.toLowerCase())
        expect(tags.some(tag => ['machine', 'learning', 'algorithm', 'artificial', 'intelligence'].includes(tag))).toBe(true)
      }
    })

    it('should filter out stop words from tags', () => {
      const text = 'The quick brown fox jumps over the lazy dog and runs very fast'
      const options = {
        method: 'word-based',
        size: 50,
        overlap: 0,
        generateTags: true,
        stopWords: ['the', 'and', 'over', 'very']
      }
      
      const chunks = chunkText(text, options)
      
      if (chunks[0].tags && chunks[0].tags.length > 0) {
        const tags = chunks[0].tags.map(tag => tag.toLowerCase())
        expect(tags.includes('the')).toBe(false)
        expect(tags.includes('and')).toBe(false)
        expect(tags.includes('over')).toBe(false)
        expect(tags.includes('very')).toBe(false)
      }
    })

    it('should limit number of tags per chunk', () => {
      const text = 'technology software development programming coding javascript python java artificial intelligence machine learning data science statistics'.repeat(5)
      const options = {
        method: 'word-based',
        size: 100,
        overlap: 0,
        generateTags: true,
        maxTags: 5
      }
      
      const chunks = chunkText(text, options)
      
      if (chunks[0].tags) {
        expect(chunks[0].tags.length).toBeLessThanOrEqual(5)
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle empty text input', () => {
      const text = ''
      const options = {
        method: 'word-based',
        size: 100,
        overlap: 0
      }
      
      const chunks = chunkText(text, options)
      
      expect(Array.isArray(chunks)).toBe(true)
      expect(chunks.length).toBe(0)
    })

    it('should handle whitespace-only text', () => {
      const text = '   \n\t   \n   '
      const options = {
        method: 'word-based',
        size: 100,
        overlap: 0
      }
      
      const chunks = chunkText(text, options)
      
      expect(Array.isArray(chunks)).toBe(true)
      expect(chunks.length).toBe(0)
    })

    it('should handle invalid chunk size', () => {
      const text = 'Valid content here'
      const options = {
        method: 'word-based',
        size: 0,
        overlap: 0
      }
      
      // Should use default size or handle gracefully
      expect(() => chunkText(text, options)).not.toThrow()
    })

    it('should handle invalid overlap percentage', () => {
      const text = 'Valid content here'
      const options = {
        method: 'word-based',
        size: 100,
        overlap: 150 // Invalid: >100%
      }
      
      // Should clamp overlap to valid range
      expect(() => chunkText(text, options)).not.toThrow()
    })

    it('should handle unsupported chunking method', () => {
      const text = 'Valid content here'
      const options = {
        method: 'unsupported-method',
        size: 100,
        overlap: 0
      }
      
      // Should fall back to default method
      expect(() => chunkText(text, options)).not.toThrow()
    })
  })

  describe('Performance', () => {
    it('should handle large text efficiently', () => {
      const largeText = 'Large content chunk. '.repeat(10000) // ~30k words
      const options = {
        method: 'word-based',
        size: 500,
        overlap: 15
      }
      
      const startTime = Date.now()
      const chunks = chunkText(largeText, options)
      const processingTime = Date.now() - startTime
      
      expect(Array.isArray(chunks)).toBe(true)
      expect(chunks.length).toBeGreaterThan(50)
      expect(processingTime).toBeLessThan(5000) // Should complete within 5 seconds
    })

    it('should maintain consistent chunk quality regardless of size', () => {
      const smallText = 'Small content. '.repeat(10)
      const largeText = 'Large content. '.repeat(1000)
      
      const options = {
        method: 'word-based',
        size: 50,
        overlap: 10
      }
      
      const smallChunks = chunkText(smallText, options)
      const largeChunks = chunkText(largeText, options)
      
      // Quality checks should be consistent
      smallChunks.forEach(chunk => {
        expect(chunk).toHaveProperty('chunk_id')
        expect(chunk).toHaveProperty('content')
        expect(chunk).toHaveProperty('word_count')
      })
      
      largeChunks.forEach(chunk => {
        expect(chunk).toHaveProperty('chunk_id')
        expect(chunk).toHaveProperty('content')
        expect(chunk).toHaveProperty('word_count')
      })
    })
  })

  describe('Configuration Validation', () => {
    it('should validate and normalize chunking options', () => {
      const text = 'Test content for validation'
      
      // Test with missing options
      const chunks1 = chunkText(text, {})
      expect(Array.isArray(chunks1)).toBe(true)
      
      // Test with partial options
      const chunks2 = chunkText(text, { method: 'word-based' })
      expect(Array.isArray(chunks2)).toBe(true)
      
      // Test with null/undefined values
      const chunks3 = chunkText(text, { 
        method: 'word-based',
        size: null,
        overlap: undefined 
      })
      expect(Array.isArray(chunks3)).toBe(true)
    })

    it('should apply default values for missing configuration', () => {
      const text = 'Test content'
      const chunks = chunkText(text, {})
      
      // Should use defaults and produce valid chunks
      expect(chunks.length).toBeGreaterThan(0)
      expect(chunks[0]).toHaveProperty('chunk_id')
      expect(chunks[0]).toHaveProperty('content')
    })
  })
})