import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Divider,
  Paper,
  IconButton,
} from '@mui/material';
import {
  ColorLens,
  LineWeight,
  FormatShapes,
  SaveOutlined,
  UndoOutlined,
} from '@mui/icons-material';

interface StyleEditorProps {
  layerId: string;
  onChange: () => void;
}

interface LayerStyle {
  color: string;
  weight: number;
  opacity: number;
  dashArray?: string;
  fillColor?: string;
  fillOpacity?: number;
  radius?: number;
  iconUrl?: string;
  iconSize?: [number, number];
}

const StyleEditor: React.FC<StyleEditorProps> = ({ layerId, onChange }) => {
  const [style, setStyle] = useState<LayerStyle>({
    color: '#3388ff',
    weight: 3,
    opacity: 1,
    dashArray: '',
    fillColor: '#3388ff',
    fillOpacity: 0.2,
    radius: 10,
  });
  
  const [layerType, setLayerType] = useState<'line' | 'polygon' | 'point'>('line');
  const [originalStyle, setOriginalStyle] = useState<LayerStyle | null>(null);

  // Simulate loading layer style when layerId changes
  useEffect(() => {
    // In a real app, this would fetch the style from an API
    console.log(`Loading style for layer ${layerId}`);
    
    // Determine layer type based on layer ID (in a real app, this would come from the API)
    let newLayerType: 'line' | 'polygon' | 'point' = 'line';
    if (layerId === 'bikeways' || layerId === 'roads' || layerId === 'transit' || layerId === 'sidewalks') {
      newLayerType = 'line';
    } else if (layerId === 'demographics') {
      newLayerType = 'polygon';
    } else if (layerId === 'feedback') {
      newLayerType = 'point';
    }
    
    setLayerType(newLayerType);
    
    // Simulate different styles based on layer ID
    let newStyle: LayerStyle;
    
    switch (layerId) {
      case 'roads':
        newStyle = {
          color: '#333333',
          weight: 5,
          opacity: 1,
          dashArray: '',
        };
        break;
      case 'transit':
        newStyle = {
          color: '#e74c3c',
          weight: 4,
          opacity: 1,
          dashArray: '',
        };
        break;
      case 'bikeways':
        newStyle = {
          color: '#27ae60',
          weight: 3,
          opacity: 1,
          dashArray: '5, 10',
        };
        break;
      case 'sidewalks':
        newStyle = {
          color: '#9b59b6',
          weight: 2,
          opacity: 0.8,
          dashArray: '3, 5',
        };
        break;
      case 'demographics':
        newStyle = {
          color: '#3498db',
          weight: 1,
          opacity: 1,
          fillColor: '#3498db',
          fillOpacity: 0.6,
        };
        break;
      case 'feedback':
        newStyle = {
          color: '#e67e22',
          weight: 1,
          opacity: 1,
          fillColor: '#e67e22',
          fillOpacity: 0.8,
          radius: 8,
        };
        break;
      default:
        newStyle = {
          color: '#3388ff',
          weight: 3,
          opacity: 1,
          dashArray: '',
          fillColor: '#3388ff',
          fillOpacity: 0.2,
          radius: 10,
        };
    }
    
    setStyle(newStyle);
    setOriginalStyle(newStyle);
  }, [layerId]);

  const handleStyleChange = (field: keyof LayerStyle, value: any) => {
    setStyle(prev => ({ ...prev, [field]: value }));
    onChange(); // Notify parent of changes
  };

  const handleResetStyles = () => {
    if (originalStyle) {
      setStyle(originalStyle);
    }
  };

  const handleSaveStyles = () => {
    // In a real app, this would save the style to an API
    console.log(`Saving style for layer ${layerId}:`, style);
    setOriginalStyle(style);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
          {layerType === 'line' ? 'Line Style' : 
           layerType === 'polygon' ? 'Polygon Style' : 
           'Point Style'}
        </Typography>
        <IconButton onClick={handleResetStyles} size="small" sx={{ mr: 1 }}>
          <UndoOutlined />
        </IconButton>
        <Button
          variant="contained"
          size="small"
          startIcon={<SaveOutlined />}
          onClick={handleSaveStyles}
        >
          Save
        </Button>
      </Box>

      <Grid container spacing={2}>
        {/* Color picker */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Color"
            type="color"
            value={style.color}
            onChange={(e) => handleStyleChange('color', e.target.value)}
            InputProps={{
              startAdornment: <ColorLens sx={{ mr: 1 }} />,
            }}
          />
        </Grid>

        {/* Line weight / stroke width */}
        <Grid item xs={12} sm={6}>
          <Box>
            <Typography variant="caption" display="block" gutterBottom>
              Weight: {style.weight}px
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LineWeight sx={{ mr: 1, color: 'text.secondary' }} />
              <Slider
                value={style.weight}
                min={0}
                max={10}
                step={0.5}
                onChange={(_, value) => handleStyleChange('weight', value)}
              />
            </Box>
          </Box>
        </Grid>

        {/* Opacity */}
        <Grid item xs={12} sm={6}>
          <Box>
            <Typography variant="caption" display="block" gutterBottom>
              Opacity: {Math.round(style.opacity * 100)}%
            </Typography>
            <Slider
              value={style.opacity}
              min={0}
              max={1}
              step={0.1}
              onChange={(_, value) => handleStyleChange('opacity', value)}
            />
          </Box>
        </Grid>

        {/* Line style / dash array (for lines only) */}
        {layerType === 'line' && (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Line Style</InputLabel>
              <Select
                value={style.dashArray || ''}
                label="Line Style"
                onChange={(e) => handleStyleChange('dashArray', e.target.value)}
              >
                <MenuItem value="">Solid</MenuItem>
                <MenuItem value="5, 5">Dashed</MenuItem>
                <MenuItem value="1, 5">Dotted</MenuItem>
                <MenuItem value="10, 5, 5, 5">Dash-Dot</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Fill options for polygons */}
        {layerType === 'polygon' && (
          <>
            <Grid item xs={12}>
              <Divider textAlign="left">Fill Properties</Divider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fill Color"
                type="color"
                value={style.fillColor}
                onChange={(e) => handleStyleChange('fillColor', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="caption" display="block" gutterBottom>
                  Fill Opacity: {Math.round((style.fillOpacity || 0) * 100)}%
                </Typography>
                <Slider
                  value={style.fillOpacity || 0}
                  min={0}
                  max={1}
                  step={0.1}
                  onChange={(_, value) => handleStyleChange('fillOpacity', value)}
                />
              </Box>
            </Grid>
          </>
        )}

        {/* Point specific options */}
        {layerType === 'point' && (
          <>
            <Grid item xs={12}>
              <Divider textAlign="left">Point Properties</Divider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="caption" display="block" gutterBottom>
                  Radius: {style.radius || 0}px
                </Typography>
                <Slider
                  value={style.radius || 10}
                  min={2}
                  max={30}
                  step={1}
                  onChange={(_, value) => handleStyleChange('radius', value)}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Icon Type</InputLabel>
                <Select
                  value="default"
                  label="Icon Type"
                >
                  <MenuItem value="default">Default</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </>
        )}
      </Grid>

      {/* Style preview */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>Preview</Typography>
        <Paper 
          sx={{ 
            p: 2, 
            bgcolor: 'background.default', 
            border: '1px solid', 
            borderColor: 'divider',
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {layerType === 'line' && (
            <Box 
              sx={{ 
                width: '100%', 
                height: 0,
                borderTop: `${style.weight}px ${style.dashArray ? 'dashed' : 'solid'} ${style.color}`,
                opacity: style.opacity
              }} 
            />
          )}
          
          {layerType === 'polygon' && (
            <Box 
              sx={{ 
                width: '80%', 
                height: '80%',
                border: `${style.weight}px solid ${style.color}`,
                bgcolor: style.fillColor,
                opacity: style.opacity,
                '& > div': {
                  opacity: style.fillOpacity 
                }
              }} 
            />
          )}
          
          {layerType === 'point' && (
            <Box 
              sx={{ 
                width: (style.radius || 10) * 2, 
                height: (style.radius || 10) * 2,
                borderRadius: '50%',
                bgcolor: style.fillColor,
                border: `${style.weight}px solid ${style.color}`,
                opacity: style.opacity
              }} 
            />
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default StyleEditor; 