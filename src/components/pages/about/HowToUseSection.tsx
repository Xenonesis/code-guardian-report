import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  Play, 
  FileText, 
  Download, 
  Wand2, 
  Shield, 
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Code,
  Eye,
  Copy
} from 'lucide-react';

const HowToUseSection = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      id: 1,
      title: "Upload Your Code",
      icon: <Upload className="w-6 h-6" />,
      description: "Start by uploading your code files or entire project",
      details: [
        "Drag & drop files directly into the upload area",
        "Support for individual files or entire project folders",
        "Accepts all major programming languages",
        "Maximum file size: 100MB per upload",
        "Batch upload multiple files at once"
      ],
      supportedFormats: ["JavaScript", "Python", "Java", "C#", "PHP", "Go", "Rust", "TypeScript", "HTML", "CSS"],
      tips: [
        "Include configuration files for better analysis",
        "Upload package.json, requirements.txt for dependency analysis",
        "Larger projects provide more comprehensive insights"
      ]
    },
    {
      id: 2,
      title: "Automated Analysis",
      icon: <Play className="w-6 h-6" />,
      description: "Our AI engine automatically scans your code for issues",
      details: [
        "Real-time security vulnerability detection",
        "Code quality and maintainability analysis",
        "Performance bottleneck identification",
        "Dependency vulnerability scanning",
        "OWASP Top 10 security checks"
      ],
      analysisTypes: [
        { name: "Security Scan", time: "30-60s", icon: <Shield className="w-4 h-4" /> },
        { name: "Quality Check", time: "15-30s", icon: <Code className="w-4 h-4" /> },
        { name: "Performance Review", time: "20-45s", icon: <AlertTriangle className="w-4 h-4" /> }
      ],
      tips: [
        "Analysis time depends on codebase size",
        "Larger files may take longer to process",
        "You can continue browsing while analysis runs"
      ]
    },
    {
      id: 3,
      title: "Review Results",
      icon: <Eye className="w-6 h-6" />,
      description: "Examine detailed findings with severity ratings and explanations",
      details: [
        "Interactive dashboard with visual metrics",
        "Severity-based issue categorization",
        "Line-by-line code highlighting",
        "Detailed explanations for each issue",
        "Fix suggestions and recommendations"
      ],
      severityLevels: [
        { level: "Critical", color: "bg-red-500", description: "Immediate security risks" },
        { level: "High", color: "bg-orange-500", description: "Important issues to address" },
        { level: "Medium", color: "bg-yellow-500", description: "Moderate concerns" },
        { level: "Low", color: "bg-blue-500", description: "Minor improvements" }
      ],
      tips: [
        "Start with Critical and High severity issues",
        "Use filters to focus on specific issue types",
        "Click on issues for detailed explanations"
      ]
    },
    {
      id: 4,
      title: "Generate AI Prompts",
      icon: <Wand2 className="w-6 h-6" />,
      description: "Get custom AI prompts for your specific code issues",
      details: [
        "Tailored prompts based on your analysis results",
        "Ready-to-use with Cursor, Windsurf, or Copilot",
        "Multiple prompt templates for different needs",
        "Context-aware suggestions for your codebase",
        "Copy-paste ready for immediate use"
      ],
      promptTypes: [
        "Security Vulnerability Scanner",
        "Code Quality Fixer", 
        "Performance Optimizer",
        "Bug Hunter",
        "API Security Checker",
        "Dependency Checker"
      ],
      tips: [
        "Use Security Scanner for immediate threats",
        "Combine multiple prompts for comprehensive fixes",
        "Prompts include your specific issue details"
      ]
    },
    {
      id: 5,
      title: "Export & Share",
      icon: <Download className="w-6 h-6" />,
      description: "Download reports and share findings with your team",
      details: [
        "Professional PDF reports with executive summary",
        "Detailed CSV exports for data analysis",
        "JSON format for integration with other tools",
        "Shareable links for team collaboration",
        "Custom report templates available"
      ],
      exportFormats: [
        { format: "PDF", description: "Professional reports for stakeholders" },
        { format: "CSV", description: "Data analysis and tracking" },
        { format: "JSON", description: "Integration with CI/CD pipelines" },
        { format: "HTML", description: "Interactive web reports" }
      ],
      tips: [
        "PDF reports are great for management presentations",
        "Use CSV for tracking progress over time",
        "JSON exports work well with automation tools"
      ]
    }
  ];

  const quickStartGuide = [
    "Visit the homepage and click 'Upload Code'",
    "Drag your code files into the upload area",
    "Wait for automatic analysis to complete",
    "Review results in the interactive dashboard",
    "Generate AI prompts for specific fixes",
    "Export reports for documentation"
  ];

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            How to Use This Platform
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
            Follow these simple steps to analyze your code and get actionable security insights
          </p>
          
          {/* Quick Start */}
          <Card className="max-w-2xl mx-auto mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <CheckCircle className="w-5 h-5" />
                Quick Start Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="text-left space-y-2">
                {quickStartGuide.map((step, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-blue-800 dark:text-blue-200">
                    <Badge variant="secondary" className="min-w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Step Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {steps.map((step, index) => (
            <Button
              key={step.id}
              variant={activeStep === index ? "default" : "outline"}
              onClick={() => setActiveStep(index)}
              className="flex items-center gap-2"
            >
              {step.icon}
              <span className="hidden sm:inline">Step {step.id}</span>
              <span className="sm:hidden">{step.id}</span>
            </Button>
          ))}
        </div>

        {/* Active Step Details */}
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  {steps[activeStep].icon}
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    Step {steps[activeStep].id}: {steps[activeStep].title}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {steps[activeStep].description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Details */}
              <div>
                <h4 className="font-semibold mb-3">What happens in this step:</h4>
                <ul className="space-y-2">
                  {steps[activeStep].details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                      <span className="text-sm">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Step-specific content */}
              {steps[activeStep].supportedFormats && (
                <div>
                  <h4 className="font-semibold mb-3">Supported File Types:</h4>
                  <div className="flex flex-wrap gap-2">
                    {steps[activeStep].supportedFormats.map((format) => (
                      <Badge key={format} variant="outline">{format}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {steps[activeStep].analysisTypes && (
                <div>
                  <h4 className="font-semibold mb-3">Analysis Types:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {steps[activeStep].analysisTypes.map((type) => (
                      <Card key={type.name} className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {type.icon}
                          <span className="font-medium text-sm">{type.name}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Typical time: {type.time}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {steps[activeStep].severityLevels && (
                <div>
                  <h4 className="font-semibold mb-3">Severity Levels:</h4>
                  <div className="space-y-2">
                    {steps[activeStep].severityLevels.map((severity) => (
                      <div key={severity.level} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${severity.color}`}></div>
                        <span className="font-medium text-sm">{severity.level}</span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          - {severity.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {steps[activeStep].promptTypes && (
                <div>
                  <h4 className="font-semibold mb-3">Available Prompt Types:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {steps[activeStep].promptTypes.map((type) => (
                      <div key={type} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                        <Wand2 className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {steps[activeStep].exportFormats && (
                <div>
                  <h4 className="font-semibold mb-3">Export Formats:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {steps[activeStep].exportFormats.map((format) => (
                      <Card key={format.format} className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4" />
                          <span className="font-medium text-sm">{format.format}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {format.description}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <h4 className="font-semibold mb-2 text-amber-800 dark:text-amber-200">
                  💡 Pro Tips:
                </h4>
                <ul className="space-y-1">
                  {steps[activeStep].tips.map((tip, index) => (
                    <li key={index} className="text-sm text-amber-700 dark:text-amber-300">
                      • {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
            >
              Previous Step
            </Button>
            <Button
              onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
              disabled={activeStep === steps.length - 1}
            >
              Next Step
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowToUseSection;