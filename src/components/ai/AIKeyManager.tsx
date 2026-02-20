// src/components/AIKeyManager.tsx

import React, { useState, useEffect } from "react";
import {
  Key,
  Plus,
  Trash2,
  Bot,
  AlertTriangle,
  CheckCircle,
  Zap,
  Shield,
  Sparkles,
  Star,
  Search,
  Github,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  setLocalStorageItem,
  removeLocalStorageItem,
} from "@/utils/storageEvents";
import {
  discoverModels,
  validateAPIKey,
  AIModel,
} from "@/services/ai/modelDiscoveryService";
import { GitHubCopilotManager } from "./GitHubCopilotManager";

// Real AI Provider Icons
const OpenAIIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
  </svg>
);

const GeminiIcon = () => (
  <svg viewBox="0 0 28 28" className="h-6 w-6" fill="none">
    <path
      d="M14 28C14 26.0633 13.6267 24.2433 12.88 22.54C12.1567 20.8367 11.165 19.355 9.905 18.095C8.645 16.835 7.16333 15.8433 5.46 15.12C3.75667 14.3733 1.93667 14 0 14C1.93667 14 3.75667 13.6383 5.46 12.915C7.16333 12.1683 8.645 11.165 9.905 9.905C11.165 8.645 12.1567 7.16333 12.88 5.46C13.6267 3.75667 14 1.93667 14 0C14 1.93667 14.3617 3.75667 15.085 5.46C15.8317 7.16333 16.835 8.645 18.095 9.905C19.355 11.165 20.8367 12.1683 22.54 12.915C24.2433 13.6383 26.0633 14 28 14C26.0633 14 24.2433 14.3733 22.54 15.12C20.8367 15.8433 19.355 16.835 18.095 18.095C16.835 19.355 15.8317 20.8367 15.085 22.54C14.3617 24.2433 14 26.0633 14 28Z"
      fill="url(#gemini-gradient)"
    />
    <defs>
      <linearGradient
        id="gemini-gradient"
        x1="0"
        y1="14"
        x2="28"
        y2="14"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#4285F4" />
        <stop offset="0.5" stopColor="#9B72CB" />
        <stop offset="1" stopColor="#D96570" />
      </linearGradient>
    </defs>
  </svg>
);

const ClaudeIcon = () => (
  <img
    src="https://img.icons8.com/?size=100&id=H5H0mqCCr5AV&format=png&color=000000"
    alt="Claude"
    className="h-6 w-6 dark:invert"
  />
);

const MistralIcon = () => (
  <svg viewBox="0 0 365 258" className="h-6 w-6" fill="none">
    <path d="M104.107 0H52.0525V51.57H104.107V0Z" fill="#FFD800" />
    <path d="M312.351 0H260.296V51.57H312.351V0Z" fill="#FFD800" />
    <path d="M156.161 51.5701H52.0525V103.14H156.161V51.5701Z" fill="#FFAF00" />
    <path d="M312.353 51.5701H208.244V103.14H312.353V51.5701Z" fill="#FFAF00" />
    <path d="M312.356 103.14H52.0525V154.71H312.356V103.14Z" fill="#FF8205" />
    <path d="M104.107 154.71H52.0525V206.28H104.107V154.71Z" fill="#FA500F" />
    <path
      d="M208.228 154.711H156.174V206.281H208.228V154.711Z"
      fill="#FA500F"
    />
    <path
      d="M312.351 154.711H260.296V206.281H312.351V154.711Z"
      fill="#FA500F"
    />
    <path d="M156.195 206.312H0V257.882H156.195V206.312Z" fill="#E10500" />
    <path
      d="M364.439 206.312H208.244V257.882H364.439V206.312Z"
      fill="#E10500"
    />
  </svg>
);

const LlamaIcon = () => (
  <img
    src="https://static.xx.fbcdn.net/rsrc.php/y9/r/tL_v571NdZ0.svg"
    alt="Meta Llama"
    className="h-6 w-6 dark:brightness-200 dark:invert"
  />
);

const CohereIcon = () => (
  <img
    src="https://cohere.com/logo.svg"
    alt="Cohere"
    className="h-6 w-6 dark:brightness-200 dark:invert"
  />
);

