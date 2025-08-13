/**
 * Doc Layer - Semantic Chunking Engine
 * Advanced NLP-based text segmentation for optimal AI/ML vector store ingestion
 */

export class SemanticChunker {
  constructor(options = {}) {
    this.options = {
      maxTokens: options.maxTokens || 512,
      overlapTokens: options.overlapTokens || 50,
      minChunkSize: options.minChunkSize || 100,
      useSemanticBoundaries: options.useSemanticBoundaries !== false,
      preserveFormatting: options.preserveFormatting !== false,
      language: options.language || 'en',
      ...options
    }
    
    // Initialize tokenizer patterns (simplified GPT-style approximation)
    this.tokenPatterns = {
      word: /\b\w+\b/g,
      sentence: /[.!?]+\s+/g,
      paragraph: /\n\s*\n/g,
      section: /^#{1,6}\s+.+$/gm
    }
    
    // Semantic boundary indicators
    this.semanticMarkers = {
      strong: ['however', 'therefore', 'furthermore', 'consequently', 'meanwhile', 'nonetheless'],
      medium: ['first', 'second', 'third', 'next', 'then', 'finally', 'additionally', 'moreover'],
      weak: ['and', 'but', 'or', 'so', 'because', 'although', 'while', 'since']
    }
  }

  /**
   * Approximate token count using GPT-style estimation
   */
  estimateTokenCount(text) {
    if (!text) return 0
    
    // Rough GPT token approximation: ~0.75 tokens per word for English
    const words = text.match(/\b\w+\b/g) || []
    const baseTokens = Math.ceil(words.length * 0.75)
    
    // Add tokens for special characters and formatting
    const specialChars = (text.match(/[^\w\s]/g) || []).length
    const formatTokens = Math.ceil(specialChars * 0.25)
    
    return baseTokens + formatTokens
  }

  /**
   * Split text into semantic chunks with intelligent boundary detection
   */
  chunk(text, options = {}) {
    const opts = { ...this.options, ...options }
    
    if (!text || text.trim().length === 0) {
      return []
    }

    // Pre-process text to identify structure
    const structure = this.analyzeTextStructure(text)
    
    // Choose chunking strategy based on content type
    if (structure.hasHeaders && opts.useSemanticBoundaries) {
      return this.chunkBySemanticSections(text, structure, opts)
    } else if (structure.hasParagraphs) {
      return this.chunkByParagraphs(text, opts)
    } else {
      return this.chunkBySentences(text, opts)
    }
  }

