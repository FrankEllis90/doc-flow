<template>
  <div class="home-page">
    <!-- Page container with vibrant design -->
    <section class="container mx-auto px-4 lg:px-6 2xl:px-8 py-6 lg:py-8">
      <div class="grid grid-cols-12 gap-4 lg:gap-6">
        
        <!-- HERO SECTION - Gold Wave Background -->
        <article class="col-span-12 lg:col-span-7 rounded-2xl shadow-2xl relative overflow-hidden hero-container">
          <!-- Animated gradient border -->
          <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-emerald-500 animate-gradient z-20"></div>
          
          <!-- Gold Wave Background with CSS -->
          <div class="hero-wave-background"></div>
          
          <!-- White Overlay for Text Readability (using ::before pseudo-element in CSS) -->
          
          <!-- Floating accent orbs for depth -->
          <div class="absolute top-10 right-10 w-32 h-32 rounded-full bg-gradient-to-br from-amber-400/20 to-yellow-400/20 blur-2xl animate-float"></div>
          <div class="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-gradient-to-tr from-emerald-400/15 to-cyan-400/15 blur-2xl animate-float-delayed"></div>
          
          <div class="relative p-8 z-10">
            <!-- Status badges with colors -->
            <div class="flex items-center gap-3 text-sm mb-6">
              <span class="badge bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                <i class="fas fa-rocket mr-1"></i>
                Enterprise AI Platform
              </span>
              <span v-if="hasActivity" class="badge bg-gradient-to-r from-sky-500 to-sky-600 text-white animate-pulse">
                <i class="fas fa-check-circle mr-1"></i>
                AI Ready
              </span>
              <span v-else class="badge bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <i class="fas fa-cog mr-1 animate-spin-slow"></i>
                Getting Started
              </span>
            </div>

            <!-- Enhanced hero title with stronger contrast -->
            <h1 class="text-5xl lg:text-6xl font-black text-gray-900 mb-3 animate-fade-in drop-shadow-sm">
              Welcome to <span class="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Doc Layer</span>
            </h1>

            <p class="text-lg text-gray-800 max-w-[60ch] mb-7 font-medium">
              Transform your documents into <span class="font-bold text-emerald-700">AI-ready knowledge bases</span> with enterprise-grade processing.
            </p>

            <!-- High-contrast CTAs -->
            <div class="flex flex-col sm:flex-row gap-3">
              <button @click="navigateTo('manual-builder')" class="btn-hero-primary group">
                <i class="fas fa-play mr-2 group-hover:animate-bounce"></i>
                Start Building Now
              </button>
              <button @click="navigateTo('document-processing')" class="btn-hero-secondary">
                <i class="fas fa-upload mr-2"></i>
                Upload Documents
              </button>
            </div>
          </div>
        </article>

        <!-- QUICK TIPS - Filled with Actionable Content -->
        <aside class="col-span-12 lg:col-span-5 rounded-2xl bg-gradient-to-br from-white to-sky-50 ring-1 ring-gray-100 shadow-lg">
          <header class="px-6 pt-6 pb-4 border-b border-sky-100">
            <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span class="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                <i class="fas fa-lightbulb text-white text-sm"></i>
              </span>
              Pro Tips
            </h2>
          </header>
          
          <!-- Rich tip content -->
          <div class="p-4 space-y-3">
            <div class="tip-card group">
              <div class="tip-icon bg-emerald-100 text-emerald-600">
                <i class="fas fa-rocket"></i>
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900">Optimal Chunk Size</h4>
                <p class="text-xs text-gray-600 mt-0.5">500-800 words works best for GPT-4 and Claude</p>
                <a href="#" class="text-xs text-emerald-600 hover:text-emerald-700 font-medium mt-1 inline-block">Learn why →</a>
              </div>
            </div>
            
            <div class="tip-card group">
              <div class="tip-icon bg-sky-100 text-sky-600">
                <i class="fas fa-link"></i>
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900">Smart Overlap</h4>
                <p class="text-xs text-gray-600 mt-0.5">15% overlap preserves context without redundancy</p>
                <a href="#" class="text-xs text-sky-600 hover:text-sky-700 font-medium mt-1 inline-block">See example →</a>
              </div>
            </div>
            
            <div class="tip-card group">
              <div class="tip-icon bg-purple-100 text-purple-600">
                <i class="fas fa-magic"></i>
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900">Auto-Enhancement</h4>
                <p class="text-xs text-gray-600 mt-0.5">AI tags & metadata boost retrieval by 40%</p>
                <a href="#" class="text-xs text-purple-600 hover:text-purple-700 font-medium mt-1 inline-block">Enable now →</a>
              </div>
            </div>
          </div>
          
          <!-- CTA footer -->
          <div class="px-6 pb-6">
            <button @click="navigateTo('manual-builder')" class="btn btn-secondary w-full group">
              <i class="fas fa-sparkles mr-2 group-hover:animate-pulse"></i>
              Start Learning
            </button>
          </div>
        </aside>

        <!-- ENHANCED METRICS - Colorful with Progress Indicators -->
        <section class="col-span-12">
          <div class="grid grid-cols-12 gap-4">
            <!-- Documents Metric -->
            <div class="col-span-12 sm:col-span-6 lg:col-span-3 metric-card group" @click="navigateTo('document-processing')">
              <div class="metric-header">
                <div class="metric-icon bg-gradient-to-br from-emerald-400 to-emerald-600">
                  <i class="fas fa-file-alt text-white"></i>
                </div>
                <div class="metric-progress">
                  <svg class="w-full h-full -rotate-90">
                    <circle cx="20" cy="20" r="18" stroke="#E5E7EB" stroke-width="3" fill="none"/>
                    <circle cx="20" cy="20" r="18" stroke="url(#emerald-gradient)" stroke-width="3" fill="none"
                            :stroke-dasharray="`${stats.documentsProcessed > 0 ? 113 : 0} 113`"
                            stroke-linecap="round"/>
                    <defs>
                      <linearGradient id="emerald-gradient">
                        <stop offset="0%" stop-color="#34D399"/>
                        <stop offset="100%" stop-color="#10B981"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <div class="metric-content">
                <p class="metric-label">Documents</p>
                <p class="metric-value" :class="{'animate-count': stats.documentsProcessed > 0}">
                  {{ stats.documentsProcessed }}
                </p>
                <p class="metric-hint">{{ stats.documentsProcessed > 0 ? 'View all →' : 'Upload first file' }}</p>
              </div>
            </div>

            <!-- Chunks Metric -->
            <div class="col-span-12 sm:col-span-6 lg:col-span-3 metric-card group" @click="navigateTo('manual-builder')">
              <div class="metric-header">
                <div class="metric-icon bg-gradient-to-br from-sky-400 to-sky-600">
                  <i class="fas fa-cube text-white"></i>
                </div>
                <div class="metric-progress">
                  <svg class="w-full h-full -rotate-90">
                    <circle cx="20" cy="20" r="18" stroke="#E5E7EB" stroke-width="3" fill="none"/>
                    <circle cx="20" cy="20" r="18" stroke="url(#sky-gradient)" stroke-width="3" fill="none"
                            :stroke-dasharray="`${stats.totalChunks > 0 ? 113 : 0} 113`"
                            stroke-linecap="round"/>
                    <defs>
                      <linearGradient id="sky-gradient">
                        <stop offset="0%" stop-color="#38BDF8"/>
                        <stop offset="100%" stop-color="#0EA5E9"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <div class="metric-content">
                <p class="metric-label">Chunks</p>
                <p class="metric-value" :class="{'animate-count': stats.totalChunks > 0}">
                  {{ stats.totalChunks }}
                </p>
                <p class="metric-hint">{{ stats.totalChunks > 0 ? 'Manage chunks →' : 'Start building' }}</p>
              </div>
            </div>

            <!-- Versions Metric -->
            <div class="col-span-12 sm:col-span-6 lg:col-span-3 metric-card group" @click="navigateTo('versions')">
              <div class="metric-header">
                <div class="metric-icon bg-gradient-to-br from-purple-400 to-purple-600">
                  <i class="fas fa-code-branch text-white"></i>
                </div>
                <div class="metric-progress">
                  <svg class="w-full h-full -rotate-90">
                    <circle cx="20" cy="20" r="18" stroke="#E5E7EB" stroke-width="3" fill="none"/>
                    <circle cx="20" cy="20" r="18" stroke="url(#purple-gradient)" stroke-width="3" fill="none"
                            :stroke-dasharray="`${stats.versionsCount > 0 ? 113 : 0} 113`"
                            stroke-linecap="round"/>
                    <defs>
                      <linearGradient id="purple-gradient">
                        <stop offset="0%" stop-color="#C084FC"/>
                        <stop offset="100%" stop-color="#8B5CF6"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <div class="metric-content">
                <p class="metric-label">Versions</p>
                <p class="metric-value" :class="{'animate-count': stats.versionsCount > 0}">
                  {{ stats.versionsCount }}
                </p>
                <p class="metric-hint">{{ stats.versionsCount > 0 ? 'View history →' : 'Save first version' }}</p>
              </div>
            </div>

            <!-- Exports Metric -->
            <div class="col-span-12 sm:col-span-6 lg:col-span-3 metric-card group">
              <div class="metric-header">
                <div class="metric-icon bg-gradient-to-br from-amber-400 to-orange-600">
                  <i class="fas fa-download text-white"></i>
                </div>
                <div class="metric-progress">
                  <svg class="w-full h-full -rotate-90">
                    <circle cx="20" cy="20" r="18" stroke="#E5E7EB" stroke-width="3" fill="none"/>
                    <circle cx="20" cy="20" r="18" stroke="url(#amber-gradient)" stroke-width="3" fill="none"
                            :stroke-dasharray="`${stats.exportsCount > 0 ? 113 : 0} 113`"
                            stroke-linecap="round"/>
                    <defs>
                      <linearGradient id="amber-gradient">
                        <stop offset="0%" stop-color="#FBBf24"/>
                        <stop offset="100%" stop-color="#F97316"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <div class="metric-content">
                <p class="metric-label">Exports</p>
                <p class="metric-value" :class="{'animate-count': stats.exportsCount > 0}">
                  {{ stats.exportsCount }}
                </p>
                <p class="metric-hint">{{ stats.exportsCount > 0 ? 'Export more →' : 'Ready to export' }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- FEATURE CARDS - With color accents -->
        <section class="col-span-12">
          <div class="grid grid-cols-12 gap-4">
            <article class="col-span-12 md:col-span-6 feature-card group">
              <div class="feature-icon bg-gradient-to-br from-emerald-100 to-emerald-200">
                <i class="fas fa-brain text-emerald-600"></i>
              </div>
              <div>
                <h3 class="text-gray-900 font-bold mb-2">AI-Optimized Chunking</h3>
                <p class="text-gray-600 text-sm">Intelligent segmentation for vector databases & LLM training</p>
                <div class="mt-3 flex gap-2">
                  <span class="badge-sm bg-emerald-100 text-emerald-700">GPT-4 Ready</span>
                  <span class="badge-sm bg-sky-100 text-sky-700">Claude Compatible</span>
                </div>
              </div>
            </article>
            
            <article class="col-span-12 md:col-span-6 feature-card group">
              <div class="feature-icon bg-gradient-to-br from-purple-100 to-purple-200">
                <i class="fas fa-chart-line text-purple-600"></i>
              </div>
              <div>
                <h3 class="text-gray-900 font-bold mb-2">Quality Analysis</h3>
                <p class="text-gray-600 text-sm">Real-time readability and semantic coherence scoring</p>
                <div class="mt-3 flex gap-2">
                  <span class="badge-sm bg-purple-100 text-purple-700">WCAG AA</span>
                  <span class="badge-sm bg-pink-100 text-pink-700">98% Accuracy</span>
                </div>
              </div>
            </article>
          </div>
        </section>

        <!-- GETTING STARTED - Visual Steps with Icons -->
        <section class="col-span-12 rounded-2xl bg-gradient-to-br from-gray-50 to-white ring-1 ring-gray-100 shadow-xl overflow-hidden">
          <div class="p-8">
            <h3 class="text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-8">
              Get Started in 3 Steps
            </h3>
            
            <div class="grid gap-6 md:grid-cols-3">
              <!-- Step 1 -->
              <div class="step-card group">
                <div class="step-number bg-gradient-to-br from-emerald-500 to-emerald-600">
                  <span class="text-white font-bold">1</span>
                </div>
                <div class="step-icon mb-4">
                  <svg class="w-full h-full text-emerald-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="20" y="30" width="60" height="50" rx="4" stroke="currentColor" stroke-width="2"/>
                    <path d="M30 45h40M30 55h40M30 65h25" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <circle cx="50" cy="25" r="5" fill="currentColor"/>
                  </svg>
                </div>
                <h4 class="font-bold text-gray-900 mb-2">Choose Your Method</h4>
                <p class="text-sm text-gray-600 mb-3">Upload PDFs or create content manually</p>
                <button class="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                  Start here →
                </button>
              </div>

              <!-- Step 2 -->
              <div class="step-card group">
                <div class="step-number bg-gradient-to-br from-sky-500 to-sky-600">
                  <span class="text-white font-bold">2</span>
                </div>
                <div class="step-icon mb-4">
                  <svg class="w-full h-full text-sky-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="25" stroke="currentColor" stroke-width="2"/>
                    <path d="M50 35v15l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <circle cx="30" cy="20" r="3" fill="currentColor"/>
                    <circle cx="70" cy="20" r="3" fill="currentColor"/>
                    <circle cx="70" cy="80" r="3" fill="currentColor"/>
                    <circle cx="30" cy="80" r="3" fill="currentColor"/>
                  </svg>
                </div>
                <h4 class="font-bold text-gray-900 mb-2">Configure Processing</h4>
                <p class="text-sm text-gray-600 mb-3">Set chunk size and overlap parameters</p>
                <button class="text-sm font-medium text-sky-600 hover:text-sky-700">
                  Configure →
                </button>
              </div>

              <!-- Step 3 -->
              <div class="step-card group">
                <div class="step-number bg-gradient-to-br from-purple-500 to-purple-600">
                  <span class="text-white font-bold">3</span>
                </div>
                <div class="step-icon mb-4">
                  <svg class="w-full h-full text-purple-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 20v40M35 45l15 15 15-15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <rect x="30" y="70" width="40" height="10" rx="2" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <h4 class="font-bold text-gray-900 mb-2">Export & Integrate</h4>
                <p class="text-sm text-gray-600 mb-3">Download in your preferred AI format</p>
                <button class="text-sm font-medium text-purple-600 hover:text-purple-700">
                  Export now →
                </button>
              </div>
            </div>
            
            <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button @click="navigateTo('manual-builder')" class="btn btn-primary">
                <i class="fas fa-rocket mr-2"></i>
                Launch Builder
              </button>
              <button @click="showTutorial" class="btn btn-ghost">
                <i class="fas fa-play-circle mr-2"></i>
                Watch Demo
              </button>
            </div>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAppStore } from '@/stores/app'
