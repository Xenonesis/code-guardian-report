#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Git hook script content
const postCommitHook = `#!/bin/sh
# Auto-update contributors after commit

echo "🔄 Checking if contributors need updating..."

# Only run on main/master branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ] && [ "$BRANCH" != "master" ]; then
  echo "ℹ️  Not on main/master branch, skipping contributor update"
  exit 0
fi

# Check if this is not already a contributor update commit
LAST_COMMIT_MSG=$(git log -1 --pretty=%B)
if echo "$LAST_COMMIT_MSG" | grep -q "Auto-update contributors"; then
  echo "ℹ️  Last commit was already a contributor update, skipping"
  exit 0
fi

# Run the contributor update script
echo "📊 Updating contributors..."
npm run update-contributors --silent

# Check if there are changes to commit
if [ -n "$(git status --porcelain README.md)" ]; then
  echo "✅ Contributors updated, committing changes..."
  git add README.md
  git commit -m "🤖 Auto-update contributors in README.md

- Updated after recent commits
- Refreshed repository statistics
- Updated contribution counts

[skip ci]" --no-verify
  echo "🎉 Contributors section updated successfully!"
else
  echo "ℹ️  No contributor changes detected"
fi
`;

const preCommitHook = `#!/bin/sh
# Check if contributor update is needed before commit

echo "🔍 Pre-commit: Checking contributor status..."

# Skip if this is a contributor update commit
if git diff --cached --name-only | grep -q "README.md"; then
  STAGED_CONTENT=$(git diff --cached README.md)
  if echo "$STAGED_CONTENT" | grep -q "Community & Contributors"; then
    echo "ℹ️  README.md contributors section is being updated, skipping check"
    exit 0
  fi
fi

echo "✅ Pre-commit checks passed"
`;

function setupGitHooks() {
  try {
    console.log('🔧 Setting up Git hooks for automatic contributor updates...');
    
    const gitHooksDir = path.join(process.cwd(), '.git', 'hooks');
    
    // Check if .git directory exists
    if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
      console.error('❌ Error: Not in a Git repository. Please run this from the project root.');
      process.exit(1);
    }
    
    // Create hooks directory if it doesn't exist
    if (!fs.existsSync(gitHooksDir)) {
      fs.mkdirSync(gitHooksDir, { recursive: true });
    }
    
    // Write post-commit hook
    const postCommitPath = path.join(gitHooksDir, 'post-commit');
    fs.writeFileSync(postCommitPath, postCommitHook, { mode: 0o755 });
    console.log('✅ Created post-commit hook');
    
    // Write pre-commit hook
    const preCommitPath = path.join(gitHooksDir, 'pre-commit');
    fs.writeFileSync(preCommitPath, preCommitHook, { mode: 0o755 });
    console.log('✅ Created pre-commit hook');
    
    console.log('');
    console.log('🎉 Git hooks setup complete!');
    console.log('');
    console.log('📋 What happens now:');
    console.log('  • After each commit to main/master, contributors will be auto-updated');
    console.log('  • Pre-commit checks will ensure everything is in order');
    console.log('  • Changes will be committed automatically with [skip ci] to avoid CI loops');
    console.log('');
    console.log('🔧 To disable hooks temporarily:');
    console.log('  git commit --no-verify');
    console.log('');
    console.log('🗑️  To remove hooks:');
    console.log('  rm .git/hooks/post-commit .git/hooks/pre-commit');
    
  } catch (error) {
    console.error('❌ Error setting up Git hooks:', error.message);
    process.exit(1);
  }
}

// Run the setup
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  setupGitHooks();
} else {
  setupGitHooks();
}

export { setupGitHooks };