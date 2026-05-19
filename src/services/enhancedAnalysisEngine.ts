import { SecurityIssue, AnalysisResults } from "@/types/security-types";
import { SecurityAnalyzer } from "./analysis/SecurityAnalyzer";
import { MetricsCalculator } from "./analysis/MetricsCalculator";
import { ASTAnalyzer } from "./analysis/ASTAnalyzer";
import { DataFlowAnalyzer } from "./analysis/DataFlowAnalyzer";
import { DependencyVulnerabilityScanner } from "./security/dependencyVulnerabilityScanner";
import { logger } from "@/utils/logger";
import JSZip from "jszip";

interface FileContent {
  filename: string;
  content: string;
  size: number;
}

interface WorkerResult {
  fileIssues: SecurityIssue[];
  linesAnalyzed: number;
  errors: string[];
}

interface AnalysisProgress {
  phase: string;
  current: number;
  total: number;
  message?: string;
}

export class EnhancedAnalysisEngine {
  private readonly securityAnalyzer: SecurityAnalyzer;
  private readonly metricsCalculator: MetricsCalculator;
  private readonly astAnalyzer: ASTAnalyzer;
  private readonly dataFlowAnalyzer: DataFlowAnalyzer;
  private readonly dependencyScanner: DependencyVulnerabilityScanner;
  private workerPool: Worker[] = [];
  private useParallel: boolean = true;
  private chunkSize: number = 10;

  constructor(options?: { useParallel?: boolean; chunkSize?: number }) {
    this.securityAnalyzer = new SecurityAnalyzer();
    this.metricsCalculator = new MetricsCalculator();
    this.astAnalyzer = new ASTAnalyzer();
    this.dataFlowAnalyzer = new DataFlowAnalyzer();
    this.dependencyScanner = new DependencyVulnerabilityScanner();
    this.useParallel = options?.useParallel ?? this.shouldUseParallel();
    this.chunkSize = options?.chunkSize ?? 10;
  }

  private shouldUseParallel(): boolean {
    if (typeof navigator === "undefined") return false;
    const cores = navigator.hardwareConcurrency || 0;
    return cores >= 4;
  }

  private async initializeWorkerPool(): Promise<void> {
    if (this.workerPool.length > 0) return;

    try {
      const maxWorkers = Math.min(navigator.hardwareConcurrency || 4, 4);

      for (let i = 0; i < maxWorkers; i++) {
        const worker = new Worker(
          new URL("./workers/analysis.worker.ts", import.meta.url),
          { type: "module" }
        );
        this.workerPool.push(worker);
      }

      logger.info(
        `Worker pool initialized with ${this.workerPool.length} workers`
      );
    } catch (error) {
      logger.warn(
        "Failed to initialize worker pool, falling back to sequential:",
        error
      );
      this.useParallel = false;
    }
  }

  private async analyzeFilesInParallel(
    files: FileContent[],
    onProgress?: (progress: AnalysisProgress) => void
  ): Promise<{
    issues: SecurityIssue[];
    linesAnalyzed: number;
    errors: string[];
  }> {
    await this.initializeWorkerPool();

    if (!this.useParallel || this.workerPool.length === 0) {
      return this.analyzeFilesSequentially(files);
    }

    const allIssues: SecurityIssue[] = [];
    let totalLines = 0;
    const allErrors: string[] = [];

    // Split files into chunks
    const chunks: FileContent[][] = [];
    for (let i = 0; i < files.length; i += this.chunkSize) {
      chunks.push(files.slice(i, i + this.chunkSize));
    }

    let completedChunks = 0;

    // Process chunks in parallel using worker pool
    const processChunk = (
      chunk: FileContent[],
      worker: Worker
    ): Promise<WorkerResult> => {
      return new Promise((resolve, reject) => {
        const handleMessage = (event: MessageEvent<WorkerResult>) => {
          worker.removeEventListener("message", handleMessage);
          worker.removeEventListener("error", handleError);
          resolve(event.data);
        };

        const handleError = (error: ErrorEvent) => {
          worker.removeEventListener("message", handleMessage);
          worker.removeEventListener("error", handleError);
          reject(error);
        };

        worker.addEventListener("message", handleMessage);
        worker.addEventListener("error", handleError);

        worker.postMessage({
          files: chunk,
          sessionId: Date.now().toString(),
        });
      });
    };

    // Process all chunks concurrently
    const chunkPromises: Promise<void>[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const workerIndex = i % this.workerPool.length;
      const worker = this.workerPool[workerIndex];
      const chunk = chunks[i];

      const promise = processChunk(chunk, worker)
        .then((result) => {
          allIssues.push(...result.fileIssues);
          totalLines += result.linesAnalyzed;
          allErrors.push(...result.errors);
          completedChunks++;

          if (onProgress) {
            onProgress({
              phase: "Pattern Analysis",
              current: completedChunks,
              total: chunks.length,
              message: `Analyzed ${completedChunks * this.chunkSize} of ${files.length} files`,
            });
          }
        })
        .catch((error) => {
          logger.error("Worker chunk failed:", error);
          allErrors.push(`Chunk processing failed: ${error}`);
          completedChunks++;
        });

      chunkPromises.push(promise);
    }

    await Promise.all(chunkPromises);

    return {
      issues: allIssues,
      linesAnalyzed: totalLines,
      errors: allErrors,
    };
  }

