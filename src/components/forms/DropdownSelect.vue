<template>
  <div class="dropdown-select" :class="{
    'dropdown-select--error': hasError,
    'dropdown-select--disabled': disabled,
    'dropdown-select--open': isOpen
  }">
    <!-- Label -->
    <label v-if="label" class="dropdown-select__label" :for="selectId">
      {{ label }}
      <span v-if="required" class="dropdown-select__required">*</span>
    </label>

    <!-- Description -->
    <p v-if="description" class="dropdown-select__description">
      {{ description }}
    </p>

    <!-- Select Container -->
    <div class="dropdown-select__container" @click="toggleDropdown">
      <!-- Prefix Icon -->
      <div v-if="prefixIcon" class="dropdown-select__prefix">
        <i :class="prefixIcon"></i>
      </div>

      <!-- Selected Value Display -->
      <div class="dropdown-select__display">
        <span v-if="selectedOption" class="dropdown-select__value">
          {{ selectedOption.label }}
        </span>
        <span v-else class="dropdown-select__placeholder">
          {{ placeholder }}
        </span>
      </div>

      <!-- Dropdown Arrow -->
      <div class="dropdown-select__arrow">
        <i class="fas fa-chevron-down"></i>
      </div>
    </div>

    <!-- Dropdown Options -->
    <transition name="dropdown">
      <div v-if="isOpen" class="dropdown-select__dropdown" @click.stop>
        <div class="dropdown-select__options">
          <button
            v-for="option in options"
            :key="option.value"
            type="button"
            class="dropdown-select__option"
            :class="{
              'dropdown-select__option--selected': option.value === modelValue,
              'dropdown-select__option--disabled': option.disabled
            }"
            :disabled="option.disabled"
            @click="selectOption(option)"
          >
            <div class="dropdown-select__option-content">
              <span class="dropdown-select__option-label">{{ option.label }}</span>
              <span v-if="option.description" class="dropdown-select__option-description">
                {{ option.description }}
              </span>
            </div>
            <i v-if="option.value === modelValue" class="fas fa-check dropdown-select__option-check"></i>
          </button>
        </div>
      </div>
    </transition>

    <!-- Helper Text / Error Message -->
    <div v-if="helperText || errorMessage" class="dropdown-select__feedback">
      <p v-if="hasError" class="dropdown-select__error-message">
        <i class="fas fa-exclamation-circle"></i>
        {{ errorMessage }}
      </p>
      <p v-else-if="helperText" class="dropdown-select__helper-text">
        {{ helperText }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Option {
  value: string | number
  label: string
  description?: string
  disabled?: boolean
}

interface Props {
  modelValue?: string | number
  options: Option[]
  label?: string
  description?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  prefixIcon?: string
  helperText?: string
  errorMessage?: string
  selectId?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Select an option...',
  disabled: false,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  change: [option: Option]
  open: []
  close: []
}>()

const isOpen = ref(false)

const selectId = computed(() => props.selectId || `select-${Math.random().toString(36).substr(2, 9)}`)
const hasError = computed(() => !!props.errorMessage)

const selectedOption = computed(() => {
  return props.options.find(option => option.value === props.modelValue)
})

const toggleDropdown = () => {
  if (props.disabled) return
  
  if (isOpen.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

const openDropdown = () => {
  isOpen.value = true
  emit('open')
  document.addEventListener('click', handleOutsideClick)
  document.addEventListener('keydown', handleKeydown)
}

const closeDropdown = () => {
  isOpen.value = false
  emit('close')
  document.removeEventListener('click', handleOutsideClick)
  document.removeEventListener('keydown', handleKeydown)
}

const selectOption = (option: Option) => {
  if (option.disabled) return
  
  emit('update:modelValue', option.value)
  emit('change', option)
  closeDropdown()
}

const handleOutsideClick = (event: MouseEvent) => {
  const target = event.target as Element
  if (!target.closest('.dropdown-select')) {
    closeDropdown()
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeDropdown()
  }
}

onMounted(() => {
  // Clean up any existing listeners
  document.removeEventListener('click', handleOutsideClick)
  document.removeEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.dropdown-select {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.dropdown-select__label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #1F2937);
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 4px;
}

.dropdown-select__required {
  color: var(--color-error-600, #DC2626);
  font-weight: 600;
}

.dropdown-select__description {
  font-size: 13px;
  color: var(--text-secondary, #6B7280);
  margin: 0;
  line-height: 1.4;
}

.dropdown-select__container {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--surface-primary, #FFFFFF);
  border: 1px solid var(--border-color, #E5E7EB);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 44px;
}

.dropdown-select__container:hover {
  border-color: var(--brand-sage, #A8B79D);
}

.dropdown-select--open .dropdown-select__container {
  border-color: var(--brand-sage, #A8B79D);
  box-shadow: 0 0 0 3px rgba(168, 183, 157, 0.1);
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.dropdown-select--error .dropdown-select__container {
  border-color: var(--color-error-600, #DC2626);
}

.dropdown-select--error.dropdown-select--open .dropdown-select__container {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.dropdown-select--disabled .dropdown-select__container {
  background: var(--surface-disabled, #F9FAFB);
  border-color: var(--border-disabled, #D1D5DB);
  cursor: not-allowed;
}

.dropdown-select__prefix {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  color: var(--text-secondary, #6B7280);
  font-size: 16px;
  border-right: 1px solid var(--border-color, #E5E7EB);
}

.dropdown-select__display {
  flex: 1;
  padding: 12px 16px;
  min-width: 0;
}

.dropdown-select__value {
  font-size: 14px;
  color: var(--text-primary, #1F2937);
  line-height: 1.5;
}

.dropdown-select__placeholder {
  font-size: 14px;
  color: var(--text-placeholder, #9CA3AF);
  line-height: 1.5;
}

.dropdown-select__arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  color: var(--text-secondary, #6B7280);
  font-size: 12px;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-select--open .dropdown-select__arrow {
  transform: rotate(180deg);
}

.dropdown-select__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--surface-primary, #FFFFFF);
  border: 1px solid var(--brand-sage, #A8B79D);
  border-top: none;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.dropdown-select__options {
  max-height: 240px;
  overflow-y: auto;
  padding: 4px 0;
}

.dropdown-select__option {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
}

.dropdown-select__option:hover {
  background: var(--brand-sage-light, #F5F7F4);
}

.dropdown-select__option--selected {
  background: rgba(168, 183, 157, 0.1);
  color: var(--brand-sage-dark, #8CA085);
}

.dropdown-select__option--selected:hover {
  background: rgba(168, 183, 157, 0.15);
}

.dropdown-select__option--disabled {
  color: var(--text-disabled, #9CA3AF);
  cursor: not-allowed;
}

.dropdown-select__option--disabled:hover {
  background: none;
}

.dropdown-select__option-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.dropdown-select__option-label {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
}

.dropdown-select__option-description {
  font-size: 12px;
  color: var(--text-secondary, #6B7280);
  line-height: 1.3;
}

.dropdown-select__option-check {
  font-size: 12px;
  color: var(--brand-sage-dark, #8CA085);
  margin-left: 8px;
}

.dropdown-select__feedback {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  min-height: 20px;
}

.dropdown-select__error-message {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-error-600, #DC2626);
  margin: 0;
  line-height: 1.4;
}

.dropdown-select__error-message i {
  font-size: 12px;
  flex-shrink: 0;
}

.dropdown-select__helper-text {
  font-size: 13px;
  color: var(--text-secondary, #6B7280);
  margin: 0;
  line-height: 1.4;
}

/* Transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Size Variants */
.dropdown-select--sm .dropdown-select__container {
  min-height: 36px;
}

.dropdown-select--sm .dropdown-select__display {
  padding: 8px 12px;
}

.dropdown-select--sm .dropdown-select__value,
.dropdown-select--sm .dropdown-select__placeholder {
  font-size: 13px;
}

.dropdown-select--lg .dropdown-select__container {
  min-height: 52px;
}

.dropdown-select--lg .dropdown-select__display {
  padding: 16px 20px;
}

.dropdown-select--lg .dropdown-select__value,
.dropdown-select--lg .dropdown-select__placeholder {
  font-size: 16px;
}

/* Custom Scrollbar */
.dropdown-select__options::-webkit-scrollbar {
  width: 6px;
}

.dropdown-select__options::-webkit-scrollbar-track {
  background: var(--surface-secondary, #F9FAFB);
}

.dropdown-select__options::-webkit-scrollbar-thumb {
  background: var(--border-color, #E5E7EB);
  border-radius: 3px;
}

.dropdown-select__options::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary, #6B7280);
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .dropdown-select__container {
    border-width: 2px;
  }
  
  .dropdown-select__label {
    font-weight: 600;
  }
  
  .dropdown-select__option--selected {
    border-left: 4px solid var(--brand-sage, #A8B79D);
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .dropdown-select__container,
  .dropdown-select__arrow,
  .dropdown-select__option {
    transition: none;
  }
  
  .dropdown-enter-active,
  .dropdown-leave-active {
    transition: none;
  }
}
</style>