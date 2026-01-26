/* @jsxImportSource react */
import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Wand2,
  Shield,
  Bug,
  Code,
  Zap,
  FileCode,
  ChevronDown,
  ChevronUp,
  Filter,
  Download,
  Share2,
  Sparkles,
  FileText,
  TestTube,
  BookOpen,
  Layers,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AnalysisResults, SecurityIssue } from "@/hooks/useAnalysis";
import { logger } from "@/utils/logger";

interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  category: "security" | "quality" | "performance" | "general";
  icon: React.ReactNode;
  prompt: string;
  tags: string[];
}

interface PromptGeneratorProps {
  analysisResults?: AnalysisResults | null;
}

const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "security-audit",
    title: "Security Vulnerability Scanner",
    description: "Find and fix security issues in your code",
    category: "security",
    icon: <Shield className="w-4 h-4" />,
    tags: ["Security", "Vulnerabilities", "Fix"],
    prompt: `You are a security expert. Analyze this code and find security vulnerabilities.

For each security issue you find:
1. Show the exact vulnerable code line
2. Explain why it's dangerous
3. Provide the fixed code
4. Rate severity: Critical/High/Medium/Low

Focus on:
- SQL injection
- XSS attacks
- Authentication bypass
- Data exposure
- Input validation
- Access control

Format your response like this:

**VULNERABILITY FOUND:**
Severity: [Level]
File: [filename:line]
Issue: [brief description]

Vulnerable code:
\`\`\`
[show bad code]
\`\`\`

Why dangerous: [explanation]

Fixed code:
\`\`\`
[show secure code]
\`\`\`

Provide practical fixes I can copy-paste into my code.`,
  },
  {
    id: "code-quality",
    title: "Code Quality Fixer",
    description: "Improve code quality and fix bad practices",
    category: "quality",
    icon: <Code className="w-4 h-4" />,
    tags: ["Quality", "Clean Code", "Refactor"],
    prompt: `You are a senior developer. Review this code and fix quality issues.

Find and fix:
- Complex functions (break them down)
- Duplicate code (make it reusable)
- Poor naming (make it clear)
- Missing error handling
- Hard-to-read code
- Performance issues

For each issue:
1. Show the problematic code
2. Explain the problem
3. Provide the improved version

Format like this:

**ISSUE FOUND:**
Problem: [what's wrong]
File: [filename:line]

Bad code:
\`\`\`
[current code]
\`\`\`

Improved code:
\`\`\`
[better version]
\`\`\`

Why better: [explanation]

Give me clean, readable code I can use immediately.`,
  },
  {
    id: "performance-optimizer",
    title: "Performance Optimizer",
    description: "Make code faster while keeping it secure",
    category: "performance",
    icon: <Zap className="w-4 h-4" />,
    tags: ["Performance", "Speed", "Optimization"],
    prompt: `You are a performance expert. Make this code faster while keeping it secure.

Find and fix:
- Slow database queries
- Memory leaks
- Inefficient loops
- Blocking operations
- Large data processing
- Unnecessary API calls

For each optimization:
1. Show the slow code
2. Explain why it's slow
3. Provide the faster version
4. Ensure security isn't compromised

Format like this:

**PERFORMANCE ISSUE:**
Problem: [what's slow]
File: [filename:line]

Slow code:
\`\`\`
[current code]
\`\`\`

Faster code:
\`\`\`
[optimized version]
\`\`\`

Speed improvement: [explanation]
Security check: [still secure? yes/no]

Give me production-ready optimized code.`,
  },
  {
    id: "bug-finder",
    title: "Bug Hunter",
    description: "Find and fix bugs before they cause problems",
    category: "quality",
    icon: <Bug className="w-4 h-4" />,
    tags: ["Bugs", "Errors", "Debug"],
    prompt: `You are a debugging expert. Find bugs in this code that could cause crashes or errors.

Look for:
- Null pointer exceptions
- Array out of bounds
- Memory leaks
- Race conditions
- Logic errors
- Exception handling issues
- Resource cleanup problems

For each bug:
1. Show the buggy code
2. Explain what could go wrong
3. Provide the fixed version

Format like this:

**BUG FOUND:**
Type: [bug type]
File: [filename:line]
Problem: [what will break]

Buggy code:
\`\`\`
[current code]
\`\`\`

What happens: [error scenario]

Fixed code:
\`\`\`
[corrected version]
\`\`\`

Why fix works: [explanation]

Help me catch bugs before users do.`,
  },
  {
    id: "api-security",
    title: "API Security Checker",
    description: "Secure your APIs and endpoints",
    category: "security",
    icon: <Shield className="w-4 h-4" />,
    tags: ["API", "Endpoints", "REST"],
    prompt: `You are an API security expert. Make my API endpoints secure.

Check for:
- Missing authentication
- Weak authorization
- Rate limiting issues
- Input validation gaps
- Data exposure in responses
- CORS misconfigurations
- Insecure HTTP methods

For each API security issue:
1. Show the vulnerable endpoint code
2. Explain the security risk
3. Provide the secure version

Format like this:

**API SECURITY ISSUE:**
Endpoint: [route/path]
Method: [GET/POST/etc.]
Risk: [what attacker can do]
Severity: [Critical/High/Medium/Low]

Vulnerable code:
\`\`\`
[current endpoint code]
\`\`\`

Secure code:
\`\`\`
[protected version]
\`\`\`

Security added: [what protection was added]

Make my APIs bulletproof against attacks.`,
  },
  {
    id: "dependency-checker",
    title: "Dependency Checker",
    description: "Find vulnerable packages and outdated dependencies",
    category: "security",
    icon: <Bug className="w-4 h-4" />,
    tags: ["Dependencies", "Packages", "Updates"],
    prompt: `You are a dependency security expert. Check my packages for vulnerabilities.

Analyze:
- package.json / requirements.txt / composer.json
- Outdated versions
- Known security vulnerabilities
- Abandoned packages
- Safer alternatives

For each risky dependency:
1. Show the current version
2. Explain the security risk
3. Recommend the safe version
4. Provide update command

Format like this:

**RISKY DEPENDENCY:**
Package: [package-name]
Current: [current-version]
Risk: [security issue]
Severity: [Critical/High/Medium/Low]

Vulnerability: [what's wrong]

Safe version: [recommended-version]
Update command: [exact command to run]

Alternative: [better package if needed]

Give me exact commands to fix my dependencies safely.`,
  },
  {
    id: "architecture-review",
    title: "Architecture & Design Review",
    description: "Review code architecture and design patterns",
    category: "quality",
    icon: <Layers className="w-4 h-4" />,
    tags: ["Architecture", "Design Patterns", "Structure"],
    prompt: `You are a senior software architect. Review the codebase architecture and design.

Analyze:
- Code organization and structure
- Design patterns usage
- Separation of concerns
- SOLID principles adherence
- Module coupling and cohesion
- Scalability considerations
- Maintainability issues

For each architectural issue:
1. Describe the current design problem
2. Explain why it's problematic
3. Suggest better architecture
4. Show code examples of improvement

Format like this:

**ARCHITECTURAL ISSUE:**
Problem: [what's wrong with current design]
Impact: [how it affects maintainability/scalability]

Current structure:
\`\`\`
[show current design]
\`\`\`

Recommended structure:
\`\`\`
[show improved design]
\`\`\`

Benefits:
- [improvement 1]
- [improvement 2]

Provide practical refactoring steps.`,
  },
  {
    id: "testing-coverage",
    title: "Testing & Coverage Analyzer",
    description: "Identify missing tests and improve coverage",
    category: "quality",
    icon: <TestTube className="w-4 h-4" />,
    tags: ["Testing", "Unit Tests", "Coverage"],
    prompt: `You are a testing expert. Analyze this code and identify missing tests.

Focus on:
- Untested functions and methods
- Edge cases not covered
- Error handling scenarios
- Integration points
- Critical business logic
- Security-sensitive code

For each area needing tests:
1. Identify what needs testing
2. Explain why it's important
3. Provide complete test cases
4. Include setup and assertions

Format like this:

**MISSING TEST:**
Function: [function name]
File: [filename]
Priority: [High/Medium/Low]
Risk: [what could go wrong without tests]

Test scenarios needed:
- [scenario 1]
- [scenario 2]
- [scenario 3]

Test code:
\`\`\`javascript
describe('[function name]', () => {
  it('should [expected behavior]', () => {
    // Arrange
    const input = [setup test data];
    
    // Act
    const result = functionName(input);
    
    // Assert
    expect(result).toBe([expected value]);
  });
  
  it('should handle edge case: [case]', () => {
    // Test edge case
  });
});
\`\`\`

Provide complete, runnable test code with good coverage.`,
  },
  {
    id: "documentation-generator",
    title: "Documentation Generator",
    description: "Generate comprehensive code documentation",
    category: "general",
    icon: <BookOpen className="w-4 h-4" />,
    tags: ["Documentation", "Comments", "JSDoc"],
    prompt: `You are a technical writer. Generate comprehensive documentation for this code.

Create:
- Function/method documentation (JSDoc/docstrings)
- Parameter descriptions with types
- Return value descriptions
- Usage examples
- Error handling notes
- Side effects warnings

For each function/class:
1. Write clear JSDoc/docstring comments
2. Explain purpose and behavior
3. Document all parameters with types
4. Provide usage examples
5. Note any gotchas or edge cases

Format like this:

**DOCUMENTATION:**

\`\`\`javascript
/**
 * [Brief one-line description]
 * 
 * [Detailed explanation of what the function does,
 * including any important implementation details]
 * 
 * @param {string} paramName - [Description of parameter]
 * @param {number} [optionalParam=10] - [Optional parameter description]
 * @returns {Promise<Object>} [Description of return value]
 * @throws {ValidationError} When input is invalid
 * 
 * @example
 * // Basic usage
 * const result = await myFunction('input', 5);
 * console.log(result); // { success: true, data: [...] }
 * 
 * @example
 * // Edge case handling
 * try {
 *   await myFunction('', 0);
 * } catch (error) {
 *   console.error('Validation failed');
 * }
 */
function myFunction(paramName, optionalParam = 10) {
  // implementation
}
\`\`\`

Make documentation clear, accurate, and helpful for developers.`,
  },
  {
    id: "refactoring-suggestions",
    title: "Refactoring Assistant",
    description: "Suggest code refactoring improvements",
    category: "quality",
    icon: <Sparkles className="w-4 h-4" />,
    tags: ["Refactoring", "Clean Code", "Optimization"],
    prompt: `You are a refactoring expert. Analyze this code and suggest improvements.

Look for:
- Long functions (break them down)
- Duplicate code (DRY principle)
- Complex conditionals (simplify logic)
- Magic numbers/strings (use constants)
- Poor naming (improve clarity)
- Code smells (fix anti-patterns)
- Nested callbacks (use async/await)
- God objects (split responsibilities)

For each refactoring opportunity:
1. Show the code that needs refactoring
2. Explain the code smell
3. Provide the refactored version
4. Explain the benefits

Format like this:

**REFACTORING OPPORTUNITY:**
Smell: [type of code smell]
Complexity: [before/after metrics if applicable]
File: [filename]

Before (problematic):
\`\`\`javascript
// Complex, hard-to-maintain code
function doEverything(data) {
  if (data && data.value > 0) {
    if (data.type === 'A') {
      // 50 lines of logic
    } else if (data.type === 'B') {
      // 50 more lines
    }
  }
}
\`\`\`

After (clean):
\`\`\`javascript
// Clean, maintainable, testable code
function processDataTypeA(data) {
  // Focused logic
}

function processDataTypeB(data) {
  // Focused logic
}

function doEverything(data) {
  if (!isValidData(data)) return;
  
  const processor = DATA_PROCESSORS[data.type];
  return processor(data);
}
\`\`\`

Improvements:
✅ Single Responsibility Principle
✅ Easier to test
✅ Better readability
✅ Reduced complexity
✅ Reusable components

Provide clean, maintainable code following SOLID principles and best practices.`,
  },
];

