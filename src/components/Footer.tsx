import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Heart, Mail, Github, Globe, Scale, FileText, Code, Bot, Building2, Brain, Sparkles, Rocket, Star, Users, Award, Twitter, Linkedin, ExternalLink } from 'lucide-react';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    main: [
      { path: '/', label: 'AI Platform', icon: <Brain className="h-4 w-4" />, description: 'Next-gen security analysis' },
      { path: '/about', label: 'Solutions', icon: <Building2 className="h-4 w-4" />, description: 'Enterprise tools' }
    ],
    legal: [
      { path: '/privacy', label: 'Privacy Policy', icon: <Shield className="h-4 w-4" />, description: 'Data protection' },
      { path: '/terms', label: 'Terms of Service', icon: <Scale className="h-4 w-4" />, description: 'Usage terms' }
    ],
    resources: [
      { path: '#', label: 'Documentation', icon: <FileText className="h-4 w-4" />, description: 'User guides' },
      { path: '#', label: 'API Reference', icon: <Code className="h-4 w-4" />, description: 'Developer docs' },
      { path: '#', label: 'Community', icon: <Users className="h-4 w-4" />, description: 'Join developers' },
      { path: '#', label: 'Support', icon: <Rocket className="h-4 w-4" />, description: 'Get help' }
    ]
  };

  const socialLinks = [
    { name: 'GitHub', icon: Github, href: '#', gradient: 'from-gray-600 to-gray-800' },
    { name: 'Twitter', icon: Twitter, href: '#', gradient: 'from-blue-500 to-blue-600' },
    { name: 'LinkedIn', icon: Linkedin, href: '#', gradient: 'from-blue-600 to-blue-700' }
  ];

  return (
    <footer className={`relative mt-20 sm:mt-24 lg:mt-32 ${className}`}>
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-48 h-48 bg-gradient-to-r from-blue-500/15 via-purple-500/15 to-pink-500/15 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-0 right-1/4 w-36 h-36 bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-cyan-500/15 rounded-full blur-2xl animate-float-slow"></div>
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-full blur-xl animate-float-delayed"></div>
      </div>

      <div className="relative z-10 bg-gradient-to-b from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-950/95 backdrop-blur-2xl border-t-2 border-blue-500/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-16">
            {/* Enhanced Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-8">
                <div className="relative p-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl group hover:scale-110 transition-all duration-500">
                  <Shield className="h-8 w-8 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">Code Guardian</h3>
                  <p className="text-base text-slate-600 dark:text-slate-400 font-semibold">Next-Gen AI Security Platform</p>
                </div>
              </div>

              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-8 max-w-lg text-base">
                Revolutionary AI-powered security analysis platform that transforms how development teams approach code security.
                Advanced threat detection, real-time vulnerability assessment, and intelligent compliance monitoring for enterprise-scale applications.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 group hover:scale-105 transition-all duration-300">
                  <Brain className="h-5 w-5 text-blue-600 group-hover:animate-pulse" />
                  <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">AI-Powered Analysis</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800 group hover:scale-105 transition-all duration-300">
                  <Shield className="h-5 w-5 text-purple-600 group-hover:animate-pulse" />
                  <span className="text-sm font-semibold text-purple-900 dark:text-purple-100">Enterprise Security</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 group hover:scale-105 transition-all duration-300">
                  <Rocket className="h-5 w-5 text-emerald-600 group-hover:animate-pulse" />
                  <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Real-Time Scanning</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-200 dark:border-orange-800 group hover:scale-105 transition-all duration-300">
                  <Award className="h-5 w-5 text-orange-600 group-hover:animate-pulse" />
                  <span className="text-sm font-semibold text-orange-900 dark:text-orange-100">Compliance Ready</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="p-3 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600 hover:scale-110 transition-all duration-300 group"
                    aria-label={social.name}
                  >
                    <social.icon className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-300" />
                  </a>
                ))}
              </div>
            </div>

            {/* Enhanced Navigation Links */}
            <div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                Platform
              </h4>
              <ul className="space-y-4">
                {footerLinks.main.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="group block p-3 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-950/30 dark:hover:to-indigo-950/30 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <span className="group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 text-blue-600">
                          {link.icon}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-900 dark:group-hover:text-blue-100">{link.label}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 ml-7">{link.description}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Enhanced Resources Links */}
            <div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Rocket className="h-5 w-5 text-emerald-500" />
                Resources
              </h4>
              <ul className="space-y-4">
                {footerLinks.resources.slice(0, 2).map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="group block p-3 rounded-2xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-950/30 dark:hover:to-teal-950/30 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <span className="group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 text-emerald-600">
                          {link.icon}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-900 dark:group-hover:text-emerald-100">{link.label}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 ml-7">{link.description}</p>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Legal Links */}
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-6 mt-8 flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-500" />
                Legal
              </h4>
              <ul className="space-y-4">
                {footerLinks.legal.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="group block p-3 rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-950/30 dark:hover:to-pink-950/30 border border-transparent hover:border-purple-200 dark:hover:border-purple-800 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <span className="group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 text-purple-600">
                          {link.icon}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white group-hover:text-purple-900 dark:group-hover:text-purple-100">{link.label}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 ml-7">{link.description}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Enhanced Footer Bottom */}
          <div className="pt-12 border-t-2 border-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-3 text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold">© {currentYear} Code Guardian.</span>
                  <span className="text-base">Crafted with</span>
                  <Heart className="h-5 w-5 text-red-500 animate-pulse" />
                  <span className="text-base">for developers worldwide.</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800">
                  <Star className="h-4 w-4 text-yellow-500 animate-pulse" />
                  <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">Trusted by 10K+ developers</span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <a
                  href="mailto:itisaddy7@gmail.com"
                  className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 hover:scale-105 transition-all duration-300 group"
                >
                  <Mail className="h-5 w-5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                  <span className="font-semibold">Contact Us</span>
                </a>
                <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600">
                  <Code className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">v4.0.0</span>
                </div>
              </div>
            </div>

            {/* Additional Footer Info */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-500">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">Global Security Platform</span>
                </div>
                <span className="hidden sm:block text-slate-400">•</span>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-500">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">SOC 2 Type II Compliant</span>
                </div>
                <span className="hidden sm:block text-slate-400">•</span>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-500">
                  <Award className="h-4 w-4" />
                  <span className="text-sm">ISO 27001 Certified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
