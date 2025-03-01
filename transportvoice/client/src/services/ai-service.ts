// server/src/services/ai/ai.service.ts
import axios from 'axios';
import AIProvider from '../../models/AIProvider';
import { AppError } from '../../utils/errors';

/**
 * AI Service for interacting with various LLM providers
 */
class AIService {
  /**
   * Get AI provider configuration by ID
   */
  async getProviderConfig(providerId: string) {
    const provider = await AIProvider.findById(providerId);
    if (!provider) {
      throw new AppError('AI Provider not found', 404);
    }
    
    return provider;
  }

  /**
   * Get all configured AI providers
   */
  async getAllProviders() {
    return await AIProvider.find().sort({ name: 1 });
  }

  /**
   * Update the frontend visibility setting for an AI provider
   * @param providerId The AI provider ID
   * @param isVisible Whether the provider should be visible to frontend users
   */
  async updateFrontendVisibility(providerId: string, isVisible: boolean) {
    const provider = await AIProvider.findById(providerId);
    if (!provider) {
      throw new AppError('AI Provider not found', 404);
    }
    
    provider.isVisibleToFrontend = isVisible;
    await provider.save();
    
    return provider;
  }

  /**
   * Set an AI provider as the default provider
   * @param providerId The AI provider ID to set as default
   */
  async setDefaultProvider(providerId: string) {
    // First, clear default status from all providers
    await AIProvider.updateMany({}, { isDefault: false });
    
    // Then set the specified provider as default
    const provider = await AIProvider.findById(providerId);
    if (!provider) {
      throw new AppError('AI Provider not found', 404);
    }
    
    provider.isDefault = true;
    await provider.save();
    
    return provider;
  }

  /**
   * Get the currently active LLM provider for frontend use
   * Returns the default provider, or the first visible provider if no default is set
   */
  async getActiveFrontendProvider() {
    // First try to get the default provider that's visible to frontend
    let provider = await AIProvider.findOne({ 
      isDefault: true,
      isVisibleToFrontend: true
    });
    
    // If no default provider is found, get the first visible provider
    if (!provider) {
      provider = await AIProvider.findOne({ isVisibleToFrontend: true });
    }
    
    if (!provider) {
      throw new AppError('No AI provider is available for frontend use', 404);
    }
    
    return {
      id: provider._id,
      name: provider.name,
      provider: provider.provider,
      model: provider.model
    };
  }

  /**
   * Get all LLM providers that are visible to the frontend
   * Used when multiple providers are enabled for frontend selection
   */
  async getFrontendVisibleProviders() {
    const providers = await AIProvider.find({ 
      isVisibleToFrontend: true 
    }).sort({ isDefault: -1, name: 1 });
    
    return providers.map(p => ({
      id: p._id,
      name: p.name,
      provider: p.provider,
      model: p.model,
      isDefault: p.isDefault
    }));
  }

  /**
   * Moderate content using the specified AI provider
   * @param text The text to moderate
   * @param providerId The AI provider ID to use
   * @returns Moderation result
   */
  async moderateContent(text: string, providerId: string) {
    const provider = await this.getProviderConfig(providerId);
    
    try {
      switch (provider.provider) {
        case 'openai':
          return await this.moderateWithOpenAI(text, provider);
        case 'anthropic':
          return await this.moderateWithAnthropic(text, provider);
        case 'huggingface':
          return await this.moderateWithHuggingFace(text, provider);
        case 'custom':
          return await this.moderateWithCustomProvider(text, provider);
        default:
          throw new AppError('Unsupported AI provider', 400);
      }
    } catch (error) {
      console.error('AI moderation error:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Error during AI moderation', 500);
    }
  }

