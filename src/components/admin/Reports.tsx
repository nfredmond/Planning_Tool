import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as ExcelIcon,
  BarChart as ChartIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  Description as ReportIcon,
  Timeline as TimelineIcon,
  Public as MapIcon,
  TrendingUp as TrendingUpIcon,
  FormatListBulleted as ListIcon
} from '@mui/icons-material';

// Define Report interface
interface Report {
  id: string;
  name: string;
  description?: string;
  project: {
    id: string;
    name: string;
  };
  type: 'comments' | 'engagement' | 'sentiment' | 'geographic' | 'custom';
  lastRun?: string;
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
  };
  createdAt: string;
}

// Mock data for reports
const mockReports: Report[] = [
  {
    id: '1',
    name: 'Downtown Engagement Summary',
    description: 'Summary of all engagement activities for the Downtown Revitalization project',
    project: {
      id: '1',
      name: 'Downtown Revitalization'
    },
    type: 'engagement',
    lastRun: '2023-05-10T14:30:00Z',
    schedule: {
      enabled: true,
      frequency: 'weekly',
      recipients: ['admin@example.com', 'planner@example.com']
    },
    createdAt: '2023-04-15T09:00:00Z'
  },
  {
    id: '2',
    name: 'Comment Analysis',
    description: 'Analysis of all comments received for the Park Redesign project',
    project: {
      id: '2',
      name: 'Neighborhood Park Redesign'
    },
    type: 'comments',
    lastRun: '2023-05-12T10:15:00Z',
    createdAt: '2023-04-20T11:30:00Z'
  },
  {
    id: '3',
    name: 'Sentiment Analysis',
    description: 'Analysis of public sentiment regarding the Downtown Revitalization project',
    project: {
      id: '1',
      name: 'Downtown Revitalization'
    },
    type: 'sentiment',
    createdAt: '2023-05-01T15:45:00Z'
  },
  {
    id: '4',
    name: 'Geographic Distribution of Feedback',
    description: 'Map-based analysis of feedback locations for the Downtown Revitalization project',
    project: {
      id: '1',
      name: 'Downtown Revitalization'
    },
    type: 'geographic',
    lastRun: '2023-05-15T09:30:00Z',
    createdAt: '2023-04-10T13:15:00Z'
  },
  {
    id: '5',
    name: 'Playground Equipment Preferences',
    description: 'Custom report analyzing preferences for different playground equipment options',
    project: {
      id: '2',
      name: 'Neighborhood Park Redesign'
    },
    type: 'custom',
    schedule: {
      enabled: true,
      frequency: 'monthly',
      recipients: ['parks@example.com', 'recreation@example.com']
    },
    createdAt: '2023-05-05T10:00:00Z'
  }
];

// Mock data for projects
const mockProjects = [
  { id: '1', name: 'Downtown Revitalization' },
  { id: '2', name: 'Neighborhood Park Redesign' },
  { id: '3', name: 'Main Street Development' }
];

