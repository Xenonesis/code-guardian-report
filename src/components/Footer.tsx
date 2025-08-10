import * as React from 'react';
import { Shield, Heart, Mail, Github, Globe, Scale, FileText, Code, Building2, Brain, Star, Users, Youtube, Linkedin, ExternalLink, ArrowUp } from 'lucide-react';
import { APP_VERSION_WITH_PREFIX } from '@/utils/version';
import { Button } from '@/components/ui/button';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = {
    main: [
      { id: 'home', label: 'AI Platform', description: 'Next-gen security analysis' },
      { id: 'about', label: 'About', description: 'Enterprise tools' }
    ],
    legal: [
      { id: 'privacy', label: 'Privacy Policy', description: 'Data protection' },
      { id: 'terms', label: 'Terms of Service', description: 'Usage terms' }
    ],
    resources: [
      { path: '#documentation', label: 'Documentation', description: 'User guides' },
      { path: '#api-reference', label: 'API Reference', description: 'Developer docs' },
      { path: '#community', label: 'Community', description: 'Join developers' },
      { path: '#support', label: 'Support', description: 'Get help' }
    ]
  };

  const socialLinks = [
    { name: 'GitHub', icon: Github, href: 'https://github.com/Xenonesis/code-guardian-report' },
    { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/@techiaddy?si=lPZBPOwHtnrFz-mk' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://www.linkedin.com/in/itisaddy/' }
  ];

  return (
    <footer className={`relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 border-t border-slate-200/10 dark:border-slate-700/30 ${className}`}>
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-0 w-32 h-32 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-full blur-2xl animate-pulse-slow"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Shield className="h-7 w-7 text-white" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Code Guardian
                </h3>
                <p style={{ overflowWrap: 'break-word', whiteSpace: 'normal', wordBreak: 'break-word', maxWidth: '100%' }}>AI-Powered Security Platform</p>
              </div>
            </div>
            
            <p className="text-slate-300 mb-8 max-w-md leading-relaxed">
              Revolutionizing code security with advanced AI analysis, real-time threat detection, and comprehensive vulnerability assessment for modern development teams.
            </p>

            {/* Enhanced Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white transition-all duration-300 border border-slate-700/50 hover:border-slate-600/50 hover:scale-110"
                    aria-label={social.name}
                  >
                    <IconComponent className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                <Brain className="h-3 w-3 text-white" />
              </div>
              Platform
            </h4>
            <ul className="space-y-4">
              {footerLinks.main.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => scrollToSection(link.id)}
                    className="text-slate-300 hover:text-white transition-all duration-300 group flex items-center gap-2"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                <FileText className="h-3 w-3 text-white" />
              </div>
              Resources
            </h4>
            <ul className="space-y-4">
              {footerLinks.resources.map((link) => (
                <li key={link.path}>
                  <a
                    href={link.path}
                    className="text-slate-300 hover:text-white transition-all duration-300 group flex items-center gap-2"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.label}
                    </span>
                    {link.path === '#' && <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100" />}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Scale className="h-3 w-3 text-white" />
              </div>
              Legal
            </h4>
            <ul className="space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => scrollToSection(link.id)}
                    className="text-slate-300 hover:text-white transition-all duration-300 group flex items-center gap-2"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Enhanced Bottom Section */}
        <div className="border-t border-slate-700/50 pt-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Copyright and Trust Badge */}
            <div className="flex flex-col sm:flex-row items-center gap-6 text-sm">
              <div className="flex items-center gap-3 text-slate-300">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-400 animate-pulse" />
                  <span>© {currentYear} Code Guardian. Made with love for developers.</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-400/30 backdrop-blur-sm">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-blue-100 font-medium">Trusted by 10K+ developers</span>
              </div>
            </div>

            {/* Contact and Version */}
            <div className="flex items-center gap-4">
              <a
                href="mailto:itisaddy7@gmail.com"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 text-emerald-100 hover:from-emerald-500/30 hover:to-teal-500/30 transition-all duration-300 backdrop-blur-sm"
              >
                <Mail className="h-4 w-4" />
                <span className="text-sm font-medium">Contact</span>
              </a>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                <Code className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-300">{APP_VERSION_WITH_PREFIX}</span>
              </div>
            </div>
          </div>

          {/* Enhanced Compliance Badges */}
          <div className="mt-8 pt-6 border-t border-slate-700/50">
            <div className="flex flex-wrap items-center justify-center gap-8 text-xs text-slate-400">
              <div className="flex items-center gap-2 group">
                <div className="p-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full">
                  <Globe className="h-3 w-3 text-blue-300 group-hover:text-blue-200 transition-colors duration-300" />
                </div>
                <span className="group-hover:text-slate-300 transition-colors duration-300">Global Security Platform</span>
              </div>
              <div className="flex items-center gap-2 group">
                <div className="p-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full">
                  <Shield className="h-3 w-3 text-green-300 group-hover:text-green-200 transition-colors duration-300" />
                </div>
                <span className="group-hover:text-slate-300 transition-colors duration-300">SOC 2 Type II Compliant</span>
              </div>
              <div className="flex items-center gap-2 group">
                <div className="p-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full">
                  <Users className="h-3 w-3 text-purple-300 group-hover:text-purple-200 transition-colors duration-300" />
                </div>
                <span className="group-hover:text-slate-300 transition-colors duration-300">ISO 27001 Certified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll to Top Button */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={scrollToTop}
            variant="ghost"
            size="sm"
            className="group p-3 rounded-full bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white transition-all duration-300 border border-slate-700/50 hover:border-slate-600/50 hover:scale-110"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5 group-hover:-translate-y-1 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;