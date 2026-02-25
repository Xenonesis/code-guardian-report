# Architecture Documentation

## Code Guardian Report - System Architecture

This document provides a comprehensive overview of the Code Guardian Report system architecture, including technology stack, directory structure, component design, data flow, and security considerations.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [High-Level Architecture](#high-level-architecture)
4. [Directory Structure](#directory-structure)
5. [Key Components](#key-components)
6. [Data Flow](#data-flow)
7. [Security Considerations](#security-considerations)
8. [Scalability & Performance](#scalability--performance)
9. [Deployment Architecture](#deployment-architecture)

---

## Project Overview

**Code Guardian Report** is an enterprise-grade, AI-powered security analysis platform designed to identify vulnerabilities, code quality issues, and security misconfigurations across multiple programming languages.

### Core Objectives

1. **Client-Side Processing**: All code analysis happens in the browser for maximum privacy
2. **Multi-Language Support**: Analyze 15+ programming languages with language-specific patterns
3. **AI-Powered Intelligence**: Leverage AI for context-aware fix suggestions and explanations
4. **Real-Time Analysis**: Provide instant feedback during code analysis
5. **Progressive Web App**: Full offline capabilities and native app-like experience

### Key Features

- OWASP Top 10 vulnerability detection
- Secret scanning for 50+ credential types
- GitHub repository integration
- Custom rules engine
- Multiple export formats (PDF, JSON, SARIF)
- Comprehensive reporting with metrics and visualizations

---

## Technology Stack

### Frontend Technologies

| Technology    | Version | Purpose                         |
| ------------- | ------- | ------------------------------- |
| Next.js       | 16.1.5  | React framework with App Router |
| React         | 19.2.4  | UI library                      |
| TypeScript    | 5.9.3   | Type-safe development           |
| Tailwind CSS  | 4.1.18  | Utility-first CSS framework     |
| Radix UI      | Latest  | Accessible component primitives |
| Framer Motion | 12.29.2 | Animation library               |
| Recharts      | 3.7.0   | Data visualization              |
| Lucide React  | 0.563.0 | Icon library                    |

### Backend Technologies

| Technology         | Version | Purpose                                   |
| ------------------ | ------- | ----------------------------------------- |
| Node.js            | 22.x    | JavaScript runtime                        |
| Next.js API Routes | -       | Serverless API endpoints                  |
| Firebase           | -       | Authentication & cloud storage (optional) |

### Code Analysis Technologies

| Technology      | Version | Purpose                       |
| --------------- | ------- | ----------------------------- |
| @babel/parser   | 7.28.6  | JavaScript/TypeScript parsing |
| @lezer/python   | 1.1.18  | Python language parser        |
| @lezer/java     | 1.1.3   | Java language parser          |
| @lezer/cpp      | 1.1.5   | C++ language parser           |
| web-tree-sitter | 0.26.3  | Multi-language parser         |

### PWA Technologies

| Technology       | Version | Purpose                    |
| ---------------- | ------- | -------------------------- |
| Serwist          | 9.5.0   | Service worker library     |
| Web App Manifest | -       | PWA configuration          |
| Push API         | -       | Browser push notifications |
| Background Sync  | -       | Offline operation queuing  |

### Development Tools

| Technology | Version | Purpose         |
| ---------- | ------- | --------------- |
| ESLint     | 9.39.2  | Code linting    |
| Prettier   | 3.8.1   | Code formatting |
| Vitest     | 4.0.18  | Unit testing    |
| TypeScript | 5.9.3   | Type checking   |

---

## High-Level Architecture

### System Architecture Diagram

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

### Architecture Layers

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

#### 4. Analysis Engine

- **AST Analyzer**: Abstract syntax tree analysis
- **Security Analyzer**: Vulnerability detection
- **Multi-Language Parser**: Language-specific parsing
- **Metrics Calculator**: Code quality metrics
- **Secret Detection**: Credential scanning

---

## Directory Structure

```
code-guardian-report/
├── app/                          # Next.js App Router
│   ├── about/                    # About page
│   ├── api/                      # API routes
│   │   ├── analytics/            # Analytics endpoints
│   │   ├── health/               # Health check
│   │   ├── log-error/            # Error logging
│   │   ├── push/                 # Push notification endpoints
│   │   └── copilot/              # Copilot integration endpoints
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
│   │   ├── analysis/             # Analysis services
│   │   ├── api/                  # API services
│   │   ├── detection/            # Detection services
│   │   ├── export/               # Export services
│   │   ├── monitoring/           # Monitoring services
│   │   ├── notifications/        # Notification services
│   │   ├── pwa/                  # PWA services
│   │   ├── rules/                # Rules engine
│   │   ├── security/             # Security services
│   │   └── storage/              # Storage services
│   ├── styles/                   # CSS styles
│   ├── tests/                    # Test files
│   ├── types/                    # TypeScript types
│   ├── utils/                    # Utility functions
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
├── scripts/                      # Utility scripts
├── md/                           # Markdown documentation
├── CHANGELOG.md                  # Version history
├── ARCHITECTURE.md               # This file
├── API.md                        # API documentation
├── TROUBLESHOOTING.md            # Troubleshooting guide
├── ROADMAP.md                    # Project roadmap
├── DEPLOYMENT.md                 # Deployment guide
├── SECURITY.md                   # Security policy
├── README.md                     # Project documentation
└── package.json                  # Node.js dependencies
```

---

## Key Components

### 1. Analysis Engine

#### EnhancedAnalysisEngine

The core analysis engine that orchestrates the entire analysis pipeline:

```typescript
class EnhancedAnalysisEngine {
  async analyzeFiles(
    files: File[],
    options: AnalysisOptions
  ): Promise<AnalysisResult>;
  async analyzeZipFile(zipFile: Blob): Promise<AnalysisResult>;
  async analyzeRepository(repo: GitHubRepo): Promise<AnalysisResult>;
}
```

**Responsibilities**:

- Coordinate file parsing and language detection
- Orchestrate security analysis across multiple analyzers
- Aggregate results and calculate metrics
- Generate comprehensive reports

#### MultiLanguageParser

Handles parsing for 15+ programming languages:

```typescript
class MultiLanguageParser {
  parse(code: string, language: string): Promise<AST>;
  parseAuto(code: string, filename: string): Promise<AST>;
  detectLanguage(code: string, filename: string): LanguageDetection;
}
```

**Supported Languages**:

- JavaScript/TypeScript
- Python
- Java
- C#/.NET
- PHP
- Ruby
- Go
- Rust
- C/C++
- Kotlin
- Swift
- Dart
- Scala
- HTML/CSS
- SQL

#### SecurityAnalyzer

Detects security vulnerabilities using multiple analysis techniques:

```typescript
class SecurityAnalyzer {
  analyze(
    ast: AST,
    sourceCode: string,
    language: string
  ): Promise<SecurityIssue[]>;
  detectSQLInjection(ast: AST): SecurityIssue[];
  detectXSS(ast: AST): SecurityIssue[];
  detectCommandInjection(ast: AST): SecurityIssue[];
  // ... more detection methods
}
```

**Detection Techniques**:

- Static analysis rules
- Data flow analysis
- Control flow analysis
- Taint analysis
- Pattern matching

### 2. Storage Services

#### AnalysisStorage

IndexedDB-based storage for analysis results:

```typescript
class AnalysisStorage {
  saveAnalysis(result: AnalysisResult): Promise<string>;
  getAnalysis(id: string): Promise<AnalysisResult>;
  listAnalyses(options: ListOptions): Promise<AnalysisResult[]>;
  deleteAnalysis(id: string): Promise<void>;
  clearAll(): Promise<void>;
}
```

#### FirebaseAnalysisStorage

Optional cloud storage using Firebase:

```typescript
class FirebaseAnalysisStorage {
  save(result: AnalysisResult, metadata: StorageMetadata): Promise<void>;
  get(id: string): Promise<AnalysisResult>;
  share(id: string, options: ShareOptions): Promise<void>;
}
```

### 3. AI Services

#### AIService

Main AI service for intelligent features:

```typescript
class AIService {
  generateDescription(issue: SecurityIssue): Promise<string>;
  generateFixes(issue: SecurityIssue): Promise<FixSuggestion[]>;
  chat(message: string, context: AnalysisContext): Promise<string>;
}
```

**Supported AI Providers**:

- OpenAI (GPT-4, GPT-3.5-turbo)
- Anthropic Claude (Claude 3 Opus, Sonnet, Haiku)
- Google Gemini (Gemini Pro, Gemini Ultra)

### 4. GitHub Integration

#### GitHubRepositoryService

Handles GitHub API interactions:

```typescript
class GitHubRepositoryService {
  listRepositories(options: ListOptions): Promise<GitHubRepo[]>;
  getRepository(owner: string, repo: string): Promise<GitHubRepo>;
  getFileContents(
    owner: string,
    repo: string,
    path: string,
    branch: string
  ): Promise<string>;
  downloadRepository(
    owner: string,
    repo: string,
    branch: string
  ): Promise<Blob>;
}
```

### 5. Export Services

#### PDFExportService

Generates PDF reports:

```typescript
class PDFExportService {
  generateReport(result: AnalysisResult, options: PDFOptions): Promise<Blob>;
  generateExecutiveSummary(result: AnalysisResult): Promise<Blob>;
  generateComplianceReport(result: AnalysisResult): Promise<Blob>;
}
```

#### DataExport

Handles various export formats:

```typescript
class DataExport {
  toJSON(result: AnalysisResult): string;
  toCSV(issues: SecurityIssue[]): string;
  toSARIF(result: AnalysisResult): string;
}
```

---

## Data Flow

### Analysis Pipeline

```
┌─────────────┐
│ File Upload │
│ or GitHub   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ File Validation │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Language        │
│ Detection       │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Multi-Language  │
│ Parsing         │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ AST Generation  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Security        │
│ Analysis        │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Secret          │
│ Scanning        │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Dependency      │
│ Analysis        │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Metrics         │
│ Calculation     │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ AI Enhancement  │
│ (Optional)      │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Report          │
│ Generation      │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Storage         │
│ (IndexedDB)     │
└─────────────────┘
```

### Data Flow Description

1. **Input**: User uploads a ZIP file or selects a GitHub repository
2. **Validation**: File is validated for size, format, and content
3. **Language Detection**: Automatic detection of programming languages
4. **Parsing**: Code is parsed into Abstract Syntax Trees (AST)
5. **Security Analysis**: Multiple analyzers scan for vulnerabilities
6. **Secret Scanning**: Pattern matching for exposed credentials
7. **Dependency Analysis**: Package files are scanned for known vulnerabilities
8. **Metrics Calculation**: Code quality metrics are computed
9. **AI Enhancement** (Optional): AI provides descriptions and fix suggestions
10. **Report Generation**: Results are formatted into reports
11. **Storage**: Analysis results are stored in IndexedDB

---

## Security Considerations

### Client-Side Security

#### Content Security Policy (CSP)

Strict CSP implementation to prevent XSS attacks:

```typescript
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https:;
  font-src 'self' data:;
  connect-src 'self' https://*.github.com https://*.firebaseio.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`;
```

#### Security Headers

Comprehensive security headers:

- **X-Frame-Options**: `DENY` - Prevents clickjacking
- **X-Content-Type-Options**: `nosniff` - Prevents MIME sniffing
- **Strict-Transport-Security**: `max-age=31536000` - Forces HTTPS
- **Referrer-Policy**: `strict-origin-when-cross-origin`
- **Permissions-Policy**: Restricts browser feature access

#### Input Validation

All user inputs are validated using Zod schemas:

```typescript
const analysisSchema = z.object({
  files: z.array(z.instanceof(File)),
  options: z.object({
    severity: z.enum(["low", "medium", "high", "critical"]),
    includeTests: z.boolean().optional(),
    customRules: z.array(z.string()).optional(),
  }),
});
```

### Data Privacy

#### Client-Side Processing

- All code analysis happens in the browser
- No code is transmitted to external servers
- Analysis results are stored locally in IndexedDB

#### Optional Cloud Features

Cloud features (Firebase) are opt-in:

- User must explicitly enable Firebase
- Clear disclosure of data usage
- Data encryption at rest and in transit

### API Security

#### Rate Limiting

API endpoints are rate-limited to prevent abuse:

```typescript
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});
```

#### Authentication

GitHub OAuth for secure authentication:

- OAuth 2.0 flow
- Token-based authentication
- Secure token storage

### Vulnerability Detection

#### OWASP Top 10 Coverage

Complete coverage for all OWASP Top 10 vulnerabilities:

- A01: Broken Access Control
- A02: Cryptographic Failures
- A03: Injection
- A04: Insecure Design
- A05: Security Misconfiguration
- A06: Vulnerable Components
- A07: Authentication Failures
- A08: Data Integrity Failures
- A09: Logging Failures
- A10: Server-Side Request Forgery

#### CWE Mapping

All vulnerabilities are mapped to Common Weakness Enumeration (CWE) identifiers for standardized reporting.

---

## Scalability & Performance

### Performance Optimizations

#### Code Splitting

Dynamic imports for route-based splitting:

```typescript
const HeavyChart = lazy(() => import("@/components/HeavyChart"));
```

#### Lazy Loading

On-demand component loading to reduce initial bundle size.

#### Caching Strategies

- **Service Worker**: Intelligent caching of static assets
- **IndexedDB**: Caching of analysis results
- **Local Storage**: User preferences and settings

#### Web Workers

Offload heavy computation to web workers:

```typescript
const worker = new Worker(
  new URL("./workers/analysis.worker.ts", import.meta.url)
);
```

### Performance Metrics

| Metric                         | Target  | Current |
| ------------------------------ | ------- | ------- |
| First Contentful Paint (FCP)   | < 1.8s  | 1.2s    |
| Largest Contentful Paint (LCP) | < 2.5s  | 2.1s    |
| First Input Delay (FID)        | < 100ms | 45ms    |
| Cumulative Layout Shift (CLS)  | < 0.1   | 0.05    |
| Time to Interactive (TTI)      | < 3.8s  | 3.2s    |
| Total Blocking Time (TBT)      | < 200ms | 150ms   |

### Scalability Considerations

#### Client-Side Limitations

- Browser memory limits (typically 2-4GB)
- IndexedDB storage limits (typically 50-80% of disk space)
- JavaScript execution time limits

#### Mitigation Strategies

- Chunked analysis for large codebases
- Progressive loading of results
- Memory-efficient data structures
- Web Worker parallelization

---

## Deployment Architecture

### Vercel Deployment (Recommended)

```
┌─────────────┐
│   Vercel    │
│  Platform   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Edge Network    │
│ (Global CDN)    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Serverless      │
│ Functions       │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Firebase        │
│ (Optional)      │
└─────────────────┘
```

### Docker Deployment

```
┌─────────────┐
│   Docker    │
│  Container  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Node.js Runtime │
│ (v22.x)         │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Next.js App     │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Nginx (Optional)│
│ Reverse Proxy   │
└─────────────────┘
```

### Self-Hosted Deployment

```
┌─────────────┐
│   PM2       │
│ Process     │
│ Manager     │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Node.js Cluster │
│ (Multiple       │
│  Instances)     │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Nginx           │
│ Reverse Proxy   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ SSL/TLS         │
│ (Let's Encrypt) │
└─────────────────┘
```

---

## Conclusion

Code Guardian Report is built with a modern, scalable architecture that prioritizes:

- **Privacy**: Client-side processing ensures code never leaves the user's device
- **Performance**: Optimized for fast analysis and responsive UI
- **Security**: Comprehensive security measures and vulnerability detection
- **Extensibility**: Modular design allows for easy feature additions
- **Maintainability**: Clean code structure and comprehensive documentation

For more information, see:

- [README.md](README.md) - Project overview and getting started
- [API.md](API.md) - API reference documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [SECURITY.md](SECURITY.md) - Security policy
