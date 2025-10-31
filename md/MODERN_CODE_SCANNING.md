# Modern Code Scanning Integration

## Overview

Code Guardian now includes industry-standard code scanning capabilities inspired by leading tools like **SonarQube**, **Snyk**, **Checkmarx**, and **Veracode**. This provides enterprise-grade security and quality analysis.

## Features

### 🔍 SonarQube-Style Analysis

Our modern scanning engine implements comprehensive code quality and security analysis:

#### Security Analysis
- **Vulnerability Detection**: Critical security vulnerabilities (SQL Injection, XSS, Command Injection, etc.)
- **Security Hotspots**: Areas requiring security review
- **CWE Mapping**: Common Weakness Enumeration classifications
- **OWASP Top 10**: Alignment with OWASP 2021 categories
- **SANS Top 25**: Coverage of most dangerous software weaknesses

#### Code Quality Analysis
- **Bug Detection**: Reliability issues that cause runtime errors
- **Code Smells**: Maintainability issues making code harder to understand
- **Complexity Metrics**:
  - Cyclomatic Complexity (McCabe)
  - Cognitive Complexity (considers nesting)
  - Maintainability Index (0-100 scale)
- **Code Duplication**: Detection of duplicate code blocks
- **Technical Debt**: Remediation time in minutes/days

#### Quality Gates
Automatic pass/fail conditions based on:
- Zero new vulnerabilities
- Limited bugs (≤5)
- Maintainability Index ≥65%
- Technical Debt Ratio ≤5%
- Code Smells ≤10
- Duplicated Lines ≤3%

### 📊 Ratings System

Similar to SonarQube, we provide A-E ratings for:

#### Security Rating
- **A**: No vulnerabilities
- **B**: 1-2 vulnerabilities
- **C**: 3-5 vulnerabilities
- **D**: 6-10 vulnerabilities
- **E**: 11+ vulnerabilities

#### Reliability Rating
- **A**: No bugs
- **B**: 1-3 bugs
- **C**: 4-7 bugs
- **D**: 8-15 bugs
- **E**: 16+ bugs

#### Maintainability Rating
- **A**: Maintainability Index ≥80%
- **B**: 65-79%
- **C**: 50-64%
- **D**: 35-49%
- **E**: <35%

## Supported Rules

### Security Vulnerabilities (Critical Priority)

1. **SQL Injection (typescript:S2077)**
   - Pattern: Dynamic SQL query construction
   - CWE-89 | OWASP A03:2021
   - Remediation: 30 minutes

2. **Cross-Site Scripting (typescript:S5147)**
   - Pattern: Unsafe HTML manipulation
   - CWE-79 | OWASP A03:2021
   - Remediation: 20 minutes

3. **Command Injection (typescript:S4721)**
   - Pattern: OS command execution with user input
   - CWE-78 | OWASP A03:2021
   - Remediation: 45 minutes

4. **Path Traversal (typescript:S5145)**
   - Pattern: User-controlled file paths
   - CWE-22 | OWASP A01:2021
   - Remediation: 30 minutes

5. **Weak Cryptography (typescript:S4426)**
   - Pattern: MD5/SHA1 usage
   - CWE-327 | OWASP A02:2021
   - Remediation: 15 minutes

6. **Hardcoded Secrets (typescript:S6290)**
   - Pattern: Credentials in source code
   - CWE-798 | OWASP A07:2021
   - Remediation: 20 minutes

### Security Hotspots

7. **Eval Usage (typescript:S1523)**
   - Pattern: Dynamic code execution
   - CWE-95 | OWASP A03:2021
   - Remediation: 30 minutes

8. **Insecure Random (typescript:S2245)**
   - Pattern: Math.random() in security contexts
   - CWE-338 | OWASP A02:2021
   - Remediation: 10 minutes

### Bugs (Reliability Issues)

9. **Null Pointer Dereference (typescript:S2259)**
   - Pattern: Dereferencing nullable values
   - CWE-476
   - Remediation: 15 minutes

10. **Promise Without Catch (typescript:S6544)**
    - Pattern: Unhandled promise rejections
    - Remediation: 10 minutes

### Code Smells (Maintainability)

11. **High Cognitive Complexity (typescript:S3776)**
    - Pattern: Functions with 5+ nested conditions
    - Remediation: 60 minutes

12. **Function Too Long (typescript:S138)**
    - Pattern: Functions with 100+ lines
    - Remediation: 90 minutes

13. **Too Many Parameters (typescript:S107)**
    - Pattern: Functions with 7+ parameters
    - Remediation: 30 minutes

14. **Console Logging (typescript:S2228)**
    - Pattern: console.log in production code
    - Remediation: 2 minutes

15. **Commented Out Code (typescript:S125)**
    - Pattern: Code in comments
    - Remediation: 5 minutes

16. **Magic Numbers (typescript:S109)**
    - Pattern: Hardcoded numeric literals
    - Remediation: 5 minutes

### Performance Issues

17. **Regex in Loop (typescript:S6353)**
    - Pattern: RegExp creation in loops
    - Remediation: 10 minutes

18. **Inefficient Array Methods (typescript:S6582)**
    - Pattern: Chained filter().map()
    - Remediation: 15 minutes

