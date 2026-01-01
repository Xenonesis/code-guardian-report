"use client";

import { useEffect } from "react";
import { AlertOctagon, RefreshCcw, Home } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global Error Boundary
 * Catches errors that occur in the root layout
 * Must include its own html/body tags as it replaces the entire document
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log critical error
    console.error("Critical Application Error:", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>Application Error - Code Guardian Enterprise</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            color: #e2e8f0;
          }
          
          .error-container {
            max-width: 28rem;
            width: 100%;
            background: rgba(30, 41, 59, 0.8);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(148, 163, 184, 0.2);
            border-radius: 1rem;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }
          
          .error-header {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(249, 115, 22, 0.15));
            padding: 1.5rem;
            border-bottom: 1px solid rgba(148, 163, 184, 0.1);
            display: flex;
            align-items: center;
            gap: 1rem;
          }
          
          .error-icon {
            width: 3.5rem;
            height: 3.5rem;
            background: linear-gradient(135deg, #ef4444, #f97316);
            border-radius: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.3);
          }
          
          .error-icon svg {
            width: 1.75rem;
            height: 1.75rem;
            color: white;
          }
          
          .error-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: #f8fafc;
          }
          
          .error-subtitle {
            font-size: 0.875rem;
            color: #94a3b8;
            margin-top: 0.25rem;
          }
          
          .error-content {
            padding: 1.5rem;
          }
          
          .error-message {
            color: #94a3b8;
            line-height: 1.6;
            margin-bottom: 1.5rem;
          }
          
          .error-digest {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem;
            background: rgba(15, 23, 42, 0.5);
            border: 1px solid rgba(148, 163, 184, 0.1);
            border-radius: 0.5rem;
            margin-bottom: 1.5rem;
          }
          
          .error-digest-label {
            font-size: 0.75rem;
            color: #64748b;
          }
          
          .error-digest-code {
            font-family: 'SF Mono', Monaco, 'Courier New', monospace;
            font-size: 0.75rem;
            color: #f8fafc;
          }
          
          .action-buttons {
            display: flex;
            gap: 0.75rem;
          }
          
          .btn {
            flex: 1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.875rem 1.25rem;
            font-size: 0.875rem;
            font-weight: 600;
            border-radius: 0.75rem;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
          }
          
          .btn-primary {
            background: linear-gradient(135deg, #3b82f6, #6366f1);
            color: white;
          }
          
          .btn-primary:hover {
            background: linear-gradient(135deg, #2563eb, #4f46e5);
            transform: translateY(-1px);
            box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.4);
          }
          
          .btn-secondary {
            background: rgba(71, 85, 105, 0.5);
            color: #e2e8f0;
            border: 1px solid rgba(148, 163, 184, 0.2);
          }
          
          .btn-secondary:hover {
            background: rgba(71, 85, 105, 0.7);
          }
          
          .error-footer {
            padding: 1rem;
            background: rgba(15, 23, 42, 0.3);
            border-top: 1px solid rgba(148, 163, 184, 0.1);
            text-align: center;
          }
          
          .error-footer p {
            font-size: 0.75rem;
            color: #64748b;
          }
          
          .error-footer a {
            color: #3b82f6;
            text-decoration: none;
            font-weight: 500;
          }
          
          .error-footer a:hover {
            text-decoration: underline;
          }
          
          @media (max-width: 480px) {
            .action-buttons {
              flex-direction: column;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="error-container">
          <div className="error-header">
            <div className="error-icon">
              <AlertOctagon />
            </div>
            <div>
              <h1 className="error-title">Critical Error</h1>
              <p className="error-subtitle">Application failed to load</p>
            </div>
          </div>

          <div className="error-content">
            <p className="error-message">
              We encountered a critical error that prevented the application
              from loading properly. Our team has been automatically notified.
              Please try refreshing the page.
            </p>

            {error.digest && (
              <div className="error-digest">
                <span className="error-digest-label">Error ID:</span>
                <code className="error-digest-code">{error.digest}</code>
              </div>
            )}

            <div className="action-buttons">
              <button onClick={reset} className="btn btn-primary">
                <RefreshCcw size={16} />
                Reload App
              </button>
              <a href="/" className="btn btn-secondary">
                <Home size={16} />
                Go Home
              </a>
            </div>
          </div>

          <div className="error-footer">
            <p>
              Need help? Contact our{" "}
              <a href="mailto:support@codeguardian.dev">support team</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
