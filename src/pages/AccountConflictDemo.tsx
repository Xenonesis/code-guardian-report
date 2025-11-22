// src/pages/AccountConflictDemo.tsx
import React, { useState, useEffect } from 'react';
import { AccountConflictModal } from '@/components/auth/AccountConflictModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Provider = 'google.com' | 'github.com' | 'password' | 'facebook.com' | 'twitter.com';

export const AccountConflictDemo: React.FC = () => {
  // Prevent access in production
  useEffect(() => {
    if (import.meta.env.PROD) {
      console.warn('⚠️ Demo pages are not available in production');
      window.location.href = '/';
    }
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [existingProvider, setExistingProvider] = useState<Provider>('password');
  const [attemptedProvider, setAttemptedProvider] = useState<Provider>('google.com');
  const [isLinking, setIsLinking] = useState(false);
  const [email, setEmail] = useState('user@example.com');

  const handleSignInWithExisting = () => {
    console.log('Sign in with existing provider:', existingProvider);
    setIsLinking(true);
    
    // Simulate async operation
    setTimeout(() => {
      setIsLinking(false);
      setIsModalOpen(false);
      alert(`Successfully initiated sign-in with ${existingProvider}`);
    }, 2000);
  };

  const handleTryDifferentMethod = () => {
    console.log('User wants to try a different method');
    setIsModalOpen(false);
    alert('Redirecting to sign-in options...');
  };

  const providerOptions = [
    { value: 'google.com', label: 'Google' },
    { value: 'github.com', label: 'GitHub' },
    { value: 'password', label: 'Email/Password' },
    { value: 'facebook.com', label: 'Facebook' },
    { value: 'twitter.com', label: 'Twitter' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            Account Conflict Modal Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Interactive demonstration of the Firebase authentication error modal
          </p>
        </div>

        {/* Demo Controls */}
        <Card className="shadow-xl border-2">
          <CardHeader>
            <CardTitle>Demo Configuration</CardTitle>
            <CardDescription>
              Customize the scenario to see how the modal handles different provider conflicts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="user@example.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Existing Provider
                    <span className="text-xs text-gray-500 ml-2">(Account already exists with)</span>
                  </label>
                  <Select value={existingProvider} onValueChange={(value) => setExistingProvider(value as Provider)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {providerOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Attempted Provider
                    <span className="text-xs text-gray-500 ml-2">(User tried to sign in with)</span>
                  </label>
                  <Select value={attemptedProvider} onValueChange={(value) => setAttemptedProvider(value as Provider)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {providerOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={() => setIsModalOpen(true)}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
              >
                Show Account Conflict Modal
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feature Highlights */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Modal Features</CardTitle>
            <CardDescription>
              This component includes all the requested design requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <FeatureItem
                  title="Modern Design"
                  description="Clean, rounded corners with calming blue accents and white background"
                />
                <FeatureItem
                  title="Clear Visual Hierarchy"
                  description="Warning icon, clear title, and friendly explanation text"
                />
                <FeatureItem
                  title="Provider Visualization"
                  description="Shows conflicting providers with icons and connecting indicators"
                />
                <FeatureItem
                  title="Mobile Responsive"
                  description="Adapts seamlessly to mobile and desktop layouts"
                />
              </div>
              <div className="space-y-4">
                <FeatureItem
                  title="Progress Indicator"
                  description="Shows loading state during account linking process"
                />
                <FeatureItem
                  title="Technical Details"
                  description="Collapsible section with error code and provider information"
                />
                <FeatureItem
                  title="Help Documentation"
                  description="Link to Firebase account linking documentation"
                />
                <FeatureItem
                  title="Accessible Design"
                  description="High contrast ratios and semantic HTML structure"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Example */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Usage Example</CardTitle>
            <CardDescription>
              How to integrate this component into your authentication flow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import { AccountConflictModal } from '@/components/auth/AccountConflictModal';

// In your auth error handler:
if (error.code === 'auth/account-exists-with-different-credential') {
  const email = error.customData?.email;
  const existingProvider = error.customData?.existingProvider;
  const attemptedProvider = error.credential?.providerId;
  
  // Show the modal
  setConflictModalState({
    isOpen: true,
    email,
    existingProvider,
    attemptedProvider,
  });
}`}
            </pre>
          </CardContent>
        </Card>
      </div>

      {/* The Modal */}
      <AccountConflictModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        email={email}
        existingProvider={existingProvider}
        attemptedProvider={attemptedProvider}
        onSignInWithExisting={handleSignInWithExisting}
        onTryDifferentMethod={handleTryDifferentMethod}
        isLinking={isLinking}
      />
    </div>
  );
};

const FeatureItem: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="flex gap-3">
    <div className="flex-shrink-0 mt-1">
      <div className="w-2 h-2 rounded-full bg-blue-600" />
    </div>
    <div>
      <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  </div>
);
