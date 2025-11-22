# Quick Fix Guide: AI Fix Suggestions 404 Error

## Issue
Getting error: `models/gemini-1.5-flash is not found for API version v1beta`

## Quick Solution

### For New Users:
1. Open the application
2. Go to **AI Configuration** tab
3. Click **"Add New API Key"**
4. Select your provider (e.g., Gemini)
5. **Click "Scan API for Models"** button to discover available models
6. Select a model from the dropdown (e.g., `gemini-1.5-flash`)
7. Enter your API key and a name
8. Click **Save**

### For Existing Users:
If you already have API keys configured but getting the 404 error:

**Option 1: Re-save your keys (Recommended)**
1. Go to **AI Configuration** tab
2. Delete your existing key
3. Add it again following the steps above
4. Make sure to select a model from the dropdown

**Option 2: Use defaults (Automatic)**
- The system will automatically use default models:
  - OpenAI: `gpt-4o-mini`
  - Gemini: `gemini-1.5-flash`
  - Claude: `claude-3-5-sonnet-20241022`
- Just refresh the page and try again

## Supported Gemini Models
After scanning, you'll see models like:
- `gemini-1.5-flash` - Fast, 1M token context
- `gemini-1.5-pro` - Advanced, 2M token context
- `gemini-2.0-flash-exp` - Latest experimental
- `gemini-pro` - General purpose

## Verification
To verify the fix is working:
1. Open browser console (F12)
2. Try using AI Fix Suggestions
3. Look for log: `Using Gemini model: gemini-1.5-flash` (or your selected model)
4. Should see successful API calls instead of 404 errors

## Technical Details
The fix ensures that:
- ✅ The model you select is actually used in API calls
- ✅ Old configurations get sensible defaults
- ✅ All AI features (Fix Suggestions, Chat, Security Insights) use the correct model
- ✅ Works with all providers: OpenAI, Gemini, Claude

## Still Having Issues?
Check these:
1. **API Key Valid**: Verify your API key is correct
2. **Model Available**: Use "Scan API for Models" to see what's available
3. **Network**: Check browser console for network errors
4. **Quota**: Ensure your API quota hasn't been exceeded
