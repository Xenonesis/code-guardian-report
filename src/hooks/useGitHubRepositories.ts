// hooks/useGitHubRepositories.ts
import { useState, useEffect } from "react";
import { logger } from "@/utils/logger";
import { isValidGitHubUsername } from "@/utils/githubValidation";

interface GitHubUserProfile {
  login: string;
  avatar_url: string | null;
  html_url: string | null;
  name?: string | null;
  public_repos?: number;
}

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

export const useGitHubRepositories = ({
  email,
  enabled,
}: UseGitHubRepositoriesOptions) => {
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [githubUsername, setGithubUsername] = useState<string | null>(() => {
    // Initialize from localStorage to prevent SSR issues
    if (typeof window !== "undefined") {
      return localStorage.getItem("github_username");
    }
    return null;
  });
  const [githubUser, setGithubUser] = useState<GitHubUserProfile | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Note: isValidGitHubUsername is imported from @/utils/githubValidation

  // Check if email is associated with GitHub
  const checkGitHubAssociation = async (
    email: string
  ): Promise<string | null> => {
    try {
      // Try to search for the user by email on GitHub
      // Note: GitHub API doesn't directly support email search,
      // so we'll use a heuristic approach

      // Extract username from email if it's a common pattern
      const username = email.split("@")[0];

      // Validate the extracted username before making API call
      if (!isValidGitHubUsername(username)) {
        logger.debug(
          `Extracted username "${username}" is not a valid GitHub username format`
        );
        return null;
      }

      // Try to fetch user profile (404 is expected and normal)
      const response = await fetch(`https://api.github.com/users/${username}`);

      if (response.ok) {
        const userData = await response.json();
        logger.debug("GitHub account verified:", username);

        // Additional verification: check if the user has public email
        if (
          userData.email &&
          userData.email.toLowerCase() === email.toLowerCase()
        ) {
          return username;
        }

        // Even without direct email match, we found a user with that username
        return username;
      }

      // 404 is expected when username doesn't exist - don't log as error
      if (response.status === 404) {
        logger.debug(
          `No GitHub account found for extracted username: ${username}`
        );
      }

      return null;
    } catch (error) {
      // Only log unexpected errors (not 404s)
      logger.debug("Error checking GitHub association:", error);
      return null;
    }
  };

  // Fetch GitHub user profile with simple localStorage cache (24h TTL)
  const fetchUserProfile = async (username: string) => {
    try {
      const cacheKey = `github_user_profile_${username}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (
            parsed &&
            parsed.data &&
            parsed.cachedAt &&
            Date.now() - parsed.cachedAt < 24 * 60 * 60 * 1000
          ) {
            setGithubUser(parsed.data);
            return;
          }
        } catch {
          // Ignore JSON parse errors, will refetch
        }
      }

      const resp = await fetch(`https://api.github.com/users/${username}`);
      if (resp.ok) {
        const data = await resp.json();
        setGithubUser(data);
        try {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ data, cachedAt: Date.now() })
          );
        } catch {
          // Ignore localStorage errors (quota exceeded, etc.)
        }
      }
    } catch (e) {
      logger.debug("Error fetching GitHub user profile:", e);
    }
  };

  // Manually set GitHub username
  // Returns true if successful, false if validation failed
  const setManualUsername = async (username: string): Promise<boolean> => {
    // Validate username before making API calls
    if (!username || !isValidGitHubUsername(username)) {
      const errorMsg = `Invalid GitHub username format: "${username}". Usernames can only contain letters, numbers, and hyphens.`;
      logger.warn(errorMsg);
      setError(errorMsg);
      return false;
    }

    setGithubUsername(username);
    await Promise.all([
      fetchRepositories(username),
      fetchUserProfile(username),
    ]);
    return true;
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
        // Handle specific HTTP error codes
        if (response.status === 404) {
          throw new Error(`GitHub user "${username}" not found`);
        } else if (response.status === 403) {
          const rateLimitReset = response.headers.get("X-RateLimit-Reset");
          const resetTime = rateLimitReset
            ? new Date(parseInt(rateLimitReset) * 1000).toLocaleTimeString()
            : "later";
          throw new Error(
            `GitHub API rate limit exceeded. Try again at ${resetTime}`
          );
        } else if (response.status >= 500) {
          throw new Error(
            `GitHub API server error (${response.status}). Please try again later`
          );
        } else {
          throw new Error(
            `Failed to fetch repositories: ${response.status} ${response.statusText || "Unknown error"}`
          );
        }
      }

      const repos = await response.json();

      // Validate response is an array
      if (!Array.isArray(repos)) {
        throw new Error("Invalid response from GitHub API");
      }

      setRepositories(repos);

      // Store permission in localStorage
      localStorage.setItem("github_repo_permission", "granted");
      localStorage.setItem("github_username", username);

      logger.debug(`Fetched ${repos.length} repositories for ${username}`);
    } catch (err: unknown) {
      logger.error("Error fetching repositories:", err);

      // Provide more specific error messages
      let errorMessage = "Failed to fetch repositories";

      if (err instanceof TypeError && err.message.includes("fetch")) {
        errorMessage =
          "Network error: Unable to connect to GitHub. Check your internet connection";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setRepositories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeGitHubData = async () => {
      // Prevent double initialization
      if (initialized) return;

      if (!enabled) {
        setInitialized(true);
        return;
      }

      // Check if permission was previously granted
      const previousPermission = localStorage.getItem("github_repo_permission");
      const storedUsername = localStorage.getItem("github_username");

      if (previousPermission === "granted" && storedUsername) {
        // Validate stored username before using it
        if (!isValidGitHubUsername(storedUsername)) {
          logger.warn(
            `Invalid stored GitHub username: "${storedUsername}". Clearing stored data.`
          );
          localStorage.removeItem("github_username");
          localStorage.removeItem("github_repo_permission");
          setInitialized(true);
          return;
        }

        setGithubUsername(storedUsername);
        await Promise.all([
          fetchRepositories(storedUsername),
          fetchUserProfile(storedUsername),
        ]);
        setInitialized(true);
        return;
      }

      // Only check email association if we have an email and no stored username
      if (email && !storedUsername) {
        // Check if email is associated with GitHub
        const username = await checkGitHubAssociation(email);
        if (username) {
          setGithubUsername(username);
          await fetchUserProfile(username);
        }
      }

      setInitialized(true);
    };

    initializeGitHubData();
  }, [email, enabled, initialized]);

  const grantPermission = async () => {
    if (githubUsername) {
      await Promise.all([
        fetchRepositories(githubUsername),
        fetchUserProfile(githubUsername),
      ]);
    }
  };

  const denyPermission = () => {
    localStorage.setItem("github_repo_permission", "denied");
    setGithubUsername(null);
  };

  const revokePermission = () => {
    localStorage.removeItem("github_repo_permission");
    localStorage.removeItem("github_username");
    setRepositories([]);
    setGithubUsername(null);
  };

  // Memoized permission states to avoid SSR issues
  const getPermissionState = () => {
    if (typeof window === "undefined") return { granted: false, denied: false };
    const perm = localStorage.getItem("github_repo_permission");
    return { granted: perm === "granted", denied: perm === "denied" };
  };

  return {
    repositories,
    loading,
    error,
    githubUsername,
    githubUser,
    hasGitHubAccount: !!githubUsername,
    permissionGranted: repositories.length > 0 || getPermissionState().granted,
    permissionDenied: getPermissionState().denied,
    grantPermission,
    denyPermission,
    revokePermission,
    refreshRepositories: () =>
      githubUsername && fetchRepositories(githubUsername),
    setManualUsername,
  };
};
