import { ref, computed } from 'vue'
import { useErrorHandler } from './useErrorHandler'

interface DocumentAnalysis {
  fileName: string
  fileType: 'pdf' | 'markdown' | 'docx' | 'text'
  fileSize: number
  wordCount: number
  characterCount: number
  structure: DocumentStructure
  contentComplexity: ContentComplexity
  recommendations: ChunkingRecommendations
  processingEstimate: ProcessingEstimate
}

interface DocumentStructure {
  hasHeaders: boolean
  headerLevels: number[]
  headerCount: number
  paragraphCount: number
  averageParagraphLength: number
  listCount: number
  tableCount: number
  sections: DocumentSection[]
  structuralComplexity: 'simple' | 'moderate' | 'complex' | 'highly-complex'
}

interface DocumentSection {
  title: string
  level: number
  wordCount: number
  startIndex: number
  endIndex: number
}

interface ContentComplexity {
  averageWordsPerSentence: number
  averageSentencesPerParagraph: number
  vocabularyDiversity: number // unique words / total words
  technicalTermDensity: number
  readabilityScore: number
  complexity: 'simple' | 'moderate' | 'complex' | 'technical'
}

interface ChunkingRecommendations {
  recommendedMethod: 'words' | 'characters' | 'sections'
  recommendedChunkSize: number
  recommendedOverlap: number
  alternativeOptions: {
    method: 'words' | 'characters' | 'sections'
    chunkSize: number
    overlap: number
    reason: string
  }[]
  reasoning: string
  expectedChunkCount: number
}

interface ProcessingEstimate {
  estimatedProcessingTime: string
  memoryUsage: string
  complexity: 'low' | 'medium' | 'high' | 'very-high'
  recommendations: string[]
}

