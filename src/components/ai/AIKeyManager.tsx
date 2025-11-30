// src/components/AIKeyManager.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Key, Eye, EyeOff, Plus, Trash2, Bot, AlertTriangle, CheckCircle, Zap, Shield, Sparkles, Clock, Users, Star, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { setLocalStorageItem, removeLocalStorageItem } from '@/utils/storageEvents'; // Ensure both are imported
import { discoverModels, validateAPIKey, AIModel } from '@/services/ai/modelDiscoveryService';

import { logger } from '@/utils/logger';

// Real AI Provider Icons
const OpenAIIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
  </svg>
);

const GeminiIcon = () => (
  <svg viewBox="0 0 28 28" className="w-6 h-6" fill="none">
    <path d="M14 28C14 26.0633 13.6267 24.2433 12.88 22.54C12.1567 20.8367 11.165 19.355 9.905 18.095C8.645 16.835 7.16333 15.8433 5.46 15.12C3.75667 14.3733 1.93667 14 0 14C1.93667 14 3.75667 13.6383 5.46 12.915C7.16333 12.1683 8.645 11.165 9.905 9.905C11.165 8.645 12.1567 7.16333 12.88 5.46C13.6267 3.75667 14 1.93667 14 0C14 1.93667 14.3617 3.75667 15.085 5.46C15.8317 7.16333 16.835 8.645 18.095 9.905C19.355 11.165 20.8367 12.1683 22.54 12.915C24.2433 13.6383 26.0633 14 28 14C26.0633 14 24.2433 14.3733 22.54 15.12C20.8367 15.8433 19.355 16.835 18.095 18.095C16.835 19.355 15.8317 20.8367 15.085 22.54C14.3617 24.2433 14 26.0633 14 28Z" fill="url(#gemini-gradient)"/>
    <defs>
      <linearGradient id="gemini-gradient" x1="0" y1="14" x2="28" y2="14" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4285F4"/>
        <stop offset="0.5" stopColor="#9B72CB"/>
        <stop offset="1" stopColor="#D96570"/>
      </linearGradient>
    </defs>
  </svg>
);

const ClaudeIcon = () => (
  <img 
    src="https://img.icons8.com/?size=100&id=H5H0mqCCr5AV&format=png&color=000000" 
    alt="Claude" 
    className="w-6 h-6"
  />
);

const MistralIcon = () => (
  <svg viewBox="0 0 365 258" className="w-6 h-6" fill="none">
    <path d="M104.107 0H52.0525V51.57H104.107V0Z" fill="#FFD800"/>
    <path d="M312.351 0H260.296V51.57H312.351V0Z" fill="#FFD800"/>
    <path d="M156.161 51.5701H52.0525V103.14H156.161V51.5701Z" fill="#FFAF00"/>
    <path d="M312.353 51.5701H208.244V103.14H312.353V51.5701Z" fill="#FFAF00"/>
    <path d="M312.356 103.14H52.0525V154.71H312.356V103.14Z" fill="#FF8205"/>
    <path d="M104.107 154.71H52.0525V206.28H104.107V154.71Z" fill="#FA500F"/>
    <path d="M208.228 154.711H156.174V206.281H208.228V154.711Z" fill="#FA500F"/>
    <path d="M312.351 154.711H260.296V206.281H312.351V154.711Z" fill="#FA500F"/>
    <path d="M156.195 206.312H0V257.882H156.195V206.312Z" fill="#E10500"/>
    <path d="M364.439 206.312H208.244V257.882H364.439V206.312Z" fill="#E10500"/>
  </svg>
);

const LlamaIcon = () => (
  <img 
    src="https://static.xx.fbcdn.net/rsrc.php/y9/r/tL_v571NdZ0.svg" 
    alt="Meta Llama" 
    className="w-6 h-6"
  />
);

const CohereIcon = () => (
  <img 
    src="https://cohere.com/logo.svg" 
    alt="Cohere" 
    className="w-6 h-6"
  />
);

const PerplexityIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
);

const GroqIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z"/>
  </svg>
);

