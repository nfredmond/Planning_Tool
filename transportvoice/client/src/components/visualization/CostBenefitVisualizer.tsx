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
  Chip,
  useTheme,
  Button,
  Tooltip,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Treemap,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell
} from 'recharts';
import InfoIcon from '@mui/icons-material/Info';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useProjects } from '../../hooks/useProjects';
import { useProjectAlternatives } from '../../hooks/useProjectAlternatives';
import { ProjectType, ProjectAlternative, CostBenefitData } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import ExportMenu from '../common/ExportMenu';

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
      id={`cost-benefit-tabpanel-${index}`}
      aria-labelledby={`cost-benefit-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const CostBenefitVisualizer: React.FC = () => {
  const theme = useTheme();
  const { projects, loading: projectsLoading } = useProjects();
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['cost', 'time', 'emissions', 'safety', 'accessibility', 'community']);
  const [selectedAlternatives, setSelectedAlternatives] = useState<string[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  
  const { 
    alternatives, 
    costBenefitData, 
    loading: alternativesLoading, 
    error 
  } = useProjectAlternatives(selectedProject);

  const metricOptions = [
    { value: 'cost', label: 'Implementation Cost' },
    { value: 'time', label: 'Implementation Time' },
    { value: 'emissions', label: 'Emissions Reduction' },
    { value: 'safety', label: 'Safety Improvement' },
    { value: 'accessibility', label: 'Accessibility' },
    { value: 'community', label: 'Community Support' },
    { value: 'maintenance', label: 'Maintenance Cost' },
    { value: 'equity', label: 'Equity Impact' },
    { value: 'economic', label: 'Economic Benefit' },
  ];

  const COLORS = [
    '#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', 
    '#d0ed57', '#ffc658', '#ff8042', '#ff6361', '#bc5090'
  ];

  useEffect(() => {
    // When project changes, reset selected alternatives to first two by default
    if (alternatives && alternatives.length > 0) {
      setSelectedAlternatives(alternatives.slice(0, Math.min(2, alternatives.length)).map(alt => alt.id));
    } else {
      setSelectedAlternatives([]);
    }
  }, [alternatives]);

  const handleExportClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportMenuAnchor(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMetricToggle = (metric: string) => {
    if (selectedMetrics.includes(metric)) {
      if (selectedMetrics.length > 1) { // Ensure at least one metric is selected
        setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
      }
    } else {
      setSelectedMetrics([...selectedMetrics, metric]);
    }
  };

  const handleAlternativeToggle = (alternativeId: string) => {
    if (selectedAlternatives.includes(alternativeId)) {
      if (selectedAlternatives.length > 1) { // Ensure at least one alternative is selected
        setSelectedAlternatives(selectedAlternatives.filter(id => id !== alternativeId));
      }
    } else {
      setSelectedAlternatives([...selectedAlternatives, alternativeId]);
    }
  };

  const renderRadarChart = () => {
    if (!costBenefitData || selectedAlternatives.length === 0) return null;
    
    const filteredData = costBenefitData.filter(item => 
      selectedAlternatives.includes(item.alternativeId) && 
      selectedMetrics.includes(item.metric)
    );
    
    // Transform data for radar chart
    const radarData = selectedMetrics.map(metric => {
      const metricData: any = { metric: metricOptions.find(m => m.value === metric)?.label || metric };
      selectedAlternatives.forEach(altId => {
        const altData = filteredData.find(d => d.alternativeId === altId && d.metric === metric);
        const alt = alternatives?.find(a => a.id === altId);
        if (altData && alt) {
          metricData[alt.name] = altData.value;
        }
      });
      return metricData;
    });
    
    return (
      <Box sx={{ height: 500, width: '100%', mb: 4 }}>
        <Typography variant="h6" gutterBottom>Multi-Criteria Comparison</Typography>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            {selectedAlternatives.map((altId, index) => {
              const alt = alternatives?.find(a => a.id === altId);
              return alt ? (
                <Radar
                  key={alt.id}
                  name={alt.name}
                  dataKey={alt.name}
                  stroke={COLORS[index % COLORS.length]}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.3}
                />
              ) : null;
            })}
            <Legend />
            <RechartsTooltip />
          </RadarChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  const renderBarChart = () => {
    if (!costBenefitData || selectedAlternatives.length === 0) return null;
    
    // Transform data for bar chart
    const barData = selectedMetrics.map(metric => {
      const metricData: any = { 
        name: metricOptions.find(m => m.value === metric)?.label || metric 
      };
      
      selectedAlternatives.forEach(altId => {
        const altData = costBenefitData.find(d => d.alternativeId === altId && d.metric === metric);
        const alt = alternatives?.find(a => a.id === altId);
        if (altData && alt) {
          metricData[alt.name] = altData.value;
        }
      });
      
      return metricData;
    });
    
    return (
      <Box sx={{ height: 500, width: '100%', mb: 4 }}>
        <Typography variant="h6" gutterBottom>Metric-by-Metric Comparison</Typography>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={barData}
            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
            <YAxis domain={[0, 100]} />
            <RechartsTooltip />
            <Legend />
            {selectedAlternatives.map((altId, index) => {
              const alt = alternatives?.find(a => a.id === altId);
              return alt ? (
                <Bar 
                  key={alt.id}
                  dataKey={alt.name} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ) : null;
            })}
          </BarChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  const renderTreemap = () => {
    if (!costBenefitData || selectedAlternatives.length === 0) return null;
    
    // Get the first selected alternative for the treemap
    const selectedAltId = selectedAlternatives[0];
    const selectedAlt = alternatives?.find(a => a.id === selectedAltId);
    
    if (!selectedAlt) return null;
    
    // Transform data for treemap
    const treemapData = selectedMetrics.map(metric => {
      const altData = costBenefitData.find(d => d.alternativeId === selectedAltId && d.metric === metric);
      return {
        name: metricOptions.find(m => m.value === metric)?.label || metric,
        size: altData?.value || 0,
        value: altData?.value || 0,
      };
    });
    
    const data = [{
      name: selectedAlt.name,
      children: treemapData
    }];
    
    return (
      <Box sx={{ height: 500, width: '100%', mb: 4 }}>
        <Typography variant="h6" gutterBottom>Proportional Value Breakdown - {selectedAlt.name}</Typography>
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={data}
            dataKey="size"
            ratio={4/3}
            stroke="#fff"
            fill="#8884d8"
            content={<CustomizedContent colors={COLORS} />}
          >
            <RechartsTooltip 
              formatter={(value) => [`Score: ${value}`, '']}
            />
          </Treemap>
        </ResponsiveContainer>
      </Box>
    );
  };

  const CustomizedContent = (props: any) => {
    const { colors, root, depth, x, y, width, height, index, name, value } = props;
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: depth < 2 ? colors[Math.floor(index / 2) % colors.length] : 'none',
            stroke: '#fff',
            strokeWidth: 2 / (depth + 1e-10),
            strokeOpacity: 1 / (depth + 1e-10),
          }}
        />
        {depth === 1 && width > 50 && height > 20 && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 7}
              textAnchor="middle"
              fill="#fff"
              fontSize={14}
            >
              {name}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 7}
              textAnchor="middle"
              fill="#fff"
              fontSize={12}
            >
              {value}
            </text>
          </>
        )}
      </g>
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Cost-Benefit Visualization
          <Tooltip title="Compare different project alternatives based on multiple metrics to support data-driven decisions">
            <InfoIcon sx={{ ml: 1, verticalAlign: 'middle', color: theme.palette.info.main }} />
          </Tooltip>
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Create visual comparisons of different project alternatives based on community feedback, estimated costs, and projected benefits.
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
          <Grid item xs={12} md={8}>
            {selectedProject && (
              <Typography variant="body2" color="text.secondary">
                Select metrics and alternatives below to customize the visualization
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>

      {(alternativesLoading || projectsLoading) ? (
        <LoadingSpinner />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : !selectedProject ? (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h6">Please select a project to view cost-benefit analysis</Typography>
        </Paper>
      ) : !alternatives || alternatives.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h6">No alternatives found for this project</Typography>
        </Paper>
      ) : (
        <>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>Metrics</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {metricOptions.map((metric) => (
                    <Chip 
                      key={metric.value}
                      label={metric.label}
                      color={selectedMetrics.includes(metric.value) ? "primary" : "default"}
                      onClick={() => handleMetricToggle(metric.value)}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>Alternatives to Compare</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {alternatives.map((alt) => (
                    <Chip 
                      key={alt.id}
                      label={alt.name}
                      color={selectedAlternatives.includes(alt.id) ? "secondary" : "default"}
                      onClick={() => handleAlternativeToggle(alt.id)}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ mb: 4 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="cost benefit visualization tabs"
                centered
              >
                <Tab label="Radar Chart" />
                <Tab label="Bar Chart" />
                <Tab label="Treemap" />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              {renderRadarChart()}
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              {renderBarChart()}
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              {renderTreemap()}
            </TabPanel>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportClick}
            >
              Export Analysis
            </Button>
            <ExportMenu 
              anchorEl={exportMenuAnchor}
              open={Boolean(exportMenuAnchor)}
              onClose={handleExportClose}
              dataType="costBenefit"
              projectId={selectedProject}
            />
          </Box>
        </>
      )}
    </Container>
  );
};

export default CostBenefitVisualizer; 