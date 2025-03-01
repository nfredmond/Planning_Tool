import React, { useContext, useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Container,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  Tooltip,
  Badge,
  Slide,
  useScrollTrigger,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import { ThemeContext } from '../../theme/ThemeContext';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MapIcon from '@mui/icons-material/Map';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ForumIcon from '@mui/icons-material/Forum';
import InfoIcon from '@mui/icons-material/Info';
import PeopleIcon from '@mui/icons-material/People';
import FilterListIcon from '@mui/icons-material/FilterList';
import LayersIcon from '@mui/icons-material/Layers';
import CalendarToday from '@mui/icons-material/CalendarToday';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HelpIcon from '@mui/icons-material/Help';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Hide AppBar on scroll
function HideOnScroll(props: { children: React.ReactElement }) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Header = () => {
  const { toggleTheme } = useContext(ThemeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for active path and breadcrumbs
  const [activePath, setActivePath] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState<{name: string, path: string}[]>([]);
  
  // State for mobile menu
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState<null | HTMLElement>(null);
  
  // State for tools dropdown
  const [toolsAnchorEl, setToolsAnchorEl] = useState<null | HTMLElement>(null);
  
  // State for projects dropdown
  const [projectsAnchorEl, setProjectsAnchorEl] = useState<null | HTMLElement>(null);
  
  // State for community dropdown
  const [communityAnchorEl, setCommunityAnchorEl] = useState<null | HTMLElement>(null);
  
  // State for resources dropdown
  const [resourcesAnchorEl, setResourcesAnchorEl] = useState<null | HTMLElement>(null);
  
  // State for user menu
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  
  // Use auth context instead of local state
  const { isAuthenticated, isAdmin, logout, setShowLoginModal, user } = useAuth();
  
  // Update active path and breadcrumbs when location changes
  useEffect(() => {
    setActivePath(location.pathname);
    
    // Generate breadcrumbs based on current path
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    const breadcrumbItems = [];
    
    // Always add home
    breadcrumbItems.push({ name: 'Home', path: '/' });
    
    // Add path segments as breadcrumbs
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Format the name to be more readable
      let name = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      
      // Handle special cases
      if (segment === 'projects' && index === 0) name = 'Projects';
      if (segment === 'map-layers') name = 'Map Layers';
      if (segment === 'map-editor') name = 'Map Editor';
      if (segment === 'community-forums') name = 'Community Forums';
      
      breadcrumbItems.push({ name, path: currentPath });
    });
    
    setBreadcrumbs(breadcrumbItems);
  }, [location.pathname]);
  
  // Replace toggleAuth function with:
  const handleLogin = () => {
    setShowLoginModal(true);
  };
  
  const handleLogout = () => {
    logout();
    // Close any open menus
    setUserMenuAnchorEl(null);
  };
  
  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };
  
  const handleMobileMenuClose = () => {
    setMobileMenuAnchorEl(null);
  };
  
  const handleToolsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setToolsAnchorEl(event.currentTarget);
  };
  
  const handleToolsMenuClose = () => {
    setToolsAnchorEl(null);
  };
  
  const handleProjectsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProjectsAnchorEl(event.currentTarget);
  };
  
  const handleProjectsMenuClose = () => {
    setProjectsAnchorEl(null);
  };
  
  const handleCommunityMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setCommunityAnchorEl(event.currentTarget);
  };
  
  const handleCommunityMenuClose = () => {
    setCommunityAnchorEl(null);
  };
  
  const handleResourcesMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setResourcesAnchorEl(event.currentTarget);
  };
  
  const handleResourcesMenuClose = () => {
    setResourcesAnchorEl(null);
  };
  
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };
  
  // Nav item definitions
  const mainNavItems = [
    { name: 'Home', path: '/', icon: <DashboardIcon fontSize="small" />, exact: true },
    { name: 'Map', path: '/map', icon: <MapIcon fontSize="small" />, exact: true },
    { name: 'Projects', path: '/projects', icon: <AssignmentIcon fontSize="small" />, exact: true },
    { name: 'Community', path: '/community-forums', icon: <ForumIcon fontSize="small" />, exact: true },
    { name: 'Events', path: '/events', icon: <CalendarToday fontSize="small" />, exact: true },
    { name: 'Map Layers', path: '/map-layers', icon: <LayersIcon fontSize="small" />, exact: true },
    { name: 'About', path: '/about', icon: <InfoIcon fontSize="small" />, exact: true },
    { name: 'Help', path: '/help-center', icon: <HelpIcon fontSize="small" />, exact: true },
  ];
  
  const projectsItems = [
    { name: 'All Projects', path: '/projects' },
    { name: 'Featured Projects', path: '/projects/featured' },
    { name: 'Near Me', path: '/projects/near-me' },
    { name: 'Recently Updated', path: '/projects/recent' },
    // For demonstration, include one of our specific project pages
    { name: 'Downtown Transit Corridor', path: '/projects/1' },
  ];

  const communityItems = [
    { name: 'Discussion Forums', path: '/community-forums' },
    { name: 'Public Feedback', path: '/community-forums/feedback' },
    { name: 'Surveys', path: '/community-forums/surveys' },
    { name: 'Events Calendar', path: '/events' },
  ];

  // Helper function to determine if a nav item is active
  const isActive = (path: string, exact = false) => {
    if (exact) return activePath === path;
    return activePath.startsWith(path);
  };

  return (
    <HideOnScroll>
      <AppBar 
        position="sticky" 
        color="default" 
        elevation={3}
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(33, 33, 33, 0.95)',
          color: '#ffffff',
          [theme.breakpoints.up('md')]: {
            zIndex: theme.zIndex.drawer + 1,
          },
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: {xs: 64, md: 70}, px: 1 }}>
            {/* Logo and Title */}
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/"
              sx={{
                mr: 3,
                display: { xs: 'none', md: 'flex' },
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              Transportation Planning Tool
            </Typography>

            {/* Mobile Menu Icon */}
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMobileMenuOpen}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={mobileMenuAnchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(mobileMenuAnchorEl)}
                onClose={handleMobileMenuClose}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                {mainNavItems.map((item) => (
                  <MenuItem 
                    key={item.path} 
                    component={Link} 
                    to={item.path} 
                    onClick={handleMobileMenuClose}
                    selected={isActive(item.path, item.exact)}
                  >
                    <Box component="span" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                      {item.icon}
                    </Box>
                    {item.name}
                  </MenuItem>
                ))}
                
                <Divider />
                
                {isAdmin && (
                  <MenuItem 
                    component={Link} 
                    to="/admin" 
                    onClick={handleMobileMenuClose}
                    selected={isActive('/admin')}
                  >
                    <Box component="span" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                      <AdminPanelSettingsIcon fontSize="small" />
                    </Box>
                    Admin Dashboard
                  </MenuItem>
                )}
              </Menu>
            </Box>

            {/* Mobile Logo */}
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              TPT
            </Typography>

            {/* Desktop Navigation */}
            <Box sx={{ 
              flexGrow: 1, 
              display: { xs: 'none', md: 'flex' }, 
              ml: 2,
              justifyContent: 'space-evenly'  // Evenly distribute items
            }}>
              {mainNavItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  sx={{ 
                    py: 2.5,  // Increased vertical padding
                    color: 'inherit',
                    fontSize: '0.95rem',
                    fontWeight: isActive(item.path, item.exact) ? 600 : 500,
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    letterSpacing: '0.02em',
                    opacity: isActive(item.path, item.exact) ? 1 : 0.9,
                    '&:hover': {
                      opacity: 1,
                      backgroundColor: 'rgba(255,255,255,0.05)'
                    },
                    '&::after': isActive(item.path, item.exact) ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '25%',
                      width: '50%',
                      height: '3px',
                      bgcolor: 'primary.main',
                    } : undefined,
                  }}
                  startIcon={item.icon}
                >
                  {item.name}
                </Button>
              ))}
            </Box>

            {/* User controls */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              ml: 2,
              '& .MuiIconButton-root': {
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }
            }}>
              {/* Theme toggle */}
              <Tooltip title="Toggle light/dark mode">
                <IconButton onClick={toggleTheme} color="inherit" size="large">
                  {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>

              {/* Notifications */}
              {isAuthenticated && (
                <Tooltip title="Notifications">
                  <IconButton color="inherit" size="large">
                    <Badge badgeContent={3} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
              )}

              {/* User menu */}
              {isAuthenticated ? (
                <>
                  <Tooltip title="Account settings">
                    <IconButton
                      onClick={handleUserMenuOpen}
                      size="large"
                      edge="end"
                      color="inherit"
                      sx={{ ml: 1 }}
                    >
                      <AccountCircleIcon />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={userMenuAnchorEl}
                    id="account-menu"
                    open={Boolean(userMenuAnchorEl)}
                    onClose={handleUserMenuClose}
                    onClick={handleUserMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <MenuItem component={Link} to="/profile">
                      Profile
                    </MenuItem>
                    <MenuItem component={Link} to="/settings">
                      Settings
                    </MenuItem>
                    <Divider />
                    {isAdmin && (
                      <MenuItem component={Link} to="/admin">
                        Admin Dashboard
                      </MenuItem>
                    )}
                    <MenuItem onClick={handleLogout}>
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button 
                  color="primary" 
                  variant="contained" 
                  onClick={handleLogin} 
                  sx={{ 
                    ml: 2,
                    px: 3,
                    py: 1,
                    borderRadius: '6px',
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: 2,
                    '&:hover': {
                      boxShadow: 4
                    }
                  }}
                >
                  Sign In
                </Button>
              )}
            </Box>
          </Toolbar>
          
          {/* Breadcrumbs navigation - shows on all pages except home */}
          {breadcrumbs.length > 1 && (
            <Box 
              sx={{ 
                py: 1, 
                px: 2, 
                display: 'flex', 
                background: theme.palette.background.paper,
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Breadcrumbs 
                separator={<NavigateNextIcon fontSize="small" />}
                aria-label="breadcrumb"
              >
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  return isLast ? (
                    <Typography key={crumb.path} color="text.primary">
                      {crumb.name}
                    </Typography>
                  ) : (
                    <MuiLink
                      key={crumb.path}
                      component={Link}
                      to={crumb.path}
                      color="inherit"
                      underline="hover"
                    >
                      {crumb.name}
                    </MuiLink>
                  );
                })}
              </Breadcrumbs>
            </Box>
          )}
        </Container>
      </AppBar>
    </HideOnScroll>
  );
};

export default Header; 