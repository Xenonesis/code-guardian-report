import React from 'react';
import { Link } from 'react-router-dom';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CallToActionSectionProps {
  className?: string;
}

export const CallToActionSection: React.FC<CallToActionSectionProps> = ({ className = '' }) => {
  return (
    <section className={`text-center relative py-16 sm:py-20 ${className}`}>
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-gradient-to-r from-blue-500/30 via-purple-500/20 to-pink-500/30 rounded-full blur-3xl float-animation"></div>
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-gradient-to-r from-emerald-500/25 to-teal-500/25 rounded-full blur-2xl float-animation delay-2s"></div>
        <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full blur-xl float-animation delay-4s"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <Card className="glass-card-ultra enhanced-card-hover glow-on-hover relative overflow-hidden group max-w-4xl mx-auto">
          {/* Enhanced Animated Gradient Overlay */}
          <div className="animated-border absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

          {/* Enhanced Floating Elements */}
          <div className="absolute top-6 right-6 w-20 h-20 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-pink-500/30 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000 float-animation"></div>
          <div className="absolute bottom-6 left-6 w-16 h-16 bg-gradient-to-tr from-emerald-500/25 to-teal-500/25 rounded-full blur-xl group-hover:scale-125 transition-transform duration-1000 delay-200 float-animation delay-2s"></div>

          {/* Particle System */}
          <div className="particle-system opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="particle" style={{ left: '20%', animationDelay: '0s' }}></div>
            <div className="particle" style={{ left: '80%', animationDelay: '3s' }}></div>
            <div className="particle" style={{ left: '50%', animationDelay: '6s' }}></div>
          </div>
        
          <CardContent className="relative z-10 p-10 sm:p-16">
            <div className="max-w-3xl mx-auto">
              {/* Enhanced Title */}
              <h3 className="text-4xl sm:text-5xl font-bold mb-8 gradient-text-animated group-hover:scale-105 transition-transform duration-500">
                Ready to Secure Your Code?
              </h3>

              {/* Enhanced Description */}
              <div className="glass-card-ultra p-6 mb-10">
                <p className="text-xl text-slate-800 dark:text-slate-200 leading-relaxed">
                  Start analyzing your codebase today with our comprehensive security and quality tools.
                  Join thousands of developers who trust Code Guardian for their security needs.
                </p>
              </div>

              {/* Enhanced CTA Button */}
              <div className="relative inline-block mb-12">
                <Button
                  asChild
                  size="lg"
                  className="btn-enhanced-cta text-white font-bold px-12 py-6 text-xl rounded-3xl shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-500 border-0 focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-600"
                >
                  <Link to="/" className="flex items-center gap-4 relative z-10">
                    <span>Get Started Now</span>
                    <Download className="h-6 w-6 group-hover:animate-bounce transition-transform duration-300" />
                  </Link>
                </Button>
              </div>

              {/* Enhanced Trust Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { label: '25,000+ Developers', color: 'from-green-500 to-emerald-500', delay: '0s' },
                  { label: '150,000+ Vulnerabilities Found', color: 'from-blue-500 to-indigo-500', delay: '0.3s' },
                  { label: 'Free Forever', color: 'from-purple-500 to-pink-500', delay: '0.6s' }
                ].map((item, index) => (
                  <div
                    key={index}
                    className="glass-card-ultra p-4 enhanced-card-hover group"
                    style={{ animationDelay: item.delay }}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <div className={`w-3 h-3 bg-gradient-to-r ${item.color} rounded-full animate-pulse group-hover:scale-125 transition-transform duration-300`}></div>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-300">
                        {item.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
