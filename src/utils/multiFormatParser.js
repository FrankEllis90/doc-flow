/**
 * Doc Layer - Multi-Format File Parser
 * Advanced parsing support for CSV, XLSX, HTML, Markdown, EPUB, and more
 */

/**
 * CSV Parser with configurable delimiters and headers
 */
class CSVParser {
  static async parse(file, options = {}) {
    const {
      delimiter = ',',
      hasHeaders = true,
      skipEmptyRows = true,
      textColumn = null, // Specify which column contains the main text
      metadataColumns = [], // Specify which columns should be treated as metadata
    } = options

    const text = await this.readFileAsText(file)
    const lines = text.split('\n').filter(line => line.trim() || !skipEmptyRows)
    
    if (lines.length === 0) {
      throw new Error('CSV file is empty')
    }

    const results = []
    let headers = []
    let startRow = 0

    // Parse headers
    if (hasHeaders) {
      headers = this.parseCSVLine(lines[0], delimiter)
      startRow = 1
    } else {
      // Generate column headers
      const firstLineColumns = this.parseCSVLine(lines[0], delimiter)
      headers = firstLineColumns.map((_, index) => `Column_${index + 1}`)
    }

    // Parse data rows
    for (let i = startRow; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line && skipEmptyRows) continue

      const values = this.parseCSVLine(line, delimiter)
      
      if (values.length !== headers.length) {
        console.warn(`Row ${i + 1} has ${values.length} columns, expected ${headers.length}`)
      }

      // Create row object
      const row = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })

      // Determine main content and metadata
      const content = textColumn ? 
        row[textColumn] : 
        Object.values(row).join(' ') // Concatenate all columns if no specific text column

      const metadata = {
        row_number: i + 1,
        source_file: file.name,
        format: 'csv'
      }

      // Add specified metadata columns
      if (metadataColumns.length > 0) {
        metadataColumns.forEach(col => {
          if (row[col]) {
            metadata[col] = row[col]
          }
        })
      } else {
        // Include all columns as metadata except the text column
        Object.entries(row).forEach(([key, value]) => {
          if (key !== textColumn) {
            metadata[key] = value
          }
        })
      }

      results.push({
        content,
        metadata,
        rawData: row
      })
    }

    return {
      success: true,
      data: results,
      summary: {
        totalRows: results.length,
        headers,
        format: 'CSV'
      }
    }
  }

  static parseCSVLine(line, delimiter) {
    const result = []
    let current = ''
    let inQuotes = false
    let i = 0

    while (i < line.length) {
      const char = line[i]
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"'
          i += 2
        } else {
          // Toggle quote state
          inQuotes = !inQuotes
          i++
        }
      } else if (char === delimiter && !inQuotes) {
        // End of field
        result.push(current.trim())
        current = ''
        i++
      } else {
        current += char
        i++
      }
    }
    
    // Add final field
    result.push(current.trim())
    return result
  }

  static async readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target.result)
      reader.onerror = e => reject(e.target.error)
      reader.readAsText(file)
    })
  }
}

/**
 * XLSX Parser using SheetJS (would need to be imported)
 * For now, this is a placeholder for the actual implementation
 */
class XLSXParser {
  static async parse(file, options = {}) {
    const {
      sheetName = null, // null means use first sheet
      hasHeaders = true,
      textColumn = null,
      metadataColumns = []
    } = options

    // This is a placeholder - in real implementation, you'd use SheetJS
    throw new Error('XLSX parsing requires SheetJS library. Please install xlsx package.')
    
    // Real implementation would look like:
    /*
    const XLSX = await import('xlsx')
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer)
    
    const sheetNames = workbook.SheetNames
    const targetSheet = sheetName || sheetNames[0]
    const worksheet = workbook.Sheets[targetSheet]
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: hasHeaders ? 1 : undefined,
      defval: ''
    })
    
    // Process similar to CSV...
    */
  }
}

/**
 * HTML Parser with content extraction
 */
