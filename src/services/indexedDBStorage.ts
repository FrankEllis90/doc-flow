/**
 * IndexedDB Storage Service
 * Replaces localStorage with IndexedDB for better storage capacity and performance
 */

/**
 * Deep clone and sanitize data for IndexedDB storage
 * Removes functions, DOM elements, and handles circular references
 */
function sanitizeForStorage(obj: any, seen = new WeakSet()): any {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // Handle circular references
  if (seen.has(obj)) {
    return '[Circular Reference]'
  }
  seen.add(obj)

  // Handle Date objects
  if (obj instanceof Date) {
    return obj.toISOString()
  }

  // Handle Arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForStorage(item, seen))
  }

  // Handle Set objects
  if (obj instanceof Set) {
    return Array.from(obj).map(item => sanitizeForStorage(item, seen))
  }

  // Handle Map objects
  if (obj instanceof Map) {
    const result: any = {}
    obj.forEach((value, key) => {
      result[key] = sanitizeForStorage(value, seen)
    })
    return result
  }

  // Handle regular objects
  const result: any = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key]
      
      // Skip functions, DOM elements, and other non-cloneable objects
      if (typeof value === 'function') {
        continue
      }
      
      if (value && typeof value === 'object') {
        // Skip DOM elements
        if (value.nodeType || value instanceof Element || value instanceof Node) {
          continue
        }
        
        // Skip complex objects that can't be cloned
        if (value.constructor && value.constructor.name && 
            !['Object', 'Array', 'Date', 'RegExp', 'String', 'Number', 'Boolean'].includes(value.constructor.name)) {
          // Convert to plain object or skip
          try {
            result[key] = sanitizeForStorage(JSON.parse(JSON.stringify(value)), seen)
          } catch {
            continue
          }
        } else {
          result[key] = sanitizeForStorage(value, seen)
        }
      } else {
        result[key] = value
      }
    }
  }
  
  seen.delete(obj)
  return result
}

export interface StorageItem {
  id: string
  data: any
  timestamp: number
  type: 'version' | 'autosave' | 'cache'
  metadata?: Record<string, any>
}

class IndexedDBStorage {
  private dbName = 'MoneyMeansKB'
  private version = 1
  private db: IDBDatabase | null = null
  private initialized = false
  private transactionQueue: Promise<any> = Promise.resolve()
  private pendingTransactions = new Set<string>()

  async init(): Promise<void> {
    if (this.initialized && this.db) {
      return
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        this.initialized = true
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('storage')) {
          const store = db.createObjectStore('storage', { keyPath: 'id' })
          store.createIndex('type', 'type', { unique: false })
          store.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }

  async setItem(key: string, value: any, type: StorageItem['type'] = 'cache', metadata?: Record<string, any>): Promise<void> {
    await this.ensureInitialized()

    // Queue this transaction to prevent overlaps
    return this.queueTransaction(async () => {
      // Check if there's already a pending transaction for this key
      const transactionId = `set_${key}`
      if (this.pendingTransactions.has(transactionId)) {
        throw new Error(`Transaction for key '${key}' already in progress`)
      }

      this.pendingTransactions.add(transactionId)

      try {
        // Sanitize data to ensure it can be cloned by IndexedDB
        const sanitizedValue = sanitizeForStorage(value)
        const sanitizedMetadata = metadata ? sanitizeForStorage(metadata) : undefined

        const item: StorageItem = {
          id: key,
          data: sanitizedValue,
          timestamp: Date.now(),
          type,
          metadata: sanitizedMetadata
        }

        return new Promise<void>((resolve, reject) => {
          const transaction = this.db!.transaction(['storage'], 'readwrite')
          const store = transaction.objectStore('storage')
          const request = store.put(item)

          // Add transaction abort handler
          transaction.onabort = () => {
            reject(new Error(`Transaction aborted for key '${key}'`))
          }

          transaction.onerror = () => {
            reject(transaction.error || new Error(`Transaction error for key '${key}'`))
          }

          request.onerror = () => {
            reject(request.error || new Error(`Request error for key '${key}'`))
          }

          request.onsuccess = () => {
            resolve()
          }
        })
      } finally {
        this.pendingTransactions.delete(transactionId)
      }
    })
  }

  async getItem<T = any>(key: string): Promise<T | null> {
    await this.ensureInitialized()

    // Queue this transaction to prevent conflicts with writes
    return this.queueTransaction(async () => {
      return new Promise<T | null>((resolve, reject) => {
        const transaction = this.db!.transaction(['storage'], 'readonly')
        const store = transaction.objectStore('storage')
        const request = store.get(key)

        transaction.onabort = () => {
          reject(new Error(`Get transaction aborted for key '${key}'`))
        }

        transaction.onerror = () => {
          reject(transaction.error || new Error(`Get transaction error for key '${key}'`))
        }

        request.onerror = () => {
          reject(request.error || new Error(`Get request error for key '${key}'`))
        }

        request.onsuccess = () => {
          const result = request.result as StorageItem | undefined
          resolve(result ? result.data : null)
        }
      })
    })
  }

  async removeItem(key: string): Promise<void> {
    await this.ensureInitialized()

    // Queue this transaction to prevent overlaps
    return this.queueTransaction(async () => {
      const transactionId = `delete_${key}`
      if (this.pendingTransactions.has(transactionId)) {
        throw new Error(`Delete transaction for key '${key}' already in progress`)
      }

      this.pendingTransactions.add(transactionId)

      try {
        return new Promise<void>((resolve, reject) => {
          const transaction = this.db!.transaction(['storage'], 'readwrite')
          const store = transaction.objectStore('storage')
          const request = store.delete(key)

          transaction.onabort = () => {
            reject(new Error(`Delete transaction aborted for key '${key}'`))
          }

          transaction.onerror = () => {
            reject(transaction.error || new Error(`Delete transaction error for key '${key}'`))
          }

          request.onerror = () => {
            reject(request.error || new Error(`Delete request error for key '${key}'`))
          }

          request.onsuccess = () => {
            resolve()
          }
        })
      } finally {
        this.pendingTransactions.delete(transactionId)
      }
    })
  }

  async getAllByType(type: StorageItem['type']): Promise<StorageItem[]> {
    await this.ensureInitialized()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['storage'], 'readonly')
      const store = transaction.objectStore('storage')
      const index = store.index('type')
      const request = index.getAll(type)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async clear(): Promise<void> {
    await this.ensureInitialized()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['storage'], 'readwrite')
      const store = transaction.objectStore('storage')
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getStorageInfo(): Promise<{ estimatedUsage: number; estimatedQuota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      return {
        estimatedUsage: estimate.usage || 0,
        estimatedQuota: estimate.quota || 0
      }
    }
    return { estimatedUsage: 0, estimatedQuota: 0 }
  }

