<template>
  <button
    @click="exportJSON"
    :disabled="!canExport"
    :class="buttonClass"
    class="transition-all duration-200 transform hover:scale-105 font-work font-semibold px-6 py-3 rounded-lg"
  >
    <div class="flex items-center space-x-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      <span>{{ buttonText }}</span>
    </div>
  </button>
</template>

<script>
import { computed } from 'vue'
import { saveAs } from 'file-saver'

export default {
  name: 'ExportButton',
  props: {
    categories: {
      type: Array,
      required: true
    }
  },
  emits: ['show-notification', 'export-success'],
  setup(props, { emit }) {
    const validation = computed(() => {
      const errors = []
      
      // Check for empty categories
      const emptyCategories = props.categories.filter(c => !c.name.trim())
      if (emptyCategories.length > 0) {
        errors.push('Categories with empty names found')
      }
      
      // Check for duplicate category names
      const categoryNames = props.categories.map(c => c.name.trim().toLowerCase())
      const duplicates = categoryNames.filter((name, index) => 
        categoryNames.indexOf(name) !== index
      )
      if (duplicates.length > 0) {
        errors.push('Duplicate category names found')
      }
      
      // Check for empty questions or answers
      let emptyQuestions = 0
      let emptyAnswers = 0
      
      props.categories.forEach(category => {
        category.questions.forEach(q => {
          if (!q.question.trim()) emptyQuestions++
          if (!q.answer.trim()) emptyAnswers++
        })
      })
      
      if (emptyQuestions > 0) {
        errors.push(`${emptyQuestions} empty question(s) found`)
      }
      
      if (emptyAnswers > 0) {
        errors.push(`${emptyAnswers} empty answer(s) found`)
      }
      
      return {
        isValid: errors.length === 0,
        errors
      }
    })
    
    const canExport = computed(() => {
      return validation.value.isValid && props.categories.length > 0
    })
    
    const buttonText = computed(() => {
      if (!validation.value.isValid) {
        return 'Cannot Export (Invalid Data)'
      } else if (props.categories.length === 0) {
        return 'Cannot Export (No Categories)'
      } else {
        return 'Download JSON'
      }
    })
    
    const buttonClass = computed(() => {
      if (canExport.value) {
        return 'bg-primary-500 text-neutral-800 hover:shadow-lg'
      } else {
        return 'bg-neutral-400 text-neutral-600 cursor-not-allowed'
      }
    })
    
    const exportJSON = () => {
      if (!canExport.value) {
        if (!validation.value.isValid) {
          emit('show-notification', {
            type: 'error',
            title: 'Export Failed',
            message: 'Cannot export: ' + validation.value.errors.join(', ')
          })
        } else {
          emit('show-notification', {
            type: 'warning',
            title: 'Export Failed',
            message: 'Cannot export: No categories found'
          })
        }
        return
      }
      
      try {
        // Create the JSON structure matching the required format
        const jsonStructure = {}
        
        props.categories.forEach(category => {
          jsonStructure[category.name] = category.questions.map(q => ({
            question: q.question,
            answer: q.answer
          }))
        })
        
        // Create blob and download
        const jsonString = JSON.stringify(jsonStructure, null, 2)
        const blob = new Blob([jsonString], { type: 'application/json' })
        
        // Generate filename with date
        const date = new Date().toISOString().split('T')[0]
        const filename = `peppercorn_kb_${date}.json`
        
        saveAs(blob, filename)
        
        // Emit export success for auto-save
        emit('export-success', filename)
        
        // Show success message
        emit('show-notification', {
          type: 'success',
          title: 'Export Successful',
          message: `Knowledge base exported successfully as ${filename}`
        })
      } catch (error) {
        console.error('Export failed:', error)
        emit('show-notification', {
          type: 'error',
          title: 'Export Failed',
          message: 'Export failed. Please try again.'
        })
      }
    }
    
    return {
      canExport,
      buttonText,
      buttonClass,
      exportJSON
    }
  }
}
</script>