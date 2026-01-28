/**
 * Custom Rules Section for About Page
 * Displays information about the custom rules engine feature
 */

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Code, Zap, Users, Target } from "lucide-react";

export const CustomRulesSection: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center">
        <h2 className="mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
          Custom Rules Engine
        </h2>
        <p className="text-muted-foreground mx-auto max-w-3xl text-lg">
          Define your own security rules and patterns. Adapt Code Guardian to
          your unique organizational needs and policies.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="border-2 transition-colors duration-300 hover:border-green-500">
          <CardHeader>
            <Code className="mb-2 h-8 w-8 text-green-600" />
            <CardTitle>Custom Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Create rules using regex, patterns, or AST queries. Target
              specific code patterns unique to your codebase.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-2 transition-colors duration-300 hover:border-blue-500">
          <CardHeader>
            <Target className="mb-2 h-8 w-8 text-blue-600" />
            <CardTitle>Company Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Enforce company-specific security policies and coding standards
              automatically across all projects.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-2 transition-colors duration-300 hover:border-purple-500">
          <CardHeader>
            <Users className="mb-2 h-8 w-8 text-purple-600" />
            <CardTitle>Share & Collaborate</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Share rules with your team or make them public for the community.
              Import rules from others.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Benefits Section */}
      <Card className="border-2 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-600" />
            Why Custom Rules?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h4 className="text-foreground mb-2 font-semibold">
                Adaptability
              </h4>
              <p className="text-muted-foreground text-sm">
                Every organization has unique security requirements. Custom
                rules let you enforce policies specific to your industry,
                frameworks, and internal standards.
              </p>
            </div>

            <div>
              <h4 className="text-foreground mb-2 font-semibold">
                Increased Stickiness
              </h4>
              <p className="text-muted-foreground text-sm">
                The more custom rules you create, the more valuable Code
                Guardian becomes to your team. Your investment in rule creation
                increases platform value over time.
              </p>
            </div>

            <div>
              <h4 className="text-foreground mb-2 font-semibold">
                Differentiation
              </h4>
              <p className="text-muted-foreground text-sm">
                Generic scanners can't catch everything. Custom rules let you
                detect vulnerabilities and anti-patterns that are specific to
                your technology stack.
              </p>
            </div>

            <div>
              <h4 className="text-foreground mb-2 font-semibold">
                Knowledge Base
              </h4>
              <p className="text-muted-foreground text-sm">
                Build an institutional knowledge base of security patterns and
                anti-patterns. Onboard new developers faster with automated
                policy enforcement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rule Types Explanation */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Rule Types Explained</CardTitle>
          <CardDescription>
            Understanding different types of custom rules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-foreground mb-2 font-semibold">Regex Rules</h4>
            <p className="text-muted-foreground mb-2 text-sm">
              Use regular expressions to match code patterns. Best for simple
              text-based patterns.
            </p>
            <code className="bg-muted block rounded p-2 text-xs">
              Pattern: api[_-]?key\s*=\s*["']([^"']+)["']
            </code>
            <p className="text-muted-foreground mt-1 text-xs">
              Example: Detect hardcoded API keys
            </p>
          </div>

          <div>
            <h4 className="text-foreground mb-2 font-semibold">
              Pattern Rules
            </h4>
            <p className="text-muted-foreground mb-2 text-sm">
              Simplified pattern matching with wildcards. Good for common code
              smells.
            </p>
            <code className="bg-muted block rounded p-2 text-xs">
              Pattern: console.log
            </code>
            <p className="text-muted-foreground mt-1 text-xs">
              Example: Find console.log statements in production code
            </p>
          </div>

          <div>
            <h4 className="text-foreground mb-2 font-semibold">
              AST Query Rules
            </h4>
            <p className="text-muted-foreground mb-2 text-sm">
              Advanced rules using Abstract Syntax Tree queries. Most powerful
              and precise.
            </p>
            <code className="bg-muted block rounded p-2 text-xs">
              Selector: FunctionDeclaration[async=true]:not(:has(TryStatement))
            </code>
            <p className="text-muted-foreground mt-1 text-xs">
              Example: Find async functions without error handling
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Use Cases */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Common Use Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h4 className="text-foreground mb-2 font-semibold">
                🔐 Security
              </h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• Detect hardcoded secrets and credentials</li>
                <li>• Find usage of deprecated security APIs</li>
                <li>• Enforce authentication checks</li>
                <li>• Validate input sanitization</li>
              </ul>
            </div>

            <div>
              <h4 className="text-foreground mb-2 font-semibold">
                ✨ Best Practices
              </h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• Enforce naming conventions</li>
                <li>• Require JSDoc comments</li>
                <li>• Prevent console.log in production</li>
                <li>• Enforce error handling patterns</li>
              </ul>
            </div>

            <div>
              <h4 className="text-foreground mb-2 font-semibold">
                🏢 Compliance
              </h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• PCI-DSS requirements</li>
                <li>• HIPAA compliance checks</li>
                <li>• GDPR data handling rules</li>
                <li>• SOC 2 security controls</li>
              </ul>
            </div>

            <div>
              <h4 className="text-foreground mb-2 font-semibold">
                ⚡ Performance
              </h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• Detect inefficient algorithms</li>
                <li>• Find memory leaks</li>
                <li>• Identify blocking operations</li>
                <li>• Catch infinite loops</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
