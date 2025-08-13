<template>
  <div class="bg-white border border-neutral-200 rounded-lg">
    <div class="bg-primary-100 px-4 py-2 rounded-t-lg border-b border-primary-200">
      <h3 class="text-sm font-medium text-neutral-800">Live JSON Output</h3>
    </div>
    <div class="p-4">
      <pre class="text-sm text-neutral-800 font-mono bg-neutral-50 p-4 rounded border overflow-x-auto max-h-96 overflow-y-auto">{{ formattedJson }}</pre>
    </div>
    <div class="px-4 pb-4">
      <div class="flex justify-between items-center text-sm text-neutral-600">
        <span>{{ validationMessage }}</span>
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded-full" :class="validationColor"></div>
          <span>{{ validationStatus }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'JsonPreview',
  props: {
    categories: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const jsonStructure = computed(() => {
      const result = {}
      
      props.categories.forEach(category => {
        result[category.name] = category.questions.map(q => ({
          question: q.question,
          answer: q.answer
        }))
      })
      
      return result
    })
    
    const formattedJson = computed(() => {
      return JSON.stringify(jsonStructure.value, null, 2)
    })
    
    const validation = computed(() => {
      const errors = []
      const warnings = []
      
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
      
      // Check for categories without questions
      const categoriesWithoutQuestions = props.categories.filter(c => c.questions.length === 0)
      if (categoriesWithoutQuestions.length > 0) {
        warnings.push(`${categoriesWithoutQuestions.length} category(ies) without questions`)
      }
      
      const isValid = errors.length === 0
      const hasWarnings = warnings.length > 0
      
      return {
        isValid,
        hasWarnings,
        errors,
        warnings,
        allIssues: [...errors, ...warnings]
      }
    })
    
    const validationStatus = computed(() => {
      if (!validation.value.isValid) {
        return 'Invalid'
      } else if (validation.value.hasWarnings) {
        return 'Valid (with warnings)'
      } else {
        return 'Valid'
      }
    })
    
    const validationColor = computed(() => {
      if (!validation.value.isValid) {
        return 'bg-error-600'
      } else if (validation.value.hasWarnings) {
        return 'bg-warning-600'
      } else {
        return 'bg-primary-500'
      }
    })
    
    const validationMessage = computed(() => {
      if (validation.value.allIssues.length === 0) {
        return 'Ready to export'
      } else {
        return validation.value.allIssues.join(', ')
      }
    })
    
    return {
      formattedJson,
      validationStatus,
      validationColor,
      validationMessage
    }
  }
}
</script>