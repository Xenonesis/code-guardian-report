import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-0 shadow-2xl animate-fade-in">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-full w-fit">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                Oops! Something went wrong
              </CardTitle>
              <CardDescription className="text-lg text-slate-600 dark:text-slate-300">
                We encountered an unexpected error. Don't worry, we're here to help!
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Alert className="border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  <strong>Error:</strong> {this.state.error?.message || 'An unknown error occurred'}
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">What you can do:</h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                    Try refreshing the page or retrying the action
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                    Check your internet connection
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                    Clear your browser cache and cookies
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                    If the problem persists, try uploading a smaller file
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  onClick={this.handleRetry}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus-ring"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button 
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2 focus-ring"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <summary className="cursor-pointer font-medium text-slate-900 dark:text-white mb-2">
                    Developer Information
                  </summary>
                  <div className="space-y-2 text-xs font-mono text-slate-600 dark:text-slate-400">
                    <div>
                      <strong>Error Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">{this.state.error?.stack}</pre>
                    </div>
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
