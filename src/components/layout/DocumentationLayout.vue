<template>
  <div class="documentation-layout">
    <!-- Breadcrumb Navigation -->
    <nav class="breadcrumb-nav" aria-label="Breadcrumb">
      <div class="container">
        <ol class="breadcrumb-list">
          <li class="breadcrumb-item">
            <router-link to="/" class="breadcrumb-link">
              <svg class="breadcrumb-icon" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
              Home
            </router-link>
          </li>
          <li class="breadcrumb-item">
            <span class="breadcrumb-separator" aria-hidden="true">/</span>
            <span class="breadcrumb-current" aria-current="page">{{ pageTitle }}</span>
          </li>
        </ol>
      </div>
    </nav>

    <!-- Page Content -->
    <main class="documentation-main">
      <div class="container">
        <div class="documentation-grid">
          
          <!-- Table of Contents (if provided) -->
          <aside v-if="showToc" class="documentation-sidebar" role="complementary">
            <nav class="toc-nav" aria-label="Table of contents">
              <h2 class="toc-title">Table of Contents</h2>
              <slot name="table-of-contents"></slot>
            </nav>
          </aside>

          <!-- Main Content -->
          <article class="documentation-content" role="main">
            <header class="page-header">
              <h1 class="page-title">{{ pageTitle }}</h1>
              <p v-if="pageDescription" class="page-description">{{ pageDescription }}</p>
              <div class="page-meta">
                <span class="last-updated">Last updated: {{ lastUpdated }}</span>
              </div>
            </header>

            <div class="prose">
              <slot></slot>
            </div>
          </article>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
defineProps({
  pageTitle: {
    type: String,
    required: true
  },
  pageDescription: {
    type: String,
    default: ''
  },
  lastUpdated: {
    type: String,
    default: () => new Date().toLocaleDateString()
  },
  showToc: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped>
.documentation-layout {
  min-height: 100vh;
  background: var(--color-neutral-0);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Breadcrumb Navigation */
.breadcrumb-nav {
  background: var(--color-neutral-50);
  border-bottom: 1px solid var(--color-neutral-200);
  padding: 1rem 0;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 0.5rem;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.breadcrumb-link {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--color-primary-600);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.15s ease;
}

.breadcrumb-link:hover {
  color: var(--color-primary-700);
  text-decoration: underline;
}

.breadcrumb-icon {
  width: 1rem;
  height: 1rem;
  fill: currentColor;
}

.breadcrumb-separator {
  color: var(--color-neutral-400);
  font-weight: 500;
}

.breadcrumb-current {
  color: var(--color-neutral-600);
  font-size: 0.875rem;
  font-weight: 500;
}

/* Main Documentation Layout */
.documentation-main {
  padding: 2rem 0 4rem;
}

.documentation-grid {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 3rem;
  align-items: start;
}

.documentation-sidebar {
  position: sticky;
  top: 2rem;
  background: var(--color-neutral-50);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--color-neutral-200);
}

.toc-nav {
  display: flex;
  flex-direction: column;
}

.toc-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-neutral-900);
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Page Header */
.page-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-neutral-200);
}

.page-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--color-neutral-900);
  margin: 0 0 0.75rem 0;
  line-height: 1.2;
}

.page-description {
  font-size: 1.125rem;
  color: var(--color-neutral-600);
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.page-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.last-updated {
  font-size: 0.875rem;
  color: var(--color-neutral-500);
  font-style: italic;
}

/* Content Styling */
.prose {
  max-width: none;
  color: var(--color-neutral-900);
  line-height: 1.7;
}

.prose h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--color-neutral-900);
  margin: 2.5rem 0 1rem 0;
  line-height: 1.3;
  scroll-margin-top: 2rem;
}

.prose h3 {
  font-size: 1.375rem;
  font-weight: 600;
  color: var(--color-neutral-900);
  margin: 2rem 0 0.75rem 0;
  line-height: 1.4;
  scroll-margin-top: 2rem;
}

.prose h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-neutral-900);
  margin: 1.5rem 0 0.5rem 0;
  line-height: 1.4;
}

.prose p {
  margin: 0 0 1.25rem 0;
  font-size: 1rem;
}

.prose ul, .prose ol {
  margin: 0 0 1.25rem 0;
  padding-left: 1.5rem;
}

.prose li {
  margin: 0.375rem 0;
}

.prose a {
  color: var(--color-primary-600);
  text-decoration: underline;
  transition: color 0.15s ease;
}

.prose a:hover {
  color: var(--color-primary-700);
}

.prose code {
  background: var(--color-neutral-100);
  color: var(--color-neutral-900);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.875em;
  font-family: var(--font-mono);
}

.prose pre {
  background: var(--color-neutral-100);
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1.25rem 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

.prose blockquote {
  border-left: 4px solid var(--color-primary-500);
  background: var(--color-primary-50);
  margin: 1.5rem 0;
  padding: 1rem 1.5rem;
  font-style: italic;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .documentation-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .documentation-sidebar {
    position: relative;
    top: auto;
    order: 2;
  }
}

@media (max-width: 768px) {
  .documentation-main {
    padding: 1.5rem 0 2rem;
  }
  
  .page-title {
    font-size: 1.875rem;
  }
  
  .prose h2 {
    font-size: 1.5rem;
  }
  
  .prose h3 {
    font-size: 1.25rem;
  }
}
</style>