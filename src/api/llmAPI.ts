import axios from 'axios';

/**
 * LLM API Configuration
 */
export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'gemini' | 'deepseek' | 'grok' | 'meta';
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Default OpenAI configuration
 */
const defaultOpenAIConfig: LLMConfig = {
  provider: 'openai',
  apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 1000
};

/**
 * Default Anthropic configuration
 */
const defaultAnthropicConfig: LLMConfig = {
  provider: 'anthropic',
  apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY || '',
  model: 'claude-3-opus-20240229',
  temperature: 0.7,
  maxTokens: 1000
};

/**
 * Default Gemini configuration
 */
const defaultGeminiConfig: LLMConfig = {
  provider: 'gemini',
  apiKey: process.env.REACT_APP_GEMINI_API_KEY || '',
  model: 'gemini-1.5-pro',
  temperature: 0.7,
  maxTokens: 1000
};

/**
 * Default Deepseek configuration
 */
const defaultDeepseekConfig: LLMConfig = {
  provider: 'deepseek',
  apiKey: process.env.REACT_APP_DEEPSEEK_API_KEY || '',
  model: 'deepseek-r1',
  temperature: 0.7,
  maxTokens: 1000
};

/**
 * Default Grok configuration
 */
const defaultGrokConfig: LLMConfig = {
  provider: 'grok',
  apiKey: process.env.REACT_APP_GROK_API_KEY || '',
  model: 'grok3',
  temperature: 0.7,
  maxTokens: 1000
};

/**
 * Default Meta configuration
 */
const defaultMetaConfig: LLMConfig = {
  provider: 'meta',
  apiKey: process.env.REACT_APP_META_API_KEY || '',
  model: 'llama-2',
  temperature: 0.7,
  maxTokens: 1000
};

/**
 * LLM API Service
 * Provides methods to interact with OpenAI, Anthropic, Google Gemini, Deepseek, Grok, and Meta APIs
 */
class LLMService {
  private config: LLMConfig;

  constructor(config: Partial<LLMConfig> = {}) {
    // Default to OpenAI unless provider is specified
    let baseConfig;
    if (config.provider === 'anthropic') {
      baseConfig = defaultAnthropicConfig;
    } else if (config.provider === 'gemini') {
      baseConfig = defaultGeminiConfig;
    } else if (config.provider === 'deepseek') {
      baseConfig = defaultDeepseekConfig;
    } else if (config.provider === 'grok') {
      baseConfig = defaultGrokConfig;
    } else if (config.provider === 'meta') {
      baseConfig = defaultMetaConfig;
    } else {
      baseConfig = defaultOpenAIConfig;
    }
    this.config = { ...baseConfig, ...config };
  }

  /**
   * Set provider
   */
  setProvider(provider: 'openai' | 'anthropic' | 'gemini' | 'deepseek' | 'grok' | 'meta'): void {
    let baseConfig;
    if (provider === 'anthropic') {
      baseConfig = defaultAnthropicConfig;
    } else if (provider === 'gemini') {
      baseConfig = defaultGeminiConfig;
    } else if (provider === 'deepseek') {
      baseConfig = defaultDeepseekConfig;
    } else if (provider === 'grok') {
      baseConfig = defaultGrokConfig;
    } else if (provider === 'meta') {
      baseConfig = defaultMetaConfig;
    } else {
      baseConfig = defaultOpenAIConfig;
    }
    this.config = { ...baseConfig };
  }

