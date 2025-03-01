import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  Divider,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FileCopy as DuplicateIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Public as PublicIcon,
  Lock as PrivateIcon
} from '@mui/icons-material';
import { getDesignTemplates } from '../../services/designService';
import { DesignTemplate } from '../../types/Design';

interface DesignTemplateLibraryProps {
  onSelectTemplate: (template: DesignTemplate) => void;
  onClose?: () => void;
  onSaveAsTemplate?: (designId: string) => void;
  onDeleteTemplate?: (templateId: string) => void;
  userTemplatesOnly?: boolean;
}

const DesignTemplateLibrary: React.FC<DesignTemplateLibraryProps> = ({
  onSelectTemplate,
  onClose,
  onSaveAsTemplate,
  onDeleteTemplate,
  userTemplatesOnly = false
}) => {
  // State
  const [templates, setTemplates] = useState<DesignTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(userTemplatesOnly ? 'my' : 'all');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [templateDetailOpen, setTemplateDetailOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DesignTemplate | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Categories derived from templates
  const categories = ['all', ...new Set(templates.map(template => template.category))];
  
  // Load templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        const data = await getDesignTemplates();
        setTemplates(data);
      } catch (err) {
        console.error('Error loading templates:', err);
        setError('Failed to load design templates. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadTemplates();
  }, []);
  
  // Filter and search templates
  const filteredTemplates = templates
    .filter(template => {
      // Filter by tab
      if (activeTab === 'my' && !template.createdBy) return false;
      if (activeTab === 'favorites') return false; // Would be implemented with real favorites
      
      // Filter by category
      if (filterCategory !== 'all' && template.category !== filterCategory) return false;
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          template.name.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query) ||
          template.tags?.some(tag => tag.toLowerCase().includes(query))
        );
      }
      
      return true;
    });
  
  // Handle opening template menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, templateId: string) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedTemplateId(templateId);
  };
  
  // Handle closing template menu
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedTemplateId(null);
  };
  
  // Handle opening template detail
  const handleOpenTemplateDetail = (template: DesignTemplate) => {
    setSelectedTemplate(template);
    setTemplateDetailOpen(true);
  };
  
  // Handle deleting a template
  const handleDeleteTemplate = () => {
    if (selectedTemplateId && onDeleteTemplate) {
      onDeleteTemplate(selectedTemplateId);
      // Remove template from local state
      setTemplates(templates.filter(t => t._id !== selectedTemplateId));
    }
    setConfirmDeleteOpen(false);
    handleMenuClose();
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with search and filters */}
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  size="small" 
                  onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                >
                  <FilterIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ mb: 2 }}
        />
        
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="All Templates" value="all" />
          <Tab label="My Templates" value="my" />
          <Tab label="Favorites" value="favorites" />
        </Tabs>
      </Box>
      
      <Divider />
      
      {/* Template grid */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="error">{error}</Typography>
            <Button 
              variant="outlined" 
              sx={{ mt: 2 }}
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </Box>
        ) : filteredTemplates.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No templates match your search criteria.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredTemplates.map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardActionArea onClick={() => handleOpenTemplateDetail(template)}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={template.thumbnail || "https://via.placeholder.com/400x200?text=Design+Template"}
                      alt={template.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography gutterBottom variant="h6" component="div" noWrap>
                          {template.name}
                        </Typography>
                        {template.isPublic ? (
                          <PublicIcon fontSize="small" color="action" />
                        ) : (
                          <PrivateIcon fontSize="small" color="action" />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, height: 40, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {template.description}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {template.tags && template.tags.slice(0, 3).map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </CardActionArea>
                  <CardActions sx={{ justifyContent: 'space-between', p: 1 }}>
                    <Button 
                      size="small" 
                      onClick={() => onSelectTemplate(template)}
                    >
                      Use Template
                    </Button>
                    <IconButton 
                      size="small"
                      onClick={(e) => handleMenuOpen(e, template._id)}
                    >
                      <MoreIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
      {/* Filter menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        <Box sx={{ p: 1, width: 200 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={filterCategory}
              label="Category"
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Menu>
      
      {/* Template actions menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            const template = templates.find(t => t._id === selectedTemplateId);
            if (template) {
              onSelectTemplate(template);
            }
            handleMenuClose();
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DuplicateIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography>Use Template</Typography>
          </Box>
        </MenuItem>
        
        <MenuItem onClick={() => {
          setConfirmDeleteOpen(true);
          handleMenuClose();
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DeleteIcon fontSize="small" color="error" sx={{ mr: 1 }} />
            <Typography>Delete</Typography>
          </Box>
        </MenuItem>
      </Menu>
      
      {/* Template detail dialog */}
      <Dialog
        open={templateDetailOpen}
        onClose={() => setTemplateDetailOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedTemplate && (
          <>
            <DialogTitle>{selectedTemplate.name}</DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <img 
                  src={selectedTemplate.thumbnail || "https://via.placeholder.com/800x400?text=Design+Template"}
                  alt={selectedTemplate.name}
                  style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 4 }}
                />
              </Box>
              
              <Typography variant="subtitle1" gutterBottom>
                Description
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedTemplate.description}
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Category</Typography>
                  <Typography variant="body2">{selectedTemplate.category}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Created By</Typography>
                  <Typography variant="body2">{selectedTemplate.createdBy || 'System'}</Typography>
                </Grid>
              </Grid>
              
              {selectedTemplate.tags && selectedTemplate.tags.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Tags</Typography>
                  {selectedTemplate.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setTemplateDetailOpen(false)}>
                Close
              </Button>
              <Button 
                variant="contained"
                onClick={() => {
                  onSelectTemplate(selectedTemplate);
                  setTemplateDetailOpen(false);
                }}
              >
                Use Template
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>Delete Template?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this template? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDeleteTemplate} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DesignTemplateLibrary; 