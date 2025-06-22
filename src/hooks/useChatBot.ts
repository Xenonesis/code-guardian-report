import { useState, useCallback, useMemo } from 'react';
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

export const useChatBot = (analysisResults: AnalysisResults) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const aiService = useMemo(() => new AIService(), []);

  const initializeChat = useCallback(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: '1',
        role: 'assistant',
        content: `Hello! I'm your AI assistant for code analysis. I can help you understand the analysis results of your codebase. \n\nI found ${analysisResults?.issues?.length || 0} issues across ${analysisResults?.totalFiles || 0} files. Feel free to ask me questions like:\n- "What are the most critical security issues?"\n- "Show me all high severity bugs"\n- "How can I improve my code quality?"\n- "What should I fix first?"\n\nHow can I help you today?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [analysisResults, messages.length]);

  const sendMessage = useCallback(async (input: string) => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      if (!analysisResults || !analysisResults.issues) {
        throw new Error('No analysis results available. Please run an analysis first.');
      }

      const response = await aiService.answerQuestion(input, analysisResults);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
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
  }, [analysisResults, isLoading, aiService]);

  return {
    messages,
    isLoading,
    initializeChat,
    sendMessage
  };
};