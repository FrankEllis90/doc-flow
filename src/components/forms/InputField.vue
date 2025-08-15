<template>
  <div class="input-field" :class="{
    'input-field--error': hasError,
    'input-field--disabled': disabled,
    'input-field--focused': isFocused
  }">
    <!-- Label -->
    <label v-if="label" class="input-field__label" :for="inputId">
      {{ label }}
      <span v-if="required" class="input-field__required">*</span>
    </label>

    <!-- Description -->
    <p v-if="description" class="input-field__description">
      {{ description }}
    </p>

    <!-- Input Container -->
    <div class="input-field__container">
      <!-- Prefix Icon -->
      <div v-if="prefixIcon" class="input-field__prefix">
        <i :class="prefixIcon"></i>
      </div>

      <!-- Input Element -->
      <input
        :id="inputId"
        ref="inputRef"
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :maxlength="maxlength"
        :minlength="minlength"
        :min="min"
        :max="max"
        :step="step"
        class="input-field__input"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
        @keydown="handleKeydown"
      />

      <!-- Suffix Icon -->
      <div v-if="suffixIcon || showClearButton" class="input-field__suffix">
        <button
          v-if="showClearButton && modelValue"
          type="button"
          class="input-field__clear"
          @click="clearInput"
          aria-label="Clear input"
        >
          <i class="fas fa-times"></i>
        </button>
        <i v-else-if="suffixIcon" :class="suffixIcon"></i>
      </div>
    </div>

    <!-- Helper Text / Error Message -->
    <div v-if="helperText || errorMessage" class="input-field__feedback">
      <p v-if="hasError" class="input-field__error-message">
        <i class="fas fa-exclamation-circle"></i>
        {{ errorMessage }}
      </p>
      <p v-else-if="helperText" class="input-field__helper-text">
        {{ helperText }}
      </p>
    </div>

    <!-- Character Count -->
    <div v-if="showCharacterCount && maxlength" class="input-field__character-count">
      {{ characterCount }}/{{ maxlength }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

interface Props {
  modelValue?: string | number
  label?: string
  description?: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  prefixIcon?: string
  suffixIcon?: string
  showClearButton?: boolean
  showCharacterCount?: boolean
  autocomplete?: string
  maxlength?: number
  minlength?: number
  min?: number | string
  max?: number | string
  step?: number | string
  helperText?: string
  errorMessage?: string
  inputId?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  disabled: false,
  readonly: false,
  required: false,
  showClearButton: false,
  showCharacterCount: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  input: [event: Event]
  keydown: [event: KeyboardEvent]
  clear: []
}>()

const inputRef = ref<HTMLInputElement>()
const isFocused = ref(false)

const inputId = computed(() => props.inputId || `input-${Math.random().toString(36).substr(2, 9)}`)
const hasError = computed(() => !!props.errorMessage)
const characterCount = computed(() => String(props.modelValue).length)

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
  emit('input', event)
}

const handleKeydown = (event: KeyboardEvent) => {
  emit('keydown', event)
}

const clearInput = () => {
  emit('update:modelValue', '')
  emit('clear')
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// Expose focus method
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur()
})
</script>

<style scoped>
.input-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.input-field__label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #1F2937);
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 4px;
}

.input-field__required {
  color: var(--color-error-600, #DC2626);
  font-weight: 600;
}

.input-field__description {
  font-size: 13px;
  color: var(--text-secondary, #6B7280);
  margin: 0;
  line-height: 1.4;
}

.input-field__container {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--surface-primary, #FFFFFF);
  border: 1px solid var(--border-color, #E5E7EB);
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.input-field__container:hover {
  border-color: var(--brand-sage, #A8B79D);
}

.input-field--focused .input-field__container {
  border-color: var(--brand-sage, #A8B79D);
  box-shadow: 0 0 0 3px rgba(168, 183, 157, 0.1);
}

.input-field--error .input-field__container {
  border-color: var(--color-error-600, #DC2626);
}

.input-field--error.input-field--focused .input-field__container {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.input-field--disabled .input-field__container {
  background: var(--surface-disabled, #F9FAFB);
  border-color: var(--border-disabled, #D1D5DB);
  cursor: not-allowed;
}

.input-field__prefix,
.input-field__suffix {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  color: var(--text-secondary, #6B7280);
  font-size: 16px;
  flex-shrink: 0;
}

.input-field__prefix {
  border-right: 1px solid var(--border-color, #E5E7EB);
}

.input-field__suffix {
  border-left: 1px solid var(--border-color, #E5E7EB);
}

.input-field__input {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: var(--text-primary, #1F2937);
  line-height: 1.5;
  outline: none;
  width: 100%;
  min-width: 0;
}

.input-field__input::placeholder {
  color: var(--text-placeholder, #9CA3AF);
}

.input-field__input:disabled {
  cursor: not-allowed;
  color: var(--text-disabled, #9CA3AF);
}

.input-field__clear {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--text-secondary, #6B7280);
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.input-field__clear:hover {
  background: var(--surface-secondary, #F3F4F6);
  color: var(--text-primary, #1F2937);
}

.input-field__feedback {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  min-height: 20px;
}

.input-field__error-message {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-error-600, #DC2626);
  margin: 0;
  line-height: 1.4;
}

.input-field__error-message i {
  font-size: 12px;
  flex-shrink: 0;
}

.input-field__helper-text {
  font-size: 13px;
  color: var(--text-secondary, #6B7280);
  margin: 0;
  line-height: 1.4;
}

.input-field__character-count {
  font-size: 12px;
  color: var(--text-secondary, #6B7280);
  text-align: right;
  font-weight: 500;
}

/* Size Variants */
.input-field--sm .input-field__input {
  padding: 8px 12px;
  font-size: 13px;
}

.input-field--sm .input-field__prefix,
.input-field--sm .input-field__suffix {
  padding: 0 8px;
  font-size: 14px;
}

.input-field--lg .input-field__input {
  padding: 16px 20px;
  font-size: 16px;
}

.input-field--lg .input-field__prefix,
.input-field--lg .input-field__suffix {
  padding: 0 16px;
  font-size: 18px;
}

/* Loading State */
.input-field--loading .input-field__suffix::after {
  content: '';
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-color, #E5E7EB);
  border-top: 2px solid var(--brand-sage, #A8B79D);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .input-field__container {
    border-width: 2px;
  }
  
  .input-field__label {
    font-weight: 600;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .input-field__container {
    transition: none;
  }
  
  .input-field__clear {
    transition: none;
  }
}
</style>