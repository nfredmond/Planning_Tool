import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  Divider,
  Card,
  CardContent,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Slider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import GroupsIcon from '@mui/icons-material/Groups';
import SecurityIcon from '@mui/icons-material/Security';
import SchoolIcon from '@mui/icons-material/School';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PublicIcon from '@mui/icons-material/Public';
import BuildIcon from '@mui/icons-material/Build';
import ConstructionIcon from '@mui/icons-material/Construction';
import configurationAPI from '../../api/configurationAPI';

// Interface for tab panel props
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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
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

// Admin Settings component
const AdminSettings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{message: string, type: 'success' | 'error' | 'info' | 'warning' | ''}>({
    message: '',
    type: ''
  });

  // Accessibility settings state
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    universalDesignEnabled: true,
    lowBandwidthModeEnabled: false,
    multiLanguageSupport: {
      enabled: true,
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'es', 'fr']
    },
    screenReaderOptimization: 'standard',
    highContrastMode: false,
    textSizeAdjustment: 'medium',
    culturalSensitivityEnabled: true
  });

  // Collaborative design settings state
  const [collaborativeSettings, setCollaborativeSettings] = useState({
    realTimeCollaborationEnabled: true,
    versionHistoryLimit: 10,
    autoSaveInterval: 5, // in minutes
    designTemplatesEnabled: true,
    commentingEnabled: true,
    measurementToolsEnabled: true,
    exportFormats: ['geojson', 'shapefile', 'pdf']
  });

  // Cross-departmental collaboration settings
  const [crossDeptSettings, setCrossDeptSettings] = useState({
    departmentIntegration: true,
    approvalWorkflow: true,
    documentSharing: true,
    integratedCalendar: true,
    notificationSystem: {
      email: true,
      inApp: true,
      sms: false
    },
    departmentList: [
      { id: 1, name: 'Transportation', active: true },
      { id: 2, name: 'Urban Planning', active: true },
      { id: 3, name: 'Public Works', active: true },
      { id: 4, name: 'Environmental', active: true }
    ]
  });

  // Data privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    dataRetentionPeriod: 365, // days
    anonymizationEnabled: true,
    encryptionLevel: 'high',
    userConsentRequired: true,
    dataExportEnabled: true,
    accessLoggingEnabled: true,
    privacyPolicyVersion: '1.2.0'
  });

  // Educational components settings
  const [educationalSettings, setEducationalSettings] = useState({
    tutorialsEnabled: true,
    contextualHelpEnabled: true,
    glossaryEnabled: true,
    publicationLibraryEnabled: true,
    communityWorkshopsEnabled: true,
    aiAssistantEnabled: true,
    educationalContentCategories: [
      { id: 1, name: 'Transportation Basics', active: true },
      { id: 2, name: 'Urban Planning Concepts', active: true },
      { id: 3, name: 'Community Engagement', active: true }
    ]
  });

  // Emergency resilience settings
  const [emergencySettings, setEmergencySettings] = useState({
    disasterResponsePlanningEnabled: true,
    evacuationRoutingEnabled: true,
    emergencyServicesIntegration: true,
    alertSystemEnabled: true,
    infrastructureVulnerabilityAssessment: true,
    offlineAccessEnabled: true,
    emergencyContactsList: [
      { id: 1, department: 'Police', contact: '911', primary: true },
      { id: 2, department: 'Fire', contact: '911', primary: true },
      { id: 3, department: 'Public Works', contact: '555-1234', primary: false }
    ]
  });

  // Global knowledge exchange settings
  const [globalSettings, setGlobalSettings] = useState({
    internationalCaseStudiesEnabled: true,
    bestPracticesLibraryEnabled: true,
    peerCityNetworkEnabled: true,
    translationServicesEnabled: true,
    internationalStandardsCompliance: true,
    globalForumEnabled: true,
    featuredRegions: [
      { id: 1, name: 'Europe', active: true },
      { id: 2, name: 'North America', active: true },
      { id: 3, name: 'Asia Pacific', active: true },
      { id: 4, name: 'Africa', active: false }
    ]
  });

  // Implementation tools settings
  const [implementationSettings, setImplementationSettings] = useState({
    projectTrackerEnabled: true,
    costEstimationEnabled: true,
    timelineVisualizationEnabled: true,
    resourceAllocationEnabled: true,
    constructionPhasingEnabled: true,
    maintenancePlanningEnabled: true,
    budgetManagementEnabled: true
  });

  // Long-term maintenance settings
  const [maintenanceSettings, setMaintenanceSettings] = useState({
    assetLifecycleManagementEnabled: true,
    scheduledMaintenanceEnabled: true,
    conditionAssessmentEnabled: true,
    predictiveAnalyticsEnabled: true,
    costProjectionEnabled: true,
    sustainabilityMetricsEnabled: true,
    maintenanceIntervals: {
      critical: 30, // days
      important: 90, // days
      routine: 180 // days
    }
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Effect to load initial settings from API
  useEffect(() => {
    const loadAllSettings = async () => {
      setIsLoading(true);
      try {
        // Load accessibility settings
        const accessibilityResponse = await configurationAPI.accessibility.getSettings();
        if (accessibilityResponse.success && accessibilityResponse.data) {
          setAccessibilitySettings(accessibilityResponse.data);
        }
        
        // Load collaborative design settings
        const collaborativeResponse = await configurationAPI.collaborativeDesign.getSettings();
        if (collaborativeResponse.success && collaborativeResponse.data) {
          setCollaborativeSettings(collaborativeResponse.data);
        }
        
        // Load other settings similarly...
        // This would include all the other modules
        
        setSaveStatus({
          message: 'All settings loaded successfully',
          type: 'success'
        });
      } catch (error) {
        console.error('Error loading settings:', error);
        setSaveStatus({
          message: 'Failed to load settings. Please try again.',
          type: 'error'
        });
      } finally {
        setIsLoading(false);
        // Clear the message after 5 seconds
        setTimeout(() => {
          setSaveStatus({ message: '', type: '' });
        }, 5000);
      }
    };
    
    loadAllSettings();
  }, []);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Save accessibility settings
      await configurationAPI.accessibility.updateSettings(accessibilitySettings);
      
      // Save collaborative design settings
      await configurationAPI.collaborativeDesign.updateSettings(collaborativeSettings);
      
      // Save cross-departmental settings
      await configurationAPI.crossDepartmental.updateSettings(crossDeptSettings);
      
      // Save data privacy settings
      await configurationAPI.dataPrivacy.updateSettings(privacySettings);
      
      // Save educational settings
      await configurationAPI.educational.updateSettings(educationalSettings);
      
      // Save emergency resilience settings
      await configurationAPI.emergencyResilience.updateSettings(emergencySettings);
      
      // Save global knowledge settings
      await configurationAPI.globalKnowledge.updateSettings(globalSettings);
      
      // Save implementation tools settings
      await configurationAPI.implementationTools.updateSettings(implementationSettings);
      
      // Save maintenance planning settings
      await configurationAPI.maintenancePlanning.updateSettings(maintenanceSettings);
      
      setSaveStatus({
        message: 'All settings saved successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus({
        message: 'Failed to save settings. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
      // Clear the message after 5 seconds
      setTimeout(() => {
        setSaveStatus({ message: '', type: '' });
      }, 5000);
    }
  };

  // Handle changes to accessibility settings
  const handleAccessibilityChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setAccessibilitySettings((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setAccessibilitySettings((prev) => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle changes to collaborative design settings
  const handleCollaborativeChange = (field: string, value: any) => {
    setCollaborativeSettings((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle changes to cross-departmental settings
  const handleCrossDeptChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setCrossDeptSettings((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setCrossDeptSettings((prev) => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Return the component JSX
  return (
    <Box sx={{ width: '100%' }}>
      {saveStatus.message && (
        <Alert severity={saveStatus.type} sx={{ mb: 3 }}>
          {saveStatus.message}
        </Alert>
      )}
      
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="admin settings tabs"
        >
          <Tab icon={<AccessibilityNewIcon />} label="Accessibility" iconPosition="start" />
          <Tab icon={<GroupsIcon />} label="Collaborative Design" iconPosition="start" />
          <Tab icon={<GroupsIcon />} label="Cross-Departmental" iconPosition="start" />
          <Tab icon={<SecurityIcon />} label="Data Privacy" iconPosition="start" />
          <Tab icon={<SchoolIcon />} label="Educational" iconPosition="start" />
          <Tab icon={<WarningAmberIcon />} label="Emergency Resilience" iconPosition="start" />
          <Tab icon={<PublicIcon />} label="Global Knowledge" iconPosition="start" />
          <Tab icon={<BuildIcon />} label="Implementation" iconPosition="start" />
          <Tab icon={<ConstructionIcon />} label="Maintenance" iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Accessibility Settings */}
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h5" gutterBottom>Accessibility & Inclusive Design</Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Universal Design</Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={accessibilitySettings.universalDesignEnabled}
                      onChange={(e) => handleAccessibilityChange('universalDesignEnabled', e.target.checked)}
                    />
                  }
                  label="Enable Universal Design Integration"
                />
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Tools to ensure all planned infrastructure meets or exceeds accessibility standards.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Multi-language Support</Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={accessibilitySettings.multiLanguageSupport.enabled}
                      onChange={(e) => handleAccessibilityChange('multiLanguageSupport.enabled', e.target.checked)}
                    />
                  }
                  label="Enable Multi-language Support"
                />
                
                <FormControl fullWidth margin="normal">
                  <InputLabel>Default Language</InputLabel>
                  <Select
                    value={accessibilitySettings.multiLanguageSupport.defaultLanguage}
                    label="Default Language"
                    onChange={(e) => handleAccessibilityChange('multiLanguageSupport.defaultLanguage', e.target.value)}
                    disabled={!accessibilitySettings.multiLanguageSupport.enabled}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                  </Select>
                </FormControl>
                
                <Typography variant="body2" color="text.secondary">
                  Translation of project descriptions and comments for diverse linguistic communities.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Low-bandwidth Mode</Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={accessibilitySettings.lowBandwidthModeEnabled}
                      onChange={(e) => handleAccessibilityChange('lowBandwidthModeEnabled', e.target.checked)}
                    />
                  }
                  label="Enable Low-bandwidth Mode"
                />
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Optimizations for users with limited internet access or older devices.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Screen Reader Optimization</Typography>
                
                <FormControl fullWidth>
                  <InputLabel>Optimization Level</InputLabel>
                  <Select
                    value={accessibilitySettings.screenReaderOptimization}
                    label="Optimization Level"
                    onChange={(e) => handleAccessibilityChange('screenReaderOptimization', e.target.value)}
                  >
                    <MenuItem value="basic">Basic</MenuItem>
                    <MenuItem value="standard">Standard</MenuItem>
                    <MenuItem value="comprehensive">Comprehensive</MenuItem>
                  </Select>
                </FormControl>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Enhanced compatibility with assistive technologies.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Visual Adjustments</Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={accessibilitySettings.highContrastMode}
                      onChange={(e) => handleAccessibilityChange('highContrastMode', e.target.checked)}
                    />
                  }
                  label="High Contrast Mode"
                />
                
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Text Size</InputLabel>
                  <Select
                    value={accessibilitySettings.textSizeAdjustment}
                    label="Text Size"
                    onChange={(e) => handleAccessibilityChange('textSizeAdjustment', e.target.value)}
                  >
                    <MenuItem value="small">Small</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="large">Large</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Cultural Sensitivity</Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={accessibilitySettings.culturalSensitivityEnabled}
                      onChange={(e) => handleAccessibilityChange('culturalSensitivityEnabled', e.target.checked)}
                    />
                  }
                  label="Enable Cultural Sensitivity Analysis"
                />
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Tools to identify potential cultural impacts of infrastructure changes.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Collaborative Design Settings */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h5" gutterBottom>Collaborative Design Tools</Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Real-time Collaboration</Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={collaborativeSettings.realTimeCollaborationEnabled}
                      onChange={(e) => handleCollaborativeChange('realTimeCollaborationEnabled', e.target.checked)}
                    />
                  }
                  label="Enable Real-time Design Collaboration"
                />
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Allows multiple stakeholders to work simultaneously on designs.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Version History</Typography>
                
                <Typography gutterBottom>Version History Limit</Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs>
                    <Slider
                      value={collaborativeSettings.versionHistoryLimit}
                      onChange={(e, newValue) => handleCollaborativeChange('versionHistoryLimit', newValue)}
                      step={5}
                      marks
                      min={5}
                      max={50}
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  <Grid item>
                    <Typography>{collaborativeSettings.versionHistoryLimit} versions</Typography>
                  </Grid>
                </Grid>
                
                <Typography variant="body2" color="text.secondary">
                  Tracks changes and allows restoring previous design versions.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Auto-Save & Comments</Typography>
                
                <Typography gutterBottom>Auto-Save Interval (minutes)</Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs>
                    <Slider
                      value={collaborativeSettings.autoSaveInterval}
                      onChange={(e, newValue) => handleCollaborativeChange('autoSaveInterval', newValue)}
                      step={1}
                      marks
                      min={1}
                      max={15}
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  <Grid item>
                    <Typography>{collaborativeSettings.autoSaveInterval} min</Typography>
                  </Grid>
                </Grid>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={collaborativeSettings.commentingEnabled}
                      onChange={(e) => handleCollaborativeChange('commentingEnabled', e.target.checked)}
                    />
                  }
                  label="Enable Design Commenting System"
                />
                
                <Typography variant="body2" color="text.secondary">
                  Enables stakeholders to provide feedback on specific design elements.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Design Tools</Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={collaborativeSettings.designTemplatesEnabled}
                      onChange={(e) => handleCollaborativeChange('designTemplatesEnabled', e.target.checked)}
                    />
                  }
                  label="Enable Design Template Library"
                />
                
                <Box sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={collaborativeSettings.measurementToolsEnabled}
                        onChange={(e) => handleCollaborativeChange('measurementToolsEnabled', e.target.checked)}
                      />
                    }
                    label="Enable Measurement Tools"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  Provides reusable templates and accurate measurement tools for designs.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Export & Sharing</Typography>
                
                <Typography gutterBottom>Supported Export Formats</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {['geojson', 'shapefile', 'pdf', 'png', 'kml', 'csv'].map((format) => (
                    <Chip
                      key={format}
                      label={format.toUpperCase()}
                      color={collaborativeSettings.exportFormats.includes(format) ? "primary" : "default"}
                      onClick={() => {
                        const newFormats = collaborativeSettings.exportFormats.includes(format)
                          ? collaborativeSettings.exportFormats.filter(f => f !== format)
                          : [...collaborativeSettings.exportFormats, format];
                        handleCollaborativeChange('exportFormats', newFormats);
                      }}
                    />
                  ))}
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Enables exporting designs in various formats and sharing with stakeholders.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Additional tabs would go here */}
      {/* We'll implement the others similarly as needed */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h5" gutterBottom>Cross-Departmental Collaboration</Typography>
        <Divider sx={{ mb: 3 }} />
        <Typography>Settings for cross-departmental collaboration to be implemented...</Typography>
      </TabPanel>
      
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h5" gutterBottom>Data Privacy & Security</Typography>
        <Divider sx={{ mb: 3 }} />
        <Typography>Settings for data privacy & security to be implemented...</Typography>
      </TabPanel>
      
      <TabPanel value={tabValue} index={4}>
        <Typography variant="h5" gutterBottom>Educational Components</Typography>
        <Divider sx={{ mb: 3 }} />
        <Typography>Settings for educational components to be implemented...</Typography>
      </TabPanel>
      
      <TabPanel value={tabValue} index={5}>
        <Typography variant="h5" gutterBottom>Emergency Resilience Planning</Typography>
        <Divider sx={{ mb: 3 }} />
        <Typography>Settings for emergency resilience planning to be implemented...</Typography>
      </TabPanel>
      
      <TabPanel value={tabValue} index={6}>
        <Typography variant="h5" gutterBottom>Global Knowledge Exchange</Typography>
        <Divider sx={{ mb: 3 }} />
        <Typography>Settings for global knowledge exchange to be implemented...</Typography>
      </TabPanel>
      
      <TabPanel value={tabValue} index={7}>
        <Typography variant="h5" gutterBottom>Implementation Tools</Typography>
        <Divider sx={{ mb: 3 }} />
        <Typography>Settings for implementation tools to be implemented...</Typography>
      </TabPanel>
      
      <TabPanel value={tabValue} index={8}>
        <Typography variant="h5" gutterBottom>Long-term Maintenance Planning</Typography>
        <Divider sx={{ mb: 3 }} />
        <Typography>Settings for long-term maintenance planning to be implemented...</Typography>
      </TabPanel>

      {/* Save button for all settings */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSaveSettings}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save All Settings'}
        </Button>
      </Box>
    </Box>
  );
};

export default AdminSettings; 