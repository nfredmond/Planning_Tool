import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Alert,
  Stack,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Tooltip,
  IconButton,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MapIcon from '@mui/icons-material/Map';
import LayersIcon from '@mui/icons-material/Layers';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import HelpIcon from '@mui/icons-material/Help';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsIcon from '@mui/icons-material/Settings';

import { useProjects } from '../../hooks/useProjects';
import { useExport } from '../../hooks/useExport';
import LoadingSpinner from '../common/LoadingSpinner';

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  fileExtension: string;
}

const DataExportTool: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [exportCoordinateSystem, setExportCoordinateSystem] = useState<string>('wgs84');
  const [includeMetadata, setIncludeMetadata] = useState<boolean>(true);
  const [exportQuality, setExportQuality] = useState<'standard' | 'high'>('standard');
  const [exportWithStyles, setExportWithStyles] = useState<boolean>(true);
  const [exportProgress, setExportProgress] = useState<number | null>(null);
  const [downloadReady, setDownloadReady] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState<boolean>(false);
  const [selectedHelpTopic, setSelectedHelpTopic] = useState<string | null>(null);
  
  const { projects, loading: projectsLoading } = useProjects();
  const { 
    exportData, 
    exportFormats, 
    dataTypes, 
    loading: exportLoading, 
    error: exportError 
  } = useExport();

  const steps = ['Select Project', 'Choose Data Types', 'Configure Export', 'Download'];

  // Reset data when project changes
  useEffect(() => {
    if (selectedProject) {
      setActiveStep(1);
    } else {
      setActiveStep(0);
      setSelectedDataTypes([]);
      setSelectedFormat('');
      resetExportProgress();
    }
  }, [selectedProject]);

  // Reset export progress and download state when data types or format changes
  const resetExportProgress = () => {
    setExportProgress(null);
    setDownloadReady(false);
    setDownloadUrl(null);
  };

  useEffect(() => {
    resetExportProgress();
  }, [selectedDataTypes, selectedFormat]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => {
      const nextStep = prevActiveStep + 1;
      if (nextStep === 3) {
        // Trigger export process
        handleExport();
      }
      return nextStep;
    });
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleProjectChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedProject(event.target.value as string);
  };

  const handleDataTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedDataTypes(event.target.value as string[]);
  };

  const handleFormatChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedFormat(event.target.value as string);
  };

  const handleCoordinateSystemChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExportCoordinateSystem(event.target.value);
  };

  const handleMetadataToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIncludeMetadata(event.target.checked);
  };

  const handleQualityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExportQuality(event.target.value as 'standard' | 'high');
  };

  const handleStylesToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExportWithStyles(event.target.checked);
  };

  const handleShowHelp = (topic: string) => {
    setSelectedHelpTopic(topic);
    setHelpDialogOpen(true);
  };

  const handleExport = async () => {
    if (!selectedProject || !selectedFormat || selectedDataTypes.length === 0) {
      return;
    }

    setExportProgress(0);
    setDownloadReady(false);

    try {
      // Simulated progress updates (in a real app, this would come from the backend)
      const progressInterval = setInterval(() => {
        setExportProgress((prevProgress) => {
          if (prevProgress === null) return 0;
          const nextProgress = prevProgress + Math.random() * 10;
          return nextProgress >= 100 ? 100 : nextProgress;
        });
      }, 300);

      const result = await exportData({
        projectId: selectedProject,
        dataTypes: selectedDataTypes,
        format: selectedFormat,
        options: {
          coordinateSystem: exportCoordinateSystem,
          includeMetadata,
          quality: exportQuality,
          includeStyles: exportWithStyles
        }
      });

      clearInterval(progressInterval);
      setExportProgress(100);
      setDownloadReady(true);
      setDownloadUrl(result.downloadUrl);
    } catch (error) {
      console.error('Export failed:', error);
      setExportProgress(null);
    }
  };

  const getSelectedFormatDetails = (): ExportFormat | undefined => {
    return exportFormats?.find(format => format.id === selectedFormat);
  };

  const getDataTypeLabel = (dataTypeId: string): string => {
    const dataType = dataTypes?.find(dt => dt.id === dataTypeId);
    return dataType?.name || dataTypeId;
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!selectedProject;
      case 1:
        return selectedDataTypes.length > 0;
      case 2:
        return !!selectedFormat;
      default:
        return true;
    }
  };

  const renderHelpContent = () => {
    switch (selectedHelpTopic) {
      case 'formats':
        return (
          <>
            <Typography variant="h6" gutterBottom>File Formats</Typography>
            <Typography paragraph>
              TransportVoice supports exporting data to various industry-standard formats:
            </Typography>
            <ul>
              <li>
                <Typography>
                  <strong>Shapefile (.shp)</strong> - Common format for ArcGIS, supports geographic data with attributes.
                </Typography>
              </li>
              <li>
                <Typography>
                  <strong>KML/KMZ (.kml, .kmz)</strong> - Google Earth format, good for visualization and sharing.
                </Typography>
              </li>
              <li>
                <Typography>
                  <strong>GeoJSON (.geojson)</strong> - Open standard for representing geographic features with attributes.
                </Typography>
              </li>
              <li>
                <Typography>
                  <strong>DXF (.dxf)</strong> - AutoCAD interchange format, compatible with most CAD software.
                </Typography>
              </li>
              <li>
                <Typography>
                  <strong>CSV (.csv)</strong> - Tabular data format, can include coordinates for mapping.
                </Typography>
              </li>
            </ul>
          </>
        );
      case 'coordinateSystems':
        return (
          <>
            <Typography variant="h6" gutterBottom>Coordinate Systems</Typography>
            <Typography paragraph>
              Choose the coordinate system that's compatible with your GIS or CAD software:
            </Typography>
            <ul>
              <li>
                <Typography>
                  <strong>WGS84</strong> - World Geodetic System (latitude/longitude), standard for global mapping.
                </Typography>
              </li>
              <li>
                <Typography>
                  <strong>NAD83</strong> - North American Datum, commonly used in North America.
                </Typography>
              </li>
              <li>
                <Typography>
                  <strong>UTM</strong> - Universal Transverse Mercator, using zones based on location.
                </Typography>
              </li>
              <li>
                <Typography>
                  <strong>State Plane</strong> - Coordinate system specific to U.S. states and counties.
                </Typography>
              </li>
            </ul>
          </>
        );
      case 'dataTypes':
        return (
          <>
            <Typography variant="h6" gutterBottom>Data Types</Typography>
            <Typography paragraph>
              TransportVoice can export various types of data:
            </Typography>
            <ul>
              <li>
                <Typography>
                  <strong>Geographic Features</strong> - Roads, intersections, bike lanes, sidewalks, etc.
                </Typography>
              </li>
              <li>
                <Typography>
                  <strong>Comment Locations</strong> - Geospatial data showing where comments were made.
                </Typography>
              </li>
              <li>
                <Typography>
                  <strong>Feedback Heatmaps</strong> - Density of comments across the project area.
                </Typography>
              </li>
              <li>
                <Typography>
                  <strong>Design Alternatives</strong> - Different project designs as geographic layers.
                </Typography>
              </li>
              <li>
                <Typography>
                  <strong>Analysis Results</strong> - Results from impact prediction and other analyses.
                </Typography>
              </li>
            </ul>
          </>
        );
      default:
        return (
          <Typography>Select a topic from the Help button to see related information.</Typography>
        );
    }
  };

  const renderSelectProject = () => (
    <Box sx={{ mt: 3 }}>
      <FormControl fullWidth>
        <InputLabel id="project-select-label">Project</InputLabel>
        <Select
          labelId="project-select-label"
          value={selectedProject}
          label="Project"
          onChange={handleProjectChange}
        >
          <MenuItem value="">
            <em>Select a project</em>
          </MenuItem>
          {projects?.map((project) => (
            <MenuItem key={project.id} value={project.id}>
              {project.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {selectedProject && (
        <Alert 
          severity="info" 
          icon={<InfoIcon />}
          sx={{ mt: 2 }}
        >
          You'll be able to export data from "{projects?.find(p => p.id === selectedProject)?.name}".
        </Alert>
      )}
    </Box>
  );

  const renderSelectDataTypes = () => (
    <Box sx={{ mt: 3 }}>
      <FormControl fullWidth>
        <InputLabel id="data-types-label">Data Types to Export</InputLabel>
        <Select
          labelId="data-types-label"
          multiple
          value={selectedDataTypes}
          onChange={handleDataTypeChange}
          input={<OutlinedInput label="Data Types to Export" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as string[]).map((value) => (
                <Chip key={value} label={getDataTypeLabel(value)} size="small" />
              ))}
            </Box>
          )}
        >
          {dataTypes?.map((dataType) => (
            <MenuItem key={dataType.id} value={dataType.id}>
              <Checkbox checked={selectedDataTypes.indexOf(dataType.id) > -1} />
              <ListItemText 
                primary={dataType.name} 
                secondary={dataType.description} 
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <Box sx={{ textAlign: 'right', mt: 1 }}>
        <Button
          size="small"
          endIcon={<HelpIcon />}
          onClick={() => handleShowHelp('dataTypes')}
        >
          What data can I export?
        </Button>
      </Box>
      
      {selectedDataTypes.length > 0 && (
        <Alert 
          severity="info" 
          sx={{ mt: 2 }}
        >
          You've selected {selectedDataTypes.length} data type(s) to export.
        </Alert>
      )}
    </Box>
  );

  const renderConfigureExport = () => (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Export Format
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {exportFormats?.map((format) => (
              <Card 
                key={format.id}
                variant="outlined"
                sx={{ 
                  width: 150, 
                  cursor: 'pointer',
                  border: selectedFormat === format.id ? '2px solid #2196f3' : undefined,
                  bgcolor: selectedFormat === format.id ? 'rgba(33, 150, 243, 0.08)' : undefined
                }}
                onClick={() => setSelectedFormat(format.id)}
              >
                <CardContent sx={{ textAlign: 'center', p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ fontSize: 40, mb: 1, color: 'primary.main' }}>
                    {format.icon}
                  </Box>
                  <Typography variant="h6" component="div" gutterBottom>
                    {format.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format.fileExtension}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
          <Box sx={{ textAlign: 'right', mt: 1 }}>
            <Button
              size="small"
              endIcon={<HelpIcon />}
              onClick={() => handleShowHelp('formats')}
            >
              Learn about formats
            </Button>
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1">
              Export Options
            </Typography>
            <Button
              size="small"
              startIcon={<SettingsIcon />}
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            >
              {showAdvancedOptions ? 'Hide Advanced Options' : 'Show Advanced Options'}
            </Button>
          </Box>
          
          <Stack spacing={3}>
            <FormControl component="fieldset">
              <Typography variant="subtitle2" gutterBottom>
                Coordinate System
                <IconButton size="small" onClick={() => handleShowHelp('coordinateSystems')}>
                  <HelpIcon fontSize="small" />
                </IconButton>
              </Typography>
              <RadioGroup
                value={exportCoordinateSystem}
                onChange={handleCoordinateSystemChange}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel value="wgs84" control={<Radio />} label="WGS84 (Default)" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel value="nad83" control={<Radio />} label="NAD83" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel value="utm" control={<Radio />} label="UTM" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel value="state_plane" control={<Radio />} label="State Plane" />
                  </Grid>
                </Grid>
              </RadioGroup>
            </FormControl>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeMetadata}
                  onChange={handleMetadataToggle}
                />
              }
              label="Include metadata and attributes"
            />
            
            {showAdvancedOptions && (
              <>
                <FormControl component="fieldset">
                  <Typography variant="subtitle2" gutterBottom>
                    Export Quality
                  </Typography>
                  <RadioGroup
                    value={exportQuality}
                    onChange={handleQualityChange}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel 
                          value="standard" 
                          control={<Radio />} 
                          label="Standard (Faster, smaller file size)" 
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel 
                          value="high" 
                          control={<Radio />} 
                          label="High Quality (More detail, larger file)" 
                        />
                      </Grid>
                    </Grid>
                  </RadioGroup>
                </FormControl>
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={exportWithStyles}
                      onChange={handleStylesToggle}
                    />
                  }
                  label="Include visual styles and symbolization (where supported)"
                />
              </>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );

  const renderDownload = () => {
    const selectedFormat = getSelectedFormatDetails();
    
    return (
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        {exportProgress !== null && exportProgress < 100 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Preparing Your Export...
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={exportProgress} 
              sx={{ height: 10, borderRadius: 5, mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              This may take a few moments depending on the amount of data.
            </Typography>
          </Box>
        )}
        
        {downloadReady && downloadUrl && (
          <Box sx={{ mb: 4 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Your Export is Ready!
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<FileDownloadIcon />}
              href={downloadUrl}
              download={`transportvoice_export_${new Date().getTime()}.${selectedFormat?.fileExtension}`}
              sx={{ mt: 2 }}
            >
              Download {selectedFormat?.name} File
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              This file contains data for project "{projects?.find(p => p.id === selectedProject)?.name}"
              in {selectedFormat?.name} format.
            </Typography>
          </Box>
        )}
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            What's Next?
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <LayersIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Import to GIS Software
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Open this file in ArcGIS, QGIS, or other GIS software for further analysis.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <IntegrationInstructionsIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    CAD Integration
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Import into AutoCAD or other design software to incorporate feedback into designs.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <MapIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Create Maps
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Produce maps and visualizations to share with stakeholders and the public.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <FormatListNumberedIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Generate Reports
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Use the exported data to create comprehensive reports for decision-makers.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Data Export Tool
          <Tooltip title="Export data to standard planning software formats like ArcGIS, AutoCAD, and QGIS">
            <InfoIcon sx={{ ml: 1, verticalAlign: 'middle', color: 'info.main' }} />
          </Tooltip>
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Export TransportVoice data in formats compatible with standard planning and GIS software like ArcGIS, AutoCAD, and QGIS for further analysis and design.
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={label} completed={activeStep > index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {(projectsLoading || exportLoading) && activeStep !== 3 ? (
          <LoadingSpinner />
        ) : exportError ? (
          <Alert severity="error">{exportError}</Alert>
        ) : (
          <>
            {activeStep === 0 && renderSelectProject()}
            {activeStep === 1 && renderSelectDataTypes()}
            {activeStep === 2 && renderConfigureExport()}
            {activeStep === 3 && renderDownload()}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Back
              </Button>
              
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid(activeStep) || (activeStep === 3 && (!downloadReady || !downloadUrl))}
              >
                {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </Box>
          </>
        )}
      </Paper>

      {/* Help Dialog */}
      <Dialog
        open={helpDialogOpen}
        onClose={() => setHelpDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Export Help
        </DialogTitle>
        <DialogContent dividers>
          {renderHelpContent()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DataExportTool; 