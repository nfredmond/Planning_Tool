import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  useTheme,
  Tabs,
  Tab,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import LayersIcon from '@mui/icons-material/Layers';
import SettingsIcon from '@mui/icons-material/Settings';
import PreviewIcon from '@mui/icons-material/Preview';
import { 
  LayersOutlined, 
  EditOutlined, 
  SaveOutlined, 
  UndoOutlined, 
  RedoOutlined,
  AutoFixHighOutlined,
  AnalyticsOutlined,
  PeopleOutlined,
  MapOutlined,
  HelpOutline,
  CloseOutlined
} from '@mui/icons-material';
import MapView from '../components/map/MapView';
import LayerControls from '../components/map/LayerControls';
import StyleEditor from '../components/map/StyleEditor';
import ScenarioManager from '../components/map/ScenarioManager';
import AnalysisToolbar from '../components/map/AnalysisToolbar';
import FeedbackPanel from '../components/map/FeedbackPanel';
import { useLLM } from '../context/LLMContext';

// Define types for our project and map settings
interface MarkerCategory {
  id: number;
  name: string;
  color: string;
  icon: string;
}

interface MapSettings {
  initialZoom: number;
  initialCenter: {
    lat: number;
    lng: number;
  };
  baseMapStyle: string;
  allowComments: boolean;
  allowVoting: boolean;
  markerCategories: MarkerCategory[];
}

interface Project {
  id: number;
  title: string;
  description: string;
  type: string;
  createdAt: string;
  status: string;
  mapSettings: MapSettings;
}

// Type for settings that can be toggled
type ToggleableSetting = 'allowComments' | 'allowVoting';

// Mock project data
const getMockProject = (id: string): Project => {
  return {
    id: parseInt(id),
    title: 'Downtown Revitalization',
    description: 'Community input for downtown area improvements',
    type: 'map',
    createdAt: '2023-02-15',
    status: 'active',
    mapSettings: {
      initialZoom: 13,
      initialCenter: { lat: 40.7128, lng: -74.0060 }, // New York City
      baseMapStyle: 'streets',
      allowComments: true,
      allowVoting: true,
      markerCategories: [
        { id: 1, name: 'Infrastructure', color: '#FF5733', icon: '🏗️' },
        { id: 2, name: 'Green Space', color: '#33FF57', icon: '🌳' },
        { id: 3, name: 'Safety Concern', color: '#FF3357', icon: '⚠️' },
        { id: 4, name: 'Community Facility', color: '#3357FF', icon: '🏛️' }
      ]
    }
  };
};

interface EditorTab {
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const MapEditorPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [mapMode, setMapMode] = useState<'view' | 'edit' | 'analysis'>('view');
  const [drawerOpen, setDrawerOpen] = useState<boolean>(true);
  const [drawerWidth, setDrawerWidth] = useState<number>(320);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [savedState, setSavedState] = useState<boolean>(true);
  const [mapSettings, setMapSettings] = useState<MapSettings | null>(null);

  const llm = useLLM();

  useEffect(() => {
    if (projectId) {
      // In a real app, this would be an API call
      const mockProject = getMockProject(projectId);
      setProject(mockProject);
      setMapSettings(mockProject.mapSettings);
    }
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;

    const fetchProjectData = async () => {
      try {
        // This would be a real API call in production
        console.log(`Fetching project data for project ${projectId}`);
        
        // Simulate fetching scenarios
        // In a real app, this would be an API call
        setScenarios([
          { id: 'baseline', name: 'Baseline', description: 'Current transportation network' },
          { id: 'scenario1', name: 'Proposed Bike Lanes', description: 'Add protected bike lanes on main corridors' },
          { id: 'scenario2', name: 'Transit Expansion', description: 'New bus rapid transit routes' }
        ]);
        
        setActiveScenario('baseline');
      } catch (error) {
        console.error('Error fetching project data:', error);
        setNotification({
          message: 'Failed to load project data',
          type: 'error'
        });
      }
    };

    fetchProjectData();
  }, [projectId]);

