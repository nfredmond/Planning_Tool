/**
 * AI Service
 * Provides functionality for AI-powered features in the application
 * Uses Anthropic's Claude API as the primary LLM provider
 */
import axios from 'axios';
import mongoose from 'mongoose';
import AIProvider from '../../models/AIProvider';

interface SentimentAnalysisResult {
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  keywords: string[];
}

interface TextSummaryResult {
  originalText: string;
  summary: string;
  keyPoints: string[];
}

interface TransportationSuggestion {
  id: string;
  title: string;
  description: string;
  benefits: string[];
  challenges: string[];
  estimatedCost: string;
  implementationTimeframe: string;
}

interface AIProviderConfig {
  provider: 'openai' | 'anthropic' | 'huggingface' | 'custom';
  apiKey: string;
  model: string;
  baseUrl?: string;
  settings?: Record<string, any>;
}

class AIService {
  private defaultProvider: AIProviderConfig = {
    provider: 'anthropic',
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: 'claude-3-sonnet-20240229',
    settings: {
      temperature: 0.7,
      max_tokens: 1000
    }
  };

  private async getProvider(projectId?: string): Promise<AIProviderConfig> {
    try {
      if (!projectId) {
        // If no project ID is provided, get the default provider from the database
        const defaultProvider = await AIProvider.findOne({ isDefault: true });
        if (defaultProvider) {
          return {
            provider: defaultProvider.provider,
            apiKey: defaultProvider.apiKey || '',
            model: defaultProvider.model,
            baseUrl: defaultProvider.baseUrl,
            settings: defaultProvider.settings
          };
        }
      } else {
        // If project ID is provided, get the provider assigned to this project
        const projectProvider = await AIProvider.findOne({
          projects: new mongoose.Types.ObjectId(projectId)
        });
        if (projectProvider) {
          return {
            provider: projectProvider.provider,
            apiKey: projectProvider.apiKey || '',
            model: projectProvider.model,
            baseUrl: projectProvider.baseUrl,
            settings: projectProvider.settings
          };
        }
      }
      
      // Fallback to default provider
      return this.defaultProvider;
    } catch (error) {
      console.error('Error getting AI provider:', error);
      return this.defaultProvider;
    }
  }

