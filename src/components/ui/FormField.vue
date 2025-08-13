<template>
  <div class="form-group">
    <!-- Label with proper accessibility -->
    <label 
      v-if="label"
      :for="inputId"
      class="form-label"
      :class="{ 'form-label-required': required }"
    >
      {{ label }}
      <span v-if="tooltip" class="ml-1 text-neutral-500 cursor-help" :title="tooltip">
        <i class="fas fa-question-circle text-xs"></i>
      </span>
    </label>

    <!-- Input wrapper for icons and validation -->
    <div class="relative">
      <!-- Prefix icon -->
      <div 
        v-if="prefixIcon" 
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
      >
        <i :class="[prefixIcon, 'text-neutral-400', iconClasses]"></i>
      </div>

      <!-- Input field -->
      <select
        v-if="type === 'select'"
        :id="inputId"
        v-model="inputValue"
        v-bind="inputProps"
        :class="inputClasses"
        :aria-invalid="hasError"
        :aria-describedby="hasError ? `${inputId}-error` : hasHint ? `${inputId}-hint` : undefined"
        @blur="handleBlur"
        @focus="handleFocus"
        @change="handleInput"
      >
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
      </select>
      <component
        v-else
        :is="inputComponent"
        :id="inputId"
        v-model="inputValue"
        v-bind="inputProps"
        :class="inputClasses"
        :aria-invalid="hasError"
        :aria-describedby="hasError ? `${inputId}-error` : hasHint ? `${inputId}-hint` : undefined"
        @blur="handleBlur"
        @focus="handleFocus"
        @input="handleInput"
      />

      <!-- Suffix icon or loading -->
      <div 
        v-if="suffixIcon || loading" 
        class="absolute inset-y-0 right-0 pr-3 flex items-center"
        :class="{ 'pointer-events-none': !suffixIcon || loading }"
      >
        <div v-if="loading" class="loading-spinner text-neutral-400"></div>
        <i 
          v-else-if="suffixIcon" 
          :class="[suffixIcon, 'text-neutral-400 cursor-pointer', iconClasses]"
          @click="$emit('suffix-click')"
        ></i>
      </div>

      <!-- Validation state icon -->
      <div 
        v-if="validationState && !loading"
        class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
        :class="{ 'pr-10': suffixIcon }"
      >
        <i 
          :class="[validationIcon, 'w-4 h-4', validationIconClasses]"
        ></i>
      </div>
    </div>

    <!-- Help text -->
    <div 
      v-if="hasHint && !hasError"
      :id="`${inputId}-hint`"
      class="form-message form-message-info"
    >
      <i class="fas fa-info-circle flex-shrink-0"></i>
      <span>{{ hint }}</span>
    </div>

    <!-- Error message -->
    <div 
      v-if="hasError"
      :id="`${inputId}-error`"
      class="form-message form-message-error"
      role="alert"
    >
      <i class="fas fa-exclamation-circle flex-shrink-0"></i>
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Success message -->
    <div 
      v-if="validationState === 'success' && successMessage"
      class="form-message form-message-success"
    >
      <i class="fas fa-check-circle flex-shrink-0"></i>
      <span>{{ successMessage }}</span>
    </div>

    <!-- Warning message -->
    <div 
      v-if="validationState === 'warning' && warningMessage"
      class="form-message form-message-warning"
    >
      <i class="fas fa-exclamation-triangle flex-shrink-0"></i>
      <span>{{ warningMessage }}</span>
    </div>

    <!-- Character count -->
    <div 
      v-if="showCharCount && maxLength"
      class="flex justify-between items-center mt-1 text-xs text-neutral-500"
    >
      <span v-if="minLength">Minimum {{ minLength }} characters</span>
      <span 
        class="ml-auto"
        :class="{
          'text-warning-600': characterCount > maxLength * 0.8,
          'text-error-600': characterCount > maxLength
        }"
      >
        {{ characterCount }}/{{ maxLength }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useAttrs, useSlots } from 'vue'

