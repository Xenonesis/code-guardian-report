import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Wand2, Shield, Bug, Code, Zap, FileCode, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AnalysisResults } from '@/hooks/useAnalysis';

interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  category: 'security' | 'quality' | 'performance' | 'general';
  icon: React.ReactNode;
  prompt: string;
  tags: string[];
}

interface PromptGeneratorProps {
  analysisResults?: AnalysisResults | null;
}

const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'security-audit',
    title: 'Security Vulnerability Scanner',
    description: 'Find and fix security issues in your code',
    category: 'security',
    icon: <Shield className="w-4 h-4" />,
    tags: ['Security', 'Vulnerabilities', 'Fix'],
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

Provide practical fixes I can copy-paste into my code.`
  },
  {
    id: 'code-quality',
    title: 'Code Quality Fixer',
    description: 'Improve code quality and fix bad practices',
    category: 'quality',
    icon: <Code className="w-4 h-4" />,
    tags: ['Quality', 'Clean Code', 'Refactor'],
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

Give me clean, readable code I can use immediately.`
  },
  {
    id: 'performance-optimizer',
    title: 'Performance Optimizer',
    description: 'Make code faster while keeping it secure',
    category: 'performance',
    icon: <Zap className="w-4 h-4" />,
    tags: ['Performance', 'Speed', 'Optimization'],
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

Give me production-ready optimized code.`
  },
  {
    id: 'bug-finder',
    title: 'Bug Hunter',
    description: 'Find and fix bugs before they cause problems',
    category: 'quality',
    icon: <Bug className="w-4 h-4" />,
    tags: ['Bugs', 'Errors', 'Debug'],
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

Help me catch bugs before users do.`
  },
  {
    id: 'api-security',
    title: 'API Security Checker',
    description: 'Secure your APIs and endpoints',
    category: 'security',
    icon: <Shield className="w-4 h-4" />,
    tags: ['API', 'Endpoints', 'REST'],
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

Make my APIs bulletproof against attacks.`
  },
  {
    id: 'dependency-checker',
    title: 'Dependency Checker',
    description: 'Find vulnerable packages and outdated dependencies',
    category: 'security',
    icon: <Bug className="w-4 h-4" />,
    tags: ['Dependencies', 'Packages', 'Updates'],
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

Give me exact commands to fix my dependencies safely.`
  }
];

