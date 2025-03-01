import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';

const ProjectDetailsPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Project Details Page
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1">
            This is a placeholder for the project details page.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProjectDetailsPage; 