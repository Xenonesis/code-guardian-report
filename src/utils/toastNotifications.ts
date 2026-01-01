/**
 * Toast Notification Utilities
 * Provides a centralized way to show notifications throughout the app
 */

import { toast } from "sonner";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Show a toast notification
 */
export function showToast(
  type: ToastType,
  title: string,
  description?: string,
  duration?: number
) {
  const options: any = {
    description,
    duration: duration || 4000,
  };

  switch (type) {
    case "success":
      toast.success(title, options);
      break;
    case "error":
      toast.error(title, options);
      break;
    case "warning":
      toast.warning(title, options);
      break;
    case "info":
    default:
      toast.info(title, options);
      break;
  }
}

/**
 * Specific toast notifications for common scenarios
 */
export const toastNotifications = {
  // Connection issues
  offline: () => {
    showToast(
      "warning",
      "You are offline",
      "Some features may be limited until connection is restored.",
      6000
    );
  },

  online: () => {
    showToast(
      "success",
      "Back online",
      "Connection restored successfully.",
      3000
    );
  },

  firebaseError: () => {
    showToast(
      "error",
      "Connection Error",
      "Unable to connect to Firebase. Using local storage only.",
      6000
    );
  },

  firebaseReconnected: () => {
    showToast(
      "success",
      "Firebase Connected",
      "Cloud storage is now available.",
      3000
    );
  },

  // Data operations
  dataLoadError: () => {
    showToast(
      "error",
      "Failed to Load Data",
      "Unable to fetch your data. Please check your connection and try again.",
      5000
    );
  },

  dataSaved: () => {
    showToast(
      "success",
      "Saved Successfully",
      "Your data has been saved.",
      3000
    );
  },

  dataSaveError: () => {
    showToast(
      "error",
      "Save Failed",
      "Unable to save your data. Please try again.",
      5000
    );
  },

  // Analysis
  analysisStarted: (filename: string) => {
    showToast("info", "Analysis Started", `Analyzing ${filename}...`, 3000);
  },

  analysisCompleted: (issueCount: number) => {
    showToast(
      "success",
      "Analysis Complete",
      `Found ${issueCount} issue${issueCount !== 1 ? "s" : ""}.`,
      4000
    );
  },

  analysisError: () => {
    showToast(
      "error",
      "Analysis Failed",
      "An error occurred during analysis. Please try again.",
      5000
    );
  },

  // Authentication
  signInSuccess: (username?: string) => {
    showToast(
      "success",
      "Signed In",
      username ? `Welcome back, ${username}!` : "Successfully signed in.",
      3000
    );
  },

  signOutSuccess: () => {
    showToast(
      "info",
      "Signed Out",
      "You have been signed out successfully.",
      3000
    );
  },

  authError: (message?: string) => {
    showToast(
      "error",
      "Authentication Error",
      message || "An error occurred during authentication.",
      5000
    );
  },

  // Mock data warning (development only)
  mockDataWarning: () => {
    if (process.env.NODE_ENV === "development") {
      showToast(
        "warning",
        "Using Sample Data",
        "Firebase unavailable. Displaying sample data for testing.",
        6000
      );
    }
  },

  // Generic messages
  success: (message: string) => {
    showToast("success", message, undefined, 3000);
  },

  error: (message: string) => {
    showToast("error", message, undefined, 4000);
  },

  warning: (message: string) => {
    showToast("warning", message, undefined, 4000);
  },

  info: (message: string) => {
    showToast("info", message, undefined, 3000);
  },
};

/**
 * Setup global toast function for use in services
 */
export function setupGlobalToast() {
  if (typeof window !== "undefined") {
    // Make showToast available globally for services
    (window as any).showToast = showToast;
    (window as any).toastNotifications = toastNotifications;
  }
}

/**
 * Toast notifications for specific service errors
 */
export const serviceToasts = {
  githubRepositories: {
    loadError: () => {
      showToast(
        "warning",
        "Repositories Unavailable",
        "Unable to load repositories from cloud. Check your connection.",
        5000
      );
    },
    loaded: (count: number) => {
      showToast(
        "success",
        "Repositories Loaded",
        `Loaded ${count} repositor${count !== 1 ? "ies" : "y"}.`,
        3000
      );
    },
  },

  analysisHistory: {
    loadError: () => {
      showToast(
        "warning",
        "History Unavailable",
        "Unable to load analysis history from cloud. Check your connection.",
        5000
      );
    },
    loaded: (count: number) => {
      showToast(
        "info",
        "History Loaded",
        `Loaded ${count} past analyse${count !== 1 ? "s" : ""}.`,
        3000
      );
    },
  },

  fileUpload: {
    started: (filename: string) => {
      showToast("info", "Uploading File", `Uploading ${filename}...`, 3000);
    },
    completed: (filename: string) => {
      showToast(
        "success",
        "Upload Complete",
        `${filename} uploaded successfully.`,
        3000
      );
    },
    error: (filename: string) => {
      showToast(
        "error",
        "Upload Failed",
        `Failed to upload ${filename}.`,
        5000
      );
    },
    tooLarge: (size: number, limit: number) => {
      showToast(
        "error",
        "File Too Large",
        `File size (${size}MB) exceeds limit of ${limit}MB.`,
        5000
      );
    },
  },

  export: {
    started: () => {
      showToast(
        "info",
        "Generating Report",
        "Creating your export file...",
        3000
      );
    },
    completed: () => {
      showToast(
        "success",
        "Export Complete",
        "Your report has been downloaded.",
        3000
      );
    },
    error: () => {
      showToast(
        "error",
        "Export Failed",
        "Unable to generate report. Please try again.",
        5000
      );
    },
  },
};

// Export a combined object for easy import
export default {
  show: showToast,
  notifications: toastNotifications,
  services: serviceToasts,
  setup: setupGlobalToast,
};
