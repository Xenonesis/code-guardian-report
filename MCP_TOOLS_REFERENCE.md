# Code Guardian MCP Tools - Quick Reference

## 🎯 How to Use in VS Code

1. **Open Copilot Chat**: `Ctrl+Shift+I` or click the chat icon
2. **Ask naturally**: The AI will automatically invoke MCP tools when needed
3. **Be specific**: Mention what you want to scan/analyze

---

## 📋 Tool Categories & Examples

### 🔍 Scanner Agent

#### `scan_file` - Scan Individual Files

**Use when**: You want to check a specific file for vulnerabilities

**Example prompts**:

- "Scan this file for security issues"
- "Check src/components/auth/Login.tsx for vulnerabilities"
- "Analyze app/api/auth/route.ts for security problems"

---

#### `scan_codebase` - Scan Entire Projects

**Use when**: You need a comprehensive security audit

**Example prompts**:

- "Perform a full security scan of this codebase"
- "Scan all files in the src directory"
- "Audit the entire project for security vulnerabilities"

---

#### `detect_secrets` - Find Hardcoded Secrets

**Use when**: You suspect API keys, passwords, or tokens are hardcoded

**Example prompts**:

- "Check for hardcoded secrets in this file"
- "Scan for exposed API keys and credentials"
- "Find any hardcoded passwords or tokens"

---

#### `scan_dependencies` - Check Dependency Vulnerabilities

**Use when**: You want to verify third-party packages are secure

**Example prompts**:

- "Check package.json for vulnerable dependencies"
- "Scan dependencies for known CVEs"
- "Are there any security issues with my npm packages?"

---

### 🌊 DataFlow Agent

#### `analyze_data_flow` - Track Data Movement

**Use when**: You need to understand how data flows through your application

**Example prompts**:

- "Analyze the data flow in this authentication module"
- "Track how user input flows through this API endpoint"
- "Identify potential injection points in this code"

---

### 📊 Metrics Agent

#### `calculate_metrics` - Security Scoring

**Use when**: You want quantitative security metrics

**Example prompts**:

- "Calculate security metrics for this project"
- "What's the overall security score?"
- "Generate a security metrics report"

---

### 💥 ExploitSim Agent

#### `build_exploit_graph` - Visualize Attack Chains

**Use when**: You want to understand how vulnerabilities connect

**Example prompts**:

- "Build an exploit graph for these vulnerabilities"
- "Show me how these security issues could be chained"
- "Visualize the attack paths in this codebase"

---

#### `simulate_exploit` - Test Exploit Scenarios

**Use when**: You want to understand real-world impact

**Example prompts**:

- "Simulate an exploit for this SQL injection vulnerability"
- "How could an attacker exploit this XSS issue?"
- "Demonstrate the impact of this authentication bypass"

---

#### `get_attack_paths` - Identify Attack Routes

**Use when**: You need to know how attackers could reach critical assets

**Example prompts**:

- "What are the possible attack paths to the database?"
- "Show me attack paths from external API to admin panel"
- "Identify routes an attacker could take"

---

### 🩹 PatchGen Agent

#### `generate_patch` - Create Security Fixes

**Use when**: You want automated patch suggestions

**Example prompts**:

- "Generate a patch for this SQL injection vulnerability"
- "Fix this XSS vulnerability"
- "Create a security patch for the authentication bypass"

---

#### `preview_patch` - Review Before Applying

**Use when**: You want to see changes before applying them

**Example prompts**:

- "Preview the patch for this vulnerability"
- "Show me what changes will be made"
- "Review the proposed security fix"

---

#### `apply_patch` - Implement Fixes

**Use when**: You're ready to apply the generated patches

**Example prompts**:

- "Apply the security patch"
- "Implement the fix for this vulnerability"
- "Apply all recommended patches"

---

### ✅ Validation Agent

#### `validate_patch` - Verify Fix Effectiveness

**Use when**: You want to confirm patches actually work

**Example prompts**:

- "Validate that this patch fixes the vulnerability"
- "Check if the security fix is effective"
- "Verify the patch doesn't introduce new issues"

---

#### `run_regression` - Test for Side Effects

**Use when**: You want to ensure patches don't break existing functionality

**Example prompts**:

- "Run regression tests on this patch"
- "Check if this fix breaks anything"
- "Test for unintended consequences"

---

#### `check_confidence` - Assess Patch Quality

