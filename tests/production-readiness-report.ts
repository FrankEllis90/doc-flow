import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

interface TestResult {
  category: string
  passed: number
  failed: number
  total: number
  duration: number
  coverage?: number
  details: string[]
  errors: string[]
}

interface ProductionReadinessReport {
  timestamp: string
  overallScore: number
  totalTests: number
  passedTests: number
  failedTests: number
  categories: TestResult[]
  recommendations: string[]
  criticalIssues: string[]
  coverageReport: {
    lines: number
    functions: number
    branches: number
    statements: number
  }
}

class ProductionReadinessAnalyzer {
  private report: ProductionReadinessReport = {
    timestamp: new Date().toISOString(),
    overallScore: 0,
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    categories: [],
    recommendations: [],
    criticalIssues: [],
    coverageReport: {
      lines: 0,
      functions: 0,
      branches: 0,
      statements: 0
    }
  }

  async runFullTestSuite(): Promise<ProductionReadinessReport> {
    console.log('🚀 Starting Production Readiness Analysis...\n')

    try {
      // Run unit tests with coverage
      const unitTestResult = await this.runUnitTests()
      this.report.categories.push(unitTestResult)

      // Run integration tests
      const integrationTestResult = await this.runIntegrationTests()
      this.report.categories.push(integrationTestResult)

      // Run end-to-end tests
      const e2eTestResult = await this.runE2ETests()
      this.report.categories.push(e2eTestResult)

      // Run accessibility tests
      const accessibilityTestResult = await this.runAccessibilityTests()
      this.report.categories.push(accessibilityTestResult)

      // Run performance tests
      const performanceTestResult = await this.runPerformanceTests()
      this.report.categories.push(performanceTestResult)

      // Calculate overall metrics
      this.calculateOverallMetrics()

      // Generate recommendations
      this.generateRecommendations()

      // Save report
      this.saveReport()

      console.log('✅ Production Readiness Analysis Complete!\n')
      this.printSummary()

      return this.report

    } catch (error) {
      console.error('❌ Production Readiness Analysis Failed:', error)
      throw error
    }
  }

  private async runUnitTests(): Promise<TestResult> {
    console.log('🧪 Running Unit Tests...')
    
    try {
      const startTime = Date.now()
      const output = execSync('npm run test:coverage -- --reporter=json', { 
        encoding: 'utf8',
        cwd: process.cwd()
      })
      
      const duration = Date.now() - startTime
      const results = this.parseVitestResults(output)
      
      // Extract coverage information
      const coverageOutput = execSync('npm run test:coverage -- --reporter=json-summary', { 
        encoding: 'utf8',
        cwd: process.cwd()
      })
      const coverage = this.parseCoverageResults(coverageOutput)
      
      return {
        category: 'Unit Tests',
        passed: results.passed,
        failed: results.failed,
        total: results.total,
        duration,
        coverage: coverage.lines,
        details: results.details,
        errors: results.errors
      }
    } catch (error) {
      return {
        category: 'Unit Tests',
        passed: 0,
        failed: 1,
        total: 1,
        duration: 0,
        details: [],
        errors: [`Unit test execution failed: ${error}`]
      }
    }
  }

  private async runIntegrationTests(): Promise<TestResult> {
    console.log('🔗 Running Integration Tests...')
    
    try {
      const startTime = Date.now()
      const output = execSync('npm run test -- tests/integration --reporter=json', { 
        encoding: 'utf8',
        cwd: process.cwd()
      })
      
      const duration = Date.now() - startTime
      const results = this.parseVitestResults(output)
      
      return {
        category: 'Integration Tests',
        passed: results.passed,
        failed: results.failed,
        total: results.total,
        duration,
        details: results.details,
        errors: results.errors
      }
    } catch (error) {
      return {
        category: 'Integration Tests',
        passed: 0,
        failed: 1,
        total: 1,
        duration: 0,
        details: [],
        errors: [`Integration test execution failed: ${error}`]
      }
    }
  }

