import JSZip from 'jszip';

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

class GitHubRepositoryService {
  private readonly baseUrl = 'https://api.github.com';
  private readonly rawContentUrl = 'https://raw.githubusercontent.com';

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
      if (parsedUrl.hostname.toLowerCase() !== 'github.com') {
        return null;
      }

      // Security: Ensure protocol is https
      if (parsedUrl.protocol !== 'https:') {
        return null;
      }

      // Extract pathname and parse it
      const pathname = parsedUrl.pathname;

      // Support multiple GitHub URL formats
      const patterns = [
        /^\/([^\/]+)\/([^\/]+?)(?:\/tree\/([^\/]+))?(?:\.git)?$/,
        /^\/([^\/]+)\/([^\/]+)$/,
        /^\/([^\/]+)\/([^\/]+)\/tree\/([^\/]+)/,
      ];

      for (const pattern of patterns) {
        const match = pathname.match(pattern);
        if (match) {
          // Validate owner and repo names (GitHub restrictions)
          const owner = match[1];
          const repo = match[2].replace(/\.git$/, '');
          const branch = match[3] || 'main';

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
      console.error('Error parsing GitHub URL:', error);
      return null;
    }
  }

  /**
   * Validate if repository exists and is accessible
   */
  async validateRepository(owner: string, repo: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`);
      return response.ok;
    } catch (error) {
      console.error('Error validating repository:', error);
      return false;
    }
  }

  /**
   * Get repository information
   */
  async getRepositoryInfo(owner: string, repo: string) {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch repository: ${response.statusText}`);
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
      console.error('Error fetching repository info:', error);
      throw error;
    }
  }

  /**
   * Get file tree from repository
   */
  async getRepositoryTree(owner: string, repo: string, branch: string = 'main') {
    try {
      const response = await fetch(
        `${this.baseUrl}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch repository tree: ${response.statusText}`);
      }

      const data = await response.json();
      return data.tree;
    } catch (error) {
      console.error('Error fetching repository tree:', error);
      throw error;
    }
  }

  /**
   * Get file content from repository
   */
  async getFileContent(owner: string, repo: string, path: string, branch: string = 'main'): Promise<string> {
    try {
      const response = await fetch(
        `${this.rawContentUrl}/${owner}/${repo}/${branch}/${path}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      console.error(`Error fetching file ${path}:`, error);
      throw error;
    }
  }

  /**
   * Check if file should be included in analysis based on extension
   */
  private shouldIncludeFile(path: string): boolean {
    const codeExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', '.cs',
      '.go', '.rs', '.rb', '.php', '.swift', '.kt', '.scala', '.vue',
      '.html', '.css', '.scss', '.sass', '.json', '.xml', '.yaml', '.yml',
      '.sql', '.sh', '.bash', '.ps1', '.gradle', '.maven', '.dart',
    ];

    const excludePatterns = [
      'node_modules/',
      '.git/',
      'dist/',
      'build/',
      'coverage/',
      '.next/',
      'vendor/',
      'target/',
      'bin/',
      'obj/',
      '__pycache__/',
      '.venv/',
      'venv/',
    ];

    // Check if file is in excluded directory
    for (const pattern of excludePatterns) {
      if (path.includes(pattern)) {
        return false;
      }
    }

    // Check if file has valid code extension
    return codeExtensions.some(ext => path.toLowerCase().endsWith(ext));
  }

  /**
   * Download repository and create a zip file for analysis
   */
  async downloadRepositoryAsZip(
    owner: string,
    repo: string,
    branch: string = 'main',
    onProgress?: (progress: number, message: string) => void
  ): Promise<File> {
    try {
      onProgress?.(10, 'Fetching repository information...');

      // Get repository info
      const repoInfo = await this.getRepositoryInfo(owner, repo);

      onProgress?.(20, 'Loading repository structure...');

      // Get file tree
      const tree = await this.getRepositoryTree(owner, repo, branch);

      // Filter only code files
      const codeFiles = tree.filter((item: any) => 
        item.type === 'blob' && this.shouldIncludeFile(item.path)
      );

      if (codeFiles.length === 0) {
        throw new Error('No code files found in repository');
      }

      onProgress?.(30, `Found ${codeFiles.length} code files. Downloading...`);

      // Create zip file
      const zip = new JSZip();
      const totalFiles = codeFiles.length;
      let downloadedFiles = 0;

      // Download files in batches to avoid rate limiting
      const batchSize = 10;
      for (let i = 0; i < codeFiles.length; i += batchSize) {
        const batch = codeFiles.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async (file: any) => {
            try {
              const content = await this.getFileContent(owner, repo, file.path, branch);
              zip.file(file.path, content);
              downloadedFiles++;

              const progress = 30 + Math.floor((downloadedFiles / totalFiles) * 60);
              onProgress?.(progress, `Downloaded ${downloadedFiles}/${totalFiles} files...`);
            } catch (error) {
              console.warn(`Failed to download ${file.path}:`, error);
            }
          })
        );

        // Small delay between batches to avoid rate limiting
        if (i + batchSize < codeFiles.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      onProgress?.(90, 'Creating zip file...');

      // Generate zip file
      const zipBlob = await zip.generateAsync(
        { type: 'blob' },
        (metadata) => {
          const progress = 90 + Math.floor(metadata.percent / 10);
          onProgress?.(progress, `Compressing files... ${Math.floor(metadata.percent)}%`);
        }
      );

      onProgress?.(100, 'Repository ready for analysis!');

      // Create File object
      const fileName = `${owner}-${repo}-${branch}.zip`;
      return new File([zipBlob], fileName, { type: 'application/zip' });

    } catch (error) {
      console.error('Error downloading repository:', error);
      throw error;
    }
  }

  /**
   * Get repository download link (archive endpoint as fallback)
   */
  getArchiveDownloadUrl(owner: string, repo: string, branch: string = 'main'): string {
    return `${this.baseUrl}/repos/${owner}/${repo}/zipball/${branch}`;
  }

  /**
   * Estimate repository size and file count
   */
  async estimateRepositorySize(owner: string, repo: string, branch: string = 'main') {
    try {
      const tree = await this.getRepositoryTree(owner, repo, branch);
      const codeFiles = tree.filter((item: any) => 
        item.type === 'blob' && this.shouldIncludeFile(item.path)
      );

      const totalSize = codeFiles.reduce((sum: number, file: any) => sum + (file.size || 0), 0);

      return {
        fileCount: codeFiles.length,
        totalSize: totalSize,
        formattedSize: this.formatBytes(totalSize),
      };
    } catch (error) {
      console.error('Error estimating repository size:', error);
      return null;
    }
  }

  /**
   * Format bytes to human readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

export const githubRepositoryService = new GitHubRepositoryService();

