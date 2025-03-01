import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Chip,
  Tooltip,
  CircularProgress,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  Today as TodayIcon,
  ViewDay as DayViewIcon,
  ViewWeek as WeekViewIcon,
  ViewModule as MonthViewIcon,
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CalendarToday as CalendarIcon,
  Place as LocationIcon,
  AccessTime as TimeIcon,
  Category as CategoryIcon,
  Group as AudienceIcon,
  Info as InfoIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';

// Types for our events
interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  location: string;
  category: string;
  audience: string;
  organizer: string;
  imageUrl?: string;
}

// Mock data - in a real app this would come from an API
const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Community Feedback Session',
    description: 'Open forum for community members to provide feedback on the proposed transit expansion.',
    startDate: '2023-05-15T14:00:00Z',
    endDate: '2023-05-15T16:00:00Z',
    location: 'City Hall - Meeting Room A',
    category: 'Public Meeting',
    audience: 'General Public',
    organizer: 'Transit Authority'
  },
  {
    id: '2',
    title: 'Transit Board Monthly Meeting',
    description: 'Monthly meeting of the Transit Authority Board to discuss ongoing projects and approve budgets.',
    startDate: '2023-05-20T10:00:00Z',
    endDate: '2023-05-20T12:00:00Z',
    location: 'Transit HQ - Board Room',
    category: 'Board Meeting',
    audience: 'Board Members, Public Welcome',
    organizer: 'Transit Authority'
  },
  {
    id: '3',
    title: 'New Bus Routes Workshop',
    description: 'Interactive workshop to get input on proposed new bus routes for the eastern district.',
    startDate: '2023-05-25T18:00:00Z',
    endDate: '2023-05-25T20:00:00Z',
    location: 'Community Center',
    category: 'Workshop',
    audience: 'District Residents',
    organizer: 'Transit Planning Department'
  }
];

// View types for the calendar
type CalendarView = 'day' | 'week' | 'month';

const EventsCalendarPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openEventDialog, setOpenEventDialog] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Event form state
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    description: '',
    startDate: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    endDate: format(addDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    location: '',
    category: '',
    audience: '',
    organizer: ''
  });
  
  // Handle category filter change
  const handleCategoryFilterChange = (event: SelectChangeEvent) => {
    setCategoryFilter(event.target.value as string);
  };
  
  // Navigation functions
  const navigatePrevious = () => {
    switch (view) {
      case 'day':
        setCurrentDate(prev => addDays(prev, -1));
        break;
      case 'week':
        setCurrentDate(prev => addDays(prev, -7));
        break;
      case 'month':
        setCurrentDate(prev => subMonths(prev, 1));
        break;
    }
  };
  
  const navigateNext = () => {
    switch (view) {
      case 'day':
        setCurrentDate(prev => addDays(prev, 1));
        break;
      case 'week':
        setCurrentDate(prev => addDays(prev, 7));
        break;
      case 'month':
        setCurrentDate(prev => addMonths(prev, 1));
        break;
    }
  };
  
  const navigateToday = () => {
    setCurrentDate(new Date());
  };
  
  // Filter events based on category
  const filteredEvents = events.filter(event => 
    categoryFilter === 'all' || event.category === categoryFilter
  );
  
  // Dialog functions
  const handleOpenEventDialog = (event: CalendarEvent | null = null) => {
    setSelectedEvent(event);
    if (event) {
      setNewEvent({
        ...event
      });
    } else {
      setNewEvent({
        title: '',
        description: '',
        startDate: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        endDate: format(addDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        location: '',
        category: '',
        audience: '',
        organizer: ''
      });
    }
    setOpenEventDialog(true);
  };
  
  const handleCloseEventDialog = () => {
    setOpenEventDialog(false);
    setSelectedEvent(null);
  };
  
  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSaveEvent = () => {
    // In a real app, this would be an API call
    if (selectedEvent) {
      // Update existing event
      setEvents(prev => prev.map(event => 
        event.id === selectedEvent.id ? { ...event, ...newEvent } as CalendarEvent : event
      ));
    } else {
      // Add new event
      const eventToAdd: CalendarEvent = {
        id: Math.random().toString(36).substring(2, 11),
        ...(newEvent as Omit<CalendarEvent, 'id'>)
      };
      setEvents(prev => [...prev, eventToAdd]);
    }
    
    handleCloseEventDialog();
  };
  
  // Functions to render different views
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Get all events for this month
    const eventsInMonth = filteredEvents.filter(event => {
      const eventDate = parseISO(event.startDate);
      return isSameMonth(eventDate, currentDate);
    });
    
    return (
      <Box sx={{ mt: 3 }}>
        <Grid container spacing={1}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Grid item xs={12/7} key={day}>
              <Typography align="center" variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {day}
              </Typography>
            </Grid>
          ))}
          
          {daysInMonth.map(day => {
            const dayEvents = eventsInMonth.filter(event => 
              isSameDay(parseISO(event.startDate), day)
            );
            
            return (
              <Grid item xs={12/7} key={day.toString()}>
                <Paper 
                  elevation={0}
                  sx={{
                    height: '120px',
                    p: 1,
                    overflow: 'hidden',
                    backgroundColor: isSameDay(day, new Date()) 
                      ? alpha(theme.palette.primary.main, 0.1)
                      : 'transparent',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1
                  }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: isSameDay(day, new Date()) ? 'bold' : 'normal',
                      color: isSameDay(day, new Date()) ? theme.palette.primary.main : 'inherit'
                    }}
                  >
                    {format(day, 'd')}
                  </Typography>
                  
                  <Box sx={{ mt: 1, maxHeight: '90px', overflow: 'hidden' }}>
                    {dayEvents.slice(0, 2).map(event => (
                      <Chip
                        key={event.id}
                        label={event.title}
                        size="small"
                        onClick={() => handleOpenEventDialog(event)}
                        sx={{
                          mb: 0.5,
                          width: '100%',
                          justifyContent: 'flex-start',
                          backgroundColor: theme.palette.primary.light,
                          color: theme.palette.primary.contrastText
                        }}
                      />
                    ))}
                    {dayEvents.length > 2 && (
                      <Typography variant="caption" color="textSecondary">
                        +{dayEvents.length - 2} more
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };
  
  const renderWeekView = () => {
    // Simplified week view for now
    return (
      <Typography variant="body1">Week view for {format(currentDate, 'MMMM d, yyyy')}</Typography>
    );
  };
  
  const renderDayView = () => {
    // Simplified day view for now
    return (
      <Typography variant="body1">Day view for {format(currentDate, 'MMMM d, yyyy')}</Typography>
    );
  };
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3, maxWidth: '1600px', mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            <CalendarIcon sx={{ mr: 1 }} />
            Events Calendar
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenEventDialog()}
              sx={{ height: 40 }}
            >
              {!isMobile ? 'Add Event' : '+'}
            </Button>
          </Box>
        </Box>
        
        <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={navigatePrevious}>
                <ChevronLeftIcon />
              </IconButton>
              
              <Button
                onClick={navigateToday}
                startIcon={<TodayIcon />}
                sx={{ mx: 1 }}
              >
                Today
              </Button>
              
              <IconButton onClick={navigateNext}>
                <ChevronRightIcon />
              </IconButton>
              
              <Typography variant="h6" sx={{ ml: 2, fontWeight: 'medium' }}>
                {format(currentDate, 'MMMM yyyy')}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Box sx={{ minWidth: 140 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    label="Category"
                    onChange={handleCategoryFilterChange}
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    <MenuItem value="Public Meeting">Public Meeting</MenuItem>
                    <MenuItem value="Board Meeting">Board Meeting</MenuItem>
                    <MenuItem value="Workshop">Workshop</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Tabs 
                value={view}
                onChange={(_, newValue) => setView(newValue)}
                aria-label="calendar view"
                sx={{ ml: { sm: 2 } }}
              >
                <Tab icon={<MonthViewIcon />} label={isTablet ? undefined : "Month"} value="month" />
                <Tab icon={<WeekViewIcon />} label={isTablet ? undefined : "Week"} value="week" />
                <Tab icon={<DayViewIcon />} label={isTablet ? undefined : "Day"} value="day" />
              </Tabs>
            </Box>
          </Box>
          
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {view === 'month' && renderMonthView()}
              {view === 'week' && renderWeekView()}
              {view === 'day' && renderDayView()}
            </>
          )}
        </Paper>
      </Box>
      
      {/* Event Dialog */}
      <Dialog 
        open={openEventDialog} 
        onClose={handleCloseEventDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedEvent ? 'Edit Event' : 'Add New Event'}
          <IconButton
            aria-label="close"
            onClick={handleCloseEventDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                name="title"
                label="Event Title"
                type="text"
                fullWidth
                variant="outlined"
                value={newEvent.title}
                onChange={handleEventChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="description"
                label="Description"
                type="text"
                fullWidth
                variant="outlined"
                value={newEvent.description}
                onChange={handleEventChange}
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <DatePicker 
                label="Start Date"
                value={parseISO(newEvent.startDate || '')}
                onChange={(date) => {
                  if (date) {
                    setNewEvent(prev => ({
                      ...prev,
                      startDate: format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'")
                    }));
                  }
                }}
                slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <DatePicker 
                label="End Date"
                value={parseISO(newEvent.endDate || '')}
                onChange={(date) => {
                  if (date) {
                    setNewEvent(prev => ({
                      ...prev,
                      endDate: format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'")
                    }));
                  }
                }}
                slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="location"
                label="Location"
                type="text"
                fullWidth
                variant="outlined"
                value={newEvent.location}
                onChange={handleEventChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="category"
                label="Category"
                type="text"
                fullWidth
                variant="outlined"
                value={newEvent.category}
                onChange={handleEventChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="audience"
                label="Target Audience"
                type="text"
                fullWidth
                variant="outlined"
                value={newEvent.audience}
                onChange={handleEventChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="organizer"
                label="Organizer"
                type="text"
                fullWidth
                variant="outlined"
                value={newEvent.organizer}
                onChange={handleEventChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseEventDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveEvent} 
            variant="contained" 
            disabled={!newEvent.title}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default EventsCalendarPage; 