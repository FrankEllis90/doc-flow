/**
 * Doc Layer - Onboarding Store
 * Manages onboarding state, tour progress, and user preferences
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { sampleDatasets, onboardingSettings } from '@/components/onboarding/tourSteps'

export interface OnboardingState {
  // Tour progress
  tourCompleted: boolean
  tourSkipped: boolean
  currentStep: number
  completedSteps: number[]
  tourStartedAt: string | null
  tourCompletedAt: string | null
  
  // User preferences
  showWelcomeMessage: boolean
  enableTooltips: boolean
  enableKeyboardShortcuts: boolean
  preferredSamples: string[]
  
  // Usage analytics (local only)
  tourAttempts: number
  stepDurations: Record<string, number>
  sampleUsage: Record<string, number>
  
  // Settings
  settings: typeof onboardingSettings
}

export const useOnboardingStore = defineStore('onboarding', () => {
  // State
  const state = ref<OnboardingState>({
    tourCompleted: false,
    tourSkipped: false,
    currentStep: 0,
    completedSteps: [],
    tourStartedAt: null,
    tourCompletedAt: null,
    
    showWelcomeMessage: true,
    enableTooltips: true,
    enableKeyboardShortcuts: true,
    preferredSamples: [],
    
    tourAttempts: 0,
    stepDurations: {},
    sampleUsage: {},
    
    settings: onboardingSettings
  })

  // Computed
  const shouldShowTour = computed(() => {
    return !state.value.tourCompleted && 
           !state.value.tourSkipped && 
           state.value.settings.tour.triggers.firstVisit
  })

  const shouldShowWelcome = computed(() => {
    return state.value.showWelcomeMessage && !state.value.tourCompleted
  })

  const tourProgress = computed(() => {
    const totalSteps = 14 // Total number of tour steps
    const completed = state.value.completedSteps.length
    return Math.round((completed / totalSteps) * 100)
  })

  const isFirstVisit = computed(() => {
    return state.value.tourAttempts === 0
  })

  const recommendedSamples = computed(() => {
    const recommended = state.value.settings.samples.recommended
    return sampleDatasets.filter(sample => recommended.includes(sample.id))
  })

  // Actions
  const startTour = () => {
    state.value.tourStartedAt = new Date().toISOString()
    state.value.tourAttempts += 1
    state.value.currentStep = 0
    saveState()
  }

  const completeTour = () => {
    state.value.tourCompleted = true
    state.value.tourCompletedAt = new Date().toISOString()
    state.value.showWelcomeMessage = false
    saveState()
  }

  const skipTour = () => {
    state.value.tourSkipped = true
    state.value.showWelcomeMessage = false
    saveState()
  }

  const restartTour = () => {
    state.value.tourCompleted = false
    state.value.tourSkipped = false
    state.value.currentStep = 0
    state.value.completedSteps = []
    state.value.tourStartedAt = null
    state.value.tourCompletedAt = null
    saveState()
    startTour()
  }

  const completeStep = (stepIndex: number, duration?: number) => {
    if (!state.value.completedSteps.includes(stepIndex)) {
      state.value.completedSteps.push(stepIndex)
    }
    
    state.value.currentStep = stepIndex + 1
    
    if (duration) {
      state.value.stepDurations[stepIndex.toString()] = duration
    }
    
    saveState()
  }

  const setCurrentStep = (stepIndex: number) => {
    state.value.currentStep = stepIndex
    saveState()
  }

  const dismissWelcome = () => {
    state.value.showWelcomeMessage = false
    saveState()
  }

  const updatePreferences = (preferences: Partial<OnboardingState>) => {
    Object.assign(state.value, preferences)
    saveState()
  }

  const trackSampleUsage = (sampleId: string) => {
    if (!state.value.sampleUsage[sampleId]) {
      state.value.sampleUsage[sampleId] = 0
    }
    state.value.sampleUsage[sampleId] += 1
    saveState()
  }

  const addPreferredSample = (sampleId: string) => {
    if (!state.value.preferredSamples.includes(sampleId)) {
      state.value.preferredSamples.push(sampleId)
      saveState()
    }
  }

  const removePreferredSample = (sampleId: string) => {
    const index = state.value.preferredSamples.indexOf(sampleId)
    if (index > -1) {
      state.value.preferredSamples.splice(index, 1)
      saveState()
    }
  }

  const resetOnboarding = () => {
    state.value = {
      tourCompleted: false,
      tourSkipped: false,
      currentStep: 0,
      completedSteps: [],
      tourStartedAt: null,
      tourCompletedAt: null,
      
      showWelcomeMessage: true,
      enableTooltips: true,
      enableKeyboardShortcuts: true,
      preferredSamples: [],
      
      tourAttempts: 0,
      stepDurations: {},
      sampleUsage: {},
      
      settings: onboardingSettings
    }
    saveState()
  }

  const loadState = () => {
    try {
      const saved = localStorage.getItem('doc-layer-onboarding')
      if (saved) {
        const parsed = JSON.parse(saved)
        
        // Merge with defaults to handle version updates
        state.value = {
          ...state.value,
          ...parsed,
          settings: {
            ...onboardingSettings,
            ...parsed.settings
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load onboarding state:', error)
      resetOnboarding()
    }
  }

  const saveState = () => {
    try {
      localStorage.setItem('doc-layer-onboarding', JSON.stringify(state.value))
    } catch (error) {
      console.warn('Failed to save onboarding state:', error)
    }
  }

  const exportState = () => {
    return {
      ...state.value,
      exportedAt: new Date().toISOString(),
      version: '4.0.0'
    }
  }

  const importState = (importedState: any) => {
    try {
      // Validate imported state
      if (typeof importedState !== 'object' || !importedState) {
        throw new Error('Invalid state format')
      }

      // Merge with current state
      state.value = {
        ...state.value,
        ...importedState,
        settings: {
          ...onboardingSettings,
          ...importedState.settings
        }
      }

      saveState()
      return true
    } catch (error) {
      console.error('Failed to import onboarding state:', error)
      return false
    }
  }

  // Analytics helpers
  const getTourAnalytics = () => {
    const totalDuration = Object.values(state.value.stepDurations)
      .reduce((sum, duration) => sum + duration, 0)
    
    const avgStepDuration = totalDuration / state.value.completedSteps.length || 0
    
    return {
      completionRate: tourProgress.value,
      totalAttempts: state.value.tourAttempts,
      totalDuration,
      avgStepDuration,
      completedSteps: state.value.completedSteps.length,
      mostUsedSamples: Object.entries(state.value.sampleUsage)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([id]) => id),
      preferredSamples: state.value.preferredSamples,
      settings: {
        tooltips: state.value.enableTooltips,
        shortcuts: state.value.enableKeyboardShortcuts
      }
    }
  }

  const getSampleRecommendations = () => {
    const usageHistory = Object.keys(state.value.sampleUsage)
    const preferences = state.value.preferredSamples
    
    // Recommend based on category preferences
    const usedCategories = new Set()
    usageHistory.forEach(sampleId => {
      const sample = sampleDatasets.find(s => s.id === sampleId)
      if (sample) {
        usedCategories.add(sample.category)
      }
    })
    
    // Find samples in preferred categories that haven't been used
    const recommendations = sampleDatasets.filter(sample => {
      const isUnused = !usageHistory.includes(sample.id)
      const isPreferredCategory = usedCategories.has(sample.category)
      const isExplicitlyPreferred = preferences.includes(sample.id)
      
      return isUnused && (isPreferredCategory || isExplicitlyPreferred)
    })
    
    return recommendations.slice(0, 3) // Top 3 recommendations
  }

  // Initialize store
  loadState()

  return {
    // State
    state: state.value,
    
    // Computed
    shouldShowTour,
    shouldShowWelcome,
    tourProgress,
    isFirstVisit,
    recommendedSamples,
    
    // Actions
    startTour,
    completeTour,
    skipTour,
    restartTour,
    completeStep,
    setCurrentStep,
    dismissWelcome,
    updatePreferences,
    trackSampleUsage,
    addPreferredSample,
    removePreferredSample,
    resetOnboarding,
    loadState,
    saveState,
    exportState,
    importState,
    getTourAnalytics,
    getSampleRecommendations
  }
})

/**
 * Composable for onboarding integration
 */
export function useOnboarding() {
  const store = useOnboardingStore()
  
  const showTour = () => {
    store.restartTour()
  }
  
  const hideTour = () => {
    store.skipTour()
  }
  
  const trackStep = (stepIndex: number, startTime: number) => {
    const duration = Date.now() - startTime
    store.completeStep(stepIndex, duration)
  }
  
  const trackSample = (sampleId: string) => {
    store.trackSampleUsage(sampleId)
  }
  
  const isStepCompleted = (stepIndex: number) => {
    return store.state.completedSteps.includes(stepIndex)
  }
  
  const getNextRecommendation = () => {
    const recommendations = store.getSampleRecommendations()
    return recommendations[0] || null
  }
  
  return {
    store,
    showTour,
    hideTour,
    trackStep,
    trackSample,
    isStepCompleted,
    getNextRecommendation,
    
    // Direct store access for convenience
    shouldShowTour: store.shouldShowTour,
    shouldShowWelcome: store.shouldShowWelcome,
    tourProgress: store.tourProgress,
    isFirstVisit: store.isFirstVisit,
    recommendedSamples: store.recommendedSamples
  }
}