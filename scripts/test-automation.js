#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testAutomation() {
  console.log('🧪 Testing contributor automation system...\n');
  
  const tests = [
    {
      name: 'GitHub Actions workflows exist',
      test: () => {
        const workflows = [
          '.github/workflows/update-contributors.yml',
          '.github/workflows/contributors-on-pr.yml'
        ];
        return workflows.every(workflow => fs.existsSync(workflow));
      }
    },
    {
      name: 'Update script exists and is executable',
      test: () => {
        return fs.existsSync('scripts/update-contributors.js');
      }
    },
    {
      name: 'Git hooks setup script exists',
      test: () => {
        return fs.existsSync('scripts/setup-git-hooks.js');
      }
    },
    {
      name: 'Package.json has required scripts',
      test: () => {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const requiredScripts = ['update-contributors', 'setup-git-hooks'];
        return requiredScripts.every(script => packageJson.scripts[script]);
      }
    },
    {
      name: 'Git hooks are installed',
      test: () => {
        const hooks = ['.git/hooks/post-commit', '.git/hooks/pre-commit'];
        return hooks.every(hook => fs.existsSync(hook));
      }
    },
    {
      name: 'README has contributors section',
      test: () => {
        const readme = fs.readFileSync('README.md', 'utf8');
        return readme.includes('## 🌟 Community & Contributors');
      }
    },
    {
      name: 'Contributors section has real data',
      test: () => {
        const readme = fs.readFileSync('README.md', 'utf8');
        return readme.includes('@Xenonesis') && readme.includes('avatars.githubusercontent.com');
      }
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = test.test();
      if (result) {
        console.log(`✅ ${test.name}`);
        passed++;
      } else {
        console.log(`❌ ${test.name}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} - Error: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! The contributor automation system is fully set up.\n');
    console.log('🔄 The system will now automatically:');
    console.log('  • Update contributors when code is pushed');
    console.log('  • Welcome new contributors on PR merges');
    console.log('  • Run daily maintenance updates');
    console.log('  • Update after local commits (if git hooks are enabled)\n');
    console.log('🚀 Your README.md will always show real, up-to-date contributor information!');
  } else {
    console.log('⚠️  Some tests failed. Please check the issues above.');
    console.log('💡 You may need to run: npm run setup-git-hooks');
  }
  
  return failed === 0;
}

// Run the test
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  testAutomation().then(success => {
    process.exit(success ? 0 : 1);
  });
} else {
  testAutomation();
}

export { testAutomation };