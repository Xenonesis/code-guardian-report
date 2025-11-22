// src/components/auth/AccountConflictModal.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Mail, 
  X, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  Loader2, 
  ArrowRight, 
  ArrowDown,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AccountConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  existingProvider: 'google.com' | 'github.com' | 'password' | 'facebook.com' | 'twitter.com';
  attemptedProvider: 'google.com' | 'github.com' | 'password' | 'facebook.com' | 'twitter.com';
  onSignInWithExisting: () => void;
  onTryDifferentMethod: () => void;
  isLinking?: boolean;
}

// Provider configuration with icons and friendly names
const providerConfig = {
  'google.com': {
    name: 'Google',
    icon: (
      <svg className="w-full h-full" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
  },
  'github.com': {
    name: 'GitHub',
    icon: (
      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
    color: 'bg-gray-800',
    hoverColor: 'hover:bg-gray-900',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-200',
  },
  'password': {
    name: 'Email/Password',
    icon: <Mail className="w-full h-full" />,
    color: 'bg-indigo-500',
    hoverColor: 'hover:bg-indigo-600',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-200',
  },
  'facebook.com': {
    name: 'Facebook',
    icon: (
      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    color: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
  },
  'twitter.com': {
    name: 'Twitter',
    icon: (
      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
      </svg>
    ),
    color: 'bg-sky-500',
    hoverColor: 'hover:bg-sky-600',
    textColor: 'text-sky-600',
    borderColor: 'border-sky-200',
  },
};

export const AccountConflictModal: React.FC<AccountConflictModalProps> = ({
  isOpen,
  onClose,
  email,
  existingProvider,
  attemptedProvider,
  onSignInWithExisting,
  onTryDifferentMethod,
  isLinking = false,
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  
  const existingProviderInfo = providerConfig[existingProvider];
  const attemptedProviderInfo = providerConfig[attemptedProvider];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] p-0 overflow-hidden bg-white dark:bg-gray-950 border-none shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-white dark:bg-gray-950 p-6 pb-2 text-center">
          <div className="mx-auto w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-4 ring-8 ring-amber-50/50 dark:ring-amber-900/10">
            <ShieldCheck className="w-8 h-8 text-amber-500" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Account Already Exists
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            It looks like you already have an account with <span className="font-semibold text-gray-900 dark:text-gray-200">{email}</span>.
          </DialogDescription>
        </div>

        {/* Main Content */}
        <div className="px-6 py-4">
          {/* Conflict Visualization */}
          <div className="relative bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800">
            {/* Connector Lines */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 hidden sm:block z-0" />
            <div className="absolute left-1/2 top-0 w-0.5 h-full bg-gray-200 dark:bg-gray-700 -translate-x-1/2 block sm:hidden z-0" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8 sm:gap-0">
              
              {/* Attempted Provider (Blocked) */}
              <div className="flex flex-col items-center w-32">
                <div className="relative group">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center p-4 grayscale opacity-70 shadow-sm">
                    {attemptedProviderInfo.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 p-1 rounded-full border border-gray-200 dark:border-gray-600">
                    <X className="w-3 h-3" />
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">You Tried</p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{attemptedProviderInfo.name}</p>
                </div>
              </div>

              {/* Direction Indicator */}
              <div className="bg-white dark:bg-gray-800 p-2 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm z-10">
                <ArrowRight className="w-5 h-5 text-gray-400 hidden sm:block" />
                <ArrowDown className="w-5 h-5 text-gray-400 block sm:hidden" />
              </div>

              {/* Existing Provider (Recommended) */}
              <div className="flex flex-col items-center w-32">
                <div className="relative group">
                  <div className="absolute -inset-3 bg-green-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className={cn(
                    "relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white dark:bg-gray-800 border-2 flex items-center justify-center p-5 shadow-xl transform transition-transform hover:scale-105",
                    existingProviderInfo.borderColor
                  )}>
                    {existingProviderInfo.icon}
                  </div>
                  <div className="absolute -top-3 -right-3 bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider border-2 border-white dark:border-gray-900">
                    Use This
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide mb-0.5">Existing Account</p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">{existingProviderInfo.name}</p>
                </div>
              </div>

            </div>
          </div>

          {/* Explanation */}
          <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
            <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-medium mb-1">Why is this happening?</p>
              <p className="text-blue-700 dark:text-blue-300 leading-relaxed opacity-90">
                For security, we only allow one account per email address. Please sign in with your existing method first. You can link other login methods in your settings later.
              </p>
            </div>
          </div>

          {/* Technical Details Toggle */}
          <div className="mt-4">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mx-auto"
            >
              <span>Technical Details</span>
              {showTechnicalDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            
            {showTechnicalDetails && (
              <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 font-mono text-[10px] text-gray-600 dark:text-gray-400 space-y-1">
                <p>Error: auth/account-exists-with-different-credential</p>
                <p>Email: {email}</p>
                <p>Existing: {existingProvider}</p>
                <p>Attempted: {attemptedProvider}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-6 pt-2 bg-white dark:bg-gray-950 flex-col sm:flex-row gap-3 border-t-0">
          <Button
            variant="ghost"
            onClick={onTryDifferentMethod}
            disabled={isLinking}
            className="w-full sm:w-auto text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            Try Different Email
          </Button>
          
          <Button
            onClick={onSignInWithExisting}
            disabled={isLinking}
            className={cn(
              'w-full sm:w-auto sm:flex-1 gap-2 h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all',
              existingProviderInfo.color,
              existingProviderInfo.hoverColor,
              'text-white'
            )}
          >
            {isLinking ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting Accounts...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Sign in with {existingProviderInfo.name}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
