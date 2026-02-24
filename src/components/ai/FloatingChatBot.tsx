import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Bot, Send, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AIService } from "../../services/ai/aiService";
import { toast } from "sonner";
import { AnalysisResults } from "@/hooks/useAnalysis";

import { logger } from "@/utils/logger";
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface FloatingChatBotProps {
  analysisResults: AnalysisResults;
}

const FloatingChatBot: React.FC<FloatingChatBotProps> = ({
  analysisResults,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAIConfigured, setIsAIConfigured] = useState<boolean | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const aiService = useMemo(() => new AIService(), []);

  useEffect(() => {
    let mounted = true;
    aiService
      .hasConfiguredProviders()
      .then((configured) => {
        if (mounted) {
          setIsAIConfigured(configured);
        }
      })
      .catch(() => {
        if (mounted) {
          setIsAIConfigured(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [aiService]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: "1",
        role: "assistant",
        content: `Hello! I'm your AI assistant for code analysis. I can help you understand the analysis results of your codebase. 

I found ${analysisResults?.issues?.length || 0} issues across ${analysisResults?.totalFiles || 0} files. Feel free to ask me questions like:
- "What are the most critical security issues?"
- "Show me all high severity bugs"
- "How can I improve my code quality?"
- "What should I fix first?"

How can I help you today?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, analysisResults, messages.length]);

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      logger.debug("Sending question to AI service:", currentInput);
      logger.debug("Analysis results available:", !!analysisResults?.issues);

      if (!analysisResults || !analysisResults.issues) {
        throw new Error(
          "No analysis results available. Please run an analysis first."
        );
      }

      if (isAIConfigured === false) {
        throw new Error("No AI API keys configured");
      }

      const response = await aiService.answerQuestion(
        currentInput,
        analysisResults
      );

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      logger.error("Error getting AI response:", error);

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

      logger.error("Detailed error for user:", errorMessage);
      toast.error(errorMessage);

      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: errorMessage,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!analysisResults) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="focus-ring animate-float bg-primary hover:bg-primary/90 fixed right-4 bottom-4 z-50 h-12 w-12 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl sm:right-6 sm:bottom-6 sm:h-14 sm:w-14"
          size="sm"
          aria-label="Open AI chat assistant"
        >
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="animate-slide-up fixed right-4 bottom-4 z-50 h-[70vh] max-h-[500px] w-[calc(100vw-2rem)] max-w-sm border-0 bg-white/95 shadow-2xl backdrop-blur-sm sm:right-6 sm:bottom-6 sm:w-96/95">
          <CardHeader className="bg-primary rounded-t-lg pb-3 text-white">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">AI Analysis Assistant</span>
                <span className="sm:hidden">AI Assistant</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="focus-ring h-8 w-8 p-0 text-white hover:bg-white/20"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex h-[calc(70vh-80px)] max-h-[420px] flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-3 sm:p-4" ref={scrollAreaRef}>
              <div className="space-y-3 sm:space-y-4">
                {isAIConfigured === false && (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 sm:text-sm">
                    AI providers are not configured. Open the AI Configuration
                    tab and add at least one provider key (OpenAI, Gemini,
                    Claude, or Copilot).
                  </div>
                )}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-2 sm:max-w-[80%] sm:p-3 ${
                        message.role === "user"
                          ? "bg-primary text-white"
                          : "bg-muted text-foreground dark:text-white"
                      }`}
                    >
                      <p className="text-xs leading-relaxed whitespace-pre-wrap sm:text-sm">
                        {message.content}
                      </p>
                      <span className="mt-1 block text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="animate-fade-in flex justify-start">
                    <div className="bg-muted flex items-center gap-2 rounded-lg p-2 sm:p-3">
                      <Skeleton className="h-3 w-3 rounded-full sm:h-4 sm:w-4" />
                      <div className="flex flex-col gap-1">
                        <Skeleton className="h-3 w-20 sm:w-24" />
                        <span className="text-muted-foreground text-xs sm:text-sm">
                          AI is thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-border border-t p-3 sm:p-4">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your code analysis..."
                  disabled={isLoading || isAIConfigured === false}
                  className="focus-ring flex-1 text-sm"
                  aria-label="Chat message input"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={
                    !input.trim() || isLoading || isAIConfigured === false
                  }
                  size="sm"
                  className="focus-ring bg-primary hover:bg-primary/90 flex-shrink-0"
                  aria-label="Send message"
                >
                  <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default FloatingChatBot;
