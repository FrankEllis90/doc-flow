<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="welcome-header">
          <div class="hero-badge">
            <i class="fas fa-rocket"></i>
            <span>Enterprise AI Platform</span>
          </div>
          <h1 class="hero-title">
            Welcome to <span class="brand-highlight">Doc Layer</span>
          </h1>
          <p class="hero-subtitle">
            Transform your documents into AI-ready knowledge bases with enterprise-grade processing
          </p>
          
          <!-- Primary CTA - Above the fold -->
          <div class="hero-cta-section">
            <button @click="navigateTo('manual-builder')" class="hero-primary-cta">
              <div class="cta-content">
                <i class="fas fa-play"></i>
                <span class="cta-text">Start Building Now</span>
                <span class="cta-subtitle">Create your first AI-ready dataset</span>
              </div>
              <div class="cta-glow"></div>
            </button>
            <button @click="navigateTo('document-processing')" class="hero-secondary-cta">
              <i class="fas fa-upload"></i>
              <span>Upload Documents</span>
            </button>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="quick-actions">
          <FeatureCard
            title="Manual Content Builder"
            description="Create and chunk content manually with full control"
            icon="fas fa-pencil-alt"
            :features="['Real-time preview', 'Custom chunking', 'Quality analysis']"
            action-text="Start Building"
            :interactive="true"
            :highlighted="true"
            @click="navigateTo('manual-builder')"
          />
          
          <FeatureCard
            title="Document Processing"
            description="Process PDF, Markdown, and text files in batch"
            icon="fas fa-file-alt"
            :features="['Batch processing', 'Multiple formats', 'Auto-chunking']"
            action-text="Process Files"
            :interactive="true"
            @click="navigateTo('document-processing')"
          />
        </div>
      </div>
      
      <!-- Contextual Help Panel -->
      <div class="contextual-help-panel">
        <div class="help-panel-header">
          <h3 class="help-panel-title">
            <i class="fas fa-lightbulb"></i>
            Quick Tips
          </h3>
          <span class="help-panel-badge">AI Powered</span>
        </div>
        
        <div class="help-tips-list">
          <div class="help-tip">
            <div class="tip-icon">
              <i class="fas fa-rocket"></i>
            </div>
            <div class="tip-content">
              <h4>Start with 500-word chunks</h4>
              <p>This size works best for most AI models and vector databases</p>
            </div>
          </div>
          
          <div class="help-tip">
            <div class="tip-icon">
              <i class="fas fa-overlap"></i>
            </div>
            <div class="tip-content">
              <h4>Use 10-20% overlap</h4>
              <p>Prevents important information from being split between chunks</p>
            </div>
          </div>
          
          <div class="help-tip">
            <div class="tip-icon">
              <i class="fas fa-tags"></i>
            </div>
            <div class="tip-content">
              <h4>Enable auto-tagging</h4>
              <p>Improves searchability and organization in vector stores</p>
            </div>
          </div>
          
          <div class="help-tip">
            <div class="tip-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="tip-content">
              <h4>Check quality scores</h4>
              <p>Ensure high readability before exporting to AI platforms</p>
            </div>
          </div>
        </div>
        
        <div class="help-panel-footer">
          <button class="help-action-btn" @click="navigateTo('manual-builder')">
            <i class="fas fa-play"></i>
            Get Started
          </button>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats-section">
      <div class="stats-grid">
        <StatsCard
          :value="stats.documentsProcessed"
          label="Documents Processed"
          icon="fas fa-file-alt"
          :interactive="true"
          empty-state-message="No documents processed yet — upload your first file to see insights here"
          empty-state-action="Upload Files"
          @click="navigateTo('document-processing')"
          @empty-action="navigateTo('document-processing')"
        />
        
        <StatsCard
          :value="stats.totalChunks"
          label="Chunks Created"
          icon="fas fa-cube"
          :interactive="true"
          empty-state-message="No content chunks created — start building to see your progress"
          empty-state-action="Start Building"
          @click="navigateTo('manual-builder')"
          @empty-action="navigateTo('manual-builder')"
        />
        
        <StatsCard
          :value="stats.versionsCount"
          label="Saved Versions"
          icon="fas fa-code-branch"
          :interactive="true"
          empty-state-message="No versions saved yet — create your first dataset to track changes"
          empty-state-action="Create Dataset"
          @click="navigateTo('versions')"
          @empty-action="navigateTo('manual-builder')"
        />
        
        <StatsCard
          :value="stats.exportsCount"
          label="Exports Generated"
          icon="fas fa-download"
          :interactive="true"
          empty-state-message="No exports created — process content to generate AI-ready datasets"
          empty-state-action="Get Started"
          @empty-action="navigateTo('manual-builder')"
        />
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <h2 class="section-title">Platform Features</h2>
      <div class="features-grid">
        <div class="feature-card feature-card--primary">
          <div class="feature-icon sage">
            <i class="fas fa-brain"></i>
          </div>
          <div class="feature-title-section">
            <h3>AI-Optimized Chunking</h3>
            <HelpTooltip
              content="Chunking breaks documents into smaller pieces that AI models can process effectively. Our algorithm uses semantic boundaries, optimal size limits (300-800 words), and configurable overlap to ensure no information is lost between chunks. This maximizes retrieval accuracy in vector databases."
              title="Text Chunking for AI"
              position="bottom"
              theme="brand"
              :show-learn-more="true"
              learn-more-url="https://docs.pinecone.io/guides/data/understanding-hybrid-search"
            />
          </div>
          <p>Intelligent text segmentation designed for vector databases and LLM training</p>
          <div class="feature-priority-badge">Most Used</div>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon gold">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="feature-title-section">
            <h3>Quality Analysis</h3>
            <HelpTooltip
              content="Analyzes text quality using readability metrics (Flesch-Kincaid, SMOG, ARI), semantic coherence, and information density. This ensures your content meets standards for AI training and provides actionable suggestions for improvement before export."
              title="Quality Metrics Explained"
              position="bottom"
              theme="brand"
              :show-learn-more="true"
              learn-more-url="https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests"
            />
          </div>
          <p>Real-time readability scoring and semantic coherence evaluation</p>
        </div>
        
        <div class="feature-card feature-card--primary">
          <div class="feature-icon sage">
            <i class="fas fa-share-alt"></i>
          </div>
          <div class="feature-title-section">
            <h3>Multi-Platform Export</h3>
            <HelpTooltip
              content="Exports data in formats optimized for specific AI platforms. Azure Vector Store uses JSON with embeddings metadata, OpenAI fine-tuning requires JSONL format, while Pinecone and ChromaDB have their own vector database schemas. Each format includes the necessary metadata for optimal performance."
              title="Export Format Compatibility"
              position="bottom"
              theme="brand"
            />
          </div>
          <p>Support for Azure, OpenAI, Pinecone, ChromaDB, and more</p>
          <div class="feature-priority-badge">Essential</div>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon gold">
            <i class="fas fa-shield-alt"></i>
          </div>
          <h3>Privacy-First</h3>
          <p>100% local processing with enterprise-grade security</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon sage">
            <i class="fas fa-history"></i>
          </div>
          <h3>Version Control</h3>
          <p>Complete history tracking with instant rollback capabilities</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon gold">
            <i class="fas fa-tachometer-alt"></i>
          </div>
          <h3>High Performance</h3>
          <p>Process thousands of documents with optimized memory management</p>
        </div>
      </div>
    </section>

    <!-- Getting Started Section -->
    <section class="getting-started">
      <div class="start-card">
        <h2>Getting Started</h2>
        <div class="steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>Choose Your Method</h4>
              <p>Manual content creation or batch document processing</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>Configure Processing</h4>
              <p>Set chunk size, overlap, and processing parameters</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>Export & Integrate</h4>
              <p>Export to your preferred AI platform format</p>
            </div>
          </div>
        </div>
        
        <div class="start-actions">
          <button @click="navigateTo('manual-builder')" class="btn-primary">
            <i class="fas fa-play"></i>
            Start Building
          </button>
          <button @click="showTutorial" class="btn-secondary">
            <i class="fas fa-video"></i>
            Watch Tutorial
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useChunksStore } from '@/stores/chunks'
import { useVersionStore } from '@/stores/versions'
import FeatureCard from '@/components/ui/FeatureCard.vue'
import StatsCard from '@/components/ui/StatsCard.vue'
import HelpTooltip from '@/components/ui/HelpTooltip.vue'