const PerplexityIcon = () => (
  <svg viewBox="0 0 336 400" className="h-6 w-6" fill="currentColor">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M101.008 42L190.99 124.905V124.886V42.1913H208.506V125.276L298.891 42V136.524H336V272.866H299.005V357.035L208.506 277.525V357.948H190.99V278.836L101.11 358V272.866H64V136.524H101.008V42ZM177.785 153.826H81.5159V255.564H101.088V223.472L177.785 153.826ZM118.625 231.149V319.392L190.99 255.655V165.421L118.625 231.149ZM209.01 254.812V165.336L281.396 231.068V272.866H281.489V318.491L209.01 254.812ZM299.005 255.564H318.484V153.826H222.932L299.005 222.751V255.564ZM281.375 136.524V81.7983L221.977 136.524H281.375ZM177.921 136.524H118.524V81.7983L177.921 136.524Z"
    />
  </svg>
);

const GroqIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
    <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" />
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
    id: "github-copilot",
    name: "GitHub Copilot",
    icon: <Github className="h-6 w-6" />,
    description: "AI pair programmer",
    keyPrefix: "",
    keyPlaceholder: "",
    models: [],
  },
  {
    id: "openai",
    name: "OpenAI",
    icon: <OpenAIIcon />,
    description: "GPT-4 powered analysis",
    keyPrefix: "sk-",
    keyPlaceholder: "sk-... (starts with sk-)",
    models: [],
  },
  {
    id: "gemini",
    name: "Google Gemini",
    icon: <GeminiIcon />,
    description: "Advanced code understanding",
    keyPrefix: "AIza",
    keyPlaceholder: "AIza... (starts with AIza)",
    models: [],
  },
  {
    id: "claude",
    name: "Anthropic Claude",
    icon: <ClaudeIcon />,
    description: "Detailed security insights",
    keyPrefix: "sk-ant-",
    keyPlaceholder: "sk-ant-... (starts with sk-ant-)",
    models: [],
  },
  {
    id: "mistral",
    name: "Mistral AI",
    icon: <MistralIcon />,
    description: "Fast and efficient analysis",
    keyPrefix: "",
    keyPlaceholder: "Your Mistral API key",
    models: [],
  },
  {
    id: "llama",
    name: "Meta Llama",
    icon: <LlamaIcon />,
    description: "Open-weight models",
    keyPrefix: "",
    keyPlaceholder: "Your Llama API key",
    models: [],
  },
  {
    id: "cohere",
    name: "Cohere",
    icon: <CohereIcon />,
    description: "Enterprise-focused models",
    keyPrefix: "",
    keyPlaceholder: "Your Cohere API key",
    models: [],
  },
  {
    id: "perplexity",
    name: "Perplexity",
    icon: <PerplexityIcon />,
    description: "Fast online models",
    keyPrefix: "pplx-",
    keyPlaceholder: "pplx-... (Perplexity API key)",
    models: [],
  },
  {
    id: "groq",
    name: "Groq",
    icon: <GroqIcon />,
    description: "Extremely fast inference",
    keyPrefix: "gsk-",
    keyPlaceholder: "gsk-... (Groq API key)",
    models: [],
  },
];

interface APIKey {
  id: string;
  provider: string;
  model: string;
  key: string;
  name: string;
}

