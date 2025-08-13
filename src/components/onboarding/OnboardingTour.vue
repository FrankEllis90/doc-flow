<template>
  <div v-if="isVisible" class="onboarding-overlay">
    <!-- Backdrop -->
    <div class="backdrop" @click="handleBackdropClick"></div>
    
    <!-- Tour Step -->
    <div 
      v-if="currentStep" 
      class="tour-tooltip"
      :style="tooltipStyle"
      :class="tooltipClasses"
    >
      <!-- Step Header -->
      <div class="tour-header">
        <div class="step-indicator">
          <span class="step-number">{{ currentStepIndex + 1 }}</span>
          <span class="step-total">of {{ totalSteps }}</span>
        </div>
        <button 
          @click="closeTour" 
          class="close-button"
          :title="$t('onboarding.close')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Step Content -->
      <div class="tour-content">
        <h3 class="tour-title">{{ currentStep.title }}</h3>
        <p class="tour-description">{{ currentStep.description }}</p>
        
        <!-- Interactive Elements -->
        <div v-if="currentStep.interactive" class="tour-interactive">
          <component 
            :is="currentStep.interactive.component" 
            v-bind="currentStep.interactive.props"
            @interaction="handleInteraction"
          />
        </div>
        
        <!-- Code Sample -->
        <div v-if="currentStep.codeSample" class="tour-code">
          <pre><code>{{ currentStep.codeSample }}</code></pre>
        </div>
        
        <!-- Tips -->
        <div v-if="currentStep.tips && currentStep.tips.length" class="tour-tips">
          <div class="tips-header">
            <svg class="tip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <path d="m12 17h.01"/>
            </svg>
            <span>Tips</span>
          </div>
          <ul class="tips-list">
            <li v-for="(tip, index) in currentStep.tips" :key="index">{{ tip }}</li>
          </ul>
        </div>
      </div>

      <!-- Navigation -->
      <div class="tour-navigation">
        <div class="nav-left">
          <button 
            v-if="currentStepIndex > 0" 
            @click="previousStep"
            class="nav-button secondary"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Previous
          </button>
        </div>
        
        <div class="nav-center">
          <div class="progress-dots">
            <button
              v-for="(step, index) in tourSteps"
              :key="index"
              @click="goToStep(index)"
              class="progress-dot"
              :class="{ 
                active: index === currentStepIndex,
                completed: index < currentStepIndex 
              }"
              :title="`Step ${index + 1}: ${step.title}`"
            >
              <span class="sr-only">Step {{ index + 1 }}</span>
            </button>
          </div>
        </div>
        
        <div class="nav-right">
          <button 
            v-if="currentStepIndex < totalSteps - 1" 
            @click="nextStep"
            class="nav-button primary"
          >
            Next
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          <button 
            v-else 
            @click="completeTour"
            class="nav-button primary"
          >
            Get Started
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Highlighted Element -->
    <div
      v-if="currentStep && currentStep.element"
      class="tour-highlight"
      :style="highlightStyle"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useOnboardingStore } from '@/stores/onboarding'
import { tourSteps } from './tourSteps'

// Props
interface Props {
  autoStart?: boolean
  skippable?: boolean
  persistProgress?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoStart: false,
  skippable: true,
  persistProgress: true
})

// Emits
const emit = defineEmits<{
  started: []
  stepChanged: [stepIndex: number]
  completed: []
  skipped: []
  closed: []
}>()

// Store
const onboardingStore = useOnboardingStore()

// State
const isVisible = ref(false)
const currentStepIndex = ref(0)
const highlightedElement = ref<HTMLElement | null>(null)
const tooltipPosition = ref({ x: 0, y: 0 })

// Computed
const currentStep = computed(() => tourSteps[currentStepIndex.value])
const totalSteps = computed(() => tourSteps.length)

const tooltipStyle = computed(() => ({
  left: `${tooltipPosition.value.x}px`,
  top: `${tooltipPosition.value.y}px`
}))

