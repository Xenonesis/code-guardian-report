#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeBundles() {
  const distPath = path.join(__dirname, '../dist/assets');
  
  if (!fs.existsSync(distPath)) {
    console.error('❌ Build directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  const files = fs.readdirSync(distPath);
  const jsFiles = files.filter(file => file.endsWith('.js'));
  
  console.log('📦 Bundle Analysis Report\n');
  console.log('JavaScript Files:');
  console.log('─'.repeat(50));
  
  let totalSize = 0;
  let mainBundleSize = 0;
  
  jsFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    const stats = fs.statSync(filePath);
    const size = stats.size;
    totalSize += size;
    
    if (file.includes('index-')) {
      mainBundleSize = size;
    }
    
    console.log(`${file.padEnd(35)} ${formatBytes(size)}`);
  });
  
  console.log('─'.repeat(50));
  console.log(`Total JS Size: ${formatBytes(totalSize)}`);
  console.log(`Main Bundle: ${formatBytes(mainBundleSize)}`);
  
  // Check against thresholds
  const maxMainBundle = 900 * 1024; // 900 KB
  const maxTotal = 1200 * 1024; // 1.2 MB
  
  console.log('\n🎯 Bundle Size Analysis:');
  
  if (mainBundleSize > maxMainBundle) {
    console.log(`⚠️  Main bundle (${formatBytes(mainBundleSize)}) exceeds recommended size (${formatBytes(maxMainBundle)})`);
  } else {
    console.log(`✅ Main bundle size is within limits`);
  }
  
  if (totalSize > maxTotal) {
    console.log(`⚠️  Total bundle size (${formatBytes(totalSize)}) exceeds recommended size (${formatBytes(maxTotal)})`);
  } else {
    console.log(`✅ Total bundle size is within limits`);
  }
  
  console.log('\n💡 Optimization suggestions:');
  console.log('• Consider code splitting for large components');
  console.log('• Use dynamic imports for non-critical features');
  console.log('• Analyze bundle composition with tools like webpack-bundle-analyzer');
}

analyzeBundles();