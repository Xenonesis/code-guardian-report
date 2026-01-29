# Contributing to Code Guardian Report

Welcome to **Code Guardian v5.9** – a next-generation AI-powered security analysis platform.
We are excited that you want to contribute!

This guide explains how to set up your environment, follow our workflow, and make high-quality contributions.

---

## Code of Conduct

Please read and follow our **Code of Conduct** (CODE_OF_CONDUCT.md).
We are committed to creating a positive and welcoming environment for everyone.

---

## How Can You Contribute?

We welcome:

- **Bug fixes** – improve stability and fix issues
- **Feature enhancements** – new AI features, analytics improvements, UI updates
- **Documentation** – tutorials, guides, and examples
- **Testing** – improve code coverage and reporting

---

## Development Workflow

### 1. Fork the Repository

Click **Fork** on GitHub, then clone your fork:

```
git clone https://github.com/your-username/code-guardian-report.git
cd code-guardian-report
```

### 2. Install Dependencies

```
npm install
```

### 3. Setup Environment

Copy `.env.example` to `.env.local` and configure any required keys.

### 4. Start the Development Server

```
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Create a New Branch

```
git checkout -b feature/your-feature-name
```

Make changes and commit them using clear commit messages.

### 6. Run Lint and Type Checks Before Commit

```
npm run type-check
npm run lint
```

### 7. Push and Open a Pull Request

Push your branch to your fork and open a Pull Request (PR) on the main repository.

---

## Project Structure

```
code-guardian-report/
  src/                # Main source code (React + TypeScript)
  public/             # Static assets
  scripts/            # Automation scripts
  .github/workflows/  # CI/CD automation
```

Key technologies:

- React 18 + TypeScript 5.9
- Vite 6 for development
- Tailwind CSS for styling
- shadcn/ui + Radix UI for components
- Framer Motion for animations

---

## Pull Request Guidelines

- Keep PRs small and focused.
- Reference related issues (e.g., `Fixes #42`).
- Update documentation when adding features.
- Ensure all CI checks pass before requesting a review.

---

## Issue Reporting

If you find a bug, please include:

- Steps to reproduce
- Expected vs. actual behavior
- Screenshots or logs if applicable

For feature requests, describe:

- The problem or use case
- Proposed solution or feature

---

## Community

- Discussions: Use GitHub Discussions for ideas and help.
- Issues: Use GitHub Issues for bugs and features.

---

## License

By contributing, you agree that your contributions will be licensed under the **MIT License** of this repository.
