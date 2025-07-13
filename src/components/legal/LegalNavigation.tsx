import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Scale, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const LegalNavigation: React.FC = () => {
  const location = useLocation();

  const legalPages = [
    {
      path: '/privacy',
      title: 'Privacy Policy',
      description: 'How we protect and handle your data',
      icon: <Shield className="h-5 w-5" />,
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      path: '/terms',
      title: 'Terms of Service',
      description: 'Rules and guidelines for using our service',
      icon: <Scale className="h-5 w-5" />,
      gradient: 'from-purple-500 to-pink-500'
    }
  ];

  const currentPage = legalPages.find(page => page.path === location.pathname);
  const otherPage = legalPages.find(page => page.path !== location.pathname);

  if (!otherPage) return null;

  return (
    <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Related Legal Documents
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Complete your understanding of our policies
        </p>
      </div>

      <Link
        to={otherPage.path}
        className="glass-card-ultra enhanced-card-hover glow-on-hover block p-6 rounded-2xl group"
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 bg-gradient-to-r ${otherPage.gradient} rounded-xl text-white group-hover:scale-110 transition-transform duration-300`}>
            {otherPage.icon}
          </div>
          
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
              {otherPage.title}
            </h4>
            <p className="text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">
              {otherPage.description}
            </p>
          </div>
          
          <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
        </div>
      </Link>
    </div>
  );
};

export default LegalNavigation;
