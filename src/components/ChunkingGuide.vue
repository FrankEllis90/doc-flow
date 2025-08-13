<template>
  <div :class="isDesktopMode ? 'chunking-guide-desktop p-6 mb-6' : 'chunking-guide card-sage soft-shadow p-6 mb-6'">
    <div class="flex items-start space-x-4">
      <div class="flex-shrink-0">
        <div :class="isDesktopMode ? 'sage-icon-desktop' : 'bg-sage rounded-full p-2'">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      </div>
      <div class="flex-1">
        <h3 class="text-lg font-semibold mb-2" style="color: var(--neutral-text);">
          <i class="fas fa-book mr-2"></i>What is Document Chunking?
        </h3>
        <p class="mb-4 leading-relaxed" style="color: var(--neutral-text);">
          Document chunking breaks your long documents into smaller, digestible pieces that AI systems can better understand and search through. 
          Think of it like organizing a library - instead of having one massive book, you have organized chapters that are easier to find and reference.
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div :class="isDesktopMode ? 'chunking-method-card-desktop' : 'rounded-brand p-4 border-l-4 border-sage'">
            <h4 :class="isDesktopMode ? 'chunking-method-title-desktop' : 'font-semibold text-sage-dark mb-2'"><i class="fas fa-cut mr-1"></i>By Words</h4>
            <p :class="isDesktopMode ? 'chunking-method-text-desktop' : 'text-sm'" style="color: #64748b;">Splits content every X words. Best for consistent chunk sizes. Recommended: 300-800 words.</p>
          </div>
          <div :class="isDesktopMode ? 'chunking-method-card-desktop gold-accent' : 'rounded-brand p-4 border-l-4 border-gold'">
            <h4 :class="isDesktopMode ? 'chunking-method-title-desktop gold' : 'font-semibold text-gold mb-2'"><i class="fas fa-keyboard mr-1"></i>By Characters</h4>  
            <p :class="isDesktopMode ? 'chunking-method-text-desktop' : 'text-sm'" style="color: #64748b;">Splits by character count. More precise control. Recommended: 1500-4000 characters.</p>
          </div>
          <div :class="isDesktopMode ? 'chunking-method-card-desktop' : 'rounded-brand p-4 border-l-4 border-sage-dark'">
            <h4 :class="isDesktopMode ? 'chunking-method-title-desktop' : 'font-semibold text-sage-dark mb-2'"><i class="fas fa-list mr-1"></i>By Sections</h4>
            <p :class="isDesktopMode ? 'chunking-method-text-desktop' : 'text-sm'" style="color: #64748b;">Splits at headings (# ## ###). Preserves document structure. Best for organized content.</p>
          </div>
        </div>

        <div :class="isDesktopMode ? 'ai-info-card-desktop' : 'rounded-brand p-4 border border-sage-light'">
          <h4 :class="isDesktopMode ? 'ai-info-title-desktop' : 'font-semibold text-sage-dark mb-2'"><i class="fas fa-robot mr-1"></i>Why Does This Matter for AI?</h4>
          <p :class="isDesktopMode ? 'ai-info-text-desktop' : 'text-sm mb-2'" style="color: #1e293b;">
            AI systems work best with focused, relevant information. When you ask a question, the AI searches through your chunks to find the most relevant pieces, then uses those to generate accurate answers.
          </p>
          <div :class="isDesktopMode ? 'ai-benefits-desktop' : 'flex items-center space-x-2 text-sm text-sage-dark'">
            <span><i class="fas fa-check mr-1" style="color: #A8B79D;"></i>Better search accuracy</span>
            <span><i class="fas fa-check mr-1" style="color: #A8B79D;"></i>Faster responses</span>
            <span><i class="fas fa-check mr-1" style="color: #A8B79D;"></i>More relevant answers</span>
          </div>
        </div>

        <button 
          @click="showAdvanced = !showAdvanced"
          class="mt-4 text-sage hover-sage-dark text-sm font-medium flex items-center transition-colors"
        >
          <span>{{ showAdvanced ? 'Hide' : 'Show' }} Advanced Tips</span>
          <svg class="w-4 h-4 ml-1 transform transition-transform" :class="{ 'rotate-180': showAdvanced }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>

        <div v-if="showAdvanced" class="mt-4 rounded-brand p-4 border border-sage" style="background-color: var(--color-neutral-50);">
          <h4 class="font-semibold mb-3" style="color: var(--color-neutral-800);"><i class="fas fa-tools mr-1"></i>Advanced Chunking Tips</h4>
          <div class="space-y-3 text-sm" style="color: var(--color-neutral-700);">
            <div class="flex items-start space-x-2">
              <i class="fas fa-circle text-sage text-xs mr-2 mt-1"></i>
              <div>
                <strong>Overlap:</strong> Creates redundancy between chunks so important information isn't lost at boundaries. 
                Recommended: 10-20% of chunk size.
              </div>
            </div>
            <div class="flex items-start space-x-2">
              <i class="fas fa-circle text-gold text-xs mr-2 mt-1"></i>
              <div>
                <strong>Tags:</strong> Add keywords that describe the content. This helps AI find relevant chunks faster.
                Example: "pricing", "features", "setup-guide".
              </div>
            </div>
            <div class="flex items-start space-x-2">
              <i class="fas fa-circle text-sage-dark text-xs mr-2 mt-1"></i>
              <div>
                <strong>Optimal Size:</strong> Too small = lost context. Too large = irrelevant information. 
                Sweet spot: 2-3 paragraphs per chunk.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChunkingGuide',
  props: {
    isDesktopMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showAdvanced: false
    };
  }
};
</script>

<style scoped>
/* Desktop styling for ChunkingGuide */
.chunking-guide-desktop {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(168, 183, 157, 0.2);
  box-shadow: 0 8px 32px rgba(168, 183, 157, 0.1);
}

.sage-icon-desktop {
  background: linear-gradient(135deg, #A8B79D 0%, #8CA085 100%);
  border-radius: 50%;
  padding: 8px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chunking-method-card-desktop {
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(168, 183, 157, 0.2);
  border-left: 4px solid #A8B79D;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
}

.chunking-method-card-desktop.gold-accent {
  border-left-color: #D4AF37;
}

.chunking-method-card-desktop:hover {
  background: rgba(168, 183, 157, 0.05);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(168, 183, 157, 0.15);
}

.chunking-method-title-desktop {
  font-size: 0.875rem;
  font-weight: 600;
  color: #A8B79D;
  margin-bottom: 8px;
}

.chunking-method-title-desktop.gold {
  color: #D4AF37;
}

.chunking-method-text-desktop {
  font-size: 0.75rem;
  line-height: 1.4;
}

.ai-info-card-desktop {
  background: linear-gradient(135deg, rgba(168, 183, 157, 0.08) 0%, rgba(248, 250, 252, 0.9) 100%);
  border: 1px solid rgba(168, 183, 157, 0.2);
  border-radius: 12px;
  padding: 16px;
}

.ai-info-title-desktop {
  font-size: 1rem;
  font-weight: 600;
  color: #A8B79D;
  margin-bottom: 8px;
}

.ai-info-text-desktop {
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 12px;
}

.ai-benefits-desktop {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 0.75rem;
  color: #64748b;
}

.ai-benefits-desktop span {
  display: flex;
  align-items: center;
}
</style>