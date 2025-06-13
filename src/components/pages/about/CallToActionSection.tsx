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
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0 shadow-2xl text-white hover-float hover-glow group cursor-pointer">
        <CardContent className="p-8">
          <h3 className="text-2xl font-bold mb-4 group-hover:scale-105 transition-transform duration-300">
            Ready to Secure Your Code?
          </h3>
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
  );
};
