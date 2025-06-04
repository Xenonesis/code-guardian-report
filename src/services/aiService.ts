
interface AIProvider {
  id: string;
  name: string;
  apiKey: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class AIService {
  private getStoredAPIKeys(): AIProvider[] {
    try {
      const keys = localStorage.getItem('aiApiKeys');
      return keys ? JSON.parse(keys) : [];
    } catch (error) {
      console.error('Error parsing stored API keys:', error);
      return [];
    }
  }

  private async callOpenAI(apiKey: string, messages: ChatMessage[]): Promise<string> {
    console.log('Calling OpenAI API...');
    
    if (!apiKey || !apiKey.startsWith('sk-')) {
      throw new Error('Invalid OpenAI API key format. Key should start with "sk-"');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      console.log('OpenAI Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API Error Response:', errorText);
        
        let errorMessage = `OpenAI API error (${response.status})`;
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch (e) {
          errorMessage = errorText || response.statusText;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('OpenAI API Response:', data);
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from OpenAI - no content found');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      throw error;
    }
  }

  private async callGemini(apiKey: string, messages: ChatMessage[]): Promise<string> {
    console.log('Calling Gemini API...');
    
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }

    try {
      // Convert messages to Gemini format
      const systemMessage = messages.find(m => m.role === 'system');
      const userMessages = messages.filter(m => m.role !== 'system');
      
      let prompt = '';
      if (systemMessage) {
        prompt += `System: ${systemMessage.content}\n\n`;
      }
      prompt += userMessages.map(m => `${m.role}: ${m.content}`).join('\n');

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        }),
      });

      console.log('Gemini Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API Error Response:', errorText);
        
        let errorMessage = `Gemini API error (${response.status})`;
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch (e) {
          errorMessage = errorText || response.statusText;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Gemini API Response:', data);
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from Gemini - no content found');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API call failed:', error);
      throw error;
    }
  }

  private async callClaude(apiKey: string, messages: ChatMessage[]): Promise<string> {
    console.log('Calling Claude API...');
    
    if (!apiKey) {
      throw new Error('Claude API key is required');
    }

    try {
      const systemMessage = messages.find(m => m.role === 'system');
      const userMessages = messages.filter(m => m.role !== 'system');

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          messages: userMessages,
          system: systemMessage?.content,
        }),
      });

      console.log('Claude Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Claude API Error Response:', errorText);
        
        let errorMessage = `Claude API error (${response.status})`;
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch (e) {
          errorMessage = errorText || response.statusText;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Claude API Response:', data);
      
      if (!data.content?.[0]?.text) {
        throw new Error('Invalid response format from Claude - no content found');
      }

      return data.content[0].text;
    } catch (error) {
      console.error('Claude API call failed:', error);
      throw error;
    }
  }

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    const apiKeys = this.getStoredAPIKeys();
    console.log('Available API keys:', apiKeys.map(k => ({ id: k.id, name: k.name })));
    
    if (apiKeys.length === 0) {
      throw new Error('No AI API keys configured. Please add an API key in the AI Configuration tab.');
    }

    const errors: string[] = [];

    // Try each API key until one works
    for (const provider of apiKeys) {
      try {
        console.log(`Trying provider: ${provider.name} (${provider.id})`);
        
        switch (provider.id) {
          case 'openai':
            return await this.callOpenAI(provider.apiKey, messages);
          case 'gemini':
            return await this.callGemini(provider.apiKey, messages);
          case 'claude':
            return await this.callClaude(provider.apiKey, messages);
          default:
            console.warn(`Unsupported provider: ${provider.id}`);
            errors.push(`Unsupported provider: ${provider.id}`);
            continue;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error with ${provider.name}:`, errorMessage);
        errors.push(`${provider.name}: ${errorMessage}`);
        continue;
      }
    }

    const detailedError = errors.length > 0 ? errors.join('; ') : 'No errors captured';
    throw new Error(`All AI providers failed. Errors: ${detailedError}`);
  }

  async generateSummary(issues: any[]): Promise<string> {
    console.log('Generating summary for', issues.length, 'issues');
    
    if (!issues || issues.length === 0) {
      throw new Error('No issues provided for summary generation');
    }

    const systemPrompt = {
      role: 'system' as const,
      content: `You are a code security and quality expert. Analyze the provided code analysis results and generate a comprehensive summary including:
      1. Overall security posture
      2. Most critical issues to address
      3. Code quality assessment
      4. Recommendations for improvement
      5. Priority action items
      
      Keep the summary professional and actionable.`
    };

    const userPrompt = {
      role: 'user' as const,
      content: `Please analyze these code analysis results and provide a comprehensive summary:
      
      Total Issues: ${issues.length}
      High Severity: ${issues.filter(i => i.severity === 'High').length}
      Medium Severity: ${issues.filter(i => i.severity === 'Medium').length}
      Low Severity: ${issues.filter(i => i.severity === 'Low').length}
      
      Security Issues: ${issues.filter(i => i.type?.toLowerCase() === 'security').length}
      Bug Issues: ${issues.filter(i => i.type?.toLowerCase() === 'bug').length}
      Code Quality Issues: ${issues.filter(i => i.type?.toLowerCase() === 'code smell').length}
      
      Sample Issues:
      ${issues.slice(0, 10).map(issue => `- ${issue.severity} ${issue.type}: ${issue.message} (${issue.filename}:${issue.line})`).join('\n')}
      
      ${issues.length > 10 ? `... and ${issues.length - 10} more issues` : ''}`
    };

    try {
      return await this.generateResponse([systemPrompt, userPrompt]);
    } catch (error) {
      console.error('Summary generation failed:', error);
      throw new Error(`Failed to generate AI summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async answerQuestion(question: string, analysisResults: any): Promise<string> {
    console.log('Answering question:', question);
    
    if (!analysisResults || !analysisResults.issues) {
      throw new Error('No analysis results provided for question answering');
    }

    const systemPrompt = {
      role: 'system' as const,
      content: `You are a helpful code analysis assistant. You have access to the results of a code analysis that found ${analysisResults.issues.length} issues across ${analysisResults.totalFiles} files. Answer user questions about the analysis results in a helpful and detailed way. Be specific and reference the actual findings when possible.`
    };

    const contextPrompt = {
      role: 'user' as const,
      content: `Analysis Context:
      Total Files Analyzed: ${analysisResults.totalFiles}
      Analysis Time: ${analysisResults.analysisTime}
      Total Issues Found: ${analysisResults.issues.length}
      
      Issue Breakdown:
      - High Severity: ${analysisResults.issues.filter((i: any) => i.severity === 'High').length}
      - Medium Severity: ${analysisResults.issues.filter((i: any) => i.severity === 'Medium').length}
      - Low Severity: ${analysisResults.issues.filter((i: any) => i.severity === 'Low').length}
      
      Issue Types:
      - Security: ${analysisResults.issues.filter((i: any) => i.type?.toLowerCase() === 'security').length}
      - Bugs: ${analysisResults.issues.filter((i: any) => i.type?.toLowerCase() === 'bug').length}
      - Code Quality: ${analysisResults.issues.filter((i: any) => i.type?.toLowerCase() === 'code smell').length}
      
      Sample Issues:
      ${analysisResults.issues.slice(0, 5).map((issue: any) => `- ${issue.severity} ${issue.type}: ${issue.message} in ${issue.filename}:${issue.line}`).join('\n')}
      
      User Question: ${question}`
    };

    try {
      return await this.generateResponse([systemPrompt, contextPrompt]);
    } catch (error) {
      console.error('Question answering failed:', error);
      throw new Error(`Failed to answer question: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
