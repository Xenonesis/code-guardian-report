// src/components/AIKeyManager.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Key, Eye, EyeOff, Plus, Trash2, Bot, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { setLocalStorageItem, removeLocalStorageItem } from '@/utils/storageEvents'; // Ensure both are imported

interface AIProvider {
  id: string;
  name: string;
  icon: string;
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
    icon: '🤖',
    description: 'GPT-4 powered analysis',
    keyPrefix: 'sk-',
    keyPlaceholder: 'sk-... (starts with sk-)',
    models: [
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        description: 'Most capable GPT-4 model with 128k context',
        maxTokens: 128000,
        capabilities: ['code', 'text', 'vision']
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        description: 'More capable than any GPT-3.5 model',
        maxTokens: 8192,
        capabilities: ['code', 'text']
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: 'Fast and cost-effective',
        maxTokens: 4096,
        capabilities: ['code', 'text']
      }
    ]
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    icon: '💎',
    description: 'Advanced code understanding',
    keyPrefix: 'AIza',
    keyPlaceholder: 'AIza... (starts with AIza)',
    models: [
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        description: 'Most capable Gemini model with 1M token context',
        maxTokens: 1000000,
        capabilities: ['code', 'text', 'vision', 'audio']
      },
      {
        id: 'gemini-1.0-pro',
        name: 'Gemini 1.0 Pro',
        description: 'General purpose model',
        maxTokens: 32768,
        capabilities: ['code', 'text']
      },
      {
        id: 'gemini-1.0-ultra',
        name: 'Gemini 1.0 Ultra',
        description: 'Most capable model for highly complex tasks',
        maxTokens: 32768,
        capabilities: ['code', 'text', 'vision']
      }
    ]
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    icon: '🧠',
    description: 'Detailed security insights',
    keyPrefix: 'sk-ant-',
    keyPlaceholder: 'sk-ant-... (starts with sk-ant-)',
    models: [
      {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        description: 'Most powerful model for highly complex tasks',
        maxTokens: 200000,
        capabilities: ['code', 'text', 'vision']
      },
      {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        description: 'Ideal balance of intelligence and speed',
        maxTokens: 200000,
        capabilities: ['code', 'text', 'vision']
      },
      {
        id: 'claude-2.1',
        name: 'Claude 2.1',
        description: 'Improved version of Claude 2',
        maxTokens: 100000,
        capabilities: ['code', 'text']
      }
    ]
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    icon: '⚡',
    description: 'Fast and efficient analysis',
    keyPrefix: '',
    keyPlaceholder: 'Your Mistral API key',
    models: [
      {
        id: 'mistral-large',
        name: 'Mistral Large',
        description: 'Top-tier reasoning capabilities',
        maxTokens: 32768,
        capabilities: ['code', 'text']
      },
      {
        id: 'mixtral-8x7b',
        name: 'Mixtral 8x7B',
        description: 'Sparse mixture of experts model',
        maxTokens: 32768,
        capabilities: ['code', 'text']
      },
      {
        id: 'mistral-7b',
        name: 'Mistral 7B',
        description: 'Most efficient 7B model',
        maxTokens: 32768,
        capabilities: ['code', 'text']
      }
    ]
  },
  {
    id: 'llama',
    name: 'Meta Llama',
    icon: '🦙',
    description: 'Open-weight models',
    keyPrefix: '',
    keyPlaceholder: 'Your Llama API key',
    models: [
      {
        id: 'llama3-70b',
        name: 'Llama 3 70B',
        description: 'Most capable Llama 3 model',
        maxTokens: 8192,
        capabilities: ['code', 'text']
      },
      {
        id: 'llama3-8b',
        name: 'Llama 3 8B',
        description: 'Efficient smaller model',
        maxTokens: 8192,
        capabilities: ['code', 'text']
      },
      {
        id: 'llama2-70b',
        name: 'Llama 2 70B',
        description: 'Previous generation model',
        maxTokens: 4096,
        capabilities: ['code', 'text']
      }
    ]
  },
  {
    id: 'cohere',
    name: 'Cohere',
    icon: '🌀',
    description: 'Enterprise-focused models',
    keyPrefix: '',
    keyPlaceholder: 'Your Cohere API key',
    models: [
      {
        id: 'command-r-plus',
        name: 'Command R+',
        description: 'Most capable model for RAG and tool use',
        maxTokens: 128000,
        capabilities: ['code', 'text']
      },
      {
        id: 'command-r',
        name: 'Command R',
        description: 'Optimized for RAG and tool use',
        maxTokens: 128000,
        capabilities: ['code', 'text']
      },
      {
        id: 'command',
        name: 'Command',
        description: 'General purpose model',
        maxTokens: 4096,
        capabilities: ['code', 'text']
      }
    ]
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    icon: '❓',
    description: 'Fast online models',
    keyPrefix: 'pplx-',
    keyPlaceholder: 'pplx-... (Perplexity API key)',
    models: [
      {
        id: 'pplx-70b-online',
        name: 'PPLX 70B Online',
        description: 'Most capable online model',
        maxTokens: 4096,
        capabilities: ['code', 'text']
      },
      {
        id: 'pplx-7b-online',
        name: 'PPLX 7B Online',
        description: 'Fast online model',
        maxTokens: 4096,
        capabilities: ['code', 'text']
      },
      {
        id: 'pplx-70b',
        name: 'PPLX 70B',
        description: 'Most capable offline model',
        maxTokens: 4096,
        capabilities: ['code', 'text']
      }
    ]
  },
  {
    id: 'groq',
    name: 'Groq',
    icon: '🚀',
    description: 'Extremely fast inference',
    keyPrefix: 'gsk-',
    keyPlaceholder: 'gsk-... (Groq API key)',
    models: [
      {
        id: 'mixtral-8x7b-groq',
        name: 'Mixtral 8x7B (Groq)',
        description: 'Fastest Mixtral implementation',
        maxTokens: 32768,
        capabilities: ['code', 'text']
      },
      {
        id: 'llama3-70b-groq',
        name: 'Llama 3 70B (Groq)',
        description: 'Fastest Llama 3 implementation',
        maxTokens: 8192,
        capabilities: ['code', 'text']
      },
      {
        id: 'gemma-7b-groq',
        name: 'Gemma 7B (Groq)',
        description: 'Fast Gemma implementation',
        maxTokens: 8192,
        capabilities: ['code', 'text']
      }
    ]
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
      // console.log("AIKeyManager: API key added to state, save useEffect should be triggered."); // Debug log removed for PR

      setNewKey({ provider: '', model: '', key: '', name: '' });
      setIsAdding(false);
      setErrors({});

    } catch (error) {
      // console.error('AIKeyManager: Error adding API key:', error); // Debug log removed for PR
      setErrors({ general: 'Failed to add API key. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeAPIKey = (id: string) => {
    // console.log(`AIKeyManager: Attempting to remove API key with ID: ${id}`); // Debug log removed for PR
    const updatedKeys = apiKeys.filter(key => key.id !== id);
    setApiKeys(updatedKeys); // This will trigger the save useEffect (and clear localStorage if array becomes empty)
    // console.log("AIKeyManager: API key removed from state, save useEffect should be triggered (clearing if empty)."); // Debug log removed for PR
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
    if (errors.provider) {
      setErrors(prev => ({ ...prev, provider: '' }));
    }
  };

  const getKeyPlaceholder = (providerId: string) => {
    const provider = aiProviders.find(p => p.id === providerId);
    return provider?.keyPlaceholder || 'Enter your API key';
  };

  // console.log("AIKeyManager: Current apiKeys state during render:", apiKeys); // Debug log removed for PR

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {aiProviders.map((provider, index) => (
              <div
                key={provider.id}
                className={`flex items-start gap-3 p-3 sm:p-4 border rounded-lg hover:border-purple-300 dark:hover:border-purple-600 transition-colors duration-200 card-hover animate-fade-in animate-stagger-${Math.min(index + 1, 8)}`}
                role="article"
                aria-labelledby={`provider-${provider.id}-name`}
              >
                <span className="text-xl sm:text-2xl mt-1 flex-shrink-0" aria-hidden="true">{provider.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <h4 id={`provider-${provider.id}-name`} className="font-medium text-sm sm:text-base truncate">{provider.name}</h4>
                    <Badge variant="outline" className="text-xs">{provider.models.length} models</Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">{provider.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {provider.models.slice(0, 3).map(model => (
                      <Badge key={model.id} variant="secondary" className="text-xs truncate max-w-[100px]">
                        {model.name}
                      </Badge>
                    ))}
                    {provider.models.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{provider.models.length - 3} more
                      </Badge>
                    )}
                  </div>
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

          {/* Conditional rendering based on apiKeys.length is key here */}
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
              const model = getModelInfo(key.provider, key.model);
              return (
                <div
                  key={key.id} // Ensure this key is truly unique for React list rendering
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-600 transition-colors duration-200 animate-fade-in animate-stagger-${Math.min(index + 1, 5)}`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-lg sm:text-xl flex-shrink-0" aria-hidden="true">{provider?.icon}</span>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm sm:text-base truncate">{key.name}</h4>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs w-fit">{provider?.name}</Badge>
                        {model && (
                          <Badge variant="outline" className="text-xs w-fit">
                            {model.name}
                          </Badge>
                        )}
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
                      onValueChange={handleProviderChange}
                    >
                      <SelectTrigger
                        id="provider-select"
                        className={`focus-ring ${errors.provider ? 'border-red-500 focus:ring-red-500' : ''}`}
                      >
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent className="z-[9999] bg-slate-900 text-white border border-slate-700 shadow-lg ">
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
                    <Label htmlFor="model-select" className="text-sm">
                      Model <span className="text-red-500">*</span>
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
                        className={`focus-ring ${errors.model ? 'border-red-500 focus:ring-red-500' : ''}`}
                      >
                        <SelectValue placeholder={newKey.provider ? "Select model" : "Select provider first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {newKey.provider ? (
                          aiProviders.find(p => p.id === newKey.provider)?.models.map(model => (
                            <SelectItem key={model.id} value={model.id}>
                              <div className="flex flex-col">
                                <span>{model.name}</span>
                                <span className="text-xs text-gray-500">{model.description}</span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-gray-500">
                            Please select a provider first
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.model && (
                      <p className="text-red-500 text-xs mt-1">{errors.model}</p>
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
                </div>

                <div>
                  <Label htmlFor="api-key" className="text-sm">
                    API Key <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder={getKeyPlaceholder(newKey.provider)}
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

                {newKey.provider && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h5 className="text-xs font-semibold mb-2">PROVIDER INFO</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Selected Provider:</span>{' '}
                        <span className="font-medium">
                          {aiProviders.find(p => p.id === newKey.provider)?.name}
                        </span>
                      </div>
                      {newKey.model && (
                        <>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Selected Model:</span>{' '}
                            <span className="font-medium">
                              {aiProviders.find(p => p.id === newKey.provider)?.models.find(m => m.id === newKey.model)?.name}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Capabilities:</span>{' '}
                            <span className="font-medium">
                              {aiProviders.find(p => p.id === newKey.provider)?.models.find(m => m.id === newKey.model)?.capabilities.join(', ')}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Max Context:</span>{' '}
                            <span className="font-medium">
                              {aiProviders.find(p => p.id === newKey.provider)?.models.find(m => m.id === newKey.model)?.maxTokens?.toLocaleString() || 'Unknown'} tokens
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

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
                      setNewKey({ provider: '', model: '', key: '', name: '' });
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