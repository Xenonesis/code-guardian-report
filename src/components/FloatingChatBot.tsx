
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, X, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AIService } from '@/services/aiService';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AnalysisResults {
  issues: Array<{
    severity: string;
    type: string;
    message: string;
    filename: string;
    line: number;
  }>;
  totalFiles: number;
  summary?: {
    securityScore?: number;
    qualityScore?: number;
  };
}

interface FloatingChatBotProps {
  analysisResults: AnalysisResults;
}

const FloatingChatBot: React.FC<FloatingChatBotProps> = ({ analysisResults }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const aiService = new AIService();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: '1',
        role: 'assistant',
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
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      console.log('Sending question to AI service:', currentInput);
      console.log('Analysis results available:', !!analysisResults?.issues);
      
      if (!analysisResults || !analysisResults.issues) {
        throw new Error('No analysis results available. Please run an analysis first.');
      }

      const response = await aiService.answerQuestion(currentInput, analysisResults);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      let errorMessage = 'Sorry, I encountered an error while processing your question.';
      
      if (error instanceof Error) {
        if (error.message.includes('No AI API keys configured')) {
          errorMessage = 'Please configure your AI API keys in the AI Configuration tab to use this feature.';
        } else if (error.message.includes('All AI providers failed')) {
          errorMessage = 'Unable to connect to AI services. Please check your API keys are valid and have sufficient credits.';
        } else if (error.message.includes('No analysis results')) {
          errorMessage = 'No analysis results found. Please upload and analyze a code file first.';
        } else {
          errorMessage = `AI Service Error: ${error.message}`;
        }
      }
      
      console.error('Detailed error for user:', errorMessage);
      toast.error(errorMessage);
      
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 z-50 focus-ring animate-float"
          size="sm"
          aria-label="Open AI chat assistant"
        >
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] max-w-sm sm:w-96 h-[70vh] max-h-[500px] shadow-2xl z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-0 animate-slide-up">
          <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
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
                className="text-white hover:bg-white/20 h-8 w-8 p-0 focus-ring"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex flex-col h-[calc(70vh-80px)] max-h-[420px]">
            {/* Messages */}
            <ScrollArea className="flex-1 p-3 sm:p-4" ref={scrollAreaRef}>
              <div className="space-y-3 sm:space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-2 sm:p-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                      }`}
                    >
                      <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-2 sm:p-3 flex items-center gap-2">
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">AI is thinking...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your code analysis..."
                  disabled={isLoading}
                  className="flex-1 text-sm focus-ring"
                  aria-label="Chat message input"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 focus-ring flex-shrink-0"
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
