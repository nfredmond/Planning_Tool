import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Divider,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Paper,
  useTheme,
  Badge,
  Drawer
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Forum as ForumIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Comment as CommentIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  FilterAlt as FilterAltIcon,
  MoreVert as MoreVertIcon,
  SortByAlpha as SortIcon,
  SmartToy as SmartToyIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import LLMAssistant from '../components/LLMAssistant';

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
      id={`forum-tabpanel-${index}`}
      aria-labelledby={`forum-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Mock forum categories
const forumCategories = [
  { id: 1, name: 'General Discussion', icon: '💬', count: 42 },
  { id: 2, name: 'Project Ideas', icon: '💡', count: 28 },
  { id: 3, name: 'Events & Meetups', icon: '📅', count: 15 },
  { id: 4, name: 'Technical Support', icon: '🔧', count: 19 },
  { id: 5, name: 'Feature Requests', icon: '✨', count: 31 },
];

// Mock discussion threads
const mockThreads = [
  {
    id: 1,
    title: 'Suggestions for improving bicycle infrastructure downtown',
    author: {
      name: 'BikeCommuter',
      avatar: 'https://via.placeholder.com/40'
    },
    category: 'Project Ideas',
    views: 246,
    replies: 18,
    likes: 34,
    isLiked: false,
    isSticky: true,
    lastActivity: '2 hours ago',
    tags: ['Transportation', 'Infrastructure', 'Urban Design']
  },
  {
    id: 2,
    title: 'When will the new community center construction begin?',
    author: {
      name: 'CommunityMember',
      avatar: 'https://via.placeholder.com/40'
    },
    category: 'General Discussion',
    views: 189,
    replies: 7,
    likes: 12,
    isLiked: true,
    isSticky: false,
    lastActivity: '5 hours ago',
    tags: ['Public Facilities', 'Construction', 'Timeline']
  },
  {
    id: 3,
    title: 'Monthly neighborhood cleanup - volunteers needed',
    author: {
      name: 'GreenSpace',
      avatar: 'https://via.placeholder.com/40'
    },
    category: 'Events & Meetups',
    views: 120,
    replies: 23,
    likes: 41,
    isLiked: false,
    isSticky: true,
    lastActivity: '1 day ago',
    tags: ['Environment', 'Volunteer', 'Community Event']
  },
  {
    id: 4,
    title: 'Issue with map layer not displaying correctly',
    author: {
      name: 'TechUser',
      avatar: 'https://via.placeholder.com/40'
    },
    category: 'Technical Support',
    views: 65,
    replies: 4,
    likes: 2,
    isLiked: false,
    isSticky: false,
    lastActivity: '3 days ago',
    tags: ['Map', 'Technical Issue', 'Bug Report']
  },
  {
    id: 5,
    title: 'Request for more detailed demographic data',
    author: {
      name: 'DataAnalyst',
      avatar: 'https://via.placeholder.com/40'
    },
    category: 'Feature Requests',
    views: 78,
    replies: 9,
    likes: 15,
    isLiked: true,
    isSticky: false,
    lastActivity: '4 days ago',
    tags: ['Data', 'Demographics', 'Enhancement']
  },
  {
    id: 6,
    title: 'Ideas for new park in the eastern neighborhood',
    author: {
      name: 'ParkLover',
      avatar: 'https://via.placeholder.com/40'
    },
    category: 'Project Ideas',
    views: 210,
    replies: 32,
    likes: 47,
    isLiked: false,
    isSticky: false,
    lastActivity: '1 week ago',
    tags: ['Parks', 'Recreation', 'Eastern District']
  }
];

const CommunityForumsPage = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [likedThreads, setLikedThreads] = useState<number[]>([]);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleLikeToggle = (threadId: number) => {
    if (likedThreads.includes(threadId)) {
      setLikedThreads(likedThreads.filter(id => id !== threadId));
    } else {
      setLikedThreads([...likedThreads, threadId]);
    }
  };
  
  const toggleAssistant = () => {
    setAssistantOpen(!assistantOpen);
  };

  // Filter threads based on search term
  const filteredThreads = mockThreads.filter(thread => 
    thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Community Forums
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<SmartToyIcon />}
            onClick={toggleAssistant}
          >
            AI Assistant
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
          >
            New Thread
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left sidebar - Categories */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, mb: { xs: 3, md: 0 } }}>
            <Typography variant="h6" gutterBottom>
              Categories
            </Typography>
            <List disablePadding>
              {forumCategories.map(category => (
                <ListItem 
                  key={category.id} 
                  button
                  sx={{ 
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.08)' 
                        : 'rgba(0,0,0,0.04)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Typography variant="h6" sx={{ mr: 1, width: 24, textAlign: 'center' }}>
                      {category.icon}
                    </Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1">
                        {category.name}
                      </Typography>
                    </Box>
                    <Chip 
                      label={category.count} 
                      size="small" 
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </ListItem>
              ))}
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <List disablePadding>
              <ListItem button>
                <ListItemText primary="Trending Discussions" />
              </ListItem>
              <ListItem button>
                <ListItemText primary="Unanswered Questions" />
              </ListItem>
              <ListItem button>
                <ListItemText primary="My Discussions" />
              </ListItem>
              <ListItem button>
                <ListItemText primary="Forum Guidelines" />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Main content area */}
        <Grid item xs={12} md={9}>
          {/* Search and filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search discussions..."
                  variant="outlined"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<FilterAltIcon />}
                    fullWidth
                    size="medium"
                  >
                    Filter
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<SortIcon />}
                    fullWidth
                    size="medium"
                  >
                    Sort
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="forum tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="All Discussions" />
              <Tab label="Recent" />
              <Tab label="Popular" />
              <Tab label="Unanswered" />
              <Tab label="My Discussions" />
            </Tabs>
          </Box>

          {/* Tab content */}
          <TabPanel value={tabValue} index={0}>
            {filteredThreads.length > 0 ? (
              <List disablePadding>
                {filteredThreads.map((thread) => (
                  <React.Fragment key={thread.id}>
                    <Paper 
                      sx={{ 
                        mb: 2,
                        border: thread.isSticky ? `1px solid ${theme.palette.primary.main}` : 'none',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          boxShadow: 2
                        }
                      }}
                    >
                      {thread.isSticky && (
                        <Box 
                          sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            px: 1,
                            py: 0.5,
                            borderBottomLeftRadius: 4,
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}
                        >
                          Pinned
                        </Box>
                      )}
                      <ListItem 
                        alignItems="flex-start"
                        secondaryAction={
                          <IconButton edge="end">
                            <MoreVertIcon />
                          </IconButton>
                        }
                        sx={{ pt: 2, pb: 1 }}
                      >
                        <ListItemAvatar>
                          <Avatar src={thread.author.avatar} alt={thread.author.name} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="h6" component="div" sx={{ fontSize: '1.1rem' }}>
                              {thread.title}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, fontSize: '0.875rem' }}>
                                <Typography variant="body2" color="text.secondary" component="span">
                                  By {thread.author.name} in {thread.category} • {thread.lastActivity}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                {thread.tags.map((tag, index) => (
                                  <Chip key={index} label={tag} size="small" variant="outlined" />
                                ))}
                              </Box>
                            </>
                          }
                        />
                      </ListItem>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-around', 
                          p: 1,
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? 'rgba(255,255,255,0.03)' 
                            : 'rgba(0,0,0,0.02)',
                          borderTop: `1px solid ${theme.palette.divider}`
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <VisibilityIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {thread.views}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CommentIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {thread.replies}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleLikeToggle(thread.id)}
                            color={likedThreads.includes(thread.id) ? 'primary' : 'default'}
                          >
                            {likedThreads.includes(thread.id) ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                          </IconButton>
                          <Typography variant="body2" color="text.secondary">
                            {thread.likes + (likedThreads.includes(thread.id) !== thread.isLiked ? 1 : 0)}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <QuestionAnswerIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3 }} />
                <Typography variant="h6" gutterBottom>
                  No discussions found
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Try adjusting your search criteria or start a new discussion.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                >
                  New Discussion
                </Button>
              </Box>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography>Recent discussions will appear here</Typography>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography>Popular discussions will appear here</Typography>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography>Unanswered questions will appear here</Typography>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Typography>Your discussions will appear here</Typography>
          </TabPanel>

          {/* Mobile new discussion button */}
          <Box 
            sx={{ 
              position: 'fixed', 
              bottom: 16, 
              right: 16, 
              display: { xs: 'block', sm: 'none' } 
            }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<AddIcon />}
              sx={{ borderRadius: 28 }}
            >
              New
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* AI Assistant Drawer */}
      <Drawer
        anchor="right"
        open={assistantOpen}
        onClose={toggleAssistant}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 }, p: 0 }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: theme.palette.primary.main, color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SmartToyIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Community Assistant</Typography>
          </Box>
          <IconButton onClick={toggleAssistant} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ p: 2 }}>
          <LLMAssistant 
            title="Community Discussion Assistant"
            placeholder="Ask for help with community discussions, forum etiquette, or get suggestions for posting..."
            systemMessage="You are a community forum assistant. Help users craft constructive forum posts, follow discussion etiquette, summarize discussions, and provide relevant information for transportation and urban planning discussions."
            contextData={{
              currentView: 'Community Forums',
              popularTopics: 'Transit improvements, Bicycle infrastructure, Pedestrian safety, Traffic congestion',
              userRole: 'Community Member'
            }}
          />
        </Box>
      </Drawer>
    </Container>
  );
};

export default CommunityForumsPage; 