/**
 * Doc Layer - Onboarding Tour Steps
 * Complete guided tour for new users
 */

export const tourSteps = [
  // Welcome Step
  {
    id: 'welcome',
    title: 'Welcome to Doc Layer!',
    description: 'Doc Layer is an enterprise AI document processing platform that transforms your documents into AI-ready knowledge bases. Let\'s explore the key features together.',
    element: null, // Center of screen
    position: 'center',
    tips: [
      'This tour will take about 3 minutes',
      'You can skip any time by pressing Escape',
      'All progress is automatically saved'
    ],
    interactive: null
  },

  // Navigation Overview
  {
    id: 'navigation',
    title: 'Navigation Overview',
    description: 'Doc Layer has three main sections: Manual Builder for creating chunks from scratch, Document Processor for batch processing, and Version Control for managing your work.',
    element: '[data-tour="main-navigation"]',
    position: 'bottom',
    tips: [
      'Each section is optimized for different workflows',
      'You can switch between sections at any time',
      'Your work is automatically synced across sections'
    ]
  },

  // Manual Builder Introduction
  {
    id: 'manual-builder',
    title: 'Manual Content Builder',
    description: 'Start here to create AI-ready content chunks from scratch. Perfect for when you want precise control over your knowledge base structure.',
    element: '[data-tour="builder-tab"]',
    position: 'bottom',
    tips: [
      'Ideal for curated content creation',
      'Real-time statistics and preview',
      'Multiple chunking strategies available'
    ]
  },

  // Content Input Demo
  {
    id: 'content-input',
    title: 'Content Input Area',
    description: 'Paste or type your content here. Doc Layer provides real-time statistics including word count, estimated chunks, and readability scores.',
    element: '[data-tour="content-textarea"]',
    position: 'top',
    interactive: {
      component: 'TourContentDemo',
      props: {
        placeholder: 'Try typing some content here to see real-time statistics...'
      },
      autoAdvance: true
    },
    tips: [
      'Supports markdown formatting',
      'Paste from any source - we\'ll clean it up',
      'Statistics update as you type'
    ]
  },

  // Chunking Options
  {
    id: 'chunking-options',
    title: 'Smart Chunking Options',
    description: 'Choose from multiple chunking strategies: semantic (AI-powered), token-based (LLM-optimized), word-based, or character-based. Each strategy is optimized for different use cases.',
    element: '[data-tour="chunking-options"]',
    position: 'right',
    tips: [
      'Semantic chunking preserves meaning boundaries',
      'Token-based chunking optimizes for LLM context',
      'Overlap prevents information loss between chunks'
    ],
    codeSample: `// Semantic Chunking Example
const options = {
  maxTokens: 512,
  overlapTokens: 50,
  useSemanticBoundaries: true,
  model: 'gpt-3.5-turbo'
}`
  },

  // Document Processor
  {
    id: 'document-processor',
    title: 'Document Processor',
    description: 'Process multiple documents simultaneously. Supports PDF, DOCX, Markdown, CSV, XLSX, HTML, and EPUB formats with intelligent content extraction.',
    element: '[data-tour="documents-tab"]',
    position: 'bottom',
    tips: [
      'Drag & drop up to 20 files at once',
      'Advanced error recovery and retry mechanisms',
      'Preserves document structure and metadata'
    ]
  },

  // File Upload Demo
  {
    id: 'file-upload',
    title: 'Multi-Format File Support',
    description: 'Drop files here or click to browse. Doc Layer intelligently extracts content from PDFs, spreadsheets, web pages, and more.',
    element: '[data-tour="file-upload-area"]',
    position: 'top',
    interactive: {
      component: 'TourFileDemo',
      props: {
        supportedFormats: ['PDF', 'DOCX', 'MD', 'CSV', 'XLSX', 'HTML', 'EPUB']
      },
      autoAdvance: false
    },
    tips: [
      'Maximum 50MB per PDF, 10MB for other formats',
      'Batch processing with individual file status',
      'Smart content area detection for web pages'
    ]
  },

  // Vector Store Exports
  {
    id: 'vector-stores',
    title: 'Multi-Platform Vector Store Export',
    description: 'Export your processed content to any vector database or AI platform. Pre-configured profiles for Pinecone, Weaviate, OpenAI, ChromaDB, and more.',
    element: '[data-tour="export-options"]',
    position: 'left',
    tips: [
      'Includes upload scripts for each platform',
      'Optimized metadata schemas',
      'Ready-to-use embedding formats'
    ],
    codeSample: `// Export to Pinecone
{
  "vectors": [{
    "id": "chunk_001",
    "values": [0.1, 0.2, 0.3...],
    "metadata": {
      "text": "Content here...",
      "source": "document.pdf"
    }
  }]
}`
  },

  // Analytics Dashboard
  {
    id: 'analytics',
    title: 'Quality Analytics',
    description: 'Monitor chunk quality with readability scores, token distribution analysis, and AI-readiness assessments. Get actionable recommendations for optimization.',
    element: '[data-tour="analytics-panel"]',
    position: 'right',
    tips: [
      'Flesch-Kincaid readability scoring',
      'Token count distribution analysis',
      'Semantic coherence validation'
    ]
  },

  // Version Control
  {
    id: 'version-control',
    title: 'Comprehensive Version Control',
    description: 'Your work is automatically versioned. Create snapshots, restore previous states, and track all changes with full data integrity.',
    element: '[data-tour="versions-tab"]',
    position: 'bottom',
    tips: [
      'Auto-save on every export operation',
      'Manual snapshots with custom names',
      'Complete rollback capabilities'
    ]
  },

  // Desktop Features
  {
    id: 'desktop-features',
    title: 'Desktop Application Benefits',
    description: 'As a desktop app, Doc Layer offers native file system integration, keyboard shortcuts, offline processing, and enhanced performance for large datasets.',
    element: '[data-tour="desktop-sidebar"]',
    position: 'right',
    tips: [
      'Native drag-and-drop from file explorer',
      'Keyboard shortcuts for power users',
      'Offline processing capabilities',
      'Enhanced memory management'
    ]
  },

  // Sample Datasets
  {
    id: 'sample-datasets',
    title: 'Try Sample Datasets',
    description: 'Get started immediately with our curated sample datasets. Test different document types and chunking strategies to find what works best for your use case.',
    element: '[data-tour="sample-datasets"]',
    position: 'top',
    interactive: {
      component: 'TourSampleDatasets',
      props: {
        samples: [
          { name: 'Research Paper', type: 'PDF', chunks: '~25' },
          { name: 'Technical Documentation', type: 'Markdown', chunks: '~15' },
          { name: 'FAQ Dataset', type: 'CSV', chunks: '~50' },
          { name: 'Web Article', type: 'HTML', chunks: '~10' }
        ]
      },
      autoAdvance: false
    },
    tips: [
      'Each sample demonstrates different features',
      'Compare chunking strategies side-by-side',
      'Perfect for learning optimal configurations'
    ]
  },

  // Completion
  {
    id: 'completion',
    title: 'You\'re Ready to Go!',
    description: 'That\'s it! You now know the key features of Doc Layer. Start by trying a sample dataset or upload your own documents to begin creating your AI-ready knowledge base.',
    element: null,
    position: 'center',
    tips: [
      'Your progress has been saved automatically',
      'Access help anytime with F1 or the help menu',
      'Join our community for tips and best practices'
    ],
    interactive: {
      component: 'TourCompletion',
      props: {
        actions: [
          { label: 'Try Sample Dataset', action: 'sample' },
          { label: 'Upload My Documents', action: 'upload' },
          { label: 'Browse Templates', action: 'templates' }
        ]
      },
      autoAdvance: false
    }
  }
]

