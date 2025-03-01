// client/src/components/reports/DemographicAnalysis.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Button,
  Tooltip,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import {
  Info as InfoIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Map as MapIcon
} from '@mui/icons-material';
import { Project } from '../../types/Project';
import { fetchDemographicData } from '../../services/reportService';
import DemographicMap from './DemographicMap';

interface DemographicAnalysisProps {
  project: Project;
  commentsOnly?: boolean;
}

// Types for demographic data
interface DemographicData {
  summary: {
    totalComments: number;
    uniqueUsers: number;
    anonymousComments: number;
    registeredUsers: number;
    demographicDataCaptureRate: number;
  };
  age: {
    under18: number;
    age18to24: number;
    age25to34: number;
    age35to44: number;
    age45to54: number;
    age55to64: number;
    age65plus: number;
    unknown: number;
  };
  income: {
    under25k: number;
    income25kto50k: number;
    income50kto75k: number;
    income75kto100k: number;
    income100kto150k: number;
    incomeOver150k: number;
    unknown: number;
  };
  race: {
    white: number;
    black: number;
    hispanic: number;
    asian: number;
    nativeAmerican: number;
    other: number;
    multiracial: number;
    unknown: number;
  };
  transportMode: {
    car: number;
    transit: number;
    bike: number;
    walk: number;
    other: number;
    unknown: number;
  };
  locations: Array<{
    zipCode: string;
    count: number;
    lat: number;
    lng: number;
    medianIncome: number;
    population: number;
    commentSentiment: number;
  }>;
  equity: {
    representationScore: number;
    coverageScore: number;
    engagementScore: number;
    lowerIncomeParticipation: number;
  };
  censusComparison: {
    ageDistribution: {
      project: Record<string, number>;
      census: Record<string, number>;
    };
    raceDistribution: {
      project: Record<string, number>;
      census: Record<string, number>;
    };
    incomeDistribution: {
      project: Record<string, number>;
      census: Record<string, number>;
    };
  };
}

