// src/components/ai/StreamingChatDemo.tsx
// Demo component for streaming AI responses

"use client";

import React, { useState, useRef, useEffect } from "react";
import { useStreamingCopilot } from "@/hooks/useStreamingCopilot";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, StopCircle, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function StreamingChatDemo() {
  const {
    streamingState,
    streamCompletion,
    cancelStream,
    resetStream,
    isAuthenticated,
    selectedModel,
  } = useStreamingCopilot();

  const [prompt, setPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when content updates
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [streamingState.content]);

  const handleSend = async () => {
    if (!prompt.trim() || !isAuthenticated) {
      toast.error("Please sign in and enter a message");
      return;
    }

    const userMessage = prompt.trim();
    setPrompt("");

    // Add user message to history
    const newHistory = [
      ...chatHistory,
      { role: "user" as const, content: userMessage },
    ];
    setChatHistory(newHistory);

    try {
      // Stream the response
      const response = await streamCompletion([
        {
          role: "system",
          content:
            "You are a helpful AI assistant for code analysis. Provide clear, concise, and accurate responses.",
        },
        ...newHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      ]);

      // Add assistant response to history
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);

      resetStream();
    } catch (error) {
      toast.error("Failed to get response");
      console.error("Streaming error:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setChatHistory([]);
    resetStream();
    setPrompt("");
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="py-8 text-center">
            <Sparkles className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-muted-foreground">
              Please sign in with GitHub to use streaming AI chat
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-[600px] flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle>Streaming AI Chat</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {selectedModel && (
              <Badge variant="secondary" className="text-xs">
                {selectedModel.name}
              </Badge>
            )}
            {streamingState.isStreaming && (
              <Badge className="animate-pulse bg-green-500">
                <span className="flex items-center">
                  <span className="mr-1.5 h-2 w-2 rounded-full bg-white"></span>
                  Streaming
                </span>
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col overflow-hidden">
        {/* Chat messages */}
        <div
          ref={contentRef}
          className="mb-4 flex-1 space-y-4 overflow-y-auto rounded-lg bg-gray-50 p-4 dark:bg-gray-900"
        >
          {chatHistory.length === 0 && !streamingState.content && (
            <div className="text-muted-foreground py-8 text-center">
              <p>Start a conversation with your AI assistant</p>
              <p className="mt-2 text-xs">
                Responses will stream in real-time as they're generated
              </p>
            </div>
          )}

          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {/* Streaming content */}
          {streamingState.content && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-sm whitespace-pre-wrap">
                  {streamingState.content}
                  {streamingState.isStreaming && (
                    <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-blue-600"></span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Error display */}
          {streamingState.error && (
            <div className="flex justify-center">
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                <p className="text-sm text-red-700 dark:text-red-300">
                  {streamingState.error}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="space-y-2">
          <div className="flex space-x-2">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Shift+Enter for new line)"
              className="flex-1 resize-none"
              rows={3}
              disabled={streamingState.isStreaming}
            />
            <div className="flex flex-col space-y-2">
              {streamingState.isStreaming ? (
                <Button
                  onClick={cancelStream}
                  variant="destructive"
                  size="icon"
                  className="h-full"
                >
                  <StopCircle className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  onClick={handleSend}
                  disabled={!prompt.trim()}
                  size="icon"
                  className="h-full"
                >
                  <Send className="h-5 w-5" />
                </Button>
              )}
              <Button
                onClick={handleClear}
                variant="outline"
                size="icon"
                disabled={streamingState.isStreaming}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <span>
              {streamingState.chunks.length > 0 && (
                <>{streamingState.chunks.length} chunks received</>
              )}
            </span>
            <span>Press Enter to send • Shift+Enter for new line</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