/**
 * Sample datasets for onboarding
 */
export const sampleDatasets = [
  {
    id: 'research-paper',
    name: 'AI Research Paper',
    description: 'Academic paper on transformer architectures with references and technical diagrams',
    type: 'PDF',
    size: '2.1 MB',
    estimatedChunks: 25,
    category: 'Academic',
    features: ['Citations', 'Technical Language', 'Structured Sections'],
    downloadUrl: '/samples/ai-research-paper.pdf',
    previewUrl: '/samples/ai-research-paper-preview.jpg',
    optimalSettings: {
      chunkingMethod: 'semantic',
      maxTokens: 800,
      overlapTokens: 80,
      preserveFormatting: true
    }
  },

  {
    id: 'tech-docs',
    name: 'API Documentation',
    description: 'Comprehensive REST API documentation with code examples and parameter descriptions',
    type: 'Markdown',
    size: '450 KB',
    estimatedChunks: 15,
    category: 'Technical',
    features: ['Code Blocks', 'Structured Headers', 'Examples'],
    downloadUrl: '/samples/api-documentation.md',
    previewUrl: '/samples/api-docs-preview.jpg',
    optimalSettings: {
      chunkingMethod: 'section',
      preserveCodeBlocks: true,
      splitByHeaders: true
    }
  },

  {
    id: 'faq-dataset',
    name: 'Customer FAQ Dataset',
    description: 'Common customer questions and answers from a SaaS product support database',
    type: 'CSV',
    size: '125 KB',
    estimatedChunks: 50,
    category: 'Support',
    features: ['Q&A Pairs', 'Categories', 'Priority Levels'],
    downloadUrl: '/samples/customer-faq.csv',
    previewUrl: '/samples/faq-preview.jpg',
    optimalSettings: {
      chunkingMethod: 'row',
      textColumn: 'answer',
      metadataColumns: ['category', 'priority', 'question']
    }
  },

  {
    id: 'web-article',
    name: 'Technology Blog Article',
    description: 'In-depth article about machine learning trends with embedded media and links',
    type: 'HTML',
    size: '89 KB',
    estimatedChunks: 10,
    category: 'Editorial',
    features: ['Rich Media', 'Hyperlinks', 'Author Info'],
    downloadUrl: '/samples/ml-trends-article.html',
    previewUrl: '/samples/article-preview.jpg',
    optimalSettings: {
      chunkingMethod: 'semantic',
      extractTextOnly: true,
      preserveFormatting: false,
      includeMetaTags: true
    }
  },

  {
    id: 'legal-contract',
    name: 'Software License Agreement',
    description: 'Standard software license agreement with sections, clauses, and legal terminology',
    type: 'DOCX',
    size: '67 KB',
    estimatedChunks: 18,
    category: 'Legal',
    features: ['Numbered Sections', 'Legal Language', 'Cross-references'],
    downloadUrl: '/samples/software-license.docx',
    previewUrl: '/samples/contract-preview.jpg',
    optimalSettings: {
      chunkingMethod: 'section',
      maxTokens: 600,
      preserveFormatting: true,
      includeHeaders: true
    }
  },

  {
    id: 'spreadsheet-data',
    name: 'Product Catalog',
    description: 'E-commerce product catalog with descriptions, specifications, and pricing data',
    type: 'XLSX',
    size: '892 KB',
    estimatedChunks: 75,
    category: 'Commerce',
    features: ['Multiple Sheets', 'Rich Data', 'Formulas'],
    downloadUrl: '/samples/product-catalog.xlsx',
    previewUrl: '/samples/spreadsheet-preview.jpg',
    optimalSettings: {
      chunkingMethod: 'row',
      sheetName: 'Products',
      textColumn: 'description',
      metadataColumns: ['name', 'category', 'price', 'sku']
    }
  }
]