  private async runE2ETests(): Promise<TestResult> {
    console.log('🌐 Running End-to-End Tests...')
    
    try {
      const startTime = Date.now()
      const output = execSync('npm run test:e2e -- --reporter=json', { 
        encoding: 'utf8',
        cwd: process.cwd()
      })
      
      const duration = Date.now() - startTime
      const results = this.parsePlaywrightResults(output)
      
      return {
        category: 'End-to-End Tests',
        passed: results.passed,
        failed: results.failed,
        total: results.total,
        duration,
        details: results.details,
        errors: results.errors
      }
    } catch (error) {
      return {
        category: 'End-to-End Tests',
        passed: 0,
        failed: 1,
        total: 1,
        duration: 0,
        details: [],
        errors: [`E2E test execution failed: ${error}`]
      }
    }
  }

  private async runAccessibilityTests(): Promise<TestResult> {
    console.log('♿ Running Accessibility Tests...')
    
    try {
      const startTime = Date.now()
      const output = execSync('npm run test:e2e -- tests/e2e/accessibility.spec.ts --reporter=json', { 
        encoding: 'utf8',
        cwd: process.cwd()
      })
      
      const duration = Date.now() - startTime
      const results = this.parsePlaywrightResults(output)
      
      return {
        category: 'Accessibility Tests',
        passed: results.passed,
        failed: results.failed,
        total: results.total,
        duration,
        details: results.details,
        errors: results.errors
      }
    } catch (error) {
      return {
        category: 'Accessibility Tests',
        passed: 0,
        failed: 1,
        total: 1,
        duration: 0,
        details: [],
        errors: [`Accessibility test execution failed: ${error}`]
      }
    }
  }

  private async runPerformanceTests(): Promise<TestResult> {
    console.log('⚡ Running Performance Tests...')
    
    try {
      const startTime = Date.now()
      const output = execSync('npm run test -- tests/performance --reporter=json', { 
        encoding: 'utf8',
        cwd: process.cwd()
      })
      
      const duration = Date.now() - startTime
      const results = this.parseVitestResults(output)
      
      return {
        category: 'Performance Tests',
        passed: results.passed,
        failed: results.failed,
        total: results.total,
        duration,
        details: results.details,
        errors: results.errors
      }
    } catch (error) {
      return {
        category: 'Performance Tests',
        passed: 0,
        failed: 1,
        total: 1,
        duration: 0,
        details: [],
        errors: [`Performance test execution failed: ${error}`]
      }
    }
  }

  private parseVitestResults(output: string): { passed: number, failed: number, total: number, details: string[], errors: string[] } {
    try {
      const lines = output.split('\n').filter(line => line.trim())
      let passed = 0
      let failed = 0
      let total = 0
      const details: string[] = []
      const errors: string[] = []

      for (const line of lines) {
        if (line.includes('✓') || line.includes('PASS')) {
          passed++
          details.push(line.trim())
        } else if (line.includes('✗') || line.includes('FAIL')) {
          failed++
          errors.push(line.trim())
        }
      }

      total = passed + failed
      return { passed, failed, total, details, errors }
    } catch (error) {
      return { passed: 0, failed: 1, total: 1, details: [], errors: [`Failed to parse test results: ${error}`] }
    }
  }

  private parsePlaywrightResults(output: string): { passed: number, failed: number, total: number, details: string[], errors: string[] } {
    try {
      const lines = output.split('\n').filter(line => line.trim())
      let passed = 0
      let failed = 0
      let total = 0
      const details: string[] = []
      const errors: string[] = []

      for (const line of lines) {
        if (line.includes('passed')) {
          const match = line.match(/(\d+) passed/)
          if (match) passed += parseInt(match[1])
        }
        if (line.includes('failed')) {
          const match = line.match(/(\d+) failed/)
          if (match) failed += parseInt(match[1])
        }
        if (line.includes('ERROR') || line.includes('FAILED')) {
          errors.push(line.trim())
        } else if (line.includes('✓') || line.includes('PASSED')) {
          details.push(line.trim())
        }
      }

      total = passed + failed
      return { passed, failed, total, details, errors }
    } catch (error) {
      return { passed: 0, failed: 1, total: 1, details: [], errors: [`Failed to parse Playwright results: ${error}`] }
    }
  }

  private parseCoverageResults(output: string): { lines: number, functions: number, branches: number, statements: number } {
    try {
      // Parse coverage JSON output
      const coverageData = JSON.parse(output)
      return {
        lines: coverageData.total?.lines?.pct || 0,
        functions: coverageData.total?.functions?.pct || 0,
        branches: coverageData.total?.branches?.pct || 0,
        statements: coverageData.total?.statements?.pct || 0
      }
    } catch (error) {
      return { lines: 0, functions: 0, branches: 0, statements: 0 }
    }
  }

