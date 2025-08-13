/**
 * Input sanitization utilities for security hardening
 */

// HTML sanitization patterns
const HTML_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /<object[^>]*>.*?<\/object>/gi,
  /<embed[^>]*>/gi,
  /<link[^>]*>/gi,
  /<meta[^>]*>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /on\w+\s*=/gi, // Event handlers like onclick, onload, etc.
]

// SQL injection patterns
const SQL_PATTERNS = [
  /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
  /(--|\/*|\*\/|;)/g,
  /(\'\s*(or|and)\s*\'\s*=\s*\')/gi,
]

// XSS patterns - exported for external use
export const XSS_PATTERNS = [
  /<[^>]*>/g, // HTML tags
  /&#x?[0-9a-f]+;?/gi, // HTML entities
  /%3C|%3E|%22|%27/gi, // URL encoded < > " '
]

export interface SanitizationOptions {
  allowBasicHTML?: boolean
  maxLength?: number
  allowNewlines?: boolean
  trimWhitespace?: boolean
}

/**
 * Sanitize text input to prevent XSS and injection attacks
 */
export function sanitizeText(
  input: string, 
  options: SanitizationOptions = {}
): string {
  if (typeof input !== 'string') {
    return ''
  }

  const {
    allowBasicHTML = false,
    maxLength = 10000,
    allowNewlines = true,
    trimWhitespace = true
  } = options

  let sanitized = input

  // Trim whitespace if requested
  if (trimWhitespace) {
    sanitized = sanitized.trim()
  }

  // Enforce length limits
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }

  // Remove dangerous HTML patterns
  if (!allowBasicHTML) {
    HTML_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '')
    })
  }

  // Remove SQL injection patterns
  SQL_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '')
  })

  // Handle newlines
  if (!allowNewlines) {
    sanitized = sanitized.replace(/[\r\n]/g, ' ')
  }

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ')

  return sanitized
}

/**
 * Sanitize filename to prevent path traversal attacks
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== 'string') {
    return 'unnamed_file'
  }

  // Remove path traversal attempts
  let sanitized = filename.replace(/[\\\/\.\.]/g, '')
  
  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>:"|?*\x00-\x1f]/g, '')
  
  // Limit length
  sanitized = sanitized.substring(0, 255)
  
  // Ensure it's not empty
  if (!sanitized.trim()) {
    sanitized = 'unnamed_file'
  }

  return sanitized
}

/**
 * Sanitize URL to prevent javascript: and data: scheme attacks
 */
export function sanitizeURL(url: string): string {
  if (typeof url !== 'string') {
    return ''
  }

  // Remove dangerous schemes
  const sanitized = url.replace(/^(javascript|data|vbscript):/gi, '')
  
  // Only allow http, https, and relative URLs
  if (sanitized.match(/^(https?:\/\/|\/)/)) {
    return sanitized
  }

  return ''
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHTML(text: string): string {
  if (typeof text !== 'string') {
    return ''
  }

  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Validate and sanitize tag input
 */
export function sanitizeTags(tags: string[]): string[] {
  if (!Array.isArray(tags)) {
    return []
  }

  return tags
    .map(tag => {
      if (typeof tag !== 'string') return ''
      
      // Remove HTML and normalize
      let sanitized = tag.replace(/<[^>]*>/g, '')
      sanitized = sanitized.trim()
      sanitized = sanitized.substring(0, 50) // Limit tag length
      
      return sanitized
    })
    .filter(tag => tag.length > 0 && tag.length <= 50)
    .filter(tag => /^[\w\s\-]+$/.test(tag)) // Only allow alphanumeric, spaces, and hyphens
    .slice(0, 20) // Limit number of tags
}

/**
 * Content validation for chunk content
 */
export function validateChunkContent(content: string): {
  isValid: boolean
  sanitized: string
  warnings: string[]
} {
  const warnings: string[] = []
  let sanitized = content

  if (typeof content !== 'string') {
    return {
      isValid: false,
      sanitized: '',
      warnings: ['Content must be a string']
    }
  }

  // Check for suspicious patterns
  if (HTML_PATTERNS.some(pattern => pattern.test(content))) {
    warnings.push('HTML content detected and removed')
    HTML_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '')
    })
  }

  if (SQL_PATTERNS.some(pattern => pattern.test(content))) {
    warnings.push('Potentially unsafe SQL patterns detected and removed')
    SQL_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '')
    })
  }

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim()

  // Check length
  if (sanitized.length > 100000) { // 100KB limit
    warnings.push('Content truncated due to length limit')
    sanitized = sanitized.substring(0, 100000)
  }

  return {
    isValid: sanitized.length > 0,
    sanitized,
    warnings
  }
}

/**
 * Rate limiting helper for security
 */
class RateLimiter {
  private attempts: Map<string, number[]> = new Map()
  
  isAllowed(key: string, maxAttempts: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now()
    const windowStart = now - windowMs
    
    if (!this.attempts.has(key)) {
      this.attempts.set(key, [])
    }
    
    const attempts = this.attempts.get(key)!
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => time > windowStart)
    this.attempts.set(key, recentAttempts)
    
    if (recentAttempts.length >= maxAttempts) {
      return false
    }
    
    recentAttempts.push(now)
    return true
  }
  
  cleanup(): void {
    const now = Date.now()
    for (const [key, attempts] of this.attempts.entries()) {
      const recent = attempts.filter(time => time > now - 60000)
      if (recent.length === 0) {
        this.attempts.delete(key)
      } else {
        this.attempts.set(key, recent)
      }
    }
  }
}

export const rateLimiter = new RateLimiter()

// Cleanup rate limiter every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000)
}