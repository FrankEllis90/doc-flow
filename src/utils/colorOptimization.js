/**
 * Color Optimization Utilities
 * 
 * Provides efficient color computation and manipulation using
 * CSS custom properties and optimized algorithms.
 */

// Cache for computed colors to avoid recalculation
const colorCache = new Map()

/**
 * Efficient color utilities using CSS custom properties
 */
export class ColorOptimizer {
  constructor() {
    this.cssPropsCache = new Map()
    this.computedStylesCache = new Map()
  }

  /**
   * Get CSS custom property value with caching
   */
  getCSSProperty(propertyName, element = document.documentElement) {
    const cacheKey = `${propertyName}-${element.tagName}`
    
    if (this.cssPropsCache.has(cacheKey)) {
      return this.cssPropsCache.get(cacheKey)
    }

    const value = getComputedStyle(element)
      .getPropertyValue(propertyName)
      .trim()

    this.cssPropsCache.set(cacheKey, value)
    return value
  }

  /**
   * Batch get multiple CSS properties for efficiency
   */
  getBatchCSSProperties(propertyNames, element = document.documentElement) {
    const computedStyle = getComputedStyle(element)
    const results = {}

    propertyNames.forEach(propName => {
      const cacheKey = `${propName}-${element.tagName}`
      
      if (this.cssPropsCache.has(cacheKey)) {
        results[propName] = this.cssPropsCache.get(cacheKey)
      } else {
        const value = computedStyle.getPropertyValue(propName).trim()
        this.cssPropsCache.set(cacheKey, value)
        results[propName] = value
      }
    })

    return results
  }

  /**
   * Generate color variations efficiently using CSS calc()
   */
  generateColorVariations(baseColor, variations = {}) {
    const cacheKey = `${baseColor}-${JSON.stringify(variations)}`
    
    if (colorCache.has(cacheKey)) {
      return colorCache.get(cacheKey)
    }

    const result = {}

    // Use CSS custom properties for efficient computation
    Object.entries(variations).forEach(([key, adjustment]) => {
      if (typeof adjustment === 'number') {
        // Brightness adjustment
        result[key] = `hsl(from ${baseColor} h s calc(l + ${adjustment}%))`
      } else if (adjustment.opacity) {
        // Opacity adjustment  
        result[key] = `color(from ${baseColor} srgb r g b / ${adjustment.opacity})`
      }
    })

    colorCache.set(cacheKey, result)
    return result
  }

  /**
   * Efficient color contrast checking
   */
  hasGoodContrast(color1, color2, threshold = 4.5) {
    const cacheKey = `contrast-${color1}-${color2}-${threshold}`
    
    if (colorCache.has(cacheKey)) {
      return colorCache.get(cacheKey)
    }

    // Use native CSS color-contrast when available
    if (CSS.supports('color', `color-contrast(${color1} vs ${color2})`)) {
      const contrastColor = `color-contrast(${color1} vs ${color2})`
      const result = contrastColor === color2
      colorCache.set(cacheKey, result)
      return result
    }

    // Fallback to manual calculation
    const luminance1 = this.getLuminance(color1)
    const luminance2 = this.getLuminance(color2)
    const contrast = (Math.max(luminance1, luminance2) + 0.05) / 
                    (Math.min(luminance1, luminance2) + 0.05)
    
    const result = contrast >= threshold
    colorCache.set(cacheKey, result)
    return result
  }

  /**
   * Get relative luminance of a color
   */
  getLuminance(color) {
    const cacheKey = `luminance-${color}`
    
    if (colorCache.has(cacheKey)) {
      return colorCache.get(cacheKey)
    }

    // Convert to RGB first
    const rgb = this.parseColor(color)
    if (!rgb) return 0

    // Calculate relative luminance
    const [r, g, b] = rgb.map(c => {
      const normalized = c / 255
      return normalized <= 0.03928 
        ? normalized / 12.92 
        : Math.pow((normalized + 0.055) / 1.055, 2.4)
    })

    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
    colorCache.set(cacheKey, luminance)
    return luminance
  }

