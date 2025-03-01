// client/src/components/admin/reports/ReportsDashboard.tsx
import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Box, 
  Card, 
  CardContent, 
  CardActions,
  IconButton, 
  Tabs, 
  Tab, 
  Menu, 
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Map as MapIcon,
  Download as DownloadIcon,
  Schedule as ScheduleIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  getReports, 
  generateReport, 
  downloadReport, 
  deleteReport 
} from '../../../services/reportService';
import { getProjects } from '../../../services/projectService';
import { Project } from '../../../types/Project';
import { Report } from '../../../types/Report';
import ReportForm from './ReportForm';
import CommentsSummaryChart from './charts/CommentsSummaryChart';
import SentimentAnalysisChart from './charts/SentimentAnalysisChart';
import CommentsHeatmap from './charts/CommentsHeatmap';
import EngagementTimeline from './charts/EngagementTimeline';
import { formatDistanceToNow } from 'date-fns';

const ReportsDashboard: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
    fetchReports();
  }, [activeTab, selectedProject]);

  const fetchProjects = async () => {
    try {
      const fetchedProjects = await getProjects();
      setProjects(fetchedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params: any = {};
      
      if (activeTab !== 'all') {
        params.type = activeTab;
      }
      
      if (selectedProject !== 'all') {
        params.project = selectedProject;
      }
      
      const fetchedReports = await getReports(params);
      setReports(fetchedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshReport = async (reportId: string) => {
    setRefreshing(prev => ({ ...prev, [reportId]: true }));
    setError(null);
    
    try {
      await generateReport(reportId);
      
      // Update the report in the list
      const updatedReports = await getReports();
      setReports(updatedReports);
      
      setSuccess('Report refreshed successfully.');
    } catch (error) {
      console.error('Error refreshing report:', error);
      setError('Failed to refresh report. Please try again.');
    } finally {
      setRefreshing(prev => ({ ...prev, [reportId]: false }));
    }
  };

  const handleDownloadReport = async (reportId: string) => {
    try {
      await downloadReport(reportId);
    } catch (error) {
      console.error('Error downloading report:', error);
      setError('Failed to download report. Please try again.');
    }
  };

  const handleCreateReport = () => {
    setFormOpen(true);
  };

  const handleEditReport = (report: Report) => {
    setSelectedReport(report);
    setFormOpen(true);
  };

  const handleFormClose = (refresh?: boolean) => {
    setFormOpen(false);
    setSelectedReport(null);
    
    if (refresh) {
      fetchReports();
    }
  };

  const handleDeleteClick = (report: Report) => {
    setReportToDelete(report);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reportToDelete) return;
    
    try {
      await deleteReport(reportToDelete._id);
      setReports(reports.filter(r => r._id !== reportToDelete._id));
      setDeleteDialogOpen(false);
      setReportToDelete(null);
      setSuccess('Report deleted successfully.');
    } catch (error) {
      console.error('Error deleting report:', error);
      setError('Failed to delete report. Please try again.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setReportToDelete(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, reportId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveReportId(reportId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveReportId(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'comments':
        return <BarChartIcon />;
      case 'sentiment':
        return <PieChartIcon />;
      case 'engagement':
        return <TimelineIcon />;
      case 'geographic':
        return <MapIcon />;
      default:
        return <BarChartIcon />;
    }
  };

  const getReportComponent = (report: Report) => {
    switch (report.type) {
      case 'comments':
        return <CommentsSummaryChart report={report} />;
      case 'sentiment':
        return <SentimentAnalysisChart report={report} />;
      case 'engagement':
        return <EngagementTimeline report={report} />;
      case 'geographic':
        return <CommentsHeatmap report={report} />;
      default:
        return (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">
              Report preview not available
            </Typography>
          </Box>
        );
    }
  };

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Reports & Analytics
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateReport}
        >
          Create Report
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, p: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            sx={{ flex: 1 }}
          >
            <Tab value="all" label="All Reports" />
            <Tab value="comments" label="Comments" />
            <Tab value="sentiment" label="Sentiment" />
            <Tab value="engagement" label="Engagement" />
            <Tab value="geographic" label="Geographic" />
          </Tabs>
          
          <FormControl sx={{ minWidth: 200, ml: { md: 2 }, mt: { xs: 2, md: 0 } }}>
            <InputLabel id="project-filter-label">Project</InputLabel>
            <Select
              labelId="project-filter-label"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value as string)}
              label="Project"
            >
              <MenuItem value="all">All Projects</MenuItem>
              {projects.map(project => (
                <MenuItem key={project._id} value={project._id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : reports.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No reports found
          </Typography>
          <Typography variant="body1" paragraph>
            {activeTab !== 'all' || selectedProject !== 'all' 
              ? 'Try changing your filters or create a new report.'
              : 'Create your first report to analyze community feedback.'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateReport}
          >
            Create Report
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {reports.map((report) => (
            <Grid item xs={12} md={6} lg={activeTab === 'all' ? 6 : 12} key={report._id}>
              <Card>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid #eee' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'white',
                        mr: 2
                      }}
                    >
                      {getReportIcon(report.type)}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6">
                        {report.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {report.project.name} • {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                      </Typography>
                    </Box>
                    <IconButton onClick={(e) => handleMenuOpen(e, report._id)}>
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ height: 300, overflow: 'hidden' }}>
                    {getReportComponent(report)}
                  </Box>
                  
                  <Box sx={{ px: 2, py: 1, borderTop: '1px solid #eee' }}>
                    <Typography variant="body2" color="textSecondary">
                      {report.lastRun 
                        ? `Last generated ${formatDistanceToNow(new Date(report.lastRun), { addSuffix: true })}` 
                        : 'Never generated'}
                    </Typography>
                    
                    {report.schedule?.enabled && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <ScheduleIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="textSecondary">
                          {`Scheduled: ${report.schedule.frequency}`}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={() => handleRefreshReport(report._id)}
                    disabled={refreshing[report._id]}
                  >
                    {refreshing[report._id] ? 'Refreshing...' : 'Refresh'}
                  </Button>
                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownloadReport(report._id)}
                    disabled={!report.lastRun}
                  >
                    Download
                  </Button>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditReport(report)}
                  >
                    Edit
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Report Form Dialog */}
      <ReportForm 
        open={formOpen} 
        onClose={handleFormClose} 
        report={selectedReport}
        projects={projects}
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Report</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the report "{reportToDelete?.name}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Report Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          const report = reports.find(r => r._id === activeReportId);
          if (report) {
            handleEditReport(report);
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          if (activeReportId) {
            handleRefreshReport(activeReportId);
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            <RefreshIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Refresh</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          if (activeReportId) {
            handleDownloadReport(activeReportId);
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          const report = reports.find(r => r._id === activeReportId);
          if (report) {
            handleDeleteClick(report);
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </div>
  );
};

export default ReportsDashboard;

// client/src/components/admin/reports/ReportForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Box,
  FormControlLabel,
  Switch,
  Divider,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Map as MapIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { createReport, updateReport } from '../../../services/reportService';
import { Project } from '../../../types/Project';
import { Report } from '../../../types/Report';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { add } from 'date-fns';

interface ReportFormProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  report?: Report | null;
  projects: Project[];
}

const ReportForm: React.FC<ReportFormProps> = ({
  open,
  onClose,
  report,
  projects
}) => {
  const [formData, setFormData] = useState<Partial<Report>>({
    name: '',
    description: '',
    project: '',
    type: 'comments',
    parameters: {},
    schedule: {
      enabled: false,
      frequency: 'weekly',
      recipients: []
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newRecipient, setNewRecipient] = useState('');

  useEffect(() => {
    if (report) {
      setFormData({
        ...report,
        schedule: report.schedule || {
          enabled: false,
          frequency: 'weekly',
          recipients: []
        }
      });
    } else {
      setFormData({
        name: '',
        description: '',
        project: projects.length > 0 ? projects[0]._id : '',
        type: 'comments',
        parameters: {},
        schedule: {
          enabled: false,
          frequency: 'weekly',
          recipients: []
        }
      });
    }
  }, [report, projects]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'type') {
      // Reset parameters when changing report type
      setFormData({
        ...formData,
        [name]: value,
        parameters: {}
      });
    } else {
      setFormData({
        ...formData,
        [name!]: value
      });
    }
  };

  const handleScheduleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value, checked } = e.target as HTMLInputElement;
    
    setFormData({
      ...formData,
      schedule: {
        ...formData.schedule!,
        [name!]: checked !== undefined ? checked : value
      }
    });
    
    // If enabling schedule, set next run date
    if (name === 'enabled' && checked) {
      const nextRun = getNextRunDate(formData.schedule?.frequency || 'weekly');
      
      setFormData(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule!,
          nextRun
        }
      }));
    }
  };

  const handleParameterChange = (key: string, value: any) => {
    setFormData({
      ...formData,
      parameters: {
        ...formData.parameters,
        [key]: value
      }
    });
  };

  const handleAddRecipient = () => {
    if (!newRecipient.trim() || !validateEmail(newRecipient)) {
      return;
    }
    
    setFormData({
      ...formData,
      schedule: {
        ...formData.schedule!,
        recipients: [...(formData.schedule?.recipients || []), newRecipient.trim()]
      }
    });
    
    setNewRecipient('');
  };

  const handleRemoveRecipient = (email: string) => {
    setFormData({
      ...formData,
      schedule: {
        ...formData.schedule!,
        recipients: (formData.schedule?.recipients || []).filter(r => r !== email)
      }
    });
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const getNextRunDate = (frequency: string) => {
    const now = new Date();
    
    switch (frequency) {
      case 'daily':
        return add(now, { days: 1 });
      case 'weekly':
        return add(now, { weeks: 1 });
      case 'monthly':
        return add(now, { months: 1 });
      default:
        return add(now, { weeks: 1 });
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name || !formData.project || !formData.type) {
      setError('Please fill in all required fields.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      if (report) {
        await updateReport(report._id, formData);
      } else {
        await createReport(formData);
      }
      
      onClose(true);
    } catch (error) {
      console.error('Error saving report:', error);
      setError('Failed to save report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getReportParameters = () => {
    switch (formData.type) {
      case 'comments':
        return (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel id="sort-by-label">Sort By</InputLabel>
              <Select
                labelId="sort-by-label"
                value={formData.parameters?.sortBy || 'newest'}
                onChange={(e) => handleParameterChange('sortBy', e.target.value)}
                label="Sort By"
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="upvotes">Most Upvotes</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="limit-label">Number of Comments</InputLabel>
              <Select
                labelId="limit-label"
                value={formData.parameters?.limit || 100}
                onChange={(e) => handleParameterChange('limit', e.target.value)}
                label="Number of Comments"
              >
                <MenuItem value={25}>25 comments</MenuItem>
                <MenuItem value={50}>50 comments</MenuItem>
                <MenuItem value={100}>100 comments</MenuItem>
                <MenuItem value={200}>200 comments</MenuItem>
                <MenuItem value={500}>500 comments</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.parameters?.includeAISummary || false}
                  onChange={(e) => handleParameterChange('includeAISummary', e.target.checked)}
                />
              }
              label="Include AI Summary"
              sx={{ mt: 2 }}
            />
          </>
        );
      
      case 'sentiment':
        return (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel id="time-period-label">Time Period</InputLabel>
              <Select
                labelId="time-period-label"
                value={formData.parameters?.timePeriod || 'all'}
                onChange={(e) => handleParameterChange('timePeriod', e.target.value)}
                label="Time Period"
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="week">Last Week</MenuItem>
                <MenuItem value="month">Last Month</MenuItem>
                <MenuItem value="quarter">Last Quarter</MenuItem>
                <MenuItem value="year">Last Year</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.parameters?.groupByCategory || false}
                  onChange={(e) => handleParameterChange('groupByCategory', e.target.checked)}
                />
              }
              label="Group by Category"
              sx={{ mt: 2 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.parameters?.includeWordCloud || false}
                  onChange={(e) => handleParameterChange('includeWordCloud', e.target.checked)}
                />
              }
              label="Include Word Cloud"
              sx={{ mt: 2 }}
            />
          </>
        );
      
      case 'engagement':
        return (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel id="time-interval-label">Time Interval</InputLabel>
              <Select
                labelId="time-interval-label"
                value={formData.parameters?.timeInterval || 'day'}
                onChange={(e) => handleParameterChange('timeInterval', e.target.value)}
                label="Time Interval"
              >
                <MenuItem value="day">Daily</MenuItem>
                <MenuItem value="week">Weekly</MenuItem>
                <MenuItem value="month">Monthly</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="metric-label">Metric</InputLabel>
              <Select
                labelId="metric-label"
                value={formData.parameters?.metric || 'comments'}
                onChange={(e) => handleParameterChange('metric', e.target.value)}
                label="Metric"
              >
                <MenuItem value="comments">Comment Count</MenuItem>
                <MenuItem value="users">Unique Users</MenuItem>
                <MenuItem value="votes">Vote Count</MenuItem>
                <MenuItem value="views">Page Views</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.parameters?.compareWithPrevious || false}
                  onChange={(e) => handleParameterChange('compareWithPrevious', e.target.checked)}
                />
              }
              label="Compare with Previous Period"
              sx={{ mt: 2 }}
            />
          </>
        );
      
      case 'geographic':
        return (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel id="heatmap-metric-label">Heatmap Metric</InputLabel>
              <Select
                labelId="heatmap-metric-label"
                value={formData.parameters?.heatmapMetric || 'count'}
                onChange={(e) => handleParameterChange('heatmapMetric', e.target.value)}
                label="Heatmap Metric"
              >
                <MenuItem value="count">Comment Count</MenuItem>
                <MenuItem value="sentiment">Sentiment Score</MenuItem>
                <MenuItem value="votes">Net Votes</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.parameters?.clusterPoints || true}
                  onChange={(e) => handleParameterChange('clusterPoints', e.target.checked)}
                />
              }
              label="Cluster Comments"
              sx={{ mt: 2 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.parameters?.includeTopLocations || true}
                  onChange={(e) => handleParameterChange('includeTopLocations', e.target.checked)}
                />
              }
              label="Include Top Locations"
              sx={{ mt: 2 }}
            />
          </>
        );
      
      default:
        return (
          <Typography variant="body2" color="textSecondary">
            No additional parameters for this report type.
          </Typography>
        );
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose()} maxWidth="md" fullWidth>
      <DialogTitle>
        {report ? 'Edit Report' : 'Create New Report'}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              name="name"
              label="Report Name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="project-label">Project</InputLabel>
              <Select
                labelId="project-label"
                name="project"
                value={formData.project}
                onChange={handleChange}
                label="Project"
              >
                {projects.map(project => (
                  <MenuItem key={project._id} value={project._id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="report-type-label">Report Type</InputLabel>
              <Select
                labelId="report-type-label"
                name="type"
                value={formData.type}
                onChange={handleChange}
                label="Report Type"
              >
                <MenuItem value="comments">Comments Summary</MenuItem>
                <MenuItem value="sentiment">Sentiment Analysis</MenuItem>
                <MenuItem value="engagement">Engagement Timeline</MenuItem>
                <MenuItem value="geographic">Geographic Distribution</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Report Parameters
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {getReportParameters()}
          </Grid>
          
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ScheduleIcon sx={{ mr: 1 }} />
                  <Typography>Scheduling Options</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <FormControlLabel
                  control={
                    <Switch
                      name="enabled"
                      checked={formData.schedule?.enabled || false}
                      onChange={handleScheduleChange}
                    />
                  }
                  label="Enable Scheduled Report"
                />
                
                {formData.schedule?.enabled && (
                  <>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="frequency-label">Frequency</InputLabel>
                      <Select
                        labelId="frequency-label"
                        name="frequency"
                        value={formData.schedule?.frequency || 'weekly'}
                        onChange={handleScheduleChange}
                        label="Frequency"
                      >
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                      Recipients
                    </Typography>
                    
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <TextField
                        label="Email Address"
                        value={newRecipient}
                        onChange={(e) => setNewRecipient(e.target.value)}
                        fullWidth
                        placeholder="Enter email address"
                        error={newRecipient.trim() !== '' && !validateEmail(newRecipient)}
                        helperText={
                          newRecipient.trim() !== '' && !validateEmail(newRecipient)
                            ? 'Please enter a valid email address'
                            : ''
                        }
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ ml: 1 }}
                        onClick={handleAddRecipient}
                        disabled={!newRecipient.trim() || !validateEmail(newRecipient)}
                      >
                        Add
                      </Button>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                      {formData.schedule?.recipients && formData.schedule.recipients.length > 0 ? (
                        formData.schedule.recipients.map((email) => (
                          <Chip
                            key={email}
                            label={email}
                            onDelete={() => handleRemoveRecipient(email)}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          No recipients added yet
                        </Typography>
                      )}
                    </Box>
                  </>
                )}
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={() => onClose()} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {report ? 'Update Report' : 'Create Report'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportForm;

// client/src/components/admin/reports/charts/CommentsSummaryChart.tsx
import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Typography, Box, CircularProgress, Paper, Tabs, Tab } from '@mui/material';
import { Report } from '../../../../types/Report';
import { getReportData } from '../../../../services/reportService';

interface CommentsSummaryChartProps {
  report: Report;
}

const CommentsSummaryChart: React.FC<CommentsSummaryChartProps> = ({ report }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('categories');
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    fetchReportData();
  }, [report._id]);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const reportData = await getReportData(report._id);
      setData(reportData);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 2 }}>
        <Typography color="error">
          {error || 'No data available. Try refreshing the report.'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab value="categories" label="Categories" />
        <Tab value="status" label="Status" />
        {data.sentimentData && <Tab value="sentiment" label="Sentiment" />}
      </Tabs>
      
      <Box sx={{ flex: 1, minHeight: 0 }}>
        {activeTab === 'categories' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.categoryData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={70} 
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Comment Count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        )}
        
        {activeTab === 'status' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.statusData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.statusData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} comments`, 'Count']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
        
        {activeTab === 'sentiment' && data.sentimentData && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.sentimentData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                <Cell fill="#4caf50" /> {/* Positive: Green */}
                <Cell fill="#ff9800" /> {/* Neutral: Orange */}
                <Cell fill="#f44336" /> {/* Negative: Red */}
              </Pie>
              <Tooltip formatter={(value) => [`${value} comments`, 'Count']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Box>
  );
};

export default CommentsSummaryChart;

// client/src/components/admin/reports/charts/SentimentAnalysisChart.tsx
import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { Typography, Box, CircularProgress, Tabs, Tab, Paper } from '@mui/material';
import { Report } from '../../../../types/Report';
import { getReportData } from '../../../../services/reportService';

interface SentimentAnalysisChartProps {
  report: Report;
}

const SentimentAnalysisChart: React.FC<SentimentAnalysisChartProps> = ({ report }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const COLORS = ['#4caf50', '#ff9800', '#f44336'];
  const SENTIMENT_COLORS = {
    positive: '#4caf50',
    neutral: '#ff9800',
    negative: '#f44336'
  };

  useEffect(() => {
    fetchReportData();
  }, [report._id]);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const reportData = await getReportData(report._id);
      setData(reportData);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 2 }}>
        <Typography color="error">
          {error || 'No data available. Try refreshing the report.'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab value="overview" label="Overview" />
        <Tab value="timeline" label="Timeline" />
        <Tab value="categories" label="Categories" />
      </Tabs>
      
      <Box sx={{ flex: 1, minHeight: 0 }}>
        {activeTab === 'overview' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.sentimentDistribution}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.sentimentDistribution.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} comments`, 'Count']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
        
        {activeTab === 'timeline' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.sentimentTimeline}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                angle={-45} 
                textAnchor="end" 
                height={70}
                tick={{ fontSize: 12 }}
              />
              <YAxis domain={[-1, 1]} />
              <Tooltip formatter={(value) => [value.toFixed(2), 'Sentiment Score']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="score" 
                name="Sentiment Score" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        
        {activeTab === 'categories' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.sentimentByCategory}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis 
                dataKey="category" 
                type="category" 
                tick={{ fontSize: 12 }}
                width={100}
              />
              <Tooltip 
                formatter={(value, name) => [
                  `${value.toFixed(1)}%`, 
                  name.charAt(0).toUpperCase() + name.slice(1)
                ]} 
              />
              <Legend />
              <Bar dataKey="positive" name="Positive" stackId="a" fill={SENTIMENT_COLORS.positive} />
              <Bar dataKey="neutral" name="Neutral" stackId="a" fill={SENTIMENT_COLORS.neutral} />
              <Bar dataKey="negative" name="Negative" stackId="a" fill={SENTIMENT_COLORS.negative} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Box>
  );
};

export default SentimentAnalysisChart;