  /**
   * Make an API call to the LLM provider
   */
  private async callLLM(prompt: string, provider: AIProviderConfig): Promise<string> {
    try {
      if (provider.provider === 'anthropic') {
        const response = await axios.post(
          'https://api.anthropic.com/v1/messages',
          {
            model: provider.model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: provider.settings?.max_tokens || 1000,
            temperature: provider.settings?.temperature || 0.7
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': provider.apiKey,
              'anthropic-version': '2023-06-01'
            }
          }
        );
        return response.data.content[0].text;
      } else if (provider.provider === 'openai') {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: provider.model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: provider.settings?.max_tokens || 1000,
            temperature: provider.settings?.temperature || 0.7
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${provider.apiKey}`
            }
          }
        );
        return response.data.choices[0].message.content;
      } else if (provider.provider === 'custom' && provider.baseUrl) {
        const response = await axios.post(
          provider.baseUrl,
          {
            model: provider.model,
            prompt: prompt,
            ...provider.settings
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${provider.apiKey}`
            }
          }
        );
        return response.data.text || response.data.content || '';
      }
      
      throw new Error(`Unsupported provider: ${provider.provider}`);
    } catch (error) {
      console.error('Error calling LLM:', error);
      throw error;
    }
  }

  /**
   * Analyze sentiment of user comments
   */
  async analyzeSentiment(text: string, projectId?: string): Promise<SentimentAnalysisResult> {
    try {
      const provider = await this.getProvider(projectId);
      
      const prompt = `
      Analyze the sentiment of the following text. Respond with a JSON object containing:
      - sentiment: either "positive", "neutral", or "negative"
      - score: a number between 0 and 1 (0 being very negative, 0.5 neutral, 1 very positive)
      - keywords: an array of up to 5 important keywords from the text

      Text to analyze:
      "${text}"
      
      JSON response:
      `;
      
      const response = await this.callLLM(prompt, provider);
      const result = JSON.parse(response);
      
      return {
        text,
        sentiment: result.sentiment,
        score: result.score,
        keywords: result.keywords
      };
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      // Fallback to simple analysis
      const lowerText = text.toLowerCase();
      let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
      let score = 0.5;
      
      const positiveWords = ['good', 'great', 'excellent', 'like', 'support', 'approve'];
      const negativeWords = ['bad', 'poor', 'terrible', 'dislike', 'oppose', 'disapprove'];
      
      const positiveMatches = positiveWords.filter(word => lowerText.includes(word));
      const negativeMatches = negativeWords.filter(word => lowerText.includes(word));
      
      if (positiveMatches.length > negativeMatches.length) {
        sentiment = 'positive';
        score = 0.5 + (0.5 * (positiveMatches.length / (positiveMatches.length + negativeMatches.length)));
      } else if (negativeMatches.length > positiveMatches.length) {
        sentiment = 'negative';
        score = 0.5 - (0.5 * (negativeMatches.length / (positiveMatches.length + negativeMatches.length)));
      }
      
      const words = text.split(/\s+/);
      const keywords = words.filter(word => 
        word.length > 4 && 
        !['about', 'these', 'their', 'there', 'would', 'should'].includes(word.toLowerCase())
      ).slice(0, 5);
      
      return {
        text,
        sentiment,
        score,
        keywords
      };
    }
  }

  /**
   * Generate a summary of project comments
   */
  async summarizeComments(comments: string[], projectId?: string): Promise<TextSummaryResult> {
    try {
      const provider = await this.getProvider(projectId);
      const originalText = comments.join('\n');
      
      const prompt = `
      Summarize the following transportation project comments. Provide:
      1. A concise summary (max 3 paragraphs)
      2. A list of key points (max 5)
      
      Format your response as JSON with "summary" and "keyPoints" fields.
      
      Comments to summarize:
      ${originalText}
      
      JSON response:
      `;
      
      const response = await this.callLLM(prompt, provider);
      const result = JSON.parse(response);
      
      return {
        originalText,
        summary: result.summary,
        keyPoints: result.keyPoints
      };
    } catch (error) {
      console.error('Error summarizing comments:', error);
      return {
        originalText: comments.join('\n'),
        summary: 'Error generating summary. Please try again later.',
        keyPoints: []
      };
    }
  }

  /**
   * Generate transportation improvement suggestions based on project data
   */
  async generateSuggestions(projectData: Record<string, any>, projectId?: string): Promise<TransportationSuggestion[]> {
    try {
      const provider = await this.getProvider(projectId);
      
      const prompt = `
      Based on the following transportation project data, generate 3 innovative and practical suggestions for transportation improvements. 
      
      Project data:
      ${JSON.stringify(projectData, null, 2)}
      
      For each suggestion, provide:
      - id: a unique identifier
      - title: a short, descriptive title
      - description: a detailed explanation (1-2 paragraphs)
      - benefits: an array of 3-5 benefits
      - challenges: an array of 2-4 potential challenges
      - estimatedCost: "Low", "Medium", or "High"
      - implementationTimeframe: estimated timeframe for implementation (e.g., "6 months", "1-2 years")
      
      Format your response as a JSON array.
      `;
      
      const response = await this.callLLM(prompt, provider);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return [
        {
          id: 'fallback-suggestion-1',
          title: 'Error generating suggestions',
          description: 'We encountered an error generating AI-powered suggestions. Please try again later.',
          benefits: [],
          challenges: [],
          estimatedCost: 'Unknown',
          implementationTimeframe: 'Unknown'
        }
      ];
    }
  }
  
  /**
   * Analyze demographic data and provide insights
   */
  async analyzeDemographics(demographicData: Record<string, any>, projectId?: string): Promise<{
    insights: string[];
    recommendations: string[];
  }> {
    try {
      const provider = await this.getProvider(projectId);
      
      const prompt = `
      Analyze the following demographic data for a transportation project and provide:
      1. 3-5 key insights about how different demographic groups might be affected
      2. 3-4 recommendations for making the project more equitable and accessible
      
      Demographic data:
      ${JSON.stringify(demographicData, null, 2)}
      
      Format your response as JSON with "insights" and "recommendations" arrays.
      `;
      
      const response = await this.callLLM(prompt, provider);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error analyzing demographics:', error);
      return {
        insights: ['Error generating demographic insights. Please try again later.'],
        recommendations: []
      };
    }
  }
  
  /**
   * Predict climate impact of transportation projects
   */
  async predictClimateImpact(projectDetails: Record<string, any>, projectId?: string): Promise<{
    co2Reduction: number;
    analysis: string;
    recommendations: string[];
  }> {
    try {
      const provider = await this.getProvider(projectId);
      
      const prompt = `
      Based on the following transportation project details, predict its climate impact:
      
      Project details:
      ${JSON.stringify(projectDetails, null, 2)}
      
      Provide:
      1. Estimated CO2 reduction in metric tons per year
      2. A detailed analysis of the climate impact (1-2 paragraphs)
      3. 2-3 recommendations to improve the climate benefits
      
      Format your response as JSON with "co2Reduction" (number), "analysis" (string), and "recommendations" (array) fields.
      `;
      
      const response = await this.callLLM(prompt, provider);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error predicting climate impact:', error);
      return {
        co2Reduction: 0,
        analysis: 'Error predicting climate impact. Please try again later.',
        recommendations: []
      };
    }
  }

  /**
   * Get all AI providers
   */
  async getAllProviders() {
    try {
      const providers = await AIProvider.find().sort({ createdAt: -1 });
      return providers;
    } catch (error) {
      console.error('Error getting AI providers:', error);
      throw error;
    }
  }

  /**
   * Get AI providers that are visible to the frontend
   */
  async getFrontendVisibleProviders() {
    try {
      const providers = await AIProvider.find({ isVisibleToFrontend: true }).sort({ createdAt: -1 });
      return providers;
    } catch (error) {
      console.error('Error getting frontend visible AI providers:', error);
      throw error;
    }
  }

  /**
   * Get the active (default) AI provider for frontend
   */
  async getActiveFrontendProvider() {
    try {
      const defaultProvider = await AIProvider.findOne({ 
        isDefault: true,
        isVisibleToFrontend: true 
      });
      return defaultProvider;
    } catch (error) {
      console.error('Error getting active frontend AI provider:', error);
      throw error;
    }
  }

  /**
   * Get provider configuration by ID
   */
  async getProviderConfig(providerId: string) {
    try {
      const provider = await AIProvider.findById(providerId);
      if (!provider) {
        throw new Error(`Provider not found: ${providerId}`);
      }
      return provider;
    } catch (error) {
      console.error('Error getting provider config:', error);
      throw error;
    }
  }
}

export default new AIService(); 