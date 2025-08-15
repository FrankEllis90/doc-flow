import * as pdfjsLib from 'pdfjs-dist';

// Worker recovery mechanism
let workerRecoveryAttempts = 0;
const MAX_WORKER_RECOVERY_ATTEMPTS = 3;

// Memory monitoring
let activeDocuments = new Set();
let memoryPressureDetected = false;
const MAX_CONCURRENT_DOCUMENTS = 2;

// Timeout configurations
const TIMEOUTS = {
  PDF_LOAD: 60000,      // 60 seconds for PDF loading
  PAGE_LOAD: 15000,     // 15 seconds per page
  TEXT_EXTRACT: 10000,  // 10 seconds per page text extraction
  METADATA: 5000        // 5 seconds for metadata
};

// Configure PDF.js worker with proper fallback and recovery
const configureWorker = () => {
  // First try CDN worker to ensure compatibility
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
  
  // Alternative: try local worker if CDN fails
  // pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.mjs';
};

// Worker error recovery function
const recoverWorker = async () => {
  if (workerRecoveryAttempts >= MAX_WORKER_RECOVERY_ATTEMPTS) {
    throw new Error('PDF worker recovery failed after maximum attempts - please refresh the page');
  }
  
  workerRecoveryAttempts++;
  console.warn(`Attempting PDF worker recovery (attempt ${workerRecoveryAttempts}/${MAX_WORKER_RECOVERY_ATTEMPTS})`);
  
  try {
    // Destroy any existing workers
    if (pdfjsLib.GlobalWorkerOptions.workerPort) {
      try {
        pdfjsLib.GlobalWorkerOptions.workerPort.terminate();
      } catch (error) {
        console.warn('Error terminating existing worker:', error);
      }
    }
    
    // Reset worker configuration
    pdfjsLib.GlobalWorkerOptions.workerPort = null;
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    
    // Small delay before retry
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error('Worker recovery attempt failed:', error);
    return false;
  }
};

// Reset worker recovery counter on successful operations
const resetWorkerRecovery = () => {
  workerRecoveryAttempts = 0;
};

// Memory pressure detection
const detectMemoryPressure = () => {
  if (typeof performance !== 'undefined' && performance.memory) {
    const memInfo = performance.memory;
    const memoryUsageRatio = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
    memoryPressureDetected = memoryUsageRatio > 0.8; // 80% threshold
    
    if (memoryPressureDetected) {
      console.warn(`Memory pressure detected: ${(memoryUsageRatio * 100).toFixed(1)}% used`);
    }
    
    return memoryPressureDetected;
  }
  return false;
};

// Track document processing
const trackDocument = (documentId) => {
  activeDocuments.add(documentId);
  if (activeDocuments.size > MAX_CONCURRENT_DOCUMENTS) {
    console.warn(`Too many concurrent PDF documents: ${activeDocuments.size}/${MAX_CONCURRENT_DOCUMENTS}`);
  }
};

const untrackDocument = (documentId) => {
  activeDocuments.delete(documentId);
};

configureWorker();

