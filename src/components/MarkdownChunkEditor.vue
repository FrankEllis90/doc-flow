<template>
  <div class="chunk-editor card-base">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-neutral-900">Edit Chunk: {{ chunk.chunk_id }}</h3>
      <div class="flex space-x-2">
        <button 
          @click="$emit('save', editedChunk)"
          class="btn-success"
        >
          Save
        </button>
        <button 
          @click="$emit('cancel')"
          class="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- Chunk Metadata -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
      <div>
        <label class="block text-sm font-medium text-neutral-900 mb-1">Chunk ID</label>
        <input 
          v-model="editedChunk.chunk_id"
          type="text"
          class="input-field"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-neutral-900 mb-1">Source File</label>
        <input 
          v-model="editedChunk.source"
          type="text"
          class="input-field bg-neutral-100"
          readonly
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-neutral-900 mb-1">Word Count</label>
        <input 
          :value="editedChunk.metadata.wordCount"
          type="number"
          class="input-field bg-neutral-100"
          readonly
        />
      </div>
      <div v-if="editedChunk.metadata.section">
        <label class="block text-sm font-medium text-neutral-900 mb-1">Section</label>
        <input 
          v-model="editedChunk.metadata.section"
          type="text"
          class="input-field"
        />
      </div>
    </div>

    <!-- Content Editor -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-neutral-900 mb-2">Content</label>
      <textarea 
        v-model="editedChunk.content"
        @input="updateWordCount"
        rows="8"
        class="textarea-field"
        placeholder="Edit chunk content..."
      ></textarea>
      <div class="text-sm text-neutral-600 mt-1">
        {{ editedChunk.content.split(' ').length }} words
      </div>
    </div>

    <!-- Tags Editor -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-neutral-900 mb-2">Tags</label>
      
      <!-- Current Tags -->
      <div class="flex flex-wrap gap-2 mb-3">
        <span 
          v-for="(tag, index) in editedChunk.tags" 
          :key="index"
          class="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full"
        >
          {{ tag }}
          <button 
            @click="removeTag(index)"
            class="ml-1 text-primary-600 hover:text-primary-800"
          >
            ×
          </button>
        </span>
      </div>
      
      <!-- Add New Tag -->
      <div class="flex space-x-2">
        <input 
          v-model="newTag"
          @keyup.enter="addTag"
          type="text"
          placeholder="Add a tag..."
          class="flex-1 p-2 border border-neutral-300 rounded"
        />
        <button 
          @click="addTag"
          :disabled="!newTag.trim()"
          class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Tag
        </button>
      </div>
      
      <!-- Tag Suggestions -->
      <div v-if="tagSuggestions.length > 0" class="mt-3">
        <div class="text-sm text-neutral-600 mb-2">Suggested tags:</div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="suggestion in tagSuggestions"
            :key="suggestion"
            @click="addSuggestedTag(suggestion)"
            class="px-2 py-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 text-xs rounded-full transition-colors"
          >
            + {{ suggestion }}
          </button>
        </div>
      </div>
    </div>

    <!-- Advanced Options -->
    <div class="border-t pt-4">
      <button 
        @click="showAdvanced = !showAdvanced"
        class="flex items-center text-sm text-neutral-600 hover:text-neutral-800 mb-3"
      >
        <span class="mr-1">{{ showAdvanced ? '▼' : '▶' }}</span>
        Advanced Options
      </button>
      
      <div v-if="showAdvanced" class="space-y-4">
        <!-- Custom Metadata -->
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-2">Custom Metadata (JSON)</label>
          <textarea 
            v-model="customMetadataString"
            @input="updateCustomMetadata"
            rows="4"
            class="w-full p-3 border border-neutral-300 rounded-lg font-mono text-sm"
            placeholder='{"key": "value", "category": "example"}'
          ></textarea>
          <div v-if="metadataError" class="text-red-500 text-sm mt-1">
            {{ metadataError }}
          </div>
        </div>
        
        <!-- Chunk Actions -->
        <div class="flex flex-wrap gap-2">
          <button 
            @click="splitChunk"
            class="btn-warning"
            :disabled="editedChunk.content.length < 100"
            title="Split this chunk into two smaller chunks"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
            </svg>
            Split Chunk
          </button>
          <button 
            @click="duplicateChunk"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Create a copy of this chunk"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            Duplicate
          </button>
          <button 
            @click="confirmDelete"
            class="btn-danger"
            title="Permanently delete this chunk"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            Delete Chunk
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-neutral-800 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div class="flex items-center mb-4">
          <svg class="w-6 h-6 text-error-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <h3 class="text-lg font-semibold text-neutral-900">Delete Chunk</h3>
        </div>
        
        <p class="text-neutral-600 mb-6">
          Are you sure you want to delete chunk <strong>{{ chunk.chunk_id }}</strong>? This action cannot be undone.
        </p>
        
        <div class="flex justify-end space-x-3">
          <button
            @click="showDeleteConfirm = false"
            class="btn-secondary"
          >
            Cancel
          </button>
          <button
            @click="deleteChunk"
            class="btn-danger"
          >
            Delete Chunk
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { suggestTags } from '../utils/chunker.js';

