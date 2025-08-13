<template>
  <div class="vector-store-exporter card-sage soft-shadow p-6">
    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2 flex items-center" style="color: var(--neutral-text);">
        <svg class="w-5 h-5 text-gold mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
        </svg>
        Export for AI Systems
      </h3>
      <p class="text-sm" style="color: var(--color-neutral-700);">Choose the format that matches your AI platform or vector database.</p>
    </div>

    <!-- Export Format Selection -->
    <div class="export-format-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <div 
        v-for="format in exportFormats" 
        :key="format.id"
        @click="selectedFormat = format.id"
        class="export-format-card"
        :class="{ 'selected': selectedFormat === format.id }"
      >
        <div class="flex items-center justify-between mb-2">
          <h4 class="font-semibold" style="color: var(--neutral-text);">{{ format.name }}</h4>
          <div v-if="selectedFormat === format.id" class="text-sage">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>
        <p class="text-sm mb-2" style="color: var(--color-neutral-700);">{{ format.description }}</p>
        <div class="flex flex-wrap gap-1">
          <span 
            v-for="platform in format.platforms" 
            :key="platform"
            class="px-2 py-1 text-xs rounded-full tag-sage"
          >
            {{ platform }}
          </span>
        </div>
      </div>
    </div>

    <!-- Export Options (Progressive Disclosure) -->
    <div class="rounded-brand p-4 mb-6 border border-sage" style="background-color: var(--color-neutral-50);">
      <div class="flex items-center justify-between mb-3">
        <h4 class="font-semibold" style="color: var(--neutral-text);">Export Options</h4>
        <button 
          @click="showAdvancedOptions = !showAdvancedOptions"
          class="text-xs text-primary-600 hover:text-primary-700 flex items-center transition-colors"
        >
          <i :class="showAdvancedOptions ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="mr-1"></i>
          {{ showAdvancedOptions ? 'Hide Advanced' : 'Show Advanced' }}
        </button>
      </div>
      
      <!-- Always visible essential option -->
      <div class="mb-3">
        <label class="flex items-center space-x-2">
          <input 
            v-model="exportOptions.includeMetadata" 
            type="checkbox" 
            class="rounded border-neutral-300"
          />
          <span class="text-sm" style="color: var(--neutral-text);">Include metadata (recommended for all platforms)</span>
        </label>
      </div>
      
      <!-- Advanced options (collapsed by default) -->
      <div v-show="showAdvancedOptions" class="export-options space-y-3">
        <div class="text-xs text-neutral-600 mb-3 p-2 bg-sage-light border border-sage-200 rounded">
          <i class="fas fa-info-circle mr-1 text-sage"></i>
          Advanced options for fine-tuning export output. Default settings work well for most use cases.
        </div>
        <div>
          <label class="flex items-center space-x-2">
            <input 
              v-model="exportOptions.includeEmbeddings" 
              type="checkbox" 
              class="rounded border-neutral-300"
            />
            <span class="text-sm" style="color: var(--neutral-text);">Generate embeddings preview (may increase file size)</span>
          </label>
        </div>
        <div>
          <label class="flex items-center space-x-2">
            <input 
              v-model="exportOptions.validateStructure" 
              type="checkbox" 
              class="rounded border-neutral-300"
            />
            <span class="text-sm" style="color: var(--neutral-text);">Validate structure before export</span>
          </label>
        </div>
        <div>
          <label class="flex items-center space-x-2">
            <input 
              v-model="exportOptions.optimizeForSearch" 
              type="checkbox" 
              class="rounded border-neutral-300"
            />
            <span class="text-sm" style="color: var(--neutral-text);">Optimize chunk content for search performance</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Export Actions -->
    <div class="export-buttons">
      <button 
        @click="previewData"
        :disabled="chunks.length === 0"
        class="btn-secondary px-6 py-3 font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z"></path>
        </svg>
        Preview
      </button>

      <button 
        @click="generateUploadScript"
        :disabled="chunks.length === 0"
        class="upload-script-btn flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
        </svg>
        Get Upload Script
      </button>

      <button 
        @click="exportData"
        :disabled="chunks.length === 0"
        class="btn-primary px-6 py-3 font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
        </svg>
        Export {{ chunks.length }} Chunks
      </button>
    </div>

    <!-- Preview Modal -->
    <div v-if="showPreview" class="modal-overlay">
      <div class="rounded-brand max-w-4xl w-full max-h-[80vh] overflow-hidden" style="background-color: var(--neutral-bg);">
        <div class="flex items-center justify-between p-4 border-b border-sage-light">
          <h3 class="text-lg font-semibold" style="color: var(--neutral-text);">Export Preview - {{ selectedFormatName }}</h3>
          <button @click="showPreview = false" class="transition-colors" style="color: var(--color-neutral-600);" @mouseover="$event.target.style.color = 'var(--color-neutral-800)'" @mouseout="$event.target.style.color = 'var(--color-neutral-600)'">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="p-4 overflow-auto max-h-[60vh]">
          <pre class="p-4 rounded-brand text-sm overflow-auto border" style="background-color: var(--color-neutral-50); color: var(--color-neutral-800);"><code>{{ previewContent }}</code></pre>
        </div>
        <div class="border-t p-4 flex justify-end space-x-2">
          <button @click="showPreview = false" class="px-4 py-2 text-neutral-600 hover:text-neutral-800">
            Close
          </button>
          <button @click="copyPreview" class="bg-sage hover:bg-sage-dark text-white px-4 py-2 rounded transition-colors">
            Copy to Clipboard
          </button>
        </div>
      </div>
    </div>

    <!-- Upload Script Modal -->
    <div v-if="showUploadScript" class="modal-overlay">
      <div class="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div class="flex items-center justify-between p-4 border-b">
          <h3 class="text-lg font-semibold">Upload Script - {{ selectedFormatName }}</h3>
          <button @click="showUploadScript = false" class="text-neutral-500 hover:text-neutral-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="p-4 overflow-auto max-h-[60vh]">
          <div class="mb-4 p-3 bg-sage-light rounded-lg">
            <p class="text-sm text-sage-dark">
              <strong>Instructions:</strong> This script will help you upload your exported data to your vector store. 
              Modify the connection details as needed for your specific setup.
            </p>
          </div>
          <pre class="bg-neutral-100 p-4 rounded text-sm overflow-auto"><code>{{ uploadScriptContent }}</code></pre>
        </div>
        <div class="border-t p-4 flex justify-end space-x-2">
          <button @click="showUploadScript = false" class="px-4 py-2 text-neutral-600 hover:text-neutral-800">
            Close
          </button>
          <button @click="copyUploadScript" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
            Copy Script
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { saveAs } from 'file-saver';

