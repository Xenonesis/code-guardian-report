import { useState, useCallback, useMemo, useEffect } from "react";
import { AIService } from "../services/ai/aiService";
import { toast } from "sonner";
import { AnalysisResults } from "./useAnalysis";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isError?: boolean;
}

/** Context-aware suggested questions based on actual analysis results */
function buildSuggestedQuestions(results: AnalysisResults): string[] {
  const questions: string[] = [];

  if (results.summary.criticalIssues > 0) {
    questions.push(
      `Explain the ${results.summary.criticalIssues} critical issue${results.summary.criticalIssues > 1 ? "s" : ""} and how to fix them`
    );
  }

  const secrets = results.issues.filter(
    (i) => i?.category === "Secret Detection" || i?.type === "Secret"
  );
  if (secrets.length > 0) {
    questions.push("How should I handle the exposed secrets?");
  }

  if (results.dependencyAnalysis?.summary?.vulnerablePackages) {
    questions.push("Which dependencies should I update first?");
  }

  if (results.summary.qualityScore < 60) {
    questions.push("How can I improve my code quality score?");
  }

  if (results.issues.length > 0) {
    questions.push("What should I prioritize fixing first?");
  }

  questions.push("Give me an executive summary of this analysis");

  // Return at most 4 questions
  return questions.slice(0, 4);
}

export const useChatBot = (analysisResults: AnalysisResults) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAIConfigured, setIsAIConfigured] = useState<boolean | null>(null);
  const aiService = useMemo(() => new AIService(), []);

  const suggestedQuestions = useMemo(
    () => buildSuggestedQuestions(analysisResults),
    [analysisResults]
  );

  useEffect(() => {
    aiService
      .hasConfiguredProviders()
      .then((configured) => setIsAIConfigured(configured))
      .catch(() => setIsAIConfigured(false));
  }, [aiService]);

  const initializeChat = useCallback(() => {
    if (messages.length === 0) {
      const score = analysisResults?.summary?.securityScore ?? 0;
      const grade =
        score >= 80
          ? "strong"
          : score >= 60
            ? "moderate"
            : score >= 40
              ? "concerning"
              : "critical";

      const welcomeMessage: ChatMessage = {
        id: "1",
        role: "assistant",
        content: `👋 Hi! I'm your **Code Guardian AI assistant**.

I've analyzed **${analysisResults?.totalFiles || 0} files** and found **${analysisResults?.issues?.length || 0} issues** — your security posture is **${grade}** (score: ${score}/100).

Ask me anything about the results, or try one of the suggested questions below.`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [analysisResults, messages.length]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  const regenerateLastResponse = useCallback(async () => {
    // Find the last user message to re-send
    const lastUserIdx = [...messages]
      .reverse()
      .findIndex((m) => m.role === "user");
    if (lastUserIdx === -1) return;

    const realIdx = messages.length - 1 - lastUserIdx;
    const lastUserMsg = messages[realIdx];

    // Remove all messages after (and including) the last assistant response
    setMessages((prev) => prev.slice(0, realIdx + 1));
    setIsLoading(true);

    try {
      const response = await aiService.answerQuestion(
        lastUserMsg.content,
        analysisResults
      );
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : "Failed to regenerate";
      toast.error(errMsg);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: errMsg,
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, aiService, analysisResults]);

  const exportChat = useCallback(() => {
    if (messages.length === 0) return;
    const text = messages
      .map(
        (m) =>
          `[${m.timestamp.toLocaleString()}] ${m.role === "user" ? "You" : "AI"}:\n${m.content}`
      )
      .join("\n\n---\n\n");
    const blob = new Blob([`# Code Guardian Chat Export\n\n${text}`], {
      type: "text/markdown",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-export-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Chat exported");
  }, [messages]);

  const sendMessage = useCallback(
    async (input: string) => {
      if (!input.trim() || isLoading) return;

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: input,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        if (isAIConfigured === false) {
          throw new Error("No AI API keys configured");
        }

        if (!analysisResults || !analysisResults.issues) {
          throw new Error(
            "No analysis results available. Please run an analysis first."
          );
        }

        const response = await aiService.answerQuestion(input, analysisResults);

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        let errorMessage =
          "Sorry, I encountered an error while processing your question.";

        if (error instanceof Error) {
          if (error.message.includes("No AI API keys configured")) {
            errorMessage =
              "Please configure your AI API keys in the AI Configuration tab to use this feature.";
          } else if (error.message.includes("All AI providers failed")) {
            errorMessage =
              "Unable to connect to AI services. Please check your API keys are valid and have sufficient credits.";
          } else if (error.message.includes("No analysis results")) {
            errorMessage =
              "No analysis results found. Please upload and analyze a code file first.";
          } else {
            errorMessage = `AI Service Error: ${error.message}`;
          }
        }

        toast.error(errorMessage);

        const errorResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: errorMessage,
          timestamp: new Date(),
          isError: true,
        };

        setMessages((prev) => [...prev, errorResponse]);
      } finally {
        setIsLoading(false);
      }
    },
    [analysisResults, isLoading, aiService, isAIConfigured]
  );

  return {
    messages,
    isLoading,
    isAIConfigured,
    suggestedQuestions,
    initializeChat,
    sendMessage,
    clearChat,
    regenerateLastResponse,
    exportChat,
  };
};
