import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Grid,
  Divider,
  Slider,
  Card,
  CardContent,
  CardHeader,
  Alert,
  Button,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  Chip
} from '@mui/material';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import SpeedIcon from '@mui/icons-material/Speed';
import ImageIcon from '@mui/icons-material/Image';
import DataSaverOnIcon from '@mui/icons-material/DataSaverOn';
import MapIcon from '@mui/icons-material/Map';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import HelpIcon from '@mui/icons-material/Help';
import InfoIcon from '@mui/icons-material/Info';
import SignalWifi0BarIcon from '@mui/icons-material/SignalWifi0Bar';
import SignalWifi4BarIcon from '@mui/icons-material/SignalWifi4Bar';
import DownloadIcon from '@mui/icons-material/Download';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import { useSettings } from '../../hooks/useSettings';
import { useConnection } from '../../hooks/useConnection';

const BandwidthSettings: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { connectionSpeed, connectionType, checkConnection } = useConnection();
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [autoDetect, setAutoDetect] = useState(settings.autoDetectBandwidth || false);
  const [bandwidthMode, setBandwidthMode] = useState(settings.lowBandwidthMode || false);
  const [imageQuality, setImageQuality] = useState(settings.imageQuality || 75);
  const [showMaps, setShowMaps] = useState(settings.showMaps !== false); // default true
  const [enableVideos, setEnableVideos] = useState(settings.enableVideos !== false); // default true
  const [prefetchData, setPrefetchData] = useState(settings.prefetchData || false);
  const [offlineMode, setOfflineMode] = useState(settings.offlineMode || false);

  useEffect(() => {
    if (autoDetect) {
      // If connection is slow, enable low bandwidth mode automatically
      if (connectionSpeed < 1.5) { // 1.5 Mbps threshold
        if (!bandwidthMode) {
          setBandwidthMode(true);
          updateSettings({ lowBandwidthMode: true });
        }
      } else if (bandwidthMode) {
        setBandwidthMode(false);
        updateSettings({ lowBandwidthMode: false });
      }
    }
  }, [autoDetect, connectionSpeed, bandwidthMode, updateSettings]);

  const handleLowBandwidthToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setBandwidthMode(newValue);
    updateSettings({ lowBandwidthMode: newValue });

    // If turning on low bandwidth mode, suggest reasonable defaults
    if (newValue) {
      setImageQuality(40);
      updateSettings({ imageQuality: 40 });
      
      if (showMaps) {
        setShowMaps(false);
        updateSettings({ showMaps: false });
      }
      
      if (enableVideos) {
        setEnableVideos(false);
        updateSettings({ enableVideos: false });
      }
    }
  };

  const handleAutoDetectToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setAutoDetect(newValue);
    updateSettings({ autoDetectBandwidth: newValue });
    
    if (newValue) {
      // Trigger a connection test when auto-detect is enabled
      handleTestConnection();
    }
  };

  const handleImageQualityChange = (event: Event, value: number | number[]) => {
    const newValue = value as number;
    setImageQuality(newValue);
    updateSettings({ imageQuality: newValue });
  };

  const handleMapsToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setShowMaps(newValue);
    updateSettings({ showMaps: newValue });
  };

  const handleVideosToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setEnableVideos(newValue);
    updateSettings({ enableVideos: newValue });
  };

  const handlePrefetchToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setPrefetchData(newValue);
    updateSettings({ prefetchData: newValue });
  };

  const handleOfflineModeToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setOfflineMode(newValue);
    updateSettings({ offlineMode: newValue });
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      await checkConnection();
    } finally {
      setIsTestingConnection(false);
    }
  };

  const getConnectionSpeedLabel = () => {
    if (!connectionSpeed) return 'Unknown';
    if (connectionSpeed < 0.5) return 'Very Slow';
    if (connectionSpeed < 1.5) return 'Slow';
    if (connectionSpeed < 5) return 'Moderate';
    if (connectionSpeed < 15) return 'Good';
    return 'Excellent';
  };

  const getConnectionSpeedColor = () => {
    if (!connectionSpeed) return 'warning.main';
    if (connectionSpeed < 1.5) return 'error.main';
    if (connectionSpeed < 5) return 'warning.main';
    return 'success.main';
  };

  const getBandwidthSavings = () => {
    let savings = 0;
    
    // Reduced image quality savings
    const imageQualityFactor = (100 - imageQuality) / 100;
    savings += 30 * imageQualityFactor; // Up to 30% from image quality
    
    // Map loading savings
    if (!showMaps) savings += 25;
    
    // Video loading savings
    if (!enableVideos) savings += 35;
    
    // Prefetch savings (negative since it uses more data initially)
    if (prefetchData) savings -= 10;
    
    return Math.min(Math.max(savings, 0), 90); // Clamp between 0-90%
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <NetworkCheckIcon sx={{ mr: 1 }} /> Bandwidth Settings
        <Tooltip title="Configure how the application uses your internet connection">
          <InfoIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
        </Tooltip>
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardHeader
              title="Connection Status"
              avatar={<SpeedIcon color="primary" />}
              action={
                <Button
                  size="small"
                  onClick={handleTestConnection}
                  startIcon={<SpeedIcon />}
                  disabled={isTestingConnection}
                >
                  Test
                </Button>
              }
            />
            <Divider />
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Connection Type:</Typography>
                  <Chip
                    icon={connectionType === 'wifi' ? <SignalWifi4BarIcon /> : <PhoneAndroidIcon />}
                    label={connectionType === 'wifi' ? 'WiFi' : connectionType || 'Unknown'}
                    size="small"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Speed:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      variant="body1" 
                      fontWeight="bold" 
                      color={getConnectionSpeedColor()}
                    >
                      {connectionSpeed ? `${connectionSpeed.toFixed(1)} Mbps` : 'Unknown'}
                    </Typography>
                    <Chip
                      label={getConnectionSpeedLabel()}
                      size="small"
                      sx={{ ml: 1 }}
                      color={connectionSpeed && connectionSpeed < 1.5 ? 'error' : 
                             connectionSpeed && connectionSpeed < 5 ? 'warning' : 'success'}
                    />
                  </Box>
                </Box>
                
                {connectionSpeed && connectionSpeed < 1.5 && (
                  <Alert severity="warning" icon={<SignalWifi0BarIcon />}>
                    Your connection is slow. We recommend enabling Low-bandwidth Mode.
                  </Alert>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card variant="outlined">
            <CardHeader
              title="Bandwidth Optimization"
              avatar={<DataSaverOnIcon color="primary" />}
              subheader={bandwidthMode ? "Low-bandwidth mode enabled" : "Standard mode"}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={bandwidthMode}
                          onChange={handleLowBandwidthToggle}
                          color="primary"
                        />
                      }
                      label={
                        <Typography>
                          Low-bandwidth Mode
                          <Tooltip title="Enables multiple optimizations to reduce data usage">
                            <HelpIcon fontSize="small" sx={{ ml: 0.5, verticalAlign: 'text-bottom', color: 'text.secondary' }} />
                          </Tooltip>
                        </Typography>
                      }
                    />
                    
                    <Chip 
                      label={`Save up to ${getBandwidthSavings().toFixed(0)}% data`}
                      color="primary"
                      size="small"
                      icon={<DownloadIcon />}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoDetect}
                        onChange={handleAutoDetectToggle}
                        color="primary"
                      />
                    }
                    label="Auto-detect connection speed"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography gutterBottom>
                    <ImageIcon fontSize="small" sx={{ verticalAlign: 'text-bottom', mr: 0.5 }} />
                    Image Quality
                  </Typography>
                  <Box sx={{ px: 1 }}>
                    <Slider
                      value={imageQuality}
                      onChange={handleImageQualityChange}
                      aria-label="Image Quality"
                      valueLabelDisplay="auto"
                      step={10}
                      marks
                      min={10}
                      max={100}
                      disabled={offlineMode}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">Lower Quality (Faster)</Typography>
                      <Typography variant="caption" color="text.secondary">Higher Quality (Slower)</Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><MapIcon /></ListItemIcon>
                      <ListItemText primary="Show interactive maps" />
                      <Switch
                        edge="end"
                        checked={showMaps}
                        onChange={handleMapsToggle}
                        disabled={offlineMode}
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon><VideoLibraryIcon /></ListItemIcon>
                      <ListItemText primary="Enable videos" />
                      <Switch
                        edge="end"
                        checked={enableVideos}
                        onChange={handleVideosToggle}
                        disabled={offlineMode}
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon><DataSaverOnIcon /></ListItemIcon>
                      <ListItemText 
                        primary="Prefetch data" 
                        secondary="Downloads data in advance for smoother experience"
                      />
                      <Switch
                        edge="end"
                        checked={prefetchData}
                        onChange={handlePrefetchToggle}
                        disabled={offlineMode}
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={offlineMode}
                        onChange={handleOfflineModeToggle}
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography>Offline Mode</Typography>
                        <Tooltip title="Use only cached data and disable all network requests">
                          <HelpIcon fontSize="small" sx={{ ml: 0.5, color: 'text.secondary' }} />
                        </Tooltip>
                      </Box>
                    }
                  />
                  
                  {offlineMode && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      Offline mode enabled. You will only see previously loaded data.
                    </Alert>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BandwidthSettings; 