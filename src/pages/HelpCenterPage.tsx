import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  Button,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Chip,
} from '@mui/material';
import {
  HelpOutline as HelpIcon,
  School as TutorialIcon,
  QuestionAnswer as FAQIcon,
  Book as GuideIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  NavigateNext as NavigateNextIcon,
  PlayCircleOutline as PlayIcon,
  Download as DownloadIcon,
  Bookmark as BookmarkIcon,
  Assignment as DocumentIcon,
  ArrowBack as BackIcon,
  VideoLibrary as VideoIcon,
  InsertDriveFile as FileIcon,
  ContactSupport as SupportIcon,
} from '@mui/icons-material';

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
      id={`help-tabpanel-${index}`}
      aria-labelledby={`help-tab-${index}`}
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

// Mock data for guides
const userGuides = [
  {
    id: '1',
    title: 'Getting Started with the Planning Tool',
    description: 'Learn the basics of navigating and using the planning tool.',
    icon: 'guide',
    category: 'beginner',
    lastUpdated: '2023-11-15',
  },
  {
    id: '2',
    title: 'Creating Your First Project',
    description: 'Step-by-step guide to creating and configuring a new project.',
    icon: 'project',
    category: 'beginner',
    lastUpdated: '2023-11-20',
  },
  {
    id: '3',
    title: 'Advanced Map Editing',
    description: 'Techniques for creating detailed and accurate maps.',
    icon: 'map',
    category: 'advanced',
    lastUpdated: '2023-12-05',
  },
  {
    id: '4',
    title: 'Community Engagement Best Practices',
    description: 'Strategies for effective community outreach and feedback collection.',
    icon: 'community',
    category: 'intermediate',
    lastUpdated: '2023-12-10',
  },
  {
    id: '5',
    title: 'Analyzing Feedback Data',
    description: 'How to interpret and leverage community feedback in your planning process.',
    icon: 'analytics',
    category: 'advanced',
    lastUpdated: '2023-12-15',
  },
];

// Mock data for tutorials
const videoTutorials = [
  {
    id: '1',
    title: 'Planning Tool Overview',
    description: 'A quick tour of the main features and capabilities.',
    duration: '5:32',
    thumbnail: '/tutorial-thumbnail-1.jpg',
    category: 'beginner',
  },
  {
    id: '2',
    title: 'Map Layer Management',
    description: 'How to create, edit, and organize map layers effectively.',
    duration: '8:47',
    thumbnail: '/tutorial-thumbnail-2.jpg',
    category: 'intermediate',
  },
  {
    id: '3',
    title: 'Voice Comments & Accessibility',
    description: 'Using and managing voice comments for improved accessibility.',
    duration: '6:15',
    thumbnail: '/tutorial-thumbnail-3.jpg',
    category: 'beginner',
  },
  {
    id: '4',
    title: 'Advanced Project Configuration',
    description: 'Detailed settings and options for complex projects.',
    duration: '12:03',
    thumbnail: '/tutorial-thumbnail-4.jpg',
    category: 'advanced',
  },
];

// Mock data for FAQs
const faqs = [
  {
    id: '1',
    question: 'How do I reset my password?',
    answer: 'You can reset your password by clicking on the "Forgot Password" link on the login page. Follow the instructions sent to your email to create a new password.',
    category: 'account',
  },
  {
    id: '2',
    question: 'Can I export my project data?',
    answer: 'Yes, you can export project data in various formats including CSV, GeoJSON, and PDF reports. Go to your project page, click on the "Export" button, and select your desired format.',
    category: 'projects',
  },
  {
    id: '3',
    question: 'How do I add team members to my project?',
    answer: 'To add team members, navigate to your project settings and select the "Team" tab. Enter the email addresses of the people you want to invite and assign them appropriate roles.',
    category: 'projects',
  },
  {
    id: '4',
    question: 'What file formats are supported for map uploads?',
    answer: 'The Planning Tool supports various geospatial file formats including Shapefile, GeoJSON, KML, and GeoTIFF. Files should be under 50MB for optimal performance.',
    category: 'maps',
  },
  {
    id: '5',
    question: 'How are comments moderated in community forums?',
    answer: 'Comments are moderated based on community guidelines. Project administrators can review and approve comments before they are publicly visible if this setting is enabled.',
    category: 'community',
  },
  {
    id: '6',
    question: 'Can I integrate survey data from external tools?',
    answer: 'Yes, the Planning Tool supports importing survey data from popular platforms like SurveyMonkey, Google Forms, and Typeform using our API or CSV import functionality.',
    category: 'data',
  },
  {
    id: '7',
    question: 'How secure is the data I store in the Planning Tool?',
    answer: 'All data is encrypted at rest and in transit. We employ industry-standard security practices and regular security audits to protect your information.',
    category: 'security',
  },
];

const HelpCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | false>(false);
  const [filteredGuides, setFilteredGuides] = useState(userGuides);
  const [filteredTutorials, setFilteredTutorials] = useState(videoTutorials);
  const [filteredFaqs, setFilteredFaqs] = useState(faqs);

  // Check for context-specific help based on URL path
  useEffect(() => {
    const path = location.pathname;
    
    // Set default tab based on URL parameter or path
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    
    if (tab === 'guides') setTabValue(0);
    else if (tab === 'tutorials') setTabValue(1);
    else if (tab === 'faq') setTabValue(2);
    
    // If coming from specific page, we could set context-specific content
    // For example, if path includes 'map-editor', we could highlight map editing guides
  }, [location]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFaqExpand = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedFaq(isExpanded ? panel : false);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    
    // Filter content based on search query
    if (query) {
      setFilteredGuides(userGuides.filter(guide => 
        guide.title.toLowerCase().includes(query) || 
        guide.description.toLowerCase().includes(query)
      ));
      
      setFilteredTutorials(videoTutorials.filter(tutorial => 
        tutorial.title.toLowerCase().includes(query) || 
        tutorial.description.toLowerCase().includes(query)
      ));
      
      setFilteredFaqs(faqs.filter(faq => 
        faq.question.toLowerCase().includes(query) || 
        faq.answer.toLowerCase().includes(query)
      ));
    } else {
      setFilteredGuides(userGuides);
      setFilteredTutorials(videoTutorials);
      setFilteredFaqs(faqs);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Help Center
        </Typography>
      </Box>
      
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link color="inherit" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          Home
        </Link>
        <Typography color="text.primary">Help Center</Typography>
      </Breadcrumbs>
      
      <Paper sx={{ p: 2, mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search for help topics..."
          variant="outlined"
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<GuideIcon />} label="User Guides" iconPosition="start" />
          <Tab icon={<VideoIcon />} label="Video Tutorials" iconPosition="start" />
          <Tab icon={<FAQIcon />} label="FAQs" iconPosition="start" />
        </Tabs>
        
        {/* User Guides Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              User Guides
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Step-by-step instructions and best practices for using the Planning Tool effectively.
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            {filteredGuides.length > 0 ? (
              filteredGuides.map((guide) => (
                <Grid item xs={12} md={6} key={guide.id}>
                  <Card 
                    sx={{ 
                      display: 'flex', 
                      height: '100%',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                        cursor: 'pointer'
                      }
                    }}
                    onClick={() => navigate(`/help/guides/${guide.id}`)}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: '1 0 auto', p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {guide.icon === 'guide' && <GuideIcon color="primary" sx={{ mr: 1 }} />}
                        {guide.icon === 'project' && <DocumentIcon color="primary" sx={{ mr: 1 }} />}
                        {guide.icon === 'map' && <FileIcon color="primary" sx={{ mr: 1 }} />}
                        {guide.icon === 'community' && <SupportIcon color="primary" sx={{ mr: 1 }} />}
                        {guide.icon === 'analytics' && <TutorialIcon color="primary" sx={{ mr: 1 }} />}
                        <Typography variant="h6">{guide.title}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {guide.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                        <Chip 
                          label={guide.category.charAt(0).toUpperCase() + guide.category.slice(1)} 
                          size="small" 
                          color={
                            guide.category === 'beginner' ? 'success' : 
                            guide.category === 'intermediate' ? 'primary' : 
                            'secondary'
                          }
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Updated: {new Date(guide.lastUpdated).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h6">
                    No guides found matching "{searchQuery}"
                  </Typography>
                  <Button 
                    variant="outlined" 
                    sx={{ mt: 2 }}
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </Button>
                </Paper>
              </Grid>
            )}
          </Grid>
        </TabPanel>
        
        {/* Video Tutorials Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Video Tutorials
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Watch and learn how to use the Planning Tool with our video tutorials.
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            {filteredTutorials.length > 0 ? (
              filteredTutorials.map((tutorial) => (
                <Grid item xs={12} sm={6} md={4} key={tutorial.id}>
                  <Card sx={{ height: '100%' }}>
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={tutorial.thumbnail || "/default-tutorial-thumbnail.jpg"}
                        alt={tutorial.title}
                      />
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          }
                        }}
                        onClick={() => navigate(`/help/tutorials/${tutorial.id}`)}
                      >
                        <PlayIcon fontSize="large" />
                      </IconButton>
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          color: 'white',
                          px: 1,
                          py: 0.5,
                          borderTopLeftRadius: 4
                        }}
                      >
                        <Typography variant="caption">
                          {tutorial.duration}
                        </Typography>
                      </Box>
                    </Box>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {tutorial.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tutorial.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                        <Chip 
                          label={tutorial.category.charAt(0).toUpperCase() + tutorial.category.slice(1)} 
                          size="small" 
                          color={
                            tutorial.category === 'beginner' ? 'success' : 
                            tutorial.category === 'intermediate' ? 'primary' : 
                            'secondary'
                          }
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h6">
                    No tutorials found matching "{searchQuery}"
                  </Typography>
                  <Button 
                    variant="outlined" 
                    sx={{ mt: 2 }}
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </Button>
                </Paper>
              </Grid>
            )}
          </Grid>
        </TabPanel>
        
        {/* FAQs Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Frequently Asked Questions
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Find quick answers to common questions about the Planning Tool.
            </Typography>
          </Box>
          
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => (
              <Accordion
                key={faq.id}
                expanded={expandedFaq === faq.id}
                onChange={handleFaqExpand(faq.id)}
                sx={{ mb: 1 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight="medium">{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>{faq.answer}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Chip 
                      label={faq.category.charAt(0).toUpperCase() + faq.category.slice(1)} 
                      size="small" 
                      variant="outlined"
                    />
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6">
                No FAQs found matching "{searchQuery}"
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ mt: 2 }}
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            </Paper>
          )}
          
          <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Didn't find what you're looking for?
            </Typography>
            <Typography variant="body2" paragraph>
              Contact our support team for additional assistance with your questions.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<SupportIcon />}
              onClick={() => navigate('/contact')}
            >
              Contact Support
            </Button>
          </Box>
        </TabPanel>
      </Paper>
      
      {/* Context-Sensitive Help */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Related Help Topics
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Based on your recent activity, these resources might be helpful:
        </Typography>
        
        <List>
          <ListItem button onClick={() => { setTabValue(0); navigate('/help?tab=guides'); }}>
            <ListItemIcon>
              <GuideIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Community Engagement Best Practices" 
              secondary="Strategies for effective community outreach and feedback collection" 
            />
          </ListItem>
          <Divider component="li" />
          <ListItem button onClick={() => { setTabValue(1); navigate('/help?tab=tutorials'); }}>
            <ListItemIcon>
              <VideoIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Map Layer Management" 
              secondary="How to create, edit, and organize map layers effectively" 
            />
          </ListItem>
          <Divider component="li" />
          <ListItem button onClick={() => { setTabValue(2); setExpandedFaq('2'); navigate('/help?tab=faq'); }}>
            <ListItemIcon>
              <FAQIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Can I export my project data?" 
              secondary="Learn about exporting your project in various formats" 
            />
          </ListItem>
        </List>
      </Paper>
    </Container>
  );
};

export default HelpCenterPage; 