## Metrics Explained

### Cyclomatic Complexity
Measures the number of independent paths through code. Calculated by counting:
- Decision points (if, else if, while, for, case)
- Logical operators (&&, ||)
- Ternary operators (?)

**Target**: ≤15 per function

### Cognitive Complexity
More nuanced than cyclomatic complexity - considers nesting depth and logical operators.
Higher values indicate code that's harder to understand.

**Target**: ≤15 per function

### Maintainability Index
Microsoft's variant calculation:
```
MI = MAX(0, (171 - 5.2 * ln(V) - 0.23 * G - 16.2 * ln(LOC)) * 100 / 171)
```
Where:
- V = Halstead Volume
- G = Cyclomatic Complexity
- LOC = Lines of Code

**Target**: ≥65%

### Technical Debt
Total estimated remediation time for all issues, calculated as:
```
Debt Ratio = (Total Remediation Minutes / (LOC * 0.06)) * 100
```
Assumes 3.6 minutes per 60 lines as baseline.

**Target**: ≤5%

## Usage

### Integration in SecurityAnalyzer

The modern scanning is automatically integrated into the `SecurityAnalyzer.analyzeFile()` method:

```typescript
import { modernCodeScanningService } from '@/services/security/modernCodeScanningService';

// In SecurityAnalyzer.analyzeFile()
const modernAnalysis = modernCodeScanningService.analyzeCode(content, filename, language);
const modernIssues = modernCodeScanningService.convertToSecurityIssues(
  modernAnalysis.issues, 
  filename
);
```

### Using the Dashboard Component

```tsx
import { ModernSecurityDashboard } from '@/components/security/ModernSecurityDashboard';

<ModernSecurityDashboard
  metrics={modernAnalysis.metrics}
  technicalDebt={modernAnalysis.technicalDebt}
  qualityGate={modernAnalysis.qualityGate}
  totalIssues={issues.length}
/>
```

### Direct API Usage

```typescript
import { modernCodeScanningService } from '@/services/security/modernCodeScanningService';

// Analyze code
const result = modernCodeScanningService.analyzeCode(
  fileContent,
  'example.ts',
  'typescript'
);

// Access results
console.log('Quality Gate:', result.qualityGate.passed);
console.log('Metrics:', result.metrics);
console.log('Technical Debt:', result.technicalDebt, 'minutes');
console.log('Issues:', result.issues);

// Get analysis summary
const summary = modernCodeScanningService.getAnalysisSummary(
  result.metrics,
  result.technicalDebt,
  result.qualityGate
);
console.log(summary);
```

## Comparison with Industry Tools

### vs SonarQube
- ✅ Similar rule-based analysis
- ✅ Quality Gates concept
- ✅ A-E rating system
- ✅ Technical debt calculation
- ✅ Complexity metrics
- ⚠️ SonarQube has 600+ rules per language (we have 18 core rules)
- ⚠️ SonarQube has historical tracking (we analyze current state)

### vs Snyk
- ✅ Vulnerability detection
- ✅ Security ratings
- ✅ Fix recommendations
- ⚠️ Snyk focuses more on dependency vulnerabilities

### vs Checkmarx
- ✅ SAST (Static Application Security Testing)
- ✅ CWE/OWASP mapping
- ✅ Code flow analysis
- ⚠️ Checkmarx has more advanced taint analysis

### vs Veracode
- ✅ Security scanning
- ✅ Compliance reporting (CWE, OWASP)
- ✅ Risk ratings
- ⚠️ Veracode includes binary analysis

## Best Practices

### Quality Gate Configuration
Customize thresholds based on project maturity:

**New Projects**:
- Vulnerabilities: 0
- Bugs: ≤3
- Maintainability: ≥70%
- Tech Debt: ≤3%

**Legacy Projects**:
- Vulnerabilities: 0 (non-negotiable)
- Bugs: ≤10
- Maintainability: ≥50%
- Tech Debt: ≤10%

### CI/CD Integration
Recommended approach:
1. Run scan on every commit
2. Block merges if Quality Gate fails
3. Track metrics over time
4. Set progressive improvement targets

### Remediation Priority
1. **Blocker/Critical Vulnerabilities** - Fix immediately
2. **High Severity Issues** - Fix within sprint
3. **Medium Issues** - Schedule in backlog
4. **Low/Info** - Fix during refactoring

## Future Enhancements

Planned additions:
- [ ] Historical trend analysis
- [ ] Custom rule creation
- [ ] Language-specific analyzers (Python, Java, Go)
- [ ] Integration with GitHub Actions
- [ ] SARIF format export
- [ ] Security hotspot review workflow
- [ ] Code coverage integration
- [ ] License compliance checking

## References

- [SonarQube Rules](https://rules.sonarsource.com/)
- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [Cyclomatic Complexity](https://en.wikipedia.org/wiki/Cyclomatic_complexity)
- [Cognitive Complexity](https://www.sonarsource.com/resources/cognitive-complexity/)
- [Maintainability Index](https://docs.microsoft.com/en-us/visualstudio/code-quality/code-metrics-values)

## License

Same as Code Guardian main project.
