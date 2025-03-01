import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Paper,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Map as MapIcon,
  Forum as ForumIcon,
  Analytics as AnalyticsIcon,
  Devices as DevicesIcon,
} from '@mui/icons-material';

const HomePage: React.FC = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          TransportVoice Home
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1">
            Welcome to TransportVoice, a platform for community engagement in transportation planning.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default HomePage; 