export async function parsePdf(fileBuffer) {
  let loadingTask = null;
  let pdf = null;
  const processedPages = [];
  let retryWithWorkerRecovery = false;
  
  // Generate unique document ID for tracking
  const documentId = `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Check for memory pressure before starting
  detectMemoryPressure();
  
  // Check concurrent document limit
  if (activeDocuments.size >= MAX_CONCURRENT_DOCUMENTS) {
    throw new Error(`Too many PDFs being processed simultaneously. Please wait for current operations to complete. (${activeDocuments.size}/${MAX_CONCURRENT_DOCUMENTS})`);
  }
  
  trackDocument(documentId);
  
  const attemptPdfParsing = async (isRetry = false) => {
    try {
      // Validate that this looks like a PDF
      const uint8Array = new Uint8Array(fileBuffer);
      const pdfHeader = String.fromCharCode.apply(null, uint8Array.slice(0, 4));
      
      if (pdfHeader !== '%PDF') {
        throw new Error('Invalid PDF file: File does not start with PDF header');
      }
      
      // Load the PDF document with worker error handling and timeout
      loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
        verbosity: 0, // Reduce console output
        disableWorker: false, // Keep worker enabled for performance
        disableAutoFetch: true, // Disable auto-fetching for better control
        disableStream: true, // Disable streaming for stability
        cMapUrl: null, // Disable cmap loading to reduce memory usage
        cMapPacked: false,
        maxImageSize: -1, // Disable image size limits for better compatibility
        isEvalSupported: false, // Disable eval for security
        useSystemFonts: false // Don't use system fonts
      });
      
      // Add error handler for worker issues
      loadingTask.onUnsupportedFeature = (featureId) => {
        console.warn('PDF feature not supported:', featureId);
      };
      
      // Add timeout protection for large PDFs with dynamic timeout based on memory pressure
      const timeoutDuration = memoryPressureDetected ? TIMEOUTS.PDF_LOAD / 2 : TIMEOUTS.PDF_LOAD;
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`PDF processing timeout after ${timeoutDuration/1000}s - file may be too large or system under memory pressure`)), timeoutDuration);
      });
      
      pdf = await Promise.race([loadingTask.promise, timeoutPromise]);
      
      // Reset worker recovery counter on successful loading
      if (!isRetry) {
        resetWorkerRecovery();
      }
      
      return pdf;
    } catch (error) {
      // Check if this is a worker-related error that might benefit from recovery
      if ((error.message.includes('worker') || 
           error.message.includes('Worker') || 
           error.message.includes('WorkerMessageHandler') ||
           error.message.includes('postMessage') ||
           error.message.includes('terminate')) && !isRetry) {
        retryWithWorkerRecovery = true;
        throw error;
      }
      throw error;
    }
  };
  
  try {
    // First attempt
    pdf = await attemptPdfParsing(false);
  } catch (initialError) {
    if (retryWithWorkerRecovery) {
      console.warn('PDF worker issue detected, attempting recovery...');
      try {
        // Attempt worker recovery
        await recoverWorker();
        
        // Clean up failed loading task
        if (loadingTask && typeof loadingTask.destroy === 'function') {
          try {
            loadingTask.destroy();
          } catch (cleanupError) {
            console.warn('Error cleaning up failed loading task:', cleanupError);
          }
        }
        loadingTask = null;
        
        // Retry parsing with recovered worker
        pdf = await attemptPdfParsing(true);
        console.info('PDF worker recovery successful');
      } catch (recoveryError) {
        console.error('PDF worker recovery failed:', recoveryError);
        throw initialError; // Throw the original error
      }
    } else {
      throw initialError;
    }
  }

  try {
    // Extract text from all pages
    let fullText = '';
    const metadata = {
      numPages: pdf.numPages,
      info: null,
      textLength: 0,
      extractionQuality: 'good'
    };
    
    // Get document info with error protection and adaptive timeout
    try {
      const metadataTimeout = memoryPressureDetected ? TIMEOUTS.METADATA / 2 : TIMEOUTS.METADATA;
      const metadataResult = await Promise.race([
        pdf.getMetadata(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Metadata timeout')), metadataTimeout))
      ]);
      metadata.info = metadataResult;
    } catch (error) {
      console.warn('Could not extract PDF metadata:', error);
      metadata.info = null;
    }
    
    // Extract text from each page with memory management
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      let page = null;
      try {
        // Check memory pressure before processing page
        detectMemoryPressure();
        
        // Get page with adaptive timeout protection
        const pageTimeout = memoryPressureDetected ? TIMEOUTS.PAGE_LOAD / 2 : TIMEOUTS.PAGE_LOAD;
        page = await Promise.race([
          pdf.getPage(pageNum),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Page ${pageNum} timeout after ${pageTimeout/1000}s`)), pageTimeout)
          )
        ]);
        
        processedPages.push(page);
        
        // Extract text content with adaptive timeout
        const textTimeout = memoryPressureDetected ? TIMEOUTS.TEXT_EXTRACT / 2 : TIMEOUTS.TEXT_EXTRACT;
        const textContent = await Promise.race([
          page.getTextContent({
            normalizeWhitespace: true,
            disableCombineTextItems: false
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Text extraction timeout for page ${pageNum} after ${textTimeout/1000}s`)), textTimeout)
          )
        ]);
        
        // Combine text items into readable text
        const pageText = textContent.items
          .filter(item => item.str && item.str.trim()) // Filter out empty items
          .map(item => item.str)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (pageText && pageText.length > 0) {
          fullText += pageText + '\n\n';
        }
        
        // Force cleanup of page resources immediately
        if (page && typeof page.cleanup === 'function') {
          page.cleanup();
        }
        
        // Clear page reference
        page = null;
        
        // Force garbage collection more aggressively under memory pressure
        const gcFrequency = memoryPressureDetected ? 5 : 10;
        if (pageNum % gcFrequency === 0) {
          if (typeof window !== 'undefined' && window.gc) {
            window.gc();
          }
          // Re-check memory pressure after GC
          detectMemoryPressure();
        }
        
      } catch (pageError) {
        console.warn(`Error extracting text from page ${pageNum}:`, pageError);
        // Clean up page even on error
        if (page && typeof page.cleanup === 'function') {
          try {
            page.cleanup();
          } catch (cleanupError) {
            console.warn(`Error cleaning up page ${pageNum}:`, cleanupError);
          }
        }
        // Continue with other pages
      }
    }
    
    // Clean up the extracted text
    const cleanText = fullText
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
    
    // Update metadata
    metadata.textLength = cleanText.length;
    metadata.extractionQuality = cleanText.length > 100 ? 'good' : 
                                cleanText.length > 10 ? 'partial' : 'poor';
    
    // Validate extracted content
    if (cleanText.length < 10) {
      console.warn('PDF extraction resulted in very little text - may be image-based or protected');
    }
    
    // Clean up all pages one final time
    processedPages.forEach(page => {
      if (page && typeof page.cleanup === 'function') {
        try {
          page.cleanup();
        } catch (error) {
          console.warn('Error in final page cleanup:', error);
        }
      }
    });
    
    // Critical: Destroy the PDF document to free memory
    if (pdf && typeof pdf.destroy === 'function') {
      try {
        await pdf.destroy();
      } catch (destroyError) {
        console.warn('Error destroying PDF document:', destroyError);
      }
    }
    
    // Critical: Clean up the loading task
    if (loadingTask && typeof loadingTask.destroy === 'function') {
      try {
        loadingTask.destroy();
      } catch (taskError) {
        console.warn('Error destroying loading task:', taskError);
      }
    }
    
    // Clear references
    pdf = null;
    loadingTask = null;
    processedPages.length = 0;
    
    // Untrack document
    untrackDocument(documentId);
    
    return {
      text: cleanText,
      metadata: metadata
    };
    
  } catch (error) {
    console.error('Error parsing PDF:', error);
    
    // CRITICAL: Ensure cleanup happens even on error
    try {
      // Clean up all processed pages
      if (processedPages && processedPages.length > 0) {
        processedPages.forEach(page => {
          if (page && typeof page.cleanup === 'function') {
            try {
              page.cleanup();
            } catch (cleanupError) {
              console.warn('Error cleaning up page during error handling:', cleanupError);
            }
          }
        });
      }
      
      // Clean up PDF document
      if (pdf && typeof pdf.destroy === 'function') {
        try {
          await pdf.destroy();
        } catch (destroyError) {
          console.warn('Error destroying PDF during error handling:', destroyError);
        }
      }
      
      // Clean up loading task
      if (loadingTask && typeof loadingTask.destroy === 'function') {
        try {
          loadingTask.destroy();
        } catch (taskError) {
          console.warn('Error destroying loading task during error handling:', taskError);
        }
      }
    } catch (cleanupError) {
      console.error('Critical error during PDF cleanup:', cleanupError);
    } finally {
      // Force clear all references
      pdf = null;
      loadingTask = null;
      if (processedPages) {
        processedPages.length = 0;
      }
      // Untrack document in error case
      untrackDocument(documentId);
    }
    
    // Enhanced error messages
    if (error.message.includes('Invalid PDF') || error.message.includes('header')) {
      throw new Error('Invalid PDF file: This file does not appear to be a valid PDF document');
    } else if (error.message.includes('password') || error.message.includes('encrypted') || 
               error.message.includes('Permission') || error.message.includes('Security')) {
      throw new Error('PDF is password protected or encrypted and cannot be processed');
    } else if (error.message.includes('memory') || error.message.includes('Memory')) {
      throw new Error('PDF is too large or complex to process - try a smaller file');
    } else if (error.message.includes('timeout')) {
      throw new Error('PDF processing timed out - file may be too large or complex');
    } else if (error.message.includes('corrupt') || error.message.includes('damaged')) {
      throw new Error('PDF file appears to be corrupted or damaged');
    } else if (error.message.includes('worker') || error.message.includes('Worker') || 
               error.message.includes('WorkerMessageHandler')) {
      throw new Error('PDF processing service temporarily unavailable. Please try refreshing the page or use a different browser.');
    } else {
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }
}

export function extractPdfMetadata(pdfData) {
  const metadata = {
    title: '',
    author: '',
    subject: '',
    creator: '',
    producer: '',
    creationDate: null,
    modificationDate: null,
    numPages: 0,
    estimatedReadTime: 0
  };
  
  if (pdfData.metadata && pdfData.metadata.info) {
    const info = pdfData.metadata.info;
    metadata.title = info.Title || '';
    metadata.author = info.Author || '';
    metadata.subject = info.Subject || '';
    metadata.creator = info.Creator || '';
    metadata.producer = info.Producer || '';
    metadata.creationDate = info.CreationDate ? new Date(info.CreationDate) : null;
    metadata.modificationDate = info.ModDate ? new Date(info.ModDate) : null;
  }
  
  metadata.numPages = pdfData.metadata?.numPages || 0;
  
  // Estimate reading time (assuming 200 words per minute)
  const wordCount = pdfData.text.split(/\s+/).length;
  metadata.estimatedReadTime = Math.ceil(wordCount / 200);
  
  return metadata;
}

// Emergency cleanup function for critical memory recovery
export async function emergencyCleanupPdfResources() {
  console.warn('Performing emergency PDF resource cleanup...');
  
  try {
    // Force worker termination if it exists
    if (pdfjsLib.GlobalWorkerOptions.workerPort) {
      try {
        pdfjsLib.GlobalWorkerOptions.workerPort.terminate();
        pdfjsLib.GlobalWorkerOptions.workerPort = null;
      } catch (error) {
        console.warn('Error terminating worker during emergency cleanup:', error);
      }
    }
    
    // Reset all PDF.js global options
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    
    // Reset worker recovery counter
    workerRecoveryAttempts = 0;
    
    // Force garbage collection if available (Chrome DevTools)
    if (typeof window !== 'undefined' && window.gc) {
      window.gc();
    }
    
    console.info('Emergency PDF cleanup completed');
    return true;
  } catch (error) {
    console.error('Error during emergency PDF cleanup:', error);
    return false;
  }
}

// Function to check PDF.js worker health
export function checkPdfWorkerHealth() {
  const health = {
    workerConfigured: !!pdfjsLib.GlobalWorkerOptions.workerSrc,
    workerSrc: pdfjsLib.GlobalWorkerOptions.workerSrc,
    workerPort: !!pdfjsLib.GlobalWorkerOptions.workerPort,
    recoveryAttempts: workerRecoveryAttempts,
    maxRecoveryAttempts: MAX_WORKER_RECOVERY_ATTEMPTS,
    canRecover: workerRecoveryAttempts < MAX_WORKER_RECOVERY_ATTEMPTS
  };
  
  return health;
}

// Function to get PDF parser performance metrics
export function getPdfParserMetrics() {
  const memoryInfo = typeof performance !== 'undefined' && performance.memory 
    ? {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        usagePercentage: ((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(1)
      }
    : null;

  return {
    activeDocuments: activeDocuments.size,
    maxConcurrentDocuments: MAX_CONCURRENT_DOCUMENTS,
    memoryPressureDetected,
    memoryInfo,
    workerHealth: checkPdfWorkerHealth(),
    timeouts: TIMEOUTS,
    status: activeDocuments.size === 0 ? 'idle' : 
           activeDocuments.size < MAX_CONCURRENT_DOCUMENTS ? 'active' : 'at_limit'
  };
}