interface AIProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  keyPrefix: string;
  keyPlaceholder: string;
  models: {
    id: string;
    name: string;
    description: string;
    maxTokens?: number;
    capabilities: string[];
  }[];
}

const aiProviders: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    icon: <OpenAIIcon />,
    description: 'GPT-4 powered analysis',
    keyPrefix: 'sk-',
    keyPlaceholder: 'sk-... (starts with sk-)',
    models: []
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    icon: <GeminiIcon />,
    description: 'Advanced code understanding',
    keyPrefix: 'AIza',
    keyPlaceholder: 'AIza... (starts with AIza)',
    models: []
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    icon: <ClaudeIcon />,
    description: 'Detailed security insights',
    keyPrefix: 'sk-ant-',
    keyPlaceholder: 'sk-ant-... (starts with sk-ant-)',
    models: []
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    icon: <MistralIcon />,
    description: 'Fast and efficient analysis',
    keyPrefix: '',
    keyPlaceholder: 'Your Mistral API key',
    models: []
  },
  {
    id: 'llama',
    name: 'Meta Llama',
    icon: <LlamaIcon />,
    description: 'Open-weight models',
    keyPrefix: '',
    keyPlaceholder: 'Your Llama API key',
    models: []
  },
  {
    id: 'cohere',
    name: 'Cohere',
    icon: <CohereIcon />,
    description: 'Enterprise-focused models',
    keyPrefix: '',
    keyPlaceholder: 'Your Cohere API key',
    models: []
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    icon: <PerplexityIcon />,
    description: 'Fast online models',
    keyPrefix: 'pplx-',
    keyPlaceholder: 'pplx-... (Perplexity API key)',
    models: []
  },
  {
    id: 'groq',
    name: 'Groq',
    icon: <GroqIcon />,
    description: 'Extremely fast inference',
    keyPrefix: 'gsk-',
    keyPlaceholder: 'gsk-... (Groq API key)',
    models: []
  }
];

interface APIKey {
  id: string;
  provider: string;
  model: string;
  key: string;
  name: string;
}

