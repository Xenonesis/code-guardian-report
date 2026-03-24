"use client";

import React, { useState } from "react";
import {
  Terminal,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Cpu,
  Database,
  Globe,
  Zap,
  Code2,
  Wrench,
  ExternalLink,
  PlayCircle,
  Package,
  GitBranch,
  Shield,
  Server,
  Network,
  BookOpen,
} from "lucide-react";

interface CopyButtonProps {
  text: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-muted-foreground hover:text-primary absolute top-3 right-3 rounded p-1.5 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-400" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
};

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = "bash",
  title,
}) => {
  return (
    <div className="group relative my-4 overflow-hidden rounded-lg border border-white/10 bg-black/60 font-mono text-sm">
      {title && (
        <div className="border-b border-white/10 bg-white/5 px-4 py-2 text-xs tracking-widest text-slate-400 uppercase">
          <span className="text-primary mr-2">▸</span>
          {title}
        </div>
      )}
      <div className="overflow-x-auto p-4 pr-12">
        <pre className="leading-relaxed whitespace-pre text-slate-300">
          <code
            className={`language-${language}`}
            dangerouslySetInnerHTML={{
              __html: code
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                // Highlight comments
                .replace(
                  /(\/\/.+|#.+)/g,
                  '<span style="color:#6b7280">$1</span>'
                )
                // Highlight strings
                .replace(
                  /(&quot;[^&]*&quot;|'[^']*')/g,
                  '<span style="color:#86efac">$1</span>'
                )
                // Highlight keys/commands
                .replace(
                  /\b(npm|node|npx|git)\b/g,
                  '<span style="color:#fb923c">$1</span>'
                )
                // Highlight JSON keys
                .replace(
                  /(&quot;[a-zA-Z_-]+&quot;)(?=\s*:)/g,
                  '<span style="color:#93c5fd">$1</span>'
                ),
            }}
          />
        </pre>
      </div>
      <CopyButton text={code} />
    </div>
  );
};

interface AccordionItemProps {
  title: string;
  icon: React.ReactNode;
  badge?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  icon,
  badge,
  children,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-border/50 overflow-hidden rounded-xl border bg-black/30 backdrop-blur-sm dark:border-white/10">
      <button
        onClick={() => setOpen(!open)}
        className="hover:bg-muted/30 flex w-full items-center gap-4 px-6 py-5 text-left transition-colors"
      >
        <div className="bg-primary/10 text-primary ring-primary/20 flex-shrink-0 rounded-lg p-2.5 ring-1">
          {icon}
        </div>
        <span className="font-display flex-1 text-lg font-bold tracking-wide text-white">
          {title}
        </span>
        {badge && (
          <span className="border-primary/30 bg-primary/10 text-primary rounded border px-2 py-0.5 font-mono text-xs tracking-wider uppercase">
            {badge}
          </span>
        )}
        {open ? (
          <ChevronDown className="text-primary h-5 w-5 flex-shrink-0" />
        ) : (
          <ChevronRight className="text-muted-foreground h-5 w-5 flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="border-t border-white/5 px-6 py-5">{children}</div>
      )}
    </div>
  );
};

interface ToolCardProps {
  name: string;
  description: string;
  category: string;
  categoryColor: string;
}

