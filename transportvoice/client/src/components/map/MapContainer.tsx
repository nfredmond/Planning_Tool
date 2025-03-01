import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styled from 'styled-components';
import * as turf from '@turf/turf';
import { Project } from '../../types/Project';
import { Comment } from '../../types/Comment';
import { Layer } from '../../types/Layer';
import { useComments } from '../../hooks/useComments';
import { useLayers } from '../../hooks/useLayers';
import { useAuth } from '../../context/AuthContext';
import LayerControl from './LayerControl';
import CommentMarker from './CommentMarker';
import AddCommentButton from './AddCommentButton';
import MapLegend from './MapLegend';
import MapToolbar from './MapToolbar';
import CommentForm from '../comments/CommentForm';
import CommentDetailDrawer from '../comments/CommentDetailDrawer';
import MapSettingsDrawer from './MapSettingsDrawer';

// Get Mapbox access token from environment variable
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || '';

interface MapContainerProps {
  project: Project;
}

const MapContainer: React.FC<MapContainerProps> = ({ project }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [addingComment, setAddingComment] = useState(false);
  const [commentLocation, setCommentLocation] = useState<[number, number] | null>(null);
  const [mapSettings, setMapSettings] = useState({
    showHeatmap: false,
    clusterComments: true,
    commentCategories: [] as string[],
    commentDateRange: null as { start: Date; end: Date } | null,
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { comments, loading: commentsLoading, fetchComments } = useComments(project._id);
  const { layers, loading: layersLoading, fetchLayers } = useLayers(project._id);
  const { user } = useAuth();

  // Initialize map when component mounts
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    // Check if Mapbox token is available
    if (!mapboxgl.accessToken) {
      console.error('Mapbox access token is missing. Please set REACT_APP_MAPBOX_ACCESS_TOKEN in your environment.');
      return;
    }

    const initializeMap = () => {
      const newMap = new mapboxgl.Map({
        container: mapContainer.current!,
        style: getMapStyle(project.basemap),
        center: getProjectCenter(),
        zoom: 12,
        bounds: getProjectBounds(),
        pitchWithRotate: false,
      });

      // Add navigation controls
      newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
      newMap.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      }), 'top-right');
      
      // Add scale control
      newMap.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

      newMap.on('load', () => {
        setMapReady(true);
      });

      newMap.on('click', (e) => {
        if (addingComment) {
          setCommentLocation([e.lngLat.lng, e.lngLat.lat]);
        }
      });

      map.current = newMap;
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [project]);

  // Load project layers when map is ready
  useEffect(() => {
    if (!mapReady || !map.current || layersLoading) return;

    // Remove existing layers
    if (map.current.getSource('comments')) {
      map.current.removeLayer('comments-heat');
      map.current.removeLayer('comments-clusters');
      map.current.removeLayer('comments-cluster-count');
      map.current.removeLayer('comments-unclustered-point');
      map.current.removeSource('comments');
    }

    // Add comments as a source
    if (comments.length > 0) {
      const features = comments
        .filter(comment => comment.status === 'approved')
        .map(comment => {
          return {
            type: 'Feature',
            properties: {
              id: comment._id,
              title: comment.content.substring(0, 50) + (comment.content.length > 50 ? '...' : ''),
              category: comment.category || 'general',
              status: comment.status,
              votes: comment.votes.upvotes - comment.votes.downvotes,
              hasImages: comment.images.length > 0,
              createdAt: comment.createdAt,
            },
            geometry: {
              type: 'Point',
              coordinates: comment.location.coordinates,
            },
          };
        });

      const commentsSource = {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features,
        },
        cluster: mapSettings.clusterComments,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      };

      map.current.addSource('comments', commentsSource as any);

      // Add a heatmap layer
      map.current.addLayer({
        id: 'comments-heat',
        type: 'heatmap',
        source: 'comments',
        layout: {
          visibility: mapSettings.showHeatmap ? 'visible' : 'none',
        },
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'votes'],
            -5, 0,
            0, 0.5,
            5, 1
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1,
            9, 3
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0, 0, 255, 0)',
            0.2, 'rgba(0, 0, 255, 0.2)',
            0.4, 'rgba(0, 100, 255, 0.5)',
            0.6, 'rgba(0, 175, 255, 0.8)',
            0.8, 'rgba(0, 255, 255, 0.95)',
            1, 'rgba(0, 255, 215, 1)'
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 2,
            9, 20
          ],
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            7, 1,
            15, 0
          ],
        }
      });

      // Add cluster layers
      map.current.addLayer({
        id: 'comments-clusters',
        type: 'circle',
        source: 'comments',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#4287f5',
            10, '#2a67c9',
            50, '#1e4a8f'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            10, 30,
            50, 40
          ]
        }
      });

      map.current.addLayer({
        id: 'comments-cluster-count',
        type: 'symbol',
        source: 'comments',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        },
        paint: {
          'text-color': '#ffffff'
        }
      });

      // Add unclustered point layer
      map.current.addLayer({
        id: 'comments-unclustered-point',
        type: 'circle',
        source: 'comments',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#4287f5',
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      });

      // Add click event for clusters
      map.current.on('click', 'comments-clusters', (e) => {
        const features = map.current!.queryRenderedFeatures(e.point, {
          layers: ['comments-clusters']
        });
        
        const clusterId = features[0].properties.cluster_id;
        const source = map.current!.getSource('comments') as mapboxgl.GeoJSONSource;
        
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          
          map.current!.easeTo({
            center: (features[0].geometry as any).coordinates,
            zoom: zoom
          });
        });
      });

      // Add click event for unclustered points
      map.current.on('click', 'comments-unclustered-point', (e) => {
        if (addingComment) return;
        
        const features = map.current!.queryRenderedFeatures(e.point, {
          layers: ['comments-unclustered-point']
        });
        
        if (features.length > 0) {
          const commentId = features[0].properties.id;
          setSelectedCommentId(commentId);
        }
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'comments-clusters', () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      });
      
      map.current.on('mouseleave', 'comments-clusters', () => {
        map.current!.getCanvas().style.cursor = '';
      });
      
      map.current.on('mouseenter', 'comments-unclustered-point', () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      });
      
      map.current.on('mouseleave', 'comments-unclustered-point', () => {
        map.current!.getCanvas().style.cursor = '';
      });
    }

    // Add custom layers
    layers.forEach(layer => {
      addLayerToMap(layer);
    });
  }, [mapReady, comments, layers, mapSettings.showHeatmap, mapSettings.clusterComments]);

  // Helper functions
  const getMapStyle = (basemap: string) => {
    switch (basemap) {
      case 'streets':
        return 'mapbox://styles/mapbox/streets-v11';
      case 'satellite':
        return 'mapbox://styles/mapbox/satellite-v9';
      case 'light':
        return 'mapbox://styles/mapbox/light-v10';
      case 'dark':
        return 'mapbox://styles/mapbox/dark-v10';
      case 'outdoors':
        return 'mapbox://styles/mapbox/outdoors-v11';
      default:
        return 'mapbox://styles/mapbox/streets-v11';
    }
  };

  const getProjectBounds = (): mapboxgl.LngLatBoundsLike | undefined => {
    if (project.bounds) {
      return [
        [project.bounds.west, project.bounds.south],
        [project.bounds.east, project.bounds.north]
      ];
    }
    return undefined;
  };

  const getProjectCenter = (): [number, number] => {
    if (project.bounds) {
      return [
        (project.bounds.east + project.bounds.west) / 2,
        (project.bounds.north + project.bounds.south) / 2
      ];
    }
    return [-74.0060, 40.7128]; // Default to New York City
  };

  const addLayerToMap = (layer: Layer) => {
    if (!map.current) return;

    switch (layer.type) {
      case 'geojson':
        // Fetch and add GeoJSON layer
        fetch(layer.url)
          .then(response => response.json())
          .then(data => {
            const sourceId = `source-${layer._id}`;
            const layerId = `layer-${layer._id}`;
            
            if (map.current!.getSource(sourceId)) {
              map.current!.removeLayer(layerId);
              map.current!.removeSource(sourceId);
            }
            
            map.current!.addSource(sourceId, {
              type: 'geojson',
              data
            });
            
            map.current!.addLayer({
              id: layerId,
              type: 'line',
              source: sourceId,
              layout: {
                visibility: layer.visible ? 'visible' : 'none'
              },
              paint: {
                'line-color': '#088',
                'line-opacity': layer.opacity,
                'line-width': 2
              }
            });
          })
          .catch(error => {
            console.error(`Error loading GeoJSON layer ${layer.name}:`, error);
          });
        break;
      
      case 'kml':
      case 'kmz':
        // TODO: Implement KML/KMZ layer support
        console.log(`KML/KMZ layer support not implemented yet: ${layer.name}`);
        break;
      
      case 'wms':
        // Add WMS layer
        if (map.current.getSource(`source-${layer._id}`)) {
          map.current.removeLayer(`layer-${layer._id}`);
          map.current.removeSource(`source-${layer._id}`);
        }
        
        map.current.addSource(`source-${layer._id}`, {
          type: 'raster',
          tiles: [layer.url],
          tileSize: 256
        });
        
        map.current.addLayer({
          id: `layer-${layer._id}`,
          type: 'raster',
          source: `source-${layer._id}`,
          layout: {
            visibility: layer.visible ? 'visible' : 'none'
          },
          paint: {
            'raster-opacity': layer.opacity
          }
        });
        break;
      
      default:
        console.log(`Unsupported layer type: ${layer.type}`);
        break;
    }
  };

  const handleLayerToggle = (layerId: string, visible: boolean) => {
    if (!map.current) return;
    
    const layerName = `layer-${layerId}`;
    if (map.current.getLayer(layerName)) {
      map.current.setLayoutProperty(
        layerName,
        'visibility',
        visible ? 'visible' : 'none'
      );
    }
  };

  const handleLayerOpacityChange = (layerId: string, opacity: number) => {
    if (!map.current) return;
    
    const layerName = `layer-${layerId}`;
    if (map.current.getLayer(layerName)) {
      // Check layer type and set appropriate opacity property
      const layerType = map.current.getLayer(layerName).type;
      
      if (layerType === 'raster') {
        map.current.setPaintProperty(layerName, 'raster-opacity', opacity);
      } else if (layerType === 'line') {
        map.current.setPaintProperty(layerName, 'line-opacity', opacity);
      } else if (layerType === 'fill') {
        map.current.setPaintProperty(layerName, 'fill-opacity', opacity);
      } else if (layerType === 'circle') {
        map.current.setPaintProperty(layerName, 'circle-opacity', opacity);
      }
    }
  };

  const handleMapSettingsChange = (settings: typeof mapSettings) => {
    setMapSettings(settings);
    
    if (!map.current) return;
    
    // Update heatmap visibility
    if (map.current.getLayer('comments-heat')) {
      map.current.setLayoutProperty(
        'comments-heat',
        'visibility',
        settings.showHeatmap ? 'visible' : 'none'
      );
    }
    
    // Update clustering
    if (map.current.getSource('comments')) {
      // Unfortunately, we need to recreate the source to change clustering
      // This will trigger the useEffect that adds the layers
      const source = map.current.getSource('comments') as mapboxgl.GeoJSONSource;
      const data = (source as any)._data;
      
      map.current.removeLayer('comments-heat');
      map.current.removeLayer('comments-clusters');
      map.current.removeLayer('comments-cluster-count');
      map.current.removeLayer('comments-unclustered-point');
      map.current.removeSource('comments');
      
      map.current.addSource('comments', {
        type: 'geojson',
        data,
        cluster: settings.clusterComments,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });
    }
  };

  const handleAddCommentClick = () => {
    setAddingComment(true);
    setSelectedCommentId(null);
    setCommentLocation(null);
    
    if (map.current) {
      map.current.getCanvas().style.cursor = 'crosshair';
    }
  };

  const handleCancelComment = () => {
    setAddingComment(false);
    setCommentLocation(null);
    
    if (map.current) {
      map.current.getCanvas().style.cursor = '';
    }
  };

  const handleCommentSubmit = async () => {
    setAddingComment(false);
    setCommentLocation(null);
    
    if (map.current) {
      map.current.getCanvas().style.cursor = '';
    }
    
    // Refresh comments after submission
    await fetchComments();
  };

  const handleCommentClose = () => {
    setSelectedCommentId(null);
  };

  return (
    <Container>
      <MapWrapper ref={mapContainer} className="map-container" />
      
      <ControlsWrapper>
        <MapToolbar
          onAddComment={handleAddCommentClick}
          onToggleSettings={() => setSettingsOpen(!settingsOpen)}
          showHeatmap={mapSettings.showHeatmap}
          onToggleHeatmap={() => 
            setMapSettings({ ...mapSettings, showHeatmap: !mapSettings.showHeatmap })
          }
          isAddingComment={addingComment}
        />
      </ControlsWrapper>
      
      <LayerControlWrapper>
        <LayerControl
          layers={layers}
          loading={layersLoading}
          onToggleLayer={handleLayerToggle}
          onOpacityChange={handleLayerOpacityChange}
        />
      </LayerControlWrapper>
      
      {addingComment && commentLocation && (
        <CommentFormWrapper>
          <CommentForm
            projectId={project._id}
            location={commentLocation}
            onCancel={handleCancelComment}
            onSubmit={handleCommentSubmit}
          />
        </CommentFormWrapper>
      )}
      
      {selectedCommentId && (
        <CommentDetailDrawer
          commentId={selectedCommentId}
          onClose={handleCommentClose}
        />
      )}
      
      <MapSettingsDrawer
        isOpen={settingsOpen}
        settings={mapSettings}
        onClose={() => setSettingsOpen(false)}
        onSettingsChange={handleMapSettingsChange}
      />
      
      <LegendWrapper>
        <MapLegend />
      </LegendWrapper>
    </Container>
  );
};

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const MapWrapper = styled.div`
  width: 100%;
  height: 100%;
`;

const ControlsWrapper = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1;
`;

const LayerControlWrapper = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
  background: white;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  max-height: 80vh;
  overflow-y: auto;
`;

const CommentFormWrapper = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 500px;
  z-index: 2;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
`;

const LegendWrapper = styled.div`
  position: absolute;
  bottom: 20px;
  left: 10px;
  z-index: 1;
`;

export default MapContainer; 