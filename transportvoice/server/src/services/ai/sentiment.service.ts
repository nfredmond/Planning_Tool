import axios from 'axios';
import AIProvider from '../../models/AIProvider';

interface SentimentResult {
  score: number;  // 0-1 score, where 0 = negative, 0.5 = neutral, 1 = positive
  label: 'positive' | 'neutral' | 'negative';
  confidence: number;
}

/**
 * Analyze the sentiment of text content
 * @param content - The text content to analyze
 * @returns A sentiment analysis result
 */
export async function analyzeSentiment(content: string): Promise<SentimentResult> {
  try {
    // Get default AI provider from database
    const aiProvider = await AIProvider.findOne({ isDefault: true });
    
    if (!aiProvider) {
      throw new Error('No default AI provider configured');
    }
    
    switch (aiProvider.provider) {
      case 'openai':
        return await analyzeSentimentWithOpenAI(content, aiProvider.apiKey, aiProvider.model);
      case 'anthropic':
        return await analyzeSentimentWithAnthropic(content, aiProvider.apiKey, aiProvider.model);
      case 'huggingface':
        return await analyzeSentimentWithHuggingFace(content, aiProvider.apiKey, aiProvider.model);
      case 'custom':
        return await analyzeSentimentWithCustomProvider(content, aiProvider);
      default:
        throw new Error(`Unsupported AI provider: ${aiProvider.provider}`);
    }
  } catch (error) {
    console.error('AI sentiment analysis failed:', error);
    
    // Return a neutral result if analysis fails
    return {
      score: 0.5,
      label: 'neutral',
      confidence: 0
    };
  }
}

/**
 * Analyze sentiment using OpenAI
 */
async function analyzeSentimentWithOpenAI(content: string, apiKey: string, model: string = 'gpt-3.5-turbo'): Promise<SentimentResult> {
  try {
    const prompt = `
      Analyze the sentiment of the following text. 
      Respond with a JSON object containing:
      1. "score": a number between 0 and 1, where 0 is most negative, 0.5 is neutral, and 1 is most positive
      2. "label": either "positive", "neutral", or "negative"
      3. "confidence": a number between 0 and 1 indicating your confidence in this assessment
      
      Text to analyze:
      ${content}
    `;
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model,
        messages: [
          { role: 'system', content: 'You are a sentiment analysis assistant that responds only with JSON.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.2
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );
    
    const responseText = response.data.choices[0].message.content.trim();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON response from OpenAI');
    }
    
    const sentimentData = JSON.parse(jsonMatch[0]);
    
    return {
      score: sentimentData.score || 0.5,
      label: sentimentData.label || 'neutral',
      confidence: sentimentData.confidence || 0.5
    };
  } catch (error) {
    console.error('OpenAI sentiment analysis failed:', error);
    throw error;
  }
}

/**
 * Analyze sentiment using Anthropic
 */
async function analyzeSentimentWithAnthropic(content: string, apiKey: string, model: string = 'claude-3-haiku-20240307'): Promise<SentimentResult> {
  try {
    const prompt = `<instructions>
      Analyze the sentiment of the following text.
      Respond with a JSON object containing:
      1. "score": a number between 0 and 1, where 0 is most negative, 0.5 is neutral, and 1 is most positive
      2. "label": either "positive", "neutral", or "negative"
      3. "confidence": a number between 0 and 1 indicating your confidence in this assessment
      
      Return only the JSON object with no additional text.
      </instructions>
      
      Text to analyze:
      ${content}
    `;
    
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model,
        max_tokens: 150,
        temperature: 0.2,
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
    
    const responseText = response.data.content[0].text.trim();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON response from Anthropic');
    }
    
    const sentimentData = JSON.parse(jsonMatch[0]);
    
    return {
      score: sentimentData.score || 0.5,
      label: sentimentData.label || 'neutral',
      confidence: sentimentData.confidence || 0.5
    };
  } catch (error) {
    console.error('Anthropic sentiment analysis failed:', error);
    throw error;
  }
}

/**
 * Analyze sentiment using HuggingFace
 */
async function analyzeSentimentWithHuggingFace(content: string, apiKey: string, model: string = 'distilbert-base-uncased-finetuned-sst-2-english'): Promise<SentimentResult> {
  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      { inputs: content },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );
    
    // HuggingFace sentiment models typically return probabilities for each class
    const result = response.data;
    
    if (Array.isArray(result) && result.length > 0) {
      // Handle case where result is an array (batch processing or multi-label)
      const predictions = result[0];
      
      let positiveScore = 0;
      let negativeScore = 0;
      
      // Most common format has POSITIVE and NEGATIVE labels
      if (predictions.find((p: any) => p.label === 'POSITIVE')) {
        const positive = predictions.find((p: any) => p.label === 'POSITIVE');
        const negative = predictions.find((p: any) => p.label === 'NEGATIVE');
        
        positiveScore = positive ? positive.score : 0;
        negativeScore = negative ? negative.score : 0;
      } 
      // Some models use 'LABEL_0' (negative) and 'LABEL_1' (positive)
      else if (predictions.find((p: any) => p.label === 'LABEL_1')) {
        const positive = predictions.find((p: any) => p.label === 'LABEL_1');
        positiveScore = positive ? positive.score : 0;
        negativeScore = 1 - positiveScore;
      }
      
      const score = positiveScore;
      const confidence = Math.max(positiveScore, negativeScore);
      let label: 'positive' | 'neutral' | 'negative';
      
      if (score > 0.66) {
        label = 'positive';
      } else if (score < 0.33) {
        label = 'negative';
      } else {
        label = 'neutral';
      }
      
      return { score, label, confidence };
    } else {
      // Default response if the format is unexpected
      return {
        score: 0.5,
        label: 'neutral',
        confidence: 0
      };
    }
  } catch (error) {
    console.error('HuggingFace sentiment analysis failed:', error);
    throw error;
  }
}

/**
 * Analyze sentiment using a custom provider
 */
async function analyzeSentimentWithCustomProvider(content: string, provider: any): Promise<SentimentResult> {
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
    
    // Extract sentiment based on provider's response format
    const result = response.data;
    
    // Map provider's response format to our standard format using settings
    const scoreMapping = settings.sentimentScoreMapping || 'score';
    const labelMapping = settings.sentimentLabelMapping || 'label';
    const confidenceMapping = settings.sentimentConfidenceMapping || 'confidence';
    
    const score = typeof result[scoreMapping] === 'number' ? result[scoreMapping] : 0.5;
    const confidence = typeof result[confidenceMapping] === 'number' ? result[confidenceMapping] : 0.5;
    
    let label: 'positive' | 'neutral' | 'negative' = 'neutral';
    
    // Try to parse the label from the result
    if (result[labelMapping] && typeof result[labelMapping] === 'string') {
      const labelValue = result[labelMapping].toLowerCase();
      
      if (labelValue.includes('positive')) {
        label = 'positive';
      } else if (labelValue.includes('negative')) {
        label = 'negative';
      }
    } 
    // If no label is available, infer from score
    else {
      if (score > 0.66) {
        label = 'positive';
      } else if (score < 0.33) {
        label = 'negative';
      }
    }
    
    return { score, label, confidence };
  } catch (error) {
    console.error('Custom provider sentiment analysis failed:', error);
    throw error;
  }
} 