  /**
   * Analyze sentiment using the specified AI provider
   * @param text The text to analyze
   * @param providerId The AI provider ID to use
   * @returns Sentiment analysis result
   */
  async analyzeSentiment(text: string, providerId: string) {
    const provider = await this.getProviderConfig(providerId);
    
    try {
      switch (provider.provider) {
        case 'openai':
          return await this.analyzeSentimentWithOpenAI(text, provider);
        case 'anthropic':
          return await this.analyzeSentimentWithAnthropic(text, provider);
        case 'huggingface':
          return await this.analyzeSentimentWithHuggingFace(text, provider);
        case 'custom':
          return await this.analyzeSentimentWithCustomProvider(text, provider);
        default:
          throw new AppError('Unsupported AI provider', 400);
      }
    } catch (error) {
      console.error('AI sentiment analysis error:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Error during AI sentiment analysis', 500);
    }
  }

  /**
   * Summarize comments using the specified AI provider
   * @param comments Array of comment texts to summarize
   * @param providerId The AI provider ID to use
   * @returns Summary result
   */
  async summarizeComments(comments: string[], providerId: string) {
    const provider = await this.getProviderConfig(providerId);
    
    try {
      switch (provider.provider) {
        case 'openai':
          return await this.summarizeWithOpenAI(comments, provider);
        case 'anthropic':
          return await this.summarizeWithAnthropic(comments, provider);
        case 'huggingface':
          return await this.summarizeWithHuggingFace(comments, provider);
        case 'custom':
          return await this.summarizeWithCustomProvider(comments, provider);
        default:
          throw new AppError('Unsupported AI provider', 400);
      }
    } catch (error) {
      console.error('AI summarization error:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Error during AI summarization', 500);
    }
  }

  /**
   * Translate text using the specified AI provider
   * @param text The text to translate
   * @param targetLanguage The target language code
   * @param providerId The AI provider ID to use
   * @returns Translated text
   */
  async translateText(text: string, targetLanguage: string, providerId: string) {
    const provider = await this.getProviderConfig(providerId);
    
    try {
      switch (provider.provider) {
        case 'openai':
          return await this.translateWithOpenAI(text, targetLanguage, provider);
        case 'anthropic':
          return await this.translateWithAnthropic(text, targetLanguage, provider);
        case 'huggingface':
          return await this.translateWithHuggingFace(text, targetLanguage, provider);
        case 'custom':
          return await this.translateWithCustomProvider(text, targetLanguage, provider);
        default:
          throw new AppError('Unsupported AI provider', 400);
      }
    } catch (error) {
      console.error('AI translation error:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Error during AI translation', 500);
    }
  }

  /**
   * Categorize comments using the specified AI provider
   * @param text The text to categorize
   * @param categories Available categories
   * @param providerId The AI provider ID to use
   * @returns Category assignment
   */
  async categorizeComment(text: string, categories: string[], providerId: string) {
    const provider = await this.getProviderConfig(providerId);
    
    try {
      switch (provider.provider) {
        case 'openai':
          return await this.categorizeWithOpenAI(text, categories, provider);
        case 'anthropic':
          return await this.categorizeWithAnthropic(text, categories, provider);
        case 'huggingface':
          return await this.categorizeWithHuggingFace(text, categories, provider);
        case 'custom':
          return await this.categorizeWithCustomProvider(text, categories, provider);
        default:
          throw new AppError('Unsupported AI provider', 400);
      }
    } catch (error) {
      console.error('AI categorization error:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Error during AI categorization', 500);
    }
  }

  // Provider-specific implementations

