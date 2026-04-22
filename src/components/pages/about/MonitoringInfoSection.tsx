import React from "react";
import {
  Webhook,
  Shield,
  Languages,
  Code,
  GitFork,
  Award,
  Activity,
  Terminal,
  Radio,
  Workflow,
  Server,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { scrollToElement } from "./utils";
import { SECTION_IDS } from "./constants";

const MonitoringInfoSectionComponent: React.FC = () => {
  return (
    <section
      id="real-time-monitoring"
      className="relative overflow-hidden py-24"
    >
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="bg-background/90 absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="mb-16 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="bg-primary/20 h-px w-12"></div>
            <span className="text-primary font-mono text-xs font-bold tracking-widest uppercase">
              LIVE_FEED // SURVEILLANCE
            </span>
            <div className="bg-primary/20 h-px w-12"></div>
          </div>
          <h2 className="text-foreground mb-6 text-3xl font-bold tracking-tight md:text-5xl">
            REAL-TIME <span className="text-primary">MONITORING</span>
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl font-mono text-lg">
            {">"} Active threat detection protocols engaged. Continuous repo
            scanning operational.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="border-primary/20 bg-card/50 hover:border-primary/50 group relative border p-6 transition-all duration-300">
            <div className="text-primary/20 absolute top-0 right-0 p-2">
              <Webhook className="h-12 w-12 opacity-20" />
            </div>
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-primary/10 border-primary/20 text-primary flex h-10 w-10 items-center justify-center border">
                <Radio className="h-5 w-5" />
              </div>
              <h3 className="font-mono text-lg font-bold">SIGNAL_INTERCEPT</h3>
            </div>
            <p className="text-muted-foreground font-mono text-xs leading-relaxed">
              {">"} Webhook integration established. Intercepting push events
              and PR signals for immediate analysis.
            </p>
          </div>

          <div className="border-primary/20 bg-card/50 hover:border-primary/50 group relative border p-6 transition-all duration-300">
            <div className="text-primary/20 absolute top-0 right-0 p-2">
              <Shield className="h-12 w-12 opacity-20" />
            </div>
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-primary/10 border-primary/20 text-primary flex h-10 w-10 items-center justify-center border">
                <Workflow className="h-5 w-5" />
              </div>
              <h3 className="font-mono text-lg font-bold">AUTO_GATEKEEPER</h3>
            </div>
            <p className="text-muted-foreground font-mono text-xs leading-relaxed">
              {">"} PR checks automated. Merge capability disabled upon threat
              detection. Security clearance required.
            </p>
          </div>

          <div className="border-primary/20 bg-card/50 hover:border-primary/50 group relative border p-6 transition-all duration-300">
            <div className="text-primary/20 absolute top-0 right-0 p-2">
              <AlertTriangle className="h-12 w-12 opacity-20" />
            </div>
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-primary/10 border-primary/20 text-primary flex h-10 w-10 items-center justify-center border">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="font-mono text-lg font-bold">INSTANT_ALERT</h3>
            </div>
            <p className="text-muted-foreground font-mono text-xs leading-relaxed">
              {">"} Zero-latency notification protocol. Vulnerability
              introduction triggers immediate operator alert.
            </p>
          </div>
        </div>

        {/* Benefits Section - Data Readout */}
        <div className="border-primary/20 mb-12 border bg-black/40 p-1">
          <div className="border-primary/10 bg-primary/5 border p-6 md:p-8">
            <div className="mb-6 flex items-center gap-2">
              <Terminal className="text-primary h-5 w-5" />
              <h3 className="text-foreground font-mono text-xl font-bold">
                OPERATIONAL_ADVANTAGES
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <h4 className="text-primary mb-2 font-mono text-xs font-bold">
                  [PROACTIVE_DEFENSE]
                </h4>
                <p className="text-muted-foreground font-mono text-xs leading-relaxed">
                  {">"} Threat neutralization at source. Prevents technical debt
                  accumulation.
                </p>
              </div>
              <div>
                <h4 className="text-primary mb-2 font-mono text-xs font-bold">
                  [DEV_SEC_OPS]
                </h4>
                <p className="text-muted-foreground font-mono text-xs leading-relaxed">
                  {">"} Seamless pipeline integration. Automated security
                  checkpoints active.
                </p>
              </div>
              <div>
                <h4 className="text-primary mb-2 font-mono text-xs font-bold">
                  [RAPID_REMEDIATION]
                </h4>
                <p className="text-muted-foreground font-mono text-xs leading-relaxed">
                  {">"} Fix deployment latency reduced by 90%. Cost efficiency
                  maximized.
                </p>
              </div>
              <div>
                <h4 className="text-primary mb-2 font-mono text-xs font-bold">
                  [COMPLIANCE_ALGO]
                </h4>
                <p className="text-muted-foreground font-mono text-xs leading-relaxed">
                  {">"} Continuous audit trailing. SOC2/ISO standard
                  verification.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Features & Supported Platforms */}
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Supported Platforms */}
          <div className="border-primary/20 bg-card/30 border">
            <div className="border-primary/20 bg-primary/5 flex items-center justify-between border-b p-4">
              <h3 className="font-mono text-sm font-bold">
                TARGET_ENVIRONMENTS
              </h3>
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
            </div>
            <div className="space-y-6 p-6">
              <div className="flex gap-4">
                <Languages className="text-primary mt-1 h-5 w-5" />
                <div>
                  <h5 className="text-foreground mb-1 font-mono text-xs font-bold">
                    MULTI_LANG_ANALYSIS
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {["PYTHON", "JS/TS", "JAVA", "C#", "GO", "RUST"].map(
                      (lang) => (
                        <span
                          key={lang}
                          className="bg-muted text-muted-foreground px-1.5 py-0.5 font-mono text-[10px]"
                        >
                          {lang}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <Code className="text-primary mt-1 h-5 w-5" />
                <div>
                  <h5 className="text-foreground mb-1 font-mono text-xs font-bold">
                    PATTERN_RECOGNITION
                  </h5>
                  <p className="text-muted-foreground text-justify font-mono text-xs">
                    AI-driven vulnerability heuristics. Adapts to codebase
                    structure.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <GitFork className="text-primary mt-1 h-5 w-5" />
                <div>
                  <h5 className="text-foreground mb-1 font-mono text-xs font-bold">
                    GIT_INTEGRATION
                  </h5>
                  <p className="text-muted-foreground text-justify font-mono text-xs">
                    Native support for GitHub workflow protocols and actions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enterprise Features */}
          <div className="border-primary/20 bg-card/30 border">
            <div className="border-primary/20 bg-primary/5 flex items-center justify-between border-b p-4">
              <h3 className="font-mono text-sm font-bold">
                ENTERPRISE_MODULES
              </h3>
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            </div>
            <div className="space-y-6 p-6">
              <div className="flex gap-4">
                <Award className="text-primary mt-1 h-5 w-5" />
                <div>
                  <h5 className="text-foreground mb-1 font-mono text-xs font-bold">
                    COMPLIANCE_GENERATOR
                  </h5>
                  <p className="text-muted-foreground text-justify font-mono text-xs">
                    Auto-generate reports for SOC 2, ISO 27001, HIPAA protocols.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Lock className="text-primary mt-1 h-5 w-5" />
                <div>
                  <h5 className="text-foreground mb-1 font-mono text-xs font-bold">
                    AUDIT_LOGGING
                  </h5>
                  <p className="text-muted-foreground text-justify font-mono text-xs">
                    Immutable event logs for forensic analysis and tracking.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Server className="text-primary mt-1 h-5 w-5" />
                <div>
                  <h5 className="text-foreground mb-1 font-mono text-xs font-bold">
                    PERF_OPTIMIZATION
                  </h5>
                  <p className="text-muted-foreground text-justify font-mono text-xs">
                    Resource allocation management for high-scale scanning ops.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Setup Information */}
        <div className="border-primary/30 bg-primary/5 border border-dashed p-8 text-center">
          <h3 className="text-foreground mb-4 font-mono text-xl font-bold">
            SYSTEM_READY_FOR_DEPLOYMENT
          </h3>
          <p className="text-muted-foreground mx-auto mb-8 max-w-xl font-mono text-xs">
            {">"} Real-time monitoring capability available for authorized
            users. Initiating security handshake...
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              onClick={() => scrollToElement("github-analysis")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 font-mono text-xs font-bold uppercase transition-all"
            >
              INITIALIZE_SCAN
            </button>
            <button
              onClick={() => scrollToElement(SECTION_IDS.ABOUT_SECTION)}
              className="border-primary/50 text-foreground hover:bg-primary/10 border px-8 py-3 font-mono text-xs font-bold uppercase transition-all"
            >
              ACCESS_DOCS
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export const MonitoringInfoSection = React.memo(MonitoringInfoSectionComponent);
