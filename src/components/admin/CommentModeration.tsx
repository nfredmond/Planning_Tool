import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Check as ApproveIcon,
  Close as RejectIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Reply as ReplyIcon,
  Flag as FlagIcon
} from '@mui/icons-material';

// Comment interface
interface Comment {
  id: string;
  content: string;
  user: string;
  project: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  createdAt: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
}

// Mock data for comments
const mockComments: Comment[] = [
  {
    id: '1',
    content: 'I think we need more bike lanes in the downtown area. The current infrastructure is not safe for cyclists.',
    user: 'John Smith',
    project: 'Downtown Revitalization',
    status: 'pending',
    createdAt: '2023-05-15T10:30:00Z',
    location: {
      lat: 40.7128,
      lng: -74.0060,
      address: '123 Main St'
    }
  },
  {
    id: '2',
    content: 'The proposed park design looks great, but could we add more seating areas? There\'s a lack of benches in the current plan.',
    user: 'Sarah Johnson',
    project: 'Neighborhood Park Redesign',
    status: 'approved',
    createdAt: '2023-05-14T14:45:00Z',
    location: {
      lat: 40.7138,
      lng: -74.0090,
      address: 'Central Park Area'
    }
  },
  {
    id: '3',
    content: 'This is spam content that should be removed.',
    user: 'Anonymous',
    project: 'Downtown Revitalization',
    status: 'rejected',
    createdAt: '2023-05-13T09:15:00Z'
  },
  {
    id: '4',
    content: 'I am concerned about the traffic impact of the new development. Has a traffic study been conducted?',
    user: 'Michael Brown',
    project: 'Main Street Development',
    status: 'flagged',
    createdAt: '2023-05-12T11:20:00Z'
  },
  {
    id: '5',
    content: 'The bike lane should be protected, not just painted lines on the road.',
    user: 'Emma Wilson',
    project: 'Downtown Revitalization',
    status: 'pending',
    createdAt: '2023-05-11T16:05:00Z',
    location: {
      lat: 40.7140,
      lng: -74.0080,
      address: 'Broadway & 5th'
    }
  },
  {
    id: '6',
    content: 'I support the new playground design. The inclusive equipment is much needed.',
    user: 'David Lee',
    project: 'Neighborhood Park Redesign',
    status: 'approved',
    createdAt: '2023-05-10T08:30:00Z'
  }
];

// Mock data for projects for filtering
const mockProjects = [
  { id: '1', name: 'Downtown Revitalization' },
  { id: '2', name: 'Neighborhood Park Redesign' },
  { id: '3', name: 'Main Street Development' }
];

