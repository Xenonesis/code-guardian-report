"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Bot,
  Send,
  X,
  MessageCircle,
  RotateCcw,
  Download,
  Trash2,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnalysisResults } from "@/hooks/useAnalysis";
import { useChatBot } from "@/hooks/useChatBot";

interface FloatingChatBotProps {
  analysisResults: AnalysisResults;
}

/* ─── Markdown message renderer ─── */
const ChatMarkdown: React.FC<{ content: string }> = ({ content }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      p: ({ children }) => (
        <p className="mb-2 text-[13px] leading-relaxed last:mb-0">{children}</p>
      ),
      strong: ({ children }) => (
        <strong className="font-semibold">{children}</strong>
      ),
      ul: ({ children }) => (
        <ul className="mb-2 ml-3 list-disc space-y-0.5 text-[13px]">
          {children}
        </ul>
      ),
      ol: ({ children }) => (
        <ol className="mb-2 ml-3 list-decimal space-y-0.5 text-[13px]">
          {children}
        </ol>
      ),
      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
      code: ({ children, className }) => {
        const isBlock = className?.includes("language-");
        if (isBlock) {
          return (
            <pre className="my-2 overflow-x-auto rounded-lg bg-black/10 p-3 text-xs dark:bg-white/10">
              <code>{children}</code>
            </pre>
          );
        }
        return (
          <code className="rounded bg-black/10 px-1 py-0.5 text-xs dark:bg-white/10">
            {children}
          </code>
        );
      },
      h1: ({ children }) => (
        <h1 className="mb-1 text-sm font-bold">{children}</h1>
      ),
      h2: ({ children }) => (
        <h2 className="mb-1 text-sm font-bold">{children}</h2>
      ),
      h3: ({ children }) => (
        <h3 className="mb-1 text-[13px] font-bold">{children}</h3>
      ),
      a: ({ href, children }) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline dark:text-blue-400"
        >
          {children}
        </a>
      ),
      table: ({ children }) => (
        <div className="my-2 overflow-x-auto">
          <table className="w-full border-collapse text-xs">{children}</table>
        </div>
      ),
      th: ({ children }) => (
        <th className="border-b border-current/20 px-2 py-1 text-left font-semibold">
          {children}
        </th>
      ),
      td: ({ children }) => (
        <td className="border-b border-current/10 px-2 py-1">{children}</td>
      ),
    }}
  >
    {content}
  </ReactMarkdown>
);

/* ─── Copy button for messages ─── */
const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="text-muted-foreground hover:text-foreground rounded p-1 opacity-0 transition-all group-hover:opacity-100"
      aria-label="Copy message"
    >
      {copied ? (
        <Check className="h-3 w-3 text-emerald-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </button>
  );
};

/* ─── Typing indicator ─── */
const TypingIndicator: React.FC = () => (
  <div className="flex items-center gap-3 px-1">
    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
      <Bot className="h-3.5 w-3.5 text-white" />
    </div>
    <div className="bg-muted/80 flex items-center gap-1.5 rounded-2xl rounded-bl-md px-4 py-3">
      <motion.span
        className="bg-muted-foreground/60 h-1.5 w-1.5 rounded-full"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
      />
      <motion.span
        className="bg-muted-foreground/60 h-1.5 w-1.5 rounded-full"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.15 }}
      />
      <motion.span
        className="bg-muted-foreground/60 h-1.5 w-1.5 rounded-full"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
      />
    </div>
  </div>
);

