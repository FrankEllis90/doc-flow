<template>
  <header class="app-navbar">
    <div class="navbar-container">
      <!-- Enhanced Logo & Brand Section -->
      <a href="/" class="brand-link" aria-label="Go to homepage">
        <div class="brand-section">
          <div class="logo-container">
            <img 
              src="/circuit-tree-logo.png" 
              alt="Ragara Logo" 
              class="brand-logo"
              @error="handleImageError"
            />
            <!-- Fallback icon if image fails to load -->
            <svg v-if="!imageLoaded" class="brand-logo-fallback" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 9.74s9-4.19 9-9.74V7L12 2z M12 4.44L18 8.08v8.92c0 4.24-2.9 7.26-6 7.26s-6-3.02-6-7.26V8.08L12 4.44z M8 10v6h2v-2h2v2h2v-6H8z M10 12h2v-1h-2v1z"/>
            </svg>
          </div>
          <div class="brand-text">
            <h1 class="brand-title">Ragara</h1>
            <span class="brand-subtitle">Create • Process • Export</span>
          </div>
        </div>
      </a>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  data() {
    return {
      imageLoaded: true
    }
  },
  methods: {
    handleImageError() {
      console.log('Logo image failed to load, showing fallback');
      this.imageLoaded = false;
    }
  }
}
</script>

<style scoped>
.app-navbar {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 4px solid var(--color-primary-500);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 50;
}

.navbar-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 5rem; /* 80px - much taller for better presence */
}

.brand-link {
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
  border-radius: 12px;
  padding: 0.75rem;
  margin: -0.75rem;
  transition: all 0.2s ease;
}

.brand-link:hover {
  background: rgba(79, 107, 245, 0.05);
  transform: translateY(-1px);
}

.brand-link:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 107, 245, 0.3);
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 1rem; /* 16px - optimal spacing */
  min-width: 0; /* Prevents text truncation */
}

.logo-container {
  flex-shrink: 0; /* Prevents logo from shrinking */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem; /* 56px - much larger than current 48px */
  height: 3.5rem;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  border-radius: 12px;
  padding: 0.5rem;
  box-shadow: 
    0 4px 12px rgba(79, 107, 245, 0.15),
    0 2px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: all 0.2s ease;
  /* DEBUG: Add min-height to ensure container is visible */
  min-width: 3.5rem;
  min-height: 3.5rem;
}

.logo-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.1));
  border-radius: 12px;
  pointer-events: none;
}

.brand-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  position: relative;
  z-index: 1;
  /* Remove filters that might be hiding the logo */
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
}

.brand-logo-fallback {
  width: 100%;
  height: 100%;
  color: white;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
}

.brand-link:hover .logo-container {
  box-shadow: 
    0 6px 16px rgba(79, 107, 245, 0.2),
    0 4px 8px rgba(0, 0, 0, 0.15);
  transform: scale(1.05);
}

.brand-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  line-height: 1;
}

.brand-title {
  font-size: 1.5rem; /* 24px - much larger than current 20px */
  font-weight: 700;
  color: var(--color-neutral-900);
  line-height: 1.2;
  margin: 0;
  letter-spacing: -0.025em;
  white-space: nowrap;
  font-family: var(--font-display);
}

.brand-subtitle {
  font-size: 0.8rem; /* 13px */
  font-weight: 500;
  color: var(--color-primary-600);
  line-height: 1;
  margin-top: 0.25rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-family: var(--font-ui);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .navbar-container {
    padding: 0 1rem;
    height: 4.5rem; /* 72px */
  }
  
  .brand-section {
    gap: 0.875rem; /* 14px */
  }
  
  .logo-container {
    width: 3rem; /* 48px */
    height: 3rem;
  }
  
  .brand-title {
    font-size: 1.25rem; /* 20px */
  }
  
  .brand-subtitle {
    font-size: 0.75rem; /* 12px */
  }
}

@media (max-width: 640px) {
  .navbar-container {
    height: 4rem; /* 64px */
  }
  
  .brand-title {
    font-size: 1.125rem; /* 18px */
  }
  
  .logo-container {
    width: 2.75rem; /* 44px */
    height: 2.75rem;
  }
}

@media (max-width: 480px) {
  .brand-subtitle {
    display: none; /* Hide subtitle on very small screens */
  }
  
  .brand-title {
    font-size: 1rem; /* 16px */
  }
  
  .logo-container {
    width: 2.5rem; /* 40px */
    height: 2.5rem;
  }
}

/* Ultra-wide screens - make it even more prominent */
@media (min-width: 1536px) {
  .navbar-container {
    height: 5.5rem; /* 88px */
  }
  
  .logo-container {
    width: 4rem; /* 64px */
    height: 4rem;
  }
  
  .brand-title {
    font-size: 1.75rem; /* 28px */
  }
  
  .brand-subtitle {
    font-size: 0.875rem; /* 14px */
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .logo-container {
    border: 2px solid var(--color-neutral-900);
  }
  
  .brand-title {
    color: var(--color-neutral-900);
  }
  
  .brand-subtitle {
    color: var(--color-neutral-700);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .brand-link,
  .logo-container {
    transition: none;
  }
  
  .brand-link:hover {
    transform: none;
  }
  
  .brand-link:hover .logo-container {
    transform: none;
  }
}

/* Print styles */
@media print {
  .app-navbar {
    box-shadow: none;
    border-bottom: 2px solid var(--color-neutral-900);
    background: white;
  }
  
  .brand-link:hover {
    background: none;
    transform: none;
  }
}
</style>