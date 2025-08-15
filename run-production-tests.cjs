#!/usr/bin/env node

/**
 * Production Readiness Test Runner
 * Runs comprehensive tests and generates a production readiness report
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

class ProductionTestRunner {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      categories: [],
      overallScore: 0,
      recommendations: [],
      criticalIssues: []
    }
  }

  async runTests() {
    console.log('🚀 Starting Production Readiness Tests for Manual Content Wizard\n')

    try {
      // 1. Type Checking
      await this.runTypeChecking()
      
      // 2. Unit Tests (simplified)
      await this.runUnitTests()
      
      // 3. Build Test
      await this.runBuildTest()
      
      // 4. Code Quality Check
      await this.runCodeQualityCheck()
      
      // Generate final report
      this.generateReport()
      
    } catch (error) {
      console.error('❌ Production tests failed:', error.message)
      process.exit(1)
    }
  }

  async runTypeChecking() {
    console.log('🔍 Running TypeScript type checking...')
    
    try {
      const startTime = Date.now()
      execSync('npm run type-check', { stdio: 'inherit' })
      const duration = Date.now() - startTime
      
      this.results.categories.push({
        name: 'TypeScript Type Checking',
        status: 'PASS',
        duration,
        details: 'All TypeScript types are valid'
      })
      
      console.log('✅ Type checking passed\n')
    } catch (error) {
      this.results.categories.push({
        name: 'TypeScript Type Checking',
        status: 'FAIL',
        duration: 0,
        details: 'TypeScript compilation errors detected'
      })
      
      this.results.criticalIssues.push('TypeScript compilation errors must be fixed')
      console.log('❌ Type checking failed\n')
    }
  }

  async runUnitTests() {
    console.log('🧪 Running basic component validation tests...')
    
    try {
      const startTime = Date.now()
      
      // Check that all required components exist
      const requiredComponents = [
        'src/components/ManualContentWizard.vue',
        'src/components/steps/SourceStep.vue',
        'src/components/steps/ConfigureStep.vue',
        'src/components/steps/ProcessStep.vue',
        'src/components/steps/ReviewStep.vue',
        'src/components/steps/InsightsStep.vue',
        'src/components/steps/ExportStep.vue'
      ]
      
      const missingComponents = []
      for (const component of requiredComponents) {
        if (!fs.existsSync(component)) {
          missingComponents.push(component)
        }
      }
      
      const duration = Date.now() - startTime
      
      if (missingComponents.length === 0) {
        this.results.categories.push({
          name: 'Component Structure Validation',
          status: 'PASS',
          duration,
          details: `All ${requiredComponents.length} required components exist`
        })
        console.log('✅ Component structure validation passed\n')
      } else {
        this.results.categories.push({
          name: 'Component Structure Validation',
          status: 'FAIL',
          duration,
          details: `Missing components: ${missingComponents.join(', ')}`
        })
        
        this.results.criticalIssues.push(`Missing required components: ${missingComponents.join(', ')}`)
        console.log('❌ Component structure validation failed\n')
      }
      
    } catch (error) {
      console.log('❌ Component validation failed\n')
    }
  }

  async runBuildTest() {
    console.log('🏗️ Running production build test...')
    
    try {
      const startTime = Date.now()
      execSync('npm run build', { stdio: 'inherit' })
      const duration = Date.now() - startTime
      
      // Check if dist folder was created and has content
      const distExists = fs.existsSync('dist')
      const indexExists = fs.existsSync('dist/index.html')
      
      if (distExists && indexExists) {
        this.results.categories.push({
          name: 'Production Build',
          status: 'PASS',
          duration,
          details: 'Production build completed successfully'
        })
        console.log('✅ Production build passed\n')
      } else {
        this.results.categories.push({
          name: 'Production Build',
          status: 'FAIL',
          duration,
          details: 'Build completed but output files missing'
        })
        
        this.results.criticalIssues.push('Production build does not generate required files')
        console.log('❌ Production build failed - missing output files\n')
      }
      
    } catch (error) {
      this.results.categories.push({
        name: 'Production Build',
        status: 'FAIL',
        duration: 0,
        details: `Build failed: ${error.message}`
      })
      
      this.results.criticalIssues.push('Production build fails - cannot deploy')
      console.log('❌ Production build failed\n')
    }
  }

  async runCodeQualityCheck() {
    console.log('📊 Running code quality checks...')
    
    try {
      const startTime = Date.now()
      
      // Check for key files and their content
      const qualityChecks = [
        { file: 'package.json', check: this.checkPackageJson.bind(this) },
        { file: 'README.md', check: this.checkReadme.bind(this) },
        { file: 'src/components/ManualContentWizard.vue', check: this.checkMainComponent.bind(this) },
        { file: 'src/utils/chunker.js', check: this.checkChunkerUtility.bind(this) }
      ]
      
      let passedChecks = 0
      const issues = []
      
      for (const { file, check } of qualityChecks) {
        if (fs.existsSync(file)) {
          const result = check(file)
          if (result.passed) {
            passedChecks++
          } else {
            issues.push(`${file}: ${result.issue}`)
          }
        } else {
          issues.push(`Missing file: ${file}`)
        }
      }
      
      const duration = Date.now() - startTime
      const successRate = (passedChecks / qualityChecks.length) * 100
      
      this.results.categories.push({
        name: 'Code Quality',
        status: successRate >= 80 ? 'PASS' : 'FAIL',
        duration,
        details: `${passedChecks}/${qualityChecks.length} quality checks passed (${successRate.toFixed(1)}%)`
      })
      
      if (issues.length > 0) {
        this.results.recommendations.push(`Address code quality issues: ${issues.join(', ')}`)
      }
      
      console.log(`✅ Code quality check completed (${successRate.toFixed(1)}% passed)\n`)
      
    } catch (error) {
      console.log('❌ Code quality check failed\n')
    }
  }

  checkPackageJson(filePath) {
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      
      if (!content.scripts || !content.scripts.build || !content.scripts.dev) {
        return { passed: false, issue: 'Missing required scripts' }
      }
      
      if (!content.dependencies || !content.dependencies.vue) {
        return { passed: false, issue: 'Missing Vue.js dependency' }
      }
      
      return { passed: true }
    } catch (error) {
      return { passed: false, issue: 'Invalid JSON format' }
    }
  }

  checkReadme(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      
      if (content.length < 100) {
        return { passed: false, issue: 'README too short' }
      }
      
      if (!content.toLowerCase().includes('doc layer') && !content.toLowerCase().includes('manual content')) {
        return { passed: false, issue: 'README missing project description' }
      }
      
      return { passed: true }
    } catch (error) {
      return { passed: false, issue: 'Cannot read README' }
    }
  }

  checkMainComponent(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      
      if (!content.includes('<template>') || !content.includes('<script setup')) {
        return { passed: false, issue: 'Invalid Vue component structure' }
      }
      
      if (!content.includes('currentStep') || !content.includes('nextStep')) {
        return { passed: false, issue: 'Missing wizard navigation logic' }
      }
      
      return { passed: true }
    } catch (error) {
      return { passed: false, issue: 'Cannot read component file' }
    }
  }

  checkChunkerUtility(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      
      if (!content.includes('chunkText') && !content.includes('function') && !content.includes('export')) {
        return { passed: false, issue: 'Missing chunking functionality' }
      }
      
      return { passed: true }
    } catch (error) {
      return { passed: false, issue: 'Cannot read chunker utility' }
    }
  }

  generateReport() {
    // Calculate overall score
    const passedCategories = this.results.categories.filter(cat => cat.status === 'PASS').length
    const totalCategories = this.results.categories.length
    this.results.overallScore = totalCategories > 0 ? Math.round((passedCategories / totalCategories) * 100) : 0

    // Generate recommendations based on results
    if (this.results.overallScore < 85) {
      this.results.recommendations.push('Overall score below production threshold (85%)')
    }

    if (this.results.criticalIssues.length === 0 && this.results.overallScore >= 85) {
      this.results.recommendations.push('Application appears ready for production deployment')
    }

    // Add general recommendations
    this.results.recommendations.push('Test in multiple browsers before deployment')
    this.results.recommendations.push('Monitor application performance in production')
    this.results.recommendations.push('Set up error tracking and logging')

    this.printSummary()
    this.saveReport()
  }

  printSummary() {
    console.log('\n' + '='.repeat(60))
    console.log('📊 PRODUCTION READINESS SUMMARY')
    console.log('='.repeat(60))
    console.log(`Overall Score: ${this.results.overallScore}%`)
    console.log(`Test Categories: ${this.results.categories.length}`)
    console.log(`Passed: ${this.results.categories.filter(cat => cat.status === 'PASS').length}`)
    console.log(`Failed: ${this.results.categories.filter(cat => cat.status === 'FAIL').length}`)
    
    console.log('\n📋 CATEGORY RESULTS:')
    this.results.categories.forEach(category => {
      const icon = category.status === 'PASS' ? '✅' : '❌'
      console.log(`${icon} ${category.name}: ${category.status} (${category.duration}ms)`)
      if (category.details) {
        console.log(`   ${category.details}`)
      }
    })
    
    if (this.results.criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES:')
      this.results.criticalIssues.forEach(issue => {
        console.log(`   • ${issue}`)
      })
    }
    
    console.log('\n💡 RECOMMENDATIONS:')
    this.results.recommendations.forEach(rec => {
      console.log(`   • ${rec}`)
    })
    
    if (this.results.overallScore >= 85 && this.results.criticalIssues.length === 0) {
      console.log('\n🎉 READY FOR PRODUCTION!')
      console.log('The Manual Content Wizard passes all critical checks.')
    } else {
      console.log('\n⚠️ NOT READY FOR PRODUCTION')
      console.log('Please address the issues above before deploying.')
    }
    
    console.log('\n' + '='.repeat(60))
  }

  saveReport() {
    const reportsDir = 'test-reports'
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir)
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const reportPath = path.join(reportsDir, `production-readiness-${timestamp}.json`)
    
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2))
    console.log(`\n📄 Detailed report saved to: ${reportPath}`)
  }
}

// Run tests if script is executed directly
if (require.main === module) {
  const runner = new ProductionTestRunner()
  runner.runTests().catch(error => {
    console.error('Test runner failed:', error)
    process.exit(1)
  })
}

module.exports = ProductionTestRunner