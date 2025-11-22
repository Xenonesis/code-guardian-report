# AI Model Discovery Feature

## Overview

This feature allows users to automatically scan their AI provider API keys and discover the latest available models in real-time. Instead of relying on hardcoded model lists, the system now fetches current models directly from the provider's API.

## Features

### 1. **Dynamic Model Discovery**
- Automatically fetches available models when user enters their API key
- Shows the latest models with real-time information
- Displays model capabilities, token limits, and descriptions

### 2. **API Key Validation**
- Validates API keys before attempting to use them
- Provides immediate feedback on key validity
- Shows clear error messages for invalid keys

### 3. **Supported Providers**
The following providers support automatic model discovery:

#### OpenAI
- Fetches all available GPT models
- Includes GPT-4, GPT-4-turbo, GPT-3.5-turbo, and o1 models
- Automatically detects capabilities (text, code, vision, audio)
- Sorts by newest models first

#### Google Gemini
- Fetches all generative models from the API
- Includes Gemini 2.0, Gemini 1.5 Pro, Gemini 1.5 Flash
- Detects multimodal capabilities (text, code, vision, audio, video)
- Shows context window size up to 2M tokens

#### Anthropic Claude
- Validates API key and provides known Claude models
- Includes Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus
- Shows latest model versions with advanced reasoning capabilities
- All models support 200K token context

#### Groq
- Fetches models from Groq's OpenAI-compatible API
- Includes Llama, Mixtral, and Gemma models
- Optimized for ultra-fast inference
- Shows model metadata and capabilities

### 4. **User Interface Enhancements**

#### Scan API Button
- Located next to the API key input field
- Shows loading spinner during scanning
- Provides immediate visual feedback

#### Status Messages
- **Success**: Green alert showing number of discovered models
- **Error**: Red alert with detailed error message
- **Info**: Blue alert during scanning process

#### Model Selection Dropdown
- **Discovered Models Section**: Shows models fetched from API (highlighted in green)
- **Pre-configured Models Section**: Shows fallback hardcoded models
- Visual indicators for model capabilities (🔍 code, 👁️ vision, 🎵 audio, 🧠 reasoning)
- Displays token limits for each model

#### Model Counter Badge
- Shows "X Live Models" badge when models are discovered
- Appears in provider card header
- Updates dynamically as models are scanned

## How to Use

### Step 1: Add API Key
1. Navigate to the AI Configuration tab
2. Click "Add API Key"
3. Select your AI provider from the dropdown

### Step 2: Enter API Key
1. Enter your API key in the input field
2. The key format is validated based on provider requirements

### Step 3: Scan for Models
1. Click the "Scan API" button next to the API key field
2. Wait for the system to validate your key and fetch available models
3. View the success message showing number of models discovered

### Step 4: Select Model
1. Open the model dropdown
2. Choose from the "Available Models from API" section (recommended)
3. Or select from pre-configured models as fallback

### Step 5: Save Configuration
1. Enter a display name for your API key
2. Click "Add API Key" to save the configuration
3. The model information is stored with your API key

## Technical Details

### Model Discovery Service

Located at: `src/services/ai/modelDiscoveryService.ts`

#### Key Functions

```typescript
// Discover models for any provider
discoverModels(provider: string, apiKey: string): Promise<ModelDiscoveryResult>

// Validate API key
validateAPIKey(provider: string, apiKey: string): Promise<{ valid: boolean; error?: string }>

// Provider-specific functions
fetchOpenAIModels(apiKey: string): Promise<ModelDiscoveryResult>
fetchGeminiModels(apiKey: string): Promise<ModelDiscoveryResult>
fetchClaudeModels(apiKey: string): Promise<ModelDiscoveryResult>
fetchGroqModels(apiKey: string): Promise<ModelDiscoveryResult>
```

#### Model Interface

```typescript
interface AIModel {
  id: string;              // Unique model identifier
  name: string;            // Display name
  description: string;     // Model description
  maxTokens?: number;      // Maximum context window
  capabilities: string[];  // Model capabilities (code, text, vision, etc.)
  created?: number;        // Creation timestamp
  owned_by?: string;       // Model owner/provider
}
```

### API Endpoints

#### OpenAI
- **Endpoint**: `https://api.openai.com/v1/models`
- **Method**: GET
- **Auth**: Bearer token in Authorization header

#### Google Gemini
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models`
- **Method**: GET
- **Auth**: API key as query parameter

#### Anthropic Claude
- **Endpoint**: `https://api.anthropic.com/v1/messages`
- **Method**: POST (for validation)
- **Auth**: x-api-key header
- **Note**: Uses validation request since no public models endpoint exists

#### Groq
- **Endpoint**: `https://api.groq.com/openai/v1/models`
- **Method**: GET
- **Auth**: Bearer token in Authorization header

## Benefits

### For Users
- ✅ Always see the latest available models
- ✅ No need to manually check provider documentation
- ✅ Immediate validation of API keys
- ✅ Better informed model selection
- ✅ See actual token limits and capabilities

### For Developers
- ✅ Reduced maintenance (no hardcoded model lists to update)
- ✅ Automatic support for new models
- ✅ Better error handling and user feedback
- ✅ Extensible architecture for adding new providers

## Error Handling

### Common Errors

1. **Invalid API Key**
   - Message: "Invalid API key format" or provider-specific error
   - Solution: Check key format matches provider requirements

2. **Network Error**
   - Message: "Failed to fetch models" or "Network error"
   - Solution: Check internet connection and provider API status

3. **Rate Limited**
   - Message: Provider-specific rate limit message
   - Solution: Wait and try again later

4. **Provider Not Supported**
   - Message: "Provider does not provide a public models API"
   - Solution: Use pre-configured models instead

## Future Enhancements

### Planned Features
- [ ] Cache discovered models to reduce API calls
- [ ] Automatic refresh of model lists on schedule
- [ ] Model comparison tool
- [ ] Performance metrics for each model
- [ ] Cost estimation per model
- [ ] Model recommendation based on use case

### Additional Providers
- [ ] Mistral AI model discovery
- [ ] Cohere model discovery
- [ ] Perplexity model discovery
- [ ] Together AI model discovery
- [ ] Replicate model discovery

## Security Considerations

- API keys are stored locally in browser localStorage
- Keys are never sent to third-party servers (except provider APIs)
- Password input type masks keys during entry
- Show/hide toggle for viewing keys
- Keys are validated before storage

## Testing

To test the model discovery feature:

1. Open the application in a browser
2. Navigate to AI Configuration
3. Try adding API keys for different providers
4. Click "Scan API" and verify models are discovered
5. Check that model details are displayed correctly
6. Verify error handling with invalid keys

## Troubleshooting

### Models Not Appearing
- Verify API key is valid and active
- Check network connectivity
- Review browser console for errors
- Try a different provider

### Scan Button Disabled
- Ensure provider is selected
- Verify API key is entered
- Wait if scan is already in progress

### Wrong Models Showing
- Click "Scan API" again to refresh
- Clear browser cache and reload
- Verify correct provider is selected

## Support

For issues or questions:
1. Check the error message details
2. Review provider API documentation
3. Verify API key permissions
4. Check provider status pages
5. Open a GitHub issue with details

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: ✅ Production Ready
