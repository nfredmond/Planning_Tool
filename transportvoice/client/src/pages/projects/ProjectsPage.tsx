import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Pagination,
  useTheme,
  Paper,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Comment as CommentIcon,
  PeopleAlt as PeopleIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { getProjects } from '../../services/projectService';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const ProjectsPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const projectsPerPage = 6;

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await getProjects();
        setProjects(data);
        setTotalPages(Math.ceil(data.length / projectsPerPage));
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
    setPage(1);
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setCategory(event.target.value);
    setPage(1);
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatus(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Filter projects based on search, category, and status
  const filteredProjects = projects.filter(project => {
    const matchesSearch = searchText === '' || 
      project.name.toLowerCase().includes(searchText.toLowerCase()) || 
      project.description.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesCategory = category === '' || project.projectType === category;
    const matchesStatus = status === '' || project.status === status;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Paginate projects
  const paginatedProjects = filteredProjects.slice(
    (page - 1) * projectsPerPage,
    page * projectsPerPage
  );

  // Get unique categories
  const categories = [...new Set(projects.map(project => project.projectType))];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Transportation Projects
        </Typography>
        {user && (
          <Button
            component={RouterLink}
            to="/projects/new"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ my: 1 }}
          >
            Create Project
          </Button>
        )}
      </Box>
      
      <Paper elevation={0} sx={{ p: 2, mb: 4, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search projects..."
              value={searchText}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                onChange={handleCategoryChange}
                label="Category"
                displayEmpty
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                onChange={handleStatusChange}
                label="Status"
                displayEmpty
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredProjects.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">No projects found</Typography>
          <Typography color="textSecondary">Try adjusting your search criteria</Typography>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedProjects.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardActionArea component={RouterLink} to={`/projects/${project.slug}`}>
                    <CardMedia
                      component="img"
                      height="160"
                      image={project.image || '/images/project-placeholder.jpg'}
                      alt={project.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h5" component="h2">
                        {project.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {project.description.length > 120 
                          ? `${project.description.substring(0, 120)}...` 
                          : project.description}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        <Chip 
                          size="small" 
                          label={project.projectType} 
                          color="primary" 
                          variant="outlined" 
                        />
                        <Chip 
                          size="small" 
                          label={project.status} 
                          color={
                            project.status === 'active' ? 'success' : 
                            project.status === 'draft' ? 'info' : 'default'
                          } 
                        />
                      </Box>
                      <Divider sx={{ mb: 1.5 }} />
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        color: 'text.secondary',
                        fontSize: '0.875rem'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarIcon fontSize="small" sx={{ mr: 0.5 }} />
                          {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                        </Box>
                        {project.comments && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CommentIcon fontSize="small" sx={{ mr: 0.5 }} />
                            {project.comments.length || 0}
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default ProjectsPage; 