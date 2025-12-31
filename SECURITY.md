# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 10.x.x  | :white_check_mark: |
| 9.x.x   | :white_check_mark: |
| < 9.0   | :x:                |

## Reporting a Vulnerability

Please report (suspected) security vulnerabilities to **[security@example.com](mailto:security@example.com)** or through GitHub's private vulnerability reporting feature. You will receive a response from us within 48 hours. If the issue is confirmed, we will release a patch as soon as possible depending on complexity but historically within a few days.

### How to Report

1. **GitHub Private Reporting (Preferred)**: Use GitHub's [private vulnerability reporting](https://github.com/Xenonesis/code-guardian-report/security/advisories/new) feature to submit a security advisory.

2. **Email**: Send details to the security email listed above.

### What to Include

When reporting a vulnerability, please include:

- **Description**: A detailed description of the vulnerability
- **Impact**: What an attacker could potentially achieve
- **Steps to Reproduce**: Clear steps to reproduce the issue
- **Affected Versions**: Which versions are affected
- **Suggested Fix**: If you have suggestions for how to fix the vulnerability

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours.
- **Communication**: We will keep you informed about the progress of fixing and announcing the vulnerability.
- **Credit**: We will credit you in the security advisory (unless you prefer to remain anonymous).

## Security Best Practices

### For Users

- Always use the latest version of Code Guardian Report
- Keep your dependencies up to date
- Review security advisories regularly
- Use environment variables for sensitive configuration

### For Contributors

- Never commit sensitive data (API keys, passwords, tokens)
- Follow secure coding practices
- Report any security concerns immediately
- Review the [CONTRIBUTING.md](./md/CONTRIBUTING.md) guidelines

## Security Measures

This project implements several security measures:

1. **Dependency Management**: Automated dependency updates via Dependabot
2. **Code Scanning**: Automated security scanning with CodeQL
3. **Secret Scanning**: GitHub secret scanning enabled
4. **Branch Protection**: Protected main branch with required reviews
5. **Security Headers**: Proper security headers in production

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine affected versions
2. Audit code to find any similar problems
3. Prepare fixes for all supported versions
4. Release new security fix versions

## Comments on This Policy

If you have suggestions on how this process could be improved, please submit a pull request or open an issue.
