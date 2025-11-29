#!/usr/bin/env tsx

/**
 * Integration Test - Tests the actual running application
 */

import { spawn } from 'child_process';
import fs from 'fs';

interface TestResult {
  category: string;
  name: string;
  status: 'passed' | 'failed' | 'warning';
  message?: string;
}

const results: TestResult[] = [];

function addResult(category: string, name: string, status: 'passed' | 'failed' | 'warning', message?: string) {
  results.push({ category, name, status, message });
}

async function testBuildOutput() {
  console.log('🏗️  Testing Build Output...');
  
  // Check if we can create a production build
  return new Promise<void>((resolve) => {
    console.log('  - Running production build...');
    const build = spawn('npm', ['run', 'build'], { shell: true });
    
    let buildOutput = '';
    let hasError = false;
    
    build.stdout?.on('data', (data) => {
      buildOutput += data.toString();
    });
    
    build.stderr?.on('data', (data) => {
      const error = data.toString();
      if (error.includes('error') || error.includes('Error')) {
        hasError = true;
        buildOutput += error;
      }
    });
    
    build.on('close', (code) => {
      if (code === 0 && !hasError) {
        addResult('Build', 'Production Build', 'passed', 'Build completed successfully');
        
        // Check if dist folder was created
        if (fs.existsSync('dist')) {
          addResult('Build', 'Dist Folder Created', 'passed', 'Output directory exists');
          
          // Check for essential files
          const essentialFiles = ['index.html', 'assets'];
          essentialFiles.forEach(file => {
            const exists = fs.existsSync(`dist/${file}`);
            addResult('Build', `Build Output: ${file}`, exists ? 'passed' : 'failed', 
              exists ? 'File/folder present' : 'Missing from build output');
          });
        } else {
          addResult('Build', 'Dist Folder Created', 'failed', 'Dist folder not found');
        }
      } else {
        addResult('Build', 'Production Build', 'failed', `Build failed with code ${code}`);
      }
      resolve();
    });
    
    // Timeout after 2 minutes
    setTimeout(() => {
      build.kill();
      addResult('Build', 'Production Build', 'failed', 'Build timeout (exceeded 2 minutes)');
      resolve();
    }, 120000);
  });
}

async function testPublicAssets() {
  console.log('🖼️  Testing Public Assets...');
  
  const requiredAssets = [
    'public/manifest.json',
    'public/sw.js',
    'public/favicon.ico',
    'public/robots.txt'
  ];
  
  requiredAssets.forEach(asset => {
    const exists = fs.existsSync(asset);
    addResult('Assets', asset, exists ? 'passed' : 'failed', 
      exists ? 'Asset found' : 'Missing asset');
  });
  
  // Check manifest.json content
  if (fs.existsSync('public/manifest.json')) {
    try {
      const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf-8'));
      const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
      
      requiredFields.forEach(field => {
        if (manifest[field]) {
          addResult('Assets', `Manifest: ${field}`, 'passed', 'Field present');
        } else {
          addResult('Assets', `Manifest: ${field}`, 'failed', 'Missing field');
        }
      });
    } catch (error) {
      addResult('Assets', 'Manifest Validation', 'failed', 'Invalid JSON');
    }
  }
}

async function testFirebaseConfiguration() {
  console.log('🔥 Testing Firebase Configuration...');
  
  // Check firebase.json
  if (fs.existsSync('firebase.json')) {
    try {
      const firebaseConfig = JSON.parse(fs.readFileSync('firebase.json', 'utf-8'));
      
      if (firebaseConfig.hosting) {
        addResult('Firebase', 'Hosting Configuration', 'passed', 'Hosting config present');
      } else {
        addResult('Firebase', 'Hosting Configuration', 'warning', 'No hosting config');
      }
      
      if (firebaseConfig.firestore) {
        addResult('Firebase', 'Firestore Configuration', 'passed', 'Firestore config present');
      } else {
        addResult('Firebase', 'Firestore Configuration', 'warning', 'No firestore config');
      }
    } catch (error) {
      addResult('Firebase', 'Configuration', 'failed', 'Invalid firebase.json');
    }
  } else {
    addResult('Firebase', 'Configuration File', 'failed', 'firebase.json not found');
  }
  
  // Check firestore rules
  if (fs.existsSync('firestore.rules')) {
    const rules = fs.readFileSync('firestore.rules', 'utf-8');
    if (rules.includes('match')) {
      addResult('Firebase', 'Firestore Rules', 'passed', 'Rules file valid');
    } else {
      addResult('Firebase', 'Firestore Rules', 'warning', 'Rules may be incomplete');
    }
  }
}

