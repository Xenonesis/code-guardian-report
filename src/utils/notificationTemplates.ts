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
};
