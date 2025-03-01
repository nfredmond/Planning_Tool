// client/src/components/admin/AdminDashboard.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Drawer, 
  Divider, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Container,
  IconButton,
  Avatar,
  Box,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  Map as MapIcon, 
  Comment as CommentIcon, 
  PeopleAlt as UsersIcon, 
  Assessment as ReportsIcon, 
  SmartToy as AIIcon, 
  Settings as SettingsIcon,
  MenuOpen as MenuOpenIcon,
  Menu as MenuIcon,
  ExitToApp as LogoutIcon,
  Person as PersonIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProjectList from './projects/ProjectList';
import ProjectCreate from './projects/ProjectCreate';
import ProjectEdit from './projects/ProjectEdit';
import CommentModeration from './comments/CommentModeration';
import UserManagement from './users/UserManagement';
import ReportsDashboard from './reports/ReportsDashboard';
import AISettings from './ai/AISettings';
import AdminSettings from './settings/AdminSettings';
import LayerManagement from './layers/LayerManagement';

const drawerWidth = 240;

const AdminDashboard: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);
  const [darkMode, setDarkMode] = useState(false);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user || !['admin', 'moderator'].includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    handleUserMenuClose();
    navigate('/admin/settings/profile');
  };

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
    handleUserMenuClose();
    // Here you would implement the actual theme change logic
  };

  const menuItems = [
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: '/admin/dashboard',
      admin: false 
    },
    { 
      text: 'Projects', 
      icon: <MapIcon />, 
      path: '/admin/projects',
      admin: false 
    },
    { 
      text: 'Comments', 
      icon: <CommentIcon />, 
      path: '/admin/comments',
      admin: false 
    },
    { 
      text: 'Users', 
      icon: <UsersIcon />, 
      path: '/admin/users',
      admin: true 
    },
    { 
      text: 'Reports', 
      icon: <ReportsIcon />, 
      path: '/admin/reports',
      admin: false 
    },
    { 
      text: 'Map Layers', 
      icon: <MapIcon />, 
      path: '/admin/layers',
      admin: false 
    },
    { 
      text: 'AI Settings', 
      icon: <AIIcon />, 
      path: '/admin/ai',
      admin: true 
    },
    { 
      text: 'Settings', 
      icon: <SettingsIcon />, 
      path: '/admin/settings',
      admin: false 
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.admin || user.role === 'admin'
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: { sm: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` },
          ml: { sm: `${drawerOpen ? drawerWidth : 0}px` },
          transition: 'width 0.2s, margin 0.2s'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            {drawerOpen ? <MenuOpenIcon /> : <MenuIcon />}
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            TransportVoice Admin
          </Typography>
          
          {/* Notifications */}
          <IconButton 
            color="inherit" 
            onClick={handleNotificationsOpen}
            size="large"
          >
            <NotificationsIcon />
          </IconButton>
          <Menu
            anchorEl={notificationsAnchorEl}
            open={Boolean(notificationsAnchorEl)}
            onClose={handleNotificationsClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              style: {
                width: 320,
              },
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="h6">Notifications</Typography>
            </Box>
            <Divider />
            <MenuItem>
              <Typography variant="body2">
                No new notifications
              </Typography>
            </MenuItem>
          </Menu>
          
          {/* User Menu */}
          <IconButton
            onClick={handleUserMenuOpen}
            size="small"
            sx={{ ml: 2 }}
            aria-controls="user-menu"
            aria-haspopup="true"
          >
            <Avatar 
              sx={{ width: 32, height: 32 }}
              alt={`${user.firstName} ${user.lastName}`}
            >
              {user.firstName ? user.firstName[0] : ''}
              {user.lastName ? user.lastName[0] : ''}
            </Avatar>
          </IconButton>
          <Menu
            id="user-menu"
            anchorEl={userMenuAnchorEl}
            open={Boolean(userMenuAnchorEl)}
            onClose={handleUserMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle1">{`${user.firstName} ${user.lastName}`}</Typography>
              <Typography variant="body2" color="text.secondary">{user.email}</Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleProfileClick}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleThemeToggle}>
              <ListItemIcon>
                {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </ListItemIcon>
              <ListItemText>{darkMode ? 'Light Mode' : 'Dark Mode'}</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        open={drawerOpen}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            display: { xs: drawerOpen ? 'block' : 'none', sm: 'block' }
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {filteredMenuItems.map((item) => (
              <ListItem 
                button 
                key={item.text}
                onClick={() => navigate(item.path)}
                selected={location.pathname.startsWith(item.path)}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <MainContent
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` },
          ml: { sm: `${drawerOpen ? drawerWidth : 0}px` },
          transition: 'width 0.2s, margin 0.2s'
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route path="/dashboard" element={<DashboardContent />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/create" element={<ProjectCreate />} />
            <Route path="/projects/:id/edit" element={<ProjectEdit />} />
            <Route path="/comments" element={<CommentModeration />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/reports" element={<ReportsDashboard />} />
            <Route path="/layers" element={<LayerManagement />} />
            <Route path="/ai" element={<AISettings />} />
            <Route path="/settings/*" element={<AdminSettings />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </Container>
      </MainContent>
    </Box>
  );
};

const MainContent = styled(Box)`
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;
`;

// Simple dashboard component
const DashboardContent: React.FC = () => {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography paragraph>
        Welcome to the TransportVoice admin dashboard. Use the navigation menu to manage your projects, comments, users, and more.
      </Typography>
    </div>
  );
};

export default AdminDashboard;

// client/src/components/admin/projects/ProjectList.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  FileCopy as DuplicateIcon,
  Visibility as ViewIcon,
  Search as SearchIcon 
} from '@mui/icons-material';
import { getProjects, deleteProject } from '../../../services/projectService';
import { Project } from '../../../types/Project';
import { formatDistanceToNow } from 'date-fns';

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const fetchedProjects = await getProjects();
      setProjects(fetchedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    navigate('/admin/projects/create');
  };

  const handleEditProject = (projectId: string) => {
    navigate(`/admin/projects/${projectId}/edit`);
  };

  const handleViewProject = (projectSlug: string) => {
    window.open(`/projects/${projectSlug}`, '_blank');
  };

  const handleDuplicateProject = (projectId: string) => {
    // Navigate to create page with duplicate parameter
    navigate(`/admin/projects/create?duplicate=${projectId}`);
  };

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    
    try {
      await deleteProject(projectToDelete._id);
      setProjects(projects.filter(p => p._id !== projectToDelete._id));
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project. Please try again.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  // Filter projects based on search term
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Projects
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateProject}
        >
          Create Project
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredProjects.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            {searchTerm ? 'No projects match your search.' : 'No projects found.'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleCreateProject}
            sx={{ mt: 2 }}
          >
            Create your first project
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Comments</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project._id}>
                  <TableCell>
                    <Typography variant="subtitle2">{project.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {project.description.substring(0, 60)}
                      {project.description.length > 60 ? '...' : ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={project.status} 
                      color={
                        project.status === 'active' ? 'success' : 
                        project.status === 'draft' ? 'default' : 'error'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    {project.commentCount || 0}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View">
                      <IconButton onClick={() => handleViewProject(project.slug)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEditProject(project._id)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Duplicate">
                      <IconButton onClick={() => handleDuplicateProject(project._id)}>
                        <DuplicateIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDeleteClick(project)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the project "{projectToDelete?.name}"? 
            This action cannot be undone and will also delete all comments, 
            reports, and other data associated with this project.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProjectList;

// client/src/components/admin/projects/ProjectForm.tsx
import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Box, 
  Grid, 
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  Map as MapIcon,
  Comment as CommentIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Project } from '../../../types/Project';
import { createProject, updateProject } from '../../../services/projectService';
import { getAllAIProviders } from '../../../services/aiService';
import MapPreview from './MapPreview';
import LayerSelect from './LayerSelect';

interface AIProvider {
  _id: string;
  name: string;
  provider: string;
  model: string;
}

interface ProjectFormProps {
  project?: Project;
  isEdit?: boolean;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, isEdit = false }) => {
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    description: '',
    slug: '',
    startDate: new Date(),
    endDate: null,
    status: 'draft',
    basemap: 'streets',
    layers: [],
    bounds: {
      north: 0,
      east: 0,
      south: 0,
      west: 0
    },
    settings: {
      allowAnonymousComments: true,
      requireModeration: true,
      enableAIModeration: false,
      aiProvider: '',
      enableVoting: true,
      enableImageUploads: true,
      enableSocialSharing: true
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [aiProviders, setAIProviders] = useState<AIProvider[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [slugEdited, setSlugEdited] = useState(false);
  
  const navigate = useNavigate();

  const steps = [
    { label: 'Basic Information', icon: <SettingsIcon /> },
    { label: 'Map Configuration', icon: <MapIcon /> },
    { label: 'Comment Settings', icon: <CommentIcon /> }
  ];

  useEffect(() => {
    if (project) {
      setFormData({
        ...project
      });
      setSlugEdited(true);
    }
    
    fetchAIProviders();
  }, [project]);

  const fetchAIProviders = async () => {
    try {
      const providers = await getAllAIProviders();
      setAIProviders(providers);
    } catch (error) {
      console.error('Error fetching AI providers:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'name' && !slugEdited) {
      // Auto-generate slug from name
      const slug = value.toString()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      setFormData({
        ...formData,
        [name]: value,
        slug
      });
    } else {
      setFormData({
        ...formData,
        [name!]: value
      });
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugEdited(true);
    handleChange(e);
  };

  const handleSettingsChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value, checked } = e.target as HTMLInputElement;
    
    setFormData({
      ...formData,
      settings: {
        ...formData.settings!,
        [name!]: checked !== undefined ? checked : value
      }
    });
  };

  const handleDateChange = (field: 'startDate' | 'endDate', date: Date | null) => {
    setFormData({
      ...formData,
      [field]: date
    });
  };

  const handleLayersChange = (layers: any[]) => {
    setFormData({
      ...formData,
      layers
    });
  };

  const handleBoundsChange = (bounds: any) => {
    setFormData({
      ...formData,
      bounds
    });
  };

  const validateForm = (): boolean => {
    // Basic validation
    if (!formData.name || !formData.slug || !formData.description) {
      setError('Please fill in all required fields');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (isEdit && project) {
        await updateProject(project._id, formData);
        setSuccess('Project updated successfully!');
      } else {
        const newProject = await createProject(formData);
        setSuccess('Project created successfully!');
        
        // Redirect to edit page for the new project
        setTimeout(() => {
          navigate(`/admin/projects/${newProject._id}/edit`);
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving project:', error);
      setError('Failed to save project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleCancel = () => {
    navigate('/admin/projects');
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {isEdit ? 'Edit Project' : 'Create New Project'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ my: 2 }}>
          {success}
        </Alert>
      )}
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
        {steps.map((step) => (
          <Step key={step.label}>
            <StepLabel StepIconComponent={() => (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: activeStep >= steps.indexOf(step) ? 'primary.main' : 'grey.400',
                color: 'white'
              }}>
                {step.icon}
              </Box>
            )}>
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <form onSubmit={handleSubmit}>
        {/* Step 1: Basic Information */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="Project Name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="slug"
                  label="Project URL Slug"
                  value={formData.slug}
                  onChange={handleSlugChange}
                  fullWidth
                  required
                  variant="outlined"
                  helperText="This will be used in the project URL (e.g., /projects/my-project)"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Project Description"
                  value={formData.description}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                  multiline
                  rows={4}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={formData.startDate}
                    onChange={(date) => handleDateChange('startDate', date)}
                    slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date (Optional)"
                    value={formData.endDate}
                    onChange={(date) => handleDateChange('endDate', date)}
                    slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Step 2: Map Configuration */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Map Configuration
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="basemap-label">Base Map</InputLabel>
                  <Select
                    labelId="basemap-label"
                    name="basemap"
                    value={formData.basemap}
                    onChange={handleChange}
                    label="Base Map"
                  >
                    <MenuItem value="streets">Streets</MenuItem>
                    <MenuItem value="satellite">Satellite</MenuItem>
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="outdoors">Outdoors</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Map Layers
                </Typography>
                <LayerSelect
                  selectedLayers={formData.layers || []}
                  onChange={handleLayersChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Map Preview & Bounds
                </Typography>
                <MapPreview
                  basemap={formData.basemap!}
                  layers={formData.layers || []}
                  bounds={formData.bounds}
                  onBoundsChange={handleBoundsChange}
                />
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Step 3: Comment Settings */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Comment Settings
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.settings?.allowAnonymousComments}
                      onChange={handleSettingsChange}
                      name="allowAnonymousComments"
                      color="primary"
                    />
                  }
                  label="Allow Anonymous Comments"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.settings?.requireModeration}
                      onChange={handleSettingsChange}
                      name="requireModeration"
                      color="primary"
                    />
                  }
                  label="Require Comment Moderation"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.settings?.enableVoting}
                      onChange={handleSettingsChange}
                      name="enableVoting"
                      color="primary"
                    />
                  }
                  label="Enable Comment Voting"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.settings?.enableImageUploads}
                      onChange={handleSettingsChange}
                      name="enableImageUploads"
                      color="primary"
                    />
                  }
                  label="Enable Image Uploads"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.settings?.enableSocialSharing}
                      onChange={handleSettingsChange}
                      name="enableSocialSharing"
                      color="primary"
                    />
                  }
                  label="Enable Social Media Sharing"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>AI Moderation Settings</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.settings?.enableAIModeration}
                              onChange={handleSettingsChange}
                              name="enableAIModeration"
                              color="primary"
                            />
                          }
                          label="Enable AI Comment Moderation"
                        />
                      </Grid>
                      
                      {formData.settings?.enableAIModeration && (
                        <Grid item xs={12}>
                          <FormControl fullWidth variant="outlined">
                            <InputLabel id="ai-provider-label">AI Provider</InputLabel>
                            <Select
                              labelId="ai-provider-label"
                              name="aiProvider"
                              value={formData.settings?.aiProvider || ''}
                              onChange={handleSettingsChange}
                              label="AI Provider"
                              disabled={aiProviders.length === 0}
                            >
                              {aiProviders.length === 0 ? (
                                <MenuItem value="">No providers available</MenuItem>
                              ) : (
                                aiProviders.map(provider => (
                                  <MenuItem key={provider._id} value={provider._id}>
                                    {provider.name} ({provider.provider} - {provider.model})
                                  </MenuItem>
                                ))
                              )}
                            </Select>
                            {aiProviders.length === 0 && (
                              <Typography variant="caption" color="error">
                                No AI providers configured. Go to AI Settings to add one.
                              </Typography>
                            )}
                          </FormControl>
                        </Grid>
                      )}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </Grid>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          {activeStep === 0 ? (
            <Button onClick={handleCancel}>
              Cancel
            </Button>
          ) : (
            <Button onClick={handleBack} startIcon={<ArrowBackIcon />}>
              Back
            </Button>
          )}
          
          {activeStep === steps.length - 1 ? (
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {isEdit ? 'Update Project' : 'Create Project'}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              endIcon={<ArrowForwardIcon />}
            >
              Next
            </Button>
          )}
        </Box>
      </form>
    </Paper>
  );
};

