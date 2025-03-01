import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Paper
} from '@mui/material';
import { ProjectTypeManager } from '../../components/projects/ProjectTypeManager';
import { CommentTypeManager } from '../../components/comments/CommentTypeManager';
import { useAuth } from '../../hooks/useAuth';
import LLMPanel from '../../components/ai/LLMPanel';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-config-tabpanel-${index}`}
      aria-labelledby={`project-config-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const ProjectsConfigPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const { user } = useAuth();
  
  // Check if user has admin role
  const isAdmin = user?.role === 'admin';
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Project Configuration
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage project types and comment types for transportation planning projects
        </Typography>
      </Box>
      
      <Paper sx={{ mt: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="project configuration tabs"
          >
            <Tab label="Project Types" />
            <Tab label="Comment Types" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <ProjectTypeManager isAdmin={isAdmin} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <CommentTypeManager isAdmin={isAdmin} />
        </TabPanel>
      </Paper>
    </Box>
  );
};

const ProjectsConfigPageWithLLM = () => (
  <>
    <ProjectsConfigPage />
    <LLMPanel />
  </>
);

export default ProjectsConfigPageWithLLM; 