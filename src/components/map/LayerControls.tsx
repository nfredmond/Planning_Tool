import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Collapse,
  IconButton,
  Slider,
  Divider,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Layers as LayersIcon,
  Map as MapIcon,
  DirectionsWalk as PedestrianIcon,
  DirectionsBike as BikeIcon,
  DirectionsCar as RoadIcon,
  DirectionsBus as TransitIcon,
  Train as RailIcon,
  People as DemographicIcon,
  Public as EnvironmentIcon,
  Comment as FeedbackIcon,
  ExpandLess,
  ExpandMore,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

export interface Layer {
  id: string;
  name: string;
  category: string;
  visible: boolean;
  opacity?: number;
  icon?: React.ReactNode;
  description?: string;
}

export interface LayerControlsProps {
  onLayerSelect?: (layerId: string) => void;
  selectedLayerId?: string;
  onLayerVisibilityChange?: (layerId: string, visible: boolean) => void;
  onLayerOpacityChange?: (layerId: string, opacity: number) => void;
  onEditLayerStyle?: (layerId: string) => void;
}

const DEFAULT_LAYERS: Layer[] = [
  {
    id: 'roads',
    name: 'Roads',
    category: 'transportation',
    visible: true,
    opacity: 1,
    icon: <RoadIcon />,
    description: 'Major and minor roads in the region',
  },
  {
    id: 'bikeways',
    name: 'Bike Lanes',
    category: 'transportation',
    visible: true,
    opacity: 1,
    icon: <BikeIcon />,
    description: 'Existing and proposed bike lanes',
  },
  {
    id: 'sidewalks',
    name: 'Sidewalks',
    category: 'transportation',
    visible: false,
    opacity: 0.8,
    icon: <PedestrianIcon />,
    description: 'Sidewalks and pedestrian paths',
  },
  {
    id: 'transit',
    name: 'Transit Routes',
    category: 'transportation',
    visible: false,
    opacity: 0.9,
    icon: <TransitIcon />,
    description: 'Bus and shuttle routes',
  },
  {
    id: 'rail',
    name: 'Rail Lines',
    category: 'transportation',
    visible: false,
    opacity: 1,
    icon: <RailIcon />,
    description: 'Light rail and commuter rail lines',
  },
  {
    id: 'population',
    name: 'Population Density',
    category: 'demographic',
    visible: false,
    opacity: 0.7,
    icon: <DemographicIcon />,
    description: 'Population density by census tract',
  },
  {
    id: 'income',
    name: 'Median Income',
    category: 'demographic',
    visible: false,
    opacity: 0.7,
    icon: <DemographicIcon />,
    description: 'Median household income by census tract',
  },
  {
    id: 'air-quality',
    name: 'Air Quality',
    category: 'environmental',
    visible: false,
    opacity: 0.6,
    icon: <EnvironmentIcon />,
    description: 'Air quality index measurements',
  },
  {
    id: 'noise',
    name: 'Noise Levels',
    category: 'environmental',
    visible: false,
    opacity: 0.6,
    icon: <EnvironmentIcon />,
    description: 'Noise levels from transportation sources',
  },
  {
    id: 'feedback',
    name: 'Community Feedback',
    category: 'community',
    visible: true,
    opacity: 1,
    icon: <FeedbackIcon />,
    description: 'Public comments and feedback locations',
  },
];

const LayerControls: React.FC<LayerControlsProps> = ({
  onLayerSelect,
  selectedLayerId,
  onLayerVisibilityChange,
  onLayerOpacityChange,
  onEditLayerStyle,
}) => {
  const [layers, setLayers] = useState<Layer[]>(DEFAULT_LAYERS);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    transportation: true,
    demographic: false,
    environmental: false,
    community: false,
  });

  const handleCategoryToggle = (category: string) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category],
    });
  };

  const handleLayerVisibilityToggle = (layerId: string) => {
    const updatedLayers = layers.map(layer =>
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    );
    setLayers(updatedLayers);
    
    const layer = layers.find(l => l.id === layerId);
    if (layer && onLayerVisibilityChange) {
      onLayerVisibilityChange(layerId, !layer.visible);
    }
  };

  const handleLayerOpacityChange = (layerId: string, newOpacity: number) => {
    const updatedLayers = layers.map(layer =>
      layer.id === layerId ? { ...layer, opacity: newOpacity } : layer
    );
    setLayers(updatedLayers);
    
    if (onLayerOpacityChange) {
      onLayerOpacityChange(layerId, newOpacity);
    }
  };

  const handleLayerSelect = (layerId: string) => {
    if (onLayerSelect) {
      onLayerSelect(layerId);
    }
  };

  const handleEditStyle = (layerId: string) => {
    if (onEditLayerStyle) {
      onEditLayerStyle(layerId);
    }
  };

  // Group layers by category
  const categories = layers.reduce((acc, layer) => {
    if (!acc[layer.category]) {
      acc[layer.category] = [];
    }
    acc[layer.category].push(layer);
    return acc;
  }, {} as Record<string, Layer[]>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'transportation':
        return <MapIcon />;
      case 'demographic':
        return <DemographicIcon />;
      case 'environmental':
        return <EnvironmentIcon />;
      case 'community':
        return <FeedbackIcon />;
      default:
        return <LayersIcon />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'transportation':
        return 'Transportation';
      case 'demographic':
        return 'Demographics';
      case 'environmental':
        return 'Environmental';
      case 'community':
        return 'Community';
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Map Layers
      </Typography>
      <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
        <List component="nav" dense>
          {Object.keys(categories).map(category => (
            <React.Fragment key={category}>
              <ListItem button onClick={() => handleCategoryToggle(category)}>
                <ListItemIcon>
                  {getCategoryIcon(category)}
                </ListItemIcon>
                <ListItemText primary={getCategoryLabel(category)} />
                {expandedCategories[category] ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={expandedCategories[category]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {categories[category].map(layer => (
                    <React.Fragment key={layer.id}>
                      <ListItem 
                        button 
                        sx={{ pl: 4 }}
                        selected={selectedLayerId === layer.id}
                        onClick={() => handleLayerSelect(layer.id)}
                      >
                        <ListItemIcon>
                          {layer.icon || <LayersIcon />}
                        </ListItemIcon>
                        <ListItemText 
                          primary={layer.name} 
                          secondary={layer.description} 
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="Edit Style">
                            <IconButton 
                              edge="end" 
                              aria-label="edit" 
                              onClick={() => handleEditStyle(layer.id)}
                              sx={{ mr: 1 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={layer.visible ? "Hide Layer" : "Show Layer"}>
                            <IconButton 
                              edge="end" 
                              aria-label="toggle visibility"
                              onClick={() => handleLayerVisibilityToggle(layer.id)}
                            >
                              {layer.visible ? 
                                <VisibilityIcon fontSize="small" /> : 
                                <VisibilityOffIcon fontSize="small" />
                              }
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {layer.visible && (
                        <ListItem sx={{ pl: 4, pr: 9 }}>
                          <Box sx={{ width: '100%', pl: 6 }}>
                            <Typography variant="caption" id={`opacity-slider-${layer.id}`}>
                              Opacity: {Math.round((layer.opacity || 1) * 100)}%
                            </Typography>
                            <Slider
                              size="small"
                              value={layer.opacity || 1}
                              min={0}
                              max={1}
                              step={0.1}
                              aria-labelledby={`opacity-slider-${layer.id}`}
                              onChange={(_, value) => handleLayerOpacityChange(layer.id, value as number)}
                            />
                          </Box>
                        </ListItem>
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </Collapse>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default LayerControls; 