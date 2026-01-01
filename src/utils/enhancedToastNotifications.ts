/**
 * Enhanced Toast Notification Utilities
 * Integrates the new notification system with existing toast notifications
 * Provides backward compatibility while adding new features
 */

import {
  NotificationManager,
  notify,
} from "@/services/notifications/NotificationManager";
import type {
  NotificationCategory,
  NotificationPriority,
} from "@/services/notifications/NotificationManager";

/**
 * Enhanced notification functions with priority and category support
 */
export const enhancedNotifications = {
  // Connection issues
  offline: () => {
    notify.warning("You are offline", {
      message: "Some features may be limited until connection is restored.",
      priority: "high",
      category: "network",
    });
  },

  online: () => {
    notify.success("Back online", {
      message: "Connection restored successfully.",
      priority: "normal",
      category: "network",
    });
  },

  firebaseError: () => {
    notify.error("Connection Error", {
      message: "Unable to connect to Firebase. Using local storage only.",
      priority: "high",
      category: "storage",
    });
  },

  firebaseReconnected: () => {
    notify.success("Firebase Connected", {
      message: "Cloud storage is now available.",
      priority: "normal",
      category: "storage",
    });
  },

  // Data operations
  dataLoadError: () => {
    notify.error("Failed to Load Data", {
      message:
        "Unable to fetch your data. Please check your connection and try again.",
      priority: "high",
      category: "storage",
    });
  },

  dataSaved: () => {
    notify.success("Saved Successfully", {
      message: "Your data has been saved.",
      priority: "low",
      category: "storage",
    });
  },

  dataSaveError: () => {
    notify.error("Save Failed", {
      message: "Unable to save your data. Please try again.",
      priority: "high",
      category: "storage",
    });
  },

  // Analysis
  analysisStarted: (filename: string) => {
    notify.info("Analysis Started", {
      message: `Analyzing ${filename}...`,
      priority: "normal",
      category: "analysis",
      metadata: { filename },
    });
  },

  analysisCompleted: (issueCount: number, filename?: string) => {
    notify.success("Analysis Complete", {
      message: `Found ${issueCount} issue${issueCount !== 1 ? "s" : ""}.`,
      priority: issueCount > 10 ? "high" : "normal",
      category: "analysis",
      metadata: { issueCount, filename },
      action:
        issueCount > 0
          ? {
              label: "View Issues",
              onClick: () => {
                // Scroll to results section
                document
                  .getElementById("analysis-results")
                  ?.scrollIntoView({ behavior: "smooth" });
              },
            }
          : undefined,
    });
  },

  analysisError: (error?: string) => {
    notify.error("Analysis Failed", {
      message: error || "An error occurred during analysis. Please try again.",
      priority: "high",
      category: "analysis",
    });
  },

  // Security issues detected
  criticalIssuesFound: (count: number, filename: string) => {
    notify.warning("Critical Security Issues Detected", {
      message: `Found ${count} critical security issue${count !== 1 ? "s" : ""} in ${filename}.`,
      priority: "urgent",
      category: "security",
      metadata: { count, filename },
      action: {
        label: "Review Now",
        onClick: () => {
          document
            .getElementById("security-issues")
            ?.scrollIntoView({ behavior: "smooth" });
        },
      },
    });
  },

  vulnerabilitiesDetected: (count: number, filename: string) => {
    notify.warning("Vulnerabilities Detected", {
      message: `Found ${count} potential vulnerabilit${count !== 1 ? "ies" : "y"} in ${filename}.`,
      priority: "high",
      category: "security",
      metadata: { count, filename },
    });
  },

  // Authentication
  signInSuccess: (username?: string) => {
    notify.success("Signed In", {
      message: username
        ? `Welcome back, ${username}!`
        : "Successfully signed in.",
      priority: "normal",
      category: "auth",
      metadata: { username },
    });
  },

  signOutSuccess: () => {
    notify.info("Signed Out", {
      message: "You have been signed out successfully.",
      priority: "normal",
      category: "auth",
    });
  },

  authError: (message?: string) => {
    notify.error("Authentication Error", {
      message: message || "An error occurred during authentication.",
      priority: "high",
      category: "auth",
    });
  },

  sessionExpired: () => {
    notify.warning("Session Expired", {
      message: "Your session has expired. Please sign in again.",
      priority: "high",
      category: "auth",
      action: {
        label: "Sign In",
        onClick: () => {
          // Trigger sign in modal
          window.dispatchEvent(new CustomEvent("openAuthModal"));
        },
      },
    });
  },

  // File operations
  fileUploadStarted: (filename: string) => {
    notify.info("Uploading File", {
      message: `Uploading ${filename}...`,
      priority: "low",
      category: "general",
      metadata: { filename },
    });
  },

  fileUploadCompleted: (filename: string) => {
    notify.success("Upload Complete", {
      message: `${filename} uploaded successfully.`,
      priority: "normal",
      category: "general",
      metadata: { filename },
    });
  },

  fileUploadError: (filename: string, error?: string) => {
    notify.error("Upload Failed", {
      message: error || `Failed to upload ${filename}.`,
      priority: "high",
      category: "general",
      metadata: { filename },
    });
  },

  fileTooLarge: (size: number, limit: number) => {
    notify.error("File Too Large", {
      message: `File size (${size}MB) exceeds limit of ${limit}MB.`,
      priority: "high",
      category: "general",
      metadata: { size, limit },
    });
  },

  // Export operations
  exportStarted: (format: string) => {
    notify.info("Generating Report", {
      message: `Creating your ${format.toUpperCase()} export...`,
      priority: "low",
      category: "export",
      metadata: { format },
    });
  },

  exportCompleted: (format: string) => {
    notify.success("Export Complete", {
      message: `Your ${format.toUpperCase()} report has been downloaded.`,
      priority: "normal",
      category: "export",
      metadata: { format },
    });
  },

  exportError: (format: string) => {
    notify.error("Export Failed", {
      message: `Unable to generate ${format.toUpperCase()} report. Please try again.`,
      priority: "high",
      category: "export",
      metadata: { format },
    });
  },

  // GitHub integration
  githubReposLoaded: (count: number) => {
    notify.success("Repositories Loaded", {
      message: `Loaded ${count} repositor${count !== 1 ? "ies" : "y"}.`,
      priority: "low",
      category: "storage",
      metadata: { count },
    });
  },

  githubReposError: () => {
    notify.warning("Repositories Unavailable", {
      message: "Unable to load repositories from cloud. Check your connection.",
      priority: "normal",
      category: "network",
    });
  },

  githubAnalysisStarted: (repoName: string) => {
    notify.info("Analyzing Repository", {
      message: `Starting analysis of ${repoName}...`,
      priority: "normal",
      category: "analysis",
      metadata: { repoName },
    });
  },

  githubAnalysisCompleted: (repoName: string, issueCount: number) => {
    notify.success("Repository Analysis Complete", {
      message: `${repoName}: Found ${issueCount} issue${issueCount !== 1 ? "s" : ""}.`,
      priority: issueCount > 20 ? "high" : "normal",
      category: "analysis",
      metadata: { repoName, issueCount },
    });
  },

  // History
  historyLoaded: (count: number) => {
    notify.info("History Loaded", {
      message: `Loaded ${count} past analyse${count !== 1 ? "s" : ""}.`,
      priority: "low",
      category: "storage",
      metadata: { count },
    });
  },

  historyLoadError: () => {
    notify.warning("History Unavailable", {
      message:
        "Unable to load analysis history from cloud. Check your connection.",
      priority: "normal",
      category: "network",
    });
  },

  // System
  updateAvailable: (version: string) => {
    notify.info("Update Available", {
      message: `Version ${version} is available. Refresh to update.`,
      priority: "normal",
      category: "system",
      metadata: { version },
      action: {
        label: "Refresh",
        onClick: () => window.location.reload(),
      },
    });
  },

  maintenanceMode: () => {
    notify.warning("Maintenance Mode", {
      message:
        "The application is in maintenance mode. Some features may be unavailable.",
      priority: "high",
      category: "system",
    });
  },

  performanceWarning: () => {
    notify.warning("Performance Warning", {
      message: "Large file detected. Analysis may take longer than usual.",
      priority: "normal",
      category: "system",
    });
  },

  // Generic messages with smart categorization
  success: (
    title: string,
    options?: {
      message?: string;
      category?: NotificationCategory;
      priority?: NotificationPriority;
      action?: { label: string; onClick: () => void };
    }
  ) => {
    notify.success(title, {
      message: options?.message,
      priority: options?.priority || "normal",
      category: options?.category || "general",
      action: options?.action,
    });
  },

  error: (
    title: string,
    options?: {
      message?: string;
      category?: NotificationCategory;
      priority?: NotificationPriority;
    }
  ) => {
    notify.error(title, {
      message: options?.message,
      priority: options?.priority || "high",
      category: options?.category || "general",
    });
  },

  warning: (
    title: string,
    options?: {
      message?: string;
      category?: NotificationCategory;
      priority?: NotificationPriority;
    }
  ) => {
    notify.warning(title, {
      message: options?.message,
      priority: options?.priority || "normal",
      category: options?.category || "general",
    });
  },

  info: (
    title: string,
    options?: {
      message?: string;
      category?: NotificationCategory;
      priority?: NotificationPriority;
    }
  ) => {
    notify.info(title, {
      message: options?.message,
      priority: options?.priority || "normal",
      category: options?.category || "general",
    });
  },
};

