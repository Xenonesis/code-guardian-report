import { logger } from '@/utils/logger';

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

class GitHubService {
  private readonly baseUrl = 'https://api.github.com';
  private readonly repoOwner = 'Xenonesis';
  private readonly repoName = 'code-guardian-report';

  async getContributors(): Promise<GitHubContributor[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/repos/${this.repoOwner}/${this.repoName}/contributors?per_page=50`
      );
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const contributors = await response.json();
      return contributors.filter((contributor: GitHubContributor) => 
        contributor.type === 'User' && contributor.contributions > 0
      );
    } catch (error) {
      logger.error('Error fetching contributors:', error);
      return [];
    }
  }

  async getContributorDetails(username: string): Promise<ContributorWithDetails | null> {
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
      const contributorsWithDetails: ContributorWithDetails[] = [];

      // Get details for top contributors (limit to avoid rate limiting)
      const topContributors = contributors.slice(0, 10);
      
      for (const contributor of topContributors) {
        const details = await this.getContributorDetails(contributor.login);
        if (details) {
          contributorsWithDetails.push({
            ...contributor,
            ...details
          });
        }
      }

      return contributorsWithDetails;
    } catch (error) {
      logger.error('Error fetching contributors with details:', error);
      return [];
    }
  }

  async getRepositoryStats() {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${this.repoOwner}/${this.repoName}`);
      
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
        description: repo.description
      };
    } catch (error) {
      logger.error('Error fetching repository stats:', error);
      return null;
    }
  }
}

export const githubService = new GitHubService();