export const AIKeyManager: React.FC = () => {
  // Initialize apiKeys state by reading from localStorage directly (Lazy Initialization)
  // This function runs only once when the component mounts for the first time
  const [apiKeys, setApiKeys] = useState<APIKey[]>(() => {
    try {
      const storedKeys = localStorage.getItem('aiApiKeys');
      if (storedKeys) {
        const parsedKeys = JSON.parse(storedKeys);
        return parsedKeys;
      }
    } catch (error) {
      localStorage.removeItem('aiApiKeys'); // Clear bad data if parsing fails
    }
    return []; // Default to empty array if no keys are found or an error occurs
  });

  const [newKey, setNewKey] = useState({ provider: '', model: '', key: '', name: '' });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discoveredModels, setDiscoveredModels] = useState<AIModel[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Effect to save keys to localStorage whenever apiKeys state changes
  // This effect is now responsible for ALL saves (add, remove)
  useEffect(() => {
    // This condition prevents saving an empty array on the very first render if no keys exist
    // It will save when keys are added, or removed.
    if (apiKeys.length > 0) {
      const keysToSave = JSON.stringify(apiKeys);
      setLocalStorageItem('aiApiKeys', keysToSave);
    } else {
      // If apiKeys array becomes empty (e.g., all keys removed), ensure localStorage is cleared
      removeLocalStorageItem('aiApiKeys'); // Using your utility function to clean up
    }
  }, [apiKeys]); // Dependency on apiKeys state

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!newKey.provider.trim()) {
      newErrors.provider = 'Please select an AI provider';
    }

    if (!newKey.model.trim()) {
      newErrors.model = 'Please select a model';
    }

    if (!newKey.name.trim()) {
      newErrors.name = 'Please enter a name for this API key';
    }

    if (!newKey.key.trim()) {
      newErrors.key = 'Please enter your API key';
    } else if (newKey.key.length < 10) {
      newErrors.key = 'API key seems too short. Please check your key';
    } else {
      const provider = aiProviders.find(p => p.id === newKey.provider);
      if (provider?.keyPrefix && !newKey.key.startsWith(provider.keyPrefix)) {
        newErrors.key = `API key should start with "${provider.keyPrefix}"`;
      }
    }

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
        id: Date.now().toString(), // Using Date.now() for a unique ID
        provider: newKey.provider.trim(),
        model: newKey.model.trim(),
        key: newKey.key.trim(),
        name: newKey.name.trim(),
      };
      setApiKeys(prevKeys => [...prevKeys, key]); // This will trigger the save useEffect automatically
      // logger.debug("AIKeyManager: API key added to state, save useEffect should be triggered."); // Debug log removed for PR

      setNewKey({ provider: '', model: '', key: '', name: '' });
      setIsAdding(false);
      setErrors({});

    } catch (error) {
      // logger.error('AIKeyManager: Error adding API key:', error); // Debug log removed for PR
      setErrors({ general: 'Failed to add API key. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeAPIKey = (id: string) => {
    // logger.debug(`AIKeyManager: Attempting to remove API key with ID: ${id}`); // Debug log removed for PR
    const updatedKeys = apiKeys.filter(key => key.id !== id);
    setApiKeys(updatedKeys); // This will trigger the save useEffect (and clear localStorage if array becomes empty)
    // logger.debug("AIKeyManager: API key removed from state, save useEffect should be triggered (clearing if empty)."); // Debug log removed for PR
  };

  const toggleKeyVisibility = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getProviderInfo = (providerId: string) => {
    return aiProviders.find(p => p.id === providerId);
  };

  const getModelInfo = (providerId: string, modelId: string) => {
    const provider = getProviderInfo(providerId);
    return provider?.models.find(m => m.id === modelId);
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
  };

  const handleProviderChange = (value: string) => {
    setNewKey({
      ...newKey,
      provider: value,
      model: '',
      key: ''
    });
    setDiscoveredModels([]);
    setScanStatus(null);
    if (errors.provider) {
      setErrors(prev => ({ ...prev, provider: '' }));
    }
  };

  const handleScanAPI = async () => {
    if (!newKey.provider || !newKey.key) {
      setScanStatus({ message: 'Please select a provider and enter an API key first', type: 'error' });
      return;
    }

    setIsScanning(true);
    setScanStatus({ message: 'Scanning API and discovering available models...', type: 'info' });

    try {
      // First validate the API key
      const validation = await validateAPIKey(newKey.provider, newKey.key);
      
      if (!validation.valid) {
        setScanStatus({ message: validation.error || 'Invalid API key', type: 'error' });
        setIsScanning(false);
        return;
      }

      // Then discover available models
      const result = await discoverModels(newKey.provider, newKey.key);
      
      if (result.success && result.models.length > 0) {
        setDiscoveredModels(result.models);
        setScanStatus({ 
          message: `✓ Successfully discovered ${result.models.length} available models!`, 
          type: 'success' 
        });
      } else if (result.error) {
        setScanStatus({ message: result.error, type: 'error' });
      } else {
        setScanStatus({ message: 'No models found', type: 'error' });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to scan API';
      setScanStatus({ message: errorMessage, type: 'error' });
    } finally {
      setIsScanning(false);
    }
  };

  // Automatically scan API when provider and key are both entered
  useEffect(() => {
    // Only auto-scan if we have both provider and key, and key looks valid
    if (newKey.provider && newKey.key && newKey.key.length > 10) {
      // Debounce the auto-scan to avoid scanning on every keystroke
      const timeoutId = setTimeout(() => {
        handleScanAPI();
      }, 1000); // Wait 1 second after user stops typing

      return () => clearTimeout(timeoutId);
    }
    // Clear discovered models if key is cleared or too short
    setDiscoveredModels([]);
    setScanStatus(null);
    return undefined;
  }, [newKey.provider, newKey.key]);

  const getKeyPlaceholder = (providerId: string) => {
    const provider = aiProviders.find(p => p.id === providerId);
    return provider?.keyPlaceholder || 'Enter your API key';
  };

  // logger.debug("AIKeyManager: Current apiKeys state during render:", apiKeys); // Debug log removed for PR

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Hero Section */}
      <Card variant="modern" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-indigo-600/10 dark:from-purple-400/10 dark:via-blue-400/10 dark:to-indigo-400/10" />
        <CardHeader className="relative z-10 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  AI Analysis Integration
                </CardTitle>
                <CardDescription className="text-base mt-1 text-slate-600 dark:text-slate-300">
                  Supercharge your code analysis with AI-powered insights
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full border border-green-200 dark:border-green-800">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-700 dark:text-green-300">Secure Storage</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Supported AI Providers */}
      <Card variant="modern">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                  Supported AI Providers
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300">
                  Choose from industry-leading AI providers for enhanced analysis
                </CardDescription>
              </div>
            </div>
            {discoveredModels.length > 0 && (
              <Badge variant="outline" className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                {discoveredModels.length} Models Discovered
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {aiProviders.map((provider, index) => {
              const isConfigured = apiKeys.some(key => key.provider === provider.id);
              return (
                <Card
                  key={provider.id}
                  variant="glass"
                  className={`group relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                    isConfigured 
                      ? 'ring-2 ring-green-400/50 dark:ring-green-500/50 bg-green-50/50 dark:bg-green-900/20' 
                      : 'hover:ring-2 hover:ring-blue-400/50 dark:hover:ring-blue-500/50'
                  }`}
                >
                  {isConfigured && (
                    <div className="absolute top-3 right-3">
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/50 rounded-full border border-green-300 dark:border-green-700">
                        <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                        <span className="text-xs font-medium text-green-700 dark:text-green-300">Active</span>
                      </div>
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/50 dark:bg-black/20 rounded-xl border border-white/30 dark:border-white/10 group-hover:scale-110 transition-transform duration-200 text-slate-700 dark:text-slate-200">
                        {provider.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base text-slate-900 dark:text-white truncate">
                          {provider.name}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                          {provider.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Live Discovery
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <Clock className="h-3 w-3" />
                          <span>Real-time</span>
                        </div>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        Models are discovered automatically from the API when you add your key
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current API Keys */}
      <Card variant="modern">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                <Key className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                  Your API Keys
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300">
                  Manage your AI provider credentials securely
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={() => setIsAdding(true)}
              variant="default"
              className="flex items-center gap-2 focus-ring"
              disabled={isAdding}
              size="sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add API Key</span>
              <span className="sm:hidden">Add Key</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Empty State */}
          {apiKeys.length === 0 && !isAdding && (
            <div className="text-center py-12 animate-fade-in">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl flex items-center justify-center mb-4">
                <Key className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No API Keys Configured
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto">
                Add your first API key to unlock AI-powered code analysis, intelligent insights, and chat assistance.
              </p>
              <Button
                onClick={() => setIsAdding(true)}
                variant="default"
                size="lg"
                className="animate-pulse"
              >
                <Plus className="h-5 w-5 mr-2" />
                Get Started
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {apiKeys.map((key, index) => {
              const provider = getProviderInfo(key.provider);
              const model = getModelInfo(key.provider, key.model);
              return (
                <Card
                  key={key.id}
                  variant="glass"
                  className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] border border-slate-200/50 dark:border-slate-700/50"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-700/50 group-hover:scale-110 transition-transform duration-200">
                          <span className="text-lg">{provider?.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-base text-slate-900 dark:text-white truncate">
                              {key.name}
                            </h4>
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                              <span className="text-xs font-medium text-green-700 dark:text-green-300">Active</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <Badge variant="outline" className="text-xs bg-white/50 dark:bg-black/20">
                              {provider?.name}
                            </Badge>
                            {model && (
                              <Badge variant="secondary" className="text-xs">
                                {model.name}
                              </Badge>
                            )}
                            {model?.capabilities && (
                              <div className="flex items-center gap-1">
                                {model.capabilities.includes('code') && (
                                  <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                    <span className="text-xs">🔍</span>
                                  </div>
                                )}
                                {model.capabilities.includes('vision') && (
                                  <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                                    <span className="text-xs">👁️</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                                <span className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate flex-1">
                                  {showKeys[key.id] ? key.key : maskKey(key.key)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleKeyVisibility(key.id)}
                                  className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-700"
                                  aria-label={showKeys[key.id] ? "Hide API key" : "Show API key"}
                                >
                                  {showKeys[key.id] ? (
                                    <EyeOff className="h-3 w-3" />
                                  ) : (
                                    <Eye className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAPIKey(key.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-xl"
                        aria-label={`Remove ${key.name} API key`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {model && (
                      <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span>Max Context: {model.maxTokens?.toLocaleString() || 'N/A'} tokens</span>
                          <span>Updated: Just now</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {/* Add New Key Form */}
            {isAdding && (
              <Card variant="modern" className="relative overflow-hidden animate-slide-down">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-blue-900/20 dark:via-indigo-900/10 dark:to-purple-900/20" />
                <CardHeader className="relative z-10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                        Add New API Key
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-300">
                        Connect your AI provider to unlock powerful features
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 space-y-6">

                {errors.general && (
                  <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700 dark:text-red-300">
                      {errors.general}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="provider-select" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      AI Provider <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={newKey.provider}
                      onValueChange={handleProviderChange}
                    >
                      <SelectTrigger
                        id="provider-select"
                        className={`h-12 border-2 rounded-xl transition-all duration-200 ${
                          errors.provider 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                            : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100 dark:border-slate-700 dark:focus:border-blue-500'
                        }`}
                      >
                        <SelectValue placeholder="Choose your AI provider" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl">
                        {aiProviders.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id} className="rounded-lg my-1 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <div className="flex items-center gap-3 py-1">
                              <div className="text-slate-700 dark:text-slate-200">{provider.icon}</div>
                              <div>
                                <div className="font-medium">{provider.name}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{provider.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.provider && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {errors.provider}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model-select" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      AI Model <span className="text-red-500">*</span>
                      {discoveredModels.length > 0 && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          {discoveredModels.length} Live Models
                        </Badge>
                      )}
                    </Label>
                    <Select
                      value={newKey.model}
                      onValueChange={(value) => {
                        setNewKey({...newKey, model: value});
                        if (errors.model) {
                          setErrors(prev => ({ ...prev, model: '' }));
                        }
                      }}
                      disabled={!newKey.provider}
                    >
                      <SelectTrigger
                        id="model-select"
                        className={`h-12 border-2 rounded-xl transition-all duration-200 ${
                          !newKey.provider 
                            ? 'bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed opacity-60'
                            : errors.model 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                              : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100 dark:border-slate-700 dark:focus:border-blue-500'
                        }`}
                      >
                        <SelectValue placeholder={newKey.provider ? (discoveredModels.length > 0 ? "Choose from discovered models" : "Choose a model or scan API first") : "Select provider first"} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl max-h-96">
                        {newKey.provider ? (
                          <>
                            {discoveredModels.length > 0 ? (
                              <>
                                <div className="px-2 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 sticky top-0 z-10">
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="h-3 w-3 text-green-600 dark:text-green-400" />
                                    Available Models ({discoveredModels.length})
                                  </div>
                                </div>
                                {discoveredModels.map(model => (
                                  <SelectItem key={model.id} value={model.id} className="rounded-lg my-1 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <div className="flex flex-col items-start py-1">
                                      <div className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                                        <span className="font-medium">{model.name}</span>
                                        <div className="flex items-center gap-1">
                                          {model.capabilities.includes('code') && <span className="text-xs" title="Code">🔍</span>}
                                          {model.capabilities.includes('vision') && <span className="text-xs" title="Vision">👁️</span>}
                                          {model.capabilities.includes('audio') && <span className="text-xs" title="Audio">🎵</span>}
                                          {model.capabilities.includes('reasoning') && <span className="text-xs" title="Advanced Reasoning">🧠</span>}
                                        </div>
                                      </div>
                                      <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{model.description}</span>
                                      <span className="text-xs text-green-600 dark:text-green-400 mt-0.5 font-medium">
                                        {model.maxTokens?.toLocaleString()} tokens
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </>
                            ) : (
                              <div className="p-4 text-sm text-slate-500 dark:text-slate-400 text-center">
                                {isScanning ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                    <span>Scanning for available models...</span>
                                  </div>
                                ) : scanStatus?.type === 'error' ? (
                                  <div className="flex flex-col items-center gap-2">
                                    <AlertTriangle className="h-8 w-8 text-red-500" />
                                    <span className="font-medium">Unable to fetch models</span>
                                    <span className="text-xs">{scanStatus.message}</span>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center gap-2">
                                    <Sparkles className="h-8 w-8 text-blue-500" />
                                    <span className="font-medium">Enter your API key to discover models</span>
                                    <span className="text-xs">Models will appear automatically after scanning</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="p-4 text-sm text-slate-500 dark:text-slate-400 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <Key className="h-8 w-8 text-slate-400" />
                              <span className="font-medium">Select a provider first</span>
                            </div>
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.model && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {errors.model}
                      </p>
                    )}
                    {newKey.provider && discoveredModels.length === 0 && !isScanning && !scanStatus && (
                      <p className="text-blue-600 dark:text-blue-400 text-xs mt-1 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Tip: Models will be discovered automatically from the API
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="key-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Display Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="key-name"
                    placeholder="e.g., My Production OpenAI Key"
                    value={newKey.name}
                    onChange={(e) => {
                      setNewKey({...newKey, name: e.target.value});
                      if (errors.name) {
                        setErrors(prev => ({ ...prev, name: '' }));
                      }
                    }}
                    className={`h-12 border-2 rounded-xl transition-all duration-200 ${
                      errors.name 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100 dark:border-slate-700 dark:focus:border-blue-500'
                    }`}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-key" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    API Key <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="api-key"
                      type="password"
                      placeholder={getKeyPlaceholder(newKey.provider)}
                      value={newKey.key}
                      onChange={(e) => {
                        setNewKey({...newKey, key: e.target.value});
                        setDiscoveredModels([]);
                        setScanStatus(null);
                        if (errors.key) {
                          setErrors(prev => ({ ...prev, key: '' }));
                        }
                      }}
                      className={`h-12 border-2 rounded-xl transition-all duration-200 font-mono pr-12 ${
                        errors.key 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100 dark:border-slate-700 dark:focus:border-blue-500'
                      }`}
                      aria-describedby={errors.key ? "key-error" : undefined}
                    />
                    {isScanning && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <RefreshCw className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                    {scanStatus?.type === 'success' && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                    )}
                    {scanStatus?.type === 'error' && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                    )}
                  </div>
                  {errors.key && (
                    <p id="key-error" className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {errors.key}
                    </p>
                  )}
                  {scanStatus && (
                    <Alert className={`mt-2 ${
                      scanStatus.type === 'success' ? 'border-green-200 bg-green-50 dark:bg-green-950/20' :
                      scanStatus.type === 'error' ? 'border-red-200 bg-red-50 dark:bg-red-950/20' :
                      'border-blue-200 bg-blue-50 dark:bg-blue-950/20'
                    }`}>
                      {scanStatus.type === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : scanStatus.type === 'error' ? (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      ) : (
                        <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                      )}
                      <AlertDescription className={
                        scanStatus.type === 'success' ? 'text-green-700 dark:text-green-300' :
                        scanStatus.type === 'error' ? 'text-red-700 dark:text-red-300' :
                        'text-blue-700 dark:text-blue-300'
                      }>
                        {scanStatus.message}
                        {scanStatus.type === 'success' && ' You can now save this configuration.'}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                {newKey.provider && (
                  <Card variant="glass" className="bg-slate-50/50 dark:bg-slate-800/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Configuration Preview</h5>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-600 dark:text-slate-400">Provider:</span>
                            <Badge variant="outline" className="text-xs">
                              {aiProviders.find(p => p.id === newKey.provider)?.name}
                            </Badge>
                          </div>
                          {newKey.model && (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-600 dark:text-slate-400">Model:</span>
                              <Badge variant="secondary" className="text-xs">
                                {aiProviders.find(p => p.id === newKey.provider)?.models.find(m => m.id === newKey.model)?.name}
                              </Badge>
                            </div>
                          )}
                        </div>
                        {newKey.model && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-600 dark:text-slate-400">Capabilities:</span>
                              <div className="flex items-center gap-1">
                                {aiProviders.find(p => p.id === newKey.provider)?.models.find(m => m.id === newKey.model)?.capabilities.map(cap => (
                                  <Badge key={cap} variant="outline" className="text-xs">
                                    {cap}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-600 dark:text-slate-400">Max Context:</span>
                              <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                                {aiProviders.find(p => p.id === newKey.provider)?.models.find(m => m.id === newKey.model)?.maxTokens?.toLocaleString() || 'Unknown'} tokens
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={addAPIKey}
                    disabled={isSubmitting || isScanning || scanStatus?.type !== 'success'}
                    variant="default"
                    size="lg"
                    className="flex-1 sm:flex-none"
                    title={
                      isScanning ? 'Please wait for API scan to complete' :
                      scanStatus?.type !== 'success' ? 'Please scan your API key first' :
                      'Add this API key'
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Adding Key...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add API Key
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setIsAdding(false);
                      setNewKey({ provider: '', model: '', key: '', name: '' });
                      setErrors({});
                      setDiscoveredModels([]);
                      setScanStatus(null);
                    }}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none"
                  >
                    Cancel
                  </Button>
                </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI-Powered Features Status */}
      <Card variant="modern">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                Available AI Features
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                Unlock powerful analysis capabilities with your API keys
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              variant="glass" 
              className={`group transition-all duration-300 hover:scale-105 ${
                apiKeys.length > 0 
                  ? 'bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20 ring-2 ring-purple-200/50 dark:ring-purple-800/50' 
                  : 'bg-gradient-to-br from-slate-50/50 to-slate-100/50 dark:from-slate-800/20 dark:to-slate-900/20'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl transition-all duration-200 ${
                    apiKeys.length > 0 
                      ? 'bg-gradient-to-br from-purple-500 to-blue-600 group-hover:scale-110' 
                      : 'bg-slate-400'
                  }`}>
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white">AI Fix Suggestions</h4>
                      {apiKeys.length > 0 ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Intelligent code fixes and security recommendations
                    </p>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${apiKeys.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
                      <span className={`text-xs font-medium ${
                        apiKeys.length > 0 ? 'text-green-700 dark:text-green-300' : 'text-slate-500'
                      }`}>
                        {apiKeys.length > 0 ? 'Ready' : 'Requires API Key'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="glass" className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 ring-2 ring-blue-200/50 dark:ring-blue-800/50 group transition-all duration-300 hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl group-hover:scale-110 transition-transform duration-200">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white">Secure Code Search</h4>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Advanced pattern matching and vulnerability detection
                    </p>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs font-medium text-green-700 dark:text-green-300">
                        Always Available
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="glass" className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/20 dark:to-teal-900/20 ring-2 ring-emerald-200/50 dark:ring-emerald-800/50 group transition-all duration-300 hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl group-hover:scale-110 transition-transform duration-200">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white">Code Provenance</h4>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Track code origins and identify potential supply chain risks
                    </p>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs font-medium text-green-700 dark:text-green-300">
                        Always Available
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {apiKeys.length === 0 && (
            <Card variant="glass" className="mt-6 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-800/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-500 rounded-xl">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
                      Unlock AI-Powered Analysis
                    </h4>
                    <p className="text-sm text-amber-800 dark:text-amber-300 mb-3">
                      Add your first API key to enable intelligent fix suggestions, contextual code analysis, and AI-powered chat assistance. Your keys are stored securely in your browser and never shared with our servers.
                    </p>
                    <Button
                      onClick={() => setIsAdding(true)}
                      variant="default"
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First API Key
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card variant="glass" className="bg-gradient-to-r from-slate-50/50 to-slate-100/50 dark:from-slate-800/20 dark:to-slate-900/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-200 dark:bg-slate-700 rounded-2xl">
              <Shield className="h-6 w-6 text-slate-600 dark:text-slate-300" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                🔒 Privacy & Security Guarantee
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Your API keys are encrypted and stored locally in your browser. They are never transmitted to our servers and are only used to communicate directly with your chosen AI providers. You maintain complete control over your credentials at all times.
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Local Storage Only</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>End-to-End Encryption</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Zero Server Access</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};