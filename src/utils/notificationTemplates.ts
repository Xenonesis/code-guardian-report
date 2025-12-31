// Predefined notification templates for common scenarios
export const NotificationTemplates = {
  fileUploadStart: () => ({
    type: 'info' as const,
    title: 'Upload Started',
    description: 'Your file is being uploaded. Please wait...',
  }),

  fileUploadComplete: () => ({
    type: 'success' as const,
    title: 'Upload Complete',
    description: 'File uploaded successfully. Starting analysis...',
  }),

  analysisComplete: (issueCount: number, fileCount: number) => ({
    type: 'success' as const,
    title: 'Analysis Complete',
    description: `Found ${issueCount} issues across ${fileCount} files.`,
  }),

  analysisError: (error: string) => ({
    type: 'error' as const,
    title: 'Analysis Failed',
    description: `Analysis could not be completed: ${error}`,
    action: {
      label: 'Try Again',
      onClick: () => window.location.reload(),
    },
  }),

  fileTooLarge: (maxSize: string) => ({
    type: 'warning' as const,
    title: 'File Too Large',
    description: `Please select a file smaller than ${maxSize}.`,
  }),

  invalidFileType: (allowedTypes: string[]) => ({
    type: 'warning' as const,
    title: 'Invalid File Type',
    description: `Please select a ${allowedTypes.join(' or ')} file.`,
  }),

  networkError: () => ({
    type: 'error' as const,
    title: 'Network Error',
    description: 'Please check your internet connection and try again.',
    action: {
      label: 'Retry',
      onClick: () => window.location.reload(),
    },
  }),

  apiKeyAdded: (provider: string) => ({
    type: 'success' as const,
    title: 'API Key Added',
    description: `${provider} API key has been saved successfully.`,
  }),

  apiKeyRemoved: (provider: string) => ({
    type: 'info' as const,
    title: 'API Key Removed',
    description: `${provider} API key has been removed.`,
  }),

  chatError: () => ({
    type: 'error' as const,
    title: 'Chat Error',
    description: 'Unable to send message. Please check your API configuration.',
  }),

  exportSuccess: (format: string) => ({
    type: 'success' as const,
    title: 'Export Complete',
    description: `Results exported successfully as ${format}.`,
  }),

  exportError: () => ({
    type: 'error' as const,
    title: 'Export Failed',
    description: 'Unable to export results. Please try again.',
  }),

  // Storage-related notifications
  storageError: (operation: string) => ({
    type: 'error' as const,
    title: 'Storage Error',
    description: `Failed to ${operation} analysis data. Your browser storage may be full.`,
    action: {
      label: 'Clear Old Data',
      onClick: () => {
        // This will be handled by the component
      },
    },
  }),

  storageFull: () => ({
    type: 'warning' as const,
    title: 'Storage Almost Full',
    description: 'Your storage is running low. Consider clearing old analysis history.',
  }),

  dataRestored: (fileName: string) => ({
    type: 'success' as const,
    title: 'Analysis Restored',
    description: `Successfully restored analysis for "${fileName}".`,
  }),

  dataCleared: () => ({
    type: 'info' as const,
    title: 'Data Cleared',
    description: 'All stored analysis data has been cleared.',
  }),

  // AI-related notifications
  rateLimitExceeded: (waitTime: number) => ({
    type: 'warning' as const,
    title: 'Rate Limit Reached',
    description: `Too many requests. Please wait ${waitTime} seconds before trying again.`,
  }),

  aiProviderError: (provider: string, error: string) => ({
    type: 'error' as const,
    title: `${provider} Error`,
    description: error,
  }),

  aiKeyMissing: () => ({
    type: 'warning' as const,
    title: 'API Key Required',
    description: 'Please configure an AI API key to use this feature.',
  }),

  // Security notifications
  securityKeyMigrated: () => ({
    type: 'success' as const,
    title: 'Keys Secured',
    description: 'Your API keys have been migrated to encrypted storage.',
  }),

  // GitHub notifications
  githubRateLimited: () => ({
    type: 'warning' as const,
    title: 'GitHub Rate Limited',
    description: 'Too many requests to GitHub. Please try again later.',
  }),

  githubRepoNotFound: (repo: string) => ({
    type: 'error' as const,
    title: 'Repository Not Found',
    description: `Could not find repository "${repo}". Check the URL and try again.`,
  }),

  // Connection notifications
  offlineMode: () => ({
    type: 'info' as const,
    title: 'Offline Mode',
    description: 'You\'re working offline. Some features may be limited.',
  }),

  backOnline: () => ({
    type: 'success' as const,
    title: 'Back Online',
    description: 'Your connection has been restored.',
  }),

  firebaseDisconnected: () => ({
    type: 'warning' as const,
    title: 'Cloud Sync Unavailable',
    description: 'Using local storage only. Your data will sync when connected.',
  }),
};