import { useChunksStore } from '@/stores/chunks'
import { useVersionStore } from '@/stores/versions'

const appStore = useAppStore()
const chunksStore = useChunksStore()
const versionStore = useVersionStore()

// Stats with animations
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
  console.log('Tutorial feature coming soon')
}

// Add entrance animations and parallax
onMounted(() => {
  // Animate metrics on mount
  const metrics = document.querySelectorAll('.metric-value')
  metrics.forEach((metric, index) => {
    setTimeout(() => {
      metric.classList.add('animate-fade-in')
    }, index * 100)
  })
  
  // Parallax effect for hero wave background
  const heroBackground = document.querySelector('.hero-wave-background') as HTMLElement
  if (heroBackground && window.innerWidth >= 1024) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY
      const parallaxSpeed = 0.2
      const maxOffset = 50 // Limit parallax to prevent over-scrolling
      const offset = Math.min(scrollY * parallaxSpeed, maxOffset)
      heroBackground.style.transform = `translateY(${offset}px)`
    }, { passive: true })
  }
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #FAFAFA 0%, #F3F4F6 100%);
}

/* Animations */
@keyframes gradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-20px, -30px) scale(1.1); }
}

@keyframes float-delayed {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20px, -20px) scale(1.05); }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes count {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes subtle-zoom {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes parallax {
  0% { transform: translateY(0); }
  100% { transform: translateY(-20px); }
}

@keyframes subtle-parallax {
  0%, 100% { 
    transform: translateY(0) scale(1);
  }
  50% { 
    transform: translateY(-10px) scale(1.02);
  }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 8s ease-in-out infinite;
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}

.animate-count {
  animation: count 0.5s ease-out;
}

.animate-spin-slow {
  animation: spin 3s linear infinite;
}

.animate-subtle-zoom {
  animation: subtle-zoom 20s ease-in-out infinite;
}

/* Hero Container & Background */
.hero-container {
  min-height: 500px;
  background: white;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.05); /* Subtle border to separate from background */
}

/* Ensure border radius is visible */
.hero-container,
.hero-wave-background {
  border-radius: 1rem; /* 16px - matches rounded-2xl */
}

/* Gold Wave Background */
.hero-wave-background {
  position: absolute;
  inset: 0;
  background-image: url('/hero-background.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  will-change: transform;
  animation: fade-in 1s ease-out, subtle-parallax 30s ease-in-out infinite;
  animation-delay: 0s, 1s; /* Start parallax after fade-in */
}

/* White Overlay for Readability */
.hero-wave-background::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(0.5px);
}

/* Additional gradient overlay for depth */
.hero-wave-background::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.3) 0%,
    rgba(255, 255, 255, 0.5) 50%,
    rgba(251, 191, 36, 0.05) 100%); /* Subtle gold tint */
}

