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
import { AlertTriangle, Mail, X, ChevronDown, ChevronUp, HelpCircle, Loader2, ArrowRight } from 'lucide-react';
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
      <svg className="w-6 h-6" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
  },
  'github.com': {
    name: 'GitHub',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
    color: 'bg-gray-800',
    hoverColor: 'hover:bg-gray-900',
  },
  'password': {
    name: 'Email/Password',
    icon: <Mail className="w-6 h-6" />,
    color: 'bg-indigo-500',
    hoverColor: 'hover:bg-indigo-600',
  },
  'facebook.com': {
    name: 'Facebook',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    color: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
  },
  'twitter.com': {
    name: 'Twitter',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
      </svg>
    ),
    color: 'bg-sky-500',
    hoverColor: 'hover:bg-sky-600',
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

  const handleSignInWithExisting = () => {
    onSignInWithExisting();
  };

  const handleTryDifferent = () => {
    onTryDifferentMethod();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden bg-white dark:bg-gray-900 border-none shadow-2xl">
        {/* Header with warning icon and gradient background */}
        <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-6 pb-8">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-100/40 via-transparent to-transparent dark:from-amber-900/20" />
          
          <DialogHeader className="relative space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 ring-4 ring-amber-50 dark:ring-amber-900/20">
                  <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Account Already Exists
                  </DialogTitle>
                </div>
              </div>
            </div>
            
            <DialogDescription className="text-base text-gray-700 dark:text-gray-300 leading-relaxed pt-2">
              We found an existing account with <strong className="font-semibold text-gray-900 dark:text-gray-100">{email}</strong> from a different sign-in method. 
              To continue, please sign in with your original method first, then you can link additional sign-in options.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-6">
          {/* Visual representation of the conflict */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-6 border border-blue-100 dark:border-blue-900/30">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Sign-in method conflict:
            </p>
            
            <div className="flex items-center justify-between gap-4">
              {/* Attempted provider */}
              <div className="flex-1">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col items-center gap-2">
                    <div className={cn(
                      'w-14 h-14 rounded-full flex items-center justify-center text-white',
                      attemptedProviderInfo.color
                    )}>
                      {attemptedProviderInfo.icon}
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">You tried</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {attemptedProviderInfo.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow/X indicator */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="h-8 w-px bg-gradient-to-b from-red-300 to-green-300 dark:from-red-700 dark:to-green-700 my-1" />
                <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </div>

              {/* Existing provider */}
              <div className="flex-1">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-2 border-green-500 dark:border-green-600">
                  <div className="flex flex-col items-center gap-2">
                    <div className={cn(
                      'w-14 h-14 rounded-full flex items-center justify-center text-white ring-2 ring-green-500 dark:ring-green-600',
                      existingProviderInfo.color
                    )}>
                      {existingProviderInfo.icon}
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">Use this instead</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {existingProviderInfo.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading indicator when linking is in process */}
          {isLinking && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Processing account link...
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Please wait while we connect your accounts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Help section */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Why is this happening?
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  For security reasons, each email can only have one account. You previously signed up with {existingProviderInfo.name}. 
                  After signing in, you can link {attemptedProviderInfo.name} to your account from your profile settings.
                </p>
              </div>
            </div>
          </div>

          {/* Technical details (collapsible) */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="flex items-center justify-between w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <span className="font-medium">Technical Details</span>
              {showTechnicalDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            
            {showTechnicalDetails && (
              <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-400 font-medium">Error Code:</dt>
                    <dd className="text-gray-900 dark:text-gray-100 font-mono">auth/account-exists-with-different-credential</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-400 font-medium">Email:</dt>
                    <dd className="text-gray-900 dark:text-gray-100 font-mono">{email}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-400 font-medium">Existing Provider:</dt>
                    <dd className="text-gray-900 dark:text-gray-100 font-mono">{existingProvider}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-400 font-medium">Attempted Provider:</dt>
                    <dd className="text-gray-900 dark:text-gray-100 font-mono">{attemptedProvider}</dd>
                  </div>
                </dl>
              </div>
            )}
          </div>

          {/* Help documentation link */}
          <div className="text-center">
            <a
              href="https://firebase.google.com/docs/auth/web/account-linking"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              Learn more about account linking
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Footer with action buttons */}
        <DialogFooter className="bg-gray-50 dark:bg-gray-800/50 p-6 border-t border-gray-200 dark:border-gray-700 flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleTryDifferent}
            disabled={isLinking}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Try Different Sign-In Method
          </Button>
          
          <Button
            onClick={handleSignInWithExisting}
            disabled={isLinking}
            className={cn(
              'w-full sm:w-auto order-1 sm:order-2 gap-2',
              existingProviderInfo.color,
              existingProviderInfo.hoverColor,
              'text-white shadow-lg hover:shadow-xl transition-all'
            )}
          >
            {isLinking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <span className="flex items-center gap-2">
                  {existingProviderInfo.icon}
                  Sign In with {existingProviderInfo.name}
                </span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