const DemographicAnalysis: React.FC<DemographicAnalysisProps> = ({
  project,
  commentsOnly = false
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DemographicData | null>(null);
  const [comparisonMetric, setComparisonMetric] = useState<'age' | 'race' | 'income'>('race');
  const [activeTab, setActiveTab] = useState(0);
  const [showMap, setShowMap] = useState(false);

  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', 
    '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'
  ];

  useEffect(() => {
    loadDemographicData();
  }, [project._id]);

  const loadDemographicData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const demographicData = await fetchDemographicData(project._id);
      setData(demographicData);
    } catch (err) {
      console.error('Error loading demographic data:', err);
      setError('Failed to load demographic analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const downloadReport = () => {
    // In a real implementation, this would generate a PDF report
    alert('This would download a detailed demographic analysis report in PDF format.');
  };

  const shareReport = () => {
    // In a real implementation, this would provide sharing options
    alert('This would open sharing options for the demographic analysis.');
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Prepare comparison data for charts
  const prepareComparisonData = () => {
    if (!data) return [];
    
    const comparisonData = [];
    let projectData: Record<string, number> = {};
    let censusData: Record<string, number> = {};
    
    switch (comparisonMetric) {
      case 'age':
        projectData = data.censusComparison.ageDistribution.project;
        censusData = data.censusComparison.ageDistribution.census;
        break;
      case 'race':
        projectData = data.censusComparison.raceDistribution.project;
        censusData = data.censusComparison.raceDistribution.census;
        break;
      case 'income':
        projectData = data.censusComparison.incomeDistribution.project;
        censusData = data.censusComparison.incomeDistribution.census;
        break;
    }
    
    // Convert to array format for charts
    Object.keys(projectData).forEach(key => {
      comparisonData.push({
        name: key,
        project: projectData[key],
        census: censusData[key] || 0,
        diff: (projectData[key] - (censusData[key] || 0)) * 100
      });
    });
    
    return comparisonData;
  };

  // Prepare data for age distribution chart
  const prepareAgeData = () => {
    if (!data) return [];
    
    return [
      { name: 'Under 18', value: data.age.under18 },
      { name: '18-24', value: data.age.age18to24 },
      { name: '25-34', value: data.age.age25to34 },
      { name: '35-44', value: data.age.age35to44 },
      { name: '45-54', value: data.age.age45to54 },
      { name: '55-64', value: data.age.age55to64 },
      { name: '65+', value: data.age.age65plus },
      { name: 'Unknown', value: data.age.unknown },
    ];
  };

  // Prepare data for race distribution chart
  const prepareRaceData = () => {
    if (!data) return [];
    
    return [
      { name: 'White', value: data.race.white },
      { name: 'Black', value: data.race.black },
      { name: 'Hispanic', value: data.race.hispanic },
      { name: 'Asian', value: data.race.asian },
      { name: 'Native American', value: data.race.nativeAmerican },
      { name: 'Multiracial', value: data.race.multiracial },
      { name: 'Other', value: data.race.other },
      { name: 'Unknown', value: data.race.unknown },
    ];
  };

  // Prepare data for income distribution chart
  const prepareIncomeData = () => {
    if (!data) return [];
    
    return [
      { name: 'Under $25k', value: data.income.under25k },
      { name: '$25k-$50k', value: data.income.income25kto50k },
      { name: '$50k-$75k', value: data.income.income50kto75k },
      { name: '$75k-$100k', value: data.income.income75kto100k },
      { name: '$100k-$150k', value: data.income.income100kto150k },
      { name: 'Over $150k', value: data.income.incomeOver150k },
      { name: 'Unknown', value: data.income.unknown },
    ];
  };

  // Prepare data for transportation mode chart
  const prepareTransportData = () => {
    if (!data) return [];
    
    return [
      { name: 'Car', value: data.transportMode.car },
      { name: 'Public Transit', value: data.transportMode.transit },
      { name: 'Bicycle', value: data.transportMode.bike },
      { name: 'Walk', value: data.transportMode.walk },
      { name: 'Other', value: data.transportMode.other },
      { name: 'Unknown', value: data.transportMode.unknown },
    ];
  };

  // Prepare data for bubble chart (income vs participation vs sentiment)
  const prepareBubbleData = () => {
    if (!data) return [];
    
    return data.locations.map(location => ({
      name: location.zipCode,
      income: location.medianIncome / 1000, // Convert to thousands for better visualization
      participation: (location.count / location.population) * 10000, // Scale up for visibility
      sentiment: location.commentSentiment * 100,
      count: location.count,
      population: location.population,
      z: Math.max(5, Math.min(30, location.count * 2)), // Size bubble based on comment count
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No demographic data available for this project.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 0 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            Demographic Analysis
          </Typography>
          <Box>
            <Tooltip title="Download Report">
              <IconButton onClick={downloadReport}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share Analysis">
              <IconButton onClick={shareReport}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Toggle Map View">
              <IconButton onClick={() => setShowMap(!showMap)}>
                <MapIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          This analysis compares the demographic profile of participants with census data to ensure representative feedback.
        </Typography>
        
        {showMap ? (
          <Box sx={{ height: 500, mb: 3 }}>
            <DemographicMap 
              locations={data.locations}
              project={project}
            />
          </Box>
        ) : (
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Engagement Summary
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      <InfoBox
                        title="Total Comments"
                        value={data.summary.totalComments.toString()}
                      />
                      <InfoBox
                        title="Unique Participants"
                        value={data.summary.uniqueUsers.toString()}
                      />
                      <InfoBox
                        title="Demographic Data Rate"
                        value={`${(data.summary.demographicDataCaptureRate * 100).toFixed(1)}%`}
                        tooltip="Percentage of participants who provided demographic information"
                      />
                      <InfoBox
                        title="Equity Score"
                        value={`${(data.equity.representationScore * 100).toFixed(0)}/100`}
                        tooltip="Measures how well participant demographics match the community's overall demographics"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Representation Analysis
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <MetricBar
                        label="Demographic Representation"
                        value={data.equity.representationScore}
                        tooltip="How closely participant demographics match census data"
                      />
                      <MetricBar
                        label="Geographic Coverage"
                        value={data.equity.coverageScore}
                        tooltip="How well comments cover all affected areas"
                      />
                      <MetricBar
                        label="Lower Income Participation"
                        value={data.equity.lowerIncomeParticipation}
                        tooltip="Engagement levels from lower income areas relative to city average"
                      />
                      <MetricBar
                        label="Overall Engagement Score"
                        value={data.equity.engagementScore}
                        tooltip="Combined metric of quantity and diversity of participation"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="demographic tabs">
            <Tab label="Demographics" />
            <Tab label="Census Comparison" />
            <Tab label="Transportation Modes" />
            <Tab label="Income vs. Participation" />
          </Tabs>
        </Box>
        
        {/* Demographics Tab */}
        {activeTab === 0 && (
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" align="center" gutterBottom>
                  Age Distribution
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareAgeData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={formatPercentage} />
                      <RechartsTooltip formatter={(value) => formatPercentage(value as number)} />
                      <Bar dataKey="value" fill="#8884d8">
                        {prepareAgeData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" align="center" gutterBottom>
                  Race/Ethnicity Distribution
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepareRaceData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {prepareRaceData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => formatPercentage(value as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" align="center" gutterBottom>
                  Income Distribution
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareIncomeData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={formatPercentage} />
                      <RechartsTooltip formatter={(value) => formatPercentage(value as number)} />
                      <Bar dataKey="value" fill="#82ca9d">
                        {prepareIncomeData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Census Comparison Tab */}
        {activeTab === 1 && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ mb: 3 }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="comparison-metric-label">Comparison Metric</InputLabel>
                <Select
                  labelId="comparison-metric-label"
                  value={comparisonMetric}
                  onChange={(e) => setComparisonMetric(e.target.value as 'age' | 'race' | 'income')}
                  label="Comparison Metric"
                >
                  <MenuItem value="race">Race/Ethnicity</MenuItem>
                  <MenuItem value="age">Age</MenuItem>
                  <MenuItem value="income">Income</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  Project Participants vs. Census Data
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareComparisonData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={70} 
                      />
                      <YAxis tickFormatter={formatPercentage} />
                      <RechartsTooltip formatter={(value) => formatPercentage(value as number)} />
                      <Legend />
                      <Bar dataKey="project" name="Project Participants" fill="#8884d8" />
                      <Bar dataKey="census" name="Census Data" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Representation Gap Analysis
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareComparisonData()}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[-50, 50]} />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={100} 
                      />
                      <RechartsTooltip 
                        formatter={(value) => [`${value.toFixed(1)}%`, 'Difference']}
                        labelFormatter={(label) => `${label} Representation`}
                      />
                      <Bar dataKey="diff" name="Percentage Difference" fill={(entry) => entry > 0 ? '#82ca9d' : '#ff7373'} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                Insights & Recommendations
              </Typography>
              
              <Typography variant="body2" paragraph>
                {comparisonMetric === 'race' && data.censusComparison.raceDistribution.project.Hispanic < data.censusComparison.raceDistribution.census.Hispanic
                  ? '⚠️ Hispanic/Latino communities appear to be underrepresented in the feedback. Consider targeted outreach in these communities.'
                  : comparisonMetric === 'age' && data.censusComparison.ageDistribution.project.under18 < data.censusComparison.ageDistribution.census.under18
                  ? '⚠️ Youth perspectives (under 18) are underrepresented. Consider partnerships with schools or youth organizations.'
                  : comparisonMetric === 'income' && data.censusComparison.incomeDistribution.project.under25k < data.censusComparison.incomeDistribution.census.under25k
                  ? '⚠️ Lower income residents are underrepresented. Consider targeted outreach in affordable housing areas.'
                  : '✓ Community representation is relatively balanced, but continue monitoring participation.'}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button variant="outlined" size="small">
                  View Detailed Recommendations
                </Button>
                <Button variant="outlined" size="small">
                  Generate Outreach Plan
                </Button>
              </Box>
            </Box>
          </Box>
        )}
        
        {/* Transportation Modes Tab */}
        {activeTab === 2 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" align="center" gutterBottom>
              Transportation Mode Distribution
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepareTransportData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {prepareTransportData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => formatPercentage(value as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareTransportData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={formatPercentage} />
                      <RechartsTooltip formatter={(value) => formatPercentage(value as number)} />
                      <Bar dataKey="value" fill="#8884d8">
                        {prepareTransportData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Transportation Analysis
              </Typography>
              <Typography variant="body2" paragraph>
                This data shows how participants typically travel, which can help contextualize their feedback. People who primarily use different transportation modes often have different perspectives and priorities for transportation projects.
              </Typography>
              <Typography variant="body2">
                {data.transportMode.car > 0.6 
                  ? '⚠️ Car drivers are overrepresented in the feedback. Consider additional outreach to transit users, cyclists, and pedestrians.'
                  : data.transportMode.transit < 0.15
                  ? '⚠️ Transit users are underrepresented. Consider conducting outreach at transit stops or partnering with transit advocacy groups.'
                  : '✓ There is good representation across different transportation modes.'}
              </Typography>
            </Box>
          </Box>
        )}
        
        {/* Income vs. Participation Tab */}
        {activeTab === 3 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" align="center" gutterBottom>
              Median Income vs. Participation Rate by Zip Code
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid />
                  <XAxis 
                    type="number" 
                    dataKey="income" 
                    name="Median Income" 
                    unit="k" 
                    label={{ value: 'Median Income ($k)', position: 'bottom', offset: 0 }} 
                  />
                  <YAxis 
                    type="number" 
                    dataKey="participation" 
                    name="Participation Rate" 
                    label={{ value: 'Participation Rate (per 10,000 residents)', angle: -90, position: 'left' }} 
                  />
                  <ZAxis type="number" dataKey="z" range={[50, 400]} />
                  <RechartsTooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value, name, props) => {
                      if (name === 'Median Income') return `$${value}k`;
                      if (name === 'Participation Rate') return `${(value / 10000 * 100).toFixed(2)}%`;
                      return value;
                    }}
                    wrapperStyle={{ zIndex: 1000 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div style={{ 
                            backgroundColor: '#fff', 
                            padding: '10px', 
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                          }}>
                            <p style={{ margin: 0 }}><strong>Zip: {data.name}</strong></p>
                            <p style={{ margin: 0 }}>Median Income: ${data.income}k</p>
                            <p style={{ margin: 0 }}>Participation: {(data.participation / 10000 * 100).toFixed(2)}%</p>
                            <p style={{ margin: 0 }}>Comments: {data.count}</p>
                            <p style={{ margin: 0 }}>Sentiment: {(data.sentiment).toFixed(0)}/100</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter 
                    name="Zip Codes" 
                    data={prepareBubbleData()} 
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </Box>
            
            <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Income & Participation Analysis
              </Typography>
              <Typography variant="body2" paragraph>
                This visualization shows the relationship between median income and participation rate by zip code. Bubble size indicates the number of comments, and color represents sentiment (darker = more positive).
              </Typography>
              <Typography variant="body2">
                {data.equity.lowerIncomeParticipation < 0.5
                  ? '⚠️ Lower income areas have significantly lower participation rates. Consider targeted outreach in these areas, including community centers, places of worship, and local businesses.'
                  : data.equity.lowerIncomeParticipation >= 0.5 && data.equity.lowerIncomeParticipation < 0.8
                  ? '⚠️ Lower income areas have somewhat lower participation rates, but the gap is not extreme. Continue efforts to engage these communities.'
                  : '✓ There is relatively equal participation across income levels, which is excellent for representative feedback.'}
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

// Helper component for info boxes
interface InfoBoxProps {
  title: string;
  value: string;
  tooltip?: string;
}

const InfoBox: React.FC<InfoBoxProps> = ({ title, value, tooltip }) => {
  return (
    <Box sx={{ 
      p: 2, 
      borderRadius: 1, 
      bgcolor: 'background.paper',
      boxShadow: 1,
      minWidth: 120
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        {tooltip && (
          <Tooltip title={tooltip}>
            <InfoIcon sx={{ ml: 0.5, fontSize: 16, color: 'text.secondary' }} />
          </Tooltip>
        )}
      </Box>
      <Typography variant="h6">
        {value}
      </Typography>
    </Box>
  );
};

// Helper component for metric bars
interface MetricBarProps {
  label: string;
  value: number;
  tooltip?: string;
}

const MetricBar: React.FC<MetricBarProps> = ({ label, value, tooltip }) => {
  // Determine color based on value
  const getColor = (value: number) => {
    if (value < 0.4) return '#f44336'; // Red
    if (value < 0.7) return '#ff9800'; // Orange
    return '#4caf50'; // Green
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
        <Typography variant="body2">
          {label}
        </Typography>
        {tooltip && (
          <Tooltip title={tooltip}>
            <InfoIcon sx={{ ml: 0.5, fontSize: 16, color: 'text.secondary' }} />
          </Tooltip>
        )}
        <Box sx={{ ml: 'auto' }}>
          <Typography variant="body2" fontWeight="bold">
            {(value * 100).toFixed(0)}%
          </Typography>
        </Box>
      </Box>
      <Box 
        sx={{
          width: '100%',
          height: 8,
          bgcolor: '#e0e0e0',
          borderRadius: 4,
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            width: `${value * 100}%`,
            height: '100%',
            bgcolor: getColor(value)
          }}
        />
      </Box>
    </Box>
  );
};

export default DemographicAnalysis;

// client/src/components/reports/DemographicMap.tsx
import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Box, Typography, Paper, FormControlLabel, Switch, FormGroup } from '@mui/material';
import { Project } from '../../types/Project';

// Set your mapbox token
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || '';

interface DemographicMapProps {
  locations: Array<{
    zipCode: string;
    count: number;
    lat: number;
    lng: number;
    medianIncome: number;
    population: number;
    commentSentiment: number;
  }>;
  project: Project;
}

const DemographicMap: React.FC<DemographicMapProps> = ({ locations, project }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [visualizationMode, setVisualizationMode] = useState<'count' | 'income' | 'sentiment'>('count');

  useEffect(() => {
    if (map.current) return; // Don't initialize map more than once
    
    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v10',
        center: [
          project.bounds ? (project.bounds.west + project.bounds.east) / 2 : -98,
          project.bounds ? (project.bounds.north + project.bounds.south) / 2 : 39
        ],
        zoom: project.bounds ? 10 : 3
      });

      map.current.on('load', () => {
        setMapLoaded(true);
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Add location data to map when it's loaded
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Add source data
    if (map.current.getSource('locations')) {
      map.current.removeLayer('locations-layer');
      map.current.removeSource('locations');
    }

    // Add project boundary if available
    if (project.bounds && map.current) {
      const bounds: [number, number, number, number] = [
        project.bounds.west,
        project.bounds.south,
        project.bounds.east,
        project.bounds.north
      ];
      
      if (map.current.getSource('project-boundary')) {
        map.current.removeLayer('project-boundary-layer');
        map.current.removeSource('project-boundary');
      }
      
      map.current.addSource('project-boundary', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [bounds[0], bounds[1]],
              [bounds[2], bounds[1]],
              [bounds[2], bounds[3]],
              [bounds[0], bounds[3]],
              [bounds[0], bounds[1]]
            ]]
          },
          properties: {}
        }
      });
      
      map.current.addLayer({
        id: 'project-boundary-layer',
        type: 'line',
        source: 'project-boundary',
        layout: {},
        paint: {
          'line-color': '#3887be',
          'line-width': 2,
          'line-dasharray': [2, 1]
        }
      });
    }

    // Add data points
    map.current.addSource('locations', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: locations.map(location => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [location.lng, location.lat]
          },
          properties: {
            zipCode: location.zipCode,
            count: location.count,
            population: location.population,
            medianIncome: location.medianIncome,
            participationRate: (location.count / location.population) * 100,
            sentiment: location.commentSentiment
          }
        }))
      }
    });

    // Add visualization layer
    updateVisualizationLayer();

  }, [mapLoaded, visualizationMode]);

  // Update the visualization layer when the mode changes
  const updateVisualizationLayer = () => {
    if (!map.current) return;

    // Remove existing layer if it exists
    if (map.current.getLayer('locations-layer')) {
      map.current.removeLayer('locations-layer');
    }

    // Configure circle color and size based on the visualization mode
    let circleColor: any = ['interpolate', ['linear'], ['get', 'count'], 0, '#FFEDA0', 20, '#FEB24C', 50, '#FC4E2A', 100, '#E31A1C', 200, '#BD0026'];
    let circleRadius: any = ['interpolate', ['linear'], ['get', 'count'], 1, 5, 10, 10, 50, 15, 100, 20, 200, 30];
    let propertyForPopup = 'count';
    let propertyLabel = 'Comments';

    if (visualizationMode === 'income') {
      circleColor = [
        'interpolate', ['linear'], ['get', 'medianIncome'],
        30000, '#edf8e9',
        60000, '#bae4b3',
        90000, '#74c476',
        120000, '#31a354',
        150000, '#006d2c'
      ];
      circleRadius = [
        'interpolate', ['linear'], ['get', 'count'],
        1, 5, 10, 8, 50, 12, 100, 16, 200, 20
      ];
      propertyForPopup = 'medianIncome';
      propertyLabel = 'Median Income';
    } else if (visualizationMode === 'sentiment') {
      circleColor = [
        'interpolate', ['linear'], ['get', 'sentiment'],
        0, '#d73027',
        0.25, '#fc8d59',
        0.5, '#fee08b',
        0.75, '#d9ef8b',
        1, '#91cf60'
      ];
      circleRadius = [
        'interpolate', ['linear'], ['get', 'count'],
        1, 5, 10, 8, 50, 12, 100, 16, 200, 20
      ];
      propertyForPopup = 'sentiment';
      propertyLabel = 'Sentiment Score';
    }

    // Add the layer with the configured properties
    map.current.addLayer({
      id: 'locations-layer',
      type: 'circle',
      source: 'locations',
      paint: {
        'circle-color': circleColor,
        'circle-radius': circleRadius,
        'circle-opacity': 0.8,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#ffffff'
      }
    });

    // Add popups
    map.current.on('click', 'locations-layer', (e) => {
      if (!e.features || e.features.length === 0 || !map.current) return;
      
      const feature = e.features[0];
      const props = feature.properties;
      if (!props) return;
      
      const coordinates = e.lngLat;
      
      // Format property value for display
      let displayValue = props[propertyForPopup];
      if (propertyForPopup === 'medianIncome') {
        displayValue = `$${displayValue.toLocaleString()}`;
      } else if (propertyForPopup === 'sentiment') {
        displayValue = `${(displayValue * 100).toFixed(0)}/100`;
      }
      
      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(`
          <h4>Zip Code: ${props.zipCode}</h4>
          <p>${propertyLabel}: ${displayValue}</p>
          <p>Comments: ${props.count}</p>
          <p>Participation Rate: ${props.participationRate.toFixed(2)}%</p>
        `)
        .addTo(map.current);
    });
    
    // Change cursor on hover
    map.current.on('mouseenter', 'locations-layer', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer';
    });
    
    map.current.on('mouseleave', 'locations-layer', () => {
      if (map.current) map.current.getCanvas().style.cursor = '';
    });
  };

  const handleVisualizationChange = (mode: 'count' | 'income' | 'sentiment') => {
    setVisualizationMode(mode);
  };

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      <Box
        ref={mapContainer}
        sx={{
          height: '100%',
          width: '100%',
          borderRadius: 1,
          overflow: 'hidden'
        }}
      />
      
      <Paper
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          p: 2,
          zIndex: 1,
          width: 200
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Visualization Mode
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={visualizationMode === 'count'}
                onChange={() => handleVisualizationChange('count')}
                size="small"
              />
            }
            label="Comment Count"
          />
          <FormControlLabel
            control={
              <Switch
                checked={visualizationMode === 'income'}
                onChange={() => handleVisualizationChange('income')}
                size="small"
              />
            }
            label="Income Level"
          />
          <FormControlLabel
            control={
              <Switch
                checked={visualizationMode === 'sentiment'}
                onChange={() => handleVisualizationChange('sentiment')}
                size="small"
              />
            }
            label="Sentiment Score"
          />
        </FormGroup>
      </Paper>
    </Box>
  );
};

export default DemographicMap;

// Update client/src/services/reportService.ts to include the demographic data API
// Add this function to reportService.ts:

export const fetchDemographicData = async (projectId: string): Promise<any> => {
  try {
    const response = await api.get(`/reports/demographics/${projectId}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Update the reports page to include the Demographic Analysis component
// Add this to the appropriate reports view component:
//
// <DemographicAnalysis project={project} />
