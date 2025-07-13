import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Heart, Mail, Github, Globe, Scale, FileText, Code, Bot, Building2 } from 'lucide-react';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    main: [
      { path: '/', label: 'Home', icon: <Globe className="h-4 w-4" /> },
      { path: '/about', label: 'About', icon: <Code className="h-4 w-4" /> }
    ],
    legal: [
      { path: '/privacy', label: 'Privacy Policy', icon: <Shield className="h-4 w-4" /> },
      { path: '/terms', label: 'Terms of Service', icon: <Scale className="h-4 w-4" /> }
    ]
  };

  return (
    <footer className={`relative mt-16 sm:mt-20 lg:mt-24 ${className}`}>
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
        <div className="absolute top-0 right-1/4 w-24 h-24 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-xl"></div>
      </div>

      <div className="relative z-10 glass-card-ultra border-t border-white/20 dark:border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Code Guardian</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Enterprise Security Platform</p>
                </div>
              </div>
              
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6 max-w-md">
                Enterprise-grade static code analysis platform designed for modern development teams.
                Comprehensive security assessments, vulnerability detection, and compliance reporting for mission-critical applications.
              </p>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Enterprise Security</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Bot className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium">AI-Powered</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium">Compliance Ready</span>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Navigation</h4>
              <ul className="space-y-3">
                {footerLinks.main.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-300 group"
                    >
                      <span className="group-hover:scale-110 transition-transform duration-300">
                        {link.icon}
                      </span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-300 group"
                    >
                      <span className="group-hover:scale-110 transition-transform duration-300">
                        {link.icon}
                      </span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span className="text-sm">© {currentYear} Code Guardian.</span>
                <span className="text-sm">Made with</span>
                <Heart className="h-4 w-4 text-red-500 animate-pulse" />
                <span className="text-sm">for developers worldwide.</span>
              </div>
              
              <div className="flex items-center gap-4">
                <a
                  href="mailto:itisaddy7@gmail.com"
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-300 group"
                >
                  <Mail className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm">Contact</span>
                </a>
                <span className="text-slate-400">•</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">v3.3.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
