import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, Typography, Paper, Box, Grid, TextField, 
  Button, Card, CardContent, Divider, Alert, 
  IconButton, Tooltip, Tabs, Tab, FormControlLabel,
  Switch, Chip, Autocomplete, CircularProgress
} from '@mui/material';
import { 
  DirectionsCar, DirectionsBike, DirectionsWalk, 
  DirectionsBus, EmojiTransportation, Navigation,
  Map, CompareArrows, CloudDownload, Route,
  Co2, Speed, AccessTime, Search, MyLocation
} from '@mui/icons-material';
// Import jsPDF and html2canvas as type-safe imports
import type { jsPDF } from 'jspdf';
import type html2canvas from 'html2canvas';

// We'll handle the actual importing dynamically when needed
// to avoid TypeScript errors about missing modules
const importJsPdf = async (): Promise<typeof import('jspdf')> => {
  return import('jspdf');
};

const importHtml2Canvas = async (): Promise<typeof import('html2canvas')> => {
  return import('html2canvas');
};

interface TripProps {
  start: string;
  end: string;
  departureTime?: Date;
  returnTime?: Date;
  mode: 'car' | 'transit' | 'bike' | 'walk' | 'mixed';
  distance?: number;
  duration?: number;
  emissions?: number;
}

interface RouteComparisonResult {
  car: {
    duration: number;
    distance: number;
    emissions: number;
  };
  transit: {
    duration: number;
    distance: number;
    emissions: number;
  };
  bike: {
    duration: number;
    distance: number;
    emissions: number;
  };
  walk: {
    duration: number;
    distance: number;
    emissions: number;
  };
  recommended: 'car' | 'transit' | 'bike' | 'walk';
}