async function testEnvironmentConfiguration() {
  console.log('🌍 Testing Environment Configuration...');
  
  if (fs.existsSync('.env.example')) {
    const envExample = fs.readFileSync('.env.example', 'utf-8');
    const requiredVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID'
    ];
    
    requiredVars.forEach(varName => {
      if (envExample.includes(varName)) {
        addResult('Environment', varName, 'passed', 'Variable documented');
      } else {
        addResult('Environment', varName, 'warning', 'Variable not in .env.example');
      }
    });
  } else {
    addResult('Environment', '.env.example', 'failed', 'File not found');
  }
}

async function testSecurityFiles() {
  console.log('🔒 Testing Security Files...');
  
  const securityFiles = [
    { file: 'public/robots.txt', name: 'robots.txt' },
    { file: '.gitignore', name: '.gitignore' },
    { file: 'LICENSE', name: 'LICENSE' }
  ];
  
  securityFiles.forEach(({ file, name }) => {
    const exists = fs.existsSync(file);
    addResult('Security', name, exists ? 'passed' : 'warning', 
      exists ? 'File present' : 'File missing');
  });
  
  // Check .gitignore content
  if (fs.existsSync('.gitignore')) {
    const gitignore = fs.readFileSync('.gitignore', 'utf-8');
    const essentialIgnores = ['node_modules', '.env', 'dist'];
    
    essentialIgnores.forEach(ignore => {
      if (gitignore.includes(ignore)) {
        addResult('Security', `.gitignore: ${ignore}`, 'passed', 'Entry present');
      } else {
        addResult('Security', `.gitignore: ${ignore}`, 'warning', 'Entry missing');
      }
    });
  }
}

async function testCodeQuality() {
  console.log('✨ Testing Code Quality...');
  
  // Check for essential config files
  const configFiles = [
    { file: 'tsconfig.json', name: 'TypeScript Config' },
    { file: 'eslint.config.js', name: 'ESLint Config' },
    { file: 'tailwind.config.ts', name: 'Tailwind Config' },
    { file: 'postcss.config.js', name: 'PostCSS Config' }
  ];
  
  configFiles.forEach(({ file, name }) => {
    const exists = fs.existsSync(file);
    addResult('Code Quality', name, exists ? 'passed' : 'warning', 
      exists ? 'Config present' : 'Config missing');
  });
}

async function testDocumentation() {
  console.log('📚 Testing Documentation...');
  
  const docs = [
    { file: 'README.md', name: 'README' },
    { file: 'LICENSE', name: 'LICENSE' },
    { file: 'md/CONTRIBUTING.md', name: 'Contributing Guide' },
    { file: 'md/CODE_OF_CONDUCT.md', name: 'Code of Conduct' }
  ];
  
  docs.forEach(({ file, name }) => {
    const exists = fs.existsSync(file);
    if (exists) {
      const content = fs.readFileSync(file, 'utf-8');
      const hasContent = content.trim().length > 100;
      addResult('Documentation', name, hasContent ? 'passed' : 'warning', 
        hasContent ? 'Document has content' : 'Document may be incomplete');
    } else {
      addResult('Documentation', name, 'warning', 'Document missing');
    }
  });
}

