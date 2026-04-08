/// <reference lib="webworker" />

import { SecurityIssue } from "../../types/security-types";

interface WorkerFileContent {
  filename: string;
  content: string;
}

interface WorkerAnalysisRequest {
  files: WorkerFileContent[];
  sessionId: string;
}

interface WorkerAnalysisResult {
  fileIssues: SecurityIssue[];
  linesAnalyzed: number;
  errors: string[];
}

// Security rule patterns - simplified version for worker
const SECURITY_PATTERNS = [
  {
    pattern: /SELECT.*FROM.*["'`]\s*\+|query.*["'`]\s*\+/gi,
    severity: "Critical",
    type: "SQL Injection",
    message: "Potential SQL injection vulnerability",
  },
  {
    pattern: /\.query\(["'`].*["'`]\s*\+|\.execute\(["'`].*["'`]\s*\+/gi,
    severity: "Critical",
    type: "SQL Injection",
    message: "SQL query with string concatenation detected",
  },
  {
    pattern: /dangerouslySetInnerHTML|__html:/gi,
    severity: "High",
    type: "XSS",
    message: "dangerouslySetInnerHTML usage detected",
  },
  {
    pattern: /\bexec\s*\(|\bspawn\s*\(|\bexecSync\s*\(/gi,
    severity: "Critical",
    type: "Command Injection",
    message: "Command execution detected",
  },
  {
    pattern:
      /['"]\.\/.*['"]\s*\+|\+\s*['"]\.\/|require\s*\(.*\+|import\s*\(.*\+/gi,
    severity: "High",
    type: "Path Traversal",
    message: "Dynamic module loading with concatenation",
  },
  {
    pattern: /createHash\s*\(\s*["']md5["']|createHash\s*\(\s*["']sha1["']/gi,
    severity: "Medium",
    type: "Weak Cryptography",
    message: "Weak cryptographic algorithm detected",
  },
  {
    pattern: /\beval\s*\(|\bnew\s+Function\s*\(/gi,
    severity: "Critical",
    type: "Code Injection",
    message: "Use of eval() or new Function() detected",
  },
  {
    pattern: /document\.write\s*\(/gi,
    severity: "High",
    type: "XSS",
    message: "document.write() with user input can lead to XSS",
  },
  {
    pattern: /innerHTML\s*=.*\+/gi,
    severity: "High",
    type: "XSS",
    message: "Dynamic innerHTML assignment may lead to XSS",
  },
  {
    pattern: /password\s*[:=]\s*["'][^"']*["']/gi,
    severity: "Critical",
    type: "Hardcoded Credentials",
    message: "Hardcoded password detected in source code",
  },
  {
    pattern: /Math\.random\(\)/gi,
    severity: "Medium",
    type: "Weak Cryptography",
    message: "Math.random() is not cryptographically secure",
  },
  {
    pattern: /href\s*=\s*["']javascript:/gi,
    severity: "Critical",
    type: "XSS",
    message: "Links should not use javascript: protocol",
  },
  {
    pattern:
      /Object\.assign\s*\([^,]+,\s*(?:req\.|request\.|body|params|query)/gi,
    severity: "Critical",
    type: "Prototype Pollution",
    message: "Potential Prototype Pollution vulnerability",
  },
  {
    pattern:
      /(?:JSON\.parse|unserialize|deserialize|yaml\.load)\s*\([^)]*(?:req\.|request\.|body|user)/gi,
    severity: "Critical",
    type: "Insecure Deserialization",
    message: "Unsafe deserialization of user input",
  },
  {
    pattern: /(?:AKIA|ASIA)[0-9A-Z]{16}/g,
    severity: "Critical",
    type: "Hardcoded Secret",
    message: "Hardcoded AWS Access Key detected",
  },
  // Python patterns
  {
    pattern: /exec\s*\(/gi,
    severity: "Critical",
    type: "Code Injection",
    message: "Use of exec() function - potential code injection",
    language: "python",
  },
  {
    pattern: /subprocess\.call\([^)]*shell\s*=\s*True/gi,
    severity: "High",
    type: "Command Injection",
    message: "subprocess with shell=True can lead to command injection",
    language: "python",
  },
  {
    pattern: /os\.system\s*\(/gi,
    severity: "Critical",
    type: "Command Injection",
    message: "os.system() detected - potential command injection",
    language: "python",
  },
  {
    pattern: /pickle\.loads?\s*\(/gi,
    severity: "High",
    type: "Deserialization",
    message: "Unsafe deserialization with pickle detected",
    language: "python",
  },
  {
    pattern: /random\.randint|random\.random|random\.choice/gi,
    severity: "Medium",
    type: "Weak Cryptography",
    message: "random module is not cryptographically secure",
    language: "python",
  },
  {
    pattern: /open\s*\([^)]*['"]\s*\+/gi,
    severity: "High",
    type: "Path Traversal",
    message: "Dynamic file path construction may lead to path traversal",
    language: "python",
  },
];

function detectLanguage(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const langMap: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    mjs: "javascript",
    cjs: "javascript",
    py: "python",
    pyw: "python",
    java: "java",
    php: "php",
    rb: "ruby",
    go: "go",
    cs: "csharp",
    cpp: "cpp",
    c: "cpp",
    h: "cpp",
    hpp: "cpp",
    rs: "rust",
    vue: "vue",
    svelte: "svelte",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    xml: "xml",
    html: "html",
    htm: "html",
    css: "css",
    scss: "scss",
    sass: "sass",
    sh: "bash",
    bash: "bash",
    sql: "sql",
    dockerfile: "dockerfile",
    env: "env",
  };
  return langMap[ext] || "unknown";
}

function analyzeFileContent(
  filename: string,
  content: string
): SecurityIssue[] {
  const issues: SecurityIssue[] = [];
  const language = detectLanguage(filename);
  const lines = content.split("\n");

  for (const rule of SECURITY_PATTERNS) {
    // Skip language-specific rules that don't match
    if (rule.language && rule.language !== language) continue;

    let match;
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);

    while ((match = regex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split("\n").length;

      // Get surrounding context for code snippet
      const start = Math.max(0, match.index - 30);
      const end = Math.min(content.length, match.index + match[0].length + 30);
      const codeSnippet = content.substring(start, end);

      issues.push({
        id: `worker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tool: "Code Guardian",
        type: rule.type,
        severity: rule.severity as "Critical" | "High" | "Medium" | "Low",
        message: rule.message,
        category: "Security",
        filename,
        line: lineNumber,
        codeSnippet: codeSnippet.trim(),
        cweId: "",
        confidence: 75,
        cvssScore:
          rule.severity === "Critical"
            ? 9.0
            : rule.severity === "High"
              ? 7.5
              : rule.severity === "Medium"
                ? 5.0
                : 2.5,
        recommendation: `Review and fix ${rule.type} vulnerability`,
        remediation: {
          description: `Review and fix ${rule.type} vulnerability`,
          effort: "Medium",
          priority: 3,
        },
        riskRating: rule.severity as "Critical" | "High" | "Medium" | "Low",
        impact: `Potential ${rule.type} vulnerability could lead to security breach`,
        likelihood: "Medium",
      });
    }
  }

  // Check for common code quality issues
  const todoRegex = /\bTODO|FIXME|HACK|XXX\b/gi;
  let todoMatch;
  while ((todoMatch = todoRegex.exec(content)) !== null) {
    const lineNumber = content.substring(0, todoMatch.index).split("\n").length;
    issues.push({
      id: `worker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tool: "Code Guardian",
      type: "Code Quality",
      severity: "Low",
      message: `TODO/FIXME comment found: ${todoMatch[0]}`,
      category: "Code Quality",
      filename,
      line: lineNumber,
      codeSnippet: lines[lineNumber - 1]?.trim() || "",
      cweId: "",
      confidence: 90,
      cvssScore: 0,
      recommendation: "Address the TODO comment or remove it",
      remediation: {
        description: "Address the TODO comment or remove it",
        effort: "Low",
        priority: 1,
      },
      riskRating: "Low",
      impact: "Code quality issues may lead to bugs",
      likelihood: "Low",
    });
  }

  return issues;
}

function analyzeFiles(request: WorkerAnalysisRequest): WorkerAnalysisResult {
  const allIssues: SecurityIssue[] = [];
  const errors: string[] = [];
  let totalLines = 0;

  for (const file of request.files) {
    try {
      const issues = analyzeFileContent(file.filename, file.content);
      allIssues.push(...issues);
      totalLines += file.content.split("\n").length;
    } catch (error) {
      errors.push(`Failed to analyze ${file.filename}: ${error}`);
    }
  }

  return {
    fileIssues: allIssues,
    linesAnalyzed: totalLines,
    errors,
  };
}

// Handle messages from main thread
self.onmessage = (event: MessageEvent<WorkerAnalysisRequest>) => {
  const result = analyzeFiles(event.data);
  self.postMessage(result);
};

export {};
