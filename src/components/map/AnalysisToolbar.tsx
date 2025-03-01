import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Paper,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormGroup,
  FormControlLabel,
  Switch,
  TextField,
  Slider,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  BlurCircular as HeatmapIcon,
  Route as RouteIcon,
  RadioButtonChecked as BufferIcon,
  BarChart as ChartIcon,
  Save as SaveIcon,
  PlayArrow as RunIcon,
  Public as IsochroneIcon,
  DirectionsBike as BikeIcon,
  DirectionsWalk as WalkIcon,
  DirectionsCar as CarIcon,
  DirectionsBus as TransitIcon,
} from '@mui/icons-material';

interface AnalysisToolbarProps {
  onRunAnalysis: (analysisType: string, parameters: any) => Promise<void>;
  isAnalysisRunning: boolean;
  currentScenarioId: string;
}

const AnalysisToolbar: React.FC<AnalysisToolbarProps> = ({
  onRunAnalysis,
  isAnalysisRunning,
  currentScenarioId,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState('isochrone');
  const [analysisParameters, setAnalysisParameters] = useState({
    // Isochrone parameters
    travelMode: 'walking',
    travelTime: 15,
    startLocation: '',
    
    // Accessibility parameters
    accessibilityType: 'jobs',
    demographic: 'total',
    
    // Impact parameters
    impactMetric: 'emissions',
    includeIndirect: true,
    
    // Traffic parameters
    timeOfDay: 'am-peak',
    includeFreight: false,
  });
  const [analysisResults, setAnalysisResults] = useState<null | string>(null);
  const [analysisError, setAnalysisError] = useState<null | string>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    // Set appropriate analysis type based on tab
    switch (newValue) {
      case 0:
        setSelectedAnalysisType('isochrone');
        break;
      case 1:
        setSelectedAnalysisType('accessibility');
        break;
      case 2:
        setSelectedAnalysisType('impact');
        break;
      case 3:
        setSelectedAnalysisType('traffic');
        break;
      default:
        setSelectedAnalysisType('isochrone');
    }
    
    // Clear previous results when changing tabs
    setAnalysisResults(null);
    setAnalysisError(null);
  };

  const handleParameterChange = (parameter: string, value: any) => {
    setAnalysisParameters(prev => ({
      ...prev,
      [parameter]: value
    }));
  };

  const handleRunAnalysis = async () => {
    try {
      setAnalysisError(null);
      setAnalysisResults(null);
      
      await onRunAnalysis(selectedAnalysisType, {
        ...analysisParameters,
        scenarioId: currentScenarioId,
      });
      
      // Simulated result - in a real app this would come from the API response
      setAnalysisResults("Analysis completed successfully. Results have been added to the map.");
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "An unknown error occurred");
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        indicatorColor="primary"
        textColor="primary"
        aria-label="analysis tools"
      >
        <Tab icon={<IsochroneIcon />} label="Travel Time" />
        <Tab icon={<HeatmapIcon />} label="Accessibility" />
        <Tab icon={<ChartIcon />} label="Impacts" />
        <Tab icon={<TimelineIcon />} label="Traffic" />
      </Tabs>
      
      <Box sx={{ p: 2 }}>
        {/* Travel Time Analysis (Tab 0) */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Travel Time Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Generate travel time isochrones to visualize areas accessible within a specified time.
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="travel-mode-label">Travel Mode</InputLabel>
              <Select
                labelId="travel-mode-label"
                value={analysisParameters.travelMode}
                label="Travel Mode"
                onChange={(e) => handleParameterChange('travelMode', e.target.value)}
              >
                <MenuItem value="walking">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <WalkIcon fontSize="small" sx={{ mr: 1 }} />
                    Walking
                  </Box>
                </MenuItem>
                <MenuItem value="cycling">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BikeIcon fontSize="small" sx={{ mr: 1 }} />
                    Cycling
                  </Box>
                </MenuItem>
                <MenuItem value="driving">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CarIcon fontSize="small" sx={{ mr: 1 }} />
                    Driving
                  </Box>
                </MenuItem>
                <MenuItem value="transit">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TransitIcon fontSize="small" sx={{ mr: 1 }} />
                    Transit
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography gutterBottom>
                Travel Time: {analysisParameters.travelTime} minutes
              </Typography>
              <Slider
                value={analysisParameters.travelTime}
                onChange={(_, value) => handleParameterChange('travelTime', value)}
                min={5}
                max={60}
                step={5}
                marks={[
                  { value: 5, label: '5m' },
                  { value: 15, label: '15m' },
                  { value: 30, label: '30m' },
                  { value: 45, label: '45m' },
                  { value: 60, label: '60m' },
                ]}
              />
            </Box>
            
            <TextField
              fullWidth
              label="Starting Location"
              placeholder="Enter address or click on map"
              variant="outlined"
              margin="normal"
              value={analysisParameters.startLocation}
              onChange={(e) => handleParameterChange('startLocation', e.target.value)}
              helperText="Enter an address or click on the map to set the starting point"
            />
          </Box>
        )}
        
        {/* Accessibility Analysis (Tab 1) */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Accessibility Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Analyze how accessible key destinations are for different demographic groups.
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="accessibility-type-label">Accessibility Type</InputLabel>
              <Select
                labelId="accessibility-type-label"
                value={analysisParameters.accessibilityType}
                label="Accessibility Type"
                onChange={(e) => handleParameterChange('accessibilityType', e.target.value)}
              >
                <MenuItem value="jobs">Jobs</MenuItem>
                <MenuItem value="schools">Schools</MenuItem>
                <MenuItem value="healthcare">Healthcare Facilities</MenuItem>
                <MenuItem value="parks">Parks & Recreation</MenuItem>
                <MenuItem value="grocery">Grocery Stores</MenuItem>
                <MenuItem value="transit">Transit Stops</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="demographic-label">Demographic Group</InputLabel>
              <Select
                labelId="demographic-label"
                value={analysisParameters.demographic}
                label="Demographic Group"
                onChange={(e) => handleParameterChange('demographic', e.target.value)}
              >
                <MenuItem value="total">Total Population</MenuItem>
                <MenuItem value="low-income">Low Income</MenuItem>
                <MenuItem value="minority">Minority</MenuItem>
                <MenuItem value="senior">Senior</MenuItem>
                <MenuItem value="youth">Youth</MenuItem>
                <MenuItem value="disability">People with Disabilities</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography gutterBottom>
                Travel Time Threshold: {analysisParameters.travelTime} minutes
              </Typography>
              <Slider
                value={analysisParameters.travelTime}
                onChange={(_, value) => handleParameterChange('travelTime', value)}
                min={5}
                max={45}
                step={5}
                marks={[
                  { value: 5, label: '5m' },
                  { value: 15, label: '15m' },
                  { value: 30, label: '30m' },
                  { value: 45, label: '45m' },
                ]}
              />
            </Box>
          </Box>
        )}
        
        {/* Impact Analysis (Tab 2) */}
        {activeTab === 2 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Impact Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Evaluate the environmental and economic impacts of transportation scenarios.
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="impact-metric-label">Impact Metric</InputLabel>
              <Select
                labelId="impact-metric-label"
                value={analysisParameters.impactMetric}
                label="Impact Metric"
                onChange={(e) => handleParameterChange('impactMetric', e.target.value)}
              >
                <MenuItem value="emissions">GHG Emissions</MenuItem>
                <MenuItem value="air-quality">Air Quality</MenuItem>
                <MenuItem value="economic">Economic Impact</MenuItem>
                <MenuItem value="land-use">Land Use Changes</MenuItem>
                <MenuItem value="noise">Noise Levels</MenuItem>
              </Select>
            </FormControl>
            
            <FormGroup sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={analysisParameters.includeIndirect}
                    onChange={(e) => handleParameterChange('includeIndirect', e.target.checked)}
                  />
                }
                label="Include indirect impacts"
              />
            </FormGroup>
          </Box>
        )}
        
        {/* Traffic Analysis (Tab 3) */}
        {activeTab === 3 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Traffic Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Analyze traffic patterns and volumes under different scenarios.
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="time-of-day-label">Time of Day</InputLabel>
              <Select
                labelId="time-of-day-label"
                value={analysisParameters.timeOfDay}
                label="Time of Day"
                onChange={(e) => handleParameterChange('timeOfDay', e.target.value)}
              >
                <MenuItem value="am-peak">AM Peak (7-9 AM)</MenuItem>
                <MenuItem value="midday">Midday (11 AM-1 PM)</MenuItem>
                <MenuItem value="pm-peak">PM Peak (4-6 PM)</MenuItem>
                <MenuItem value="daily">Daily Average</MenuItem>
              </Select>
            </FormControl>
            
            <FormGroup sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={analysisParameters.includeFreight}
                    onChange={(e) => handleParameterChange('includeFreight', e.target.checked)}
                  />
                }
                label="Include freight traffic"
              />
            </FormGroup>
          </Box>
        )}
        
        {/* Actions and Results */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRunAnalysis}
            disabled={isAnalysisRunning}
            startIcon={isAnalysisRunning ? <CircularProgress size={20} /> : <RunIcon />}
          >
            {isAnalysisRunning ? 'Running...' : 'Run Analysis'}
          </Button>
        </Box>
        
        {analysisResults && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {analysisResults}
          </Alert>
        )}
        
        {analysisError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {analysisError}
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default AnalysisToolbar; 