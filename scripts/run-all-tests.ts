
import { execSync } from 'child_process';

const tests = [
  { name: 'Contributor Automation', command: 'npm run test-automation' },
  { name: 'E2E ZIP Analysis', command: 'npm run test:e2e-zip' },
  { name: 'Analysis Accuracy', command: 'npx tsx scripts/run-accuracy-test.ts' },
  { name: 'Firebase Integration', command: 'npx tsx scripts/run-firebase-test.ts' },
  { name: 'GitHub Integration', command: 'npx vitest run src/tests/github-analysis-integration.test.ts' },
  { name: 'Modern Code Scanning', command: 'npx tsx tests/modernCodeScanning.test.ts' }
];

console.log('🚀 Running All Functionality Tests...\n');

let passed = 0;
let failed = 0;

for (const test of tests) {
  console.log(`\n📋 Running ${test.name}...`);
  try {
    execSync(test.command, { stdio: 'inherit' });
    console.log(`✅ ${test.name} Passed`);
    passed++;
  } catch (error) {
    console.log(`❌ ${test.name} Failed`);
    failed++;
  }
}

console.log('\n' + '='.repeat(60));
console.log('📊 Final Test Summary\n');
console.log(`Total Tests:  ${tests.length}`);
console.log(`✅ Passed:    ${passed}`);
console.log(`❌ Failed:    ${failed}`);
console.log('\n' + '='.repeat(60));

if (failed === 0) {
  console.log('\n🎉 All functionalities are working correctly!');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${failed} test suite(s) failed.`);
  process.exit(1);
}
