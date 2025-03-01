import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Typography, Paper, Box, Grid, TextField,
  MenuItem, Select, FormControl, InputLabel, Slider,
  Button, Card, CardContent, Divider, Alert,
  IconButton, Tooltip, Switch, FormControlLabel, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { 
  Co2, DirectionsCar, DirectionsBike, DirectionsWalk, 
  DirectionsBus, LocalFlorist, WbSunny, Air, 
  ShowChart, Download, CloudDownload, PieChart, Info,
  Eco, PublishedWithChanges, CompareArrows, BarChart
} from '@mui/icons-material';
import { 
  Chart as ChartJS,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  LineController,
  CategoryScale,
  LinearScale,
  PieController,
  Legend,
  Tooltip as ChartTooltip,
  Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  LineController,
  CategoryScale,
  LinearScale,
  PieController,
  Legend,
  ChartTooltip,
  Title
);

interface TransportationData {
  carVmt: number;
  bikeVmt: number;
  walkVmt: number;
  transitVmt: number;
  vehicleType: string;
  projectArea: number;
  projectType: string;
  treesPlanted: number;
  timeFrame: number;
}

interface EmissionsResult {
  beforeEmissions: number;
  afterEmissions: number;
  emissionsSaved: number;
  treeCaptureAmount: number;
  totalBenefit: number;
  equivalencies: {
    carMiles: number;
    homeEnergy: number;
    smartphonesCharged: number;
    treesGrown: number;
  };
}