  private analyzeFilesSequentially(files: FileContent[]): {
    issues: SecurityIssue[];
    linesAnalyzed: number;
    errors: string[];
  } {
    const allIssues: SecurityIssue[] = [];
    let totalLines = 0;
    const errors: string[] = [];

    for (const file of files) {
      try {
        const issues = this.securityAnalyzer.analyzeFile(
          file.filename,
          file.content
        );
        allIssues.push(...issues);
        totalLines += file.content.split("\n").length;
      } catch (error) {
        errors.push(`Failed to analyze ${file.filename}: ${error}`);
      }
    }

    return { issues: allIssues, linesAnalyzed: totalLines, errors };
  }

  private terminateWorkerPool(): void {
    for (const worker of this.workerPool) {
      worker.terminate();
    }
    this.workerPool = [];
  }

  private async extractZipContents(zipFile: {
    arrayBuffer: () => Promise<ArrayBuffer>;
  }): Promise<FileContent[]> {
    const fileContents: FileContent[] = [];

    try {
      const buffer = await zipFile.arrayBuffer();
      const zipData = await JSZip.loadAsync(buffer);

      for (const [filename, file] of Object.entries(zipData.files)) {
        if (!file.dir && this.isAnalyzableFile(filename)) {
          const content = await file.async("string");
          fileContents.push({
            filename,
            content,
            size: content.length,
          });
        }
      }
    } catch (error) {
      logger.error("Failed to extract zip file contents:", error);
      throw new Error("Failed to extract zip file contents");
    }

    return fileContents;
  }

  private isAnalyzableFile(filename: string): boolean {
    const analyzableExtensions = [
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".mjs",
      ".cjs",
      ".py",
      ".pyw",
      ".java",
      ".php",
      ".rb",
      ".go",
      ".cs",
      ".cpp",
      ".c",
      ".h",
      ".hpp",
      ".rs",
      ".vue",
      ".svelte",
      ".json",
      ".yaml",
      ".yml",
      ".xml",
      ".html",
      ".htm",
      ".css",
      ".scss",
      ".sass",
      ".sh",
      ".bash",
      ".sql",
      ".dockerfile",
      ".env",
    ];

    const excludePatterns = [
      "node_modules/",
      ".git/",
      "dist/",
      "build/",
      "coverage/",
      ".next/",
      ".vscode/",
      "__pycache__/",
      ".pytest_cache/",
      "target/",
      "bin/",
      "obj/",
      "vendor/",
      ".DS_Store",
      "Thumbs.db",
      "package-lock.json",
      "yarn.lock",
      ".min.js",
      ".min.css",
    ];

    // Check if file should be excluded
    if (excludePatterns.some((pattern) => filename.includes(pattern))) {
      return false;
    }

    // Check if file has analyzable extension
    const hasValidExtension = analyzableExtensions.some((ext) =>
      filename.toLowerCase().endsWith(ext)
    );

    // Additional checks for specific file types
    const isConfigFile =
      /\.(config|conf)\./.test(filename) ||
      filename.endsWith(".env") ||
      filename.includes("webpack") ||
      filename.includes("babel") ||
      filename.includes("eslint");

    return hasValidExtension || isConfigFile;
  }

