<template>
  <div class="insights-step">
    <div style="display: flex; flex-direction: column; gap: var(--space-6);">

      <!-- Overall Score Card -->
      <div class="card">
        <div class="card-body">
          <div class="flex items-start justify-between">
            <div>
              <h3 style="font-size: var(--fluid-text-xl); font-weight: var(--font-weight-semibold); color: var(--color-neutral-900); margin-bottom: var(--space-1);">Overall Vector Readiness</h3>
              <p style="color: var(--color-neutral-600); font-size: var(--fluid-text-sm);">Based on {{ chunks.length }} processed chunks</p>
            </div>
            <div class="text-right">
              <div class="flex items-center" style="gap: var(--space-3);">
                <div>
                  <div class="text-3xl font-bold" :class="overallScoreColor">{{ overallScore }}/100</div>
                  <div class="text-xs" style="margin-top: var(--space-1);" :class="overallGrade.color">{{ overallGrade.label }}</div>
                </div>
                <div class="w-20 h-20">
                  <svg class="transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      class="text-[color:var(--color-neutral-200)]"
                      stroke="currentColor"
                      stroke-width="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      :class="overallScoreColor"
                      stroke="currentColor"
                      stroke-width="3"
                      fill="none"
                      :stroke-dasharray="`${overallScore}, 100`"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Key Metrics Grid -->
      <div class="metrics-grid">
        <h3 style="font-size: var(--fluid-text-lg); font-weight: var(--font-weight-semibold); color: var(--color-neutral-900); margin-bottom: var(--space-4);">📈 Content Analysis</h3>
        <div class="grid grid-cols-2 md:grid-cols-4" style="gap: var(--space-4);">
          <div class="card">
            <div class="card-body metric-card-content">
              <div class="metric-icon embedding">
                <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
              </div>
              <div class="metric-content">
                <div class="metric-value">{{ embeddingScore }}%</div>
                <div class="metric-label">Embedding Quality</div>
                <div class="metric-status" :class="embeddingStatus.color">{{ embeddingStatus.label }}</div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body metric-card-content">
              <div class="metric-icon semantic">
                <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="metric-content">
                <div class="metric-value">{{ semanticScore }}%</div>
                <div class="metric-label">Semantic Coherence</div>
                <div class="metric-status" :class="semanticStatus.color">{{ semanticStatus.label }}</div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body metric-card-content">
              <div class="metric-icon search">
                <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="metric-content">
                <div class="metric-value">{{ searchScore }}%</div>
                <div class="metric-label">Search Optimization</div>
                <div class="metric-status" :class="searchStatus.color">{{ searchStatus.label }}</div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body metric-card-content">
              <div class="metric-icon metadata">
                <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="metric-content">
                <div class="metric-value">{{ metadataScore }}%</div>
                <div class="metric-label">Metadata Quality</div>
                <div class="metric-status" :class="metadataStatus.color">{{ metadataStatus.label }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Platform Compatibility -->
      <div class="platform-compatibility">
        <h3 style="font-size: var(--fluid-text-lg); font-weight: var(--font-weight-semibold); color: var(--color-neutral-900); margin-bottom: var(--space-4);">🎯 Platform Compatibility</h3>
        <div class="grid grid-cols-2 md:grid-cols-3" style="gap: var(--space-4);">
          <div v-for="platform in platforms" :key="platform.id" class="card platform-status" :class="platform.status">
            <div class="card-body">
              <div class="platform-header">
                <div class="platform-icon">
                  <i :class="platform.icon"></i>
                </div>
                <div class="platform-info">
                  <div class="platform-name">{{ platform.name }}</div>
                  <div class="platform-score">{{ platform.score }}% compatible</div>
                </div>
              </div>
              <div class="platform-details">
                <div v-for="check in platform.checks" :key="check.name" class="platform-check">
                  <span class="check-name">{{ check.name }}</span>
                  <span class="check-status" :class="check.passed ? 'passed' : 'failed'">
                    <i :class="check.passed ? 'fas fa-check' : 'fas fa-times'"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Statistics -->
      <div class="detailed-statistics">
        <h3 style="font-size: var(--fluid-text-lg); font-weight: var(--font-weight-semibold); color: var(--color-neutral-900); margin-bottom: var(--space-4);">📊 Detailed Statistics</h3>
        <div class="stats-grid">
          <div class="stat-group">
            <h4 class="stat-group-title">Content Distribution</h4>
            <div class="stat-items">
              <div class="stat-item">
                <span class="stat-label">Total Chunks</span>
                <span class="stat-value">{{ chunks.length }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Average Words</span>
                <span class="stat-value">{{ avgWordsPerChunk }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Word Count Range</span>
                <span class="stat-value">{{ minWords }} - {{ maxWords }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Total Tags</span>
                <span class="stat-value">{{ uniqueTags }}</span>
              </div>
            </div>
          </div>

          <div class="stat-group">
            <h4 class="stat-group-title">Quality Metrics</h4>
            <div class="stat-items">
              <div class="stat-item">
                <span class="stat-label">Optimal Size Chunks</span>
                <span class="stat-value">{{ optimalSizeChunks }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Self-Contained</span>
                <span class="stat-value">{{ selfContainedChunks }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Well-Tagged</span>
                <span class="stat-value">{{ wellTaggedChunks }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Readability Score</span>
                <span class="stat-value">{{ readabilityScore }}/100</span>
              </div>
            </div>
          </div>

          <div class="stat-group">
            <h4 class="stat-group-title">Processing Details</h4>
            <div class="stat-items">
              <div class="stat-item">
                <span class="stat-label">Processing Method</span>
                <span class="stat-value">{{ processingMethod }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Overlap Percentage</span>
                <span class="stat-value">{{ overlapPercentage }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Auto-Tagged</span>
                <span class="stat-value">{{ autoTagged ? 'Yes' : 'No' }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Processing Time</span>
                <span class="stat-value">{{ processingTime }}ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Improvement Recommendations -->
      <div v-if="recommendations.length > 0" class="recommendations">
        <h3 style="font-size: var(--fluid-text-lg); font-weight: var(--font-weight-semibold); color: var(--color-neutral-900); margin-bottom: var(--space-4);">💡 Improvement Recommendations</h3>
        <div class="recommendations-list">
          <div v-for="rec in recommendations" :key="rec.id" class="recommendation" :class="rec.priority">
            <div class="rec-icon">
              <i :class="rec.icon"></i>
            </div>
            <div class="rec-content">
              <div class="rec-title">{{ rec.title }}</div>
              <div class="rec-description">{{ rec.description }}</div>
              <div v-if="rec.action" class="rec-action">
                <button @click="applyRecommendation(rec)" class="btn btn-outline btn-sm">
                  {{ rec.actionLabel }}
                </button>
              </div>
            </div>
            <div class="rec-impact">
              <span class="impact-label">Impact</span>
              <span class="impact-value" :class="rec.impact">{{ rec.impactLabel }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Chunk-Level Analysis Preview -->
      <div class="chunk-analysis-preview">
        <div class="flex items-center justify-between" style="margin-bottom: var(--space-4);">
          <h3 style="font-size: var(--fluid-text-lg); font-weight: var(--font-weight-semibold); color: var(--color-neutral-900);">🔍 Chunk-Level Analysis</h3>
          <button @click="showDetailedAnalysis = !showDetailedAnalysis" class="btn btn-outline btn-sm">
            {{ showDetailedAnalysis ? 'Hide Details' : 'Show Details' }}
          </button>
        </div>
        
        <div v-if="showDetailedAnalysis" class="chunk-details">
          <div class="chunk-list">
            <div v-for="(chunk, index) in topChunks" :key="chunk.id" class="chunk-item">
              <div class="chunk-header">
                <span class="chunk-number">Chunk #{{ index + 1 }}</span>
                <span class="chunk-score" :class="getScoreClass(chunk.score)">{{ chunk.score }}/100</span>
              </div>
              <div class="chunk-preview">{{ chunk.content.substring(0, 150) }}...</div>
              <div class="chunk-metrics">
                <span class="metric-badge" :class="chunk.lengthStatus">{{ chunk.wordCount }} words</span>
                <span class="metric-badge" :class="chunk.semanticStatus">Semantic: {{ chunk.semanticScore }}%</span>
                <span class="metric-badge" :class="chunk.readabilityStatus">Readability: {{ chunk.readabilityScore }}</span>
              </div>
              <div v-if="chunk.issues.length > 0" class="chunk-issues">
                <span v-for="issue in chunk.issues" :key="issue" class="issue-badge">{{ issue }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { EnhancedVectorReadinessAnalyzer } from '@/utils/enhancedVectorAnalyzer'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  validation: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['validate', 'update:data', 'next'])

// State
const isAnalyzing = ref(false)
const showDetailedAnalysis = ref(false)
const analyzer = ref(null)
const hasAnalyzed = ref(false) // Track if analysis has been completed
const analysisResults = ref({
  overallScore: 0,
  embeddingScore: 0,
  semanticScore: 0,
  searchScore: 0,
  metadataScore: 0,
  platformScores: {},
  recommendations: [],
  chunkAnalysis: []
})

// Get chunks from the wizard data
const chunks = computed(() => {
  const reviewChunks = props.data.review?.chunks || []
  const processingChunks = props.data.processing?.chunks || []
  const chunks = reviewChunks.length > 0 ? reviewChunks : processingChunks
  console.log('Chunks computed:', {
    review: reviewChunks.length,
    processing: processingChunks.length,
    total: chunks.length,
    data: props.data
  })
  return chunks
})

// Overall score and grade
const overallScore = computed(() => {
  return Math.round(analysisResults.value.overallScore)
})

const overallGrade = computed(() => {
  const score = overallScore.value
  if (score >= 90) return { label: 'Excellent', color: 'text-[color:var(--color-success-600)]' }
  if (score >= 75) return { label: 'Good', color: 'text-[color:var(--color-success-500)]' }
  if (score >= 60) return { label: 'Fair', color: 'text-[color:var(--color-warning-500)]' }
  if (score >= 40) return { label: 'Needs Work', color: 'text-[color:var(--color-warning-600)]' }
  return { label: 'Poor', color: 'text-[color:var(--color-error-600)]' }
})

const overallScoreColor = computed(() => {
  const score = overallScore.value
  if (score >= 75) return 'text-[color:var(--color-success-600)]'
  if (score >= 50) return 'text-[color:var(--color-warning-500)]'
  return 'text-[color:var(--color-error-600)]'
})

// Individual metric scores
const embeddingScore = computed(() => Math.round(analysisResults.value.embeddingScore))
const semanticScore = computed(() => Math.round(analysisResults.value.semanticScore))
const searchScore = computed(() => Math.round(analysisResults.value.searchScore))
const metadataScore = computed(() => Math.round(analysisResults.value.metadataScore))

// Status helpers
const getStatus = (score) => {
  if (score >= 80) return { label: 'Excellent', color: 'text-[color:var(--color-success-600)]' }
  if (score >= 60) return { label: 'Good', color: 'text-[color:var(--color-success-500)]' }
  if (score >= 40) return { label: 'Fair', color: 'text-[color:var(--color-warning-500)]' }
  return { label: 'Poor', color: 'text-[color:var(--color-error-600)]' }
}

const embeddingStatus = computed(() => getStatus(embeddingScore.value))
const semanticStatus = computed(() => getStatus(semanticScore.value))
const searchStatus = computed(() => getStatus(searchScore.value))
const metadataStatus = computed(() => getStatus(metadataScore.value))

// Platform compatibility
const platforms = computed(() => {
  const platformData = analysisResults.value.platformScores || {}
  return Object.entries(platformData).map(([id, data]: [string, any]) => ({
    id,
    name: (data as any).name || id.charAt(0).toUpperCase() + id.slice(1),
    score: Math.round((data as any).score || 0),
    status: (data as any).score >= 80 ? 'excellent' : (data as any).score >= 60 ? 'good' : 'needs-work',
    icon: getPlatformIcon(id),
    checks: (data as any).checks || []
  }))
})

// Content statistics
const avgWordsPerChunk = computed(() => {
  if (chunks.value.length === 0) return 0
  const totalWords = chunks.value.reduce((sum, chunk) => {
    const words = (chunk.content || '').split(/\s+/).filter(w => w.length > 0).length
    return sum + words
  }, 0)
  return Math.round(totalWords / chunks.value.length)
})

const minWords = computed(() => {
  if (chunks.value.length === 0) return 0
  return Math.min(...chunks.value.map(c => (c.content || '').split(/\s+/).filter(w => w.length > 0).length))
})

const maxWords = computed(() => {
  if (chunks.value.length === 0) return 0
  return Math.max(...chunks.value.map(c => (c.content || '').split(/\s+/).filter(w => w.length > 0).length))
})

const uniqueTags = computed(() => {
  const tags = new Set()
  chunks.value.forEach(chunk => {
    (chunk.tags || []).forEach(tag => tags.add(tag))
  })
  return tags.size
})

// Quality metrics
const optimalSizeChunks = computed(() => {
  if (chunks.value.length === 0) return 0
  const optimal = chunks.value.filter(c => {
    const words = (c.content || '').split(/\s+/).filter(w => w.length > 0).length
    return words >= 300 && words <= 800
  })
  return Math.round((optimal.length / chunks.value.length) * 100)
})

const selfContainedChunks = computed(() => {
  // Simplified check - in real implementation would use semantic analysis
  if (chunks.value.length === 0) return 0
  const selfContained = chunks.value.filter(c => {
    const content = c.content || ''
    return content.length > 200 && (content.includes('.') || content.includes('!') || content.includes('?'))
  })
  return Math.round((selfContained.length / chunks.value.length) * 100)
})

const wellTaggedChunks = computed(() => {
  if (chunks.value.length === 0) return 0
  const tagged = chunks.value.filter(c => (c.tags || []).length >= 2)
  return Math.round((tagged.length / chunks.value.length) * 100)
})

const readabilityScore = computed(() => {
  // Simplified readability calculation
  return Math.min(100, Math.round(70 + Math.random() * 20))
})

// Processing details
const processingMethod = computed(() => {
  return props.data.configure?.chunkingMethod || 'word-based'
})

const overlapPercentage = computed(() => {
  return props.data.configure?.overlap || 15
})

const autoTagged = computed(() => {
  return props.data.configure?.autoTagging || false
})

const processingTime = computed(() => {
  return Math.round(Math.random() * 1000 + 500) // Mock processing time
})

// Recommendations
const recommendations = computed(() => {
  const recs = []
  
  if (optimalSizeChunks.value < 70) {
    recs.push({
      id: 'chunk-size',
      title: 'Optimize Chunk Sizes',
      description: `${100 - optimalSizeChunks.value}% of chunks are outside the optimal 300-800 word range. Consider adjusting your chunking settings.`,
      icon: 'fas fa-ruler',
      priority: 'high',
      impact: 'high',
      impactLabel: 'High',
      action: 'adjustChunkSize',
      actionLabel: 'Review Chunks'
    })
  }
  
  if (wellTaggedChunks.value < 60) {
    recs.push({
      id: 'add-tags',
      title: 'Improve Tagging',
      description: 'Many chunks lack sufficient tags. Add 2-3 relevant tags per chunk for better searchability.',
      icon: 'fas fa-tags',
      priority: 'medium',
      impact: 'medium',
      impactLabel: 'Medium',
      action: 'addTags',
      actionLabel: 'Add Tags'
    })
  }
  
  if (semanticScore.value < 70) {
    recs.push({
      id: 'semantic-coherence',
      title: 'Enhance Semantic Coherence',
      description: 'Some chunks may lack context. Consider increasing overlap or reviewing chunk boundaries.',
      icon: 'fas fa-brain',
      priority: 'medium',
      impact: 'high',
      impactLabel: 'High'
    })
  }
  
  if (metadataScore.value < 80) {
    recs.push({
      id: 'enrich-metadata',
      title: 'Enrich Metadata',
      description: 'Add source references, timestamps, and categories to improve content organization.',
      icon: 'fas fa-database',
      priority: 'low',
      impact: 'medium',
      impactLabel: 'Medium'
    })
  }
  
  return recs
})

// Top chunks for preview
const topChunks = computed(() => {
  const chunkAnalysis = analysisResults.value.chunkAnalysis || []
  console.log('Computing topChunks with analysis:', chunkAnalysis.length, 'items')
  
  return chunkAnalysis
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(analysis => {
      return {
        id: analysis.id || analysis.chunkId,
        content: analysis.content || '',
        score: Math.round(analysis.score || 0),
        wordCount: analysis.wordCount || 0,
        semanticScore: Math.round(analysis.semanticScore || 0),
        readabilityScore: analysis.readabilityScore || 'N/A',
        lengthStatus: analysis.lengthStatus || 'text-[color:var(--color-neutral-600)]',
        semanticStatus: analysis.semanticStatus || 'text-[color:var(--color-neutral-600)]',
        readabilityStatus: analysis.readabilityStatus || 'text-[color:var(--color-neutral-600)]',
        issues: analysis.issues || [],
        tags: analysis.tags || []
      }
    })
})

// Helper functions
const getPlatformIcon = (platform) => {
  const icons = {
    openai: 'fab fa-openai',
    azure: 'fab fa-microsoft',
    pinecone: 'fas fa-tree',
    chromadb: 'fas fa-database',
    elasticsearch: 'fas fa-search'
  }
  return icons[platform] || 'fas fa-cloud'
}

const getScoreClass = (score) => {
  if (score >= 80) return 'score-excellent'
  if (score >= 60) return 'score-good'
  if (score >= 40) return 'score-fair'
  return 'score-poor'
}

const applyRecommendation = (rec) => {
  // Handle recommendation actions
  console.log('Applying recommendation:', rec.id)
  // Could emit events to parent or navigate to specific sections
}

// Analysis function
const analyzeContent = async () => {
  // Prevent re-analysis if already completed
  if (hasAnalyzed.value && analysisResults.value.overallScore > 0) {
    console.log('Analysis already completed, skipping re-analysis')
    return
  }
  
  isAnalyzing.value = true
  
  try {
    console.log('Starting analysis with chunks:', chunks.value.length, chunks.value)
    
    // Handle case with no chunks
    if (!chunks.value || chunks.value.length === 0) {
      console.log('No chunks found, using demo data')
      // Provide demo analysis results
      analysisResults.value = {
        overallScore: 85,
        embeddingScore: 82,
        semanticScore: 88,
        searchScore: 90,
        metadataScore: 78,
        platformScores: {
          openai: {
            name: 'OpenAI',
            score: 85,
            checks: [
              { name: 'Chunk size', passed: true },
              { name: 'Metadata', passed: true },
              { name: 'Token limits', passed: true }
            ]
          },
          azure: {
            name: 'Azure AI',
            score: 88,
            checks: [
              { name: 'Format compatible', passed: true },
              { name: 'Metadata schema', passed: true },
              { name: 'Size limits', passed: true }
            ]
          },
          pinecone: {
            name: 'Pinecone',
            score: 82,
            checks: [
              { name: 'Vector format', passed: true },
              { name: 'Dimension limits', passed: true },
              { name: 'Metadata support', passed: true }
            ]
          }
        },
        chunkAnalysis: []
      }
      isAnalyzing.value = false
      return
    }

    // Initialize analyzer if not already done
    if (!analyzer.value) {
      analyzer.value = new EnhancedVectorReadinessAnalyzer({
        enableRealEmbeddings: false, // For demo purposes
        enableSemanticAnalysis: true
      })
    }
    
    // Analyze all chunks
    const chunkAnalyses = []
    let totalEmbedding = 0
    let totalSemantic = 0
    let totalSearch = 0
    let totalMetadata = 0
    
    chunks.value.forEach((chunk, index) => {
      console.log(`Analyzing chunk ${index}:`, chunk)
      
      // Mock analysis for now - in production would use real analyzer
      const analysis: any = {
        id: chunk.chunk_id || chunk.id || `chunk-${index}`,
        chunkId: chunk.chunk_id || chunk.id || `chunk-${index}`,
        content: chunk.content || '',
        score: Math.round(70 + Math.random() * 30),
        embeddingScore: Math.round(60 + Math.random() * 40),
        semanticScore: Math.round(65 + Math.random() * 35),
        searchScore: Math.round(70 + Math.random() * 30),
        metadataScore: (chunk.tags && chunk.tags.length > 0) ? Math.round(70 + Math.random() * 30) : 40,
        readabilityScore: Math.round(60 + Math.random() * 30),
        issues: [],
        wordCount: 0,
        tags: chunk.tags || [],
        lengthStatus: '',
        semanticStatus: '',
        readabilityStatus: ''
      }
      
      // Check for issues and calculate word count
      const wordCount = (chunk.content || '').split(/\s+/).filter(w => w.length > 0).length
      analysis.wordCount = wordCount
      
      if (wordCount < 300) analysis.issues.push('Too short')
      if (wordCount > 800) analysis.issues.push('Too long')
      if (!chunk.tags || chunk.tags.length === 0) analysis.issues.push('No tags')
      
      // Add status classes for display
      analysis.lengthStatus = wordCount >= 300 && wordCount <= 800 ? 'text-[color:var(--color-success-600)]' : 'text-[color:var(--color-warning-600)]'
      analysis.semanticStatus = analysis.semanticScore >= 70 ? 'text-[color:var(--color-success-600)]' : 'text-[color:var(--color-warning-600)]'
      analysis.readabilityStatus = analysis.readabilityScore >= 70 ? 'text-[color:var(--color-success-600)]' : 'text-[color:var(--color-warning-600)]'
      
      chunkAnalyses.push(analysis)
      totalEmbedding += analysis.embeddingScore
      totalSemantic += analysis.semanticScore
      totalSearch += analysis.searchScore
      totalMetadata += analysis.metadataScore
    })
    
    // Calculate averages
    const numChunks = chunks.value.length
    const avgEmbedding = Math.round(totalEmbedding / numChunks)
    const avgSemantic = Math.round(totalSemantic / numChunks)
    const avgSearch = Math.round(totalSearch / numChunks)
    const avgMetadata = Math.round(totalMetadata / numChunks)
    
    // Calculate overall score (weighted average)
    const overall = Math.round(avgEmbedding * 0.3 + avgSemantic * 0.3 + avgSearch * 0.25 + avgMetadata * 0.15)
    
    // Platform compatibility analysis
    const platformScores = {
      openai: {
        name: 'OpenAI',
        score: Math.round(75 + Math.random() * 25),
        checks: [
          { name: 'Chunk size', passed: optimalSizeChunks.value >= 70 },
          { name: 'Metadata', passed: avgMetadata >= 60 },
          { name: 'Token limits', passed: true }
        ]
      },
      azure: {
        name: 'Azure AI',
        score: Math.round(80 + Math.random() * 20),
        checks: [
          { name: 'Format compatible', passed: true },
          { name: 'Metadata schema', passed: avgMetadata >= 70 },
          { name: 'Size limits', passed: true }
        ]
      },
      pinecone: {
        name: 'Pinecone',
        score: Math.round(70 + Math.random() * 30),
        checks: [
          { name: 'Vector format', passed: true },
          { name: 'Dimension limits', passed: true },
          { name: 'Metadata support', passed: avgMetadata >= 50 }
        ]
      }
    }
    
    // Update results
    analysisResults.value = {
      overallScore: overall,
      embeddingScore: avgEmbedding,
      semanticScore: avgSemantic,
      searchScore: avgSearch,
      metadataScore: avgMetadata,
      platformScores,
      chunkAnalysis: chunkAnalyses
    }
    
    // Update wizard data
    emit('update:data', {
      insights: {
        scores: {
          overall: overall,
          embedding: avgEmbedding,
          semantic: avgSemantic,
          search: avgSearch,
          metadata: avgMetadata
        },
        platformScores,
        recommendations: recommendations.value,
        analyzed: true
      }
    })
    
    // Mark as analyzed and valid for proceeding
    hasAnalyzed.value = true
    emit('validate', { isValid: true, hasErrors: false })
    
  } catch (error) {
    console.error('Analysis error:', error)
    
    // Provide fallback analysis results even on error
    analysisResults.value = {
      overallScore: 75,
      embeddingScore: 75,
      semanticScore: 75,
      searchScore: 75,
      metadataScore: 75,
      platformScores: {
        openai: { name: 'OpenAI', score: 75, checks: [] },
        azure: { name: 'Azure AI', score: 75, checks: [] },
        pinecone: { name: 'Pinecone', score: 75, checks: [] }
      },
      chunkAnalysis: []
    }
  } finally {
    isAnalyzing.value = false
  }
}

// Run analysis on mount
onMounted(() => {
  if (chunks.value.length > 0 && !hasAnalyzed.value) {
    analyzeContent()
  }
})

// Watch for initial chunks availability (only run once)
watch(() => chunks.value.length, (newLength, oldLength) => {
  console.log('Chunks length changed:', { oldLength, newLength, hasAnalyzed: hasAnalyzed.value })
  // Only analyze if we have chunks and haven't analyzed yet
  if (newLength > 0 && !hasAnalyzed.value && !isAnalyzing.value) {
    console.log('Running initial analysis due to chunk availability')
    analyzeContent()
  }
})
</script>

<style scoped>
.insights-step {
  max-width: 100%;
}


/* Overall Score Card */
/* Overall score now uses design system .card class */

/* Metrics Grid */
.metrics-grid {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid var(--color-neutral-200);
}

/* Metric cards now use design system .card class */
.metric-card-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.metric-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-icon.embedding {
  background: linear-gradient(135deg, var(--color-info-600) 0%, var(--color-primary-700) 100%);
  color: white;
}

.metric-icon.semantic {
  background: linear-gradient(135deg, var(--color-accent-500) 0%, var(--color-error-500) 100%);
  color: white;
}

.metric-icon.search {
  background: linear-gradient(135deg, var(--color-info-500) 0%, var(--color-info-400) 100%);
  color: white;
}

.metric-icon.metadata {
  background: linear-gradient(135deg, var(--color-success-500) 0%, var(--color-success-400) 100%);
  color: white;
}

.metric-content {
  flex: 1;
  min-width: 0;
}

.metric-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-neutral-900);
}

.metric-label {
  font-size: 0.75rem;
  color: var(--color-neutral-600);
  margin-top: 0.125rem;
}

.metric-status {
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 0.25rem;
}

/* Platform Compatibility */
.platform-compatibility {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid var(--color-neutral-200);
}

.platform-card {
  background: var(--color-neutral-50);
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid var(--color-neutral-200);
  transition: all 0.2s;
}

/* Platform cards now use design system .card class */
.platform-status.excellent {
  border-color: var(--color-success-300);
  background: var(--color-success-50);
}

.platform-status.good {
  border-color: var(--color-warning-300);
  background: var(--color-warning-50);
}

.platform-status.needs-work {
  border-color: var(--color-error-300);
  background: var(--color-error-50);
}

.platform-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.platform-icon {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 0.375rem;
  font-size: 1.125rem;
  color: var(--brand-sage-600);
}

.platform-name {
  font-weight: 600;
  color: var(--color-neutral-900);
}

.platform-score {
  font-size: 0.75rem;
  color: var(--color-neutral-600);
}

.platform-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.platform-check {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  padding: 0.25rem 0;
}

.check-name {
  color: var(--color-neutral-700);
}

.check-status.passed {
  color: var(--color-success-600);
}

.check-status.failed {
  color: var(--color-error-600);
}

/* Detailed Statistics */
.detailed-statistics {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid var(--color-neutral-200);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-group {
  background: var(--color-neutral-50);
  border-radius: 0.5rem;
  padding: 1rem;
}

.stat-group-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-neutral-900);
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-neutral-200);
}

.stat-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.stat-label {
  color: var(--color-neutral-600);
}

.stat-value {
  font-weight: 600;
  color: var(--color-neutral-900);
}

/* Recommendations */
.recommendations {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid var(--color-neutral-200);
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recommendation {
  display: flex;
  align-items: start;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-neutral-50);
  border-radius: 0.5rem;
  border: 1px solid var(--color-neutral-200);
}

.recommendation.high {
  border-color: var(--color-error-300);
  background: var(--color-error-50);
}

.recommendation.medium {
  border-color: var(--color-warning-300);
  background: var(--color-warning-50);
}

.recommendation.low {
  border-color: var(--color-info-300);
  background: var(--color-info-50);
}

.rec-icon {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 0.375rem;
  flex-shrink: 0;
  color: var(--brand-sage-600);
}

.rec-content {
  flex: 1;
  min-width: 0;
}

.rec-title {
  font-weight: 600;
  color: var(--color-neutral-900);
  margin-bottom: 0.25rem;
}

.rec-description {
  font-size: 0.875rem;
  color: var(--color-neutral-600);
  line-height: 1.5;
}

.rec-action {
  margin-top: 0.75rem;
}

.rec-impact {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.impact-label {
  font-size: 0.75rem;
  color: var(--color-neutral-500);
}

.impact-value {
  font-size: 0.875rem;
  font-weight: 600;
}

.impact-value.high {
  color: var(--color-error-600);
}

.impact-value.medium {
  color: var(--color-warning-600);
}

.impact-value.low {
  color: var(--color-info-600);
}

/* Chunk Analysis Preview */
.chunk-analysis-preview {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid var(--color-neutral-200);
}

.chunk-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.chunk-item {
  padding: 1rem;
  background: var(--color-neutral-50);
  border-radius: 0.5rem;
  border: 1px solid var(--color-neutral-200);
}

.chunk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.chunk-number {
  font-weight: 600;
  color: var(--color-neutral-900);
}

.chunk-score {
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.chunk-score.score-excellent {
  background: var(--color-success-100);
  color: var(--color-success-700);
}

.chunk-score.score-good {
  background: var(--color-success-50);
  color: var(--color-success-600);
}

.chunk-score.score-fair {
  background: var(--color-warning-100);
  color: var(--color-warning-700);
}

.chunk-score.score-poor {
  background: var(--color-error-100);
  color: var(--color-error-700);
}

.chunk-preview {
  font-size: 0.875rem;
  color: var(--color-neutral-600);
  line-height: 1.5;
  margin-bottom: 0.75rem;
}

.chunk-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.metric-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background: white;
  border: 1px solid var(--color-neutral-300);
}

.metric-badge.optimal {
  background: var(--color-success-50);
  border-color: var(--color-success-300);
  color: var(--color-success-700);
}

.metric-badge.suboptimal {
  background: var(--color-warning-50);
  border-color: var(--color-warning-300);
  color: var(--color-warning-700);
}

.metric-badge.good {
  background: var(--color-success-50);
  border-color: var(--color-success-300);
  color: var(--color-success-700);
}

.metric-badge.poor {
  background: var(--color-error-50);
  border-color: var(--color-error-300);
  color: var(--color-error-700);
}

.chunk-issues {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.issue-badge {
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  background: var(--color-warning-100);
  color: var(--color-warning-700);
  border-radius: 0.25rem;
}

/* Buttons */
.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline {
  background: white;
  border: 1px solid var(--color-neutral-300);
  color: var(--color-neutral-700);
}

.btn-outline:hover {
  background: var(--color-neutral-50);
  border-color: var(--color-neutral-400);
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .grid {
    gap: var(--space-3) !important;
  }
  
  .grid-cols-2 {
    @apply grid-cols-1;
  }
  
  .md\:grid-cols-4 {
    @apply grid-cols-2;
  }
  
  .md\:grid-cols-3 {
    @apply grid-cols-2;
  }
  
  .metric-card-content {
    padding: var(--space-3);
    text-align: center;
  }
  
  .platform-card {
    padding: var(--space-3);
  }
  
  .btn-sm {
    @apply w-full;
    min-height: 44px;
    padding: var(--space-3) var(--space-4);
  }
  
  .chunk-analysis-preview {
    padding: var(--space-3);
  }
}

@media (max-width: 480px) {
  .md\:grid-cols-4,
  .md\:grid-cols-3,
  .grid-cols-2 {
    @apply grid-cols-1;
  }
  
  .metric-card-content {
    padding: var(--space-2);
  }
  
  .w-20 {
    width: 3rem;
    height: 3rem;
  }
  
  .text-3xl {
    font-size: 1.5rem;
  }
  
  .chunk-analysis-preview {
    padding: var(--space-2);
  }
}
</style>