  /**
   * Analyze text structure to determine optimal chunking strategy
   */
  analyzeTextStructure(text) {
    const hasHeaders = /^#{1,6}\s+.+$/gm.test(text)
    const hasParagraphs = /\n\s*\n/.test(text)
    const hasLists = /^[\s]*[-*+]\s+/gm.test(text) || /^\d+\.\s+/gm.test(text)
    const hasCodeBlocks = /```[\s\S]*?```/g.test(text) || /`[^`]+`/g.test(text)
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length
    
    return {
      hasHeaders,
      hasParagraphs,
      hasLists,
      hasCodeBlocks,
      sentenceCount: sentences.length,
      avgSentenceLength,
      wordCount: (text.match(/\b\w+\b/g) || []).length,
      estimatedTokens: this.estimateTokenCount(text)
    }
  }

  /**
   * Chunk by semantic sections (headers, topics)
   */
  chunkBySemanticSections(text, structure, opts) {
    const chunks = []
    const lines = text.split('\n')
    let currentChunk = ''
    let currentTokenCount = 0
    let sectionLevel = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineTokens = this.estimateTokenCount(line + '\n')
      
      // Check if this is a header
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/)
      
      if (headerMatch) {
        const level = headerMatch[1].length
        
        // Start new chunk on higher-level headers or when size limit reached
        if ((level <= sectionLevel && currentChunk.trim()) || 
            currentTokenCount + lineTokens > opts.maxTokens) {
          
          if (currentChunk.trim()) {
            chunks.push(this.createChunkObject(currentChunk.trim(), chunks.length))
          }
          currentChunk = ''
          currentTokenCount = 0
        }
        
        sectionLevel = level
      }

      // Add line to current chunk
      currentChunk += line + '\n'
      currentTokenCount += lineTokens

      // Force split if we exceed token limit
      if (currentTokenCount > opts.maxTokens) {
        // Try to find a good break point
        const breakPoint = this.findSemanticBreakPoint(currentChunk, opts.maxTokens - opts.overlapTokens)
        
        if (breakPoint > 0) {
          const chunkContent = currentChunk.substring(0, breakPoint).trim()
          chunks.push(this.createChunkObject(chunkContent, chunks.length))
          
          // Create overlap for continuity
          const overlapStart = Math.max(0, breakPoint - this.estimateCharactersFromTokens(opts.overlapTokens))
          currentChunk = currentChunk.substring(overlapStart)
          currentTokenCount = this.estimateTokenCount(currentChunk)
        }
      }
    }

    // Add final chunk
    if (currentChunk.trim()) {
      chunks.push(this.createChunkObject(currentChunk.trim(), chunks.length))
    }

    return chunks
  }

  /**
   * Chunk by paragraphs with semantic awareness
   */
  chunkByParagraphs(text, opts) {
    const chunks = []
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
    let currentChunk = ''
    let currentTokenCount = 0

    for (const paragraph of paragraphs) {
      const paragraphTokens = this.estimateTokenCount(paragraph)
      
      // If single paragraph exceeds limit, split it
      if (paragraphTokens > opts.maxTokens) {
        // Save current chunk if it exists
        if (currentChunk.trim()) {
          chunks.push(this.createChunkObject(currentChunk.trim(), chunks.length))
          currentChunk = ''
          currentTokenCount = 0
        }
        
        // Split long paragraph by sentences
        const sentenceChunks = this.chunkBySentences(paragraph, opts)
        chunks.push(...sentenceChunks.map(chunk => ({
          ...chunk,
          id: chunks.length + sentenceChunks.indexOf(chunk)
        })))
        
        continue
      }

      // Check if adding this paragraph would exceed limit
      if (currentTokenCount + paragraphTokens > opts.maxTokens && currentChunk.trim()) {
        chunks.push(this.createChunkObject(currentChunk.trim(), chunks.length))
        
        // Start new chunk with overlap
        const overlapText = this.createOverlap(currentChunk, opts.overlapTokens)
        currentChunk = overlapText + (overlapText ? '\n\n' : '') + paragraph
        currentTokenCount = this.estimateTokenCount(currentChunk)
      } else {
        // Add paragraph to current chunk
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph
        currentTokenCount += paragraphTokens
      }
    }

    // Add final chunk
    if (currentChunk.trim()) {
      chunks.push(this.createChunkObject(currentChunk.trim(), chunks.length))
    }

    return chunks
  }

  /**
   * Chunk by sentences as fallback method
   */
  chunkBySentences(text, opts) {
    const chunks = []
    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0)
    let currentChunk = ''
    let currentTokenCount = 0

    for (const sentence of sentences) {
      const sentenceTokens = this.estimateTokenCount(sentence)
      
      // Check if adding this sentence would exceed limit
      if (currentTokenCount + sentenceTokens > opts.maxTokens && currentChunk.trim()) {
        chunks.push(this.createChunkObject(currentChunk.trim(), chunks.length))
        
        // Start new chunk with overlap
        const overlapText = this.createOverlap(currentChunk, opts.overlapTokens)
        currentChunk = overlapText + (overlapText ? ' ' : '') + sentence
        currentTokenCount = this.estimateTokenCount(currentChunk)
      } else {
        // Add sentence to current chunk
        currentChunk += (currentChunk ? ' ' : '') + sentence
        currentTokenCount += sentenceTokens
      }
    }

    // Add final chunk
    if (currentChunk.trim()) {
      chunks.push(this.createChunkObject(currentChunk.trim(), chunks.length))
    }

    return chunks
  }

  /**
   * Find optimal break point based on semantic markers
   */
  findSemanticBreakPoint(text, targetPosition) {
    const sentences = text.split(/(?<=[.!?])\s+/)
    let position = 0
    let bestBreakPoint = 0
    let bestScore = 0

    for (let i = 0; i < sentences.length; i++) {
      position += sentences[i].length + 1
      
      if (position > targetPosition) break

      // Score this position based on semantic markers
      const sentence = sentences[i].toLowerCase()
      let score = 1 // Base score for sentence boundary

      // Check for semantic transition markers
      for (const [strength, markers] of Object.entries(this.semanticMarkers)) {
        for (const marker of markers) {
          if (sentence.includes(marker)) {
            score += strength === 'strong' ? 3 : strength === 'medium' ? 2 : 1
            break
          }
        }
      }

      // Prefer positions closer to target
      const distanceScore = 1 - Math.abs(position - targetPosition) / targetPosition
      score *= (1 + distanceScore)

      if (score > bestScore) {
        bestScore = score
        bestBreakPoint = position
      }
    }

    return bestBreakPoint || targetPosition
  }

  /**
   * Create overlap text from end of previous chunk
   */
  createOverlap(text, overlapTokens) {
    if (overlapTokens <= 0) return ''
    
    const targetChars = this.estimateCharactersFromTokens(overlapTokens)
    const sentences = text.split(/(?<=[.!?])\s+/).reverse()
    let overlap = ''
    let tokenCount = 0

    for (const sentence of sentences) {
      const sentenceTokens = this.estimateTokenCount(sentence)
      if (tokenCount + sentenceTokens > overlapTokens) break
      
      overlap = sentence + (overlap ? ' ' + overlap : '')
      tokenCount += sentenceTokens
    }

    return overlap
  }

  /**
   * Estimate character count from token count
   */
  estimateCharactersFromTokens(tokens) {
    return Math.ceil(tokens * 4) // Rough approximation: 4 characters per token
  }

  /**
   * Create standardized chunk object
   */
  createChunkObject(content, index) {
    const tokenCount = this.estimateTokenCount(content)
    const wordCount = (content.match(/\b\w+\b/g) || []).length
    
    return {
      id: `chunk_${String(index + 1).padStart(3, '0')}`,
      content: content,
      metadata: {
        index: index,
        token_count: tokenCount,
        word_count: wordCount,
        character_count: content.length,
        created_at: new Date().toISOString(),
        chunk_method: 'semantic'
      }
    }
  }

  /**
   * Analyze chunk quality and provide recommendations
   */
  analyzeChunkQuality(chunks) {
    if (!chunks.length) return { score: 0, recommendations: ['No chunks to analyze'] }

    const tokenCounts = chunks.map(chunk => chunk.metadata.token_count)
    const avgTokens = tokenCounts.reduce((a, b) => a + b, 0) / tokenCounts.length
    const tokenVariance = tokenCounts.reduce((sum, count) => sum + Math.pow(count - avgTokens, 2), 0) / tokenCounts.length
    
    let score = 100
    const recommendations = []

    // Check for size consistency
    if (tokenVariance > avgTokens * 0.5) {
      score -= 20
      recommendations.push('High variance in chunk sizes detected. Consider adjusting chunking parameters.')
    }

    // Check for optimal size range
    const underSized = tokenCounts.filter(count => count < this.options.minChunkSize).length
    const overSized = tokenCounts.filter(count => count > this.options.maxTokens * 1.2).length
    
    if (underSized > chunks.length * 0.2) {
      score -= 15
      recommendations.push(`${underSized} chunks are under-sized. Consider reducing minChunkSize or adjusting content.`)
    }

    if (overSized > 0) {
      score -= 25
      recommendations.push(`${overSized} chunks exceed size limits. Review chunking strategy.`)
    }

    // Check for content coherence (simplified)
    let coherenceScore = 0
    for (const chunk of chunks) {
      // Simple coherence check based on sentence structure
      const sentences = chunk.content.split(/[.!?]+/).filter(s => s.trim().length > 0)
      if (sentences.length >= 2) {
        coherenceScore += 1
      }
    }
    
    const coherenceRatio = coherenceScore / chunks.length
    if (coherenceRatio < 0.7) {
      score -= 10
      recommendations.push('Some chunks may lack coherent sentence structure.')
    }

    return {
      score: Math.max(0, score),
      avgTokenCount: Math.round(avgTokens),
      tokenVariance: Math.round(tokenVariance),
      underSizedChunks: underSized,
      overSizedChunks: overSized,
      recommendations: recommendations.length ? recommendations : ['Chunk quality looks good!']
    }
  }
}

/**
 * Factory function for easy chunking
 */
export function createSemanticChunker(options = {}) {
  return new SemanticChunker(options)
}

/**
 * Quick semantic chunking function
 */
export function semanticChunk(text, options = {}) {
  const chunker = new SemanticChunker(options)
  return chunker.chunk(text, options)
}

/**
 * Export preset configurations for common use cases
 */
export const CHUNK_PRESETS = {
  openai_embeddings: {
    maxTokens: 512,
    overlapTokens: 50,
    useSemanticBoundaries: true,
    preserveFormatting: true
  },
  
  anthropic_claude: {
    maxTokens: 1000,
    overlapTokens: 100,
    useSemanticBoundaries: true,
    preserveFormatting: true
  },
  
  dense_retrieval: {
    maxTokens: 256,
    overlapTokens: 25,
    useSemanticBoundaries: false,
    minChunkSize: 100
  },
  
  research_papers: {
    maxTokens: 800,
    overlapTokens: 80,
    useSemanticBoundaries: true,
    preserveFormatting: true
  },
  
  code_documentation: {
    maxTokens: 400,
    overlapTokens: 40,
    useSemanticBoundaries: true,
    preserveFormatting: true
  }
}