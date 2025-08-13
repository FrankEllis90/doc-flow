<template>
  <div class="bg-neutral-50 border border-neutral-200 p-4 rounded-lg">
    <div class="flex items-center justify-between mb-3">
      <h4 class="text-sm font-semibold text-neutral-900">Chunking Settings</h4>
      <button 
        @click="$emit('update:showAdvanced', !showAdvanced)"
        class="btn btn-ghost btn-sm"
        :aria-expanded="showAdvanced"
        aria-controls="advanced-chunking"
      >
        <i :class="showAdvanced ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="mr-1"></i>
        {{ showAdvanced ? 'Hide Advanced' : 'Show Advanced' }}
      </button>
    </div>

    <!-- Always visible basic setting -->
    <div class="mb-4">
      <label class="flex items-center space-x-3 cursor-pointer">
        <input 
          :checked="modelValue.autoTag"
          @change="updateOptions({ autoTag: ($event.target as HTMLInputElement).checked })"
          type="checkbox" 
          class="form-checkbox"
        />
        <span class="text-sm text-neutral-700 font-medium">Generate tags automatically</span>
        <span class="badge badge-primary text-xs">Recommended</span>
      </label>
    </div>

    <!-- Advanced settings (collapsed by default) -->
    <div 
      v-show="showAdvanced" 
      id="advanced-chunking"
      class="space-y-4 animate-fade-in"
    >
      <div class="bg-primary-50 border border-primary-200 rounded-lg p-3">
        <div class="flex items-start space-x-2">
          <i class="fas fa-info-circle text-primary-600 mt-0.5 flex-shrink-0"></i>
          <div class="text-xs text-primary-800">
            <strong>Advanced settings</strong> for fine-tuning chunk size and overlap. Default settings work well for most content.
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          :model-value="modelValue.chunkSize"
          @update:model-value="updateOptions({ chunkSize: $event })"
          type="select"
          label="Chunk Size"
          :options="chunkSizeOptions"
          size="sm"
        />
        <FormField
          :model-value="modelValue.overlap"
          @update:model-value="updateOptions({ overlap: $event })"
          type="select"
          label="Overlap"
          :options="overlapOptions"
          size="sm"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FormField from '../FormField.vue'

interface ChunkingOptions {
  chunkSize: number
  overlap: number
  autoTag: boolean
}

interface Props {
  modelValue: ChunkingOptions
  showAdvanced?: boolean
}

interface Emits {
  'update:modelValue': [options: ChunkingOptions]
  'update:showAdvanced': [show: boolean]
}

const props = withDefaults(defineProps<Props>(), {
  showAdvanced: false
})

const emit = defineEmits<Emits>()

const chunkSizeOptions = [
  { value: 300, label: 'Small (300 words)' },
  { value: 500, label: 'Medium (500 words) - Recommended' },
  { value: 800, label: 'Large (800 words)' }
]

const overlapOptions = [
  { value: 25, label: 'Low (25 words)' },
  { value: 50, label: 'Medium (50 words) - Recommended' },
  { value: 100, label: 'High (100 words)' }
]

const updateOptions = (updates: Partial<ChunkingOptions>) => {
  emit('update:modelValue', { ...props.modelValue, ...updates })
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>