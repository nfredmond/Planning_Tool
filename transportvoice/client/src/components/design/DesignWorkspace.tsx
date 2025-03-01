import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Button,
  TextField,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  Chip,
  Badge,
  CircularProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab
} from '@mui/material';
import {
  DirectionsBike as BikeIcon,
  DirectionsWalk as WalkIcon,
  DirectionsCar as CarIcon,
  DirectionsBus as BusIcon,
  NaturePeople as TreeIcon,
  ArrowBack as BackIcon,
  AddCircle as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Share as ShareIcon,
  CloudUpload as UploadIcon,
  Language as PublishIcon,
  Chat as CommentIcon,
  AccountCircle as UserIcon,
  Colorize as ColorizeIcon,
  FormatPaint as StyleIcon,
  LayersClear as LayersIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  AccountTree as VersionIcon,
  Ballot as ListIcon,
  LibraryAdd as TemplateIcon
} from '@mui/icons-material';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Project } from '../../types/Project';
import { 
  DesignAlternative, 
  DesignComment, 
  DesignElement 
} from '../../types/Design';
import { 
  getDesignAlternatives, 
  saveDesignAlternative, 
  getDesignComments,
  addDesignComment 
} from '../../services/designService';
import ElementPalette from './ElementPalette';
import DesignPropertyEditor from './DesignPropertyEditor';
import DesignComments from './DesignComments';
import VersionHistory from './VersionHistory';
import DesignTemplateLibrary from './DesignTemplateLibrary';

// Set Mapbox token - use environment variable
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN || '';
mapboxgl.accessToken = MAPBOX_TOKEN;

// Styled components
const MapContainer = styled.div`
  width: 100%;
  height: 100%;
  min-height: 500px;
`;

const ToolbarContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: white;
  padding: 8px;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
`;

const MeasurementInfo = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: white;
  padding: 10px;
  border-radius: 4px;
  z-index: 10;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
`;

interface DesignWorkspaceProps {
  project: Project;
  alternativeId?: string;
  readOnly?: boolean;
  onSave?: (designId: string) => void;
  onBack?: () => void;
}

