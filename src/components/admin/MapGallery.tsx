import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Slider,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Map as MapIcon,
  Preview as PreviewIcon,
  Link as LinkIcon,
  Settings as SettingsIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';

// Map types and interfaces
interface MapLayer {
  id: string;
  name: string;
  description?: string;
  type: 'tile' | 'wms' | 'vector' | 'raster' | 'geojson';
  url: string;
  thumbnail?: string;
  attribution?: string;
  minZoom?: number;
  maxZoom?: number;
  defaultOpacity?: number;
  isBaseMap: boolean;
  isDefault?: boolean;
  params?: Record<string, string>; // For WMS layers
  createdAt: string;
  lastModified?: string;
  tags?: string[];
}

// Mock data for maps
const mockMaps: MapLayer[] = [
  {
    id: '1',
    name: 'OpenStreetMap',
    description: 'Standard OpenStreetMap tiles for general mapping',
    type: 'tile',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    thumbnail: 'https://a.tile.openstreetmap.org/7/63/42.png',
    attribution: '© OpenStreetMap contributors',
    minZoom: 0,
    maxZoom: 19,
    defaultOpacity: 1,
    isBaseMap: true,
    isDefault: true,
    createdAt: '2023-01-15T10:30:00Z',
    tags: ['base', 'general', 'streets']
  },
  {
    id: '2',
    name: 'Satellite Imagery',
    description: 'High-resolution satellite imagery for detailed aerial view',
    type: 'tile',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    thumbnail: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/7/42/63',
    attribution: 'Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS',
    minZoom: 0,
    maxZoom: 19,
    defaultOpacity: 1,
    isBaseMap: true,
    isDefault: false,
    createdAt: '2023-01-20T14:45:00Z',
    tags: ['base', 'satellite', 'aerial']
  },
  {
    id: '3',
    name: 'Bike Lanes',
    description: 'Overlay showing bike lanes and cycling infrastructure',
    type: 'wms',
    url: 'https://example.com/geoserver/wms',
    thumbnail: 'https://via.placeholder.com/400x200?text=Bike+Lanes',
    attribution: 'City GIS Department',
    minZoom: 10,
    maxZoom: 19,
    defaultOpacity: 0.7,
    isBaseMap: false,
    params: {
      layers: 'citydata:bike_lanes',
      format: 'image/png',
      transparent: 'true'
    },
    createdAt: '2023-02-05T09:15:00Z',
    tags: ['overlay', 'transportation', 'cycling']
  },
  {
    id: '4',
    name: 'Light Mode',
    description: 'Clean, light-colored base map suitable for adding overlays',
    type: 'tile',
    url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
    thumbnail: 'https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/7/63/42.png',
    attribution: '© OpenStreetMap contributors, © CARTO',
    minZoom: 0,
    maxZoom: 19,
    defaultOpacity: 1,
    isBaseMap: true,
    isDefault: false,
    createdAt: '2023-02-10T16:20:00Z',
    tags: ['base', 'light', 'minimal']
  },
  {
    id: '5',
    name: 'Parks and Green Spaces',
    description: 'City parks, recreational areas, and other green spaces',
    type: 'geojson',
    url: 'https://example.com/api/geojson/parks',
    thumbnail: 'https://via.placeholder.com/400x200?text=Parks',
    attribution: 'City Parks Department',
    defaultOpacity: 0.8,
    isBaseMap: false,
    createdAt: '2023-03-01T11:30:00Z',
    lastModified: '2023-03-15T14:10:00Z',
    tags: ['overlay', 'recreation', 'parks']
  },
  {
    id: '6',
    name: 'Historical Map 1950',
    description: 'Historical map showing the city in 1950',
    type: 'raster',
    url: 'https://example.com/historical/1950/{z}/{x}/{y}.png',
    thumbnail: 'https://via.placeholder.com/400x200?text=Historical+1950',
    attribution: 'City Archives',
    minZoom: 10,
    maxZoom: 16,
    defaultOpacity: 0.9,
    isBaseMap: true,
    isDefault: false,
    createdAt: '2023-03-20T08:45:00Z',
    tags: ['base', 'historical', 'archive']
  }
];

