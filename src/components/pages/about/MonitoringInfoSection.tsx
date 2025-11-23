import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Webhook, Shield, Zap, CheckCircle, Languages, Code, Github, Award } from 'lucide-react';

const MonitoringInfoSection: React.FC = () => {
  return (
    <section id="real-time-monitoring" className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Real-Time Repository Monitoring
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Continuous security scanning with automated alerts and PR checks. 
          Shift from reactive to proactive security monitoring.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <Webhook className="h-8 w-8 mb-2 text-blue-600" />
            <CardTitle>GitHub/GitLab Webhooks</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Connect your repositories and receive instant notifications on every push, PR, or commit.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 mb-2 text-purple-600" />
            <CardTitle>Automated PR Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Automatically scan pull requests and block merges if critical vulnerabilities are detected.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Zap className="h-8 w-8 mb-2 text-orange-600" />
            <CardTitle>Real-Time Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Get instant notifications when new vulnerabilities are introduced in your codebase.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Benefits Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Why Real-Time Monitoring?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Proactive vs Reactive</h4>
              <p className="text-sm text-muted-foreground">
                Catch vulnerabilities the moment they're introduced, not weeks or months later. 
                Prevent security debt from accumulating in your codebase.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">DevSecOps Integration</h4>
              <p className="text-sm text-muted-foreground">
                Seamlessly integrate security into your development workflow. 
                Security checks become part of your CI/CD pipeline.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Faster Remediation</h4>
              <p className="text-sm text-muted-foreground">
                Fix issues while the code is fresh in developers' minds. 
                Reduce the cost and effort of security fixes by 10x.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Compliance Ready</h4>
              <p className="text-sm text-muted-foreground">
                Maintain continuous compliance with security standards. 
                Automatic audit trails and security reports for every change.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Supported Platforms</CardTitle>
            <CardDescription>Multi-language and multi-platform support</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Languages className="h-5 w-5 text-blue-600" />
              <div>
                <h5 className="font-medium">Multi-Language Analysis</h5>
                <p className="text-sm text-muted-foreground">Python, JavaScript, TypeScript, Java, C#, Go, Rust, and more</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Code className="h-5 w-5 text-green-600" />
              <div>
                <h5 className="font-medium">Advanced Pattern Detection</h5>
                <p className="text-sm text-muted-foreground">AI-powered vulnerability identification and security analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Github className="h-5 w-5 text-gray-600" />
              <div>
                <h5 className="font-medium">GitHub Integration</h5>
                <p className="text-sm text-muted-foreground">Seamless integration with GitHub repositories and workflows</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enterprise Features</CardTitle>
            <CardDescription>Security and compliance for organizations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-yellow-600" />
              <div>
                <h5 className="font-medium">Compliance Reporting</h5>
                <p className="text-sm text-muted-foreground">Generate compliance reports for SOC 2, ISO 27001, and other standards</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-red-600" />
              <div>
                <h5 className="font-medium">Security Auditing</h5>
                <p className="text-sm text-muted-foreground">Complete audit trails and security event logging</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-orange-600" />
              <div>
                <h5 className="font-medium">Performance Monitoring</h5>
                <p className="text-sm text-muted-foreground">Track analysis performance and optimize scanning workflows</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Setup Information */}
      <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30">
        <CardHeader>
          <CardTitle>Ready to Get Started?</CardTitle>
          <CardDescription>
            Real-time monitoring is available for authenticated users. Connect your repositories and start securing your code today.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => window.location.hash = '#github-analysis'}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Analyze Your Repository
            </button>
            <button 
              onClick={() => window.location.hash = '#about-section'}
              className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
            >
              Learn More
            </button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default MonitoringInfoSection;