  /**
   * Set API key
   */
  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
  }

  /**
   * Set model
   */
  setModel(model: string): void {
    this.config.model = model;
  }

  /**
   * Generate completion from LLM
   */
  async generateCompletion(prompt: string, options: Partial<LLMConfig> = {}): Promise<string> {
    try {
      const config = { ...this.config, ...options };

      if (config.provider === 'openai') {
        return this.generateOpenAICompletion(prompt, config);
      } else if (config.provider === 'anthropic') {
        return this.generateAnthropicCompletion(prompt, config);
      } else if (config.provider === 'gemini') {
        return this.generateGeminiCompletion(prompt, config);
      } else if (config.provider === 'deepseek') {
        return this.generateDeepseekCompletion(prompt, config);
      } else if (config.provider === 'grok') {
        return this.generateGrokCompletion(prompt, config);
      } else if (config.provider === 'meta') {
        return this.generateMetaCompletion(prompt, config);
      } else {
        throw new Error(`Unsupported LLM provider: ${config.provider}`);
      }
    } catch (error) {
      console.error(`Error calling ${this.config.provider} API:`, error);
      throw new Error(`Failed to generate completion from ${this.config.provider}`);
    }
  }

  /**
   * Generate completion with system message
   */
  async generateCompletionWithSystem(
    systemMessage: string,
    userPrompt: string,
    options: Partial<LLMConfig> = {}
  ): Promise<string> {
    try {
      const config = { ...this.config, ...options };

      if (config.provider === 'openai') {
        return this.generateOpenAICompletionWithSystem(systemMessage, userPrompt, config);
      } else if (config.provider === 'anthropic') {
        return this.generateAnthropicCompletionWithSystem(systemMessage, userPrompt, config);
      } else if (config.provider === 'gemini') {
        return this.generateGeminiCompletionWithSystem(systemMessage, userPrompt, config);
      } else if (config.provider === 'deepseek') {
        return this.generateDeepseekCompletionWithSystem(systemMessage, userPrompt, config);
      } else if (config.provider === 'grok') {
        return this.generateGrokCompletionWithSystem(systemMessage, userPrompt, config);
      } else if (config.provider === 'meta') {
        return this.generateMetaCompletionWithSystem(systemMessage, userPrompt, config);
      } else {
        throw new Error(`Unsupported LLM provider: ${config.provider}`);
      }
    } catch (error) {
      console.error(`Error calling ${this.config.provider} API:`, error);
      throw new Error(`Failed to generate completion from ${this.config.provider}`);
    }
  }

  /**
   * Generate completion from OpenAI
   */
  private async generateOpenAICompletion(prompt: string, config: LLMConfig): Promise<string> {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: config.maxTokens,
        temperature: config.temperature
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        }
      }
    );

    return response.data.choices[0].message.content;
  }

  /**
   * Generate completion with system message from OpenAI
   */
  private async generateOpenAICompletionWithSystem(
    systemMessage: string,
    userPrompt: string,
    config: LLMConfig
  ): Promise<string> {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: config.model,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: config.maxTokens,
        temperature: config.temperature
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        }
      }
    );

    return response.data.choices[0].message.content;
  }

  /**
   * Generate completion from Anthropic
   */
  private async generateAnthropicCompletion(prompt: string, config: LLMConfig): Promise<string> {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: config.maxTokens,
        temperature: config.temperature
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01'
        }
      }
    );

    return response.data.content[0].text;
  }

  /**
   * Generate completion with system message from Anthropic
   */
  private async generateAnthropicCompletionWithSystem(
    systemMessage: string,
    userPrompt: string,
    config: LLMConfig
  ): Promise<string> {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: config.model,
        system: systemMessage,
        messages: [{ role: 'user', content: userPrompt }],
        max_tokens: config.maxTokens,
        temperature: config.temperature
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01'
        }
      }
    );

    return response.data.content[0].text;
  }

  /**
   * Generate completion from Google Gemini
   */
  private async generateGeminiCompletion(prompt: string, config: LLMConfig): Promise<string> {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: config.temperature,
          maxOutputTokens: config.maxTokens,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  }

  /**
   * Generate completion with system message from Google Gemini
   */
  private async generateGeminiCompletionWithSystem(
    systemMessage: string,
    userPrompt: string,
    config: LLMConfig
  ): Promise<string> {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`,
      {
        contents: [
          {
            parts: [
              { text: `${systemMessage}\n\n${userPrompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: config.temperature,
          maxOutputTokens: config.maxTokens,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  }

  /**
   * Generate completion with Deepseek API
   */
  private async generateDeepseekCompletion(prompt: string, config: LLMConfig): Promise<string> {
    try {
      // This is a placeholder implementation
      // Replace with actual Deepseek API integration when available
      console.log('Using Deepseek API with model:', config.model);
      
      const response = await axios.post(
        'https://api.deepseek.ai/v1/chat/completions',
        {
          model: config.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: config.temperature,
          max_tokens: config.maxTokens
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
          }
        }
      );
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating Deepseek completion:', error);
      throw new Error('Failed to generate completion with Deepseek API');
    }
  }

  /**
   * Generate completion with system message using Deepseek API
   */
  private async generateDeepseekCompletionWithSystem(
    systemMessage: string,
    userPrompt: string,
    config: LLMConfig
  ): Promise<string> {
    try {
      // This is a placeholder implementation
      // Replace with actual Deepseek API integration when available
      console.log('Using Deepseek API with model:', config.model);
      
      const response = await axios.post(
        'https://api.deepseek.ai/v1/chat/completions',
        {
          model: config.model,
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userPrompt }
          ],
          temperature: config.temperature,
          max_tokens: config.maxTokens
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
          }
        }
      );
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating Deepseek completion with system message:', error);
      throw new Error('Failed to generate completion with Deepseek API');
    }
  }

  /**
   * Generate completion with Grok API
   */
  private async generateGrokCompletion(prompt: string, config: LLMConfig): Promise<string> {
    try {
      // This is a placeholder implementation
      // Replace with actual Grok API integration when available
      console.log('Using Grok API with model:', config.model);
      
      const response = await axios.post(
        'https://api.grok.ai/v1/chat/completions',
        {
          model: config.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: config.temperature,
          max_tokens: config.maxTokens
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
          }
        }
      );
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating Grok completion:', error);
      throw new Error('Failed to generate completion with Grok API');
    }
  }

  /**
   * Generate completion with system message using Grok API
   */
  private async generateGrokCompletionWithSystem(
    systemMessage: string,
    userPrompt: string,
    config: LLMConfig
  ): Promise<string> {
    try {
      // This is a placeholder implementation
      // Replace with actual Grok API integration when available
      console.log('Using Grok API with model:', config.model);
      
      const response = await axios.post(
        'https://api.grok.ai/v1/chat/completions',
        {
          model: config.model,
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userPrompt }
          ],
          temperature: config.temperature,
          max_tokens: config.maxTokens
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
          }
        }
      );
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating Grok completion with system message:', error);
      throw new Error('Failed to generate completion with Grok API');
    }
  }

  /**
   * Generate completion with Meta API
   */
  private async generateMetaCompletion(prompt: string, config: LLMConfig): Promise<string> {
    try {
      // This is a placeholder implementation
      // Replace with actual Meta API integration when available
      console.log('Using Meta API with model:', config.model);
      
      const response = await axios.post(
        'https://api.meta.ai/v1/chat/completions',
        {
          model: config.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: config.temperature,
          max_tokens: config.maxTokens
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
          }
        }
      );
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating Meta completion:', error);
      throw new Error('Failed to generate completion with Meta API');
    }
  }

  /**
   * Generate completion with system message using Meta API
   */
  private async generateMetaCompletionWithSystem(
    systemMessage: string,
    userPrompt: string,
    config: LLMConfig
  ): Promise<string> {
    try {
      // This is a placeholder implementation
      // Replace with actual Meta API integration when available
      console.log('Using Meta API with model:', config.model);
      
      const response = await axios.post(
        'https://api.meta.ai/v1/chat/completions',
        {
          model: config.model,
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userPrompt }
          ],
          temperature: config.temperature,
          max_tokens: config.maxTokens
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
          }
        }
      );
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating Meta completion with system message:', error);
      throw new Error('Failed to generate completion with Meta API');
    }
  }

  /**
   * Analyze sentiment of text
   */
  async analyzeSentiment(text: string): Promise<{ sentiment: string; score: number; explanation: string }> {
    try {
      const systemMessage = 'You are a sentiment analysis assistant. Analyze the sentiment of the following text and respond with ONLY a JSON object with these fields: "sentiment" (one of "positive", "neutral", "negative"), "score" (number between -1 and 1), and "explanation" (brief explanation of the sentiment).';
      
      const response = await this.generateCompletionWithSystem(systemMessage, text, { temperature: 0.1 });
      
      return JSON.parse(response);
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      throw new Error('Failed to analyze sentiment');
    }
  }

  /**
   * Generate summary of text
   */
  async generateSummary(text: string, maxWords: number = 150): Promise<string> {
    try {
      const systemMessage = `You are a summarization assistant. Summarize the following text in ${maxWords} words or less. Focus on the main points and key takeaways.`;
      
      return await this.generateCompletionWithSystem(systemMessage, text, { temperature: 0.3 });
    } catch (error) {
      console.error('Error generating summary:', error);
      throw new Error('Failed to generate summary');
    }
  }
}

// Create and export an instance of the LLM service
const llmService = new LLMService();
export default llmService; 