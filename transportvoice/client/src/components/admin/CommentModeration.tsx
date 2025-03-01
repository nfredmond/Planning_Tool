import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import {
  Check as ApproveIcon,
  Close as RejectIcon,
  AutoFixHigh as AIIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  FormatQuote as QuoteIcon,
  LocationOn as LocationIcon,
  Autorenew as BatchIcon,
  PhotoLibrary as ImageIcon,
  MoreVert as MoreIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

// Define Comment type
interface Comment {
  _id: string;
  content: string;
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  anonymous: boolean;
  anonymousName?: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  images: string[];
  category?: string;
  status: 'pending' | 'approved' | 'rejected';
  moderationNotes?: string;
  moderatedBy?: string;
  moderatedAt?: Date;
  aiModerated: boolean;
  aiModerationScore?: number;
  aiModerationNotes?: string;
  project: {
    _id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CommentModeration: React.FC = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  // State for comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalComments, setTotalComments] = useState(0);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  
  // Filter state
  const [filters, setFilters] = useState({
    status: 'all',
    projectId: 'all',
    searchTerm: '',
  });
  
  // Dialog state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [moderationNotes, setModerationNotes] = useState('');
  
  // AI Moderation state
  const [aiProcessing, setAiProcessing] = useState<{ [key: string]: boolean }>({});
  const [batchAiProcessing, setBatchAiProcessing] = useState(false);
  
  // Projects list for filter
  const [projects, setProjects] = useState<{ _id: string, name: string }[]>([]);

  // Load comments on component mount and when filters change
  useEffect(() => {
    fetchComments();
    fetchProjects();
  }, [page, pageSize, filters]);

  // Fetch comments from API with pagination and filters
  const fetchComments = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      params.append('page', (page + 1).toString());
      params.append('limit', pageSize.toString());
      
      if (filters.status !== 'all') {
        params.append('status', filters.status);
      }
      
      if (filters.projectId !== 'all') {
        params.append('projectId', filters.projectId);
      }
      
      if (filters.searchTerm) {
        params.append('search', filters.searchTerm);
      }
      
      const response = await axios.get(`/api/admin/comments?${params.toString()}`);
      setComments(response.data.comments);
      setTotalComments(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching comments:', error);
      enqueueSnackbar('Failed to load comments', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects for filter dropdown
  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/admin/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(0); // Reset to first page when filter changes
  };

  // Handle opening comment details
  const handleOpenDetails = (comment: Comment) => {
    setSelectedComment(comment);
    setModerationNotes(comment.moderationNotes || '');
    setDetailsOpen(true);
  };

  // Handle comment moderation (approve/reject)
  const handleModerateComment = async (commentId: string, status: 'approved' | 'rejected') => {
    try {
      await axios.put(`/api/admin/comments/${commentId}`, {
        status,
        moderationNotes: selectedComment?._id === commentId ? moderationNotes : undefined
      });
      
      // Update comments list
      setComments(prev => 
        prev.map(c => c._id === commentId ? { ...c, status } : c)
      );
      
      enqueueSnackbar(`Comment ${status === 'approved' ? 'approved' : 'rejected'} successfully`, { 
        variant: 'success' 
      });
      
      // Close details dialog if open
      if (selectedComment?._id === commentId) {
        setDetailsOpen(false);
      }
    } catch (error) {
      console.error(`Error ${status} comment:`, error);
      enqueueSnackbar(`Failed to ${status} comment`, { variant: 'error' });
    }
  };

  // Handle AI moderation for a single comment
  const handleAiModerate = async (commentId: string) => {
    try {
      setAiProcessing(prev => ({ ...prev, [commentId]: true }));
      
      const response = await axios.post('/api/admin/comments/moderate/ai', { commentId });
      const { comment, aiModeration } = response.data;
      
      // Update comment in list
      setComments(prev => 
        prev.map(c => c._id === commentId ? comment : c)
      );
      
      // Update selected comment if in details view
      if (selectedComment?._id === commentId) {
        setSelectedComment(comment);
      }
      
      enqueueSnackbar('AI moderation completed', { variant: 'success' });
    } catch (error) {
      console.error('Error with AI moderation:', error);
      enqueueSnackbar('AI moderation failed', { variant: 'error' });
    } finally {
      setAiProcessing(prev => ({ ...prev, [commentId]: false }));
    }
  };

  // Handle batch AI moderation for all pending comments
  const handleBatchAiModerate = async () => {
    try {
      setBatchAiProcessing(true);
      
      // Get all pending comment IDs
      const pendingCommentIds = comments
        .filter(c => c.status === 'pending')
        .map(c => c._id);
      
      if (pendingCommentIds.length === 0) {
        enqueueSnackbar('No pending comments to moderate', { variant: 'info' });
        return;
      }
      
      // Process each comment
      const results = await Promise.all(
        pendingCommentIds.map(id => 
          axios.post('/api/admin/comments/moderate/ai', { commentId: id })
            .then(res => ({ success: true, id, data: res.data }))
            .catch(err => ({ success: false, id, error: err }))
        )
      );
      
      // Count successes and failures
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      // Refresh comments to get updated data
      fetchComments();
      
      enqueueSnackbar(`AI moderation completed: ${successCount} succeeded, ${failureCount} failed`, { 
        variant: successCount > 0 ? 'success' : 'warning'
      });
    } catch (error) {
      console.error('Error with batch AI moderation:', error);
      enqueueSnackbar('Batch AI moderation failed', { variant: 'error' });
    } finally {
      setBatchAiProcessing(false);
    }
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`/api/admin/comments/${commentId}`);
      
      // Remove from comments list
      setComments(prev => prev.filter(c => c._id !== commentId));
      
      // Close details dialog if open
      if (selectedComment?._id === commentId) {
        setDetailsOpen(false);
      }
      
      enqueueSnackbar('Comment deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting comment:', error);
      enqueueSnackbar('Failed to delete comment', { variant: 'error' });
    }
  };

  // Format date for display
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return theme.palette.success.main;
      case 'rejected': return theme.palette.error.main;
      default: return theme.palette.warning.main; // pending
    }
  };

  // Get AI moderation color based on score
  const getAiColor = (score?: number) => {
    if (score === undefined) return theme.palette.grey[500];
    if (score <= 0.3) return theme.palette.success.main;
    if (score >= 0.7) return theme.palette.error.main;
    return theme.palette.warning.main;
  };

  // Column definitions for the data grid
  const columns: GridColDef[] = [
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams<Comment>) => (
        <Chip 
          label={params.row.status.charAt(0).toUpperCase() + params.row.status.slice(1)} 
          size="small"
          sx={{ 
            backgroundColor: getStatusColor(params.row.status),
            color: 'white'
          }}
        />
      ),
    },
    {
      field: 'content',
      headerName: 'Comment',
      flex: 1,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams<Comment>) => (
        <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <Typography variant="body2" noWrap>
            {params.row.content}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'author',
      headerName: 'Author',
      width: 180,
      valueGetter: (params) => {
        if (params.row.anonymous) {
          return params.row.anonymousName || 'Anonymous';
        }
        return params.row.user ? `${params.row.user.firstName} ${params.row.user.lastName}` : 'Unknown';
      }
    },
    {
      field: 'project',
      headerName: 'Project',
      width: 180,
      valueGetter: (params) => params.row.project?.name || 'Unknown Project'
    },
    {
      field: 'createdAt',
      headerName: 'Date',
      width: 180,
      valueGetter: (params) => formatDate(params.row.createdAt)
    },
    {
      field: 'aiScore',
      headerName: 'AI Score',
      width: 120,
      renderCell: (params: GridRenderCellParams<Comment>) => {
        const score = params.row.aiModerationScore;
        
        return score !== undefined ? (
          <Tooltip title={params.row.aiModerationNotes || "No AI notes"}>
            <Chip 
              label={`${Math.round(score * 100)}%`}
              size="small"
              sx={{ 
                backgroundColor: getAiColor(score),
                color: 'white'
              }}
            />
          </Tooltip>
        ) : (
          <Chip 
            label="No score" 
            size="small" 
            variant="outlined"
          />
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 240,
      renderCell: (params: GridRenderCellParams<Comment>) => (
        <Box>
          <Tooltip title="Approve">
            <IconButton 
              color="success" 
              size="small" 
              onClick={() => handleModerateComment(params.row._id, 'approved')}
              disabled={params.row.status === 'approved'}
            >
              <ApproveIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Reject">
            <IconButton 
              color="error" 
              size="small" 
              onClick={() => handleModerateComment(params.row._id, 'rejected')}
              disabled={params.row.status === 'rejected'}
            >
              <RejectIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="AI Moderate">
            <IconButton 
              color="primary" 
              size="small" 
              onClick={() => handleAiModerate(params.row._id)}
              disabled={!!aiProcessing[params.row._id]}
            >
              {aiProcessing[params.row._id] ? (
                <CircularProgress size={20} />
              ) : (
                <AIIcon />
              )}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="View Details">
            <IconButton 
              size="small" 
              onClick={() => handleOpenDetails(params.row)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Delete">
            <IconButton 
              color="default" 
              size="small" 
              onClick={() => handleDeleteComment(params.row._id)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Comment Moderation
      </Typography>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Project</InputLabel>
              <Select
                value={filters.projectId}
                label="Project"
                onChange={(e) => handleFilterChange('projectId', e.target.value)}
              >
                <MenuItem value="all">All Projects</MenuItem>
                {projects.map(project => (
                  <MenuItem key={project._id} value={project._id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Search"
              size="small"
              fullWidth
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              InputProps={{
                endAdornment: <SearchIcon color="action" />
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />}
                onClick={fetchComments}
                fullWidth
              >
                Refresh
              </Button>
              
              <Button 
                variant="contained" 
                color="primary"
                startIcon={batchAiProcessing ? <CircularProgress size={20} color="inherit" /> : <BatchIcon />}
                onClick={handleBatchAiModerate}
                disabled={batchAiProcessing || comments.filter(c => c.status === 'pending').length === 0}
                fullWidth
              >
                AI Batch
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Comments Data Grid */}
      <Paper sx={{ height: 'calc(100vh - 280px)', width: '100%' }}>
        <DataGrid
          rows={comments}
          columns={columns}
          getRowId={(row) => row._id}
          rowCount={totalComments}
          loading={loading}
          pageSizeOptions={[10, 25, 50, 100]}
          paginationMode="server"
          page={page}
          pageSize={pageSize}
          onPaginationModelChange={(model) => {
            setPage(model.page);
            setPageSize(model.pageSize);
          }}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': {
              outline: 'none !important',
            }
          }}
        />
      </Paper>
      
      {/* Comment Details Dialog */}
      {selectedComment && (
        <Dialog 
          open={detailsOpen} 
          onClose={() => setDetailsOpen(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            Comment Details
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Author section */}
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Author
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography>
                      {selectedComment.anonymous
                        ? (selectedComment.anonymousName || 'Anonymous')
                        : (selectedComment.user 
                            ? `${selectedComment.user.firstName} ${selectedComment.user.lastName}`
                            : 'Unknown User')
                      }
                    </Typography>
                  </Box>
                  {selectedComment.user && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {selectedComment.user.email}
                    </Typography>
                  )}
                </Paper>
              </Grid>
              
              {/* Project and Date section */}
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Project
                  </Typography>
                  <Typography sx={{ mt: 1 }}>
                    {selectedComment.project?.name || 'Unknown Project'}
                  </Typography>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="subtitle2" color="text.secondary">
                    Date
                  </Typography>
                  <Typography sx={{ mt: 1 }}>
                    {formatDate(selectedComment.createdAt)}
                  </Typography>
                </Paper>
              </Grid>
              
              {/* Comment Content */}
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Comment
                  </Typography>
                  <Typography sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                    {selectedComment.content}
                  </Typography>
                  
                  {/* Location information if available */}
                  {selectedComment.location && (
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                      <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        Location: [{selectedComment.location.coordinates[1].toFixed(6)}, {selectedComment.location.coordinates[0].toFixed(6)}]
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Images if available */}
                  {selectedComment.images && selectedComment.images.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Attached Images ({selectedComment.images.length})
                      </Typography>
                      <Grid container spacing={1} sx={{ mt: 1 }}>
                        {selectedComment.images.map((img, i) => (
                          <Grid item key={i}>
                            <img 
                              src={img} 
                              alt={`Attachment ${i + 1}`} 
                              style={{ 
                                width: '100px', 
                                height: '100px', 
                                objectFit: 'cover',
                                cursor: 'pointer',
                                border: `1px solid ${theme.palette.divider}`
                              }}
                              onClick={() => window.open(img, '_blank')}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                </Paper>
              </Grid>
              
              {/* AI Moderation Results */}
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      AI Moderation
                    </Typography>
                    
                    <Button
                      size="small"
                      startIcon={aiProcessing[selectedComment._id] ? <CircularProgress size={16} /> : <AIIcon />}
                      onClick={() => handleAiModerate(selectedComment._id)}
                      disabled={!!aiProcessing[selectedComment._id]}
                    >
                      {selectedComment.aiModerated ? 'Re-analyze' : 'Analyze'}
                    </Button>
                  </Box>
                  
                  {selectedComment.aiModerated ? (
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          Score:
                        </Typography>
                        <Chip 
                          label={selectedComment.aiModerationScore !== undefined
                            ? `${Math.round(selectedComment.aiModerationScore * 100)}%`
                            : 'N/A'
                          }
                          size="small"
                          sx={{ 
                            backgroundColor: getAiColor(selectedComment.aiModerationScore),
                            color: 'white'
                          }}
                        />
                      </Box>
                      
                      <Typography variant="body2">Notes:</Typography>
                      <Paper 
                        variant="outlined"
                        sx={{ 
                          p: 1.5, 
                          mt: 0.5, 
                          backgroundColor: theme.palette.background.default,
                          maxHeight: '100px',
                          overflow: 'auto'
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {selectedComment.aiModerationNotes || 'No AI notes provided'}
                        </Typography>
                      </Paper>
                    </Box>
                  ) : (
                    <Box sx={{ mt: 2, p: 1.5, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        This comment has not been analyzed by AI yet.
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
              
              {/* Moderation Notes */}
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Moderation Notes
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={moderationNotes}
                    onChange={(e) => setModerationNotes(e.target.value)}
                    placeholder="Add notes about this comment (for internal use only)"
                    sx={{ mt: 1 }}
                  />
                </Paper>
              </Grid>
              
              {/* Current Status */}
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Current Status
                      </Typography>
                      <Chip 
                        label={selectedComment.status.charAt(0).toUpperCase() + selectedComment.status.slice(1)} 
                        sx={{ 
                          mt: 1,
                          backgroundColor: getStatusColor(selectedComment.status),
                          color: 'white'
                        }}
                      />
                    </Box>
                    
                    <Box>
                      {selectedComment.moderatedBy && (
                        <Typography variant="body2" color="text.secondary">
                          Moderated by: Admin
                        </Typography>
                      )}
                      {selectedComment.moderatedAt && (
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(selectedComment.moderatedAt)}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => handleDeleteComment(selectedComment._id)}
              color="error"
              startIcon={<DeleteIcon />}
            >
              Delete
            </Button>
            
            <Box sx={{ flex: 1 }} />
            
            <Button onClick={() => setDetailsOpen(false)}>
              Cancel
            </Button>
            
            <Button 
              variant="contained" 
              color="error"
              onClick={() => handleModerateComment(selectedComment._id, 'rejected')}
              disabled={selectedComment.status === 'rejected'}
              startIcon={<RejectIcon />}
            >
              Reject
            </Button>
            
            <Button 
              variant="contained" 
              color="success"
              onClick={() => handleModerateComment(selectedComment._id, 'approved')}
              disabled={selectedComment.status === 'approved'}
              startIcon={<ApproveIcon />}
            >
              Approve
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default CommentModeration; 