import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/web/views/HomeView.vue'),
      meta: {
        title: 'AI Knowledge Base Builder - Transform documents into AI-ready knowledge bases',
        description: 'Create, process, and export AI-ready knowledge bases from your documents'
      }
    },
    {
      path: '/help',
      name: 'help',
      component: () => import('@/components/pages/HelpDocumentation.vue'),
      meta: {
        title: 'Help & Documentation - AI Knowledge Base Builder',
        description: 'Complete guide to using AI Knowledge Base Builder effectively'
      }
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('@/components/pages/PrivacyPolicy.vue'),
      meta: {
        title: 'Privacy Policy - AI Knowledge Base Builder',
        description: 'How we protect and handle your data'
      }
    },
    {
      path: '/accessibility',
      name: 'accessibility',
      component: () => import('@/components/pages/AccessibilityStatement.vue'),
      meta: {
        title: 'Accessibility Statement - AI Knowledge Base Builder',
        description: 'Our commitment to making our tool accessible to all users'
      }
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    // Smooth scrolling to anchor links
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 80 // Offset for fixed header
      }
    }
    // Restore scroll position on back/forward
    if (savedPosition) {
      return savedPosition
    }
    // Scroll to top for new routes
    return { top: 0 }
  }
})

// Track created meta tags for cleanup
const createdMetaTags = new Set()

// Update document title and meta with proper cleanup
router.beforeEach((to, from, next) => {
  // Update document title
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  // Handle meta description with cleanup
  if (to.meta.description) {
    let description = document.querySelector('meta[name="description"]')
    if (!description) {
      description = document.createElement('meta')
      description.setAttribute('name', 'description')
      document.head.appendChild(description)
      createdMetaTags.add(description)
    }
    description.setAttribute('content', to.meta.description)
  }
  
  next()
})

// Cleanup function for meta tags (can be called on app unmount)
export const cleanupMetaTags = () => {
  createdMetaTags.forEach(tag => {
    if (tag.parentNode) {
      tag.parentNode.removeChild(tag)
    }
  })
  createdMetaTags.clear()
}

export default router