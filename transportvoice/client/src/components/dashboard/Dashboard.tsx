import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Paper, Typography, Box, Card, CardContent, 
  Divider, Button, Chip, Avatar, List, ListItem, ListItemText,
  ListItemAvatar, Tabs, Tab, CircularProgress
} from '@mui/material';
import {
  Assessment, TrafficOutlined, TrendingUp, Nature,
  EmojiTransportation, People, PieChart, BarChart, 
  StackedBarChart, DateRange, Public, Map, Route,
  DirectionsCar, DirectionsBike, DirectionsWalk, DirectionsBus
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
  Title,
  RadialLinearScale,
  RadarController,
  PointElement as PE
} from 'chart.js';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';

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
  Title,
  RadialLinearScale,
  RadarController,
  PE
);

interface TransportationData {
  carShare: number;
  transitShare: number;
  bikeShare: number;
  walkShare: number;
  totalTrips: number;
  averageTripLength: number;
  avgEmissionsPerDay: number;
  emissionsReduction: number;
}

interface ProjectData {
  title: string;
  status: 'planning' | 'inProgress' | 'completed';
  area: string;
  impact: number;
  date: string;
  type: string;
}

interface CustomChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    hoverOffset?: number;
    tension?: number;
    fill?: boolean;
  }[];
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [transportationData, setTransportationData] = useState<TransportationData>({
    carShare: 65,
    transitShare: 20,
    bikeShare: 5,
    walkShare: 10,
    totalTrips: 12450,
    averageTripLength: 7.3,
    avgEmissionsPerDay: 186,
    emissionsReduction: 12
  });
  
  const [recentProjects, setRecentProjects] = useState<ProjectData[]>([
    {
      title: 'Main Street Bike Lane',
      status: 'completed',
      area: 'Downtown',
      impact: 15,
      date: '2024-12-15',
      type: 'bike'
    },
    {
      title: 'Transit Signal Priority System',
      status: 'inProgress',
      area: 'City-wide',
      impact: 8,
      date: '2025-01-10',
      type: 'transit'
    },
    {
      title: 'Pedestrian Safety Improvements',
      status: 'planning',
      area: 'Westside',
      impact: 5,
      date: '2025-02-15',
      type: 'walk'
    },
    {
      title: 'Mixed-Use Development Transit Hub',
      status: 'planning',
      area: 'East District',
      impact: 20,
      date: '2025-03-01',
      type: 'mixed'
    }
  ]);
  
  const [monthlyData, setMonthlyData] = useState<{[key: string]: number[]}>({
    emissions: [210, 205, 198, 201, 199, 195, 190, 188, 184, 180, 178, 176],
    carUse: [68, 67, 67, 66, 65, 64, 63, 62, 61, 60, 60, 59],
    transitUse: [17, 18, 18, 19, 20, 21, 22, 23, 23, 24, 24, 25],
    activeTransport: [15, 15, 15, 15, 15, 15, 15, 15, 16, 16, 16, 16]
  });
  
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  const modeSplitData: CustomChartData = {
    labels: ['Car', 'Transit', 'Bicycle', 'Walking'],
    datasets: [
      {
        label: 'Transportation Mode Split',
        data: [
          transportationData.carShare, 
          transportationData.transitShare, 
          transportationData.bikeShare, 
          transportationData.walkShare
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1,
        hoverOffset: 15
      }
    ]
  };
  
  const emissionsTrendData: CustomChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'CO2 Emissions (kg/day)',
        data: monthlyData.emissions,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true
      }
    ]
  };
  
  const modeTrendData: CustomChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Car Use (%)',
        data: monthlyData.carUse,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        tension: 0.1
      },
      {
        label: 'Transit Use (%)',
        data: monthlyData.transitUse,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        tension: 0.1
      },
      {
        label: 'Active Transportation (%)',
        data: monthlyData.activeTransport,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        tension: 0.1
      }
    ]
  };
  
  const renderProjectIcon = (type: string) => {
    switch (type) {
      case 'bike':
        return <DirectionsBike />;
      case 'transit':
        return <DirectionsBus />;
      case 'walk':
        return <DirectionsWalk />;
      case 'car':
        return <DirectionsCar />;
      default:
        return <EmojiTransportation />;
    }
  };
  
  const renderStatusChip = (status: string) => {
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
    
    switch (status) {
      case 'planning':
        color = 'info';
        break;
      case 'inProgress':
        color = 'warning';
        break;
      case 'completed':
        color = 'success';
        break;
    }
    
    return (
      <Chip 
        size="small" 
        color={color} 
        label={status === 'inProgress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)} 
      />
    );
  };
  
  // Loading state
  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box mt={3} mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
          Transportation Analytics Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Real-time insights into transportation patterns, emissions, and project impacts.
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Key metrics cards */}
        <Grid item xs={12} md={3}>
          <Card raised>
            <CardContent>
              <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Daily Trips
                  </Typography>
                  <Typography variant="h4">
                    {transportationData.totalTrips.toLocaleString()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Route />
                </Avatar>
              </Box>
              <Box mt={2} display="flex" alignItems="center">
                <TrendingUp fontSize="small" color="success" />
                <Typography variant="body2" color="success.main" ml={0.5}>
                  +3.2% from last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card raised>
            <CardContent>
              <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Avg Trip Length
                  </Typography>
                  <Typography variant="h4">
                    {transportationData.averageTripLength}
                  </Typography>
                  <Typography variant="body2" component="span">
                    miles
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Map />
                </Avatar>
              </Box>
              <Box mt={2} display="flex" alignItems="center">
                <TrendingUp fontSize="small" color="success" />
                <Typography variant="body2" color="success.main" ml={0.5}>
                  -0.5% from last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card raised>
            <CardContent>
              <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Daily Emissions
                  </Typography>
                  <Typography variant="h4">
                    {transportationData.avgEmissionsPerDay}
                  </Typography>
                  <Typography variant="body2" component="span">
                    kg CO2
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.light' }}>
                  <Public />
                </Avatar>
              </Box>
              <Box mt={2} display="flex" alignItems="center">
                <TrendingUp fontSize="small" color="success" />
                <Typography variant="body2" color="success.main" ml={0.5}>
                  -{transportationData.emissionsReduction}% from last year
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card raised>
            <CardContent>
              <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Sustainable Trips
                  </Typography>
                  <Typography variant="h4">
                    {transportationData.transitShare + transportationData.bikeShare + transportationData.walkShare}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <Nature />
                </Avatar>
              </Box>
              <Box mt={2} display="flex" alignItems="center">
                <TrendingUp fontSize="small" color="success" />
                <Typography variant="body2" color="success.main" ml={0.5}>
                  +2.5% from last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Charts section */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ mb: 3 }}
            >
              <Tab icon={<PieChart />} label="Mode Split" />
              <Tab icon={<StackedBarChart />} label="Trends" />
              <Tab icon={<BarChart />} label="Projects" />
            </Tabs>
            
            {activeTab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box p={2}>
                    <Typography variant="h6" gutterBottom align="center">
                      Transportation Mode Split
                    </Typography>
                    <Box height={300}>
                      <Doughnut 
                        data={modeSplitData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom'
                            }
                          }
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box p={2}>
                    <Typography variant="h6" gutterBottom>
                      Mode Split Analysis
                    </Typography>
                    <Typography variant="body1" paragraph>
                      The current transportation mode split shows that private vehicles remain the dominant mode at {transportationData.carShare}%. 
                      However, sustainable transportation modes collectively account for {100 - transportationData.carShare}% of trips.
                    </Typography>
                    <Typography variant="body1" paragraph>
                      Public transit usage is {transportationData.transitShare}%, while active transportation (biking and walking) 
                      makes up {transportationData.bikeShare + transportationData.walkShare}% of all trips.
                    </Typography>
                    <Typography variant="body1">
                      Recent transportation initiatives have helped increase sustainable modes by {transportationData.emissionsReduction}% 
                      compared to the previous year, contributing to reduced emissions and congestion.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            )}
            
            {activeTab === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box p={2}>
                    <Typography variant="h6" gutterBottom align="center">
                      CO2 Emissions Trend
                    </Typography>
                    <Box height={300}>
                      <Line 
                        data={emissionsTrendData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: false,
                              title: {
                                display: true,
                                text: 'kg CO2 per day'
                              }
                            }
                          },
                          plugins: {
                            legend: {
                              position: 'bottom'
                            }
                          }
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box p={2}>
                    <Typography variant="h6" gutterBottom align="center">
                      Transportation Mode Trends
                    </Typography>
                    <Box height={300}>
                      <Line 
                        data={modeTrendData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: false,
                              title: {
                                display: true,
                                text: 'Mode Share (%)'
                              }
                            }
                          },
                          plugins: {
                            legend: {
                              position: 'bottom'
                            }
                          }
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            )}
            
            {activeTab === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                  <Box p={2}>
                    <Typography variant="h6" gutterBottom>
                      Project Impact Analysis
                    </Typography>
                    <Box height={300}>
                      <Bar
                        data={{
                          labels: recentProjects.map((p: ProjectData) => p.title),
                          datasets: [{
                            label: 'Emissions Reduction (%)',
                            data: recentProjects.map((p: ProjectData) => p.impact),
                            backgroundColor: [
                              'rgba(75, 192, 192, 0.6)',
                              'rgba(54, 162, 235, 0.6)',
                              'rgba(255, 206, 86, 0.6)',
                              'rgba(153, 102, 255, 0.6)',
                            ],
                            borderColor: [
                              'rgba(75, 192, 192, 1)',
                              'rgba(54, 162, 235, 1)',
                              'rgba(255, 206, 86, 1)',
                              'rgba(153, 102, 255, 1)',
                            ],
                            borderWidth: 1
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: {
                                display: true,
                                text: 'Estimated Impact (%)'
                              }
                            }
                          },
                          plugins: {
                            legend: {
                              display: false
                            }
                          }
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={5}>
                  <Box p={2}>
                    <Typography variant="h6" gutterBottom>
                      Recent Projects
                    </Typography>
                    <List>
                      {recentProjects.map((project: ProjectData, index: number) => (
                        <ListItem
                          key={index}
                          secondaryAction={renderStatusChip(project.status)}
                          sx={{ 
                            borderBottom: index < recentProjects.length - 1 ? '1px solid #eee' : 'none',
                            py: 1
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar>
                              {renderProjectIcon(project.type)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={project.title}
                            secondary={
                              <>
                                {project.area} • {new Date(project.date).toLocaleDateString()}
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Box mt={2} display="flex" justifyContent="flex-end">
                      <Button color="primary">
                        View All Projects
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 