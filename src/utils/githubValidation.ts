/**
 * GitHub username validation utilities
 * Centralized validation logic for consistent username format checking
 */

/**
 * GitHub username validation rules:
 * - Can only contain alphanumeric characters and hyphens
 * - Cannot start or end with a hyphen
 * - Cannot have consecutive hyphens
 * - Must be 1-39 characters long
 */
const GITHUB_USERNAME_REGEX =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

/**
 * Validates if a string is a valid GitHub username format
 * @param username - The username to validate
 * @returns true if valid, false otherwise
 */
export const isValidGitHubUsername = (username: string): boolean => {
  if (!username || typeof username !== "string") {
    return false;
  }
  return GITHUB_USERNAME_REGEX.test(username);
};

/**
 * Sanitizes and validates a GitHub username
 * @param username - The username to sanitize
 * @returns The trimmed username if valid, null otherwise
 */
export const sanitizeGitHubUsername = (
  username: string | null | undefined
): string | null => {
  if (!username || typeof username !== "string") {
    return null;
  }

  const trimmed = username.trim();
  if (!trimmed || !isValidGitHubUsername(trimmed)) {
    return null;
  }

  return trimmed;
};

/**
 * Returns user-friendly error message for invalid GitHub username
 * @param username - The invalid username
 * @returns Error message string
 */
export const getGitHubUsernameError = (username: string): string => {
  if (!username || !username.trim()) {
    return "Please enter a GitHub username";
  }

  if (username.length > 39) {
    return "GitHub usernames must be 39 characters or fewer";
  }

  if (username.startsWith("-") || username.endsWith("-")) {
    return "GitHub usernames cannot start or end with a hyphen";
  }

  if (username.includes("--")) {
    return "GitHub usernames cannot have consecutive hyphens";
  }

  if (!/^[a-zA-Z0-9-]+$/.test(username)) {
    return "GitHub usernames can only contain letters, numbers, and hyphens";
  }

  if (!/^[a-zA-Z0-9]/.test(username)) {
    return "GitHub usernames must start with a letter or number";
  }

  return "Invalid GitHub username format";
};
