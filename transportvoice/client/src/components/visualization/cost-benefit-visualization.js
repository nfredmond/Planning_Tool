import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter
} from 'recharts';
import { 
  Container, Grid, Paper, Typography, Tabs, Tab, Box, 
  Button, TextField, Select, MenuItem, FormControl, 
  InputLabel, Slider, Switch, FormControlLabel, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, IconButton, Tooltip as MuiTooltip, Card, CardContent
} from '@mui/material';
import { 
  AttachMoney, DirectionsBike, DirectionsWalk, DirectionsBus, 
  LocalFlorist, AccessTime, People, Favorite, Security, AddCircle,
  DeleteOutline, Edit, Save, Cancel, BarChart as BarChartIcon,
  PieChart as PieChartIcon, ShowChart as LineChartIcon, 
  BubbleChart as RadarChartIcon, Download, Info
} from '@mui/icons-material';
import * as d3 from 'd3';

const CostBenefitVisualization = ({ projectId, initialAlternatives = null }) => {
  const [alternatives, setAlternatives] = useState([]);
  const [selectedAlternativeId, setSelectedAlternativeId] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newMetricName, setNewMetricName] = useState('');
  const [newMetricUnit, setNewMetricUnit] = useState('');
  const [newMetricCategory, setNewMetricCategory] = useState('economic');
  const [viewMode, setViewMode] = useState('comparison'); // comparison, detail, matrix
  const [chartType, setChartType] = useState('radar'); // bar, radar, matrix
  const [normalizeData, setNormalizeData] = useState(true);
  const [showThresholds, setShowThresholds] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewingMetric, setViewingMetric] = useState(null);
  const [communityFeedback, setCommunityFeedback] = useState([]); 
  const [editingAlternative, setEditingAlternative] = useState(null);
  const [categoryWeights, setCategoryWeights] = useState({
    economic: 1.0,
    environmental: 1.0,
    social: 1.0,
    mobility: 1.0,
  });
  
  const svgRef = useRef(null);
  
  // Load project data
  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);
      
      try {
        // In a real application, fetch from API
        // For demo, use mock data or provided initialAlternatives
        
        if (initialAlternatives) {
          setAlternatives(initialAlternatives);
          
          // Extract unique metrics from alternatives
          const uniqueMetrics = new Set();
          initialAlternatives.forEach(alt => {
            Object.keys(alt.metrics).forEach(metricId => {
              uniqueMetrics.add(metricId);
            });
          });
          
          // Get metric definitions
          const metricsList = Array.from(uniqueMetrics).map(metricId => {
            // Find this metric in any alternative to get its details
            for (const alt of initialAlternatives) {
              if (alt.metrics[metricId]) {
                return {
                  id: metricId,
                  name: alt.metrics[metricId].name,
                  unit: alt.metrics[metricId].unit,
                  category: alt.metrics[metricId].category || 'economic',
                  description: alt.metrics[metricId].description || '',
                  thresholds: alt.metrics[metricId].thresholds || null,
                  higherIsBetter: alt.metrics[metricId].higherIsBetter !== false
                };
              }
            }
          });
          
          setMetrics(metricsList.filter(m => m !== undefined));
          
          if (initialAlternatives.length > 0) {
            setSelectedAlternativeId(initialAlternatives[0].id);
          }
        } else {
          // Mock data for demonstration
          const mockData = generateMockData();
          setAlternatives(mockData.alternatives);
          setMetrics(mockData.metrics);
          setCommunityFeedback(mockData.communityFeedback);
          
          if (mockData.alternatives.length > 0) {
            setSelectedAlternativeId(mockData.alternatives[0].id);
          }
        }
      } catch (err) {
        setError('Error loading project data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectData();
  }, [projectId, initialAlternatives]);
  
  // Generate mock data
  const generateMockData = () => {
    // Define metrics
    const metrics = [
      {
        id: 'implementationCost',
        name: 'Implementation Cost',
        unit: '$',
        category: 'economic',
        description: 'Total cost to implement the project',
        thresholds: { low: 500000, medium: 1000000, high: 2000000 },
        higherIsBetter: false
      },
      {
        id: 'maintenanceCost',
        name: 'Annual Maintenance Cost',
        unit: '$/year',
        category: 'economic',
        description: 'Yearly maintenance expenses',
        thresholds: { low: 50000, medium: 100000, high: 200000 },
        higherIsBetter: false
      },
      {
        id: 'travelTimeSavings',
        name: 'Travel Time Savings',
        unit: 'hours/year',
        category: 'mobility',
        description: 'Total hours saved by travelers annually',
        thresholds: { low: 10000, medium: 50000, high: 100000 },
        higherIsBetter: true
      },
      {
        id: 'ghgReduction',
        name: 'GHG Emissions Reduction',
        unit: 'tons CO2e/year',
        category: 'environmental',
        description: 'Annual reduction in greenhouse gas emissions',
        thresholds: { low: 500, medium: 2000, high: 5000 },
        higherIsBetter: true
      },
      {
        id: 'airQualityImprovement',
        name: 'Air Quality Improvement',
        unit: 'index',
        category: 'environmental',
        description: 'Improvement in local air quality index',
        thresholds: { low: 2, medium: 5, high: 10 },
        higherIsBetter: true
      },
      {
        id: 'accessToJobs',
        name: 'Improved Access to Jobs',
        unit: 'jobs',
        category: 'social',
        description: 'Additional jobs accessible within 30 minutes',
        thresholds: { low: 1000, medium: 5000, high: 10000 },
        higherIsBetter: true
      },
      {
        id: 'accidents',
        name: 'Accident Reduction',
        unit: 'accidents/year',
        category: 'social',
        description: 'Estimated reduction in traffic accidents per year',
        thresholds: { low: 5, medium: 20, high: 50 },
        higherIsBetter: true
      },
      {
        id: 'bikeCapacity',
        name: 'Bicycle Capacity',
        unit: 'bikes/hour',
        category: 'mobility',
        description: 'Hourly bicycle throughput capacity',
        thresholds: { low: 200, medium: 500, high: 1000 },
        higherIsBetter: true
      },
      {
        id: 'transitCapacity',
        name: 'Transit Capacity',
        unit: 'riders/hour',
        category: 'mobility',
        description: 'Hourly transit rider throughput capacity',
        thresholds: { low: 1000, medium: 3000, high: 5000 },
        higherIsBetter: true
      },
      {
        id: 'greenSpace',
        name: 'New Green Space',
        unit: 'sq. meters',
        category: 'environmental',
        description: 'Additional green space created',
        thresholds: { low: 500, medium: 2000, high: 5000 },
        higherIsBetter: true
      }
    ];
    
    // Generate alternatives with random metric values
    const alternatives = [
      {
        id: 'alt1',
        name: 'Enhanced Bike Network',
        description: 'Expanding the bike lane network with protected bicycle lanes throughout downtown',
        metrics: {},
        color: '#4CAF50',
        includedFeatures: [
          'Protected bike lanes on major arterials',
          'Bicycle signals at key intersections',
          'Bike parking facilities',
          'Green wave signal timing for cyclists'
        ]
      },
      {
        id: 'alt2',
        name: 'BRT Corridor Development',
        description: 'Creating a dedicated Bus Rapid Transit corridor with station improvements',
        metrics: {},
        color: '#2196F3',
        includedFeatures: [
          'Dedicated bus lanes',
          'Enhanced transit stations with real-time information',
          'Signal priority for transit',
          'Off-board fare collection'
        ]
      },
      {
        id: 'alt3',
        name: 'Complete Streets Transformation',
        description: 'Redesigning main corridors with comprehensive complete streets principles',
        metrics: {},
        color: '#9C27B0',
        includedFeatures: [
          'Widened sidewalks',
          'Protected bike lanes',
          'Dedicated transit lanes',
          'Street trees and green infrastructure',
          'Pedestrian-scale lighting',
          'Improved crosswalks'
        ]
      },
      {
        id: 'alt4',
        name: 'Mixed-Use Transit Hubs',
        description: 'Creating transit-oriented development around key transit stations',
        metrics: {},
        color: '#FF9800',
        includedFeatures: [
          'Enhanced transit facilities',
          'Mixed-use development near stations',
          'Improved pedestrian access',
          'Bike share stations',
          'Public plazas'
        ]
      }
    ];
    
    // Fill in random metric values for each alternative
    alternatives.forEach(alt => {
      metrics.forEach(metric => {
        let baseValue;
        
        switch (alt.id) {
          case 'alt1': // Bike Network
            if (metric.id === 'implementationCost') baseValue = 800000;
            else if (metric.id === 'maintenanceCost') baseValue = 80000;
            else if (metric.id === 'travelTimeSavings') baseValue = 40000;
            else if (metric.id === 'ghgReduction') baseValue = 2200;
            else if (metric.id === 'airQualityImprovement') baseValue = 4;
            else if (metric.id === 'accessToJobs') baseValue = 6000;
            else if (metric.id === 'accidents') baseValue = 30;
            else if (metric.id === 'bikeCapacity') baseValue = 900;
            else if (metric.id === 'transitCapacity') baseValue = 1200;
            else if (metric.id === 'greenSpace') baseValue = 1000;
            break;
            
          case 'alt2': // BRT Corridor
            if (metric.id === 'implementationCost') baseValue = 1800000;
            else if (metric.id === 'maintenanceCost') baseValue = 150000;
            else if (metric.id === 'travelTimeSavings') baseValue = 85000;
            else if (metric.id === 'ghgReduction') baseValue = 4500;
            else if (metric.id === 'airQualityImprovement') baseValue = 6;
            else if (metric.id === 'accessToJobs') baseValue = 8500;
            else if (metric.id === 'accidents') baseValue = 15;
            else if (metric.id === 'bikeCapacity') baseValue = 300;
            else if (metric.id === 'transitCapacity') baseValue = 4800;
            else if (metric.id === 'greenSpace') baseValue = 800;
            break;
            
          case 'alt3': // Complete Streets
            if (metric.id === 'implementationCost') baseValue = 3200000;
            else if (metric.id === 'maintenanceCost') baseValue = 180000;
            else if (metric.id === 'travelTimeSavings') baseValue = 65000;
            else if (metric.id === 'ghgReduction') baseValue = 3800;
            else if (metric.id === 'airQualityImprovement') baseValue = 8;
            else if (metric.id === 'accessToJobs') baseValue = 9000;
            else if (metric.id === 'accidents') baseValue = 45;
            else if (metric.id === 'bikeCapacity') baseValue = 750;
            else if (metric.id === 'transitCapacity') baseValue = 3500;
            else if (metric.id === 'greenSpace') baseValue = 4500;
            break;
            
          case 'alt4': // Transit Hubs
            if (metric.id === 'implementationCost') baseValue = 2500000;
            else if (metric.id === 'maintenanceCost') baseValue = 220000;
            else if (metric.id === 'travelTimeSavings') baseValue = 70000;
            else if (metric.id === 'ghgReduction') baseValue = 3200;
            else if (metric.id === 'airQualityImprovement') baseValue = 5;
            else if (metric.id === 'accessToJobs') baseValue = 12000;
            else if (metric.id === 'accidents') baseValue = 20;
            else if (metric.id === 'bikeCapacity') baseValue = 600;
            else if (metric.id === 'transitCapacity') baseValue = 4200;
            else if (metric.id === 'greenSpace') baseValue = 6000;
            break;
            
          default:
            baseValue = Math.random() * 1000;
        }
        
        // Add some randomness
        const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
        let value = baseValue * randomFactor;
        
        // Round value appropriately
        if (value > 1000) {
          value = Math.round(value);
        } else if (value > 100) {
          value = Math.round(value * 10) / 10;
        } else {
          value = Math.round(value * 100) / 100;
        }
        
        alt.metrics[metric.id] = {
          name: metric.name,
          value: value,
          unit: metric.unit,
          category: metric.category,
          description: metric.description,
          thresholds: metric.thresholds,
          higherIsBetter: metric.higherIsBetter
        };
      });
    });
    
    // Generate mock community feedback
    const communityFeedback = [
      {
        id: 'feedback1',
        alternativeId: 'alt1',
        sentiment: 'positive',
        comment: 'I strongly support the enhanced bike network. It would make cycling safer for everyone.',
        demographicInfo: {
          age: '25-34',
          transportMode: 'bicycle',
          neighborhood: 'Downtown'
        }
      },
      {
        id: 'feedback2',
        alternativeId: 'alt1',
        sentiment: 'negative',
        comment: 'I\'m concerned that reducing car lanes will increase traffic congestion.',
        demographicInfo: {
          age: '45-54',
          transportMode: 'car',
          neighborhood: 'Westside'
        }
      },
      {
        id: 'feedback3',
        alternativeId: 'alt2',
        sentiment: 'positive',
        comment: 'The BRT corridor would significantly improve my commute time.',
        demographicInfo: {
          age: '35-44',
          transportMode: 'transit',
          neighborhood: 'Eastside'
        }
      },
      {
        id: 'feedback4',
        alternativeId: 'alt3',
        sentiment: 'positive',
        comment: 'Complete streets address the needs of all users. This is the most equitable option.',
        demographicInfo: {
          age: '55-64',
          transportMode: 'walking',
          neighborhood: 'Central'
        }
      },
      {
        id: 'feedback5',
        alternativeId: 'alt3',
        sentiment: 'neutral',
        comment: 'I like the concept but wonder if the cost is justified compared to other options.',
        demographicInfo: {
          age: '65+',
          transportMode: 'transit',
          neighborhood: 'Northside'
        }
      },
      {
        id: 'feedback6',
        alternativeId: 'alt4',
        sentiment: 'positive',
        comment: 'Transit hubs would create vibrant centers of activity and reduce car dependency.',
        demographicInfo: {
          age: '25-34',
          transportMode: 'multiple',
          neighborhood: 'Downtown'
        }
      }
    ];
    
    return { metrics, alternatives, communityFeedback };
  };
  
  // Get metric data for comparison chart
  const getMetricDataForChart = () => {
    // Group metrics by category
    const metricsByCategory = metrics.reduce((acc, metric) => {
      if (!acc[metric.category]) {
        acc[metric.category] = [];
      }
      acc[metric.category].push(metric);
      return acc;
    }, {});
    
    // Create data for radar chart
    if (chartType === 'radar') {
      // Normalize values between 0 and 100
      const normalizedData = metrics.map(metric => {
        const metricValues = alternatives.map(alt => alt.metrics[metric.id]?.value || 0);
        let min = Math.min(...metricValues);
        let max = Math.max(...metricValues);
        
        // Adjust for metrics where lower is better
        if (!metric.higherIsBetter) {
          [min, max] = [max, min];
        }
        
        // Create range for normalization
        const range = max - min === 0 ? 1 : max - min;
        
        const dataPoint = {
          metric: metric.name,
          metricId: metric.id,
          category: metric.category,
          unit: metric.unit,
          fullName: `${metric.name} (${metric.unit})`
        };
        
        alternatives.forEach(alt => {
          const rawValue = alt.metrics[metric.id]?.value || 0;
          
          if (normalizeData) {
            // Normalize value between 0 and 100
            let normalizedValue;
            if (!metric.higherIsBetter) {
              // Invert for metrics where lower is better
              normalizedValue = ((max - rawValue) / range) * 100;
            } else {
              normalizedValue = ((rawValue - min) / range) * 100;
            }
            
            dataPoint[alt.id] = Math.max(0, Math.min(100, normalizedValue));
          } else {
            dataPoint[alt.id] = rawValue;
          }
        });
        
        return dataPoint;
      });
      
      return normalizedData;
    }
    
    // Create data for category bar chart
    if (chartType === 'bar') {
      const categoryScores = {};
      
      // Calculate scores for each category and alternative
      Object.keys(metricsByCategory).forEach(category => {
        const categoryMetrics = metricsByCategory[category];
        
        alternatives.forEach(alt => {
          if (!categoryScores[alt.id]) {
            categoryScores[alt.id] = {};
          }
          
          let totalScore = 0;
          let metricCount = 0;
          
          categoryMetrics.forEach(metric => {
            if (alt.metrics[metric.id]) {
              const metricValues = alternatives.map(a => a.metrics[metric.id]?.value || 0);
              let min = Math.min(...metricValues);
              let max = Math.max(...metricValues);
              
              // Adjust for metrics where lower is better
              if (!metric.higherIsBetter) {
                [min, max] = [max, min];
              }
              
              // Create range for normalization
              const range = max - min === 0 ? 1 : max - min;
              
              const rawValue = alt.metrics[metric.id].value || 0;
              
              // Normalize value between 0 and 100
              let normalizedValue;
              if (!metric.higherIsBetter) {
                // Invert for metrics where lower is better
                normalizedValue = ((max - rawValue) / range) * 100;
              } else {
                normalizedValue = ((rawValue - min) / range) * 100;
              }
              
              totalScore += Math.max(0, Math.min(100, normalizedValue));
              metricCount++;
            }
          });
          
          // Calculate average score for category
          categoryScores[alt.id][category] = metricCount > 0 ? totalScore / metricCount : 0;
        });
      });
      
      // Convert to chart data format
      const chartData = Object.keys(metricsByCategory).map(category => {
        const dataPoint = {
          category: category.charAt(0).toUpperCase() + category.slice(1),
          categoryId: category
        };
        
        alternatives.forEach(alt => {
          dataPoint[alt.id] = categoryScores[alt.id][category];
        });
        
        return dataPoint;
      });
      
      return chartData;
    }
    
    // Create data for matrix view
    if (chartType === 'matrix') {
      return metrics.map(metric => {
        const dataPoint = {
          metric: metric.name,
          metricId: metric.id,
          category: metric.category,
          unit: metric.unit
        };
        
        alternatives.forEach(alt => {
          dataPoint[alt.id] = alt.metrics[metric.id]?.value || 0;
        });
        
        return dataPoint;
      });
    }
    
    return [];
  };
  
  // Get current selected alternative
  const selectedAlternative = alternatives.find(alt => alt.id === selectedAlternativeId);
  
  // Calculate scores for alternatives
  const calculateAlternativeScores = () => {
    return alternatives.map(alt => {
      const categoriesScore = {};
      let totalScore = 0;
      let maxPossibleScore = 0;
      
      // Group metrics by category
      const metricsByCategory = metrics.reduce((acc, metric) => {
        if (!acc[metric.category]) {
          acc[metric.category] = [];
        }
        acc[metric.category].push(metric);
        return acc;
      }, {});
      
      // Calculate score for each category
      Object.keys(metricsByCategory).forEach(category => {
        const categoryMetrics = metricsByCategory[category];
        let categoryScore = 0;
        let categoryMaxScore = 0;
        
        categoryMetrics.forEach(metric => {
          if (alt.metrics[metric.id]) {
            const metricValues = alternatives.map(a => a.metrics[metric.id]?.value || 0);
            let min = Math.min(...metricValues);
            let max = Math.max(...metricValues);
            
            // Adjust for metrics where lower is better
            if (!metric.higherIsBetter) {
              [min, max] = [max, min];
            }
            
            // Create range for normalization
            const range = max - min === 0 ? 1 : max - min;
            
            const rawValue = alt.metrics[metric.id].value || 0;
            
            // Normalize value between 0 and 100
            let normalizedValue;
            if (!metric.higherIsBetter) {
              // Invert for metrics where lower is better
              normalizedValue = ((max - rawValue) / range) * 100;
            } else {
              normalizedValue = ((rawValue - min) / range) * 100;
            }
            
            normalizedValue = Math.max(0, Math.min(100, normalizedValue));
            
            // Apply category weight
            const weightedValue = normalizedValue * (categoryWeights[category] || 1);
            const maxWeightedValue = 100 * (categoryWeights[category] || 1);
            
            categoryScore += weightedValue;
            categoryMaxScore += maxWeightedValue;
          }
        });
        
        // Store category score
        categoriesScore[category] = {
          score: categoryScore,
          maxScore: categoryMaxScore,
          percentage: categoryMaxScore > 0 ? (categoryScore / categoryMaxScore) * 100 : 0
        };
        
        totalScore += categoryScore;
        maxPossibleScore += categoryMaxScore;
      });
      
      return {
        alternativeId: alt.id,
        alternativeName: alt.name,
        color: alt.color,
        categoriesScore,
        totalScore,
        maxPossibleScore,
        overallPercentage: maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0
      };
    }).sort((a, b) => b.overallPercentage - a.overallPercentage);
  };
  
  // Get feedback for a specific alternative
  const getAlternativeFeedback = (alternativeId) => {
    return communityFeedback.filter(feedback => feedback.alternativeId === alternativeId);
  };
  
  // Count feedback by sentiment
  const countFeedbackBySentiment = (alternativeId) => {
    const feedback = getAlternativeFeedback(alternativeId);
    return feedback.reduce((counts, item) => {
      counts[item.sentiment] = (counts[item.sentiment] || 0) + 1;
      return counts;
    }, { positive: 0, neutral: 0, negative: 0 });
  };
  
  // Get cost per benefit metric
  const getCostPerBenefit = (alternativeId) => {
    const alternative = alternatives.find(alt => alt.id === alternativeId);
    if (!alternative) return {};
    
    const implementationCost = alternative.metrics['implementationCost']?.value || 0;
    
    // Calculate benefits
    const benefits = {};
    metrics.forEach(metric => {
      if (metric.id !== 'implementationCost' && metric.id !== 'maintenanceCost' && metric.higherIsBetter) {
        const value = alternative.metrics[metric.id]?.value || 0;
        if (value > 0) {
          benefits[metric.id] = {
            name: metric.name,
            value: value,
            unit: metric.unit,
            costPerUnit: implementationCost / value
          };
        }
      }
    });
    
    return benefits;
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format number with appropriate units
  const formatValueWithUnit = (value, unit) => {
    if (unit === '$' || unit === '$/year') {
      return formatCurrency(value);
    }
    
    if (typeof value === 'number') {
      if (value > 1000000) {
        return `${(value / 1000000).toFixed(1)}M ${unit}`;
      } else if (value > 1000) {
        return `${(value / 1000).toFixed(1)}k ${unit}`;
      } else if (value % 1 === 0) {
        return `${value} ${unit}`;
      } else {
        return `${value.toFixed(1)} ${unit}`;
      }
    }
    
    return `${value} ${unit}`;
  };
  
  // Get icon for metric category
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'economic':
        return <AttachMoney />;
      case 'environmental':
        return <LocalFlorist />;
      case 'social':
        return <People />;
      case 'mobility':
        return <DirectionsBike />;
      default:
        return null;
    }
  };
  
  // Get icon for metric
  const getMetricIcon = (metricId) => {
    switch (metricId) {
      case 'implementationCost':
      case 'maintenanceCost':
        return <AttachMoney />;
      case 'travelTimeSavings':
        return <AccessTime />;
      case 'ghgReduction':
      case 'airQualityImprovement':
      case 'greenSpace':
        return <LocalFlorist />;
      case 'accessToJobs':
      case 'accidents':
        return <People />;
      case 'bikeCapacity':
        return <DirectionsBike />;
      case 'transitCapacity':
        return <DirectionsBus />;
      default:
        return null;
    }
  };
  
  // Handle alternative selection
  const handleAlternativeSelect = (alternativeId) => {
    setSelectedAlternativeId(alternativeId);
    setViewMode('detail');
  };
  
  // Handle category weight change
  const handleCategoryWeightChange = (category, value) => {
    setCategoryWeights({
      ...categoryWeights,
      [category]: value
    });
  };
  
  // Handle add new metric
  const handleAddMetric = () => {
    if (!newMetricName || !newMetricUnit) return;
    
    const newMetricId = newMetricName.toLowerCase().replace(/\s+/g, '');
    
    const newMetric = {
      id: newMetricId,
      name: newMetricName,
      unit: newMetricUnit,
      category: newMetricCategory,
      description: '',
      higherIsBetter: true
    };
    
    setMetrics([...metrics, newMetric]);
    
    // Add empty metric to all alternatives
    const updatedAlternatives = alternatives.map(alt => {
      return {
        ...alt,
        metrics: {
          ...alt.metrics,
          [newMetricId]: {
            name: newMetricName,
            value: 0,
            unit: newMetricUnit,
            category: newMetricCategory,
            higherIsBetter: true
          }
        }
      };
    });
    
    setAlternatives(updatedAlternatives);
    
    // Reset form
    setNewMetricName('');
    setNewMetricUnit('');
    setNewMetricCategory('economic');
  };
  
  // Handle metric value change
  const handleMetricValueChange = (alternativeId, metricId, value) => {
    const updatedAlternatives = alternatives.map(alt => {
      if (alt.id === alternativeId) {
        return {
          ...alt,
          metrics: {
            ...alt.metrics,
            [metricId]: {
              ...alt.metrics[metricId],
              value: parseFloat(value) || 0
            }
          }
        };
      }
      return alt;
    });
    
    setAlternatives(updatedAlternatives);
  };
  
  // Start editing alternative
  const handleStartEditing = (alternative) => {
    setEditingAlternative({
      ...alternative,
      metrics: { ...alternative.metrics }
    });
    setIsEditing(true);
  };
  
  // Save edited alternative
  const handleSaveEditing = () => {
    const updatedAlternatives = alternatives.map(alt => {
      if (alt.id === editingAlternative.id) {
        return editingAlternative;
      }
      return alt;
    });
    
    setAlternatives(updatedAlternatives);
    setIsEditing(false);
    setEditingAlternative(null);
  };
  
  // Cancel editing
  const handleCancelEditing = () => {
    setIsEditing(false);
    setEditingAlternative(null);
  };
  
  // Export data to CSV
  const exportToCSV = () => {
    // Create CSV header
    let csvContent = 'Alternative,';
    metrics.forEach(metric => {
      csvContent += `${metric.name} (${metric.unit}),`;
    });
    csvContent += 'Overall Score (%)\n';
    
    // Add data rows
    const scores = calculateAlternativeScores();
    alternatives.forEach(alt => {
      csvContent += `${alt.name},`;
      
      metrics.forEach(metric => {
        const value = alt.metrics[metric.id]?.value || 0;
        csvContent += `${value},`;
      });
      
      const score = scores.find(s => s.alternativeId === alt.id);
      csvContent += `${score.overallPercentage.toFixed(1)}\n`;
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cost-benefit-analysis-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };
  
  // Create visualization SVG for download
  const generateSVGDownload = () => {
    if (!svgRef.current) return;
    
    // Get SVG content
    const svgContent = svgRef.current.outerHTML;
    
    // Create and download file
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cost-benefit-visualization-${new Date().toISOString().slice(0, 10)}.svg`;
    link.click();
  };
  
  // Render different types of charts
  const renderChart = () => {
    const data = getMetricDataForChart();
    
    if (chartType === 'radar') {
      return (
        <div ref={svgRef} className="radar-chart-container">
          <ResponsiveContainer width="100%" height={500}>
            <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis domain={[0, normalizeData ? 100 : 'auto']} />
              
              {alternatives.map(alt => (
                <Radar
                  key={alt.id}
                  name={alt.name}
                  dataKey={alt.id}
                  stroke={alt.color}
                  fill={alt.color}
                  fillOpacity={0.3}
                />
              ))}
              
              <Legend />
              <Tooltip 
                formatter={(value, name, props) => {
                  const metricId = props.payload.metricId;
                  const alt = alternatives.find(a => a.name === name);
                  if (!alt) return [value, name];
                  
                  const rawValue = alt.metrics[metricId]?.value || 0;
                  const unit = props.payload.unit;
                  
                  if (normalizeData) {
                    return [`${value.toFixed(1)} (${formatValueWithUnit(rawValue, unit)})`, name];
                  } else {
                    return [formatValueWithUnit(value, unit), name];
                  }
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      );
    }
    
    if (chartType === 'bar') {
      return (
        <div ref={svgRef} className="bar-chart-container">
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis domain={[0, 100]} />
              
              {alternatives.map(alt => (
                <Bar
                  key={alt.id}
                  dataKey={alt.id}
                  name={alt.name}
                  fill={alt.color}
                />
              ))}
              
              <Legend />
              <Tooltip 
                formatter={(value, name) => [`${value.toFixed(1)}%`, name]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }
    
    if (chartType === 'matrix') {
      // Create a matrix visualization
      return (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Unit</TableCell>
                {alternatives.map(alt => (
                  <TableCell key={alt.id} align="right">
                    {alt.name}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map(row => (
                <TableRow key={row.metricId}>
                  <TableCell component="th" scope="row">
                    <div className="metric-name-cell">
                      {getMetricIcon(row.metricId)}
                      <span>{row.metric}</span>
                    </div>
                  </TableCell>
                  <TableCell>{row.category.charAt(0).toUpperCase() + row.category.slice(1)}</TableCell>
                  <TableCell>{row.unit}</TableCell>
                  
                  {alternatives.map(alt => {
                    const metric = metrics.find(m => m.id === row.metricId);
                    const value = alt.metrics[row.metricId]?.value || 0;
                    const thresholds = metric?.thresholds;
                    let bgColor = 'transparent';
                    
                    if (thresholds && showThresholds) {
                      if (metric.higherIsBetter) {
                        if (value >= thresholds.high) bgColor = 'rgba(76, 175, 80, 0.2)';
                        else if (value >= thresholds.medium) bgColor = 'rgba(255, 193, 7, 0.2)';
                        else if (value >= thresholds.low) bgColor = 'rgba(255, 152, 0, 0.2)';
                        else bgColor = 'rgba(244, 67, 54, 0.2)';
                      } else {
                        if (value <= thresholds.low) bgColor = 'rgba(76, 175, 80, 0.2)';
                        else if (value <= thresholds.medium) bgColor = 'rgba(255, 193, 7, 0.2)';
                        else if (value <= thresholds.high) bgColor = 'rgba(255, 152, 0, 0.2)';
                        else bgColor = 'rgba(244, 67, 54, 0.2)';
                      }
                    }
                    
                    return (
                      <TableCell 
                        key={alt.id} 
                        align="right"
                        style={{ backgroundColor: bgColor }}
                      >
                        {formatValueWithUnit(value, row.unit)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }
    
    return null;
  };
  
  // Render metrics detail for an alternative
  const renderMetricsDetail = (alternativeId) => {
    const alternative = alternatives.find(alt => alt.id === alternativeId);
    if (!alternative) return null;
    
    // Group metrics by category
    const metricsByCategory = metrics.reduce((acc, metric) => {
      if (!acc[metric.category]) {
        acc[metric.category] = [];
      }
      acc[metric.category].push(metric);
      return acc;
    }, {});
    
    return (
      <div className="metrics-detail">
        {Object.keys(metricsByCategory).map(category => (
          <Card key={category} className="category-card">
            <CardContent>
              <Typography variant="h6" className="category-header">
                {getCategoryIcon(category)}
                {category.charAt(0).toUpperCase() + category.slice(1)} Metrics
              </Typography>
              
              {metricsByCategory[category].map(metric => {
                const metricData = alternative.metrics[metric.id];
                if (!metricData) return null;
                
                const value = metricData.value;
                const thresholds = metric.thresholds;
                let color = 'inherit';
                
                if (thresholds) {
                  if (metric.higherIsBetter) {
                    if (value >= thresholds.high) color = '#4CAF50';
                    else if (value >= thresholds.medium) color = '#FFC107';
                    else if (value >= thresholds.low) color = '#FF9800';
                    else color = '#F44336';
                  } else {
                    if (value <= thresholds.low) color = '#4CAF50';
                    else if (value <= thresholds.medium) color = '#FFC107';
                    else if (value <= thresholds.high) color = '#FF9800';
                    else color = '#F44336';
                  }
                }
                
                return (
                  <div key={metric.id} className="metric-item">
                    <div className="metric-name">
                      {getMetricIcon(metric.id)}
                      <span>{metric.name}</span>
                      
                      <MuiTooltip title={metric.description}>
                        <IconButton size="small">
                          <Info fontSize="small" />
                        </IconButton>
                      </MuiTooltip>
                    </div>
                    
                    <div className="metric-value" style={{ color }}>
                      {isEditing && editingAlternative?.id === alternative.id ? (
                        <TextField
                          type="number"
                          size="small"
                          value={editingAlternative.metrics[metric.id]?.value || 0}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            setEditingAlternative({
                              ...editingAlternative,
                              metrics: {
                                ...editingAlternative.metrics,
                                [metric.id]: {
                                  ...editingAlternative.metrics[metric.id],
                                  value
                                }
                              }
                            });
                          }}
                          InputProps={{
                            endAdornment: <span>{metric.unit}</span>
                          }}
                        />
                      ) : (
                        <span>{formatValueWithUnit(value, metric.unit)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  // Render feedback summary
  const renderFeedbackSummary = (alternativeId) => {
    const sentiments = countFeedbackBySentiment(alternativeId);
    const feedbackItems = getAlternativeFeedback(alternativeId);
    
    const data = [
      { name: 'Positive', value: sentiments.positive, color: '#4CAF50' },
      { name: 'Neutral', value: sentiments.neutral, color: '#FFC107' },
      { name: 'Negative', value: sentiments.negative, color: '#F44336' }
    ];
    
    return (
      <div className="feedback-summary">
        <Card>
          <CardContent>
            <Typography variant="h6">Community Feedback</Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <div className="sentiment-chart">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [value, name]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <div className="feedback-list">
                  {feedbackItems.length > 0 ? (
                    feedbackItems.map(feedback => (
                      <div key={feedback.id} className={`feedback-item ${feedback.sentiment}`}>
                        <div className="feedback-header">
                          <Chip
                            label={feedback.sentiment}
                            size="small"
                            color={
                              feedback.sentiment === 'positive' ? 'success' : 
                              feedback.sentiment === 'negative' ? 'error' :
                              'default'
                            }
                          />
                          
                          <div className="demographic-info">
                            {feedback.demographicInfo.age && (
                              <Chip 
                                label={feedback.demographicInfo.age}
                                size="small"
                                variant="outlined"
                              />
                            )}
                            
                            {feedback.demographicInfo.transportMode && (
                              <Chip 
                                label={feedback.demographicInfo.transportMode}
                                size="small"
                                variant="outlined"
                              />
                            )}
                            
                            {feedback.demographicInfo.neighborhood && (
                              <Chip 
                                label={feedback.demographicInfo.neighborhood}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </div>
                        </div>
                        
                        <div className="feedback-comment">
                          {feedback.comment}
                        </div>
                      </div>
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No feedback available for this alternative.
                    </Typography>
                  )}
                </div>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  // Render cost per benefit analysis
  const renderCostPerBenefit = (alternativeId) => {
    const benefits = getCostPerBenefit(alternativeId);
    
    return (
      <div className="cost-benefit-analysis">
        <Card>
          <CardContent>
            <Typography variant="h6">Cost Per Benefit Analysis</Typography>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Benefit</TableCell>
                    <TableCell align="right">Value</TableCell>
                    <TableCell align="right">Cost Per Unit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.values(benefits).length > 0 ? (
                    Object.values(benefits).map(benefit => (
                      <TableRow key={benefit.name}>
                        <TableCell component="th" scope="row">
                          {benefit.name}
                        </TableCell>
                        <TableCell align="right">
                          {formatValueWithUnit(benefit.value, benefit.unit)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(benefit.costPerUnit)} / {benefit.unit}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No benefit data available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  // Render overall scores
  const renderOverallScores = () => {
    const scores = calculateAlternativeScores();
    
    return (
      <div className="overall-scores">
        <Typography variant="h6">Alternative Rankings</Typography>
        
        {scores.map((score, index) => {
          const alt = alternatives.find(a => a.id === score.alternativeId);
          if (!alt) return null;
          
          return (
            <Card 
              key={score.alternativeId} 
              className={`score-card ${selectedAlternativeId === score.alternativeId ? 'selected' : ''}`}
              onClick={() => handleAlternativeSelect(score.alternativeId)}
            >
              <CardContent>
                <div className="score-header">
                  <div className="score-rank">#{index + 1}</div>
                  <Typography variant="h6">{alt.name}</Typography>
                  <div 
                    className="score-percentage"
                    style={{ color: alt.color }}
                  >
                    {score.overallPercentage.toFixed(1)}%
                  </div>
                </div>
                
                <div className="category-scores">
                  {Object.keys(score.categoriesScore).map(category => (
                    <div key={category} className="category-score">
                      <div className="category-label">
                        {getCategoryIcon(category)}
                        <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                      </div>
                      <div className="score-bar-container">
                        <div 
                          className="score-bar" 
                          style={{
                            width: `${score.categoriesScore[category].percentage}%`,
                            backgroundColor: alt.color
                          }}
                        ></div>
                      </div>
                      <div className="category-percentage">
                        {score.categoriesScore[category].percentage.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="cost-benefit-loading">
        <Typography>Loading cost-benefit analysis...</Typography>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="cost-benefit-error">
        <Typography color="error">{error}</Typography>
      </div>
    );
  }
  
  return (
    <Container className="cost-benefit-visualization">
      <Typography variant="h4" gutterBottom>Cost-Benefit Analysis</Typography>
      
      <Tabs 
        value={viewMode}
        onChange={(_, newValue) => setViewMode(newValue)}
        aria-label="visualization-tabs"
        sx={{ mb: 3 }}
      >
        <Tab value="comparison" label="Comparison" />
        <Tab value="detail" label="Alternative Detail" disabled={!selectedAlternative} />
        <Tab value="manage" label="Manage Data" />
      </Tabs>
      
      {viewMode === 'comparison' && (
        <div className="comparison-view">
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper className="chart-container">
                <div className="chart-header">
                  <Typography variant="h6">Alternative Comparison</Typography>
                  
                  <div className="chart-controls">
                    <div className="chart-type-selector">
                      <IconButton 
                        color={chartType === 'radar' ? 'primary' : 'default'}
                        onClick={() => setChartType('radar')}
                      >
                        <RadarChartIcon />
                      </IconButton>
                      
                      <IconButton 
                        color={chartType === 'bar' ? 'primary' : 'default'}
                        onClick={() => setChartType('bar')}
                      >
                        <BarChartIcon />
                      </IconButton>
                      
                      <IconButton 
                        color={chartType === 'matrix' ? 'primary' : 'default'}
                        onClick={() => setChartType('matrix')}
                      >
                        <PieChartIcon />
                      </IconButton>
                    </div>
                    
                    <div className="chart-options">
                      {chartType !== 'matrix' && (
                        <FormControlLabel
                          control={
                            <Switch 
                              checked={normalizeData}
                              onChange={(e) => setNormalizeData(e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Normalize Data"
                        />
                      )}
                      
                      {chartType === 'matrix' && (
                        <FormControlLabel
                          control={
                            <Switch 
                              checked={showThresholds}
                              onChange={(e) => setShowThresholds(e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Show Thresholds"
                        />
                      )}
                    </div>
                    
                    <Button
                      startIcon={<Download />}
                      onClick={chartType === 'matrix' ? exportToCSV : generateSVGDownload}
                      variant="outlined"
                      size="small"
                    >
                      Export
                    </Button>
                  </div>
                </div>
                
                {renderChart()}
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper className="weights-container">
                <Typography variant="h6">Category Weights</Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Adjust the importance of each category in the overall score calculation
                </Typography>
                
                {Object.keys(categoryWeights).map(category => (
                  <div key={category} className="weight-slider">
                    <div className="weight-label">
                      {getCategoryIcon(category)}
                      <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                    </div>
                    <Slider
                      value={categoryWeights[category]}
                      min={0}
                      max={2}
                      step={0.1}
                      marks={[
                        { value: 0, label: '0' },
                        { value: 1, label: '1' },
                        { value: 2, label: '2' }
                      ]}
                      onChange={(_, value) => handleCategoryWeightChange(category, value)}
                    />
                  </div>
                ))}
              </Paper>
              
              {renderOverallScores()}
            </Grid>
          </Grid>
        </div>
      )}
      
      {viewMode === 'detail' && selectedAlternative && (
        <div className="detail-view">
          <Paper className="alternative-header">
            <div className="alternative-title">
              <Typography variant="h5">{selectedAlternative.name}</Typography>
              
              {!isEditing && (
                <IconButton 
                  color="primary"
                  onClick={() => handleStartEditing(selectedAlternative)}
                >
                  <Edit />
                </IconButton>
              )}
              
              {isEditing && (
                <div className="edit-actions">
                  <IconButton 
                    color="primary"
                    onClick={handleSaveEditing}
                  >
                    <Save />
                  </IconButton>
                  
                  <IconButton 
                    color="default"
                    onClick={handleCancelEditing}
                  >
                    <Cancel />
                  </IconButton>
                </div>
              )}
            </div>
            
            <Typography variant="body1">{selectedAlternative.description}</Typography>
            
            {selectedAlternative.includedFeatures && (
              <div className="features-list">
                <Typography variant="subtitle2">Key Features:</Typography>
                <ul>
                  {selectedAlternative.includedFeatures.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </Paper>
          
          <Grid container spacing={3} sx={{ mt: 3 }}>
            <Grid item xs={12} md={6}>
              {renderMetricsDetail(selectedAlternative.id)}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  {renderCostPerBenefit(selectedAlternative.id)}
                </Grid>
                
                <Grid item xs={12}>
                  {renderFeedbackSummary(selectedAlternative.id)}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
      )}
      
      {viewMode === 'manage' && (
        <div className="manage-view">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper className="manage-section">
                <Typography variant="h6">Manage Metrics</Typography>
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Unit</TableCell>
                        <TableCell>Higher is Better</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {metrics.map(metric => (
                        <TableRow key={metric.id}>
                          <TableCell>{metric.name}</TableCell>
                          <TableCell>{metric.category}</TableCell>
                          <TableCell>{metric.unit}</TableCell>
                          <TableCell>
                            {metric.higherIsBetter ? 'Yes' : 'No'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <div className="add-metric-form">
                  <Typography variant="subtitle2" sx={{ mt: 2 }}>Add New Metric</Typography>
                  
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Metric Name"
                        value={newMetricName}
                        onChange={(e) => setNewMetricName(e.target.value)}
                        fullWidth
                        margin="dense"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={3}>
                      <TextField
                        label="Unit"
                        value={newMetricUnit}
                        onChange={(e) => setNewMetricUnit(e.target.value)}
                        fullWidth
                        margin="dense"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth margin="dense">
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={newMetricCategory}
                          onChange={(e) => setNewMetricCategory(e.target.value)}
                        >
                          <MenuItem value="economic">Economic</MenuItem>
                          <MenuItem value="environmental">Environmental</MenuItem>
                          <MenuItem value="social">Social</MenuItem>
                          <MenuItem value="mobility">Mobility</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={2}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddCircle />}
                        onClick={handleAddMetric}
                        fullWidth
                      >
                        Add
                      </Button>
                    </Grid>
                  </Grid>
                </div>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper className="manage-section">
                <Typography variant="h6">Edit Alternative Values</Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select Alternative</InputLabel>
                  <Select
                    value={selectedAlternativeId || ''}
                    onChange={(e) => setSelectedAlternativeId(e.target.value)}
                  >
                    {alternatives.map(alt => (
                      <MenuItem key={alt.id} value={alt.id}>{alt.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {selectedAlternative && (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Metric</TableCell>
                          <TableCell>Current Value</TableCell>
                          <TableCell>Edit</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {metrics.map(metric => (
                          <TableRow key={metric.id}>
                            <TableCell>{metric.name}</TableCell>
                            <TableCell>
                              {formatValueWithUnit(
                                selectedAlternative.metrics[metric.id]?.value || 0,
                                metric.unit
                              )}
                            </TableCell>
                            <TableCell>
                              <TextField
                                type="number"
                                size="small"
                                value={selectedAlternative.metrics[metric.id]?.value || 0}
                                onChange={(e) => handleMetricValueChange(
                                  selectedAlternative.id,
                                  metric.id,
                                  e.target.value
                                )}
                                inputProps={{ step: 0.1 }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
              
              <Paper className="manage-section" sx={{ mt: 3 }}>
                <Typography variant="h6">Export Data</Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Export your cost-benefit analysis data for use in other tools
                </Typography>
                
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={exportToCSV}
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  Export to CSV
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </div>
      )}
      
      <style jsx>{`
        .cost-benefit-visualization {
          padding: 20px 0;
        }
        
        .chart-container {
          padding: 20px;
          height: 100%;
        }
        
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        
        .chart-controls {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .chart-type-selector {
          display: flex;
          gap: 5px;
        }
        
        .chart-options {
          display: flex;
          align-items: center;
        }
        
        .weights-container {
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .weight-slider {
          margin-bottom: 15px;
        }
        
        .weight-label {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 5px;
        }
        
        .overall-scores {
          margin-top: 20px;
        }
        
        .score-card {
          margin-bottom: 10px;
          cursor: pointer;
          transition: box-shadow 0.3s;
        }
        
        .score-card:hover {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .score-card.selected {
          border: 2px solid #2196f3;
        }
        
        .score-header {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .score-rank {
          width: 35px;
          height: 35px;
          background-color: #f0f0f0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-right: 10px;
        }
        
        .score-percentage {
          margin-left: auto;
          font-weight: bold;
          font-size: 1.25rem;
        }
        
        .category-scores {
          margin-top: 10px;
        }
        
        .category-score {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .category-label {
          width: 120px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
        }
        
        .score-bar-container {
          flex: 1;
          height: 8px;
          background-color: #f0f0f0;
          border-radius: 4px;
          overflow: hidden;
          margin: 0 10px;
        }
        
        .score-bar {
          height: 100%;
          border-radius: 4px;
        }
        
        .category-percentage {
          width: 50px;
          text-align: right;
          font-size: 0.9rem;
        }
        
        .alternative-header {
          padding: 20px;
        }
        
        .alternative-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        
        .edit-actions {
          display: flex;
          gap: 5px;
        }
        
        .features-list {
          margin-top: 15px;
        }
        
        .features-list ul {
          margin-top: 5px;
          padding-left: 20px;
        }
        
        .metrics-detail {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .category-card {
          height: 100%;
        }
        
        .category-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }
        
        .metric-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .metric-name {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .metric-name-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .metric-value {
          font-weight: 500;
        }
        
        .feedback-list {
          max-height: 300px;
          overflow-y: auto;
          margin-top: 10px;
        }
        
        .feedback-item {
          margin-bottom: 10px;
          padding: 10px;
          border-radius: 4px;
        }
        
        .feedback-item.positive {
          background-color: rgba(76, 175, 80, 0.1);
        }
        
        .feedback-item.neutral {
          background-color: rgba(255, 193, 7, 0.1);
        }
        
        .feedback-item.negative {
          background-color: rgba(244, 67, 54, 0.1);
        }
        
        .feedback-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        
        .demographic-info {
          display: flex;
          gap: 5px;
        }
        
        .feedback-comment {
          font-size: 0.9rem;
        }
        
        .manage-section {
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .add-metric-form {
          margin-top: 20px;
        }
        
        @media (max-width: 768px) {
          .chart-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .chart-controls {
            width: 100%;
            justify-content: space-between;
          }
          
          .category-label {
            width: 100px;
          }
        }
      `}</style>
    </Container>
  );
};

export default CostBenefitVisualization;
