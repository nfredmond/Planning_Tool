import React from 'react';
import { Box, Container, Typography, Grid, Paper, Stack, useTheme } from '@mui/material';
import { 
  Map as MapIcon,
  People as PeopleIcon,
  Comment as CommentIcon,
  Insights as InsightsIcon
} from '@mui/icons-material';

// Mock data for dashboard statistics
const mockStats = {
  projects: {
    total: 12,
    active: 5,
    archived: 7
  },
  users: {
    total: 152,
    newThisWeek: 12
  },
  comments: {
    total: 348,
    pendingModeration: 24
  },
  engagement: {
    mapPins: 487,
    surveys: 218,
    discussions: 135
  }
};

// Mock data for recent activity
const mockActivity = [
  { id: 1, text: 'New user registered: John Smith', timestamp: '2 hours ago' },
  { id: 2, text: 'New comment on Downtown Bike Lane Network', timestamp: '4 hours ago' },
  { id: 3, text: 'Project status updated: Main Street Pedestrian Plaza', timestamp: '6 hours ago' },
  { id: 4, text: 'New feedback submitted for Bus Rapid Transit', timestamp: '8 hours ago' },
  { id: 5, text: 'System backup completed successfully', timestamp: '10 hours ago' }
];

const AdminDashboard: React.FC = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Dashboard statistic cards */}
        <Grid item xs={12} md={3}>
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
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <MapIcon sx={{ mr: 1 }} />
              <Typography variant="h5">
                Projects
              </Typography>
            </Box>
            <Typography variant="h2" component="div" sx={{ my: 2 }}>
              {mockStats.projects.total}
            </Typography>
            <Typography variant="body2" sx={{ mt: 'auto' }}>
              {mockStats.projects.active} active, {mockStats.projects.archived} archived
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
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
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PeopleIcon sx={{ mr: 1 }} />
              <Typography variant="h5">
                Users
              </Typography>
            </Box>
            <Typography variant="h2" component="div" sx={{ my: 2 }}>
              {mockStats.users.total}
            </Typography>
            <Typography variant="body2" sx={{ mt: 'auto' }}>
              {mockStats.users.newThisWeek} new this week
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
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
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CommentIcon sx={{ mr: 1 }} />
              <Typography variant="h5">
                Comments
              </Typography>
            </Box>
            <Typography variant="h2" component="div" sx={{ my: 2 }}>
              {mockStats.comments.total}
            </Typography>
            <Typography variant="body2" sx={{ mt: 'auto' }}>
              {mockStats.comments.pendingModeration} awaiting moderation
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 200,
              bgcolor: 'success.main',
              color: 'success.contrastText',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <InsightsIcon sx={{ mr: 1 }} />
              <Typography variant="h5">
                Engagement
              </Typography>
            </Box>
            <Typography variant="h2" component="div" sx={{ my: 2 }}>
              {mockStats.engagement.mapPins + mockStats.engagement.surveys + mockStats.engagement.discussions}
            </Typography>
            <Typography variant="body2" sx={{ mt: 'auto' }}>
              {mockStats.engagement.mapPins} map pins, {mockStats.engagement.surveys} survey responses
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
              {mockActivity.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                  }}
                >
                  <Typography variant="body1">
                    {item.text}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.timestamp}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Usage Statistics
            </Typography>
            <Box sx={{ p: 2 }}>
              <Typography variant="body1" gutterBottom>
                Most Active Project: Downtown Revitalization
              </Typography>
              <Typography variant="body1" gutterBottom>
                Most Commented Feature: Main Street Pedestrian Crossing
              </Typography>
              <Typography variant="body1" gutterBottom>
                Busiest Day: Monday (32% of all activity)
              </Typography>
              <Typography variant="body1" gutterBottom>
                Average Session Time: 12 minutes
              </Typography>
              <Typography variant="body1" gutterBottom>
                Mobile vs Desktop: 68% Mobile, 32% Desktop
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* System Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              System Status
            </Typography>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Database</Typography>
                <Typography variant="body1" sx={{ color: 'success.main' }}>Healthy</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Storage</Typography>
                <Typography variant="body1" sx={{ color: 'success.main' }}>68% Free</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">API Services</Typography>
                <Typography variant="body1" sx={{ color: 'success.main' }}>All Operational</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Last Backup</Typography>
                <Typography variant="body1">12 hours ago</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Server Load</Typography>
                <Typography variant="body1" sx={{ color: 'success.main' }}>Normal (24%)</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard; 