/* ─── Main component ─── */
const FloatingChatBot: React.FC<FloatingChatBotProps> = ({
  analysisResults,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const {
    messages,
    isLoading,
    isAIConfigured,
    suggestedQuestions,
    initializeChat,
    sendMessage,
    clearChat,
    regenerateLastResponse,
    exportChat,
  } = useChatBot(analysisResults);

  // Auto-init chat when opened
  useEffect(() => {
    if (isOpen) initializeChat();
  }, [isOpen, initializeChat]);

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
    // Reset textarea height
    if (inputRef.current) inputRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedClick = (q: string) => {
    sendMessage(q);
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  if (!analysisResults) return null;

  const hasMessages = messages.length > 1; // more than just welcome

  return (
    <>
      {/* ─── Floating trigger button ─── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed right-5 bottom-20 z-[60] sm:right-6 sm:bottom-20"
          >
            <button
              onClick={() => setIsOpen(true)}
              className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/30"
              aria-label="Open AI chat assistant"
            >
              <MessageCircle className="h-6 w-6 text-white transition-transform group-hover:scale-110" />
              {/* Notification pulse */}
              {analysisResults.summary.criticalIssues > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {analysisResults.summary.criticalIssues}
                  </span>
                </span>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Chat panel ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="border-border/60 bg-background/95 fixed right-3 bottom-3 z-50 flex h-[75vh] max-h-[600px] w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl sm:right-6 sm:bottom-6 sm:w-[400px]"
          >
            {/* ─── Header ─── */}
            <div className="border-border/40 flex flex-shrink-0 items-center justify-between border-b bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Code Guardian AI
                  </h3>
                  <p className="text-[10px] font-medium text-white/70">
                    {isAIConfigured === false
                      ? "Not configured"
                      : isLoading
                        ? "Thinking..."
                        : "Ready to help"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {hasMessages && (
                  <>
                    <button
                      onClick={exportChat}
                      className="rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
                      aria-label="Export chat"
                      title="Export chat"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={clearChat}
                      className="rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
                      aria-label="Clear chat"
                      title="Clear chat"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* ─── AI not configured banner ─── */}
            {isAIConfigured === false && (
              <div className="flex-shrink-0 border-b border-amber-200/50 bg-amber-50/90 px-4 py-2.5 dark:border-amber-800/30 dark:bg-amber-950/30">
                <p className="text-[11px] font-medium text-amber-800 dark:text-amber-200">
                  AI providers not configured. Add an API key in the AI
                  Configuration tab to enable the assistant.
                </p>
              </div>
            )}

            {/* ─── Messages ─── */}
            <ScrollArea className="flex-1 overflow-y-auto" ref={scrollRef}>
              <div className="space-y-4 px-4 py-4">
                {messages.map((message, idx) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.2,
                      delay: idx === messages.length - 1 ? 0.05 : 0,
                    }}
                    className={`flex gap-2.5 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Avatar */}
                    {message.role === "assistant" && (
                      <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                        <Bot className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className={`group relative max-w-[82%] rounded-2xl px-3.5 py-2.5 ${
                        message.role === "user"
                          ? "rounded-br-md bg-gradient-to-br from-violet-500 to-purple-600 text-white"
                          : `rounded-bl-md ${(message as { isError?: boolean }).isError ? "border border-red-200/60 bg-red-50/80 text-red-800 dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-200" : "bg-muted/80 text-foreground"}`
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <ChatMarkdown content={message.content} />
                      ) : (
                        <p className="text-[13px] leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      )}
                      {/* Timestamp + actions on hover */}
                      <div
                        className={`mt-1 flex items-center justify-between gap-2 ${message.role === "user" ? "text-white/60" : "text-muted-foreground"}`}
                      >
                        <span className="text-[10px]">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {message.role === "assistant" && (
                          <CopyButton text={message.content} />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TypingIndicator />
                  </motion.div>
                )}

                {/* Suggested questions — after welcome message only */}
                {messages.length === 1 &&
                  !isLoading &&
                  isAIConfigured !== false && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="space-y-1.5 pl-9"
                    >
                      <p className="text-muted-foreground mb-2 text-[10px] font-semibold tracking-wider uppercase">
                        Suggested questions
                      </p>
                      {suggestedQuestions.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestedClick(q)}
                          className="border-border/50 bg-card/60 text-foreground block w-full rounded-xl border px-3 py-2 text-left text-xs font-medium transition-all hover:border-violet-300 hover:bg-violet-50/50 dark:hover:border-violet-700 dark:hover:bg-violet-950/30"
                        >
                          {q}
                        </button>
                      ))}
                    </motion.div>
                  )}
              </div>
            </ScrollArea>

            {/* ─── Regenerate button ─── */}
            {hasMessages &&
              !isLoading &&
              messages[messages.length - 1]?.role === "assistant" && (
                <div className="border-border/30 bg-muted/30 flex justify-center border-t py-1.5">
                  <button
                    onClick={regenerateLastResponse}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/60 flex items-center gap-1.5 rounded-lg px-3 py-1 text-[11px] font-medium transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Regenerate response
                  </button>
                </div>
              )}

            {/* ─── Input ─── */}
            <div className="border-border/40 bg-background/80 flex-shrink-0 border-t px-3 py-3 backdrop-blur-sm">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isAIConfigured === false
                      ? "Configure AI to start chatting…"
                      : "Ask about your analysis…"
                  }
                  disabled={isLoading || isAIConfigured === false}
                  rows={1}
                  className="placeholder:text-muted-foreground/60 border-border/50 bg-muted/40 text-foreground flex-1 resize-none rounded-xl border px-3.5 py-2.5 text-[13px] leading-relaxed transition-colors outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 disabled:opacity-50"
                  aria-label="Chat message input"
                />
                <Button
                  onClick={handleSend}
                  disabled={
                    !input.trim() || isLoading || isAIConfigured === false
                  }
                  size="sm"
                  className="h-10 w-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 p-0 text-white shadow-md shadow-purple-500/20 transition-all hover:shadow-lg disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-muted-foreground/50 mt-1.5 text-center text-[9px]">
                AI can make mistakes · Shift+Enter for new line
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChatBot;
