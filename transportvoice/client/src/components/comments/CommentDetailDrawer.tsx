import React, { useState } from 'react';
import styled from 'styled-components';
import { Comment } from '../../types/Comment';
import { formatDistanceToNow } from 'date-fns';
import { 
  Drawer, 
  Box, 
  Typography, 
  Avatar, 
  Divider, 
  Button, 
  TextField,
  IconButton,
  Chip
} from '@mui/material';
import { FaTimes, FaThumbsUp, FaThumbsDown, FaFlag, FaShareAlt, FaFacebook, FaTwitter, FaReply } from 'react-icons/fa';
import IconWrapper from '../common/IconWrapper';

interface CommentDetailDrawerProps {
  comment: Comment;
  open: boolean;
  onClose: () => void;
}

const CommentDetailDrawer: React.FC<CommentDetailDrawerProps> = ({ comment, open, onClose }) => {
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  
  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyContent.trim()) return;
    
    setIsSubmittingReply(true);
    
    try {
      // API call to submit reply would go here
      console.log('Submitting reply:', replyContent);
      
      // Clear form and hide it
      setReplyContent('');
      setShowReplyForm(false);
    } catch (err) {
      console.error('Error submitting reply:', err);
    } finally {
      setIsSubmittingReply(false);
    }
  };
  
  const handleVote = (type: 'up' | 'down') => {
    // API call to vote would go here
    console.log(`Voting ${type} on comment ${comment._id}`);
  };
  
  const handleFlag = () => {
    // API call to flag comment would go here
    console.log(`Flagging comment ${comment._id}`);
  };
  
  const handleShare = (platform: 'facebook' | 'twitter' | 'copy') => {
    // Share functionality would go here
    console.log(`Sharing comment ${comment._id} on ${platform}`);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 } }
      }}
    >
      <DrawerHeader>
        <Typography variant="h6">Comment Details</Typography>
        <IconButton onClick={onClose} size="large">
          <IconWrapper icon={FaTimes} />
        </IconButton>
      </DrawerHeader>
      
      <DrawerContent>
        <CommentHeader>
          <Avatar sx={{ width: 50, height: 50 }}>
            {comment.user ?
              comment.user.firstName?.charAt(0) + comment.user.lastName?.charAt(0) :
              comment.anonymousName?.charAt(0) || 'A'
            }
          </Avatar>
          
          <CommentHeaderInfo>
            <Typography variant="subtitle1">
              {comment.user ?
                `${comment.user.firstName} ${comment.user.lastName}` :
                comment.anonymousName || 'Anonymous'
              }
            </Typography>
            
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </Typography>
            
            <Chip 
              size="small" 
              color="primary" 
              variant="outlined"
              label={comment.category || 'General'}
              sx={{ mt: 0.5 }}
            />
          </CommentHeaderInfo>
        </CommentHeader>
        
        <CommentBody>
          <Typography variant="body1" paragraph>
            {comment.content}
          </Typography>
          
          {comment.images && comment.images.length > 0 && (
            <ImageGallery>
              {comment.images.map((image, index) => (
                <img 
                  key={index} 
                  src={image} 
                  alt={`Comment image ${index + 1}`} 
                />
              ))}
            </ImageGallery>
          )}
        </CommentBody>
        
        <ActionBar>
          <ActionButton onClick={() => handleVote('up')}>
            <IconWrapper icon={FaThumbsUp} />
            <span>{comment.votes.upvotes}</span>
          </ActionButton>
          
          <ActionButton onClick={() => handleVote('down')}>
            <IconWrapper icon={FaThumbsDown} />
            <span>{comment.votes.downvotes}</span>
          </ActionButton>
          
          <ActionButton onClick={() => setShowReplyForm(!showReplyForm)}>
            <IconWrapper icon={FaReply} />
            <span>Reply</span>
          </ActionButton>
          
          <ActionButton onClick={handleFlag}>
            <IconWrapper icon={FaFlag} />
            <span>Flag</span>
          </ActionButton>
          
          <ShareDropdown>
            <ActionButton>
              <IconWrapper icon={FaShareAlt} />
              <span>Share</span>
            </ActionButton>
            
            <ShareOptions>
              <ShareOption onClick={() => handleShare('facebook')}>
                <IconWrapper icon={FaFacebook} />
                <span>Facebook</span>
              </ShareOption>
              
              <ShareOption onClick={() => handleShare('twitter')}>
                <IconWrapper icon={FaTwitter} />
                <span>Twitter</span>
              </ShareOption>
              
              <ShareOption onClick={() => handleShare('copy')}>
                <span>Copy Link</span>
              </ShareOption>
            </ShareOptions>
          </ShareDropdown>
        </ActionBar>
        
        {showReplyForm && (
          <ReplyForm onSubmit={handleReplySubmit}>
            <TextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              placeholder="Write your reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              disabled={isSubmittingReply}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button 
                variant="outlined" 
                onClick={() => setShowReplyForm(false)}
                disabled={isSubmittingReply}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmittingReply || !replyContent.trim()}
              >
                {isSubmittingReply ? 'Submitting...' : 'Reply'}
              </Button>
            </Box>
          </ReplyForm>
        )}
        
        {comment.replies && comment.replies.length > 0 && (
          <RepliesSection>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Replies ({comment.replies.length})
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            {/* Replies would be rendered here */}
            <Typography variant="body2" color="text.secondary">
              Replies functionality to be implemented
            </Typography>
          </RepliesSection>
        )}
      </DrawerContent>
    </Drawer>
  );
};

const DrawerHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
`;

const DrawerContent = styled(Box)`
  padding: 16px;
  overflow-y: auto;
`;

const CommentHeader = styled(Box)`
  display: flex;
  margin-bottom: 16px;
`;

const CommentHeaderInfo = styled(Box)`
  margin-left: 12px;
  flex: 1;
`;

const CommentBody = styled(Box)`
  margin-bottom: 16px;
`;

const ImageGallery = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
  margin-bottom: 16px;
  
  img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 4px;
    cursor: pointer;
  }
`;

const ActionBar = styled.div`
  display: flex;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  padding: 8px 0;
  margin-bottom: 16px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  color: #555;
  font-size: 14px;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
  }
  
  span {
    margin-left: 6px;
  }
`;

const ShareDropdown = styled.div`
  position: relative;
  
  &:hover > div {
    display: block;
  }
`;

const ShareOptions = styled.div`
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  z-index: 10;
  min-width: 150px;
`;

const ShareOption = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  span {
    margin-left: 8px;
  }
`;

const ReplyForm = styled.form`
  margin-bottom: 16px;
`;

const RepliesSection = styled.div`
  margin-top: 24px;
`;

export default CommentDetailDrawer; 