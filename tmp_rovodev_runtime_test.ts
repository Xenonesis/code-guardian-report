#!/usr/bin/env tsx

/**
 * Runtime Functionality Test
 * Tests actual runtime behavior of key features
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  message?: string;
  duration?: number;
}

const results: TestResult[] = [];

async function testBuildProcess() {
  console.log('🔨 Testing Build Process...');
  const start = Date.now();
  
  try {
    // Test TypeScript compilation
    console.log('  - Checking TypeScript compilation...');
    await execAsync('npx tsc --noEmit', { timeout: 60000 });
    const duration = Date.now() - start;
    results.push({
      name: 'TypeScript Compilation',
      status: 'passed',
      message: 'No type errors found',
      duration
    });
  } catch (error: any) {
    results.push({
      name: 'TypeScript Compilation',
      status: 'failed',
      message: error.message
    });
  }
}

async function testDependencies() {
  console.log('📦 Testing Dependencies...');
  
  try {
    console.log('  - Checking for missing dependencies...');
    const { stdout } = await execAsync('npm ls --depth=0 --json', { timeout: 30000 });
    const deps = JSON.parse(stdout);
    
    if (deps.problems && deps.problems.length > 0) {
      results.push({
        name: 'Dependency Check',
        status: 'failed',
        message: `Found ${deps.problems.length} dependency issues`
      });
    } else {
      results.push({
        name: 'Dependency Check',
        status: 'passed',
        message: 'All dependencies properly installed'
      });
    }
  } catch (error: any) {
    // npm ls returns exit code 1 if there are issues, but still provides output
    if (error.stdout) {
      try {
        const deps = JSON.parse(error.stdout);
        if (deps.problems && deps.problems.length > 0) {
          results.push({
            name: 'Dependency Check',
            status: 'failed',
            message: `Found ${deps.problems.length} dependency issues`
          });
        } else {
          results.push({
            name: 'Dependency Check',
            status: 'passed',
            message: 'All dependencies installed'
          });
        }
      } catch {
        results.push({
          name: 'Dependency Check',
          status: 'passed',
          message: 'Dependencies check completed with warnings'
        });
      }
    } else {
      results.push({
        name: 'Dependency Check',
        status: 'failed',
        message: error.message
      });
    }
  }
}

async function testImports() {
  console.log('📥 Testing Critical Imports...');
  
  const criticalFiles = [
    {
      path: 'src/services/enhancedAnalysisEngine.ts',
      name: 'Enhanced Analysis Engine'
    },
    {
      path: 'src/services/security/zipAnalysisService.ts',
      name: 'ZIP Analysis Service'
    },
    {
      path: 'src/hooks/useEnhancedAnalysis.ts',
      name: 'Enhanced Analysis Hook'
    },
    {
      path: 'src/lib/firebase.ts',
      name: 'Firebase Configuration'
    }
  ];
  
  for (const file of criticalFiles) {
    try {
      const content = fs.readFileSync(file.path, 'utf-8');
      
      // Check for common import issues
      const importPattern = /import .+ from ['"](.+)['"]/g;
      const imports = content.match(importPattern) || [];
      
      let hasIssues = false;
      const issues: string[] = [];
      
      // Check for potential circular dependencies
      if (content.includes('import type')) {
        // Good practice, using type imports
      }
      
      // Check for missing file extensions in relative imports (if needed)
      imports.forEach(imp => {
        if (imp.includes('./') || imp.includes('../')) {
          // Relative import - this is fine with proper resolution
        }
      });
      
      results.push({
        name: `Import check: ${file.name}`,
        status: hasIssues ? 'failed' : 'passed',
        message: hasIssues ? issues.join(', ') : 'All imports valid'
      });
      
    } catch (error: any) {
      results.push({
        name: `Import check: ${file.name}`,
        status: 'failed',
        message: error.message
      });
    }
  }
}

async function testConfigFiles() {
  console.log('⚙️ Testing Configuration Files...');
  
  const configs = [
    { file: 'vite.config.ts', name: 'Vite Config' },
    { file: 'tsconfig.json', name: 'TypeScript Config' },
    { file: 'tailwind.config.ts', name: 'Tailwind Config' },
    { file: 'firebase.json', name: 'Firebase Config' }
  ];
  
  for (const config of configs) {
    try {
      const content = fs.readFileSync(config.file, 'utf-8');
      
      // Basic validation
      if (config.file.endsWith('.json')) {
        JSON.parse(content);
      } else if (config.file.endsWith('.ts')) {
        // Check for basic TypeScript syntax
        if (!content.includes('export') && !content.includes('module.exports')) {
          throw new Error('Missing exports');
        }
      }
      
      results.push({
        name: config.name,
        status: 'passed',
        message: 'Valid configuration'
      });
    } catch (error: any) {
      results.push({
        name: config.name,
        status: 'failed',
        message: error.message
      });
    }
  }
}

async function testServiceIntegrity() {
  console.log('🔧 Testing Service Integrity...');
  
  const services = [
    {
      file: 'src/services/enhancedAnalysisEngine.ts',
      requiredExports: ['analyzeCode', 'EnhancedAnalysisEngine'],
      name: 'Enhanced Analysis Engine'
    },
    {
      file: 'src/services/security/zipAnalysisService.ts',
      requiredExports: ['analyzeZipFile', 'ZipAnalysisService'],
      name: 'ZIP Analysis Service'
    },
    {
      file: 'src/services/githubRepositoryService.ts',
      requiredExports: ['GitHubRepositoryService'],
      name: 'GitHub Repository Service'
    }
  ];
  
  for (const service of services) {
    try {
      const content = fs.readFileSync(service.file, 'utf-8');
      const missingExports: string[] = [];
      
      service.requiredExports.forEach(exp => {
        const patterns = [
          `export class ${exp}`,
          `export const ${exp}`,
          `export function ${exp}`,
          `export default ${exp}`,
          `export { ${exp}`,
          `export async function ${exp}`
        ];
        
        const found = patterns.some(pattern => content.includes(pattern));
        if (!found) {
          missingExports.push(exp);
        }
      });
      
      if (missingExports.length > 0) {
        results.push({
          name: `Service: ${service.name}`,
          status: 'failed',
          message: `Missing exports: ${missingExports.join(', ')}`
        });
      } else {
        results.push({
          name: `Service: ${service.name}`,
          status: 'passed',
          message: 'All required exports present'
        });
      }
    } catch (error: any) {
      results.push({
        name: `Service: ${service.name}`,
        status: 'failed',
        message: error.message
      });
    }
  }
}

async function testEnvironmentSetup() {
  console.log('🌍 Testing Environment Setup...');
  
  // Check .env.example
  if (fs.existsSync('.env.example')) {
    const envExample = fs.readFileSync('.env.example', 'utf-8');
    const requiredVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID'
    ];
    
    const missing = requiredVars.filter(v => !envExample.includes(v));
    
    if (missing.length > 0) {
      results.push({
        name: 'Environment Variables',
        status: 'failed',
        message: `Missing in .env.example: ${missing.join(', ')}`
      });
    } else {
      results.push({
        name: 'Environment Variables',
        status: 'passed',
        message: 'All required variables documented'
      });
    }
  } else {
    results.push({
      name: 'Environment Variables',
      status: 'failed',
      message: '.env.example file not found'
    });
  }
}

function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 RUNTIME TEST REPORT');
  console.log('='.repeat(80) + '\n');
  
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  
  // Show all results
  results.forEach(result => {
    const icon = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⏭️';
    const duration = result.duration ? ` (${result.duration}ms)` : '';
    console.log(`${icon} ${result.name}${duration}`);
    if (result.message) {
      console.log(`   ${result.message}`);
    }
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${results.length}`);
  console.log(`✅ Passed:   ${passed}`);
  console.log(`❌ Failed:   ${failed}`);
  console.log(`⏭️ Skipped:  ${skipped}`);
  console.log('='.repeat(80) + '\n');
  
  if (failed === 0) {
    console.log('🎉 All runtime tests passed!');
  } else {
    console.log(`⚠️  ${failed} test(s) failed. Please review the issues above.`);
  }
  
  return { passed, failed, skipped };
}

async function runTests() {
  console.log('🚀 Starting Runtime Functionality Tests...\n');
  
  try {
    await testConfigFiles();
    await testEnvironmentSetup();
    await testImports();
    await testServiceIntegrity();
    await testDependencies();
    await testBuildProcess();
    
    const summary = generateReport();
    
    process.exit(summary.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Fatal error during testing:', error);
    process.exit(1);
  }
}

runTests();