  // OpenAI implementations
  private async moderateWithOpenAI(text: string, provider: any) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/moderations',
        { input: text },
        {
          headers: {
            'Authorization': `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = response.data.results[0];
      
      return {
        flagged: result.flagged,
        categories: result.categories,
        categoryScores: result.category_scores,
        provider: 'openai'
      };
    } catch (error) {
      console.error('OpenAI moderation error:', error);
      throw new AppError('Error calling OpenAI moderation API', 500);
    }
  }

  private async analyzeSentimentWithOpenAI(text: string, provider: any) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: provider.model,
          messages: [
            {
              role: 'system',
              content: 'You are a sentiment analysis assistant. Analyze the sentiment of the following text and respond with ONLY a JSON object with these fields: "sentiment" (one of "positive", "neutral", "negative"), "score" (number between -1 and 1), and "explanation" (brief explanation of the sentiment).'
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      const result = JSON.parse(content);
      
      return {
        sentiment: result.sentiment,
        score: result.score,
        explanation: result.explanation,
        provider: 'openai'
      };
    } catch (error) {
      console.error('OpenAI sentiment analysis error:', error);
      throw new AppError('Error calling OpenAI API for sentiment analysis', 500);
    }
  }

  private async summarizeWithOpenAI(comments: string[], provider: any) {
    try {
      const combinedComments = comments.join('\n\n');
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: provider.model,
          messages: [
            {
              role: 'system',
              content: 'You are a summarization assistant. Provide a concise summary of the following comments from a community transportation planning project. Group them by themes and highlight the most important concerns and suggestions. Respond with ONLY a JSON object with these fields: "summary" (overall summary), "themes" (array of main themes), and "keyPoints" (array of key points).'
            },
            {
              role: 'user',
              content: combinedComments
            }
          ],
          temperature: 0.2
        },
        {
          headers: {
            'Authorization': `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      const result = JSON.parse(content);
      
      return {
        summary: result.summary,
        themes: result.themes,
        keyPoints: result.keyPoints,
        provider: 'openai'
      };
    } catch (error) {
      console.error('OpenAI summarization error:', error);
      throw new AppError('Error calling OpenAI API for summarization', 500);
    }
  }

  private async translateWithOpenAI(text: string, targetLanguage: string, provider: any) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: provider.model,
          messages: [
            {
              role: 'system',
              content: `You are a translation assistant. Translate the following text to ${targetLanguage}. Preserve formatting and provide ONLY the translated text without any explanation or metadata.`
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const translatedText = response.data.choices[0].message.content;
      
      return {
        originalText: text,
        translatedText,
        targetLanguage,
        provider: 'openai'
      };
    } catch (error) {
      console.error('OpenAI translation error:', error);
      throw new AppError('Error calling OpenAI API for translation', 500);
    }
  }

