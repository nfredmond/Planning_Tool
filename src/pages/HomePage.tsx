import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  useTheme, 
  Fab, 
  Popover, 
  IconButton, 
  Badge, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActionArea, 
  CardActions,
  Container,
  Divider,
  Chip,
  LinearProgress,
  Avatar,
  AvatarGroup
} from '@mui/material';
import { 
  SmartToy, 
  Close, 
  ArrowForward, 
  Map as MapIcon, 
  Assignment as ProjectIcon, 
  Settings as AdminIcon, 
  Forum as ForumIcon,
  Star as StarIcon,
  DirectionsBus as TransitIcon,
  DirectionsBike as BikeIcon,
  DirectionsWalk as WalkIcon,
  Train as RailIcon
} from '@mui/icons-material';
import MapView from '../components/map/MapView';
import Sidebar from '../components/layout/Sidebar';
import LLMAssistant from '../components/LLMAssistant';
import PageTransition from '../components/layout/PageTransition';
import ProjectImageGenerator from '../components/projects/ProjectImageGenerator';

// Mock featured project data
const featuredProjects = [
  {
    id: '1',
    name: 'Downtown Transit Corridor',
    description: 'Improving public transit options in the downtown area with dedicated bus lanes and priority signaling.',
    type: 'Transit Improvement',
    projectType: 'bus',
    thumbnail: '/images/projects/downtown-transit.jpg',
    progress: 35,
    members: [
      { id: 'u1', name: 'Jane Smith', avatar: '/avatars/jane.jpg' },
      { id: 'u2', name: 'Michael Chen', avatar: '/avatars/michael.jpg' },
      { id: 'u3', name: 'Sarah Johnson', avatar: '/avatars/sarah.jpg' }
    ]
  },
  {
    id: '2',
    name: 'Green Bike Lane Network',
    description: 'Creating a comprehensive network of protected bike lanes connecting major destinations.',
    type: 'Bicycle Infrastructure',
    projectType: 'bike',
    thumbnail: '/images/projects/bike-network.jpg',
    progress: 68,
    members: [
      { id: 'u2', name: 'Michael Chen', avatar: '/avatars/michael.jpg' },
      { id: 'u4', name: 'David Patel', avatar: '/avatars/david.jpg' }
    ]
  },
  {
    id: '3',
    name: 'Westside Rail Extension',
    description: 'Extending the light rail system to serve the growing westside neighborhoods.',
    type: 'Rail Transit',
    projectType: 'train',
    thumbnail: '/images/projects/rail-extension.jpg',
    progress: 12,
    members: [
      { id: 'u1', name: 'Jane Smith', avatar: '/avatars/jane.jpg' },
      { id: 'u5', name: 'Lisa Wong', avatar: '/avatars/lisa.jpg' },
      { id: 'u6', name: 'Robert Taylor', avatar: '/avatars/robert.jpg' }
    ]
  }
];

