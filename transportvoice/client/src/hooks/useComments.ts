import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';
import { Comment as UIComment } from '../types/Comment';
import * as commentService from '../services/commentService';

// Define the API Comment interface
interface APIComment {
  id: string;
  projectId: string;
  locationId?: string;
  userId: string;
  userName: string;
  content: string;
  audioUrl?: string;
  transcript?: string;
  createdAt: string;
  updatedAt: string;
  reactions?: {
    type: string;
    count: number;
    userReacted: boolean;
  }[];
  replies?: APIComment[];
}

// Function to convert API Comment to UI Comment
const mapAPICommentToUIComment = (apiComment: APIComment): UIComment => {
  return {
    _id: apiComment.id,
    project: apiComment.projectId,
    user: apiComment.userId ? {
      _id: apiComment.userId,
      firstName: apiComment.userName.split(' ')[0] || '',
      lastName: apiComment.userName.split(' ')[1] || '',
      email: ''
    } : undefined,
    anonymous: !apiComment.userId,
    anonymousName: !apiComment.userId ? apiComment.userName : undefined,
    location: {
      type: 'Point',
      coordinates: [0, 0] // Default coordinates, should be updated with actual data
    },
    content: apiComment.content,
    images: [],
    category: 'general',
    status: 'approved',
    aiModerated: false,
    votes: {
      upvotes: apiComment.reactions?.find(r => r.type === 'upvote')?.count || 0,
      downvotes: apiComment.reactions?.find(r => r.type === 'downvote')?.count || 0,
      voters: []
    },
    replies: apiComment.replies ? apiComment.replies.map(reply => reply.id) : [],
    createdAt: apiComment.createdAt,
    updatedAt: apiComment.updatedAt
  };
};

// Function to convert UI Comment to API Comment
const mapUICommentToAPIComment = (uiComment: UIComment): APIComment => {
  return {
    id: uiComment._id,
    projectId: typeof uiComment.project === 'string' ? uiComment.project : uiComment.project._id,
    userId: uiComment.user?._id || '',
    userName: uiComment.user 
      ? `${uiComment.user.firstName} ${uiComment.user.lastName}`
      : uiComment.anonymousName || 'Anonymous',
    content: uiComment.content,
    createdAt: uiComment.createdAt,
    updatedAt: uiComment.updatedAt,
    reactions: [
      { 
        type: 'upvote', 
        count: uiComment.votes.upvotes, 
        userReacted: false 
      },
      { 
        type: 'downvote', 
        count: uiComment.votes.downvotes, 
        userReacted: false 
      }
    ],
    replies: []
  };
};

interface AddCommentParams {
  projectId: string;
  locationId?: string;
  content: string;
}

interface AddVoiceCommentParams {
  projectId: string;
  locationId?: string;
  audioBlob: Blob;
  transcript?: string;
}

interface AddReplyParams {
  commentId: string;
  content: string;
}

interface AddReactionParams {
  commentId: string;
  reactionType: string;
}

interface UseCommentsProps {
  projectId: string;
  initialPage?: number;
  initialPageSize?: number;
  initialSortBy?: string;
  initialFilterCategory?: string;
  initialSearchTerm?: string;
  parentCommentId?: string | null;
}

interface UseCommentsReturn {
  comments: UIComment[];
  loading: boolean;
  error: Error | null;
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
  sortBy: string;
  filterCategory: string;
  searchTerm: string;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSortBy: (sortBy: string) => void;
  setFilterCategory: (category: string) => void;
  setSearchTerm: (term: string) => void;
  fetchComments: () => Promise<void>;
  refreshComments: () => Promise<void>;
  getCommentById: (commentId: string) => Promise<UIComment>;
  createComment: (data: {
    content: string;
    location?: { type: string; coordinates: [number, number] };
    category?: string;
    images?: string[];
    anonymousName?: string;
    isAnonymous?: boolean;
  }) => Promise<UIComment>;
  updateComment: (commentId: string, data: Partial<{
    content: string;
    category?: string;
    images?: string[];
  }>) => Promise<UIComment>;
  deleteComment: (commentId: string) => Promise<void>;
  voteComment: (commentId: string, voteType: 'up' | 'down') => Promise<UIComment>;
  flagComment: (commentId: string, reason: string) => Promise<void>;
}

