import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ContentCopy as DuplicateIcon,
  Visibility as ViewIcon,
  Public as PublishIcon,
  Share as ShareIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import DesignWorkspace from '../../components/design/DesignWorkspace';
import {
  getDesignAlternatives,
  saveDesignAlternative,
  deleteDesignAlternative,
  createDesignFromTemplate
} from '../../services/designService';
import { DesignAlternative } from '../../types/Design';
import { formatDistanceToNow } from 'date-fns';
import DesignTemplateLibrary from '../../components/design/DesignTemplateLibrary';

const DesignAlternativesPage: React.FC = () => {
  const { projectId, designId } = useParams<{ projectId: string, designId?: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<any>(null);
  const [alternatives, setAlternatives] = useState<DesignAlternative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [currentDesignId, setCurrentDesignId] = useState<string | null>(designId || null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAlternativeId, setSelectedAlternativeId] = useState<string | null>(null);
  const [newDesignDialogOpen, setNewDesignDialogOpen] = useState(false);
  const [newDesignName, setNewDesignName] = useState('');
  const [newDesignDescription, setNewDesignDescription] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  
  // Load project and design alternatives
  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;
      
      setLoading(true);
      try {
        // In a real implementation, this would be fetched from the API
        // For now, we'll mock the project data
        setProject({
          _id: projectId,
          name: 'Sample Transportation Project',
          description: 'This is a sample project for the TransportVoice application',
          bounds: {
            north: 37.84,
            south: 37.76,
            east: -122.34,
            west: -122.52
          },
          layers: [
            {
              id: 'base-layer',
              name: 'Base Layer',
              type: 'geojson',
              url: 'https://example.com/base-layer.geojson',
              visible: true,
              opacity: 1,
              zIndex: 0
            }
          ]
        });
        
        // Fetch design alternatives
        const data = await getDesignAlternatives(projectId);
        setAlternatives(Array.isArray(data) ? data : []);
        
        // If a designId is provided, show the workspace
        if (designId) {
          setShowWorkspace(true);
        }
      } catch (err) {
        console.error('Error loading project data:', err);
        setError('Failed to load project data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, designId]);
  
  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, alternativeId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedAlternativeId(alternativeId);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedAlternativeId(null);
  };
  
  // Create a new design alternative
  const handleCreateDesign = async () => {
    if (!projectId || !newDesignName) return;
    
    try {
      const newDesign: Partial<DesignAlternative> = {
        projectId,
        name: newDesignName,
        description: newDesignDescription,
        features: []
      };
      
      const savedDesign = await saveDesignAlternative(newDesign);
      setAlternatives([...alternatives, savedDesign]);
      setNewDesignDialogOpen(false);
      setNewDesignName('');
      setNewDesignDescription('');
      
      // Show success message
      setSuccess('Design alternative created successfully');
      
      // Navigate to the new design
      setCurrentDesignId(savedDesign._id!);
      setShowWorkspace(true);
      navigate(`/projects/${projectId}/designs/${savedDesign._id}`);
    } catch (err) {
      console.error('Error creating design:', err);
      setError('Failed to create design. Please try again.');
    }
  };
  
  // Create design from template
  const handleCreateFromTemplate = async (templateId: string) => {
    if (!projectId) return;
    
    try {
      // In a real implementation, this would use your API
      const savedDesign = await createDesignFromTemplate(projectId, templateId, 'New Design from Template');
      setAlternatives([...alternatives, savedDesign]);
      setTemplateDialogOpen(false);
      
      // Show success message
      setSuccess('Design created from template successfully');
      
      // Navigate to the new design
      setCurrentDesignId(savedDesign._id!);
      setShowWorkspace(true);
      navigate(`/projects/${projectId}/designs/${savedDesign._id}`);
    } catch (err) {
      console.error('Error creating design from template:', err);
      setError('Failed to create design from template. Please try again.');
    }
  };
  
  // Delete a design alternative
  const handleDeleteDesign = async () => {
    if (!selectedAlternativeId) return;
    
    try {
      await deleteDesignAlternative(selectedAlternativeId);
      setAlternatives(alternatives.filter(a => a._id !== selectedAlternativeId));
      setDeleteDialogOpen(false);
      handleMenuClose();
      
      // Show success message
      setSuccess('Design alternative deleted successfully');
      
      // If the deleted design is currently open, go back to the list
      if (currentDesignId === selectedAlternativeId) {
        setShowWorkspace(false);
        setCurrentDesignId(null);
        navigate(`/projects/${projectId}/designs`);
      }
    } catch (err) {
      console.error('Error deleting design:', err);
      setError('Failed to delete design. Please try again.');
    }
  };
  
  // Handle view design
  const handleViewDesign = (alternativeId: string) => {
    setCurrentDesignId(alternativeId);
    setShowWorkspace(true);
    navigate(`/projects/${projectId}/designs/${alternativeId}`);
  };
  
  // Handle design saved callback
  const handleDesignSaved = (savedDesignId: string) => {
    // Update the alternatives list with the saved design
    const updatedAlternatives = alternatives.map(alternative => {
      if (alternative._id === savedDesignId) {
        // This should fetch the updated version from the API in a real implementation
        return { ...alternative, updatedAt: new Date().toISOString() };
      }
      return alternative;
    });
    
    setAlternatives(updatedAlternatives);
    setSuccess('Design saved successfully');
  };
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Unknown date';
    }
  };
  
  // Render design workspace
  if (showWorkspace && currentDesignId && project) {
    return (
      <DesignWorkspace
        project={project}
        alternativeId={currentDesignId}
        onSave={handleDesignSaved}
        onBack={() => {
          setShowWorkspace(false);
          navigate(`/projects/${projectId}/designs`);
        }}
      />
    );
  }
  
  // Render design alternatives list
  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            sx={{ mr: 1 }} 
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            <BackIcon />
          </IconButton>
          <Typography variant="h4">Design Alternatives</Typography>
        </Box>
        
        <Box>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setTemplateDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            From Template
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setNewDesignDialogOpen(true)}
          >
            New Design
          </Button>
        </Box>
      </Box>
      
      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : alternatives.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No design alternatives yet
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Start by creating a new design or using a template.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setNewDesignDialogOpen(true)}
            sx={{ mr: 2 }}
          >
            Create Design
          </Button>
          <Button
            variant="outlined"
            onClick={() => setTemplateDialogOpen(true)}
          >
            Use Template
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {alternatives.map((alternative) => (
            <Grid item xs={12} sm={6} md={4} key={alternative._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardActionArea onClick={() => handleViewDesign(alternative._id!)}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={`https://via.placeholder.com/400x200?text=${encodeURIComponent(alternative.name)}`}
                    alt={alternative.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div">
                      {alternative.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {alternative.description || 'No description'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Updated {formatDate(alternative.updatedAt)}
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<ViewIcon />}
                    onClick={() => handleViewDesign(alternative._id!)}
                  >
                    View
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />}
                    onClick={() => handleViewDesign(alternative._id!)}
                  >
                    Edit
                  </Button>
                  <Box sx={{ flexGrow: 1 }} />
                  <IconButton 
                    size="small"
                    onClick={(e) => handleMenuOpen(e, alternative._id!)}
                  >
                    <MoreIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Floating action button for mobile */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setNewDesignDialogOpen(true)}
      >
        <AddIcon />
      </Fab>
      
      {/* Design menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleViewDesign(selectedAlternativeId!);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          handleViewDesign(selectedAlternativeId!);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          // Implement duplicate
          handleMenuClose();
        }}>
          <ListItemIcon>
            <DuplicateIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          // Implement share
          handleMenuClose();
        }}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={() => {
          setDeleteDialogOpen(true);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* New design dialog */}
      <Dialog 
        open={newDesignDialogOpen} 
        onClose={() => setNewDesignDialogOpen(false)}
      >
        <DialogTitle>Create New Design</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a name and optional description for your design alternative.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Design Name"
            fullWidth
            variant="outlined"
            value={newDesignName}
            onChange={(e) => setNewDesignName(e.target.value)}
            required
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newDesignDescription}
            onChange={(e) => setNewDesignDescription(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewDesignDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateDesign} 
            variant="contained" 
            disabled={!newDesignName}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Design Alternative</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this design alternative? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteDesign} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Template dialog */}
      <Dialog
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Choose Design Template</DialogTitle>
        <DialogContent>
          <DesignTemplateLibrary
            onSelectTemplate={(template) => {
              handleCreateFromTemplate(template._id);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialogOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for success/error messages */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DesignAlternativesPage; 