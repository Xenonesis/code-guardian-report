# AI Model Discovery - Quick Reference Card

## 🚀 Quick Start

```typescript
import { discoverModels, validateAPIKey } from '@/services/ai/modelDiscoveryService';

// Validate API key
const validation = await validateAPIKey('openai', 'sk-...');
console.log(validation.valid); // true/false

// Discover models
const result = await discoverModels('openai', 'sk-...');
console.log(result.models); // Array of AIModel objects
```

---

## 📦 API Reference

### Main Functions

#### `discoverModels(provider, apiKey)`
Discovers available models from provider API.

**Parameters:**
- `provider: string` - Provider ID ('openai', 'gemini', 'claude', 'groq')
- `apiKey: string` - Valid API key

**Returns:**
```typescript
{
  success: boolean;
  models: AIModel[];
  error?: string;
}
```

**Example:**
```typescript
const result = await discoverModels('openai', 'sk-proj-...');
if (result.success) {
  console.log(`Found ${result.models.length} models`);
  result.models.forEach(m => console.log(m.name));
}
```

---

#### `validateAPIKey(provider, apiKey)`
Validates an API key without storing it.

**Parameters:**
- `provider: string` - Provider ID
- `apiKey: string` - API key to validate

**Returns:**
```typescript
{
  valid: boolean;
  error?: string;
}
```

**Example:**
```typescript
const { valid, error } = await validateAPIKey('gemini', 'AIza...');
if (!valid) {
  console.error('Invalid key:', error);
}
```

---

### Provider-Specific Functions

#### `fetchOpenAIModels(apiKey)`
```typescript
const result = await fetchOpenAIModels('sk-...');
```

#### `fetchGeminiModels(apiKey)`
```typescript
const result = await fetchGeminiModels('AIza...');
```

#### `fetchClaudeModels(apiKey)`
```typescript
const result = await fetchClaudeModels('sk-ant-...');
```

#### `fetchGroqModels(apiKey)`
```typescript
const result = await fetchGroqModels('gsk-...');
```

---

## 🏗️ Data Structures

### AIModel Interface
```typescript
interface AIModel {
  id: string;              // e.g., "gpt-4-turbo-2024-04-09"
  name: string;            // e.g., "GPT-4 Turbo"
  description: string;     // Model description
  maxTokens?: number;      // e.g., 128000
  capabilities: string[];  // ['code', 'text', 'vision']
  created?: number;        // Unix timestamp
  owned_by?: string;       // e.g., "openai"
}
```

### ModelDiscoveryResult Interface
```typescript
interface ModelDiscoveryResult {
  success: boolean;
  models: AIModel[];
  error?: string;
}
```

---

## 🔌 Provider Endpoints

### OpenAI
```
GET https://api.openai.com/v1/models
Authorization: Bearer {apiKey}
```

### Google Gemini
```
GET https://generativelanguage.googleapis.com/v1beta/models?key={apiKey}
```

### Anthropic Claude
```
POST https://api.anthropic.com/v1/messages
x-api-key: {apiKey}
anthropic-version: 2023-06-01
```

### Groq
```
GET https://api.groq.com/openai/v1/models
Authorization: Bearer {apiKey}
```

---

## 🎯 Usage in Components

### React Component Example
```tsx
import { useState } from 'react';
import { discoverModels, AIModel } from '@/services/ai/modelDiscoveryService';

function ModelSelector() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(false);
  
  const scanAPI = async (provider: string, apiKey: string) => {
    setLoading(true);
    try {
      const result = await discoverModels(provider, apiKey);
      if (result.success) {
        setModels(result.models);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <button onClick={() => scanAPI('openai', 'sk-...')}>
        {loading ? 'Scanning...' : 'Scan API'}
      </button>
      <select>
        {models.map(m => (
          <option key={m.id} value={m.id}>
            {m.name} - {m.maxTokens?.toLocaleString()} tokens
          </option>
        ))}
      </select>
    </div>
  );
}
```

---

## ⚡ Common Patterns

### Pattern 1: Validate Before Discovering
```typescript
// Best practice: validate first
const validation = await validateAPIKey(provider, apiKey);
if (!validation.valid) {
  showError(validation.error);
  return;
}

const result = await discoverModels(provider, apiKey);
```

### Pattern 2: Error Handling
```typescript
try {
  const result = await discoverModels(provider, apiKey);
  
  if (result.success) {
    // Handle success
    setModels(result.models);
  } else {
    // Handle failure
    showError(result.error || 'Unknown error');
  }
} catch (error) {
  // Handle exception
  showError(error.message);
}
```

### Pattern 3: Filtering Models
```typescript
const result = await discoverModels('openai', apiKey);

// Filter for GPT-4 models only
const gpt4Models = result.models.filter(m => 
  m.id.includes('gpt-4')
);

// Filter by capability
const visionModels = result.models.filter(m =>
  m.capabilities.includes('vision')
);

// Sort by token limit
const sortedByTokens = result.models.sort((a, b) =>
  (b.maxTokens || 0) - (a.maxTokens || 0)
);
```

### Pattern 4: Fallback to Pre-configured
```typescript
const result = await discoverModels(provider, apiKey);

const availableModels = result.success && result.models.length > 0
  ? result.models
  : PRECONFIGURED_MODELS[provider];
```

---

## 🎨 UI Integration Examples

### Status Indicator
```tsx
{scanStatus && (
  <Alert variant={scanStatus.type}>
    {scanStatus.type === 'success' && <CheckCircle />}
    {scanStatus.type === 'error' && <AlertTriangle />}
    {scanStatus.type === 'info' && <RefreshCw className="animate-spin" />}
    <AlertDescription>{scanStatus.message}</AlertDescription>
  </Alert>
)}
```