const appStore = useAppStore()
const chunksStore = useChunksStore()
const versionStore = useVersionStore()

// Stats with proper fallbacks for empty states
const stats = computed(() => ({
  documentsProcessed: Number(chunksStore.processedDocuments) || 0,
  totalChunks: Array.isArray(chunksStore.chunks) ? chunksStore.chunks.length : 0,
  versionsCount: Number(versionStore.versionStats?.total) || 0,
  exportsCount: Number(versionStore.versionStats?.exported) || 0
}))

const hasActivity = computed(() => {
  return stats.value.totalChunks > 0 || stats.value.versionsCount > 0
})

// Navigation
const navigateTo = (route: string) => {
  appStore.setCurrentNavigation(route)
  appStore.addToNavigationHistory(route)
}

const showTutorial = () => {
  // Placeholder for tutorial functionality
  console.log('Tutorial feature coming soon')
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%);
  padding: 0;
  margin: 0;
}

/* Hero Section */
.hero-section {
  padding: 3rem 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  max-width: 1400px;
  margin: 0 auto;
  align-items: center;
}

@media (max-width: 1024px) {
  .hero-section {
    grid-template-columns: 1fr;
    text-align: center;
  }
}

.hero-content {
  animation: fadeInUp 0.6s ease;
}

.welcome-header {
  padding: 56px 48px 48px 48px;
  background: linear-gradient(135deg, var(--brand-sage, #A8B79D) 0%, var(--brand-sage-light, #F5F7F4) 35%, #FFFFFF 75%, rgba(255, 255, 255, 0.98) 100%);
  border-radius: 24px;
  margin-bottom: 48px;
  border: 1px solid rgba(168, 183, 157, 0.2);
  box-shadow: 
    0 16px 48px rgba(168, 183, 157, 0.15),
    0 4px 16px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.welcome-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--brand-sage, #A8B79D) 0%, var(--bg-cta-primary, #E6B800) 50%, var(--brand-sage, #A8B79D) 100%);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(168, 183, 157, 0.1);
  border: 1px solid #A8B79D;
  border-radius: 24px;
  font-size: 0.875rem;
  color: #8CA085;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.hero-badge i {
  font-size: 1rem;
}

.hero-title {
  font-size: 4rem;
  font-weight: 900;
  color: #0F172A;
  margin: 0 0 24px 0;
  line-height: 1.05;
  letter-spacing: -0.025em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.brand-highlight {
  background: linear-gradient(135deg, #A8B79D 0%, #8CA085 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.4rem;
  color: #374151;
  margin: 0 0 3rem 0;
  line-height: 1.5;
  font-weight: 500;
  max-width: 600px;
}

/* Hero CTA Section */
.hero-cta-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.hero-primary-cta {
  position: relative;
  background: linear-gradient(135deg, var(--bg-cta-primary, #E6B800) 0%, #D4AF37 100%);
  color: var(--text-cta-primary, #FFFFFF);
  border: none;
  padding: 20px 32px;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 8px 32px rgba(230, 184, 0, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-width: 280px;
}

.hero-primary-cta:hover {
  transform: translateY(-3px);
  box-shadow: 
    0 12px 40px rgba(230, 184, 0, 0.5),
    0 4px 16px rgba(0, 0, 0, 0.15);
}

.hero-primary-cta:hover .cta-glow {
  opacity: 1;
  transform: scale(1.2);
}

.cta-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  position: relative;
  z-index: 2;
}

.cta-content i {
  font-size: 20px;
  margin-bottom: 4px;
}

.cta-text {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
}

.cta-subtitle {
  font-size: 13px;
  opacity: 0.9;
  font-weight: 500;
  line-height: 1.2;
}

.cta-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  transform: translate(-50%, -50%) scale(0.8);
  opacity: 0;
  transition: all 0.3s ease;
  border-radius: 16px;
  pointer-events: none;
}

.hero-secondary-cta {
  background: rgba(255, 255, 255, 0.9);
  color: var(--text-primary, #1F2937);
  border: 2px solid rgba(168, 183, 157, 0.3);
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(10px);
}

.hero-secondary-cta:hover {
  background: rgba(255, 255, 255, 1);
  border-color: var(--brand-sage, #A8B79D);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(168, 183, 157, 0.2);
}

/* Quick Actions */
.quick-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-card {
  flex: 1;
  min-width: 250px;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.action-card.primary {
  background: linear-gradient(135deg, #A8B79D 0%, #8CA085 100%);
  border: none;
  color: white;
}

.action-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  flex-shrink: 0;
}

.action-card:not(.primary) .action-icon {
  background: rgba(168, 183, 157, 0.1);
}

.action-icon i {
  font-size: 20px;
  color: currentColor;
}

.action-card:not(.primary) .action-icon i {
  color: #8CA085;
}

.action-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.action-content p {
  font-size: 0.875rem;
  margin: 0;
  opacity: 0.9;
}

.action-card:not(.primary) .action-content p {
  color: #6B7280;
}

.action-arrow {
  margin-left: auto;
  font-size: 14px;
  opacity: 0.6;
}

/* Contextual Help Panel */
.contextual-help-panel {
  background: linear-gradient(135deg, #FFFFFF 0%, var(--brand-sage-light, #F5F7F4) 100%);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(168, 183, 157, 0.2);
  box-shadow: 
    0 8px 24px rgba(168, 183, 157, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.05);
  animation: fadeIn 1s ease 0.3s both;
  height: fit-content;
  position: sticky;
  top: 24px;
}

@media (max-width: 1024px) {
  .contextual-help-panel {
    display: none;
  }
}

.help-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.help-panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.125rem;
  font-weight: 700;
  color: #0F172A;
  margin: 0;
}

.help-panel-title i {
  color: var(--bg-cta-primary, #E6B800);
}

.help-panel-badge {
  background: rgba(168, 183, 157, 0.1);
  color: var(--brand-sage-dark, #8CA085);
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.help-tips-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.help-tip {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(168, 183, 157, 0.1);
  transition: all 0.2s ease;
}

.help-tip:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(168, 183, 157, 0.2);
  transform: translateY(-1px);
}

.tip-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(168, 183, 157, 0.1);
  border-radius: 8px;
  color: var(--brand-sage-dark, #8CA085);
  flex-shrink: 0;
}

.tip-icon i {
  font-size: 14px;
}

.tip-content h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0F172A;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.tip-content p {
  font-size: 0.8125rem;
  color: #4B5563;
  margin: 0;
  line-height: 1.4;
}

.help-panel-footer {
  padding-top: 16px;
  border-top: 1px solid rgba(168, 183, 157, 0.1);
}

.help-action-btn {
  width: 100%;
  background: linear-gradient(135deg, var(--brand-sage, #A8B79D) 0%, var(--brand-sage-dark, #8CA085) 100%);
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.help-action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(168, 183, 157, 0.3);
}

/* Stats Section */
.stats-section {
  padding: 48px 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  align-items: stretch;
}


/* Features Section */
.features-section {
  padding: 48px 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.section-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: #1F2937;
  text-align: center;
  margin: 0 0 48px 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  align-items: stretch;
}

.feature-card {
  padding: 2.5rem;
  background: linear-gradient(135deg, rgba(247, 248, 249, 0.8) 0%, rgba(241, 245, 249, 0.6) 100%);
  border-radius: 20px;
  border: 1px solid rgba(168, 183, 157, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  opacity: 0.85;
}

.feature-card--primary {
  background: linear-gradient(135deg, #FFFFFF 0%, var(--brand-sage-light, #F5F7F4) 100%);
  border: 1px solid rgba(168, 183, 157, 0.2);
  box-shadow: 
    0 8px 24px rgba(168, 183, 157, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.05);
  opacity: 1;
  transform: scale(1.02);
}

.feature-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  opacity: 1;
}

.feature-card--primary:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 16px 40px rgba(168, 183, 157, 0.20);
  border-color: var(--brand-sage, #A8B79D);
}

.feature-priority-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, var(--bg-cta-primary, #E6B800) 0%, #D4AF37 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(230, 184, 0, 0.3);
}

.feature-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 16px rgba(168, 183, 157, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.feature-icon.sage {
  background: linear-gradient(135deg, var(--brand-sage, #A8B79D) 0%, var(--brand-sage-dark, #8CA085) 100%);
  color: white;
}

.feature-icon.gold {
  background: linear-gradient(135deg, var(--bg-cta-primary, #E6B800) 0%, var(--bg-cta-primary-hover, #CC9F00) 100%);
  color: white;
}

.feature-icon i {
  font-size: 28px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.feature-title-section {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0.75rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0F172A;
  margin: 0;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.feature-card p {
  font-size: 1rem;
  color: #374151;
  margin: 0;
  line-height: 1.7;
  font-weight: 400;
  margin-top: 12px;
}

/* Getting Started */
.getting-started {
  padding: 48px 24px;
  max-width: 900px;
  margin: 0 auto;
}

.start-card {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.start-card h2 {
  font-size: 2.25rem;
  font-weight: 800;
  color: #0F172A;
  margin: 0 0 2.5rem 0;
  text-align: center;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.steps {
  display: flex;
  gap: 24px;
  margin-bottom: 48px;
}

@media (max-width: 768px) {
  .steps {
    flex-direction: column;
  }
}

.step {
  flex: 1;
  display: flex;
  gap: 1rem;
}

.step-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #A8B79D 0%, #8CA085 100%);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content h4 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0F172A;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.step-content p {
  font-size: 1rem;
  color: #4B5563;
  margin: 0;
  line-height: 1.6;
}

.start-actions {
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: var(--bg-cta-primary, #E6B800);
  color: var(--text-cta-primary, #FFFFFF);
  box-shadow: 0 4px 16px rgba(230, 184, 0, 0.3);
  border: none;
}

.btn-primary:hover {
  background: var(--bg-cta-primary-hover, #CC9F00);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(230, 184, 0, 0.4);
}

.btn-secondary {
  background: white;
  color: #6B7280;
  border: 1px solid #E5E7EB;
}

.btn-secondary:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

</style>