const PromptGenerator: React.FC<PromptGeneratorProps> = ({
  analysisResults,
}) => {
  const [selectedTemplate, setSelectedTemplate] =
    useState<PromptTemplate | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [showAllPrompts, setShowAllPrompts] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string[]>([
    "Critical",
    "High",
    "Medium",
    "Low",
  ]);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Calculate token count (rough estimate: ~4 chars per token)
  const estimateTokens = (text: string): number => {
    return Math.ceil(text.length / 4);
  };

  // Filter templates by category
  const filteredTemplates = useMemo(() => {
    if (selectedCategory === "all") return PROMPT_TEMPLATES;
    return PROMPT_TEMPLATES.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  const generateCodebasePrompt = () => {
    if (
      !analysisResults ||
      !analysisResults.issues ||
      analysisResults.issues.length === 0
    ) {
      toast({
        title: "No File Uploaded",
        description: "Please upload and analyze a file first.",
        variant: "destructive",
      });
      return;
    }

    const { issues, totalFiles } = analysisResults;

    // Filter issues by selected severity
    const filteredIssues = issues.filter((i) =>
      severityFilter.includes(i.severity)
    );

    if (filteredIssues.length === 0) {
      toast({
        title: "No Issues Match Filter",
        description: "Try adjusting your severity filters.",
        variant: "destructive",
      });
      return;
    }

    const criticalIssues = filteredIssues.filter(
      (i) => i.severity === "Critical"
    );
    const highIssues = filteredIssues.filter((i) => i.severity === "High");
    const mediumIssues = filteredIssues.filter((i) => i.severity === "Medium");
    const lowIssues = filteredIssues.filter((i) => i.severity === "Low");

    const securityIssues = filteredIssues.filter(
      (i) =>
        i.type?.toLowerCase().includes("security") ||
        i.type?.toLowerCase().includes("vulnerability")
    );
    const qualityIssues = filteredIssues.filter(
      (i) =>
        i.type?.toLowerCase().includes("quality") ||
        i.type?.toLowerCase().includes("smell") ||
        i.type?.toLowerCase().includes("maintainability")
    );
    const bugIssues = filteredIssues.filter(
      (i) =>
        i.type?.toLowerCase().includes("bug") ||
        i.type?.toLowerCase().includes("error")
    );

    // Get all unique issue types
    const allIssueTypes = [
      ...new Set(filteredIssues.map((i) => i.type)),
    ].filter(Boolean);

    // Get all unique files with issues
    const allFiles = [...new Set(filteredIssues.map((i) => i.filename))];

    // Get OWASP categories if available
    const owaspCategories = [
      ...new Set(filteredIssues.map((i) => i.owaspCategory).filter(Boolean)),
    ];

    // Get CWE IDs if available
    const cweIds = [
      ...new Set(filteredIssues.map((i) => i.cweId).filter(Boolean)),
    ];

    // Add code snippets for top issues
    const addCodeSnippet = (issue: SecurityIssue | { snippet?: string }): string => {
      const snippet = 'snippet' in issue ? issue.snippet : undefined;
      if (snippet) {
        return `\n  Code snippet:\n  \`\`\`\n  ${snippet}\n  \`\`\``;
      }
      return "";
    };

    // Build detailed issue breakdown
    let issueBreakdown = "";
    if (criticalIssues.length > 0) {
      issueBreakdown += `\n\nCRITICAL ISSUES (${criticalIssues.length}):\n`;
      criticalIssues.slice(0, 3).forEach((issue) => {
        issueBreakdown += `- ${issue.message} (${issue.filename}:${issue.line})${addCodeSnippet(issue)}\n`;
      });
      if (criticalIssues.length > 3)
        issueBreakdown += `... and ${criticalIssues.length - 3} more critical issues\n`;
    }

    if (highIssues.length > 0) {
      issueBreakdown += `\n\nHIGH SEVERITY ISSUES (${highIssues.length}):\n`;
      highIssues.slice(0, 5).forEach((issue) => {
        issueBreakdown += `- ${issue.message} (${issue.filename}:${issue.line})\n`;
      });
      if (highIssues.length > 5)
        issueBreakdown += `... and ${highIssues.length - 5} more high severity issues\n`;
    }

    if (securityIssues.length > 0) {
      issueBreakdown += `\n\nSECURITY VULNERABILITIES (${securityIssues.length}):\n`;
      securityIssues.slice(0, 5).forEach((issue) => {
        issueBreakdown += `- ${issue.message} (${issue.filename}:${issue.line})${issue.owaspCategory ? ` [${issue.owaspCategory}]` : ""}${issue.cweId ? ` [CWE-${issue.cweId}]` : ""}\n`;
      });
      if (securityIssues.length > 5)
        issueBreakdown += `... and ${securityIssues.length - 5} more security issues\n`;
    }

    const customPrompt = `You are a code security and quality expert. I have analyzed my codebase and found specific issues that need fixing.

=== CODEBASE ANALYSIS SUMMARY ===
Total Files Analyzed: ${totalFiles}
Total Issues Found: ${filteredIssues.length}${severityFilter.length < 4 ? ` (filtered by: ${severityFilter.join(", ")})` : ""}

ISSUE BREAKDOWN:
- Critical Issues: ${criticalIssues.length}
- High Severity: ${highIssues.length}
- Medium Severity: ${mediumIssues.length}
- Low Severity: ${lowIssues.length}

ISSUE CATEGORIES:
- Security Vulnerabilities: ${securityIssues.length}
- Code Quality Issues: ${qualityIssues.length}
- Bug/Error Issues: ${bugIssues.length}

ISSUE TYPES DETECTED:
${allIssueTypes.map((type) => `- ${type}`).join("\n")}

FILES WITH ISSUES:
${allFiles
  .slice(0, 10)
  .map((file) => `- ${file}`)
  .join(
    "\n"
  )}${allFiles.length > 10 ? `\n... and ${allFiles.length - 10} more files` : ""}

${owaspCategories.length > 0 ? `OWASP CATEGORIES FOUND:\n${owaspCategories.map((cat) => `- ${cat}`).join("\n")}\n\n` : ""}${cweIds.length > 0 ? `CWE WEAKNESSES FOUND:\n${cweIds.map((cwe) => `- CWE-${cwe}`).join("\n")}\n\n` : ""}=== SPECIFIC ISSUES TO FIX ===${issueBreakdown}

=== YOUR TASK ===
Analyze my code and provide fixes for these exact issues. For each problem you find:

1. Show the exact vulnerable/problematic code
2. Explain why it's dangerous or bad practice
3. Provide the complete fixed code
4. Explain why your fix solves the problem

Format your response like this:

**ISSUE FIXED:**
Severity: [Critical/High/Medium/Low]
File: [exact filename:line number]
Problem: [clear description]
Type: [issue type]

Vulnerable code:
\`\`\`[language]
[show the exact bad code]
\`\`\`

Fixed code:
\`\`\`[language]
[show the complete secure/improved code]
\`\`\`

Why this fix works: [detailed explanation]
Security/Quality improvement: [what this prevents/improves]

=== PRIORITY ORDER ===
1. Fix Critical issues first
2. Then High severity issues
3. Focus on Security vulnerabilities
4. Address Code quality issues
5. Fix remaining bugs

Provide complete, copy-paste ready code fixes that I can implement immediately in my codebase.`;

    setGeneratedPrompt(customPrompt);
    logger.info("Generated custom prompt", {
      issueCount: filteredIssues.length,
      filters: severityFilter,
    });
  };

  const copyToClipboard = async (text: string, title: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${title} prompt ready to use`,
      });
      logger.info("Prompt copied to clipboard", { title, length: text.length });
    } catch (err) {
      logger.error("Failed to copy prompt", err);
      toast({
        title: "Copy failed",
        description: "Please copy manually",
        variant: "destructive",
      });
    }
  };

  // Export prompt as file
  const exportPrompt = (text: string, filename: string) => {
    try {
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Exported!",
        description: `Prompt saved as ${filename}.txt`,
      });
      logger.info("Prompt exported as file", { filename });
    } catch (err) {
      logger.error("Failed to export prompt", err);
      toast({
        title: "Export failed",
        description: "Could not save file",
        variant: "destructive",
      });
    }
  };

  // Share prompt via URL (compress and encode)
  const sharePrompt = async (text: string) => {
    try {
      // Encode prompt to base64 for URL
      const encoded = btoa(encodeURIComponent(text));
      const shareUrl = `${window.location.origin}${window.location.pathname}?prompt=${encoded}`;

      // Copy URL to clipboard
      await navigator.clipboard.writeText(shareUrl);

      toast({
        title: "Share URL Copied!",
        description: "Anyone with this URL can view the prompt",
      });
      logger.info("Prompt share URL created", { urlLength: shareUrl.length });
    } catch (err) {
      logger.error("Failed to create share URL", err);
      toast({
        title: "Share failed",
        description: "Could not generate share URL",
        variant: "destructive",
      });
    }
  };

  // Export as markdown file
  const exportAsMarkdown = (text: string, filename: string) => {
    try {
      const markdownContent = `# AI Code Analysis Prompt\n\n## Generated: ${new Date().toLocaleString()}\n\n---\n\n${text}`;
      const blob = new Blob([markdownContent], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Exported!",
        description: `Prompt saved as ${filename}.md`,
      });
      logger.info("Prompt exported as markdown", { filename });
    } catch (err) {
      logger.error("Failed to export markdown", err);
      toast({
        title: "Export failed",
        description: "Could not save markdown file",
        variant: "destructive",
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "security":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "quality":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "performance":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            AI Code Assistant Prompts
          </CardTitle>
          <CardDescription>
            Copy these prompts to Cursor, Windsurf, or Copilot to analyze your
            code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Wand2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                        Smart Prompt Generator
                      </h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {analysisResults
                          ? `Generate custom prompt based on your ${analysisResults.issues.length} code issues`
                          : "Generate prompt for general code analysis"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setShowFilters(!showFilters)}
                      variant="outline"
                      size="sm"
                      className="border-blue-300 dark:border-blue-700"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                    <Button
                      onClick={generateCodebasePrompt}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      disabled={
                        !analysisResults ||
                        !analysisResults.issues ||
                        analysisResults.issues.length === 0
                      }
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate
                    </Button>
                  </div>
                </div>

                {/* Filters Section */}
                {showFilters && analysisResults && (
                  <div className="mt-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-semibold mb-3 text-blue-900 dark:text-blue-100">
                      Filter by Severity
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {["Critical", "High", "Medium", "Low"].map((severity) => (
                        <Badge
                          key={severity}
                          className={`cursor-pointer transition-all ${
                            severityFilter.includes(severity)
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300"
                          }`}
                          onClick={() => {
                            setSeverityFilter((prev) =>
                              prev.includes(severity)
                                ? prev.filter((s) => s !== severity)
                                : [...prev, severity]
                            );
                          }}
                        >
                          {severity}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      {severityFilter.length === 4
                        ? "All severities selected"
                        : `${severityFilter.length} severity level(s) selected`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Category Filter for Templates */}
          <div className="mb-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">Template Category:</span>
            {["all", "security", "quality", "performance", "general"].map(
              (cat) => (
                <Badge
                  key={cat}
                  className={`cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Badge>
              )
            )}
          </div>

          {/* Default Security Scanner */}
          <div className="mb-4">
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow border-red-200 dark:border-red-800"
              onClick={() => setSelectedTemplate(PROMPT_TEMPLATES[0])}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <CardTitle className="text-sm">
                      Security Vulnerability Scanner
                    </CardTitle>
                  </div>
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    security
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Find and fix security issues in your code
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1">
                  {["Security", "Vulnerabilities", "Fix"].map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Collapsible Section for Other Prompts */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setShowAllPrompts(!showAllPrompts)}
              className="w-full mb-4 flex items-center justify-center gap-2"
            >
              {showAllPrompts ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              {showAllPrompts
                ? "Hide Other AI Prompts"
                : "Show More AI Prompts"}
              <Badge variant="secondary" className="ml-2">
                {filteredTemplates.length - 1}
              </Badge>
            </Button>

            {showAllPrompts && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.slice(1).map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {template.icon}
                          <CardTitle className="text-sm">
                            {template.title}
                          </CardTitle>
                        </div>
                        <Badge className={getCategoryColor(template.category)}>
                          {template.category}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-1">
                        {template.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {generatedPrompt && (
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-green-600" />
                <CardTitle className="text-green-800 dark:text-green-200">
                  Your Custom Prompt
                </CardTitle>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className="text-green-700 dark:text-green-300"
                >
                  ~{estimateTokens(generatedPrompt)} tokens
                </Badge>
                <Button
                  onClick={() =>
                    copyToClipboard(generatedPrompt, "Custom Codebase Prompt")
                  }
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button
                  onClick={() =>
                    exportPrompt(generatedPrompt, "code-guardian-prompt")
                  }
                  variant="outline"
                  size="sm"
                  className="border-green-600 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-950"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button
                  onClick={() => sharePrompt(generatedPrompt)}
                  variant="outline"
                  size="sm"
                  className="border-green-600 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-950"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
            <CardDescription className="text-green-700 dark:text-green-300">
              {analysisResults
                ? `Tailored for your codebase with ${analysisResults.issues.filter((i) => severityFilter.includes(i.severity)).length} detected issues`
                : "General code analysis prompt"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg mb-4 border border-green-200 dark:border-green-800">
              <pre className="whitespace-pre-wrap text-sm font-mono text-green-900 dark:text-green-100">
                {generatedPrompt}
              </pre>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">🚀 Ready to use:</h4>
              <ol className="text-sm space-y-1 text-gray-600 dark:text-gray-300 list-decimal list-inside">
                <li>Copy the prompt above</li>
                <li>Open Cursor, Windsurf, or Copilot</li>
                <li>Paste the prompt + your code</li>
                <li>Get targeted fixes for your issues!</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTemplate && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {selectedTemplate.icon}
                <CardTitle>{selectedTemplate.title}</CardTitle>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">
                  ~{estimateTokens(selectedTemplate.prompt)} tokens
                </Badge>
                <Button
                  onClick={() =>
                    copyToClipboard(
                      selectedTemplate.prompt,
                      selectedTemplate.title
                    )
                  }
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button
                  onClick={() =>
                    exportPrompt(
                      selectedTemplate.prompt,
                      `${selectedTemplate.id}-prompt`
                    )
                  }
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button
                  onClick={() =>
                    exportAsMarkdown(
                      selectedTemplate.prompt,
                      `${selectedTemplate.id}-prompt`
                    )
                  }
                  variant="outline"
                  size="sm"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Markdown
                </Button>
              </div>
            </div>
            <CardDescription>{selectedTemplate.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {selectedTemplate.prompt}
              </pre>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">💡 How to use:</h4>
              <ol className="text-sm space-y-1 text-gray-600 dark:text-gray-300 list-decimal list-inside">
                <li>Copy the prompt above</li>
                <li>Open your AI assistant (Cursor, Windsurf, Copilot)</li>
                <li>Paste the prompt</li>
                <li>Add your code file or paste your code</li>
                <li>Get instant analysis and fixes!</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PromptGenerator;