export const AIKeyManager: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>(() => {
    try {
      const storedKeys = localStorage.getItem("aiApiKeys");
      if (storedKeys) {
        return JSON.parse(storedKeys);
      }
    } catch {
      localStorage.removeItem("aiApiKeys");
    }
    return [];
  });

  const [newKey, setNewKey] = useState({
    provider: "",
    model: "",
    key: "",
    name: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discoveredModels, setDiscoveredModels] = useState<AIModel[]>([]);
  const [_isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  useEffect(() => {
    if (apiKeys.length > 0) {
      setLocalStorageItem("aiApiKeys", JSON.stringify(apiKeys));
    } else {
      removeLocalStorageItem("aiApiKeys");
    }
  }, [apiKeys]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!newKey.provider.trim())
      newErrors.provider = "Please select an AI provider";
    if (!newKey.model.trim()) newErrors.model = "Please select a model";
    if (!newKey.name.trim())
      newErrors.name = "Please enter a name for this API key";
    if (!newKey.key.trim()) {
      newErrors.key = "Please enter your API key";
    } else if (newKey.key.length < 10) {
      newErrors.key = "API key seems too short. Please check your key";
    } else {
      const provider = aiProviders.find((p) => p.id === newKey.provider);
      if (provider?.keyPrefix && !newKey.key.startsWith(provider.keyPrefix)) {
        newErrors.key = `API key should start with "${provider.keyPrefix}"`;
      }
    }
    if (
      newKey.name.trim() &&
      apiKeys.some(
        (key) => key.name.toLowerCase() === newKey.name.toLowerCase()
      )
    ) {
      newErrors.name = "A key with this name already exists";
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
        model: newKey.model.trim(),
        key: newKey.key.trim(),
        name: newKey.name.trim(),
      };
      setApiKeys((prevKeys) => [...prevKeys, key]);
      setNewKey({ provider: "", model: "", key: "", name: "" });
      setIsAdding(false);
      setErrors({});
    } catch {
      setErrors({ general: "Failed to add API key. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeAPIKey = (id: string) => {
    const updatedKeys = apiKeys.filter((key) => key.id !== id);
    setApiKeys(updatedKeys);
  };

  const getProviderInfo = (providerId: string) => {
    return aiProviders.find((p) => p.id === providerId);
  };

  const getModelInfo = (providerId: string, modelId: string) => {
    const provider = getProviderInfo(providerId);
    return provider?.models.find((m) => m.id === modelId);
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return "••••••••";
    return key.substring(0, 4) + "••••••••" + key.substring(key.length - 4);
  };

  const handleProviderChange = (value: string) => {
    setNewKey({ ...newKey, provider: value, model: "", key: "" });
    setDiscoveredModels([]);
    setScanStatus(null);
    if (errors.provider) setErrors((prev) => ({ ...prev, provider: "" }));
  };

  const handleScanAPI = async () => {
    if (!newKey.provider || !newKey.key) {
      setScanStatus({
        message: "Please select a provider and enter an API key first",
        type: "error",
      });
      return;
    }
    setIsScanning(true);
    setScanStatus({
      message: "Scanning API and discovering available models...",
      type: "info",
    });
    try {
      const validation = await validateAPIKey(newKey.provider, newKey.key);
      if (!validation.valid) {
        setScanStatus({
          message: validation.error || "Invalid API key",
          type: "error",
        });
        setIsScanning(false);
        return;
      }
      const result = await discoverModels(newKey.provider, newKey.key);
      if (result.success && result.models.length > 0) {
        setDiscoveredModels(result.models);
        setScanStatus({
          message: `Successfully discovered ${result.models.length} available models!`,
          type: "success",
        });
      } else if (result.error) {
        setScanStatus({ message: result.error, type: "error" });
      } else {
        setScanStatus({ message: "No models found", type: "error" });
      }
    } catch (error) {
      setScanStatus({
        message: error instanceof Error ? error.message : "Failed to scan API",
        type: "error",
      });
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (newKey.provider && newKey.key && newKey.key.length > 10) {
      const timeoutId = setTimeout(() => {
        handleScanAPI();
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
    setDiscoveredModels([]);
    setScanStatus(null);
    return undefined;
  }, [newKey.provider, newKey.key]);

  const getKeyPlaceholder = (providerId: string) => {
    const provider = aiProviders.find((p) => p.id === providerId);
    return provider?.keyPlaceholder || "Enter your API key";
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 p-6 text-slate-200">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-xl border border-blue-900/50 bg-[#0B1120] p-6 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-purple-900/10" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 p-3 shadow-lg shadow-blue-900/20">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-display bg-gradient-to-r from-blue-100 to-indigo-200 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                AI ANALYSIS INTEGRATION
              </h1>
              <p className="text-sm text-slate-400">
                Supercharge your code analysis with AI-powered insights
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-green-800 bg-green-950/30 px-3 py-1 text-green-400"
          >
            <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
            Secure Storage
          </Badge>
        </div>
      </div>

      {/* Supported AI Providers */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <div className="rounded-lg bg-blue-500/10 p-2">
            <Sparkles className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-slate-100">
              SUPPORTED AI PROVIDERS
            </h2>
            <p className="text-xs text-slate-500">
              Choose from industry-leading AI providers for enhanced analysis
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {aiProviders.map((provider) => {
            if (provider.id === "github-copilot") {
              return (
                <div
                  key={provider.id}
                  className="col-span-1 md:col-span-2 lg:col-span-3"
                >
                  <GitHubCopilotManager />
                </div>
              );
            }
            const isConfigured = apiKeys.some(
              (key) => key.provider === provider.id
            );
            return (
              <div
                key={provider.id}
                className={`group relative overflow-hidden rounded-xl border bg-[#0F1629] p-5 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/10 ${
                  isConfigured
                    ? "border-green-500/30 ring-1 ring-green-500/20"
                    : "border-slate-800 hover:border-blue-700/50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-700/50 bg-[#161F36] text-slate-200 shadow-inner transition-colors group-hover:border-blue-700/30 group-hover:text-blue-400">
                    {provider.icon}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="text-sm font-semibold text-slate-200 transition-colors group-hover:text-blue-300">
                      {provider.name}
                    </h3>
                    <p className="line-clamp-2 text-xs text-slate-500">
                      {provider.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
                  <div className="flex items-center gap-1.5 rounded-full border border-slate-700/50 bg-slate-900/50 px-2 py-0.5 text-[10px] text-slate-400 transition-colors group-hover:border-blue-800/30 group-hover:text-blue-300">
                    <Search className="h-3 w-3" />
                    Live Discovery
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-600 transition-colors group-hover:bg-blue-500" />
                    Real-time
                  </div>
                </div>

                <div className="mt-2 text-center text-[10px] text-slate-600 opacity-0 transition-opacity group-hover:opacity-100">
                  Models are discovered automatically from the API when you add
                  your key
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Your API Keys Section */}
      <div className="rounded-xl border border-blue-900/30 bg-[#0B1120] p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <Key className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-100">
                YOUR API KEYS
              </h2>
              <p className="text-xs text-slate-500">
                Manage your AI provider credentials securely
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsAdding(true)}
            variant="outline"
            size="sm"
            className="border-slate-700 bg-slate-900/50 text-xs text-slate-300 transition-all hover:border-blue-700/50 hover:bg-blue-900/20 hover:text-blue-300"
            disabled={isAdding}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            ADD API KEY
          </Button>
        </div>

        {isAdding && (
          <div className="animate-in slide-in-from-top-4 fade-in mb-6 rounded-lg border border-blue-900/30 bg-[#0F1629] p-6 duration-300">
            <h3 className="mb-4 text-sm font-semibold text-slate-200">
              Add New API Key
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs text-slate-400">Provider</Label>
                <Select
                  value={newKey.provider}
                  onValueChange={handleProviderChange}
                >
                  <SelectTrigger className="border-slate-700 bg-slate-900 text-slate-200">
                    <SelectValue placeholder="Select Provider" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-700 bg-[#0F1629] text-slate-200">
                    {aiProviders
                      .filter((p) => p.id !== "github-copilot")
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.provider && (
                  <p className="text-xs text-red-400">{errors.provider}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-slate-400">API Key</Label>
                <Input
                  type="password"
                  value={newKey.key}
                  onChange={(e) => {
                    setNewKey({ ...newKey, key: e.target.value });
                    if (errors.key) setErrors({ ...errors, key: "" });
                  }}
                  className="border-slate-700 bg-slate-900 font-mono text-xs text-slate-200"
                  placeholder={getKeyPlaceholder(newKey.provider)}
                />
                {errors.key && (
                  <p className="text-xs text-red-400">{errors.key}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-slate-400">Display Name</Label>
                <Input
                  value={newKey.name}
                  onChange={(e) => {
                    setNewKey({ ...newKey, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  className="border-slate-700 bg-slate-900 text-xs text-slate-200"
                  placeholder="e.g. My Production Key"
                />
                {errors.name && (
                  <p className="text-xs text-red-400">{errors.name}</p>
                )}
              </div>

              {discoveredModels.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Model</Label>
                  <Select
                    value={newKey.model}
                    onValueChange={(val) =>
                      setNewKey({ ...newKey, model: val })
                    }
                  >
                    <SelectTrigger className="border-slate-700 bg-slate-900 text-slate-200">
                      <SelectValue placeholder="Select Model" />
                    </SelectTrigger>
                    <SelectContent className="border-slate-700 bg-[#0F1629] text-slate-200">
                      {discoveredModels.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.model && (
                    <p className="text-xs text-red-400">{errors.model}</p>
                  )}
                </div>
              )}
            </div>

            {scanStatus && (
              <div
                className={`mt-4 flex items-center gap-2 rounded p-2 text-xs ${scanStatus.type === "success" ? "bg-green-900/20 text-green-400" : scanStatus.type === "error" ? "bg-red-900/20 text-red-400" : "bg-blue-900/20 text-blue-400"}`}
              >
                {scanStatus.type === "success" ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <AlertTriangle className="h-3 w-3" />
                )}
                {scanStatus.message}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                Cancel
              </Button>
              <Button
                onClick={addAPIKey}
                disabled={isSubmitting}
                size="sm"
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {isSubmitting ? "Saving..." : "Save API Key"}
              </Button>
            </div>
          </div>
        )}

        {apiKeys.length === 0 && !isAdding ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-800 bg-[#0F1629]/50 py-12 text-center">
            <div className="mb-4 rounded-full bg-slate-800 p-4 ring-1 ring-slate-700">
              <Key className="h-6 w-6 text-slate-500" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-slate-200">
              No API Keys Configured
            </h3>
            <p className="mb-6 max-w-sm text-sm text-slate-500">
              Add your first API key to unlock AI-powered code analysis,
              intelligent insights, and chat assistance.
            </p>
            <Button
              onClick={() => setIsAdding(true)}
              variant="outline"
              className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              GET STARTED
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {apiKeys.map((key) => {
              const provider = getProviderInfo(key.provider);
              const model = getModelInfo(key.provider, key.model);
              return (
                <div
                  key={key.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#0F1629] p-4 transition-all hover:border-slate-700"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded bg-slate-800 p-2 text-slate-400">
                      {provider?.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-slate-200">
                          {key.name}
                        </h4>
                        <Badge
                          variant="secondary"
                          className="bg-blue-900/30 text-[10px] text-blue-400 hover:bg-blue-900/50"
                        >
                          {provider?.name}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono">{maskKey(key.key)}</span>
                        {model && <span>• {model.name}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAPIKey(key.id)}
                      className="h-8 w-8 text-slate-500 hover:bg-red-900/20 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available AI Features */}
      <div className="rounded-xl border border-blue-900/30 bg-[#0B1120] p-6 shadow-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-violet-500/10 p-2">
            <Zap className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-slate-100">
              AVAILABLE AI FEATURES
            </h2>
            <p className="text-xs text-slate-500">
              Unlock powerful analytic capabilities with your API keys
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="group rounded-lg border border-slate-800 bg-[#0F1629] p-4 transition-all hover:border-blue-700/50 hover:bg-[#161F36]">
            <div className="mb-3 flex items-start justify-between">
              <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400 group-hover:bg-blue-500/20 group-hover:text-blue-300">
                <Bot className="h-5 w-5" />
              </div>
              <div className="rounded-full bg-slate-800 p-1 text-slate-500">
                <AlertTriangle className="h-3 w-3" />
              </div>
            </div>
            <h3 className="mb-1 font-semibold text-slate-200">
              AI Fix Suggestions
            </h3>
            <p className="mb-3 text-xs text-slate-500">
              Intelligent code fixes and security recommendations
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Requires API Key
            </div>
          </div>

          <div className="group rounded-lg border border-blue-900/30 bg-blue-900/5 p-4 ring-1 ring-blue-900/20">
            <div className="mb-3 flex items-start justify-between">
              <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                <Shield className="h-5 w-5" />
              </div>
              <div className="rounded-full bg-green-900/20 p-1 text-green-400">
                <CheckCircle className="h-3 w-3" />
              </div>
            </div>
            <h3 className="mb-1 font-semibold text-blue-100">
              Secure Code Search
            </h3>
            <p className="mb-3 text-xs text-blue-300/60">
              Advanced pattern matching and vulnerability detection
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-green-400">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              Always Available
            </div>
          </div>

          <div className="group rounded-lg border border-emerald-900/30 bg-emerald-900/5 p-4 ring-1 ring-emerald-900/20">
            <div className="mb-3 flex items-start justify-between">
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                <Star className="h-5 w-5" />
              </div>
              <div className="rounded-full bg-green-900/20 p-1 text-green-400">
                <CheckCircle className="h-3 w-3" />
              </div>
            </div>
            <h3 className="mb-1 font-semibold text-emerald-100">
              Code Provenance
            </h3>
            <p className="mb-3 text-xs text-emerald-300/60">
              Track code origins and identify potential supply chain risks
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-green-400">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              Always Available
            </div>
          </div>
        </div>

        {apiKeys.length === 0 && (
          <div className="mt-6 rounded-lg border border-amber-900/30 bg-amber-900/10 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <h4 className="text-sm font-semibold text-amber-200">
                  Unlock AI-Powered Analysis
                </h4>
                <p className="mt-1 text-xs text-amber-200/70">
                  Add your first API key to enable intelligent fix suggestions,
                  contextual code analysis, and AI-powered chat assistance. Your
                  keys are stored securely in your browser and never shared with
                  our servers.
                </p>
                <Button
                  onClick={() => setIsAdding(true)}
                  size="sm"
                  className="mt-3 h-8 border-none bg-amber-600 text-xs text-white hover:bg-amber-700"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  ADD YOUR FIRST API KEY
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Privacy Footer */}
      <div className="rounded-lg border border-slate-800 bg-[#0B1120] p-4 text-slate-400">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-slate-800 p-2">
            <Shield className="h-5 w-5 text-slate-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">
              Privacy & Security Guarantee
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Your API keys are encrypted and stored locally in your browser.
              They are never transmitted to our servers and are only used to
              communicate directly with your chosen AI providers. You maintain
              complete control over your credentials at all times.
            </p>
            <div className="mt-3 flex gap-4 text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-slate-600" /> Local
                Storage Only
              </span>
              <span className="flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-slate-600" /> End-to-End
                Encryption
              </span>
              <span className="flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-slate-600" /> Zero
                Server Access
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
