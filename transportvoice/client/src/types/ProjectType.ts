import { ICommentType } from './CommentType';

/**
 * Interface representing a project type in the application
 */
export interface IProjectType {
  _id: string;
  name: string;
  description: string;
  slug: string;
  defaultCommentTypes: ICommentType[] | string[];
  createdAt: string;
  updatedAt: string;
} 