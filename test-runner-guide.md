# Test Runner Guide
## Manual Content Wizard - Comprehensive Testing

This guide explains how to run the comprehensive test suite created for the Manual Content Wizard.

---

## Quick Start

### 1. Run All Tests (Production Readiness Check)
```bash
node run-production-tests.cjs
```
This executes the full production readiness analysis including:
- TypeScript type checking
- Component structure validation  
- Production build test
- Code quality assessment

### 2. Run Unit Tests Only
```bash
# Run all unit tests
npm run test

# Run with coverage report
npm run test:coverage

# Run specific test file
npm run test tests/unit/components/ManualContentWizard.test.ts

# Watch mode for development
npm run test:watch
```

### 3. Run Integration Tests
```bash
npm run test -- tests/integration
```

### 4. Run End-to-End Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (visual test runner)
npm run test:e2e:ui

# Run specific test file
npm run test:e2e tests/e2e/wizard-complete-flow.spec.ts

# Run accessibility tests only
npm run test:e2e tests/e2e/accessibility.spec.ts
```

### 5. Run Performance Tests
```bash
npm run test -- tests/performance
```

---

## Test Categories Explained

### Unit Tests (5 files, ~190 test cases)

**ManualContentWizard.test.ts**
- Wizard initialization and state management
- Step navigation and validation
- Draft saving and restoration
- Error handling and recovery

**SourceStep.test.ts**
- Form validation (title, content, file upload)
- Tab navigation between input methods
- Real-time statistics calculation
- Template application functionality

**ConfigureStep.test.ts** 
- Chunking method selection
- Dynamic size and overlap configuration
- Advanced settings management
- Real-time preview updates

**ProcessStep.test.ts**
- Content processing algorithms
- Progress tracking and feedback
- Chunk generation with metadata
- Memory management for large content

**chunker.test.ts**
- Text chunking utility functions
- Word/character/section-based splitting
- Overlap calculation and application
- Tag generation and filtering

### Integration Tests (1 file, ~25 test cases)

**wizard-flow.test.ts**
- Complete step-to-step data flow
- State persistence across navigation
- Error recovery mechanisms  
- Draft management integration
- Version control system integration

### End-to-End Tests (2 files, ~20 test cases)

**wizard-complete-flow.spec.ts**
- Full user workflow testing
- File upload and processing
- Real-time validation feedback
- Mobile and desktop compatibility
- Large content processing

**accessibility.spec.ts**
- WCAG AA compliance validation
- Keyboard navigation testing
- Screen reader compatibility
- High contrast mode support
- Focus management verification

### Performance Tests (1 file, ~15 test cases)

**memory-usage.test.ts**
- Memory leak detection
- Large content processing (50k+ words)
- Concurrent operation handling
- Browser compatibility performance
- Auto-save efficiency testing

---

## Test Configuration Files

### vitest.config.ts
- Unit and integration test configuration
- Coverage reporting setup (80% threshold)
- Mock environment configuration
- Test timeout and performance settings

### playwright.config.ts
- E2E test configuration for multiple browsers
- Cross-browser testing setup (Chrome, Firefox, Safari, Edge)
- Mobile device simulation
- Screenshot and video recording on failures

### tests/setup.ts
- Global test environment setup
- API mocking (IndexedDB, File API, PDF.js)
- Vue Test Utils configuration
- Browser API polyfills

---

## Running Tests in Different Environments

### Development Environment
```bash
# Quick feedback during development
npm run test:watch

# Test specific component while developing
npm run test -- --grep "SourceStep"

# Run E2E tests with UI for debugging
npm run test:e2e:ui
```

### CI/CD Pipeline
```bash
# Complete test suite for continuous integration
npm run test:all

# Production build validation
npm run test:production

# Type checking only
npm run type-check
```

### Local Production Testing
```bash
# Build and test production version
npm run build
npm run preview
npm run test:e2e

# Full production readiness check
node run-production-tests.cjs
```

---

## Understanding Test Results

### Production Readiness Score
- **85%+ : Ready for Production** ✅
- **70-84% : Needs Improvement** ⚠️  
- **<70% : Not Ready** ❌

### Coverage Requirements
- **Lines:** 80% minimum
- **Functions:** 80% minimum
- **Branches:** 80% minimum
- **Statements:** 80% minimum

### Performance Benchmarks
- **Bundle Size:** <2MB total
- **Initial Load:** <3 seconds
- **Chunk Processing:** >300 words/second
- **Memory Usage:** <200MB for large content

---

## Troubleshooting Common Issues

### TypeScript Compilation Errors
```bash
# Check TypeScript configuration
npm run type-check

# Fix common Vue import issues
# Update imports from 'vue' to explicit paths if needed
```

### Test Failures
```bash
# Run tests with verbose output
npm run test -- --reporter=verbose

# Debug specific test
npm run test -- --grep "specific test name" --reporter=verbose
```

### E2E Test Issues
```bash
# Install Playwright browsers if needed
npx playwright install

# Run with headed browser for debugging
npm run test:e2e -- --headed

# Generate test report
npm run test:e2e -- --reporter=html
```

### Performance Test Issues
```bash
# Run with increased timeout for large content
npm run test -- tests/performance --timeout=30000

# Check memory usage during tests
node --expose-gc npm run test tests/performance
```

---

## Adding New Tests

### Unit Test Template
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import YourComponent from '@/components/YourComponent.vue'

describe('YourComponent', () => {
  let wrapper: any
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    wrapper = mount(YourComponent, {
      global: { plugins: [pinia] }
    })
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  it('should render correctly', () => {
    expect(wrapper.exists()).toBe(true)
  })
})
```

### E2E Test Template
```typescript
import { test, expect } from '@playwright/test'

test.describe('Your Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should work correctly', async ({ page }) => {
    await expect(page.locator('.your-element')).toBeVisible()
  })
})
```

---

## Continuous Integration Setup

### GitHub Actions Example
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:all
      - run: node run-production-tests.cjs
```

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run type-check && npm run test:run",
      "pre-push": "npm run test:all"
    }
  }
}
```

---

## Monitoring and Reporting

### Coverage Reports
- Generated in `/coverage/` directory
- HTML report: `coverage/index.html`
- JSON report: `coverage/coverage-final.json`

### E2E Test Reports  
- Generated in `/test-results/` directory
- HTML report: `playwright-report/index.html`
- Screenshots: `test-results/*/test-failed-*.png`

### Production Readiness Reports
- Generated in `/test-reports/` directory
- JSON format: `production-readiness-{timestamp}.json`
- HTML format: `production-readiness-{timestamp}.html`

---

## Next Steps

1. **Run Initial Assessment**
   ```bash
   node run-production-tests.cjs
   ```

2. **Address Critical Issues**
   - Fix TypeScript compilation errors
   - Resolve failing tests
   - Optimize performance bottlenecks

3. **Set Up Continuous Testing**
   - Configure CI/CD pipeline
   - Add pre-commit hooks
   - Schedule regular production readiness checks

4. **Monitor Production**
   - Set up error tracking
   - Monitor performance metrics
   - Regular test suite maintenance

---

**Happy Testing!** 🚀

The comprehensive test suite ensures your Manual Content Wizard is production-ready and maintains high quality standards throughout development.