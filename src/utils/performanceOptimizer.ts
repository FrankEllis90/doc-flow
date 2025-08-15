/**
 * Performance optimization utilities for large file processing
 */

export interface PerformanceConfig {
  batchSize: number
  delayBetweenBatches: number
  memoryThreshold: number
  maxConcurrentOperations: number
}

const defaultConfig: PerformanceConfig = {
  batchSize: 100,
  delayBetweenBatches: 10, // ms
  memoryThreshold: 100 * 1024 * 1024, // 100MB
  maxConcurrentOperations: 3
}

/**
 * Process large arrays in batches to prevent UI blocking
 */
export async function processBatches<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R> | R,
  config: Partial<PerformanceConfig> = {},
  onProgress?: (completed: number, total: number) => void
): Promise<R[]> {
  const { batchSize, delayBetweenBatches } = { ...defaultConfig, ...config }
  const results: R[] = []
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    
    // Process batch
    const batchResults = await Promise.all(
      batch.map((item, index) => processor(item, i + index))
    )
    
    results.push(...batchResults)
    
    // Report progress
    if (onProgress) {
      onProgress(Math.min(i + batchSize, items.length), items.length)
    }
    
    // Check memory usage
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memoryUsage = (performance as any).memory.usedJSHeapSize
      if (memoryUsage > defaultConfig.memoryThreshold) {
        console.warn('High memory usage detected, forcing garbage collection pause')
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    }
    
    // Yield to browser between batches
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches))
    }
  }
  
  return results
}

/**
 * Chunking optimization for large text content
 */
export function optimizeChunking(
  content: string,
  chunkSize: number,
  overlap: number = 50
): { chunks: string[], performance: { totalTime: number, chunksPerSecond: number } } {
  const startTime = performance.now()
  
  if (content.length < chunkSize * 2) {
    // Small content, no optimization needed
    return {
      chunks: [content],
      performance: {
        totalTime: performance.now() - startTime,
        chunksPerSecond: 1000 / (performance.now() - startTime)
      }
    }
  }

  const chunks: string[] = []
  const words = content.split(/\s+/)
  
  // Estimate words per chunk for better memory allocation
  const avgWordsPerChunk = Math.floor(chunkSize / 5) // Assume avg 5 chars per word
  
  let currentChunk: string[] = []
  let currentWordCount = 0
  
  for (let i = 0; i < words.length; i++) {
    currentChunk.push(words[i])
    currentWordCount++
    
    // Check if we've reached the target chunk size
    if (currentWordCount >= avgWordsPerChunk || 
        currentChunk.join(' ').length >= chunkSize) {
      
      const chunkText = currentChunk.join(' ')
      chunks.push(chunkText)
      
      // Handle overlap
      if (overlap > 0 && i < words.length - 1) {
        const overlapWords = Math.min(overlap, currentChunk.length)
        currentChunk = currentChunk.slice(-overlapWords)
        currentWordCount = overlapWords
      } else {
        currentChunk = []
        currentWordCount = 0
      }
    }
  }
  
  // Add remaining words as final chunk
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '))
  }
  
  const endTime = performance.now()
  
  return {
    chunks,
    performance: {
      totalTime: endTime - startTime,
      chunksPerSecond: chunks.length / ((endTime - startTime) / 1000)
    }
  }
}

/**
 * Debounced function factory for performance optimization
 */
export function createDebouncedFunction<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

/**
 * Memory usage monitor for large operations
 */
export class MemoryMonitor {
  private checkInterval: number
  private threshold: number
  private onThresholdExceeded?: () => void
  private intervalId?: ReturnType<typeof setInterval>
  
  constructor(
    checkInterval = 5000, // 5 seconds
    threshold = 100 * 1024 * 1024, // 100MB
    onThresholdExceeded?: () => void
  ) {
    this.checkInterval = checkInterval
    this.threshold = threshold
    this.onThresholdExceeded = onThresholdExceeded
  }
  
  start(): void {
    if (typeof performance === 'undefined' || !performance.memory) {
      console.warn('Memory monitoring not available in this environment')
      return
    }
    
    this.intervalId = setInterval(() => {
      const memoryUsage = (performance as any).memory.usedJSHeapSize
      
      if (memoryUsage > this.threshold) {
        console.warn(`Memory usage exceeded threshold: ${(memoryUsage / 1024 / 1024).toFixed(2)}MB`)
        
        if (this.onThresholdExceeded) {
          this.onThresholdExceeded()
        }
      }
    }, this.checkInterval)
  }
  
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }
  }
  
  getCurrentUsage(): { used: number, limit: number, percentage: number } | null {
    if (typeof performance === 'undefined' || !(performance as any).memory) {
      return null
    }
    
    const memory = (performance as any).memory
    return {
      used: memory.usedJSHeapSize,
      limit: memory.jsHeapSizeLimit,
      percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    }
  }
}

/**
 * File processing optimization for large files
 */
export function optimizeFileProcessing() {
  return {
    // Chunk large files into smaller pieces for processing
    chunkFile: (file: File, chunkSize: number = 1024 * 1024): Promise<Blob[]> => {
      return new Promise((resolve) => {
        const chunks: Blob[] = []
        let offset = 0
        
        while (offset < file.size) {
          const chunk = file.slice(offset, offset + chunkSize)
          chunks.push(chunk)
          offset += chunkSize
        }
        
        resolve(chunks)
      })
    },
    
    // Process file content with progress tracking
    processFileContent: async (
      content: string,
      processor: (chunk: string) => Promise<any>,
      onProgress?: (progress: number) => void
    ): Promise<any[]> => {
      const chunkSize = 50000 // 50KB chunks
      const chunks: string[] = []
      
      // Split content into manageable chunks
      for (let i = 0; i < content.length; i += chunkSize) {
        chunks.push(content.slice(i, i + chunkSize))
      }
      
      // Process chunks with progress
      return processBatches(chunks, processor, {}, onProgress)
    }
  }
}

/**
 * Virtual scrolling helper for large lists
 */
export class VirtualScrollManager {
  private containerHeight: number
  private itemHeight: number
  private buffer: number
  
  constructor(containerHeight: number, itemHeight: number, buffer = 5) {
    this.containerHeight = containerHeight
    this.itemHeight = itemHeight
    this.buffer = buffer
  }
  
  getVisibleRange(scrollTop: number, totalItems: number): { start: number, end: number, offset: number } {
    const visibleCount = Math.ceil(this.containerHeight / this.itemHeight)
    const start = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.buffer)
    const end = Math.min(totalItems, start + visibleCount + this.buffer * 2)
    const offset = start * this.itemHeight
    
    return { start, end, offset }
  }
  
  getTotalHeight(itemCount: number): number {
    return itemCount * this.itemHeight
  }
}