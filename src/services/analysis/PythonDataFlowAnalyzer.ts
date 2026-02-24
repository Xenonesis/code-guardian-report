import type { SecurityIssue } from "@/hooks/useAnalysis";
import { logger } from "@/utils/logger";

export interface PythonTaintConfig {
  sources: string[];
  sinks: string[];
  sanitizers: string[];
}

export class PythonDataFlowAnalyzer {
  private parser: any = null;
  private initialized = false;

  // maps variable name -> source that tainted it
  private tainted = new Map<string, string>();
  // user-defined functions
  private functions = new Map<string, any>();

  // optional return propagation helper
  private functionReturnVars = new Map<string, string[]>();

  // configuration (can be overridden)
  private config: PythonTaintConfig = {
    sources: [
      "input",
      "sys.argv",
      "os.getenv",
      "request.args",
      "request.form",
      "flask.request",
      "django.http.HttpRequest",
      "$request",
      "werkzeug",
    ],
    sinks: [
      "os.system",
      "eval",
      "exec",
      "subprocess.run",
      "pickle.loads",
      "yaml.load",
      "requests.get",
      "requests.post",
      "urllib.request",
    ],
    sanitizers: [
      "urllib.parse.quote",
      "html.escape",
      "escape",
      "bleach.clean",
      "re.sub",
      "sanitize",
    ],
  };

  constructor(config?: Partial<PythonTaintConfig>) {
    if (config) {
      this.setConfig(config);
    }
  }

  /**
   * Override the default configuration.
   */
  public setConfig(config: Partial<PythonTaintConfig>) {
    this.config = {
      sources: config.sources || this.config.sources,
      sinks: config.sinks || this.config.sinks,
      sanitizers: config.sanitizers || this.config.sanitizers,
    };
  }

  // =================================
  // INIT
  // =================================
  async init() {
    if (this.initialized) return;

    const mod: any = await import("web-tree-sitter");

    await mod.Parser.init();

    const lang = await mod.Language.load("./public/tree-sitter-python.wasm");

    this.parser = new mod.Parser();
    this.parser.setLanguage(lang);

    this.initialized = true;
  }

  // =================================
  // ENTRY
  // =================================
  analyzeDataFlow(files: { filename: string; content: string }[]) {
    const issues: SecurityIssue[] = [];

    for (const file of files) {
      if (!file.filename.endsWith(".py")) continue;

      this.tainted.clear();
      this.functions.clear();

      const tree = this.parser.parse(file.content);

      this.walk(tree.rootNode, (n) => {
        this.registerFunction(n);
        this.detectSource(n);
        this.detectPropagation(n);
        this.detectFunctionCall(n, file, issues);
        this.detectSink(n, file, issues);
      });
    }

    return issues;
  }

  // =================================
  // WALK
  // =================================
  private walk(node: any, fn: (n: any) => void) {
    fn(node);
    for (let i = 0; i < node.namedChildCount; i++) {
      this.walk(node.namedChild(i), fn);
    }
  }

  // =================================
  // REGISTER FUNCTION
  // =================================
  private registerFunction(node: any) {
    if (node.type !== "function_definition") return;

    const name = node.childForFieldName("name")?.text;
    if (name) {
      this.functions.set(name, node);
      logger.info(`Function registered: ${name}`);

      // compute returned identifiers for simple propagation
      const body = node.childForFieldName("body");
      if (body) {
        const returnVars: string[] = [];
        this.walk(body, (n) => {
          if (n.type === "return_statement") {
            const expr = n.childForFieldName("value");
            if (expr) {
              returnVars.push(...this.extractIdentifiers(expr));
            }
          }
        });
        if (returnVars.length) {
          this.functionReturnVars.set(name, returnVars);
        }
      }
    }
  }

  // =================================
  // SOURCE DETECTION
  // =================================
  private detectSource(node: any) {
    if (node.type !== "assignment") return;

    const leftId = node.childForFieldName("left");
    const right = node.childForFieldName("right");
    const left = leftId?.text;
    if (!left || !right) return;

    const src = this.findSourceInNode(right);
    if (src) {
      this.tainted.set(left, src);
      logger.warn(`SOURCE ${left} <- ${src}`);
    }
  }

  /**
   * Recursively search a node for any configured source pattern.
   * Returns the matched source string or null.
   */
  private findSourceInNode(node: any): string | null {
    if (!node) return null;
    const text = node.text || "";

    for (const s of this.config.sources) {
      if (text.includes(s)) {
        return s;
      }
    }

    // call expression function name
    if (node.type === "call") {
      const name = this.getCallName(node);
      if (name && this.config.sources.includes(name)) {
        return name;
      }
    }

    for (let i = 0; i < node.namedChildCount; i++) {
      const found = this.findSourceInNode(node.namedChild(i));
      if (found) return found;
    }

    return null;
  }