  async cleanup(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<number> {
    await this.ensureInitialized()

    const cutoffTime = Date.now() - maxAge
    let deletedCount = 0

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['storage'], 'readwrite')
      const store = transaction.objectStore('storage')
      const index = store.index('timestamp')
      const range = IDBKeyRange.upperBound(cutoffTime)
      const request = index.openCursor(range)

      request.onerror = () => reject(request.error)
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          const item = cursor.value as StorageItem
          // Only delete cache items, keep versions and autosaves
          if (item.type === 'cache') {
            cursor.delete()
            deletedCount++
          }
          cursor.continue()
        } else {
          resolve(deletedCount)
        }
      }
    })
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.init()
    }
  }

  /**
   * Queue transactions to prevent race conditions and overlapping operations
   */
  private async queueTransaction<T>(operation: () => Promise<T>): Promise<T> {
    // Chain this operation after the previous one
    const currentTransaction = this.transactionQueue.then(operation).catch(error => {
      console.warn('Queued transaction failed:', error)
      throw error
    })

    // Update the queue
    this.transactionQueue = currentTransaction.catch(() => {
      // Continue the queue even if this transaction failed
    })

    return currentTransaction
  }

  /**
   * Get information about pending transactions (for debugging)
   */
  getTransactionInfo(): { pending: string[]; queueLength: number } {
    return {
      pending: Array.from(this.pendingTransactions),
      queueLength: this.pendingTransactions.size
    }
  }

  // Fallback to localStorage if IndexedDB is not available
  static isSupported(): boolean {
    try {
      return 'indexedDB' in window && indexedDB !== null
    } catch {
      return false
    }
  }
}

// Fallback localStorage wrapper for compatibility
class LocalStorageFallback {
  async init(): Promise<void> {
    // No initialization needed for localStorage
  }

  async setItem(key: string, value: any): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      throw new Error(`Failed to save to localStorage: ${error}`)
    }
  }

  async getItem<T = any>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.warn('Failed to parse localStorage item:', error)
      return null
    }
  }

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key)
  }

  async getAllByType(): Promise<StorageItem[]> {
    // Limited implementation for localStorage fallback
    return []
  }

  async clear(): Promise<void> {
    localStorage.clear()
  }

  async getStorageInfo(): Promise<{ estimatedUsage: number; estimatedQuota: number }> {
    // Rough estimate for localStorage (usually 5-10MB)
    const used = new Blob(Object.values(localStorage)).size
    return {
      estimatedUsage: used,
      estimatedQuota: 10 * 1024 * 1024 // 10MB estimate
    }
  }

  async cleanup(): Promise<number> {
    // No automatic cleanup for localStorage
    return 0
  }
}

// Create and export the storage instance
export const storage = IndexedDBStorage.isSupported() 
  ? new IndexedDBStorage() 
  : new LocalStorageFallback()

// Initialize storage immediately
storage.init().catch(console.error)

// Export the sanitization function for external use
export { sanitizeForStorage }

export default storage