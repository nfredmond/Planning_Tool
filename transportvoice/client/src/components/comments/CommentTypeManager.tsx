import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import { SketchPicker } from 'react-color';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import axios from 'axios';
import { ICommentType } from '../../types/CommentType';
import { IProjectType } from '../../types/ProjectType';
import { SvgIcon as CustomSvgIcon } from '../common/SvgIcon';

interface CommentTypeManagerProps {
  isAdmin: boolean;
}

export const CommentTypeManager: React.FC<CommentTypeManagerProps> = ({ isAdmin }) => {
  const [commentTypes, setCommentTypes] = useState<ICommentType[]>([]);
  const [projectTypes, setProjectTypes] = useState<IProjectType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingCommentType, setEditingCommentType] = useState<ICommentType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    color: '#1976d2',
    projectTypes: [] as string[],
    isGlobal: false
  });
  const [colorPickerOpen, setColorPickerOpen] = useState<boolean>(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [commentTypeToDelete, setCommentTypeToDelete] = useState<ICommentType | null>(null);
  
  // AI Icon Generation
  const [iconGenerationOpen, setIconGenerationOpen] = useState<boolean>(false);
  const [iconPrompt, setIconPrompt] = useState<string>('');
  const [generatedIcon, setGeneratedIcon] = useState<string>('');
  const [generatingIcon, setGeneratingIcon] = useState<boolean>(false);
  const [iconGenerationError, setIconGenerationError] = useState<string | null>(null);
  const [iconStyle, setIconStyle] = useState<'minimal' | 'detailed' | 'outline'>('minimal');

  // Tabs for filtering comment types
  const [tabValue, setTabValue] = useState<number>(0);

  useEffect(() => {
    fetchCommentTypes();
    fetchProjectTypes();
  }, []);

  const fetchCommentTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/commentTypes', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      
      setCommentTypes(response.data);
    } catch (err: any) {
      console.error('Error fetching comment types:', err);
      setError(err.response?.data?.message || 'Failed to load comment types');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/projectTypes', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      
      setProjectTypes(response.data);
    } catch (err: any) {
      console.error('Error fetching project types:', err);
    }
  };

  const handleOpenDialog = (commentType?: ICommentType) => {
    if (commentType) {
      setEditingCommentType(commentType);
      setFormData({
        name: commentType.name,
        description: commentType.description,
        icon: commentType.icon,
        color: commentType.color,
        projectTypes: commentType.projectTypes || [],
        isGlobal: commentType.isGlobal
      });
    } else {
      setEditingCommentType(null);
      setFormData({
        name: '',
        description: '',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-33 17-62t47-44q51-26 115-44t141-18q77 0 141 18t115 44q30 15 47 44t17 62v112H160Z"/></svg>',
        color: '#1976d2',
        projectTypes: [],
        isGlobal: false
      });
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCommentType(null);
    setColorPickerOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleColorChange = (color: { hex: string }) => {
    setFormData(prev => ({ ...prev, color: color.hex }));
  };

  const toggleProjectType = (projectTypeSlug: string) => {
    setFormData(prev => {
      const projectTypes = [...prev.projectTypes];
      const index = projectTypes.indexOf(projectTypeSlug);
      
      if (index === -1) {
        projectTypes.push(projectTypeSlug);
      } else {
        projectTypes.splice(index, 1);
      }
      
      return { ...prev, projectTypes };
    });
  };

  const handleGlobalToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, isGlobal: e.target.checked }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      
      if (editingCommentType) {
        // Update existing comment type
        await axios.put(`/api/commentTypes/${editingCommentType._id}`, formData, { headers });
      } else {
        // Create new comment type
        await axios.post('/api/commentTypes', formData, { headers });
      }
      
      // Refresh the list
      fetchCommentTypes();
      handleCloseDialog();
    } catch (err: any) {
      console.error('Error saving comment type:', err);
      setError(err.response?.data?.message || 'Failed to save comment type');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirm = (commentType: ICommentType) => {
    setCommentTypeToDelete(commentType);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!commentTypeToDelete) return;
    
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      await axios.delete(`/api/commentTypes/${commentTypeToDelete._id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      
      // Refresh the list
      fetchCommentTypes();
      setDeleteConfirmOpen(false);
      setCommentTypeToDelete(null);
    } catch (err: any) {
      console.error('Error deleting comment type:', err);
      setError(err.response?.data?.message || 'Failed to delete comment type');
    } finally {
      setLoading(false);
    }
  };

  // AI Icon Generation
  const openIconGenerator = () => {
    setIconPrompt(formData.name); // Default to the comment type name
    setGeneratedIcon('');
    setIconGenerationError(null);
    setIconGenerationOpen(true);
  };

  const generateIcon = async () => {
    if (!iconPrompt) {
      setIconGenerationError('Please enter a prompt for the icon');
      return;
    }
    
    try {
      setGeneratingIcon(true);
      setIconGenerationError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/commentTypes/generate-icon', {
        prompt: iconPrompt,
        style: iconStyle,
        color: formData.color
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      
      setGeneratedIcon(response.data.icon);
    } catch (err: any) {
      console.error('Error generating icon:', err);
      setIconGenerationError(err.response?.data?.message || 'Failed to generate icon');
    } finally {
      setGeneratingIcon(false);
    }
  };

  const applyGeneratedIcon = () => {
    if (generatedIcon) {
      setFormData(prev => ({ ...prev, icon: generatedIcon }));
      setIconGenerationOpen(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Filter comment types based on selected tab
  const filteredCommentTypes = commentTypes.filter(ct => {
    if (tabValue === 0) return true; // All comment types
    if (tabValue === 1) return ct.isGlobal; // Global comment types
    if (tabValue === 2) return !ct.isGlobal; // Project-specific comment types
    return true;
  });

  if (loading && commentTypes.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Comment Types</Typography>
        {isAdmin && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Comment Type
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        sx={{ mb: 3 }}
        variant="fullWidth"
      >
        <Tab label="All" />
        <Tab label="Global" />
        <Tab label="Project-Specific" />
      </Tabs>

      <Grid container spacing={3}>
        {filteredCommentTypes.map(commentType => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={commentType._id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box mr={2}>
                    <CustomSvgIcon 
                      svgString={commentType.icon} 
                      size={40} 
                      color={commentType.color} 
                    />
                  </Box>
                  <Typography variant="h6">{commentType.name}</Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {commentType.description || 'No description provided.'}
                </Typography>
                
                <Box mt={2}>
                  {commentType.isGlobal ? (
                    <Chip label="Global" color="primary" size="small" />
                  ) : (
                    commentType.projectTypes.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>Project Types:</Typography>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                          {commentType.projectTypes.map((pt, index) => (
                            <Chip 
                              key={index} 
                              label={projectTypes.find(p => p.slug === pt)?.name || pt} 
                              size="small" 
                              variant="outlined" 
                            />
                          ))}
                        </Box>
                      </Box>
                    )
                  )}
                </Box>
                
                {commentType.iconGeneratedByAI && commentType.iconPrompt && (
                  <Box mt={2}>
                    <Typography variant="caption" display="block">
                      Icon generated from: "{commentType.iconPrompt}"
                    </Typography>
                  </Box>
                )}
              </CardContent>
              
              {isAdmin && (
                <CardActions>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleOpenDialog(commentType)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => openDeleteConfirm(commentType)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCommentType ? `Edit Comment Type: ${editingCommentType.name}` : 'Add New Comment Type'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={3}
                  required
                />
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={formData.isGlobal} 
                      onChange={handleGlobalToggle} 
                      name="isGlobal" 
                    />
                  }
                  label="Global Comment Type (available in all projects)"
                  sx={{ mt: 2, mb: 2 }}
                />
                
                {!formData.isGlobal && (
                  <Box mt={2}>
                    <Typography variant="subtitle1">Project Types</Typography>
                    <Typography variant="caption" display="block" mb={1}>
                      Select which project types this comment type is available for
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {projectTypes.map(projectType => (
                        <Chip
                          key={projectType._id}
                          label={projectType.name}
                          onClick={() => toggleProjectType(projectType.slug)}
                          color={formData.projectTypes.includes(projectType.slug) ? 'primary' : 'default'}
                          variant={formData.projectTypes.includes(projectType.slug) ? 'filled' : 'outlined'}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1
                  }}
                >
                  <Typography variant="subtitle1" align="center" gutterBottom>Icon Preview</Typography>
                  <Box 
                    sx={{ 
                      width: 100, 
                      height: 100, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mb: 2
                    }}
                  >
                    <CustomSvgIcon svgString={formData.icon} size={64} color={formData.color} />
                  </Box>
                  
                  <Box mt={2} width="100%">
                    <Button 
                      variant="outlined" 
                      startIcon={<AutoFixHighIcon />} 
                      onClick={openIconGenerator}
                      fullWidth
                      sx={{ mb: 1 }}
                    >
                      Generate Icon with AI
                    </Button>
                    
                    <Button 
                      variant="outlined" 
                      startIcon={<ColorLensIcon />} 
                      onClick={() => setColorPickerOpen(!colorPickerOpen)}
                      fullWidth
                    >
                      {colorPickerOpen ? 'Hide Color Picker' : 'Change Color'}
                    </Button>
                    
                    {colorPickerOpen && (
                      <Box mt={2} display="flex" justifyContent="center">
                        <SketchPicker 
                          color={formData.color} 
                          onChange={handleColorChange} 
                          disableAlpha 
                        />
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={!formData.name || !formData.description}
          >
            {editingCommentType ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Icon Generation Dialog */}
      <Dialog open={iconGenerationOpen} onClose={() => setIconGenerationOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Icon with AI</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Describe the icon you want to generate. Be specific about what it should represent.
          </Typography>
          
          <TextField
            fullWidth
            label="Icon Description"
            value={iconPrompt}
            onChange={(e) => setIconPrompt(e.target.value)}
            margin="normal"
            multiline
            rows={3}
            placeholder="Example: A bicycle icon for marking bike routes"
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Icon Style</InputLabel>
            <Select
              value={iconStyle}
              label="Icon Style"
              onChange={(e) => setIconStyle(e.target.value as any)}
            >
              <MenuItem value="minimal">Minimal</MenuItem>
              <MenuItem value="detailed">Detailed</MenuItem>
              <MenuItem value="outline">Outline</MenuItem>
            </Select>
          </FormControl>
          
          {iconGenerationError && (
            <Alert severity="error" sx={{ mt: 2 }}>{iconGenerationError}</Alert>
          )}
          
          {generatedIcon && (
            <Box mt={3} display="flex" flexDirection="column" alignItems="center">
              <Typography variant="subtitle1" gutterBottom>Generated Icon</Typography>
              <Box 
                sx={{ 
                  width: 100, 
                  height: 100, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2
                }}
              >
                <CustomSvgIcon svgString={generatedIcon} size={64} color={formData.color} />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIconGenerationOpen(false)}>Cancel</Button>
          <Button 
            onClick={generateIcon} 
            variant="outlined" 
            disabled={!iconPrompt || generatingIcon}
            startIcon={generatingIcon ? <CircularProgress size={20} /> : undefined}
          >
            {generatingIcon ? 'Generating...' : 'Generate'}
          </Button>
          {generatedIcon && (
            <Button 
              onClick={applyGeneratedIcon} 
              variant="contained" 
              color="primary"
            >
              Use This Icon
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the comment type "{commentTypeToDelete?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 