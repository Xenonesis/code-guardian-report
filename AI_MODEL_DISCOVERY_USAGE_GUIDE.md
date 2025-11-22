# AI Model Discovery - User Guide

## Quick Start Guide

This guide shows you how to use the new AI Model Discovery feature to automatically scan your API keys and discover the latest available models.

---

## 🎯 Overview

The AI Model Discovery feature automatically:
- ✅ Validates your API keys
- ✅ Fetches the latest available models from your provider
- ✅ Shows model capabilities and token limits
- ✅ Updates in real-time

---

## 📖 Step-by-Step Instructions

### Step 1: Navigate to AI Configuration

1. Open the application
2. Click on the **AI Configuration** or **AI Key Manager** tab
3. You'll see the "AI Analysis Integration" page

### Step 2: Start Adding an API Key

1. Click the **"Add API Key"** button
2. A form will appear with several fields

### Step 3: Select Your Provider

1. Click on the **"AI Provider"** dropdown
2. Select your provider (e.g., OpenAI, Google Gemini, Claude, or Groq)
3. The form will update to show provider-specific information

**Providers with Model Discovery Support:**
- 🤖 OpenAI (GPT models)
- 💎 Google Gemini
- 🧠 Anthropic Claude
- 🚀 Groq

### Step 4: Enter Your API Key

1. In the **"API Key"** field, paste your API key
2. The key will be masked (shown as dots) for security
3. Notice the **"Scan API"** button next to the input field

**Note**: Each provider has a specific key format:
- OpenAI: starts with `sk-`
- Gemini: starts with `AIza`
- Claude: starts with `sk-ant-`
- Groq: starts with `gsk-`

### Step 5: Scan for Available Models

1. Click the **"Scan API"** button (with refresh icon)
2. You'll see a blue "Scanning..." message appear
3. Wait a few seconds while the system:
   - Validates your API key
   - Connects to the provider's API
   - Fetches all available models

### Step 6: Review Discovered Models

**Success!** If your API key is valid, you'll see:

✅ **Success Message (Green)**:
```
✓ Successfully discovered [X] available models!
```

✨ **Badge on Model Field**:
```
AI Model * [🌟 X Live Models]
```

### Step 7: Select a Model

1. Click on the **"AI Model"** dropdown
2. You'll see two sections:

**Section 1: Available Models from API** (Green highlighted)
- These are live models fetched from your provider
- Marked with ✓ checkmark icon
- Shows real-time capabilities and token limits
- **Recommended** - These are the most up-to-date

**Section 2: Pre-configured Models**
- Fallback models (hardcoded)
- Still functional but may be outdated
- Use these if API scan fails

3. Select your preferred model from the discovered models

### Step 8: Complete the Configuration

1. Enter a **"Display Name"** for this API key
   - Example: "My Production OpenAI Key"
   - Example: "Personal Gemini API"

2. Click **"Add API Key"** to save

3. Your configuration is now saved and active!

---

## 🎨 Understanding the UI

### Status Messages

**🔵 Scanning (Blue Alert)**
```
ℹ️ Scanning API and discovering available models...
```
- Appears while fetching models
- Shows spinning refresh icon

**✅ Success (Green Alert)**
```
✓ Successfully discovered 15 available models!
```
- Models fetched successfully
- Number indicates how many models found

**❌ Error (Red Alert)**
```
⚠️ Invalid API key format. Key should start with "sk-"
```
- Something went wrong
- Shows specific error message
- Check your API key and try again

### Model Capabilities Icons

When viewing models, you'll see capability indicators:

- 🔍 **Code** - Model can analyze and generate code
- 👁️ **Vision** - Model can process images
- 🎵 **Audio** - Model can process audio
- 🧠 **Reasoning** - Model has advanced reasoning capabilities

### Model Information Display

Each model shows:
```
✓ GPT-4 Turbo 🔍 👁️
  Most capable GPT-4 model with 128k context
  128,000 tokens
```

1. **Name** - Model identifier
2. **Icons** - Capabilities
3. **Description** - What the model does
4. **Token Limit** - Maximum context window

---

## 📝 Example Workflows

### Example 1: OpenAI Setup

```
1. Select Provider: "OpenAI"
2. Enter API Key: "sk-proj-abc123..."
3. Click "Scan API"
4. ✓ Success: "Successfully discovered 12 available models!"
5. Select Model: "gpt-4o-2024-11-20" (Latest)
   - Description: Most advanced GPT-4o model
   - Capabilities: 🔍 👁️ 🎵
   - Tokens: 128,000
6. Display Name: "My OpenAI Production Key"
7. Click "Add API Key"
```

### Example 2: Google Gemini Setup

```
1. Select Provider: "Google Gemini"
2. Enter API Key: "AIzaSyC..."
3. Click "Scan API"
4. ✓ Success: "Successfully discovered 8 available models!"
5. Select Model: "gemini-2.0-flash-exp" (Latest)
   - Description: Latest Gemini 2.0 with multimodal
   - Capabilities: 🔍 👁️ 🎵 🎬
   - Tokens: 1,000,000
6. Display Name: "Gemini Development"
7. Click "Add API Key"
```

### Example 3: Handling Errors

```
1. Select Provider: "OpenAI"
2. Enter API Key: "invalid-key-123"
3. Click "Scan API"
4. ❌ Error: "OpenAI API error (401): Invalid authentication"
5. Fix: Check your API key in OpenAI dashboard
6. Try again with correct key
```

---

## 💡 Tips & Tricks

### Tip 1: Always Scan First
**Before selecting a model**, click "Scan API" to see the latest available models. Providers frequently release new models.

