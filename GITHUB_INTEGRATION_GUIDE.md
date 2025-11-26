# GitHub Integration Guide

## Overview

This feature automatically detects when a user signs in with Google and their email is associated with a GitHub account. It then requests permission to display their GitHub repositories and allows them to analyze them directly from the dashboard.

## Implementation Details

### Components Created

1. **GitHubRepositoryPermissionModal** (`src/components/github/GitHubRepositoryPermissionModal.tsx`)
   - Modal dialog that asks user for permission to access their GitHub repositories
   - Shows what data will be accessed
   - Provides "Allow" and "Not Now" options
   - Clean, modern UI with gradients and icons

2. **GitHubRepositoryList** (`src/components/github/GitHubRepositoryList.tsx`)
   - Displays list of user's GitHub repositories
   - Shows repository metadata (stars, forks, language, last updated)
   - Provides "Analyze" button for each repository
   - Handles loading and empty states

3. **useGitHubRepositories Hook** (`src/hooks/useGitHubRepositories.ts`)
   - Custom React hook for managing GitHub repository data
   - Checks if email is associated with GitHub account
   - Fetches repositories from GitHub API
   - Manages permission state in localStorage
   - Provides methods: `grantPermission`, `denyPermission`, `revokePermission`

### User Flow

1. **User Signs In with Google**
   - User authenticates with their Google account
   - The system stores their email in the user profile

2. **GitHub Detection**
   - The `useGitHubRepositories` hook automatically checks if the email is associated with a GitHub account
   - It attempts to find a GitHub user with a username matching the email prefix
   - If found, sets `hasGitHubAccount` to true

3. **Permission Request**
   - After 2 seconds (to avoid overwhelming the user), a modal appears
   - The modal explains what data will be accessed
   - User can choose to "Allow Access" or "Not Now"

4. **Permission Granted**
   - If user allows, the hook fetches repositories from GitHub API
   - Repositories are displayed in a collapsible section on the dashboard
   - Permission state is stored in localStorage

5. **Repository Display**
   - Shows all public repositories with metadata
   - Each repository has an "Analyze" button
   - User can hide/show the repository list

6. **Permission Denied**
   - If user denies, the modal closes
   - A toast notification informs user they can enable it later
   - Permission state is stored to prevent repeated prompts

### Integration Points

**UserDashboard.tsx** - Main integration point:
```tsx
// GitHub repositories integration
const {
  repositories,
  loading: reposLoading,
  hasGitHubAccount,
  permissionGranted,
  permissionDenied,
  grantPermission,
  denyPermission,
} = useGitHubRepositories({
  email: userProfile?.email || null,
  enabled: !userProfile?.isGitHubUser // Only for Google sign-in users
});
```

### API Usage

The implementation uses the **GitHub Public API** (no authentication required for public data):

- **User Profile**: `GET https://api.github.com/users/{username}`
- **User Repositories**: `GET https://api.github.com/users/{username}/repos?per_page=100&sort=updated`

### Local Storage Keys

- `github_repo_permission`: Stores permission state ('granted' or 'denied')
- `github_username`: Stores the detected GitHub username

### Features

✅ Automatic GitHub account detection  
✅ Permission-based access  
✅ Persistent permission state  
✅ Repository listing with metadata  
✅ Individual repository analysis  
✅ Show/hide toggle for repositories  
✅ Loading and error states  
✅ Toast notifications for user feedback  
✅ Only shows for Google sign-in users (not GitHub sign-in)  

### Future Enhancements

The current implementation has a placeholder for the analyze functionality:

```tsx
const handleAnalyzeRepository = async (repoUrl: string, repoName: string) => {
  toast.info(`Analysis for ${repoName} will be implemented soon!`);
  // TODO: Integrate with the existing analysis flow
  // This could navigate to the analysis page with the repo URL pre-filled
};
```

**Recommended Next Steps:**
1. Integrate with `githubRepositoryService` to download and analyze repositories
2. Navigate to the main analysis page with the repo URL pre-filled
3. Show analysis progress in the dashboard
4. Store analysis results in Firestore for history tracking
5. Add OAuth flow for accessing private repositories

### Configuration

No additional configuration needed. The feature works out of the box with:
- Google Sign-In enabled
- GitHub Public API access (no token required)
- Toast notifications (Sonner)

### Privacy & Security

- Only accesses **public** repositories
- Requires explicit user permission
- Permission can be revoked at any time
- No GitHub OAuth tokens are stored
- No sensitive data is transmitted
- All API calls are client-side

### Testing

To test the feature:

1. Sign in with a Google account whose email matches a GitHub username
   - Example: If your GitHub username is "johndoe", use "johndoe@gmail.com"
   
2. Wait 2 seconds after login

3. A modal should appear asking for permission

4. Click "Allow Access" to see your repositories

5. Toggle the repository list visibility

6. Click "Analyze" on any repository (currently shows a toast notification)

### Limitations

- Only detects GitHub accounts where the username matches the email prefix
- Cannot access private repositories (would require OAuth)
- Rate limited by GitHub API (60 requests/hour for unauthenticated requests)
- Only works for Google sign-in users (not GitHub or email/password)

### Error Handling

- Network errors are caught and logged
- Failed repository fetches show error state
- Toast notifications inform users of issues
- Gracefully degrades if GitHub API is unavailable

## Code Structure

```
src/
├── components/
│   └── github/
│       ├── GitHubRepositoryPermissionModal.tsx  # Permission modal
│       └── GitHubRepositoryList.tsx              # Repository list
├── hooks/
│   └── useGitHubRepositories.ts                  # GitHub data hook
└── components/auth/
    └── UserDashboard.tsx                         # Integration point
```

## Summary

This implementation provides a seamless way for users who sign in with Google to discover and analyze their GitHub repositories. The permission-based approach respects user privacy while offering a convenient feature for developers who want to quickly analyze their code for security vulnerabilities.
