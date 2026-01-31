// src/services/ai/modelDiscoveryService.ts
// Service to discover and fetch available models from AI providers

export interface AIModel {
  id: string;
  name: string;
  description: string;
  maxTokens?: number;
  capabilities: string[];
  created?: number;
  owned_by?: string;
}

export interface ModelDiscoveryResult {
  success: boolean;
  models: AIModel[];
  error?: string;
}

/**
 * Fetches available models from OpenAI API
 */
export async function fetchOpenAIModels(
  apiKey: string
): Promise<ModelDiscoveryResult> {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to fetch models (${response.status})`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch {
        errorMessage = errorText || response.statusText;
      }
      return { success: false, models: [], error: errorMessage };
    }

    const data = await response.json();

    // Filter and map OpenAI models to our format
    const models: AIModel[] = data.data
      .filter((model: any) => {
        // Filter for GPT models (chat models)
        return model.id.includes("gpt") || model.id.includes("o1");
      })
      .map((model: any) => {
        // Determine capabilities and max tokens based on model ID
        let maxTokens = 4096;
        let capabilities = ["code", "text"];
        let description = "OpenAI language model";

        if (model.id.includes("gpt-4o")) {
          maxTokens = 128000;
          capabilities = ["code", "text", "vision", "audio"];
          description =
            "Most advanced GPT-4o model with multimodal capabilities";
        } else if (model.id.includes("gpt-4-turbo")) {
          maxTokens = 128000;
          capabilities = ["code", "text", "vision"];
          description = "Latest GPT-4 Turbo with 128k context";
        } else if (model.id.includes("gpt-4")) {
          maxTokens = model.id.includes("32k") ? 32768 : 8192;
          capabilities = ["code", "text"];
          description = model.id.includes("32k")
            ? "GPT-4 with extended 32k context"
            : "Most capable GPT-4 model";
        } else if (model.id.includes("gpt-3.5-turbo")) {
          maxTokens = model.id.includes("16k") ? 16384 : 4096;
          capabilities = ["code", "text"];
          description = "Fast and efficient GPT-3.5";
        } else if (model.id.includes("o1")) {
          maxTokens = 200000;
          capabilities = ["code", "text", "reasoning"];
          description = "Advanced reasoning model";
        }

        return {
          id: model.id,
          name: model.id.split("/").pop() || model.id,
          description,
          maxTokens,
          capabilities,
          created: model.created,
          owned_by: model.owned_by,
        };
      })
      .sort((a: AIModel, b: AIModel) => {
        // Sort by creation date (newest first)
        return (b.created || 0) - (a.created || 0);
      });

    return { success: true, models };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, models: [], error: errorMessage };
  }
}

/**
 * Fetches available models from Google Gemini API
 */
export async function fetchGeminiModels(
  apiKey: string
): Promise<ModelDiscoveryResult> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to fetch models (${response.status})`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch {
        errorMessage = errorText || response.statusText;
      }
      return { success: false, models: [], error: errorMessage };
    }

    const data = await response.json();

    // Filter and map Gemini models
    const models: AIModel[] = data.models
      .filter((model: any) => {
        // Filter for generative models that support generateContent
        return model.supportedGenerationMethods?.includes("generateContent");
      })
      .map((model: any) => {
        // Extract model info
        const modelId = model.name.split("/").pop() || model.name;
        let maxTokens = 32768;
        let capabilities = ["code", "text"];
        let description = model.description || "Google Gemini model";

        // Determine capabilities based on model name
        if (modelId.includes("gemini-2.0")) {
          maxTokens = 1000000;
          capabilities = ["code", "text", "vision", "audio", "video"];
          description = "Latest Gemini 2.0 with multimodal capabilities";
        } else if (modelId.includes("gemini-1.5-pro")) {
          maxTokens = 2000000;
          capabilities = ["code", "text", "vision", "audio"];
          description = "Gemini 1.5 Pro with 2M token context";
        } else if (modelId.includes("gemini-1.5-flash")) {
          maxTokens = 1000000;
          capabilities = ["code", "text", "vision", "audio"];
          description = "Fast Gemini 1.5 Flash with 1M context";
        } else if (modelId.includes("gemini-pro")) {
          capabilities = ["code", "text"];
          description = "Gemini Pro for general tasks";
        }

        return {
          id: modelId,
          name: modelId,
          description,
          maxTokens,
          capabilities,
        };
      })
      .sort((a: AIModel, b: AIModel) => {
        // Sort by name (newer versions first)
        return b.name.localeCompare(a.name);
      });

    return { success: true, models };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, models: [], error: errorMessage };
  }
}

/**
 * Fetches available models from Anthropic Claude API
 */