  private async categorizeWithOpenAI(text: string, categories: string[], provider: any) {
    try {
      const categoriesStr = categories.join(', ');
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: provider.model,
          messages: [
            {
              role: 'system',
              content: `You are a categorization assistant. Categorize the following comment from a transportation planning project into one of these categories: ${categoriesStr}. Respond with ONLY a JSON object with these fields: "category" (the most appropriate category), "confidence" (number between 0 and 1), and "explanation" (brief explanation of why this category was chosen).`
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      const result = JSON.parse(content);
      
      return {
        category: result.category,
        confidence: result.confidence,
        explanation: result.explanation,
        provider: 'openai'
      };
    } catch (error) {
      console.error('OpenAI categorization error:', error);
      throw new AppError('Error calling OpenAI API for categorization', 500);
    }
  }

  // Anthropic implementations
  private async moderateWithAnthropic(text: string, provider: any) {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: provider.model,
          messages: [
            {
              role: 'user',
              content: `Please analyze if the following text contains any harmful, unsafe, or inappropriate content. Respond with a JSON object with these fields: "flagged" (boolean), "categories" (object with boolean values for categories like "harassment", "hate", "self_harm", "sexual", "violence"), "categoryScores" (object with scores between 0 and 1 for each category), and "reason" (brief explanation if flagged).
              
              Text to analyze:
              "${text}"`
            }
          ],
          max_tokens: 1000,
          temperature: 0
        },
        {
          headers: {
            'x-api-key': provider.apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.content[0].text;
      const result = JSON.parse(content);
      
      return {
        flagged: result.flagged,
        categories: result.categories,
        categoryScores: result.categoryScores,
        reason: result.reason,
        provider: 'anthropic'
      };
    } catch (error) {
      console.error('Anthropic moderation error:', error);
      throw new AppError('Error calling Anthropic API for moderation', 500);
    }
  }

  private async analyzeSentimentWithAnthropic(text: string, provider: any) {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: provider.model,
          messages: [
            {
              role: 'user',
              content: `Analyze the sentiment of the following text and respond with ONLY a JSON object with these fields: "sentiment" (one of "positive", "neutral", "negative"), "score" (number between -1 and 1), and "explanation" (brief explanation of the sentiment).
              
              Text to analyze:
              "${text}"`
            }
          ],
          max_tokens: 1000,
          temperature: 0
        },
        {
          headers: {
            'x-api-key': provider.apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.content[0].text;
      const result = JSON.parse(content);
      
      return {
        sentiment: result.sentiment,
        score: result.score,
        explanation: result.explanation,
        provider: 'anthropic'
      };
    } catch (error) {
      console.error('Anthropic sentiment analysis error:', error);
      throw new AppError('Error calling Anthropic API for sentiment analysis', 500);
    }
  }

  private async summarizeWithAnthropic(comments: string[], provider: any) {
    try {
      const combinedComments = comments.join('\n\n');
      
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: provider.model,
          messages: [
            {
              role: 'user',
              content: `Provide a concise summary of the following comments from a community transportation planning project. Group them by themes and highlight the most important concerns and suggestions. Respond with ONLY a JSON object with these fields: "summary" (overall summary), "themes" (array of main themes), and "keyPoints" (array of key points).
              
              Comments:
              "${combinedComments}"`
            }
          ],
          max_tokens: 2000,
          temperature: 0
        },
        {
          headers: {
            'x-api-key': provider.apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.content[0].text;
      const result = JSON.parse(content);
      
      return {
        summary: result.summary,
        themes: result.themes,
        keyPoints: result.keyPoints,
        provider: 'anthropic'
      };
    } catch (error) {
      console.error('Anthropic summarization error:', error);
      throw new AppError('Error calling Anthropic API for summarization', 500);
    }
  }

  private async translateWithAnthropic(text: string, targetLanguage: string, provider: any) {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: provider.model,
          messages: [
            {
              role: 'user',
              content: `Translate the following text to ${targetLanguage}. Preserve formatting and provide ONLY the translated text without any explanation or metadata.
              
              Text to translate:
              "${text}"`
            }
          ],
          max_tokens: 2000,
          temperature: 0
        },
        {
          headers: {
            'x-api-key': provider.apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          }
        }
      );

      const translatedText = response.data.content[0].text;
      
      return {
        originalText: text,
        translatedText,
        targetLanguage,
        provider: 'anthropic'
      };
    } catch (error) {
      console.error('Anthropic translation error:', error);
      throw new AppError('Error calling Anthropic API for translation', 500);
    }
  }

