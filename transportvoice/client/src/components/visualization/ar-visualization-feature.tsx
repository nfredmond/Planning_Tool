// AR Visualization Feature
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Paper,
  Modal,
  IconButton,
  Tooltip,
  Slider,
  Stack,
  FormControlLabel,
  Switch,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  CameraAlt,
  PhotoLibrary,
  Tune,
  RotateLeft,
  CloudUpload,
  Share,
  ThreeSixty
} from '@mui/icons-material';
import styled from 'styled-components';
import * as THREE from 'three';
import { Project } from '../../types/Project';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getProjects } from '../../services/projectService';

// Styled components
const ControlsOverlay = styled(Box)<{ show: boolean }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 16px;
  transition: transform 0.3s ease;
  transform: translateY(${props => (props.show ? '0' : '100%')});
  z-index: 10;
  max-height: 50vh;
  overflow-y: auto;
`;

// ARVisualization Component
interface ARVisualizationProps {
  project: Project;
  infrastructureType?: 'bike-lane' | 'sidewalk' | 'transit-stop' | 'plaza' | 'crosswalk' | 'custom';
  onClose: () => void;
}

const ARVisualization: React.FC<ARVisualizationProps> = ({
  project,
  infrastructureType = 'bike-lane',
  onClose
}) => {
  // State
  const [loading, setLoading] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  // Implementation details would go here
  // This is a simplified version for TypeScript checking
  
  return (
    <Box sx={{ position: 'relative', height: '100vh', width: '100vw', bgcolor: 'black' }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box 
            component="div" 
            id="ar-scene" 
            sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          />
          
          <IconButton
            sx={{ position: 'absolute', top: 16, left: 16, color: 'white', bgcolor: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
          >
            <ArrowBack />
          </IconButton>
          
          <ControlsOverlay show={showControls}>
            <Typography variant="h6" gutterBottom>
              {project.name} - {infrastructureType.replace('-', ' ')}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Button startIcon={<CameraAlt />} variant="contained">
                Capture
              </Button>
              <Button startIcon={<PhotoLibrary />} variant="outlined">
                Gallery
              </Button>
            </Stack>
          </ControlsOverlay>
        </>
      )}
    </Box>
  );
};

// ARButton Component
interface ARButtonProps {
  project: Project;
  infrastructureType?: 'bike-lane' | 'sidewalk' | 'transit-stop' | 'plaza' | 'crosswalk' | 'custom';
  variant?: 'button' | 'icon';
  color?: 'primary' | 'secondary' | 'inherit';
}

const ARButton: React.FC<ARButtonProps> = ({
  project,
  infrastructureType = 'bike-lane',
  variant = 'button',
  color = 'primary'
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/projects/${project.id}/ar?type=${infrastructureType}`);
  };

  if (variant === 'icon') {
    return (
      <Tooltip title="View in AR">
        <IconButton color={color} onClick={handleClick}>
          <ThreeSixty />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Button
      variant="contained"
      color={color}
      startIcon={<ThreeSixty />}
      onClick={handleClick}
    >
      View in AR
    </Button>
  );
};

// ARVisualizationPage Component
const ARVisualizationPage: React.FC = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const infrastructureType = searchParams.get('type') as 
    'bike-lane' | 'sidewalk' | 'transit-stop' | 'plaza' | 'crosswalk' | 'custom' || 'bike-lane';

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        // In a real implementation, you would fetch the specific project
        const projects = await getProjects();
        const foundProject = projects.find(p => p.id === projectId);
        
        if (foundProject) {
          setProject(foundProject);
        } else {
          setError('Project not found');
        }
      } catch (err) {
        setError('Failed to load project');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleClose = () => {
    navigate(-1);
  };

  const checkARSupport = () => {
    // In a real implementation, check for WebXR support
    return true;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error || 'Project not found'}
        </Typography>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    );
  }

  if (!checkARSupport()) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          AR Not Supported
        </Typography>
        <Typography paragraph>
          Your device or browser does not support augmented reality features.
        </Typography>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <ARVisualization
      project={project}
      infrastructureType={infrastructureType}
      onClose={handleClose}
    />
  );
};

// Export all components
export { ARVisualization, ARButton, ARVisualizationPage }; 