const PromptGenerator: React.FC<PromptGeneratorProps> = ({ analysisResults }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [showAllPrompts, setShowAllPrompts] = useState<boolean>(false);

  const generateCodebasePrompt = () => {
    if (!analysisResults) {
      const basicPrompt = `You are a code security expert. Analyze this code and find all security vulnerabilities and quality issues.

For each issue found:
1. Show the exact problematic code
2. Explain why it's dangerous or bad
3. Provide the fixed code
4. Rate severity: Critical/High/Medium/Low

Format like this:

**ISSUE FOUND:**
Severity: [level]
File: [filename:line]
Problem: [description]

Bad code:
\`\`\`
[current code]
\`\`\`

Fixed code:
\`\`\`
[secure/better code]
\`\`\`

Why fix needed: [explanation]

Give me copy-paste ready fixes for my code.`;
      
      setGeneratedPrompt(basicPrompt);
      return;
    }

    const { issues, totalFiles } = analysisResults;
    const criticalIssues = issues.filter(i => i.severity === 'Critical');
    const highIssues = issues.filter(i => i.severity === 'High');
    const mediumIssues = issues.filter(i => i.severity === 'Medium');
    const lowIssues = issues.filter(i => i.severity === 'Low');
    
    const securityIssues = issues.filter(i => i.type?.toLowerCase().includes('security') || i.type?.toLowerCase().includes('vulnerability'));
    const qualityIssues = issues.filter(i => i.type?.toLowerCase().includes('quality') || i.type?.toLowerCase().includes('smell') || i.type?.toLowerCase().includes('maintainability'));
    const bugIssues = issues.filter(i => i.type?.toLowerCase().includes('bug') || i.type?.toLowerCase().includes('error'));
    
    // Get all unique issue types
    const allIssueTypes = [...new Set(issues.map(i => i.type))].filter(Boolean);
    
    // Get all unique files with issues
    const allFiles = [...new Set(issues.map(i => i.filename))];
    
    // Get OWASP categories if available
    const owaspCategories = [...new Set(issues.map(i => i.owaspCategory).filter(Boolean))];
    
    // Get CWE IDs if available
    const cweIds = [...new Set(issues.map(i => i.cweId).filter(Boolean))];
    
    // Build detailed issue breakdown
    let issueBreakdown = '';
    if (criticalIssues.length > 0) {
      issueBreakdown += `\n\nCRITICAL ISSUES (${criticalIssues.length}):\n`;
      criticalIssues.slice(0, 5).forEach(issue => {
        issueBreakdown += `- ${issue.message} (${issue.filename}:${issue.line})\n`;
      });
      if (criticalIssues.length > 5) issueBreakdown += `... and ${criticalIssues.length - 5} more critical issues\n`;
    }
    
    if (highIssues.length > 0) {
      issueBreakdown += `\n\nHIGH SEVERITY ISSUES (${highIssues.length}):\n`;
      highIssues.slice(0, 5).forEach(issue => {
        issueBreakdown += `- ${issue.message} (${issue.filename}:${issue.line})\n`;
      });
      if (highIssues.length > 5) issueBreakdown += `... and ${highIssues.length - 5} more high severity issues\n`;
    }
    
    if (securityIssues.length > 0) {
      issueBreakdown += `\n\nSECURITY VULNERABILITIES (${securityIssues.length}):\n`;
      securityIssues.slice(0, 5).forEach(issue => {
        issueBreakdown += `- ${issue.message} (${issue.filename}:${issue.line})${issue.owaspCategory ? ` [${issue.owaspCategory}]` : ''}${issue.cweId ? ` [CWE-${issue.cweId}]` : ''}\n`;
      });
      if (securityIssues.length > 5) issueBreakdown += `... and ${securityIssues.length - 5} more security issues\n`;
    }
    
    const customPrompt = `You are a code security and quality expert. I have analyzed my codebase and found specific issues that need fixing.

=== CODEBASE ANALYSIS SUMMARY ===
Total Files Analyzed: ${totalFiles}
Total Issues Found: ${issues.length}

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
${allIssueTypes.map(type => `- ${type}`).join('\n')}

FILES WITH ISSUES:
${allFiles.slice(0, 10).map(file => `- ${file}`).join('\n')}${allFiles.length > 10 ? `\n... and ${allFiles.length - 10} more files` : ''}

${owaspCategories.length > 0 ? `OWASP CATEGORIES FOUND:\n${owaspCategories.map(cat => `- ${cat}`).join('\n')}\n\n` : ''}${cweIds.length > 0 ? `CWE WEAKNESSES FOUND:\n${cweIds.map(cwe => `- CWE-${cwe}`).join('\n')}\n\n` : ''}=== SPECIFIC ISSUES TO FIX ===${issueBreakdown}

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
  };

  const copyToClipboard = async (text: string, title: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${title} prompt ready to use`,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy manually",
        variant: "destructive",
      });
    }
  };



  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'security': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'quality': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'performance': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
            Copy these prompts to Cursor, Windsurf, or Copilot to analyze your code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Wand2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100">Smart Prompt Generator</h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {analysisResults ? 
                          `Generate custom prompt based on your ${analysisResults.issues.length} code issues` :
                          'Generate prompt for general code analysis'
                        }
                      </p>
                    </div>
                  </div>
                  <Button onClick={generateCodebasePrompt} className="bg-blue-600 hover:bg-blue-700">
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Prompt
                  </Button>
                </div>
              </CardContent>
            </Card>
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
                    <CardTitle className="text-sm">Security Vulnerability Scanner</CardTitle>
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
                  {['Security', 'Vulnerabilities', 'Fix'].map((tag) => (
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
              {showAllPrompts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showAllPrompts ? 'Hide Other AI Prompts' : 'Show More AI Prompts'}
              <Badge variant="secondary" className="ml-2">
                {PROMPT_TEMPLATES.length - 1}
              </Badge>
            </Button>
            
            {showAllPrompts && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PROMPT_TEMPLATES.slice(1).map((template) => (
                  <Card 
                    key={template.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {template.icon}
                          <CardTitle className="text-sm">{template.title}</CardTitle>
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
                          <Badge key={tag} variant="outline" className="text-xs">
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-green-600" />
                <CardTitle className="text-green-800 dark:text-green-200">Your Custom Prompt</CardTitle>
              </div>
              <Button
                onClick={() => copyToClipboard(generatedPrompt, 'Custom Codebase Prompt')}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Prompt
              </Button>
            </div>
            <CardDescription className="text-green-700 dark:text-green-300">
              {analysisResults ? 
                `Tailored for your codebase with ${analysisResults.issues.length} detected issues` :
                'General code analysis prompt'
              }
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedTemplate.icon}
                <CardTitle>{selectedTemplate.title}</CardTitle>
              </div>
              <Button
                onClick={() => copyToClipboard(selectedTemplate.prompt, selectedTemplate.title)}
                size="sm"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Prompt
              </Button>
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