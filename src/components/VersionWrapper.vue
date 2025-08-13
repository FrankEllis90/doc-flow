<template>
  <div class="version-wrapper">
    <div class="max-w-6xl mx-auto">
      <!-- Header Section -->
      <div class="text-center mb-8">
        <div class="flex items-center justify-center mb-4">
          <h1 class="text-4xl font-bold mb-0 text-gray-800">
            Version Control
          </h1>
        </div>
        <p class="text-xl max-w-3xl mx-auto text-gray-600">
          Manage your knowledge base versions, track changes, and restore previous states with comprehensive version control.
        </p>
      </div>

      <!-- Version Manager Content -->
      <VersionManager 
        @load-version="$emit('load-version', $event)"
        @show-notification="$emit('show-notification', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import VersionManager from './VersionManager.vue'

defineEmits<{
  'load-version': [versionId: string]
  'show-notification': [notification: any]
}>()
</script>

<style scoped>
.version-wrapper {
  min-height: 100vh;
  padding: 1.5rem;
  background: linear-gradient(135deg, #F9FAFB 0%, #F5F7F4 100%);
}
</style>