const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleOpenSidebar = () => {
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  const handleOpenAssistant = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setAssistantOpen(true);
  };

  const handleCloseAssistant = () => {
    setAssistantOpen(false);
    setAnchorEl(null);
  };

  const navigateTo = (path: string) => {
    navigate(path);
  };

  const getProjectIcon = (type: string) => {
    switch (type) {
      case 'Transit Improvement':
        return <TransitIcon color="primary" />;
      case 'Bicycle Infrastructure':
        return <BikeIcon style={{ color: '#4caf50' }} />;
      case 'Rail Transit':
        return <RailIcon style={{ color: '#f57c00' }} />;
      default:
        return <ProjectIcon color="primary" />;
    }
  };

  return (
    <PageTransition>
      <Box sx={{ pb: 8 }}>
        {/* Hero Section with Map Background */}
        <Box 
          sx={{ 
            position: 'relative', 
            height: '70vh', 
            minHeight: '500px', 
            width: '100%', 
            overflow: 'hidden',
            mb: 6 
          }}
        >
          {/* Map component as background */}
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
            <MapView center={[39.7285, -121.8375]} zoom={15} />
          </Box>
          
          {/* Overlay content */}
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              padding: 4,
              background: 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.2))',
              zIndex: 2,
              pointerEvents: 'none'  // Let map receive mouse events
            }}
          >
            <Typography 
              variant="h2" 
              component="h1" 
              color="white" 
              fontWeight="bold"
              sx={{ mb: 2, textShadow: '2px 2px 4px rgba(0,0,0,0.8)', pointerEvents: 'auto' }}
            >
              Transportation Planning Tool
            </Typography>
            <Typography 
              variant="h5" 
              color="white"
              sx={{ mb: 4, maxWidth: 800, textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}
            >
              An advanced platform for planners to design, analyze, and share transportation projects with the community
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, pointerEvents: 'auto' }}>
              <Button 
                variant="contained" 
                size="large" 
                color="primary"
                onClick={() => navigateTo('/projects')}
                startIcon={<ProjectIcon />}
              >
                Explore Projects
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => navigateTo('/map')}
                startIcon={<MapIcon />}
                sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'rgba(255,255,255,1)' } }}
              >
                Open Map
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ mt: 6 }}>
          {/* Featured Projects Section */}
          <Box sx={{ mb: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" component="h2">
                Featured Projects
              </Typography>
              <Button 
                endIcon={<ArrowForward />}
                onClick={() => navigateTo('/projects')}
              >
                View All Projects
              </Button>
            </Box>
            
            <Grid container spacing={3}>
              {featuredProjects.map(project => (
                <Grid item xs={12} md={4} key={project.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardActionArea onClick={() => navigateTo(`/projects/${project.id}`)}>
                      <ProjectImageGenerator 
                        type={project.projectType as 'bus' | 'bike' | 'train'} 
                        height={160}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {getProjectIcon(project.type)}
                          <Typography variant="h6" component="h3" sx={{ ml: 1 }}>
                            {project.name}
                          </Typography>
                        </Box>
                        <Chip 
                          label={project.type} 
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {project.description}
                        </Typography>
                        <Box sx={{ mt: 'auto' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Progress:</Typography>
                            <Typography variant="body2">{project.progress}%</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={project.progress} 
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      </CardContent>
                    </CardActionArea>
                    <CardActions sx={{ justifyContent: 'space-between', alignItems: 'center', px: 2, pb: 2 }}>
                      <AvatarGroup max={3}>
                        {project.members.map(member => (
                          <Avatar 
                            key={member.id} 
                            src={member.avatar} 
                            alt={member.name}
                            sx={{ width: 32, height: 32 }}
                          />
                        ))}
                      </AvatarGroup>
                      <Button 
                        size="small" 
                        color="primary"
                        onClick={() => navigateTo(`/projects/${project.id}`)}
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Divider sx={{ my: 6 }} />

          {/* Quick Access Section */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" component="h2" sx={{ mb: 3 }}>
              Quick Access
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={3}
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)'
                    }
                  }}
                  onClick={() => navigateTo('/map')}
                >
                  <MapIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>Map Explorer</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Explore the interactive transportation map with various data layers
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={3}
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)'
                    }
                  }}
                  onClick={() => navigateTo('/projects')}
                >
                  <ProjectIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>Projects</Typography>
                  <Typography variant="body2" color="text.secondary">
                    View and manage transportation planning projects
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={3}
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)'
                    }
                  }}
                  onClick={() => navigateTo('/community-forums')}
                >
                  <ForumIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>Community Forums</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Participate in discussions about transportation projects
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  elevation={3}
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)'
                    }
                  }}
                  onClick={() => navigateTo('/admin')}
                >
                  <AdminIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>Admin Panel</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage users, settings, and map layers (Admin only)
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Container>

        {/* LLM Assistant Floating Button */}
        <Fab
          color="secondary"
          aria-label="AI Assistant"
          sx={{ position: 'fixed', bottom: 32, right: 32 }}
          onClick={handleOpenAssistant}
        >
          <SmartToy />
        </Fab>
        
        {/* LLM Assistant Popover */}
        <Popover
          open={assistantOpen}
          anchorEl={anchorEl}
          onClose={handleCloseAssistant}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          sx={{ 
            mt: -2,
            '& .MuiPopover-paper': {
              width: 350,
              maxHeight: 500,
              overflow: 'hidden',
              boxShadow: 8,
              borderRadius: 2
            }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
            <IconButton size="small" onClick={handleCloseAssistant}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
          <LLMAssistant 
            title="Transportation Planning Assistant"
            placeholder="Ask for help with transportation planning..."
            systemMessage="You are a helpful assistant specialized in transportation planning. Provide concise and relevant information to help users with their transportation planning needs."
          />
        </Popover>
      </Box>
    </PageTransition>
  );
};

export default HomePage; 