// client/src/pages/projects/ProjectPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Map as MapIcon,
  Comment as CommentIcon,
  Info as InfoIcon,
  Share as ShareIcon,
  Close as CloseIcon,
  Menu as MenuIcon,
  Add as AddIcon,
  Login as LoginIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { getProjectBySlug } from '../../services/projectService';
import { Project } from '../../types/Project';
import { useAuth } from '../../context/AuthContext';
import MapContainer from '../../components/map/MapContainer';
import CommentList from '../../components/comments/CommentList';
import CommentForm from '../../components/comments/CommentForm';
import { ProjectProvider } from '../../context/ProjectContext';

const ProjectPage: React.FC = () => {
  return (
    <ProjectProvider>
      <ProjectPageContent />
    </ProjectProvider>
  );
};

const ProjectPageContent: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('map');
  const [infoDrawerOpen, setInfoDrawerOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [addingComment, setAddingComment] = useState(false);
  const [commentLocation, setCommentLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!slug) return;
    
    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const fetchedProject = await getProjectBySlug(slug);
        setProject(fetchedProject);
      } catch (error) {
        console.error('Error fetching project:', error);
        setError('Failed to load project. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [slug]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const toggleInfoDrawer = () => {
    setInfoDrawerOpen(!infoDrawerOpen);
  };

  const handleShare = (platform: 'facebook' | 'twitter') => {
    const shareUrl = window.location.href;
    const title = project ? `Check out ${project.name} on TransportVoice` : 'Check out this project on TransportVoice';
    
    let shareLink = '';
    
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`;
        break;
    }
    
    window.open(shareLink, '_blank', 'width=600,height=400');
  };

  const handleAddComment = () => {
    if (!user) {
      // If user is not logged in, redirect to login page
      navigate('/login', { state: { from: { pathname: `/projects/${slug}` } } });
      return;
    }
    
    setActiveTab('map'); // Switch to map tab if not already there
    setAddingComment(true);
  };

  const handleCancelComment = () => {
    setAddingComment(false);
    setCommentLocation(null);
  };

  const handleCommentSubmit = () => {
    setAddingComment(false);
    setCommentLocation(null);
    // Optionally switch to comments tab to show the new comment
    setActiveTab('comments');
  };

  const handleMapClick = (location: [number, number]) => {
    if (addingComment) {
      setCommentLocation(location);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Project not found'}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/projects')}>
          Go Back to Projects
        </Button>
      </Container>
    );
  }

  // Check if project is active
  if (project.status !== 'active') {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          This project is currently {project.status === 'draft' ? 'in draft mode' : 'archived'} and not open for public comments.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/projects')}>
          Go Back to Projects
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Project Header */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: { xs: 2, md: 3 },
          boxShadow: 2,
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <Typography variant="h4" component="h1" noWrap>
                {project.name}
              </Typography>
              {!isMobile && (
                <Typography variant="subtitle1" sx={{ mt: 0.5, opacity: 0.9 }}>
                  Last updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                </Typography>
              )}
            </Grid>
            <Grid item>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  color="inherit"
                  aria-label="project information"
                  onClick={toggleInfoDrawer}
                >
                  <InfoIcon />
                </IconButton>
                <IconButton
                  color="inherit"
                  aria-label="share project"
                  onClick={() => setShareDialogOpen(true)}
                >
                  <ShareIcon />
                </IconButton>
                {project.settings.enableSocialSharing && (
                  <>
                    <IconButton
                      color="inherit"
                      aria-label="share on facebook"
                      onClick={() => handleShare('facebook')}
                      sx={{ display: { xs: 'none', md: 'flex' } }}
                    >
                      <FacebookIcon />
                    </IconButton>
                    <IconButton
                      color="inherit"
                      aria-label="share on twitter"
                      onClick={() => handleShare('twitter')}
                      sx={{ display: { xs: 'none', md: 'flex' } }}
                    >
                      <TwitterIcon />
                    </IconButton>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Project Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="xl">
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="project sections"
            variant={isMobile ? 'fullWidth' : 'standard'}
          >
            <Tab
              icon={isMobile ? <MapIcon /> : undefined}
              iconPosition="start"
              label={isMobile ? undefined : "Map"}
              value="map"
            />
            <Tab
              icon={isMobile ? <CommentIcon /> : undefined}
              iconPosition="start"
              label={isMobile ? undefined : "Comments"}
              value="comments"
            />
          </Tabs>
        </Container>
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'map' && (
          <Box sx={{ flexGrow: 1, height: { xs: 'calc(100vh - 160px)', md: 'calc(100vh - 180px)' } }}>
            <MapContainer
              project={project}
              onMapClick={handleMapClick}
              isAddingComment={addingComment}
            />
            {addingComment && commentLocation && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 20,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: { xs: '95%', sm: '80%', md: '50%' },
                  maxWidth: 600,
                  zIndex: 1200,
                }}
              >
                <Paper elevation={3}>
                  <CommentForm
                    projectId={project._id}
                    location={commentLocation}
                    onCancel={handleCancelComment}
                    onSubmit={handleCommentSubmit}
                  />
                </Paper>
              </Box>
            )}
          </Box>
        )}

        {activeTab === 'comments' && (
          <Box sx={{ flexGrow: 1, py: 2 }}>
            <Container maxWidth="xl">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h2">
                  Community Feedback
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={user ? <AddIcon /> : <LoginIcon />}
                  onClick={handleAddComment}
                >
                  {user ? 'Add Comment' : 'Login to Comment'}
                </Button>
              </Box>
              <Paper sx={{ height: { xs: 'calc(100vh - 250px)', md: 'calc(100vh - 280px)' } }}>
                <CommentList
                  projectId={project._id}
                  maxHeight="100%"
                />
              </Paper>
            </Container>
          </Box>
        )}
      </Box>

      {/* Add Comment FAB for mobile */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          <Button
            variant="contained"
            color="secondary"
            sx={{ borderRadius: '50%', width: 56, height: 56, minWidth: 0 }}
            onClick={handleAddComment}
          >
            {user ? <AddIcon /> : <LoginIcon />}
          </Button>
        </Box>
      )}

      {/* Project Info Drawer */}
      <Drawer
        anchor="right"
        open={infoDrawerOpen}
        onClose={toggleInfoDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 400 },
            boxSizing: 'border-box',
            p: 3,
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            Project Information
          </Typography>
          <IconButton onClick={toggleInfoDrawer}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          {project.name}
        </Typography>
        
        <Typography variant="body1" paragraph>
          {project.description}
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Chip
            label={`Status: ${project.status.charAt(0).toUpperCase() + project.status.slice(1)}`}
            color={project.status === 'active' ? 'success' : 'default'}
            sx={{ mr: 1, mb: 1 }}
          />
          
          <Chip
            label={`Started: ${new Date(project.startDate).toLocaleDateString()}`}
            sx={{ mr: 1, mb: 1 }}
          />
          
          {project.endDate && (
            <Chip
              label={`Ends: ${new Date(project.endDate).toLocaleDateString()}`}
              sx={{ mr: 1, mb: 1 }}
            />
          )}
        </Box>
        
        <Typography variant="subtitle1" gutterBottom>
          Engagement Settings
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2">
            • {project.settings.allowAnonymousComments ? 'Anonymous comments are allowed' : 'Login required for comments'}
          </Typography>
          <Typography variant="body2">
            • {project.settings.enableVoting ? 'Comment voting is enabled' : 'Comment voting is disabled'}
          </Typography>
          <Typography variant="body2">
            • {project.settings.enableImageUploads ? 'Image uploads are allowed' : 'Image uploads are disabled'}
          </Typography>
          <Typography variant="body2">
            • {project.settings.requireModeration ? 'Comments require moderation' : 'Moderation is not required'}
          </Typography>
        </Box>
        
        <Typography variant="subtitle1" gutterBottom>
          Project Statistics
        </Typography>
        
        <Box>
          <Typography variant="body2">
            Total Comments: {project.commentCount || 0}
          </Typography>
          <Typography variant="body2">
            Last Updated: {new Date(project.updatedAt).toLocaleDateString()}
          </Typography>
        </Box>
      </Drawer>
    </Box>
  );
};

export default ProjectPage;

// client/src/types/Project.ts
export interface Project {
  _id: string;
  name: string;
  description: string;
  slug: string;
  startDate: string | Date;
  endDate?: string | Date | null;
  status: 'draft' | 'active' | 'archived';
  basemap: string;
  layers: Layer[];
  bounds?: {
    north: number;
    east: number;
    south: number;
    west: number;
  };
  owner: string; // User ID
  organization?: string;
  settings: {
    allowAnonymousComments: boolean;
    requireModeration: boolean;
    enableAIModeration: boolean;
    aiProvider?: string;
    enableVoting: boolean;
    enableImageUploads: boolean;
    enableSocialSharing: boolean;
  };
  commentCount?: number;
  createdAt: string;
  updatedAt: string;
}

// client/src/types/Layer.ts
export interface Layer {
  _id: string;
  name: string;
  description?: string;
  type: 'kml' | 'kmz' | 'geojson' | 'wms' | 'vector' | 'raster';
  fileName?: string;
  fileSize?: number;
  url: string;
  owner: string; // User ID
  organization?: string;
  public: boolean;
  projects: string[]; // Array of Project IDs
  visible: boolean;
  opacity: number;
  createdAt: string;
  updatedAt: string;
}

// client/src/types/Comment.ts
export interface Comment {
  _id: string;
  project: string | Project; // Project ID or Project object if populated
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }; // User object if not anonymous
  anonymous: boolean;
  anonymousName?: string;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  content: string;
  images: string[]; // Array of image URLs
  category?: string;
  status: 'pending' | 'approved' | 'rejected';
  moderationNotes?: string;
  moderatedBy?: string; // User ID
  moderatedAt?: string | Date;
  aiModerated: boolean;
  aiModerationScore?: number;
  aiModerationNotes?: string;
  votes: {
    upvotes: number;
    downvotes: number;
    voters: Array<{
      user: string;
      vote: 'up' | 'down';
      createdAt: string | Date;
    }>;
  };
  parentComment?: string; // Comment ID
  replies: string[]; // Array of Comment IDs
  createdAt: string;
  updatedAt: string;
}

// client/src/types/Report.ts
export interface Report {
  _id: string;
  name: string;
  description?: string;
  project: string | Project; // Project ID or Project object if populated
  type: 'comments' | 'engagement' | 'sentiment' | 'geographic' | 'custom';
  parameters: Record<string, any>;
  createdBy: string; // User ID
  lastRun?: string | Date;
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    nextRun?: string | Date;
    recipients: string[]; // Array of email addresses
  };
  createdAt: string;
  updatedAt: string;
}
