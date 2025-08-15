// Core data types
export interface Question {
  id: number | string
  question: string
  answer: string
}

export interface Category {
  id: number | string
  name: string
  questions: Question[]
}

// Content chunk types for document processing and manual content builder
export interface ContentChunk {
  id?: string           // Unique chunk ID (optional for backward compatibility)
  chunk_id: string      // Legacy ID field
  content: string
  source: string
  tags: string[]
  tagsString: string
  lastModified?: number // Timestamp of last modification
  stats?: {            // Text statistics
    words: number
    characters: number
    sentences?: number
  }
  metadata: {
    wordCount: number
    createdAt: string
    type: 'manual' | 'document'
    position?: number
    section?: string
    title?: string     // Optional title from document
  }
}

// Export data that gets stored in versions
export interface ExportedData {
  id: string              // Unique export ID
  format: string          // Export format used (openai, langchain, etc.)
  filename: string        // Generated filename
  data: any              // The actual exported JSON data
  exportOptions?: any    // Export options used
  chunkCount: number     // Number of chunks in export
  exportedAt: string     // When the export was created (ISO string)
  exportDate: string     // Alias for exportedAt for backward compatibility
  size: number           // Size of exported data in bytes
}

// Version management types
export interface Version {
  id: string
  name: string
  type: 'categories' | 'chunks' | 'exported'  // Added 'exported' for exported files
  categories?: Category[]      // For legacy Q&A categories
  chunks?: ContentChunk[]      // For chunk-based content (backup)
  exportedData?: ExportedData  // The actual exported file data
  timestamp: string
  isAutoSave: boolean
  questionCount?: number   // For categories
  categoryCount?: number   // For categories  
  chunkCount?: number      // Number of chunks
  sourceCount?: number     // Number of unique sources
}

export interface VersionStats {
  total: number
  autoSaves: number
  manualSaves: number
  oldestDate: string | null
  newestDate: string | null
}

// Search and filter types
export interface SearchResult {
  type: 'category' | 'question'
  categoryId: string | number
  categoryName: string
  questionId?: string | number
  question?: string
  answer?: string
  content: string
  matchType?: 'question' | 'answer' | 'both'
  relevance: number
}

export interface SearchOptions {
  caseSensitive: boolean
  wholeWords: boolean
  regex: boolean
}

export interface ContentFilters {
  minLength: number
  maxLength: number
  emptyContent: boolean
}

export interface SearchResultsData {
  results: SearchResult[]
  query: string
  total: number
  showAll: boolean
}

// Bulk operations types
export interface BulkItem {
  type: 'category' | 'question'
  id: string | number
  categoryId: string | number
  questionId?: string | number
  categoryName: string
  name?: string
  question?: string
  answer?: string
}

export interface BulkEditOptions {
  questions: boolean
  answers: boolean
  categories: boolean
}

export interface BulkEditConfig {
  options: BulkEditOptions
  type: 'replace' | 'prepend' | 'append'
  find: string
  replace: string
  text: string
}

export interface BulkEditData {
  items: BulkItem[]
  config: BulkEditConfig
}

export interface MoveSelectedData {
  items: BulkItem[]
  targetCategoryId: string | number
}

// Toast notification types
export interface Toast {
  id: string | number
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  autoClose?: boolean
}

// Component props and emits
export interface CategoryListProps {
  categories: Category[]
  bulkSelectMode?: boolean
  selectedItems?: BulkItem[]
}

export interface CategoryListEmits {
  'add-category': (name: string) => void
  'update-category': (categoryId: string | number, newName: string) => void
  'delete-category': (categoryId: string | number) => void
  'add-question': (categoryId: string | number, question: string, answer: string) => void
  'update-question': (categoryId: string | number, questionId: string | number, question: string, answer: string) => void
  'delete-question': (categoryId: string | number, questionId: string | number) => void
  'reorder-questions': (categoryId: string | number, newOrder: Question[]) => void
  'toggle-selection': (item: BulkItem) => void
}

export interface SearchFilterProps {
  categories: Category[]
}

export interface SearchFilterEmits {
  'search-results': (results: SearchResultsData) => void
  'search-focused': (focused: boolean) => void
}

export interface BulkOperationsProps {
  selectedItems: BulkItem[]
  categories: Category[]
  allItems: BulkItem[]
}

export interface BulkOperationsEmits {
  'select-all': () => void
  'clear-selection': () => void
  'export-selected': (exportData: any) => void
  'duplicate-selected': (items: BulkItem[]) => void
  'move-selected': (data: MoveSelectedData) => void
  'bulk-edit': (data: BulkEditData) => void
  'delete-selected': (items: BulkItem[]) => void
  'show-notification': (notification: Omit<Toast, 'id'>) => void
}

// Validation types
export interface ValidationResult {
  isValid: boolean
  hasWarnings: boolean
  errors: string[]
  warnings: string[]
  allIssues: string[]
}

// Export data types
export interface ExportData {
  [categoryName: string]: Array<{
    question: string
    answer: string
  }>
}

export interface ExportResult {
  filename: string
  data: ExportData
}

// Keyboard shortcut types
export interface KeyboardShortcuts {
  [combination: string]: (event?: KeyboardEvent) => void
}

// Store types
export interface VersionStore {
  versions: Version[]
  currentVersion: Version | null
  saveVersion: (data: { categories?: Category[], chunks?: ContentChunk[], exportedData?: ExportedData }, name?: string | null, isAutoSave?: boolean) => Version
  updateVersion: (versionId: string, data: { categories?: Category[], chunks?: ContentChunk[], exportedData?: ExportedData }, name?: string | null) => Version | null
  loadVersion: (versionId: string) => { categories?: Category[], chunks?: ContentChunk[], exportedData?: ExportedData } | null
  deleteVersion: (versionId: string) => boolean
  versionStats: VersionStats
  saveVersionsToStorage: () => void
  loadVersionsFromStorage: () => void
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> & 
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys]