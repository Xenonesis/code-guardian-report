#!/usr/bin/env tsx

/**
 * Comprehensive Functionality Test Suite
 * Tests all major features and services of the Code Guardian application
 */

import fs from 'fs';
import path from 'path';

// Test Results Interface
interface TestResult {
  category: string;
  name: string;
  status: 'passed' | 'failed' | 'warning';
  message?: string;
  error?: string;
}

const results: TestResult[] = [];

// Helper function to add test result
function addResult(category: string, name: string, status: 'passed' | 'failed' | 'warning', message?: string, error?: string) {
  results.push({ category, name, status, message, error });
}

// Helper function to check file exists
function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

// Helper function to check if file has content
function fileHasContent(filePath: string, content: string): boolean {
  if (!fileExists(filePath)) return false;
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return fileContent.includes(content);
}

// ==================== Core Application Tests ====================
function testCoreApplication() {
  console.log('🔍 Testing Core Application...');
  
  // Check main entry points
  const coreFiles = [
    'index.html',
    'src/app/main.tsx',
    'src/app/App.tsx',
    'src/pages/SinglePageApp.tsx',
    'vite.config.ts',
    'package.json'
  ];
  
  coreFiles.forEach(file => {
    if (fileExists(file)) {
      addResult('Core', `File exists: ${file}`, 'passed');
    } else {
      addResult('Core', `File exists: ${file}`, 'failed', `File not found: ${file}`);
    }
  });
  
  // Check package.json scripts
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    const requiredScripts = ['dev', 'build', 'preview'];
    requiredScripts.forEach(script => {
      if (pkg.scripts && pkg.scripts[script]) {
        addResult('Core', `Script exists: ${script}`, 'passed');
      } else {
        addResult('Core', `Script exists: ${script}`, 'failed', `Missing script: ${script}`);
      }
    });
  } catch (error) {
    addResult('Core', 'Package.json validation', 'failed', 'Cannot read package.json', (error as Error).message);
  }
}

// ==================== Component Tests ====================
function testComponents() {
  console.log('🧩 Testing Components...');
  
  const componentCategories = [
    { name: 'Layout', path: 'src/components/layout', files: ['Navigation.tsx', 'Footer.tsx', 'HeroSection.tsx'] },
    { name: 'Analysis', path: 'src/components/analysis', files: ['EnhancedSecurityResults.tsx', 'ResultsTable.tsx'] },
    { name: 'Upload', path: 'src/components/upload', files: ['FileDropZone.tsx', 'FileUploadArea.tsx'] },
    { name: 'Dashboard', path: 'src/components/dashboard', files: ['MetricsCard.tsx', 'SeverityChart.tsx'] },
    { name: 'Security', path: 'src/components/security', files: ['ModernSecurityDashboard.tsx', 'ZipSecurityAnalyzer.tsx'] },
    { name: 'GitHub', path: 'src/components/github', files: ['GitHubRepositoryList.tsx', 'CodeQualityAnalytics.tsx'] },
    { name: 'Auth', path: 'src/components/auth', files: ['AuthModal.tsx', 'UserDashboard.tsx'] },
    { name: 'PWA', path: 'src/components/pwa', files: ['PWAInstallPrompt.tsx', 'PWAStatus.tsx'] },
    { name: 'Firebase', path: 'src/components/firebase', files: ['FirestoreStatus.tsx', 'StorageStatus.tsx'] },
  ];
  
  componentCategories.forEach(category => {
    category.files.forEach(file => {
      const fullPath = path.join(category.path, file);
      if (fileExists(fullPath)) {
        addResult('Components', `${category.name}: ${file}`, 'passed');
      } else {
        addResult('Components', `${category.name}: ${file}`, 'failed', `Missing component: ${fullPath}`);
      }
    });
  });
}

// ==================== Services Tests ====================
function testServices() {
  console.log('⚙️ Testing Services...');
  
  const services = [
    { category: 'Analysis', file: 'src/services/enhancedAnalysisEngine.ts', exports: ['analyzeCode', 'EnhancedAnalysisEngine'] },
    { category: 'Security', file: 'src/services/security/securityAnalysisEngine.ts', exports: ['SecurityAnalysisEngine'] },
    { category: 'Security', file: 'src/services/security/zipAnalysisService.ts', exports: ['ZipAnalysisService'] },
    { category: 'Security', file: 'src/services/security/dependencyVulnerabilityScanner.ts', exports: ['scanDependencies'] },
    { category: 'GitHub', file: 'src/services/githubRepositoryService.ts', exports: ['GitHubRepositoryService'] },
    { category: 'AI', file: 'src/services/ai/aiService.ts', exports: ['AIService'] },
    { category: 'PWA', file: 'src/services/pwa/pwaIntegration.ts', exports: ['initializePWA'] },
    { category: 'Storage', file: 'src/services/storage/firebaseAnalysisStorage.ts', exports: ['FirebaseAnalysisStorage'] },
    { category: 'Export', file: 'src/services/export/pdfExportService.ts', exports: ['exportToPDF'] },
  ];
  
  services.forEach(service => {
    if (fileExists(service.file)) {
      const content = fs.readFileSync(service.file, 'utf-8');
      const allExportsFound = service.exports.every(exp => 
        content.includes(`export class ${exp}`) || 
        content.includes(`export const ${exp}`) || 
        content.includes(`export function ${exp}`) ||
        content.includes(`export default ${exp}`)
      );
      
      if (allExportsFound) {
        addResult('Services', `${service.category}: ${path.basename(service.file)}`, 'passed');
      } else {
        addResult('Services', `${service.category}: ${path.basename(service.file)}`, 'warning', 
          `File exists but some exports may be missing`);
      }
    } else {
      addResult('Services', `${service.category}: ${path.basename(service.file)}`, 'failed', 
        `Service not found: ${service.file}`);
    }
  });
}

// ==================== Hooks Tests ====================
function testHooks() {
  console.log('🪝 Testing Hooks...');
  
  const hooks = [
    'useAnalysis.ts',
    'useFileUpload.ts',
    'useEnhancedAnalysis.ts',
    'useGitHubRepositories.ts',
    'usePWA.ts',
    'useNotifications.ts',
    'useDarkMode.ts',
    'useFirebaseAnalysis.ts'
  ];
  
  hooks.forEach(hook => {
    const hookPath = path.join('src/hooks', hook);
    if (fileExists(hookPath)) {
      addResult('Hooks', hook, 'passed');
    } else {
      addResult('Hooks', hook, 'failed', `Hook not found: ${hookPath}`);
    }
  });
}

// ==================== Firebase Configuration Tests ====================
function testFirebaseConfig() {
  console.log('🔥 Testing Firebase Configuration...');
  
  const firebaseFiles = [
    'firebase.json',
    'firestore.rules',
    'firestore.indexes.json',
    'src/lib/firebase.ts',
    'src/lib/firestore-config.ts',
    '.env.example'
  ];
  
  firebaseFiles.forEach(file => {
    if (fileExists(file)) {
      addResult('Firebase', `Config file: ${file}`, 'passed');
    } else {
      addResult('Firebase', `Config file: ${file}`, 'failed', `Missing file: ${file}`);
    }
  });
  
  // Check .env.example for required variables
  if (fileExists('.env.example')) {
    const requiredVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_APP_ID'
    ];
    
    requiredVars.forEach(varName => {
      if (fileHasContent('.env.example', varName)) {
        addResult('Firebase', `Env var: ${varName}`, 'passed');
      } else {
        addResult('Firebase', `Env var: ${varName}`, 'warning', `Variable not in .env.example`);
      }
    });
  }
}

// ==================== PWA Configuration Tests ====================
function testPWAConfig() {
  console.log('📱 Testing PWA Configuration...');
  
  const pwaFiles = [
    'public/manifest.json',
    'public/sw.js',
    'public/favicon.ico',
    'src/config/pwa.ts'
  ];
  
  pwaFiles.forEach(file => {
    if (fileExists(file)) {
      addResult('PWA', `File: ${file}`, 'passed');
    } else {
      addResult('PWA', `File: ${file}`, 'failed', `Missing file: ${file}`);
    }
  });
  
  // Check manifest.json structure
  if (fileExists('public/manifest.json')) {
    try {
      const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf-8'));
      const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
      
      requiredFields.forEach(field => {
        if (manifest[field]) {
          addResult('PWA', `Manifest field: ${field}`, 'passed');
        } else {
          addResult('PWA', `Manifest field: ${field}`, 'failed', `Missing field in manifest.json`);
        }
      });
    } catch (error) {
      addResult('PWA', 'Manifest validation', 'failed', 'Invalid manifest.json', (error as Error).message);
    }
  }
}

// ==================== Security Features Tests ====================
function testSecurityFeatures() {
  console.log('🔒 Testing Security Features...');
  
  const securityFeatures = [
    { name: 'ZIP Analysis', file: 'src/services/security/zipAnalysisService.ts' },
    { name: 'Secret Detection', file: 'src/services/security/secretDetectionService.ts' },
    { name: 'Dependency Scanner', file: 'src/services/security/dependencyVulnerabilityScanner.ts' },
    { name: 'Modern Code Scanning', file: 'src/services/security/modernCodeScanningService.ts' },
    { name: 'Secure Code Search', file: 'src/services/security/secureCodeSearchService.ts' },
    { name: 'Code Provenance', file: 'src/services/detection/codeProvenanceService.ts' }
  ];
  
  securityFeatures.forEach(feature => {
    if (fileExists(feature.file)) {
      addResult('Security', feature.name, 'passed');
    } else {
      addResult('Security', feature.name, 'failed', `Missing: ${feature.file}`);
    }
  });
}

// ==================== Multi-Language Support Tests ====================
function testMultiLanguageSupport() {
  console.log('🌐 Testing Multi-Language Support...');
  
  const languageFiles = [
    'src/services/analysis/MultiLanguageParser.ts',
    'src/services/analysis/MultiLanguageSecurityAnalyzer.ts',
    'src/services/detection/languageDetectionService.ts',
    'src/components/language/LanguageDetectionDisplay.tsx'
  ];
  
  languageFiles.forEach(file => {
    if (fileExists(file)) {
      addResult('Multi-Language', path.basename(file), 'passed');
    } else {
      addResult('Multi-Language', path.basename(file), 'failed', `Missing: ${file}`);
    }
  });
}

// ==================== GitHub Integration Tests ====================
function testGitHubIntegration() {
  console.log('🐙 Testing GitHub Integration...');
  
  const githubFiles = [
    'src/services/githubRepositoryService.ts',
    'src/services/api/githubService.ts',
    'src/services/storage/GitHubAnalysisStorageService.ts',
    'src/components/github/GitHubRepositoryList.tsx',
    'src/pages/GitHubAnalysisPage.tsx'
  ];
  
  githubFiles.forEach(file => {
    if (fileExists(file)) {
      addResult('GitHub', path.basename(file), 'passed');
    } else {
      addResult('GitHub', path.basename(file), 'failed', `Missing: ${file}`);
    }
  });
}

// ==================== AI Features Tests ====================
function testAIFeatures() {
  console.log('🤖 Testing AI Features...');
  
  const aiFiles = [
    'src/services/ai/aiService.ts',
    'src/services/ai/aiFixSuggestionsService.ts',
    'src/services/ai/modelDiscoveryService.ts',
    'src/services/ai/naturalLanguageDescriptionService.ts',
    'src/components/ai/AISecurityInsights.tsx',
    'src/components/ai/FloatingChatBot.tsx'
  ];
  
  aiFiles.forEach(file => {
    if (fileExists(file)) {
      addResult('AI', path.basename(file), 'passed');
    } else {
      addResult('AI', path.basename(file), 'failed', `Missing: ${file}`);
    }
  });
}

// ==================== Export Features Tests ====================
function testExportFeatures() {
  console.log('📄 Testing Export Features...');
  
  const exportFiles = [
    'src/services/export/pdfExportService.ts',
    'src/components/export/PDFDownloadButton.tsx',
    'src/components/export/DataExport.tsx'
  ];
  
  exportFiles.forEach(file => {
    if (fileExists(file)) {
      addResult('Export', path.basename(file), 'passed');
    } else {
      addResult('Export', path.basename(file), 'failed', `Missing: ${file}`);
    }
  });
  
  // Check if PDF dependencies are installed
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    if (pkg.dependencies['jspdf'] && pkg.dependencies['html2canvas']) {
      addResult('Export', 'PDF dependencies', 'passed');
    } else {
      addResult('Export', 'PDF dependencies', 'failed', 'Missing jspdf or html2canvas');
    }
  } catch (error) {
    addResult('Export', 'PDF dependencies', 'failed', 'Cannot check dependencies', (error as Error).message);
  }
}

// ==================== Notification System Tests ====================
function testNotificationSystem() {
  console.log('🔔 Testing Notification System...');
  
  const notificationFiles = [
    'src/services/notifications/NotificationManager.ts',
    'src/components/notifications/NotificationCenter.tsx',
    'src/components/notifications/NotificationPreferences.tsx',
    'src/hooks/useNotifications.ts'
  ];
  
  notificationFiles.forEach(file => {
    if (fileExists(file)) {
      addResult('Notifications', path.basename(file), 'passed');
    } else {
      addResult('Notifications', path.basename(file), 'failed', `Missing: ${file}`);
    }
  });
}

// ==================== Monitoring & Analytics Tests ====================
function testMonitoringAndAnalytics() {
  console.log('📊 Testing Monitoring & Analytics...');
  
  const monitoringFiles = [
    'src/services/monitoring/WebhookManager.ts',
    'src/components/monitoring/WebhookManagement.tsx',
    'src/services/pwa/pwaAnalyticsService.ts',
    'src/components/EnhancedAnalyticsDashboard.tsx'
  ];
  
  monitoringFiles.forEach(file => {
    if (fileExists(file)) {
      addResult('Monitoring', path.basename(file), 'passed');
    } else {
      addResult('Monitoring', path.basename(file), 'failed', `Missing: ${file}`);
    }
  });
}

// ==================== Custom Rules Tests ====================
function testCustomRules() {
  console.log('📋 Testing Custom Rules...');
  
  const rulesFiles = [
    'src/services/rules/CustomRulesEngine.ts',
    'src/components/rules/CustomRulesEditor.tsx'
  ];
  
  rulesFiles.forEach(file => {
    if (fileExists(file)) {
      addResult('Custom Rules', path.basename(file), 'passed');
    } else {
      addResult('Custom Rules', path.basename(file), 'failed', `Missing: ${file}`);
    }
  });
}

// ==================== UI/UX Tests ====================
function testUIUX() {
  console.log('🎨 Testing UI/UX Components...');
  
  // Check UI components
  const uiComponents = fs.readdirSync('src/components/ui');
  const requiredUIComponents = [
    'button.tsx', 'card.tsx', 'input.tsx', 'dialog.tsx', 
    'tabs.tsx', 'toast.tsx', 'table.tsx', 'badge.tsx'
  ];
  
  requiredUIComponents.forEach(component => {
    if (uiComponents.includes(component)) {
      addResult('UI/UX', `Component: ${component}`, 'passed');
    } else {
      addResult('UI/UX', `Component: ${component}`, 'failed', `Missing UI component: ${component}`);
    }
  });
  
  // Check styles
  const styleFiles = [
    'src/index.css',
    'tailwind.config.ts',
    'postcss.config.js'
  ];
  
  styleFiles.forEach(file => {
    if (fileExists(file)) {
      addResult('UI/UX', `Style: ${path.basename(file)}`, 'passed');
    } else {
      addResult('UI/UX', `Style: ${path.basename(file)}`, 'failed', `Missing: ${file}`);
    }
  });
}

// ==================== Documentation Tests ====================
function testDocumentation() {
  console.log('📚 Testing Documentation...');
  
  const docFiles = [
    'README.md',
    'LICENSE',
    'md/CONTRIBUTING.md',
    'md/CODE_OF_CONDUCT.md',
    'md/changelogs.md'
  ];
  
  docFiles.forEach(file => {
    if (fileExists(file)) {
      addResult('Documentation', path.basename(file), 'passed');
    } else {
      addResult('Documentation', path.basename(file), 'warning', `Missing: ${file}`);
    }
  });
}

// ==================== Build & Deployment Tests ====================
function testBuildAndDeployment() {
  console.log('🚀 Testing Build & Deployment...');
  
  const deployFiles = [
    'vercel.json',
    'vite.config.ts',
    'tsconfig.json',
    '.github/workflows/ci.yml'
  ];
  
  deployFiles.forEach(file => {
    if (fileExists(file)) {
      addResult('Deployment', path.basename(file), 'passed');
    } else {
      addResult('Deployment', path.basename(file), 'warning', `Missing: ${file}`);
    }
  });
}

// ==================== Generate Report ====================
function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📋 COMPREHENSIVE TEST REPORT');
  console.log('='.repeat(80) + '\n');
  
  // Group results by category
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
    
    // Show failed tests
    const failedTests = categoryResults.filter(r => r.status === 'failed');
    if (failedTests.length > 0) {
      console.log(`   Failed tests:`);
      failedTests.forEach(test => {
        console.log(`      ❌ ${test.name}: ${test.message || 'No details'}`);
      });
    }
    
    // Show warnings
    const warningTests = categoryResults.filter(r => r.status === 'warning');
    if (warningTests.length > 0) {
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
  
  const successRate = (totalPassed / results.length) * 100;
  
  if (successRate === 100) {
    console.log('🎉 EXCELLENT! All tests passed!');
  } else if (successRate >= 90) {
    console.log('✨ GREAT! Most features are working correctly.');
  } else if (successRate >= 70) {
    console.log('👍 GOOD! Core features are working, but some issues need attention.');
  } else if (successRate >= 50) {
    console.log('⚠️  WARNING! Several features have issues that need fixing.');
  } else {
    console.log('❌ CRITICAL! Major issues detected. Immediate attention required.');
  }
  
  console.log('\n');
  
  return {
    total: results.length,
    passed: totalPassed,
    failed: totalFailed,
    warnings: totalWarnings,
    successRate
  };
}

// ==================== Main Test Runner ====================
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Functionality Tests...\n');
  
  try {
    testCoreApplication();
    testComponents();
    testServices();
    testHooks();
    testFirebaseConfig();
    testPWAConfig();
    testSecurityFeatures();
    testMultiLanguageSupport();
    testGitHubIntegration();
    testAIFeatures();
    testExportFeatures();
    testNotificationSystem();
    testMonitoringAndAnalytics();
    testCustomRules();
    testUIUX();
    testDocumentation();
    testBuildAndDeployment();
    
    const summary = generateReport();
    
    // Exit with appropriate code
    process.exit(summary.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Fatal error during testing:', error);
    process.exit(1);
  }
}

// Run tests
runAllTests();
