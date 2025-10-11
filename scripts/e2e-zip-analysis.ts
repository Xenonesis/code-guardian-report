import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { ZipAnalysisService, type ZipInputFile } from '../src/services/security/zipAnalysisService';
import { DependencyVulnerabilityScanner } from '../src/services/security/dependencyVulnerabilityScanner';

async function run() {
  const tmpDir = path.join(process.cwd(), 'scripts');
  const zipPath = path.join(tmpDir, `tmp-e2e-${Date.now()}.zip`);

  // Build a test ZIP with a vulnerable dependency and a suspicious script
  const zip = new JSZip();
  const pkgJson = {
    name: 'zip-e2e-test',
    version: '1.0.0',
    dependencies: {
      lodash: '4.17.20'
    }
  };
  zip.file('package.json', JSON.stringify(pkgJson, null, 2));
  zip.file('src/index.js', 'console.log("hello"); document.write(unescape("%3Cscript%3E"));');
  zip.file('README.md', '# Test ZIP for analysis');

  const nodeBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  await fs.promises.writeFile(zipPath, nodeBuffer);

  // Prepare ZipInputFile compatible object
  const arrayBuffer = nodeBuffer.buffer.slice(nodeBuffer.byteOffset, nodeBuffer.byteOffset + nodeBuffer.byteLength);
  const zipInput: ZipInputFile = {
    name: path.basename(zipPath),
    size: nodeBuffer.byteLength,
    lastModified: Date.now(),
    arrayBuffer: async () => arrayBuffer
  };

  const zipService = new ZipAnalysisService();
  const depScanner = new DependencyVulnerabilityScanner();

  // Analyze ZIP structure/threats/quality
  const zipAnalysis = await zipService.analyzeZipFile(zipInput);

  // Extract manifests from the same in-memory ZIP for dependency scanning
  const manifestNames = new Set([
    'package.json', 'yarn.lock', 'pnpm-lock.yaml', 'requirements.txt', 'Pipfile', 'poetry.lock',
    'composer.json', 'composer.lock', 'Gemfile', 'Gemfile.lock', 'pom.xml', 'build.gradle',
    'Cargo.toml', 'Cargo.lock'
  ]);

  const zipLoaded = await JSZip.loadAsync(arrayBuffer);
  const filesForScan: Array<{ name: string; content: string }> = [];
  await Promise.all(
    Object.keys(zipLoaded.files).map(async (p) => {
      const f = zipLoaded.files[p];
      if (f.dir) return;
      const base = p.split('/').pop() || p;
      if (manifestNames.has(base)) {
        const content = await f.async('string');
        filesForScan.push({ name: base, content });
      }
    })
  );

  const depAnalysis = await depScanner.scanDependencies(filesForScan);

  // Minimal console output of real results
  console.log('ZIP Analysis Summary:', {
    totalFiles: zipAnalysis.fileStructure.totalFiles,
    suspiciousFiles: zipAnalysis.fileStructure.suspiciousFiles.length,
    threats: zipAnalysis.securityThreats.length,
    loc: zipAnalysis.codeQuality.linesOfCode
  });
  console.log('Dependency Analysis Summary:', {
    totalPackages: depAnalysis.summary.totalPackages,
    criticalVulns: depAnalysis.summary.criticalVulnerabilities,
    highVulns: depAnalysis.summary.highVulnerabilities,
    outdated: depAnalysis.summary.outdatedPackages,
    licenseIssues: depAnalysis.summary.licenseIssues
  });

  // Cleanup
  await fs.promises.unlink(zipPath);
  console.log('Temporary ZIP deleted:', zipPath);
}

run().catch((e) => {
  console.error('E2E ZIP analysis failed:', e);
  process.exit(1);
});