export async function fetchClaudeModels(
  apiKey: string
): Promise<ModelDiscoveryResult> {
  try {
    // Note: Anthropic doesn't have a public models endpoint
    // We'll validate the key by making a minimal request
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1,
        messages: [{ role: "user", content: "test" }],
      }),
    });

    // If the key is valid, return known Claude models
    if (response.ok || response.status === 400) {
      // 400 is ok - it means the key is valid but request might be malformed
      const models: AIModel[] = [
        {
          id: "claude-3-5-sonnet-20241022",
          name: "Claude 3.5 Sonnet (Latest)",
          description: "Most intelligent model with best performance",
          maxTokens: 200000,
          capabilities: ["code", "text", "vision", "reasoning"],
        },
        {
          id: "claude-3-5-haiku-20241022",
          name: "Claude 3.5 Haiku (Latest)",
          description: "Fastest and most compact model",
          maxTokens: 200000,
          capabilities: ["code", "text", "vision"],
        },
        {
          id: "claude-3-opus-20240229",
          name: "Claude 3 Opus",
          description: "Most powerful model for complex tasks",
          maxTokens: 200000,
          capabilities: ["code", "text", "vision"],
        },
        {
          id: "claude-3-sonnet-20240229",
          name: "Claude 3 Sonnet",
          description: "Balanced intelligence and speed",
          maxTokens: 200000,
          capabilities: ["code", "text", "vision"],
        },
        {
          id: "claude-3-haiku-20240307",
          name: "Claude 3 Haiku",
          description: "Fast and efficient for everyday tasks",
          maxTokens: 200000,
          capabilities: ["code", "text", "vision"],
        },
      ];

      return { success: true, models };
    }

    const errorText = await response.text();
    let errorMessage = `Failed to validate API key (${response.status})`;
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.error?.message) {
        errorMessage = errorData.error.message;
      }
    } catch {
      errorMessage = errorText || response.statusText;
    }
    return { success: false, models: [], error: errorMessage };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, models: [], error: errorMessage };
  }
}

/**
 * Fetches available models from Groq API
 */
export async function fetchGroqModels(
  apiKey: string
): Promise<ModelDiscoveryResult> {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to fetch models (${response.status})`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch {
        errorMessage = errorText || response.statusText;
      }
      return { success: false, models: [], error: errorMessage };
    }

    const data = await response.json();

    const models: AIModel[] = data.data
      .map((model: any) => {
        let maxTokens = 8192;
        let capabilities = ["code", "text"];
        let description = "Groq-powered fast inference model";

        if (model.id.includes("llama")) {
          capabilities = ["code", "text", "reasoning"];
          description = "Meta Llama with Groq speed";
          maxTokens = model.id.includes("70b") ? 8192 : 8192;
        } else if (model.id.includes("mixtral")) {
          capabilities = ["code", "text"];
          description = "Mixtral MoE with ultra-fast inference";
          maxTokens = 32768;
        } else if (model.id.includes("gemma")) {
          capabilities = ["code", "text"];
          description = "Google Gemma on Groq";
          maxTokens = 8192;
        }

        return {
          id: model.id,
          name: model.id,
          description,
          maxTokens,
          capabilities,
          created: model.created,
          owned_by: model.owned_by,
        };
      })
      .sort((a: AIModel, b: AIModel) => (b.created || 0) - (a.created || 0));

    return { success: true, models };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, models: [], error: errorMessage };
  }
}

/**
 * Main function to discover models for any provider
 */
export async function discoverModels(
  provider: string,
  apiKey: string
): Promise<ModelDiscoveryResult> {
  if (!apiKey) {
    return { success: false, models: [], error: "API key is required" };
  }

  switch (provider) {
    case "openai":
      return await fetchOpenAIModels(apiKey);
    case "gemini":
      return await fetchGeminiModels(apiKey);
    case "claude":
      return await fetchClaudeModels(apiKey);
    case "groq":
      return await fetchGroqModels(apiKey);
    case "mistral":
    case "llama":
    case "cohere":
    case "perplexity":
      // For providers without public model listing APIs, return a helpful message
      return {
        success: false,
        models: [],
        error: `${provider} does not provide a public models API. Please use the pre-configured models.`,
      };
    default:
      return {
        success: false,
        models: [],
        error: `Unsupported provider: ${provider}`,
      };
  }
}

/**
 * Validates an API key by attempting to fetch models
 */
export async function validateAPIKey(
  provider: string,
  apiKey: string
): Promise<{ valid: boolean; error?: string }> {
  const result = await discoverModels(provider, apiKey);
  return {
    valid: result.success,
    error: result.error,
  };
}
