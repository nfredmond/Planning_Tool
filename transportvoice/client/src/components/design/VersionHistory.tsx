import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Button,
  Paper,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  CircularProgress,
  ListItemAvatar,
  Avatar,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Close as CloseIcon,
  History as HistoryIcon,
  Restore as RestoreIcon,
  Delete as DeleteIcon,
  FileCopy as DuplicateIcon,
  MoreVert as MoreIcon,
  Compare as CompareIcon,
  AccountCircle as UserIcon,
  Done as DoneIcon
} from '@mui/icons-material';
import { DesignAlternative } from '../../types/Design';
import { formatDistanceToNow } from 'date-fns';

interface VersionHistoryProps {
  projectId: string;
  currentDesignId: string;
  versions: DesignAlternative[];
  onClose: () => void;
  onVersionLoad: (versionId: string) => void;
  onVersionDelete?: (versionId: string) => void;
  onVersionDuplicate?: (versionId: string) => void;
  loading?: boolean;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({
  projectId,
  currentDesignId,
  versions,
  onClose,
  onVersionLoad,
  onVersionDelete,
  onVersionDuplicate,
  loading = false
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [compareVersions, setCompareVersions] = useState<{
    version1: string | null;
    version2: string | null;
  }>({
    version1: null,
    version2: null
  });
  
  // Sort versions by date (newest first)
  const sortedVersions = [...versions].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });
  
  // Handle opening version menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, versionId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedVersionId(versionId);
  };
  
  // Handle closing version menu
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedVersionId(null);
  };
  
  // Handle selecting a version for comparison
  const handleSelectForCompare = (versionId: string) => {
    if (!compareVersions.version1) {
      setCompareVersions({
        ...compareVersions,
        version1: versionId
      });
    } else if (!compareVersions.version2) {
      setCompareVersions({
        ...compareVersions,
        version2: versionId
      });
      setCompareDialogOpen(true);
    }
  };
  
  // Reset comparison selections
  const handleResetCompare = () => {
    setCompareVersions({
      version1: null,
      version2: null
    });
    setCompareDialogOpen(false);
  };
  
  // Format version date
  const formatVersionDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Unknown date';
    }
  };
  
  // Delete a version
  const handleDeleteVersion = async () => {
    if (selectedVersionId && onVersionDelete) {
      onVersionDelete(selectedVersionId);
    }
    setConfirmDeleteOpen(false);
    handleMenuClose();
  };
  
  // Duplicate a version
  const handleDuplicateVersion = () => {
    if (selectedVersionId && onVersionDuplicate) {
      onVersionDuplicate(selectedVersionId);
    }
    handleMenuClose();
  };
  
  // Find version name by ID
  const getVersionName = (versionId: string | null) => {
    if (!versionId) return '';
    const version = versions.find(v => v._id === versionId);
    return version ? version.name : '';
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Version History
        </Typography>
        <Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CompareIcon />}
            onClick={() => setCompareVersions({ version1: null, version2: null })}
            sx={{ mr: 1 }}
            disabled={compareVersions.version1 !== null}
          >
            Compare
          </Button>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Divider />
      
      {compareVersions.version1 && (
        <Box sx={{ p: 1, bgcolor: 'background.default' }}>
          <Typography variant="body2">
            Select second version to compare with{' '}
            <Chip 
              label={getVersionName(compareVersions.version1)} 
              size="small"
              onDelete={handleResetCompare}
            />
          </Typography>
        </Box>
      )}
      
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : versions.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No versions available for this design.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {sortedVersions.map((version) => {
              const isCurrent = version._id === currentDesignId;
              const isSelected = version._id === compareVersions.version1;
              
              return (
                <Paper 
                  key={version._id} 
                  variant="outlined" 
                  sx={{ 
                    mb: 2, 
                    overflow: 'hidden',
                    border: (theme) => isCurrent 
                      ? `1px solid ${theme.palette.primary.main}` 
                      : undefined
                  }}
                >
                  <ListItem
                    button
                    onClick={() => {
                      if (compareVersions.version1) {
                        handleSelectForCompare(version._id || '');
                      } else if (!isCurrent) {
                        onVersionLoad(version._id || '');
                      }
                    }}
                    sx={{
                      bgcolor: (theme) => isSelected 
                        ? theme.palette.action.selected 
                        : undefined
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <HistoryIcon />
                      </Avatar>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle1">
                            {version.name}
                          </Typography>
                          {isCurrent && (
                            <Chip 
                              label="Current" 
                              size="small" 
                              color="primary"
                              sx={{ ml: 1 }}
                              icon={<DoneIcon />}
                            />
                          )}
                          {version.isPublished && (
                            <Chip 
                              label="Published" 
                              size="small" 
                              color="success"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ mt: 0.5 }} color="text.secondary">
                            Modified {formatVersionDate(version.updatedAt)} by {version.createdBy}
                          </Typography>
                          {version.description && (
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {version.description}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={(e) => handleMenuOpen(e, version._id || '')}
                      >
                        <MoreIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </Paper>
              );
            })}
          </List>
        )}
      </Box>
      
      {/* Version actions menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            if (selectedVersionId) {
              onVersionLoad(selectedVersionId);
              handleMenuClose();
            }
          }}
          disabled={selectedVersionId === currentDesignId}
        >
          <ListItemAvatar sx={{ minWidth: 40 }}>
            <RestoreIcon fontSize="small" />
          </ListItemAvatar>
          <ListItemText>Load This Version</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleDuplicateVersion}>
          <ListItemAvatar sx={{ minWidth: 40 }}>
            <DuplicateIcon fontSize="small" />
          </ListItemAvatar>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        
        <MenuItem 
          onClick={() => {
            setConfirmDeleteOpen(true);
            handleMenuClose();
          }}
          disabled={selectedVersionId === currentDesignId}
        >
          <ListItemAvatar sx={{ minWidth: 40 }}>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemAvatar>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>Delete Version?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this version? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDeleteVersion} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Compare dialog */}
      <Dialog
        open={compareDialogOpen}
        onClose={() => setCompareDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Compare Versions
          <Typography variant="subtitle2" color="text.secondary">
            {getVersionName(compareVersions.version1)} vs. {getVersionName(compareVersions.version2)}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {/* Comparison visualization would go here */}
          <Box sx={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography color="text.secondary">
              Version comparison visualization would be implemented here.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetCompare}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VersionHistory; 