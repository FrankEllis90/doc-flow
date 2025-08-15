import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.manual-content-wizard')).toBeVisible()
  })

  test('should pass axe accessibility tests on all wizard steps', async ({ page }) => {
    // Test Step 1: Source Step
    const sourceAccessibilityResults = await new AxeBuilder({ page })
      .exclude('.toast') // Exclude toast notifications which may not be present
      .analyze()
    
    expect(sourceAccessibilityResults.violations).toEqual([])

    // Complete step 1 to test step 2
    await page.locator('#content-title').fill('Accessibility Test Document')
    await page.locator('#content-text').fill('This is content for accessibility testing across all wizard steps. '.repeat(30))
    await page.locator('.btn-primary-green').click()

    // Test Step 2: Configure Step
    await expect(page.locator('[data-testid="current-step"]')).toContainText('Step 2 of 6')
    
    const configureAccessibilityResults = await new AxeBuilder({ page })
      .exclude('.toast')
      .analyze()
    
    expect(configureAccessibilityResults.violations).toEqual([])

    // Proceed to step 3
    await page.locator('.btn-primary-green').click()

    // Test Step 3: Process Step
    await expect(page.locator('[data-testid="current-step"]')).toContainText('Step 3 of 6')
    
    const processAccessibilityResults = await new AxeBuilder({ page })
      .exclude('.toast')
      .analyze()
    
    expect(processAccessibilityResults.violations).toEqual([])

    // Start processing and wait for completion
    await page.locator('[data-testid="start-processing"]').click()
    await expect(page.locator('.processing-status')).toContainText('Completed', { timeout: 30000 })
    
    // Test processing completion state
    const processCompleteResults = await new AxeBuilder({ page })
      .exclude('.toast')
      .analyze()
    
    expect(processCompleteResults.violations).toEqual([])

    // Proceed to step 4
    await page.locator('.btn-primary-green').click()

    // Test Step 4: Review Step
    await expect(page.locator('[data-testid="current-step"]')).toContainText('Step 4 of 6')
    
    const reviewAccessibilityResults = await new AxeBuilder({ page })
      .exclude('.toast')
      .analyze()
    
    expect(reviewAccessibilityResults.violations).toEqual([])

    // Proceed to step 5
    await page.locator('.btn-primary-green').click()

    // Test Step 5: Insights Step
    await expect(page.locator('[data-testid="current-step"]')).toContainText('Step 5 of 6')
    
    const insightsAccessibilityResults = await new AxeBuilder({ page })
      .exclude('.toast')
      .analyze()
    
    expect(insightsAccessibilityResults.violations).toEqual([])

    // Proceed to step 6
    await page.locator('.btn-primary-green').click()

    // Test Step 6: Export Step
    await expect(page.locator('[data-testid="current-step"]')).toContainText('Step 6 of 6')
    
    const exportAccessibilityResults = await new AxeBuilder({ page })
      .exclude('.toast')
      .analyze()
    
    expect(exportAccessibilityResults.violations).toEqual([])
  })

  test('should have proper keyboard navigation', async ({ page }) => {
    // Test initial focus
    await page.keyboard.press('Tab')
    await expect(page.locator('#content-title')).toBeFocused()

    // Navigate through form elements
    await page.keyboard.press('Tab')
    await expect(page.locator('#content-text')).toBeFocused()

    // Navigate to tabs
    await page.keyboard.press('Tab')
    const uploadTab = page.locator('[role="tab"]').filter({ hasText: 'Upload File' })
    await expect(uploadTab).toBeFocused()

    // Test tab navigation within tabs
    await page.keyboard.press('Space')
    await expect(uploadTab).toHaveAttribute('aria-selected', 'true')

    // Navigate back to type tab
    await page.keyboard.press('ArrowLeft')
    const typeTab = page.locator('[role="tab"]').filter({ hasText: 'Type or Paste' })
    await expect(typeTab).toBeFocused()
    await expect(typeTab).toHaveAttribute('aria-selected', 'true')

    // Test skip to main content functionality
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    // Should eventually reach navigation buttons
  })

  test('should have proper ARIA labels and attributes', async ({ page }) => {
    // Check form labels
    await expect(page.locator('label[for="content-title"]')).toBeVisible()
    await expect(page.locator('label[for="content-text"]')).toBeVisible()

    // Check required field indicators
    await expect(page.locator('#content-title')).toHaveAttribute('required')
    await expect(page.locator('#content-text')).toHaveAttribute('required')

    // Check tab navigation ARIA
    await expect(page.locator('[role="tablist"]')).toBeVisible()
    const tabs = page.locator('[role="tab"]')
    await expect(tabs).toHaveCount(2)

    for (let i = 0; i < 2; i++) {
      const tab = tabs.nth(i)
      await expect(tab).toHaveAttribute('aria-selected')
      await expect(tab).toHaveAttribute('role', 'tab')
    }

    // Check step navigation ARIA
    const stepButtons = page.locator('[role="button"]').filter({ hasText: /Step|Add Your Content|Configure/ })
    for (let i = 0; i < Math.min(3, await stepButtons.count()); i++) {
      const stepButton = stepButtons.nth(i)
      await expect(stepButton).toHaveAttribute('role', 'button')
      await expect(stepButton).toHaveAttribute('tabindex')
    }
  })

  test('should have proper heading structure', async ({ page }) => {
    // Check main heading
    await expect(page.locator('h1')).toHaveText('Manual Content Builder')

    // Check step heading
    await expect(page.locator('h2')).toBeVisible()

    // Verify heading hierarchy (no skipped levels)
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
    let previousLevel = 0

    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase())
      const currentLevel = parseInt(tagName.charAt(1))
      
      // Heading levels should not skip more than one level
      expect(currentLevel - previousLevel).toBeLessThanOrEqual(1)
      previousLevel = currentLevel
    }
  })

  test('should provide proper error announcements', async ({ page }) => {
    // Trigger validation error
    const titleInput = page.locator('#content-title')
    await titleInput.fill('AB') // Too short
    await titleInput.blur()

    // Check for error message
    await expect(page.locator('.form-error')).toBeVisible()
    
    // Error should be associated with input
    const errorId = await page.locator('.form-error').getAttribute('id')
    if (errorId) {
      await expect(titleInput).toHaveAttribute('aria-describedby', errorId)
    }

    // Check for live region announcements
    const liveRegions = page.locator('[aria-live]')
    expect(await liveRegions.count()).toBeGreaterThan(0)
  })

  test('should support screen reader navigation', async ({ page }) => {
    // Check for proper landmark roles
    await expect(page.locator('main, [role="main"]')).toBeVisible()
    await expect(page.locator('aside, [role="complementary"]')).toBeVisible()
    await expect(page.locator('nav, [role="navigation"]')).toBeVisible()

    // Check for skip links (if implemented)
    const skipLinks = page.locator('a[href^="#"]').filter({ hasText: /skip/i })
    if (await skipLinks.count() > 0) {
      await expect(skipLinks.first()).toBeVisible()
    }

    // Check for descriptive button text
    const buttons = page.locator('button')
    for (let i = 0; i < Math.min(5, await buttons.count()); i++) {
      const button = buttons.nth(i)
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')
      
      // Button should have either text content or aria-label
      expect(text || ariaLabel).toBeTruthy()
    }
  })

  test('should handle high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.emulateMedia({ colorScheme: 'dark' })
    
    // Check that elements are still visible
    await expect(page.locator('#content-title')).toBeVisible()
    await expect(page.locator('#content-text')).toBeVisible()
    await expect(page.locator('.btn-primary-green')).toBeVisible()

    // Check color contrast for critical elements
    const titleInput = page.locator('#content-title')
    const computedStyle = await titleInput.evaluate(el => {
      const style = window.getComputedStyle(el)
      return {
        color: style.color,
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor
      }
    })

    // Colors should be defined (not transparent or default)
    expect(computedStyle.color).not.toBe('rgba(0, 0, 0, 0)')
    expect(computedStyle.backgroundColor).toBeTruthy()
  })

  test('should support reduced motion preferences', async ({ page }) => {
    // Simulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' })
    
    // Check that animations are disabled or reduced
    const elements = page.locator('.animate-fade-in, .transition-all, [class*="transition"]')
    
    for (let i = 0; i < Math.min(3, await elements.count()); i++) {
      const element = elements.nth(i)
      const animationDuration = await element.evaluate(el => {
        const style = window.getComputedStyle(el)
        return style.animationDuration
      })
      
      // Animation duration should be very short or zero when reduced motion is preferred
      expect(animationDuration === '0s' || animationDuration === '0.01s').toBeTruthy()
    }
  })

  test('should have focus indicators', async ({ page }) => {
    // Test focus indicators on interactive elements
    const interactiveElements = [
      '#content-title',
      '#content-text',
      '.btn-primary-green',
      '[role="tab"]'
    ]

    for (const selector of interactiveElements) {
      const element = page.locator(selector).first()
      if (await element.isVisible()) {
        await element.focus()
        
        // Check for focus indicator (outline, box-shadow, etc.)
        const focusStyle = await element.evaluate(el => {
          const style = window.getComputedStyle(el)
          return {
            outline: style.outline,
            outlineWidth: style.outlineWidth,
            boxShadow: style.boxShadow,
            borderColor: style.borderColor
          }
        })

        // Should have some form of focus indicator
        const hasFocusIndicator = 
          focusStyle.outline !== 'none' ||
          focusStyle.outlineWidth !== '0px' ||
          focusStyle.boxShadow !== 'none' ||
          focusStyle.borderColor !== 'initial'

        expect(hasFocusIndicator).toBeTruthy()
      }
    }
  })

  test('should provide meaningful page titles', async ({ page }) => {
    // Check initial page title
    await expect(page).toHaveTitle(/Doc Layer|Manual Content|Builder/)

    // Page title should update based on current step (if implemented)
    const title = await page.title()
    expect(title.length).toBeGreaterThan(5)
    expect(title).not.toBe('') // Should not be empty
  })

  test('should handle form validation accessibly', async ({ page }) => {
    const titleInput = page.locator('#content-title')
    const contentTextarea = page.locator('#content-text')

    // Test required field validation
    await titleInput.focus()
    await titleInput.blur()

    // Should show validation message
    const titleError = page.locator('.form-error').first()
    await expect(titleError).toBeVisible()

    // Error should be programmatically associated
    const errorId = await titleError.getAttribute('id')
    if (errorId) {
      await expect(titleInput).toHaveAttribute('aria-describedby', errorId)
    }

    // Test content validation
    await contentTextarea.fill('Short')
    await contentTextarea.blur()

    // Should indicate invalid state
    await expect(contentTextarea).toHaveAttribute('aria-invalid', 'true')

    // Fix validation errors
    await titleInput.fill('Valid Title')
    await contentTextarea.fill('This is valid content that meets the minimum requirements. '.repeat(10))

    // Should indicate valid state
    await expect(titleInput).toHaveAttribute('aria-invalid', 'false')
    await expect(contentTextarea).toHaveAttribute('aria-invalid', 'false')
  })
})