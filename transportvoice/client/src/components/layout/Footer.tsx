import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Link, 
  Divider,
  IconButton,
  useTheme
} from '@mui/material';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  LinkedIn,
  GitHub
} from '@mui/icons-material';

const Footer: React.FC = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        backgroundColor: theme.palette.grey[100],
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              TransportVoice
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Empowering communities through collaborative transportation planning.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton aria-label="facebook" color="primary">
                <Facebook />
              </IconButton>
              <IconButton aria-label="twitter" color="primary">
                <Twitter />
              </IconButton>
              <IconButton aria-label="instagram" color="primary">
                <Instagram />
              </IconButton>
              <IconButton aria-label="linkedin" color="primary">
                <LinkedIn />
              </IconButton>
              <IconButton aria-label="github" color="primary">
                <GitHub />
              </IconButton>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Link component={RouterLink} to="/" color="inherit" display="block" sx={{ mb: 1 }}>
              Home
            </Link>
            <Link component={RouterLink} to="/projects" color="inherit" display="block" sx={{ mb: 1 }}>
              Projects
            </Link>
            <Link component={RouterLink} to="/about" color="inherit" display="block" sx={{ mb: 1 }}>
              About Us
            </Link>
            <Link component={RouterLink} to="/contact" color="inherit" display="block" sx={{ mb: 1 }}>
              Contact
            </Link>
            <Link component={RouterLink} to="/login" color="inherit" display="block">
              Login / Register
            </Link>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Legal
            </Typography>
            <Link component={RouterLink} to="/privacy" color="inherit" display="block" sx={{ mb: 1 }}>
              Privacy Policy
            </Link>
            <Link component={RouterLink} to="/terms" color="inherit" display="block" sx={{ mb: 1 }}>
              Terms of Service
            </Link>
            <Link component={RouterLink} to="/accessibility" color="inherit" display="block">
              Accessibility
            </Link>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            © {currentYear} TransportVoice. All rights reserved.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <Link 
              href="https://github.com/your-repo/transport-voice" 
              target="_blank" 
              rel="noopener"
              color="inherit"
            >
              Open Source Project
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 