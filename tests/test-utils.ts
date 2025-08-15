import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'

/**
 * Create a clean test environment with Pinia
 */
export function createTestEnvironment() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

/**
 * Mount component with proper Pinia setup
 */
export function mountComponent(component: any, options: any = {}) {
  const pinia = createTestEnvironment()
  
  return mount(component, {
    ...options,
    global: {
      ...options.global,
      plugins: [pinia, ...(options.global?.plugins || [])]
    }
  })
}

/**
 * Mock file for testing file upload functionality
 */
export function createMockFile(name: string, content: string, type: string = 'text/plain') {
  return new File([content], name, { type })
}

/**
 * Mock drag event for testing drag and drop
 */
export function createMockDragEvent(files: File[] = []) {
  return {
    preventDefault: vi.fn(),
    dataTransfer: {
      files
    }
  }
}