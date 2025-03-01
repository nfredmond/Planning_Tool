import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Container,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Login as LoginIcon,
  AppRegistration as RegisterIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleLogout = async () => {
    await logout();
    navigate('/');
    handleMenuClose();
  };
  
  return (
    <AppBar position="static" color="default" elevation={1}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Desktop Logo */}
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
            }}
          >
            TransportVoice
          </Typography>
          
          {/* Mobile Menu Toggle */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          {/* Mobile Logo */}
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              display: { xs: 'flex', md: 'none' },
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
            }}
          >
            TransportVoice
          </Typography>
          
          {/* Desktop Nav Links */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Button
              component={RouterLink}
              to="/projects"
              sx={{ my: 2, color: 'text.primary', display: 'block' }}
            >
              Projects
            </Button>
            <Button
              component={RouterLink}
              to="/about"
              sx={{ my: 2, color: 'text.primary', display: 'block' }}
            >
              About
            </Button>
            <Button
              component={RouterLink}
              to="/contact"
              sx={{ my: 2, color: 'text.primary', display: 'block' }}
            >
              Contact
            </Button>
          </Box>
          
          {/* User Menu */}
          <Box sx={{ flexGrow: 0 }}>
            {user ? (
              <>
                <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                  <Avatar alt={`${user.firstName} ${user.lastName}`}>
                    {user.firstName.charAt(0)}
                    {user.lastName.charAt(0)}
                  </Avatar>
                </IconButton>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={() => {
                    navigate('/profile');
                    handleMenuClose();
                  }}>
                    <AccountCircle sx={{ mr: 1 }} />
                    Profile
                  </MenuItem>
                  
                  {(user.role === 'admin' || user.role === 'moderator') && (
                    <MenuItem onClick={() => {
                      navigate('/admin/dashboard');
                      handleMenuClose();
                    }}>
                      <AdminIcon sx={{ mr: 1 }} />
                      Admin Dashboard
                    </MenuItem>
                  )}
                  
                  <Divider />
                  
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon sx={{ mr: 1 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                <Button
                  component={RouterLink}
                  to="/login"
                  startIcon={<LoginIcon />}
                  sx={{ ml: 1 }}
                >
                  Login
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  startIcon={<RegisterIcon />}
                  sx={{ ml: 1 }}
                >
                  Register
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
      
      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              my: 2,
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
              display: 'block',
            }}
          >
            TransportVoice
          </Typography>
          <Divider />
          <List>
            <ListItem button component={RouterLink} to="/projects">
              <ListItemText primary="Projects" />
            </ListItem>
            <ListItem button component={RouterLink} to="/about">
              <ListItemText primary="About" />
            </ListItem>
            <ListItem button component={RouterLink} to="/contact">
              <ListItemText primary="Contact" />
            </ListItem>
            
            <Divider />
            
            {user ? (
              <>
                <ListItem button component={RouterLink} to="/profile">
                  <ListItemText primary="Profile" />
                </ListItem>
                
                {(user.role === 'admin' || user.role === 'moderator') && (
                  <ListItem button component={RouterLink} to="/admin/dashboard">
                    <ListItemText primary="Admin Dashboard" />
                  </ListItem>
                )}
                
                <ListItem button onClick={handleLogout}>
                  <ListItemText primary="Logout" />
                </ListItem>
              </>
            ) : (
              <>
                <ListItem button component={RouterLink} to="/login">
                  <ListItemText primary="Login" />
                </ListItem>
                <ListItem button component={RouterLink} to="/register">
                  <ListItemText primary="Register" />
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Header; 