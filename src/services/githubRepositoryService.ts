import JSZip from "jszip";

import { logger } from "@/utils/logger";
import { repositoryCacheService } from "./storage/repositoryCacheService";
export interface GitHubRepoInfo {
  owner: string;
  repo: string;
  branch?: string;
}

export interface GitHubFileContent {
  path: string;
  content: string;
  size: number;
  type: string;
}

export interface GitHubUserInfo {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

class GitHubRepositoryService {
  private readonly baseUrl = "https://api.github.com";
  private readonly rawContentUrl = "https://raw.githubusercontent.com";
  private cacheInitialized = false;

  private getGitHubAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem("github_oauth_token");
    } catch {
      return null;
    }
  }

  private authHeaders(): HeadersInit {
    const token = this.getGitHubAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Parse GitHub URL to extract owner, repo, and branch
   * Security: Validates that URL is actually from github.com domain
   */
  parseGitHubUrl(url: string): GitHubRepoInfo | null {
    try {
      // Sanitize and validate URL
      const trimmedUrl = url.trim();

      // Parse URL to ensure it's a valid URL and from github.com
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(trimmedUrl);
      } catch {
        return null;
      }

      // Security: Ensure the hostname is exactly github.com (case-insensitive)
      // This prevents attacks like: https://evil.com/github.com/fake/repo
      if (parsedUrl.hostname.toLowerCase() !== "github.com") {
        return null;
      }

      // Security: Ensure protocol is https
      if (parsedUrl.protocol !== "https:") {
        return null;
      }

      // Extract pathname and parse it
      const pathname = parsedUrl.pathname;

      // Support multiple GitHub URL formats
      const patterns = [
        /^\/([^/]+)\/([^/]+?)(?:\/tree\/([^/]+))?(?:\.git)?$/,
        /^\/([^/]+)\/([^/]+)$/,
        /^\/([^/]+)\/([^/]+)\/tree\/([^/]+)/,
      ];

      for (const pattern of patterns) {
        const match = pathname.match(pattern);
        if (match) {
          // Validate owner and repo names (GitHub restrictions)
          const owner = match[1];
          const repo = match[2].replace(/\.git$/, "");
          const branch = match[3];

          // Security: Validate owner and repo names contain only allowed characters
          const validNamePattern = /^[a-zA-Z0-9._-]+$/;
          if (!validNamePattern.test(owner) || !validNamePattern.test(repo)) {
            return null;
          }

          return {
            owner,
            repo,
            branch,
          };
        }
      }

      return null;
    } catch (error) {
      logger.error("Error parsing GitHub URL:", error);
      return null;
    }
  }

  /**
   * Validate if repository exists and is accessible
   */
  async validateRepository(owner: string, repo: string): Promise<boolean> {
    try {
      const response = await fetch("/api/github/repo/info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.authHeaders(),
        },
        body: JSON.stringify({ owner, repo }),
      });
      return response.ok;
    } catch (error) {
      logger.error("Error validating repository:", error);
      return false;
    }
  }

  /**
   * Get repository information
   */
  async getRepositoryInfo(owner: string, repo: string) {
    try {
      const response = await fetch("/api/github/repo/info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.authHeaders(),
        },
        body: JSON.stringify({ owner, repo }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(
          payload.error ||
            payload.details ||
            `Failed to fetch repository: ${response.statusText}`
        );
      }

      const data = await response.json();
      return {
        name: data.name,
        fullName: data.full_name,
        description: data.description,
        defaultBranch: data.default_branch,
        size: data.size,
        language: data.language,
        stars: data.stargazers_count,
        forks: data.forks_count,
        openIssues: data.open_issues_count,
        private: data.private,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      logger.error("Error fetching repository info:", error);
      throw error;
    }
  }

  /**
   * Get GitHub user information by username
   */
  async getGitHubUserInfo(username: string): Promise<GitHubUserInfo | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/users/${encodeURIComponent(username)}`,
        {
          headers: {
            Accept: "application/vnd.github+json",
            ...this.authHeaders(),
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          logger.warn(`GitHub user not found: ${username}`);
          return null;
        }
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error("Error fetching GitHub user info:", error);
      return null;
    }
  }

  /**
   * Get GitHub user information by user ID
   */
  async getGitHubUserById(userId: string): Promise<GitHubUserInfo | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/user/${encodeURIComponent(userId)}`,
        {
          headers: {
            Accept: "application/vnd.github+json",
            ...this.authHeaders(),
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          logger.warn(`GitHub user not found by ID: ${userId}`);
          return null;
        }
        throw new Error(`Failed to fetch user by ID: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error("Error fetching GitHub user by ID:", error);
      return null;
    }
  }

  /**
   * Get repository contributors
   */
  async getContributors(owner: string, repo: string): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/repos/${owner}/${repo}/contributors?per_page=100`,
        {
          headers: {
            Accept: "application/vnd.github+json",
            ...this.authHeaders(),
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch contributors: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error("Error fetching contributors:", error);
      return [];
    }
  }

  /**
   * Get file tree from repository
   */
  async getRepositoryTree(
    owner: string,
    repo: string,
    branch: string = "main"
  ) {
    try {
      const response = await fetch(
        `${this.baseUrl}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
        {
          headers: {
            Accept: "application/vnd.github+json",
            ...this.authHeaders(),
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch repository tree: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data.tree;
    } catch (error) {
      logger.error("Error fetching repository tree:", error);
      throw error;
    }
  }

  /**
   * Helper to fetch with retry logic
   */
  private async fetchWithRetry(
    url: string,
    options?: RequestInit,
    retries = 3,
    baseDelay = 1000
  ): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);

        // Return if success or client error (except 429)
        if (response.ok || (response.status < 500 && response.status !== 429)) {
          return response;
        }

        // Calculate delay for retry
        const delay =
          response.status === 429
            ? 5000 * (i + 1) // Longer wait for rate limits
            : baseDelay * Math.pow(2, i); // Exponential backoff for server errors

        if (i < retries - 1) {
          logger.warn(
            `Fetch failed with status ${response.status}. Retrying in ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } catch (error) {
        if (i === retries - 1) throw error;

        const delay = baseDelay * Math.pow(2, i);
        logger.warn(`Fetch network error: ${error}. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error(`Failed to fetch ${url} after ${retries} retries`);
  }

  /**
   * Get file content from repository
   */
  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    branch: string = "main"
  ): Promise<string> {
    try {
      // Properly encode URL components to handle special characters
      const encodedOwner = encodeURIComponent(owner);
      const encodedRepo = encodeURIComponent(repo);
      // Branch and path segments should be encoded individually, preserving slashes
      const encodedBranch = branch.split("/").map(encodeURIComponent).join("/");
      const encodedPath = path.split("/").map(encodeURIComponent).join("/");

      const url = `${this.rawContentUrl}/${encodedOwner}/${encodedRepo}/${encodedBranch}/${encodedPath}`;

      const response = await this.fetchWithRetry(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      logger.error(`Error fetching file ${path}:`, error);
      throw error;
    }
  }

  /**
   * Check if file should be included in analysis based on extension
   */
  private shouldIncludeFile(path: string): boolean {
    const codeExtensions = [
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".py",
      ".java",
      ".c",
      ".cpp",
      ".cs",
      ".go",
      ".rs",
      ".rb",
      ".php",
      ".swift",
      ".kt",
      ".scala",
      ".vue",
      ".html",
      ".css",
      ".scss",
      ".sass",
      ".json",
      ".xml",
      ".yaml",
      ".yml",
      ".sql",
      ".sh",
      ".bash",
      ".ps1",
      ".gradle",
      ".maven",
      ".dart",
    ];

    const excludePatterns = [
      "node_modules/",
      ".git/",
      "dist/",
      "build/",
      "coverage/",
      ".next/",
      "vendor/",
      "target/",
      "bin/",
      "obj/",
      "__pycache__/",
      ".venv/",
      "venv/",
    ];

    // Check if file is in excluded directory
    for (const pattern of excludePatterns) {
      if (path.includes(pattern)) {
        return false;
      }
    }

    // Check if file has valid code extension
    return codeExtensions.some((ext) => path.toLowerCase().endsWith(ext));
  }

  /**
   * Download repository via server-side proxy to avoid CORS issues
   */
  private async downloadViaProxy(
    owner: string,
    repo: string,
    branch: string,
    useArchive: boolean = false
  ): Promise<Response> {
    const proxyUrl = "/api/github/download";

    const response = await fetch(proxyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.authHeaders(),
      },
      body: JSON.stringify({
        owner,
        repo,
        branch,
        useArchive,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Server proxy failed: ${response.statusText}`
      );
    }

    return response;
  }

  /**
   * Initialize client-side cache
   */
  private async initializeCache(): Promise<void> {
    if (this.cacheInitialized) return;

    try {
      await repositoryCacheService.init();
      this.cacheInitialized = true;
      logger.info("Client-side repository cache initialized");
    } catch (error) {
      logger.warn(
        "Failed to initialize cache, will proceed without caching:",
        error
      );
      this.cacheInitialized = false;
    }
  }

  /**
   * Download repository and create a zip file for analysis
   * Uses server-side proxy to avoid CORS issues
   * Implements client-side caching for improved performance
   */
  async downloadRepositoryAsZip(
    owner: string,
    repo: string,
    branch: string = "main",
    onProgress?: (progress: number, message: string) => void,
    bypassCache: boolean = false
  ): Promise<File> {
    try {
      // Initialize cache if not already done
      await this.initializeCache();

      // Check client-side cache first
      if (!bypassCache && this.cacheInitialized) {
        onProgress?.(5, "Checking cache...");
        const cached = await repositoryCacheService.get(owner, repo, branch);

        if (cached) {
          logger.info(`Using cached repository ${owner}/${repo}@${branch}`);
          onProgress?.(100, "Loaded from cache!");

          const fileName = `${owner}-${repo}-${branch}.zip`;
          return new File([cached.data], fileName, { type: "application/zip" });
        }
      }

      onProgress?.(10, "Fetching repository archive...");

      // Validate repository exists
      await this.getRepositoryInfo(owner, repo);

      onProgress?.(20, "Downloading via secure proxy...");

      // Try downloading via server-side proxy (avoids CORS issues)
      let response: Response;

      try {
        // First try: Use GitHub API zipball via proxy
        response = await this.downloadViaProxy(owner, repo, branch, false);
        logger.info(`Successfully downloaded via API proxy`);
      } catch (error) {
        logger.warn(`API proxy failed: ${error}. Trying archive proxy...`);

        try {
          // Second try: Use public archive URL via proxy
          response = await this.downloadViaProxy(owner, repo, branch, true);
          logger.info(`Successfully downloaded via archive proxy`);
        } catch (secondError) {
          logger.error(
            `Both proxy methods failed. API: ${error instanceof Error ? error.message : String(error)}, Archive: ${secondError instanceof Error ? secondError.message : String(secondError)}`
          );

          // Last resort: Try direct download (may fail due to CORS)
          logger.warn("Attempting direct download as last resort...");
          try {
            const directUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.zip`;
            response = await this.fetchWithRetry(directUrl, {}, 2, 1000);
            logger.info("Direct download succeeded (unexpected but good!)");
          } catch (thirdError) {
            // All methods failed, throw comprehensive error
            throw new Error(
              `Failed to download repository '${owner}/${repo}' branch '${branch}'. ` +
                `API proxy: ${error instanceof Error ? error.message : String(error)}. ` +
                `Archive proxy: ${secondError instanceof Error ? secondError.message : String(secondError)}. ` +
                `Direct download: ${thirdError instanceof Error ? thirdError.message : String(thirdError)}. ` +
                `Please verify the repository exists and the branch name is correct.`
            );
          }
        }
      }

      if (!response.ok) {
        throw new Error(
          `Failed to download repository archive: ${response.statusText}`
        );
      }

      // Track download progress if possible
      const contentLength = response.headers.get("content-length");
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      let loaded = 0;

      const reader = response.body?.getReader();
      const chunks: BlobPart[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (value) {
            chunks.push(value);
            loaded += value.length;

            if (total > 0) {
              const progress = 10 + Math.floor((loaded / total) * 40); // 10% to 50%
              onProgress?.(progress, "Downloading repository...");
            } else {
              // If no content-length, just show indeterminate progress
              onProgress?.(
                30,
                `Downloading repository... (${this.formatBytes(loaded)})`
              );
            }
          }
        }
      } else {
        // Fallback if no reader available
        const blob = await response.blob();
        chunks.push(new Uint8Array(await blob.arrayBuffer()));
      }

      onProgress?.(50, "Processing repository archive...");

      // Combine chunks into a single blob
      const combinedBlob = new Blob(chunks);

      // Load the zip file
      const originalZip = await JSZip.loadAsync(combinedBlob);

      onProgress?.(60, "Filtering code files...");

      // Create a new zip containing only code files
      const newZip = new JSZip();
      let fileCount = 0;

      // Get all files and filter them
      const files = Object.keys(originalZip.files);
      const totalFiles = files.length;
      let processedFiles = 0;

      for (const filePath of files) {
        const file = originalZip.files[filePath];
        processedFiles++;

        // Skip directories
        if (file.dir) continue;

        // Skip non-code files
        if (!this.shouldIncludeFile(filePath)) continue;

        // Add to new zip
        // We can copy the content directly without re-compressing immediately
        // but JSZip will handle re-compression on generate
        const content = await file.async("blob");

        // Remove the top-level directory prefix that GitHub adds (e.g., "owner-repo-hash/")
        // so the analysis sees a clean structure
        const cleanPath = filePath.substring(filePath.indexOf("/") + 1);
        if (cleanPath) {
          newZip.file(cleanPath, content);
          fileCount++;
        }

        if (processedFiles % 100 === 0) {
          const progress = 60 + Math.floor((processedFiles / totalFiles) * 20); // 60% to 80%
          onProgress?.(progress, "Filtering files...");
        }
      }

      if (fileCount === 0) {
        throw new Error("No code files found in repository");
      }

      onProgress?.(80, `Found ${fileCount} code files. Re-packaging...`);

      // Generate new zip file
      let lastZipProgress = 0;
      const zipBlob = await newZip.generateAsync(
        { type: "blob" },
        (metadata) => {
          const now = Date.now();
          // Throttle zip progress updates
          if (now - lastZipProgress > 100 || metadata.percent === 100) {
            const progress = 80 + Math.floor(metadata.percent / 5); // 80% to 100%
            onProgress?.(
              progress,
              `Compressing optimized archive... ${Math.floor(metadata.percent)}%`
            );
            lastZipProgress = now;
          }
        }
      );

      onProgress?.(95, "Repository ready for analysis!");

      // Store in client-side cache for future use
      if (this.cacheInitialized && !bypassCache) {
        try {
          await repositoryCacheService.set(owner, repo, branch, zipBlob);
          logger.info(
            `Cached repository ${owner}/${repo}@${branch} for future use`
          );
        } catch (cacheError) {
          logger.warn("Failed to cache repository:", cacheError);
          // Continue without caching
        }
      }

      onProgress?.(100, "Repository ready for analysis!");

      // Create File object
      const fileName = `${owner}-${repo}-${branch}.zip`;
      return new File([zipBlob], fileName, { type: "application/zip" });
    } catch (error) {
      logger.error("Error downloading repository:", error);
      throw error;
    }
  }

  /**
   * Get repository download link (archive endpoint as fallback)
   */
  getArchiveDownloadUrl(
    owner: string,
    repo: string,
    branch: string = "main"
  ): string {
    return `${this.baseUrl}/repos/${owner}/${repo}/zipball/${branch}`;
  }

  /**
   * Estimate repository size and file count
   */
  async estimateRepositorySize(
    owner: string,
    repo: string,
    branch: string = "main"
  ) {
    try {
      const tree = await this.getRepositoryTree(owner, repo, branch);
      const codeFiles = tree.filter(
        (item: any) => item.type === "blob" && this.shouldIncludeFile(item.path)
      );

      const totalSize = codeFiles.reduce(
        (sum: number, file: any) => sum + (file.size || 0),
        0
      );

      return {
        fileCount: codeFiles.length,
        totalSize: totalSize,
        formattedSize: this.formatBytes(totalSize),
      };
    } catch (error) {
      logger.error("Error estimating repository size:", error);
      return null;
    }
  }

  /**
   * Format bytes to human readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }
}

export const githubRepositoryService = new GitHubRepositoryService();

// Export the class for direct instantiation
export { GitHubRepositoryService };
