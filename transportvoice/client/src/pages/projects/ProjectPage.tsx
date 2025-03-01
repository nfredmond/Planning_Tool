import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  CircularProgress, 
  Paper, 
  Grid 
} from '@mui/material';

// Create a placeholder ProjectPage component
const ProjectPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading project data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [slug]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error" variant="h5" gutterBottom>
            Error Loading Project
          </Typography>
          <Typography>{error}</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Project: {slug}
      </Typography>
      
      <Grid container spacing={4} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Project Details</Typography>
            <Typography paragraph>
              This is a placeholder for the project details page. In a real application, 
              this would display information about the transportation project with slug: {slug}.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Project Stats</Typography>
            <Typography paragraph>
              Comments: 0
            </Typography>
            <Typography paragraph>
              Participants: 0
            </Typography>
            <Typography paragraph>
              Last Updated: {new Date().toLocaleDateString()}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProjectPage; 