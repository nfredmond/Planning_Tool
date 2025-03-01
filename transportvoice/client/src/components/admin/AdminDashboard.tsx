import React from 'react';
import { Box, Container, Typography, Grid, Paper, Stack } from '@mui/material';

const AdminDashboard: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Dashboard cards */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 200,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            <Typography variant="h5" gutterBottom>
              Projects
            </Typography>
            <Typography variant="h2">
              12
            </Typography>
            <Typography variant="body2" sx={{ mt: 'auto' }}>
              5 active, 7 archived
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 200,
              bgcolor: 'secondary.main',
              color: 'secondary.contrastText',
            }}
          >
            <Typography variant="h5" gutterBottom>
              Users
            </Typography>
            <Typography variant="h2">
              152
            </Typography>
            <Typography variant="body2" sx={{ mt: 'auto' }}>
              12 new this week
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 200,
              bgcolor: 'info.main',
              color: 'info.contrastText',
            }}
          >
            <Typography variant="h5" gutterBottom>
              Comments
            </Typography>
            <Typography variant="h2">
              348
            </Typography>
            <Typography variant="body2" sx={{ mt: 'auto' }}>
              24 awaiting moderation
            </Typography>
          </Paper>
        </Grid>
        
        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Recent Activity
            </Typography>
            
            <Stack spacing={2} sx={{ mt: 2 }}>
              {[1, 2, 3, 4, 5].map((item) => (
                <Box
                  key={item}
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                  }}
                >
                  <Typography variant="body1">
                    {item === 1 ? 'New user registered: John Smith' : ''}
                    {item === 2 ? 'New comment on Downtown Bike Lane Network' : ''}
                    {item === 3 ? 'Project status updated: Main Street Pedestrian Plaza' : ''}
                    {item === 4 ? 'New feedback submitted for Bus Rapid Transit' : ''}
                    {item === 5 ? 'System backup completed successfully' : ''}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {`${item * 2} hours ago`}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard; 