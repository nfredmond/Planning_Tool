import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Paper,
  Tooltip
} from '@mui/material';
import {
  DirectionsBike as BikeIcon,
  DirectionsWalk as WalkIcon,
  DirectionsCar as CarIcon,
  DirectionsBus as BusIcon,
  NaturePeople as TreeIcon,
  Close as CloseIcon,
  Place as PlaceIcon,
  Apartment as BuildingIcon,
  Park as ParkIcon,
  LocalParking as ParkingIcon,
  Store as StoreIcon,
  Restaurant as RestaurantIcon,
  LocalCafe as CafeIcon,
  School as SchoolIcon,
  LocalHospital as HospitalIcon
} from '@mui/icons-material';

export interface DesignElement {
  id: string;
  name: string;
  type: 'point' | 'line' | 'polygon';
  icon: React.ReactNode;
  description: string;
  category: string;
  properties: Record<string, any>;
  style: Record<string, any>;
}

interface ElementPaletteProps {
  onSelectElement: (element: DesignElement) => void;
  onClose: () => void;
}

const ElementPalette: React.FC<ElementPaletteProps> = ({ onSelectElement, onClose }) => {
  // Predefined design elements organized by category
  const elements: Record<string, DesignElement[]> = {
    'Transportation': [
      {
        id: 'bike-lane',
        name: 'Bike Lane',
        type: 'line',
        icon: <BikeIcon />,
        description: 'Dedicated lane for bicycles',
        category: 'Transportation',
        properties: {
          type: 'bike-lane',
          width: 2,
          direction: 'bidirectional'
        },
        style: {
          stroke: '#4CAF50',
          strokeWidth: 3,
          lineDashArray: [1]
        }
      },
      {
        id: 'pedestrian-path',
        name: 'Pedestrian Path',
        type: 'line',
        icon: <WalkIcon />,
        description: 'Dedicated path for pedestrians',
        category: 'Transportation',
        properties: {
          type: 'pedestrian-path',
          width: 1.5,
          surface: 'paved'
        },
        style: {
          stroke: '#FFC107',
          strokeWidth: 2,
          lineDashArray: [2, 2]
        }
      },
      {
        id: 'bus-route',
        name: 'Bus Route',
        type: 'line',
        icon: <BusIcon />,
        description: 'Public bus transportation route',
        category: 'Transportation',
        properties: {
          type: 'bus-route',
          frequency: 15,
          busStops: []
        },
        style: {
          stroke: '#2196F3',
          strokeWidth: 3,
          lineDashArray: [4, 2]
        }
      },
      {
        id: 'road',
        name: 'Road',
        type: 'line',
        icon: <CarIcon />,
        description: 'Road for vehicular traffic',
        category: 'Transportation',
        properties: {
          type: 'road',
          lanes: 2,
          speed: 50
        },
        style: {
          stroke: '#607D8B',
          strokeWidth: 4,
          lineDashArray: [0]
        }
      }
    ],
    'Urban Features': [
      {
        id: 'building',
        name: 'Building',
        type: 'polygon',
        icon: <BuildingIcon />,
        description: 'General building structure',
        category: 'Urban Features',
        properties: {
          type: 'building',
          floors: 3,
          use: 'mixed'
        },
        style: {
          fill: '#90A4AE',
          fillOpacity: 0.7,
          stroke: '#546E7A',
          strokeWidth: 1
        }
      },
      {
        id: 'park',
        name: 'Park',
        type: 'polygon',
        icon: <ParkIcon />,
        description: 'Public park or green space',
        category: 'Urban Features',
        properties: {
          type: 'park',
          amenities: []
        },
        style: {
          fill: '#81C784',
          fillOpacity: 0.6,
          stroke: '#388E3C',
          strokeWidth: 1
        }
      },
      {
        id: 'parking',
        name: 'Parking',
        type: 'polygon',
        icon: <ParkingIcon />,
        description: 'Vehicle parking area',
        category: 'Urban Features',
        properties: {
          type: 'parking',
          capacity: 50,
          parkingType: 'surface'
        },
        style: {
          fill: '#B0BEC5',
          fillOpacity: 0.5,
          stroke: '#78909C',
          strokeWidth: 1
        }
      }
    ],
    'Points of Interest': [
      {
        id: 'landmark',
        name: 'Landmark',
        type: 'point',
        icon: <PlaceIcon />,
        description: 'Notable landmark or location',
        category: 'Points of Interest',
        properties: {
          type: 'landmark',
          importance: 'high'
        },
        style: {
          fill: '#F44336',
          stroke: '#B71C1C',
          strokeWidth: 1,
          pointSize: 8
        }
      },
      {
        id: 'cafe',
        name: 'Cafe',
        type: 'point',
        icon: <CafeIcon />,
        description: 'Coffee shop or cafe',
        category: 'Points of Interest',
        properties: {
          type: 'cafe',
          seating: 'indoor and outdoor'
        },
        style: {
          fill: '#795548',
          stroke: '#4E342E',
          strokeWidth: 1,
          pointSize: 7
        }
      },
      {
        id: 'restaurant',
        name: 'Restaurant',
        type: 'point',
        icon: <RestaurantIcon />,
        description: 'Restaurant or dining establishment',
        category: 'Points of Interest',
        properties: {
          type: 'restaurant',
          cuisine: 'various'
        },
        style: {
          fill: '#FF9800',
          stroke: '#E65100',
          strokeWidth: 1,
          pointSize: 7
        }
      },
      {
        id: 'shop',
        name: 'Shop',
        type: 'point',
        icon: <StoreIcon />,
        description: 'Retail store or shop',
        category: 'Points of Interest',
        properties: {
          type: 'shop',
          goods: 'various'
        },
        style: {
          fill: '#9C27B0',
          stroke: '#6A1B9A',
          strokeWidth: 1,
          pointSize: 7
        }
      },
      {
        id: 'school',
        name: 'School',
        type: 'point',
        icon: <SchoolIcon />,
        description: 'Educational institution',
        category: 'Points of Interest',
        properties: {
          type: 'school',
          level: 'primary'
        },
        style: {
          fill: '#3F51B5',
          stroke: '#283593',
          strokeWidth: 1,
          pointSize: 8
        }
      },
      {
        id: 'hospital',
        name: 'Hospital',
        type: 'point',
        icon: <HospitalIcon />,
        description: 'Medical facility or hospital',
        category: 'Points of Interest',
        properties: {
          type: 'hospital',
          services: 'general'
        },
        style: {
          fill: '#E91E63',
          stroke: '#AD1457',
          strokeWidth: 1,
          pointSize: 8
        }
      }
    ]
  };

  // Render the element categories and items
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Element Palette</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Divider />
      
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
        {Object.entries(elements).map(([category, categoryElements]) => (
          <Box key={category} sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ px: 1, mb: 1 }}>
              {category}
            </Typography>
            
            <Paper variant="outlined" sx={{ borderRadius: 1 }}>
              <List dense disablePadding>
                {categoryElements.map((element) => (
                  <Tooltip key={element.id} title={element.description} placement="right">
                    <ListItem 
                      button 
                      onClick={() => onSelectElement(element)}
                      sx={{
                        borderLeft: '4px solid transparent',
                        '&:hover': {
                          borderLeft: `4px solid ${
                            element.type === 'point' 
                              ? element.style.fill 
                              : element.style.stroke
                          }`
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {element.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={element.name} 
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  </Tooltip>
                ))}
              </List>
            </Paper>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ElementPalette; 