import { logger } from "@/utils/logger";

// GitHub API rate limit tracking
interface RateLimitInfo {
  remaining: number;
  reset: number;
  limit: number;
}

export interface GitHubContributor {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: string;
}

export interface ContributorWithDetails extends GitHubContributor {
  name?: string;
  bio?: string;
  location?: string;
  company?: string;
  blog?: string;
  public_repos?: number;
  followers?: number;
}

export interface GitHubRelease {
  id: number;
  name: string;
  tag_name: string;
  body: string;
  published_at: string;
  html_url: string;
  author: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
}

export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  html_url: string;
  author: {
    login: string;
    avatar_url: string;
    html_url: string;
  } | null;
}

class GitHubService {
  private readonly baseUrl = "https://api.github.com";
  private readonly repoOwner = "Xenonesis";
  private readonly repoName = "code-guardian-report";
  private rateLimitInfo: RateLimitInfo | null = null;

  /**
   * Update rate limit info from response headers
   */
  private updateRateLimitFromResponse(response: Response): void {
    const remaining = response.headers.get("X-RateLimit-Remaining");
    const reset = response.headers.get("X-RateLimit-Reset");
    const limit = response.headers.get("X-RateLimit-Limit");

    if (remaining && reset && limit) {
      this.rateLimitInfo = {
        remaining: parseInt(remaining, 10),
        reset: parseInt(reset, 10),
        limit: parseInt(limit, 10),
      };
    }
  }

  /**
   * Check if rate limited and return wait time in seconds
   */
  public getRateLimitStatus(): {
    isLimited: boolean;
    waitTime: number;
    remaining: number;
  } {
    if (!this.rateLimitInfo) {
      return { isLimited: false, waitTime: 0, remaining: 60 };
    }

    const now = Math.floor(Date.now() / 1000);
    const isLimited = this.rateLimitInfo.remaining <= 0;
    const waitTime = isLimited
      ? Math.max(0, this.rateLimitInfo.reset - now)
      : 0;

    return { isLimited, waitTime, remaining: this.rateLimitInfo.remaining };
  }

  async getContributors(): Promise<GitHubContributor[]> {
    try {
      // Check rate limit before making request
      const { isLimited, waitTime } = this.getRateLimitStatus();
      if (isLimited) {
        logger.warn(`GitHub API rate limited. Reset in ${waitTime} seconds.`);
        return [];
      }

      const response = await fetch(
        `${this.baseUrl}/repos/${this.repoOwner}/${this.repoName}/contributors?per_page=50`
      );

      this.updateRateLimitFromResponse(response);

      if (response.status === 403) {
        const resetTime = response.headers.get("X-RateLimit-Reset");
        const waitSeconds = resetTime
          ? Math.max(0, parseInt(resetTime, 10) - Math.floor(Date.now() / 1000))
          : 60;
        logger.warn(
          `GitHub API rate limit exceeded. Try again in ${waitSeconds} seconds.`
        );
        return [];
      }

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const contributors = await response.json();
      return contributors.filter(
        (contributor: GitHubContributor) =>
          contributor.type === "User" && contributor.contributions > 0
      );
    } catch (error) {
      logger.error("Error fetching contributors:", error);
      return [];
    }
  }

  async getContributorDetails(
    username: string
  ): Promise<ContributorWithDetails | null> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${username}`);

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error(`Error fetching details for ${username}:`, error);
      return null;
    }
  }

  async getContributorsWithDetails(): Promise<ContributorWithDetails[]> {
    try {
      const contributors = await this.getContributors();

      // Get details for top contributors (limit to avoid rate limiting)
      const topContributors = contributors.slice(0, 10);

      // Fetch details in parallel (batched) for better performance
      const detailsPromises = topContributors.map((contributor) =>
        this.getContributorDetails(contributor.login)
      );

      const detailsResults = await Promise.allSettled(detailsPromises);

      const contributorsWithDetails: ContributorWithDetails[] = [];

      detailsResults.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value) {
          contributorsWithDetails.push({
            ...topContributors[index],
            ...result.value,
          });
        } else {
          // Include contributor without details if fetch failed
          contributorsWithDetails.push(topContributors[index]);
        }
      });

      return contributorsWithDetails;
    } catch (error) {
      logger.error("Error fetching contributors with details:", error);
      return [];
    }
  }

  async getRepositoryStats() {
    try {
      const response = await fetch(
        `${this.baseUrl}/repos/${this.repoOwner}/${this.repoName}`
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const repo = await response.json();
      return {
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        watchers: repo.watchers_count,
        openIssues: repo.open_issues_count,
        language: repo.language,
        createdAt: repo.created_at,
        updatedAt: repo.updated_at,
        description: repo.description,
      };
    } catch (error) {
      logger.error("Error fetching repository stats:", error);
      return null;
    }
  }

  async getReleases(): Promise<GitHubRelease[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/repos/${this.repoOwner}/${this.repoName}/releases`
      );

      if (response.status === 404) {
        logger.warn(
          `GitHub repository not found: ${this.repoOwner}/${this.repoName}`
        );
        return [];
      }

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error("Error fetching releases:", error);
      return [];
    }
  }

  async getCommits(): Promise<GitHubCommit[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/repos/${this.repoOwner}/${this.repoName}/commits?per_page=50`
      );

      if (response.status === 404) {
        logger.warn(
          `GitHub repository not found: ${this.repoOwner}/${this.repoName}`
        );
        return [];
      }

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error("Error fetching commits:", error);
      return [];
    }
  }
}

export const githubService = new GitHubService();
