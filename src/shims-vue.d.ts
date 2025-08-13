declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
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