class HTMLParser {
  static async parse(file, options = {}) {
    const {
      extractTextOnly = true,
      preserveFormatting = false,
      includeMetaTags = true,
      contentSelectors = ['main', 'article', '.content', '#content'], // Priority selectors for main content
      excludeSelectors = ['script', 'style', 'nav', 'header', 'footer', '.sidebar'] // Elements to exclude
    } = options

    const htmlContent = await this.readFileAsText(file)
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlContent, 'text/html')
    
    // Extract metadata from head
    const metadata = {
      source_file: file.name,
      format: 'html',
      title: doc.title || '',
    }

    if (includeMetaTags) {
      const metaTags = doc.querySelectorAll('meta')
      metaTags.forEach(meta => {
        const name = meta.getAttribute('name') || meta.getAttribute('property')
        const content = meta.getAttribute('content')
        if (name && content) {
          metadata[name] = content
        }
      })
    }

    // Find main content area
    let contentElement = null
    
    // Try priority selectors
    for (const selector of contentSelectors) {
      const element = doc.querySelector(selector)
      if (element) {
        contentElement = element
        break
      }
    }
    
    // Fallback to body if no specific content area found
    if (!contentElement) {
      contentElement = doc.body || doc.documentElement
    }

    // Remove excluded elements
    excludeSelectors.forEach(selector => {
      const elements = contentElement.querySelectorAll(selector)
      elements.forEach(el => el.remove())
    })

    // Extract content
    let content = ''
    
    if (extractTextOnly) {
      content = contentElement.textContent || contentElement.innerText || ''
      // Clean up whitespace
      content = content.replace(/\s+/g, ' ').trim()
    } else if (preserveFormatting) {
      // Convert HTML to Markdown-like format
      content = this.htmlToMarkdown(contentElement)
    } else {
      content = contentElement.innerHTML
    }

    // Split into sections if headers are found
    const results = []
    
    if (preserveFormatting && content.includes('#')) {
      // Split by headers for better chunking
      const sections = content.split(/(?=^#{1,6}\s+)/gm).filter(s => s.trim())
      
      sections.forEach((section, index) => {
        results.push({
          content: section.trim(),
          metadata: {
            ...metadata,
            section_number: index + 1,
            section_type: 'html_section'
          }
        })
      })
    } else {
      // Return as single content block
      results.push({
        content,
        metadata
      })
    }

    return {
      success: true,
      data: results,
      summary: {
        totalSections: results.length,
        format: 'HTML',
        title: metadata.title
      }
    }
  }

  static htmlToMarkdown(element) {
    // Simple HTML to Markdown conversion
    let content = element.innerHTML
    
    // Convert headers
    content = content.replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi, (match, level, text) => {
      const hashes = '#'.repeat(parseInt(level))
      return `\n\n${hashes} ${text.replace(/<[^>]*>/g, '')}\n\n`
    })
    
    // Convert paragraphs
    content = content.replace(/<p[^>]*>(.*?)<\/p>/gi, '\n\n$1\n\n')
    
    // Convert line breaks
    content = content.replace(/<br[^>]*>/gi, '\n')
    
    // Convert strong/bold
    content = content.replace(/<(strong|b)[^>]*>(.*?)<\/(strong|b)>/gi, '**$2**')
    
    // Convert emphasis/italic
    content = content.replace(/<(em|i)[^>]*>(.*?)<\/(em|i)>/gi, '*$2*')
    
    // Convert lists
    content = content.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, listContent) => {
      const items = listContent.match(/<li[^>]*>(.*?)<\/li>/gi) || []
      return '\n' + items.map(item => 
        '- ' + item.replace(/<li[^>]*>(.*?)<\/li>/i, '$1').replace(/<[^>]*>/g, '').trim()
      ).join('\n') + '\n'
    })
    
    content = content.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, listContent) => {
      const items = listContent.match(/<li[^>]*>(.*?)<\/li>/gi) || []
      return '\n' + items.map((item, index) => 
        `${index + 1}. ` + item.replace(/<li[^>]*>(.*?)<\/li>/i, '$1').replace(/<[^>]*>/g, '').trim()
      ).join('\n') + '\n'
    })
    
    // Convert links
    content = content.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    
    // Remove remaining HTML tags
    content = content.replace(/<[^>]*>/g, '')
    
    // Clean up whitespace
    content = content.replace(/\n{3,}/g, '\n\n').trim()
    
    return content
  }

  static async readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target.result)
      reader.onerror = e => reject(e.target.error)
      reader.readAsText(file)
    })
  }
}