async function testPackageIntegrity() {
  console.log('📦 Testing Package Integrity...');
  
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    
    // Check essential fields
    const essentialFields = ['name', 'version', 'scripts', 'dependencies'];
    essentialFields.forEach(field => {
      if (pkg[field]) {
        addResult('Package', `package.json: ${field}`, 'passed', 'Field present');
      } else {
        addResult('Package', `package.json: ${field}`, 'failed', 'Missing field');
      }
    });
    
    // Check essential scripts
    const essentialScripts = ['dev', 'build', 'preview'];
    essentialScripts.forEach(script => {
      if (pkg.scripts?.[script]) {
        addResult('Package', `Script: ${script}`, 'passed', 'Script defined');
      } else {
        addResult('Package', `Script: ${script}`, 'failed', 'Missing script');
      }
    });
    
    // Check essential dependencies
    const essentialDeps = ['react', 'react-dom', 'vite', 'typescript', 'firebase'];
    essentialDeps.forEach(dep => {
      if (pkg.dependencies?.[dep] || pkg.devDependencies?.[dep]) {
        addResult('Package', `Dependency: ${dep}`, 'passed', 'Dependency present');
      } else {
        addResult('Package', `Dependency: ${dep}`, 'warning', 'Dependency missing');
      }
    });
  } catch (error) {
    addResult('Package', 'package.json', 'failed', 'Invalid or missing package.json');
  }
}

function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 INTEGRATION TEST REPORT');
  console.log('='.repeat(80) + '\n');
  
  const categories = [...new Set(results.map(r => r.category))];
  
  let totalPassed = 0;
  let totalFailed = 0;
  let totalWarnings = 0;
  
  categories.forEach(category => {
    const categoryResults = results.filter(r => r.category === category);
    const passed = categoryResults.filter(r => r.status === 'passed').length;
    const failed = categoryResults.filter(r => r.status === 'failed').length;
    const warnings = categoryResults.filter(r => r.status === 'warning').length;
    
    totalPassed += passed;
    totalFailed += failed;
    totalWarnings += warnings;
    
    console.log(`\n📦 ${category}`);
    console.log(`   ✅ Passed: ${passed} | ❌ Failed: ${failed} | ⚠️  Warnings: ${warnings}`);
    
    const failedTests = categoryResults.filter(r => r.status === 'failed');
    if (failedTests.length > 0) {
      console.log(`   Failed tests:`);
      failedTests.forEach(test => {
        console.log(`      ❌ ${test.name}: ${test.message || 'No details'}`);
      });
    }
    
    const warningTests = categoryResults.filter(r => r.status === 'warning');
    if (warningTests.length > 0 && warningTests.length <= 3) {
      console.log(`   Warnings:`);
      warningTests.forEach(test => {
        console.log(`      ⚠️  ${test.name}: ${test.message || 'No details'}`);
      });
    }
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${results.length}`);
  console.log(`✅ Passed:   ${totalPassed} (${((totalPassed/results.length)*100).toFixed(1)}%)`);
  console.log(`❌ Failed:   ${totalFailed} (${((totalFailed/results.length)*100).toFixed(1)}%)`);
  console.log(`⚠️  Warnings: ${totalWarnings} (${((totalWarnings/results.length)*100).toFixed(1)}%)`);
  console.log('='.repeat(80) + '\n');
  
  const successRate = ((totalPassed + totalWarnings) / results.length) * 100;
  
  if (totalFailed === 0 && totalWarnings === 0) {
    console.log('🎉 PERFECT! All tests passed with no warnings!');
  } else if (totalFailed === 0) {
    console.log('✨ EXCELLENT! All tests passed (some warnings to review).');
  } else if (successRate >= 90) {
    console.log('👍 GOOD! Most tests passed, but some issues need attention.');
  } else if (successRate >= 70) {
    console.log('⚠️  WARNING! Several issues need to be fixed.');
  } else {
    console.log('❌ CRITICAL! Major issues detected.');
  }
  
  console.log('\n💡 TIP: Open tmp_rovodev_functional_test.html in a browser for interactive testing.\n');
  
  return {
    total: results.length,
    passed: totalPassed,
    failed: totalFailed,
    warnings: totalWarnings,
    successRate
  };
}

async function runAllTests() {
  console.log('🚀 Starting Integration Tests...\n');
  console.log('⏳ This may take a few minutes...\n');
  
  try {
    await testPackageIntegrity();
    await testPublicAssets();
    await testFirebaseConfiguration();
    await testEnvironmentConfiguration();
    await testSecurityFiles();
    await testCodeQuality();
    await testDocumentation();
    await testBuildOutput();
    
    const summary = generateReport();
    
    process.exit(summary.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Fatal error during testing:', error);
    process.exit(1);
  }
}

runAllTests();
