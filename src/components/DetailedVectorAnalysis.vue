<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
      <div class="flex items-center justify-between p-6 border-b flex-shrink-0">
        <h2 class="text-2xl font-bold text-neutral-900">
          Detailed Vector Readiness Analysis
        </h2>
        <button @click="$emit('close')" class="text-neutral-500 hover:text-neutral-700">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      
      <div class="overflow-y-auto flex-1">
        <div class="p-6">
          <!-- Overall Statistics -->
          <div class="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-sage-light p-4 rounded-lg text-center">
              <div class="text-2xl font-bold text-sage">{{ analysisResults.length }}</div>
              <div class="text-sm text-sage-dark">Chunks Analyzed</div>
            </div>
            <div class="bg-green-50 p-4 rounded-lg text-center">
              <div class="text-2xl font-bold text-green-600">{{ avgOverallScore }}%</div>
              <div class="text-sm text-green-700">Average Quality</div>
            </div>
            <div class="bg-purple-50 p-4 rounded-lg text-center">
              <div class="text-2xl font-bold text-purple-600">{{ highQualityChunks }}</div>
              <div class="text-sm text-purple-700">High Quality (≥80%)</div>
            </div>
            <div class="bg-orange-50 p-4 rounded-lg text-center">
              <div class="text-2xl font-bold text-orange-600">{{ needsImprovementChunks }}</div>
              <div class="text-sm text-orange-700">Needs Work (<60%)</div>
            </div>
          </div>

          <!-- Platform Compatibility Summary -->
          <div v-if="Object.keys(platformScores).length > 0" class="mb-6">
            <h3 class="text-lg font-semibold mb-3">Platform Compatibility Summary</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div v-for="(score, platform) in platformScores" :key="platform" 
                   class="border rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-medium">{{ getPlatformDisplayName(platform) }}</h4>
                  <span class="px-2 py-1 rounded text-xs font-medium" 
                        :class="getStatusBadgeClass(score.status)">
                    {{ score.status }}
                  </span>
                </div>
                <div class="w-full bg-neutral-200 rounded-full h-2 mb-2">
                  <div class="bg-sage h-2 rounded-full transition-all duration-300"
                       :style="{ width: score.score + '%' }"></div>
                </div>
                <div class="text-sm text-neutral-600">{{ score.score }}% compatibility</div>
              </div>
            </div>
          </div>

          <!-- Individual Chunk Analysis -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-3">Individual Chunk Analysis</h3>
            <div class="space-y-4">
              <div v-for="(result, index) in analysisResults" :key="result.chunkId"
                   class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <h4 class="font-medium text-neutral-900">
                      Chunk {{ index + 1 }}
                      <span class="text-sm text-neutral-500 font-normal">
                        ({{ result.content.wordCount }} words)
                      </span>
                    </h4>
                    <div class="flex items-center mt-1">
                      <div class="text-lg font-bold" :class="getScoreColor(result.overallScore)">
                        {{ result.overallScore }}%
                      </div>
                      <div class="ml-2 text-sm text-neutral-500">Overall Quality</div>
                    </div>
                  </div>
                  <button @click="toggleChunkDetails(result.chunkId)" 
                          class="text-sage hover:text-sage-dark px-2 py-1 rounded text-sm transition-colors">
                    <i :class="expandedChunks.has(result.chunkId) ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                    {{ expandedChunks.has(result.chunkId) ? 'Less' : 'More' }}
                  </button>
                </div>

                <!-- Metric Scores -->
                <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                  <div class="text-center">
                    <div class="text-sm font-medium" :class="getScoreColor(result.semanticCoherence.score)">
                      {{ result.semanticCoherence.score }}%
                    </div>
                    <div class="text-xs text-neutral-500">Semantic</div>
                  </div>
                  <div class="text-center">
                    <div class="text-sm font-medium" :class="getScoreColor(result.informationDensity.score)">
                      {{ result.informationDensity.score }}%
                    </div>
                    <div class="text-xs text-neutral-500">Density</div>
                  </div>
                  <div class="text-center">
                    <div class="text-sm font-medium" :class="getScoreColor(result.embeddingQuality.score)">
                      {{ result.embeddingQuality.score }}%
                    </div>
                    <div class="text-xs text-neutral-500">Embedding</div>
                  </div>
                  <div class="text-center">
                    <div class="text-sm font-medium" :class="getScoreColor(result.contextualCompleteness.score)">
                      {{ result.contextualCompleteness.score }}%
                    </div>
                    <div class="text-xs text-neutral-500">Context</div>
                  </div>
                  <div class="text-center">
                    <div class="text-sm font-medium" :class="getScoreColor(result.retrievalOptimization.score)">
                      {{ result.retrievalOptimization.score }}%
                    </div>
                    <div class="text-xs text-neutral-500">Retrieval</div>
                  </div>
                </div>

                <!-- Quality Flags -->
                <div v-if="result.qualityFlags && result.qualityFlags.length > 0" class="mb-3">
                  <div class="flex flex-wrap gap-2">
                    <span v-for="flag in result.qualityFlags" :key="flag.message"
                          class="px-2 py-1 rounded text-xs"
                          :class="getFlagClass(flag.type)">
                      <i :class="getFlagIcon(flag.type)" class="mr-1"></i>
                      {{ flag.message }}
                    </span>
                  </div>
                </div>

                <!-- Expanded Details -->
                <div v-if="expandedChunks.has(result.chunkId)" class="mt-4 space-y-4 border-t pt-4">
                  
                  <!-- Semantic Coherence Details -->
                  <div class="bg-neutral-50 p-3 rounded">
                    <h5 class="font-medium mb-2">Semantic Coherence Analysis</h5>
                    <div class="text-sm text-neutral-700 space-y-1">
                      <div>Topic Consistency: {{ result.semanticCoherence.topicConsistency }}%</div>
                      <div>Sentence Flow: {{ result.semanticCoherence.sentenceFlow }}%</div>
                      <div v-if="result.semanticCoherence.details">
                        Sentences: {{ result.semanticCoherence.details.sentenceCount }}, 
                        Topic Shifts: {{ result.semanticCoherence.details.topicShifts }}
                      </div>
                    </div>
                  </div>

                  <!-- Information Density Details -->
                  <div class="bg-neutral-50 p-3 rounded">
                    <h5 class="font-medium mb-2">Information Density Analysis</h5>
                    <div class="text-sm text-neutral-700 space-y-1">
                      <div>Content Words: {{ result.informationDensity.contentWordRatio }}%</div>
                      <div>Lexical Diversity: {{ result.informationDensity.lexicalDiversity }}%</div>
                      <div>Technical Terms: {{ result.informationDensity.technicalTermDensity }}%</div>
                    </div>
                  </div>

                  <!-- Platform Compatibility -->
                  <div class="bg-neutral-50 p-3 rounded">
                    <h5 class="font-medium mb-2">Platform Compatibility</h5>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                      <div v-for="(compat, platform) in result.platformCompatibility" :key="platform"
                           class="text-sm">
                        <div class="font-medium">{{ getPlatformDisplayName(platform) }}</div>
                        <div class="text-neutral-600" :class="getScoreColor(compat.score)">
                          {{ compat.score }}% - {{ compat.status }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Recommendations -->
                  <div v-if="result.recommendations && result.recommendations.length > 0" 
                       class="bg-sage-light p-3 rounded">
                    <h5 class="font-medium mb-2">Specific Recommendations</h5>
                    <div class="space-y-2">
                      <div v-for="rec in result.recommendations.slice(0, 3)" :key="rec.title || rec.description"
                           class="text-sm">
                        <div class="flex items-start space-x-2">
                          <span class="flex-shrink-0 w-2 h-2 rounded-full mt-2"
                                :class="getPriorityColor(rec.priority)"></span>
                          <div>
                            <div class="font-medium">{{ rec.title }}</div>
                            <div class="text-neutral-600">{{ rec.description }}</div>
                            <div v-if="rec.expectedImprovement" class="text-xs text-green-600 mt-1">
                              Expected improvement: {{ rec.expectedImprovement }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <div class="border-t p-4 bg-neutral-50 flex justify-end flex-shrink-0">
        <button @click="$emit('close')" 
                class="px-4 py-2 bg-sage text-white rounded hover:bg-sage-dark transition-colors">
          Close Analysis
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DetailedVectorAnalysis',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    analysisResults: {
      type: Array,
      default: () => []
    },
    platformScores: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['close'],
  data() {
    return {
      expandedChunks: new Set()
    };
  },
  computed: {
    avgOverallScore() {
      if (this.analysisResults.length === 0) return 0;
      const sum = this.analysisResults.reduce((total, result) => total + result.overallScore, 0);
      return Math.round(sum / this.analysisResults.length);
    },

    highQualityChunks() {
      return this.analysisResults.filter(result => result.overallScore >= 80).length;
    },

    needsImprovementChunks() {
      return this.analysisResults.filter(result => result.overallScore < 60).length;
    }
  },
  methods: {
    toggleChunkDetails(chunkId) {
      if (this.expandedChunks.has(chunkId)) {
        this.expandedChunks.delete(chunkId);
      } else {
        this.expandedChunks.add(chunkId);
      }
    },

    getScoreColor(score) {
      if (score >= 80) return 'text-green-600';
      if (score >= 60) return 'text-yellow-600';
      return 'text-red-600';
    },

    getStatusBadgeClass(status) {
      switch (status) {
        case 'excellent': return 'bg-green-100 text-green-800';
        case 'good': return 'bg-sage-light text-sage-dark';
        case 'fair': return 'bg-yellow-100 text-yellow-800';
        case 'poor': return 'bg-red-100 text-red-800';
        default: return 'bg-neutral-100 text-neutral-800';
      }
    },

    getPlatformDisplayName(platform) {
      const names = {
        'openai': 'OpenAI',
        'pinecone': 'Pinecone',
        'chromadb': 'ChromaDB',
        'azure_cognitive': 'Azure Cognitive',
        'elasticsearch': 'Elasticsearch'
      };
      return names[platform] || platform.charAt(0).toUpperCase() + platform.slice(1);
    },

    getFlagClass(type) {
      switch (type) {
        case 'success': return 'bg-green-100 text-green-800';
        case 'warning': return 'bg-yellow-100 text-yellow-800';
        case 'error': return 'bg-red-100 text-red-800';
        default: return 'bg-sage-light text-sage-dark';
      }
    },

    getFlagIcon(type) {
      switch (type) {
        case 'success': return 'fas fa-check-circle';
        case 'warning': return 'fas fa-exclamation-triangle';
        case 'error': return 'fas fa-exclamation-circle';
        default: return 'fas fa-info-circle';
      }
    },

    getPriorityColor(priority) {
      switch (priority) {
        case 'high': return 'bg-red-500';
        case 'medium': return 'bg-yellow-500';
        case 'low': return 'bg-green-500';
        default: return 'bg-neutral-500';
      }
    }
  }
};
</script>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>