import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Code, Zap, Bot, Users, FileCode, Download, Info, CheckCircle, Star, Award, Sparkles, TrendingUp, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLayout } from '@/components/layouts/PageLayout';
import { HeroSection } from '@/components/layouts/HeroSection';
import { FeatureGrid } from '@/components/features/FeatureGrid';
import { useDarkMode } from '@/hooks/useDarkMode';
import '@/styles/background-effects.css';

const About = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const supportedTools = [
    {
      name: 'Bandit',
      language: 'Python',
      type: 'Security Scanner',
      gradient: 'from-red-500 to-pink-500',
      description: 'Advanced Python security scanner that identifies common vulnerabilities, injection flaws, and security anti-patterns.',
      features: ['SQL Injection Detection', 'Hardcoded Secrets', 'Insecure Randomness', 'Shell Injection', 'Crypto Vulnerabilities'],
      rating: 4.8,
      downloads: '2M+'
    },
    {
      name: 'ESLint',
      language: 'JavaScript/TypeScript',
      type: 'Quality & Security',
      gradient: 'from-blue-500 to-indigo-500',
      description: 'Industry-standard linting tool with advanced security rules for modern JavaScript and TypeScript applications.',
      features: ['Syntax Analysis', 'Security Patterns', 'Best Practices', 'Type Safety', 'Custom Rules'],
      rating: 4.9,
      downloads: '25M+'
    },
    {
      name: 'Pylint',
      language: 'Python',
      type: 'Code Quality',
      gradient: 'from-green-500 to-emerald-500',
      description: 'Comprehensive Python code analyzer that enforces coding standards and identifies potential issues.',
      features: ['Code Complexity', 'Naming Conventions', 'Unused Variables', 'Import Analysis', 'Refactoring Suggestions'],
      rating: 4.7,
      downloads: '5M+'
    },
    {
      name: 'Semgrep',
      language: 'Multi-language',
      type: 'Security & SAST',
      gradient: 'from-purple-500 to-violet-500',
      description: 'Next-generation static analysis tool with custom rule engine for finding security vulnerabilities.',
      features: ['OWASP Top 10', 'Custom Rules', 'Multi-language', 'CI/CD Integration', 'Supply Chain Security'],
      rating: 4.6,
      downloads: '1M+'
    },
    {
      name: 'Flake8',
      language: 'Python',
      type: 'Style & Convention',
      gradient: 'from-yellow-500 to-orange-500',
      description: 'Unified Python style checker combining multiple tools for comprehensive code quality assessment.',
      features: ['PEP 8 Compliance', 'Cyclomatic Complexity', 'Import Validation', 'Documentation', 'Plugin Ecosystem'],
      rating: 4.5,
      downloads: '8M+'
    },
    {
      name: 'SonarQube',
      language: 'Multi-language',
      type: 'Enterprise SAST',
      gradient: 'from-teal-500 to-cyan-500',
      description: 'Enterprise-grade continuous code quality platform with advanced security vulnerability detection.',
      features: ['Security Hotspots', 'Quality Gates', 'Technical Debt', 'Coverage Analysis', 'Enterprise Integration'],
      rating: 4.4,
      downloads: '500K+',
      comingSoon: true
    }
  ];

  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Enterprise Security Analysis',
      description: 'Military-grade security scanning with comprehensive vulnerability detection and threat intelligence.',
      gradient: 'from-emerald-500 to-teal-600',
      benefits: ['OWASP Top 10 Coverage', 'CVE Database Integration', 'Zero-day Detection', 'Threat Intelligence', 'Compliance Reporting']
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: 'Advanced Code Quality',
      description: 'Deep code analysis with AI-powered insights for maintainability, performance, and technical debt.',
      gradient: 'from-blue-500 to-indigo-600',
      benefits: ['Cyclomatic Complexity', 'Technical Debt Analysis', 'Maintainability Index', 'Performance Metrics', 'Refactoring Suggestions']
    },
    {
      icon: <Bot className="h-6 w-6" />,
      title: 'AI-Powered Intelligence',
      description: 'Next-generation AI that understands your code context and provides intelligent recommendations.',
      gradient: 'from-purple-500 to-pink-600',
      benefits: ['Natural Language Explanations', 'Auto-fix Suggestions', 'Impact Assessment', 'Learning Algorithms', 'Context Awareness']
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Hyper-Fast Processing',
      description: 'Cutting-edge analysis engine with distributed processing for enterprise-scale codebases.',
      gradient: 'from-amber-500 to-orange-600',
      benefits: ['Parallel Processing', 'Incremental Analysis', 'Real-time Results', 'Distributed Computing', 'Edge Optimization']
    }
  ];

  const stats = [
    { icon: <Users className="h-5 w-5" />, label: 'Developers Trust Us', value: '10,000+' },
    { icon: <FileCode className="h-5 w-5" />, label: 'Files Analyzed', value: '1M+' },
    { icon: <Shield className="h-5 w-5" />, label: 'Vulnerabilities Found', value: '50,000+' },
    { icon: <Award className="h-5 w-5" />, label: 'Languages Supported', value: '15+' }
  ];

  return (
    <PageLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
      {/* Animated Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Large Gradient Orbs with Enhanced Animation */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl gentle-pulse float-animation"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl gentle-pulse float-animation delay-2s"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-cyan-400/15 to-blue-600/15 rounded-full blur-3xl gentle-pulse float-animation delay-4s"></div>

        {/* Additional Smaller Orbs */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-r from-emerald-400/25 to-teal-600/25 rounded-full blur-2xl gentle-pulse"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-r from-amber-400/20 to-orange-600/20 rounded-full blur-2xl gentle-pulse delay-3s"></div>

        {/* Floating Particles with Enhanced Positioning */}
        <div className="absolute inset-0">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-gradient-to-r from-blue-400/40 to-purple-400/40 rounded-full animate-bounce particle-${i % 4}`}
            ></div>
          ))}
        </div>

        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] slow-rotate"></div>

        {/* Enhanced Animated Lines */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="line-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.15" />
              <stop offset="50%" stopColor="rgb(147, 51, 234)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="line-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.1" />
              <stop offset="50%" stopColor="rgb(59, 130, 246)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path
            d="M0,100 Q150,50 300,100 T600,100 T900,100"
            stroke="url(#line-gradient-1)"
            strokeWidth="2"
            fill="none"
            className="animate-pulse"
          />
          <path
            d="M100,200 Q250,150 400,200 T700,200 T1000,200"
            stroke="url(#line-gradient-1)"
            strokeWidth="1.5"
            fill="none"
            className="animate-pulse delay-1s"
          />
          <path
            d="M50,300 Q200,250 350,300 T650,300 T950,300"
            stroke="url(#line-gradient-2)"
            strokeWidth="1"
            fill="none"
            className="animate-pulse delay-2s"
          />
        </svg>

        {/* Rotating Geometric Shapes */}
        <div className="absolute top-1/3 right-1/3 w-20 h-20 border border-blue-400/20 rotate-45 slow-rotate"></div>
        <div className="absolute bottom-1/3 left-1/3 w-16 h-16 border border-purple-400/20 rounded-full slow-rotate reverse-rotate"></div>
      </div>

      {/* Content with relative positioning to appear above background */}
      <div className="relative z-10">
        <HeroSection
        title="Enterprise-Grade Code Security Platform"
        subtitle="Trusted by 10,000+ developers worldwide"
        description="Our platform combines industry-leading static analysis tools with cutting-edge AI to provide comprehensive security and quality assessment for your codebase. Built by developers, for developers."
        titleId="about-hero-title"
        variant="gradient"
      >
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="modern-card text-center p-4 lg:p-6 group hover-float-subtle hover-glow cursor-pointer"
              >
                <div className="flex items-center justify-center mb-3 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform hover-bounce">
                  {stat.icon}
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
      </HeroSection>

      <FeatureGrid
        features={features}
        title="Platform Capabilities"
        subtitle="Everything you need for comprehensive code security and quality analysis"
        columns={4}
        variant="modern"
      />

        {/* Supported Analysis Tools */}
        <section className="py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24" aria-labelledby="tools-title">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16 px-4 sm:px-0">
            <h3 id="tools-title" className="text-responsive-xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">
              Industry-Leading Analysis Tools
            </h3>
            <p className="text-responsive-base text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              We integrate with the most trusted and powerful static analysis tools in the industry
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {supportedTools.map((tool, index) => (
              <Card
                key={index}
                className="modern-card group relative overflow-hidden hover-float-strong cursor-pointer"
              >
                {/* Gradient Top Border */}
                <div className={`h-1 bg-gradient-to-r ${tool.gradient} group-hover:h-2 transition-all duration-300`}></div>

                {/* Coming Soon Badge */}
                {tool.comingSoon && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Coming Soon
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r ${tool.gradient} text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 hover-bounce`}>
                      <FileCode className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 group-hover:text-amber-400 transition-colors group-hover:scale-110">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current group-hover:animate-pulse" />
                      <span className="text-xs sm:text-sm font-medium">{tool.rating}</span>
                    </div>
                  </div>

                  <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300 group-hover:scale-105 leading-tight">
                    {tool.name}
                  </CardTitle>

                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs hover-float-subtle cursor-pointer group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                      {tool.language}
                    </Badge>
                    <Badge variant="outline" className="text-xs hover-float-subtle cursor-pointer group-hover:border-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tool.type}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                    {tool.description}
                  </p>

                  <div className="space-y-2">
                    <h5 className="font-semibold text-sm text-slate-900 dark:text-white">Key Features:</h5>
                    <div className="grid grid-cols-1 gap-1">
                      {tool.features.slice(0, 4).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors duration-200 cursor-pointer group/feature">
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${tool.gradient} mt-1.5 flex-shrink-0 group-hover/feature:scale-125 transition-transform`}></div>
                          <span className="leading-relaxed group-hover/feature:translate-x-1 transition-transform duration-200">{feature}</span>
                        </div>
                      ))}
                      {tool.features.length > 4 && (
                        <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          +{tool.features.length - 4} more features
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 group-hover:border-blue-300 dark:group-hover:border-blue-600 transition-colors">
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer group/download">
                      <Download className="h-3 w-3 sm:h-4 sm:w-4 group-hover/download:animate-bounce" />
                      <span className="text-xs sm:text-sm group-hover/download:font-semibold transition-all">{tool.downloads}</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 hover:text-emerald-500 transition-colors cursor-pointer group/trending">
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 group-hover/trending:scale-110 transition-transform" />
                      <span className="text-xs sm:text-sm font-medium group-hover/trending:font-bold transition-all">Popular</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Developer Section */}
        <section className="py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24" aria-labelledby="developer-title">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16 px-4 sm:px-0">
            <h3 id="developer-title" className="text-responsive-xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">
              Meet the Developer
            </h3>
            <p className="text-responsive-base text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Built with passion by a cybersecurity enthusiast and full-stack developer
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="modern-card hover-float-strong group cursor-pointer overflow-hidden">
              <CardContent className="p-8 sm:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                  {/* Profile Image/Avatar */}
                  <div className="text-center lg:text-left">
                    <div className="w-32 h-32 mx-auto lg:mx-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                      AT
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white">Aditya Kumar Tiwari</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">Cybersecurity Enthusiast | Full-Stack Developer</p>
                      <p className="text-slate-500 dark:text-slate-500 text-xs">BCA in Cybersecurity, Sushant University</p>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="lg:col-span-2 space-y-4">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      Hi, I'm Aditya Kumar Tiwari, a passionate Cybersecurity Specialist and Full-Stack Developer.
                      I thrive at the intersection of technology and innovation, crafting secure and scalable solutions
                      for real-world challenges.
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      Currently pursuing a BCA in Cybersecurity at Sushant University, I specialize in Python, JavaScript,
                      Linux, and Cloud Computing. My mission is to combine security and creativity to build impactful
                      digital experiences.
                    </p>

                    {/* Skills */}
                    <div className="space-y-3">
                      <h5 className="font-semibold text-slate-900 dark:text-white">Core Expertise</h5>
                      <div className="flex flex-wrap gap-2">
                        {['Digital Forensics', 'Python', 'JavaScript', 'Linux', 'Cybersecurity', 'Cloud Computing', 'Web Development'].map((skill, index) => (
                          <Badge key={index} variant="secondary" className="hover-float-subtle cursor-pointer">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="flex flex-wrap gap-4 pt-4">
                      <a
                        href="https://github.com/Xenonesis"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors group"
                      >
                        <Github className="h-4 w-4 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">GitHub</span>
                      </a>
                      <a
                        href="https://www.linkedin.com/in/itisaddy/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors group"
                      >
                        <Users className="h-4 w-4 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">LinkedIn</span>
                      </a>
                      <a
                        href="https://iaddy.netlify.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors group"
                      >
                        <Star className="h-4 w-4 text-slate-600 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400">Portfolio</span>
                      </a>
                      <a
                        href="mailto:itisaddy7@gmail.com"
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900 transition-colors group"
                      >
                        <Award className="h-4 w-4 text-slate-600 dark:text-slate-400 group-hover:text-green-600 dark:group-hover:text-green-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-green-600 dark:group-hover:text-green-400">Contact</span>
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0 shadow-2xl text-white hover-float hover-glow group cursor-pointer">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4 group-hover:scale-105 transition-transform duration-300">Ready to Secure Your Code?</h3>
              <p className="text-blue-100 mb-6 text-lg group-hover:text-white transition-colors duration-300">
                Start analyzing your codebase today with our comprehensive security and quality tools.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 text-lg hover-scale-float group-hover:shadow-xl transition-all duration-300"
              >
                <Link to="/" className="flex items-center gap-2">
                  Get Started Now
                  <Download className="h-5 w-5 group-hover:animate-bounce" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageLayout>
  );
};

export default About;
