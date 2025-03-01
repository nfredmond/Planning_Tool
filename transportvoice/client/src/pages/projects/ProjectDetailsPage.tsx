import React from 'react';
import { Box, Typography, Container, Paper, Grid } from '@mui/material';

const ProjectDetailsPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Project Details
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="body1">
                Project details content will be displayed here.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">AI Assistant</Typography>
              <Typography variant="body2">
                AI Assistant placeholder - will be implemented later.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ProjectDetailsPage; 