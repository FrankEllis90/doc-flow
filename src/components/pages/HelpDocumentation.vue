<template>
  <div class="documentation-page">
    <!-- App Header -->
    <AppHeader />
    
    <!-- Documentation Content -->
    <DocumentationLayout
      page-title="Help & Documentation"
      page-description="Complete guide to using Ragara effectively"
      :show-toc="true"
    >
    <!-- Table of Contents -->
    <template #table-of-contents>
      <ul class="toc-list">
        <li><a href="#getting-started" class="toc-link">Getting Started</a></li>
        <li><a href="#manual-content-builder" class="toc-link">Manual Content Builder</a></li>
        <li><a href="#document-processing" class="toc-link">Document Processing</a></li>
        <li><a href="#version-control" class="toc-link">Version Control</a></li>
        <li><a href="#export-formats" class="toc-link">Export Formats</a></li>
        <li><a href="#ai-platforms" class="toc-link">AI Platform Integration</a></li>
        <li><a href="#troubleshooting" class="toc-link">Troubleshooting</a></li>
        <li><a href="#best-practices" class="toc-link">Best Practices</a></li>
        <li><a href="#faq" class="toc-link">FAQ</a></li>
      </ul>
    </template>

    <!-- Main Content -->
    <section id="getting-started">
      <h2>Getting Started</h2>
      <p>Welcome to Ragara! This tool helps you transform your documents into AI-ready knowledge bases that can be used with various AI platforms and vector databases.</p>
      
      <h3>What is Document Chunking?</h3>
      <p>Document chunking breaks your long documents into smaller, digestible pieces that AI systems can better understand and search through. Think of it like organizing a library - instead of having one massive book, you have organized chapters that are easier to find and reference.</p>
      
      <div class="feature-grid">
        <div class="feature-card">
          <h4>By Words</h4>
          <p>Splits content every X words. Best for consistent chunk sizes. Recommended: 300-800 words.</p>
        </div>
        <div class="feature-card">
          <h4>By Characters</h4>
          <p>Splits by character count. More precise control. Recommended: 1500-4000 characters.</p>
        </div>
        <div class="feature-card">
          <h4>By Sections</h4>
          <p>Splits at headings (# ## ###). Preserves document structure. Best for organized content.</p>
        </div>
      </div>

      <h3>Quick Start Guide</h3>
      <ol>
        <li><strong>Choose Your Method</strong>: Manual Content Builder or Document Processing</li>
        <li><strong>Configure Chunking</strong>: Set chunk size, overlap, and auto-tagging preferences</li>
        <li><strong>Process Content</strong>: Upload documents or create content manually</li>
        <li><strong>Review Results</strong>: Check generated chunks and edit as needed</li>
        <li><strong>Export</strong>: Choose your preferred AI platform format and download</li>
      </ol>
    </section>

    <section id="manual-content-builder">
      <h2>Manual Content Builder</h2>
      <p>Perfect for creating knowledge bases from scratch or when you need precise control over your content structure.</p>
      
      <h3>Step-by-Step Process</h3>
      <ol>
        <li><strong>Enter Source/Title</strong>: Provide a descriptive source or title for your content</li>
        <li><strong>Input Content</strong>: Paste or type your complete content into the textarea</li>
        <li><strong>Configure Settings</strong>:
          <ul>
            <li><strong>Chunk Size</strong>: 200-1000 words (optimal: 300-800)</li>
            <li><strong>Overlap</strong>: 0-30% of chunk size (prevents information loss)</li>
            <li><strong>Auto-tagging</strong>: Enable AI-powered tag generation</li>
          </ul>
        </li>
        <li><strong>Process Content</strong>: Click "Process Content" to generate chunks</li>
        <li><strong>Review & Edit</strong>: Examine generated chunks and make adjustments</li>
        <li><strong>Export</strong>: Download in your preferred format</li>
      </ol>

      <h3>Best Practices</h3>
      <ul>
        <li><strong>Quality Content</strong>: Ensure your source content is well-written and structured</li>
        <li><strong>Appropriate Length</strong>: Aim for at least 1000 words for effective chunking</li>
        <li><strong>Clear Structure</strong>: Use headings and paragraphs to organize information</li>
        <li><strong>Review Results</strong>: Always check generated chunks before export</li>
      </ul>
    </section>

    <section id="document-processing">
      <h2>Document Processing</h2>
      <p>Batch process multiple documents with advanced file handling capabilities.</p>
      
      <h3>Supported File Types</h3>
      <ul>
        <li><strong>Markdown</strong>: .md, .markdown files (up to 10MB each)</li>
        <li><strong>PDF</strong>: .pdf files (up to 50MB each)</li>
        <li><strong>Batch Limit</strong>: Up to 20 files, 200MB total</li>
      </ul>

      <h3>Processing Workflow</h3>
      <ol>
        <li><strong>Upload Files</strong>: Drag & drop or click to browse</li>
        <li><strong>Configure Processing</strong>: Set chunk size, overlap, and auto-tagging</li>
        <li><strong>Monitor Progress</strong>: Watch individual file processing status</li>
        <li><strong>Handle Errors</strong>: Retry failed files or remove problematic ones</li>
        <li><strong>Review Results</strong>: Check all processed chunks</li>
        <li><strong>Export</strong>: Download combined results</li>
      </ol>

      <h3>Troubleshooting File Processing</h3>
      <ul>
        <li><strong>File Too Large</strong>: Split large files or use compression</li>
        <li><strong>Processing Failed</strong>: Check file format and try again</li>
        <li><strong>Memory Issues</strong>: Process fewer files at once</li>
        <li><strong>Slow Processing</strong>: Large files take more time - be patient</li>
      </ul>
    </section>

    <section id="version-control">
      <h2>Version Control</h2>
      <p>Comprehensive history and backup management for your knowledge bases.</p>
      
      <h3>Features</h3>
      <ul>
        <li><strong>Auto-save System</strong>: Versions created automatically during exports</li>
        <li><strong>Manual Snapshots</strong>: Create named versions at any time</li>
        <li><strong>Complete History</strong>: Browse all versions with metadata</li>
        <li><strong>Quick Restore</strong>: Load any previous state instantly</li>
        <li><strong>Export Tracking</strong>: Download previous exports or create new ones</li>
      </ul>

      <h3>Managing Versions</h3>
      <ul>
        <li><strong>Create Version</strong>: Click "Save Current State" to create a snapshot</li>
        <li><strong>Name Versions</strong>: Use descriptive names like "v1.0 - Initial Release"</li>
        <li><strong>Restore Data</strong>: Click any version to restore that state</li>
        <li><strong>Export from Version</strong>: Generate exports from any saved version</li>
        <li><strong>Cleanup</strong>: Delete old versions to free storage space</li>
      </ul>
    </section>

    <section id="export-formats">
      <h2>Export Formats & AI Integration</h2>
      <p>Export your processed content to various AI platforms and data formats.</p>
      
      <h3>AI Platform Formats</h3>
      <div class="platform-grid">
        <div class="platform-card">
          <h4>Azure Vector Store</h4>
          <p>JSON format optimized for Azure OpenAI vector store ingestion with metadata support.</p>
          <code>{ "content": "...", "metadata": {...} }</code>
        </div>
        
        <div class="platform-card">
          <h4>OpenAI & Claude</h4>
          <p>Optimized format for Claude API with conversation context support.</p>
          <code>{ "prompt": "...", "completion": "..." }</code>
        </div>
        
        <div class="platform-card">
          <h4>Pinecone</h4>
          <p>Ready for direct upload to Pinecone vector database.</p>
          <code>{ "id": "...", "values": [...], "metadata": {...} }</code>
        </div>
        
        <div class="platform-card">
          <h4>LangChain</h4>
          <p>Format optimized for LangChain document loaders.</p>
          <code>{ "page_content": "...", "metadata": {...} }</code>
        </div>
      </div>

      <h3>Data Formats</h3>
      <ul>
        <li><strong>JSON</strong>: Structured data for AI training and processing</li>
        <li><strong>CSV</strong>: Spreadsheet-compatible format for analysis</li>
        <li><strong>TXT</strong>: Plain text with optional separators</li>
        <li><strong>XML</strong>: Structured markup format</li>
        <li><strong>Markdown</strong>: Formatted text with metadata</li>
      </ul>

      <h3>Upload Scripts</h3>
      <p>Get auto-generated upload scripts for each platform to streamline your workflow.</p>
      <ul>
        <li><strong>Python Scripts</strong>: Ready-to-run upload scripts</li>
        <li><strong>Authentication</strong>: Placeholder for your API keys</li>
        <li><strong>Error Handling</strong>: Built-in retry logic and validation</li>
        <li><strong>Batch Processing</strong>: Efficient bulk upload capabilities</li>
      </ul>
    </section>

    <section id="troubleshooting">
      <h2>Troubleshooting</h2>
      
      <h3>Common Issues</h3>
      
      <h4>PDF Processing Fails</h4>
      <ul>
        <li>Check file size (maximum 50MB per PDF)</li>
        <li>Verify file format (ensure it's a valid PDF)</li>
        <li>Try a different browser</li>
        <li>Refresh the page to restart PDF.js worker</li>
      </ul>

      <h4>Memory Issues</h4>
      <ul>
        <li>Reduce file count (process fewer files at once)</li>
        <li>Use smaller chunk sizes</li>
        <li>Refresh browser to clear memory</li>
        <li>Check total file sizes (stay under 200MB)</li>
      </ul>

      <h4>Export Problems</h4>
      <ul>
        <li>Ensure chunks exist before export</li>
        <li>Check browser download permissions</li>
        <li>Verify sufficient disk space</li>
        <li>Try different export format</li>
      </ul>

      <h4>Performance Tips</h4>
      <ul>
        <li>Process files in batches of 5-10 for optimal performance</li>
        <li>Use word-based chunking for most content types</li>
        <li>Enable auto-tags for better organization</li>
        <li>Regular cleanup of old versions</li>
        <li>Monitor memory usage during operations</li>
      </ul>
    </section>

    <section id="faq">
      <h2>Frequently Asked Questions</h2>
      
      <h3>General</h3>
      <h4>What file formats are supported?</h4>
      <p>We support Markdown (.md, .markdown) up to 10MB and PDF files up to 50MB. You can process up to 20 files at once with a total batch limit of 200MB.</p>
      
      <h4>Is my data stored on your servers?</h4>
      <p>No. All processing happens locally in your browser. Your documents and data never leave your device, ensuring complete privacy and security.</p>
      
      <h4>What's the optimal chunk size?</h4>
      <p>For most AI applications, 300-800 words per chunk works best. This provides enough context while staying within most AI model token limits.</p>
      
      <h3>Technical</h3>
      <h4>How does auto-tagging work?</h4>
      <p>Our AI analyzes your content and generates relevant keywords and tags that help categorize and improve searchability of your chunks.</p>
      
      <h4>What's the purpose of overlap?</h4>
      <p>Overlap ensures important information isn't lost when content is split between chunks. We recommend 10-20% overlap for most use cases.</p>
      
      <h4>Can I edit chunks after processing?</h4>
      <p>Yes! You can review and edit any generated chunk before export. This ensures your knowledge base meets your exact requirements.</p>
    </section>
    </DocumentationLayout>
    
    <!-- App Footer -->
    <AppFooter />
  </div>
</template>

<script setup>
import DocumentationLayout from '@/components/layout/DocumentationLayout.vue'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
</script>

<style scoped>
.documentation-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.toc-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.toc-link {
  color: var(--color-neutral-600);
  text-decoration: none;
  font-size: 0.875rem;
  line-height: 1.4;
  transition: color 0.15s ease;
  display: block;
  padding: 0.25rem 0;
}

.toc-link:hover {
  color: var(--color-primary-600);
  text-decoration: underline;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.feature-card {
  background: var(--color-neutral-50);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--color-neutral-200);
}

.feature-card h4 {
  margin: 0 0 0.75rem 0;
  color: var(--color-primary-600);
  font-size: 1.125rem;
}

.feature-card p {
  margin: 0;
  color: var(--color-neutral-600);
  font-size: 0.875rem;
  line-height: 1.5;
}

.platform-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.platform-card {
  background: var(--color-neutral-50);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--color-neutral-200);
}

.platform-card h4 {
  margin: 0 0 0.75rem 0;
  color: var(--color-primary-600);
  font-size: 1.125rem;
}

.platform-card p {
  margin: 0 0 1rem 0;
  color: var(--color-neutral-600);
  font-size: 0.875rem;
  line-height: 1.5;
}

.platform-card code {
  display: block;
  font-size: 0.75rem;
  background: var(--color-neutral-100);
  padding: 0.5rem;
  border-radius: 4px;
  font-family: var(--font-mono);
}
</style>