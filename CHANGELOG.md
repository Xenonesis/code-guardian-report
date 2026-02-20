# Changelog

All notable changes to Code Guardian Report will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [14.7.0] - 2026-02-18

### Added

- **Changelog Page Overhaul**:
  - New static commits data file (`commitsData.ts`) with full commit history
  - Paginated commits view with "Show More" functionality (20 commits per page)
  - Hardcoded releases data derived from CHANGELOG.md for offline reliability
  - Simple Markdown parser component for rendering release notes in-browser

- **GitHub Analysis Dashboard Enhancements**:
  - Redesigned `GitHubProfileHeader` with responsive stats cards (Analyzed repos, Score, Issues)
  - Skeleton loading states for profile name and username while data loads
  - Improved responsive layout for mobile and desktop views

- **Repository Activity Analytics**:
  - New skeleton loading UI for activity stats cards
  - Empty state UI when no analyses have been performed yet
  - Language distribution bar chart with gradient color coding
  - Activity stats: Total Analyses, Avg. Analysis Time, Most Analyzed Repo, Most Common Language

- **Security Analytics Section**:
  - Skeleton loading states for all stats cards and trend chart
  - Empty state UI with call-to-action for first repository analysis
  - Security score trend chart with color-coded performance bars (green/yellow/red)
  - Stats: Average Security Score, Total Issues, Critical Issues, Analyses Completed

- **Analysis History Section**:
  - Full-featured analysis history with Timeline and List view modes
  - Search bar for filtering analysis history by repository name
  - Detailed analysis report modal with security score, stats grid, and executive summary
  - Score badges (Excellent / Good / Poor) with color-coded indicators
  - Skeleton loading states for history list items

- **UI Components**:
  - Enhanced `Skeleton` component with variant support (`default`, `card`, `text`, `avatar`, `chart`, `button`)
  - Configurable `rounded`, `width`, `height`, and `animate` props on Skeleton
  - New `skeleton-index.ts` barrel export for skeleton components

- **Home Page (Index)**:
  - Lazy-loaded `FloatingChatBot`, `StorageStatus`, and `AnalysisHistoryModal` with Suspense
  - Skeleton fallback for `StorageStatus` lazy load

- **Page Wrappers**:
  - `GitHubAnalysisPageWrapper` updated with `loading: () => null` for cleaner SSR transitions
  - `PWASettingsPageWrapper` simplified dynamic import

### Changed

- Improved GitHub dashboard layout with better responsive grid breakpoints (`sm:grid-cols-3`, `lg:min-w-[500px]`)
- Analysis history deduplication logic based on `fileName` and `fileHash`
- History page filter bar now shows active filter count and reset button
- Changelog page now uses static data instead of live GitHub API calls for better performance

### Fixed

- Fixed skeleton shimmer animation not applying correctly in dark mode
- Fixed analysis history not deduplicating entries with same file hash
- Fixed GitHub profile header layout overflow on small screens
- Fixed PWA settings page wrapper missing loading state

### Performance

- Reduced changelog page load time by switching to static commit/release data
- Lazy loading of heavy components (ChatBot, StorageStatus, HistoryModal) reduces initial bundle size
- Skeleton loading states improve perceived performance across GitHub dashboard

## [13.0.0] - 2026-02-11

### Added

- Project cleanup and documentation improvements
- New markdown documentation files:
  - CHANGELOG.md - Version history tracking
  - ARCHITECTURE.md - System architecture documentation
  - API.md - API reference documentation
  - TROUBLESHOOTING.md - Common issues and solutions
  - ROADMAP.md - Project roadmap and future plans

### Changed

- Improved project documentation structure
- Enhanced developer experience with comprehensive guides

### Removed

- Removed temporary build log files (build_log.txt, build_log_2.txt, build_log_3.txt)
- Removed temporary directories (.qodo/, .zencoder/, .zenflow/)

### Fixed

- N/A

## [12.0.0] - 2026-01-31

