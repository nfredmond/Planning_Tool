import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardHeader,
  CardActions,
  Button,
  IconButton,
  Divider,
  Chip,
  Avatar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Visibility as ViewIcon,
  Share as ShareIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Search as SearchIcon,
  Map as MapIcon,
  People as TeamIcon,
  CalendarToday as DateIcon,
  Description as DescriptionIcon,
  Timeline as TimelineIcon,
  Folder as FolderIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ProjectSetupWizard from '../components/projects/ProjectSetupWizard';

interface ProjectMember {
  id: number;
  name: string;
  role: string;
  avatar?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'completed' | 'archived';
  type: 'transportation' | 'urban' | 'environmental' | 'mixed';
  thumbnail?: string;
  createdAt: string;
  modifiedAt: string;
  scenarios: number;
  members: ProjectMember[];
  isStarred?: boolean;
  progress?: number;
}

const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Downtown Revitalization Plan',
    description: 'Comprehensive plan to revitalize the downtown area with improved transportation options, pedestrian spaces, and mixed-use development.',
    status: 'active',
    type: 'urban',
    thumbnail: 'https://images.unsplash.com/photo-1486693326701-a2b3f6aef664?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    createdAt: '2023-05-15',
    modifiedAt: '2023-09-22',
    scenarios: 5,
    members: [
      { id: 1, name: 'John Smith', role: 'Project Manager' },
      { id: 2, name: 'Emily Johnson', role: 'Transportation Planner' },
      { id: 3, name: 'Michael Chen', role: 'Urban Designer' },
    ],
    isStarred: true,
    progress: 65,
  },
  {
    id: 'proj-2',
    name: 'Westside Transit Corridor',
    description: 'Planning and assessment for a new light rail transit corridor connecting western neighborhoods to downtown.',
    status: 'active',
    type: 'transportation',
    thumbnail: 'https://images.unsplash.com/photo-1551225183-94acb7d595b6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    createdAt: '2023-06-10',
    modifiedAt: '2023-09-18',
    scenarios: 3,
    members: [
      { id: 1, name: 'John Smith', role: 'Project Manager' },
      { id: 4, name: 'Sarah Wilson', role: 'Transportation Engineer' },
    ],
    progress: 40,
  },
  {
    id: 'proj-3',
    name: 'Bike Lane Network Expansion',
    description: 'Strategic plan to expand the city-wide bike lane network to improve connectivity and safety for cyclists.',
    status: 'draft',
    type: 'transportation',
    thumbnail: 'https://images.unsplash.com/photo-1519806390608-61b7f84bb10c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    createdAt: '2023-08-05',
    modifiedAt: '2023-09-01',
    scenarios: 2,
    members: [
      { id: 2, name: 'Emily Johnson', role: 'Transportation Planner' },
      { id: 5, name: 'David Brown', role: 'Public Engagement Specialist' },
    ],
    progress: 20,
  },
  {
    id: 'proj-4',
    name: 'North County Transportation Plan',
    description: 'Comprehensive transportation plan for the north county region addressing roads, transit, and active transportation.',
    status: 'completed',
    type: 'transportation',
    thumbnail: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    createdAt: '2023-02-10',
    modifiedAt: '2023-07-15',
    scenarios: 4,
    members: [
      { id: 1, name: 'John Smith', role: 'Project Manager' },
      { id: 2, name: 'Emily Johnson', role: 'Transportation Planner' },
      { id: 6, name: 'Robert Martinez', role: 'Traffic Engineer' },
    ],
    isStarred: true,
    progress: 100,
  },
  {
    id: 'proj-5',
    name: 'Green Infrastructure Implementation',
    description: 'Plan for implementing green infrastructure throughout the city to improve stormwater management and environmental quality.',
    status: 'active',
    type: 'environmental',
    thumbnail: 'https://images.unsplash.com/photo-1518005068251-37900150dfca?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    createdAt: '2023-07-01',
    modifiedAt: '2023-09-10',
    scenarios: 3,
    members: [
      { id: 7, name: 'Jessica Taylor', role: 'Environmental Planner' },
      { id: 8, name: 'Thomas Lee', role: 'Landscape Architect' },
    ],
    progress: 30,
  },
  {
    id: 'proj-6',
    name: 'Mixed-Use Corridor Redevelopment',
    description: 'Redevelopment plan for a major corridor to incorporate mixed-use development, transit, and pedestrian improvements.',
    status: 'draft',
    type: 'mixed',
    thumbnail: 'https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    createdAt: '2023-08-20',
    modifiedAt: '2023-09-05',
    scenarios: 2,
    members: [
      { id: 3, name: 'Michael Chen', role: 'Urban Designer' },
      { id: 9, name: 'Amanda Garcia', role: 'Economic Development Specialist' },
    ],
    progress: 15,
  },
];