  private calculateOverallMetrics(): void {
    this.report.totalTests = this.report.categories.reduce((sum, cat) => sum + cat.total, 0)
    this.report.passedTests = this.report.categories.reduce((sum, cat) => sum + cat.passed, 0)
    this.report.failedTests = this.report.categories.reduce((sum, cat) => sum + cat.failed, 0)

    // Calculate overall score (weighted)
    const weights = {
      'Unit Tests': 0.3,
      'Integration Tests': 0.25,
      'End-to-End Tests': 0.25,
      'Accessibility Tests': 0.1,
      'Performance Tests': 0.1
    }

    let weightedScore = 0
    let totalWeight = 0

    for (const category of this.report.categories) {
      const weight = weights[category.category as keyof typeof weights] || 0.1
      const categoryScore = category.total > 0 ? (category.passed / category.total) * 100 : 0
      weightedScore += categoryScore * weight
      totalWeight += weight
    }

    this.report.overallScore = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0

    // Extract coverage data from unit tests
    const unitTests = this.report.categories.find(cat => cat.category === 'Unit Tests')
    if (unitTests && unitTests.coverage) {
      this.report.coverageReport.lines = unitTests.coverage
      this.report.coverageReport.functions = unitTests.coverage
      this.report.coverageReport.branches = unitTests.coverage
      this.report.coverageReport.statements = unitTests.coverage
    }
  }

  private generateRecommendations(): void {
    const recommendations: string[] = []
    const criticalIssues: string[] = []

    // Analyze each category
    for (const category of this.report.categories) {
      const successRate = category.total > 0 ? (category.passed / category.total) * 100 : 0

      if (successRate < 80) {
        criticalIssues.push(`${category.category} success rate is ${successRate.toFixed(1)}% (below 80% threshold)`)
      }

      if (successRate < 100) {
        recommendations.push(`Improve ${category.category}: ${category.failed} failing tests need attention`)
      }

      // Category-specific recommendations
      if (category.category === 'Unit Tests' && category.coverage && category.coverage < 80) {
        recommendations.push(`Increase unit test coverage from ${category.coverage}% to at least 80%`)
      }

      if (category.category === 'Accessibility Tests' && category.failed > 0) {
        criticalIssues.push('Accessibility violations found - must be fixed before production')
      }

      if (category.category === 'Performance Tests' && category.failed > 0) {
        recommendations.push('Performance issues detected - review memory usage and response times')
      }
    }

    // Overall recommendations
    if (this.report.overallScore < 85) {
      criticalIssues.push(`Overall test score is ${this.report.overallScore}% (below 85% production threshold)`)
    }

    if (this.report.failedTests > 0) {
      recommendations.push(`Fix ${this.report.failedTests} failing tests before production deployment`)
    }

    // Best practices
    recommendations.push('Run tests in CI/CD pipeline before deployment')
    recommendations.push('Monitor production performance metrics')
    recommendations.push('Implement automated accessibility testing')
    recommendations.push('Set up error tracking and logging')

    this.report.recommendations = recommendations
    this.report.criticalIssues = criticalIssues
  }

