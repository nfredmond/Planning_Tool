import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Button,
  IconButton,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  Menu,
  LinearProgress,
  CircularProgress,
  OutlinedInput,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Public as PublicIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  GetApp as DownloadIcon,
  Refresh as RefreshIcon,
  DateRange as DateRangeIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  ThumbUp as LikeIcon,
  InsertChart as ChartIcon,
  ArrowBack as BackIcon,
  ArrowDropDown as DropDownIcon,
  Map as MapIcon,
  Assessment as ReportIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';

// Mock data for charts - in a real application, this would come from your API
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';

// Mock projects data
const projectsData = [
  {
    id: '1',
    name: 'Downtown Transit Corridor',
    status: 'active',
    views: 2453,
    comments: 132,
    participants: 87,
    satisfaction: 78,
    progress: 65,
  },
  {
    id: '2',
    name: 'Bike Network Expansion',
    status: 'active',
    views: 1876,
    comments: 94,
    participants: 62,
    satisfaction: 85,
    progress: 40,
  },
  {
    id: '3',
    name: 'Pedestrian Safety Improvements',
    status: 'active',
    views: 2123,
    comments: 107,
    participants: 73,
    satisfaction: 82,
    progress: 55,
  },
  {
    id: '4',
    name: 'Neighborhood Park Redesign',
    status: 'completed',
    views: 3421,
    comments: 216,
    participants: 124,
    satisfaction: 89,
    progress: 100,
  },
  {
    id: '5',
    name: 'Main Street Revitalization',
    status: 'planning',
    views: 1234,
    comments: 58,
    participants: 41,
    satisfaction: 72,
    progress: 15,
  },
];

// Mock engagement data by time
const engagementTimeData = [
  { date: '2023-01', comments: 42, views: 623, participants: 28 },
  { date: '2023-02', comments: 63, views: 782, participants: 47 },
  { date: '2023-03', comments: 87, views: 931, participants: 55 },
  { date: '2023-04', comments: 65, views: 856, participants: 49 },
  { date: '2023-05', comments: 92, views: 1143, participants: 68 },
  { date: '2023-06', comments: 113, views: 1356, participants: 82 },
  { date: '2023-07', comments: 132, views: 1587, participants: 93 },
  { date: '2023-08', comments: 127, views: 1423, participants: 87 },
  { date: '2023-09', comments: 156, views: 1798, participants: 104 },
  { date: '2023-10', comments: 182, views: 2134, participants: 121 },
  { date: '2023-11', comments: 163, views: 1976, participants: 115 },
  { date: '2023-12', comments: 147, views: 1832, participants: 98 },
];

// Mock feedback sentiment data
const sentimentData = [
  { name: 'Positive', value: 245, color: '#4caf50' },
  { name: 'Neutral', value: 137, color: '#2196f3' },
  { name: 'Negative', value: 87, color: '#f44336' },
  { name: 'Questions', value: 62, color: '#ff9800' },
];

// Mock user demographics data
const demographicsData = [
  { name: 'Downtown', value: 87, color: '#673ab7' },
  { name: 'Northside', value: 63, color: '#2196f3' },
  { name: 'Westend', value: 75, color: '#e91e63' },
  { name: 'Southside', value: 49, color: '#ff9800' },
  { name: 'Eastside', value: 58, color: '#4caf50' },
];

