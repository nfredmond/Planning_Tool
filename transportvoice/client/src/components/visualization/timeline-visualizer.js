import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Paper, Grid, Card, CardContent, 
  Stepper, Step, StepLabel, StepContent, Button, TextField,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, Tooltip, Select, MenuItem, FormControl, InputLabel,
  LinearProgress, Tabs, Tab, Box, Divider, Avatar, List, ListItem,
  ListItemText, ListItemIcon, ListItemAvatar
} from '@mui/material';
import { 
  Timeline, TimelineItem, TimelineOppositeContent,
  TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot
} from '@mui/lab';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Assignment as AssignmentIcon,
  Flag as FlagIcon,
  Timeline as TimelineIcon,
  CalendarToday as CalendarIcon,
  LayersClear as LayersClearIcon,
  Save as SaveIcon,
  Celebration as CelebrationIcon,
  BarChart as BarChartIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  AddAlert as AddAlertIcon,
  NotificationsActive as NotificationsActiveIcon
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { saveAs } from 'file-saver';

// Register Chart.js components
Chart.register(...registerables);

const ImplementationTimelineVisualizer = ({ projectId, initialData = null }) => {
  const [project, setProject] = useState(null);
  const [phases, setPhases] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('timeline'); // timeline, gantt, calendar
  const [activePhase, setActivePhase] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('phase'); // phase, task, milestone
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [timeScale, setTimeScale] = useState('months'); // days, weeks, months, quarters
  const [highlightCriticalPath, setHighlightCriticalPath] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [comments, setComments] = useState([]);
  const [notifyStakeholders, setNotifyStakeholders] = useState(false);
  const [dateView, setDateView] = useState(() => {
    // Default date view is current month and year
    const now = new Date();
    return {
      month: now.getMonth(),
      year: now.getFullYear()
    };
  });
  
  // Load project data
  useEffect(() => {
    const loadProjectData = async () => {
      setLoading(true);
      
      try {
        // Get the API endpoint URL from environment or use default
        const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
        
        if (initialData) {
          setProject(initialData.project);
          setPhases(initialData.phases);
          setTasks(initialData.tasks);
          setMilestones(initialData.milestones);
          setTeamMembers(initialData.teamMembers || []);
          setComments(initialData.comments || []);
          
          // Set start and end dates from project data
          if (initialData.project) {
            setStartDate(new Date(initialData.project.startDate));
            setEndDate(new Date(initialData.project.endDate));
          }
          
          // Set active phase to the current ongoing phase
          const currentDate = new Date();
          const currentPhase = initialData.phases.find(phase => 
            new Date(phase.startDate) <= currentDate && 
            new Date(phase.endDate) >= currentDate
          ) || initialData.phases[0];
          
          if (currentPhase) {
            setActivePhase(currentPhase.id);
          }
        } else if (projectId) {
          // Fetch data from API if projectId is provided
          try {
            const response = await fetch(`${apiBaseUrl}/implementation-timeline/${projectId}`);
            const result = await response.json();
            
            if (result.success) {
              const timelineData = result.data;
              
              setProject(timelineData.project);
              setPhases(timelineData.phases || []);
              setTasks(timelineData.tasks || []);
              setMilestones(timelineData.milestones || []);
              setTeamMembers(timelineData.teamMembers || []);
              setComments(timelineData.comments || []);
              
              // Set start and end dates
              if (timelineData.project) {
                setStartDate(new Date(timelineData.project.startDate));
                setEndDate(new Date(timelineData.project.endDate));
              }
              
              // Set active phase
              const currentDate = new Date();
              const currentPhase = (timelineData.phases || []).find(phase => 
                new Date(phase.startDate) <= currentDate && 
                new Date(phase.endDate) >= currentDate
              ) || (timelineData.phases || [])[0];
              
              if (currentPhase) {
                setActivePhase(currentPhase.id);
              }
            } else {
              // If API doesn't return data, use mock data
              console.warn("API didn't return valid data, using mock data instead:", result.message);
              const mockData = generateMockData();
              
              setProject(mockData.project);
              setPhases(mockData.phases);
              setTasks(mockData.tasks);
              setMilestones(mockData.milestones);
              setTeamMembers(mockData.teamMembers);
              setComments(mockData.comments);
              
              // Set start and end dates
              setStartDate(new Date(mockData.project.startDate));
              setEndDate(new Date(mockData.project.endDate));
              
              // Set active phase
              const currentDate = new Date();
              const currentPhase = mockData.phases.find(phase => 
                new Date(phase.startDate) <= currentDate && 
                new Date(phase.endDate) >= currentDate
              ) || mockData.phases[0];
              
              if (currentPhase) {
                setActivePhase(currentPhase.id);
              }
            }
          } catch (apiError) {
            console.error("Error fetching from API:", apiError);
            // Fall back to mock data if API request fails
            const mockData = generateMockData();
            
            setProject(mockData.project);
            setPhases(mockData.phases);
            setTasks(mockData.tasks);
            setMilestones(mockData.milestones);
            setTeamMembers(mockData.teamMembers);
            setComments(mockData.comments);
            
            // Set start and end dates
            setStartDate(new Date(mockData.project.startDate));
            setEndDate(new Date(mockData.project.endDate));
            
            // Set active phase
            const currentDate = new Date();
            const currentPhase = mockData.phases.find(phase => 
              new Date(phase.startDate) <= currentDate && 
              new Date(phase.endDate) >= currentDate
            ) || mockData.phases[0];
            
            if (currentPhase) {
              setActivePhase(currentPhase.id);
            }
          }
        } else {
          // Use mock data if no projectId and no initialData
          const mockData = generateMockData();
          
          setProject(mockData.project);
          setPhases(mockData.phases);
          setTasks(mockData.tasks);
          setMilestones(mockData.milestones);
          setTeamMembers(mockData.teamMembers);
          setComments(mockData.comments);
          
          // Set start and end dates
          setStartDate(new Date(mockData.project.startDate));
          setEndDate(new Date(mockData.project.endDate));
          
          // Set active phase
          const currentDate = new Date();
          const currentPhase = mockData.phases.find(phase => 
            new Date(phase.startDate) <= currentDate && 
            new Date(phase.endDate) >= currentDate
          ) || mockData.phases[0];
          
          if (currentPhase) {
            setActivePhase(currentPhase.id);
          }
        }
      } catch (err) {
        setError('Error loading project data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadProjectData();
  }, [projectId, initialData]);
  
  // Generate mock data for demonstration
  const generateMockData = () => {
    const today = new Date();
    
    // Mock project start date (6 months ago)
    const projectStartDate = new Date(today);
    projectStartDate.setMonth(projectStartDate.getMonth() - 6);
    
    // Mock project end date (1 year from start date)
    const projectEndDate = new Date(projectStartDate);
    projectEndDate.setFullYear(projectEndDate.getFullYear() + 1);
    
    // Generate phase dates
    const phase1Start = new Date(projectStartDate);
    const phase1End = new Date(projectStartDate);
    phase1End.setMonth(phase1End.getMonth() + 3);
    
    const phase2Start = new Date(phase1End);
    phase2Start.setDate(phase2Start.getDate() + 1);
    const phase2End = new Date(phase2Start);
    phase2End.setMonth(phase2End.getMonth() + 4);
    
    const phase3Start = new Date(phase2End);
    phase3Start.setDate(phase3Start.getDate() + 1);
    const phase3End = new Date(phase3Start);
    phase3End.setMonth(phase3End.getMonth() + 3);
    
    const phase4Start = new Date(phase3End);
    phase4Start.setDate(phase4Start.getDate() + 1);
    const phase4End = new Date(projectEndDate);
    
    // Mock project data
    const project = {
      id: 'proj-001',
      name: 'Downtown Bicycle Network Expansion',
      description: 'Expanding the bicycle network in the downtown area to improve safety and accessibility for cyclists.',
      startDate: projectStartDate.toISOString(),
      endDate: projectEndDate.toISOString(),
      status: today < phase1End ? 'planning' : 
              today < phase3Start ? 'implementation' : 
              today < projectEndDate ? 'finalizing' : 'completed',
      budget: 2500000,
      budgetSpent: 1200000,
      estimatedCompletion: Math.min(((today - projectStartDate) / (projectEndDate - projectStartDate)) * 100, 100).toFixed(0),
      stakeholders: ['City Transportation Department', 'Downtown Business Association', 'Bicycle Advocacy Group', 'Neighborhood Councils']
    };
    
    // Mock phases
    const phases = [
      {
        id: 'phase-1',
        name: 'Planning and Design',
        description: 'Initial planning, community engagement, and preliminary design development.',
        startDate: phase1Start.toISOString(),
        endDate: phase1End.toISOString(),
        progress: 100,
        status: 'completed',
        color: '#4CAF50'
      },
      {
        id: 'phase-2',
        name: 'Permitting and Procurement',
        description: 'Obtaining necessary permits and procurement of materials and contractors.',
        startDate: phase2Start.toISOString(),
        endDate: phase2End.toISOString(),
        progress: today > phase2End ? 100 : Math.min(((today - phase2Start) / (phase2End - phase2Start)) * 100, 100).toFixed(0),
        status: today > phase2End ? 'completed' : 'in-progress',
        color: '#2196F3'
      },
      {
        id: 'phase-3',
        name: 'Construction',
        description: 'Physical implementation of the bicycle network improvements.',
        startDate: phase3Start.toISOString(),
        endDate: phase3End.toISOString(),
        progress: today > phase3End ? 100 : today > phase3Start ? Math.min(((today - phase3Start) / (phase3End - phase3Start)) * 100, 100).toFixed(0) : 0,
        status: today > phase3End ? 'completed' : today > phase3Start ? 'in-progress' : 'not-started',
        color: '#FF9800'
      },
      {
        id: 'phase-4',
        name: 'Evaluation and Adjustments',
        description: 'Post-implementation evaluation and adjustments based on feedback and usage patterns.',
        startDate: phase4Start.toISOString(),
        endDate: phase4End.toISOString(),
        progress: today > phase4Start ? Math.min(((today - phase4Start) / (phase4End - phase4Start)) * 100, 100).toFixed(0) : 0,
        status: today > phase4End ? 'completed' : today > phase4Start ? 'in-progress' : 'not-started',
        color: '#9C27B0'
      }
    ];
    
    // Mock tasks
    const tasks = [
      {
        id: 'task-1',
        phaseId: 'phase-1',
        name: 'Community Engagement Workshops',
        description: 'Conduct workshops with community members to gather input on bicycle network design.',
        startDate: new Date(phase1Start.getTime() + 7*24*60*60*1000).toISOString(),
        endDate: new Date(phase1Start.getTime() + 28*24*60*60*1000).toISOString(),
        progress: 100,
        status: 'completed',
        assignedTo: 'member-1',
        dependencies: []
      },
      {
        id: 'task-2',
        phaseId: 'phase-1',
        name: 'Traffic Analysis',
        description: 'Analyze current traffic patterns to optimize bicycle lane placement.',
        startDate: new Date(phase1Start.getTime() + 14*24*60*60*1000).toISOString(),
        endDate: new Date(phase1Start.getTime() + 42*24*60*60*1000).toISOString(),
        progress: 100,
        status: 'completed',
        assignedTo: 'member-3',
        dependencies: []
      },
      {
        id: 'task-3',
        phaseId: 'phase-1',
        name: 'Preliminary Design Development',
        description: 'Develop preliminary designs based on community input and traffic analysis.',
        startDate: new Date(phase1Start.getTime() + 35*24*60*60*1000).toISOString(),
        endDate: new Date(phase1Start.getTime() + 65*24*60*60*1000).toISOString(),
        progress: 100,
        status: 'completed',
        assignedTo: 'member-2',
        dependencies: ['task-1', 'task-2'],
        isCriticalPath: true
      },
      {
        id: 'task-4',
        phaseId: 'phase-2',
        name: 'Environmental Review',
        description: 'Complete required environmental impact assessments.',
        startDate: new Date(phase2Start.getTime() + 7*24*60*60*1000).toISOString(),
        endDate: new Date(phase2Start.getTime() + 35*24*60*60*1000).toISOString(),
        progress: 100,
        status: 'completed',
        assignedTo: 'member-4',
        dependencies: ['task-3'],
        isCriticalPath: true
      },
      {
        id: 'task-5',
        phaseId: 'phase-2',
        name: 'Material Procurement',
        description: 'Procure necessary materials for construction.',
        startDate: new Date(phase2Start.getTime() + 21*24*60*60*1000).toISOString(),
        endDate: new Date(phase2Start.getTime() + 70*24*60*60*1000).toISOString(),
        progress: 95,
        status: 'in-progress',
        assignedTo: 'member-5',
        dependencies: ['task-3']
      },
      {
        id: 'task-6',
        phaseId: 'phase-2',
        name: 'Contractor Selection',
        description: 'Select contractors through competitive bidding process.',
        startDate: new Date(phase2Start.getTime() + 28*24*60*60*1000).toISOString(),
        endDate: new Date(phase2Start.getTime() + 56*24*60*60*1000).toISOString(),
        progress: 100,
        status: 'completed',
        assignedTo: 'member-1',
        dependencies: [],
        isCriticalPath: true
      },
      {
        id: 'task-7',
        phaseId: 'phase-3',
        name: 'Lane Marking and Signage',
        description: 'Install bicycle lane markings and associated signage.',
        startDate: new Date(phase3Start.getTime() + 14*24*60*60*1000).toISOString(),
        endDate: new Date(phase3Start.getTime() + 42*24*60*60*1000).toISOString(),
        progress: 50,
        status: 'in-progress',
        assignedTo: 'member-6',
        dependencies: ['task-5', 'task-6'],
        isCriticalPath: true
      },
      {
        id: 'task-8',
        phaseId: 'phase-3',
        name: 'Intersection Improvements',
        description: 'Implement bicycle-specific improvements at key intersections.',
        startDate: new Date(phase3Start.getTime() + 7*24*60*60*1000).toISOString(),
        endDate: new Date(phase3Start.getTime() + 49*24*60*60*1000).toISOString(),
        progress: 40,
        status: 'in-progress',
        assignedTo: 'member-7',
        dependencies: ['task-6']
      },
      {
        id: 'task-9',
        phaseId: 'phase-3',
        name: 'Protected Lane Installation',
        description: 'Install physical separators for protected bicycle lanes.',
        startDate: new Date(phase3Start.getTime() + 21*24*60*60*1000).toISOString(),
        endDate: new Date(phase3Start.getTime() + 63*24*60*60*1000).toISOString(),
        progress: 30,
        status: 'in-progress',
        assignedTo: 'member-8',
        dependencies: ['task-7'],
        isCriticalPath: true
      },
      {
        id: 'task-10',
        phaseId: 'phase-4',
        name: 'Post-Implementation Survey',
        description: 'Conduct surveys to gather feedback on the implemented bicycle network.',
        startDate: new Date(phase4Start.getTime() + 14*24*60*60*1000).toISOString(),
        endDate: new Date(phase4Start.getTime() + 42*24*60*60*1000).toISOString(),
        progress: 0,
        status: 'not-started',
        assignedTo: 'member-1',
        dependencies: ['task-9']
      },
      {
        id: 'task-11',
        phaseId: 'phase-4',
        name: 'Usage Monitoring',
        description: 'Monitor bicycle usage patterns on the new network.',
        startDate: new Date(phase4Start.getTime() + 7*24*60*60*1000).toISOString(),
        endDate: new Date(phase4Start.getTime() + 70*24*60*60*1000).toISOString(),
        progress: 0,
        status: 'not-started',
        assignedTo: 'member-3',
        dependencies: ['task-9']
      },
      {
        id: 'task-12',
        phaseId: 'phase-4',
        name: 'Final Adjustments',
        description: 'Make final adjustments based on monitoring and feedback.',
        startDate: new Date(phase4Start.getTime() + 49*24*60*60*1000).toISOString(),
        endDate: new Date(phase4Start.getTime() + 84*24*60*60*1000).toISOString(),
        progress: 0,
        status: 'not-started',
        assignedTo: 'member-2',
        dependencies: ['task-10', 'task-11'],
        isCriticalPath: true
      }
    ];
    
    // Mock milestones
    const milestones = [
      {
        id: 'milestone-1',
        phaseId: 'phase-1',
        name: 'Design Approval',
        description: 'Final design approved by City Transportation Department',
        date: phase1End.toISOString(),
        status: 'completed',
        type: 'approval'
      },
      {
        id: 'milestone-2',
        phaseId: 'phase-2',
        name: 'Permits Secured',
        description: 'All necessary permits obtained for construction',
        date: new Date(phase2Start.getTime() + 45*24*60*60*1000).toISOString(),
        status: 'completed',
        type: 'regulatory'
      },
      {
        id: 'milestone-3',
        phaseId: 'phase-2',
        name: 'Contracts Finalized',
        description: 'All contractor agreements finalized and signed',
        date: phase2End.toISOString(),
        status: today > phase2End ? 'completed' : 'in-progress',
        type: 'contractual'
      },
      {
        id: 'milestone-4',
        phaseId: 'phase-3',
        name: '50% Construction Complete',
        description: 'Half of the planned bicycle network improvements implemented',
        date: new Date(phase3Start.getTime() + (phase3End.getTime() - phase3Start.getTime())/2).toISOString(),
        status: today > new Date(phase3Start.getTime() + (phase3End.getTime() - phase3Start.getTime())/2) ? 'completed' : 'not-started',
        type: 'progress'
      },
      {
        id: 'milestone-5',
        phaseId: 'phase-3',
        name: 'Construction Complete',
        description: 'All physical implementation completed',
        date: phase3End.toISOString(),
        status: today > phase3End ? 'completed' : 'not-started',
        type: 'completion'
      },
      {
        id: 'milestone-6',
        phaseId: 'phase-4',
        name: 'Network Launch Event',
        description: 'Official public launch of the completed bicycle network',
        date: new Date(phase4Start.getTime() + 28*24*60*60*1000).toISOString(),
        status: 'not-started',
        type: 'event'
      },
      {
        id: 'milestone-7',
        phaseId: 'phase-4',
        name: 'Final Report Submission',
        description: 'Submission of final project report to City Council',
        date: projectEndDate.toISOString(),
        status: 'not-started',
        type: 'reporting'
      }
    ];
    
    // Mock team members
    const teamMembers = [
      {
        id: 'member-1',
        name: 'Sarah Johnson',
        role: 'Project Manager',
        email: 'sarah.johnson@example.com',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
      },
      {
        id: 'member-2',
        name: 'Michael Chen',
        role: 'Transportation Engineer',
        email: 'michael.chen@example.com',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
      },
      {
        id: 'member-3',
        name: 'Alexis Rodriguez',
        role: 'Traffic Analyst',
        email: 'alexis.rodriguez@example.com',
        avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
      },
      {
        id: 'member-4',
        name: 'James Wilson',
        role: 'Environmental Specialist',
        email: 'james.wilson@example.com',
        avatar: 'https://randomuser.me/api/portraits/men/55.jpg'
      },
      {
        id: 'member-5',
        name: 'Patricia Lee',
        role: 'Procurement Officer',
        email: 'patricia.lee@example.com',
        avatar: 'https://randomuser.me/api/portraits/women/24.jpg'
      },
      {
        id: 'member-6',
        name: 'David Okonkwo',
        role: 'Construction Manager',
        email: 'david.okonkwo@example.com',
        avatar: 'https://randomuser.me/api/portraits/men/22.jpg'
      },
      {
        id: 'member-7',
        name: 'Lisa Martinez',
        role: 'Civil Engineer',
        email: 'lisa.martinez@example.com',
        avatar: 'https://randomuser.me/api/portraits/women/53.jpg'
      },
      {
        id: 'member-8',
        name: 'Robert Kim',
        role: 'Construction Supervisor',
        email: 'robert.kim@example.com',
        avatar: 'https://randomuser.me/api/portraits/men/42.jpg'
      }
    ];
    
    // Mock comments/updates
    const comments = [
      {
        id: 'comment-1',
        itemId: 'phase-1',
        itemType: 'phase',
        userId: 'member-1',
        text: 'Community engagement workshops had excellent attendance with over 150 participants providing valuable input.',
        timestamp: new Date(phase1Start.getTime() + 25*24*60*60*1000).toISOString()
      },
      {
        id: 'comment-2',
        itemId: 'task-3',
        itemType: 'task',
        userId: 'member-2',
        text: 'Preliminary designs have been completed ahead of schedule. Ready for internal review.',
        timestamp: new Date(phase1Start.getTime() + 60*24*60*60*1000).toISOString()
      },
      {
        id: 'comment-3',
        itemId: 'milestone-2',
        itemType: 'milestone',
        userId: 'member-4',
        text: 'Environmental impact assessment identified minor concerns that have been addressed in the revised design.',
        timestamp: new Date(phase2Start.getTime() + 35*24*60*60*1000).toISOString()
      },
      {
        id: 'comment-4',
        itemId: 'task-5',
        itemType: 'task',
        userId: 'member-5',
        text: 'Facing supply chain issues with some specialized materials. Working on alternatives to avoid delays.',
        timestamp: new Date(phase2Start.getTime() + 50*24*60*60*1000).toISOString()
      },
      {
        id: 'comment-5',
        itemId: 'task-7',
        itemType: 'task',
        userId: 'member-6',
        text: 'Lane marking has begun in the downtown core. Initial feedback from cyclists is positive.',
        timestamp: new Date(phase3Start.getTime() + 20*24*60*60*1000).toISOString()
      }
    ];
    
    return { project, phases, tasks, milestones, teamMembers, comments };
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };
  
  // Get duration in days between two dates
  const getDurationDays = (startDateString, endDateString) => {
    const start = new Date(startDateString);
    const end = new Date(endDateString);
    
    // Return the difference in days
    return Math.round((end - start) / (1000 * 60 * 60 * 24));
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4CAF50'; // Green
      case 'in-progress':
        return '#2196F3'; // Blue
      case 'delayed':
        return '#FF9800'; // Orange
      case 'at-risk':
        return '#FF5722'; // Deep Orange
      case 'not-started':
        return '#9E9E9E'; // Gray
      default:
        return '#9E9E9E';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon style={{ color: '#4CAF50' }} />;
      case 'in-progress':
        return <ScheduleIcon style={{ color: '#2196F3' }} />;
      case 'delayed':
        return <WarningIcon style={{ color: '#FF9800' }} />;
      case 'at-risk':
        return <ErrorIcon style={{ color: '#FF5722' }} />;
      case 'not-started':
        return <LayersClearIcon style={{ color: '#9E9E9E' }} />;
      default:
        return <LayersClearIcon style={{ color: '#9E9E9E' }} />;
    }
  };
  
  // Get milestone icon
  const getMilestoneIcon = (type) => {
    switch (type) {
      case 'approval':
        return <CheckCircleIcon />;
      case 'regulatory':
        return <AssignmentIcon />;
      case 'contractual':
        return <MoneyIcon />;
      case 'progress':
        return <BarChartIcon />;
      case 'completion':
        return <FlagIcon />;
      case 'event':
        return <CelebrationIcon />;
      case 'reporting':
        return <AssignmentIcon />;
      default:
        return <FlagIcon />;
    }
  };
  
  // Get assignee name
  const getAssigneeName = (assigneeId) => {
    const member = teamMembers.find(m => m.id === assigneeId);
    return member ? member.name : 'Unassigned';
  };
  
  // Get assignee avatar
  const getAssigneeAvatar = (assigneeId) => {
    const member = teamMembers.find(m => m.id === assigneeId);
    return member ? member.avatar : null;
  };
  
  // Get commenter info
  const getCommenterInfo = (userId) => {
    return teamMembers.find(m => m.id === userId) || { name: 'Unknown User' };
  };
  
  // Get phase tasks
  const getPhaseTasksAndMilestones = (phaseId) => {
    const phaseTasks = tasks.filter(task => task.phaseId === phaseId);
    const phaseMilestones = milestones.filter(milestone => milestone.phaseId === phaseId);
    
    return { tasks: phaseTasks, milestones: phaseMilestones };
  };
  
  // Get the current active phase
  const getCurrentPhase = () => {
    if (!phases.length) return null;
    
    const now = new Date();
    
    // Find the phase that contains today's date
    const currentPhase = phases.find(phase => 
      new Date(phase.startDate) <= now && 
      new Date(phase.endDate) >= now
    );
    
    // If no current phase found, return the last phase if it's in the past,
    // or the first phase if it's in the future
    if (!currentPhase) {
      const pastPhases = phases.filter(phase => new Date(phase.endDate) < now);
      
      if (pastPhases.length > 0) {
        // All phases are in the past, return the last one
        return pastPhases.sort((a, b) => new Date(b.endDate) - new Date(a.endDate))[0];
      } else {
        // All phases are in the future, return the first one
        return phases.sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];
      }
    }
    
    return currentPhase;
  };
  
  // Get phase timeline items (tasks and milestones) sorted by date
  const getPhaseTimelineItems = (phaseId) => {
    const { tasks: phaseTasks, milestones: phaseMilestones } = getPhaseTasksAndMilestones(phaseId);
    
    // Convert tasks to timeline items
    const taskItems = phaseTasks.map(task => ({
      ...task,
      type: 'task',
      date: task.startDate // Use start date for sorting
    }));
    
    // Convert milestones to timeline items
    const milestoneItems = phaseMilestones.map(milestone => ({
      ...milestone,
      type: 'milestone'
    }));
    
    // Combine and sort by date
    return [...taskItems, ...milestoneItems].sort((a, b) => new Date(a.date || a.startDate) - new Date(b.date || b.startDate));
  };
  
  // Generate Gantt chart data
  const getGanttChartData = () => {
    // Sort tasks by start date
    const sortedTasks = [...tasks].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    // Get all milestones sorted by date
    const sortedMilestones = [...milestones].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate the total date range
    const allStartDates = [...sortedTasks.map(t => new Date(t.startDate)), ...sortedMilestones.map(m => new Date(m.date))];
    const allEndDates = [...sortedTasks.map(t => new Date(t.endDate)), ...sortedMilestones.map(m => new Date(m.date))];
    
    const minDate = new Date(Math.min(...allStartDates));
    const maxDate = new Date(Math.max(...allEndDates));
    
    // Calculate date labels based on timeScale
    const dateLabels = [];
    const current = new Date(minDate);
    
    while (current <= maxDate) {
      let label = '';
      
      switch (timeScale) {
        case 'days':
          label = `${current.getDate()}/${current.getMonth() + 1}`;
          current.setDate(current.getDate() + 1);
          break;
        case 'weeks':
          label = `Week ${Math.ceil((current.getDate() + current.getDay()) / 7)}`;
          current.setDate(current.getDate() + 7);
          break;
        case 'months':
          label = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(current);
          current.setMonth(current.getMonth() + 1);
          break;
        case 'quarters':
          const quarter = Math.floor(current.getMonth() / 3) + 1;
          label = `Q${quarter} ${current.getFullYear()}`;
          current.setMonth(current.getMonth() + 3);
          break;
      }
      
      dateLabels.push(label);
    }
    
    return { tasks: sortedTasks, milestones: sortedMilestones, dateLabels, minDate, maxDate };
  };
  
  // Calculate timeline height based on number of items
  const calculateTimelineHeight = (phaseId) => {
    const items = getPhaseTimelineItems(phaseId);
    return Math.max(500, items.length * 100);
  };
  
  // Export timeline to PDF
  const exportTimeline = () => {
    // In a real application, you would generate a PDF using a library
    // For this demo, we'll just show an alert
    alert('Timeline export functionality would be implemented here.');
  };
  
  // Share timeline
  const shareTimeline = () => {
    // In a real application, you would implement sharing functionality
    // For this demo, we'll just show an alert
    alert('Timeline sharing functionality would be implemented here.');
  };
  
  // Notify stakeholders of timeline updates
  const handleNotifyStakeholders = () => {
    setNotifyStakeholders(true);
    
    // In a real application, you would send notifications here
    // For this demo, we'll just show an alert
    setTimeout(() => {
      alert('Stakeholders have been notified of the timeline updates.');
      setNotifyStakeholders(false);
    }, 1500);
  };
  
  // Save timeline data to the backend API
  const saveTimelineData = async () => {
    if (!projectId) {
      return { success: false, message: "No project ID provided" };
    }

    try {
      const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
      
      // Prepare the data to be saved
      const timelineData = {
        project: project,
        phases: phases,
        tasks: tasks,
        milestones: milestones,
        teamMembers: teamMembers,
        comments: comments
      };
      
      // Send the data to the API
      const response = await fetch(`${apiBaseUrl}/implementation-timeline/${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(timelineData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Show success message (in a real app, you'd use a toast/snackbar)
        console.log('Timeline data saved successfully');
        return result;
      } else {
        console.error('Error saving timeline data:', result.message);
        return result;
      }
    } catch (error) {
      console.error('Error saving timeline data:', error);
      return { success: false, message: error.message };
    }
  };
  
  // Update the handleOpenDialog function to save data when creating/editing items
  const handleOpenDialog = (type, item = null) => {
    setDialogType(type);
    setEditingItem(item);
    setDialogOpen(true);
  };
  
  // Add saving functionality to relevant handlers
  const handleAddPhase = async (newPhase) => {
    const updatedPhases = [...phases, newPhase];
    setPhases(updatedPhases);
    await saveTimelineData();
  };

  const handleUpdatePhase = async (updatedPhase) => {
    const updatedPhases = phases.map(phase => 
      phase.id === updatedPhase.id ? updatedPhase : phase
    );
    setPhases(updatedPhases);
    await saveTimelineData();
  };

  const handleDeletePhase = async (phaseId) => {
    const updatedPhases = phases.filter(phase => phase.id !== phaseId);
    setPhases(updatedPhases);
    await saveTimelineData();
  };

  const handleAddTask = async (newTask) => {
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    await saveTimelineData();
  };

  const handleUpdateTask = async (updatedTask) => {
    const updatedTasks = tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    setTasks(updatedTasks);
    await saveTimelineData();
  };

  const handleDeleteTask = async (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    await saveTimelineData();
  };

  const handleAddMilestone = async (newMilestone) => {
    const updatedMilestones = [...milestones, newMilestone];
    setMilestones(updatedMilestones);
    await saveTimelineData();
  };

  const handleUpdateMilestone = async (updatedMilestone) => {
    const updatedMilestones = milestones.map(milestone => 
      milestone.id === updatedMilestone.id ? updatedMilestone : milestone
    );
    setMilestones(updatedMilestones);
    await saveTimelineData();
  };

  const handleDeleteMilestone = async (milestoneId) => {
    const updatedMilestones = milestones.filter(milestone => milestone.id !== milestoneId);
    setMilestones(updatedMilestones);
    await saveTimelineData();
  };
  
  // Render timeline view
  const renderTimelineView = () => {
    const currentPhase = phases.find(phase => phase.id === activePhase) || getCurrentPhase();
    if (!currentPhase) return null;
    
    const timelineItems = getPhaseTimelineItems(currentPhase.id);
    
    return (
      <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
        <div className="timeline-header">
          <Typography variant="h6">
            {currentPhase.name} Timeline
            <Chip 
              label={`${currentPhase.progress}% Complete`}
              color={getChipColorFromStatus(currentPhase.status)}
              size="small"
              sx={{ ml: 2 }}
            />
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {formatDate(currentPhase.startDate)} - {formatDate(currentPhase.endDate)} 
            ({getDurationDays(currentPhase.startDate, currentPhase.endDate)} days)
          </Typography>
          
          <div className="timeline-actions">
            <Button 
              variant="outlined" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('task')}
              size="small"
            >
              Add Task
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<FlagIcon />}
              onClick={() => handleOpenDialog('milestone')}
              size="small"
            >
              Add Milestone
            </Button>
            <IconButton onClick={exportTimeline} size="small">
              <DownloadIcon />
            </IconButton>
            <IconButton onClick={shareTimeline} size="small">
              <ShareIcon />
            </IconButton>
            <IconButton 
              onClick={handleNotifyStakeholders} 
              size="small"
              color={notifyStakeholders ? "primary" : "default"}
              disabled={notifyStakeholders}
            >
              <NotificationsActiveIcon />
            </IconButton>
          </div>
        </div>
        
        <div className="timeline-content">
          <Timeline position="alternate">
            {timelineItems.map((item) => (
              <TimelineItem key={item.id}>
                <TimelineOppositeContent color="textSecondary">
                  {item.type === 'task' ? (
                    <>
                      <Typography variant="body2">
                        {formatDate(item.startDate)}
                      </Typography>
                      <Typography variant="body2">
                        to {formatDate(item.endDate)}
                      </Typography>
                      <Typography variant="caption">
                        ({getDurationDays(item.startDate, item.endDate)} days)
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2">
                      {formatDate(item.date)}
                    </Typography>
                  )}
                </TimelineOppositeContent>
                
                <TimelineSeparator>
                  <TimelineDot 
                    color={getTimelineDotColor(item.status)}
                    variant={item.type === 'milestone' ? 'outlined' : 'filled'}
                  >
                    {item.type === 'task' ? <AssignmentIcon /> : getMilestoneIcon(item.type)}
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                
                <TimelineContent>
                  <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
                    <div className="timeline-item-header">
                      <Typography variant="h6" component="div">
                        {item.name}
                        {item.isCriticalPath && highlightCriticalPath && (
                          <Chip 
                            label="Critical Path" 
                            size="small" 
                            color="error" 
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Typography>
                      
                      <div className="timeline-item-actions">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDialog(item.type, item)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </div>
                    
                    <Typography variant="body2" color="textSecondary">
                      {item.description}
                    </Typography>
                    
                    {item.type === 'task' && (
                      <>
                        <LinearProgress 
                          variant="determinate" 
                          value={parseInt(item.progress) || 0}
                          sx={{ mt: 1, mb: 1 }}
                        />
                        <div className="task-meta">
                          <div className="assigned-to">
                            <Avatar 
                              src={getAssigneeAvatar(item.assignedTo)}
                              sx={{ width: 24, height: 24 }}
                            >
                              {getAssigneeName(item.assignedTo).substring(0, 1)}
                            </Avatar>
                            <Typography variant="caption">
                              {getAssigneeName(item.assignedTo)}
                            </Typography>
                          </div>
                          <Chip 
                            label={item.status.replace('-', ' ')}
                            size="small"
                            color={getChipColorFromStatus(item.status)}
                          />
                        </div>
                      </>
                    )}
                    
                    {item.type === 'milestone' && (
                      <Chip 
                        label={item.status.replace('-', ' ')}
                        size="small"
                        color={getChipColorFromStatus(item.status)}
                        sx={{ mt: 1 }}
                      />
                    )}
                    
                    {/* Show comments for this item if they exist */}
                    {comments.filter(c => c.itemId === item.id).length > 0 && (
                      <div className="item-comments">
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                          Latest update:
                        </Typography>
                        <div className="comment">
                          {comments
                            .filter(c => c.itemId === item.id)
                            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                            .slice(0, 1)
                            .map(comment => {
                              const commenter = getCommenterInfo(comment.userId);
                              return (
                                <div key={comment.id} className="comment-content">
                                  <Typography variant="body2">
                                    {comment.text}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    - {commenter.name}, {formatDate(comment.timestamp)}
                                  </Typography>
                                </div>
                              );
                            })
                          }
                        </div>
                      </div>
                    )}
                  </Paper>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </div>
      </Paper>
    );
  };
  
  // Render Gantt chart view
  const renderGanttView = () => {
    const { tasks: sortedTasks, milestones: sortedMilestones, dateLabels, minDate, maxDate } = getGanttChartData();
    
    return (
      <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
        <div className="gantt-header">
          <Typography variant="h6">Project Gantt Chart</Typography>
          
          <div className="gantt-controls">
            <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
              <InputLabel>Time Scale</InputLabel>
              <Select
                value={timeScale}
                onChange={(e) => setTimeScale(e.target.value)}
                label="Time Scale"
              >
                <MenuItem value="days">Days</MenuItem>
                <MenuItem value="weeks">Weeks</MenuItem>
                <MenuItem value="months">Months</MenuItem>
                <MenuItem value="quarters">Quarters</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={highlightCriticalPath}
                  onChange={(e) => setHighlightCriticalPath(e.target.checked)}
                  color="primary"
                />
              }
              label="Highlight Critical Path"
            />
            
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />}
              onClick={exportTimeline}
              size="small"
            >
              Export
            </Button>
          </div>
        </div>
        
        <div className="gantt-container">
          <div className="gantt-sidebar">
            <div className="gantt-sidebar-header">
              <Typography variant="subtitle2">Tasks & Milestones</Typography>
            </div>
            
            <div className="gantt-sidebar-items">
              {phases.map(phase => (
                <React.Fragment key={phase.id}>
                  <div className="gantt-phase-header" style={{ backgroundColor: phase.color + '22' }}>
                    <Typography variant="subtitle2" style={{ color: phase.color }}>
                      {phase.name}
                    </Typography>
                  </div>
                  
                  {sortedTasks
                    .filter(task => task.phaseId === phase.id)
                    .map(task => (
                      <div key={task.id} className="gantt-sidebar-item">
                        <Typography variant="body2" noWrap>
                          {task.name}
                          {task.isCriticalPath && highlightCriticalPath && (
                            <span className="critical-path-indicator">*</span>
                          )}
                        </Typography>
                      </div>
                    ))
                  }
                  
                  {sortedMilestones
                    .filter(milestone => milestone.phaseId === phase.id)
                    .map(milestone => (
                      <div key={milestone.id} className="gantt-sidebar-item milestone">
                        <Typography variant="body2" noWrap>
                          ◆ {milestone.name}
                        </Typography>
                      </div>
                    ))
                  }
                </React.Fragment>
              ))}
            </div>
          </div>
          
          <div className="gantt-chart">
            <div className="gantt-chart-header">
              {dateLabels.map((label, index) => (
                <div key={index} className="gantt-date-label">
                  {label}
                </div>
              ))}
            </div>
            
            <div className="gantt-chart-content">
              {phases.map(phase => (
                <React.Fragment key={phase.id}>
                  <div className="gantt-phase-row" style={{ backgroundColor: phase.color + '11' }}>
                    {/* Empty row for phase header */}
                  </div>
                  
                  {sortedTasks
                    .filter(task => task.phaseId === phase.id)
                    .map(task => {
                      const startDate = new Date(task.startDate);
                      const endDate = new Date(task.endDate);
                      
                      // Calculate position and width relative to date range
                      const totalDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);
                      const startOffset = (startDate - minDate) / (1000 * 60 * 60 * 24);
                      const duration = (endDate - startDate) / (1000 * 60 * 60 * 24);
                      
                      const leftPosition = (startOffset / totalDays) * 100;
                      const widthPercentage = (duration / totalDays) * 100;
                      
                      return (
                        <div key={task.id} className="gantt-chart-row">
                          <div 
                            className={`gantt-bar ${task.isCriticalPath && highlightCriticalPath ? 'critical-path' : ''}`}
                            style={{
                              left: `${leftPosition}%`,
                              width: `${widthPercentage}%`,
                              backgroundColor: getStatusColor(task.status)
                            }}
                            title={`${task.name} (${formatDate(task.startDate)} - ${formatDate(task.endDate)})`}
                          >
                            <div className="gantt-progress" style={{ width: `${task.progress}%` }}></div>
                          </div>
                        </div>
                      );
                    })
                  }
                  
                  {sortedMilestones
                    .filter(milestone => milestone.phaseId === phase.id)
                    .map(milestone => {
                      const date = new Date(milestone.date);
                      
                      // Calculate position relative to date range
                      const totalDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);
                      const dateOffset = (date - minDate) / (1000 * 60 * 60 * 24);
                      
                      const leftPosition = (dateOffset / totalDays) * 100;
                      
                      return (
                        <div key={milestone.id} className="gantt-chart-row">
                          <div 
                            className="gantt-milestone"
                            style={{
                              left: `${leftPosition}%`,
                              backgroundColor: getStatusColor(milestone.status)
                            }}
                            title={`${milestone.name} (${formatDate(milestone.date)})`}
                          ></div>
                        </div>
                      );
                    })
                  }
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        
        <div className="gantt-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#4CAF50' }}></div>
            <Typography variant="caption">Completed</Typography>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#2196F3' }}></div>
            <Typography variant="caption">In Progress</Typography>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#FF9800' }}></div>
            <Typography variant="caption">Delayed</Typography>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#FF5722' }}></div>
            <Typography variant="caption">At Risk</Typography>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#9E9E9E' }}></div>
            <Typography variant="caption">Not Started</Typography>
          </div>
          {highlightCriticalPath && (
            <div className="legend-item">
              <div className="legend-color critical-path"></div>
              <Typography variant="caption">Critical Path</Typography>
            </div>
          )}
        </div>
      </Paper>
    );
  };
  
  // Render project overview
  const renderProjectOverview = () => {
    if (!project) return null;

    // Create chart data for budget
    const budgetData = {
      labels: ['Budget Allocation'],
      datasets: [
        {
          label: 'Spent',
          data: [project.budgetSpent],
          backgroundColor: '#2196F3',
        },
        {
          label: 'Remaining',
          data: [project.budget - project.budgetSpent],
          backgroundColor: '#BBDEFB',
        },
      ],
    };
    
    // Create chart data for progress
    const progressData = {
      labels: ['Overall Progress'],
      datasets: [
        {
          label: 'Complete',
          data: [project.estimatedCompletion],
          backgroundColor: '#4CAF50',
        },
        {
          label: 'Remaining',
          data: [100 - project.estimatedCompletion],
          backgroundColor: '#C8E6C9',
        },
      ],
    };
    
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5">{project.name}</Typography>
            <Typography variant="body1" paragraph>
              {project.description}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Start Date
                </Typography>
                <Typography variant="body1">
                  {formatDate(project.startDate)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  End Date
                </Typography>
                <Typography variant="body1">
                  {formatDate(project.endDate)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Status
                </Typography>
                <Chip 
                  label={project.status}
                  color={getChipColorFromStatus(project.status)}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Duration
                </Typography>
                <Typography variant="body1">
                  {getDurationDays(project.startDate, project.endDate)} days
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" align="center">
                  Budget
                </Typography>
                <div style={{ height: 120 }}>
                  <Line
                    data={budgetData}
                    options={{
                      indexAxis: 'y',
                      scales: {
                        x: {
                          stacked: true,
                          max: project.budget,
                          title: {
                            display: true,
                            text: 'Amount ($)'
                          }
                        },
                        y: {
                          stacked: true,
                        }
                      },
                      plugins: {
                        legend: {
                          position: 'bottom'
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `${context.dataset.label}: $${context.raw.toLocaleString()}`;
                            }
                          }
                        }
                      },
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                </div>
                <Typography variant="body2" align="center">
                  ${project.budgetSpent.toLocaleString()} of ${project.budget.toLocaleString()}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" align="center">
                  Progress
                </Typography>
                <div style={{ height: 120 }}>
                  <Line
                    data={progressData}
                    options={{
                      indexAxis: 'y',
                      scales: {
                        x: {
                          stacked: true,
                          min: 0,
                          max: 100,
                          title: {
                            display: true,
                            text: 'Percentage (%)'
                          }
                        },
                        y: {
                          stacked: true,
                        }
                      },
                      plugins: {
                        legend: {
                          position: 'bottom'
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `${context.dataset.label}: ${context.raw}%`;
                            }
                          }
                        }
                      },
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                </div>
                <Typography variant="body2" align="center">
                  {project.estimatedCompletion}% Complete
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">
                  Key Stakeholders
                </Typography>
                <div className="stakeholders-list">
                  {project.stakeholders.map((stakeholder, index) => (
                    <Chip 
                      key={index}
                      label={stakeholder}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    );
  };
  
  // Render project phases
  const renderProjectPhases = () => {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Project Phases</Typography>
        
        <Stepper activeStep={getActivePhaseIndex()} orientation="horizontal">
          {phases.map((phase, index) => (
            <Step key={phase.id}>
              <StepLabel
                StepIconProps={{
                  style: { color: phase.color }
                }}
                optional={
                  <Typography variant="caption" sx={{ display: 'block' }}>
                    {formatDate(phase.startDate)} - {formatDate(phase.endDate)}
                  </Typography>
                }
              >
                <Button
                  onClick={() => setActivePhase(phase.id)}
                  sx={{ textTransform: 'none' }}
                  color={activePhase === phase.id ? 'primary' : 'inherit'}
                >
                  {phase.name}
                </Button>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="textSecondary">
                  {phase.description}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={parseInt(phase.progress) || 0}
                  sx={{ mt: 2, mb: 1 }}
                />
                <Typography variant="body2">
                  {phase.progress}% Complete
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => setActivePhase(phase.id)}
                  sx={{ mt: 1 }}
                >
                  View Details
                </Button>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    );
  };
  
  // Helper to get active phase index
  const getActivePhaseIndex = () => {
    return phases.findIndex(phase => phase.id === activePhase);
  };
  
  // Helper to get chip color from status
  const getChipColorFromStatus = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'primary';
      case 'delayed':
        return 'warning';
      case 'at-risk':
        return 'error';
      case 'not-started':
        return 'default';
      default:
        return 'default';
    }
  };
  
  // Helper to get timeline dot color
  const getTimelineDotColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'primary';
      case 'delayed':
        return 'warning';
      case 'at-risk':
        return 'error';
      case 'not-started':
        return 'grey';
      default:
        return 'grey';
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="timeline-loading">
        <Typography>Loading project timeline...</Typography>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="timeline-error">
        <Typography color="error">{error}</Typography>
      </div>
    );
  }
  
  return (
    <Container className="implementation-timeline">
      <Typography variant="h4" gutterBottom>Implementation Timeline</Typography>
      
      {renderProjectOverview()}
      
      {renderProjectPhases()}
      
      <Box sx={{ mb: 2 }}>
        <Tabs
          value={viewMode}
          onChange={(e, newValue) => setViewMode(newValue)}
          aria-label="timeline view modes"
        >
          <Tab 
            value="timeline" 
            label="Timeline View" 
            icon={<TimelineIcon />} 
            iconPosition="start"
          />
          <Tab 
            value="gantt" 
            label="Gantt Chart" 
            icon={<BarChartIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>
      
      {viewMode === 'timeline' && renderTimelineView()}
      {viewMode === 'gantt' && renderGanttView()}
      
      {/* Add/Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingItem ? `Edit ${dialogType}` : `Add New ${dialogType}`}
        </DialogTitle>
        <DialogContent>
          {/* Dialog form would be implemented here */}
          <Typography>
            This dialog would contain a form for {editingItem ? 'editing' : 'adding'} a {dialogType}.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" color="primary">
            {editingItem ? 'Save Changes' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <style jsx>{`
        .implementation-timeline {
          padding: 20px 0;
        }
        
        .timeline-header, .gantt-header {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .timeline-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        
        .gantt-controls {
          display: flex;
          align-items: center;
        }
        
        .timeline-content {
          margin-top: 30px;
        }
        
        .timeline-item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .task-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
        }
        
        .assigned-to {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .critical-path-indicator {
          color: #f44336;
          font-weight: bold;
          margin-left: 5px;
        }
        
        .item-comments {
          margin-top: 10px;
          border-top: 1px solid #f0f0f0;
          padding-top: 8px;
        }
        
        .comment-content {
          margin-top: 5px;
        }
        
        .stakeholders-list {
          margin-top: 5px;
        }
        
        .gantt-container {
          display: flex;
          border: 1px solid #e0e0e0;
          margin-top: 10px;
          height: 500px;
          overflow: auto;
        }
        
        .gantt-sidebar {
          width: 250px;
          min-width: 250px;
          border-right: 1px solid #e0e0e0;
          overflow-y: auto;
        }
        
        .gantt-sidebar-header {
          padding: 10px;
          border-bottom: 1px solid #e0e0e0;
          background-color: #f5f5f5;
          position: sticky;
          top: 0;
          z-index: 1;
        }
        
        .gantt-phase-header {
          padding: 8px 10px;
          border-bottom: 1px solid #e0e0e0;
          font-weight: bold;
        }
        
        .gantt-sidebar-item {
          padding: 8px 10px;
          border-bottom: 1px solid #f0f0f0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .gantt-sidebar-item.milestone {
          font-style: italic;
        }
        
        .gantt-chart {
          flex: 1;
          overflow-x: auto;
          position: relative;
        }
        
        .gantt-chart-header {
          display: flex;
          border-bottom: 1px solid #e0e0e0;
          background-color: #f5f5f5;
          position: sticky;
          top: 0;
          z-index: 1;
        }
        
        .gantt-date-label {
          min-width: 100px;
          padding: 10px;
          text-align: center;
          border-right: 1px dashed #e0e0e0;
          font-size: 0.8rem;
        }
        
        .gantt-chart-content {
          position: relative;
        }
        
        .gantt-phase-row {
          height: 35px;
        }
        
        .gantt-chart-row {
          height: 35px;
          position: relative;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .gantt-bar {
          position: absolute;
          height: 20px;
          top: 7px;
          border-radius: 4px;
          z-index: 1;
          min-width: 10px;
        }
        
        .gantt-bar.critical-path {
          border: 2px solid #f44336;
        }
        
        .gantt-progress {
          height: 100%;
          background-color: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }
        
        .gantt-milestone {
          position: absolute;
          width: 12px;
          height: 12px;
          top: 12px;
          transform: translateX(-6px) rotate(45deg);
          z-index: 1;
        }
        
        .gantt-legend {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 20px;
          flex-wrap: wrap;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .legend-color {
          width: 15px;
          height: 15px;
          border-radius: 3px;
        }
        
        .legend-color.critical-path {
          border: 2px solid #f44336;
          background-color: transparent;
        }
        
        @media (max-width: 768px) {
          .timeline-header, .gantt-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .timeline-actions, .gantt-controls {
            width: 100%;
            justify-content: space-between;
          }
          
          .timeline-content {
            margin-top: 20px;
          }
        }
      `}</style>
    </Container>
  );
};

export default ImplementationTimelineVisualizer;