  public async analyzeCodebase(
    zipFile: { arrayBuffer: () => Promise<ArrayBuffer> },
    onProgress?: (progress: AnalysisProgress) => void
  ): Promise<AnalysisResults> {
    logger.info("Starting codebase analysis");
    const startTime = Date.now();
    let allIssues: SecurityIssue[] = [];
    let linesAnalyzed = 0;
    let totalFiles = 0;
    let packageJsonContent: string | undefined;
    let dependencyAnalysis;

    if (zipFile) {
      try {
        const fileContents = await this.extractZipContents(zipFile);
        totalFiles = fileContents.length;

        if (totalFiles === 0) {
          throw new Error(
            "This ZIP file does not contain any code files. Please upload a ZIP file with source code (.js, .py, .java, .ts, etc.)"
          );
        }

        // Extract package.json for dependency analysis
        const packageJsonFile = fileContents.find((f) =>
          f.filename.endsWith("package.json")
        );
        if (packageJsonFile) {
          packageJsonContent = packageJsonFile.content;
        }

        // Initialize smart language detection
        await this.securityAnalyzer.initializeAnalysisContext(fileContents);

        // Phase 1: Pattern-based and framework-specific analysis (parallel)
        if (onProgress) {
          onProgress({
            phase: "Pattern Analysis",
            current: 0,
            total: totalFiles,
            message: "Starting parallel file analysis...",
          });
        }

        const parallelResult = await this.analyzeFilesInParallel(
          fileContents,
          onProgress
        );
        allIssues = parallelResult.issues;
        linesAnalyzed = parallelResult.linesAnalyzed;

        if (parallelResult.errors.length > 0) {
          logger.warn("Some files failed analysis:", parallelResult.errors);
        }

        // Phase 2: AST-based deep analysis
        if (onProgress) {
          onProgress({
            phase: "AST Analysis",
            current: 0,
            total: totalFiles,
            message: "Performing deep AST analysis...",
          });
        }

        for (let i = 0; i < fileContents.length; i++) {
          const fileContent = fileContents[i];
          const astIssues = this.astAnalyzer.analyzeAST(
            fileContent.filename,
            fileContent.content
          );
          allIssues = [...allIssues, ...astIssues];

          if (onProgress && i % 10 === 0) {
            onProgress({
              phase: "AST Analysis",
              current: i + 1,
              total: fileContents.length,
            });
          }
        }

        // Phase 3: Data flow and taint analysis
        if (onProgress) {
          onProgress({
            phase: "Data Flow Analysis",
            current: 0,
            total: 1,
            message: "Analyzing data flow and taint sources...",
          });
        }

        const dataFlowIssues =
          this.dataFlowAnalyzer.analyzeDataFlow(fileContents);
        allIssues = [...allIssues, ...dataFlowIssues];

        // Phase 4: Dependency vulnerability scanning
        if (onProgress) {
          onProgress({
            phase: "Dependency Scanning",
            current: 0,
            total: 1,
            message: "Scanning for vulnerable dependencies...",
          });
        }

        try {
          // Map FileContent to expected format with 'name' property
          const filesForScanning = fileContents.map((f) => ({
            name: f.filename,
            content: f.content,
          }));
          dependencyAnalysis =
            await this.dependencyScanner.scanDependencies(filesForScanning);
        } catch {
          // Dependency scanning is optional - continue without it
          dependencyAnalysis = undefined;
        }
      } catch (error) {
        logger.error("Error during codebase analysis:", error);
        // Return error-based analysis for failed ZIP processing

        return {
          issues: [],
          totalFiles: 0,
          analysisTime: "0.1s",
          summary: this.metricsCalculator.calculateSummaryMetrics([], 0),
          metrics: this.metricsCalculator.calculateDetailedMetrics([], 0),
          dependencies: this.metricsCalculator.analyzeDependencies(),
        };
      }
    } else {
      // Return empty analysis when no valid files found
      return {
        issues: [],
        totalFiles: 0,
        analysisTime: "0.1s",
        summary: this.metricsCalculator.calculateSummaryMetrics([], 0),
        metrics: this.metricsCalculator.calculateDetailedMetrics([], 0),
        dependencies: this.metricsCalculator.analyzeDependencies(),
      };
    }

    const endTime = Date.now();
    const analysisTime = ((endTime - startTime) / 1000).toFixed(1) + "s";

    logger.info(
      `Analysis complete in ${analysisTime}. Found ${allIssues.length} issues`
    );
    const analysisResults: AnalysisResults = {
      issues: allIssues,
      totalFiles,
      analysisTime,
      summary: this.metricsCalculator.calculateSummaryMetrics(
        allIssues,
        linesAnalyzed
      ),
      languageDetection:
        this.securityAnalyzer.getAnalysisContext()?.detectionResult,
      metrics: this.metricsCalculator.calculateDetailedMetrics(
        allIssues,
        linesAnalyzed
      ),
      dependencies:
        this.metricsCalculator.analyzeDependencies(packageJsonContent),
      dependencyAnalysis,
    };

    // Verify we have real analysis results
    this.verifyRealAnalysisResults(allIssues, totalFiles);

    // Clean up worker pool
    this.terminateWorkerPool();

    return analysisResults;
  }

  /**
   * Verify that we're getting real analysis results, not mock data
   */
  private verifyRealAnalysisResults(
    issues: SecurityIssue[],
    totalFiles: number
  ): void {
    if (totalFiles === 0) {
      return;
    }

    // Warn if no issues found in a large codebase — could indicate analyzer failure
    if (issues.length === 0 && totalFiles > 10) {
      logger.warn(
        `Analysis of ${totalFiles} files produced 0 issues. Verify analyzers ran correctly.`
      );
    }

    // Validate issue structure integrity
    const malformedIssues = issues.filter(
      (issue) => !issue.severity || !issue.message || !issue.filename
    );
    if (malformedIssues.length > 0) {
      logger.warn(
        `${malformedIssues.length} issues have missing required fields (severity, message, or filename)`
      );
    }
  }
}

// Convenience function for direct analysis
export async function analyzeCode(zipFile: {
  arrayBuffer: () => Promise<ArrayBuffer>;
}): Promise<AnalysisResults> {
  const engine = new EnhancedAnalysisEngine();
  return engine.analyzeCodebase(zipFile);
}