const ToolCard: React.FC<ToolCardProps> = ({
  name,
  description,
  category,
  categoryColor,
}) => (
  <div className="border-border/40 hover:border-primary/30 group rounded-lg border bg-white/[0.02] p-4 transition-all duration-200 hover:bg-white/[0.05]">
    <div className="mb-2 flex items-start justify-between gap-2">
      <code className="group-hover:text-primary font-mono text-sm font-medium text-slate-200 transition-colors">
        {name}
      </code>
      <span
        className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] tracking-wider uppercase ${categoryColor}`}
      >
        {category}
      </span>
    </div>
    <p className="text-muted-foreground text-xs leading-relaxed">
      {description}
    </p>
  </div>
);

export const MCPSetupPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "claude" | "cursor" | "vscode" | "http" | "dev"
  >("claude");

  const tools: ToolCardProps[] = [
    {
      name: "scan_file",
      description: "Scan a single source file for security vulnerabilities",
      category: "Scanner",
      categoryColor: "bg-red-500/20 text-red-400",
    },
    {
      name: "scan_codebase",
      description: "Scan multiple files as a unified codebase",
      category: "Scanner",
      categoryColor: "bg-red-500/20 text-red-400",
    },
    {
      name: "detect_secrets",
      description:
        "Find hardcoded secrets, API keys, and credentials via entropy analysis",
      category: "Scanner",
      categoryColor: "bg-red-500/20 text-red-400",
    },
    {
      name: "scan_dependencies",
      description: "Audit package.json for known CVEs and supply-chain risks",
      category: "Scanner",
      categoryColor: "bg-red-500/20 text-red-400",
    },
    {
      name: "analyze_data_flow",
      description: "Trace taint propagation and identify injection sinks",
      category: "Analysis",
      categoryColor: "bg-violet-500/20 text-violet-400",
    },
    {
      name: "calculate_metrics",
      description:
        "Compute cyclomatic complexity, issue density, and health score",
      category: "Analysis",
      categoryColor: "bg-violet-500/20 text-violet-400",
    },
    {
      name: "build_exploit_graph",
      description:
        "Build a directed attack graph from chained CWE vulnerabilities",
      category: "Exploit Sim",
      categoryColor: "bg-orange-500/20 text-orange-400",
    },
    {
      name: "simulate_exploit",
      description: "Run exploit simulation against identified attack chains",
      category: "Exploit Sim",
      categoryColor: "bg-orange-500/20 text-orange-400",
    },
    {
      name: "get_attack_paths",
      description: "Extract ranked attack paths sorted by exploitability",
      category: "Exploit Sim",
      categoryColor: "bg-orange-500/20 text-orange-400",
    },
    {
      name: "generate_patch",
      description:
        "Auto-generate a security patch for a specific vulnerability",
      category: "Patches",
      categoryColor: "bg-emerald-500/20 text-emerald-400",
    },
    {
      name: "preview_patch",
      description: "Generate a unified diff preview of a proposed patch",
      category: "Patches",
      categoryColor: "bg-emerald-500/20 text-emerald-400",
    },
    {
      name: "apply_patch",
      description: "Apply a patch to source code (dry-run by default)",
      category: "Patches",
      categoryColor: "bg-emerald-500/20 text-emerald-400",
    },
    {
      name: "validate_patch",
      description:
        "Verify a patch resolves the target vulnerability without regressions",
      category: "Validation",
      categoryColor: "bg-sky-500/20 text-sky-400",
    },
    {
      name: "run_regression",
      description: "Run regression checks on patched code",
      category: "Validation",
      categoryColor: "bg-sky-500/20 text-sky-400",
    },
    {
      name: "check_confidence",
      description: "Score detection confidence for a given finding",
      category: "Validation",
      categoryColor: "bg-sky-500/20 text-sky-400",
    },
    {
      name: "calculate_risk_score",
      description: "CVSS-based composite risk score for a single issue",
      category: "Risk",
      categoryColor: "bg-yellow-500/20 text-yellow-400",
    },
    {
      name: "optimize_patches",
      description: "Prioritize fixes by risk-to-effort ratio across all issues",
      category: "Risk",
      categoryColor: "bg-yellow-500/20 text-yellow-400",
    },
    {
      name: "query_memory",
      description:
        "Query persistent memory of past scans, patches, and results",
      category: "Memory",
      categoryColor: "bg-pink-500/20 text-pink-400",
    },
    {
      name: "full_security_pipeline",
      description:
        "Run the complete scan → exploit → patch → validate pipeline in one call",
      category: "Pipeline",
      categoryColor: "bg-primary/20 text-primary",
    },
  ];

  const clientConfigs: Record<
    "claude" | "cursor" | "vscode" | "http" | "dev",
    { label: string; icon: React.ReactNode; file: string; code: string }
  > = {
    claude: {
      label: "Claude Desktop",
      icon: <Cpu className="h-4 w-4" />,
      file: "macOS: ~/Library/Application Support/Claude/claude_desktop_config.json\nWindows: %APPDATA%\\Claude\\claude_desktop_config.json",
      code: `{
  "mcpServers": {
    "code-guardian": {
      "command": "node",
      "args": ["dist/mcp/mcp/transports/stdio.js"],
      "cwd": "/absolute/path/to/code-guardian-report",
      "env": {
        // Optional — omit for in-memory (non-persistent) mode
        "FIREBASE_PROJECT_ID": "your-project-id",
        "FIREBASE_CLIENT_EMAIL": "your-client@project.iam.gserviceaccount.com",
        "FIREBASE_PRIVATE_KEY": "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"
      }
    }
  }
}`,
    },
    cursor: {
      label: "Cursor",
      icon: <Code2 className="h-4 w-4" />,
      file: "~/.cursor/mcp.json",
      code: `{
  "mcpServers": {
    "code-guardian": {
      "command": "node",
      "args": ["dist/mcp/mcp/transports/stdio.js"],
      "cwd": "/absolute/path/to/code-guardian-report",
      "env": {
        // Optional — omit for in-memory (non-persistent) mode
        "FIREBASE_PROJECT_ID": "your-project-id",
        "FIREBASE_CLIENT_EMAIL": "your-client@project.iam.gserviceaccount.com",
        "FIREBASE_PRIVATE_KEY": "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"
      }
    }
  }
}`,
    },
    vscode: {
      label: "VS Code Copilot",
      icon: <GitBranch className="h-4 w-4" />,
      file: "Workspace: .vscode/mcp.json  |  Global: User/settings.json",
      code: `{
  "mcp": {
    "servers": {
      "code-guardian": {
        "type": "stdio",
        "command": "node",
        "args": ["dist/mcp/mcp/transports/stdio.js"],
        "cwd": "\${workspaceFolder}",
        "env": {
          // Optional — omit for in-memory (non-persistent) mode
          "FIREBASE_PROJECT_ID": "your-project-id",
          "FIREBASE_CLIENT_EMAIL": "your-client@project.iam.gserviceaccount.com",
          "FIREBASE_PRIVATE_KEY": "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"
        }
      }
    }
  }
}`,
    },
    http: {
      label: "HTTP / ChatGPT",
      icon: <Globe className="h-4 w-4" />,
      file: "Any HTTP client — no config file needed",
      code: `// 1. Start the HTTP server
