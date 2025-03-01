import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  Button,
  TextField,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Chip,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Badge,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Notifications as NotificationsIcon,
  Star as StarIcon,
  History as HistoryIcon,
  Comment as CommentIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Map as MapIcon,
  ForumOutlined as ForumIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  ArrowBack as ArrowBackIcon,
  VolumeUp as VoiceIcon,
  Assignment as ProjectsIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Mock data for user profile
const mockUserData = {
  id: '123',
  name: 'Jane Smith',
  email: 'jane.smith@example.com',
  avatar: '/avatar-placeholder.jpg',
  location: 'Downtown',
  phone: '(555) 123-4567',
  bio: 'Passionate about improving public transportation and creating walkable communities.',
  joinDate: '2023-05-12',
  preferences: {
    notifications: {
      email: true,
      push: true,
      projectUpdates: true,
      comments: true,
      events: true,
    },
    privacy: {
      showEmail: false,
      showPhone: false,
      showLocation: true,
      allowProfileVisits: true,
    },
    mapPreferences: {
      defaultView: 'satellite',
      showLabels: true,
      showTraffic: false,
    },
  },
  contributions: [
    { 
      id: '1', 
      type: 'comment', 
      content: 'I think we need more bike lanes on Oak Street.', 
      date: '2023-09-15', 
      project: { id: '101', name: 'Downtown Transit Corridor' },
      likes: 12 
    },
    { 
      id: '2', 
      type: 'forum', 
      content: 'Has anyone else noticed the lack of pedestrian crossings near the school?', 
      date: '2023-10-02', 
      topic: 'Pedestrian Safety',
      replies: 8 
    },
    { 
      id: '3', 
      type: 'voice', 
      content: 'Voice comment about bike lane design', 
      date: '2023-10-10', 
      project: { id: '102', name: 'Bike Network Expansion' },
      duration: '1:23' 
    },
  ],
  savedProjects: [
    { id: '101', name: 'Downtown Transit Corridor', date: '2023-08-10' },
    { id: '102', name: 'Bike Network Expansion', date: '2023-09-05' },
    { id: '103', name: 'Pedestrian Safety Improvements', date: '2023-10-01' },
  ],
  badges: [
    { id: '1', name: 'Frequent Contributor', icon: 'star', date: '2023-07-15' },
    { id: '2', name: 'Idea Champion', icon: 'lightbulb', date: '2023-08-22' },
    { id: '3', name: 'Community Voice', icon: 'forum', date: '2023-09-30' },
  ]
};

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState(mockUserData);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Check if viewing own profile or another user's profile
  const isOwnProfile = !userId || userId === currentUser?.id;
  
  useEffect(() => {
    // In a real app, fetch user data based on userId or current user
    // For now, using mock data
  }, [userId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Save changes
      setNotification({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });
    }
    setEditMode(!editMode);
  };

  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };

  const handlePreferenceChange = (category: string, setting: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({
      ...userData,
      preferences: {
        ...userData.preferences,
        [category]: {
          ...userData.preferences[category],
          [setting]: event.target.checked
        }
      }
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          {isOwnProfile ? 'My Profile' : `${userData.name}'s Profile`}
        </Typography>
      </Box>
      
      <Grid container spacing={4}>
        {/* Left Column - User Details */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  isOwnProfile && editMode ? (
                    <IconButton size="small" sx={{ bgcolor: 'primary.main', color: 'white' }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  ) : null
                }
              >
                <Avatar 
                  src={userData.avatar} 
                  alt={userData.name}
                  sx={{ width: 120, height: 120, mb: 2 }}
                />
              </Badge>
              
              {editMode ? (
                <TextField
                  fullWidth
                  label="Name"
                  variant="outlined"
                  defaultValue={userData.name}
                  margin="normal"
                />
              ) : (
                <Typography variant="h5" gutterBottom align="center">
                  {userData.name}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                {editMode ? (
                  <TextField
                    fullWidth
                    label="Location"
                    variant="outlined"
                    defaultValue={userData.location}
                    size="small"
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {userData.location}
                  </Typography>
                )}
              </Box>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Member since {new Date(userData.joinDate).toLocaleDateString()}
              </Typography>

              {isOwnProfile && (
                <Button
                  variant={editMode ? "contained" : "outlined"}
                  color={editMode ? "primary" : "secondary"}
                  startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                  sx={{ mt: 2 }}
                  onClick={handleEditToggle}
                >
                  {editMode ? "Save Profile" : "Edit Profile"}
                </Button>
              )}
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Contact Information
              </Typography>
              
              {editMode ? (
                <>
                  <TextField
                    fullWidth
                    label="Email"
                    variant="outlined"
                    defaultValue={userData.email}
                    margin="normal"
                    type="email"
                    InputProps={{
                      startAdornment: (
                        <EmailIcon color="action" sx={{ mr: 1 }} />
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Phone"
                    variant="outlined"
                    defaultValue={userData.phone}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <PhoneIcon color="action" sx={{ mr: 1 }} />
                      ),
                    }}
                  />
                </>
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EmailIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {userData.preferences.privacy.showEmail ? userData.email : '(Hidden)'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {userData.preferences.privacy.showPhone ? userData.phone : '(Hidden)'}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                About Me
              </Typography>
              
              {editMode ? (
                <TextField
                  fullWidth
                  label="Bio"
                  variant="outlined"
                  defaultValue={userData.bio}
                  margin="normal"
                  multiline
                  rows={4}
                />
              ) : (
                <Typography variant="body2">
                  {userData.bio}
                </Typography>
              )}
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Badges
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {userData.badges.map(badge => (
                  <Chip 
                    key={badge.id}
                    label={badge.name}
                    icon={badge.icon === 'star' ? <StarIcon /> : 
                         badge.icon === 'lightbulb' ? <SecurityIcon /> : 
                         <ForumIcon />}
                    variant="outlined"
                    color="primary"
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Right Column - Tabs */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Activity" icon={<HistoryIcon />} iconPosition="start" />
              <Tab label="Saved Projects" icon={<StarIcon />} iconPosition="start" />
              <Tab label="Preferences" icon={<SettingsIcon />} iconPosition="start" disabled={!isOwnProfile} />
            </Tabs>
            
            {/* Activity Tab */}
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              
              <List>
                {userData.contributions.map((contribution) => (
                  <ListItem key={contribution.id} alignItems="flex-start" sx={{ mb: 2 }}>
                    <Paper elevation={1} sx={{ p: 2, width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {contribution.type === 'comment' ? 'Comment on Project' :
                           contribution.type === 'forum' ? 'Forum Post' :
                           'Voice Comment'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(contribution.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {contribution.type === 'comment' && <CommentIcon color="action" sx={{ mr: 1 }} />}
                        {contribution.type === 'forum' && <ForumIcon color="action" sx={{ mr: 1 }} />}
                        {contribution.type === 'voice' && <VoiceIcon color="action" sx={{ mr: 1 }} />}
                        
                        <Typography variant="body2" color="primary.main">
                          {contribution.project ? contribution.project.name : contribution.topic}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body1">
                        {contribution.content}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        {contribution.likes && (
                          <Chip 
                            icon={<StarIcon fontSize="small" />} 
                            label={`${contribution.likes} likes`} 
                            size="small" 
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />
                        )}
                        {contribution.replies && (
                          <Chip 
                            icon={<CommentIcon fontSize="small" />} 
                            label={`${contribution.replies} replies`} 
                            size="small" 
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />
                        )}
                        {contribution.duration && (
                          <Chip 
                            icon={<VoiceIcon fontSize="small" />} 
                            label={contribution.duration} 
                            size="small" 
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Paper>
                  </ListItem>
                ))}
              </List>
            </TabPanel>
            
            {/* Saved Projects Tab */}
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>
                Saved Projects
              </Typography>
              
              <Grid container spacing={3}>
                {userData.savedProjects.map((project) => (
                  <Grid item xs={12} sm={6} key={project.id}>
                    <Card sx={{ height: '100%' }}>
                      <CardHeader
                        avatar={
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <ProjectsIcon />
                          </Avatar>
                        }
                        title={project.name}
                        subheader={`Saved on ${new Date(project.date).toLocaleDateString()}`}
                        action={
                          <IconButton aria-label="remove from saved">
                            <StarIcon color="primary" />
                          </IconButton>
                        }
                      />
                      <CardContent>
                        <Button
                          variant="outlined"
                          size="small"
                          fullWidth
                          onClick={() => navigate(`/projects/${project.id}`)}
                        >
                          View Project
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
            
            {/* Preferences Tab */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Notification Settings
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <List disablePadding>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Email Notifications" 
                      secondary="Receive project updates and replies via email"
                    />
                    <Switch
                      edge="end"
                      checked={userData.preferences.notifications.email}
                      onChange={handlePreferenceChange('notifications', 'email')}
                      disabled={!editMode}
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Push Notifications" 
                      secondary="Receive notifications in your browser"
                    />
                    <Switch
                      edge="end"
                      checked={userData.preferences.notifications.push}
                      onChange={handlePreferenceChange('notifications', 'push')}
                      disabled={!editMode}
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemIcon>
                      <ProjectsIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Project Updates" 
                      secondary="Receive updates about projects you're following"
                    />
                    <Switch
                      edge="end"
                      checked={userData.preferences.notifications.projectUpdates}
                      onChange={handlePreferenceChange('notifications', 'projectUpdates')}
                      disabled={!editMode}
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemIcon>
                      <CommentIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Comment Notifications" 
                      secondary="Receive notifications when people reply to your comments"
                    />
                    <Switch
                      edge="end"
                      checked={userData.preferences.notifications.comments}
                      onChange={handlePreferenceChange('notifications', 'comments')}
                      disabled={!editMode}
                    />
                  </ListItem>
                </List>
              </Paper>
              
              <Typography variant="h6" gutterBottom>
                Privacy Settings
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <List disablePadding>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Show Email Address" 
                      secondary="Allow other users to see your email address"
                    />
                    <Switch
                      edge="end"
                      checked={userData.preferences.privacy.showEmail}
                      onChange={handlePreferenceChange('privacy', 'showEmail')}
                      disabled={!editMode}
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Show Phone Number" 
                      secondary="Allow other users to see your phone number"
                    />
                    <Switch
                      edge="end"
                      checked={userData.preferences.privacy.showPhone}
                      onChange={handlePreferenceChange('privacy', 'showPhone')}
                      disabled={!editMode}
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemIcon>
                      <LocationIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Show Location" 
                      secondary="Allow others to see your neighborhood or location"
                    />
                    <Switch
                      edge="end"
                      checked={userData.preferences.privacy.showLocation}
                      onChange={handlePreferenceChange('privacy', 'showLocation')}
                      disabled={!editMode}
                    />
                  </ListItem>
                </List>
              </Paper>
              
              <Typography variant="h6" gutterBottom>
                Map Preferences
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 2 }}>
                <List disablePadding>
                  <ListItem>
                    <ListItemIcon>
                      <MapIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Default Map View" 
                      secondary="Choose your preferred map style"
                    />
                    {editMode ? (
                      <FormControl sx={{ minWidth: 120 }}>
                        <Select
                          value={userData.preferences.mapPreferences.defaultView}
                          size="small"
                        >
                          <MenuItem value="standard">Standard</MenuItem>
                          <MenuItem value="satellite">Satellite</MenuItem>
                          <MenuItem value="terrain">Terrain</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {userData.preferences.mapPreferences.defaultView}
                      </Typography>
                    )}
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemIcon>
                      <MapIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Show Map Labels" 
                      secondary="Show street and place names on maps"
                    />
                    <Switch
                      edge="end"
                      checked={userData.preferences.mapPreferences.showLabels}
                      onChange={handlePreferenceChange('mapPreferences', 'showLabels')}
                      disabled={!editMode}
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemIcon>
                      <MapIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Show Traffic" 
                      secondary="Show real-time traffic information on maps"
                    />
                    <Switch
                      edge="end"
                      checked={userData.preferences.mapPreferences.showTraffic}
                      onChange={handlePreferenceChange('mapPreferences', 'showTraffic')}
                      disabled={!editMode}
                    />
                  </ListItem>
                </List>
              </Paper>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleNotificationClose} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserProfilePage; 