/* Mobile optimization for hero background */
@media (max-width: 768px) {
  .hero-container {
    min-height: 600px;
  }
  
  .hero-wave-background {
    background-position: center bottom; /* Shift to avoid text clash */
    background-size: 120% auto; /* Ensure waves are visible */
  }
}

/* Tablet optimization */
@media (min-width: 769px) and (max-width: 1023px) {
  .hero-wave-background {
    background-position: center center;
    background-size: cover;
  }
}

/* Parallax effect on scroll */
@media (min-width: 1024px) {
  .hero-background {
    transform: translateY(var(--parallax-offset, 0));
    transition: transform 0.3s ease-out;
  }
}

/* High-contrast Hero Buttons */
.btn-hero-primary {
  @apply inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-base font-bold transition-all duration-200;
  background: linear-gradient(135deg, #047857 0%, #065F46 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(4, 120, 87, 0.4);
  position: relative;
  overflow: hidden;
}

.btn-hero-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(4, 120, 87, 0.5);
}

.btn-hero-primary:active {
  transform: scale(0.98);
}

.btn-hero-secondary {
  @apply inline-flex items-center justify-center rounded-xl px-5 py-3.5 text-base font-semibold transition-all duration-200;
  background: white;
  color: #065F46;
  border: 2px solid #065F46;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-hero-secondary:hover {
  background: #065F46;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(6, 95, 70, 0.3);
}