### Added

- **Code Quality Improvements**:
  - Stricter TypeScript configuration with `noUnusedLocals` and `noUnusedParameters`
  - Zero ESLint errors across the entire codebase
  - Enhanced code standards with stricter linting rules

- **Testing Infrastructure**:
  - Unified test framework using Vitest
  - Migrated legacy tests to Vitest
  - Debug mode support with `DEBUG_TESTS=true` environment variable
  - 92 passing tests with improved reliability

- **Build & Configuration**:
  - Successful production build with all TypeScript errors resolved
  - Optimized linting with markdown file exclusions
  - Enhanced CI/CD pipeline with all pre-push checks passing

### Changed

- Improved error handling with better catch block management
- Cleaner imports and code organization
- Enhanced maintainability with intentional parameter naming conventions

### Removed

- 412 lines of unused code
- Duplicate Jest configuration files
- Unused dependencies and type definitions

### Fixed

- Fixed 181 ESLint errors related to unused variables and imports
- Resolved TypeScript compilation errors in production builds
- Fixed unused catch block error parameters
- Corrected unused React imports in functional components

### Performance

- Reduced bundle size through code cleanup
- Faster build times with optimized imports
- Improved type checking speed

## [11.0.0] - 2025-01-31

### Added

- **Major Features**:
  - Complete rewrite with Next.js 16 App Router
  - Enhanced multi-language support (15+ programming languages)
  - AI-powered security insights and fix suggestions
  - Progressive Web App (PWA) capabilities
  - GitHub repository integration with OAuth authentication
  - Advanced analytics dashboard with real-time metrics
  - Custom rules engine for organization-specific patterns
  - Multiple export formats (PDF, JSON, SARIF, CSV)

- **Security Analysis**:
  - Complete OWASP Top 10 coverage
  - CWE mapping for all vulnerabilities
  - Secret detection for 50+ credential types
  - Dependency vulnerability scanning
  - Framework-specific security checks

- **User Experience**:
  - Real-time analysis with progress tracking
  - Interactive charts and visualizations
  - Dark/light theme support
  - Responsive design for mobile and desktop
  - Offline analysis capabilities

### Changed

- 300% faster analysis engine
- 50% reduction in bundle size
- Improved accessibility (WCAG 2.1 AA compliant)
- Enhanced mobile experience
- Better error handling and logging

### Fixed

- Fixed XSS detection false positives
- Resolved memory leaks in large file analysis
- Fixed GitHub OAuth token refresh
- Corrected PDF export formatting issues
- Fixed language detection accuracy

### Security

- Enhanced Content Security Policy (CSP)
- Implemented strict security headers
- Added rate limiting for API endpoints
- Improved input validation and sanitization

## [10.0.0] - 2024-12-15

### Added

- Initial public release
- Core security analysis engine
- Multi-language support (JavaScript, TypeScript, Python, Java)
- Basic reporting functionality
- File upload analysis

### Changed

- N/A (Initial release)

### Removed

- N/A (Initial release)

### Fixed

- N/A (Initial release)

---

## Version History Summary

| Version | Release Date | Major Changes                                     |
| ------- | ------------ | ------------------------------------------------- |
| 13.0.0  | 2026-02-11   | Documentation improvements, project cleanup       |
| 12.0.0  | 2026-01-31   | Code quality improvements, testing infrastructure |
| 11.0.0  | 2025-01-31   | Major rewrite with Next.js 16, AI features, PWA   |
| 10.0.0  | 2024-12-15   | Initial public release                            |

---

## Types of Changes

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security vulnerability fixes

---

## Links

- [GitHub Repository](https://github.com/Xenonesis/code-guardian-report)
- [Documentation](https://github.com/Xenonesis/code-guardian-report/tree/main/md)
- [Issues](https://github.com/Xenonesis/code-guardian-report/issues)
- [Releases](https://github.com/Xenonesis/code-guardian-report/releases)
