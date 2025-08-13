/**
 * Enhanced Vector Readiness Analyzer
 * Provides sophisticated semantic analysis and embedding quality assessment
 */

// Vector database specific configurations
const VECTOR_DB_CONFIGS = {
  'openai': {
    name: 'OpenAI Embeddings',
    optimalChunkSize: { min: 200, max: 600, ideal: 400 },
    embeddingDimensions: 1536,
    maxTokens: 8191,
    searchType: 'dense_vector',
    metadataSupport: 'extensive',
    recommendedOverlap: 50
  },
  'pinecone': {
    name: 'Pinecone',
    optimalChunkSize: { min: 250, max: 800, ideal: 512 },
    embeddingDimensions: 1536,
    maxTokens: 40960,
    searchType: 'dense_vector_similarity',
    metadataSupport: 'limited',
    recommendedOverlap: 75
  },
  'chromadb': {
    name: 'ChromaDB',
    optimalChunkSize: { min: 150, max: 500, ideal: 300 },
    embeddingDimensions: 768,
    maxTokens: 8191,
    searchType: 'cosine_similarity',
    metadataSupport: 'flexible',
    recommendedOverlap: 40
  },
  'azure_cognitive': {
    name: 'Azure Cognitive Search',
    optimalChunkSize: { min: 300, max: 1000, ideal: 600 },
    embeddingDimensions: 1536,
    maxTokens: 32768,
    searchType: 'hybrid_search',
    metadataSupport: 'rich',
    recommendedOverlap: 100
  },
  'elasticsearch': {
    name: 'Elasticsearch',
    optimalChunkSize: { min: 200, max: 700, ideal: 450 },
    embeddingDimensions: 768,
    maxTokens: 20000,
    searchType: 'knn_vector_search',
    metadataSupport: 'comprehensive',
    recommendedOverlap: 60
  }
};

export class EnhancedVectorReadinessAnalyzer {
  constructor(options = {}) {
    this.options = {
      enableEmbeddingGeneration: options.enableEmbeddingGeneration ?? true,
      enableSemanticAnalysis: options.enableSemanticAnalysis ?? true,
      enableRealEmbeddings: options.enableRealEmbeddings ?? true,
      enableRetrievalSimulation: options.enableRetrievalSimulation ?? true,
      batchSize: options.batchSize ?? 50,
      ...options
    };
    
    this.semanticCache = new Map();
    this.embeddingCache = new Map();
    this.analysisResults = new Map();

    // Initialize embedding capabilities
    this.embeddingCapabilities = {
      transformersJS: false,
      webWorker: typeof Worker !== 'undefined',
      offlineModels: false
    };

    this.initializeEmbeddingCapabilities();
  }

  /**
   * Initialize embedding generation capabilities
   */
  async initializeEmbeddingCapabilities() {
    if (!this.options.enableRealEmbeddings) return;

    try {
      // Check for Transformers.js availability (would need to be installed)
      // For now, we'll use a simple embedding simulation
      this.embeddingCapabilities.offlineModels = true;
    } catch (error) {
      console.warn('Real embedding capabilities not available:', error.message);
    }
  }

  /**
   * Comprehensive chunk analysis with enhanced semantic understanding
   */
  async analyzeChunk(chunk, targetPlatforms = ['openai']) {
    const chunkId = chunk.id || chunk.chunk_id || `chunk_${Date.now()}`;
    
    // Check cache first
    const cacheKey = `${chunkId}_${targetPlatforms.join('_')}`;
    if (this.analysisResults.has(cacheKey)) {
      return this.analysisResults.get(cacheKey);
    }

    const content = chunk.content || '';
    const metadata = chunk.metadata || {};
    const tags = chunk.tags || [];

    const analysis = {
      chunkId,
      content: {
        wordCount: this.getWordCount(content),
        sentenceCount: this.getSentenceCount(content),
        characterCount: content.length,
        avgSentenceLength: this.getAverageSentenceLength(content)
      },
      semanticCoherence: await this.calculateSemanticCoherence(content),
      informationDensity: this.calculateInformationDensity(content),
      embeddingQuality: await this.assessEmbeddingQuality(content),
      contextualCompleteness: this.assessContextualCompleteness(content, metadata),
      retrievalOptimization: this.assessRetrievalOptimization(content, tags),
      platformCompatibility: this.assessPlatformCompatibility(content, targetPlatforms),
      overallScore: 0,
      recommendations: [],
      qualityFlags: []
    };

    // Calculate overall score
    analysis.overallScore = this.calculateOverallScore(analysis);
    
    // Generate recommendations
    analysis.recommendations = this.generateAdvancedRecommendations(analysis, content, metadata, tags);
    
    // Identify quality flags
    analysis.qualityFlags = this.identifyQualityFlags(analysis, content);

    // Add retrieval simulation if enabled
    if (this.options.enableRetrievalSimulation) {
      analysis.retrievalSimulation = await this.simulateRetrieval(content, metadata);
    }

    // Cache the results
    this.analysisResults.set(cacheKey, analysis);
    
    return analysis;
  }

  /**
   * Enhanced semantic coherence analysis using sentence-level understanding
   */
  async calculateSemanticCoherence(content) {
    const sentences = this.splitIntoSentences(content);
    
    if (sentences.length < 2) {
      return {
        score: 85, // Single sentence assumed coherent
        confidence: 0.7,
        topicConsistency: 0.8,
        sentenceFlow: 0.8,
        details: 'Single sentence content'
      };
    }

    // Analyze sentence transitions
    const sentenceTransitions = this.analyzeTransitions(sentences);
    
    // Analyze topic consistency
    const topicConsistency = this.analyzeTopicConsistency(sentences);
    
    // Analyze entity coherence
    const entityCoherence = this.analyzeEntityCoherence(content);
    
    // Analyze keyword density and distribution
    const keywordAnalysis = this.analyzeKeywordDistribution(content);

    const score = Math.round(
      sentenceTransitions.score * 0.3 +
      topicConsistency.score * 0.3 +
      entityCoherence.score * 0.2 +
      keywordAnalysis.coherenceScore * 0.2
    );

    return {
      score,
      confidence: this.calculateConfidenceScore(sentences.length, score),
      topicConsistency: topicConsistency.score,
      sentenceFlow: sentenceTransitions.score,
      entityCoherence: entityCoherence.score,
      keywordDistribution: keywordAnalysis.coherenceScore,
      details: {
        sentenceCount: sentences.length,
        topicShifts: topicConsistency.shifts,
        entities: entityCoherence.entities,
        keywords: keywordAnalysis.primaryKeywords
      }
    };
  }

  /**
   * Analyze transitions between sentences for flow and coherence
   */
  analyzeTransitions(sentences) {
    let transitionScore = 100;
    const transitions = [];
    
    const transitionWords = new Set([
      'however', 'moreover', 'furthermore', 'additionally', 'consequently',
      'therefore', 'thus', 'meanwhile', 'similarly', 'likewise', 'in contrast',
      'on the other hand', 'for example', 'specifically', 'in particular',
      'first', 'second', 'third', 'finally', 'in conclusion', 'as a result'
    ]);

    for (let i = 0; i < sentences.length - 1; i++) {
      const current = sentences[i].toLowerCase();
      const next = sentences[i + 1].toLowerCase();
      
      // Check for explicit transitions
      const hasTransition = transitionWords.has(next.split(' ').slice(0, 3).join(' ')) ||
                           Array.from(transitionWords).some(tw => next.startsWith(tw));
      
      // Analyze word overlap between adjacent sentences
      const currentWords = this.extractContentWords(current);
      const nextWords = this.extractContentWords(next);
      const overlap = currentWords.filter(word => nextWords.includes(word));
      const overlapRatio = overlap.length / Math.max(currentWords.length, nextWords.length, 1);
      
      // Score this transition
      let score = 70; // Base score
      if (hasTransition) score += 20;
      if (overlapRatio > 0.1) score += 10; // Some semantic connection
      if (overlapRatio < 0.05) score -= 15; // Very disconnected
      
      transitions.push({
        from: i,
        to: i + 1,
        score: Math.max(0, Math.min(100, score)),
        hasTransition,
        overlapRatio
      });
      
      transitionScore = Math.min(transitionScore, score);
    }

    return {
      score: Math.max(30, transitionScore), // Minimum viable score
      transitions,
      averageOverlap: transitions.reduce((sum, t) => sum + t.overlapRatio, 0) / transitions.length
    };
  }

