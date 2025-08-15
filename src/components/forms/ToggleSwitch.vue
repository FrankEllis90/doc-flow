<template>
  <div class="toggle-switch" :class="{
    'toggle-switch--disabled': disabled,
    'toggle-switch--error': hasError,
    'toggle-switch--checked': modelValue
  }">
    <div class="toggle-switch__container">
      <!-- Hidden Input for Form Submission -->
      <input
        :id="toggleId"
        ref="inputRef"
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        :required="required"
        :name="name"
        class="toggle-switch__input"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <!-- Toggle Switch Visual -->
      <label :for="toggleId" class="toggle-switch__track" :class="{
        'toggle-switch__track--focused': isFocused
      }">
        <span class="toggle-switch__thumb">
          <span v-if="showIcons" class="toggle-switch__icon">
            <i v-if="modelValue" class="fas fa-check"></i>
            <i v-else class="fas fa-times"></i>
          </span>
        </span>
      </label>

      <!-- Label Content -->
      <div v-if="label || description || $slots.default" class="toggle-switch__content">
        <label v-if="label" :for="toggleId" class="toggle-switch__label">
          {{ label }}
          <span v-if="required" class="toggle-switch__required">*</span>
        </label>
        
        <p v-if="description" class="toggle-switch__description">
          {{ description }}
        </p>
        
        <div v-if="$slots.default" class="toggle-switch__slot">
          <slot />
        </div>
      </div>
    </div>

    <!-- Helper Text / Error Message -->
    <div v-if="helperText || errorMessage" class="toggle-switch__feedback">
      <p v-if="hasError" class="toggle-switch__error-message">
        <i class="fas fa-exclamation-circle"></i>
        {{ errorMessage }}
      </p>
      <p v-else-if="helperText" class="toggle-switch__helper-text">
        {{ helperText }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: boolean
  label?: string
  description?: string
  disabled?: boolean
  required?: boolean
  showIcons?: boolean
  size?: 'sm' | 'md' | 'lg'
  name?: string
  helperText?: string
  errorMessage?: string
  toggleId?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
  required: false,
  showIcons: false,
  size: 'md'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [value: boolean, event: Event]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const inputRef = ref<HTMLInputElement>()
const isFocused = ref(false)

const toggleId = computed(() => props.toggleId || `toggle-${Math.random().toString(36).substr(2, 9)}`)
const hasError = computed(() => !!props.errorMessage)

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
  emit('change', target.checked, event)
}

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

// Expose focus method
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur()
})
</script>

