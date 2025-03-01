// client/src/services/commentService.ts
import api from './api';
import { Comment } from '../types/Comment';

// Get API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface CreateCommentData {
  projectId: string;
  content: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  category?: string;
  images?: string[];
  anonymousName?: string;
  isAnonymous?: boolean;
  parentCommentId?: string;
}

interface CommentQueryParams {
  projectId: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  filterCategory?: string;
  searchTerm?: string;
  parentCommentId?: string | null;
}

export const getComments = async (params: CommentQueryParams): Promise<{
  comments: Comment[];
  totalCount: number;
  totalPages: number;
}> => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add all params to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/comments?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export const getComment = async (commentId: string): Promise<Comment> => {
  try {
    const response = await api.get(`/comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching comment ${commentId}:`, error);
    throw error;
  }
};

export const createComment = async (data: CreateCommentData): Promise<Comment> => {
  try {
    const response = await api.post('/comments', data);
    return response.data;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

export const updateComment = async (commentId: string, data: Partial<CreateCommentData>): Promise<Comment> => {
  try {
    const response = await api.put(`/comments/${commentId}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating comment ${commentId}:`, error);
    throw error;
  }
};

export const deleteComment = async (commentId: string): Promise<void> => {
  try {
    await api.delete(`/comments/${commentId}`);
  } catch (error) {
    console.error(`Error deleting comment ${commentId}:`, error);
    throw error;
  }
};

export const voteComment = async (commentId: string, voteType: 'up' | 'down'): Promise<Comment> => {
  try {
    const response = await api.post(`/comments/${commentId}/vote`, { voteType });
    return response.data;
  } catch (error) {
    console.error(`Error voting on comment ${commentId}:`, error);
    throw error;
  }
};

export const flagComment = async (commentId: string, reason: string): Promise<void> => {
  try {
    await api.post(`/comments/${commentId}/flag`, { reason }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(`Error flagging comment with ID ${commentId}:`, error);
    throw error;
  }
};

export const uploadCommentImages = async (files: File[]): Promise<string[]> => {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    const response = await api.post('/comments/upload-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.imageUrls;
  } catch (error) {
    console.error('Error uploading comment images:', error);
    throw error;
  }
}; 