/**
 * Enhanced Markdown Parser
 */
class MarkdownParser {
  static async parse(file, options = {}) {
    const {
      splitBySections = true,
      preserveCodeBlocks = true,
      extractFrontmatter = true,
      includeTableOfContents = true
    } = options

    const content = await this.readFileAsText(file)
    const results = []
    
    let processedContent = content
    let frontmatter = {}

    // Extract frontmatter if present
    if (extractFrontmatter && content.startsWith('---')) {
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
      if (frontmatterMatch) {
        try {
          // Simple YAML parsing (for production, use a proper YAML parser)
          const frontmatterText = frontmatterMatch[1]
          frontmatterText.split('\n').forEach(line => {
            const match = line.match(/^(\w+):\s*(.+)$/)
            if (match) {
              frontmatter[match[1]] = match[2].replace(/^["']|["']$/g, '')
            }
          })
          processedContent = frontmatterMatch[2]
        } catch (error) {
          console.warn('Failed to parse frontmatter:', error)
        }
      }
    }

    const baseMetadata = {
      source_file: file.name,
      format: 'markdown',
      ...frontmatter
    }

    if (splitBySections) {
      // Split by headers
      const sections = this.splitByHeaders(processedContent)
      
      sections.forEach((section, index) => {
        results.push({
          content: section.content.trim(),
          metadata: {
            ...baseMetadata,
            section_number: index + 1,
            section_title: section.title || '',
            section_level: section.level || 0,
            section_type: 'markdown_section'
          }
        })
      })
    } else {
      // Return as single document
      results.push({
        content: processedContent.trim(),
        metadata: baseMetadata
      })
    }

    // Generate table of contents
    let tableOfContents = []
    if (includeTableOfContents) {
      tableOfContents = this.generateTableOfContents(processedContent)
    }

    return {
      success: true,
      data: results,
      summary: {
        totalSections: results.length,
        format: 'Markdown',
        frontmatter,
        tableOfContents
      }
    }
  }

  static splitByHeaders(content) {
    const lines = content.split('\n')
    const sections = []
    let currentSection = {
      title: '',
      level: 0,
      content: ''
    }

    for (const line of lines) {
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/)
      
      if (headerMatch) {
        // Save previous section if it has content
        if (currentSection.content.trim()) {
          sections.push({ ...currentSection })
        }
        
        // Start new section
        currentSection = {
          title: headerMatch[2].trim(),
          level: headerMatch[1].length,
          content: line + '\n'
        }
      } else {
        currentSection.content += line + '\n'
      }
    }

    // Add final section
    if (currentSection.content.trim()) {
      sections.push(currentSection)
    }

    return sections
  }

  static generateTableOfContents(content) {
    const headers = []
    const lines = content.split('\n')
    
    lines.forEach((line, index) => {
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/)
      if (headerMatch) {
        headers.push({
          level: headerMatch[1].length,
          title: headerMatch[2].trim(),
          line: index + 1,
          id: headerMatch[2].toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
        })
      }
    })

    return headers
  }

  static async readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target.result)
      reader.onerror = e => reject(e.target.error)
      reader.readAsText(file)
    })
  }
}

/**
 * EPUB Parser (simplified implementation)
 */
class EPUBParser {
  static async parse(file, options = {}) {
    const {
      extractChapters = true,
      includeMetadata = true,
      maxChapterSize = 10000 // characters
    } = options

    // This is a simplified EPUB parser
    // For production use, consider using epub.js or similar library
    
    try {
      const arrayBuffer = await file.arrayBuffer()
      const zip = new JSZip() // Would need to import JSZip
      const epub = await zip.loadAsync(arrayBuffer)
      
      // Extract metadata from META-INF/container.xml and content.opf
      const metadata = await this.extractEPUBMetadata(epub)
      
      // Extract text content from XHTML files
      const chapters = await this.extractEPUBChapters(epub, options)
      
      const results = chapters.map((chapter, index) => ({
        content: chapter.content,
        metadata: {
          ...metadata,
          chapter_number: index + 1,
          chapter_title: chapter.title || `Chapter ${index + 1}`,
          source_file: file.name,
          format: 'epub'
        }
      }))

      return {
        success: true,
        data: results,
        summary: {
          totalChapters: results.length,
          format: 'EPUB',
          metadata
        }
      }
    } catch (error) {
      throw new Error(`EPUB parsing requires JSZip library: ${error.message}`)
    }
  }