// Mock project topics data
const topicsData = [
  { name: 'Safety', value: 142, color: '#f44336' },
  { name: 'Accessibility', value: 98, color: '#2196f3' },
  { name: 'Environmental', value: 76, color: '#4caf50' },
  { name: 'Cost', value: 105, color: '#ff9800' },
  { name: 'Timeline', value: 64, color: '#9c27b0' },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AnalyticsDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [selectedDateRange, setSelectedDateRange] = useState('year');
  const [startDate, setStartDate] = useState<Date | null>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)); // 30 days ago
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [selectedProjects, setSelectedProjects] = useState<string[]>(['1', '2', '3']);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [chartType, setChartType] = useState('bar');
  const [loading, setLoading] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDateRangeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string;
    setSelectedDateRange(value);
    
    const now = new Date();
    let start = new Date();
    
    if (value === 'week') {
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (value === 'month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    } else if (value === 'quarter') {
      start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    } else if (value === 'year') {
      start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    }
    
    setStartDate(start);
    setEndDate(now);
  };

  const handleProjectToggle = (projectId: string) => {
    setSelectedProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId);
      } else {
        return [...prev, projectId];
      }
    });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simulate data refresh
    setTimeout(() => {
      setLoading(false);
    }, 1200);
  };

  const handleChartTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: string | null,
  ) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  const handleExport = (format: string) => {
    // Handle exporting analytics data
    console.log(`Exporting data in ${format} format`);
    handleMenuClose();
  };

  // Filter projects based on selection
  const filteredProjects = projectsData.filter(project => 
    selectedProjects.includes(project.id)
  );

  // Calculate summary metrics
  const totalViews = filteredProjects.reduce((sum, project) => sum + project.views, 0);
  const totalComments = filteredProjects.reduce((sum, project) => sum + project.comments, 0);
  const totalParticipants = filteredProjects.reduce((sum, project) => sum + project.participants, 0);
  const avgSatisfaction = Math.round(
    filteredProjects.reduce((sum, project) => sum + project.satisfaction, 0) / filteredProjects.length
  );

  // Prepare chart data
  const projectComparison = filteredProjects.map(project => ({
    name: project.name,
    views: project.views,
    comments: project.comments,
    participants: project.participants,
  }));

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Analytics Dashboard
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="outlined"
          startIcon={<ShareIcon />}
          sx={{ mr: 1 }}
          onClick={handleMenuOpen}
        >
          Export
        </Button>
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => handleExport('pdf')}>Export as PDF</MenuItem>
          <MenuItem onClick={() => handleExport('csv')}>Export as CSV</MenuItem>
          <MenuItem onClick={() => handleExport('image')}>Export as Image</MenuItem>
        </Menu>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </Box>

      {/* Date range selection */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="date-range-label">Time Period</InputLabel>
              <Select
                labelId="date-range-label"
                value={selectedDateRange}
                onChange={handleDateRangeChange}
                label="Time Period"
                startAdornment={<DateRangeIcon sx={{ mr: 1 }} />}
              >
                <MenuItem value="week">Last 7 Days</MenuItem>
                <MenuItem value="month">Last 30 Days</MenuItem>
                <MenuItem value="quarter">Last 3 Months</MenuItem>
                <MenuItem value="year">Last 12 Months</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {selectedDateRange === 'custom' && (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined'
                    }
                  }}
                />
              </Grid>
            </LocalizationProvider>
          )}
          
          {selectedDateRange !== 'custom' && (
            <Grid item xs={12} md={8}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="project-select-label">Projects</InputLabel>
                <Select
                  labelId="project-select-label"
                  multiple
                  value={selectedProjects}
                  onChange={(e) => setSelectedProjects(e.target.value as string[])}
                  input={<OutlinedInput label="Projects" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const project = projectsData.find(p => p.id === value);
                        return (
                          <Chip 
                            key={value} 
                            label={project?.name} 
                            color="primary" 
                            variant="outlined" 
                          />
                        );
                      })}
                    </Box>
                  )}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 224,
                        width: 250,
                      },
                    },
                  }}
                >
                  {projectsData.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 4 }} />}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Views
              </Typography>
              <Typography variant="h4" component="div">
                {totalViews.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across {selectedProjects.length} projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Comments
              </Typography>
              <Typography variant="h4" component="div">
                {totalComments.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                From {totalParticipants} participants
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Engagement Rate
              </Typography>
              <Typography variant="h4" component="div">
                {(totalComments / totalViews * 100).toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Comments per view
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Avg. Satisfaction
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h4" component="div" sx={{ mr: 1 }}>
                  {avgSatisfaction}%
                </Typography>
                <Box position="relative" display="inline-flex">
                  <CircularProgress 
                    variant="determinate" 
                    value={avgSatisfaction} 
                    size={40}
                    color={avgSatisfaction > 75 ? "success" : avgSatisfaction > 50 ? "info" : "warning"}
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
                    <Typography variant="caption" component="div" color="text.secondary">
                      {avgSatisfaction}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Based on feedback
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for different analytics views */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<BarChartIcon />} label="Project Comparison" iconPosition="start" />
          <Tab icon={<TimelineIcon />} label="Engagement Over Time" iconPosition="start" />
          <Tab icon={<PieChartIcon />} label="Feedback Analysis" iconPosition="start" />
          <Tab icon={<MapIcon />} label="Geographic Distribution" iconPosition="start" />
        </Tabs>

        {/* Project Comparison Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Project Metrics Comparison
            </Typography>
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={handleChartTypeChange}
              aria-label="chart type"
              size="small"
            >
              <ToggleButton value="bar" aria-label="bar chart">
                <BarChartIcon />
              </ToggleButton>
              <ToggleButton value="line" aria-label="line chart">
                <TimelineIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart
                  data={projectComparison}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend verticalAlign="top" />
                  <Bar dataKey="views" name="Views" fill="#2196f3" />
                  <Bar dataKey="comments" name="Comments" fill="#4caf50" />
                  <Bar dataKey="participants" name="Participants" fill="#ff9800" />
                </BarChart>
              ) : (
                <LineChart
                  data={projectComparison}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend verticalAlign="top" />
                  <Line type="monotone" dataKey="views" name="Views" stroke="#2196f3" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="comments" name="Comments" stroke="#4caf50" />
                  <Line type="monotone" dataKey="participants" name="Participants" stroke="#ff9800" />
                </LineChart>
              )}
            </ResponsiveContainer>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            Comparison of key metrics across selected projects
          </Typography>
        </TabPanel>

        {/* Engagement Over Time Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6">
              Engagement Trends
            </Typography>
          </Box>
          
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={engagementTimeData}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              >
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2196f3" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2196f3" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4caf50" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorParticipants" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff9800" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ff9800" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <RechartsTooltip />
                <Legend verticalAlign="top" />
                <Area 
                  type="monotone" 
                  dataKey="views" 
                  name="Views" 
                  stroke="#2196f3" 
                  fillOpacity={1} 
                  fill="url(#colorViews)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="comments" 
                  name="Comments" 
                  stroke="#4caf50" 
                  fillOpacity={1} 
                  fill="url(#colorComments)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="participants" 
                  name="Participants" 
                  stroke="#ff9800" 
                  fillOpacity={1} 
                  fill="url(#colorParticipants)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            Monthly engagement metrics over the past year
          </Typography>
        </TabPanel>

        {/* Feedback Analysis Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" align="center" gutterBottom>
                Feedback Sentiment
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value, name) => [`${value} comments`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" align="center" gutterBottom>
                Discussion Topics
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topicsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {topicsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value, name) => [`${value} mentions`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" align="center" gutterBottom>
                Geographic Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={demographicsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {demographicsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value, name) => [`${value} participants`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Key Insights
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <LikeIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Majority of feedback is positive (53%)" 
                      secondary="Residents are generally supportive of the transit corridor improvements" 
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemIcon>
                      <CommentIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Safety is the most discussed topic (29%)" 
                      secondary="Pedestrian and cyclist safety concerns are prominent in feedback" 
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemIcon>
                      <LocationIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Downtown residents are most engaged (26%)" 
                      secondary="Higher participation rates in areas directly affected by projects" 
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Geographic Distribution Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6">
              Geographic Engagement Distribution
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Map showing participation and engagement across different regions
            </Typography>
          </Box>
          
          <Paper 
            variant="outlined" 
            sx={{ 
              height: 500, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: '#f5f5f5'
            }}
          >
            <Box textAlign="center">
              <MapIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Geographic heat map visualization
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View engagement patterns across neighborhoods and regions
              </Typography>
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => navigate('/map-layers')}
              >
                View Interactive Map
              </Button>
            </Box>
          </Paper>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Engaged Neighborhoods
            </Typography>
            <Grid container spacing={2}>
              {demographicsData.map((region) => (
                <Grid item xs={12} sm={6} md={4} key={region.name}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationIcon sx={{ color: region.color, mr: 1 }} />
                      <Typography variant="subtitle1">{region.name}</Typography>
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Engagement Level
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={(region.value / Math.max(...demographicsData.map(r => r.value))) * 100} 
                          sx={{ 
                            flexGrow: 1, 
                            height: 8, 
                            borderRadius: 4,
                            mr: 1,
                            bgcolor: `${region.color}22`,
                            '& .MuiLinearProgress-bar': {
                              bgcolor: region.color
                            }
                          }} 
                        />
                        <Typography variant="body2">
                          {region.value} users
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>
      </Paper>

      {/* Project-specific analytics cards */}
      <Typography variant="h5" gutterBottom>
        Project Details
      </Typography>
      <Grid container spacing={3}>
        {filteredProjects.map((project) => (
          <Grid item xs={12} md={6} key={project.id}>
            <Card>
              <CardHeader
                title={project.name}
                subheader={`Status: ${project.status.charAt(0).toUpperCase() + project.status.slice(1)}`}
                action={
                  <IconButton onClick={() => navigate(`/projects/${project.id}`)}>
                    <MoreIcon />
                  </IconButton>
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Views
                    </Typography>
                    <Typography variant="h6">
                      {project.views.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Comments
                    </Typography>
                    <Typography variant="h6">
                      {project.comments.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Participants
                    </Typography>
                    <Typography variant="h6">
                      {project.participants.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Satisfaction
                    </Typography>
                    <Typography variant="h6">
                      {project.satisfaction}%
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Progress
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={project.progress} 
                      sx={{ height: 8, borderRadius: 4 }} 
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        0%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {project.progress}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        100%
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    size="small" 
                    endIcon={<ReportIcon />}
                    onClick={() => navigate(`/projects/${project.id}/analytics`)}
                  >
                    Detailed Report
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AnalyticsDashboardPage; 