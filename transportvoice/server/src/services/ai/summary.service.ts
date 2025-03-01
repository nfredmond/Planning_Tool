import axios from 'axios';
import AIProvider from '../../models/AIProvider';

/**
 * Generate a summary of text content using an AI provider
 * @param content - The text content to summarize
 * @returns A summary string
 */
export async function generateSummary(content: string): Promise<string> {
  try {
    // Get default AI provider from database
    const aiProvider = await AIProvider.findOne({ isDefault: true });
    
    if (!aiProvider) {
      throw new Error('No default AI provider configured');
    }
    
    switch (aiProvider.provider) {
      case 'openai':
        return await summarizeWithOpenAI(content, aiProvider.apiKey, aiProvider.model);
      case 'anthropic':
        return await summarizeWithAnthropic(content, aiProvider.apiKey, aiProvider.model);
      case 'huggingface':
        return await summarizeWithHuggingFace(content, aiProvider.apiKey, aiProvider.model);
      case 'custom':
        return await summarizeWithCustomProvider(content, aiProvider);
      default:
        throw new Error(`Unsupported AI provider: ${aiProvider.provider}`);
    }
  } catch (error) {
    console.error('AI summary generation failed:', error);
    return 'Summary generation failed. Please check the full comments for details.';
  }
}

/**
 * Generate a summary using OpenAI
 */
async function summarizeWithOpenAI(content: string, apiKey: string, model: string = 'gpt-4o'): Promise<string> {
  try {
    const prompt = `
      Analyze the following collection of public comments and provide a concise summary.
      Identify the main themes, concerns, and suggestions mentioned.
      Include statistics about sentiment (roughly what percentage seem positive, negative, or neutral).
      Keep the summary to 300 words or less.
      
      Comments to summarize:
      ${content}
    `;
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant that summarizes public feedback.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.5
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );
    
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI summary failed:', error);
    throw error;
  }
}

/**
 * Generate a summary using Anthropic
 */
async function summarizeWithAnthropic(content: string, apiKey: string, model: string = 'claude-3-opus-20240229'): Promise<string> {
  try {
    const prompt = `<instructions>
      Analyze the following collection of public comments and provide a concise summary.
      Identify the main themes, concerns, and suggestions mentioned.
      Include statistics about sentiment (roughly what percentage seem positive, negative, or neutral).
      Keep the summary to 300 words or less.
      </instructions>
      
      Comments to summarize:
      ${content}
    `;
    
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model,
        max_tokens: 500,
        temperature: 0.5,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        }
      }
    );
    
    return response.data.content[0].text.trim();
  } catch (error) {
    console.error('Anthropic summary failed:', error);
    throw error;
  }
}

/**
 * Generate a summary using HuggingFace
 */
async function summarizeWithHuggingFace(content: string, apiKey: string, model: string = 'facebook/bart-large-cnn'): Promise<string> {
  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        inputs: content,
        parameters: {
          max_length: 300,
          min_length: 100
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );
    
    // HuggingFace might return different formats based on the model
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data[0].summary_text || response.data[0];
    } else if (response.data.summary_text) {
      return response.data.summary_text;
    } else {
      return JSON.stringify(response.data).substring(0, 300);
    }
  } catch (error) {
    console.error('HuggingFace summary failed:', error);
    throw error;
  }
}

/**
 * Generate a summary using a custom provider
 */
async function summarizeWithCustomProvider(content: string, provider: any): Promise<string> {
  try {
    const { baseUrl, apiKey, model, settings } = provider;
    
    const response = await axios.post(
      baseUrl,
      {
        text: content,
        model,
        ...settings
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );
    
    // Extract summary based on provider's response format
    const result = response.data;
    
    if (settings.summaryMapping && result[settings.summaryMapping]) {
      return result[settings.summaryMapping];
    } else if (result.summary) {
      return result.summary;
    } else if (result.text) {
      return result.text;
    } else if (typeof result === 'string') {
      return result;
    } else {
      return JSON.stringify(result).substring(0, 300);
    }
  } catch (error) {
    console.error('Custom provider summary failed:', error);
    throw error;
  }
} 