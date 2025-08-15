import { config } from '@vue/test-utils'
import { createPinia } from 'pinia'
import '@testing-library/jest-dom'

// Note: Pinia setup is handled per-test to avoid conflicts
// Each test should create its own Pinia instance

// Mock window.localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
})

// Mock window.indexedDB
class MockIDBRequest {
  result: any = null
  error: any = null
  onsuccess: ((event: any) => void) | null = null
  onerror: ((event: any) => void) | null = null
  onupgradeneeded: ((event: any) => void) | null = null
  
  constructor() {
    setTimeout(() => {
      if (this.onsuccess) {
        this.onsuccess({ target: this })
      }
    }, 10)
  }
}

class MockIDBDatabase {
  createObjectStore = vi.fn()
  transaction = vi.fn(() => new MockIDBTransaction())
  close = vi.fn()
}

class MockIDBTransaction {
  objectStore = vi.fn(() => new MockIDBObjectStore())
  oncomplete: ((event: any) => void) | null = null
  onerror: ((event: any) => void) | null = null
  
  constructor() {
    setTimeout(() => {
      if (this.oncomplete) {
        this.oncomplete({ target: this })
      }
    }, 10)
  }
}

class MockIDBObjectStore {
  add = vi.fn(() => new MockIDBRequest())
  put = vi.fn(() => new MockIDBRequest())
  get = vi.fn(() => new MockIDBRequest())
  getAll = vi.fn(() => {
    const req = new MockIDBRequest()
    req.result = []
    return req
  })
  delete = vi.fn(() => new MockIDBRequest())
  clear = vi.fn(() => new MockIDBRequest())
}

Object.defineProperty(window, 'indexedDB', {
  value: {
    open: vi.fn(() => {
      const req = new MockIDBRequest()
      req.result = new MockIDBDatabase()
      return req
    }),
    deleteDatabase: vi.fn(() => new MockIDBRequest()),
  },
  writable: true,
})

// Mock File and FileReader APIs
global.File = class MockFile {
  constructor(bits: any[], filename: string, options: any = {}) {
    this.name = filename
    this.size = bits.join('').length
    this.type = options.type || 'text/plain'
    this.lastModified = Date.now()
  }
  name: string
  size: number
  type: string
  lastModified: number
}

global.FileReader = class MockFileReader {
  readAsText = vi.fn()
  readAsArrayBuffer = vi.fn()
  readAsDataURL = vi.fn()
  result: any = null
  error: any = null
  onload: ((event: any) => void) | null = null
  onerror: ((event: any) => void) | null = null
  
  constructor() {
    // Simulate async file reading
    setTimeout(() => {
      this.result = 'mock file content'
      this.onload?.({ target: this })
    }, 10)
  }
}

// Mock PDF.js worker
vi.mock('pdfjs-dist/build/pdf.worker.entry', () => ({}))

// Mock window.Worker
global.Worker = class MockWorker {
  constructor(url: string) {
    this.url = url
  }
  url: string
  postMessage = vi.fn()
  terminate = vi.fn()
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: ErrorEvent) => void) | null = null
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback: any, options?: any) {}
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}