import axios from 'axios';
import AIProvider from '../../models/AIProvider';

interface ModerationResult {
  score: number;  // 0-1 score, where higher = more concerning
  notes: string;
  categories?: {
    harassment: number;
    hate: number;
    selfHarm: number;
    sexual: number;
    violence: number;
    profanity: number;
    spam: number;
    other: number;
  };
}

/**
 * Moderate comment content using an AI service
 * @param content - The text content to moderate
 * @returns Moderation result with score and notes
 */
export async function moderateCommentWithAI(content: string): Promise<ModerationResult> {
  try {
    // Get default AI provider from database
    const aiProvider = await AIProvider.findOne({ isDefault: true });
    
    if (!aiProvider) {
      throw new Error('No default AI provider configured');
    }
    
    switch (aiProvider.provider) {
      case 'openai':
        return await moderateWithOpenAI(content, aiProvider.apiKey);
      case 'anthropic':
        return await moderateWithAnthropic(content, aiProvider.apiKey);
      case 'huggingface':
        return await moderateWithHuggingFace(content, aiProvider.apiKey);
      case 'custom':
        return await moderateWithCustomProvider(content, aiProvider);
      default:
        throw new Error(`Unsupported AI provider: ${aiProvider.provider}`);
    }
  } catch (error) {
    console.error('AI moderation failed:', error);
    
    // Return a neutral result if moderation fails
    return {
      score: 0.5,
      notes: 'Automatic moderation failed. Please review manually.',
    };
  }
}

/**
 * Moderate content using OpenAI's moderation API
 */
async function moderateWithOpenAI(content: string, apiKey: string): Promise<ModerationResult> {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/moderations',
      { input: content },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );
    
    const result = response.data.results[0];
    
    // Calculate overall score (average of all categories)
    const categories = result.category_scores;
    const overallScore = Object.values(categories).reduce((acc: number, score: any) => acc + score, 0) / Object.keys(categories).length;
    
    // Generate notes based on flagged categories
    let notes = '';
    if (result.flagged) {
      notes = 'Flagged categories: ';
      const flaggedCategories = Object.entries(result.categories)
        .filter(([_, flagged]) => flagged)
        .map(([category]) => category);
      notes += flaggedCategories.join(', ');
    } else {
      notes = 'No content policy violations detected.';
    }
    
    return {
      score: overallScore,
      notes,
      categories: {
        harassment: categories.harassment || 0,
        hate: categories.hate || 0,
        selfHarm: categories['self-harm'] || 0,
        sexual: categories.sexual || 0,
        violence: categories.violence || 0,
        profanity: categories.profanity || 0,
        spam: categories.spam || 0,
        other: categories.other || 0
      }
    };
  } catch (error) {
    console.error('OpenAI moderation failed:', error);
    throw error;
  }
}

/**
 * Moderate content using Anthropic's Claude API
 */
async function moderateWithAnthropic(content: string, apiKey: string): Promise<ModerationResult> {
  try {
    const prompt = `<instructions>
    You are a content moderation system. Analyze the following text and determine if it violates content policies.
    Rate the content on a scale from 0 to 1 for each category, where 0 means no violation and 1 means severe violation.
    Categories to evaluate: harassment, hate speech, self-harm, sexual content, violence, profanity, spam, and other policy violations.
    Provide an overall score from 0 to 1 where higher means more concerning.
    Provide brief notes explaining your rating.
    Return your assessment as a JSON object.
    </instructions>
    
    Content to moderate: """${content}"""`;
    
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
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
    
    // Extract the JSON from the response
    const responseText = response.data.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON response from Anthropic');
    }
    
    const moderationData = JSON.parse(jsonMatch[0]);
    
    return {
      score: moderationData.overallScore || 0.5,
      notes: moderationData.notes || 'No specific notes provided',
      categories: {
        harassment: moderationData.categories?.harassment || 0,
        hate: moderationData.categories?.hate || 0,
        selfHarm: moderationData.categories?.selfHarm || 0,
        sexual: moderationData.categories?.sexual || 0,
        violence: moderationData.categories?.violence || 0,
        profanity: moderationData.categories?.profanity || 0,
        spam: moderationData.categories?.spam || 0,
        other: moderationData.categories?.other || 0
      }
    };
  } catch (error) {
    console.error('Anthropic moderation failed:', error);
    throw error;
  }
}

/**
 * Moderate content using HuggingFace's API
 */
async function moderateWithHuggingFace(content: string, apiKey: string): Promise<ModerationResult> {
  try {
    // Using a HuggingFace toxicity model
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/unitary/unbiased-toxic-roberta',
      { inputs: content },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );
    
    const scores = response.data[0];
    
    // Calculate overall score as average of all toxicity scores
    const overallScore = Object.values(scores).reduce((acc: number, score: any) => acc + score, 0) / Object.keys(scores).length;
    
    // Generate notes based on high-scoring categories
    let notes = '';
    const highScoreCategories = Object.entries(scores)
      .filter(([_, score]) => (score as number) > 0.5)
      .map(([category]) => category);
    
    if (highScoreCategories.length > 0) {
      notes = `High toxicity detected in: ${highScoreCategories.join(', ')}`;
    } else {
      notes = 'No significant toxicity detected.';
    }
    
    return {
      score: overallScore,
      notes,
      categories: {
        harassment: scores.identity_attack || 0,
        hate: scores.identity_attack || 0,
        selfHarm: 0, // Not provided by this model
        sexual: scores.sexual_explicit || 0,
        violence: scores.threat || 0,
        profanity: scores.insult || 0,
        spam: 0, // Not provided by this model
        other: scores.toxicity || 0
      }
    };
  } catch (error) {
    console.error('HuggingFace moderation failed:', error);
    throw error;
  }
}

/**
 * Moderate content using a custom provider configured in the database
 */
async function moderateWithCustomProvider(content: string, provider: any): Promise<ModerationResult> {
  try {
    const { baseUrl, apiKey, settings } = provider;
    
    const response = await axios.post(
      baseUrl,
      {
        text: content,
        ...settings
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );
    
    // Since this is a custom provider, we need to adapt the response format
    // based on the expected structure defined in the provider settings
    const result = response.data;
    
    // Extract overall score and notes based on provider's response format
    const overallScore = settings.scoreMapping ? 
      result[settings.scoreMapping] : 
      (result.score || result.probability || 0.5);
    
    const notes = settings.notesMapping ? 
      result[settings.notesMapping] : 
      (result.notes || result.explanation || 'Custom moderation completed');
    
    return {
      score: overallScore,
      notes,
      // Map categories based on settings if available
      categories: settings.categoryMapping ? mapCategories(result, settings.categoryMapping) : undefined
    };
  } catch (error) {
    console.error('Custom provider moderation failed:', error);
    throw error;
  }
}

/**
 * Helper function to map custom provider category scores to standard format
 */
function mapCategories(result: any, mapping: Record<string, string>): Record<string, number> {
  const categories: Record<string, number> = {
    harassment: 0,
    hate: 0,
    selfHarm: 0,
    sexual: 0,
    violence: 0,
    profanity: 0,
    spam: 0,
    other: 0
  };
  
  for (const [standardKey, customKey] of Object.entries(mapping)) {
    if (standardKey in categories && customKey in result) {
      categories[standardKey as keyof typeof categories] = result[customKey];
    }
  }
  
  return categories;
} 