export const useDocumentAnalyzer = () => {
  const { handleAsyncError } = useErrorHandler()
  
  // Analysis state
  const isAnalyzing = ref(false)
  const analysisProgress = ref(0)
  const currentAnalysis = ref<DocumentAnalysis | null>(null)
  
  /**
   * Extract text content from different file types
   */
  const extractContent = async (file: File): Promise<string> => {
    const fileType = getFileType(file)
    
    if (fileType === 'pdf') {
      // For PDF files, we need to use PDF.js to extract text
      // This is a simplified extraction - in practice, you'd use the existing pdfParser
      return await extractPdfText(file)
    } else if (fileType === 'docx') {
      // For DOCX files, use mammoth.js or existing docxParser
      return await extractDocxText(file)
    } else {
      // For text/markdown files
      return await readFileAsText(file)
    }
  }
  
  /**
   * Analyze document structure
   */
  const analyzeStructure = (content: string, fileType: string): DocumentStructure => {
    const lines = content.split('\n')
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0)
    
    // Detect headers based on file type
    let headers: DocumentSection[] = []
    let hasHeaders = false
    let headerLevels: number[] = []
    
    if (fileType === 'markdown' || fileType === 'text') {
      // Markdown header detection
      const headerRegex = /^(#{1,6})\s+(.+)$/gm
      let match
      let index = 0
      
      while ((match = headerRegex.exec(content)) !== null) {
        const level = match[1].length
        const title = match[2].trim()
        const startIndex = match.index
        
        headers.push({
          title,
          level,
          wordCount: 0, // Will be calculated later
          startIndex,
          endIndex: startIndex + match[0].length
        })
        
        headerLevels.push(level)
        hasHeaders = true
        index++
      }
    } else if (fileType === 'pdf' || fileType === 'docx') {
      // For PDF/DOCX, detect headers by formatting patterns
      // This is simplified - in practice, you'd have more sophisticated detection
      const possibleHeaders = lines.filter(line => {
        const trimmed = line.trim()
        return trimmed.length > 0 && 
               trimmed.length < 100 && 
               !trimmed.endsWith('.') && 
               /^[A-Z]/.test(trimmed)
      })
      
      possibleHeaders.forEach((header, index) => {
        headers.push({
          title: header.trim(),
          level: 1, // Default level for PDF/DOCX
          wordCount: header.trim().split(/\s+/).length,
          startIndex: content.indexOf(header),
          endIndex: content.indexOf(header) + header.length
        })
      })
      
      hasHeaders = possibleHeaders.length > 0
      headerLevels = [1] // Default level
    }
    
    // Calculate average paragraph length
    const avgParagraphLength = paragraphs.length > 0 
      ? paragraphs.reduce((sum, p) => sum + p.split(/\s+/).length, 0) / paragraphs.length 
      : 0
    
    // Detect lists (simple pattern matching)
    const listCount = (content.match(/^\s*[-*+]\s+/gm) || []).length +
                      (content.match(/^\s*\d+\.\s+/gm) || []).length
    
    // Detect tables (markdown style and simple patterns)
    const tableCount = (content.match(/\|.*\|/gm) || []).length > 0 ? 1 : 0
    
    // Determine structural complexity
    let structuralComplexity: DocumentStructure['structuralComplexity'] = 'simple'
    
    if (headers.length > 20 || headerLevels.length > 4 || tableCount > 5 || listCount > 20) {
      structuralComplexity = 'highly-complex'
    } else if (headers.length > 10 || headerLevels.length > 3 || tableCount > 2 || listCount > 10) {
      structuralComplexity = 'complex'
    } else if (headers.length > 5 || headerLevels.length > 2 || tableCount > 0 || listCount > 5) {
      structuralComplexity = 'moderate'
    }
    
    return {
      hasHeaders,
      headerLevels: [...new Set(headerLevels)].sort(),
      headerCount: headers.length,
      paragraphCount: paragraphs.length,
      averageParagraphLength: Math.round(avgParagraphLength),
      listCount,
      tableCount,
      sections: headers,
      structuralComplexity
    }
  }
  
  /**
   * Analyze content complexity
   */
  const analyzeContentComplexity = (content: string): ContentComplexity => {
    const words = content.toLowerCase().match(/\b\w+\b/g) || []
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0)
    
    // Calculate basic metrics
    const wordCount = words.length
    const uniqueWords = new Set(words)
    const vocabularyDiversity = uniqueWords.size / wordCount
    
    const averageWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 0
    const averageSentencesPerParagraph = paragraphs.length > 0 ? sentences.length / paragraphs.length : 0
    
    // Technical term detection (simplified)
    const technicalPatterns = [
      /\b\w*(?:tion|sion|ness|ment|ity|ism|ing)\b/g, // Complex suffixes
      /\b[A-Z]{2,}\b/g, // Acronyms
      /\b\w+[-_]\w+\b/g, // Hyphenated/underscore terms
      /\b(?:API|SDK|HTTP|URL|JSON|XML|SQL|CPU|GPU|RAM|SSD|HDD)\b/gi // Common tech terms
    ]
    
    const technicalMatches = technicalPatterns.reduce((sum, pattern) => {
      return sum + (content.match(pattern) || []).length
    }, 0)
    
    const technicalTermDensity = technicalMatches / wordCount
    
    // Simple readability score (Flesch-Kincaid approximation)
    const avgWordsPerSent = averageWordsPerSentence
    const avgSyllables = words.reduce((sum, word) => sum + estimateSyllables(word), 0) / wordCount
    const readabilityScore = 206.835 - (1.015 * avgWordsPerSent) - (84.6 * avgSyllables)
    
    // Determine complexity level
    let complexity: ContentComplexity['complexity'] = 'simple'
    
    if (readabilityScore < 30 || technicalTermDensity > 0.15 || avgWordsPerSent > 20) {
      complexity = 'technical'
    } else if (readabilityScore < 50 || technicalTermDensity > 0.08 || avgWordsPerSent > 15) {
      complexity = 'complex'
    } else if (readabilityScore < 70 || technicalTermDensity > 0.04 || avgWordsPerSent > 12) {
      complexity = 'moderate'
    }
    
    return {
      averageWordsPerSentence: Math.round(averageWordsPerSentence * 10) / 10,
      averageSentencesPerParagraph: Math.round(averageSentencesPerParagraph * 10) / 10,
      vocabularyDiversity: Math.round(vocabularyDiversity * 100) / 100,
      technicalTermDensity: Math.round(technicalTermDensity * 100) / 100,
      readabilityScore: Math.round(readabilityScore),
      complexity
    }
  }
  
  /**
   * Generate chunking recommendations based on analysis
   */
  const generateRecommendations = (
    structure: DocumentStructure, 
    complexity: ContentComplexity,
    wordCount: number,
    fileSize: number
  ): ChunkingRecommendations => {
    
    let recommendedMethod: ChunkingRecommendations['recommendedMethod'] = 'words'
    let recommendedChunkSize = 500
    let recommendedOverlap = 50
    let reasoning = ''
    
    const alternatives: ChunkingRecommendations['alternativeOptions'] = []
    
    // Decision logic based on structure
    if (structure.hasHeaders && structure.headerCount > 3 && structure.structuralComplexity !== 'simple') {
      recommendedMethod = 'sections'
      reasoning = `Document has ${structure.headerCount} headers with ${structure.headerLevels.length} levels. Section-based chunking will preserve document structure.`
      
      // For sections, chunk size is less relevant, but we estimate based on average section size
      const avgSectionSize = Math.round(wordCount / Math.max(structure.headerCount, 1))
      recommendedChunkSize = Math.min(Math.max(avgSectionSize, 200), 1000)
      recommendedOverlap = 0 // Sections don't typically overlap
      
      alternatives.push({
        method: 'words',
        chunkSize: complexity.complexity === 'technical' ? 400 : 600,
        overlap: complexity.complexity === 'technical' ? 60 : 50,
        reason: 'Alternative word-based approach for more consistent chunk sizes'
      })
    } else {
      // Word-based chunking
      recommendedMethod = 'words'
      
      // Adjust chunk size based on complexity
      if (complexity.complexity === 'technical') {
        recommendedChunkSize = 400
        recommendedOverlap = 60
        reasoning = 'Technical content detected. Smaller chunks with higher overlap preserve context better.'
      } else if (complexity.complexity === 'complex') {
        recommendedChunkSize = 500
        recommendedOverlap = 50
        reasoning = 'Complex content requires balanced chunk sizes to maintain coherence.'
      } else if (complexity.complexity === 'moderate') {
        recommendedChunkSize = 600
        recommendedOverlap = 50
        reasoning = 'Moderate complexity allows for larger chunks while maintaining readability.'
      } else {
        recommendedChunkSize = 700
        recommendedOverlap = 40
        reasoning = 'Simple content can use larger chunks with minimal overlap.'
      }
      
      // Adjust for document size
      if (wordCount > 50000) { // Large documents
        recommendedChunkSize = Math.min(recommendedChunkSize + 100, 800)
        reasoning += ' Increased chunk size for large document efficiency.'
      } else if (wordCount < 5000) { // Small documents
        recommendedChunkSize = Math.max(recommendedChunkSize - 100, 200)
        reasoning += ' Decreased chunk size for small document granularity.'
      }
      
      // Add alternative for character-based
      alternatives.push({
        method: 'characters',
        chunkSize: recommendedChunkSize * 5, // ~5 chars per word
        overlap: recommendedOverlap * 5,
        reason: 'Character-based chunking for precise size control'
      })
      
      if (structure.hasHeaders) {
        alternatives.push({
          method: 'sections',
          chunkSize: 0,
          overlap: 0,
          reason: 'Section-based chunking to preserve document structure'
        })
      }
    }
    
    const expectedChunkCount = recommendedMethod === 'sections' 
      ? structure.headerCount || Math.ceil(wordCount / recommendedChunkSize)
      : Math.ceil(wordCount / recommendedChunkSize)
    
    return {
      recommendedMethod,
      recommendedChunkSize,
      recommendedOverlap,
      alternativeOptions: alternatives,
      reasoning,
      expectedChunkCount
    }
  }
  
  /**
   * Generate processing estimates
   */
  const generateProcessingEstimate = (
    wordCount: number,
    fileSize: number,
    complexity: ContentComplexity,
    structure: DocumentStructure
  ): ProcessingEstimate => {
    
    const sizeMB = fileSize / (1024 * 1024)
    
    // Base processing time estimation
    let baseTime = sizeMB * 2 // 2 seconds per MB base
    
    // Complexity multipliers
    const complexityMultipliers = {
      'simple': 1.0,
      'moderate': 1.3,
      'complex': 1.6,
      'technical': 2.0
    }
    
    const structureMultipliers = {
      'simple': 1.0,
      'moderate': 1.2,
      'complex': 1.5,
      'highly-complex': 2.0
    }
    
    const adjustedTime = baseTime * 
      complexityMultipliers[complexity.complexity] * 
      structureMultipliers[structure.structuralComplexity]
    
    const estimatedProcessingTime = adjustedTime < 60 
      ? `${Math.round(adjustedTime)} seconds`
      : `${Math.round(adjustedTime / 60)} minutes`
    
    const memoryUsage = `~${Math.round(sizeMB * 3)}MB RAM`
    
    const processingComplexity = sizeMB < 5 ? 'low' : 
      sizeMB < 20 ? 'medium' : 
      sizeMB < 50 ? 'high' : 'very-high'
    
    const recommendations: string[] = []
    
    if (complexity.complexity === 'technical') {
      recommendations.push('Consider using smaller chunk sizes for technical content')
      recommendations.push('Higher overlap recommended to preserve technical context')
    }
    
    if (structure.structuralComplexity === 'highly-complex') {
      recommendations.push('Section-based chunking recommended for complex structure')
      recommendations.push('Review generated chunks to ensure structural integrity')
    }
    
    if (sizeMB > 20) {
      recommendations.push('Large file detected - processing may take several minutes')
      recommendations.push('Consider processing during off-peak hours')
    }
    
    return {
      estimatedProcessingTime,
      memoryUsage,
      complexity: processingComplexity,
      recommendations
    }
  }
  
  /**
   * Main analysis function
   */
  const analyzeDocument = async (file: File): Promise<DocumentAnalysis> => {
    isAnalyzing.value = true
    analysisProgress.value = 0
    
    try {
      // Step 1: Extract content (20%)
      analysisProgress.value = 10
      const content = await extractContent(file)
      analysisProgress.value = 20
      
      // Step 2: Basic metrics (40%)
      const words = content.match(/\b\w+\b/g) || []
      const wordCount = words.length
      const characterCount = content.length
      analysisProgress.value = 40
      
      // Step 3: Structure analysis (60%)
      const fileType = getFileType(file)
      const structure = analyzeStructure(content, fileType)
      analysisProgress.value = 60
      
      // Step 4: Content complexity (80%)
      const contentComplexity = analyzeContentComplexity(content)
      analysisProgress.value = 80
      
      // Step 5: Generate recommendations (100%)
      const recommendations = generateRecommendations(structure, contentComplexity, wordCount, file.size)
      const processingEstimate = generateProcessingEstimate(wordCount, file.size, contentComplexity, structure)
      analysisProgress.value = 100
      
      const analysis: DocumentAnalysis = {
        fileName: file.name,
        fileType: fileType as DocumentAnalysis['fileType'],
        fileSize: file.size,
        wordCount,
        characterCount,
        structure,
        contentComplexity,
        recommendations,
        processingEstimate
      }
      
      currentAnalysis.value = analysis
      return analysis
      
    } catch (error) {
      throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      isAnalyzing.value = false
      analysisProgress.value = 0
    }
  }
  
  /**
   * Analyze multiple documents and provide batch recommendations
   */
  const analyzeBatch = async (files: File[]): Promise<{
    analyses: DocumentAnalysis[]
    batchRecommendations: ChunkingRecommendations
    overallEstimate: ProcessingEstimate
  }> => {
    const analyses = await Promise.all(files.map(file => analyzeDocument(file)))
    
    // Generate batch recommendations based on all files
    const totalWordCount = analyses.reduce((sum, a) => sum + a.wordCount, 0)
    const avgComplexity = analyses.reduce((sum, a) => {
      const complexityScores = { simple: 1, moderate: 2, complex: 3, technical: 4 }
      return sum + complexityScores[a.contentComplexity.complexity]
    }, 0) / analyses.length
    
    // Determine batch chunking strategy
    const hasStructured = analyses.some(a => a.structure.hasHeaders && a.structure.headerCount > 3)
    const avgChunkSize = analyses.reduce((sum, a) => sum + a.recommendations.recommendedChunkSize, 0) / analyses.length
    
    const batchRecommendations: ChunkingRecommendations = {
      recommendedMethod: hasStructured ? 'sections' : 'words',
      recommendedChunkSize: Math.round(avgChunkSize),
      recommendedOverlap: avgComplexity > 2.5 ? 60 : 50,
      alternativeOptions: [],
      reasoning: `Batch analysis of ${files.length} documents. ${hasStructured ? 'Multiple structured documents detected - section-based chunking recommended.' : 'Word-based chunking provides consistency across documents.'}`,
      expectedChunkCount: analyses.reduce((sum, a) => sum + a.recommendations.expectedChunkCount, 0)
    }
    
    const totalSize = analyses.reduce((sum, a) => sum + a.fileSize, 0)
    const overallEstimate = generateProcessingEstimate(
      totalWordCount,
      totalSize,
      { complexity: avgComplexity > 3 ? 'technical' : avgComplexity > 2 ? 'complex' : 'moderate' } as ContentComplexity,
      { structuralComplexity: hasStructured ? 'complex' : 'moderate' } as DocumentStructure
    )
    
    return {
      analyses,
      batchRecommendations,
      overallEstimate
    }
  }
  
  // Helper functions
  const getFileType = (file: File): string => {
    if (file.type === 'application/pdf') return 'pdf'
    if (file.type.includes('wordprocessingml')) return 'docx'
    if (file.name.toLowerCase().match(/\.(md|markdown)$/)) return 'markdown'
    return 'text'
  }
  
  const estimateSyllables = (word: string): number => {
    word = word.toLowerCase()
    if (word.length <= 3) return 1
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    word = word.replace(/^y/, '')
    const matches = word.match(/[aeiouy]{1,2}/g)
    return matches ? Math.max(matches.length, 1) : 1
  }
  
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Failed to read file as text'))
      reader.readAsText(file)
    })
  }
  
  // Extract text from PDF using existing parser
  const extractPdfText = async (file: File): Promise<string> => {
    try {
      // Import the existing PDF parser
      const { parsePdf } = await import('../utils/pdfParser.js')
      
      // Read file as array buffer
      const buffer = await readFileAsArrayBuffer(file)
      
      // Parse PDF
      const pdfData = await parsePdf(buffer)
      
      return pdfData.text || ''
    } catch (error) {
      console.warn('PDF text extraction failed:', error)
      return 'PDF content could not be extracted for analysis'
    }
  }
  
  // Extract text from DOCX using existing parser
  const extractDocxText = async (file: File): Promise<string> => {
    try {
      // Import the existing DOCX parser
      const { parseDocx } = await import('../utils/docxParser.js')
      
      // Parse DOCX
      const docxText = await parseDocx(file)
      
      return docxText || ''
    } catch (error) {
      console.warn('DOCX text extraction failed:', error)
      return 'DOCX content could not be extracted for analysis'
    }
  }
  
  // Helper to read file as array buffer
  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = () => reject(new Error('Failed to read file as array buffer'))
      reader.readAsArrayBuffer(file)
    })
  }
  
  return {
    // State
    isAnalyzing: computed(() => isAnalyzing.value),
    analysisProgress: computed(() => analysisProgress.value),
    currentAnalysis: computed(() => currentAnalysis.value),
    
    // Methods
    analyzeDocument,
    analyzeBatch,
    
    // Utilities
    getFileType,
    extractContent
  }
}