const DesignWorkspace: React.FC<DesignWorkspaceProps> = ({
  project,
  alternativeId,
  readOnly = false,
  onSave,
  onBack
}) => {
  // Refs
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<any>(null);
  const drawControls = useRef<HTMLDivElement>(null);
  
  // State
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'design' | 'comments' | 'versions'>('design');
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [templateLibraryOpen, setTemplateLibraryOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<any | null>(null);
  const [currentAlternative, setCurrentAlternative] = useState<DesignAlternative | null>(null);
  const [comments, setComments] = useState<DesignComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentPoint, setCommentPoint] = useState<[number, number] | null>(null);
  const [addingComment, setAddingComment] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [alternativeName, setAlternativeName] = useState('');
  const [alternativeDescription, setAlternativeDescription] = useState('');
  const [selectedElement, setSelectedElement] = useState<DesignElement | null>(null);
  const [measurementMode, setMeasurementMode] = useState(false);
  const [measurementStart, setMeasurementStart] = useState<mapboxgl.LngLat | null>(null);
  const [measurementEnd, setMeasurementEnd] = useState<mapboxgl.LngLat | null>(null);
  const [measurementDistance, setMeasurementDistance] = useState<number | null>(null);
  
  // Hooks
  const navigate = useNavigate();

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v10',
      center: project.bounds ? [
        (project.bounds.east + project.bounds.west) / 2,
        (project.bounds.north + project.bounds.south) / 2
      ] : [-96, 37.8],
      zoom: 15,
      preserveDrawingBuffer: true // Needed for image export
    });

    // Initialize MapboxDraw
    const drawInstance = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        point: true,
        line_string: true,
        polygon: true,
        trash: true
      },
      styles: [
        {
          'id': 'gl-draw-polygon-fill-inactive',
          'type': 'fill',
          'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon']],
          'paint': {
            'fill-color': ['get', 'fill'],
            'fill-outline-color': ['get', 'stroke'],
            'fill-opacity': ['get', 'fillOpacity']
          }
        },
        {
          'id': 'gl-draw-polygon-fill-active',
          'type': 'fill',
          'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
          'paint': {
            'fill-color': '#3bb2d0',
            'fill-outline-color': '#3bb2d0',
            'fill-opacity': 0.5
          }
        },
        {
          'id': 'gl-draw-polygon-stroke-inactive',
          'type': 'line',
          'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon']],
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color': ['get', 'stroke'],
            'line-width': ['get', 'strokeWidth'],
            'line-dasharray': ['get', 'lineDashArray']
          }
        },
        {
          'id': 'gl-draw-polygon-stroke-active',
          'type': 'line',
          'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color': '#3bb2d0',
            'line-width': 2
          }
        },
        {
          'id': 'gl-draw-line-inactive',
          'type': 'line',
          'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'LineString']],
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color': ['get', 'stroke'],
            'line-width': ['get', 'strokeWidth'],
            'line-dasharray': ['get', 'lineDashArray']
          }
        },
        {
          'id': 'gl-draw-line-active',
          'type': 'line',
          'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'LineString']],
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color': '#3bb2d0',
            'line-width': 2
          }
        },
        {
          'id': 'gl-draw-point-inactive',
          'type': 'circle',
          'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Point']],
          'paint': {
            'circle-radius': ['get', 'pointSize'],
            'circle-color': ['get', 'fill'],
            'circle-stroke-color': ['get', 'stroke'],
            'circle-stroke-width': ['get', 'strokeWidth']
          }
        },
        {
          'id': 'gl-draw-point-active',
          'type': 'circle',
          'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Point']],
          'paint': {
            'circle-radius': 8,
            'circle-color': '#3bb2d0',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
          }
        }
      ]
    });

    draw.current = drawInstance;
    map.current = newMap;

    // Wait for map to load
    newMap.on('load', () => {
      newMap.addControl(drawInstance);
      
      // Setup event listeners for draw
      newMap.on('draw.create', handleDrawCreate);
      newMap.on('draw.update', handleDrawUpdate);
      newMap.on('draw.delete', handleDrawDelete);
      newMap.on('draw.selectionchange', handleSelectionChange);
      newMap.on('click', handleMapClick);

      // Add project layers
      addProjectLayers();

      // Load existing design if alternativeId is provided
      if (alternativeId) {
        loadDesignAlternative(alternativeId);
      } else {
        setLoading(false);
      }

      setMapLoaded(true);
    });

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [project, alternativeId]);

  // Load design alternative
  const loadDesignAlternative = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch design alternative and comments
      const alternative = await getDesignAlternatives(project._id, id);
      const designComments = await getDesignComments(id);
      
      if ('features' in alternative) {
        setCurrentAlternative(alternative as DesignAlternative);
        setComments(designComments);
        setAlternativeName(alternative.name);
        setAlternativeDescription(alternative.description || '');
        
        // If map and draw are ready, load the design features
        if (map.current && draw.current) {
          draw.current.deleteAll();
          
          if (alternative.features && alternative.features.length > 0) {
            draw.current.add(alternative.features);
          }
        }
      }
    } catch (err) {
      console.error('Error loading design alternative:', err);
      setError('Failed to load design alternative. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add project layers to map
  const addProjectLayers = () => {
    if (!map.current) return;
    
    // Add any project-specific layers
    project.layers?.forEach((layer, index) => {
      if (!map.current) return;
      
      // Check if the layer URL is available
      if (!layer.url) return;

      // For GeoJSON layers
      if (layer.type === 'geojson') {
        fetch(layer.url)
          .then(response => response.json())
          .then(data => {
            if (!map.current) return;
            
            const sourceId = `project-source-${index}`;
            const layerId = `project-layer-${index}`;
            
            map.current.addSource(sourceId, {
              type: 'geojson',
              data
            });
            
            map.current.addLayer({
              id: layerId,
              type: 'line',
              source: sourceId,
              layout: {
                'line-join': 'round',
                'line-cap': 'round',
                'visibility': 'visible'
              },
              paint: {
                'line-color': '#888',
                'line-width': 1,
                'line-opacity': 0.6
              }
            });
          })
          .catch(err => console.error(`Error loading project layer ${layer.name}:`, err));
      }
    });
  };

  // Event handlers for draw
  const handleDrawCreate = (e: any) => {
    console.log('Feature created:', e.features);
    
    // Set default properties for the new feature
    const feature = e.features[0];
    const defaultProperties = getDefaultProperties(feature);
    
    if (draw.current) {
      draw.current.setFeatureProperty(
        feature.id, 
        'elementType', 
        defaultProperties.elementType
      );
      
      Object.entries(defaultProperties).forEach(([key, value]) => {
        draw.current.setFeatureProperty(feature.id, key, value);
      });
    }
    
    // Select the newly created feature for editing
    setEditingFeature(feature);
    setPropertiesOpen(true);
  };

  const handleDrawUpdate = (e: any) => {
    console.log('Feature updated:', e.features);
    
    // Update the feature in state if it's the currently edited one
    if (editingFeature && e.features[0].id === editingFeature.id) {
      setEditingFeature(e.features[0]);
    }
  };

  const handleDrawDelete = (e: any) => {
    console.log('Feature deleted:', e.features);
    
    // Clear editing state if the deleted feature was being edited
    if (editingFeature && e.features.some((f: any) => f.id === editingFeature.id)) {
      setEditingFeature(null);
      setPropertiesOpen(false);
    }
  };

  const handleSelectionChange = (e: any) => {
    if (e.features.length > 0) {
      setEditingFeature(e.features[0]);
      setPropertiesOpen(true);
    } else {
      setEditingFeature(null);
      setPropertiesOpen(false);
    }
  };

  const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
    if (addingComment) {
      setCommentPoint([e.lngLat.lng, e.lngLat.lat]);
    } else if (measurementMode) {
      if (!measurementStart) {
        setMeasurementStart(e.lngLat);
      } else {
        setMeasurementEnd(e.lngLat);
        
        // Calculate distance
        if (measurementStart) {
          const start = measurementStart;
          const end = e.lngLat;
          
          // Calculate distance in meters
          const distance = calculateDistance(
            start.lat, start.lng,
            end.lat, end.lng
          );
          
          setMeasurementDistance(distance);
        }
      }
    }
  };

  // Calculate distance between two points using the Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Get default properties for a new feature based on its type
  const getDefaultProperties = (feature: any): Record<string, any> => {
    const type = feature.geometry.type;
    
    const baseProperties = {
      elementType: 'generic',
      name: 'New Element',
      description: '',
      fill: '#3bb2d0',
      stroke: '#3bb2d0',
      strokeWidth: 2,
      fillOpacity: 0.5,
      lineDashArray: [0],
      pointSize: 6
    };
    
    if (type === 'Point') {
      return {
        ...baseProperties,
        elementType: 'marker',
        fill: '#ff7f0e',
        stroke: '#000000'
      };
    } else if (type === 'LineString') {
      return {
        ...baseProperties,
        elementType: 'path',
        fill: '#1f77b4',
        stroke: '#1f77b4'
      };
    } else { // Polygon
      return {
        ...baseProperties,
        elementType: 'area',
        fill: '#2ca02c',
        stroke: '#2ca02c'
      };
    }
  };

  // Update feature properties
  const updateFeatureProperties = (properties: Record<string, any>) => {
    if (!draw.current || !editingFeature) return;
    
    Object.entries(properties).forEach(([key, value]) => {
      draw.current.setFeatureProperty(editingFeature.id, key, value);
    });
    
    // Refresh the feature
    const updatedFeature = draw.current.get(editingFeature.id);
    setEditingFeature(updatedFeature);
  };

  // Save the current design
  const handleSaveDesign = async () => {
    if (!map.current || !draw.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const features = draw.current.getAll().features;
      
      const designData: Partial<DesignAlternative> = {
        _id: currentAlternative?._id,
        projectId: project._id,
        name: alternativeName || 'Untitled Design',
        description: alternativeDescription,
        features: features,
      };
      
      const savedDesign = await saveDesignAlternative(designData);
      
      setCurrentAlternative(savedDesign);
      setSaveDialogOpen(false);
      setSuccess('Design saved successfully');
      
      if (onSave) {
        onSave(savedDesign._id!);
      }
    } catch (err) {
      console.error('Error saving design:', err);
      setError('Failed to save design. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add a comment
  const handleAddComment = async () => {
    if (!commentPoint || !newCommentText || !currentAlternative) return;
    
    try {
      const commentData: Partial<DesignComment> = {
        designId: currentAlternative._id!,
        text: newCommentText,
        location: commentPoint,
        elementId: editingFeature?.id
      };
      
      const savedComment = await addDesignComment(commentData);
      
      setComments([...comments, savedComment]);
      setNewCommentText('');
      setCommentPoint(null);
      setAddingComment(false);
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again.');
    }
  };

  // Toggle measurement mode
  const toggleMeasurementMode = () => {
    setMeasurementMode(!measurementMode);
    setMeasurementStart(null);
    setMeasurementEnd(null);
    setMeasurementDistance(null);
  };

  // Format distance for display
  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)} meters`;
    } else {
      return `${(meters / 1000).toFixed(2)} kilometers`;
    }
  };

  // Render loading state
  if (loading && !mapLoaded) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%" width="100%">
        <CircularProgress />
        <Typography variant="h6" ml={2}>Loading design workspace...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header toolbar */}
      <Paper square elevation={2} sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={onBack}>
            <BackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 1 }}>
            {currentAlternative?.name || 'New Design'}
          </Typography>
          {!readOnly && (
            <Chip 
              label="Draft" 
              size="small" 
              color="primary" 
              sx={{ ml: 1 }} 
            />
          )}
        </Box>
        
        <Box>
          {!readOnly && (
            <>
              <Button
                startIcon={<SaveIcon />}
                variant="contained"
                color="primary"
                onClick={() => setSaveDialogOpen(true)}
                sx={{ mr: 1 }}
              >
                Save
              </Button>
              <Button
                startIcon={<ShareIcon />}
                variant="outlined"
              >
                Share
              </Button>
            </>
          )}
        </Box>
      </Paper>
      
      {/* Tabs */}
      <Paper square>
        <Tabs 
          value={activeTab} 
          onChange={(_, newTab) => setActiveTab(newTab)}
        >
          <Tab value="design" label="Design" />
          <Tab 
            value="comments" 
            label="Comments" 
            icon={comments.length > 0 ? 
              <Badge badgeContent={comments.length} color="primary">
                <CommentIcon />
              </Badge> : undefined
            }
            iconPosition="end"
          />
          <Tab value="versions" label="Versions" />
        </Tabs>
      </Paper>
      
      {/* Main content */}
      <Box sx={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Map container */}
        <MapContainer ref={mapContainer} />
        
        {/* Design toolbar */}
        {activeTab === 'design' && !readOnly && (
          <ToolbarContainer>
            <Tooltip title="Draw Point">
              <IconButton 
                onClick={() => draw.current?.changeMode('draw_point')}
                color="primary"
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Draw Line">
              <IconButton 
                onClick={() => draw.current?.changeMode('draw_line_string')}
                color="primary"
              >
                <BikeIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Draw Polygon">
              <IconButton 
                onClick={() => draw.current?.changeMode('draw_polygon')}
                color="primary"
              >
                <TreeIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Delete">
              <IconButton 
                onClick={() => draw.current?.trash()}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            
            <Divider sx={{ my: 1 }} />
            
            <Tooltip title="Measure Distance">
              <IconButton 
                onClick={toggleMeasurementMode}
                color={measurementMode ? 'secondary' : 'default'}
              >
                <LayersIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Element Palette">
              <IconButton 
                onClick={() => setPaletteOpen(!paletteOpen)}
                color={paletteOpen ? 'secondary' : 'default'}
              >
                <StyleIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Templates">
              <IconButton 
                onClick={() => setTemplateLibraryOpen(true)}
              >
                <TemplateIcon />
              </IconButton>
            </Tooltip>
          </ToolbarContainer>
        )}
        
        {/* Comments mode toolbar */}
        {activeTab === 'comments' && (
          <ToolbarContainer>
            <Tooltip title={addingComment ? 'Cancel' : 'Add Comment'}>
              <IconButton 
                onClick={() => setAddingComment(!addingComment)}
                color={addingComment ? 'secondary' : 'default'}
              >
                <CommentIcon />
              </IconButton>
            </Tooltip>
            
            {addingComment && commentPoint && (
              <Box sx={{ mt: 1, p: 1, width: 250 }}>
                <TextField
                  label="Comment"
                  multiline
                  rows={3}
                  fullWidth
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  variant="outlined"
                  size="small"
                />
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Button 
                    onClick={() => {
                      setAddingComment(false);
                      setCommentPoint(null);
                      setNewCommentText('');
                    }}
                    size="small"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddComment}
                    variant="contained"
                    color="primary"
                    size="small"
                    disabled={!newCommentText}
                  >
                    Add
                  </Button>
                </Box>
              </Box>
            )}
          </ToolbarContainer>
        )}
        
        {/* Measurement info */}
        {measurementMode && measurementDistance && (
          <MeasurementInfo>
            <Typography variant="body2">
              <strong>Distance:</strong> {formatDistance(measurementDistance)}
            </Typography>
            <Button 
              size="small" 
              onClick={() => {
                setMeasurementStart(null);
                setMeasurementEnd(null);
                setMeasurementDistance(null);
              }}
            >
              Reset
            </Button>
          </MeasurementInfo>
        )}
        
        {/* Element Properties Panel */}
        <Drawer
          anchor="right"
          open={propertiesOpen}
          variant="persistent"
          sx={{ width: 320, flexShrink: 0 }}
          PaperProps={{ sx: { width: 320 } }}
        >
          {editingFeature && (
            <DesignPropertyEditor
              feature={editingFeature}
              onClose={() => setPropertiesOpen(false)}
              onUpdate={updateFeatureProperties}
            />
          )}
        </Drawer>
        
        {/* Element Palette */}
        <Drawer
          anchor="left"
          open={paletteOpen && activeTab === 'design' && !readOnly}
          variant="persistent"
          sx={{ width: 240, flexShrink: 0 }}
          PaperProps={{ sx: { width: 240 } }}
        >
          <ElementPalette
            onSelectElement={(element) => {
              // Handle element selection from palette
              console.log('Selected element from palette:', element);
            }}
            onClose={() => setPaletteOpen(false)}
          />
        </Drawer>
        
        {/* Comments Panel */}
        <Drawer
          anchor="right"
          open={commentsOpen || activeTab === 'comments'}
          variant="persistent"
          sx={{ width: 320, flexShrink: 0 }}
          PaperProps={{ sx: { width: 320 } }}
        >
          <DesignComments
            comments={comments}
            onClose={() => {
              setCommentsOpen(false);
              setActiveTab('design');
            }}
            onAddComment={() => {
              setAddingComment(true);
            }}
            designId={currentAlternative?._id || ''}
          />
        </Drawer>
      </Box>
      
      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Design</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide a name and optional description for your design.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Design Name"
            fullWidth
            value={alternativeName}
            onChange={(e) => setAlternativeName(e.target.value)}
            required
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={alternativeDescription}
            onChange={(e) => setAlternativeDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveDesign} 
            variant="contained" 
            color="primary"
            disabled={!alternativeName}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Template Library Dialog */}
      <Dialog 
        open={templateLibraryOpen} 
        onClose={() => setTemplateLibraryOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Design Templates</DialogTitle>
        <DialogContent>
          <DesignTemplateLibrary 
            onSelectTemplate={(template) => {
              // Handle template selection
              console.log('Selected template:', template);
              setTemplateLibraryOpen(false);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateLibraryOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
      
      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DesignWorkspace; 