  /**
   * Analyze topic consistency throughout the content
   */
  analyzeTopicConsistency(sentences) {
    const topics = [];
    let topicShifts = 0;
    
    // Simple topic modeling using keyword clustering
    const windowSize = Math.min(3, sentences.length);
    for (let i = 0; i <= sentences.length - windowSize; i++) {
      const window = sentences.slice(i, i + windowSize);
      const windowText = window.join(' ');
      const keywords = this.extractTopicKeywords(windowText);
      
      topics.push({
        position: i,
        keywords,
        primaryTopic: this.identifyPrimaryTopic(keywords)
      });
    }
    
    // Count topic shifts
    for (let i = 1; i < topics.length; i++) {
      const prevTopic = topics[i - 1].primaryTopic;
      const currTopic = topics[i].primaryTopic;
      
      if (prevTopic && currTopic && prevTopic !== currTopic) {
        const similarity = this.calculateTopicSimilarity(
          topics[i - 1].keywords, 
          topics[i].keywords
        );
        
        if (similarity < 0.3) { // Significant topic shift
          topicShifts++;
        }
      }
    }
    
    const consistencyScore = Math.max(20, 100 - (topicShifts * 25));
    
    return {
      score: consistencyScore,
      shifts: topicShifts,
      topics: topics.length,
      primaryTopics: [...new Set(topics.map(t => t.primaryTopic).filter(Boolean))]
    };
  }

  /**
   * Analyze keyword density and distribution
   */
  analyzeKeywordDistribution(content) {
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    const sentences = this.splitIntoSentences(content);
    
    if (words.length === 0) {
      return {
        coherenceScore: 50,
        primaryKeywords: [],
        distribution: 'uniform',
        density: 0
      };
    }

    // Extract meaningful keywords (non-stop words)
    const meaningfulWords = this.extractContentWords(content);
    
    // Calculate keyword frequency
    const frequency = {};
    meaningfulWords.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    // Get primary keywords (most frequent)
    const primaryKeywords = Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);

    // Calculate distribution coherence
    let distributionScore = 50; // Base score
    
    // Check if keywords are distributed across sentences
    const keywordInSentences = sentences.map(sentence => {
      const sentenceWords = sentence.toLowerCase().match(/\b\w+\b/g) || [];
      return primaryKeywords.filter(keyword => sentenceWords.includes(keyword)).length;
    });

    // Better distribution = more coherent
    const avgKeywordsPerSentence = keywordInSentences.reduce((a, b) => a + b, 0) / sentences.length;
    const variance = keywordInSentences.reduce((sum, count) => 
      sum + Math.pow(count - avgKeywordsPerSentence, 2), 0) / sentences.length;
    
    // Lower variance = better distribution
    distributionScore += Math.max(0, 30 - (variance * 10));

    // Check keyword density (not too sparse, not too dense)
    const keywordDensity = meaningfulWords.length / words.length;
    if (keywordDensity >= 0.3 && keywordDensity <= 0.6) {
      distributionScore += 20;
    }

