import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Plus, Trash2, Bot, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { setLocalStorageItem, removeLocalStorageItem } from '@/utils/storageEvents';

interface AIProvider {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const aiProviders: AIProvider[] = [
  { id: 'openai', name: 'OpenAI', icon: '🤖', description: 'GPT-4 powered analysis' },
  { id: 'gemini', name: 'Google Gemini', icon: '💎', description: 'Advanced code understanding' },
  { id: 'claude', name: 'Anthropic Claude', icon: '🧠', description: 'Detailed security insights' },
  { id: 'mistral', name: 'Mistral AI', icon: '⚡', description: 'Fast and efficient analysis' },
];

interface APIKey {
  id: string;
  provider: string;
  key: string;
  name: string;
}

export const AIKeyManager: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [newKey, setNewKey] = useState({ provider: '', key: '', name: '' });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load API keys from localStorage on component mount
  useEffect(() => {
    const storedKeys = localStorage.getItem('aiApiKeys');
    if (storedKeys) {
      try {
        const parsedKeys = JSON.parse(storedKeys);
        setApiKeys(parsedKeys);
      } catch (error) {
        console.error('Error loading API keys:', error);
      }
    }
  }, []);

  // Save API keys to localStorage whenever they change
  useEffect(() => {
    setLocalStorageItem('aiApiKeys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!newKey.provider.trim()) {
      newErrors.provider = 'Please select an AI provider';
    }

    if (!newKey.name.trim()) {
      newErrors.name = 'Please enter a name for this API key';
    }

    if (!newKey.key.trim()) {
      newErrors.key = 'Please enter your API key';
    } else if (newKey.key.length < 10) {
      newErrors.key = 'API key seems too short. Please check your key';
    }

    // Check for duplicate names
    if (newKey.name.trim() && apiKeys.some(key => key.name.toLowerCase() === newKey.name.toLowerCase())) {
      newErrors.name = 'A key with this name already exists';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addAPIKey = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }

      const key: APIKey = {
        id: Date.now().toString(),
        provider: newKey.provider.trim(),
        key: newKey.key.trim(),
        name: newKey.name.trim(),
      };

      console.log('Adding new API key:', { ...key, key: '***hidden***' });

      setApiKeys(prevKeys => [...prevKeys, key]);
      setNewKey({ provider: '', key: '', name: '' });
      setIsAdding(false);
      setErrors({});

      // Show success message
      console.log('API key added successfully');

    } catch (error) {
      console.error('Error adding API key:', error);
      setErrors({ general: 'Failed to add API key. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeAPIKey = (id: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
  };

  const toggleKeyVisibility = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getProviderInfo = (providerId: string) => {
    return aiProviders.find(p => p.id === providerId);
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto card-hover animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
          <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
          AI Analysis Integration
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Connect your AI API keys to get enhanced code analysis with natural language insights and chat assistance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">

        {/* Available Providers */}
        <section aria-labelledby="providers-title">
          <h3 id="providers-title" className="text-base sm:text-lg font-semibold mb-3">Supported AI Providers</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {aiProviders.map((provider, index) => (
              <div
                key={provider.id}
                className={`flex items-center gap-3 p-3 sm:p-4 border rounded-lg hover:border-purple-300 dark:hover:border-purple-600 transition-colors duration-200 card-hover animate-fade-in animate-stagger-${Math.min(index + 1, 4)}`}
                role="article"
                aria-labelledby={`provider-${provider.id}-name`}
              >
                <span className="text-xl sm:text-2xl" aria-hidden="true">{provider.icon}</span>
                <div>
                  <h4 id={`provider-${provider.id}-name`} className="font-medium text-sm sm:text-base">{provider.name}</h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{provider.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Current API Keys */}
        <section aria-labelledby="api-keys-title">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
            <h3 id="api-keys-title" className="text-base sm:text-lg font-semibold">Your API Keys</h3>
            <Button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 focus-ring"
              disabled={isAdding}
              size="sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add API Key</span>
              <span className="sm:hidden">Add Key</span>
            </Button>
          </div>

          {apiKeys.length === 0 && !isAdding && (
            <Alert className="animate-fade-in">
              <Key className="h-4 w-4" />
              <AlertDescription className="text-sm sm:text-base">
                No API keys configured. Add your first API key to enable AI-powered analysis and chat assistance.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {apiKeys.map((key, index) => {
              const provider = getProviderInfo(key.provider);
              return (
                <div
                  key={key.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-600 transition-colors duration-200 animate-fade-in animate-stagger-${Math.min(index + 1, 5)}`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-lg sm:text-xl flex-shrink-0" aria-hidden="true">{provider?.icon}</span>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm sm:text-base truncate">{key.name}</h4>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs w-fit">{provider?.name}</Badge>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-mono truncate max-w-[200px]">
                            {showKeys[key.id] ? key.key : maskKey(key.key)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleKeyVisibility(key.id)}
                            className="h-6 w-6 p-0 focus-ring"
                            aria-label={showKeys[key.id] ? "Hide API key" : "Show API key"}
                          >
                            {showKeys[key.id] ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAPIKey(key.id)}
                    className="text-red-600 hover:text-red-700 focus-ring self-end sm:self-auto"
                    aria-label={`Remove ${key.name} API key`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}

            {/* Add New Key Form */}
            {isAdding && (
              <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20 space-y-4 animate-slide-down">
                <h4 className="font-medium text-sm sm:text-base">Add New API Key</h4>

                {/* General Error Message */}
                {errors.general && (
                  <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700 dark:text-red-300">
                      {errors.general}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="provider-select" className="text-sm">
                      Provider <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={newKey.provider}
                      onValueChange={(value) => {
                        setNewKey({...newKey, provider: value});
                        if (errors.provider) {
                          setErrors(prev => ({ ...prev, provider: '' }));
                        }
                      }}
                    >
                      <SelectTrigger
                        id="provider-select"
                        className={`focus-ring ${errors.provider ? 'border-red-500 focus:ring-red-500' : ''}`}
                      >
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {aiProviders.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            <div className="flex items-center gap-2">
                              <span>{provider.icon}</span>
                              <span>{provider.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.provider && (
                      <p className="text-red-500 text-xs mt-1">{errors.provider}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="key-name" className="text-sm">
                      Key Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="key-name"
                      placeholder="My OpenAI Key"
                      value={newKey.name}
                      onChange={(e) => {
                        setNewKey({...newKey, name: e.target.value});
                        if (errors.name) {
                          setErrors(prev => ({ ...prev, name: '' }));
                        }
                      }}
                      className={`focus-ring ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                      aria-describedby={errors.name ? "name-error" : undefined}
                    />
                    {errors.name && (
                      <p id="name-error" className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="api-key" className="text-sm">
                      API Key <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="sk-..."
                      value={newKey.key}
                      onChange={(e) => {
                        setNewKey({...newKey, key: e.target.value});
                        if (errors.key) {
                          setErrors(prev => ({ ...prev, key: '' }));
                        }
                      }}
                      className={`focus-ring ${errors.key ? 'border-red-500 focus:ring-red-500' : ''}`}
                      aria-describedby={errors.key ? "key-error" : undefined}
                    />
                    {errors.key && (
                      <p id="key-error" className="text-red-500 text-xs mt-1">{errors.key}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={addAPIKey}
                    disabled={isSubmitting}
                    className="focus-ring"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Adding...
                      </>
                    ) : (
                      'Add Key'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAdding(false);
                      setNewKey({ provider: '', key: '', name: '' });
                      setErrors({});
                    }}
                    disabled={isSubmitting}
                    className="focus-ring"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* AI-Powered Security Features Status */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI-Powered Security Features
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-900/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-purple-800 dark:text-purple-200">
                      AI Fix Suggestions
                    </p>
                    <p className="text-sm text-purple-600 dark:text-purple-400">
                      {apiKeys.length > 0 ? 'Available' : 'Requires API Key'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-900/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Key className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-800 dark:text-blue-200">
                      Secure Code Search
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Always Available
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-900/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800 dark:text-green-200">
                      Code Provenance
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Always Available
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
            <Bot className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>AI Fix Suggestions</strong> require at least one configured AI provider.
              The Secure Code Search Engine and Code Provenance features work without API keys.
            </AlertDescription>
          </Alert>
        </section>

        {/* Security Notice */}
        <Alert className="animate-fade-in" role="note">
          <Key className="h-4 w-4" aria-hidden="true" />
          <AlertDescription className="text-sm sm:text-base">
            Your API keys are stored locally in your browser and are never sent to our servers.
            They are only used to communicate directly with the AI providers during analysis.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
