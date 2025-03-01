import React from 'react';
import styled from 'styled-components';
import { Comment } from '../../types/Comment';
import { formatDistanceToNow } from 'date-fns';
import { 
  Card, 
  CardContent, 
  Typography, 
  Avatar, 
  Box, 
  Chip,
  IconButton
} from '@mui/material';
import { FaThumbsUp, FaThumbsDown, FaReply, FaEllipsisV } from 'react-icons/fa';
import IconWrapper from '../common/IconWrapper';

interface CommentItemProps {
  comment: Comment;
  onClick: (commentId: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onClick }) => {
  const handleVote = (e: React.MouseEvent, type: 'up' | 'down') => {
    e.stopPropagation();
    // API call to vote would go here
    console.log(`Voting ${type} on comment ${comment._id}`);
  };

  return (
    <CommentCard onClick={() => onClick(comment._id)}>
      <CardContent>
        <CommentHeader>
          <Avatar sx={{ width: 40, height: 40 }}>
            {comment.user ?
              comment.user.firstName?.charAt(0) + comment.user.lastName?.charAt(0) :
              comment.anonymousName?.charAt(0) || 'A'
            }
          </Avatar>
          
          <CommentHeaderInfo>
            <Typography variant="subtitle2">
              {comment.user ?
                `${comment.user.firstName} ${comment.user.lastName}` :
                comment.anonymousName || 'Anonymous'
              }
            </Typography>
            
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </Typography>
          </CommentHeaderInfo>
          
          <Box>
            <IconButton size="small">
              <IconWrapper icon={FaEllipsisV} />
            </IconButton>
          </Box>
        </CommentHeader>
        
        {comment.category && (
          <Box sx={{ mb: 1 }}>
            <Chip 
              size="small" 
              color="primary" 
              variant="outlined"
              label={comment.category}
            />
          </Box>
        )}
        
        <Typography variant="body2" sx={{ mb: 1 }}>
          {comment.content.length > 200 
            ? `${comment.content.substring(0, 200)}...` 
            : comment.content}
        </Typography>
        
        {comment.images && comment.images.length > 0 && (
          <ImagePreview>
            <img 
              src={comment.images[0]} 
              alt="Comment attachment" 
            />
            {comment.images.length > 1 && (
              <MoreImagesOverlay>
                <Typography variant="body2" color="white">
                  +{comment.images.length - 1} more
                </Typography>
              </MoreImagesOverlay>
            )}
          </ImagePreview>
        )}
        
        <ActionBar>
          <ActionButton onClick={(e) => handleVote(e, 'up')}>
            <IconWrapper icon={FaThumbsUp} />
            <span>{comment.votes.upvotes}</span>
          </ActionButton>
          
          <ActionButton onClick={(e) => handleVote(e, 'down')}>
            <IconWrapper icon={FaThumbsDown} />
            <span>{comment.votes.downvotes}</span>
          </ActionButton>
          
          <ActionButton>
            <IconWrapper icon={FaReply} />
            <span>{comment.replies?.length || 0}</span>
          </ActionButton>
        </ActionBar>
      </CardContent>
    </CommentCard>
  );
};

const CommentCard = styled(Card)`
  margin-bottom: 16px;
  cursor: pointer;
  transition: box-shadow 0.2s ease-in-out;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CommentHeader = styled(Box)`
  display: flex;
  margin-bottom: 12px;
`;

const CommentHeaderInfo = styled(Box)`
  margin-left: 12px;
  flex: 1;
`;

const ImagePreview = styled.div`
  position: relative;
  margin-bottom: 12px;
  
  img {
    width: 100%;
    max-height: 200px;
    object-fit: cover;
    border-radius: 4px;
  }
`;

const MoreImagesOverlay = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 40%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 4px 4px 0;
`;

const ActionBar = styled.div`
  display: flex;
  margin-top: 8px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  padding: 4px 8px;
  margin-right: 16px;
  cursor: pointer;
  color: #555;
  font-size: 14px;
  
  &:hover {
    color: #000;
  }
  
  span {
    margin-left: 4px;
  }
`;

export default CommentItem; 