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
    <section className={`text-center relative ${className}`}>
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full blur-2xl animate-bounce"></div>
      </div>
      
      <Card className="relative overflow-hidden bg-gradient-to-br from-white/95 to-blue-50/95 dark:from-slate-800/95 dark:to-blue-900/95 backdrop-blur-2xl border border-white/30 dark:border-white/10 rounded-3xl shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-700 group cursor-pointer">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        {/* Floating elements */}
        <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-1000"></div>
        <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-tr from-pink-400/20 to-orange-400/20 rounded-full blur-lg group-hover:scale-125 transition-transform duration-1000 delay-200"></div>
        
        <CardContent className="relative z-10 p-8 sm:p-12">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-700 to-purple-700 dark:from-white dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-500">
              Ready to Secure Your Code?
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-8 text-lg leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-500">
              Start analyzing your codebase today with our comprehensive security and quality tools. 
              Join thousands of developers who trust Code Guardian for their security needs.
            </p>
            
            {/* Enhanced CTA Button */}
            <div className="relative inline-block">
              <Button
                asChild
                size="lg"
                className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold px-10 py-4 text-lg rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-500 border-0 focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-600"
              >
                <Link to="/" className="flex items-center gap-3 relative z-10">
                  <span>Get Started Now</span>
                  <Download className="h-5 w-5 group-hover:animate-bounce transition-transform duration-300" />
                </Link>
              </Button>
              
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500 -z-10"></div>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>25,000+ Developers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
                <span>150,000+ Vulnerabilities Found</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-500"></div>
                <span>Free Forever</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
