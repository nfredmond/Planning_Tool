import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Chip,
  Card,
  CardContent,
  CardHeader,
  Divider,
  LinearProgress,
  Rating,
  Stack,
  Button,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import AccessibleIcon from '@mui/icons-material/Accessible';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HearingIcon from '@mui/icons-material/Hearing';
import ElderlyIcon from '@mui/icons-material/Elderly';
import CommuteIcon from '@mui/icons-material/Commute';
import SecurityIcon from '@mui/icons-material/Security';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpIcon from '@mui/icons-material/Help';
import DownloadIcon from '@mui/icons-material/Download';
import { useProjects } from '../../hooks/useProjects';
import { useProjectAlternatives } from '../../hooks/useProjectAlternatives';
import { useAccessibilityScore } from '../../hooks/useAccessibilityScore';
import { ProjectType, ProjectAlternative, AccessibilityScoreData } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import RadarChart from '../common/RadarChart';

const CATEGORY_DESCRIPTIONS = {
  mobilityImpaired: 'Evaluates design features that accommodate people using wheelchairs, walkers, crutches, or those with mobility limitations. Includes ramps, accessible paths, and barrier-free design.',
  visualImpaired: 'Addresses needs of people with visual impairments through tactile paving, audio signals, high-contrast design elements, and clear wayfinding.',
  hearingImpaired: 'Assesses visual signaling, captioning, and other accommodations for people with hearing impairments.',
  cognitive: 'Evaluates design elements that help people with cognitive disabilities navigate spaces through clear signage, consistent layouts, and intuitive design.',
  elderly: 'Considers features beneficial for elderly users like adequate seating, gentle gradients, and shorter crossing distances.',
  transitAccess: 'Evaluates connection to public transit, accessible transit stops, and clear information systems.',
  universalDesign: 'Measures how well the project follows universal design principles to create spaces usable by all people regardless of age, disability, or other factors.',
};

const CATEGORY_ICONS = {
  mobilityImpaired: <AccessibleIcon />,
  visualImpaired: <VisibilityIcon />,
  hearingImpaired: <HearingIcon />,
  cognitive: <InfoIcon />,
  elderly: <ElderlyIcon />,
  transitAccess: <CommuteIcon />,
  universalDesign: <DirectionsWalkIcon />
};