// Interface for Tab Panel props
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab Panel component
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`map-gallery-tabpanel-${index}`}
      aria-labelledby={`map-gallery-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Add Project interface
interface Project {
  id: number;
  title: string;
  description: string;
  type: string;
  createdAt: string;
  status: string;
}

interface MapGalleryProps {
  projects?: Project[];
  onDeleteProject?: (id: number) => void;
}

const MapGallery: React.FC<MapGalleryProps> = ({ projects = [], onDeleteProject }) => {
  const theme = useTheme();
  const [maps, setMaps] = useState<MapLayer[]>(mockMaps);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedMap, setSelectedMap] = useState<MapLayer | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  
  // Form values for add/edit dialog
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    type: 'tile' as 'tile' | 'wms' | 'vector' | 'raster' | 'geojson',
    url: '',
    thumbnail: '',
    attribution: '',
    minZoom: 0,
    maxZoom: 18,
    defaultOpacity: 1,
    isBaseMap: true,
    isDefault: false,
    tags: ''
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddMap = () => {
    setDialogMode('add');
    setFormValues({
      name: '',
      description: '',
      type: 'tile',
      url: '',
      thumbnail: '',
      attribution: '',
      minZoom: 0,
      maxZoom: 18,
      defaultOpacity: 1,
      isBaseMap: true,
      isDefault: false,
      tags: ''
    });
    setOpenDialog(true);
  };

  const handleEditMap = (map: MapLayer) => {
    setDialogMode('edit');
    setSelectedMap(map);
    setFormValues({
      name: map.name,
      description: map.description || '',
      type: map.type,
      url: map.url,
      thumbnail: map.thumbnail || '',
      attribution: map.attribution || '',
      minZoom: map.minZoom || 0,
      maxZoom: map.maxZoom || 18,
      defaultOpacity: map.defaultOpacity || 1,
      isBaseMap: map.isBaseMap,
      isDefault: map.isDefault || false,
      tags: map.tags ? map.tags.join(', ') : ''
    });
    setOpenDialog(true);
  };

  const handlePreviewMap = (map: MapLayer) => {
    setSelectedMap(map);
    setPreviewDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormValues({ ...formValues, [name]: checked });
  };

  const handleOpacityChange = (event: Event, newValue: number | number[]) => {
    setFormValues({ ...formValues, defaultOpacity: newValue as number });
  };

  const handleSubmit = () => {
    // Validate form
    if (!formValues.name || !formValues.url) {
      alert('Name and URL are required fields');
      return;
    }

    // Process tags from comma-separated string to array
    const tags = formValues.tags
      ? formValues.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      : undefined;

    if (dialogMode === 'add') {
      // Create new map layer
      const newMap: MapLayer = {
        id: Date.now().toString(),
        ...formValues,
        type: formValues.type as 'tile' | 'wms' | 'vector' | 'raster' | 'geojson',
        tags,
        createdAt: new Date().toISOString(),
      };
      
      // If this is set as default base map, update other base maps
      if (formValues.isBaseMap && formValues.isDefault) {
        setMaps(maps.map(map => 
          map.isBaseMap ? { ...map, isDefault: false } : map
        ).concat(newMap));
      } else {
        setMaps([...maps, newMap]);
      }
    } else if (selectedMap) {
      // Update existing map layer
      let updatedMaps = maps.map(map => 
        map.id === selectedMap.id 
          ? { 
              ...map, 
              ...formValues,
              type: formValues.type as 'tile' | 'wms' | 'vector' | 'raster' | 'geojson',
              tags,
              lastModified: new Date().toISOString() 
            } 
          : map
      );
      
      // If this is set as default base map, update other base maps
      if (formValues.isBaseMap && formValues.isDefault) {
        updatedMaps = updatedMaps.map(map => 
          map.id === selectedMap.id 
            ? map 
            : map.isBaseMap 
              ? { ...map, isDefault: false } 
              : map
        );
      }
      
      setMaps(updatedMaps);
    }
    
    setOpenDialog(false);
  };

  const handleDeleteMap = (mapId: string) => {
    if (window.confirm('Are you sure you want to delete this map layer?')) {
      setMaps(maps.filter(map => map.id !== mapId));
    }
  };

  const handleSetDefault = (mapId: string) => {
    setMaps(maps.map(map => ({
      ...map,
      isDefault: map.isBaseMap && map.id === mapId ? true : map.isBaseMap ? false : map.isDefault
    })));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Filter maps based on the active tab
  const baseMaps = maps.filter(map => map.isBaseMap);
  const overlayMaps = maps.filter(map => !map.isBaseMap);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Map Gallery
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddMap}
        >
          Add New Map
        </Button>
      </Box>

      {/* Tabs for Base Maps and Overlay Maps */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          aria-label="map gallery tabs"
        >
          <Tab label="Base Maps" id="map-gallery-tab-0" aria-controls="map-gallery-tabpanel-0" />
          <Tab label="Overlay Maps" id="map-gallery-tab-1" aria-controls="map-gallery-tabpanel-1" />
        </Tabs>
      </Paper>

      {/* Base Maps Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {baseMaps.length > 0 ? (
            baseMaps.map(map => (
              <Grid item xs={12} sm={6} md={4} key={map.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={map.thumbnail || 'https://via.placeholder.com/400x200?text=Map+Preview'}
                    alt={map.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" component="h3">
                        {map.name}
                      </Typography>
                      {map.isDefault && (
                        <Tooltip title="Default Base Map">
                          <StarIcon sx={{ ml: 1, color: theme.palette.warning.main }} />
                        </Tooltip>
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {map.description || 'No description provided.'}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {map.tags?.map((tag, index) => (
                        <Chip 
                          key={index} 
                          label={tag} 
                          size="small" 
                          variant="outlined" 
                          sx={{ fontSize: '0.7rem' }}
                        />
                      ))}
                    </Box>
                    <Typography variant="body2">
                      Type: {map.type.toUpperCase()}
                    </Typography>
                    <Typography variant="body2">
                      Added: {formatDate(map.createdAt)}
                    </Typography>
                    {map.lastModified && (
                      <Typography variant="body2">
                        Updated: {formatDate(map.lastModified)}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<EditIcon />}
                      onClick={() => handleEditMap(map)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<PreviewIcon />}
                      onClick={() => handlePreviewMap(map)}
                    >
                      Preview
                    </Button>
                    {!map.isDefault && (
                      <Button 
                        size="small" 
                        startIcon={<StarBorderIcon />}
                        onClick={() => handleSetDefault(map.id)}
                      >
                        Set Default
                      </Button>
                    )}
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteMap(map.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No base maps available. Click "Add New Map" to create one.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* Overlay Maps Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {overlayMaps.length > 0 ? (
            overlayMaps.map(map => (
              <Grid item xs={12} sm={6} md={4} key={map.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={map.thumbnail || 'https://via.placeholder.com/400x200?text=Map+Preview'}
                    alt={map.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h3">
                      {map.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {map.description || 'No description provided.'}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {map.tags?.map((tag, index) => (
                        <Chip 
                          key={index} 
                          label={tag} 
                          size="small" 
                          variant="outlined" 
                          sx={{ fontSize: '0.7rem' }}
                        />
                      ))}
                    </Box>
                    <Typography variant="body2">
                      Type: {map.type.toUpperCase()}
                    </Typography>
                    <Typography variant="body2">
                      Opacity: {Math.round((map.defaultOpacity || 1) * 100)}%
                    </Typography>
                    <Typography variant="body2">
                      Added: {formatDate(map.createdAt)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<EditIcon />}
                      onClick={() => handleEditMap(map)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<PreviewIcon />}
                      onClick={() => handlePreviewMap(map)}
                    >
                      Preview
                    </Button>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteMap(map.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No overlay maps available. Click "Add New Map" to create one.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* Add/Edit Map Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Map Layer' : 'Edit Map Layer'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Map Name"
                name="name"
                value={formValues.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Map Type</InputLabel>
                <Select
                  name="type"
                  value={formValues.type}
                  label="Map Type"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="tile">Tile Layer</MenuItem>
                  <MenuItem value="wms">WMS Layer</MenuItem>
                  <MenuItem value="vector">Vector Layer</MenuItem>
                  <MenuItem value="raster">Raster Layer</MenuItem>
                  <MenuItem value="geojson">GeoJSON Layer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formValues.description}
                onChange={handleInputChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL"
                name="url"
                value={formValues.url}
                onChange={handleInputChange}
                required
                helperText="URL template for the map tiles or service endpoint"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Thumbnail URL"
                name="thumbnail"
                value={formValues.thumbnail}
                onChange={handleInputChange}
                helperText="URL to an image preview of the map"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Attribution"
                name="attribution"
                value={formValues.attribution}
                onChange={handleInputChange}
                helperText="Copyright and attribution information"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Min Zoom"
                name="minZoom"
                type="number"
                value={formValues.minZoom}
                onChange={handleInputChange}
                InputProps={{ inputProps: { min: 0, max: 22 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Max Zoom"
                name="maxZoom"
                type="number"
                value={formValues.maxZoom}
                onChange={handleInputChange}
                InputProps={{ inputProps: { min: 0, max: 22 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography gutterBottom>Default Opacity: {Math.round(formValues.defaultOpacity * 100)}%</Typography>
              <Slider
                value={formValues.defaultOpacity}
                onChange={handleOpacityChange}
                aria-labelledby="opacity-slider"
                step={0.05}
                marks
                min={0}
                max={1}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags"
                name="tags"
                value={formValues.tags}
                onChange={handleInputChange}
                helperText="Comma-separated tags (e.g. base, satellite, transportation)"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formValues.isBaseMap}
                    onChange={handleSwitchChange}
                    name="isBaseMap"
                  />
                }
                label="Is Base Map"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formValues.isDefault}
                    onChange={handleSwitchChange}
                    name="isDefault"
                    disabled={!formValues.isBaseMap}
                  />
                }
                label="Is Default Base Map"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {dialogMode === 'add' ? 'Add Map' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Map Preview Dialog */}
      <Dialog 
        open={previewDialogOpen} 
        onClose={() => setPreviewDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Map Preview: {selectedMap?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ position: 'relative', height: 400, bgcolor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            {/* In a real app, this would be a map component */}
            <Box sx={{ textAlign: 'center' }}>
              <MapIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
              <Typography variant="body1">
                Interactive Map Preview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                (In a real application, a map would be rendered here)
              </Typography>
            </Box>
          </Box>
          <Typography variant="h6">Map Details:</Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Type:</Typography>
              <Typography variant="body1" gutterBottom>{selectedMap?.type.toUpperCase()}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Default Opacity:</Typography>
              <Typography variant="body1" gutterBottom>{selectedMap ? `${Math.round((selectedMap.defaultOpacity || 1) * 100)}%` : 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">URL:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" gutterBottom sx={{ wordBreak: 'break-all', mr: 1 }}>
                  {selectedMap?.url}
                </Typography>
                <IconButton size="small" title="Open URL in new tab" onClick={() => window.open(selectedMap?.url, '_blank')}>
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              </Box>
            </Grid>
            {selectedMap?.attribution && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Attribution:</Typography>
                <Typography variant="body1" gutterBottom>{selectedMap.attribution}</Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
          <Button 
            variant="outlined" 
            startIcon={<EditIcon />} 
            onClick={() => {
              setPreviewDialogOpen(false);
              if (selectedMap) handleEditMap(selectedMap);
            }}
          >
            Edit Map
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MapGallery; 