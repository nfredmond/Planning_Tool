import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as ExcelIcon,
  Map as MapIcon,
  BarChart as ChartIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  Save as SaveIcon,
  Send as EmailIcon,
  Settings as SettingsIcon,
  Description as ReportIcon,
  FormatListBulleted as ListIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Define Report type
interface Report {
  _id: string;
  name: string;
  description?: string;
  project: {
    _id: string;
    name: string;
  };
  type: 'comments' | 'engagement' | 'sentiment' | 'geographic' | 'custom';
  parameters: ReportParameters;
  createdBy: string;
  lastRun?: Date;
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    nextRun?: Date;
    recipients: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Define ReportParameters type to fix linter errors
interface ReportParameters {
  includeRejected?: boolean;
  includeAIScores?: boolean;
  generateSummary?: boolean;
  includeWordCloud?: boolean;
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
  };
  [key: string]: any;
}

const Reports: React.FC = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const mapRef = useRef<any>(null);
  const featureGroupRef = useRef<any>(null);

  // State for reports list
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for projects
  const [projects, setProjects] = useState<{ _id: string, name: string }[]>([]);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  
  // Export dialog state
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'xlsx' | 'kmz'>('pdf');
  const [exportLoading, setExportLoading] = useState(false);
  const [polygonMode, setPolygonMode] = useState(false);
  
  // Form values
  const [formValues, setFormValues] = useState<{
    name: string;
    description: string;
    projectId: string;
    type: Report['type'];
    parameters: ReportParameters;
  }>({
    name: '',
    description: '',
    projectId: '',
    type: 'comments',
    parameters: {}
  });

  // Load reports and projects on component mount
  useEffect(() => {
    fetchReports();
    fetchProjects();
  }, []);

  // Fetch reports from API
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/reports');
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      enqueueSnackbar('Failed to load reports', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects for dropdown
  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/admin/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // Handle opening dialog for adding new report
  const handleAddReport = () => {
    setDialogMode('add');
    setFormValues({
      name: '',
      description: '',
      projectId: projects.length > 0 ? projects[0]._id : '',
      type: 'comments',
      parameters: {}
    });
    setOpenDialog(true);
  };

  // Handle opening dialog for editing existing report
  const handleEditReport = (report: Report) => {
    setDialogMode('edit');
    setSelectedReport(report);
    setFormValues({
      name: report.name,
      description: report.description || '',
      projectId: report.project._id,
      type: report.type,
      parameters: { ...report.parameters }
    });
    setOpenDialog(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  // Handle select input changes
  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    const value = e.target.value as string;
    setFormValues({ ...formValues, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (dialogMode === 'add') {
        await axios.post('/api/admin/reports', formValues);
        enqueueSnackbar('Report created successfully', { variant: 'success' });
      } else if (selectedReport) {
        await axios.put(`/api/admin/reports/${selectedReport._id}`, formValues);
        enqueueSnackbar('Report updated successfully', { variant: 'success' });
      }
      setOpenDialog(false);
      fetchReports();
    } catch (error) {
      console.error('Error saving report:', error);
      enqueueSnackbar('Failed to save report', { variant: 'error' });
    }
  };

  // Handle report deletion
  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/admin/reports/${reportId}`);
      enqueueSnackbar('Report deleted successfully', { variant: 'success' });
      fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      enqueueSnackbar('Failed to delete report', { variant: 'error' });
    }
  };

  // Handle opening export dialog
  const handleOpenExportDialog = (report: Report) => {
    setSelectedReport(report);
    setExportDialogOpen(true);
    setPolygonMode(false);
  };

  // Handle exporting report
  const handleExportReport = async () => {
    if (!selectedReport) return;
    
    try {
      setExportLoading(true);
      
      if (polygonMode && featureGroupRef.current) {
        // Get drawn polygon
        const drawnItems = featureGroupRef.current.leafletElement.toGeoJSON();
        
        if (!drawnItems.features || drawnItems.features.length === 0) {
          enqueueSnackbar('Please draw a polygon on the map first', { variant: 'warning' });
          return;
        }
        
        // Extract coordinates from first feature
        const feature = drawnItems.features[0];
        const polygon = feature.geometry.coordinates[0].map((point: number[]) => [point[1], point[0]]);
        
        // Generate file name
        const fileName = `polygon-report-${Date.now()}.${exportFormat}`;
        
        // Request report with polygon filter
        const response = await axios.post(
          `/api/admin/reports/export-polygon/${exportFormat}`,
          {
            polygon,
            projectId: selectedReport.project._id,
            reportType: selectedReport.type
          },
          { responseType: 'blob' }
        );
        
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        // Standard report export
        const response = await axios.post(
          `/api/admin/reports/${selectedReport._id}/export/${exportFormat}`,
          {},
          { responseType: 'blob' }
        );
        
        // Generate file name
        const fileName = `report-${selectedReport._id}.${exportFormat}`;
        
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        link.remove();
        window.URL.revokeObjectURL(url);
      }
      
      enqueueSnackbar(`Report exported as ${exportFormat.toUpperCase()} successfully`, { variant: 'success' });
      setExportDialogOpen(false);
    } catch (error) {
      console.error('Error exporting report:', error);
      enqueueSnackbar('Failed to export report', { variant: 'error' });
    } finally {
      setExportLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get color for report type
  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'comments': return theme.palette.primary.main;
      case 'engagement': return theme.palette.success.main;
      case 'sentiment': return theme.palette.warning.main;
      case 'geographic': return theme.palette.info.main;
      default: return theme.palette.secondary.main;
    }
  };

  // Get icon for report type
  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'comments': return <ListIcon />;
      case 'engagement': return <ChartIcon />;
      case 'sentiment': return <ChartIcon />;
      case 'geographic': return <MapIcon />;
      default: return <ReportIcon />;
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Reports
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddReport}
        >
          Create New Report
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {reports.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography>No reports found. Create your first report to get started.</Typography>
              </Paper>
            </Grid>
          ) : (
            reports.map(report => (
              <Grid item xs={12} sm={6} md={4} key={report._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardHeader
                    avatar={
                      <Box
                        sx={{
                          backgroundColor: getReportTypeColor(report.type),
                          color: 'white',
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {getReportTypeIcon(report.type)}
                      </Box>
                    }
                    title={report.name}
                    subheader={`Project: ${report.project.name}`}
                    titleTypographyProps={{ noWrap: true, variant: 'h6' }}
                    subheaderTypographyProps={{ noWrap: true }}
                    sx={{ 
                      '& .MuiCardHeader-content': { 
                        overflow: 'hidden' 
                      } 
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {report.description || 'No description provided'}
                    </Typography>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Type:
                      </Typography>
                      <Chip 
                        label={report.type.charAt(0).toUpperCase() + report.type.slice(1)} 
                        size="small"
                        sx={{ 
                          backgroundColor: getReportTypeColor(report.type),
                          color: 'white'
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Last Run:
                      </Typography>
                      <Typography variant="caption">
                        {formatDate(report.lastRun)}
                      </Typography>
                    </Box>
                    
                    {report.schedule && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">
                          Scheduled:
                        </Typography>
                        <Typography variant="caption">
                          {report.schedule.enabled ? (
                            `${report.schedule.frequency}, ${report.schedule.recipients.length} recipients`
                          ) : 'No'}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                  <CardActions>
                    <Tooltip title="Export">
                      <IconButton onClick={() => handleOpenExportDialog(report)}>
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEditReport(report)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDeleteReport(report._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <Box sx={{ flexGrow: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      Created: {new Date(report.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Add/Edit Report Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {dialogMode === 'add' ? 'Create New Report' : 'Edit Report'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={8}>
              <TextField
                name="name"
                label="Report Name"
                value={formValues.name}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formValues.type}
                  onChange={handleSelectChange}
                  label="Type"
                >
                  <MenuItem value="comments">Comments</MenuItem>
                  <MenuItem value="engagement">Engagement</MenuItem>
                  <MenuItem value="sentiment">Sentiment Analysis</MenuItem>
                  <MenuItem value="geographic">Geographic</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formValues.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Project</InputLabel>
                <Select
                  name="projectId"
                  value={formValues.projectId}
                  onChange={handleSelectChange}
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
            
            {/* Type-specific settings */}
            {formValues.type === 'comments' && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Comment Report Settings
                  </Typography>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!formValues.parameters.includeRejected}
                        onChange={(e) => {
                          setFormValues({
                            ...formValues,
                            parameters: {
                              ...formValues.parameters,
                              includeRejected: e.target.checked
                            }
                          });
                        }}
                      />
                    }
                    label="Include rejected comments"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!formValues.parameters.includeAIScores}
                        onChange={(e) => {
                          setFormValues({
                            ...formValues,
                            parameters: {
                              ...formValues.parameters,
                              includeAIScores: e.target.checked
                            }
                          });
                        }}
                      />
                    }
                    label="Include AI moderation scores"
                  />
                </Paper>
              </Grid>
            )}
            
            {formValues.type === 'sentiment' && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Sentiment Report Settings
                  </Typography>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!formValues.parameters.generateSummary}
                        onChange={(e) => {
                          setFormValues({
                            ...formValues,
                            parameters: {
                              ...formValues.parameters,
                              generateSummary: e.target.checked
                            }
                          });
                        }}
                      />
                    }
                    label="Generate AI summary"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!formValues.parameters.includeWordCloud}
                        onChange={(e) => {
                          setFormValues({
                            ...formValues,
                            parameters: {
                              ...formValues.parameters,
                              includeWordCloud: e.target.checked
                            }
                          });
                        }}
                      />
                    }
                    label="Include word cloud"
                  />
                </Paper>
              </Grid>
            )}
            
            {/* Schedule settings */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ScheduleIcon sx={{ mr: 1 }} color="primary" />
                  <Typography variant="subtitle1">
                    Report Schedule
                  </Typography>
                </Box>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!formValues.parameters.schedule?.enabled}
                      onChange={(e) => {
                        setFormValues({
                          ...formValues,
                          parameters: {
                            ...formValues.parameters,
                            schedule: {
                              ...formValues.parameters.schedule,
                              enabled: e.target.checked,
                              frequency: formValues.parameters.schedule?.frequency || 'weekly',
                              recipients: formValues.parameters.schedule?.recipients || []
                            }
                          }
                        });
                      }}
                    />
                  }
                  label="Enable scheduled exports"
                />
                
                {formValues.parameters.schedule?.enabled && (
                  <Box sx={{ ml: 3, mt: 2 }}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Frequency</InputLabel>
                      <Select
                        value={formValues.parameters.schedule?.frequency || 'weekly'}
                        label="Frequency"
                        onChange={(e) => {
                          setFormValues({
                            ...formValues,
                            parameters: {
                              ...formValues.parameters,
                              schedule: {
                                ...formValues.parameters.schedule,
                                frequency: e.target.value as 'daily' | 'weekly' | 'monthly'
                              }
                            }
                          });
                        }}
                      >
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <TextField
                      label="Recipient Emails"
                      value={(formValues.parameters.schedule?.recipients || []).join(', ')}
                      onChange={(e) => {
                        const emails = e.target.value.split(',').map(email => email.trim()).filter(Boolean);
                        setFormValues({
                          ...formValues,
                          parameters: {
                            ...formValues.parameters,
                            schedule: {
                              ...formValues.parameters.schedule,
                              recipients: emails
                            }
                          }
                        });
                      }}
                      helperText="Comma-separated list of email addresses"
                      fullWidth
                    />
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!formValues.name || !formValues.projectId || !formValues.type}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      {selectedReport && (
        <Dialog
          open={exportDialogOpen}
          onClose={() => setExportDialogOpen(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            Export: {selectedReport.name}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Export Format</InputLabel>
                  <Select
                    value={exportFormat}
                    label="Export Format"
                    onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'xlsx' | 'kmz')}
                  >
                    <MenuItem value="pdf">PDF Document</MenuItem>
                    <MenuItem value="xlsx">Excel Spreadsheet</MenuItem>
                    <MenuItem value="kmz">KMZ File (for Google Earth)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={polygonMode}
                      onChange={(e) => setPolygonMode(e.target.checked)}
                    />
                  }
                  label="Filter by custom polygon"
                />
              </Grid>
              
              {polygonMode && (
                <Grid item xs={12}>
                  <Box sx={{ height: 400, width: '100%', mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Draw a polygon on the map to filter data
                    </Typography>
                    <Paper variant="outlined" sx={{ height: '100%', overflow: 'hidden' }}>
                      <MapContainer
                        center={[37.7749, -122.4194]} // Default center (San Francisco)
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        ref={mapRef}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <FeatureGroup ref={featureGroupRef}>
                          <EditControl
                            position="topright"
                            draw={{
                              rectangle: false,
                              circle: false,
                              circlemarker: false,
                              marker: false,
                              polyline: false,
                              polygon: true
                            }}
                            edit={{
                              edit: true,
                              remove: true
                            }}
                          />
                        </FeatureGroup>
                      </MapContainer>
                    </Paper>
                  </Box>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                    {polygonMode 
                      ? 'The report will include only data within the drawn polygon.'
                      : `This will export the entire report for project "${selectedReport.project.name}".`
                    }
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setExportDialogOpen(false)}
              disabled={exportLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleExportReport}
              variant="contained" 
              color="primary"
              disabled={exportLoading || (polygonMode && (!featureGroupRef.current || featureGroupRef.current.leafletElement?.getLayers().length === 0))}
              startIcon={exportLoading ? <CircularProgress size={20} color="inherit" /> : getFormatIcon(exportFormat)}
            >
              Export
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

// Helper function to get icon for export format
const getFormatIcon = (format: string) => {
  switch (format) {
    case 'pdf': return <PdfIcon />;
    case 'xlsx': return <ExcelIcon />;
    case 'kmz': return <MapIcon />;
    default: return <DownloadIcon />;
  }
};

export default Reports; 