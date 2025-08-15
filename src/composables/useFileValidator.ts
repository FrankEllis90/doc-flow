import { ref, computed } from 'vue'
import { useErrorHandler } from './useErrorHandler'

interface FileValidationResult {
  isValid: boolean
  error?: string
  warnings?: string[]
  suggestions?: string[]
  sanitizedName?: string
  metadata?: {
    estimatedProcessingTime: string
    complexity: 'low' | 'medium' | 'high' | 'very-high'
    recommendedChunkSize: number
    memoryUsage: string
  }
}

interface ValidationConfig {
  maxFileSize: {
    pdf: number
    markdown: number
    docx: number
    default: number
  }
  maxTotalSize: number
  maxFileCount: number
  strictMode: boolean
  allowAdvancedFormats: boolean
  performDeepValidation: boolean
}

interface SecurityCheckResult {
  isSecure: boolean
  threats: string[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

export const useFileValidator = () => {
  const { handleAsyncError } = useErrorHandler()
  
  // Default validation configuration
  const defaultConfig = ref<ValidationConfig>({
    maxFileSize: {
      pdf: 75 * 1024 * 1024,     // 75MB for PDFs (increased from 50MB)
      markdown: 15 * 1024 * 1024, // 15MB for markdown (increased from 10MB)
      docx: 50 * 1024 * 1024,     // 50MB for DOCX files
      default: 25 * 1024 * 1024   // 25MB for unknown types
    },
    maxTotalSize: 500 * 1024 * 1024, // 500MB total (increased from 200MB)
    maxFileCount: 30,                // 30 files max (increased from 20)
    strictMode: false,
    allowAdvancedFormats: true,
    performDeepValidation: true
  })
  
  // Dangerous file patterns and extensions
  const SECURITY_PATTERNS = {
    dangerousExtensions: [
      '.exe', '.bat', '.cmd', '.scr', '.pif', '.vbs', '.js', '.jar', 
      '.com', '.app', '.deb', '.pkg', '.dmg', '.msi', '.run', '.bin'
    ],
    suspiciousNames: [
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i, // Windows reserved names
      /\.{2,}/, // Multiple consecutive dots
      /^\./, // Hidden files starting with dot
      /[\x00-\x1f]/, // Control characters
      /[<>:"/\\|?*]/ // Invalid filename characters
    ],
    maliciousPatterns: [
      /%[0-9a-f]{2}/i, // URL encoding attempts
      /\\x[0-9a-f]{2}/i, // Hex encoding attempts
      /\$\{.*\}/, // Template injection patterns
      /<script|javascript:|data:/i, // Script injection patterns
      /eval\s*\(|function\s*\(|=\s*>/ // Code execution patterns
    ]
  }
  
  // MIME type validation mapping
  const MIME_VALIDATION = {
    'application/pdf': {
      extensions: ['.pdf'],
      magicNumbers: ['%PDF'],
      maxSize: () => defaultConfig.value.maxFileSize.pdf,
      category: 'pdf'
    },
    'text/markdown': {
      extensions: ['.md', '.markdown'],
      magicNumbers: [], // Text files don't have magic numbers
      maxSize: () => defaultConfig.value.maxFileSize.markdown,
      category: 'markdown'
    },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
      extensions: ['.docx'],
      magicNumbers: ['PK'], // ZIP-based format
      maxSize: () => defaultConfig.value.maxFileSize.docx,
      category: 'docx'
    },
    'text/plain': {
      extensions: ['.txt'],
      magicNumbers: [],
      maxSize: () => defaultConfig.value.maxFileSize.markdown,
      category: 'markdown'
    }
  }
  
  /**
   * Validate filename for security and format issues
   */
  const validateFilename = (filename: string): FileValidationResult => {
    const warnings: string[] = []
    const suggestions: string[] = []
    
    // Sanitize filename
    let sanitizedName = filename.replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
    
    // Check for dangerous extensions
    const hasDangerousExt = SECURITY_PATTERNS.dangerousExtensions.some(ext =>
      filename.toLowerCase().endsWith(ext)
    )
    
    if (hasDangerousExt) {
      return {
        isValid: false,
        error: `Potentially dangerous file type detected: ${filename}. Only document files (PDF, Markdown, DOCX) are allowed.`,
        sanitizedName
      }
    }
    
    // Check for suspicious name patterns
    for (const pattern of SECURITY_PATTERNS.suspiciousNames) {
      if (pattern.test(filename)) {
        return {
          isValid: false,
          error: `Invalid filename format: ${filename}. Please use a standard filename with alphanumeric characters.`,
          sanitizedName
        }
      }
    }
    
    // Check for malicious patterns
    for (const pattern of SECURITY_PATTERNS.maliciousPatterns) {
      if (pattern.test(filename)) {
        return {
          isValid: false,
          error: `Potentially malicious filename pattern detected in: ${filename}`,
          sanitizedName
        }
      }
    }
    
    // Warn about long filenames
    if (filename.length > 100) {
      warnings.push('Filename is very long and may cause display issues')
      suggestions.push('Consider using a shorter filename')
      sanitizedName = sanitizedName.substring(0, 100)
    }
    
    // Warn about special characters
    if (/[^\w\-\.\s]/.test(filename)) {
      warnings.push('Filename contains special characters that may cause issues')
      suggestions.push('Use only letters, numbers, spaces, hyphens, and periods')
    }
    
    return {
      isValid: true,
      warnings: warnings.length > 0 ? warnings : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      sanitizedName
    }
  }
  
  /**
   * Validate file type and MIME type consistency
   */
  const validateFileType = (file: File): FileValidationResult => {
    const filename = file.name.toLowerCase()
    const mimeType = file.type
    
    // Check by file extension (most reliable)
    const allowedExtensions = ['.pdf', '.md', '.markdown', '.docx', '.txt']
    const hasValidExtension = allowedExtensions.some(ext => filename.endsWith(ext))
    
    // If it's clearly a markdown file by extension, accept it immediately
    if (filename.endsWith('.md') || filename.endsWith('.markdown')) {
      return { isValid: true }
    }
    
    // Check other valid extensions
    if (hasValidExtension) {
      return { isValid: true }
    }
    
    // If we get here, the file was rejected
    return {
      isValid: false,
      error: `Unsupported file type: ${mimeType || 'unknown'}. Supported formats: PDF, Markdown (.md), DOCX, and plain text.`
    }
  }
  
  /**
   * Validate file size with intelligent limits
   */
  const validateFileSize = (file: File): FileValidationResult => {
    const filename = file.name.toLowerCase()
    
    // Determine file category based on extension (more reliable than MIME type)
    let category = 'default'
    let maxSize = defaultConfig.value.maxFileSize.default
    
    if (filename.endsWith('.pdf')) {
      category = 'pdf'
      maxSize = defaultConfig.value.maxFileSize.pdf
    } else if (filename.endsWith('.docx')) {
      category = 'docx'
      maxSize = defaultConfig.value.maxFileSize.docx
    } else if (filename.endsWith('.md') || filename.endsWith('.markdown') || filename.endsWith('.txt')) {
      category = 'markdown'
      maxSize = defaultConfig.value.maxFileSize.markdown
    }
    
    const sizeMB = file.size / (1024 * 1024)
    const warnings: string[] = []
    const suggestions: string[] = []
    
    if (file.size === 0) {
      return {
        isValid: false,
        error: 'File appears to be empty'
      }
    }
    
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size (${sizeMB.toFixed(1)}MB) exceeds the ${Math.round(maxSize / 1024 / 1024)}MB limit for ${category} files`
      }
    }
    
    // Warnings for large files
    if (file.size > maxSize * 0.8) {
      warnings.push(`Large file detected (${sizeMB.toFixed(1)}MB). Processing may take longer.`)
      suggestions.push('Consider splitting large documents into smaller sections for better performance.')
    }
    
    if (file.size > maxSize * 0.5) {
      warnings.push('File is quite large and may require extended processing time.')
    }
    
    // Add estimated processing metadata
    const complexity = sizeMB < 5 ? 'low' : sizeMB < 20 ? 'medium' : sizeMB < 50 ? 'high' : 'very-high'
    const estimatedTime = sizeMB < 1 ? '< 1 minute' : 
                         sizeMB < 5 ? '1-2 minutes' :
                         sizeMB < 20 ? '2-5 minutes' :
                         sizeMB < 50 ? '5-10 minutes' : '10+ minutes'
    
    return {
      isValid: true,
      warnings: warnings.length > 0 ? warnings : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      metadata: {
        estimatedProcessingTime: estimatedTime,
        complexity,
        recommendedChunkSize: complexity === 'low' ? 800 : complexity === 'medium' ? 600 : 400,
        memoryUsage: `~${Math.round(sizeMB * 2)}MB RAM`
      }
    }
  }
  
  /**
   * Perform deep content validation by reading file header
   */
  const validateFileContent = async (file: File): Promise<FileValidationResult> => {
    const result = await handleAsyncError(async () => {
      // For markdown files, determine validation by file extension since MIME type might be empty
      const filename = file.name.toLowerCase()
      const isMarkdown = filename.endsWith('.md') || filename.endsWith('.markdown')
      const isText = filename.endsWith('.txt')
      
      // Skip magic number validation for text/markdown files
      if (isMarkdown || isText || !file.type) {
        return { isValid: true }
      }
      
      const validation = MIME_VALIDATION[file.type as keyof typeof MIME_VALIDATION]
      
      if (!validation || validation.magicNumbers.length === 0) {
        // Skip magic number validation for unknown or text files
        return { isValid: true }
      }
      
      // Read file header for magic number validation
      const headerSize = Math.min(1024, file.size) // Read first 1KB
      const chunk = file.slice(0, headerSize)
      
      if (file.type === 'application/pdf') {
        // Validate PDF header
        const buffer = await readFileAsArrayBuffer(chunk)
        const headerArray = new Uint8Array(buffer)
        const header = String.fromCharCode.apply(null, Array.from(headerArray.slice(0, 4)))
        
        if (header !== '%PDF') {
          return {
            isValid: false,
            error: 'File appears to be corrupted or is not a valid PDF'
          }
        }
        
        // Check for encrypted PDF
        const fullHeader = String.fromCharCode.apply(null, Array.from(headerArray))
        if (fullHeader.includes('/Encrypt') || fullHeader.includes('encrypted')) {
          return {
            isValid: false,
            error: 'PDF file is password protected or encrypted. Please use an unprotected PDF.'
          }
        }
        
      } else if (file.type.includes('wordprocessingml')) {
        // Validate DOCX (ZIP-based) header
        const buffer = await readFileAsArrayBuffer(chunk)
        const headerArray = new Uint8Array(buffer)
        const header = String.fromCharCode.apply(null, Array.from(headerArray.slice(0, 2)))
        
        if (header !== 'PK') {
          return {
            isValid: false,
            error: 'File appears to be corrupted or is not a valid DOCX file'
          }
        }
      }
      
      return { isValid: true }
    }, { component: 'FileValidator', action: 'validateFileContent' })
    
    // handleAsyncError wraps the result in a data property, extract it
    const finalResult = result?.data || { isValid: false, error: 'Content validation failed' }
    return finalResult as FileValidationResult
  }
  
  /**
   * Perform security-focused validation
   */
  const performSecurityCheck = async (file: File): Promise<SecurityCheckResult> => {
    const threats: string[] = []
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
    
    // Check file size for potential zip bombs or excessive memory usage
    if (file.size > 100 * 1024 * 1024) { // > 100MB
      threats.push('Large file size may cause memory issues')
      riskLevel = 'medium'
    }
    
    // Check filename for suspicious patterns
    const filename = file.name.toLowerCase()
    
    if (SECURITY_PATTERNS.dangerousExtensions.some(ext => filename.endsWith(ext))) {
      threats.push('Potentially dangerous file extension')
      riskLevel = 'critical'
    }
    
    // Check for double extensions (e.g., document.pdf.exe)
    const extensionCount = (filename.match(/\./g) || []).length
    if (extensionCount > 2) {
      threats.push('Multiple file extensions detected')
      riskLevel = 'high'
    }
    
    // Check for embedded content in text files
    if (file.type.startsWith('text/') && defaultConfig.value.performDeepValidation) {
      try {
        const textContent = await readFileAsText(file.slice(0, 4096)) // Read first 4KB
        
        if (/<script|javascript:|data:/i.test(textContent)) {
          threats.push('Potentially malicious script content detected')
          riskLevel = 'high'
        }
        
        if (/%[0-9a-f]{2}|\\x[0-9a-f]{2}/i.test(textContent)) {
          threats.push('Suspicious encoding patterns found')
          riskLevel = 'medium'
        }
      } catch (error) {
        threats.push('Unable to scan file content')
        riskLevel = 'medium'
      }
    }
    
    return {
      isSecure: threats.length === 0,
      threats,
      riskLevel
    }
  }
  
  /**
   * Comprehensive file validation
   */
  const validateFile = async (file: File): Promise<FileValidationResult> => {
    // Step 1: Basic filename validation
    const filenameResult = validateFilename(file.name)
    if (!filenameResult.isValid) {
      return filenameResult
    }
    
    // Step 2: File type validation
    const typeResult = validateFileType(file)
    if (!typeResult.isValid) {
      return typeResult
    }
    
    // Step 3: File size validation
    const sizeResult = validateFileSize(file)
    if (!sizeResult.isValid) {
      return sizeResult
    }
    
    // Step 4: Content validation (if enabled)
    let contentResult: FileValidationResult = { isValid: true }
    if (defaultConfig.value.performDeepValidation) {
      contentResult = await validateFileContent(file)
      if (!contentResult.isValid) {
        return contentResult
      }
    }
    
    // Step 5: Security check
    const securityResult = await performSecurityCheck(file)
    if (!securityResult.isSecure && securityResult.riskLevel === 'critical') {
      return {
        isValid: false,
        error: `Security threat detected: ${securityResult.threats.join(', ')}`
      }
    }
    
    // Compile warnings and suggestions from all checks
    const allWarnings = [
      ...(filenameResult.warnings || []),
      ...(sizeResult.warnings || []),
      ...(contentResult.warnings || [])
    ]
    
    const allSuggestions = [
      ...(filenameResult.suggestions || []),
      ...(sizeResult.suggestions || []),
      ...(contentResult.suggestions || [])
    ]
    
    // Add security warnings for non-critical threats
    if (securityResult.threats.length > 0 && securityResult.riskLevel !== 'critical') {
      allWarnings.push(`Security notice: ${securityResult.threats.join(', ')}`)
    }
    
    return {
      isValid: true,
      warnings: allWarnings.length > 0 ? allWarnings : undefined,
      suggestions: allSuggestions.length > 0 ? allSuggestions : undefined,
      sanitizedName: filenameResult.sanitizedName,
      metadata: sizeResult.metadata
    }
  }
  
  /**
   * Validate batch of files
   */
  const validateFiles = async (files: File[], existingFiles: File[] = []): Promise<{
    valid: Array<{ file: File; validation: FileValidationResult }>
    invalid: Array<{ file: File; validation: FileValidationResult }>
    totalSizeExceeded: boolean
    countExceeded: boolean
  }> => {
    const valid: Array<{ file: File; validation: FileValidationResult }> = []
    const invalid: Array<{ file: File; validation: FileValidationResult }> = []
    
    // Check total count
    const totalCount = files.length + existingFiles.length
    const countExceeded = totalCount > defaultConfig.value.maxFileCount
    
    // Calculate total size
    const existingSize = existingFiles.reduce((sum, file) => sum + file.size, 0)
    const newSize = files.reduce((sum, file) => sum + file.size, 0)
    const totalSizeExceeded = (existingSize + newSize) > defaultConfig.value.maxTotalSize
    
    // Validate each file
    for (const file of files) {
      const validation = await validateFile(file)
      
      if (validation.isValid) {
        valid.push({ file, validation })
      } else {
        invalid.push({ file, validation })
      }
    }
    
    return {
      valid,
      invalid,
      totalSizeExceeded,
      countExceeded
    }
  }
  
  /**
   * Update validation configuration
   */
  const updateConfig = (config: Partial<ValidationConfig>) => {
    defaultConfig.value = { ...defaultConfig.value, ...config }
  }
  
  /**
   * Get current configuration
   */
  const getConfig = () => defaultConfig.value
  
  /**
   * Helper function to read file as array buffer
   */
  const readFileAsArrayBuffer = (file: Blob): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = () => reject(new Error('Failed to read file as array buffer'))
      reader.readAsArrayBuffer(file)
    })
  }
  
  /**
   * Helper function to read file as text
   */
  const readFileAsText = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Failed to read file as text'))
      reader.readAsText(file)
    })
  }
  
  return {
    // Main validation functions
    validateFile,
    validateFiles,
    validateFilename,
    validateFileType,
    validateFileSize,
    validateFileContent,
    performSecurityCheck,
    
    // Configuration
    updateConfig,
    getConfig,
    
    // Computed properties
    config: computed(() => defaultConfig.value),
    maxFileSize: computed(() => defaultConfig.value.maxFileSize),
    maxTotalSize: computed(() => defaultConfig.value.maxTotalSize),
    maxFileCount: computed(() => defaultConfig.value.maxFileCount)
  }
}