/**
 * Onboarding preferences and settings
 */
export const onboardingSettings = {
  // Tour behavior
  tour: {
    defaultDuration: 180000, // 3 minutes
    allowSkip: true,
    persistProgress: true,
    showProgressIndicator: true,
    autoAdvanceDelay: 1000, // ms for interactive steps
    
    // Triggers
    triggers: {
      firstVisit: true,
      majorVersionUpdate: true,
      userRequest: true,
      adminForced: false
    }
  },

  // Sample data preferences
  samples: {
    autoDownload: false,
    showPreviews: true,
    trackUsage: true,
    
    // Categories to show by default
    defaultCategories: ['Academic', 'Technical', 'Support'],
    
    // Recommended starting samples
    recommended: ['tech-docs', 'faq-dataset']
  },

  // Help system integration
  help: {
    enableContextualHints: true,
    showTooltips: true,
    enableKeyboardShortcuts: true,
    
    // Help content
    shortcuts: [
      { key: 'F1', description: 'Open help center' },
      { key: 'Ctrl+N', description: 'New project' },
      { key: 'Ctrl+O', description: 'Open documents' },
      { key: 'Ctrl+E', description: 'Export current work' },
      { key: 'Ctrl+Z', description: 'Undo last action' },
      { key: 'Ctrl+Shift+T', description: 'Restart tour' }
    ]
  },

  // Analytics and tracking
  analytics: {
    trackCompletionRate: true,
    trackStepDuration: true,
    trackUserInteractions: true,
    trackSampleUsage: true,
    
    // Privacy settings
    anonymizeData: true,
    localStorageOnly: true
  }
}

/**
 * Tour step validation and helpers
 */
export function validateTourSteps() {
  const requiredFields = ['id', 'title', 'description']
  const errors = []
  
  tourSteps.forEach((step, index) => {
    requiredFields.forEach(field => {
      if (!step[field]) {
        errors.push(`Step ${index + 1} missing required field: ${field}`)
      }
    })
    
    // Validate element selectors
    if (step.element && !step.element.startsWith('[data-tour')) {
      console.warn(`Step ${step.id} should use data-tour attribute for element targeting`)
    }
  })
  
  return errors
}

export function getTourStepById(id) {
  return tourSteps.find(step => step.id === id)
}

export function getSampleDatasetById(id) {
  return sampleDatasets.find(sample => sample.id === id)
}