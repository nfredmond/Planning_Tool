// client/src/hooks/useCommentsHook.ts
import { useState, useCallback, useEffect } from 'react';
import { Comment } from '../types/Comment';
import * as commentService from '../services/commentService';

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
  comments: Comment[];
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
  getCommentById: (commentId: string) => Promise<Comment>;
  createComment: (data: {
    content: string;
    location?: { type: string; coordinates: [number, number] };
    category?: string;
    images?: string[];
    anonymousName?: string;
    isAnonymous?: boolean;
  }) => Promise<Comment>;
  updateComment: (commentId: string, data: Partial<{
    content: string;
    category?: string;
    images?: string[];
  }>) => Promise<Comment>;
  deleteComment: (commentId: string) => Promise<void>;
  voteComment: (commentId: string, voteType: 'up' | 'down') => Promise<Comment>;
  flagComment: (commentId: string, reason: string) => Promise<void>;
}

export const useCommentsHook = ({
  projectId,
  initialPage = 1,
  initialPageSize = 10,
  initialSortBy = 'createdAt:desc',
  initialFilterCategory = '',
  initialSearchTerm = '',
  parentCommentId = null
}: UseCommentsProps): UseCommentsReturn => {
  const [comments, setComments] = useState<Comment[]>([]);
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

  const getCommentById = useCallback(async (commentId: string): Promise<Comment> => {
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
  }): Promise<Comment> => {
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
  }>): Promise<Comment> => {
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

  const voteComment = useCallback(async (commentId: string, voteType: 'up' | 'down'): Promise<Comment> => {
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