export default ProjectForm;

// client/src/components/admin/comments/CommentModeration.tsx
import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Tooltip,
  Divider
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Image as ImageIcon,
  SmartToy as AIIcon,
  ModeEdit as EditIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { Comment } from '../../../types/Comment';
import { getCommentsForModeration, moderateComment, aiModerateComment, deleteComment } from '../../../services/commentService';
import CommentDetailDrawer from '../../comments/CommentDetailDrawer';
import { getProjects } from '../../../services/projectService';
import { Project } from '../../../types/Project';

const CommentModeration: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [comments, setComments] = useState<Comment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);
  const [moderationNotes, setModerationNotes] = useState('');
  const [moderationDialogOpen, setModerationDialogOpen] = useState(false);
  const [commentToModerate, setCommentToModerate] = useState<Comment | null>(null);
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject' | null>(null);
  const [aiModerationLoading, setAiModerationLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchProjects();
    fetchComments();
  }, [activeTab, page, pageSize, filterProject]);

  const fetchProjects = async () => {
    try {
      const fetchedProjects = await getProjects();
      setProjects(fetchedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const status = activeTab === 'pending' ? 'pending' : 
                    activeTab === 'approved' ? 'approved' : 'rejected';
                    
      const projectId = filterProject !== 'all' ? filterProject : undefined;
      
      const result = await getCommentsForModeration(
        status, 
        page, 
        pageSize, 
        projectId, 
        searchTerm
      );
      
      setComments(result.comments);
      setTotalComments(result.total);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchComments();
  };

  const handleRefresh = () => {
    fetchComments();
  };

  const handleFilterProjectChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setFilterProject(e.target.value as string);
    setPage(1);
  };

  const handleViewComment = (commentId: string) => {
    setSelectedCommentId(commentId);
  };

  const handleCommentClose = () => {
    setSelectedCommentId(null);
  };

  const handleDeleteClick = (comment: Comment) => {
    setCommentToDelete(comment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!commentToDelete) return;
    
    try {
      await deleteComment(commentToDelete._id);
      setComments(comments.filter(c => c._id !== commentToDelete._id));
      setTotalComments(totalComments - 1);
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment. Please try again.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCommentToDelete(null);
  };

  const handleModerateClick = (comment: Comment, action: 'approve' | 'reject') => {
    setCommentToModerate(comment);
    setModerationAction(action);
    setModerationNotes('');
    setModerationDialogOpen(true);
  };

  const handleModerateConfirm = async () => {
    if (!commentToModerate || !moderationAction) return;
    
    try {
      await moderateComment(
        commentToModerate._id, 
        moderationAction, 
        moderationNotes
      );
      
      // Remove the comment from the list if it's in a different tab
      if (
        (activeTab === 'pending') || 
        (activeTab === 'approved' && moderationAction === 'reject') ||
        (activeTab === 'rejected' && moderationAction === 'approve')
      ) {
        setComments(comments.filter(c => c._id !== commentToModerate._id));
        setTotalComments(totalComments - 1);
      }
      
      setModerationDialogOpen(false);
      setCommentToModerate(null);
      setModerationAction(null);
      setModerationNotes('');
    } catch (error) {
      console.error('Error moderating comment:', error);
      setError('Failed to moderate comment. Please try again.');
    }
  };

  const handleModerateCancel = () => {
    setModerationDialogOpen(false);
    setCommentToModerate(null);
    setModerationAction(null);
    setModerationNotes('');
  };

  const handleAIModerate = async (comment: Comment) => {
    setAiModerationLoading(prev => ({ ...prev, [comment._id]: true }));
    
    try {
      const result = await aiModerateComment(comment._id);
      
      // If the AI approved or rejected the comment, update the list
      if (
        (activeTab === 'pending' && (result.status === 'approved' || result.status === 'rejected')) ||
        (activeTab === 'approved' && result.status === 'rejected') ||
        (activeTab === 'rejected' && result.status === 'approved')
      ) {
        setComments(comments.filter(c => c._id !== comment._id));
        setTotalComments(totalComments - 1);
      }
    } catch (error) {
      console.error('Error AI moderating comment:', error);
      setError('Failed to AI moderate comment. Please try again.');
    } finally {
      setAiModerationLoading(prev => ({ ...prev, [comment._id]: false }));
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Comment Moderation
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab value="pending" label={`Pending (${activeTab === 'pending' ? totalComments : '...'})`} />
          <Tab value="approved" label="Approved" />
          <Tab value="rejected" label="Rejected" />
        </Tabs>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, mb: 3, gap: 2 }}>
          <form onSubmit={handleSearch} style={{ flex: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search comments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button type="submit" variant="contained" size="small">
                      Search
                    </Button>
                  </InputAdornment>
                )
              }}
            />
          </form>
          
          <FormControl variant="outlined" sx={{ minWidth: 200 }}>
            <InputLabel id="project-filter-label">Project</InputLabel>
            <Select
              labelId="project-filter-label"
              value={filterProject}
              onChange={handleFilterProjectChange}
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
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : comments.length === 0 ? (
          <Box sx={{ textAlign: 'center', my: 4 }}>
            <Typography variant="body1">
              {searchTerm || filterProject !== 'all'
                ? 'No comments match your search criteria.'
                : `No ${activeTab} comments found.`}
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Content</TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell width="150">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {comments.map((comment) => (
                    <TableRow key={comment._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <Box sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <Typography noWrap>
                              {comment.content.substring(0, 100)}
                              {comment.content.length > 100 ? '...' : ''}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              {comment.category && (
                                <Chip
                                  label={comment.category}
                                  size="small"
                                  sx={{ textTransform: 'capitalize' }}
                                />
                              )}
                              {comment.images && comment.images.length > 0 && (
                                <Chip
                                  icon={<ImageIcon fontSize="small" />}
                                  label={comment.images.length}
                                  size="small"
                                />
                              )}
                              {comment.aiModerated && (
                                <Tooltip title="AI processed">
                                  <Chip
                                    icon={<AIIcon fontSize="small" />}
                                    label="AI"
                                    size="small"
                                    color={
                                      comment.aiModerationScore && comment.aiModerationScore > 0.8
                                        ? 'success'
                                        : comment.aiModerationScore && comment.aiModerationScore < 0.3
                                        ? 'error'
                                        : 'default'
                                    }
                                  />
                                </Tooltip>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {comment.project.name}
                      </TableCell>
                      <TableCell>
                        {comment.user ? 
                          `${comment.user.firstName} ${comment.user.lastName}` : 
                          comment.anonymousName || 'Anonymous'
                        }
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View">
                            <IconButton 
                              size="small"
                              onClick={() => handleViewComment(comment._id)}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {activeTab === 'pending' && (
                            <>
                              <Tooltip title="Approve">
                                <IconButton 
                                  size="small"
                                  color="success"
                                  onClick={() => handleModerateClick(comment, 'approve')}
                                >
                                  <ApproveIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Reject">
                                <IconButton 
                                  size="small"
                                  color="error"
                                  onClick={() => handleModerateClick(comment, 'reject')}
                                >
                                  <RejectIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="AI Moderate">
                                <IconButton 
                                  size="small"
                                  color="primary"
                                  onClick={() => handleAIModerate(comment)}
                                  disabled={!comment.project.settings?.enableAIModeration || !comment.project.settings?.aiProvider || aiModerationLoading[comment._id]}
                                >
                                  {aiModerationLoading[comment._id] ? (
                                    <CircularProgress size={18} />
                                  ) : (
                                    <AIIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          
                          {activeTab === 'approved' && (
                            <Tooltip title="Reject">
                              <IconButton 
                                size="small"
                                color="error"
                                onClick={() => handleModerateClick(comment, 'reject')}
                              >
                                <RejectIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {activeTab === 'rejected' && (
                            <Tooltip title="Approve">
                              <IconButton 
                                size="small"
                                color="success"
                                onClick={() => handleModerateClick(comment, 'approve')}
                              >
                                <ApproveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          <Tooltip title="Delete">
                            <IconButton 
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(comment)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(totalComments / pageSize)}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          </>
        )}
      </Paper>
      
      {/* Comment Detail Drawer */}
      {selectedCommentId && (
        <CommentDetailDrawer
          commentId={selectedCommentId}
          onClose={handleCommentClose}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Comment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this comment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Moderation Dialog */}
      <Dialog
        open={moderationDialogOpen}
        onClose={handleModerateCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {moderationAction === 'approve' ? 'Approve Comment' : 'Reject Comment'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {moderationAction === 'approve'
              ? 'This comment will be visible to all users.'
              : 'This comment will be hidden from all users.'}
          </DialogContentText>
          
          {commentToModerate && (
            <>
              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle2">
                  {commentToModerate.user
                    ? `${commentToModerate.user.firstName} ${commentToModerate.user.lastName}`
                    : commentToModerate.anonymousName || 'Anonymous'}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1 }}>
                  {formatDistanceToNow(new Date(commentToModerate.createdAt), { addSuffix: true })}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2">
                  {commentToModerate.content}
                </Typography>
              </Paper>
              
              <TextField
                fullWidth
                label="Moderation Notes (optional)"
                multiline
                rows={3}
                value={moderationNotes}
                onChange={(e) => setModerationNotes(e.target.value)}
                variant="outlined"
                placeholder="Add internal notes about why this comment was approved/rejected"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModerateCancel}>Cancel</Button>
          <Button 
            onClick={handleModerateConfirm} 
            color={moderationAction === 'approve' ? 'success' : 'error'}
            variant="contained"
          >
            {moderationAction === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CommentModeration;
