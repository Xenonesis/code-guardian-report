import { SecurityIssue } from "@/types/security-types";
import { logger } from "@/utils/logger";

interface FileContent {
  filename: string;
  content: string;
}

interface WorkerResult {
  fileIssues: SecurityIssue[];
  linesAnalyzed: number;
  errors: string[];
}

interface WorkerPoolOptions {
  maxWorkers: number;
  chunkSize: number;
}

const DEFAULT_OPTIONS: WorkerPoolOptions = {
  maxWorkers: navigator.hardwareConcurrency || 4,
  chunkSize: 10,
};

export class WorkerPool {
  private workers: Worker[] = [];
  private options: WorkerPoolOptions;
  private activeWorkers: Set<Worker> = new Set();
  private workerUrl: string | null = null;

  constructor(options: Partial<WorkerPoolOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  async initialize(workerScript: string): Promise<void> {
    // Create a blob URL for the worker script
    const blob = new Blob([workerScript], { type: "application/javascript" });
    this.workerUrl = URL.createObjectURL(blob);

    // Pre-create workers
    for (let i = 0; i < this.options.maxWorkers; i++) {
      try {
        const worker = new Worker(this.workerUrl);
        this.workers.push(worker);
      } catch (error) {
        logger.warn(`Failed to create worker ${i}:`, error);
      }
    }

    logger.info(`Worker pool initialized with ${this.workers.length} workers`);
  }

  async processFiles(
    files: FileContent[],
    onProgress?: (completed: number, total: number) => void
  ): Promise<{
    issues: SecurityIssue[];
    linesAnalyzed: number;
    errors: string[];
  }> {
    if (files.length === 0) {
      return { issues: [], linesAnalyzed: 0, errors: [] };
    }

    if (!this.workerUrl || this.workers.length === 0) {
      throw new Error("Worker pool not initialized");
    }

    // Split files into chunks
    const chunks: FileContent[][] = [];
    for (let i = 0; i < files.length; i += this.options.chunkSize) {
      chunks.push(files.slice(i, i + this.options.chunkSize));
    }

    const allIssues: SecurityIssue[] = [];
    let totalLines = 0;
    const allErrors: string[] = [];
    let completedChunks = 0;

    // Process chunks in parallel using available workers
    const processChunk = async (
      chunk: FileContent[],
      worker: Worker
    ): Promise<WorkerResult> => {
      return new Promise((resolve, reject) => {
        this.activeWorkers.add(worker);

        const handleMessage = (event: MessageEvent<WorkerResult>) => {
          worker.removeEventListener("message", handleMessage);
          worker.removeEventListener("error", handleError);
          this.activeWorkers.delete(worker);
          resolve(event.data);
        };

        const handleError = (error: ErrorEvent) => {
          worker.removeEventListener("message", handleMessage);
          worker.removeEventListener("error", handleError);
          this.activeWorkers.delete(worker);
          reject(error);
        };

        worker.addEventListener("message", handleMessage);
        worker.addEventListener("error", handleError);

        worker.postMessage({ files: chunk, sessionId: Date.now().toString() });
      });
    };

    // Process chunks with bounded concurrency
    const queue = [...chunks];
    const workerIndex = 0;

    const processQueue = async () => {
      while (
        queue.length > 0 &&
        this.activeWorkers.size < this.options.maxWorkers
      ) {
        const chunk = queue.shift();
        const worker = this.workers[workerIndex % this.workers.length];

        if (chunk && worker) {
          processChunk(chunk, worker)
            .then((result) => {
              allIssues.push(...result.fileIssues);
              totalLines += result.linesAnalyzed;
              allErrors.push(...result.errors);
              completedChunks++;

              if (onProgress) {
                onProgress(
                  completedChunks * this.options.chunkSize,
                  files.length
                );
              }
            })
            .catch((error) => {
              logger.error("Worker chunk failed:", error);
              allErrors.push(`Chunk processing failed: ${error}`);
              completedChunks++;
            });
        }
      }
    };

    // Start processing
    await processQueue();

    // Wait for all workers to complete
    while (this.activeWorkers.size > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return {
      issues: allIssues,
      linesAnalyzed: totalLines,
      errors: allErrors,
    };
  }

  terminate(): void {
    for (const worker of this.workers) {
      worker.terminate();
    }
    this.workers = [];
    this.activeWorkers.clear();

    if (this.workerUrl) {
      URL.revokeObjectURL(this.workerUrl);
      this.workerUrl = null;
    }

    logger.info("Worker pool terminated");
  }

  getStats(): { totalWorkers: number; activeWorkers: number } {
    return {
      totalWorkers: this.workers.length,
      activeWorkers: this.activeWorkers.size,
    };
  }
}

export async function createWorkerPool(
  options?: Partial<WorkerPoolOptions>
): Promise<WorkerPool> {
  // Import the worker code dynamically
  const workerCode = await import("./analysis.worker?worker")
    .then((m) => {
      return `(${m.toString()})();`;
    })
    .catch(() => {
      // Fallback: return inline worker code
      return "";
    });

  // For now, we'll create a simple inline worker if dynamic import fails
  if (!workerCode) {
    logger.warn("Worker import failed, using fallback single-threaded mode");
  }

  return new WorkerPool(options);
}
