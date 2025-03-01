import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Box } from '@mui/material';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * PageTransition component that wraps page content and provides smooth
 * animations when navigating between pages.
 */
const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  
  // Animation variants for page transitions
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    in: {
      opacity: 1,
      y: 0,
    },
    out: {
      opacity: 0,
      y: -20,
    },
  };

  // Timing for animations
  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4,
  };

  return (
    <motion.div
      key={location.pathname}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Box sx={{ 
        width: '100%',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {children}
      </Box>
    </motion.div>
  );
};

export default PageTransition; 