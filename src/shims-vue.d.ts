declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, any>, Record<string, any>, any>
  export default component
}

// Ensure Vue 3 types are properly exported
declare module 'vue' {
  export * from '@vue/runtime-core'
  export * from '@vue/reactivity'
  export * from '@vue/runtime-dom'
}

declare module '*.md' {
  const content: string
  export default content
}

declare module '*.json' {
  const value: any
  export default value
}

// Global component type helpers
declare module '@vue/runtime-core' {
  export interface GlobalProperties {
    // Add any global properties here
  }
}

// Environment variables
declare module '*.env' {
  const content: Record<string, string>
  export default content
}

// Asset imports
declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}