const tooltipClasses = computed(() => {
  const classes = ['tour-tooltip']
  
  if (currentStep.value?.position) {
    classes.push(`position-${currentStep.value.position}`)
  }
  
  return classes
})

const highlightStyle = computed(() => {
  if (!highlightedElement.value) return {}
  
  const rect = highlightedElement.value.getBoundingClientRect()
  return {
    left: `${rect.left - 4}px`,
    top: `${rect.top - 4}px`,
    width: `${rect.width + 8}px`,
    height: `${rect.height + 8}px`
  }
})

// Methods
const startTour = () => {
  if (!onboardingStore.shouldShowTour && !props.autoStart) {
    return
  }
  
  isVisible.value = true
  currentStepIndex.value = 0
  positionTooltip()
  emit('started')
  
  if (props.persistProgress) {
    onboardingStore.startTour()
  }
}

const nextStep = () => {
  if (currentStepIndex.value < totalSteps.value - 1) {
    currentStepIndex.value++
    positionTooltip()
    emit('stepChanged', currentStepIndex.value)
  }
}

const previousStep = () => {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--
    positionTooltip()
    emit('stepChanged', currentStepIndex.value)
  }
}

const goToStep = (stepIndex: number) => {
  if (stepIndex >= 0 && stepIndex < totalSteps.value) {
    currentStepIndex.value = stepIndex
    positionTooltip()
    emit('stepChanged', currentStepIndex.value)
  }
}

const completeTour = () => {
  isVisible.value = false
  emit('completed')
  
  if (props.persistProgress) {
    onboardingStore.completeTour()
  }
}

const closeTour = () => {
  isVisible.value = false
  emit('closed')
}

const skipTour = () => {
  isVisible.value = false
  emit('skipped')
  
  if (props.persistProgress) {
    onboardingStore.skipTour()
  }
}

const handleBackdropClick = () => {
  if (props.skippable) {
    skipTour()
  }
}

const handleInteraction = (data: any) => {
  // Handle interactive step completion
  console.log('Tour interaction:', data)
  
  // Auto-advance for interactive steps
  if (currentStep.value?.interactive?.autoAdvance) {
    setTimeout(() => {
      nextStep()
    }, 1000)
  }
}

const positionTooltip = async () => {
  await nextTick()
  
  if (!currentStep.value?.element) {
    tooltipPosition.value = { x: 100, y: 100 }
    return
  }
  
  const targetElement = document.querySelector(currentStep.value.element)
  if (!targetElement) {
    console.warn(`Tour target element not found: ${currentStep.value.element}`)
    tooltipPosition.value = { x: 100, y: 100 }
    return
  }
  
  highlightedElement.value = targetElement as HTMLElement
  
  const rect = targetElement.getBoundingClientRect()
  const tooltipWidth = 320 // Approximate tooltip width
  const tooltipHeight = 200 // Approximate tooltip height
  
  let x = rect.left + rect.width / 2 - tooltipWidth / 2
  let y = rect.bottom + 12
  
  // Adjust for screen boundaries
  const padding = 16
  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight
  
  if (x < padding) {
    x = padding
  } else if (x + tooltipWidth > screenWidth - padding) {
    x = screenWidth - tooltipWidth - padding
  }
  
  if (y + tooltipHeight > screenHeight - padding) {
    y = rect.top - tooltipHeight - 12
  }
  
  tooltipPosition.value = { x, y }
}

const handleResize = () => {
  if (isVisible.value) {
    positionTooltip()
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!isVisible.value) return
  
  switch (event.key) {
    case 'Escape':
      if (props.skippable) {
        skipTour()
      }
      break
    case 'ArrowRight':
      nextStep()
      break
    case 'ArrowLeft':
      previousStep()
      break
  }
}

// Lifecycle
onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeydown)
  
  if (props.autoStart || onboardingStore.shouldShowTour) {
    // Delay start to allow page to render
    setTimeout(() => {
      startTour()
    }, 1000)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeydown)
})

