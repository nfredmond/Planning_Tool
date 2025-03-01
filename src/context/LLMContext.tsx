import React, { createContext, useContext, useState, ReactNode } from 'react';
import llmService, { LLMConfig } from '../api/llmAPI';

// LLM Provider types
export type LLMProvider = 'openai' | 'anthropic' | 'gemini' | 'deepseek' | 'grok' | 'meta';

// LLM Models by provider
export const LLM_MODELS = {
  openai: ['gpt-4', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229'],
  gemini: ['gemini-1.5-pro', 'gemini-1.5-flash'],
  deepseek: ['deepseek-chat'],
  grok: ['grok-1'],
  meta: ['llama-2-70b']
};

// LLM Context type
interface LLMContextType {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  setProvider: (provider: LLMProvider) => void;
  setApiKey: (apiKey: string) => void;
  setModel: (model: string) => void;
  generateCompletion: (prompt: string) => Promise<string>;
  generateCompletionWithSystem: (systemMessage: string, userPrompt: string) => Promise<string>;
  analyzeSentiment: (text: string) => Promise<{ sentiment: string; score: number; explanation: string }>;
  generateSummary: (text: string, maxWords?: number) => Promise<string>;
  getAvailableModels: () => string[];
}

// Default API keys
const DEFAULT_API_KEYS = {
  openai: process.env.REACT_APP_OPENAI_API_KEY || '',
  anthropic: process.env.REACT_APP_ANTHROPIC_API_KEY || '',
  gemini: process.env.REACT_APP_GEMINI_API_KEY || '',
  deepseek: process.env.REACT_APP_DEEPSEEK_API_KEY || '',
  grok: process.env.REACT_APP_GROK_API_KEY || '',
  meta: process.env.REACT_APP_META_API_KEY || ''
};

// Create context with default values
const LLMContext = createContext<LLMContextType>({
  provider: 'openai',
  apiKey: '',
  model: 'gpt-4',
  setProvider: () => {},
  setApiKey: () => {},
  setModel: () => {},
  generateCompletion: async () => '',
  generateCompletionWithSystem: async () => '',
  analyzeSentiment: async () => ({ sentiment: '', score: 0, explanation: '' }),
  generateSummary: async () => '',
  getAvailableModels: () => [],
});

// Hook to use LLM context
export const useLLM = () => useContext(LLMContext);

// LLM Provider props
interface LLMProviderProps {
  children: ReactNode;
  initialProvider?: LLMProvider;
  initialApiKey?: string;
  initialModel?: string;
}

// LLM Provider component
export const LLMProvider: React.FC<LLMProviderProps> = ({
  children,
  initialProvider = 'openai',
  initialApiKey,
  initialModel,
}) => {
  const [provider, setProviderState] = useState<LLMProvider>(initialProvider);
  const [apiKey, setApiKey] = useState<string>(
    initialApiKey || (
      provider === 'anthropic' ? DEFAULT_API_KEYS.anthropic : 
      provider === 'gemini' ? DEFAULT_API_KEYS.gemini : 
      DEFAULT_API_KEYS.openai
    )
  );
  const [model, setModel] = useState<string>(
    initialModel || (
      provider === 'anthropic' ? LLM_MODELS.anthropic[0] : 
      provider === 'gemini' ? LLM_MODELS.gemini[0] : 
      LLM_MODELS.openai[0]
    )
  );

  // Update LLM service when settings change
  React.useEffect(() => {
    llmService.setProvider(provider as any);
    llmService.setApiKey(apiKey);
    llmService.setModel(model);
  }, [provider, apiKey, model]);

  // Set provider with side effects
  const setProvider = (newProvider: LLMProvider) => {
    setProviderState(newProvider);
    
    // Update API key and model to default for this provider
    const defaultApiKey = DEFAULT_API_KEYS[newProvider];
    const defaultModel = LLM_MODELS[newProvider][0];
    
    setApiKey(defaultApiKey);
    setModel(defaultModel);
  };

  // Get available models for current provider
  const getAvailableModels = () => {
    return LLM_MODELS[provider];
  };

  // Context value
  const contextValue: LLMContextType = {
    provider,
    apiKey,
    model,
    setProvider,
    setApiKey,
    setModel,
    generateCompletion: (prompt: string) => llmService.generateCompletion(prompt),
    generateCompletionWithSystem: (systemMessage: string, userPrompt: string) => 
      llmService.generateCompletionWithSystem(systemMessage, userPrompt),
    analyzeSentiment: (text: string) => llmService.analyzeSentiment(text),
    generateSummary: (text: string, maxWords = 150) => llmService.generateSummary(text, maxWords),
    getAvailableModels,
  };

  return (
    <LLMContext.Provider value={contextValue}>
      {children}
    </LLMContext.Provider>
  );
};

export default LLMProvider; 