### Tip 2: Compare Models
After scanning, compare the discovered models:
- Check token limits for your use case
- Review capabilities (do you need vision support?)
- Consider model descriptions

### Tip 3: Fallback Models
If scanning fails (network issues, rate limits), you can still use pre-configured models from the bottom section of the dropdown.

### Tip 4: Multiple Keys
You can add multiple API keys:
- Different providers for different tasks
- Backup keys for reliability
- Development vs. production keys

### Tip 5: Update Regularly
Re-scan periodically to discover newly released models:
1. Open your saved key configuration
2. Click "Scan API" again
3. Select newer models if available

---

## 🔧 Troubleshooting

### Issue: "Scan API" button is disabled

**Possible Causes:**
- No provider selected
- No API key entered
- Scan already in progress

**Solution:**
1. Select a provider first
2. Enter your API key
3. Wait if scan is running

---

### Issue: No models discovered

**Possible Causes:**
- Invalid API key
- Network connectivity issue
- Provider API is down

**Solution:**
1. Verify your API key is correct
2. Check your internet connection
3. Try again in a few minutes
4. Use pre-configured models as fallback

---

### Issue: "Provider does not provide a public models API"

**Explanation:**
Some providers (Mistral, Cohere, Perplexity) don't have public model listing endpoints.

**Solution:**
Select from the pre-configured models section instead. These are still functional and up-to-date.

---

### Issue: Rate limit error

**Message:**
```
❌ Rate limit exceeded. Please try again later.
```

**Solution:**
1. Wait 5-10 minutes
2. Try scanning again
3. Use pre-configured models in the meantime

---

### Issue: Network error

**Message:**
```
❌ Failed to fetch models: Network error
```

**Solution:**
1. Check your internet connection
2. Verify firewall isn't blocking the request
3. Try again when connection is stable

---

## 🔐 Security & Privacy

### Your Data is Safe

✅ **Local Storage Only**
- API keys are stored in your browser's localStorage
- Never sent to third-party servers

✅ **Direct Provider Communication**
- Model discovery connects directly to provider APIs
- No intermediary servers

✅ **Masked Display**
- API keys shown as dots (•••) by default
- Show/hide toggle available if needed

✅ **Validation First**
- Keys validated before any usage
- Clear error messages without exposing keys

---

## 📊 Supported Providers Details

### OpenAI
- **Models**: GPT-4o, GPT-4 Turbo, GPT-4, GPT-3.5 Turbo, o1 series
- **Update Frequency**: Frequent (new models monthly)
- **Best For**: Code analysis, general tasks, multimodal
- **Note**: Usually has the most models available

### Google Gemini
- **Models**: Gemini 2.0, Gemini 1.5 Pro, Gemini 1.5 Flash
- **Update Frequency**: Regular updates
- **Best For**: Long context (up to 2M tokens), multimodal
- **Note**: Great for large codebases

### Anthropic Claude
- **Models**: Claude 3.5 Sonnet/Haiku, Claude 3 Opus/Sonnet/Haiku
- **Update Frequency**: Periodic updates
- **Best For**: Detailed analysis, reasoning, code review
- **Note**: Uses validation + known models list

### Groq
- **Models**: Llama 3, Mixtral, Gemma (Groq-optimized)
- **Update Frequency**: As new models added
- **Best For**: Ultra-fast inference, cost-effective
- **Note**: Same models, 10x faster

---

## ❓ Frequently Asked Questions

**Q: Do I need to scan every time?**
A: No, models are saved when you add the API key. Scan again only to discover new models.

**Q: Can I use multiple providers?**
A: Yes! Add API keys for multiple providers. The system will try them in order.

**Q: Are discovered models better than pre-configured?**
A: Yes, discovered models are always up-to-date with the latest releases.

**Q: What if my provider isn't supported?**
A: Use the pre-configured models. We're adding more providers regularly.

**Q: Is my API key secure?**
A: Yes, keys are stored locally in your browser only. Never sent to third parties.

**Q: Why did scanning fail?**
A: Common reasons: invalid key, network issue, rate limit. Check the error message for details.

**Q: Can I edit my API key later?**
A: Currently, remove the old key and add a new one. Edit feature coming soon.

**Q: How often are new models released?**
A: Varies by provider. OpenAI releases most frequently (monthly). Others quarterly.

---

## 🎓 Best Practices

### 1. Start with Scanning
Always scan for models before selecting one. This ensures you get the latest options.

### 2. Name Keys Descriptively
Use clear names like "Production OpenAI" or "Dev Gemini Key" to track multiple keys.

### 3. Monitor New Releases
Check provider blogs for new model announcements, then re-scan to discover them.

### 4. Test Before Production
Add a test API key first to verify everything works before using production keys.

### 5. Keep Keys Secure
Never share your API keys. If exposed, revoke them immediately in the provider dashboard.

---

## 🆘 Need Help?

If you encounter issues:

1. **Check this guide** - Most questions answered here
2. **Review error messages** - They provide specific guidance
3. **Verify API key** - Confirm it's valid in provider dashboard
4. **Check provider status** - Visit provider status pages
5. **Report issues** - Open a GitHub issue with details

---

## 📚 Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Anthropic Claude API Docs](https://docs.anthropic.com)
- [Groq API Documentation](https://console.groq.com/docs)

---

**Last Updated**: 2024  
**Feature Version**: 1.0.0  
**Status**: ✅ Production Ready

---

## 🎉 You're Ready!

Congratulations! You now know how to:
- ✅ Scan API keys
- ✅ Discover latest models
- ✅ Select the best model for your needs
- ✅ Troubleshoot common issues

Start scanning and enjoy access to the latest AI models! 🚀