// Batch notification helpers
export const batchNotifications = {
  /**
   * Show multiple analysis results at once
   */
  analysisResults: (
    results: Array<{ filename: string; issueCount: number }>
  ) => {
    if (results.length === 0) return;

    const totalIssues = results.reduce((sum, r) => sum + r.issueCount, 0);
    const criticalFiles = results.filter((r) => r.issueCount > 10).length;

    notify.success("Batch Analysis Complete", {
      message: `Analyzed ${results.length} files. Found ${totalIssues} total issues.`,
      priority: criticalFiles > 0 ? "high" : "normal",
      category: "analysis",
      metadata: { results, totalIssues, criticalFiles },
      action: {
        label: "View Results",
        onClick: () => {
          document
            .getElementById("analysis-results")
            ?.scrollIntoView({ behavior: "smooth" });
        },
      },
    });
  },

  /**
   * Show summary of multiple errors
   */
  errorSummary: (errors: Array<{ filename: string; error: string }>) => {
    if (errors.length === 0) return;

    notify.error("Multiple Errors Occurred", {
      message: `${errors.length} file${errors.length !== 1 ? "s" : ""} failed to process.`,
      priority: "high",
      category: "general",
      metadata: { errors },
      action: {
        label: "View Details",
        onClick: () => {
          window.dispatchEvent(new CustomEvent("openNotificationPanel"));
        },
      },
    });
  },
};

// Export for backward compatibility
export const toastNotifications = enhancedNotifications;

export default {
  ...enhancedNotifications,
  batch: batchNotifications,
  manager: NotificationManager,
};
