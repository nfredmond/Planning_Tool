import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  Slider,
  TextField,
  InputAdornment,
  Chip,
  Collapse,
  IconButton,
  useTheme,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import {
  Layers as LayersIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Map as MapIcon,
  Storage as DatasetIcon,
  Public as PublicIcon,
  ViewList as CategoryIcon,
  VisibilityOff as HiddenIcon,
  Visibility as VisibleIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Colorize as ColorizeIcon,
  FilterAlt as FilterIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Interface for layer data
interface Layer {
  id: number;
  name: string;
  category: string;
  type: 'vector' | 'raster' | 'point';
  source: string;
  visible: boolean;
  opacity: number;
  description: string;
  dateAdded: string;
}

const MapLayersPage = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Transportation');
  const [selectedLayer, setSelectedLayer] = useState<Layer | null>(null);
  const [isAddLayerDialogOpen, setIsAddLayerDialogOpen] = useState(false);
  const [newLayer, setNewLayer] = useState<Partial<Layer>>({
    name: '',
    category: 'Transportation',
    type: 'vector',
    source: '',
    visible: true,
    opacity: 1.0,
    description: '',
  });

  // Mock layer categories and data
  const layerCategories = [
    'Transportation',
    'Land Use',
    'Environment',
    'Demographics',
    'Infrastructure',
    'Public Facilities',
    'Zoning',
    'Custom Layers'
  ];

  const mockLayers: Layer[] = [
    {
      id: 1,
      name: 'Bike Lanes',
      category: 'Transportation',
      type: 'vector',
      source: 'City GIS Department',
      visible: true,
      opacity: 0.8,
      description: 'Existing and planned bicycle lanes throughout the city',
      dateAdded: '2023-02-15'
    },
    {
      id: 2,
      name: 'Bus Routes',
      category: 'Transportation',
      type: 'vector',
      source: 'Transit Authority',
      visible: true,
      opacity: 1.0,
      description: 'Current bus routes with service frequency data',
      dateAdded: '2023-01-20'
    },
    {
      id: 3,
      name: 'Traffic Volumes',
      category: 'Transportation',
      type: 'raster',
      source: 'Department of Transportation',
      visible: false,
      opacity: 0.7,
      description: 'Average daily traffic volumes on major streets',
      dateAdded: '2023-03-05'
    },
    {
      id: 4,
      name: 'Parks and Open Spaces',
      category: 'Land Use',
      type: 'vector',
      source: 'Parks Department',
      visible: true,
      opacity: 0.9,
      description: 'Public parks, recreation areas, and protected open spaces',
      dateAdded: '2023-01-12'
    },
    {
      id: 5,
      name: 'Commercial Zones',
      category: 'Land Use',
      type: 'vector',
      source: 'Planning Department',
      visible: false,
      opacity: 0.6,
      description: 'Areas zoned for commercial and retail use',
      dateAdded: '2023-02-28'
    },
    {
      id: 6,
      name: 'Flood Zones',
      category: 'Environment',
      type: 'vector',
      source: 'FEMA',
      visible: false,
      opacity: 0.5,
      description: '100-year and 500-year flood risk areas',
      dateAdded: '2023-03-10'
    },
    {
      id: 7,
      name: 'Air Quality Monitoring',
      category: 'Environment',
      type: 'point',
      source: 'Environmental Protection Agency',
      visible: false,
      opacity: 0.8,
      description: 'Real-time air quality monitoring stations and readings',
      dateAdded: '2023-02-01'
    },
    {
      id: 8,
      name: 'Population Density',
      category: 'Demographics',
      type: 'raster',
      source: 'Census Bureau',
      visible: false,
      opacity: 0.7,
      description: 'Population density by census tract',
      dateAdded: '2023-01-05'
    }
  ];

  // Handle category expansion
  const toggleCategory = (category: string) => {
    if (expandedCategory === category) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(category);
    }
  };

  // Handle layer visibility toggle
  const toggleLayerVisibility = (layerId: number) => {
    const updatedLayers = mockLayers.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    );
    // In a real app, this would update the state or dispatch an action
    console.log('Updated layer visibility', updatedLayers);
  };

  // Handle layer selection
  const handleLayerSelect = (layer: Layer) => {
    setSelectedLayer(layer);
  };

  // Handle layer opacity change
  const handleOpacityChange = (event: Event, value: number | number[]) => {
    if (selectedLayer && typeof value === 'number') {
      const updatedLayer = { ...selectedLayer, opacity: value };
      setSelectedLayer(updatedLayer);
      // In a real app, this would update the state or dispatch an action
      console.log('Updated layer opacity', updatedLayer);
    }
  };

  // Filter layers based on search term
  const filteredLayers = mockLayers.filter(layer => 
    layer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    layer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    layer.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group layers by category
  const layersByCategory = layerCategories.map(category => ({
    category,
    layers: filteredLayers.filter(layer => layer.category === category)
  }));

  // Handle opening the add layer dialog
  const handleOpenAddLayerDialog = () => {
    setIsAddLayerDialogOpen(true);
  };

  // Handle closing the add layer dialog
  const handleCloseAddLayerDialog = () => {
    setIsAddLayerDialogOpen(false);
    // Reset the form
    setNewLayer({
      name: '',
      category: 'Transportation',
      type: 'vector',
      source: '',
      visible: true,
      opacity: 1.0,
      description: '',
    });
  };

  // Handle input change for the new layer form
  const handleNewLayerInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewLayer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle select change for the new layer form
  const handleNewLayerSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    const value = e.target.value;
    setNewLayer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle saving the new layer
  const handleAddLayer = () => {
    // Validate required fields
    if (!newLayer.name || !newLayer.source) {
      // In a real app, you'd show validation errors
      console.error('Name and source are required fields');
      return;
    }

    // Create a new layer with an auto-generated ID and current date
    const layer: Layer = {
      id: Math.max(0, ...mockLayers.map(l => l.id)) + 1,
      name: newLayer.name!,
      category: newLayer.category!,
      type: newLayer.type as 'vector' | 'raster' | 'point',
      source: newLayer.source!,
      visible: newLayer.visible!,
      opacity: newLayer.opacity!,
      description: newLayer.description!,
      dateAdded: new Date().toISOString().split('T')[0]
    };

    // In a real app, this would dispatch an action to add the layer to the store
    console.log('Adding new layer:', layer);
    
    // Close the dialog
    handleCloseAddLayerDialog();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Map Layers
      </Typography>

      <Grid container spacing={3}>
        {/* Left column - Layer list */}
        <Grid item xs={12} md={7} lg={8}>
          <Paper sx={{ mb: 3, p: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search layers..."
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Chip 
                icon={<VisibleIcon />} 
                label="Show All" 
                onClick={() => console.log('Show all layers')} 
                variant="outlined"
              />
              <Chip 
                icon={<HiddenIcon />} 
                label="Hide All" 
                onClick={() => console.log('Hide all layers')} 
                variant="outlined"
              />
              <Chip 
                icon={<CategoryIcon />} 
                label="Group by Source" 
                onClick={() => console.log('Group by source')} 
                variant="outlined"
              />
              <Chip 
                icon={<FilterIcon />} 
                label="Filter" 
                onClick={() => console.log('Filter layers')} 
                variant="outlined"
              />
            </Box>
          </Paper>

          {layersByCategory.map(({ category, layers }) => (
            layers.length > 0 && (
              <Card key={category} sx={{ mb: 2 }}>
                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                  <Button
                    fullWidth
                    onClick={() => toggleCategory(category)}
                    endIcon={
                      <ExpandMoreIcon 
                        sx={{ 
                          transform: expandedCategory === category ? 'rotate(180deg)' : 'rotate(0)',
                          transition: 'transform 0.3s'
                        }} 
                      />
                    }
                    sx={{ 
                      justifyContent: 'space-between', 
                      p: 2,
                      backgroundColor: expandedCategory === category 
                        ? (theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.primary.main, 0.1))
                        : 'transparent'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CategoryIcon sx={{ mr: 1 }} />
                      <Typography variant="subtitle1">{category}</Typography>
                      <Chip 
                        label={layers.length} 
                        size="small" 
                        sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                      />
                    </Box>
                  </Button>
                  
                  <Collapse in={expandedCategory === category}>
                    <List disablePadding>
                      {layers.map((layer) => (
                        <ListItem 
                          key={layer.id}
                          button
                          onClick={() => handleLayerSelect(layer)}
                          selected={selectedLayer?.id === layer.id}
                          sx={{ 
                            pl: 4,
                            borderLeft: selectedLayer?.id === layer.id 
                              ? `4px solid ${theme.palette.primary.main}` 
                              : '4px solid transparent',
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            {layer.type === 'vector' ? <MapIcon /> : 
                             layer.type === 'raster' ? <LayersIcon /> : 
                             <PublicIcon />}
                          </ListItemIcon>
                          <ListItemText 
                            primary={layer.name} 
                            secondary={layer.description.length > 50 
                              ? `${layer.description.substring(0, 50)}...`
                              : layer.description}
                            primaryTypographyProps={{
                              color: layer.visible ? 'textPrimary' : 'textSecondary',
                              variant: 'body2'
                            }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                          <ListItemSecondaryAction>
                            <IconButton 
                              edge="end" 
                              aria-label="toggle visibility"
                              onClick={() => toggleLayerVisibility(layer.id)}
                              size="small"
                            >
                              {layer.visible ? <VisibleIcon /> : <HiddenIcon />}
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </CardContent>
              </Card>
            )
          ))}

          {filteredLayers.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="h6">
                No layers found matching your search.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search criteria or browse all categories.
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                sx={{ mt: 2 }}
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            </Box>
          )}
        </Grid>

        {/* Right column - Layer details and controls */}
        <Grid item xs={12} md={5} lg={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            {selectedLayer ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">{selectedLayer.name}</Typography>
                  <IconButton 
                    onClick={() => toggleLayerVisibility(selectedLayer.id)}
                    color={selectedLayer.visible ? 'primary' : 'default'}
                  >
                    {selectedLayer.visible ? <VisibleIcon /> : <HiddenIcon />}
                  </IconButton>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="body2" paragraph>
                  {selectedLayer.description}
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography id="layer-opacity-slider" gutterBottom>
                    Opacity: {Math.round(selectedLayer.opacity * 100)}%
                  </Typography>
                  <Slider
                    value={selectedLayer.opacity}
                    onChange={handleOpacityChange}
                    aria-labelledby="layer-opacity-slider"
                    step={0.05}
                    marks
                    min={0}
                    max={1}
                  />
                </Box>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Layer Type
                    </Typography>
                    <Typography variant="body1">
                      {selectedLayer.type.charAt(0).toUpperCase() + selectedLayer.type.slice(1)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Added On
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedLayer.dateAdded).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Data Source
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedLayer.source}
                </Typography>
                
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    startIcon={<ColorizeIcon />}
                    size="small"
                  >
                    Style
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DatasetIcon />}
                    size="small"
                  >
                    Data Table
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<SaveIcon />}
                    size="small"
                  >
                    Save
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <LayersIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
                <Typography variant="h6" gutterBottom>
                  Select a Layer
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Click on a layer from the list to view and edit its properties.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAddLayerDialog}
                >
                  Add New Layer
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Add Layer Dialog */}
      <Dialog open={isAddLayerDialogOpen} onClose={handleCloseAddLayerDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Add New Map Layer</Typography>
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleCloseAddLayerDialog}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus
                name="name"
                label="Layer Name"
                fullWidth
                value={newLayer.name}
                onChange={handleNewLayerInputChange}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="layer-category-label">Category</InputLabel>
                <Select
                  labelId="layer-category-label"
                  name="category"
                  value={newLayer.category}
                  onChange={handleNewLayerSelectChange as any}
                  label="Category"
                >
                  {layerCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="layer-type-label">Layer Type</InputLabel>
                <Select
                  labelId="layer-type-label"
                  name="type"
                  value={newLayer.type}
                  onChange={handleNewLayerSelectChange as any}
                  label="Layer Type"
                >
                  <MenuItem value="vector">Vector</MenuItem>
                  <MenuItem value="raster">Raster</MenuItem>
                  <MenuItem value="point">Point</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="source"
                label="Data Source"
                fullWidth
                value={newLayer.source}
                onChange={handleNewLayerInputChange}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={newLayer.description}
                onChange={handleNewLayerInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newLayer.visible}
                    onChange={(e) => setNewLayer((prev) => ({ ...prev, visible: e.target.checked }))}
                    name="visible"
                    color="primary"
                  />
                }
                label="Visible by default"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography id="new-layer-opacity-slider" gutterBottom>
                Default Opacity: {Math.round((newLayer.opacity || 1) * 100)}%
              </Typography>
              <Slider
                value={newLayer.opacity || 1}
                onChange={(_, value) => setNewLayer((prev) => ({ ...prev, opacity: value as number }))}
                aria-labelledby="new-layer-opacity-slider"
                step={0.05}
                marks
                min={0}
                max={1}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddLayerDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleAddLayer} variant="contained" color="primary">
            Add Layer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MapLayersPage; 