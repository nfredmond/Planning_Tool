import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Description as ContentIcon,
  Paid as RevenueIcon,
  Settings as SettingsIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';

// Import AdminDashboard components and convert to TypeScript
import AdminDashboard from '../../components/admin/admin-dashboard';

// Add import for ProjectsConfigPage
import ProjectsConfigPage from './ProjectsPage';

// Import AI components
import CommentModerationSystem from '../../components/ai/CommentModerationSystem';
import LLMPanel from '../../components/ai/LLMPanel';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
      style={{ width: '100%' }}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
};

const AdminPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 6 }}>
      <Paper sx={{ borderRadius: 0, boxShadow: 1, mb: 3 }}>
        <Container maxWidth="xl">
          <Box sx={{ py: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Administration
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage your TransportVoice platform
            </Typography>
          </Box>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="admin navigation tabs"
            sx={{
              '& .MuiTab-root': { minHeight: 64 },
            }}
          >
            <Tab
              icon={<DashboardIcon />}
              label="Dashboard"
              {...a11yProps(0)}
              sx={{ textTransform: 'none' }}
            />
            <Tab
              icon={<PeopleIcon />}
              label="Users"
              {...a11yProps(1)}
              sx={{ textTransform: 'none' }}
            />
            <Tab
              icon={<ContentIcon />}
              label="Projects"
              {...a11yProps(2)}
              sx={{ textTransform: 'none' }}
            />
            <Tab
              icon={<RevenueIcon />}
              label="Engagement"
              {...a11yProps(3)}
              sx={{ textTransform: 'none' }}
            />
            <Tab
              icon={<SettingsIcon />}
              label="Settings"
              {...a11yProps(4)}
              sx={{ textTransform: 'none' }}
            />
            <Tab
              icon={<CommentIcon />}
              label="Comments"
              {...a11yProps(5)}
              sx={{ textTransform: 'none' }}
            />
          </Tabs>
        </Container>
      </Paper>

      <Container maxWidth="xl">
        <TabPanel value={tabValue} index={0}>
          <AdminDashboard />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              User Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage users, assign roles, and review activity
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  User List
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  A table of users would be displayed here with filtering and pagination.
                </Typography>
                
                {/* Placeholder for user management interface */}
                <Box
                  sx={{
                    height: '300px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle1" color="text.secondary">
                    User Management Interface
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Project Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create, edit, and moderate projects and feedback
            </Typography>
          </Box>
          
          <ProjectsConfigPage />
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Engagement Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track user engagement and feedback across projects
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Engagement Metrics
                </Typography>
                
                {/* Placeholder for engagement charts */}
                <Box
                  sx={{
                    height: '400px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle1" color="text.secondary">
                    Engagement Charts and Metrics
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              System Settings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Configure platform settings and integrations
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  General Settings
                </Typography>
                
                {/* Placeholder for settings */}
                <Box
                  sx={{
                    height: '300px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle1" color="text.secondary">
                    General Settings Interface
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Integration Settings
                </Typography>
                
                {/* Placeholder for settings */}
                <Box
                  sx={{
                    height: '300px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle1" color="text.secondary">
                    Integration Settings Interface
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={5}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Comment Moderation
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Review and moderate user comments with AI assistance
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Comment Moderation Queue
                </Typography>
                
                <CommentModerationSystem />
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  AI Comment Analysis
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Use AI to analyze comment sentiment, identify potential issues, and get moderation suggestions.
                </Typography>
                
                <LLMPanel 
                  projectId="comment-moderation"
                  onInsightsGenerated={(insights) => console.log("Comment insights:", insights)}
                />
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Container>
    </Box>
  );
};

export default AdminPage; 