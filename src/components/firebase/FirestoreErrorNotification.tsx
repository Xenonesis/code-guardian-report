// src/components/FirestoreErrorNotification.tsx
import React, { useState, useEffect } from 'react';
import { FirestoreErrorInfo, getErrorRecoveryAction } from '../../lib/firestore-error-handler';

interface ErrorNotification {
  id: string;
  errorInfo: FirestoreErrorInfo;
  operation: string;
  docPath: string;
  timestamp: Date;
}

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

  const dismissError = (id: string) => {
    setErrors(prev => prev.filter(e => e.id !== id));
  };

  const handleRecoveryAction = (errorInfo: FirestoreErrorInfo) => {
    const action = getErrorRecoveryAction(errorInfo);
    if (action) {
      action();
    }
  };

  const getErrorIcon = (code: string) => {
    switch (code) {
      case 'permission-denied':
        return '🔒';
      case 'not-found':
        return '🔍';
      case 'network-error':
      case 'unavailable':
        return '🌐';
      case 'offline':
        return '📡';
      case 'circuit-breaker':
        return '⚡';
      default:
        return '⚠️';
    }
  };

  const getErrorColor = (code: string) => {
    switch (code) {
      case 'permission-denied':
        return 'border-red-500 bg-red-50 text-red-800';
      case 'not-found':
        return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      case 'network-error':
      case 'unavailable':
      case 'offline':
        return 'border-blue-500 bg-blue-50 text-blue-800';
      case 'circuit-breaker':
        return 'border-orange-500 bg-orange-50 text-orange-800';
      default:
        return 'border-gray-500 bg-gray-50 text-gray-800';
    }
  };

  if (errors.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {errors.map((error) => (
        <div
          key={error.id}
          className={`rounded-lg border-2 p-4 shadow-lg ${getErrorColor(error.errorInfo.code)}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-2">
              <span className="text-lg">{getErrorIcon(error.errorInfo.code)}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {error.errorInfo.userMessage}
                </p>
                {import.meta.env.DEV && (
                  <p className="text-xs mt-1 opacity-75">
                    {error.operation} operation on {error.docPath}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => dismissError(error.id)}
              className="text-current opacity-50 hover:opacity-75 ml-2"
            >
              ✕
            </button>
          </div>

          {error.errorInfo.suggestedAction && (
            <div className="mt-3 flex space-x-2">
              <button
                onClick={() => handleRecoveryAction(error.errorInfo)}
                className="px-3 py-1 text-xs bg-current bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
              >
                {error.errorInfo.suggestedAction === 'retry' && 'Retry'}
                {error.errorInfo.suggestedAction === 'refresh' && 'Refresh'}
                {error.errorInfo.suggestedAction === 'login' && 'Sign In'}
                {error.errorInfo.suggestedAction === 'check-connection' && 'Check Connection'}
                {error.errorInfo.suggestedAction === 'wait' && 'Wait'}
                {error.errorInfo.suggestedAction === 'update' && 'Update'}
              </button>
              <button
                onClick={() => dismissError(error.id)}
                className="px-3 py-1 text-xs opacity-60 hover:opacity-80 transition-opacity"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="mt-2 text-xs opacity-60">
            {error.timestamp.toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
};