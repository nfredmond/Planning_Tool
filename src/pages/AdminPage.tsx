import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Map as MapIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  DataUsage as DataIcon,
  Layers as LayersIcon,
  Comment as FeedbackIcon,
  Dashboard as DashboardIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import MapView from '../components/map/MapView';
import LayerControls from '../components/map/LayerControls';

// Mock data
const mockMapLayers = [
  {
    id: 'roads',
    name: 'Roads',
    category: 'transportation',
    visible: true,
    type: 'line',
    source: 'vector',
  },
  {
    id: 'bikeways',
    name: 'Bike Lanes',
    category: 'transportation',
    visible: true,
    type: 'line',
    source: 'vector',
  },
  {
    id: 'transit',
    name: 'Transit Routes',
    category: 'transportation',
    visible: false,
    type: 'line',
    source: 'vector',
  },
  {
    id: 'demographics',
    name: 'Demographics',
    category: 'demographic',
    visible: false,
    type: 'polygon',
    source: 'vector',
  },
  {
    id: 'feedback',
    name: 'User Feedback',
    category: 'community',
    visible: true,
    type: 'point',
    source: 'api',
  },
];

const mockUsers = [
  { id: 1, name: 'John Smith', email: 'john@example.com', role: 'admin', active: true },
  { id: 2, name: 'Emily Johnson', email: 'emily@example.com', role: 'planner', active: true },
  { id: 3, name: 'Michael Chen', email: 'michael@example.com', role: 'viewer', active: false },
  { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'planner', active: true },
];

const mockProjects = [
  { 
    id: 'proj-1', 
    name: 'Downtown Revitalization', 
    scenarios: 5, 
    lastModified: '2023-09-15',
    status: 'active',
  },
  { 
    id: 'proj-2', 
    name: 'Westside Transit Corridor', 
    scenarios: 3, 
    lastModified: '2023-08-22',
    status: 'active',
  },
  { 
    id: 'proj-3', 
    name: 'Bike Lane Network Expansion', 
    scenarios: 2, 
    lastModified: '2023-10-01',
    status: 'draft',
  },
  { 
    id: 'proj-4', 
    name: 'North County Transportation Plan', 
    scenarios: 4, 
    lastModified: '2023-07-10',
    status: 'completed',
  },
];

const mockLayerTypes = [
  { id: 'line', name: 'Line' },
  { id: 'polygon', name: 'Polygon' },
  { id: 'point', name: 'Point' },
  { id: 'raster', name: 'Raster' },
];