const ClimateImpactCalculator: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const [transportationData, setTransportationData] = useState<TransportationData>({
    carVmt: 1000,
    bikeVmt: 100,
    walkVmt: 50,
    transitVmt: 200,
    vehicleType: 'average',
    projectArea: 1,
    projectType: 'bikelane',
    treesPlanted: 0,
    timeFrame: 5,
  });
  
  const [results, setResults] = useState<EmissionsResult | null>(null);
  const [calculationComplete, setCalculationComplete] = useState<boolean>(false);
  const [selectedView, setSelectedView] = useState<string>('emissions');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const vehicleTypes = [
    { value: 'average', label: 'Average Fleet Mix', emission: 404 },
    { value: 'gas', label: 'Gasoline Car', emission: 435 },
    { value: 'diesel', label: 'Diesel Car', emission: 485 },
    { value: 'hybrid', label: 'Hybrid Electric', emission: 200 },
    { value: 'plugin', label: 'Plug-in Hybrid', emission: 120 },
    { value: 'electric', label: 'Electric Vehicle', emission: 85 },
  ];
  
  const projectTypes = [
    { value: 'bikelane', label: 'Bike Lane', carReduction: 0.05, bikeIncrease: 0.5, walkIncrease: 0.1 },
    { value: 'buslane', label: 'Dedicated Bus Lane', carReduction: 0.08, transitIncrease: 0.4, walkIncrease: 0.05 },
    { value: 'pedestrian', label: 'Pedestrian Improvements', carReduction: 0.03, walkIncrease: 0.4, bikeIncrease: 0.1 },
    { value: 'complete', label: 'Complete Street', carReduction: 0.1, bikeIncrease: 0.3, walkIncrease: 0.3, transitIncrease: 0.2 },
    { value: 'transit', label: 'Transit Station Area', carReduction: 0.12, transitIncrease: 0.5, walkIncrease: 0.2 },
    { value: 'trafficcalm', label: 'Traffic Calming', carReduction: 0.04, walkIncrease: 0.2, bikeIncrease: 0.2 },
  ];
  
  const calculateEmissions = () => {
    setLoading(true);
    setError(null);
    
    try {
      const vehicleEmissionFactor = vehicleTypes.find(v => v.value === transportationData.vehicleType)?.emission || 404;
      const projectTypeData = projectTypes.find(p => p.value === transportationData.projectType);
      
      if (!projectTypeData) {
        throw new Error('Invalid project type selected');
      }
      
      // Calculate before emissions (g CO2)
      const beforeCarEmissions = (transportationData.carVmt * vehicleEmissionFactor);
      const beforeTransitEmissions = (transportationData.transitVmt * 180); // Transit emissions per passenger mile
      const beforeTotalEmissions = beforeCarEmissions + beforeTransitEmissions;
      
      // Calculate after emissions with mode shift
      const carVmtReduction = transportationData.carVmt * projectTypeData.carReduction;
      const afterCarVmt = transportationData.carVmt - carVmtReduction;
      
      const bikeVmtIncrease = transportationData.bikeVmt * (projectTypeData.bikeIncrease || 0);
      const afterBikeVmt = transportationData.bikeVmt + bikeVmtIncrease;
      
      const walkVmtIncrease = transportationData.walkVmt * (projectTypeData.walkIncrease || 0);
      const afterWalkVmt = transportationData.walkVmt + walkVmtIncrease;
      
      const transitVmtIncrease = transportationData.transitVmt * (projectTypeData.transitIncrease || 0);
      const afterTransitVmt = transportationData.transitVmt + transitVmtIncrease;
      
      // Calculate after emissions
      const afterCarEmissions = (afterCarVmt * vehicleEmissionFactor);
      const afterTransitEmissions = (afterTransitVmt * 180);
      const afterTotalEmissions = afterCarEmissions + afterTransitEmissions;
      
      // Tree carbon capture (average tree captures about 25kg CO2 per year)
      const treeCaptureAmount = transportationData.treesPlanted * 25 * transportationData.timeFrame;
      
      // Calculate total benefit
      const emissionsSaved = beforeTotalEmissions - afterTotalEmissions;
      const totalBenefit = emissionsSaved + treeCaptureAmount;
      
      // Calculate equivalencies
      const kgCO2Saved = totalBenefit / 1000; // Convert g to kg
      
      const equivalencies = {
        carMiles: Math.round(kgCO2Saved / 0.404), // Average car produces 404g CO2 per mile
        homeEnergy: Math.round(kgCO2Saved / 33), // Average home produces 33kg CO2 per day
        smartphonesCharged: Math.round(kgCO2Saved * 121), // 8.22g CO2 per smartphone charge
        treesGrown: Math.round(kgCO2Saved / (25 * 10)) // Tree captures ~25kg CO2 per year for 10 years
      };
      
      const results: EmissionsResult = {
        beforeEmissions: beforeTotalEmissions,
        afterEmissions: afterTotalEmissions,
        emissionsSaved,
        treeCaptureAmount,
        totalBenefit,
        equivalencies
      };
      
      setResults(results);
      setCalculationComplete(true);
      
    } catch (err) {
      setError('Error calculating emissions: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (field: keyof TransportationData, value: number | string) => {
    setTransportationData(prev => ({
      ...prev,
      [field]: value
    }));
    setCalculationComplete(false);
  };
  
  const exportAsPDF = () => {
    if (!resultsRef.current) return;
    
    const input = resultsRef.current;
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;
      
      pdf.setFontSize(16);
      pdf.text('Climate Impact Analysis', 105, 15, { align: 'center' });
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save('climate-impact-analysis.pdf');
    });
  };
  
  const exportAsCSV = () => {
    if (!results) return;
    
    const headers = 'Metric,Before,After,Difference\n';
    const emissionsRow = `Total Emissions (g CO2),${results.beforeEmissions.toFixed(2)},${results.afterEmissions.toFixed(2)},${results.emissionsSaved.toFixed(2)}\n`;
    const treesRow = `Carbon Capture from Trees (g CO2),0,${results.treeCaptureAmount.toFixed(2)},${results.treeCaptureAmount.toFixed(2)}\n`;
    const totalRow = `Total Climate Benefit (g CO2),0,${results.totalBenefit.toFixed(2)},${results.totalBenefit.toFixed(2)}\n`;
    
    const csvContent = headers + emissionsRow + treesRow + totalRow;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'climate-impact-data.csv');
  };
  
  const renderCharts = () => {
    if (!results) return null;
    
    const emissionsData = {
      labels: ['Before Project', 'After Project'],
      datasets: [
        {
          label: 'Car Emissions',
          data: [
            results.beforeEmissions * 0.8, // Approximation for display
            results.afterEmissions * 0.8
          ],
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
        {
          label: 'Transit Emissions',
          data: [
            results.beforeEmissions * 0.2, // Approximation for display
            results.afterEmissions * 0.2
          ],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
        },
        {
          label: 'Tree Carbon Capture',
          data: [0, results.treeCaptureAmount],
          backgroundColor: 'rgba(75, 192, 92, 0.5)',
        }
      ]
    };
    
    return (
      <Box mt={3} ref={chartRef}>
        <Typography variant="h6" gutterBottom>
          CO2 Emissions Comparison
        </Typography>
        <Box height={300}>
          <Bar
            data={emissionsData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  stacked: true,
                },
                y: {
                  stacked: true,
                  title: {
                    display: true,
                    text: 'CO2 Emissions (g)'
                  }
                }
              },
              plugins: {
                title: {
                  display: true,
                  text: 'Climate Impact of Transportation Project'
                },
                legend: {
                  position: 'bottom'
                }
              }
            }}
          />
        </Box>
      </Box>
    );
  };
  
  const renderEquivalencies = () => {
    if (!results) return null;
    
    return (
      <Box mt={3}>
        <Typography variant="h6" gutterBottom>
          Impact Equivalencies
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <DirectionsCar fontSize="large" color="primary" />
                <Typography variant="h5">
                  {results.equivalencies.carMiles.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Miles driven by an average car
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <WbSunny fontSize="large" color="primary" />
                <Typography variant="h5">
                  {results.equivalencies.homeEnergy.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Days of home energy use
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <LocalFlorist fontSize="large" color="primary" />
                <Typography variant="h5">
                  {results.equivalencies.treesGrown.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  10-year-old trees grown for a year
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Air fontSize="large" color="primary" />
                <Typography variant="h5">
                  {(results.totalBenefit / 1000).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  kg of CO2 equivalent
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, mt: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <Eco sx={{ mr: 1, verticalAlign: 'middle' }} />
          Climate Impact Calculator
        </Typography>
        <Typography variant="body1" paragraph>
          Estimate the greenhouse gas emission reductions from your transportation project by providing information about current travel patterns and the expected changes.
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Current Travel Patterns
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Daily Car Vehicle Miles Traveled"
                  type="number"
                  InputProps={{ endAdornment: <Typography variant="body2">miles</Typography> }}
                  value={transportationData.carVmt}
                  onChange={(e) => handleInputChange('carVmt', Number(e.target.value))}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Daily Bicycle Miles Traveled"
                  type="number"
                  InputProps={{ endAdornment: <Typography variant="body2">miles</Typography> }}
                  value={transportationData.bikeVmt}
                  onChange={(e) => handleInputChange('bikeVmt', Number(e.target.value))}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Daily Walking Miles Traveled"
                  type="number"
                  InputProps={{ endAdornment: <Typography variant="body2">miles</Typography> }}
                  value={transportationData.walkVmt}
                  onChange={(e) => handleInputChange('walkVmt', Number(e.target.value))}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Daily Transit Passenger Miles Traveled"
                  type="number"
                  InputProps={{ endAdornment: <Typography variant="body2">miles</Typography> }}
                  value={transportationData.transitVmt}
                  onChange={(e) => handleInputChange('transitVmt', Number(e.target.value))}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Average Vehicle Type</InputLabel>
                  <Select
                    value={transportationData.vehicleType}
                    label="Average Vehicle Type"
                    onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                  >
                    {vehicleTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label} ({type.emission} g CO2/mile)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Project Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Project Type</InputLabel>
                  <Select
                    value={transportationData.projectType}
                    label="Project Type"
                    onChange={(e) => handleInputChange('projectType', e.target.value)}
                  >
                    {projectTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Project Area"
                  type="number"
                  InputProps={{ endAdornment: <Typography variant="body2">miles</Typography> }}
                  value={transportationData.projectArea}
                  onChange={(e) => handleInputChange('projectArea', Number(e.target.value))}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Trees Planted"
                  type="number"
                  InputProps={{ endAdornment: <Typography variant="body2">trees</Typography> }}
                  value={transportationData.treesPlanted}
                  onChange={(e) => handleInputChange('treesPlanted', Number(e.target.value))}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography gutterBottom>
                  Time Frame for Analysis
                </Typography>
                <Slider
                  value={transportationData.timeFrame}
                  min={1}
                  max={30}
                  step={1}
                  marks={[
                    { value: 1, label: '1 yr' },
                    { value: 5, label: '5 yrs' },
                    { value: 10, label: '10 yrs' },
                    { value: 20, label: '20 yrs' },
                    { value: 30, label: '30 yrs' }
                  ]}
                  valueLabelDisplay="auto"
                  onChange={(_, value) => handleInputChange('timeFrame', value as number)}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  size="large"
                  onClick={calculateEmissions}
                  disabled={loading}
                  startIcon={<ShowChart />}
                >
                  Calculate Climate Impact
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
        
        {calculationComplete && results && (
          <Box ref={resultsRef} mt={4}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" component="h2" gutterBottom>
                  <PieChart sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Climate Impact Results
                </Typography>
                <Box>
                  <Button 
                    startIcon={<CloudDownload />}
                    onClick={exportAsPDF}
                    sx={{ mr: 1 }}
                  >
                    Export PDF
                  </Button>
                  <Button 
                    startIcon={<Download />}
                    onClick={exportAsCSV}
                  >
                    Export CSV
                  </Button>
                </Box>
              </Box>
              
              <Box mt={2} mb={3}>
                <Chip 
                  icon={<Eco />} 
                  label={`Total CO2 Reduction: ${(results.totalBenefit / 1000).toLocaleString()} kg over ${transportationData.timeFrame} years`} 
                  color="success" 
                  variant="outlined"
                  size="large"
                />
              </Box>
              
              <Box display="flex" mb={2}>
                <Button
                  variant={selectedView === 'emissions' ? 'contained' : 'outlined'}
                  startIcon={<BarChart />}
                  onClick={() => setSelectedView('emissions')}
                  sx={{ mr: 1 }}
                >
                  Emissions
                </Button>
                <Button
                  variant={selectedView === 'equivalencies' ? 'contained' : 'outlined'}
                  startIcon={<CompareArrows />}
                  onClick={() => setSelectedView('equivalencies')}
                >
                  Equivalencies
                </Button>
              </Box>
              
              {selectedView === 'emissions' ? renderCharts() : renderEquivalencies()}
              
              <Box mt={4}>
                <Typography variant="h6" gutterBottom>
                  Summary Statistics
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Metric</TableCell>
                        <TableCell align="right">Before</TableCell>
                        <TableCell align="right">After</TableCell>
                        <TableCell align="right">Difference</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Total Emissions (g CO2)</TableCell>
                        <TableCell align="right">{results.beforeEmissions.toLocaleString()}</TableCell>
                        <TableCell align="right">{results.afterEmissions.toLocaleString()}</TableCell>
                        <TableCell align="right">{results.emissionsSaved.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Carbon Capture from Trees (g CO2)</TableCell>
                        <TableCell align="right">0</TableCell>
                        <TableCell align="right">{results.treeCaptureAmount.toLocaleString()}</TableCell>
                        <TableCell align="right">{results.treeCaptureAmount.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Climate Benefit (g CO2)</TableCell>
                        <TableCell align="right">-</TableCell>
                        <TableCell align="right">-</TableCell>
                        <TableCell align="right">{results.totalBenefit.toLocaleString()}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Paper>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ClimateImpactCalculator;
