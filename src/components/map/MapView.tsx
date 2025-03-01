import React, { useRef, useEffect, useState } from 'react';
import { Box, useTheme, CircularProgress, Paper, Typography, IconButton, Divider, FormControlLabel, Switch, Slider, TextField, InputAdornment, Tooltip, Collapse, List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search as SearchIcon, Layers as LayersIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, Map as MapIcon, Visibility as VisibleIcon, VisibilityOff as HiddenIcon } from '@mui/icons-material';
import 'leaflet-control-geocoder';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';

// Props interface
interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  id?: string;
  style?: React.CSSProperties;
}

// Sample layers for demonstration
const sampleLayers = [
  {
    id: 1,
    name: 'Bike Lanes',
    category: 'Transportation',
    visible: true,
    opacity: 0.8,
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', // Example URL
  },
  {
    id: 2,
    name: 'Bus Routes',
    category: 'Transportation',
    visible: false,
    opacity: 1.0,
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', // Example URL
  },
  {
    id: 3,
    name: 'Traffic Volumes',
    category: 'Transportation',
    visible: false,
    opacity: 0.7,
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.png', // Example URL
  }
];

// Map component with improved reliability
const MapView = ({ 
  center = [39.7285, -121.8375], // Chico, CA coordinates by default
  zoom = 13, // Slightly higher zoom level for a city view
  id = 'map-' + Math.random().toString(36).substr(2, 9),
  style 
}: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layersPanelOpen, setLayersPanelOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [layers, setLayers] = useState(sampleLayers);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const layerInstancesRef = useRef<{[key: number]: L.TileLayer}>({});

  // Handle layer visibility toggle
  const toggleLayerVisibility = (layerId: number) => {
    setLayers(prevLayers => 
      prevLayers.map(layer => {
        if (layer.id === layerId) {
          // Update layer visibility on the map
          const updatedVisibility = !layer.visible;
          const layerInstance = layerInstancesRef.current[layerId];
          
          if (layerInstance) {
            if (updatedVisibility) {
              layerInstance.addTo(mapInstanceRef.current!);
            } else {
              layerInstance.remove();
            }
          }
          
          return { ...layer, visible: updatedVisibility };
        }
        return layer;
      })
    );
  };

  // Handle layer opacity change
  const handleOpacityChange = (layerId: number, newOpacity: number) => {
    setLayers(prevLayers => 
      prevLayers.map(layer => {
        if (layer.id === layerId) {
          // Update layer opacity on the map
          const layerInstance = layerInstancesRef.current[layerId];
          if (layerInstance) {
            layerInstance.setOpacity(newOpacity);
          }
          
          return { ...layer, opacity: newOpacity };
        }
        return layer;
      })
    );
  };

  // Handle location search
  const handleLocationSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && locationSearch.trim() && mapInstanceRef.current) {
      try {
        // Use Nominatim API directly for geocoding
        const searchQuery = encodeURIComponent(locationSearch);
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&limit=1`)
          .then(response => response.json())
          .then(data => {
            if (data && data.length > 0) {
              const result = data[0];
              // Focus the map on the found location
              const lat = parseFloat(result.lat);
              const lon = parseFloat(result.lon);
              mapInstanceRef.current!.setView([lat, lon], 14);
              
              // Add a marker at the found location
              const marker = L.marker([lat, lon])
                .addTo(mapInstanceRef.current!)
                .bindPopup(result.display_name)
                .openPopup();
            } else {
              console.log("No location results found");
            }
          })
          .catch(err => {
            console.error("Error during location search:", err);
          });
      } catch (err) {
        console.error("Error during location search:", err);
      }
    }
  };

  // Initialize the map when the component mounts
  useEffect(() => {
    // Debug logging
    console.log("MapView mounting with center:", center, "zoom:", zoom);
    
    // Function to initialize map
    const initMap = () => {
      try {
        // Clean up any existing map instances
        if (mapInstanceRef.current) {
          console.log("Cleaning up existing map instance");
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
        
        if (!mapRef.current) {
          console.error("Map container ref is null");
          setError("Map container not found");
          setLoading(false);
          return;
        }
        
        // Fix Leaflet icon paths
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        console.log("Creating new map instance");
        
        // Create map with explicit options
        const mapOptions: L.MapOptions = {
          center: center,
          zoom: zoom,
          zoomControl: false, // We'll add our own zoom control with a different position
          attributionControl: true,
          fadeAnimation: true,
          zoomAnimation: true,
          markerZoomAnimation: true,
          preferCanvas: true, // Better performance
          renderer: L.canvas() // Use canvas renderer
        };
        
        // Initialize map
        mapInstanceRef.current = L.map(mapRef.current, mapOptions);
        
        // Move zoom control to bottom right to avoid conflict with geocoder
        L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current);
        
        // Try multiple tile sources (in order of preference)
        const addTileLayers = () => {
          console.log("Adding tile layers");
          
          // CARTO Voyager basemap
          const voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
          });
          
          // OpenStreetMap standard basemap
          const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
          });
          
          // Stamen Terrain basemap
          const terrain = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png', {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            subdomains: 'abcd',
            maxZoom: 18
          });

          // Try to add all layers in sequence with error handling
          try {
            voyager.addTo(mapInstanceRef.current!).on('tileerror', () => {
              console.warn("CARTO tiles failed, trying OSM");
              voyager.remove();
              try {
                osm.addTo(mapInstanceRef.current!).on('tileerror', () => {
                  console.warn("OSM tiles failed, trying Stamen Terrain");
                  osm.remove();
                  terrain.addTo(mapInstanceRef.current!);
                });
              } catch (e) {
                console.error("Failed to add OSM tiles:", e);
                terrain.addTo(mapInstanceRef.current!);
              }
            });
          } catch (e) {
            console.error("Failed to add CARTO tiles:", e);
            try {
              osm.addTo(mapInstanceRef.current!);
            } catch (e) {
              console.error("Failed to add OSM tiles:", e);
              terrain.addTo(mapInstanceRef.current!);
            }
          }
          
          // Add the geocoder control for interactive location search
          try {
            // Instead of adding the built-in control, we'll use our custom UI component
            // and handle geocoding manually
            console.log("Using custom geocoder UI instead of built-in control");
          } catch (err) {
            console.error("Failed to add geocoder control:", err);
          }
          
          // Initialize layer instances
          layers.forEach(layer => {
            const tileLayer = L.tileLayer(layer.url, {
              attribution: `Layer: ${layer.name}`,
              opacity: layer.opacity
            });
            
            // Store reference to layer instance
            layerInstancesRef.current[layer.id] = tileLayer;
            
            // Add to map if visible
            if (layer.visible) {
              tileLayer.addTo(mapInstanceRef.current!);
            }
          });
        };
        
        // Add tile layers after a short delay to ensure container is ready
        setTimeout(addTileLayers, 100);
        
        // Set up event handler for when the map is ready
        mapInstanceRef.current.whenReady(() => {
          console.log("Map is ready");
          setLoading(false);
          
          // Trigger a resize after a delay to handle any rendering issues
          setTimeout(() => {
            mapInstanceRef.current?.invalidateSize();
          }, 300);
        });
        
        // Handle error state
        mapInstanceRef.current.on('error', (e: any) => {
          console.error("Map error:", e);
          setError("Map error occurred");
        });
        
      } catch (err) {
        console.error("Error initializing map:", err);
        setError(`Map initialization error: ${err}`);
        setLoading(false);
      }
    };

    // Initialize the map
    initMap();
    
    // Clean up function
    return () => {
      console.log("MapView unmounting, cleaning up");
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom, id]); // Dependency on id ensures different instances don't conflict

  return (
    <Box
      id={id}
      ref={mapRef}
      className="leaflet-map-container"
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: '#f5f5f5', // Light background color
        position: 'relative',
        overflow: 'hidden',
        '.leaflet-container': {
          width: '100%',
          height: '100%',
          background: '#f5f5f5',
          zIndex: 1
        },
        '.leaflet-control-container': { zIndex: 2 },
        '.leaflet-pane': { zIndex: 1 },
        // Custom styling for geocoder
        '.leaflet-control-geocoder': {
          zIndex: 1000,
          boxShadow: '0 1px 5px rgba(0,0,0,0.4)',
          backgroundColor: 'white',
          borderRadius: '4px',
          padding: '5px'
        },
        '.leaflet-control-geocoder input': {
          fontSize: '16px',
          width: '240px'
        },
        // Ensure the zoom control doesn't interfere
        '.leaflet-control-zoom': {
          bottom: '20px',
          right: '10px'
        },
        ...style
      }}
    >
      {/* Custom Search Box */}
      <Paper
        elevation={3}
        sx={{
          position: 'absolute',
          top: 10,
          right: 70,
          zIndex: 1000,
          borderRadius: 1,
          width: 240,
          p: 0.5
        }}
      >
        <TextField
          fullWidth
          placeholder="Search for a location..."
          size="small"
          value={locationSearch}
          onChange={(e) => setLocationSearch(e.target.value)}
          onKeyDown={handleLocationSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" fontSize="small" />
              </InputAdornment>
            )
          }}
        />
      </Paper>

      {/* Layers Panel Button */}
      <Paper
        elevation={3}
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          borderRadius: '50%',
          p: 0
        }}
      >
        <Tooltip title={layersPanelOpen ? "Close Layers Panel" : "Open Layers Panel"}>
          <IconButton 
            color="primary" 
            onClick={() => setLayersPanelOpen(!layersPanelOpen)}
            size="large"
          >
            <LayersIcon />
          </IconButton>
        </Tooltip>
      </Paper>

      {/* Layers Panel */}
      <Collapse 
        in={layersPanelOpen} 
        sx={{ 
          position: 'absolute', 
          top: 10, 
          right: 70, 
          zIndex: 1000, 
          width: 300,
          maxHeight: 'calc(100% - 20px)',
          overflow: 'auto'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 2,
            backgroundColor: theme.palette.background.paper,
            borderRadius: 1
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center' }}>
              <LayersIcon sx={{ mr: 1 }} /> Map Layers
            </Typography>
            <IconButton size="small" onClick={() => setLayersPanelOpen(false)}>
              <ExpandMoreIcon />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <List>
            {layers.map((layer) => (
              <React.Fragment key={layer.id}>
                <ListItem>
                  <ListItemIcon>
                    <MapIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={layer.name} 
                    secondary={layer.category}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => toggleLayerVisibility(layer.id)}
                      size="small"
                    >
                      {layer.visible ? <VisibleIcon color="primary" /> : <HiddenIcon />}
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                
                {layer.visible && (
                  <Box sx={{ pl: 9, pr: 2, pb: 2 }}>
                    <Typography variant="caption" display="block" gutterBottom>
                      Opacity: {Math.round(layer.opacity * 100)}%
                    </Typography>
                    <Slider
                      value={layer.opacity}
                      min={0}
                      max={1}
                      step={0.1}
                      onChange={(_, value) => handleOpacityChange(layer.id, value as number)}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                      size="small"
                    />
                  </Box>
                )}
                
                <Divider variant="inset" />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Collapse>

      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 999,
            bgcolor: 'rgba(255,255,255,0.7)',
            padding: 2,
            borderRadius: 1
          }}
        >
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 999,
            bgcolor: 'rgba(255,255,255,0.9)',
            padding: 2,
            borderRadius: 1,
            color: 'error.main',
            maxWidth: '80%',
            textAlign: 'center'
          }}
        >
          {error}
        </Box>
      )}
    </Box>
  );
};

export default MapView;