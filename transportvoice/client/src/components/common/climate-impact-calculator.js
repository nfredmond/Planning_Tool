import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, Typography, Paper, Box, Grid, TextField, 
  MenuItem, Select, FormControl, InputLabel, Slider, 
  Button, Card, CardContent, Divider, Alert, 
  IconButton, Tooltip, Switch, FormControlLabel, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { 
  Co2, DirectionsCar, DirectionsBike, DirectionsWalk, 
  DirectionsBus, LocalFlorist, WbSunny, Air, 
  ShowChart, Download, CloudDownload, PieChart, Info,
  Eco, PublishedWithChanges, CompareArrows, BarChart
} from '@mui/icons-material';
import { 
  Chart as ChartJS,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  LineController,
  CategoryScale,
  LinearScale,
  PieController,
  Legend,
  Tooltip as ChartTooltip,
  Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  LineController,
  CategoryScale,
  LinearScale,
  PieController,
  Legend,
  ChartTooltip,
  Title
);

const ClimateImpactCalculator = ({ projectData = null }) => {
  // Reference for the report to be exported
  const reportRef = useRef(null);
  
  // Basic project data
  const [projectType, setProjectType] = useState('bike-lane');
  const [projectLength, setProjectLength] = useState(5); // km
  const [projectWidth, setProjectWidth] = useState(3); // meters
  const [projectArea, setProjectArea] = useState(0); // square meters - calculated
  const [projectLocation, setProjectLocation] = useState('urban');
  const [projectRegion, setProjectRegion] = useState('northeast');
  
  // Modal split (before & after)
  const [modalSplitBefore, setModalSplitBefore] = useState({
    car: 70,
    transit: 15,
    bike: 5,
    walk: 10
  });
  
  const [modalSplitAfter, setModalSplitAfter] = useState({
    car: 60,
    transit: 15,
    bike: 15,
    walk: 10
  });
  
  // Traffic data
  const [dailyTraffic, setDailyTraffic] = useState(10000); // vehicles per day
  const [avgTripLength, setAvgTripLength] = useState(5); // km
  const [peakHourPercentage, setPeakHourPercentage] = useState(15); // % of daily traffic during peak hour
  const [congestionReduction, setCongestionReduction] = useState(10); // % reduction in congestion
  
  // Green infrastructure
  const [treeCount, setTreeCount] = useState(50); // number of new trees
  const [greenspaceArea, setGreenspaceArea] = useState(500); // square meters
  const [permPavementArea, setPermPavementArea] = useState(200); // square meters of permeable pavement
  
  // Impact results
  const [ghgReduction, setGhgReduction] = useState({
    daily: 0,
    annual: 0,
    lifetime: 0,
    carEquivalent: 0,
    treeEquivalent: 0
  });
  
  const [airQualityImprovement, setAirQualityImprovement] = useState({
    pm25: 0, // kg of PM2.5 reduced
    nox: 0,  // kg of NOx reduced
    voc: 0   // kg of VOC reduced
  });
  
  const [healthBenefits, setHealthBenefits] = useState({
    activeTravelHours: 0,
    caloriesBurned: 0,
    healthcareSavings: 0
  });
  
  const [carbonSequestration, setCarbonSequestration] = useState({
    annual: 0,
    lifetime: 0
  });
  
  // Settings
  const [projectLifetime, setProjectLifetime] = useState(20); // years
  const [emissionFactor, setEmissionFactor] = useState(0.25); // kg CO2e per km
  const [includeConstruction, setIncludeConstruction] = useState(true);
  const [includeMaintenance, setIncludeMaintenance] = useState(true);
  const [includeIndirect, setIncludeIndirect] = useState(true);
  const [advancedMode, setAdvancedMode] = useState(false);
  
  // Reference data (would come from database in real app)
  const projectTypes = [
    { value: 'bike-lane', label: 'Bike Lane' },
    { value: 'protected-bike-lane', label: 'Protected Bike Lane' },
    { value: 'cycle-track', label: 'Cycle Track' },
    { value: 'sidewalk', label: 'Sidewalk Expansion' },
    { value: 'pedestrian-plaza', label: 'Pedestrian Plaza' },
    { value: 'bus-lane', label: 'Bus Lane' },
    { value: 'brt-corridor', label: 'BRT Corridor' },
    { value: 'complete-street', label: 'Complete Street' },
    { value: 'transit-hub', label: 'Transit Hub' },
    { value: 'road-diet', label: 'Road Diet' }
  ];
  
  const locationTypes = [
    { value: 'urban', label: 'Urban Core' },
    { value: 'suburban', label: 'Suburban' },
    { value: 'rural', label: 'Rural' },
    { value: 'mixed', label: 'Mixed Context' }
  ];
  
  const regionTypes = [
    { value: 'northeast', label: 'Northeast' },
    { value: 'midwest', label: 'Midwest' },
    { value: 'south', label: 'South' },
    { value: 'west', label: 'West' },
    { value: 'pacific', label: 'Pacific' },
    { value: 'international', label: 'International' }
  ];
  
  // Construction emission factors by project type (kg CO2e per square meter)
  const constructionEmissionFactors = {
    'bike-lane': 35,
    'protected-bike-lane': 45,
    'cycle-track': 70,
    'sidewalk': 60,
    'pedestrian-plaza': 85,
    'bus-lane': 90,
    'brt-corridor': 120,
    'complete-street': 150,
    'transit-hub': 200,
    'road-diet': 40
  };
  
  // Annual maintenance emission factors by project type (kg CO2e per square meter per year)
  const maintenanceEmissionFactors = {
    'bike-lane': 2,
    'protected-bike-lane': 3,
    'cycle-track': 5,
    'sidewalk': 3,
    'pedestrian-plaza': 4,
    'bus-lane': 6,
    'brt-corridor': 8,
    'complete-street': 10,
    'transit-hub': 15,
    'road-diet': 3
  };
  
  // Mode-specific emission factors (kg CO2e per passenger-km)
  const modeEmissionFactors = {
    car: 0.251,       // Average passenger car
    carpool: 0.100,   // Assuming 2.5 people per vehicle
    transit: 0.046,   // Bus transit average
    brt: 0.022,       // BRT system
    rail: 0.028,      // Light rail
    bike: 0,          // Zero emissions
    walk: 0,          // Zero emissions
    scooter: 0.026    // E-scooter including charging
  };
  
  // Health factors - calories burned per hour by mode
  const calorieFactors = {
    bike: 400,        // Cycling at moderate pace
    walk: 300         // Walking at moderate pace
  };

  // Tree sequestration factors (kg CO2 per tree per year by region)
  const treeSequestrationFactors = {
    'northeast': 21.8,
    'midwest': 20.5,
    'south': 22.6,
    'west': 19.7,
    'pacific': 23.2,
    'international': 21.0
  };
  
  // Air pollutant emission factors (grams per vehicle-km)
  const airPollutantFactors = {
    car: {
      pm25: 0.03,
      nox: 0.40,
      voc: 0.15
    },
    bus: {
      pm25: 0.20,
      nox: 2.30,
      voc: 0.50
    }
  };
  
  // Modal shift factors by project type - how much each project type affects modal split
  const modalShiftFactors = {
    'bike-lane': {
      car: -5,
      transit: 0,
      bike: 5,
      walk: 0
    },
    'protected-bike-lane': {
      car: -10,
      transit: 0,
      bike: 10,
      walk: 0
    },
    'cycle-track': {
      car: -12,
      transit: -1,
      bike: 12,
      walk: 1
    },
    'sidewalk': {
      car: -3,
      transit: 0,
      bike: 0,
      walk: 3
    },
    'pedestrian-plaza': {
      car: -7,
      transit: 1,
      bike: 1,
      walk: 5
    },
    'bus-lane': {
      car: -8,
      transit: 8,
      bike: 0,
      walk: 0
    },
    'brt-corridor': {
      car: -15,
      transit: 12,
      bike: 1,
      walk: 2
    },
    'complete-street': {
      car: -15,
      transit: 5,
      bike: 5,
      walk: 5
    },
    'transit-hub': {
      car: -18,
      transit: 15,
      bike: 1,
      walk: 2
    },
    'road-diet': {
      car: -10,
      transit: 3,
      bike: 4,
      walk: 3
    }
  };
  
  // Initialize with project data if provided
  useEffect(() => {
    if (projectData) {
      // Set project info
      if (projectData.type) setProjectType(projectData.type);
      if (projectData.length) setProjectLength(projectData.length);
      if (projectData.width) setProjectWidth(projectData.width);
      if (projectData.location) setProjectLocation(projectData.location);
      if (projectData.region) setProjectRegion(projectData.region);
      
      // Set traffic data
      if (projectData.dailyTraffic) setDailyTraffic(projectData.dailyTraffic);
      if (projectData.avgTripLength) setAvgTripLength(projectData.avgTripLength);
      
      // Set modal splits if provided
      if (projectData.modalSplitBefore) setModalSplitBefore(projectData.modalSplitBefore);
      if (projectData.modalSplitAfter) setModalSplitAfter(projectData.modalSplitAfter);
      
      // Set green infrastructure
      if (projectData.treeCount) setTreeCount(projectData.treeCount);
      if (projectData.greenspaceArea) setGreenspaceArea(projectData.greenspaceArea);
      if (projectData.permPavementArea) setPermPavementArea(projectData.permPavementArea);
    } else {
      // Apply default modal shifts based on project type
      applyDefaultModalShifts(projectType);
    }
  }, [projectData]);
  
  // Calculate project area when dimensions change
  useEffect(() => {
    const area = projectLength * 1000 * projectWidth; // Convert km to m for length
    setProjectArea(area);
  }, [projectLength, projectWidth]);
  
  // Apply default modal shifts when project type changes
  useEffect(() => {
    if (!projectData) {
      applyDefaultModalShifts(projectType);
    }
  }, [projectType]);
  
  // Apply default modal shifts based on project type
  const applyDefaultModalShifts = (type) => {
    if (!modalShiftFactors[type]) return;
    
    const shifts = modalShiftFactors[type];
    setModalSplitAfter({
      car: Math.max(0, modalSplitBefore.car + shifts.car),
      transit: Math.max(0, modalSplitBefore.transit + shifts.transit),
      bike: Math.max(0, modalSplitBefore.bike + shifts.bike),
      walk: Math.max(0, modalSplitBefore.walk + shifts.walk)
    });
  };
  
  // Calculate impacts whenever inputs change
  useEffect(() => {
    calculateImpacts();
  }, [
    projectType, projectLength, projectWidth, projectArea, projectLocation, projectRegion,
    modalSplitBefore, modalSplitAfter, dailyTraffic, avgTripLength, peakHourPercentage,
    congestionReduction, treeCount, greenspaceArea, permPavementArea,
    projectLifetime, emissionFactor, includeConstruction, includeMaintenance, includeIndirect
  ]);
  
  // Calculate all climate impacts
  const calculateImpacts = () => {
    // Calculate GHG reductions from modal shift
    calculateGhgReduction();
    
    // Calculate air quality improvements
    calculateAirQualityImprovements();
    
    // Calculate health benefits from active transportation
    calculateHealthBenefits();
    
    // Calculate carbon sequestration from trees and green infrastructure
    calculateCarbonSequestration();
  };
  
  // Calculate GHG reduction from modal shift
  const calculateGhgReduction = () => {
    // Calculate person-trips per day
    const personTripsPerDay = dailyTraffic * 1.5; // Assuming average vehicle occupancy of 1.5
    
    // Calculate person-km before and after by mode
    const personKmBeforeCar = personTripsPerDay * (modalSplitBefore.car / 100) * avgTripLength;
    const personKmBeforeTransit = personTripsPerDay * (modalSplitBefore.transit / 100) * avgTripLength;
    const personKmBeforeBike = personTripsPerDay * (modalSplitBefore.bike / 100) * avgTripLength;
    const personKmBeforeWalk = personTripsPerDay * (modalSplitBefore.walk / 100) * avgTripLength;
    
    const personKmAfterCar = personTripsPerDay * (modalSplitAfter.car / 100) * avgTripLength;
    const personKmAfterTransit = personTripsPerDay * (modalSplitAfter.transit / 100) * avgTripLength;
    const personKmAfterBike = personTripsPerDay * (modalSplitAfter.bike / 100) * avgTripLength;
    const personKmAfterWalk = personTripsPerDay * (modalSplitAfter.walk / 100) * avgTripLength;
    
    // Calculate emissions before and after
    const emissionsBeforeCar = personKmBeforeCar * modeEmissionFactors.car;
    const emissionsBeforeTransit = personKmBeforeTransit * modeEmissionFactors.transit;
    const emissionsBeforeBike = personKmBeforeBike * modeEmissionFactors.bike; // Zero
    const emissionsBeforeWalk = personKmBeforeWalk * modeEmissionFactors.walk; // Zero
    
    const emissionsAfterCar = personKmAfterCar * modeEmissionFactors.car;
    const emissionsAfterTransit = personKmAfterTransit * modeEmissionFactors.transit;
    const emissionsAfterBike = personKmAfterBike * modeEmissionFactors.bike; // Zero
    const emissionsAfterWalk = personKmAfterWalk * modeEmissionFactors.walk; // Zero
    
    // Calculate total emissions before and after
    const totalEmissionsBefore = emissionsBeforeCar + emissionsBeforeTransit + emissionsBeforeBike + emissionsBeforeWalk;
    const totalEmissionsAfter = emissionsAfterCar + emissionsAfterTransit + emissionsAfterBike + emissionsAfterWalk;
    
    // Add congestion reduction benefits (less idling, smoother traffic flow)
    const congestionBenefit = emissionsBeforeCar * (congestionReduction / 100) * 0.15; // Assuming 15% of car emissions are congestion-related
    
    // Calculate construction emissions
    let constructionEmissions = 0;
    if (includeConstruction) {
      constructionEmissions = projectArea * constructionEmissionFactors[projectType];
    }
    
    // Calculate maintenance emissions over lifetime
    let maintenanceEmissions = 0;
    if (includeMaintenance) {
      maintenanceEmissions = projectArea * maintenanceEmissionFactors[projectType] * projectLifetime;
    }
    
    // Calculate indirect emissions reductions (e.g., land use changes, long-term behavior)
    let indirectReductions = 0;
    if (includeIndirect) {
      // Assume indirect benefits grow over time and depend on project type and location
      let indirectFactor = 0;
      
      switch (projectLocation) {
        case 'urban':
          indirectFactor = 0.5;
          break;
        case 'suburban':
          indirectFactor = 0.3;
          break;
        case 'rural':
          indirectFactor = 0.1;
          break;
        case 'mixed':
          indirectFactor = 0.3;
          break;
      }
      
      // Complete streets and transit hubs have larger indirect benefits
      if (projectType === 'complete-street' || projectType === 'transit-hub') {
        indirectFactor *= 1.5;
      }
      
      indirectReductions = (totalEmissionsBefore - totalEmissionsAfter) * projectLifetime * indirectFactor;
    }
    
    // Calculate daily GHG reduction
    const dailyReduction = totalEmissionsBefore - totalEmissionsAfter + congestionBenefit;
    
    // Calculate annual GHG reduction (kg CO2e)
    const annualReduction = dailyReduction * 365;
    
    // Calculate lifetime GHG reduction including construction and maintenance
    const lifetimeReduction = (annualReduction * projectLifetime) + indirectReductions - constructionEmissions - maintenanceEmissions;
    
    // Calculate equivalents
    const carEquivalent = lifetimeReduction / (modeEmissionFactors.car * 15000); // Average car driving 15,000 km per year
    const treeEquivalent = lifetimeReduction / (treeSequestrationFactors[projectRegion] * projectLifetime); // Trees over project lifetime
    
    // Update state with results
    setGhgReduction({
      daily: dailyReduction,
      annual: annualReduction,
      lifetime: lifetimeReduction,
      carEquivalent: carEquivalent,
      treeEquivalent: treeEquivalent
    });
  };
  
  // Calculate air quality improvements
  const calculateAirQualityImprovements = () => {
    // Calculate vehicle-km before and after
    const vehicleKmBeforeCar = dailyTraffic * (modalSplitBefore.car / 100) * avgTripLength;
    const vehicleKmAfterCar = dailyTraffic * (modalSplitAfter.car / 100) * avgTripLength;
    
    // Calculate bus-km before and after (assuming 40 passengers per bus)
    const busPassengersPerVehicle = 40;
    const personTripsPerDay = dailyTraffic * 1.5; // Assuming average vehicle occupancy of 1.5
    const busKmBefore = (personTripsPerDay * (modalSplitBefore.transit / 100) * avgTripLength) / busPassengersPerVehicle;
    const busKmAfter = (personTripsPerDay * (modalSplitAfter.transit / 100) * avgTripLength) / busPassengersPerVehicle;
    
    // Calculate daily pollutant reductions in grams
    const pm25ReductionCar = (vehicleKmBeforeCar - vehicleKmAfterCar) * airPollutantFactors.car.pm25;
    const noxReductionCar = (vehicleKmBeforeCar - vehicleKmAfterCar) * airPollutantFactors.car.nox;
    const vocReductionCar = (vehicleKmBeforeCar - vehicleKmAfterCar) * airPollutantFactors.car.voc;
    
    const pm25ReductionBus = (busKmBefore - busKmAfter) * airPollutantFactors.bus.pm25;
    const noxReductionBus = (busKmBefore - busKmAfter) * airPollutantFactors.bus.nox;
    const vocReductionBus = (busKmBefore - busKmAfter) * airPollutantFactors.bus.voc;
    
    // Add benefits from trees and green infrastructure (simplified)
    const pm25TreeBenefit = treeCount * 0.1; // kg per year per tree
    const pm25GreenspaceBenefit = greenspaceArea * 0.0002; // kg per year per square meter
    
    // Calculate annual reductions in kg
    const pm25Reduction = ((pm25ReductionCar + pm25ReductionBus) * 365 / 1000) + pm25TreeBenefit + pm25GreenspaceBenefit;
    const noxReduction = ((noxReductionCar + noxReductionBus) * 365 / 1000);
    const vocReduction = ((vocReductionCar + vocReductionBus) * 365 / 1000);
    
    // Update state with results
    setAirQualityImprovement({
      pm25: pm25Reduction,
      nox: noxReduction,
      voc: vocReduction
    });
  };
  
  // Calculate health benefits from active transportation
  const calculateHealthBenefits = () => {
    // Calculate person-trips per day
    const personTripsPerDay = dailyTraffic * 1.5; // Assuming average vehicle occupancy of 1.5
    
    // Calculate additional bike and walk trips
    const additionalBikeTrips = personTripsPerDay * (modalSplitAfter.bike - modalSplitBefore.bike) / 100;
    const additionalWalkTrips = personTripsPerDay * (modalSplitAfter.walk - modalSplitBefore.walk) / 100;
    
    // Calculate additional active travel hours per day
    const bikeSpeedKmh = 15; // km/h
    const walkSpeedKmh = 5; // km/h
    
    const additionalBikeHours = (additionalBikeTrips * avgTripLength) / bikeSpeedKmh;
    const additionalWalkHours = (additionalWalkTrips * avgTripLength) / walkSpeedKmh;
    const totalActiveHours = additionalBikeHours + additionalWalkHours;
    
    // Calculate calories burned per day
    const caloriesBurnedBike = additionalBikeHours * calorieFactors.bike;
    const caloriesBurnedWalk = additionalWalkHours * calorieFactors.walk;
    const totalCaloriesBurned = caloriesBurnedBike + caloriesBurnedWalk;
    
    // Calculate healthcare cost savings ($3.50 per hour of active travel is a rough estimate)
    const healthcareSavingsDaily = totalActiveHours * 3.5;
    const healthcareSavingsAnnual = healthcareSavingsDaily * 365;
    
    // Update state with results
    setHealthBenefits({
      activeTravelHours: totalActiveHours * 365, // Annual hours
      caloriesBurned: totalCaloriesBurned * 365, // Annual calories
      healthcareSavings: healthcareSavingsAnnual // Annual savings
    });
  };
  
  // Calculate carbon sequestration from trees and green infrastructure
  const calculateCarbonSequestration = () => {
    // Calculate annual carbon sequestration from trees
    const treeSequestration = treeCount * treeSequestrationFactors[projectRegion];
    
    // Calculate annual carbon sequestration from greenspace (rough estimate)
    const greenspaceSequestration = greenspaceArea * 0.005; // kg CO2 per square meter per year
    
    // Calculate annual carbon benefits from permeable pavement (rough estimate)
    const permeablePavementBenefit = permPavementArea * 0.002; // kg CO2 per square meter per year
    
    // Calculate total annual sequestration
    const annualSequestration = treeSequestration + greenspaceSequestration + permeablePavementBenefit;
    
    // Calculate lifetime sequestration
    const lifetimeSequestration = annualSequestration * projectLifetime;
    
    // Update state with results
    setCarbonSequestration({
      annual: annualSequestration,
      lifetime: lifetimeSequestration
    });
  };
  
  // Calculate total lifetime climate benefit
  const calculateTotalBenefit = () => {
    return ghgReduction.lifetime + carbonSequestration.lifetime;
  };
  
  // Format numbers for display
  const formatNumber = (number, decimals = 0) => {
    if (Math.abs(number) >= 1000000) {
      return (number / 1000000).toFixed(1) + ' million';
    } else if (Math.abs(number) >= 1000) {
      return (number / 1000).toFixed(1) + 'k';
    } else {
      return number.toFixed(decimals);
    }
  };
  
  // Get color for emissions value
  const getEmissionColor = (value) => {
    if (value <= 0) return '#f44336'; // Negative (red) is bad for emissions
    if (value < 1000) return '#ff9800'; // Orange for small positive
    if (value < 10000) return '#4caf50'; // Green for medium positive
    return '#2e7d32'; // Dark green for large positive
  };
  
  // Export results as PDF
  const exportPDF = async () => {
    if (!reportRef.current) return;
    
    try {
      const canvas = await html2canvas(reportRef.current);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;
      
      pdf.setFontSize(24);
      pdf.text('Climate Impact Report', pdfWidth / 2, 20, { align: 'center' });
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save('climate-impact-report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };
  
  // Export results as CSV
  const exportCSV = () => {
    // Build CSV content
    let csvContent = 'Climate Impact Analysis Results\n\n';
    
    // Project details
    csvContent += 'PROJECT DETAILS\n';
    csvContent += `Project Type,${projectTypes.find(t => t.value === projectType)?.label || projectType}\n`;
    csvContent += `Length (km),${projectLength}\n`;
    csvContent += `Width (m),${projectWidth}\n`;
    csvContent += `Area (sq m),${projectArea}\n`;
    csvContent += `Location,${locationTypes.find(l => l.value === projectLocation)?.label || projectLocation}\n`;
    csvContent += `Region,${regionTypes.find(r => r.value === projectRegion)?.label || projectRegion}\n\n`;
    
    // Modal split
    csvContent += 'MODAL SPLIT CHANGES\n';
    csvContent += 'Mode,Before (%),After (%),Change (%)\n';
    csvContent += `Car,${modalSplitBefore.car},${modalSplitAfter.car},${modalSplitAfter.car - modalSplitBefore.car}\n`;
    csvContent += `Transit,${modalSplitBefore.transit},${modalSplitAfter.transit},${modalSplitAfter.transit - modalSplitBefore.transit}\n`;
    csvContent += `Bicycle,${modalSplitBefore.bike},${modalSplitAfter.bike},${modalSplitAfter.bike - modalSplitBefore.bike}\n`;
    csvContent += `Walking,${modalSplitBefore.walk},${modalSplitAfter.walk},${modalSplitAfter.walk - modalSplitBefore.walk}\n\n`;
    
    // GHG Reductions
    csvContent += 'GREENHOUSE GAS REDUCTIONS\n';
    csvContent += `Daily (kg CO2e),${ghgReduction.daily.toFixed(2)}\n`;
    csvContent += `Annual (kg CO2e),${ghgReduction.annual.toFixed(2)}\n`;
    csvContent += `Project Lifetime (kg CO2e),${ghgReduction.lifetime.toFixed(2)}\n`;
    csvContent += `Equivalent Cars Removed,${ghgReduction.carEquivalent.toFixed(2)}\n`;
    csvContent += `Equivalent Trees Planted,${ghgReduction.treeEquivalent.toFixed(2)}\n\n`;
    
    // Air Quality
    csvContent += 'AIR QUALITY IMPROVEMENTS (ANNUAL)\n';
    csvContent += `PM2.5 Reduction (kg),${airQualityImprovement.pm25.toFixed(2)}\n`;
    csvContent += `NOx Reduction (kg),${airQualityImprovement.nox.toFixed(2)}\n`;
    csvContent += `VOC Reduction (kg),${airQualityImprovement.voc.toFixed(2)}\n\n`;
    
    // Health Benefits
    csvContent += 'HEALTH BENEFITS (ANNUAL)\n';
    csvContent += `Active Travel Hours,${healthBenefits.activeTravelHours.toFixed(2)}\n`;
    csvContent += `Calories Burned,${healthBenefits.caloriesBurned.toFixed(2)}\n`;
    csvContent += `Healthcare Cost Savings ($),${healthBenefits.healthcareSavings.toFixed(2)}\n\n`;
    
    // Carbon Sequestration
    csvContent += 'CARBON SEQUESTRATION\n';
    csvContent += `Annual (kg CO2),${carbonSequestration.annual.toFixed(2)}\n`;
    csvContent += `Project Lifetime (kg CO2),${carbonSequestration.lifetime.toFixed(2)}\n\n`;
    
    // Total Benefit
    csvContent += 'TOTAL CLIMATE BENEFIT\n';
    csvContent += `Total Lifetime GHG Benefit (kg CO2e),${calculateTotalBenefit().toFixed(2)}\n`;
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'climate-impact-analysis.csv');
  };
  
  // Prepare chart data for modal split
  const modalSplitChartData = {
    labels: ['Car', 'Transit', 'Bicycle', 'Walking'],
    datasets: [
      {
        label: 'Before',
        data: [modalSplitBefore.car, modalSplitBefore.transit, modalSplitBefore.bike, modalSplitBefore.walk],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      },
      {
        label: 'After',
        data: [modalSplitAfter.car, modalSplitAfter.transit, modalSplitAfter.bike, modalSplitAfter.walk],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Prepare chart data for emissions breakdown
  const emissionsChartData = {
    labels: ['GHG Reduction', 'Carbon Sequestration'],
    datasets: [
      {
        data: [ghgReduction.lifetime, carbonSequestration.lifetime],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Prepare chart data for air pollutants
  const airQualityChartData = {
    labels: ['PM2.5', 'NOx', 'VOC'],
    datasets: [
      {
        label: 'Annual Reduction (kg)',
        data: [
          airQualityImprovement.pm25,
          airQualityImprovement.nox,
          airQualityImprovement.voc
        ],
        backgroundColor: [
          'rgba(255, 159, 64, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)'
        ],
        borderColor: [
          'rgba(255, 159, 64, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  return (
    <Container maxWidth="lg" className="climate-impact-calculator">
      <Box className="calculator-header" mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          <Co2 sx={{ mr: 1, verticalAlign: 'middle' }} />
          Climate Impact Calculator
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Estimate greenhouse gas reductions and other environmental benefits from transportation projects
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Project Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Project Type</InputLabel>
                  <Select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    label="Project Type"
                  >
                    {projectTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Length (km)"
                  type="number"
                  value={projectLength}
                  onChange={(e) => setProjectLength(Number(e.target.value))}
                  InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Width (m)"
                  type="number"
                  value={projectWidth}
                  onChange={(e) => setProjectWidth(Number(e.target.value))}
                  InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={projectLocation}
                    onChange={(e) => setProjectLocation(e.target.value)}
                    label="Location"
                  >
                    {locationTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Region</InputLabel>
                  <Select
                    value={projectRegion}
                    onChange={(e) => setProjectRegion(e.target.value)}
                    label="Region"
                  >
                    {regionTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Daily Traffic Volume (vehicles/day)"
                  type="number"
                  value={dailyTraffic}
                  onChange={(e) => setDailyTraffic(Number(e.target.value))}
                  InputProps={{ inputProps: { min: 0 } }}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Average Trip Length (km)"
                  type="number"
                  value={avgTripLength}
                  onChange={(e) => setAvgTripLength(Number(e.target.value))}
                  InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                  margin="normal"
                />
              </Grid>
            </Grid>
            
            <Box mt={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={advancedMode}
                    onChange={(e) => setAdvancedMode(e.target.checked)}
                    color="primary"
                  />
                }
                label="Advanced Settings"
              />
            </Box>
            
            {advancedMode && (
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Advanced Settings
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Project Lifetime (years)"
                      type="number"
                      value={projectLifetime}
                      onChange={(e) => setProjectLifetime(Number(e.target.value))}
                      InputProps={{ inputProps: { min: 1, max: 100 } }}
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Emission Factor (kg CO2e/km)"
                      type="number"
                      value={emissionFactor}
                      onChange={(e) => setEmissionFactor(Number(e.target.value))}
                      InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Peak Hour Traffic (%)"
                      type="number"
                      value={peakHourPercentage}
                      onChange={(e) => setPeakHourPercentage(Number(e.target.value))}
                      InputProps={{ inputProps: { min: 0, max: 100, step: 1 } }}
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Congestion Reduction (%)"
                      type="number"
                      value={congestionReduction}
                      onChange={(e) => setCongestionReduction(Number(e.target.value))}
                      InputProps={{ inputProps: { min: 0, max: 100, step: 1 } }}
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="body2" gutterBottom>
                      Calculation Inclusions:
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={includeConstruction}
                          onChange={(e) => setIncludeConstruction(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Include Construction Emissions"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={includeMaintenance}
                          onChange={(e) => setIncludeMaintenance(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Include Maintenance Emissions"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={includeIndirect}
                          onChange={(e) => setIncludeIndirect(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Include Indirect Benefits"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
          
          <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              <DirectionsCar sx={{ mr: 1, verticalAlign: 'middle' }} />
              Modal Split Changes
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Before Project Implementation:
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography gutterBottom>
                    Car: {modalSplitBefore.car}%
                  </Typography>
                  <Slider
                    value={modalSplitBefore.car}
                    onChange={(e, newValue) => {
                      const remaining = 100 - newValue;
                      const sum = modalSplitBefore.transit + modalSplitBefore.bike + modalSplitBefore.walk;
                      
                      if (sum === 0) {
                        setModalSplitBefore({
                          car: newValue,
                          transit: Math.round(remaining / 3),
                          bike: Math.round(remaining / 3),
                          walk: Math.round(remaining / 3)
                        });
                      } else {
                        setModalSplitBefore({
                          car: newValue,
                          transit: Math.round(modalSplitBefore.transit / sum * remaining),
                          bike: Math.round(modalSplitBefore.bike / sum * remaining),
                          walk: Math.round(modalSplitBefore.walk / sum * remaining)
                        });
                      }
                      
                      // Recalculate "after" based on the project type's modal shift factors
                      applyDefaultModalShifts(projectType);
                    }}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography gutterBottom>
                    Transit: {modalSplitBefore.transit}%
                  </Typography>
                  <Slider
                    value={modalSplitBefore.transit}
                    onChange={(e, newValue) => {
                      const remaining = 100 - newValue;
                      const sum = modalSplitBefore.car + modalSplitBefore.bike + modalSplitBefore.walk;
                      
                      if (sum === 0) {
                        setModalSplitBefore({
                          transit: newValue,
                          car: Math.round(remaining / 3),
                          bike: Math.round(remaining / 3),
                          walk: Math.round(remaining / 3)
                        });
                      } else {
                        setModalSplitBefore({
                          transit: newValue,
                          car: Math.round(modalSplitBefore.car / sum * remaining),
                          bike: Math.round(modalSplitBefore.bike / sum * remaining),
                          walk: Math.round(modalSplitBefore.walk / sum * remaining)
                        });
                      }
                      
                      // Recalculate "after" based on the project type's modal shift factors
                      applyDefaultModalShifts(projectType);
                    }}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography gutterBottom>
                    Bicycle: {modalSplitBefore.bike}%
                  </Typography>
                  <Slider
                    value={modalSplitBefore.bike}
                    onChange={(e, newValue) => {
                      const remaining = 100 - newValue;
                      const sum = modalSplitBefore.car + modalSplitBefore.transit + modalSplitBefore.walk;
                      
                      if (sum === 0) {
                        setModalSplitBefore({
                          bike: newValue,
                          car: Math.round(remaining / 3),
                          transit: Math.round(remaining / 3),
                          walk: Math.round(remaining / 3)
                        });
                      } else {
                        setModalSplitBefore({
                          bike: newValue,
                          car: Math.round(modalSplitBefore.car / sum * remaining),
                          transit: Math.round(modalSplitBefore.transit / sum * remaining),
                          walk: Math.round(modalSplitBefore.walk / sum * remaining)
                        });
                      }
                      
                      // Recalculate "after" based on the project type's modal shift factors
                      applyDefaultModalShifts(projectType);
                    }}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography gutterBottom>
                    Walking: {modalSplitBefore.walk}%
                  </Typography>
                  <Slider
                    value={modalSplitBefore.walk}
                    onChange={(e, newValue) => {
                      const remaining = 100 - newValue;
                      const sum = modalSplitBefore.car + modalSplitBefore.transit + modalSplitBefore.bike;
                      
                      if (sum === 0) {
                        setModalSplitBefore({
                          walk: newValue,
                          car: Math.round(remaining / 3),
                          transit: Math.round(remaining / 3),
                          bike: Math.round(remaining / 3)
                        });
                      } else {
                        setModalSplitBefore({
                          walk: newValue,
                          car: Math.round(modalSplitBefore.car / sum * remaining),
                          transit: Math.round(modalSplitBefore.transit / sum * remaining),
                          bike: Math.round(modalSplitBefore.bike / sum * remaining)
                        });
                      }
                      
                      // Recalculate "after" based on the project type's modal shift factors
                      applyDefaultModalShifts(projectType);
                    }}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  After Project Implementation:
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  These values are automatically calculated based on the project type, but you can adjust them manually.
                </Alert>
                
                <Box sx={{ mb: 2 }}>
                  <Typography gutterBottom>
                    Car: {modalSplitAfter.car}%
                    <Chip 
                      size="small" 
                      label={`${modalSplitAfter.car - modalSplitBefore.car > 0 ? '+' : ''}${modalSplitAfter.car - modalSplitBefore.car}%`}
                      color={modalSplitAfter.car < modalSplitBefore.car ? "success" : "error"}
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Slider
                    value={modalSplitAfter.car}
                    onChange={(e, newValue) => {
                      const remaining = 100 - newValue;
                      const sum = modalSplitAfter.transit + modalSplitAfter.bike + modalSplitAfter.walk;
                      
                      if (sum === 0) {
                        setModalSplitAfter({
                          car: newValue,
                          transit: Math.round(remaining / 3),
                          bike: Math.round(remaining / 3),
                          walk: Math.round(remaining / 3)
                        });
                      } else {
                        setModalSplitAfter({
                          car: newValue,
                          transit: Math.round(modalSplitAfter.transit / sum * remaining),
                          bike: Math.round(modalSplitAfter.bike / sum * remaining),
                          walk: Math.round(modalSplitAfter.walk / sum * remaining)
                        });
                      }
                    }}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography gutterBottom>
                    Transit: {modalSplitAfter.transit}%
                    <Chip 
                      size="small" 
                      label={`${modalSplitAfter.transit - modalSplitBefore.transit > 0 ? '+' : ''}${modalSplitAfter.transit - modalSplitBefore.transit}%`}
                      color={modalSplitAfter.transit > modalSplitBefore.transit ? "success" : "error"}
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Slider
                    value={modalSplitAfter.transit}
                    onChange={(e, newValue) => {
                      const remaining = 100 - newValue;
                      const sum = modalSplitAfter.car + modalSplitAfter.bike + modalSplitAfter.walk;
                      
                      if (sum === 0) {
                        setModalSplitAfter({
                          transit: newValue,
                          car: Math.round(remaining / 3),
                          bike: Math.round(remaining / 3),
                          walk: Math.round(remaining / 3)
                        });
                      } else {
                        setModalSplitAfter({
                          transit: newValue,
                          car: Math.round(modalSplitAfter.car / sum * remaining),
                          bike: Math.round(modalSplitAfter.bike / sum * remaining),
                          walk: Math.round(modalSplitAfter.walk / sum * remaining)
                        });
                      }
                    }}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography gutterBottom>
                    Bicycle: {modalSplitAfter.bike}%
                    <Chip 
                      size="small" 
                      label={`${modalSplitAfter.bike - modalSplitBefore.bike > 0 ? '+' : ''}${modalSplitAfter.bike - modalSplitBefore.bike}%`}
                      color={modalSplitAfter.bike > modalSplitBefore.bike ? "success" : "error"}
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Slider
                    value={modalSplitAfter.bike}
                    onChange={(e, newValue) => {
                      const remaining = 100 - newValue;
                      const sum = modalSplitAfter.car + modalSplitAfter.transit + modalSplitAfter.walk;
                      
                      if (sum === 0) {
                        setModalSplitAfter({
                          bike: newValue,
                          car: Math.round(remaining / 3),
                          transit: Math.round(remaining / 3),
                          walk: Math.round(remaining / 3)
                        });
                      } else {
                        setModalSplitAfter({
                          bike: newValue,
                          car: Math.round(modalSplitAfter.car / sum * remaining),
                          transit: Math.round(modalSplitAfter.transit / sum * remaining),
                          walk: Math.round(modalSplitAfter.walk / sum * remaining)
                        });
                      }
                    }}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography gutterBottom>
                    Walking: {modalSplitAfter.walk}%
                    <Chip 
                      size="small" 
                      label={`${modalSplitAfter.walk - modalSplitBefore.walk > 0 ? '+' : ''}${modalSplitAfter.walk - modalSplitBefore.walk}%`}
                      color={modalSplitAfter.walk > modalSplitBefore.walk ? "success" : "error"}
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Slider
                    value={modalSplitAfter.walk}
                    onChange={(e, newValue) => {
                      const remaining = 100 - newValue;
                      const sum = modalSplitAfter.car + modalSplitAfter.transit + modalSplitAfter.bike;
                      
                      if (sum === 0) {
                        setModalSplitAfter({
                          walk: newValue,
                          car: Math.round(remaining / 3),
                          transit: Math.round(remaining / 3),
                          bike: Math.round(remaining / 3)
                        });
                      } else {
                        setModalSplitAfter({
                          walk: newValue,
                          car: Math.round(modalSplitAfter.car / sum * remaining),
                          transit: Math.round(modalSplitAfter.transit / sum * remaining),
                          bike: Math.round(modalSplitAfter.bike / sum * remaining)
                        });
                      }
                    }}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                  />
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2, height: 250 }}>
              <Typography variant="subtitle2" gutterBottom align="center">
                Modal Split Comparison
              </Typography>
              <Bar 
                data={modalSplitChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      title: {
                        display: true,
                        text: 'Percentage (%)'
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            </Box>
          </Paper>
          
          <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              <LocalFlorist sx={{ mr: 1, verticalAlign: 'middle' }} />
              Green Infrastructure
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Number of New Trees"
                  type="number"
                  value={treeCount}
                  onChange={(e) => setTreeCount(Number(e.target.value))}
                  InputProps={{ inputProps: { min: 0 } }}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Greenspace Area (sq m)"
                  type="number"
                  value={greenspaceArea}
                  onChange={(e) => setGreenspaceArea(Number(e.target.value))}
                  InputProps={{ inputProps: { min: 0 } }}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Permeable Pavement Area (sq m)"
                  type="number"
                  value={permPavementArea}
                  onChange={(e) => setPermPavementArea(Number(e.target.value))}
                  InputProps={{ inputProps: { min: 0 } }}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 3 }} ref={reportRef}>
            <Box className="results-header" display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5" component="h2">
                Climate Impact Results
              </Typography>
              
              <Box>
                <Button 
                  variant="outlined" 
                  startIcon={<CloudDownload />}
                  onClick={exportPDF}
                  sx={{ mr: 1 }}
                >
                  PDF
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Download />}
                  onClick={exportCSV}
                >
                  CSV
                </Button>
              </Box>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card elevation={4}>
                  <CardContent>
                    <Typography variant="h4" align="center" gutterBottom>
                      {formatNumber(ghgReduction.lifetime + carbonSequestration.lifetime)} kg CO2e
                    </Typography>
                    <Typography variant="subtitle1" align="center" color="textSecondary">
                      Total GHG Reduction over {projectLifetime} years
                    </Typography>
                    
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
                      <Chip
                        icon={<DirectionsCar />}
                        label={`Equivalent to removing ${formatNumber(ghgReduction.carEquivalent)} cars`}
                        color="primary"
                      />
                      <Chip
                        icon={<LocalFlorist />}
                        label={`Equivalent to planting ${formatNumber(ghgReduction.treeEquivalent)} trees`}
                        color="success"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Co2 sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Greenhouse Gas Reduction
                    </Typography>
                    
                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell>Daily</TableCell>
                            <TableCell align="right" sx={{ color: getEmissionColor(ghgReduction.daily) }}>
                              {formatNumber(ghgReduction.daily, 1)} kg CO2e
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Annual</TableCell>
                            <TableCell align="right" sx={{ color: getEmissionColor(ghgReduction.annual) }}>
                              {formatNumber(ghgReduction.annual)} kg CO2e
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Project Lifetime</TableCell>
                            <TableCell align="right" sx={{ color: getEmissionColor(ghgReduction.lifetime) }}>
                              {formatNumber(ghgReduction.lifetime)} kg CO2e
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <LocalFlorist sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Carbon Sequestration
                    </Typography>
                    
                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell>Annual</TableCell>
                            <TableCell align="right" sx={{ color: '#4caf50' }}>
                              {formatNumber(carbonSequestration.annual, 1)} kg CO2
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Trees ({treeCount})</TableCell>
                            <TableCell align="right" sx={{ color: '#4caf50' }}>
                              {formatNumber(treeCount * treeSequestrationFactors[projectRegion], 1)} kg CO2/year
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Project Lifetime</TableCell>
                            <TableCell align="right" sx={{ color: '#4caf50' }}>
                              {formatNumber(carbonSequestration.lifetime)} kg CO2
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Air sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Air Quality Improvements
                    </Typography>
                    
                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell>PM2.5 Reduction</TableCell>
                            <TableCell align="right">
                              {airQualityImprovement.pm25.toFixed(2)} kg/year
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>NOx Reduction</TableCell>
                            <TableCell align="right">
                              {airQualityImprovement.nox.toFixed(2)} kg/year
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>VOC Reduction</TableCell>
                            <TableCell align="right">
                              {airQualityImprovement.voc.toFixed(2)} kg/year
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <DirectionsWalk sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Health Benefits
                    </Typography>
                    
                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell>Active Travel</TableCell>
                            <TableCell align="right">
                              {formatNumber(healthBenefits.activeTravelHours, 0)} hours/year
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Calories Burned</TableCell>
                            <TableCell align="right">
                              {formatNumber(healthBenefits.caloriesBurned, 0)} calories/year
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Healthcare Savings</TableCell>
                            <TableCell align="right">
                              ${formatNumber(healthBenefits.healthcareSavings, 0)}/year
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom align="center">
                      Emissions Reductions Breakdown
                    </Typography>
                    <Box sx={{ height: 200 }}>
                      <Pie
                        data={emissionsChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom'
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  const value = context.raw;
                                  const percentage = (value / calculateTotalBenefit() * 100).toFixed(1);
                                  return `${context.label}: ${formatNumber(value)} kg CO2e (${percentage}%)`;
                                }
                              }
                            }
                          }
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom align="center">
                      Air Pollutant Reductions
                    </Typography>
                    <Box sx={{ height: 200 }}>
                      <Bar
                        data={airQualityChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: {
                                display: true,
                                text: 'kg/year'
                              }
                            }
                          },
                          plugins: {
                            legend: {
                              display: false
                            }
                          }
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {advancedMode && includeConstruction && includeMaintenance && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <CompareArrows sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Lifecycle Assessment
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" gutterBottom>
                            <strong>Construction Emissions:</strong> {formatNumber(projectArea * constructionEmissionFactors[projectType])} kg CO2e
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Maintenance Emissions:</strong> {formatNumber(projectArea * maintenanceEmissionFactors[projectType] * projectLifetime)} kg CO2e over {projectLifetime} years
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" gutterBottom>
                            <strong>Operational Savings:</strong> {formatNumber(ghgReduction.annual * projectLifetime)} kg CO2e over {projectLifetime} years
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Net Benefit:</strong> {formatNumber(ghgReduction.lifetime)} kg CO2e
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Paper>
          
          <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              <Eco sx={{ mr: 1, verticalAlign: 'middle' }} />
              Sustainability Benefits Summary
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body1" paragraph>
                  This {projectTypes.find(t => t.value === projectType)?.label.toLowerCase()} project will deliver significant climate benefits by shifting travel from cars to more sustainable modes. Over its {projectLifetime}-year lifespan, the project will:
                </Typography>
                
                <Typography variant="body1" component="div">
                  <ul>
                    <li>Reduce greenhouse gas emissions by {formatNumber(ghgReduction.lifetime)} kg CO2e</li>
                    <li>Sequester an additional {formatNumber(carbonSequestration.lifetime)} kg CO2 through trees and green infrastructure</li>
                    <li>Reduce air pollutants, including {airQualityImprovement.pm25.toFixed(1)} kg of PM2.5 annually</li>
                    <li>Generate {formatNumber(healthBenefits.activeTravelHours)} hours of active travel annually</li>
                    <li>Save approximately ${formatNumber(healthBenefits.healthcareSavings)} in healthcare costs annually</li>
                  </ul>
                </Typography>
                
                <Typography variant="body1" paragraph>
                  These benefits are equivalent to removing {formatNumber(ghgReduction.carEquivalent)} cars from the road or planting {formatNumber(ghgReduction.treeEquivalent)} trees.
                </Typography>
                
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  <Info fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                  This analysis uses regionally-specific emission factors and accounts for the shift in transportation modes from {modalSplitBefore.car}% to {modalSplitAfter.car}% car use, among other changes.
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      
      <style jsx>{`
        .climate-impact-calculator {
          padding: 20px 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
        }
        
        @media (max-width: 768px) {
          .calculator-header {
            text-align: center;
          }
          
          .results-header {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </Container>
  );
};

export default ClimateImpactCalculator;