export default {
  name: 'MarkdownChunkEditor',
  props: {
    chunk: {
      type: Object,
      required: true
    }
  },
  emits: ['save', 'cancel', 'delete', 'split', 'duplicate'],
  data() {
    return {
      editedChunk: null,
      newTag: '',
      showAdvanced: false,
      customMetadataString: '',
      metadataError: '',
      tagSuggestions: [],
      showDeleteConfirm: false
    };
  },
  created() {
    this.editedChunk = JSON.parse(JSON.stringify(this.chunk));
    this.customMetadataString = JSON.stringify(this.editedChunk.metadata.custom || {}, null, 2);
    this.generateTagSuggestions();
  },
  methods: {
    updateWordCount() {
      this.editedChunk.metadata.wordCount = this.editedChunk.content.split(/\s+/).length;
    },
    
    addTag() {
      if (this.newTag.trim() && !this.editedChunk.tags.includes(this.newTag.trim())) {
        this.editedChunk.tags.push(this.newTag.trim().toLowerCase());
        this.newTag = '';
        this.updateTagsString();
      }
    },
    
    addSuggestedTag(tag) {
      if (!this.editedChunk.tags.includes(tag)) {
        this.editedChunk.tags.push(tag);
        this.updateTagsString();
        this.generateTagSuggestions();
      }
    },
    
    removeTag(index) {
      this.editedChunk.tags.splice(index, 1);
      this.updateTagsString();
    },
    
    updateTagsString() {
      this.editedChunk.tagsString = this.editedChunk.tags.join(', ');
    },
    
    generateTagSuggestions() {
      const suggestions = suggestTags(this.editedChunk.content);
      this.tagSuggestions = suggestions.filter(tag => !this.editedChunk.tags.includes(tag));
    },
    
    updateCustomMetadata() {
      try {
        const customData = JSON.parse(this.customMetadataString);
        this.editedChunk.metadata.custom = customData;
        this.metadataError = '';
      } catch (error) {
        this.metadataError = 'Invalid JSON format';
      }
    },
    
    splitChunk() {
      const content = this.editedChunk.content;
      const midPoint = Math.floor(content.length / 2);
      const splitPoint = content.lastIndexOf(' ', midPoint);
      
      if (splitPoint > 0) {
        const firstPart = content.substring(0, splitPoint).trim();
        const secondPart = content.substring(splitPoint).trim();
        
        const firstChunk = {
          ...this.editedChunk,
          content: firstPart,
          chunk_id: this.editedChunk.chunk_id + '_a',
          metadata: {
            ...this.editedChunk.metadata,
            wordCount: firstPart.split(/\s+/).length
          }
        };
        
        const secondChunk = {
          ...this.editedChunk,
          content: secondPart,
          chunk_id: this.editedChunk.chunk_id + '_b',
          metadata: {
            ...this.editedChunk.metadata,
            wordCount: secondPart.split(/\s+/).length
          }
        };
        
        this.$emit('split', { original: this.chunk, parts: [firstChunk, secondChunk] });
      }
    },
    
    duplicateChunk() {
      const duplicate = {
        ...this.editedChunk,
        chunk_id: this.editedChunk.chunk_id + '_copy',
        metadata: {
          ...this.editedChunk.metadata,
          createdAt: new Date().toISOString()
        }
      };
      
      this.$emit('duplicate', duplicate);
    },
    
    confirmDelete() {
      this.showDeleteConfirm = true;
    },
    
    deleteChunk() {
      this.$emit('delete', this.chunk.chunk_id);
      this.showDeleteConfirm = false;
    }
  }
};
</script>

<style scoped>
.chunk-editor {
  max-width: 4xl;
}
</style>