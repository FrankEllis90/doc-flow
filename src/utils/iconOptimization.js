/**
 * Icon Optimization Utilities
 * 
 * Provides selective FontAwesome icon loading to reduce bundle size
 * and improve performance by only loading required icons.
 */

// Define specific icons used in the application
export const REQUIRED_ICONS = {
  // Solid icons (most commonly used)
  solid: [
    'plus',
    'minus', 
    'edit',
    'trash',
    'save',
    'download',
    'upload',
    'search',
    'filter',
    'check',
    'times',
    'exclamation-triangle',
    'info-circle',
    'check-circle',
    'cog',
    'user',
    'file',
    'folder',
    'keyboard',
    'eye',
    'eye-slash',
    'copy',
    'external-link-alt',
    'question-circle',
    'lightbulb',
    'chart-bar',
    'list',
    'th-large',
    'arrow-up',
    'arrow-down',
    'arrow-left',
    'arrow-right',
    'sort',
    'redo',
    'undo'
  ],
  
  // Regular icons (outline versions)
  regular: [
    'file',
    'folder',
    'copy',
    'save'
  ],
  
  // Brand icons (social media, etc.)
  brands: [
    // Add brand icons if needed
  ]
}

/**
 * Generate optimized FontAwesome CSS with only required icons
 * This dramatically reduces the CSS bundle size
 */
export function generateOptimizedIconCSS() {
  const baseStyles = `
/* FontAwesome Base Styles - Optimized */
.fa, .fas, .far, .fab {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  display: inline-block;
  font-style: normal;
  font-variant: normal;
  text-rendering: auto;
  line-height: 1;
}

.fas {
  font-family: "Font Awesome 6 Free";
  font-weight: 900;
}

.far {
  font-family: "Font Awesome 6 Free";
  font-weight: 400;
}

.fab {
  font-family: "Font Awesome 6 Brands";
  font-weight: 400;
}
`

  // Generate CSS for each required icon
  const iconStyles = Object.entries(REQUIRED_ICONS).map(([type, icons]) => {
    return icons.map(icon => {
      const className = type === 'solid' ? 'fas' : type === 'regular' ? 'far' : 'fab'
      return `.${className}.fa-${icon}:before { content: "${getIconContent(icon, type)}"; }`
    }).join('\n')
  }).join('\n')

  return baseStyles + iconStyles
}

/**
 * Icon content mapping (Unicode values)
 * Only includes icons that are actually used in the application
 */
const ICON_CONTENT_MAP = {
  solid: {
    'plus': '\\f067',
    'minus': '\\f068',
    'edit': '\\f044',
    'trash': '\\f1f8',
    'save': '\\f0c7',
    'download': '\\f019',
    'upload': '\\f093',
    'search': '\\f002',
    'filter': '\\f0b0',
    'check': '\\f00c',
    'times': '\\f00d',
    'exclamation-triangle': '\\f071',
    'info-circle': '\\f05a',
    'check-circle': '\\f058',
    'cog': '\\f013',
    'user': '\\f007',
    'file': '\\f15b',
    'folder': '\\f07b',
    'keyboard': '\\f11c',
    'eye': '\\f06e',
    'eye-slash': '\\f070',
    'copy': '\\f0c5',
    'external-link-alt': '\\f35d',
    'question-circle': '\\f059',
    'lightbulb': '\\f0eb',
    'chart-bar': '\\f080',
    'list': '\\f03a',
    'th-large': '\\f009',
    'arrow-up': '\\f062',
    'arrow-down': '\\f063',
    'arrow-left': '\\f060',
    'arrow-right': '\\f061',
    'sort': '\\f0dc',
    'redo': '\\f01e',
    'undo': '\\f0e2'
  },
  regular: {
    'file': '\\f15b',
    'folder': '\\f07b',
    'copy': '\\f0c5',
    'save': '\\f0c7'
  },
  brands: {
    // Add brand icon content if needed
  }
}

function getIconContent(iconName, type) {
  return ICON_CONTENT_MAP[type]?.[iconName] || ''
}

/**
 * Dynamic icon loader for runtime icon requirements
 */
export class IconLoader {
  constructor() {
    this.loadedIcons = new Set()
    this.pendingLoads = new Map()
  }

  async loadIcon(iconName, type = 'solid') {
    const iconKey = `${type}-${iconName}`
    
    if (this.loadedIcons.has(iconKey)) {
      return Promise.resolve()
    }

    if (this.pendingLoads.has(iconKey)) {
      return this.pendingLoads.get(iconKey)
    }

    const loadPromise = this.loadIconImplementation(iconName, type)
    this.pendingLoads.set(iconKey, loadPromise)

    try {
      await loadPromise
      this.loadedIcons.add(iconKey)
    } finally {
      this.pendingLoads.delete(iconKey)
    }

    return loadPromise
  }

  async loadIconImplementation(iconName, type) {
    // Check if icon is in our required set
    if (REQUIRED_ICONS[type]?.includes(iconName)) {
      // Icon is already loaded
      return
    }

    // For dynamic icons, we could load them individually
    // This is a placeholder for future implementation
    console.warn(`Icon ${type}/${iconName} not in optimized set. Consider adding to REQUIRED_ICONS.`)
  }

  preloadCriticalIcons() {
    // Preload the most critical icons
    const criticalIcons = [
      { name: 'plus', type: 'solid' },
      { name: 'search', type: 'solid' },
      { name: 'save', type: 'solid' },
      { name: 'download', type: 'solid' }
    ]

    return Promise.all(
      criticalIcons.map(icon => this.loadIcon(icon.name, icon.type))
    )
  }
}

// Global icon loader instance
export const iconLoader = new IconLoader()

/**
 * Vue composable for icon loading
 */
export function useIconLoader() {
  return {
    loadIcon: iconLoader.loadIcon.bind(iconLoader),
    preloadCriticalIcons: iconLoader.preloadCriticalIcons.bind(iconLoader)
  }
}