### Model Dropdown with Sections
```tsx
<Select>
  {/* Discovered models section */}
  {discoveredModels.length > 0 && (
    <>
      <SelectLabel>Available Models from API</SelectLabel>
      {discoveredModels.map(model => (
        <SelectItem key={model.id} value={model.id}>
          <CheckCircle /> {model.name}
          <span>{model.maxTokens?.toLocaleString()} tokens</span>
        </SelectItem>
      ))}
      <SelectSeparator />
    </>
  )}
  
  {/* Pre-configured models section */}
  <SelectLabel>Pre-configured Models</SelectLabel>
  {preconfiguredModels.map(model => (
    <SelectItem key={model.id} value={model.id}>
      {model.name}
    </SelectItem>
  ))}
</Select>
```

### Scan Button
```tsx
<Button
  onClick={handleScanAPI}
  disabled={!provider || !apiKey || isScanning}
>
  {isScanning ? (
    <RefreshCw className="animate-spin" />
  ) : (
    <>
      <RefreshCw /> Scan API
    </>
  )}
</Button>
```

---

## 🔍 Capability Detection

### Capability Icons Map
```typescript
const CAPABILITY_ICONS = {
  code: '🔍',
  text: '📝',
  vision: '👁️',
  audio: '🎵',
  video: '🎬',
  reasoning: '🧠'
};

// Display capabilities
model.capabilities.map(cap => CAPABILITY_ICONS[cap])
```

### Capability Filtering
```typescript
// Find models with specific capabilities
const codeModels = models.filter(m => 
  m.capabilities.includes('code')
);

const multimodalModels = models.filter(m =>
  m.capabilities.includes('vision') && 
  m.capabilities.includes('audio')
);
```

---

## 🐛 Error Codes & Messages

### Common Errors

| Error Code | Message | Solution |
|------------|---------|----------|
| 401 | Invalid authentication | Check API key |
| 403 | Permission denied | Verify API key permissions |
| 404 | Not found | Check endpoint URL |
| 429 | Rate limit exceeded | Wait and retry |
| 500 | Server error | Provider issue, try later |

### Error Handling Pattern
```typescript
const handleError = (error: string) => {
  if (error.includes('401')) {
    return 'Invalid API key';
  } else if (error.includes('429')) {
    return 'Rate limit exceeded. Please wait.';
  } else if (error.includes('network')) {
    return 'Network error. Check connection.';
  } else {
    return 'Unknown error occurred';
  }
};
```

---

## 📊 Provider Comparison

| Provider | Endpoint | Models Count | Update Frequency |
|----------|----------|--------------|------------------|
| OpenAI | ✅ Public | 10-15 | Monthly |
| Gemini | ✅ Public | 5-10 | Quarterly |
| Claude | ⚠️ Validation | 5 (known) | Quarterly |
| Groq | ✅ Public | 5-8 | As added |

---

## ⚙️ Configuration Examples

### Environment Variables
```bash
# .env.local
VITE_OPENAI_API_KEY=sk-...
VITE_GEMINI_API_KEY=AIza...
VITE_CLAUDE_API_KEY=sk-ant-...
VITE_GROQ_API_KEY=gsk-...
```

### Constants
```typescript
export const PROVIDER_CONFIG = {
  openai: {
    endpoint: 'https://api.openai.com/v1/models',
    keyPrefix: 'sk-',
    authHeader: 'Authorization'
  },
  gemini: {
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    keyPrefix: 'AIza',
    authParam: 'key'
  },
  // ... more providers
};
```

---

## 🧪 Testing Examples

### Unit Test Example
```typescript
import { validateAPIKey } from './modelDiscoveryService';

describe('validateAPIKey', () => {
  it('should validate OpenAI key format', async () => {
    const result = await validateAPIKey('openai', 'sk-test123');
    expect(result.valid).toBeDefined();
  });
  
  it('should reject invalid key', async () => {
    const result = await validateAPIKey('openai', 'invalid');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });
});
```

### Integration Test Example
```typescript
import { discoverModels } from './modelDiscoveryService';

describe('discoverModels', () => {
  it('should fetch OpenAI models', async () => {
    const result = await discoverModels('openai', process.env.TEST_OPENAI_KEY);
    
    expect(result.success).toBe(true);
    expect(result.models.length).toBeGreaterThan(0);
    expect(result.models[0]).toHaveProperty('id');
    expect(result.models[0]).toHaveProperty('name');
  });
});
```

---

## 🚨 Troubleshooting

### Debug Mode
```typescript
const DEBUG = true;

const result = await discoverModels(provider, apiKey);
if (DEBUG) {
  console.log('Provider:', provider);
  console.log('Success:', result.success);
  console.log('Models found:', result.models.length);
  console.log('Error:', result.error);
}
```

### Network Debugging
```typescript
// Log all requests
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  console.log('Fetch:', args[0]);
  const response = await originalFetch(...args);
  console.log('Status:', response.status);
  return response;
};
```

---

## 📚 Resources

- **Service File**: `src/services/ai/modelDiscoveryService.ts`
- **Component**: `src/components/ai/AIKeyManager.tsx`
- **Full Documentation**: `AI_MODEL_DISCOVERY_FEATURE.md`
- **Usage Guide**: `AI_MODEL_DISCOVERY_USAGE_GUIDE.md`

---

## 🎓 Tips

1. **Always validate before discovering** - Catches issues early
2. **Cache results** - Reduce API calls
3. **Handle errors gracefully** - Show user-friendly messages
4. **Provide fallbacks** - Pre-configured models as backup
5. **Update regularly** - New models released frequently

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Production Ready ✅