export interface FormFieldProps {
  modelValue?: string | number | boolean
  label?: string
  hint?: string
  errorMessage?: string
  successMessage?: string
  warningMessage?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  loading?: boolean
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'number' | 'textarea' | 'select'
  placeholder?: string
  prefixIcon?: string
  suffixIcon?: string
  validationState?: 'error' | 'success' | 'warning' | null
  size?: 'sm' | 'md' | 'lg'
  tooltip?: string
  minLength?: number
  maxLength?: number
  showCharCount?: boolean
  rows?: number
  options?: Array<{ value: string | number; label: string; disabled?: boolean }>
}

const props = withDefaults(defineProps<FormFieldProps>(), {
  type: 'text',
  size: 'md',
  validationState: null,
  rows: 4,
  showCharCount: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | boolean]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
  'input': [event: Event]
  'suffix-click': []
}>()

const attrs = useAttrs()
const slots = useSlots()

// Generate unique ID for accessibility
const inputId = computed(() => `field-${Math.random().toString(36).substr(2, 9)}`)

// Reactive input value
const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Character count
const characterCount = computed(() => {
  if (typeof inputValue.value === 'string') {
    return inputValue.value.length
  }
  return 0
})

// Validation states
const hasError = computed(() => props.validationState === 'error' || !!props.errorMessage)
const hasHint = computed(() => !!props.hint)

// Determine input component
const inputComponent = computed(() => {
  switch (props.type) {
    case 'textarea':
      return 'textarea'
    case 'select':
      return 'select'
    default:
      return 'input'
  }
})

// Input props
const inputProps = computed(() => {
  const baseProps = {
    type: props.type === 'textarea' || props.type === 'select' ? undefined : props.type,
    placeholder: props.placeholder,
    disabled: props.disabled,
    readonly: props.readonly,
    required: props.required,
    minlength: props.minLength,
    maxlength: props.maxLength,
    ...attrs
  }

  if (props.type === 'textarea') {
    baseProps.rows = props.rows
  }

  return baseProps
})

// Dynamic classes
const inputClasses = computed(() => {
  const baseClasses = ['form-input']
  
  // Size variants
  if (props.size === 'sm') baseClasses.push('form-input-sm')
  if (props.size === 'lg') baseClasses.push('form-input-lg')
  
  // Icon spacing
  if (props.prefixIcon) baseClasses.push('pl-10')
  if (props.suffixIcon || props.loading || props.validationState) baseClasses.push('pr-10')
  
  // Validation states
  if (hasError.value) baseClasses.push('form-input-error')
  else if (props.validationState === 'success') baseClasses.push('form-input-success')
  else if (props.validationState === 'warning') baseClasses.push('form-input-warning')
  
  // Textarea specific
  if (props.type === 'textarea') {
    baseClasses.push('form-textarea')
    baseClasses.splice(baseClasses.indexOf('form-input'), 1)
  }
  
  // Select specific
  if (props.type === 'select') {
    baseClasses.push('form-select')
    baseClasses.splice(baseClasses.indexOf('form-input'), 1)
  }
  
  return baseClasses
})

const iconClasses = computed(() => {
  const classes = ['w-4 h-4']
  if (props.size === 'sm') classes.push('w-3 h-3')
  if (props.size === 'lg') classes.push('w-5 h-5')
  return classes
})

const validationIcon = computed(() => {
  switch (props.validationState) {
    case 'success':
      return 'fas fa-check-circle'
    case 'error':
      return 'fas fa-exclamation-circle'
    case 'warning':
      return 'fas fa-exclamation-triangle'
    default:
      return ''
  }
})

const validationIconClasses = computed(() => {
  switch (props.validationState) {
    case 'success':
      return 'text-success-600'
    case 'error':
      return 'text-error-600'
    case 'warning':
      return 'text-warning-600'
    default:
      return ''
  }
})

// Event handlers
const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  inputValue.value = target.value
  emit('input', event)
}
</script>