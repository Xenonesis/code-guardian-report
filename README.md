# 🛡️ Code Guardian Report

Code Guardian Report is a **modern, AI-powered static code analysis platform** that helps developers identify **security vulnerabilities, code quality issues, and best-practice violations** across multiple programming languages — all **directly in the browser**.

It combines **AST-based analysis**, **OWASP Top 10 security checks**, **AI-assisted remediation**, and **GitHub integration** into a single powerful developer tool.

---

## 🚀 Quick Start (5 Minutes)

> If you just want to run the project locally, **start here**.  
> You can skip everything else for now.

### Prerequisites

- **Node.js 22.x**
- **npm 9+**
- **Git**

Verify:

````bash
node --version
npm --version
git --version
Clone & Run
git clone https://github.com/Xenonesis/code-guardian-report.git
cd code-guardian-report
npm install
npm run dev
👉 Open http://localhost:3000

🎉 That’s it — the app runs without any configuration.

📌 What Works Without Configuration
You can use these features immediately:

ZIP file code analysis

Multi-language parsing

Security rule engine

Code metrics & reports

Local (client-side) analysis

PDF / JSON / SARIF exports

🧩 Optional Configuration
The following integrations are optional.
Skip them unless you need the feature.

Create .env.local
cp .env.example .env.local
Required
➡️ No environment variables are required to start the app.

🔐 GitHub OAuth (Repository Analysis)
NEXT_PUBLIC_GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
NEXT_PUBLIC_GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/github/callback
☁️ Firebase (Cloud Features)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
🤖 AI Features (Fixes, Explanations, Chatbot)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=

NEXT_PUBLIC_ENABLE_AI=true
NEXT_PUBLIC_ENABLE_AI_FIXES=true
NEXT_PUBLIC_ENABLE_AI_CHATBOT=true
🧠 Key Features
🔍 Static Code Analysis (AST-based)

🛡️ OWASP Top 10 Security Detection

🤖 AI-generated Fix Suggestions

📦 ZIP & GitHub Repository Analysis

🌍 Multi-language Support (15+)

📊 Code Quality & Security Metrics

📄 PDF / JSON / SARIF Reports

⚡ Client-side Processing (Privacy-first)

📱 Progressive Web App (PWA)

🧪 Supported Languages (Highlights)
JavaScript / TypeScript

Python

Java

C / C++

C#

Go

PHP

Ruby

Rust

Each language includes framework detection, security patterns, and best-practice rules.

🔐 Security Coverage
OWASP Top 10 (2021)
Broken Access Control

Injection (SQL, Command, XSS)

Authentication Failures

Insecure Design

Security Misconfiguration

Vulnerable Dependencies

Cryptographic Failures

SSRF, XXE, Path Traversal

🤖 AI-Powered Assistance
AI Capabilities
Natural-language vulnerability explanations

Secure code replacement suggestions

Framework-specific fixes

Interactive chatbot for security questions

Example:

User: Why is this XSS issue critical?
AI: Because it affects user-facing input, allows script injection,
and can lead to session hijacking.
📄 Reports & Exports
PDF (Executive / Technical / Compliance)

JSON (API & automation)

SARIF (GitHub Code Scanning)

🛠️ Development Scripts
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # ESLint
npm run format           # Prettier
npm run test             # Tests
npm run test:coverage    # Coverage
🧱 Tech Stack (Summary)
Frontend
Next.js 16

React 19

TypeScript

Tailwind CSS

Radix UI

Framer Motion

Backend / Analysis
Node.js 22

Babel / Acorn / Tree-sitter

Custom AST & security analyzers

DevOps
GitHub Actions

Vercel

Docker

Firebase (optional)

🤝 Contributing
Contributions are welcome!

Fork the repository

Create a feature branch

Commit changes

Open a Pull Request

Beginner-friendly issues are labeled good first issue.

📜 License
MIT License © Xenonesis


---

## ✅ After Pasting (DO THIS)

```bash
git add README.md
git commit -m "docs: fix getting started instructions and clarify setup"
git push
````
