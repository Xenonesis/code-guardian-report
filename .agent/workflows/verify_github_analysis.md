---
description: Verify GitHub Analysis Features
---

# GitHub Analysis Verification Workflow

This workflow describes how to verify that the GitHub Analysis features are working correctly.

## Prerequisites

- User must be logged in.
- For GitHub integration features, user should have a GitHub account or use the manual username entry.

## Verification Steps

1. **Dashboard Loading**

   - Navigate to the GitHub Analysis page.
   - Verify that the dashboard loads with "Overview", "Repositories", "History", etc. tabs.
   - Verify that stats cards (Analyzed, Score, Issues) are displayed.

2. **Analyze New Repository (URL)**

   - Go to the "Repositories" tab.
   - Enter a valid public GitHub repository URL (e.g., `https://github.com/facebook/react`).
   - Click "Analyze".
   - **Expected Result**:
     - Analysis progress toasts appear.
     - Analysis completes successfully.
     - The view switches to the "Results" tab showing detailed analysis.
     - The repository appears in the "Repositories" list.
     - The analysis appears in the "History" tab.

3. **Re-analyze Repository**

   - Go to the "Repositories" tab.
   - Find a previously analyzed repository.
   - Click "Re-Analyze".
   - **Expected Result**:
     - Analysis runs again.
     - Results are updated.
     - A new entry appears in the "History" tab.

4. **GitHub Integration (Google Users)**

   - If logged in with Google, verify the "Connect GitHub" or "Enter Username" prompt appears.
   - Enter a valid GitHub username.
   - **Expected Result**:
     - A list of public repositories for that user is displayed.
     - Clicking "Analyze" on a list item triggers the analysis flow.

5. **History View**

   - Go to the "History" tab.
   - Verify a timeline or list of past analyses is shown.
   - Click "View Report" on an item.
   - **Expected Result**: A summary modal appears with key metrics.

6. **Data Persistence**
   - Reload the page.
   - **Expected Result**:
     - Dashboard stats persist.
     - Repository list persists.
     - History persists.
