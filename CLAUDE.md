# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Identity & Mission
**Doc Layer** - Enterprise AI Document Processing Web Platform empowering intelligent knowledge management with cutting-edge document processing technology for AI teams, researchers, and enterprises.

**Brand Identity**: Clean, modern design with sage green (#A8B79D) primary and gold (#D4AF37) accent colors
**Target Users**: AI teams, researchers, enterprises, data scientists processing documents for multi-platform vector stores

## Development Commands

### Core Commands
- `npm run dev` - Start development server with Vite HMR
- `npm run build` - Production build with TypeScript checking
- `npm run preview` - Preview production build locally
- `npm run type-check` - Run TypeScript compiler checks without emitting files

### Build Pipeline
The project uses a two-stage build process optimized for web deployment:
1. TypeScript compilation (`vue-tsc --noEmit`) for type checking
2. Vite bundling for optimized static web assets

### Web Deployment
- `npm run build` - Creates optimized static assets in `/dist/`
- `npm run preview` - Preview production build locally
- All processing happens client-side in the browser
- No server-side dependencies required

## Sub-Agent Integration & Specializations
This project utilizes multiple specialized sub-agents. When Claude Code invokes specific agents, apply these role-specific contexts:

### 🔧 Core Processing Sub-Agents
- **kb-debug-agent.md**: 
  - **Focus**: IndexedDB corruption, PDF.js worker crashes, memory leaks, async/await issues
  - **Code Areas**: `src/services/indexedDBStorage.ts`, `src/utils/pdfParser.js`, error boundaries
  
- **kb-processor-agent.md**: 
  - **Focus**: Document chunking algorithms, text extraction optimization, parsing improvements
  - **Code Areas**: `src/utils/chunker.js`, `src/utils/markdownParser.js`, `src/utils/pdfParser.js`
  
- **kb-export-agent.md**:
  - **Focus**: AI platform export formats, metadata structure, upload script generation
  - **Code Areas**: `src/stores/export.ts`, export utilities, format serializers
  
- **kb-performance-agent.md**:
  - **Focus**: Memory optimization, virtual scrolling, concurrent processing, UI responsiveness
  - **Code Areas**: `src/components/performance/VirtualScroll.vue`, memory management

### 🎯 Quality & Analysis Sub-Agents
- **vector-db-readiness-scorer.md**:
  - **Focus**: Vector embedding optimization, chunk quality scoring, semantic analysis
  - **Code Areas**: `src/utils/enhancedVectorAnalyzer.js`, `src/components/DetailedVectorAnalysis.vue`
  
- **kb-validation-agent.md**:
  - **Focus**: Content validation, quality assessment, structural consistency
  - **Code Areas**: `src/components/QualityAnalyzer.vue`, validation utilities
  
- **kb-security-agent.md**:
  - **Focus**: Input sanitization, XSS prevention, file validation, security audit
  - **Code Areas**: `src/utils/sanitization.ts`, file upload validation
  
- **kb-storage-agent.md**:
  - **Focus**: IndexedDB operations, version control, data persistence, backup/restore
  - **Code Areas**: `src/stores/versions.ts`, `src/services/indexedDBStorage.ts`

### 🎨 UI/UX Specialized Sub-Agents
- **ux-design-reviewer.md**:
  - **Focus**: Design system compliance, WCAG accessibility, responsive design
  - **Code Areas**: `src/styles/`, component UI/UX, accessibility implementations
  
- **vue-stack-reviewer.md**:
  - **Focus**: Vue 3 best practices, Composition API patterns, TypeScript optimization
  - **Code Areas**: All Vue components, Pinia stores, composables

## Architecture Overview

### Application Structure
This is a Vue.js 3 Single Page Web Application that transforms documents into AI-ready knowledge bases. The app features a three-tab interface accessible through any modern web browser:
- **Builder Tab**: Manual content chunking with real-time statistics
- **Documents Tab**: Batch PDF/Markdown processing with queue management  
- **Versions Tab**: IndexedDB-backed version control system

### Technology Stack Specifications
- **Frontend**: Vue.js 3.4.0 with Composition API
- **State Management**: Pinia 2.1.7 with TypeScript stores
- **Styling**: TailwindCSS 3.4.17 with custom design tokens
- **Build Tool**: Vite 4.5.0 with hot module replacement
- **TypeScript**: Version 5.0+ with strict configuration
- **PDF Processing**: PDF.js 2.16.105 with web worker support
- **Markdown**: Marked.js 12.0.0 with custom renderer
- **Icons**: FontAwesome 6.5.0 (optimized subset ~15KB)

### State Management Pattern
**Pinia Store Architecture**: Uses composition API pattern with explicit state/actions/getters separation:
- `app.ts` - Global UI state, navigation, modals, bulk operations
- `content.ts` - Manual content creation and chunking
- `chunks.ts` - Processed chunk data management  
- `versions.ts` - Version control and persistence
- `export.ts` - Export functionality and format handling
- `processing.ts` - Document processing queue state
- `categories.ts` - Content categorization and tagging

### Component Hierarchy & Patterns

#### Layout System
- `App.vue` → `AppLayout.vue` → `TabNavigation.vue` + `TabContent.vue`
- Tab content components are dynamically loaded based on `activeTab` state
- `BaseModal.vue` provides consistent modal wrapper for dialogs

#### Content Builder Flow
1. `ContentChunkBuilder.vue` (main container)
2. `ContentInputForm.vue` (Step 1: content input with real-time stats)
3. `ChunkingOptionsPanel.vue` (chunking configuration)
4. `ProcessedContentsList.vue` (Step 2: chunk review/editing)
5. Export components (Step 3: format selection and download)

#### Document Processing Pipeline
1. `DocumentProcessor.vue` coordinates file upload and processing
2. File validation → Queue management → PDF/Markdown parsing → Chunking
3. Real-time progress updates with retry mechanisms for failed files
4. Memory management for large file batches (20 files max, 200MB total)

### Key Utilities & Services

#### Text Processing (`utils/chunker.js`)
- **Word-based chunking**: Splits by word count with configurable overlap (recommended: 300-800 words)
- **Character-based chunking**: Splits by character count, respects word boundaries
- **Section-based chunking**: Uses Markdown headers as natural boundaries
- **Overlap optimization**: 10-20% overlap prevents information loss
- **Tag suggestion**: Frequency-based keyword extraction from content

#### Storage Layer (`services/indexedDBStorage.ts`)
- **Primary**: IndexedDB for large-scale persistent storage
- **Fallback**: LocalStorage for compatibility
- **Data sanitization**: Removes functions, DOM elements, handles circular references
- **Versioning**: Automatic migration system for schema changes
- **Version Control**: Auto-save on export, manual snapshots, complete restoration

#### Error Handling (`composables/useErrorHandler.ts`)
- **Global error boundaries**: Catches unhandled exceptions and promise rejections
- **Structured error tracking**: Severity levels, component context, timestamps
- **Input validation**: Built-in XSS protection and content sanitization
- **Memory management**: Limited error history (50 items max) prevents memory bloat

### AI/ML Optimization Standards
- **Optimal Chunk Sizes**: Target 300-800 words for most AI training scenarios
- **Overlap Strategy**: Use 10-20% overlap to prevent information loss between chunks
- **Metadata Structure**: Include source, chunk_id, tags, word_count in all exports
- **Vector Store Formats**: Optimize for Azure Vector Store, OpenAI, LangChain, Pinecone
- **Quality Scoring**: Implement semantic coherence and readiness analysis

### Performance & Security Features

#### Virtual Scrolling System
- `VirtualScroll.vue` component handles 1000+ chunk rendering efficiently
- Dynamic height calculation with smooth scrolling
- Used in chunk lists and version history displays

#### Security Measures
- **Input sanitization**: All user content filtered for XSS patterns
- **File validation**: Extension checking, size limits (50MB PDF, 10MB markdown), header verification
- **Content Security**: Dangerous patterns removed from user input
- **Memory protection**: File size limits prevent browser crashes
- **Privacy-first**: All processing happens locally in browser

#### Performance Optimizations
- **Lazy loading**: Components load on-demand via `LazyComponent.vue`
- **Icon optimization**: Minimal FontAwesome subset (~15KB vs 240KB full)
- **Debounced operations**: Search and real-time statistics use debouncing
- **Memory cleanup**: Automatic garbage collection for large datasets
- **Concurrent processing**: Up to 20 files simultaneously with web workers

### Data Flow Patterns

#### Content Processing Flow
1. User input → Content validation → Chunking algorithm selection
2. Text processing → Chunk generation with metadata → Tag suggestion
3. Chunk editing → Quality analysis → Export format selection
4. Version creation → IndexedDB persistence

#### Document Upload Flow
1. File validation (type, size, format) → Queue addition
2. Concurrent processing (PDF.js workers, Marked.js parsing)
3. Progress tracking → Error handling → Retry mechanisms
4. Chunk generation → Batch insertion → UI updates

### AI Analysis Components

#### Vector Analysis System (`utils/enhancedVectorAnalyzer.js`)
- Evaluates content chunks for AI/ML vector database readiness
- Semantic coherence scoring and optimal size recommendations
- Integration with `QualityAnalyzer.vue` for user-facing reports
- Provides actionable feedback for improving vector search performance

#### Quality Assessment Engine
- Multi-algorithm readability analysis (Flesch-Kincaid, SMOG, ARI)
- Information density evaluation and structural consistency checks
- Metadata completeness validation
- Provides actionable improvement suggestions via `DetailedVectorAnalysis.vue`

#### Content Categorization System
- Automatic topic modeling and classification
- AI-generated tags based on content analysis
- Hierarchical category assignment
- Domain-specific terminology extraction

### Export System Architecture

#### Format Handlers
- **Azure Vector Store**: Default JSON format optimized for Azure OpenAI vector ingestion
```json
[{
  "content": "Optimized chunk content",
  "metadata": {
    "source": "document.pdf",
    "chunk_id": "chunk_001", 
    "tags": ["ai", "knowledge"],
    "word_count": 342
  }
}]
```
- **Multi-platform support**: OpenAI fine-tuning, LangChain Document format, Pinecone, ChromaDB
- **Traditional formats**: JSON, CSV, TXT, XML, Markdown with proper metadata
- **Upload scripts**: Auto-generated platform-specific upload code

### Design System & Accessibility

#### Color System & Branding
```css
/* Primary Brand Colors */
--brand-sage: #A8B79D          /* Primary sage green */
--brand-sage-dark: #8CA085     /* Darker variant */
--brand-sage-light: #F5F7F4    /* Light background */
--brand-gold: #D4AF37          /* Accent gold */
--brand-gold-soft: #F5E8B8     /* Soft gold background */

/* Semantic Colors */
--color-success-600: #059669   /* Success states */
--color-warning-600: #D97706   /* Warning states */
--color-error-600: #DC2626     /* Error states */
--color-info-600: #2563EB      /* Information states */
```

#### Typography Scale
```css
--font-size-xs: 0.75rem        /* 12px */
--font-size-sm: 0.875rem       /* 14px */
--font-size-base: 1rem         /* 16px */
--font-size-lg: 1.125rem       /* 18px */
--font-size-xl: 1.25rem        /* 20px */
--font-size-2xl: 1.5rem        /* 24px */
--font-size-3xl: 1.875rem      /* 30px */
--font-size-4xl: 2.25rem       /* 36px */
```

#### Accessibility Standards
- **WCAG Compliance**: Maintain AA level accessibility standards
- **Keyboard Navigation**: Full keyboard accessibility with proper focus management
- **Screen Reader Support**: Proper ARIA labels and semantic markup
- **Color Contrast**: All color combinations meet accessibility requirements

### Development Guidelines

#### Component Development
- Use Composition API pattern consistently across all Vue components
- Implement proper error boundaries with `useErrorHandler` composable
- Follow naming convention: PascalCase for components, kebab-case for files
- Maintain separation between UI components and business logic (use stores/composables)
- Ensure TypeScript strict mode compliance with proper type definitions

#### State Management Best Practices
- All cross-component state goes through Pinia stores
- Use computed properties for derived state rather than watchers
- Keep actions focused and atomic - complex operations should be composable functions
- Always handle async operations with proper error boundaries
- Implement proper store composition patterns with feature separation

#### Performance Considerations  
- Use `VirtualScroll` component for lists with 100+ items
- Implement lazy loading for heavy components via `LazyComponent`
- Debounce user input operations (search, real-time stats, validation)
- Monitor memory usage during file processing - implement cleanup for large batches
- Use web workers for heavy processing (PDF parsing, text analysis)

#### File Processing Standards
- Validate all uploads: file type, size, format headers
- Use PDF.js 2.16.105 in web workers to prevent UI blocking
- Implement comprehensive retry mechanisms for failed operations
- Provide real-time progress feedback with individual file status
- Support concurrent processing up to system limits

#### Error Handling Patterns
- Wrap all async operations with `handleAsyncError` from `useErrorHandler`
- Provide contextual error information (component, action, severity)
- Use proper fallbacks for non-critical functionality
- Log errors to console for debugging while showing user-friendly messages
- Implement progressive error recovery where possible

#### Testing & Quality Assurance
- Test with large file batches to verify memory management
- Validate export formats work correctly with target AI platforms
- Verify accessibility compliance with screen reader testing
- Test concurrent processing stability under load
- Validate version control data integrity and migration paths