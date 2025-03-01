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
  useTheme, 
  Divider,
  Button,
  Tooltip,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert
} from '@mui/material';
import { PieChart, Pie, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import InfoIcon from '@mui/icons-material/Info';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import InsightsIcon from '@mui/icons-material/Insights';
import RecommendIcon from '@mui/icons-material/Recommend';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import { useProjects } from '../../hooks/useProjects';
import { useDemographics } from '../../hooks/useDemographics';
import { DemographicDataPoint, ProjectType, FeedbackItem } from '../../types';
import MapVisualizer from '../map/MapVisualizer';
import LoadingSpinner from '../common/LoadingSpinner';
import ExportMenu from '../common/ExportMenu';
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const DemographicAnalysisDashboard: React.FC = () => {
  const theme = useTheme();
  const { projects, loading: projectsLoading } = useProjects();
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedDemographic, setSelectedDemographic] = useState<string>('income');
  const [viewType, setViewType] = useState<'chart' | 'map'>('chart');
  const { demographicData, loading: demographicLoading, error } = useDemographics(selectedProject);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [insightsLoading, setInsightsLoading] = useState<boolean>(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  const demographicOptions = [
    { value: 'income', label: 'Income Level' },
    { value: 'age', label: 'Age Group' },
    { value: 'ethnicity', label: 'Ethnicity' },
    { value: 'car_ownership', label: 'Vehicle Ownership' },
    { value: 'education', label: 'Education Level' },
    { value: 'transit_usage', label: 'Transit Usage' },
  ];

  // Fetch AI insights when demographic data changes
  useEffect(() => {
    if (demographicData && demographicData.length > 0 && selectedProject) {
      generateAIInsights();
    }
  }, [demographicData, selectedProject]);

  // Generate AI-powered insights from demographic data
  const generateAIInsights = async () => {
    if (!demographicData || demographicData.length === 0) return;
    
    setInsightsLoading(true);
    setInsightsError(null);
    
    try {
      const response = await axios.post('/api/analytics/demographic-insights', {
        projectId: selectedProject,
        demographicData: demographicData
      });
      
      if (response.data) {
        setAiInsights(response.data.insights || []);
        setAiRecommendations(response.data.recommendations || []);
      }
    } catch (error) {
      console.error('Error generating AI insights:', error);
      setInsightsError('Failed to generate AI insights. Please try again later.');
      setAiInsights([]);
      setAiRecommendations([]);
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleExportClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportMenuAnchor(null);
  };

  const renderFeedbackByDemographic = () => {
    if (!demographicData || demographicData.length === 0) {
      return <Typography variant="body1">No demographic data available for this project.</Typography>;
    }

    const relevantData = demographicData.filter(item => item.category === selectedDemographic);
    
    return (
      <Box sx={{ height: 400, width: '100%', mb: 4 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={relevantData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
            <YAxis />
            <RechartsTooltip 
              formatter={(value, name) => [`${value} responses`, name]}
              labelFormatter={(label) => `${selectedDemographic.charAt(0).toUpperCase() + selectedDemographic.slice(1)}: ${label}`}
            />
            <Legend />
            <Bar dataKey="positive" name="Positive Feedback" fill="#4CAF50" />
            <Bar dataKey="neutral" name="Neutral Feedback" fill="#FFC107" />
            <Bar dataKey="negative" name="Negative Feedback" fill="#F44336" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  const renderFeedbackDistribution = () => {
    if (!demographicData || demographicData.length === 0) return null;
    
    // Aggregate sentiment data across all demographics
    const sentimentData = [
      { name: 'Positive', value: demographicData.reduce((sum, item) => sum + (item.positive || 0), 0) },
      { name: 'Neutral', value: demographicData.reduce((sum, item) => sum + (item.neutral || 0), 0) },
      { name: 'Negative', value: demographicData.reduce((sum, item) => sum + (item.negative || 0), 0) },
    ];
    
    return (
      <Box sx={{ height: 300, width: '100%', mb: 4 }}>
        <Typography variant="h6" gutterBottom>Overall Feedback Distribution</Typography>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sentimentData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {sentimentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip formatter={(value) => [`${value} responses`, 'Count']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  const renderParticipationTrends = () => {
    if (!demographicData || demographicData.length === 0) return null;
    
    // Mock participation trend data - in a real app, this would come from API
    const trendData = [
      { date: 'Week 1', participants: 45, comments: 67 },
      { date: 'Week 2', participants: 65, comments: 96 },
      { date: 'Week 3', participants: 87, comments: 132 },
      { date: 'Week 4', participants: 110, comments: 178 },
      { date: 'Week 5', participants: 132, comments: 212 },
      { date: 'Week 6', participants: 176, comments: 265 },
    ];
    
    return (
      <Box sx={{ height: 300, width: '100%', mb: 4 }}>
        <Typography variant="h6" gutterBottom>Participation Trends</Typography>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={trendData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Area type="monotone" dataKey="participants" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
            <Area type="monotone" dataKey="comments" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  const renderDemographicMap = () => {
    return (
      <Box sx={{ height: 600, width: '100%', mb: 4 }}>
        <Typography variant="h6" gutterBottom>Geographic Distribution of Feedback by {selectedDemographic}</Typography>
        <MapVisualizer 
          projectId={selectedProject}
          overlayType="demographic" 
          demographicFilter={selectedDemographic}
          interactive={true}
          showLegend={true}
        />
      </Box>
    );
  };

  // New function to render AI insights
  const renderAIInsights = () => {
    if (insightsLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (insightsError) {
      return (
        <Alert severity="error" sx={{ my: 2 }}>
          {insightsError}
        </Alert>
      );
    }

    if (!aiInsights.length && !aiRecommendations.length) {
      return (
        <Alert severity="info" sx={{ my: 2 }}>
          No AI insights available. Please select a project with demographic data.
        </Alert>
      );
    }

    return (
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardHeader 
              title="AI Demographic Insights" 
              avatar={<InsightsIcon color="primary" />}
            />
            <CardContent>
              <List>
                {aiInsights.map((insight, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <LightbulbIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={insight} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardHeader 
              title="AI Recommendations" 
              avatar={<RecommendIcon color="secondary" />}
            />
            <CardContent>
              <List>
                {aiRecommendations.map((recommendation, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <EqualizerIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText primary={recommendation} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Demographic Analysis Dashboard
          <Tooltip title="Analyze how different demographic groups interact with your transportation projects">
            <InfoIcon color="primary" sx={{ ml: 1, verticalAlign: 'middle' }} />
          </Tooltip>
          <Button 
            variant="outlined" 
            startIcon={<FileDownloadIcon />} 
            sx={{ float: 'right' }}
            onClick={handleExportClick}
          >
            Export
          </Button>
        </Typography>
        
        <ExportMenu 
          anchorEl={exportMenuAnchor} 
          onClose={handleExportClose}
          dataType="demographic"
          projectId={selectedProject}
        />

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Project</InputLabel>
              <Select
                value={selectedProject}
                label="Project"
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                <MenuItem value="">
                  <em>All Projects</em>
                </MenuItem>
                {projects.map((project: ProjectType) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Demographic</InputLabel>
              <Select
                value={selectedDemographic}
                label="Demographic"
                onChange={(e) => setSelectedDemographic(e.target.value as string)}
              >
                {demographicOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>View Type</InputLabel>
              <Select
                value={viewType}
                label="View Type"
                onChange={(e) => setViewType(e.target.value as 'chart' | 'map')}
              >
                <MenuItem value="chart">Charts</MenuItem>
                <MenuItem value="map">Map</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {demographicLoading || projectsLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <Alert severity="error">Error loading demographic data: {error}</Alert>
        ) : viewType === 'chart' ? (
          <>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                {renderFeedbackByDemographic()}
              </Grid>
              <Grid item xs={12} md={6}>
                {renderFeedbackDistribution()}
              </Grid>
              <Grid item xs={12}>
                {renderParticipationTrends()}
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" gutterBottom>
                AI-Powered Demographic Analysis
                <Tooltip title="Insights generated using advanced AI to identify patterns and make recommendations">
                  <InfoIcon color="primary" sx={{ ml: 1, verticalAlign: 'middle' }} />
                </Tooltip>
                <Chip 
                  label="Powered by Claude" 
                  color="primary" 
                  variant="outlined" 
                  size="small" 
                  sx={{ ml: 2 }}
                />
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {renderAIInsights()}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button 
                  variant="contained" 
                  startIcon={<InsightsIcon />}
                  onClick={generateAIInsights}
                  disabled={insightsLoading || !selectedProject}
                >
                  Regenerate AI Insights
                </Button>
              </Box>
            </Box>
          </>
        ) : (
          renderDemographicMap()
        )}
      </Box>
    </Container>
  );
};

export default DemographicAnalysisDashboard; 