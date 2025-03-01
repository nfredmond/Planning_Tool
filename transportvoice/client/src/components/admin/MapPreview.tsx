import React, { useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  map: {
    name: string;
    type: string;
    url: string;
    attribution?: string;
    minZoom?: number;
    maxZoom?: number;
    defaultOpacity?: number;
  };
}

const MapPreview: React.FC<MapProps> = ({ map }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const layer = useRef<L.Layer | null>(null);

  useEffect(() => {
    if (mapRef.current && !leafletMap.current) {
      // Initialize map
      leafletMap.current = L.map(mapRef.current, {
        center: [37.7749, -122.4194], // Default center (San Francisco)
        zoom: 13,
        preferCanvas: true
      });

      // Add OpenStreetMap as a base layer for context if this is an overlay
      if (map.type !== 'tile' || !map.isBaseMap) {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(leafletMap.current);
      }
    }

    // Clean up on unmount
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!leafletMap.current) return;

    // Remove previous layer if exists
    if (layer.current) {
      leafletMap.current.removeLayer(layer.current);
      layer.current = null;
    }

    // Add the new layer based on map type
    try {
      const { type, url, attribution, minZoom, maxZoom, defaultOpacity } = map;
      const opacity = defaultOpacity !== undefined ? defaultOpacity : 1;

      switch (type) {
        case 'tile':
          layer.current = L.tileLayer(url, {
            attribution: attribution || '',
            minZoom: minZoom || 0,
            maxZoom: maxZoom || 19,
            opacity
          }).addTo(leafletMap.current);
          break;

        case 'wms':
          layer.current = L.tileLayer.wms(url, {
            layers: map.layers || 'default',
            format: 'image/png',
            transparent: true,
            attribution: attribution || '',
            opacity
          }).addTo(leafletMap.current);
          break;

        case 'vector':
          // For vector tiles, we would typically use a plugin like Leaflet.VectorGrid
          // This is a simplified example
          layer.current = L.tileLayer(url, {
            attribution: attribution || '',
            minZoom: minZoom || 0,
            maxZoom: maxZoom || 19,
            opacity
          }).addTo(leafletMap.current);
          break;

        case 'raster':
          // For raster layers, we're assuming it's a tile layer
          layer.current = L.tileLayer(url, {
            attribution: attribution || '',
            minZoom: minZoom || 0,
            maxZoom: maxZoom || 19,
            opacity
          }).addTo(leafletMap.current);
          break;

        default:
          console.error(`Unsupported map type: ${type}`);
      }

      // Reset the view to ensure the layer is visible
      leafletMap.current.setView([37.7749, -122.4194], 13);
    } catch (error) {
      console.error('Error loading map layer:', error);
    }
  }, [map]);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#f0f0f0'
        }}
      />
      
      {/* Error message if map fails to load */}
      {leafletMap.current && !layer.current && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            padding: 2,
            zIndex: 1000,
          }}
        >
          <Typography color="error" align="center">
            Unable to load map layer. Please check the URL and try again.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default MapPreview; 