npm run mcp:http
// Server starts on http://localhost:3100/mcp

// 2. Health check
GET http://localhost:3100/mcp
// → {"name":"code-guardian-mcp","status":"ok","sessions":0}

// 3. Initialize a session
POST http://localhost:3100/mcp
Content-Type: application/json
Accept: application/json, text/event-stream

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {},
    "clientInfo": { "name": "my-client", "version": "1.0" }
  }
}
// Response includes mcp-session-id header — use it in subsequent requests`,
    },
    dev: {
      label: "Dev Mode (tsx)",
      icon: <Zap className="h-4 w-4" />,
      file: "Run directly from TypeScript source — no build step needed",
      code: `{
  "mcpServers": {
    "code-guardian": {
      "command": "npx",
      "args": ["tsx", "src/mcp/transports/stdio.ts"],
      "cwd": "/absolute/path/to/code-guardian-report"
      // No Firebase env = automatic in-memory fallback
    }
  }
}`,
    },
  };

  return (
    <div className="bg-background text-foreground selection:bg-primary/20 selection:text-primary relative min-h-screen overflow-hidden">
      {/* Industrial Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:60px_60px] opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-80" />
      </div>

      <div className="relative z-10 pt-16">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            {/* ── Header ── */}
            <div className="mb-16 text-center">
              <div className="border-primary/30 bg-primary/5 text-primary mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                  <span className="bg-primary relative inline-flex h-2 w-2 rounded-full" />
                </span>
                <span className="font-mono tracking-wider">
                  MCP SERVER · v15.0.0
                </span>
              </div>

              <h1 className="font-display text-foreground mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl dark:text-white">
                MCP{" "}
                <span className="from-primary bg-gradient-to-r to-emerald-400 bg-clip-text text-transparent">
                  SETUP
                </span>
              </h1>

              <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed font-light md:text-xl">
                Connect Code Guardian&apos;s 19-tool security suite to Claude
                Desktop, Cursor, VS Code Copilot, or any HTTP-based AI client
                via the Model Context Protocol.
              </p>

              {/* Stat pills */}
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {[
                  {
                    icon: <Wrench className="h-3.5 w-3.5" />,
                    label: "19 Tools",
                  },
                  {
                    icon: <Shield className="h-3.5 w-3.5" />,
                    label: "5 Agents",
                  },
                  {
                    icon: <Database className="h-3.5 w-3.5" />,
                    label: "Firebase Memory",
                  },
                  {
                    icon: <Network className="h-3.5 w-3.5" />,
                    label: "STDIO + HTTP",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="border-border/50 bg-muted/30 text-muted-foreground flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs backdrop-blur-sm"
                  >
                    <span className="text-primary">{stat.icon}</span>
                    {stat.label}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Step 1: Prerequisites ── */}
            <div className="mb-4">
              <div className="mb-3 flex items-center gap-3">
                <span className="border-primary/40 bg-primary/10 text-primary flex h-7 w-7 items-center justify-center rounded border font-mono text-sm font-bold">
                  1
                </span>
                <h2 className="font-display text-xl font-bold tracking-wide text-white">
                  PREREQUISITES
                </h2>
              </div>
            </div>

            <div className="mb-8 space-y-4">
              <AccordionItem
                title="Clone & Install"
                icon={<Package className="h-5 w-5" />}
                defaultOpen={true}
              >
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  Clone the repository and install dependencies. Node.js 18+ is
                  required.
                </p>
                <CodeBlock
                  title="Terminal"
                  language="bash"
                  code={`git clone https://github.com/Xenonesis/code-guardian-report.git
cd code-guardian-report
npm install`}
                />
              </AccordionItem>

              <AccordionItem
                title="Build the MCP Server"
                icon={<Terminal className="h-5 w-5" />}
              >
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  Compile the TypeScript source into{" "}
                  <code className="text-primary font-mono text-xs">
                    dist/mcp/
                  </code>{" "}
                  using the dedicated MCP tsconfig. This is required for
                  production STDIO and HTTP use.
                </p>
                <CodeBlock
                  title="Terminal"
                  language="bash"
                  code={`npm run mcp:build
# Output: dist/mcp/mcp/transports/stdio.js
#         dist/mcp/mcp/transports/http.js`}
                />
                <div className="border-y-border/30 border-r-border/30 mt-4 rounded-lg border-y border-r border-l-4 border-l-amber-500/70 bg-amber-500/5 p-4">
                  <p className="font-mono text-xs text-amber-400/90">
                    <span className="font-bold">TIP:</span> Skip the build step
                    in dev mode — use{" "}
                    <code className="text-amber-300">npm run mcp:dev</code> to
                    run directly from TypeScript source via tsx.
                  </p>
                </div>
              </AccordionItem>

              <AccordionItem
                title="Firebase Setup (Optional — for persistent memory)"
                icon={<Database className="h-5 w-5" />}
                badge="Optional"
              >
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  Without Firebase, the server automatically falls back to
                  in-memory storage. Scan results and patches persist for the
                  session only. To enable cross-session memory persistence, set
                  up a Firebase service account:
                </p>
                <ol className="text-muted-foreground mb-4 list-decimal space-y-2 pl-5 text-sm">
                  <li>
                    Go to{" "}
                    <a
                      href="https://console.firebase.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary inline-flex items-center gap-1 hover:underline"
                    >
                      Firebase Console
                      <ExternalLink className="h-3 w-3" />
                    </a>{" "}
                    → Project Settings → Service Accounts
                  </li>
                  <li>
                    Click &quot;Generate new private key&quot; → download the
                    JSON
                  </li>
                  <li>
                    Set the three environment variables shown in the client
                    config below
                  </li>
                </ol>
                <CodeBlock
                  title=".env.local (or set in your shell)"
                  language="bash"
                  code={`FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`}
                />
              </AccordionItem>
            </div>

            {/* ── Step 2: Client Configuration ── */}
            <div className="mt-12 mb-4">
              <div className="mb-3 flex items-center gap-3">
                <span className="border-primary/40 bg-primary/10 text-primary flex h-7 w-7 items-center justify-center rounded border font-mono text-sm font-bold">
                  2
                </span>
                <h2 className="font-display text-xl font-bold tracking-wide text-white">
                  CLIENT CONFIGURATION
                </h2>
              </div>
            </div>

            {/* Client Tab Bar */}
            <div className="border-border/50 mb-0 flex overflow-x-auto overflow-y-hidden rounded-t-xl border border-b-0 bg-black/50 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {(
                Object.keys(clientConfigs) as Array<keyof typeof clientConfigs>
              ).map((key) => {
                const cfg = clientConfigs[key];
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex shrink-0 items-center justify-center gap-2 px-3 py-3 font-mono text-xs tracking-wider whitespace-nowrap uppercase transition-all sm:flex-1 ${
                      activeTab === key
                        ? "bg-primary/10 text-primary border-b-primary border-b-2"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    {cfg.icon}
                    <span className="hidden sm:inline">{cfg.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Tab Content */}
            <div className="border-border/50 mb-8 overflow-hidden rounded-b-xl border bg-black/40 p-6 backdrop-blur-sm dark:border-white/10">
              <p className="text-muted-foreground mb-1 font-mono text-xs tracking-wider uppercase">
                Config file location
              </p>
              <p className="text-foreground/80 mb-4 font-mono text-xs whitespace-pre-line">
                {clientConfigs[activeTab].file}
              </p>
              <CodeBlock
                title={`${clientConfigs[activeTab].label} Configuration`}
                language="json"
                code={clientConfigs[activeTab].code}
              />
              {activeTab !== "http" && (
                <p className="text-muted-foreground mt-3 text-xs">
                  Replace{" "}
                  <code className="text-primary font-mono">
                    /absolute/path/to/code-guardian-report
                  </code>{" "}
                  with the actual path where you cloned the repository.
                </p>
              )}
            </div>

            {/* ── Step 3: Verify ── */}
            <div className="mt-12 mb-4">
              <div className="mb-3 flex items-center gap-3">
                <span className="border-primary/40 bg-primary/10 text-primary flex h-7 w-7 items-center justify-center rounded border font-mono text-sm font-bold">
                  3
                </span>
                <h2 className="font-display text-xl font-bold tracking-wide text-white">
                  VERIFY THE SERVER
                </h2>
              </div>
            </div>

            <div className="mb-8 space-y-4">
              <AccordionItem
                title="MCP Inspector (Recommended)"
                icon={<PlayCircle className="h-5 w-5" />}
                defaultOpen={true}
              >
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  The MCP Inspector is a browser-based UI for testing tools and
                  reviewing responses interactively.
                </p>
                <CodeBlock
                  title="Terminal"
                  language="bash"
                  code={`npm run mcp:inspect
# Opens: http://localhost:5173 (MCP Inspector UI)
# Connects to: node dist/mcp/mcp/transports/stdio.js`}
                />
              </AccordionItem>

              <AccordionItem
                title="Manual STDIO Test"
                icon={<Terminal className="h-5 w-5" />}
              >
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  Send raw JSON-RPC messages to the STDIO transport. The MCP
                  protocol requires the 3-step handshake shown below before tool
                  calls.
                </p>
                <CodeBlock
                  title="Node.js test snippet"
                  language="js"
                  code={`// test-mcp.js
const { spawn } = require("child_process");
const proc = spawn("node", ["dist/mcp/mcp/transports/stdio.js"], {
  stdio: ["pipe", "pipe", "pipe"],
  shell: true,
});

const msgs = [
  // Step 1: initialize
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}',
  // Step 2: send initialized notification (required!)
  '{"jsonrpc":"2.0","method":"notifications/initialized","params":{}}',
  // Step 3: call a tool
  '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"scan_file","arguments":{"filename":"app.js","code":"eval(userInput)"}}}',
];

proc.stdout.on("data", (d) => console.log(JSON.parse(d.toString())));
proc.stderr.on("data", () => {});
msgs.forEach((m, i) => setTimeout(() => proc.stdin.write(m + "\\n"), i * 500));`}
                />
              </AccordionItem>

              <AccordionItem
                title="HTTP Health Check"
                icon={<Server className="h-5 w-5" />}
              >
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  Start the HTTP transport, then verify it&apos;s up with a GET
                  request.
                </p>
                <CodeBlock
                  title="Terminal"
                  language="bash"
                  code={`# Start the HTTP server (port 3100)
npm run mcp:http

# In a second terminal — health check
curl http://localhost:3100/mcp
# → {"name":"code-guardian-mcp","status":"ok","sessions":0}`}
                />
              </AccordionItem>
            </div>

            {/* ── Available Tools ── */}
            <div className="mt-12 mb-4">
              <div className="mb-3 flex items-center gap-3">
                <span className="border-primary/40 bg-primary/10 text-primary flex h-7 w-7 items-center justify-center rounded border font-mono text-sm font-bold">
                  4
                </span>
                <h2 className="font-display text-xl font-bold tracking-wide text-white">
                  19 AVAILABLE TOOLS
                </h2>
              </div>
              <p className="text-muted-foreground mb-6 text-sm">
                All tools are available immediately after connecting. Use{" "}
                <code className="text-primary font-mono text-xs">
                  tools/list
                </code>{" "}
                to enumerate them in any MCP client.
              </p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {tools.map((tool) => (
                <ToolCard key={tool.name} {...tool} />
              ))}
            </div>

            {/* ── npm Scripts Reference ── */}
            <div className="mt-12 mb-4">
              <div className="mb-6 flex items-center gap-3">
                <BookOpen className="text-primary h-5 w-5" />
                <h2 className="font-display text-xl font-bold tracking-wide text-white">
                  NPM SCRIPTS REFERENCE
                </h2>
              </div>
            </div>

            <div className="border-border/50 mb-8 overflow-hidden rounded-xl border bg-black/40 backdrop-blur-sm dark:border-white/10">
              {[
                {
                  cmd: "npm run mcp:build",
                  desc: "Compile TypeScript → dist/mcp/ (required for prod)",
                },
                {
                  cmd: "npm run mcp:stdio",
                  desc: "Start STDIO server from compiled JS (Claude, Cursor, VS Code)",
                },
                {
                  cmd: "npm run mcp:http",
                  desc: "Start HTTP server on port 3100 (ChatGPT, HTTP clients)",
                },
                {
                  cmd: "npm run mcp:dev",
                  desc: "STDIO server from TypeScript source via tsx (no build needed)",
                },
                {
                  cmd: "npm run mcp:dev:http",
                  desc: "HTTP server from TypeScript source via tsx",
                },
                {
                  cmd: "npm run mcp:inspect",
                  desc: "Launch MCP Inspector UI for interactive testing",
                },
              ].map((item, i, arr) => (
                <div
                  key={item.cmd}
                  className={`flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:gap-6 ${
                    i < arr.length - 1 ? "border-b border-white/5" : ""
                  }`}
                >
                  <code className="text-primary w-full shrink-0 font-mono text-sm break-words whitespace-pre-wrap sm:w-64 sm:whitespace-nowrap">
                    {item.cmd}
                  </code>
                  <span className="text-muted-foreground text-sm">
                    {item.desc}
                  </span>
                </div>
              ))}
            </div>

            {/* ── Tip Box ── */}
            <div className="border-y-border/50 border-r-border/50 rounded-xl border-y border-r border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-500/10 to-transparent p-6 dark:border-y-white/5 dark:border-r-white/5">
              <h3 className="mb-4 flex items-center gap-3 text-lg font-semibold text-emerald-400">
                <Zap className="h-5 w-5" />
                <span className="font-mono tracking-wider">QUICK TIPS</span>
              </h3>
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                {[
                  "Firebase env vars are optional — the server auto-falls back to in-memory storage without them",
                  "Use full_security_pipeline for a single end-to-end call: scan → exploit → patch → validate",
                  "The MCP Inspector (npm run mcp:inspect) is the fastest way to explore all 19 tools interactively",
                  "query_memory lets AI clients access all prior scan results and patches within a session",
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500/50" />
                    <span className="text-foreground/80 dark:text-slate-300">
                      {tip}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── GitHub link ── */}
            <div className="mt-10 text-center">
              <a
                href="https://github.com/Xenonesis/code-guardian-report/blob/main/mcp-config.example.json"
                target="_blank"
                rel="noopener noreferrer"
                className="border-border/50 hover:border-primary/40 bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground inline-flex items-center gap-2 rounded-lg border px-5 py-3 font-mono text-sm tracking-wide transition-all"
              >
                <ExternalLink className="h-4 w-4" />
                VIEW mcp-config.example.json ON GITHUB
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCPSetupPage;
