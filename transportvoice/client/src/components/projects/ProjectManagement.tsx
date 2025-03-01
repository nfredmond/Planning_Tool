import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Box, Grid, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  FormControl, InputLabel, MenuItem, Select, Chip, IconButton,
  Tabs, Tab, Card, CardContent, Divider, CircularProgress, Alert,
  Accordion, AccordionSummary, AccordionDetails, LinearProgress
} from '@mui/material';
import {
  Add, Edit, Delete, ExpandMore, FilterList, Search,
  SaveAlt, AssignmentTurnedIn, DirectionsCar, DirectionsBike,
  DirectionsWalk, DirectionsBus, EmojiTransportation, Public,
  AttachMoney, AccessTime, Map, CalendarToday, Timeline
} from '@mui/icons-material';

interface ProjectType {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
}

interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate?: string;
  budget: number;
  status: 'planning' | 'inProgress' | 'completed' | 'cancelled';
  type: string;
  impact: {
    emissionsReduction: number;
    congestionReduction: number;
    safetyImprovement: number;
    accessibilityImprovement: number;
  };
  tasks: ProjectTask[];
  team: TeamMember[];
}

interface ProjectTask {
  id: string;
  name: string;
  description: string;
  status: 'notStarted' | 'inProgress' | 'completed';
  dueDate: string;
  assignedTo?: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
}

const projectTypes: ProjectType[] = [
  { id: 'bikelane', name: 'Bike Lane', description: 'Dedicated lanes for bicycles', icon: <DirectionsBike /> },
  { id: 'buslane', name: 'Bus Lane', description: 'Dedicated lanes for buses', icon: <DirectionsBus /> },
  { id: 'pedestrian', name: 'Pedestrian', description: 'Sidewalks and crossings', icon: <DirectionsWalk /> },
  { id: 'trafficcalm', name: 'Traffic Calming', description: 'Speed reduction measures', icon: <DirectionsCar /> },
  { id: 'transitstation', name: 'Transit Station', description: 'Bus or train stations', icon: <EmojiTransportation /> },
  { id: 'multimodal', name: 'Multi-Modal', description: 'Combined transportation modes', icon: <Map /> }
];

