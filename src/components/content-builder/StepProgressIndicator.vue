<template>
  <div class="flex justify-center mb-8 px-4">
    <div class="flex items-center space-x-2 sm:space-x-4">
      <div 
        v-for="(step, index) in steps" 
        :key="step.number"
        class="flex items-center"
      >
        <div class="flex flex-col items-center">
          <div 
            :class="[
              'step-indicator',
              currentStep >= step.number 
                ? (currentStep === step.number ? 'step-indicator-active' : 'step-indicator-completed') 
                : 'step-indicator-inactive'
            ]"
          >
            {{ step.number }}
          </div>
          <span class="mt-2 text-xs sm:text-sm font-medium text-neutral-700">{{ step.label }}</span>
        </div>
        
        <!-- Connect line between steps (not after last step) -->
        <div 
          v-if="index < steps.length - 1"
          class="step-line w-8 sm:w-16" 
          :class="{ 'step-line-completed': currentStep >= step.number + 1 }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Step {
  number: number
  label: string
}

interface Props {
  currentStep: number
  steps: Step[]
}

defineProps<Props>()
</script>

<style scoped>
.step-indicator {
  @apply w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200;
}

.step-indicator-inactive {
  @apply bg-neutral-200 text-neutral-500;
}

.step-indicator-active {
  @apply bg-primary-600 text-white shadow-lg scale-110;
}

.step-indicator-completed {
  @apply bg-success-600 text-white;
}

.step-line {
  @apply h-0.5 bg-neutral-200 transition-colors duration-200;
}

.step-line-completed {
  @apply bg-success-600;
}
</style>