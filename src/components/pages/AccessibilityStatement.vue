<template>
  <div class="documentation-page">
    <!-- App Header -->
    <AppHeader />
    
    <!-- Documentation Content -->
    <DocumentationLayout
      page-title="Accessibility Statement"
      page-description="Our commitment to making Ragara accessible to all users"
      last-updated="January 2025"
      :show-toc="true"
    >
    <template #table-of-contents>
      <ul class="toc-list">
        <li><a href="#commitment" class="toc-link">Our Commitment</a></li>
        <li><a href="#standards" class="toc-link">Accessibility Standards</a></li>
        <li><a href="#features" class="toc-link">Accessibility Features</a></li>
        <li><a href="#testing" class="toc-link">Testing & Validation</a></li>
        <li><a href="#limitations" class="toc-link">Known Limitations</a></li>
        <li><a href="#assistive-technologies" class="toc-link">Assistive Technologies</a></li>
        <li><a href="#feedback" class="toc-link">Feedback & Support</a></li>
      </ul>
    </template>

    <section id="commitment">
      <h2>Our Commitment to Accessibility</h2>
      
      <div class="accessibility-highlight">
        <h3>♿ Universal Design</h3>
        <p><strong>Ragara is designed to be usable by everyone, regardless of ability, technology, or experience level.</strong></p>
      </div>

      <p>We believe that digital tools should be accessible to all users, including those with disabilities. Our commitment extends beyond compliance to creating an inclusive experience that empowers everyone to transform documents into AI-ready knowledge bases effectively.</p>

      <h3>Accessibility Principles</h3>
      <ul>
        <li><strong>Perceivable</strong>: Information presented in ways all users can perceive</li>
        <li><strong>Operable</strong>: Interface components are operable by all users</li>
        <li><strong>Understandable</strong>: Information and UI operation are understandable</li>
        <li><strong>Robust</strong>: Content works with various assistive technologies</li>
      </ul>
    </section>

    <section id="standards">
      <h2>Accessibility Standards</h2>
      
      <h3>WCAG 2.1 AA Compliance</h3>
      <p>Ragara is designed to meet <a href="https://www.w3.org/WAI/WCAG21/quickref/">Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</a> standards. This includes:</p>
      
      <div class="standards-grid">
        <div class="standard-card">
          <h4>Level A</h4>
          <ul>
            <li>All images have alternative text</li>
            <li>All content is keyboard accessible</li>
            <li>No seizure-inducing content</li>
            <li>Page structure uses proper headings</li>
            <li>Links have descriptive text</li>
          </ul>
        </div>
        
        <div class="standard-card">
          <h4>Level AA</h4>
          <ul>
            <li>Minimum 4.5:1 contrast ratio for text</li>
            <li>Text can be resized to 200% without loss of functionality</li>
            <li>Audio and video have captions</li>
            <li>Content is readable and functional in both portrait and landscape</li>
            <li>Multiple ways to access content</li>
          </ul>
        </div>
      </div>

      <h3>Additional Standards</h3>
      <ul>
        <li><strong>Section 508</strong>: US federal accessibility requirements</li>
        <li><strong>EN 301 549</strong>: European accessibility standard</li>
        <li><strong>ADA</strong>: Americans with Disabilities Act principles</li>
        <li><strong>ARIA</strong>: Accessible Rich Internet Applications specifications</li>
      </ul>
    </section>

    <section id="features">
      <h2>Accessibility Features</h2>
      
      <h3>Visual Accessibility</h3>
      <ul>
        <li><strong>High Contrast Design</strong>: All text meets minimum contrast ratios</li>
        <li><strong>Color Independence</strong>: Information doesn't rely solely on color</li>
        <li><strong>Scalable Text</strong>: Interface works at 200% zoom without horizontal scrolling</li>
        <li><strong>Clear Focus Indicators</strong>: Visible focus rings for keyboard navigation</li>
        <li><strong>Readable Fonts</strong>: Professional typography optimized for readability</li>
        <li><strong>Dark Mode Ready</strong>: Supports system dark mode preferences</li>
      </ul>

      <h3>Motor Accessibility</h3>
      <ul>
        <li><strong>Large Touch Targets</strong>: Minimum 44px touch targets on mobile</li>
        <li><strong>Keyboard Navigation</strong>: Full functionality available via keyboard</li>
        <li><strong>No Time Limits</strong>: No content disappears or requires quick actions</li>
        <li><strong>Drag & Drop Alternatives</strong>: Click-to-browse file selection</li>
        <li><strong>Generous Click Areas</strong>: Easy-to-target interface elements</li>
      </ul>

      <h3>Cognitive Accessibility</h3>
      <ul>
        <li><strong>Clear Language</strong>: Simple, jargon-free instructions</li>
        <li><strong>Consistent Navigation</strong>: Predictable interface patterns</li>
        <li><strong>Progress Indicators</strong>: Clear feedback during processing</li>
        <li><strong>Error Prevention</strong>: Validation and confirmation dialogs</li>
        <li><strong>Help Context</strong>: Explanatory text and tooltips</li>
        <li><strong>Chunked Information</strong>: Complex processes broken into steps</li>
      </ul>

      <h3>Screen Reader Support</h3>
      <ul>
        <li><strong>Semantic HTML</strong>: Proper heading hierarchy and structure</li>
        <li><strong>ARIA Labels</strong>: Descriptive labels for complex interactions</li>
        <li><strong>Live Regions</strong>: Announcements for dynamic content changes</li>
        <li><strong>Skip Links</strong>: Quick navigation to main content</li>
        <li><strong>Table Headers</strong>: Proper association in data tables</li>
        <li><strong>Form Labels</strong>: Clear associations between labels and inputs</li>
      </ul>
    </section>

    <section id="testing">
      <h2>Testing & Validation</h2>
      
      <h3>Automated Testing</h3>
      <p>We use automated tools to continuously monitor accessibility:</p>
      <ul>
        <li><strong>axe-core</strong>: Automated accessibility testing engine</li>
        <li><strong>WAVE</strong>: Web Accessibility Evaluation Tool</li>
        <li><strong>Lighthouse</strong>: Google's accessibility auditing</li>
        <li><strong>Color Contrast Analyzers</strong>: Ongoing contrast validation</li>
      </ul>

      <h3>Manual Testing</h3>
      <p>Regular manual testing includes:</p>
      <ul>
        <li><strong>Keyboard Navigation</strong>: Complete interface testing with keyboard only</li>
        <li><strong>Screen Reader Testing</strong>: NVDA, JAWS, and VoiceOver compatibility</li>
        <li><strong>Magnification Testing</strong>: 200% and 400% zoom level validation</li>
        <li><strong>High Contrast Mode</strong>: Windows high contrast mode compatibility</li>
        <li><strong>Voice Control</strong>: Dragon NaturallySpeaking compatibility testing</li>
      </ul>

      <h3>User Testing</h3>
      <p>We conduct regular accessibility testing with:</p>
      <ul>
        <li>Users with visual impairments</li>
        <li>Users with motor disabilities</li>
        <li>Users with cognitive disabilities</li>
        <li>Assistive technology experts</li>
        <li>Accessibility consultants</li>
      </ul>
    </section>

    <section id="limitations">
      <h2>Known Limitations</h2>
      
      <h3>Current Limitations</h3>
      <p>We're actively working to address these known accessibility limitations:</p>
      
      <ul>
        <li><strong>PDF Content Processing</strong>: Some complex PDF layouts may not be fully accessible during processing</li>
        <li><strong>Large File Progress</strong>: Progress announcements for very large files may be delayed</li>
        <li><strong>Complex Data Visualizations</strong>: Some charts and graphs have limited screen reader descriptions</li>
        <li><strong>Mobile Keyboard Navigation</strong>: Some mobile browsers have limited keyboard navigation support</li>
      </ul>

      <h3>Planned Improvements</h3>
      <ul>
        <li><strong>Enhanced PDF Processing</strong>: Improved accessibility for complex PDF layouts</li>
        <li><strong>Better Voice Announcements</strong>: More detailed screen reader feedback</li>
        <li><strong>Customizable UI</strong>: User-controlled color themes and text sizing</li>
        <li><strong>Additional Language Support</strong>: Screen reader support for more languages</li>
      </ul>

      <h3>Workarounds</h3>
      <p>For current limitations, we recommend:</p>
      <ul>
        <li>Using desktop browsers when possible for full keyboard support</li>
        <li>Enabling high contrast mode if you have vision difficulties</li>
        <li>Using zoom features for better text readability</li>
        <li>Contacting us for assistance with complex PDF processing</li>
      </ul>
    </section>

    <section id="assistive-technologies">
      <h2>Supported Assistive Technologies</h2>
      
      <h3>Screen Readers</h3>
      <div class="tech-grid">
        <div class="tech-card">
          <h4>✅ Fully Supported</h4>
          <ul>
            <li><strong>NVDA</strong> (Windows) - Latest version</li>
            <li><strong>JAWS</strong> (Windows) - Version 2020+</li>
            <li><strong>VoiceOver</strong> (macOS/iOS) - Built-in</li>
            <li><strong>TalkBack</strong> (Android) - Built-in</li>
            <li><strong>Narrator</strong> (Windows) - Built-in</li>
          </ul>
        </div>
        
        <div class="tech-card">
          <h4>🔶 Partially Supported</h4>
          <ul>
            <li><strong>Dragon NaturallySpeaking</strong> - Voice commands work for most functions</li>
            <li><strong>Voice Control</strong> (macOS) - Basic navigation supported</li>
            <li><strong>Switch Control</strong> (iOS) - Interface is switch-accessible</li>
          </ul>
        </div>
      </div>

      <h3>Browser Compatibility</h3>
      <p>Accessibility features work best in:</p>
      <ul>
        <li><strong>Chrome</strong> 90+ with full accessibility API support</li>
        <li><strong>Firefox</strong> 88+ with screen reader optimizations</li>
        <li><strong>Safari</strong> 14+ with VoiceOver integration</li>
        <li><strong>Edge</strong> 90+ with Windows accessibility features</li>
      </ul>

      <h3>Operating System Features</h3>
      <ul>
        <li><strong>Windows</strong>: High contrast mode, magnifier, narrator integration</li>
        <li><strong>macOS</strong>: VoiceOver, zoom, voice control compatibility</li>
        <li><strong>iOS</strong>: VoiceOver, switch control, voice control support</li>
        <li><strong>Android</strong>: TalkBack, switch access, voice access support</li>
      </ul>
    </section>

    <section id="feedback">
      <h2>Feedback & Support</h2>
      
      <h3>Accessibility Feedback</h3>
      <p>We actively seek feedback to improve accessibility. Please contact us if you:</p>
      <ul>
        <li>Encounter accessibility barriers</li>
        <li>Have suggestions for improvements</li>
        <li>Need assistance using specific features</li>
        <li>Want to report accessibility issues</li>
      </ul>

      <div class="contact-info">
        <h3>Get Accessibility Support</h3>
        <ul>
          <li><strong>Email</strong>: accessibility@aiknowledgebuilder.com</li>
          <li><strong>Response Time</strong>: Within 2 business days</li>
          <li><strong>Feedback Form</strong>: Use "Send Feedback" link in footer</li>
          <li><strong>Phone Support</strong>: Available upon request for accessibility issues</li>
        </ul>
      </div>

      <h3>Alternative Formats</h3>
      <p>If you need this accessibility statement or our help documentation in an alternative format:</p>
      <ul>
        <li><strong>Large Print</strong>: PDF versions available</li>
        <li><strong>Audio Format</strong>: Screen reader-friendly versions</li>
        <li><strong>Plain Text</strong>: Simplified text versions</li>
        <li><strong>Multiple Languages</strong>: Translations available upon request</li>
      </ul>

      <h3>Continuous Improvement</h3>
      <p>We're committed to continuously improving accessibility:</p>
      <ul>
        <li><strong>Regular Audits</strong>: Quarterly accessibility assessments</li>
        <li><strong>User Feedback Integration</strong>: Accessibility improvements based on user input</li>
        <li><strong>Technology Updates</strong>: Staying current with accessibility best practices</li>
        <li><strong>Training</strong>: Ongoing accessibility education for our development team</li>
      </ul>

      <p><em>This accessibility statement was last reviewed and updated in January 2025. We review and update this statement annually or when significant changes are made to our application.</em></p>
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

.accessibility-highlight {
  background: var(--color-primary-50);
  border: 1px solid var(--color-primary-200);
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1.5rem 0;
}

.accessibility-highlight h3 {
  margin: 0 0 0.75rem 0;
  color: var(--color-primary-700);
  font-size: 1.125rem;
}

.accessibility-highlight p {
  margin: 0;
  color: var(--color-primary-800);
  font-size: 1rem;
}

.standards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.standard-card {
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: 8px;
  padding: 1.5rem;
}

.standard-card h4 {
  margin: 0 0 1rem 0;
  color: var(--color-primary-600);
  font-size: 1.125rem;
}

.standard-card ul {
  margin: 0;
  color: var(--color-neutral-600);
  font-size: 0.875rem;
  line-height: 1.5;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.tech-card {
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: 8px;
  padding: 1.5rem;
}

.tech-card h4 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
}

.tech-card ul {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
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