  private async categorizeWithAnthropic(text: string, categories: string[], provider: any) {
    try {
      const categoriesStr = categories.join(', ');
      
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: provider.model,
          messages: [
            {
              role: 'user',
              content: `Categorize the following comment from a transportation planning project into one of these categories: ${categoriesStr}. Respond with ONLY a JSON object with these fields: "category" (the most appropriate category), "confidence" (number between 0 and 1), and "explanation" (brief explanation of why this category was chosen).
              
              Comment to categorize:
              "${text}"`
            }
          ],
          max_tokens: 1000,
          temperature: 0
        },
        {
          headers: {
            'x-api-key': provider.apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.content[0].text;
      const result = JSON.parse(content);
      
      return {
        category: result.category,
        confidence: result.confidence,
        explanation: result.explanation,
        provider: 'anthropic'
      };
    } catch (error) {
      console.error('Anthropic categorization error:', error);
      throw new AppError('Error calling Anthropic API for categorization', 500);
    }
  }

  // HuggingFace implementations
  private async moderateWithHuggingFace(text: string, provider: any) {
    // Implementation would depend on specific HuggingFace model
    throw new AppError('HuggingFace moderation not implemented yet', 501);
  }

  private async analyzeSentimentWithHuggingFace(text: string, provider: any) {
    try {
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${provider.model}`,
        { inputs: text },
        {
          headers: {
            'Authorization': `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = response.data[0];
      
      // Transform HuggingFace sentiment format to our standard format
      const sentimentMap: any = {
        'POSITIVE': 'positive',
        'NEUTRAL': 'neutral',
        'NEGATIVE': 'negative'
      };
      
      let sentiment = 'neutral';
      let score = 0;
      
      // Find the highest scoring sentiment
      if (result && Array.isArray(result)) {
        let highestScore = 0;
        
        result.forEach((item: any) => {
          if (item.score > highestScore) {
            highestScore = item.score;
            sentiment = sentimentMap[item.label] || item.label.toLowerCase();
            score = item.score * 2 - 1; // Convert 0-1 to -1 to 1 scale
          }
        });
      }
      
      return {
        sentiment,
        score,
        rawResult: result,
        provider: 'huggingface'
      };
    } catch (error) {
      console.error('HuggingFace sentiment analysis error:', error);
      throw new AppError('Error calling HuggingFace API for sentiment analysis', 500);
    }
  }

  private async summarizeWithHuggingFace(comments: string[], provider: any) {
    // Implementation would depend on specific HuggingFace model
    throw new AppError('HuggingFace summarization not implemented yet', 501);
  }

  private async translateWithHuggingFace(text: string, targetLanguage: string, provider: any) {
    // Implementation would depend on specific HuggingFace model
    throw new AppError('HuggingFace translation not implemented yet', 501);
  }

  private async categorizeWithHuggingFace(text: string, categories: string[], provider: any) {
    // Implementation would depend on specific HuggingFace model
    throw new AppError('HuggingFace categorization not implemented yet', 501);
  }

  // Custom provider implementations
  private async moderateWithCustomProvider(text: string, provider: any) {
    try {
      const endpoint = `${provider.baseUrl}/moderate`;
      
      const response = await axios.post(
        endpoint,
        { text },
        {
          headers: {
            'Authorization': `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        ...response.data,
        provider: 'custom'
      };
    } catch (error) {
      console.error('Custom provider moderation error:', error);
      throw new AppError('Error calling custom provider API for moderation', 500);
    }
  }

  private async analyzeSentimentWithCustomProvider(text: string, provider: any) {
    try {
      const endpoint = `${provider.baseUrl}/sentiment`;
      
      const response = await axios.post(
        endpoint,
        { text },
        {
          headers: {
            'Authorization': `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        ...response.data,
        provider: 'custom'
      };
    } catch (error) {
      console.error('Custom provider sentiment analysis error:', error);
      throw new AppError('Error calling custom provider API for sentiment analysis', 500);
    }
  }

  private async summarizeWithCustomProvider(comments: string[], provider: any) {
    try {
      const endpoint = `${provider.baseUrl}/summarize`;
      
      const response = await axios.post(
        endpoint,
        { text: comments.join('\n\n') },
        {
          headers: {
            'Authorization': `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        ...response.data,
        provider: 'custom'
      };
    } catch (error) {
      console.error('Custom provider summarization error:', error);
      throw new AppError('Error calling custom provider API for summarization', 500);
    }
  }

  private async translateWithCustomProvider(text: string, targetLanguage: string, provider: any) {
    try {
      const endpoint = `${provider.baseUrl}/translate`;
      
      const response = await axios.post(
        endpoint,
        { text, targetLanguage },
        {
          headers: {
            'Authorization': `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        ...response.data,
        provider: 'custom'
      };
    } catch (error) {
      console.error('Custom provider translation error:', error);
      throw new AppError('Error calling custom provider API for translation', 500);
    }
  }

  private async categorizeWithCustomProvider(text: string, categories: string[], provider: any) {
    try {
      const endpoint = `${provider.baseUrl}/categorize`;
      
      const response = await axios.post(
        endpoint,
        { text, categories },
        {
          headers: {
            'Authorization': `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        ...response.data,
        provider: 'custom'
      };
    } catch (error) {
      console.error('Custom provider categorization error:', error);
      throw new AppError('Error calling custom provider API for categorization', 500);
    }
  }
}

export default new AIService();
