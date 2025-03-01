import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Divider,
  IconButton,
  useTheme
} from '@mui/material';
import { 
  Map as MapIcon,
  LayersOutlined as LayersIcon,
  FilterAlt as FilterIcon,
  InfoOutlined as InfoIcon,
  BookmarkBorder as BookmarkIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Sidebar width when open
const drawerWidth = 240;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
}

const Sidebar = ({ open, onClose, onOpen }: SidebarProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Handle navigation when clicking on a sidebar item
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // Define sidebar menu items
  const menuItems = [
    { text: 'Map View', icon: <MapIcon />, path: '/' },
    { text: 'Map Layers', icon: <LayersIcon />, path: '/layers' },
    { text: 'Filters', icon: <FilterIcon />, path: '/filters' },
    { text: 'Projects', icon: <BookmarkIcon />, path: '/projects' },
    { text: 'Events Calendar', icon: <CalendarIcon />, path: '/events' },
    { text: 'About', icon: <InfoIcon />, path: '/about' },
  ];

  return (
    <Box 
      sx={{ 
        position: 'absolute',
        height: '100%',
        zIndex: theme.zIndex.drawer
      }}
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      {/* Collapsed sidebar tab visible when drawer is closed */}
      {!open && (
        <Box 
          sx={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: theme.palette.background.paper,
            borderTopRightRadius: 8,
            borderBottomRightRadius: 8,
            boxShadow: 2,
            zIndex: 1,
            '&:hover': {
              backgroundColor: theme.palette.action.hover
            }
          }}
        >
          <IconButton onClick={onOpen} size="large">
            <ChevronRightIcon />
          </IconButton>
        </Box>
      )}

      {/* Main drawer */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            top: '64px', // To position below app bar
            height: 'calc(100% - 64px)',
          },
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-end',
          p: 1
        }}>
          <IconButton onClick={onClose}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>
        <Divider />
        <List>
          {menuItems.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton onClick={() => handleNavigation(item.path)}>
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Box>
  );
};

export default Sidebar; 