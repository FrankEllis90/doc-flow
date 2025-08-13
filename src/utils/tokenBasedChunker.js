/**
 * Doc Layer - Token-Based Chunking Engine
 * Precise token-level chunking compatible with OpenAI, Anthropic, and other LLM tokenizers
 */

/**
 * GPT-style tokenizer approximation
 * This is a simplified implementation for client-side use
 * For production, consider integrating with tiktoken or other official tokenizers
 */
class TokenizerApproximation {
  constructor(model = 'gpt-3.5-turbo') {
    this.model = model
    this.encodingMap = this.initializeEncodingMap()
  }

  initializeEncodingMap() {
    // Simplified encoding patterns for common tokens
    return {
      // Common words and patterns
      patterns: [
        { regex: /\s+/g, tokens: 1 }, // Whitespace
        { regex: /\n/g, tokens: 1 }, // Newlines
        { regex: /[.!?;:,]/g, tokens: 1 }, // Punctuation
        { regex: /["'`]/g, tokens: 1 }, // Quotes
        { regex: /[\[\]{}()]/g, tokens: 1 }, // Brackets
        { regex: /[+-=*/%<>&|^~]/g, tokens: 1 }, // Operators
        { regex: /#/g, tokens: 1 }, // Hash
        { regex: /\$/g, tokens: 1 }, // Dollar
        { regex: /@/g, tokens: 1 }, // At symbol
      ],
      
      // Word patterns (rough approximation)
      wordMultipliers: {
        short: 0.75, // 1-3 chars
        medium: 1.0, // 4-7 chars  
        long: 1.25, // 8-12 chars
        veryLong: 1.5 // 13+ chars
      },
      
      // Model-specific adjustments
      modelAdjustments: {
        'gpt-3.5-turbo': 1.0,
        'gpt-4': 1.0,
        'claude-3': 0.95,
        'claude-3.5': 0.95,
        'text-embedding-ada-002': 1.0,
        'text-embedding-3-small': 1.0,
        'text-embedding-3-large': 1.0
      }
    }
  }

  /**
   * Estimate token count for text
   */
  encode(text) {
    if (!text) return []
    
    let tokenCount = 0
    let remainingText = text

    // Count special characters and patterns
    for (const pattern of this.encodingMap.patterns) {
      const matches = remainingText.match(pattern.regex)
      if (matches) {
        tokenCount += matches.length * pattern.tokens
        remainingText = remainingText.replace(pattern.regex, '')
      }
    }

    // Count words with length-based multipliers
    const words = remainingText.match(/\w+/g) || []
    for (const word of words) {
      const length = word.length
      let multiplier = this.encodingMap.wordMultipliers.medium
      
      if (length <= 3) {
        multiplier = this.encodingMap.wordMultipliers.short
      } else if (length <= 7) {
        multiplier = this.encodingMap.wordMultipliers.medium
      } else if (length <= 12) {
        multiplier = this.encodingMap.wordMultipliers.long
      } else {
        multiplier = this.encodingMap.wordMultipliers.veryLong
      }
      
      tokenCount += Math.ceil(multiplier)
    }

    // Apply model-specific adjustments
    const modelAdjustment = this.encodingMap.modelAdjustments[this.model] || 1.0
    tokenCount = Math.ceil(tokenCount * modelAdjustment)

    // Return array representation (simplified)
    return new Array(tokenCount).fill(0).map((_, i) => i)
  }

  /**
   * Get token count for text
   */
  countTokens(text) {
    return this.encode(text).length
  }

  /**
   * Decode tokens back to approximate text (simplified)
   */
  decode(tokens) {
    // This is a very simplified decode - in real implementation,
    // you would need the actual token->text mapping
    return `[${tokens.length} tokens]`
  }
}

/**
 * Token-based chunker class
 */
export class TokenBasedChunker {
  constructor(options = {}) {
    this.options = {
      maxTokens: options.maxTokens || 512,
      overlapTokens: options.overlapTokens || 50,
      model: options.model || 'gpt-3.5-turbo',
      preserveFormatting: options.preserveFormatting !== false,
      splitOnSentences: options.splitOnSentences !== false,
      ...options
    }
    
    this.tokenizer = new TokenizerApproximation(this.options.model)
  }

  /**
   * Chunk text based on precise token counts
   */
  chunk(text, options = {}) {
    const opts = { ...this.options, ...options }
    
    if (!text || text.trim().length === 0) {
      return []
    }

    const totalTokens = this.tokenizer.countTokens(text)
    
    // If text is already within limits, return as single chunk
    if (totalTokens <= opts.maxTokens) {
      return [this.createChunkObject(text, 0, totalTokens)]
    }

    // Split into chunks
    if (opts.splitOnSentences) {
      return this.chunkBySentenceTokens(text, opts)
    } else {
      return this.chunkByTokenWindows(text, opts)
    }
  }

  /**
   * Chunk by sentence boundaries while respecting token limits
   */
  chunkBySentenceTokens(text, opts) {
    const chunks = []
    const sentences = this.splitIntoSentences(text)
    
    let currentChunk = ''
    let currentTokenCount = 0
    let overlapBuffer = ''

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i]
      const sentenceTokens = this.tokenizer.countTokens(sentence)
      
      // If single sentence exceeds limit, split it by words
      if (sentenceTokens > opts.maxTokens) {
        // Save current chunk if it exists
        if (currentChunk.trim()) {
          chunks.push(this.createChunkObject(currentChunk.trim(), chunks.length, currentTokenCount))
        }
        
        // Split oversized sentence
        const wordChunks = this.chunkByWords(sentence, opts)
        chunks.push(...wordChunks.map(chunk => ({
          ...chunk,
          id: `chunk_${String(chunks.length + wordChunks.indexOf(chunk) + 1).padStart(3, '0')}`
        })))
        
        currentChunk = ''
        currentTokenCount = 0
        overlapBuffer = ''
        continue
      }

      // Check if adding this sentence would exceed limit
      if (currentTokenCount + sentenceTokens > opts.maxTokens && currentChunk.trim()) {
        // Save current chunk
        chunks.push(this.createChunkObject(currentChunk.trim(), chunks.length, currentTokenCount))
        
        // Start new chunk with overlap
        currentChunk = overlapBuffer
        currentTokenCount = this.tokenizer.countTokens(overlapBuffer)
        
        // Clear old overlap buffer
        overlapBuffer = ''
      }

      // Add sentence to current chunk
      currentChunk += (currentChunk ? ' ' : '') + sentence
      currentTokenCount += sentenceTokens

      // Update overlap buffer (keep last N tokens worth of content)
      if (opts.overlapTokens > 0) {
        overlapBuffer = this.createTokenOverlap(currentChunk, opts.overlapTokens)
      }
    }

    // Add final chunk
    if (currentChunk.trim()) {
      chunks.push(this.createChunkObject(currentChunk.trim(), chunks.length, currentTokenCount))
    }

    return chunks
  }

  /**
   * Chunk by sliding token windows
   */
  chunkByTokenWindows(text, opts) {
    const chunks = []
    const words = text.split(/\s+/)
    
    let currentChunk = ''
    let currentTokenCount = 0
    let wordIndex = 0

    while (wordIndex < words.length) {
      const word = words[wordIndex]
      const wordTokens = this.tokenizer.countTokens(word + ' ')
      
      // If adding this word would exceed limit, finalize chunk
      if (currentTokenCount + wordTokens > opts.maxTokens && currentChunk.trim()) {
        chunks.push(this.createChunkObject(currentChunk.trim(), chunks.length, currentTokenCount))
        
        // Calculate overlap
        if (opts.overlapTokens > 0) {
          const overlapText = this.createTokenOverlap(currentChunk, opts.overlapTokens)
          currentChunk = overlapText
          currentTokenCount = this.tokenizer.countTokens(overlapText)
        } else {
          currentChunk = ''
          currentTokenCount = 0
        }
        
        continue // Don't increment wordIndex, retry with same word
      }

      // Add word to current chunk
      currentChunk += (currentChunk ? ' ' : '') + word
      currentTokenCount += wordTokens
      wordIndex++
    }

    // Add final chunk
    if (currentChunk.trim()) {
      chunks.push(this.createChunkObject(currentChunk.trim(), chunks.length, currentTokenCount))
    }

    return chunks
  }

  /**
   * Split oversized sentences by words
   */
  chunkByWords(sentence, opts) {
    const chunks = []
    const words = sentence.split(/\s+/)
    
    let currentChunk = ''
    let currentTokenCount = 0

    for (const word of words) {
      const wordTokens = this.tokenizer.countTokens(word + ' ')
      
      if (currentTokenCount + wordTokens > opts.maxTokens && currentChunk.trim()) {
        chunks.push(this.createChunkObject(currentChunk.trim(), chunks.length, currentTokenCount))
        currentChunk = ''
        currentTokenCount = 0
      }

      currentChunk += (currentChunk ? ' ' : '') + word
      currentTokenCount += wordTokens
    }

    if (currentChunk.trim()) {
      chunks.push(this.createChunkObject(currentChunk.trim(), chunks.length, currentTokenCount))
    }

    return chunks
  }

  /**
   * Create overlap text with precise token count
   */
  createTokenOverlap(text, targetTokens) {
    if (targetTokens <= 0) return ''
    
    const sentences = this.splitIntoSentences(text).reverse()
    let overlap = ''
    let tokenCount = 0

    for (const sentence of sentences) {
      const sentenceTokens = this.tokenizer.countTokens(sentence)
      
      if (tokenCount + sentenceTokens <= targetTokens) {
        overlap = sentence + (overlap ? ' ' + overlap : '')
        tokenCount += sentenceTokens
      } else {
        // If we can't fit the whole sentence, try to fit part of it
        const words = sentence.split(/\s+/).reverse()
        for (const word of words) {
          const wordTokens = this.tokenizer.countTokens(word + ' ')
          if (tokenCount + wordTokens <= targetTokens) {
            overlap = word + (overlap ? ' ' + overlap : '')
            tokenCount += wordTokens
          } else {
            break
          }
        }
        break
      }
    }

    return overlap
  }

  /**
   * Split text into sentences
   */
  splitIntoSentences(text) {
    // Enhanced sentence splitting that handles common abbreviations
    const abbreviations = ['Dr', 'Mr', 'Mrs', 'Ms', 'Prof', 'Inc', 'Ltd', 'Co', 'Corp', 'etc', 'vs', 'e.g', 'i.e']
    
    let processed = text
    
    // Temporarily replace abbreviations
    const placeholders = {}
    abbreviations.forEach((abbr, index) => {
      const placeholder = `__ABBR_${index}__`
      const regex = new RegExp(`\\b${abbr}\\.`, 'g')
      processed = processed.replace(regex, placeholder)
      placeholders[placeholder] = abbr + '.'
    })
    
    // Split on sentence boundaries
    const sentences = processed
      .split(/(?<=[.!?])\s+/)
      .filter(s => s.trim().length > 0)
    
    // Restore abbreviations
    return sentences.map(sentence => {
      let restored = sentence
      Object.entries(placeholders).forEach(([placeholder, original]) => {
        restored = restored.replace(new RegExp(placeholder, 'g'), original)
      })
      return restored.trim()
    })
  }

  /**
   * Create standardized chunk object
   */
  createChunkObject(content, index, tokenCount = null) {
    const actualTokenCount = tokenCount || this.tokenizer.countTokens(content)
    const wordCount = (content.match(/\b\w+\b/g) || []).length
    
    return {
      id: `chunk_${String(index + 1).padStart(3, '0')}`,
      content: content,
      metadata: {
        index: index,
        token_count: actualTokenCount,
        word_count: wordCount,
        character_count: content.length,
        model: this.options.model,
        created_at: new Date().toISOString(),
        chunk_method: 'token_based'
      }
    }
  }

  /**
   * Validate chunks against model limits
   */
  validateChunks(chunks) {
    const results = {
      valid: true,
      issues: [],
      totalChunks: chunks.length,
      avgTokenCount: 0,
      maxTokenCount: 0,
      minTokenCount: Infinity
    }

    let totalTokens = 0

    for (const chunk of chunks) {
      const tokenCount = chunk.metadata.token_count
      totalTokens += tokenCount
      
      results.maxTokenCount = Math.max(results.maxTokenCount, tokenCount)
      results.minTokenCount = Math.min(results.minTokenCount, tokenCount)
      
      if (tokenCount > this.options.maxTokens) {
        results.valid = false
        results.issues.push(`Chunk ${chunk.id} exceeds token limit: ${tokenCount} > ${this.options.maxTokens}`)
      }
      
      if (tokenCount === 0) {
        results.valid = false
        results.issues.push(`Chunk ${chunk.id} is empty`)
      }
    }

    results.avgTokenCount = Math.round(totalTokens / chunks.length)
    results.minTokenCount = results.minTokenCount === Infinity ? 0 : results.minTokenCount

    return results
  }

  /**
   * Get model-specific token limits
   */
  static getModelLimits() {
    return {
      'gpt-3.5-turbo': { maxTokens: 4096, recommendedChunk: 512 },
      'gpt-3.5-turbo-16k': { maxTokens: 16384, recommendedChunk: 2048 },
      'gpt-4': { maxTokens: 8192, recommendedChunk: 1024 },
      'gpt-4-32k': { maxTokens: 32768, recommendedChunk: 4096 },
      'claude-3-haiku': { maxTokens: 200000, recommendedChunk: 1000 },
      'claude-3-sonnet': { maxTokens: 200000, recommendedChunk: 1000 },
      'claude-3-opus': { maxTokens: 200000, recommendedChunk: 1000 },
      'claude-3.5-sonnet': { maxTokens: 200000, recommendedChunk: 1000 },
      'text-embedding-ada-002': { maxTokens: 8191, recommendedChunk: 512 },
      'text-embedding-3-small': { maxTokens: 8191, recommendedChunk: 512 },
      'text-embedding-3-large': { maxTokens: 8191, recommendedChunk: 512 }
    }
  }
}

/**
 * Factory function for easy token-based chunking
 */
export function createTokenChunker(model = 'gpt-3.5-turbo', options = {}) {
  const limits = TokenBasedChunker.getModelLimits()[model]
  const defaultOptions = {
    model,
    maxTokens: limits?.recommendedChunk || 512,
    overlapTokens: Math.floor((limits?.recommendedChunk || 512) * 0.1),
    ...options
  }
  
  return new TokenBasedChunker(defaultOptions)
}

/**
 * Quick token-based chunking function
 */
export function tokenChunk(text, model = 'gpt-3.5-turbo', options = {}) {
  const chunker = createTokenChunker(model, options)
  return chunker.chunk(text, options)
}

/**
 * Export model presets for common use cases
 */
export const TOKEN_PRESETS = {
  openai_gpt35: {
    model: 'gpt-3.5-turbo',
    maxTokens: 512,
    overlapTokens: 51,
    splitOnSentences: true
  },
  
  openai_gpt4: {
    model: 'gpt-4',
    maxTokens: 1024,
    overlapTokens: 102,
    splitOnSentences: true
  },
  
  anthropic_claude: {
    model: 'claude-3.5-sonnet',
    maxTokens: 1000,
    overlapTokens: 100,
    splitOnSentences: true
  },
  
  openai_embeddings: {
    model: 'text-embedding-3-small',
    maxTokens: 512,
    overlapTokens: 25,
    splitOnSentences: true
  },
  
  large_context: {
    model: 'gpt-4-32k',
    maxTokens: 4096,
    overlapTokens: 409,
    splitOnSentences: true
  }
}