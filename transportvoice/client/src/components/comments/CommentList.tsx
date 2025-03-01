// client/src/components/comments/CommentList.tsx
import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useCommentsHook } from '../../hooks/useCommentsHook';
import { Comment } from '../../types/Comment';
import CommentDetailDrawer from './CommentDetailDrawer';
import CommentItem from './CommentItem';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Pagination, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
  Button
} from '@mui/material';
import { FaSearch } from 'react-icons/fa';
import IconWrapper from '../common/IconWrapper';
import { SelectChangeEvent } from '@mui/material/Select';

interface CommentListProps {
  projectId: string;
  maxHeight?: string | number;
}

type SortByType = 'newest' | 'oldest' | 'upvotes';

const CommentList: React.FC<CommentListProps> = ({ projectId, maxHeight }) => {
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<SortByType>('newest');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    comments,
    loading,
    error,
    totalCount,
    totalPages,
    fetchComments,
  } = useCommentsHook({
    projectId,
    initialPage: page,
    initialPageSize: pageSize,
    initialSortBy: sortBy === 'newest' ? 'createdAt:desc' : sortBy === 'oldest' ? 'createdAt:asc' : 'votes.upvotes:desc',
    initialFilterCategory: filterCategory,
    initialSearchTerm: searchTerm
  });
  
  // Fetch comments when filters change
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);
  
  const handleCommentClick = (commentId: string) => {
    setSelectedCommentId(commentId);
  };
  
  const handleCloseDrawer = () => {
    setSelectedCommentId(null);
  };
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  
  const handleSortChange = (event: SelectChangeEvent<SortByType>) => {
    setSortBy(event.target.value as SortByType);
  };
  
  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    setFilterCategory(event.target.value);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    fetchComments();
  };
  
  // Get unique categories from comments
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    comments.forEach(comment => {
      if (comment.category) {
        uniqueCategories.add(comment.category);
      }
    });
    return Array.from(uniqueCategories);
  }, [comments]);
  
  return (
    <Container maxHeight={maxHeight}>
      <Header>
        <FiltersContainer>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ mr: 2 }}>
              Comments ({totalCount})
            </Typography>
            
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120, mr: 2 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={handleSortChange}
              >
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="oldest">Oldest</MenuItem>
                <MenuItem value="upvotes">Most Upvotes</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                label="Category"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <form onSubmit={handleSearchSubmit}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Search comments..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton type="submit" edge="end">
                      <IconWrapper icon={FaSearch} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />
          </form>
        </FiltersContainer>
      </Header>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <ErrorMessage>
          <p>{error.message || 'An error occurred while loading comments.'}</p>
          <Button variant="outlined" onClick={() => fetchComments()} sx={{ mt: 2 }}>
            Try Again
          </Button>
        </ErrorMessage>
      ) : comments.length === 0 ? (
        <EmptyState>
          <Typography variant="body1" color="text.secondary">
            No comments found. Be the first to comment!
          </Typography>
        </EmptyState>
      ) : (
        <>
          <CommentsContainer>
            {comments.map(comment => (
              <CommentItem 
                key={comment._id} 
                comment={comment} 
                onClick={handleCommentClick} 
              />
            ))}
          </CommentsContainer>
          
          {totalPages > 1 && (
            <PaginationContainer>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </PaginationContainer>
          )}
        </>
      )}
      
      {selectedCommentId && comments.length > 0 && (
        <CommentDetailDrawer
          comment={comments.find(c => c._id === selectedCommentId)!}
          open={!!selectedCommentId}
          onClose={handleCloseDrawer}
        />
      )}
    </Container>
  );
};

const Container = styled.div<{ maxHeight?: string | number }>`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  max-height: ${props => props.maxHeight || 'auto'};
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
`;

const Header = styled.div`
  margin-bottom: 16px;
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const CommentsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 24px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 32px 0;
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: #d32f2f;
  padding: 32px 0;
`;

export default CommentList; 