const mockLayerSources = [
  { id: 'vector', name: 'Vector Tiles' },
  { id: 'api', name: 'API Data' },
  { id: 'geojson', name: 'GeoJSON' },
  { id: 'wms', name: 'WMS' },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && (
        <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [layers, setLayers] = useState(mockMapLayers);
  const [users, setUsers] = useState(mockUsers);
  const [projects, setProjects] = useState(mockProjects);
  const [isAddingLayer, setIsAddingLayer] = useState(false);
  const [newLayer, setNewLayer] = useState({
    name: '',
    category: 'transportation',
    type: 'line',
    source: 'vector',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleLayerVisibilityToggle = (layerId: string) => {
    setLayers(prevLayers => 
      prevLayers.map(layer => 
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    );
    
    showSnackbar(`Layer ${layers.find(l => l.id === layerId)?.visible ? 'hidden' : 'shown'}: ${layers.find(l => l.id === layerId)?.name}`, 'success');
  };

  const handleDeleteLayer = (layerId: string) => {
    const layerName = layers.find(l => l.id === layerId)?.name;
    setLayers(prevLayers => prevLayers.filter(layer => layer.id !== layerId));
    showSnackbar(`Layer deleted: ${layerName}`, 'success');
  };

  const handleAddLayer = () => {
    if (!newLayer.name) return;
    
    setIsLoading(true);
    
    // Simulate API request
    setTimeout(() => {
      const newLayerId = `layer-${Date.now()}`;
      
      setLayers([
        ...layers,
        {
          id: newLayerId,
          name: newLayer.name,
          category: newLayer.category,
          type: newLayer.type,
          source: newLayer.source,
          visible: true,
        }
      ]);
      
      setNewLayer({
        name: '',
        category: 'transportation',
        type: 'line',
        source: 'vector',
      });
      
      setIsAddingLayer(false);
      setIsLoading(false);
      
      showSnackbar(`Layer added: ${newLayer.name}`, 'success');
    }, 800);
  };

  const handleUserStatusToggle = (userId: number) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, active: !user.active } : user
      )
    );
    
    const user = users.find(u => u.id === userId);
    showSnackbar(`User ${user?.active ? 'deactivated' : 'activated'}: ${user?.name}`, 'success');
  };

  const handleDeleteUser = (userId: number) => {
    const userName = users.find(u => u.id === userId)?.name;
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    showSnackbar(`User deleted: ${userName}`, 'success');
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h5" component="h1">
          Administration Panel
        </Typography>
      </Box>
      
      {/* Main content */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Tabs */}
        <Box sx={{ borderRight: 1, borderColor: 'divider', width: 200 }}>
          <Tabs
            orientation="vertical"
            value={activeTab}
            onChange={handleTabChange}
            sx={{ borderRight: 1, borderColor: 'divider' }}
          >
            <Tab icon={<DashboardIcon />} label="Dashboard" />
            <Tab icon={<MapIcon />} label="Map Layers" />
            <Tab icon={<PeopleIcon />} label="Users" />
            <Tab icon={<DataIcon />} label="Projects" />
            <Tab icon={<SettingsIcon />} label="Settings" />
          </Tabs>
        </Box>
        
        {/* Tab content */}
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          {/* Dashboard Tab */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader title="Map Preview" />
                  <Divider />
                  <CardContent sx={{ height: 400 }}>
                    <MapView />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader 
                    title="Active Layers" 
                    action={
                      <Button 
                        size="small" 
                        startIcon={<LayersIcon />}
                        onClick={() => setActiveTab(1)}
                      >
                        Manage
                      </Button>
                    }
                  />
                  <Divider />
                  <CardContent sx={{ maxHeight: 400, overflow: 'auto' }}>
                    <List dense>
                      {layers.filter(layer => layer.visible).map(layer => (
                        <ListItem key={layer.id}>
                          <ListItemIcon>
                            <LayersIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary={layer.name} 
                            secondary={`${layer.category} (${layer.type})`} 
                          />
                        </ListItem>
                      ))}
                      {layers.filter(layer => layer.visible).length === 0 && (
                        <ListItem>
                          <ListItemText primary="No active layers" />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader 
                    title="Recent User Feedback" 
                    action={
                      <Button size="small">View All</Button>
                    }
                  />
                  <Divider />
                  <CardContent sx={{ maxHeight: 300, overflow: 'auto' }}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <FeedbackIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Need more bike lanes on Main St" 
                          secondary="Sarah Johnson • 2 hours ago" 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <FeedbackIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="When will the transit expansion begin?" 
                          secondary="Michael Chen • 3 hours ago" 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <FeedbackIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Concerns about parking availability" 
                          secondary="Robert Smith • 5 hours ago" 
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader 
                    title="Active Projects" 
                    action={
                      <Button 
                        size="small"
                        onClick={() => setActiveTab(3)}
                      >
                        View All
                      </Button>
                    }
                  />
                  <Divider />
                  <CardContent sx={{ maxHeight: 300, overflow: 'auto' }}>
                    <List dense>
                      {projects
                        .filter(project => project.status === 'active')
                        .map(project => (
                          <ListItem key={project.id}>
                            <ListItemIcon>
                              <DataIcon />
                            </ListItemIcon>
                            <ListItemText 
                              primary={project.name} 
                              secondary={`${project.scenarios} scenarios • Last modified: ${project.lastModified}`} 
                            />
                          </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
          
          {/* Map Layers Tab */}
          <TabPanel value={activeTab} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      Available Map Layers
                    </Typography>
                    <Button 
                      variant="contained" 
                      startIcon={<AddIcon />}
                      onClick={() => setIsAddingLayer(true)}
                    >
                      Add Layer
                    </Button>
                  </Box>
                  
                  <List>
                    {layers.map(layer => (
                      <ListItem 
                        key={layer.id}
                        secondaryAction={
                          <Box>
                            <IconButton 
                              edge="end" 
                              aria-label="toggle visibility"
                              onClick={() => handleLayerVisibilityToggle(layer.id)}
                            >
                              {layer.visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                            </IconButton>
                            <IconButton 
                              edge="end" 
                              aria-label="edit"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              edge="end" 
                              aria-label="delete"
                              onClick={() => handleDeleteLayer(layer.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        }
                      >
                        <ListItemIcon>
                          <LayersIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {layer.name}
                              <Chip 
                                label={layer.category} 
                                size="small" 
                                sx={{ ml: 1 }} 
                              />
                            </Box>
                          }
                          secondary={`Type: ${layer.type} • Source: ${layer.source}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                  
                  {isAddingLayer && (
                    <Box sx={{ mt: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Add New Layer
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Layer Name"
                            value={newLayer.name}
                            onChange={(e) => setNewLayer({...newLayer, name: e.target.value})}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                              value={newLayer.category}
                              label="Category"
                              onChange={(e) => setNewLayer({...newLayer, category: e.target.value})}
                            >
                              <MenuItem value="transportation">Transportation</MenuItem>
                              <MenuItem value="demographic">Demographics</MenuItem>
                              <MenuItem value="environmental">Environmental</MenuItem>
                              <MenuItem value="community">Community</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth>
                            <InputLabel>Layer Type</InputLabel>
                            <Select
                              value={newLayer.type}
                              label="Layer Type"
                              onChange={(e) => setNewLayer({...newLayer, type: e.target.value})}
                            >
                              {mockLayerTypes.map(type => (
                                <MenuItem key={type.id} value={type.id}>
                                  {type.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth>
                            <InputLabel>Data Source</InputLabel>
                            <Select
                              value={newLayer.source}
                              label="Data Source"
                              onChange={(e) => setNewLayer({...newLayer, source: e.target.value})}
                            >
                              {mockLayerSources.map(source => (
                                <MenuItem key={source.id} value={source.id}>
                                  {source.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button 
                              sx={{ mr: 1 }}
                              onClick={() => setIsAddingLayer(false)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              variant="contained"
                              onClick={handleAddLayer}
                              disabled={!newLayer.name || isLoading}
                              startIcon={isLoading ? <CircularProgress size={20} /> : null}
                            >
                              Add Layer
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={5}>
                <Paper variant="outlined" sx={{ height: '100%' }}>
                  <Box sx={{ height: 300 }}>
                    <MapView />
                  </Box>
                  <Divider />
                  <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Configure Layers
                    </Typography>
                    <LayerControls />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>
          
          {/* Users Tab */}
          <TabPanel value={activeTab} index={2}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  User Management
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                >
                  Add User
                </Button>
              </Box>
              
              <List>
                {users.map(user => (
                  <ListItem 
                    key={user.id}
                    secondaryAction={
                      <Box>
                        <Switch
                          edge="end"
                          checked={user.active}
                          onChange={() => handleUserStatusToggle(user.id)}
                        />
                        <IconButton 
                          edge="end" 
                          aria-label="edit"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          edge="end" 
                          aria-label="delete"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemIcon>
                      <PeopleIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {user.name}
                          <Chip 
                            label={user.role} 
                            color={
                              user.role === 'admin' ? 'error' : 
                              user.role === 'planner' ? 'primary' : 
                              'default'
                            }
                            size="small" 
                            sx={{ ml: 1 }} 
                          />
                          {!user.active && (
                            <Chip 
                              label="Inactive" 
                              color="default"
                              size="small" 
                              sx={{ ml: 1 }} 
                            />
                          )}
                        </Box>
                      }
                      secondary={user.email}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </TabPanel>
          
          {/* Projects Tab */}
          <TabPanel value={activeTab} index={3}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  Projects
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                >
                  Create Project
                </Button>
              </Box>
              
              <Grid container spacing={3}>
                {projects.map(project => (
                  <Grid item xs={12} sm={6} md={4} key={project.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" component="div">
                          {project.name}
                        </Typography>
                        <Box sx={{ mt: 1, mb: 2 }}>
                          <Chip 
                            label={project.status} 
                            color={
                              project.status === 'active' ? 'success' : 
                              project.status === 'draft' ? 'warning' : 
                              'default'
                            }
                            size="small" 
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {project.scenarios} scenarios
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Last modified: {project.lastModified}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small">Open</Button>
                        <Button size="small">Edit</Button>
                        <Button size="small" color="error">Delete</Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </TabPanel>
          
          {/* Settings Tab */}
          <TabPanel value={activeTab} index={4}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Application Settings
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardHeader title="Map Configuration" />
                    <Divider />
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
                        Homepage Map Settings
                      </Typography>
                      
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Default Map View</InputLabel>
                            <Select
                              value="city"
                              label="Default Map View"
                            >
                              <MenuItem value="city">City Center</MenuItem>
                              <MenuItem value="region">Regional View</MenuItem>
                              <MenuItem value="custom">Custom Area</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel>Base Map Style</InputLabel>
                            <Select
                              value="streets"
                              label="Base Map Style"
                            >
                              <MenuItem value="streets">Streets</MenuItem>
                              <MenuItem value="light">Light</MenuItem>
                              <MenuItem value="dark">Dark</MenuItem>
                              <MenuItem value="satellite">Satellite</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Initial Zoom Level"
                            type="number"
                            InputProps={{ inputProps: { min: 1, max: 20 } }}
                            defaultValue={10}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Default Latitude"
                            type="number"
                            InputProps={{ 
                              inputProps: { 
                                step: 0.000001,
                                min: -90,
                                max: 90
                              } 
                            }}
                            defaultValue={40.7128}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Default Longitude"
                            type="number"
                            InputProps={{ 
                              inputProps: { 
                                step: 0.000001,
                                min: -180,
                                max: 180
                              } 
                            }}
                            defaultValue={-74.006}
                          />
                        </Grid>
                      </Grid>

                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
                        Default Project Map Settings
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Default Project Base Map</InputLabel>
                            <Select
                              value="streets"
                              label="Default Project Base Map"
                            >
                              <MenuItem value="streets">Streets</MenuItem>
                              <MenuItem value="light">Light</MenuItem>
                              <MenuItem value="dark">Dark</MenuItem>
                              <MenuItem value="satellite">Satellite</MenuItem>
                              <MenuItem value="outdoors">Outdoors</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Default Project Zoom Level"
                            type="number"
                            InputProps={{ inputProps: { min: 1, max: 20 } }}
                            defaultValue={12}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel>Default Layer Visibility</InputLabel>
                            <Select
                              multiple
                              value={["roads", "bikeways"]}
                              label="Default Layer Visibility"
                              renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {selected.map((value) => (
                                    <Chip key={value} label={value} />
                                  ))}
                                </Box>
                              )}
                            >
                              <MenuItem value="roads">Roads</MenuItem>
                              <MenuItem value="bikeways">Bikeways</MenuItem>
                              <MenuItem value="transit">Transit Routes</MenuItem>
                              <MenuItem value="demographics">Demographics</MenuItem>
                              <MenuItem value="feedback">User Feedback</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </CardContent>
                    <CardActions>
                      <Button size="small" variant="contained">Save Map Settings</Button>
                    </CardActions>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardHeader title="API Configuration" />
                    <Divider />
                    <CardContent>
                      <TextField
                        fullWidth
                        label="API Endpoint URL"
                        value="https://api.transportation-planner.example.com/v1"
                        sx={{ mb: 2 }}
                      />
                      
                      <TextField
                        fullWidth
                        label="API Key"
                        type="password"
                        value="••••••••••••••••"
                      />
                    </CardContent>
                    <CardActions>
                      <Button size="small">Test Connection</Button>
                      <Button size="small">Save Changes</Button>
                    </CardActions>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardHeader title="System Settings" />
                    <Divider />
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel>Default User Role</InputLabel>
                            <Select
                              value="viewer"
                              label="Default User Role"
                            >
                              <MenuItem value="admin">Administrator</MenuItem>
                              <MenuItem value="planner">Planner</MenuItem>
                              <MenuItem value="viewer">Viewer</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel>Data Backup Frequency</InputLabel>
                            <Select
                              value="daily"
                              label="Data Backup Frequency"
                            >
                              <MenuItem value="hourly">Hourly</MenuItem>
                              <MenuItem value="daily">Daily</MenuItem>
                              <MenuItem value="weekly">Weekly</MenuItem>
                              <MenuItem value="monthly">Monthly</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </CardContent>
                    <CardActions>
                      <Button size="small">Restore Defaults</Button>
                      <Button size="small">Save Changes</Button>
                    </CardActions>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </TabPanel>
        </Box>
      </Box>
      
      {/* Snackbar notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPage; 