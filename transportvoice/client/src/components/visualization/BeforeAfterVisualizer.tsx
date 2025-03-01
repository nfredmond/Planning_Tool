import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Divider, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Slider,
  Switch,
  FormControlLabel,
  Tooltip,
  IconButton,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CompareIcon from '@mui/icons-material/Compare';
import InfoIcon from '@mui/icons-material/Info';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import { useProjects } from '../../hooks/useProjects';
import { useProjectAlternatives } from '../../hooks/useProjectAlternatives';
import { useBeforeAfterImages } from '../../hooks/useBeforeAfterImages';
import { useGenerateImage } from '../../hooks/useGenerateImage';
import { ProjectType, ProjectAlternative, BeforeAfterImage } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import ImageComparisonSlider from '../common/ImageComparisonSlider';

const BeforeAfterVisualizer: React.FC = () => {
  const { projects, loading: projectsLoading } = useProjects();
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedAlternative, setSelectedAlternative] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'comparison'>('grid');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<BeforeAfterImage | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editImageId, setEditImageId] = useState<string | null>(null);
  const [imageTitle, setImageTitle] = useState('');
  const [imageDescription, setImageDescription] = useState('');
  const [imageLocation, setImageLocation] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { 
    alternatives, 
    loading: alternativesLoading 
  } = useProjectAlternatives(selectedProject);

  const {
    images,
    loading: imagesLoading,
    error: imagesError,
    uploadImage,
    deleteImage,
    updateImageDetails
  } = useBeforeAfterImages(selectedProject, selectedAlternative);

  const {
    generateImage,
    loading: generationLoading,
    error: generationError
  } = useGenerateImage();

  useEffect(() => {
    if (alternatives && alternatives.length > 0 && !selectedAlternative) {
      setSelectedAlternative(alternatives[0].id);
    }
  }, [alternatives, selectedAlternative]);

  const handleProjectChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedProject(event.target.value as string);
    setSelectedAlternative('');
    setSelectedImage(null);
  };

  const handleAlternativeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedAlternative(event.target.value as string);
    setSelectedImage(null);
  };

  const handleImageSelect = (imageId: string) => {
    setSelectedImage(imageId === selectedImage ? null : imageId);
  };

  const handleFullscreenView = (image: BeforeAfterImage) => {
    setFullscreenImage(image);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedProject && selectedAlternative) {
      setUploadDialogOpen(true);
      // Simulate upload progress
      const timer = setInterval(() => {
        setUploadProgress((oldProgress) => {
          const newProgress = Math.min(oldProgress + 10, 100);
          if (newProgress === 100) {
            clearInterval(timer);
            // Mock upload function call - replace with actual upload
            uploadImage(file, {
              title: imageTitle || file.name,
              description: imageDescription,
              location: imageLocation,
              projectId: selectedProject,
              alternativeId: selectedAlternative
            }).then(() => {
              setUploadDialogOpen(false);
              setUploadProgress(0);
              setImageTitle('');
              setImageDescription('');
              setImageLocation('');
            });
          }
          return newProgress;
        });
      }, 300);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleGenerateImage = async (imageId: string) => {
    if (!aiPrompt.trim()) return;
    
    setGeneratingImage(true);
    try {
      await generateImage(imageId, aiPrompt);
      setAiPrompt('');
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleEditClick = (image: BeforeAfterImage) => {
    setEditImageId(image.id);
    setImageTitle(image.title);
    setImageDescription(image.description || '');
    setImageLocation(image.location || '');
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (editImageId) {
      await updateImageDetails(editImageId, {
        title: imageTitle,
        description: imageDescription,
        location: imageLocation
      });
      setEditDialogOpen(false);
      setEditImageId(null);
    }
  };

  const handleDeleteClick = (imageId: string) => {
    setDeleteImageId(imageId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteImageId) {
      await deleteImage(deleteImageId);
      if (selectedImage === deleteImageId) {
        setSelectedImage(null);
      }
      setDeleteConfirmOpen(false);
      setDeleteImageId(null);
    }
  };

  const renderGridView = () => {
    if (!images || images.length ===.0) {
      return (
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No before/after images available for this project.
          </Typography>
          <Typography color="text.secondary" paragraph>
            Upload images to visualize how this project will transform the area.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddPhotoAlternateIcon />}
            onClick={handleUploadClick}
          >
            Upload Before Image
          </Button>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {images.map((image) => (
          <Grid item xs={12} md={6} lg={4} key={image.id}>
            <Card 
              variant="outlined" 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                border: selectedImage === image.id ? '2px solid #2196f3' : undefined,
                transition: 'all 0.3s ease'
              }}
              onClick={() => handleImageSelect(image.id)}
            >
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={image.beforeImageUrl}
                  alt={image.title}
                  sx={{ objectFit: 'cover' }}
                />
                {image.afterImageUrl && (
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bottom: 0,
                      width: '50%',
                      overflow: 'hidden',
                      borderLeft: '2px solid white'
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={image.afterImageUrl}
                      alt={`${image.title} (After)`}
                      sx={{ 
                        objectFit: 'cover',
                        width: '200%',
                        objectPosition: 'left'
                      }}
                    />
                  </Box>
                )}
                
                <Box 
                  sx={{ 
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    borderRadius: '50%',
                    p: 0.5
                  }}
                >
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFullscreenView(image);
                    }}
                    sx={{ color: 'white' }}
                  >
                    <FullscreenIcon />
                  </IconButton>
                </Box>
                
                {!image.afterImageUrl && (
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      bgcolor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      p: 1,
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="caption">
                      No "After" image generated yet
                    </Typography>
                  </Box>
                )}
              </Box>
              
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {image.title}
                </Typography>
                {image.location && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Location: {image.location}
                  </Typography>
                )}
                {image.description && (
                  <Typography variant="body2">
                    {image.description}
                  </Typography>
                )}
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                <Box>
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(image);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(image.id);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Box>
                  {image.afterImageUrl ? (
                    <Button 
                      size="small" 
                      startIcon={<CompareIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(image.id);
                        setViewMode('comparison');
                      }}
                    >
                      Compare
                    </Button>
                  ) : (
                    <Button 
                      size="small" 
                      color="primary" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(image.id);
                        setAiPrompt(`Transform this street scene to show ${alternatives?.find(a => a.id === selectedAlternative)?.name || 'the proposed changes'}`);
                      }}
                    >
                      Generate "After" Image
                    </Button>
                  )}
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
        
        <Grid item xs={12} md={6} lg={4}>
          <Card 
            variant="outlined" 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: 4,
              cursor: 'pointer',
              bgcolor: 'action.hover'
            }}
            onClick={handleUploadClick}
          >
            <AddPhotoAlternateIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Add New Location
            </Typography>
            <Typography color="text.secondary" align="center">
              Upload a "before" image to visualize potential changes
            </Typography>
            <Button 
              variant="outlined" 
              sx={{ mt: 2 }}
              startIcon={<AddPhotoAlternateIcon />}
            >
              Upload Image
            </Button>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderComparisonView = () => {
    if (!selectedImage || !images) return null;
    
    const image = images.find(img => img.id === selectedImage);
    if (!image || !image.afterImageUrl) return null;

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Button onClick={() => setViewMode('grid')}>
            Back to Gallery
          </Button>
          <Typography variant="h6">
            {image.title}
          </Typography>
          <Box>
            <IconButton>
              <ShareIcon />
            </IconButton>
            <IconButton>
              <DownloadIcon />
            </IconButton>
          </Box>
        </Box>
        
        <Paper sx={{ p: 2, mb: 4 }}>
          <Box sx={{ height: 500, width: '100%' }}>
            <ImageComparisonSlider
              beforeImage={image.beforeImageUrl}
              afterImage={image.afterImageUrl}
              beforeLabel="Before"
              afterLabel="After"
            />
          </Box>
        </Paper>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Before
              </Typography>
              <Typography variant="body2" paragraph>
                Current state of {image.location || 'the area'}
              </Typography>
              <Box sx={{ width: '100%' }}>
                <img 
                  src={image.beforeImageUrl} 
                  alt="Before"
                  style={{ width: '100%', borderRadius: 4 }}
                />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                After
              </Typography>
              <Typography variant="body2" paragraph>
                Visualization of proposed changes for {image.location || 'the area'}
              </Typography>
              <Box sx={{ width: '100%' }}>
                <img 
                  src={image.afterImageUrl} 
                  alt="After"
                  style={{ width: '100%', borderRadius: 4 }}
                />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Project Changes
              </Typography>
              <Typography variant="body1">
                {alternatives?.find(a => a.id === selectedAlternative)?.description || 
                 'This visualization shows how the proposed changes might transform the area.'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderGeneratePrompt = () => {
    if (!selectedImage || !images) return null;
    
    const image = images.find(img => img.id === selectedImage);
    if (!image || image.afterImageUrl) return null;

    return (
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Generate "After" Visualization
        </Typography>
        <Typography variant="body2" paragraph>
          Describe the changes you want to visualize. Be specific about design elements, facilities, or transformations.
        </Typography>
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="AI Prompt"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g., Transform this street to add a protected bike lane, wider sidewalks, street trees, and outdoor seating areas."
              disabled={generatingImage}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              disabled={!aiPrompt.trim() || generatingImage}
              onClick={() => handleGenerateImage(image.id)}
              sx={{ height: '56px' }}
            >
              {generatingImage ? <CircularProgress size={24} /> : 'Generate Visualization'}
            </Button>
          </Grid>
          {generationError && (
            <Grid item xs={12}>
              <Alert severity="error">{generationError}</Alert>
            </Grid>
          )}
        </Grid>
      </Paper>
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Before/After Visualization Tool
          <Tooltip title="Upload images and generate visualizations of how transportation projects will transform the area">
            <InfoIcon sx={{ ml: 1, verticalAlign: 'middle', color: 'info.main' }} />
          </Tooltip>
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Upload "before" photos of areas, then use AI to generate potential "after" visualizations based on planned changes.
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
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
                {projects?.map((project: ProjectType) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth disabled={!selectedProject || !alternatives || alternatives.length === 0}>
              <InputLabel id="alternative-select-label">Design Alternative</InputLabel>
              <Select
                labelId="alternative-select-label"
                value={selectedAlternative}
                label="Design Alternative"
                onChange={handleAlternativeChange}
              >
                <MenuItem value="">
                  <em>Select a design alternative</em>
                </MenuItem>
                {alternatives?.map((alt: ProjectAlternative) => (
                  <MenuItem key={alt.id} value={alt.id}>
                    {alt.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {(projectsLoading || alternativesLoading || imagesLoading) ? (
        <LoadingSpinner />
      ) : imagesError ? (
        <Alert severity="error">{imagesError}</Alert>
      ) : !selectedProject ? (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h6">Please select a project to view before/after visualizations</Typography>
        </Paper>
      ) : !selectedAlternative ? (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h6">Please select a design alternative to view before/after visualizations</Typography>
        </Paper>
      ) : viewMode === 'grid' ? (
        <>
          {selectedImage && renderGeneratePrompt()}
          {renderGridView()}
        </>
      ) : (
        renderComparisonView()
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleFileUpload}
      />

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Before Image</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography gutterBottom>Uploading Image...</Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
          <Stack spacing={2}>
            <TextField
              label="Title"
              fullWidth
              value={imageTitle}
              onChange={(e) => setImageTitle(e.target.value)}
            />
            <TextField
              label="Location"
              fullWidth
              value={imageLocation}
              onChange={(e) => setImageLocation(e.target.value)}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={imageDescription}
              onChange={(e) => setImageDescription(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)} disabled={uploadProgress > 0 && uploadProgress < 100}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Image Details</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Title"
              fullWidth
              value={imageTitle}
              onChange={(e) => setImageTitle(e.target.value)}
            />
            <TextField
              label="Location"
              fullWidth
              value={imageLocation}
              onChange={(e) => setImageLocation(e.target.value)}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={imageDescription}
              onChange={(e) => setImageDescription(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this image? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fullscreen Image Dialog */}
      <Dialog open={Boolean(fullscreenImage)} maxWidth="lg" fullWidth onClose={() => setFullscreenImage(null)}>
        {fullscreenImage && (
          <>
            <DialogTitle>{fullscreenImage.title}</DialogTitle>
            <DialogContent>
              {fullscreenImage.afterImageUrl ? (
                <Box sx={{ height: 600, width: '100%' }}>
                  <ImageComparisonSlider
                    beforeImage={fullscreenImage.beforeImageUrl}
                    afterImage={fullscreenImage.afterImageUrl}
                    beforeLabel="Before"
                    afterLabel="After"
                  />
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center' }}>
                  <img 
                    src={fullscreenImage.beforeImageUrl} 
                    alt={fullscreenImage.title}
                    style={{ maxWidth: '100%', maxHeight: '70vh' }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    No "After" visualization has been generated yet
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setFullscreenImage(null)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default BeforeAfterVisualizer; 