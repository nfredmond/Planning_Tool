import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  IconButton,
  Button,
  TextField,
  Paper,
  Chip,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  ListItemIcon
} from '@mui/material';
import {
  Close as CloseIcon,
  MoreVert as MoreIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  AddComment as AddCommentIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  LocationOn as LocationIcon,
  AccountCircle as UserIcon
} from '@mui/icons-material';
import { DesignComment } from '../../types/Design';
import { deleteDesignComment, updateDesignComment } from '../../services/designService';
import { formatDistanceToNow } from 'date-fns';

interface DesignCommentsProps {
  comments: DesignComment[];
  designId: string;
  onClose: () => void;
  onAddComment: () => void;
  onCommentDeleted?: (commentId: string) => void;
  onCommentUpdated?: (comment: DesignComment) => void;
}

const DesignComments: React.FC<DesignCommentsProps> = ({
  comments,
  designId,
  onClose,
  onAddComment,
  onCommentDeleted,
  onCommentUpdated
}) => {
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState<string>('');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  
  // Handle opening comment menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, commentId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedCommentId(commentId);
  };
  
  // Handle closing comment menu
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedCommentId(null);
  };
  
  // Handle editing a comment
  const handleEditComment = (comment: DesignComment) => {
    setEditingCommentId(comment._id || null);
    setEditCommentText(comment.text);
    handleMenuClose();
  };
  
  // Handle deleting a comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteDesignComment(commentId);
      if (onCommentDeleted) {
        onCommentDeleted(commentId);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
    handleMenuClose();
  };
  
  // Handle saving edited comment
  const handleSaveComment = async (commentId: string) => {
    try {
      const updatedComment = await updateDesignComment(commentId, { text: editCommentText });
      if (onCommentUpdated) {
        onCommentUpdated(updatedComment);
      }
      setEditingCommentId(null);
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };
  
  // Handle voting on a comment
  const handleVote = async (commentId: string, vote: 'up' | 'down') => {
    try {
      const comment = comments.find(c => c._id === commentId);
      if (!comment) return;
      
      // Implement logic to track user votes and update the vote count
      const updatedComment = await updateDesignComment(commentId, {
        votes: {
          up: vote === 'up' ? (comment.votes?.up || 0) + 1 : (comment.votes?.up || 0),
          down: vote === 'down' ? (comment.votes?.down || 0) + 1 : (comment.votes?.down || 0),
          voters: [] // In a real implementation, track the current user's vote
        }
      });
      
      if (onCommentUpdated) {
        onCommentUpdated(updatedComment);
      }
    } catch (error) {
      console.error('Error voting on comment:', error);
    }
  };
  
  // Format comment date
  const formatCommentDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Unknown date';
    }
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Comments <Chip label={comments.length} size="small" color="primary" />
        </Typography>
        <Box>
          <Tooltip title="Add Comment">
            <IconButton onClick={onAddComment} color="primary">
              <AddCommentIcon />
            </IconButton>
          </Tooltip>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Divider />
      
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
        {comments.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No comments yet. Click the add button to start the conversation.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {comments.map((comment) => (
              <Paper 
                key={comment._id} 
                variant="outlined" 
                sx={{ mb: 2, overflow: 'hidden' }}
              >
                <ListItem
                  alignItems="flex-start"
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      size="small"
                      onClick={(e) => handleMenuOpen(e, comment._id || '')}
                    >
                      <MoreIcon />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar>
                      <UserIcon />
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle2">
                          {comment.userName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatCommentDate(comment.createdAt)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      editingCommentId === comment._id ? (
                        <Box sx={{ mt: 1 }}>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            size="small"
                            variant="outlined"
                          />
                          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button 
                              size="small" 
                              onClick={() => setEditingCommentId(null)}
                              sx={{ mr: 1 }}
                            >
                              Cancel
                            </Button>
                            <Button 
                              size="small" 
                              variant="contained" 
                              onClick={() => handleSaveComment(comment._id || '')}
                            >
                              Save
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Box>
                          <Typography 
                            variant="body2" 
                            color="text.primary"
                            sx={{ whiteSpace: 'pre-wrap', mb: 1 }}
                          >
                            {comment.text}
                          </Typography>
                          
                          {comment.location && (
                            <Chip
                              icon={<LocationIcon fontSize="small" />}
                              label="Has location"
                              size="small"
                              variant="outlined"
                              sx={{ mr: 1, mb: 1 }}
                            />
                          )}
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <IconButton 
                              size="small" 
                              onClick={() => handleVote(comment._id || '', 'up')}
                            >
                              <Badge 
                                badgeContent={comment.votes?.up || 0} 
                                color="primary"
                                showZero={false}
                              >
                                <ThumbUpIcon fontSize="small" />
                              </Badge>
                            </IconButton>
                            
                            <IconButton 
                              size="small" 
                              onClick={() => handleVote(comment._id || '', 'down')}
                            >
                              <Badge 
                                badgeContent={comment.votes?.down || 0} 
                                color="error"
                                showZero={false}
                              >
                                <ThumbDownIcon fontSize="small" />
                              </Badge>
                            </IconButton>
                          </Box>
                        </Box>
                      )
                    }
                  />
                </ListItem>
              </Paper>
            ))}
          </List>
        )}
      </Box>
      
      {/* Comment menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          onClick={() => {
            if (selectedCommentId) {
              const comment = comments.find(c => c._id === selectedCommentId);
              if (comment) {
                handleEditComment(comment);
              }
            }
          }}
        >
          <Box sx={{ display: 'flex', mr: 2, alignItems: 'center' }}>
            <EditIcon fontSize="small" />
          </Box>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        
        <MenuItem 
          onClick={() => {
            if (selectedCommentId) {
              handleDeleteComment(selectedCommentId);
            }
          }}
        >
          <Box sx={{ display: 'flex', mr: 2, alignItems: 'center' }}>
            <DeleteIcon fontSize="small" color="error" />
          </Box>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default DesignComments; 