const ProjectManagement: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Dialog states for adding/editing projects
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  
  // Task management dialog
  const [openTaskDialog, setOpenTaskDialog] = useState<boolean>(false);
  const [currentTask, setCurrentTask] = useState<ProjectTask | null>(null);
  const [taskEditMode, setTaskEditMode] = useState<boolean>(false);
  
  // New project form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    budget: 0,
    status: 'planning',
    type: ''
  });
  
  // Sample data for demonstration
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const sampleProjects: Project[] = [
        {
          id: '1',
          name: 'Downtown Bicycle Network',
          description: 'Creating a connected network of protected bike lanes in the downtown area',
          location: 'Downtown',
          startDate: '2025-01-15',
          endDate: '2025-06-30',
          budget: 850000,
          status: 'inProgress',
          type: 'bikelane',
          impact: {
            emissionsReduction: 12,
            congestionReduction: 8,
            safetyImprovement: 15,
            accessibilityImprovement: 10
          },
          tasks: [
            {
              id: 't1',
              name: 'Traffic study',
              description: 'Analyze current traffic patterns',
              status: 'completed',
              dueDate: '2025-01-30'
            },
            {
              id: 't2',
              name: 'Design phase',
              description: 'Design bike lane layouts and intersections',
              status: 'completed',
              dueDate: '2025-02-28'
            },
            {
              id: 't3',
              name: 'Public engagement',
              description: 'Conduct community outreach sessions',
              status: 'inProgress',
              dueDate: '2025-03-15',
              assignedTo: 'Sarah Johnson'
            },
            {
              id: 't4',
              name: 'Construction: Phase 1',
              description: 'Begin construction on Main Street section',
              status: 'inProgress',
              dueDate: '2025-04-30',
              assignedTo: 'Mike Rodriguez'
            },
            {
              id: 't5',
              name: 'Construction: Phase 2',
              description: 'Continue with Oak Avenue section',
              status: 'notStarted',
              dueDate: '2025-05-30'
            }
          ],
          team: [
            {
              id: 'tm1',
              name: 'Sarah Johnson',
              role: 'Project Manager',
              department: 'Transportation Planning'
            },
            {
              id: 'tm2',
              name: 'Mike Rodriguez',
              role: 'Civil Engineer',
              department: 'Infrastructure'
            },
            {
              id: 'tm3',
              name: 'Emily Chen',
              role: 'Community Liaison',
              department: 'Public Engagement'
            }
          ]
        },
        {
          id: '2',
          name: 'Transit Signal Priority System',
          description: 'Implementing signal priority for buses at major intersections',
          location: 'City-wide',
          startDate: '2025-02-01',
          budget: 1200000,
          status: 'planning',
          type: 'buslane',
          impact: {
            emissionsReduction: 8,
            congestionReduction: 12,
            safetyImprovement: 5,
            accessibilityImprovement: 15
          },
          tasks: [
            {
              id: 't1',
              name: 'Intersection analysis',
              description: 'Identify priority intersections',
              status: 'inProgress',
              dueDate: '2025-02-28',
              assignedTo: 'David Wilson'
            },
            {
              id: 't2',
              name: 'Technology selection',
              description: 'Evaluate signal priority technologies',
              status: 'notStarted',
              dueDate: '2025-03-15'
            }
          ],
          team: [
            {
              id: 'tm1',
              name: 'David Wilson',
              role: 'Traffic Engineer',
              department: 'Transportation Planning'
            },
            {
              id: 'tm2',
              name: 'Lisa Park',
              role: 'Transit Coordinator',
              department: 'Public Transit'
            }
          ]
        },
        {
          id: '3',
          name: 'Pedestrian Safety Improvements',
          description: 'Enhancing pedestrian crossings and sidewalks in high-traffic areas',
          location: 'Westside',
          startDate: '2024-11-15',
          endDate: '2025-01-20',
          budget: 450000,
          status: 'completed',
          type: 'pedestrian',
          impact: {
            emissionsReduction: 3,
            congestionReduction: 2,
            safetyImprovement: 20,
            accessibilityImprovement: 18
          },
          tasks: [
            {
              id: 't1',
              name: 'Safety audit',
              description: 'Identify high-risk pedestrian areas',
              status: 'completed',
              dueDate: '2024-11-30'
            },
            {
              id: 't2',
              name: 'Crossing enhancements',
              description: 'Install high-visibility crosswalks',
              status: 'completed',
              dueDate: '2024-12-20'
            },
            {
              id: 't3',
              name: 'Sidewalk repairs',
              description: 'Fix damaged sidewalk sections',
              status: 'completed',
              dueDate: '2025-01-10'
            }
          ],
          team: [
            {
              id: 'tm1',
              name: 'Robert Taylor',
              role: 'Project Manager',
              department: 'Infrastructure'
            },
            {
              id: 'tm2',
              name: 'Aisha Washington',
              role: 'Accessibility Specialist',
              department: 'Planning'
            }
          ]
        }
      ];
      
      setProjects(sampleProjects);
      setLoading(false);
    }, 1500);
  }, []);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const handleFilterChange = (type: 'status' | 'type', value: string) => {
    if (type === 'status') {
      setFilterStatus(value);
    } else {
      setFilterType(value);
    }
  };
  
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesType = filterType === 'all' || project.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'info';
      case 'inProgress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'inProgress':
        return 'In Progress';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  const handleOpenDialog = (edit: boolean = false, project: Project | null = null) => {
    setEditMode(edit);
    setCurrentProject(project);
    
    if (edit && project) {
      setFormData({
        name: project.name,
        description: project.description,
        location: project.location,
        startDate: project.startDate,
        endDate: project.endDate || '',
        budget: project.budget,
        status: project.status,
        type: project.type
      });
    } else {
      // Reset form for new project
      setFormData({
        name: '',
        description: '',
        location: '',
        startDate: '',
        endDate: '',
        budget: 0,
        status: 'planning',
        type: ''
      });
    }
    
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSaveProject = () => {
    // Validation would go here
    
    if (editMode && currentProject) {
      // Update existing project
      const updatedProjects = projects.map(p => 
        p.id === currentProject.id 
          ? { 
              ...p, 
              ...formData,
              budget: Number(formData.budget) 
            } 
          : p
      );
      setProjects(updatedProjects as Project[]);
    } else {
      // Add new project
      const newProject: Project = {
        id: Date.now().toString(),
        ...formData,
        budget: Number(formData.budget),
        status: 'planning', // Ensure status is set to a valid value
        impact: {
          emissionsReduction: Math.floor(Math.random() * 20),
          congestionReduction: Math.floor(Math.random() * 20),
          safetyImprovement: Math.floor(Math.random() * 20),
          accessibilityImprovement: Math.floor(Math.random() * 20)
        },
        tasks: [],
        team: []
      };
      
      setProjects([...projects, newProject]);
    }
    
    setOpenDialog(false);
  };
  
  const handleDeleteProject = (id: string) => {
    const updatedProjects = projects.filter(p => p.id !== id);
    setProjects(updatedProjects);
  };
  
  const calculateProgress = (project: Project) => {
    if (project.tasks.length === 0) return 0;
    
    const completedTasks = project.tasks.filter(t => t.status === 'completed').length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };
  
  const getProjectType = (typeId: string) => {
    return projectTypes.find(type => type.id === typeId) || projectTypes[0];
  };
  
  // Loading state
  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box mt={3} mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          <Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />
          Transportation Project Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Plan, track, and manage transportation improvement projects
        </Typography>
      </Box>
      
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <TextField
            placeholder="Search projects..."
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ width: '300px' }}
          />
          <Box>
            <FormControl size="small" sx={{ minWidth: 150, mr: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="planning">Planning</MenuItem>
                <MenuItem value="inProgress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 150, mr: 2 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                label="Type"
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                {projectTypes.map(type => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              New Project
            </Button>
          </Box>
        </Box>
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ mb: 3 }}
        >
          <Tab label="All Projects" />
          <Tab label="Planning" />
          <Tab label="In Progress" />
          <Tab label="Completed" />
        </Tabs>
        
        {filteredProjects.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No projects match your search criteria. Try adjusting your filters or create a new project.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>Budget</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProjects.map((project) => {
                  const projectType = getProjectType(project.type);
                  const progress = calculateProgress(project);
                  
                  return (
                    <TableRow key={project.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {projectType.icon}
                          <Typography sx={{ ml: 1 }}>
                            {project.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{projectType.name}</TableCell>
                      <TableCell>{project.location}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusLabel(project.status)} 
                          color={getStatusColor(project.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>${project.budget.toLocaleString()}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress variant="determinate" value={progress} />
                          </Box>
                          <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" color="text.secondary">{progress}%</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(true, project)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      
      {/* Project Details Section */}
      {filteredProjects.length > 0 && (
        <Typography variant="h5" gutterBottom>
          Project Details
        </Typography>
      )}
      
      {filteredProjects.map((project) => (
        <Accordion key={project.id} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>{project.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1" paragraph>
                  {project.description}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      <CalendarToday fontSize="small" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                      Start Date:
                    </Typography>
                    <Typography variant="body2">
                      {new Date(project.startDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      <CalendarToday fontSize="small" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                      End Date:
                    </Typography>
                    <Typography variant="body2">
                      {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'TBD'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      <Map fontSize="small" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                      Location:
                    </Typography>
                    <Typography variant="body2">
                      {project.location}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      <AttachMoney fontSize="small" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                      Budget:
                    </Typography>
                    <Typography variant="body2">
                      ${project.budget.toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    Impact Assessment
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">
                            <Public fontSize="small" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                            Emissions Reduction
                          </Typography>
                          <Typography variant="h6">
                            {project.impact.emissionsReduction}%
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">
                            <DirectionsCar fontSize="small" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                            Congestion Reduction
                          </Typography>
                          <Typography variant="h6">
                            {project.impact.congestionReduction}%
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">
                            <AssignmentTurnedIn fontSize="small" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                            Safety Improvement
                          </Typography>
                          <Typography variant="h6">
                            {project.impact.safetyImprovement}%
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">
                            <DirectionsWalk fontSize="small" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                            Accessibility Improvement
                          </Typography>
                          <Typography variant="h6">
                            {project.impact.accessibilityImprovement}%
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" gutterBottom>
                    Tasks
                  </Typography>
                  <Button 
                    size="small" 
                    startIcon={<Add />}
                  >
                    Add Task
                  </Button>
                </Box>
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Task</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Assigned To</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {project.tasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell>{task.name}</TableCell>
                          <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Chip 
                              label={task.status === 'notStarted' ? 'Not Started' : 
                                    task.status === 'inProgress' ? 'In Progress' : 'Completed'} 
                              color={task.status === 'completed' ? 'success' : 
                                    task.status === 'inProgress' ? 'warning' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{task.assignedTo || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    Team Members
                  </Typography>
                  {project.team.map((member) => (
                    <Box 
                      key={member.id} 
                      p={2} 
                      mb={1} 
                      sx={{ 
                        border: '1px solid #eee',
                        borderRadius: 1
                      }}
                    >
                      <Typography variant="subtitle1">
                        {member.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {member.role} • {member.department}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
      
      {/* Add/Edit Project Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Project' : 'Create New Project'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Project Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Project Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  label="Project Type"
                  onChange={handleSelectChange}
                >
                  {projectTypes.map(type => (
                    <MenuItem key={type.id} value={type.id}>
                      <Box display="flex" alignItems="center">
                        {type.icon}
                        <Box ml={1}>{type.name}</Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="End Date (Optional)"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Budget ($)"
                name="budget"
                type="number"
                value={formData.budget}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  label="Status"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="planning">Planning</MenuItem>
                  <MenuItem value="inProgress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveProject} 
            variant="contained"
            color="primary"
            startIcon={<SaveAlt />}
          >
            {editMode ? 'Update Project' : 'Create Project'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectManagement; 