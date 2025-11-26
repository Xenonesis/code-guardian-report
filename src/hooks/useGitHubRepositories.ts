// hooks/useGitHubRepositories.ts
import { useState, useEffect } from 'react';
import { logger } from '@/utils/logger';

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  private: boolean;
}

interface UseGitHubRepositoriesOptions {
  email: string | null;
  enabled: boolean;
}

export const useGitHubRepositories = ({ email, enabled }: UseGitHubRepositoriesOptions) => {
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [githubUsername, setGithubUsername] = useState<string | null>(null);

  // Check if email is associated with GitHub
  const checkGitHubAssociation = async (email: string): Promise<string | null> => {
    try {
      // Try to search for the user by email on GitHub
      // Note: GitHub API doesn't directly support email search, 
      // so we'll use a heuristic approach
      
      // Extract username from email if it's a common pattern
      const username = email.split('@')[0];
      
      // Try to fetch user profile
      const response = await fetch(`https://api.github.com/users/${username}`);
      
      if (response.ok) {
        const userData = await response.json();
        
        // Additional verification: check if the user has public email
        if (userData.email && userData.email.toLowerCase() === email.toLowerCase()) {
          return username;
        }
        
        // Even without direct email match, we found a user with that username
        return username;
      }
      
      return null;
    } catch (error) {
      logger.error('Error checking GitHub association:', error);
      return null;
    }
  };

  // Manually set GitHub username
  const setManualUsername = async (username: string) => {
    setGithubUsername(username);
    await fetchRepositories(username);
  };

  // Fetch user repositories from GitHub
  const fetchRepositories = async (username: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=100&sort=updated&direction=desc`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch repositories: ${response.statusText}`);
      }

      const repos = await response.json();
      setRepositories(repos);
      
      // Store permission in localStorage
      localStorage.setItem('github_repo_permission', 'granted');
      localStorage.setItem('github_username', username);
      
      logger.debug(`Fetched ${repos.length} repositories for ${username}`);
    } catch (err: any) {
      logger.error('Error fetching repositories:', err);
      setError(err.message);
      setRepositories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeGitHubData = async () => {
      if (!enabled || !email) {
        return;
      }

      // Check if permission was previously granted
      const previousPermission = localStorage.getItem('github_repo_permission');
      const storedUsername = localStorage.getItem('github_username');

      if (previousPermission === 'granted' && storedUsername) {
        setGithubUsername(storedUsername);
        await fetchRepositories(storedUsername);
        return;
      }

      // Check if email is associated with GitHub
      const username = await checkGitHubAssociation(email);
      if (username) {
        setGithubUsername(username);
      }
    };

    initializeGitHubData();
  }, [email, enabled]);

  const grantPermission = async () => {
    if (githubUsername) {
      await fetchRepositories(githubUsername);
    }
  };

  const denyPermission = () => {
    localStorage.setItem('github_repo_permission', 'denied');
    setGithubUsername(null);
  };

  const revokePermission = () => {
    localStorage.removeItem('github_repo_permission');
    localStorage.removeItem('github_username');
    setRepositories([]);
    setGithubUsername(null);
  };

  return {
    repositories,
    loading,
    error,
    githubUsername,
    hasGitHubAccount: !!githubUsername,
    permissionGranted: repositories.length > 0 || localStorage.getItem('github_repo_permission') === 'granted',
    permissionDenied: localStorage.getItem('github_repo_permission') === 'denied',
    grantPermission,
    denyPermission,
    revokePermission,
    refreshRepositories: () => githubUsername && fetchRepositories(githubUsername),
    setManualUsername
  };
};
