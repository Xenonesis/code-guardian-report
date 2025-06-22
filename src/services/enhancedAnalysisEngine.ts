import { SecurityIssue, AnalysisResults } from '@/hooks/useAnalysis';
import { SecurityAnalyzer } from './analysis/SecurityAnalyzer';
import { MetricsCalculator } from './analysis/MetricsCalculator';

export class EnhancedAnalysisEngine {
  private securityAnalyzer: SecurityAnalyzer;
  private metricsCalculator: MetricsCalculator;

  constructor() {
    this.securityAnalyzer = new SecurityAnalyzer();
    this.metricsCalculator = new MetricsCalculator();
  }

  public async analyzeCodebase(filename: string): Promise<AnalysisResults> {
    const fileTypes = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.php'];
    const directories = ['components', 'utils', 'services', 'pages', 'api', 'lib'];
    const totalFiles = Math.floor(Math.random() * 15) + 8;
    
    let allIssues: SecurityIssue[] = [];
    let linesAnalyzed = 0;

    for (let i = 0; i < totalFiles; i++) {
      const dir = directories[Math.floor(Math.random() * directories.length)];
      const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
      const fileName = `src/${dir}/${filename.replace('.zip', '')}_${i}${fileType}`;
      
      const fileIssues = this.securityAnalyzer.analyzeFile(fileName);
      allIssues = [...allIssues, ...fileIssues];
      linesAnalyzed += Math.floor(Math.random() * 200) + 50;
    }

    const analysisResults: AnalysisResults = {
      issues: allIssues,
      totalFiles,
      analysisTime: (Math.random() * 8 + 2).toFixed(1) + 's',
      summary: this.metricsCalculator.calculateSummaryMetrics(allIssues, linesAnalyzed),
      metrics: this.metricsCalculator.calculateDetailedMetrics(allIssues, linesAnalyzed),
      dependencies: this.metricsCalculator.analyzeDependencies()
    };

    return analysisResults;
  }
}
