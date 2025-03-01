/**
 * Interface representing a comment type in the application
 */
export interface ICommentType {
  _id: string;
  name: string;
  description: string;
  icon: string; // SVG string
  iconGeneratedByAI: boolean;
  iconPrompt?: string;
  color: string;
  projectTypes: string[]; // Array of project type slugs
  isGlobal: boolean;
  createdAt: string;
  updatedAt: string;
} 