const CommentModeration: React.FC = () => {
  const theme = useTheme();
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [replyText, setReplyText] = useState('');

  // Filter comments based on search term, status, and project
  const filteredComments = comments.filter(comment => {
    const matchesSearch = 
      comment.content.toLowerCase().includes(searchTerm.toLowerCase()) || 
      comment.user.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || comment.status === selectedStatus;
    const matchesProject = selectedProject === 'all' || comment.project === selectedProject;
    
    return matchesSearch && matchesStatus && matchesProject;
  });

  const handleApprove = (id: string) => {
    setComments(comments.map(comment => 
      comment.id === id ? { ...comment, status: 'approved' } : comment
    ));
  };

  const handleReject = (id: string) => {
    setComments(comments.map(comment => 
      comment.id === id ? { ...comment, status: 'rejected' } : comment
    ));
  };

  const handleFlag = (id: string) => {
    setComments(comments.map(comment => 
      comment.id === id ? { ...comment, status: 'flagged' } : comment
    ));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this comment?')) {
      setComments(comments.filter(comment => comment.id !== id));
    }
  };

  const handleReplyOpen = (comment: Comment) => {
    setSelectedComment(comment);
    setReplyDialogOpen(true);
  };

  const handleReplySend = () => {
    if (!replyText.trim()) {
      alert('Please enter a reply message');
      return;
    }
    
    // In a real app, this would send the reply to an API
    console.log('Sending reply to comment:', selectedComment?.id);
    console.log('Reply text:', replyText);
    
    // If needed, you could update the comment to indicate it has been replied to
    
    // Close the dialog and reset
    setReplyDialogOpen(false);
    setReplyText('');
    setSelectedComment(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return theme.palette.success.main;
      case 'rejected': return theme.palette.error.main;
      case 'flagged': return theme.palette.warning.main;
      default: return theme.palette.info.main;
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedProject('all');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Comment Moderation
      </Typography>
      
      {/* Search and Filter Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              placeholder="Search comments or users..."
              variant="outlined"
              size="small"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={selectedStatus}
                label="Status"
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="flagged">Flagged</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="project-filter-label">Project</InputLabel>
              <Select
                labelId="project-filter-label"
                value={selectedProject}
                label="Project"
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                <MenuItem value="all">All Projects</MenuItem>
                {mockProjects.map(project => (
                  <MenuItem key={project.id} value={project.name}>{project.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={handleReset}
              fullWidth
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Filter Chips - Quick access for common filters */}
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Chip 
          label="All" 
          onClick={() => setSelectedStatus('all')}
          color={selectedStatus === 'all' ? 'primary' : 'default'}
        />
        <Chip 
          label="Pending" 
          onClick={() => setSelectedStatus('pending')}
          color={selectedStatus === 'pending' ? 'primary' : 'default'}
        />
        <Chip 
          label="Approved" 
          onClick={() => setSelectedStatus('approved')}
          color={selectedStatus === 'approved' ? 'primary' : 'default'}
        />
        <Chip 
          label="Rejected" 
          onClick={() => setSelectedStatus('rejected')}
          color={selectedStatus === 'rejected' ? 'primary' : 'default'}
        />
        <Chip 
          label="Flagged" 
          onClick={() => setSelectedStatus('flagged')}
          color={selectedStatus === 'flagged' ? 'primary' : 'default'}
        />
      </Box>
      
      {/* Comments List */}
      <Grid container spacing={3}>
        {filteredComments.map(comment => (
          <Grid item xs={12} key={comment.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {comment.user}
                  </Typography>
                  <Chip 
                    label={comment.status.toUpperCase()} 
                    size="small"
                    sx={{ 
                      bgcolor: getStatusColor(comment.status),
                      color: 'white'
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Project: {comment.project} | {formatDate(comment.createdAt)}
                </Typography>
                {comment.location && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Location: {comment.location.address || `${comment.location.lat.toFixed(4)}, ${comment.location.lng.toFixed(4)}`}
                  </Typography>
                )}
                <Divider sx={{ my: 1 }} />
                <Typography variant="body1" paragraph>
                  {comment.content}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  {comment.status !== 'approved' && (
                    <IconButton 
                      color="success" 
                      onClick={() => handleApprove(comment.id)}
                      size="small"
                      sx={{ mr: 1 }}
                      title="Approve"
                    >
                      <ApproveIcon />
                    </IconButton>
                  )}
                  {comment.status !== 'rejected' && (
                    <IconButton 
                      color="error" 
                      onClick={() => handleReject(comment.id)}
                      size="small"
                      sx={{ mr: 1 }}
                      title="Reject"
                    >
                      <RejectIcon />
                    </IconButton>
                  )}
                  {comment.status !== 'flagged' && (
                    <IconButton 
                      color="warning" 
                      onClick={() => handleFlag(comment.id)}
                      size="small"
                      sx={{ mr: 1 }}
                      title="Flag for review"
                    >
                      <FlagIcon />
                    </IconButton>
                  )}
                  <IconButton 
                    color="primary" 
                    onClick={() => handleReplyOpen(comment)}
                    size="small"
                    sx={{ mr: 1 }}
                    title="Reply to comment"
                  >
                    <ReplyIcon />
                  </IconButton>
                  <IconButton 
                    color="default" 
                    onClick={() => handleDelete(comment.id)}
                    size="small"
                    title="Delete permanently"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {filteredComments.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No comments found matching your criteria.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onClose={() => setReplyDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Reply to Comment</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle2">Comment by {selectedComment?.user}:</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {selectedComment?.content}
            </Typography>
            <TextField
              autoFocus
              multiline
              rows={4}
              label="Your Reply"
              fullWidth
              variant="outlined"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply here..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReplySend} variant="contained" color="primary">
            Send Reply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommentModeration; 