<style scoped>
.toggle-switch {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.toggle-switch__container {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.toggle-switch__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

.toggle-switch__track {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
  background: #D1D5DB;
  border-radius: 28px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  flex-shrink: 0;
  margin-top: 2px;
}

.toggle-switch__track:hover {
  background: #9CA3AF;
}

.toggle-switch__track--focused {
  border-color: var(--brand-sage, #A8B79D);
  box-shadow: 0 0 0 2px rgba(168, 183, 157, 0.2);
}

.toggle-switch--checked .toggle-switch__track {
  background: linear-gradient(135deg, var(--brand-sage, #A8B79D) 0%, var(--brand-sage-dark, #8CA085) 100%);
}

.toggle-switch--checked .toggle-switch__track:hover {
  background: linear-gradient(135deg, var(--brand-sage-dark, #8CA085) 0%, #738A6C 100%);
}

.toggle-switch--disabled .toggle-switch__track {
  background: var(--surface-disabled, #F3F4F6);
  cursor: not-allowed;
}

.toggle-switch--disabled .toggle-switch__track:hover {
  background: var(--surface-disabled, #F3F4F6);
}

.toggle-switch--error .toggle-switch__track {
  border-color: var(--color-error-600, #DC2626);
}

.toggle-switch__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-switch--checked .toggle-switch__thumb {
  transform: translateX(22px);
}

.toggle-switch__icon {
  font-size: 10px;
  color: var(--text-secondary, #6B7280);
  transition: all 0.2s;
}

.toggle-switch--checked .toggle-switch__icon {
  color: var(--brand-sage-dark, #8CA085);
}

.toggle-switch__content {
  flex: 1;
  min-width: 0;
}

.toggle-switch__label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #1F2937);
  line-height: 1.4;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2px;
}

.toggle-switch--disabled .toggle-switch__label {
  color: var(--text-disabled, #9CA3AF);
  cursor: not-allowed;
}

.toggle-switch__required {
  color: var(--color-error-600, #DC2626);
  font-weight: 600;
}

.toggle-switch__description {
  font-size: 13px;
  color: var(--text-secondary, #6B7280);
  margin: 0;
  line-height: 1.4;
}

.toggle-switch--disabled .toggle-switch__description {
  color: var(--text-disabled, #9CA3AF);
}

.toggle-switch__slot {
  margin-top: 4px;
}

.toggle-switch__feedback {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  min-height: 20px;
}

.toggle-switch__error-message {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-error-600, #DC2626);
  margin: 0;
  line-height: 1.4;
}

.toggle-switch__error-message i {
  font-size: 12px;
  flex-shrink: 0;
}

.toggle-switch__helper-text {
  font-size: 13px;
  color: var(--text-secondary, #6B7280);
  margin: 0;
  line-height: 1.4;
}

/* Size Variants */
.toggle-switch--sm .toggle-switch__track {
  width: 40px;
  height: 22px;
}

.toggle-switch--sm .toggle-switch__thumb {
  width: 16px;
  height: 16px;
  top: 2px;
  left: 2px;
}

.toggle-switch--sm.toggle-switch--checked .toggle-switch__thumb {
  transform: translateX(18px);
}

.toggle-switch--sm .toggle-switch__icon {
  font-size: 8px;
}

.toggle-switch--sm .toggle-switch__label {
  font-size: 13px;
}

.toggle-switch--sm .toggle-switch__description {
  font-size: 12px;
}

.toggle-switch--lg .toggle-switch__track {
  width: 60px;
  height: 34px;
}

.toggle-switch--lg .toggle-switch__thumb {
  width: 26px;
  height: 26px;
  top: 2px;
  left: 2px;
}

.toggle-switch--lg.toggle-switch--checked .toggle-switch__thumb {
  transform: translateX(26px);
}

.toggle-switch--lg .toggle-switch__icon {
  font-size: 12px;
}

.toggle-switch--lg .toggle-switch__label {
  font-size: 16px;
}

.toggle-switch--lg .toggle-switch__description {
  font-size: 14px;
}

/* Status Variants */
.toggle-switch--success .toggle-switch__track {
  background: var(--color-success-600, #059669);
}

.toggle-switch--warning .toggle-switch__track {
  background: var(--color-warning-600, #D97706);
}

.toggle-switch--error.toggle-switch--checked .toggle-switch__track {
  background: var(--color-error-600, #DC2626);
}

/* Loading State */
.toggle-switch--loading .toggle-switch__thumb::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  border: 1px solid #E5E7EB;
  border-top: 1px solid var(--brand-sage, #A8B79D);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .toggle-switch__track {
    border-width: 2px;
    border-color: #6B7280;
  }
  
  .toggle-switch--checked .toggle-switch__track {
    border-color: var(--brand-sage-dark, #8CA085);
  }
  
  .toggle-switch__label {
    font-weight: 600;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .toggle-switch__track,
  .toggle-switch__thumb,
  .toggle-switch__icon {
    transition: none;
  }
}

/* Right-to-Left Support */
[dir="rtl"] .toggle-switch__container {
  flex-direction: row-reverse;
}

[dir="rtl"] .toggle-switch--checked .toggle-switch__thumb {
  transform: translateX(-22px);
}

[dir="rtl"] .toggle-switch--sm.toggle-switch--checked .toggle-switch__thumb {
  transform: translateX(-18px);
}

[dir="rtl"] .toggle-switch--lg.toggle-switch--checked .toggle-switch__thumb {
  transform: translateX(-26px);
}
</style>