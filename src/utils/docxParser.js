/**
 * DOCX Document Parser
 * Extracts text content and metadata from DOCX files using mammoth.js
 */

import mammoth from 'mammoth';

/**
 * Parse DOCX file and extract text content
 * @param {File} file - The DOCX file to parse
 * @returns {Promise<string>} - Plain text content
 */
export async function parseDocx(file) {
  try {
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Use mammoth to extract text from DOCX
    const result = await mammoth.extractRawText({ 
      arrayBuffer: arrayBuffer 
    });
    
    // Log any warnings from mammoth
    if (result.messages && result.messages.length > 0) {
      console.warn('DOCX parsing warnings:', result.messages);
    }
    
    return result.value;
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error(`Failed to parse DOCX file: ${error.message}`);
  }
}

/**
 * Parse DOCX file and extract HTML content (preserving some formatting)
 * @param {File} file - The DOCX file to parse
 * @returns {Promise<string>} - HTML content
 */
export async function parseDocxToHtml(file) {
  try {
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Use mammoth to convert DOCX to HTML
    const result = await mammoth.convertToHtml({ 
      arrayBuffer: arrayBuffer,
      // Configure mammoth options for better HTML output
      options: {
        // Preserve bold and italic formatting
        preserveEmptyParagraphs: true,
        includeEmbeddedStyleMap: true,
        // Custom style mappings for better output
        styleMap: [
          "p[style-name='Title'] => h1:fresh",
          "p[style-name='Heading 1'] => h2:fresh",
          "p[style-name='Heading 2'] => h3:fresh",
          "p[style-name='Heading 3'] => h4:fresh",
          "p[style-name='Quote'] => blockquote > p:fresh"
        ]
      }
    });
    
    // Log any warnings from mammoth
    if (result.messages && result.messages.length > 0) {
      console.warn('DOCX to HTML conversion warnings:', result.messages);
    }
    
    return result.value;
  } catch (error) {
    console.error('Error converting DOCX to HTML:', error);
    throw new Error(`Failed to convert DOCX to HTML: ${error.message}`);
  }
}

/**
 * Extract metadata from DOCX file
 * @param {File} file - The DOCX file
 * @returns {Promise<Object>} - Metadata object
 */
export async function extractDocxMetadata(file) {
  try {
    const metadata = {
      name: file.name,
      size: file.size,
      type: 'docx',
      lastModified: file.lastModified ? new Date(file.lastModified) : null,
      // Additional DOCX-specific metadata will be populated after parsing
      pageCount: null,
      wordCount: null,
      characterCount: null,
      hasImages: false,
      hasTables: false
    };
    
    // Parse content to get additional metadata
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
    
    // Estimate word count from extracted text
    const textContent = result.value.replace(/<[^>]*>/g, ''); // Strip HTML tags
    metadata.wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
    metadata.characterCount = textContent.length;
    
    // Check for images and tables in HTML output
    metadata.hasImages = result.value.includes('<img');
    metadata.hasTables = result.value.includes('<table');
    
    // Log any processing messages
    if (result.messages && result.messages.length > 0) {
      metadata.processingMessages = result.messages.map(msg => ({
        type: msg.type,
        message: msg.message
      }));
    }
    
    return metadata;
  } catch (error) {
    console.error('Error extracting DOCX metadata:', error);
    // Return basic metadata even if detailed extraction fails
    return {
      name: file.name,
      size: file.size,
      type: 'docx',
      lastModified: file.lastModified ? new Date(file.lastModified) : null,
      error: error.message
    };
  }
}

/**
 * Convert DOCX content to markdown-like format
 * This helps maintain some structure for better chunking
 * @param {string} htmlContent - HTML content from DOCX conversion
 * @returns {string} - Markdown-formatted content
 */
export function convertDocxHtmlToMarkdown(htmlContent) {
  let markdown = htmlContent;
  
  // Convert headings
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
  markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
  markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');
  
  // Convert bold and italic
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  
  // Convert paragraphs
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  
  // Convert lists
  markdown = markdown.replace(/<ul[^>]*>/gi, '');
  markdown = markdown.replace(/<\/ul>/gi, '\n');
  markdown = markdown.replace(/<ol[^>]*>/gi, '');
  markdown = markdown.replace(/<\/ol>/gi, '\n');
  markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  
  // Convert blockquotes
  markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n');
  
  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]*>/g, '');
  
  // Clean up extra whitespace
  markdown = markdown.replace(/\n\s*\n\s*\n/g, '\n\n');
  markdown = markdown.trim();
  
  return markdown;
}

/**
 * Validate DOCX file before processing
 * @param {File} file - The file to validate
 * @returns {Object} - Validation result
 */
export function validateDocxFile(file) {
  const validation = {
    isValid: true,
    errors: [],
    warnings: []
  };
  
  // Check file extension
  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith('.docx')) {
    validation.isValid = false;
    validation.errors.push('File must have .docx extension');
  }
  
  // Check MIME type
  const validMimeTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream' // Sometimes DOCX files have this MIME type
  ];
  
  if (!validMimeTypes.includes(file.type) && file.type !== '') {
    validation.warnings.push('Unexpected MIME type: ' + file.type);
  }
  
  // Check file size (50MB limit)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    validation.isValid = false;
    validation.errors.push(`File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum limit of 50MB`);
  }
  
  // Check minimum file size (empty DOCX files are usually at least 1KB)
  if (file.size < 1000) {
    validation.warnings.push('File seems very small, may be empty or corrupted');
  }
  
  return validation;
}