import { SecurityIssue, AnalysisResults } from '@/hooks/useAnalysis';
import { SecurityAnalyzer } from './analysis/SecurityAnalyzer';
import { MetricsCalculator } from './analysis/MetricsCalculator';
import JSZip from 'jszip';

interface FileContent {
  filename: string;
  content: string;
  size: number;
}

export class EnhancedAnalysisEngine {
  private securityAnalyzer: SecurityAnalyzer;
  private metricsCalculator: MetricsCalculator;

  constructor() {
    this.securityAnalyzer = new SecurityAnalyzer();
    this.metricsCalculator = new MetricsCalculator();
  }

  private async extractZipContents(zipFile: File): Promise<FileContent[]> {
    const zip = new JSZip();
    const fileContents: FileContent[] = [];

    try {
      const zipData = await zip.loadAsync(zipFile);
      
      for (const [filename, file] of Object.entries(zipData.files)) {
        if (!file.dir && this.isAnalyzableFile(filename)) {
          const content = await file.async('string');
          fileContents.push({
            filename,
            content,
            size: content.length
          });
        }
      }
    } catch (error) {
      console.error('Error extracting zip contents:', error);
      throw new Error('Failed to extract zip file contents');
    }

    return fileContents;
  }

  private isAnalyzableFile(filename: string): boolean {
    const analyzableExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
      '.py', '.pyw', '.java', '.php', '.rb', '.go',
      '.cs', '.cpp', '.c', '.h', '.hpp', '.rs',
      '.vue', '.svelte', '.json', '.yaml', '.yml',
      '.xml', '.html', '.htm', '.css', '.scss', '.sass',
      '.sh', '.bash', '.sql', '.dockerfile', '.env'
    ];

    const excludePatterns = [
      'node_modules/',
      '.git/',
      'dist/',
      'build/',
      'coverage/',
      '.next/',
      '.vscode/',
      '__pycache__/',
      '.pytest_cache/',
      'target/',
      'bin/',
      'obj/',
      'vendor/',
      '.DS_Store',
      'Thumbs.db',
      'package-lock.json',
      'yarn.lock',
      '.min.js',
      '.min.css'
    ];

    // Check if file should be excluded
    if (excludePatterns.some(pattern => filename.includes(pattern))) {
      return false;
    }

    // Check if file has analyzable extension
    const hasValidExtension = analyzableExtensions.some(ext => filename.toLowerCase().endsWith(ext));
    
    // Additional checks for specific file types
    const isConfigFile = /\.(config|conf)\./.test(filename) || 
                        filename.endsWith('.env') ||
                        filename.includes('webpack') ||
                        filename.includes('babel') ||
                        filename.includes('eslint');

    return hasValidExtension || isConfigFile;
  }

  public async analyzeCodebase(zipFile: File): Promise<AnalysisResults> {
    const startTime = Date.now();
    let allIssues: SecurityIssue[] = [];
    let linesAnalyzed = 0;
    let totalFiles = 0;

    if (zipFile) {
      try {
        console.log('Extracting and analyzing real zip file contents...');
        const fileContents = await this.extractZipContents(zipFile);
        totalFiles = fileContents.length;
        
        if (totalFiles === 0) {
          console.warn('No analyzable files found in zip, but continuing with empty analysis');
          // Return empty but valid analysis results
          return {
            issues: [],
            totalFiles: 0,
            analysisTime: '0.1s',
            summary: this.metricsCalculator.calculateSummaryMetrics([], 0),
            metrics: this.metricsCalculator.calculateDetailedMetrics([], 0),
            dependencies: this.metricsCalculator.analyzeDependencies()
          };
        }
        
        console.log(`Found ${totalFiles} analyzable files in zip`);

        // Analyze files with progress tracking
        for (let i = 0; i < fileContents.length; i++) {
          const fileContent = fileContents[i];
          console.log(`Analyzing file ${i + 1}/${totalFiles}: ${fileContent.filename}`);
          
          const fileIssues = this.securityAnalyzer.analyzeFile(fileContent.filename, fileContent.content);
          allIssues = [...allIssues, ...fileIssues];
          linesAnalyzed += fileContent.content.split('\n').length;
          
          // Log progress for larger codebases
          if (totalFiles > 10 && (i + 1) % 5 === 0) {
            console.log(`Progress: ${i + 1}/${totalFiles} files analyzed, ${allIssues.length} issues found so far`);
          }
        }
      } catch (error) {
        console.error('Failed to analyze real zip file:', error);
        // Return error-based analysis for failed ZIP processing
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`Analysis failed: ${errorMessage}. Returning empty results.`);
        
        return {
          issues: [],
          totalFiles: 0,
          analysisTime: '0.1s',
          summary: this.metricsCalculator.calculateSummaryMetrics([], 0),
          metrics: this.metricsCalculator.calculateDetailedMetrics([], 0),
          dependencies: this.metricsCalculator.analyzeDependencies()
        };
      }
    } else {
      console.warn('No zip file provided - this should not happen in real usage');
      // Return empty analysis when no valid files found
      return {
        issues: [],
        totalFiles: 0,
        analysisTime: '0.1s',
        summary: this.metricsCalculator.calculateSummaryMetrics([], 0),
        metrics: this.metricsCalculator.calculateDetailedMetrics([], 0),
        dependencies: this.metricsCalculator.analyzeDependencies()
      };
    }

    const endTime = Date.now();
    const analysisTime = ((endTime - startTime) / 1000).toFixed(1) + 's';

    const analysisResults: AnalysisResults = {
      issues: allIssues,
      totalFiles,
      analysisTime,
      summary: this.metricsCalculator.calculateSummaryMetrics(allIssues, linesAnalyzed),
      metrics: this.metricsCalculator.calculateDetailedMetrics(allIssues, linesAnalyzed),
      dependencies: this.metricsCalculator.analyzeDependencies()
    };

    console.log(`Real analysis complete: ${allIssues.length} issues found in ${totalFiles} files`);
    return analysisResults;
  }
}
