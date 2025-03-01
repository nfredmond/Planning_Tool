import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  TextField,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  Badge,
  CircularProgress,
  Alert,
  Tooltip,
  useTheme
} from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';
import MicIcon from '@mui/icons-material/Mic';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ReplyIcon from '@mui/icons-material/Reply';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatDistanceToNow } from 'date-fns';

import { useCommentsHook } from '../../hooks/useCommentsHook';
import { useAuth } from '../../hooks/useAuth';
import VoiceCommentRecorder from './VoiceCommentRecorder';
import { Comment } from '../../types/Comment';

// Extended Comment interface with additional properties needed for the UI
interface ExtendedComment extends Omit<Comment, 'replies'> {
  audioUrl?: string;
  userVoted?: boolean;
  replies?: ExtendedComment[];
}

interface CommentSectionProps {
  projectId: string;
  locationId?: string;
  title?: string;
}

type CommentType = 'all' | 'text' | 'voice';

const CommentSection: React.FC<CommentSectionProps> = ({
  projectId,
  locationId,
  title = 'Comments'
}) => {
  const theme = useTheme();
  const { 
    comments: apiComments, 
    loading, 
    error, 
    fetchComments,
    createComment,
    updateComment,
    voteComment,
    deleteComment
  } = useCommentsHook({
    projectId,
    initialPage: 1,
    initialPageSize: 50
  });
  
  const { user } = useAuth();
  
  // Convert API comments to extended comments with UI-specific properties
  const comments = apiComments.map(comment => ({
    ...comment,
    audioUrl: undefined, // Add this property if your backend provides it
    userVoted: comment.votes?.voters?.some(voter => 
      voter.user === (user ? user.id : '') && voter.vote === 'up'
    ),
    replies: [] // Add replies if your backend provides them
  })) as ExtendedComment[];
  
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [commentType, setCommentType] = useState<CommentType>('all');
  const [activeTab, setActiveTab] = useState<'text' | 'voice'>('text');
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  
  // Fetch comments when component mounts or when projectId/locationId changes
  useEffect(() => {
    fetchComments();
  }, [fetchComments, projectId]);
  
  // Handle cleanup of audio player
  useEffect(() => {
    return () => {
      if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.src = '';
      }
    };
  }, [audioPlayer]);
  
  // Filter comments based on selected type
  const filteredComments = comments.filter(comment => {
    if (commentType === 'all') return true;
    if (commentType === 'text') return !comment.audioUrl;
    if (commentType === 'voice') return !!comment.audioUrl;
    return true;
  });
  
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      await createComment({
        content: newComment,
        location: locationId ? { type: 'Point', coordinates: [0, 0] } : undefined
      });
      
      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error('Error submitting comment:', err);
    }
  };
  
  const handleSubmitReply = async (commentId: string) => {
    if (!replyContent.trim()) return;
    
    try {
      await createComment({
        content: replyContent,
        // Add parent comment ID logic here when backend supports it
      });
      
      setReplyingTo(null);
      setReplyContent('');
      fetchComments();
    } catch (err) {
      console.error('Error submitting reply:', err);
    }
  };
  
  const handleLikeComment = async (commentId: string) => {
    try {
      await voteComment(commentId, 'up');
      fetchComments();
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await deleteComment(commentId);
      fetchComments();
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };
  
  const handlePlayAudio = (audioUrl: string | undefined) => {
    if (!audioUrl) return;
    
    if (playingAudio === audioUrl) {
      // Stop playing
      if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
      }
      setPlayingAudio(null);
    } else {
      // Start playing new audio
      if (audioPlayer) {
        audioPlayer.pause();
      }
      
      const newPlayer = new Audio(audioUrl);
      newPlayer.onended = () => setPlayingAudio(null);
      newPlayer.play();
      
      setAudioPlayer(newPlayer);
      setPlayingAudio(audioUrl);
    }
  };
  
  const handleTabChange = (_: React.SyntheticEvent, newValue: 'text' | 'voice') => {
    setActiveTab(newValue);
  };
  
  const handleCommentAdded = () => {
    fetchComments();
  };
  
  const renderCommentItem = (comment: ExtendedComment, isReply = false) => {
    const isCurrentUserComment = user && comment.user && 
      user.id === comment.user._id;
    
    return (
      <ListItem 
        key={comment._id} 
        sx={{ 
          display: 'block', 
          px: 0, 
          py: 1 
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <ListItemAvatar>
            <Avatar>
              {comment.user ? 
                `${comment.user.firstName.charAt(0)}${comment.user.lastName.charAt(0)}` : 
                (comment.anonymousName ? comment.anonymousName.charAt(0) : 'A')}
            </Avatar>
          </ListItemAvatar>
          
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" component="div">
                {comment.user ? 
                  `${comment.user.firstName} ${comment.user.lastName}` : 
                  (comment.anonymousName || 'Anonymous')}
              </Typography>
              
              <Typography variant="caption" color="text.secondary">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </Typography>
            </Box>
            
            {comment.category && (
              <Chip 
                label={comment.category} 
                size="small" 
                sx={{ mb: 1, mr: 1 }} 
              />
            )}
            
            <Typography variant="body1" sx={{ mb: 1 }}>
              {comment.content}
            </Typography>
            
            {comment.audioUrl && (
              <Box sx={{ mb: 1 }}>
                <Button
                  startIcon={<VolumeUpIcon />}
                  variant="outlined"
                  size="small"
                  onClick={() => handlePlayAudio(comment.audioUrl)}
                  color={playingAudio === comment.audioUrl ? 'secondary' : 'primary'}
                >
                  {playingAudio === comment.audioUrl ? 'Stop' : 'Play Audio'}
                </Button>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Tooltip title="Like">
                <IconButton 
                  size="small" 
                  onClick={() => handleLikeComment(comment._id)}
                  color={comment.userVoted ? 'primary' : 'default'}
                >
                  <Badge badgeContent={comment.votes?.upvotes || 0} color="primary">
                    <ThumbUpIcon fontSize="small" />
                  </Badge>
                </IconButton>
              </Tooltip>
              
              {!isReply && (
                <Tooltip title="Reply">
                  <IconButton 
                    size="small" 
                    onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                  >
                    <ReplyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              
              {isCurrentUserComment && (
                <Tooltip title="Delete">
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteComment(comment._id)}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            
            {replyingTo === comment._id && (
              <Box sx={{ mt: 2, pl: 2, borderLeft: `2px solid ${theme.palette.divider}` }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="text" 
                    onClick={() => setReplyingTo(null)}
                    sx={{ mr: 1 }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={() => handleSubmitReply(comment._id)}
                  >
                    Reply
                  </Button>
                </Box>
              </Box>
            )}
            
            {/* Render replies if any */}
            {comment.replies && comment.replies.length > 0 && (
              <List sx={{ pl: 2, borderLeft: `2px solid ${theme.palette.divider}` }}>
                {comment.replies.map(reply => renderCommentItem(reply, true))}
              </List>
            )}
          </Box>
        </Box>
      </ListItem>
    );
  };
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {title}
      </Typography>
      
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange}
        sx={{ mb: 2 }}
      >
        <Tab 
          icon={<TextFieldsIcon />} 
          label="Text Comment" 
          value="text" 
        />
        <Tab 
          icon={<MicIcon />} 
          label="Voice Comment" 
          value="voice" 
        />
      </Tabs>
      
      {activeTab === 'text' ? (
        <Box component="form" onSubmit={handleSubmitComment} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Share your thoughts..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              type="submit" 
              variant="contained" 
              startIcon={<CommentIcon />}
              disabled={!newComment.trim()}
            >
              Post Comment
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ mb: 3 }}>
          <VoiceCommentRecorder 
            projectId={projectId} 
            onCommentAdded={handleCommentAdded} 
          />
        </Box>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ mb: 2 }}>
        <Tabs 
          value={commentType} 
          onChange={(_, value) => setCommentType(value)}
        >
          <Tab label="All Comments" value="all" />
          <Tab label="Text Comments" value="text" />
          <Tab label="Voice Comments" value="voice" />
        </Tabs>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">
          {error.message || 'An error occurred while loading comments.'}
        </Alert>
      ) : filteredComments.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No comments yet. Be the first to comment!
        </Typography>
      ) : (
        <List>
          {filteredComments.map(comment => renderCommentItem(comment))}
        </List>
      )}
    </Paper>
  );
};

export default CommentSection; 