const AccessibilityScorecard: React.FC = () => {
  const { projects, loading: projectsLoading } = useProjects();
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedAlternative, setSelectedAlternative] = useState<string>('');
  const [expandedCategory, setExpandedCategory] = useState<string | false>(false);

  const { 
    alternatives, 
    loading: alternativesLoading 
  } = useProjectAlternatives(selectedProject);

  const {
    scoreData,
    loading: scoreLoading,
    error
  } = useAccessibilityScore(selectedProject, selectedAlternative);

  const handleProjectChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedProject(event.target.value as string);
    setSelectedAlternative('');
  };

  const handleAlternativeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedAlternative(event.target.value as string);
  };

  const handleAccordionChange = (category: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedCategory(isExpanded ? category : false);
  };

  const calculateOverallScore = () => {
    if (!scoreData) return 0;
    
    const sum = Object.values(scoreData.scores).reduce((acc, val) => acc + val, 0);
    return Math.round((sum / Object.values(scoreData.scores).length) * 10) / 10;
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'success.main';
    if (score >= 3) return 'warning.main';
    return 'error.main';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 4.5) return 'Excellent';
    if (score >= 4) return 'Very Good';
    if (score >= 3.5) return 'Good';
    if (score >= 3) return 'Fair';
    if (score >= 2) return 'Poor';
    return 'Inadequate';
  };

  const getHelpText = (category: string) => {
    return CATEGORY_DESCRIPTIONS[category as keyof typeof CATEGORY_DESCRIPTIONS] || '';
  };

  const getImprovementSuggestions = (category: string) => {
    if (!scoreData || !scoreData.improvementSuggestions) return [];
    return scoreData.improvementSuggestions[category as keyof typeof scoreData.improvementSuggestions] || [];
  };

  const prepareCategoryData = () => {
    if (!scoreData) return [];

    return Object.entries(scoreData.scores).map(([key, value]) => ({
      category: key,
      score: value,
      label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
      icon: CATEGORY_ICONS[key as keyof typeof CATEGORY_ICONS],
      description: getHelpText(key),
      suggestions: getImprovementSuggestions(key)
    }));
  };

  const renderScoreOverview = () => {
    if (!scoreData) return null;
    
    const overallScore = calculateOverallScore();
    const scoreColor = getScoreColor(overallScore);
    const scoreLabel = getScoreLabel(overallScore);
    
    const radarData = Object.entries(scoreData.scores).map(([key, value]) => ({
      subject: key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
      score: value,
      fullMark: 5
    }));

    return (
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Accessibility Score" 
              subheader="Overall project evaluation"
              avatar={<AccessibleIcon color="primary" />}
            />
            <Divider />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2 }}>
                <Typography 
                  variant="h1" 
                  component="div" 
                  color={scoreColor}
                  sx={{ fontWeight: 'bold' }}
                >
                  {overallScore}
                </Typography>
                <Typography variant="h6" color={scoreColor}>
                  {scoreLabel}
                </Typography>
                <Rating 
                  value={overallScore} 
                  precision={0.5} 
                  max={5} 
                  readOnly 
                  sx={{ mt: 1, mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary" align="center">
                  This score evaluates how well the project meets universal design principles and accessibility needs.
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Scoring Scale:
                </Typography>
                <Stack spacing={1} sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ width: 60 }}>4.5 - 5.0:</Box>
                    <Chip label="Excellent" size="small" sx={{ bgcolor: 'success.main', color: 'white', ml: 1 }} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ width: 60 }}>4.0 - 4.4:</Box>
                    <Chip label="Very Good" size="small" sx={{ bgcolor: 'success.light', color: 'white', ml: 1 }} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ width: 60 }}>3.5 - 3.9:</Box>
                    <Chip label="Good" size="small" sx={{ bgcolor: 'success.light', color: 'white', ml: 1 }} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ width: 60 }}>3.0 - 3.4:</Box>
                    <Chip label="Fair" size="small" sx={{ bgcolor: 'warning.main', color: 'white', ml: 1 }} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ width: 60 }}>2.0 - 2.9:</Box>
                    <Chip label="Poor" size="small" sx={{ bgcolor: 'error.light', color: 'white', ml: 1 }} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ width: 60 }}>0.0 - 1.9:</Box>
                    <Chip label="Inadequate" size="small" sx={{ bgcolor: 'error.main', color: 'white', ml: 1 }} />
                  </Box>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Accessibility Profile" 
              subheader="Category breakdown"
              action={
                <Tooltip title="Download detailed report">
                  <IconButton>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            <Divider />
            <CardContent sx={{ height: 400 }}>
              <RadarChart data={radarData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderCategoryDetails = () => {
    if (!scoreData) return null;

    const categoryData = prepareCategoryData();
    
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Detailed Category Evaluation
        </Typography>
        
        {categoryData.map((category) => (
          <Accordion 
            key={category.category}
            expanded={expandedCategory === category.category}
            onChange={handleAccordionChange(category.category)}
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid container alignItems="center">
                <Grid item xs={2} sm={1}>
                  <Box sx={{ color: getScoreColor(category.score) }}>
                    {category.icon}
                  </Box>
                </Grid>
                <Grid item xs={7} sm={8}>
                  <Typography>{category.label}</Typography>
                </Grid>
                <Grid item xs={3} sm={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Rating value={category.score} precision={0.5} size="small" readOnly sx={{ mr: 1 }} />
                    <Typography 
                      variant="body2" 
                      component="span"
                      color={getScoreColor(category.score)}
                      fontWeight="bold"
                    >
                      {category.score}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {category.description}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  Design Strengths:
                </Typography>
                {scoreData.strengths[category.category] && scoreData.strengths[category.category].length > 0 ? (
                  <List dense disablePadding>
                    {scoreData.strengths[category.category].map((strength, index) => (
                      <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <SecurityIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={strength} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No specific strengths identified.
                  </Typography>
                )}
                
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  Improvement Opportunities:
                </Typography>
                {category.suggestions && category.suggestions.length > 0 ? (
                  <List dense disablePadding>
                    {category.suggestions.map((suggestion, index) => (
                      <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <InfoIcon color="warning" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={suggestion} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No specific improvements needed.
                  </Typography>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  };

  const renderComplianceBadges = () => {
    if (!scoreData || !scoreData.complianceStatus) return null;
    
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Compliance & Standards
        </Typography>
        
        <Grid container spacing={2}>
          {Object.entries(scoreData.complianceStatus).map(([standard, status]) => (
            <Grid item xs={6} sm={4} md={3} key={standard}>
              <Chip
                label={standard}
                color={status ? 'success' : 'error'}
                variant="outlined"
                icon={status ? <SecurityIcon /> : <InfoIcon />}
                sx={{ width: '100%', justifyContent: 'flex-start', py: 2 }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Accessibility Scorecard
          <Tooltip title="Evaluate how well projects meet universal design principles and address accessibility needs">
            <InfoIcon sx={{ ml: 1, verticalAlign: 'middle', color: 'info.main' }} />
          </Tooltip>
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Provides an accessibility score for projects based on universal design principles and community feedback
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="project-select-label">Project</InputLabel>
              <Select
                labelId="project-select-label"
                value={selectedProject}
                label="Project"
                onChange={handleProjectChange}
              >
                <MenuItem value="">
                  <em>Select a project</em>
                </MenuItem>
                {projects?.map((project: ProjectType) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth disabled={!selectedProject || !alternatives || alternatives.length === 0}>
              <InputLabel id="alternative-select-label">Design Alternative</InputLabel>
              <Select
                labelId="alternative-select-label"
                value={selectedAlternative}
                label="Design Alternative"
                onChange={handleAlternativeChange}
              >
                <MenuItem value="">
                  <em>Select a design alternative</em>
                </MenuItem>
                {alternatives?.map((alt: ProjectAlternative) => (
                  <MenuItem key={alt.id} value={alt.id}>
                    {alt.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {(projectsLoading || alternativesLoading || scoreLoading) ? (
        <LoadingSpinner />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : !selectedProject ? (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h6">Please select a project to view accessibility score</Typography>
        </Paper>
      ) : !selectedAlternative ? (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h6">Please select a design alternative to view accessibility score</Typography>
        </Paper>
      ) : !scoreData ? (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h6">No accessibility data available for this project</Typography>
        </Paper>
      ) : (
        <>
          {renderScoreOverview()}
          {renderCategoryDetails()}
          {renderComplianceBadges()}
        </>
      )}
    </Container>
  );
};

export default AccessibilityScorecard; 