// Interface for Tab Panel props
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab Panel component
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Reports: React.FC = () => {
  const theme = useTheme();
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [projects] = useState(mockProjects);
  const [tabValue, setTabValue] = useState(0);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  
  // Export dialog state
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'xlsx'>('pdf');
  
  // Schedule dialog state
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  
  // Form values
  const [formValues, setFormValues] = useState<{
    name: string;
    description: string;
    projectId: string;
    type: Report['type'];
    scheduleEnabled: boolean;
    scheduleFrequency: 'daily' | 'weekly' | 'monthly';
    scheduleRecipients: string;
  }>({
    name: '',
    description: '',
    projectId: '',
    type: 'comments',
    scheduleEnabled: false,
    scheduleFrequency: 'weekly',
    scheduleRecipients: ''
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddReport = () => {
    setDialogMode('add');
    setFormValues({
      name: '',
      description: '',
      projectId: projects.length > 0 ? projects[0].id : '',
      type: 'comments',
      scheduleEnabled: false,
      scheduleFrequency: 'weekly',
      scheduleRecipients: ''
    });
    setOpenDialog(true);
  };

  const handleEditReport = (report: Report) => {
    setDialogMode('edit');
    setSelectedReport(report);
    setFormValues({
      name: report.name,
      description: report.description || '',
      projectId: report.project.id,
      type: report.type,
      scheduleEnabled: report.schedule?.enabled || false,
      scheduleFrequency: report.schedule?.frequency || 'weekly',
      scheduleRecipients: report.schedule?.recipients.join(', ') || ''
    });
    setOpenDialog(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const name = e.target.name as string;
    const value = e.target.value as string;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSubmit = () => {
    if (!formValues.name || !formValues.projectId) {
      alert('Name and Project are required fields');
      return;
    }

    // Process schedule data
    const schedule = formValues.scheduleEnabled ? {
      enabled: formValues.scheduleEnabled,
      frequency: formValues.scheduleFrequency,
      recipients: formValues.scheduleRecipients.split(',').map(email => email.trim()).filter(email => email)
    } : undefined;

    if (dialogMode === 'add') {
      const newReport: Report = {
        id: Date.now().toString(),
        name: formValues.name,
        description: formValues.description,
        project: {
          id: formValues.projectId,
          name: projects.find(p => p.id === formValues.projectId)?.name || ''
        },
        type: formValues.type,
        schedule,
        createdAt: new Date().toISOString()
      };
      setReports([...reports, newReport]);
    } else if (selectedReport) {
      setReports(reports.map(report => 
        report.id === selectedReport.id 
          ? {
              ...report,
              name: formValues.name,
              description: formValues.description,
              project: {
                id: formValues.projectId,
                name: projects.find(p => p.id === formValues.projectId)?.name || ''
              },
              type: formValues.type,
              schedule
            } 
          : report
      ));
    }
    setOpenDialog(false);
  };

  const handleDeleteReport = (reportId: string) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      setReports(reports.filter(report => report.id !== reportId));
    }
  };

  const handleOpenExportDialog = (report: Report) => {
    setSelectedReport(report);
    setExportDialogOpen(true);
  };

  const handleExportReport = () => {
    // In a real app, this would trigger an API call to generate the report
    console.log(`Exporting report ${selectedReport?.name} as ${exportFormat}`);
    setExportDialogOpen(false);
  };

  const handleOpenScheduleDialog = (report: Report) => {
    setSelectedReport(report);
    setFormValues({
      ...formValues,
      scheduleEnabled: report.schedule?.enabled || false,
      scheduleFrequency: report.schedule?.frequency || 'weekly',
      scheduleRecipients: report.schedule?.recipients.join(', ') || ''
    });
    setScheduleDialogOpen(true);
  };

  const handleScheduleReport = () => {
    if (selectedReport) {
      const updatedSchedule = {
        enabled: formValues.scheduleEnabled,
        frequency: formValues.scheduleFrequency,
        recipients: formValues.scheduleRecipients.split(',').map(email => email.trim()).filter(email => email)
      };

      setReports(reports.map(report => 
        report.id === selectedReport.id 
          ? { ...report, schedule: updatedSchedule } 
          : report
      ));
    }
    setScheduleDialogOpen(false);
  };

  const handleGenerateNow = (reportId: string) => {
    // In a real app, this would trigger an API call to generate the report
    console.log(`Generating report ${reportId} now`);
    // Update lastRun timestamp
    setReports(reports.map(report => 
      report.id === reportId 
        ? { ...report, lastRun: new Date().toISOString() } 
        : report
    ));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'comments': return <ReportIcon sx={{ color: theme.palette.primary.main }} />;
      case 'engagement': return <ChartIcon sx={{ color: theme.palette.secondary.main }} />;
      case 'sentiment': return <TrendingUpIcon sx={{ color: theme.palette.success.main }} />;
      case 'geographic': return <MapIcon sx={{ color: theme.palette.info.main }} />;
      default: return <ListIcon sx={{ color: theme.palette.grey[500] }} />;
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'comments': return theme.palette.primary.main;
      case 'engagement': return theme.palette.secondary.main;
      case 'sentiment': return theme.palette.success.main;
      case 'geographic': return theme.palette.info.main;
      default: return theme.palette.grey[500];
    }
  };

  // Filter reports based on tab selection
  const getFilteredReports = () => {
    switch (tabValue) {
      case 0: // All Reports
        return reports;
      case 1: // Scheduled Reports
        return reports.filter(report => report.schedule?.enabled);
      case 2: // Recent Reports
        return [...reports]
          .filter(report => report.lastRun)
          .sort((a, b) => {
            if (!a.lastRun || !b.lastRun) return 0;
            return new Date(b.lastRun).getTime() - new Date(a.lastRun).getTime();
          })
          .slice(0, 5);
      default:
        return reports;
    }
  };

  const filteredReports = getFilteredReports();

  return (
    <Box sx={{ p: 3 }}>
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

      {/* Tabs for report categories */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          textColor="primary"
          indicatorColor="primary"
          aria-label="report tabs"
        >
          <Tab label="All Reports" id="report-tab-0" aria-controls="report-tabpanel-0" />
          <Tab label="Scheduled Reports" id="report-tab-1" aria-controls="report-tabpanel-1" />
          <Tab label="Recent Reports" id="report-tab-2" aria-controls="report-tabpanel-2" />
        </Tabs>
      </Paper>

      {/* Report Lists - One tab panel for each tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {filteredReports.length > 0 ? (
            filteredReports.map(report => (
              <Grid item xs={12} md={6} key={report.id}>
                <Card>
                  <CardHeader
                    avatar={
                      <Box
                        sx={{
                          bgcolor: getReportTypeColor(report.type),
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
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {report.description || 'No description provided.'}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Type:
                        </Typography>
                        <Typography variant="body2">
                          {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Last Generated:
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(report.lastRun)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Created:
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(report.createdAt)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Schedule:
                        </Typography>
                        <Typography variant="body2">
                          {report.schedule?.enabled 
                            ? `${report.schedule.frequency.charAt(0).toUpperCase() + report.schedule.frequency.slice(1)}` 
                            : 'Not scheduled'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <Divider />
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<DownloadIcon />}
                      onClick={() => handleOpenExportDialog(report)}
                    >
                      Export
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<RefreshIcon />}
                      onClick={() => handleGenerateNow(report.id)}
                    >
                      Generate Now
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<ScheduleIcon />}
                      onClick={() => handleOpenScheduleDialog(report)}
                    >
                      Schedule
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<EditIcon />}
                      onClick={() => handleEditReport(report)}
                    >
                      Edit
                    </Button>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteReport(report.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No reports found. Click "Create New Report" to get started.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {filteredReports.length > 0 ? (
            filteredReports.map(report => (
              <Grid item xs={12} md={6} key={report.id}>
                <Card>
                  <CardHeader
                    avatar={<ScheduleIcon sx={{ color: theme.palette.primary.main }} />}
                    title={report.name}
                    subheader={report.schedule ? 
                      `Scheduled: ${report.schedule.frequency.charAt(0).toUpperCase() + report.schedule.frequency.slice(1)}` : 
                      'Not scheduled'}
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {report.description || 'No description provided.'}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Recipients:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {report.schedule?.recipients.map((email, index) => (
                          <Chip 
                            key={index} 
                            label={email} 
                            size="small" 
                            variant="outlined" 
                          />
                        ))}
                      </Box>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<ScheduleIcon />}
                      onClick={() => handleOpenScheduleDialog(report)}
                    >
                      Edit Schedule
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<RefreshIcon />}
                      onClick={() => handleGenerateNow(report.id)}
                    >
                      Generate Now
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No scheduled reports found. Set up a schedule for any report to see it here.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          {filteredReports.length > 0 ? (
            filteredReports.map(report => (
              <Grid item xs={12} key={report.id}>
                <Card>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={8}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getReportTypeIcon(report.type)}
                          <Typography variant="h6" sx={{ ml: 1 }}>
                            {report.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Project: {report.project.name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4} sx={{ textAlign: { sm: 'right' } }}>
                        <Typography variant="body2" color="text.secondary">
                          Generated:
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(report.lastRun)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<DownloadIcon />}
                      onClick={() => handleOpenExportDialog(report)}
                    >
                      Download
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<RefreshIcon />}
                      onClick={() => handleGenerateNow(report.id)}
                    >
                      Regenerate
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No recently generated reports found. Generate a report to see it here.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* Add/Edit Report Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Create New Report' : 'Edit Report'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Report Name"
                name="name"
                value={formValues.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Project</InputLabel>
                <Select
                  name="projectId"
                  value={formValues.projectId}
                  label="Project"
                  onChange={handleSelectChange}
                  required
                >
                  {projects.map(project => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formValues.description}
                onChange={handleInputChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  name="type"
                  value={formValues.type}
                  label="Report Type"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="comments">Comments Analysis</MenuItem>
                  <MenuItem value="engagement">Engagement Summary</MenuItem>
                  <MenuItem value="sentiment">Sentiment Analysis</MenuItem>
                  <MenuItem value="geographic">Geographic Analysis</MenuItem>
                  <MenuItem value="custom">Custom Report</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Schedule Settings (Optional)
              </Typography>
              <FormControl component="fieldset">
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Chip 
                      label={formValues.scheduleEnabled ? "Scheduled" : "Not Scheduled"} 
                      color={formValues.scheduleEnabled ? "primary" : "default"}
                      onClick={() => setFormValues({
                        ...formValues,
                        scheduleEnabled: !formValues.scheduleEnabled
                      })}
                    />
                  </Grid>
                  
                  {formValues.scheduleEnabled && (
                    <>
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Frequency</InputLabel>
                          <Select
                            name="scheduleFrequency"
                            value={formValues.scheduleFrequency}
                            label="Frequency"
                            onChange={handleSelectChange}
                          >
                            <MenuItem value="daily">Daily</MenuItem>
                            <MenuItem value="weekly">Weekly</MenuItem>
                            <MenuItem value="monthly">Monthly</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Recipients (comma-separated emails)"
                          name="scheduleRecipients"
                          value={formValues.scheduleRecipients}
                          onChange={handleInputChange}
                          placeholder="email1@example.com, email2@example.com"
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {dialogMode === 'add' ? 'Create Report' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Export Report</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Select a format to export "{selectedReport?.name}"
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant={exportFormat === 'pdf' ? 'contained' : 'outlined'}
              startIcon={<PdfIcon />}
              onClick={() => setExportFormat('pdf')}
              sx={{ mr: 2 }}
            >
              PDF
            </Button>
            <Button
              variant={exportFormat === 'xlsx' ? 'contained' : 'outlined'}
              startIcon={<ExcelIcon />}
              onClick={() => setExportFormat('xlsx')}
            >
              Excel
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleExportReport} 
            variant="contained" 
            color="primary"
            startIcon={<DownloadIcon />}
          >
            Export
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Report</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {selectedReport?.name}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Chip 
                  label={formValues.scheduleEnabled ? "Scheduled" : "Not Scheduled"} 
                  color={formValues.scheduleEnabled ? "primary" : "default"}
                  onClick={() => setFormValues({
                    ...formValues,
                    scheduleEnabled: !formValues.scheduleEnabled
                  })}
                  sx={{ mb: 2 }}
                />
              </Grid>

              {formValues.scheduleEnabled && (
                <>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Frequency</InputLabel>
                      <Select
                        name="scheduleFrequency"
                        value={formValues.scheduleFrequency}
                        label="Frequency"
                        onChange={handleSelectChange}
                      >
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Recipients (comma-separated emails)"
                      name="scheduleRecipients"
                      value={formValues.scheduleRecipients}
                      onChange={handleInputChange}
                      placeholder="email1@example.com, email2@example.com"
                      multiline
                      rows={2}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={formValues.scheduleEnabled ? <ScheduleIcon /> : <RefreshIcon />}
          >
            {formValues.scheduleEnabled ? 'Update Schedule' : 'Remove Schedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports; 