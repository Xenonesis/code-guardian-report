# Code Guardian Report

**Enterprise-Grade AI-Powered Security Analysis Platform**

[![CI/CD Pipeline](https://github.com/Xenonesis/code-guardian-report/workflows/Code%20Guardian%20Enterprise%20CI%2FCD%20Pipeline/badge.svg)](https://github.com/Xenonesis/code-guardian-report/actions)
[![Security Audit](https://github.com/Xenonesis/code-guardian-report/workflows/Security%20Audit/badge.svg)](https://github.com/Xenonesis/code-guardian-report/actions)
[![CodeQL](https://github.com/Xenonesis/code-guardian-report/workflows/CodeQL/badge.svg)](https://github.com/Xenonesis/code-guardian-report/security/code-scanning)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-11.0.0-blue.svg)](https://github.com/Xenonesis/code-guardian-report/releases)
[![Node.js](https://img.shields.io/badge/node-22.x-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.5-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Xenonesis/code-guardian-report/pulls)

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Development](#development)
  - [Production Build](#production-build)
- [Usage Guide](#usage-guide)
  - [Code Analysis](#code-analysis)
  - [GitHub Integration](#github-integration)
  - [Report Generation](#report-generation)
  - [AI-Powered Features](#ai-powered-features)
- [Multi-Language Support](#multi-language-support)
- [Security Analysis](#security-analysis)
  - [Vulnerability Detection](#vulnerability-detection)
  - [Secret Scanning](#secret-scanning)
  - [Dependency Analysis](#dependency-analysis)
  - [OWASP Compliance](#owasp-compliance)
- [API Reference](#api-reference)
- [Deployment](#deployment)
  - [Vercel Deployment](#vercel-deployment)
  - [Docker Deployment](#docker-deployment)
  - [Firebase Deployment](#firebase-deployment)
  - [Self-Hosted Deployment](#self-hosted-deployment)
- [Testing](#testing)
- [CI/CD Pipeline](#cicd-pipeline)
- [Performance Optimization](#performance-optimization)
- [Progressive Web App](#progressive-web-app)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)
- [Acknowledgments](#acknowledgments)
- [Appendices](#appendices)

---

## Overview

**Code Guardian Report** is a next-generation, enterprise-grade security analysis platform that leverages artificial intelligence and advanced static code analysis to identify vulnerabilities, code quality issues, and security misconfigurations across multiple programming languages. Built with modern web technologies, it provides real-time, comprehensive security insights for development teams, security professionals, and DevSecOps engineers.

### Mission Statement

Our mission is to democratize enterprise-grade security analysis by providing developers with powerful, accessible tools that integrate seamlessly into their workflows. We believe that security should be proactive, not reactive, and that every developer deserves access to professional-grade security analysis tools.

### Core Objectives

1. **Security First**: Identify and remediate security vulnerabilities before they reach production
2. **Developer Experience**: Provide intuitive, actionable insights without overwhelming developers
3. **Multi-Language Support**: Support 15+ programming languages with language-specific security patterns
4. **AI-Powered Intelligence**: Leverage AI to provide context-aware fix suggestions and security recommendations
5. **Enterprise-Ready**: Built for scale with robust architecture, comprehensive testing, and production-grade deployment options

### Use Cases

- **Development Teams**: Integrate security analysis into daily development workflows
- **Security Teams**: Conduct comprehensive security audits and compliance checks
- **DevSecOps Engineers**: Automate security scanning in CI/CD pipelines
- **Code Reviewers**: Enhance code review processes with automated security checks
- **Open Source Projects**: Ensure security best practices in public repositories
- **Educational Institutions**: Teach secure coding practices with real-world examples
- **Compliance Officers**: Generate compliance reports for regulatory requirements

### Platform Highlights

- **100% Client-Side Processing**: Your code never leaves your browser - complete privacy guaranteed
- **Real-Time Analysis**: Instant feedback as you upload or analyze code
- **Comprehensive Reports**: Detailed PDF and JSON exports with actionable insights
- **GitHub Integration**: Analyze repositories directly from GitHub with OAuth authentication
- **Offline Capable**: Full Progressive Web App support for offline analysis
- **Zero Configuration**: Works out of the box with sensible defaults
- **Extensible**: Custom rules engine for organization-specific security patterns

---

## Key Features

### 1. Advanced Security Analysis

#### Vulnerability Detection

- **OWASP Top 10 Coverage**: Complete detection suite for all OWASP Top 10 vulnerabilities
- **CWE Mapping**: Maps vulnerabilities to Common Weakness Enumeration (CWE) identifiers
- **Severity Classification**: Categorizes issues as Critical, High, Medium, Low, or Info
- **Context-Aware Detection**: Analyzes code flow and data dependencies
- **Framework-Specific Checks**: Tailored security patterns for popular frameworks

#### Supported Vulnerability Types

- SQL Injection (SQLi)
- Cross-Site Scripting (XSS)
- Cross-Site Request Forgery (CSRF)
- Server-Side Request Forgery (SSRF)
- Remote Code Execution (RCE)
- Path Traversal
- Insecure Deserialization
- XML External Entity (XXE)
- Security Misconfigurations
- Broken Authentication
- Sensitive Data Exposure
- Broken Access Control
- Using Components with Known Vulnerabilities
- Insufficient Logging & Monitoring

### 2. Multi-Language Code Analysis

#### Supported Programming Languages (15+)

- **JavaScript/TypeScript**: Advanced AST-based analysis with ESLint integration
- **Python**: Full support for Python 2.x and 3.x with framework detection
- **Java**: Enterprise Java and Android application analysis
- **C#/.NET**: .NET Framework and .NET Core support
- **PHP**: Laravel, Symfony, and WordPress security checks
- **Ruby**: Rails-specific security patterns
- **Go**: Goroutine safety and concurrency analysis
- **Rust**: Memory safety and ownership analysis
- **C/C++**: Memory corruption and buffer overflow detection
- **Kotlin**: Android security best practices
- **Swift**: iOS security patterns
- **Dart/Flutter**: Mobile application security
- **Scala**: Functional programming security patterns
- **HTML/CSS**: Front-end security analysis
- **SQL**: Database query security

#### Language Detection Features

- **Automatic Detection**: Identifies languages from file extensions and content patterns
- **Confidence Scoring**: Provides accuracy scores for language detection (up to 100%)
- **Multi-Layer Analysis**: Uses extension matching, syntax patterns, keywords, and unique signatures
- **Framework Detection**: Identifies frameworks like React, Vue, Angular, Django, Spring Boot, Laravel
- **Build Tool Detection**: Recognizes Webpack, Vite, Maven, Gradle, Cargo, and more
- **Package Manager Detection**: Identifies npm, Yarn, pip, Composer, Bundler, etc.

### 3. AI-Powered Intelligence

#### Natural Language Descriptions

- **Plain English Explanations**: Translates technical security issues into understandable language
- **Context-Aware**: Provides explanations based on the specific code context
- **Multiple Detail Levels**: Offers brief, standard, and detailed explanation modes

#### AI Fix Suggestions

- **Automated Remediation**: Generates secure code replacements for vulnerabilities
- **Framework-Specific Fixes**: Provides fixes tailored to detected frameworks
- **Best Practice Recommendations**: Suggests industry-standard security patterns
- **Code Diff Generation**: Shows before/after comparisons for proposed fixes

#### Intelligent Chatbot

- **Interactive Q&A**: Ask questions about detected vulnerabilities
- **Code Explanation**: Request explanations for specific code patterns
- **Security Guidance**: Get advice on security best practices
- **Custom Queries**: Perform natural language searches across analysis results

#### AI Model Support

- **OpenAI Integration**: GPT-4, GPT-3.5-turbo support
- **Anthropic Claude**: Claude 3 Opus, Sonnet, and Haiku
- **Google Gemini**: Gemini Pro and Gemini Ultra
- **Local Models**: Support for locally-hosted models via API
- **Model Discovery**: Automatic detection and configuration of available models

### 4. GitHub Repository Analysis

#### Repository Integration

- **OAuth Authentication**: Secure GitHub login with token management
- **Repository Listing**: Browse all accessible repositories
- **Direct Analysis**: Analyze repositories without manual download
- **Branch Selection**: Choose specific branches for analysis
- **Private Repository Support**: Full support for private repositories with proper permissions

#### Repository Features

- **Commit History Analysis**: Track security issues across commits
- **Pull Request Scanning**: Automated security checks for PRs
- **Issue Tracking Integration**: Link vulnerabilities to GitHub issues
- **Repository Comparison**: Compare security posture across repositories
- **Trend Analysis**: Monitor security improvements over time

### 5. Comprehensive Reporting

#### Report Types

- **PDF Reports**: Professional, formatted reports with charts and graphs
- **JSON Exports**: Machine-readable data for automation and integration
- **HTML Reports**: Interactive web-based reports
- **CSV Exports**: Spreadsheet-compatible data exports
- **SARIF Format**: Static Analysis Results Interchange Format for CI/CD integration

#### Report Contents

- **Executive Summary**: High-level overview for management
- **Detailed Findings**: Line-by-line vulnerability breakdown
- **Severity Distribution**: Visual representation of issue severity
- **Trend Analysis**: Historical security posture tracking
- **Compliance Mapping**: OWASP, CWE, and regulatory framework mapping
- **Remediation Guidance**: Step-by-step fix instructions
- **Code Snippets**: Vulnerable code with highlighted issues
- **Metrics Dashboard**: Security scores, quality metrics, and KPIs

### 6. Custom Rules Engine

#### Rule Configuration

- **Pattern Matching**: Define custom regex patterns for vulnerability detection
- **Severity Assignment**: Set custom severity levels for organization-specific risks
- **Language-Specific Rules**: Create rules tailored to specific languages
- **Rule Import/Export**: Share rule sets across teams and projects
- **Rule Templates**: Pre-built templates for common security patterns

#### Rule Categories

- **Security Rules**: Custom security vulnerability patterns
- **Compliance Rules**: Organization-specific compliance requirements
- **Code Quality Rules**: Style and quality standards
- **Performance Rules**: Performance anti-patterns and bottlenecks
- **Custom Checks**: Domain-specific validation rules

### 7. Real-Time Analytics Dashboard

#### Dashboard Components

- **Security Score**: Overall security posture metric (0-100)
- **Quality Score**: Code quality assessment
- **Maintainability Index**: Long-term maintainability rating
- **Complexity Metrics**: Cyclomatic complexity and code metrics
- **Vulnerability Trends**: Time-series visualization of security issues
- **Language Distribution**: Visual breakdown of codebase languages
- **Framework Detection**: Identified frameworks and versions

#### Interactive Charts

- **Severity Distribution**: Pie charts showing issue severity breakdown
- **Trend Analysis**: Line charts tracking security improvements
- **File Complexity**: Bar charts showing most complex files
- **Type Distribution**: Issue categorization visualization
- **OWASP Mapping**: Visual representation of OWASP coverage

### 8. Progressive Web App (PWA)

#### PWA Capabilities

- **Offline Analysis**: Full functionality without internet connection
- **Install Prompts**: One-click installation on desktop and mobile
- **Background Sync**: Automatic synchronization when connection restored
- **Push Notifications**: Real-time alerts for analysis completion
- **Service Worker**: Advanced caching and offline support
- **App-Like Experience**: Native app feel on web and mobile

#### Offline Features

- **Local Storage**: IndexedDB for persistent data storage
- **Cache Strategy**: Intelligent caching of static assets and analysis results
- **Sync Queue**: Queues operations for execution when online
- **Conflict Resolution**: Handles data conflicts gracefully

### 9. Performance Optimization

#### Performance Features

- **Code Splitting**: Dynamic imports for faster initial load
- **Lazy Loading**: On-demand component loading
- **Asset Optimization**: Minified and compressed assets
- **CDN Delivery**: Global content delivery for fast access
- **Image Optimization**: Automatic image compression and format selection
- **Bundle Analysis**: webpack-bundle-analyzer integration

#### Performance Metrics

- **First Contentful Paint (FCP)**: < 1.5s target
- **Largest Contentful Paint (LCP)**: < 2.5s target
- **Time to Interactive (TTI)**: < 3.8s target
- **Total Blocking Time (TBT)**: < 300ms target
- **Cumulative Layout Shift (CLS)**: < 0.1 target

### 10. Security and Privacy

#### Privacy Features

- **Client-Side Processing**: All code analysis happens in the browser
- **No Data Transmission**: Your code never leaves your device
- **Secure Storage**: Encrypted local storage for sensitive data
- **Anonymous Analytics**: Privacy-preserving usage analytics
- **GDPR Compliant**: Full compliance with privacy regulations

#### Security Headers

- **Content Security Policy (CSP)**: Strict CSP to prevent XSS
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Strict-Transport-Security (HSTS)**: Forces HTTPS connections
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser feature access

---

## Architecture

### High-Level Architecture

Code Guardian Report follows a modern, modular architecture designed for scalability, maintainability, and performance.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Browser                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Next.js Application                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐  │  │
│  │  │    Pages    │  │ Components  │  │    Services      │  │  │
│  │  │  (Routes)   │  │   (UI/UX)   │  │   (Business)     │  │  │
│  │  └─────────────┘  └─────────────┘  └──────────────────┘  │  │
│  │         │                 │                  │             │  │
│  │         └─────────────────┴──────────────────┘             │  │
│  │                          │                                 │  │
│  │  ┌───────────────────────▼─────────────────────────────┐  │  │
│  │  │           Core Analysis Engine                       │  │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌────────────────────┐  │  │  │
│  │  │  │   AST    │ │ Security │ │   Multi-Language   │  │  │  │
│  │  │  │ Analyzer │ │ Analyzer │ │      Parser        │  │  │  │
│  │  │  └──────────┘ └──────────┘ └────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                          │                                 │  │
│  │  ┌───────────────────────▼─────────────────────────────┐  │  │
│  │  │              Storage Layer                           │  │  │
│  │  │   ┌──────────────┐        ┌──────────────────────┐  │  │  │
│  │  │   │  IndexedDB   │        │   LocalStorage       │  │  │  │
│  │  │   │  (Analysis)  │        │  (Preferences)       │  │  │  │
│  │  │   └──────────────┘        └──────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      External Services                           │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │   GitHub     │  │   Firebase   │  │   AI Providers        │ │
│  │     API      │  │  (Optional)  │  │  (OpenAI, Claude)     │ │
│  └──────────────┘  └──────────────┘  └───────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Component Architecture

#### 1. Presentation Layer

- **Pages**: Next.js App Router pages for routing
- **Components**: Reusable React components organized by domain
- **Layouts**: Shared layout components for consistent UI
- **UI Library**: Radix UI components with Tailwind CSS styling

#### 2. Business Logic Layer

- **Services**: Domain-specific business logic
  - `analysisIntegrationService`: Coordinates analysis workflows
  - `enhancedAnalysisEngine`: Core security analysis
  - `githubRepositoryService`: GitHub integration
  - `aiService`: AI-powered features
- **Hooks**: Custom React hooks for state management
- **Context**: React Context for global state

#### 3. Data Layer

- **Analysis Storage**: IndexedDB for analysis results
- **Firebase Storage** (Optional): Cloud persistence
- **GitHub Storage**: Repository-based storage
- **Offline Manager**: Handles offline data synchronization

#### 4. Analysis Engine Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     Analysis Pipeline                             │
├──────────────────────────────────────────────────────────────────┤
│  1. File Upload/GitHub Fetch                                     │
│     └─> Validation → Preprocessing → Language Detection          │
├──────────────────────────────────────────────────────────────────┤
│  2. Multi-Language Parsing                                       │
│     ├─> JavaScript/TypeScript → Babel Parser → AST              │
│     ├─> Python → Acorn Parser → AST                             │
│     ├─> Java → Lezer Parser → AST                               │
│     └─> Other Languages → Pattern Matching                      │
├──────────────────────────────────────────────────────────────────┤
│  3. Security Analysis                                            │
│     ├─> Static Analysis Rules                                   │
│     ├─> Data Flow Analysis                                      │
│     ├─> Control Flow Analysis                                   │
│     ├─> Taint Analysis                                          │
│     └─> Pattern Matching                                        │
├──────────────────────────────────────────────────────────────────┤
│  4. Vulnerability Detection                                      │
│     ├─> OWASP Checks                                            │
│     ├─> CWE Mapping                                             │
│     ├─> Framework-Specific Rules                               │
│     └─> Custom Rules                                            │
├──────────────────────────────────────────────────────────────────┤
│  5. Secret Detection                                             │
│     ├─> API Key Patterns                                        │
│     ├─> Token Patterns                                          │
│     ├─> Password Patterns                                       │
│     └─> Certificate Patterns                                    │
├──────────────────────────────────────────────────────────────────┤
│  6. Dependency Analysis                                          │
│     ├─> Package.json/requirements.txt Parsing                   │
│     ├─> Version Checking                                        │
│     └─> Known Vulnerability Database Lookup                     │
├──────────────────────────────────────────────────────────────────┤
│  7. Metrics Calculation                                          │
│     ├─> Cyclomatic Complexity                                   │
│     ├─> Code Smells                                             │
│     ├─> Maintainability Index                                   │
│     └─> Security Score                                          │
├──────────────────────────────────────────────────────────────────┤
│  8. AI Enhancement (Optional)                                    │
│     ├─> Natural Language Descriptions                           │
│     ├─> Fix Suggestions                                         │
│     └─> Context Analysis                                        │
├──────────────────────────────────────────────────────────────────┤
│  9. Report Generation                                            │
│     ├─> PDF Export                                              │
│     ├─> JSON Export                                             │
│     ├─> HTML Report                                             │
│     └─> SARIF Export                                            │
└──────────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
code-guardian-report/
├── app/                          # Next.js App Router
│   ├── about/                    # About page
│   ├── api/                      # API routes
│   │   ├── analytics/            # Analytics endpoints
│   │   ├── health/               # Health check
│   │   ├── log-error/            # Error logging
│   │   └── push/                 # Push notification endpoints
│   ├── github-analysis/          # GitHub analysis page
│   ├── help/                     # Help documentation
│   ├── history/                  # Analysis history
│   ├── privacy/                  # Privacy policy
│   ├── pwa-settings/             # PWA settings
│   ├── terms/                    # Terms of service
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── src/
│   ├── components/               # React components
│   │   ├── ai/                   # AI-related components
│   │   ├── analysis/             # Analysis components
│   │   ├── auth/                 # Authentication components
│   │   ├── common/               # Common/shared components
│   │   ├── dashboard/            # Dashboard components
│   │   ├── export/               # Export components
│   │   ├── firebase/             # Firebase components
│   │   ├── github/               # GitHub components
│   │   ├── language/             # Language detection components
│   │   ├── layout/               # Layout components
│   │   ├── monitoring/           # Monitoring components
│   │   ├── notifications/        # Notification components
│   │   ├── pwa/                  # PWA components
│   │   ├── results/              # Results display components
│   │   ├── rules/                # Custom rules components
│   │   ├── security/             # Security components
│   │   ├── testing/              # Testing components
│   │   ├── ui/                   # UI primitives (Radix UI)
│   │   └── upload/               # File upload components
│   ├── config/                   # Configuration files
│   │   ├── constants.ts          # Application constants
│   │   ├── pwa.ts                # PWA configuration
│   │   └── security.ts           # Security configuration
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAnalysis.ts        # Analysis hook
│   │   ├── useFileUpload.ts      # File upload hook
│   │   ├── useGitHubRepositories.ts
│   │   ├── usePWA.ts             # PWA hook
│   │   └── ...
│   ├── lib/                      # Library code
│   │   ├── auth-context.tsx      # Authentication context
│   │   ├── firebase.ts           # Firebase configuration
│   │   ├── firestore-utils.ts    # Firestore utilities
│   │   └── utils.ts              # Utility functions
│   ├── services/                 # Business logic services
│   │   ├── ai/                   # AI services
│   │   │   ├── aiService.ts      # Main AI service
│   │   │   ├── aiFixSuggestionsService.ts
│   │   │   ├── modelDiscoveryService.ts
│   │   │   └── naturalLanguageDescriptionService.ts
│   │   ├── analysis/             # Analysis services
│   │   │   ├── ASTAnalyzer.ts    # AST analysis
│   │   │   ├── DataFlowAnalyzer.ts
│   │   │   ├── MetricsCalculator.ts
│   │   │   ├── MultiLanguageParser.ts
│   │   │   ├── MultiLanguageSecurityAnalyzer.ts
│   │   │   └── SecurityAnalyzer.ts
│   │   ├── api/                  # API services
│   │   │   └── githubService.ts  # GitHub API
│   │   ├── detection/            # Detection services
│   │   │   ├── codeProvenanceService.ts
│   │   │   ├── frameworkDetectionEngine.ts
│   │   │   └── languageDetectionService.ts
│   │   ├── export/               # Export services
│   │   │   └── pdfExportService.ts
│   │   ├── monitoring/           # Monitoring services
│   │   │   └── WebhookManager.ts
│   │   ├── notifications/        # Notification services
│   │   │   └── NotificationManager.ts
│   │   ├── pwa/                  # PWA services
│   │   │   ├── backgroundSync.ts
│   │   │   ├── pushNotifications.ts
│   │   │   └── pwaAnalytics.ts
│   │   ├── rules/                # Rules engine
│   │   │   └── CustomRulesEngine.ts
│   │   ├── security/             # Security services
│   │   │   ├── dependencyVulnerabilityScanner.ts
│   │   │   ├── modernCodeScanningService.ts
│   │   │   ├── secretDetectionService.ts
│   │   │   ├── securityAnalysisEngine.ts
│   │   │   └── zipAnalysisService.ts
│   │   └── storage/              # Storage services
│   │       ├── analysisStorage.ts
│   │       ├── firebaseAnalysisStorage.ts
│   │       ├── GitHubAnalysisStorageService.ts
│   │       └── offlineManager.ts
│   ├── styles/                   # CSS styles
│   ├── tests/                    # Test files
│   ├── types/                    # TypeScript types
│   │   ├── analysis.ts           # Analysis types
│   │   ├── api.ts                # API types
│   │   ├── auth.ts               # Authentication types
│   │   └── common.ts             # Common types
│   ├── utils/                    # Utility functions
│   │   ├── errorHandler.ts       # Error handling
│   │   ├── fileValidation.ts     # File validation
│   │   ├── logger.ts             # Logging
│   │   └── security.ts           # Security utilities
│   └── views/                    # Page views
├── public/                       # Static assets
│   ├── icons/                    # Application icons
│   ├── manifest.json             # PWA manifest
│   ├── robots.txt                # SEO robots file
│   └── sitemap.xml               # SEO sitemap
├── functions/                    # Firebase Cloud Functions
│   └── src/
│       └── index.ts              # Functions entry point
├── .github/                      # GitHub configuration
│   └── workflows/                # GitHub Actions workflows
│       ├── ci.yml                # CI/CD pipeline
│       ├── codeql.yml            # CodeQL analysis
│       ├── security-audit.yml    # Security audits
│       └── ...
├── scripts/                      # Utility scripts
│   ├── e2e-zip-analysis.ts       # E2E tests
│   ├── run-all-tests.ts          # Test runner
│   └── update-contributors.js    # Contributors update
├── md/                           # Markdown documentation
│   ├── CONTRIBUTING.md           # Contribution guidelines
│   ├── CODE_OF_CONDUCT.md        # Code of conduct
│   └── changelogs.md             # Version changelogs
├── .env.example                  # Environment variables template
├── Dockerfile                    # Docker configuration
├── docker-compose.yml            # Docker Compose configuration
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── package.json                  # Node.js dependencies
├── vercel.json                   # Vercel deployment config
├── firebase.json                 # Firebase configuration
├── jest.config.js                # Jest test configuration
├── vitest.config.ts              # Vitest configuration
├── DEPLOYMENT.md                 # Deployment guide
├── SECURITY.md                   # Security policy
├── LICENSE                       # MIT License
└── README.md                     # This file
```

---

## Technology Stack

### Frontend Technologies

#### Core Framework

- **Next.js 16.1.5**: React framework with App Router, Server Components, and API routes
- **React 19.2.4**: Latest React with improved performance and concurrent features
- **TypeScript 5.9.3**: Type-safe development with advanced type features

#### UI/UX Libraries

- **Tailwind CSS 4.1.18**: Utility-first CSS framework for rapid UI development
- **Radix UI**: Unstyled, accessible component primitives
  - Dialog, Popover, Select, Tabs, Toast, Tooltip, and more
- **Framer Motion 12.29.2**: Production-ready animation library
- **Lucide React 0.563.0**: Beautiful, consistent icon set
- **Recharts 3.7.0**: Composable charting library for data visualization
- **Lenis 1.3.17**: Smooth scrolling library

#### State Management & Data Flow

- **React Context API**: Global state management
- **Custom Hooks**: Reusable stateful logic
- **Local Storage**: Client-side persistence
- **IndexedDB**: Large-scale client-side database

### Backend Technologies

#### Runtime & Server

- **Node.js 22.x**: JavaScript runtime with latest features
- **Next.js API Routes**: Serverless API endpoints
- **Firebase Cloud Functions**: Serverless backend (optional)

#### Authentication & Authorization

- **Firebase Authentication**: Secure user authentication
- **GitHub OAuth**: GitHub integration authentication
- **JWT**: Token-based authentication

### Database & Storage

#### Client-Side Storage

- **IndexedDB**: Primary storage for analysis results
- **LocalStorage**: User preferences and settings
- **SessionStorage**: Temporary session data

#### Cloud Storage (Optional)

- **Firebase Firestore**: NoSQL cloud database
- **Firebase Storage**: File storage service
- **GitHub API**: Repository data storage

### Code Analysis Technologies

#### Parsers & AST

- **@babel/parser 7.28.6**: JavaScript/TypeScript parsing
- **@babel/traverse 7.28.6**: AST traversal
- **@babel/types 7.28.6**: AST manipulation
- **Acorn 8.15.0**: Fast JavaScript parser
- **Esprima 4.0.1**: ECMAScript parser
- **ESQuery 1.7.0**: CSS-like query language for AST
- **@lezer/python 1.1.18**: Python language parser
- **@lezer/java 1.1.3**: Java language parser
- **@lezer/cpp 1.1.5**: C++ language parser
- **web-tree-sitter 0.26.3**: Multi-language parser

#### Analysis Tools

- **Custom Security Analyzer**: Proprietary vulnerability detection
- **AST Analyzer**: Abstract syntax tree analysis
- **Data Flow Analyzer**: Data flow tracking
- **Metrics Calculator**: Code quality metrics

### Progressive Web App

#### PWA Technologies

- **Serwist 9.5.0**: Service worker library for Next.js
- **@serwist/next 9.5.0**: Next.js integration
- **Web App Manifest**: PWA configuration
- **Service Workers**: Offline functionality and caching
- **Push API**: Browser push notifications
- **Background Sync**: Offline operation queuing

### Build & Development Tools

#### Build Tools

- **Next.js Compiler**: Fast Rust-based compiler
- **Turbopack**: Ultra-fast bundler (optional)
- **PostCSS 8.5.6**: CSS transformations
- **Tailwind CSS Compiler**: JIT CSS generation

#### Code Quality

- **ESLint 9.39.2**: JavaScript/TypeScript linting
- **@typescript-eslint**: TypeScript-specific rules
- **Prettier 3.8.1**: Code formatting
- **Stylelint 17.0.0**: CSS linting
- **lint-staged 16.2.7**: Pre-commit linting

#### Testing

- **Vitest 4.0.18**: Fast unit test framework
- **Jest 30.2.0**: JavaScript testing framework
- **@testing-library/react 16.3.2**: React component testing
- **@testing-library/jest-dom 6.9.1**: Custom Jest matchers
- **happy-dom 20.3.9**: Lightweight DOM implementation

### DevOps & Deployment

#### CI/CD

- **GitHub Actions**: Automated workflows
- **Vercel**: Deployment platform
- **Docker**: Containerization
- **Firebase Hosting**: Static site hosting

#### Monitoring & Analytics

- **@vercel/analytics 1.6.1**: Performance analytics
- **@vercel/speed-insights 1.3.1**: Real-user monitoring
- **web-vitals 5.1.0**: Core Web Vitals measurement
- **Custom Analytics**: Application-specific metrics

### Security Technologies

#### Security Libraries

- **Custom Secret Detection**: Proprietary pattern matching
- **Dependency Scanner**: Vulnerability detection
- **OWASP Rule Engine**: OWASP Top 10 checks
- **CWE Mapper**: Common Weakness Enumeration

#### Security Headers

- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

### AI & Machine Learning

#### AI Providers

- **OpenAI API**: GPT-4, GPT-3.5-turbo
- **Anthropic API**: Claude 3 models
- **Google AI**: Gemini models
- **Custom Models**: Local model support

#### AI Features

- Natural language processing
- Code understanding and explanation
- Automated fix generation
- Context-aware recommendations

### File Processing

#### File Handling

- **JSZip 3.10.1**: ZIP file processing
- **File API**: Browser file handling
- **Drag & Drop API**: File upload UX
- **Streams API**: Large file processing

#### Export & Reporting

- **jsPDF 4.0.0**: PDF generation
- **html2canvas 1.4.1**: HTML to canvas conversion
- **JSON**: Structured data export
- **SARIF**: Static analysis format

### Development Environment

#### Package Management

- **npm 9.0.0+**: Node package manager
- **package-lock.json**: Dependency locking

#### Version Control

- **Git**: Source control
- **GitHub**: Repository hosting
- **Husky 9.1.7**: Git hooks

#### Code Editors

- VS Code (recommended)
- WebStorm
- Cursor
- Any text editor with TypeScript support

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed on your system:

#### Required Software

- **Node.js**: Version 22.x (LTS recommended)
  - Download from: https://nodejs.org/
  - Verify installation: `node --version`
- **npm**: Version 9.0.0 or higher (comes with Node.js)
  - Verify installation: `npm --version`
- **Git**: Latest version
  - Download from: https://git-scm.com/
  - Verify installation: `git --version`

#### Optional Software

- **Docker**: For containerized deployment
  - Download from: https://www.docker.com/
- **Firebase CLI**: For Firebase deployment
  - Install: `npm install -g firebase-tools`
- **Vercel CLI**: For Vercel deployment
  - Install: `npm install -g vercel`

#### System Requirements

- **Operating System**: Windows 10+, macOS 10.15+, or Linux
- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: Minimum 500MB free space
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+

### Installation

#### 1. Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/Xenonesis/code-guardian-report.git

# Or clone via SSH
git clone git@github.com:Xenonesis/code-guardian-report.git

# Navigate to project directory
cd code-guardian-report
```

#### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# Or use clean install for reproducible builds
npm ci
```

This will install all required dependencies including:

- Next.js and React
- TypeScript and type definitions
- UI libraries (Tailwind CSS, Radix UI, Framer Motion)
- Analysis libraries (Babel, parsers)
- Development tools (ESLint, Prettier, testing frameworks)

#### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# Copy the example environment file
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# GitHub OAuth (Optional - for GitHub integration)
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXT_PUBLIC_GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/github/callback

# Firebase (Optional - for cloud features)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# AI Configuration (Optional - for AI features)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_id
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_vercel_analytics_id

# Feature Flags
NEXT_PUBLIC_ENABLE_AI=true
NEXT_PUBLIC_ENABLE_FIREBASE=false
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

#### 4. Configure Firebase (Optional)

If you want to use Firebase features:

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication with GitHub provider
3. Enable Firestore Database
4. Enable Storage
5. Copy configuration to `.env.local`

```bash
# Initialize Firebase in your project
firebase init

# Select the following features:
# - Firestore
# - Functions
# - Hosting
# - Storage
```

#### 5. Configure GitHub OAuth (Optional)

To enable GitHub repository analysis:

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in the application details:
   - Application name: Code Guardian (or your preferred name)
   - Homepage URL: http://localhost:3000
   - Authorization callback URL: http://localhost:3000/api/auth/github/callback
4. Copy Client ID and Client Secret to `.env.local`

### Development

#### Start Development Server

```bash
# Start the development server
npm run dev

# Or use Turbopack for faster development (experimental)
npm run dev:turbo
```

The application will be available at: http://localhost:3000

#### Development Features

- **Hot Module Replacement (HMR)**: Instant updates without page reload
- **Fast Refresh**: Preserves component state during edits
- **TypeScript Type Checking**: Real-time type error detection
- **ESLint Integration**: Code quality warnings in the terminal

#### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run dev:turbo        # Start with Turbopack (faster)

# Building
npm run build            # Production build
npm run build:prod       # Build with all checks
npm run build:analyze    # Build with bundle analysis

# Quality Checks
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run lint:css         # Run Stylelint
npm run lint:css:fix     # Fix Stylelint issues
npm run format           # Format code with Prettier
npm run type-check       # TypeScript type checking
npm run type-check:watch # Watch mode type checking

# Testing
npm run test             # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Generate coverage report
npm run test:ui          # Interactive test UI
npm run test:e2e-zip     # E2E ZIP analysis test
npm run test:multi-language  # Multi-language tests

# CI/CD
npm run ci:validate      # Run all validation checks
npm run ci:build         # CI build with validation

# Deployment
npm run start            # Start production server
npm run deploy:vercel    # Deploy to Vercel
npm run deploy:preview   # Deploy preview to Vercel

# Docker
npm run docker:build     # Build Docker image
npm run docker:run       # Run Docker container

# Utilities
npm run clean            # Clean build artifacts
npm run clean:all        # Clean all generated files
npm run health-check     # Check application health
npm run update-contributors  # Update contributors list
```

### Production Build

#### Build for Production

```bash
# Full production build with all checks
npm run build:prod
```

This command will:

1. Clean previous builds
2. Run linting checks
3. Perform type checking
4. Run tests
5. Build optimized production bundle
6. Generate static assets

#### Build Output

The production build creates:

- `.next/`: Next.js build output
- `.next/static/`: Static assets (JS, CSS, images)
- `.next/server/`: Server-side code
- `public/`: Public static files

#### Analyze Bundle Size

```bash
# Build and analyze bundle
npm run build:analyze
```

This opens an interactive bundle analyzer showing:

- Bundle sizes by route
- Package sizes
- Duplicate dependencies
- Optimization opportunities

#### Start Production Server

```bash
# Start production server
npm run start

# Or with custom port
PORT=3001 npm run start
```

---

## Usage Guide

### Code Analysis

#### Upload Methods

##### Method 1: File Upload (ZIP)

1. **Prepare Your Code**:
   - Create a ZIP archive of your project
   - Recommended structure: Include source code directories only
   - Maximum file size: 100MB
   - Maximum files: 1000

2. **Upload Process**:
   - Navigate to the home page
   - Click on "Upload ZIP File" tab
   - Drag and drop your ZIP file or click to browse
   - Wait for automatic extraction and analysis

3. **Supported Formats**:
   - `.zip` archives
   - Nested directories supported
   - All text-based source files

##### Method 2: GitHub Repository

1. **Connect GitHub Account**:
   - Click "GitHub Analysis" in navigation
   - Click "Connect GitHub"
   - Authorize Code Guardian Report
   - Grant repository access permissions

2. **Select Repository**:
   - Browse your repositories
   - Select the repository to analyze
   - Choose branch (default: main)
   - Click "Analyze Repository"

3. **Repository Requirements**:
   - Public or private repositories (with proper permissions)
   - Any programming language
   - Any size (analysis runs client-side)

#### Analysis Process

The analysis pipeline follows these steps:

1. **File Extraction**: Unzip and validate files
2. **Language Detection**: Identify programming languages
3. **Framework Detection**: Detect frameworks and libraries
4. **Parsing**: Generate Abstract Syntax Trees (AST)
5. **Security Analysis**: Run vulnerability detection rules
6. **Secret Scanning**: Search for exposed credentials
7. **Dependency Analysis**: Check for vulnerable dependencies
8. **Metrics Calculation**: Compute code quality metrics
9. **Report Generation**: Create comprehensive reports

#### Real-Time Feedback

During analysis, you'll see:

- Progress bar showing completion percentage
- Current file being analyzed
- Number of issues found (updated in real-time)
- Estimated time remaining

### GitHub Integration

#### Setting Up GitHub Integration

1. **Create OAuth App**:

   ```
   GitHub Settings → Developer settings → OAuth Apps → New OAuth App
   ```

2. **Configuration**:
   - Application name: Your app name
   - Homepage URL: https://your-domain.com
   - Callback URL: https://your-domain.com/api/auth/github/callback

3. **Add Credentials**:
   ```env
   NEXT_PUBLIC_GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```

#### Using GitHub Features

##### Repository Analysis

```typescript
// Programmatic usage example
import { GitHubRepositoryService } from "@/services/githubRepositoryService";

const service = new GitHubRepositoryService(accessToken);

// List repositories
const repos = await service.listRepositories();

// Analyze repository
const result = await service.analyzeRepository({
  owner: "username",
  repo: "repository",
  branch: "main",
});
```

##### Batch Analysis

Analyze multiple repositories:

1. Select multiple repositories from the list
2. Click "Analyze Selected"
3. View comparative results

##### Repository Comparison

Compare security posture across repositories:

1. Navigate to "Repository Comparison" tab
2. Select repositories to compare
3. View side-by-side metrics
4. Export comparison report

### Report Generation

#### PDF Reports

##### Generate PDF Report

1. Complete code analysis
2. Click "Export" button
3. Select "PDF Report"
4. Choose report template:
   - **Executive Summary**: High-level overview
   - **Detailed Analysis**: Complete findings
   - **Compliance Report**: Regulatory compliance focus
   - **Technical Report**: Deep technical details

##### PDF Contents

The PDF report includes:

- Cover page with project information
- Executive summary with key metrics
- Vulnerability breakdown by severity
- Detailed findings with code snippets
- Remediation recommendations
- Trend analysis charts
- OWASP mapping
- CWE references
- Compliance checklist

##### Customization

Customize PDF reports:

```typescript
import { PDFExportService } from "@/services/export/pdfExportService";

const pdfService = new PDFExportService();

const options = {
  includeExecutiveSummary: true,
  includeCodeSnippets: true,
  includeCharts: true,
  includeRecommendations: true,
  template: "detailed",
  orientation: "portrait",
  pageSize: "A4",
};

await pdfService.generateReport(analysisResults, options);
```

#### JSON Exports

Export analysis data in JSON format for:

- API integration
- Custom reporting tools
- Data warehousing
- CI/CD pipelines

```json
{
  "id": "analysis-uuid",
  "timestamp": "2025-01-31T00:00:00.000Z",
  "metadata": {
    "projectName": "My Project",
    "version": "1.0.0",
    "analysisType": "full"
  },
  "summary": {
    "totalFiles": 250,
    "totalLines": 50000,
    "totalIssues": 45,
    "criticalIssues": 5,
    "highIssues": 12,
    "mediumIssues": 20,
    "lowIssues": 8,
    "securityScore": 78,
    "qualityScore": 85
  },
  "languages": [
    {
      "name": "TypeScript",
      "percentage": 65,
      "files": 150,
      "lines": 32500
    }
  ],
  "issues": [
    {
      "id": "issue-1",
      "type": "vulnerability",
      "severity": "critical",
      "title": "SQL Injection vulnerability",
      "description": "...",
      "file": "src/api/users.ts",
      "line": 45,
      "column": 12,
      "cwe": "CWE-89",
      "owasp": "A03:2021-Injection",
      "recommendation": "..."
    }
  ]
}
```

#### SARIF Export

Export in SARIF format for CI/CD integration:

- GitHub Code Scanning integration
- GitLab Security Dashboard
- Azure DevOps
- Jenkins plugins

```json
{
  "$schema": "https://json.schemastore.org/sarif-2.1.0.json",
  "version": "2.1.0",
  "runs": [
    {
      "tool": {
        "driver": {
          "name": "Code Guardian Report",
          "version": "11.0.0",
          "informationUri": "https://github.com/Xenonesis/code-guardian-report"
        }
      },
      "results": []
    }
  ]
}
```

### AI-Powered Features

#### Natural Language Descriptions

Transform technical security findings into plain English:

**Before** (Technical):

```
CWE-79: Improper Neutralization of Input During Web Page Generation
```

**After** (Natural Language):

```
Your application is vulnerable to Cross-Site Scripting (XSS) attacks.
This means an attacker could inject malicious JavaScript code that runs
in users' browsers, potentially stealing their data or performing
actions on their behalf.
```

#### AI Fix Suggestions

Get automated remediation code:

**Original Vulnerable Code**:

```javascript
const query = `SELECT * FROM users WHERE id = ${userId}`;
db.execute(query);
```

**AI-Suggested Fix**:

```javascript
const query = "SELECT * FROM users WHERE id = ?";
db.execute(query, [userId]);

// Or using ORM (recommended):
const user = await User.findById(userId);
```

**Explanation**:
The AI provides:

- Secure code replacement
- Multiple fix options
- Framework-specific solutions
- Best practice recommendations
- Security considerations

#### Chatbot Interaction

Interact with the AI assistant:

**Example Conversations**:

```
User: Why is this XSS vulnerability marked as critical?

AI: This XSS vulnerability is marked as critical because:
1. It occurs in user-facing functionality
2. User input is directly rendered without sanitization
3. It could lead to session hijacking
4. Admin users are affected, increasing impact
5. It's exploitable without authentication

Recommended priority: Immediate fix required.
```

```
User: How do I fix the CSRF vulnerability in my Express app?

AI: To fix CSRF in Express.js:

1. Install csurf middleware:
   npm install csurf

2. Add to your app:
   const csrf = require('csurf');
   app.use(csrf({ cookie: true }));

3. Add CSRF token to forms:
   <input type="hidden" name="_csrf" value="<%= csrfToken %>">

4. Include token in AJAX requests:
   headers: { 'CSRF-Token': token }

Would you like me to show you a complete example?
```

#### Configuring AI Features

Configure AI providers in your environment:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=2000

# Anthropic Configuration
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-opus-20240229

# Google AI Configuration
GOOGLE_AI_API_KEY=...
GOOGLE_AI_MODEL=gemini-pro

# AI Feature Toggles
NEXT_PUBLIC_ENABLE_AI_DESCRIPTIONS=true
NEXT_PUBLIC_ENABLE_AI_FIXES=true
NEXT_PUBLIC_ENABLE_AI_CHATBOT=true
```

---

## Multi-Language Support

### Supported Languages

Code Guardian supports comprehensive analysis for 15+ programming languages:

#### 1. JavaScript/ECMAScript

**Supported Versions**: ES5, ES6+, ES2015-ES2024  
**Frameworks Detected**: React, Vue, Angular, Svelte, Node.js, Express, Next.js  
**File Extensions**: `.js`, `.mjs`, `.cjs`, `.jsx`

**Security Checks**:

- XSS vulnerabilities
- Prototype pollution
- eval() usage
- Insecure randomness
- Hardcoded credentials
- SQL injection (in database queries)
- Command injection
- Path traversal
- SSRF vulnerabilities
- Insecure dependencies

**Example Patterns Detected**:

```javascript
// XSS vulnerability
element.innerHTML = userInput; // CRITICAL

// Prototype pollution
Object.assign({}, JSON.parse(userInput)); // HIGH

// Command injection
exec(`ls ${userInput}`); // CRITICAL

// Insecure randomness
Math.random() * 1000000; // MEDIUM (for security tokens)
```

#### 2. TypeScript

**Supported Versions**: 3.x, 4.x, 5.x  
**Frameworks Detected**: Angular, NestJS, Next.js, React  
**File Extensions**: `.ts`, `.tsx`, `.d.ts`

**Security Checks**:

- Type safety violations
- `any` type usage in security-critical code
- Unsafe type assertions
- Missing input validation
- All JavaScript vulnerabilities
- Framework-specific issues

**Example Patterns Detected**:

```typescript
// Unsafe type assertion
const data = response as UserData; // MEDIUM (without validation)

// Any type in security context
function authenticate(token: any) {} // HIGH

// Missing null checks
user.password.toString(); // MEDIUM (potential null reference)
```

#### 3. Python

**Supported Versions**: Python 2.7, 3.x  
**Frameworks Detected**: Django, Flask, FastAPI, Pyramid  
**File Extensions**: `.py`, `.pyw`, `.pyi`

**Security Checks**:

- SQL injection
- Command injection
- Path traversal
- Insecure deserialization (pickle)
- eval/exec usage
- XML vulnerabilities
- SSRF
- Hardcoded secrets
- Weak cryptography

**Example Patterns Detected**:

```python
# SQL injection
query = f"SELECT * FROM users WHERE name = '{username}'"  # CRITICAL

# Command injection
os.system(f"ls {user_input}")  # CRITICAL

# Insecure deserialization
pickle.loads(data)  # HIGH

# Weak cryptography
hashlib.md5(password.encode())  # HIGH
```

#### 4. Java

**Supported Versions**: Java 8, 11, 17, 21  
**Frameworks Detected**: Spring Boot, Spring Framework, Hibernate, Struts  
**File Extensions**: `.java`

**Security Checks**:

- SQL injection
- XXE (XML External Entity)
- Insecure deserialization
- Path traversal
- LDAP injection
- Command injection
- Weak cryptography
- Hardcoded credentials
- Trust boundary violations

**Example Patterns Detected**:

```java
// SQL injection
String query = "SELECT * FROM users WHERE id = " + userId; // CRITICAL

// XXE vulnerability
DocumentBuilder builder = factory.newDocumentBuilder(); // HIGH (without secure settings)

// Insecure deserialization
ObjectInputStream ois = new ObjectInputStream(input); // HIGH

// Weak random
new Random().nextInt(); // MEDIUM (for security purposes)
```

#### 5. C# / .NET

**Supported Versions**: .NET Framework, .NET Core, .NET 5+  
**Frameworks Detected**: ASP.NET, ASP.NET Core, Entity Framework  
**File Extensions**: `.cs`, `.csx`

**Security Checks**:

- SQL injection
- XSS vulnerabilities
- CSRF vulnerabilities
- Path traversal
- XXE
- Insecure deserialization
- Weak cryptography
- Command injection

**Example Patterns Detected**:

```csharp
// SQL injection
var query = $"SELECT * FROM Users WHERE Id = {userId}"; // CRITICAL

// XSS vulnerability
@Html.Raw(userInput) // HIGH

// Weak cryptography
var hash = MD5.Create().ComputeHash(data); // HIGH

// Path traversal
File.ReadAllText(userInput); // HIGH
```

#### 6. PHP

**Supported Versions**: PHP 7.x, 8.x  
**Frameworks Detected**: Laravel, Symfony, CodeIgniter, WordPress  
**File Extensions**: `.php`, `.phtml`

**Security Checks**:

- SQL injection
- XSS vulnerabilities
- Remote code execution
- File inclusion vulnerabilities
- Command injection
- Path traversal
- Session fixation
- CSRF vulnerabilities
- Insecure file uploads

**Example Patterns Detected**:

```php
// SQL injection
$query = "SELECT * FROM users WHERE id = " . $_GET['id']; // CRITICAL

// Remote code execution
eval($_POST['code']); // CRITICAL

// File inclusion
include($_GET['page'] . '.php'); // CRITICAL

// XSS vulnerability
echo $_GET['name']; // HIGH
```

#### 7. Go (Golang)

**Supported Versions**: Go 1.16+  
**Frameworks Detected**: Gin, Echo, Fiber, Gorilla  
**File Extensions**: `.go`

**Security Checks**:

- SQL injection
- Command injection
- Path traversal
- SSRF
- Insecure TLS configuration
- Race conditions
- Goroutine leaks
- Buffer overflows

**Example Patterns Detected**:

```go
// SQL injection
query := fmt.Sprintf("SELECT * FROM users WHERE id = %s", userId) // CRITICAL

// Command injection
exec.Command("sh", "-c", userInput).Run() // CRITICAL

// Insecure TLS
tls.Config{InsecureSkipVerify: true} // HIGH

// Race condition
// Unsynchronized access to shared variable // MEDIUM
```

#### 8. Ruby

**Supported Versions**: Ruby 2.x, 3.x  
**Frameworks Detected**: Ruby on Rails, Sinatra  
**File Extensions**: `.rb`, `.rake`

**Security Checks**:

- SQL injection
- XSS vulnerabilities
- Command injection
- Mass assignment
- CSRF vulnerabilities
- Insecure deserialization
- Path traversal

**Example Patterns Detected**:

```ruby
# SQL injection
User.where("name = '#{params[:name]}'") # CRITICAL

# Command injection
system("ls #{user_input}") # CRITICAL

# Mass assignment vulnerability
User.create(params[:user]) # HIGH (without strong params)

# Insecure deserialization
Marshal.load(data) # HIGH
```

#### 9. Rust

**Supported Versions**: Rust 1.60+  
**File Extensions**: `.rs`

**Security Checks**:

- Unsafe code blocks
- Memory safety issues
- Integer overflows
- Panic in production code
- Insecure dependencies
- Improper error handling

**Example Patterns Detected**:

```rust
// Unsafe code block
unsafe { /* ... */ } // MEDIUM (requires review)

// Potential integer overflow
let result = a + b; // MEDIUM (in security context)

// Panic in production
value.unwrap() // LOW (should use proper error handling)
```

#### 10. C/C++

**Supported Versions**: C11, C++11/14/17/20  
**File Extensions**: `.c`, `.cpp`, `.h`, `.hpp`

**Security Checks**:

- Buffer overflows
- Memory leaks
- Use-after-free
- Integer overflows
- Format string vulnerabilities
- SQL injection
- Command injection
- NULL pointer dereference

**Example Patterns Detected**:

```c
// Buffer overflow
strcpy(dest, src); // CRITICAL

// Format string vulnerability
printf(user_input); // CRITICAL

// Memory leak
malloc(size); // MEDIUM (without free())

// SQL injection
sprintf(query, "SELECT * FROM users WHERE id = %s", userId); // CRITICAL
```

### Language Detection

#### Automatic Detection

Code Guardian uses a multi-layer detection system:

1. **File Extension Matching**: Primary identification
2. **Content Analysis**: Syntax pattern recognition
3. **Keyword Frequency**: Language-specific keyword counting
4. **Unique Signatures**: Language-specific patterns
5. **Priority Scoring**: Disambiguation for similar languages

**Detection Accuracy**: 95-100% confidence scores

**Example Output**:

```json
{
  "primaryLanguage": {
    "name": "TypeScript",
    "confidence": 98,
    "extensions": [".ts", ".tsx"],
    "category": "programming",
    "ecosystem": "web"
  },
  "allLanguages": [
    {
      "name": "TypeScript",
      "confidence": 98,
      "percentage": 75.5
    },
    {
      "name": "JavaScript",
      "confidence": 85,
      "percentage": 15.3
    },
    {
      "name": "JSON",
      "confidence": 100,
      "percentage": 9.2
    }
  ]
}
```

#### Framework Detection

Automatically identifies frameworks and libraries:

**Frontend Frameworks**:

- React (and Next.js, Gatsby)
- Vue.js (and Nuxt.js)
- Angular
- Svelte (and SvelteKit)
- Ember.js

**Backend Frameworks**:

- Express.js
- NestJS
- Fastify
- Django
- Flask
- FastAPI
- Spring Boot
- ASP.NET Core
- Laravel
- Ruby on Rails

**Mobile Frameworks**:

- React Native
- Flutter
- Ionic
- Xamarin

**Detection Method**:

```typescript
{
  "frameworks": [
    {
      "name": "Next.js",
      "language": "TypeScript",
      "confidence": 95,
      "category": "fullstack",
      "ecosystem": "web",
      "version": "16.1.5"
    }
  ]
}
```

---

## Security Analysis

### Vulnerability Detection

#### OWASP Top 10 Coverage

Code Guardian provides complete coverage for OWASP Top 10 vulnerabilities:

##### A01:2021 - Broken Access Control

**Detection Capabilities**:

- Missing authorization checks
- Insecure direct object references (IDOR)
- Path traversal vulnerabilities
- Forced browsing attempts
- Missing function-level access control
- Privilege escalation vulnerabilities

**Example Detections**:

```javascript
// Missing authorization check
app.get('/admin/users', (req, res) => {
  // No admin check! - CRITICAL
  const users = await User.findAll();
  res.json(users);
});

// Insecure direct object reference
app.get('/user/:id/profile', (req, res) => {
  // No ownership verification! - HIGH
  const profile = await Profile.findById(req.params.id);
  res.json(profile);
});
```

##### A02:2021 - Cryptographic Failures

**Detection Capabilities**:

- Weak encryption algorithms (DES, RC4, MD5, SHA1)
- Hardcoded cryptographic keys
- Insecure random number generation
- Missing encryption for sensitive data
- Weak password hashing
- Insecure TLS/SSL configuration

**Example Detections**:

```python
# Weak hashing algorithm
import hashlib
password_hash = hashlib.md5(password.encode()).hexdigest()  # HIGH

# Insecure random for security
import random
token = random.randint(1000, 9999)  # HIGH

# Hardcoded encryption key
encryption_key = "my-secret-key-12345"  # CRITICAL
```

##### A03:2021 - Injection

**Detection Capabilities**:

- SQL injection (all database types)
- NoSQL injection
- LDAP injection
- OS command injection
- XML injection
- XPath injection
- Template injection
- Expression language injection

**Example Detections**:

```java
// SQL injection
String query = "SELECT * FROM users WHERE username = '" + username + "'";  // CRITICAL
Statement stmt = connection.createStatement();
ResultSet rs = stmt.executeQuery(query);

// Command injection
Runtime.getRuntime().exec("ping " + userInput);  // CRITICAL

// LDAP injection
String filter = "(uid=" + username + ")";  // HIGH
NamingEnumeration results = ctx.search("ou=users", filter, null);
```

##### A04:2021 - Insecure Design

**Detection Capabilities**:

- Missing rate limiting
- Insufficient anti-automation
- Insecure password reset mechanisms
- Missing security controls
- Insecure workflows
- Trust boundary violations

**Example Detections**:

```typescript
// Missing rate limiting
app.post("/api/login", async (req, res) => {
  // No rate limiting! - HIGH
  const user = await authenticate(req.body);
  res.json({ token: generateToken(user) });
});

// Insecure password reset
app.post("/reset-password", async (req, res) => {
  // No token validation! - CRITICAL
  await User.updatePassword(req.body.email, req.body.newPassword);
});
```

##### A05:2021 - Security Misconfiguration

**Detection Capabilities**:

- Debug mode enabled in production
- Default credentials
- Unnecessary features enabled
- Missing security headers
- Verbose error messages
- Outdated software versions
- Insecure cloud storage permissions

**Example Detections**:

```javascript
// Debug mode in production
if (process.env.NODE_ENV !== "production") {
  app.use(errorHandler({ dumpExceptions: true }));
}

// Missing security headers
app.use(
  helmet({
    // Commented out important headers - MEDIUM
    // contentSecurityPolicy: true,
    // hsts: true,
  })
);

// Verbose error messages
app.use((err, req, res, next) => {
  res.json({ error: err.stack }); // MEDIUM - Exposes stack trace
});
```

##### A06:2021 - Vulnerable and Outdated Components

**Detection Capabilities**:

- Known vulnerable dependencies
- Outdated libraries
- Unmaintained packages
- Deprecated APIs
- Missing security patches
- Transitive dependencies with vulnerabilities

**Example Detections**:

```json
{
  "package": "lodash",
  "version": "4.17.11",
  "vulnerability": "CVE-2019-10744",
  "severity": "HIGH",
  "recommendation": "Upgrade to 4.17.21 or higher"
}
```

##### A07:2021 - Identification and Authentication Failures

**Detection Capabilities**:

- Weak password requirements
- Missing multi-factor authentication
- Insecure session management
- Weak JWT implementations
- Missing account lockout
- Predictable session IDs
- Missing credential validation

**Example Detections**:

```python
# Weak password validation
if len(password) < 6:  # MEDIUM - Too weak
    return False

# Insecure session management
session_id = str(time.time())  # HIGH - Predictable

# Missing password hashing
user.password = password  # CRITICAL - Plaintext storage
```

##### A08:2021 - Software and Data Integrity Failures

**Detection Capabilities**:

- Insecure deserialization
- Missing integrity checks
- Unsigned code execution
- Insecure CI/CD pipelines
- Auto-update without verification
- Missing software signing

**Example Detections**:

```python
# Insecure deserialization
import pickle
data = pickle.loads(user_input)  # CRITICAL

# Missing integrity check
const script = document.createElement('script');
script.src = 'https://cdn.example.com/lib.js';  // MEDIUM - No SRI
document.head.appendChild(script);
```

##### A09:2021 - Security Logging and Monitoring Failures

**Detection Capabilities**:

- Missing security event logging
- Insufficient log details
- No alerting mechanisms
- Missing audit trails
- Inadequate monitoring
- Log injection vulnerabilities

**Example Detections**:

```javascript
// Missing security logging
app.post("/admin/delete-user", async (req, res) => {
  await User.delete(req.params.id);
  // No audit log! - MEDIUM
  res.sendStatus(200);
});

// Log injection
console.log(`User logged in: ${username}`); // LOW - User input in logs
```

##### A10:2021 - Server-Side Request Forgery (SSRF)

**Detection Capabilities**:

- Unvalidated URL parameters
- Internal network access
- Cloud metadata service access
- Port scanning attempts
- DNS rebinding attacks

**Example Detections**:

```javascript
// SSRF vulnerability
app.get("/fetch", async (req, res) => {
  const url = req.query.url; // CRITICAL - No validation
  const response = await fetch(url);
  res.send(await response.text());
});

// Cloud metadata access
fetch("http://169.254.169.254/latest/meta-data/"); // HIGH
```

### Secret Scanning

#### Detected Secret Types

Code Guardian detects 50+ types of secrets and credentials:

##### API Keys and Tokens

**Patterns Detected**:

- AWS Access Keys
- Google API Keys
- GitHub Tokens
- Stripe API Keys
- SendGrid API Keys
- Twilio API Keys
- Firebase Keys
- Azure Connection Strings
- Heroku API Keys
- Slack Tokens
- Discord Tokens
- OpenAI API Keys
- Anthropic API Keys

**Example Detections**:

```javascript
// AWS Access Key
const AWS_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE"; // CRITICAL

// GitHub Token
const GITHUB_TOKEN = "ghp_1234567890abcdefghijklmnopqrstuv"; // CRITICAL

// OpenAI API Key
const OPENAI_KEY = "sk-proj-1234567890abcdefghij"; // CRITICAL

// Stripe Secret Key
const STRIPE_SECRET = "sk_live_1234567890abcdefghij"; // CRITICAL
```

##### Database Credentials

**Patterns Detected**:

- MySQL connection strings
- PostgreSQL connection strings
- MongoDB URIs
- Redis URLs
- SQL Server connection strings
- Oracle database strings

**Example Detections**:

```python
# Database connection string
DATABASE_URL = "postgresql://user:password@localhost:5432/dbname"  # CRITICAL

# MongoDB URI with credentials
MONGO_URI = "mongodb://admin:password123@cluster0.mongodb.net/mydb"  # CRITICAL

# MySQL connection
db = mysql.connect(
    host="localhost",
    user="root",
    password="admin123"  # CRITICAL
)
```

##### Private Keys and Certificates

**Patterns Detected**:

- RSA private keys
- SSH private keys
- PGP private keys
- SSL/TLS certificates
- JWT secrets
- Encryption keys

**Example Detections**:

```
-----BEGIN RSA PRIVATE KEY-----  # CRITICAL
MIIEpAIBAAKCAQEA...
-----END RSA PRIVATE KEY-----

-----BEGIN PRIVATE KEY-----  # CRITICAL
MIIEvQIBADANBgkqhkiG9w0BAQE...
-----END PRIVATE KEY-----
```

##### Authentication Credentials

**Patterns Detected**:

- OAuth tokens
- Session secrets
- JWT secrets
- HMAC secrets
- Basic auth credentials
- Bearer tokens

**Example Detections**:

```javascript
// OAuth token
const OAUTH_TOKEN = "ya29.a0AfH6SMBx..."; // CRITICAL

// JWT secret
const JWT_SECRET = "my-super-secret-key-12345"; // CRITICAL

// Session secret
app.use(
  session({
    secret: "keyboard cat", // HIGH - Weak secret
  })
);
```

##### Cloud Service Credentials

**Patterns Detected**:

- AWS credentials
- Azure keys
- Google Cloud keys
- Digital Ocean tokens
- Cloudflare API keys
- Netlify tokens

**Example Detections**:

```bash
# .env file
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE  # CRITICAL
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY  # CRITICAL
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpoints...  # CRITICAL
```

#### Secret Detection Configuration

Customize secret detection:

```typescript
import { SecretDetectionService } from "@/services/security/secretDetectionService";

const secretService = new SecretDetectionService({
  // Enable/disable specific patterns
  patterns: {
    awsKeys: true,
    githubTokens: true,
    databaseUrls: true,
    privateKeys: true,
    customPatterns: [
      {
        name: "Internal API Key",
        pattern: /INTERNAL_KEY_[A-Za-z0-9]{32}/g,
        severity: "critical",
      },
    ],
  },

  // Exclude patterns (false positives)
  exclude: [/EXAMPLE/, /test@example\.com/, /localhost/],

  // Entropy analysis for unknown secrets
  entropyThreshold: 4.5,
});
```

### Dependency Analysis

#### Vulnerability Database

Code Guardian checks dependencies against:

- **NPM Advisory Database**
- **GitHub Advisory Database**
- **Snyk Vulnerability DB**
- **CVE Database**
- **NVD (National Vulnerability Database)**

#### Dependency Scanning

**Supported Package Managers**:

- npm (package.json, package-lock.json)
- Yarn (yarn.lock)
- pnpm (pnpm-lock.yaml)
- pip (requirements.txt, Pipfile)
- Composer (composer.json, composer.lock)
- Maven (pom.xml)
- Gradle (build.gradle)
- Cargo (Cargo.toml, Cargo.lock)
- Go Modules (go.mod, go.sum)
- NuGet (packages.config, \*.csproj)
- Bundler (Gemfile, Gemfile.lock)

**Example Report**:

```json
{
  "dependencies": {
    "total": 250,
    "direct": 45,
    "transitive": 205,
    "vulnerabilities": {
      "critical": 2,
      "high": 5,
      "medium": 12,
      "low": 8
    }
  },
  "vulnerablePackages": [
    {
      "name": "lodash",
      "version": "4.17.11",
      "vulnerabilities": [
        {
          "id": "CVE-2019-10744",
          "severity": "high",
          "title": "Prototype Pollution",
          "description": "Versions of lodash before 4.17.12 are vulnerable to Prototype Pollution...",
          "cvss": 7.4,
          "cwe": "CWE-1321",
          "patchedVersions": ">=4.17.12",
          "recommendation": "Upgrade to version 4.17.21 or higher"
        }
      ]
    }
  ]
}
```

#### Transitive Dependencies

Analyze nested dependencies:

```
your-project
├── express@4.17.1
│   ├── body-parser@1.19.0
│   │   └── qs@6.7.0 (vulnerable!)
│   └── cookie@0.4.0
└── lodash@4.17.11 (vulnerable!)
```

**Detection Output**:

```
WARNING Found vulnerabilities in transitive dependencies:

lodash@4.17.11 (direct)
  ├── CVE-2019-10744 (HIGH)
  └── CVE-2020-8203 (HIGH)

qs@6.7.0 (via express > body-parser)
  └── CVE-2022-24999 (MEDIUM)
```

### OWASP Compliance

#### Compliance Mapping

Every detected vulnerability is mapped to:

- **OWASP Top 10 2021**
- **OWASP ASVS 4.0**
- **OWASP Mobile Top 10**
- **CWE (Common Weakness Enumeration)**
- **SANS Top 25**

**Example Mapping**:

```json
{
  "vulnerability": {
    "id": "vuln-001",
    "type": "SQL Injection",
    "owasp": {
      "top10": "A03:2021 - Injection",
      "asvs": "V5.3.4",
      "mobile": "M7 - Poor Code Quality"
    },
    "cwe": "CWE-89",
    "sans": "CWE-89: SQL Injection"
  }
}
```

#### Compliance Reports

Generate compliance-ready reports:

```typescript
import { ComplianceReportGenerator } from "@/services/compliance";

const report = await ComplianceReportGenerator.generate({
  standard: "OWASP-ASVS-4.0",
  level: "Level-2", // Level 1, 2, or 3
  includeRemediation: true,
  format: "pdf",
});

// Report includes:
// - Compliance status per requirement
// - Failed controls with evidence
// - Remediation recommendations
// - Executive summary
```

**Compliance Checklist Example**:

```
OWASP ASVS 4.0 Compliance Report

V1: Architecture, Design and Threat Modeling
  PASSED V1.1 Secure SDLC
  PASSED V1.2 Authentication Architecture
  WARNING V1.3 Session Management  (2 findings)
  FAILED V1.4 Access Control      (5 findings)

V2: Authentication
  FAILED V2.1 Password Security   (Critical: Weak hashing)
  PASSED V2.2 General Authenticator
  WARNING V2.3 Authenticator Lifecycle

Overall Compliance: 65% (Level 1)
Findings: 15 Critical, 23 High, 45 Medium
```

---

## API Reference

### Analysis API

#### Analyze Code

Programmatically analyze code:

```typescript
import { EnhancedAnalysisEngine } from "@/services/enhancedAnalysisEngine";

const engine = new EnhancedAnalysisEngine();

// Analyze files
const result = await engine.analyzeFiles({
  files: [
    { filename: "app.js", content: sourceCode },
    { filename: "config.js", content: configCode },
  ],
  options: {
    includeMetrics: true,
    includeDependencies: true,
    includeSecrets: true,
    severityThreshold: "low",
    customRules: [],
  },
});

// Result structure
interface AnalysisResult {
  id: string;
  timestamp: Date;
  summary: {
    totalFiles: number;
    totalLines: number;
    totalIssues: number;
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
    securityScore: number;
    qualityScore: number;
  };
  issues: SecurityIssue[];
  metrics: CodeMetrics;
  languages: LanguageDetection[];
  frameworks: FrameworkInfo[];
  dependencies: DependencyAnalysis;
}
```

#### Multi-Language Parser

Parse code in multiple languages:

```typescript
import { MultiLanguageParser } from "@/services/analysis/MultiLanguageParser";

const parser = new MultiLanguageParser();

// Parse JavaScript/TypeScript
const jsAst = await parser.parse(code, "javascript");

// Parse Python
const pyAst = await parser.parse(code, "python");

// Parse Java
const javaAst = await parser.parse(code, "java");

// Auto-detect and parse
const autoAst = await parser.parseAuto(code, filename);
```

#### Security Analyzer

Run security analysis:

```typescript
import { SecurityAnalyzer } from "@/services/analysis/SecurityAnalyzer";

const analyzer = new SecurityAnalyzer();

const vulnerabilities = await analyzer.analyze({
  ast: parsedAst,
  sourceCode: code,
  language: "javascript",
  filename: "app.js",
  rules: ["sql-injection", "xss", "command-injection", "path-traversal"],
});

// Vulnerability structure
interface SecurityIssue {
  id: string;
  type: SecurityIssueType;
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  description: string;
  line: number;
  column: number;
  file: string;
  code: string;
  recommendation: string;
  cwe: string;
  owasp: string;
  references: string[];
}
```

### AI Services API

#### Natural Language Descriptions

```typescript
import { NaturalLanguageDescriptionService } from '@/services/ai/naturalLanguageDescriptionService';

const nlService = new NaturalLanguageDescriptionService({
  provider: 'openai',
  model: 'gpt-4',
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate description
const description = await nlService.generateDescription({
  issue: securityIssue,
  context: {
    language: 'javascript',
    framework: 'express',
    surroundingCode: contextCode,
  },
  style: 'detailed', // 'brief', 'standard', 'detailed'
});

// Output
{
  "plainEnglish": "Your application is vulnerable to SQL injection...",
  "technicalDetails": "The vulnerability exists because user input...",
  "impact": "An attacker could...",
  "exploitScenario": "Example attack: ...",
  "businessImpact": "This could result in..."
}
```

#### AI Fix Suggestions

```typescript
import { AIFixSuggestionsService } from '@/services/ai/aiFixSuggestionsService';

const fixService = new AIFixSuggestionsService();

const fixes = await fixService.generateFixes({
  vulnerability: securityIssue,
  sourceCode: originalCode,
  language: 'python',
  framework: 'flask',
});

// Output
{
  "fixes": [
    {
      "approach": "Parameterized Query",
      "code": "cursor.execute('SELECT * FROM users WHERE id = ?', [user_id])",
      "explanation": "Use parameterized queries to prevent SQL injection",
      "confidence": 95
    },
    {
      "approach": "ORM",
      "code": "user = User.query.filter_by(id=user_id).first()",
      "explanation": "Use Flask-SQLAlchemy ORM for safer database queries",
      "confidence": 90
    }
  ]
}
```

### Storage API

#### Analysis Storage

```typescript
import { AnalysisStorage } from "@/services/storage/analysisStorage";

const storage = new AnalysisStorage();

// Save analysis
await storage.saveAnalysis(analysisResult);

// Retrieve analysis
const analysis = await storage.getAnalysis(analysisId);

// List all analyses
const analyses = await storage.listAnalyses({
  limit: 10,
  offset: 0,
  sortBy: "timestamp",
  order: "desc",
});

// Delete analysis
await storage.deleteAnalysis(analysisId);

// Clear all analyses
await storage.clearAll();
```

#### Firebase Storage (Optional)

```typescript
import { FirebaseAnalysisStorage } from "@/services/storage/firebaseAnalysisStorage";

const firebaseStorage = new FirebaseAnalysisStorage();

// Save to cloud
await firebaseStorage.save(analysisResult, {
  userId: currentUser.uid,
  projectId: "my-project",
  visibility: "private",
});

// Retrieve from cloud
const cloudAnalysis = await firebaseStorage.get(analysisId);

// Share analysis
await firebaseStorage.share(analysisId, {
  users: ["user@example.com"],
  permissions: "read",
});
```

### Export API

#### PDF Export

```typescript
import { PDFExportService } from "@/services/export/pdfExportService";

const pdfService = new PDFExportService();

// Generate PDF
const pdfBlob = await pdfService.generateReport(analysisResult, {
  template: "detailed",
  includeCharts: true,
  includeCodeSnippets: true,
  includeRecommendations: true,
  branding: {
    logo: logoUrl,
    companyName: "Your Company",
    footer: "Confidential",
  },
});

// Download PDF
const url = URL.createObjectURL(pdfBlob);
const a = document.createElement("a");
a.href = url;
a.download = "security-report.pdf";
a.click();
```

#### JSON Export

```typescript
import { DataExport } from "@/services/export/dataExport";

const exporter = new DataExport();

// Export as JSON
const json = exporter.toJSON(analysisResult);

// Export as CSV
const csv = exporter.toCSV(analysisResult.issues);

// Export as SARIF
const sarif = exporter.toSARIF(analysisResult);
```

### GitHub API

#### Repository Service

```typescript
import { GitHubRepositoryService } from "@/services/githubRepositoryService";

const github = new GitHubRepositoryService(accessToken);

// List repositories
const repos = await github.listRepositories({
  visibility: "all", // 'public', 'private', 'all'
  sort: "updated",
  direction: "desc",
});

// Get repository details
const repo = await github.getRepository("owner", "repo");

// List branches
const branches = await github.listBranches("owner", "repo");

// Get file contents
const file = await github.getFileContents(
  "owner",
  "repo",
  "path/to/file.js",
  "main"
);

// Download repository
const zipBlob = await github.downloadRepository("owner", "repo", "main");
```

#### GitHub Analysis

```typescript
import { GitHubAnalysisService } from "@/services/githubAnalysisService";

const githubAnalysis = new GitHubAnalysisService();

// Analyze repository
const result = await githubAnalysis.analyzeRepository({
  owner: "username",
  repo: "repository",
  branch: "main",
  options: {
    includeTests: false,
    includeDocs: false,
    customRules: [],
  },
});

// Compare repositories
const comparison = await githubAnalysis.compareRepositories([
  { owner: "user1", repo: "repo1" },
  { owner: "user2", repo: "repo2" },
]);
```

---

## Deployment

### Vercel Deployment

#### Quick Deploy

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Xenonesis/code-guardian-report)

#### Manual Deployment

##### 1. Install Vercel CLI

```bash
npm install -g vercel
```

##### 2. Login to Vercel

```bash
vercel login
```

##### 3. Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Environment Variables

Configure environment variables in Vercel dashboard:

1. Go to Project Settings
2. Navigate to Environment Variables
3. Add the following variables:

```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_ENABLE_AI=true
NEXT_PUBLIC_ENABLE_PWA=true
```

#### Custom Domain

1. Go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS records:
   - Type: A, Name: @, Value: 76.76.21.21
   - Type: CNAME, Name: www, Value: cname.vercel-dns.com

#### Vercel Configuration

The `vercel.json` file includes:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm ci",
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30,
      "memory": 1024
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        }
      ]
    }
  ]
}
```

### Docker Deployment

#### Build Docker Image

##### Using Docker CLI

```bash
# Build the image
docker build -t code-guardian:latest .

# Run the container
docker run -p 3000:3000 code-guardian:latest

# Run with environment variables
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_APP_URL=http://localhost:3000 \
  -e NEXT_PUBLIC_ENABLE_AI=true \
  code-guardian:latest
```

##### Using Docker Compose

Create `docker-compose.yml`:

```yaml
version: "3.8"

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_APP_URL=http://localhost:3000
      - NEXT_PUBLIC_ENABLE_AI=true
      - NEXT_PUBLIC_ENABLE_PWA=true
    volumes:
      - ./data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

Run with Docker Compose:

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Multi-Stage Dockerfile

The project includes an optimized multi-stage Dockerfile:

```dockerfile
# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); })"

CMD ["node", "server.js"]
```

#### Docker Best Practices

1. **Use Alpine images** for smaller size
2. **Multi-stage builds** to reduce final image size
3. **Non-root user** for security
4. **Health checks** for container orchestration
5. **Layer caching** for faster builds

### Firebase Deployment

#### Prerequisites

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login
```

#### Initialize Firebase

```bash
# Initialize Firebase in project
firebase init

# Select:
# - Hosting
# - Functions (optional)
# - Firestore (optional)
# - Storage (optional)
```

#### Configuration

Edit `firebase.json`:

```json
{
  "hosting": {
    "public": "out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=3600, must-revalidate"
          },
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          }
        ]
      }
    ]
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs18"
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

#### Build and Deploy

```bash
# Build for static export
npm run build

# Deploy to Firebase
firebase deploy

# Deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore
```

#### Firebase Functions

Deploy serverless functions:

```typescript
// functions/src/index.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const analyzeCode = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  // Perform analysis
  const result = await performAnalysis(data.code);

  // Save to Firestore
  await admin.firestore().collection("analyses").add({
    userId: context.auth.uid,
    result,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  return result;
});
```

### Self-Hosted Deployment

#### Using PM2

PM2 is a production process manager for Node.js applications.

##### Install PM2

```bash
npm install -g pm2
```

##### Create PM2 Ecosystem File

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: "code-guardian",
      script: "npm",
      args: "start",
      cwd: "/path/to/code-guardian-report",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
    },
  ],
};
```

##### Start Application

```bash
# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

##### PM2 Commands

```bash
# Monitor applications
pm2 monit

# View logs
pm2 logs code-guardian

# Restart application
pm2 restart code-guardian

# Stop application
pm2 stop code-guardian

# Delete application
pm2 delete code-guardian
```

#### Using Nginx as Reverse Proxy

##### Install Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

##### Configure Nginx

Create `/etc/nginx/sites-available/code-guardian`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Proxy to Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }

    # Access and error logs
    access_log /var/log/nginx/code-guardian-access.log;
    error_log /var/log/nginx/code-guardian-error.log;
}
```

##### Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/code-guardian /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

#### SSL Certificate with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal (already configured)
sudo certbot renew --dry-run
```

#### Systemd Service

Create `/etc/systemd/system/code-guardian.service`:

```ini
[Unit]
Description=Code Guardian Report
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/code-guardian-report
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=code-guardian
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

Enable and start service:

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable code-guardian

# Start service
sudo systemctl start code-guardian

# Check status
sudo systemctl status code-guardian
```

### Kubernetes Deployment

#### Kubernetes Manifests

##### Deployment

Create `k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: code-guardian
  labels:
    app: code-guardian
spec:
  replicas: 3
  selector:
    matchLabels:
      app: code-guardian
  template:
    metadata:
      labels:
        app: code-guardian
    spec:
      containers:
        - name: code-guardian
          image: your-registry/code-guardian:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: "production"
            - name: NEXT_PUBLIC_APP_URL
              valueFrom:
                configMapKeyRef:
                  name: code-guardian-config
                  key: app-url
          resources:
            requests:
              memory: "512Mi"
              cpu: "500m"
            limits:
              memory: "1Gi"
              cpu: "1000m"
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

##### Service

Create `k8s/service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: code-guardian-service
spec:
  selector:
    app: code-guardian
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
```

##### ConfigMap

Create `k8s/configmap.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: code-guardian-config
data:
  app-url: "https://your-domain.com"
  enable-ai: "true"
  enable-pwa: "true"
```

##### Secrets

Create `k8s/secrets.yaml`:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: code-guardian-secrets
type: Opaque
stringData:
  github-client-secret: "your-github-secret"
  openai-api-key: "your-openai-key"
```

##### Ingress

Create `k8s/ingress.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: code-guardian-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - your-domain.com
      secretName: code-guardian-tls
  rules:
    - host: your-domain.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: code-guardian-service
                port:
                  number: 80
```

#### Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get deployments
kubectl get pods
kubectl get services
kubectl get ingress

# View logs
kubectl logs -f deployment/code-guardian

# Scale deployment
kubectl scale deployment code-guardian --replicas=5
```

---

## Testing

### Unit Testing

#### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- src/services/analysis/SecurityAnalyzer.test.ts
```

#### Test Structure

```typescript
// src/services/analysis/SecurityAnalyzer.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { SecurityAnalyzer } from "./SecurityAnalyzer";

describe("SecurityAnalyzer", () => {
  let analyzer: SecurityAnalyzer;

  beforeEach(() => {
    analyzer = new SecurityAnalyzer();
  });

  describe("SQL Injection Detection", () => {
    it("should detect SQL injection in string concatenation", async () => {
      const code = `
        const query = "SELECT * FROM users WHERE id = " + userId;
        db.execute(query);
      `;

      const issues = await analyzer.analyze(code, "javascript");

      expect(issues).toHaveLength(1);
      expect(issues[0].type).toBe("sql-injection");
      expect(issues[0].severity).toBe("critical");
    });

    it("should not flag parameterized queries", async () => {
      const code = `
        const query = "SELECT * FROM users WHERE id = ?";
        db.execute(query, [userId]);
      `;

      const issues = await analyzer.analyze(code, "javascript");

      expect(issues).toHaveLength(0);
    });
  });

  describe("XSS Detection", () => {
    it("should detect innerHTML assignment with user input", async () => {
      const code = `
        element.innerHTML = userInput;
      `;

      const issues = await analyzer.analyze(code, "javascript");

      expect(issues).toHaveLength(1);
      expect(issues[0].type).toBe("xss");
      expect(issues[0].severity).toBe("critical");
    });
  });
});
```

#### Coverage Report

After running tests with coverage:

```
---------------------------|---------|----------|---------|---------|-------------------
File                       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Lines
---------------------------|---------|----------|---------|---------|-------------------
All files                  |   85.42 |    78.33 |   88.89 |   85.42 |
 services/analysis         |   92.15 |    85.71 |   95.23 |   92.15 |
  SecurityAnalyzer.ts      |   94.73 |    88.88 |   100   |   94.73 | 45-48,89-92
  ASTAnalyzer.ts           |   89.47 |    82.35 |   90.47 |   89.47 | 123-125,234-240
 services/ai               |   78.94 |    70.58 |   82.35 |   78.94 |
  aiService.ts             |   76.47 |    68.75 |   80    |   76.47 | 156-178,289-301
---------------------------|---------|----------|---------|---------|-------------------
```

### Integration Testing

#### E2E ZIP Analysis Test

```bash
# Run E2E ZIP analysis test
npm run test:e2e-zip
```

Test implementation:

```typescript
// scripts/e2e-zip-analysis.ts
import { readFileSync } from "fs";
import { EnhancedAnalysisEngine } from "@/services/enhancedAnalysisEngine";

async function runE2ETest() {
  console.log("Starting E2E ZIP Analysis Test...");

  // Load test ZIP file
  const zipFile = readFileSync("./test-fixtures/sample-project.zip");

  // Initialize engine
  const engine = new EnhancedAnalysisEngine();

  // Perform analysis
  const result = await engine.analyzeZipFile(zipFile);

  // Assertions
  console.assert(result.summary.totalFiles > 0, "Should analyze files");
  console.assert(result.issues.length > 0, "Should find issues");
  console.assert(result.languages.length > 0, "Should detect languages");

  console.log("PASSED E2E test passed");
  console.log(`  Files analyzed: ${result.summary.totalFiles}`);
  console.log(`  Issues found: ${result.issues.length}`);
  console.log(`  Languages: ${result.languages.map((l) => l.name).join(", ")}`);
}

runE2ETest().catch(console.error);
```

#### Multi-Language Testing

```bash
# Run multi-language tests
npm run test:multi-language
```

Test multiple language parsers:

```typescript
// tests/multiLanguageAnalysis.test.ts
import { describe, it, expect } from "vitest";
import { MultiLanguageSecurityAnalyzer } from "@/services/analysis/MultiLanguageSecurityAnalyzer";

describe("Multi-Language Analysis", () => {
  const analyzer = new MultiLanguageSecurityAnalyzer();

  it("should analyze JavaScript code", async () => {
    const code = `
      function login(username, password) {
        const query = "SELECT * FROM users WHERE username = '" + username + "'";
        return db.execute(query);
      }
    `;

    const issues = await analyzer.analyze(code, "javascript");
    expect(issues.some((i) => i.type === "sql-injection")).toBe(true);
  });

  it("should analyze Python code", async () => {
    const code = `
def login(username, password):
    query = f"SELECT * FROM users WHERE username = '{username}'"
    return db.execute(query)
    `;

    const issues = await analyzer.analyze(code, "python");
    expect(issues.some((i) => i.type === "sql-injection")).toBe(true);
  });

  it("should analyze Java code", async () => {
    const code = `
      public void login(String username, String password) {
        String query = "SELECT * FROM users WHERE username = '" + username + "'";
        stmt.executeQuery(query);
      }
    `;

    const issues = await analyzer.analyze(code, "java");
    expect(issues.some((i) => i.type === "sql-injection")).toBe(true);
  });
});
```

### Performance Testing

#### Load Testing

Test analysis performance with large codebases:

```typescript
// tests/performance.test.ts
import { describe, it, expect } from "vitest";
import { EnhancedAnalysisEngine } from "@/services/enhancedAnalysisEngine";

describe("Performance Tests", () => {
  it("should analyze 1000 files in under 30 seconds", async () => {
    const engine = new EnhancedAnalysisEngine();
    const files = generateTestFiles(1000);

    const startTime = Date.now();
    const result = await engine.analyzeFiles(files);
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(30000);
    expect(result.summary.totalFiles).toBe(1000);
  }, 35000);

  it("should handle files up to 10MB", async () => {
    const engine = new EnhancedAnalysisEngine();
    const largeFile = generateLargeFile(10 * 1024 * 1024);

    const result = await engine.analyzeFile(largeFile);

    expect(result).toBeDefined();
  });
});
```

### Test Coverage Goals

| Module             | Target Coverage |
| ------------------ | --------------- |
| Security Analysis  | 90%+            |
| Language Detection | 85%+            |
| AI Services        | 80%+            |
| Storage Services   | 85%+            |
| Export Services    | 80%+            |
| Overall            | 85%+            |

---

## CI/CD Pipeline

### GitHub Actions Workflow

The project includes a comprehensive CI/CD pipeline with multiple jobs:

#### Quality Gate

Runs on every push and pull request:

```yaml
quality-gate:
  name: Quality Gate
  runs-on: ubuntu-latest
  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: "22.x"
        cache: "npm"

    - name: Install dependencies
      run: npm ci

    - name: Type checking
      run: npm run type-check

    - name: Linting
      run: npm run lint

    - name: Run tests
      run: npm run test:coverage

    - name: Upload coverage
      uses: codecov/codecov-action@v3
```

#### Security Audit

Automated security scanning:

```yaml
security-audit:
  name: Security & Compliance Audit
  runs-on: ubuntu-latest
  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Run npm audit
      run: npm audit --audit-level=moderate

    - name: Run Snyk security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

    - name: Dependency review
      uses: actions/dependency-review-action@v3
```

#### CodeQL Analysis

Advanced code scanning:

```yaml
codeql:
  name: CodeQL Analysis
  runs-on: ubuntu-latest
  permissions:
    security-events: write
  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Initialize CodeQL
      uses: github/codeql-action/init@v2
      with:
        languages: javascript, typescript

    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v2
```

#### Performance Audit

Lighthouse CI integration:

```yaml
performance-audit:
  name: Performance & Accessibility Audit
  runs-on: ubuntu-latest
  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Build application
      run: |
        npm ci
        npm run build

    - name: Run Lighthouse CI
      uses: treosh/lighthouse-ci-action@v10
      with:
        urls: |
          http://localhost:3000
          http://localhost:3000/about
          http://localhost:3000/github-analysis
        uploadArtifacts: true
```

#### Deployment Pipeline

Automated deployment on successful builds:

```yaml
deploy-production:
  name: Deploy to Production
  needs: [quality-gate, security-audit]
  if: github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: "--prod"
```

### Continuous Integration Best Practices

#### Branch Protection Rules

Configure in GitHub repository settings:

- **Require pull request reviews**: Minimum 1 approval
- **Require status checks**: All CI jobs must pass
- **Require branches to be up to date**: Prevent merge conflicts
- **Include administrators**: Apply rules to all users
- **Restrict who can push**: Only maintainers

#### Pre-commit Hooks

Using Husky for Git hooks:

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Check for emoji in code
node scripts/no-emoji-check.cjs

# Run lint-staged
npx lint-staged

# Type checking
npm run type-check
```

#### Commit Message Conventions

Follow Conventional Commits:

```
feat: add AI-powered fix suggestions
fix: resolve XSS detection false positives
docs: update deployment guide
style: format code with prettier
refactor: simplify analysis pipeline
test: add integration tests for GitHub API
chore: update dependencies
perf: optimize AST traversal
ci: add CodeQL workflow
```

### Release Automation

#### Semantic Versioning

The project follows semantic versioning (SemVer):

- **MAJOR** (11.x.x): Breaking changes
- **MINOR** (x.1.x): New features, backwards compatible
- **PATCH** (x.x.1): Bug fixes, backwards compatible

#### Automated Releases

Create releases using GitHub Actions:

```yaml
create-release:
  name: Create Release
  if: startsWith(github.ref, 'refs/tags/v')
  runs-on: ubuntu-latest
  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Build changelog
      id: changelog
      uses: mikepenz/release-changelog-builder-action@v3

    - name: Create Release
      uses: actions/create-release@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        tag_name: ${{ github.ref }}
        release_name: Release ${{ github.ref }}
        body: ${{ steps.changelog.outputs.changelog }}
        draft: false
        prerelease: false
```

---

## Performance Optimization

### Build Optimization

#### Bundle Size Reduction

The project implements multiple optimization strategies:

1. **Code Splitting**: Dynamic imports for route-based splitting
2. **Tree Shaking**: Remove unused code
3. **Minification**: Terser for JavaScript, cssnano for CSS
4. **Compression**: Gzip and Brotli compression

**Bundle Analysis Results**:

```
Page                                    Size      First Load JS
┌ ○ /                                   45.2 kB        156 kB
├ ○ /about                              12.3 kB        123 kB
├ ○ /github-analysis                    78.5 kB        189 kB
├ ○ /history                            23.4 kB        134 kB
└ ○ /api/health                         0 B            0 B

+ First Load JS shared by all           110 kB
  ├ chunks/framework-[hash].js          45.2 kB
  ├ chunks/main-[hash].js               32.1 kB
  ├ chunks/pages/_app-[hash].js         28.4 kB
  └ chunks/webpack-[hash].js            4.3 kB
```

#### Image Optimization

```typescript
// next.config.ts
const config = {
  images: {
    domains: ["avatars.githubusercontent.com"],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
};
```

Usage:

```tsx
import Image from "next/image";

<Image src="/logo.svg" alt="Logo" width={200} height={50} priority />;
```

### Runtime Performance

#### React Performance Optimization

```tsx
// Use React.memo for expensive components
export const SecurityDashboard = React.memo(({ data }) => {
  return <div>{/* Complex rendering */}</div>;
});

// Use useCallback for event handlers
const handleAnalysis = useCallback(
  (file: File) => {
    analyzeFile(file);
  },
  [analyzeFile]
);

// Use useMemo for expensive calculations
const securityScore = useMemo(() => {
  return calculateSecurityScore(issues);
}, [issues]);

// Lazy load components
const HeavyChart = lazy(() => import("@/components/HeavyChart"));
```

#### Virtual Scrolling

For large lists:

```tsx
import { useVirtualizer } from "@tanstack/react-virtual";

export function IssueList({ issues }: { issues: SecurityIssue[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: issues.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });

  return (
    <div ref={parentRef} style={{ height: "600px", overflow: "auto" }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <IssueCard issue={issues[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### Web Workers

Offload heavy computation:

```typescript
// workers/analysis.worker.ts
self.addEventListener("message", async (event) => {
  const { code, language } = event.data;

  // Perform heavy analysis
  const result = await analyzeCode(code, language);

  self.postMessage(result);
});

// Usage in component
import { useEffect, useState } from "react";

function useAnalysisWorker() {
  const [worker, setWorker] = useState<Worker | null>(null);

  useEffect(() => {
    const w = new Worker(
      new URL("./workers/analysis.worker.ts", import.meta.url)
    );
    setWorker(w);

    return () => w.terminate();
  }, []);

  const analyze = useCallback(
    (code: string, language: string) => {
      return new Promise((resolve) => {
        if (!worker) return;

        worker.onmessage = (e) => resolve(e.data);
        worker.postMessage({ code, language });
      });
    },
    [worker]
  );

  return { analyze };
}
```

### Caching Strategies

#### Service Worker Caching

```typescript
// src/sw.ts
import { Serwist } from "serwist";

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts-cache",
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
    {
      urlPattern: /^https:\/\/api\.github\.com\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "github-api-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 5, // 5 minutes
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "image-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
  ],
});

serwist.addEventListeners();
```

#### IndexedDB Caching

```typescript
// Cache analysis results
import { openDB } from "idb";

const db = await openDB("code-guardian", 1, {
  upgrade(db) {
    db.createObjectStore("analyses", {
      keyPath: "id",
      autoIncrement: true,
    });
  },
});

// Save analysis
await db.put("analyses", analysisResult);

// Retrieve analysis
const analysis = await db.get("analyses", id);

// Query analyses
const allAnalyses = await db.getAll("analyses");
```

### Web Vitals Optimization

#### Core Web Vitals Targets

| Metric                         | Target  | Current |
| ------------------------------ | ------- | ------- |
| First Contentful Paint (FCP)   | < 1.8s  | 1.2s    |
| Largest Contentful Paint (LCP) | < 2.5s  | 2.1s    |
| First Input Delay (FID)        | < 100ms | 45ms    |
| Cumulative Layout Shift (CLS)  | < 0.1   | 0.05    |
| Time to Interactive (TTI)      | < 3.8s  | 3.2s    |
| Total Blocking Time (TBT)      | < 200ms | 150ms   |

#### Monitoring Web Vitals

```typescript
// src/lib/web-vitals.ts
import { onCLS, onFID, onLCP, onTTFB, onINP } from "web-vitals";

export function reportWebVitals() {
  onCLS((metric) => {
    console.log("CLS:", metric);
    sendToAnalytics("CLS", metric);
  });

  onFID((metric) => {
    console.log("FID:", metric);
    sendToAnalytics("FID", metric);
  });

  onLCP((metric) => {
    console.log("LCP:", metric);
    sendToAnalytics("LCP", metric);
  });

  onTTFB((metric) => {
    console.log("TTFB:", metric);
    sendToAnalytics("TTFB", metric);
  });

  onINP((metric) => {
    console.log("INP:", metric);
    sendToAnalytics("INP", metric);
  });
}

function sendToAnalytics(name: string, metric: any) {
  // Send to your analytics service
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", name, {
      value: Math.round(metric.value),
      event_category: "Web Vitals",
      event_label: metric.id,
      non_interaction: true,
    });
  }
}
```

---

## Progressive Web App

### PWA Features

#### Installation

Code Guardian can be installed as a Progressive Web App on:

- **Desktop**: Windows, macOS, Linux, Chrome OS
- **Mobile**: iOS (Safari), Android (Chrome)

**Installation Process**:

1. Visit the application in a supported browser
2. Look for the "Install" button in the address bar
3. Click "Install" and follow prompts
4. App appears on home screen/desktop

#### Offline Capabilities

The PWA works fully offline with:

- **Complete code analysis**: All analysis runs client-side
- **Report generation**: Create PDF and JSON reports offline
- **History access**: View past analyses
- **Settings management**: Configure preferences

**Offline Strategy**:

```typescript
// Service Worker strategy
const offlineStrategy = {
  pages: "NetworkFirst", // Try network, fallback to cache
  assets: "CacheFirst", // Use cache first for static assets
  api: "NetworkOnly", // API calls require network
  analysis: "CacheFirst", // Cache analysis results
};
```

#### Push Notifications

Enable push notifications for:

- Analysis completion
- New vulnerability alerts
- System updates
- Report generation

**Setup Push Notifications**:

```typescript
import { PushNotificationService } from "@/services/pwa/pushNotificationService";

const pushService = new PushNotificationService();

// Request permission
const permission = await pushService.requestPermission();

if (permission === "granted") {
  // Subscribe to push notifications
  const subscription = await pushService.subscribe();

  // Send subscription to server
  await fetch("/api/push/subscribe", {
    method: "POST",
    body: JSON.stringify(subscription),
  });
}
```

#### Background Sync

Queue operations when offline:

```typescript
import { BackgroundSyncService } from "@/services/pwa/backgroundSyncService";

const syncService = new BackgroundSyncService();

// Queue analysis when offline
await syncService.queueAnalysis({
  files: selectedFiles,
  options: analysisOptions,
});

// Automatically syncs when connection restored
```

### PWA Manifest

The `manifest.json` configures the PWA:

```json
{
  "name": "Code Guardian Report",
  "short_name": "Code Guardian",
  "description": "AI-Powered Security Analysis Platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0070f3",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/favicon-192x192.svg",
      "sizes": "192x192",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    },
    {
      "src": "/favicon-512x512.svg",
      "sizes": "512x512",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/desktop-1.png",
      "sizes": "1920x1080",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile-1.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ],
  "categories": ["development", "productivity", "utilities"],
  "shortcuts": [
    {
      "name": "Analyze Code",
      "short_name": "Analyze",
      "description": "Start code analysis",
      "url": "/?action=analyze",
      "icons": [{ "src": "/icons/analyze.svg", "sizes": "96x96" }]
    },
    {
      "name": "View History",
      "short_name": "History",
      "description": "View analysis history",
      "url": "/history",
      "icons": [{ "src": "/icons/history.svg", "sizes": "96x96" }]
    }
  ]
}
```

---

## Security Best Practices

### Application Security

#### Content Security Policy

Strict CSP implementation:

```typescript
// next.config.ts
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: blob: https:;
  font-src 'self' data: https://fonts.gstatic.com;
  connect-src 'self' https://*.google.com https://*.firebaseio.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`;

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: cspHeader.replace(/\s{2,}/g, " ").trim(),
  },
];
```

#### Authentication Security

Best practices for authentication:

```typescript
// Secure password hashing
import bcrypt from "bcryptjs";

const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

// Secure token generation
import crypto from "crypto";

const generateSecureToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Rate limiting for auth endpoints
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: "Too many authentication attempts, please try again later.",
});

app.use("/api/auth/login", authLimiter);
```

#### Input Validation

Validate all user inputs:

```typescript
import { z } from "zod";

// Define schema
const analysisSchema = z.object({
  files: z.array(z.instanceof(File)),
  options: z.object({
    severity: z.enum(["low", "medium", "high", "critical"]),
    includeTests: z.boolean().optional(),
    customRules: z.array(z.string()).optional(),
  }),
});

// Validate input
try {
  const validatedData = analysisSchema.parse(userInput);
  // Proceed with validated data
} catch (error) {
  // Handle validation error
  console.error("Invalid input:", error);
}
```

#### Secure Data Storage

Encrypt sensitive data:

```typescript
import CryptoJS from "crypto-js";

// Encrypt data before storage
const encryptData = (data: any, key: string) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
};

// Decrypt data after retrieval
const decryptData = (ciphertext: string, key: string) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

// Usage
const encrypted = encryptData(sensitiveData, encryptionKey);
localStorage.setItem("secure_data", encrypted);

const decrypted = decryptData(
  localStorage.getItem("secure_data"),
  encryptionKey
);
```

### API Security

#### API Authentication

Protect API endpoints:

```typescript
// middleware/auth.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function authMiddleware(request: NextRequest) {
  const token = request.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // Attach user to request
    return NextResponse.next();
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
```

#### Rate Limiting

Implement rate limiting:

```typescript
// lib/rate-limit.ts
import { LRUCache } from "lru-cache";

type RateLimitOptions = {
  interval: number;
  uniqueTokenPerInterval: number;
};

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval,
    ttl: options.interval,
  });

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;

        return isRateLimited ? reject() : resolve();
      }),
  };
}

// Usage
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export async function POST(request: NextRequest) {
  const identifier = request.ip ?? "anonymous";

  try {
    await limiter.check(10, identifier); // 10 requests per minute
  } catch {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // Process request
}
```

### Security Auditing

#### Security Scan Schedule

Regular security audits:

- **Daily**: Dependency vulnerability scan
- **Weekly**: Full codebase security analysis
- **Monthly**: Penetration testing
- **Quarterly**: Security architecture review

#### Security Monitoring

Monitor for security incidents:

```typescript
// lib/security-monitor.ts
export class SecurityMonitor {
  private static instance: SecurityMonitor;
  private events: SecurityEvent[] = [];

  static getInstance() {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  logSecurityEvent(event: SecurityEvent) {
    this.events.push({
      ...event,
      timestamp: new Date(),
    });

    // Alert on critical events
    if (event.severity === "critical") {
      this.alertAdmins(event);
    }

    // Store in database
    this.persistEvent(event);
  }

  private async alertAdmins(event: SecurityEvent) {
    // Send alerts via email, Slack, etc.
  }

  private async persistEvent(event: SecurityEvent) {
    // Save to database for auditing
  }
}
```

---

## Troubleshooting

### Common Issues

#### Installation Issues

**Problem**: `npm install` fails with dependency errors

**Solution**:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

**Problem**: Node.js version mismatch

**Solution**:

```bash
# Check current version
node --version

# Install Node.js 22.x using nvm
nvm install 22
nvm use 22
```

#### Build Issues

**Problem**: TypeScript compilation errors

**Solution**:

```bash
# Run type checking to see detailed errors
npm run type-check

# If using VS Code, restart TypeScript server
# Command Palette (Ctrl+Shift+P) > TypeScript: Restart TS Server
```

**Problem**: Out of memory during build

**Solution**:

```bash
# Increase Node.js memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

#### Runtime Issues

**Problem**: Application crashes on large file analysis

**Solution**:

- Reduce file size (split into smaller chunks)
- Exclude test files and documentation
- Increase browser memory limits
- Use chunked analysis mode

**Problem**: PWA not updating

**Solution**:

```javascript
// Force service worker update
navigator.serviceWorker.getRegistrations().then((registrations) => {
  registrations.forEach((registration) => {
    registration.update();
  });
});

// Clear cache
caches.keys().then((names) => {
  names.forEach((name) => caches.delete(name));
});
```

#### GitHub Integration Issues

**Problem**: "403 Forbidden" error when accessing repositories

**Solution**:

- Check OAuth token permissions
- Regenerate GitHub token
- Verify repository access rights
- Check rate limits: https://api.github.com/rate_limit

**Problem**: Repository analysis timeout

**Solution**:

- Analyze smaller branches
- Exclude large binary files
- Use incremental analysis
- Check network connectivity

### Performance Issues

#### Slow Analysis

**Possible Causes**:

- Large codebase (100k+ lines)
- Many dependencies to scan
- Complex AST parsing
- Low system resources

**Solutions**:

```typescript
// Enable performance monitoring
const analyzeWithProfiling = async (files: File[]) => {
  performance.mark("analysis-start");

  const result = await analyze(files);

  performance.mark("analysis-end");
  performance.measure("analysis", "analysis-start", "analysis-end");

  const measure = performance.getEntriesByName("analysis")[0];
  console.log(`Analysis took ${measure.duration}ms`);

  return result;
};

// Optimize analysis options
const optimizedOptions = {
  includeTests: false, // Skip test files
  includeDocs: false, // Skip documentation
  maxFileSize: 1024 * 1024, // 1MB per file limit
  parallelAnalysis: true, // Enable parallel processing
  cacheResults: true, // Cache intermediate results
};
```

#### High Memory Usage

**Solutions**:

- Close unused browser tabs
- Clear analysis history
- Restart browser
- Use incremental analysis mode
- Increase system RAM

### Browser Compatibility

#### Supported Browsers

| Browser | Minimum Version | Recommended |
| ------- | --------------- | ----------- |
| Chrome  | 90+             | Latest      |
| Firefox | 88+             | Latest      |
| Safari  | 14+             | Latest      |
| Edge    | 90+             | Latest      |

#### Browser-Specific Issues

**Safari**:

- Enable "Disable Cross-Origin Restrictions" for local development
- IndexedDB storage limits are more restrictive

**Firefox**:

- Allow pop-ups for PDF downloads
- IndexedDB may require explicit permission

**Mobile Browsers**:

- Large file analysis may be slow
- Consider analyzing on desktop for best performance

### Getting Help

If you encounter issues not covered here:

1. **Check Existing Issues**: Search [GitHub Issues](https://github.com/Xenonesis/code-guardian-report/issues)
2. **Documentation**: Review full documentation in `/md` directory
3. **Create New Issue**: Provide:
   - Environment details (OS, browser, Node.js version)
   - Steps to reproduce
   - Error messages and logs
   - Screenshots if applicable

---

## Contributing

We welcome contributions from the community! Code Guardian Report is open source and thrives on community involvement.

### How to Contribute

#### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/code-guardian-report.git
cd code-guardian-report
```

#### 2. Create a Branch

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or a bug fix branch
git checkout -b fix/bug-description
```

#### 3. Make Changes

- Follow the existing code style
- Write clear, commented code
- Add tests for new features
- Update documentation as needed

#### 4. Test Your Changes

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests
npm run test

# Run E2E tests
npm run test:e2e-zip
```

#### 5. Commit Changes

Follow conventional commit format:

```bash
git add .
git commit -m "feat: add AI-powered vulnerability description"
git commit -m "fix: resolve XSS detection false positive"
git commit -m "docs: update API documentation"
```

#### 6. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

### Contribution Guidelines

#### Code Style

- **TypeScript**: Use strict type checking
- **React**: Use functional components with hooks
- **Formatting**: Prettier configuration is enforced
- **Naming**: Use descriptive, camelCase names

#### Testing Requirements

- Unit tests for new functions
- Integration tests for new features
- E2E tests for critical user flows
- Maintain >85% code coverage

#### Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for public APIs
- Update CHANGELOG.md
- Create examples for new features

### Development Workflow

#### Setting Up Development Environment

```bash
# Install dependencies
npm install

# Setup git hooks
npm run setup-git-hooks

# Start development server
npm run dev
```

#### Code Review Process

1. **Automated Checks**: All CI checks must pass
2. **Manual Review**: At least one maintainer approval required
3. **Testing**: Reviewer tests the changes locally
4. **Documentation**: Verify documentation is updated
5. **Merge**: Squash and merge to main branch

### Areas for Contribution

We especially welcome contributions in these areas:

- **New Language Support**: Add parsers for additional languages
- **Security Rules**: Contribute new vulnerability detection patterns
- **AI Features**: Enhance AI-powered capabilities
- **UI/UX**: Improve user interface and experience
- **Documentation**: Write tutorials and guides
- **Testing**: Add test coverage
- **Performance**: Optimize analysis speed
- **Accessibility**: Improve WCAG compliance

### Recognition

Contributors are recognized in:

- README contributors section
- Release notes
- Project website
- Annual contributor highlights

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

```
MIT License

Copyright (c) 2025 Code Guardian Report Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Third-Party Licenses

This project uses open-source libraries with the following licenses:

- **Next.js**: MIT License
- **React**: MIT License
- **TypeScript**: Apache License 2.0
- **Tailwind CSS**: MIT License
- **Radix UI**: MIT License
- **Framer Motion**: MIT License
- **Babel**: MIT License
- See [package.json](package.json) for complete list

---

## Support

### Getting Help

#### Documentation

- **README**: This file (comprehensive guide)
- **DEPLOYMENT.md**: Detailed deployment instructions
- **SECURITY.md**: Security policies and reporting
- **CONTRIBUTING.md**: Contribution guidelines
- **CODE_OF_CONDUCT.md**: Community standards

#### Community Support

- **GitHub Discussions**: Ask questions and share ideas
- **GitHub Issues**: Report bugs and request features
- **Pull Requests**: Contribute code improvements

#### Professional Support

For enterprise support and consulting:

- Custom feature development
- Integration assistance
- Security auditing services
- Training and workshops
- Priority bug fixes

Contact: [Create an issue](https://github.com/Xenonesis/code-guardian-report/issues/new) with label "enterprise-support"

### Reporting Security Vulnerabilities

If you discover a security vulnerability, please follow responsible disclosure:

1. **DO NOT** open a public issue
2. Email security details privately (see SECURITY.md)
3. Wait for confirmation and guidance
4. Coordinate disclosure timeline

We take security seriously and will respond within 48 hours.

---

## Acknowledgments

### Core Team

- **Aditya Raj** - Project Lead & Core Developer
  - BCA in Cybersecurity, Sushant University
  - Cybersecurity Enthusiast | Full-Stack Developer
  - GitHub: [@Xenonesis](https://github.com/Xenonesis)

### Contributors

Special thanks to all contributors who have helped make Code Guardian Report better:

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- This section is automatically updated by all-contributors bot -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

See the full list of contributors on [GitHub](https://github.com/Xenonesis/code-guardian-report/graphs/contributors).

### Open Source Projects

Built with amazing open-source projects:

- **Next.js** - React framework by Vercel
- **React** - UI library by Meta
- **TypeScript** - Typed JavaScript by Microsoft
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Babel** - JavaScript compiler
- **Framer Motion** - Animation library
- **Recharts** - Charting library

### Inspiration

Inspired by industry-leading security tools:

- SonarQube
- Snyk
- GitHub Advanced Security
- Semgrep
- CodeQL

### Special Thanks

- **GirlScript Summer of Code 2025** - Supporting open source contributions
- **GitHub** - Platform and tools
- **Vercel** - Hosting and deployment
- **Community** - Feedback and contributions

---

## Roadmap

### Version 11.x (Current)

- [x] Multi-language analysis (15+ languages)
- [x] AI-powered fix suggestions
- [x] GitHub integration
- [x] PWA support
- [x] Real-time analysis
- [x] Custom rules engine
- [x] Advanced reporting (PDF, JSON, SARIF)

### Version 12.0 (Q2 2025)

- [ ] **Machine Learning Models**: Train custom ML models for vulnerability detection
- [ ] **IDE Extensions**: VS Code, IntelliJ plugins
- [ ] **CI/CD Native**: GitHub Actions, GitLab CI, Jenkins plugins
- [ ] **Team Collaboration**: Multi-user workspace, shared analyses
- [ ] **Advanced Metrics**: DORA metrics, security debt tracking
- [ ] **API v2**: RESTful API for third-party integrations

### Version 13.0 (Q4 2025)

- [ ] **Enterprise Features**: SSO, RBAC, audit logs
- [ ] **Compliance Modules**: SOC 2, ISO 27001, PCI DSS
- [ ] **Container Scanning**: Docker image vulnerability scanning
- [ ] **Supply Chain Security**: SBOM generation, dependency graphs
- [ ] **Real-time Collaboration**: Live analysis sessions
- [ ] **Mobile Apps**: Native iOS and Android applications

### Long-term Vision

- **Self-healing Code**: Automatic vulnerability patching
- **Predictive Security**: ML-based threat prediction
- **Blockchain Integration**: Immutable security audit trails
- **Quantum-safe Cryptography**: Post-quantum security analysis
- **Global Security Network**: Crowdsourced vulnerability intelligence

### Feature Requests

Have an idea? We'd love to hear it!

1. Check [existing feature requests](https://github.com/Xenonesis/code-guardian-report/issues?q=is%3Aissue+label%3Aenhancement)
2. Create a [new feature request](https://github.com/Xenonesis/code-guardian-report/issues/new?labels=enhancement)
3. Join discussions and vote on features

---

## Appendices

### Appendix A: Environment Variables Reference

Complete list of environment variables:

```bash
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development|production
PORT=3000

# GitHub OAuth
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/github/callback

# Firebase (Optional)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# AI Configuration
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=2000
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-opus-20240229
GOOGLE_AI_API_KEY=...
GOOGLE_AI_MODEL=gemini-pro

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=...

# Feature Flags
NEXT_PUBLIC_ENABLE_AI=true|false
NEXT_PUBLIC_ENABLE_FIREBASE=true|false
NEXT_PUBLIC_ENABLE_PWA=true|false
NEXT_PUBLIC_ENABLE_ANALYTICS=true|false

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_password
```

### Appendix B: Keyboard Shortcuts

| Shortcut       | Action               |
| -------------- | -------------------- |
| `Ctrl/Cmd + K` | Open command palette |
| `Ctrl/Cmd + U` | Upload file          |
| `Ctrl/Cmd + H` | View history         |
| `Ctrl/Cmd + E` | Export report        |
| `Ctrl/Cmd + /` | Toggle help          |
| `Ctrl/Cmd + ,` | Open settings        |
| `Ctrl/Cmd + F` | Search issues        |
| `Esc`          | Close modal          |

### Appendix C: API Rate Limits

| Endpoint        | Rate Limit  | Window   |
| --------------- | ----------- | -------- |
| `/api/analyze`  | 10 requests | 1 minute |
| `/api/github/*` | 30 requests | 1 minute |
| `/api/ai/*`     | 20 requests | 1 minute |
| `/api/export/*` | 15 requests | 1 minute |

### Appendix D: Supported File Types

**Programming Languages**:

- `.js`, `.mjs`, `.cjs`, `.jsx` - JavaScript
- `.ts`, `.tsx`, `.d.ts` - TypeScript
- `.py`, `.pyw`, `.pyi` - Python
- `.java` - Java
- `.cs`, `.csx` - C#
- `.php`, `.phtml` - PHP
- `.rb`, `.rake` - Ruby
- `.go` - Go
- `.rs` - Rust
- `.cpp`, `.cxx`, `.cc`, `.hpp` - C++
- `.c`, `.h` - C
- `.kt`, `.kts` - Kotlin
- `.swift` - Swift
- `.dart` - Dart
- `.scala` - Scala

**Configuration Files**:

- `.json`, `.jsonc` - JSON
- `.yaml`, `.yml` - YAML
- `.toml` - TOML
- `.xml` - XML
- `.ini` - INI
- `.env` - Environment

**Markup & Styling**:

- `.html`, `.htm` - HTML
- `.css`, `.scss`, `.sass` - CSS/SCSS
- `.md`, `.markdown` - Markdown

### Appendix E: Security Controls Reference

Complete list of implemented security controls:

**CWE Coverage**: 250+ Common Weakness Enumerations
**OWASP Top 10**: Complete coverage
**SANS Top 25**: 100% coverage
**PCI DSS**: Relevant controls implemented
**NIST 800-53**: Partial coverage

Detailed security control mapping available in SECURITY.md.

---

## Changelog

### Version 11.0.0 (2025-01-31)

#### Major Features

- Complete rewrite with Next.js 16 App Router
- Enhanced multi-language support (15+ languages)
- AI-powered security insights and fix suggestions
- Progressive Web App capabilities
- GitHub repository integration
- Advanced analytics dashboard
- Custom rules engine
- Multiple export formats (PDF, JSON, SARIF)

#### Improvements

- 300% faster analysis engine
- 50% reduction in bundle size
- Improved accessibility (WCAG 2.1 AA compliant)
- Enhanced mobile experience
- Better error handling and logging

#### Bug Fixes

- Fixed XSS detection false positives
- Resolved memory leaks in large file analysis
- Fixed GitHub OAuth token refresh
- Corrected PDF export formatting issues

See [CHANGELOG.md](md/changelogs.md) for complete version history.

---

## FAQ

### General Questions

**Q: Is Code Guardian Report free?**
A: Yes, Code Guardian Report is open source and free to use under the MIT License.

**Q: Does my code leave my browser?**
A: No, all analysis is performed client-side in your browser. Your code never leaves your device unless you explicitly use cloud features like Firebase storage.

**Q: Can I use this for commercial projects?**
A: Yes, the MIT License allows commercial use.

**Q: What's the difference between this and SonarQube?**
A: Code Guardian focuses on client-side analysis with AI-powered insights, while SonarQube requires server installation. Both are excellent tools for different use cases.

### Technical Questions

**Q: Which programming languages are supported?**
A: JavaScript, TypeScript, Python, Java, C#, PHP, Ruby, Go, Rust, C/C++, Kotlin, Swift, Dart, Scala, and more.

**Q: Can I add custom security rules?**
A: Yes, use the Custom Rules Editor to define organization-specific patterns.

**Q: How accurate is the vulnerability detection?**
A: Detection accuracy varies by vulnerability type, averaging 85-95% with low false positive rates.

**Q: Can I integrate this into my CI/CD pipeline?**
A: Yes, export results in SARIF format for GitHub Actions, GitLab CI, and other CI/CD tools.

### Privacy Questions

**Q: What data is collected?**
A: Only anonymous usage analytics (if enabled). Your code is never transmitted or stored on our servers.

**Q: Is this GDPR compliant?**
A: Yes, the platform is designed with privacy-first principles and GDPR compliance.

**Q: Can I disable analytics?**
A: Yes, set `NEXT_PUBLIC_ENABLE_ANALYTICS=false` in your environment variables.

---

**Made with love by the Code Guardian Team**

**[Star us on GitHub](https://github.com/Xenonesis/code-guardian-report)** | **[Documentation](https://github.com/Xenonesis/code-guardian-report/tree/main/md)** | **[Report Bug](https://github.com/Xenonesis/code-guardian-report/issues)** | **[Request Feature](https://github.com/Xenonesis/code-guardian-report/issues/new?labels=enhancement)**
