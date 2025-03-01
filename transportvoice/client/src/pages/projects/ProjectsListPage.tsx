import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Chip,
  Divider,
  Paper,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Map as MapIcon,
  Comment as CommentIcon,
  Today as TodayIcon,
} from '@mui/icons-material';

// Type definition for a project
interface Project {
  _id: string;
  name: string;
  slug: string;
  description: string;
  status: 'active' | 'archived';
  commentCount: number;
  createdAt: string;
}

// Simple mock data for projects
const mockProjects: Project[] = [
  {
    _id: '1',
    name: 'Downtown Bike Lane Network',
    slug: 'downtown-bike-lanes',
    description: 'A network of protected bike lanes connecting key destinations in the downtown area.',
    status: 'active',
    commentCount: 42,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '2',
    name: 'Bus Rapid Transit East-West Corridor',
    slug: 'brt-east-west',
    description: 'A new Bus Rapid Transit line connecting eastern and western suburbs through downtown.',
    status: 'active',
    commentCount: 87,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '3',
    name: 'Main Street Pedestrian Plaza',
    slug: 'main-street-pedestrian',
    description: 'Converting Main Street into a pedestrian-only plaza with outdoor seating and greenery.',
    status: 'active',
    commentCount: 63,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '4',
    name: 'Airport Light Rail Extension',
    slug: 'airport-light-rail',
    description: 'Extending the light rail system to connect the airport with downtown and major suburbs.',
    status: 'active',
    commentCount: 104,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '5',
    name: 'Harbor Bridge Rehabilitation',
    slug: 'harbor-bridge',
    description: 'Major rehabilitation of the Harbor Bridge including structural repairs and pedestrian improvements.',
    status: 'archived',
    commentCount: 52,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const ProjectsListPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const projectsPerPage = 9;

  useEffect(() => {
    // Simulate fetching projects from an API
    const fetchProjects = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProjects(mockProjects);
        setTotalPages(Math.ceil(mockProjects.length / projectsPerPage));
      } catch (err) {
        setError('Failed to load projects. Please try again.');
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Filter and paginate projects
  const filteredProjects = projects
    .filter((project) => {
      // Filter by status
      if (statusFilter !== 'all' && project.status !== statusFilter) {
        return false;
      }
      
      // Search term filter
      const searchLower = searchTerm.toLowerCase();
      return (
        searchTerm === '' ||
        project.name.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower)
      );
    });
  
  const paginatedProjects = filteredProjects.slice(
    (page - 1) * projectsPerPage,
    page * projectsPerPage
  );

  return (
    <Box>
      {/* Hero Banner */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: 6,
          mb: 4,
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h1" gutterBottom>
            Transportation Projects
          </Typography>
          <Typography variant="h6">
            Explore and engage with transportation initiatives in your community
          </Typography>
        </Container>
      </Box>
      
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        {/* Filters */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  label="Status"
                >
                  <MenuItem value="all">All Projects</MenuItem>
                  <MenuItem value="active">Active Projects</MenuItem>
                  <MenuItem value="archived">Archived Projects</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Typography variant="body2" color="text.secondary">
                  {filteredProjects.length} projects found
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Projects Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="error">{error}</Typography>
            <Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>
              Try Again
            </Button>
          </Paper>
        ) : filteredProjects.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No projects found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Try changing your search or filter criteria
            </Typography>
          </Paper>
        ) : (
          <>
            <Grid container spacing={4}>
              {paginatedProjects.map((project) => (
                <Grid item key={project._id} xs={12} sm={6} md={4}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        height: 140,
                        bgcolor: 'grey.200',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                        }}
                      >
                        <Chip
                          label={project.status}
                          color={project.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                    </Box>
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h5" component="h2" gutterBottom>
                        {project.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {project.description.substring(0, 120)}
                        {project.description.length > 120 ? '...' : ''}
                      </Typography>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CommentIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                            {project.commentCount || 0} comments
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TodayIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                            {new Date(project.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                    
                    <CardActions>
                      <Button
                        component={RouterLink}
                        to={`/projects/${project.slug}`}
                        fullWidth
                        variant="contained"
                        startIcon={<MapIcon />}
                      >
                        View Project
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size={isMobile ? 'small' : 'medium'}
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default ProjectsListPage; 