export const useComments = ({
  projectId,
  initialPage = 1,
  initialPageSize = 10,
  initialSortBy = 'createdAt:desc',
  initialFilterCategory = '',
  initialSearchTerm = '',
  parentCommentId = null
}: UseCommentsProps): UseCommentsReturn => {
  const [comments, setComments] = useState<UIComment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [page, setPage] = useState<number>(initialPage);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [sortBy, setSortBy] = useState<string>(initialSortBy);
  const [filterCategory, setFilterCategory] = useState<string>(initialFilterCategory);
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await commentService.getComments({
        projectId,
        page,
        pageSize,
        sortBy,
        filterCategory,
        searchTerm,
        parentCommentId
      });
      
      setComments(result.comments);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId, page, pageSize, sortBy, filterCategory, searchTerm, parentCommentId]);

  // Initial fetch
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const refreshComments = useCallback(async () => {
    await fetchComments();
  }, [fetchComments]);

  const getCommentById = useCallback(async (commentId: string): Promise<UIComment> => {
    try {
      return await commentService.getCommentById(commentId);
    } catch (err) {
      console.error(`Error fetching comment with ID ${commentId}:`, err);
      throw err;
    }
  }, []);

  const createComment = useCallback(async (data: {
    content: string;
    location?: { type: string; coordinates: [number, number] };
    category?: string;
    images?: string[];
    anonymousName?: string;
    isAnonymous?: boolean;
  }): Promise<UIComment> => {
    try {
      const newComment = await commentService.createComment({
        projectId,
        ...data,
        parentCommentId: parentCommentId || undefined
      });
      
      // Refresh comments to include the new one
      await refreshComments();
      
      return newComment;
    } catch (err) {
      console.error('Error creating comment:', err);
      throw err;
    }
  }, [projectId, parentCommentId, refreshComments]);

  const updateComment = useCallback(async (commentId: string, data: Partial<{
    content: string;
    category?: string;
    images?: string[];
  }>): Promise<UIComment> => {
    try {
      const updatedComment = await commentService.updateComment(commentId, data);
      
      // Update the comment in the local state
      setComments(prevComments => 
        prevComments.map(comment => 
          comment._id === commentId ? updatedComment : comment
        )
      );
      
      return updatedComment;
    } catch (err) {
      console.error(`Error updating comment with ID ${commentId}:`, err);
      throw err;
    }
  }, []);

  const deleteComment = useCallback(async (commentId: string): Promise<void> => {
    try {
      await commentService.deleteComment(commentId);
      
      // Remove the comment from the local state
      setComments(prevComments => 
        prevComments.filter(comment => comment._id !== commentId)
      );
      
      // Update total count
      setTotalCount(prevCount => prevCount - 1);
    } catch (err) {
      console.error(`Error deleting comment with ID ${commentId}:`, err);
      throw err;
    }
  }, []);

  const voteComment = useCallback(async (commentId: string, voteType: 'up' | 'down'): Promise<UIComment> => {
    try {
      const updatedComment = await commentService.voteComment(commentId, voteType);
      
      // Update the comment in the local state
      setComments(prevComments => 
        prevComments.map(comment => 
          comment._id === commentId ? updatedComment : comment
        )
      );
      
      return updatedComment;
    } catch (err) {
      console.error(`Error voting on comment with ID ${commentId}:`, err);
      throw err;
    }
  }, []);

  const flagComment = useCallback(async (commentId: string, reason: string): Promise<void> => {
    try {
      await commentService.flagComment(commentId, reason);
      
      // Optionally update UI to show the comment has been flagged
      // This depends on your UI requirements
    } catch (err) {
      console.error(`Error flagging comment with ID ${commentId}:`, err);
      throw err;
    }
  }, []);

  return {
    comments,
    loading,
    error,
    totalCount,
    totalPages,
    page,
    pageSize,
    sortBy,
    filterCategory,
    searchTerm,
    setPage,
    setPageSize,
    setSortBy,
    setFilterCategory,
    setSearchTerm,
    fetchComments,
    refreshComments,
    getCommentById,
    createComment,
    updateComment,
    deleteComment,
    voteComment,
    flagComment
  };
};

export default useComments; 