import { ICommentType } from '../../models/CommentType';
import AiService from './AiService';

interface IconGenerationOptions {
  prompt: string;
  style?: 'minimal' | 'detailed' | 'outline';
  color?: string;
  size?: 'small' | 'medium' | 'large';
}

class IconGeneratorService {
  private aiService: AiService;

  constructor(aiService: AiService) {
    this.aiService = aiService;
  }

  /**
   * Generate an SVG icon using AI based on a text prompt
   */
  async generateSvgIcon(options: IconGenerationOptions): Promise<string> {
    const { prompt, style = 'minimal', color = '#000000', size = 'medium' } = options;

    // Create a detailed prompt for the AI to generate an SVG icon
    const fullPrompt = `
      Generate a clean SVG icon for a transportation planning map based on this description: "${prompt}".
      Style: ${style === 'minimal' ? 'Simple and minimalist with clean lines' : 
             style === 'detailed' ? 'Moderately detailed but still clean' : 
             'Basic outline style with minimal fills'}
      Size: The icon should be designed for a ${size} map marker.
      
      The SVG should:
      - Use a viewBox of "0 -960 960 960" (Material Design style)
      - Have a width and height of 24px
      - Be a single color that can be styled with CSS fill
      - Have clean, optimized path commands
      - Be appropriate for a transportation planning context
      - NOT include any text
      - Be simple enough to render well at small sizes on a map
      - Follow accessibility best practices

      Return ONLY valid SVG code without any explanation or markdown formatting.
    `;

    // Call the AI to generate the SVG code
    const response = await this.aiService.generateContent(fullPrompt);

    // Extract just the SVG code from the response
    const svgCode = this.extractSvgFromResponse(response);
    
    // Post-process the SVG to ensure it meets our requirements
    return this.postProcessSvg(svgCode, color);
  }

  /**
   * Extract just the SVG code from the AI response
   */
  private extractSvgFromResponse(response: string): string {
    // Try to extract content between SVG tags if present
    const svgMatch = response.match(/<svg[\s\S]*?<\/svg>/);
    if (svgMatch) {
      return svgMatch[0];
    }

    // If no SVG tags found, clean up the response as best as possible
    // Remove markdown code blocks if present
    const cleanedResponse = response.replace(/```svg/g, '').replace(/```/g, '');
    
    return cleanedResponse.trim();
  }

  /**
   * Post-process the SVG to ensure it meets our requirements
   */
  private postProcessSvg(svg: string, color: string): string {
    // Ensure the SVG has the correct viewBox if not already present
    if (!svg.includes('viewBox="0 -960 960 960"')) {
      svg = svg.replace(/<svg/, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width="24" height="24"');
    }
    
    // Remove any fill attributes so the icon can be colored via CSS
    svg = svg.replace(/fill="[^"]*"/g, '');
    
    // Add the xmlns attribute if not present
    if (!svg.includes('xmlns=')) {
      svg = svg.replace(/<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    
    // Ensure height and width are set
    if (!svg.includes('width=')) {
      svg = svg.replace(/<svg/, '<svg width="24"');
    }
    if (!svg.includes('height=')) {
      svg = svg.replace(/<svg/, '<svg height="24"');
    }
    
    return svg;
  }

  /**
   * Validate that an SVG string is properly formatted
   */
  validateSvg(svg: string): boolean {
    return (
      svg.startsWith('<svg') && 
      svg.endsWith('</svg>') && 
      svg.includes('viewBox')
    );
  }
}

export default IconGeneratorService; 