**Use when**: You want to know how reliable the fix is

**Example prompts**:

- "What's the confidence level for this patch?"
- "How certain are we that this fix works?"
- "Assess the reliability of this security patch"

---

### ⚡ RiskOptimizer Agent

#### `optimize_patches` - Prioritize by Risk

**Use when**: You have multiple vulnerabilities and need to prioritize

**Example prompts**:

- "Prioritize these vulnerabilities by risk"
- "Which patches should I apply first?"
- "Optimize the remediation order based on risk"

---

### 🧠 Memory Agent

#### `query_memory` - Access Previous Results

**Use when**: You want to reference earlier analysis

**Example prompts**:

- "What vulnerabilities did we find last time?"
- "Show me previous scan results"
- "Recall the security issues from yesterday's analysis"

---

### 🚀 Pipeline Agent

#### `full_security_pipeline` - Complete Analysis

**Use when**: You want end-to-end security assessment

**Example prompts**:

- "Run the full security pipeline"
- "Perform complete security analysis"
- "Execute comprehensive security audit"

---

#### `quick_scan` - Fast Assessment

**Use when**: You need a rapid security check

**Example prompts**:

- "Quick scan this file"
- "Fast security check on this module"
- "Rapid vulnerability assessment"

---

## 💡 Pro Tips

### 1. Combine Tools for Best Results

```
"Run a full security pipeline, then build an exploit graph
for critical findings, and generate patches for high-risk issues"
```

### 2. Be Context-Specific

```
Instead of: "Scan for vulnerabilities"
Use: "Scan the authentication module in src/components/auth/
for OWASP Top 10 vulnerabilities"
```

### 3. Ask for Explanations

```
"Explain why this SQL injection is critical and how the patch fixes it"
```

### 4. Request Prioritization

```
"Scan the codebase and prioritize findings by exploitability and impact"
```

### 5. Iterative Improvement

```
"After applying the patch, rescan to verify the fix and check
for any remaining issues"
```

---

## 🎓 Common Workflows

### Workflow 1: New Code Review

1. `scan_file` - Check the new file
2. `detect_secrets` - Ensure no secrets leaked
3. `validate_patch` - If issues found, validate fixes

### Workflow 2: Pre-Deployment Audit

1. `full_security_pipeline` - Comprehensive scan
2. `build_exploit_graph` - Understand attack chains
3. `optimize_patches` - Prioritize critical fixes
4. `generate_patch` - Create fixes for high-risk issues

### Workflow 3: Incident Response

1. `scan_codebase` - Full assessment
2. `simulate_exploit` - Understand impact
3. `get_attack_paths` - Identify exposure
4. `apply_patch` - Implement emergency fixes

### Workflow 4: Compliance Check

1. `scan_dependencies` - Check third-party risks
2. `calculate_metrics` - Generate compliance scores
3. `detect_secrets` - Verify no credential exposure
4. Document results for audit trail

---

## ⚙️ Advanced Usage

### Custom Analysis Parameters

You can specify parameters in your prompts:

```
"Scan with focus on:
- OWASP Top 10
- Authentication flaws
- Data validation issues
- Rate limiting gaps"
```

### Multi-File Analysis

```
"Compare security posture between:
- src/components/auth/Login.tsx
- src/components/auth/Register.tsx
- src/components/auth/ResetPassword.tsx"
```

### Historical Comparison

```
"Compare current scan results with last week's analysis.
What changed? Are there new vulnerabilities?"
```

---

## 🆘 Troubleshooting

### Tool Not Invoked

- **Problem**: Copilot doesn't use MCP tools
- **Solution**: Restart VS Code, ensure GitHub Copilot Chat is enabled

### Slow Response

- **Problem**: Analysis takes too long
- **Solution**: Use `quick_scan` for large codebases, or scan specific files

### False Positives

- **Problem**: Tool reports non-issues
- **Solution**: Provide more context, ask for validation, or run `validate_patch`

### Missing Tools

- **Problem**: Some tools not available
- **Solution**: Run `npm run mcp:build` and restart VS Code

---

## 📚 Learn More

- **Full Documentation**: `/mcp-setup` page in your browser
- **MCP Protocol**: https://modelcontextprotocol.io
- **Security Best Practices**: See `docs/` directory

---

**Remember**: The MCP tools are designed to augment your security workflow, not replace manual review. Always validate critical findings and test patches thoroughly before deployment.
