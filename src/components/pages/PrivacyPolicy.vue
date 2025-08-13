<template>
  <div class="documentation-page">
    <!-- App Header -->
    <AppHeader />
    
    <!-- Documentation Content -->
    <DocumentationLayout
      page-title="Privacy Policy"
      page-description="How we protect and handle your data in Ragara"
      last-updated="January 2025"
      :show-toc="true"
    >
    <template #table-of-contents>
      <ul class="toc-list">
        <li><a href="#overview" class="toc-link">Privacy Overview</a></li>
        <li><a href="#data-collection" class="toc-link">Data Collection</a></li>
        <li><a href="#data-processing" class="toc-link">Data Processing</a></li>
        <li><a href="#data-storage" class="toc-link">Data Storage</a></li>
        <li><a href="#user-rights" class="toc-link">Your Rights</a></li>
        <li><a href="#security" class="toc-link">Security Measures</a></li>
        <li><a href="#contact" class="toc-link">Contact Us</a></li>
      </ul>
    </template>

    <section id="overview">
      <h2>Privacy Overview</h2>
      
      <div class="privacy-highlight">
        <h3>🔒 Your Data Stays Local</h3>
        <p><strong>Ragara operates entirely in your browser. Your documents, content, and processed data never leave your device.</strong></p>
      </div>

      <p>This Privacy Policy explains how Ragara handles information when you use our application. We are committed to protecting your privacy and ensuring transparent data practices.</p>
      
      <h3>Key Privacy Principles</h3>
      <ul>
        <li><strong>Local Processing</strong>: All document processing happens in your browser</li>
        <li><strong>No Data Transmission</strong>: Your content never leaves your device</li>
        <li><strong>No Account Required</strong>: Use the tool without registration or personal information</li>
        <li><strong>Browser Storage Only</strong>: Data stored locally using IndexedDB and localStorage</li>
        <li><strong>No Tracking</strong>: We don't track your usage or behavior</li>
      </ul>
    </section>

    <section id="data-collection">
      <h2>Data Collection</h2>
      
      <h3>Information We Do NOT Collect</h3>
      <ul>
        <li>Personal identification information (name, email, address)</li>
        <li>Your documents or content</li>
        <li>Usage analytics or tracking data</li>
        <li>Browser fingerprints or device information</li>
        <li>IP addresses or location data</li>
        <li>Cookies for tracking purposes</li>
      </ul>

      <h3>Technical Information</h3>
      <p>The application may access the following technical information to function properly:</p>
      <ul>
        <li><strong>Browser Features</strong>: To determine supported functionality (IndexedDB, File API)</li>
        <li><strong>File Metadata</strong>: File names, sizes, and types for processing validation</li>
        <li><strong>Processing Status</strong>: Temporary status information during document processing</li>
      </ul>
      
      <p><em>This technical information is processed locally and never transmitted to any servers.</em></p>
    </section>

    <section id="data-processing">
      <h2>Data Processing</h2>
      
      <h3>Local Processing</h3>
      <p>All document processing, chunking, and analysis happens entirely within your browser using:</p>
      <ul>
        <li><strong>JavaScript Engines</strong>: Built-in browser processing</li>
        <li><strong>PDF.js</strong>: Mozilla's PDF rendering library</li>
        <li><strong>Markdown Parsers</strong>: Client-side text processing</li>
        <li><strong>Web Workers</strong>: Background processing for performance</li>
      </ul>

      <h3>No External APIs</h3>
      <p>Ragara does not send your content to any external APIs or services for processing. Features like "auto-tagging" use local algorithms and do not involve cloud-based AI services.</p>

      <h3>Export Processing</h3>
      <p>When you export your processed content:</p>
      <ul>
        <li>Files are generated locally in your browser</li>
        <li>Downloads are handled by your browser's built-in download manager</li>
        <li>No data is transmitted to external servers</li>
        <li>Generated upload scripts contain placeholder API keys only</li>
      </ul>
    </section>

    <section id="data-storage">
      <h2>Data Storage</h2>
      
      <h3>Browser Storage</h3>
      <p>Ragara stores data locally in your browser using:</p>
      <ul>
        <li><strong>IndexedDB</strong>: Primary storage for processed content and versions</li>
        <li><strong>localStorage</strong>: Application settings and preferences</li>
        <li><strong>Memory</strong>: Temporary data during processing</li>
      </ul>

      <h3>Data Persistence</h3>
      <ul>
        <li><strong>Version History</strong>: Stored locally until you delete them</li>
        <li><strong>Processed Chunks</strong>: Remain in browser storage until cleared</li>
        <li><strong>Settings</strong>: Chunking preferences and configuration options</li>
        <li><strong>Temporary Files</strong>: Automatically cleared after processing</li>
      </ul>

      <h3>Data Retention</h3>
      <ul>
        <li><strong>User Control</strong>: You can delete all data at any time</li>
        <li><strong>Browser Clearing</strong>: Data removed when you clear browser storage</li>
        <li><strong>No Automatic Retention</strong>: We don't have access to or retain any data</li>
        <li><strong>Storage Limits</strong>: Subject to your browser's storage quotas</li>
      </ul>
    </section>

    <section id="user-rights">
      <h2>Your Rights</h2>
      
      <h3>Complete Data Control</h3>
      <p>Since all data processing happens locally in your browser, you have complete control over your information:</p>
      
      <ul>
        <li><strong>Access</strong>: View all your stored data through the Version Control tab</li>
        <li><strong>Export</strong>: Download your processed content in various formats</li>
        <li><strong>Modify</strong>: Edit chunks and content before export</li>
        <li><strong>Delete</strong>: Remove versions, chunks, or all data at any time</li>
        <li><strong>Portability</strong>: Export data for use with other tools</li>
      </ul>

      <h3>Clearing Your Data</h3>
      <p>To completely remove all data from AI Knowledge Base Builder:</p>
      <ol>
        <li>Go to the Version Control tab</li>
        <li>Delete all saved versions</li>
        <li>Clear your browser's storage for this site</li>
        <li>Refresh the page to start fresh</li>
      </ol>

      <h3>GDPR Compliance</h3>
      <p>While AI Knowledge Base Builder doesn't collect personal data, we respect GDPR principles:</p>
      <ul>
        <li><strong>Lawful Basis</strong>: Processing based on legitimate interest (providing the service)</li>
        <li><strong>Data Minimization</strong>: Only process data necessary for functionality</li>
        <li><strong>Purpose Limitation</strong>: Data used only for document chunking and export</li>
        <li><strong>Storage Limitation</strong>: No server-side data retention</li>
        <li><strong>Transparency</strong>: This clear privacy policy</li>
      </ul>
    </section>

    <section id="security">
      <h2>Security Measures</h2>
      
      <h3>Technical Safeguards</h3>
      <ul>
        <li><strong>HTTPS Only</strong>: Secure connection for all communications</li>
        <li><strong>No Data Transmission</strong>: Eliminates interception risks</li>
        <li><strong>Browser Sandboxing</strong>: Isolated processing environment</li>
        <li><strong>Input Validation</strong>: File type and size restrictions</li>
        <li><strong>Memory Management</strong>: Secure cleanup of temporary data</li>
      </ul>

      <h3>File Security</h3>
      <ul>
        <li><strong>Format Validation</strong>: Only accepted file types processed</li>
        <li><strong>Size Limits</strong>: Prevents processing of oversized files</li>
        <li><strong>Content Scanning</strong>: Basic validation of file structure</li>
        <li><strong>Isolated Processing</strong>: Files processed in secure browser context</li>
      </ul>

      <h3>Recommendations</h3>
      <ul>
        <li><strong>Use Updated Browsers</strong>: Keep your browser current for security patches</li>
        <li><strong>Private Browsing</strong>: Use incognito mode for sensitive documents</li>
        <li><strong>Regular Cleanup</strong>: Clear stored data after completing projects</li>
        <li><strong>Secure Environment</strong>: Use on trusted devices and networks</li>
      </ul>
    </section>

    <section id="contact">
      <h2>Contact Us</h2>
      
      <p>If you have questions about this Privacy Policy or our data practices:</p>
      
      <div class="contact-info">
        <h3>Privacy Questions</h3>
        <ul>
          <li><strong>Email</strong>: privacy@aiknowledgebuilder.com</li>
          <li><strong>Feedback</strong>: Use the "Send Feedback" link in the footer</li>
          <li><strong>Documentation</strong>: Check our Help & Documentation for technical details</li>
        </ul>
      </div>

      <h3>Policy Updates</h3>
      <p>We may update this Privacy Policy to reflect changes in our practices or legal requirements. When we make changes:</p>
      <ul>
        <li>Updated policy will be posted on this page</li>
        <li>Last updated date will be changed at the top</li>
        <li>Significant changes will be highlighted</li>
        <li>Continued use indicates acceptance of changes</li>
      </ul>

      <p><em>This Privacy Policy is effective as of January 2025.</em></p>
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

.privacy-highlight {
  background: var(--color-primary-50);
  border: 1px solid var(--color-primary-200);
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1.5rem 0;
}

.privacy-highlight h3 {
  margin: 0 0 0.75rem 0;
  color: var(--color-primary-700);
  font-size: 1.125rem;
}

.privacy-highlight p {
  margin: 0;
  color: var(--color-primary-800);
  font-size: 1rem;
}

.contact-info {
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1.5rem 0;
}

.contact-info h3 {
  margin: 0 0 1rem 0;
  color: var(--color-neutral-900);
}

.contact-info ul {
  margin: 0;
}
</style>