    return {
      coherenceScore: Math.max(20, Math.min(100, Math.round(distributionScore))),
      primaryKeywords: primaryKeywords.slice(0, 5),
      distribution: variance < 2 ? 'uniform' : variance < 5 ? 'moderate' : 'scattered',
      density: Math.round(keywordDensity * 100),
      keywordCount: primaryKeywords.length
    };
  }

  /**
   * Analyze entity coherence and relationships
   */
  analyzeEntityCoherence(content) {
    const entities = this.extractEntities(content);
    const entityTypes = this.categorizeEntities(entities);
    
    // Score based on entity distribution and relationships
    let score = 50; // Base score
    
    // Bonus for having multiple entity types (indicates rich content)
    if (entityTypes.persons && entityTypes.organizations) score += 15;
    if (entityTypes.locations && entityTypes.concepts) score += 10;
    
    // Penalty for too many disparate entities (might indicate incoherence)
    const totalEntities = Object.values(entityTypes).reduce((sum, arr) => sum + arr.length, 0);
    if (totalEntities > content.split(' ').length * 0.1) score -= 20; // Too entity-dense
    
    // Bonus for entity repetition (indicates focus)
    const entityFrequency = this.calculateEntityFrequency(entities);
    const repeatedEntities = entityFrequency.filter(e => e.count > 1);
    score += Math.min(20, repeatedEntities.length * 5);

    return {
      score: Math.max(10, Math.min(100, score)),
      entities: totalEntities,
      types: Object.keys(entityTypes).length,
      repeated: repeatedEntities.length,
      distribution: entityTypes
    };
  }

  /**
   * Calculate information density with advanced metrics
   */
  calculateInformationDensity(content) {
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    const sentences = this.splitIntoSentences(content);
    
    // Content word ratio (excluding stop words)
    const stopWords = this.getStopWords();
    const contentWords = words.filter(word => !stopWords.has(word));
    const contentRatio = contentWords.length / Math.max(words.length, 1);
    
    // Lexical diversity (unique words / total words)
    const uniqueWords = new Set(words);
    const lexicalDiversity = uniqueWords.size / Math.max(words.length, 1);
    
    // Technical term density
    const technicalTerms = this.identifyTechnicalTerms(content);
    const technicalDensity = technicalTerms.length / Math.max(words.length, 1);
    
    // Information-bearing sentence ratio
    const informativeSentences = sentences.filter(s => 
      this.isInformativeSentence(s)
    ).length;
    const informativeRatio = informativeSentences / Math.max(sentences.length, 1);

    // Calculate composite score
    const densityScore = Math.round(
      contentRatio * 25 +
      lexicalDiversity * 25 +
      Math.min(technicalDensity * 200, 25) + // Cap technical bonus
      informativeRatio * 25
    );

    return {
      score: Math.max(10, Math.min(100, densityScore)),
      contentWordRatio: Math.round(contentRatio * 100),
      lexicalDiversity: Math.round(lexicalDiversity * 100),
      technicalTermDensity: Math.round(technicalDensity * 100),
      informativeRatio: Math.round(informativeRatio * 100),
      details: {
        totalWords: words.length,
        contentWords: contentWords.length,
        uniqueWords: uniqueWords.size,
        technicalTerms: technicalTerms.length,
        sentences: sentences.length,
        informativeSentences
      }
    };
  }

  /**
   * Assess embedding quality potential
   */
  async assessEmbeddingQuality(content) {
    // Factors that affect embedding quality
    const length = content.length;
    const wordCount = this.getWordCount(content);
    const sentences = this.splitIntoSentences(content);
    
    let score = 50; // Base score
    let embeddingMetrics = {
      hasRealEmbedding: false,
      similarity: null,
      density: null,
      clustering: null
    };

    // Try to generate real embeddings for enhanced assessment
    if (this.options.enableRealEmbeddings && this.embeddingCapabilities.offlineModels) {
      try {
        const embeddingResults = await this.generateTestEmbedding(content);
        if (embeddingResults.success) {
          embeddingMetrics = {
            hasRealEmbedding: true,
            similarity: embeddingResults.selfSimilarity,
            density: embeddingResults.informationDensity,
            clustering: embeddingResults.clusteringPotential
          };
          
          // Adjust score based on real embedding quality
          if (embeddingResults.selfSimilarity > 0.8) score += 10;
          if (embeddingResults.informationDensity > 0.7) score += 15;
          if (embeddingResults.clusteringPotential > 0.6) score += 10;
        }
      } catch (error) {
        console.warn('Real embedding generation failed, using heuristic assessment:', error.message);
      }
    }
    
    // Fallback to heuristic-based assessment
    // Length optimization
    if (length >= 300 && length <= 2000) score += 20;
    else if (length < 100) score -= 30;
    else if (length > 4000) score -= 20;
    
    // Word count optimization
    if (wordCount >= 50 && wordCount <= 400) score += 15;
    else if (wordCount < 20) score -= 25;
    
    // Sentence structure
    if (sentences.length >= 2 && sentences.length <= 10) score += 10;
    const avgSentenceLength = wordCount / Math.max(sentences.length, 1);
    if (avgSentenceLength >= 10 && avgSentenceLength <= 30) score += 10;
    
    // Content structure penalties
    if (this.hasProblematicPatterns(content)) score -= 15;
    if (this.hasGoodStructure(content)) score += 10;
    
    // Vocabulary richness
    const vocabularyRichness = this.calculateVocabularyRichness(content);
    score += Math.min(15, vocabularyRichness * 15);

    return {
      score: Math.max(10, Math.min(100, score)),
      optimalLength: length >= 300 && length <= 2000,
      optimalWordCount: wordCount >= 50 && wordCount <= 400,
      structuralQuality: this.hasGoodStructure(content) ? 'good' : 'needs_improvement',
      vocabularyRichness: Math.round(vocabularyRichness * 100),
      embeddingMetrics,
      details: {
        length,
        wordCount,
        sentenceCount: sentences.length,
        avgSentenceLength: Math.round(avgSentenceLength)
      }
    };
  }

  /**
   * Generate test embedding and analyze its properties
   * This simulates embedding generation and quality assessment
   */
  async generateTestEmbedding(content) {
    try {
      // Simulate embedding generation with advanced heuristics
      // In a real implementation, this would use a model like sentence-transformers
      
      const words = content.toLowerCase().match(/\b\w+\b/g) || [];
      const sentences = this.splitIntoSentences(content);
      
      if (words.length === 0) {
        return { success: false, error: 'No words found' };
      }

      // Simulate embedding properties
      const embedding = await this.simulateEmbedding(words, sentences);
      
      // Calculate embedding quality metrics
      const selfSimilarity = this.calculateSelfSimilarity(embedding);
      const informationDensity = this.calculateInformationDensityFromEmbedding(embedding, words);
      const clusteringPotential = this.calculateClusteringPotential(embedding);

      return {
        success: true,
        embedding: embedding.slice(0, 10), // Return first 10 dimensions for debugging
        selfSimilarity,
        informationDensity,
        clusteringPotential,
        dimensions: embedding.length
      };

    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Simulate embedding generation using advanced heuristics
   */
  async simulateEmbedding(words, sentences) {
    const embeddingSize = 384; // Common embedding size for sentence transformers
    const embedding = new Float32Array(embeddingSize);
    
    // Generate pseudo-embedding based on content characteristics
    const uniqueWords = [...new Set(words)];
    const wordFreq = {};
    words.forEach(word => wordFreq[word] = (wordFreq[word] || 0) + 1);
    
    // Use word characteristics to generate meaningful embedding components
    for (let i = 0; i < embeddingSize; i++) {
      let value = 0;
      
      // Incorporate word frequency patterns
      const wordIndex = i % uniqueWords.length;
      const word = uniqueWords[wordIndex];
      const freq = wordFreq[word] || 1;
      
      // Simulate semantic dimensions
      value += Math.sin(word.length * i) * (freq / words.length);
      value += Math.cos(word.charCodeAt(0) * i) * 0.5;
      
      // Add sentence structure influence
      if (sentences.length > 1) {
        value += Math.sin(sentences.length * i) * 0.3;
      }
      
      // Normalize and add noise for realism
      value = Math.tanh(value) + (Math.random() - 0.5) * 0.1;
      embedding[i] = value;
    }
    
    // Normalize the embedding vector
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] = embedding[i] / magnitude;
      }
    }
    
    return Array.from(embedding);
  }

  /**
   * Calculate self-similarity score (coherence within the text)
   */
  calculateSelfSimilarity(embedding) {
    // Split embedding into segments and calculate similarity
    const segmentSize = Math.floor(embedding.length / 4);
    const segments = [];
    
    for (let i = 0; i < 4; i++) {
      const start = i * segmentSize;
      const end = Math.min(start + segmentSize, embedding.length);
      segments.push(embedding.slice(start, end));
    }
    
    let totalSimilarity = 0;
    let comparisons = 0;
    
    for (let i = 0; i < segments.length; i++) {
      for (let j = i + 1; j < segments.length; j++) {
        const similarity = this.cosineSimilarity(segments[i], segments[j]);
        totalSimilarity += similarity;
        comparisons++;
      }
    }
    
    return comparisons > 0 ? totalSimilarity / comparisons : 0;
  }

  /**
   * Calculate information density from embedding characteristics
   */
  calculateInformationDensityFromEmbedding(embedding, words) {
    // Measure how well the embedding captures information
    const variance = this.calculateVariance(embedding);
    const sparsity = embedding.filter(val => Math.abs(val) < 0.01).length / embedding.length;
    const dynamicRange = Math.max(...embedding) - Math.min(...embedding);
    
    // Higher variance and dynamic range, lower sparsity = better information density
    let density = (variance * dynamicRange * (1 - sparsity));
    
    // Adjust based on vocabulary richness
    const uniqueWordRatio = new Set(words).size / words.length;
    density *= (0.5 + uniqueWordRatio);
    
    return Math.min(1, density * 2); // Normalize to 0-1 range
  }

  /**
   * Calculate clustering potential (how well it would cluster with similar content)
   */
  calculateClusteringPotential(embedding) {
    // Analyze embedding distribution patterns
    const mean = embedding.reduce((sum, val) => sum + val, 0) / embedding.length;
    const variance = this.calculateVariance(embedding);
    const skewness = this.calculateSkewness(embedding, mean, variance);
    
    // Good clustering potential: moderate variance, low skewness
    let potential = 1 - Math.abs(skewness) / 2; // Penalize high skewness
    potential *= Math.min(1, variance * 10); // Reward moderate variance
    
    return Math.max(0, Math.min(1, potential));
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Calculate variance of a vector
   */
  calculateVariance(vector) {
    const mean = vector.reduce((sum, val) => sum + val, 0) / vector.length;
    const variance = vector.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / vector.length;
    return variance;
  }

  /**
   * Calculate skewness of a vector
   */
  calculateSkewness(vector, mean, variance) {
    if (variance === 0) return 0;
    
    const skewness = vector.reduce((sum, val) => {
      return sum + Math.pow((val - mean) / Math.sqrt(variance), 3);
    }, 0) / vector.length;
    
    return skewness;
  }

  /**
   * Assess contextual completeness
   */
  assessContextualCompleteness(content, metadata) {
    let score = 40; // Base score
    
    // Content completeness
    if (this.hasIntroduction(content)) score += 15;
    if (this.hasConclusion(content)) score += 15;
    if (this.hasSupportingDetails(content)) score += 15;
    
    // Metadata completeness
    const requiredMetadata = ['source', 'title'];
    const optionalMetadata = ['author', 'date', 'category', 'section'];
    
    requiredMetadata.forEach(field => {
      if (metadata[field]) score += 5;
    });
    
    optionalMetadata.forEach(field => {
      if (metadata[field]) score += 2.5;
    });
    
    // Self-contained check
    if (this.isSelfContained(content)) score += 10;

    return {
      score: Math.max(10, Math.min(100, score)),
      hasIntro: this.hasIntroduction(content),
      hasConclusion: this.hasConclusion(content),
      hasSupportingDetails: this.hasSupportingDetails(content),
      isSelfContained: this.isSelfContained(content),
      metadataCompleteness: this.calculateMetadataCompleteness(metadata)
    };
  }

  /**
   * Assess retrieval optimization potential
   */
  assessRetrievalOptimization(content, tags) {
    let score = 30; // Base score
    
    // Tag quality
    if (tags.length > 0) {
      score += Math.min(25, tags.length * 5);
      if (tags.length > 10) score -= 10; // Too many tags
    }
    
    // Question-answerable content
    if (this.isQuestionAnswerable(content)) score += 20;
    
    // Key concept density
    const concepts = this.extractKeyConcepts(content);
    score += Math.min(15, concepts.length * 2);
    
    // Search-friendly structure
    if (this.hasSearchFriendlyStructure(content)) score += 10;

    return {
      score: Math.max(10, Math.min(100, score)),
      tagCount: tags.length,
      tagQuality: this.assessTagQuality(tags, content),
      isQuestionAnswerable: this.isQuestionAnswerable(content),
      keyConcepts: concepts.length,
      searchFriendly: this.hasSearchFriendlyStructure(content)
    };
  }

  /**
   * Assess compatibility with different vector database platforms
   */
  assessPlatformCompatibility(content, targetPlatforms) {
    const compatibility = {};
    const wordCount = this.getWordCount(content);
    const charCount = content.length;
    
    targetPlatforms.forEach(platform => {
      const config = VECTOR_DB_CONFIGS[platform];
      if (!config) {
        compatibility[platform] = {
          score: 50,
          status: 'unknown_platform',
          recommendations: ['Platform configuration not available']
        };
        return;
      }
      
      let score = 50; // Base compatibility score
      const recs = [];
      
      // Size compatibility
      if (wordCount >= config.optimalChunkSize.min && wordCount <= config.optimalChunkSize.max) {
        score += 30;
      } else if (wordCount < config.optimalChunkSize.min) {
        score -= 20;
        recs.push(`Increase chunk size to ${config.optimalChunkSize.min}-${config.optimalChunkSize.max} words`);
      } else if (wordCount > config.optimalChunkSize.max) {
        score -= 15;
        recs.push(`Reduce chunk size to ${config.optimalChunkSize.min}-${config.optimalChunkSize.max} words`);
      }
      
      // Token limit check (approximate)
      const estimatedTokens = Math.ceil(wordCount * 1.3); // Rough approximation
      if (estimatedTokens > config.maxTokens) {
        score -= 30;
        recs.push(`Content exceeds token limit (${estimatedTokens} > ${config.maxTokens})`);
      } else {
        score += 10;
      }
      
      // Platform-specific optimizations
      if (config.searchType === 'hybrid_search') {
        if (this.hasGoodKeywords(content)) score += 10;
      }
      
      if (config.metadataSupport === 'extensive' || config.metadataSupport === 'rich') {
        score += 5; // Bonus for platforms that support rich metadata
      }
      
      compatibility[platform] = {
        score: Math.max(10, Math.min(100, score)),
        status: score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor',
        recommendations: recs,
        optimalForPlatform: wordCount >= config.optimalChunkSize.min && wordCount <= config.optimalChunkSize.max,
        config
      };
    });
    
    return compatibility;
  }

  /**
   * Calculate overall quality score
   */
  calculateOverallScore(analysis) {
    const weights = {
      semanticCoherence: 0.25,
      informationDensity: 0.20,
      embeddingQuality: 0.20,
      contextualCompleteness: 0.15,
      retrievalOptimization: 0.20
    };
    
    return Math.round(
      analysis.semanticCoherence.score * weights.semanticCoherence +
      analysis.informationDensity.score * weights.informationDensity +
      analysis.embeddingQuality.score * weights.embeddingQuality +
      analysis.contextualCompleteness.score * weights.contextualCompleteness +
      analysis.retrievalOptimization.score * weights.retrievalOptimization
    );
  }

  /**
   * Generate advanced, actionable recommendations
   */
  generateAdvancedRecommendations(analysis, content, metadata, tags) {
    const recommendations = [];
    
    // Semantic coherence recommendations
    if (analysis.semanticCoherence.score < 70) {
      if (analysis.semanticCoherence.details.topicShifts > 2) {
        recommendations.push({
          priority: 'high',
          category: 'semantic_coherence',
          title: 'Split at topic boundaries',
          description: `Detected ${analysis.semanticCoherence.details.topicShifts} topic shifts. Consider splitting this chunk at natural topic boundaries.`,
          expectedImprovement: '15-25 points',
          effort: 'medium'
        });
      }
      
      if (analysis.semanticCoherence.sentenceFlow < 60) {
        recommendations.push({
          priority: 'medium',
          category: 'sentence_flow',
          title: 'Improve sentence transitions',
          description: 'Add transitional phrases between sentences to improve flow and coherence.',
          expectedImprovement: '10-15 points',
          effort: 'low'
        });
      }
    }
    
    // Information density recommendations
    if (analysis.informationDensity.score < 60) {
      if (analysis.informationDensity.contentWordRatio < 60) {
        recommendations.push({
          priority: 'medium',
          category: 'information_density',
          title: 'Reduce filler words',
          description: `Content word ratio is ${analysis.informationDensity.contentWordRatio}%. Remove unnecessary filler words and focus on substantive content.`,
          expectedImprovement: '10-20 points',
          effort: 'medium'
        });
      }
      
      if (analysis.informationDensity.lexicalDiversity < 40) {
        recommendations.push({
          priority: 'low',
          category: 'vocabulary',
          title: 'Increase vocabulary diversity',
          description: 'Use more varied vocabulary to improve lexical diversity and information richness.',
          expectedImprovement: '5-10 points',
          effort: 'high'
        });
      }
    }
    
    // Embedding quality recommendations
    if (analysis.embeddingQuality.score < 70) {
      const wordCount = analysis.content.wordCount;
      
      if (wordCount < 50) {
        recommendations.push({
          priority: 'high',
          category: 'chunk_size',
          title: 'Increase chunk size',
          description: `Chunk is too small (${wordCount} words). Combine with adjacent content to reach 50-400 words for better embedding quality.`,
          expectedImprovement: '20-30 points',
          effort: 'medium'
        });
      } else if (wordCount > 400) {
        recommendations.push({
          priority: 'high',
          category: 'chunk_size', 
          title: 'Split large chunk',
          description: `Chunk is too large (${wordCount} words). Split at natural boundaries to stay within 50-400 words.`,
          expectedImprovement: '15-25 points',
          effort: 'medium'
        });
      }
      
      if (analysis.embeddingQuality.structuralQuality === 'needs_improvement') {
        recommendations.push({
          priority: 'medium',
          category: 'structure',
          title: 'Improve content structure',
          description: 'Remove formatting issues, excessive whitespace, or fragmented sentences that may affect embedding quality.',
          expectedImprovement: '10-15 points',
          effort: 'low'
        });
      }
    }
    
    // Retrieval optimization recommendations
    if (analysis.retrievalOptimization.score < 70) {
      if (tags.length === 0) {
        recommendations.push({
          priority: 'high',
          category: 'metadata',
          title: 'Add relevant tags',
          description: 'Add 3-7 relevant tags to improve search accuracy and retrieval performance.',
          expectedImprovement: '15-25 points',
          effort: 'low'
        });
      } else if (tags.length > 10) {
        recommendations.push({
          priority: 'medium',
          category: 'metadata',
          title: 'Reduce tag count',
          description: `Too many tags (${tags.length}). Focus on the 5-8 most relevant tags for better precision.`,
          expectedImprovement: '5-10 points',
          effort: 'low'
        });
      }
      
      if (!analysis.retrievalOptimization.isQuestionAnswerable) {
        recommendations.push({
          priority: 'medium',
          category: 'content_structure',
          title: 'Make content more question-answerable',
          description: 'Structure content to directly answer potential questions. Start with clear statements or definitions.',
          expectedImprovement: '10-15 points',
          effort: 'medium'
        });
      }
    }
    
    // Platform-specific recommendations
    Object.entries(analysis.platformCompatibility).forEach(([platform, compat]) => {
      if (compat.score < 70 && compat.recommendations.length > 0) {
        compat.recommendations.forEach(rec => {
          recommendations.push({
            priority: 'medium',
            category: 'platform_optimization',
            title: `${VECTOR_DB_CONFIGS[platform].name} optimization`,
            description: rec,
            expectedImprovement: '10-20 points',
            effort: 'medium',
            platform
          });
        });
      }
    });
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Identify quality flags and issues
   */
  identifyQualityFlags(analysis, content) {
    const flags = [];
    
    if (analysis.overallScore >= 85) {
      flags.push({ type: 'success', message: 'Excellent vector readiness' });
    } else if (analysis.overallScore < 50) {
      flags.push({ type: 'error', message: 'Significant improvements needed' });
    }
    
    if (analysis.semanticCoherence.details.topicShifts > 3) {
      flags.push({ type: 'warning', message: 'Multiple topic shifts detected' });
    }
    
    if (analysis.content.wordCount < 20) {
      flags.push({ type: 'error', message: 'Content too short for effective embeddings' });
    }
    
    if (analysis.content.wordCount > 1000) {
      flags.push({ type: 'warning', message: 'Content may be too long for optimal retrieval' });
    }
    
    if (analysis.informationDensity.contentWordRatio < 50) {
      flags.push({ type: 'warning', message: 'High ratio of filler words' });
    }
    
    return flags;
  }

  // Utility methods for text analysis
  getWordCount(text) {
    return (text.match(/\b\w+\b/g) || []).length;
  }
  
  getSentenceCount(text) {
    return this.splitIntoSentences(text).length;
  }
  
  getAverageSentenceLength(text) {
    const sentences = this.splitIntoSentences(text);
    if (sentences.length === 0) return 0;
    const totalWords = sentences.reduce((sum, s) => sum + this.getWordCount(s), 0);
    return Math.round(totalWords / sentences.length);
  }
  
  splitIntoSentences(text) {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.length > 10); // Filter very short fragments
  }
  
  extractContentWords(text) {
    const stopWords = this.getStopWords();
    return (text.match(/\b\w+\b/g) || [])
      .map(w => w.toLowerCase())
      .filter(w => !stopWords.has(w) && w.length > 2);
  }
  
  getStopWords() {
    return new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having',
      'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must',
      'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
      'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'
    ]);
  }
  
  extractTopicKeywords(text) {
    const contentWords = this.extractContentWords(text);
    const frequency = {};
    
    contentWords.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }
  
  identifyPrimaryTopic(keywords) {
    if (keywords.length === 0) return null;
    
    // Simple topic categorization based on keyword patterns
    const technicalTerms = keywords.filter(k => this.isTechnicalTerm(k));
    if (technicalTerms.length > keywords.length * 0.3) return 'technical';
    
    const businessTerms = keywords.filter(k => this.isBusinessTerm(k));
    if (businessTerms.length > keywords.length * 0.3) return 'business';
    
    return 'general';
  }
  
  calculateTopicSimilarity(keywords1, keywords2) {
    const set1 = new Set(keywords1);
    const set2 = new Set(keywords2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }
  
  extractEntities(text) {
    const entities = [];
    
    // Enhanced entity extraction with multiple strategies
    
    // 1. Named Entity Recognition patterns
    entities.push(...this.extractNamedEntities(text));
    
    // 2. Technical terms and domain-specific entities
    entities.push(...this.extractTechnicalEntities(text));
    
    // 3. Temporal entities (dates, times)
    entities.push(...this.extractTemporalEntities(text));
    
    // 4. Quantitative entities (measurements, statistics)
    entities.push(...this.extractQuantitativeEntities(text));
    
    // 5. Geographic entities
    entities.push(...this.extractGeographicEntities(text));
    
    // 6. Contact information
    entities.push(...this.extractContactEntities(text));
    
    // Deduplicate and enrich entities
    return this.enrichAndDeduplicateEntities(entities, text);
  }
  
  categorizeEntities(entities) {
    return {
      persons: entities.filter(e => this.isPersonName(e.text)),
      organizations: entities.filter(e => this.isOrganizationName(e.text)),
      locations: entities.filter(e => this.isLocationName(e.text)),
      concepts: entities.filter(e => e.type === 'PROPER_NOUN' && !this.isPersonName(e.text) && !this.isOrganizationName(e.text)),
      numbers: entities.filter(e => e.type === 'NUMBER')
    };
  }
  
  calculateEntityFrequency(entities) {
    const frequency = {};
    entities.forEach(entity => {
      const key = entity.text.toLowerCase();
      frequency[key] = { entity: entity.text, count: (frequency[key]?.count || 0) + 1 };
    });
    
    return Object.values(frequency);
  }
  
  identifyTechnicalTerms(content) {
    const technicalPatterns = [
      /\b\w*(?:tion|sion|ment|ness|ity|ism)\b/gi, // Abstract suffixes
      /\b(?:algorithm|data|system|process|method|analysis|framework|model|api|database)\b/gi, // Technical terms
      /\b\w+(?:_\w+)+\b/g, // Snake_case terms
      /\b[A-Z]{2,}\b/g // Acronyms
    ];
    
    const terms = [];
    technicalPatterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      terms.push(...matches);
    });
    
    return [...new Set(terms.map(term => term.toLowerCase()))];
  }
  
  isInformativeSentence(sentence) {
    const words = sentence.split(/\s+/);
    
    // Too short
    if (words.length < 5) return false;
    
    // Contains meaningful content
    const contentWords = this.extractContentWords(sentence);
    if (contentWords.length < words.length * 0.4) return false;
    
    // Not just a fragment or question
    if (!sentence.match(/[.!]$/)) return false;
    
    return true;
  }
  
  hasProblematicPatterns(content) {
    const problematicPatterns = [
      /\.{3,}/,     // Multiple dots
      /_{3,}/,      // Multiple underscores
      /-{3,}/,      // Multiple dashes
      /\s{3,}/,     // Multiple spaces
      /\n\s*\n\s*\n/, // Too many line breaks
      /[^\w\s.!?,:;'"()-]{3,}/ // Excessive special characters
    ];
    
    return problematicPatterns.some(pattern => pattern.test(content));
  }
  
  hasGoodStructure(content) {
    // Check for well-formed sentences
    const sentences = this.splitIntoSentences(content);
    const wellFormed = sentences.filter(s => 
      s.match(/^[A-Z]/) && s.match(/[.!?]$/) && s.length > 20
    );
    
    return wellFormed.length / Math.max(sentences.length, 1) > 0.7;
  }
  
  calculateVocabularyRichness(content) {
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    const uniqueWords = new Set(words);
    
    // Type-token ratio with length normalization
    const ttr = uniqueWords.size / Math.max(words.length, 1);
    const lengthFactor = Math.min(1, words.length / 100); // Normalize for text length
    
    return ttr * lengthFactor;
  }
  
  hasIntroduction(content) {
    const firstSentence = this.splitIntoSentences(content)[0] || '';
    const introductoryPhrases = [
      /^(?:this|the following|in this|here we|this (?:section|chapter|document))/i,
      /^(?:introduction|overview|summary):/i
    ];
    
    return introductoryPhrases.some(pattern => pattern.test(firstSentence));
  }
  
  hasConclusion(content) {
    const sentences = this.splitIntoSentences(content);
    const lastSentence = sentences[sentences.length - 1] || '';
    
    const conclusionPhrases = [
      /\b(?:in conclusion|therefore|thus|finally|in summary|to conclude)\b/i,
      /\b(?:overall|ultimately|consequently)\b/i
    ];
    
    return conclusionPhrases.some(pattern => pattern.test(lastSentence));
  }
  
  hasSupportingDetails(content) {
    const detailIndicators = [
      /\b(?:for example|specifically|namely|such as|including|e\.g\.)\b/i,
      /\b(?:first|second|third|furthermore|additionally|moreover)\b/i,
      /:\s*\n|\*\s|\d+\.\s/  // Lists or numbered items
    ];
    
    return detailIndicators.some(pattern => pattern.test(content));
  }
  
  isSelfContained(content) {
    // Check for references to external context
    const externalReferences = [
      /\b(?:as (?:mentioned|discussed|shown) (?:above|below|earlier|previously))\b/i,
      /\b(?:see (?:above|below|section|chapter))\b/i,
      /\b(?:the (?:following|previous|above|below))\b/i
    ];
    
    const hasExternalRefs = externalReferences.some(pattern => pattern.test(content));
    return !hasExternalRefs;
  }
  
  calculateMetadataCompleteness(metadata) {
    const requiredFields = ['source', 'title'];
    const optionalFields = ['author', 'date', 'category', 'section', 'tags'];
    
    const requiredScore = requiredFields.filter(field => metadata[field]).length / requiredFields.length;
    const optionalScore = optionalFields.filter(field => metadata[field]).length / optionalFields.length;
    
    return Math.round((requiredScore * 0.7 + optionalScore * 0.3) * 100);
  }
  
  isQuestionAnswerable(content) {
    // Check if content could answer common question types
    const questionTypes = [
      /\bwhat is\b/i,
      /\bhow (?:to|do|does)\b/i,
      /\bwhy\b/i,
      /\bwhen\b/i,
      /\bwhere\b/i
    ];
    
    // Content that defines, explains, or describes
    const answerPatterns = [
      /\bis\s+(?:a|an|the)\s+\w+/i,
      /\bcan be (?:defined|described) as\b/i,
      /\bmeans\s+that\b/i,
      /\brefers to\b/i
    ];
    
    return answerPatterns.some(pattern => pattern.test(content));
  }
  
  extractKeyConcepts(content) {
    // Extract key concepts using various patterns
    const concepts = [];
    
    // Capitalized terms
    const capitalizedTerms = content.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
    concepts.push(...capitalizedTerms);
    
    // Technical terms
    const technicalTerms = this.identifyTechnicalTerms(content);
    concepts.push(...technicalTerms);
    
    // Domain-specific terms (simplified)
    const domainPatterns = [
      /\b\w*(?:ology|ography|ometry|istics)\b/gi,
      /\b\w+(?:ing|tion|sion|ment)\b/gi
    ];
    
    domainPatterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      concepts.push(...matches);
    });
    
    return [...new Set(concepts.map(c => c.toLowerCase()))].slice(0, 20);
  }
  
  hasSearchFriendlyStructure(content) {
    // Check for search-friendly elements
    const friendlyElements = [
      /^[A-Z].*[.!?]$/, // Well-formed sentences
      /\b(?:definition|explanation|description|example)\b/i,
      /:\s*\n|\*\s|\d+\.\s/, // Lists
      /\b\w+\s*:\s*\w+/ // Key-value pairs
    ];
    
    return friendlyElements.some(pattern => pattern.test(content));
  }
  
  assessTagQuality(tags, content) {
    if (tags.length === 0) return { score: 0, issues: ['No tags provided'] };
    
    const issues = [];
    let score = 50;
    
    // Check tag relevance (simplified - count matches in content)
    const relevantTags = tags.filter(tag => 
      content.toLowerCase().includes(tag.toLowerCase())
    );
    
    if (relevantTags.length > 0) {
      score += (relevantTags.length / tags.length) * 30;
    } else {
      issues.push('Tags do not appear in content');
    }
    
    // Check tag count
    if (tags.length < 2) {
      issues.push('Too few tags');
      score -= 15;
    } else if (tags.length > 10) {
      issues.push('Too many tags');
      score -= 10;
    }
    
    // Check for very short tags
    const shortTags = tags.filter(tag => tag.length < 3);
    if (shortTags.length > 0) {
      issues.push('Some tags are too short');
      score -= 10;
    }
    
    return {
      score: Math.max(0, Math.min(100, score)),
      relevantTags: relevantTags.length,
      issues
    };
  }
  
  hasGoodKeywords(content) {
    const keywords = this.extractTopicKeywords(content.toLowerCase());
    return keywords.length > 5 && keywords.some(k => k.length > 4);
  }
  
  calculateConfidenceScore(sentenceCount, score) {
    // Higher confidence for longer content and more balanced scores
    const lengthFactor = Math.min(1, sentenceCount / 10);
    const scoreFactor = 1 - Math.abs(score - 75) / 75; // Penalty for extreme scores
    
    return Math.max(0.3, Math.min(1, lengthFactor * scoreFactor));
  }

  /**
   * Extract named entities (persons, organizations, etc.)
   */
  extractNamedEntities(text) {
    const entities = [];
    
    // Person names (enhanced patterns)
    const personPatterns = [
      /\b(?:Dr\.?|Mr\.?|Mrs\.?|Ms\.?|Prof\.?)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g,
      /\b[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g
    ];
    
    personPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => {
        if (this.isLikelyPersonName(match)) {
          entities.push({ 
            text: match.trim(), 
            type: 'PERSON', 
            confidence: this.calculatePersonNameConfidence(match),
            category: 'named_entity'
          });
        }
      });
    });
    
    // Organization names
    const orgPatterns = [
      /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Inc\.?|Corp\.?|LLC|Ltd\.?|Co\.?|Company|Corporation|Group|Institute|University|College)\b/g,
      /\b(?:Google|Microsoft|Apple|Amazon|Facebook|Meta|OpenAI|Anthropic|IBM|Intel|Oracle|Adobe|Salesforce|Netflix|Tesla)\b/g
    ];
    
    orgPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => {
        entities.push({ 
          text: match.trim(), 
          type: 'ORGANIZATION', 
          confidence: 0.8,
          category: 'named_entity'
        });
      });
    });
    
    return entities;
  }

  /**
   * Extract technical terms and domain-specific entities
   */
  extractTechnicalEntities(text) {
    const entities = [];
    
    // Programming languages and technologies
    const techTerms = [
      'JavaScript', 'Python', 'Java', 'C\\+\\+', 'C#', 'Ruby', 'PHP', 'Go', 'Rust', 'Swift',
      'React', 'Vue', 'Angular', 'Node\\.js', 'Express', 'Django', 'Flask', 'Rails',
      'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'GitHub', 'GitLab', 'Jenkins',
      'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Apache', 'Nginx',
      'AI', 'ML', 'NLP', 'GPT', 'BERT', 'transformer', 'neural network', 'deep learning'
    ];
    
    const techPattern = new RegExp(`\\b(?:${techTerms.join('|')})\\b`, 'gi');
    const matches = text.match(techPattern) || [];
    
    matches.forEach(match => {
      entities.push({
        text: match,
        type: 'TECHNOLOGY',
        confidence: 0.9,
        category: 'technical'
      });
    });
    
    return entities;
  }

  /**
   * Extract temporal entities (dates, times, periods)
   */
  extractTemporalEntities(text) {
    const entities = [];
    
    // Date patterns
    const datePatterns = [
      /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/g,
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
      /\b\d{4}-\d{2}-\d{2}\b/g
    ];
    
    datePatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => {
        entities.push({
          text: match.trim(),
          type: 'DATE',
          confidence: 0.9,
          category: 'temporal'
        });
      });
    });
    
    return entities;
  }

  /**
   * Extract quantitative entities (numbers, measurements, statistics)
   */
  extractQuantitativeEntities(text) {
    const entities = [];
    
    // Percentages
    const percentages = text.match(/\b\d+(?:\.\d+)?%\b/g) || [];
    percentages.forEach(pct => {
      entities.push({
        text: pct,
        type: 'PERCENTAGE',
        confidence: 0.95,
        category: 'quantitative'
      });
    });
    
    // Currency amounts
    const currency = text.match(/[\$£€¥]\d+(?:,\d{3})*(?:\.\d{2})?\b/g) || [];
    currency.forEach(amt => {
      entities.push({
        text: amt,
        type: 'MONEY',
        confidence: 0.9,
        category: 'quantitative'
      });
    });
    
    return entities;
  }

  /**
   * Extract geographic entities (countries, cities, addresses)
   */
  extractGeographicEntities(text) {
    const entities = [];
    
    // Common countries and cities
    const places = [
      'USA', 'United States', 'UK', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
      'New York', 'London', 'Paris', 'Tokyo', 'Berlin', 'Sydney', 'Toronto', 'San Francisco',
      'California', 'Texas', 'Florida'
    ];
    
    const placePattern = new RegExp(`\\b(?:${places.join('|')})\\b`, 'g');
    const matches = text.match(placePattern) || [];
    
    matches.forEach(match => {
      entities.push({
        text: match,
        type: 'LOCATION',
        confidence: 0.8,
        category: 'geographic'
      });
    });
    
    return entities;
  }

  /**
   * Extract contact information entities
   */
  extractContactEntities(text) {
    const entities = [];
    
    // Email addresses
    const emails = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [];
    emails.forEach(email => {
      entities.push({
        text: email,
        type: 'EMAIL',
        confidence: 0.95,
        category: 'contact'
      });
    });
    
    // URLs
    const urls = text.match(/https?:\/\/(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/g) || [];
    urls.forEach(url => {
      entities.push({
        text: url,
        type: 'URL',
        confidence: 0.95,
        category: 'contact'
      });
    });
    
    return entities;
  }

  /**
   * Enrich entities with additional metadata and remove duplicates
   */
  enrichAndDeduplicateEntities(entities, originalText) {
    // Remove duplicates based on text and type
    const seen = new Set();
    const uniqueEntities = entities.filter(entity => {
      const key = `${entity.text.toLowerCase()}_${entity.type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    
    // Enrich with additional metadata
    return uniqueEntities.map(entity => ({
      ...entity,
      length: entity.text.length,
      wordCount: entity.text.split(/\s+/).length,
      frequency: this.countEntityOccurrences(entity.text, entities)
    }));
  }

  /**
   * Enhanced person name detection
   */
  isLikelyPersonName(text) {
    const cleanText = text.replace(/^(?:Dr\.?|Mr\.?|Mrs\.?|Ms\.?|Prof\.?)\s+/, '');
    const words = cleanText.split(/\s+/);
    
    // Must have 2-4 words
    if (words.length < 2 || words.length > 4) return false;
    
    // All words must be capitalized
    if (!words.every(word => /^[A-Z][a-z]+$/.test(word))) return false;
    
    // Not common English words
    const commonWords = ['The', 'And', 'Or', 'But', 'For', 'With', 'About', 'From', 'This', 'That'];
    if (words.some(word => commonWords.includes(word))) return false;
    
    return true;
  }

  /**
   * Calculate confidence score for person names
   */
  calculatePersonNameConfidence(name) {
    let confidence = 0.5;
    
    // Has title
    if (/^(?:Dr\.?|Mr\.?|Mrs\.?|Ms\.?|Prof\.?)\s+/.test(name)) confidence += 0.3;
    
    // Two words (first + last name)
    const words = name.replace(/^(?:Dr\.?|Mr\.?|Mrs\.?|Ms\.?|Prof\.?)\s+/, '').split(/\s+/);
    if (words.length === 2) confidence += 0.2;
    
    // Common name patterns
    if (words.every(word => word.length >= 3 && word.length <= 12)) confidence += 0.1;
    
    return Math.min(0.95, confidence);
  }

  /**
   * Count entity occurrences for frequency analysis
   */
  countEntityOccurrences(entityText, allEntities) {
    return allEntities.filter(e => e.text.toLowerCase() === entityText.toLowerCase()).length;
  }
  
  /**
   * Simulate retrieval performance for the chunk
   */
  async simulateRetrieval(content, metadata) {
    try {
      const simulation = {
        queryTypes: [],
        expectedRelevanceScore: 0,
        retrievalRank: 0,
        similarityBenchmarks: {},
        performanceMetrics: {}
      };

      // Generate different types of queries that might match this content
      const queries = this.generateTestQueries(content);
      
      // Simulate retrieval performance for each query type
      for (const query of queries) {
        const performance = await this.simulateQueryRetrieval(content, query);
        simulation.queryTypes.push({
          query: query.text,
          type: query.type,
          expectedRank: performance.rank,
          relevanceScore: performance.relevance,
          confidence: performance.confidence
        });
      }

      // Calculate overall metrics
      simulation.expectedRelevanceScore = this.calculateAverageRelevance(simulation.queryTypes);
      simulation.retrievalRank = this.calculateAverageRank(simulation.queryTypes);
      
      // Benchmark against similar content types
      simulation.similarityBenchmarks = await this.benchmarkSimilarity(content, metadata);
      
      // Performance metrics for different vector stores
      simulation.performanceMetrics = this.calculatePlatformPerformanceMetrics(content, simulation);

      return simulation;

    } catch (error) {
      console.warn('Retrieval simulation failed:', error.message);
      return this.getDefaultRetrievalSimulation();
    }
  }

  /**
   * Generate test queries that might be used to retrieve this content
   */
  generateTestQueries(content) {
    const queries = [];
    const sentences = this.splitIntoSentences(content);
    const entities = this.extractEntities(content);
    const keywords = this.extractKeywords(content);

    // 1. Factual queries based on content
    if (entities.length > 0) {
      const topEntities = entities.slice(0, 3);
      topEntities.forEach(entity => {
        queries.push({
          text: `What is ${entity.text}?`,
          type: 'factual',
          source: 'entity',
          expectedRelevance: 0.8
        });
      });
    }

    // 2. Keyword-based queries
    if (keywords.length > 0) {
      const topKeywords = keywords.slice(0, 2);
      topKeywords.forEach(keyword => {
        queries.push({
          text: keyword,
          type: 'keyword',
          source: 'extraction',
          expectedRelevance: 0.7
        });
      });
    }

    // 3. Topic-based queries
    const mainTopic = this.inferMainTopic(content);
    if (mainTopic) {
      queries.push({
        text: `Tell me about ${mainTopic}`,
        type: 'topic',
        source: 'inference',
        expectedRelevance: 0.9
      });
    }

    // 4. Question-answerable queries
    if (this.isQuestionAnswerable(content)) {
      const questionContext = this.extractQuestionContext(content);
      queries.push({
        text: questionContext,
        type: 'qa',
        source: 'context',
        expectedRelevance: 0.85
      });
    }

    // 5. Semantic similarity queries (paraphrased content)
    const paraphrase = this.generateSimpleParaphrase(sentences[0] || content.substring(0, 100));
    queries.push({
      text: paraphrase,
      type: 'semantic',
      source: 'paraphrase',
      expectedRelevance: 0.75
    });

    return queries.slice(0, 10); // Limit to top 10 queries
  }

  /**
   * Simulate how well this content would be retrieved for a specific query
   */
  async simulateQueryRetrieval(content, query) {
    // Calculate text similarity metrics
    const exactMatch = this.calculateExactMatch(content, query.text);
    const keywordOverlap = this.calculateKeywordOverlap(content, query.text);
    const semanticSimilarity = await this.calculateSemanticSimilarity(content, query.text);
    
    // Simulate embedding similarity (if embeddings are available)
    let embeddingSimilarity = 0.5; // Default
    if (this.options.enableRealEmbeddings) {
      try {
        embeddingSimilarity = await this.calculateEmbeddingSimilarity(content, query.text);
      } catch (error) {
        // Fall back to heuristic similarity
        embeddingSimilarity = (keywordOverlap + semanticSimilarity) / 2;
      }
    }

    // Calculate composite relevance score
    const relevanceScore = Math.round(
      exactMatch * 0.1 +
      keywordOverlap * 0.3 +
      semanticSimilarity * 0.3 +
      embeddingSimilarity * 0.3
    );

    // Simulate ranking position (lower is better)
    const rank = this.calculateExpectedRank(relevanceScore, query.type);

    return {
      relevance: Math.max(0, Math.min(100, relevanceScore)),
      rank: rank,
      confidence: this.calculateRankingConfidence(relevanceScore, query),
      metrics: {
        exactMatch,
        keywordOverlap,
        semanticSimilarity,
        embeddingSimilarity
      }
    };
  }

  /**
   * Calculate semantic similarity between content and query
   */
  async calculateSemanticSimilarity(content, query) {
    // Simplified semantic similarity using word overlap and context
    const contentWords = content.toLowerCase().match(/\b\w+\b/g) || [];
    const queryWords = query.toLowerCase().match(/\b\w+\b/g) || [];
    
    const contentWordSet = new Set(contentWords);
    const queryWordSet = new Set(queryWords);
    
    const intersection = new Set([...contentWordSet].filter(x => queryWordSet.has(x)));
    const union = new Set([...contentWordSet, ...queryWordSet]);
    
    const jaccardSimilarity = intersection.size / union.size;
    
    // Adjust for context and word importance
    const contextBonus = this.calculateContextualBonus(content, query);
    const importanceWeight = this.calculateWordImportanceWeight(intersection, contentWords);
    
    return Math.round((jaccardSimilarity * 70 + contextBonus * 20 + importanceWeight * 10));
  }

  /**
   * Calculate embedding similarity between content and query
   */
  async calculateEmbeddingSimilarity(content, query) {
    if (!this.embeddingCapabilities.offlineModels) {
      throw new Error('Embedding capabilities not available');
    }

    try {
      // Generate embeddings for both content and query
      const contentWords = content.toLowerCase().match(/\b\w+\b/g) || [];
      const queryWords = query.toLowerCase().match(/\b\w+\b/g) || [];
      
      const contentEmbedding = await this.simulateEmbedding(contentWords, this.splitIntoSentences(content));
      const queryEmbedding = await this.simulateEmbedding(queryWords, [query]);
      
      // Calculate cosine similarity
      const similarity = this.cosineSimilarity(contentEmbedding, queryEmbedding);
      
      // Convert to percentage and adjust range
      return Math.round((similarity + 1) / 2 * 100); // Convert from [-1,1] to [0,100]

    } catch (error) {
      throw new Error(`Embedding similarity calculation failed: ${error.message}`);
    }
  }

  /**
   * Benchmark similarity against typical content types
   */
  async benchmarkSimilarity(content, metadata) {
    const benchmarks = {
      documentationType: this.classifyDocumentType(content, metadata),
      contentDensity: this.benchmarkContentDensity(content),
      structuralComplexity: this.benchmarkStructuralComplexity(content),
      domainSpecificity: this.benchmarkDomainSpecificity(content),
      comparativeMetrics: {}
    };

    // Compare against typical performance baselines
    const baselines = this.getPerformanceBaselines(benchmarks.documentationType);
    
    benchmarks.comparativeMetrics = {
      vsAverage: this.compareToBaseline(content, baselines.average),
      vsGood: this.compareToBaseline(content, baselines.good),
      vsExcellent: this.compareToBaseline(content, baselines.excellent)
    };

    return benchmarks;
  }

  /**
   * Calculate platform-specific performance metrics
   */
  calculatePlatformPerformanceMetrics(content, simulation) {
    const metrics = {};
    
    Object.keys(VECTOR_DB_CONFIGS).forEach(platform => {
      const config = VECTOR_DB_CONFIGS[platform];
      const contentMetrics = this.analyzeContentForPlatform(content, config);
      
      metrics[platform] = {
        estimatedLatency: this.estimateSearchLatency(contentMetrics, config),
        indexingScore: this.calculateIndexingScore(contentMetrics, config),
        retrievalAccuracy: this.estimateRetrievalAccuracy(simulation, config),
        memoryEfficiency: this.calculateMemoryEfficiency(contentMetrics, config),
        scalabilityScore: this.calculateScalabilityScore(contentMetrics, config)
      };
    });

    return metrics;
  }

  /**
   * Helper methods for retrieval simulation
   */
  calculateExactMatch(content, query) {
    return content.toLowerCase().includes(query.toLowerCase()) ? 100 : 0;
  }

  calculateKeywordOverlap(content, query) {
    const contentWords = new Set(content.toLowerCase().match(/\b\w+\b/g) || []);
    const queryWords = query.toLowerCase().match(/\b\w+\b/g) || [];
    
    const matchingWords = queryWords.filter(word => contentWords.has(word));
    return queryWords.length > 0 ? Math.round((matchingWords.length / queryWords.length) * 100) : 0;
  }

  calculateContextualBonus(content, query) {
    // Look for contextual clues that suggest relevance
    const contextClues = this.findContextualClues(content, query);
    return Math.min(30, contextClues.length * 5); // Max 30% bonus
  }

  calculateWordImportanceWeight(commonWords, contentWords) {
    // Simple importance weighting based on frequency
    let weightedScore = 0;
    commonWords.forEach(word => {
      const frequency = contentWords.filter(w => w === word).length;
      const importanceScore = Math.min(10, frequency * 2);
      weightedScore += importanceScore;
    });
    return Math.min(50, weightedScore); // Max 50% from word importance
  }

  calculateExpectedRank(relevanceScore, queryType) {
    // Simulate ranking position based on relevance and query type
    if (relevanceScore >= 90) return Math.floor(Math.random() * 3) + 1; // Top 3
    if (relevanceScore >= 80) return Math.floor(Math.random() * 7) + 1; // Top 10
    if (relevanceScore >= 70) return Math.floor(Math.random() * 15) + 5; // Top 20
    if (relevanceScore >= 60) return Math.floor(Math.random() * 30) + 10; // Top 40
    return Math.floor(Math.random() * 50) + 20; // Beyond top 20
  }

  calculateRankingConfidence(relevanceScore, query) {
    let confidence = relevanceScore / 100;
    
    // Adjust based on query type
    if (query.type === 'factual' && relevanceScore > 80) confidence += 0.1;
    if (query.type === 'semantic' && relevanceScore < 70) confidence -= 0.1;
    
    return Math.max(0.1, Math.min(0.95, confidence));
  }

  calculateAverageRelevance(queryResults) {
    if (queryResults.length === 0) return 0;
    return Math.round(queryResults.reduce((sum, result) => sum + result.relevanceScore, 0) / queryResults.length);
  }

  calculateAverageRank(queryResults) {
    if (queryResults.length === 0) return 100;
    return Math.round(queryResults.reduce((sum, result) => sum + result.expectedRank, 0) / queryResults.length);
  }

  getDefaultRetrievalSimulation() {
    return {
      queryTypes: [],
      expectedRelevanceScore: 50,
      retrievalRank: 25,
      similarityBenchmarks: {
        documentationType: 'unknown',
        contentDensity: 'medium',
        structuralComplexity: 'moderate'
      },
      performanceMetrics: {}
    };
  }

  // Additional helper methods for content analysis
  inferMainTopic(content) {
    // Simple topic inference based on most frequent meaningful words
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'are', 'as', 'was', 'with', 'for']);
    const meaningfulWords = words.filter(word => word.length > 3 && !stopWords.has(word));
    
    const frequency = {};
    meaningfulWords.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    const mostFrequent = Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 1)[0];
    
    return mostFrequent ? mostFrequent[0] : null;
  }

  generateSimpleParaphrase(sentence) {
    // Simple paraphrasing by word substitution and reordering
    return sentence
      .replace(/\bvery\b/g, 'extremely')
      .replace(/\bgood\b/g, 'excellent')
      .replace(/\bbad\b/g, 'poor')
      .replace(/\bfast\b/g, 'quick')
      .trim();
  }

  extractQuestionContext(content) {
    // Extract context that could answer common question patterns
    const sentences = this.splitIntoSentences(content);
    const firstSentence = sentences[0] || '';
    
    // Look for definition-like sentences
    if (firstSentence.includes(' is ') || firstSentence.includes(' are ')) {
      return `What ${firstSentence.split(' is ')[0]}?`;
    }
    
    // Look for process descriptions
    if (firstSentence.includes('how to') || firstSentence.includes('steps')) {
      return `How to ${firstSentence.substring(0, 50)}...`;
    }
    
    return `About ${content.substring(0, 30)}...`;
  }

  // Missing helper methods for retrieval simulation
  extractKeywords(content) {
    // Simple keyword extraction based on word frequency and importance
    const words = content.toLowerCase().match(/\b\w{3,}\b/g) || [];
    const stopWords = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'she', 'use', 'your', 'they', 'with', 'have', 'this', 'will', 'from', 'that', 'what', 'were', 'been', 'have', 'their', 'would', 'there', 'could', 'other']);
    
    const meaningfulWords = words.filter(word => !stopWords.has(word));
    const frequency = {};
    meaningfulWords.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  findContextualClues(content, query) {
    const clues = [];
    const queryWords = query.toLowerCase().split(/\s+/);
    const contentLower = content.toLowerCase();
    
    queryWords.forEach(word => {
      if (contentLower.includes(word)) {
        clues.push(word);
      }
    });
    
    return clues;
  }

  classifyDocumentType(content, metadata) {
    if (metadata?.fileType === 'pdf') return 'pdf_document';
    if (metadata?.fileType === 'markdown') return 'markdown_document';
    if (content.includes('function') || content.includes('class')) return 'code_documentation';
    if (content.includes('API') || content.includes('endpoint')) return 'api_documentation';
    return 'general_text';
  }

  benchmarkContentDensity(content) {
    const wordCount = content.split(/\s+/).length;
    const charCount = content.length;
    const avgWordLength = charCount / wordCount;
    
    if (avgWordLength > 7) return 'high';
    if (avgWordLength > 5) return 'medium';
    return 'low';
  }

  benchmarkStructuralComplexity(content) {
    const sentences = this.splitIntoSentences(content);
    const avgSentenceLength = content.split(/\s+/).length / sentences.length;
    
    if (avgSentenceLength > 20) return 'complex';
    if (avgSentenceLength > 12) return 'moderate';
    return 'simple';
  }

  benchmarkDomainSpecificity(content) {
    const technicalTerms = ['API', 'function', 'class', 'method', 'parameter', 'algorithm', 'database', 'server'];
    const matches = technicalTerms.filter(term => content.toLowerCase().includes(term.toLowerCase())).length;
    
    if (matches > 5) return 'highly_technical';
    if (matches > 2) return 'moderately_technical';
    return 'general';
  }

  getPerformanceBaselines(documentType) {
    const baselines = {
      'pdf_document': { average: 65, good: 80, excellent: 90 },
      'markdown_document': { average: 70, good: 85, excellent: 95 },
      'code_documentation': { average: 75, good: 85, excellent: 90 },
      'api_documentation': { average: 80, good: 90, excellent: 95 },
      'general_text': { average: 60, good: 75, excellent: 85 }
    };
    
    return baselines[documentType] || baselines['general_text'];
  }

  compareToBaseline(content, baseline) {
    const wordCount = content.split(/\s+/).length;
    const score = Math.min(100, (wordCount / 100) * baseline);
    return Math.round(score);
  }

  analyzeContentForPlatform(content, config) {
    return {
      length: content.length,
      wordCount: content.split(/\s+/).length,
      optimalForPlatform: content.length >= config.optimalChunkSize.min && content.length <= config.optimalChunkSize.max
    };
  }

  estimateSearchLatency(contentMetrics, config) {
    const baseLatency = config.searchType === 'hybrid_search' ? 150 : 100;
    const sizeAdjustment = contentMetrics.length > 1000 ? 50 : 0;
    return baseLatency + sizeAdjustment;
  }

  calculateIndexingScore(contentMetrics, config) {
    let score = 80;
    if (contentMetrics.optimalForPlatform) score += 10;
    if (contentMetrics.wordCount >= 50) score += 10;
    return Math.min(100, score);
  }

  estimateRetrievalAccuracy(simulation, config) {
    const baseAccuracy = config.searchType === 'hybrid_search' ? 85 : 75;
    const simulationBonus = simulation.expectedRelevanceScore > 70 ? 10 : 0;
    return Math.min(95, baseAccuracy + simulationBonus);
  }

  calculateMemoryEfficiency(contentMetrics, config) {
    const efficiency = Math.max(50, 100 - (contentMetrics.length / config.maxTokens) * 100);
    return Math.round(efficiency);
  }

  calculateScalabilityScore(contentMetrics, config) {
    let score = 75;
    if (contentMetrics.optimalForPlatform) score += 15;
    if (config.metadataSupport === 'extensive') score += 10;
    return Math.min(100, score);
  }

  // Simplified entity recognition helpers (for backward compatibility)
  isPersonName(text) {
    // Very basic person name detection
    return /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+$/.test(text) && text.split(' ').length <= 4;
  }
  
  isOrganizationName(text) {
    // Basic organization name detection
    const orgIndicators = ['Inc', 'Corp', 'LLC', 'Ltd', 'Company', 'Organization', 'Foundation'];
    return orgIndicators.some(indicator => text.includes(indicator)) ||
           /^[A-Z]+(?:\s+[A-Z]+)*$/.test(text); // All caps organizations
  }
  
  isLocationName(text) {
    // Basic location detection (would need proper NER in practice)
    const locationIndicators = ['City', 'County', 'State', 'Country', 'Avenue', 'Street', 'Road'];
    return locationIndicators.some(indicator => text.includes(indicator));
  }
  
  isTechnicalTerm(word) {
    const technicalSuffixes = ['tion', 'sion', 'ment', 'ness', 'ity', 'ism', 'ing'];
    return technicalSuffixes.some(suffix => word.endsWith(suffix)) ||
           word.length > 8 ||
           word.includes('_') ||
           /^[A-Z]{2,}$/.test(word);
  }
  
  isBusinessTerm(word) {
    const businessTerms = [
      'strategy', 'management', 'business', 'market', 'customer', 'revenue',
      'profit', 'investment', 'finance', 'budget', 'sales', 'marketing'
    ];
    return businessTerms.includes(word.toLowerCase());
  }
}

export default EnhancedVectorReadinessAnalyzer;