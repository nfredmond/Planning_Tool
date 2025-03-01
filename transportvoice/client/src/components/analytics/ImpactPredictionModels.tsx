import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Slider,
  Tabs,
  Tab,
  Button,
  Tooltip,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  CircularProgress,
  LinearProgress,
  Badge,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer, 
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import InfoIcon from '@mui/icons-material/Info';
import TrafficIcon from '@mui/icons-material/Traffic';
import CO2Icon from '@mui/icons-material/CO2';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import PsychologyIcon from '@mui/icons-material/Psychology';
import EcoIcon from '@mui/icons-material/Eco';
import RecommendIcon from '@mui/icons-material/Recommend';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { useProjects } from '../../hooks/useProjects';
import { useProjectAlternatives } from '../../hooks/useProjectAlternatives';
import { useImpactPredictions } from '../../hooks/useImpactPredictions';
import { ProjectType, ProjectAlternative, ImpactPrediction } from '../../types';
import MapVisualizer from '../map/MapVisualizer';
import LoadingSpinner from '../common/LoadingSpinner';
import axios from 'axios';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`impact-prediction-tabpanel-${index}`}
      aria-labelledby={`impact-prediction-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ImpactPredictionModels: React.FC = () => {
  const { projects, loading: projectsLoading } = useProjects();
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedAlternative, setSelectedAlternative] = useState<string>('');
  const [tabValue, setTabValue] = useState(0);
  const [confidence, setConfidence] = useState<number>(80);
  const [timeFrame, setTimeFrame] = useState<string>('shortTerm');

  const { 
    alternatives, 
    loading: alternativesLoading 
  } = useProjectAlternatives(selectedProject);

  const {
    predictions,
    loading: predictionsLoading,
    error
  } = useImpactPredictions(selectedProject, selectedAlternative, timeFrame);

  // New state variables for AI-powered climate impact analysis
  const [climateImpact, setClimateImpact] = useState<{
    co2Reduction: number;
    analysis: string;
    recommendations: string[];
  } | null>(null);
  const [loadingClimateData, setLoadingClimateData] = useState<boolean>(false);
  const [climateError, setClimateError] = useState<string | null>(null);

  const timeFrameOptions = [
    { value: 'shortTerm', label: 'Short Term (1 year)' },
    { value: 'mediumTerm', label: 'Medium Term (5 years)' },
    { value: 'longTerm', label: 'Long Term (10+ years)' },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleConfidenceChange = (event: Event, newValue: number | number[]) => {
    setConfidence(newValue as number);
  };

  // Apply confidence level to prediction data
  const applyConfidence = (value: number, range: number = 0.1) => {
    const confidenceFactor = confidence / 100;
    const randomFactor = 1 + ((Math.random() * 2 - 1) * range * (1 - confidenceFactor));
    return value * randomFactor;
  };

  // New function to fetch AI-powered climate impact data
  const fetchClimateImpact = async () => {
    if (!selectedProject || !selectedAlternative) return;
    
    setLoadingClimateData(true);
    setClimateError(null);
    
    try {
      const projectDetails = {
        projectId: selectedProject,
        alternativeId: selectedAlternative,
        // Include other relevant project details
        confidenceLevel: confidence
      };
      
      const response = await axios.post('/api/analytics/climate-impact', {
        projectId: selectedProject,
        projectDetails
      });
      
      if (response.data) {
        setClimateImpact(response.data);
      }
    } catch (error) {
      console.error('Error fetching climate impact data:', error);
      setClimateError('Failed to fetch climate impact data. Please try again later.');
      setClimateImpact(null);
    } finally {
      setLoadingClimateData(false);
    }
  };
  
  // Fetch climate impact data when project or alternative changes
  useEffect(() => {
    if (selectedProject && selectedAlternative && tabValue === 1) { // Emissions tab
      fetchClimateImpact();
    }
  }, [selectedProject, selectedAlternative, tabValue]);

  const renderTrafficFlowImpact = () => {
    if (!predictions || !predictions.trafficFlow) return <Typography>No traffic flow prediction data available</Typography>;

    const trafficData = predictions.trafficFlow.map(item => ({
      ...item,
      value: applyConfidence(item.value)
    }));

    const totalReduction = trafficData.reduce((sum, item) => 
      item.change === 'reduction' ? sum + item.value : sum, 0);
    
    const totalIncrease = trafficData.reduce((sum, item) => 
      item.change === 'increase' ? sum + item.value : sum, 0);
    
    const netChange = totalReduction - totalIncrease;
    const percentChange = (netChange / (totalReduction + totalIncrease)) * 100;

    return (
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardHeader
              title="Traffic Flow Summary"
              avatar={<TrafficIcon color="primary" />}
            />
            <Divider />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress 
                    variant="determinate" 
                    value={Math.abs(percentChange)} 
                    color={percentChange < 0 ? "error" : "success"}
                    size={120}
                    thickness={5}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h4" component="div" color="text.secondary">
                      {Math.abs(percentChange).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h6" align="center">
                  {percentChange < 0 ? 'Traffic Increase' : 'Traffic Reduction'}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  Based on current traffic patterns and projected changes from the proposed design
                </Typography>
                <Box sx={{ width: '100%', mt: 2 }}>
                  <Typography gutterBottom>Prediction Confidence: {confidence}%</Typography>
                  <Slider
                    value={confidence}
                    onChange={handleConfidenceChange}
                    aria-labelledby="confidence-slider"
                    valueLabelDisplay="auto"
                    step={5}
                    marks
                    min={50}
                    max={95}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardHeader title="Projected Traffic Changes by Road Segment" />
            <Divider />
            <CardContent>
              <Box sx={{ height: 350, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={trafficData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="segment" angle={-45} textAnchor="end" height={70} />
                    <YAxis />
                    <RechartsTooltip 
                      formatter={(value, name) => [
                        `${value.toFixed(1)}% ${name === 'value' ? 'change' : name}`, 
                        ''
                      ]}
                    />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      name="Traffic Change (%)" 
                      fill={(datum) => datum.change === 'reduction' ? '#4CAF50' : '#F44336'}
                    >
                      {trafficData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.change === 'reduction' ? '#4CAF50' : '#F44336'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card variant="outlined">
            <CardHeader title="Geographic Traffic Flow Changes" />
            <Divider />
            <CardContent>
              <Box sx={{ height: 500, width: '100%' }}>
                <MapVisualizer
                  projectId={selectedProject}
                  alternativeId={selectedAlternative}
                  overlayType="trafficFlow"
                  interactive={true}
                  showLegend={true}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderEmissionsImpact = () => {
    if (!predictions || !predictions.emissions) return <Typography>No emissions prediction data available</Typography>;

    const emissionsData = predictions.emissions.map(item => ({
      ...item,
      value: applyConfidence(item.value, 0.15)
    }));

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          CO2 Emissions Impact
          <Tooltip title="Projected reduction in carbon emissions based on transportation mode shifts">
            <InfoIcon color="primary" sx={{ ml: 1, verticalAlign: 'middle' }} />
          </Tooltip>
          <Chip 
            label="AI-Enhanced" 
            color="success" 
            size="small" 
            icon={<EcoIcon />} 
            sx={{ ml: 2 }} 
          />
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={emissionsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'CO2 Reduction (tons/year)', angle: -90, position: 'insideLeft' }} />
                <RechartsTooltip formatter={(value) => [`${value} tons`, 'CO2 Reduction']} />
                <Legend />
                <Bar 
                  dataKey="value" 
                  fill="#4caf50"
                  name="CO2 Reduction" 
                  isAnimationActive={true}
                >
                  {emissionsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Current' ? '#f44336' : '#4caf50'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Grid>
          
          <Grid item xs={12} md={6}>
            {loadingClimateData ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Loading AI-generated climate impact analysis...</Typography>
              </Box>
            ) : climateError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {climateError}
              </Alert>
            ) : climateImpact ? (
              <Card variant="outlined">
                <CardHeader 
                  title="AI Climate Impact Analysis" 
                  subheader={`Estimated CO2 Reduction: ${climateImpact.co2Reduction.toLocaleString()} tons/year`}
                  avatar={<EcoIcon color="success" />}
                />
                <Divider />
                <CardContent>
                  <Typography variant="body1" paragraph>
                    {climateImpact.analysis}
                  </Typography>
                  
                  <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
                    Recommendations to Improve Climate Benefits:
                  </Typography>
                  <List dense>
                    {climateImpact.recommendations.map((recommendation, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <RecommendIcon color="success" />
                        </ListItemIcon>
                        <ListItemText primary={recommendation} />
                      </ListItem>
                    ))}
                  </List>
                  
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    startIcon={<LightbulbIcon />}
                    onClick={fetchClimateImpact}
                    sx={{ mt: 2 }}
                  >
                    Refresh Analysis
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography color="text.secondary">
                  Select a project and alternative to see AI-powered climate impact analysis
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderSafetyImpact = () => {
    if (!predictions || !predictions.safety) return <Typography>No safety prediction data available</Typography>;

    const safetyData = predictions.safety.map(item => ({
      ...item,
      value: applyConfidence(item.value, 0.2)
    }));

    const totalReduction = safetyData.reduce((sum, item) => sum + item.value, 0);
    const percentReduction = totalReduction / safetyData.reduce((sum, item) => sum + item.baseline, 0) * 100;

    // Create pie chart data
    const pieData = [
      { name: 'Vehicle-Vehicle', value: safetyData.find(item => item.type === 'vehicle-vehicle')?.value || 0 },
      { name: 'Vehicle-Pedestrian', value: safetyData.find(item => item.type === 'vehicle-pedestrian')?.value || 0 },
      { name: 'Vehicle-Cyclist', value: safetyData.find(item => item.type === 'vehicle-cyclist')?.value || 0 },
      { name: 'Single Vehicle', value: safetyData.find(item => item.type === 'single-vehicle')?.value || 0 },
    ];

    return (
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardHeader
              title="Safety Improvement Summary"
              avatar={<HealthAndSafetyIcon color="primary" />}
            />
            <Divider />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress 
                    variant="determinate" 
                    value={percentReduction} 
                    color="success"
                    size={120}
                    thickness={5}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h4" component="div" color="text.secondary">
                      {percentReduction.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h6" align="center">
                  Crash Reduction
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  Estimated reduction in annual crashes based on safety improvements
                </Typography>
                <Box sx={{ width: '100%', mt: 2 }}>
                  <Typography variant="h5" align="center" color="success.main">
                    {Math.round(totalReduction)} fewer crashes annually
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardHeader title="Crash Reduction by Type" />
            <Divider />
            <CardContent>
              <Box sx={{ height: 350, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={safetyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <RechartsTooltip 
                      formatter={(value, name) => [
                        name === 'baseline' ? `${value} annual crashes before` : `${value} fewer crashes annually`,
                        name === 'baseline' ? 'Current' : 'Reduction'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="baseline" name="Current Crashes" fill="#ff8042" />
                    <Bar dataKey="value" name="Crash Reduction" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardHeader title="Crash Reduction by Severity" />
            <Divider />
            <CardContent>
              <Box sx={{ height: 350, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={110}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => [`${value.toFixed(1)} crashes prevented`, 'Reduction']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardHeader title="Safety Improvements by Location" />
            <Divider />
            <CardContent>
              <Box sx={{ height: 350, width: '100%' }}>
                <MapVisualizer
                  projectId={selectedProject}
                  alternativeId={selectedAlternative}
                  overlayType="safetyHotspots"
                  interactive={true}
                  showLegend={true}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Impact Prediction Models
          <Tooltip title="View projected impacts of transportation projects on traffic flow, emissions, and safety">
            <InfoIcon sx={{ ml: 1, verticalAlign: 'middle', color: 'info.main' }} />
          </Tooltip>
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Integrated predictive models show potential traffic flow changes, emissions impacts, and safety improvements based on proposed designs.
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="project-select-label">Project</InputLabel>
              <Select
                labelId="project-select-label"
                value={selectedProject}
                label="Project"
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                <MenuItem value="">
                  <em>Select a project</em>
                </MenuItem>
                {projects?.map((project: ProjectType) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth disabled={!selectedProject || !alternatives || alternatives.length === 0}>
              <InputLabel id="alternative-select-label">Design Alternative</InputLabel>
              <Select
                labelId="alternative-select-label"
                value={selectedAlternative}
                label="Design Alternative"
                onChange={(e) => setSelectedAlternative(e.target.value)}
              >
                <MenuItem value="">
                  <em>Select a design alternative</em>
                </MenuItem>
                {alternatives?.map((alt: ProjectAlternative) => (
                  <MenuItem key={alt.id} value={alt.id}>
                    {alt.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth disabled={!selectedProject || !selectedAlternative}>
              <InputLabel id="timeframe-select-label">Time Frame</InputLabel>
              <Select
                labelId="timeframe-select-label"
                value={timeFrame}
                label="Time Frame"
                onChange={(e) => setTimeFrame(e.target.value)}
              >
                {timeFrameOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {(projectsLoading || alternativesLoading || predictionsLoading) ? (
        <LoadingSpinner />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : !selectedProject || !selectedAlternative ? (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h6">Please select a project and design alternative to view impact predictions</Typography>
        </Paper>
      ) : (
        <Paper sx={{ mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="impact prediction tabs"
              centered
            >
              <Tab 
                label="Traffic Flow" 
                icon={<TrafficIcon />} 
                iconPosition="start"
              />
              <Tab 
                label="Emissions" 
                icon={<CO2Icon />} 
                iconPosition="start"
              />
              <Tab 
                label="Safety" 
                icon={<HealthAndSafetyIcon />} 
                iconPosition="start"
              />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            {renderTrafficFlowImpact()}
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            {renderEmissionsImpact()}
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            {renderSafetyImpact()}
          </TabPanel>
        </Paper>
      )}
    </Container>
  );
};

export default ImpactPredictionModels; 