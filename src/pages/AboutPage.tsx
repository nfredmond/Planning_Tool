import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme
} from '@mui/material';
import {
  Check as CheckIcon,
  Groups as GroupsIcon,
  Public as PublicIcon,
  Park as ParkIcon,
  School as SchoolIcon,
  AccessibilityNew as AccessibilityIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

const AboutPage = () => {
  const theme = useTheme();

  // Team members data
  const teamMembers = [
    {
      name: 'Jane Smith',
      role: 'Project Lead',
      avatar: 'https://via.placeholder.com/150',
      bio: 'Urban planner with 15 years of experience in community development and participatory design.'
    },
    {
      name: 'David Johnson',
      role: 'Technical Director',
      avatar: 'https://via.placeholder.com/150',
      bio: 'Software engineer specializing in GIS applications and interactive mapping tools.'
    },
    {
      name: 'Maria Rodriguez',
      role: 'Community Engagement',
      avatar: 'https://via.placeholder.com/150',
      bio: 'Sociologist focused on inclusive participation methods and community organizing.'
    },
    {
      name: 'James Wilson',
      role: 'Design Lead',
      avatar: 'https://via.placeholder.com/150',
      bio: 'Urban designer with expertise in sustainable infrastructure and public spaces.'
    }
  ];

  // Core values
  const coreValues = [
    {
      title: 'Transparency',
      description: 'We believe in open communication and making planning processes visible and accessible to all.',
      icon: <PublicIcon />
    },
    {
      title: 'Inclusivity',
      description: 'We are committed to engaging diverse voices and ensuring equitable participation across communities.',
      icon: <GroupsIcon />
    },
    {
      title: 'Sustainability',
      description: 'We prioritize environmental responsibility and long-term thinking in all planning initiatives.',
      icon: <ParkIcon />
    },
    {
      title: 'Education',
      description: 'We empower communities through resources and knowledge sharing about planning processes.',
      icon: <SchoolIcon />
    },
    {
      title: 'Accessibility',
      description: 'We design our tools to be usable by people of all abilities and technical skill levels.',
      icon: <AccessibilityIcon />
    },
    {
      title: 'Data Privacy',
      description: 'We protect user information and ensure responsible data collection and management.',
      icon: <SecurityIcon />
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Mission section */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          color="primary"
          sx={{ fontWeight: 'bold' }}
        >
          About Our Community Planning Tool
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto', mb: 4 }}>
          Empowering communities through collaborative planning, engagement, and transparent decision-making.
        </Typography>
        <Divider sx={{ mb: 4 }} />
      </Box>

      {/* Vision and mission */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              height: '100%',
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Typography variant="h4" component="h2" gutterBottom color="primary" sx={{ mb: 2 }}>
              Our Vision
            </Typography>
            <Typography variant="body1" paragraph>
              We envision inclusive communities where all residents have a meaningful voice in shaping their built environment, resulting in more equitable, resilient, and vibrant places to live.
            </Typography>
            <Typography variant="body1">
              Our tool bridges the gap between technical planning processes and community knowledge, creating a platform where diverse stakeholders can collaborate effectively.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              height: '100%',
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Typography variant="h4" component="h2" gutterBottom color="primary" sx={{ mb: 2 }}>
              Our Mission
            </Typography>
            <Typography variant="body1" paragraph>
              To provide accessible digital tools that facilitate meaningful community participation in planning processes, helping to create more democratic, responsive, and sustainable urban environments.
            </Typography>
            <List>
              {['Increase transparency in planning decisions', 'Amplify diverse community voices', 'Bridge technical and local knowledge', 'Support data-informed community advocacy'].map((item, index) => (
                <ListItem key={index} disableGutters>
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <CheckIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Core values */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
          Our Core Values
        </Typography>
        <Grid container spacing={3}>
          {coreValues.map((value, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                      {value.icon}
                    </Avatar>
                    <Typography variant="h6" component="h3">
                      {value.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {value.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Team section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
          Meet Our Team
        </Typography>
        <Grid container spacing={4}>
          {teamMembers.map((member, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                  <Avatar
                    src={member.avatar}
                    alt={member.name}
                    sx={{ width: 120, height: 120 }}
                  />
                </Box>
                <CardContent>
                  <Typography variant="h6" component="h3" align="center" gutterBottom>
                    {member.name}
                  </Typography>
                  <Typography variant="subtitle1" color="primary" align="center" gutterBottom>
                    {member.role}
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {member.bio}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Contact section */}
      <Box>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography variant="h4" component="h2" gutterBottom>
            Get In Touch
          </Typography>
          <Typography variant="body1" paragraph>
            We're always looking to improve our platform and welcome your feedback and suggestions.
          </Typography>
          <Typography variant="body1" paragraph>
            Email us at: <strong>contact@communityplanningtool.org</strong>
          </Typography>
          <Typography variant="body1">
            Follow us on social media for updates and community stories.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default AboutPage; 