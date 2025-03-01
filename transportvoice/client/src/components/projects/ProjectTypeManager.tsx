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
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { IProjectType } from '../../types/ProjectType';
import { ICommentType } from '../../types/CommentType';

interface ProjectTypeManagerProps {
  isAdmin: boolean;
}

export const ProjectTypeManager: React.FC<ProjectTypeManagerProps> = ({ isAdmin }) => {
  const [projectTypes, setProjectTypes] = useState<IProjectType[]>([]);
  const [commentTypes, setCommentTypes] = useState<ICommentType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingProjectType, setEditingProjectType] = useState<IProjectType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    defaultCommentTypes: [] as string[]
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [projectToDelete, setProjectToDelete] = useState<IProjectType | null>(null);

  useEffect(() => {
    fetchProjectTypes();
    fetchCommentTypes();
  }, []);

  const fetchProjectTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/projectTypes', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      
      setProjectTypes(response.data);
    } catch (err: any) {
      console.error('Error fetching project types:', err);
      setError(err.response?.data?.message || 'Failed to load project types');
    } finally {
      setLoading(false);
    }
  };

  const fetchCommentTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/commentTypes', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      
      setCommentTypes(response.data);
    } catch (err: any) {
      console.error('Error fetching comment types:', err);
    }
  };

  const handleOpenDialog = (projectType?: IProjectType) => {
    if (projectType) {
      setEditingProjectType(projectType);
      setFormData({
        name: projectType.name,
        description: projectType.description,
        slug: projectType.slug,
        defaultCommentTypes: projectType.defaultCommentTypes.map(ct => 
          typeof ct === 'string' ? ct : ct._id
        )
      });
    } else {
      setEditingProjectType(null);
      setFormData({
        name: '',
        description: '',
        slug: '',
        defaultCommentTypes: []
      });
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProjectType(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Auto-generate slug from name if slug field is empty
    if (name === 'name' && !formData.slug) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]/g, '-');
      setFormData(prev => ({ ...prev, name: value, slug }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const toggleCommentType = (commentTypeId: string) => {
    setFormData(prev => {
      const defaultCommentTypes = [...prev.defaultCommentTypes];
      const index = defaultCommentTypes.indexOf(commentTypeId);
      
      if (index === -1) {
        defaultCommentTypes.push(commentTypeId);
      } else {
        defaultCommentTypes.splice(index, 1);
      }
      
      return { ...prev, defaultCommentTypes };
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      
      if (editingProjectType) {
        // Update existing project type
        await axios.put(`/api/projectTypes/${editingProjectType._id}`, formData, { headers });
      } else {
        // Create new project type
        await axios.post('/api/projectTypes', formData, { headers });
      }
      
      // Refresh the list
      fetchProjectTypes();
      handleCloseDialog();
    } catch (err: any) {
      console.error('Error saving project type:', err);
      setError(err.response?.data?.message || 'Failed to save project type');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirm = (projectType: IProjectType) => {
    setProjectToDelete(projectType);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;
    
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      await axios.delete(`/api/projectTypes/${projectToDelete._id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      
      // Refresh the list
      fetchProjectTypes();
      setDeleteConfirmOpen(false);
      setProjectToDelete(null);
    } catch (err: any) {
      console.error('Error deleting project type:', err);
      setError(err.response?.data?.message || 'Failed to delete project type');
    } finally {
      setLoading(false);
    }
  };

  const getCommentTypeName = (commentTypeId: string): string => {
    const commentType = commentTypes.find(ct => ct._id === commentTypeId);
    return commentType ? commentType.name : 'Unknown';
  };

  if (loading && projectTypes.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Project Types</Typography>
        {isAdmin && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Project Type
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {projectTypes.map(projectType => (
          <Grid item xs={12} sm={6} md={4} key={projectType._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>{projectType.name}</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {projectType.description || 'No description provided.'}
                </Typography>
                <Typography variant="caption" display="block" gutterBottom>
                  Slug: {projectType.slug}
                </Typography>
                
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>Default Comment Types:</Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {projectType.defaultCommentTypes && projectType.defaultCommentTypes.length > 0 ? (
                      projectType.defaultCommentTypes.map((commentType, index) => {
                        const ctName = typeof commentType === 'string' 
                          ? getCommentTypeName(commentType)
                          : commentType.name;
                          
                        return (
                          <Chip 
                            key={index} 
                            label={ctName} 
                            size="small" 
                            variant="outlined" 
                          />
                        );
                      })
                    ) : (
                      <Typography variant="body2" color="text.secondary">None</Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
              
              {isAdmin && (
                <CardActions>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleOpenDialog(projectType)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => openDeleteConfirm(projectType)}>
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
          {editingProjectType ? `Edit Project Type: ${editingProjectType.name}` : 'Add New Project Type'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
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
            />
            <TextField
              fullWidth
              label="Slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              margin="normal"
              required
              helperText="Used in URLs. Auto-generated from name if left empty."
            />

            <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
              Default Comment Types
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {commentTypes.map(commentType => (
                <Chip
                  key={commentType._id}
                  label={commentType.name}
                  onClick={() => toggleCommentType(commentType._id)}
                  color={formData.defaultCommentTypes.includes(commentType._id) ? 'primary' : 'default'}
                  variant={formData.defaultCommentTypes.includes(commentType._id) ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={!formData.name || !formData.slug}
          >
            {editingProjectType ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the project type "{projectToDelete?.name}"?
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