// Expose methods for parent components
defineExpose({
  startTour,
  nextStep,
  previousStep,
  goToStep,
  completeTour,
  closeTour,
  skipTour
})
</script>

<style scoped>
.onboarding-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  pointer-events: none;
}

.backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
  pointer-events: all;
}

.tour-tooltip {
  position: absolute;
  width: 400px;
  max-width: 90vw;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  pointer-events: all;
  z-index: 10001;
  transform-origin: center center;
  animation: tooltipFadeIn 0.3s ease-out;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.tour-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 0 24px;
}

.step-indicator {
  background: var(--brand-sage-light);
  color: var(--brand-sage);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.step-number {
  font-weight: 600;
}

.step-total {
  opacity: 0.7;
}

.close-button {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: #64748b;
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #f1f5f9;
  color: #374151;
}

.close-button svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.tour-content {
  padding: 16px 24px;
}

.tour-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.tour-description {
  font-size: 16px;
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 16px 0;
}

.tour-interactive {
  margin: 16px 0;
  padding: 16px;
  background: var(--brand-sage-light);
  border-radius: 12px;
  border-left: 4px solid var(--brand-sage);
}

.tour-code {
  margin: 16px 0;
  background: #1e293b;
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
}

.tour-code pre {
  margin: 0;
  color: #e2e8f0;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 14px;
}

.tour-tips {
  margin-top: 16px;
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 500;
  color: var(--brand-sage);
}

.tip-icon {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.tips-list {
  margin: 0;
  padding-left: 16px;
  color: #64748b;
}

.tips-list li {
  margin-bottom: 4px;
  font-size: 14px;
}

.tour-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px 24px 24px;
  border-top: 1px solid #e2e8f0;
}

.nav-left,
.nav-right {
  flex: 1;
}

.nav-right {
  display: flex;
  justify-content: flex-end;
}

.nav-center {
  flex: 0 0 auto;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-button svg {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

.nav-button.primary {
  background: var(--brand-sage);
  color: white;
}

.nav-button.primary:hover {
  background: var(--brand-sage-dark);
}

.nav-button.secondary {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.nav-button.secondary:hover {
  background: #f1f5f9;
  color: #374151;
}

.progress-dots {
  display: flex;
  gap: 8px;
}

.progress-dot {
  width: 8px;
  height: 8px;
  border: none;
  border-radius: 50%;
  background: #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.progress-dot.active {
  background: var(--brand-sage);
  transform: scale(1.2);
}

.progress-dot.completed {
  background: var(--brand-gold);
}

.progress-dot:hover {
  transform: scale(1.1);
}

.tour-highlight {
  position: absolute;
  border: 2px solid var(--brand-gold);
  border-radius: 8px;
  pointer-events: none;
  z-index: 10001;
  animation: highlightPulse 2s ease-in-out infinite;
}

@keyframes highlightPulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(212, 175, 55, 0);
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Position variants */
.position-top {
  transform: translateY(-8px);
}

.position-bottom {
  transform: translateY(8px);
}

.position-left {
  transform: translateX(-8px);
}

.position-right {
  transform: translateX(8px);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .tour-tooltip {
    background: #1e293b;
    color: #f1f5f9;
  }
  
  .tour-title {
    color: #f1f5f9;
  }
  
  .tour-description {
    color: #94a3b8;
  }
  
  .close-button:hover {
    background: #334155;
  }
  
  .nav-button.secondary {
    background: #334155;
    color: #94a3b8;
    border-color: #475569;
  }
  
  .nav-button.secondary:hover {
    background: #475569;
    color: #f1f5f9;
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .tour-tooltip {
    width: 320px;
    max-width: calc(100vw - 32px);
  }
  
  .tour-navigation {
    padding: 12px 16px 16px 16px;
  }
  
  .nav-button {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .tour-content {
    padding: 12px 16px;
  }
  
  .tour-title {
    font-size: 18px;
  }
  
  .tour-description {
    font-size: 15px;
  }
}</style>