const TripPlanner: React.FC = () => {
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const [startLocation, setStartLocation] = useState<string>('');
  const [endLocation, setEndLocation] = useState<string>('');
  const [departureTime, setDepartureTime] = useState<string>('');
  const [returnTime, setReturnTime] = useState<string>('');
  const [preferredMode, setPreferredMode] = useState<string>('mixed');
  const [roundTrip, setRoundTrip] = useState<boolean>(false);
  const [recentLocations, setRecentLocations] = useState<string[]>([
    'Downtown Transit Center', 
    'City Hall', 
    'University Campus', 
    'Shopping Mall',
    'Community Center'
  ]);
  
  const [activeStep, setActiveStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [routeComparisonResults, setRouteComparisonResults] = useState<RouteComparisonResult | null>(null);
  const [selectedRouteDetails, setSelectedRouteDetails] = useState<TripProps | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleLocationSelect = (location: string, type: 'start' | 'end') => {
    if (type === 'start') {
      setStartLocation(location);
    } else {
      setEndLocation(location);
    }
  };
  
  const useCurrentLocation = (type: 'start' | 'end') => {
    // This would normally use geolocation API
    const mockCurrentLocation = "Current Location (123 Main St)";
    if (type === 'start') {
      setStartLocation(mockCurrentLocation);
    } else {
      setEndLocation(mockCurrentLocation);
    }
  };
  
  const findRoutes = () => {
    setLoading(true);
    setError(null);
    
    // Validate inputs
    if (!startLocation || !endLocation) {
      setError('Please provide both start and end locations');
      setLoading(false);
      return;
    }
    
    // Simulating an API call to a routing service
    setTimeout(() => {
      try {
        // Mock data for route comparison
        const mockResults: RouteComparisonResult = {
          car: {
            duration: 18, // minutes
            distance: 8.5, // miles
            emissions: 3.4 // kg CO2
          },
          transit: {
            duration: 35,
            distance: 9.2,
            emissions: 1.2
          },
          bike: {
            duration: 48,
            distance: 7.8,
            emissions: 0
          },
          walk: {
            duration: 112,
            distance: 7.2,
            emissions: 0
          },
          recommended: 'transit'
        };
        
        setRouteComparisonResults(mockResults);
        setActiveStep(1);
      } catch (err) {
        setError('Error finding routes: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    }, 2000);
  };
  
  const selectRoute = (mode: 'car' | 'transit' | 'bike' | 'walk') => {
    if (!routeComparisonResults) return;
    
    const details: TripProps = {
      start: startLocation,
      end: endLocation,
      departureTime: departureTime ? new Date(departureTime) : undefined,
      returnTime: returnTime && roundTrip ? new Date(returnTime) : undefined,
      mode: mode,
      distance: routeComparisonResults[mode].distance,
      duration: routeComparisonResults[mode].duration,
      emissions: routeComparisonResults[mode].emissions
    };
    
    setSelectedRouteDetails(details);
    setActiveStep(2);
    
    // Add to recent locations if they're not already there
    if (!recentLocations.includes(startLocation)) {
      setRecentLocations(prev => [startLocation, ...prev].slice(0, 5));
    }
    if (!recentLocations.includes(endLocation)) {
      setRecentLocations(prev => [endLocation, ...prev].slice(0, 5));
    }
  };
  
  const exportRouteAsPDF = async () => {
    if (!resultsRef.current || !selectedRouteDetails) return;
    
    try {
      const html2canvasModule = await importHtml2Canvas();
      const jsPdfModule = await importJsPdf();
      
      const canvas = await html2canvasModule.default(resultsRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPdfModule.jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;
      
      pdf.setFontSize(16);
      pdf.text('Trip Planning Details', 105, 15, { align: 'center' });
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save('trip-details.pdf');
    } catch (err) {
      console.error('Error exporting PDF:', err);
      setError('Failed to export PDF. Please try again.');
    }
  };
  
  const startOver = () => {
    setActiveStep(0);
    setRouteComparisonResults(null);
    setSelectedRouteDetails(null);
    setError(null);
  };

  const renderRouteComparison = () => {
    if (!routeComparisonResults) return null;
    
    return (
      <Box mt={3}>
        <Typography variant="h6" gutterBottom>
          Route Options
        </Typography>
        <Grid container spacing={2}>
          {['car', 'transit', 'bike', 'walk'].map((mode) => {
            const modeData = routeComparisonResults[mode as keyof RouteComparisonResult] as {
              duration: number;
              distance: number;
              emissions: number;
            };
            
            const isRecommended = routeComparisonResults.recommended === mode;
            
            return (
              <Grid item xs={12} sm={6} md={3} key={mode}>
                <Card 
                  raised={isRecommended}
                  sx={{
                    position: 'relative',
                    border: isRecommended ? '2px solid #4caf50' : 'none'
                  }}
                >
                  {isRecommended && (
                    <Chip 
                      label="Recommended" 
                      color="success" 
                      size="small" 
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8 
                      }} 
                    />
                  )}
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      {mode === 'car' && <DirectionsCar fontSize="large" color="primary" />}
                      {mode === 'transit' && <DirectionsBus fontSize="large" color="primary" />}
                      {mode === 'bike' && <DirectionsBike fontSize="large" color="primary" />}
                      {mode === 'walk' && <DirectionsWalk fontSize="large" color="primary" />}
                      <Typography variant="h6" sx={{ ml: 1, textTransform: 'capitalize' }}>
                        {mode}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" mb={1}>
                      <AccessTime fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body1">
                        {modeData.duration} min
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" mb={1}>
                      <Route fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body1">
                        {modeData.distance} miles
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" mb={2}>
                      <Co2 fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body1">
                        {modeData.emissions} kg CO2
                      </Typography>
                    </Box>
                    
                    <Button 
                      variant="contained" 
                      fullWidth
                      onClick={() => selectRoute(mode as 'car' | 'transit' | 'bike' | 'walk')}
                    >
                      Select
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };
  
  const renderRouteDetails = () => {
    if (!selectedRouteDetails) return null;
    
    return (
      <Box mt={3} ref={resultsRef}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">
              Trip Details
            </Typography>
            <Button
              startIcon={<CloudDownload />}
              onClick={exportRouteAsPDF}
            >
              Export PDF
            </Button>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom color="text.secondary">
                  Route
                </Typography>
                <Box display="flex" alignItems="center">
                  <Box flex={1}>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedRouteDetails.start}
                    </Typography>
                  </Box>
                  <Box px={2}>
                    <CompareArrows color="action" />
                  </Box>
                  <Box flex={1}>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedRouteDetails.end}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom color="text.secondary">
                  Transportation Mode
                </Typography>
                <Box display="flex" alignItems="center">
                  {selectedRouteDetails.mode === 'car' && <DirectionsCar sx={{ mr: 1 }} color="primary" />}
                  {selectedRouteDetails.mode === 'transit' && <DirectionsBus sx={{ mr: 1 }} color="primary" />}
                  {selectedRouteDetails.mode === 'bike' && <DirectionsBike sx={{ mr: 1 }} color="primary" />}
                  {selectedRouteDetails.mode === 'walk' && <DirectionsWalk sx={{ mr: 1 }} color="primary" />}
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {selectedRouteDetails.mode}
                  </Typography>
                </Box>
              </Box>
              
              {selectedRouteDetails.departureTime && (
                <Box mb={3}>
                  <Typography variant="subtitle1" gutterBottom color="text.secondary">
                    Departure Time
                  </Typography>
                  <Typography variant="body1">
                    {selectedRouteDetails.departureTime.toLocaleString()}
                  </Typography>
                </Box>
              )}
              
              {selectedRouteDetails.returnTime && (
                <Box mb={3}>
                  <Typography variant="subtitle1" gutterBottom color="text.secondary">
                    Return Time
                  </Typography>
                  <Typography variant="body1">
                    {selectedRouteDetails.returnTime.toLocaleString()}
                  </Typography>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom color="text.secondary">
                  Distance
                </Typography>
                <Typography variant="h5">
                  {selectedRouteDetails.distance} miles
                </Typography>
              </Box>
              
              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="h5">
                  {selectedRouteDetails.duration} minutes
                </Typography>
              </Box>
              
              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom color="text.secondary">
                  CO2 Emissions
                </Typography>
                <Typography variant="h5" color={selectedRouteDetails.emissions === 0 ? 'success.main' : 'inherit'}>
                  {selectedRouteDetails.emissions} kg
                  {selectedRouteDetails.emissions === 0 && ' (Carbon Free)'}
                </Typography>
              </Box>
              
              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom color="text.secondary">
                  Environmental Impact
                </Typography>
                <Box mt={1}>
                  <Typography variant="body1">
                    By choosing {selectedRouteDetails.mode} instead of car, you could save:
                  </Typography>
                  <Box mt={2} pl={2}>
                    <Typography variant="body1" gutterBottom>
                      • Up to {(3.4 - (selectedRouteDetails.emissions || 0)).toFixed(1)} kg of CO2 emissions
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      • Equivalent to planting {Math.round((3.4 - (selectedRouteDetails.emissions || 0)) * 0.5)} trees
                    </Typography>
                    <Typography variant="body1">
                      • Approximately ${((3.4 - (selectedRouteDetails.emissions || 0)) * 0.25).toFixed(2)} in social carbon costs
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    );
  };
  
  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, mt: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <EmojiTransportation sx={{ mr: 1, verticalAlign: 'middle' }} />
          Smart Trip Planner
        </Typography>
        
        <Typography variant="body1" paragraph>
          Plan your journey with our eco-friendly trip planner. Compare different transportation modes and their environmental impacts.
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Box mb={4}>
          <Tabs 
            value={activeStep} 
            onChange={(_, newValue) => setActiveStep(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab label="Plan Trip" disabled={activeStep > 0 && !selectedRouteDetails} />
            <Tab label="Compare Routes" disabled={!routeComparisonResults} />
            <Tab label="Trip Details" disabled={!selectedRouteDetails} />
          </Tabs>
          
          {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Route Information
                </Typography>
                
                <Box mb={3}>
                  <Autocomplete
                    freeSolo
                    options={recentLocations}
                    value={startLocation}
                    onChange={(_, value) => setStartLocation(value || '')}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Start Location" 
                        fullWidth
                        margin="normal"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {params.InputProps.endAdornment}
                              <IconButton 
                                onClick={() => useCurrentLocation('start')}
                                title="Use current location"
                              >
                                <MyLocation fontSize="small" />
                              </IconButton>
                            </>
                          )
                        }}
                      />
                    )}
                  />
                </Box>
                
                <Box mb={3}>
                  <Autocomplete
                    freeSolo
                    options={recentLocations}
                    value={endLocation}
                    onChange={(_, value) => setEndLocation(value || '')}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="End Location" 
                        fullWidth
                        margin="normal"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {params.InputProps.endAdornment}
                              <IconButton 
                                onClick={() => useCurrentLocation('end')}
                                title="Use current location"
                              >
                                <MyLocation fontSize="small" />
                              </IconButton>
                            </>
                          )
                        }}
                      />
                    )}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Trip Details
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={roundTrip}
                      onChange={(e) => setRoundTrip(e.target.checked)}
                    />
                  }
                  label="Round Trip"
                  sx={{ mb: 2 }}
                />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={roundTrip ? 6 : 12}>
                    <TextField
                      label="Departure Time"
                      type="datetime-local"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                    />
                  </Grid>
                  
                  {roundTrip && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Return Time"
                        type="datetime-local"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={returnTime}
                        onChange={(e) => setReturnTime(e.target.value)}
                      />
                    </Grid>
                  )}
                </Grid>
                
                <Box mt={3}>
                  <Typography gutterBottom>
                    Preferred Transportation Modes
                  </Typography>
                  <Grid container spacing={1}>
                    {['car', 'transit', 'bike', 'walk', 'mixed'].map((mode) => (
                      <Grid item key={mode}>
                        <Chip
                          icon={
                            mode === 'car' ? <DirectionsCar /> :
                            mode === 'transit' ? <DirectionsBus /> :
                            mode === 'bike' ? <DirectionsBike /> :
                            mode === 'walk' ? <DirectionsWalk /> :
                            <CompareArrows />
                          }
                          label={mode === 'mixed' ? 'All Options' : mode}
                          onClick={() => setPreferredMode(mode)}
                          color={preferredMode === mode ? 'primary' : 'default'}
                          variant={preferredMode === mode ? 'filled' : 'outlined'}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
                
                <Box mt={4}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    startIcon={<Search />}
                    onClick={findRoutes}
                    disabled={loading || !startLocation || !endLocation}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Find Routes'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}
          
          {activeStep === 1 && renderRouteComparison()}
          
          {activeStep === 2 && renderRouteDetails()}
          
          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}
          
          {activeStep > 0 && (
            <Box mt={3} display="flex" justifyContent="space-between">
              <Button 
                variant="outlined"
                onClick={() => activeStep === 1 ? startOver() : setActiveStep(1)}
              >
                {activeStep === 1 ? 'Start Over' : 'Back to Routes'}
              </Button>
              
              {activeStep === 2 && (
                <Button 
                  variant="contained"
                  onClick={startOver}
                >
                  Plan New Trip
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default TripPlanner; 