  const handleSaveMap = () => {
    // In a real app, this would save to a database
    if (project && mapSettings) {
      setProject({ ...project, mapSettings });
      setNotification({
        message: 'Map settings saved successfully!',
        type: 'success'
      });
    }
  };

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'initialZoom') {
      setMapSettings(prev => prev ? { ...prev, initialZoom: Number(value) } : null);
    }
  };

  const handleBaseMapChange = (e: SelectChangeEvent) => {
    setMapSettings(prev => prev ? { ...prev, baseMapStyle: e.target.value } : null);
  };

  const handleToggleChange = (setting: ToggleableSetting) => {
    setMapSettings(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [setting]: !prev[setting]
      };
    });
  };

  const handleCloseSnackbar = () => {
    setNotification(null);
  };

  const handleScenarioChange = (scenarioId: string) => {
    if (!savedState) {
      // Prompt user to save changes before switching scenarios
      if (window.confirm('You have unsaved changes. Save before switching scenarios?')) {
        handleSaveChanges();
      }
    }
    setActiveScenario(scenarioId);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    // Set the map mode based on the selected tab
    if (newValue === 0) setMapMode('view');
    else if (newValue === 1) setMapMode('edit');
    else if (newValue === 2) setMapMode('analysis');
  };

  const handleSaveChanges = async () => {
    try {
      // This would be a real API call in production
      console.log(`Saving changes to scenario ${activeScenario}`);
      
      setNotification({
        message: 'Changes saved successfully',
        type: 'success'
      });
      
      setSavedState(true);
    } catch (error) {
      console.error('Error saving changes:', error);
      setNotification({
        message: 'Failed to save changes',
        type: 'error'
      });
    }
  };

  const handleLayerSelect = (layerId: string) => {
    setSelectedLayerId(layerId);
  };

  const handleAIAssistance = async () => {
    try {
      setNotification({
        message: 'Generating AI recommendations...',
        type: 'info'
      });
      
      // Create a system message for the LLM
      const systemMessage = 'You are a transportation planning expert. Analyze the current map scenario and provide recommendations for improvements based on best practices.';
      
      // Get the current scenario details to send to the LLM
      const currentScenario = scenarios.find(s => s.id === activeScenario);
      
      // Generate recommendations
      const aiResponse = await llm.generateCompletionWithSystem(
        systemMessage,
        `Please analyze the following transportation scenario and provide 3-5 specific recommendations for improvement:\n\nScenario: ${currentScenario?.name}\nDescription: ${currentScenario?.description}`
      );
      
      // Display the recommendations in a modal or panel
      console.log('AI Recommendations:', aiResponse);
      
      // For now, just show a notification
      setNotification({
        message: 'AI recommendations generated. Check the recommendations panel.',
        type: 'success'
      });
      
      // In a real implementation, we would update a recommendations state and display it
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      setNotification({
        message: 'Failed to generate AI recommendations',
        type: 'error'
      });
    }
  };

  const handleRunAnalysis = async (analysisType: string, params: any) => {
    try {
      setNotification({
        message: `Running ${analysisType} analysis...`,
        type: 'info'
      });
      
      // This would be a real API call in production
      console.log(`Running ${analysisType} analysis with params:`, params);
      
      // Simulate analysis results
      setTimeout(() => {
        setNotification({
          message: 'Analysis completed successfully',
          type: 'success'
        });
      }, 2000);
    } catch (error) {
      console.error('Error running analysis:', error);
      setNotification({
        message: 'Failed to run analysis',
        type: 'error'
      });
    }
  };

  // Create tabs for the editor
  const tabs: EditorTab[] = [
    {
      label: 'View',
      icon: <MapOutlined />,
      content: (
        <Box p={2}>
          <Typography variant="h6" gutterBottom>Map Viewer</Typography>
          <Typography variant="body2" paragraph>
            View the current transportation network and planning scenarios.
          </Typography>
          <ScenarioManager 
            scenarios={scenarios}
            activeScenario={activeScenario}
            onScenarioChange={handleScenarioChange}
          />
          <Divider sx={{ my: 2 }} />
          <FeedbackPanel projectId={projectId} />
        </Box>
      )
    },
    {
      label: 'Edit',
      icon: <EditOutlined />,
      content: (
        <Box p={2}>
          <Typography variant="h6" gutterBottom>Map Editor</Typography>
          <Typography variant="body2" paragraph>
            Edit transportation infrastructure and create planning scenarios.
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<SaveOutlined />} 
              onClick={handleSaveChanges}
              disabled={savedState}
              sx={{ mr: 1 }}
            >
              Save
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<UndoOutlined />} 
              sx={{ mr: 1 }}
            >
              Undo
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<RedoOutlined />}
            >
              Redo
            </Button>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>Layer Properties</Typography>
          {selectedLayerId ? (
            <StyleEditor 
              layerId={selectedLayerId} 
              onChange={() => setSavedState(false)} 
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              Select a layer to edit its properties
            </Typography>
          )}
          <Divider sx={{ my: 2 }} />
          <Button 
            variant="contained" 
            color="secondary"
            startIcon={<AutoFixHighOutlined />}
            onClick={handleAIAssistance}
            fullWidth
          >
            AI Design Recommendations
          </Button>
        </Box>
      )
    },
    {
      label: 'Analysis',
      icon: <AnalyticsOutlined />,
      content: (
        <Box p={2}>
          <Typography variant="h6" gutterBottom>Transportation Analysis</Typography>
          <Typography variant="body2" paragraph>
            Analyze transportation network performance and impacts.
          </Typography>
          <AnalysisToolbar onRunAnalysis={handleRunAnalysis} />
        </Box>
      )
    },
    {
      label: 'Feedback',
      icon: <PeopleOutlined />,
      content: (
        <Box p={2}>
          <Typography variant="h6" gutterBottom>Community Feedback</Typography>
          <Typography variant="body2" paragraph>
            View and manage community feedback on transportation projects.
          </Typography>
          <FeedbackPanel projectId={projectId} />
        </Box>
      )
    }
  ];

  if (!project || !mapSettings) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h5">Loading project...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex' }}>
      {/* Side panel */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            height: 'calc(100% - 64px)',
            top: 64, // Below the app bar
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', padding: 1, justifyContent: 'space-between' }}>
          <Typography variant="h6" noWrap component="div">
            Map Editor
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <CloseOutlined />
          </IconButton>
        </Box>
        <Divider />
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          {tabs.map((tab, index) => (
            <Tab 
              key={index} 
              icon={tab.icon} 
              label={tab.label} 
              sx={{ minHeight: 50 }} 
            />
          ))}
        </Tabs>
        <Divider />
        <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
          {tabs[activeTab].content}
        </Box>
      </Drawer>

      {/* Map area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: drawerOpen ? `${drawerWidth}px` : 0,
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Map view */}
        <MapView 
          projectId={projectId}
          mode={mapMode}
          center={[38.9072, -77.0369]} // Washington DC - would be dynamic in production
          zoom={12}
        />
        
        {/* Layer controls */}
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: 15,
            right: 15,
            zIndex: 1000,
            borderRadius: 2,
          }}
        >
          <LayerControls 
            onLayerSelect={handleLayerSelect}
            selectedLayerId={selectedLayerId}
          />
        </Paper>
        
        {/* Toggle drawer button */}
        {!drawerOpen && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setDrawerOpen(true)}
            sx={{
              position: 'absolute',
              left: 10,
              top: 10,
              zIndex: 1000,
              borderRadius: '50%',
              minWidth: 'auto',
              width: 40,
              height: 40,
            }}
          >
            <LayersOutlined />
          </Button>
        )}
        
        {/* Help button */}
        <Tooltip title="Map Editor Help">
          <IconButton
            color="primary"
            sx={{
              position: 'absolute',
              right: 15,
              bottom: 15,
              zIndex: 1000,
              bgcolor: 'background.paper',
            }}
          >
            <HelpOutline />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Notifications */}
      <Snackbar 
        open={!!notification} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {notification && (
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={notification.type} 
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
};

export default MapEditorPage; 