<template>
  <footer class="app-footer">
    <div class="footer-container">
      <!-- Main Footer Content -->
      <div class="footer-content">
        
        <!-- Brand Section -->
        <div class="footer-brand">
          <div class="footer-logo-section">
            <div class="footer-logo-container">
              <img 
                src="/circuit-tree-logo.png" 
                alt="Ragara Logo" 
                class="footer-logo"
              />
            </div>
            <div class="footer-brand-text">
              <h3 class="footer-brand-name">Ragara</h3>
              <p class="footer-brand-description">
                Transform documents into AI-ready knowledge bases
              </p>
            </div>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="footer-section">
          <h4 class="footer-section-title">Features</h4>
          <ul class="footer-links">
            <li><a href="#manual-builder" class="footer-link">Manual Content Builder</a></li>
            <li><a href="#document-processing" class="footer-link">Document Processing</a></li>
            <li><a href="#version-control" class="footer-link">Version Control</a></li>
            <li><a href="#export-formats" class="footer-link">Export Formats</a></li>
          </ul>
        </div>

        <!-- AI Platforms -->
        <div class="footer-section">
          <h4 class="footer-section-title">Supported Platforms</h4>
          <ul class="footer-links">
            <li><span class="footer-link-static">Azure Vector Store</span></li>
            <li><span class="footer-link-static">OpenAI</span></li>
            <li><span class="footer-link-static">Claude API</span></li>
            <li><span class="footer-link-static">Pinecone</span></li>
          </ul>
        </div>

        <!-- Help & Support -->
        <div class="footer-section">
          <h4 class="footer-section-title">Resources</h4>
          <ul class="footer-links">
            <li><router-link to="/help" class="footer-link">Help & Documentation</router-link></li>
            <li><router-link to="/privacy" class="footer-link">Privacy Policy</router-link></li>
            <li><router-link to="/accessibility" class="footer-link">Accessibility</router-link></li>
            <li><a href="#feedback" class="footer-link">Send Feedback</a></li>
          </ul>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="footer-bottom">
        <div class="footer-bottom-content">
          <p class="footer-copyright">
            © 2025 Ragara. All rights reserved.
          </p>
          <p class="footer-tagline">
            Built with ❤️ for the AI community
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter'
}
</script>

<style scoped>
.app-footer {
  background: var(--color-neutral-50);
  border-top: 1px solid var(--color-neutral-200);
  margin-top: auto; /* Push footer to bottom */
}

.footer-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 3rem;
  padding: 3rem 0 2rem;
}

/* Brand Section */
.footer-brand {
  display: flex;
  flex-direction: column;
}

.footer-logo-section {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.footer-logo-container {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  border-radius: 8px;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15));
}

.footer-brand-text {
  flex: 1;
  min-width: 0;
}

.footer-brand-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-neutral-900);
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.footer-brand-description {
  font-size: 0.875rem;
  color: var(--color-neutral-600);
  margin: 0;
  line-height: 1.4;
}

/* Footer Sections */
.footer-section {
  display: flex;
  flex-direction: column;
}

.footer-section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-neutral-900);
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.footer-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-link {
  color: var(--color-neutral-600);
  text-decoration: none;
  font-size: 0.875rem;
  line-height: 1.4;
  transition: color 0.15s ease;
}

.footer-link:hover {
  color: var(--color-primary-600);
  text-decoration: underline;
}

.footer-link:focus {
  outline: none;
  color: var(--color-primary-600);
  text-decoration: underline;
}

.footer-link-static {
  color: var(--color-neutral-600);
  font-size: 0.875rem;
  line-height: 1.4;
}

/* Footer Bottom */
.footer-bottom {
  border-top: 1px solid var(--color-neutral-200);
  padding: 1.5rem 0;
}

.footer-bottom-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-copyright {
  font-size: 0.875rem;
  color: var(--color-neutral-500);
  margin: 0;
}

.footer-tagline {
  font-size: 0.875rem;
  color: var(--color-neutral-600);
  margin: 0;
  font-style: italic;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .footer-content {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 2rem 0 1.5rem;
  }
  
  .footer-logo-section {
    align-items: center;
  }
  
  .footer-bottom-content {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .footer-container {
    padding: 0 1rem;
  }
  
  .footer-content {
    gap: 1.5rem;
    padding: 1.5rem 0 1rem;
  }
  
  .footer-logo-section {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .footer-logo-container {
    border: 2px solid var(--color-neutral-900);
  }
  
  .footer-brand-name {
    color: var(--color-neutral-900);
  }
  
  .footer-section-title {
    color: var(--color-neutral-900);
  }
  
  .footer-link:hover,
  .footer-link:focus {
    color: var(--color-neutral-900);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .footer-link {
    transition: none;
  }
}

/* Print styles */
@media print {
  .app-footer {
    border-top: 2px solid var(--color-neutral-900);
    background: white;
  }
  
  .footer-link {
    text-decoration: underline;
  }
  
  .footer-tagline {
    display: none;
  }
}
</style>