interface ProjectsPageProps {
  initialTab?: string;
}

const tabMapping: Record<string, number> = {
  active: 0,
  archived: 1,
  featured: 0,
  'near-me': 0,
  recent: 0,
};

const ProjectsPage: React.FC<ProjectsPageProps> = ({ initialTab }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(mockProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('modifiedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });
  const [tabValue, setTabValue] = useState(tabMapping[initialTab || 'active'] || 0);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    type: 'transportation',
  });
  const [useWizard, setUseWizard] = useState(true);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  // Initialize tab based on initialTab prop if provided
  useEffect(() => {
    if (initialTab) {
      switch(initialTab) {
        case 'featured':
          // Apply filters for featured projects (e.g., starred ones)
          setFilteredProjects(projects.filter(project => project.isStarred));
          break;
        case 'near-me':
          // This would normally use geolocation to filter projects
          // For now we'll just show a sample
          setFilteredProjects(projects.filter(project => 
            project.id === 'proj-1' || project.id === 'proj-5'));
          break;
        case 'recent':
          // Sort by recently modified
          setSortBy('modifiedAt');
          setSortDirection('desc');
          setFilteredProjects([...projects].sort((a, b) => 
            new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()));
          break;
        default:
          // Default behavior
          setFilteredProjects(projects);
      }
    }
  }, [initialTab, projects]);

  // Filter and sort projects when criteria change
  useEffect(() => {
    let result = [...projects];
    
    // Apply search filter
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      result = result.filter(project => 
        project.name.toLowerCase().includes(lowerCaseQuery) ||
        project.description.toLowerCase().includes(lowerCaseQuery)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(project => project.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(project => project.type === typeFilter);
    }
    
    // Apply tab filter (active/archived)
    if (tabValue === 0) {
      result = result.filter(project => project.status !== 'archived');
    } else {
      result = result.filter(project => project.status === 'archived');
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'name':
          valueA = a.name;
          valueB = b.name;
          break;
        case 'createdAt':
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
          break;
        case 'modifiedAt':
          valueA = new Date(a.modifiedAt).getTime();
          valueB = new Date(b.modifiedAt).getTime();
          break;
        case 'scenarios':
          valueA = a.scenarios;
          valueB = b.scenarios;
          break;
        default:
          valueA = a.name;
          valueB = b.name;
      }
      
      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    setFilteredProjects(result);
  }, [projects, searchQuery, statusFilter, typeFilter, sortBy, sortDirection, tabValue]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateProject = () => {
    if (!newProject.name || !newProject.description) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error',
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newId = `proj-${Date.now()}`;
      const currentDate = new Date().toISOString().split('T')[0];
      
      const createdProject: Project = {
        id: newId,
        name: newProject.name,
        description: newProject.description,
        type: newProject.type as any,
        status: 'draft',
        createdAt: currentDate,
        modifiedAt: currentDate,
        scenarios: 0,
        members: [],
        progress: 0,
      };
      
      setProjects([createdProject, ...projects]);
      setNewProject({
        name: '',
        description: '',
        type: 'transportation',
      });
      
      setIsCreateDialogOpen(false);
      setIsLoading(false);
      
      setSnackbar({
        open: true,
        message: 'Project created successfully',
        severity: 'success',
      });
    }, 1000);
  };

  const handleCreateProjectFromWizard = (projectData: any) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newId = `proj-${Date.now()}`;
      const currentDate = new Date().toISOString().split('T')[0];
      
      const createdProject: Project = {
        id: newId,
        name: projectData.title,
        description: projectData.description,
        type: projectData.type as any,
        status: 'draft',
        createdAt: currentDate,
        modifiedAt: currentDate,
        scenarios: 0,
        members: [],
        progress: 0,
      };
      
      setProjects([createdProject, ...projects]);
      
      setIsCreateDialogOpen(false);
      setIsLoading(false);
      
      setSnackbar({
        open: true,
        message: 'Project created successfully with map configuration',
        severity: 'success',
      });

      // Navigate to the project details page
      navigate(`/project/${newId}`);
    }, 1000);
  };

  const handleDeleteProject = () => {
    if (!selectedProject) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setProjects(projects.filter(project => project.id !== selectedProject.id));
      setIsDeleteDialogOpen(false);
      setSelectedProject(null);
      setIsLoading(false);
      
      setSnackbar({
        open: true,
        message: 'Project deleted successfully',
        severity: 'success',
      });
    }, 1000);
  };

  const handleStarProject = (project: Project) => {
    setProjects(projects.map(p => 
      p.id === project.id ? { ...p, isStarred: !p.isStarred } : p
    ));
  };

  const handleArchiveProject = (project: Project) => {
    setProjects(projects.map(p => 
      p.id === project.id ? { ...p, status: 'archived' } : p
    ));
    
    setSnackbar({
      open: true,
      message: `Project "${project.name}" has been archived`,
      severity: 'success',
    });
  };

  const handleRestoreProject = (project: Project) => {
    setProjects(projects.map(p => 
      p.id === project.id ? { ...p, status: 'draft' } : p
    ));
    
    setSnackbar({
      open: true,
      message: `Project "${project.name}" has been restored`,
      severity: 'success',
    });
  };

  const handleOpenProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'active':
        return <Chip size="small" label="Active" color="success" />;
      case 'draft':
        return <Chip size="small" label="Draft" color="primary" variant="outlined" />;
      case 'completed':
        return <Chip size="small" label="Completed" color="info" />;
      case 'archived':
        return <Chip size="small" label="Archived" color="default" />;
      default:
        return <Chip size="small" label={status} />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'transportation':
        return <MapIcon />;
      case 'urban':
        return <FolderIcon />;
      case 'environmental':
        return <DescriptionIcon />;
      case 'mixed':
        return <TimelineIcon />;
      default:
        return <FolderIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsCreateDialogOpen(true)}
        >
          Create Project
        </Button>
      </Box>
      
      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        sx={{ mb: 3 }}
      >
        <Tab label="Active Projects" />
        <Tab label="Archive" />
      </Tabs>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={6} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                {tabValue === 1 && <MenuItem value="archived">Archived</MenuItem>}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="type-filter-label">Type</InputLabel>
              <Select
                labelId="type-filter-label"
                value={typeFilter}
                label="Type"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="transportation">Transportation</MenuItem>
                <MenuItem value="urban">Urban</MenuItem>
                <MenuItem value="environmental">Environmental</MenuItem>
                <MenuItem value="mixed">Mixed-Use</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-by-label">Sort By</InputLabel>
              <Select
                labelId="sort-by-label"
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="createdAt">Date Created</MenuItem>
                <MenuItem value="modifiedAt">Last Modified</MenuItem>
                <MenuItem value="scenarios">Scenarios</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-direction-label">Direction</InputLabel>
              <Select
                labelId="sort-direction-label"
                value={sortDirection}
                label="Direction"
                onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {filteredProjects.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <FolderIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            No projects found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filters, or create a new project.
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            startIcon={<AddIcon />}
            onClick={() => setIsCreateDialogOpen(true)}
          >
            Create Project
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {project.thumbnail && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={project.thumbnail}
                    alt={project.name}
                  />
                )}
                <CardHeader
                  title={project.name}
                  subheader={
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                      {getStatusChip(project.status)}
                      <Chip 
                        size="small" 
                        label={project.type.charAt(0).toUpperCase() + project.type.slice(1)} 
                        icon={getTypeIcon(project.type)}
                        variant="outlined"
                      />
                    </Box>
                  }
                  action={
                    <IconButton onClick={() => handleStarProject(project)}>
                      {project.isStarred ? 
                        <StarIcon color="warning" /> : 
                        <StarBorderIcon />
                      }
                    </IconButton>
                  }
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {project.description.length > 120 
                      ? `${project.description.substring(0, 120)}...` 
                      : project.description
                    }
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <DateIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Last modified: {new Date(project.modifiedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <MapIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {project.scenarios} scenarios
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TeamIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {project.members.length} team members
                    </Typography>
                  </Box>
                  
                  {/* Team members */}
                  {project.members.length > 0 && (
                    <Box sx={{ display: 'flex', mt: 2 }}>
                      {project.members.slice(0, 3).map((member, index) => (
                        <Tooltip key={member.id} title={`${member.name} (${member.role})`}>
                          <Avatar 
                            sx={{ 
                              width: 30, 
                              height: 30,
                              ml: index > 0 ? -0.5 : 0,
                              border: '2px solid #fff',
                            }}
                          >
                            {member.name.charAt(0)}
                          </Avatar>
                        </Tooltip>
                      ))}
                      {project.members.length > 3 && (
                        <Avatar 
                          sx={{ 
                            width: 30, 
                            height: 30, 
                            ml: -0.5,
                            border: '2px solid #fff',
                            bgcolor: 'primary.main',
                          }}
                        >
                          +{project.members.length - 3}
                        </Avatar>
                      )}
                    </Box>
                  )}
                </CardContent>
                <Divider />
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<ViewIcon />}
                    onClick={() => handleOpenProject(project.id)}
                  >
                    Open
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />}
                  >
                    Edit
                  </Button>
                  {tabValue === 0 ? (
                    <Button 
                      size="small" 
                      color="warning"
                      startIcon={<ArchiveIcon />}
                      onClick={() => handleArchiveProject(project)}
                    >
                      Archive
                    </Button>
                  ) : (
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => handleRestoreProject(project)}
                    >
                      Restore
                    </Button>
                  )}
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => {
                      setSelectedProject(project);
                      setIsDeleteDialogOpen(true);
                    }}
                    sx={{ ml: 'auto' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Create Project Dialog */}
      <Dialog 
        open={isCreateDialogOpen} 
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth={useWizard ? "lg" : "sm"}
        fullWidth
        fullScreen={useWizard && fullScreen}
      >
        {!useWizard ? (
          <>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Project Name"
                fullWidth
                required
                value={newProject.name}
                onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                sx={{ mb: 2, mt: 1 }}
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Project Type</InputLabel>
                <Select
                  value={newProject.type}
                  label="Project Type"
                  onChange={(e) => setNewProject({...newProject, type: e.target.value})}
                >
                  <MenuItem value="transportation">Transportation</MenuItem>
                  <MenuItem value="urban">Urban Design</MenuItem>
                  <MenuItem value="environmental">Environmental</MenuItem>
                  <MenuItem value="mixed">Mixed-Use</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                margin="dense"
                label="Description"
                fullWidth
                multiline
                rows={4}
                required
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                sx={{ mt: 2 }}
              />
              
              <Box sx={{ mt: 3, mb: 1 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => setUseWizard(true)}
                  startIcon={<MapIcon />}
                  fullWidth
                >
                  Use Advanced Setup Wizard Instead
                </Button>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleCreateProject} 
                variant="contained"
                disabled={!newProject.name || !newProject.description || isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Create'}
              </Button>
            </DialogActions>
          </>
        ) : (
          <Box>
            <DialogTitle sx={{ p: 2, pb: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Create New Project</Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => setUseWizard(false)}
                >
                  Simple Form
                </Button>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
              <ProjectSetupWizard 
                onComplete={handleCreateProjectFromWizard}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Box>
        )}
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the project "{selectedProject?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteProject} 
            color="error"
            variant="contained"
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectsPage; 