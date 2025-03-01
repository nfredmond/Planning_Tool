import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Button,
  IconButton,
  Chip,
  Avatar,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Tooltip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Share as ShareIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Public as PublicIcon,
  Timeline as TimelineIcon,
  Groups as GroupsIcon,
  Comment as CommentIcon,
  Layers as LayersIcon,
  Map as MapIcon,
  DateRange as DateRangeIcon,
  RateReview as RateReviewIcon,
  ArticleOutlined as DocumentIcon,
  Assessment as AssessmentIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

// Import our map components
import MapView from '../components/map/MapView';
import LayerControls from '../components/map/LayerControls';
import StyleEditor from '../components/map/StyleEditor';
import ScenarioManager from '../components/map/ScenarioManager';
import AnalysisToolbar from '../components/map/AnalysisToolbar';
import FeedbackPanel from '../components/map/FeedbackPanel';

// Define interfaces
interface ProjectMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  modifiedAt: string;
  isActive: boolean;
}

interface FeedbackItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  createdAt: string;
  content: string;
  type: 'comment' | 'suggestion' | 'question' | 'support' | 'opposition';
  category: string;
  rating: number;
  location: [number, number] | null;
  status: 'pending' | 'reviewed' | 'addressed';
  likes: number;
  dislikes: number;
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
  size: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'review' | 'approved' | 'completed';
  type: string;
  createdAt: string;
  modifiedAt: string;
  startDate: string;
  endDate: string;
  budget: number;
  scope: string;
  location: {
    center: [number, number];
    zoom: number;
  };
  scenarios: Scenario[];
  members: ProjectMember[];
  isStarred: boolean;
  progress: number;
  tags: string[];
  feedback: FeedbackItem[];
  documents: Document[];
}

// TabPanel component for tab content
function TabPanel(props: {
  children?: React.ReactNode;
  index: number;
  value: number;
}) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && (
        <Box sx={{ p: 3, height: '100%' }}>{children}</Box>
      )}
    </div>
  );
}

const ProjectDetailsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  // State variables
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    status: '',
    startDate: '',
    endDate: '',
    budget: 0,
    scope: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);

  // Fetch project data
  useEffect(() => {
    // In a real app, this would be an API call
    const fetchProject = async () => {
      try {
        setLoading(true);
        // Mock data - would be replaced with actual API call
        const mockProject: Project = {
          id: projectId || '1',
          name: 'Downtown Transit Corridor Improvement',
          description: 'A comprehensive plan to improve public transit options in the downtown area, focusing on bus lanes, pedestrian accessibility, and traffic signal coordination.',
          status: 'active',
          type: 'Transit Improvement',
          createdAt: '2023-10-15T10:30:00Z',
          modifiedAt: '2023-12-05T14:45:00Z',
          startDate: '2024-03-01',
          endDate: '2025-06-30',
          budget: 4500000,
          scope: 'Downtown core and adjacent neighborhoods',
          location: {
            center: [40.7128, -74.0060],
            zoom: 14,
          },
          scenarios: [
            {
              id: 's1',
              name: 'Baseline',
              description: 'Current transit routes and infrastructure',
              createdAt: '2023-10-20T08:15:00Z',
              modifiedAt: '2023-10-20T08:15:00Z',
              isActive: true,
            },
            {
              id: 's2',
              name: 'Bus Lane Priority',
              description: 'Dedicated bus lanes on main corridors',
              createdAt: '2023-11-05T11:30:00Z',
              modifiedAt: '2023-11-15T09:45:00Z',
              isActive: false,
            },
            {
              id: 's3',
              name: 'Mixed Modal Approach',
              description: 'Combination of bus lanes, bike paths, and expanded pedestrian zones',
              createdAt: '2023-11-20T14:20:00Z',
              modifiedAt: '2023-12-01T10:10:00Z',
              isActive: false,
            },
          ],
          members: [
            { id: 'u1', name: 'Jane Smith', role: 'Project Manager', avatar: '/avatars/jane.jpg' },
            { id: 'u2', name: 'Michael Chen', role: 'Transportation Planner', avatar: '/avatars/michael.jpg' },
            { id: 'u3', name: 'Sarah Johnson', role: 'Community Liaison', avatar: '/avatars/sarah.jpg' },
            { id: 'u4', name: 'David Patel', role: 'Traffic Engineer', avatar: '/avatars/david.jpg' },
          ],
          isStarred: true,
          progress: 35,
          tags: ['Transit', 'Urban', 'Pedestrian', 'Bus'],
          feedback: [
            {
              id: 'f1',
              userId: 'c1',
              userName: 'Emma Wilson',
              userAvatar: '/avatars/emma.jpg',
              createdAt: '2023-11-10T09:15:00Z',
              content: 'I\'m concerned about the potential loss of parking spaces for local businesses.',
              type: 'concern',
              category: 'Parking',
              rating: 2,
              location: [40.7135, -74.0070],
              status: 'pending',
              likes: 12,
              dislikes: 3,
            },
            {
              id: 'f2',
              userId: 'c2',
              userName: 'Robert Taylor',
              userAvatar: '/avatars/robert.jpg',
              createdAt: '2023-11-12T11:30:00Z',
              content: 'I strongly support dedicated bus lanes! This would significantly improve my commute.',
              type: 'support',
              category: 'Bus Lanes',
              rating: 5,
              location: [40.7115, -74.0050],
              status: 'reviewed',
              likes: 24,
              dislikes: 1,
            },
          ],
          documents: [
            {
              id: 'd1',
              name: 'Initial Assessment Report',
              type: 'PDF',
              uploadedAt: '2023-10-25T10:15:00Z',
              uploadedBy: 'Jane Smith',
              size: '3.2 MB',
            },
            {
              id: 'd2',
              name: 'Traffic Analysis Data',
              type: 'XLSX',
              uploadedAt: '2023-11-05T14:30:00Z',
              uploadedBy: 'David Patel',
              size: '1.8 MB',
            },
            {
              id: 'd3',
              name: 'Community Survey Results',
              type: 'PDF',
              uploadedAt: '2023-11-15T09:45:00Z',
              uploadedBy: 'Sarah Johnson',
              size: '2.5 MB',
            },
          ],
        };
        
        setProject(mockProject);
        setSelectedScenario(mockProject.scenarios.find(s => s.isActive)?.id || null);
        
        // Initialize edit form data
        setEditFormData({
          name: mockProject.name,
          description: mockProject.description,
          status: mockProject.status,
          startDate: mockProject.startDate,
          endDate: mockProject.endDate,
          budget: mockProject.budget,
          scope: mockProject.scope,
        });
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load project details');
        setLoading(false);
        console.error(err);
      }
    };

    fetchProject();
  }, [projectId]);

  // Event handlers
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleEditProject = () => {
    setEditingProject(true);
  };

  const handleCancelEdit = () => {
    setEditingProject(false);
    // Reset form data to current project values
    if (project) {
      setEditFormData({
        name: project.name,
        description: project.description,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
        budget: project.budget,
        scope: project.scope,
      });
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    const value = e.target.value;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const handleSaveProject = () => {
    // In a real app, this would be an API call
    if (project) {
      const updatedProject = {
        ...project,
        name: editFormData.name,
        description: editFormData.description,
        status: editFormData.status as any,
        startDate: editFormData.startDate,
        endDate: editFormData.endDate,
        budget: editFormData.budget,
        scope: editFormData.scope,
        modifiedAt: new Date().toISOString(),
      };
      setProject(updatedProject);
      setEditingProject(false);
      setSnackbar({
        open: true,
        message: 'Project updated successfully',
        severity: 'success',
      });
    }
  };

  const handleDeleteProject = () => {
    // In a real app, this would be an API call
    setDeleteDialog(false);
    // Navigate back to projects page
    navigate('/projects');
    // Show snackbar on the next page
    // This would normally be handled by a global state manager
    setSnackbar({
      open: true,
      message: 'Project deleted successfully',
      severity: 'success',
    });
  };

  const handleToggleStarred = () => {
    if (project) {
      const updatedProject = {
        ...project,
        isStarred: !project.isStarred,
      };
      setProject(updatedProject);
      setSnackbar({
        open: true,
        message: updatedProject.isStarred ? 'Project starred' : 'Project unstarred',
        severity: 'success',
      });
    }
  };

  const handleScenarioChange = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    setSnackbar({
      open: true,
      message: `Switched to ${project?.scenarios.find(s => s.id === scenarioId)?.name} scenario`,
      severity: 'info',
    });
  };

  const handleLayerSelect = (layerId: string) => {
    setSelectedLayer(layerId);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">
          {error || 'Project not found'}
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          variant="contained"
          onClick={() => navigate('/projects')}
          sx={{ mt: 2 }}
        >
          Back to Projects
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/projects')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" component="h1">
              {project.name}
              <IconButton onClick={handleToggleStarred} sx={{ ml: 1 }}>
                {project.isStarred ? <StarIcon color="warning" /> : <StarBorderIcon />}
              </IconButton>
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              <Chip 
                size="small" 
                label={project.status.charAt(0).toUpperCase() + project.status.slice(1)} 
                color={
                  project.status === 'planning' ? 'info' :
                  project.status === 'active' ? 'primary' :
                  project.status === 'review' ? 'warning' :
                  project.status === 'approved' ? 'success' :
                  project.status === 'completed' ? 'secondary' : 'default'
                }
              />
              <Chip size="small" label={project.type} />
              {project.tags.map(tag => (
                <Chip key={tag} size="small" label={tag} variant="outlined" />
              ))}
            </Box>
          </Box>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
            sx={{ mr: 1 }}
          >
            Share
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEditProject}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialog(true)}
          >
            Delete
          </Button>
        </Box>
      </Paper>

      {/* Project Progress */}
      <Paper sx={{ p: 1, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ mr: 2 }}>Project Progress:</Typography>
          <Box sx={{ width: '100%', mr: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={project.progress} 
              sx={{ height: 10, borderRadius: 5 }} 
            />
          </Box>
          <Typography variant="body2">{project.progress}%</Typography>
        </Box>
      </Paper>

      {/* Tabs and Content */}
      <Box sx={{ display: 'flex', height: 'calc(100% - 130px)' }}>
        <Paper sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="project tabs"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<InfoIcon />} label="Overview" />
            <Tab icon={<MapIcon />} label="Map" />
            <Tab icon={<RateReviewIcon />} label="Feedback" />
            <Tab icon={<DocumentIcon />} label="Documents" />
            <Tab icon={<AssessmentIcon />} label="Analysis" />
            <Tab icon={<GroupsIcon />} label="Team" />
          </Tabs>

          {/* Overview Tab */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Description</Typography>
                  <Typography variant="body1" paragraph>
                    {project.description}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>Scope</Typography>
                  <Typography variant="body2" paragraph>
                    {project.scope}
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Timeline</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle2">Start Date</Typography>
                      <Typography variant="body1">
                        <DateRangeIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                        {new Date(project.startDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2">End Date</Typography>
                      <Typography variant="body1">
                        <DateRangeIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                        {new Date(project.endDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2">Budget</Typography>
                      <Typography variant="body1">
                        ${project.budget.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Key Information</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box>
                      <Typography variant="subtitle2">Created</Typography>
                      <Typography variant="body2">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2">Last Modified</Typography>
                      <Typography variant="body2">
                        {new Date(project.modifiedAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2">Project Type</Typography>
                      <Typography variant="body2">{project.type}</Typography>
                    </Box>
                  </Box>
                </Paper>

                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Team Members</Typography>
                    <Button size="small" variant="outlined">Manage Team</Button>
                  </Box>
                  <List>
                    {project.members.map((member) => (
                      <ListItem key={member.id} disablePadding sx={{ mb: 1 }}>
                        <ListItemAvatar>
                          <Avatar src={member.avatar} alt={member.name}>
                            {member.name.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={member.name}
                          secondary={member.role}
                          primaryTypographyProps={{ variant: 'subtitle2' }}
                          secondaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Map Tab */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ display: 'flex', height: '100%' }}>
              {/* Left Sidebar */}
              <Paper 
                elevation={3} 
                sx={{ 
                  width: 300, 
                  p: 2, 
                  mr: 2, 
                  overflow: 'auto',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>Map Controls</Typography>
                
                {/* Scenarios */}
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Scenarios</Typography>
                <ScenarioManager 
                  scenarios={project.scenarios} 
                  onScenarioSelect={handleScenarioChange}
                  selectedScenarioId={selectedScenario}
                  projectId={project.id}
                />
                
                <Divider sx={{ my: 2 }} />
                
                {/* Layers */}
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Map Layers</Typography>
                <LayerControls 
                  onLayerSelect={handleLayerSelect}
                  selectedLayerId={selectedLayer}
                />
                
                <Divider sx={{ my: 2 }} />
                
                {/* Style Editor (shows when a layer is selected) */}
                {selectedLayer && (
                  <>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>Style Editor</Typography>
                    <StyleEditor 
                      layerId={selectedLayer} 
                    />
                  </>
                )}
              </Paper>
              
              {/* Main Map View */}
              <Box sx={{ flexGrow: 1, height: '100%', position: 'relative' }}>
                <MapView 
                  center={project.location.center}
                  zoom={project.location.zoom}
                  scenarioId={selectedScenario}
                />
              </Box>
            </Box>
          </TabPanel>

          {/* Feedback Tab */}
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ display: 'flex', height: '100%' }}>
              {/* Left: Feedback List */}
              <Box sx={{ width: '50%', pr: 2, height: '100%', overflow: 'auto' }}>
                <FeedbackPanel 
                  projectId={project.id}
                  initialFeedback={project.feedback}
                />
              </Box>
              
              {/* Right: Map with Feedback Locations */}
              <Box sx={{ width: '50%', height: '100%' }}>
                <Paper sx={{ p: 1, height: '100%' }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Feedback Locations</Typography>
                  <Box sx={{ height: 'calc(100% - 30px)' }}>
                    <MapView 
                      center={project.location.center}
                      zoom={project.location.zoom}
                      showFeedback={true}
                      projectId={project.id}
                    />
                  </Box>
                </Paper>
              </Box>
            </Box>
          </TabPanel>

          {/* Documents Tab */}
          <TabPanel value={activeTab} index={3}>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Project Documents</Typography>
                <Button variant="contained" color="primary">Upload Document</Button>
              </Box>
              
              <Grid container spacing={2}>
                {project.documents.map(doc => (
                  <Grid item xs={12} sm={6} md={4} key={doc.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                            {doc.type === 'PDF' ? 'P' : 
                             doc.type === 'XLSX' ? 'X' : 
                             doc.type === 'DOCX' ? 'W' : 'F'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1">{doc.name}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              {doc.type} • {doc.size}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" color="textSecondary">
                          Uploaded by {doc.uploadedBy} on {new Date(doc.uploadedAt).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small">Download</Button>
                        <Button size="small">View</Button>
                        <IconButton size="small" sx={{ ml: 'auto' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </TabPanel>

          {/* Analysis Tab */}
          <TabPanel value={activeTab} index={4}>
            <Box sx={{ display: 'flex', height: '100%' }}>
              {/* Left: Analysis Controls */}
              <Paper 
                elevation={3} 
                sx={{ 
                  width: 350, 
                  p: 2, 
                  mr: 2, 
                  overflow: 'auto',
                  height: '100%',
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>Transportation Analysis</Typography>
                <AnalysisToolbar projectId={project.id} />
              </Paper>
              
              {/* Right: Map with Analysis Results */}
              <Box sx={{ flexGrow: 1, height: '100%' }}>
                <MapView 
                  center={project.location.center}
                  zoom={project.location.zoom}
                  scenarioId={selectedScenario}
                  showAnalysis={true}
                />
              </Box>
            </Box>
          </TabPanel>

          {/* Team Tab */}
          <TabPanel value={activeTab} index={5}>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Project Team</Typography>
                <Button variant="contained" color="primary">Add Team Member</Button>
              </Box>
              
              <Grid container spacing={3}>
                {project.members.map(member => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={member.id}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Avatar 
                          src={member.avatar} 
                          alt={member.name}
                          sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
                        >
                          {member.name.charAt(0)}
                        </Avatar>
                        <Typography variant="h6">{member.name}</Typography>
                        <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                          {member.role}
                        </Typography>
                        <Button variant="outlined" size="small">View Profile</Button>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                        <Button size="small">Message</Button>
                        <Button size="small" color="warning">Edit Role</Button>
                        <Button size="small" color="error">Remove</Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </TabPanel>
        </Paper>
      </Box>

      {/* Edit Project Dialog */}
      <Dialog open={editingProject} onClose={handleCancelEdit} maxWidth="md" fullWidth>
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="Project Name"
                  fullWidth
                  value={editFormData.name}
                  onChange={handleFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description"
                  fullWidth
                  multiline
                  rows={4}
                  value={editFormData.description}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  name="status"
                  label="Status"
                  fullWidth
                  value={editFormData.status}
                  onChange={handleFormChange}
                >
                  <MenuItem value="planning">Planning</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="review">Review</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="type"
                  label="Project Type"
                  fullWidth
                  value={project.type}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="startDate"
                  label="Start Date"
                  type="date"
                  fullWidth
                  value={editFormData.startDate}
                  onChange={handleFormChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="endDate"
                  label="End Date"
                  type="date"
                  fullWidth
                  value={editFormData.endDate}
                  onChange={handleFormChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="budget"
                  label="Budget"
                  type="number"
                  fullWidth
                  value={editFormData.budget}
                  onChange={handleFormChange}
                  InputProps={{
                    startAdornment: <span>$</span>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="scope"
                  label="Project Scope"
                  fullWidth
                  multiline
                  rows={2}
                  value={editFormData.scope}
                  onChange={handleFormChange}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>Cancel</Button>
          <Button onClick={handleSaveProject} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{project.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteProject} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectDetailsPage; 