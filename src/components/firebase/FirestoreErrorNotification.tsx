// src/components/FirestoreErrorNotification.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FirestoreErrorInfo, getErrorRecoveryAction } from '../../lib/firestore-error-handler';
import { X, RefreshCw, LogIn, Wifi, Clock, AlertTriangle, Lock, Search, Zap } from 'lucide-react';

interface ErrorNotification {
  id: string;
  errorInfo: FirestoreErrorInfo;
  operation: string;
  docPath: string;
  timestamp: Date;
  isExiting?: boolean;
}

// Friendly operation labels (no technical paths shown to users)
const getOperationLabel = (operation: string): string => {
  switch (operation) {
    case 'read': return 'loading data';
    case 'write': return 'saving changes';
    case 'delete': return 'removing data';
    case 'update': return 'updating data';
    default: return 'processing request';
  }
};

export const FirestoreErrorNotification: React.FC = () => {
  const [errors, setErrors] = useState<ErrorNotification[]>([]);

  useEffect(() => {
    const handleFirestoreError = (event: CustomEvent) => {
      const { errorInfo, operation, docPath } = event.detail;
      
      const newError: ErrorNotification = {
        id: Date.now().toString(),
        errorInfo,
        operation,
        docPath,
        timestamp: new Date()
      };

      setErrors(prev => [...prev, newError]);

      // Auto-remove error after 10 seconds for non-critical errors
      if (errorInfo.code !== 'permission-denied' && errorInfo.code !== 'circuit-breaker') {
        setTimeout(() => {
          setErrors(prev => prev.filter(e => e.id !== newError.id));
        }, 10000);
      }
    };

    window.addEventListener('firestore-error', handleFirestoreError as EventListener);

    return () => {
      window.removeEventListener('firestore-error', handleFirestoreError as EventListener);
    };
  }, []);

  const dismissError = useCallback((id: string) => {
    // Animate out before removing
    setErrors(prev => prev.map(e => 
      e.id === id ? { ...e, isExiting: true } : e
    ));
    setTimeout(() => {
      setErrors(prev => prev.filter(e => e.id !== id));
    }, 200);
  }, []);

  const handleRecoveryAction = (errorInfo: FirestoreErrorInfo) => {
    const action = getErrorRecoveryAction(errorInfo);
    if (action) {
      action();
    }
  };

  const getErrorIcon = (code: string) => {
    const iconClass = "w-5 h-5 flex-shrink-0";
    switch (code) {
      case 'permission-denied':
        return <Lock className={iconClass} />;
      case 'not-found':
        return <Search className={iconClass} />;
      case 'network-error':
      case 'unavailable':
        return <Wifi className={iconClass} />;
      case 'offline':
        return <Wifi className={`${iconClass} opacity-50`} />;
      case 'circuit-breaker':
        return <Zap className={iconClass} />;
      default:
        return <AlertTriangle className={iconClass} />;
    }
  };

  const getErrorStyles = (code: string) => {
    switch (code) {
      case 'permission-denied':
        return {
          container: 'bg-red-500/10 border-red-500/30 dark:bg-red-900/20 dark:border-red-500/40',
          text: 'text-red-700 dark:text-red-300',
          button: 'bg-red-500/20 hover:bg-red-500/30 text-red-700 dark:text-red-300'
        };
      case 'not-found':
        return {
          container: 'bg-amber-500/10 border-amber-500/30 dark:bg-amber-900/20 dark:border-amber-500/40',
          text: 'text-amber-700 dark:text-amber-300',
          button: 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300'
        };
      case 'network-error':
      case 'unavailable':
      case 'offline':
        return {
          container: 'bg-blue-500/10 border-blue-500/30 dark:bg-blue-900/20 dark:border-blue-500/40',
          text: 'text-blue-700 dark:text-blue-300',
          button: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-700 dark:text-blue-300'
        };
      case 'circuit-breaker':
        return {
          container: 'bg-orange-500/10 border-orange-500/30 dark:bg-orange-900/20 dark:border-orange-500/40',
          text: 'text-orange-700 dark:text-orange-300',
          button: 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-700 dark:text-orange-300'
        };
      default:
        return {
          container: 'bg-gray-500/10 border-gray-500/30 dark:bg-gray-700/30 dark:border-gray-500/40',
          text: 'text-gray-700 dark:text-gray-300',
          button: 'bg-gray-500/20 hover:bg-gray-500/30 text-gray-700 dark:text-gray-300'
        };
    }
  };

  const getActionIcon = (action: string | undefined) => {
    switch (action) {
      case 'retry':
      case 'refresh':
        return <RefreshCw className="w-3.5 h-3.5 mr-1.5" />;
      case 'login':
        return <LogIn className="w-3.5 h-3.5 mr-1.5" />;
      case 'check-connection':
        return <Wifi className="w-3.5 h-3.5 mr-1.5" />;
      case 'wait':
        return <Clock className="w-3.5 h-3.5 mr-1.5" />;
      default:
        return null;
    }
  };

  const getActionLabel = (action: string | undefined): string => {
    switch (action) {
      case 'retry': return 'Try Again';
      case 'refresh': return 'Refresh';
      case 'login': return 'Sign In';
      case 'check-connection': return 'Check Connection';
      case 'wait': return 'Please Wait';
      case 'update': return 'Update';
      default: return 'Retry';
    }
  };

  if (errors.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full px-4 sm:px-0">
      {errors.map((error) => {
        const styles = getErrorStyles(error.errorInfo.code);
        return (
          <div
            key={error.id}
            className={`
              rounded-xl border backdrop-blur-sm p-4 shadow-xl
              transition-all duration-200 ease-out
              ${styles.container}
              ${error.isExiting ? 'opacity-0 translate-x-4 scale-95' : 'opacity-100 translate-x-0 scale-100'}
            `}
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 ${styles.text}`}>
                {getErrorIcon(error.errorInfo.code)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-snug ${styles.text}`}>
                  {error.errorInfo.userMessage}
                </p>
                <p className={`text-xs mt-1 opacity-70 ${styles.text}`}>
                  Error while {getOperationLabel(error.operation)}
                </p>
                {/* Only show technical details in development */}
                {import.meta.env.DEV && (
                  <p className="text-xs mt-1.5 font-mono opacity-50 truncate text-gray-500 dark:text-gray-400">
                    {error.docPath}
                  </p>
                )}
              </div>
              <button
                onClick={() => dismissError(error.id)}
                className={`p-1 rounded-lg transition-colors opacity-60 hover:opacity-100 ${styles.text}`}
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error.errorInfo.suggestedAction && error.errorInfo.suggestedAction !== 'wait' && (
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => handleRecoveryAction(error.errorInfo)}
                  className={`
                    inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg
                    transition-colors ${styles.button}
                  `}
                >
                  {getActionIcon(error.errorInfo.suggestedAction)}
                  {getActionLabel(error.errorInfo.suggestedAction)}
                </button>
                <button
                  onClick={() => dismissError(error.id)}
                  className={`px-3 py-1.5 text-xs rounded-lg opacity-60 hover:opacity-100 transition-opacity ${styles.text}`}
                >
                  Dismiss
                </button>
              </div>
            )}

            {error.errorInfo.suggestedAction === 'wait' && (
              <div className={`mt-3 flex items-center gap-2 text-xs ${styles.text} opacity-70`}>
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>Retrying automatically...</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};