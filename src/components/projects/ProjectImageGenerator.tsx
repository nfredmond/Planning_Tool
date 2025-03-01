import React from 'react';
import { Box, Typography } from '@mui/material';
import { 
  DirectionsBus as BusIcon,
  DirectionsBike as BikeIcon, 
  Train as TrainIcon
} from '@mui/icons-material';

interface ProjectImageProps {
  type: 'bus' | 'bike' | 'train';
  title?: string;
  bgColor1?: string;
  bgColor2?: string;
  width?: string | number;
  height?: string | number;
}

/**
 * Generates a placeholder image for projects with transportation icons and gradients
 */
const ProjectImageGenerator: React.FC<ProjectImageProps> = ({
  type,
  title,
  bgColor1,
  bgColor2,
  width = '100%',
  height = 160
}) => {
  // Default background colors by project type
  const getDefaultColors = () => {
    switch(type) {
      case 'bus':
        return ['#3f51b5', '#1a237e']; // Blue gradient for bus/transit
      case 'bike':
        return ['#4caf50', '#1b5e20']; // Green gradient for bike lanes
      case 'train':
        return ['#f44336', '#b71c1c']; // Red gradient for rail projects
      default:
        return ['#607d8b', '#263238']; // Grey fallback
    }
  };

  const colors = getDefaultColors();
  const backgroundColor1 = bgColor1 || colors[0];
  const backgroundColor2 = bgColor2 || colors[1];

  // Get the appropriate icon
  const getIcon = () => {
    switch(type) {
      case 'bus':
        return <BusIcon sx={{ fontSize: 60, color: 'white' }} />;
      case 'bike':
        return <BikeIcon sx={{ fontSize: 60, color: 'white' }} />;
      case 'train':
        return <TrainIcon sx={{ fontSize: 60, color: 'white' }} />;
      default:
        return <BusIcon sx={{ fontSize: 60, color: 'white' }} />;
    }
  };

  return (
    <Box
      sx={{
        width,
        height,
        background: `linear-gradient(135deg, ${backgroundColor1}, ${backgroundColor2})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.05), rgba(255,255,255,0.05) 10px, transparent 10px, transparent 20px)',
        }
      }}
    >
      {getIcon()}
      {title && (
        <Typography 
          variant="subtitle1" 
          component="div" 
          sx={{ 
            mt: 1, 
            fontWeight: 'bold',
            textAlign: 'center',
            px: 2,
            textShadow: '1px 1px 3px rgba(0,0,0,0.5)'
          }}
        >
          {title}
        </Typography>
      )}
    </Box>
  );
};

export default ProjectImageGenerator; 