/* Tip Cards */
.tip-card {
  @apply flex gap-3 p-3 rounded-xl hover:bg-white/80 transition-all cursor-pointer;
}

.tip-card:hover {
  transform: translateX(4px);
}

.tip-icon {
  @apply w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0;
}

/* Metric Cards */
.metric-card {
  @apply relative rounded-2xl bg-white ring-1 ring-gray-100 shadow-lg p-6 cursor-pointer transition-all overflow-hidden;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.metric-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(16, 185, 129, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.metric-card:hover::before {
  opacity: 1;
}

.metric-header {
  @apply flex items-center gap-4 mb-4;
}

.metric-icon {
  @apply w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg;
}

.metric-progress {
  @apply w-10 h-10;
}

.metric-content {
  @apply relative z-10;
}

.metric-label {
  @apply text-xs font-medium text-gray-500 uppercase tracking-wider;
}

.metric-value {
  @apply text-3xl font-black text-gray-900 mt-1;
}

.metric-hint {
  @apply text-xs text-gray-500 mt-2;
}

/* Feature Cards */
.feature-card {
  @apply rounded-2xl bg-white ring-1 ring-gray-100 shadow-lg p-6 flex gap-4 items-start transition-all;
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.feature-icon {
  @apply w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0;
}

/* Step Cards */
.step-card {
  @apply relative bg-white rounded-xl p-6 text-center transition-all border-2 border-gray-100;
}

.step-card:hover {
  transform: translateY(-4px);
  border-color: transparent;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.step-number {
  @apply absolute -top-3 -left-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg;
}

.step-icon {
  @apply w-20 h-20 mx-auto;
}

/* Badges */
.badge-sm {
  @apply inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium;
}

/* Icons */
.fas::before { font-style: normal; }
.fa-rocket::before { content: '🚀'; }
.fa-check-circle::before { content: '✅'; }
.fa-cog::before { content: '⚙'; }
.fa-play::before { content: '▶'; }
.fa-upload::before { content: '⬆'; }
.fa-lightbulb::before { content: '💡'; }
.fa-link::before { content: '🔗'; }
.fa-magic::before { content: '✨'; }
.fa-sparkles::before { content: '✨'; }
.fa-file-alt::before { content: '📄'; }
.fa-cube::before { content: '📦'; }
.fa-code-branch::before { content: '🌿'; }
.fa-download::before { content: '⬇'; }
.fa-brain::before { content: '🧠'; }
.fa-chart-line::before { content: '📈'; }
.fa-play-circle::before { content: '▶️'; }

/* Button overrides for vibrant design */
.btn:hover {
  transform: translateY(-2px);
}

.btn:active {
  transform: scale(0.98);
}
</style>