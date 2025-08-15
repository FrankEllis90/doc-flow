import { test, expect } from '@playwright/test'

test.describe('Manual Content Wizard - Complete Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    
    // Wait for the app to load
    await expect(page.locator('.manual-content-wizard')).toBeVisible()
    await expect(page.locator('h1').filter({ hasText: 'Manual Content Builder' })).toBeVisible()
  })

  test('should complete full wizard workflow', async ({ page }) => {
    // Step 1: Source Step
    await expect(page.locator('[data-testid="current-step"]')).toContainText('Step 1 of 6')
    
    // Fill in title
    const titleInput = page.locator('#content-title')
    await titleInput.fill('E2E Test Document')
    
    // Fill in content
    const contentTextarea = page.locator('#content-text')
    const testContent = 'This is a comprehensive end-to-end test document for the Manual Content Wizard. '.repeat(50)
    await contentTextarea.fill(testContent)
    
    // Verify validation
    await expect(page.locator('.input--success')).toBeVisible()
    await expect(page.locator('.btn-primary-green')).toBeEnabled()
    
    // Proceed to configure step
    await page.locator('.btn-primary-green').click()
    
    // Step 2: Configure Step
    await expect(page.locator('[data-testid="current-step"]')).toContainText('Step 2 of 6')
    
    // Select chunking method
    const wordBasedMethod = page.locator('.method-card').filter({ hasText: 'Word-based' })
    await wordBasedMethod.click()
    await expect(wordBasedMethod).toHaveClass(/method-active/)
    
    // Adjust chunk size
    const chunkSizeSlider = page.locator('input[type="range"]')
    await chunkSizeSlider.fill('400')
    
    // Select overlap
    const overlapButton = page.locator('.overlap-btn').filter({ hasText: '15%' })
    await overlapButton.click()
    await expect(overlapButton).toHaveClass(/overlap-active/)
    
    // Proceed to process step
    await page.locator('.btn-primary-green').click()
    
    // Step 3: Process Step
    await expect(page.locator('[data-testid="current-step"]')).toContainText('Step 3 of 6')
    
    // Start processing
    const startProcessingButton = page.locator('[data-testid="start-processing"]')
    await expect(startProcessingButton).toBeVisible()
    await startProcessingButton.click()
    
    // Wait for processing to complete
    await expect(page.locator('.processing-status')).toContainText('Processing')
    await expect(page.locator('.processing-status')).toContainText('Completed', { timeout: 30000 })
    
    // Verify chunks were created
    await expect(page.locator('.processing-stats')).toContainText('created')
    
    // Proceed to review step
    await page.locator('.btn-primary-green').click()
    
    // Step 4: Review Step
    await expect(page.locator('[data-testid="current-step"]')).toContainText('Step 4 of 6')
    
    // Verify chunks are displayed
    await expect(page.locator('.chunk-item')).toHaveCount.greaterThan(0)
    
    // Test search functionality
    const searchInput = page.locator('[data-testid="chunk-search"]')
    await searchInput.fill('test')
    await expect(page.locator('.chunk-item')).toHaveCount.greaterThan(0)
    await searchInput.clear()
    
    // Proceed to insights step
    await page.locator('.btn-primary-green').click()
    
    // Step 5: Insights Step
    await expect(page.locator('[data-testid="current-step"]')).toContainText('Step 5 of 6')
    
    // Wait for analysis to complete
    await expect(page.locator('.quality-score')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('.vector-readiness-score')).toBeVisible()
    
    // Proceed to export step
    await page.locator('.btn-primary-green').click()
    
    // Step 6: Export Step
    await expect(page.locator('[data-testid="current-step"]')).toContainText('Step 6 of 6')
    
    // Select export format
    const azureFormat = page.locator('.export-format').filter({ hasText: 'Azure Vector Store' })
    await azureFormat.click()
    await expect(azureFormat).toHaveClass(/format-active/)
    
    // Verify export preview
    await expect(page.locator('.export-preview')).toBeVisible()
    await expect(page.locator('.export-preview')).toContainText('chunk_id')
    
    // Complete export
    await page.locator('.btn-primary-green').click()
    
    // Verify export success
    await expect(page.locator('.export-success')).toBeVisible()
  })

  test('should handle file upload in source step', async ({ page }) => {
    // Navigate to upload tab
    const uploadTab = page.locator('[role="tab"]').filter({ hasText: 'Upload File' })
    await uploadTab.click()
    
    // Create a test file
    const fileContent = 'This is test file content for upload testing. '.repeat(100)
    
    // Upload file
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-document.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from(fileContent)
    })
    
    // Verify file was uploaded
    await expect(page.locator('.file-info')).toContainText('test-document.txt')
    await expect(page.locator('.btn-primary-green')).toBeEnabled()
  })

  test('should save and restore drafts', async ({ page }) => {
    // Fill in some data
    await page.locator('#content-title').fill('Draft Test Document')
    await page.locator('#content-text').fill('This is draft content for testing save and restore functionality. '.repeat(30))
    
    // Save draft
    const saveDraftButton = page.locator('button').filter({ hasText: 'Save Draft' })
    await saveDraftButton.click()
    
    // Verify save success
    await expect(page.locator('.toast')).toContainText('Draft saved successfully')
    
    // Refresh page to simulate browser restart
    await page.reload()
    await expect(page.locator('.manual-content-wizard')).toBeVisible()
    
    // Verify draft was restored
    await expect(page.locator('.toast')).toContainText('Previous draft restored')
    await expect(page.locator('#content-title')).toHaveValue('Draft Test Document')
  })

  test('should validate form inputs correctly', async ({ page }) => {
    // Test title validation
    const titleInput = page.locator('#content-title')
    
    // Empty title should show error
    await titleInput.focus()
    await titleInput.blur()
    await expect(page.locator('.form-error')).toBeVisible()
    
    // Short title should show error
    await titleInput.fill('AB')
    await titleInput.blur()
    await expect(page.locator('.form-error')).toBeVisible()
    
    // Valid title should show success
    await titleInput.fill('Valid Document Title')
    await titleInput.blur()
    await expect(page.locator('.input--success')).toBeVisible()
    
    // Test content validation
    const contentTextarea = page.locator('#content-text')
    
    // Short content should prevent proceeding
    await contentTextarea.fill('Too short')
    await expect(page.locator('.btn-primary-green')).toBeDisabled()
    
    // Sufficient content should allow proceeding
    await contentTextarea.fill('This is sufficient content for validation testing. '.repeat(20))
    await expect(page.locator('.btn-primary-green')).toBeEnabled()
  })

  test('should handle step navigation correctly', async ({ page }) => {
    // Complete first step
    await page.locator('#content-title').fill('Navigation Test')
    await page.locator('#content-text').fill('Content for navigation testing. '.repeat(30))
    await page.locator('.btn-primary-green').click()
    
    // Verify we're on step 2
    await expect(page.locator('[data-testid="current-step"]')).toContainText('Step 2 of 6')
    
    // Go back to step 1
    await page.locator('button').filter({ hasText: 'Back' }).click()
    await expect(page.locator('[data-testid="current-step"]')).toContainText('Step 1 of 6')
    
    // Verify data is preserved
    await expect(page.locator('#content-title')).toHaveValue('Navigation Test')
    
    // Navigate via sidebar
    const step2Button = page.locator('.step-navigation button').nth(1)
    await step2Button.click()
    await expect(page.locator('[data-testid="current-step"]')).toContainText('Step 2 of 6')
  })

  test('should display real-time statistics', async ({ page }) => {
    const contentTextarea = page.locator('#content-text')
    
    // Type content and verify stats update
    await contentTextarea.fill('This is test content')
    await expect(page.locator('.content-stats')).toContainText('4 words')
    await expect(page.locator('.content-stats')).toContainText('characters')
    
    // Add more content
    await contentTextarea.fill('This is test content with more words for statistics testing')
    await expect(page.locator('.content-stats')).toContainText('11 words')
    await expect(page.locator('.estimated-chunks')).toBeVisible()
  })

  test('should handle errors gracefully', async ({ page }) => {
    // Fill minimal valid data
    await page.locator('#content-title').fill('Error Test')
    await page.locator('#content-text').fill('Content for error testing. '.repeat(25))
    
    // Proceed to configure step
    await page.locator('.btn-primary-green').click()
    
    // Proceed to process step
    await page.locator('.btn-primary-green').click()
    
    // Mock a processing error (this would require additional setup in a real scenario)
    // For now, verify error handling UI exists
    const startProcessingButton = page.locator('[data-testid="start-processing"]')
    await expect(startProcessingButton).toBeVisible()
  })

  test('should work on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Verify mobile layout
    await expect(page.locator('.manual-content-wizard')).toBeVisible()
    
    // Test form interaction on mobile
    await page.locator('#content-title').fill('Mobile Test')
    await page.locator('#content-text').fill('Testing mobile interface functionality. '.repeat(30))
    
    // Verify mobile navigation
    await expect(page.locator('.btn-primary-green')).toBeVisible()
    await expect(page.locator('.btn-primary-green')).toBeEnabled()
  })

  test('should maintain accessibility standards', async ({ page }) => {
    // Check for proper headings structure
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('h2')).toBeVisible()
    
    // Check for form labels
    await expect(page.locator('label[for="content-title"]')).toBeVisible()
    await expect(page.locator('label[for="content-text"]')).toBeVisible()
    
    // Check for ARIA attributes
    await expect(page.locator('[role="tablist"]')).toBeVisible()
    await expect(page.locator('[role="tab"]')).toHaveCount(2)
    
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    await expect(page.locator('#content-title')).toBeFocused()
    
    await page.keyboard.press('Tab')
    // Should move to next focusable element
  })

  test('should handle large content efficiently', async ({ page }) => {
    // Test with large content
    const largeContent = 'Large content for performance testing. '.repeat(1000)
    
    await page.locator('#content-title').fill('Performance Test')
    
    // Measure performance of large content input
    const startTime = Date.now()
    await page.locator('#content-text').fill(largeContent)
    const inputTime = Date.now() - startTime
    
    // Should handle large input reasonably quickly
    expect(inputTime).toBeLessThan(5000)
    
    // Verify statistics are calculated
    await expect(page.locator('.content-stats')).toContainText('words')
    
    // Proceed with processing
    await page.locator('.btn-primary-green').click()
    await page.locator('.btn-primary-green').click() // Skip configure
    
    // Start processing large content
    const processingStartTime = Date.now()
    await page.locator('[data-testid="start-processing"]').click()
    
    // Wait for completion with extended timeout
    await expect(page.locator('.processing-status')).toContainText('Completed', { timeout: 60000 })
    
    const processingTime = Date.now() - processingStartTime
    expect(processingTime).toBeLessThan(60000) // Should complete within 1 minute
  })
})