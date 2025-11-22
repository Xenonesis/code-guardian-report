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
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-white/20 dark:border-slate-800 shadow-2xl duration-300 animate-in fade-in zoom-in-95">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative pt-8 px-6 pb-2 text-center">
          <div className="mx-auto w-20 h-20 mb-6 relative group cursor-default">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xl ring-1 ring-black/5 dark:ring-white/10 transform transition-transform duration-500 group-hover:scale-105">
              <ShieldCheck className="w-full h-full text-blue-500 dark:text-blue-400" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-red-500 text-white p-1.5 rounded-full border-2 border-white dark:border-slate-900 shadow-sm">
              <AlertTriangle className="w-3 h-3" />
            </div>
          </div>
          
          <DialogTitle className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 mb-3">
            Account Conflict
          </DialogTitle>
          
          <DialogDescription className="text-base text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            You already have an account linked to <span className="font-semibold text-slate-900 dark:text-white">{email}</span>
          </DialogDescription>
        </div>

        {/* Main Content */}
        <div className="px-6 py-6">
          {/* Conflict Visualization Card */}
          <div className="relative bg-slate-50/80 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              
              {/* Attempted Provider (Faded) */}
              <div className="flex flex-col items-center gap-3 group">
                <div className="relative w-14 h-14 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-3.5 opacity-50 grayscale group-hover:opacity-75 group-hover:grayscale-0 transition-all duration-300">
                  {attemptedProviderInfo.icon}
                  <div className="absolute -top-1.5 -right-1.5 bg-slate-200 dark:bg-slate-700 text-slate-500 p-0.5 rounded-full ring-2 ring-white dark:ring-slate-900">
                    <X className="w-3 h-3" />
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Blocked</span>
              </div>

              {/* Connection Line */}
              <div className="flex-1 flex flex-col items-center -mt-4">
                <div className="text-[10px] font-medium text-slate-400 mb-1">Use instead</div>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-50 dark:bg-slate-900 px-2">
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Existing Provider (Highlighted) */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative group cursor-pointer" onClick={onSignInWithExisting}>
                  <div className="absolute -inset-3 bg-blue-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className={cn(
                    "relative w-16 h-16 rounded-xl bg-white dark:bg-slate-800 border-2 flex items-center justify-center p-4 shadow-lg transform transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1",
                    existingProviderInfo.borderColor
                  )}>
                    {existingProviderInfo.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ring-2 ring-white dark:ring-slate-900 animate-bounce-slow">
                    USE THIS
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Recommended</span>
              </div>

            </div>
          </div>

          {/* Explanation Text */}
          <div className="mt-6 flex gap-3 px-2">
            <HelpCircle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              To protect your security, please sign in with your existing account. You can link other login methods in your settings later.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-2 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800/50 flex flex-col gap-3">
          <Button
            onClick={onSignInWithExisting}
            disabled={isLinking}
            className={cn(
              'w-full h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] rounded-xl relative overflow-hidden',
              'bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white border-0'
            )}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300" />
            <div className="relative flex items-center justify-center gap-2">
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
            </div>
          </Button>

          <Button
            variant="ghost"
            onClick={onTryDifferentMethod}
            disabled={isLinking}
            className="w-full h-10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-sm font-normal"
          >
            I want to use a different email address
          </Button>
        </div>

        {/* Technical Details (Subtle) */}
        <div className="absolute bottom-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="p-1 text-slate-300 dark:text-slate-700 hover:text-slate-500 dark:hover:text-slate-500"
            >
                <HelpCircle className="w-3 h-3" />
            </button>
        </div>
        
        {showTechnicalDetails && (
            <div className="absolute inset-0 bg-white/95 dark:bg-slate-950/95 z-50 p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 dark:text-white">Technical Details</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowTechnicalDetails(false)}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>
                <div className="flex-1 overflow-auto font-mono text-xs text-slate-600 dark:text-slate-400 space-y-2">
                    <p>Error: auth/account-exists-with-different-credential</p>
                    <p>Email: {email}</p>
                    <p>Existing Provider: {existingProvider}</p>
                    <p>Attempted Provider: {attemptedProvider}</p>
                </div>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
