import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import MapView from '../components/map/MapView';
import PageTransition from '../components/layout/PageTransition';

const MapPage = () => {
  // We could add state here to control layers or pass data from other parts of the app
  // For now, we're letting the MapView component handle its internal state

  return (
    <PageTransition>
      <Box 
        sx={{ 
          position: 'relative',
          height: 'calc(100vh - 70px)', // Full height minus header
          width: '100%',
          overflow: 'hidden'
        }}
      >
        {/* Full-screen Map component with location search and layer selector */}
        <MapView 
          center={[39.7285, -121.8375]} 
          zoom={13}
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
        />
      </Box>
    </PageTransition>
  );
};

export default MapPage; 