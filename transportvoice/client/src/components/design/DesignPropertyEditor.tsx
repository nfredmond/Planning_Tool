import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  Slider,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  FormGroup,
  FormControlLabel,
  Switch,
  Collapse,
  Paper,
  Grid,
  Tabs,
  Tab,
  Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ColorLens as ColorIcon
} from '@mui/icons-material';
import { ChromePicker } from 'react-color';

interface DesignPropertyEditorProps {
  feature: any;
  onClose: () => void;
  onUpdate: (properties: Record<string, any>) => void;
}

const DesignPropertyEditor: React.FC<DesignPropertyEditorProps> = ({
  feature,
  onClose,
  onUpdate
}) => {
  // State for properties
  const [name, setName] = useState(feature.properties?.name || 'Untitled Element');
  const [description, setDescription] = useState(feature.properties?.description || '');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'style'>('general');
  
  // Style properties based on feature geometry type
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [colorProperty, setColorProperty] = useState<'fill' | 'stroke'>('fill');
  const [fillColor, setFillColor] = useState(feature.properties?.fill || '#3bb2d0');
  const [strokeColor, setStrokeColor] = useState(feature.properties?.stroke || '#3bb2d0');
  const [strokeWidth, setStrokeWidth] = useState(feature.properties?.strokeWidth || 2);
  const [fillOpacity, setFillOpacity] = useState(feature.properties?.fillOpacity || 0.5);
  const [pointSize, setPointSize] = useState(feature.properties?.pointSize || 6);
  const [lineDashArray, setLineDashArray] = useState<number>(
    Array.isArray(feature.properties?.lineDashArray) 
      ? (feature.properties.lineDashArray[0] === 0 ? 0 : 
         feature.properties.lineDashArray[0] === 1 ? 1 : 
         feature.properties.lineDashArray[0] === 2 && feature.properties.lineDashArray[1] === 2 ? 2 : 
         feature.properties.lineDashArray[0] === 4 && feature.properties.lineDashArray[1] === 2 ? 3 : 0)
      : 0
  );

  // Get feature type
  const geometryType = feature.geometry?.type || '';
  const isPoint = geometryType === 'Point';
  const isLine = geometryType === 'LineString';
  const isPolygon = geometryType === 'Polygon';

  // Update properties in parent component when they change
  useEffect(() => {
    const updatedProperties = {
      name,
      description,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth,
      fillOpacity,
      pointSize,
      lineDashArray: getLineDashArray(lineDashArray)
    };
    
    onUpdate(updatedProperties);
  }, [name, description, fillColor, strokeColor, strokeWidth, fillOpacity, pointSize, lineDashArray]);

  // Convert line dash array selection to actual array values
  const getLineDashArray = (value: number): number[] => {
    switch (value) {
      case 1: return [1]; // Dotted
      case 2: return [2, 2]; // Dashed
      case 3: return [4, 2]; // Long dash
      default: return [0]; // Solid
    }
  };

  // Handle color picker open
  const handleColorPickerOpen = (property: 'fill' | 'stroke') => {
    setColorProperty(property);
    setColorPickerOpen(true);
  };

  // Handle color change
  const handleColorChange = (color: any) => {
    if (colorProperty === 'fill') {
      setFillColor(color.hex);
    } else {
      setStrokeColor(color.hex);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 0 }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Element Properties</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Divider />
      
      <Box sx={{ p: 0 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="General" value="general" />
          <Tab label="Style" value="style" />
        </Tabs>
      </Box>
      
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {/* General properties tab */}
        {activeTab === 'general' && (
          <>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              margin="normal"
              size="small"
              variant="outlined"
            />
            
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              margin="normal"
              size="small"
              variant="outlined"
            />
            
            <Box sx={{ mt: 2 }}>
              <Button
                startIcon={advancedOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={() => setAdvancedOpen(!advancedOpen)}
                color="inherit"
                fullWidth
                sx={{ justifyContent: 'flex-start' }}
              >
                Advanced Properties
              </Button>
              
              <Collapse in={advancedOpen}>
                <Box sx={{ mt: 1, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  {/* Point-specific properties */}
                  {isPoint && (
                    <FormControl fullWidth margin="normal" size="small">
                      <InputLabel>Point Type</InputLabel>
                      <Select
                        value={feature.properties?.elementType || 'marker'}
                        onChange={(e) => onUpdate({ elementType: e.target.value })}
                        label="Point Type"
                      >
                        <MenuItem value="marker">Marker</MenuItem>
                        <MenuItem value="poi">Point of Interest</MenuItem>
                        <MenuItem value="junction">Junction</MenuItem>
                        <MenuItem value="label">Label</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                  
                  {/* Line-specific properties */}
                  {isLine && (
                    <FormControl fullWidth margin="normal" size="small">
                      <InputLabel>Line Type</InputLabel>
                      <Select
                        value={feature.properties?.elementType || 'path'}
                        onChange={(e) => onUpdate({ elementType: e.target.value })}
                        label="Line Type"
                      >
                        <MenuItem value="path">Path</MenuItem>
                        <MenuItem value="road">Road</MenuItem>
                        <MenuItem value="bikeLane">Bike Lane</MenuItem>
                        <MenuItem value="walkway">Walkway</MenuItem>
                        <MenuItem value="transit">Transit</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                  
                  {/* Polygon-specific properties */}
                  {isPolygon && (
                    <FormControl fullWidth margin="normal" size="small">
                      <InputLabel>Area Type</InputLabel>
                      <Select
                        value={feature.properties?.elementType || 'area'}
                        onChange={(e) => onUpdate({ elementType: e.target.value })}
                        label="Area Type"
                      >
                        <MenuItem value="area">Generic Area</MenuItem>
                        <MenuItem value="building">Building</MenuItem>
                        <MenuItem value="park">Park</MenuItem>
                        <MenuItem value="water">Water</MenuItem>
                        <MenuItem value="parking">Parking</MenuItem>
                        <MenuItem value="residential">Residential</MenuItem>
                        <MenuItem value="commercial">Commercial</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                </Box>
              </Collapse>
            </Box>
          </>
        )}
        
        {/* Style properties tab */}
        {activeTab === 'style' && (
          <>
            <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
              {/* Fill color (for points and polygons) */}
              {(isPoint || isPolygon) && (
                <>
                  <Grid item xs={6}>
                    <Typography variant="body2">Fill Color</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: fillColor,
                          borderRadius: '4px',
                          mr: 1,
                          border: '1px solid rgba(0, 0, 0, 0.12)',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleColorPickerOpen('fill')}
                      />
                      <Typography variant="body2">{fillColor}</Typography>
                    </Box>
                  </Grid>
                </>
              )}
              
              {/* Stroke color (for all types) */}
              <Grid item xs={6}>
                <Typography variant="body2">Stroke Color</Typography>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      bgcolor: strokeColor,
                      borderRadius: '4px',
                      mr: 1,
                      border: '1px solid rgba(0, 0, 0, 0.12)',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleColorPickerOpen('stroke')}
                  />
                  <Typography variant="body2">{strokeColor}</Typography>
                </Box>
              </Grid>
              
              {/* Stroke width (for all types) */}
              <Grid item xs={12}>
                <Typography variant="body2" gutterBottom>
                  Stroke Width
                </Typography>
                <Slider
                  value={strokeWidth}
                  onChange={(_, value) => setStrokeWidth(value as number)}
                  min={1}
                  max={10}
                  step={0.5}
                  valueLabelDisplay="auto"
                  size="small"
                />
              </Grid>
              
              {/* Point size (for points only) */}
              {isPoint && (
                <Grid item xs={12}>
                  <Typography variant="body2" gutterBottom>
                    Point Size
                  </Typography>
                  <Slider
                    value={pointSize}
                    onChange={(_, value) => setPointSize(value as number)}
                    min={4}
                    max={20}
                    step={1}
                    valueLabelDisplay="auto"
                    size="small"
                  />
                </Grid>
              )}
              
              {/* Fill opacity (for polygons only) */}
              {isPolygon && (
                <Grid item xs={12}>
                  <Typography variant="body2" gutterBottom>
                    Fill Opacity
                  </Typography>
                  <Slider
                    value={fillOpacity}
                    onChange={(_, value) => setFillOpacity(value as number)}
                    min={0}
                    max={1}
                    step={0.05}
                    valueLabelDisplay="auto"
                    size="small"
                  />
                </Grid>
              )}
              
              {/* Line style (for lines and polygons) */}
              {(isLine || isPolygon) && (
                <Grid item xs={12}>
                  <FormControl fullWidth size="small" margin="normal">
                    <InputLabel>Line Style</InputLabel>
                    <Select
                      value={lineDashArray}
                      onChange={(e) => setLineDashArray(e.target.value as number)}
                      label="Line Style"
                    >
                      <MenuItem value={0}>Solid</MenuItem>
                      <MenuItem value={1}>Dotted</MenuItem>
                      <MenuItem value={2}>Dashed</MenuItem>
                      <MenuItem value={3}>Long Dash</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
            
            {/* Color picker */}
            {colorPickerOpen && (
              <Box sx={{ position: 'absolute', zIndex: 2, mt: 2 }}>
                <Box
                  sx={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                  }}
                  onClick={() => setColorPickerOpen(false)}
                />
                <ChromePicker
                  color={colorProperty === 'fill' ? fillColor : strokeColor}
                  onChange={handleColorChange}
                  disableAlpha
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default DesignPropertyEditor; 