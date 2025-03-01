import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  Paper,
  Divider,
  Card,
  CardContent,
  Chip,
  SelectChangeEvent
} from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import InfoIcon from '@mui/icons-material/Info';
import LayersIcon from '@mui/icons-material/Layers';
import PeopleIcon from '@mui/icons-material/People';
import MapView from '../map/MapView';

// Type definitions for the form data
interface MapSettings {
  initialZoom: number;
  initialCenter: {
    lat: number;
    lng: number;
  };
  baseMapStyle: string;
  visibleLayers: string[];
  allowComments: boolean;
  allowVoting: boolean;
}

interface ProjectData {
  title: string;
  description: string;
  type: string;
  mapSettings: MapSettings;
  startDate: string;
  endDate: string;
  owners: string[];
  collaborators: string[];
}

interface ProjectSetupWizardProps {
  onComplete: (projectData: ProjectData) => void;
  onCancel: () => void;
}

const ProjectSetupWizard: React.FC<ProjectSetupWizardProps> = ({ onComplete, onCancel }) => {
  // Initial state with default values
  const [activeStep, setActiveStep] = useState(0);
  const [projectData, setProjectData] = useState<ProjectData>({
    title: '',
    description: '',
    type: 'public',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    owners: [],
    collaborators: [],
    mapSettings: {
      initialZoom: 12,
      initialCenter: {
        lat: 40.7128,
        lng: -74.0060
      },
      baseMapStyle: 'streets',
      visibleLayers: ['roads', 'bikeways'],
      allowComments: true,
      allowVoting: true
    }
  });

  // Available map layer options
  const availableLayers = [
    { id: 'roads', name: 'Roads' },
    { id: 'bikeways', name: 'Bike Lanes' },
    { id: 'transit', name: 'Transit Routes' },
    { id: 'demographics', name: 'Demographics' },
    { id: 'landuse', name: 'Land Use' },
    { id: 'parking', name: 'Parking' },
    { id: 'points_of_interest', name: 'Points of Interest' },
    { id: 'feedback', name: 'User Feedback' }
  ];

  // Steps for the wizard
  const steps = [
    {
      label: 'Project Information',
      icon: <InfoIcon />,
      description: 'Enter basic information about your project.'
    },
    {
      label: 'Map Settings',
      icon: <MapIcon />,
      description: 'Configure the map view for this project.'
    },
    {
      label: 'Layer Configuration',
      icon: <LayersIcon />,
      description: 'Select which layers will be visible by default.'
    },
    {
      label: 'Team & Permissions',
      icon: <PeopleIcon />,
      description: 'Set up team members and permissions.'
    }
  ];

  // Handlers for form changes
  const handleProjectInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProjectData({
      ...projectData,
      [name]: value
    });
  };

  const handleTypeChange = (e: SelectChangeEvent) => {
    setProjectData({
      ...projectData,
      type: e.target.value as string
    });
  };

  const handleMapSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'initialZoom') {
      setProjectData({
        ...projectData,
        mapSettings: {
          ...projectData.mapSettings,
          initialZoom: Number(value)
        }
      });
    } else if (name === 'lat') {
      setProjectData({
        ...projectData,
        mapSettings: {
          ...projectData.mapSettings,
          initialCenter: {
            ...projectData.mapSettings.initialCenter,
            lat: Number(value)
          }
        }
      });
    } else if (name === 'lng') {
      setProjectData({
        ...projectData,
        mapSettings: {
          ...projectData.mapSettings,
          initialCenter: {
            ...projectData.mapSettings.initialCenter,
            lng: Number(value)
          }
        }
      });
    }
  };

  const handleBaseMapChange = (e: SelectChangeEvent) => {
    setProjectData({
      ...projectData,
      mapSettings: {
        ...projectData.mapSettings,
        baseMapStyle: e.target.value as string
      }
    });
  };

  const handleLayersChange = (e: SelectChangeEvent<string[]>) => {
    const value = e.target.value;
    setProjectData({
      ...projectData,
      mapSettings: {
        ...projectData.mapSettings,
        visibleLayers: typeof value === 'string' ? value.split(',') : value
      }
    });
  };

  const handleToggleChange = (setting: keyof MapSettings) => {
    setProjectData({
      ...projectData,
      mapSettings: {
        ...projectData.mapSettings,
        [setting]: !projectData.mapSettings[setting as keyof MapSettings]
      }
    });
  };

  // Navigation handlers
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleFinish = () => {
    onComplete(projectData);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Project Setup Wizard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Create a new project by following these steps. You'll be able to modify these settings later.
      </Typography>

      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel StepIconComponent={() => React.cloneElement(step.icon)}>
              <Typography variant="h6">{step.label}</Typography>
            </StepLabel>
            <StepContent>
              <Typography color="text.secondary" paragraph>
                {step.description}
              </Typography>

              {/* Step 1: Project Information */}
              {index === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      name="title"
                      label="Project Title"
                      value={projectData.title}
                      onChange={handleProjectInfoChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="description"
                      label="Project Description"
                      value={projectData.description}
                      onChange={handleProjectInfoChange}
                      fullWidth
                      multiline
                      rows={4}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Project Type</InputLabel>
                      <Select
                        name="type"
                        value={projectData.type}
                        onChange={handleTypeChange}
                        label="Project Type"
                      >
                        <MenuItem value="public">Public</MenuItem>
                        <MenuItem value="private">Private</MenuItem>
                        <MenuItem value="restricted">Restricted Access</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="startDate"
                      label="Start Date"
                      type="date"
                      value={projectData.startDate}
                      onChange={handleProjectInfoChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="endDate"
                      label="End Date (Optional)"
                      type="date"
                      value={projectData.endDate}
                      onChange={handleProjectInfoChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              )}

              {/* Step 2: Map Settings */}
              {index === 1 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={7}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Map Configuration
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                              <InputLabel>Base Map Style</InputLabel>
                              <Select
                                value={projectData.mapSettings.baseMapStyle}
                                onChange={handleBaseMapChange}
                                label="Base Map Style"
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
                              name="initialZoom"
                              label="Initial Zoom Level"
                              type="number"
                              InputProps={{ inputProps: { min: 1, max: 20 } }}
                              value={projectData.mapSettings.initialZoom}
                              onChange={handleMapSettingChange}
                              fullWidth
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              name="lat"
                              label="Center Latitude"
                              type="number"
                              InputProps={{ 
                                inputProps: { 
                                  step: 0.000001,
                                  min: -90,
                                  max: 90
                                } 
                              }}
                              value={projectData.mapSettings.initialCenter.lat}
                              onChange={handleMapSettingChange}
                              fullWidth
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              name="lng"
                              label="Center Longitude"
                              type="number"
                              InputProps={{ 
                                inputProps: { 
                                  step: 0.000001,
                                  min: -180,
                                  max: 180
                                } 
                              }}
                              value={projectData.mapSettings.initialCenter.lng}
                              onChange={handleMapSettingChange}
                              fullWidth
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={projectData.mapSettings.allowComments}
                                  onChange={() => handleToggleChange('allowComments')}
                                />
                              }
                              label="Allow User Comments on Map"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={projectData.mapSettings.allowVoting}
                                  onChange={() => handleToggleChange('allowVoting')}
                                />
                              }
                              label="Enable Voting on Feedback"
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <Paper variant="outlined" sx={{ p: 0, height: '100%', minHeight: 300 }}>
                      <Box sx={{ height: 300 }}>
                        <MapView 
                          center={[
                            projectData.mapSettings.initialCenter.lat,
                            projectData.mapSettings.initialCenter.lng
                          ]} 
                          zoom={projectData.mapSettings.initialZoom} 
                        />
                      </Box>
                      <Box sx={{ p: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          This is a preview of how your map will appear. Adjust the settings to customize the view.
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              )}

              {/* Step 3: Layer Configuration */}
              {index === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={7}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Available Layers
                        </Typography>
                        <FormControl fullWidth sx={{ mb: 3 }}>
                          <InputLabel>Visible Layers</InputLabel>
                          <Select
                            multiple
                            value={projectData.mapSettings.visibleLayers}
                            onChange={handleLayersChange}
                            label="Visible Layers"
                            renderValue={(selected) => (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                  <Chip 
                                    key={value} 
                                    label={availableLayers.find(layer => layer.id === value)?.name || value} 
                                  />
                                ))}
                              </Box>
                            )}
                          >
                            {availableLayers.map((layer) => (
                              <MenuItem key={layer.id} value={layer.id}>
                                {layer.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Typography variant="body2" color="text.secondary">
                          Select which layers will be visible by default when users view this project.
                          Users will be able to toggle these layers on/off when interacting with the map.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <Paper variant="outlined" sx={{ p: 0, height: '100%', minHeight: 300 }}>
                      <Box sx={{ height: 300 }}>
                        <MapView 
                          center={[
                            projectData.mapSettings.initialCenter.lat,
                            projectData.mapSettings.initialCenter.lng
                          ]} 
                          zoom={projectData.mapSettings.initialZoom} 
                        />
                      </Box>
                      <Box sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Selected Layers:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {projectData.mapSettings.visibleLayers.length > 0 ? (
                            projectData.mapSettings.visibleLayers.map((layerId) => (
                              <Chip 
                                key={layerId} 
                                label={availableLayers.find(layer => layer.id === layerId)?.name || layerId}
                                size="small"
                              />
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No layers selected
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              )}

              {/* Step 4: Team & Permissions */}
              {index === 3 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Team Members
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Add team members to your project. Project owners have full access, while collaborators
                      have limited permissions based on their role.
                    </Typography>
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Project Owners
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Project owners functionality will be implemented here.
                    </Typography>
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Collaborators
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Collaborators functionality will be implemented here.
                    </Typography>
                  </Grid>
                </Grid>
              )}

              <Box sx={{ mb: 2, mt: 3 }}>
                <div>
                  <Button
                    variant="contained"
                    onClick={index === steps.length - 1 ? handleFinish : handleNext}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    {index === steps.length - 1 ? 'Create Project' : 'Continue'}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={onCancel}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Cancel
                  </Button>
                </div>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default ProjectSetupWizard; 