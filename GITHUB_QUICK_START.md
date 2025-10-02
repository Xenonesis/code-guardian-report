# 🚀 Quick Start Guide: GitHub Repository Analysis

## Step-by-Step Tutorial

### Step 1: Access the Upload Page
Navigate to the home page and you'll see two tabs at the top:
- **Upload ZIP File** (traditional method)
- **GitHub Repository** (new feature!)

### Step 2: Enter GitHub URL
Click on the "GitHub Repository" tab and you'll see:
- An input field with a GitHub icon
- Placeholder text: `https://github.com/owner/repository`
- "Analyze Repository" button

### Step 3: Paste Repository URL
Enter any public GitHub repository URL. Examples:

```
https://github.com/facebook/react
https://github.com/microsoft/vscode
https://github.com/yourusername/your-project
```

### Step 4: Repository Validation
Once you enter a valid URL, the system will:
- ✅ Validate the repository exists
- 📊 Show repository information:
  - Repository name and description
  - Primary programming language
  - Number of code files
  - Estimated size
- ✨ Display a success indicator with repo details

### Step 5: Start Analysis
Click the "Analyze Repository" button. You'll see:
- Progress bar showing download progress
- Status messages:
  - "Fetching repository information..." (10%)
  - "Loading repository structure..." (20%)
  - "Found X code files. Downloading..." (30%)
  - "Downloaded X/Y files..." (30-90%)
  - "Creating zip file..." (90%)
  - "Repository ready for analysis!" (100%)

### Step 6: View Results
After the repository is downloaded and packaged:
- The analysis begins automatically
- Results are displayed in the same comprehensive format as uploaded files
- You can view:
  - Security vulnerabilities
  - Code quality issues
  - AI-powered insights
  - Fix suggestions
  - And much more!

## 🎯 Supported URL Formats

### Basic Repository URL
```
https://github.com/owner/repo
```
Analyzes the default branch (usually `main` or `master`)

### Specific Branch
```
https://github.com/owner/repo/tree/branch-name
```
Analyzes the specified branch

### With .git Extension
```
https://github.com/owner/repo.git
```
Also supported - the .git extension is automatically removed

## 💡 Tips & Best Practices

### For Best Results
1. **Start Small**: Try analyzing smaller repositories first to understand the feature
2. **Check Repository Size**: The feature shows estimated size before downloading
3. **Use Specific Branches**: If you want to analyze a specific branch, include it in the URL
4. **Be Patient**: Large repositories may take longer to download

### What Gets Analyzed
✅ **Included Files**:
- Source code files (.js, .ts, .py, .java, .c, .cpp, etc.)
- Configuration files (.json, .yaml, .xml)
- Style files (.css, .scss)
- Scripts (.sh, .bash, .ps1)

❌ **Excluded Directories**:
- `node_modules/`
- `.git/`
- `dist/`, `build/`
- `coverage/`
- `vendor/`
- `__pycache__/`
- And other common build/dependency folders

## 🔍 Example Repositories to Try

### Small Projects (Quick Analysis)
```
https://github.com/expressjs/express
https://github.com/lodash/lodash
```

### Medium Projects
```
https://github.com/vuejs/vue
https://github.com/angular/angular
```

### Large Projects (Takes Longer)
```
https://github.com/facebook/react
https://github.com/microsoft/vscode
```

## ❓ Troubleshooting

### "Repository not found or not accessible"
**Cause**: The repository doesn't exist, is private, or URL is incorrect  
**Solution**: 
- Double-check the URL spelling
- Ensure the repository is public
- Try accessing it in your browser first

### "No code files found in repository"
**Cause**: Repository contains only documentation or non-code files  
**Solution**: 
- Verify the repository contains actual source code
- Try analyzing a different branch
- Check if the repository has any code in subdirectories

### "Rate limit exceeded"
**Cause**: Too many requests to GitHub API (60 per hour for unauthenticated)  
**Solution**: 
- Wait for an hour before trying again
- Try again later during off-peak hours

### Download Taking Too Long
**Cause**: Large repository with many files  
**Solution**: 
- Be patient - the progress bar shows current status
- Try analyzing a smaller repository first
- Check your internet connection

## 🎨 Visual Guide

### Upload Form Interface
```
┌─────────────────────────────────────────────────┐
│              🛡️ Analyze Your Code               │
│  Upload a .zip file or analyze from GitHub     │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────────┬─────────────────────┐   │
│  │  📁 Upload ZIP   │  🔗 GitHub Repo ✓  │   │
│  └──────────────────┴─────────────────────┘   │
│                                                 │
│  ┌──────────────────────────────────────────┐ │
│  │ 🔗 https://github.com/owner/repo        │ │
│  └──────────────────────────────────────────┘ │
│                                                 │
│  ┌────────────────────────────────┐            │
│  │  📥 Analyze Repository          │            │
│  └────────────────────────────────┘            │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Repository Information Display
```
┌─────────────────────────────────────────────────┐
│  ✅ facebook/react                               │
│  A declarative, efficient, and flexible         │
│  JavaScript library for building user interfaces│
│                                                 │
│  🔵 JavaScript • 1,234 code files • 45.2 MB    │
└─────────────────────────────────────────────────┘
```

### Progress Tracking
```
┌─────────────────────────────────────────────────┐
│  Downloaded 856/1234 files...            69%   │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░               │
└─────────────────────────────────────────────────┘
```

## 🔒 Privacy & Security

### Your Data is Safe
- ✅ Uses official GitHub API
- ✅ No authentication required for public repos
- ✅ Code processed locally in your browser
- ✅ No external server storage
- ✅ Same security as file upload method

### What We Access
- Only public repository data via GitHub API
- Only code files (filtered automatically)
- No personal information
- No repository secrets or credentials

## 📚 Additional Resources

- [Full Feature Documentation](./GITHUB_ANALYSIS_FEATURE.md)
- [Main README](./README.md)
- [Privacy Policy](https://code-guardian-report.vercel.app/privacy)
- [Terms of Service](https://code-guardian-report.vercel.app/terms)

## 🆘 Need Help?

- 💬 Use the AI ChatBot on the website
- 🐛 [Report Issues](https://github.com/Xenonesis/code-guardian-report/issues)
- ✨ [Request Features](https://github.com/Xenonesis/code-guardian-report/issues)

---

**Happy Analyzing! 🚀**

*Last Updated: October 2, 2025*
