<template>
  <div class="wizard-navigation flex justify-between items-center py-4 border-t border-neutral-200 bg-neutral-25">
    <button 
      @click="$emit('previous')" 
      :disabled="currentStep === 1"
      class="btn btn-outline btn-sm transition-all"
      :class="{ 
        'opacity-50 cursor-not-allowed': currentStep === 1,
        'hover:bg-neutral-100': currentStep > 1
      }"
    >
      <i class="fas fa-chevron-left mr-2"></i>
      Previous
    </button>
    
    <div class="flex items-center space-x-4">
      <span class="text-sm text-neutral-600 font-medium">
        Step {{ currentStep }} of {{ totalSteps }}
      </span>
      
      <!-- Progress dots -->
      <div class="flex items-center space-x-2">
        <div 
          v-for="step in totalSteps" 
          :key="step"
          class="w-2 h-2 rounded-full transition-all duration-200"
          :class="{
            'bg-primary-600': step <= currentStep,
            'bg-neutral-300': step > currentStep
          }"
        ></div>
      </div>
    </div>
    
    <button 
      @click="$emit('next')" 
      :disabled="!canAdvance"
      class="btn btn-primary btn-sm transition-all"
      :class="{ 
        'opacity-50 cursor-not-allowed': !canAdvance,
        'hover:bg-primary-700': canAdvance
      }"
    >
      {{ currentStep === totalSteps ? 'Finish' : 'Next' }}
      <i v-if="currentStep < totalSteps" class="fas fa-chevron-right ml-2"></i>
      <i v-else class="fas fa-check ml-2"></i>
    </button>
  </div>
</template>

<script>
export default {
  name: 'WizardNavigation',
  emits: ['previous', 'next'],
  props: {
    currentStep: {
      type: Number,
      required: true,
      validator: value => value >= 1
    },
    totalSteps: {
      type: Number,
      required: true,
      validator: value => value >= 1
    },
    canAdvance: {
      type: Boolean,
      default: true
    }
  }
};
</script>

<style scoped>
.wizard-navigation {
  position: sticky;
  bottom: 0;
  z-index: 10;
  backdrop-filter: blur(8px);
  background-color: rgba(249, 250, 251, 0.95);
}

.btn {
  min-width: 100px;
}

@media (max-width: 640px) {
  .wizard-navigation {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }
  
  .btn {
    width: 100%;
  }
}
</style>