# 🤖 Automatic Contributors Update System

This document explains how the automatic contributor updates work in Code Guardian, ensuring that the README.md always shows real, up-to-date contributor information.

## 🎯 Overview

The system automatically updates the contributors section in README.md whenever:
- New commits are pushed to main/master
- Pull requests are merged
- Daily at 2 AM UTC (scheduled)
- Manually triggered

## 🔧 Components

### 1. Update Script (`scripts/update-contributors.js`)
- Fetches real contributors from GitHub API
- Gets repository statistics (stars, forks, watchers)
- Generates updated README.md contributors section
- Handles rate limiting and authentication

### 2. GitHub Actions Workflows

#### Main Workflow (`.github/workflows/update-contributors.yml`)
- **Triggers**: Push to main/master, scheduled daily, manual trigger
- **Actions**: Updates contributors and commits changes
- **Features**: Smart change detection, proper commit messages

#### PR Merge Workflow (`.github/workflows/contributors-on-pr.yml`)
- **Triggers**: When pull requests are merged
- **Actions**: Updates contributors and thanks the contributor
- **Features**: Automatic PR comments welcoming new contributors

### 3. Git Hooks (`scripts/setup-git-hooks.js`)
- **Local development**: Updates contributors after each commit
- **Smart detection**: Avoids infinite loops and unnecessary updates
- **Branch awareness**: Only runs on main/master branches

## 🚀 Setup Instructions

### For Repository Maintainers

1. **Enable GitHub Actions** (already set up):
   ```bash
   # The workflows are already in place and will run automatically
   ```

2. **Set up local Git hooks** (optional, for development):
   ```bash
   npm run setup-git-hooks
   ```

3. **Manual update** (when needed):
   ```bash
   npm run update-contributors
   ```

### For Contributors

No setup required! The system automatically:
- Detects your contributions
- Adds you to the contributors section
- Updates your contribution count
- Links to your GitHub profile

## 📊 What Gets Updated

### Repository Statistics
- ⭐ Star count
- 🍴 Fork count
- 👥 Contributor count
- 👀 Watcher count

### Contributor Information
- Real GitHub avatars
- Actual usernames and display names
- Accurate contribution counts
- Direct links to GitHub profiles
- Proper ranking based on contributions

### Contributor Roles
- 🚀 **Creator**: Project founder (most contributions)
- ⭐ **Core**: 100+ contributions
- 💎 **Senior**: 50+ contributions
- 🔥 **Active**: 20+ contributions
- ✨ **Regular**: 10+ contributions
- 👤 **Contributor**: Any contributions

## 🔄 Update Triggers

### Automatic Triggers
1. **Push to main/master**: Updates within minutes
2. **PR merge**: Immediate update with welcome message
3. **Daily schedule**: 2 AM UTC cleanup run
4. **New contributors**: Detected and added automatically

### Manual Triggers
1. **GitHub Actions**: Use "Run workflow" button
2. **Local command**: `npm run update-contributors`
3. **Git hooks**: Automatic after local commits

## 🛡️ Safety Features

### Prevents Issues
- **Rate limiting**: Uses GitHub tokens for higher limits
- **Change detection**: Only commits when changes exist
- **Loop prevention**: Avoids infinite update cycles
- **Branch protection**: Only runs on main branches

### Error Handling
- **API failures**: Graceful fallbacks
- **Network issues**: Retry mechanisms
- **Invalid data**: Validation and filtering

## 📝 Commit Messages

The system uses descriptive commit messages:

```
🤖 Auto-update contributors in README.md

- Updated contributor list with latest GitHub data
- Refreshed repository statistics
- Updated contribution counts

This is an automated update triggered by recent changes to the repository.
```

For PR merges:
```
🎉 Update contributors after PR #123 merge

- Added @username to contributors
- Updated repository statistics
- Refreshed contribution counts

Thanks to @username for contributing to Code Guardian!
```

## 🎉 Welcome Messages

New contributors automatically receive a welcome comment on their merged PR:

> 🎉 **Thank you for your contribution!**
> 
> Your contribution has been automatically added to our contributors section in the README.md.
> 
> Welcome to the Code Guardian community! 🚀

## 🔧 Configuration

### Environment Variables
- `GITHUB_TOKEN`: For API authentication (automatically provided in Actions)

### Customization
- Edit `scripts/update-contributors.js` to modify the update logic
- Modify workflows in `.github/workflows/` to change triggers
- Adjust `scripts/setup-git-hooks.js` for local hook behavior

## 📈 Benefits

### For Maintainers
- ✅ Always accurate contributor information
- ✅ No manual maintenance required
- ✅ Professional appearance
- ✅ Automatic recognition system

### For Contributors
- ✅ Immediate recognition
- ✅ Accurate contribution tracking
- ✅ Professional profile display
- ✅ Community welcome

## 🐛 Troubleshooting

### Common Issues

1. **Contributors not updating**:
   ```bash
   # Check if workflows are enabled
   # Verify GitHub token permissions
   # Run manual update: npm run update-contributors
   ```

2. **Local hooks not working**:
   ```bash
   # Re-run setup
   npm run setup-git-hooks
   
   # Check hook permissions
   ls -la .git/hooks/
   ```

3. **API rate limits**:
   ```bash
   # The system uses GitHub tokens to avoid limits
   # For local development, set GITHUB_TOKEN environment variable
   ```

### Debug Mode
```bash
# Run with debug output
DEBUG=1 npm run update-contributors
```

## 🔮 Future Enhancements

- [ ] Contributor activity heatmaps
- [ ] Contribution type breakdown (code, docs, issues)
- [ ] Monthly contributor highlights
- [ ] Integration with GitHub Sponsors
- [ ] Multi-language contributor bios

## 📞 Support

If you encounter issues with the contributor update system:

1. Check the [GitHub Actions logs](../../actions)
2. Review this documentation
3. Open an issue with the `automation` label
4. Contact the maintainers

---

*This system ensures that Code Guardian always gives proper credit to its amazing contributors! 🌟*