  /**
   * Parse color string to RGB values
   */
  parseColor(color) {
    const cacheKey = `parse-${color}`
    
    if (colorCache.has(cacheKey)) {
      return colorCache.get(cacheKey)
    }

    // Create a temporary element to get computed color
    const div = document.createElement('div')
    div.style.color = color
    document.body.appendChild(div)
    
    const computedColor = getComputedStyle(div).color
    document.body.removeChild(div)

    // Extract RGB values
    const match = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    const result = match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : null
    
    colorCache.set(cacheKey, result)
    return result
  }

  /**
   * Clear caches to prevent memory leaks
   */
  clearCache() {
    this.cssPropsCache.clear()
    this.computedStylesCache.clear()
    colorCache.clear()
  }
}

// Global instance
export const colorOptimizer = new ColorOptimizer()

/**
 * Vue composable for color optimization
 */
export function useColorOptimization() {
  const getThemeColor = (colorName) => {
    return colorOptimizer.getCSSProperty(`--color-${colorName}`)
  }

  const getSemanticColor = (semantic) => {
    return colorOptimizer.getCSSProperty(`--${semantic}`)
  }

  const generateColorPalette = (baseColors) => {
    const palette = {}
    
    Object.entries(baseColors).forEach(([name, color]) => {
      palette[name] = colorOptimizer.generateColorVariations(color, {
        light: 20,
        dark: -20,
        subtle: { opacity: 0.1 },
        muted: { opacity: 0.6 }
      })
    })

    return palette
  }

  const checkContrast = (fg, bg) => {
    return colorOptimizer.hasGoodContrast(fg, bg)
  }

  return {
    getThemeColor,
    getSemanticColor,
    generateColorPalette,
    checkContrast,
    clearCache: colorOptimizer.clearCache
  }
}

/**
 * Performance-optimized theme switcher
 */
export class ThemeOptimizer {
  constructor() {
    this.themeCache = new Map()
    this.observers = new Set()
  }

  /**
   * Switch theme efficiently using CSS custom properties
   */
  switchTheme(themeName, animated = true) {
    const cacheKey = `theme-${themeName}`
    
    if (this.themeCache.has(cacheKey)) {
      this.applyTheme(this.themeCache.get(cacheKey), animated)
      return
    }

    // Load theme configuration
    this.loadTheme(themeName).then(themeConfig => {
      this.themeCache.set(cacheKey, themeConfig)
      this.applyTheme(themeConfig, animated)
    })
  }

  /**
   * Apply theme with optional animation
   */
  applyTheme(themeConfig, animated = true) {
    const root = document.documentElement

    if (animated) {
      // Add transition for smooth theme switching
      root.style.setProperty('transition', 'background-color 0.3s ease, color 0.3s ease')
    }

    // Batch property updates for performance
    requestAnimationFrame(() => {
      Object.entries(themeConfig).forEach(([property, value]) => {
        root.style.setProperty(property, value)
      })

      if (animated) {
        // Remove transition after animation
        setTimeout(() => {
          root.style.removeProperty('transition')
        }, 300)
      }
    })

    // Notify observers
    this.notifyObservers(themeConfig)
  }

  /**
   * Load theme configuration
   */
  async loadTheme(themeName) {
    // This could load from a file, API, or inline configuration
    const themes = {
      light: {
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#f8fafc',
        '--text-primary': '#1e293b',
        '--text-secondary': '#475569'
      },
      dark: {
        '--bg-primary': '#1e293b',
        '--bg-secondary': '#0f172a',
        '--text-primary': '#f8fafc',
        '--text-secondary': '#cbd5e1'
      }
    }

    return themes[themeName] || themes.light
  }

  /**
   * Add theme change observer
   */
  addObserver(callback) {
    this.observers.add(callback)
  }

  /**
   * Remove theme change observer
   */
  removeObserver(callback) {
    this.observers.delete(callback)
  }

  /**
   * Notify all observers of theme change
   */
  notifyObservers(themeConfig) {
    this.observers.forEach(callback => {
      try {
        callback(themeConfig)
      } catch (error) {
        console.error('Theme observer error:', error)
      }
    })
  }
}

// Global theme optimizer
export const themeOptimizer = new ThemeOptimizer()

/**
 * Cleanup function for memory management
 */
export function cleanupColorOptimization() {
  colorOptimizer.clearCache()
  themeOptimizer.themeCache.clear()
}