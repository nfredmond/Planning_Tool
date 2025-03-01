import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Paper,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  CircularProgress,
  Alert,
  Tooltip,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Comment as CommentIcon,
  Send as SendIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CommentBank as AllCommentsIcon,
  PersonPin as UserIcon,
  ThumbUp as LikeIcon,
  ThumbDown as DislikeIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
  SupportAgent as SupportIcon,
} from '@mui/icons-material';

interface FeedbackItem {
  id: string;
  type: 'comment' | 'suggestion' | 'question' | 'support' | 'opposition';
  content: string;
  author: string;
  createdAt: string;
  location?: [number, number]; // [lat, lng]
  category?: string;
  rating?: number;
  status?: 'new' | 'reviewed' | 'addressed';
  likes?: number;
  dislikes?: number;
  attachments?: string[];
  isOfficial?: boolean;
}

interface FeedbackPanelProps {
  projectId: string;
  scenarioId: string;
  userRole: 'public' | 'planner' | 'admin';
  onAddFeedback: (feedback: Partial<FeedbackItem>) => Promise<void>;
  onUpdateFeedback?: (id: string, updates: Partial<FeedbackItem>) => Promise<void>;
  onDeleteFeedback?: (id: string) => Promise<void>;
}

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  projectId,
  scenarioId,
  userRole,
  onAddFeedback,
  onUpdateFeedback,
  onDeleteFeedback,
}) => {
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newFeedback, setNewFeedback] = useState({
    content: '',
    type: 'comment',
    category: 'general',
    rating: 3,
    location: null as [number, number] | null,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLocationPickerMode, setIsLocationPickerMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  
  // Simulate loading feedback data
  useEffect(() => {
    const loadFeedback = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Sample data
        const mockFeedbackItems: FeedbackItem[] = [
          {
            id: '1',
            type: 'comment',
            content: 'This bike lane proposal would greatly improve safety in our neighborhood.',
            author: 'Sarah Johnson',
            createdAt: '2023-06-15T14:23:00Z',
            category: 'safety',
            rating: 4,
            status: 'reviewed',
            likes: 12,
            dislikes: 2,
          },
          {
            id: '2',
            type: 'suggestion',
            content: 'Consider adding more pedestrian crossings along Main Street, particularly near the school.',
            author: 'Michael Chen',
            createdAt: '2023-06-14T09:45:00Z',
            category: 'pedestrian',
            location: [35.9132, -79.0558],
            status: 'new',
            likes: 8,
            dislikes: 0,
          },
          {
            id: '3',
            type: 'opposition',
            content: 'I\'m concerned about the loss of parking spaces on Oak Avenue. Many elderly residents rely on street parking.',
            author: 'Robert Smith',
            createdAt: '2023-06-12T16:30:00Z',
            category: 'parking',
            status: 'addressed',
            likes: 5,
            dislikes: 7,
          },
          {
            id: '4',
            type: 'question',
            content: 'When is construction expected to begin and how long will it take?',
            author: 'Emily Davis',
            createdAt: '2023-06-10T11:15:00Z',
            category: 'timeline',
            status: 'new',
            likes: 3,
            dislikes: 0,
          },
          {
            id: '5',
            type: 'support',
            content: 'The proposed transit improvements would make my commute much easier. Fully support this plan!',
            author: 'David Wilson',
            createdAt: '2023-06-08T13:20:00Z',
            category: 'transit',
            rating: 5,
            status: 'reviewed',
            likes: 15,
            dislikes: 1,
          },
          {
            id: '6',
            type: 'comment',
            content: 'We need to ensure the bike lanes are properly maintained during winter months.',
            author: 'Jessica Brown',
            createdAt: '2023-06-05T10:30:00Z',
            category: 'maintenance',
            status: 'new',
            likes: 9,
            dislikes: 0,
          },
          {
            id: '7',
            type: 'suggestion',
            content: 'Please consider adding more shade trees along the new pedestrian corridor.',
            author: 'Thomas Martinez',
            createdAt: '2023-06-03T15:45:00Z',
            category: 'environment',
            location: [35.9145, -79.0533],
            status: 'reviewed',
            likes: 14,
            dislikes: 2,
          },
          {
            id: '8',
            type: 'comment',
            content: 'The city should consider additional traffic calming measures near the elementary school.',
            author: 'City Transportation Department',
            createdAt: '2023-06-01T09:15:00Z',
            category: 'safety',
            status: 'new',
            isOfficial: true,
            likes: 7,
            dislikes: 0,
          },
        ];
        
        setFeedbackItems(mockFeedbackItems);
      } catch (err) {
        setError('Failed to load feedback. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadFeedback();
  }, [projectId, scenarioId]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  const handleAddFeedback = async () => {
    if (newFeedback.content.trim() === '') return;
    
    setLoading(true);
    setError(null);
    
    try {
      await onAddFeedback({
        ...newFeedback,
        createdAt: new Date().toISOString(),
      });
      
      // Simulate API response
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Add optimistically to the UI
      const newItem: FeedbackItem = {
        id: `temp-${Date.now()}`,
        type: newFeedback.type as any,
        content: newFeedback.content,
        author: 'You',
        createdAt: new Date().toISOString(),
        category: newFeedback.category,
        rating: newFeedback.rating,
        location: newFeedback.location || undefined,
        status: 'new',
        likes: 0,
        dislikes: 0,
      };
      
      setFeedbackItems([newItem, ...feedbackItems]);
      
      // Reset form
      setNewFeedback({
        content: '',
        type: 'comment',
        category: 'general',
        rating: 3,
        location: null,
      });
      
      setIsDialogOpen(false);
      setIsLocationPickerMode(false);
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLike = async (id: string) => {
    if (userRole === 'public') {
      // In a real app, this would call an API to update likes
      setFeedbackItems(items => 
        items.map(item => 
          item.id === id ? { ...item, likes: (item.likes || 0) + 1 } : item
        )
      );
    }
  };
  
  const handleDislike = async (id: string) => {
    if (userRole === 'public') {
      // In a real app, this would call an API to update dislikes
      setFeedbackItems(items => 
        items.map(item => 
          item.id === id ? { ...item, dislikes: (item.dislikes || 0) + 1 } : item
        )
      );
    }
  };
  
  const handleUpdateStatus = async (id: string, status: 'new' | 'reviewed' | 'addressed') => {
    if (userRole !== 'public' && onUpdateFeedback) {
      try {
        await onUpdateFeedback(id, { status });
        
        // Update optimistically
        setFeedbackItems(items => 
          items.map(item => 
            item.id === id ? { ...item, status } : item
          )
        );
      } catch (err) {
        setError('Failed to update feedback status.');
        console.error(err);
      }
    }
  };
  
  const handleDeleteFeedback = async (id: string) => {
    if (userRole === 'admin' && onDeleteFeedback) {
      try {
        await onDeleteFeedback(id);
        
        // Remove from UI
        setFeedbackItems(items => items.filter(item => item.id !== id));
      } catch (err) {
        setError('Failed to delete feedback.');
        console.error(err);
      }
    }
  };
  
  const handleLocationSelect = () => {
    // In a real app, this would capture a location from the map
    // For now, we'll use a placeholder location
    setNewFeedback({
      ...newFeedback,
      location: [35.9132, -79.0558],
    });
    setIsLocationPickerMode(false);
  };
  
  const getFilteredFeedback = () => {
    return feedbackItems.filter(item => {
      // Text search
      const matchesSearch = searchTerm === '' || 
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.author.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      
      // Type filter
      const matchesType = filterType === 'all' || item.type === filterType;
      
      // Tab filter (My Feedback = tab 1)
      const matchesTab = activeTab === 0 || (activeTab === 1 && item.author === 'You');
      
      return matchesSearch && matchesCategory && matchesType && matchesTab;
    });
  };
  
  const getFeedbackTypeChip = (type: string) => {
    switch (type) {
      case 'comment':
        return <Chip size="small" label="Comment" color="default" />;
      case 'suggestion':
        return <Chip size="small" label="Suggestion" color="info" />;
      case 'question':
        return <Chip size="small" label="Question" color="secondary" />;
      case 'support':
        return <Chip size="small" label="Support" color="success" />;
      case 'opposition':
        return <Chip size="small" label="Opposition" color="error" />;
      default:
        return <Chip size="small" label={type} />;
    }
  };
  
  const getStatusChip = (status: string | undefined) => {
    switch (status) {
      case 'new':
        return <Chip size="small" label="New" color="primary" variant="outlined" />;
      case 'reviewed':
        return <Chip size="small" label="Reviewed" color="info" variant="outlined" />;
      case 'addressed':
        return <Chip size="small" label="Addressed" color="success" variant="outlined" />;
      default:
        return null;
    }
  };
  
  const filteredFeedback = getFilteredFeedback();
  
  return (
    <Box>
      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab icon={<AllCommentsIcon />} label="All Feedback" />
        <Tab icon={<UserIcon />} label="My Feedback" />
      </Tabs>
      
      {/* Search and filters */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          placeholder="Search feedback"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon color="action" fontSize="small" sx={{ mr: 1 }} />,
          }}
          sx={{ flexGrow: 1 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="filter-category-label">Category</InputLabel>
          <Select
            labelId="filter-category-label"
            value={filterCategory}
            label="Category"
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="general">General</MenuItem>
            <MenuItem value="safety">Safety</MenuItem>
            <MenuItem value="pedestrian">Pedestrian</MenuItem>
            <MenuItem value="transit">Transit</MenuItem>
            <MenuItem value="parking">Parking</MenuItem>
            <MenuItem value="environment">Environment</MenuItem>
            <MenuItem value="maintenance">Maintenance</MenuItem>
            <MenuItem value="timeline">Timeline</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="filter-type-label">Type</InputLabel>
          <Select
            labelId="filter-type-label"
            value={filterType}
            label="Type"
            onChange={(e) => setFilterType(e.target.value)}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="comment">Comments</MenuItem>
            <MenuItem value="suggestion">Suggestions</MenuItem>
            <MenuItem value="question">Questions</MenuItem>
            <MenuItem value="support">Support</MenuItem>
            <MenuItem value="opposition">Opposition</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {/* Add Feedback Button */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setIsDialogOpen(true)}
          fullWidth
        >
          Add Feedback
        </Button>
      </Box>
      
      {/* Feedback List */}
      <Box sx={{ bgcolor: 'background.paper' }}>
        {loading && filteredFeedback.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredFeedback.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CommentIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.5 }} />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              No feedback found. Be the first to add your thoughts!
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredFeedback.map((item) => (
              <React.Fragment key={item.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    bgcolor: item.isOfficial ? 'action.hover' : 'inherit',
                    borderLeft: item.isOfficial ? '3px solid #1976d2' : 'none',
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: item.isOfficial ? 'primary.main' : 'secondary.main' }}>
                      {item.isOfficial ? <SupportIcon /> : item.author[0].toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mb: 0.5 }}>
                        <Typography variant="subtitle2" component="span">
                          {item.author}
                          {item.isOfficial && (
                            <Typography 
                              component="span" 
                              variant="caption" 
                              sx={{ ml: 1, fontWeight: 'bold', color: 'primary.main' }}
                            >
                              (Official)
                            </Typography>
                          )}
                        </Typography>
                        <Typography variant="caption" component="span" color="text.secondary" sx={{ ml: 'auto' }}>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.primary" gutterBottom>
                          {item.content}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                          {getFeedbackTypeChip(item.type)}
                          {item.category && <Chip size="small" label={item.category} />}
                          {item.location && (
                            <Chip 
                              size="small" 
                              icon={<LocationIcon fontSize="small" />} 
                              label="Has location" 
                              color="primary"
                              variant="outlined"
                            />
                          )}
                          {item.rating && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Rating value={item.rating} readOnly size="small" />
                            </Box>
                          )}
                          {userRole !== 'public' && getStatusChip(item.status)}
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Tooltip title="Like">
                            <IconButton 
                              size="small" 
                              onClick={() => handleLike(item.id)}
                              color={item.author === 'You' ? 'default' : 'primary'}
                              disabled={item.author === 'You'}
                            >
                              <LikeIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Typography variant="caption" sx={{ mr: 2 }}>
                            {item.likes || 0}
                          </Typography>
                          
                          <Tooltip title="Dislike">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDislike(item.id)}
                              color={item.author === 'You' ? 'default' : 'primary'}
                              disabled={item.author === 'You'}
                            >
                              <DislikeIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Typography variant="caption">
                            {item.dislikes || 0}
                          </Typography>
                          
                          {/* Admin/Planner Actions */}
                          {userRole !== 'public' && (
                            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                              <FormControl size="small" sx={{ minWidth: 100 }}>
                                <Select
                                  value={item.status || 'new'}
                                  size="small"
                                  displayEmpty
                                  onChange={(e) => handleUpdateStatus(item.id, e.target.value as any)}
                                >
                                  <MenuItem value="new">New</MenuItem>
                                  <MenuItem value="reviewed">Reviewed</MenuItem>
                                  <MenuItem value="addressed">Addressed</MenuItem>
                                </Select>
                              </FormControl>
                              
                              {userRole === 'admin' && (
                                <Tooltip title="Delete">
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => handleDeleteFeedback(item.id)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          )}
                        </Box>
                      </>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
      
      {/* Add Feedback Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setIsLocationPickerMode(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Feedback</DialogTitle>
        <DialogContent>
          {isLocationPickerMode ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body1" gutterBottom>
                Click on the map to set a location for your feedback
              </Typography>
              <Button 
                variant="outlined" 
                onClick={handleLocationSelect}
                startIcon={<LocationIcon />}
              >
                Use Current Map Center
              </Button>
              <Button 
                variant="text" 
                onClick={() => setIsLocationPickerMode(false)}
                sx={{ ml: 2 }}
              >
                Cancel
              </Button>
            </Box>
          ) : (
            <>
              <FormControl fullWidth margin="normal">
                <InputLabel id="feedback-type-label">Feedback Type</InputLabel>
                <Select
                  labelId="feedback-type-label"
                  value={newFeedback.type}
                  label="Feedback Type"
                  onChange={(e) => setNewFeedback({...newFeedback, type: e.target.value})}
                >
                  <MenuItem value="comment">Comment</MenuItem>
                  <MenuItem value="suggestion">Suggestion</MenuItem>
                  <MenuItem value="question">Question</MenuItem>
                  <MenuItem value="support">Support</MenuItem>
                  <MenuItem value="opposition">Opposition</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="feedback-category-label">Category</InputLabel>
                <Select
                  labelId="feedback-category-label"
                  value={newFeedback.category}
                  label="Category"
                  onChange={(e) => setNewFeedback({...newFeedback, category: e.target.value})}
                >
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="safety">Safety</MenuItem>
                  <MenuItem value="pedestrian">Pedestrian</MenuItem>
                  <MenuItem value="transit">Transit</MenuItem>
                  <MenuItem value="parking">Parking</MenuItem>
                  <MenuItem value="environment">Environment</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="timeline">Timeline</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                autoFocus
                margin="dense"
                label="Your Feedback"
                fullWidth
                multiline
                rows={4}
                value={newFeedback.content}
                onChange={(e) => setNewFeedback({...newFeedback, content: e.target.value})}
                variant="outlined"
                sx={{ mt: 2 }}
              />
              
              <Box sx={{ mt: 2 }}>
                <Typography component="legend">Rate this proposal (optional)</Typography>
                <Rating
                  value={newFeedback.rating}
                  onChange={(_, value) => setNewFeedback({...newFeedback, rating: value || 3})}
                />
              </Box>
              
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<LocationIcon />}
                  onClick={() => setIsLocationPickerMode(true)}
                  sx={{ mr: 1 }}
                >
                  Add Location
                </Button>
                {newFeedback.location && (
                  <Chip 
                    label="Location added" 
                    color="success" 
                    onDelete={() => setNewFeedback({...newFeedback, location: null})}
                  />
                )}
              </Box>
            </>
          )}
        </DialogContent>
        {!isLocationPickerMode && (
          <DialogActions>
            <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAddFeedback} 
              variant="contained" 
              disabled={!newFeedback.content.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
            >
              Submit
            </Button>
          </DialogActions>
        )}
      </Dialog>
      
      {error && (
        <Alert severity="error" sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default FeedbackPanel; 