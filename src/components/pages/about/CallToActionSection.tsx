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
    <section className={`text-center ${className}`}>
      <Card className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-blue-600 dark:to-indigo-600 border border-blue-200 dark:border-0 shadow-2xl text-slate-800 dark:text-white hover-float hover-glow group cursor-pointer">
        <CardContent className="p-8">
          <h3 className="text-2xl font-bold mb-4 group-hover:scale-105 transition-transform duration-300 text-slate-800 dark:text-white">
            Ready to Secure Your Code?
          </h3>
          <p className="text-slate-600 dark:text-slate-200 mb-6 text-lg group-hover:text-slate-700 dark:group-hover:text-white transition-colors duration-300">
            Start analyzing your codebase today with our comprehensive security and quality tools.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-blue-600 dark:bg-white text-white dark:text-blue-600 hover:bg-blue-700 dark:hover:bg-blue-50 hover:text-white dark:hover:text-blue-700 border-2 border-blue-600 dark:border-blue-600 shadow-xl font-semibold px-8 py-3 text-lg rounded-2xl focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-400 transition-all duration-300 outline-none ring-2 ring-blue-400 dark:ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 [box-shadow:0_0_16px_4px_rgba(59,130,246,0.35)] hover:[box-shadow:0_0_32px_8px_rgba(59,130,246,0.55)] dark:[box-shadow:0_0_16px_4px_rgba(59,130,246,0.4)] dark:hover:[box-shadow:0_0_32px_8px_rgba(59,130,246,0.6)]"
          >
            <Link to="/" className="flex items-center gap-2 text-white dark:text-blue-600 hover:text-white dark:hover:text-blue-700">
              Get Started Now
              <Download className="h-5 w-5 group-hover:animate-bounce" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
};
