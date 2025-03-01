import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
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
  Slider,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Map as MapIcon,
  Preview as PreviewIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import MapPreview from './MapPreview';

const MapGallery: React.FC = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  // State for map list
  const [maps, setMaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedMap, setSelectedMap] = useState<any>(null);
  
  // State for form
  const [formValues, setFormValues] = useState({
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
    isDefault: false
  });
  
  // State for map preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMap, setPreviewMap] = useState<any>(null);

  // Load maps on component mount
  useEffect(() => {
    fetchMaps();
  }, []);

  // Fetch maps from API
  const fetchMaps = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/maps');
      setMaps(response.data);
    } catch (error) {
      console.error('Error fetching maps:', error);
      enqueueSnackbar('Failed to load maps', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handle opening dialog for adding new map
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
      isDefault: false
    });
    setOpenDialog(true);
  };

  // Handle opening dialog for editing existing map
  const handleEditMap = (map: any) => {
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
      isDefault: map.isDefault
    });
    setOpenDialog(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  // Handle select input changes
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  // Handle switch changes
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormValues({ ...formValues, [name]: checked });
  };

  // Handle slider changes
  const handleSliderChange = (name: string) => (e: any, newValue: number | number[]) => {
    setFormValues({ ...formValues, [name]: newValue });
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (dialogMode === 'add') {
        await axios.post('/api/admin/maps', formValues);
        enqueueSnackbar('Map added successfully', { variant: 'success' });
      } else {
        await axios.put(`/api/admin/maps/${selectedMap._id}`, formValues);
        enqueueSnackbar('Map updated successfully', { variant: 'success' });
      }
      setOpenDialog(false);
      fetchMaps();
    } catch (error) {
      console.error('Error saving map:', error);
      enqueueSnackbar('Failed to save map', { variant: 'error' });
    }
  };

  // Handle map deletion
  const handleDeleteMap = async (mapId: string) => {
    if (window.confirm('Are you sure you want to delete this map?')) {
      try {
        await axios.delete(`/api/admin/maps/${mapId}`);
        enqueueSnackbar('Map deleted successfully', { variant: 'success' });
        fetchMaps();
      } catch (error) {
        console.error('Error deleting map:', error);
        enqueueSnackbar('Failed to delete map', { variant: 'error' });
      }
    }
  };

  // Handle setting map as default
  const handleSetDefault = async (mapId: string) => {
    try {
      const map = maps.find(m => m._id === mapId);
      if (!map) return;
      
      await axios.put(`/api/admin/maps/${mapId}`, {
        ...map,
        isDefault: true
      });
      enqueueSnackbar('Map set as default', { variant: 'success' });
      fetchMaps();
    } catch (error) {
      console.error('Error setting default map:', error);
      enqueueSnackbar('Failed to set default map', { variant: 'error' });
    }
  };

  // Handle opening map preview
  const handleOpenPreview = (map: any) => {
    setPreviewMap(map);
    setPreviewOpen(true);
  };

  return (
    <Box sx={{ padding: 3 }}>
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

      {loading ? (
        <Typography>Loading maps...</Typography>
      ) : (
        <>
          {/* Base Maps Section */}
          <Typography variant="h5" component="h2" sx={{ mb: 2, mt: 4 }}>Base Maps</Typography>
          <Grid container spacing={3}>
            {maps.filter(map => map.isBaseMap).map(map => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={map._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={map.thumbnail || 'https://via.placeholder.com/400x200?text=Map+Preview'}
                    alt={map.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {map.name}
                      </Typography>
                      {map.isDefault && (
                        <StarIcon color="primary" fontSize="small" />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {map.description || 'No description provided'}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Type: {map.type}
                    </Typography>
                    {map.attribution && (
                      <Typography variant="caption" display="block">
                        Attribution: {map.attribution}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenPreview(map)}
                      title="Preview map"
                    >
                      <PreviewIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleEditMap(map)}
                      title="Edit map"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteMap(map._id)}
                      title="Delete map"
                      disabled={map.isDefault}
                    >
                      <DeleteIcon />
                    </IconButton>
                    {!map.isDefault && (
                      <IconButton 
                        size="small"
                        onClick={() => handleSetDefault(map._id)}
                        title="Set as default base map"
                      >
                        <StarBorderIcon />
                      </IconButton>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Overlay Maps Section */}
          <Typography variant="h5" component="h2" sx={{ mb: 2, mt: 4 }}>Overlay Maps</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>URL</TableCell>
                  <TableCell>Attribution</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {maps.filter(map => !map.isBaseMap).map(map => (
                  <TableRow key={map._id}>
                    <TableCell>{map.name}</TableCell>
                    <TableCell>{map.type}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {map.url}
                      </Typography>
                    </TableCell>
                    <TableCell>{map.attribution || '-'}</TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenPreview(map)}
                        title="Preview map"
                      >
                        <PreviewIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditMap(map)}
                        title="Edit map"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteMap(map._id)}
                        title="Delete map"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Add/Edit Map Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Map' : 'Edit Map'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Map Name"
                value={formValues.name}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Map Type</InputLabel>
                <Select
                  name="type"
                  value={formValues.type}
                  onChange={handleSelectChange}
                  label="Map Type"
                >
                  <MenuItem value="tile">Tile Layer (XYZ)</MenuItem>
                  <MenuItem value="vector">Vector Tile</MenuItem>
                  <MenuItem value="raster">Raster Layer</MenuItem>
                  <MenuItem value="wms">WMS Service</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formValues.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="url"
                label="Map URL (Tileserver URL)"
                value={formValues.url}
                onChange={handleInputChange}
                helperText="e.g. https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="thumbnail"
                label="Thumbnail URL"
                value={formValues.thumbnail}
                onChange={handleInputChange}
                helperText="URL to an image preview of the map"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="attribution"
                label="Attribution"
                value={formValues.attribution}
                onChange={handleInputChange}
                helperText="Map attribution text (e.g., © OpenStreetMap contributors)"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Zoom Range</Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={[formValues.minZoom, formValues.maxZoom]}
                  onChange={(e, newValue) => {
                    const [min, max] = newValue as number[];
                    setFormValues({
                      ...formValues,
                      minZoom: min,
                      maxZoom: max
                    });
                  }}
                  valueLabelDisplay="auto"
                  step={1}
                  marks
                  min={0}
                  max={20}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption">Min: {formValues.minZoom}</Typography>
                  <Typography variant="caption">Max: {formValues.maxZoom}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Default Opacity: {formValues.defaultOpacity}</Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={formValues.defaultOpacity}
                  onChange={handleSliderChange('defaultOpacity')}
                  valueLabelDisplay="auto"
                  step={0.1}
                  marks
                  min={0}
                  max={1}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="isBaseMap"
                    checked={formValues.isBaseMap}
                    onChange={handleSwitchChange}
                  />
                }
                label="Base Map (background layer)"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="isDefault"
                    checked={formValues.isDefault}
                    onChange={handleSwitchChange}
                    disabled={!formValues.isBaseMap}
                  />
                }
                label="Default Map (initial view)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!formValues.name || !formValues.url}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Map Preview Dialog */}
      {previewMap && (
        <Dialog
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            Preview: {previewMap.name}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ height: 500 }}>
              <MapPreview map={previewMap} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default MapGallery; 