  private saveReport(): void {
    const reportsDir = path.join(process.cwd(), 'test-reports')
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const reportPath = path.join(reportsDir, `production-readiness-${timestamp}.json`)
    
    fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2))
    
    console.log(`📄 Report saved to: ${reportPath}`)
    
    // Also save HTML report
    this.saveHTMLReport(reportsDir, timestamp)
  }

  private saveHTMLReport(reportsDir: string, timestamp: string): void {
    const htmlContent = this.generateHTMLReport()
    const htmlPath = path.join(reportsDir, `production-readiness-${timestamp}.html`)
    
    fs.writeFileSync(htmlPath, htmlContent)
    console.log(`🌐 HTML Report saved to: ${htmlPath}`)
  }

  private generateHTMLReport(): string {
    const scoreColor = this.report.overallScore >= 85 ? '#10b981' : this.report.overallScore >= 70 ? '#f59e0b' : '#ef4444'
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Production Readiness Report - Doc Layer</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 20px; background: #f9fafb; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .score { font-size: 48px; font-weight: bold; color: ${scoreColor}; }
        .content { padding: 30px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .category { margin-bottom: 20px; padding: 20px; border-radius: 6px; border-left: 4px solid #6b7280; background: #f9fafb; }
        .category.success { border-left-color: #10b981; background: #ecfdf5; }
        .category.warning { border-left-color: #f59e0b; background: #fffbeb; }
        .category.error { border-left-color: #ef4444; background: #fef2f2; }
        .metric { display: inline-block; margin-right: 20px; }
        .metric-value { font-size: 24px; font-weight: bold; }
        .metric-label { font-size: 12px; text-transform: uppercase; color: #6b7280; }
        .recommendations li { margin-bottom: 8px; }
        .critical-issues { background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 15px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Production Readiness Report</h1>
            <p>Doc Layer - Manual Content Wizard</p>
            <p>Generated: ${new Date(this.report.timestamp).toLocaleString()}</p>
            <div class="score">${this.report.overallScore}%</div>
            <p>Overall Production Readiness Score</p>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>Summary</h2>
                <div class="metric">
                    <div class="metric-value">${this.report.totalTests}</div>
                    <div class="metric-label">Total Tests</div>
                </div>
                <div class="metric">
                    <div class="metric-value" style="color: #10b981;">${this.report.passedTests}</div>
                    <div class="metric-label">Passed</div>
                </div>
                <div class="metric">
                    <div class="metric-value" style="color: #ef4444;">${this.report.failedTests}</div>
                    <div class="metric-label">Failed</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${this.report.coverageReport.lines}%</div>
                    <div class="metric-label">Code Coverage</div>
                </div>
            </div>

            ${this.report.criticalIssues.length > 0 ? `
            <div class="section">
                <h2>Critical Issues</h2>
                <div class="critical-issues">
                    <ul>
                        ${this.report.criticalIssues.map(issue => `<li>${issue}</li>`).join('')}
                    </ul>
                </div>
            </div>
            ` : ''}

            <div class="section">
                <h2>Test Categories</h2>
                ${this.report.categories.map(category => {
                  const successRate = category.total > 0 ? (category.passed / category.total) * 100 : 0
                  const categoryClass = successRate >= 90 ? 'success' : successRate >= 70 ? 'warning' : 'error'
                  
                  return `
                    <div class="category ${categoryClass}">
                        <h3>${category.category}</h3>
                        <p><strong>Success Rate:</strong> ${successRate.toFixed(1)}%</p>
                        <p><strong>Tests:</strong> ${category.passed}/${category.total} passed</p>
                        <p><strong>Duration:</strong> ${(category.duration / 1000).toFixed(1)}s</p>
                        ${category.coverage ? `<p><strong>Coverage:</strong> ${category.coverage}%</p>` : ''}
                        ${category.errors.length > 0 ? `<p><strong>Errors:</strong> ${category.errors.length}</p>` : ''}
                    </div>
                  `
                }).join('')}
            </div>

            <div class="section">
                <h2>Recommendations</h2>
                <ul class="recommendations">
                    ${this.report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        </div>

        <div class="footer">
            <p>Production readiness threshold: 85% • Generated by Doc Layer Test Suite</p>
        </div>
    </div>
</body>
</html>
    `
  }

  private printSummary(): void {
    console.log('\n📊 PRODUCTION READINESS SUMMARY')
    console.log('=' .repeat(50))
    console.log(`Overall Score: ${this.report.overallScore}%`)
    console.log(`Total Tests: ${this.report.totalTests}`)
    console.log(`Passed: ${this.report.passedTests}`)
    console.log(`Failed: ${this.report.failedTests}`)
    console.log(`Code Coverage: ${this.report.coverageReport.lines}%`)
    
    if (this.report.criticalIssues.length > 0) {
      console.log('\n❌ CRITICAL ISSUES:')
      this.report.criticalIssues.forEach(issue => console.log(`  • ${issue}`))
    }
    
    if (this.report.overallScore >= 85) {
      console.log('\n✅ READY FOR PRODUCTION')
    } else {
      console.log('\n⚠️  NOT READY FOR PRODUCTION')
      console.log('Please address the issues above before deploying.')
    }
  }
}

// Run the analysis if this file is executed directly
if (require.main === module) {
  const analyzer = new ProductionReadinessAnalyzer()
  analyzer.runFullTestSuite().catch(console.error)
}

export { ProductionReadinessAnalyzer }