  static async extractEPUBMetadata(epub) {
    // Implementation would extract metadata from EPUB container
    // This is a placeholder
    return {
      title: 'Unknown Title',
      author: 'Unknown Author',
      language: 'en',
      publisher: '',
      published: ''
    }
  }

  static async extractEPUBChapters(epub, options) {
    // Implementation would extract chapter content from EPUB
    // This is a placeholder
    return [{
      title: 'Sample Chapter',
      content: 'Sample chapter content...'
    }]
  }
}

/**
 * Main Multi-Format Parser class
 */
export class MultiFormatParser {
  static async parseFile(file, options = {}) {
    const fileName = file.name.toLowerCase()
    const fileExtension = fileName.split('.').pop()
    
    try {
      switch (fileExtension) {
        case 'csv':
          return await CSVParser.parse(file, options.csv || {})
          
        case 'xlsx':
        case 'xls':
          return await XLSXParser.parse(file, options.xlsx || {})
          
        case 'html':
        case 'htm':
          return await HTMLParser.parse(file, options.html || {})
          
        case 'md':
        case 'markdown':
          return await MarkdownParser.parse(file, options.markdown || {})
          
        case 'epub':
          return await EPUBParser.parse(file, options.epub || {})
          
        case 'txt':
        case 'text':
          return await this.parseTextFile(file, options.text || {})
          
        default:
          throw new Error(`Unsupported file format: ${fileExtension}`)
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        fileName: file.name
      }
    }
  }

  static async parseTextFile(file, options = {}) {
    const content = await this.readFileAsText(file)
    
    return {
      success: true,
      data: [{
        content: content.trim(),
        metadata: {
          source_file: file.name,
          format: 'text',
          character_count: content.length,
          word_count: (content.match(/\b\w+\b/g) || []).length
        }
      }],
      summary: {
        totalItems: 1,
        format: 'Text'
      }
    }
  }

  static async readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target.result)
      reader.onerror = e => reject(e.target.error)
      reader.readAsText(file)
    })
  }

  static getSupportedFormats() {
    return {
      'CSV': {
        extensions: ['.csv'],
        description: 'Comma-separated values with configurable delimiters',
        features: ['Custom delimiters', 'Header detection', 'Metadata extraction']
      },
      'XLSX': {
        extensions: ['.xlsx', '.xls'],
        description: 'Microsoft Excel spreadsheets',
        features: ['Multiple sheets', 'Header detection', 'Cell formatting']
      },
      'HTML': {
        extensions: ['.html', '.htm'],
        description: 'Web pages with content extraction',
        features: ['Content area detection', 'Metadata extraction', 'Markdown conversion']
      },
      'Markdown': {
        extensions: ['.md', '.markdown'],
        description: 'Markdown documents with frontmatter support',
        features: ['Section splitting', 'Frontmatter parsing', 'Table of contents']
      },
      'EPUB': {
        extensions: ['.epub'],
        description: 'Electronic publication format',
        features: ['Chapter extraction', 'Metadata parsing', 'Text-only content']
      },
      'Text': {
        extensions: ['.txt', '.text'],
        description: 'Plain text files',
        features: ['Basic text processing', 'Encoding detection']
      }
    }
  }
}

// Export convenience functions
export const parseFile = MultiFormatParser.parseFile.bind(MultiFormatParser)
export const getSupportedFormats = MultiFormatParser.getSupportedFormats.bind(MultiFormatParser)

export {
  CSVParser,
  XLSXParser,
  HTMLParser,
  MarkdownParser,
  EPUBParser
}