import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Paper,
  Tooltip,
  Menu,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as DuplicateIcon,
  MoreVert as MoreIcon,
  Save as SaveIcon,
  Compare as CompareIcon,
} from '@mui/icons-material';

export interface Scenario {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  modifiedAt: string;
  isBaseline?: boolean;
}

interface ScenarioManagerProps {
  scenarios: Scenario[];
  currentScenarioId: string;
  onScenarioChange: (scenarioId: string) => void;
  onScenarioSave: (scenario: Scenario) => void;
  onScenarioCreate: (scenario: Partial<Scenario>) => void;
  onScenarioDelete: (scenarioId: string) => void;
  onScenarioCompare: (scenarioIds: string[]) => void;
}

const ScenarioManager: React.FC<ScenarioManagerProps> = ({
  scenarios,
  currentScenarioId,
  onScenarioChange,
  onScenarioSave,
  onScenarioCreate,
  onScenarioDelete,
  onScenarioCompare,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingScenario, setEditingScenario] = useState<Partial<Scenario>>({
    name: '',
    description: '',
  });
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMenuScenario, setActiveMenuScenario] = useState<string | null>(null);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, scenarioId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveMenuScenario(scenarioId);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setActiveMenuScenario(null);
  };

  const handleCreateScenario = () => {
    setDialogMode('create');
    setEditingScenario({
      name: '',
      description: '',
    });
    setIsDialogOpen(true);
  };

  const handleEditScenario = (scenario: Scenario) => {
    setDialogMode('edit');
    setEditingScenario({ ...scenario });
    setIsDialogOpen(true);
    handleCloseMenu();
  };

  const handleDuplicateScenario = (scenarioId: string) => {
    const scenarioToDuplicate = scenarios.find(s => s.id === scenarioId);
    if (scenarioToDuplicate) {
      setDialogMode('create');
      setEditingScenario({
        name: `${scenarioToDuplicate.name} (Copy)`,
        description: scenarioToDuplicate.description,
      });
      setIsDialogOpen(true);
    }
    handleCloseMenu();
  };

  const handleDeleteScenario = (scenarioId: string) => {
    onScenarioDelete(scenarioId);
    handleCloseMenu();
  };

  const handleDialogSave = () => {
    if (dialogMode === 'create') {
      onScenarioCreate(editingScenario);
    } else {
      onScenarioSave(editingScenario as Scenario);
    }
    setIsDialogOpen(false);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleScenarioInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditingScenario(prev => ({ ...prev, [name]: value }));
  };

  const handleScenarioClick = (scenarioId: string) => {
    if (isCompareMode) {
      if (selectedForComparison.includes(scenarioId)) {
        setSelectedForComparison(selectedForComparison.filter(id => id !== scenarioId));
      } else {
        setSelectedForComparison([...selectedForComparison, scenarioId]);
      }
    } else {
      onScenarioChange(scenarioId);
    }
  };

  const toggleCompareMode = () => {
    if (isCompareMode) {
      // Exit compare mode
      setIsCompareMode(false);
      setSelectedForComparison([]);
    } else {
      // Enter compare mode
      setIsCompareMode(true);
      setSelectedForComparison([currentScenarioId]);
    }
  };

  const handleCompareScenarios = () => {
    if (selectedForComparison.length >= 2) {
      onScenarioCompare(selectedForComparison);
      setIsCompareMode(false);
      setSelectedForComparison([]);
    }
  };

  const currentScenario = scenarios.find(s => s.id === currentScenarioId);

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Scenarios</Typography>
        <Box>
          {isCompareMode ? (
            <>
              <Button 
                variant="contained" 
                color="primary"
                disabled={selectedForComparison.length < 2}
                onClick={handleCompareScenarios}
                startIcon={<CompareIcon />}
                size="small"
                sx={{ mr: 1 }}
              >
                Compare ({selectedForComparison.length})
              </Button>
              <Button 
                variant="outlined"
                onClick={toggleCompareMode}
                size="small"
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                onClick={toggleCompareMode}
                startIcon={<CompareIcon />}
                size="small"
                sx={{ mr: 1 }}
              >
                Compare
              </Button>
              <Button
                variant="contained"
                onClick={handleCreateScenario}
                startIcon={<AddIcon />}
                size="small"
              >
                New
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Paper 
        variant="outlined" 
        sx={{ 
          maxHeight: 300, 
          overflow: 'auto',
          mb: 2,
          borderRadius: 1
        }}
      >
        <List dense>
          {scenarios.map((scenario) => (
            <ListItem
              key={scenario.id}
              button
              selected={isCompareMode 
                ? selectedForComparison.includes(scenario.id)
                : scenario.id === currentScenarioId
              }
              onClick={() => handleScenarioClick(scenario.id)}
              sx={{
                borderLeft: scenario.isBaseline 
                  ? '3px solid #27ae60' 
                  : 'none'
              }}
            >
              <ListItemText
                primary={
                  <Typography 
                    variant="body2" 
                    component="span" 
                    sx={{ 
                      fontWeight: scenario.id === currentScenarioId ? 'bold' : 'normal',
                    }}
                  >
                    {scenario.name}
                    {scenario.isBaseline && (
                      <Typography 
                        component="span" 
                        variant="caption" 
                        sx={{ 
                          ml: 1, 
                          color: 'success.main', 
                          bgcolor: 'success.light', 
                          px: 0.5, 
                          borderRadius: 0.5 
                        }}
                      >
                        Baseline
                      </Typography>
                    )}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    Modified: {new Date(scenario.modifiedAt).toLocaleDateString()}
                  </Typography>
                }
              />
              {!isCompareMode && (
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    size="small"
                    onClick={(e) => handleOpenMenu(e, scenario.id)}
                  >
                    <MoreIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          ))}
        </List>
      </Paper>

      {currentScenario && !isCompareMode && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Current scenario: {currentScenario.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {currentScenario.description || "No description available."}
          </Typography>
        </Box>
      )}

      {/* Scenario action menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem 
          onClick={() => {
            const scenario = scenarios.find(s => s.id === activeMenuScenario);
            if (scenario) handleEditScenario(scenario);
          }}
        >
          <ListItemText primary="Edit" />
        </MenuItem>
        <MenuItem 
          onClick={() => {
            if (activeMenuScenario) handleDuplicateScenario(activeMenuScenario);
          }}
        >
          <ListItemText primary="Duplicate" />
        </MenuItem>
        <MenuItem 
          onClick={() => {
            if (activeMenuScenario) handleDeleteScenario(activeMenuScenario);
          }}
          disabled={scenarios.find(s => s.id === activeMenuScenario)?.isBaseline}
        >
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Create New Scenario' : 'Edit Scenario'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Scenario Name"
            type="text"
            fullWidth
            value={editingScenario.name}
            onChange={handleScenarioInputChange}
            required
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={editingScenario.description}
            onChange={handleScenarioInputChange}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleDialogSave} 
            color="primary" 
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!editingScenario.name}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScenarioManager; 