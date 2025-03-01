import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Slider,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Paper,
  IconButton,
  useTheme,
  Switch
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  FilterAlt as FilterIcon,
  Clear as ClearIcon,
  Save as SaveIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const FiltersPage = () => {
  const theme = useTheme();
  
  // Filter state
  const [projectTypeFilters, setProjectTypeFilters] = useState<string[]>([
    'Infrastructure',
    'Parks'
  ]);
  const [distanceFilter, setDistanceFilter] = useState<number[]>([0, 10]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<number[]>([2020, 2023]);
  
  // Active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    
    if (projectTypeFilters.length > 0) count++;
    if (distanceFilter[0] > 0 || distanceFilter[1] < 10) count++;
    if (statusFilter !== 'all') count++;
    if (dateRangeFilter[0] > 2020 || dateRangeFilter[1] < 2023) count++;
    
    return count;
  };
  
  const handleClearFilters = () => {
    setProjectTypeFilters([]);
    setDistanceFilter([0, 10]);
    setStatusFilter('all');
    setDateRangeFilter([2020, 2023]);
  };
  
  const handleProjectTypeToggle = (type: string) => {
    if (projectTypeFilters.includes(type)) {
      setProjectTypeFilters(projectTypeFilters.filter(item => item !== type));
    } else {
      setProjectTypeFilters([...projectTypeFilters, type]);
    }
  };
  
  const handleDistanceChange = (event: Event, newValue: number | number[]) => {
    setDistanceFilter(newValue as number[]);
  };
  
  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStatusFilter(event.target.value);
  };
  
  const handleDateRangeChange = (event: Event, newValue: number | number[]) => {
    setDateRangeFilter(newValue as number[]);
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton 
          component={Link} 
          to="/"
          sx={{ mr: 2 }}
          aria-label="back to map"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Map Filters
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Left column - Filters */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FilterIcon sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Filters
                </Typography>
                {getActiveFiltersCount() > 0 && (
                  <Chip 
                    label={getActiveFiltersCount()} 
                    color="primary" 
                    size="small" 
                    sx={{ ml: 1 }} 
                  />
                )}
              </Box>
              <Button 
                size="small"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                disabled={getActiveFiltersCount() === 0}
              >
                Clear All
              </Button>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            {/* Project Type Filter */}
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="project-type-filter-content"
                id="project-type-filter-header"
              >
                <Typography variant="subtitle1">Project Type</Typography>
                {projectTypeFilters.length > 0 && (
                  <Chip 
                    label={projectTypeFilters.length} 
                    size="small" 
                    color="primary"
                    sx={{ ml: 1 }} 
                  />
                )}
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1}>
                  {['Infrastructure', 'Parks', 'Transportation', 'Housing', 'Community Facilities', 'Commercial', 'Mixed Use'].map((type) => (
                    <Grid item xs={6} sm={4} key={type}>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={projectTypeFilters.includes(type)} 
                            onChange={() => handleProjectTypeToggle(type)} 
                          />
                        }
                        label={type}
                      />
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
            
            {/* Distance Filter */}
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="distance-filter-content"
                id="distance-filter-header"
              >
                <Typography variant="subtitle1">Distance from Location</Typography>
                {(distanceFilter[0] > 0 || distanceFilter[1] < 10) && (
                  <Chip 
                    label={`${distanceFilter[0]}-${distanceFilter[1]} mi`} 
                    size="small" 
                    color="primary"
                    sx={{ ml: 1 }} 
                  />
                )}
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ px: 2 }}>
                  <Slider
                    value={distanceFilter}
                    onChange={handleDistanceChange}
                    valueLabelDisplay="auto"
                    min={0}
                    max={10}
                    step={0.5}
                    marks
                    valueLabelFormat={(value) => `${value} mi`}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">0 mi</Typography>
                    <Typography variant="body2" color="text.secondary">10 mi</Typography>
                  </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="location-select-label">Reference Location</InputLabel>
                    <Select
                      labelId="location-select-label"
                      id="location-select"
                      value="current"
                      label="Reference Location"
                    >
                      <MenuItem value="current">Current Location</MenuItem>
                      <MenuItem value="downtown">Downtown</MenuItem>
                      <MenuItem value="custom">Custom Location</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </AccordionDetails>
            </Accordion>
            
            {/* Project Status Filter */}
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="status-filter-content"
                id="status-filter-header"
              >
                <Typography variant="subtitle1">Project Status</Typography>
                {statusFilter !== 'all' && (
                  <Chip 
                    label={statusFilter} 
                    size="small" 
                    color="primary"
                    sx={{ ml: 1 }} 
                  />
                )}
              </AccordionSummary>
              <AccordionDetails>
                <RadioGroup
                  aria-label="project-status"
                  name="project-status"
                  value={statusFilter}
                  onChange={handleStatusChange}
                >
                  <FormControlLabel value="all" control={<Radio />} label="All Statuses" />
                  <FormControlLabel value="planning" control={<Radio />} label="Planning Phase" />
                  <FormControlLabel value="inProgress" control={<Radio />} label="In Progress" />
                  <FormControlLabel value="completed" control={<Radio />} label="Completed" />
                  <FormControlLabel value="proposed" control={<Radio />} label="Proposed" />
                </RadioGroup>
              </AccordionDetails>
            </Accordion>
            
            {/* Date Range Filter */}
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="date-filter-content"
                id="date-filter-header"
              >
                <Typography variant="subtitle1">Project Timeframe</Typography>
                {(dateRangeFilter[0] > 2020 || dateRangeFilter[1] < 2023) && (
                  <Chip 
                    label={`${dateRangeFilter[0]}-${dateRangeFilter[1]}`} 
                    size="small" 
                    color="primary"
                    sx={{ ml: 1 }} 
                  />
                )}
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ px: 2 }}>
                  <Slider
                    value={dateRangeFilter}
                    onChange={handleDateRangeChange}
                    valueLabelDisplay="auto"
                    min={2020}
                    max={2023}
                    step={1}
                    marks={[
                      { value: 2020, label: '2020' },
                      { value: 2021, label: '2021' },
                      { value: 2022, label: '2022' },
                      { value: 2023, label: '2023' }
                    ]}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
            
            {/* Additional Filters */}
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="additional-filter-content"
                id="additional-filter-header"
              >
                <Typography variant="subtitle1">Additional Filters</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={<Switch />}
                      label="Only show projects with community feedback"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={<Switch />}
                      label="Only show projects with upcoming events"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={<Switch />}
                      label="Only show projects with available funding"
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Paper>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button 
              variant="outlined" 
              component={Link} 
              to="/"
              startIcon={<ArrowBackIcon />}
            >
              Back to Map
            </Button>
            <Button 
              variant="contained" 
              component={Link} 
              to="/"
              startIcon={<FilterIcon />}
            >
              Apply Filters
            </Button>
          </Box>
        </Grid>
        
        {/* Right column - Saved filters and Info */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Save Your Filter Set
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Save your current filter configuration for quick access in the future.
            </Typography>
            
            <TextField
              fullWidth
              size="small"
              label="Filter Name"
              placeholder="e.g. My Neighborhood Projects"
              margin="normal"
            />
            
            <Button
              fullWidth
              variant="outlined"
              startIcon={<SaveIcon />}
              sx={{ mt: 2 }}
            >
              Save Current Filters
            </Button>
          </Paper>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Saved Filters
            </Typography>
            
            <List>
              <FilterItem 
                name="Nearby Parks" 
                description="Parks within 5 miles"
                date="Saved 2 weeks ago"
              />
              <FilterItem 
                name="Downtown Development" 
                description="New construction in central district"
                date="Saved 1 month ago"
              />
              <FilterItem 
                name="Bike Infrastructure" 
                description="All bike lanes and related projects"
                date="Saved 3 months ago"
              />
            </List>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Share Your Map View
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Generate a link to share your current map with all filters applied.
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ShareIcon />}
            >
              Generate Shareable Link
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

// Filter item component for saved filters
const FilterItem = ({ name, description, date }: { name: string; description: string; date: string }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ mb: 2, pb: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <BookmarkIcon 
          sx={{ 
            mr: 1, 
            color: theme.palette.primary.main,
            fontSize: '1.2rem'
          }} 
        />
        <Typography variant="subtitle2">
          {name}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          {date}
        </Typography>
        <Box>
          <IconButton size="small">
            <ShareIcon fontSize="small" />
          </IconButton>
          <IconButton size="small">
            <ClearIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

// Custom List component
const List = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box sx={{ mt: 2 }}>
      {children}
    </Box>
  );
};

export default FiltersPage; 