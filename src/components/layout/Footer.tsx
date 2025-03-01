import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  useTheme, 
  TextField,
  Button,
  IconButton,
  Stack,
  Divider,
  Snackbar,
  Alert,
  Link as MuiLink,
  List,
  ListItem 
} from '@mui/material';
import { Link } from 'react-router-dom';

// Icons
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would implement the actual subscription logic
    setSnackbarOpen(true);
    setEmail('');
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const footerLinks = {
    discover: [
      { name: 'Home', path: '/' },
      { name: 'Map', path: '/map' },
      { name: 'Projects', path: '/projects' },
      { name: 'Events Calendar', path: '/events' },
      { name: 'About Us', path: '/about' }
    ],
    resources: [
      { name: 'Help Center', path: '/help-center' },
      { name: 'Community Forums', path: '/community-forums' },
      { name: 'Documentation', path: '/documentation' },
      { name: 'Map Layers', path: '/map-layers' },
      { name: 'Project Filters', path: '/filters' }
    ],
    legal: [
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Cookie Policy', path: '/cookies' },
      { name: 'Accessibility', path: '/accessibility' }
    ]
  };

  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        backgroundColor: theme.palette.mode === 'light' 
          ? theme.palette.grey[100] 
          : theme.palette.grey[900],
        borderTop: `1px solid ${theme.palette.divider}`
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          {/* Company Information */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="text.primary" gutterBottom fontWeight="bold">
              Transportation Planning Tool
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Empowering communities through collaborative transportation planning.
              Create, analyze, and share urban mobility solutions.
            </Typography>
            
            {/* Contact Info */}
            <Typography variant="subtitle2" color="text.primary" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>
              Contact Us
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                <MuiLink href="mailto:info@planningtool.example" color="inherit">
                  info@planningtool.example
                </MuiLink>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2">(555) 123-4567</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2">123 Planning Avenue, Cityville</Typography>
              </Box>
            </Stack>
            
            {/* Social Media */}
            <Typography variant="subtitle2" color="text.primary" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>
              Follow Us
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton color="primary" aria-label="Facebook" component="a" href="https://facebook.com" target="_blank" size="small">
                <FacebookIcon />
              </IconButton>
              <IconButton color="primary" aria-label="Twitter" component="a" href="https://twitter.com" target="_blank" size="small">
                <TwitterIcon />
              </IconButton>
              <IconButton color="primary" aria-label="LinkedIn" component="a" href="https://linkedin.com" target="_blank" size="small">
                <LinkedInIcon />
              </IconButton>
              <IconButton color="primary" aria-label="Instagram" component="a" href="https://instagram.com" target="_blank" size="small">
                <InstagramIcon />
              </IconButton>
              <IconButton color="primary" aria-label="YouTube" component="a" href="https://youtube.com" target="_blank" size="small">
                <YouTubeIcon />
              </IconButton>
            </Stack>
          </Grid>
          
          {/* Navigation Links */}
          <Grid item xs={12} md={5}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.primary" gutterBottom fontWeight="bold">
                  Discover
                </Typography>
                <List disablePadding dense>
                  {footerLinks.discover.map((link) => (
                    <ListItem key={link.path} disablePadding sx={{ py: 0.5 }}>
                      <MuiLink
                        component={Link}
                        to={link.path}
                        color="text.secondary"
                        underline="hover"
                        sx={{ '&:hover': { color: 'primary.main' } }}
                      >
                        {link.name}
                      </MuiLink>
                    </ListItem>
                  ))}
                </List>

                <Typography variant="subtitle2" color="text.primary" gutterBottom fontWeight="bold" sx={{ mt: 3 }}>
                  Legal
                </Typography>
                <List disablePadding dense>
                  {footerLinks.legal.map((link) => (
                    <ListItem key={link.path} disablePadding sx={{ py: 0.5 }}>
                      <MuiLink
                        component={Link}
                        to={link.path}
                        color="text.secondary"
                        underline="hover"
                        sx={{ '&:hover': { color: 'primary.main' } }}
                      >
                        {link.name}
                      </MuiLink>
                    </ListItem>
                  ))}
                </List>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.primary" gutterBottom fontWeight="bold">
                  Resources
                </Typography>
                <List disablePadding dense>
                  {footerLinks.resources.map((link) => (
                    <ListItem key={link.path} disablePadding sx={{ py: 0.5 }}>
                      <MuiLink
                        component={Link}
                        to={link.path}
                        color="text.secondary"
                        underline="hover"
                        sx={{ '&:hover': { color: 'primary.main' } }}
                      >
                        {link.name}
                      </MuiLink>
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </Grid>
          
          {/* Newsletter Signup */}
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="text.primary" gutterBottom fontWeight="bold">
              Subscribe to Updates
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Get the latest news and updates on transportation planning projects.
            </Typography>
            
            <Box component="form" onSubmit={handleSubscribe}>
              <TextField
                fullWidth
                placeholder="Your email address"
                variant="outlined"
                size="small"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 1 }}
                required
                InputProps={{
                  endAdornment: (
                    <Button 
                      type="submit" 
                      size="small" 
                      color="primary" 
                      sx={{ minWidth: 'auto' }}
                    >
                      <ArrowForwardIcon />
                    </Button>
                  )
                }}
              />
              <Typography variant="caption" color="text.secondary">
                By subscribing, you agree to our Privacy Policy and consent to receive updates.
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ mt: 6, mb: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            © {currentYear} Transportation Planning Tool. All rights reserved.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Designed with ❤️ for better urban mobility
          </Typography>
        </Box>
      </Container>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Thanks for subscribing! You'll receive our updates soon.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Footer; 