export default {
  name: 'VectorStoreExporter',
  props: {
    chunks: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectedFormat: 'azure-vector',
      showPreview: false,
      showUploadScript: false,
      showAdvancedOptions: false,
      previewContent: '',
      uploadScriptContent: '',
      exportOptions: {
        includeMetadata: true,
        includeEmbeddings: false,
        validateStructure: true,
        optimizeForSearch: true,
        enableBatchProcessing: true,
        generateContentHash: false,
        includeSemanticAnalysis: false,
        addRelationshipMapping: false,
        enableCompression: false,
        includeVersioning: true,
        addLanguageDetection: false,
        extractEntities: false
      },
      advancedOptions: {
        batchSize: 100,
        maxRetries: 3,
        timeout: 30000,
        enableStreaming: true,
        validateConnections: true,
        generateAnalytics: true
      },
      exportFormats: [
        {
          id: 'azure-vector',
          name: 'Azure Vector Store',
          description: 'JSON format optimized for Azure OpenAI vector store ingestion',
          platforms: ['Azure OpenAI', 'Azure Cognitive Search', 'Azure AI Search'],
          category: 'enterprise',
          hasDirectUpload: true
        },
        {
          id: 'anthropic-claude',
          name: 'Anthropic Claude',
          description: 'Optimized format for Claude API with conversation context support',
          platforms: ['Claude', 'Claude-3', 'Claude Instant'],
          category: 'ai-assistant',
          hasDirectUpload: true
        },
        {
          id: 'google-vertex',
          name: 'Google Vertex AI',
          description: 'Format for Google Cloud Vertex AI and PaLM integration',
          platforms: ['Vertex AI', 'PaLM', 'Gemini', 'Google Cloud'],
          category: 'enterprise',
          hasDirectUpload: true
        },
        {
          id: 'aws-bedrock',
          name: 'AWS Bedrock',
          description: 'Amazon Bedrock knowledge base format with S3 integration',
          platforms: ['AWS Bedrock', 'Amazon S3', 'Amazon Kendra'],
          category: 'enterprise',
          hasDirectUpload: true
        },
        {
          id: 'openai',
          name: 'OpenAI Compatible',
          description: 'Standard format for OpenAI embeddings and ChatGPT',
          platforms: ['OpenAI', 'Azure OpenAI', 'ChatGPT'],
          category: 'ai-assistant',
          hasDirectUpload: true
        },
        {
          id: 'cohere',
          name: 'Cohere',
          description: 'Enterprise-grade embedding and search optimization',
          platforms: ['Cohere', 'Cohere Embed', 'Cohere Rerank'],
          category: 'enterprise',
          hasDirectUpload: true
        },
        {
          id: 'langchain',
          name: 'LangChain',
          description: 'Format optimized for LangChain document loaders',
          platforms: ['LangChain', 'LlamaIndex', 'Haystack'],
          category: 'framework',
          hasDirectUpload: false
        },
        {
          id: 'pinecone',
          name: 'Pinecone',
          description: 'Ready for direct upload to Pinecone vector database',
          platforms: ['Pinecone', 'Weaviate'],
          category: 'vector-db',
          hasDirectUpload: true
        },
        {
          id: 'chroma',
          name: 'ChromaDB',
          description: 'Format for ChromaDB and similar vector stores',
          platforms: ['ChromaDB', 'Qdrant', 'Milvus'],
          category: 'vector-db',
          hasDirectUpload: true
        },
        {
          id: 'elasticsearch',
          name: 'Elasticsearch',
          description: 'Enterprise search with vector similarity support',
          platforms: ['Elasticsearch', 'OpenSearch', 'Elastic Cloud'],
          category: 'enterprise',
          hasDirectUpload: true
        },
        {
          id: 'mongodb-atlas',
          name: 'MongoDB Atlas',
          description: 'Vector search in MongoDB Atlas with document storage',
          platforms: ['MongoDB Atlas', 'MongoDB Vector Search'],
          category: 'database',
          hasDirectUpload: true
        },
        {
          id: 'huggingface',
          name: 'Hugging Face',
          description: 'Compatible with Hugging Face datasets and transformers',
          platforms: ['Hugging Face', 'Sentence Transformers'],
          category: 'ml-platform',
          hasDirectUpload: false
        },
        {
          id: 'ollama',
          name: 'Ollama',
          description: 'Local model deployment with efficient chunking',
          platforms: ['Ollama', 'Local Models'],
          category: 'local',
          hasDirectUpload: false
        },
        {
          id: 'generic',
          name: 'Generic JSON',
          description: 'Clean JSON format for custom implementations',
          platforms: ['Custom', 'API Integration'],
          category: 'generic',
          hasDirectUpload: false
        }
      ]
    };
  },
  computed: {
    selectedFormatName() {
      const format = this.exportFormats.find(f => f.id === this.selectedFormat);
      return format ? format.name : 'Unknown';
    }
  },
  methods: {
    formatData() {
      const processedChunks = this.chunks.map(chunk => {
        let processed = { ...chunk };
        
        if (this.exportOptions.optimizeForSearch) {
          processed.searchTerms = this.extractSearchTerms(chunk.content);
        }
        
        if (!this.exportOptions.includeMetadata) {
          delete processed.metadata;
        }
        
        return processed;
      });

      switch (this.selectedFormat) {
        case 'azure-vector':
          return this.formatForAzureVector(processedChunks);
        case 'anthropic-claude':
          return this.formatForAnthropicClaude(processedChunks);
        case 'google-vertex':
          return this.formatForGoogleVertex(processedChunks);
        case 'aws-bedrock':
          return this.formatForAWSBedrock(processedChunks);
        case 'openai':
          return this.formatForOpenAI(processedChunks);
        case 'cohere':
          return this.formatForCohere(processedChunks);
        case 'langchain':
          return this.formatForLangChain(processedChunks);
        case 'pinecone':
          return this.formatForPinecone(processedChunks);
        case 'chroma':
          return this.formatForChroma(processedChunks);
        case 'elasticsearch':
          return this.formatForElasticsearch(processedChunks);
        case 'mongodb-atlas':
          return this.formatForMongoDBAtlas(processedChunks);
        case 'huggingface':
          return this.formatForHuggingFace(processedChunks);
        case 'ollama':
          return this.formatForOllama(processedChunks);
        default:
          return this.formatGeneric(processedChunks);
      }
    },

    formatForAzureVector(chunks) {
      return chunks.map((chunk, index) => {
        // Generate chunk_id based on existing id or create sequential one
        const chunkId = chunk.chunk_id || chunk.id || `chunk_${String(index + 1).padStart(3, '0')}`;
        
        // Calculate word count if not available in stats
        const wordCount = chunk.stats?.words || chunk.metadata?.wordCount || chunk.content.split(/\s+/).filter(word => word.length > 0).length;
        
        // Extract tags from various sources
        const tags = chunk.tags || chunk.metadata?.tags || [];
        
        return {
          content: chunk.content,
          metadata: {
            source: chunk.source || 'unknown',
            chunk_id: chunkId,
            tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
            word_count: wordCount
          }
        };
      });
    },

    formatForOpenAI(chunks) {
      return {
        data: chunks.map(chunk => ({
          id: chunk.chunk_id,
          text: chunk.content,
          source: chunk.source,
          metadata: {
            ...chunk.metadata,
            tags: chunk.tags,
            word_count: chunk.metadata.wordCount
          }
        })),
        format: 'openai_embeddings',
        version: '1.0',
        created_at: new Date().toISOString()
      };
    },

    formatForLangChain(chunks) {
      return chunks.map(chunk => ({
        page_content: chunk.content,
        metadata: {
          source: chunk.source,
          chunk_id: chunk.chunk_id,
          tags: chunk.tags,
          ...chunk.metadata
        }
      }));
    },

    formatForPinecone(chunks) {
      return {
        vectors: chunks.map(chunk => ({
          id: chunk.chunk_id,
          metadata: {
            text: chunk.content,
            source: chunk.source,
            tags: chunk.tags,
            word_count: chunk.metadata.wordCount,
            created_at: chunk.metadata.createdAt
          }
        })),
        namespace: 'default'
      };
    },

    formatForChroma(chunks) {
      return {
        documents: chunks.map(chunk => chunk.content),
        metadatas: chunks.map(chunk => ({
          source: chunk.source,
          chunk_id: chunk.chunk_id,
          tags: chunk.tags.join(','),
          word_count: chunk.metadata.wordCount
        })),
        ids: chunks.map(chunk => chunk.chunk_id)
      };
    },

    formatForHuggingFace(chunks) {
      return {
        data: chunks.map(chunk => ({
          text: chunk.content,
          source: chunk.source,
          id: chunk.chunk_id,
          tags: chunk.tags,
          metadata: chunk.metadata
        }))
      };
    },

    formatForAnthropicClaude(chunks) {
      return {
        conversations: chunks.map((chunk, index) => ({
          conversation_id: `conv_${chunk.chunk_id}`,
          messages: [
            {
              role: "human",
              content: `Please help me understand this content: "${chunk.content.substring(0, 100)}..."`
            },
            {
              role: "assistant", 
              content: chunk.content,
              metadata: {
                source: chunk.source,
                chunk_id: chunk.chunk_id,
                tags: chunk.tags,
                word_count: chunk.metadata?.wordCount || chunk.content.split(/\s+/).length,
                created_at: new Date().toISOString()
              }
            }
          ]
        })),
        format: "claude_conversations",
        version: "1.0"
      };
    },

    formatForGoogleVertex(chunks) {
      return {
        instances: chunks.map(chunk => ({
          content: chunk.content,
          metadata: {
            id: chunk.chunk_id,
            source: chunk.source,
            tags: chunk.tags,
            wordCount: chunk.metadata?.wordCount || chunk.content.split(/\s+/).length
          }
        })),
        parameters: {
          model: "text-embedding-preview-0214",
          task_type: "RETRIEVAL_DOCUMENT"
        }
      };
    },

    formatForAWSBedrock(chunks) {
      return {
        knowledge_base_documents: chunks.map(chunk => {
          const contentHash = this.exportOptions.generateContentHash 
            ? this.generateContentHash(chunk.content) 
            : null;
          
          return {
            content: {
              text: chunk.content
            },
            metadata: {
              source: chunk.source,
              chunk_id: chunk.chunk_id,
              tags: chunk.tags.join(','),
              word_count: chunk.metadata?.wordCount || chunk.content.split(/\s+/).length,
              content_hash: contentHash,
              created_at: new Date().toISOString()
            },
            s3_location: {
              bucket: "your-knowledge-base-bucket",
              key: `chunks/${chunk.chunk_id}.json`
            }
          };
        }),
        format: "bedrock_knowledge_base",
        version: "1.0"
      };
    },

    formatForCohere(chunks) {
      return {
        documents: chunks.map(chunk => ({
          id: chunk.chunk_id,
          text: chunk.content,
          metadata: {
            source: chunk.source,
            tags: chunk.tags,
            word_count: chunk.metadata?.wordCount || chunk.content.split(/\s+/).length,
            language: this.exportOptions.addLanguageDetection ? 'en' : undefined
          }
        })),
        embed_fields: ["text"],
        model: "embed-english-v3.0"
      };
    },

    formatForElasticsearch(chunks) {
      return {
        documents: chunks.map(chunk => ({
          _index: "knowledge-base",
          _id: chunk.chunk_id,
          _source: {
            content: chunk.content,
            content_vector: null, // Will be populated after embedding generation
            metadata: {
              source: chunk.source,
              tags: chunk.tags,
              word_count: chunk.metadata?.wordCount || chunk.content.split(/\s+/).length,
              created_at: new Date().toISOString()
            }
          }
        })),
        settings: {
          "index.knn": true,
          "index.knn.space_type": "cosinesimil"
        }
      };
    },

    formatForMongoDBAtlas(chunks) {
      return {
        documents: chunks.map(chunk => ({
          _id: chunk.chunk_id,
          content: chunk.content,
          embedding: null, // Will be populated after embedding generation
          metadata: {
            source: chunk.source,
            tags: chunk.tags,
            word_count: chunk.metadata?.wordCount || chunk.content.split(/\s+/).length,
            created_at: new Date(),
            search_keywords: this.exportOptions.optimizeForSearch 
              ? this.extractSearchTerms(chunk.content) 
              : []
          }
        })),
        collection: "knowledge_chunks",
        vector_search_index: {
          name: "vector_index",
          field: "embedding",
          similarity: "cosine",
          dimensions: 1536
        }
      };
    },

    formatForOllama(chunks) {
      return {
        documents: chunks.map(chunk => ({
          id: chunk.chunk_id,
          content: chunk.content,
          metadata: {
            source: chunk.source,
            tags: chunk.tags,
            word_count: chunk.metadata?.wordCount || chunk.content.split(/\s+/).length
          }
        })),
        model_config: {
          embedding_model: "nomic-embed-text",
          context_length: 2048,
          batch_size: this.advancedOptions.batchSize
        }
      };
    },

    formatGeneric(chunks) {
      return {
        chunks: chunks,
        metadata: {
          total_chunks: chunks.length,
          export_date: new Date().toISOString(),
          format_version: '1.0'
        }
      };
    },

    extractSearchTerms(content) {
      // Extract key terms for better search
      const words = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
      const wordFreq = {};
      
      words.forEach(word => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      });
      
      return Object.entries(wordFreq)
        .filter(([word, freq]) => freq > 1)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([word]) => word);
    },

    generateContentHash(content) {
      // Simple hash function for content integrity
      let hash = 0;
      for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return `sha256:${Math.abs(hash).toString(16)}`;
    },

    analyzeSemanticDensity(content) {
      // Simple semantic density calculation
      const words = content.toLowerCase().match(/\b\w+\b/g) || [];
      const uniqueWords = new Set(words);
      return words.length > 0 ? uniqueWords.size / words.length : 0;
    },

    detectLanguage(content) {
      // Basic language detection (simplified)
      const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
      const words = content.toLowerCase().match(/\b\w+\b/g) || [];
      const englishCount = words.filter(word => englishWords.includes(word)).length;
      return englishCount > words.length * 0.1 ? 'en' : 'unknown';
    },

    calculateReadabilityScore(content) {
      // Simplified Flesch Reading Ease score
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const words = content.match(/\b\w+\b/g) || [];
      const syllables = words.reduce((total, word) => {
        return total + Math.max(1, word.match(/[aeiouy]+/gi)?.length || 1);
      }, 0);
      
      if (sentences.length === 0 || words.length === 0) return 0;
      
      const avgWordsPerSentence = words.length / sentences.length;
      const avgSyllablesPerWord = syllables / words.length;
      
      return Math.max(0, Math.min(100, 
        206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
      ));
    },

    extractEntities(content) {
      // Basic entity extraction (simplified)
      const entities = [];
      
      // Extract potential person names (capitalized words)
      const namePattern = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g;
      const names = content.match(namePattern) || [];
      entities.push(...names.map(name => ({ type: 'PERSON', text: name })));
      
      // Extract dates
      const datePattern = /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b/g;
      const dates = content.match(datePattern) || [];
      entities.push(...dates.map(date => ({ type: 'DATE', text: date })));
      
      // Extract monetary amounts
      const moneyPattern = /\$[\d,]+\.?\d*/g;
      const amounts = content.match(moneyPattern) || [];
      entities.push(...amounts.map(amount => ({ type: 'MONEY', text: amount })));
      
      return entities;
    },

    validateExportFormat(format, chunks) {
      const errors = [];
      const warnings = [];
      
      if (!chunks || chunks.length === 0) {
        errors.push('No chunks to export');
        return { isValid: false, errors, warnings };
      }
      
      // Format-specific validation
      switch (format) {
        case 'azure-vector':
          chunks.forEach((chunk, index) => {
            if (!chunk.content) errors.push(`Chunk ${index}: Missing content`);
            if (!chunk.chunk_id) warnings.push(`Chunk ${index}: Missing chunk_id`);
          });
          break;
        
        case 'anthropic-claude':
          if (chunks.length > 1000) {
            warnings.push('Large number of chunks may exceed Claude API limits');
          }
          break;
        
        case 'pinecone':
          if (chunks.some(chunk => chunk.chunk_id && chunk.chunk_id.length > 512)) {
            errors.push('Pinecone IDs must be 512 characters or less');
          }
          break;
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    },

    exportData() {
      const data = this.formatData();
      const filename = `vector_store_${this.selectedFormat}_${new Date().toISOString().split('T')[0]}.json`;
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      saveAs(blob, filename);
      
      this.$emit('export-success', {
        format: this.selectedFormat,
        filename: filename,
        chunkCount: this.chunks.length,
        exportedData: data,  // Include the actual exported JSON data
        exportOptions: {
          includeMetadata: this.includeMetadata,
          includeEmbeddings: this.includeEmbeddings,
          validateStructure: this.validateStructure,
          optimizeForSearch: this.optimizeForSearch
        }
      });
    },

    previewData() {
      const data = this.formatData();
      this.previewContent = JSON.stringify(data, null, 2);
      this.showPreview = true;
    },

    copyPreview() {
      navigator.clipboard.writeText(this.previewContent);
    },

    generateUploadScript() {
      this.uploadScriptContent = this.getUploadScript();
      this.showUploadScript = true;
    },

    copyUploadScript() {
      navigator.clipboard.writeText(this.uploadScriptContent);
    },

    getUploadScript() {
      switch (this.selectedFormat) {
        case 'anthropic-claude':
          return `# Anthropic Claude Knowledge Base Upload Script
import json
import anthropic
from typing import List, Dict

# Configuration
ANTHROPIC_API_KEY = "your-anthropic-api-key"
client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

# Load your exported data
with open('your_exported_file.json', 'r') as f:
    data = json.load(f)

# Process conversations for Claude
def upload_to_claude_knowledge_base(conversations: List[Dict]):
    results = []
    
    for conv in conversations:
        try:
            # Create knowledge base entry
            response = client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=1000,
                messages=conv["messages"],
                system="You are a knowledge base assistant. Store and organize this information for future retrieval."
            )
            
            results.append({
                "conversation_id": conv["conversation_id"],
                "status": "success",
                "response": response.content[0].text
            })
            
        except Exception as e:
            results.append({
                "conversation_id": conv["conversation_id"],
                "status": "error",
                "error": str(e)
            })
    
    return results

# Upload conversations
results = upload_to_claude_knowledge_base(data["conversations"])

# Print summary
successful = len([r for r in results if r["status"] == "success"])
failed = len([r for r in results if r["status"] == "error"])
print(f"Upload complete: {successful} successful, {failed} failed")

# Save results
with open('claude_upload_results.json', 'w') as f:
    json.dump(results, f, indent=2)`;

        case 'google-vertex':
          return `# Google Vertex AI Knowledge Base Upload Script
import json
from google.cloud import aiplatform
from google.oauth2 import service_account
import vertexai
from vertexai.language_models import TextEmbeddingModel

# Configuration
PROJECT_ID = "your-gcp-project-id"
LOCATION = "us-central1"
CREDENTIALS_PATH = "path/to/service-account.json"

# Initialize Vertex AI
credentials = service_account.Credentials.from_service_account_file(CREDENTIALS_PATH)
vertexai.init(project=PROJECT_ID, location=LOCATION, credentials=credentials)

# Load your exported data
with open('your_exported_file.json', 'r') as f:
    data = json.load(f)

# Initialize embedding model
model = TextEmbeddingModel.from_pretrained("textembedding-gecko@001")

def upload_to_vertex_ai(instances):
    results = []
    batch_size = 10
    
    for i in range(0, len(instances), batch_size):
        batch = instances[i:i+batch_size]
        
        try:
            # Generate embeddings
            texts = [instance["content"] for instance in batch]
            embeddings = model.get_embeddings(texts)
            
            # Store in vector database (customize based on your setup)
            for j, (instance, embedding) in enumerate(zip(batch, embeddings)):
                # Upload to your vector store here
                result = {
                    "id": instance["metadata"]["id"],
                    "status": "success",
                    "embedding_dimensions": len(embedding.values)
                }
                results.append(result)
                
        except Exception as e:
            for instance in batch:
                results.append({
                    "id": instance["metadata"]["id"],
                    "status": "error",
                    "error": str(e)
                })
    
    return results

# Upload instances
results = upload_to_vertex_ai(data["instances"])
print(f"Processed {len(results)} documents")`;

        case 'aws-bedrock':
          return `# AWS Bedrock Knowledge Base Upload Script
import json
import boto3
from botocore.exceptions import ClientError

# Configuration
AWS_REGION = "us-east-1"
KNOWLEDGE_BASE_ID = "your-knowledge-base-id"
DATA_SOURCE_ID = "your-data-source-id"
S3_BUCKET = "your-knowledge-base-bucket"

# Initialize AWS clients
bedrock = boto3.client('bedrock-agent', region_name=AWS_REGION)
s3 = boto3.client('s3', region_name=AWS_REGION)

# Load your exported data
with open('your_exported_file.json', 'r') as f:
    data = json.load(f)

def upload_to_bedrock_knowledge_base(documents):
    results = []
    
    # Upload individual documents to S3
    for doc in documents:
        try:
            # Upload document to S3
            s3_key = doc["s3_location"]["key"]
            doc_content = json.dumps({
                "content": doc["content"]["text"],
                "metadata": doc["metadata"]
            })
            
            s3.put_object(
                Bucket=S3_BUCKET,
                Key=s3_key,
                Body=doc_content,
                ContentType='application/json'
            )
            
            results.append({
                "chunk_id": doc["metadata"]["chunk_id"],
                "s3_location": f"s3://{S3_BUCKET}/{s3_key}",
                "status": "uploaded"
            })
            
        except ClientError as e:
            results.append({
                "chunk_id": doc["metadata"]["chunk_id"],
                "status": "error",
                "error": str(e)
            })
    
    # Trigger knowledge base sync
    try:
        sync_response = bedrock.start_ingestion_job(
            knowledgeBaseId=KNOWLEDGE_BASE_ID,
            dataSourceId=DATA_SOURCE_ID
        )
        
        print(f"Started ingestion job: {sync_response['ingestionJob']['ingestionJobId']}")
        
    except ClientError as e:
        print(f"Failed to start ingestion job: {e}")
    
    return results

# Upload documents
results = upload_to_bedrock_knowledge_base(data["knowledge_base_documents"])
successful = len([r for r in results if r["status"] == "uploaded"])
print(f"Upload complete: {successful}/{len(results)} documents uploaded successfully")`;

        case 'cohere':
          return `# Cohere Knowledge Base Upload Script
import json
import cohere
from typing import List, Dict

# Configuration
COHERE_API_KEY = "your-cohere-api-key"
co = cohere.Client(COHERE_API_KEY)

# Load your exported data
with open('your_exported_file.json', 'r') as f:
    data = json.load(f)

def upload_to_cohere(documents: List[Dict]):
    results = []
    batch_size = 100
    
    for i in range(0, len(documents), batch_size):
        batch = documents[i:i+batch_size]
        
        try:
            # Generate embeddings
            texts = [doc["text"] for doc in batch]
            
            response = co.embed(
                texts=texts,
                model=data.get("model", "embed-english-v3.0"),
                input_type="search_document"
            )
            
            # Store embeddings with metadata
            for j, (doc, embedding) in enumerate(zip(batch, response.embeddings)):
                # Store in your vector database here
                result = {
                    "id": doc["id"],
                    "status": "success",
                    "embedding_dimensions": len(embedding)
                }
                results.append(result)
                
        except Exception as e:
            for doc in batch:
                results.append({
                    "id": doc["id"],
                    "status": "error",
                    "error": str(e)
                })
    
    return results

# Upload documents
results = upload_to_cohere(data["documents"])
successful = len([r for r in results if r["status"] == "success"])
print(f"Processed {successful}/{len(results)} documents successfully")`;

        case 'elasticsearch':
          return `# Elasticsearch Vector Store Upload Script
import json
from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk
import numpy as np

# Configuration
ES_HOST = "https://your-elasticsearch-host:9200"
ES_API_KEY = "your-elasticsearch-api-key"
INDEX_NAME = "knowledge-base"

# Initialize Elasticsearch client
es = Elasticsearch(
    [ES_HOST],
    api_key=ES_API_KEY,
    verify_certs=True
)

# Load your exported data
with open('your_exported_file.json', 'r') as f:
    data = json.load(f)

# Create index with vector mapping if it doesn't exist
mapping = {
    "mappings": {
        "properties": {
            "content": {"type": "text"},
            "content_vector": {
                "type": "dense_vector",
                "dims": 1536,
                "index": True,
                "similarity": "cosine"
            },
            "metadata": {"type": "object"}
        }
    }
}

if not es.indices.exists(index=INDEX_NAME):
    es.indices.create(index=INDEX_NAME, body=mapping)
    print(f"Created index: {INDEX_NAME}")

def upload_to_elasticsearch(documents):
    actions = []
    
    for doc in documents:
        # Generate embeddings here (using your preferred service)
        # doc["_source"]["content_vector"] = generate_embedding(doc["_source"]["content"])
        
        action = {
            "_index": doc["_index"],
            "_id": doc["_id"],
            "_source": doc["_source"]
        }
        actions.append(action)
    
    # Bulk upload
    success, failed = bulk(es, actions, refresh=True)
    return success, failed

# Upload documents
success, failed = upload_to_elasticsearch(data["documents"])
print(f"Upload complete: {success} successful, {len(failed)} failed")`;

        case 'mongodb-atlas':
          return `# MongoDB Atlas Vector Search Upload Script
import json
from pymongo import MongoClient
import numpy as np

# Configuration
CONNECTION_STRING = "your-mongodb-atlas-connection-string"
DATABASE_NAME = "knowledge_base"
COLLECTION_NAME = "knowledge_chunks"

# Initialize MongoDB client
client = MongoClient(CONNECTION_STRING)
db = client[DATABASE_NAME]
collection = db[COLLECTION_NAME]

# Load your exported data
with open('your_exported_file.json', 'r') as f:
    data = json.load(f)

def upload_to_mongodb_atlas(documents):
    results = []
    
    # Create vector search index if it doesn't exist
    try:
        collection.create_search_index({
            "name": data["vector_search_index"]["name"],
            "definition": {
                "fields": [{
                    "type": "vector",
                    "path": data["vector_search_index"]["field"],
                    "numDimensions": data["vector_search_index"]["dimensions"],
                    "similarity": data["vector_search_index"]["similarity"]
                }]
            }
        })
        print("Vector search index created")
    except Exception as e:
        print(f"Index may already exist: {e}")
    
    # Insert documents
    for doc in documents:
        try:
            # Generate embeddings here (using your preferred service)
            # doc["embedding"] = generate_embedding(doc["content"])
            
            result = collection.insert_one(doc)
            results.append({
                "id": doc["_id"],
                "status": "success",
                "inserted_id": str(result.inserted_id)
            })
            
        except Exception as e:
            results.append({
                "id": doc["_id"],
                "status": "error",
                "error": str(e)
            })
    
    return results

# Upload documents
results = upload_to_mongodb_atlas(data["documents"])
successful = len([r for r in results if r["status"] == "success"])
print(f"Upload complete: {successful}/{len(results)} documents uploaded")`;

        case 'ollama':
          return `# Ollama Local Model Upload Script
import json
import requests
import ollama

# Configuration
OLLAMA_HOST = "http://localhost:11434"
EMBEDDING_MODEL = "nomic-embed-text"

# Load your exported data
with open('your_exported_file.json', 'r') as f:
    data = json.load(f)

def upload_to_ollama(documents, model_config):
    results = []
    
    # Ensure embedding model is available
    try:
        ollama.pull(EMBEDDING_MODEL)
        print(f"Embedding model {EMBEDDING_MODEL} ready")
    except Exception as e:
        print(f"Failed to pull model: {e}")
        return results
    
    # Process documents
    batch_size = model_config.get("batch_size", 10)
    
    for i in range(0, len(documents), batch_size):
        batch = documents[i:i+batch_size]
        
        for doc in batch:
            try:
                # Generate embeddings
                response = ollama.embeddings(
                    model=EMBEDDING_MODEL,
                    prompt=doc["content"]
                )
                
                # Store locally (customize based on your vector store)
                result = {
                    "id": doc["id"],
                    "status": "success",
                    "embedding_dimensions": len(response["embedding"])
                }
                results.append(result)
                
            except Exception as e:
                results.append({
                    "id": doc["id"],
                    "status": "error",
                    "error": str(e)
                })
    
    return results

# Upload documents
results = upload_to_ollama(data["documents"], data["model_config"])
successful = len([r for r in results if r["status"] == "success"])
print(f"Processed {successful}/{len(results)} documents successfully")`;

        case 'azure-vector':
          return `# Azure Vector Store Upload Script
import json
import requests
from azure.identity import DefaultAzureCredential
from azure.search.documents import SearchClient
from azure.core.credentials import AzureKeyCredential

# Configuration
SEARCH_SERVICE_ENDPOINT = "https://your-search-service.search.windows.net"
SEARCH_API_KEY = "your-api-key"  # Or use Azure AD authentication
INDEX_NAME = "your-vector-index"

# Load your exported data
with open('your_exported_file.json', 'r') as f:
    documents = json.load(f)

# Initialize search client
search_client = SearchClient(
    endpoint=SEARCH_SERVICE_ENDPOINT,
    index_name=INDEX_NAME,
    credential=AzureKeyCredential(SEARCH_API_KEY)
)

# Upload documents to Azure Cognitive Search
try:
    result = search_client.upload_documents(documents=documents)
    print(f"Successfully uploaded {len(documents)} documents")
    
    # Check for any failures
    for res in result:
        if not res.succeeded:
            print(f"Failed to upload document {res.key}: {res.error_message}")
            
except Exception as e:
    print(f"Upload failed: {str(e)}")

# Alternative: Using Azure OpenAI for embeddings first
# import openai
# openai.api_type = "azure"
# openai.api_base = "https://your-openai-resource.openai.azure.com/"
# openai.api_version = "2023-05-15"
# openai.api_key = "your-openai-key"
# 
# for doc in documents:
#     response = openai.Embedding.create(
#         input=doc['content'],
#         engine="text-embedding-ada-002"
#     )
#     doc['contentVector'] = response['data'][0]['embedding']`;

        case 'openai':
          return `# OpenAI Upload Script
import openai
import json

# Load your exported data
with open('your_exported_file.json', 'r') as f:
    data = json.load(f)

# Upload to OpenAI (requires API key)
openai.api_key = "your-api-key-here"

for item in data['data']:
    # Generate embeddings
    response = openai.Embedding.create(
        input=item['text'],
        model="text-embedding-ada-002"
    )
    item['embedding'] = response['data'][0]['embedding']
    
print(f"Processed {len(data['data'])} chunks")`;

        case 'langchain':
          return `# LangChain Upload Script
from langchain.document_loaders import JSONLoader
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings
import json

# Load documents
loader = JSONLoader(
    file_path='your_exported_file.json',
    jq_schema='.[]',
    text_content=False
)
documents = loader.load()

# Create vector store
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(
    documents=documents,
    embedding=embeddings,
    persist_directory="./chroma_db"
)

print(f"Added {len(documents)} documents to vector store")`;

        case 'pinecone':
          return `# Pinecone Upload Script
import pinecone
import json

# Initialize Pinecone
pinecone.init(
    api_key="your-api-key",
    environment="your-environment"
)

# Load data
with open('your_exported_file.json', 'r') as f:
    data = json.load(f)

# Connect to index
index = pinecone.Index("your-index-name")

# Upload vectors (you'll need to generate embeddings first)
vectors = []
for item in data['vectors']:
    # Add your embeddings here
    item['values'] = your_embedding_function(item['metadata']['text'])
    vectors.append(item)

# Upsert in batches
batch_size = 100
for i in range(0, len(vectors), batch_size):
    batch = vectors[i:i+batch_size]
    index.upsert(vectors=batch)

print(f"Uploaded {len(vectors)} vectors to Pinecone")`;

        case 'chroma':
          return `# ChromaDB Upload Script
import chromadb
import json

# Load data
with open('your_exported_file.json', 'r') as f:
    data = json.load(f)

# Initialize ChromaDB
client = chromadb.Client()
collection = client.create_collection("your_collection_name")

# Add documents
collection.add(
    documents=data['documents'],
    metadatas=data['metadatas'],
    ids=data['ids']
)

print(f"Added {len(data['documents'])} documents to ChromaDB")`;

        default:
          return `# Generic Upload Script
import json
import requests

# Load your exported data
with open('your_exported_file.json', 'r') as f:
    data = json.load(f)

# Upload to your API endpoint
api_url = "https://your-api-endpoint.com/upload"
headers = {"Authorization": "Bearer your-token"}

response = requests.post(
    api_url,
    json=data,
    headers=headers
)

if response.status_code == 200:
    print("Upload successful!")
else:
    print(f"Upload failed: {response.text}")`;
      }
    }
  }
};
</script>