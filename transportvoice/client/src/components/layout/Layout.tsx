import React, { useState } from 'react';
import { 
  Box, Drawer, AppBar, Toolbar, Typography, Divider, 
  List, ListItem, ListItemIcon, ListItemButton, ListItemText, 
  IconButton, CssBaseline, useMediaQuery, 
  Avatar, Menu, MenuItem, Tooltip, Badge, Breadcrumbs,
  Link, Container, Switch, FormControlLabel, useTheme as useMuiTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Assessment,
  EmojiTransportation,
  Timeline,
  AccountCircle,
  Notifications,
  Settings,
  Logout,
  ChevronLeft,
  ChevronRight,
  Brightness4,
  Brightness7,
  Help,
  NavigateNext,
  Map
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTheme } from '../../context/ThemeContext';

// Define drawer width
const drawerWidth = 240;

// Styled components
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: Array<{ label: string; path?: string }>;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'TransportVoice', 
  breadcrumbs = [] 
}) => {
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const { themeMode, toggleThemeMode } = useTheme();
  
  // State
  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  
  // Handlers
  const handleDrawerToggle = () => {
    setOpen(!open);
  };
  
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationAnchorEl(null);
  };
  
  // Menu open states
  const isProfileMenuOpen = Boolean(anchorEl);
  const isNotificationMenuOpen = Boolean(notificationAnchorEl);
  
  // Navigation items
  const navigationItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Analytics', icon: <Assessment />, path: '/analytics' },
    { text: 'Projects', icon: <Timeline />, path: '/projects' },
    { text: 'Trip Planner', icon: <EmojiTransportation />, path: '/trip-planner' },
    { text: 'Interactive Map', icon: <Map />, path: '/map' },
  ];
  
  // Create the profile menu
  const profileMenu = (
    <Menu
      anchorEl={anchorEl}
      open={isProfileMenuOpen}
      onClose={handleMenuClose}
      PaperProps={{
        elevation: 2,
        sx: { minWidth: 200 }
      }}
    >
      <MenuItem onClick={handleMenuClose}>
        <ListItemIcon>
          <AccountCircle fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Profile" />
      </MenuItem>
      <MenuItem onClick={handleMenuClose}>
        <ListItemIcon>
          <Settings fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Settings" />
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleMenuClose}>
        <ListItemIcon>
          <Help fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Help & Support" />
      </MenuItem>
      <MenuItem onClick={handleMenuClose}>
        <ListItemIcon>
          <Logout fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </MenuItem>
    </Menu>
  );
  
  // Create the notifications menu
  const notificationsMenu = (
    <Menu
      anchorEl={notificationAnchorEl}
      open={isNotificationMenuOpen}
      onClose={handleMenuClose}
      PaperProps={{
        elevation: 2,
        sx: { minWidth: 300, maxWidth: 350 }
      }}
    >
      <MenuItem>
        <ListItemText 
          primary="Project Update" 
          secondary="Downtown Bicycle Network is 60% complete" 
        />
      </MenuItem>
      <MenuItem>
        <ListItemText 
          primary="New Feedback" 
          secondary="5 new community responses received" 
        />
      </MenuItem>
      <MenuItem>
        <ListItemText 
          primary="Budget Alert" 
          secondary="Transit Signal Priority project approaching budget limit" 
        />
      </MenuItem>
      <Divider />
      <MenuItem>
        <Typography variant="body2" color="primary" align="center" sx={{ width: '100%' }}>
          View All Notifications
        </Typography>
      </MenuItem>
    </Menu>
  );
  
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: muiTheme.zIndex.drawer + 1,
          transition: muiTheme.transitions.create(['width', 'margin'], {
            easing: muiTheme.transitions.easing.sharp,
            duration: muiTheme.transitions.duration.leavingScreen,
          }),
          ...(open && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: muiTheme.transitions.create(['width', 'margin'], {
              easing: muiTheme.transitions.easing.sharp,
              duration: muiTheme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Theme toggle */}
            <Tooltip title={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}>
              <IconButton color="inherit" onClick={toggleThemeMode}>
                {themeMode === 'light' ? <Brightness4 /> : <Brightness7 />}
              </IconButton>
            </Tooltip>
            
            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton 
                color="inherit"
                onClick={handleNotificationMenuOpen}
              >
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
            
            {/* Profile */}
            <Tooltip title="Account">
              <IconButton
                color="inherit"
                edge="end"
                onClick={handleProfileMenuOpen}
                sx={{ ml: 1 }}
              >
                <Avatar sx={{ width: 32, height: 32 }}>JS</Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Navigation Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={open}
        onClose={isMobile ? handleDrawerToggle : undefined}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <List>
            {navigationItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          
          <Divider />
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ p: 2 }}>
            <FormControlLabel
              control={
                <Switch 
                  checked={themeMode === 'dark'} 
                  onChange={toggleThemeMode} 
                  color="primary"
                />
              }
              label={themeMode === 'dark' ? "Dark Mode" : "Light Mode"}
            />
          </Box>
        </Box>
      </Drawer>
      
      {/* Main Content */}
      <Main open={open}>
        <Toolbar /> {/* Spacer for AppBar */}
        
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <Container maxWidth="lg">
            <Breadcrumbs 
              separator="›" 
              aria-label="breadcrumb"
              sx={{ my: 2 }}
            >
              <Link color="inherit" href="/">
                Home
              </Link>
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return isLast ? (
                  <Typography key={crumb.label} color="text.primary">
                    {crumb.label}
                  </Typography>
                ) : (
                  <Link key={crumb.label} color="inherit" href={crumb.path || '#'}>
                    {crumb.label}
                  </Link>
                );
              })}
            </Breadcrumbs>
          </Container>
        )}
        
        {/* Page Content */}
        {children}
      </Main>
      
      {/* Menus */}
      {profileMenu}
      {notificationsMenu}
    </Box>
  );
};

export default Layout; 