  // =================================
  // PROPAGATION
  // =================================
  private detectPropagation(node: any) {
    if (node.type !== "assignment") return;

    const leftId = node.childForFieldName("left");
    const rightNode = node.childForFieldName("right");
    const left = leftId?.text;
    if (!left || !rightNode) return;

    // simple variable copy
    const identifiers = this.extractIdentifiers(rightNode);
    for (const id of identifiers) {
      if (this.tainted.has(id)) {
        this.tainted.set(left, this.tainted.get(id)!);
        logger.warn(`PROP ${id} -> ${left}`);
        return;
      }
    }

    // if right is call to user-defined function, propagate return-taint
    if (rightNode.type === "call") {
      const callName = this.getCallName(rightNode);
      if (callName && this.functions.has(callName)) {
        // if any argument is tainted, taint left
        const args = this.getCallArgs(rightNode);
        for (const arg of args) {
          if (this.tainted.has(arg)) {
            this.tainted.set(left, this.tainted.get(arg)!);
            logger.warn(`CALL RETURN TAINT ${left} from ${arg}`);
            return;
          }
        }
      }
    }
  }

  // =================================
  // FUNCTION CALL HANDLING (taint & sanitizers)
  // =================================
  private detectFunctionCall(node: any, file: any, issues: SecurityIssue[]) {
    if (node.type !== "call") return;

    const callName = this.getCallName(node);
    if (!callName) return;

    // sanitizers take precedence; they break the taint chain
    if (this.config.sanitizers.some((s) => callName.includes(s))) {
      this.applySanitizer(node);
      return;
    }

    // track sinks later (in detectSink) so that sanitizers above excluded them

    if (!this.functions.has(callName)) return;

    const fnNode = this.functions.get(callName);
    const paramsNode = fnNode.childForFieldName("parameters");
    const params = this.extractIdentifiers(paramsNode);
    const args = this.getCallArgs(node);

    params.forEach((param, i) => {
      const arg = args[i];
      if (!arg) return;

      if (this.tainted.has(arg)) {
        this.tainted.set(param, this.tainted.get(arg)!);
        logger.warn(`FUNC FLOW ${arg} -> ${param}`);

        // scan function body for sinks
        const body = fnNode.childForFieldName("body");
        if (body) {
          this.walk(body, (n) => this.detectSink(n, file, issues));
        }
      }
    });

    // if the call is assigned and any argument was tainted, propagate above in detectPropagation
  }

  /**
   * When a sanitizer call is seen, remove taint from its result variable if assigned
   */
  private applySanitizer(node: any) {
    const parent = node.parent;
    if (parent && parent.type === "assignment") {
      const left = parent.childForFieldName("left")?.text;
      if (left && this.tainted.has(left)) {
        this.tainted.delete(left);
        logger.warn(`SANITIZED ${left}`);
      }
    }
  }

  // =================================
  // SINK DETECTION
  // =================================
  private detectSink(node: any, file: any, issues: SecurityIssue[]) {
    if (node.type !== "call") return;

    const callName = this.getCallName(node);
    if (!callName) return;

    // skip sinks that match sanitizers (shouldn't happen)
    if (this.config.sanitizers.some((s) => callName.includes(s))) return;

    if (!this.config.sinks.some((s) => callName.includes(s))) return;

    const args = this.getCallArgs(node);

    args.forEach((arg) => {
      if (this.tainted.has(arg)) {
        logger.error(`FLOW ${arg} -> ${callName}`);
        issues.push({
          id: String(Date.now()),
          type: "Python Data Flow",
          category: "Injection",
          message: `Tainted data reaches ${callName}`,
          severity: "Critical",
          confidence: 95,
          filename: file.filename,
          line: node.startPosition.row + 1,
          column: 0,
          codeSnippet: "",
          recommendation: "Sanitize input",
          remediation: {
            description: "Sanitize",
            effort: "Medium",
            priority: 5,
          },
          riskRating: "Critical",
          impact: "",
          likelihood: "High",
          references: [],
          tags: ["python"],
          tool: "Python Analyzer",
          cvssScore: 9,
          cweId: "CWE-78",
          owaspCategory: "A03",
        });
      }
    });
  }

  // =================================
  // HELPERS
  // =================================

  // call name (identifier OR attribute)
  private getCallName(node: any): string | null {
    const fn = node.childForFieldName("function");
    if (!fn) return null;

    if (fn.type === "identifier") return fn.text;

    if (fn.type === "attribute") {
      const obj = fn.childForFieldName("object")?.text;
      const attr = fn.childForFieldName("attribute")?.text;
      if (obj && attr) return `${obj}.${attr}`;
    }

    return null;
  }

  // extract call arguments
  private getCallArgs(node: any): string[] {
    const argsNode = node.childForFieldName("arguments");
    if (!argsNode) return [];

    const args: string[] = [];

    for (let i = 0; i < argsNode.namedChildCount; i++) {
      const child = argsNode.namedChild(i);
      if (child.type === "identifier") args.push(child.text);
    }

    return args;
  }

  // extract identifiers from subtree (used for params)
  private extractIdentifiers(node: any): string[] {
    if (!node) return [];

    const out: string[] = [];

    const walk = (n: any) => {
      if (n.type === "identifier") out.push(n.text);
      for (let i = 0; i < n.namedChildCount; i++) {
        walk(n.namedChild(i));
      }
    };

    walk(node);
    return out;
  }
}
